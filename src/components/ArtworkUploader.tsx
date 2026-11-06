import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { SampleArtwork } from '../types';

interface ArtworkUploaderProps {
  samples: SampleArtwork[];
  activeSampleId: string | null;
  onSelectSample: (sample: SampleArtwork) => void;
  onFileUpload: (file: File) => void;
  currentArtTitle: string;
  hasCustomArt: boolean;
}

export const ArtworkUploader: React.FC<ArtworkUploaderProps> = ({
  samples,
  activeSampleId,
  onSelectSample,
  onFileUpload,
  currentArtTitle,
  hasCustomArt,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative group border-2 border-dashed border-neutral-700 hover:border-amber-400/80 bg-neutral-900/40 hover:bg-neutral-900/70 rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 group-hover:scale-110 flex items-center justify-center transition-transform">
          <Upload className="w-5 h-5" />
        </div>

        <div>
          <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
            Upload Your Artwork
          </span>
          <p className="text-xs text-neutral-400 mt-0.5">
            Drag & drop or click to browse (PNG, JPG, WebP)
          </p>
        </div>

        {hasCustomArt && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/10 text-amber-300 rounded text-xs">
            <Check className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{currentArtTitle}</span>
          </div>
        )}
      </div>

      {/* 2. Sample Artworks Picker */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Or Try Curated Art Samples
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {samples.map((sample) => {
            const isSelected = activeSampleId === sample.id && !hasCustomArt;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className={`group relative flex flex-col rounded-lg border overflow-hidden text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-1 ring-amber-400/50 bg-neutral-800'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <div className="w-full h-20 bg-neutral-950 overflow-hidden">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2">
                  <span className="text-[11px] font-medium text-neutral-200 block truncate">
                    {sample.title}
                  </span>
                  <span className="text-[10px] text-neutral-500 block truncate">
                    {sample.artist}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
