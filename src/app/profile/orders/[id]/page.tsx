"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Order, Product } from "@/lib/types";
import { getProducts } from "@/lib/services/admin";
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Truck,
  ShieldCheck,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  "pending":    { color: "bg-zinc-100 text-zinc-600 border-zinc-200",    icon: <Clock className="w-4 h-4" />, label: "Pending Verification" },
  "paid":       { color: "bg-blue-50 text-blue-600 border-blue-100",     icon: <CheckCircle2 className="w-4 h-4" />, label: "Payment Confirmed" },
  "processing": { color: "bg-amber-50 text-amber-600 border-amber-100",  icon: <Package className="w-4 h-4" />, label: "In Preparation" },
  "shipped":    { color: "bg-purple-50 text-purple-600 border-purple-100", icon: <Truck className="w-4 h-4" />, label: "In Transit" },
  "delivered":  { color: "bg-green-50 text-green-600 border-green-100",  icon: <CheckCircle2 className="w-4 h-4" />, label: "Delivered" },
  "cancelled":  { color: "bg-red-50 text-red-600 border-red-100",        icon: <Package className="w-4 h-4" />, label: "Cancelled" },
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      setIsLoading(true);
      try {
        // Fetch Order
        const orderRef = doc(db, "orders", id as string);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          // Security check: only owner or admin can see
          if (orderData.userId !== user.uid) {
            router.push("/profile");
            return;
          }
          setOrder(orderData);
        }

        // Fetch Products for images
        const prodData = await getProducts();
        const prodMap: Record<string, Product> = {};
        prodData.forEach(p => {
          if (p.id) prodMap[p.id] = p;
        });
        setProducts(prodMap);
      } catch (err) {
        console.error("Order fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, id, router]);

  const generateInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PMU SUPPLY", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Premium PMU Tools & Equipment", 20, 32);
    
    // Invoice Info
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 140, 25);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Reference: ${order.id}`, 140, 32);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 37);
    
    doc.line(20, 45, 190, 45);
    
    // Billing Info
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 20, 62);
    doc.text(order.shippingAddress.address, 20, 67);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.zipCode}`, 20, 72);
    doc.text(order.shippingAddress.country, 20, 77);
    
    // Items Header
    let y = 95;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 7, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Item Description", 25, y);
    doc.text("Qty", 120, y);
    doc.text("Price", 145, y);
    doc.text("Total", 170, y);
    
    y += 15;
    doc.setFont("helvetica", "normal");
    
    order.items.forEach(item => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(item.productName, 25, y, { maxWidth: 90 });
      doc.text(item.quantity.toString(), 122, y);
      doc.text(`₹${item.priceAtPurchase.toFixed(2)}`, 145, y);
      doc.text(`₹${(item.priceAtPurchase * item.quantity).toFixed(2)}`, 170, y);
      y += 10;
    });
    
    doc.line(20, y, 190, y);
    y += 10;
    
    // Totals
    const rightAlign = 190;
    doc.text("Subtotal:", 140, y);
    doc.text(`₹${order.subtotal?.toFixed(2)}`, rightAlign, y, { align: "right" });
    y += 7;
    
    doc.text("Shipping:", 140, y);
    doc.text(`₹${order.shippingAmount?.toFixed(2)}`, rightAlign, y, { align: "right" });
    y += 7;
    
    doc.text("Tax (GST):", 140, y);
    doc.text(`₹${order.taxAmount?.toFixed(2)}`, rightAlign, y, { align: "right" });
    y += 7;
    
    if (order.discountAmount > 0) {
      doc.setTextColor(34, 197, 94); // Green
      doc.text("Discounts:", 140, y);
      doc.text(`-₹${order.discountAmount?.toFixed(2)}`, rightAlign, y, { align: "right" });
      doc.setTextColor(0, 0, 0);
      y += 7;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 140, y + 5);
    doc.text(`₹${order.total?.toFixed(2)}`, rightAlign, y + 5, { align: "right" });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for choosing PMU SUPPLY. Your artistry is our priority.", 105, 285, { align: "center" });
    
    doc.save(`Invoice_${order.id}.pdf`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto mb-4" />
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">Loading Audit Data...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-heading mb-4">Order Not Found</h1>
          <Link href="/profile">
            <Button variant="outline" className="rounded-full px-8">Return to Profile</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 hover:text-brand-gold transition-colors uppercase mb-8">
          <ChevronLeft className="w-3 h-3" /> Back to History
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <h1 className="text-4xl font-heading italic">Order Audit</h1>
               <Badge className={`rounded-full px-4 py-1.5 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest border ${STATUS_CONFIG[order.status]?.color}`}>
                  {STATUS_CONFIG[order.status]?.icon}
                  {STATUS_CONFIG[order.status]?.label}
               </Badge>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
              REFERENCE: <span className="text-zinc-900">{order.id}</span> • {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={generateInvoice}
            className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest gap-2"
          >
            <Receipt className="w-3 h-3" /> Download Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
              <div className="p-8 border-b border-zinc-50">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-3">
                  <Package className="w-4 h-4 text-brand-gold" /> Manifest Items
                </h2>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-50">
                  {order.items.map((item, idx) => {
                    const product = products[item.productId];
                    return (
                      <div key={idx} className="p-8 flex items-center gap-6 group">
                        <div className="w-20 h-20 rounded-3xl bg-zinc-50 border border-zinc-100 overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105 duration-500">
                          {product?.imageUrls?.[0] ? (
                            <img src={product.imageUrls[0]} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-300 font-bold uppercase">PMU</div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{product?.category || "Professional Grade"}</p>
                          <h3 className="text-sm font-bold text-zinc-900 group-hover:text-brand-gold transition-colors">{item.productName}</h3>
                          <p className="text-xs text-zinc-400 font-light italic">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-zinc-900">₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">₹{item.priceAtPurchase} per unit</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Logistics Info (Address) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[2rem] border-zinc-100 shadow-sm bg-white p-8 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Shipping Logistics
                </h3>
                <div className="space-y-4">
                   <div className="space-y-1">
                     <p className="text-xs font-bold text-zinc-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                     <p className="text-xs text-zinc-500 font-light leading-relaxed">
                       {order.shippingAddress.address}<br />
                       {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                       {order.shippingAddress.country}
                     </p>
                   </div>
                   <div className="pt-2">
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Connect</p>
                     <p className="text-xs font-medium text-zinc-800">{order.shippingAddress.email}</p>
                     {order.shippingAddress.phone && <p className="text-xs font-medium text-zinc-800">{order.shippingAddress.phone}</p>}
                   </div>
                </div>
              </Card>

              <Card className="rounded-[2rem] border-zinc-100 shadow-sm bg-white p-8 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Payment Intelligence
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Method</span>
                      <span className="text-xs font-black text-brand-gold uppercase tracking-tighter">Razorpay</span>
                   </div>
                   <div className="space-y-1 ml-1">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Gateway Reference</p>
                      <p className="text-[11px] font-mono font-medium text-zinc-800 truncate">{order.razorpayOrderId}</p>
                   </div>
                   <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Securely Processed</span>
                   </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar: Financial Summary */}
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm bg-brand-black text-white overflow-hidden sticky top-8">
              <div className="p-8 border-b border-white/10">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-gold">Financial Summary</h3>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-light">Subtotal</span>
                    <span className="font-bold font-mono">₹{order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-light">Professional Shipping</span>
                    <span className="font-bold font-mono">₹{order.shippingAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-light">Tax (GST)</span>
                    <span className="font-bold font-mono">₹{order.taxAmount?.toFixed(2)}</span>
                  </div>
                  {(order.discountAmount > 0 || (order.couponDiscountAmount || 0) > 0) && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span className="font-light">Applied Incentives</span>
                      <span className="font-bold font-mono">-₹{(order.discountAmount + (order.couponDiscountAmount || 0)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-sm font-bold tracking-widest uppercase">Total Investment</span>
                  <span className="text-3xl font-heading text-brand-gold">₹{order.total?.toFixed(2)}</span>
                </div>

                <div className="pt-8">
                   <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Loyalty Impact</p>
                      <p className="text-xs text-zinc-300 font-light leading-relaxed">
                        This order accrued <span className="text-brand-gold font-bold">{Math.floor(order.total || 0)} Beauty Points</span> for your future inventory.
                      </p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}
