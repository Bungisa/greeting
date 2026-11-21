import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Timer,
  Trash2,
} from 'lucide-react';

export interface Pendulum3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';
type GravityPresetId = 'earth' | 'moon' | 'mars';

interface GravityPreset {
  id: GravityPresetId;
  label: string;
  g: number;
  accent: string;
}

const GRAVITY_PRESETS: Record<GravityPresetId, GravityPreset> = {
  earth: { id: 'earth', label: 'Earth (9.81)', g: 9.81, accent: '#38bdf8' },
  moon: { id: 'moon', label: 'Moon (1.62)', g: 1.62, accent: '#a78bfa' },
  mars: { id: 'mars', label: 'Mars (3.72)', g: 3.72, accent: '#fb923c' },
};

interface LessonChapter {
  index: number;
  title: string;
  startSec: number;
  endSec: number;
  oCaption: string;
  aCaption: string;
}

const LESSON_DURATION_SEC = 65;

const LESSON_CHAPTERS: LessonChapter[] = [
  {
    index: 0,
    title: 'Setup & small angle release',
    startSec: 0,
    endSec: 17,
    oCaption:
      'A dense brass bob hangs from a fixed clamp by length L. Pull the bob back by a small angle (≤ 15°) and release it smoothly.',
    aCaption:
      'For small angular displacements (θ ≤ 15°, sin θ ≈ θ), the restoring torque τ = −mgL sin θ yields Simple Harmonic Motion with period T = 2π√(L/g).',
  },
  {
    index: 1,
    title: 'Energy exchange in motion',
    startSec: 17,
    endSec: 34,
    oCaption:
      'At the highest points, all energy is Gravitational Potential Energy (PE). At the lowest center point, it converts into maximum Kinetic Energy (KE)!',
    aCaption:
      'Total mechanical energy E = mgh + ½mv² stays conserved (ignoring air drag): KE peaks at equilibrium (θ = 0) while PE peaks at turning points.',
  },
  {
    index: 2,
    title: 'Effect of string length L',
    startSec: 34,
    endSec: 50,
    oCaption:
      'Watch what happens as we lengthen the string from 0.40 m to 1.20 m — a longer pendulum takes longer to complete each full swing!',
    aCaption:
      'Because T ∝ √L, quadrupling string length doubles the period T. Plotting T² against L produces a straight line through the origin with slope 4π²/g.',
  },
  {
    index: 3,
    title: 'Effect of gravity g (Moon vs Earth)',
    startSec: 50,
    endSec: 65,
    oCaption:
      'On the Moon (g = 1.62 m/s²), weaker gravity pulls the bob back gently so the pendulum swings much more slowly than on Earth!',
    aCaption:
      'Since T = 2π√(L/g), reducing gravitational field strength g from 9.81 to 1.62 m s⁻² increases period by √(9.81/1.62) ≈ 2.46×.',
  },
];

interface PendulumTrial {
  id: number;
  lengthM: number;
  periodS: number;
  tSquared: number;
  gId: GravityPresetId;
}

interface PendulumChallenge {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  check: (lengthM: number, gId: GravityPresetId, trials: PendulumTrial[], periodS: number) => boolean;
}

const PENDULUM_CHALLENGES: PendulumChallenge[] = [
  {
    id: 'ch_seconds_pendulum',
    title: 'Build a 2.00 s Seconds Pendulum',
    prompt: 'On Earth (9.81 m/s²), tune string length L so the period T is within 1.98–2.02 s!',
    hint: 'Since T = 2π√(L/9.81) = 2.00 s, try setting L close to 1.00 m.',
    check: (_l, gId, _trials, periodS) => gId === 'earth' && Math.abs(periodS - 2.0) <= 0.025,
  },
  {
    id: 'ch_necta_slope',
    title: 'Plot 3 Lengths to Deduce g',
    prompt: 'Record at least 3 different string lengths on Earth using "+ Log T² Point" to compute g from the slope!',
    hint: 'Adjust L to three distinct values (e.g. 0.40 m, 0.80 m, 1.20 m) and click "+ Log T² Point" for each.',
    check: (_l, _g, trials) => {
      const earthTrials = trials.filter((t) => t.gId === 'earth');
      const uniqueLengths = new Set(earthTrials.map((t) => t.lengthM.toFixed(2)));
      return uniqueLengths.size >= 3;
    },
  },
  {
    id: 'ch_lunar_swing',
    title: 'Test Lunar Gravity',
    prompt: 'Switch to Moon gravity (1.62 m/s²) and make the pendulum period exceed 5.00 s!',
    hint: 'Select Moon gravity and increase string length L above 1.05 m.',
    check: (_l, gId, _trials, periodS) => gId === 'moon' && periodS >= 5.0,
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

const _vProj = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

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
  const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 120);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.14)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Pendulum3DSimulation: React.FC<Pendulum3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 3',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Physical Pendulum Controls
  const [lengthM, setLengthM] = useState<number>(0.8); // 0.30 m – 1.50 m
  const [releaseDeg, setReleaseDeg] = useState<number>(15); // 5° – 45°
  const [gravityId, setGravityId] = useState<GravityPresetId>('earth');
  const [isSwinging, setIsSwinging] = useState<boolean>(true);

  // Stopwatch & Oscillation Counter
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);
  const [stopwatchSec, setStopwatchSec] = useState<number>(0);
  const [oscillationCount, setOscillationCount] = useState<number>(0);

  // Live Energy Readout (0–100%)
  const [kePct, setKePct] = useState<number>(50);
  const [pePct, setPePct] = useState<number>(50);

  // Logged T² vs L Practical Trials
  const [trials, setTrials] = useState<PendulumTrial[]>([
    { id: 1, lengthM: 0.4, periodS: 1.27, tSquared: 1.61, gId: 'earth' },
    { id: 2, lengthM: 0.8, periodS: 1.8, tSquared: 3.24, gId: 'earth' },
  ]);

  // Guided 1:05 Lesson & UI State
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

  const gValue = GRAVITY_PRESETS[gravityId].g;
  // Exact small-angle + 1st-order large-angle correction for authentic period T
  const theoreticalPeriod = useMemo(() => {
    const theta0 = (releaseDeg * Math.PI) / 180;
    const largeAngleCorr = 1 + (theta0 * theta0) / 16;
    return Number((2 * Math.PI * Math.sqrt(lengthM / gValue) * largeAngleCorr).toFixed(2));
  }, [lengthM, gValue, releaseDeg]);

  // Deduce g from logged T² vs L slope (g = 4π² / slope)
  const deducedG = useMemo(() => {
    const matching = trials.filter((t) => t.gId === gravityId);
    if (matching.length === 0) return null;
    const sumL = matching.reduce((a, b) => a + b.lengthM, 0);
    const sumT2 = matching.reduce((a, b) => a + b.tSquared, 0);
    if (sumL <= 0.01) return null;
    const slope = sumT2 / sumL;
    return Number(((4 * Math.PI * Math.PI) / slope).toFixed(2));
  }, [trials, gravityId]);

  const activeChapter = useMemo(() => {
    for (let i = LESSON_CHAPTERS.length - 1; i >= 0; i--) {
      if (lessonTimeSec >= LESSON_CHAPTERS[i].startSec) return LESSON_CHAPTERS[i];
    }
    return LESSON_CHAPTERS[0];
  }, [lessonTimeSec]);

  const activeChallenge = challengeIdx !== null ? PENDULUM_CHALLENGES[challengeIdx] : null;
  const challengeSolved = useMemo(() => {
    if (!activeChallenge) return false;
    return activeChallenge.check(lengthM, gravityId, trials, theoreticalPeriod);
  }, [activeChallenge, lengthM, gravityId, trials, theoreticalPeriod]);

  // Mutable refs for 60fps Three.js loop
  const lengthRef = useRef<number>(lengthM);
  const releaseDegRef = useRef<number>(releaseDeg);
  const gravityRef = useRef<GravityPresetId>(gravityId);
  const isSwingingRef = useRef<boolean>(isSwinging);
  const stopwatchRunningRef = useRef<boolean>(stopwatchRunning);
  const stopwatchSecRef = useRef<number>(stopwatchSec);
  const oscCountRef = useRef<number>(oscillationCount);
  const resetKickRef = useRef<boolean>(false);
  const darkModeRef = useRef<boolean>(darkMode);
  const showLabelsRef = useRef<boolean>(showLabels);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonPausedRef = useRef<boolean>(lessonPaused);
  const lessonTimeRef = useRef<number>(lessonTimeSec);
  const lessonSpeedRef = useRef<number>(lessonSpeed);
  const lastUiSyncRef = useRef<number>(0);
  const lastLabelPushRef = useRef<number>(0);

  useEffect(() => {
    lengthRef.current = lengthM;
  }, [lengthM]);
  useEffect(() => {
    releaseDegRef.current = releaseDeg;
  }, [releaseDeg]);
  useEffect(() => {
    gravityRef.current = gravityId;
  }, [gravityId]);
  useEffect(() => {
    isSwingingRef.current = isSwinging;
  }, [isSwinging]);
  useEffect(() => {
    stopwatchRunningRef.current = stopwatchRunning;
  }, [stopwatchRunning]);
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

  // ==================== THREE.JS 3D PENDULUM LAB BENCH ====================
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

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 80);
    camera.position.set(0.9, 3.0, 8.8);

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

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    keyLight.position.set(6, 10, 7);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 5.0;
    controls.maxDistance = 14.0;
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.target.set(0, 2.15, 0);

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

    const standMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.52, metalness: 0.42 }));
    const chromeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.18, metalness: 0.9 }));
    const brassMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.88 }));
    const stringMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65, metalness: 0.05 }));
    const protractorMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.35,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide,
      })
    );

    // Contact shadow & bench floor disc
    const shadowTex = trackTex(createContactShadowTexture());
    const contactShadow = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(5.6, 3.6)),
      trackMat(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.58 }))
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(-0.5, 0.008, 0);
    root.add(contactShadow);

    // Heavy cast-iron Retort Stand Base (offset left so bob swings freely!)
    const standBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.1, 0.16, 1.85)), standMat);
    standBase.position.set(-1.35, 0.08, 0);
    standBase.castShadow = !isSoftwareGl;
    standBase.receiveShadow = !isSoftwareGl;
    root.add(standBase);

    // Tall Stainless Steel Vertical Rod
    const rodMesh = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 4.75, 20)), chromeMat);
    rodMesh.position.set(-1.75, 2.48, 0);
    rodMesh.castShadow = !isSoftwareGl;
    root.add(rodMesh);

    // Bosshead & Horizontal Support Clamp extending to Pivot (0, 4.55, 0)
    const bosshead = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 0.28, 0.28)), standMat);
    bosshead.position.set(-1.75, 4.55, 0);
    const armMesh = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 1.85, 16)), chromeMat);
    armMesh.rotation.z = Math.PI / 2;
    armMesh.position.set(-0.85, 4.55, 0);
    const pivotJaw = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.16, 0.24)), standMat);
    pivotJaw.position.set(0.0, 4.55, 0);
    root.add(bosshead, armMesh, pivotJaw);

    // Subtle translucent Protractor Semicircle behind pivot for reading angle θ
    const protractorDisc = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(0.32, 0.92, 36, 1, Math.PI, Math.PI)),
      protractorMat
    );
    protractorDisc.position.set(0, 4.5, -0.08);
    root.add(protractorDisc);

    // Vertical Equilibrium Plumb Reference Line
    const eqLineGeo = trackGeo(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 4.5, -0.06),
      new THREE.Vector3(0, 0.45, -0.06),
    ]));
    const eqLine = new THREE.Line(
      eqLineGeo,
      trackMat(new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 }))
    );
    root.add(eqLine);

    // ==================== SWINGING PENDULUM PIVOT GROUP ====================
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(0, 4.5, 0);
    root.add(pivotGroup);

    // Unit-length string cylinder scaled dynamically with L (0.30 m -> 1.50 m mapped to 1.0 -> 3.6 world units)
    const stringMesh = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 1.0, 12)), stringMat);
    stringMesh.position.y = -0.5;
    pivotGroup.add(stringMesh);

    // Polished 3D Brass Bob + suspension hook
    const bobGroup = new THREE.Group();
    const bobSphere = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.24, 32, 24)), brassMat);
    bobSphere.castShadow = !isSoftwareGl;
    const bobHook = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.055, 0.015, 10, 20)), brassMat);
    bobHook.position.y = 0.25;
    bobGroup.add(bobSphere, bobHook);
    pivotGroup.add(bobGroup);

    // Glowing Swing Arc Trail behind the brass bob
    const TRAIL_SEGMENTS = 48;
    const trailPositions = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
    const trailGeo = trackGeo(new THREE.BufferGeometry());
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = trackMat(new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 }));
    const arcTrailLine = new THREE.Line(trailGeo, trailMat);
    root.add(arcTrailLine);

    // Label Anchors (dynamic bob anchor updated each frame!)
    const bobWorldAnchor = new THREE.Vector3(0, 2.2, 0);
    const labelSpecs: LabelSpec[] = [
      { id: 'clamp', text: 'Split cork pivot', worldPos: new THREE.Vector3(0, 4.55, 0), offsetX: 82, offsetY: -22 },
      { id: 'rod', text: 'Retort stand', worldPos: new THREE.Vector3(-1.75, 2.4, 0), offsetX: -72, offsetY: -12 },
      { id: 'bob', text: 'Brass bob (m)', worldPos: bobWorldAnchor, offsetX: 84, offsetY: 16 },
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
        const lx = Math.max(80, Math.min(w - 80, ax + spec.offsetX));
        const ly = Math.max(26, Math.min(h - 26, ay + spec.offsetY));
        out.push({ id: spec.id, text: spec.text, ax, ay, lx, ly });
      }
      return out;
    }

    // Direct 3D Clicking on the Brass Bob -> Pull & Release fresh swing!
    let pointerDown = { x: 0, y: 0 };
    let lastHover = 0;

    const hitBob = (cx: number, cy: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((cy - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_pointerNdc, camera);
      return _raycaster.intersectObject(bobGroup, true).length > 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDown = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHover < 50) return;
      lastHover = now;
      renderer.domElement.style.cursor = hitBob(e.clientX, e.clientY) ? 'pointer' : 'grab';
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) > 6) return;
      if (hitBob(e.clientX, e.clientY)) {
        setWatchLessonActive(false);
        setLessonPaused(false);
        setIsSwinging(true);
        resetKickRef.current = true;
        setInteractionHint('Released brass bob cleanly from release angle!');
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

    // Real nonlinear pendulum ODE state (theta, omega)
    let theta = (releaseDegRef.current * Math.PI) / 180;
    let omega = 0;
    let dampedLength = lengthRef.current;

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
      const delta = Math.min(clock.getDelta(), 0.05);

      const isDark = darkModeRef.current;
      scene.background = isDark ? bgDark : bgLight;

      // 1:05 Guided Lesson Choreography
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
          lengthRef.current = 0.8;
          releaseDegRef.current = 15;
          gravityRef.current = 'earth';
          isSwingingRef.current = true;
        } else if (t < 34) {
          lengthRef.current = 0.8;
          releaseDegRef.current = 24;
          gravityRef.current = 'earth';
          isSwingingRef.current = true;
        } else if (t < 50) {
          const frac = Math.min(1, (t - 34) / 13);
          lengthRef.current = Number((0.4 + frac * 0.85).toFixed(2));
          releaseDegRef.current = 16;
          gravityRef.current = 'earth';
          isSwingingRef.current = true;
        } else {
          lengthRef.current = 1.0;
          releaseDegRef.current = 18;
          gravityRef.current = 'moon';
          isSwingingRef.current = true;
        }
      }

      if (resetKickRef.current) {
        theta = (releaseDegRef.current * Math.PI) / 180;
        omega = 0;
        resetKickRef.current = false;
      }

      dampedLength = THREE.MathUtils.damp(dampedLength, lengthRef.current, 6, delta);
      const curG = GRAVITY_PRESETS[gravityRef.current].g;

      // Integrate pendulum physics with symplectic Euler substeps for rock-solid energy conservation
      if (isSwingingRef.current) {
        const substeps = 6;
        const dt = delta / substeps;
        const prevTheta = theta;
        for (let s = 0; s < substeps; s++) {
          const alpha = -(curG / Math.max(0.2, dampedLength)) * Math.sin(theta);
          omega += alpha * dt;
          theta += omega * dt;
        }

        // Count full oscillations when crossing equilibrium moving right (theta: - -> +)
        if (stopwatchRunningRef.current) {
          stopwatchSecRef.current += delta;
          if (prevTheta < 0 && theta >= 0) {
            oscCountRef.current += 1;
          }
        }
      }

      // Map physical length (0.30 – 1.50 m) cleanly into 3D visual string length (1.15 – 3.75 units)
      const visualLen = THREE.MathUtils.mapLinear(dampedLength, 0.3, 1.5, 1.15, 3.75);
      stringMesh.scale.y = visualLen;
      stringMesh.position.y = -visualLen * 0.5;
      bobGroup.position.y = -visualLen;
      pivotGroup.rotation.z = theta;

      // Update world anchor for bob callout label
      bobWorldAnchor.set(Math.sin(theta) * visualLen, 4.5 - Math.cos(theta) * visualLen, 0);

      // Update swing arc trail curve for current release angle & length
      const maxAng = Math.max(Math.abs(theta), (releaseDegRef.current * Math.PI) / 180);
      const posAttr = trailGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
        const u = i / TRAIL_SEGMENTS;
        const a = THREE.MathUtils.lerp(-maxAng, maxAng, u);
        posAttr.setXYZ(i, Math.sin(a) * visualLen, 4.5 - Math.cos(a) * visualLen, -0.02);
      }
      posAttr.needsUpdate = true;
      trailMat.color.set(GRAVITY_PRESETS[gravityRef.current].accent);

      // Compute exact PE vs KE percentages
      const maxH = Math.max(1e-4, 1 - Math.cos(maxAng));
      const curH = Math.max(0, 1 - Math.cos(theta));
      const peRatio = Math.min(1, curH / maxH);
      const keRatio = Math.max(0, 1 - peRatio);

      const nowTs = performance.now();
      if (nowTs - lastUiSyncRef.current > 85) {
        lastUiSyncRef.current = nowTs;
        setPePct(Math.round(peRatio * 100));
        setKePct(Math.round(keRatio * 100));
        if (stopwatchRunningRef.current) {
          setStopwatchSec(Number(stopwatchSecRef.current.toFixed(2)));
          setOscillationCount(oscCountRef.current);
        }
        if (watchLessonRef.current) {
          setLessonTimeSec(Number(lessonTimeRef.current.toFixed(2)));
          setLengthM(lengthRef.current);
          setReleaseDeg(releaseDegRef.current);
          setGravityId(gravityRef.current);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (nowTs - lastLabelPushRef.current > 36) {
        lastLabelPushRef.current = nowTs;
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

  const handleToggleStopwatch = () => {
    if (stopwatchRunning) {
      setStopwatchRunning(false);
    } else {
      stopwatchSecRef.current = 0;
      oscCountRef.current = 0;
      setStopwatchSec(0);
      setOscillationCount(0);
      setIsSwinging(true);
      setStopwatchRunning(true);
    }
  };

  const handleLogTrial = () => {
    const tVal =
      oscillationCount >= 3 && stopwatchSec > 1
        ? Number((stopwatchSec / oscillationCount).toFixed(2))
        : theoreticalPeriod;
    const t2 = Number((tVal * tVal).toFixed(2));
    setTrials((prev) => [
      ...prev.slice(-5),
      { id: Date.now(), lengthM, periodS: tVal, tSquared: t2, gId: gravityId },
    ]);
    setInteractionHint(`Logged L = ${lengthM.toFixed(2)} m → T = ${tVal.toFixed(2)} s (T² = ${t2.toFixed(2)} s²)`);
  };

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
    resetKickRef.current = true;
    setWatchLessonActive(true);
  };

  const handleTakeOverFromHere = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setInteractionHint('You now have live control — adjust string length L, gravity, or click the brass bob!');
  };

  const handleJumpLessonTime = (sec: number) => {
    const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, sec));
    lessonTimeRef.current = clamped;
    setLessonTimeSec(clamped);
  };

  const surfaceBg = darkMode ? 'bg-[#161922] text-slate-100' : 'bg-[#f1f5fb] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#1d2230] border-white/[0.1] text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const dockBg = darkMode
    ? 'bg-[#131722]/95 border-white/[0.12] text-slate-100'
    : 'bg-white/95 border-slate-300/90 text-slate-900 shadow-lg';

  // Ideal T² vs L line for active gravity (y = (4π²/g) L, clamped to graph max T² = 12 s²)
  const slopeIdeal = (4 * Math.PI * Math.PI) / gValue;
  const maxPlotL = Math.min(1.5, 12 / slopeIdeal);
  const maxPlotT2 = maxPlotL * slopeIdeal;

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
          darkMode ? 'bg-[#12151e] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleWatchLesson}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              watchLessonActive
                ? 'bg-sky-500 text-slate-950'
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
                  ? 'bg-sky-500/15 border-sky-400/60 text-sky-200'
                  : 'bg-sky-50 border-sky-500/60 text-sky-800'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Labels {showLabels ? 'On' : 'Off'}</span>
          </button>

          {/* Gravity Selector Pills */}
          <div
            className={`inline-flex p-0.5 rounded-full border text-xs ${
              darkMode ? 'bg-[#1a1f2d] border-white/[0.1]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {(Object.values(GRAVITY_PRESETS) as GravityPreset[]).map((gp) => (
              <button
                key={gp.id}
                type="button"
                onClick={() => {
                  setWatchLessonActive(false);
                  setGravityId(gp.id);
                }}
                className={`px-2.5 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                  gravityId === gp.id
                    ? darkMode
                      ? 'bg-white text-slate-950'
                      : 'bg-slate-900 text-white'
                    : darkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {gp.label}
              </button>
            ))}
          </div>

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

      {/* MAIN CONTENT */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D PENDULUM STAGE (8 cols) */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[450px] sm:h-[540px] lg:h-[600px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating Live PE vs KE Conservation Bars */}
          <div
            className={`pointer-events-none absolute left-3.5 top-3.5 w-40 px-3 py-2.5 rounded-xl border text-[11px] font-bold space-y-2 ${
              darkMode
                ? 'bg-[#10141f]/90 border-white/[0.1] text-slate-200'
                : 'bg-white/92 border-slate-300 text-slate-800 shadow-xs'
            }`}
          >
            <div className="space-y-1">
              <div className="flex justify-between tabular-nums">
                <span className="text-sky-500">Kinetic (KE)</span>
                <span>{kePct}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div className="h-full bg-sky-500 transition-all duration-75" style={{ width: `${kePct}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between tabular-nums">
                <span className="text-amber-500">Potential (PE)</span>
                <span>{pePct}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div className="h-full bg-amber-500 transition-all duration-75" style={{ width: `${pePct}%` }} />
              </div>
            </div>
          </div>

          {/* 3D Labels */}
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

          {interactionHint && !watchLessonActive && (
            <div className="pointer-events-none absolute top-3.5 inset-x-4 flex justify-center">
              <div
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-sm ${
                  darkMode
                    ? 'bg-[#121622] border-sky-400/45 text-sky-200'
                    : 'bg-white border-sky-400/60 text-sky-900'
                }`}
              >
                {interactionHint}
              </div>
            </div>
          )}

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
                Click the 3D brass bob to re-release • Time oscillations with the Stopwatch • Plot T² vs L
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SCIENTIFIC READOUT, STOPWATCH & T² vs L GRAPH PANEL (4 cols) */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-4 sm:p-5 flex flex-col justify-between gap-3.5 lg:max-h-[600px] overflow-y-auto ${
            darkMode ? 'bg-[#131722] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3.5">
            <div>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
                  {theoreticalPeriod.toFixed(2)}
                </span>
                <span className={`text-base font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  s / swing
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                L = <strong>{lengthM.toFixed(2)} m</strong> · g = <strong>{gValue.toFixed(2)} m/s²</strong> · T² ={' '}
                <strong>{(theoreticalPeriod * theoreticalPeriod).toFixed(2)} s²</strong>
              </p>
            </div>

            {/* Interactive Digital Lab Stopwatch */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 tabular-nums ${cardBg}`}>
              <div>
                <div className="text-[10px] font-bold uppercase text-sky-500 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  <span>Lab Stopwatch ({oscillationCount} swings)</span>
                </div>
                <div className="text-xl font-mono font-black mt-0.5">{stopwatchSec.toFixed(2)} s</div>
              </div>
              <button
                type="button"
                onClick={handleToggleStopwatch}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-colors ${
                  stopwatchRunning
                    ? 'bg-rose-500 text-white hover:bg-rose-400'
                    : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                }`}
              >
                {stopwatchRunning ? 'Stop' : 'Start'}
              </button>
            </div>

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
                        prev === null ? 0 : (prev + 1) % PENDULUM_CHALLENGES.length
                      )
                    }
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    Next Lab Challenge →
                  </button>
                )}
              </div>
            )}

            {/* LIVE T² vs L GRAPH & GRAVITY DEDUCTION */}
            <div className={`p-3 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                  T² vs L Graph ({trials.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleLogTrial}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                      darkMode
                        ? 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
                        : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Log T² Point</span>
                  </button>
                  {trials.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTrials([])}
                      title="Clear trials"
                      className={`p-1 rounded cursor-pointer ${
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
                  <line key={y} x1="32" y1={y} x2="226" y2={y} stroke={darkMode ? '#262d3f' : '#e2e8f0'} strokeWidth="1" />
                ))}
                <line x1="32" y1="10" x2="32" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />
                <line x1="32" y1="96" x2="228" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />
                <line
                  x1="32"
                  y1="96"
                  x2={32 + (maxPlotL / 1.5) * 190}
                  y2={96 - (maxPlotT2 / 12) * 82}
                  stroke={GRAVITY_PRESETS[gravityId].accent}
                  strokeWidth="2.2"
                />
                {trials.map((pt) => (
                  <circle
                    key={pt.id}
                    cx={32 + (Math.min(1.5, pt.lengthM) / 1.5) * 190}
                    cy={96 - (Math.min(12, pt.tSquared) / 12) * 82}
                    r="3.5"
                    fill="#10b981"
                    stroke={darkMode ? '#0f172a' : '#ffffff'}
                    strokeWidth="1.2"
                  />
                ))}
                <circle
                  cx={32 + (lengthM / 1.5) * 190}
                  cy={96 - (Math.min(12, theoreticalPeriod * theoreticalPeriod) / 12) * 82}
                  r="5"
                  fill="#f59e0b"
                  stroke={darkMode ? '#ffffff' : '#0f172a'}
                  strokeWidth="1.8"
                />
                <text x="6" y="18" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">T²</text>
                <text x="192" y="108" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="8.5" fontWeight="700">L (m)</text>
              </svg>
              {deducedG !== null && (
                <div className="text-[11px] font-mono font-bold text-emerald-500 flex justify-between">
                  <span>Deduced g = 4π² / slope:</span>
                  <span>{deducedG.toFixed(2)} m/s²</span>
                </div>
              )}
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode
                ? 'bg-sky-500/10 border-sky-400/25 text-sky-100'
                : 'bg-sky-50 border-sky-200 text-sky-950'
            }`}
          >
            <div className="font-bold">T = 2π √(L / g) → T² = (4π² / g) · L</div>
            <div className="text-[11px] mt-0.5 opacity-90">
              {level === 'o_level'
                ? 'Period depends only on string length L and gravity g — independent of bob mass!'
                : 'SHM angular frequency ω = √(g/L). Gradient of T² vs L equals 4π²/g.'}
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM DOCK */}
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
              className={`p-2 rounded-xl cursor-pointer shrink-0 ${
                darkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {lessonPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>
            <span className="text-xs font-mono font-bold tabular-nums shrink-0 min-w-[74px]">
              {formatClock(lessonTimeSec)} / {formatClock(LESSON_DURATION_SEC)}
            </span>
            <div className="flex-1 min-w-[200px] grid grid-cols-4 gap-1.5 items-center">
              {LESSON_CHAPTERS.map((ch) => {
                const fill = Math.max(0, Math.min(1, (lessonTimeSec - ch.startSec) / (ch.endSec - ch.startSec)));
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
                    <div className="h-full bg-sky-500 transition-all duration-100" style={{ width: `${Math.round(fill * 100)}%` }} />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setLessonSpeed((s) => (s === 1 ? 0.75 : s === 0.75 ? 1.5 : 1))}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer shrink-0 ${
                darkMode ? 'bg-[#1a2030] border-white/[0.12] text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {lessonSpeed}×
            </button>
            <button
              type="button"
              onClick={handleTakeOverFromHere}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer shrink-0 ${
                darkMode ? 'bg-[#1c2231] border-white/[0.16] text-white hover:bg-[#273046]' : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'
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
                  <div className="flex justify-between font-bold tabular-nums">
                    <span>String Length (L)</span>
                    <span className="text-sky-500">{lengthM.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={1.5}
                    step={0.05}
                    value={lengthM}
                    onChange={(e) => setLengthM(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </label>

                <label className="space-y-1">
                  <div className="flex justify-between font-bold tabular-nums">
                    <span>Release Angle (θ)</span>
                    <span className="text-amber-500">{releaseDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={45}
                    step={1}
                    value={releaseDeg}
                    onChange={(e) => {
                      setReleaseDeg(Number(e.target.value));
                      resetKickRef.current = true;
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </label>

                <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSwinging((p) => !p)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                      darkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSwinging ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isSwinging ? 'Pause Swing' : 'Resume Swing'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetKickRef.current = true;
                      setIsSwinging(true);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      darkMode ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#252d40]' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-release</span>
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

export default Pendulum3DSimulation;
