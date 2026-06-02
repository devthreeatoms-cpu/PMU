import { NextResponse } from "next/server";
import crypto from "crypto";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

/**
 * Razorpay server-to-server webhook — the reliability backstop.
 *
 * Razorpay calls this directly when a payment is captured, independent of the
 * customer's browser. It catches every payment whose browser-side `handler`
 * callback never fired (tab closed, network dropped, mobile/UPI delays).
 *
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL:     https://<your-domain>/api/razorpay-webhook
 *   Events:  payment.captured  (and optionally order.paid)
 *   Secret:  must match RAZORPAY_WEBHOOK_SECRET env var
 *
 * Fulfillment is delegated to the same idempotent helper as /api/verify-payment,
 * so whichever path arrives first wins and the other is a harmless no-op.
 *
 * Always returns 200 for accepted/duplicate events so Razorpay stops retrying;
 * returns 4xx only when the request is unauthenticated or malformed.
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("razorpay-webhook: RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Signature is computed over the RAW request body — read text, never re-stringify.
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) {
      console.error("razorpay-webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event: string = payload?.event || "";

    // Extract the Razorpay order id + payment id depending on event type.
    let orderId: string | undefined;
    let paymentId: string | undefined;

    if (event === "payment.captured" || event === "payment.authorized") {
      const entity = payload?.payload?.payment?.entity;
      orderId = entity?.order_id;
      paymentId = entity?.id;
    } else if (event === "order.paid") {
      orderId = payload?.payload?.order?.entity?.id;
      paymentId = payload?.payload?.payment?.entity?.id;
    } else {
      // Not an event we act on — acknowledge so Razorpay doesn't retry.
      return NextResponse.json({ received: true, ignored: event }, { status: 200 });
    }

    if (!orderId) {
      console.error(`razorpay-webhook: ${event} missing order_id`, payload?.payload);
      // Acknowledge — retrying won't help a malformed/unexpected shape.
      return NextResponse.json({ received: true, error: "missing order_id" }, { status: 200 });
    }

    const fulfilled = await fulfillPaidOrder(orderId, paymentId || "webhook");
    console.log(`razorpay-webhook: ${event} for ${orderId} — ${fulfilled ? "fulfilled" : "already processed"}`);

    return NextResponse.json({ received: true, fulfilled }, { status: 200 });
  } catch (error: any) {
    console.error("razorpay-webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
