import React from 'react';
import { Download, Sparkles, Layers, Sliders, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'mockup' | 'frame' | 'lighting' | 'watermark';
  setActiveTab: (tab: 'mockup' | 'frame' | 'lighting' | 'watermark') => void;
  onOpenExport: () => void;
  hasCustomArt: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  hasCustomArt,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400">
            <span className="font-serif-display font-bold text-lg">A</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap font-serif-display">
            ArtFrame Studio
          </span>
        </div>

        {/* Zone 2: Nav Links / Workspace Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            type="button"
            onClick={() => setActiveTab('mockup')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              activeTab === 'mockup' ? 'text-white border-b-2 border-amber-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Backgrounds & Art
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('frame')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              activeTab === 'frame' ? 'text-white border-b-2 border-amber-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Frame & Border
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lighting')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              activeTab === 'lighting' ? 'text-white border-b-2 border-amber-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Lighting & Depth
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('watermark')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              activeTab === 'watermark' ? 'text-white border-b-2 border-amber-400 font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Artist Branding
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap cursor-pointer font-sans-display"
          >
            <Download className="w-4 h-4" />
            <span>Export & Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};
