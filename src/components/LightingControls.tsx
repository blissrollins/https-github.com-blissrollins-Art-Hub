import React from 'react';
import { Sparkles, Sun, Eye, MoveVertical, ZoomIn } from 'lucide-react';
import { FrameStyleConfig } from '../types';

interface LightingControlsProps {
  config: FrameStyleConfig;
  onChange: (updated: Partial<FrameStyleConfig>) => void;
}

export const LightingControls: React.FC<LightingControlsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      {/* 1. Ceiling Spotlight & Glow */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Ceiling Spotlight Glow</span>
            </label>
            <span className="text-xs font-mono text-neutral-400">{config.spotlightIntensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={config.spotlightIntensity}
            onChange={(e) => onChange({ spotlightIntensity: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <p className="text-[11px] text-neutral-500 mt-1">
            Simulates warm ceiling track spotlights highlighting the framed artwork.
          </p>
        </div>

        {/* 2. Wall Shadow Opacity */}
        <div className="pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Wall Drop Shadow</span>
            </label>
            <span className="text-xs font-mono text-neutral-400">{config.wallShadowOpacity}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={config.wallShadowOpacity}
            onChange={(e) => onChange({ wallShadowOpacity: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* 3. Museum Glass Reflection */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">
                Museum Glass Glare
              </span>
              <span className="text-[11px] text-neutral-500 block">
                Subtle diagonal light reflection on art surface
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.glassReflection}
            onChange={(e) => onChange({ glassReflection: e.target.checked })}
            className="rounded accent-amber-400 cursor-pointer w-4 h-4"
          />
        </div>
      </div>

      {/* 4. Placement & Scale in Room */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Frame Scale in Room</span>
            </label>
            <span className="text-xs font-mono text-neutral-400">{config.scaleInRoom}%</span>
          </div>
          <input
            type="range"
            min={65}
            max={135}
            value={config.scaleInRoom}
            onChange={(e) => onChange({ scaleInRoom: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div className="pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <MoveVertical className="w-3.5 h-3.5 text-amber-400" />
              <span>Wall Hanging Height</span>
            </label>
            <span className="text-xs font-mono text-neutral-400">
              {config.verticalOffset > 0 ? `+${config.verticalOffset}` : config.verticalOffset}
            </span>
          </div>
          <input
            type="range"
            min={-40}
            max={40}
            value={config.verticalOffset}
            onChange={(e) => onChange({ verticalOffset: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <p className="text-[11px] text-neutral-500 mt-1">
            Adjust frame height higher or lower above consoles and furniture.
          </p>
        </div>
      </div>
    </div>
  );
};
