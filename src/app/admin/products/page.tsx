"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Pencil, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getProductsAction, deleteProductAction } from "./actions";
import { Pagination } from "@/components/ui/pagination";
import CategoryManager from "./CategoryManager";

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await getProductsAction();
      if (!result.success) throw new Error(result.error);
      setProducts(result.products as Product[]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const result = await deleteProductAction(id);
      if (!result.success) throw new Error(result.error);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-[2rem] font-heading font-normal tracking-tight text-zinc-900">Professional Catalog</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Refining Professional Standards</p>
        </div>
        <div className="flex gap-3">
          <CategoryManager />
          <Link href="/admin/products/new">
            <Button className="bg-zinc-900 hover:bg-black text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 h-10">
              <Plus className="h-3.5 w-3.5 mr-2" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-md bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[72px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14 text-zinc-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-zinc-400">
                  <PackageOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No products found.</p>
                  <p className="text-xs mt-1">Start by clicking <strong>Add Product</strong> above.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                      {product.imageUrls?.[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <PackageOpen size={20} />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>
                    {product.name}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">{product.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                      {product.salePrice && product.salePrice > 0 && (
                        <span className="text-xs text-green-600">Sale: ${product.salePrice.toFixed(2)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={product.stock === 0 ? "text-red-500 font-semibold" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive !== false ? "default" : "secondary"}>
                      {product.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-brand-vibrant-pink transition-colors">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(product.id!)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
