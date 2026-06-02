import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for a single product card. Mirrors the real card in
 * `ProductGridClient` / `FeaturedProducts` (square image + title + price)
 * so the grid doesn't shift when real data arrives.
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/**
 * A responsive grid of card placeholders. `count` defaults to a full page.
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
