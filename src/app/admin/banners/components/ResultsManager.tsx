"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Image as ImageIcon, 
  Type, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  getAllResultsAdminAction, 
  addResultAction, 
  updateResultAction, 
  deleteResultAction, 
  reorderResultsAction,
  type ResultItem 
} from "../../results/actions";
import { useImageUpload } from "@/hooks/useImageUpload";

export function ResultsManager() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResult, setCurrentResult] = useState<Partial<ResultItem>>({
    title: "",
    url: "",
    isActive: true,
    order: 0
  });

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const { uploadImage, isUploading, progress } = useImageUpload();

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    setLoading(true);
    try {
      const res = await getAllResultsAdminAction();
      if (res.success && res.results) {
        setResults(res.results);
      }
    } catch (error: any) {
      toast.error(`Load Error: ${error.message}`);
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!currentResult.title || (!currentResult.url && !pendingFile)) {
      toast.error("Title and Image are required");
      return;
    }

    setIsSaving(true);
    try {
      let finalUrl = currentResult.url || "";

      if (pendingFile) {
        toast.info("Uploading result image...");
        const result = await uploadImage(pendingFile, "products/");
        if (result.url) {
          finalUrl = result.url;
        } else {
          throw new Error(result.error || "Upload failed");
        }
      }

      if (currentResult.id) {
        await updateResultAction(currentResult.id, {
          title: currentResult.title,
          url: finalUrl,
          isActive: currentResult.isActive,
          order: currentResult.order
        });
        toast.success("Result updated successfully");
      } else {
        await addResultAction({
          title: currentResult.title || "",
          url: finalUrl,
          order: results.length + 1,
          isActive: true
        });
        toast.success("Result added successfully");
      }
      setIsEditing(false);
      resetForm();
      loadResults();
    } catch (error: any) {
      toast.error(`Save Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      const res = await deleteResultAction(id);
      if (res.success) {
        toast.success("Result deleted");
        loadResults();
      }
    } catch (error: any) {
      toast.error(`Delete Error: ${error.message}`);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = results.findIndex(r => r.id === id);
    if (currentIndex === -1) return;

    const newResults = [...results];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= results.length) return;

    const temp = newResults[currentIndex];
    newResults[currentIndex] = newResults[targetIndex];
    newResults[targetIndex] = temp;

    const updatedResults = newResults.map((res, index) => ({
      ...res,
      order: index + 1
    }));

    setResults(updatedResults);

    const resultIds = updatedResults.map(r => r.id as string);
    try {
      await reorderResultsAction(resultIds);
    } catch (err: any) {
      toast.error(`Reorder Error: ${err.message}`);
      loadResults();
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

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setPendingFile(null);
    setCurrentResult({
      title: "",
      url: "",
      isActive: true,
      order: 0
    });
  };

  if (loading && results.length === 0) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Healed Results Gallery</h2>
          <p className="text-zinc-500 text-sm italic">Manage the before/after and healed results shown on the homepage.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => { resetForm(); setIsEditing(true); }} className="bg-brand-black text-white gap-2 h-9 px-4 text-sm">
            <Plus className="w-4 h-4" /> Add Result
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Result Title
                </label>
                <Input 
                  value={currentResult.title || ""} 
                  onChange={e => setCurrentResult(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Ombre Brows"
                  className="rounded-xl border-zinc-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Result Image
                </label>
                <div className="space-y-4">
                  <div className="relative h-24 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer group">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-gold" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{Math.round(progress)}%</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-zinc-300 group-hover:text-brand-gold transition-colors" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Upload Photo</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isSaving}
                    />
                  </div>
                  <Input 
                    value={currentResult.url || ""} 
                    onChange={e => setCurrentResult(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="External Image URL"
                    className="rounded-xl border-zinc-200 h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Visibility</label>
                <button 
                  onClick={() => setCurrentResult(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${currentResult.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-50 text-zinc-400 border border-zinc-200'}`}
                >
                  {currentResult.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {currentResult.isActive ? 'VISIBLE' : 'HIDDEN'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-bold uppercase tracking-widest text-brand-gold">Live Preview</label>
               <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-100 relative group max-w-[300px] mx-auto">
                  <img 
                    src={previewUrl || currentResult.url || "https://placehold.co/600x800?text=Result+Preview"} 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Preview"
                  />
                  <div className="absolute bottom-6 left-6 right-6 p-4 backdrop-blur-3xl bg-white/40 border border-white/60 rounded-[1.2rem] flex items-center justify-center shadow-lg">
                    <span className="text-zinc-900 text-[7px] font-black tracking-[0.4em] uppercase">{currentResult.title || "TREATMENT NAME"}</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
            <Button variant="ghost" onClick={() => { setIsEditing(false); resetForm(); }} className="rounded-xl px-8" disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} className="bg-brand-black text-white rounded-xl px-12 hover:bg-zinc-800 transition-all shadow-lg active:scale-95" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {currentResult.id ? 'Update Result' : 'Add to Gallery'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((res, index) => (
            <div key={res.id} className="group bg-white p-4 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col gap-4">
              <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-50 border border-zinc-100 relative">
                <img src={res.url} alt={res.title} className="w-full h-full object-cover" />
                {!res.isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border">Hidden</span>
                  </div>
                )}
              </div>
              
              <div className="px-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{res.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-0.5">Order: {res.order}</p>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col gap-1 mr-2">
                    <button 
                      disabled={index === 0}
                      onClick={() => res.id && handleReorder(res.id, 'up')}
                      className="p-1 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3 text-zinc-400" />
                    </button>
                    <button 
                      disabled={index === results.length - 1}
                      onClick={() => res.id && handleReorder(res.id, 'down')}
                      className="p-1 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setCurrentResult(res); setIsEditing(true); }}
                    className="h-8 w-8 rounded-full hover:bg-brand-rose/20 hover:text-brand-black transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => res.id && handleDelete(res.id)}
                    className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
