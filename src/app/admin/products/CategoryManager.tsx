"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Tags,
  AlertCircle 
} from "lucide-react";
import { 
  getCategoriesAction, 
  addCategoryAction, 
  deleteCategoryAction 
} from "./category-actions";
import { toast } from "sonner";

export default function CategoryManager() {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await getCategoriesAction();
      if (res.success && res.categories) {
        setCategories(res.categories);
      } else {
        toast.error(res.error || "Failed to load categories");
      }
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setIsAdding(true);
    try {
      const res = await addCategoryAction(newCategoryName.trim());
      if (res.success) {
        toast.success(`Category "${newCategoryName}" added`);
        setNewCategoryName("");
        fetchCategories();
      } else {
        toast.error(res.error || "Failed to add category");
      }
    } catch (err) {
      toast.error("Failed to add category");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Existing products with this category might need manual updates.`)) return;
    
    setDeletingId(id);
    try {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(res.error || "Failed to delete category");
      }
    } catch (err) {
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if (open) fetchCategories(); }}>
      <DialogTrigger 
        render={
          <Button variant="outline" className="rounded-full text-[10px] font-bold tracking-widest uppercase gap-2 border-zinc-200">
            <Tags className="w-3.5 h-3.5" /> Manage Categories
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-zinc-100 p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Product Categorization</DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-widest font-bold text-zinc-400">
            Define product categories for your inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAdd} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">New Sector Name</Label>
            <div className="flex gap-2">
              <Input 
                id="category-name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Microblading Tools" 
                className="h-12 bg-zinc-50 border-zinc-100 rounded-xl"
              />
              <Button type="submit" disabled={isAdding || !newCategoryName.trim()} className="h-12 w-12 rounded-xl bg-zinc-900 hover:bg-black text-white p-0">
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Existing Sectors</p>
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-200" />
              </div>
            ) : categories.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-400 italic">No categories defined yet.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="group flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand-vibrant-pink/20 transition-all">
                  <span className="text-xs font-bold text-zinc-700">{cat.name}</span>
                  <button 
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deletingId === cat.id}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                  >
                    {deletingId === cat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
           <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
           <p className="text-[10px] text-amber-700 font-medium leading-relaxed uppercase tracking-tighter">
             Note: Deleting a category does not remove products from it, but will remove it from the filter dropdowns.
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
