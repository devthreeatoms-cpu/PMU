import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getProductByIdServer, getAllProductsServer } from "@/lib/services/server";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";

// ─── Per-product metadata (title, description, OG) ──────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdServer(id);

  if (!product) {
    return {
      title: "Product Not Found | PMU Supply",
      description: "The requested PMU product could not be found.",
    };
  }

  const title = `${product.name} | PMU Supply`;
  const description =
    product.description ||
    `Buy ${product.name} from PMU Supply — professional permanent makeup supplies.`;
  const image = product.imageUrls?.[0] ?? "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image
        ? [{ url: image, width: 800, height: 800, alt: product.name }]
        : [],
      type: "website",
      siteName: "PMU Supply",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

// ─── Pre-render all product pages at build time (ISR for new products) ───────

export async function generateStaticParams() {
  try {
    const products = await getAllProductsServer();
    return products.map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

// Enable ISR — revalidate product pages every 60 seconds
export const revalidate = 60;

// ─── Server Component Page ───────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch product and recommended products in parallel on the server
  const [product, allProducts] = await Promise.all([
    getProductByIdServer(id),
    getAllProductsServer(),
  ]);

  if (!product) {
    notFound();
  }

  // Pick 4 random other products for the recommendation rail
  const recommended = allProducts
    .filter((p) => p.id !== product.id && p.isActive !== false)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // ── JSON-LD Structured Data for Google Rich Snippets ──────────────────────
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `Professional PMU product: ${product.name}`,
    image: product.imageUrls ?? [],
    brand: {
      "@type": "Brand",
      name: "PMU Supply",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.pmusupply.com/products/${product.id}`,
      priceCurrency: "INR",
      price: product.salePrice && product.salePrice > 0 ? product.salePrice : product.price,
      availability:
        (product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "PMU Supply",
      },
    },
  };

  return (
    <main className="min-h-screen bg-white">
      {/* JSON-LD for Google rich product snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      {/* All interactive content (carousel, add-to-cart, variants) is a client island */}
      <ProductDetailClient product={product} recommended={recommended} />

      <Footer />
    </main>
  );
}
