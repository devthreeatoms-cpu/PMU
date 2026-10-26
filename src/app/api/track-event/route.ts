import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const ALLOWED_EVENTS = new Set(["product_view", "add_to_cart", "checkout_start", "checkout_complete", "page_view"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, userId, sessionId, timestamp, productId, productName, category, price } = body;

    if (!event || typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ error: "Invalid event name" }, { status: 400 });
    }

    // Only store known, safe fields — no open spread of attacker-controlled properties
    const eventDoc: Record<string, unknown> = {
      event,
      userId:    typeof userId    === "string" ? userId    : "guest",
      sessionId: typeof sessionId === "string" ? sessionId : "unknown",
      timestamp: typeof timestamp === "number" ? timestamp : Date.now(),
    };
    if (typeof productId   === "string") eventDoc.productId   = productId;
    if (typeof productName === "string") eventDoc.productName = productName;
    if (typeof category    === "string") eventDoc.category    = category;
    if (typeof price       === "number") eventDoc.price       = price;

    await adminDb.collection("analytics_events").add(eventDoc);

    if (event === "product_view" && typeof productId === "string" && productId.length > 0 && productId.length <= 128) {
      try {
        await adminDb.collection("products").doc(productId).update({
          views: FieldValue.increment(1),
        });
      } catch (e) {
        console.error("[track-event] failed to increment views:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[track-event] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
