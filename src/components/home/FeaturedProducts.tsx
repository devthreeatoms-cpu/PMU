import Link from "next/link";
import { Product } from "@/lib/types";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-brand-cream/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-[#ff4d8d] text-[10px] font-bold tracking-[0.4em] uppercase">Artist Selection</span>
            <h2 className="text-4xl md:text-5xl font-heading font-normal">
              Featured <span className="italic text-[#ff4d8d]">Products</span>
            </h2>
          </div>
          <Link href="/products" className="text-[10px] font-bold tracking-[0.3em] border-b border-brand-black pb-1 uppercase hover:opacity-70 transition-opacity">
            Shop All Collection
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group space-y-4">
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-zinc-100 border border-zinc-100 relative">
                <img
                  src={product.imageUrls?.[0] || "https://placehold.co/400x400?text=No+Image"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-900 group-hover:text-[#ff4d8d] transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-zinc-400 text-[10px] font-bold">₹{product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
