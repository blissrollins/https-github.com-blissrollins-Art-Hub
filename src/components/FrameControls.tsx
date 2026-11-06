import React from 'react';
import { FrameStyleConfig, AspectRatioType, FrameColorType, MatColorType } from '../types';
import { FRAME_PALETTES, MAT_PALETTES } from '../utils/canvasRenderer';
import { Sliders, Maximize, Palette, LayoutGrid, Check, Square } from 'lucide-react';

interface FrameControlsProps {
  config: FrameStyleConfig;
  onChange: (updated: Partial<FrameStyleConfig>) => void;
}

export const FrameControls: React.FC<FrameControlsProps> = ({ config, onChange }) => {
  const isFullFrame = config.borderStyle === 'full-frame' || !config.hasMat;
  const isWhiteSquare = !isFullFrame && config.matWindowShape === 'square';
  const isWhiteProportional = !isFullFrame && config.matWindowShape !== 'square';

  const aspectRatios: { id: AspectRatioType; label: string; sub: string }[] = [
    { id: '4:5', label: '4:5 Portrait', sub: 'Instagram Feed' },
    { id: '1:1', label: '1:1 Square', sub: 'IG Classic Grid' },
    { id: '9:16', label: '9:16 Vertical', sub: 'Story / Reel' },
    { id: '3:4', label: '3:4 Poster', sub: 'Art Print' },
    { id: '2:3', label: '2:3 Pin', sub: 'Pinterest Pin' },
    { id: '16:9', label: '16:9 Banner', sub: 'Landscape' },
    { id: 'original', label: 'Original', sub: 'Auto Match' },
  ];

  return (
    <div className="space-y-6">
      {/* 0. Art Framing Style: Cover Whole Frame vs White Square Border */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4">
        <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Square className="w-3.5 h-3.5 text-amber-400" />
          <span>Artwork Framing Style</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Option A: Cover Whole Frame */}
          <button
            type="button"
            onClick={() => onChange({ borderStyle: 'full-frame', hasMat: false })}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
              isFullFrame
                ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/50 shadow-md'
                : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                Cover Whole Frame
              </span>
              {isFullFrame && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Artwork fills the whole frame completely (Edge to edge, no white border).
            </p>
          </button>

          {/* Option B: White Square Border */}
          <button
            type="button"
            onClick={() => onChange({ borderStyle: 'white-border', hasMat: true, matWindowShape: 'square' })}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
              isWhiteSquare
                ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/50 shadow-md'
                : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border border-white bg-white/20 rounded-[1px] flex items-center justify-center p-0.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-[0.5px]" />
                </div>
                White Square Border
              </span>
              {isWhiteSquare && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Artwork is framed inside a white square mat border (Passe-partout).
            </p>
          </button>
        </div>

        {/* If White Border is selected, show quick white border width presets and mat tones */}
        {!isFullFrame && (
          <div className="mt-3.5 pt-3.5 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-medium">White Border Width</span>
              <span className="text-xs font-mono text-neutral-400">{config.matWidth}px</span>
            </div>

            <input
              type="range"
              min={14}
              max={70}
              step={2}
              value={config.matWidth}
              onChange={(e) => onChange({ matWidth: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'Slim', val: 18 },
                  { label: 'Standard', val: 34 },
                  { label: 'Wide', val: 52 },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => onChange({ matWidth: b.val })}
                    className={`px-2.5 py-1 text-[11px] rounded border transition-colors cursor-pointer ${
                      config.matWidth === b.val
                        ? 'bg-neutral-800 text-amber-400 border-amber-400/40 font-medium'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                {Object.entries(MAT_PALETTES).slice(0, 3).map(([key, mat]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ matColor: key as MatColorType })}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      config.matColor === key ? 'ring-2 ring-amber-400 scale-110' : 'border-neutral-600 opacity-70'
                    }`}
                    style={{ backgroundColor: mat.base }}
                    title={mat.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. Frame Color (Black by default) */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Frame Border Finish</span>
          </label>
          <span className="text-[11px] text-amber-400/90 font-medium">Black Default</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
          {Object.entries(FRAME_PALETTES).map(([key, item]) => {
            const isSelected = config.frameColor === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ frameColor: key as FrameColorType })}
                className={`relative flex flex-col items-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-neutral-800/80 shadow-md ring-1 ring-amber-400/50'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-800/40'
                }`}
              >
                {/* Color Swatch */}
                <div
                  className="w-7 h-7 rounded-full border border-neutral-600 shadow-inner flex items-center justify-center mb-1.5"
                  style={{ backgroundColor: item.base }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-medium text-neutral-300 leading-tight truncate w-full">
                  {item.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Aspect Ratio & Dimensions */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize className="w-3.5 h-3.5 text-amber-400" />
            <span>Social Media Ratio & Size</span>
          </label>
          {config.aspectRatio !== '1:1' && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  orientation: config.orientation === 'portrait' ? 'landscape' : 'portrait',
                })
              }
              className="text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 bg-neutral-800 rounded border border-neutral-700 transition-colors cursor-pointer"
            >
              Rotate: <span className="text-amber-400 capitalize">{config.orientation}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {aspectRatios.map((ratio) => {
            const isSelected = config.aspectRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => onChange({ aspectRatio: ratio.id })}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/40'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span className="text-xs font-semibold text-white">{ratio.label}</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">{ratio.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Frame Border Thickness & Matting */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Border Thickness</span>
            </label>
            <span className="text-xs font-mono text-neutral-400">{config.frameWidth}px</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={6}
              max={60}
              step={2}
              value={config.frameWidth}
              onChange={(e) => onChange({ frameWidth: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            {[
              { label: 'Slim', val: 10 },
              { label: 'Medium', val: 24 },
              { label: 'Bold', val: 38 },
              { label: 'Gallery', val: 54 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange({ frameWidth: p.val })}
                className={`px-2.5 py-1 text-[11px] rounded border transition-colors cursor-pointer ${
                  config.frameWidth === p.val
                    ? 'bg-neutral-800 text-amber-400 border-amber-400/40'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Passe-Partout / Mat Board Options */}
        <div className="pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.hasMat}
                onChange={(e) => onChange({ hasMat: e.target.checked })}
                className="rounded accent-amber-400 cursor-pointer"
              />
              <span>Passe-Partout (Mat Board)</span>
            </label>
            {config.hasMat && (
              <span className="text-xs font-mono text-neutral-400">{config.matWidth}px</span>
            )}
          </div>

          {config.hasMat && (
            <div className="space-y-3 pl-5">
              <input
                type="range"
                min={12}
                max={70}
                step={2}
                value={config.matWidth}
                onChange={(e) => onChange({ matWidth: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {Object.entries(MAT_PALETTES).map(([key, mat]) => {
                  const isSelected = config.matColor === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onChange({ matColor: key as MatColorType })}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-[10px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-neutral-800 text-white font-medium'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-neutral-500 shrink-0"
                        style={{ backgroundColor: mat.base }}
                      />
                      <span className="truncate">{mat.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Real-World Wall Placement & Human-Scale Sizing */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize className="w-3.5 h-3.5 text-amber-400" />
            <span>Wall Hanging Size & Scale</span>
          </label>
          <span className="text-xs font-mono text-amber-400">{config.scaleInRoom}%</span>
        </div>

        {/* Human-scale standard art print sizing presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Small Accent', size: '30 × 40 cm', scale: 75 },
            { label: 'Medium Standard', size: '50 × 70 cm', scale: 100 },
            { label: 'Large Statement', size: '70 × 100 cm', scale: 120 },
            { label: 'Oversized', size: '90 × 120 cm', scale: 140 },
          ].map((preset) => {
            const isSelected = config.scaleInRoom === preset.scale;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ scaleInRoom: preset.scale })}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/40'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <span className="text-xs font-semibold text-white block">{preset.label}</span>
                <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{preset.size}</span>
              </button>
            );
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-300">Fine Scale Tuning</span>
            <span className="text-xs font-mono text-neutral-500">{config.scaleInRoom}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={150}
            value={config.scaleInRoom}
            onChange={(e) => onChange({ scaleInRoom: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Horizontal & Vertical Placement Sliders */}
        <div className="pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-neutral-300">Vertical Height</span>
              <span className="text-xs font-mono text-neutral-400">
                {(config.verticalOffset || 0) > 0 ? `+${config.verticalOffset}` : config.verticalOffset || 0}
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={config.verticalOffset || 0}
              onChange={(e) => onChange({ verticalOffset: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-neutral-300">Horizontal Position</span>
              <span className="text-xs font-mono text-neutral-400">
                {(config.horizontalOffset || 0) > 0 ? `+${config.horizontalOffset}` : config.horizontalOffset || 0}
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={config.horizontalOffset || 0}
              onChange={(e) => onChange({ horizontalOffset: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Position Shortcut */}
        {(config.horizontalOffset !== 0 || config.verticalOffset !== 0 || config.scaleInRoom !== 100) && (
          <button
            type="button"
            onClick={() => onChange({ horizontalOffset: 0, verticalOffset: 0, scaleInRoom: 100 })}
            className="text-xs text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
          >
            ↺ Reset to Default Wall Anchor
          </button>
        )}
      </div>

      {/* 5. Multi-Frame Layout (Single vs Trio Wall) */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4">
        <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
          <span>Gallery Arrangement</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'single', label: 'Single Hero', desc: '1 Main Frame' },
            { id: 'duo', label: 'Matching Duo', desc: '2 Side-by-Side' },
            { id: 'trio', label: 'Gallery Trio', desc: '3 In a Row' },
          ].map((mode) => {
            const isSelected = config.layoutMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChange({ layoutMode: mode.id as 'single' | 'duo' | 'trio' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <span className="text-xs font-semibold text-white">{mode.label}</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">{mode.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
