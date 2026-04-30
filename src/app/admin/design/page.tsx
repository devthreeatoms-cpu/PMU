"use client";

import { useState, useEffect } from "react";
import { getShopAllSettings, updateShopAllSettings, DEFAULT_SHOP_ALL_SETTINGS, getSocialLinks, updateSocialLinks } from "@/lib/services/admin";
import { ShopAllSettings, SocialLinks } from "@/lib/types";
import { toast } from "sonner";
import { 
  Grid3X3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Layout, 
  Image as ImageIcon,
  Type,
  Save,
  RotateCcw,
  Smartphone,
  Monitor,
  MessageCircle
} from "lucide-react";

const SocialIcons = {
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Youtube: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
    </svg>
  ),
  Whatsapp: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
};

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? "bg-green-500" : "bg-zinc-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function AdminDesignPage() {
  const [settings, setSettings] = useState<ShopAllSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    facebook: "",
    whatsapp: "",
    youtube: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [designData, socialData] = await Promise.all([
          getShopAllSettings(),
          getSocialLinks()
        ]);
        setSettings(designData);
        setSocialLinks(socialData);
      } catch (error) {
        toast.error("Failed to load settings");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateShopAllSettings(settings),
        updateSocialLinks(socialLinks)
      ]);
      toast.success("Design & Social settings updated");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default settings?")) {
      setSettings(DEFAULT_SHOP_ALL_SETTINGS);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 italic">Shop All Interface</h1>
          <p className="text-zinc-500 text-sm">Customize how your products are displayed to customers.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <RotateCcw size={16} />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-zinc-900 text-brand-gold px-6 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Live Preview - Now a standard section at the top to avoid covering any fields */}
      <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
          <div className="p-2 bg-brand-cream rounded-lg text-brand-gold">
            <Monitor size={20} />
          </div>
          <h2 className="font-bold text-lg uppercase tracking-tight">Live Aesthetic Preview</h2>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active Live Preview</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-center justify-center py-8">
          <div className="w-full max-w-[280px] space-y-4 group">
            <div 
              style={{ 
                aspectRatio: settings.card.aspectRatio === 'square' ? '1/1' : '4/5',
                borderRadius: `${settings.card.borderRadius}px`,
                backgroundColor: '#ffffff'
              }}
              className="border border-zinc-100 relative overflow-hidden flex items-center justify-center shadow-md transition-all duration-500 group-hover:shadow-xl"
            >
               <img 
                 src="https://images.unsplash.com/photo-1556228578-8d91b1a4d530?auto=format&fit=crop&q=80"
                 className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                 style={{ 
                   objectFit: settings.card.imageFit as any,
                   padding: `${settings.card.padding}px`
                 }}
               />
               {settings.card.showBadge && (
                 <div className="absolute top-3 left-3 px-2 py-1 bg-white border border-brand-gold text-[8px] font-black text-brand-gold z-10 uppercase tracking-widest shadow-sm">
                   PMU SUPPLY
                 </div>
               )}
            </div>
            
            <div 
              style={{ textAlign: settings.card.textAlignment as any }}
              className="space-y-1 px-1"
            >
               <div 
                 style={{ fontSize: settings.card.titleSize === 'xs' ? '12px' : settings.card.titleSize === 'sm' ? '14px' : '16px' }} 
                 className="font-bold text-zinc-900 leading-tight tracking-tight uppercase"
               >
                 Elite Microblade Tool
               </div>
               <div 
                 style={{ fontSize: settings.card.priceSize === 'xs' ? '12px' : settings.card.priceSize === 'sm' ? '14px' : '16px' }} 
                 className="font-medium text-brand-gold italic"
               >
                 ₹2,499.00
               </div>
            </div>
          </div>

          <div className="max-w-xs space-y-4 text-center md:text-left">
            <h3 className="text-zinc-900 font-bold italic">Real-time Visualization</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              This preview reflects exactly how your products will appear in the shop. Adjust the layout, typography, and card styling below to see the results instantly.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Reference Sample
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grid Settings */}
        <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="p-2 bg-brand-cream rounded-lg text-brand-gold">
              <Grid3X3 size={20} />
            </div>
            <h2 className="font-bold text-lg uppercase tracking-tight">Grid Layout</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <Monitor size={14} /> Desktop Columns
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSettings({ ...settings, grid: { ...settings.grid, desktop: num } })}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
                      settings.grid.desktop === num 
                        ? "bg-zinc-900 text-brand-gold border-zinc-900 shadow-md" 
                        : "bg-white text-zinc-400 border-zinc-200 hover:border-brand-gold hover:text-brand-gold"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <Smartphone size={14} /> Mobile Columns
              </label>
              <div className="flex gap-2">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSettings({ ...settings, grid: { ...settings.grid, mobile: num } })}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${
                      settings.grid.mobile === num 
                        ? "bg-zinc-900 text-brand-gold border-zinc-900 shadow-md" 
                        : "bg-white text-zinc-400 border-zinc-200 hover:border-brand-gold hover:text-brand-gold"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Item Spacing (px)</label>
                 <span className="text-xs font-bold text-brand-gold bg-brand-cream px-2 py-1 rounded">{settings.grid.gap}px</span>
              </div>
              <input 
                type="range" min="0" max="60" step="4"
                value={settings.grid.gap}
                onChange={(e) => setSettings({ ...settings, grid: { ...settings.grid, gap: parseInt(e.target.value) } })}
                className="w-full accent-brand-gold h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Product Card Styling */}
        <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="p-2 bg-brand-cream rounded-lg text-brand-gold">
              <Layout size={20} />
            </div>
            <h2 className="font-bold text-lg uppercase tracking-tight">Product Card</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Text Alignment</label>
                <div className="flex p-1 bg-zinc-100 rounded-xl">
                  <button 
                    onClick={() => setSettings({...settings, card: {...settings.card, textAlignment: 'left'}})}
                    className={`flex-1 py-2 flex justify-center rounded-lg transition-all ${settings.card.textAlignment === 'left' ? "bg-white text-brand-gold shadow-sm" : "text-zinc-400"}`}
                  >
                    <AlignLeft size={18} />
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, card: {...settings.card, textAlignment: 'center'}})}
                    className={`flex-1 py-2 flex justify-center rounded-lg transition-all ${settings.card.textAlignment === 'center' ? "bg-white text-brand-gold shadow-sm" : "text-zinc-400"}`}
                  >
                    <AlignCenter size={18} />
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, card: {...settings.card, textAlignment: 'right'}})}
                    className={`flex-1 py-2 flex justify-center rounded-lg transition-all ${settings.card.textAlignment === 'right' ? "bg-white text-brand-gold shadow-sm" : "text-zinc-400"}`}
                  >
                    <AlignRight size={18} />
                  </button>
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Image Aspect Ratio</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSettings({...settings, card: {...settings.card, aspectRatio: 'square'}})}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg border uppercase tracking-widest transition-all ${settings.card.aspectRatio === 'square' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400 border-zinc-200"}`}
                  >
                    1:1
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, card: {...settings.card, aspectRatio: 'portrait'}})}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg border uppercase tracking-widest transition-all ${settings.card.aspectRatio === 'portrait' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400 border-zinc-200"}`}
                  >
                    4:5
                  </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-2">
             <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Image Fit</label>
                <div className="flex p-1 bg-zinc-100 rounded-xl">
                  <button 
                    onClick={() => setSettings({...settings, card: {...settings.card, imageFit: 'contain'}})}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${settings.card.imageFit === 'contain' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 uppercase"}`}
                  >
                    Contain
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, card: {...settings.card, imageFit: 'cover'}})}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${settings.card.imageFit === 'cover' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 uppercase"}`}
                  >
                    Cover
                  </button>
                </div>
             </div>

             <div className="space-y-3 flex flex-col justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Brand Badge</label>
                <button 
                  onClick={() => setSettings({...settings, card: {...settings.card, showBadge: !settings.card.showBadge}})}
                  className={`w-full py-2 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${settings.card.showBadge ? "bg-green-50 text-green-700 border-green-200" : "bg-zinc-50 text-zinc-400 border-zinc-200"}`}
                >
                  {settings.card.showBadge ? "Visible" : "Hidden"}
                </button>
             </div>
          </div>

          <div className="space-y-5 pt-4">
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Card Padding</label>
                  <span className="text-xs font-bold text-zinc-900">{settings.card.padding}px</span>
                </div>
                <input 
                  type="range" min="0" max="40" step="4"
                  value={settings.card.padding}
                  onChange={(e) => setSettings({ ...settings, card: { ...settings.card, padding: parseInt(e.target.value) } })}
                  className="w-full accent-zinc-900 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>

             <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Border Radius</label>
                  <span className="text-xs font-bold text-zinc-900">{settings.card.borderRadius}px</span>
                </div>
                <input 
                  type="range" min="0" max="32" step="4"
                  value={settings.card.borderRadius}
                  onChange={(e) => setSettings({ ...settings, card: { ...settings.card, borderRadius: parseInt(e.target.value) } })}
                  className="w-full accent-zinc-900 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>
          </div>
        </section>

        {/* Text Scaling */}
        <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="p-2 bg-brand-cream rounded-lg text-brand-gold">
              <Type size={20} />
            </div>
            <h2 className="font-bold text-lg uppercase tracking-tight">Typography Scaling</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Title Size</label>
                <div className="flex gap-4 items-end">
                   {['xs', 'sm', 'base'].map((size) => (
                     <button 
                       key={size}
                       onClick={() => setSettings({...settings, card: {...settings.card, titleSize: size as any}})}
                       className={`flex-1 pb-2 border-b-2 transition-all ${settings.card.titleSize === size ? "border-brand-gold text-zinc-900" : "border-zinc-100 text-zinc-300"}`}
                     >
                       <span style={{ fontSize: size === 'xs' ? '12px' : size === 'sm' ? '14px' : '16px' }} className="font-bold uppercase tracking-tight">
                         Abc
                       </span>
                       <div className="text-[10px] mt-1 font-bold">{size.toUpperCase()}</div>
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Price Size</label>
                <div className="flex gap-4 items-end">
                   {['xs', 'sm', 'base'].map((size) => (
                     <button 
                       key={size}
                       onClick={() => setSettings({...settings, card: {...settings.card, priceSize: size as any}})}
                       className={`flex-1 pb-2 border-b-2 transition-all ${settings.card.priceSize === size ? "border-brand-gold text-zinc-900" : "border-zinc-100 text-zinc-300"}`}
                     >
                       <span style={{ fontSize: size === 'xs' ? '12px' : size === 'sm' ? '14px' : '16px' }} className="font-bold">
                         ₹99
                       </span>
                       <div className="text-[10px] mt-1 font-bold">{size.toUpperCase()}</div>
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </section>
      </div>

      {/* Social Links Section */}
      <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
          <div className="p-2 bg-brand-cream rounded-lg text-brand-gold">
            <MessageCircle size={20} />
          </div>
          <h2 className="font-bold text-lg uppercase tracking-tight">Social Presence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <SocialIcons.Instagram /> Instagram URL
              </label>
              <Toggle 
                enabled={socialLinks.showInstagram !== false} 
                onChange={() => setSocialLinks({ ...socialLinks, showInstagram: !socialLinks.showInstagram })}
              />
            </div>
            <input 
              type="text"
              value={socialLinks.instagram || ""}
              onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              placeholder="https://instagram.com/your-handle"
              className="w-full h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <SocialIcons.Facebook /> Facebook URL
              </label>
              <Toggle 
                enabled={socialLinks.showFacebook !== false} 
                onChange={() => setSocialLinks({ ...socialLinks, showFacebook: !socialLinks.showFacebook })}
              />
            </div>
            <input 
              type="text"
              value={socialLinks.facebook || ""}
              onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              placeholder="https://facebook.com/your-page"
              className="w-full h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <SocialIcons.Whatsapp /> WhatsApp Number
              </label>
              <Toggle 
                enabled={socialLinks.showWhatsapp !== false} 
                onChange={() => setSocialLinks({ ...socialLinks, showWhatsapp: !socialLinks.showWhatsapp })}
              />
            </div>
            <input 
              type="text"
              value={socialLinks.whatsapp || ""}
              onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <SocialIcons.Youtube /> YouTube URL
              </label>
              <Toggle 
                enabled={socialLinks.showYoutube !== false} 
                onChange={() => setSocialLinks({ ...socialLinks, showYoutube: !socialLinks.showYoutube })}
              />
            </div>
            <input 
              type="text"
              value={socialLinks.youtube || ""}
              onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
              placeholder="https://youtube.com/@your-channel"
              className="w-full h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
