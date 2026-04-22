"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getDashboardStatsAction } from "./actions";
import { seedDatabase, getProducts } from "@/lib/services/admin";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [hasProducts, setHasProducts] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getDashboardStatsAction();
        if (res.success) {
          setStats(res.stats);
        }
        
        const products = await getProducts();
        setHasProducts(products.length > 0);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSeed = async () => {
    setIsInitializing(true);
    try {
      await seedDatabase();
      toast.success("Database Seeded Successfully");
      setHasProducts(true);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to seed database");
    } finally {
      setIsInitializing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-40 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto" />
        <p className="mt-4 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing live analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-normal">Console Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time performance metrics and system health.</p>
        </div>
        <div className="flex gap-2">
          {!hasProducts && (
             <Button 
               onClick={handleSeed} 
               disabled={isInitializing}
               variant="outline"
               className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full text-[10px] font-bold tracking-widest uppercase"
             >
               {isInitializing ? "Seeding..." : "Bootstrap Products"}
             </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold tracking-widest uppercase">Export CSV</Button>
          <Link href="/admin/orders">
            <Button size="sm" className="bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-6">Live View</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Total Revenue" 
          value={stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0"} 
          trend="+18.2%" 
          trendUp={true} 
          icon={<DollarSign className="w-4 h-4" />} 
          description="vs last month"
        />
        <KPICard 
          title="Total Orders" 
          value={stats ? stats.totalOrders : "0"} 
          trend="+12.5%" 
          trendUp={true} 
          icon={<ShoppingCart className="w-4 h-4" />} 
          description="Real-time"
        />
        <KPICard 
          title="Active Artists" 
          value={stats ? stats.activeArtists : "0"} 
          trend="+5.1%" 
          trendUp={true} 
          icon={<Users className="w-4 h-4" />} 
          description="Unique customers"
        />
        <KPICard 
          title="Total Platform Users" 
          value={stats ? stats.totalUsers : "0"} 
          trend="+22.4%" 
          trendUp={true} 
          icon={<TrendingUp className="w-4 h-4" />} 
          description="Registered accounts"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="lg:col-span-4 border-zinc-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800">Revenue Growth</CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mt-1">Daily Analytics (Last 30 Days)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesData || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D8D" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#FF4D8D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#999', fontWeight: 600}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#999', fontWeight: 600}}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#FF4D8D' }}
                    labelStyle={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FF4D8D" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Low Stock Alerts */}
          <Card className="border-red-50 bg-red-50/10 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-red-600">Critical Stock Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {stats?.lowStockItems?.length > 0 ? stats.lowStockItems.map((item: any) => (
                <div key={item.sku} className="flex items-center justify-between p-4 bg-white border border-red-50 rounded-2xl shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-900">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-red-600 uppercase">{item.stock} LEFT</p>
                    <Link href={`/admin/products`} className="text-[9px] font-bold text-zinc-400 hover:text-brand-gold underline underline-offset-4 tracking-widest uppercase">Manage</Link>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center bg-white border border-dashed border-zinc-200 rounded-2xl">
                   <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Inventory Levels Healthy</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders List */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((order: any) => (
                <Link href={`/admin/orders/${order.id}`} key={order.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand-vibrant-pink/30 hover:bg-pink-50/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[10px] font-bold border border-zinc-200 uppercase text-zinc-400">
                      {order.shippingAddress?.firstName?.[0] || 'U'}{order.shippingAddress?.lastName?.[0] || 'A'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-900">{order.shippingAddress?.firstName || 'Anonymos'} {order.shippingAddress?.lastName || 'User'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-zinc-900">${(order.total || 0).toFixed(2)}</p>
                    <span className="text-[9px] font-bold text-[#FF4D8D] uppercase tracking-tighter">{order.status}</span>
                  </div>
                </Link>
              )) : (
                <div className="py-8 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No Recent Activity</div>
              )}
              <Link href="/admin/orders" className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-400 hover:text-brand-black transition-colors pt-2 uppercase tracking-widest">
                 View All Merchant Activity <ExternalLink className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, trendUp, icon, description }: any) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {title}
        </CardTitle>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm text-brand-gold">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tight text-zinc-900">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className={`flex items-center text-[10px] font-black ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend}
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}
