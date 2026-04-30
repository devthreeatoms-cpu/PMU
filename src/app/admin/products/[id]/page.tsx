"use client";

import { useState, useEffect, use } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ImagePlus, Loader2, X, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProductCategory, Product } from "@/lib/types";
import { getProductAction, updateProductAction, getFeaturedCountAction } from "../actions";
import VariantManager from "../VariantManager";
import { ProductOption, ProductVariant } from "@/lib/types";

import { getCategoriesAction } from "../category-actions";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { uploadImage, isUploading, isProcessing, progress } = useImageUpload();
  const router = useRouter();
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    sku: "",
    category: "",
    stock: "0",
    isActive: true,
    isFeatured: false,
  });
  
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  const [images, setImages] = useState<{url: string, file?: File}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [featuredCount, setFeaturedCount] = useState(0);
  const [initialIsFeatured, setInitialIsFeatured] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [catRes, featRes] = await Promise.all([
        getCategoriesAction(),
        getFeaturedCountAction()
      ]);
      if (catRes.success && catRes.categories) setCategories(catRes.categories);
      if (featRes.success) setFeaturedCount(featRes.count || 0);
      setIsLoadingCategories(false);
    }
    loadData();
  }, []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProductAction(unwrappedParams.id);
        if (result.success && result.product) {
          const p = result.product as Product;
          setFormData({
            name: p.name,
            description: p.description,
            price: p.price.toString(),
            salePrice: p.salePrice?.toString() || "",
            sku: p.sku || "",
            category: p.category,
            stock: p.stock.toString(),
            isActive: p.isActive !== false,
            isFeatured: p.isFeatured || false,
          });
          setHasVariants(p.hasVariants || false);
          setOptions(p.options || []);
          setVariants(p.variants || []);
          setInitialIsFeatured(p.isFeatured || false);
          setImages((p.imageUrls || []).map(url => ({ url })));
        } else {
          setError(result.error || "Failed to load product");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [unwrappedParams.id]);

  const handleExternalImageAdd = () => {
    const url = window.prompt("Paste the image URL:");
    if (url) setImages(prev => [...prev, { url }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      file
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove.file) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      // 1. Upload pending files first
      const finalImageUrls: string[] = [];
      const filesToUpload = images.filter(img => img.file);
      const existingUrls = images.filter(img => !img.file).map(img => img.url);

      if (filesToUpload.length > 0) {
        toast.info(`Uploading ${filesToUpload.length} image(s)...`);
      }

      for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i];
        if (item.file) {
          const result = await uploadImage(item.file, 'products/');
          if (result.url) {
            finalImageUrls.push(result.url);
          } else {
            throw new Error(result.error || "Failed to upload an image");
          }
        }
      }

      const allUrls = [...existingUrls, ...finalImageUrls];

      // 2. Update product with final URLs
      const result = await updateProductAction(unwrappedParams.id, {
        ...formData,
        imageUrls: allUrls,
        hasVariants,
        options: hasVariants ? options : [],
        variants: hasVariants ? variants : [],
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-vibrant-pink" />
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-zinc-400">Archiving Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center space-y-6 max-w-md mx-auto">
        <AlertCircle className="w-16 h-16 text-red-100 mx-auto" />
        <h2 className="text-2xl font-heading">Archival Mismatch</h2>
        <p className="text-zinc-500 text-sm font-light italic">{error}</p>
        <Link href="/admin/products">
          <Button variant="outline" className="rounded-full px-8">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Refining Professional Inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-50">
              <CardTitle className="text-lg">Product Essence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Designation</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  className="h-14 bg-zinc-50/50 border-zinc-100 focus:ring-brand-vibrant-pink/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Narrative</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[200px] bg-zinc-50/50 border-zinc-100 resize-none" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Economics & Supply</CardTitle>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-zinc-100 shadow-sm">
                  <Label htmlFor="variant-toggle" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Has Variants</Label>
                  <Switch 
                    id="variant-toggle"
                    checked={hasVariants}
                    onCheckedChange={setHasVariants}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {!hasVariants ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Regular Asset Value (₹)</Label>
                    <Input 
                      id="price" type="number" step="0.01" value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required className="h-12 bg-zinc-50/50 border-zinc-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Promotional Value (₹)</Label>
                    <Input 
                      id="salePrice" type="number" step="0.01" value={formData.salePrice}
                      onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                      className="h-12 bg-zinc-50/50 border-zinc-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Reference SKU</Label>
                    <Input 
                      id="sku" value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="h-12 bg-zinc-50/50 border-zinc-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Available Inventory</Label>
                    <Input 
                      id="stock" type="number" value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      required className="h-12 bg-zinc-50/50 border-zinc-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="bg-brand-gold/5 border border-brand-gold/10 p-5 rounded-[2rem] flex gap-5 items-start">
                      <div className="bg-white p-3 rounded-2xl shadow-sm">
                        <Info className="h-5 w-5 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Multi-Dimensional Tracking</p>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed italic">
                          This product uses a variant matrix. Base pricing and inventory are overridden by the individual combination specifications below.
                        </p>
                      </div>
                    </div>
                    <VariantManager 
                      options={options}
                      variants={variants}
                      basePrice={parseFloat(formData.price) || 0}
                      baseSku={formData.sku}
                      onChange={(opts, vars) => {
                        setOptions(opts);
                        setVariants(vars);
                      }}
                    />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden">
             <CardHeader className="bg-zinc-50/50 border-b border-zinc-50">
                <CardTitle className="text-lg">Classification</CardTitle>
             </CardHeader>
             <CardContent className="pt-8">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Artistry Sector</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({...formData, category: val || ""})}
                  >
                    <SelectTrigger id="category" className="h-12 bg-zinc-50/50 border-zinc-100 text-xs">
                      <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select sector"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className="text-xs">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden">
             <CardHeader className="bg-zinc-50/50 border-b border-zinc-50">
                <CardTitle className="text-lg">Visibility Status</CardTitle>
             </CardHeader>
             <CardContent className="pt-8">
                <div className="flex items-center justify-between p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100 mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Storefront Visibility</Label>
                    <p className="text-[9px] text-zinc-400">Control if this product is visible to customers.</p>
                  </div>
                  <Switch 
                    id="status"
                    checked={formData.isActive} 
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-brand-cream/30 rounded-2xl border border-brand-gold/10">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Featured Spotlight</Label>
                    <p className="text-[9px] text-zinc-400">Display this product on the Homepage spotlight.</p>
                  </div>
                  <Switch 
                    id="featured"
                    checked={formData.isFeatured} 
                    onCheckedChange={(checked) => {
                      if (checked && !initialIsFeatured && featuredCount >= 4) {
                        toast.info("Only 4 products can be populated in the landing spotlight. Please select your most important 4 products.");
                      }
                      setFormData({...formData, isFeatured: checked});
                    }}
                  />
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-zinc-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-50">
              <CardTitle className="text-lg">Visual Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-8">
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-2xl overflow-hidden border aspect-square">
                    <img src={img.url} alt={`preview ${i}`} className="object-cover w-full h-full" />
                    <button
                      type="button" onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {img.file && (
                      <div className="absolute bottom-2 left-2 bg-brand-gold text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-widest">
                        Pending
                      </div>
                    )}
                  </div>
                ))}

                <label className="border-2 border-dashed rounded-2xl aspect-square flex flex-col items-center justify-center text-zinc-400 hover:text-brand-vibrant-pink hover:border-brand-vibrant-pink/30 hover:bg-brand-vibrant-pink/5 transition-all cursor-pointer">
                  <Input 
                    type="file" accept="image/*" className="hidden" 
                    onChange={handleFileUpload} disabled={isUploading}
                  />
                  {isSubmitting && isUploading ? (
                    <div className="flex flex-col items-center gap-1">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-vibrant-pink" />
                      <span className="text-[8px] font-bold text-brand-vibrant-pink animate-pulse">
                        {isProcessing ? "Optimizing..." : `${Math.round(progress)}%`}
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-[8px] font-black uppercase tracking-widest mt-2">Upload</span>
                    </>
                  )}
                </label>
                
                <button
                  type="button" onClick={handleExternalImageAdd}
                  className="border-2 border-dashed rounded-2xl aspect-square flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-600 transition-all"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[8px] font-black uppercase tracking-widest mt-2">Paste URL</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <button 
            type="submit" 
            className="btn-luxury-active w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Commit Changes
          </button>
        </div>
      </form>
    </div>
  );
}
