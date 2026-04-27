import { notFound } from "next/navigation";
import { getProductByIdServer } from "@/lib/services/server";
import { Navbar } from "@/components/layout/Navbar";

export default async function DebugProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Block access in production — this page exposes raw product data
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { id } = await params;
  const product = await getProductByIdServer(id);

  return (
    <div className="p-10">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Debug Product Data: {id}</h1>
      <pre className="bg-zinc-100 p-6 rounded-xl overflow-auto text-xs">
        {JSON.stringify(product, null, 2)}
      </pre>
    </div>
  );
}
