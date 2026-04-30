"use client";

import { useState } from "react";
import { 
  ImageIcon, 
  Layout, 
  Type
} from "lucide-react";
import { BannersManager } from "./components/BannersManager";
import { ResultsManager } from "./components/ResultsManager";
import { HeroManager } from "./components/HeroManager";

export default function AdminBannersPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'results' | 'hero'>('banners');

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Visual Hub Tabs Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-zinc-900">Elite Visual Hub</h1>
            <p className="text-zinc-500 text-xs md:text-sm mt-1 italic">
              "Master control for every cinematic element of your homepage."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100 rounded-2xl w-fit border border-zinc-200/50">
          {[
            { id: 'banners', label: 'Main Banners', icon: Layout },
            { id: 'results', label: 'Healed Results', icon: ImageIcon },
            { id: 'hero', label: 'Hero Section', icon: Type }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-white text-brand-gold shadow-md scale-[1.02]' 
                  : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-brand-gold' : 'text-zinc-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Content Rendering */}
      <div className="pt-4">
        {activeTab === 'banners' && <BannersManager />}
        {activeTab === 'results' && <ResultsManager />}
        {activeTab === 'hero' && <HeroManager />}
      </div>
    </div>
  );
}
