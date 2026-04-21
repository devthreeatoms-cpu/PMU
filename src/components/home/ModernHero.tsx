"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, Award, CheckCircle2, ShoppingBag, Layers } from "lucide-react";

export function ModernHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mosaics = [
    { url: "/images/landing/collection-hero.png", title: "Full Collection" },
    { url: "/images/landing/precision-machine.png", title: "Precision Machines" },
    { url: "/images/landing/etalon.png", title: "Organic Pigments" },
    { url: "/images/landing/q-vision.png", title: "Q-Vision Range" },
    { url: "/images/landing/v3-cartridges.png", title: "V3 Cartridges" },
    { url: "/images/landing/shaping-tools.png", title: "Artisan Tools" },
  ];

  return (
    <section className="relative w-full min-h-screen lg:h-[110vh] flex items-center bg-brand-cream overflow-hidden pt-20 lg:pt-0">
      
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale brightness-125"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-glitter-particles-moving-in-a-black-background-4217-large.mp4" type="video/mp4" />
        </video>
        
        {/* Soft Beauty Glows - Updated for Light Theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/80 to-transparent z-10" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(248,184,200,0.05),transparent_70%)] z-10" />
        
        <div 
          className="absolute inset-0 opacity-[0.05] z-10" 
          style={{ backgroundImage: 'radial-gradient(#F8B8C8 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center py-20 lg:py-0">
          
          {/* Left Column: Editorial Content */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-12 order-2 lg:order-1">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-gradient-to-r from-brand-gold to-transparent" />
                <span className="text-brand-gold text-[10px] md:text-xs font-bold tracking-[0.6em] uppercase flex items-center gap-2">
                  <Layers className="h-3 w-3" /> THE COMPLETE CATALOG
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="flex flex-col">
                  <span className="text-4xl md:text-6xl xl:text-7xl font-sans font-black tracking-[0.25em] uppercase leading-none text-transparent bg-clip-text bg-gradient-to-br from-brand-black via-zinc-600 to-zinc-400">
                    PRECISION
                  </span>
                   <span className="text-7xl md:text-9xl xl:text-[11rem] font-heading font-normal italic tracking-tighter text-brand-gold leading-[0.75] mt-[-0.1em] drop-shadow-[0_20px_40px_rgba(248,184,200,0.2)]">
                    PMU
                  </span>
                </h1>
              </div>

              <div className="relative max-w-md group">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-gold/40 to-transparent" />
                <div className="absolute left-[-2px] bottom-0 w-1 h-1 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(248,184,200,0.6)]" />
                
                <p className="text-zinc-600 text-xs md:text-sm font-light italic tracking-[0.15em] leading-relaxed pl-8 py-1">
                  "Enter the vault of <span className="text-brand-black font-semibold uppercase tracking-widest text-[10px]">unlimited possibilities.</span> From revolutionary <span className="text-brand-gold font-medium">E95 Machines</span> to our signature <span className="text-brand-gold font-medium">Organic Pigments</span>—we supply everything an elite PMU artist needs."
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link href="/products">
                <Button size="lg" className="group relative bg-brand-gold text-white hover:bg-white hover:text-brand-black px-12 h-16 rounded-none transition-all duration-700 tracking-[0.4em] text-[10px] font-bold overflow-hidden w-full sm:w-auto">
                  <span className="relative z-10">VIEW ALL PRODUCTS</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Button>
              </Link>
              
              <button className="group flex items-center gap-4 text-brand-black text-[10px] font-bold tracking-[0.4em] uppercase hover:text-brand-gold transition-all duration-500">
                <div className="w-12 h-12 rounded-full border border-brand-black/10 flex items-center justify-center group-hover:border-brand-gold group-hover:scale-110 transition-all duration-500">
                  <Play className="h-3 w-3 fill-brand-black group-hover:fill-brand-gold transition-colors ml-0.5" />
                </div>
                SHOWCASE ALL
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 border-t border-brand-black/5 animate-in fade-in duration-1000 delay-500">
              <StatItem label="300+" sub="SKUs" />
              <StatItem label="100%" sub="Vegan" />
              <StatItem label="PRO" sub="Level" />
              <StatItem label="USA" sub="Supply" />
            </div>
          </div>

          {/* Right Column: ALL PRODUCTS Mosaic Wall */}
          <div className="lg:col-span-6 xl:col-span-7 relative order-1 lg:order-2">
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 animate-in fade-in zoom-in duration-1000 delay-200">
              {mosaics.map((item, i) => (
                <div 
                  key={i} 
                  className={`group relative overflow-hidden bg-brand-cream border border-brand-black/5 shadow-2xl transition-all duration-700 hover:z-30 hover:scale-105 ${
                    i === 0 ? 'md:col-span-2 md:row-span-2 aspect-[16/9]' : 'aspect-square'
                  }`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 group-hover:scale-100"
                    style={{ backgroundImage: `url("${item.url}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-cream/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-[8px] font-bold text-brand-gold tracking-widest uppercase">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative Floating Frame */}
            <div className="absolute -top-12 -right-12 w-64 h-64 border border-brand-gold/10 rounded-full animate-float pointer-events-none hidden xl:block" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 border border-brand-black/5 rounded-full animate-float pointer-events-none hidden xl:block" style={{ animationDelay: '-3s' }} />
          </div>

        </div>
      </div>

      {/* Decorative vertical bar remains */}
      <div className="absolute bottom-0 right-12 z-30 hidden lg:flex flex-col items-center">
        <div className="h-32 w-px bg-gradient-to-t from-brand-gold to-transparent opacity-40 mb-4" />
        <div className="vertical-text text-[9px] text-brand-gold font-bold tracking-[1em] uppercase pb-12">
          THE ULTIMATE PMU ARCHIVE
        </div>
      </div>
    </section>
  );
}

function StatItem({ label, sub }: { label: string, sub: string }) {
  return (
    <div className="space-y-1 border-r border-brand-black/5 last:border-0 pr-4">
      <div className="text-brand-gold text-[10px] font-black tracking-[0.3em]">{label}</div>
      <div className="text-zinc-400 text-[8px] font-bold tracking-[0.2em] uppercase italic">{sub}</div>
    </div>
  );
}
