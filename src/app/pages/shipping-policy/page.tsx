import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Truck, MapPin, Clock } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <section className="py-20 bg-brand-cream/30 border-b border-brand-gold/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-brand-gold text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Logistics</span>
            <h1 className="text-5xl md:text-6xl font-heading font-normal mb-6">
              Shipping <span className="italic">Policy</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed italic">
              "Delivering precision tools to your studio, wherever you are in India."
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <Clock className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Processing Timelines</h2>
                <p className="text-zinc-600 leading-relaxed">
                  Orders are processed within <strong>24-48 business hours</strong> of payment confirmation. Orders placed during weekends or public holidays will be processed on the next business day.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 bg-brand-gold/5 rounded-[2.5rem] border border-brand-gold/10">
              <div className="md:col-span-1">
                <Truck className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Delivery Estimates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                    <h4 className="text-[10px] font-black tracking-widest text-brand-gold uppercase mb-2">Metro Cities</h4>
                    <p className="text-sm text-zinc-600 font-bold tracking-wide">3 - 4 BUSINESS DAYS</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                    <h4 className="text-[10px] font-black tracking-widest text-brand-gold uppercase mb-2">Rest of India</h4>
                    <p className="text-sm text-zinc-600 font-bold tracking-wide">5 - 7 BUSINESS DAYS</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-1">
                <MapPin className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Tracking Your Equipment</h2>
                <p className="text-zinc-600 leading-relaxed">
                  Once your order is dispatched, a tracking ID will be sent to your registered email and WhatsApp. You can monitor your shipment through our courier partner's portal.
                </p>
              </div>
            </div>

            <div className="pt-12 border-t border-zinc-100 italic text-zinc-400 text-sm">
              Note: Shipping costs are calculated based on weight and destination at the checkout stage.
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
