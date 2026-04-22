"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Order } from "@/lib/types";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Award
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  "pending":    { color: "bg-zinc-100 text-zinc-600 border-zinc-200",    icon: <Clock className="w-3 h-3" /> },
  "paid":       { color: "bg-blue-50 text-blue-600 border-blue-100",     icon: <CheckCircle2 className="w-3 h-3" /> },
  "processing": { color: "bg-amber-50 text-amber-600 border-amber-100",  icon: <Package className="w-3 h-3" /> },
  "shipped":    { color: "bg-purple-50 text-purple-600 border-purple-100", icon: <Truck className="w-3 h-3" /> },
  "delivered":  { color: "bg-green-50 text-green-600 border-green-100",  icon: <CheckCircle2 className="w-3 h-3" /> },
  "cancelled":  { color: "bg-red-50 text-red-600 border-red-100",        icon: <RotateCcw className="w-3 h-3" /> },
};

function RotateCcw(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
}

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "orders"), 
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        // Manual sort to bypass composite index requirement
        const sortedData = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(sortedData);
      } catch (err) {
        console.error("Order fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center max-w-xl">
          <ShieldCheck className="mx-auto w-16 h-16 text-zinc-100 mb-6" />
          <h1 className="text-4xl font-heading mb-6 tracking-tight">Identity Required</h1>
          <p className="text-zinc-500 mb-10 font-light leading-relaxed">
            Please sign in to access your professional history and exclusive collection.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-brand-black text-white hover:bg-brand-gold px-12 h-14 rounded-none font-bold tracking-[0.2em] uppercase transition-all duration-500">
              Access Vault
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar / Profile Summary */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-brand-black flex items-center justify-center text-brand-gold text-3xl font-heading">
                  {user.email?.[0].toUpperCase()}
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-heading tracking-tight">{profile?.displayName || "Elite Artist"}</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.email}</p>
              </div>
              <div className="pt-6 border-t border-zinc-50 grid grid-cols-2 gap-4">
                 <div className="text-center">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Points</p>
                   <p className="text-lg font-black text-brand-gold">{profile?.points || 0}</p>
                 </div>
                 <div className="text-center">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Orders</p>
                   <p className="text-lg font-black text-zinc-900">{orders.length}</p>
                 </div>
              </div>
            </div>

            <div className="bg-brand-black text-white p-6 rounded-[2rem] space-y-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-brand-gold" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Pro Rewards Status</span>
              </div>
              <p className="text-xs font-light tracking-wide text-zinc-400">
                You are currently a <span className="text-brand-gold font-bold">Gold Member</span>. Enjoy complimentary international shipping on all orders over $150.
              </p>
            </div>
          </div>

          {/* Main History Content */}
          <div className="flex-1 space-y-10">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-heading italic">Professional History</h1>
              <div className="flex gap-2">
                <Badge className="bg-white border-zinc-100 text-zinc-400 font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">All Orders</Badge>
              </div>
            </div>

            {isLoading ? (
              <div className="py-24 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-gold mx-auto" />
                <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">Fetching Records...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-zinc-200 text-center space-y-6">
                <p className="text-zinc-400 text-sm font-light italic">Your history is a blank canvas.</p>
                <Link href="/products">
                  <Button variant="outline" className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">Explore Curated Inventory</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden hover:border-brand-gold/30 transition-all duration-500 group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Summary Block */}
                        <div className="p-8 md:w-72 bg-zinc-50 border-r border-zinc-100 space-y-4">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order ID</p>
                             <p className="text-xs font-mono font-bold text-zinc-900 truncate">{order.id}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</p>
                             <p className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div className="pt-2">
                            <Badge className={`rounded-full px-3 py-1 flex items-center gap-1.5 w-fit font-bold text-[9px] uppercase tracking-tighter border ${STATUS_CONFIG[order.status]?.color}`}>
                              {STATUS_CONFIG[order.status]?.icon}
                              {order.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Items Block */}
                        <div className="flex-1 p-8 flex flex-col justify-between">
                          <div className="flex flex-wrap gap-4">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-zinc-50 p-2 pr-4 rounded-xl border border-zinc-100">
                                <span className="text-[9px] font-bold text-brand-gold">x{item.quantity}</span>
                                <span className="text-xs font-bold text-zinc-800 uppercase tracking-tight max-w-[120px] truncate">{item.productName}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest pt-2">
                                + {order.items.length - 3} more
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-baseline gap-4 mt-8 pt-6 border-t border-zinc-100 justify-between">
                             <div className="flex items-baseline gap-2">
                               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Investment Total</p>
                               <p className="text-xl font-heading text-zinc-900">${order.total?.toFixed(2)}</p>
                             </div>
                             <Link href={`/profile/orders/${order.id}`}>
                               <button className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 hover:text-brand-gold transition-colors uppercase">
                                 Detailed Audit <ChevronRight className="w-3 h-3" />
                               </button>
                             </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

function Button({ children, size, className, variant, ...props }: any) {
  const baseStyle = "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50";
  const variants: any = {
    default: "bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90",
    outline: "border border-zinc-200 bg-transparent shadow-sm hover:bg-zinc-100 hover:text-zinc-900",
  };
  const sizes: any = {
    lg: "h-10 px-8 text-xs",
  };
  return (
    <button className={`${baseStyle} ${variants[variant || 'default']} ${sizes[size || 'default']} ${className}`} {...props}>
      {children}
    </button>
  );
}
