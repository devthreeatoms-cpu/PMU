"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import {
  ArrowLeft, Minus, Plus, ShieldCheck, Truck,
  RotateCcw, Droplet, Zap, Target
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Product } from "@/lib/types";

interface ProductDetailClientProps {
  product: Product;
  recommended: Product[];
}

export function ProductDetailClient({ product, recommended }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (product.hasVariants && product.options) {
      const defaults: Record<string, string> = {};
      product.options.forEach((opt) => {
        if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
      });
      return defaults;
    }
    return {};
  });

  const addItem = useCartStore((state) => state.addItem);
  const setIsOpen = useCartStore((state) => state.setIsOpen);

  const currentVariant = useMemo(() => {
    if (!product.hasVariants || !product.variants) return null;
    const optionsToMatch =
      Object.keys(selectedOptions).length > 0
        ? selectedOptions
        : (product.options || []).reduce(
            (acc, opt) => ({ ...acc, [opt.name]: opt.values[0] }),
            {}
          );
    return product.variants.find((v) =>
      Object.entries(optionsToMatch).every(([key, value]) => v.combination[key] === value)
    );
  }, [product, selectedOptions]);

  const currentPrice = currentVariant ? currentVariant.price : product.price || 0;
  const currentStock = currentVariant ? currentVariant.stock : product.stock || 0;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    const variantName = currentVariant
      ? Object.values(currentVariant.combination).join(" / ")
      : undefined;
    addItem(product, quantity, currentVariant?.id, variantName);
    setIsOpen(true);
  };

  return (
    <div className="relative">
      {/* Back link */}
      <div className="container mx-auto px-4 pt-12">
        <Link
          href="/products"
          className="group inline-flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400 hover:text-brand-gold transition-all duration-500 mb-12"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Shop All
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">

          {/* Gallery Column */}
          <div className="space-y-6 lg:sticky lg:top-32">
            <div className="relative aspect-square md:max-h-[500px] bg-white border border-zinc-100 overflow-hidden group mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <img
                    src={product.imageUrls[activeImage] || product.imageUrls[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Carousel Dots */}
              {product.imageUrls.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {product.imageUrls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                        activeImage === idx ? "bg-brand-gold w-6" : "bg-zinc-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.imageUrls.length > 1 && (
              <div className="flex gap-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-24 shrink-0 overflow-hidden border transition-all duration-500 ${
                      activeImage === idx
                        ? "border-brand-gold"
                        : "border-zinc-100 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Tech Bar */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 pt-6">
              <div className="p-2 md:p-5 border border-zinc-100 bg-zinc-50/50 flex flex-col items-center gap-1 md:gap-2 text-center transition-colors hover:bg-zinc-50">
                <Zap className="w-4 h-4 text-brand-gold" />
                <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-zinc-400">High Precision</span>
              </div>
              <div className="p-2 md:p-5 border border-zinc-100 bg-zinc-50/50 flex flex-col items-center gap-1 md:gap-2 text-center transition-colors hover:bg-zinc-50">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-zinc-400">Sterilized</span>
              </div>
              <div className="p-2 md:p-5 border border-zinc-100 bg-zinc-50/50 flex flex-col items-center gap-1 md:gap-2 text-center transition-colors hover:bg-zinc-50">
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
              <h1 className="text-3xl md:text-5xl font-heading leading-tight text-zinc-900 break-words">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-2xl font-light text-zinc-900">₹{currentPrice.toFixed(2)}</span>
                {currentVariant && currentVariant.salePrice && (
                  <span className="text-sm line-through text-zinc-400">₹{currentVariant.salePrice.toFixed(2)}</span>
                )}
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase opacity-60">
                  {isOutOfStock ? "Out of Stock" : "Professional Distribution"}
                </span>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-zinc-500 font-light italic">
                  Or 4 interest-free installments of ₹{(product.price / 4).toFixed(2)} with{" "}
                  <span className="font-bold text-brand-gold">PMU Pay</span>
                </p>
              </div>
            </div>

            <div className="prose prose-zinc max-w-none text-zinc-500 font-light leading-relaxed text-base italic border-l-2 border-brand-gold/10 pl-6">
              <p>{product.description}</p>
            </div>

            {/* Variant Switcher */}
            {product.hasVariants && product.options && product.options.length > 0 && (
              <div className="space-y-8">
                {product.options.map((option) => (
                  <div key={option.id} className="space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{option.name}</span>
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((val) => (
                        <button
                          key={val}
                          onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: val }))}
                          className={`px-6 py-3 border transition-all duration-500 text-[10px] font-bold tracking-widest uppercase ${
                            selectedOptions[option.name] === val
                              ? "bg-brand-black text-white shadow-xl scale-105"
                              : "bg-white border-zinc-100 text-zinc-400 hover:border-brand-gold hover:text-brand-gold"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Area */}
            <div className="pt-4 md:pt-10 border-t border-zinc-100 space-y-4 md:space-y-8">
              <div className="flex flex-row gap-2 md:gap-5">
                <div className="flex items-center bg-zinc-50 rounded-none px-2 md:px-5 h-10 md:h-14 border border-zinc-100 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-xs tracking-widest">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                    disabled={isOutOfStock}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || (product.hasVariants && !currentVariant)}
                  className="flex-1 h-10 md:h-14 bg-brand-black text-white hover:bg-brand-gold hover:text-white rounded-none font-bold tracking-[0.4em] text-[9px] md:text-[10px] transition-all duration-700 shadow-xl disabled:opacity-30 uppercase"
                >
                  {isOutOfStock ? "Sold Out" : "Add to Cart"}
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
          </div>
        </div>
      </div>

      {/* Recommended Rail */}
      {recommended.length > 0 && (
        <section className="py-24 bg-white border-t border-zinc-100">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl font-heading text-brand-black text-center mb-2 italic">You may also like</h2>
              <div className="w-12 h-0.5 bg-brand-gold mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                    <p className="text-zinc-500 font-light italic text-xs">₹{item.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
