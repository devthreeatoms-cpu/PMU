"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Ticket, 
  Trash2, 
  Edit2, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Users,
  Target
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { getCouponsAction, createCouponAction, updateCouponAction, deleteCouponAction } from "./actions";
import { Coupon } from "@/lib/types";

function formatDateForInput(ms?: number) {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toISOString().split('T')[0];
}

const defaultCoupon: Partial<Coupon> = {
  code: "",
  type: "percentage",
  value: 0,
  minimumOrderValue: 0,
  isActive: true,
  description: "",
  usageLimit: undefined,
  expiryDate: undefined
};

function getCouponStatus(coupon: Coupon) {
  if (!coupon.isActive) return "Inactive";
  if (coupon.expiryDate && coupon.expiryDate < Date.now()) return "Expired";
  if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) return "Max Usage";
  return "Active";
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>(defaultCoupon);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCouponId(null);
    setNewCoupon(defaultCoupon);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCouponId(coupon.id!);
    setNewCoupon({
      ...coupon,
      expiryDate: formatDateForInput(coupon.expiryDate) as any
    });
    setIsCreateOpen(true);
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const result = await getCouponsAction();
        if (result.success) setCoupons(result.coupons as Coupon[]);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleLaunch = async () => {
    if (!newCoupon.code) return toast.error("Coupon code is required");
    try {
      const payload: any = { ...newCoupon };
      
      // Parse string date to timestamp or set default
      if (typeof payload.expiryDate === 'string' && payload.expiryDate) {
        payload.expiryDate = new Date(payload.expiryDate).getTime();
      } else if (!payload.expiryDate) {
        payload.expiryDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // Default 30 days
      }

      let result;
      if (editingCouponId) {
        result = await updateCouponAction(editingCouponId, payload);
      } else {
        result = await createCouponAction(payload);
      }
      if (!result.success) throw new Error(result.error);
      toast.success(editingCouponId ? "Coupon Updated" : "Coupon Created Successfully");
      setIsCreateOpen(false);
      // Refresh
      const data = await getCouponsAction();
      if (data.success) setCoupons(data.coupons as Coupon[]);
    } catch (error) {
      toast.error(editingCouponId ? "Failed to update coupon" : "Failed to create coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
       const result = await deleteCouponAction(id);
       if (!result.success) throw new Error(result.error);
       setCoupons(prev => prev.filter(c => c.id !== id));
       toast.success("Coupon Deleted");
    } catch (error) {
       toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-normal">Promotion Studio</h1>
          <p className="text-zinc-500 text-sm mt-1">Design and launch high-conversion coupon campaigns.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-brand-gold hover:bg-brand-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 gap-2">
          <Plus className="w-3 h-3" /> Create Campaign
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[850px] max-h-[95vh] overflow-y-auto rounded-[2.5rem] p-8 sm:p-10 border-none shadow-2xl flex flex-col">
            <DialogHeader className="space-y-2 flex-shrink-0">
              <DialogTitle className="text-2xl font-heading">{editingCouponId ? 'Edit Campaign' : 'New Coupon Strategy'}</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest font-bold text-zinc-400"> Configure rules for your promotional broadcast </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-8 py-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Universal Code</Label>
                    <Input 
                      placeholder="e.g. SUMMER25" 
                      className="rounded-2xl h-12 bg-zinc-50 border-zinc-100" 
                      value={newCoupon.code}
                      onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Discount Type</Label>
                    <Select defaultValue="percentage" onValueChange={v => setNewCoupon({...newCoupon, type: v as any})}>
                      <SelectTrigger className="rounded-2xl h-12 bg-zinc-50 border-zinc-100">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Discount Value</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="rounded-2xl h-12 bg-zinc-50 border-zinc-100" 
                      value={newCoupon.value || ""}
                      onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Min Order Value</Label>
                    <Input 
                      type="number" 
                      placeholder="₹0" 
                      className="rounded-2xl h-12 bg-zinc-50 border-zinc-100" 
                      value={newCoupon.minimumOrderValue || ""}
                      onChange={e => setNewCoupon({...newCoupon, minimumOrderValue: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Usage Limit</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 100 (Leave blank for ∞)" 
                      className="rounded-2xl h-12 bg-zinc-50 border-zinc-100" 
                      value={newCoupon.usageLimit || ""}
                      onChange={e => setNewCoupon({...newCoupon, usageLimit: Number(e.target.value) || undefined})}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Expiration Date</Label>
                    <Input 
                      type="date"
                      className="rounded-2xl h-12 bg-zinc-50 border-zinc-100" 
                      value={(newCoupon.expiryDate as any) || ""}
                      onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value as any})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Target Segments</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="rounded-2xl h-12 bg-zinc-50 border-zinc-100">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Verified Users</SelectItem>
                      <SelectItem value="new">First Time Buyers Only</SelectItem>
                      <SelectItem value="loyal">VIP Loyalty Tier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Scrolling Announcement / Description</Label>
                  <Input 
                    placeholder="e.g. Get 20% off all Mosha templates today!" 
                    className="rounded-2xl h-12 bg-zinc-50 border-zinc-100" 
                    value={newCoupon.description || ""}
                    onChange={e => setNewCoupon({...newCoupon, description: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-zinc-50">
               <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-full text-[10px] font-black uppercase tracking-widest">Cancel</Button>
               <Button className="bg-brand-gold text-white rounded-full text-[10px] font-black uppercase tracking-widest px-8" onClick={handleLaunch}>{editingCouponId ? 'Save Changes' : 'Launch Strategy'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsPreview 
           title="Active Codes" 
           value={coupons.filter(c => getCouponStatus(c) === "Active").length.toString()} 
           icon={<Ticket className="w-4 h-4" />} 
         />
         <StatsPreview 
           title="Total Created" 
           value={coupons.length.toString()} 
           icon={<Target className="w-4 h-4" />} 
         />
         <StatsPreview 
           title="Expired / Inactive" 
           value={coupons.filter(c => getCouponStatus(c) !== "Active").length.toString()} 
           icon={<AlertCircle className="w-4 h-4 text-brand-gold" />} 
         />
      </div>

      <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden mt-8">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead className="px-8 text-[10px] font-bold uppercase tracking-widest">Coupon Identity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Logic</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Usage Analytics</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Expiration</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Merchant Status</TableHead>
              <TableHead className="text-right px-8 text-[10px] font-bold uppercase tracking-widest">Audit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold" /></div>
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <p className="text-zinc-400 text-sm italic">No coupons created yet. Launch your first campaign!</p>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-brand-gold shadow-lg">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black tracking-widest text-zinc-900 group-hover:text-brand-gold transition-colors">{coupon.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{coupon.type}</span>
                      <span className="text-xs font-bold text-zinc-900">{coupon.type === 'free_shipping' ? 'Free Shipping' : coupon.type === 'flat' ? `₹${coupon.value}` : `${coupon.value}% OFF`}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32 space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase text-zinc-400">
                        <span>Redeemed</span>
                        <span className="text-zinc-800">{coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "∞"}</span>
                      </div>
                      <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold" style={{ width: coupon.usageLimit ? `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` : '0%' }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3 opacity-50" />
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "No Expiry"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const status = getCouponStatus(coupon);
                      return (
                        <Badge className={`rounded-full px-3 py-1 font-bold text-[9px] uppercase tracking-tighter border ${
                          status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          status === "Expired" ? "bg-red-50 text-red-600 border-red-100" :
                          status === "Max Usage" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-zinc-100 text-zinc-400 border-zinc-200"
                        }`}>
                          {status}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-400">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" onClick={() => handleOpenEdit(coupon)} size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-400">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(coupon.id!)} size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
}

function StatsPreview({ title, value, icon }: any) {
  return (
    <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white hover:border-brand-gold transition-colors group cursor-default">
       <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
             <p className="text-2xl font-black text-zinc-900 group-hover:text-brand-gold transition-colors">{value}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-brand-rose/20 group-hover:text-brand-black transition-all">
             {icon}
          </div>
       </CardContent>
    </Card>
  );
}
