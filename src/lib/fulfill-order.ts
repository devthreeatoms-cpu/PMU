import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendOrderConfirmationEmail, sendInvoiceEmail } from "@/lib/email";
import { createAdminNotification } from "@/lib/notifications";

/**
 * Marks a Razorpay order as paid and runs all post-payment side effects.
 *
 * This is the SINGLE source of truth for order fulfillment, shared by:
 *   - /api/verify-payment   (browser handler — instant UX)
 *   - /api/razorpay-webhook (server-to-server — reliability backstop)
 *
 * The paid-flip is atomic + idempotent (re-reads status === 'pending' inside a
 * transaction), so whichever caller arrives first wins and the other is a no-op.
 * No double stock deduction, no double emails. Every side effect is best-effort:
 * a failure is logged but never throws, because the money is already captured.
 *
 * @returns `true` if THIS call performed the pending -> paid transition (and ran
 *          the side effects), `false` if the order was already paid / not pending.
 */
export async function fulfillPaidOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<boolean> {
  const orderRef = adminDb.collection("orders").doc(razorpayOrderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    console.error(`fulfillPaidOrder: order doc not found for ${razorpayOrderId}`);
    return false;
  }

  const orderData = orderSnap.data();

  // 1. CRITICAL: flip pending -> paid in its own atomic, idempotent step.
  //    Never coupled to side effects below — a stock/coupon failure must NOT
  //    leave a genuinely-paid order stuck in "pending".
  let firstTimePaid = false;
  await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(orderRef);
    const data = snap.data();
    if (data && data.status === "pending") {
      transaction.update(orderRef, {
        status: "paid",
        razorpayPaymentId: razorpayPaymentId,
        updatedAt: Date.now(),
        paymentVerifiedAt: Date.now(),
      });
      firstTimePaid = true;
    }
  });

  if (!firstTimePaid || !orderData) {
    return false;
  }

  const userId = orderData.userId;
  const items = orderData.items || [];

  // 2. Deduct stock (incl. variants) — best-effort.
  try {
    await adminDb.runTransaction(async (transaction) => {
      for (const item of items) {
        if (item.productId) {
          const productRef = adminDb.collection("products").doc(item.productId);
          const productSnap = await transaction.get(productRef);

          if (productSnap.exists) {
            const pData = productSnap.data()!;
            let mainStock = Number(pData.stock || 0) - (item.quantity || 1);
            let variants = pData.variants || [];

            if (item.variantId && Array.isArray(variants)) {
              variants = variants.map((v: any) => {
                if (v.id === item.variantId) {
                  return { ...v, stock: Math.max(0, Number(v.stock || 0) - (item.quantity || 1)) };
                }
                return v;
              });
            }

            transaction.update(productRef, {
              stock: Math.max(0, mainStock),
              variants: variants,
              updatedAt: Date.now(),
            });
          }
        }
      }
    });
  } catch (stockErr) {
    console.error(`Stock deduction failed for order ${razorpayOrderId} (payment OK, reconcile manually):`, stockErr);
  }

  // 3. Mark user as a returning customer — best-effort.
  if (userId && userId !== "guest") {
    try {
      await adminDb.collection("users").doc(userId).update({ hasOrderedBefore: true });
    } catch (userErr) {
      console.error(`User flag update failed for order ${razorpayOrderId}:`, userErr);
    }
  }

  // 4. Increment coupon usage — best-effort.
  //    set+merge with increment is safe even if the coupon doc was deleted.
  try {
    if (orderData.couponId) {
      const couponRef = adminDb.collection("coupons").doc(orderData.couponId);
      await couponRef.set({ usageCount: FieldValue.increment(1) }, { merge: true });
    } else if (orderData.couponCode) {
      const code = (orderData.couponCode as string).toUpperCase().trim();
      const couponSnapshot = await adminDb.collection("coupons")
        .where("code", "==", code)
        .limit(1)
        .get();
      if (!couponSnapshot.empty) {
        await couponSnapshot.docs[0].ref.set({ usageCount: FieldValue.increment(1) }, { merge: true });
      }
    }
  } catch (couponErr) {
    console.error(`Coupon usage increment failed for order ${razorpayOrderId}:`, couponErr);
  }

  // 5. Admin notification — best-effort.
  try {
    await createAdminNotification({
      type: "order",
      title: "New Order Booked",
      message: `Order #${razorpayOrderId} has been paid successfully. Total: ₹${orderData.total}`,
      link: `/admin/orders`,
    });
  } catch (notifErr) {
    console.error(`Admin notification failed for order ${razorpayOrderId}:`, notifErr);
  }

  // 6. Confirmation + invoice emails — best-effort.
  try {
    const emailData = {
      id: razorpayOrderId,
      total: orderData.total,
      subtotal: orderData.subtotal,
      taxAmount: orderData.taxAmount,
      shippingAmount: orderData.shippingAmount,
      discountAmount: orderData.discountAmount || orderData.couponDiscountAmount || 0,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      razorpayPaymentId: razorpayPaymentId,
      paymentVerifiedAt: Date.now(),
    };

    await sendOrderConfirmationEmail(emailData);
    await sendInvoiceEmail(emailData);
  } catch (emailErr) {
    console.error(`Failed to send order/invoice emails for ${razorpayOrderId}:`, emailErr);
  }

  return true;
}
