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
          // A. Deduct Stock for each item
          for (const item of items) {
            if (item.productId) {
              const productRef = adminDb.collection("products").doc(item.productId);
              transaction.update(productRef, {
                stock: FieldValue.increment(-(item.quantity || 1))
              });
            }
          }

          // B. Update User Record
          if (userId && userId !== "guest") {
            const userRef = adminDb.collection("users").doc(userId);
            transaction.update(userRef, { hasOrderedBefore: true });
          }

          // C. Increment Coupon Usage
          if (orderData.couponCode) {
            const couponSnapshot = await adminDb.collection("coupons")
              .where("code", "==", orderData.couponCode.toUpperCase())
              .limit(1)
              .get();
            
            if (!couponSnapshot.empty) {
              const couponRef = couponSnapshot.docs[0].ref;
              transaction.update(couponRef, {
                usageCount: FieldValue.increment(1)
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
