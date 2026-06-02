import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/products/ProductCardSkeleton";

// Shown instantly while the home page (server data) is loading.
export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-16 w-1/2" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <Skeleton className="h-12 w-48 mt-4" />
          </div>
          <Skeleton className="aspect-square w-full max-w-[500px] mx-auto rounded-[3rem]" />
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 md:py-24 bg-brand-cream/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-72" />
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
