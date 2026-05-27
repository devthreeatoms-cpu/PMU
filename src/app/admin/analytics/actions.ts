"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth-helpers";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TopProduct {
  productId: string;
  productName: string;
  totalQty: number;
  totalRevenue: number;
  orderCount: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  revenue: number;
}

export interface CityBreakdown {
  city: string;
  orders: number;
  revenue: number;
}

export interface CouponStat {
  code: string;
  type: string;
  usageCount: number;
  discountGiven: number;
  influencedRevenue: number;
  isActive: boolean;
  expiryDate: number;
}

export interface ReferralLeader {
  uid: string;
  displayName: string;
  referralCode: string;
  referralCount: number;
  convertedCount: number;
  totalEarnings: number;
}

export interface AOVMetrics {
  aov: number;
  totalRevenue: number;
  totalOrders: number;
  fulfillmentRate: number;
  cancellationRate: number;
  couponUsageRate: number;
}

export interface EventCounts {
  productViews: number;
  addToCarts: number;
  checkoutStarts: number;
  checkoutCompletes: number;
  viewToCartRate: number;
  cartToCheckoutRate: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function periodStart(period: string): number {
  const now = Date.now();
  switch (period) {
    case "today": return new Date().setHours(0, 0, 0, 0);
    case "7d":  return now - 7   * 86400000;
    case "30d": return now - 30  * 86400000;
    case "90d": return now - 90  * 86400000;
    case "12m": return now - 365 * 86400000;
    default:    return 0; // "all"
  }
}

const toMs = (val: any): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  if (typeof val?.toMillis === "function") return val.toMillis();
  if (typeof val?.seconds === "number") return val.seconds * 1000;
  return Number(val) || 0;
};

// ─── Shared: fetch ALL orders once, filter in-memory ─────────────────────────
// Strategy: use ONLY single-field queries that already have indexes,
// then apply all other filters (status, date) in JavaScript.
// This avoids requiring new composite indexes.

async function fetchAllOrders() {
  // Uses the existing single-field index on createdAt
  const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toMs(data.createdAt) } as any;
  });
}

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);

// ─── 1. AOV + fulfillment KPIs ───────────────────────────────────────────────

export async function getAOVMetrics(period = "30d"): Promise<AOVMetrics> {
  await requireAdmin();
  const start = periodStart(period);
  const allOrders = await fetchAllOrders();
  const orders = period === "all" ? allOrders : allOrders.filter(o => o.createdAt >= start);

  const total = orders.length;
  if (total === 0) return { aov: 0, totalRevenue: 0, totalOrders: 0, fulfillmentRate: 0, cancellationRate: 0, couponUsageRate: 0 };

  const paidOrders      = orders.filter(o => PAID_STATUSES.has(o.status));
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");
  // Coupon usage = paid orders where a real discount was applied
  // Using couponDiscountAmount > 0 is more reliable than checking couponCode string
  const couponOrders = paidOrders.filter(o => (o.couponDiscountAmount ?? 0) > 0);
  const totalRevenue    = paidOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  return {
    aov:               paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
    totalRevenue,
    totalOrders:       total,
    fulfillmentRate:   (deliveredOrders.length / total) * 100,
    cancellationRate:  (cancelledOrders.length / total) * 100,
    // Rate = coupon-used paid orders / all paid orders (0% if no paid orders used coupons)
    couponUsageRate:   paidOrders.length > 0 ? (couponOrders.length / paidOrders.length) * 100 : 0,
  };
}

// ─── 2. Top Products by Revenue ───────────────────────────────────────────────

export async function getTopProducts(period = "30d"): Promise<TopProduct[]> {
  await requireAdmin();
  const start = periodStart(period);
  const allOrders = await fetchAllOrders();

  // Filter by date + paid statuses — all in memory, no composite index needed
  const orders = allOrders.filter(o =>
    PAID_STATUSES.has(o.status) &&
    (period === "all" || o.createdAt >= start)
  );

  const productMap = new Map<string, TopProduct>();

  orders.forEach(order => {
    const items: any[] = order.items ?? [];
    items.forEach(item => {
      const existing = productMap.get(item.productId) ?? {
        productId: item.productId,
        productName: item.productName ?? "Unknown",
        totalQty: 0,
        totalRevenue: 0,
        orderCount: 0,
      };
      existing.totalQty     += item.quantity  ?? 1;
      existing.totalRevenue += item.totalPrice ?? 0;
      existing.orderCount   += 1;
      productMap.set(item.productId, existing);
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);
}

// ─── 3. Revenue by Category ───────────────────────────────────────────────────

export async function getCategoryRevenue(period = "30d"): Promise<CategoryRevenue[]> {
  await requireAdmin();
  const start = periodStart(period);

  // Parallel fetch — both use single-field queries (no composite index needed)
  const [allOrders, productsSnap] = await Promise.all([
    fetchAllOrders(),
    adminDb.collection("products").get(),
  ]);

  const productCategories = new Map<string, string>();
  productsSnap.docs.forEach(d => productCategories.set(d.id, d.data().category ?? "Other"));

  const orders = allOrders.filter(o =>
    PAID_STATUSES.has(o.status) &&
    (period === "all" || o.createdAt >= start)
  );

  const categoryMap = new Map<string, CategoryRevenue>();

  orders.forEach(order => {
    const items: any[] = order.items ?? [];
    items.forEach(item => {
      const cat = productCategories.get(item.productId) ?? "Other";
      const existing = categoryMap.get(cat) ?? { category: cat, revenue: 0, orders: 0 };
      existing.revenue += item.totalPrice ?? 0;
      existing.orders  += 1;
      categoryMap.set(cat, existing);
    });
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
}

// ─── 4. Order Status Breakdown ────────────────────────────────────────────────

export async function getOrderStatusBreakdown(period = "30d"): Promise<OrderStatusBreakdown[]> {
  await requireAdmin();
  const start = periodStart(period);
  const allOrders = await fetchAllOrders();
  const orders = period === "all" ? allOrders : allOrders.filter(o => o.createdAt >= start);

  const statusMap = new Map<string, OrderStatusBreakdown>();

  orders.forEach(order => {
    const status   = order.status ?? "unknown";
    const existing = statusMap.get(status) ?? { status, count: 0, revenue: 0 };
    existing.count += 1;
    if (PAID_STATUSES.has(status)) existing.revenue += order.total ?? 0;
    statusMap.set(status, existing);
  });

  const ORDER = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
  return Array.from(statusMap.values()).sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
}

// ─── 5. Geographic Breakdown ──────────────────────────────────────────────────

export async function getCityBreakdown(period = "30d"): Promise<CityBreakdown[]> {
  await requireAdmin();
  const start = periodStart(period);
  const allOrders = await fetchAllOrders();

  const orders = allOrders.filter(o =>
    PAID_STATUSES.has(o.status) &&
    (period === "all" || o.createdAt >= start)
  );

  const cityMap = new Map<string, CityBreakdown>();

  orders.forEach(order => {
    const city     = order.shippingAddress?.city?.trim() || "Unknown";
    const existing = cityMap.get(city) ?? { city, orders: 0, revenue: 0 };
    existing.orders  += 1;
    existing.revenue += order.total ?? 0;
    cityMap.set(city, existing);
  });

  return Array.from(cityMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

// ─── 6. Coupon Performance ────────────────────────────────────────────────────

export async function getCouponStats(): Promise<CouponStat[]> {
  await requireAdmin();
  const [couponsSnap, ordersSnap] = await Promise.all([
    adminDb.collection("coupons").orderBy("usageCount", "desc").get(),
    adminDb.collection("orders").get(),
  ]);

  const now = Date.now();

  // Build per-coupon stats from actual order records (source of truth)
  const couponOrderMap = new Map<string, { discountGiven: number; influencedRevenue: number; usageCount: number }>();
  ordersSnap.docs.forEach(doc => {
    const data = doc.data();
    if (!data.couponCode) return;
    if (!PAID_STATUSES.has(data.status)) return;
    const code     = (data.couponCode as string).toUpperCase().trim();
    const existing = couponOrderMap.get(code) ?? { discountGiven: 0, influencedRevenue: 0, usageCount: 0 };
    existing.discountGiven     += data.couponDiscountAmount ?? 0;
    existing.influencedRevenue += data.total ?? 0;
    existing.usageCount        += 1;
    couponOrderMap.set(code, existing);
  });

  // Rows from the coupons collection
  const knownCodes = new Set<string>();
  const rows: CouponStat[] = couponsSnap.docs.map(doc => {
    const data      = doc.data();
    const code      = (data.code as string).toUpperCase().trim();
    knownCodes.add(code);
    const orderData = couponOrderMap.get(code) ?? { discountGiven: 0, influencedRevenue: 0, usageCount: 0 };
    const expiryMs  = toMs(data.expiryDate);
    const effectivelyActive = (data.isActive ?? false) && (expiryMs === 0 || expiryMs > now);
    const realUsageCount = orderData.usageCount > 0 ? orderData.usageCount : (data.usageCount ?? 0);
    return {
      code,
      type:              data.type,
      usageCount:        realUsageCount,
      discountGiven:     orderData.discountGiven,
      influencedRevenue: orderData.influencedRevenue,
      isActive:          effectivelyActive,
      expiryDate:        expiryMs,
    };
  });

  // Orphaned rows — paid orders used a coupon code not in the coupons collection (deleted coupon)
  couponOrderMap.forEach((orderData, code) => {
    if (knownCodes.has(code)) return;
    rows.push({
      code:              code + " [deleted]",
      type:              "unknown",
      usageCount:        orderData.usageCount,
      discountGiven:     orderData.discountGiven,
      influencedRevenue: orderData.influencedRevenue,
      isActive:          false,
      expiryDate:        0,
    });
  });

  return rows;
}

// ─── 7. Referral Leaderboard ──────────────────────────────────────────────────

export async function getReferralLeaderboard(): Promise<ReferralLeader[]> {
  await requireAdmin();
  // Single-field: no orderBy — no composite index needed
  const snap  = await adminDb.collection("users").get();
  const users = snap.docs.map(d => ({ uid: d.id, ...d.data() })) as any[];

  const referralMap  = new Map<string, number>();
  const convertedMap = new Map<string, number>();

  users.forEach(u => {
    if (u.referredBy) {
      referralMap.set(u.referredBy, (referralMap.get(u.referredBy) ?? 0) + 1);
      if (u.hasOrderedBefore) {
        convertedMap.set(u.referredBy, (convertedMap.get(u.referredBy) ?? 0) + 1);
      }
    }
  });

  return users
    .filter(u => (referralMap.get(u.uid) ?? 0) > 0 || (u.totalReferralEarnings ?? 0) > 0)
    .map(u => ({
      uid:            u.uid,
      displayName:    u.displayName ?? "Unknown",
      referralCode:   u.referralCode ?? "",
      referralCount:  referralMap.get(u.uid)  ?? 0,
      convertedCount: convertedMap.get(u.uid) ?? 0,
      totalEarnings:  u.totalReferralEarnings  ?? 0,
    }))
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 20);
}


// ─── 9. Event Funnel (analytics_events collection) ───────────────────────────
// Uses ONLY single equality filters — no composite index required.
// Date range applied in-memory to avoid event+timestamp composite index.

export async function getEventFunnel(period = "30d"): Promise<EventCounts> {
  await requireAdmin();
  const start = periodStart(period);

  // Fetch each event type separately — single-field where, no orderBy
  const [viewSnap, cartSnap, checkoutStartSnap, checkoutCompleteSnap] = await Promise.all([
    adminDb.collection("analytics_events").where("event", "==", "product_view").get(),
    adminDb.collection("analytics_events").where("event", "==", "add_to_cart").get(),
    adminDb.collection("analytics_events").where("event", "==", "checkout_start").get(),
    adminDb.collection("analytics_events").where("event", "==", "checkout_complete").get(),
  ]);

  // Filter by date in-memory
  const inPeriod = (snap: FirebaseFirestore.QuerySnapshot) =>
    period === "all"
      ? snap.size
      : snap.docs.filter(d => toMs(d.data().timestamp) >= start).length;

  const views     = inPeriod(viewSnap);
  const carts     = inPeriod(cartSnap);
  const starts    = inPeriod(checkoutStartSnap);
  const completes = inPeriod(checkoutCompleteSnap);

  return {
    productViews:       views,
    addToCarts:         carts,
    checkoutStarts:     starts,
    checkoutCompletes:  completes,
    viewToCartRate:     views > 0 ? (carts   / views) * 100 : 0,
    cartToCheckoutRate: carts > 0 ? (starts  / carts) * 100 : 0,
  };
}
