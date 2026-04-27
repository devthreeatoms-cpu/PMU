"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getResultsAction, type ResultItem } from "@/app/admin/results/actions";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function GallerySection() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadResults() {
      const res = await getResultsAction();
      if (res.success && res.results && res.results.length > 0) {
        setResults(res.results);
      } else {
        // Fallback to hardcoded defaults if DB is empty
        setResults([
          { url: "/images/landing/microblading-result.png", title: "Microblading", order: 1, isActive: true, createdAt: Date.now() },
          { url: "/images/landing/lip-blush-result.png", title: "Lip Blush", order: 2, isActive: true, createdAt: Date.now() },
          { url: "/images/landing/eyeliner-result.png", title: "Eyeliner", order: 3, isActive: true, createdAt: Date.now() },
          { url: "/images/landing/brow-class.png", title: "Master Class", order: 4, isActive: true, createdAt: Date.now() },
        ]);
      }
      setIsLoading(false);
    }
    loadResults();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) return null;
  if (results.length === 0) return null;


  const isCarousel = results.length > 4;

  return (
    <section className="py-24 bg-brand-cream/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-[#ff4d8d] text-[10px] font-bold tracking-[0.4em] uppercase">Master Artistry</span>
            <h2 className="text-4xl md:text-5xl font-heading font-normal">
              Elitist Healed <span className="italic text-[#ff4d8d]">Results</span>
            </h2>
          </div>

          {isCarousel && (
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-brand-rose hover:text-white hover:border-brand-rose transition-all group"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-brand-rose hover:text-white hover:border-brand-rose transition-all group"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {isCarousel ? (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-4 px-4 lg:mx-0 lg:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {results.map((img, i) => (
              <div
                key={img.id || i}
                className="flex-none w-[80vw] md:w-[40vw] lg:w-[23%] snap-start"
              >
                <ResultCard img={img} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((img, i) => (
              <div key={img.id || i}>
                <ResultCard img={img} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ResultCard({ img }: { img: ResultItem }) {
  return (
    <div className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-100">
      <img
        src={img.url}
        alt={img.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
      />
      {/* Glassy Hover Overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-700" />

      {/* Floating Glassy Title Card */}
      <div className="absolute bottom-6 left-6 right-6 p-5 backdrop-blur-3xl bg-white/40 border border-white/60 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center">
        <span className="text-zinc-900 text-[8px] font-black tracking-[0.4em] uppercase">{img.title}</span>
      </div>
    </div>
  );
}
