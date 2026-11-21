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
  Lightbulb,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';

export interface OhmsLaw3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';

interface OhmsStageInfo {
  id: string;
  t: number;
  oLabel: string;
  aLabel: string;
  oTitle: string;
  aTitle: string;
  subtitle: string;
  oDescription: string;
  aDescription: string;
  lessonCaption: string;
  switchClosed: boolean;
  voltage: number;
  resistance: number;
}

const OHMS_STAGES: OhmsStageInfo[] = [
  {
    id: 'open_circuit',
    t: 0.0,
    oLabel: 'Open switch',
    aLabel: 'Open Circuit',
    oTitle: 'Circuit ready (switch open)',
    aTitle: 'Open Circuit — Zero Current Flow',
    subtitle: "Ohm's Law · open switch",
    oDescription:
      'The power supply, ammeter, lamp, resistor and voltmeter are wired up, but the switch is open so no current flows and the lamp stays completely dark.',
    aDescription:
      'With the single-pole knife switch open, circuit resistance is effectively infinite. No net drift velocity occurs (I = 0 A), the lamp emits no light, and the potential drop across the load is zero.',
    lessonCaption:
      'Step 1: The circuit is connected with an ammeter and lamp in series, and a voltmeter in parallel. Because the switch is open, current is 0 A and the lamp is OFF.',
    switchClosed: false,
    voltage: 12,
    resistance: 4,
  },
  {
    id: 'close_switch',
    t: 0.14,
    oLabel: 'Close switch',
    aLabel: 'Closed Loop',
    oTitle: 'Switch closes — lamp lights up',
    aTitle: 'Closed Circuit — Establishing Electric Current',
    subtitle: "Ohm's Law · closed loop",
    oDescription:
      'Closing the switch completes the loop! The 12 V supply pushes 3.00 A through the 4 Ω resistor and lights up the filament lamp brightly.',
    aDescription:
      'Closing the switch establishes an electric field throughout the conductor. Charges drift at I = V / R = 12 / 4 = 3.00 A, energizing the tungsten lamp filament.',
    lessonCaption:
      'Step 2: Closing the knife switch completes the loop! A 12 V push through 4 Ω produces 3.00 A — watch the lamp light up brightly and the meters jump.',
    switchClosed: true,
    voltage: 12,
    resistance: 4,
  },
  {
    id: 'low_voltage',
    t: 0.29,
    oLabel: '4 V push',
    aLabel: 'Low V (4 V)',
    oTitle: 'Lower voltage → dim lamp',
    aTitle: 'Direct Proportionality — V = 4.0 V',
    subtitle: "Ohm's Law · varying voltage",
    oDescription:
      'Turning the power supply down to 4 V gives a gentle push. Current drops to 1.00 A and the filament lamp glows only a dim warm amber.',
    aDescription:
      'Maintaining constant ohmic resistance (R = 4.0 Ω), lowering potential difference to V = 4.0 V reduces current to I = 1.00 A (P = 4.0 W), producing only faint filament incandescence.',
    lessonCaption:
      'Step 3: At 4 V across 4 Ω, current drops to 1.00 A. Notice how slowly the charges move and how dimly the filament lamp glows.',
    switchClosed: true,
    voltage: 4,
    resistance: 4,
  },
  {
    id: 'double_voltage',
    t: 0.43,
    oLabel: '8 V push',
    aLabel: '2× Voltage (8 V)',
    oTitle: 'Double voltage → brighter lamp',
    aTitle: 'Linear Scaling — V = 8.0 V',
    subtitle: "Ohm's Law · V ∝ I",
    oDescription:
      'Doubling the voltage from 4 V to 8 V doubles the current to 2.00 A. With four times the electrical power (16 W), the lamp shines noticeably brighter!',
    aDescription:
      'Doubling EMF across the 4.0 Ω circuit doubles drift velocity to I = 2.00 A and quadruples power dissipation (P = V²/R = 16.0 W), visibly raising lamp luminance.',
    lessonCaption:
      'Step 4: Double the voltage to 8 V and current doubles to 2.00 A — the lamp shines noticeably brighter as electrical power rises to 16 W.',
    switchClosed: true,
    voltage: 8,
    resistance: 4,
  },
  {
    id: 'triple_voltage',
    t: 0.57,
    oLabel: '12 V push',
    aLabel: '3× Voltage (12 V)',
    oTitle: 'Triple voltage → triple current',
    aTitle: 'Constant Gradient — V/I = R',
    subtitle: "Ohm's Law · constant ratio",
    oDescription:
      'At 12 V the current reaches 3.00 A and the lamp glows strong golden-yellow. Every reading sits on a straight line on the V–I graph because V ÷ I = 4 Ω.',
    aDescription:
      'Plotting (I, V) points (1.0, 4.0), (2.0, 8.0) and (3.0, 12.0) yields a straight line through the origin with constant gradient R = ΔV / ΔI = 4.0 Ω.',
    lessonCaption:
      'Step 5: At 12 V, current triples to 3.00 A and the lamp glows brightly. On the V–I graph, every point forms a straight line with slope R = 4 Ω.',
    switchClosed: true,
    voltage: 12,
    resistance: 4,
  },
  {
    id: 'raise_resistance',
    t: 0.72,
    oLabel: 'More R',
    aLabel: 'Double R (8 Ω)',
    oTitle: 'Higher resistance → dimmer lamp',
    aTitle: 'Inverse Proportionality — I ∝ 1/R',
    subtitle: "Ohm's Law · opposition to flow",
    oDescription:
      'Doubling the resistor to 8 Ω restricts the current even though the supply stays at 12 V. Current drops in half to 1.50 A and the lamp immediately dims!',
    aDescription:
      'Increasing resistance from 4.0 Ω to 8.0 Ω increases lattice scattering. At fixed V = 12.0 V, current halves to I = 1.50 A (I ∝ 1/R), cutting lamp brightness sharply.',
    lessonCaption:
      'Step 6: Keeping 12 V fixed but doubling resistance to 8 Ω cuts the current in half to 1.50 A — watch the lamp dim right away!',
    switchClosed: true,
    voltage: 12,
    resistance: 8,
  },
  {
    id: 'high_power',
    t: 0.86,
    oLabel: 'Power & heat',
    aLabel: 'Joule Heating',
    oTitle: 'High current → blazing lamp & heat',
    aTitle: 'Electrical Power & Joule Heating (P = I²R)',
    subtitle: "Ohm's Law · energy transfer",
    oDescription:
      'Pushing 18 V across 4 Ω drives 4.50 A (81 W). The lamp shines at intense white-gold brightness while the resistor coil glows warm orange from heat!',
    aDescription:
      'At V = 18.0 V and R = 4.0 Ω, I = 4.50 A dissipates P = VI = I²R = 81.0 W — driving intense incandescence in the lamp and visible Joule heating in the resistor.',
    lessonCaption:
      'Step 7: At 18 V across 4 Ω, a strong 4.50 A current delivers 81 W — the lamp shines intensely bright and the resistor coil glows warm orange!',
    switchClosed: true,
    voltage: 18,
    resistance: 4,
  },
  {
    id: 'sandbox',
    t: 1.0,
    oLabel: 'Explore',
    aLabel: 'Live Sandbox',
    oTitle: "Test Ohm's Law yourself",
    aTitle: "Interactive Ohm's Law Laboratory",
    subtitle: "Ohm's Law · V = I × R",
    oDescription:
      'Drag the Voltage and Resistance sliders below or click the 3D apparatus and circuit diagram! Watch the lamp brightness, meters, and V–I graph respond live.',
    aDescription:
      'Adjust EMF V (2–24 V) and resistance R (2–12 Ω) freely to verify V = IR, P = I²R, and observe real-time lamp luminance, meter deflections, and schematic states.',
    lessonCaption:
      'Step 8: Now explore freely! Adjust Voltage and Resistance below, or click the 3D switch and lamp to test Ohm’s Law yourself.',
    switchClosed: true,
    voltage: 12,
    resistance: 4,
  },
];

const LESSON_MILESTONES = [0.0, 0.14, 0.29, 0.43, 0.57, 0.72, 0.86, 1.0];

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

// Module-scope reusable scratch math helpers (zero per-frame GC allocations)
const _vProj = new THREE.Vector3();
const _vPos = new THREE.Vector3();
const _matDummy = new THREE.Matrix4();
const _quatDummy = new THREE.Quaternion();
const _scaleDummy = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

interface RecordedReading {
  id: number;
  v: number;
  i: number;
  r: number;
}

interface LearnerChallenge {
  id: string;
  prompt: string;
  hint: string;
  check: (v: number, r: number, i: number, closed: boolean) => boolean;
}

const LEARNER_CHALLENGES: LearnerChallenge[] = [
  {
    id: 'ch1',
    prompt: 'Close the switch and adjust V or R so the Ammeter reads exactly 2.00 A.',
    hint: 'Try V = 8 V with R = 4 Ω, or V = 12 V with R = 6 Ω.',
    check: (_v, _r, i, closed) => closed && Math.abs(i - 2.0) < 0.03,
  },
  {
    id: 'ch2',
    prompt: 'Keep Supply Voltage at 12 V and change Resistance so Current drops to 1.50 A.',
    hint: 'Since R = V / I = 12 / 1.5, set R = 8.0 Ω.',
    check: (v, _r, i, closed) => closed && Math.abs(v - 12) < 0.1 && Math.abs(i - 1.5) < 0.03,
  },
  {
    id: 'ch3',
    prompt: 'Make the resistor glow by reaching at least 72 W of electrical power!',
    hint: 'Increase Voltage to 18 V or higher while keeping Resistance low (3–4 Ω).',
    check: (v, _r, i, closed) => closed && v * i >= 72,
  },
];

function getStageForProgress(t: number): OhmsStageInfo {
  let closest = OHMS_STAGES[0];
  let bestDist = Infinity;
  for (const s of OHMS_STAGES) {
    const d = Math.abs(s.t - t);
    if (d < bestDist) {
      bestDist = d;
      closest = s;
    }
  }
  return closest;
}

/**
 * Draws a crisp analog laboratory gauge dial face (Ammeter or Voltmeter)
 */
function createMeterDialTexture(
  unitLetter: 'A' | 'V',
  subtitle: string,
  maxScale: number,
  tickCount: number,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Clean off-white porcelain instrument face
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 384);

  // Subtle top bezel inner border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 364);

  const cx = 256;
  const cy = 310;
  const rOuter = 205;

  // Arc track
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, Math.PI * 1.18, Math.PI * 1.82);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Colored accent arc
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter - 14, Math.PI * 1.18, Math.PI * 1.82);
  ctx.strokeStyle = unitLetter === 'A' ? '#0284c7' : '#7c3aed';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Ticks & Numbers
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= tickCount; i++) {
    const frac = i / tickCount;
    const angle = Math.PI * 1.18 + frac * (Math.PI * 0.64);
    const isMajor = i % 2 === 0;
    const r1 = rOuter - (isMajor ? 22 : 12);
    const r2 = rOuter + 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.strokeStyle = isMajor ? '#0f172a' : '#64748b';
    ctx.lineWidth = isMajor ? 4 : 2;
    ctx.stroke();

    if (isMajor) {
      const val = (frac * maxScale).toFixed(maxScale <= 6 ? 1 : 0);
      const rTxt = rOuter + 32;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(val, cx + Math.cos(angle) * rTxt, cy + Math.sin(angle) * rTxt);
    }
  }

  // Unit symbol & title
  ctx.fillStyle = unitLetter === 'A' ? '#0369a1' : '#6d28d9';
  ctx.font = '900 54px system-ui, -apple-system, sans-serif';
  ctx.fillText(unitLetter, cx, 198);

  ctx.fillStyle = '#475569';
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, cx, 240);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Draws the live red-LED digital screen on the DC Power Supply
 */
function drawPowerSupplyScreen(
  ctx: CanvasRenderingContext2D,
  voltage: number,
  current: number,
  switchClosed: boolean
) {
  ctx.fillStyle = '#090d14';
  ctx.fillRect(0, 0, 512, 224);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 216);

  // Voltage readout (top row)
  ctx.font = '900 68px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ef4444';
  ctx.fillText(`${voltage.toFixed(1)}`, 392, 68);
  ctx.font = '800 32px system-ui, sans-serif';
  ctx.fillStyle = '#fca5a5';
  ctx.textAlign = 'left';
  ctx.fillText('V', 410, 74);

  // Current readout (bottom row)
  ctx.font = '900 64px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = switchClosed ? '#38bdf8' : '#475569';
  ctx.fillText(`${current.toFixed(2)}`, 392, 158);
  ctx.font = '800 32px system-ui, sans-serif';
  ctx.fillStyle = switchClosed ? '#bae6fd' : '#64748b';
  ctx.textAlign = 'left';
  ctx.fillText('A', 410, 162);

  // Status indicator text
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.fillStyle = switchClosed ? '#34d399' : '#f59e0b';
  ctx.textAlign = 'left';
  ctx.fillText(switchClosed ? 'DC ON' : 'STANDBY', 24, 34);
}

/**
 * Soft radial ground contact shadow texture
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 120);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.36)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.14)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Warm radial glow sprite texture for the 3D Filament Lamp light aura
 */
function createLampHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 6, 128, 128, 124);
  grad.addColorStop(0, 'rgba(255, 252, 230, 1)');
  grad.addColorStop(0.24, 'rgba(253, 224, 71, 0.85)');
  grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.34)');
  grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const OhmsLaw3DSimulation: React.FC<OhmsLaw3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 4',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Playback, Timeline & Parameter State
  const [progress, setProgress] = useState<number>(0.14); // Start cleanly with closed loop & active current
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [watchLessonActive, setWatchLessonActive] = useState<boolean>(false);
  const [lessonPaused, setLessonPaused] = useState<boolean>(false);
  const [lessonPaceSec, setLessonPaceSec] = useState<number>(7); // Generous default 7s dwell per step
  const [lessonStepIndex, setLessonStepIndex] = useState<number>(1);
  const [lessonRemainingFrac, setLessonRemainingFrac] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [level, setLevel] = useState<SyllabusLevel>(() =>
    activeClass.includes('5') || activeClass.includes('6') ? 'a_level' : 'o_level'
  );
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);

  // Live electrical parameters (driven either by the active timeline stage OR manually by sliders/3D clicks!)
  const [manualOverride, setManualOverride] = useState<boolean>(false);
  const [voltage, setVoltage] = useState<number>(12);
  const [resistance, setResistance] = useState<number>(4);
  const [switchClosed, setSwitchClosed] = useState<boolean>(true);
  const [recordedPoints, setRecordedPoints] = useState<RecordedReading[]>([
    { id: 1, v: 4, i: 1.0, r: 4 },
    { id: 2, v: 8, i: 2.0, r: 4 },
    { id: 3, v: 12, i: 3.0, r: 4 },
  ]);
  const [challengeIdx, setChallengeIdx] = useState<number | null>(null);
  const [interactionHint, setInteractionHint] = useState<string | null>(null);

  const activeChallenge = challengeIdx !== null ? LEARNER_CHALLENGES[challengeIdx] : null;
  const challengeSolved = useMemo(() => {
    if (!activeChallenge) return false;
    const iVal = switchClosed ? voltage / resistance : 0;
    return activeChallenge.check(voltage, resistance, iVal, switchClosed);
  }, [activeChallenge, voltage, resistance, switchClosed]);

  const currentStage = useMemo(() => getStageForProgress(progress), [progress]);

  // Derived live electrical metrics
  const effectiveCurrent = useMemo(
    () => (switchClosed ? Number((voltage / resistance).toFixed(2)) : 0),
    [switchClosed, voltage, resistance]
  );
  const effectiveVoltageAcrossR = useMemo(
    () => (switchClosed ? voltage : 0),
    [switchClosed, voltage]
  );
  const powerWatts = useMemo(
    () => Number((effectiveVoltageAcrossR * effectiveCurrent).toFixed(1)),
    [effectiveVoltageAcrossR, effectiveCurrent]
  );
  // Perceptual lamp brightness percentage (0–100%) mapped nonlinearly to electrical power/current
  const lampBrightnessPct = useMemo(() => {
    if (!switchClosed || effectiveCurrent <= 0.01) return 0;
    return Math.min(100, Math.round(Math.pow(Math.min(1, powerWatts / 80), 0.58) * 100));
  }, [switchClosed, effectiveCurrent, powerWatts]);

  // Sync stage preset parameters whenever stage changes (unless user dragged a slider in sandbox)
  useEffect(() => {
    if (!manualOverride) {
      setSwitchClosed(currentStage.switchClosed);
      setVoltage(currentStage.voltage);
      setResistance(currentStage.resistance);
    }
  }, [currentStage, manualOverride]);

  // Mutable refs for stable WebGL loop
  const targetVoltageRef = useRef<number>(voltage);
  const targetResistanceRef = useRef<number>(resistance);
  const targetSwitchRef = useRef<number>(switchClosed ? 1 : 0);
  const targetProgressRef = useRef<number>(progress);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonPausedRef = useRef<boolean>(lessonPaused);
  const lessonPaceSecRef = useRef<number>(lessonPaceSec);
  const showLabelsRef = useRef<boolean>(showLabels);
  const darkModeRef = useRef<boolean>(darkMode);
  const lessonHoldTimerRef = useRef<number>(0);
  const lastLabelPushRef = useRef<number>(0);
  const lastTimerPushRef = useRef<number>(0);

  useEffect(() => {
    targetVoltageRef.current = voltage;
    targetResistanceRef.current = resistance;
    targetSwitchRef.current = switchClosed ? 1 : 0;
  }, [voltage, resistance, switchClosed]);

  useEffect(() => {
    targetProgressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    watchLessonRef.current = watchLessonActive;
  }, [watchLessonActive]);

  useEffect(() => {
    lessonPausedRef.current = lessonPaused;
  }, [lessonPaused]);

  useEffect(() => {
    lessonPaceSecRef.current = lessonPaceSec;
  }, [lessonPaceSec]);

  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);

  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

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

  // ==================== THREE.JS 3D OHM'S LAW BENCH ====================
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
    const bgDark = new THREE.Color(0x161922);
    const bgLight = new THREE.Color(0xf1f5fb);
    scene.background = darkModeRef.current ? bgDark.clone() : bgLight.clone();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.4, 5.8, 10.6);

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

    // Procedural Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Balanced 3-point warm/cool lighting rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.1);
    keyLight.position.set(6, 10, 7);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    rimLight.position.set(-7, 4, -6);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 6.2;
    controls.maxDistance = 17.5;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.target.set(0, 0.65, 0.2);

    const benchRoot = new THREE.Group();
    scene.add(benchRoot);

    // Track disposable resources
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

    // ==================== 1. LAB BENCH BASE & CONTACT SHADOW ====================
    const tableMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: darkModeRef.current ? 0x1e2433 : 0xe2e8f0,
        roughness: 0.78,
        metalness: 0.05,
      })
    );
    const tableMesh = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(5.8, 6.0, 0.24, 64)), tableMat);
    tableMesh.position.y = -0.12;
    tableMesh.receiveShadow = !isSoftwareGl;
    benchRoot.add(tableMesh);

    const shadowTex = trackTex(createContactShadowTexture());
    const contactShadowMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.7,
      })
    );
    const addContactShadow = (x: number, z: number, sx: number, sz: number) => {
      const plane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(sx, sz)), contactShadowMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(x, 0.015, z);
      benchRoot.add(plane);
    };

    // Shared PBR Materials (with >= 0.25 roughness contrast between adjacent parts)
    const housingLightMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.42, metalness: 0.12 })
    );
    const housingDarkMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.58, metalness: 0.18 })
    );
    const brassMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xd4a348, roughness: 0.24, metalness: 0.88 })
    );
    const steelMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.22, metalness: 0.85 })
    );
    const redTerminalMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.1 })
    );
    const blackTerminalMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.15 })
    );
    const ceramicMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.72, metalness: 0.02 })
    );

    // ==================== 2. COMPOSITE 3D DC POWER SUPPLY (Back-Left: x=-1.45, z=-1.75) ====================
    const psuGroup = new THREE.Group();
    psuGroup.position.set(-1.45, 0, -1.75);
    benchRoot.add(psuGroup);
    addContactShadow(-1.45, -1.75, 3.1, 2.5);

    const psuBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.1, 1.55, 1.5)), housingLightMat);
    psuBody.position.y = 0.775;
    psuBody.castShadow = !isSoftwareGl;
    psuBody.receiveShadow = !isSoftwareGl;
    psuGroup.add(psuBody);

    // Front dark recessed bezel
    const psuBezel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.9, 1.36, 0.08)), housingDarkMat);
    psuBezel.position.set(0, 0.78, 0.74);
    psuGroup.add(psuBezel);

    // Top carrying handle
    const handleBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.9, 0.08, 0.16)), housingDarkMat);
    handleBar.position.set(0, 1.68, 0);
    const handlePostL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.14, 0.14)), steelMat);
    handlePostL.position.set(-0.38, 1.6, 0);
    const handlePostR = handlePostL.clone();
    handlePostR.position.x = 0.38;
    psuGroup.add(handleBar, handlePostL, handlePostR);

    // Live CanvasTexture LED Screen
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 224;
    const screenCtx = screenCanvas.getContext('2d')!;
    drawPowerSupplyScreen(screenCtx, 12, 3, true);
    const screenTex = trackTex(new THREE.CanvasTexture(screenCanvas));
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = maxAniso;
    const screenMat = trackMat(new THREE.MeshBasicMaterial({ map: screenTex }));
    const screenPlane = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.56, 0.64)), screenMat);
    screenPlane.position.set(0, 1.05, 0.79);
    psuGroup.add(screenPlane);

    // Rotary Voltage Control Knob (physically turns with Voltage!)
    const knobGroup = new THREE.Group();
    knobGroup.position.set(-0.5, 0.44, 0.8);
    const knobCyl = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.17, 0.19, 0.14, 24)), steelMat);
    knobCyl.rotation.x = Math.PI / 2;
    const knobPointer = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.035, 0.12, 0.05)), redTerminalMat);
    knobPointer.position.set(0, 0.08, 0.075);
    knobGroup.add(knobCyl, knobPointer);
    psuGroup.add(knobGroup);

    // + / - Binding Posts on Power Supply front
    const psuPosPost = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16)), redTerminalMat);
    psuPosPost.rotation.x = Math.PI / 2;
    psuPosPost.position.set(0.24, 0.44, 0.84);
    const psuNegPost = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16)), blackTerminalMat);
    psuNegPost.rotation.x = Math.PI / 2;
    psuNegPost.position.set(0.62, 0.44, 0.84);
    psuGroup.add(psuPosPost, psuNegPost);

    // ==================== 3. COMPOSITE 3D KNIFE SWITCH (Back-Right: x=1.75, z=-1.55) ====================
    const switchGroup = new THREE.Group();
    switchGroup.position.set(1.75, 0, -1.55);
    benchRoot.add(switchGroup);
    addContactShadow(1.75, -1.55, 2.0, 1.3);

    const switchBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.45, 0.18, 0.82)), housingDarkMat);
    switchBase.position.y = 0.09;
    switchBase.castShadow = !isSoftwareGl;
    switchGroup.add(switchBase);

    const jawL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.34, 0.18)), brassMat);
    jawL.position.set(-0.46, 0.32, 0);
    const jawR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.34, 0.18)), brassMat);
    jawR.position.set(0.46, 0.32, 0);
    switchGroup.add(jawL, jawR);

    // Hinged copper knife blade pivoted at left jaw
    const knifeBladePivot = new THREE.Group();
    knifeBladePivot.position.set(-0.46, 0.36, 0);
    const copperBladeMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.25, metalness: 0.85 })
    );
    const bladeBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.06, 0.07, 0.08)), copperBladeMat);
    bladeBar.position.set(0.52, 0, 0);
    const bladeHandle = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.075, 0.09, 0.32, 16)), blackTerminalMat);
    bladeHandle.rotation.z = Math.PI / 2;
    bladeHandle.position.set(1.16, 0.02, 0);
    knifeBladePivot.add(bladeBar, bladeHandle);
    switchGroup.add(knifeBladePivot);

    // ==================== 4. COMPOSITE 3D ANALOG AMMETER (Left: x=-3.05, z=0.95) ====================
    function buildAnalogMeter(
      unit: 'A' | 'V',
      subtitle: string,
      maxScale: number,
      ticks: number
    ): { group: THREE.Group; needlePivot: THREE.Group } {
      const group = new THREE.Group();
      // Base plate
      const base = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.55, 0.14, 1.15)), housingDarkMat);
      base.position.y = 0.07;
      base.castShadow = !isSoftwareGl;
      group.add(base);

      // Twin chrome support posts
      const postL = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.56, 14)), steelMat);
      postL.position.set(-0.42, 0.4, -0.05);
      const postR = postL.clone();
      postR.position.x = 0.42;
      group.add(postL, postR);

      // Tilted meter head
      const head = new THREE.Group();
      head.position.set(0, 1.16, -0.05);
      head.rotation.x = -0.18;
      const casing = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.62, 1.24, 0.42)), housingDarkMat);
      casing.castShadow = !isSoftwareGl;
      head.add(casing);

      const dialTex = trackTex(createMeterDialTexture(unit, subtitle, maxScale, ticks, maxAniso));
      const dialFace = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(1.44, 1.08)),
        trackMat(new THREE.MeshBasicMaterial({ map: dialTex }))
      );
      dialFace.position.z = 0.218;
      head.add(dialFace);

      // Sweeping Red Indicator Needle pivoted at bottom center of dial
      const needlePivot = new THREE.Group();
      needlePivot.position.set(0, -0.32, 0.232);
      const needleMesh = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.028, 0.68, 0.012)),
        redTerminalMat
      );
      needleMesh.position.y = 0.34;
      const needleCap = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 16)), housingDarkMat);
      needleCap.rotation.x = Math.PI / 2;
      needlePivot.add(needleMesh, needleCap);
      head.add(needlePivot);

      // Front terminal posts on base
      const termL = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.065, 0.065, 0.18, 14)), redTerminalMat);
      termL.position.set(-0.44, 0.22, 0.36);
      const termR = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.065, 0.065, 0.18, 14)), blackTerminalMat);
      termR.position.set(0.44, 0.22, 0.36);
      group.add(head, termL, termR);

      return { group, needlePivot };
    }

    const ammeter = buildAnalogMeter('A', 'CURRENT (A)', 6, 12);
    ammeter.group.position.set(-3.05, 0, 0.95);
    ammeter.group.rotation.y = 0.38;
    benchRoot.add(ammeter.group);
    addContactShadow(-3.05, 0.95, 2.1, 1.7);

    // ==================== 5. COMPOSITE 3D WIRE-WOUND RESISTOR + THERMAL COIL (Center-Front: x=0, z=1.65) ====================
    const resistorGroup = new THREE.Group();
    resistorGroup.position.set(0, 0, 1.65);
    benchRoot.add(resistorGroup);
    addContactShadow(0, 1.65, 2.7, 1.2);

    // Ceramic support stands
    const standL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.56, 0.52)), ceramicMat);
    standL.position.set(-0.98, 0.28, 0);
    standL.castShadow = !isSoftwareGl;
    const standR = standL.clone();
    standR.position.x = 0.98;
    resistorGroup.add(standL, standR);

    // Ceramic insulating cylinder core
    const coreCyl = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 1.95, 24)), ceramicMat);
    coreCyl.rotation.z = Math.PI / 2;
    coreCyl.position.y = 0.58;
    resistorGroup.add(coreCyl);

    // Brass end caps & terminals
    const capL = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 24)), brassMat);
    capL.rotation.z = Math.PI / 2;
    capL.position.set(-0.96, 0.58, 0);
    const capR = capL.clone();
    capR.position.x = 0.96;
    resistorGroup.add(capL, capR);

    // Spiral Nichrome Resistance Heating Coil (emissive glow increases with Power P = I^2 R!)
    const coilPts: THREE.Vector3[] = [];
    const coilTurns = 16;
    const coilSteps = 160;
    for (let i = 0; i <= coilSteps; i++) {
      const u = i / coilSteps;
      const x = -0.82 + u * 1.64;
      const theta = u * coilTurns * Math.PI * 2;
      coilPts.push(new THREE.Vector3(x, 0.58 + Math.cos(theta) * 0.255, Math.sin(theta) * 0.255));
    }
    const coilCurve = new THREE.CatmullRomCurve3(coilPts);
    const coilMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xb45309,
        emissive: new THREE.Color(0xff4500),
        emissiveIntensity: 0.05,
        roughness: 0.28,
        metalness: 0.78,
      })
    );
    const coilMesh = new THREE.Mesh(trackGeo(new THREE.TubeGeometry(coilCurve, 180, 0.028, 8, false)), coilMat);
    coilMesh.castShadow = !isSoftwareGl;
    resistorGroup.add(coilMesh);

    // ==================== 6. COMPOSITE 3D FILAMENT LAMP (Series Light Indicator: x=1.75, z=0.25) ====================
    const lampGroup = new THREE.Group();
    lampGroup.position.set(1.75, 0, 0.25);
    benchRoot.add(lampGroup);
    addContactShadow(1.75, 0.25, 1.55, 1.55);

    // Insulated circular lab lamp holder plinth
    const lampPlinth = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.56, 0.62, 0.18, 28)), housingDarkMat);
    lampPlinth.position.y = 0.09;
    lampPlinth.castShadow = !isSoftwareGl;
    lampGroup.add(lampPlinth);

    // Porcelain socket collar + brass screw base
    const lampPorcelain = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.32, 0.38, 0.22, 24)), ceramicMat);
    lampPorcelain.position.y = 0.28;
    const lampScrewBase = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.26, 24)), brassMat);
    lampScrewBase.position.y = 0.5;
    lampGroup.add(lampPorcelain, lampScrewBase);

    // Twin brass binding posts on plinth (front & back)
    const lampTermFront = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 14)), brassMat);
    lampTermFront.position.set(0, 0.22, 0.44);
    const lampTermBack = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 14)), brassMat);
    lampTermBack.position.set(0, 0.22, -0.44);
    lampGroup.add(lampTermFront, lampTermBack);

    // Internal support posts inside glass bulb
    const filPostL = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 8)), steelMat);
    filPostL.position.set(-0.11, 0.84, 0);
    const filPostR = filPostL.clone();
    filPostR.position.x = 0.11;
    lampGroup.add(filPostL, filPostR);

    // Coiled tungsten filament arch inside bulb
    const filPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 44; i++) {
      const u = i / 44;
      const x = -0.11 + u * 0.22;
      const arch = Math.sin(u * Math.PI) * 0.18;
      const wiggleY = Math.sin(u * Math.PI * 14) * 0.025;
      const wiggleZ = Math.cos(u * Math.PI * 14) * 0.025;
      filPts.push(new THREE.Vector3(x, 1.03 + arch + wiggleY, wiggleZ));
    }
    const filamentMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        emissive: new THREE.Color(0xffb703),
        emissiveIntensity: 0.0,
        roughness: 0.25,
        metalness: 0.65,
      })
    );
    const filamentMesh = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(filPts), 72, 0.015, 8, false)),
      filamentMat
    );
    lampGroup.add(filamentMesh);

    // Clear glass bulb envelope + warm emissive inner core
    const bulbGlassMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(0xfde047),
        emissiveIntensity: 0.0,
        roughness: 0.08,
        metalness: 0.0,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      })
    );
    const bulbGlobe = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.44, 28, 22)), bulbGlassMat);
    bulbGlobe.position.y = 1.08;
    const bulbNeck = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.24, 24)), bulbGlassMat);
    bulbNeck.position.y = 0.72;
    lampGroup.add(bulbGlobe, bulbNeck);

    // Volumetric warm halo sprite around bulb (makes brightness unmistakably readable in both Dark & Light mode)
    const haloTex = trackTex(createLampHaloTexture());
    const lampHaloMat = trackMat(
      new THREE.SpriteMaterial({
        map: haloTex,
        color: 0xffe57f,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const lampHaloSprite = new THREE.Sprite(lampHaloMat);
    lampHaloSprite.position.set(0, 1.08, 0);
    lampHaloSprite.scale.set(1.2, 1.2, 1);
    lampGroup.add(lampHaloSprite);

    // Real dynamic PointLight illuminating the surrounding bench & components as voltage/resistance changes
    const lampPointLight = new THREE.PointLight(0xffcf5c, 0, 9.5, 1.6);
    lampPointLight.position.set(1.75, 1.15, 0.25);
    benchRoot.add(lampPointLight);

    // ==================== 7. COMPOSITE 3D ANALOG VOLTMETER IN PARALLEL (Right-Front: x=3.35, z=1.35) ====================
    const voltmeter = buildAnalogMeter('V', 'VOLTAGE (V)', 24, 12);
    voltmeter.group.position.set(3.35, 0, 1.35);
    voltmeter.group.rotation.y = -0.46;
    benchRoot.add(voltmeter.group);
    addContactShadow(3.35, 1.35, 2.1, 1.7);

    // ==================== 8. 3D INSULATED CONNECTING WIRES & CLOSED ELECTRON LOOP ====================
    // Main series loop path: PSU(+) -> Ammeter -> Resistor -> Filament Lamp -> Switch -> PSU(-)
    const mainLoopWaypoints = [
      new THREE.Vector3(-1.21, 0.44, -0.88), // PSU +
      new THREE.Vector3(-1.55, 0.14, -0.25),
      new THREE.Vector3(-2.65, 0.18, 0.65),
      new THREE.Vector3(-3.3, 0.22, 1.1), // Ammeter in
      new THREE.Vector3(-2.62, 0.22, 1.42), // Ammeter out
      new THREE.Vector3(-1.7, 0.16, 1.72),
      new THREE.Vector3(-1.08, 0.58, 1.65), // Resistor left
      new THREE.Vector3(0.0, 0.58, 1.65), // Resistor center
      new THREE.Vector3(1.08, 0.58, 1.65), // Resistor right
      new THREE.Vector3(1.55, 0.18, 1.25),
      new THREE.Vector3(1.75, 0.22, 0.69), // Lamp front terminal
      new THREE.Vector3(1.75, 0.92, 0.25), // Up through Lamp filament
      new THREE.Vector3(1.75, 0.22, -0.19), // Lamp back terminal
      new THREE.Vector3(2.1, 0.16, -0.85),
      new THREE.Vector3(2.21, 0.34, -1.55), // Switch right jaw
      new THREE.Vector3(1.29, 0.34, -1.55), // Switch left jaw
      new THREE.Vector3(0.35, 0.14, -1.2),
      new THREE.Vector3(-0.83, 0.44, -0.88), // PSU -
    ];

    const seriesLoopCurve = new THREE.CatmullRomCurve3(mainLoopWaypoints, true, 'catmullrom', 0.22);

    const redWireMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.48, metalness: 0.08 })
    );
    const blackWireMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.52, metalness: 0.12 })
    );
    const violetWireMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.42, metalness: 0.1 })
    );

    // Render insulated physical cables along circuit segments
    const addCable = (pts: THREE.Vector3[], mat: THREE.Material) => {
      const c = new THREE.CatmullRomCurve3(pts);
      const mesh = new THREE.Mesh(trackGeo(new THREE.TubeGeometry(c, 40, 0.042, 10, false)), mat);
      mesh.castShadow = !isSoftwareGl;
      benchRoot.add(mesh);
    };

    // Red positive lead: PSU(+) -> Ammeter
    addCable(
      [
        new THREE.Vector3(-1.21, 0.44, -0.88),
        new THREE.Vector3(-1.55, 0.14, -0.25),
        new THREE.Vector3(-2.65, 0.18, 0.65),
        new THREE.Vector3(-3.3, 0.22, 1.1),
      ],
      redWireMat
    );
    // Red lead: Ammeter -> Resistor Left
    addCable(
      [
        new THREE.Vector3(-2.62, 0.22, 1.42),
        new THREE.Vector3(-1.7, 0.16, 1.72),
        new THREE.Vector3(-1.06, 0.58, 1.65),
      ],
      redWireMat
    );
    // Black lead: Resistor Right -> Lamp Front Terminal
    addCable(
      [
        new THREE.Vector3(1.06, 0.58, 1.65),
        new THREE.Vector3(1.55, 0.18, 1.25),
        new THREE.Vector3(1.75, 0.22, 0.69),
      ],
      blackWireMat
    );
    // Black return lead: Lamp Back Terminal -> Knife Switch
    addCable(
      [
        new THREE.Vector3(1.75, 0.22, -0.19),
        new THREE.Vector3(2.1, 0.16, -0.85),
        new THREE.Vector3(2.21, 0.32, -1.55),
      ],
      blackWireMat
    );
    // Black return lead: Knife Switch -> PSU(-)
    addCable(
      [
        new THREE.Vector3(1.29, 0.32, -1.55),
        new THREE.Vector3(0.35, 0.14, -1.2),
        new THREE.Vector3(-0.83, 0.44, -0.88),
      ],
      blackWireMat
    );

    // Violet PARALLEL Voltmeter Leads across Resistor Left & Right terminals
    addCable(
      [
        new THREE.Vector3(-1.02, 0.58, 1.65),
        new THREE.Vector3(-0.55, 0.14, 2.65),
        new THREE.Vector3(1.85, 0.14, 2.65),
        new THREE.Vector3(2.9, 0.22, 1.8),
      ],
      violetWireMat
    );
    addCable(
      [
        new THREE.Vector3(1.02, 0.58, 1.65),
        new THREE.Vector3(2.25, 0.18, 2.02),
        new THREE.Vector3(3.55, 0.22, 1.45),
      ],
      violetWireMat
    );

    // ==================== 9. INSTANCED 3D CHARGE CARRIERS (48 glowing current pulses) ====================
    const CHARGE_COUNT = 48;
    const chargeGeo = trackGeo(new THREE.SphereGeometry(0.072, 12, 10));
    const chargeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: new THREE.Color(0xf59e0b),
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.1,
      })
    );
    const chargeInstanced = new THREE.InstancedMesh(chargeGeo, chargeMat, CHARGE_COUNT);
    chargeInstanced.frustumCulled = false;
    chargeInstanced.renderOrder = 12;
    benchRoot.add(chargeInstanced);

    // 3D Label anchor definitions
    const labelSpecs: LabelSpec[] = [
      {
        id: 'psu',
        text: 'DC power supply (V)',
        worldPos: new THREE.Vector3(-1.45, 1.72, -1.75),
        offsetX: -68,
        offsetY: -36,
      },
      {
        id: 'switch',
        text: 'knife switch',
        worldPos: new THREE.Vector3(1.75, 0.55, -1.55),
        offsetX: 66,
        offsetY: -44,
      },
      {
        id: 'ammeter',
        text: 'ammeter (series)',
        worldPos: new THREE.Vector3(-3.05, 1.8, 0.95),
        offsetX: -48,
        offsetY: -38,
      },
      {
        id: 'resistor',
        text: 'resistor (R)',
        worldPos: new THREE.Vector3(0, 0.88, 1.65),
        offsetX: -12,
        offsetY: 56,
      },
      {
        id: 'lamp',
        text: 'filament lamp',
        worldPos: new THREE.Vector3(1.75, 1.54, 0.25),
        offsetX: 28,
        offsetY: -42,
      },
      {
        id: 'voltmeter',
        text: 'voltmeter (parallel)',
        worldPos: new THREE.Vector3(3.35, 1.8, 1.35),
        offsetX: 42,
        offsetY: -32,
      },
    ];

    // Smoothly damped physical animation state
    let dampedV = targetVoltageRef.current;
    let dampedR = targetResistanceRef.current;
    let dampedSwitch = targetSwitchRef.current;
    let chargePhase = 0;
    let lastDrawnV = -1;
    let lastDrawnI = -1;
    let lastDrawnClosed = -1;

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
        const ly = Math.max(28, Math.min(h - 28, ay + spec.offsetY));
        out.push({ id: spec.id, text: spec.text, ax, ay, lx, ly });
      }
      return out;
    }

    // Direct 3D Pointer Raycasting (Click Switch, Power Dial, Resistor, Lamp, Ammeter, Voltmeter!)
    const clickableMeshes: Array<{
      mesh: THREE.Object3D;
      action: 'switch' | 'dial' | 'resistor' | 'lamp' | 'ammeter' | 'voltmeter';
    }> = [
      { mesh: switchBase, action: 'switch' },
      { mesh: bladeBar, action: 'switch' },
      { mesh: bladeHandle, action: 'switch' },
      { mesh: knobCyl, action: 'dial' },
      { mesh: knobPointer, action: 'dial' },
      { mesh: psuBody, action: 'dial' },
      { mesh: coreCyl, action: 'resistor' },
      { mesh: coilMesh, action: 'resistor' },
      { mesh: lampGroup, action: 'lamp' },
      { mesh: ammeter.group, action: 'ammeter' },
      { mesh: voltmeter.group, action: 'voltmeter' },
    ];
    const hitTargets = clickableMeshes.map((c) => c.mesh);

    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverCheck = 0;

    const getHitAction = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
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
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      const action = getHitAction(e.clientX, e.clientY);
      renderer.domElement.style.cursor = action ? 'pointer' : 'grab';
    };

    const onPointerUp = (e: PointerEvent) => {
      // Ignore orbit drags (> 6px movement)
      if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) return;
      const action = getHitAction(e.clientX, e.clientY);
      if (!action) return;

      if (action === 'switch') {
        setManualOverride(true);
        setWatchLessonActive(false);
        setIsPlaying(false);
        setSwitchClosed((prev) => {
          const next = !prev;
          setInteractionHint(
            next
              ? 'Knife switch CLOSED — circuit complete & lamp ON!'
              : 'Knife switch OPENED — current stopped (0.00 A) & lamp OFF'
          );
          return next;
        });
      } else if (action === 'dial') {
        setManualOverride(true);
        setWatchLessonActive(false);
        setIsPlaying(false);
        setSwitchClosed(true);
        setVoltage((prev) => {
          const next = prev >= 24 ? 4 : prev + 4;
          setInteractionHint(`Turned DC Supply Dial → ${next.toFixed(1)} V (watch lamp brightness change!)`);
          return next;
        });
      } else if (action === 'resistor') {
        setManualOverride(true);
        setWatchLessonActive(false);
        setIsPlaying(false);
        setSwitchClosed(true);
        setResistance((prev) => {
          const next = prev >= 12 ? 2 : prev + 2;
          setInteractionHint(`Swapped Resistor Coil → ${next.toFixed(1)} Ω (more R dims the lamp!)`);
          return next;
        });
      } else if (action === 'lamp') {
        const closed = targetSwitchRef.current > 0.5;
        const iNow = closed ? targetVoltageRef.current / targetResistanceRef.current : 0;
        const pNow = closed ? targetVoltageRef.current * iNow : 0;
        const pct = closed ? Math.min(100, Math.round(Math.pow(Math.min(1, pNow / 80), 0.58) * 100)) : 0;
        setInteractionHint(
          closed
            ? `Filament Lamp — Brightness: ${pct}% (${iNow.toFixed(2)} A, ${pNow.toFixed(1)} W)`
            : 'Filament Lamp is OFF — close the switch to light it up!'
        );
      } else if (action === 'ammeter') {
        const iNow = targetSwitchRef.current > 0.5 ? targetVoltageRef.current / targetResistanceRef.current : 0;
        setInteractionHint(`Series Ammeter reads I = ${iNow.toFixed(2)} A (measures charge flow per second)`);
      } else if (action === 'voltmeter') {
        const vNow = targetSwitchRef.current > 0.5 ? targetVoltageRef.current : 0;
        setInteractionHint(`Parallel Voltmeter reads V = ${vNow.toFixed(1)} V (measures potential difference across R)`);
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

      // Advance guided lesson (generous unhurried reading time!) or smooth Play timeline
      if (watchLessonRef.current && !lessonPausedRef.current) {
        const pace = Math.max(4, lessonPaceSecRef.current);
        if (lessonHoldTimerRef.current > 0) {
          lessonHoldTimerRef.current = Math.max(0, lessonHoldTimerRef.current - delta);
          const nowT = performance.now();
          if (nowT - lastTimerPushRef.current > 120) {
            lastTimerPushRef.current = nowT;
            setLessonRemainingFrac(Math.max(0, Math.min(1, lessonHoldTimerRef.current / pace)));
          }
        } else {
          // Gentle, calm glide between stages (~4 seconds between milestones)
          const nextT = targetProgressRef.current + delta * 0.036;
          const crossedIdx = LESSON_MILESTONES.findIndex(
            (m) => targetProgressRef.current < m && nextT >= m
          );
          if (crossedIdx !== -1) {
            targetProgressRef.current = LESSON_MILESTONES[crossedIdx];
            setProgress(LESSON_MILESTONES[crossedIdx]);
            setLessonStepIndex(crossedIdx);
            lessonHoldTimerRef.current = pace;
            setLessonRemainingFrac(1);
            if (crossedIdx === LESSON_MILESTONES.length - 1) {
              // Hold the final step briefly, then let learner explore freely
              lessonHoldTimerRef.current = pace;
            }
          } else if (nextT >= 1.0) {
            targetProgressRef.current = 1.0;
            setProgress(1.0);
            watchLessonRef.current = false;
            setWatchLessonActive(false);
            setIsPlaying(false);
          } else {
            targetProgressRef.current = nextT;
            setProgress(Number(nextT.toFixed(4)));
          }
        }
      } else if (isPlayingRef.current) {
        // Slower, calm continuous Play playback (~34 seconds full walkthrough)
        const nextT = targetProgressRef.current + delta * 0.029;
        if (nextT >= 1.0) {
          targetProgressRef.current = 1.0;
          setProgress(1.0);
          isPlayingRef.current = false;
          setIsPlaying(false);
        } else {
          targetProgressRef.current = nextT;
          setProgress(Number(nextT.toFixed(4)));
        }
      }

      // Theme sync
      const isDark = darkModeRef.current;
      scene.background = isDark ? bgDark : bgLight;
      tableMat.color.setHex(isDark ? 0x1d2332 : 0xe2e8f0);

      // Exponentially damped physical movements
      dampedV = THREE.MathUtils.damp(dampedV, targetVoltageRef.current, 7.5, delta);
      dampedR = THREE.MathUtils.damp(dampedR, targetResistanceRef.current, 7.5, delta);
      dampedSwitch = THREE.MathUtils.damp(dampedSwitch, targetSwitchRef.current, 9.0, delta);

      const liveI = dampedSwitch > 0.5 ? dampedV / Math.max(0.5, dampedR) : 0;
      const liveVAcrossR = dampedSwitch > 0.5 ? dampedV : 0;
      const livePower = liveVAcrossR * liveI;

      // 1. Knife switch physical swing (0 = raised open at 48 deg, 1 = closed flat)
      knifeBladePivot.rotation.z = (1 - dampedSwitch) * 0.85;

      // 2. Power supply rotary knob physical angle
      knobGroup.rotation.z = THREE.MathUtils.mapLinear(dampedV, 2, 24, 1.9, -1.9);

      // 3. Update live digital LED screen texture only when rounded values change
      const dispV = Number(dampedV.toFixed(1));
      const dispI = Number(liveI.toFixed(2));
      const dispClosed = dampedSwitch > 0.5 ? 1 : 0;
      if (dispV !== lastDrawnV || dispI !== lastDrawnI || dispClosed !== lastDrawnClosed) {
        lastDrawnV = dispV;
        lastDrawnI = dispI;
        lastDrawnClosed = dispClosed;
        drawPowerSupplyScreen(screenCtx, dispV, dispI, dispClosed === 1);
        screenTex.needsUpdate = true;
      }

      // 4. Analog Ammeter & Voltmeter Needle Deflections (arcs from +0.98 rad to -0.98 rad)
      const ampFrac = Math.min(1, liveI / 6.0);
      ammeter.needlePivot.rotation.z = THREE.MathUtils.lerp(0.98, -0.98, ampFrac);

      const voltFrac = Math.min(1, liveVAcrossR / 24.0);
      voltmeter.needlePivot.rotation.z = THREE.MathUtils.lerp(0.98, -0.98, voltFrac);

      // 5. Resistor coil scale & Joule-heating thermal orange glow
      const heatFactor = Math.min(1, livePower / 90);
      coilMat.emissiveIntensity = 0.04 + heatFactor * 2.1 + Math.sin(elapsed * 5) * 0.04 * heatFactor;
      const coilThicknessScale = 0.88 + ((dampedR - 2) / 10) * 0.28;
      coilMesh.scale.set(1, coilThicknessScale, coilThicknessScale);

      // 6. 3D Filament Lamp Brightness, Color Temperature, Halo & Bench Illumination!
      const lampLevel = dampedSwitch > 0.5 ? Math.min(1, Math.pow(Math.min(1, livePower / 80), 0.58)) : 0;
      // Shift filament blackbody glow color from deep orange (dim) -> warm gold -> bright white-yellow (high power)
      filamentMat.emissive.setHSL(
        THREE.MathUtils.lerp(0.05, 0.135, lampLevel),
        THREE.MathUtils.lerp(1.0, 0.55, lampLevel),
        THREE.MathUtils.lerp(0.45, 0.82, lampLevel)
      );
      filamentMat.emissiveIntensity = lampLevel > 0.01 ? 0.35 + lampLevel * 5.2 : 0;
      bulbGlassMat.emissive.setHSL(0.125, 0.9, THREE.MathUtils.lerp(0.45, 0.72, lampLevel));
      bulbGlassMat.emissiveIntensity = lampLevel * 0.95;
      bulbGlassMat.opacity = 0.32 + lampLevel * 0.28;

      const pulse = 1 + Math.sin(elapsed * 4.2) * 0.025 * lampLevel;
      const haloSize = (0.7 + lampLevel * 2.45) * pulse;
      lampHaloSprite.scale.set(haloSize, haloSize, 1);
      lampHaloMat.opacity = lampLevel > 0.01 ? (isDark ? 0.18 + lampLevel * 0.78 : 0.16 + lampLevel * 0.68) : 0;
      lampPointLight.intensity = lampLevel * (isDark ? 9.5 : 6.0);

      // 7. Animate glowing instanced charge carriers around the 3D circuit loop
      chargePhase = (chargePhase + delta * liveI * 0.065) % 1;
      const chargeVisibleScale = dampedSwitch > 0.4 ? 0.85 + Math.min(0.45, liveI * 0.08) : 0.45;
      chargeMat.emissiveIntensity = dampedSwitch > 0.4 ? 0.7 + Math.min(1.0, liveI * 0.16) : 0.12;

      for (let i = 0; i < CHARGE_COUNT; i++) {
        const u = (i / CHARGE_COUNT + chargePhase) % 1;
        seriesLoopCurve.getPointAt(u, _vPos);
        _quatDummy.identity();
        _scaleDummy.setScalar(chargeVisibleScale);
        _matDummy.compose(_vPos, _quatDummy, _scaleDummy);
        chargeInstanced.setMatrixAt(i, _matDummy);
      }
      chargeInstanced.instanceMatrix.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastLabelPushRef.current > 32) {
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

  const handleTogglePlay = () => {
    setManualOverride(false);
    setWatchLessonActive(false);
    if (!isPlaying && progress >= 0.99) {
      setProgress(0);
      targetProgressRef.current = 0;
    }
    setIsPlaying((prev) => !prev);
  };

  const handleWatchLesson = () => {
    if (watchLessonActive) {
      setWatchLessonActive(false);
      setLessonPaused(false);
      setIsPlaying(false);
      return;
    }
    setManualOverride(false);
    setProgress(0);
    targetProgressRef.current = 0;
    setLessonStepIndex(0);
    setLessonPaused(false);
    lessonHoldTimerRef.current = lessonPaceSec;
    setLessonRemainingFrac(1);
    setIsPlaying(false);
    setWatchLessonActive(true);
  };

  const handleStepLesson = (deltaStep: number) => {
    const nextIdx = Math.max(0, Math.min(LESSON_MILESTONES.length - 1, lessonStepIndex + deltaStep));
    const nextT = LESSON_MILESTONES[nextIdx];
    setManualOverride(false);
    setLessonStepIndex(nextIdx);
    setProgress(nextT);
    targetProgressRef.current = nextT;
    lessonHoldTimerRef.current = lessonPaceSec;
    setLessonRemainingFrac(1);
  };

  const handleStartAgain = () => {
    setManualOverride(false);
    setWatchLessonActive(false);
    setLessonPaused(false);
    setIsPlaying(false);
    setProgress(0);
    targetProgressRef.current = 0;
  };

  const handleJumpStage = (stageT: number) => {
    setManualOverride(false);
    setWatchLessonActive(false);
    setLessonPaused(false);
    setIsPlaying(false);
    setProgress(stageT);
    targetProgressRef.current = stageT;
  };

  // Theme-adaptive classes matching Mitosis3DSimulation exactly
  const surfaceBg = darkMode ? 'bg-[#161922] text-slate-100' : 'bg-[#f1f5fb] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#1d2230] border-white/[0.1] text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const dockBg = darkMode
    ? 'bg-[#131722]/95 border-white/[0.12] text-slate-100'
    : 'bg-white/95 border-slate-300/90 text-slate-900 shadow-lg';

  // Live V-I Characteristic graph points for current resistance R
  const graphLineEndI = Math.min(6, 24 / resistance);
  const graphLineEndV = graphLineEndI * resistance;

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border overflow-hidden flex flex-col ${surfaceBg} ${
        darkMode ? 'border-white/[0.08]' : 'border-slate-200 shadow-sm'
      } ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-0 h-screen' : ''}`}
    >
      {/* TOP BAR (Identical clean Mitosis-style bar) */}
      <div
        className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          darkMode ? 'bg-[#12151e] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleWatchLesson}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              watchLessonActive
                ? 'bg-sky-500 text-slate-950'
                : darkMode
                ? 'bg-white text-slate-950 hover:bg-slate-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {watchLessonActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{watchLessonActive ? 'Stop lesson' : 'Watch lesson'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabels((prev) => !prev)}
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

          {/* Direct Physical Switch Toggle */}
          <button
            type="button"
            onClick={() => {
              setManualOverride(true);
              setWatchLessonActive(false);
              setIsPlaying(false);
              setSwitchClosed((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${
              switchClosed
                ? darkMode
                  ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-500/50 text-emerald-800'
                : darkMode
                ? 'bg-amber-500/15 border-amber-400/50 text-amber-300'
                : 'bg-amber-50 border-amber-500/50 text-amber-800'
            }`}
          >
            Switch: {switchClosed ? 'CLOSED' : 'OPEN'}
          </button>
          {/* Interactive Learner Challenge Toggle */}
          <button
            type="button"
            onClick={() => {
              setWatchLessonActive(false);
              setIsPlaying(false);
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
          {/* O-Level / A-Level Depth Switcher */}
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

      {/* MAIN CONTENT: Unobstructed 3D Bench + Right Scientific Readout Panel */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D INTERACTIVE CIRCUIT BENCH (8 cols) */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[430px] sm:h-[520px] lg:h-[580px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

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

          {/* Guided Lesson Caption Banner with Generous Pacing, Step Controls & Pace Selector */}
          {watchLessonActive && (
            <div className="pointer-events-none absolute top-3.5 inset-x-4 flex justify-center">
              <div
                className={`pointer-events-auto max-w-xl w-full px-4 py-2.5 rounded-2xl border ${
                  darkMode
                    ? 'bg-[#10141f] border-sky-400/45 text-white'
                    : 'bg-white border-sky-500/45 text-slate-900 shadow-md'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">
                    Step {lessonStepIndex + 1} of {LESSON_MILESTONES.length} · Ohm&apos;s Law
                  </span>
                  <div className="flex items-center gap-1">
                    {/* Reading speed toggle */}
                    {[
                      { label: '7s', val: 7 },
                      { label: '11s', val: 11 },
                      { label: '15s', val: 15 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          setLessonPaceSec(opt.val);
                          lessonHoldTimerRef.current = opt.val;
                          setLessonRemainingFrac(1);
                        }}
                        title={`Hold each lesson step for ${opt.val} seconds`}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                          lessonPaceSec === opt.val
                            ? 'bg-sky-500 text-slate-950'
                            : darkMode
                            ? 'bg-white/[0.08] text-slate-300 hover:bg-white/[0.14]'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleStepLesson(-1)}
                      disabled={lessonStepIndex === 0}
                      title="Previous step"
                      className={`p-1 rounded-md cursor-pointer disabled:opacity-35 ${
                        darkMode ? 'hover:bg-white/[0.1]' : 'hover:bg-slate-100'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonPaused((p) => !p)}
                      title={lessonPaused ? 'Resume lesson' : 'Pause on this step'}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                        lessonPaused
                          ? 'bg-amber-400 text-slate-950'
                          : darkMode
                          ? 'bg-white/[0.08] text-slate-200 hover:bg-white/[0.15]'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {lessonPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepLesson(1)}
                      disabled={lessonStepIndex >= LESSON_MILESTONES.length - 1}
                      title="Next step"
                      className={`p-1 rounded-md cursor-pointer disabled:opacity-35 ${
                        darkMode ? 'hover:bg-white/[0.1]' : 'hover:bg-slate-100'
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold mt-1 leading-snug text-center">
                  {currentStage.lessonCaption}
                </p>
                {/* Calm remaining reading time bar */}
                <div className={`mt-2 h-1 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <div
                    className="h-full bg-sky-500 transition-all duration-150"
                    style={{ width: `${Math.round(lessonRemainingFrac * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Direct 3D Click Toast / Interactive Feedback */}
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

          {!dockCollapsed && (
            <div className="pointer-events-none absolute bottom-2 inset-x-0 text-center">
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  darkMode ? 'text-slate-400 bg-[#161922]/85' : 'text-slate-500 bg-[#f1f5fb]/90'
                }`}
              >
                Tap the 3D switch, dial, lamp or resistor • Drag to orbit 360° • Use sliders below
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SCIENTIFIC EXPLANATION, CIRCUIT DIAGRAM & V-I PANEL (4 cols) */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-4 sm:p-5 flex flex-col justify-between gap-3.5 lg:max-h-[580px] overflow-y-auto ${
            darkMode ? 'bg-[#131722] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3.5">
            <div>
              <div className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {manualOverride ? "Ohm's Law · custom bench values" : currentStage.subtitle}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                {manualOverride
                  ? `I = ${effectiveCurrent.toFixed(2)} A`
                  : level === 'o_level'
                  ? currentStage.oTitle
                  : currentStage.aTitle}
              </h2>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {level === 'o_level' ? currentStage.oDescription : currentStage.aDescription}
            </p>

            {/* Live 4-Metric Electrical & Lamp Brightness Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-1.5 tabular-nums">
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Voltage
                </div>
                <div className="text-sm font-black text-violet-500">{effectiveVoltageAcrossR.toFixed(1)} V</div>
              </div>
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Current
                </div>
                <div className="text-sm font-black text-sky-500">{effectiveCurrent.toFixed(2)} A</div>
              </div>
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Power
                </div>
                <div className="text-sm font-black text-amber-500">{powerWatts.toFixed(1)} W</div>
              </div>
              <div className={`p-2 rounded-xl border text-center ${cardBg}`}>
                <div className={`text-[10px] font-bold uppercase flex items-center justify-center gap-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Lightbulb className="w-2.5 h-2.5 text-yellow-500" />
                  <span>Lamp</span>
                </div>
                <div className="text-sm font-black text-yellow-500">{lampBrightnessPct}%</div>
              </div>
            </div>

            {/* LIVE INTERACTIVE STANDARD CIRCUIT DIAGRAM (NECTA / IEC SYMBOLS) */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${cardBg}`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                  Standard Circuit Diagram
                </span>
                <span className={`text-[10px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Click switch S to toggle
                </span>
              </div>
              <svg viewBox="0 0 280 144" className="w-full h-32 select-none">
                {/* Main series loop rectangle wires */}
                <path
                  d="M 42 36 L 106 36 M 148 36 L 238 36 L 238 56 M 238 88 L 238 110 L 182 110 M 112 110 L 42 110 L 42 84 M 42 54 L 42 36"
                  fill="none"
                  stroke={darkMode ? '#94a3b8' : '#334155'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Animated current flow dashes when switch is closed */}
                {switchClosed && effectiveCurrent > 0.01 && (
                  <path
                    d="M 42 36 L 238 36 L 238 110 L 42 110 Z"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="2.4"
                    strokeDasharray="6 14"
                    opacity="0.88"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-20"
                      dur={`${Math.max(0.28, 1.8 / Math.max(0.4, effectiveCurrent)).toFixed(2)}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                )}

                {/* Parallel Voltmeter (V) branches across Resistor */}
                <path
                  d="M 102 110 L 102 132 L 134 132 M 160 132 L 192 132 L 192 110"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="102" cy="110" r="2.6" fill="#8b5cf6" />
                <circle cx="192" cy="110" r="2.6" fill="#8b5cf6" />

                {/* 1. DC Power Supply / Battery Symbol (Left vertical wire) */}
                <line x1="28" y1="54" x2="56" y2="54" stroke="#ef4444" strokeWidth="2.4" />
                <line x1="34" y1="62" x2="50" y2="62" stroke={darkMode ? '#e2e8f0' : '#0f172a'} strokeWidth="4.2" />
                <line x1="28" y1="72" x2="56" y2="72" stroke="#ef4444" strokeWidth="2.4" />
                <line x1="34" y1="80" x2="50" y2="80" stroke={darkMode ? '#e2e8f0' : '#0f172a'} strokeWidth="4.2" />
                <text x="16" y="54" fontSize="10" fontWeight="900" fill="#ef4444">+</text>
                <text x="17" y="84" fontSize="11" fontWeight="900" fill={darkMode ? '#94a3b8' : '#475569'}>−</text>
                <text x="5" y="70" fontSize="8.5" fontWeight="800" fill={darkMode ? '#c4b5fd' : '#6d28d9'}>
                  {voltage.toFixed(0)}V
                </text>

                {/* 2. Interactive Switch (S) on Top Wire */}
                <g
                  className="cursor-pointer"
                  onClick={() => {
                    setManualOverride(true);
                    setWatchLessonActive(false);
                    setIsPlaying(false);
                    setSwitchClosed((prev) => !prev);
                  }}
                >
                  <rect x="98" y="12" width="58" height="32" fill="transparent" />
                  <circle cx="108" cy="36" r="3.4" fill={darkMode ? '#e2e8f0' : '#0f172a'} />
                  <circle cx="146" cy="36" r="3.4" fill={darkMode ? '#e2e8f0' : '#0f172a'} />
                  <line
                    x1="108"
                    y1="36"
                    x2={switchClosed ? 146 : 142}
                    y2={switchClosed ? 36 : 18}
                    stroke={switchClosed ? '#10b981' : '#f59e0b'}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <text
                    x="127"
                    y="15"
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    fill={switchClosed ? '#10b981' : '#f59e0b'}
                  >
                    S ({switchClosed ? 'CLOSED' : 'OPEN'})
                  </text>
                </g>

                {/* 3. Series Ammeter (A) on Top-Right Wire */}
                <circle
                  cx="196"
                  cy="36"
                  r="13"
                  fill={darkMode ? '#161b29' : '#ffffff'}
                  stroke="#0284c7"
                  strokeWidth="2.2"
                />
                <text x="196" y="40" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0284c7">
                  A
                </text>
                <text x="196" y="17" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0284c7">
                  {effectiveCurrent.toFixed(2)} A
                </text>

                {/* 4. Series Filament Lamp Symbol (Right Vertical Wire) with Live Brightness Glow */}
                <g>
                  {lampBrightnessPct > 0 && (
                    <circle
                      cx="238"
                      cy="72"
                      r={14 + (lampBrightnessPct / 100) * 11}
                      fill="#facc15"
                      opacity={0.14 + (lampBrightnessPct / 100) * 0.42}
                    />
                  )}
                  <circle
                    cx="238"
                    cy="72"
                    r="14"
                    fill={
                      lampBrightnessPct > 0
                        ? `rgba(250, 204, 21, ${(0.18 + (lampBrightnessPct / 100) * 0.72).toFixed(2)})`
                        : darkMode
                        ? '#161b29'
                        : '#ffffff'
                    }
                    stroke={lampBrightnessPct > 0 ? '#eab308' : darkMode ? '#94a3b8' : '#334155'}
                    strokeWidth="2.2"
                  />
                  {/* Standard IEC Lamp Cross (⊗) */}
                  <line
                    x1="229"
                    y1="63"
                    x2="247"
                    y2="81"
                    stroke={lampBrightnessPct > 45 ? '#713f12' : darkMode ? '#e2e8f0' : '#0f172a'}
                    strokeWidth="2"
                  />
                  <line
                    x1="247"
                    y1="63"
                    x2="229"
                    y2="81"
                    stroke={lampBrightnessPct > 45 ? '#713f12' : darkMode ? '#e2e8f0' : '#0f172a'}
                    strokeWidth="2"
                  />
                  <text
                    x="266"
                    y="69"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="800"
                    fill={lampBrightnessPct > 0 ? '#eab308' : darkMode ? '#94a3b8' : '#64748b'}
                  >
                    Lamp
                  </text>
                  <text
                    x="266"
                    y="79"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="800"
                    fill={lampBrightnessPct > 0 ? '#eab308' : darkMode ? '#94a3b8' : '#64748b'}
                  >
                    {lampBrightnessPct}%
                  </text>
                </g>

                {/* 5. Variable Resistor (R) on Bottom Wire */}
                <rect
                  x="112"
                  y="101"
                  width="70"
                  height="18"
                  rx="2"
                  fill={
                    powerWatts >= 45
                      ? `rgba(249, 115, 22, ${Math.min(0.55, powerWatts / 140).toFixed(2)})`
                      : darkMode
                      ? '#161b29'
                      : '#ffffff'
                  }
                  stroke="#d97706"
                  strokeWidth="2.2"
                />
                {/* Variable arrow across resistor */}
                <line x1="126" y1="124" x2="168" y2="94" stroke="#d97706" strokeWidth="1.7" />
                <polygon points="168,94 161,95 165,101" fill="#d97706" />
                <text x="147" y="96" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#d97706">
                  R = {resistance.toFixed(1)} Ω
                </text>

                {/* 6. Parallel Voltmeter (V) below Resistor */}
                <circle
                  cx="147"
                  cy="132"
                  r="11"
                  fill={darkMode ? '#161b29' : '#ffffff'}
                  stroke="#8b5cf6"
                  strokeWidth="2"
                />
                <text x="147" y="135.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#8b5cf6">
                  V
                </text>
                <text x="200" y="135" fontSize="8.5" fontWeight="800" fill="#8b5cf6">
                  {effectiveVoltageAcrossR.toFixed(1)} V
                </text>
              </svg>
            </div>

            {/* Interactive Lab Challenge Card (when enabled) */}
            {activeChallenge && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 text-xs ${
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
                    Challenge {(challengeIdx ?? 0) + 1} of {LEARNER_CHALLENGES.length}
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
                        prev === null ? 0 : (prev + 1) % LEARNER_CHALLENGES.length
                      )
                    }
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    Next Lab Challenge →
                  </button>
                )}
              </div>
            )}

            {/* Live V vs I Graph Mini-Plot + Record Reading Button */}
            <div className={`p-3 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                  V–I Graph ({recordedPoints.length} plotted)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setRecordedPoints((prev) => [
                        ...prev.slice(-7),
                        {
                          id: Date.now(),
                          v: effectiveVoltageAcrossR,
                          i: effectiveCurrent,
                          r: resistance,
                        },
                      ])
                    }
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                      darkMode
                        ? 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
                        : 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Plot Point</span>
                  </button>
                  {recordedPoints.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRecordedPoints([])}
                      title="Clear plotted points"
                      className={`p-1 rounded-md cursor-pointer ${
                        darkMode
                          ? 'text-slate-400 hover:text-rose-300'
                          : 'text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <svg viewBox="0 0 240 116" className="w-full h-24">
                {[22, 46, 70, 94].map((y) => (
                  <line
                    key={y}
                    x1="34"
                    y1={y}
                    x2="226"
                    y2={y}
                    stroke={darkMode ? '#262d3f' : '#e2e8f0'}
                    strokeWidth="1"
                  />
                ))}
                <line x1="34" y1="12" x2="34" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />
                <line x1="34" y1="96" x2="228" y2="96" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="1.5" />
                <line
                  x1="34"
                  y1="96"
                  x2={34 + (graphLineEndI / 6) * 188}
                  y2={96 - (graphLineEndV / 24) * 80}
                  stroke="#38bdf8"
                  strokeWidth="2.4"
                />
                {/* Learner's plotted experimental dots */}
                {recordedPoints.map((pt) => (
                  <circle
                    key={pt.id}
                    cx={34 + (Math.min(6, pt.i) / 6) * 188}
                    cy={96 - (Math.min(24, pt.v) / 24) * 80}
                    r="3.4"
                    fill="#10b981"
                    stroke={darkMode ? '#0f172a' : '#ffffff'}
                    strokeWidth="1.2"
                  />
                ))}
                {/* Live operating point */}
                <circle
                  cx={34 + (Math.min(6, effectiveCurrent) / 6) * 188}
                  cy={96 - (Math.min(24, effectiveVoltageAcrossR) / 24) * 80}
                  r="5.2"
                  fill="#f59e0b"
                  stroke={darkMode ? '#0f172a' : '#ffffff'}
                  strokeWidth="1.8"
                />
                <text x="12" y="20" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="9" fontWeight="700">
                  V
                </text>
                <text x="218" y="110" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="9" fontWeight="700">
                  I (A)
                </text>
              </svg>
            </div>
          </div>

          {/* NECTA Formula Card */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode
                ? 'bg-sky-500/10 border-sky-400/25 text-sky-100'
                : 'bg-sky-50 border-sky-200 text-sky-950'
            }`}
          >
            <strong className="font-bold">Ohm&apos;s Law:</strong>{' '}
            <span className="font-mono font-bold">
              I = V / R = {effectiveVoltageAcrossR.toFixed(1)} / {resistance.toFixed(1)} = {effectiveCurrent.toFixed(2)} A
            </span>
          </div>
        </aside>
      </div>

      {/* UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK (Timeline + Stage Buttons + Live V/R Sliders) */}
      <div
        className={`border-t transition-all ${
          darkMode ? 'border-white/[0.08] bg-[#10141e]' : 'border-slate-200 bg-slate-50'
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

        {!dockCollapsed && (
          <div className="px-4 py-3.5 space-y-3 max-w-5xl mx-auto">
            {/* Row 1: Play / Pause, Continuous Timeline Scrubber, Start Again */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                  darkMode
                    ? 'bg-white text-slate-950 hover:bg-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <div className="flex-1 min-w-[180px] relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.002}
                  value={progress}
                  onChange={(e) => {
                    setManualOverride(false);
                    setWatchLessonActive(false);
                    setIsPlaying(false);
                    const val = Number(e.target.value);
                    setProgress(val);
                    targetProgressRef.current = val;
                  }}
                  aria-label="Ohm's Law lesson timeline"
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleStartAgain}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                  darkMode
                    ? 'bg-[#1c2231] border-white/[0.12] text-slate-200 hover:bg-[#252d40]'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start again</span>
              </button>
            </div>

            {/* Row 2: 8 Step-by-Step Stage Jump Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {OHMS_STAGES.map((stage) => {
                const isActive = !manualOverride && currentStage.id === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => handleJumpStage(stage.t)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                      isActive
                        ? darkMode
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'bg-slate-900 text-white shadow-xs'
                        : darkMode
                        ? 'bg-[#1b2030] text-slate-300 hover:bg-[#242b3f] hover:text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    {level === 'o_level' ? stage.oLabel : stage.aLabel}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Live Interactive Voltage & Resistance Sliders */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t text-xs ${
                darkMode ? 'border-white/[0.08]' : 'border-slate-200'
              }`}
            >
              <label className="space-y-1">
                <div className="flex items-center justify-between font-bold tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-violet-500" />
                    <span>Supply Voltage (V)</span>
                  </span>
                  <span className="text-violet-500">{voltage.toFixed(1)} V</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={24}
                  step={1}
                  value={voltage}
                  onChange={(e) => {
                    setManualOverride(true);
                    setWatchLessonActive(false);
                    setIsPlaying(false);
                    setSwitchClosed(true);
                    setVoltage(Number(e.target.value));
                  }}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </label>

              <label className="space-y-1">
                <div className="flex items-center justify-between font-bold tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    <span>Resistor Value (R)</span>
                  </span>
                  <span className="text-amber-500">{resistance.toFixed(1)} Ω</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  step={0.5}
                  value={resistance}
                  onChange={(e) => {
                    setManualOverride(true);
                    setWatchLessonActive(false);
                    setIsPlaying(false);
                    setSwitchClosed(true);
                    setResistance(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OhmsLaw3DSimulation;
