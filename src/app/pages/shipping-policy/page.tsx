import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Truck, MapPin, Clock, IndianRupee, PackageX, Mail } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 bg-brand-cream/30 border-b border-brand-gold/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-brand-gold text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Logistics</span>
            <h1 className="text-5xl md:text-6xl font-heading font-normal mb-6">
              Shipping &amp; <span className="italic">Delivery Policy</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed italic">
              &quot;Delivering precision tools to your studio, wherever you are in India.&quot;
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">

            <p className="text-zinc-600 leading-relaxed">
              This Shipping Policy describes how orders placed on PMU SUPPLY are processed, dispatched, and delivered. Please read it carefully along with our <a href="/pages/return-policy" className="text-brand-gold underline">Return &amp; Refund Policy</a> and <a href="/pages/terms" className="text-brand-gold underline">Terms &amp; Conditions</a>.
            </p>

            <Block icon={<MapPin className="text-brand-gold w-8 h-8" />} title="Shipping Coverage">
              <p>
                We currently ship across <strong>India only</strong>. International orders are not supported at this time. Orders to remote pincodes may experience additional transit time depending on courier reach.
              </p>
            </Block>

            <Block icon={<Clock className="text-brand-gold w-8 h-8" />} title="Order Processing">
              <p>
                Orders are processed within <strong>24&ndash;48 business hours</strong> of payment confirmation. Orders placed on weekends or public holidays are processed on the next working day. You will receive an email and/or SMS confirmation once your order has been dispatched.
              </p>
            </Block>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 bg-brand-gold/5 rounded-[2.5rem] border border-brand-gold/10">
              <div className="md:col-span-1">
                <Truck className="text-brand-gold w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Estimated Delivery Times</h2>
                <p className="text-zinc-600">Estimates begin from the date of dispatch, not the date of order:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                    <h4 className="text-[10px] font-black tracking-widest text-brand-gold uppercase mb-2">Metro Cities</h4>
                    <p className="text-sm text-zinc-600 font-bold tracking-wide">3 &ndash; 4 BUSINESS DAYS</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                    <h4 className="text-[10px] font-black tracking-widest text-brand-gold uppercase mb-2">Rest of India</h4>
                    <p className="text-sm text-zinc-600 font-bold tracking-wide">5 &ndash; 7 BUSINESS DAYS</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  Delivery times are indicative. Unforeseen events &mdash; weather, courier delays, regional restrictions &mdash; may extend transit time.
                </p>
              </div>
            </div>

            <Block icon={<IndianRupee className="text-brand-gold w-8 h-8" />} title="Shipping Charges">
              <p>
                Shipping charges, if applicable, are calculated based on weight, destination, and order value, and are displayed at checkout before payment. Orders above the threshold shown at checkout qualify for free standard shipping within India. All applicable taxes are included.
              </p>
            </Block>

            <Block icon={<MapPin className="text-brand-gold w-8 h-8" />} title="Tracking Your Order">
              <p>
                Once your order is dispatched, a tracking ID and courier link are sent to your registered email and, where available, via SMS or WhatsApp. You can monitor your shipment through the courier partner&rsquo;s portal until delivery.
              </p>
            </Block>

            <Block icon={<PackageX className="text-brand-gold w-8 h-8" />} title="Failed, Undelivered or Returned Shipments">
              <p>
                If a shipment is returned to us due to an incorrect address, repeated unavailability of the recipient, or refusal to accept delivery, we will contact you to arrange re-shipment. Re-shipment charges may apply. If you choose to cancel a returned shipment instead, the product cost will be refunded as per our <a href="/pages/return-policy" className="text-brand-gold underline">Refund Policy</a> after deducting the original shipping cost.
              </p>
            </Block>

            <Block icon={<Mail className="text-brand-gold w-8 h-8" />} title="Shipping Support">
              <p>
                For any shipping or delivery question, write to <strong>support@pmusupply.in</strong> with your order number. Our team responds within 1&ndash;2 business days.
              </p>
            </Block>

            <div className="pt-12 border-t border-zinc-100 italic text-zinc-400 text-xs">
              Last updated: 04 May 2026.
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-1">{icon}</div>
      <div className="md:col-span-11 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="text-zinc-600 leading-relaxed space-y-4">{children}</div>
      </div>
    </div>
  );
}
