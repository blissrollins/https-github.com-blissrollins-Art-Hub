import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Instagram,
  Sparkles,
  FileText,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { BackgroundScene, FrameStyleConfig, WatermarkConfig, CaptionConfig } from '../types';
import { renderMockupToCanvas } from '../utils/canvasRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: BackgroundScene;
  artImage: HTMLImageElement | null;
  frameConfig: FrameStyleConfig;
  watermarkConfig: WatermarkConfig;
  artworkTitle: string;
}

interface ExportPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  ratio: string;
  tag: string;
}

const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'ig-portrait',
    name: 'Instagram Portrait',
    platform: 'Instagram Post / Carousel',
    width: 1080,
    height: 1350,
    ratio: '4:5',
    tag: 'Best IG Reach',
  },
  {
    id: 'ig-square',
    name: 'Instagram Square',
    platform: 'Classic Grid',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    tag: 'Classic',
  },
  {
    id: 'ig-story',
    name: 'Story & Reel',
    platform: 'Instagram / TikTok / Shorts',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    tag: 'Vertical Full',
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest Art Pin',
    platform: 'Pinterest',
    width: 1000,
    height: 1500,
    ratio: '2:3',
    tag: 'Viral Pin',
  },
  {
    id: 'ultra-hd',
    name: 'Ultra HD 2K Master',
    platform: 'Portfolio & Print',
    width: 2048,
    height: 2048,
    ratio: '1:1',
    tag: 'Print Grade',
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  scene,
  artImage,
  frameConfig,
  watermarkConfig,
  artworkTitle,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState('ig-portrait');
  const [fileFormat, setFileFormat] = useState<'png' | 'jpeg'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Caption state for art social media posts
  const [captionConfig, setCaptionConfig] = useState<CaptionConfig>({
    title: artworkTitle || 'Solitude & Light',
    medium: 'Archival Giclée Print on Fine Art Cotton Paper',
    dimensions: '24 × 36 inches / 60 × 90 cm',
    priceOrStatus: 'Available · DM for inquiries or tap link in bio',
    artistHandle: watermarkConfig.text || '@artpage',
    customHashtags: '#artcollector #contemporaryart #framedart #interiordesign #artgallery #originalart #modernliving #wallart',
    includeHashtags: true,
  });

  const [copiedCaption, setCopiedCaption] = useState(false);

  if (!isOpen) return null;

  const currentPreset = EXPORT_PRESETS.find((p) => p.id === selectedPresetId) || EXPORT_PRESETS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateExportBlob = async (): Promise<Blob | null> => {
    if (!artImage) return null;

    const exportCanvas = document.createElement('canvas');
    await renderMockupToCanvas({
      canvas: exportCanvas,
      scene,
      artImage,
      frameConfig,
      watermarkConfig,
      targetWidth: currentPreset.width,
      targetHeight: currentPreset.height,
    });

    return new Promise((resolve) => {
      exportCanvas.toBlob(
        (blob) => resolve(blob),
        fileFormat === 'png' ? 'image/png' : 'image/jpeg',
        0.95
      );
    });
  };

  // Direct Download
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const blob = await generateExportBlob();
      if (!blob) throw new Error('Could not generate image');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanTitle = (artworkTitle || 'artwork').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `artframe-${cleanTitle}-${currentPreset.id}.${fileFormat}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported ${currentPreset.name} (${currentPreset.width}×${currentPreset.height}px)!`);
    } catch (err) {
      console.error(err);
      showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      setIsExporting(true);
      const blob = await generateExportBlob();
      if (!blob) throw new Error('Could not generate image');

      if (navigator.clipboard && window.ClipboardItem) {
        // ClipboardItem requires image/png
        const pngBlob = fileFormat === 'png' ? blob : await new Promise<Blob | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            c.getContext('2d')?.drawImage(img, 0, 0);
            c.toBlob((b) => resolve(b), 'image/png');
          };
          img.src = URL.createObjectURL(blob);
        });

        if (pngBlob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob }),
          ]);
          showToast('Image copied to clipboard! Ready to paste into Instagram or chat.');
          return;
        }
      }
      showToast('Clipboard copy not supported on this browser. Use Download instead.');
    } catch (err) {
      console.error(err);
      showToast('Could not copy image. Please use Download.');
    } finally {
      setIsExporting(false);
    }
  };

  // Web Share API (native sheet for mobile / Instagram / WhatsApp)
  const handleNativeShare = async () => {
    try {
      setIsExporting(true);
      const blob = await generateExportBlob();
      if (!blob) return;

      const file = new File([blob], `artframe-${artworkTitle || 'art'}.${fileFormat}`, {
        type: fileFormat === 'png' ? 'image/png' : 'image/jpeg',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: captionConfig.title,
          text: `${captionConfig.title} framed mockup by ${captionConfig.artistHandle}`,
        });
        showToast('Shared successfully!');
      } else {
        handleDownload();
      }
    } catch (err) {
      // User cancelled share or unsupported
      console.log('Share dismissed or unsupported');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate full Instagram caption text
  const getFullCaption = (): string => {
    let caption = `"${captionConfig.title}"\n`;
    caption += `🎨 ${captionConfig.medium}\n`;
    caption += `📐 Dimensions: ${captionConfig.dimensions}\n`;
    caption += `✨ ${captionConfig.priceOrStatus}\n`;
    if (captionConfig.artistHandle) {
      caption += `\nArtwork by ${captionConfig.artistHandle}\n`;
    }
    if (captionConfig.includeHashtags && captionConfig.customHashtags) {
      caption += `\n.\n.\n${captionConfig.customHashtags}`;
    }
    return caption;
  };

  const handleCopyCaption = async () => {
    const text = getFullCaption();
    await navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    showToast('Art caption & hashtags copied to clipboard!');
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-serif-display">
              Export & Social Sharing Studio
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Format & Platform Preset Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2.5">
              1. Choose Social Media Destination & Ratio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {EXPORT_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPresetId(p.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/50'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-semibold text-white">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 font-mono">
                        {p.ratio}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 block">{p.platform}</span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-1">
                      {p.width} × {p.height} px
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. File Format & Quality */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <div>
              <span className="text-xs font-semibold text-white block">File Format</span>
              <span className="text-[11px] text-neutral-400 block">
                PNG (lossless frame details) or JPEG (fast loading)
              </span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => setFileFormat('png')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  fileFormat === 'png' ? 'bg-amber-400 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                PNG Lossless
              </button>
              <button
                type="button"
                onClick={() => setFileFormat('jpeg')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  fileFormat === 'jpeg' ? 'bg-amber-400 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                JPEG 95%
              </button>
            </div>
          </div>

          {/* 3. Primary Export Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : 'Download Image'}</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copy Image</span>
            </button>

            {/* Native Share */}
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Share to App</span>
            </button>
          </div>

          {/* 4. Art Page Caption & Hashtag Suite */}
          <div className="pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white font-serif-display">
                  Instagram Post Caption & Hashtags
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-medium rounded-lg border border-amber-400/30 transition-colors cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <label className="text-neutral-400 block mb-1">Artwork Title</label>
                <input
                  type="text"
                  value={captionConfig.title}
                  onChange={(e) => setCaptionConfig({ ...captionConfig, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Medium & Material</label>
                <input
                  type="text"
                  value={captionConfig.medium}
                  onChange={(e) => setCaptionConfig({ ...captionConfig, medium: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Dimensions</label>
                <input
                  type="text"
                  value={captionConfig.dimensions}
                  onChange={(e) => setCaptionConfig({ ...captionConfig, dimensions: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Status / Availability</label>
                <input
                  type="text"
                  value={captionConfig.priceOrStatus}
                  onChange={(e) => setCaptionConfig({ ...captionConfig, priceOrStatus: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            {/* Formatted Preview Box */}
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {getFullCaption()}
            </div>
          </div>
        </div>

        {/* Toast notification */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-400 text-neutral-950 px-4 py-2 rounded-lg font-medium text-xs shadow-xl flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
