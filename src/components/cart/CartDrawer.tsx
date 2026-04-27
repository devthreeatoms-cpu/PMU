"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white border-l border-zinc-100 p-0">
        <div className="flex flex-col h-full px-4 md:px-8 py-6 md:py-10">
          <SheetHeader className="pb-8 border-b border-zinc-50">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-2xl md:text-3xl font-heading italic text-zinc-900">Your Selection</SheetTitle>
              <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">{items.length} items</span>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-8 space-y-8 no-scrollbar -mx-2 px-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-6">
                <p className="font-light italic">Your bag is empty</p>
                <Button variant="outline" className="rounded-none border-zinc-200 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-zinc-50 transition-colors" onClick={() => setIsOpen(false)}>
                  EXPLORE COLLECTIONS
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.product.id}-${item.variantId}`} className="flex gap-4 md:gap-6 border-b border-zinc-50 pb-6 md:pb-8 last:border-0">
                  <div className="relative w-20 h-24 md:w-24 md:h-28 bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0 group">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.product.imageUrls[0]})` }}
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-[11px] tracking-widest uppercase text-zinc-900 line-clamp-2 leading-relaxed">{item.product.name}</h4>
                      {item.variantName && (
                        <p className="text-[9px] font-bold text-brand-gold mt-1 uppercase tracking-widest">Variant: {item.variantName}</p>
                      )}
                      <p className="text-sm font-light mt-3 text-zinc-900 italic">
                        ₹{(item.variantId 
                          ? (item.product.variants?.find(v => v.id === item.variantId)?.salePrice ?? item.product.variants?.find(v => v.id === item.variantId)?.price ?? item.product.salePrice ?? item.product.price)
                          : (item.product.salePrice ?? item.product.price)
                        ).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center border border-zinc-100 bg-zinc-50 px-2">
                        <button 
                          className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                          onClick={() => updateQuantity(item.product.id as string, Math.max(1, item.quantity - 1), item.variantId)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                        <button 
                          className="p-2 text-zinc-400 hover:text-brand-black transition-colors"
                          onClick={() => updateQuantity(item.product.id as string, item.quantity + 1, item.variantId)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <button 
                        className="text-zinc-300 hover:text-brand-gold p-1 transition-colors"
                        onClick={() => removeItem(item.product.id as string, item.variantId)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="pt-8 border-t border-zinc-100 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400">Subtotal</span>
                  <span className="text-2xl font-heading italic text-zinc-900">₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-400">Shipping</span>
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-gold">Calculated at Checkout</span>
                </div>
              </div>

              <div className="grid gap-3 pt-4">
                <Button 
                  onClick={() => {
                    setIsOpen(false);
                    if (user) {
                      router.push("/checkout");
                    } else {
                      router.push("/login?returnUrl=/checkout");
                    }
                  }}
                  className="w-full h-14 bg-brand-black hover:bg-brand-gold text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-none transition-all duration-700 shadow-xl"
                >
                  SECURE CHECKOUT
                </Button>
                <p className="text-[9px] text-zinc-400 tracking-widest uppercase text-center italic">Professional grade PMU equipment only</p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
