"use client";

import { useState, useEffect } from "react";
import { Gift, X, Copy, Check, Share2, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { getReferralSettings, DEFAULT_REFERRAL_SETTINGS } from "@/lib/services/admin";
import { ReferralSettings } from "@/lib/types";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

export function ReferralWidget() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_REFERRAL_SETTINGS);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a small delay for premium entrance
    const timer = setTimeout(() => setIsVisible(true), 1500);
    
    getReferralSettings().then(setSettings).catch(() => {});
    
    return () => clearTimeout(timer);
  }, []);

  const referralCode = profile?.referralCode || "LOGIN-TO-SEE";
  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : "";

  const handleCopy = () => {
    if (!user) {
      setIsOpen(false);
      router.push("/login?returnUrl=" + window.location.pathname);
      return;
    }
    
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Do not show in admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <button 
              type="button"
              className="flex items-center gap-3 bg-brand-black text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 cursor-pointer transition-all duration-300 group border border-brand-gold/20"
            >
              <div className="bg-brand-gold p-1.5 rounded-full group-hover:rotate-12 transition-transform">
                <Gift className="w-4 h-4 text-brand-black" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Refer & Earn</span>
              <div className="ml-2 w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
            </button>
          } />
          
          <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="relative">
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-brand-rose/30 to-brand-gold/10 -z-10" />
              
              <div className="p-10 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-brand-gold/5 flex items-center justify-center border border-brand-rose/20 mb-4 animate-in zoom-in-50 duration-500">
                  <Gift className="w-10 h-10 text-brand-gold" />
                </div>

                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-heading text-brand-black text-center leading-tight">
                    INVITE & GET <span className="text-brand-gold">{settings.referrerRewardPoints}</span> POINTS
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500 text-sm font-light leading-relaxed px-4">
                    Send your fellow artists a <span className="text-brand-gold font-bold">{settings.refereeDiscountPercentage}% discount</span> on their first order. Once they shop, you'll earn <span className="text-brand-gold font-bold">{settings.referrerRewardPoints} points</span> immediately.
                  </DialogDescription>
                </div>

                <div className="space-y-4 pt-4">
                  {!user ? (
                    <Button 
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/login?returnUrl=" + window.location.pathname);
                      }}
                      className="w-full h-14 bg-brand-black text-white hover:bg-zinc-800 rounded-2xl text-[10px] font-bold tracking-widest uppercase transition-all duration-500"
                    >
                      LOGIN TO GET INVITE LINK
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative group">
                        <Input 
                          readOnly 
                          value={referralLink}
                          className="h-14 bg-zinc-50 border-zinc-100 rounded-2xl pr-24 font-bold text-xs text-zinc-600 focus-visible:ring-brand-gold/20"
                        />
                        <button 
                          onClick={handleCopy}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-gold text-brand-black h-10 px-4 rounded-xl text-[9px] font-bold tracking-widest uppercase hover:bg-brand-black hover:text-white transition-all flex items-center gap-2"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? "COPIED" : "COPY"}
                        </button>
                      </div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 flex items-center justify-center gap-2 animate-pulse">
                        <Zap className="w-3 h-3 text-brand-gold" /> SHARE YOUR ARTIST CODE: {referralCode}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-center gap-8 border-t border-zinc-50">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100">
                      <Award className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Elite Perks</span>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      if (!user) {
                        toast.error("Login to share your code!");
                        return;
                      }
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: 'Join PMU SUPPLY',
                            text: `Join PMU SUPPLY and get ${settings.refereeDiscountPercentage}% off your first order using my code: ${referralCode}`,
                            url: referralLink,
                          });
                        } catch (err) {
                          console.log('Share failed:', err);
                        }
                      } else {
                        handleCopy();
                      }
                    }}
                    className="flex flex-col items-center gap-1 group/share"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100 group-hover/share:bg-brand-gold/10 group-hover/share:border-brand-gold/30 transition-all">
                      <Share2 className="w-4 h-4 text-brand-gold" />
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 group-hover/share:text-brand-gold transition-colors">Native Share</span>
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
