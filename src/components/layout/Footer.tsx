"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SocialLinks } from "@/lib/types";
import { MessageCircle, X, Phone, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SocialIcons = {
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Youtube: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
};

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Listen to social links in real-time
    const socialRef = doc(db, "siteSettings", "social");
    const unsubscribe = onSnapshot(socialRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SocialLinks;
        console.log("Real-time social update:", data);
        setSocialLinks(data);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-brand-rose text-brand-black pt-16 pb-10 overflow-hidden relative border-t border-brand-gold/10">
      {/* Cinematic Glossy Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/30 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-12">
          
          {/* Brand Column: The Manifesto & Social Presence */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <Link href="/" className="inline-block transform transition-transform hover:scale-105 duration-500">
                <span className="text-3xl md:text-4xl font-heading font-normal tracking-tighter text-brand-gold leading-none">
                  PMU <span className="italic">SUPPLY</span>
                </span>
              </Link>
              <div className="relative max-w-sm">
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-brand-gold/20" />
                <p className="text-zinc-800 text-xs md:text-sm font-light italic leading-relaxed pl-6 tracking-wide">
                  "The ultimate destination for elite permanent makeup artists in India. We curate only the most precise, medical-grade tools to empower your creative vision."
                </p>
              </div>
            </div>

            {/* Social Presence - Now under description */}
            <div className="flex flex-wrap gap-4 pt-2">
              {socialLinks.instagram && socialLinks.showInstagram !== false && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/40 border border-brand-gold/10 rounded-full text-zinc-700 hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-90">
                  <SocialIcons.Instagram />
                </a>
              )}
              {socialLinks.facebook && socialLinks.showFacebook !== false && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/40 border border-brand-gold/10 rounded-full text-zinc-700 hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-90">
                  <SocialIcons.Facebook />
                </a>
              )}
              {socialLinks.whatsapp && socialLinks.showWhatsapp !== false && (
                <a href={`https://wa.me/${String(socialLinks.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/40 border border-brand-gold/10 rounded-full text-zinc-700 hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-90">
                  <SocialIcons.WhatsApp />
                </a>
              )}
              {socialLinks.youtube && socialLinks.showYoutube !== false && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/40 border border-brand-gold/10 rounded-full text-zinc-700 hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-90">
                  <SocialIcons.Youtube />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Boutique Section */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black tracking-[0.4em] uppercase text-brand-gold opacity-80">Boutique</h4>
              <ul className="space-y-3">
                {[
                  { name: "All Products", href: "/products" },
                  { name: "Machines", href: "/products?category=machines-power-supplies" },
                  { name: "Pigments", href: "/products?category=pigments" },
                  { name: "Needles", href: "/products?category=needles" }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-zinc-700 hover:text-brand-gold transition-all duration-300 text-[11px] font-bold tracking-widest uppercase flex items-center group">
                      <span className="w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-3" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Section */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black tracking-[0.4em] uppercase text-brand-gold opacity-80">Studio Support</h4>
              <ul className="space-y-3">
                {[
                  { name: "Return Policy", href: "/pages/return-policy" },
                  { name: "Terms & Conditions", href: "/pages/terms" },
                  { name: "Shipping Policy", href: "/pages/shipping-policy" },
                  { name: "Privacy Policy", href: "/pages/privacy" },
                  { name: "Contact Us", href: "/pages/contact" }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-zinc-700 hover:text-brand-gold transition-all duration-300 text-[10px] font-bold tracking-widest uppercase flex items-center group">
                      <span className="w-0 h-[1px] bg-brand-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-3" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certification / Trust Section - Now on the Right */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black tracking-[0.4em] uppercase text-brand-gold opacity-80">Certification</h4>
              <div className="space-y-4">
                <div className="p-4 border border-brand-gold/10 rounded-2xl bg-white/30 backdrop-blur-sm">
                  <p className="text-[9px] text-zinc-600 italic font-medium leading-relaxed">
                    All products are ISO certified and artist-tested for maximum safety and performance.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Editorial Bar */}
        <div className="pt-8 border-t border-brand-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-zinc-600 text-[9px] tracking-[0.2em] uppercase font-bold">
              © {new Date().getFullYear()} PMU SUPPLY INDIA
            </p>
            <p className="text-zinc-500 text-[7px] tracking-[0.1em] uppercase italic">The Elite Choice for Permanent Artistry</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] text-[#FF4D6D] hover:opacity-80 transition-all duration-300 tracking-[0.2em] uppercase flex items-center gap-1 group"
          >
            Developed by <span className="font-black border-b border-[#FF4D6D] group-hover:opacity-70 transition-opacity">THREEATOMS</span>
          </button>
        </div>
      </div>

      {/* ThreeAtoms Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              {/* Modal Header */}
              <div className="bg-zinc-900 p-8 flex flex-col items-center relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-32 h-16 mb-4 flex items-center justify-center">
                  <img 
                    src="https://www.threeatoms.com/logo.png" 
                    alt="ThreeAtoms Logo" 
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <h3 className="text-white text-xs font-black tracking-[0.3em] uppercase opacity-60">Premium Software</h3>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6 text-center">
                <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                  This particular website software is developed by <span className="font-bold text-zinc-900">ThreeAtoms</span>. 
                  We specialize in building custom software, <span className="text-brand-gold font-bold">AI Agents</span>, and <span className="text-brand-gold font-bold">AI Automations</span>. 
                  Let's build something elite.
                </p>

                <div className="grid grid-cols-1 gap-3 pt-4">
                  <a 
                    href="tel:+917981596550"
                    className="flex items-center justify-center gap-3 w-full h-12 bg-zinc-900 text-brand-gold rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    <Phone size={18} />
                    Call Us Now
                  </a>
                  
                  <a 
                    href="https://wa.me/917981596550?text=Hello%20ThreeAtoms!%20I%20have%20a%20website%20requirement.%20Please%20get%20in%20touch."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full h-12 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Message on WhatsApp
                  </a>

                  <a 
                    href="https://www.threeatoms.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full h-12 bg-zinc-50 text-zinc-500 rounded-xl font-bold text-sm hover:bg-zinc-100 hover:text-zinc-900 transition-all"
                  >
                    <Globe size={18} />
                    Visit Website
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
