"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Truck,
  RotateCcw,
  Plus
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getOrdersAction, updateOrderStatusAction } from "./actions";
import { Order } from "@/lib/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  "pending":    { color: "bg-zinc-100 text-zinc-600 border-zinc-200",    icon: <Clock className="w-3 h-3" /> },
  "paid":       { color: "bg-blue-50 text-blue-600 border-blue-100",     icon: <CheckCircle2 className="w-3 h-3" /> },
  "processing": { color: "bg-amber-50 text-amber-600 border-amber-100",  icon: <Package className="w-3 h-3" /> },
  "shipped":    { color: "bg-purple-50 text-purple-600 border-purple-100", icon: <Truck className="w-3 h-3" /> },
  "delivered":  { color: "bg-green-50 text-green-600 border-green-100",  icon: <CheckCircle2 className="w-3 h-3" /> },
  "cancelled":  { color: "bg-red-50 text-red-600 border-red-100",        icon: <XCircle className="w-3 h-3" /> },
};

const VIEW_TABS = [
  { id: "recent", label: "Recent Orders" },
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("recent");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // For "recent", we fetch all and filter client-side for now to include multiple statuses
      const statusParam = (filterStatus === "all" || filterStatus === "recent") ? undefined : filterStatus;
      const res = await getOrdersAction(statusParam);
      
      if (res.success && res.orders) {
        let fetchedOrders = res.orders;
        
        if (filterStatus === "recent") {
          fetchedOrders = fetchedOrders.filter(o => 
            ["pending", "paid", "processing", "shipped"].includes(o.status)
          );
        }
        
        setOrders(fetchedOrders);
      } else {
        toast.error(res.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusUpdate = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await updateOrderStatusAction(orderId, status);
      if (res.success) {
        toast.success(`Order updated to "${status}"`);
        await fetchOrders();
      } else {
        toast.error(res.error || "Failed to update order status");
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const exportOrdersToCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Date", "Items", "Total", "Status"];
    const rows = filteredOrders.map(order => [
      order.id,
      order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : "Unknown",
      order.shippingAddress?.email || "N/A",
      new Date(order.createdAt).toLocaleDateString(),
      order.items?.length.toString() || "0",
      order.total?.toString() || "0",
      order.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pmu_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Order history exported.");
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(order =>
      order.id?.toLowerCase().includes(term) ||
      order.userId?.toLowerCase().includes(term) ||
      order.shippingAddress?.firstName?.toLowerCase().includes(term) ||
      order.shippingAddress?.lastName?.toLowerCase().includes(term) ||
      order.shippingAddress?.email?.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("recent");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-normal">Order Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Efficiently manage status, fulfillment, and customer inquiries.</p>
        </div>
        <div className="flex gap-2">
          {(searchTerm || filterStatus !== "all") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2 text-zinc-400 hover:text-zinc-600"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2 px-6"
            onClick={exportOrdersToCSV}
            disabled={filteredOrders.length === 0}
          >
            <Download className="w-3 h-3" /> Export List
          </Button>
          
          <Dialog>
            <DialogTrigger render={
              <Button size="sm" className="bg-brand-gold hover:bg-brand-gold/90 text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 flex gap-2">
                <Plus className="w-3 h-3" /> Create Manual Order
              </Button>
            } />
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading">Manual Order Entry</DialogTitle>
                <DialogDescription className="text-xs font-bold tracking-widest uppercase text-zinc-400">Initialize a custom merchant order for specialized fulfillment.</DialogDescription>
              </DialogHeader>
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto border border-zinc-100">
                  <Package className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-xs text-zinc-500 font-light max-w-[250px] mx-auto leading-relaxed italic">The Manual Order interface is currently being optimized for professional use. Please contact system support for priority entries.</p>
                <Button variant="outline" className="rounded-xl px-8 h-10 text-[10px] font-bold uppercase tracking-widest border-zinc-100">Contact Support</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Navigation Tabs */}
      <div className="flex border-b border-zinc-100 gap-8 overflow-x-auto no-scrollbar">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              filterStatus === tab.id 
                ? "text-brand-gold" 
                : "text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {tab.label}
            {filterStatus === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold animate-in fade-in slide-in-from-bottom-1" />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-50/50 border border-zinc-100 rounded-[2.5rem]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search by Order ID, customer, or email..." 
            className="pl-12 h-12 border-zinc-100 rounded-2xl focus:ring-brand-gold/10 focus:border-brand-gold/30 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead className="w-[160px] text-[10px] font-bold uppercase tracking-widest px-8">Order ID</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Items</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Total</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-24 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-24 text-center">
                    <p className="text-zinc-400 text-sm italic">
                      {orders.length === 0 ? "No orders have been placed yet." : "No matching orders found."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <TableCell className="px-8 font-mono text-[11px] font-bold text-zinc-400 group-hover:text-brand-gold transition-colors">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-900">
                          {order.shippingAddress 
                            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                            : order.userId}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-light">{order.shippingAddress?.city || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs">
                      {order.items?.length ?? 0}
                    </TableCell>
                    <TableCell className="text-xs font-black text-zinc-900">
                      ₹{order.total?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleStatusUpdate(order.id!, val as Order["status"])}
                      >
                        <SelectTrigger className={`h-8 rounded-full px-3 text-[9px] font-bold uppercase tracking-tighter border w-[120px] ${STATUS_CONFIG[order.status]?.color}`}>
                          <div className="flex items-center gap-1.5">
                            {STATUS_CONFIG[order.status]?.icon}
                            <SelectValue placeholder="Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-zinc-100 shadow-xl p-1">
                          {Object.keys(STATUS_CONFIG).map((s) => (
                            <SelectItem 
                              key={s} 
                              value={s}
                              className="text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-50 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                {STATUS_CONFIG[s].icon}
                                {s}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-brand-gold hover:text-white transition-all">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
