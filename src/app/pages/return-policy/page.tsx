import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, RefreshCcw, AlertCircle, Wallet, XCircle, Mail } from "lucide-react";

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
              Return, Refund &amp; <span className="italic">Cancellation Policy</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed italic">
              &quot;Ensuring the highest standards of hygiene and quality for the elite artist community.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">

            <p className="text-zinc-600 leading-relaxed">
              We want every artist to receive their order in perfect condition. This policy explains when an order can be cancelled, when a return is eligible, and how refunds are processed. By placing an order on PMU SUPPLY you agree to the terms set out below.
            </p>

            {/* Order Cancellation */}
            <Block icon={<XCircle className="text-brand-gold w-8 h-8" />} title="Order Cancellation">
              <p>
                Orders may be cancelled free of charge any time before they are dispatched from our warehouse. To cancel, email <strong>support@pmusupply.in</strong> with your order number as soon as possible. Once an order has been handed over to the courier it can no longer be cancelled, but a return may still be requested under the conditions below.
              </p>
            </Block>

            {/* Standard Returns */}
            <Block icon={<RefreshCcw className="text-brand-gold w-8 h-8" />} title="Eligible Returns">
              <p>
                Returns are accepted for eligible products within <strong>7 days</strong> of delivery. To qualify, the item must be unused, undamaged, in its original packaging with all seals, tags, and accessories intact, and accompanied by the original invoice.
              </p>
            </Block>

            {/* Non-Returnable Items */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <div className="md:col-span-1">
                <AlertCircle className="text-[#FF4D6D] w-8 h-8" />
              </div>
              <div className="md:col-span-11 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Hygiene &amp; Safety Exclusions</h2>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Due to the nature of Permanent Makeup (PMU) procedures and strict hygiene protocols, the following items are <span className="text-[#FF4D6D] underline">strictly non-returnable</span> once the seal is broken or packaging is tampered with:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Cartridge Needles", "PMU Pigments", "Anesthetics / Numbing", "Aftercare Products", "Practice Skins", "Single-use Consumables"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-500 font-bold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Damaged / Wrong */}
            <Block icon={<ShieldCheck className="text-brand-gold w-8 h-8" />} title="Damaged, Defective or Incorrect Items">
              <p>
                If you receive a damaged, defective, or incorrect item, please notify us within <strong>24 hours</strong> of delivery at <strong>support@pmusupply.in</strong> with your order number and clear photographs of the product and packaging. After verification, we will arrange a free replacement or, if a replacement is not possible, a full refund.
              </p>
            </Block>

            {/* Refund Timeline */}
            <Block icon={<Wallet className="text-brand-gold w-8 h-8" />} title="Refund Timeline &amp; Method">
              <p>
                Once a return is received and inspected, or a cancellation is approved, refunds are initiated within <strong>2 business days</strong>. The amount is credited back to the <strong>original payment method</strong> through Razorpay and typically reflects in your account within <strong>5&ndash;7 business days</strong>, subject to your bank or card issuer.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>UPI / wallets: usually within 1&ndash;3 business days.</li>
                <li>Credit / debit cards: 5&ndash;7 business days.</li>
                <li>Net-banking: 3&ndash;5 business days.</li>
              </ul>
              <p>
                Original shipping charges are non-refundable except where the return is due to our error (damaged, defective, or incorrect item).
              </p>
            </Block>

            {/* How to Initiate */}
            <Block icon={<Mail className="text-brand-gold w-8 h-8" />} title="How to Initiate a Return">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Email <strong>support@pmusupply.in</strong> within the eligible window with your order number (e.g. INV-XXXXXX) and the reason for return.</li>
                <li>Our team will respond within 1&ndash;2 business days with return instructions and a return address.</li>
                <li>Pack the item securely in its original packaging and ship it via a trackable courier.</li>
                <li>Once received and inspected, your refund will be initiated as described above.</li>
              </ol>
            </Block>

            <div className="pt-12 border-t border-zinc-100 text-xs text-zinc-400 italic">
              Last updated: 04 May 2026. PMU SUPPLY reserves the right to update this policy from time to time.
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
