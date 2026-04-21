"use client";

import { useState } from "react";
import { 
  Users, 
  Target, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  Search, 
  Settings2,
  Share2,
  ExternalLink,
  DollarSign,
  Percent
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Mock Referral Data
const REFERRALS = [
  { id: "1", agent: "Sarah Johnson", code: "SARAH50", refered: 12, converted: 8, earnings: "₹4,500", status: "Active" },
  { id: "2", agent: "Michael Chen", code: "MCHEN10", refered: 45, converted: 22, earnings: "₹18,200", status: "Elite" },
  { id: "3", agent: "Elena Rodriguez", code: "ELENA-MK", refered: 5, converted: 1, earnings: "₹500", status: "Active" },
  { id: "4", agent: "Liam Smith", code: "LIAM-ART", refered: 0, converted: 0, earnings: "₹0", status: "Inactive" },
];

export default function AdminReferralsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-normal">Referral Network</h1>
          <p className="text-zinc-500 text-sm mt-1">Audit and optimize your peer-to-peer growth architecture.</p>
        </div>
        <Button className="bg-brand-gold hover:bg-brand-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 gap-2">
           <Settings2 className="w-3 h-3" /> Global Rules
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Main Network Table */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800">Growth Agents</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-zinc-50/50">
                   <TableRow>
                     <TableHead className="px-8 text-[10px] font-bold uppercase tracking-widest">Agent Identity</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest">Network</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest">Earnings</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                     <TableHead className="text-right px-8 text-[10px] font-bold uppercase tracking-widest">Audit</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {REFERRALS.map((ref) => (
                     <TableRow key={ref.id} className="hover:bg-zinc-50/50 transition-colors group">
                       <TableCell className="px-8">
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-zinc-900">{ref.agent}</span>
                           <span className="text-[11px] font-black text-brand-gold tracking-widest uppercase">{ref.code}</span>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-zinc-400 uppercase">Refered</span>
                               <span className="text-xs font-bold">{ref.refered}</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-zinc-400 uppercase">Conv.</span>
                               <span className="text-xs font-black text-emerald-500">{ref.converted}</span>
                            </div>
                         </div>
                       </TableCell>
                       <TableCell className="text-xs font-black text-zinc-900">{ref.earnings}</TableCell>
                       <TableCell>
                         <Badge className={`rounded-full px-3 py-1 font-bold text-[9px] uppercase tracking-tighter border ${ref.status === 'Elite' ? 'bg-brand-rose/10 text-brand-gold border-brand-rose/30' : ref.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-zinc-100 text-zinc-400 border-zinc-200'}`}>
                           {ref.status}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right px-8">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-400">
                             <ChevronRight className="w-4 h-4" />
                          </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Rules Configuration */}
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-800 flex items-center gap-2">
                   <Target className="w-4 h-4 text-brand-gold" /> Reward Logic
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2 ml-1">
                        <Award className="w-3 h-3" /> Referrer Bounty
                      </Label>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
                         <Input defaultValue="500" className="pl-8 rounded-2xl h-11 bg-zinc-50 border-zinc-100 font-bold" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2 ml-1">
                        <Share2 className="w-3 h-3" /> Referee Discount
                      </Label>
                      <div className="relative">
                         <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
                         <Input defaultValue="10" className="pl-8 rounded-2xl h-11 bg-zinc-50 border-zinc-100 font-bold" />
                      </div>
                   </div>
                </div>
                <Button className="w-full h-11 rounded-2xl bg-zinc-950 text-white font-bold text-[10px] uppercase tracking-widest" onClick={() => toast.success("Rules Updated Globally")}>
                   Commit Algorithm
                </Button>
             </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4">
             <SummaryTile label="Network Conversion" value="68.4%" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
             <SummaryTile label="Referral Revenue" value="₹2.45M" icon={<Share2 className="w-4 h-4 text-brand-gold" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, icon }: any) {
  return (
    <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white hover:border-zinc-200 transition-colors p-6 flex justify-between items-center group">
       <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-zinc-900 group-hover:text-brand-gold transition-colors">{value}</p>
       </div>
       <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center transition-all group-hover:bg-zinc-100">
          {icon}
       </div>
    </Card>
  );
}
