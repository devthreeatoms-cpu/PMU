"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function getDashboardStatsAction() {
  try {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    // 1. Fetch Orders
    const ordersSnapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    // 2. Fetch Users
    const usersSnapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    // --- CALCULATE TOTALS ---
    const totalRevenue = orders.reduce((acc, order) => {
      return order.status === "paid" ? acc + (order.total || 0) : acc;
    }, 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalActiveArtists = new Set(orders.map(o => o.userId)).size;

    // --- CALCULATE TRENDS (Last 30 days vs Previous 30 days) ---
    const currentOrders = orders.filter(o => o.createdAt >= thirtyDaysAgo);
    const previousOrders = orders.filter(o => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo);

    const currentRevenue = currentOrders.reduce((acc, o) => o.status === "paid" ? acc + (o.total || 0) : acc, 0);
    const previousRevenue = previousOrders.reduce((acc, o) => o.status === "paid" ? acc + (o.total || 0) : acc, 0);

    const currentUsers = users.filter(u => u.createdAt >= thirtyDaysAgo).length;
    const previousUsers = users.filter(u => u.createdAt >= sixtyDaysAgo && u.createdAt < thirtyDaysAgo).length;

    const currentArtists = new Set(currentOrders.map(o => o.userId)).size;
    const previousArtists = new Set(previousOrders.map(o => o.userId)).size;

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const diff = ((current - previous) / previous) * 100;
      return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    };

    const stats = {
      totalRevenue,
      totalOrders,
      totalUsers,
      activeUsers: totalActiveArtists,
      revenueTrend: calculateTrend(currentRevenue, previousRevenue),
      revenueTrendUp: currentRevenue >= previousRevenue,
      ordersTrend: calculateTrend(currentOrders.length, previousOrders.length),
      ordersTrendUp: currentOrders.length >= previousOrders.length,
      usersTrend: calculateTrend(currentUsers, previousUsers),
      usersTrendUp: currentUsers >= previousUsers,
      activeUsersTrend: calculateTrend(currentArtists, previousArtists),
      activeUsersTrendUp: currentArtists >= previousArtists,
    };

    // 3. Low Stock Items (Stock < 10)
    const productsSnapshot = await adminDb.collection("products").where("stock", "<", 10).get();
    const lowStockItems = productsSnapshot.docs.map(doc => {
      const data: any = doc.data();
      return {
        name: data.name,
        stock: data.stock,
        sku: data.sku || doc.id
      };
    });

    // 4. Daily Sales Data for last 30 days
    const salesMap = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
    }

    orders.forEach((order: any) => {
      if (order.createdAt >= thirtyDaysAgo) {
        const d = new Date(order.createdAt);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (salesMap.has(dateStr)) {
          const entry = salesMap.get(dateStr);
          if (order.status === "paid") {
            entry.revenue += (order.total || 0);
          }
          entry.orders += 1;
        }
      }
    });

    // 5. Unified Activity Feed
    const recentActivity = [
      ...orders.slice(0, 5).map(o => ({
        type: 'order',
        id: o.id,
        title: `Order from ${o.shippingAddress?.firstName || 'Anonymous'}`,
        subtitle: `₹${(o.total || 0).toFixed(2)} - ${o.status}`,
        timestamp: o.createdAt,
        status: o.status,
        initials: (o.shippingAddress?.firstName?.[0] || 'U') + (o.shippingAddress?.lastName?.[0] || 'A')
      })),
      ...users.slice(0, 5).map(u => ({
        type: 'user',
        id: u.id,
        title: `New User: ${u.displayName || 'Anonymous'}`,
        subtitle: `Joined the platform`,
        timestamp: u.createdAt || Date.now(),
        status: 'new',
        initials: (u.displayName?.[0] || 'U')
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

    return { 
      success: true, 
      stats: {
        ...stats,
        recentOrders: orders.slice(0, 5),
        recentActivity,
        lowStockItems,
        salesData: Array.from(salesMap.values()),
        lastUpdated: now
      }
    };
  } catch (err: any) {
    console.error("getDashboardStatsAction error:", err);
    return { success: false, error: err.message };
  }
}
