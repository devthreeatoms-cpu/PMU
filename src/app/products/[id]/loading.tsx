import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly while a product detail page (server data) is loading.
export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 pt-8 md:pt-12">
        {/* Back link */}
        <Skeleton className="h-3 w-24 mb-12" />
      </div>

      <div className="container mx-auto px-4 pb-16 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
          {/* Gallery column */}
          <div className="space-y-6">
            <Skeleton className="aspect-square w-full md:max-h-[500px]" />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-24 h-24 shrink-0" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 md:gap-3 pt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 md:h-24" />
              ))}
            </div>
          </div>

          {/* Information column */}
          <div className="space-y-10 lg:pl-10">
            <div className="space-y-4">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-10 w-3/4" />
              <div className="flex items-center gap-4 pt-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-56" />
            </div>

            {/* Description */}
            <div className="space-y-3 border-l-2 border-zinc-100 pl-6">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>

            {/* Action area */}
            <div className="pt-4 md:pt-10 border-t border-zinc-100 space-y-8">
              <div className="flex gap-2 md:gap-5">
                <Skeleton className="h-10 md:h-14 w-28" />
                <Skeleton className="h-10 md:h-14 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
