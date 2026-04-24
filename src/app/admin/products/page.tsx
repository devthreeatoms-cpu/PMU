"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Pencil, Loader2, PackageOpen, Search, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { getProductsAction, deleteProductAction, toggleProductStatusAction } from "./actions";
import { Pagination } from "@/components/ui/pagination";
import CategoryManager from "./CategoryManager";

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const result = await toggleProductStatusAction(id, currentStatus);
      if (!result.success) throw new Error(result.error);
      
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, isActive: !currentStatus } : p
      ));
      toast.success(`Product marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  // Search/Filter logic
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return products;
    
    const term = debouncedSearchTerm.toLowerCase().trim();
    return products.filter((product) => 
      product.name.toLowerCase().includes(term) || 
      (product.category && product.category.toLowerCase().includes(term))
    );
  }, [products, debouncedSearchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
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
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-[300px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-brand-gold transition-colors" />
            <Input 
              placeholder="Search catalog..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 rounded-full bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-brand-gold/20 h-10 text-[11px] font-medium placeholder:text-zinc-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <CategoryManager />
          <Link href="/admin/products/new">
            <Button className="bg-brand-gold hover:bg-brand-gold/90 text-white rounded-full text-[10px] font-bold tracking-widest uppercase px-8 h-10 w-full sm:w-auto">
              <Plus className="h-3.5 w-3.5 mr-2" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-[2rem] bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-zinc-100 hover:bg-transparent">
                <TableHead className="w-[80px] text-[10px] uppercase tracking-widest font-bold">Image</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Designation</TableHead>
                <TableHead className="hidden md:table-cell text-[10px] uppercase tracking-widest font-bold">Category</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Value</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold">Supply</TableHead>
                <TableHead className="hidden sm:table-cell text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-gold/40" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-4">Syncing Inventory...</p>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-24 text-zinc-400">
                    <PackageOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No products found.</p>
                    <p className="text-[10px] mt-2 italic">Try a different search or add a product.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id} className="border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                    <TableCell>
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-100 flex-shrink-0 group-hover:scale-105 transition-transform">
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
                    <TableCell className="font-medium max-w-[150px] md:max-w-[200px]">
                      <div className="flex flex-col">
                        <span className="truncate text-sm text-zinc-900" title={product.name}>{product.name}</span>
                        <span className="md:hidden text-[9px] text-zinc-400 uppercase font-bold tracking-tighter mt-0.5">{product.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-zinc-500 text-xs font-medium">{product.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-zinc-900">₹{product.price.toFixed(2)}</span>
                        {product.salePrice && product.salePrice > 0 && (
                          <span className="text-[9px] text-green-600 font-bold uppercase tracking-tighter">On Sale</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold ${product.stock === 0 ? "text-red-500" : "text-zinc-600"}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={product.isActive !== false}
                          onCheckedChange={() => handleToggleStatus(product.id!, product.isActive !== false)}
                          disabled={togglingId === product.id}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          product.isActive !== false ? "text-green-600" : "text-zinc-400"
                        }`}>
                          {product.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${product.id}`} target="_blank">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                            title="View on Storefront"
                          >
                            <Eye size={16} />
                          </Button>
                        </Link>
                        
                        <Link href={`/admin/products/${product.id}`}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full text-zinc-400 hover:text-brand-gold hover:bg-zinc-100"
                            title="Edit Product"
                          >
                            <Pencil size={16} />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(product.id!)}
                          disabled={deletingId === product.id}
                          title="Delete Product"
                        >
                          {deletingId === product.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Trash2 size={16} />
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
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
