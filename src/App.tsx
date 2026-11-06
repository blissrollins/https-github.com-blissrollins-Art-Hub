/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StagePreview } from './components/StagePreview';
import { BackgroundSwiper } from './components/BackgroundSwiper';
import { FrameControls } from './components/FrameControls';
import { LightingControls } from './components/LightingControls';
import { ArtworkUploader } from './components/ArtworkUploader';
import { ArtistWatermarkModal } from './components/ArtistWatermarkModal';
import { ExportModal } from './components/ExportModal';
import { BACKGROUND_SCENES } from './data/backgrounds';
import { SAMPLE_ARTWORKS } from './data/sampleArt';
import { BackgroundScene, FrameStyleConfig, SampleArtwork, WatermarkConfig } from './types';
import { Layers, Sliders, Sparkles, ShieldCheck, Download, Image as ImageIcon } from 'lucide-react';

export default function App() {
  // Background scenes
  const [scenes, setScenes] = useState<BackgroundScene[]>(BACKGROUND_SCENES);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Artwork state
  const [artImage, setArtImage] = useState<HTMLImageElement | null>(null);
  const [artTitle, setArtTitle] = useState<string>(SAMPLE_ARTWORKS[0].title);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(SAMPLE_ARTWORKS[0].id);
  const [hasCustomArt, setHasCustomArt] = useState(false);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'mockup' | 'frame' | 'lighting' | 'watermark'>('mockup');

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Frame configuration - BLACK BY DEFAULT
  const [frameConfig, setFrameConfig] = useState<FrameStyleConfig>({
    frameColor: 'matte-black', // Black border by default
    frameWidth: 20,
    frameDepth: 50,
    borderStyle: 'white-border',
    hasMat: true,
    matWidth: 36,
    matColor: 'pure-white',
    matWindowShape: 'square',
    aspectRatio: '4:5',
    orientation: 'portrait',
    glassReflection: true,
    spotlightIntensity: 65,
    spotlightColor: '#FFECC7',
    wallShadowOpacity: 65,
    scaleInRoom: 100,
    verticalOffset: 0,
    horizontalOffset: 0,
    layoutMode: 'single',
  });

  // Artist Watermark configuration
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    enabled: false,
    text: '@artbyenngee',
    position: 'bottom-right',
    opacity: 80,
    color: 'white',
  });

  // Initialize with initial sample artwork
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setArtImage(img);
    };
    img.src = SAMPLE_ARTWORKS[0].dataUrl;
  }, []);

  const handleUpdateFrameConfig = (updated: Partial<FrameStyleConfig>) => {
    setFrameConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateWatermarkConfig = (updated: Partial<WatermarkConfig>) => {
    setWatermarkConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectSample = (sample: SampleArtwork) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setArtImage(img);
      setArtTitle(sample.title);
      setActiveSampleId(sample.id);
      setHasCustomArt(false);
    };
    img.src = sample.dataUrl;
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setArtImage(img);
          setArtTitle(file.name.replace(/\.[^/.]+$/, ''));
          setActiveSampleId(null);
          setHasCustomArt(true);
        };
        img.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        const customScene: BackgroundScene = {
          id: `custom-${Date.now()}`,
          name: 'Custom Room Background',
          category: 'interior',
          description: 'User uploaded room environment',
          wallColor: '#E0E0E0',
          lightingType: 'ambient',
          spotlightX: 50,
          spotlightY: 30,
          furnitureType: 'none',
          customImageUrl: e.target.result,
          wallAnchorX: 50,
          wallAnchorY: 38,
          wallBaseScale: 85,
        };
        const newScenes = [customScene, ...scenes];
        setScenes(newScenes);
        setCurrentSceneIndex(0);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* 3-Zone Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        hasCustomArt={hasCustomArt}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left / Central Stage Viewport */}
        <section className="w-full lg:w-7/12 flex flex-col gap-4 sticky lg:top-24">
          <StagePreview
            currentScene={scenes[currentSceneIndex]}
            allScenes={scenes}
            currentSceneIndex={currentSceneIndex}
            onSceneChange={(idx) => {
              setCurrentSceneIndex(idx);
              const targetScene = scenes[idx];
              if (targetScene && targetScene.defaultLayoutMode) {
                setFrameConfig((prev) => ({
                  ...prev,
                  layoutMode: targetScene.defaultLayoutMode!,
                }));
              }
            }}
            artImage={artImage}
            frameConfig={frameConfig}
            watermarkConfig={watermarkConfig}
            onUpdateFrameConfig={handleUpdateFrameConfig}
            onExportClick={() => setIsExportOpen(true)}
          />

          {/* Swipeable Background Selector strip */}
          <BackgroundSwiper
            scenes={scenes}
            currentIndex={currentSceneIndex}
            onSelectScene={(idx) => setCurrentSceneIndex(idx)}
            onCustomBackgroundUpload={handleCustomBackgroundUpload}
          />
        </section>

        {/* Right Configuration & Customization Sidebar */}
        <aside className="w-full lg:w-5/12 flex flex-col gap-6">
          {/* Mobile Tab Bar */}
          <div className="flex md:hidden items-center justify-between p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('mockup')}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${
                activeTab === 'mockup' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
              }`}
            >
              Art
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('frame')}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${
                activeTab === 'frame' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
              }`}
            >
              Frame
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lighting')}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${
                activeTab === 'lighting' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
              }`}
            >
              Lighting
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('watermark')}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${
                activeTab === 'watermark' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
              }`}
            >
              Watermark
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'mockup' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-serif-display">
                  Artwork & Presentation
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Upload your canvas painting, digital artwork, or photography to stage in room interiors.
                </p>
              </div>

              <ArtworkUploader
                samples={SAMPLE_ARTWORKS}
                activeSampleId={activeSampleId}
                onSelectSample={handleSelectSample}
                onFileUpload={handleFileUpload}
                currentArtTitle={artTitle}
                hasCustomArt={hasCustomArt}
              />
            </div>
          )}

          {activeTab === 'frame' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-serif-display">
                  Frame & Border Styling
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Customize frame molding, matte black border, passe-partout mat board, and aspect ratio.
                </p>
              </div>

              <FrameControls
                config={frameConfig}
                onChange={handleUpdateFrameConfig}
              />
            </div>
          )}

          {activeTab === 'lighting' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-serif-display">
                  Lighting & Depth Simulator
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Fine-tune ceiling spotlights, realistic drop shadows, and glass reflection glare.
                </p>
              </div>

              <LightingControls
                config={frameConfig}
                onChange={handleUpdateFrameConfig}
              />
            </div>
          )}

          {activeTab === 'watermark' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white font-serif-display">
                  Artist Protection & Handle
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Add your Instagram handle or brand signature to prevent art theft when sharing online.
                </p>
              </div>

              <ArtistWatermarkModal
                config={watermarkConfig}
                onChange={handleUpdateWatermarkConfig}
              />
            </div>
          )}

          {/* Quick Export Banner CTA in sidebar */}
          <div className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-sm font-semibold text-white block">Ready to Post?</span>
              <span className="text-xs text-neutral-400 block mt-0.5">
                Download or share directly formatted for Instagram & Pinterest
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Export & Sharing Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        scene={scenes[currentSceneIndex]}
        artImage={artImage}
        frameConfig={frameConfig}
        watermarkConfig={watermarkConfig}
        artworkTitle={artTitle}
      />
    </div>
  );
}
