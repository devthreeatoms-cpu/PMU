import type { Metadata } from "next";
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModernHero } from "@/components/home/ModernHero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ArtistSection } from "@/components/home/ArtistSection";
import { GallerySection } from "@/components/home/GallerySection";
import { getAllProductsServer, getCategoriesServer, getBannersServer, ServerBanner, ServerCategory } from "@/lib/services/server";
import { getHeroSettingsAction } from "./admin/banners/hero-actions";
import { Product } from "@/lib/types";

// ─── Page-level metadata ─────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "PMU Supply — Elite Permanent Makeup Products",
  description:
    "Shop professional PMU needles, pigments, machines, and aftercare. All products are 100% vegan, organic, and cruelty-free — tested by professional artists.",
  openGraph: {
    title: "PMU Supply — Elite Permanent Makeup Products",
    description:
      "Shop professional PMU needles, pigments, machines, and aftercare. 100% vegan, organic, cruelty-free.",
    type: "website",
    siteName: "PMU Supply",
    images: [{ url: "/images/landing/collection-hero.png", width: 1200, height: 630, alt: "PMU Supply" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PMU Supply — Elite Permanent Makeup Products",
    description: "Professional PMU supplies — vegan, organic, cruelty-free.",
    images: ["/images/landing/collection-hero.png"],
  },
};

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\s/&_-]+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/^-+|-+$/g, "");

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "Practice Materials": "/images/landing/practice-skins.png",
  "Machines & Power Supplies": "/images/landing/mast-p40.png",
  Machines: "/images/landing/mast-p40.png",
  Pigments: "/images/landing/mast-p60.png",
  Needles: "/images/landing/mast-tour.png",
  "Q Vision Pigments": "/images/landing/q-vision.png",
  "Etalon Hybrid & Mineral": "/images/landing/etalon.png",
  "Anesthetic/Numbing": "/images/landing/numbing.png",
  Numbing: "/images/landing/numbing.png",
  Aftercare: "/images/landing/mast-pro.png",
  "Shaping Tools": "/images/landing/shaping-tools.png",
};

const FALLBACK_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80",
];

// ─── Sub-components (server-compatible, no client state) ─────────────────────

function SectionDivider() {
  return (
    <div className="container mx-auto px-4">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
    </div>
  );
}

function CollectionCard({ title, href, image, count }: { title: string; href: string; image: string; count: string }) {
  return (
    <Link href={href} className="group relative aspect-[4/5] overflow-hidden block rounded-3xl bg-zinc-100">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      <div className="absolute bottom-8 left-8 right-8 space-y-2">
        <span className="text-brand-gold text-[10px] font-bold tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
          Explore Collection
        </span>
        <h3 className="text-white text-2xl font-heading tracking-wide group-hover:text-brand-gold transition-colors">{title}</h3>
        <p className="text-zinc-400 text-[10px] tracking-widest font-light uppercase">{count}</p>
      </div>
    </Link>
  );
}

function ValueItem({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 group">
      <div className="w-16 h-16 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-sm group-hover:border-brand-gold group-hover:shadow-[0_0_20px_rgba(248,184,200,0.1)] transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-black">{title}</h3>
        <p className="text-[9px] font-medium tracking-[0.1em] text-zinc-400 uppercase">{desc}</p>
      </div>
    </div>
  );
}

function DynamicBannerSection({ banner }: { banner: ServerBanner }) {
  const isRight = banner.imageSide === "right";
  const bgClass = banner.bgColor === "white" ? "bg-white" : "bg-brand-cream/50";

  return (
    <section className={`py-24 overflow-hidden ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`${isRight ? "order-2 lg:order-1" : "order-2"} space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700`}>
            <div className="space-y-4">
              {banner.subtitle && (
                <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">{banner.subtitle}</span>
              )}
              <h2 className="text-4xl md:text-6xl font-heading leading-tight text-zinc-900">
                {banner.title} <br />
                {banner.highlightedTitle && (
                  <span className="italic text-[#ff4d8d]">{banner.highlightedTitle}</span>
                )}
              </h2>
            </div>

            <div className="relative pl-8 border-l border-brand-gold/20">
              <p className="text-zinc-600 text-lg leading-relaxed font-light italic">{banner.description}</p>
            </div>

            {banner.badges && banner.badges.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {banner.badges.map((badge, i) => (
                  <span key={i} className="px-5 py-2 bg-white rounded-full border border-zinc-100 text-[9px] font-bold tracking-widest uppercase text-zinc-400 shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {banner.bullets && banner.bullets.length > 0 && (
              <ul className="space-y-3 pt-2">
                {banner.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            <Link href={banner.buttonLink} className="inline-block pt-4">
              <Button size="lg" className="bg-brand-rose text-brand-black hover:bg-brand-black hover:text-white px-10 h-14 rounded-none tracking-[0.2em] text-[10px] font-bold transition-all duration-500 shadow-lg shadow-brand-rose/10">
                {banner.buttonText}
              </Button>
            </Link>
          </div>

          <div className={`${isRight ? "order-1 lg:order-2" : "order-1"} relative animate-in fade-in zoom-in duration-1000`}>
            <div className={`relative aspect-square w-full max-w-[500px] ${isRight ? "ml-auto" : "mr-auto"} rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white`}>
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105"
              />
            </div>
            <div className={`absolute -z-10 top-1/2 -translate-y-1/2 ${isRight ? "-right-20" : "-left-20"} w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl`} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Server Component Page ────────────────────────────────────────────────────

export default async function Home() {
  // Fetch all data on the server in parallel
  const [allProducts, categories, banners, heroRes] = await Promise.all([
    getAllProductsServer(),
    getCategoriesServer(),
    getBannersServer(),
    getHeroSettingsAction()
  ]);

  // Featured products: hand-picked featured products (locked to 4), fallback to first 4 active
  const activeProducts = allProducts.filter((p) => p.isActive !== false);
  const featuredProducts = activeProducts.some(p => p.isFeatured)
    ? activeProducts.filter(p => p.isFeatured).slice(0, 4)
    : activeProducts.slice(0, 4);

  // Build category grid data
  const categoryData = allProducts.reduce(
    (acc: Record<string, { count: number; firstImage: string | null }>, p: Product) => {
      const cat = p.category;
      if (!acc[cat]) acc[cat] = { count: 0, firstImage: p.imageUrls?.[0] || null };
      acc[cat].count += 1;
      return acc;
    },
    {}
  );

  const processedCategories = categories
    .filter((cat) => cat.name.toLowerCase() !== "other")
    .map((cat, index) => {
      const stats = categoryData[cat.name];
      let displayImage = CATEGORY_IMAGE_MAP[cat.name];
      if (!displayImage && stats?.firstImage) displayImage = stats.firstImage;
      if (!displayImage) displayImage = FALLBACK_IMAGE_POOL[index % FALLBACK_IMAGE_POOL.length];
      return { ...cat, count: stats?.count || 0, image: displayImage };
    });

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      <ModernHero settings={heroRes.settings || {
        title: "PRECISION",
        highlightedTitle: "PMU",
        subtitle: "THE COMPLETE CATALOG",
        description: "Enter the vault of unlimited possibilities. From revolutionary E95 Machines to our signature Organic Pigments—we supply everything an elite PMU artist needs.",
        imageUrl: "/images/landing/master-studio.png",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-glitter-particles-moving-in-a-black-background-4217-large.mp4",
        buttonText: "VIEW ALL PRODUCTS",
        buttonLink: "/products",
        stats: [
          { label: "300+", sub: "SKUs" },
          { label: "100%", sub: "Vegan" },
          { label: "PRO", sub: "Level" },
          { label: "INDIA", sub: "Supply" }
        ]
      }} />

      <SectionDivider />

      {/* Featured Collections */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-brand-gold text-[10px] font-bold tracking-[0.4em] uppercase">Curated Catalog</span>
            <h2 className="text-4xl md:text-5xl font-heading font-normal">Featured Collections</h2>
          </div>
          <Link href="/products" className="text-xs font-bold tracking-[0.2em] border-b-2 border-brand-gold pb-1 hover:opacity-70 transition-opacity">
            BROWSE ALL PRODUCTS
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedCategories.map((cat) => (
            <CollectionCard
              key={cat.id}
              title={
                cat.name === "Machines & Power Supplies"
                  ? "Machines"
                  : cat.name === "Anesthetic/Numbing"
                  ? "Numbing"
                  : cat.name
              }
              href={`/products?category=${slugify(cat.name)}`}
              image={cat.image}
              count={`${cat.count} Products`}
            />
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* Featured Products — server rendered */}
      <FeaturedProducts products={featuredProducts} />

      <SectionDivider />
      
      {/* Dynamic Banners — ALL banners now appear together above results */}
      {banners.map((banner, index) => (
        <React.Fragment key={banner.id}>
          <DynamicBannerSection banner={banner} />
          <SectionDivider />
        </React.Fragment>
      ))}

      <GallerySection />

      <SectionDivider />

      {/* Brand Values Strip */}
      <section className="bg-brand-cream py-20 border-y border-brand-gold/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(248,184,200,0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            <ValueItem title="100% Vegan" desc="Ethically Sourced Purity" icon={<CheckCircle2 className="w-8 h-8 text-brand-gold" />} />
            <ValueItem title="Organic Purity" desc="Water-Based Formulations" icon={<Sparkles className="w-8 h-8 text-brand-gold" />} />
            <ValueItem title="Cruelty Free" desc="Leaping Bunny Certified" icon={<Award className="w-8 h-8 text-brand-gold" />} />
            <ValueItem title="Pro Tested" desc="Used by Global Masters" icon={<CheckCircle2 className="w-8 h-8 text-brand-gold" />} />
          </div>
        </div>
      </section>

      <SectionDivider />

      <Footer />
    </main>
  );
}
