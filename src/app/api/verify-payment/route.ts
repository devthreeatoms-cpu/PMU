import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendOrderConfirmationEmail } from "@/lib/email";


export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isMatch = expectedSignature === razorpay_signature;

    if (isMatch) {
      // 1. Get the order document
      const orderRef = adminDb.collection("orders").doc(razorpay_order_id);
      const orderSnap = await orderRef.get();
      
      if (!orderSnap.exists) {
        return NextResponse.json({ error: "Order context lost" }, { status: 404 });
      }

      const orderData = orderSnap.data();

      // 2. Only process if not already paid
      if (orderData && orderData.status === 'pending') {
        const userId = orderData.userId;
        const items = orderData.items || [];
        
        // 3. Begin Transaction for Stock Deduction & Status Update
        await adminDb.runTransaction(async (transaction) => {
          // A. Deduct Stock for each item (including variants)
          for (const item of items) {
            if (item.productId) {
              const productRef = adminDb.collection("products").doc(item.productId);
              const productSnap = await transaction.get(productRef);
              
              if (productSnap.exists) {
                const pData = productSnap.data()!;
                let mainStock = Number(pData.stock || 0) - (item.quantity || 1);
                let variants = pData.variants || [];

                // If it's a variant purchase, deduct from that specific variant's stock
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
                  updatedAt: Date.now()
                });
              }
            }
          }

          // B. Update User Record
          if (userId && userId !== "guest") {
            const userRef = adminDb.collection("users").doc(userId);
            transaction.update(userRef, { hasOrderedBefore: true });
          }

          // C. Increment Coupon Usage
          // Prefer couponId (direct doc ref) — avoids case-mismatch on code field
          if (orderData.couponId) {
            const couponRef = adminDb.collection("coupons").doc(orderData.couponId);
            transaction.update(couponRef, { usageCount: FieldValue.increment(1) });
          } else if (orderData.couponCode) {
            // Fallback: query by code (normalised to uppercase)
            const code = (orderData.couponCode as string).toUpperCase().trim();
            const couponSnapshot = await adminDb.collection("coupons")
              .where("code", "==", code)
              .limit(1)
              .get();
            if (!couponSnapshot.empty) {
              transaction.update(couponSnapshot.docs[0].ref, {
                usageCount: FieldValue.increment(1),
              });
            }
          }

          // D. Finalize Order Status
          transaction.update(orderRef, {
            status: 'paid',
            razorpayPaymentId: razorpay_payment_id,
            updatedAt: Date.now(),
            paymentVerifiedAt: Date.now()
          });
        });

        // 4. Send Confirmation Email (Async, non-blocking for response)
        try {
          await sendOrderConfirmationEmail({
            id: razorpay_order_id,
            total: orderData.total,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress
          });
        } catch (emailErr) {
          console.error("Failed to send order email:", emailErr);
        }
      }

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
