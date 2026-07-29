"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HeroSettings } from "@/app/admin/banners/hero-actions";

/** Polished storefront defaults — ignore old “PRECISION / COMPLETE CATALOG / SKU” style copy */
const DEFAULT_COPY = {
  headline: "Professional PMU supplies,",
  headlineAccent: "made for artists",
  description:
    "Shop studio-ready needles, pigments, machines, and aftercare. Quality tools trusted by permanent makeup professionals across India.",
  primaryCta: "Shop products",
  secondaryCta: "Browse categories",
};

export function ModernHero({ settings }: { settings: HeroSettings }) {
  if (!settings) return null;

  const imageSrc = settings.imageUrl || "/images/landing/master-studio.png";

  // Prefer clear marketing copy; only use admin description if it looks intentional (not empty)
  const description =
    settings.description?.trim() &&
    !/vault of unlimited|elite PMU artist needs/i.test(settings.description)
      ? settings.description.trim()
      : DEFAULT_COPY.description;

  const primaryLabel =
    settings.buttonText?.trim() &&
    !/view all products/i.test(settings.buttonText)
      ? settings.buttonText.trim()
      : DEFAULT_COPY.primaryCta;

  const primaryHref = settings.buttonLink?.trim() || "/products";

  // Optional short line from highlight field if not the old "PMU" only brand shout
  const accentLine =
    settings.highlightedTitle?.trim() &&
    settings.highlightedTitle.trim().length > 3 &&
    !/^pmu$/i.test(settings.highlightedTitle.trim())
      ? settings.highlightedTitle.trim()
      : DEFAULT_COPY.headlineAccent;

  const mainLine =
    settings.title?.trim() &&
    !/precision|complete catalog/i.test(settings.title)
      ? settings.title.trim()
      : DEFAULT_COPY.headline;

  return (
    <section className="relative w-full overflow-hidden bg-brand-cream">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand-rose/35 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1600px] items-center gap-10 px-4 pb-14 pt-8 sm:px-6 md:px-10 lg:grid-cols-12 lg:gap-14 lg:pb-20 lg:pt-12 xl:px-14">
        {/* Image — left on desktop */}
        <div className="relative order-1 lg:col-span-6 xl:col-span-7">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md sm:max-w-lg lg:mx-0 lg:max-w-none lg:aspect-[5/4] xl:aspect-[16/11]">
            <div className="absolute -inset-3 rounded-[2rem] border border-brand-gold/15 bg-gradient-to-br from-white/50 to-transparent sm:-inset-4" />
            <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] border border-white/70 bg-zinc-100 shadow-[0_25px_60px_-20px_rgba(26,26,26,0.3)] sm:rounded-[1.75rem]">
              {imageSrc.startsWith("http://") || imageSrc.startsWith("https://") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt="PMU Supplies India — professional permanent makeup products"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  fetchPriority="high"
                />
              ) : (
                <Image
                  src={imageSrc}
                  alt="PMU Supplies India — professional permanent makeup products"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 55vw"
                  className="object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/25 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Copy — right aligned */}
        <div className="z-10 order-2 flex flex-col justify-center space-y-6 text-right lg:col-span-6 xl:col-span-5 lg:pl-2">
          <div className="space-y-4">
            <h1 className="font-heading text-3xl leading-[1.15] tracking-tight text-brand-black sm:text-4xl md:text-5xl xl:text-[3.25rem]">
              <span className="block text-zinc-900">{mainLine}</span>
              <span className="mt-1 block bg-gradient-to-l from-brand-gold via-[#e85a75] to-brand-rose bg-clip-text italic text-transparent">
                {accentLine}
              </span>
            </h1>

            <p className="ml-auto max-w-md text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
              {description}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link href="/products" className="w-full sm:w-auto order-2 sm:order-1">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-zinc-200 bg-white/90 px-7 text-[11px] font-semibold tracking-wide text-zinc-800 hover:border-brand-gold hover:text-brand-gold sm:w-auto"
              >
                {DEFAULT_COPY.secondaryCta}
              </Button>
            </Link>
            <Link href={primaryHref} className="w-full sm:w-auto order-1 sm:order-2">
              <Button
                size="lg"
                className="group h-12 w-full rounded-full bg-brand-black px-8 text-[11px] font-semibold tracking-wide text-white shadow-lg shadow-brand-black/10 hover:bg-brand-gold sm:w-auto"
              >
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent" />
    </section>
  );
}
