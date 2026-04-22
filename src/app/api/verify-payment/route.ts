import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";

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
      // Update order status in Firestore
      const orderRef = adminDb.collection("orders").doc(razorpay_order_id);
      const orderSnap = await orderRef.get();
      const orderData = orderSnap.data();

      if (orderData && orderData.status !== 'paid') {
        const userId = orderData.userId;
        const total = orderData.total;
        const subtotal = orderData.subtotal || total;
        
        // 1. Calculate and award points (1 pt per $1 spent on subtotal)
        const pointsEarned = Math.floor(subtotal);
        
        const userRef = adminDb.collection("users").doc(userId);
        const userSnap = await userRef.get();
        const userData = userSnap.data();

        // Transaction for buyer
        const buyerTx = {
          id: `earn_${razorpay_payment_id}`,
          amount: pointsEarned,
          reason: `Earned from Order #${razorpay_order_id.slice(-6)}`,
          createdAt: Date.now(),
          adminId: 'SYSTEM'
        };

        // Update buyer
        await userRef.update({
          points: (userData?.points || 0) + pointsEarned
        });
        await userRef.collection("transactions").add(buyerTx);

        // 2. Handle Referral (If first order)
        if (userData?.referredBy && !userData.hasOrderedBefore) {
          const referralSettingsSnap = await adminDb.collection("settings").doc("referral").get();
          const refSettings = referralSettingsSnap.data();
          const rewardAmount = refSettings?.referrerRewardPoints || 500;

          // Find referrer by their referralCode
          const referrersQuery = await adminDb.collection("users")
            .where("referralCode", "==", userData.referredBy)
            .limit(1)
            .get();

          if (!referrersQuery.empty) {
            const referrerDoc = referrersQuery.docs[0];
            const referrerRef = adminDb.collection("users").doc(referrerDoc.id);
            
            await referrerRef.update({
              points: (referrerDoc.data().points || 0) + rewardAmount
            });
            
            await referrerRef.collection("transactions").add({
              id: `ref_${razorpay_payment_id}`,
              amount: rewardAmount,
              reason: `Referral Bonus: ${userData.displayName || 'A new artist'} joined`,
              createdAt: Date.now(),
              adminId: 'SYSTEM'
            });
          }
        }

        // Mark user as having ordered before to prevent duplicate referral rewards
        await userRef.update({ hasOrderedBefore: true });

        // Update order
        await orderRef.update({
          status: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          pointsEarned: pointsEarned,
          updatedAt: Date.now()
        });
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
