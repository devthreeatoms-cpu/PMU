"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart as CartIcon,
  User as UserIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "./SearchOverlay";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getCategoriesAction } from "@/app/admin/products/category-actions";
import { getActiveCouponsAction } from "@/app/admin/coupons/actions";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const { getCartCount, setIsOpen } = useCartStore();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const [catRes, coupRes] = await Promise.all([
        getCategoriesAction(),
        getActiveCouponsAction()
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
        const descriptions = Array.from(new Set(
          coupRes.coupons
            .filter((c: any) => c.description)
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

  const navLinks = [
    { href: "/products", label: "Shop All", active: pathname === "/products" },
    ...categories.map((cat: any) => ({
      href: `/products?category=${slugify(cat.name)}`,
      label: cat.displayName || cat.name,
      active: false,
    })),
    { href: "/pages/contact", label: "Contact", active: pathname === "/pages/contact" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-white border-b border-zinc-100 transition-[box-shadow] duration-300 ${
          scrolled ? "shadow-[0_8px_28px_-12px_rgba(26,26,26,0.18)]" : "shadow-none"
        }`}
      >
        {announcement && (
          <div className="bg-brand-rose text-brand-black py-1.5 md:py-2 border-b border-brand-gold/10 text-center px-4">
            <span className="text-[9px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.3em] uppercase block break-words whitespace-normal leading-tight">
              {announcement}
            </span>
          </div>
        )}

        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
          {/* Row 1: menu left · logo center · actions right */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 h-[4.5rem] md:h-[5.25rem]">
            <div className="flex items-center justify-start">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-1 hover:bg-zinc-100 rounded-md transition-colors text-brand-black"
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex justify-center">
              <Link
                href="/"
                className="block group"
                aria-label="PMU Supplies India - Home"
              >
                <div className="relative h-14 w-[9.5rem] sm:h-16 sm:w-44 md:h-[4.75rem] md:w-56 overflow-hidden">
                  <Image
                    src="/images/logo-horizontal.png"
                    alt="PMU Supplies India"
                    fill
                    sizes="(max-width: 640px) 152px, (max-width: 768px) 176px, 224px"
                    className="object-contain object-center mix-blend-multiply scale-[1.65] origin-center group-hover:scale-[1.7] transition-transform duration-300"
                    quality={100}
                    priority
                  />
                </div>
              </Link>
            </div>

            <div className="flex items-center justify-end gap-0.5 sm:gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full text-brand-black transition-all duration-200 hover:bg-brand-rose/40 hover:text-brand-gold"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <Link
                href={user ? "/profile" : "/login"}
                className="p-2.5 rounded-full text-brand-black transition-all duration-200 hover:bg-brand-rose/40 hover:text-brand-gold"
                aria-label={user ? "My account" : "Sign in"}
              >
                <UserIcon className="h-5 w-5" strokeWidth={1.75} />
              </Link>
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 rounded-full text-brand-black transition-all duration-200 hover:bg-brand-rose/40 hover:text-brand-gold"
                aria-label="Open cart"
              >
                <CartIcon className="h-5 w-5" strokeWidth={1.75} />
                {mounted && getCartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-gold text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Nav — scrollable so labels never clip */}
          <nav
            aria-label="Primary"
            className="hidden lg:block border-t border-zinc-100 -mx-4 sm:-mx-6 lg:-mx-8"
          >
            <div className="flex items-center justify-center gap-x-0.5 xl:gap-x-1 overflow-x-auto px-4 sm:px-6 lg:px-8 no-scrollbar">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={`group relative shrink-0 px-2.5 xl:px-3.5 py-3 text-[10px] xl:text-[11px] font-semibold tracking-[0.14em] xl:tracking-[0.16em] whitespace-nowrap uppercase transition-colors duration-200 ${
                    link.active ? "text-brand-gold" : "text-zinc-800 hover:text-brand-gold"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-2.5 right-2.5 xl:left-3.5 xl:right-3.5 bottom-1.5 h-px bg-brand-gold transition-transform duration-300 origin-center ${
                      link.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden bg-brand-cream animate-in slide-in-from-left duration-300 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-8 pb-20">
            <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block" aria-label="PMU Supplies India - Home">
                <div className="relative h-16 w-44 overflow-hidden">
                  <Image
                    src="/images/logo-horizontal.png"
                    alt="PMU Supplies India"
                    fill
                    sizes="176px"
                    className="object-contain object-left mix-blend-multiply scale-[1.65] origin-left"
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
