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
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Play,
  Check
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
// jsPDF and autoTable are loaded dynamically on demand — see generateInvoice()
import { getOrderByIdAction, updateOrderStatusAction } from "../actions";
import { Order } from "@/lib/types";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  "pending": { label: "Pending", color: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: <Clock className="w-3 h-3" /> },
  "paid": { label: "Paid", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <CheckCircle2 className="w-3 h-3" /> },
  "processing": { label: "Processing", color: "bg-blue-50 text-blue-600 border-blue-100", icon: <Play className="w-3 h-3" /> },
  "shipped": { label: "Shipped", color: "bg-brand-gold/10 text-brand-gold border-brand-gold/20", icon: <Truck className="w-3 h-3" /> },
  "delivered": { label: "Delivered", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <Check className="w-3 h-3" /> },
  "cancelled": { label: "Cancelled", color: "bg-red-50 text-red-600 border-red-100", icon: <AlertCircle className="w-3 h-3" /> },
};

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

  const generateInvoice = async () => {
    if (!order) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    
    // -- 1. Header Section --
    // Brand Logo/Name
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("PMU SUPPLY", 15, 25);
    
    // Invoice Metadata (Right Aligned)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("INVOICE", 195, 20, { align: "right" });
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text(`#${order.id}`, 195, 26, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 195, 32, { align: "right" });
    
    // Horizontal Line
    doc.setDrawColor(240, 240, 240);
    doc.line(15, 45, 195, 45);
    
    // -- 2. Customer Section --
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 150, 150);
    doc.text("BILL TO:", 15, 55);
    
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.text(`${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`, 15, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const addressLines = [
      order.shippingAddress?.address || "",
      `${order.shippingAddress?.city}, ${order.shippingAddress?.zipCode}`,
      order.shippingAddress?.country || "",
      `Phone: ${order.shippingAddress?.phone || 'N/A'}`
    ];
    doc.text(addressLines, 15, 68);
    
    // Payment Status Badge
    doc.setFillColor(240, 250, 245); // Light green
    doc.roundedRect(155, 50, 40, 10, 2, 2, "F");
    doc.setTextColor(34, 197, 94); // Emerald 600
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT PAID", 175, 56.5, { align: "center" });

    // -- 3. Items Table --
    const tableRows = (order.items || []).map(item => [
      { content: item.productName, styles: { fontStyle: "bold" as const } },
      item.variantName || "Standard",
      `₹${item.priceAtPurchase.toFixed(2)}`,
      item.quantity.toString(),
      `₹${(item.priceAtPurchase * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [["Item Description", "Variant", "Price", "Qty", "Amount"]],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
        halign: "left"
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60]
      },
      columnStyles: {
        4: { halign: "right", fontStyle: "bold" }
      },
      margin: { left: 15, right: 15 }
    });

    // -- 4. Summary Section --
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    
    // Subtotal
    const subtotal = order.total + (order.discountAmount || 0);
    doc.text("Subtotal", 140, finalY);
    doc.setTextColor(40, 40, 40);
    doc.text(`₹${subtotal.toFixed(2)}`, 195, finalY, { align: "right" });
    
    // Discount
    if (order.couponCode) {
      doc.setTextColor(100, 100, 100);
      doc.text(`Discount (${order.couponCode})`, 140, finalY + 7);
      doc.setTextColor(34, 197, 94);
      doc.text(`-₹${(order.couponDiscountAmount || 0).toFixed(2)}`, 195, finalY + 7, { align: "right" });
    }
    
    // Shipping
    doc.setTextColor(100, 100, 100);
    doc.text("Shipping", 140, finalY + 14);
    doc.setTextColor(40, 40, 40);
    doc.text("₹0.00", 195, finalY + 14, { align: "right" });
    
    // Grand Total
    doc.setFillColor(20, 20, 20);
    doc.rect(135, finalY + 20, 60, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL", 140, finalY + 27.5);
    doc.text(`₹${(order.total || 0).toFixed(2)}`, 195, finalY + 27.5, { align: "right" });

    // -- 5. Footer --
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your purchase from PMU SUPPLY.", 105, 280, { align: "center" });
    doc.text("For professional support, contact help@pmusupply.com", 105, 285, { align: "center" });

    doc.save(`Invoice_${order.id}.pdf`);
  };

  const printInvoice = () => {
    window.print();
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 print:p-0 print:m-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="flex flex-col gap-4">
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-brand-gold transition-colors tracking-widest uppercase">
            <ArrowLeft className="w-3 h-3" /> Back to Orders
          </Link>
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <h1 className="text-3xl font-heading font-normal">{order.id}</h1>
               <div className={`rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest border flex items-center gap-2 ${STATUS_CONFIG[order.status]?.color}`}>
                  {STATUS_CONFIG[order.status]?.icon}
                  {order.status}
               </div>
             </div>
             <p className="text-xs text-zinc-400 font-light italic">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={generateInvoice} className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2">
            <Download className="w-3 h-3" /> Generate PDF
          </Button>
          <Button variant="outline" onClick={printInvoice} className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2">
            <Printer className="w-3 h-3" /> Print Invoice
          </Button>
          <Select
            value={order.status}
            onValueChange={(val) => handleUpdateStatus(val as Order["status"])}
          >
            <SelectTrigger className={`rounded-full h-10 px-8 text-[10px] font-bold tracking-widest uppercase gap-3 border shadow-sm w-[180px] ${
              (order.status === 'paid' || order.status === 'processing') ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-900 border-zinc-200'
            }`}>
              <div className="flex items-center gap-2">
                {STATUS_CONFIG[order.status]?.icon}
                <SelectValue placeholder="Update Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl p-1">
              {Object.keys(STATUS_CONFIG).map((s) => (
                <SelectItem 
                  key={s} 
                  value={s}
                  className="text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3 py-1">
                    {STATUS_CONFIG[s].icon}
                    {STATUS_CONFIG[s].label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Content */}
          <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-zinc-50 bg-zinc-50/30">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Order Manifest</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-50">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 hover:bg-zinc-50/50 transition-colors">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0">
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                        <Package className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-bold text-zinc-900 truncate">{item.productName}</h4>
                       <p className="text-[9px] text-zinc-400 font-mono tracking-wider uppercase mt-0.5">{item.variantName || 'Standard'}</p>
                    </div>
                    <div className="text-right flex gap-6 items-center">
                       <div className="hidden sm:block">
                          <p className="text-[9px] text-zinc-400 uppercase font-bold">Qty</p>
                          <p className="text-[11px] font-bold text-zinc-900">{item.quantity}</p>
                       </div>
                       <div className="w-24">
                          <p className="text-[9px] text-zinc-400 uppercase font-bold">Total</p>
                          <p className="text-[11px] font-black text-brand-gold">₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pricing Breakdown */}
              <div className="bg-zinc-50/50 p-6 border-t border-zinc-100">
                 <div className="max-w-[280px] ml-auto space-y-2">
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-zinc-400 uppercase">Subtotal</span>
                      <span className="text-zinc-900">₹{(order.total + (order.discountAmount || 0)).toFixed(2)}</span>
                   </div>
                   {order.couponCode && (
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-400 uppercase">Coupon ({order.couponCode})</span>
                        <span className="text-green-500">-₹{(order.couponDiscountAmount || 0).toFixed(2)}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-zinc-400 uppercase">Shipping</span>
                      <span className="text-zinc-900">₹0.00</span>
                   </div>
                   <div className="flex justify-between pt-3 border-t border-zinc-200">
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-800">Total</span>
                      <span className="text-sm font-black text-brand-black">₹{(order.total || 0).toFixed(2)}</span>
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
             <CardHeader className="p-6 border-b border-zinc-50">
               <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5" /> Order Timeline
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                 <div className="space-y-8 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-100">
                    {/* Render History from DB */}
                    {order.history && order.history.length > 0 ? (
                      [...order.history].reverse().map((event: any, idx: number) => (
                        <div key={idx} className="flex gap-4 relative pl-6">
                           <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center z-10 ${idx === 0 ? 'border-brand-gold' : 'border-zinc-200'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-brand-gold' : 'bg-zinc-200'}`} />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[11px] font-bold text-zinc-900 capitalize">{event.status}</p>
                              <p className="text-[9px] text-zinc-400 font-mono">
                                {new Date(event.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-4 relative pl-6">
                        <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-brand-gold bg-white flex items-center justify-center z-10">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[11px] font-bold text-zinc-900">Order Placed</p>
                           <p className="text-[9px] text-zinc-400 font-mono">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                 </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Unified Customer & Logistics */}
          <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-zinc-50 pb-4">
               <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Logistics & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-sm font-heading text-zinc-400 border border-zinc-100">
                     {order.shippingAddress?.firstName?.[0]}{order.shippingAddress?.lastName?.[0]}
                  </div>
                  <div>
                     <p className="text-xs font-bold text-zinc-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                     <p className="text-[10px] text-zinc-400 truncate w-32">{order.shippingAddress?.email}</p>
                  </div>
               </div>
               
               <div className="space-y-4 pt-4 border-t border-zinc-50">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Delivery Address
                    </p>
                    <p className="text-[11px] font-medium text-zinc-800 leading-relaxed">
                       {order.shippingAddress?.address}<br/>
                       {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}<br/>
                       {order.shippingAddress?.country}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Contact
                    </p>
                    <p className="text-[11px] font-medium text-zinc-800">{order.shippingAddress?.phone || 'Not Provided'}</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Secure Transaction */}
          <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-zinc-50 pb-4">
               <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Transaction Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] font-bold text-zinc-900">Razorpay</span>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-black uppercase px-2 rounded-full">Authorized</Badge>
               </div>
               <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-[9px] text-zinc-400 font-mono break-all leading-tight">
                    {order.razorpayPaymentId || order.razorpayOrderId}
                  </p>
               </div>
               <div className="pt-2 flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Merchant ID</span>
                  <span className="text-zinc-800 truncate w-24 text-right font-mono">{order.userId}</span>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

