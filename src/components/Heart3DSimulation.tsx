import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Tag,
  Target,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import imgHumanHeartStudio from '../assets/images/sim_human_heart_3d_1795283136171.jpg';

export interface Heart3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';
type CardiacPhaseId = 'atrial_systole' | 'ventricular_systole' | 'diastole';
type InspectPartId =
  | 'overview'
  | 'right_atrium'
  | 'right_ventricle'
  | 'left_atrium'
  | 'left_ventricle'
  | 'aorta'
  | 'pulmonary_artery'
  | 'vena_cava'
  | 'septum'
  | 'valves';

interface PartExplanation {
  id: InspectPartId;
  name: string;
  bloodType: 'Oxygenated' | 'Deoxygenated' | 'Muscular Structure' | 'Valves' | 'Double Circulation';
  oSummary: string;
  aSummary: string;
  // Normalized image coordinates u in [0,1] (left->right), v in [0,1] (bottom->top, matching WebGL UV!)
  u: number;
  v: number;
  hitRadius: number;
}

interface HeartLessonChapter {
  id: number;
  title: string;
  startSec: number;
  endSec: number;
  bpm: number;
  slowMo: boolean;
  showConduction: boolean;
  focusPart: InspectPartId;
  oCaption: string;
  aCaption: string;
}

interface HeartChallenge {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  check: (ctx: {
    bpm: number;
    slowMo: boolean;
    cardiacOutputLMin: number;
    inspectedParts: Record<string, boolean>;
    phase: CardiacPhaseId;
  }) => boolean;
}

interface ProjectedLabel {
  id: string;
  partId: InspectPartId;
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

const LESSON_DURATION_SEC = 65;

// Plane dimensions matching 16:9 studio heart image
const PLANE_W = 9.6;
const PLANE_H = 5.4;

const PART_INFO: Record<InspectPartId, PartExplanation> = {
  overview: {
    id: 'overview',
    name: 'Human Heart & Double Circulation',
    bloodType: 'Double Circulation',
    oSummary:
      'Blood passes through the heart twice in one complete circuit: the right side (blue) pumps deoxygenated blood to the lungs, and the left side (red) pumps oxygenated blood to the whole body.',
    aSummary:
      'Mammalian double circulation maintains high systemic arterial pressure (left ventricle → aorta) while keeping low pulmonary capillary pressure (right ventricle → lungs) to protect delicate alveoli.',
    u: 0.5,
    v: 0.5,
    hitRadius: 0,
  },
  right_atrium: {
    id: 'right_atrium',
    name: 'Right Atrium (RA)',
    bloodType: 'Deoxygenated',
    oSummary:
      'Receives deoxygenated blood from the Vena Cava. Contracts first during Atrial Systole to squeeze blood down past the tricuspid valve into the right ventricle.',
    aSummary:
      'Houses the Sinoatrial (SA) node pacemaker. Atrial contraction contributes the final ~20% of right ventricular filling across the open tricuspid valve.',
    u: 0.386,
    v: 0.545,
    hitRadius: 0.06,
  },
  right_ventricle: {
    id: 'right_ventricle',
    name: 'Right Ventricle (RV)',
    bloodType: 'Deoxygenated',
    oSummary:
      'Contracts inward during Ventricular Systole to pump deoxygenated blood up the pulmonary artery to the lungs, then expands wide during Diastole to refill.',
    aSummary:
      'Thinner myocardium generates ~25 mmHg systolic pressure — ideal for the short, low-resistance pulmonary circuit without damaging alveolar capillaries.',
    u: 0.472,
    v: 0.305,
    hitRadius: 0.07,
  },
  left_atrium: {
    id: 'left_atrium',
    name: 'Left Atrium (LA)',
    bloodType: 'Oxygenated',
    oSummary:
      'Receives bright-red oxygenated blood from the lungs through the four pulmonary veins and contracts to push blood across the bicuspid valve into the left ventricle.',
    aSummary:
      'Acts as a low-pressure receiving reservoir from the pulmonary veins; atrial systole primes left ventricular end-diastolic volume prior to isovolumetric contraction.',
    u: 0.578,
    v: 0.602,
    hitRadius: 0.055,
  },
  left_ventricle: {
    id: 'left_ventricle',
    name: 'Left Ventricle (LV)',
    bloodType: 'Oxygenated',
    oSummary:
      'Has the thickest muscular wall (~3× thicker than the right ventricle). Squeezes forcefully inward to shoot oxygenated blood through the aorta around the entire body.',
    aSummary:
      'Thick myocardium generates ~120 mmHg peak systolic pressure to overcome systemic peripheral resistance, ejecting oxygenated blood through the aortic semilunar valve.',
    u: 0.606,
    v: 0.34,
    hitRadius: 0.072,
  },
  aorta: {
    id: 'aorta',
    name: 'Aorta & Aortic Arch',
    bloodType: 'Oxygenated',
    oSummary:
      'The largest artery in the body. Its thick elastic walls visibly expand with each ventricular surge and carry oxygenated blood to the head, arms, and body.',
    aSummary:
      'Elastic tunica media stretches during ventricular ejection and recoils during diastole (Windkessel effect), maintaining smooth continuous arterial perfusion.',
    u: 0.486,
    v: 0.825,
    hitRadius: 0.068,
  },
  pulmonary_artery: {
    id: 'pulmonary_artery',
    name: 'Pulmonary Artery',
    bloodType: 'Deoxygenated',
    oSummary:
      'The only artery carrying deoxygenated blood. It expands with each right-ventricular contraction and branches left and right to deliver blood to the lungs.',
    aSummary:
      'Guarded at its base by the pulmonary semilunar valve, which snaps shut in early diastole to prevent backflow into the relaxing right ventricle.',
    u: 0.525,
    v: 0.715,
    hitRadius: 0.055,
  },
  vena_cava: {
    id: 'vena_cava',
    name: 'Superior & Inferior Vena Cava',
    bloodType: 'Deoxygenated',
    oSummary:
      'Large veins returning low-pressure deoxygenated blood from the head, arms, and lower body directly into the right atrium.',
    aSummary:
      'Low-pressure venous capacitance vessels returning systemic venous blood to the right atrium assisted by skeletal muscle pumping and thoracic pressure gradients.',
    u: 0.392,
    v: 0.78,
    hitRadius: 0.055,
  },
  septum: {
    id: 'septum',
    name: 'Interventricular Septum',
    bloodType: 'Muscular Structure',
    oSummary:
      'A thick central muscular wall separating the right and left sides of the heart so oxygen-rich and oxygen-poor blood never mix.',
    aSummary:
      'Interventricular septum conducts the Bundle of His and bundle branches downward to the apex so ventricular contraction sweeps upward toward the semilunar valves.',
    u: 0.542,
    v: 0.355,
    hitRadius: 0.05,
  },
  valves: {
    id: 'valves',
    name: 'Heart Valves & Chordae Tendineae',
    bloodType: 'Valves',
    oSummary:
      'Tricuspid, bicuspid, and semilunar valves prevent backflow of blood. White chordae tendineae hold the AV valve flaps firm during ventricular contraction.',
    aSummary:
      'Atrioventricular valves close at QRS onset (producing S1 "LUB"); semilunar valves close after the T wave (producing S2 "DUB"). Papillary muscles tense chordae tendineae during systole.',
    u: 0.422,
    v: 0.422,
    hitRadius: 0.052,
  },
};

const HEART_LESSON_CHAPTERS: HeartLessonChapter[] = [
  {
    id: 1,
    title: 'Right Heart & Pulmonary Flow',
    startSec: 0,
    endSec: 16,
    bpm: 64,
    slowMo: false,
    showConduction: false,
    focusPart: 'right_ventricle',
    oCaption:
      'Watch the Right Atrium contract first, pushing blue deoxygenated blood past the Tricuspid Valve into the expanding Right Ventricle, which then squeezes blood up the Pulmonary Artery to the lungs.',
    aCaption:
      'The low-pressure pulmonary circuit channels venous return from the venae cavae across the tricuspid and pulmonary semilunar valves to alveolar capillaries for oxygenation.',
  },
  {
    id: 2,
    title: 'Left Heart & Systemic Surge',
    startSec: 16,
    endSec: 33,
    bpm: 66,
    slowMo: false,
    showConduction: false,
    focusPart: 'left_ventricle',
    oCaption:
      'Watch the thick-walled Left Ventricle powerfully contract inward and push bright-red oxygenated blood up into the Aorta — notice how the Aortic Arch visibly expands with each pulse!',
    aCaption:
      'Left ventricular myocardium (~3× thicker than RV) contracts forcefully to generate ~120 mmHg, driving systolic expansion (Windkessel recoil) of the elastic aortic arch.',
  },
  {
    id: 3,
    title: 'Contraction, Expansion & LUB–DUB',
    startSec: 33,
    endSec: 50,
    bpm: 72,
    slowMo: true,
    showConduction: false,
    focusPart: 'valves',
    oCaption:
      'In slow motion, watch the rhythm: Atria squeeze first (P wave), then AV valves shut ("LUB") as ventricles contract inward, and finally ventricles expand wide in Diastole ("DUB") to refill.',
    aCaption:
      'S1 ("LUB") marks AV valve closure at ventricular systole onset (QRS); S2 ("DUB") marks semilunar closure as ventricles enter diastole and expand to refill.',
  },
  {
    id: 4,
    title: 'Conduction Wave & Sprint Mode',
    startSec: 50,
    endSec: 65,
    bpm: 155,
    slowMo: false,
    showConduction: true,
    focusPart: 'septum',
    oCaption:
      'During sprinting, the SA Node pacemaker accelerates to 155 BPM! Golden electrical waves race down the septum so the ventricles contract and expand rapidly, tripling Cardiac Output.',
    aCaption:
      'Sympathetic drive accelerates SA node firing (155 BPM) and increases stroke volume, raising Cardiac Output (CO = HR × SV) from ~5 L/min at rest to over 13 L/min.',
  },
];

const HEART_CHALLENGES: HeartChallenge[] = [
  {
    id: 'slow-mo-valves',
    title: '1. Watch Contraction in Slow Motion',
    prompt: 'Enable Slow Motion (0.35×) and observe the ventricles contracting inward during Ventricular Systole.',
    hint: 'Click the Slow-Mo toggle in the bottom dock and watch the chambers contract and expand.',
    check: (ctx) => ctx.slowMo && ctx.phase === 'ventricular_systole',
  },
  {
    id: 'sprint-output',
    title: '2. Reach Sprint Cardiac Output',
    prompt: 'Raise the Heart Rate to at least 150 BPM so Cardiac Output exceeds 12.0 L/min.',
    hint: 'Click Sprint (165) or drag the Heart Rate slider above 150 BPM.',
    check: (ctx) => ctx.bpm >= 150 && ctx.cardiacOutputLMin >= 12.0,
  },
  {
    id: 'compare-ventricles',
    title: '3. Compare Both Ventricles Directly',
    prompt: 'Click directly on both the Right Ventricle (blue side) and Left Ventricle (red side) on the beating heart.',
    hint: 'Click the lower-left blue chamber and the thick-walled lower-right red chamber.',
    check: (ctx) =>
      Boolean(ctx.inspectedParts.right_ventricle) && Boolean(ctx.inspectedParts.left_ventricle),
  },
];

// Normalized UV blood-flow splines (u: 0..1 left->right, v: 0..1 bottom->top) mapped exactly to studio render chambers!
const BLUE_UV_SEGS: CubicSeg[] = [
  { p0: [0.393, 0.90], p1: [0.392, 0.77], p2: [0.390, 0.64], p3: [0.396, 0.525] }, // SVC -> RA
  { p0: [0.396, 0.525], p1: [0.404, 0.452], p2: [0.435, 0.388], p3: [0.498, 0.275] }, // RA -> Tricuspid -> RV apex
  { p0: [0.498, 0.275], p1: [0.468, 0.364], p2: [0.466, 0.468], p3: [0.474, 0.552] }, // RV -> Pulmonary Valve
  { p0: [0.474, 0.552], p1: [0.484, 0.648], p2: [0.500, 0.720], p3: [0.548, 0.737] }, // Pulmonary Trunk
  { p0: [0.548, 0.737], p1: [0.580, 0.744], p2: [0.615, 0.747], p3: [0.652, 0.748] }, // Left Pulmonary Artery -> Lungs
];

const RED_UV_SEGS: CubicSeg[] = [
  { p0: [0.654, 0.620], p1: [0.622, 0.623], p2: [0.590, 0.618], p3: [0.576, 0.574] }, // Pulmonary Veins -> LA
  { p0: [0.576, 0.574], p1: [0.576, 0.512], p2: [0.592, 0.420], p3: [0.608, 0.318] }, // LA -> Bicuspid -> LV apex
  { p0: [0.608, 0.318], p1: [0.582, 0.392], p2: [0.546, 0.478], p3: [0.524, 0.552] }, // LV -> Aortic Valve
  { p0: [0.524, 0.552], p1: [0.492, 0.634], p2: [0.452, 0.660], p3: [0.448, 0.738] }, // Ascending Aorta
  { p0: [0.448, 0.738], p1: [0.448, 0.818], p2: [0.488, 0.850], p3: [0.520, 0.798] }, // Aortic Arch -> Body
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

function sampleUvPath(segs: CubicSeg[], u: number): [number, number] {
  const clamped = ((u % 1) + 1) % 1;
  const scaled = clamped * segs.length;
  const idx = Math.min(segs.length - 1, Math.floor(scaled));
  return evalCubic(segs[idx], scaled - idx);
}

interface LabelAnchorUV {
  id: string;
  partId: InspectPartId;
  text: string;
  u: number;
  v: number;
  offsetX: number;
  offsetY: number;
}

const CALLOUT_UV_ANCHORS: LabelAnchorUV[] = [
  { id: 'svc', partId: 'vena_cava', text: 'Superior Vena Cava', u: 0.39, v: 0.84, offsetX: -124, offsetY: -18 },
  { id: 'aorta', partId: 'aorta', text: 'Aorta (To Body)', u: 0.49, v: 0.88, offsetX: 112, offsetY: -24 },
  { id: 'pulm', partId: 'pulmonary_artery', text: 'Pulmonary Artery', u: 0.59, v: 0.74, offsetX: 118, offsetY: -12 },
  { id: 'ra', partId: 'right_atrium', text: 'Right Atrium', u: 0.365, v: 0.56, offsetX: -115, offsetY: -8 },
  { id: 'la', partId: 'left_atrium', text: 'Left Atrium', u: 0.605, v: 0.60, offsetX: 112, offsetY: 4 },
  { id: 'valves', partId: 'valves', text: 'Tricuspid Valve', u: 0.415, v: 0.42, offsetX: -118, offsetY: 16 },
  { id: 'rv', partId: 'right_ventricle', text: 'Right Ventricle', u: 0.465, v: 0.28, offsetX: -122, offsetY: 36 },
  { id: 'lv', partId: 'left_ventricle', text: 'Left Ventricle (Thick Wall)', u: 0.642, v: 0.31, offsetX: 116, offsetY: 34 },
];

function formatLessonTime(sec: number): string {
  const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, Math.floor(sec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getLessonChapter(sec: number): HeartLessonChapter {
  for (const ch of HEART_LESSON_CHAPTERS) {
    if (sec < ch.endSec) return ch;
  }
  return HEART_LESSON_CHAPTERS[HEART_LESSON_CHAPTERS.length - 1];
}

function getCardiacPhase(cycleT: number): CardiacPhaseId {
  if (cycleT < 0.18) return 'atrial_systole';
  if (cycleT < 0.46) return 'ventricular_systole';
  return 'diastole';
}

function sampleEcgVoltage(u: number): number {
  const gauss = (x: number, mu: number, sigma: number) =>
    Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  const p = 0.22 * gauss(u, 0.09, 0.028);
  const q = -0.18 * gauss(u, 0.195, 0.009);
  const r = 1.05 * gauss(u, 0.22, 0.011);
  const s = -0.32 * gauss(u, 0.245, 0.01);
  const t = 0.34 * gauss(u, 0.44, 0.042);
  return p + q + r + s + t;
}

function playHeartSound(
  audioCtxRef: React.MutableRefObject<AudioContext | null>,
  type: 'lub' | 'dub'
) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = type === 'lub' ? 62 : 84;
    const endFreq = type === 'lub' ? 32 : 44;
    const dur = type === 'lub' ? 0.12 : 0.09;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(type === 'lub' ? 0.24 : 0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  } catch {
    // Ignore autoplay restrictions
  }
}

/**
 * Cleanly isolates the photorealistic studio cutaway heart onto a 100% transparent canvas
 * using exterior edge-seeded BFS flood-fill + bottom shadow strip removal + soft alpha feathering,
 * guaranteeing ZERO visible rectangle/screen edge in BOTH Dark and Light modes while keeping
 * every internal white valve and chordae tendineae pixel untouched!
 */
function createTransparentHeartCanvasTexture(
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

    // Exterior cool-gray studio backdrop + bottom detached floor shadow detector
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

      // Studio backdrop is cool-neutral gray (low saturation, b >= r - 4, light/mid-light luminance)
      if (sat < 26 && lum > 150 && b >= r - 6) return true;
      // Cleanly remove the detached soft shadow ellipse near the very bottom of the studio image
      if (y > h * 0.9 && sat < 24 && lum > 95) return true;
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

    // Seed strictly from the 4 outer borders so interior white valves are 100% protected!
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

    // Apply clean transparency + 2-pixel soft edge feathering + fringe decontamination
    const alphaMask = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      alphaMask[i] = isBg[i] ? 0 : 255;
    }

    // Soften 2-pixel silhouette border against neutral edge pixels
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
            if (sat < 42) {
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
 * Computes the real-time anatomical vertex position (x, y, z) on the 3D beating cutaway heart
 * for any normalized UV coordinate (u in [0,1], v in [0,1]) given the current cardiac cycle signals:
 * - atrialContract: >0 when atria contract inward, <0 when atria expand outward
 * - ventContract: >0 when ventricles contract powerfully inward, <0 when ventricles expand in diastole
 * - arterialExpand: >0 when Aorta & Pulmonary Artery expand outward during systolic ejection!
 */
function computeDeformedHeartPoint(
  u: number,
  v: number,
  atrialContract: number,
  ventContract: number,
  arterialExpand: number,
  out: THREE.Vector3
) {
  let x = (u - 0.5) * PLANE_W;
  let y = (v - 0.5) * PLANE_H;

  // Base organic 3D anatomical relief curvature so rotating the heart reveals sculpted 3D depth!
  const dxHeart = (u - 0.50) / 0.22;
  const dyHeart = (v - 0.48) / 0.38;
  const r2Heart = dxHeart * dxHeart + dyHeart * dyHeart;
  let z = 0.58 * Math.exp(-r2Heart * 0.78);

  // Subtle recessed interior cavity depth inside the 4 open chambers
  const cavRA = Math.exp(-((u - 0.388) ** 2 / 0.0022 + (v - 0.545) ** 2 / 0.0055));
  const cavLA = Math.exp(-((u - 0.578) ** 2 / 0.0018 + (v - 0.602) ** 2 / 0.0045));
  const cavRV = Math.exp(-((u - 0.468) ** 2 / 0.0042 + (v - 0.315) ** 2 / 0.0095));
  const cavLV = Math.exp(-((u - 0.602) ** 2 / 0.0032 + (v - 0.345) ** 2 / 0.009));
  z -= (cavRA * 0.16 + cavLA * 0.14 + cavRV * 0.22 + cavLV * 0.22);

  // 1. ATRIAL CONTRACTION & EXPANSION (Right Atrium & Left Atrium)
  const duRA = u - 0.386;
  const dvRA = v - 0.545;
  const wRA = Math.exp(-(duRA * duRA / 0.0048 + dvRA * dvRA / 0.012));

  const duLA = u - 0.578;
  const dvLA = v - 0.602;
  const wLA = Math.exp(-(duLA * duLA / 0.0045 + dvLA * dvLA / 0.011));

  // Pull radially inward toward each atrium center on contraction; push outward on expansion!
  x -= (duRA * wRA + duLA * wLA) * atrialContract * 1.65;
  y -= (dvRA * wRA + dvLA * wLA) * atrialContract * 1.15;
  z += (wRA + wLA) * (-atrialContract * 0.16);

  // 2. POWERFUL VENTRICULAR CONTRACTION & DIASTOLIC EXPANSION (Right & Left Ventricles + Apex Lift!)
  const duV = u - 0.542; // Center of ventricular mass along septum
  const dvV = v - 0.345;
  const wVent = Math.exp(-(duV * duV / 0.028 + dvV * dvV / 0.042));

  // Extra strong inward squeeze specifically on the thick muscular Left Ventricle wall!
  const duLV = u - 0.575;
  const dvLV = v - 0.34;
  const wLV = Math.exp(-(duLV * duLV / 0.014 + dvLV * dvLV / 0.028));

  // Extra squeeze on Right Ventricle lower wall
  const duRV = u - 0.465;
  const dvRV = v - 0.315;
  const wRV = Math.exp(-(duRV * duRV / 0.012 + dvRV * dvRV / 0.024));

  // Radial inward squeeze during systole (ventContract > 0) and wide outward expansion during diastole (ventContract < 0)!
  const squeezeX = (duV * wVent * 1.35 + duLV * wLV * 0.95 + duRV * wRV * 0.72) * ventContract;
  const squeezeY = (dvV * wVent * 0.95 + dvLV * wLV * 0.65 + dvRV * wRV * 0.55) * ventContract;

  // Authentic upward apex wringing/lift during ventricular systole!
  const apexMask = Math.max(0, (0.48 - v) / 0.38) * wVent;
  const apexLiftY = apexMask * ventContract * 0.24;
  const apexTwistX = apexMask * ventContract * 0.09;

  x = x - squeezeX + apexTwistX;
  y = y - squeezeY + apexLiftY;
  // Contracting myocardium thickens & bulges slightly forward in Z; relaxing myocardium flattens smoothly
  z += (wVent * 0.28 + wLV * 0.16) * ventContract;

  // 3. ELASTIC ARTERIAL PULSE EXPANSION (Aortic Arch & Pulmonary Artery swell outward during ejection!)
  const duAo = u - 0.49;
  const dvAo = v - 0.81;
  const wAo = Math.exp(-(duAo * duAo / 0.008 + dvAo * dvAo / 0.014));

  const duPa = u - 0.51;
  const dvPa = v - 0.715;
  const wPa = Math.exp(-(duPa * duPa / 0.007 + dvPa * dvPa / 0.010));

  x += (duAo * wAo * 1.05 + duPa * wPa * 0.85) * arterialExpand;
  y += (dvAo * wAo * 0.75 + dvPa * wPa * 0.55) * arterialExpand;
  z += (wAo * 0.22 + wPa * 0.16) * arterialExpand;

  out.set(x, y, z);
}

// Reusable scratch math objects (zero per-frame GC allocations)
const _vPos = new THREE.Vector3();
const _vNext = new THREE.Vector3();
const _vProj = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

export const Heart3DSimulation: React.FC<Heart3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 2',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Interactive playback & physiology state
  const [bpm, setBpm] = useState<number>(72);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [slowMo, setSlowMo] = useState<boolean>(false);
  const [showConduction, setShowConduction] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [level, setLevel] = useState<SyllabusLevel>(() =>
    activeClass.includes('5') || activeClass.includes('6') ? 'a_level' : 'o_level'
  );
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live synced display state
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [cycleProgressDisplay, setCycleProgressDisplay] = useState<number>(0);
  const [cyclePhaseDisplay, setCyclePhaseDisplay] = useState<CardiacPhaseId>('diastole');
  const [chamberActionLabel, setChamberActionLabel] = useState<string>('Ventricles Expanding (Refilling)');

  // Click-to-inspect & challenges
  const [selectedPart, setSelectedPart] = useState<InspectPartId>('overview');
  const [inspectedParts, setInspectedParts] = useState<Record<string, boolean>>({});
  const [challengeOpen, setChallengeOpen] = useState<boolean>(false);
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});

  // Guided 1:05 Lesson state
  const [watchLessonActive, setWatchLessonActive] = useState<boolean>(false);
  const [lessonTime, setLessonTime] = useState<number>(0);
  const [lessonPaused, setLessonPaused] = useState<boolean>(false);
  const [lessonSpeed, setLessonSpeed] = useState<0.75 | 1 | 1.5>(1);

  // Derived cardiovascular metrics
  const strokeVolumeMl = useMemo(() => {
    const exerciseFactor = Math.max(0, Math.min(1, (bpm - 65) / 105));
    return Math.round(70 + exerciseFactor * 22);
  }, [bpm]);

  const cardiacOutputLMin = useMemo(
    () => Number(((bpm * strokeVolumeMl) / 1000).toFixed(1)),
    [bpm, strokeVolumeMl]
  );

  const bloodPressureLabel = useMemo(() => {
    const exerciseFactor = Math.max(0, Math.min(1, (bpm - 65) / 105));
    const sys = Math.round(118 + exerciseFactor * 44);
    const dia = Math.round(78 + exerciseFactor * 8);
    return `${sys}/${dia} mmHg`;
  }, [bpm]);

  const activeLessonChapter = useMemo(() => getLessonChapter(lessonTime), [lessonTime]);

  // Refs for stable WebGL loop
  const bpmRef = useRef(bpm);
  const isPlayingRef = useRef(isPlaying);
  const slowMoRef = useRef(slowMo);
  const showConductionRef = useRef(showConduction);
  const soundEnabledRef = useRef(soundEnabled);
  const showLabelsRef = useRef(showLabels);
  const darkModeRef = useRef(darkMode);
  const selectedPartRef = useRef<InspectPartId>(selectedPart);
  const watchLessonRef = useRef(watchLessonActive);
  const lessonTimeRef = useRef(0);
  const lessonPausedRef = useRef(false);
  const lessonSpeedRef = useRef(1);
  const lastChapterIdRef = useRef(0);
  const lastUiPushRef = useRef(0);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    slowMoRef.current = slowMo;
  }, [slowMo]);
  useEffect(() => {
    showConductionRef.current = showConduction || level === 'a_level';
  }, [showConduction, level]);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);
  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);
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

  // Auto-evaluate challenges
  useEffect(() => {
    setCompletedChallenges((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const ch of HEART_CHALLENGES) {
        if (
          !next[ch.id] &&
          ch.check({
            bpm,
            slowMo,
            cardiacOutputLMin,
            inspectedParts,
            phase: cyclePhaseDisplay,
          })
        ) {
          next[ch.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [bpm, slowMo, cardiacOutputLMin, inspectedParts, cyclePhaseDisplay]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {
        setIsFullscreen((prev) => !prev);
      });
    } else {
      document.exitFullscreen?.().catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Main Three.js Real-Time Vertex-Deforming Beating Photorealistic Heart Scene (Zero Box / Zero Screen!)
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
    const height = Math.max(mountEl.clientHeight, 360);

    const scene = new THREE.Scene();
    const bgDark = new THREE.Color(0x121621);
    const bgLight = new THREE.Color(0xe6ecf3);
    scene.background = darkModeRef.current ? bgDark.clone() : bgLight.clone();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 80);
    camera.position.set(0, 0.08, 8.9);

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
    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Soft studio lighting so 3D vertex relief & specular highlights respond dynamically as chambers contract!
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x334155, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.45);
    keyLight.position.set(3.5, 5.5, 7.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.65);
    rimLight.position.set(-5.0, -2.0, 3.0);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5.4;
    controls.maxDistance = 12.8;
    // Limit orbit angles cleanly so the cutaway anatomical face stays gracefully visible in 3D
    controls.minAzimuthAngle = -Math.PI * 0.24;
    controls.maxAzimuthAngle = Math.PI * 0.24;
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.66;
    controls.target.set(0, 0.02, 0);

    // ==================== 1. HIGH-RES VERTEX-DEFORMING PHOTOREALISTIC HEART MESH ====================
    const SEG_X = 72;
    const SEG_Y = 44;
    const heartGeo = new THREE.PlaneGeometry(PLANE_W, PLANE_H, SEG_X, SEG_Y);
    const heartPosAttr = heartGeo.attributes.position as THREE.BufferAttribute;
    const heartUvAttr = heartGeo.attributes.uv as THREE.BufferAttribute;

    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.42,
      metalness: 0.04,
      transparent: true,
      alphaTest: 0.04,
      side: THREE.DoubleSide,
    });

    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    scene.add(heartMesh);

    let loadedHeartTex: THREE.CanvasTexture | null = null;
    createTransparentHeartCanvasTexture(
      imgHumanHeartStudio,
      renderer.capabilities.getMaxAnisotropy(),
      (tex) => {
        loadedHeartTex = tex;
        heartMat.map = tex;
        heartMat.needsUpdate = true;
      }
    );

    // ==================== 2. DEFORMING 3D ANIMATED BLOOD CELLS (LOCKED TO REAL CHAMBERS!) ====================
    const CELLS_PER_SIDE = 36;
    const cellGeo = new THREE.SphereGeometry(0.056, 10, 8);
    const blueCellMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x2563eb,
      emissiveIntensity: 0.9,
      roughness: 0.18,
    });
    const redCellMat = new THREE.MeshStandardMaterial({
      color: 0xfda4af,
      emissive: 0xe11d48,
      emissiveIntensity: 0.95,
      roughness: 0.18,
    });

    const blueCells = new THREE.InstancedMesh(cellGeo, blueCellMat, CELLS_PER_SIDE);
    const redCells = new THREE.InstancedMesh(cellGeo, redCellMat, CELLS_PER_SIDE);
    blueCells.frustumCulled = false;
    redCells.frustumCulled = false;
    blueCells.renderOrder = 10;
    redCells.renderOrder = 10;
    scene.add(blueCells, redCells);

    const cellSeeds = Array.from({ length: CELLS_PER_SIDE }, (_, i) => ({
      offset: i / CELLS_PER_SIDE,
      du: ((i % 5) - 2) * 0.0022,
      dv: (((i * 3) % 5) - 2) * 0.0022,
    }));

    // ==================== 3. DYNAMIC VALVE LEAFLET INDICATORS (OPEN & SHUT ON BEAT!) ====================
    const valveLeafGeo = new THREE.BoxGeometry(0.24, 0.036, 0.05);
    const avValveMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    });
    const semiValveMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xfb7185,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    });

    const createValvePairMeshes = (mat: THREE.MeshStandardMaterial) => {
      const left = new THREE.Mesh(valveLeafGeo, mat);
      const right = new THREE.Mesh(valveLeafGeo, mat);
      left.renderOrder = 12;
      right.renderOrder = 12;
      scene.add(left, right);
      return { left, right };
    };
    const tricuspidMeshes = createValvePairMeshes(avValveMat);
    const bicuspidMeshes = createValvePairMeshes(avValveMat);
    const pulmValveMeshes = createValvePairMeshes(semiValveMat);
    const aorticValveMeshes = createValvePairMeshes(semiValveMat);

    // ==================== 4. ELECTRICAL CONDUCTION SYSTEM (SA NODE -> AV NODE -> PURKINJE) ====================
    const conductionGroup = new THREE.Group();
    const nodeGeo = new THREE.SphereGeometry(0.095, 14, 12);
    const saMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.0,
    });
    const avMat = saMat.clone();
    const saNodeMesh = new THREE.Mesh(nodeGeo, saMat);
    const avNodeMesh = new THREE.Mesh(nodeGeo, avMat);
    saNodeMesh.renderOrder = 14;
    avNodeMesh.renderOrder = 14;
    conductionGroup.add(saNodeMesh, avNodeMesh);

    const purkPointsUV: [number, number][] = [
      [0.368, 0.622],
      [0.408, 0.578],
      [0.446, 0.498],
      [0.520, 0.435],
      [0.570, 0.292],
      [0.594, 0.200],
      [0.642, 0.244],
      [0.654, 0.392],
      [0.634, 0.528],
    ];
    const purkRightUV: [number, number][] = [
      [0.570, 0.292],
      [0.505, 0.214],
      [0.424, 0.282],
      [0.376, 0.385],
    ];
    const purkPos1 = new Float32Array(purkPointsUV.length * 3);
    const purkPos2 = new Float32Array(purkRightUV.length * 3);
    const purkGeo1 = new THREE.BufferGeometry();
    purkGeo1.setAttribute('position', new THREE.BufferAttribute(purkPos1, 3));
    const purkGeo2 = new THREE.BufferGeometry();
    purkGeo2.setAttribute('position', new THREE.BufferAttribute(purkPos2, 3));
    const purkLineMat = new THREE.LineBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.9,
    });
    const purkLine1 = new THREE.Line(purkGeo1, purkLineMat);
    const purkLine2 = new THREE.Line(purkGeo2, purkLineMat);
    purkLine1.renderOrder = 13;
    purkLine2.renderOrder = 13;
    conductionGroup.add(purkLine1, purkLine2);
    scene.add(conductionGroup);

    // ==================== 5. SELECTED CHAMBER FOCUS RING ====================
    const focusRingGeo = new THREE.RingGeometry(0.42, 0.48, 36);
    const focusRingMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const focusRingMesh = new THREE.Mesh(focusRingGeo, focusRingMat);
    focusRingMesh.renderOrder = 15;
    focusRingMesh.visible = false;
    scene.add(focusRingMesh);

    // ==================== CLICK-TO-INSPECT RAYCASTING ON DEFORMED HEART MESH ====================
    let pointerDownPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_ndc, camera);
      const hits = _raycaster.intersectObject(heartMesh, false);
      if (hits.length > 0 && hits[0].uv) {
        const { x: hu, y: hv } = hits[0].uv;
        let bestId: InspectPartId | null = null;
        let bestDist = Infinity;
        (Object.keys(PART_INFO) as InspectPartId[]).forEach((pid) => {
          if (pid === 'overview') return;
          const info = PART_INFO[pid];
          const d = Math.hypot(hu - info.u, (hv - info.v) * 0.72);
          if (d < info.hitRadius * 1.45 && d < bestDist) {
            bestDist = d;
            bestId = pid;
          }
        });
        if (bestId) {
          setSelectedPart(bestId);
          setInspectedParts((prev) => ({ ...prev, [bestId!]: true }));
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
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

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let cycleT = 0;
    let flowClock = 0;

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

    function updateScene(delta: number) {
      const isDark = darkModeRef.current;
      scene.background = isDark ? bgDark : bgLight;

      // Advance 1:05 Guided Lesson
      if (watchLessonRef.current && !lessonPausedRef.current) {
        const nextSec = lessonTimeRef.current + delta * lessonSpeedRef.current;
        if (nextSec >= LESSON_DURATION_SEC) {
          lessonTimeRef.current = LESSON_DURATION_SEC;
          setLessonTime(LESSON_DURATION_SEC);
          lessonPausedRef.current = true;
          setLessonPaused(true);
        } else {
          lessonTimeRef.current = nextSec;
          setLessonTime(nextSec);
          const ch = getLessonChapter(nextSec);
          if (ch.id !== lastChapterIdRef.current) {
            lastChapterIdRef.current = ch.id;
            setBpm(ch.bpm);
            setSlowMo(ch.slowMo);
            setShowConduction(ch.showConduction);
            setSelectedPart(ch.focusPart);
            setIsPlaying(true);
          }
        }
      }

      // Advance Cardiac Cycle & LUB-DUB sound triggers
      const prevCycle = cycleT;
      if (isPlayingRef.current) {
        const beatsPerSec = bpmRef.current / 60;
        const speedScale = slowMoRef.current ? 0.35 : 1.0;
        cycleT = (cycleT + delta * beatsPerSec * speedScale) % 1.0;
        const surge =
          cycleT >= 0.18 && cycleT < 0.48
            ? 1.75 * Math.sin(((cycleT - 0.18) / 0.3) * Math.PI)
            : 0.42;
        flowClock += delta * beatsPerSec * speedScale * (0.3 + surge * 0.28);

        if (soundEnabledRef.current) {
          if (prevCycle < 0.18 && cycleT >= 0.18) {
            playHeartSound(audioCtxRef, 'lub');
          } else if (prevCycle < 0.46 && cycleT >= 0.46) {
            playHeartSound(audioCtxRef, 'dub');
          }
        }
      }

      // ==================== PHYSIOLOGICAL CONTRACTION & EXPANSION WAVEFORMS ====================
      // Atrial signal: contracts strongly (+1.0) during Atrial Systole (0.00 -> 0.20), expands gently (-0.42) while refilling!
      const atrialContract =
        cycleT < 0.21
          ? Math.sin((cycleT / 0.21) * Math.PI) * 1.1
          : -0.42 * Math.sin(((cycleT - 0.21) / 0.79) * Math.PI);

      // Ventricular signal:
      // - Gently expands (-0.35 -> -0.68) during atrial topping-up & diastolic refilling
      // - POWERFULLY contracts inward (+1.25) during Ventricular Systole (0.18 -> 0.46)!
      let ventContract: number;
      if (cycleT < 0.18) {
        // Passive + atrial filling -> ventricles expand outward!
        ventContract = -0.38 - 0.32 * Math.sin((cycleT / 0.18) * Math.PI);
      } else if (cycleT < 0.46) {
        // Ventricular Systole -> strong inward contraction & apex lift!
        const u = (cycleT - 0.18) / 0.28;
        ventContract = -0.35 + 1.62 * Math.pow(Math.sin(u * Math.PI), 0.75);
      } else {
        // Cardiac Diastole -> smooth relaxation & outward expansion!
        const u = (cycleT - 0.46) / 0.54;
        ventContract = -0.35 - 0.45 * Math.sin(u * Math.PI * 0.85);
      }

      // Arterial Windkessel expansion right after ventricular ejection (0.21 -> 0.54)
      const arterialExpand =
        cycleT >= 0.21 && cycleT < 0.55
          ? Math.sin(((cycleT - 0.21) / 0.34) * Math.PI) * 1.15
          : 0;

      // 1. Deform every vertex of the photorealistic heart mesh in real time!
      for (let i = 0; i < heartPosAttr.count; i++) {
        const u = heartUvAttr.getX(i);
        const v = heartUvAttr.getY(i);
        computeDeformedHeartPoint(u, v, atrialContract, ventContract, arterialExpand, _vPos);
        heartPosAttr.setXYZ(i, _vPos.x, _vPos.y, _vPos.z);
      }
      heartPosAttr.needsUpdate = true;
      heartGeo.computeVertexNormals();

      // 2. Position all 72 glowing blood cells along the DEFORMED chamber surfaces!
      for (let i = 0; i < CELLS_PER_SIDE; i++) {
        const seed = cellSeeds[i];

        // Blue deoxygenated cells
        const bu = (seed.offset + flowClock * 0.42) % 1;
        const [bxU, byV] = sampleUvPath(BLUE_UV_SEGS, bu);
        computeDeformedHeartPoint(
          bxU + seed.du,
          byV + seed.dv,
          atrialContract,
          ventContract,
          arterialExpand,
          _vPos
        );
        _vPos.z += 0.14;
        const bScale = 0.6 + Math.sin(bu * Math.PI) * 0.58;
        _quat.identity();
        _scale.setScalar(bScale);
        _mat4.compose(_vPos, _quat, _scale);
        blueCells.setMatrixAt(i, _mat4);

        // Red oxygenated cells
        const ru = (seed.offset + flowClock * 0.45) % 1;
        const [rxU, ryV] = sampleUvPath(RED_UV_SEGS, ru);
        computeDeformedHeartPoint(
          rxU + seed.du,
          ryV + seed.dv,
          atrialContract,
          ventContract,
          arterialExpand,
          _vPos
        );
        _vPos.z += 0.14;
        const rScale = 0.6 + Math.sin(ru * Math.PI) * 0.58;
        _scale.setScalar(rScale);
        _mat4.compose(_vPos, _quat, _scale);
        redCells.setMatrixAt(i, _mat4);
      }
      blueCells.instanceMatrix.needsUpdate = true;
      redCells.instanceMatrix.needsUpdate = true;

      // 3. Articulate 3D Valve Leaflets directly on the deformed valve positions!
      const isVentSystole = cycleT >= 0.18 && cycleT < 0.46;
      const avOpen = isVentSystole ? 0.08 : 0.72; // Shut flat during Ventricular Systole ("LUB")!
      const semiOpen = isVentSystole ? 0.78 : 0.06; // Open wide during Ventricular Systole, shut during Diastole ("DUB")!
      avValveMat.emissive.setHex(isVentSystole ? 0xf59e0b : 0x38bdf8);
      semiValveMat.emissive.setHex(isVentSystole ? 0xf43f5e : 0x64748b);

      const placeValvePair = (
        pair: { left: THREE.Mesh; right: THREE.Mesh },
        u: number,
        v: number,
        openAngle: number,
        upward: boolean
      ) => {
        computeDeformedHeartPoint(u, v, atrialContract, ventContract, arterialExpand, _vPos);
        const dir = upward ? 1 : -1;
        pair.left.position.set(_vPos.x - 0.11, _vPos.y, _vPos.z + 0.16);
        pair.right.position.set(_vPos.x + 0.11, _vPos.y, _vPos.z + 0.16);
        pair.left.rotation.z = dir * openAngle;
        pair.right.rotation.z = -dir * openAngle;
      };

      placeValvePair(tricuspidMeshes, 0.422, 0.422, avOpen, false);
      placeValvePair(bicuspidMeshes, 0.584, 0.51, avOpen, false);
      placeValvePair(pulmValveMeshes, 0.474, 0.542, semiOpen, true);
      placeValvePair(aorticValveMeshes, 0.524, 0.544, semiOpen, true);

      // 4. Electrical Conduction System locked onto deformed myocardium!
      conductionGroup.visible = showConductionRef.current;
      if (conductionGroup.visible) {
        const saPulse = Math.exp(-Math.pow((cycleT - 0.05) / 0.045, 2));
        const avPulse = Math.exp(-Math.pow((cycleT - 0.16) / 0.045, 2));
        const purkPulse = Math.exp(-Math.pow((cycleT - 0.25) / 0.07, 2));

        computeDeformedHeartPoint(0.368, 0.622, atrialContract, ventContract, arterialExpand, _vPos);
        saNodeMesh.position.set(_vPos.x, _vPos.y, _vPos.z + 0.18);
        saNodeMesh.scale.setScalar(1.0 + saPulse * 0.55);
        saMat.emissiveIntensity = 0.6 + saPulse * 2.5;

        computeDeformedHeartPoint(0.446, 0.498, atrialContract, ventContract, arterialExpand, _vPos);
        avNodeMesh.position.set(_vPos.x, _vPos.y, _vPos.z + 0.18);
        avNodeMesh.scale.setScalar(0.9 + avPulse * 0.5);
        avMat.emissiveIntensity = 0.5 + avPulse * 2.5;

        for (let i = 0; i < purkPointsUV.length; i++) {
          computeDeformedHeartPoint(
            purkPointsUV[i][0],
            purkPointsUV[i][1],
            atrialContract,
            ventContract,
            arterialExpand,
            _vPos
          );
          purkPos1[i * 3] = _vPos.x;
          purkPos1[i * 3 + 1] = _vPos.y;
          purkPos1[i * 3 + 2] = _vPos.z + 0.17;
        }
        (purkGeo1.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        for (let i = 0; i < purkRightUV.length; i++) {
          computeDeformedHeartPoint(
            purkRightUV[i][0],
            purkRightUV[i][1],
            atrialContract,
            ventContract,
            arterialExpand,
            _vPos
          );
          purkPos2[i * 3] = _vPos.x;
          purkPos2[i * 3 + 1] = _vPos.y;
          purkPos2[i * 3 + 2] = _vPos.z + 0.17;
        }
        (purkGeo2.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        purkLineMat.opacity = 0.45 + purkPulse * 0.55;
      }

      // 5. Selected Part Focus Ring locked to deformed chamber!
      const sel = PART_INFO[selectedPartRef.current];
      if (sel.hitRadius > 0) {
        focusRingMesh.visible = true;
        computeDeformedHeartPoint(sel.u, sel.v, atrialContract, ventContract, arterialExpand, _vPos);
        focusRingMesh.position.set(_vPos.x, _vPos.y, _vPos.z + 0.2);
        focusRingMat.color.setHex(
          sel.bloodType === 'Oxygenated'
            ? 0xf43f5e
            : sel.bloodType === 'Deoxygenated'
            ? 0x38bdf8
            : 0xfbbf24
        );
      } else {
        focusRingMesh.visible = false;
      }

      // 6. Push throttled HUD updates (projected callouts, ECG dot, contraction/expansion text)
      const now = performance.now();
      if (now - lastUiPushRef.current > 36) {
        lastUiPushRef.current = now;
        const phase = getCardiacPhase(cycleT);
        setCycleProgressDisplay(cycleT);
        setCyclePhaseDisplay(phase);
        if (phase === 'atrial_systole') {
          setChamberActionLabel('Atria Contracting · Ventricles Expanding');
        } else if (phase === 'ventricular_systole') {
          setChamberActionLabel('Ventricles Contracting · Arteries Expanding');
        } else {
          setChamberActionLabel('All Chambers Expanding (Diastolic Refill)');
        }

        if (showLabelsRef.current) {
          const cw = renderer.domElement.clientWidth;
          const ch = renderer.domElement.clientHeight;
          const out: ProjectedLabel[] = [];
          for (const spec of CALLOUT_UV_ANCHORS) {
            computeDeformedHeartPoint(
              spec.u,
              spec.v,
              atrialContract,
              ventContract,
              arterialExpand,
              _vNext
            );
            _vProj.copy(_vNext);
            _vProj.project(camera);
            if (_vProj.z > 1) continue;
            const ax = (_vProj.x * 0.5 + 0.5) * cw;
            const ay = (-_vProj.y * 0.5 + 0.5) * ch;
            const lx = Math.max(88, Math.min(cw - 88, ax + spec.offsetX));
            const ly = Math.max(26, Math.min(ch - 26, ay + spec.offsetY));
            out.push({ id: spec.id, partId: spec.partId, text: spec.text, ax, ay, lx, ly });
          }
          setProjectedLabels(out);
        } else {
          setProjectedLabels([]);
        }
      }
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      updateScene(delta);
      controls.update();
      renderer.render(scene, camera);

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
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      controls.dispose();

      if (loadedHeartTex) loadedHeartTex.dispose();
      heartGeo.dispose();
      heartMat.dispose();
      cellGeo.dispose();
      blueCellMat.dispose();
      redCellMat.dispose();
      valveLeafGeo.dispose();
      avValveMat.dispose();
      semiValveMat.dispose();
      nodeGeo.dispose();
      saMat.dispose();
      avMat.dispose();
      purkGeo1.dispose();
      purkGeo2.dispose();
      purkLineMat.dispose();
      focusRingGeo.dispose();
      focusRingMat.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

  // Precomputed full 2-beat SVG ECG trace
  const ecgPath = useMemo(() => {
    const pts: string[] = [];
    const samples = 120;
    for (let i = 0; i <= samples; i++) {
      const frac = i / samples;
      const u = (frac * 2) % 1;
      const v = sampleEcgVoltage(u);
      const x = 6 + frac * 268;
      const y = 52 - v * 36;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  const ecgCursorX = 6 + cycleProgressDisplay * 0.5 * 268;
  const ecgCursorY = 52 - sampleEcgVoltage(cycleProgressDisplay) * 36;

  // Lesson handlers
  const handleWatchLesson = () => {
    if (watchLessonActive) {
      setWatchLessonActive(false);
      setLessonPaused(false);
      return;
    }
    lessonTimeRef.current = 0;
    lastChapterIdRef.current = 0;
    setLessonTime(0);
    setLessonPaused(false);
    lessonPausedRef.current = false;
    setIsPlaying(true);
    setWatchLessonActive(true);
    setDockCollapsed(false);
  };

  const handleScrubLesson = (sec: number) => {
    const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, sec));
    lessonTimeRef.current = clamped;
    setLessonTime(clamped);
    const ch = getLessonChapter(clamped);
    lastChapterIdRef.current = ch.id;
    setBpm(ch.bpm);
    setSlowMo(ch.slowMo);
    setShowConduction(ch.showConduction);
    setSelectedPart(ch.focusPart);
  };

  const handleCycleLessonSpeed = () => {
    setLessonSpeed((prev) => (prev === 0.75 ? 1 : prev === 1 ? 1.5 : 0.75));
  };

  const handleTakeOverFromLesson = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
  };

  const handleReset = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setBpm(72);
    setSlowMo(false);
    setShowConduction(false);
    setIsPlaying(true);
    setSelectedPart('overview');
  };

  const handleSelectPart = (partId: InspectPartId) => {
    setSelectedPart(partId);
    setInspectedParts((prev) => ({ ...prev, [partId]: true }));
  };

  const completedCount = Object.values(completedChallenges).filter(Boolean).length;
  const activePart = PART_INFO[selectedPart];

  const phaseMeta = useMemo(() => {
    if (cyclePhaseDisplay === 'atrial_systole') {
      return {
        label: 'Atrial Systole (P Wave)',
        detail: 'Atria contract inward · Ventricles expand as blood fills',
        colorDark: 'text-amber-300',
        colorLight: 'text-amber-700',
      };
    }
    if (cyclePhaseDisplay === 'ventricular_systole') {
      return {
        label: 'Ventricular Systole (QRS · "LUB")',
        detail: 'Ventricles contract forcefully · AV valves shut · Arteries expand',
        colorDark: 'text-rose-300',
        colorLight: 'text-rose-700',
      };
    }
    return {
      label: 'Cardiac Diastole (T Wave · "DUB")',
      detail: 'Semilunar valves shut · Chambers relax & expand to refill',
      colorDark: 'text-cyan-300',
      colorLight: 'text-cyan-700',
    };
  }, [cyclePhaseDisplay]);

  const surfaceBg = darkMode ? 'bg-[#121621] text-slate-100' : 'bg-[#e6ecf3] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#1b2030] border-white/[0.09] text-slate-100'
    : 'bg-slate-50 border-slate-200 text-slate-900';
  const dockBg = darkMode
    ? 'bg-[#10141f]/95 border-white/[0.12] text-slate-100'
    : 'bg-white/95 border-slate-300 text-slate-900 shadow-lg';

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
          darkMode ? 'bg-[#0f131d] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleWatchLesson}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              watchLessonActive
                ? 'bg-rose-500 text-white'
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
            <span>{watchLessonActive ? 'Stop lesson' : 'Watch lesson'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              showLabels
                ? darkMode
                  ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200'
                  : 'bg-cyan-50 border-cyan-500/60 text-cyan-800'
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
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              soundEnabled
                ? darkMode
                  ? 'bg-rose-500/20 border-rose-400/60 text-rose-200'
                  : 'bg-rose-50 border-rose-400 text-rose-800'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>LUB–DUB {soundEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => setChallengeOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              challengeOpen
                ? darkMode
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-500/60 text-emerald-800'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>
              Try Challenge ({completedCount}/{HEART_CHALLENGES.length})
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
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

      {/* OPTIONAL LAB CHALLENGES STRIP */}
      {challengeOpen && (
        <div
          className={`px-4 py-3 border-b grid grid-cols-1 md:grid-cols-3 gap-2.5 ${
            darkMode ? 'bg-[#151b29] border-white/[0.08]' : 'bg-emerald-50/50 border-slate-200'
          }`}
        >
          {HEART_CHALLENGES.map((ch) => {
            const done = Boolean(completedChallenges[ch.id]);
            return (
              <div
                key={ch.id}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  done
                    ? darkMode
                      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-100'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : darkMode
                    ? 'bg-[#1a2234] border-white/[0.08] text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-bold">
                  <span>{ch.title}</span>
                  {done && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{ch.prompt}</p>
                {!done && (
                  <p className={`text-[11px] italic ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    Tip: {ch.hint}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MAIN CONTENT: REAL-TIME DEFORMING 3D STAGE + LIVE ECG & INSPECTOR */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D INTERACTIVE CANVAS STAGE (Zero Screen Border, Real Organic Chamber Contraction & Expansion!) */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[450px] sm:h-[530px] lg:h-[600px]'
          }`}
        >
          {/* Isolated WebGL mount div */}
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Live Contraction / Expansion Quiet Text Indicator (Top-Left) */}
          {!watchLessonActive && (
            <div className="pointer-events-none absolute top-3.5 left-4">
              <div
                className={`text-xs font-bold tracking-tight ${
                  cyclePhaseDisplay === 'ventricular_systole'
                    ? 'text-rose-500'
                    : cyclePhaseDisplay === 'atrial_systole'
                    ? 'text-amber-500'
                    : darkMode
                    ? 'text-cyan-300'
                    : 'text-cyan-700'
                }`}
              >
                {chamberActionLabel}
              </div>
            </div>
          )}

          {/* 3D Projected Callout Labels (Move live with the contracting & expanding heart walls!) */}
          {showLabels && projectedLabels.length > 0 && (
            <svg className="pointer-events-none absolute inset-0 w-full h-full overflow-visible">
              {projectedLabels.map((lbl) => {
                const isSel = selectedPart === lbl.partId;
                return (
                  <g key={lbl.id}>
                    <line
                      x1={lbl.ax}
                      y1={lbl.ay}
                      x2={lbl.lx}
                      y2={lbl.ly}
                      stroke={
                        isSel
                          ? '#f43f5e'
                          : darkMode
                          ? 'rgba(226,232,240,0.62)'
                          : 'rgba(30,41,59,0.58)'
                      }
                      strokeWidth={isSel ? '1.8' : '1.2'}
                    />
                    <circle
                      cx={lbl.ax}
                      cy={lbl.ay}
                      r={isSel ? '3.5' : '2.6'}
                      fill={isSel ? '#f43f5e' : darkMode ? '#f8fafc' : '#0f172a'}
                    />
                  </g>
                );
              })}
            </svg>
          )}
          {showLabels &&
            projectedLabels.map((lbl) => {
              const isSel = selectedPart === lbl.partId;
              return (
                <button
                  key={`tag-${lbl.id}`}
                  type="button"
                  onClick={() => handleSelectPart(lbl.partId)}
                  style={{
                    left: `${lbl.lx}px`,
                    top: `${lbl.ly}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap shadow-xs border cursor-pointer transition-colors ${
                    isSel
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : darkMode
                      ? 'bg-[#0f1420] border-white/[0.16] text-white hover:border-rose-400/60'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-slate-500'
                  }`}
                >
                  {lbl.text}
                </button>
              );
            })}

          {/* Guided Lesson Caption Banner */}
          {watchLessonActive && (
            <div className="pointer-events-none absolute top-4 inset-x-4 flex justify-center">
              <div
                className={`max-w-xl px-4 py-2.5 rounded-2xl border text-center ${
                  darkMode
                    ? 'bg-[#10141f] border-rose-400/40 text-white'
                    : 'bg-white border-rose-500/40 text-slate-900 shadow-md'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  {activeLessonChapter.id} of {HEART_LESSON_CHAPTERS.length} ·{' '}
                  {activeLessonChapter.title}
                </div>
                <p className="text-xs sm:text-sm font-bold mt-0.5 leading-snug">
                  {level === 'o_level' ? activeLessonChapter.oCaption : activeLessonChapter.aCaption}
                </p>
              </div>
            </div>
          )}

          {/* Subtle Bottom Hint */}
          {!dockCollapsed && (
            <div className="pointer-events-none absolute bottom-2 inset-x-0 text-center">
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  darkMode ? 'text-slate-400 bg-[#121621]/85' : 'text-slate-600 bg-[#e6ecf3]/90'
                }`}
              >
                Drag to rotate in 3D · Scroll to zoom · Click any chamber or valve to inspect
              </span>
            </div>
          )}
        </div>

        {/* RIGHT PHYSIOLOGY MONITOR, LIVE ECG & INSPECTOR PANEL */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-5 flex flex-col justify-between gap-4 overflow-y-auto ${
            darkMode ? 'bg-[#10141e] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-4">
            {/* Live Cardiac Cycle Status + ECG Monitor */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Live ECG Trace</span>
                </div>
                <span className="text-xs font-mono font-black tabular-nums text-rose-500">
                  {bpm} BPM
                </span>
              </div>

              <svg
                viewBox="0 0 280 86"
                className={`w-full h-22 rounded-lg border ${
                  darkMode
                    ? 'bg-[#0b0f18] border-white/[0.08]'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <line x1="0" y1="22" x2="280" y2="22" stroke="rgba(16,185,129,0.14)" strokeWidth="0.7" />
                <line x1="0" y1="52" x2="280" y2="52" stroke="rgba(16,185,129,0.22)" strokeWidth="0.8" />
                <line x1="0" y1="74" x2="280" y2="74" stroke="rgba(16,185,129,0.14)" strokeWidth="0.7" />
                <path
                  d={ecgPath}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx={ecgCursorX} cy={ecgCursorY} r="4.2" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.4" />
                <text x="20" y="79" fontSize="8" fill="#94a3b8" fontFamily="monospace">P</text>
                <text x="35" y="13" fontSize="8" fill="#fb7185" fontFamily="monospace" fontWeight="bold">QRS</text>
                <text x="64" y="79" fontSize="8" fill="#38bdf8" fontFamily="monospace">T</text>
              </svg>

              <div>
                <div className={`text-xs font-black ${darkMode ? phaseMeta.colorDark : phaseMeta.colorLight}`}>
                  {phaseMeta.label}
                </div>
                <div className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {phaseMeta.detail}
                </div>
              </div>
            </div>

            {/* Cardiovascular Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-semibold opacity-70">Stroke Vol</div>
                <div className="text-sm font-black font-mono tabular-nums mt-0.5">
                  {strokeVolumeMl} mL
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-semibold opacity-70">Cardiac Out</div>
                <div className="text-sm font-black font-mono tabular-nums mt-0.5">
                  {cardiacOutputLMin} L/m
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-semibold opacity-70">Blood Press</div>
                <div className="text-xs font-black font-mono tabular-nums mt-1">
                  {bloodPressureLabel}
                </div>
              </div>
            </div>

            {/* Anatomical Structure Inspector */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-65">
                  Anatomy Inspector
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    activePart.bloodType === 'Oxygenated'
                      ? 'text-rose-500'
                      : activePart.bloodType === 'Deoxygenated'
                      ? 'text-sky-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {activePart.bloodType}
                </span>
              </div>
              <h3 className="text-base font-black tracking-tight">{activePart.name}</h3>
              <p
                className={`text-xs leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {level === 'o_level' ? activePart.oSummary : activePart.aSummary}
              </p>

              {/* Quick Part Selector Buttons */}
              <div className="flex flex-wrap gap-1 pt-1">
                {(
                  [
                    ['right_atrium', 'RA'],
                    ['right_ventricle', 'RV'],
                    ['left_atrium', 'LA'],
                    ['left_ventricle', 'LV'],
                    ['valves', 'Valves'],
                    ['aorta', 'Aorta'],
                    ['pulmonary_artery', 'Pulm. Art'],
                    ['septum', 'Septum'],
                  ] as [InspectPartId, string][]
                ).map(([id, shortLabel]) => {
                  const active = selectedPart === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectPart(id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer border transition-colors ${
                        active
                          ? darkMode
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-slate-900 text-white border-slate-900'
                          : darkMode
                          ? 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Key */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Oxygenated blood (Left)
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  Deoxygenated blood (Right)
                </span>
              </span>
            </div>
          </div>

          {/* NECTA Exam Note */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode
                ? 'bg-rose-500/10 border-rose-400/25 text-rose-100'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <strong className="font-bold">NECTA Biology Note:</strong> The{' '}
            <span className="font-semibold">left ventricle</span> has a thicker muscular wall than
            the right ventricle so its contraction generates high pressure to pump oxygenated blood
            to the entire body.
          </div>
        </aside>
      </div>

      {/* UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK */}
      <div
        className={`border-t transition-all ${
          darkMode ? 'border-white/[0.08] bg-[#0e121c]' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex justify-center -mt-3">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className={`px-3 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${dockBg}`}
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Heart Controls</span>
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

              <span className="text-xs font-mono font-bold tabular-nums shrink-0 opacity-80">
                {formatLessonTime(lessonTime)} / {formatLessonTime(LESSON_DURATION_SEC)}
              </span>

              <div className="flex-1 min-w-[200px] grid grid-cols-4 gap-1.5 items-center">
                {HEART_LESSON_CHAPTERS.map((ch) => {
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
                        className="h-full bg-rose-500 rounded-full transition-[width] duration-75"
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
                    ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#232b40]'
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
                    ? 'bg-rose-500/15 border-rose-400/50 text-rose-200 hover:bg-rose-500/25'
                    : 'bg-rose-50 border-rose-400 text-rose-900 hover:bg-rose-100'
                }`}
              >
                Take over from here
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {HEART_LESSON_CHAPTERS.map((ch) => {
                const isCurrent = activeLessonChapter.id === ch.id;
                return (
                  <button
                    key={`chap-${ch.id}`}
                    type="button"
                    onClick={() => handleScrubLesson(ch.startSec + 0.1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold text-left truncate cursor-pointer transition-colors ${
                      isCurrent
                        ? darkMode
                          ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                          : 'bg-rose-50 text-rose-900 border border-rose-300'
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
          <div className="px-4 py-3.5 max-w-5xl mx-auto space-y-3">
            {/* Row 1: Play/Pause, Activity Presets, View Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-white text-slate-950 hover:bg-slate-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isPlaying ? 'Pause' : 'Beat'}</span>
                </button>

                {[
                  { label: 'Rest (72)', val: 72 },
                  { label: 'Walk (110)', val: 110 },
                  { label: 'Sprint (165)', val: 165 },
                ].map((preset) => {
                  const active = Math.abs(bpm - preset.val) <= 4;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBpm(preset.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors whitespace-nowrap ${
                        active
                          ? darkMode
                            ? 'bg-rose-500/20 border-rose-400/60 text-rose-200'
                            : 'bg-rose-50 border-rose-400 text-rose-900'
                          : darkMode
                          ? 'bg-[#1a2030] border-white/[0.1] text-slate-300 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSlowMo((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                    slowMo
                      ? darkMode
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                        : 'bg-cyan-50 border-cyan-400 text-cyan-900'
                      : darkMode
                      ? 'bg-[#1a2030] border-white/[0.1] text-slate-300 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Slow-Mo {slowMo ? '0.35×' : 'Off'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConduction((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                    showConduction || level === 'a_level'
                      ? darkMode
                        ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                        : 'bg-amber-50 border-amber-400 text-amber-900'
                      : darkMode
                      ? 'bg-[#1a2030] border-white/[0.1] text-slate-300 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>SA/AV Nodes</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                    darkMode
                      ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#232b40]'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Row 2: Continuous Heart Rate Slider */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Heart Rate:</span>
              </div>
              <input
                type="range"
                min={45}
                max={180}
                step={1}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                aria-label="Heart rate in beats per minute"
                className="flex-1 min-w-[180px] accent-rose-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-black tabular-nums w-20 text-right shrink-0">
                {bpm} BPM
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Heart3DSimulation;
