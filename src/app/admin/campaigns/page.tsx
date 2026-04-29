"use client";

import { useState } from "react";
import { Mail, Send, Zap, Tag, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { sendSaleCampaignAction, sendFlashSaleCampaignAction } from "./actions";

export default function CampaignsPage() {
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"sale" | "flash">("sale");

  // Sale form state
  const [saleName, setSaleName] = useState("");
  const [saleDiscount, setSaleDiscount] = useState("");
  const [saleCode, setSaleCode] = useState("");

  // Flash sale form state
  const [flashDuration, setFlashDuration] = useState("");
  const [flashDiscount, setFlashDiscount] = useState("");

  const handleSendSale = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSendSale triggered", { saleName, saleDiscount, saleCode });
    if (!saleName || !saleDiscount) return toast.error("Please fill required fields");

    setIsSending(true);
    try {
      const result = await sendSaleCampaignAction(saleName, saleDiscount, saleCode);
      console.log("sendSaleCampaignAction result:", result);
      if (result.success) {
        toast.success("Sale campaign sent successfully to all users!");
        setSaleName("");
        setSaleDiscount("");
        setSaleCode("");
      } else {
        toast.error(result.error as string || "Failed to send campaign");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendFlash = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSendFlash triggered", { flashDuration, flashDiscount });
    if (!flashDuration || !flashDiscount) return toast.error("Please fill required fields");

    setIsSending(true);
    try {
      const result = await sendFlashSaleCampaignAction(flashDuration, flashDiscount);
      console.log("sendFlashSaleCampaignAction result:", result);
      if (result.success) {
        toast.success("Flash sale campaign sent successfully!");
        setFlashDuration("");
        setFlashDiscount("");
      } else {
        toast.error(result.error as string || "Failed to send campaign");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading italic text-zinc-900">Email Campaigns</h1>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-2">
          Reach your entire artist community
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar / Selector */}
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab("sale")}
            className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center gap-4 ${
              activeTab === "sale" 
                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-900/20 scale-[1.02]" 
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
            }`}
          >
            <div className={`p-3 rounded-2xl ${activeTab === "sale" ? "bg-zinc-800" : "bg-zinc-100 text-zinc-900"}`}>
              <Tag size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Seasonal Promotion</p>
              <h3 className="text-sm font-bold">Standard Sale</h3>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("flash")}
            className={`w-full p-6 rounded-3xl border transition-all text-left flex items-center gap-4 ${
              activeTab === "flash" 
                ? "bg-[#FF4D6D] border-[#FF4D6D] text-white shadow-xl shadow-rose-500/20 scale-[1.02]" 
                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
            }`}
          >
            <div className={`p-3 rounded-2xl ${activeTab === "flash" ? "bg-rose-600" : "bg-zinc-100 text-zinc-900"}`}>
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Time Sensitive</p>
              <h3 className="text-sm font-bold">Flash Sale</h3>
            </div>
          </button>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2">
          {activeTab === "sale" ? (
            <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-zinc-50 border-b border-zinc-100 p-8">
                <CardTitle className="text-xl">Seasonal Sale Campaign</CardTitle>
                <CardDescription>Send a professional sale announcement with an optional coupon code.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSendSale}>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Campaign Name</Label>
                      <Input 
                        placeholder="e.g. SUMMER ARTIST SERIES" 
                        value={saleName}
                        onChange={(e) => setSaleName(e.target.value)}
                        className="h-12 rounded-xl border-zinc-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Discount Amount</Label>
                      <Input 
                        placeholder="e.g. 20% OFF" 
                        value={saleDiscount}
                        onChange={(e) => setSaleDiscount(e.target.value)}
                        className="h-12 rounded-xl border-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Coupon Code (Optional)</Label>
                    <Input 
                      placeholder="e.g. ARTIST20" 
                      value={saleCode}
                      onChange={(e) => setSaleCode(e.target.value)}
                      className="h-12 rounded-xl border-zinc-200 font-mono uppercase"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
                  <p className="text-xs text-zinc-400 italic flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> This will be sent to all registered users.
                  </p>
                  <Button 
                    type="submit"
                    disabled={isSending}
                    className="h-12 px-8 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-brand-rose transition-all shadow-lg shadow-zinc-900/10"
                  >
                    {isSending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> Blast Campaign</>}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card className="rounded-3xl border-zinc-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-rose-50 border-b border-rose-100 p-8">
                <CardTitle className="text-xl text-rose-900">Flash Sale Campaign</CardTitle>
                <CardDescription className="text-rose-600/70">Send a high-urgency email for a short-term store-wide discount.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSendFlash}>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Duration Text</Label>
                      <Input 
                        placeholder="e.g. 4 HOURS ONLY" 
                        value={flashDuration}
                        onChange={(e) => setFlashDuration(e.target.value)}
                        className="h-12 rounded-xl border-zinc-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Discount Amount</Label>
                      <Input 
                        placeholder="e.g. 30% OFF EVERYTHING" 
                        value={flashDiscount}
                        onChange={(e) => setFlashDiscount(e.target.value)}
                        className="h-12 rounded-xl border-zinc-200"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-8 bg-rose-50 border-t border-rose-100 flex justify-between items-center">
                  <p className="text-xs text-rose-600/60 italic flex items-center gap-2">
                    <Zap size={14} className="text-rose-500 fill-rose-500" /> High-urgency template will be used.
                  </p>
                  <Button 
                    type="submit"
                    disabled={isSending}
                    className="h-12 px-8 bg-[#FF4D6D] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                  >
                    {isSending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> Launch Flash Sale</>}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
