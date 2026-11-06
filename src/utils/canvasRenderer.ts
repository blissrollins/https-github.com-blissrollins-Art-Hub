import { BackgroundScene, FrameStyleConfig, WatermarkConfig } from '../types';

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  scene: BackgroundScene;
  artImage: HTMLImageElement;
  frameConfig: FrameStyleConfig;
  watermarkConfig?: WatermarkConfig;
  targetWidth?: number;
  targetHeight?: number;
}

// Frame color definitions with gradient / material highlights
export const FRAME_PALETTES: Record<string, { base: string; light: string; dark: string; name: string }> = {
  'matte-black': { base: '#151515', light: '#2B2B2B', dark: '#080808', name: 'Matte Gallery Black' },
  'satin-black': { base: '#1C1C1C', light: '#383838', dark: '#0C0C0C', name: 'Satin Black' },
  'deep-charcoal': { base: '#2A2D34', light: '#3F444E', dark: '#181A1F', name: 'Charcoal Anodized' },
  'natural-oak': { base: '#C7A779', light: '#DFBF92', dark: '#9C784C', name: 'Natural Scandinavian Oak' },
  'dark-walnut': { base: '#422818', light: '#5C3A24', dark: '#2B190D', name: 'Rich Walnut' },
  'crisp-white': { base: '#F3F4F6', light: '#FFFFFF', dark: '#D1D5DB', name: 'Museum White' },
  'brushed-brass': { base: '#D4AF37', light: '#F3E5AB', dark: '#997924', name: 'Brushed Brass' },
  'brushed-silver': { base: '#A8A9AD', light: '#D8D8D8', dark: '#757679', name: 'Brushed Aluminum' },
};

export const MAT_PALETTES: Record<string, { base: string; core: string; name: string }> = {
  'pure-white': { base: '#FAFAFA', core: '#FFFFFF', name: 'Pure White Mat' },
  'warm-ivory': { base: '#F5F2EB', core: '#FFFFFF', name: 'Warm Ivory' },
  'antique-cream': { base: '#EFE9DC', core: '#FAF6EE', name: 'Antique Cream' },
  'soft-linen': { base: '#E8E3D8', core: '#F5F2EA', name: 'Natural Linen' },
  'charcoal-black': { base: '#222326', core: '#141416', name: 'Gallery Charcoal' },
};

export function getAspectRatioMultiplier(ratio: string, imgWidth = 800, imgHeight = 1000, orientation: 'portrait' | 'landscape' = 'portrait'): number {
  let w = 1;
  let h = 1;

  switch (ratio) {
    case '4:5':
      w = 4;
      h = 5;
      break;
    case '1:1':
      w = 1;
      h = 1;
      break;
    case '9:16':
      w = 9;
      h = 16;
      break;
    case '3:4':
      w = 3;
      h = 4;
      break;
    case '2:3':
      w = 2;
      h = 3;
      break;
    case '16:9':
      w = 16;
      h = 9;
      break;
    case 'original':
      if (imgWidth && imgHeight) {
        return imgHeight / imgWidth;
      }
      return 1.25;
    default:
      w = 4;
      h = 5;
  }

  if (orientation === 'landscape' && ratio !== '1:1') {
    return w / h;
  }
  return h / w;
}

// Global cache for loaded background images to ensure 60fps instant swipe transitions
const bgImageCache = new Map<string, HTMLImageElement>();

function loadBackgroundImage(url: string): Promise<HTMLImageElement | null> {
  if (bgImageCache.has(url)) {
    return Promise.resolve(bgImageCache.get(url)!);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      bgImageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

export async function renderMockupToCanvas({
  canvas,
  scene,
  artImage,
  frameConfig,
  watermarkConfig,
  targetWidth = 1440,
  targetHeight = 1440,
}: RenderOptions): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const cw = canvas.width;
  const ch = canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  const bgUrl = scene.customImageUrl || scene.imageUrl;

  // 1. Draw Background Scene (Real Photograph or Procedural Room)
  if (bgUrl) {
    const bgImg = await loadBackgroundImage(bgUrl);
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      // High-precision cover fit
      const bgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasRatio = cw / ch;
      let dw = cw;
      let dh = ch;
      let dx = 0;
      let dy = 0;
      if (canvasRatio > bgRatio) {
        dh = cw / bgRatio;
        dy = (ch - dh) / 2;
      } else {
        dw = ch * bgRatio;
        dx = (cw - dw) / 2;
      }
      ctx.drawImage(bgImg, dx, dy, dw, dh);
    } else {
      drawProceduralRoom(ctx, cw, ch, scene);
    }
  } else {
    drawProceduralRoom(ctx, cw, ch, scene);
  }

  // 2. Render Ceiling Spotlight / Sconce Glow (only if enabled and procedural or user wants extra spotlight)
  if (frameConfig.spotlightIntensity > 0 && !scene.imageUrl) {
    drawSpotlightEffect(ctx, cw, ch, scene, frameConfig);
  } else if (frameConfig.spotlightIntensity > 30 && scene.imageUrl && scene.lightingType === 'spotlight') {
    // Subtle accent highlight if desired
    drawSpotlightEffect(ctx, cw, ch, scene, {
      ...frameConfig,
      spotlightIntensity: frameConfig.spotlightIntensity * 0.4,
    });
  }

  // 3. Calculate Frame Dimensions & Placements
  const bounds = getFrameBounds(cw, ch, scene, frameConfig, artImage);
  const { centerX, centerY, width: baseFrameWidth, height: baseFrameHeight } = bounds;

  // Frame count: single or trio or duo
  if (frameConfig.layoutMode === 'trio') {
    const trioScale = 0.68;
    const trioWidth = baseFrameWidth * trioScale;
    const trioHeight = baseFrameHeight * trioScale;
    const gap = trioWidth * 0.16;

    const leftX = centerX - (trioWidth + gap);
    const middleX = centerX;
    const rightX = centerX + (trioWidth + gap);

    drawSingleFramedArt(ctx, leftX, centerY, trioWidth, trioHeight, artImage, frameConfig, watermarkConfig, cw);
    drawSingleFramedArt(ctx, middleX, centerY, trioWidth, trioHeight, artImage, frameConfig, watermarkConfig, cw);
    drawSingleFramedArt(ctx, rightX, centerY, trioWidth, trioHeight, artImage, frameConfig, watermarkConfig, cw);
  } else if (frameConfig.layoutMode === 'duo') {
    const duoScale = 0.8;
    const duoWidth = baseFrameWidth * duoScale;
    const duoHeight = baseFrameHeight * duoScale;
    const gap = duoWidth * 0.2;

    const leftX = centerX - (duoWidth / 2 + gap / 2);
    const rightX = centerX + (duoWidth / 2 + gap / 2);

    drawSingleFramedArt(ctx, leftX, centerY, duoWidth, duoHeight, artImage, frameConfig, watermarkConfig, cw);
    drawSingleFramedArt(ctx, rightX, centerY, duoWidth, duoHeight, artImage, frameConfig, watermarkConfig, cw);
  } else {
    // Single hero frame
    drawSingleFramedArt(ctx, centerX, centerY, baseFrameWidth, baseFrameHeight, artImage, frameConfig, watermarkConfig, cw);
  }
}

export function getFrameBounds(
  cw: number,
  ch: number,
  scene: BackgroundScene,
  frameConfig: FrameStyleConfig,
  artImage: HTMLImageElement | null
) {
  const anchorXPercent = scene.wallAnchorX ?? 50;
  const anchorYPercent = scene.wallAnchorY ?? 38;
  const baseScalePercent = scene.wallBaseScale ?? 84;

  const userScale = (frameConfig.scaleInRoom || 100) / 100;
  const effectiveScale = (baseScalePercent / 100) * userScale;

  const ratioHOverW = getAspectRatioMultiplier(
    frameConfig.aspectRatio,
    artImage?.naturalWidth || 800,
    artImage?.naturalHeight || 1000,
    frameConfig.orientation
  );

  // Proportional sizing: base width is 38% of canvas at scale 1.0
  const width = cw * 0.38 * effectiveScale;
  const height = width * ratioHOverW;

  const hOffset = ((frameConfig.horizontalOffset || 0) / 100) * (cw * 0.35);
  const vOffset = ((frameConfig.verticalOffset || 0) / 100) * (ch * 0.35);

  const centerX = (cw * (anchorXPercent / 100)) + hOffset;
  const centerY = (ch * (anchorYPercent / 100)) + vOffset;

  return {
    centerX,
    centerY,
    width,
    height,
    x: centerX - width / 2,
    y: centerY - height / 2,
  };
}

function drawProceduralRoom(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  scene: BackgroundScene
) {
  // Base Wall Gradient (subtle depth from top to floor)
  const wallGrad = ctx.createLinearGradient(0, 0, 0, ch);
  wallGrad.addColorStop(0, scene.wallColor);
  wallGrad.addColorStop(0.7, scene.wallColor);
  // Slightly cooler/darker towards bottom floor transition
  wallGrad.addColorStop(1, adjustColor(scene.wallColor, -12));
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, cw, ch);

  // Subtle wall plaster noise / texture simulation
  drawSubtlePlasterTexture(ctx, cw, ch);

  // Background specific furniture / decor accents
  switch (scene.furnitureType) {
    case 'console':
      drawWalnutConsole(ctx, cw, ch);
      break;
    case 'minimal-pedestal':
      drawOakWainscoting(ctx, cw, ch);
      break;
    case 'trio-strip':
      drawSageGalleryStripe(ctx, cw, ch, scene);
      break;
    case 'bedroom':
      drawBedroomSetting(ctx, cw, ch);
      break;
    case 'living-plant':
      drawJapandiLiving(ctx, cw, ch);
      break;
    default:
      // Generic architectural baseboard
      drawArchitecturalBaseboard(ctx, cw, ch);
      break;
  }
}

function drawSubtlePlasterTexture(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  // Subtle horizontal plaster wash
  for (let i = 0; i < 6; i++) {
    const y = (ch / 6) * i;
    ctx.fillRect(0, y, cw, ch / 12);
  }
  ctx.restore();
}

function drawSpotlightEffect(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  scene: BackgroundScene,
  frameConfig: FrameStyleConfig
) {
  const intensity = (frameConfig.spotlightIntensity || 65) / 100;
  const spotX = (scene.spotlightX / 100) * cw;
  const spotY = (scene.spotlightY / 100) * ch;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  if (scene.lightingType === 'spotlight') {
    // Ceiling Downlight Cone
    // 1. Lamp fixture glow at ceiling
    const fixtureGrad = ctx.createRadialGradient(spotX, 0, 0, spotX, 0, cw * 0.15);
    fixtureGrad.addColorStop(0, `rgba(255, 244, 220, ${0.45 * intensity})`);
    fixtureGrad.addColorStop(1, 'rgba(255, 244, 220, 0)');
    ctx.fillStyle = fixtureGrad;
    ctx.beginPath();
    ctx.arc(spotX, 0, cw * 0.15, 0, Math.PI);
    ctx.fill();

    // 2. Wide spotlight beam radiating down
    const beamGrad = ctx.createRadialGradient(spotX, ch * 0.35, cw * 0.05, spotX, ch * 0.45, cw * 0.65);
    beamGrad.addColorStop(0, `rgba(255, 248, 230, ${0.4 * intensity})`);
    beamGrad.addColorStop(0.5, `rgba(255, 240, 215, ${0.18 * intensity})`);
    beamGrad.addColorStop(1, 'rgba(255, 240, 210, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 0, cw, ch);
  } else if (scene.lightingType === 'sconce') {
    // Wall sconce round glow
    const sconceGrad = ctx.createRadialGradient(spotX, spotY, 10, spotX, spotY, cw * 0.45);
    sconceGrad.addColorStop(0, `rgba(255, 245, 225, ${0.5 * intensity})`);
    sconceGrad.addColorStop(0.6, `rgba(255, 235, 205, ${0.15 * intensity})`);
    sconceGrad.addColorStop(1, 'rgba(255, 235, 200, 0)');
    ctx.fillStyle = sconceGrad;
    ctx.fillRect(0, 0, cw, ch);
  } else if (scene.lightingType === 'window') {
    // Angled sunbeam window shadow
    ctx.save();
    ctx.fillStyle = `rgba(255, 250, 240, ${0.25 * intensity})`;
    ctx.beginPath();
    ctx.moveTo(0, ch * 0.1);
    ctx.lineTo(cw * 0.85, 0);
    ctx.lineTo(cw, ch * 0.4);
    ctx.lineTo(cw * 0.15, ch * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    // Subtle ambient studio illumination
    const ambGrad = ctx.createRadialGradient(cw / 2, ch * 0.4, cw * 0.1, cw / 2, ch * 0.4, cw * 0.7);
    ambGrad.addColorStop(0, `rgba(255, 255, 255, ${0.3 * intensity})`);
    ambGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = ambGrad;
    ctx.fillRect(0, 0, cw, ch);
  }

  ctx.restore();
}

function drawWalnutConsole(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const tableY = ch * 0.78;
  const tableH = ch * 0.22;
  const floorY = ch * 0.96;

  // Floor
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, ch);
  floorGrad.addColorStop(0, '#BFA588');
  floorGrad.addColorStop(1, '#9E846A');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, cw, ch - floorY);

  // Baseboard
  ctx.fillStyle = '#E5E0D5';
  ctx.fillRect(0, floorY - 14, cw, 14);

  // Walnut Console Shadow on wall
  ctx.fillStyle = 'rgba(20, 15, 10, 0.22)';
  ctx.fillRect(cw * 0.15, tableY + 6, cw * 0.7, 24);

  // Console Table Top Surface (rich dark walnut)
  const woodGrad = ctx.createLinearGradient(0, tableY, 0, tableY + 28);
  woodGrad.addColorStop(0, '#4A2E1B');
  woodGrad.addColorStop(0.4, '#382012');
  woodGrad.addColorStop(1, '#2B170B');
  ctx.fillStyle = woodGrad;

  // Rounded edge top slab
  drawRoundedRect(ctx, cw * 0.16, tableY, cw * 0.68, 26, 6);
  ctx.fill();

  // Subtle wood highlight on top edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cw * 0.17, tableY + 1);
  ctx.lineTo(cw * 0.83, tableY + 1);
  ctx.stroke();

  // Console Legs
  ctx.fillStyle = '#2B170B';
  ctx.fillRect(cw * 0.20, tableY + 26, cw * 0.05, tableH);
  ctx.fillRect(cw * 0.75, tableY + 26, cw * 0.05, tableH);

  // Ceramic Vase with Dried Pampas / Bunnytails on the left of console
  drawPampasVase(ctx, cw * 0.26, tableY - 10);
}

function drawPampasVase(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  // Ceramic vase
  const vaseGrad = ctx.createLinearGradient(x - 30, y, x + 30, y);
  vaseGrad.addColorStop(0, '#D9D2C5');
  vaseGrad.addColorStop(0.5, '#ECE6DC');
  vaseGrad.addColorStop(1, '#C5BCAD');
  ctx.fillStyle = vaseGrad;

  ctx.beginPath();
  ctx.ellipse(x, y - 40, 26, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Vase neck
  ctx.fillRect(x - 12, y - 90, 24, 25);
  ctx.beginPath();
  ctx.ellipse(x, y - 90, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Vase subtle shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x + 10, y + 2, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dried Pampas Grass & Florals branching out
  ctx.strokeStyle = '#8D7B68';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  const stems = [
    { dx: -25, dy: -140, fluffDx: -35, fluffDy: -180 },
    { dx: -5, dy: -160, fluffDx: -10, fluffDy: -210 },
    { dx: 20, dy: -130, fluffDx: 30, fluffDy: -170 },
    { dx: 35, dy: -110, fluffDx: 48, fluffDy: -140 },
  ];

  stems.forEach(stem => {
    ctx.beginPath();
    ctx.moveTo(x, y - 90);
    ctx.quadraticCurveTo(x + stem.dx * 0.5, y - 110, x + stem.dx, y + stem.dy);
    ctx.stroke();

    // Fluffy pampas plume
    ctx.save();
    ctx.fillStyle = '#E3D8C8';
    ctx.beginPath();
    ctx.ellipse(x + stem.fluffDx, y + stem.fluffDy, 16, 38, Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}

function drawOakWainscoting(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const wainscotY = ch * 0.72;
  const slatWidth = 14;
  const slatGap = 8;

  // Wainscot top trim moulding
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(0, wainscotY, cw, 18);
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(0, wainscotY + 18, cw, 4);

  // Vertical wood slats
  const woodBase = '#BCAAA4';
  const woodShadow = '#8D6E63';
  ctx.fillStyle = woodBase;
  ctx.fillRect(0, wainscotY + 22, cw, ch - wainscotY);

  for (let x = 0; x < cw; x += slatWidth + slatGap) {
    ctx.fillStyle = woodShadow;
    ctx.fillRect(x, wainscotY + 22, slatGap, ch - wainscotY);
  }

  // Round wall sconce light fixture on upper left wall
  const sconceX = cw * 0.16;
  const sconceY = ch * 0.22;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(sconceX, sconceY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#BDBDBD';
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawSageGalleryStripe(ctx: CanvasRenderingContext2D, cw: number, ch: number, scene: BackgroundScene) {
  const stripeY = ch * 0.38;
  const stripeH = ch * 0.18;

  // Horizontal modern architectural gallery accent stripe (like screenshot 3!)
  ctx.fillStyle = scene.secondaryColor || '#8B9B7E';
  ctx.fillRect(0, stripeY, cw, stripeH);

  // Floor skirting
  drawArchitecturalBaseboard(ctx, cw, ch);
}

function drawBedroomSetting(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const bedY = ch * 0.65;

  // Fluted oak headboard
  const hbGrad = ctx.createLinearGradient(0, bedY, 0, ch * 0.85);
  hbGrad.addColorStop(0, '#C2A379');
  hbGrad.addColorStop(1, '#9E7E56');
  ctx.fillStyle = hbGrad;

  drawRoundedRect(ctx, cw * 0.18, bedY, cw * 0.64, ch * 0.32, 10);
  ctx.fill();

  // Horizontal slats across headboard
  ctx.strokeStyle = 'rgba(70, 50, 30, 0.25)';
  ctx.lineWidth = 3;
  for (let y = bedY + 18; y < ch * 0.82; y += 18) {
    ctx.beginPath();
    ctx.moveTo(cw * 0.19, y);
    ctx.lineTo(cw * 0.81, y);
    ctx.stroke();
  }

  // Olive linen pillows & duvet (as in screenshot 4)
  const duvetY = ch * 0.77;
  ctx.fillStyle = '#6E8B3D'; // Olive green duvet
  drawRoundedRect(ctx, cw * 0.16, duvetY, cw * 0.68, ch * 0.23, 20);
  ctx.fill();

  // Light green pillow top fold
  ctx.fillStyle = '#A4C686';
  drawRoundedRect(ctx, cw * 0.22, duvetY - 26, cw * 0.26, 44, 12);
  ctx.fill();

  ctx.fillStyle = '#556B2F'; // Dark olive pillow
  drawRoundedRect(ctx, cw * 0.52, duvetY - 26, cw * 0.26, 44, 12);
  ctx.fill();

  // Bedside nightstand lamp glow on right
  const lampX = cw * 0.78;
  const lampY = ch * 0.72;
  const lampGrad = ctx.createRadialGradient(lampX, lampY, 8, lampX, lampY, 90);
  lampGrad.addColorStop(0, 'rgba(255, 230, 150, 0.9)');
  lampGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.35)');
  lampGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = lampGrad;
  ctx.fillRect(lampX - 90, lampY - 90, 180, 180);
}

function drawJapandiLiving(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const floorY = ch * 0.88;

  // Light bleached oak floor
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, ch);
  floorGrad.addColorStop(0, '#E3DAC9');
  floorGrad.addColorStop(1, '#CFC3B0');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, cw, ch - floorY);

  // Plinth / low bench
  ctx.fillStyle = '#5A534B';
  drawRoundedRect(ctx, cw * 0.25, floorY - 32, cw * 0.5, 32, 4);
  ctx.fill();

  // Ceramic sculptural object
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.arc(cw * 0.32, floorY - 50, 18, 0, Math.PI * 2);
  ctx.fill();

  // Baseboard
  ctx.fillStyle = '#EFEAE1';
  ctx.fillRect(0, floorY - 10, cw, 10);
}

function drawArchitecturalBaseboard(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
  const floorY = ch * 0.94;
  // Floor
  ctx.fillStyle = '#D6D1C7';
  ctx.fillRect(0, floorY, cw, ch - floorY);

  // Baseboard trim
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, floorY - 14, cw, 14);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(0, floorY - 14, cw, 2);
}

function drawSingleFramedArt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  artImage: HTMLImageElement,
  frameConfig: FrameStyleConfig,
  watermarkConfig?: WatermarkConfig,
  canvasWidth = 1440
) {
  const x = cx - w / 2;
  const y = cy - h / 2;

  const frameWidthPx = (frameConfig.frameWidth / 1000) * canvasWidth;
  const hasMat = frameConfig.hasMat;
  const matWidthPx = hasMat ? (frameConfig.matWidth / 1000) * canvasWidth : 0;

  // 1. Realistic Multi-layered Wall Drop Shadow
  const shadowOpacity = (frameConfig.wallShadowOpacity || 60) / 100;
  ctx.save();
  
  // Ambient diffuse wall shadow
  ctx.shadowColor = `rgba(10, 10, 15, ${0.28 * shadowOpacity})`;
  ctx.shadowBlur = Math.round(w * 0.08);
  ctx.shadowOffsetX = Math.round(w * 0.015);
  ctx.shadowOffsetY = Math.round(h * 0.04);
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, y, w, h);

  // Contact sharp wall shadow
  ctx.shadowColor = `rgba(0, 0, 0, ${0.45 * shadowOpacity})`;
  ctx.shadowBlur = Math.round(w * 0.02);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(h * 0.012);
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // 2. Draw Frame Border / Moulding
  const frameColorKey = frameConfig.frameColor || 'matte-black';
  const palette = FRAME_PALETTES[frameColorKey] || FRAME_PALETTES['matte-black'];

  // Base frame rectangle
  ctx.fillStyle = palette.base;
  ctx.fillRect(x, y, w, h);

  // Bevel Highlights & 3D Lighting on Frame Moulding
  // Top & Left: Highlight
  ctx.fillStyle = palette.light;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - frameWidthPx, y + frameWidthPx);
  ctx.lineTo(x + frameWidthPx, y + frameWidthPx);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + frameWidthPx, y + frameWidthPx);
  ctx.lineTo(x + frameWidthPx, y + h - frameWidthPx);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // Bottom & Right: Shadow
  ctx.fillStyle = palette.dark;
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - frameWidthPx, y + h - frameWidthPx);
  ctx.lineTo(x + w - frameWidthPx, y + frameWidthPx);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + frameWidthPx, y + h - frameWidthPx);
  ctx.lineTo(x + w - frameWidthPx, y + h - frameWidthPx);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  // 45 degree miter joints on corners (subtle hairline)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + frameWidthPx, y + frameWidthPx);
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w - frameWidthPx, y + frameWidthPx);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + frameWidthPx, y + h - frameWidthPx);
  ctx.moveTo(x + w, y + h);
  ctx.lineTo(x + w - frameWidthPx, y + h - frameWidthPx);
  ctx.stroke();

  // Inner frame rabbet edge line
  const innerFrameX = x + frameWidthPx;
  const innerFrameY = y + frameWidthPx;
  const innerFrameW = Math.max(10, w - frameWidthPx * 2);
  const innerFrameH = Math.max(10, h - frameWidthPx * 2);

  // Inner deep shadow cast from frame onto mat/artwork
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(innerFrameX, innerFrameY, innerFrameW, Math.min(8, frameWidthPx * 0.4));
  ctx.fillRect(innerFrameX, innerFrameY, Math.min(8, frameWidthPx * 0.4), innerFrameH);
  ctx.restore();

  // 3. Draw Passe-Partout / White Mat Board if enabled
  const isWhiteBorder = frameConfig.borderStyle === 'white-border' || (frameConfig.borderStyle !== 'full-frame' && frameConfig.hasMat);
  let artAreaX = innerFrameX;
  let artAreaY = innerFrameY;
  let artAreaW = innerFrameW;
  let artAreaH = innerFrameH;

  if (isWhiteBorder && matWidthPx > 0) {
    const matColorKey = frameConfig.matColor || 'pure-white';
    const matPalette = MAT_PALETTES[matColorKey] || MAT_PALETTES['pure-white'];

    // Fill Mat surface (white/ivory border)
    ctx.fillStyle = matPalette.base;
    ctx.fillRect(innerFrameX, innerFrameY, innerFrameW, innerFrameH);

    if (frameConfig.matWindowShape === 'square') {
      // White square aperture inside the frame
      const minInner = Math.min(innerFrameW, innerFrameH);
      const squareSize = Math.max(20, minInner - matWidthPx * 2);
      artAreaW = squareSize;
      artAreaH = squareSize;
      artAreaX = innerFrameX + (innerFrameW - squareSize) / 2;
      artAreaY = innerFrameY + (innerFrameH - squareSize) / 2;
    } else {
      artAreaX = innerFrameX + matWidthPx;
      artAreaY = innerFrameY + matWidthPx;
      artAreaW = Math.max(10, innerFrameW - matWidthPx * 2);
      artAreaH = Math.max(10, innerFrameH - matWidthPx * 2);
    }

    // Bevel Cut Edge on Mat (standard 45° white core museum mat board)
    ctx.strokeStyle = matPalette.core;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(artAreaX, artAreaY, artAreaW, artAreaH);

    // Inner shadow of mat window cut
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(artAreaX, artAreaY, artAreaW, 3);
    ctx.fillRect(artAreaX, artAreaY, 3, artAreaH);
  }

  // 4. Render Artwork Image
  ctx.save();
  // Clip strictly to art area
  ctx.beginPath();
  ctx.rect(artAreaX, artAreaY, artAreaW, artAreaH);
  ctx.clip();

  // Cover / fit image in art area
  if (artImage.complete && artImage.naturalWidth > 0) {
    const artAspect = artImage.naturalWidth / artImage.naturalHeight;
    const boxAspect = artAreaW / artAreaH;

    let drawW = artAreaW;
    let drawH = artAreaH;
    let drawX = artAreaX;
    let drawY = artAreaY;

    if (artAspect > boxAspect) {
      drawW = artAreaH * artAspect;
      drawX = artAreaX + (artAreaW - drawW) / 2;
    } else {
      drawH = artAreaW / artAspect;
      drawY = artAreaY + (artAreaH - drawH) / 2;
    }

    ctx.drawImage(artImage, drawX, drawY, drawW, drawH);
  } else {
    // Elegant fallback canvas
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(artAreaX, artAreaY, artAreaW, artAreaH);
  }

  // 5. Realistic Museum Glass Reflection / Glare
  if (frameConfig.glassReflection) {
    const glassGrad = ctx.createLinearGradient(
      artAreaX,
      artAreaY,
      artAreaX + artAreaW,
      artAreaY + artAreaH
    );
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    glassGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.04)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(artAreaX, artAreaY, artAreaW, artAreaH);
  }

  ctx.restore();

  // 6. Optional Artist Watermark
  if (watermarkConfig && watermarkConfig.enabled && watermarkConfig.text) {
    drawWatermark(ctx, artAreaX, artAreaY, artAreaW, artAreaH, watermarkConfig);
  }
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  wm: WatermarkConfig
) {
  ctx.save();
  const fontSize = Math.max(12, Math.round(aw * 0.038));
  ctx.font = `italic 500 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;

  const colorMap = {
    white: 'rgba(255, 255, 255,',
    black: 'rgba(20, 20, 20,',
    gold: 'rgba(212, 175, 55,',
  };
  const baseColor = colorMap[wm.color] || colorMap.white;
  ctx.fillStyle = `${baseColor} ${wm.opacity / 100})`;

  const padding = fontSize * 1.2;
  let tx = ax + aw - padding;
  let ty = ay + ah - padding;
  ctx.textAlign = 'right';

  if (wm.position === 'bottom-left') {
    tx = ax + padding;
    ctx.textAlign = 'left';
  } else if (wm.position === 'top-right') {
    ty = ay + padding + fontSize;
    ctx.textAlign = 'right';
  } else if (wm.position === 'top-left') {
    tx = ax + padding;
    ty = ay + padding + fontSize;
    ctx.textAlign = 'left';
  }

  ctx.fillText(wm.text, tx, ty);
  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function adjustColor(hex: string, amount: number): string {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
