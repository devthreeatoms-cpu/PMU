"use client";

import { useState, useEffect } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
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
import { ProductCategory } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { createProductAction } from "../actions";

import { getCategoriesAction } from "../category-actions";

export default function AddProductPage() {
  const { uploadImage, isUploading } = useImageUpload();
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
  });
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const res = await getCategoriesAction();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
      setIsLoadingCategories(false);
    }
    loadCategories();
  }, []);

  const handleExternalImageAdd = () => {
    const url = window.prompt("Paste the image URL:");
    if (url) setImageUrls(prev => [...prev, url]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info("Uploading & optimizing image...");
      const result = await uploadImage(file, 'products/');
      if (result.url) {
        setImageUrls(prev => [...prev, result.url]);
        toast.success("Image uploaded successfully");
      }
      if (result.error) {
        toast.error("Upload failed: " + result.error);
      }
    } catch (err) {
      toast.error("Something went wrong during upload");
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Use Server Action to bypass Firestore Client Security Rules
      const result = await createProductAction({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        salePrice: formData.salePrice,
        sku: formData.sku,
        category: formData.category,
        stock: formData.stock,
        imageUrls,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Failed to create product:", err);
      toast.error(err.message || "Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-zinc-500">Create a new product listing in your catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. Smoothie Skin Treatment" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[150px]" 
                  placeholder="Describe your product clearly..." 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Regular Price (₹)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required 
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price (₹)</Label>
                <Input 
                  id="salePrice" 
                  type="number" 
                  step="0.01" 
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input 
                  id="sku" 
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="MK-10293" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Images & Category) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val || ""})}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload files (converted to WebP automatically) or add external URL links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group rounded-md overflow-hidden border aspect-square">
                  <img src={url} alt={`preview ${i}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2">
                <div className="relative border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 mb-2" />
                      <span className="text-xs font-medium">Upload File</span>
                    </>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleExternalImageAdd}
                  className="border-2 border-dashed rounded-md aspect-square flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors bg-zinc-50 dark:bg-zinc-900"
                >
                  <ImagePlus className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Paste URL</span>
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
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
