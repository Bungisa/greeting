import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Layers,
  Leaf,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Tag,
  Thermometer,
  Trash2,
  Wind,
} from 'lucide-react';

export interface Photosynthesis3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';

type LeafPartId =
  | 'overview'
  | 'cuticle'
  | 'palisade'
  | 'spongy'
  | 'xylem'
  | 'phloem'
  | 'stomata';

type CameraPresetId = 'iso360' | 'front' | 'underside' | 'vascular' | 'top';

interface StepSpec {
  stepNumber: number;
  id: string;
  title: string;
  shortTitle: string;
  equationBadge: string;
  focusPart: LeafPartId;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  recommendedExplode: number;
  oDescription: string;
  aDescription: string;
  keyStructures: string[];
}

interface PlottedRatePoint {
  id: number;
  light: number;
  rate: number;
  co2: number;
}

interface BioChallenge {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  check: (light: number, co2: number, temp: number, stomataOpen: boolean, rate: number) => boolean;
}

interface Label3DSpec {
  id: string;
  partId: LeafPartId;
  text: string;
  subText: string;
  basePos: [number, number, number];
  explodeFactor: number;
  offsetX: number;
  offsetY: number;
  accentHex: string;
}

interface ProjectedLabel {
  id: string;
  partId: LeafPartId;
  text: string;
  subText: string;
  ax: number;
  ay: number;
  lx: number;
  ly: number;
  accentHex: string;
}

const PHOTOSYNTHESIS_STEPS: StepSpec[] = [
  {
    stepNumber: 1,
    id: 'step_light',
    title: 'Step 1: Light Absorption in Palisade Chloroplasts',
    shortTitle: '1. Light Capture',
    equationBadge: 'Sunlight (hν) → Chlorophyll a & b Excitation',
    focusPart: 'palisade',
    cameraPos: [4.2, 3.3, 6.2],
    cameraTarget: [0.2, 0.75, 0],
    recommendedExplode: 0.22,
    oDescription:
      'Sunlight passes straight through the transparent waxy cuticle and upper epidermis into tall cylindrical palisade cells packed with green chloroplasts.',
    aDescription:
      'Photons (400–700 nm) penetrate the translucent cuticle and upper epidermis to excite chlorophyll a & b molecules inside the thylakoid grana membranes of palisade chloroplasts.',
    keyStructures: ['Waxy Cuticle', 'Upper Epidermis', 'Palisade Chloroplasts', 'Thylakoid Grana'],
  },
  {
    stepNumber: 2,
    id: 'step_water',
    title: 'Step 2: Water Transport (Xylem) & Photolysis',
    shortTitle: '2. Xylem & Photolysis',
    equationBadge: '2H₂O + Light → 4H⁺ + 4e⁻ + O₂↑',
    focusPart: 'xylem',
    cameraPos: [-5.4, 1.4, 5.8],
    cameraTarget: [-1.15, 0.1, 0],
    recommendedExplode: 0.18,
    oDescription:
      'Water (H₂O) absorbed by roots travels up the hollow blue Xylem vessels in the leaf vein and enters the chloroplasts, where light splits water into hydrogen and oxygen.',
    aDescription:
      'Transpiration pull draws H₂O through spiral-lignified xylem vessels into mesophyll chloroplasts, where Photosystem II catalyses photolysis (2H₂O → 4H⁺ + 4e⁻ + O₂).',
    keyStructures: ['Xylem Lignified Vessels', 'Bundle Sheath', 'Water (H₂O) Stream', 'Photolysis Complex'],
  },
  {
    stepNumber: 3,
    id: 'step_co2',
    title: 'Step 3: Stomatal Opening & CO₂ Gas Diffusion',
    shortTitle: '3. Stomata & CO₂ In',
    equationBadge: 'Turgid Guard Cells → CO₂ Diffusion into Air Spaces',
    focusPart: 'stomata',
    cameraPos: [2.4, -3.8, 6.0],
    cameraTarget: [0.4, -1.35, 0.2],
    recommendedExplode: 0.15,
    oDescription:
      'On the underside of the leaf, kidney-shaped guard cells swell with water to open the stomatal pores, allowing carbon dioxide (CO₂) to diffuse up through spongy air spaces.',
    aDescription:
      'K⁺ influx lowers water potential in guard cells; osmotic turgor bows their thickened inner walls apart, widening the stoma for CO₂ diffusion across spongy mesophyll spaces.',
    keyStructures: ['Kidney Guard Cells', 'Stomatal Pore', 'Lower Epidermis', 'Spongy Air Spaces'],
  },
  {
    stepNumber: 4,
    id: 'step_calvin',
    title: 'Step 4: Glucose Synthesis (Calvin Cycle in Stroma)',
    shortTitle: '4. Glucose Synthesis',
    equationBadge: '6CO₂ + 24H⁺ (ATP + NADPH) → C₆H₁₂O₆',
    focusPart: 'spongy',
    cameraPos: [5.6, 0.9, 5.6],
    cameraTarget: [0.6, 0.35, 0],
    recommendedExplode: 0.28,
    oDescription:
      'Inside the chloroplast stroma, hydrogen from water and carbon dioxide from the air combine using light energy to manufacture energy-rich glucose sugar (C₆H₁₂O₆).',
    aDescription:
      'In the chloroplast stroma, Rubisco fixes CO₂ onto RuBP (5C) to form GP (3C), which is reduced by ATP and NADPH into triose phosphate (TP) and hexose glucose (C₆H₁₂O₆).',
    keyStructures: ['Chloroplast Stroma', 'Rubisco Enzyme', 'ATP & NADPH', 'Glucose (C₆H₁₂O₆)'],
  },
  {
    stepNumber: 5,
    id: 'step_phloem',
    title: 'Step 5: Phloem Sugar Translocation & O₂ Release',
    shortTitle: '5. Phloem & O₂ Out',
    equationBadge: 'C₆H₁₂O₆ (Sucrose) → Phloem | 6O₂↑ → Atmosphere',
    focusPart: 'phloem',
    cameraPos: [-4.6, -1.2, 6.3],
    cameraTarget: [-0.8, -0.25, 0],
    recommendedExplode: 0.12,
    oDescription:
      'Oxygen gas (O₂) escapes out through the stomata into the air, while newly made glucose is carried down the golden Phloem sieve tubes to feed the rest of the plant.',
    aDescription:
      'O₂ diffuses out via intercellular air spaces and stomata, while glucose is converted to sucrose and actively loaded via companion cells into phloem sieve tubes for mass-flow translocation.',
    keyStructures: ['Phloem Sieve Tubes', 'Sieve Plates', 'Companion Cells', 'O₂ Gas Efflux'],
  },
];

interface PhotosynthesisLessonChapter {
  id: number;
  stepIdx: number;
  title: string;
  startSec: number;
  endSec: number;
  lightPct: number;
  co2Pct: number;
  tempC: number;
  stomataOpen: boolean;
  explodeLayers: number;
  oCaption: string;
  aCaption: string;
}

const LESSON_DURATION_SEC = 65;

const PHOTO_LESSON_CHAPTERS: PhotosynthesisLessonChapter[] = [
  {
    id: 1,
    stepIdx: 0,
    title: 'Light Capture',
    startSec: 0,
    endSec: 13,
    lightPct: 90,
    co2Pct: 80,
    tempC: 29,
    stomataOpen: true,
    explodeLayers: 0.22,
    oCaption:
      'Sunlight photons pass straight through the transparent waxy cuticle and upper epidermis into tall palisade cells packed with glowing green chloroplasts.',
    aCaption:
      'Photons (400–700 nm) penetrate the waxy cuticle and upper epidermis to excite chlorophyll a & b inside thylakoid grana membranes of palisade chloroplasts.',
  },
  {
    id: 2,
    stepIdx: 1,
    title: 'Xylem & Photolysis',
    startSec: 13,
    endSec: 26,
    lightPct: 90,
    co2Pct: 80,
    tempC: 29,
    stomataOpen: true,
    explodeLayers: 0.18,
    oCaption:
      'Blue spiral-lignified xylem vessels deliver water (H₂O) from the roots directly into the mesophyll, where light energy splits water into hydrogen and oxygen.',
    aCaption:
      'Transpiration pull draws H₂O along lignified xylem vessels to Photosystem II, where photolysis splits water (2H₂O → 4H⁺ + 4e⁻ + O₂↑) and supplies electrons.',
  },
  {
    id: 3,
    stepIdx: 2,
    title: 'Stomata & CO₂ In',
    startSec: 26,
    endSec: 39,
    lightPct: 85,
    co2Pct: 90,
    tempC: 29,
    stomataOpen: true,
    explodeLayers: 0.15,
    oCaption:
      'Look underneath the 3D leaf: turgid kidney-shaped guard cells bow apart to open the stomatal pores, letting violet CO₂ molecules diffuse up through spongy air spaces.',
    aCaption:
      'Active K⁺ influx lowers guard-cell water potential; osmotic turgor bows their thickened inner walls open so atmospheric CO₂ diffuses through intercellular air spaces.',
  },
  {
    id: 4,
    stepIdx: 3,
    title: 'Glucose Synthesis',
    startSec: 39,
    endSec: 52,
    lightPct: 95,
    co2Pct: 90,
    tempC: 30,
    stomataOpen: true,
    explodeLayers: 0.28,
    oCaption:
      'Inside the chloroplast stroma, hydrogen from water and carbon dioxide from air combine using light energy to synthesize glucose sugar (C₆H₁₂O₆).',
    aCaption:
      'In the stroma Calvin Cycle, Rubisco fixes CO₂ onto RuBP (5C) to form GP (3C), which ATP and NADPH reduce to triose phosphate (TP) and hexose glucose.',
  },
  {
    id: 5,
    stepIdx: 4,
    title: 'Phloem & O₂ Output',
    startSec: 52,
    endSec: 65,
    lightPct: 90,
    co2Pct: 85,
    tempC: 30,
    stomataOpen: true,
    explodeLayers: 0.12,
    oCaption:
      'Oxygen bubbles (O₂) escape out into the air while golden glucose crystals load into the phloem sieve tubes to feed the roots, stem, and fruits.',
    aCaption:
      'O₂ exits via stomata while companion cells actively load sucrose into phloem sieve tubes for mass-flow translocation from leaf source to plant sinks.',
  },
];

function getPhotoLessonChapter(sec: number): PhotosynthesisLessonChapter {
  for (let i = PHOTO_LESSON_CHAPTERS.length - 1; i >= 0; i--) {
    if (sec >= PHOTO_LESSON_CHAPTERS[i].startSec) return PHOTO_LESSON_CHAPTERS[i];
  }
  return PHOTO_LESSON_CHAPTERS[0];
}

function formatLessonTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

const BIO_CHALLENGES: BioChallenge[] = [
  {
    id: 'peak_yield',
    title: 'Peak Photosynthesis',
    prompt: 'Adjust Light, CO₂, Temperature and Stomata to achieve at least 55 O₂ bubbles/min!',
    hint: 'Keep Stomata OPEN, set Light ≥ 80%, CO₂ ≥ 75%, and Temperature near 28–33°C.',
    check: (_l, _c, _t, open, rate) => open && rate >= 55,
  },
  {
    id: 'enzyme_denature',
    title: 'Enzyme Denaturation',
    prompt:
      'Keep Light ≥ 75% and Stomata OPEN, then overheat the leaf so enzyme denaturation drops O₂ output below 15 bubbles/min.',
    hint: 'Raise Temperature above 43°C and watch the chloroplast rate collapse.',
    check: (l, _c, t, open, rate) => open && l >= 75 && t >= 42 && rate < 15,
  },
  {
    id: 'stomata_throttle',
    title: 'Stomatal Gas Control',
    prompt:
      'Under bright light (≥ 70%) and optimal temperature (25–35°C), close the Stoma on the lower leaf to see CO₂ starvation!',
    hint: 'Click directly on any 3D Stoma guard-cell pair under the leaf (or the Stomata button at top).',
    check: (l, _c, t, open) => !open && l >= 70 && t >= 25 && t <= 35,
  },
];

const LABEL_3D_SPECS: Label3DSpec[] = [
  {
    id: 'cuticle',
    partId: 'cuticle',
    text: '1. Waxy Cuticle & Upper Epidermis',
    subText: 'Transparent waterproof barrier',
    basePos: [0.3, 1.72, 0.85],
    explodeFactor: 1.35,
    offsetX: -120,
    offsetY: -36,
    accentHex: '#34d399',
  },
  {
    id: 'palisade',
    partId: 'palisade',
    text: '2. Palisade Mesophyll Cells',
    subText: 'Packed with green chloroplasts',
    basePos: [1.55, 0.78, 1.15],
    explodeFactor: 0.55,
    offsetX: 125,
    offsetY: -22,
    accentHex: '#10b981',
  },
  {
    id: 'xylem',
    partId: 'xylem',
    text: '3. Xylem Vessels (H₂O In)',
    subText: 'Blue spiral-lignified water tubes',
    basePos: [-1.55, 0.35, 1.1],
    explodeFactor: 0.0,
    offsetX: -135,
    offsetY: -12,
    accentHex: '#38bdf8',
  },
  {
    id: 'phloem',
    partId: 'phloem',
    text: '4. Phloem Sieve Tubes (Sugar Out)',
    subText: 'Golden sucrose translocation tubes',
    basePos: [-1.55, -0.35, 1.1],
    explodeFactor: 0.0,
    offsetX: -135,
    offsetY: 36,
    accentHex: '#f59e0b',
  },
  {
    id: 'spongy',
    partId: 'spongy',
    text: '5. Spongy Mesophyll & Air Spaces',
    subText: 'CO₂ and O₂ gas diffusion chambers',
    basePos: [1.65, -0.35, 1.1],
    explodeFactor: -0.35,
    offsetX: 128,
    offsetY: 16,
    accentHex: '#a78bfa',
  },
  {
    id: 'stomata',
    partId: 'stomata',
    text: '6. Stoma & Guard Cells (Underneath)',
    subText: 'Opens for CO₂ in & O₂ / H₂O out',
    basePos: [0.45, -1.55, 0.9],
    explodeFactor: -1.25,
    offsetX: 110,
    offsetY: 44,
    accentHex: '#22d3ee',
  },
];

// Reusable module-scope scratch math vectors (zero per-frame GC allocations)
const _vProj = new THREE.Vector3();
const _vCamTarget = new THREE.Vector3();
const _vCamPos = new THREE.Vector3();
const _matDummy = new THREE.Matrix4();
const _quatDummy = new THREE.Quaternion();
const _scaleDummy = new THREE.Vector3();
const _posDummy = new THREE.Vector3();
const _eulerDummy = new THREE.Euler();
const _colorDummy = new THREE.Color();
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

function computePhotosynthesisMetrics(
  lightPct: number,
  co2Pct: number,
  tempC: number,
  stomataOpen: boolean
): {
  bubblesPerMin: number;
  normalizedRate: number;
  glucoseMgHr: number;
  limitingFactor: string;
  denatured: boolean;
} {
  if (lightPct <= 1) {
    return {
      bubblesPerMin: 0,
      normalizedRate: 0,
      glucoseMgHr: 0,
      limitingFactor: 'No Sunlight (Darkness)',
      denatured: false,
    };
  }

  const fLight = lightPct / (lightPct + 24);
  const effectiveCo2 = stomataOpen ? co2Pct : co2Pct * 0.14;
  const fCo2 = effectiveCo2 <= 0.5 ? 0 : effectiveCo2 / (effectiveCo2 + 22);

  let fTemp = 0;
  if (tempC <= 30) {
    fTemp = Math.max(0.05, Math.exp(-Math.pow((30 - tempC) / 17.5, 2)));
  } else if (tempC <= 46) {
    fTemp = Math.max(0, 1 - Math.pow((tempC - 30) / 14.5, 2.5));
  } else {
    fTemp = 0;
  }

  const rawRate = Math.min(fLight, fCo2) * fTemp * 1.48;
  const normalizedRate = Math.max(0, Math.min(1, rawRate));
  const bubblesPerMin = Math.round(normalizedRate * 64);
  const glucoseMgHr = Number((normalizedRate * 18.5).toFixed(1));
  const denatured = tempC >= 40;

  let limitingFactor = 'Optimum Conditions';
  if (!stomataOpen) {
    limitingFactor = 'Stomata Closed (Low CO₂)';
  } else if (denatured) {
    limitingFactor = 'Heat Denaturation (>40°C)';
  } else if (tempC < 16) {
    limitingFactor = 'Low Temperature (Slow Enzymes)';
  } else if (fLight < fCo2 - 0.05 && lightPct < 75) {
    limitingFactor = 'Light Intensity';
  } else if (fCo2 < fLight - 0.05 && co2Pct < 75) {
    limitingFactor = 'CO₂ Concentration';
  } else if (normalizedRate < 0.78) {
    limitingFactor = fLight <= fCo2 ? 'Light Intensity' : 'CO₂ Concentration';
  }

  return { bubblesPerMin, normalizedRate, glucoseMgHr, limitingFactor, denatured };
}

function createBotanicalLeafMaps(maxAniso: number): {
  albedoMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const actx = albedoCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');

  if (actx && bctx) {
    // Rich natural chlorophyll leaf gradient (slightly brighter near midrib vein on left)
    const grad = actx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#3e8e41');
    grad.addColorStop(0.28, '#2d7a36');
    grad.addColorStop(0.65, '#256b2e');
    grad.addColorStop(1, '#1e5a26');
    actx.fillStyle = grad;
    actx.fillRect(0, 0, size, size);

    bctx.fillStyle = '#787878';
    bctx.fillRect(0, 0, size, size);

    // Subtle organic mottled botanical pigmentation
    for (let i = 0; i < 240; i++) {
      const rx = ((i * 137.5) % size);
      const ry = ((i * 223.1) % size);
      const rr = 12 + (i % 26);
      const mg = actx.createRadialGradient(rx, ry, 1, rx, ry, rr);
      mg.addColorStop(0, i % 2 === 0 ? 'rgba(134, 239, 172, 0.09)' : 'rgba(20, 83, 45, 0.11)');
      mg.addColorStop(1, 'rgba(0,0,0,0)');
      actx.fillStyle = mg;
      actx.beginPath();
      actx.arc(rx, ry, rr, 0, Math.PI * 2);
      actx.fill();
    }

    // Microscopic rounded pavement epidermal mosaic
    const cellStep = 28;
    for (let y = 0; y < size + cellStep; y += cellStep * 0.86) {
      const odd = Math.round(y / (cellStep * 0.86)) % 2 === 1;
      for (let x = 0; x < size + cellStep; x += cellStep) {
        const cx = x + (odd ? cellStep * 0.5 : 0);
        // Albedo subtle cell wall highlight
        actx.strokeStyle = 'rgba(187, 247, 208, 0.18)';
        actx.lineWidth = 1.2;
        actx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (Math.PI / 3) * a + Math.PI / 6;
          const px = cx + Math.cos(ang) * (cellStep * 0.48);
          const py = y + Math.sin(ang) * (cellStep * 0.48);
          if (a === 0) actx.moveTo(px, py);
          else actx.lineTo(px, py);
        }
        actx.closePath();
        actx.stroke();

        // Bump map pillowy dome center
        const bg = bctx.createRadialGradient(cx, y, 1, cx, y, cellStep * 0.5);
        bg.addColorStop(0, 'rgba(215, 215, 215, 0.5)');
        bg.addColorStop(0.75, 'rgba(145, 145, 145, 0.2)');
        bg.addColorStop(1, 'rgba(60, 60, 60, 0.55)');
        bctx.fillStyle = bg;
        bctx.beginPath();
        bctx.arc(cx, y, cellStep * 0.5, 0, Math.PI * 2);
        bctx.fill();
      }
    }

    // Natural branching lateral leaf veins radiating from midrib (~21% from left)
    const midX = size * 0.21;
    actx.strokeStyle = 'rgba(190, 242, 100, 0.52)';
    actx.lineWidth = 7;
    actx.beginPath();
    actx.moveTo(midX, 0);
    actx.lineTo(midX, size);
    actx.stroke();

    bctx.strokeStyle = '#e5e5e5';
    bctx.lineWidth = 10;
    bctx.beginPath();
    bctx.moveTo(midX, 0);
    bctx.lineTo(midX, size);
    bctx.stroke();

    for (let v = -2; v <= 9; v++) {
      const startY = v * 64;
      // Right-branching secondary veins
      actx.strokeStyle = 'rgba(163, 230, 53, 0.34)';
      actx.lineWidth = 2.6;
      actx.beginPath();
      actx.moveTo(midX, startY);
      actx.quadraticCurveTo(midX + 140, startY - 22, size, startY - 95);
      actx.stroke();

      bctx.strokeStyle = 'rgba(220, 220, 220, 0.75)';
      bctx.lineWidth = 3.2;
      bctx.beginPath();
      bctx.moveTo(midX, startY);
      bctx.quadraticCurveTo(midX + 140, startY - 22, size, startY - 95);
      bctx.stroke();

      // Fine tertiary reticulate veinlets
      actx.strokeStyle = 'rgba(163, 230, 53, 0.16)';
      actx.lineWidth = 1.1;
      for (let t = 1; t <= 4; t++) {
        const bx = midX + t * 82;
        const by = startY - t * 20;
        actx.beginPath();
        actx.moveTo(bx, by);
        actx.lineTo(bx + 36, by + 34);
        actx.stroke();
      }

      // Left-branching veins
      actx.strokeStyle = 'rgba(163, 230, 53, 0.3)';
      actx.lineWidth = 2.2;
      actx.beginPath();
      actx.moveTo(midX, startY);
      actx.quadraticCurveTo(midX - 55, startY - 12, 0, startY - 48);
      actx.stroke();
    }
  }

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.ClampToEdgeWrapping;
  albedoMap.wrapT = THREE.RepeatWrapping;
  albedoMap.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.ClampToEdgeWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAniso;

  return { albedoMap, bumpMap };
}

function createCellularBumpMap(maxAniso: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);
    // Fine fibrous cellulose microfibrils & organic pores
    for (let i = 0; i < 420; i++) {
      const x = (i * 53.7) % size;
      const y = (i * 97.3) % size;
      const r = 3 + (i % 10);
      const g = ctx.createRadialGradient(x, y, 0.5, x, y, r);
      const bright = i % 3 === 0 ? 195 : 100;
      g.addColorStop(0, `rgba(${bright},${bright},${bright},0.35)`);
      g.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(210,210,210,0.16)';
    ctx.lineWidth = 1;
    for (let y = 0; y < size; y += 9) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.33, y + 4, size * 0.66, y - 4, size, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAniso;
  return tex;
}

function createChloroplastMaps(maxAniso: number): {
  albedoMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 256;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const actx = albedoCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');

  if (actx && bctx) {
    // Rich translucent stroma base
    const sg = actx.createLinearGradient(0, 0, size, size);
    sg.addColorStop(0, '#166534');
    sg.addColorStop(0.5, '#15803d');
    sg.addColorStop(1, '#14532d');
    actx.fillStyle = sg;
    actx.fillRect(0, 0, size, size);

    bctx.fillStyle = '#707070';
    bctx.fillRect(0, 0, size, size);

    // Stacked Thylakoid Grana bands visible through chloroplast outer envelope
    for (let g = 0; g < 18; g++) {
      const gx = 24 + ((g * 67) % (size - 48));
      const gy = 28 + ((g * 43) % (size - 56));
      for (let d = 0; d < 4; d++) {
        actx.fillStyle = d % 2 === 0 ? '#4ade80' : '#22c55e';
        actx.beginPath();
        actx.ellipse(gx, gy + d * 6, 15, 4.2, 0, 0, Math.PI * 2);
        actx.fill();

        bctx.fillStyle = '#dcdcdc';
        bctx.beginPath();
        bctx.ellipse(gx, gy + d * 6, 15, 4.2, 0, 0, Math.PI * 2);
        bctx.fill();
      }
    }
  }

  const albedoMap = new THREE.CanvasTexture(albedoCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.anisotropy = maxAniso;

  return { albedoMap, bumpMap };
}

function createSunbeamAlphaMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    grad.addColorStop(0.75, 'rgba(255,255,255,0.65)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(8, 28, 21, 0.5)');
    grad.addColorStop(0.55, 'rgba(8, 28, 21, 0.2)');
    grad.addColorStop(1, 'rgba(8, 28, 21, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createEpidermalPillowGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const w = 0.255;
  const h = 0.295;
  const r = 0.08;
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 8,
  });
  geo.rotateX(Math.PI / 2);
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

function createPalisadeCellGeometry(): THREE.BufferGeometry {
  // Organic rounded-cap columnar plant cell profile
  const pts: THREE.Vector2[] = [];
  const halfH = 0.47;
  const radius = 0.255;
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = (t - 0.5) * Math.PI; // -PI/2 to +PI/2
    const y = Math.sin(angle) * halfH;
    // Super-ellipse / capsule-like rounded cap with gentle organic taper
    const capProfile = Math.pow(Math.max(0.0001, Math.cos(angle)), 0.36);
    const organicWaist = 1 + 0.05 * Math.sin(t * Math.PI * 2);
    const r = radius * capProfile * organicWaist;
    pts.push(new THREE.Vector2(Math.max(0.002, r), y));
  }
  const geo = new THREE.LatheGeometry(pts, 20);
  geo.computeVertexNormals();
  return geo;
}

function createSpongyParenchymaGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 22, 16);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Smooth organic botanical lobes (true spongy parenchyma shape, never spiky!)
    const lobe =
      1 +
      0.16 * Math.sin(x * 3.1 + y * 1.9) * Math.cos(z * 2.7) +
      0.1 * Math.cos(y * 3.6 - z * 2.2) +
      0.06 * Math.sin(x * 4.5 + z * 3.4);
    pos.setXYZ(i, x * lobe, y * lobe * 0.88, z * lobe);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function createHelicalLigninGeometry(radius: number, length: number, turns: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  const segs = turns * 20;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const ang = t * Math.PI * 2 * turns;
    const z = -length * 0.5 + t * length;
    pts.push(new THREE.Vector3(Math.cos(ang) * radius, Math.sin(ang) * radius, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, segs, 0.017, 7, false);
}

function createKidneyGuardCellGeometry(): THREE.BufferGeometry {
  // Curved bean/kidney guard cell lying in XZ plane, bowing outward toward -X
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 0, -0.25),
    new THREE.Vector3(-0.14, -0.015, -0.14),
    new THREE.Vector3(-0.2, -0.025, 0),
    new THREE.Vector3(-0.14, -0.015, 0.14),
    new THREE.Vector3(0.02, 0, 0.25),
  ]);
  const geo = new THREE.TubeGeometry(curve, 24, 0.088, 12, false);
  // Taper tips organically so the two guard cells meet seamlessly like real plant stomata
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const zNorm = Math.min(1, Math.abs(z) / 0.26);
    const tipTaper = 0.55 + 0.45 * Math.cos(zNorm * Math.PI * 0.48);
    const center = curve.getPointAt(Math.max(0, Math.min(1, (z + 0.25) / 0.5)));
    pos.setXYZ(
      i,
      center.x + (x - center.x) * tipTaper,
      center.y + (y - center.y) * tipTaper * 0.82,
      z
    );
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * Neat, high-contrast, detailed scientific SVG illustration for each of the 5 steps
 * so students see both the 3D 360° spatial model AND a textbook-grade detailed schematic!
 */
const StepDetailedIllustration: React.FC<{
  stepNumber: number;
  darkMode: boolean;
  stomataOpen: boolean;
  lightPct: number;
  co2Pct: number;
  rate: number;
}> = ({ stepNumber, darkMode, stomataOpen, lightPct, co2Pct, rate }) => {
  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const strokeMain = darkMode ? '#e2e8f0' : '#1e293b';
  const textSub = darkMode ? '#94a3b8' : '#475569';

  if (stepNumber === 1) {
    return (
      <svg viewBox="0 0 360 175" className="w-full h-40 rounded-xl border border-emerald-500/30" style={{ background: bg }}>
        {/* Waxy Cuticle & Upper Epidermis */}
        <rect x="16" y="18" width="150" height="14" rx="4" fill="#a7f3d0" fillOpacity="0.45" stroke="#10b981" strokeWidth="1.4" />
        <text x="22" y="28" fill={strokeMain} fontSize="8.5" fontWeight="700">Waxy Cuticle (Transparent)</text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={16 + i * 50} y="34" width="48" height="20" rx="4" fill="#d1fae5" fillOpacity="0.35" stroke="#059669" strokeWidth="1.3" />
        ))}
        <text x="22" y="47" fill={strokeMain} fontSize="8" fontWeight="700">Upper Epidermis Cells</text>

        {/* Palisade Cells with Chloroplasts */}
        {[0, 1, 2].map((i) => (
          <g key={`pal-${i}`}>
            <rect x={20 + i * 48} y="58" width="42" height="96" rx="10" fill="#10b981" fillOpacity="0.18" stroke="#059669" strokeWidth="1.6" />
            <rect x={31 + i * 48} y="74" width="20" height="62" rx="7" fill="#38bdf8" fillOpacity="0.15" stroke="#0284c7" strokeDasharray="2 2" strokeWidth="1" />
            {[0, 1, 2, 3].map((c) => (
              <ellipse key={c} cx={26 + i * 48 + (c % 2) * 29} cy={72 + c * 20} rx="4.5" ry="7" fill="#16a34a" stroke="#4ade80" strokeWidth="1.2" />
            ))}
          </g>
        ))}
        <text x="22" y="166" fill="#10b981" fontSize="8.5" fontWeight="700">Palisade Mesophyll Cells</text>

        {/* Sun Rays Entering */}
        <circle cx="28" cy="10" r="8" fill="#facc15" />
        {[0, 1, 2].map((r) => (
          <g key={`ray-${r}`} opacity={Math.max(0.25, lightPct / 100)}>
            <line x1={32 + r * 28} y1="8" x2={56 + r * 36} y2="78" stroke="#eab308" strokeWidth="2.2" strokeDasharray="4 2" />
            <polygon points={`${56 + r * 36},82 ${51 + r * 36},74 ${60 + r * 36},74`} fill="#eab308" />
          </g>
        ))}

        {/* Zoomed Chloroplast & Thylakoid Grana on Right */}
        <ellipse cx="268" cy="92" rx="76" ry="52" fill="#064e3b" fillOpacity="0.85" stroke="#34d399" strokeWidth="2" />
        <ellipse cx="268" cy="92" rx="68" ry="44" fill="#065f46" stroke="#10b981" strokeWidth="1.2" />
        <text x="218" y="30" fill={strokeMain} fontSize="9.5" fontWeight="800">Zoomed Chloroplast</text>
        {/* Grana stacks */}
        {[230, 268, 306].map((gx, idx) => (
          <g key={gx}>
            {[0, 1, 2, 3].map((gy) => (
              <ellipse key={gy} cx={gx} cy={78 + gy * 9} rx="13" ry="4.2" fill="#22c55e" stroke="#bbf7d0" strokeWidth="1" />
            ))}
            {idx < 2 && <line x1={gx + 13} y1="90" x2={gx + 25} y2="90" stroke="#4ade80" strokeWidth="2" />}
          </g>
        ))}
        <text x="222" y="124" fill="#fef08a" fontSize="8.5" fontWeight="700">Thylakoid Grana (Chlorophyll)</text>
        <text x="235" y="158" fill={textSub} fontSize="8" fontWeight="700">Photons excite electrons (e⁻)</text>
      </svg>
    );
  }

  if (stepNumber === 2) {
    return (
      <svg viewBox="0 0 360 175" className="w-full h-40 rounded-xl border border-sky-500/30" style={{ background: bg }}>
        {/* Left: Xylem Lignified Vessel */}
        <text x="16" y="22" fill="#0284c7" fontSize="9.5" fontWeight="800">Xylem Vessel (H₂O Transport)</text>
        <rect x="34" y="30" width="54" height="130" rx="8" fill="#0284c7" fillOpacity="0.18" stroke="#0ea5e9" strokeWidth="2" />
        {/* Spiral lignin rings */}
        {[42, 64, 86, 108, 130, 150].map((ry) => (
          <ellipse key={ry} cx="61" cy={ry} rx="27" ry="6" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 2" />
        ))}
        {/* Rising H2O droplets */}
        {[135, 100, 65].map((wy, i) => (
          <g key={wy}>
            <circle cx="61" cy={wy} r="7" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1.2" />
            <text x="53" y={wy + 3} fill="#ffffff" fontSize="7" fontWeight="800">H₂O</text>
            {i > 0 && <line x1="61" y1={wy + 16} x2="61" y2={wy + 9} stroke="#38bdf8" strokeWidth="2" />}
          </g>
        ))}
        <text x="96" y="65" fill={textSub} fontSize="8" fontWeight="700">Spiral Lignin</text>
        <text x="96" y="76" fill={textSub} fontSize="8" fontWeight="700">Walls</text>

        {/* Arrow into Photolysis Chamber */}
        <path d="M 92 52 Q 140 52 168 72" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
        <polygon points="172,74 163,75 167,67" fill="#0ea5e9" />

        {/* Right: Photolysis of Water inside Thylakoid */}
        <rect x="172" y="26" width="172" height="134" rx="14" fill="#064e3b" fillOpacity="0.88" stroke="#34d399" strokeWidth="2" />
        <text x="186" y="46" fill="#fef08a" fontSize="9.5" fontWeight="800">Photolysis (Water Splitting)</text>
        <text x="186" y="62" fill="#a7f3d0" fontSize="8.5" fontWeight="700">2H₂O + Light → 4H⁺ + 4e⁻ + O₂↑</text>

        {/* Central H2O splitting node */}
        <circle cx="212" cy="104" r="17" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.8" />
        <text x="199" y="107" fill="#ffffff" fontSize="9.5" fontWeight="800">2H₂O</text>

        {/* Split Branches */}
        <line x1="229" y1="96" x2="274" y2="82" stroke="#4ade80" strokeWidth="2.2" />
        <rect x="274" y="68" width="58" height="24" rx="6" fill="#16a34a" stroke="#bbf7d0" strokeWidth="1.2" />
        <text x="281" y="83" fill="#ffffff" fontSize="8.5" fontWeight="800">4H⁺ + 4e⁻</text>

        <line x1="229" y1="112" x2="274" y2="128" stroke="#22d3ee" strokeWidth="2.2" />
        <rect x="274" y="116" width="58" height="24" rx="6" fill="#0891b2" stroke="#a5f3fc" strokeWidth="1.2" />
        <text x="282" y="131" fill="#ffffff" fontSize="8.5" fontWeight="800">O₂ Gas ↑</text>
      </svg>
    );
  }

  if (stepNumber === 3) {
    return (
      <svg viewBox="0 0 360 175" className="w-full h-40 rounded-xl border border-violet-500/30" style={{ background: bg }}>
        {/* Left: Kidney-Shaped Guard Cells & Stomatal Pore */}
        <text x="18" y="22" fill={strokeMain} fontSize="9.5" fontWeight="800">
          Lower Leaf Stoma ({stomataOpen ? 'OPEN' : 'CLOSED'})
        </text>
        {/* Left Guard Cell */}
        <path
          d={
            stomataOpen
              ? 'M 78 36 C 38 36, 38 144, 78 144 C 60 118, 60 62, 78 36 Z'
              : 'M 78 36 C 44 36, 44 144, 78 144 C 75 118, 75 62, 78 36 Z'
          }
          fill="#16a34a"
          fillOpacity="0.82"
          stroke="#4ade80"
          strokeWidth="2.2"
        />
        {/* Right Guard Cell */}
        <path
          d={
            stomataOpen
              ? 'M 86 36 C 126 36, 126 144, 86 144 C 104 118, 104 62, 86 36 Z'
              : 'M 82 36 C 116 36, 116 144, 82 144 C 85 118, 85 62, 82 36 Z'
          }
          fill="#16a34a"
          fillOpacity="0.82"
          stroke="#4ade80"
          strokeWidth="2.2"
        />
        {/* Chloroplast dots in guard cells */}
        {[56, 80, 106, 126].map((cy) => (
          <g key={cy}>
            <circle cx="56" cy={cy} r="3.5" fill="#bbf7d0" />
            <circle cx="106" cy={cy} r="3.5" fill="#bbf7d0" />
          </g>
        ))}
        <text x="26" y="162" fill="#10b981" fontSize="8.5" fontWeight="700">Kidney-Shaped Guard Cells</text>

        {/* Right: Cross-Section Diffusion Pathway through Spongy Air Spaces */}
        <rect x="166" y="22" width="178" height="138" rx="12" fill="#1e293b" fillOpacity={darkMode ? 0.7 : 0.08} stroke="#64748b" strokeWidth="1.4" />
        <text x="178" y="38" fill={strokeMain} fontSize="9" fontWeight="800">Spongy Air Space Diffusion</text>

        {/* Spongy cells */}
        <circle cx="204" cy="74" r="18" fill="#10b981" fillOpacity="0.3" stroke="#059669" strokeWidth="1.6" />
        <circle cx="262" cy="64" r="16" fill="#10b981" fillOpacity="0.3" stroke="#059669" strokeWidth="1.6" />
        <circle cx="312" cy="82" r="19" fill="#10b981" fillOpacity="0.3" stroke="#059669" strokeWidth="1.6" />
        <circle cx="222" cy="118" r="15" fill="#10b981" fillOpacity="0.3" stroke="#059669" strokeWidth="1.6" />

        {/* Lower Epidermis with Stoma Gap at bottom */}
        <rect x="176" y="140" width="62" height="12" rx="3" fill="#059669" fillOpacity="0.5" />
        <rect x="272" y="140" width="62" height="12" rx="3" fill="#059669" fillOpacity="0.5" />

        {/* CO2 Diffusion Arrows upward */}
        <g opacity={stomataOpen && co2Pct > 2 ? 1 : 0.25}>
          <path d="M 255 156 C 255 122, 248 98, 235 52" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="4 2" />
          <polygon points="234,47 231,56 240,54" fill="#a855f7" />
          <circle cx="255" cy="134" r="9" fill="#7c3aed" stroke="#ddd6fe" strokeWidth="1.2" />
          <text x="246" y="137" fill="#ffffff" fontSize="7.5" fontWeight="800">CO₂</text>
          <circle cx="282" cy="105" r="9" fill="#7c3aed" stroke="#ddd6fe" strokeWidth="1.2" />
          <text x="273" y="108" fill="#ffffff" fontSize="7.5" fontWeight="800">CO₂</text>
        </g>
      </svg>
    );
  }

  if (stepNumber === 4) {
    return (
      <svg viewBox="0 0 360 175" className="w-full h-40 rounded-xl border border-amber-500/30" style={{ background: bg }}>
        {/* Left: Light Stage Inputs (ATP & NADPH) */}
        <rect x="14" y="28" width="96" height="118" rx="12" fill="#065f46" fillOpacity="0.88" stroke="#34d399" strokeWidth="1.6" />
        <text x="24" y="48" fill="#fef08a" fontSize="9" fontWeight="800">Thylakoid Output</text>
        <rect x="26" y="62" width="72" height="24" rx="6" fill="#eab308" />
        <text x="38" y="77" fill="#0f172a" fontSize="9" fontWeight="900">ATP Energy</text>
        <rect x="26" y="98" width="72" height="24" rx="6" fill="#10b981" />
        <text x="31" y="113" fill="#0f172a" fontSize="8.5" fontWeight="900">NADPH (H⁺)</text>

        {/* Arrows into Calvin Cycle */}
        <line x1="110" y1="74" x2="154" y2="74" stroke="#eab308" strokeWidth="2.2" />
        <line x1="110" y1="110" x2="154" y2="104" stroke="#10b981" strokeWidth="2.2" />

        {/* Center-Right: Calvin Cycle Wheel in Chloroplast Stroma */}
        <circle cx="222" cy="90" r="52" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="7 3" />
        <text x="190" y="86" fill={strokeMain} fontSize="10" fontWeight="900">CALVIN CYCLE</text>
        <text x="195" y="99" fill={textSub} fontSize="8" fontWeight="700">(In Stroma)</text>

        {/* CO2 Entry at top of cycle */}
        <circle cx="222" cy="28" r="14" fill="#7c3aed" stroke="#ddd6fe" strokeWidth="1.5" />
        <text x="209" y="31" fill="#ffffff" fontSize="8.5" fontWeight="800">6CO₂</text>

        {/* RuBP & Rubisco */}
        <rect x="144" y="44" width="46" height="20" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
        <text x="153" y="57" fill="#f8fafc" fontSize="8" fontWeight="700">RuBP</text>

        {/* GP / TP intermediate */}
        <rect x="256" y="44" width="46" height="20" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
        <text x="261" y="57" fill="#f8fafc" fontSize="8" fontWeight="700">GP → TP</text>

        {/* Output: Glucose Crystal */}
        <line x1="262" y1="126" x2="294" y2="136" stroke="#f59e0b" strokeWidth="2.5" />
        <rect x="278" y="122" width="72" height="36" rx="8" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.6" />
        <text x="288" y="138" fill="#0f172a" fontSize="9.5" fontWeight="900">C₆H₁₂O₆</text>
        <text x="291" y="150" fill="#0f172a" fontSize="8" fontWeight="800">Glucose Sugar</text>
      </svg>
    );
  }

  // Step 5: Phloem Sieve Tube Translocation & O2 Release
  return (
    <svg viewBox="0 0 360 175" className="w-full h-40 rounded-xl border border-amber-500/30" style={{ background: bg }}>
      {/* Left: Phloem Sieve Tube with Sieve Plates & Companion Cell */}
      <text x="16" y="20" fill="#d97706" fontSize="9.5" fontWeight="800">Phloem Sieve Tube (Sugar Out)</text>
      <rect x="28" y="28" width="56" height="134" rx="8" fill="#f59e0b" fillOpacity="0.18" stroke="#f59e0b" strokeWidth="2" />
      {/* Companion Cell alongside */}
      <rect x="86" y="38" width="32" height="114" rx="6" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1.4" />
      <circle cx="102" cy="94" r="6" fill="#059669" />
      <text x="124" y="88" fill={textSub} fontSize="8" fontWeight="700">Companion</text>
      <text x="124" y="99" fill={textSub} fontSize="8" fontWeight="700">Cell (ATP)</text>

      {/* Perforated Sieve Plates */}
      {[68, 118].map((sy) => (
        <line key={sy} x1="28" y1={sy} x2="84" y2={sy} stroke="#fbbf24" strokeWidth="2.6" strokeDasharray="4 3" />
      ))}

      {/* Downward moving Glucose/Sucrose crystals */}
      {[46, 92, 138].map((gy) => (
        <g key={gy}>
          <polygon points={`56,${gy - 9} 66,${gy} 56,${gy + 9} 46,${gy}`} fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.2" />
          <line x1="56" y1={gy + 9} x2="56" y2={gy + 16} stroke="#fbbf24" strokeWidth="2" />
        </g>
      ))}

      {/* Right: Oxygen Release Summary Card */}
      <rect x="192" y="26" width="154" height="134" rx="12" fill="#083344" fillOpacity="0.88" stroke="#22d3ee" strokeWidth="1.8" />
      <text x="206" y="46" fill="#a5f3fc" fontSize="9.5" fontWeight="800">Net Products Released</text>

      <circle cx="222" cy="80" r="14" fill="#06b6d4" stroke="#cffafe" strokeWidth="1.5" />
      <text x="211" y="83" fill="#ffffff" fontSize="9" fontWeight="900">6O₂↑</text>
      <text x="244" y="78" fill="#ffffff" fontSize="8.5" fontWeight="700">Oxygen Gas</text>
      <text x="244" y="90" fill="#a5f3fc" fontSize="8" fontWeight="600">
        {Math.round(rate * 64)} bubbles/min
      </text>

      <polygon points="222,114 234,126 222,138 210,126" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
      <text x="244" y="124" fill="#ffffff" fontSize="8.5" fontWeight="700">C₆H₁₂O₆ Sugar</text>
      <text x="244" y="136" fill="#fde68a" fontSize="8" fontWeight="600">
        {(rate * 18.5).toFixed(1)} mg/hr to roots/fruits
      </text>
    </svg>
  );
};

export const Photosynthesis3DSimulation: React.FC<Photosynthesis3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 3',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Environmental Controls
  const [lightPct, setLightPct] = useState<number>(85);
  const [co2Pct, setCo2Pct] = useState<number>(80);
  const [tempC, setTempC] = useState<number>(29);
  const [stomataOpen, setStomataOpen] = useState<boolean>(true);
  const [explodeLayers, setExplodeLayers] = useState<number>(0);

  // 360° & Step-by-Step + Watch Lesson State
  const [watchLessonActive, setWatchLessonActive] = useState<boolean>(false);
  const [lessonPaused, setLessonPaused] = useState<boolean>(false);
  const [lessonTime, setLessonTime] = useState<number>(0);
  const [lessonSpeed, setLessonSpeed] = useState<0.75 | 1 | 1.5>(1);
  const [stepModeActive, setStepModeActive] = useState<boolean>(true);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [autoPlaySteps, setAutoPlaySteps] = useState<boolean>(false);
  const [autoRotate360, setAutoRotate360] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('iso360');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<LeafPartId>('palisade');
  const [level, setLevel] = useState<SyllabusLevel>(() =>
    activeClass.includes('5') || activeClass.includes('6') ? 'a_level' : 'o_level'
  );
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [interactionHint, setInteractionHint] = useState<string | null>(null);
  const [challengeIdx, setChallengeIdx] = useState<number | null>(null);
  const [plottedPoints, setPlottedPoints] = useState<PlottedRatePoint[]>([
    { id: 1, light: 20, rate: 25, co2: 80 },
    { id: 2, light: 50, rate: 45, co2: 80 },
    { id: 3, light: 85, rate: 57, co2: 80 },
  ]);

  const metrics = useMemo(
    () => computePhotosynthesisMetrics(lightPct, co2Pct, tempC, stomataOpen),
    [lightPct, co2Pct, tempC, stomataOpen]
  );

  const currentStep = PHOTOSYNTHESIS_STEPS[activeStepIdx] || PHOTOSYNTHESIS_STEPS[0];
  const activeLessonChapter = useMemo(() => getPhotoLessonChapter(lessonTime), [lessonTime]);

  const activeChallenge = challengeIdx !== null ? BIO_CHALLENGES[challengeIdx] : null;
  const challengeSolved = useMemo(() => {
    if (!activeChallenge) return false;
    return activeChallenge.check(lightPct, co2Pct, tempC, stomataOpen, metrics.bubblesPerMin);
  }, [activeChallenge, lightPct, co2Pct, tempC, stomataOpen, metrics.bubblesPerMin]);

  // Mutable refs for 60fps Three.js render loop
  const lightRef = useRef<number>(lightPct);
  const co2Ref = useRef<number>(co2Pct);
  const tempRef = useRef<number>(tempC);
  const stomataRef = useRef<boolean>(stomataOpen);
  const explodeRef = useRef<number>(explodeLayers);
  const darkModeRef = useRef<boolean>(darkMode);
  const showLabelsRef = useRef<boolean>(showLabels);
  const selectedPartRef = useRef<LeafPartId>(selectedPart);
  const autoRotateRef = useRef<boolean>(autoRotate360);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonPausedRef = useRef<boolean>(lessonPaused);
  const lessonSpeedRef = useRef<number>(lessonSpeed);
  const lessonTimeRef = useRef<number>(0);
  const lastChapterIdRef = useRef<number>(0);
  const lastLessonUiPushRef = useRef<number>(0);
  const desiredCamPosRef = useRef<[number, number, number] | null>(null);
  const desiredCamTargetRef = useRef<[number, number, number] | null>(null);
  const lastLabelPushRef = useRef<number>(0);

  useEffect(() => {
    lightRef.current = lightPct;
  }, [lightPct]);
  useEffect(() => {
    co2Ref.current = co2Pct;
  }, [co2Pct]);
  useEffect(() => {
    tempRef.current = tempC;
  }, [tempC]);
  useEffect(() => {
    stomataRef.current = stomataOpen;
  }, [stomataOpen]);
  useEffect(() => {
    explodeRef.current = explodeLayers;
  }, [explodeLayers]);
  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);
  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);
  useEffect(() => {
    selectedPartRef.current = selectedPart;
  }, [selectedPart]);
  useEffect(() => {
    autoRotateRef.current = autoRotate360;
  }, [autoRotate360]);
  useEffect(() => {
    watchLessonRef.current = watchLessonActive;
  }, [watchLessonActive]);
  useEffect(() => {
    lessonPausedRef.current = lessonPaused;
  }, [lessonPaused]);
  useEffect(() => {
    lessonSpeedRef.current = lessonSpeed;
  }, [lessonSpeed]);

  // Auto-advance step-by-step timer when Auto-Play Steps is toggled on (and Watch Lesson is off)
  useEffect(() => {
    if (!autoPlaySteps || !stepModeActive || watchLessonActive) return;
    const timer = window.setInterval(() => {
      setActiveStepIdx((prev) => {
        const next = (prev + 1) % PHOTOSYNTHESIS_STEPS.length;
        const spec = PHOTOSYNTHESIS_STEPS[next];
        setSelectedPart(spec.focusPart);
        desiredCamPosRef.current = [...spec.cameraPos];
        desiredCamTargetRef.current = [...spec.cameraTarget];
        return next;
      });
    }, 6500);
    return () => window.clearInterval(timer);
  }, [autoPlaySteps, stepModeActive, watchLessonActive]);

  const applyLessonChapter = (ch: PhotosynthesisLessonChapter) => {
    const spec = PHOTOSYNTHESIS_STEPS[ch.stepIdx] || PHOTOSYNTHESIS_STEPS[0];
    setActiveStepIdx(ch.stepIdx);
    setSelectedPart(spec.focusPart);
    setLightPct(ch.lightPct);
    setCo2Pct(ch.co2Pct);
    setTempC(ch.tempC);
    setStomataOpen(ch.stomataOpen);
    setExplodeLayers(ch.explodeLayers);
    desiredCamPosRef.current = [...spec.cameraPos];
    desiredCamTargetRef.current = [...spec.cameraTarget];
  };

  const handleToggleWatchLesson = () => {
    if (watchLessonActive) {
      setWatchLessonActive(false);
      setLessonPaused(false);
      return;
    }
    setAutoPlaySteps(false);
    setAutoRotate360(false);
    setChallengeIdx(null);
    lessonTimeRef.current = 0;
    lastChapterIdRef.current = 1;
    setLessonTime(0);
    setLessonPaused(false);
    lessonPausedRef.current = false;
    setStepModeActive(true);
    setDockCollapsed(false);
    applyLessonChapter(PHOTO_LESSON_CHAPTERS[0]);
    setWatchLessonActive(true);
  };

  const handleScrubLesson = (sec: number) => {
    const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, sec));
    lessonTimeRef.current = clamped;
    setLessonTime(clamped);
    const ch = getPhotoLessonChapter(clamped);
    lastChapterIdRef.current = ch.id;
    applyLessonChapter(ch);
  };

  const handleCycleLessonSpeed = () => {
    setLessonSpeed((prev) => (prev === 0.75 ? 1 : prev === 1 ? 1.5 : 0.75));
  };

  const handleTakeOverFromLesson = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
  };

  const handleSelectStep = (idx: number) => {
    const clamped = ((idx % PHOTOSYNTHESIS_STEPS.length) + PHOTOSYNTHESIS_STEPS.length) % PHOTOSYNTHESIS_STEPS.length;
    const spec = PHOTOSYNTHESIS_STEPS[clamped];
    setWatchLessonActive(false);
    setLessonPaused(false);
    setStepModeActive(true);
    setActiveStepIdx(clamped);
    setSelectedPart(spec.focusPart);
    desiredCamPosRef.current = [...spec.cameraPos];
    desiredCamTargetRef.current = [...spec.cameraTarget];
    if (clamped === 2 && !stomataOpen) {
      setStomataOpen(true);
    }
  };

  const handleSelectCameraPreset = (preset: CameraPresetId) => {
    setCameraPreset(preset);
    setAutoPlaySteps(false);
    setWatchLessonActive(false);
    setLessonPaused(false);
    if (preset === 'iso360') {
      desiredCamPosRef.current = [5.2, 2.8, 6.4];
      desiredCamTargetRef.current = [0, 0, 0];
    } else if (preset === 'front') {
      desiredCamPosRef.current = [0, 0.2, 7.8];
      desiredCamTargetRef.current = [0, 0, 0];
    } else if (preset === 'underside') {
      desiredCamPosRef.current = [1.8, -4.4, 5.4];
      desiredCamTargetRef.current = [0.2, -1.2, 0];
    } else if (preset === 'vascular') {
      desiredCamPosRef.current = [-5.4, 0.8, 5.2];
      desiredCamTargetRef.current = [-1.3, 0, 0];
    } else if (preset === 'top') {
      desiredCamPosRef.current = [0.4, 6.6, 3.8];
      desiredCamTargetRef.current = [0, 0.6, 0];
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => setIsFullscreen((p) => !p));
    } else {
      document.exitFullscreen?.().catch(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // ==================== TRUE 3D 360° VOLUMETRIC LEAF ANATOMY & MOLECULAR FLOWS ====================
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = Math.max(mountEl.clientWidth, 320);
    const height = Math.max(mountEl.clientHeight, 380);

    const scene = new THREE.Scene();
    const bgDark = new THREE.Color(0x07131a);
    const bgLight = new THREE.Color(0xeef5f0);
    scene.background = darkModeRef.current ? bgDark.clone() : bgLight.clone();
    scene.fog = new THREE.FogExp2(darkModeRef.current ? 0x07131a : 0xeef5f0, 0.026);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(4.7, 2.75, 6.45);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    // Realistic Botanical 3-Point Studio + Chlorophyll Subsurface Translucency Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xf6fff8, 0x163222, 1.05);
    scene.add(hemiLight);

    const sunDirLight = new THREE.DirectionalLight(0xfff7dc, 2.35);
    sunDirLight.position.set(4.2, 8.2, 5.2);
    if (!isSoftwareGl) {
      sunDirLight.castShadow = true;
      sunDirLight.shadow.mapSize.set(1024, 1024);
      sunDirLight.shadow.camera.near = 1;
      sunDirLight.shadow.camera.far = 22;
      sunDirLight.shadow.camera.left = -4.5;
      sunDirLight.shadow.camera.right = 4.5;
      sunDirLight.shadow.camera.top = 4.5;
      sunDirLight.shadow.camera.bottom = -4.5;
      sunDirLight.shadow.bias = -0.0006;
      sunDirLight.shadow.normalBias = 0.025;
    }
    scene.add(sunDirLight);

    // Warm emerald-lime subsurface transmitted backlight (mimics real sun glowing through a living leaf)
    const subsurfaceLight = new THREE.DirectionalLight(0x86efac, 0.95);
    subsurfaceLight.position.set(-5.0, -4.2, -4.0);
    scene.add(subsurfaceLight);

    // Subtle cool rim specular light for wet cellular membranes
    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.65);
    rimLight.position.set(-4.5, 3.5, 5.8);
    scene.add(rimLight);

    // Full 360° Unclamped OrbitControls!
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 3.2;
    controls.maxDistance = 14.5;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI - 0.08;
    controls.target.set(0, 0, 0);

    const cancelScriptedCamera = () => {
      desiredCamPosRef.current = null;
      desiredCamTargetRef.current = null;
    };
    controls.addEventListener('start', cancelScriptedCamera);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };
    const trackTex = <T extends THREE.Texture>(t: T): T => {
      textures.push(t);
      return t;
    };

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Shared High-Realism Botanical PBR Textures
    const leafMaps = createBotanicalLeafMaps(maxAniso);
    trackTex(leafMaps.albedoMap);
    trackTex(leafMaps.bumpMap);

    const cellularBumpTex = trackTex(createCellularBumpMap(maxAniso));
    const chloroMaps = createChloroplastMaps(maxAniso);
    trackTex(chloroMaps.albedoMap);
    trackTex(chloroMaps.bumpMap);
    const sunbeamAlphaTex = trackTex(createSunbeamAlphaMap());

    // Root 3D Leaf Cross-Section Block Group
    const leafRoot = new THREE.Group();
    scene.add(leafRoot);

    // Soft grounded specimen contact shadow below the 3D leaf cutaway
    const shadowTex = trackTex(createContactShadowTexture());
    const shadowPlane = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(8.8, 5.8)),
      trackMat(
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.58,
        })
      )
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.38;
    scene.add(shadowPlane);

    // Interactive clickable meshes array (tagged with userData.partId)
    const clickableMeshes: THREE.Object3D[] = [];

    // ==================== LAYER 1: SCULPTED ORGANIC WAXY CUTICLE, DEWDROP & UPPER EPIDERMIS ====================
    const topLayerGroup = new THREE.Group();
    leafRoot.add(topLayerGroup);

    // Sculpted organic undulating cuticle sheet with raised midrib ridge above vascular vein (x = -1.55)
    const cuticleGeo = trackGeo(new THREE.BoxGeometry(5.38, 0.11, 3.12, 36, 2, 22));
    const cPos = cuticleGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const x = cPos.getX(i);
      const y = cPos.getY(i);
      const z = cPos.getZ(i);
      const midribRidge = Math.exp(-Math.pow((x + 1.55) / 0.55, 2)) * 0.11;
      const veinRipple = Math.sin(x * 2.4 + z * 1.8) * 0.025 + Math.cos(z * 2.6) * 0.018;
      // Gently feather edges so it feels like a real botanical specimen slice
      const edgeTaper = 1 - 0.12 * Math.pow(Math.abs(x) / 2.75, 4);
      cPos.setY(i, y * edgeTaper + midribRidge + veinRipple);
    }
    cPos.needsUpdate = true;
    cuticleGeo.computeVertexNormals();

    const cuticleMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        map: leafMaps.albedoMap,
        bumpMap: leafMaps.bumpMap,
        bumpScale: 0.035,
        color: 0xd9f99d,
        roughness: 0.16,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.07,
        sheen: 0.35,
        sheenColor: new THREE.Color(0xecfccb),
        transparent: true,
        opacity: 0.84,
      })
    );
    const cuticleMesh = new THREE.Mesh(cuticleGeo, cuticleMat);
    cuticleMesh.position.set(0, 1.67, 0);
    cuticleMesh.castShadow = !isSoftwareGl;
    cuticleMesh.receiveShadow = !isSoftwareGl;
    cuticleMesh.userData.partId = 'cuticle';
    topLayerGroup.add(cuticleMesh);
    clickableMeshes.push(cuticleMesh);

    // Glistening Morning Dewdrop resting on the waxy hydrophobic cuticle
    const dewMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xf0fdfa,
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        ior: 1.333,
        transmission: isSoftwareGl ? 0 : 0.92,
        thickness: 0.45,
        transparent: true,
        opacity: isSoftwareGl ? 0.55 : 0.95,
      })
    );
    const dewGeo = trackGeo(new THREE.SphereGeometry(0.16, 20, 16));
    dewGeo.scale(1.18, 0.72, 1.12);
    const dewDrop1 = new THREE.Mesh(dewGeo, dewMat);
    dewDrop1.position.set(1.25, 1.8, 0.55);
    const dewDrop2 = new THREE.Mesh(dewGeo, dewMat);
    dewDrop2.scale.setScalar(0.55);
    dewDrop2.position.set(1.62, 1.77, 0.22);
    topLayerGroup.add(dewDrop1, dewDrop2);

    // Fine Microscopic Leaf Trichomes (delicate translucent botanical hairs on upper cuticle)
    const trichomeGeo = trackGeo(new THREE.ConeGeometry(0.014, 0.24, 6));
    trichomeGeo.translate(0, 0.12, 0);
    const trichomeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xecfdf5,
        roughness: 0.45,
        transparent: true,
        opacity: 0.62,
      })
    );
    const trichomeInstanced = new THREE.InstancedMesh(trichomeGeo, trichomeMat, 22);
    for (let t = 0; t < 22; t++) {
      const tx = -2.2 + ((t * 1.17) % 4.4);
      const tz = -1.2 + ((t * 0.89) % 2.4);
      _posDummy.set(tx, 1.71, tz);
      _eulerDummy.set(0.25 * Math.sin(t * 2.1), t * 1.3, 0.28 * Math.cos(t * 1.7));
      _quatDummy.setFromEuler(_eulerDummy);
      _scaleDummy.setScalar(0.75 + (t % 4) * 0.18);
      _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
      trichomeInstanced.setMatrixAt(t, _matDummy);
    }
    trichomeInstanced.instanceMatrix.needsUpdate = true;
    trichomeInstanced.computeBoundingSphere();
    topLayerGroup.add(trichomeInstanced);

    // Upper Epidermis Sculpted Pillowy Botanical Cells (8 x 4 = 32 cushioned beveled cells with natural color variation)
    const upperEpiGeo = trackGeo(createEpidermalPillowGeometry());
    const upperEpiMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        bumpMap: cellularBumpTex,
        bumpScale: 0.018,
        roughness: 0.24,
        metalness: 0.0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
        transparent: true,
        opacity: 0.78,
      })
    );
    const upperEpiInstanced = new THREE.InstancedMesh(upperEpiGeo, upperEpiMat, 32);
    upperEpiInstanced.castShadow = !isSoftwareGl;
    upperEpiInstanced.receiveShadow = !isSoftwareGl;
    upperEpiInstanced.userData.partId = 'cuticle';
    let uIdx = 0;
    for (let ix = 0; ix < 8; ix++) {
      for (let iz = 0; iz < 4; iz++) {
        const jx = Math.sin(ix * 2.3 + iz * 1.7) * 0.018;
        const jz = Math.cos(ix * 1.9 - iz * 2.1) * 0.018;
        _posDummy.set(-2.22 + ix * 0.635 + jx, 1.44, -1.08 + iz * 0.72 + jz);
        _eulerDummy.set(0, Math.sin(ix + iz) * 0.04, 0);
        _quatDummy.setFromEuler(_eulerDummy);
        _scaleDummy.set(0.98 + ((ix + iz) % 3) * 0.025, 0.96 + (ix % 2) * 0.07, 0.98 + (iz % 2) * 0.03);
        _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
        upperEpiInstanced.setMatrixAt(uIdx, _matDummy);
        _colorDummy.setHSL(0.28 + ((ix * 7 + iz * 3) % 5) * 0.012, 0.56, 0.73 + ((ix + iz) % 3) * 0.025);
        upperEpiInstanced.setColorAt(uIdx, _colorDummy);
        uIdx++;
      }
    }
    upperEpiInstanced.instanceMatrix.needsUpdate = true;
    if (upperEpiInstanced.instanceColor) upperEpiInstanced.instanceColor.needsUpdate = true;
    upperEpiInstanced.computeBoundingSphere();
    topLayerGroup.add(upperEpiInstanced);
    clickableMeshes.push(upperEpiInstanced);

    // ==================== LAYER 2: ORGANIC ROUNDED-CAP PALISADE MESOPHYLL, VACUOLES, NUCLEI & CHLOROPLASTS ====================
    const palisadeLayerGroup = new THREE.Group();
    leafRoot.add(palisadeLayerGroup);

    const palisadeCellPositions: Array<[number, number, number]> = [];
    for (let ix = 0; ix < 8; ix++) {
      const px = -2.18 + ix * 0.62;
      for (let iz = 0; iz < 4; iz++) {
        const pz = -1.05 + iz * 0.7;
        // Leave organic space for the raised midrib vascular bundle on left
        if (px < -0.82 && Math.abs(pz) < 0.85) continue;
        const jitterX = Math.sin(ix * 3.1 + iz * 2.2) * 0.035;
        const jitterZ = Math.cos(ix * 1.7 + iz * 3.3) * 0.035;
        palisadeCellPositions.push([px + jitterX, 0.78, pz + jitterZ]);
      }
    }

    const palCellGeo = trackGeo(createPalisadeCellGeometry());
    const palCellMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        bumpMap: cellularBumpTex,
        bumpScale: 0.022,
        roughness: 0.22,
        metalness: 0.0,
        clearcoat: 0.55,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0.44,
        depthWrite: false,
      })
    );
    const palCellInstanced = new THREE.InstancedMesh(
      palCellGeo,
      palCellMat,
      palisadeCellPositions.length
    );
    palCellInstanced.userData.partId = 'palisade';

    // Aqueous Central Vacuoles inside every Palisade Cell
    const vacuoleGeo = trackGeo(createPalisadeCellGeometry());
    vacuoleGeo.scale(0.52, 0.72, 0.52);
    const vacuoleMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xdcfce7,
        emissive: new THREE.Color(0x0ea5e9),
        emissiveIntensity: 0.08,
        roughness: 0.12,
        clearcoat: 0.9,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
      })
    );
    const vacuoleInstanced = new THREE.InstancedMesh(
      vacuoleGeo,
      vacuoleMat,
      palisadeCellPositions.length
    );

    // Distinct Biological Cell Nuclei tucked inside the cytoplasm of each Palisade cell
    const nucleusGeo = trackGeo(new THREE.SphereGeometry(0.064, 12, 10));
    nucleusGeo.scale(1.15, 0.88, 0.92);
    const nucleusMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        emissive: new THREE.Color(0x92400e),
        emissiveIntensity: 0.22,
        roughness: 0.42,
      })
    );
    const nucleusInstanced = new THREE.InstancedMesh(
      nucleusGeo,
      nucleusMat,
      palisadeCellPositions.length
    );

    // Rich 3D Chloroplasts (7 per palisade cell + cyclosis orbital metadata!)
    const chloroplastsBase: Array<{
      cx: number;
      cy: number;
      cz: number;
      angle: number;
      radius: number;
      yOff: number;
      speed: number;
    }> = [];

    palisadeCellPositions.forEach(([cx, cy, cz], idx) => {
      _posDummy.set(cx, cy, cz);
      _eulerDummy.set(Math.sin(idx) * 0.03, idx * 0.4, Math.cos(idx) * 0.03);
      _quatDummy.setFromEuler(_eulerDummy);
      const sy = 0.94 + (idx % 3) * 0.06;
      _scaleDummy.set(0.96 + (idx % 2) * 0.06, sy, 0.96 + ((idx + 1) % 2) * 0.06);
      _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
      palCellInstanced.setMatrixAt(idx, _matDummy);
      vacuoleInstanced.setMatrixAt(idx, _matDummy);

      // Per-cell natural leaf-green tint variation
      _colorDummy.setHSL(0.35 + (idx % 5) * 0.012, 0.62, 0.44 + (idx % 3) * 0.04);
      palCellInstanced.setColorAt(idx, _colorDummy);

      // Cell Nucleus tucked against inner cell wall
      const nAng = idx * 1.9;
      _posDummy.set(cx + Math.cos(nAng) * 0.12, cy - 0.18 + (idx % 3) * 0.14, cz + Math.sin(nAng) * 0.12);
      _quatDummy.identity();
      _scaleDummy.setScalar(1);
      _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
      nucleusInstanced.setMatrixAt(idx, _matDummy);

      for (let c = 0; c < 7; c++) {
        const ang = (c / 7) * Math.PI * 2 + idx * 0.65;
        const r = 0.168;
        const yOff = -0.33 + (c / 6) * 0.66;
        chloroplastsBase.push({
          cx,
          cy,
          cz,
          angle: ang,
          radius: r,
          yOff,
          speed: 0.22 + (c % 3) * 0.08,
        });
      }
    });
    palCellInstanced.instanceMatrix.needsUpdate = true;
    if (palCellInstanced.instanceColor) palCellInstanced.instanceColor.needsUpdate = true;
    palCellInstanced.computeBoundingSphere();
    vacuoleInstanced.instanceMatrix.needsUpdate = true;
    vacuoleInstanced.computeBoundingSphere();
    nucleusInstanced.instanceMatrix.needsUpdate = true;
    nucleusInstanced.computeBoundingSphere();
    palisadeLayerGroup.add(palCellInstanced, vacuoleInstanced, nucleusInstanced);
    clickableMeshes.push(palCellInstanced);

    // Discoid Biconvex 3D Chloroplasts textured with Thylakoid Grana Map
    const chloroGeo = trackGeo(new THREE.SphereGeometry(0.072, 14, 12));
    chloroGeo.scale(1.15, 1.32, 0.56);
    const chloroMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        map: chloroMaps.albedoMap,
        bumpMap: chloroMaps.bumpMap,
        bumpScale: 0.015,
        color: 0xffffff,
        emissive: new THREE.Color(0x16a34a),
        emissiveIntensity: 0.25,
        roughness: 0.24,
        clearcoat: 0.72,
        clearcoatRoughness: 0.16,
      })
    );
    const chloroInstanced = new THREE.InstancedMesh(
      chloroGeo,
      chloroMat,
      chloroplastsBase.length
    );
    chloroInstanced.userData.partId = 'palisade';
    chloroInstanced.frustumCulled = false;
    palisadeLayerGroup.add(chloroInstanced);
    clickableMeshes.push(chloroInstanced);

    // ==================== LAYER 3: BOTANICAL VASCULAR BUNDLE (BUNDLE SHEATH RING, HELICAL XYLEM & PHLOEM) ====================
    const vascularGroup = new THREE.Group();
    leafRoot.add(vascularGroup);

    // 14-Cell Organic Ring of Sculpted Bundle Sheath Parenchyma Cells surrounding the leaf vein!
    const sheathCellGeo = trackGeo(new THREE.CylinderGeometry(0.145, 0.145, 3.04, 12));
    sheathCellGeo.rotateX(Math.PI / 2);
    const sheathCellMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        bumpMap: cellularBumpTex,
        bumpScale: 0.02,
        roughness: 0.34,
        clearcoat: 0.35,
        transparent: true,
        opacity: 0.76,
      })
    );
    const SHEATH_COUNT = 16;
    const sheathInstanced = new THREE.InstancedMesh(sheathCellGeo, sheathCellMat, SHEATH_COUNT);
    sheathInstanced.castShadow = !isSoftwareGl;
    sheathInstanced.receiveShadow = !isSoftwareGl;
    for (let s = 0; s < SHEATH_COUNT; s++) {
      const ang = (s / SHEATH_COUNT) * Math.PI * 2;
      const sx = -1.55 + Math.cos(ang) * 0.73;
      const sy = 0.02 + Math.sin(ang) * 0.68;
      _posDummy.set(sx, sy, 0);
      _eulerDummy.set(0, 0, ang);
      _quatDummy.setFromEuler(_eulerDummy);
      _scaleDummy.set(0.95 + (s % 2) * 0.1, 1.05, 1);
      _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
      sheathInstanced.setMatrixAt(s, _matDummy);
      _colorDummy.setHSL(0.31 + (s % 4) * 0.015, 0.52, 0.56 + (s % 3) * 0.04);
      sheathInstanced.setColorAt(s, _colorDummy);
    }
    sheathInstanced.instanceMatrix.needsUpdate = true;
    if (sheathInstanced.instanceColor) sheathInstanced.instanceColor.needsUpdate = true;
    sheathInstanced.computeBoundingSphere();
    vascularGroup.add(sheathInstanced);

    // Fibrous Sclerenchyma Cap underneath the Phloem (authentic vascular bundle support tissue)
    const sclerenchymaMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd6d3b1,
        bumpMap: cellularBumpTex,
        bumpScale: 0.025,
        roughness: 0.68,
      })
    );
    for (let f = -2; f <= 2; f++) {
      const fiber = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.068, 0.068, 3.06, 8)),
        sclerenchymaMat
      );
      fiber.rotation.x = Math.PI / 2;
      fiber.position.set(-1.55 + f * 0.125, -0.53 + Math.abs(f) * 0.028, 0);
      vascularGroup.add(fiber);
    }

    // 3D Hollow Lignified Xylem Vessels with True Continuous Helical Spiral Thickenings!
    const xylemWallMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x0369a1,
        emissive: new THREE.Color(0x0c4a6e),
        emissiveIntensity: 0.25,
        bumpMap: cellularBumpTex,
        bumpScale: 0.018,
        roughness: 0.25,
        clearcoat: 0.6,
        transparent: true,
        opacity: 0.66,
        side: THREE.DoubleSide,
      })
    );
    const xylemHelixMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.08,
      })
    );
    const xylemOffsets: Array<[number, number, number]> = [
      [-1.55, 0.34, 0.145],
      [-1.83, 0.18, 0.115],
      [-1.27, 0.18, 0.115],
    ];
    for (const [xx, xy, xr] of xylemOffsets) {
      // Hollow open-ended xylem vessel conduit
      const tube = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(xr, xr, 3.28, 20, 1, true)),
        xylemWallMat
      );
      tube.rotation.x = Math.PI / 2;
      tube.position.set(xx, xy, 0);
      tube.userData.partId = 'xylem';
      vascularGroup.add(tube);
      clickableMeshes.push(tube);

      // End-cap collar ring showing thick lignified vessel wall thickness
      for (const zEnd of [-1.64, 1.64]) {
        const rim = new THREE.Mesh(
          trackGeo(new THREE.TorusGeometry(xr, 0.022, 10, 20)),
          xylemHelixMat
        );
        rim.position.set(xx, xy, zEnd);
        rim.userData.partId = 'xylem';
        vascularGroup.add(rim);
      }

      // Continuous 3D Helical Spiral Lignin Thickening wrapping around the Xylem vessel
      const helixMesh = new THREE.Mesh(
        trackGeo(createHelicalLigninGeometry(xr + 0.012, 3.16, 9)),
        xylemHelixMat
      );
      helixMesh.position.set(xx, xy, 0);
      helixMesh.userData.partId = 'xylem';
      vascularGroup.add(helixMesh);
      clickableMeshes.push(helixMesh);
    }

    // 3D Phloem Sieve Tubes + Perforated Sieve Plates + Companion Cells
    const phloemMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xd97706,
        emissive: new THREE.Color(0x92400e),
        emissiveIntensity: 0.22,
        bumpMap: cellularBumpTex,
        bumpScale: 0.016,
        roughness: 0.28,
        clearcoat: 0.5,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      })
    );
    const phloemPlateMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: new THREE.Color(0xf59e0b),
        emissiveIntensity: 0.35,
        roughness: 0.25,
      })
    );
    const companionMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x65a30d,
        bumpMap: cellularBumpTex,
        bumpScale: 0.02,
        roughness: 0.4,
      })
    );
    const phloemOffsets: Array<[number, number, number]> = [
      [-1.55, -0.3, 0.13],
      [-1.81, -0.17, 0.1],
      [-1.29, -0.17, 0.1],
    ];
    for (const [px, py, pr] of phloemOffsets) {
      const tube = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(pr, pr, 3.26, 18, 1, true)),
        phloemMat
      );
      tube.rotation.x = Math.PI / 2;
      tube.position.set(px, py, 0);
      tube.userData.partId = 'phloem';
      vascularGroup.add(tube);
      clickableMeshes.push(tube);

      // Companion cell running snugly beside each sieve tube
      const comp = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(pr * 0.44, pr * 0.44, 3.16, 10)),
        companionMat
      );
      comp.rotation.x = Math.PI / 2;
      comp.position.set(px + pr * 1.12, py - pr * 0.42, 0);
      comp.userData.partId = 'phloem';
      vascularGroup.add(comp);

      // Perforated sieve plate collars along the phloem tube
      for (let pz = -1.35; pz <= 1.35; pz += 0.54) {
        const plateRing = new THREE.Mesh(
          trackGeo(new THREE.TorusGeometry(pr + 0.012, 0.016, 8, 18)),
          phloemPlateMat
        );
        plateRing.position.set(px, py, pz);
        plateRing.userData.partId = 'phloem';
        vascularGroup.add(plateRing);
      }
    }

    // ==================== LAYER 4: ORGANIC LOBED SPONGY MESOPHYLL & INTERCELLULAR AIR CHAMBERS ====================
    const spongyLayerGroup = new THREE.Group();
    leafRoot.add(spongyLayerGroup);

    const spongyPositions: Array<[number, number, number, number]> = [
      [-0.45, -0.25, -0.95, 0.29],
      [0.35, -0.18, -0.85, 0.32],
      [1.15, -0.32, -0.92, 0.28],
      [1.95, -0.22, -0.88, 0.31],
      [-0.25, -0.44, -0.15, 0.3],
      [0.72, -0.28, -0.1, 0.33],
      [1.55, -0.45, -0.18, 0.29],
      [2.18, -0.3, -0.05, 0.27],
      [-0.5, -0.24, 0.85, 0.31],
      [0.25, -0.38, 0.92, 0.29],
      [1.08, -0.22, 0.82, 0.32],
      [1.88, -0.36, 0.9, 0.3],
      [-0.08, -0.74, -0.58, 0.26],
      [1.22, -0.76, 0.46, 0.27],
      [2.05, -0.72, -0.46, 0.26],
      [0.38, -0.76, -0.82, 0.25],
      [1.72, -0.75, 0.78, 0.25],
    ];
    const spongyGeo = trackGeo(createSpongyParenchymaGeometry());
    const spongyMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        bumpMap: cellularBumpTex,
        bumpScale: 0.025,
        emissive: new THREE.Color(0x065f46),
        emissiveIntensity: 0.16,
        roughness: 0.32,
        clearcoat: 0.45,
        clearcoatRoughness: 0.25,
      })
    );
    const spongyInstanced = new THREE.InstancedMesh(
      spongyGeo,
      spongyMat,
      spongyPositions.length
    );
    spongyInstanced.castShadow = !isSoftwareGl;
    spongyInstanced.receiveShadow = !isSoftwareGl;
    spongyInstanced.userData.partId = 'spongy';

    // Surface chloroplasts nestled in spongy mesophyll cells too
    const spongyChloroPositions: Array<[number, number, number]> = [];
    spongyPositions.forEach(([sx, sy, sz, sr], idx) => {
      _posDummy.set(sx, sy, sz);
      _eulerDummy.set(idx * 0.85, idx * 1.25, idx * 0.45);
      _quatDummy.setFromEuler(_eulerDummy);
      _scaleDummy.set(sr * 1.08, sr * 0.92, sr);
      _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
      spongyInstanced.setMatrixAt(idx, _matDummy);

      // Authentic spongy mesophyll soft chlorophyll lime-emerald tints
      _colorDummy.setHSL(0.32 + (idx % 5) * 0.014, 0.56, 0.39 + (idx % 3) * 0.045);
      spongyInstanced.setColorAt(idx, _colorDummy);

      for (let sc = 0; sc < 3; sc++) {
        const a = sc * 2.1 + idx;
        spongyChloroPositions.push([
          sx + Math.cos(a) * sr * 0.88,
          sy + (sc - 1) * sr * 0.32,
          sz + Math.sin(a) * sr * 0.88,
        ]);
      }
    });
    spongyInstanced.instanceMatrix.needsUpdate = true;
    if (spongyInstanced.instanceColor) spongyInstanced.instanceColor.needsUpdate = true;
    spongyInstanced.computeBoundingSphere();
    spongyLayerGroup.add(spongyInstanced);
    clickableMeshes.push(spongyInstanced);

    const spongyChloroInstanced = new THREE.InstancedMesh(
      chloroGeo,
      chloroMat,
      spongyChloroPositions.length
    );
    spongyChloroPositions.forEach(([cx, cy, cz], idx) => {
      _posDummy.set(cx, cy, cz);
      _eulerDummy.set(idx * 0.6, idx * 1.1, 0);
      _quatDummy.setFromEuler(_eulerDummy);
      _scaleDummy.setScalar(0.82);
      _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
      spongyChloroInstanced.setMatrixAt(idx, _matDummy);
    });
    spongyChloroInstanced.instanceMatrix.needsUpdate = true;
    spongyChloroInstanced.computeBoundingSphere();
    spongyLayerGroup.add(spongyChloroInstanced);

    // ==================== LAYER 5: LOWER EPIDERMIS, MIDRIB KEEL & PLUMP KIDNEY-SHAPED 3D STOMATA ====================
    const bottomLayerGroup = new THREE.Group();
    leafRoot.add(bottomLayerGroup);

    // Three 3D Stomatal Pore Centers on the underside of the leaf (y = -1.35)
    const stomaCenters: Array<[number, number]> = [
      [-0.55, 0.35],
      [0.55, 0.0],
      [1.65, -0.35],
    ];

    // Natural Lower Midrib Keel bulging subtly under the vascular bundle (x = -1.55)
    const midribKeelGeo = trackGeo(new THREE.CylinderGeometry(0.46, 0.46, 3.08, 16, 1, false, Math.PI, Math.PI));
    midribKeelGeo.rotateX(Math.PI / 2);
    const midribKeel = new THREE.Mesh(
      midribKeelGeo,
      trackMat(
        new THREE.MeshPhysicalMaterial({
          color: 0x65a30d,
          bumpMap: cellularBumpTex,
          bumpScale: 0.025,
          roughness: 0.36,
          clearcoat: 0.4,
          transparent: true,
          opacity: 0.85,
        })
      )
    );
    midribKeel.position.set(-1.55, -1.24, 0);
    midribKeel.scale.set(1.35, 0.72, 1);
    bottomLayerGroup.add(midribKeel);

    // Lower Epidermis Cushioned Pillowy Cells (leaving clear openings for the 3 stomata!)
    const lowerEpiPositions: Array<[number, number, number]> = [];
    for (let ix = 0; ix < 8; ix++) {
      const lx = -2.22 + ix * 0.635;
      for (let iz = 0; iz < 4; iz++) {
        const lz = -1.08 + iz * 0.72;
        const nearStoma = stomaCenters.some(([sx, sz]) => Math.hypot(lx - sx, lz - sz) < 0.56);
        if (!nearStoma) {
          lowerEpiPositions.push([lx, -1.32, lz]);
        }
      }
    }
    const lowerEpiInstanced = new THREE.InstancedMesh(
      upperEpiGeo,
      upperEpiMat,
      lowerEpiPositions.length
    );
    lowerEpiInstanced.receiveShadow = !isSoftwareGl;
    lowerEpiInstanced.userData.partId = 'stomata';
    lowerEpiPositions.forEach(([lx, ly, lz], idx) => {
      _posDummy.set(lx, ly, lz);
      _quatDummy.identity();
      _scaleDummy.set(0.98, 0.84, 0.98);
      _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
      lowerEpiInstanced.setMatrixAt(idx, _matDummy);
      _colorDummy.setHSL(0.27 + (idx % 4) * 0.012, 0.5, 0.68 + (idx % 3) * 0.025);
      lowerEpiInstanced.setColorAt(idx, _colorDummy);
    });
    lowerEpiInstanced.instanceMatrix.needsUpdate = true;
    if (lowerEpiInstanced.instanceColor) lowerEpiInstanced.instanceColor.needsUpdate = true;
    lowerEpiInstanced.computeBoundingSphere();
    bottomLayerGroup.add(lowerEpiInstanced);
    clickableMeshes.push(lowerEpiInstanced);

    // Plump Sculpted Kidney-Shaped 3D Guard Cell Pairs + Internal Guard Chloroplasts + Substomatal Cavity!
    const guardCellMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x22c55e,
        bumpMap: cellularBumpTex,
        bumpScale: 0.02,
        emissive: new THREE.Color(0x15803d),
        emissiveIntensity: 0.25,
        roughness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12,
      })
    );
    const guardChloroMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x86efac,
        emissive: new THREE.Color(0x22c55e),
        emissiveIntensity: 0.45,
        roughness: 0.25,
      })
    );
    const guardKidneyGeo = trackGeo(createKidneyGuardCellGeometry());
    const guardDotGeo = trackGeo(new THREE.SphereGeometry(0.028, 8, 6));
    const stomaPairs: Array<{ left: THREE.Group; right: THREE.Group; ring: THREE.Mesh }> = [];
    const stomaRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.48,
        side: THREE.DoubleSide,
      })
    );
    const substomatalMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x052e16,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      })
    );

    for (const [sx, sz] of stomaCenters) {
      const pairGroup = new THREE.Group();
      pairGroup.position.set(sx, -1.36, sz);

      // Left Kidney Guard Cell Group (sculpted bean + 3 embedded chloroplasts)
      const leftGuardGroup = new THREE.Group();
      const leftGuardMesh = new THREE.Mesh(guardKidneyGeo, guardCellMat);
      leftGuardMesh.userData.partId = 'stomata';
      leftGuardGroup.add(leftGuardMesh);
      for (const gz of [-0.12, 0, 0.12]) {
        const dot = new THREE.Mesh(guardDotGeo, guardChloroMat);
        dot.position.set(-0.155, -0.055, gz);
        leftGuardGroup.add(dot);
      }

      // Right Kidney Guard Cell Group (mirrored bean + 3 embedded chloroplasts)
      const rightGuardGroup = new THREE.Group();
      const rightGuardMesh = new THREE.Mesh(guardKidneyGeo, guardCellMat);
      rightGuardMesh.scale.x = -1;
      rightGuardMesh.userData.partId = 'stomata';
      rightGuardGroup.add(rightGuardMesh);
      for (const gz of [-0.12, 0, 0.12]) {
        const dot = new THREE.Mesh(guardDotGeo, guardChloroMat);
        dot.position.set(0.155, -0.055, gz);
        rightGuardGroup.add(dot);
      }

      // Dark recessed substomatal air cavity shadow disc behind the pore
      const cavity = new THREE.Mesh(
        trackGeo(new THREE.CircleGeometry(0.24, 24)),
        substomatalMat
      );
      cavity.rotation.x = Math.PI / 2;
      cavity.position.y = 0.05;
      cavity.userData.partId = 'stomata';

      const poreRing = new THREE.Mesh(
        trackGeo(new THREE.RingGeometry(0.32, 0.365, 32)),
        stomaRingMat
      );
      poreRing.rotation.x = Math.PI / 2;
      poreRing.position.y = -0.085;
      poreRing.userData.partId = 'stomata';

      pairGroup.add(leftGuardGroup, rightGuardGroup, cavity, poreRing);
      bottomLayerGroup.add(pairGroup);
      clickableMeshes.push(leftGuardMesh, rightGuardMesh, cavity, poreRing);
      stomaPairs.push({ left: leftGuardGroup, right: rightGuardGroup, ring: poreRing });
    }

    // ==================== 6. REALISTIC 3D MOLECULAR FLOWS & SOFT VOLUMETRIC SUNBEAMS ====================
    // A. Golden Sunlight Photons & Soft Gradient Volumetric Canopy Beams
    const PHOTON_COUNT = 26;
    const photonMat = trackMat(
      new THREE.MeshBasicMaterial({ color: 0xfef9c3, transparent: true, opacity: 0.95 })
    );
    const photonInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.058, 12, 10)),
      photonMat,
      PHOTON_COUNT
    );
    photonInstanced.frustumCulled = false;
    leafRoot.add(photonInstanced);

    const sunBeamMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        alphaMap: sunbeamAlphaTex,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    const sunBeams: THREE.Mesh[] = [];
    for (let b = -1.5; b <= 1.7; b += 1.05) {
      const beam = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.22, 0.62, 3.4, 18, 1, true)),
        sunBeamMat
      );
      beam.position.set(b, 2.85, 0);
      beam.rotation.z = -0.22;
      leafRoot.add(beam);
      sunBeams.push(beam);
    }

    // B. Glistening Translucent Xylem Water (H₂O) Droplets
    const WATER_COUNT = 34;
    const waterMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: new THREE.Color(0x0284c7),
        emissiveIntensity: 0.55,
        roughness: 0.06,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
      })
    );
    const waterInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.062, 12, 10)),
      waterMat,
      WATER_COUNT
    );
    waterInstanced.frustumCulled = false;
    leafRoot.add(waterInstanced);

    // C. Faceted Hexagonal Phloem Glucose (C₆H₁₂O₆) Crystals
    const GLUCOSE_COUNT = 26;
    const glucoseMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        emissive: new THREE.Color(0xd97706),
        emissiveIntensity: 0.62,
        roughness: 0.14,
        metalness: 0.12,
        clearcoat: 0.9,
      })
    );
    const glucoseGeo = trackGeo(new THREE.CylinderGeometry(0.078, 0.078, 0.048, 6));
    const glucoseInstanced = new THREE.InstancedMesh(
      glucoseGeo,
      glucoseMat,
      GLUCOSE_COUNT
    );
    glucoseInstanced.frustumCulled = false;
    leafRoot.add(glucoseInstanced);

    // D. Glossy Violet CO₂ Gas Molecules entering through the Lower Stomata
    const CO2_COUNT = 27;
    const co2Mat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xc4b5fd,
        emissive: new THREE.Color(0x7c3aed),
        emissiveIntensity: 0.65,
        roughness: 0.18,
        clearcoat: 0.85,
      })
    );
    const co2Geo = trackGeo(new THREE.CapsuleGeometry(0.042, 0.068, 6, 10));
    co2Geo.rotateZ(Math.PI / 2);
    const co2Instanced = new THREE.InstancedMesh(co2Geo, co2Mat, CO2_COUNT);
    co2Instanced.frustumCulled = false;
    leafRoot.add(co2Instanced);

    // E. Pearlescent Iridescent O₂ Oxygen Gas Bubbles produced in Palisade Chloroplasts
    const O2_COUNT = 30;
    const o2Mat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: new THREE.Color(0x06b6d4),
        emissiveIntensity: 0.65,
        roughness: 0.05,
        clearcoat: 1.0,
        iridescence: 0.65,
      })
    );
    const o2Instanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.064, 14, 12)),
      o2Mat,
      O2_COUNT
    );
    o2Instanced.frustumCulled = false;
    leafRoot.add(o2Instanced);

    // ==================== 7. 3D RAYCAST INTERACTION ====================
    let pointerDown = { x: 0, y: 0 };
    let lastHover = 0;

    const getHitPart = (cx: number, cy: number): LeafPartId | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((cy - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length === 0) return null;
      return (hits[0].object.userData?.partId as LeafPartId) || null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDown = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHover < 55) return;
      lastHover = now;
      renderer.domElement.style.cursor = getHitPart(e.clientX, e.clientY) ? 'pointer' : 'grab';
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) > 6) return;
      const part = getHitPart(e.clientX, e.clientY);
      if (!part) return;

      setSelectedPart(part);
      const m = computePhotosynthesisMetrics(
        lightRef.current,
        co2Ref.current,
        tempRef.current,
        stomataRef.current
      );

      if (part === 'stomata') {
        setStomataOpen((prev) => {
          const next = !prev;
          setInteractionHint(
            next
              ? '3D Guard cells swelled OPEN — CO₂ now diffuses freely through the lower stomata!'
              : '3D Guard cells pinched CLOSED — CO₂ entry restricted!'
          );
          return next;
        });
      } else if (part === 'palisade') {
        setInteractionHint(
          `Palisade Chloroplasts — Output: ${m.bubblesPerMin} O₂ bubbles/min (Limiting: ${m.limitingFactor})`
        );
      } else if (part === 'xylem') {
        setInteractionHint(
          '3D Xylem Vessels (Blue Lignified Tubes) — transporting H₂O & mineral ions into the mesophyll.'
        );
      } else if (part === 'phloem') {
        setInteractionHint(
          `3D Phloem Sieve Tubes (Golden Tubes) — translocating ${m.glucoseMgHr.toFixed(1)} mg/hr of sucrose.`
        );
      } else if (part === 'cuticle') {
        setInteractionHint(
          'Waxy Cuticle & Upper Epidermis — transparent top barrier transmitting photons to chloroplasts.'
        );
      } else if (part === 'spongy') {
        setInteractionHint(
          'Spongy Mesophyll & 3D Air Channels — circulating CO₂ and O₂ gas molecules.'
        );
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!mountEl) return;
      const nw = Math.max(mountEl.clientWidth, 280);
      const nh = Math.max(mountEl.clientHeight, 320);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObserver.observe(mountEl);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let disposed = false;
    let frameId = 0;
    const clock = new THREE.Clock();

    let dampedLight = lightRef.current;
    let dampedCo2 = co2Ref.current;
    let dampedTemp = tempRef.current;
    let dampedAperture = stomataRef.current ? 1 : 0;
    let dampedExplode = explodeRef.current;

    let photonPhase = 0;
    let waterPhase = 0;
    let glucosePhase = 0;
    let co2Phase = 0;
    let o2Phase = 0;

    function computeProjectedLabels(explodeAmt: number): ProjectedLabel[] {
      if (!showLabelsRef.current) return [];
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      if (w <= 0 || h <= 0) return [];
      const out: ProjectedLabel[] = [];
      for (const spec of LABEL_3D_SPECS) {
        _vProj.set(
          spec.basePos[0],
          spec.basePos[1] + spec.explodeFactor * explodeAmt,
          spec.basePos[2]
        );
        _vProj.applyMatrix4(leafRoot.matrixWorld);
        _vProj.project(camera);
        if (_vProj.z > 1 || _vProj.z < -1) continue;
        const ax = (_vProj.x * 0.5 + 0.5) * w;
        const ay = (-_vProj.y * 0.5 + 0.5) * h;
        const lx = Math.max(105, Math.min(w - 105, ax + spec.offsetX));
        const ly = Math.max(24, Math.min(h - 24, ay + spec.offsetY));
        out.push({
          id: spec.id,
          partId: spec.partId,
          text: spec.text,
          subText: spec.subText,
          ax,
          ay,
          lx,
          ly,
          accentHex: spec.accentHex,
        });
      }
      return out;
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      const targetBg = darkModeRef.current ? bgDark : bgLight;
      scene.background = targetBg;
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(targetBg);
      }

      // Guided Watch Lesson 60fps Timeline Progression
      if (watchLessonRef.current && !lessonPausedRef.current) {
        const nextT = Math.min(LESSON_DURATION_SEC, lessonTimeRef.current + delta * lessonSpeedRef.current);
        lessonTimeRef.current = nextT;
        const ch = getPhotoLessonChapter(nextT);
        if (ch.id !== lastChapterIdRef.current) {
          lastChapterIdRef.current = ch.id;
          const spec = PHOTOSYNTHESIS_STEPS[ch.stepIdx] || PHOTOSYNTHESIS_STEPS[0];
          setActiveStepIdx(ch.stepIdx);
          setSelectedPart(spec.focusPart);
          setLightPct(ch.lightPct);
          setCo2Pct(ch.co2Pct);
          setTempC(ch.tempC);
          setStomataOpen(ch.stomataOpen);
          setExplodeLayers(ch.explodeLayers);
          desiredCamPosRef.current = [...spec.cameraPos];
          desiredCamTargetRef.current = [...spec.cameraTarget];
        }
        const nowLesson = performance.now();
        if (nowLesson - lastLessonUiPushRef.current > 70) {
          lastLessonUiPushRef.current = nowLesson;
          setLessonTime(nextT);
        }
        if (nextT >= LESSON_DURATION_SEC) {
          lessonPausedRef.current = true;
          setLessonPaused(true);
          setLessonTime(LESSON_DURATION_SEC);
        }
      }

      // Smooth camera transition to step or 360° preset
      if (desiredCamPosRef.current && desiredCamTargetRef.current) {
        _vCamPos.set(...desiredCamPosRef.current);
        _vCamTarget.set(...desiredCamTargetRef.current);
        camera.position.lerp(_vCamPos, 1 - Math.exp(-5.5 * delta));
        controls.target.lerp(_vCamTarget, 1 - Math.exp(-6.5 * delta));
        if (
          camera.position.distanceTo(_vCamPos) < 0.05 &&
          controls.target.distanceTo(_vCamTarget) < 0.03
        ) {
          desiredCamPosRef.current = null;
          desiredCamTargetRef.current = null;
        }
      }

      controls.autoRotate = !isSoftwareGl && autoRotateRef.current && !watchLessonRef.current;
      controls.autoRotateSpeed = 1.6;

      dampedLight = THREE.MathUtils.damp(dampedLight, lightRef.current, 6, delta);
      dampedCo2 = THREE.MathUtils.damp(dampedCo2, co2Ref.current, 6, delta);
      dampedTemp = THREE.MathUtils.damp(dampedTemp, tempRef.current, 6, delta);
      dampedAperture = THREE.MathUtils.damp(dampedAperture, stomataRef.current ? 1 : 0, 8, delta);
      dampedExplode = THREE.MathUtils.damp(dampedExplode, explodeRef.current, 7, delta);

      const live = computePhotosynthesisMetrics(
        dampedLight,
        dampedCo2,
        dampedTemp,
        dampedAperture > 0.4
      );
      const rate = live.normalizedRate;
      const lightFrac = dampedLight / 100;
      const heatStress = THREE.MathUtils.clamp((dampedTemp - 37) / 8, 0, 1);

      // Exploded 3D Layer separation
      topLayerGroup.position.y = dampedExplode * 1.15;
      palisadeLayerGroup.position.y = dampedExplode * 0.42;
      spongyLayerGroup.position.y = -dampedExplode * 0.32;
      bottomLayerGroup.position.y = -dampedExplode * 1.05;

      // Sunlight, subsurface transmitted chlorophyll glow, & soft canopy beams
      sunDirLight.intensity = 0.72 + lightFrac * 2.15;
      subsurfaceLight.intensity = 0.35 + lightFrac * 0.85;
      sunBeamMat.opacity = lightFrac * (darkModeRef.current ? 0.22 : 0.14);
      sunBeams.forEach((b) => {
        b.visible = lightFrac > 0.04;
      });

      // Animate 3D Chloroplasts (authentic cytoplasmic streaming / cyclosis around palisade wall + heat stress tint)
      _colorDummy.setHSL(
        THREE.MathUtils.lerp(0.35, 0.13, heatStress),
        THREE.MathUtils.lerp(0.45, 0.55, heatStress),
        THREE.MathUtils.lerp(0.95, 0.65, heatStress)
      );
      chloroMat.color.copy(_colorDummy);
      chloroMat.emissiveIntensity = (0.1 + rate * 0.48) * (1 - heatStress * 0.72);

      const streamSpeed = 0.25 + rate * 0.9;
      for (let i = 0; i < chloroplastsBase.length; i++) {
        const c = chloroplastsBase[i];
        const ang = c.angle + elapsed * c.speed * streamSpeed;
        const px = c.cx + Math.cos(ang) * c.radius;
        const pz = c.cz + Math.sin(ang) * c.radius;
        const py = c.cy + c.yOff + Math.sin(elapsed * (1.2 + rate * 2.2) + i * 0.6) * 0.025;
        _posDummy.set(px, py, pz);
        _eulerDummy.set(0.18 * Math.sin(elapsed + i), -ang + Math.PI * 0.5, 0.12 * Math.cos(elapsed + i));
        _quatDummy.setFromEuler(_eulerDummy);
        _scaleDummy.setScalar(0.95 + rate * 0.14);
        _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
        chloroInstanced.setMatrixAt(i, _matDummy);
      }
      chloroInstanced.instanceMatrix.needsUpdate = true;

      // Animate Plump 3D Kidney Guard Cells on the underside of the leaf (turgid bowing apart vs flaccid closing)
      const gap = THREE.MathUtils.lerp(0.015, 0.13, dampedAperture);
      const swellX = THREE.MathUtils.lerp(0.86, 1.15, dampedAperture);
      const swellY = THREE.MathUtils.lerp(0.88, 1.18, dampedAperture);
      for (const pair of stomaPairs) {
        pair.left.position.x = -gap;
        pair.right.position.x = gap;
        pair.left.scale.set(swellX, swellY, 1.0);
        pair.right.scale.set(swellX, swellY, 1.0);
      }
      guardCellMat.emissiveIntensity = 0.15 + dampedAperture * 0.4;

      // 1. Sunlight Photons descending through Cuticle & Upper Epidermis into Palisade Cells
      photonPhase = (photonPhase + delta * (0.3 + lightFrac * 0.95)) % 1;
      for (let i = 0; i < PHOTON_COUNT; i++) {
        const t = (i / PHOTON_COUNT + photonPhase) % 1;
        const col = i % 7;
        const row = Math.floor(i / 7) % 4;
        const x = -1.8 + col * 0.62 + (1 - t) * 0.45;
        const z = -1.0 + row * 0.66;
        const y = THREE.MathUtils.lerp(3.2 + dampedExplode, 0.55 + dampedExplode * 0.4, t);
        _posDummy.set(x, y, z);
        _quatDummy.identity();
        const sc = lightFrac > 0.04 ? (0.55 + lightFrac * 0.75) * Math.sin(t * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
        photonInstanced.setMatrixAt(i, _matDummy);
      }
      photonInstanced.instanceMatrix.needsUpdate = true;

      // 2. Xylem Water (H₂O) flowing along Z-axis through Xylem Tubes & branching right into Palisade
      waterPhase = (waterPhase + delta * (0.25 + dampedAperture * 0.45 + rate * 0.55)) % 1;
      for (let i = 0; i < WATER_COUNT; i++) {
        const t = (i / WATER_COUNT + waterPhase) % 1;
        const tubeChoice = i % 3;
        const [tx, ty] = xylemOffsets[tubeChoice];
        let x = tx;
        let y = ty;
        let z = THREE.MathUtils.lerp(-1.6, 1.6, t);
        // Half of water droplets branch out into palisade mesophyll after t > 0.45
        if (i % 2 === 0 && t > 0.45) {
          const bt = (t - 0.45) / 0.55;
          x = THREE.MathUtils.lerp(tx, 0.2 + (i % 5) * 0.45, bt);
          y = THREE.MathUtils.lerp(ty, 0.75 + dampedExplode * 0.4, bt);
        }
        _posDummy.set(x, y, z);
        _quatDummy.identity();
        _scaleDummy.setScalar(0.8 + rate * 0.35);
        _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
        waterInstanced.setMatrixAt(i, _matDummy);
      }
      waterInstanced.instanceMatrix.needsUpdate = true;

      // 3. Phloem Glucose (C₆H₁₂O₆) synthesized in Palisade & flowing down Phloem Sieve Tubes
      glucosePhase = (glucosePhase + delta * (0.12 + rate * 0.92)) % 1;
      for (let i = 0; i < GLUCOSE_COUNT; i++) {
        const t = (i / GLUCOSE_COUNT + glucosePhase) % 1;
        const tubeChoice = i % 3;
        const [px, py] = phloemOffsets[tubeChoice];
        let x: number;
        let y: number;
        let z: number;
        if (t < 0.35) {
          const bt = t / 0.35;
          x = THREE.MathUtils.lerp(0.6 + (i % 4) * 0.4, px, bt);
          y = THREE.MathUtils.lerp(0.65 + dampedExplode * 0.4, py, bt);
          z = THREE.MathUtils.lerp(-0.8 + (i % 5) * 0.4, 0.4, bt);
        } else {
          const bt = (t - 0.35) / 0.65;
          x = px;
          y = py;
          z = THREE.MathUtils.lerp(0.6, -1.6, bt);
        }
        _posDummy.set(x, y, z);
        _eulerDummy.set(elapsed * 2 + i, elapsed * 1.5, 0);
        _quatDummy.setFromEuler(_eulerDummy);
        const sc = rate > 0.03 ? (0.55 + rate * 0.75) * Math.sin(Math.max(0.08, Math.min(0.95, t)) * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
        glucoseInstanced.setMatrixAt(i, _matDummy);
      }
      glucoseInstanced.instanceMatrix.needsUpdate = true;

      // 4. CO₂ Molecules entering from underneath through the 3D Stomatal Pores into Spongy & Palisade
      const co2Flow = (dampedCo2 / 100) * (0.12 + dampedAperture * 0.88);
      co2Phase = (co2Phase + delta * (0.2 + co2Flow * 0.85)) % 1;
      for (let i = 0; i < CO2_COUNT; i++) {
        const t = (i / CO2_COUNT + co2Phase) % 1;
        const stomaIdx = i % stomaCenters.length;
        const [sx, sz] = stomaCenters[stomaIdx];
        const spreadX = ((i % 5) - 2) * 0.25;
        const spreadZ = ((i % 3) - 1) * 0.25;
        let x: number;
        let y: number;
        let z: number;

        if (dampedAperture < 0.28) {
          // Stomata closed: CO2 hovers below the lower epidermis
          x = sx + spreadX + Math.sin(elapsed * 2 + i) * 0.08;
          y = -2.1 - dampedExplode + Math.sin(t * Math.PI) * 0.45;
          z = sz + spreadZ;
        } else {
          if (t < 0.4) {
            const p = t / 0.4;
            x = THREE.MathUtils.lerp(sx + spreadX * 0.8, sx, p);
            y = THREE.MathUtils.lerp(-2.25 - dampedExplode, -1.35 - dampedExplode, p);
            z = THREE.MathUtils.lerp(sz + spreadZ * 0.8, sz, p);
          } else {
            const p = (t - 0.4) / 0.6;
            x = THREE.MathUtils.lerp(sx, sx + spreadX * 1.6, p);
            y = THREE.MathUtils.lerp(-1.35 - dampedExplode, 0.72 + dampedExplode * 0.3, p);
            z = THREE.MathUtils.lerp(sz, sz + spreadZ * 1.8, p);
          }
        }
        _posDummy.set(x, y, z);
        _quatDummy.identity();
        const sc = dampedCo2 > 3 ? (0.55 + (dampedCo2 / 100) * 0.55) * Math.sin(t * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
        co2Instanced.setMatrixAt(i, _matDummy);
      }
      co2Instanced.instanceMatrix.needsUpdate = true;

      // 5. O₂ Oxygen Bubbles produced in Palisade Chloroplasts & escaping out
      o2Phase = (o2Phase + delta * (0.18 + rate * 1.25)) % 1;
      for (let i = 0; i < O2_COUNT; i++) {
        const t = (i / O2_COUNT + o2Phase) % 1;
        const activeBubble = i < Math.ceil(rate * O2_COUNT);
        const stomaIdx = i % stomaCenters.length;
        const [sx, sz] = stomaCenters[stomaIdx];
        const startX = -0.6 + (i % 6) * 0.5;
        const startZ = -0.9 + (i % 4) * 0.6;
        // Half diffuse out through bottom stomata, half rise above the leaf for clear visibility
        const goDownStoma = i % 2 === 0 && dampedAperture > 0.3;
        const x = goDownStoma
          ? THREE.MathUtils.lerp(startX, sx, t)
          : startX + Math.sin(elapsed * 2 + i) * 0.1;
        const y = goDownStoma
          ? THREE.MathUtils.lerp(0.75, -2.2 - dampedExplode, t)
          : THREE.MathUtils.lerp(0.75, 2.55 + dampedExplode, t);
        const z = goDownStoma ? THREE.MathUtils.lerp(startZ, sz, t) : startZ;

        _posDummy.set(x, y, z);
        _quatDummy.identity();
        const sc = activeBubble && rate > 0.03 ? (0.58 + rate * 0.65) * Math.sin(t * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_posDummy, _quatDummy, _scaleDummy);
        o2Instanced.setMatrixAt(i, _matDummy);
      }
      o2Instanced.instanceMatrix.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastLabelPushRef.current > 40) {
        lastLabelPushRef.current = now;
        setProjectedLabels(computeProjectedLabels(dampedExplode));
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.removeEventListener('start', cancelScriptedCamera);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

  const handleResetOptimal = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setAutoPlaySteps(false);
    setLightPct(85);
    setCo2Pct(80);
    setTempC(30);
    setStomataOpen(true);
    setExplodeLayers(0);
    handleSelectCameraPreset('iso360');
    setInteractionHint('Reset to optimal 3D 360° photosynthetic conditions (85% Light, 80% CO₂, 30°C).');
  };

  const rateCurvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let l = 0; l <= 100; l += 4) {
      const m = computePhotosynthesisMetrics(l, co2Pct, tempC, stomataOpen);
      const x = 30 + (l / 100) * 196;
      const y = 96 - (m.bubblesPerMin / 64) * 82;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [co2Pct, tempC, stomataOpen]);

  const ceilingCurvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let l = 0; l <= 100; l += 5) {
      const m = computePhotosynthesisMetrics(l, 95, 30, true);
      const x = 30 + (l / 100) * 196;
      const y = 96 - (m.bubblesPerMin / 64) * 82;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  const surfaceBg = darkMode ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f1f5f9] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#151d30] border-white/[0.1] text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const dockBg = darkMode
    ? 'bg-[#101726] border-white/[0.14] text-slate-100'
    : 'bg-white border-slate-300 text-slate-900 shadow-md';

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border overflow-hidden flex flex-col ${surfaceBg} ${
        darkMode ? 'border-white/[0.08]' : 'border-slate-200 shadow-sm'
      } ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-0 h-screen' : ''}`}
    >
      {/* TOP TOOLBAR: 360° Controls, Step-by-Step Toggle, Labels, Stomata & Syllabus Level */}
      <div
        className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
          darkMode ? 'bg-[#0f1626] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleWatchLesson}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              watchLessonActive
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : darkMode
                ? 'bg-white text-slate-950 hover:bg-slate-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {watchLessonActive ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{watchLessonActive ? 'Exit lesson' : 'Watch lesson (1:05)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWatchLessonActive(false);
              const next = !stepModeActive;
              setStepModeActive(next);
              if (next) handleSelectStep(activeStepIdx);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 border ${
              stepModeActive && !watchLessonActive
                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-slate-200 hover:bg-white/[0.1]'
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Step-by-Step ({activeStepIdx + 1}/5)</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate360((p) => !p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              autoRotate360
                ? 'bg-sky-500 border-sky-400 text-slate-950'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-sky-300 hover:bg-white/[0.1]'
                : 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>360° Orbit {autoRotate360 ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels((p) => !p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              showLabels
                ? darkMode
                  ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-500/60 text-emerald-800'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>3D Labels {showLabels ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => setStomataOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              stomataOpen
                ? darkMode
                  ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-500/50 text-emerald-800'
                : darkMode
                ? 'bg-amber-500/15 border-amber-400/50 text-amber-300'
                : 'bg-amber-50 border-amber-500/50 text-amber-800'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Stomata: {stomataOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          <button
            type="button"
            onClick={() => setChallengeIdx((prev) => (prev === null ? 0 : null))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeChallenge
                ? 'bg-amber-400 border-amber-300 text-slate-950'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-amber-300 hover:bg-white/[0.1]'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeChallenge ? 'Exit Challenge' : 'Lab Challenge'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`inline-flex items-center p-0.5 rounded-lg border text-xs ${
              darkMode ? 'bg-[#171f32] border-white/[0.1]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setLevel('o_level')}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors whitespace-nowrap ${
                level === 'o_level'
                  ? darkMode
                    ? 'bg-white text-slate-950'
                    : 'bg-slate-900 text-white'
                  : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              O-Level
            </button>
            <button
              type="button"
              onClick={() => setLevel('a_level')}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors whitespace-nowrap ${
                level === 'a_level'
                  ? darkMode
                    ? 'bg-white text-slate-950'
                    : 'bg-slate-900 text-white'
                  : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A-Level
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen 3D view'}
            className={`p-2 rounded-lg border cursor-pointer transition-colors ${
              darkMode
                ? 'bg-[#171f32] border-white/[0.1] text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* STEP-BY-STEP PROGRESS BAR (5 Interactive Steps) */}
      <div
        className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 ${
          darkMode ? 'bg-[#101829] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {PHOTOSYNTHESIS_STEPS.map((st, idx) => {
            const isCurrent = activeStepIdx === idx;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shrink-0 border ${
                  isCurrent
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-xs'
                    : darkMode
                    ? 'bg-[#172033] border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {st.shortTitle}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleSelectStep(activeStepIdx - 1)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${
              darkMode
                ? 'bg-[#172033] border-white/[0.1] text-slate-200 hover:bg-[#1e2942]'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStepModeActive(true);
              setAutoPlaySteps((p) => !p);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
              autoPlaySteps
                ? 'bg-amber-400 text-slate-950'
                : darkMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {autoPlaySteps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{autoPlaySteps ? 'Pause Steps' : 'Auto-Play Steps'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectStep(activeStepIdx + 1)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${
              darkMode
                ? 'bg-[#172033] border-white/[0.1] text-slate-200 hover:bg-[#1e2942]'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: 3D 360° Leaf Cutaway Viewport (7 cols) & Step-by-Step Illustrated Deck (5 cols) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D 360° LEAF VIEWPORT */}
        <div
          className={`lg:col-span-7 relative flex flex-col overflow-hidden ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[440px] sm:h-[540px] lg:h-[620px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Top-Left Particle Legend */}
          <div
            className={`pointer-events-none absolute left-3 top-3 px-3 py-2 rounded-xl border text-[11px] font-bold space-y-1 ${
              darkMode
                ? 'bg-[#0f1626] border-white/[0.12] text-slate-200'
                : 'bg-white border-slate-300 text-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <span>Sunlight photons (hν)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>H₂O in (Blue Xylem)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span>CO₂ in (Lower Stomata)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
              <span>O₂ gas bubbles out</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Glucose out (Phloem)</span>
            </div>
          </div>

          {/* Top-Right 360° Camera Angle Quick Switcher */}
          <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1 max-w-[260px]">
            {(
              [
                ['iso360', '360° View'],
                ['front', 'Front'],
                ['underside', 'Bottom Stomata'],
                ['vascular', 'Xylem/Phloem'],
                ['top', 'Top Cuticle'],
              ] as Array<[CameraPresetId, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectCameraPreset(id)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer transition-colors ${
                  cameraPreset === id
                    ? 'bg-sky-500 border-sky-300 text-slate-950'
                    : darkMode
                    ? 'bg-[#0f1626] border-white/[0.14] text-slate-200 hover:border-sky-400'
                    : 'bg-white border-slate-300 text-slate-800 hover:border-sky-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 3D-to-2D Projected Callout Leader Lines & Interactive Anatomy Tags */}
          {showLabels && projectedLabels.length > 0 && (
            <svg className="pointer-events-none absolute inset-0 w-full h-full overflow-visible">
              {projectedLabels.map((lbl) => (
                <g key={lbl.id}>
                  <line
                    x1={lbl.ax}
                    y1={lbl.ay}
                    x2={lbl.lx}
                    y2={lbl.ly}
                    stroke={lbl.accentHex}
                    strokeWidth="1.6"
                  />
                  <circle cx={lbl.ax} cy={lbl.ay} r="3.5" fill={lbl.accentHex} />
                </g>
              ))}
            </svg>
          )}
          {showLabels &&
            projectedLabels.map((lbl) => {
              const isSelected = selectedPart === lbl.partId;
              return (
                <button
                  key={`tag-${lbl.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedPart(lbl.partId);
                    if (lbl.partId === 'stomata') {
                      setStomataOpen((prev) => !prev);
                    }
                  }}
                  style={{
                    left: `${lbl.lx}px`,
                    top: `${lbl.ly}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute px-2.5 py-1 rounded-lg text-left shadow-xs border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                      : darkMode
                      ? 'bg-[#0f1626] border-white/[0.18] text-white hover:border-emerald-400'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-emerald-500'
                  }`}
                >
                  <div className="text-[11px] font-extrabold whitespace-nowrap leading-tight">
                    {lbl.text}
                  </div>
                  <div
                    className={`text-[9.5px] font-semibold whitespace-nowrap leading-tight ${
                      isSelected ? 'text-slate-900' : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {lbl.subText}
                  </div>
                </button>
              );
            })}

          {/* Guided Watch Lesson Caption Banner */}
          {watchLessonActive && (
            <div className="pointer-events-none absolute bottom-10 inset-x-4 flex justify-center">
              <div
                className={`max-w-xl px-4 py-2.5 rounded-2xl border text-center shadow-lg ${
                  darkMode
                    ? 'bg-[#0f1626]/95 border-emerald-400/50 text-white'
                    : 'bg-white/95 border-emerald-500/50 text-slate-900'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                  Lesson Chapter {activeLessonChapter.id} of {PHOTO_LESSON_CHAPTERS.length} ·{' '}
                  {activeLessonChapter.title}
                </div>
                <p className="text-xs sm:text-sm font-bold mt-0.5 leading-snug">
                  {level === 'o_level' ? activeLessonChapter.oCaption : activeLessonChapter.aCaption}
                </p>
              </div>
            </div>
          )}

          {/* Click Feedback Toast */}
          {interactionHint && !watchLessonActive && (
            <div className="pointer-events-none absolute bottom-10 inset-x-4 flex justify-center">
              <div
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold shadow-sm ${
                  darkMode
                    ? 'bg-[#0f1626] border-emerald-400/50 text-emerald-200'
                    : 'bg-white border-emerald-500/60 text-emerald-900'
                }`}
              >
                {interactionHint}
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-2 inset-x-0 text-center">
            <span
              className={`text-[11px] font-semibold px-3 py-0.5 rounded-md border ${
                darkMode
                  ? 'text-slate-300 bg-[#0f1626] border-white/10'
                  : 'text-slate-700 bg-white border-slate-200'
              }`}
            >
              Drag anywhere to rotate 360° (including under the leaf) · Scroll/Pinch to zoom · Click any 3D layer
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: STEP-BY-STEP DETAILED ILLUSTRATION DECK & LIVE METRICS (5 cols) */}
        <aside
          className={`lg:col-span-5 border-t lg:border-t-0 lg:border-l p-4 sm:p-5 flex flex-col justify-between gap-3.5 lg:max-h-[620px] overflow-y-auto ${
            darkMode ? 'bg-[#101726] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3.5">
            {/* STEP-BY-STEP ILLUSTRATED CARD */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  Step {currentStep.stepNumber} of 5 · Interactive Breakdown
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    darkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {currentStep.equationBadge}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black leading-snug">
                {currentStep.title}
              </h3>

              {/* Detailed Scientific SVG Schematic for the Current Step */}
              <StepDetailedIllustration
                stepNumber={currentStep.stepNumber}
                darkMode={darkMode}
                stomataOpen={stomataOpen}
                lightPct={lightPct}
                co2Pct={co2Pct}
                rate={metrics.normalizedRate}
              />

              <p className={`text-xs leading-relaxed font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {level === 'o_level' ? currentStep.oDescription : currentStep.aDescription}
              </p>

              {/* Unboxed Metadata Key Structures */}
              <div className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="font-bold text-emerald-500">Key structures: </span>
                {currentStep.keyStructures.join(' · ')}
              </div>
            </div>

            {/* Live Rate & Limiting Factor Readout */}
            <div className={`p-3.5 rounded-xl border ${cardBg}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                    {metrics.bubblesPerMin}
                  </span>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    O₂ bubbles/min
                  </span>
                </div>
                <div className="text-xs font-bold tabular-nums">
                  Glucose export: <span className="text-amber-500">{metrics.glucoseMgHr.toFixed(1)} mg/hr</span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <span
                  className={`font-bold ${
                    metrics.denatured || !stomataOpen
                      ? 'text-rose-500'
                      : metrics.limitingFactor === 'Optimum Conditions'
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  }`}
                >
                  Limiting factor: {metrics.limitingFactor}
                </span>
                <span className={`text-[11px] tabular-nums ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Light {lightPct}% · CO₂ {co2Pct}% · {tempC}°C
                </span>
              </div>
            </div>

            {/* Interactive Lab Challenge Card */}
            {activeChallenge && (
              <div
                className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                  challengeSolved
                    ? darkMode
                      ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-100'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : darkMode
                    ? 'bg-amber-500/10 border-amber-400/40 text-amber-100'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-[11px]">
                    Challenge {(challengeIdx ?? 0) + 1} · {activeChallenge.title}
                  </span>
                  {challengeSolved && (
                    <span className="flex items-center gap-1 font-black text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Solved!
                    </span>
                  )}
                </div>
                <p className="font-bold leading-snug">{activeChallenge.prompt}</p>
                <p className="opacity-80 text-[11px]">{activeChallenge.hint}</p>
                {challengeSolved && (
                  <button
                    type="button"
                    onClick={() =>
                      setChallengeIdx((prev) =>
                        prev === null ? 0 : (prev + 1) % BIO_CHALLENGES.length
                      )
                    }
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    Next Lab Challenge →
                  </button>
                )}
              </div>
            )}

            {/* LIVE LIMITING FACTORS GRAPH (Rate vs Light Intensity) */}
            <div className={`p-3 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                  Rate vs Light Graph ({plottedPoints.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPlottedPoints((prev) => [
                        ...prev.slice(-7),
                        { id: Date.now(), light: lightPct, rate: metrics.bubblesPerMin, co2: co2Pct },
                      ])
                    }
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                      darkMode
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Plot Point</span>
                  </button>
                  {plottedPoints.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPlottedPoints([])}
                      title="Clear plotted readings"
                      className={`p-1 rounded-md cursor-pointer ${
                        darkMode ? 'text-slate-400 hover:text-rose-300' : 'text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <svg viewBox="0 0 240 104" className="w-full h-20">
                {[18, 44, 70, 96].map((y) => (
                  <line
                    key={y}
                    x1="30"
                    y1={y}
                    x2="226"
                    y2={y}
                    stroke={darkMode ? '#262d3f' : '#e2e8f0'}
                    strokeWidth="1"
                  />
                ))}
                <line x1="30" y1="10" x2="30" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />
                <line x1="30" y1="96" x2="228" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />

                <polyline
                  points={ceilingCurvePoints}
                  fill="none"
                  stroke={darkMode ? '#475569' : '#cbd5e1'}
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />

                <polyline
                  points={rateCurvePoints}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />

                {plottedPoints.map((pt) => (
                  <circle
                    key={pt.id}
                    cx={30 + (pt.light / 100) * 196}
                    cy={96 - (pt.rate / 64) * 82}
                    r="3.2"
                    fill="#38bdf8"
                    stroke={darkMode ? '#0f172a' : '#ffffff'}
                    strokeWidth="1.2"
                  />
                ))}

                <circle
                  cx={30 + (lightPct / 100) * 196}
                  cy={96 - (metrics.bubblesPerMin / 64) * 82}
                  r="4.8"
                  fill="#f59e0b"
                  stroke={darkMode ? '#ffffff' : '#0f172a'}
                  strokeWidth="1.8"
                />

                <text x="5" y="18" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">O₂</text>
                <text x="166" y="103" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8" fontWeight="700">
                  Light Intensity %
                </text>
              </svg>
            </div>
          </div>

          {/* BALANCED PHOTOSYNTHESIS EQUATION CARD */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode
                ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="font-mono font-bold">6CO₂ + 6H₂O —(Light &amp; Chlorophyll)→ C₆H₁₂O₆ + 6O₂</div>
          </div>
        </aside>
      </div>

      {/* UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK: Sunlight, CO2, Temperature, Explode 3D Layers & Reset */}
      <div
        className={`border-t transition-all ${
          darkMode ? 'border-white/[0.08] bg-[#0f1626]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex justify-center -mt-3">
          <button
            type="button"
            onClick={() => setDockCollapsed((p) => !p)}
            className={`px-3 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${dockBg}`}
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {!dockCollapsed && watchLessonActive && (
          <div className="px-4 py-3.5 max-w-5xl mx-auto space-y-2.5">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (lessonTime >= LESSON_DURATION_SEC - 0.1) {
                    handleScrubLesson(0);
                    setLessonPaused(false);
                  } else {
                    setLessonPaused((prev) => !prev);
                  }
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                  darkMode
                    ? 'bg-white text-slate-950 hover:bg-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                aria-label={lessonPaused ? 'Resume lesson' : 'Pause lesson'}
              >
                {lessonPaused ? (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                ) : (
                  <Pause className="w-4 h-4 fill-current" />
                )}
              </button>

              <span className="text-xs font-mono font-bold tabular-nums shrink-0 opacity-85">
                {formatLessonTime(lessonTime)} / {formatLessonTime(LESSON_DURATION_SEC)}
              </span>

              <div className="flex-1 min-w-[200px] grid grid-cols-5 gap-1.5 items-center">
                {PHOTO_LESSON_CHAPTERS.map((ch) => {
                  const span = ch.endSec - ch.startSec;
                  const fillPct =
                    Math.max(0, Math.min(1, (lessonTime - ch.startSec) / span)) * 100;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(
                          0,
                          Math.min(1, (e.clientX - rect.left) / rect.width)
                        );
                        handleScrubLesson(ch.startSec + ratio * span);
                      }}
                      title={`${ch.id}. ${ch.title}`}
                      className={`h-2.5 rounded-full overflow-hidden cursor-pointer relative ${
                        darkMode ? 'bg-white/[0.12]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-[width] duration-75"
                        style={{ width: `${fillPct}%` }}
                      />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleCycleLessonSpeed}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer shrink-0 ${
                  darkMode
                    ? 'bg-[#172033] border-white/[0.12] text-slate-200 hover:bg-[#222f4a]'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                {lessonSpeed}×
              </button>

              <button
                type="button"
                onClick={handleTakeOverFromLesson}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer shrink-0 transition-colors ${
                  darkMode
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/25'
                    : 'bg-emerald-50 border-emerald-400 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                Take over from here
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {PHOTO_LESSON_CHAPTERS.map((ch) => {
                const isCurrent = activeLessonChapter.id === ch.id;
                return (
                  <button
                    key={`chap-${ch.id}`}
                    type="button"
                    onClick={() => handleScrubLesson(ch.startSec + 0.1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold text-left truncate cursor-pointer transition-colors ${
                      isCurrent
                        ? darkMode
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : darkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {ch.id}. {ch.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!dockCollapsed && !watchLessonActive && (
          <div className="px-4 py-3 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 items-center text-xs">
              <label className="space-y-1">
                <div className="flex items-center justify-between font-bold tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sunlight</span>
                  </span>
                  <span className="text-amber-500">{lightPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={lightPct}
                  onChange={(e) => setLightPct(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="space-y-1">
                <div className="flex items-center justify-between font-bold tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-violet-500" />
                    <span>CO₂ Level</span>
                  </span>
                  <span className="text-violet-500">{co2Pct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={co2Pct}
                  onChange={(e) => setCo2Pct(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </label>

              <label className="space-y-1">
                <div className="flex items-center justify-between font-bold tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Temperature</span>
                  </span>
                  <span className={tempC >= 40 ? 'text-rose-500' : 'text-emerald-500'}>{tempC}°C</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={46}
                  step={1}
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="space-y-1">
                <div className="flex items-center justify-between font-bold tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Explode 3D Layers</span>
                  </span>
                  <span className="text-sky-400">{Math.round(explodeLayers * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={explodeLayers}
                  onChange={(e) => setExplodeLayers(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </label>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetOptimal}
                  className={`w-full sm:w-auto px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-[#172033] border-white/[0.12] text-slate-200 hover:bg-[#222f4a]'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 360°</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Photosynthesis3DSimulation;
