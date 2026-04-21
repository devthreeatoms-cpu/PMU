"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Cinematic Header */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center overflow-hidden bg-brand-rose">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: 'url("/images/landing/collection-hero.png")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-rose via-transparent to-transparent z-10" />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl space-y-4">
            <span className="text-brand-black text-[10px] font-bold tracking-[0.5em] uppercase">Connect With Us</span>
            <h1 className="text-5xl md:text-7xl font-heading text-brand-black">Contact <span className="italic text-white">Hub</span></h1>
            <p className="text-brand-black/70 font-light italic max-w-lg">
              Our master support team is here to assist with product inquiries, technical specifications, and shipping details.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            
            {/* Contact Info */}
            <div className="space-y-16">
              <div className="space-y-8">
                <div className="space-y-4">
                   <h2 className="text-4xl font-heading italic">Reach out to the <br/><span className="text-brand-gold not-italic font-sans font-black tracking-widest uppercase">Concierge</span></h2>
                   <p className="text-zinc-500 font-light leading-relaxed italic max-w-md">
                     Whether you are a seasoned master or just beginning your PMU journey, we are here to support your artistry.
                   </p>
                </div>

                <div className="space-y-8">
                  <ContactItem 
                    icon={<Mail className="w-5 h-5" />} 
                    label="Email Inquiry" 
                    value="info@pmusupply.com" 
                    href="mailto:info@pmusupply.com"
                  />
                  <ContactItem 
                    icon={<MessageCircle className="w-5 h-5" />} 
                    label="WhatsApp Support" 
                    value="+1 (555) 000-0000" 
                    href="tel:+15550000000"
                  />
                  <ContactItem 
                    icon={<MapPin className="w-5 h-5" />} 
                    label="USA Logistics" 
                    value="Distributing Excellence from USA & Canada" 
                  />
                </div>
              </div>

              {/* FAQ Preview Card */}
              <div className="p-10 bg-white/40 rounded-[3rem] border border-brand-rose/20 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl group-hover:bg-brand-gold/10 transition-colors" />
                <h4 className="font-heading italic text-2xl leading-tight">Frequently <br/>Requested <span className="text-brand-gold">Intel</span></h4>
                <p className="text-zinc-400 text-sm font-light leading-relaxed italic">
                  Looking for international shipping rates or product sterilization logs? Check our support portal first.
                </p>
                <Button variant="outline" className="rounded-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white px-8 text-[10px] font-bold tracking-widest transition-all">
                   EXPLORE FAQ
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] relative">
              {submitted ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-700">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                    <Send className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-heading italic">Transmission Received</h3>
                    <p className="text-zinc-400 text-sm italic">Our concierge team will respond within 24 hours.</p>
                  </div>
                  <Button onClick={() => setSubmitted(false)} variant="link" className="text-brand-gold text-[10px] font-bold tracking-widest">SEND ANOTHER MESSAGE</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="grid md:grid-cols-2 gap-8">
                    <FormInput label="Full Name" placeholder="Artist Name" isRequired />
                    <FormInput label="Email Address" placeholder="artist@example.com" type="email" isRequired />
                  </div>
                  <FormInput label="Subject" placeholder="Inquiry Type" />
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 ml-4">Message</label>
                    <textarea 
                      required
                      placeholder="How can we assist your artistry?"
                      className="w-full bg-zinc-50 border-none rounded-[2rem] p-6 focus:ring-2 focus:ring-brand-gold/20 min-h-[160px] text-zinc-600 outline-none transition-all placeholder:italic placeholder:text-zinc-300"
                    />
                  </div>
                  <Button type="submit" className="w-full h-16 bg-brand-rose text-white hover:bg-brand-gold rounded-full font-bold tracking-[0.4em] text-[10px] transition-all duration-700 shadow-2xl shadow-brand-gold/10">
                    TRANSMIT INQUIRY
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

function ContactItem({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href?: string }) {
  const Card = () => (
    <div className="flex items-center gap-6 group">
      <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-brand-gold/20">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">{label}</p>
        <p className="text-lg font-heading tracking-wide text-zinc-900">{value}</p>
      </div>
    </div>
  );

  return href ? (
    <a href={href}><Card /></a>
  ) : (
    <Card />
  );
}

function FormInput({ label, placeholder, type = "text", isRequired = false }: { label: string, placeholder: string, type?: string, isRequired?: boolean }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 ml-4">{label}</label>
      <input 
        required={isRequired}
        type={type}
        placeholder={placeholder}
        className="w-full h-14 bg-zinc-50 border-none rounded-full px-6 focus:ring-2 focus:ring-brand-gold/20 text-zinc-600 outline-none transition-all placeholder:italic placeholder:text-zinc-300"
      />
    </div>
  );
}
