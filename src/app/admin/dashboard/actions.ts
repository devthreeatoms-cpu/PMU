"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function getDashboardStatsAction() {
  try {
    // 1. Fetch Orders and calculate stats
    const ordersSnapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalRevenue = orders.reduce((acc, order: any) => acc + (order.total || 0), 0);
    const totalOrders = orders.length;
    
    // 2. Fetch Users
    const usersSnapshot = await adminDb.collection("users").get();
    const totalUsers = usersSnapshot.size;
    
    // 3. Active Artists (unique customer IDs across all time)
    const uniqueArtists = new Set(orders.map((o: any) => o.userId)).size;

    // 4. Low Stock Items (Stock < 10)
    const productsSnapshot = await adminDb.collection("products").where("stock", "<", 10).get();
    const lowStockItems = productsSnapshot.docs.map(doc => {
      const data: any = doc.data();
      return {
        name: data.name,
        stock: data.stock,
        sku: data.sku || doc.id
      };
    });

    // 5. Daily Sales Data for last 30 days
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    // Create a map of dates to revenue/orders
    const salesMap = new Map();
    // Initialize last 30 days
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
          entry.revenue += (order.total || 0);
          entry.orders += 1;
        }
      }
    });

    const salesData = Array.from(salesMap.values());

    return { 
      success: true, 
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        activeArtists: uniqueArtists,
        recentOrders: orders.slice(0, 5),
        lowStockItems,
        salesData
      }
    };
  } catch (err: any) {
    console.error("getDashboardStatsAction error:", err);
    return { success: false, error: err.message };
  }
}
