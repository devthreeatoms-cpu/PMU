"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Footer() {
  return (
    <footer className="bg-brand-rose text-brand-black pt-24 pb-12 border-t border-brand-gold/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Quick Links */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-900">Quick links</h4>
            <ul className="space-y-4">
              <li><Link href="/pages/affiliate" className="text-sm font-light hover:text-brand-gold transition-colors">Become an Affiliate</Link></li>
              <li><Link href="/pages/classes" className="text-sm font-light hover:text-brand-gold transition-colors">Mosha Online Classes</Link></li>
              <li><Link href="/pages/fb-group" className="text-sm font-light hover:text-brand-gold transition-colors">Mosha Studio Facebook</Link></li>
              <li><Link href="/pages/ig-mosha" className="text-sm font-light hover:text-brand-gold transition-colors">Mosha Studio Instagram</Link></li>
              <li><Link href="/pages/ig-meka" className="text-sm font-light hover:text-brand-gold transition-colors">PMU SUPPLY Instagram</Link></li>
              <li><Link href="/pages/disclaimer" className="text-sm font-light hover:text-brand-gold transition-colors">Product Disclaimer</Link></li>
            </ul>
          </div>

          {/* Our Mission */}
          <div className="md:col-span-6 space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-900">Our mission</h4>
            <p className="text-sm font-light leading-relaxed max-w-lg">
              We strive to offer only the best quality products for PMU and skin care. Our products have been tested by professionals, and are 100% vegan, organic, and cruelty free.
            </p>
          </div>

          {/* Subscribe */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-900">Subscribe to our emails</h4>
            <div className="space-y-4">
              <div className="relative group border-b border-brand-black pb-2">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="bg-transparent w-full outline-none text-sm placeholder:text-zinc-500 placeholder:italic"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 hover:translate-x-1 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.8333 10H4.16666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.8333 5L15.8333 10L10.8333 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 border-t border-brand-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center gap-4 grayscale opacity-60">
             {["AMEX", "APPLE PAY", "MASTERCARD", "PAYPAL", "VISA", "SHOP PAY"].map((p) => (
               <span key={p} className="text-[8px] font-bold tracking-[0.2em] uppercase border border-brand-black/20 px-2 py-1 rounded-sm">{p}</span>
             ))}
          </div>
          <div className="text-[8px] font-bold tracking-[0.2em] uppercase text-zinc-500">
            © 2026, PMU SUPPLY Powered by Shopify (Simulation)
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button className="bg-brand-rose text-brand-black px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform group">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-bold tracking-widest uppercase">Chat</span>
        </button>
      </div>

      {/* Refer Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-brand-gold text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42142 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-bold tracking-widest uppercase">Refer & Earn</span>
        </button>
      </div>
    </footer>
  );
}
