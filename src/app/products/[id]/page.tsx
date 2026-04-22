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
import { getProductById, getProducts } from "@/lib/services/admin";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const setIsOpen = useCartStore((state) => state.setIsOpen);

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      try {
        const [targetProduct, allProducts] = await Promise.all([
          getProductById(unwrappedParams.id),
          getProducts()
        ]);
        
        if (targetProduct) {
          setProduct(targetProduct);
          setActiveImage(0);
          // Get 4 random products for recommendations, excluding current
          const others = allProducts
            .filter(p => p.id !== targetProduct.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
          setRecommended(others);
        }
      } catch (error) {
        console.error("Discovery error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [unwrappedParams.id]);

  const currentVariant = product?.variants?.find(v => v.id === selectedVariant) || null;
  const currentPrice = (product?.price || 0) + (currentVariant?.priceModifier || 0);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity, selectedVariant || undefined, currentVariant?.name);
      setIsOpen(true);
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center space-y-4">
        <Navbar />
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-brand-gold border-t-transparent animate-spin mb-4" />
            <p className="text-[10px] font-bold tracking-[0.5em] text-brand-gold uppercase">Authenticating Artistry...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center space-y-6">
        <Navbar />
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-heading italic">Product Archived</h2>
          <p className="text-zinc-500 font-light italic">The requested equipment could not be located in our current supply line.</p>
          <Link href="/products">
            <Button variant="outline" className="border-brand-gold text-brand-gold mt-4">BACK TO SHOP ALL</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      <div className="relative">
        {/* Cinematic Product Header */}
        <div className="container mx-auto px-4 pt-12">
          <Link href="/products" className="group inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 hover:text-brand-gold transition-all duration-500 mb-12">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Shop All
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
            
            {/* Gallery Column */}
            <div className="space-y-6 sticky top-32">
              <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden bg-white border border-brand-rose/20 shadow-xl group">
                <div 
                  key={activeImage}
                  className="absolute inset-0 bg-cover bg-center animate-in fade-in zoom-in-95 duration-1000"
                  style={{ backgroundImage: `url("${product.imageUrls[activeImage] || product.imageUrls[0]}")` }}
                />
              </div>

              {/* Thumbnails */}
              {product.imageUrls.length > 1 && (
                <div className="flex gap-4 px-2">
                  {product.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                        activeImage === idx ? 'border-brand-gold shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url("${url}")` }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Minimalist Tech Bar */}
              <div className="grid grid-cols-3 gap-3 pt-6">
                <div className="p-5 rounded-2xl border border-brand-rose/10 bg-white/40 flex flex-col items-center gap-2 text-center">
                   <Zap className="w-4 h-4 text-brand-gold" />
                   <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-zinc-400">High Precision</span>
                </div>
                <div className="p-5 rounded-2xl border border-brand-rose/10 bg-white/40 flex flex-col items-center gap-2 text-center">
                   <ShieldCheck className="w-4 h-4 text-brand-gold" />
                   <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-zinc-400">Sterilized</span>
                </div>
                <div className="p-5 rounded-2xl border border-brand-rose/10 bg-white/40 flex flex-col items-center gap-2 text-center">
                   <Droplet className="w-4 h-4 text-brand-gold" />
                   <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-zinc-400">Optimized Flow</span>
                </div>
              </div>
            </div>

            {/* Information Column */}
            <div className="space-y-10 lg:pl-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 text-[9px] font-bold tracking-[0.4em] uppercase">PMU SUPPLY</span>
                  <div className="h-px w-6 bg-brand-gold/30" />
                  <span className="text-brand-gold text-[9px] font-bold tracking-[0.4em] uppercase">{product.category}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-heading leading-tight text-zinc-900">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-4 pt-2">
                  <span className="text-2xl font-light text-zinc-900">${product.price.toFixed(2)}</span>
                  <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase opacity-60">Professional Distribution</span>
                </div>
                <div className="pt-2">
                   <p className="text-[10px] text-zinc-500 font-light italic">
                     Or 4 interest-free installments of ${(product.price / 4).toFixed(2)} with <span className="font-bold text-brand-gold">PMU Pay</span>
                   </p>
                </div>
              </div>

              <div className="prose prose-zinc max-w-none text-zinc-500 font-light leading-relaxed text-base italic border-l-2 border-brand-gold/10 pl-6">
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
              <div className="pt-10 border-t border-zinc-100 space-y-8">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex items-center bg-white/40 rounded-xl px-5 h-14 border border-brand-rose/20">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-bold text-xs tracking-widest">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    disabled={product.variants && product.variants.length > 0 && !selectedVariant}
                    className="flex-1 h-14 bg-brand-black text-white hover:bg-brand-gold hover:text-white rounded-none font-bold tracking-[0.4em] text-[10px] transition-all duration-700 shadow-xl disabled:opacity-30 uppercase"
                  >
                    Add to Cart
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-zinc-400 border-t border-zinc-50 pt-8">
                  <div className="flex items-center gap-3">
                    <Truck className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="text-[8px] font-bold tracking-widest uppercase text-zinc-900">Complimentary Dispatch</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="text-[8px] font-bold tracking-widest uppercase text-zinc-900">Artist Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Usage / Pro Tips Area */}
              <div className="p-8 bg-zinc-900 text-white rounded-none flex items-start gap-5 space-y-0.5">
                 <Info className="w-4 h-4 text-brand-gold mt-1 shrink-0" />
                 <div>
                   <h4 className="font-bold text-[9px] tracking-[0.3em] uppercase text-brand-gold mb-1">Artist Requirement</h4>
                   <p className="text-zinc-400 text-xs font-light leading-relaxed italic">
                      This equipment is reserved for certified professionals. Misuse can lead to suboptimal pigment retention. 
                      Expert consultation available for all elite members.
                   </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curation Rail */}
        <section className="py-24 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-4">
            <div className="mb-12">
                <h2 className="text-3xl font-heading text-brand-black text-center mb-2 italic">You may also like</h2>
                <div className="w-12 h-0.5 bg-brand-gold mx-auto" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {recommended.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group block space-y-4">
                  <div className="relative aspect-square rounded-none overflow-hidden bg-zinc-50 border border-zinc-100 transition-all duration-700 group-hover:shadow-lg">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-[3s] group-hover:scale-105"
                      style={{ backgroundImage: `url("${item.imageUrls[0]}")` }}
                    />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-[9px] font-bold tracking-widest uppercase text-zinc-800 group-hover:text-brand-gold transition-colors">{item.name}</h3>
                    <p className="text-zinc-500 font-light italic text-xs">${item.price.toFixed(2)}</p>
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
