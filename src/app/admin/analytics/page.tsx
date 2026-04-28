"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import {
  TrendingUp, ShoppingBag, Tag, Users, MapPin, Award, Zap, RefreshCw,
  ArrowUpRight, ChevronDown, Package, Gift, Percent, Star
} from "lucide-react";
import {
  getAOVMetrics, getTopProducts, getCategoryRevenue, getOrderStatusBreakdown,
  getCityBreakdown, getCouponStats, getReferralLeaderboard, getEventFunnel,
} from "./actions";

// ── Constants ──────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "1 Year", value: "12m" },
  { label: "All Time", value: "all" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  paid: "#10B981",
  processing: "#3B82F6",
  shipped: "#6366F1",
  delivered: "#22C55E",
  cancelled: "#EF4444",
};

const PIE_COLORS = ["#FF4D8D", "#C9A84C", "#6366F1", "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899"];

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color = "pink" }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    pink: "bg-pink-50 text-[#FF4D8D]",
    gold: "bg-amber-50 text-amber-500",
    indigo: "bg-indigo-50 text-indigo-500",
    green: "bg-emerald-50 text-emerald-500",
    blue: "bg-blue-50 text-blue-500",
  };
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] ?? colors.pink}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
        {sub && <p className="text-[10px] text-zinc-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        {icon && <span className="text-[#FF4D8D]">{icon}</span>}
        <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function LoadingPulse() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-8 bg-zinc-100 rounded-xl w-1/3" />
      <div className="h-32 bg-zinc-100 rounded-xl" />
    </div>
  );
}

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtRs = (n: number) => `₹${fmt(n)}`;
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  const [aov, setAov] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any>(null);

  async function fetchAll(p: string) {
    setLoading(true);
    try {
      const [a, tp, cr, sb, ci, co, ref, fn] = await Promise.all([
        getAOVMetrics(p),
        getTopProducts(p),
        getCategoryRevenue(p),
        getOrderStatusBreakdown(p),
        getCityBreakdown(p),
        getCouponStats(),
        getReferralLeaderboard(),
        getEventFunnel(p),
      ]);
      setAov(a); setTopProducts(tp); setCategoryRevenue(cr);
      setStatusBreakdown(sb); setCities(ci); setCoupons(co);
      setReferrals(ref); setFunnel(fn);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(period); }, [period]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">Feature-aware · derived from live Firestore data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                period === p.value
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => fetchAll(period)}
            className="ml-2 p-2 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><LoadingPulse /><LoadingPulse /><LoadingPulse /><LoadingPulse /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={<TrendingUp size={18} />} label="Total Revenue" value={fmtRs(aov?.totalRevenue ?? 0)} sub={`${aov?.totalOrders ?? 0} total orders`} color="pink" />
          <KpiCard icon={<ShoppingBag size={18} />} label="Avg Order Value" value={fmtRs(aov?.aov ?? 0)} color="green" />
          <KpiCard icon={<Tag size={18} />} label="Coupon Usage" value={fmtPct(aov?.couponUsageRate ?? 0)} sub="of paid orders" color="gold" />
          <KpiCard icon={<Zap size={18} />} label="Cancellation Rate" value={fmtPct(aov?.cancellationRate ?? 0)} color="indigo" />
        </div>
      )}

      {/* ── Event Funnel ── */}
      {!loading && funnel && (
        <SectionCard title="Conversion Funnel" icon={<Zap size={16} />}>
          {funnel.productViews === 0 ? (
            <p className="text-sm text-zinc-400 italic text-center py-8">
              Funnel events will populate as customers browse products. Data starts accumulating from this point forward.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Product Views", value: funnel.productViews, color: "bg-pink-500" },
                { label: "Add to Cart", value: funnel.addToCarts, color: "bg-amber-500" },
                { label: "Checkout Start", value: funnel.checkoutStarts, color: "bg-indigo-500" },
                { label: "Checkout Complete", value: funnel.checkoutCompletes, color: "bg-emerald-500" },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className={`h-2 ${step.color} rounded-full mb-3`} style={{ opacity: 1 - i * 0.15 }} />
                  <p className="text-xl font-bold text-zinc-900">{fmt(step.value)}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">{step.label}</p>
                </div>
              ))}
            </div>
          )}
          {funnel.productViews > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-50 flex gap-8 text-center">
              <div>
                <p className="text-xs font-bold text-zinc-700">{fmtPct(funnel.viewToCartRate)}</p>
                <p className="text-[10px] text-zinc-400">View → Cart</p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-700">{fmtPct(funnel.cartToCheckoutRate)}</p>
                <p className="text-[10px] text-zinc-400">Cart → Checkout</p>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Top Products + Category Revenue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <LoadingPulse /> : (
          <SectionCard title="Top Products by Revenue" icon={<Package size={16} />}>
            {topProducts.length === 0 ? (
              <p className="text-sm text-zinc-400 italic text-center py-8">No paid orders in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts.slice(0, 7)} layout="vertical" margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                  <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <YAxis type="category" dataKey="productName" tick={{ fontSize: 9, fill: "#71717a" }} width={100}
                    tickFormatter={v => v.length > 14 ? v.slice(0, 14) + "…" : v} />
                  <Tooltip formatter={(v: any) => [`₹${fmt(v)}`, "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #f4f4f5", fontSize: 12 }} />
                  <Bar dataKey="totalRevenue" fill="#FF4D8D" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        )}

        {loading ? <LoadingPulse /> : (
          <SectionCard title="Revenue by Category" icon={<Star size={16} />}>
            {categoryRevenue.length === 0 ? (
              <p className="text-sm text-zinc-400 italic text-center py-8">No paid orders in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie 
                    data={categoryRevenue} 
                    dataKey="revenue" 
                    nameKey="category" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={85} 
                    paddingAngle={3}
                    label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`} 
                    labelLine={false}
                  >
                    {categoryRevenue.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`₹${fmt(v)}`, "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #f4f4f5", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        )}
      </div>

      {/* ── Order Status + City Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <LoadingPulse /> : (
          <SectionCard title="Orders by Status" icon={<ShoppingBag size={16} />}>
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-zinc-400 italic text-center py-8">No orders in this period.</p>
            ) : (
              <div className="space-y-3">
                {statusBreakdown.map(s => (
                  <div key={s.status} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] ?? "#94a3b8" }} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 w-28 shrink-0 capitalize">{s.status}</span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(s.count / statusBreakdown.reduce((a, x) => a + x.count, 0)) * 100}%`, background: STATUS_COLORS[s.status] ?? "#94a3b8" }} />
                    </div>
                    <span className="text-xs font-bold text-zinc-700 w-8 text-right shrink-0">{s.count}</span>
                    {s.revenue > 0 && <span className="text-[10px] text-zinc-400 w-20 text-right shrink-0">{fmtRs(s.revenue)}</span>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {loading ? <LoadingPulse /> : (
          <SectionCard title="Top Cities by Revenue" icon={<MapPin size={16} />}>
            {cities.length === 0 ? (
              <p className="text-sm text-zinc-400 italic text-center py-8">No paid orders in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-50">
                      <th className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2">#</th>
                      <th className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2">City</th>
                      <th className="text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2">Orders</th>
                      <th className="text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {cities.map((c, i) => (
                      <tr key={c.city} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-2.5 text-zinc-300 font-bold">{i + 1}</td>
                        <td className="py-2.5 font-bold text-zinc-800">{c.city}</td>
                        <td className="py-2.5 text-right text-zinc-500">{c.orders}</td>
                        <td className="py-2.5 text-right font-bold text-zinc-900">{fmtRs(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        )}
      </div>

      {/* ── Coupon Performance ── */}
      {loading ? <LoadingPulse /> : (
        <SectionCard title="Coupon Performance" icon={<Tag size={16} />}>
          {coupons.length === 0 ? (
            <p className="text-sm text-zinc-400 italic text-center py-8">No coupons found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-50">
                    {["Code", "Type", "Uses", "Discount Given", "Influenced Revenue", "Status", "Expires"].map(h => (
                      <th key={h} className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {coupons.map(c => (
                    <tr key={c.code} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 pr-4 font-black text-zinc-900 font-mono tracking-widest text-[11px]">{c.code}</td>
                      <td className="py-3 pr-4 capitalize text-zinc-500">{c.type.replace("_", " ")}</td>
                      <td className="py-3 pr-4 font-bold text-zinc-700">{c.usageCount}</td>
                      <td className="py-3 pr-4 font-bold text-red-500">{fmtRs(c.discountGiven)}</td>
                      <td className="py-3 pr-4 font-bold text-emerald-600">{fmtRs(c.influencedRevenue)}</td>
                      <td className="py-3 pr-4">
                        {(() => {
                          const now = Date.now();
                          const isExpired = c.expiryDate > 0 && c.expiryDate < now;
                          if (c.isActive) return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600">Active</span>;
                          if (isExpired)  return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-50 text-red-500">Expired</span>;
                          return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-100 text-zinc-400">Inactive</span>;
                        })()}
                      </td>
                      <td className={`py-3 ${c.expiryDate > 0 && c.expiryDate < Date.now() ? "text-red-400 font-bold" : "text-zinc-400"}`}>
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Referral Leaderboard ── */}
      {loading ? <LoadingPulse /> : referrals.length > 0 && (
        <SectionCard title="Referral Leaderboard" icon={<Gift size={16} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-50">
                  {["Rank", "User", "Code", "Referred", "Converted", "Conversion%", "Referral Earnings"].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {referrals.map((r, i) => (
                  <tr key={r.uid} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-zinc-100 text-zinc-500" : "bg-zinc-50 text-zinc-400"}`}>{i + 1}</span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-zinc-800">{r.displayName}</td>
                    <td className="py-3 pr-4 font-mono text-[10px] text-zinc-500 tracking-widest">{r.referralCode || "—"}</td>
                    <td className="py-3 pr-4 text-zinc-600">{r.referralCount}</td>
                    <td className="py-3 pr-4 text-emerald-600 font-bold">{r.convertedCount}</td>
                    <td className="py-3 pr-4 text-zinc-500">{r.referralCount > 0 ? fmtPct((r.convertedCount / r.referralCount) * 100) : "—"}</td>
                    <td className="py-3 font-bold text-[#FF4D8D]">{fmt(r.totalEarnings)} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

    </div>
  );
}
