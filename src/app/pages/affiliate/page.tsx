import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { DollarSign, BarChart3, Star, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Program | PMU Supply",
  description:
    "Join the PMU Supply affiliate network and earn industry-leading commissions promoting professional PMU supplies. Real-time analytics, competitive rates, brand you can trust.",
  openGraph: {
    title: "Affiliate Program | PMU Supply",
    description:
      "Monetize your artistry by partnering with PMU Supply. Earn commissions while providing your community with elite PMU supplies.",
    type: "website",
    siteName: "PMU Supply",
    images: [{ url: "/images/landing/collection-hero.png", width: 1200, height: 630, alt: "PMU Supply Affiliate Program" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Affiliate Program | PMU Supply",
    description: "Join the PMU Supply affiliate network and earn competitive commissions.",
    images: ["/images/landing/collection-hero.png"],
  },
};

export default function AffiliatePage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Hero Visual */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-brand-rose">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: 'url("/images/landing/collection-hero.png")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-rose via-brand-rose/60 to-transparent z-10" />
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-4">
              <span className="text-brand-black text-[10px] font-bold tracking-[0.6em] uppercase">Partnership Program</span>
              <h1 className="text-5xl md:text-8xl font-heading text-brand-black leading-none">
                Join the <br/>
                <span className="italic text-white">Master Network</span>
              </h1>
            </div>
            <p className="text-brand-black/70 text-xl font-light italic max-w-xl leading-relaxed">
              Monetize your artistry by partnering with PMU SUPPLY. Earn industry-leading commissions while providing your community with elite PMU supplies.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Link href="https://af.uppromote.com/pmu-supply/register">
                <Button className="h-16 bg-brand-gold text-white hover:bg-white hover:text-brand-black px-12 rounded-none font-bold tracking-[0.4em] text-[11px] transition-all duration-700 shadow-2xl">
                  BECOME AN AFFILIATE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 xl:gap-24">
            <BenefitCard 
              icon={<DollarSign className="w-8 h-8" />}
              title="Elite Earnings"
              desc="Competitive commission rates on every qualified referral through your unique artist link."
            />
            <BenefitCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Pro Dashboard"
              desc="Comprehensive tracking and real-time analytics to monitor your conversions and growth."
            />
            <BenefitCard 
              icon={<Shield className="w-8 h-8" />}
              title="Brand Purity"
              desc="Represent the highest quality, vegan-certified supplies trusted by global PMU masters."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-brand-cream/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative group p-2 ring-1 ring-zinc-200 rounded-[3rem]">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl">
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-[4s] group-hover:scale-105"
                  style={{ backgroundImage: 'url("/images/landing/brow-class.png")' }}
                />
              </div>
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">The Workflow</span>
                <h2 className="text-4xl md:text-6xl font-heading italic">Direct path to <span className="text-brand-gold not-italic font-sans font-black tracking-widest uppercase">Success</span></h2>
              </div>

              <div className="space-y-10">
                <StepItem number="01" title="Register" desc="Apply to join our master affiliate network through our secure portal." />
                <StepItem number="02" title="Share Artistry" desc="Share your unique links with your students, followers, and artistic community." />
                <StepItem number="03" title="Earn Rewards" desc="Receive commissions on every purchase made through your referral." />
              </div>

              <Link href="https://af.uppromote.com/pmu-supply/register" className="inline-block pt-8 group">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-900 border-b-2 border-brand-gold pb-2 flex items-center gap-4 group-hover:gap-8 transition-all duration-500">
                  START YOUR APPLICATION <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-brand-cream text-center">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
           <div className="flex items-center justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />)}
           </div>
           <h2 className="text-4xl md:text-5xl font-heading italic">Join <span className="text-brand-gold">500+</span> Elite Artists</h2>
           <p className="text-zinc-400 font-light italic leading-relaxed text-lg">
             Become a local ambassador for the products you love. Our network includes top trainers and technicians globally.
           </p>
           <div className="pt-8">
             <Link href="https://af.uppromote.com/pmu-supply/register">
               <Button size="lg" className="h-16 bg-brand-rose text-white hover:bg-brand-gold px-12 rounded-full font-bold tracking-[0.4em] text-[10px] transition-all shadow-xl">
                 APPLY TO THE NETWORK
               </Button>
             </Link>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="space-y-6 group">
      <div className="w-20 h-20 bg-white/40 rounded-[2rem] border border-brand-rose/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all duration-700 shadow-sm group-hover:shadow-2xl group-hover:shadow-brand-gold/20">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-heading italic">{title}</h3>
        <p className="text-zinc-500 font-light leading-relaxed italic text-sm">{desc}</p>
      </div>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-8 items-start group">
      <span className="text-4xl font-heading text-zinc-100 group-hover:text-brand-gold transition-colors duration-500">{number}</span>
      <div className="space-y-1">
        <h4 className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-900 leading-tight">{title}</h4>
        <p className="text-zinc-400 font-light italic text-sm">{desc}</p>
      </div>
    </div>
  );
}
