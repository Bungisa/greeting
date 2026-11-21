import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
import imgLeafCutawayStudio from '../assets/images/sim_photosynthesis_1795215064101.jpg';

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

interface LessonChapter {
  index: number;
  title: string;
  startSec: number;
  endSec: number;
  focusPart: LeafPartId;
  oCaption: string;
  aCaption: string;
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

interface LabelAnchorUV {
  id: string;
  partId: LeafPartId;
  text: string;
  u: number;
  v: number;
  offsetX: number;
  offsetY: number;
}

interface ProjectedLabel {
  id: string;
  partId: LeafPartId;
  text: string;
  ax: number;
  ay: number;
  lx: number;
  ly: number;
}

interface CubicSeg {
  p0: [number, number];
  p1: [number, number];
  p2: [number, number];
  p3: [number, number];
}

// 16:9 studio leaf cutaway plane dimensions in 3D world space
const PLANE_W = 9.6;
const PLANE_H = 5.4;

// 65-second (1:05) guided lesson for comfortable classroom reading & observation
const LESSON_DURATION_SEC = 65;

const LESSON_CHAPTERS: LessonChapter[] = [
  {
    index: 0,
    title: 'Sunlight & palisade cells',
    startSec: 0,
    endSec: 17,
    focusPart: 'palisade',
    oCaption:
      'Sunlight passes through the transparent upper epidermis and waxy cuticle straight into vertical palisade cells packed with green chloroplasts.',
    aCaption:
      'Photons penetrate the translucent cuticle and upper epidermis to excite chlorophyll a & b in the thylakoid membranes of palisade mesophyll chloroplasts.',
  },
  {
    index: 1,
    title: 'Stomata & xylem transport',
    startSec: 17,
    endSec: 34,
    focusPart: 'xylem',
    oCaption:
      'Guard cells swell to open the stoma underneath the leaf so CO₂ diffuses into air spaces, while the blue xylem vessel delivers water up the leaf vein.',
    aCaption:
      'Turgid guard cells widen the stomatal pore for CO₂ diffusion into spongy mesophyll spaces while transpiration pull supplies H₂O through lignified xylem.',
  },
  {
    index: 2,
    title: 'Making glucose & oxygen',
    startSec: 34,
    endSec: 50,
    focusPart: 'phloem',
    oCaption:
      'Inside chloroplasts, light energy combines CO₂ and water into glucose (exported down the golden phloem tube) and releases bright oxygen bubbles!',
    aCaption:
      'Photolysis releases O₂ while ATP and NADPH drive the Calvin cycle to synthesise triose phosphate, actively loaded as sucrose into phloem sieve tubes.',
  },
  {
    index: 3,
    title: 'Limiting factors & heat stress',
    startSec: 50,
    endSec: 65,
    focusPart: 'stomata',
    oCaption:
      'Too much heat (above 40°C) damages photosynthetic enzymes and wilts the leaf tissue, causing oxygen output to drop sharply!',
    aCaption:
      'Above ~40°C, thermal denaturation of Rubisco and photosynthetic enzymes collapses carbon fixation even when light and CO₂ remain abundant.',
  },
];

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
    hint: 'Click directly on the stoma opening at the bottom center of the leaf (or the Stomata button at top).',
    check: (l, _c, t, open) => !open && l >= 70 && t >= 25 && t <= 35,
  },
];

// Normalized UV coordinates (u: 0..1 left->right, v: 0..1 bottom->top) mapped precisely to the cutaway leaf image!
const PART_ANCHORS: Record<LeafPartId, { u: number; v: number }> = {
  overview: { u: 0.52, v: 0.52 },
  cuticle: { u: 0.49, v: 0.72 },
  palisade: { u: 0.62, v: 0.56 },
  spongy: { u: 0.69, v: 0.43 },
  xylem: { u: 0.36, v: 0.37 },
  phloem: { u: 0.455, v: 0.405 },
  stomata: { u: 0.514, v: 0.305 },
};

const CALLOUT_UV_ANCHORS: LabelAnchorUV[] = [
  { id: 'cuticle', partId: 'cuticle', text: 'Waxy cuticle & upper epidermis', u: 0.46, v: 0.725, offsetX: -115, offsetY: -42 },
  { id: 'palisade', partId: 'palisade', text: 'Palisade chloroplasts', u: 0.675, v: 0.58, offsetX: 118, offsetY: -28 },
  { id: 'spongy', partId: 'spongy', text: 'Spongy mesophyll & air spaces', u: 0.725, v: 0.445, offsetX: 120, offsetY: 14 },
  { id: 'xylem', partId: 'xylem', text: 'Xylem (H₂O & minerals in)', u: 0.345, v: 0.355, offsetX: -124, offsetY: -12 },
  { id: 'phloem', partId: 'phloem', text: 'Phloem (glucose out)', u: 0.445, v: 0.395, offsetX: -118, offsetY: 44 },
  { id: 'stomata', partId: 'stomata', text: 'Stoma & guard cells', u: 0.514, v: 0.305, offsetX: 98, offsetY: 54 },
];

// Xylem water flow paths (exact cyan tube + two upward vein branches into the mesophyll!)
const XYLEM_MAIN_SEGS: CubicSeg[] = [
  { p0: [0.258, 0.212], p1: [0.302, 0.275], p2: [0.348, 0.345], p3: [0.395, 0.415] },
  { p0: [0.395, 0.415], p1: [0.435, 0.456], p2: [0.478, 0.486], p3: [0.525, 0.512] },
];
const XYLEM_BRANCH_1: CubicSeg[] = [
  { p0: [0.258, 0.212], p1: [0.305, 0.282], p2: [0.350, 0.352], p3: [0.382, 0.405] },
  { p0: [0.382, 0.405], p1: [0.388, 0.440], p2: [0.384, 0.470], p3: [0.372, 0.495] },
];
const XYLEM_BRANCH_2: CubicSeg[] = [
  { p0: [0.258, 0.212], p1: [0.320, 0.300], p2: [0.385, 0.395], p3: [0.438, 0.456] },
  { p0: [0.438, 0.456], p1: [0.445, 0.482], p2: [0.445, 0.502], p3: [0.442, 0.520] },
];

// Phloem sucrose translocation path (exact amber sieve tube flowing DOWN & OUT from mesophyll!)
const PHLOEM_SEGS: CubicSeg[] = [
  { p0: [0.572, 0.504], p1: [0.535, 0.475], p2: [0.495, 0.442], p3: [0.456, 0.408] },
  { p0: [0.456, 0.408], p1: [0.435, 0.388], p2: [0.416, 0.372], p3: [0.402, 0.358] },
];

function evalCubic(seg: CubicSeg, t: number): [number, number] {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const x =
    mt2 * mt * seg.p0[0] +
    3 * mt2 * t * seg.p1[0] +
    3 * mt * t2 * seg.p2[0] +
    t2 * t * seg.p3[0];
  const y =
    mt2 * mt * seg.p0[1] +
    3 * mt2 * t * seg.p1[1] +
    3 * mt * t2 * seg.p2[1] +
    t2 * t * seg.p3[1];
  return [x, y];
}

function sampleUvPath(segs: CubicSeg[], tNorm: number): [number, number] {
  const clamped = ((tNorm % 1) + 1) % 1;
  const scaled = clamped * segs.length;
  const idx = Math.min(segs.length - 1, Math.floor(scaled));
  return evalCubic(segs[idx], scaled - idx);
}

// Module-scope reusable scratch math objects (zero per-frame GC allocations)
const _vProj = new THREE.Vector3();
const _vPos = new THREE.Vector3();
const _matDummy = new THREE.Matrix4();
const _quatDummy = new THREE.Quaternion();
const _scaleDummy = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _eulerDummy = new THREE.Euler();

/**
 * Biologically grounded Blackman's Law limiting-factors photosynthesis model
 * Returns rate in O₂ bubbles/min (0 – 64) + active limiting factor string
 */
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

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

/**
 * Cleanly isolates the photorealistic studio leaf cross-section onto a 100% transparent canvas
 * using exterior edge-seeded BFS flood-fill (removing cool gray backdrop, warm top-left studio rays,
 * and detached floor shadow) + 2-pass silhouette feathering, so there is ZERO visible rectangle/screen
 * edge in both Dark and Light modes while keeping every internal cell, bubble, xylem & phloem pixel intact!
 */
function createTransparentLeafCanvasTexture(
  imgSrc: string,
  maxAnisotropy: number,
  onReady: (tex: THREE.CanvasTexture) => void
) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const w = 1024;
    const h = 576;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const total = w * h;
    const visited = new Uint8Array(total);
    const isBg = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const isExteriorBackdrop = (idx: number): boolean => {
      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC - minC;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const y = (idx - (idx % w)) / w;

      // Protect all green leaf cuticle/cells and cyan xylem tube pixels
      if (g > r + 5 && g > b + 12) return false;
      if (g - b > 24 && g >= r - 4) return false;
      if (b > r + 18) return false;

      // 1. Neutral cool-gray studio backdrop surrounding the leaf
      if (sat < 28 && lum > 142 && b >= r - 8) return true;

      // 2. Warm top-left studio sunbeam wash (bright cream/off-white, r >= g >= b, low green excess)
      if (lum > 176 && r >= g - 1 && g >= b - 3 && r - b < 48 && g - b < 26) return true;

      // 3. Soft detached floor shadow below the leaf cutaway
      if (y > h * 0.76 && sat < 26 && lum > 98 && g - b < 14) return true;

      return false;
    };

    const enqueue = (idx: number) => {
      if (visited[idx]) return;
      visited[idx] = 1;
      if (isExteriorBackdrop(idx)) {
        isBg[idx] = 1;
        queue[tail++] = idx;
      }
    };

    // Seed strictly from outer edges so enclosed interior air pockets & shiny bubbles stay 100% intact
    for (let x = 0; x < w; x++) {
      enqueue(x);
      enqueue((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      enqueue(y * w);
      enqueue(y * w + (w - 1));
    }

    while (head < tail) {
      const idx = queue[head++];
      const x = idx % w;
      const y = (idx - x) / w;
      if (x > 0) enqueue(idx - 1);
      if (x < w - 1) enqueue(idx + 1);
      if (y > 0) enqueue(idx - w);
      if (y < h - 1) enqueue(idx + w);
    }

    const alphaMask = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      alphaMask[i] = isBg[i] ? 0 : 255;
    }

    // 2-pass silhouette feathering to eliminate any edge halo in both Dark and Light modes
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (alphaMask[i] === 0) continue;
          const zeroNeighbors =
            (alphaMask[i - 1] === 0 ? 1 : 0) +
            (alphaMask[i + 1] === 0 ? 1 : 0) +
            (alphaMask[i - w] === 0 ? 1 : 0) +
            (alphaMask[i + w] === 0 ? 1 : 0);
          if (zeroNeighbors > 0) {
            const p = i * 4;
            const sat =
              Math.max(data[p], data[p + 1], data[p + 2]) -
              Math.min(data[p], data[p + 1], data[p + 2]);
            if (sat < 48) {
              alphaMask[i] = Math.max(0, Math.round(alphaMask[i] * (1 - zeroNeighbors * 0.24)));
            }
          }
        }
      }
    }

    for (let i = 0; i < total; i++) {
      data[i * 4 + 3] = alphaMask[i];
    }

    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    tex.needsUpdate = true;
    onReady(tex);
  };
  img.src = imgSrc;
}

/**
 * Computes real-time 3D relief & physiological vertex deformation for the photorealistic cutaway leaf:
 * - Organic sculpted 3D relief depth (protruding petiole vein comes forward in +Z!)
 * - Guard-cell turgor swelling/pinching directly around the lower stomatal pore (u=0.514, v=0.305)
 * - Gentle living turgor breathing & metabolic pulse in the palisade layer
 * - Visible heat-stress edge droop when Temperature rises above 38°C!
 */
function computeDeformedLeafPoint(
  u: number,
  v: number,
  stomataAperture: number,
  rate: number,
  heatStress: number,
  elapsed: number,
  out: THREE.Vector3
) {
  let x = (u - 0.5) * PLANE_W;
  let y = (v - 0.5) * PLANE_H;

  // Base 3D sculptural relief: central leaf block curves gently forward, protruding vein pops toward camera
  const dxBody = (u - 0.53) / 0.28;
  const dyBody = (v - 0.52) / 0.25;
  let z = 0.42 * Math.exp(-(dxBody * dxBody + dyBody * dyBody) * 0.72);

  // Protruding front-left vascular vein relief (+Z depth)
  const dxVein = (u - 0.32) / 0.14;
  const dyVein = (v - 0.29) / 0.14;
  z += 0.34 * Math.exp(-(dxVein * dxVein + dyVein * dyVein) * 0.85);

  // 1. Living leaf turgor breathing & active photosynthetic vitality
  const breath = Math.sin(elapsed * (1.2 + rate * 2.4)) * (0.016 + rate * 0.022);
  const wLeaf = Math.exp(-(((u - 0.52) / 0.32) ** 2 + ((v - 0.52) / 0.3) ** 2));
  y += breath * wLeaf;
  z += breath * 0.6 * wLeaf;

  // 2. Stomatal guard cell swelling (OPEN widens the notch outward; CLOSED pinches guard cells inward!)
  const duStoma = u - 0.514;
  const dvStoma = v - 0.305;
  const wStoma = Math.exp(-(duStoma * duStoma / 0.0026 + dvStoma * dvStoma / 0.0038));
  const poreShift = (stomataAperture - 0.5) * 0.95; // +0.475 open, -0.475 closed
  x += duStoma * wStoma * poreShift * 2.1;
  y -= wStoma * (stomataAperture - 0.5) * 0.04;
  z += wStoma * stomataAperture * 0.14;

  // 3. Heat stress wilting droop above 38°C (edges visibly droop & curl gently downward)
  if (heatStress > 0.001) {
    const edgeDist = Math.abs(u - 0.52);
    const droop = Math.pow(edgeDist, 1.65) * heatStress * 0.78;
    y -= droop;
    z -= heatStress * 0.12 * wLeaf;
  }

  out.set(x, y, z);
}

function classifyLeafPartFromUV(u: number, v: number): LeafPartId | null {
  // Outside the leaf silhouette bounding zone
  if (u < 0.22 || u > 0.82 || v < 0.14 || v > 0.78) return null;

  // 1. Stoma & guard cells notch (generous click target at bottom-center)
  if (Math.hypot(u - 0.514, v - 0.305) < 0.068) return 'stomata';

  // 2. Xylem vessel (cyan tube from petiole up-right)
  const distToXylem = Math.min(
    Math.hypot(u - 0.29, v - 0.26),
    Math.hypot(u - 0.35, v - 0.35),
    Math.hypot(u - 0.41, v - 0.42),
    Math.hypot(u - 0.47, v - 0.47)
  );
  if (distToXylem < 0.056) return 'xylem';

  // 3. Phloem sieve tube (amber tube alongside/below xylem)
  const distToPhloem = Math.min(
    Math.hypot(u - 0.43, v - 0.38),
    Math.hypot(u - 0.48, v - 0.43),
    Math.hypot(u - 0.54, v - 0.48)
  );
  if (distToPhloem < 0.048) return 'phloem';

  // 4. Cuticle & upper epidermis band
  if (v >= 0.65 && u >= 0.25 && u <= 0.79) return 'cuticle';

  // 5. Palisade mesophyll band
  if (v >= 0.50 && v < 0.65 && u >= 0.25 && u <= 0.79) return 'palisade';

  // 6. Spongy mesophyll air-space zone
  if (v >= 0.32 && v < 0.50 && u >= 0.26 && u <= 0.79) return 'spongy';

  return null;
}

export const Photosynthesis3DSimulation: React.FC<Photosynthesis3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 3',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Environmental Controls
  const [lightPct, setLightPct] = useState<number>(80);
  const [co2Pct, setCo2Pct] = useState<number>(75);
  const [tempC, setTempC] = useState<number>(29);
  const [stomataOpen, setStomataOpen] = useState<boolean>(true);

  // UI & Guided Lesson State (65 seconds = 1:05)
  const [watchLessonActive, setWatchLessonActive] = useState<boolean>(false);
  const [lessonPaused, setLessonPaused] = useState<boolean>(false);
  const [lessonTimeSec, setLessonTimeSec] = useState<number>(0);
  const [lessonSpeed, setLessonSpeed] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<LeafPartId>('overview');
  const [level, setLevel] = useState<SyllabusLevel>(() =>
    activeClass.includes('5') || activeClass.includes('6') ? 'a_level' : 'o_level'
  );
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [interactionHint, setInteractionHint] = useState<string | null>(null);
  const [challengeIdx, setChallengeIdx] = useState<number | null>(null);
  const [plottedPoints, setPlottedPoints] = useState<PlottedRatePoint[]>([
    { id: 1, light: 20, rate: 25, co2: 75 },
    { id: 2, light: 50, rate: 45, co2: 75 },
    { id: 3, light: 80, rate: 56, co2: 75 },
  ]);

  const metrics = useMemo(
    () => computePhotosynthesisMetrics(lightPct, co2Pct, tempC, stomataOpen),
    [lightPct, co2Pct, tempC, stomataOpen]
  );

  const activeChapter = useMemo(() => {
    for (let i = LESSON_CHAPTERS.length - 1; i >= 0; i--) {
      if (lessonTimeSec >= LESSON_CHAPTERS[i].startSec) return LESSON_CHAPTERS[i];
    }
    return LESSON_CHAPTERS[0];
  }, [lessonTimeSec]);

  const activeChallenge = challengeIdx !== null ? BIO_CHALLENGES[challengeIdx] : null;
  const challengeSolved = useMemo(() => {
    if (!activeChallenge) return false;
    return activeChallenge.check(lightPct, co2Pct, tempC, stomataOpen, metrics.bubblesPerMin);
  }, [activeChallenge, lightPct, co2Pct, tempC, stomataOpen, metrics.bubblesPerMin]);

  // Mutable refs for stable 60fps Three.js loop
  const lightRef = useRef<number>(lightPct);
  const co2Ref = useRef<number>(co2Pct);
  const tempRef = useRef<number>(tempC);
  const stomataRef = useRef<boolean>(stomataOpen);
  const darkModeRef = useRef<boolean>(darkMode);
  const showLabelsRef = useRef<boolean>(showLabels);
  const selectedPartRef = useRef<LeafPartId>(selectedPart);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonPausedRef = useRef<boolean>(lessonPaused);
  const lessonTimeRef = useRef<number>(lessonTimeSec);
  const lessonSpeedRef = useRef<number>(lessonSpeed);
  const lastUiSyncRef = useRef<number>(0);
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
    darkModeRef.current = darkMode;
  }, [darkMode]);
  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);
  useEffect(() => {
    selectedPartRef.current = selectedPart;
  }, [selectedPart]);
  useEffect(() => {
    watchLessonRef.current = watchLessonActive;
  }, [watchLessonActive]);
  useEffect(() => {
    lessonPausedRef.current = lessonPaused;
  }, [lessonPaused]);
  useEffect(() => {
    lessonSpeedRef.current = lessonSpeed;
  }, [lessonSpeed]);

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

  // ==================== THREE.JS BORDERLESS PHOTOREALISTIC 3D LEAF RELIEF & FLOWS ====================
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
    const bgDark = new THREE.Color(0x121621);
    const bgLight = new THREE.Color(0xeaf0f7);
    scene.background = darkModeRef.current ? bgDark.clone() : bgLight.clone();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0.15, 0.2, 8.9);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = false;
    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    // Balanced studio lighting rig
    const hemiLight = new THREE.HemisphereLight(0xf0f9ff, 0x1e293b, 1.15);
    scene.add(hemiLight);

    const sunDirLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
    sunDirLight.position.set(-4.5, 6.2, 6.5);
    scene.add(sunDirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(5.5, 1.5, 3.2);
    scene.add(rimLight);

    // Constrained front-facing 3D orbit so users can tilt & inspect depth without losing the cutaway
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 5.4;
    controls.maxDistance = 12.8;
    controls.minAzimuthAngle = -0.44;
    controls.maxAzimuthAngle = 0.44;
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.66;
    controls.target.set(0.08, -0.05, 0.15);

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

    const leafRoot = new THREE.Group();
    scene.add(leafRoot);

    // ==================== 1. HIGH-RES BORDERLESS PHOTOREALISTIC 3D LEAF RELIEF MESH ====================
    const leafGeo = trackGeo(new THREE.PlaneGeometry(PLANE_W, PLANE_H, 72, 44));
    const leafUvAttr = leafGeo.attributes.uv as THREE.BufferAttribute;
    const leafPosAttr = leafGeo.attributes.position as THREE.BufferAttribute;

    const leafMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
        transparent: true,
        alphaTest: 0.03,
        side: THREE.DoubleSide,
      })
    );
    const leafMesh = new THREE.Mesh(leafGeo, leafMat);
    leafRoot.add(leafMesh);

    let disposed = false;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    createTransparentLeafCanvasTexture(imgLeafCutawayStudio, maxAniso, (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      trackTex(tex);
      leafMat.map = tex;
      leafMat.needsUpdate = true;
    });

    // ==================== 2. DYNAMIC VOLUMETRIC SUNLIGHT SHAFTS (TOP-LEFT -> UPPER CUTICLE) ====================
    const sunBeamMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.13,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    const sunBeams: THREE.Mesh[] = [];
    const beamOffsets: Array<[number, number, number]> = [
      [-3.15, 2.05, -0.45],
      [-2.35, 2.25, -0.2],
      [-1.55, 2.35, 0.05],
      [-0.75, 2.25, 0.2],
    ];
    for (const [bx, by, bz] of beamOffsets) {
      const beam = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.18, 0.62, 3.6, 14, 1, true)),
        sunBeamMat
      );
      beam.position.set(bx, by, bz);
      beam.rotation.z = 0.62; // Angles diagonally down-right from upper-left like the studio sunlight!
      leafRoot.add(beam);
      sunBeams.push(beam);
    }

    // ==================== 3. INTERACTIVE 3D STOMATAL GUARD-CELL INDICATOR AT LOWER PORE ====================
    const guardCellMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: new THREE.Color(0x16a34a),
        emissiveIntensity: 0.35,
        roughness: 0.32,
        metalness: 0.06,
        transparent: true,
        opacity: 0.88,
      })
    );
    const guardArcGeo = trackGeo(new THREE.TorusGeometry(0.145, 0.044, 12, 22, Math.PI * 0.9));
    const guardLeft = new THREE.Mesh(guardArcGeo, guardCellMat);
    guardLeft.rotation.z = Math.PI * 0.55;
    const guardRight = new THREE.Mesh(guardArcGeo, guardCellMat);
    guardRight.rotation.z = -Math.PI * 0.45;
    const stomaGroup = new THREE.Group();
    stomaGroup.add(guardLeft, guardRight);
    leafRoot.add(stomaGroup);

    // Subtle 3D focus ring for clicked / guided-lesson anatomy region
    const focusRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    );
    const focusRing = new THREE.Mesh(trackGeo(new THREE.RingGeometry(0.32, 0.39, 40)), focusRingMat);
    leafRoot.add(focusRing);

    // ==================== 4. INSTANCED 3D MOLECULAR & VASCULAR FLOW PARTICLES ====================
    // A. Golden Sunlight Photons (28) descending from upper-left onto upper cuticle & palisade layer
    const PHOTON_COUNT = 28;
    const photonMat = trackMat(
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.92 })
    );
    const photonInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.056, 10, 8)),
      photonMat,
      PHOTON_COUNT
    );
    photonInstanced.frustumCulled = false;
    leafRoot.add(photonInstanced);

    // B. Xylem Water (H₂O) Luminous Cyan-Blue Droplets streaming UP the exact blue xylem vessel + branches (32)
    const WATER_COUNT = 32;
    const waterMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: new THREE.Color(0x0ea5e9),
        emissiveIntensity: 0.85,
        roughness: 0.14,
      })
    );
    const waterInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.055, 10, 8)),
      waterMat,
      WATER_COUNT
    );
    waterInstanced.frustumCulled = false;
    leafRoot.add(waterInstanced);

    // C. Phloem Glucose/Sucrose (C₆H₁₂O₆) Golden Octahedra translocating DOWN the amber phloem tube (22)
    const GLUCOSE_COUNT = 22;
    const glucoseMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: new THREE.Color(0xf59e0b),
        emissiveIntensity: 0.85,
        roughness: 0.2,
      })
    );
    const glucoseInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.OctahedronGeometry(0.062, 1)),
      glucoseMat,
      GLUCOSE_COUNT
    );
    glucoseInstanced.frustumCulled = false;
    leafRoot.add(glucoseInstanced);

    // D. CO₂ Molecules (Violet) diffusing UP through the stoma pore into spongy air spaces (22)
    const CO2_COUNT = 22;
    const co2Mat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xc4b5fd,
        emissive: new THREE.Color(0x7c3aed),
        emissiveIntensity: 0.72,
        roughness: 0.24,
      })
    );
    const co2Instanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.054, 10, 8)),
      co2Mat,
      CO2_COUNT
    );
    co2Instanced.frustumCulled = false;
    leafRoot.add(co2Instanced);

    // E. O₂ Oxygen Bubbles (Bright Cyan-White) rising from palisade chloroplasts & air spaces (30)
    const O2_COUNT = 30;
    const o2Mat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf0f9ff,
        emissive: new THREE.Color(0x22d3ee),
        emissiveIntensity: 0.9,
        roughness: 0.08,
      })
    );
    const o2Instanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.062, 12, 10)),
      o2Mat,
      O2_COUNT
    );
    o2Instanced.frustumCulled = false;
    leafRoot.add(o2Instanced);

    // F. Palisade Chloroplast Glow Pulses (subtle luminous emerald energy nodes inside palisade cells) (18)
    const CHLORO_GLOW_COUNT = 18;
    const chloroGlowMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    );
    const chloroGlowInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.068, 10, 8)),
      chloroGlowMat,
      CHLORO_GLOW_COUNT
    );
    chloroGlowInstanced.frustumCulled = false;
    leafRoot.add(chloroGlowInstanced);

    const chloroNodesUV: Array<[number, number]> = [];
    for (let i = 0; i < CHLORO_GLOW_COUNT; i++) {
      const frac = i / (CHLORO_GLOW_COUNT - 1);
      const u = 0.28 + frac * 0.49;
      const v = 0.545 + (i % 3 - 1) * 0.036;
      chloroNodesUV.push([u, v]);
    }

    // ==================== 5. DIRECT UV RAYCAST INTERACTION ON THE PHOTOREALISTIC LEAF ====================
    let pointerDown = { x: 0, y: 0 };
    let lastHover = 0;

    const getHitPart = (cx: number, cy: number): LeafPartId | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((cy - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObject(leafMesh, false);
      if (hits.length === 0 || !hits[0].uv) return null;
      return classifyLeafPartFromUV(hits[0].uv.x, hits[0].uv.y);
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDown = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHover < 50) return;
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
        setWatchLessonActive(false);
        setLessonPaused(false);
        setStomataOpen((prev) => {
          const next = !prev;
          setInteractionHint(
            next
              ? 'Guard cells swelled OPEN — CO₂ now diffuses freely through the stoma into spongy air spaces!'
              : 'Guard cells CLOSED the stoma — CO₂ intake restricted to conserve water!'
          );
          return next;
        });
      } else if (part === 'palisade') {
        setInteractionHint(
          `Palisade Mesophyll Chloroplasts — Output: ${m.bubblesPerMin} O₂ bubbles/min (Limiting: ${m.limitingFactor})`
        );
      } else if (part === 'xylem') {
        setInteractionHint(
          'Xylem Vessel (Blue Tube) — continuous transpiration pull delivering H₂O and mineral ions upward into the leaf.'
        );
      } else if (part === 'phloem') {
        setInteractionHint(
          `Phloem Sieve Tube (Amber Tube) — actively translocating ${m.glucoseMgHr.toFixed(1)} mg/hr of sucrose/glucose out of the leaf.`
        );
      } else if (part === 'cuticle') {
        setInteractionHint(
          'Waxy Cuticle & Upper Epidermis — transparent waterproof barrier letting sunlight reach the palisade layer.'
        );
      } else if (part === 'spongy') {
        setInteractionHint(
          'Spongy Mesophyll & Intercellular Air Spaces — loose cells enabling rapid CO₂ and O₂ gas diffusion.'
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

    let frameId = 0;
    const clock = new THREE.Clock();

    let dampedLight = lightRef.current;
    let dampedCo2 = co2Ref.current;
    let dampedTemp = tempRef.current;
    let dampedAperture = stomataRef.current ? 1 : 0;

    let photonPhase = 0;
    let waterPhase = 0;
    let glucosePhase = 0;
    let co2Phase = 0;
    let o2Phase = 0;

    function computeProjectedLabels(
      aperture: number,
      rate: number,
      heatStress: number,
      elapsed: number
    ): ProjectedLabel[] {
      if (!showLabelsRef.current) return [];
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      if (w <= 0 || h <= 0) return [];
      const out: ProjectedLabel[] = [];
      for (const spec of CALLOUT_UV_ANCHORS) {
        computeDeformedLeafPoint(spec.u, spec.v, aperture, rate, heatStress, elapsed, _vProj);
        _vProj.z += 0.14;
        _vProj.project(camera);
        if (_vProj.z > 1) continue;
        const ax = (_vProj.x * 0.5 + 0.5) * w;
        const ay = (-_vProj.y * 0.5 + 0.5) * h;
        const lx = Math.max(90, Math.min(w - 90, ax + spec.offsetX));
        const ly = Math.max(26, Math.min(h - 26, ay + spec.offsetY));
        out.push({ id: spec.id, partId: spec.partId, text: spec.text, ax, ay, lx, ly });
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

      const isDark = darkModeRef.current;
      scene.background = isDark ? bgDark : bgLight;

      // ==================== 65-SECOND (1:05) GUIDED LESSON CHOREOGRAPHY ====================
      if (watchLessonRef.current) {
        if (!lessonPausedRef.current) {
          lessonTimeRef.current = Math.min(
            LESSON_DURATION_SEC,
            lessonTimeRef.current + delta * lessonSpeedRef.current
          );
          if (lessonTimeRef.current >= LESSON_DURATION_SEC) {
            lessonPausedRef.current = true;
            setLessonPaused(true);
          }
        }
        const t = lessonTimeRef.current;

        if (t < 17) {
          const f = Math.min(1, t / 14);
          lightRef.current = Math.round(10 + f * 75);
          co2Ref.current = 40;
          tempRef.current = 26;
          stomataRef.current = false;
          selectedPartRef.current = 'palisade';
        } else if (t < 34) {
          const f = Math.min(1, (t - 17) / 13);
          lightRef.current = 85;
          co2Ref.current = Math.round(40 + f * 45);
          tempRef.current = 28;
          stomataRef.current = true;
          selectedPartRef.current = 'xylem';
        } else if (t < 50) {
          lightRef.current = 95;
          co2Ref.current = 90;
          tempRef.current = 30;
          stomataRef.current = true;
          selectedPartRef.current = 'phloem';
        } else {
          const f = Math.min(1, (t - 50) / 11);
          lightRef.current = 90;
          co2Ref.current = 85;
          tempRef.current = Math.round(30 + f * 15);
          stomataRef.current = true;
          selectedPartRef.current = 'stomata';
        }

        const nowTs = performance.now();
        if (nowTs - lastUiSyncRef.current > 110) {
          lastUiSyncRef.current = nowTs;
          setLessonTimeSec(Number(t.toFixed(2)));
          setLightPct(lightRef.current);
          setCo2Pct(co2Ref.current);
          setTempC(tempRef.current);
          setStomataOpen(stomataRef.current);
          setSelectedPart(selectedPartRef.current);
        }
      }

      // Smoothly damp environmental parameters
      dampedLight = THREE.MathUtils.damp(dampedLight, lightRef.current, 6, delta);
      dampedCo2 = THREE.MathUtils.damp(dampedCo2, co2Ref.current, 6, delta);
      dampedTemp = THREE.MathUtils.damp(dampedTemp, tempRef.current, 6, delta);
      dampedAperture = THREE.MathUtils.damp(dampedAperture, stomataRef.current ? 1 : 0, 8, delta);

      const live = computePhotosynthesisMetrics(
        dampedLight,
        dampedCo2,
        dampedTemp,
        dampedAperture > 0.4
      );
      const rate = live.normalizedRate;
      const lightFrac = dampedLight / 100;
      const heatStress = THREE.MathUtils.clamp((dampedTemp - 37) / 8, 0, 1);

      // 1. Deform the photorealistic 3D cutaway leaf mesh vertices in real time!
      for (let i = 0; i < leafPosAttr.count; i++) {
        const u = leafUvAttr.getX(i);
        const v = leafUvAttr.getY(i);
        computeDeformedLeafPoint(u, v, dampedAperture, rate, heatStress, elapsed, _vPos);
        leafPosAttr.setXYZ(i, _vPos.x, _vPos.y, _vPos.z);
      }
      leafPosAttr.needsUpdate = true;

      // Subtle photo brightness & heat-stress tint modulation (dimmer in darkness, warm olive when overheated!)
      const brightness = 0.7 + lightFrac * 0.34;
      const rTint = brightness * THREE.MathUtils.lerp(1.0, 1.08, heatStress);
      const gTint = brightness * THREE.MathUtils.lerp(1.0, 0.88, heatStress);
      const bTint = brightness * THREE.MathUtils.lerp(1.0, 0.72, heatStress);
      leafMat.color.setRGB(rTint, gTint, bTint);

      // 2. Sunlight Intensity & Volumetric Light Shafts
      sunDirLight.intensity = 0.5 + lightFrac * 1.95;
      sunBeamMat.opacity = lightFrac * (isDark ? 0.17 : 0.14);
      sunBeams.forEach((b) => {
        b.visible = lightFrac > 0.04;
      });

      // 3. Articulated 3D Guard Cells right at the lower stomatal pore (u=0.514, v=0.305)
      computeDeformedLeafPoint(0.514, 0.305, dampedAperture, rate, heatStress, elapsed, _vPos);
      stomaGroup.position.set(_vPos.x, _vPos.y, _vPos.z + 0.11);
      const poreGap = THREE.MathUtils.lerp(0.025, 0.125, dampedAperture);
      guardLeft.position.x = -poreGap;
      guardRight.position.x = poreGap;
      const gSwell = THREE.MathUtils.lerp(0.84, 1.14, dampedAperture);
      guardLeft.scale.set(gSwell, gSwell, 1);
      guardRight.scale.set(gSwell, gSwell, 1);
      guardCellMat.emissiveIntensity = 0.18 + dampedAperture * 0.42;

      // Focus ring on clicked / guided-lesson anatomical part
      const focusId = selectedPartRef.current;
      if (focusId !== 'overview') {
        const anchor = PART_ANCHORS[focusId];
        computeDeformedLeafPoint(anchor.u, anchor.v, dampedAperture, rate, heatStress, elapsed, _vPos);
        focusRing.position.set(_vPos.x, _vPos.y, _vPos.z + 0.17);
        const pulse = 1 + Math.sin(elapsed * 4.2) * 0.09;
        focusRing.scale.setScalar(pulse);
        focusRingMat.opacity = 0.72;
        focusRingMat.color.setHex(
          focusId === 'xylem'
            ? 0x38bdf8
            : focusId === 'phloem'
            ? 0xfbbf24
            : focusId === 'stomata'
            ? 0xa78bfa
            : 0x34d399
        );
      } else {
        focusRingMat.opacity = 0;
      }

      // 4. Palisade Chloroplast Metabolic Energy Glow Pulses
      chloroGlowMat.color.setHSL(
        THREE.MathUtils.lerp(0.37, 0.14, heatStress),
        THREE.MathUtils.lerp(0.85, 0.45, heatStress),
        0.55
      );
      chloroGlowMat.opacity = (0.06 + rate * 0.52) * (1 - heatStress * 0.75);
      for (let i = 0; i < CHLORO_GLOW_COUNT; i++) {
        const [cu, cv] = chloroNodesUV[i];
        computeDeformedLeafPoint(cu, cv, dampedAperture, rate, heatStress, elapsed, _vPos);
        _vPos.z += 0.14;
        const pulse = (0.6 + 0.45 * Math.sin(elapsed * (2.2 + rate * 5) + i * 1.1)) * (0.3 + rate * 0.9);
        _quatDummy.identity();
        _scaleDummy.setScalar(rate > 0.03 ? pulse : 0.0001);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        chloroGlowInstanced.setMatrixAt(i, _matDummy);
      }
      chloroGlowInstanced.instanceMatrix.needsUpdate = true;

      // 5. Golden Sunlight Photons descending diagonally from top-left onto upper cuticle & palisade
      photonPhase = (photonPhase + delta * (0.28 + lightFrac * 0.92)) % 1;
      for (let i = 0; i < PHOTON_COUNT; i++) {
        const t = (i / PHOTON_COUNT + photonPhase) % 1;
        const lane = ((i * 0.37) % 1);
        const startU = 0.04 + lane * 0.36;
        const startV = 0.98;
        const endU = 0.27 + lane * 0.48;
        const endV = 0.58 + (i % 3) * 0.04;
        const u = THREE.MathUtils.lerp(startU, endU, t);
        const v = THREE.MathUtils.lerp(startV, endV, t);
        computeDeformedLeafPoint(u, v, dampedAperture, rate, heatStress, elapsed, _vPos);
        _vPos.z += 0.28 * (1 - t) + 0.12;
        _quatDummy.identity();
        const sc = lightFrac > 0.05 ? (0.45 + lightFrac * 0.78) * Math.sin(t * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        photonInstanced.setMatrixAt(i, _matDummy);
      }
      photonInstanced.instanceMatrix.needsUpdate = true;

      // 6. Xylem Water (H₂O) Blue Droplets flowing UP the exact cyan xylem tube & side-tracheids!
      const waterSpeed = 0.22 + dampedAperture * 0.48 + rate * 0.52;
      waterPhase = (waterPhase + delta * waterSpeed) % 1;
      for (let i = 0; i < WATER_COUNT; i++) {
        const t = (i / WATER_COUNT + waterPhase) % 1;
        const path =
          i % 4 === 0 ? XYLEM_BRANCH_1 : i % 4 === 2 ? XYLEM_BRANCH_2 : XYLEM_MAIN_SEGS;
        const [u, v] = sampleUvPath(path, t);
        const jitter = ((i % 3) - 1) * 0.004;
        computeDeformedLeafPoint(u + jitter, v, dampedAperture, rate, heatStress, elapsed, _vPos);
        _vPos.z += 0.18;
        _quatDummy.identity();
        const sc = (0.72 + rate * 0.42) * Math.sin(Math.min(1, Math.max(0.05, t)) * Math.PI);
        _scaleDummy.setScalar(Math.max(0.28, sc));
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        waterInstanced.setMatrixAt(i, _matDummy);
      }
      waterInstanced.instanceMatrix.needsUpdate = true;

      // 7. Phloem Glucose/Sucrose (C₆H₁₂O₆) Golden Crystals flowing DOWN the exact amber phloem tube!
      glucosePhase = (glucosePhase + delta * (0.1 + rate * 0.96)) % 1;
      for (let i = 0; i < GLUCOSE_COUNT; i++) {
        const t = (i / GLUCOSE_COUNT + glucosePhase) % 1;
        const [u, v] = sampleUvPath(PHLOEM_SEGS, t);
        const jitter = ((i % 3) - 1) * 0.0045;
        computeDeformedLeafPoint(u, v + jitter, dampedAperture, rate, heatStress, elapsed, _vPos);
        _vPos.z += 0.17;
        _eulerDummy.set(elapsed + i, elapsed * 1.5, 0);
        _quatDummy.setFromEuler(_eulerDummy);
        const sc =
          rate > 0.04 ? (0.45 + rate * 0.8) * Math.sin(Math.min(0.95, Math.max(0.08, t)) * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        glucoseInstanced.setMatrixAt(i, _matDummy);
      }
      glucoseInstanced.instanceMatrix.needsUpdate = true;

      // 8. CO₂ Molecules (Violet) diffusing UP through the stoma notch into spongy mesophyll air spaces!
      const co2Flow = (dampedCo2 / 100) * (0.12 + dampedAperture * 0.88);
      co2Phase = (co2Phase + delta * (0.18 + co2Flow * 0.82)) % 1;
      for (let i = 0; i < CO2_COUNT; i++) {
        const t = (i / CO2_COUNT + co2Phase) % 1;
        const spread = ((i % 7) - 3) * 0.048;
        let u: number;
        let v: number;
        if (dampedAperture < 0.28) {
          // Stoma closed: CO₂ hovers and bounces below the closed pore!
          u = 0.514 + spread * 0.65 + Math.sin(elapsed * 2 + i) * 0.015;
          v = 0.14 + Math.sin(t * Math.PI) * 0.11;
        } else {
          // Stoma open: funnel smoothly through (0.514, 0.305) then fan across spongy mesophyll!
          if (t < 0.42) {
            const p = t / 0.42;
            u = THREE.MathUtils.lerp(0.514 + spread * 0.4, 0.514, p);
            v = THREE.MathUtils.lerp(0.13, 0.305, p);
          } else {
            const p = (t - 0.42) / 0.58;
            u = THREE.MathUtils.lerp(0.514, 0.52 + spread * 1.45, p);
            v = THREE.MathUtils.lerp(0.305, 0.52 + (i % 3) * 0.03, p);
          }
        }
        computeDeformedLeafPoint(u, v, dampedAperture, rate, heatStress, elapsed, _vPos);
        _vPos.z += 0.19;
        _quatDummy.identity();
        const sc =
          dampedCo2 > 3
            ? (0.45 + (dampedCo2 / 100) * 0.62) * Math.sin(t * Math.PI) * (dampedAperture < 0.28 ? 0.72 : 1)
            : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        co2Instanced.setMatrixAt(i, _matDummy);
      }
      co2Instanced.instanceMatrix.needsUpdate = true;

      // 9. O₂ Oxygen Bubbles (Bright Cyan-White) streaming OUT of chloroplasts & air spaces!
      o2Phase = (o2Phase + delta * (0.14 + rate * 1.38)) % 1;
      for (let i = 0; i < O2_COUNT; i++) {
        const t = (i / O2_COUNT + o2Phase) % 1;
        const activeBubble = i < Math.ceil(rate * O2_COUNT);
        const startU = 0.29 + ((i * 0.19) % 0.47);
        const startV = 0.52 + (i % 3) * 0.04;
        const u = startU + Math.sin(elapsed * 2.4 + i) * 0.014;
        const v = THREE.MathUtils.lerp(startV, 0.94, t);
        computeDeformedLeafPoint(u, v, dampedAperture, rate, heatStress, elapsed, _vPos);
        _vPos.z += 0.22 + t * 0.16;
        _quatDummy.identity();
        const sc = activeBubble && rate > 0.03 ? (0.52 + rate * 0.68) * Math.sin(t * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        o2Instanced.setMatrixAt(i, _matDummy);
      }
      o2Instanced.instanceMatrix.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastLabelPushRef.current > 36) {
        lastLabelPushRef.current = now;
        setProjectedLabels(computeProjectedLabels(dampedAperture, rate, heatStress, elapsed));
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

  // ==================== LESSON & INTERACTION HANDLERS ====================
  const handleToggleWatchLesson = () => {
    if (watchLessonActive) {
      setWatchLessonActive(false);
      setLessonPaused(false);
      setSelectedPart('overview');
      return;
    }
    lessonTimeRef.current = 0;
    setLessonTimeSec(0);
    setLessonPaused(false);
    lessonPausedRef.current = false;
    setWatchLessonActive(true);
  };

  const handleTakeOverFromHere = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setInteractionHint('You now have live control — adjust Sunlight, CO₂, Temp or click the Stoma!');
  };

  const handleJumpLessonTime = (sec: number) => {
    const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, sec));
    lessonTimeRef.current = clamped;
    setLessonTimeSec(clamped);
  };

  const handleResetOptimal = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setLightPct(85);
    setCo2Pct(80);
    setTempC(30);
    setStomataOpen(true);
    setSelectedPart('overview');
    setInteractionHint('Reset to optimal photosynthetic conditions (85% Light, 80% CO₂, 30°C).');
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

  const surfaceBg = darkMode ? 'bg-[#121621] text-slate-100' : 'bg-[#eaf0f7] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#1a2030] border-white/[0.1] text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const dockBg = darkMode
    ? 'bg-[#131722] border-white/[0.12] text-slate-100'
    : 'bg-white border-slate-300 text-slate-900 shadow-md';

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border overflow-hidden flex flex-col ${surfaceBg} ${
        darkMode ? 'border-white/[0.08]' : 'border-slate-200 shadow-sm'
      } ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-0 h-screen' : ''}`}
    >
      {/* TOP BAR */}
      <div
        className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          darkMode ? 'bg-[#10141e] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleWatchLesson}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              watchLessonActive
                ? 'bg-emerald-500 text-slate-950'
                : darkMode
                ? 'bg-white text-slate-950 hover:bg-slate-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {watchLessonActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{watchLessonActive ? 'Exit lesson' : 'Watch lesson (1:05)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels((p) => !p)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
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
            <span>Labels {showLabels ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWatchLessonActive(false);
              setLessonPaused(false);
              setStomataOpen((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
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
            onClick={() => {
              setWatchLessonActive(false);
              setChallengeIdx((prev) => (prev === null ? 0 : null));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeChallenge
                ? 'bg-amber-400 border-amber-300 text-slate-950'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-amber-300 hover:bg-white/[0.1]'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeChallenge ? 'Exit Challenge' : 'Try Lab Challenge'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`inline-flex items-center p-0.5 rounded-full border text-xs ${
              darkMode ? 'bg-[#1a1f2d] border-white/[0.1]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setLevel('o_level')}
              className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors whitespace-nowrap ${
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
              className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors whitespace-nowrap ${
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
            className={`p-2 rounded-xl border cursor-pointer transition-colors ${
              darkMode
                ? 'bg-[#1a1f2d] border-white/[0.1] text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: Photorealistic 3D Cutaway Leaf (8 cols) & Live Limiting Factors Panel (4 cols) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D LEAF CUTAWAY VIEWPORT */}
        <div
          className={`lg:col-span-8 relative flex flex-col overflow-hidden ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[450px] sm:h-[540px] lg:h-[600px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Compact Particle Legend in Top-Left of 3D Stage */}
          <div
            className={`pointer-events-none absolute left-3.5 top-3.5 px-3 py-2 rounded-xl border text-[11px] font-bold space-y-1 ${
              darkMode
                ? 'bg-[#10141f] border-white/[0.1] text-slate-200'
                : 'bg-white border-slate-300 text-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <span>Sunlight photons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
              <span>CO₂ in (via stoma)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>H₂O in (Xylem)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
              <span>O₂ bubbles out</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Glucose out (Phloem)</span>
            </div>
          </div>

          {/* 3D-to-2D Projected Callout Labels */}
          {showLabels && projectedLabels.length > 0 && (
            <svg className="pointer-events-none absolute inset-0 w-full h-full overflow-visible">
              {projectedLabels.map((lbl) => (
                <g key={lbl.id}>
                  <line
                    x1={lbl.ax}
                    y1={lbl.ay}
                    x2={lbl.lx}
                    y2={lbl.ly}
                    stroke={darkMode ? 'rgba(226,232,240,0.68)' : 'rgba(30,41,59,0.62)'}
                    strokeWidth="1.25"
                  />
                  <circle cx={lbl.ax} cy={lbl.ay} r="3" fill={darkMode ? '#f8fafc' : '#0f172a'} />
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
                      setWatchLessonActive(false);
                      setLessonPaused(false);
                      setStomataOpen((prev) => !prev);
                    }
                  }}
                  style={{
                    left: `${lbl.lx}px`,
                    top: `${lbl.ly}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap shadow-xs border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                      : darkMode
                      ? 'bg-[#121622] border-white/[0.16] text-white hover:border-emerald-400/60'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-emerald-500'
                  }`}
                >
                  {lbl.text}
                </button>
              );
            })}

          {/* Direct 3D Click Feedback Toast */}
          {interactionHint && !watchLessonActive && (
            <div className="pointer-events-none absolute top-3.5 inset-x-4 flex justify-center">
              <div
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-sm ${
                  darkMode
                    ? 'bg-[#121622] border-emerald-400/45 text-emerald-200'
                    : 'bg-white border-emerald-500/50 text-emerald-900'
                }`}
              >
                {interactionHint}
              </div>
            </div>
          )}

          {/* Editorial Guided Lesson Caption */}
          {watchLessonActive && (
            <div className="pointer-events-none absolute bottom-3 inset-x-4 flex justify-center">
              <div
                className={`max-w-2xl px-5 py-3 rounded-2xl border text-center ${
                  darkMode
                    ? 'bg-[#10141f] border-white/[0.14] text-white'
                    : 'bg-white border-slate-300 text-slate-900 shadow-md'
                }`}
              >
                <div className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {activeChapter.index + 1} of {LESSON_CHAPTERS.length} · {activeChapter.title}
                </div>
                <p className="text-sm sm:text-base font-bold mt-1 leading-snug">
                  {level === 'o_level' ? activeChapter.oCaption : activeChapter.aCaption}
                </p>
              </div>
            </div>
          )}

          {!watchLessonActive && !dockCollapsed && (
            <div className="pointer-events-none absolute bottom-2 inset-x-0 text-center">
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  darkMode ? 'text-slate-400 bg-[#121621]' : 'text-slate-600 bg-[#eaf0f7]'
                }`}
              >
                Click the Stoma, Xylem, Phloem or Chloroplasts directly · Drag gently to tilt in 3D
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SCIENTIFIC READOUT, LIMITING FACTOR GRAPH & CHALLENGES PANEL (4 cols) */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-4 sm:p-5 flex flex-col justify-between gap-3.5 lg:max-h-[600px] overflow-y-auto ${
            darkMode ? 'bg-[#131722] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3.5">
            {/* Hero O₂ Photosynthesis Rate Readout */}
            <div>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
                  {metrics.bubblesPerMin}
                </span>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  O₂ bubbles/min
                </span>
              </div>
              <p className={`text-xs mt-0.5 tabular-nums ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Phloem sucrose export: <strong className="text-amber-500">{metrics.glucoseMgHr.toFixed(1)} mg/hr</strong>
              </p>

              {/* Active Limiting Factor Indicator (Text-paired, not hue-only) */}
              <div className="mt-2.5 flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                    metrics.denatured || !stomataOpen
                      ? darkMode
                        ? 'bg-rose-500/15 border-rose-400/40 text-rose-300'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                      : metrics.limitingFactor === 'Optimum Conditions'
                      ? darkMode
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : darkMode
                      ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  Limiting factor: {metrics.limitingFactor}
                </span>
              </div>
            </div>

            {/* 3-Card Live Environmental Metrics */}
            <div className="grid grid-cols-3 gap-2 tabular-nums">
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Light
                </div>
                <div className="text-sm font-black text-amber-500">{lightPct}%</div>
              </div>
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  CO₂
                </div>
                <div className="text-sm font-black text-violet-500">{co2Pct}%</div>
              </div>
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Temp
                </div>
                <div className={`text-sm font-black ${tempC >= 40 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {tempC}°C
                </div>
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

            {/* LIVE LIMITING FACTORS GRAPH (Rate vs Light Intensity) + Plot Point */}
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
              <svg viewBox="0 0 240 112" className="w-full h-24">
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
                  r="5"
                  fill="#f59e0b"
                  stroke={darkMode ? '#ffffff' : '#0f172a'}
                  strokeWidth="1.8"
                />

                <text x="5" y="18" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">O₂</text>
                <text x="166" y="108" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">
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
            <div className="font-bold">6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</div>
            <div className="text-[11px] mt-0.5 opacity-90">
              {level === 'o_level'
                ? 'Requires sunlight & green chlorophyll in palisade chloroplasts.'
                : 'Light-dependent reaction (thylakoids: ATP, NADPH, O₂) + Calvin cycle (stroma: RuBP → triose phosphate).'}
            </div>
          </div>
        </aside>
      </div>

      {/* UNIFIED BOTTOM DOCK: 1:05 VIDEO LESSON SCRUBBER OR ENVIRONMENTAL SLIDERS */}
      <div
        className={`border-t transition-all ${
          darkMode ? 'border-white/[0.08] bg-[#10141e]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {!watchLessonActive && (
          <div className="flex justify-center -mt-3">
            <button
              type="button"
              onClick={() => setDockCollapsed((p) => !p)}
              className={`px-3 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${dockBg}`}
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
        )}

        {watchLessonActive ? (
          <div className="px-4 py-3 max-w-5xl mx-auto flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (lessonTimeSec >= LESSON_DURATION_SEC - 0.1) {
                  handleJumpLessonTime(0);
                  setLessonPaused(false);
                  lessonPausedRef.current = false;
                } else {
                  setLessonPaused((p) => !p);
                }
              }}
              className={`p-2 rounded-xl cursor-pointer shrink-0 transition-colors ${
                darkMode
                  ? 'bg-white text-slate-950 hover:bg-slate-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
              title={lessonPaused ? 'Play lesson' : 'Pause lesson'}
            >
              {lessonPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>

            <span className="text-xs font-mono font-bold tabular-nums shrink-0 min-w-[74px]">
              {formatClock(lessonTimeSec)} / {formatClock(LESSON_DURATION_SEC)}
            </span>

            <div className="flex-1 min-w-[200px] grid grid-cols-4 gap-1.5 items-center">
              {LESSON_CHAPTERS.map((ch) => {
                const segLen = ch.endSec - ch.startSec;
                const fill = Math.max(0, Math.min(1, (lessonTimeSec - ch.startSec) / segLen));
                return (
                  <button
                    key={ch.index}
                    type="button"
                    onClick={() => handleJumpLessonTime(ch.startSec + 0.1)}
                    title={`Jump to ${ch.index + 1}. ${ch.title}`}
                    className={`h-2.5 rounded-full overflow-hidden cursor-pointer ${
                      darkMode ? 'bg-white/15' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className="h-full bg-emerald-500 transition-all duration-100"
                      style={{ width: `${Math.round(fill * 100)}%` }}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setLessonSpeed((s) => (s === 1 ? 0.75 : s === 0.75 ? 1.5 : 1))}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer shrink-0 ${
                darkMode
                  ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#242c42]'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
              title="Change lesson speed"
            >
              {lessonSpeed}×
            </button>

            <button
              type="button"
              onClick={handleTakeOverFromHere}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer shrink-0 transition-colors ${
                darkMode
                  ? 'bg-[#1c2231] border-white/[0.16] text-white hover:bg-[#273046]'
                  : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'
              }`}
            >
              Take over from here
            </button>
          </div>
        ) : (
          !dockCollapsed && (
            <div className="px-4 py-3.5 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-center text-xs">
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

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleResetOptimal}
                    className={`w-full sm:w-auto px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      darkMode
                        ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#252d40]'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Optimal Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Photosynthesis3DSimulation;
