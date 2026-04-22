"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-6 py-8", className)}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="text-zinc-400 hover:text-brand-vibrant-pink disabled:opacity-20 disabled:hover:text-zinc-400 transition-all duration-300"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>

      <div className="flex items-center gap-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "text-xs font-bold tracking-tighter transition-all duration-500 relative py-1 px-1",
              currentPage === page 
                ? "text-brand-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-brand-black" 
                : "text-zinc-300 hover:text-zinc-500"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="text-zinc-400 hover:text-brand-vibrant-pink disabled:opacity-20 disabled:hover:text-zinc-400 transition-all duration-300"
        aria-label="Next page"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
