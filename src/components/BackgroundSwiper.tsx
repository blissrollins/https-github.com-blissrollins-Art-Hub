import React, { useRef } from 'react';
import { Upload, Check, Home, Landmark, Aperture, Layers } from 'lucide-react';
import { BackgroundScene } from '../types';

interface BackgroundSwiperProps {
  scenes: BackgroundScene[];
  currentIndex: number;
  onSelectScene: (index: number) => void;
  onCustomBackgroundUpload: (file: File) => void;
}

export const BackgroundSwiper: React.FC<BackgroundSwiperProps> = ({
  scenes,
  currentIndex,
  onSelectScene,
  onCustomBackgroundUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCustomBackgroundUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full bg-neutral-900/60 rounded-xl border border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white font-serif-display">
            Interior Background Scenes
          </h3>
        </div>
        
        {/* Upload Custom Room Background Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Room</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x">
        {scenes.map((scene, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelectScene(idx)}
              className={`group relative shrink-0 w-32 h-24 rounded-lg overflow-hidden border text-left transition-all snap-start cursor-pointer ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.02]'
                  : 'border-neutral-800 hover:border-neutral-700 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Background Color & Mini Visual */}
              <div
                className="w-full h-full p-2 flex flex-col justify-between"
                style={{
                  background: (scene.customImageUrl || scene.imageUrl)
                    ? `url(${scene.customImageUrl || scene.imageUrl}) center/cover`
                    : `linear-gradient(135deg, ${scene.wallColor} 0%, ${scene.secondaryColor || scene.wallColor} 100%)`,
                }}
              >
                {/* Simulated frame in miniature (semi-transparent) */}
                <div className="self-center w-7 h-9 border-2 border-black/90 bg-white/70 shadow-md rounded-[1px] mt-0.5" />

                {/* Name Label with scrim */}
                <div className="bg-neutral-950/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-medium truncate flex items-center justify-between">
                  <span className="truncate">{scene.name}</span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
