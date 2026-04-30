"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingCart as CartIcon, 
  User as UserIcon, 
  Search as SearchIcon, 
  Menu as MenuIcon, 
  X, 
  LogOut, 
  ChevronDown 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "./SearchOverlay";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getCategoriesAction } from "@/app/admin/products/category-actions";
import { getCouponsAction } from "@/app/admin/coupons/actions";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { getCartCount, setIsOpen } = useCartStore();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const [catRes, coupRes] = await Promise.all([
        getCategoriesAction(),
        getCouponsAction()
      ]);

      if (catRes.success && catRes.categories) {
        const filtered = catRes.categories
          .filter(cat => cat.name.toLowerCase() !== 'other')
          .map(cat => {
            let displayName = cat.name;
            if (cat.name === 'Machines & Power Supplies') displayName = 'Machines';
            if (cat.name === 'Anesthetic/Numbing') displayName = 'Numbing';
            return { ...cat, displayName };
          });
        setCategories(filtered);
      }

      if (coupRes.success && coupRes.coupons) {
        const now = Date.now();
        const descriptions = Array.from(new Set(
          coupRes.coupons
            .filter((c: any) => {
              const expiryMs = c.expiryDate
                ? typeof c.expiryDate === 'number'
                  ? c.expiryDate
                  : c.expiryDate.toMillis?.() ?? 0
                : 0;
              const isNotExpired = expiryMs === 0 || expiryMs > now;
              return c.isActive && isNotExpired && c.description;
            })
            .map((c: any) => c.description.trim())
        ));

        if (descriptions.length > 0) {
          setAnnouncement(descriptions.join(' • '));
        } else {
          setAnnouncement("");
        }
      }
    }
    loadData();
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[\s/&_-]+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/^-+|-+$/g, '');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <>
      <header className="relative w-full bg-white border-b">
        {announcement && (
          <div className="bg-brand-rose text-brand-black py-1.5 md:py-2 border-b border-brand-gold/10 text-center px-4">
            <span className="text-[9px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.3em] uppercase block break-words whitespace-normal leading-tight">
              {announcement}
            </span>
          </div>
        )}

        <div className="w-full px-4 md:px-12">
          {/* Row 1: Logo and Action Icons */}
          <div className="flex items-center justify-between h-16 md:h-20 relative">
            {/* Left: Mobile Toggler (Mobile Only) */}
            <div className="flex-none lg:hidden z-30">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1 hover:bg-zinc-100 rounded-md transition-colors text-brand-black"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Left Spacer for Desktop Centering */}
            <div className="hidden lg:flex lg:flex-1" />

            {/* Center: Logo (Shifted down further on both mobile and desktop) */}
            <div className="flex-shrink-0 flex justify-center absolute left-[42%] xs:left-[45%] lg:left-1/2 -translate-x-1/2 top-[62%] md:top-[66%] -translate-y-1/2 z-20 pointer-events-none">
              <Link href={user ? "/products" : "/"} className="block group transition-all duration-300 hover:scale-105 pointer-events-auto">
                <div className="relative h-24 w-52 md:h-52 md:w-[450px]">
                  <Image 
                    src="/images/logo1.png" 
                    alt="PMU SUPPLY" 
                    fill
                    className="object-contain brightness-[1.05] contrast-[1.1] transition-all duration-500"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
                    quality={100}
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Right: Action Icons */}
            <div className="flex-none lg:flex-1 flex items-center justify-end gap-0.5 md:gap-4 z-30">
              <button onClick={() => setIsSearchOpen(true)} className="p-1 md:p-2 hover:text-brand-gold transition-colors group">
                <SearchIcon className="h-5 w-5 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
              </button>
              {user ? (
                <Link href="/profile" className="p-1 md:p-2 hover:text-brand-gold transition-colors group">
                  <UserIcon className="h-5 w-5 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
                </Link>
              ) : (
                <Link href="/login" className="p-1 md:p-2 hover:text-brand-gold transition-colors group">
                  <UserIcon className="h-5 w-5 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
                </Link>
              )}
              <button onClick={() => setIsOpen(true)} className="relative p-1 md:p-2 hover:text-brand-gold transition-colors group">
                <CartIcon className="h-5 w-5 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
                {mounted && getCartCount() > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-brand-gold text-white text-[8px] md:text-[10px] font-bold flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Navigation Links */}
          <nav className="hidden lg:flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-4 border-t border-zinc-50 relative z-30">
            <Link href="/products" className="text-[11px] font-bold tracking-[0.2em] text-zinc-800 hover:text-brand-gold transition-colors whitespace-nowrap uppercase">Shop All</Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${slugify(cat.name)}`}
                className="text-[11px] font-bold tracking-[0.2em] text-zinc-800 hover:text-brand-gold transition-colors whitespace-nowrap uppercase"
              >
                {cat.displayName || cat.name}
              </Link>
            ))}
            <Link href="/pages/contact" className="text-[11px] font-bold tracking-[0.2em] text-zinc-800 hover:text-brand-gold transition-colors whitespace-nowrap uppercase">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden bg-brand-cream animate-in slide-in-from-left duration-300 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-8 pb-20">
            <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block">
                <div className="relative h-20 w-48">
                  <Image 
                    src="/images/logo1.png" 
                    alt="PMU SUPPLY" 
                    fill
                    className="object-contain"
                    quality={100}
                  />
                </div>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-brand-black">
                <X className="h-6 w-6" />
              </button>
            </div>
            <Link onClick={() => setMobileMenuOpen(false)} href="/products" className="text-2xl font-heading tracking-widest uppercase text-brand-gold border-b border-brand-gold/10 pb-4 hover:text-brand-black transition-colors">Shop All</Link>
            <div className="space-y-6">
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-400">Product Categories</p>
              <div className="grid grid-cols-1 gap-6 pl-2">
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    onClick={() => setMobileMenuOpen(false)}
                    href={`/products?category=${slugify(cat.name)}`}
                    className="text-sm font-bold text-brand-black/60 hover:text-brand-gold transition-colors flex items-center justify-between group uppercase tracking-widest"
                  >
                    {cat.displayName || cat.name}
                    <span className="h-px w-0 bg-brand-gold group-hover:w-8 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-8 pt-8 border-t border-brand-gold/10">
              <Link onClick={() => setMobileMenuOpen(false)} href="/pages/contact" className="block text-lg font-bold tracking-[0.2em] uppercase text-brand-gold hover:text-brand-black transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      )}
      <CartDrawer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
