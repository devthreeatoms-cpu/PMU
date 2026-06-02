import { NextResponse } from "next/server";
import crypto from "crypto";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

/**
 * Browser-initiated payment verification (Razorpay checkout `handler`).
 * Verifies the checkout signature, then delegates fulfillment to the shared
 * idempotent helper. This is the "instant UX" path; the webhook at
 * /api/razorpay-webhook is the reliability backstop that catches any payment
 * whose browser callback never fired.
 */
export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ verified: false, error: "Missing payment fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("verify-payment: RAZORPAY_KEY_SECRET is not set");
      return NextResponse.json({ verified: false, error: "Payment gateway not configured" }, { status: 500 });
    }

    // Razorpay checkout signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    // Signature valid — fulfill (idempotent; safe even if the webhook beat us to it).
    await fulfillPaidOrder(razorpay_order_id, razorpay_payment_id);

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
