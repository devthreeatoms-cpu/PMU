"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Video,
  Save,
  Loader2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getHeroSettingsAction,
  updateHeroSettingsAction,
  type HeroSettings,
} from "../hero-actions";
import { useImageUpload } from "@/hooks/useImageUpload";

/** Matches homepage hero image frame (desktop ~16:11 / 5:4, mobile 4:5 with object-cover). */
export const HERO_IMAGE_SPEC = {
  /** Preferred export size for retina-sharp display */
  idealWidth: 1920,
  idealHeight: 1280,
  /** Soft minimum — below this we warn about blurriness */
  minWidth: 1200,
  minHeight: 800,
  /** Target aspect (3:2 landscape) — crops cleanly on all breakpoints */
  aspectLabel: "3:2 landscape",
  aspectRatio: 3 / 2,
  aspectTolerance: 0.2,
  maxFileMb: 3,
  formats: "JPG, PNG, or WebP",
} as const;

type ImageCheck = {
  width: number;
  height: number;
  fileSizeMb: number;
  okSize: boolean;
  okAspect: boolean;
  okFileSize: boolean;
  messages: { type: "ok" | "warn" | "error"; text: string }[];
};

function readImageMeta(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });
}

function evaluateImage(file: File, width: number, height: number): ImageCheck {
  const fileSizeMb = file.size / (1024 * 1024);
  const ratio = width / height;
  const target = HERO_IMAGE_SPEC.aspectRatio;
  const okAspect =
    Math.abs(ratio - target) <= HERO_IMAGE_SPEC.aspectTolerance ||
    // Also accept 16:9 and 5:4 which still crop reasonably
    Math.abs(ratio - 16 / 9) <= 0.12 ||
    Math.abs(ratio - 5 / 4) <= 0.12;
  const okSize =
    width >= HERO_IMAGE_SPEC.minWidth && height >= HERO_IMAGE_SPEC.minHeight;
  const okFileSize = fileSizeMb <= HERO_IMAGE_SPEC.maxFileMb;

  const messages: ImageCheck["messages"] = [];

  if (okSize && okAspect && okFileSize) {
    messages.push({
      type: "ok",
      text: `Looks good — ${width}×${height}px will stay sharp on the homepage hero.`,
    });
  }

  if (!okSize) {
    messages.push({
      type: "error",
      text: `Image is too small (${width}×${height}px). Use at least ${HERO_IMAGE_SPEC.minWidth}×${HERO_IMAGE_SPEC.minHeight}px. Ideal: ${HERO_IMAGE_SPEC.idealWidth}×${HERO_IMAGE_SPEC.idealHeight}px.`,
    });
  } else if (
    width < HERO_IMAGE_SPEC.idealWidth ||
    height < HERO_IMAGE_SPEC.idealHeight
  ) {
    messages.push({
      type: "warn",
      text: `OK but not ideal (${width}×${height}px). For maximum clarity upload ${HERO_IMAGE_SPEC.idealWidth}×${HERO_IMAGE_SPEC.idealHeight}px.`,
    });
  }

  if (!okAspect) {
    messages.push({
      type: "warn",
      text: `Aspect ratio is ${ratio.toFixed(2)}:1. Prefer ${HERO_IMAGE_SPEC.aspectLabel} (${HERO_IMAGE_SPEC.idealWidth}×${HERO_IMAGE_SPEC.idealHeight}). Edges may crop on mobile/desktop.`,
    });
  }

  if (!okFileSize) {
    messages.push({
      type: "warn",
      text: `File is ${fileSizeMb.toFixed(1)} MB. Compress under ${HERO_IMAGE_SPEC.maxFileMb} MB for faster homepage load (keep dimensions).`,
    });
  }

  return { width, height, fileSizeMb, okSize, okAspect, okFileSize, messages };
}

export function HeroManager() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageCheck, setImageCheck] = useState<ImageCheck | null>(null);

  const { uploadImage, isUploading, progress } = useImageUpload();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

    if (pendingFile && imageCheck && !imageCheck.okSize) {
      toast.error(
        "Image resolution is too low. Upload a larger image for a clear hero."
      );
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = settings.imageUrl;

      if (pendingFile) {
        toast.info("Uploading hero image...");
        const result = await uploadImage(pendingFile, "banners/");
        if (result.url) {
          finalImageUrl = result.url;
        }
      }

      const res = await updateHeroSettingsAction({
        ...settings,
        imageUrl: finalImageUrl,
      });
      if (res.success) {
        toast.success("Hero settings updated successfully");
        setPendingFile(null);
        setPreviewUrl("");
        setImageCheck(null);
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }

    try {
      const { width, height } = await readImageMeta(file);
      const check = evaluateImage(file, width, height);
      setImageCheck(check);

      if (!check.okSize) {
        toast.error("Image too small — see recommended size below.");
      } else if (check.messages.some((m) => m.type === "warn")) {
        toast.message("Image accepted with warnings — check the guide.");
      } else {
        toast.success("Image looks good for the hero.");
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPendingFile(file);
    } catch {
      toast.error("Could not read this image. Try another file.");
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-gold" />
      </div>
    );
  if (!settings) return null;

  const displayImage = previewUrl || settings.imageUrl;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Hero Banner Settings</h2>
          <p className="text-zinc-500 text-sm">
            Edit the homepage hero. Upload images at the size below so they stay sharp.
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-brand-black text-white gap-2 h-10 px-8 shadow-lg"
          disabled={isSaving || isUploading}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Update Hero
        </Button>
      </div>

      {/* Image size guide */}
      <div className="rounded-2xl border border-brand-gold/25 bg-gradient-to-br from-brand-rose/20 via-white to-white p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-3 min-w-0">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Recommended hero image size
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                The homepage crops the image with <strong>object-cover</strong> into a
                rounded frame. Export at these specs so nothing looks soft or stretched.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Ideal resolution
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900">
                  {HERO_IMAGE_SPEC.idealWidth} × {HERO_IMAGE_SPEC.idealHeight}
                  <span className="text-xs font-normal text-zinc-400"> px</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {HERO_IMAGE_SPEC.aspectLabel} · retina-ready
                </p>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Minimum
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900">
                  {HERO_IMAGE_SPEC.minWidth} × {HERO_IMAGE_SPEC.minHeight}
                  <span className="text-xs font-normal text-zinc-400"> px</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Smaller will look blurry
                </p>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Format &amp; weight
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {HERO_IMAGE_SPEC.formats}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Under {HERO_IMAGE_SPEC.maxFileMb} MB preferred
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-brand-gold" />
                Desktop frame ~16:11 landscape
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-brand-gold" />
                Mobile frame ~4:5 (center subject — edges crop)
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              <strong className="text-zinc-700">Tip:</strong> Keep the main subject
              (product / face / tools) in the center. Safe area is the middle 70% —
              corners may be clipped on some screens.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor Form */}
        <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Main Title
              </label>
              <Input
                value={settings.title}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                placeholder="PRECISION"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Highlight Title
              </label>
              <Input
                value={settings.highlightedTitle}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, highlightedTitle: e.target.value } : null
                  )
                }
                placeholder="PMU"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Top Subtitle
            </label>
            <Input
              value={settings.subtitle}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, subtitle: e.target.value } : null
                )
              }
              placeholder="THE COMPLETE CATALOG"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Description Text
            </label>
            <Textarea
              value={settings.description}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Button Text
              </label>
              <Input
                value={settings.buttonText}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, buttonText: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Button Link
              </label>
              <Input
                value={settings.buttonLink}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, buttonLink: e.target.value } : null
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-zinc-50">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Video className="w-3 h-3" /> Background Video URL (optional)
            </label>
            <Input
              value={settings.videoUrl}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, videoUrl: e.target.value } : null
                )
              }
              placeholder="Direct .mp4 link (optional — image is primary)"
              className="text-xs"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Hero Image
              </label>
              <span className="text-[10px] font-semibold tabular-nums text-zinc-500">
                Best: {HERO_IMAGE_SPEC.idealWidth}×{HERO_IMAGE_SPEC.idealHeight}px ·{" "}
                {HERO_IMAGE_SPEC.aspectLabel}
              </span>
            </div>

            <div className="relative min-h-[7.5rem] rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center hover:border-brand-gold/40 hover:bg-brand-rose/10 transition-colors cursor-pointer px-4 py-6">
              {isUploading ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-gold" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    {Math.round(progress)}%
                  </span>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-zinc-300 mb-2" />
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest text-center">
                    {pendingFile ? "Replace selected image" : "Upload hero photo"}
                  </span>
                  <span className="mt-1 text-[10px] text-zinc-400 text-center">
                    {HERO_IMAGE_SPEC.idealWidth}×{HERO_IMAGE_SPEC.idealHeight}px ·{" "}
                    {HERO_IMAGE_SPEC.formats} · max {HERO_IMAGE_SPEC.maxFileMb}MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {imageCheck && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3 text-[11px] text-zinc-600">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium tabular-nums">
                    {imageCheck.width}×{imageCheck.height}px
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium tabular-nums">
                    {imageCheck.fileSizeMb.toFixed(2)} MB
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium tabular-nums">
                    {(imageCheck.width / imageCheck.height).toFixed(2)}:1 ratio
                  </span>
                </div>
                {imageCheck.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
                      m.type === "ok"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                        : m.type === "error"
                          ? "bg-red-50 text-red-800 border border-red-100"
                          : "bg-amber-50 text-amber-900 border border-amber-100"
                    }`}
                  >
                    {m.type === "ok" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    )}
                    <span>{m.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview — matches homepage hero frame */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Homepage preview
            </p>
            <p className="text-[10px] text-zinc-400">How visitors see the image frame</p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-brand-cream p-4 md:p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div className="space-y-2 hidden sm:block">
                <div className="h-2 w-16 rounded-full bg-brand-gold/30" />
                <div className="h-3 w-24 rounded bg-zinc-200/80" />
                <div className="h-8 w-32 rounded bg-brand-gold/20" />
                <div className="h-2 w-full max-w-[12rem] rounded bg-zinc-200/60" />
                <div className="h-2 w-full max-w-[10rem] rounded bg-zinc-200/50" />
                <div className="mt-3 h-8 w-28 rounded-full bg-brand-black/90" />
              </div>

              <div className="relative mx-auto w-full max-w-sm">
                {/* Desktop-like 16/11 frame */}
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-white shadow-lg bg-zinc-100">
                  {displayImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayImage}
                      alt="Hero preview"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
                  <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-800 shadow">
                    Desktop crop
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative w-24 shrink-0 overflow-hidden rounded-xl border border-white shadow aspect-[4/5] bg-zinc-100">
                {displayImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayImage}
                    alt="Mobile crop preview"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : null}
              </div>
              <div className="text-[11px] text-zinc-500 leading-relaxed">
                <p className="font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5" /> Mobile crop (4:5)
                </p>
                <p className="mt-1">
                  Same file, taller crop. Keep faces/products centered so they stay in frame.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-white p-4 text-[11px] text-zinc-500 leading-relaxed">
            <p className="font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Quick export checklist
            </p>
            <ul className="space-y-1.5 list-disc pl-4">
              <li>
                Size: <strong className="text-zinc-700">{HERO_IMAGE_SPEC.idealWidth} ×{" "}
                {HERO_IMAGE_SPEC.idealHeight} px</strong>
              </li>
              <li>
                Shape: <strong className="text-zinc-700">{HERO_IMAGE_SPEC.aspectLabel}</strong>
              </li>
              <li>Subject in the center (safe zone)</li>
              <li>High quality JPG/WebP, under {HERO_IMAGE_SPEC.maxFileMb} MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
