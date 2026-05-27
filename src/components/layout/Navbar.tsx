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

        <div className="w-full px-4 md:px-10 xl:px-14">
          {/* Row 1: Logo and Action Icons */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-24 md:h-36 gap-4">
            {/* Left: Mobile Toggler (Mobile) / Spacer (Desktop) */}
            <div className="flex items-center justify-start lg:w-32">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-brand-black"
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link
                href="/"
                className="block group transition-transform duration-300 hover:scale-[1.02]"
                aria-label="PMU Supplies India - Home"
              >
                <div className="relative h-20 w-64 md:h-32 md:w-[26rem]">
                  <Image
                    src="/images/logo-horizontal.png"
                    alt="PMU Supplies India"
                    fill
                    sizes="(max-width: 768px) 256px, 416px"
                    className="object-contain"
                    quality={100}
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Right: Action Icons */}
            <div className="flex items-center justify-end gap-1 md:gap-2 lg:w-32">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-brand-rose/40 text-brand-black hover:text-brand-gold transition-all duration-200"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
              <Link
                href={user ? "/profile" : "/login"}
                className="p-2 rounded-full hover:bg-brand-rose/40 text-brand-black hover:text-brand-gold transition-all duration-200"
                aria-label={user ? "My account" : "Sign in"}
              >
                <UserIcon className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-full hover:bg-brand-rose/40 text-brand-black hover:text-brand-gold transition-all duration-200"
                aria-label="Open cart"
              >
                <CartIcon className="h-5 w-5" />
                {mounted && getCartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-gold text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-x-1 xl:gap-x-2 py-3 border-t border-zinc-100 relative z-30">
            <Link
              href="/products"
              className="group relative px-3 py-2 text-[11px] font-semibold tracking-[0.18em] text-zinc-800 hover:text-brand-gold transition-colors whitespace-nowrap uppercase"
            >
              Shop All
              <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${slugify(cat.name)}`}
                className="group relative px-3 py-2 text-[11px] font-semibold tracking-[0.18em] text-zinc-800 hover:text-brand-gold transition-colors whitespace-nowrap uppercase"
              >
                {cat.displayName || cat.name}
                <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
              </Link>
            ))}
            <Link
              href="/pages/contact"
              className="group relative px-3 py-2 text-[11px] font-semibold tracking-[0.18em] text-zinc-800 hover:text-brand-gold transition-colors whitespace-nowrap uppercase"
            >
              Contact
              <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden bg-brand-cream animate-in slide-in-from-left duration-300 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-8 pb-20">
            <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block" aria-label="PMU Supplies India - Home">
                <div className="relative h-20 w-52">
                  <Image
                    src="/images/logo-horizontal.png"
                    alt="PMU Supplies India"
                    fill
                    sizes="208px"
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
