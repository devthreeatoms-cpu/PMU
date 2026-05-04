import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Lock, Eye, Shield, Database, Cookie, UserCog, Mail } from "lucide-react";

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
              &quot;We protect your data with the same precision we bring to our tools.&quot;
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-16">

            <p className="text-zinc-600 leading-relaxed">
              PMU SUPPLY (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates this website and is committed to protecting the privacy of every visitor and customer. This Privacy Policy explains what information we collect, how we use it, and the rights you have over your data. By using this website you consent to the practices described below.
            </p>

            <PolicyBlock icon={<Database className="text-brand-gold w-8 h-8" />} title="Information We Collect">
              <p>
                We collect information that you voluntarily provide and information that is automatically generated when you use the website:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity &amp; contact data</strong> &mdash; name, email address, phone number, billing and shipping address.</li>
                <li><strong>Account data</strong> &mdash; login credentials, order history, saved addresses, preferences.</li>
                <li><strong>Transaction data</strong> &mdash; products purchased, amount, date, GST details where applicable. We do <em>not</em> store card numbers, CVV, UPI PINs, or net-banking credentials.</li>
                <li><strong>Technical data</strong> &mdash; IP address, browser type, device identifiers, pages visited, referring URL.</li>
                <li><strong>Communication data</strong> &mdash; messages sent through our contact form, email, or support channels.</li>
              </ul>
            </PolicyBlock>

            <PolicyBlock icon={<Lock className="text-brand-gold w-8 h-8" />} title="How We Use Your Information">
              <ul className="list-disc pl-6 space-y-2">
                <li>To process orders, payments, refunds, and deliveries.</li>
                <li>To create and manage your account and authenticate access.</li>
                <li>To send order updates, invoices, shipment tracking, and service-related notices.</li>
                <li>To respond to enquiries and provide customer support.</li>
                <li>To improve the website, prevent fraud, and meet legal or regulatory obligations.</li>
                <li>With your consent, to send marketing communications (which you can opt out of at any time).</li>
              </ul>
            </PolicyBlock>

            <PolicyBlock icon={<Shield className="text-brand-gold w-8 h-8" />} title="Payment Processing">
              <p>
                Online payments are processed by <strong>Razorpay</strong>, a PCI-DSS Level 1 certified payment gateway. When you make a payment, sensitive card / UPI / net-banking details are sent directly to Razorpay over an encrypted channel and are never stored on our servers. Razorpay&rsquo;s own privacy policy governs the handling of payment information &mdash; please review it at <a className="text-brand-gold underline" href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer">razorpay.com/privacy</a>.
              </p>
            </PolicyBlock>

            <PolicyBlock icon={<Eye className="text-brand-gold w-8 h-8" />} title="Sharing With Third Parties">
              <p>
                We do not sell your personal data. We share information only with service providers that help us run the business, and only to the extent necessary:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Razorpay</strong> &mdash; payment processing.</li>
                <li><strong>Google Firebase</strong> &mdash; authentication, database, file storage, hosting.</li>
                <li><strong>Resend</strong> &mdash; transactional email (order confirmations, invoices).</li>
                <li><strong>Logistics partners</strong> &mdash; for shipment fulfilment and tracking.</li>
                <li><strong>Government authorities</strong> &mdash; if required by law, court order, or regulatory request.</li>
              </ul>
            </PolicyBlock>

            <PolicyBlock icon={<Cookie className="text-brand-gold w-8 h-8" />} title="Cookies &amp; Analytics">
              <p>
                We use cookies and similar technologies to keep you signed in, remember your cart, measure site performance, and improve user experience. You can disable cookies through your browser settings, but some features of the site may not work as intended.
              </p>
            </PolicyBlock>

            <PolicyBlock icon={<UserCog className="text-brand-gold w-8 h-8" />} title="Your Rights">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate or outdated information.</li>
                <li>Request deletion of your account and associated personal data, subject to retention required for tax, accounting, or legal compliance.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
                <li>Lodge a complaint with the appropriate data protection authority.</li>
              </ul>
              <p>
                To exercise any of these rights, write to us at the address in the &ldquo;Contact&rdquo; section below.
              </p>
            </PolicyBlock>

            <PolicyBlock icon={<Shield className="text-brand-gold w-8 h-8" />} title="Data Retention &amp; Security">
              <p>
                Personal data is retained only for as long as necessary for the purposes set out above, or as required by Indian tax and accounting laws. Data is stored on secured Google Firebase infrastructure with encryption in transit (TLS) and at rest. Access is restricted to authorised personnel.
              </p>
            </PolicyBlock>

            <PolicyBlock icon={<Mail className="text-brand-gold w-8 h-8" />} title="Contact &amp; Grievance">
              <p>
                For any privacy-related question, request, or grievance, please contact:
              </p>
              <ul className="list-none pl-0 space-y-1">
                <li><strong>Email:</strong> support@pmusupply.in</li>
                <li><strong>Address:</strong> PMU SUPPLY, [Registered Business Address], India</li>
              </ul>
              <p>
                We aim to respond to all valid requests within 30 days.
              </p>
            </PolicyBlock>

            <div className="pt-12 border-t border-zinc-100 flex items-center gap-4 text-zinc-500 italic text-sm">
              <Shield className="w-4 h-4" />
              Last updated: 04 May 2026. We may revise this policy from time to time; the latest version will always be available on this page.
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function PolicyBlock({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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
