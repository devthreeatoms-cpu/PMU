import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { adminDb } from "@/lib/firebase-admin";
import { computeShippingAmount, normalizeShippingSettings } from "@/lib/shipping";
import { ShippingSettings } from "@/lib/types";

function applyCouponDiscount(
  type: string | undefined,
  value: number,
  subtotal: number
): { productDiscount: number; freeShipping: boolean } {
  if (type === "free_shipping") {
    return { productDiscount: 0, freeShipping: true };
  }
  if (type === "percentage") {
    return { productDiscount: subtotal * (Number(value) / 100), freeShipping: false };
  }
  // flat
  return { productDiscount: Number(value) || 0, freeShipping: false };
}

export async function POST(req: Request) {
  try {
    const { items, userId, couponCode, couponId: incomingCouponId, shippingAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    // Phone is required for delivery coordination
    const phoneRaw = String(shippingAddress?.phone || "").replace(/[\s\-()]/g, "").trim();
    if (!phoneRaw || !/^(?:\+?91)?[6-9]\d{9}$/.test(phoneRaw)) {
      return NextResponse.json(
        { error: "A valid 10-digit phone number is required for checkout." },
        { status: 400 }
      );
    }

    // 1. Calculate Subtotal, GST & Convenience Fees
    let subtotal = 0;
    let gstAmount = 0;
    let convenienceFeeTotal = 0;
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
      gstAmount += priceAtPurchase * item.quantity * ((productData?.gstRate ?? 0) / 100);
      convenienceFeeTotal += (productData?.convenienceFee ?? 0) * item.quantity;

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
    let freeShippingCoupon = false;
    let couponId: string | null = null;
    let resolvedCouponCode: string | null = null;

    const lookupId = incomingCouponId || null;
    const lookupCode = couponCode ? (couponCode as string).toUpperCase().trim() : null;

    console.log("[RazorpayAPI] Coupon Lookup:", { lookupId, lookupCode });

    if (lookupId) {
      // Fast path: direct doc lookup by Firestore doc ID
      const couponDoc = await adminDb.collection("coupons").doc(lookupId).get();
      if (couponDoc.exists) {
        const d = couponDoc.data()!;
        console.log("[RazorpayAPI] Found coupon by ID:", d.code);
        
        const expiryMs = typeof d.expiryDate === "number" ? d.expiryDate
          : d.expiryDate?.toMillis?.() ?? 0;
        
        const isCurrentlyActive = d.isActive === true || d.isActive === undefined; // Fallback for missing isActive
        const isNotExpired = expiryMs === 0 || expiryMs > Date.now();

        if (isCurrentlyActive && isNotExpired) {
          couponId = lookupId;
          resolvedCouponCode = (d.code as string) ?? lookupCode;
          const applied = applyCouponDiscount(d.type, Number(d.value), subtotal);
          couponDiscountAmount = applied.productDiscount;
          freeShippingCoupon = applied.freeShipping;
          console.log("[RazorpayAPI] Coupon Applied (ID):", { couponDiscountAmount, freeShippingCoupon, type: d.type, value: d.value });
        } else {
          console.log("[RazorpayAPI] Coupon ineligible:", { isCurrentlyActive, isNotExpired, expiryMs });
        }
      } else {
        console.log("[RazorpayAPI] Coupon doc not found for ID:", lookupId);
      }
    }

    if (couponDiscountAmount === 0 && !freeShippingCoupon && lookupCode) {
      // Fallback: query by code
      const snap = await adminDb.collection("coupons").where("code", "==", lookupCode).limit(1).get();
      if (!snap.empty) {
        const d = snap.docs[0].data();
        console.log("[RazorpayAPI] Found coupon by Code:", lookupCode);
        
        const expiryMs = typeof d.expiryDate === "number" ? d.expiryDate
          : d.expiryDate?.toMillis?.() ?? 0;
        
        const isCurrentlyActive = d.isActive === true || d.isActive === undefined;
        const isNotExpired = expiryMs === 0 || expiryMs > Date.now();

        if (isCurrentlyActive && isNotExpired) {
          couponId = snap.docs[0].id;
          resolvedCouponCode = (d.code as string) ?? lookupCode;
          const applied = applyCouponDiscount(d.type, Number(d.value), subtotal);
          couponDiscountAmount = applied.productDiscount;
          freeShippingCoupon = applied.freeShipping;
          console.log("[RazorpayAPI] Coupon Applied (Code):", { couponDiscountAmount, freeShippingCoupon, type: d.type, value: d.value });
        }
      } else {
        console.log("[RazorpayAPI] Coupon not found for Code:", lookupCode);
      }
    }

    // 3. Universal shipping (admin Shipping module) + total
    const finalSubtotal = Math.max(0, subtotal - couponDiscountAmount);
    const shippingSnap = await adminDb.collection("siteSettings").doc("shipping").get();
    const shippingSettings = normalizeShippingSettings(
      shippingSnap.exists ? (shippingSnap.data() as ShippingSettings) : null
    );
    const shipping = computeShippingAmount(
      shippingSettings,
      finalSubtotal,
      freeShippingCoupon
    );
    const total = Math.round((finalSubtotal + shipping + gstAmount + convenienceFeeTotal) * 100) / 100;

    console.log("[RazorpayAPI] Final Totals:", {
      subtotal,
      couponDiscountAmount,
      shipping,
      freeShippingCoupon,
      total,
    });

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
      gstAmount: gstAmount,
      convenienceFeeTotal: convenienceFeeTotal,
      taxAmount: gstAmount,
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
