import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { items, userId, couponCode, couponId: incomingCouponId, shippingAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    // 1. Calculate Subtotal & Discount
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const productDoc = await adminDb.collection("products").doc(item.product.id).get();
      if (!productDoc.exists) continue;
      
      const productData = productDoc.data();
      let priceAtPurchase = productData?.salePrice ?? productData?.price;
      let variantName = "";
      
      if (item.variantId && productData?.variants) {
        const variant = productData.variants.find((v: any) => v.id === item.variantId);
        if (variant) {
          priceAtPurchase = variant.salePrice ?? variant.price;
          variantName = Object.values(variant.combination || {}).join(' / ');
        }
      }
      
      const itemTotal = priceAtPurchase * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.product.id,
        productName: item.product.name,
        variantId: item.variantId || null,
        variantName: variantName || null,
        quantity: item.quantity,
        priceAtPurchase: priceAtPurchase,
        totalPrice: itemTotal
      });
    }

    // 2. Handle Coupon — use couponId (from validate-coupon) for direct lookup
    let couponDiscountAmount = 0;
    let couponId: string | null = null;
    let resolvedCouponCode: string | null = null;

    const lookupId = incomingCouponId || null;
    const lookupCode = couponCode ? (couponCode as string).toUpperCase().trim() : null;

    if (lookupId) {
      // Fast path: direct doc lookup by Firestore doc ID
      const couponDoc = await adminDb.collection("coupons").doc(lookupId).get();
      console.log("[coupon] doc exists:", couponDoc.exists, "id:", lookupId);
      if (couponDoc.exists) {
        const d = couponDoc.data()!;
        const expiryMs = typeof d.expiryDate === "number" ? d.expiryDate
          : d.expiryDate?.toMillis?.() ?? 0;
        console.log("[coupon] isActive:", d.isActive, "expiryMs:", expiryMs, "now:", Date.now(), "type:", d.type, "value:", d.value);
        if (d.isActive === true && (expiryMs === 0 || expiryMs > Date.now())) {
          couponId = lookupId;
          resolvedCouponCode = (d.code as string) ?? lookupCode;
          couponDiscountAmount = d.type === "percentage"
            ? subtotal * (d.value / 100)
            : Number(d.value);
        }
      }
    }

    if (!couponId && lookupCode) {
      // Fallback: query by code
      const snap = await adminDb.collection("coupons").where("code", "==", lookupCode).limit(1).get();
      console.log("[coupon] fallback query results:", snap.size, "for code:", lookupCode);
      if (!snap.empty) {
        const d = snap.docs[0].data();
        const expiryMs = typeof d.expiryDate === "number" ? d.expiryDate
          : d.expiryDate?.toMillis?.() ?? 0;
        console.log("[coupon] fallback isActive:", d.isActive, "expiryMs:", expiryMs, "type:", d.type, "value:", d.value);
        if (d.isActive === true && (expiryMs === 0 || expiryMs > Date.now())) {
          couponId = snap.docs[0].id;
          resolvedCouponCode = (d.code as string) ?? lookupCode;
          couponDiscountAmount = d.type === "percentage"
            ? subtotal * (d.value / 100)
            : Number(d.value);
        }
      }
    }

    console.log("[coupon] final: couponId=", couponId, "discount=", couponDiscountAmount);


    // 3. Shipping & Tax
    const finalSubtotal = Math.max(0, subtotal - couponDiscountAmount);
    const shipping = finalSubtotal > 12000 ? 0 : 150;
    const tax = finalSubtotal * 0.08;
    const total = Math.round((finalSubtotal + shipping + tax) * 100) / 100;

    // 4. Create Razorpay Order
    const amountInCents = Math.round(total * 100);
    const razorpayOptions = {
      amount: amountInCents,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: userId || "guest" }
    };

    const rzpOrder = await razorpay.orders.create(razorpayOptions);

    // 5. Save Pending Order to Firestore
    await adminDb.collection("orders").doc(rzpOrder.id).set({
      userId: userId || "guest",
      items: orderItems,
      subtotal: subtotal,
      discountAmount: couponDiscountAmount,
      couponDiscountAmount: couponDiscountAmount,
      shippingAmount: shipping,
      taxAmount: tax,
      total: total,
      couponId: couponId,
      couponCode: resolvedCouponCode,
      status: 'pending',
      shippingAddress: shippingAddress,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      razorpayOrderId: rzpOrder.id
    });

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: amountInCents,
      currency: "INR",
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
