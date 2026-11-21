import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  FlaskConical,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';

export interface Titration3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';
type IndicatorId = 'phenolphthalein' | 'bromothymol' | 'methyl_orange';
type DockTab = 'titrate' | 'setup';

interface IndicatorSpec {
  id: IndicatorId;
  name: string;
  rangeLow: number;
  rangeHigh: number;
  alkalineName: string;
  neutralName: string;
  acidicName: string;
  alkalineHex: string;
  neutralHex: string;
  acidicHex: string;
  summary: string;
}

const INDICATORS: Record<IndicatorId, IndicatorSpec> = {
  phenolphthalein: {
    id: 'phenolphthalein',
    name: 'Phenolphthalein',
    rangeLow: 8.2,
    rangeHigh: 10.0,
    alkalineName: 'Pink',
    neutralName: 'Pale pink',
    acidicName: 'Colourless',
    alkalineHex: '#ec4899',
    neutralHex: '#f9a8d4',
    acidicHex: '#e2e8f0',
    summary: 'Pink in alkali (NaOH), turns colourless sharply at the end-point (pH 8.2–10.0).',
  },
  bromothymol: {
    id: 'bromothymol',
    name: 'Bromothymol Blue',
    rangeLow: 6.0,
    rangeHigh: 7.6,
    alkalineName: 'Blue',
    neutralName: 'Green',
    acidicName: 'Yellow',
    alkalineHex: '#3b82f6',
    neutralHex: '#10b981',
    acidicHex: '#eab308',
    summary: 'Blue in alkali, green right at neutral pH 7.0, yellow in excess acid.',
  },
  methyl_orange: {
    id: 'methyl_orange',
    name: 'Methyl Orange',
    rangeLow: 3.1,
    rangeHigh: 4.4,
    alkalineName: 'Yellow',
    neutralName: 'Orange',
    acidicName: 'Red',
    alkalineHex: '#facc15',
    neutralHex: '#f97316',
    acidicHex: '#ef4444',
    summary: 'Classic NECTA indicator: yellow in alkali, orange at end-point, red in excess acid.',
  },
};

interface LessonChapter {
  index: number;
  title: string;
  startSec: number;
  endSec: number;
  oCaption: string;
  aCaption: string;
}

// Total guided lesson length: 65 seconds (1:05 — extended past 1 minute for calm classroom pacing)
const LESSON_DURATION_SEC = 65;

const LESSON_CHAPTERS: LessonChapter[] = [
  {
    index: 0,
    title: 'The glassware',
    startSec: 0,
    endSec: 18,
    oCaption:
      'A pipette delivers exactly 25.0 cm³ of sodium hydroxide solution into a conical flask. A few drops of indicator colour it.',
    aCaption:
      'A 25.0 cm³ volumetric pipette transfers an exact aliquot of NaOH(aq) into the conical flask, followed by 2–3 drops of acid–base indicator.',
  },
  {
    index: 1,
    title: 'Reading a meniscus',
    startSec: 18,
    endSec: 34,
    oCaption:
      'Read the scale at the bottom of the meniscus, with your eye level with it. The burette is read to the nearest 0.05 cm³.',
    aCaption:
      'To avoid parallax error, align your eye horizontally with the lower meniscus of the 0.100 mol dm⁻³ HCl column and record to ±0.05 cm³.',
  },
  {
    index: 2,
    title: 'Running in the acid',
    startSec: 34,
    endSec: 51,
    oCaption:
      'Open the tap to run hydrochloric acid steadily while swirling the flask. Close the tap slowly as the local colour fade begins to linger.',
    aCaption:
      'As H⁺(aq) neutralises OH⁻(aq) (H⁺ + OH⁻ → H₂O), pH decreases gently across the buffer-like alkaline plateau until approaching equivalence.',
  },
  {
    index: 3,
    title: 'The end-point',
    startSec: 51,
    endSec: 65,
    oCaption:
      'Add acid one drop at a time near the end. One more drop, and the pink does not return. This is the end-point (24.15 cm³).',
    aCaption:
      'Within ±0.05 cm³ of the equivalence point (24.15 cm³), pH plunges steeply across pH 10 → 4, triggering a permanent indicator transition.',
  },
];

interface RecordedTitre {
  id: number;
  trial: number;
  volume: number;
  indicator: IndicatorId;
  quality: 'exact' | 'close' | 'overshot' | 'undershot';
}

interface TitrationChallenge {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  check: (titres: RecordedTitre[], targetVol: number) => boolean;
}

const TITRATION_CHALLENGES: TitrationChallenge[] = [
  {
    id: 'ch_endpoint',
    title: 'Hit the Exact End-Point',
    prompt: 'Titrate drop-by-drop near the end and record a titre within ±0.10 cm³ of the exact equivalence point.',
    hint: 'Run acid fast until ~21 cm³, then close the tap and click "One drop" until the colour permanently shifts.',
    check: (titres, targetVol) => titres.some((t) => Math.abs(t.volume - targetVol) <= 0.12),
  },
  {
    id: 'ch_concordant',
    title: 'Concordant NECTA Trials',
    prompt: 'Refill and perform two concordant titrations within 0.20 cm³ of each other near the end-point!',
    hint: 'After recording Trial 1, click "Refill" and repeat carefully to achieve two titres within ±0.20 cm³.',
    check: (titres, targetVol) => {
      const accurate = titres.filter((t) => Math.abs(t.volume - targetVol) <= 0.25);
      if (accurate.length < 2) return false;
      for (let i = 0; i < accurate.length; i++) {
        for (let j = i + 1; j < accurate.length; j++) {
          if (Math.abs(accurate[i].volume - accurate[j].volume) <= 0.21) return true;
        }
      }
      return false;
    },
  },
];

interface LabelSpec {
  id: string;
  text: string;
  worldPos: THREE.Vector3;
  offsetX: number;
  offsetY: number;
  visible?: () => boolean;
}

interface ProjectedLabel {
  id: string;
  text: string;
  ax: number;
  ay: number;
  lx: number;
  ly: number;
}

// Reusable scratch math objects (zero per-frame GC allocations)
const _vProj = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();
const _colorC = new THREE.Color();

/**
 * Exact strong acid (HCl) added to strong base (NaOH, 25.0 cm³) pH calculation
 */
function calculateStrongAcidBasePH(
  acidAddedCm3: number,
  acidConcM: number,
  baseVolCm3: number,
  baseConcM: number
): number {
  const vAcidL = Math.max(0, acidAddedCm3) / 1000;
  const vBaseL = Math.max(0.001, baseVolCm3) / 1000;
  const nH = acidConcM * vAcidL;
  const nOH = baseConcM * vBaseL;
  const vTotal = vAcidL + vBaseL;

  if (nOH > nH + 1e-11) {
    const cOH = (nOH - nH) / vTotal;
    const pOH = -Math.log10(Math.max(1e-14, cOH));
    return Math.min(14, Math.max(7, 14 - pOH));
  }
  if (nH > nOH + 1e-11) {
    const cH = (nH - nOH) / vTotal;
    const pH = -Math.log10(Math.max(1e-14, cH));
    return Math.max(0, Math.min(7, pH));
  }
  return 7.0;
}

/**
 * Computes live indicator colour hex and human label from current pH
 */
function getIndicatorVisual(
  indicatorId: IndicatorId,
  pH: number,
  indicatorAddedFrac: number
): { hex: string; label: string; isColourless: boolean } {
  if (indicatorAddedFrac < 0.08) {
    return { hex: '#dbeafe', label: 'Colourless (no indicator)', isColourless: true };
  }
  const spec = INDICATORS[indicatorId];
  const low = spec.rangeLow;
  const high = spec.rangeHigh;
  const mid = (low + high) * 0.5;

  _colorA.set(spec.acidicHex);
  _colorB.set(spec.neutralHex);
  _colorC.set(spec.alkalineHex);

  let blended: THREE.Color;
  let label: string;
  let isColourless = false;

  if (pH >= high) {
    blended = _colorC.clone();
    label = spec.alkalineName;
  } else if (pH <= low) {
    blended = _colorA.clone();
    label = spec.acidicName;
    if (indicatorId === 'phenolphthalein') isColourless = true;
  } else if (pH >= mid) {
    const f = (pH - mid) / Math.max(0.01, high - mid);
    blended = _colorB.clone().lerp(_colorC, f);
    label = f > 0.55 ? spec.alkalineName : spec.neutralName;
  } else {
    const f = (pH - low) / Math.max(0.01, mid - low);
    blended = _colorA.clone().lerp(_colorB, f);
    label = f > 0.45 ? spec.neutralName : spec.acidicName;
    if (indicatorId === 'phenolphthalein' && f < 0.25) isColourless = true;
  }

  // Blend in indicator strength smoothly when drops are being added in Chapter 1
  if (indicatorAddedFrac < 1) {
    const clearWater = new THREE.Color('#e2e8f0');
    blended.lerp(clearWater, 1 - indicatorAddedFrac);
  }

  return { hex: `#${blended.getHexString()}`, label, isColourless };
}

/**
 * High-resolution graduation texture for the 3D 50 cm³ burette glass cylinder
 */
function createBuretteScaleTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 1024);

  // Subtle etched graduation marks around front face (centered around x = 256)
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.92)';
  ctx.fillStyle = 'rgba(248, 250, 252, 0.96)';
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const topY = 58;
  const bottomY = 970;
  const span = bottomY - topY;

  for (let m = 0; m <= 50; m++) {
    const y = topY + (m / 50) * span;
    const isMajor = m % 5 === 0;
    const isMedium = m % 1 === 0;
    const len = isMajor ? 72 : isMedium ? 42 : 24;
    ctx.lineWidth = isMajor ? 4 : 2.2;
    ctx.beginPath();
    ctx.moveTo(256 - len * 0.45, y);
    ctx.lineTo(256 + len * 0.55, y);
    ctx.stroke();

    if (isMajor) {
      ctx.fillText(String(m), 256 - len * 0.58, y);
    }
    // 0.2 cm³ sub-ticks between integer marks
    if (m < 50) {
      for (let sub = 1; sub < 5; sub++) {
        const sy = topY + ((m + sub * 0.2) / 50) * span;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(256 - 10, sy);
        ctx.lineTo(256 + 18, sy);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

/**
 * Radial contact shadow texture for retort stand & conical flask
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 122);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

export const Titration3DSimulation: React.FC<Titration3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 4',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Core Interactive State
  const [indicator, setIndicator] = useState<IndicatorId>('phenolphthalein');
  const [acidConcM] = useState<number>(0.1); // 0.100 M HCl in burette
  const [baseConcM, setBaseConcM] = useState<number>(0.0966); // Exact endpoint = 24.15 cm³!
  const [isUnknownSample, setIsUnknownSample] = useState<boolean>(false);
  const baseVolCm3 = 25.0;

  const [acidAdded, setAcidAdded] = useState<number>(0.0); // 0.00 to 50.00 cm³
  const [tapOpen, setTapOpen] = useState<number>(0); // 0 (closed) to 1 (full stream)
  const [dockTab, setDockTab] = useState<DockTab>('titrate');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [level, setLevel] = useState<SyllabusLevel>(() =>
    activeClass.includes('5') || activeClass.includes('6') ? 'a_level' : 'o_level'
  );

  // Guided 65-second (1:05) Video-Style Lesson State
  const [watchLessonActive, setWatchLessonActive] = useState<boolean>(false);
  const [lessonPaused, setLessonPaused] = useState<boolean>(false);
  const [lessonTimeSec, setLessonTimeSec] = useState<number>(0);
  const [lessonSpeed, setLessonSpeed] = useState<number>(1);
  const [lessonSetupNaohVol, setLessonSetupNaohVol] = useState<number>(25.0);
  const [lessonIndicatorFrac, setLessonIndicatorFrac] = useState<number>(1.0);

  // Titre recording & Challenge State
  const [recordedTitres, setRecordedTitres] = useState<RecordedTitre[]>([]);
  const [challengeIdx, setChallengeIdx] = useState<number | null>(null);
  const [interactionHint, setInteractionHint] = useState<string | null>(null);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);

  // Exact equivalence volume in cm³
  const equivalenceVol = useMemo(
    () => Number(((baseConcM * baseVolCm3) / acidConcM).toFixed(2)),
    [baseConcM, baseVolCm3, acidConcM]
  );

  // Current active chapter during Watch Lesson
  const activeChapter = useMemo(() => {
    for (let i = LESSON_CHAPTERS.length - 1; i >= 0; i--) {
      if (lessonTimeSec >= LESSON_CHAPTERS[i].startSec) return LESSON_CHAPTERS[i];
    }
    return LESSON_CHAPTERS[0];
  }, [lessonTimeSec]);

  const inSetupPhase = watchLessonActive && lessonTimeSec < 18;
  const magnifyMeniscusBig = watchLessonActive && lessonTimeSec >= 18 && lessonTimeSec < 34;

  // Live chemistry calculations
  const currentPH = useMemo(
    () => calculateStrongAcidBasePH(acidAdded, acidConcM, baseVolCm3, baseConcM),
    [acidAdded, acidConcM, baseVolCm3, baseConcM]
  );

  const indicatorVisual = useMemo(
    () => getIndicatorVisual(indicator, currentPH, watchLessonActive ? lessonIndicatorFrac : 1),
    [indicator, currentPH, watchLessonActive, lessonIndicatorFrac]
  );

  const activeChallenge = challengeIdx !== null ? TITRATION_CHALLENGES[challengeIdx] : null;
  const challengeSolved = useMemo(() => {
    if (!activeChallenge) return false;
    return activeChallenge.check(recordedTitres, equivalenceVol);
  }, [activeChallenge, recordedTitres, equivalenceVol]);

  // Concordant mean calculation from recorded titres
  const meanTitre = useMemo(() => {
    if (recordedTitres.length === 0) return null;
    const sum = recordedTitres.reduce((acc, t) => acc + t.volume, 0);
    return Number((sum / recordedTitres.length).toFixed(2));
  }, [recordedTitres]);

  // Status guidance message in the right readout panel
  const guidanceLine = useMemo(() => {
    if (inSetupPhase) {
      return lessonTimeSec < 11
        ? 'Pipetting 25.0 cm³ of sodium hydroxide into the conical flask…'
        : 'Adding drops of indicator to colour the alkaline solution…';
    }
    if (acidAdded < 0.05) {
      return 'Open the tap to run the hydrochloric acid in.';
    }
    const diff = equivalenceVol - acidAdded;
    if (diff > 2.5) {
      return 'Alkali still in excess. Run acid steadily while swirling.';
    }
    if (diff > 0.15) {
      return 'Approaching end-point! Close the tap and add single drops.';
    }
    if (Math.abs(diff) <= 0.15) {
      return 'End-point reached! Record this titre value now.';
    }
    return 'Past the end-point (excess acid). Record or click Refill for a sharper trial.';
  }, [inSetupPhase, lessonTimeSec, acidAdded, equivalenceVol]);

  // Mutable refs consumed by the 60fps Three.js loop (zero unnecessary scene rebuilds)
  const acidAddedRef = useRef<number>(acidAdded);
  const tapOpenRef = useRef<number>(tapOpen);
  const indicatorRef = useRef<IndicatorId>(indicator);
  const baseConcRef = useRef<number>(baseConcM);
  const acidConcRef = useRef<number>(acidConcM);
  const darkModeRef = useRef<boolean>(darkMode);
  const showLabelsRef = useRef<boolean>(showLabels);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonPausedRef = useRef<boolean>(lessonPaused);
  const lessonTimeRef = useRef<number>(lessonTimeSec);
  const lessonSpeedRef = useRef<number>(lessonSpeed);
  const swirlImpulseRef = useRef<number>(0);
  const dropPulseRef = useRef<number>(0);
  const lastUiSyncRef = useRef<number>(0);
  const lastLabelPushRef = useRef<number>(0);

  useEffect(() => {
    acidAddedRef.current = acidAdded;
  }, [acidAdded]);
  useEffect(() => {
    tapOpenRef.current = tapOpen;
  }, [tapOpen]);
  useEffect(() => {
    indicatorRef.current = indicator;
  }, [indicator]);
  useEffect(() => {
    baseConcRef.current = baseConcM;
  }, [baseConcM]);
  useEffect(() => {
    acidConcRef.current = acidConcM;
  }, [acidConcM]);
  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);
  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);
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

  // ==================== THREE.JS 3D TITRATION BENCH ====================
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
    const bgDark = new THREE.Color(0x161922);
    const bgLight = new THREE.Color(0xf1f5fb);
    scene.background = darkModeRef.current ? bgDark.clone() : bgLight.clone();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 80);
    camera.position.set(0.35, 3.1, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    // Balanced studio lighting rig
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    keyLight.position.set(5.5, 9.5, 6.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 4.6;
    controls.maxDistance = 12.5;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.target.set(0.0, 1.95, 0.0);

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

    const root = new THREE.Group();
    scene.add(root);

    // Shared PBR Materials
    const standMetalMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.52, metalness: 0.45 })
    );
    const chromeMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.18, metalness: 0.92 })
    );
    const tileMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.04 })
    );
    const glassMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe2f1ff,
        roughness: 0.08,
        metalness: 0.02,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      })
    );
    const tapBlueMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.34, metalness: 0.12 })
    );
    const rubberBulbMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x994b3b, roughness: 0.78, metalness: 0.02 })
    );

    // ==================== 1. RETORT STAND & WHITE PORCELAIN TILE ====================
    const shadowTex = trackTex(createContactShadowTexture());
    const contactShadow = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(4.6, 3.6)),
      trackMat(
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.65,
        })
      )
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0.0, 0.005, 0.0);
    root.add(contactShadow);

    // Heavy rectangular retort stand base
    const standBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.55, 0.14, 2.05)), standMetalMat);
    standBase.position.set(-0.15, 0.07, 0);
    standBase.castShadow = !isSoftwareGl;
    standBase.receiveShadow = !isSoftwareGl;
    root.add(standBase);

    // White porcelain tile centered for colour visibility
    const whiteTile = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.05, 0.08, 1.72)), tileMat);
    whiteTile.position.set(0.02, 0.18, 0.02);
    whiteTile.receiveShadow = !isSoftwareGl;
    root.add(whiteTile);

    // Vertical stainless steel retort rod on left side
    const retortRod = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 6.2, 20)), chromeMat);
    retortRod.position.set(-1.02, 3.18, -0.2);
    retortRod.castShadow = !isSoftwareGl;
    root.add(retortRod);

    // Bosshead + horizontal burette clamp arm
    const bosshead = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.24, 0.24)), standMetalMat);
    bosshead.position.set(-1.02, 4.35, -0.2);
    const clampArm = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.04, 0.04, 1.12, 14)), chromeMat);
    clampArm.rotation.z = Math.PI / 2;
    clampArm.position.set(-0.48, 4.35, -0.1);
    const clampCollar = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.18, 0.036, 12, 28)), standMetalMat);
    clampCollar.rotation.x = Math.PI / 2;
    clampCollar.position.set(0.02, 4.35, 0.0);
    root.add(bosshead, clampArm, clampCollar);

    // ==================== 2. 3D CONICAL FLASK (ERLENMEYER) + DYNAMIC LIQUID & RIPPLES ====================
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(0.02, 0.22, 0.02);
    root.add(flaskGroup);

    // Smooth Lathe profile for authentic 250 cm³ Erlenmeyer conical flask
    const flaskProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.68, 0.0),
      new THREE.Vector2(0.76, 0.08),
      new THREE.Vector2(0.75, 0.2),
      new THREE.Vector2(0.26, 1.5),
      new THREE.Vector2(0.25, 1.98),
      new THREE.Vector2(0.29, 2.04),
      new THREE.Vector2(0.27, 2.07),
    ];
    const flaskGlassMesh = new THREE.Mesh(
      trackGeo(new THREE.LatheGeometry(flaskProfile, 44)),
      glassMat
    );
    flaskGlassMesh.renderOrder = 10;
    flaskGroup.add(flaskGlassMesh);

    // Subtle glass rim highlight ring at mouth of flask
    const flaskRim = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.275, 0.018, 12, 36)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.72 }))
    );
    flaskRim.rotation.x = Math.PI / 2;
    flaskRim.position.y = 2.05;
    flaskGroup.add(flaskRim);

    // Dynamic liquid frustum inside the conical flask (height & top radius expand accurately with total volume!)
    const flaskLiquidMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ec4899'),
        emissive: new THREE.Color('#ec4899'),
        emissiveIntensity: 0.14,
        roughness: 0.16,
        metalness: 0.02,
        transparent: true,
        opacity: 0.78,
      })
    );
    // Unit-height frustum geometry updated smoothly via scale/morph in tick
    const flaskLiquidMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.56, 0.72, 1.0, 40)),
      flaskLiquidMat
    );
    flaskLiquidMesh.position.y = 0.22;
    flaskLiquidMesh.scale.set(1, 0.35, 1);
    flaskLiquidMesh.renderOrder = 4;
    flaskGroup.add(flaskLiquidMesh);

    // Concentric surface ripple ring on top of flask liquid when droplets hit
    const rippleMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      })
    );
    const rippleRing = new THREE.Mesh(trackGeo(new THREE.RingGeometry(0.05, 0.09, 32)), rippleMat);
    rippleRing.rotation.x = -Math.PI / 2;
    rippleRing.position.y = 0.42;
    flaskGroup.add(rippleRing);

    // Localized splash tint disc right where acid drop hits (models lingering local flash near end-point!)
    const localFlashMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      })
    );
    const localFlashDisc = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.24, 24)), localFlashMat);
    localFlashDisc.rotation.x = -Math.PI / 2;
    localFlashDisc.position.y = 0.415;
    flaskGroup.add(localFlashDisc);

    // ==================== 3. 3D GRADUATED 50 cm³ BURETTE & CLICKABLE BLUE STOPCOCK TAP ====================
    const buretteGroup = new THREE.Group();
    buretteGroup.position.set(0.02, 3.05, 0.02);
    root.add(buretteGroup);

    const BURETTE_TUBE_H = 3.2;
    // Outer clear glass barrel
    const buretteBarrel = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.145, 0.145, BURETTE_TUBE_H, 28, 1, true)),
      glassMat
    );
    buretteBarrel.position.y = BURETTE_TUBE_H * 0.5;
    buretteBarrel.renderOrder = 11;
    buretteGroup.add(buretteBarrel);

    // Printed graduation scale cylinder overlay
    const scaleTex = trackTex(createBuretteScaleTexture(maxAniso));
    const buretteScaleMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: scaleTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.92,
      })
    );
    const buretteScaleCyl = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.148, 0.148, BURETTE_TUBE_H, 28, 1, true)),
      buretteScaleMat
    );
    buretteScaleCyl.position.y = BURETTE_TUBE_H * 0.5;
    buretteScaleCyl.rotation.y = -Math.PI * 0.5;
    buretteScaleCyl.renderOrder = 12;
    buretteGroup.add(buretteScaleCyl);

    // Acid column inside the burette (height shrinks smoothly from 50 cm³ down to 0 cm³ left)
    const acidColMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        roughness: 0.12,
        metalness: 0.0,
        transparent: true,
        opacity: 0.52,
      })
    );
    const acidColGeo = trackGeo(new THREE.CylinderGeometry(0.124, 0.124, 1.0, 24));
    const acidColumn = new THREE.Mesh(acidColGeo, acidColMat);
    acidColumn.position.y = 1.5;
    acidColumn.scale.y = BURETTE_TUBE_H * 0.92;
    acidColumn.renderOrder = 6;
    buretteGroup.add(acidColumn);

    // Tapered delivery nozzle below stopcock
    const nozzleGlass = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.065, 0.028, 0.68, 18)),
      glassMat
    );
    nozzleGlass.position.y = -0.34;
    buretteGroup.add(nozzleGlass);

    // Blue PTFE Stopcock Tap body + rotating butterfly valve handle (CLICKABLE in 3D!)
    const tapHousing = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 20)),
      tapBlueMat
    );
    tapHousing.rotation.z = Math.PI / 2;
    tapHousing.position.y = -0.04;
    buretteGroup.add(tapHousing);

    const tapHandlePivot = new THREE.Group();
    tapHandlePivot.position.set(0, -0.04, 0);
    const tapWing = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.56, 0.11, 0.075)), tapBlueMat);
    tapWing.position.x = -0.14;
    const tapKnob = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 16)), chromeMat);
    tapKnob.rotation.z = Math.PI / 2;
    tapKnob.position.x = 0.16;
    tapHandlePivot.add(tapWing, tapKnob);
    buretteGroup.add(tapHandlePivot);

    // ==================== 4. FALLING ACID STREAM & INDIVIDUAL ANIMATED DROPLETS ====================
    const streamMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: new THREE.Color(0x93c5fd),
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.0,
        roughness: 0.1,
      })
    );
    const acidStreamMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.014, 0.012, 1.85, 10)),
      streamMat
    );
    acidStreamMesh.position.set(0.02, 1.48, 0.02);
    root.add(acidStreamMesh);

    // 4 animated falling droplets for drop-by-drop & slow-tap delivery
    const dropGeo = trackGeo(new THREE.SphereGeometry(0.032, 12, 10));
    const dropMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        emissive: new THREE.Color(0xbae6fd),
        emissiveIntensity: 0.35,
        roughness: 0.08,
        transparent: true,
        opacity: 0.9,
      })
    );
    const drops: THREE.Mesh[] = [];
    const dropPhases: number[] = [0, 0.33, 0.66, 1.0];
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(dropGeo, dropMat);
      m.visible = false;
      m.scale.set(0.85, 1.35, 0.85);
      root.add(m);
      drops.push(m);
    }

    // ==================== 5. ANIMATED 3D VOLUMETRIC PIPETTE & INDICATOR DROPPER (Lesson Chapter 1) ====================
    // 25.0 cm³ bulb pipette
    const pipetteGroup = new THREE.Group();
    const pipStemLower = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.022, 0.012, 1.05, 14)), glassMat);
    pipStemLower.position.y = -0.52;
    const pipBulb = new THREE.Mesh(trackGeo(new THREE.CapsuleGeometry(0.11, 0.38, 10, 20)), glassMat);
    pipBulb.position.y = 0.25;
    const pipStemUpper = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.024, 0.024, 0.9, 14)), glassMat);
    pipStemUpper.position.y = 0.95;
    const pipLiquid = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.09, 0.34, 8, 16)),
      acidColMat
    );
    pipLiquid.position.y = 0.25;
    pipetteGroup.add(pipStemLower, pipBulb, pipStemUpper, pipLiquid);
    pipetteGroup.position.set(0.66, 2.9, 0.02);
    pipetteGroup.rotation.z = -0.3;
    pipetteGroup.visible = false;
    root.add(pipetteGroup);

    // Indicator dropper (glass tube + brown rubber squeeze bulb)
    const dropperGroup = new THREE.Group();
    const dropTube = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.026, 0.012, 0.95, 14)), glassMat);
    dropTube.position.y = -0.1;
    const dropBulb = new THREE.Mesh(trackGeo(new THREE.CapsuleGeometry(0.075, 0.22, 10, 18)), rubberBulbMat);
    dropBulb.position.y = 0.56;
    dropperGroup.add(dropTube, dropBulb);
    dropperGroup.position.set(0.42, 2.75, 0.02);
    dropperGroup.rotation.z = -0.28;
    dropperGroup.visible = false;
    root.add(dropperGroup);

    // 3D Label Anchors
    const labelSpecs: LabelSpec[] = [
      {
        id: 'burette',
        text: 'Burette',
        worldPos: new THREE.Vector3(0.16, 4.15, 0.02),
        offsetX: 88,
        offsetY: -10,
      },
      {
        id: 'tap',
        text: 'Tap',
        worldPos: new THREE.Vector3(0.2, 3.01, 0.02),
        offsetX: 78,
        offsetY: 0,
      },
      {
        id: 'flask',
        text: 'Conical flask',
        worldPos: new THREE.Vector3(0.56, 0.92, 0.02),
        offsetX: 98,
        offsetY: -6,
      },
      {
        id: 'tile',
        text: 'White tile',
        worldPos: new THREE.Vector3(0.75, 0.18, 0.65),
        offsetX: 76,
        offsetY: 22,
      },
      {
        id: 'pipette',
        text: 'Pipette: 25.0 cm³',
        worldPos: new THREE.Vector3(0.68, 3.18, 0.02),
        offsetX: 112,
        offsetY: -8,
        visible: () => pipetteGroup.visible,
      },
      {
        id: 'indicator',
        text: 'Indicator',
        worldPos: new THREE.Vector3(0.52, 3.18, 0.02),
        offsetX: 96,
        offsetY: -10,
        visible: () => dropperGroup.visible,
      },
    ];

    function computeProjectedLabels(): ProjectedLabel[] {
      if (!showLabelsRef.current) return [];
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      if (w <= 0 || h <= 0) return [];
      const out: ProjectedLabel[] = [];
      for (const spec of labelSpecs) {
        if (spec.visible && !spec.visible()) continue;
        _vProj.copy(spec.worldPos);
        _vProj.project(camera);
        if (_vProj.z > 1) continue;
        const ax = (_vProj.x * 0.5 + 0.5) * w;
        const ay = (-_vProj.y * 0.5 + 0.5) * h;
        const lx = Math.max(76, Math.min(w - 76, ax + spec.offsetX));
        const ly = Math.max(26, Math.min(h - 26, ay + spec.offsetY));
        out.push({ id: spec.id, text: spec.text, ax, ay, lx, ly });
      }
      return out;
    }

    // ==================== DIRECT 3D RAYCAST INTERACTION ====================
    // Click 3D Tap -> toggle open/close; Click 3D Conical Flask -> swirl!
    const clickableTargets: Array<{ mesh: THREE.Object3D; action: 'tap' | 'flask' }> = [
      { mesh: tapHousing, action: 'tap' },
      { mesh: tapHandlePivot, action: 'tap' },
      { mesh: flaskGroup, action: 'flask' },
    ];
    const hitMeshes = clickableTargets.map((c) => c.mesh);

    let pointerDown = { x: 0, y: 0 };
    let lastHover = 0;

    const getHitAction = (cx: number, cy: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((cy - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObjects(hitMeshes, true);
      if (hits.length === 0) return null;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj) {
        const found = clickableTargets.find((c) => c.mesh === obj);
        if (found) return found.action;
        obj = obj.parent;
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDown = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHover < 50) return;
      lastHover = now;
      renderer.domElement.style.cursor = getHitAction(e.clientX, e.clientY) ? 'pointer' : 'grab';
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) > 6) return;
      const action = getHitAction(e.clientX, e.clientY);
      if (action === 'tap') {
        if (watchLessonRef.current) {
          setWatchLessonActive(false);
          setLessonPaused(false);
        }
        setTapOpen((prev) => {
          const next = prev > 0.05 ? 0 : 0.45;
          setInteractionHint(
            next > 0
              ? 'Burette tap OPEN — acid running into conical flask!'
              : 'Burette tap CLOSED — flow stopped.'
          );
          return next;
        });
      } else if (action === 'flask') {
        swirlImpulseRef.current = 1.0;
        setInteractionHint('Swirling conical flask to mix acid and alkali thoroughly!');
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
    let disposed = false;
    const clock = new THREE.Clock();
    let ripplePhase = 0;
    let localFlashAlpha = 0;
    let dampedTapAngle = 0;
    let singleDropProgress = -1;

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

      let activeNaohVol = 25.0;
      let activeIndicatorFrac = 1.0;
      let activeTapFlow = tapOpenRef.current;

      // ==================== GUIDED 65-SECOND LESSON CHOREOGRAPHY ====================
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

        if (t < 11) {
          // Chapter 1a: Pipette delivers 0 -> 25.0 cm³ of NaOH
          const frac = Math.min(1, t / 10.2);
          activeNaohVol = Number((frac * 25.0).toFixed(1));
          activeIndicatorFrac = 0;
          acidAddedRef.current = 0;
          activeTapFlow = 0;
          pipetteGroup.visible = true;
          dropperGroup.visible = false;
          pipetteGroup.position.set(0.54, 2.92 - Math.sin(frac * Math.PI) * 0.14, 0.02);
          pipLiquid.scale.y = Math.max(0.05, 1 - frac);
          // Thin pouring stream from pipette tip
          acidStreamMesh.position.set(0.16, 1.48, 0.02);
          streamMat.opacity = frac < 0.96 ? 0.55 : 0;
          ripplePhase = (ripplePhase + delta * 2.8) % 1;
        } else if (t < 18) {
          // Chapter 1b: Indicator dropper adds drops -> solution blooms pink/blue/yellow
          const frac = Math.min(1, (t - 11) / 6.2);
          activeNaohVol = 25.0;
          activeIndicatorFrac = Math.min(1, Math.max(0, (frac - 0.2) / 0.72));
          acidAddedRef.current = 0;
          activeTapFlow = 0;
          pipetteGroup.visible = false;
          dropperGroup.visible = true;
          dropperGroup.position.set(0.36, 2.74 - Math.sin(frac * Math.PI) * 0.15, 0.02);
          dropBulb.scale.x = 1 - Math.sin(frac * Math.PI * 3) * 0.14;
          streamMat.opacity = 0;
          // Show falling indicator droplet
          drops[0].visible = frac > 0.15 && frac < 0.85;
          const dFrac = ((frac * 3) % 1);
          drops[0].position.set(0.12, THREE.MathUtils.lerp(2.22, 0.62, dFrac), 0.02);
          if (dFrac > 0.85) swirlImpulseRef.current = 0.55;
        } else if (t < 34) {
          // Chapter 2: Reading the Meniscus (steady at 0.00 cm³, magnifier zooms in!)
          activeNaohVol = 25.0;
          activeIndicatorFrac = 1.0;
          acidAddedRef.current = 0.0;
          activeTapFlow = 0;
          pipetteGroup.visible = false;
          dropperGroup.visible = false;
          streamMat.opacity = 0;
          drops.forEach((d) => (d.visible = false));
        } else if (t < 51) {
          // Chapter 3: Running in the acid smoothly from 0.00 -> 23.80 cm³
          const frac = (t - 34) / 17;
          const eased = 1 - Math.pow(1 - frac, 1.35);
          acidAddedRef.current = Number((eased * 23.8).toFixed(2));
          activeTapFlow = frac < 0.8 ? 0.72 : 0.25;
          pipetteGroup.visible = false;
          dropperGroup.visible = false;
          acidStreamMesh.position.set(0.02, 1.48, 0.02);
          streamMat.opacity = activeTapFlow * 0.72;
          swirlImpulseRef.current = Math.max(swirlImpulseRef.current, 0.42);
          if (acidAddedRef.current > 20.5) {
            localFlashAlpha = Math.max(localFlashAlpha, 0.55);
          }
        } else {
          // Chapter 4: Drop-by-drop to exact end-point 24.15 cm³!
          const frac = Math.min(1, (t - 51) / 11.5);
          const stepDrops = Math.floor(frac * 7); // 7 drops of 0.05 cm³: 23.80 -> 24.15!
          acidAddedRef.current = Number(Math.min(24.15, 23.8 + stepDrops * 0.05).toFixed(2));
          activeTapFlow = frac < 0.92 ? 0.14 : 0;
          pipetteGroup.visible = false;
          dropperGroup.visible = false;
          streamMat.opacity = 0;

          if (frac < 0.94) {
            const subDrop = (frac * 7) % 1;
            drops[0].visible = true;
            drops[0].position.set(0.02, THREE.MathUtils.lerp(2.38, 0.72, subDrop), 0.02);
            if (subDrop > 0.88) {
              ripplePhase = 0.05;
              swirlImpulseRef.current = 0.75;
              localFlashAlpha = 0.85;
            }
          } else {
            drops[0].visible = false;
          }
        }

        // Sync lesson React HUD smoothly (~10 Hz)
        const nowTs = performance.now();
        if (nowTs - lastUiSyncRef.current > 95) {
          lastUiSyncRef.current = nowTs;
          setLessonTimeSec(Number(t.toFixed(2)));
          setAcidAdded(acidAddedRef.current);
          setLessonSetupNaohVol(activeNaohVol);
          setLessonIndicatorFrac(activeIndicatorFrac);
        }
      } else {
        // ==================== FREE INTERACTIVE TITRATION MODE ====================
        pipetteGroup.visible = false;
        dropperGroup.visible = false;

        if (activeTapFlow > 0.01 && acidAddedRef.current < 50) {
          // Continuous flow proportional to tap opening (0.35 to 3.8 cm³/sec)
          const flowRate = 0.35 + activeTapFlow * 3.45;
          acidAddedRef.current = Math.min(50, acidAddedRef.current + flowRate * delta);
          if (acidAddedRef.current >= 50) {
            tapOpenRef.current = 0;
            setTapOpen(0);
          }

          acidStreamMesh.position.set(0.02, 1.48, 0.02);
          if (activeTapFlow >= 0.22) {
            streamMat.opacity = Math.min(0.75, 0.25 + activeTapFlow * 0.55);
            drops.forEach((d) => (d.visible = false));
          } else {
            streamMat.opacity = 0;
            for (let i = 0; i < 3; i++) {
              dropPhases[i] = (dropPhases[i] + delta * (1.2 + activeTapFlow * 4)) % 1;
              drops[i].visible = true;
              drops[i].position.set(0.02, THREE.MathUtils.lerp(2.38, 0.72, dropPhases[i]), 0.02);
            }
          }

          swirlImpulseRef.current = Math.max(swirlImpulseRef.current, 0.35);
          const eqVol = (baseConcRef.current * 25.0) / acidConcRef.current;
          if (Math.abs(eqVol - acidAddedRef.current) < 2.2) {
            localFlashAlpha = Math.max(localFlashAlpha, 0.6);
          }

          const nowTs = performance.now();
          if (nowTs - lastUiSyncRef.current > 60) {
            lastUiSyncRef.current = nowTs;
            setAcidAdded(Number(acidAddedRef.current.toFixed(2)));
          }
        } else {
          streamMat.opacity = 0;
          // Handle single precision "+One drop" animation
          if (dropPulseRef.current > 0) {
            singleDropProgress = 0;
            dropPulseRef.current = 0;
          }
          if (singleDropProgress >= 0) {
            singleDropProgress += delta * 3.8;
            if (singleDropProgress >= 1) {
              singleDropProgress = -1;
              drops[0].visible = false;
              ripplePhase = 0.02;
              swirlImpulseRef.current = 0.85;
              localFlashAlpha = 0.85;
            } else {
              drops[0].visible = true;
              drops[0].position.set(0.02, THREE.MathUtils.lerp(2.38, 0.72, singleDropProgress), 0.02);
            }
          } else {
            drops.forEach((d) => (d.visible = false));
          }
        }
      }

      // ==================== UPDATE 3D PHYSICAL VISUALS ====================
      // 1. Stopcock Tap rotation (0 = horizontal closed, 1 = vertical open)
      const targetAngle = activeTapFlow * (Math.PI * 0.5);
      dampedTapAngle = THREE.MathUtils.damp(dampedTapAngle, targetAngle, 12, delta);
      tapHandlePivot.rotation.z = dampedTapAngle;

      // 2. Burette Liquid Column height (50 cm³ full at 0.00 reading -> empty at 50.00 reading)
      const remainingFrac = Math.max(0.015, (50 - acidAddedRef.current) / 50);
      const colHeight = BURETTE_TUBE_H * 0.92 * remainingFrac;
      acidColumn.scale.y = colHeight;
      acidColumn.position.y = colHeight * 0.5 + 0.06;

      // 3. Flask Liquid Volume, Colour & Gentle Swirl Motion
      const totalLiquidCm3 = activeNaohVol + acidAddedRef.current;
      const liquidHeight = THREE.MathUtils.clamp((totalLiquidCm3 / 80) * 1.02, 0.015, 1.05);
      const topRadiusFactor = THREE.MathUtils.lerp(1.0, 0.66, liquidHeight / 1.08);
      flaskLiquidMesh.scale.set(topRadiusFactor, liquidHeight, topRadiusFactor);
      flaskLiquidMesh.position.y = 0.03 + liquidHeight * 0.5;
      flaskLiquidMesh.visible = totalLiquidCm3 > 0.2;

      const livePH = calculateStrongAcidBasePH(
        acidAddedRef.current,
        acidConcRef.current,
        25.0,
        baseConcRef.current
      );
      const vis = getIndicatorVisual(indicatorRef.current, livePH, activeIndicatorFrac);
      flaskLiquidMat.color.set(vis.hex);
      flaskLiquidMat.emissive.set(vis.hex);
      flaskLiquidMat.emissiveIntensity = vis.isColourless ? 0.04 : 0.16;
      flaskLiquidMat.opacity = vis.isColourless ? 0.42 : 0.8;

      // Flask gentle swirl wobble when mixing
      swirlImpulseRef.current = Math.max(0, swirlImpulseRef.current - delta * 0.65);
      const swirlAmp = swirlImpulseRef.current * 0.045;
      flaskGroup.rotation.z = Math.sin(elapsed * 11.5) * swirlAmp;
      flaskGroup.rotation.x = Math.cos(elapsed * 11.5) * swirlAmp * 0.7;

      // Liquid surface ripple expansion
      const surfaceY = 0.04 + liquidHeight;
      rippleRing.position.y = surfaceY;
      localFlashDisc.position.y = surfaceY - 0.004;

      if (activeTapFlow > 0.02 || streamMat.opacity > 0.05 || ripplePhase > 0) {
        ripplePhase = (ripplePhase + delta * 2.4) % 1;
        const rScale = 0.5 + ripplePhase * 4.2;
        rippleRing.scale.set(rScale, rScale, 1);
        rippleMat.opacity = (1 - ripplePhase) * 0.52;
        if (activeTapFlow <= 0.01 && streamMat.opacity <= 0.01 && ripplePhase > 0.92) {
          ripplePhase = 0;
          rippleMat.opacity = 0;
        }
      } else {
        rippleMat.opacity = 0;
      }

      // Localized end-point flash disc fades out cleanly as flask swirls
      localFlashAlpha = Math.max(0, localFlashAlpha - delta * 1.15);
      localFlashMat.opacity = localFlashAlpha * 0.55;
      localFlashMat.color.set(INDICATORS[indicatorRef.current].acidicHex);

      controls.update();
      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastLabelPushRef.current > 36) {
        lastLabelPushRef.current = now;
        setProjectedLabels(computeProjectedLabels());
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

  // ==================== USER ACTION HANDLERS ====================
  const handleAddOneDrop = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setTapOpen(0);
    tapOpenRef.current = 0;
    const next = Number(Math.min(50, acidAddedRef.current + 0.05).toFixed(2));
    acidAddedRef.current = next;
    setAcidAdded(next);
    dropPulseRef.current = 1;
  };

  const handleRecordTitre = () => {
    if (acidAdded < 0.5) {
      setInteractionHint('Run acid from the burette before recording a titre!');
      return;
    }
    const diff = acidAdded - equivalenceVol;
    const quality: RecordedTitre['quality'] =
      Math.abs(diff) <= 0.12
        ? 'exact'
        : Math.abs(diff) <= 0.35
        ? 'close'
        : diff > 0
        ? 'overshot'
        : 'undershot';

    setRecordedTitres((prev) => [
      ...prev.slice(-4),
      {
        id: Date.now(),
        trial: prev.length + 1,
        volume: Number(acidAdded.toFixed(2)),
        indicator,
        quality,
      },
    ]);

    if (quality === 'exact') {
      setInteractionHint(`Spot on! Recorded ${acidAdded.toFixed(2)} cm³ — exact end-point!`);
    } else if (quality === 'close') {
      setInteractionHint(`Good titre (${acidAdded.toFixed(2)} cm³)! Try single drops to get even closer.`);
    } else if (quality === 'overshot') {
      setInteractionHint(`Overshot by +${diff.toFixed(2)} cm³. Click Refill and slow down earlier!`);
    } else {
      setInteractionHint(`Stopped early (${Math.abs(diff).toFixed(2)} cm³ before end-point).`);
    }
  };

  const handleRefill = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setTapOpen(0);
    tapOpenRef.current = 0;
    acidAddedRef.current = 0;
    setAcidAdded(0);
    setInteractionHint('Burette refilled to 0.00 cm³ with fresh 25.0 cm³ NaOH in the conical flask.');
  };

  const handleToggleWatchLesson = () => {
    if (watchLessonActive) {
      setWatchLessonActive(false);
      setLessonPaused(false);
      setLessonIndicatorFrac(1);
      setLessonSetupNaohVol(25.0);
      return;
    }
    // Start 65-second guided lesson from 0:00 with Phenolphthalein & standard 24.15 cm³ sample
    setIndicator('phenolphthalein');
    setBaseConcM(0.0966);
    setIsUnknownSample(false);
    setTapOpen(0);
    tapOpenRef.current = 0;
    acidAddedRef.current = 0;
    setAcidAdded(0);
    lessonTimeRef.current = 0;
    setLessonTimeSec(0);
    setLessonPaused(false);
    lessonPausedRef.current = false;
    setWatchLessonActive(true);
  };

  const handleTakeOverFromHere = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setLessonIndicatorFrac(1);
    setLessonSetupNaohVol(25.0);
    setTapOpen(0);
    tapOpenRef.current = 0;
    setInteractionHint(`You are now in control at ${acidAdded.toFixed(2)} cm³ — open the tap or add single drops!`);
  };

  const handleJumpLessonTime = (newSec: number) => {
    const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, newSec));
    lessonTimeRef.current = clamped;
    setLessonTimeSec(clamped);
  };

  // ==================== CIRCULAR MENISCUS MAGNIFIER GEOMETRY ====================
  // Renders a crisp zoomed-in meniscus reading centred on `acidAdded` (nearest 0.05 cm³)
  const meniscusValue = Number((Math.round(acidAdded * 20) / 20).toFixed(2));
  const meniscusTicks = useMemo(() => {
    // Show ticks within ±0.65 cm³ of current reading (0.1 cm³ spacing -> 10 sub-divisions per 1 cm³)
    const center = meniscusValue;
    const minTick = Math.max(0, Math.floor((center - 0.7) * 10));
    const maxTick = Math.min(500, Math.ceil((center + 0.7) * 10));
    const arr: Array<{ tenths: number; y: number; isWhole: boolean; isHalf: boolean }> = [];
    for (let t = minTick; t <= maxTick; t++) {
      const val = t / 10;
      const y = 70 + (val - center) * 115; // 1 cm³ = 115px in zoomed lens
      arr.push({ tenths: t, y, isWhole: t % 10 === 0, isHalf: t % 5 === 0 && t % 10 !== 0 });
    }
    return arr;
  }, [meniscusValue]);

  // Precomputed live pH curve polyline for the right-hand card
  const phCurvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= 50; v += 0.5) {
      const ph = calculateStrongAcidBasePH(v, acidConcM, baseVolCm3, baseConcM);
      const x = 30 + (v / 50) * 196;
      const y = 96 - (ph / 14) * 82;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [acidConcM, baseVolCm3, baseConcM]);

  const surfaceBg = darkMode ? 'bg-[#161922] text-slate-100' : 'bg-[#f1f5fb] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#1d2230] border-white/[0.1] text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const dockBg = darkMode
    ? 'bg-[#131722]/95 border-white/[0.12] text-slate-100'
    : 'bg-white/95 border-slate-300/90 text-slate-900 shadow-lg';

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border overflow-hidden flex flex-col ${surfaceBg} ${
        darkMode ? 'border-white/[0.08]' : 'border-slate-200 shadow-sm'
      } ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-0 h-screen' : ''}`}
    >
      {/* TOP BAR (Matches Mitosis 3D & Ohm's Law 3D seamlessly) */}
      <div
        className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          darkMode ? 'bg-[#12151e] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleWatchLesson}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
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
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
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
              setChallengeIdx((prev) => (prev === null ? 0 : null));
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
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

        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center p-0.5 rounded-full border text-xs ${
              darkMode ? 'bg-[#1a1f2d] border-white/[0.1]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setLevel('o_level')}
              className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors ${
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
              className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors ${
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

      {/* MAIN CONTENT: 3D Titration Apparatus + Meniscus Loupe (8 cols) & Live Readout Panel (4 cols) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D INTERACTIVE TITRATION STAGE */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[450px] sm:h-[540px] lg:h-[600px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* CIRCULAR ZOOMED MENISCUS LOUPE (Scales larger during Chapter 2 "Reading a meniscus") */}
          <div
            className={`pointer-events-none absolute transition-all duration-500 rounded-full overflow-hidden border-[3px] shadow-xl ${
              magnifyMeniscusBig
                ? 'left-5 sm:left-8 top-12 w-44 h-44 sm:w-52 sm:h-52 border-indigo-400'
                : 'left-4 sm:left-7 top-16 w-28 h-28 sm:w-32 sm:h-32 border-slate-400/80'
            }`}
          >
            <svg viewBox="0 0 140 140" className="w-full h-full bg-[#f8fafc]">
              {/* Glass burette side walls */}
              <rect x="28" y="0" width="66" height="140" fill="#ffffff" />
              {/* Acid liquid fill below concave meniscus */}
              <path
                d="M 28 60 Q 61 77 94 60 L 94 140 L 28 140 Z"
                fill="#dbeafe"
              />
              {/* Crisp graduation ticks scrolling smoothly past the eye-level line */}
              {meniscusTicks.map((tk) => (
                <g key={tk.tenths}>
                  <line
                    x1="28"
                    y1={tk.y}
                    x2={tk.isWhole ? 62 : tk.isHalf ? 52 : 44}
                    y2={tk.y}
                    stroke="#1e293b"
                    strokeWidth={tk.isWhole ? 2.4 : 1.5}
                  />
                  {tk.isWhole && (
                    <text
                      x="104"
                      y={tk.y + 4}
                      fontSize="14"
                      fontWeight="800"
                      fill="#0f172a"
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                    >
                      {tk.tenths / 10}
                    </text>
                  )}
                </g>
              ))}
              {/* Concave Meniscus curve (bottom touches y = 70 exactly) */}
              <path
                d="M 28 60 Q 61 80 94 60"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Burette vertical walls */}
              <line x1="28" y1="0" x2="28" y2="140" stroke="#64748b" strokeWidth="2.4" />
              <line x1="94" y1="0" x2="94" y2="140" stroke="#64748b" strokeWidth="2.4" />
              {/* Purple dashed eye-level reading line tangent to the bottom of meniscus */}
              <line
                x1="0"
                y1="70"
                x2="140"
                y2="70"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
            </svg>
            <div className="absolute bottom-1.5 inset-x-0 text-center">
              <span className="px-2 py-0.5 rounded-full bg-slate-900/85 text-white text-[10px] font-mono font-bold">
                {meniscusValue.toFixed(2)} cm³
              </span>
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
                  <circle cx={lbl.ax} cy={lbl.ay} r="2.8" fill={darkMode ? '#f8fafc' : '#0f172a'} />
                </g>
              ))}
            </svg>
          )}
          {showLabels &&
            projectedLabels.map((lbl) => (
              <div
                key={`tag-${lbl.id}`}
                style={{
                  left: `${lbl.lx}px`,
                  top: `${lbl.ly}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`pointer-events-none absolute px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap shadow-xs border ${
                  darkMode
                    ? 'bg-[#121622] border-white/[0.16] text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {lbl.text}
              </div>
            ))}

          {/* Direct 3D Click Toast */}
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

          {/* EDITORIAL LESSON CAPTION OVERLAY AT BOTTOM OF 3D CANVAS (Matches reference screenshots!) */}
          {watchLessonActive && (
            <div className="pointer-events-none absolute bottom-3 inset-x-4 flex justify-center">
              <div
                className={`max-w-2xl px-5 py-3 rounded-2xl border text-center ${
                  darkMode
                    ? 'bg-[#10141f]/95 border-white/[0.14] text-white'
                    : 'bg-white/95 border-slate-300 text-slate-900 shadow-md'
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
                  darkMode ? 'text-slate-400 bg-[#161922]/85' : 'text-slate-500 bg-[#f1f5fb]/90'
                }`}
              >
                Open the tap to run the solution in. Near the end add single drops, then record the titre.
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SCIENTIFIC READOUT, LIVE pH CURVE & TITRE TABLE PANEL (4 cols) */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-4 sm:p-5 flex flex-col justify-between gap-3.5 lg:max-h-[600px] overflow-y-auto ${
            darkMode ? 'bg-[#131722] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3.5">
            {/* Hero Editorial Volume Readout (Matches Screenshot 1 & 5) */}
            <div>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
                  {inSetupPhase ? lessonSetupNaohVol.toFixed(1) : acidAdded.toFixed(2)}
                </span>
                <span className={`text-base font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  cm³
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {inSetupPhase
                  ? 'of sodium hydroxide solution delivered into conical flask'
                  : 'of hydrochloric acid added to sodium hydroxide'}
              </p>

              {/* Indicator Colour Pill + Guidance */}
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-400/50 shrink-0"
                  style={{ backgroundColor: indicatorVisual.hex }}
                />
                <span className="text-base font-bold">{indicatorVisual.label}</span>
                <span
                  className={`ml-auto px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                    darkMode ? 'bg-white/[0.06] text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  pH {currentPH.toFixed(2)}
                </span>
              </div>
              <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {guidanceLine}
              </p>
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
                  <span className="font-black uppercase tracking-wider text-[10px]">
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
                        prev === null ? 0 : (prev + 1) % TITRATION_CHALLENGES.length
                      )
                    }
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    Next Lab Challenge →
                  </button>
                )}
              </div>
            )}

            {/* LIVE SIGMOID pH TITRATION CURVE */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${cardBg}`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                  Live pH Curve ({INDICATORS[indicator].name})
                </span>
                <span className={`font-mono text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isUnknownSample ? 'Eq: ? cm³' : `Eq: ${equivalenceVol.toFixed(2)} cm³`}
                </span>
              </div>
              <svg viewBox="0 0 240 112" className="w-full h-24">
                {/* Horizontal gridlines at pH 14, 7, 0 */}
                {[14, 55, 96].map((y) => (
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
                {/* Indicator colour-change pH transition band */}
                <rect
                  x="30"
                  y={96 - (INDICATORS[indicator].rangeHigh / 14) * 82}
                  width="196"
                  height={((INDICATORS[indicator].rangeHigh - INDICATORS[indicator].rangeLow) / 14) * 82}
                  fill={INDICATORS[indicator].alkalineHex}
                  opacity="0.14"
                />
                {/* Axes */}
                <line x1="30" y1="10" x2="30" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />
                <line x1="30" y1="96" x2="228" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />

                {/* Sigmoid titration curve */}
                <polyline
                  points={phCurvePoints}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />

                {/* Live operating dot */}
                <circle
                  cx={30 + (Math.min(50, acidAdded) / 50) * 196}
                  cy={96 - (currentPH / 14) * 82}
                  r="5"
                  fill={indicatorVisual.hex}
                  stroke={darkMode ? '#ffffff' : '#0f172a'}
                  strokeWidth="1.8"
                />
                <text x="6" y="18" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">14</text>
                <text x="11" y="58" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">7</text>
                <text x="11" y="98" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">0</text>
                <text x="172" y="108" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">
                  Vol HCl (cm³)
                </text>
              </svg>
            </div>

            {/* RECORDED TITRES LOG & CONCORDANT MEAN */}
            <div className={`p-3 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                  Recorded Titres ({recordedTitres.length})
                </span>
                {recordedTitres.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRecordedTitres([])}
                    className={`p-1 rounded cursor-pointer ${
                      darkMode ? 'text-slate-400 hover:text-rose-300' : 'text-slate-400 hover:text-rose-600'
                    }`}
                    title="Clear titre table"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              {recordedTitres.length === 0 ? (
                <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No titres recorded yet. Stop at the colour change and click <strong>Record titre</strong>.
                </p>
              ) : (
                <div className="space-y-1 text-[11px] tabular-nums">
                  {recordedTitres.map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between px-2 py-1 rounded-lg ${
                        darkMode ? 'bg-white/[0.04]' : 'bg-slate-50'
                      }`}
                    >
                      <span className="font-semibold">Trial {t.trial}</span>
                      <span className="font-mono font-bold">{t.volume.toFixed(2)} cm³</span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          t.quality === 'exact'
                            ? 'text-emerald-500'
                            : t.quality === 'close'
                            ? 'text-sky-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {t.quality}
                      </span>
                    </div>
                  ))}
                  {meanTitre !== null && (
                    <div className="pt-1.5 border-t border-slate-500/20 flex items-center justify-between font-bold text-emerald-500">
                      <span>Mean Titre</span>
                      <span className="font-mono">{meanTitre.toFixed(2)} cm³</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* NECTA STOICHIOMETRY EQUATION CARD */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode
                ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="font-bold">HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)</div>
            <div className="font-mono text-[11px] mt-0.5 opacity-90">
              {level === 'o_level'
                ? `M_a V_a = M_b V_b · 0.10 × ${(meanTitre ?? acidAdded).toFixed(2)} = M_b × 25.0`
                : `n(HCl) = ${((acidConcM * (meanTitre ?? acidAdded)) / 1000).toFixed(5)} mol → C(NaOH) = ${(
                    (acidConcM * (meanTitre ?? acidAdded)) /
                    baseVolCm3
                  ).toFixed(4)} M`}
            </div>
          </div>
        </aside>
      </div>

      {/* UNIFIED BOTTOM CONTROL DOCK: VIDEO LESSON SCRUBBER (during Watch Lesson) OR TITRATE/SET UP DOCK */}
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

        {/* GUIDED 1:05 VIDEO-STYLE SCRUBBER BAR (Matches Screenshots 2 & 5!) */}
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

            {/* 4-Chapter Segmented Progress Scrubber */}
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
                    className={`h-2.5 rounded-full overflow-hidden cursor-pointer relative ${
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

            {/* Playback Speed Toggle */}
            <button
              type="button"
              onClick={() => setLessonSpeed((s) => (s === 1 ? 0.75 : s === 0.75 ? 1.5 : 1))}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer shrink-0 ${
                darkMode
                  ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#242c42]'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
              title="Change lesson playback speed"
            >
              {lessonSpeed}×
            </button>

            {/* Take over from here button (Matches Screenshot 2 & 5!) */}
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
            <div className="px-4 py-3.5 space-y-3 max-w-5xl mx-auto">
              {/* Primary Interactive Dock Row (Matches Screenshot 1: Titrate | Set up | Tap Slider | One drop | Record titre | Refill) */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Mode Toggle: Titrate | Set up */}
                <div
                  className={`inline-flex p-0.5 rounded-xl border text-xs shrink-0 ${
                    darkMode ? 'bg-[#1a1f2d] border-white/[0.12]' : 'bg-white border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setDockTab('titrate')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                      dockTab === 'titrate'
                        ? darkMode
                          ? 'bg-white text-slate-950'
                          : 'bg-slate-900 text-white'
                        : darkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Titrate
                  </button>
                  <button
                    type="button"
                    onClick={() => setDockTab('setup')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                      dockTab === 'setup'
                        ? darkMode
                          ? 'bg-white text-slate-950'
                          : 'bg-slate-900 text-white'
                        : darkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Set up
                  </button>
                </div>

                {dockTab === 'titrate' ? (
                  <>
                    {/* Tap Flow Slider */}
                    <div className="flex-1 min-w-[170px] flex items-center gap-2.5 px-2">
                      <span className="text-xs font-bold shrink-0">Tap</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={tapOpen}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTapOpen(val);
                          tapOpenRef.current = val;
                        }}
                        aria-label="Burette tap flow rate"
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-mono font-bold w-12 text-right shrink-0">
                        {tapOpen < 0.02 ? 'Shut' : `${Math.round(tapOpen * 100)}%`}
                      </span>
                    </div>

                    {/* Precision One Drop Button */}
                    <button
                      type="button"
                      onClick={handleAddOneDrop}
                      disabled={acidAdded >= 50}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors disabled:opacity-40 ${
                        darkMode
                          ? 'bg-[#22293b] border border-white/[0.14] text-white hover:bg-[#2c354c]'
                          : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span>One drop</span>
                    </button>

                    {/* Record Titre Button */}
                    <button
                      type="button"
                      onClick={handleRecordTitre}
                      disabled={acidAdded < 0.5}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors disabled:opacity-40 ${
                        Math.abs(acidAdded - equivalenceVol) <= 0.2
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : darkMode
                          ? 'bg-[#22293b] border border-white/[0.14] text-slate-100 hover:bg-[#2c354c]'
                          : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Record titre
                    </button>

                    {/* Refill Button */}
                    <button
                      type="button"
                      onClick={handleRefill}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                        darkMode
                          ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#252d40]'
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Refill</span>
                    </button>
                  </>
                ) : (
                  /* SET UP TAB: Choose Indicator & Alkali Sample Concentration */
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold flex items-center gap-1 mr-1">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Indicator:</span>
                      </span>
                      {(Object.values(INDICATORS) as IndicatorSpec[]).map((ind) => (
                        <button
                          key={ind.id}
                          type="button"
                          onClick={() => setIndicator(ind.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                            indicator === ind.id
                              ? darkMode
                                ? 'bg-white text-slate-950 border-white'
                                : 'bg-slate-900 text-white border-slate-900'
                              : darkMode
                              ? 'bg-[#1a2030] border-white/[0.1] text-slate-300 hover:text-white'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: ind.alkalineHex }}
                          />
                          <span>{ind.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setBaseConcM(0.0966);
                          setIsUnknownSample(false);
                          handleRefill();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          !isUnknownSample
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-500'
                            : darkMode
                            ? 'bg-[#1a2030] border-white/[0.1] text-slate-300'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        Standard (24.15 cm³)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const randConc = Number((0.072 + Math.random() * 0.044).toFixed(4));
                          setBaseConcM(randConc);
                          setIsUnknownSample(true);
                          handleRefill();
                          setInteractionHint('Loaded Unknown NaOH Sample — titrate carefully to find its concentration!');
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          isUnknownSample
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-500'
                            : darkMode
                            ? 'bg-[#1a2030] border-white/[0.1] text-slate-300'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        Unknown Sample
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Titration3DSimulation;
