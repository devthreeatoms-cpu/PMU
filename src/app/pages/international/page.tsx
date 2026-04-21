"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Globe, AlertTriangle, ShieldCheck, Truck, Scale } from "lucide-react";

export default function InternationalPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Modern Disclaimer Hero */}
      <section className="relative py-32 bg-brand-rose overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: 'url("/images/landing/collection-hero.png")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-rose via-brand-rose/80 to-transparent z-10" />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 text-center max-w-4xl space-y-8 animate-in fade-in zoom-in duration-1000">
          <span className="text-brand-black text-[10px] font-bold tracking-[0.6em] uppercase">Global Logistics</span>
          <h1 className="text-5xl md:text-8xl font-heading text-brand-black italic">
            International <br/>
            <span className="text-white not-italic font-sans font-black tracking-widest uppercase">Shipping</span>
          </h1>
          <p className="text-brand-black/70 text-lg font-light italic leading-relaxed">
            Essential protocols and disclaimers for professional artisans ordering outside of the United States.
          </p>
        </div>
      </section>

      {/* Protocol Content */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            
            <div className="grid md:grid-cols-2 gap-12">
               <DisclaimerSection 
                 icon={<AlertTriangle className="w-6 h-6 text-brand-gold" />}
                 title="Duties & Customs"
                 content="All international orders are subject to the recipient's country's customs, taxes, and duties. These fees are NOT included in your PMU SUPPLY purchase price and are the sole responsibility of the artist upon delivery."
               />
               <DisclaimerSection 
                 icon={<Truck className="w-6 h-6 text-brand-gold" />}
                 title="Transit Liability"
                 content="Once a shipment leaves our USA facility and is accepted by the international carrier, PMU SUPPLY assumes no liability for custom delays, seizures, or lost packages in foreign transit."
               />
            </div>

            <div className="p-12 bg-white/40 rounded-[4rem] border border-brand-rose/20 space-y-8">
               <div className="flex items-center gap-4">
                 <Scale className="w-6 h-6 text-brand-gold" />
                 <h2 className="text-2xl font-heading italic">Product <span className="text-brand-gold">Compliance</span></h2>
               </div>
               <div className="prose prose-zinc max-w-none text-zinc-500 font-light italic leading-loose">
                 <p>
                   It is the technician's responsibility to ensure that the products ordered (specifically pigments and anesthetics) are compliant with local health department regulations and REACH standards in their respective country.
                 </p>
                 <p>
                   PMU SUPPLY products are tested for clinical safety in the USA. We recommend all international artists check with their local governing bodies before acquiring professional grade supplies.
                 </p>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <ProtocolCard label="Shipment Tracking" value="Real-time Global Updates" />
               <ProtocolCard label="Packaging" value="Sterile Vault Sealed" />
               <ProtocolCard label="Processing" value="24-48 Hour Fulfillment" />
            </div>

            {/* Bottom Note */}
            <div className="text-center space-y-4 pt-12">
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400">Master Support</p>
              <p className="text-zinc-600 font-light italic">
                Need a specific customs declaration or clinical log for your order? <br/>
                Contact our <a href="/pages/contact" className="text-brand-gold border-b border-brand-gold pb-0.5">Concierge Team</a>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

function DisclaimerSection({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="space-y-4 p-8 rounded-[3rem] border border-zinc-50 bg-white shadow-sm hover:shadow-xl transition-all duration-700 hover:-translate-y-1">
      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-heading italic">{title}</h3>
      <p className="text-zinc-500 font-light text-sm italic leading-relaxed">{content}</p>
    </div>
  );
}

function ProtocolCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-10 border border-zinc-100 rounded-[2.5rem] text-center space-y-2 group hover:bg-brand-rose/20 transition-all duration-500">
      <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-400 group-hover:text-brand-gold">{label}</p>
      <p className="text-sm font-heading tracking-wide italic text-zinc-900">{value}</p>
    </div>
  );
}
