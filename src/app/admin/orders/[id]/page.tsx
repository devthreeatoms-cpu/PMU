"use client";

import { useState, useEffect, use } from "react";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  CreditCard, 
  Truck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  ChevronRight,
  Package,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import jsPDF from "jspdf";
import { getOrderByIdAction, updateOrderStatusAction } from "../actions";
import { Order } from "@/lib/types";
import { toast } from "sonner";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderByIdAction(id);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          toast.error(res.error || "Order not found");
        }
      } catch (err) {
        toast.error("Failed to fetch order details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus: Order["status"]) => {
    try {
      const res = await updateOrderStatusAction(id, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const generateInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("PMU SUPPLY USA", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice for ${order.id}`, 20, 30);
    doc.text(`Customer: ${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`, 20, 40);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 20, 50);
    doc.line(20, 55, 190, 55);
    
    let y = 65;
    order.items?.forEach(item => {
      doc.text(`${item.productName} x ${item.quantity}`, 20, y);
      doc.text(`$${(item.priceAtPurchase * item.quantity).toFixed(2)}`, 160, y);
      y += 10;
    });
    
    doc.line(20, y, 190, y);
    doc.text(`Total Paid: $${(order.total || 0).toFixed(2)}`, 140, y + 10);
    
    doc.save(`Invoice_${order.id}.pdf`);
  };

  if (isLoading) return (
    <div className="py-40 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto" />
      <p className="mt-4 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Retrieving secure order data...</p>
    </div>
  );

  if (!order) return (
    <div className="py-40 text-center">
      <p className="text-zinc-500 font-heading text-xl">Order Not Found</p>
      <Link href="/admin/orders" className="text-brand-gold underline mt-4 block">Return to Order Management</Link>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-4">
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-brand-gold transition-colors tracking-widest uppercase">
            <ArrowLeft className="w-3 h-3" /> Back to Orders
          </Link>
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <h1 className="text-3xl font-heading font-normal">{order.id}</h1>
               <Badge className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-tighter border ${
                 order.status === 'paid' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
               }`}>
                  {order.status}
               </Badge>
             </div>
             <p className="text-xs text-zinc-400 font-light italic">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={generateInvoice} className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2">
            <Download className="w-3 h-3" /> Generate PDF
          </Button>
          <Button variant="outline" className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2">
            <Printer className="w-3 h-3" /> Print Invoice
          </Button>
          <Button 
            onClick={() => handleUpdateStatus('shipped')}
            disabled={order.status === 'shipped' || order.status === 'delivered'}
            className="bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8"
          >
            {order.status === 'shipped' ? 'Shipped' : 'Ship Pack'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-zinc-50 bg-zinc-50/30">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800">Purchased Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-50">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-6 p-8 group">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0">
                      {/* item.image might not be in the type, checking... if not, use placeholder */}
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                        <Package className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                       <h4 className="text-sm font-bold text-zinc-900">{item.productName}</h4>
                       <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">{item.variantName || 'Standard'}</p>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                       <div className="space-y-1 text-center">
                          <p className="text-[10px] text-zinc-400 uppercase font-black">Price</p>
                          <p className="text-xs font-bold text-zinc-900">${item.priceAtPurchase.toFixed(2)}</p>
                       </div>
                       <div className="space-y-1 text-center">
                          <p className="text-[10px] text-zinc-400 uppercase font-black">Qty</p>
                          <p className="text-xs font-bold text-zinc-900">{item.quantity}</p>
                       </div>
                       <div className="space-y-1 text-right">
                          <p className="text-[10px] text-zinc-400 uppercase font-black">Total</p>
                          <p className="text-xs font-black text-brand-gold">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-50/50 p-10 flex flex-col items-end space-y-3">
                 <div className="flex justify-between w-64 text-xs">
                    <span className="text-zinc-400 font-medium tracking-wide uppercase">Subtotal</span>
                    <span className="font-bold text-zinc-900">${(order.total + (order.discountAmount || 0)).toFixed(2)}</span>
                 </div>
                 {order.couponCode && (
                   <div className="flex justify-between w-64 text-xs">
                      <span className="text-zinc-400 font-medium tracking-wide uppercase">Coupon ({order.couponCode})</span>
                      <span className="font-bold text-green-500">-${(order.couponDiscountAmount || 0).toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between w-64 text-xs">
                    <span className="text-zinc-400 font-medium tracking-wide uppercase">Shipping</span>
                    <span className="font-bold text-zinc-900">$0.00</span>
                 </div>
                 <div className="flex justify-between w-64 pt-4 border-t border-zinc-200 text-lg">
                    <span className="font-heading tracking-wider uppercase text-zinc-800">Total Price</span>
                    <span className="font-black text-brand-black">${(order.total || 0).toFixed(2)}</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Feed */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
             <CardHeader className="p-8 pb-0">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800 flex items-center gap-2">
                 <Clock className="w-4 h-4 text-zinc-400" /> Fulfillment Timeline
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-100">
                   <div className="flex gap-6 relative pl-8">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-brand-gold bg-white flex items-center justify-center z-10">
                         <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-4">
                            <p className="text-xs font-bold text-zinc-900">Current Status: {order.status}</p>
                            <span className="text-[10px] text-zinc-400 font-mono">Just now</span>
                         </div>
                         <p className="text-[11px] text-zinc-500 font-light">System record updated.</p>
                      </div>
                   </div>
                   <div className="flex gap-6 relative pl-8">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-zinc-200 bg-white flex items-center justify-center z-10">
                         <div className="w-2 h-2 rounded-full bg-zinc-200" />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-4">
                            <p className="text-xs font-bold text-zinc-900">Order Placed</p>
                            <span className="text-[10px] text-zinc-400 font-mono">{new Date(order.createdAt).toLocaleString()}</span>
                         </div>
                         <p className="text-[11px] text-zinc-500 font-light">Customer initiated purchase.</p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Customer Insights */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-zinc-50 pb-6">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800 flex items-center gap-2">
                 <User className="w-4 h-4 text-zinc-400" /> Customer Data
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-brand-rose/20 flex items-center justify-center text-xl font-heading text-brand-black border border-brand-rose/30">
                     {order.shippingAddress?.firstName?.[0]}{order.shippingAddress?.lastName?.[0]}
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm font-bold text-zinc-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                     <Badge className="bg-zinc-900 text-white rounded-full text-[8px] font-black uppercase tracking-widest px-2">
                       Active User
                     </Badge>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Private Email
                    </p>
                    <p className="text-xs font-medium text-zinc-800 cursor-pointer hover:text-brand-gold transition-colors">{order.shippingAddress?.email || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Contact Number
                    </p>
                    <p className="text-xs font-medium text-zinc-800">{order.shippingAddress?.phone || 'Not Provided'}</p>
                  </div>
               </div>

               <div className="pt-6 border-t border-zinc-100 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Merchant UID</span>
                  <span className="text-zinc-800 truncate w-32 text-right">{order.userId}</span>
               </div>
            </CardContent>
          </Card>

          {/* Shipping Logistics */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-zinc-50 pb-6">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800 flex items-center gap-2">
                 <Truck className="w-4 h-4 text-zinc-400" /> Artistry Logistics
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Shipping Destination
                  </p>
                  <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                     {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                  </p>
               </div>
            </CardContent>
          </Card>

          {/* Secure Payment */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-zinc-50 pb-6">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Payment
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                     <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Razorpay</p>
                    <p className="text-[10px] text-zinc-400 font-mono tracking-tighter truncate w-[150px]">{order.razorpayPaymentId || order.razorpayOrderId}</p>
                  </div>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Merchant Status</span>
                  <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-black">{order.status === 'paid' ? 'Authorized' : order.status}</span>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

