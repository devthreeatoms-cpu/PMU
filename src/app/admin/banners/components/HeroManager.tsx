"use client";

import { useState, useEffect } from "react";
import { 
  Type, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  Save, 
  Loader2,
  Sparkles,
  Layers,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getHeroSettingsAction, updateHeroSettingsAction, type HeroSettings } from "../hero-actions";
import { useImageUpload } from "@/hooks/useImageUpload";

export function HeroManager() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { uploadImage, isUploading, progress } = useImageUpload();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const res = await getHeroSettingsAction();
    if (res.success && res.settings) {
      setSettings(res.settings);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      let finalImageUrl = settings.imageUrl;

      if (pendingFile) {
        toast.info("Uploading hero background...");
        const result = await uploadImage(pendingFile, "banners/");
        if (result.url) {
          finalImageUrl = result.url;
        }
      }

      const res = await updateHeroSettingsAction({ ...settings, imageUrl: finalImageUrl });
      if (res.success) {
        toast.success("Hero settings updated successfully");
        setPendingFile(null);
        setPreviewUrl("");
        loadSettings();
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      toast.error(`Save Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPendingFile(file);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Hero Banner Settings</h2>
          <p className="text-zinc-500 text-sm italic">Edit the main entrance section of your website.</p>
        </div>
        <Button onClick={handleSave} className="bg-brand-black text-white gap-2 h-10 px-8 shadow-lg" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Update Hero
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor Form */}
        <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Main Title</label>
              <Input 
                value={settings.title} 
                onChange={e => setSettings(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                placeholder="PRECISION"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Highlight Title (Italic)</label>
              <Input 
                value={settings.highlightedTitle} 
                onChange={e => setSettings(prev => prev ? ({ ...prev, highlightedTitle: e.target.value }) : null)}
                placeholder="PMU"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Top Subtitle</label>
            <Input 
              value={settings.subtitle} 
              onChange={e => setSettings(prev => prev ? ({ ...prev, subtitle: e.target.value }) : null)}
              placeholder="THE COMPLETE CATALOG"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description Text</label>
            <Textarea 
              value={settings.description} 
              onChange={e => setSettings(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Button Text</label>
              <Input 
                value={settings.buttonText} 
                onChange={e => setSettings(prev => prev ? ({ ...prev, buttonText: e.target.value }) : null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Button Link</label>
              <Input 
                value={settings.buttonLink} 
                onChange={e => setSettings(prev => prev ? ({ ...prev, buttonLink: e.target.value }) : null)}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Video className="w-3 h-3" /> Background Video URL
              </label>
            </div>
            <Input 
              value={settings.videoUrl} 
              onChange={e => setSettings(prev => prev ? ({ ...prev, videoUrl: e.target.value }) : null)}
              placeholder="Direct .mp4 link"
              className="text-xs"
            />
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Background Image
            </label>
            <div className="relative h-20 border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer group">
              {isUploading ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{Math.round(progress)}%</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Change Background Photo</span>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200 bg-brand-cream min-h-[500px]">
           {/* Background Mockup */}
           <div className="absolute inset-0 z-0">
              <img 
                src={previewUrl || settings.imageUrl} 
                className="w-full h-full object-cover"
                alt="Bg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/60 to-transparent z-10" />
           </div>

           {/* Content Mockup */}
           <div className="relative z-20 p-10 flex flex-col justify-center h-full space-y-6">
              <div className="flex items-center gap-2">
                <span className="h-[1px] w-6 bg-brand-gold/30" />
                <span className="text-brand-gold text-[7px] font-black tracking-[0.6em] uppercase flex items-center gap-1">
                  <Layers className="h-2 w-2" /> {settings.subtitle}
                </span>
              </div>
              <h1 className="flex flex-col">
                <span className="text-2xl font-black tracking-[0.2em] uppercase leading-tight text-transparent bg-clip-text bg-gradient-to-r from-black to-zinc-400">
                  {settings.title}
                </span>
                <span className="text-5xl font-heading font-normal italic tracking-tighter text-brand-gold leading-[0.8] mt-[-0.05em]">
                  {settings.highlightedTitle}
                </span>
              </h1>
              <p className="text-zinc-500 text-[8px] font-light italic leading-relaxed pl-4 border-l border-brand-gold/20 max-w-[200px]">
                {settings.description}
              </p>
              <Button size="sm" className="w-fit bg-brand-gold text-white px-6 h-8 rounded-none tracking-[0.3em] text-[7px] font-bold shadow-lg">
                {settings.buttonText}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
