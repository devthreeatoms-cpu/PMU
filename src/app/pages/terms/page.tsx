import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Scale, BookOpen, UserCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <section className="py-20 bg-brand-cream/30 border-b border-brand-gold/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-brand-gold text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Legal Framework</span>
            <h1 className="text-5xl md:text-6xl font-heading font-normal mb-6">
              Terms & <span className="italic">Conditions</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed italic">
              "Establishing a professional agreement between PMU SUPPLY and the artist."
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <BookOpen className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">1. Scope of Use</h2>
                <p className="text-zinc-600 leading-relaxed">
                  By accessing PMU SUPPLY, you agree to use this platform only for professional purposes related to the Permanent Makeup and Artistry industry. We reserve the right to restrict access to individuals or entities that do not align with our professional standards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <UserCheck className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">2. Artist Responsibility</h2>
                <p className="text-zinc-600 leading-relaxed italic">
                  PMU SUPPLY provides professional-grade tools. It is the sole responsibility of the purchaser to ensure they are qualified and licensed to use these tools in accordance with local regulations and health safety standards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <Scale className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">3. Payments & Taxes</h2>
                <p className="text-zinc-600 leading-relaxed">
                  All prices listed are in INR and include applicable GST unless stated otherwise. Payments are processed securely via Razorpay. We are not responsible for any bank-side transaction failures or currency conversion fees.
                </p>
              </div>
            </div>

            <div className="pt-12 border-t border-zinc-100">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Last Updated: April 30, 2026. PMU SUPPLY reserves the right to update these terms at any time without prior notice.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
