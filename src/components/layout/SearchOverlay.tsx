"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/services/admin";
import { getCategoriesAction } from "@/app/admin/products/category-actions";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
      loadData();
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [allProducts, categoriesRes] = await Promise.all([
        getProducts(),
        getCategoriesAction()
      ]);
      setProducts(allProducts);
      if (categoriesRes.success && categoriesRes.categories) {
        setCategories(categoriesRes.categories);
      }
    } catch (error) {
      console.error("Failed to load search data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (query.trim().length > 1) {
      const searchTerm = query.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm)
      );
      setResults(filtered.slice(0, 8));
    } else {
      setResults([]);
    }
  }, [query, products]);

  if (!isOpen) return null;

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[\s/&_-]+/g, '-') 
      .replace(/[^\w-]/g, '')    
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-10 md:pt-20 px-2 md:px-4 bg-brand-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-4 p-4 md:p-6 border-b border-zinc-50">
          <Search className="h-5 w-5 md:h-6 md:h-6 text-brand-gold" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className="flex-1 bg-transparent border-none outline-none text-base md:text-xl font-medium placeholder:text-zinc-300 text-brand-black"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-brand-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
          {query.trim().length <= 1 ? (
            <div className="p-5 md:p-8 space-y-6 md:space-y-8">
              <div>
                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-gold mb-4">Trending Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${slugify(cat.name)}`}
                      onClick={onClose}
                      className="px-4 py-2 bg-zinc-50 hover:bg-brand-rose hover:text-brand-black text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors text-zinc-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-brand-gold mb-4">Quick Navigation</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "New Arrivals", href: "/products" },
                    { label: "On My Tray", href: "/products?category=on-my-tray" },
                    { label: "International", href: "/pages/international" },
                    { label: "Track Order", href: "/profile" },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-800">{link.label}</span>
                      <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-brand-gold transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {results.length > 0 ? (
                <div className="space-y-2">
                  <p className="px-4 py-2 text-[9px] font-black tracking-[0.3em] uppercase text-brand-gold">Search Results ({results.length})</p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="h-16 w-16 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                        {product.imageUrls?.[0] ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-bold tracking-widest uppercase text-brand-gold mb-1">{product.category}</p>
                        <h4 className="text-sm font-bold text-brand-black truncate group-hover:text-brand-gold transition-colors">{product.name}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          {product.salePrice && product.salePrice > 0 ? (
                            <>
                              <p className="text-xs font-bold text-green-600">₹{product.salePrice.toFixed(2)}</p>
                              <p className="text-[10px] font-normal text-zinc-400 line-through">₹{product.price.toFixed(2)}</p>
                            </>
                          ) : (
                            <p className="text-xs font-bold text-zinc-600">₹{product.price.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-200 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                  <Link 
                    href="/products" 
                    onClick={onClose}
                    className="block p-4 text-center text-[10px] font-black tracking-[0.3em] uppercase text-brand-gold hover:bg-zinc-50 rounded-2xl transition-colors mt-4"
                  >
                    View All Results
                  </Link>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <p className="text-zinc-400 font-medium">No results found for "{query}"</p>
                  <p className="text-[10px] text-zinc-300 uppercase tracking-widest">Try a different keyword</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
