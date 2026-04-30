import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Lock, Eye, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <section className="py-20 bg-brand-cream/30 border-b border-brand-gold/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-brand-gold text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Confidentiality</span>
            <h1 className="text-5xl md:text-6xl font-heading font-normal mb-6">
              Privacy <span className="italic">Policy</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed italic">
              "We protect your data with the same precision we bring to our tools."
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <Lock className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Data Protection</h2>
                <p className="text-zinc-600 leading-relaxed">
                  Your personal information—including your name, contact details, and shipping address—is encrypted and stored securely within our Firebase-powered infrastructure. We never sell your data to third parties.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <Shield className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Secure Payments</h2>
                <p className="text-zinc-600 leading-relaxed">
                  Payment information (Credit Cards/UPI/NetBanking) is handled exclusively by **Razorpay**, a PCI-DSS certified payment gateway. PMU SUPPLY does not store any sensitive financial credentials on its servers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <Eye className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Usage Transparency</h2>
                <p className="text-zinc-600 leading-relaxed">
                  We use cookies and analytical data solely to improve your shopping experience and provide personalized product recommendations.
                </p>
              </div>
            </div>

            <div className="pt-12 border-t border-zinc-100 flex items-center gap-4 text-zinc-500 italic text-sm">
              <Shield className="w-4 h-4" />
              Your security is our priority.
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
