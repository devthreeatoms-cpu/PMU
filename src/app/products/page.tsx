import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { getAllProductsServer, getCategoriesServer } from "@/lib/services/server";
import { ProductGridClient } from "@/components/products/ProductGridClient";

// ─── Per-page metadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;

  const categoryLabel =
    !category || category === "all"
      ? "All Products"
      : category === "on-my-tray"
      ? "On My Tray"
      : category
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  const title = category
    ? `${categoryLabel} | PMU Supply`
    : "Shop All PMU Supplies | PMU Supply";

  const description = category
    ? `Browse our ${categoryLabel} collection — professional PMU products for elite artists.`
    : "Shop professional PMU needles, pigments, machines, aftercare, and more. Vegan, organic, cruelty-free.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "PMU Supply",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// ─── Server Component Page ───────────────────────────────────────────────────

export default async function ProductsPage() {
  // Fetch initial data on the server — Google sees all products in the HTML
  const [products, categoriesResult] = await Promise.all([
    getAllProductsServer(),
    getCategoriesServer(),
  ]);

  // Filter to only active products
  const activeProducts = products.filter((p) => p.isActive !== false);

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-8">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-800">Products</span>
        </div>

        {/*
          ProductGridClient handles all interactive filtering/sorting/pagination.
          It receives the full product list from the server so the initial render
          (what Google crawls) contains real product data.
        */}
        <Suspense fallback={<div className="py-20 text-center">Loading collection...</div>}>
          <ProductGridClient
            initialProducts={activeProducts}
            initialCategories={categoriesResult}
          />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
