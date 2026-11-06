export type AspectRatioType = '4:5' | '1:1' | '9:16' | '3:4' | '2:3' | '16:9' | 'original';

export type FrameColorType = 
  | 'matte-black'
  | 'satin-black'
  | 'deep-charcoal'
  | 'natural-oak'
  | 'dark-walnut'
  | 'crisp-white'
  | 'brushed-brass'
  | 'brushed-silver';

export type MatColorType = 
  | 'pure-white' 
  | 'warm-ivory' 
  | 'antique-cream' 
  | 'soft-linen' 
  | 'charcoal-black';

export interface FrameStyleConfig {
  frameColor: FrameColorType;
  customColor?: string;
  frameWidth: number; // in pixels (at base 1000px scale)
  frameDepth: number; // shadow intensity 0 - 100
  borderStyle: 'full-frame' | 'white-border'; // full frame coverage vs white mat border
  hasMat: boolean;
  matWidth: number; // in pixels
  matColor: MatColorType;
  matWindowShape?: 'proportional' | 'square'; // square window or proportional
  aspectRatio: AspectRatioType;
  orientation: 'portrait' | 'landscape';
  glassReflection: boolean;
  spotlightIntensity: number; // 0 - 100
  spotlightColor: string; // hex
  wallShadowOpacity: number; // 0 - 100
  scaleInRoom: number; // 40% - 150%
  verticalOffset: number; // -100 to 100
  horizontalOffset: number; // -100 to 100
  sizePreset?: 'small' | 'medium' | 'large' | 'oversized';
  layoutMode: 'single' | 'trio' | 'duo'; // single frame vs trio gallery
}

export interface BackgroundScene {
  id: string;
  name: string;
  category: 'interior' | 'gallery' | 'studio' | 'minimal';
  description: string;
  wallColor: string;
  secondaryColor?: string;
  accentColor?: string;
  lightingType: 'spotlight' | 'ambient' | 'sconce' | 'window';
  spotlightX: number; // percentage 0-100
  spotlightY: number;
  furnitureType?: 'console' | 'bedroom' | 'trio-strip' | 'living-plant' | 'minimal-pedestal' | 'none';
  imageUrl?: string;
  customImageUrl?: string;
  wallAnchorX: number; // Percentage 0-100 of canvas width where artwork hangs
  wallAnchorY: number; // Percentage 0-100 of canvas height where artwork hangs
  wallBaseScale: number; // Base scale percentage 50 - 120
  defaultLayoutMode?: 'single' | 'trio' | 'duo';
}

export interface SampleArtwork {
  id: string;
  title: string;
  artist: string;
  category: string;
  dataUrl: string;
}

export interface CaptionConfig {
  title: string;
  medium: string;
  dimensions: string;
  priceOrStatus: string;
  artistHandle: string;
  customHashtags: string;
  includeHashtags: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'mat-corner';
  opacity: number;
  color: 'white' | 'black' | 'gold';
}
