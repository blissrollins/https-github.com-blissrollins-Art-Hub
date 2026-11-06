import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { BackgroundScene, FrameStyleConfig, WatermarkConfig } from '../types';
import { renderMockupToCanvas, getFrameBounds } from '../utils/canvasRenderer';

interface StagePreviewProps {
  currentScene: BackgroundScene;
  allScenes: BackgroundScene[];
  currentSceneIndex: number;
  onSceneChange: (index: number) => void;
  artImage: HTMLImageElement | null;
  frameConfig: FrameStyleConfig;
  watermarkConfig: WatermarkConfig;
  onUpdateFrameConfig: (updated: Partial<FrameStyleConfig>) => void;
  onExportClick: () => void;
}

export const StagePreview: React.FC<StagePreviewProps> = ({
  currentScene,
  allScenes,
  currentSceneIndex,
  onSceneChange,
  artImage,
  frameConfig,
  watermarkConfig,
  onUpdateFrameConfig,
  onExportClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Drag-to-reposition state
  const [isDraggingFrame, setIsDraggingFrame] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialOffsets = useRef<{ h: number; v: number }>({ h: 0, v: 0 });

  // Swipe for background scene
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const prevScene = useCallback(() => {
    const nextIndex = currentSceneIndex === 0 ? allScenes.length - 1 : currentSceneIndex - 1;
    onSceneChange(nextIndex);
  }, [currentSceneIndex, allScenes.length, onSceneChange]);

  const nextScene = useCallback(() => {
    const nextIndex = currentSceneIndex === allScenes.length - 1 ? 0 : currentSceneIndex + 1;
    onSceneChange(nextIndex);
  }, [currentSceneIndex, allScenes.length, onSceneChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' && !e.shiftKey) {
        prevScene();
      } else if (e.key === 'ArrowRight' && !e.shiftKey) {
        nextScene();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevScene, nextScene]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !artImage) return;

    let isMounted = true;
    setIsRendering(true);

    const render = async () => {
      try {
        await renderMockupToCanvas({
          canvas,
          scene: currentScene,
          artImage,
          frameConfig,
          watermarkConfig,
          targetWidth: 1440,
          targetHeight: 1440,
        });
      } catch (err) {
        console.error('Failed to render canvas:', err);
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [currentScene, artImage, frameConfig, watermarkConfig]);

  // Mouse & Touch Drag-to-Position on the Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1440;
    const clickY = ((e.clientY - rect.top) / rect.height) * 1440;

    // Check if clicked inside or near the frame bounds
    const bounds = getFrameBounds(1440, 1440, currentScene, frameConfig, artImage);
    const hitPadding = 80;
    const isHit =
      clickX >= bounds.x - hitPadding &&
      clickX <= bounds.x + bounds.width + hitPadding &&
      clickY >= bounds.y - hitPadding &&
      clickY <= bounds.y + bounds.height + hitPadding;

    if (isHit) {
      // User is dragging the frame
      setIsDraggingFrame(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      initialOffsets.current = {
        h: frameConfig.horizontalOffset || 0,
        v: frameConfig.verticalOffset || 0,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } else {
      // Swiping background
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingFrame && dragStartPos.current) {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      // Map screen px delta to offset percentage
      const sensitivity = 0.22;
      const newH = Math.max(-100, Math.min(100, Math.round(initialOffsets.current.h + deltaX * sensitivity)));
      const newV = Math.max(-100, Math.min(100, Math.round(initialOffsets.current.v + deltaY * sensitivity)));

      onUpdateFrameConfig({
        horizontalOffset: newH,
        verticalOffset: newV,
      });
    } else if (touchStartX.current !== null) {
      const diffX = e.clientX - touchStartX.current;
      if (Math.abs(diffX) < 150) {
        setSwipeOffset(diffX * 0.15);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingFrame) {
      setIsDraggingFrame(false);
      dragStartPos.current = null;
    } else if (touchStartX.current !== null) {
      const diffX = e.clientX - touchStartX.current;
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) prevScene();
        else nextScene();
      }
      touchStartX.current = null;
      touchStartY.current = null;
      setSwipeOffset(0);
    }
  };

  // Quick nudges
  const nudge = (dh: number, dv: number) => {
    onUpdateFrameConfig({
      horizontalOffset: Math.max(-100, Math.min(100, (frameConfig.horizontalOffset || 0) + dh)),
      verticalOffset: Math.max(-100, Math.min(100, (frameConfig.verticalOffset || 0) + dv)),
    });
  };

  const resetPosition = () => {
    onUpdateFrameConfig({
      horizontalOffset: 0,
      verticalOffset: 0,
      scaleInRoom: 100,
    });
  };

  // Sizing presets
  const applySizePreset = (scale: number, label: string) => {
    onUpdateFrameConfig({
      scaleInRoom: scale,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-neutral-950 p-4'
          : 'w-full h-full min-h-[480px] lg:min-h-[640px] bg-neutral-900/60 rounded-2xl border border-neutral-800/80 p-3 sm:p-5 shadow-2xl overflow-hidden'
      }`}
    >
      {/* Top stage metadata & quick tools */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between text-xs pointer-events-none">
        <div className="flex items-center gap-2 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-300 pointer-events-auto shadow-md">
          <span className="font-mono text-amber-400 font-semibold">
            {String(currentSceneIndex + 1).padStart(2, '0')} / {String(allScenes.length).padStart(2, '0')}
          </span>
          <span className="text-neutral-600">·</span>
          <span className="font-medium text-white">{currentScene.name}</span>
          {currentScene.imageUrl && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="text-amber-400 text-[10px] font-semibold tracking-wide uppercase">Real Interior</span>
            </>
          )}
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400 uppercase tracking-wider text-[10px]">{frameConfig.aspectRatio}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 1-Click Framing Style Switcher: Whole Frame vs White Square Border */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950/90 backdrop-blur-md rounded-lg border border-neutral-800 text-[11px] shadow-md">
            <button
              type="button"
              onClick={() => onUpdateFrameConfig({ borderStyle: 'full-frame', hasMat: false })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                frameConfig.borderStyle === 'full-frame' || !frameConfig.hasMat
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Artwork covers the whole frame completely (Edge to Edge, as in Screenshot 1)"
            >
              <span>Cover Whole Frame</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateFrameConfig({
                  borderStyle: 'white-border',
                  hasMat: true,
                  matWindowShape: 'square',
                  aspectRatio: '1:1',
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                (frameConfig.borderStyle === 'white-border' || frameConfig.hasMat) && frameConfig.matWindowShape === 'square'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Artwork and white border have perfect 1:1 square symmetry on all 4 sides (as in Screenshot 2)"
            >
              <span>White Square Border</span>
            </button>
          </div>

          {/* Reset position button if moved */}
          {(frameConfig.horizontalOffset !== 0 || frameConfig.verticalOffset !== 0 || frameConfig.scaleInRoom !== 100) && (
            <button
              type="button"
              onClick={resetPosition}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-neutral-950/85 hover:bg-neutral-800 text-amber-300 rounded-lg border border-neutral-800 transition-colors cursor-pointer text-xs shadow-md"
              title="Reset frame position to wall anchor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-neutral-950/85 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 transition-colors cursor-pointer shadow-md"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Area with Drag to Reposition */}
      <div
        className="relative w-full h-full max-w-[620px] max-h-[620px] flex items-center justify-center transition-transform duration-100 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`w-full h-auto aspect-square max-h-[580px] object-contain rounded-xl shadow-2xl transition-all touch-none ${
            isDraggingFrame ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title="Click and drag to position the framed artwork freely on the wall"
        />

        {isRendering && (
          <div className="absolute inset-0 bg-neutral-950/20 backdrop-blur-[2px] rounded-xl flex items-center justify-center pointer-events-none">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Navigation Arrow Controls */}
      <button
        type="button"
        onClick={prevScene}
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer"
        aria-label="Previous Background Scene"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={nextScene}
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white flex items-center justify-center transition-all shadow-xl active:scale-90 cursor-pointer"
        aria-label="Next Background Scene"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* On-Stage Hanging Controls Bar (Size Presets & Position Nudge) */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-xs pointer-events-none gap-2">
        {/* Real-world scale presets */}
        <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-md px-2 py-1.5 rounded-lg border border-neutral-800 pointer-events-auto shadow-lg">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider px-1">Scale:</span>
          {[
            { label: 'Compact', scale: 75 },
            { label: 'Standard', scale: 100 },
            { label: 'Statement', scale: 120 },
            { label: 'Gallery', scale: 140 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applySizePreset(preset.scale, preset.label)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                frameConfig.scaleInRoom === preset.scale
                  ? 'bg-amber-400 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Drag Hint & Nudge Tools */}
        <div className="hidden sm:flex items-center gap-1.5 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-300 pointer-events-auto shadow-lg">
          <Move className="w-3.5 h-3.5 text-amber-400" />
          <span>Drag frame on wall to adjust</span>
          <div className="flex items-center gap-0.5 ml-1 border-l border-neutral-800 pl-1.5">
            <button
              type="button"
              onClick={() => nudge(0, -3)}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white cursor-pointer"
              title="Nudge Up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => nudge(0, 3)}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white cursor-pointer"
              title="Nudge Down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => nudge(-3, 0)}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white cursor-pointer"
              title="Nudge Left"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => nudge(3, 0)}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white cursor-pointer"
              title="Nudge Right"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
