"use client";

import { useState, useEffect } from "react";
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
  Percent,
  ChevronDown,
  Calendar
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  getReferralSettings, 
  updateReferralSettings, 
  getReferralAuditData, 
  DEFAULT_REFERRAL_SETTINGS 
} from "@/lib/services/admin";
import { ReferralSettings } from "@/lib/types";

export default function AdminReferralsPage() {
  const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_REFERRAL_SETTINGS);
  const [networkData, setNetworkData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, n] = await Promise.all([
          getReferralSettings(),
          getReferralAuditData()
        ]);
        setSettings(s);
        setNetworkData(n);
      } catch (error) {
        console.error("Failed to fetch referral data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateSettings = async () => {
    setIsSaving(true);
    try {
      await updateReferralSettings(settings);
      toast.success("Referral Algorithm committed to cloud.");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const totalRevenueMock = networkData.reduce((acc, curr) => acc + curr.earnings, 0);
  const avgConversion = networkData.length > 0 
    ? (networkData.reduce((acc, curr) => acc + (curr.conversionCount / Math.max(1, curr.referralCount)), 0) / networkData.length * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-normal">Referral Network</h1>
          <p className="text-zinc-500 text-sm mt-1">Audit and optimize your peer-to-peer growth architecture.</p>
        </div>
        <Badge variant="outline" className="rounded-full px-4 py-1.5 border-brand-gold/20 text-brand-gold bg-brand-gold/5 text-[10px] font-bold tracking-widest uppercase">
          Live Algorithm Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
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
                   {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div></TableCell></TableRow>
                   ) : networkData.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="py-20 text-center text-zinc-400 italic">No referral activity recorded yet.</TableCell></TableRow>
                   ) : networkData.map((ref) => (
                     <TableRow key={ref.uid} className="hover:bg-zinc-50/50 transition-colors group">
                       <TableCell className="px-8">
                         <div className="flex flex-col text-left">
                           <span className="text-xs font-bold text-zinc-900">{ref.displayName}</span>
                           <span className="text-[11px] font-black text-brand-gold tracking-widest uppercase">{ref.referralCode}</span>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-zinc-400 uppercase">Refered</span>
                               <span className="text-xs font-bold">{ref.referralCount}</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-zinc-400 uppercase">Conv.</span>
                               <span className="text-xs font-black text-emerald-500">{ref.conversionCount}</span>
                            </div>
                         </div>
                       </TableCell>
                       <TableCell className="text-xs font-black text-zinc-900">
                          {ref.earnings.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">pts</span>
                       </TableCell>
                       <TableCell>
                         <Badge className={`rounded-full px-3 py-1 font-bold text-[9px] uppercase tracking-tighter border ${ref.status === 'elite' ? 'bg-brand-rose/10 text-brand-gold border-brand-rose/30' : ref.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-zinc-100 text-zinc-400 border-zinc-200'}`}>
                           {ref.status}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right px-8">
                          <Dialog>
                            <DialogTrigger render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 text-zinc-400" onClick={() => setSelectedReferrer(ref)}>
                                 <ChevronRight className="w-4 h-4" />
                              </Button>
                            } />
                            {selectedReferrer?.uid === ref.uid && (
                              <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-10">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-heading">Referral Audit: {ref.displayName}</DialogTitle>
                                  <DialogDescription className="text-xs font-bold tracking-widest uppercase text-brand-gold">Network Code: {ref.referralCode}</DialogDescription>
                                </DialogHeader>
                                <div className="mt-8 space-y-4">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Referred Artist</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Joined</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {ref.referrals.map((sub: any) => (
                                        <TableRow key={sub.uid}>
                                          <TableCell className="text-xs font-bold">{sub.displayName}</TableCell>
                                          <TableCell className="text-xs text-zinc-500">
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
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
                        <Award className="w-3 h-3" /> Referrer Bounty (Pts)
                      </Label>
                      <div className="relative">
                         <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
                         <Input 
                            type="number"
                            value={settings.referrerRewardPoints} 
                            onChange={(e) => setSettings({...settings, referrerRewardPoints: parseInt(e.target.value)})}
                            className="pl-10 rounded-2xl h-11 bg-zinc-50 border-zinc-100 font-bold" 
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2 ml-1">
                        <Share2 className="w-3 h-3" /> Referee Discount (%)
                      </Label>
                      <div className="relative">
                         <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
                         <Input 
                            type="number"
                            value={settings.refereeDiscountPercentage} 
                            onChange={(e) => setSettings({...settings, refereeDiscountPercentage: parseInt(e.target.value)})}
                            className="pl-10 rounded-2xl h-11 bg-zinc-50 border-zinc-100 font-bold" 
                         />
                      </div>
                   </div>
                   <div className="space-y-4 pt-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 block ml-1">Eligibility Scope</Label>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setSettings({...settings, referralRequirement: 'first_purchase'})}
                          className={`px-4 py-3 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all ${settings.referralRequirement === 'first_purchase' ? 'border-brand-gold bg-brand-gold/5 text-brand-gold' : 'border-zinc-100 text-zinc-400'}`}
                        >
                          First Purchase Only
                        </button>
                        <button 
                          onClick={() => setSettings({...settings, referralRequirement: 'every_purchase'})}
                          className={`px-4 py-3 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all ${settings.referralRequirement === 'every_purchase' ? 'border-brand-gold bg-brand-gold/5 text-brand-gold' : 'border-zinc-100 text-zinc-400'}`}
                        >
                          Every Purchase
                        </button>
                      </div>
                   </div>
                </div>
                <Button 
                  className="w-full h-11 rounded-2xl bg-zinc-950 text-white font-bold text-[10px] uppercase tracking-widest disabled:opacity-50" 
                  onClick={handleUpdateSettings}
                  disabled={isSaving}
                >
                   {isSaving ? "SYNCING..." : "COMMIT ALGORITHM"}
                </Button>
             </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4">
             <SummaryTile label="Network Conversion" value={`${avgConversion}%`} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
             <SummaryTile label="Referral Payouts" value={`${totalRevenueMock.toLocaleString()} pts`} icon={<Share2 className="w-4 h-4 text-brand-gold" />} />
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
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-left">{label}</p>
          <div className="text-xl font-black text-zinc-900 group-hover:text-brand-gold transition-colors text-left">{value}</div>
       </div>
       <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center transition-all group-hover:bg-zinc-100 shrink-0">
          {icon}
       </div>
    </Card>
  );
}
