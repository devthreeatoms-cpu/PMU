"use client";

import { Suspense, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useState, useEffect } from "react";
import { getProducts, getShopAllSettings, DEFAULT_SHOP_ALL_SETTINGS } from "@/lib/services/admin";
import { Product, ShopAllSettings } from "@/lib/types";
import { Pagination } from "@/components/ui/pagination";

import { getCategoriesAction } from "@/app/admin/products/category-actions";

const ITEMS_PER_PAGE = 12;

function ProductGrid() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [settings, setSettings] = useState<ShopAllSettings>(DEFAULT_SHOP_ALL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[\s/&_-]+/g, '-') 
      .replace(/[^\w-]/g, '')    
      .replace(/^-+|-+$/g, '');
  };

  const [sortBy, setSortBy] = useState("alphabetical-az");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [priceFilterOpen, setPriceFilterOpen] = useState(false);
  const [sortFilterOpen, setSortFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesRes] = await Promise.all([
          getProducts(),
          getCategoriesAction()
        ]);
        
        setProducts(productsData);
        if (categoriesRes.success && categoriesRes.categories) {
          setCategories(categoriesRes.categories);
        }
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
      }

      try {
        const settingsData = await getShopAllSettings();
        setSettings(settingsData);
      } catch (error) {
        console.warn("Using default settings due to fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Listen for navbar interaction to close page filters
  useEffect(() => {
    const handleCloseFilters = () => {
      setPriceFilterOpen(false);
      setSortFilterOpen(false);
    };
    
    window.addEventListener('close-page-filters', handleCloseFilters);
    return () => window.removeEventListener('close-page-filters', handleCloseFilters);
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, sortBy, showInStockOnly]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (categoryParam && categoryParam !== "all") {
      if (categoryParam === "on-my-tray") {
        const categoryMap = new Map<string, Product>();
        result.forEach(product => {
          if (!categoryMap.has(product.category)) {
            categoryMap.set(product.category, product);
          }
        });
        result = Array.from(categoryMap.values());
      } else {
        const targetCategory = categories.find(c => slugify(c.name) === categoryParam);
        const categoryName = targetCategory ? targetCategory.name : categoryParam;
        result = result.filter((p) => p.category === categoryName);
      }
    }

    // Status Filter (Only show active products)
    result = result.filter(p => p.isActive !== false);

    // Availability Filter
    if (showInStockOnly) {
      result = result.filter(p => (p.stock || 0) > 0);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low-high":
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case "price-high-low":
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case "alphabetical-za":
          return b.name.localeCompare(a.name);
        case "alphabetical-az":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [categoryParam, products, categories, sortBy, showInStockOnly]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategoryName = useMemo(() => {
    if (!categoryParam || categoryParam === "all") return "All Products";
    if (categoryParam === "on-my-tray") return "On My Tray";
    return categoryParam.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }, [categoryParam]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
    </div>;
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-6 border-b border-zinc-100 mb-12">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-900">
               Viewing: <span className="text-brand-gold ml-2">{activeCategoryName}</span>
            </span>
            <button 
              onClick={() => setShowInStockOnly(!showInStockOnly)}
              className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-colors ml-4 ${showInStockOnly ? 'text-brand-gold' : 'text-zinc-800 hover:text-brand-gold'}`}
            >
              Availability {showInStockOnly ? '(In Stock)' : ''} <ChevronDown className={`h-3 w-3 ${showInStockOnly ? 'rotate-180' : ''}`} />
            </button>
            <div className="relative">
              <button 
                onClick={() => {
                  setPriceFilterOpen(!priceFilterOpen);
                  setSortFilterOpen(false);
                }}
                className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${priceFilterOpen ? 'text-brand-gold' : 'text-zinc-800 hover:text-brand-gold'}`}
              >
                Price <ChevronDown className={`h-3 w-3 transition-transform ${priceFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              {priceFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-zinc-100 shadow-xl z-50 p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                   <p className="text-[9px] text-zinc-400 uppercase tracking-widest mb-2">Filter by Price</p>
                   <div className="space-y-2">
                      <button onClick={() => setPriceFilterOpen(false)} className="block w-full text-left text-[10px] hover:text-brand-gold transition-colors font-bold uppercase">Under ₹1,000</button>
                      <button onClick={() => setPriceFilterOpen(false)} className="block w-full text-left text-[10px] hover:text-brand-gold transition-colors font-bold uppercase">₹1,000 - ₹5,000</button>
                      <button onClick={() => setPriceFilterOpen(false)} className="block w-full text-left text-[10px] hover:text-brand-gold transition-colors font-bold uppercase">Over ₹5,000</button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 relative">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Sort by:</span>
            <button 
              onClick={() => {
                setSortFilterOpen(!sortFilterOpen);
                setPriceFilterOpen(false);
              }}
              className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${sortFilterOpen ? 'text-brand-gold' : 'text-zinc-800 hover:text-brand-gold'}`}
            >
              {sortBy === 'alphabetical-az' ? 'Alphabetically, A-Z' : 
               sortBy === 'alphabetical-za' ? 'Alphabetically, Z-A' :
               sortBy === 'price-low-high' ? 'Price, Low to High' :
               'Price, High to Low'} <ChevronDown className={`h-3 w-3 transition-transform ${sortFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-zinc-100 shadow-xl z-50 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                 {[
                   { id: 'alphabetical-az', label: 'Alphabetically, A-Z' },
                   { id: 'alphabetical-za', label: 'Alphabetically, Z-A' },
                   { id: 'price-low-high', label: 'Price, Low to High' },
                   { id: 'price-high-low', label: 'Price, High to Low' },
                 ].map((option) => (
                   <button 
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setSortFilterOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-[10px] transition-colors font-bold uppercase ${sortBy === option.id ? 'text-brand-gold bg-zinc-50' : 'text-zinc-600 hover:bg-zinc-50 hover:text-brand-gold'}`}
                   >
                     {option.label}
                   </button>
                 ))}
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{filteredProducts.length} products</span>
        </div>
      </div>

      {/* Grid */}
      <div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
        style={{ 
          gap: `${settings.grid.gap}px`,
        }}
      >
        {paginatedProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer flex flex-col space-y-4">
            <div 
              className="relative overflow-hidden bg-white border border-zinc-100 flex items-center justify-center p-0"
              style={{ 
                aspectRatio: '1/1', // Enforced Square Fit
                borderRadius: `${settings.card.borderRadius}px`
              }}
            >
              {product.imageUrls?.[0] ? (
                <img 
                  src={product.imageUrls[0]}
                  alt={product.name}
                  className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                  style={{ 
                    objectFit: 'cover' // Forced Cover Fit
                  }}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              {settings.card.showBadge && (
                <div className="absolute top-4 left-4 z-10">
                   <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-[4px] text-[7px] font-black tracking-[0.3em] uppercase text-zinc-900 border border-zinc-200/50 shadow-sm">
                      {product.name.toLowerCase().includes('mosha') ? 'MOSHA STUDIO' : 'PMU SUPPLY'}
                   </div>
                </div>
              )}
            </div>
            <div 
              className="space-y-1"
              style={{ textAlign: settings.card.textAlignment as any }}
            >
               <h3 
                 className="font-normal leading-snug text-zinc-900 group-hover:text-brand-gold transition-colors line-clamp-2"
                 style={{ fontSize: settings.card.titleSize === 'xs' ? '11px' : settings.card.titleSize === 'sm' ? '12px' : '14px' }}
               >
                 {product.name.startsWith('*') || product.name.startsWith('.') ? product.name : `*${product.name}`}
               </h3>
               <p 
                 className="font-bold text-zinc-900 mt-1"
                 style={{ fontSize: settings.card.priceSize === 'xs' ? '11px' : settings.card.priceSize === 'sm' ? '13px' : '15px' }}
               >
                  {product.salePrice && product.salePrice > 0 ? (
                    <span className={`flex gap-2 items-center ${settings.card.textAlignment === 'center' ? 'justify-center' : settings.card.textAlignment === 'right' ? 'justify-end' : ''}`}>
                      <span className="text-green-600">₹{product.salePrice.toFixed(2)}</span>
                      <span className="line-through text-zinc-400 font-normal text-[0.8em]">₹{product.price.toFixed(2)}</span>
                    </span>
                  ) : (
                    `₹${product.price.toFixed(2)}`
                  )}
               </p>
            </div>
          </Link>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-32 text-center space-y-4">
            <p className="text-zinc-400 text-sm italic">No products found in this collection.</p>
            <Link href="/products" className="text-[10px] font-bold text-brand-gold tracking-widest uppercase border-b border-brand-gold">
               Back to Shop All
            </Link>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="mb-12"
      />
    </>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-8">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-800">Products</span>
        </div>

        <Suspense fallback={<div className="py-20 text-center">Loading collection...</div>}>
          <ProductGrid />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
