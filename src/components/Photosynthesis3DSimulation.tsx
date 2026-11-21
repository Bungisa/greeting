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

export interface Photosynthesis3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';

interface LessonChapter {
  index: number;
  title: string;
  startSec: number;
  endSec: number;
  oCaption: string;
  aCaption: string;
}

// 65-second (1:05) guided lesson for comfortable classroom reading & observation
const LESSON_DURATION_SEC = 65;

const LESSON_CHAPTERS: LessonChapter[] = [
  {
    index: 0,
    title: 'Sunlight & palisade cells',
    startSec: 0,
    endSec: 17,
    oCaption:
      'Sunlight passes through the transparent upper epidermis and waxy cuticle straight into palisade cells packed with green chloroplasts.',
    aCaption:
      'Photons penetrate the translucent cuticle and upper epidermis to excite chlorophyll a & b in the thylakoid membranes of palisade mesophyll chloroplasts.',
  },
  {
    index: 1,
    title: 'Stomata & xylem transport',
    startSec: 17,
    endSec: 34,
    oCaption:
      'Guard cells swell to open the stoma underneath the leaf so CO₂ diffuses into air spaces, while xylem vessels bring water up the leaf vein.',
    aCaption:
      'Turgid guard cells open the stomatal pore for CO₂ diffusion across spongy mesophyll spaces while transpiration pull supplies H₂O through lignified xylem.',
  },
  {
    index: 2,
    title: 'Making glucose & oxygen',
    startSec: 34,
    endSec: 50,
    oCaption:
      'Inside chloroplasts, light energy combines CO₂ and water into glucose (carried away by phloem) and releases oxygen bubbles out of the leaf!',
    aCaption:
      'Photolysis releases O₂ while ATP and NADPH power the Calvin cycle to synthesise triose phosphate, exported as sucrose via phloem sieve tubes.',
  },
  {
    index: 3,
    title: 'Limiting factors & heat stress',
    startSec: 50,
    endSec: 65,
    oCaption:
      'Too much heat (above 40°C) damages photosynthetic enzymes and slows oxygen output sharply. Watch the rate drop as temperature climbs!',
    aCaption:
      'Above ~40°C, thermal denaturation of Rubisco and photosynthetic enzymes collapses carbon fixation even when light and CO₂ are abundant.',
  },
];

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
    prompt: 'Keep Light ≥ 75% and Stomata OPEN, then overheat the leaf so enzyme denaturation drops O₂ output below 15 bubbles/min.',
    hint: 'Raise Temperature above 43°C and watch the chloroplast rate collapse.',
    check: (l, _c, t, open, rate) => open && l >= 75 && t >= 42 && rate < 15,
  },
  {
    id: 'stomata_throttle',
    title: 'Stomatal Gas Control',
    prompt: 'Under bright light (≥ 70%) and optimal temperature (25–35°C), close the 3D Stomata to see CO₂ starvation!',
    hint: 'Click directly on the green guard cells under the leaf (or the Stomata button at top).',
    check: (l, _c, t, open) => !open && l >= 70 && t >= 25 && t <= 35,
  },
];

interface LabelSpec {
  id: string;
  text: string;
  worldPos: THREE.Vector3;
  offsetX: number;
  offsetY: number;
}

interface ProjectedLabel {
  id: string;
  text: string;
  ax: number;
  ay: number;
  lx: number;
  ly: number;
}

// Module-scope reusable scratch math objects (zero per-frame GC allocations)
const _vProj = new THREE.Vector3();
const _vPos = new THREE.Vector3();
const _matDummy = new THREE.Matrix4();
const _quatDummy = new THREE.Quaternion();
const _scaleDummy = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

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

  // Michaelis–Menten saturation curves for Light & CO₂
  const fLight = lightPct / (lightPct + 24);
  const effectiveCo2 = stomataOpen ? co2Pct : co2Pct * 0.14;
  const fCo2 = effectiveCo2 <= 0.5 ? 0 : effectiveCo2 / (effectiveCo2 + 22);

  // Asymmetric enzyme temperature response peaking at 30°C, denaturing rapidly > 39°C
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

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 122);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.36)');
  grad.addColorStop(0.58, 'rgba(15, 23, 42, 0.14)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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

  // ==================== THREE.JS 3D LEAF CROSS-SECTION & VASCULAR FLOW ====================
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

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(1.6, 2.2, 9.2);

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

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.05);
    scene.add(hemiLight);

    const sunDirLight = new THREE.DirectionalLight(0xfffbeb, 2.1);
    sunDirLight.position.set(3.5, 9.5, 5.5);
    sunDirLight.castShadow = !isSoftwareGl;
    sunDirLight.shadow.mapSize.set(1024, 1024);
    sunDirLight.shadow.bias = -0.0005;
    sunDirLight.shadow.normalBias = 0.02;
    scene.add(sunDirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rimLight.position.set(-6, 2.5, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 5.4;
    controls.maxDistance = 15.0;
    controls.target.set(0, 0.15, 0);

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

    // Soft floating ground contact shadow below leaf cutaway
    const shadowTex = trackTex(createContactShadowTexture());
    const contactShadow = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(7.2, 4.2)),
      trackMat(
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.45,
        })
      )
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -2.25;
    leafRoot.add(contactShadow);

    // ==================== 1. WAXY CUTICLE & UPPER EPIDERMIS (Top: y = +1.55) ====================
    const cuticleMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xd9f99d,
        roughness: 0.14,
        metalness: 0.02,
        transparent: true,
        opacity: 0.42,
      })
    );
    const cuticleSlab = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.2, 0.11, 2.75)), cuticleMat);
    cuticleSlab.position.y = 1.66;
    leafRoot.add(cuticleSlab);

    const epidermisMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xecfccb,
        roughness: 0.28,
        metalness: 0.0,
        transparent: true,
        opacity: 0.52,
      })
    );
    const epiCellGeo = trackGeo(new THREE.BoxGeometry(0.72, 0.32, 0.82));
    for (let ix = -3; ix <= 3; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        const cell = new THREE.Mesh(epiCellGeo, epidermisMat);
        cell.position.set(ix * 0.82, 1.4, iz * 0.88);
        leafRoot.add(cell);
      }
    }

    // ==================== 2. PALISADE MESOPHYLL LAYER & INSTANCED CHLOROPLASTS ====================
    const palisadeCellMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x4ade80,
        roughness: 0.44,
        metalness: 0.0,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
      })
    );
    const palisadeGroup = new THREE.Group();
    leafRoot.add(palisadeGroup);

    const palCellGeo = trackGeo(new THREE.CapsuleGeometry(0.24, 0.74, 8, 16));
    const chloroplastPositions: THREE.Vector3[] = [];

    for (let ix = -4; ix <= 4; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        const cx = ix * 0.64;
        const cz = iz * 0.82;
        const cell = new THREE.Mesh(palCellGeo, palisadeCellMat);
        cell.position.set(cx, 0.62, cz);
        cell.renderOrder = 6;
        palisadeGroup.add(cell);

        // Pack 4 oval chloroplasts inside each palisade cell
        for (let k = 0; k < 4; k++) {
          const angle = (k * Math.PI * 0.5) + ix * 0.6 + iz * 1.1;
          chloroplastPositions.push(
            new THREE.Vector3(
              cx + Math.cos(angle) * 0.13,
              0.28 + k * 0.22,
              cz + Math.sin(angle) * 0.13
            )
          );
        }
      }
    }

    // ==================== 3. SPONGY MESOPHYLL LAYER (Irregular rounded cells with air spaces) ====================
    const spongyCellMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x86efac,
        roughness: 0.56,
        metalness: 0.0,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );
    const spongyGeo = trackGeo(new THREE.SphereGeometry(0.32, 18, 14));
    const spongyCoords: Array<[number, number, number]> = [
      [-2.45, -0.32, -0.75],
      [-2.35, -0.82, 0.55],
      [-1.55, -0.45, 0.72],
      [-1.45, -0.88, -0.68],
      [-1.95, -0.22, 0.08],
      [1.55, -0.35, -0.72],
      [1.65, -0.85, 0.62],
      [2.4, -0.42, 0.72],
      [2.32, -0.86, -0.58],
      [2.0, -0.25, 0.02],
      [-0.95, -0.92, 0.82],
      [0.95, -0.92, -0.78],
    ];
    for (const [sx, sy, sz] of spongyCoords) {
      const m = new THREE.Mesh(spongyGeo, spongyCellMat);
      m.position.set(sx, sy, sz);
      m.scale.set(1.12, 0.84, 0.96);
      m.renderOrder = 6;
      leafRoot.add(m);
      // 2 chloroplasts in each spongy cell
      chloroplastPositions.push(
        new THREE.Vector3(sx - 0.12, sy + 0.05, sz + 0.08),
        new THREE.Vector3(sx + 0.12, sy - 0.06, sz - 0.08)
      );
    }

    // Instanced 3D Chloroplasts (glow vivid emerald when active, turn olive-brown when heat-denatured!)
    const chloroGeo = trackGeo(new THREE.SphereGeometry(0.082, 12, 10));
    chloroGeo.scale(1.35, 0.65, 0.9);
    const chloroMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        emissive: new THREE.Color(0x22c55e),
        emissiveIntensity: 0.25,
        roughness: 0.3,
        metalness: 0.08,
      })
    );
    const chloroInstanced = new THREE.InstancedMesh(chloroGeo, chloroMat, chloroplastPositions.length);
    chloroInstanced.frustumCulled = false;
    leafRoot.add(chloroInstanced);

    // ==================== 4. CENTRAL VASCULAR BUNDLE (XYLEM + PHLOEM) ====================
    const vascularGroup = new THREE.Group();
    vascularGroup.position.set(0, -0.42, 0);
    leafRoot.add(vascularGroup);

    // Bundle sheath ring enclosing vein
    const sheathMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xa3e635,
        roughness: 0.55,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      })
    );
    const sheathCyl = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.76, 0.76, 2.72, 28, 1, true)), sheathMat);
    sheathCyl.rotation.x = Math.PI / 2;
    vascularGroup.add(sheathCyl);

    // XYLEM VESSELS (Upper half of vascular bundle — thick lignified terracotta/amber hollow tubes!)
    const xylemGroup = new THREE.Group();
    const xylemMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.42,
        metalness: 0.12,
        transparent: true,
        opacity: 0.72,
      })
    );
    const xylemTubeGeo = trackGeo(new THREE.CylinderGeometry(0.145, 0.145, 2.86, 18, 1, true));
    const xylemOffsets: Array<[number, number]> = [
      [-0.24, 0.24],
      [0.0, 0.34],
      [0.24, 0.24],
    ];
    for (const [xx, xy] of xylemOffsets) {
      const tube = new THREE.Mesh(xylemTubeGeo, xylemMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(xx, xy, 0);
      xylemGroup.add(tube);
    }
    vascularGroup.add(xylemGroup);

    // PHLOEM SIEVE TUBES (Lower half of vascular bundle — emerald-teal living transport tubes!)
    const phloemGroup = new THREE.Group();
    const phloemMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0d9488,
        roughness: 0.46,
        metalness: 0.1,
        transparent: true,
        opacity: 0.72,
      })
    );
    const phloemTubeGeo = trackGeo(new THREE.CylinderGeometry(0.125, 0.125, 2.86, 18, 1, true));
    const phloemOffsets: Array<[number, number]> = [
      [-0.24, -0.24],
      [0.0, -0.34],
      [0.24, -0.24],
    ];
    for (const [px, py] of phloemOffsets) {
      const tube = new THREE.Mesh(phloemTubeGeo, phloemMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(px, py, 0);
      phloemGroup.add(tube);
    }
    vascularGroup.add(phloemGroup);

    // ==================== 5. LOWER EPIDERMIS & INTERACTIVE 3D STOMA (GUARD CELLS) ====================
    for (let ix = -3; ix <= 3; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        // Leave central opening for the interactive Stoma!
        if (ix === 0 && iz === 0) continue;
        const cell = new THREE.Mesh(epiCellGeo, epidermisMat);
        cell.position.set(ix * 0.82, -1.36, iz * 0.88);
        leafRoot.add(cell);
      }
    }

    // Interactive Guard Cell Pair flanking the stomatal pore at (0, -1.38, 0)
    const stomataGroup = new THREE.Group();
    stomataGroup.position.set(0, -1.38, 0);
    leafRoot.add(stomataGroup);

    const guardCellMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        emissive: new THREE.Color(0x22c55e),
        emissiveIntensity: 0.18,
        roughness: 0.34,
        metalness: 0.08,
      })
    );
    const guardArcGeo = trackGeo(new THREE.TorusGeometry(0.32, 0.115, 14, 24, Math.PI * 0.92));
    const guardLeft = new THREE.Mesh(guardArcGeo, guardCellMat);
    guardLeft.rotation.x = Math.PI / 2;
    guardLeft.rotation.z = Math.PI * 0.54;
    const guardRight = new THREE.Mesh(guardArcGeo, guardCellMat);
    guardRight.rotation.x = Math.PI / 2;
    guardRight.rotation.z = -Math.PI * 0.46;
    stomataGroup.add(guardLeft, guardRight);

    // ==================== 6. INSTANCED ANIMATED FLOW PARTICLES ====================
    // A. Descending Golden Sunlight Photons (24)
    const PHOTON_COUNT = 24;
    const photonMat = trackMat(
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.88 })
    );
    const photonInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.068, 10, 8)),
      photonMat,
      PHOTON_COUNT
    );
    photonInstanced.frustumCulled = false;
    leafRoot.add(photonInstanced);

    // Subtle sunlit beam shafts above leaf
    const sunBeamMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    const sunBeams: THREE.Mesh[] = [];
    for (let i = -2; i <= 2; i++) {
      const beam = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.42, 2.4, 12, 1, true)), sunBeamMat);
      beam.position.set(i * 1.1 + 0.35, 2.75, 0);
      beam.rotation.z = 0.24;
      leafRoot.add(beam);
      sunBeams.push(beam);
    }

    // B. Xylem Water (H₂O) Blue Droplets moving along Xylem vessels (24)
    const WATER_COUNT = 24;
    const waterMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: new THREE.Color(0x0284c7),
        emissiveIntensity: 0.65,
        roughness: 0.15,
      })
    );
    const waterInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.064, 10, 8)),
      waterMat,
      WATER_COUNT
    );
    waterInstanced.frustumCulled = false;
    leafRoot.add(waterInstanced);

    // C. Phloem Glucose/Sucrose (C₆H₁₂O₆) Golden Spheres translocating out of Phloem (20)
    const GLUCOSE_COUNT = 20;
    const glucoseMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: new THREE.Color(0xfbbf24),
        emissiveIntensity: 0.72,
        roughness: 0.22,
      })
    );
    const glucoseInstanced = new THREE.InstancedMesh(
      trackGeo(new THREE.OctahedronGeometry(0.072, 1)),
      glucoseMat,
      GLUCOSE_COUNT
    );
    glucoseInstanced.frustumCulled = false;
    leafRoot.add(glucoseInstanced);

    // D. CO₂ Molecules (violet-indigo) diffusing UP through open stoma into mesophyll (20)
    const CO2_COUNT = 20;
    const co2Mat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        emissive: new THREE.Color(0x7c3aed),
        emissiveIntensity: 0.55,
        roughness: 0.25,
      })
    );
    const co2Instanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.062, 10, 8)),
      co2Mat,
      CO2_COUNT
    );
    co2Instanced.frustumCulled = false;
    leafRoot.add(co2Instanced);

    // E. O₂ Oxygen Bubbles (bright cyan-white) streaming OUT of the leaf (26)
    const O2_COUNT = 26;
    const o2Mat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: new THREE.Color(0x22d3ee),
        emissiveIntensity: 0.85,
        roughness: 0.1,
      })
    );
    const o2Instanced = new THREE.InstancedMesh(
      trackGeo(new THREE.SphereGeometry(0.068, 12, 10)),
      o2Mat,
      O2_COUNT
    );
    o2Instanced.frustumCulled = false;
    leafRoot.add(o2Instanced);

    // 3D Label Anchors
    const labelSpecs: LabelSpec[] = [
      {
        id: 'epidermis',
        text: 'Cuticle & upper epidermis',
        worldPos: new THREE.Vector3(-2.1, 1.66, 0.8),
        offsetX: -72,
        offsetY: -36,
      },
      {
        id: 'palisade',
        text: 'Palisade chloroplasts',
        worldPos: new THREE.Vector3(2.2, 0.72, 0.7),
        offsetX: 78,
        offsetY: -22,
      },
      {
        id: 'xylem',
        text: 'Xylem (H₂O in)',
        worldPos: new THREE.Vector3(0.0, -0.08, 1.38),
        offsetX: -102,
        offsetY: -12,
      },
      {
        id: 'phloem',
        text: 'Phloem (glucose out)',
        worldPos: new THREE.Vector3(0.0, -0.76, 1.38),
        offsetX: 108,
        offsetY: 16,
      },
      {
        id: 'stomata',
        text: 'Stoma & guard cells',
        worldPos: new THREE.Vector3(0.0, -1.42, 0.25),
        offsetX: -88,
        offsetY: 42,
      },
    ];

    function computeProjectedLabels(): ProjectedLabel[] {
      if (!showLabelsRef.current) return [];
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      if (w <= 0 || h <= 0) return [];
      const out: ProjectedLabel[] = [];
      for (const spec of labelSpecs) {
        _vProj.copy(spec.worldPos);
        _vProj.project(camera);
        if (_vProj.z > 1) continue;
        const ax = (_vProj.x * 0.5 + 0.5) * w;
        const ay = (-_vProj.y * 0.5 + 0.5) * h;
        const lx = Math.max(82, Math.min(w - 82, ax + spec.offsetX));
        const ly = Math.max(26, Math.min(h - 26, ay + spec.offsetY));
        out.push({ id: spec.id, text: spec.text, ax, ay, lx, ly });
      }
      return out;
    }

    // ==================== DIRECT 3D RAYCAST INTERACTION ====================
    const clickableMeshes: Array<{ mesh: THREE.Object3D; action: 'stomata' | 'palisade' | 'xylem' | 'phloem' }> = [
      { mesh: stomataGroup, action: 'stomata' },
      { mesh: palisadeGroup, action: 'palisade' },
      { mesh: xylemGroup, action: 'xylem' },
      { mesh: phloemGroup, action: 'phloem' },
    ];
    const hitTargets = clickableMeshes.map((c) => c.mesh);
    let pointerDown = { x: 0, y: 0 };
    let lastHover = 0;

    const getHitAction = (cx: number, cy: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((cy - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointerNdc, camera);
      const hits = _raycaster.intersectObjects(hitTargets, true);
      if (hits.length === 0) return null;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj) {
        const found = clickableMeshes.find((c) => c.mesh === obj);
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
      if (!action) return;

      if (action === 'stomata') {
        setWatchLessonActive(false);
        setLessonPaused(false);
        setStomataOpen((prev) => {
          const next = !prev;
          setInteractionHint(
            next
              ? 'Guard cells swelled OPEN — CO₂ now diffuses freely into leaf air spaces!'
              : 'Guard cells CLOSED the stoma — CO₂ intake restricted to conserve water!'
          );
          return next;
        });
      } else if (action === 'palisade') {
        const m = computePhotosynthesisMetrics(lightRef.current, co2Ref.current, tempRef.current, stomataRef.current);
        setInteractionHint(
          `Palisade Chloroplasts — Output: ${m.bubblesPerMin} O₂ bubbles/min (Limiting: ${m.limitingFactor})`
        );
      } else if (action === 'xylem') {
        setInteractionHint('Xylem Vessels — continuous transpiration stream delivering H₂O from roots to mesophyll.');
      } else if (action === 'phloem') {
        const m = computePhotosynthesisMetrics(lightRef.current, co2Ref.current, tempRef.current, stomataRef.current);
        setInteractionHint(`Phloem Sieve Tubes — translocating ${m.glucoseMgHr.toFixed(1)} mg/hr of glucose/sucrose.`);
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

    let dampedLight = lightRef.current;
    let dampedCo2 = co2Ref.current;
    let dampedTemp = tempRef.current;
    let dampedAperture = stomataRef.current ? 1 : 0;

    let photonPhase = 0;
    let waterPhase = 0;
    let glucosePhase = 0;
    let co2Phase = 0;
    let o2Phase = 0;

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
          // Chapter 1: Dawn -> bright sunlight hitting palisade chloroplasts
          const f = Math.min(1, t / 14);
          lightRef.current = Math.round(10 + f * 75);
          co2Ref.current = 40;
          tempRef.current = 26;
          stomataRef.current = false;
        } else if (t < 34) {
          // Chapter 2: Guard cells swell open -> CO₂ rises to 80%, xylem supplies water
          const f = Math.min(1, (t - 17) / 13);
          lightRef.current = 85;
          co2Ref.current = Math.round(40 + f * 45);
          tempRef.current = 28;
          stomataRef.current = true;
        } else if (t < 50) {
          // Chapter 3: Peak photosynthesis -> rapid O₂ bubbles & phloem glucose export!
          lightRef.current = 95;
          co2Ref.current = 90;
          tempRef.current = 30;
          stomataRef.current = true;
        } else {
          // Chapter 4: Heat stress (>40°C) demonstrates enzyme denaturation!
          const f = Math.min(1, (t - 50) / 11);
          lightRef.current = 90;
          co2Ref.current = 85;
          tempRef.current = Math.round(30 + f * 15);
          stomataRef.current = true;
        }

        const nowTs = performance.now();
        if (nowTs - lastUiSyncRef.current > 110) {
          lastUiSyncRef.current = nowTs;
          setLessonTimeSec(Number(t.toFixed(2)));
          setLightPct(lightRef.current);
          setCo2Pct(co2Ref.current);
          setTempC(tempRef.current);
          setStomataOpen(stomataRef.current);
        }
      }

      // Smoothly damp environmental parameters
      dampedLight = THREE.MathUtils.damp(dampedLight, lightRef.current, 6, delta);
      dampedCo2 = THREE.MathUtils.damp(dampedCo2, co2Ref.current, 6, delta);
      dampedTemp = THREE.MathUtils.damp(dampedTemp, tempRef.current, 6, delta);
      dampedAperture = THREE.MathUtils.damp(dampedAperture, stomataRef.current ? 1 : 0, 8, delta);

      const live = computePhotosynthesisMetrics(dampedLight, dampedCo2, dampedTemp, dampedAperture > 0.4);
      const rate = live.normalizedRate;

      // 1. Sunlight Directional Intensity & Sunbeams
      const lightFrac = dampedLight / 100;
      sunDirLight.intensity = 0.55 + lightFrac * 2.15;
      sunBeamMat.opacity = lightFrac * (isDark ? 0.16 : 0.12);
      sunBeams.forEach((b) => {
        b.visible = lightFrac > 0.04;
      });

      // 2. Guard Cells physically swell open / close flat
      const poreGap = THREE.MathUtils.lerp(0.06, 0.25, dampedAperture);
      guardLeft.position.x = -poreGap;
      guardRight.position.x = poreGap;
      const swell = THREE.MathUtils.lerp(0.86, 1.12, dampedAperture);
      guardLeft.scale.set(swell, swell, 1);
      guardRight.scale.set(swell, swell, 1);

      // 3. Chloroplast colour & lively activity (vibrant green -> olive heat stress if denatured)
      const heatStress = THREE.MathUtils.clamp((dampedTemp - 37) / 8, 0, 1);
      chloroMat.color.setHSL(
        THREE.MathUtils.lerp(0.37, 0.16, heatStress),
        THREE.MathUtils.lerp(0.76, 0.42, heatStress),
        THREE.MathUtils.lerp(0.38, 0.34, heatStress)
      );
      chloroMat.emissive.setHSL(THREE.MathUtils.lerp(0.38, 0.14, heatStress), 0.85, 0.45);
      chloroMat.emissiveIntensity = (0.1 + rate * 0.72) * (1 - heatStress * 0.75);

      for (let i = 0; i < chloroplastPositions.length; i++) {
        const base = chloroplastPositions[i];
        const wobble = Math.sin(elapsed * (1.2 + rate * 4.5) + i * 0.9) * 0.028 * (0.25 + rate);
        _vPos.set(base.x + wobble, base.y + Math.cos(elapsed * 2 + i) * 0.015, base.z);
        _quatDummy.setFromEuler(new THREE.Euler(0, elapsed * (0.2 + rate * 1.1) + i, 0));
        _scaleDummy.setScalar(0.92 + rate * 0.22);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        chloroInstanced.setMatrixAt(i, _matDummy);
      }
      chloroInstanced.instanceMatrix.needsUpdate = true;

      // 4. Descending Golden Sunlight Photons
      photonPhase = (photonPhase + delta * (0.3 + lightFrac * 0.9)) % 1;
      for (let i = 0; i < PHOTON_COUNT; i++) {
        const u = (i / PHOTON_COUNT + photonPhase) % 1;
        const laneX = ((i * 1.37) % 5.2) - 2.6;
        const laneZ = ((i * 0.83) % 2.0) - 1.0;
        const y = THREE.MathUtils.lerp(3.65, 0.55, u);
        _vPos.set(laneX + (1 - u) * 0.55, y, laneZ);
        _quatDummy.identity();
        const sc = lightFrac > 0.05 ? (0.45 + lightFrac * 0.75) * Math.sin(u * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        photonInstanced.setMatrixAt(i, _matDummy);
      }
      photonInstanced.instanceMatrix.needsUpdate = true;

      // 5. Xylem Water (H₂O) droplets flowing through upper vascular tubes (back -> front)
      const waterSpeed = 0.22 + (dampedAperture * 0.45 + rate * 0.55);
      waterPhase = (waterPhase + delta * waterSpeed) % 1;
      for (let i = 0; i < WATER_COUNT; i++) {
        const tube = xylemOffsets[i % xylemOffsets.length];
        const u = (i / WATER_COUNT + waterPhase) % 1;
        _vPos.set(tube[0], -0.42 + tube[1], THREE.MathUtils.lerp(-1.42, 1.42, u));
        _quatDummy.identity();
        _scaleDummy.setScalar(0.8 + rate * 0.35);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        waterInstanced.setMatrixAt(i, _matDummy);
      }
      waterInstanced.instanceMatrix.needsUpdate = true;

      // 6. Phloem Glucose/Sucrose spheres translocating out along lower vascular tubes (front -> back)
      glucosePhase = (glucosePhase + delta * (0.08 + rate * 0.95)) % 1;
      for (let i = 0; i < GLUCOSE_COUNT; i++) {
        const tube = phloemOffsets[i % phloemOffsets.length];
        const u = (i / GLUCOSE_COUNT + glucosePhase) % 1;
        _vPos.set(tube[0], -0.42 + tube[1], THREE.MathUtils.lerp(1.42, -1.42, u));
        _quatDummy.setFromEuler(new THREE.Euler(elapsed + i, elapsed * 1.4, 0));
        _scaleDummy.setScalar(rate > 0.04 ? 0.45 + rate * 0.78 : 0.0001);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        glucoseInstanced.setMatrixAt(i, _matDummy);
      }
      glucoseInstanced.instanceMatrix.needsUpdate = true;

      // 7. CO₂ Molecules diffusing UP through the stoma into spongy air spaces
      const co2Flow = (dampedCo2 / 100) * (0.12 + dampedAperture * 0.88);
      co2Phase = (co2Phase + delta * (0.18 + co2Flow * 0.85)) % 1;
      for (let i = 0; i < CO2_COUNT; i++) {
        const u = (i / CO2_COUNT + co2Phase) % 1;
        const spreadAngle = i * 2.39;
        const spreadR = Math.pow(u, 1.4) * 2.15;
        const x = Math.cos(spreadAngle) * spreadR;
        const z = Math.sin(spreadAngle) * Math.min(1.0, spreadR * 0.55);
        const y = THREE.MathUtils.lerp(-2.25, 0.32, u);
        _vPos.set(x, y, z);
        _quatDummy.identity();
        const sc = co2Flow > 0.04 ? (0.45 + co2Flow * 0.65) * Math.sin(u * Math.PI) : 0.0001;
        _scaleDummy.setScalar(sc);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        co2Instanced.setMatrixAt(i, _matDummy);
      }
      co2Instanced.instanceMatrix.needsUpdate = true;

      // 8. O₂ Oxygen Bubbles streaming out from chloroplasts / stoma (speed & visibility proportional to live rate!)
      o2Phase = (o2Phase + delta * (0.12 + rate * 1.35)) % 1;
      for (let i = 0; i < O2_COUNT; i++) {
        const u = (i / O2_COUNT + o2Phase) % 1;
        const activeBubble = i < Math.ceil(rate * O2_COUNT);
        const startX = ((i * 1.91) % 4.6) - 2.3;
        const startZ = ((i * 1.13) % 1.8) - 0.9;
        const y = THREE.MathUtils.lerp(0.7, 3.4, u);
        _vPos.set(startX + Math.sin(elapsed * 2.5 + i) * 0.14, y, startZ);
        _quatDummy.identity();
        const sc = activeBubble && rate > 0.03 ? (0.55 + rate * 0.65) * Math.sin(u * Math.PI) : 0.0001;
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

  // ==================== LESSON & INTERACTION HANDLERS ====================
  const handleToggleWatchLesson = () => {
    if (watchLessonActive) {
      setWatchLessonActive(false);
      setLessonPaused(false);
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
    setInteractionHint('You now have live control — adjust Sunlight, CO₂, Temp or click the 3D Stoma!');
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
    setInteractionHint('Reset to optimal photosynthetic conditions (85% Light, 80% CO₂, 30°C).');
  };

  // Precomputed Limiting-Factors Rate vs Light Curve for current CO₂, Temp & Stomata
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

  // Reference ceiling curve (High CO₂ 95% at 30°C) for comparison
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
      {/* TOP BAR (Matches Mitosis 3D, Ohm's Law 3D & Titration 3D) */}
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
              setLessonPaused(false);
              setStomataOpen((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
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

      {/* MAIN CONTENT: 3D Leaf Cross-Section (8 cols) & Live Limiting Factors Panel (4 cols) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D LEAF CUTAWAY VIEWPORT */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[450px] sm:h-[540px] lg:h-[600px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Compact Particle Legend in Top-Left of 3D Stage */}
          <div
            className={`pointer-events-none absolute left-3.5 top-3.5 px-3 py-2 rounded-xl border text-[11px] font-bold space-y-1 ${
              darkMode
                ? 'bg-[#10141f]/90 border-white/[0.1] text-slate-200'
                : 'bg-white/92 border-slate-300 text-slate-800 shadow-xs'
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
                Click the 3D guard cells, chloroplasts, xylem or phloem • Drag to orbit 360°
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
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Phloem sucrose export: <strong className="text-amber-500">{metrics.glucoseMgHr.toFixed(1)} mg/hr</strong>
              </p>

              {/* Active Limiting Factor Indicator */}
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
                <div className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Light
                </div>
                <div className="text-sm font-black text-amber-500">{lightPct}%</div>
              </div>
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  CO₂
                </div>
                <div className="text-sm font-black text-violet-500">{co2Pct}%</div>
              </div>
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
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

                {/* Dashed optimal reference curve (95% CO₂, 30°C) */}
                <polyline
                  points={ceilingCurvePoints}
                  fill="none"
                  stroke={darkMode ? '#475569' : '#cbd5e1'}
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />

                {/* Current CO₂ & Temp curve */}
                <polyline
                  points={rateCurvePoints}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />

                {/* Plotted student points */}
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

                {/* Live operating dot */}
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
          /* 1:05 VIDEO-STYLE LESSON SCRUBBER */
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
