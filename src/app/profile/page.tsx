"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { Order, Product } from "@/lib/types";
import { getProducts } from "@/lib/services/admin";
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  ChevronRight,
  ShieldCheck,
  LogOut,
  RotateCcw,
  ShoppingBag,
  Mail,
  Phone,
  Pencil,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pending:    { color: "bg-zinc-100 text-zinc-700 border-zinc-200",       icon: <Clock className="w-3 h-3" />,        label: "Pending" },
  paid:       { color: "bg-blue-50 text-blue-700 border-blue-100",        icon: <CheckCircle2 className="w-3 h-3" />, label: "Paid" },
  processing: { color: "bg-amber-50 text-amber-700 border-amber-100",     icon: <Package className="w-3 h-3" />,      label: "Processing" },
  shipped:    { color: "bg-purple-50 text-purple-700 border-purple-100",  icon: <Truck className="w-3 h-3" />,        label: "Shipped" },
  delivered:  { color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle2 className="w-3 h-3" />, label: "Delivered" },
  cancelled:  { color: "bg-red-50 text-red-700 border-red-100",           icon: <RotateCcw className="w-3 h-3" />,    label: "Cancelled" },
  refunded:   { color: "bg-orange-50 text-orange-700 border-orange-100",  icon: <RotateCcw className="w-3 h-3" />,    label: "Refunded" },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editAddress, setEditAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "India",
    phone: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const prodData = await getProducts();
        const prodMap: Record<string, Product> = {};
        prodData.forEach((p) => {
          if (p.id) prodMap[p.id] = p;
        });
        setProducts(prodMap);
      } catch (e) {
        console.error("Products fetch failed:", e);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));

        const successfulStatuses = ["paid", "processing", "shipped", "delivered", "refunded"];
        const filteredData = data.filter((order) => successfulStatuses.includes(order.status));
        setOrders(filteredData);
      } catch (err) {
        console.error("Order fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!isEditDialogOpen) {
      if (profile?.defaultShippingAddress) {
        const addr = profile.defaultShippingAddress;
        setEditAddress({
          firstName: addr.firstName || "",
          lastName: addr.lastName || "",
          address: addr.address || "",
          city: addr.city || "",
          zipCode: addr.zipCode || "",
          country: addr.country || "India",
          phone: addr.phone || "",
        });
      } else if (orders.length > 0) {
        const lastAddr = orders[0].shippingAddress;
        setEditAddress({
          firstName: lastAddr.firstName || "",
          lastName: lastAddr.lastName || "",
          address: lastAddr.address || "",
          city: lastAddr.city || "",
          zipCode: lastAddr.zipCode || "",
          country: lastAddr.country || "India",
          phone: lastAddr.phone || "",
        });
      }
    }
  }, [orders, profile, isEditDialogOpen]);

  const handleSaveAddress = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        defaultShippingAddress: editAddress,
      });
      toast.success("Shipping address updated.");
      setIsEditDialogOpen(false);
    } catch (err: any) {
      console.error("Save address failed:", err);
      toast.error("Failed to update address.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const memberSince = profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "—";
    return { totalOrders: orders.length, totalSpent, memberSince };
  }, [orders, profile]);

  const initial = (profile?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();

  if (!user) {
    return (
      <main className="min-h-screen bg-brand-cream/40 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md w-full text-center bg-white rounded-3xl border border-zinc-100 shadow-sm p-10 md:p-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-rose/30 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-brand-gold" />
            </div>
            <h1 className="text-3xl font-heading mb-3 tracking-tight text-zinc-900">Sign in to your account</h1>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              Access your order history, saved address, and manage your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="inline-flex items-center justify-center bg-brand-black text-white hover:bg-brand-gold px-8 h-12 rounded-full font-bold tracking-[0.18em] uppercase text-xs transition-all duration-300">
                Sign In
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center border border-zinc-200 text-zinc-700 hover:border-brand-gold hover:text-brand-gold px-8 h-12 rounded-full font-bold tracking-[0.18em] uppercase text-xs transition-all duration-300">
                Create Account
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-cream/40">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-rose/40 via-white to-brand-cream/60 border-b border-zinc-100">
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-rose/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-brand-black to-zinc-700 flex items-center justify-center text-brand-gold text-3xl md:text-4xl font-heading shadow-lg ring-4 ring-white">
                  {initial}
                </div>
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-brand-gold/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-gold">Welcome back</p>
                <h1 className="text-2xl md:text-4xl font-heading tracking-tight text-zinc-900">
                  {profile?.displayName || "Hello there"}
                </h1>
                <p className="text-xs md:text-sm text-zinc-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto">
              <StatCard label="Orders" value={String(stats.totalOrders)} icon={<ShoppingBag className="w-4 h-4" />} />
              <StatCard label="Total Spent" value={formatCurrency(stats.totalSpent)} icon={<Package className="w-4 h-4" />} />
              <StatCard label="Member Since" value={stats.memberSince} icon={<ShieldCheck className="w-4 h-4" />} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Address Card */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-rose/30 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Shipping Address</h3>
                </div>
                {(orders.length > 0 || profile?.defaultShippingAddress) && (
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger
                      render={
                        <button
                          aria-label="Edit address"
                          className="p-1.5 rounded-full text-zinc-400 hover:text-brand-gold hover:bg-brand-rose/30 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      }
                    />
                    <DialogContent className="sm:max-w-md bg-white rounded-2xl border-zinc-100">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-heading">Edit Shipping Address</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="First Name" value={editAddress.firstName} onChange={(v) => setEditAddress({ ...editAddress, firstName: v })} />
                          <FormField label="Last Name" value={editAddress.lastName} onChange={(v) => setEditAddress({ ...editAddress, lastName: v })} />
                        </div>
                        <FormField label="Address" value={editAddress.address} onChange={(v) => setEditAddress({ ...editAddress, address: v })} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="City" value={editAddress.city} onChange={(v) => setEditAddress({ ...editAddress, city: v })} />
                          <FormField label="Zip Code" value={editAddress.zipCode} onChange={(v) => setEditAddress({ ...editAddress, zipCode: v })} />
                        </div>
                        <FormField label="Phone" value={editAddress.phone} onChange={(v) => setEditAddress({ ...editAddress, phone: v })} placeholder="+91 ..." />
                      </div>
                      <DialogFooter>
                        <button
                          onClick={handleSaveAddress}
                          disabled={isSaving}
                          className="w-full bg-brand-black text-white hover:bg-brand-gold h-12 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="p-6">
                {(() => {
                  const displayAddr = profile?.defaultShippingAddress || orders[0]?.shippingAddress;
                  if (!displayAddr) {
                    return (
                      <div className="text-center py-4">
                        <p className="text-xs text-zinc-400 mb-3">No address saved yet.</p>
                        <button
                          onClick={() => setIsEditDialogOpen(true)}
                          className="text-xs font-bold tracking-widest uppercase text-brand-gold hover:underline"
                        >
                          + Add Address
                        </button>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogContent className="sm:max-w-md bg-white rounded-2xl border-zinc-100">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-heading">Add Shipping Address</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-2">
                              <div className="grid grid-cols-2 gap-4">
                                <FormField label="First Name" value={editAddress.firstName} onChange={(v) => setEditAddress({ ...editAddress, firstName: v })} />
                                <FormField label="Last Name" value={editAddress.lastName} onChange={(v) => setEditAddress({ ...editAddress, lastName: v })} />
                              </div>
                              <FormField label="Address" value={editAddress.address} onChange={(v) => setEditAddress({ ...editAddress, address: v })} />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField label="City" value={editAddress.city} onChange={(v) => setEditAddress({ ...editAddress, city: v })} />
                                <FormField label="Zip Code" value={editAddress.zipCode} onChange={(v) => setEditAddress({ ...editAddress, zipCode: v })} />
                              </div>
                              <FormField label="Phone" value={editAddress.phone} onChange={(v) => setEditAddress({ ...editAddress, phone: v })} placeholder="+91 ..." />
                            </div>
                            <DialogFooter>
                              <button
                                onClick={handleSaveAddress}
                                disabled={isSaving}
                                className="w-full bg-brand-black text-white hover:bg-brand-gold h-12 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all disabled:opacity-50"
                              >
                                {isSaving ? "Saving..." : "Save Address"}
                              </button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3 text-sm">
                      <p className="font-semibold text-zinc-900">
                        {displayAddr.firstName} {displayAddr.lastName}
                      </p>
                      <p className="text-zinc-500 leading-relaxed text-[13px]">
                        {displayAddr.address}<br />
                        {displayAddr.city}, {displayAddr.zipCode}<br />
                        {displayAddr.country}
                      </p>
                      {displayAddr.phone && (
                        <p className="flex items-center gap-1.5 text-zinc-600 text-[13px] pt-1">
                          <Phone className="w-3.5 h-3.5 text-brand-gold" /> {displayAddr.phone}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100">
                <h3 className="text-sm font-bold text-zinc-900">Quick Actions</h3>
              </div>
              <div className="p-2">
                <Link
                  href="/products"
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-brand-rose/20 group transition-colors"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-zinc-700 group-hover:text-brand-gold">
                    <ShoppingBag className="w-4 h-4" /> Continue Shopping
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-brand-gold transition-colors" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-50 group transition-colors"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-red-600">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </span>
                  <ChevronRight className="w-4 h-4 text-red-200 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>
          </aside>

          {/* Orders */}
          <section className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-heading tracking-tight text-zinc-900">Your Orders</h2>
                <p className="text-sm text-zinc-500 mt-1">Track and manage your recent purchases.</p>
              </div>
              {orders.length > 0 && (
                <Badge className="bg-brand-rose/30 text-brand-gold border-brand-gold/20 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="py-24 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-gold/30 border-t-brand-gold mx-auto" />
                <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 md:p-16 rounded-3xl border border-dashed border-zinc-200 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-brand-rose/30 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-brand-gold" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-heading text-zinc-900">No orders yet</h3>
                  <p className="text-sm text-zinc-500">Discover our collection and place your first order.</p>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-brand-black text-white hover:bg-brand-gold px-8 h-12 rounded-full text-xs font-bold tracking-[0.18em] uppercase transition-all"
                >
                  Shop Now <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/profile/orders/${order.id}`}
                    className="block group"
                  >
                    <article className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:border-brand-gold/40 hover:shadow-md transition-all duration-300">
                      <div className="grid md:grid-cols-[200px_1fr_auto]">
                        {/* Summary */}
                        <div className="p-6 md:border-r border-b md:border-b-0 border-zinc-100 bg-gradient-to-br from-brand-cream/40 to-white space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Order</p>
                            <p className="text-xs font-mono font-semibold text-zinc-700 truncate">#{order.id?.slice(-8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Date</p>
                            <p className="text-xs font-medium text-zinc-700">
                              {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <Badge
                            className={`rounded-full px-2.5 py-1 flex items-center gap-1.5 w-fit font-bold text-[9px] uppercase tracking-wider border ${STATUS_CONFIG[order.status]?.color}`}
                          >
                            {STATUS_CONFIG[order.status]?.icon}
                            {STATUS_CONFIG[order.status]?.label || order.status}
                          </Badge>
                        </div>

                        {/* Items */}
                        <div className="p-6 space-y-3">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 4).map((item, idx) => {
                              const product = products[item.productId];
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2.5 bg-zinc-50 pl-1.5 pr-3 py-1.5 rounded-xl border border-zinc-100"
                                  title={item.productName}
                                >
                                  <div className="w-9 h-9 rounded-lg bg-white border border-zinc-100 overflow-hidden flex-shrink-0">
                                    {product?.imageUrls?.[0] ? (
                                      <img src={product.imageUrls[0]} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-300 font-bold uppercase">
                                        PMU
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col leading-tight">
                                    <span className="text-[11px] font-semibold text-zinc-800 max-w-[140px] truncate">
                                      {item.productName}
                                    </span>
                                    <span className="text-[10px] font-bold text-brand-gold">×{item.quantity}</span>
                                  </div>
                                </div>
                              );
                            })}
                            {order.items.length > 4 && (
                              <div className="flex items-center px-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                +{order.items.length - 4} more
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Total + CTA */}
                        <div className="p-6 md:border-l border-t md:border-t-0 border-zinc-100 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:min-w-[180px]">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-xl font-heading text-zinc-900">{formatCurrency(order.total || 0)}</p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-zinc-500 group-hover:text-brand-gold transition-colors">
                            View Details <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-sm px-4 py-3 md:px-5 md:py-4">
      <div className="flex items-center gap-2 text-brand-gold mb-1">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      </div>
      <p className="text-base md:text-lg font-heading text-zinc-900 leading-tight truncate">{value}</p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-xl border-zinc-200 bg-white focus:border-brand-gold"
      />
    </div>
  );
}
