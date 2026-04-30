import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, RefreshCcw, AlertCircle } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-brand-cream/30 border-b border-brand-gold/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-brand-gold text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Store Policies</span>
            <h1 className="text-5xl md:text-6xl font-heading font-normal mb-6">
              Return <span className="italic">Policy</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed italic">
              "Ensuring the highest standards of hygiene and quality for the elite artist community."
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">
            
            {/* Standard Returns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <RefreshCcw className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Standard Returns</h2>
                <p className="text-zinc-600 leading-relaxed">
                  We accept returns for eligible products within <strong>7 days</strong> of delivery. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original, unopened packaging.
                </p>
              </div>
            </div>

            {/* Non-Returnable Items */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <div className="md:col-span-1">
                <AlertCircle className="text-[#FF4D6D] w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Hygiene & Safety Exclusion</h2>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Due to the nature of Permanent Makeup (PMU) procedures and strict hygiene protocols, the following items are <span className="text-[#FF4D6D] underline">strictly non-returnable</span> once the seal is broken or packaging is tampered with:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Cartridge Needles", "PMU Pigments", "Anesthetics / Numbing", "Aftercare Products", "Practice Skins"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-500 font-bold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Process */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <ShieldCheck className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Damaged or Incorrect Items</h2>
                <p className="text-zinc-600 leading-relaxed">
                  In the rare event that you receive a damaged or incorrect item, please notify us within <strong>24 hours</strong> of delivery with photographic evidence. We will arrange a prioritized replacement at no additional cost to you.
                </p>
              </div>
            </div>

            {/* How to Initiate */}
            <div className="pt-12 border-t border-zinc-100">
              <h3 className="text-xl font-bold mb-4">How to initiate a return?</h3>
              <p className="text-zinc-600 mb-6">
                Please contact our support team at <span className="font-bold text-brand-black">support@pmusupply.in</span> with your Order Number (e.g., INV-XXXXXX).
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
