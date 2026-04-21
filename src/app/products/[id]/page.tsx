"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { 
  ArrowLeft, Minus, Plus, ShieldCheck, Truck, 
  RotateCcw, Info, Droplet, Zap, Target 
} from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/types";

// Unified Mock Data specifically for Phase 3 - Cinematic Experience
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "PMU SUPPLY Precision V3 Cartridge",
    slug: "pmu-supply-v3-cartridge",
    price: 29.00,
    category: "Needles",
    imageUrls: ["/images/landing/v3-cartridges.png"],
    description: "The V3 series represents the pinnacle of PMU needle technology. Engineered with a custom medical-grade membrane and ultra-sharp 316 surgical stainless steel, the V3 provides unparalleled stability and pigment flow.",
    stock: 120,
    variants: [
      { id: "v1-1", name: "0.20mm Nano", type: "Size", priceModifier: 0, stock: 60, sku: "M-V3-N20" },
      { id: "v1-2", name: "0.25mm Light", type: "Size", priceModifier: 0, stock: 40, sku: "M-V3-L25" },
      { id: "v1-3", name: "0.30mm HD", type: "Size", priceModifier: 0, stock: 20, sku: "M-V3-H30" }
    ],
    createdAt: 1713391851,
    updatedAt: 1713391851
  },
  {
    id: "p2",
    name: "PMU SUPPLY E95 Precision Machine",
    slug: "pmu-supply-e95-machine",
    price: 495.00,
    category: "Machines",
    imageUrls: ["/images/landing/precision-machine.png"],
    description: "The E95 is a masterpiece of precision engineering. Designed for the artist who demands perfection, it features a custom coreless motor that delivers consistent power without the heat, even during 8-hour sessions.",
    stock: 15,
    variants: [
      { id: "v2-1", name: "Champagne Gold", type: "Finish", priceModifier: 0, stock: 10, sku: "M-E95-GLD" },
      { id: "v2-2", name: "Satin Pink", type: "Finish", priceModifier: 0, stock: 5, sku: "M-E95-PNK" }
    ],
    createdAt: 1713391851,
    updatedAt: 1713391852
  }
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const setIsOpen = useCartStore((state) => state.setIsOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the ID from params, fallback to p1 for demo
  const product = MOCK_PRODUCTS.find(p => p.id === unwrappedParams.id) || MOCK_PRODUCTS[0];
  
  const currentVariant = product.variants?.find(v => v.id === selectedVariant) || null;
  const currentPrice = product.price + (currentVariant?.priceModifier || 0);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant || undefined, currentVariant?.name);
    setIsOpen(true);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      <div className="relative">
        {/* Cinematic Product Header */}
        <div className="container mx-auto px-4 pt-12">
          <Link href="/products" className="group inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 hover:text-brand-gold transition-all duration-500 mb-12">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Archive
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-32 items-start">
            
            {/* Gallery Column */}
            <div className="space-y-8 sticky top-32">
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden bg-white/40 border border-brand-rose/20 shadow-2xl group">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[4s] group-hover:scale-105"
                  style={{ backgroundImage: `url("${product.imageUrls[0]}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Floating Elements */}
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                   <div className="p-6 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 text-white">
                     <p className="text-[10px] font-bold tracking-widest uppercase">Certified Professional</p>
                     <h4 className="font-heading italic text-xl leading-tight">Master Grade Supply</h4>
                   </div>
                   <div className="w-16 h-16 rounded-full border border-white/50 flex items-center justify-center text-white backdrop-blur-md">
                     <Target className="w-6 h-6 animate-pulse" />
                   </div>
                </div>
              </div>

              {/* Minimalist Tech Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 rounded-3xl border border-brand-rose/10 bg-white/40 flex flex-col items-center gap-3 text-center">
                   <Zap className="w-5 h-5 text-brand-gold" />
                   <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-zinc-400">High Precision</span>
                </div>
                <div className="p-6 rounded-3xl border border-brand-rose/10 bg-white/40 flex flex-col items-center gap-3 text-center">
                   <ShieldCheck className="w-5 h-5 text-brand-gold" />
                   <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-zinc-400">Sterilized</span>
                </div>
                <div className="p-6 rounded-3xl border border-brand-rose/10 bg-white/40 flex flex-col items-center gap-3 text-center">
                   <Droplet className="w-5 h-5 text-brand-gold" />
                   <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-zinc-400">Optimized Flow</span>
                </div>
              </div>
            </div>

            {/* Information Column */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px w-10 bg-brand-gold" />
                  <span className="text-brand-gold text-[10px] font-bold tracking-[0.5em] uppercase">{product.category}</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading leading-tight italic text-zinc-900">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-6">
                  <span className="text-3xl font-light tracking-tight text-zinc-900">${currentPrice.toFixed(2)}</span>
                  <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Includes Sales Tax</span>
                </div>
              </div>

              <div className="prose prose-zinc max-w-none text-zinc-500 font-light leading-loose text-lg italic">
                <p>{product.description}</p>
              </div>

              {/* Variant Switcher - Modern Cards */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-6">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">Custom Specification</span>
                  <div className="grid grid-cols-2 gap-4">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v.id)}
                        className={`p-6 text-left rounded-3xl border transition-all duration-500 ${
                          selectedVariant === v.id 
                          ? 'bg-brand-gold text-white shadow-xl translate-x-1' 
                          : 'bg-white/60 border-brand-rose/10 text-zinc-400 hover:border-brand-gold hover:text-brand-gold'
                        }`}
                      >
                         <p className="text-[8px] font-bold tracking-widest uppercase opacity-60 mb-2">{v.type}</p>
                         <p className="font-bold tracking-widest text-xs uppercase">{v.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Area */}
              <div className="pt-12 border-t border-zinc-100 space-y-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-center bg-white/40 rounded-full px-6 h-16 border border-brand-rose/20">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-bold text-sm tracking-widest">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    disabled={product.variants && product.variants.length > 0 && !selectedVariant}
                    className="flex-1 h-16 bg-brand-rose text-brand-black hover:bg-brand-gold hover:text-white rounded-full font-bold tracking-[0.4em] text-[10px] transition-all duration-700 shadow-2xl disabled:opacity-30"
                  >
                    ACQUIRE FOR — ${(currentPrice * quantity).toFixed(2)}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-8 text-zinc-400">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-brand-gold" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold tracking-widest uppercase text-zinc-900">Priority Transit</p>
                      <p className="text-[8px] font-medium tracking-widest uppercase">Global Master Network</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-brand-gold" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold tracking-widest uppercase text-zinc-900">Artist Support</p>
                      <p className="text-[8px] font-medium tracking-widest uppercase">Expert Consultation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage / Pro Tips Accordion-style Area */}
              <div className="p-8 bg-white/40 rounded-[3rem] border border-brand-rose/20 flex items-start gap-4 space-y-1">
                 <Info className="w-5 h-5 text-brand-gold mt-1" />
                 <div>
                   <h4 className="font-bold text-[10px] tracking-widest uppercase text-zinc-900">Master's Guide</h4>
                   <p className="text-zinc-500 text-sm font-light leading-relaxed italic">
                      For optimal pigment retention, ensure the angle of entry is consistent at 90° for {product.category === 'Needles' ? 'pixelated shaders' : 'machine strokes'}. 
                      Recommended for professional use only.
                   </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curation Rail */}
        <section className="py-32 bg-brand-cream border-t border-brand-rose/10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 px-4">
              <div className="space-y-4">
                <span className="text-brand-gold text-[10px] font-bold tracking-[0.5em] uppercase">The Narrative</span>
                <h2 className="text-4xl md:text-5xl font-heading italic">Recommended <br/>by the <span className="text-brand-gold not-italic font-sans font-black tracking-widest uppercase">Curators</span></h2>
              </div>
              <Link href="/products" className="text-[10px] font-bold tracking-[0.3em] uppercase border-b border-brand-gold pb-1 hover:opacity-70 transition-opacity">
                VIEW FULL ARCHIVE
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {MOCK_PRODUCTS.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group block space-y-6">
                  <div className="relative aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 border border-zinc-100">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-[3s] group-hover:scale-110"
                      style={{ backgroundImage: `url("${item.imageUrls[0]}")` }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-[10px] font-bold tracking-widest uppercase group-hover:text-brand-gold transition-colors">{item.name}</h3>
                    <p className="text-zinc-400 font-light italic">${item.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
