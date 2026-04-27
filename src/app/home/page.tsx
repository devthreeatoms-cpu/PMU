"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { LoggedInHeader, SimpleStatStrip, QuickActionsGrid, MemberHero } from "@/components/home/UserDashboardSections";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/services/admin";
import { Product } from "@/lib/types";

import { getCouponsAction } from "@/app/admin/coupons/actions";

export default function HomePage() {
  const { user, profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setMounted(true);
    // Fetch a few products for the Artist Tray
    getProducts().then((all) => setFeaturedProducts(all.slice(0, 3))).catch(() => {});
    
    // Fetch coupon descriptions for the marquee
    getCouponsAction().then(res => {
      if (res.success && res.coupons) {
        const descriptions = res.coupons
          .filter((c: any) => c.isActive && c.description)
          .map((c: any) => c.description.trim());
        
        if (descriptions.length > 0) {
          setAnnouncement(descriptions.join(' • '));
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.push("/login");
      } else if (isAdmin) {
        router.replace("/admin/dashboard");
      }
    }
  }, [user, isAdmin, loading, mounted, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  const userName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Artist";

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      <LoggedInHeader name={userName} />
      <SimpleStatStrip />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <QuickActionsGrid />
            <MemberHero />
          </div>
          
          <div className="space-y-8 overflow-hidden">
            {/* Artist Tray Sidebar */}
            <div className="bg-white/40 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border border-brand-rose/20 shadow-sm overflow-hidden">
              <h3 className="text-xl font-heading mb-6">Your Artist Tray</h3>
              <div className="space-y-6">
                <p className="text-zinc-500 text-sm font-light italic">Frequently ordered tools for your studio.</p>
                <div className="space-y-4">
                   {featuredProducts.length > 0 ? (
                     featuredProducts.map((product) => (
                       <Link
                         key={product.id}
                         href={`/products/${product.id}`}
                         className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 group hover:border-brand-gold transition-colors"
                       >
                         <span className="text-xs font-bold tracking-wider uppercase truncate max-w-[60%]">
                           {product.name.startsWith('*') || product.name.startsWith('.') ? product.name : `*${product.name}`}
                         </span>
                         <span className="text-brand-gold font-bold text-xs">₹{product.price.toFixed(2)}</span>
                       </Link>
                     ))
                   ) : (
                     [
                       { name: "V3 Nano Needles", price: "₹29.00" },
                       { name: "M90 Organic Black", price: "₹36.00" },
                       { name: "Booms Butter", price: "₹24.95" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 group hover:border-brand-gold transition-colors cursor-pointer">
                         <span className="text-xs font-bold tracking-wider uppercase">{item.name}</span>
                         <span className="text-brand-gold font-bold text-xs">{item.price}</span>
                       </div>
                     ))
                   )}
                </div>
                <Link href="/products" className="block text-center pt-4">
                  <Button variant="outline" className="w-full rounded-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white text-[10px] font-bold tracking-widest uppercase transition-all duration-500">
                    RESTOCK ALL
                  </Button>
                </Link>
              </div>
            </div>

            {/* Loyalty Status */}
            <div className="bg-brand-rose/30 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border border-brand-rose/50 overflow-hidden">
              <h3 className="text-xl font-heading mb-4">PMU SUPPLY Rewards</h3>
              <p className="text-brand-black/70 text-sm font-light leading-relaxed mb-6">
                You are <span className="font-bold">250 points</span> away from your next Artist Discount.
              </p>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
