"use server";

import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth-helpers";

// Orders in these statuses represent confirmed revenue
const REVENUE_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);

export type DashboardPeriod = "today" | "7d" | "30d" | "90d" | "12m" | "all";

function getPeriodConfig(period: DashboardPeriod) {
  const now = Date.now();
  switch (period) {
    case "today":
      const todayStart = new Date(now).setHours(0, 0, 0, 0);
      return { start: todayStart, prevStart: todayStart - 24 * 60 * 60 * 1000, label: "vs yesterday" };
    case "7d":
      return { start: now - 7 * 24 * 60 * 60 * 1000, prevStart: now - 14 * 24 * 60 * 60 * 1000, label: "vs prev week" };
    case "30d":
      return { start: now - 30 * 24 * 60 * 60 * 1000, prevStart: now - 60 * 24 * 60 * 60 * 1000, label: "vs last month" };
    case "90d":
      return { start: now - 90 * 24 * 60 * 60 * 1000, prevStart: now - 180 * 24 * 60 * 60 * 1000, label: "vs prev quarter" };
    case "12m":
      return { start: now - 365 * 24 * 60 * 60 * 1000, prevStart: now - 730 * 24 * 60 * 60 * 1000, label: "vs prev year" };
    case "all":
      return { start: 0, prevStart: 0, label: "all time" };
  }
}

function buildChartData(orders: any[], period: DashboardPeriod, now: number, periodStart: number) {
  const salesMap = new Map<string, { date: string; revenue: number; orders: number }>();

  if (period === "today") {
    for (let i = 0; i <= 23; i++) {
      const key = `${i}:00`;
      salesMap.set(key, { date: key, revenue: 0, orders: 0 });
    }
    orders.forEach((o: any) => {
      if (o.createdAt >= periodStart) {
        const key = `${new Date(o.createdAt).getHours()}:00`;
        if (salesMap.has(key)) {
          const e = salesMap.get(key)!;
          if (REVENUE_STATUSES.has(o.status)) e.revenue += o.total || 0;
          e.orders += 1;
        }
      }
    });
  } else if (period === "7d") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      salesMap.set(key, { date: key, revenue: 0, orders: 0 });
    }
    orders.forEach((o: any) => {
      if (o.createdAt >= periodStart) {
        const key = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (salesMap.has(key)) {
          const e = salesMap.get(key)!;
          if (REVENUE_STATUSES.has(o.status)) e.revenue += o.total || 0;
          e.orders += 1;
        }
      }
    });
  } else if (period === "30d") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      salesMap.set(key, { date: key, revenue: 0, orders: 0 });
    }
    orders.forEach((o: any) => {
      if (o.createdAt >= periodStart) {
        const key = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (salesMap.has(key)) {
          const e = salesMap.get(key)!;
          if (REVENUE_STATUSES.has(o.status)) e.revenue += o.total || 0;
          e.orders += 1;
        }
      }
    });
  } else if (period === "90d") {
    // Group into 13 weeks
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const key = `W${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      salesMap.set(key, { date: key, revenue: 0, orders: 0 });
    }
    orders.forEach((o: any) => {
      if (o.createdAt >= periodStart) {
        const weeksAgo = Math.floor((now - o.createdAt) / (7 * 24 * 60 * 60 * 1000));
        if (weeksAgo <= 12) {
          const d = new Date(now - weeksAgo * 7 * 24 * 60 * 60 * 1000);
          const key = `W${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
          if (salesMap.has(key)) {
            const e = salesMap.get(key)!;
            if (REVENUE_STATUSES.has(o.status)) e.revenue += o.total || 0;
            e.orders += 1;
          }
        }
      }
    });
  } else {
    // 12m or all — group by month
    const months = period === "12m" ? 12 : 18;
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      salesMap.set(key, { date: key, revenue: 0, orders: 0 });
    }
    orders.forEach((o: any) => {
      if (period === "all" || o.createdAt >= periodStart) {
        const key = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (salesMap.has(key)) {
          const e = salesMap.get(key)!;
          if (REVENUE_STATUSES.has(o.status)) e.revenue += o.total || 0;
          e.orders += 1;
        }
      }
    });
  }

  return Array.from(salesMap.values());
}

export async function getDashboardStatsAction(period: DashboardPeriod = "today") {
  await requireAdmin();
  try {
    const now = Date.now();
    const { start: periodStart, prevStart, label: trendLabel } = getPeriodConfig(period);

    // Helper: normalize Firestore Timestamp or plain number to milliseconds
    const toMs = (val: any): number => {
      if (!val) return 0;
      if (typeof val === "number") return val;
      if (typeof val?.toMillis === "function") return val.toMillis(); // Firestore Timestamp
      if (typeof val?.seconds === "number") return val.seconds * 1000; // {seconds, nanoseconds} object
      return Number(val) || 0;
    };

    // 1. Fetch Orders — normalize createdAt immediately
    const ordersSnapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    const orders = ordersSnapshot.docs.map(doc => {
      const data: any = doc.data();
      return { id: doc.id, ...data, createdAt: toMs(data.createdAt) };
    });

    // 2. Fetch Users — normalize createdAt immediately
    const usersSnapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = usersSnapshot.docs.map(doc => {
      const data: any = doc.data();
      return { id: doc.id, ...data, createdAt: toMs(data.createdAt) };
    });

    console.log(`[Dashboard] period=${period}, periodStart=${new Date(periodStart).toISOString()}, totalOrders=${orders.length}`);

    // --- FILTER TO PERIOD ---
    const periodOrders = period === "all" ? orders : orders.filter(o => o.createdAt >= periodStart);
    const prevPeriodOrders = period === "all" ? [] : orders.filter(o => o.createdAt >= prevStart && o.createdAt < periodStart);

    const periodUsers = period === "all" ? users : users.filter(u => u.createdAt >= periodStart);
    const prevPeriodUsers = period === "all" ? [] : users.filter(u => u.createdAt >= prevStart && u.createdAt < periodStart);

    // --- KPI VALUES (scoped to selected period) ---
    // Revenue = sum of all confirmed orders (paid, processing, shipped, delivered)
    const totalRevenue = periodOrders.reduce((acc, o) => REVENUE_STATUSES.has(o.status) ? acc + (o.total || 0) : acc, 0);
    const prevRevenue  = prevPeriodOrders.reduce((acc, o) => REVENUE_STATUSES.has(o.status) ? acc + (o.total || 0) : acc, 0);

    const totalOrders = periodOrders.length;
    const prevOrders = prevPeriodOrders.length;

    const totalActiveArtists = new Set(periodOrders.map(o => o.userId)).size;
    const prevActiveArtists = new Set(prevPeriodOrders.map(o => o.userId)).size;

    const totalNewUsers = periodUsers.length;
    const prevNewUsers = prevPeriodUsers.length;

    // All-time user count always shown in "Growth" subtitle
    const totalUsers = users.length;

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "—";
      const diff = ((current - previous) / previous) * 100;
      return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    };

    const stats = {
      totalRevenue,
      totalOrders,
      totalUsers: totalNewUsers,
      totalUsersAllTime: totalUsers,
      activeUsers: totalActiveArtists,
      revenueTrend: calculateTrend(totalRevenue, prevRevenue),
      revenueTrendUp: totalRevenue >= prevRevenue,
      ordersTrend: calculateTrend(totalOrders, prevOrders),
      ordersTrendUp: totalOrders >= prevOrders,
      usersTrend: calculateTrend(totalNewUsers, prevNewUsers),
      usersTrendUp: totalNewUsers >= prevNewUsers,
      activeUsersTrend: calculateTrend(totalActiveArtists, prevActiveArtists),
      activeUsersTrendUp: totalActiveArtists >= prevActiveArtists,
      trendLabel,
      // For UI display — shows the exact date range being filtered
      dateRangeLabel: period === "all"
        ? "All Time"
        : `${new Date(periodStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date(now).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
    };

    // 3. Low Stock Items (Stock < 10)
    const productsSnapshot = await adminDb.collection("products").where("stock", "<", 10).get();
    const lowStockItems = productsSnapshot.docs.map(doc => {
      const data: any = doc.data();
      return { name: data.name, stock: data.stock, sku: data.sku || doc.id };
    });

    // 4. Chart Data (scoped to period)
    const salesData = buildChartData(orders, period, now, periodStart);

    // 5. Unified Activity Feed
    const recentActivity = [
      ...orders.slice(0, 5).map(o => ({
        type: "order",
        id: o.id,
        title: `Order from ${o.shippingAddress?.firstName || "Anonymous"}`,
        subtitle: `₹${(o.total || 0).toFixed(2)} - ${o.status}`,
        timestamp: o.createdAt,
        status: o.status,
        initials: (o.shippingAddress?.firstName?.[0] || "U") + (o.shippingAddress?.lastName?.[0] || "A"),
      })),
      ...users.slice(0, 5).map(u => ({
        type: "user",
        id: u.id,
        title: `New User: ${u.displayName || "Anonymous"}`,
        subtitle: `Joined the platform`,
        timestamp: u.createdAt || Date.now(),
        status: "new",
        initials: u.displayName?.[0] || "U",
      })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

    return {
      success: true,
      stats: {
        ...stats,
        recentOrders: orders.slice(0, 5),
        recentActivity,
        lowStockItems,
        salesData,
        lastUpdated: now,
      },
    };
  } catch (err: any) {
    console.error("getDashboardStatsAction error:", err);
    return { success: false, error: err.message };
  }
}
