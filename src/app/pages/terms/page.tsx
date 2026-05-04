import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Scale, BookOpen, UserCheck, CreditCard, AlertTriangle, Gavel, Mail } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 bg-brand-cream/30 border-b border-brand-gold/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-brand-gold text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Legal Framework</span>
            <h1 className="text-5xl md:text-6xl font-heading font-normal mb-6">
              Terms &amp; <span className="italic">Conditions</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed italic">
              &quot;Establishing a professional agreement between PMU SUPPLY and the artist.&quot;
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">

            <p className="text-zinc-600 leading-relaxed">
              These Terms &amp; Conditions govern your use of the PMU SUPPLY website and the purchase of any products through it. By accessing the site, creating an account, or placing an order, you agree to be bound by these terms. If you do not agree, please do not use the website.
            </p>

            <Block icon={<BookOpen className="text-brand-gold w-8 h-8" />} title="1. Eligibility &amp; Scope of Use">
              <p>
                This website is intended for users who are at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872. Products listed are professional Permanent Makeup (PMU) tools and supplies, and are sold for use by trained, qualified professionals or those working under qualified supervision. By placing an order you confirm that you meet these criteria.
              </p>
            </Block>

            <Block icon={<UserCheck className="text-brand-gold w-8 h-8" />} title="2. Account &amp; Accuracy">
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You agree to provide accurate, current, and complete information at registration and at checkout. We reserve the right to suspend or cancel orders or accounts where information is found to be false or where activity appears fraudulent.
              </p>
            </Block>

            <Block icon={<CreditCard className="text-brand-gold w-8 h-8" />} title="3. Pricing, Taxes &amp; Payments">
              <p>
                All prices are listed in Indian Rupees (INR) and, unless stated otherwise, are inclusive of applicable GST. Prices and product availability may change without notice. Online payments are processed securely through <strong>Razorpay</strong>; we accept credit and debit cards, UPI, net-banking, and supported wallets. We do not store any sensitive payment credentials. An order is confirmed only once payment has been successfully captured and verified.
              </p>
            </Block>

            <Block icon={<Scale className="text-brand-gold w-8 h-8" />} title="4. Shipping, Returns &amp; Refunds">
              <p>
                Shipping timelines, delivery coverage, returns, and refunds are governed by our <a href="/pages/shipping-policy" className="text-brand-gold underline">Shipping Policy</a> and <a href="/pages/return-policy" className="text-brand-gold underline">Return &amp; Refund Policy</a>, which form an integral part of these Terms.
              </p>
            </Block>

            <Block icon={<AlertTriangle className="text-brand-gold w-8 h-8" />} title="5. Professional Use &amp; Liability">
              <p>
                PMU SUPPLY supplies professional-grade equipment. The purchaser is solely responsible for ensuring they are qualified, licensed, and insured to use these tools, and for complying with all applicable health, safety, and licensing regulations in their jurisdiction. To the maximum extent permitted by law, PMU SUPPLY shall not be liable for any indirect, incidental, special, or consequential damages arising from misuse, improper application, or any outcome of any procedure performed using our products. Our aggregate liability for any claim shall not exceed the amount paid by the customer for the specific product giving rise to the claim.
              </p>
            </Block>

            <Block icon={<BookOpen className="text-brand-gold w-8 h-8" />} title="6. Intellectual Property">
              <p>
                All content on this website &mdash; including text, images, logos, product photography, and brand marks &mdash; is the property of PMU SUPPLY or its licensors and is protected by Indian and international copyright and trademark laws. You may not reproduce, distribute, or commercially exploit any content without prior written permission.
              </p>
            </Block>

            <Block icon={<Gavel className="text-brand-gold w-8 h-8" />} title="7. Governing Law &amp; Jurisdiction">
              <p>
                These Terms are governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with the use of the website or any purchase shall be subject to the exclusive jurisdiction of the competent courts at our registered business location in India.
              </p>
            </Block>

            <Block icon={<Mail className="text-brand-gold w-8 h-8" />} title="8. Contact">
              <p>
                Questions about these Terms can be sent to <strong>support@pmusupply.in</strong>, or by post to PMU SUPPLY, [Registered Business Address], India.
              </p>
            </Block>

            <div className="pt-12 border-t border-zinc-100">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Last updated: 04 May 2026. PMU SUPPLY reserves the right to update these Terms at any time. Continued use of the site after an update constitutes acceptance of the revised Terms.
              </p>
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
