import { SampleArtwork } from '../types';

// High quality SVG data URLs that render immediately and cleanly in canvas & DOM
const cubistPortraitSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C24134" />
      <stop offset="50%" stop-color="#D9534F" />
      <stop offset="100%" stop-color="#F28D77" />
    </linearGradient>
    <linearGradient id="warmOchre" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E59837" />
      <stop offset="100%" stop-color="#CA781E" />
    </linearGradient>
    <linearGradient id="tealShade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D5D68" />
      <stop offset="100%" stop-color="#1A3B43" />
    </linearGradient>
  </defs>

  <!-- Background split -->
  <rect width="800" height="1000" fill="url(#bgGrad)" />
  <polygon points="0,0 450,0 350,1000 0,1000" fill="#B3392E" opacity="0.6" />
  <polygon points="400,200 800,0 800,700 350,550" fill="#E87A65" opacity="0.4" />

  <!-- Cubist Face Structures -->
  <g transform="translate(100, 120)">
    <!-- Main head silhouette -->
    <path d="M 150 150 L 450 120 L 480 650 L 220 720 Z" fill="#E3A894" stroke="#1A1A1A" stroke-width="7" stroke-linejoin="round" />
    
    <!-- Left face block (teal) -->
    <polygon points="150,150 280,140 290,680 180,630" fill="url(#tealShade)" stroke="#1A1A1A" stroke-width="7" />
    
    <!-- Central bridge (charcoal) -->
    <polygon points="280,140 330,135 340,550 290,560" fill="#2B2B2A" stroke="#1A1A1A" stroke-width="7" />
    
    <!-- Ochre lower cheek -->
    <polygon points="120,450 280,430 270,720 100,680" fill="url(#warmOchre)" stroke="#1A1A1A" stroke-width="7" />

    <!-- Left eye (Cubist wide almond) -->
    <ellipse cx="210" cy="270" rx="45" ry="32" fill="#EAEAEA" stroke="#1A1A1A" stroke-width="6" />
    <circle cx="210" cy="270" r="18" fill="#1A1A1A" />
    <path d="M 160 230 Q 210 200 260 230" fill="none" stroke="#1A1A1A" stroke-width="8" stroke-linecap="round" />
    
    <!-- Right eye (Angular geometric) -->
    <polygon points="380,290 470,270 450,330 370,330" fill="#F4E9D8" stroke="#1A1A1A" stroke-width="6" />
    <circle cx="415" cy="305" r="14" fill="#6B2D26" />
    <circle cx="415" cy="305" r="6" fill="#111" />
    <!-- Eyelash lines -->
    <line x1="420" y1="260" x2="435" y2="235" stroke="#1A1A1A" stroke-width="5" stroke-linecap="round" />
    <line x1="450" y1="265" x2="475" y2="245" stroke="#1A1A1A" stroke-width="5" stroke-linecap="round" />
    <line x1="395" y1="270" x2="385" y2="245" stroke="#1A1A1A" stroke-width="5" stroke-linecap="round" />

    <!-- Sharp nose -->
    <path d="M 320 220 L 350 440 L 290 460" fill="none" stroke="#1A1A1A" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Prominent lips (Cubist red split) -->
    <g transform="translate(180, 520)">
      <path d="M 30 50 Q 80 10 130 50 Q 80 80 30 50 Z" fill="#B71C1C" stroke="#1A1A1A" stroke-width="6" />
      <path d="M 30 50 Q 80 30 130 50" fill="none" stroke="#1A1A1A" stroke-width="5" />
    </g>
    <g transform="translate(260, 560)">
      <path d="M 30 45 Q 75 15 120 45 Q 75 75 30 45 Z" fill="#880E4F" stroke="#1A1A1A" stroke-width="6" />
    </g>

    <!-- Large hoop earring -->
    <path d="M 140 380 Q 90 450 120 540 Q 150 580 180 550" fill="none" stroke="#D4AF37" stroke-width="9" stroke-linecap="round" />

    <!-- Expressive Hair Flow -->
    <path d="M 280 80 Q 320 -20 380 40 Q 450 -10 490 80" fill="none" stroke="#1A1A1A" stroke-width="7" stroke-linecap="round" />
    <path d="M 340 30 Q 370 -40 400 20" fill="none" stroke="#1A1A1A" stroke-width="5" stroke-linecap="round" />
  </g>

  <!-- Artist Signature in bottom right -->
  <text x="640" y="930" font-family="'Playfair Display', Georgia, serif" font-size="28" font-style="italic" fill="#1A1A1A" opacity="0.8">Enngee '26</text>
</svg>
`)}`;

const botanicalMinimalSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="warmBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FBF9F5" />
      <stop offset="100%" stop-color="#F3EFE6" />
    </linearGradient>
  </defs>

  <rect width="800" height="1000" fill="url(#warmBg)" />

  <!-- Organic earthy shape blocks -->
  <path d="M 150 180 C 250 100 480 120 550 240 C 620 360 520 500 380 520 C 240 540 100 420 150 180 Z" fill="#D97A53" opacity="0.85" />
  <circle cx="560" cy="620" r="160" fill="#E8B878" opacity="0.8" />
  <ellipse cx="260" cy="740" rx="140" ry="110" fill="#5F6D59" opacity="0.75" />

  <!-- Elegant minimalist ink botanical branch -->
  <g stroke="#1A1A1A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(180, 140)">
    <!-- Main stem -->
    <path d="M 220 700 Q 210 500 250 350 Q 280 220 230 60" stroke-width="7" />
    
    <!-- Leaf 1 right -->
    <path d="M 235 150 Q 340 120 390 170 Q 320 220 240 190 Z" fill="#1A1A1A" opacity="0.9" />
    <!-- Leaf 2 left -->
    <path d="M 255 250 Q 140 210 100 280 Q 180 320 255 280 Z" fill="#1A1A1A" opacity="0.9" />
    <!-- Leaf 3 right -->
    <path d="M 260 380 Q 390 340 430 420 Q 350 460 250 420 Z" fill="#1A1A1A" opacity="0.9" />
    <!-- Leaf 4 left -->
    <path d="M 240 490 Q 110 460 70 540 Q 160 580 230 530 Z" fill="#1A1A1A" opacity="0.9" />
    <!-- Leaf 5 right -->
    <path d="M 220 600 Q 340 580 370 650 Q 280 680 210 630 Z" fill="#1A1A1A" opacity="0.9" />
  </g>

  <text x="120" y="920" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" letter-spacing="4" fill="#555" text-transform="uppercase">MONSTERA NO. IV · BOTANICAL ETCHING</text>
  <text x="660" y="920" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" fill="#777">1/50</text>
</svg>
`)}`;

const modernAbstractLinesSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <rect width="800" height="1000" fill="#FAF7F2" />

  <!-- Bold Mustard Yellow Arc -->
  <path d="M 120 400 A 240 240 0 0 1 540 260 L 520 480 Z" fill="#F4B41A" />
  
  <!-- Rose Pink Cloud -->
  <circle cx="580" cy="500" r="170" fill="#E86A8D" opacity="0.9" />
  
  <!-- Sage Green Column -->
  <rect x="180" y="480" width="160" height="320" rx="80" fill="#889E81" />

  <!-- Continuous Single-Line Female Silhouette -->
  <g stroke="#141414" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(100, 100)">
    <!-- Profile & Hair -->
    <path d="M 280 180 C 230 180 210 240 210 320 C 210 400 240 460 270 480 C 280 500 280 540 270 590 C 250 670 190 730 250 760 C 310 790 350 710 370 640" stroke-width="7" />
    
    <!-- Forehead to Nose & Lips -->
    <path d="M 280 180 C 340 180 390 220 395 280 L 440 350 L 395 380 C 420 405 405 435 380 440 C 360 490 330 520 280 530" />
    
    <!-- Closed eye and brow -->
    <path d="M 330 280 Q 360 300 380 285" stroke-width="5" />
    <path d="M 320 255 Q 360 250 385 270" stroke-width="5" />
  </g>

  <!-- Editorial typography -->
  <text x="100" y="930" font-family="'Playfair Display', serif" font-size="28" font-style="italic" fill="#141414">Solitude in Sun</text>
  <text x="640" y="930" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" letter-spacing="2" fill="#888">STUDIO '26</text>
</svg>
`)}`;

export const SAMPLE_ARTWORKS: SampleArtwork[] = [
  {
    id: 'cubist-portrait',
    title: 'Ìsì Nébé (Cubist Expression)',
    artist: 'artbyenngee',
    category: 'Cubism & Contemporary',
    dataUrl: cubistPortraitSvg,
  },
  {
    id: 'abstract-lines',
    title: 'Solitude in Sun & Clay',
    artist: 'Mimo Studio',
    category: 'Minimalist Line Art',
    dataUrl: modernAbstractLinesSvg,
  },
  {
    id: 'botanical-monstera',
    title: 'Monstera No. IV Etching',
    artist: 'Atelier Botanique',
    category: 'Botanical & Organic',
    dataUrl: botanicalMinimalSvg,
  },
];
