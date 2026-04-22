"use client";

import { User, ShoppingBag, CreditCard, MapPin, HelpCircle, Package, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoggedInHeader({ name }: { name: string | null }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <div className="bg-brand-rose text-brand-black py-12 border-b border-brand-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-heading font-normal">
              Hi, <span className="text-brand-gold">{name || "Artist"}</span>!
            </h1>
            <p className="text-zinc-600 font-light italic tracking-wide">
              Welcome back to your professional PMU suite. Ready for your next masterpiece?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <Button className="bg-brand-gold text-white hover:bg-white hover:text-brand-black px-8 h-12 rounded-none tracking-widest text-[10px] font-bold transition-all duration-500 w-full sm:w-auto">
                RESUPPLY MY TRAY
              </Button>
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-transparent border border-brand-black text-brand-black hover:bg-brand-black hover:text-white px-8 h-12 rounded-none tracking-widest text-[10px] font-bold transition-all duration-500 w-full sm:w-auto uppercase"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export function SimpleStatStrip() {
  const { profile, loading } = useAuth();
  
  const stats = [
    { 
      label: "PMU SUPPLY POINTS", 
      value: loading ? "..." : (profile?.points || 0).toLocaleString(), 
      icon: <Star className="h-4 w-4 text-brand-gold" /> 
    },
    { 
      label: "DISCOUNT POWER", 
      value: loading ? "..." : `$${((profile?.points || 0) / 100).toFixed(2)}`, 
      icon: <CreditCard className="h-4 w-4 text-brand-gold" /> 
    },
    { 
      label: "TOTAL REFERRALS", 
      value: loading ? "..." : (profile?.referralCount || 0).toString(), 
      icon: <User className="h-4 w-4 text-brand-gold" /> 
    },
  ];

  return (
    <div className="bg-white border-b border-zinc-100 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-zinc-50 p-4 transition-colors border-r border-zinc-50 last:border-0">
              <div className="h-12 w-12 rounded-full bg-brand-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">{stat.label}</p>
                <p className="text-xl font-heading text-brand-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuickActionsGrid() {
  const actions = [
    { label: "My Orders", icon: <ShoppingBag className="h-6 w-6" />, href: "/profile" },
    { label: "Profile Settings", icon: <User className="h-6 w-6" />, href: "/profile" },
    { label: "Shipping Info", icon: <MapPin className="h-6 w-6" />, href: "/profile" },
    { label: "Help Center", icon: <HelpCircle className="h-6 w-6" />, href: "/pages/contact" },
  ];

  return (
    <div className="py-12 bg-zinc-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {actions.map((action, idx) => (
            <Link key={idx} href={action.href} className="group bg-white p-8 border border-zinc-200 hover:border-brand-gold transition-all duration-500 text-center space-y-4">
              <div className="text-zinc-400 group-hover:text-brand-gold transition-colors flex justify-center">
                {action.icon}
              </div>
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-black">{action.label}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MemberHero() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="relative h-[300px] md:h-[400px] bg-brand-cream overflow-hidden group border border-brand-black/5">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1621244299838-23438be7410f?auto=format&fit=crop&q=80")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/80 to-transparent" />
          <div className="relative z-10 h-full flex flex-col justify-center px-12 space-y-6 max-w-2xl">
            <span className="text-brand-gold text-[10px] font-bold tracking-[0.5em] uppercase">Private Member Offer</span>
            <h2 className="text-3xl md:text-5xl font-heading text-brand-black leading-tight">
              Exclusive 15% OFF <br/>on all <span className="text-brand-gold">Pigments</span>
            </h2>
            <p className="text-zinc-600 text-sm font-light italic">Use code: PMUSUPPLY15 at checkout. Valid for elite members only.</p>
            <Link href="/products?category=pigments">
              <Button variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white rounded-none px-8 font-bold tracking-widest text-xs transition-all">
                REDEEM NOW <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
