import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Award, Heart, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About PMU Supply — Our Story & Mission",
  description:
    "Learn about PMU Supply's commitment to vegan, organic, cruelty-free permanent makeup products tested by professional artists. Clinical standards, artist-led quality.",
  openGraph: {
    title: "About PMU Supply — Our Story & Mission",
    description:
      "PMU Supply serves an international network of artists who demand more from their supplies. 100% vegan, organic, cruelty-free.",
    type: "website",
    siteName: "PMU Supply",
    images: [{ url: "/images/landing/brow-class.png", width: 1200, height: 630, alt: "About PMU Supply" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About PMU Supply — Our Story & Mission",
    description: "Vegan, organic, cruelty-free PMU products tested by professional artists.",
    images: ["/images/landing/brow-class.png"],
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      {/* Cinematic Philosophy Hero */}
      <section className="relative py-40 bg-brand-rose overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
           <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-glitter-particles-moving-in-a-black-background-4217-large.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
        
        <div className="container mx-auto px-4 relative z-20 text-center max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="space-y-4">
            <span className="text-brand-black text-[10px] font-bold tracking-[0.8em] uppercase">Our Philosophy</span>
            <h1 className="text-6xl md:text-8xl font-heading text-brand-black italic leading-none">
              The Artisan <br/>
              <span className="text-white not-italic font-sans font-black tracking-widest uppercase">Mission</span>
            </h1>
          </div>
          <p className="text-zinc-500 text-xl font-light italic leading-relaxed max-w-2xl mx-auto">
             &ldquo;We strive to provide only the best quality products for PMU and skin care. Every item in the PMU SUPPLY catalog is born from a legacy of clinical excellence and artistic mastery.&rdquo;
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-4">
                 <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">Clinical Standards</span>
                 <h2 className="text-4xl md:text-6xl font-heading italic">Purity in <br/><span className="text-brand-gold not-italic font-sans font-black tracking-widest uppercase">Performance</span></h2>
               </div>

               <div className="space-y-10">
                 <PhilosophyItem 
                   title="100% Vegan & Ethical" 
                   desc="We believe beauty should never come at a cost to our planet. Every pigment and treatment is 100% vegan, organic, and cruelty-free." 
                   icon={<Heart className="w-5 h-5" />}
                 />
                 <PhilosophyItem 
                   title="Artist-Led Testing" 
                   desc="We don't just sell tools; we use them. Our products are rigorously tested by Mosha Studio masters before release." 
                   icon={<CheckCircle2 className="w-5 h-5" />}
                 />
                 <PhilosophyItem 
                   title="Sterilization Priority" 
                   desc="Safety is the foundation of artistry. All needles and tools feature clinical-grade sterilization protocols." 
                   icon={<ShieldCheck className="w-5 h-5" />}
                 />
               </div>
            </div>

            <div className="relative group">
               <div className="relative aspect-[3/4] rounded-[5rem] overflow-hidden border-8 border-white shadow-2xl">
                 <img src="/images/landing/brow-class.png" alt="Mission Visual" className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110" />
                 <div className="absolute inset-0 bg-brand-gold/10 mix-blend-overlay" />
               </div>
               <div className="absolute -bottom-10 -left-10 p-8 bg-white rounded-[3rem] shadow-xl border border-zinc-50 space-y-2">
                 <Award className="w-8 h-8 text-brand-gold mb-2" />
                 <p className="text-[10px] font-bold tracking-widest uppercase">Awarded Excellence</p>
                 <p className="text-[8px] font-medium tracking-widest uppercase text-zinc-400">PMU Industry standard</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-24 bg-white/40 border-y border-brand-rose/20">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-8">
           <Sparkles className="w-8 h-8 text-brand-gold mx-auto" />
           <h2 className="text-4xl font-heading italic">A Legacy of <span className="text-brand-gold">Trust</span></h2>
           <p className="text-zinc-500 font-light italic leading-loose text-lg">
             From our headquarters in the USA, PMU SUPPLY serves an international network of artists who demand more from their supplies. We are committed to transparency, innovation, and the relentless pursuit of the perfect healed result.
           </p>
           <div className="pt-8 flex justify-center gap-12">
              <div className="text-center">
                <p className="text-3xl font-heading text-zinc-900 tracking-tighter">5.0</p>
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Artist Rating</p>
              </div>
              <div className="h-12 w-px bg-brand-rose/30" />
              <div className="text-center">
                <p className="text-3xl font-heading text-zinc-900 tracking-tighter">150k+</p>
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Artists Reached</p>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PhilosophyItem({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="w-12 h-12 rounded-2xl bg-white/60 border border-brand-rose/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-black group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-900 leading-tight">{title}</h4>
        <p className="text-zinc-400 font-light italic text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
