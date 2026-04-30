"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Image as ImageIcon, 
  Layout, 
  Type, 
  Link as LinkIcon, 
  Eye, 
  EyeOff,
  Palette,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  getBannersAction, 
  addBannerAction, 
  updateBannerAction, 
  deleteBannerAction, 
  reorderBannersAction,
  type Banner 
} from "../actions";
import { useAuth } from "@/context/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";

export function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { profile } = useAuth();
  
  const canCreate = profile?.isSuperAdmin || profile?.role === 'admin' || profile?.permissions?.banners?.create;
  const canEdit = profile?.isSuperAdmin || profile?.role === 'admin' || profile?.permissions?.banners?.edit;
  const canDelete = profile?.isSuperAdmin || profile?.role === 'admin' || profile?.permissions?.banners?.delete;

  const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({
    title: "",
    subtitle: "",
    description: "",
    imageSide: "right",
    imageUrl: "",
    buttonText: "Shop Now",
    buttonLink: "/products",
    isActive: true,
    order: 0
  });

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const { uploadImage, isUploading, progress } = useImageUpload();

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    const res = await getBannersAction();
    if (res.success && res.banners) {
      setBanners(res.banners);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!currentBanner.title || (!currentBanner.imageUrl && !pendingFile)) {
      toast.error("Title and Image are required");
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = currentBanner.imageUrl || "";

      if (pendingFile) {
        toast.info("Uploading banner image...");
        const result = await uploadImage(pendingFile, "banners/");
        if (result.url) {
          finalImageUrl = result.url;
        } else {
          throw new Error(result.error || "Upload failed");
        }
      }

      const bannerData = { ...currentBanner, imageUrl: finalImageUrl };

      if (currentBanner.id) {
        await updateBannerAction(currentBanner.id, bannerData);
        toast.success("Banner updated successfully");
      } else {
        await addBannerAction({
          ...bannerData as Banner,
          order: banners.length + 1
        });
        toast.success("Banner added successfully");
      }
      setIsEditing(false);
      resetForm();
      loadBanners();
    } catch (error: any) {
      toast.error(error.message || "Failed to save banner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    setDeletingId(id);
    try {
      await deleteBannerAction(id);
      toast.success("Banner deleted");
      loadBanners();
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === id);
    if (currentIndex === -1) return;

    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const temp = newBanners[currentIndex];
    newBanners[currentIndex] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    setBanners(newBanners);

    const bannerIds = newBanners.map(b => b.id as string);
    try {
      const res = await reorderBannersAction(bannerIds);
      if (!res.success) {
         toast.error("Reorder failed");
         loadBanners(); 
      }
    } catch (err) {
      toast.error("Reorder failed");
      loadBanners(); 
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPendingFile(file);
      toast.success("Image selected for upload");
    }
  };

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setPendingFile(null);
    setCurrentBanner({
      title: "",
      subtitle: "",
      description: "",
      imageSide: "right",
      imageUrl: "",
      buttonText: "Shop Now",
      buttonLink: "/products",
      isActive: true,
      order: 0
    });
  };

  if (loading && banners.length === 0) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Homepage Banners</h2>
          <p className="text-zinc-500 text-sm italic">Manage the large scrolling banners shown in the mid-section of the homepage.</p>
        </div>
        {!isEditing && canCreate && (
          <Button onClick={() => { resetForm(); setIsEditing(true); }} className="bg-brand-black text-white gap-2 shrink-0 h-9 px-3 md:px-4 text-[10px] md:text-sm">
            <Plus className="w-4 h-4" />
            <span>Add New Banner</span>
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Banner Title
                </label>
                <Input 
                  value={currentBanner.title || ""} 
                  onChange={e => setCurrentBanner(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Organic Smoothie"
                  className="rounded-xl border-zinc-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Highlighted Title (Italic/Pink)
                </label>
                <Input 
                  value={currentBanner.highlightedTitle || ""} 
                  onChange={e => setCurrentBanner(prev => ({ ...prev, highlightedTitle: e.target.value }))}
                  placeholder="e.g. Skin Treatment"
                  className="rounded-xl border-zinc-200 h-12 font-italic text-brand-rose"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Subtitle (Optional)</label>
                <Input 
                  value={currentBanner.subtitle || ""} 
                  onChange={e => setCurrentBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Ethical Purity"
                  className="rounded-xl border-zinc-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description</label>
                <Textarea 
                  value={currentBanner.description || ""} 
                  onChange={e => setCurrentBanner(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the collection or offer..."
                  className="rounded-xl border-zinc-200 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Button Text</label>
                  <Input 
                    value={currentBanner.buttonText || ""} 
                    onChange={e => setCurrentBanner(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="rounded-xl border-zinc-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Button Link
                  </label>
                  <Input 
                    value={currentBanner.buttonLink || ""} 
                    onChange={e => setCurrentBanner(prev => ({ ...prev, buttonLink: e.target.value }))}
                    placeholder="/products?category=..."
                    className="rounded-xl border-zinc-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Banner Image
                  </label>
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Manual Image URL</label>
                      <Input 
                        value={currentBanner.imageUrl || ""} 
                        onChange={e => setCurrentBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://..."
                        className="rounded-xl border-zinc-200 h-12"
                      />
                    </div>
                    <div className="relative h-12">
                      <Button variant="outline" className="w-full h-full rounded-xl border-dashed border-2 hover:bg-zinc-50" disabled={isSaving}>
                        {isSaving && isUploading ? (
                           <div className="flex items-center gap-2">
                             <Loader2 className="w-4 h-4 animate-spin" />
                             <span className="text-[10px]">{Math.round(progress)}%</span>
                           </div>
                        ) : "Select New Image"}
                      </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Layout className="w-3 h-3" /> Image Side
                    </label>
                    <select 
                      value={currentBanner.imageSide}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, imageSide: e.target.value as 'left' | 'right' }))}
                      className="w-full h-12 rounded-xl border border-zinc-200 px-3 text-sm"
                    >
                      <option value="right">Image on Right</option>
                      <option value="left">Image on Left</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Palette className="w-3 h-3" /> Background
                    </label>
                    <select 
                      value={currentBanner.bgColor || 'cream'}
                      onChange={e => setCurrentBanner(prev => ({ ...prev, bgColor: e.target.value as 'white' | 'cream' }))}
                      className="w-full h-12 rounded-xl border border-zinc-200 px-3 text-sm"
                    >
                      <option value="cream">Pale Pink / Cream</option>
                      <option value="white">Clean White</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Visibility</label>
                  <button 
                    onClick={() => setCurrentBanner(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${currentBanner.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-50 text-zinc-400 border border-zinc-200'}`}
                  >
                    {currentBanner.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {currentBanner.isActive ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-100">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl px-8" disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} className="bg-brand-black text-white rounded-xl px-8 md:px-12 hover:bg-zinc-800 transition-all" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {currentBanner.id ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {banners.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
              <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No banners found.</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="group bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-zinc-200 hover:shadow-xl transition-all duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-full sm:w-48 aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {banner.subtitle && <span className="text-[9px] font-bold tracking-widest text-brand-gold uppercase">{banner.subtitle}</span>}
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>
                        {banner.isActive ? 'LIVE' : 'HIDDEN'}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-heading font-bold text-zinc-900 truncate">{banner.title}</h3>
                    <p className="text-xs md:text-sm text-zinc-500 line-clamp-1 italic">{banner.description}</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <div className="flex gap-1 pr-3 border-r border-zinc-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 disabled:opacity-30"
                        onClick={() => banner.id && handleReorder(banner.id, 'up')} disabled={banners.indexOf(banner) === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 disabled:opacity-30"
                        onClick={() => banner.id && handleReorder(banner.id, 'down')} disabled={banners.indexOf(banner) === banners.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    {canEdit && (
                      <Button variant="outline" size="icon" onClick={() => { setCurrentBanner(banner); setIsEditing(true); }}
                        className="h-10 w-10 md:h-12 md:w-12 rounded-xl border-zinc-200 hover:border-brand-gold hover:text-brand-gold bg-white">
                        <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="outline" size="icon" onClick={() => banner.id && handleDelete(banner.id)}
                        className="h-10 w-10 md:h-12 md:w-12 rounded-xl border-zinc-200 hover:border-red-500 hover:text-red-500 bg-white"
                        disabled={deletingId === banner.id}>
                        {deletingId === banner.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 md:w-5 md:h-5" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
