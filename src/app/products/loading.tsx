import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";

// Shown instantly while the shop grid page (server data) is loading.
export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-3 w-12" />
          <span className="text-zinc-300">/</span>
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-8 md:mb-12">
          <div className="flex items-center gap-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>

        <ProductGridSkeleton count={12} />
      </div>

      <Footer />
    </main>
  );
}
