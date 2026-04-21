"use client";

import { useCartStore } from "@/store/useCartStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-brand-cream border-brand-gold/10">
        <SheetHeader className="border-b border-brand-gold/10 pb-6">
          <SheetTitle className="text-2xl font-heading italic">Your Selection</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-6">
              <p className="font-light italic">Your bag is empty</p>
              <Button variant="outline" className="rounded-none border-brand-black text-[10px] font-bold tracking-[0.2em] uppercase" onClick={() => setIsOpen(false)}>
                EXPLORE COLLECTIONS
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product.id}-${item.variantId}`} className="flex gap-6 border-b border-brand-gold/5 pb-6">
                <div className="relative w-24 h-28 bg-white shadow-md rounded-none overflow-hidden shrink-0 group">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.product.imageUrls[0]})` }}
                  />
                </div>
                
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-[11px] tracking-widest uppercase text-brand-black line-clamp-1">{item.product.name}</h4>
                    {item.variantName && (
                      <p className="text-[10px] font-light text-brand-gold mt-1 uppercase tracking-tighter italic">Edition: {item.variantName}</p>
                    )}
                    <p className="text-sm font-normal mt-2 text-zinc-900">
                      ${((item.product.salePrice ?? item.product.price) + (item.product.variants?.find(v => v.id === item.variantId)?.priceModifier || 0)).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-zinc-200">
                      <button 
                        className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                        onClick={() => updateQuantity(item.product.id as string, Math.max(1, item.quantity - 1), item.variantId)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                      <button 
                        className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                        onClick={() => updateQuantity(item.product.id as string, item.quantity + 1, item.variantId)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      className="text-zinc-300 hover:text-brand-gold p-1 transition-colors"
                      onClick={() => removeItem(item.product.id as string, item.variantId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-brand-black pt-6 space-y-6 mt-auto">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-50">Subtotal</span>
              <span className="text-2xl font-heading italic">${getCartTotal().toFixed(2)}</span>
            </div>
            <p className="text-[9px] text-zinc-400 tracking-widest uppercase text-center italic">Complimentary luxury shipping over $150</p>
            <div className="grid gap-3">
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-14 bg-brand-rose hover:bg-brand-gold text-brand-black text-[10px] font-bold tracking-[0.3em] uppercase rounded-none transition-all duration-500 shadow-xl shadow-brand-gold/10">
                  SECURE CHECKOUT
                </Button>
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
