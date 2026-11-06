import React from 'react';
import { ShieldCheck, Type, Palette, AlignRight } from 'lucide-react';
import { WatermarkConfig } from '../types';

interface ArtistWatermarkModalProps {
  config: WatermarkConfig;
  onChange: (updated: Partial<WatermarkConfig>) => void;
}

export const ArtistWatermarkModal: React.FC<ArtistWatermarkModalProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4 space-y-4">
        {/* Toggle Watermark */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-sm font-semibold text-white block">
                Artist Signature / Handle
              </span>
              <span className="text-xs text-neutral-400 block">
                Add protective watermark branding to social media exports
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="rounded accent-amber-400 cursor-pointer w-4 h-4"
          />
        </div>

        {config.enabled && (
          <div className="space-y-4 pt-1">
            {/* Watermark text */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>Handle or Signature Text</span>
              </label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => onChange({ text: e.target.value })}
                placeholder="@yourartpage or Artist Name"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Position */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                <AlignRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Watermark Placement</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bottom-right', label: 'Bottom Right' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'top-right', label: 'Top Right' },
                  { id: 'top-left', label: 'Top Left' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => onChange({ position: pos.id as WatermarkConfig['position'] })}
                    className={`px-3 py-2 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                      config.position === pos.id
                        ? 'border-amber-400 bg-amber-400/10 text-white font-medium'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Text Color</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'white', label: 'White' },
                  { id: 'black', label: 'Black' },
                  { id: 'gold', label: 'Gold / Brass' },
                ].map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => onChange({ color: col.id as WatermarkConfig['color'] })}
                    className={`px-3 py-1.5 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                      config.color === col.id
                        ? 'border-amber-400 bg-neutral-800 text-white font-medium'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-300">Opacity</span>
                <span className="text-xs font-mono text-neutral-400">{config.opacity}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={config.opacity}
                onChange={(e) => onChange({ opacity: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
