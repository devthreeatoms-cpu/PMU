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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  getAllBannersAdminAction, 
  addBannerAction, 
  updateBannerAction, 
  deleteBannerAction, 
  reorderBannersAction,
  type Banner 
} from "./actions";
import { useImageUpload } from "@/hooks/useImageUpload";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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

  const { uploadImage, isUploading, isProcessing, progress } = useImageUpload();

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    const res = await getAllBannersAdminAction();
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
    try {
      await deleteBannerAction(id);
      toast.success("Banner deleted");
      loadBanners();
    } catch (error) {
      toast.error("Delete failed");
    }
  };
  
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === id);
    if (currentIndex === -1) return;

    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= banners.length) return;

    // Swap
    const temp = newBanners[currentIndex];
    newBanners[currentIndex] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    setBanners(newBanners);

    const bannerIds = newBanners.map(b => b.id as string);
    try {
      const res = await reorderBannersAction(bannerIds);
      if (!res.success) {
         toast.error("Reorder failed");
         loadBanners(); // revert
      }
    } catch (err) {
      toast.error("Reorder failed");
      loadBanners(); // revert
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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900">Homepage Banners</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage the large image banners displayed on your home page.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => { resetForm(); setIsEditing(true); }} className="bg-brand-black text-white gap-2">
            <Plus className="w-4 h-4" /> Add New Banner
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-8">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Badges (Comma separated)</label>
                  <Input 
                    value={currentBanner.badges?.join(', ') || ''} 
                    onChange={e => setCurrentBanner(prev => ({ ...prev, badges: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    placeholder="100% Organic, Vitamin Enriched..."
                    className="rounded-xl border-zinc-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Bullet Points (Comma separated)</label>
                  <Input 
                    value={currentBanner.bullets?.join(', ') || ''} 
                    onChange={e => setCurrentBanner(prev => ({ ...prev, bullets: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    placeholder="Pro-Grip Texture, New Styles..."
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

                  {/* Real-time Section Preview */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] flex items-center gap-2">
                      <Eye className="w-3 h-3" /> Live Section Preview
                    </label>
                    <div className={`p-8 rounded-[2rem] border border-zinc-100 overflow-hidden ${currentBanner.bgColor === 'white' ? 'bg-white' : 'bg-brand-cream/30'}`}>
                      <div className={`flex flex-col ${currentBanner.imageSide === 'right' ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center text-left`}>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <span className="text-brand-gold text-[8px] font-bold tracking-[0.4em] uppercase">{currentBanner.subtitle || "SUBTITLE"}</span>
                            <h3 className="text-2xl font-heading text-zinc-900 leading-tight">
                              {currentBanner.title || "Your Banner Title"}<br/>
                              <span className="italic text-[#ff4d8d]">{currentBanner.highlightedTitle || "Highlighted Text"}</span>
                            </h3>
                          </div>
                          
                          <p className="text-zinc-500 text-[10px] font-light italic border-l border-brand-gold/20 pl-4">
                            {currentBanner.description || "Your description..."}
                          </p>

                          {/* Preview Badges */}
                          {currentBanner.badges && currentBanner.badges.length > 0 && (
                            <div className="flex flex-nowrap gap-1.5 pt-1 overflow-hidden">
                              {currentBanner.badges.map((badge, i) => (
                                <span key={i} className="px-2 py-1 bg-white rounded-full border border-zinc-100 text-[5px] font-black tracking-tighter uppercase text-zinc-400 whitespace-nowrap shadow-sm">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Preview Bullets */}
                          {currentBanner.bullets && currentBanner.bullets.length > 0 && (
                            <ul className="space-y-1 pt-1">
                              {currentBanner.bullets.map((bullet, i) => (
                                <li key={i} className="flex items-center gap-2 text-[7px] font-bold tracking-widest uppercase text-zinc-400">
                                  <div className="w-1 h-1 rounded-full bg-brand-gold" />
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}

                          <Button size="sm" className="bg-brand-rose text-brand-black rounded-none px-4 h-8 tracking-[0.2em] text-[7px] font-bold">
                            {currentBanner.buttonText || "SHOP NOW"}
                          </Button>
                        </div>
                        <div className="w-24 aspect-square rounded-xl overflow-hidden shadow-lg border-2 border-white bg-zinc-50 relative">
                          <img 
                            src={previewUrl || currentBanner.imageUrl || "https://placehold.co/400x400?text=No+Image"} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          {pendingFile && (
                            <div className="absolute top-1 right-1 bg-brand-gold text-white text-[6px] px-1.5 py-0.5 rounded-full font-bold uppercase">Pending</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl px-8" disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} className="bg-brand-black text-white rounded-xl px-12 hover:bg-zinc-800 transition-all" disabled={isSaving}>
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
              <p className="text-zinc-500 font-medium">No banners found. Create your first dynamic banner!</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="group bg-white p-6 rounded-[2rem] border border-zinc-200 flex items-center gap-6 hover:shadow-xl transition-all duration-500">
                <div className="w-48 aspect-video rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {banner.subtitle && <span className="text-[9px] font-bold tracking-widest text-brand-gold uppercase">{banner.subtitle}</span>}
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>
                      {banner.isActive ? 'LIVE' : 'HIDDEN'}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-zinc-900">{banner.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-1 italic">{banner.description}</p>
                </div>

                <div className="flex items-center gap-2 transition-all">
                  <div className="flex flex-col gap-1 pr-4 border-r border-zinc-100">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-zinc-100 disabled:opacity-30"
                      onClick={() => banner.id && handleReorder(banner.id, 'up')}
                      disabled={banners.indexOf(banner) === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-zinc-100 disabled:opacity-30"
                      onClick={() => banner.id && handleReorder(banner.id, 'down')}
                      disabled={banners.indexOf(banner) === banners.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => { setCurrentBanner(banner); setIsEditing(true); }}
                    className="h-12 w-12 rounded-xl border-zinc-200 hover:border-brand-gold hover:text-brand-gold transition-all bg-white"
                  >
                    <Pencil className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => banner.id && handleDelete(banner.id)}
                    className="h-12 w-12 rounded-xl border-zinc-200 hover:border-red-500 hover:text-red-500 transition-all bg-white"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
