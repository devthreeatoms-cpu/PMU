import { getProductById } from "@/lib/services/admin";
import { Navbar } from "@/components/layout/Navbar";

export default async function DebugProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

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
