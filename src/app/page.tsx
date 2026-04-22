"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Award } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LoggedInHeader, SimpleStatStrip, QuickActionsGrid, MemberHero } from "@/components/home/UserDashboardSections";
import { ModernHero } from "@/components/home/ModernHero";
import { useRouter } from "next/navigation";



import { getCouponsAction } from "@/app/admin/coupons/actions";

export default function Home() {
  const { user, profile, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setIsRedirecting(true);
      if (isAdmin) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/home");
      }
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
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

  // If loading or redirecting, show a clean luxury loader to maintain premium feel
  if (loading || user || isRedirecting) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-gold animate-pulse">Authenticating Artistry</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-cream">
      {announcement && (
        <div className="bg-brand-rose text-brand-black py-2 overflow-hidden border-b border-brand-gold/20">
          <div className="animate-marquee whitespace-nowrap flex gap-10">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-90">
              {announcement}
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-90">
              {announcement}
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-90">
              {announcement}
            </span>
          </div>
        </div>
      )}

      <Navbar />
      
      <ModernHero />



      {/* Nano Brow Class Banner */}
      <section className="mt-24 mb-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-brand-rose/20 flex flex-col lg:flex-row min-h-[500px]">
            {/* Text Side */}
            <div className="flex-1 p-10 md:p-16 lg:p-20 flex flex-col justify-center space-y-8 bg-brand-cream/50">
              <div className="space-y-4">
                <span className="text-brand-gold text-[10px] font-bold tracking-[0.5em] uppercase">Limited Opportunity</span>
                <h2 className="text-4xl md:text-6xl font-heading leading-tight text-brand-black">Nano Combo Brow <br/>Class is now LIVE!</h2>
              </div>
              <p className="text-zinc-600 text-lg font-light italic max-w-sm">
                Elevate your artistry with our comprehensive nano brow techniques. Level up your career today.
              </p>
              <Link href="/products?category=classes" className="inline-block pt-4">
                <Button size="lg" className="bg-brand-gold text-white hover:bg-brand-black px-12 h-16 rounded-full tracking-[0.2em] text-[10px] font-bold transition-all duration-500 shadow-xl shadow-brand-gold/20">
                  REGISTER NOW — $599
                </Button>
              </Link>
            </div>
            {/* Image Side */}
            <div className="flex-1 relative min-h-[400px] lg:min-h-auto">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                style={{ backgroundImage: 'url("/images/landing/brow-class.png")' }}
              />
              {/* Soft overlay on image side only */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-cream/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Grid */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">Curated Catalog</span>
            <h2 className="text-4xl md:text-5xl font-heading font-normal">Featured Collections</h2>
          </div>
          <Link href="/products" className="text-xs font-bold tracking-[0.2em] border-b-2 border-brand-gold pb-1 hover:opacity-70 transition-opacity">
            BROWSE ALL PRODUCTS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CollectionCard 
            title="Practice Materials" 
            href="/products?category=practice" 
            image="/images/landing/practice-skins.png"
            count="12 Products"
          />
          <CollectionCard 
            title="Machines & Power" 
            href="/products?category=machines" 
            image="/images/landing/precision-machine.png"
            count="12 Products"
          />
          <CollectionCard 
            title="Professional Pigments" 
            href="/products?category=pigments" 
            image="/images/landing/collection-hero.png"
            count="89 Products"
          />
          <CollectionCard 
            title="Needle Cartridges" 
            href="/products?category=needles" 
            image="/images/landing/v3-cartridges.png"
            count="45 Products"
          />
          <CollectionCard 
            title="Q Vision Pigments" 
            href="/products?category=q-vision" 
            image="/images/landing/q-vision.png"
            count="7 Products"
          />
          <CollectionCard 
            title="Etalon Hybrid & Mineral" 
            href="/products?category=etalon" 
            image="/images/landing/etalon.png"
            count="15 Products"
          />
          <CollectionCard 
            title="Numbing & Anesthetic" 
            href="/products?category=numbing" 
            image="/images/landing/numbing.png"
            count="4 Products"
          />
          <CollectionCard 
            title="Aftercare" 
            href="/products?category=aftercare" 
            image="/images/landing/aftercare.png"
            count="5 Products"
          />
          <CollectionCard 
            title="Shaping Tools" 
            href="/products?category=shaping-tools" 
            image="/images/landing/shaping-tools.png"
            count="8 Products"
          />
        </div>
      </section>
      
      {/* Featured Section */}
      {/* Organic Smoothie Skin Treatment Section - Modernized */}
      <section className="py-24 bg-brand-cream overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-4">
                <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">Ethical Purity</span>
                <h2 className="text-4xl md:text-6xl font-heading leading-tight text-zinc-900">
                  Organic Smoothie <br/>
                  <span className="italic text-brand-gold">Skin Treatment</span>
                </h2>
              </div>
              
              <div className="relative pl-8 border-l border-brand-gold/20">
                <p className="text-zinc-600 text-lg leading-relaxed font-light italic">
                  "Petroleum Free! Made with a concentrated mix of all organic oils and vitamins such as B5, C, E, 
                  almond oil, avocado oil, and cactus oil. Gentle and soothing for all skin types."
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <span className="px-4 py-2 bg-white rounded-full text-[10px] font-bold tracking-widest uppercase text-zinc-500 border border-zinc-100 shadow-sm">100% Organic</span>
                <span className="px-4 py-2 bg-white rounded-full text-[10px] font-bold tracking-widest uppercase text-zinc-500 border border-zinc-100 shadow-sm">Vitamin Enriched</span>
                <span className="px-4 py-2 bg-white rounded-full text-[10px] font-bold tracking-widest uppercase text-zinc-500 border border-zinc-100 shadow-sm">Pro Tested</span>
              </div>

              <Link href="/products?category=aftercare" className="inline-block pt-4">
                <Button size="lg" className="bg-brand-rose text-brand-black hover:bg-brand-black hover:text-white px-10 h-14 rounded-none tracking-[0.2em] text-[10px] font-bold transition-all duration-500">
                  SHOP AFTERCARE
                </Button>
              </Link>
            </div>

            <div className="order-1 lg:order-2 relative animate-in fade-in zoom-in duration-1000">
              <div className="relative aspect-square w-full max-w-[500px] ml-auto rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: 'url("/images/landing/aftercare.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl" />
              <div className="absolute top-1/2 -right-8 w-24 h-24 border border-brand-gold/20 rounded-full animate-float hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* New Hair Stroke Pattern Section - Updated to Cream */}
      <section className="py-24 bg-brand-cream text-brand-black overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,192,212,0.2),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[5s] group-hover:scale-110"
                  style={{ backgroundImage: 'url("/images/landing/practice-skins.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-rose/20 via-transparent to-transparent" />
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl animate-pulse" />
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-4">
                <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">Mastery Tools</span>
                <h2 className="text-4xl md:text-6xl font-heading leading-tight italic">
                  New Hair Stroke <br/>
                  <span className="text-brand-gold not-italic font-sans font-black tracking-widest uppercase text-3xl md:text-5xl">Patterns</span>
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-zinc-600 text-lg leading-relaxed font-light">
                  Mosha Studio & PMU SUPPLY are proud to announce our newest versions of latex practice skins, designed for easier practice than ever. 
                  Now with patterns used by <span className="text-brand-black font-semibold uppercase tracking-widest text-xs">Mosha</span> on real clients.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs tracking-widest uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" /> New Lamination Styles
                  </li>
                  <li className="flex items-center gap-3 text-xs tracking-widest uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" /> Pro-Grip Texture
                  </li>
                  <li className="flex items-center gap-3 text-xs tracking-widest uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" /> Realist Brow Mapping
                  </li>
                </ul>
              </div>

              <Link href="/products?category=practice" className="inline-block">
                <Button size="lg" className="bg-brand-gold text-white hover:bg-white hover:text-brand-black px-12 h-16 rounded-none tracking-[0.3em] text-[10px] font-bold transition-all duration-700">
                  SHOP COLLECTION
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values Strip - Refined */}
      <section className="bg-brand-cream py-20 border-y border-brand-gold/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(248,184,200,0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            <ValueItem title="100% Vegan" desc="Ethically Sourced Purity" icon={<CheckCircle2 className="w-8 h-8 text-brand-gold" />} />
            <ValueItem title="Organic Purity" desc="Water-Based Formulations" icon={<Sparkles className="w-8 h-8 text-brand-gold" />} />
            <ValueItem title="Cruelty Free" desc="Leaping Bunny Certified" icon={<Award className="w-8 h-8 text-brand-gold" />} />
            <ValueItem title="Pro Tested" desc="Used by Global Masters" icon={<CheckCircle2 className="w-8 h-8 text-brand-gold" />} />
          </div>
        </div>
      </section>

      {/* Instagram Artistry Showcase - New */}
      <section className="py-24 bg-brand-cream border-b border-brand-gold/10">
        <div className="container mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">Master Artistry</span>
              <h2 className="text-4xl md:text-5xl font-heading">Elitist Healed <span className="italic text-brand-gold">Results</span></h2>
            </div>
            <Link href="https://instagram.com/moshastudio" className="text-[10px] font-bold tracking-[0.3em] uppercase border-b border-brand-gold pb-1 hover:opacity-70 transition-opacity">
              FOLLOW @MOSHASTUDIO
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 duration-500">
              <img src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80" alt="Healed Brows" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-brand-gold/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 duration-500 delay-75">
              <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80" alt="Lip Blush" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-brand-gold/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 duration-500 delay-150">
              <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80" alt="Healed Result" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-brand-gold/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 duration-500 delay-225">
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80" alt="Master Artistry" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-brand-gold/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artist / Testimonial - New */}
      <section className="py-24 bg-brand-cream overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 items-center gap-16 lg:gap-24">
            <div className="relative group ring-1 ring-zinc-200 p-2 rounded-[2.5rem]">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden">
                <img src="/images/landing/brow-class.png" alt="Featured Artist" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <p className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-2">Featured Master</p>
                  <h4 className="text-white text-3xl font-heading tracking-wide">Mosha Studio</h4>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-brand-gold text-3xl font-heading leading-none">“</span>
                <p className="text-2xl md:text-3xl font-heading text-zinc-800 leading-snug">
                  Precision in every stroke is only possible when you trust your tools implicitly.
                </p>
              </div>
              <p className="text-zinc-500 font-light italic leading-loose">
                "Our mission is to empower PMU artists worldwide with products that meet the highest standards of safety and performance. Every pigment, skin, and machine in the PMU SUPPLY catalog is tested by real artists, for real results."
              </p>
              <div className="flex items-center gap-6 pt-4">
                <div className="h-px flex-1 bg-zinc-200" />
                <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-zinc-400">Master Artisan Signature</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mosha Studio Collab Banner - Updated for Maximum Visibility */}
      <section className="py-24 bg-brand-rose text-brand-black relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-white/20 skew-x-12 translate-x-32" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl bg-white/40 backdrop-blur-sm p-12 rounded-[4rem] border border-white/20 shadow-xl space-y-8">
            <span className="text-brand-gold text-xs font-bold tracking-[0.5em] uppercase">Special Collaboration</span>
            <h2 className="text-4xl md:text-6xl font-heading leading-tight">Mosha Studio <br/>& PMU SUPPLY</h2>
            <p className="text-zinc-800 text-lg leading-relaxed font-light">
              We are proud to announce our newest versions of latex practice skins, designed to make brow practice easier than ever. Featuring hair stroke patterns used by Mosha on real clients.
            </p>
            <div className="pt-4 flex gap-6">
              <Link href="/products?category=practice">
                <Button className="bg-brand-black text-white hover:bg-brand-gold px-8 h-12 rounded-full transition-all duration-500 tracking-widest text-[10px] font-bold shadow-lg">
                  EXPLORE PRACTICE SKINS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter Signup */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-8">
          <h2 className="text-3xl font-heading">Join the PMU SUPPLY Circle</h2>
          <p className="text-zinc-500 font-light italic">"Get 10% off your first order and exclusive access to new launches."</p>
          <div className="flex flex-col sm:flex-row gap-0 border-b border-brand-black pb-2">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 py-3 px-4 outline-none text-brand-black placeholder:text-zinc-300 placeholder:italic font-light"
            />
            <button className="px-8 py-3 bg-brand-rose text-brand-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-brand-black hover:text-white transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}

function CollectionCard({ title, href, image, count }: { title: string, href: string, image: string, count: string }) {
  return (
    <Link href={href} className="group relative aspect-[4/5] overflow-hidden block rounded-3xl">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-110"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      <div className="absolute bottom-8 left-8 right-8 space-y-2">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
          Explore Collection
        </span>
        <h3 className="text-white text-2xl font-heading tracking-wide group-hover:text-brand-gold transition-colors">
          {title}
        </h3>
        <p className="text-zinc-400 text-[10px] tracking-widest font-light uppercase">{count}</p>
      </div>
    </Link>
  );
}

function ValueItem({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 group">
      <div className="w-16 h-16 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-sm group-hover:border-brand-gold group-hover:shadow-[0_0_20px_rgba(248,184,200,0.1)] transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-black">{title}</h3>
        <p className="text-[9px] font-medium tracking-[0.1em] text-zinc-400 uppercase">{desc}</p>
      </div>
    </div>
  );
}
