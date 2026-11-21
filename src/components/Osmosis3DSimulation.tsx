import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Tag,
  Target,
} from 'lucide-react';

export interface Osmosis3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';
type OsmosisStateId = 'turgid' | 'flaccid' | 'plasmolysed';

interface OsmosisMetrics {
  concentrationM: number; // External sucrose molarity (0.00 to 1.00 M)
  stateId: OsmosisStateId;
  stateLabel: string;
  solutionType: 'Hypotonic' | 'Isotonic' | 'Hypertonic';
  waterDirection: 'Net inflow (Endosmosis)' | 'Dynamic equilibrium' | 'Net outflow (Exosmosis)';
  vacuoleFillPct: number; // 24% to 88%
  massChangePct: number; // -22% to +18% (classic NECTA potato strip curve)
  turgorKPa: number; // 0 to +740 kPa
  solutePotentialCellKPa: number; // kPa
  waterPotentialCellKPa: number; // kPa
  waterPotentialExtKPa: number; // kPa
  membraneRetraction: number; // 0 (flush against wall) -> 1 (deep plasmolysis)
  wallBulge: number; // 0 -> 1 (slight elastic outward bulge when turgid)
}

interface OsmosisPlotPoint {
  molarity: number;
  massChangePct: number;
  stateId: OsmosisStateId;
}

interface OsmosisChallenge {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  check: (m: OsmosisMetrics, plotted: OsmosisPlotPoint[]) => boolean;
}

interface OsmosisLessonChapter {
  id: number;
  title: string;
  startSec: number;
  endSec: number;
  startM: number;
  endM: number;
  oCaption: string;
  aCaption: string;
}

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

const ISOTONIC_M = 0.30;
const LESSON_DURATION_SEC = 65;

const OSMOSIS_LESSON_CHAPTERS: OsmosisLessonChapter[] = [
  {
    id: 1,
    title: 'Pure water & Turgor',
    startSec: 0,
    endSec: 16,
    startM: 0.0,
    endM: 0.04,
    oCaption:
      'In pure (distilled) water, water enters the cell by osmosis. The central vacuole swells and pushes the membrane tightly against the cellulose cell wall — the cell becomes turgid.',
    aCaption:
      'Pure water has Ψ = 0 kPa, higher than cell sap (Ψs = −740 kPa). Water enters down the water potential gradient until wall pressure (Ψp = +740 kPa) balances Ψs so Ψcell = 0 kPa.',
  },
  {
    id: 2,
    title: 'Isotonic equilibrium',
    startSec: 16,
    endSec: 32,
    startM: 0.04,
    endM: 0.30,
    oCaption:
      'At 0.30 M sucrose, the outside solution matches the cell sap. Water moves in and out at the exact same rate — net mass change is 0% and the cell is flaccid.',
    aCaption:
      'At incipient plasmolysis (0.30 M sucrose), external water potential equals solute potential (−740 kPa). Turgor pressure falls to Ψp = 0 kPa and there is zero net osmotic flux.',
  },
  {
    id: 3,
    title: 'Hypertonic plasmolysis',
    startSec: 32,
    endSec: 50,
    startM: 0.30,
    endM: 0.88,
    oCaption:
      'In strong sucrose solution, water leaves the vacuole by osmosis. The vacuole shrinks and the cell membrane pulls away from the rigid cell wall — this is plasmolysis.',
    aCaption:
      'External Ψ (−2170 kPa) is much more negative than cell sap. Exosmosis shrinks the protoplast away from the fully permeable cellulose wall, allowing sucrose solution into the gap.',
  },
  {
    id: 4,
    title: 'Rehydration (Deplasmolysis)',
    startSec: 50,
    endSec: 65,
    startM: 0.88,
    endM: 0.02,
    oCaption:
      'Returning a plasmolysed plant cell to pure water reverses the process! Water rushes back in, the vacuole refills, and the cell regains turgor support without bursting.',
    aCaption:
      'Re-immersion in hypotonic water reverses the water potential gradient (deplasmolysis). Endosmosis restores protoplast volume and positive turgor pressure (Ψp > 0) for plant rigidity.',
  },
];

const OSMOSIS_CHALLENGES: OsmosisChallenge[] = [
  {
    id: 'make-turgid',
    title: '1. Achieve Maximum Turgor',
    prompt: 'Lower the external sucrose concentration so the plant cell swells into a fully turgid state (mass gain ≥ +14%).',
    hint: 'Slide concentration close to 0.00 M (Distilled Water) so water flows inward rapidly.',
    check: (m) => m.stateId === 'turgid' && m.massChangePct >= 14,
  },
  {
    id: 'find-isotonic',
    title: '2. Find the Isotonic Point',
    prompt: 'Tune the sucrose molarity to find where net water movement stops (mass change within ±1.5%), then plot the point.',
    hint: 'Watch the % Mass Change readout cross 0.0% near 0.30 M and click + Plot Point.',
    check: (m, plotted) =>
      Math.abs(m.massChangePct) <= 1.5 &&
      plotted.some((p) => Math.abs(p.massChangePct) <= 1.5),
  },
  {
    id: 'induce-plasmolysis',
    title: '3. Induce Full Plasmolysis',
    prompt: 'Raise external sucrose concentration until the cell membrane visibly pulls away from the rigid cell wall (≥ 0.70 M).',
    hint: 'Drag the concentration slider to 0.70 M or higher (or click Concentrated Sucrose).',
    check: (m) => m.stateId === 'plasmolysed' && m.concentrationM >= 0.7,
  },
];

function computeOsmosisMetrics(concentrationM: number): OsmosisMetrics {
  const c = Math.max(0, Math.min(1, concentrationM));
  // External water potential: Ψ_ext = -2470 * C (approx van 't Hoff at 25°C for sucrose)
  const waterPotentialExtKPa = Math.round(-2470 * c);
  const baseSapSoluteKPa = -740; // ~0.30 M sucrose equivalent

  let stateId: OsmosisStateId = 'flaccid';
  let stateLabel = 'Flaccid (Isotonic)';
  let solutionType: OsmosisMetrics['solutionType'] = 'Isotonic';
  let waterDirection: OsmosisMetrics['waterDirection'] = 'Dynamic equilibrium';

  if (c < ISOTONIC_M - 0.04) {
    stateId = 'turgid';
    stateLabel = c < 0.08 ? 'Fully Turgid' : 'Turgid';
    solutionType = 'Hypotonic';
    waterDirection = 'Net inflow (Endosmosis)';
  } else if (c > ISOTONIC_M + 0.04) {
    stateId = 'plasmolysed';
    stateLabel = c > 0.65 ? 'Severely Plasmolysed' : 'Plasmolysed';
    solutionType = 'Hypertonic';
    waterDirection = 'Net outflow (Exosmosis)';
  }

  // Smooth NECTA potato-strip % change in mass curve:
  // +18% at 0.00 M, 0% at 0.30 M, -22% at 1.00 M (saturating slightly at high hypertonic molarity)
  let massChangePct: number;
  if (c <= ISOTONIC_M) {
    const ratio = (ISOTONIC_M - c) / ISOTONIC_M; // 0..1
    massChangePct = 18 * Math.pow(ratio, 0.85);
  } else {
    const ratio = (c - ISOTONIC_M) / (1 - ISOTONIC_M); // 0..1
    massChangePct = -22 * Math.pow(ratio, 0.78);
  }

  // Turgor pressure Ψp (positive when hypotonic, 0 once flaccid/plasmolysed)
  const turgorKPa =
    c < ISOTONIC_M ? Math.round(((ISOTONIC_M - c) / ISOTONIC_M) * 740) : 0;

  // Cell sap concentrates as water leaves during plasmolysis
  const solutePotentialCellKPa =
    c <= ISOTONIC_M
      ? baseSapSoluteKPa
      : Math.round(baseSapSoluteKPa - (c - ISOTONIC_M) * 2470);

  const waterPotentialCellKPa = solutePotentialCellKPa + turgorKPa;

  // Visual geometry morphing factors
  const vacuoleFillPct = Math.round(
    c <= ISOTONIC_M
      ? 56 + ((ISOTONIC_M - c) / ISOTONIC_M) * 32
      : 56 - Math.pow((c - ISOTONIC_M) / (1 - ISOTONIC_M), 0.78) * 32
  );

  const membraneRetraction =
    c <= ISOTONIC_M
      ? 0
      : Math.min(1, Math.pow((c - ISOTONIC_M) / (1 - ISOTONIC_M), 0.76));

  const wallBulge = c < ISOTONIC_M ? (ISOTONIC_M - c) / ISOTONIC_M : 0;

  return {
    concentrationM: c,
    stateId,
    stateLabel,
    solutionType,
    waterDirection,
    vacuoleFillPct,
    massChangePct: Number(massChangePct.toFixed(1)),
    turgorKPa,
    solutePotentialCellKPa,
    waterPotentialCellKPa,
    waterPotentialExtKPa,
    membraneRetraction,
    wallBulge,
  };
}

function formatLessonTime(sec: number): string {
  const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, Math.floor(sec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getLessonChapter(sec: number): OsmosisLessonChapter {
  for (const ch of OSMOSIS_LESSON_CHAPTERS) {
    if (sec < ch.endSec) return ch;
  }
  return OSMOSIS_LESSON_CHAPTERS[OSMOSIS_LESSON_CHAPTERS.length - 1];
}

function computeMolarityForLessonTime(sec: number): number {
  const ch = getLessonChapter(sec);
  const local = Math.max(
    0,
    Math.min(1, (sec - ch.startSec) / Math.max(0.01, ch.endSec - ch.startSec))
  );
  const eased = local * local * (3 - 2 * local);
  return Number((ch.startM + (ch.endM - ch.startM) * eased).toFixed(3));
}

// Reusable scratch variables (zero per-frame allocations)
const _vProj = new THREE.Vector3();
const _vPos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

/**
 * Generates a rounded hexagonal THREE.Shape centered at (0,0) in XY plane
 */
function createRoundedHexShape(rx: number, ry: number): THREE.Shape {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    pts.push(new THREE.Vector2(Math.cos(angle) * rx, Math.sin(angle) * ry));
  }
  const shape = new THREE.Shape();
  const cornerBlend = 0.22;
  for (let i = 0; i < 6; i++) {
    const prev = pts[(i + 5) % 6];
    const curr = pts[i];
    const next = pts[(i + 1) % 6];
    const startX = curr.x + (prev.x - curr.x) * cornerBlend;
    const startY = curr.y + (prev.y - curr.y) * cornerBlend;
    const endX = curr.x + (next.x - curr.x) * cornerBlend;
    const endY = curr.y + (next.y - curr.y) * cornerBlend;
    if (i === 0) {
      shape.moveTo(startX, startY);
    } else {
      shape.lineTo(startX, startY);
    }
    shape.quadraticCurveTo(curr.x, curr.y, endX, endY);
  }
  shape.closePath();
  return shape;
}

/**
 * Fresnel biological membrane shader (luminous semi-transparent rim)
 */
function createBioFresnelMaterial(
  baseHex: number,
  rimHex: number,
  opacity: number,
  rimPower = 2.0
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: new THREE.Color(baseHex) },
      uRimColor: { value: new THREE.Color(rimHex) },
      uOpacity: { value: opacity },
      uRimPower: { value: rimPower },
      uLightDir: { value: new THREE.Vector3(0.45, 0.78, 0.52).normalize() },
    },
    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      varying vec3 vWorldNormal;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uBaseColor;
      uniform vec3 uRimColor;
      uniform float uOpacity;
      uniform float uRimPower;
      uniform vec3 uLightDir;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      varying vec3 vWorldNormal;
      void main() {
        float ndotv = abs(dot(normalize(vNormalView), normalize(vViewDir)));
        float fresnel = pow(1.0 - ndotv, uRimPower);
        float diff = max(dot(normalize(vWorldNormal), uLightDir), 0.0) * 0.48 + 0.52;
        vec3 col = mix(uBaseColor * diff, uRimColor, fresnel * 0.85);
        float alpha = clamp(uOpacity * (0.42 + fresnel * 1.15), 0.0, 0.9);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}

/**
 * Procedural soft radial contact shadow texture
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 16, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const Osmosis3DSimulation: React.FC<Osmosis3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 2',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Interactive simulation state
  const [concentrationM, setConcentrationM] = useState<number>(0.0); // Launch in vivid Turgid pure water state!
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [level, setLevel] = useState<SyllabusLevel>(() =>
    activeClass.includes('5') || activeClass.includes('6') ? 'a_level' : 'o_level'
  );
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [plottedPoints, setPlottedPoints] = useState<OsmosisPlotPoint[]>([
    { molarity: 0.0, massChangePct: 18.0, stateId: 'turgid' },
  ]);

  // Challenge state
  const [challengeOpen, setChallengeOpen] = useState<boolean>(false);
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});

  // Guided 1:05 Lesson state
  const [watchLessonActive, setWatchLessonActive] = useState<boolean>(false);
  const [lessonTime, setLessonTime] = useState<number>(0);
  const [lessonPaused, setLessonPaused] = useState<boolean>(false);
  const [lessonSpeed, setLessonSpeed] = useState<0.75 | 1 | 1.5>(1);

  const metrics = useMemo(() => computeOsmosisMetrics(concentrationM), [concentrationM]);
  const activeLessonChapter = useMemo(() => getLessonChapter(lessonTime), [lessonTime]);

  // Stable refs for Three.js loop
  const targetMolarityRef = useRef<number>(concentrationM);
  const smoothMolarityRef = useRef<number>(concentrationM);
  const showLabelsRef = useRef<boolean>(showLabels);
  const darkModeRef = useRef<boolean>(darkMode);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonTimeRef = useRef<number>(0);
  const lessonPausedRef = useRef<boolean>(false);
  const lessonSpeedRef = useRef<number>(1);
  const lastLabelPushRef = useRef<number>(0);

  useEffect(() => {
    targetMolarityRef.current = concentrationM;
  }, [concentrationM]);

  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);

  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

  useEffect(() => {
    watchLessonRef.current = watchLessonActive;
  }, [watchLessonActive]);

  useEffect(() => {
    lessonPausedRef.current = lessonPaused;
  }, [lessonPaused]);

  useEffect(() => {
    lessonSpeedRef.current = lessonSpeed;
  }, [lessonSpeed]);

  // Auto-evaluate challenges whenever metrics or plottedPoints change
  useEffect(() => {
    setCompletedChallenges((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const ch of OSMOSIS_CHALLENGES) {
        if (!next[ch.id] && ch.check(metrics, plottedPoints)) {
          next[ch.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [metrics, plottedPoints]);

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

  // Main Three.js WebGL Scene
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
    const bgDark = new THREE.Color(0x131823);
    const bgLight = new THREE.Color(0xedf4f8);
    scene.background = darkModeRef.current ? bgDark.clone() : bgLight.clone();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 7.6, 8.2);

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

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Balanced 3-point warm/cool scientific lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.25);
    keyLight.position.set(5.5, 9.0, 5.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.05);
    rimLight.position.set(-6.0, 4.0, -5.5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 6.0;
    controls.maxDistance = 17.0;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.1, 0);

    // Root composite 3D plant cell cross-section
    const plantCellRoot = new THREE.Group();
    scene.add(plantCellRoot);

    // Soft radial contact shadow plane beneath the cell
    const shadowTex = createContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(8.8, 7.6);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.92;
    plantCellRoot.add(shadowPlane);

    // ==================== 1. RIGID CELLULOSE CELL WALL (Hexagonal Frame + Base) ====================
    const outerHex = createRoundedHexShape(3.05, 2.48);
    const innerHolePath = createRoundedHexShape(2.58, 2.04);
    outerHex.holes.push(innerHolePath);

    const wallGeo = new THREE.ExtrudeGeometry(outerHex, {
      depth: 1.38,
      bevelEnabled: true,
      bevelThickness: 0.11,
      bevelSize: 0.09,
      bevelSegments: 4,
      curveSegments: 16,
    });
    wallGeo.rotateX(Math.PI / 2);
    wallGeo.translate(0, 0.69, 0);

    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0x2e8b57,
      roughness: 0.38,
      metalness: 0.04,
      clearcoat: 0.45,
      clearcoatRoughness: 0.28,
      transparent: true,
      opacity: 0.88,
    });
    const cellWallMesh = new THREE.Mesh(wallGeo, wallMat);
    cellWallMesh.castShadow = !isSoftwareGl;
    cellWallMesh.receiveShadow = !isSoftwareGl;
    cellWallMesh.userData.interactiveCell = true;
    plantCellRoot.add(cellWallMesh);

    // Translucent bottom cellulose floor plate so the cross-section holds liquid cleanly
    const floorShape = createRoundedHexShape(2.72, 2.18);
    const floorGeo = new THREE.ExtrudeGeometry(floorShape, {
      depth: 0.14,
      bevelEnabled: false,
      curveSegments: 14,
    });
    floorGeo.rotateX(Math.PI / 2);
    floorGeo.translate(0, -0.58, 0);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e5c3a,
      roughness: 0.62,
      metalness: 0.02,
      transparent: true,
      opacity: 0.42,
    });
    const cellFloorMesh = new THREE.Mesh(floorGeo, floorMat);
    cellFloorMesh.receiveShadow = !isSoftwareGl;
    plantCellRoot.add(cellFloorMesh);

    // Subtle adjacent-cell wall spurs at the 6 hexagonal vertices (like real plant parenchyma tissue!)
    const spurGeo = new THREE.BoxGeometry(0.46, 1.34, 0.22);
    const spurMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      const spur = new THREE.Mesh(spurGeo, wallMat);
      spur.position.set(Math.cos(ang) * 3.16, 0, Math.sin(ang) * 2.58);
      spur.rotation.y = -ang;
      plantCellRoot.add(spur);
      spurMeshes.push(spur);
    }

    // ==================== 2. AQUAPORIN WATER CHANNELS (6 Membrane Pores) ====================
    const poreGroup = new THREE.Group();
    const poreGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.36, 14);
    const poreMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.28,
      metalness: 0.15,
    });
    const poreAngles = [Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6, (7 * Math.PI) / 6, (3 * Math.PI) / 2, (11 * Math.PI) / 6];
    poreAngles.forEach((ang) => {
      const pore = new THREE.Mesh(poreGeo, poreMat);
      pore.position.set(Math.cos(ang) * 2.68, 0.14, Math.sin(ang) * 2.12);
      pore.rotation.z = Math.PI / 2;
      pore.rotation.y = -ang;
      poreGroup.add(pore);
    });
    plantCellRoot.add(poreGroup);

    // ==================== 3. MORPHABLE SELECTIVELY PERMEABLE PLASMA MEMBRANE ====================
    // Built from a sphere sculpted into a smooth hexagonal cushion that pulls away from the cell wall during plasmolysis!
    const membraneGeo = new THREE.SphereGeometry(1, 52, 32);
    const memPosAttr = membraneGeo.attributes.position as THREE.BufferAttribute;
    const memUnitDirs = new Float32Array(memPosAttr.count * 3);
    for (let i = 0; i < memPosAttr.count; i++) {
      const ux = memPosAttr.getX(i);
      const uy = memPosAttr.getY(i);
      const uz = memPosAttr.getZ(i);
      memUnitDirs[i * 3] = ux;
      memUnitDirs[i * 3 + 1] = uy;
      memUnitDirs[i * 3 + 2] = uz;
    }

    const membraneMat = createBioFresnelMaterial(0x6ee7b7, 0xd1fae5, 0.56, 1.9);
    const plasmaMembraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
    plasmaMembraneMesh.renderOrder = 16;
    plasmaMembraneMesh.userData.interactiveCell = true;
    plantCellRoot.add(plasmaMembraneMesh);

    // Thin glowing membrane rim ring along the top cut-edge so retraction gap is unmistakably clear!
    const rimRingPoints = 72;
    const rimRingPositions = new Float32Array((rimRingPoints + 1) * 3);
    const rimRingGeo = new THREE.BufferGeometry();
    rimRingGeo.setAttribute('position', new THREE.BufferAttribute(rimRingPositions, 3));
    const rimRingMat = new THREE.LineBasicMaterial({
      color: 0xa7f3d0,
      transparent: true,
      opacity: 0.92,
    });
    const membraneTopRim = new THREE.Line(rimRingGeo, rimRingMat);
    membraneTopRim.renderOrder = 18;
    plantCellRoot.add(membraneTopRim);

    // ==================== 4. LARGE CENTRAL VACUOLE (TONOPLAST + CELL SAP) ====================
    const vacuoleGeo = new THREE.SphereGeometry(1, 48, 32);
    const vacPosAttr = vacuoleGeo.attributes.position as THREE.BufferAttribute;
    const vacUnitDirs = new Float32Array(vacPosAttr.count * 3);
    for (let i = 0; i < vacPosAttr.count; i++) {
      vacUnitDirs[i * 3] = vacPosAttr.getX(i);
      vacUnitDirs[i * 3 + 1] = vacPosAttr.getY(i);
      vacUnitDirs[i * 3 + 2] = vacPosAttr.getZ(i);
    }

    const vacuoleMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.22,
      roughness: 0.16,
      metalness: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.78,
    });
    const vacuoleMesh = new THREE.Mesh(vacuoleGeo, vacuoleMat);
    vacuoleMesh.renderOrder = 12;
    vacuoleMesh.userData.interactiveCell = true;
    plantCellRoot.add(vacuoleMesh);

    // ==================== 5. NUCLEUS & NUCLEOLUS ====================
    const nucleusGroup = new THREE.Group();
    const nucleusGeo = new THREE.SphereGeometry(0.46, 28, 22);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.34,
      metalness: 0.08,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleusMesh.castShadow = !isSoftwareGl;
    nucleusGroup.add(nucleusMesh);

    const nucleolusGeo = new THREE.SphereGeometry(0.18, 18, 14);
    const nucleolusMat = new THREE.MeshStandardMaterial({
      color: 0x4c1d95,
      roughness: 0.25,
      metalness: 0.1,
    });
    const nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    nucleolusMesh.position.set(0.14, 0.18, 0.12);
    nucleusGroup.add(nucleolusMesh);
    plantCellRoot.add(nucleusGroup);

    // ==================== 6. CHLOROPLASTS (10 Lens-Shaped Organelles) ====================
    interface ChloroplastSpec {
      angle: number;
      radialFactor: number;
      yOffset: number;
      tilt: number;
    }
    const CHLOROPLAST_SPECS: ChloroplastSpec[] = [
      { angle: 0.15, radialFactor: 0.86, yOffset: 0.12, tilt: 0.2 },
      { angle: 0.72, radialFactor: 0.88, yOffset: -0.05, tilt: -0.3 },
      { angle: 1.32, radialFactor: 0.86, yOffset: 0.18, tilt: 0.15 },
      { angle: 1.88, radialFactor: 0.87, yOffset: -0.08, tilt: 0.4 },
      { angle: 2.85, radialFactor: 0.85, yOffset: 0.15, tilt: -0.25 },
      { angle: 3.45, radialFactor: 0.88, yOffset: -0.04, tilt: 0.2 },
      { angle: 4.10, radialFactor: 0.86, yOffset: 0.14, tilt: -0.35 },
      { angle: 4.72, radialFactor: 0.88, yOffset: -0.06, tilt: 0.12 },
      { angle: 5.28, radialFactor: 0.86, yOffset: 0.16, tilt: -0.2 },
      { angle: 5.82, radialFactor: 0.87, yOffset: -0.08, tilt: 0.28 },
    ];

    const chloroplastGeo = new THREE.SphereGeometry(0.24, 18, 14);
    chloroplastGeo.scale(1.38, 0.56, 0.88);
    const chloroplastMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x14532d,
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.05,
    });
    const chloroplastMeshes: THREE.Mesh[] = CHLOROPLAST_SPECS.map((spec) => {
      const m = new THREE.Mesh(chloroplastGeo, chloroplastMat);
      m.castShadow = !isSoftwareGl;
      m.rotation.z = spec.tilt;
      plantCellRoot.add(m);
      return m;
    });

    // ==================== 7. MITOCHONDRIA (4 Small Organelles) ====================
    const mitoGeo = new THREE.CapsuleGeometry(0.085, 0.18, 8, 12);
    const mitoMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.42,
      metalness: 0.06,
    });
    const mitoAngles = [0.45, 2.25, 3.85, 5.55];
    const mitoMeshes = mitoAngles.map((ang) => {
      const m = new THREE.Mesh(mitoGeo, mitoMat);
      m.rotation.z = Math.PI / 2;
      m.rotation.y = ang;
      plantCellRoot.add(m);
      return m;
    });

    // ==================== 8. ANIMATED WATER MOLECULES (72 Instanced H2O) ====================
    const WATER_COUNT = 72;
    const waterGeo = new THREE.SphereGeometry(0.068, 12, 10);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.55,
      roughness: 0.18,
      metalness: 0.1,
    });
    const waterInstanced = new THREE.InstancedMesh(waterGeo, waterMat, WATER_COUNT);
    waterInstanced.frustumCulled = false;
    waterInstanced.renderOrder = 19;
    plantCellRoot.add(waterInstanced);

    interface WaterParticle {
      poreIndex: number;
      phase: number; // 0..1 radial journey
      speed: number;
      spreadAngle: number;
      yJitter: number;
      directionSign: 1 | -1; // used for balanced bidirectional exchange at isotonic
    }
    const waterParticles: WaterParticle[] = Array.from({ length: WATER_COUNT }, (_, i) => ({
      poreIndex: i % 6,
      phase: (i * 0.137) % 1,
      speed: 0.24 + (i % 5) * 0.045,
      spreadAngle: ((i % 7) - 3) * 0.09,
      yJitter: ((i % 5) - 2) * 0.14,
      directionSign: i % 2 === 0 ? 1 : -1,
    }));

    // ==================== 9. EXTERNAL SUCROSE SOLUTE PARTICLES (64 Instanced Sugar) ====================
    const SOLUTE_COUNT = 64;
    const soluteGeo = new THREE.DodecahedronGeometry(0.095, 0);
    const soluteMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.25,
      roughness: 0.36,
      metalness: 0.08,
    });
    const soluteInstanced = new THREE.InstancedMesh(soluteGeo, soluteMat, SOLUTE_COUNT);
    soluteInstanced.frustumCulled = false;
    soluteInstanced.renderOrder = 15;
    plantCellRoot.add(soluteInstanced);

    interface SoluteParticle {
      angle: number;
      orbitSpeed: number;
      baseRadius: number; // 1.0 = outside wall, < 1.0 = inside apoplastic gap during plasmolysis
      entersGap: boolean;
      yPos: number;
      spinSpeed: number;
    }
    const soluteParticles: SoluteParticle[] = Array.from({ length: SOLUTE_COUNT }, (_, i) => ({
      angle: (i / SOLUTE_COUNT) * Math.PI * 2 + (i % 3) * 0.2,
      orbitSpeed: (i % 2 === 0 ? 1 : -1) * (0.12 + (i % 4) * 0.04),
      baseRadius: 1.08 + ((i * 19) % 10) * 0.065,
      entersGap: i % 4 === 0, // 25% drift inside the cell-wall gap when membrane retracts!
      yPos: ((i % 7) - 3) * 0.16,
      spinSpeed: 0.5 + (i % 5) * 0.25,
    }));

    // ==================== CLICK-ON-CELL INTERACTION (Raycasting) ====================
    let pointerDownPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore orbit drags
      const rect = renderer.domElement.getBoundingClientRect();
      _ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_ndc, camera);
      const hits = _raycaster.intersectObjects([vacuoleMesh, plasmaMembraneMesh, cellWallMesh], false);
      if (hits.length > 0) {
        setWatchLessonActive(false);
        setConcentrationM((prev) => {
          if (prev < 0.15) return 0.30; // Turgid -> Isotonic
          if (prev < 0.55) return 0.80; // Isotonic -> Plasmolysed
          return 0.0; // Plasmolysed -> Distilled Water (Turgid)
        });
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Helper for hexagonal boundary radius at any angle
    function hexRadiusScale(angle: number): number {
      // Smooth hexagonal modulation (flat sides at multiples of 60 deg)
      return 1.0 - 0.06 * Math.cos(6 * angle);
    }

    const activeLabelAnchors: LabelSpec[] = [];

    function updateOsmosisScene(cMolar: number, elapsed: number) {
      const isDark = darkModeRef.current;
      scene.background = isDark ? bgDark : bgLight;
      shadowPlaneMat.opacity = isDark ? 0.52 : 0.34;

      const m = computeOsmosisMetrics(cMolar);
      const retract = m.membraneRetraction; // 0 (turgid/flaccid) -> 1 (deep plasmolysis)
      const bulge = m.wallBulge; // 0..1 when turgid

      // 1. Subtle elastic outward bow on rigid cell wall at high turgor (never bursts!)
      const wallScaleX = 1.0 + bulge * 0.032;
      const wallScaleZ = 1.0 + bulge * 0.032;
      cellWallMesh.scale.set(wallScaleX, 1.0 + bulge * 0.02, wallScaleZ);
      cellFloorMesh.scale.set(wallScaleX, 1, wallScaleZ);

      // 2. Morph Selectively Permeable Plasma Membrane (retracting inward with concave scalloped walls in plasmolysis!)
      const memRx = (2.52 + bulge * 0.08) * (1 - retract * 0.38);
      const memRz = (1.98 + bulge * 0.06) * (1 - retract * 0.38);
      const memRy = (0.64 + bulge * 0.05) * (1 - retract * 0.22);

      for (let i = 0; i < memPosAttr.count; i++) {
        const ux = memUnitDirs[i * 3];
        const uy = memUnitDirs[i * 3 + 1];
        const uz = memUnitDirs[i * 3 + 2];
        const ang = Math.atan2(uz, ux);
        const hexMod = hexRadiusScale(ang);
        // Concave plasmolysis pinch along the 6 flat sides while corners stay loosely tethered!
        const concavePinch = 1.0 - retract * 0.14 * Math.pow(Math.sin(3 * ang), 2);
        // Slight organic breathing ripple
        const ripple = 1.0 + Math.sin(elapsed * 2.0 + ang * 3.0) * 0.008;
        // Flatten top/bottom slightly like a cross-section cushion
        const flatY = Math.sign(uy) * Math.pow(Math.abs(uy), 0.72);
        const rScale = hexMod * concavePinch * ripple;

        memPosAttr.setXYZ(
          i,
          ux * memRx * rScale,
          flatY * memRy,
          uz * memRz * rScale
        );
      }
      memPosAttr.needsUpdate = true;
      membraneGeo.computeVertexNormals();

      // Update top rim line of plasma membrane so retraction gap stands out clearly
      for (let i = 0; i <= rimRingPoints; i++) {
        const ang = (i / rimRingPoints) * Math.PI * 2;
        const hexMod = hexRadiusScale(ang);
        const concavePinch = 1.0 - retract * 0.14 * Math.pow(Math.sin(3 * ang), 2);
        const rScale = hexMod * concavePinch * 0.96;
        rimRingPositions[i * 3] = Math.cos(ang) * memRx * rScale;
        rimRingPositions[i * 3 + 1] = memRy * 0.56;
        rimRingPositions[i * 3 + 2] = Math.sin(ang) * memRz * rScale;
      }
      (rimRingGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Membrane tint shifts subtly from crisp vibrant emerald-mint (turgid) to paler sage-amber (plasmolysed)
      membraneMat.uniforms.uBaseColor.value.setHex(
        retract > 0.35 ? 0x94a3b8 : isDark ? 0x34d399 : 0x10b981
      );
      membraneMat.uniforms.uRimColor.value.setHex(
        retract > 0.35 ? 0xfde68a : 0xa7f3d0
      );
      rimRingMat.color.setHex(retract > 0.35 ? 0xfbbf24 : isDark ? 0x6ee7b7 : 0x059669);

      // 3. Morph Large Central Vacuole (swells hugely when turgid, shrinks dramatically when plasmolysed!)
      const vacScaleFactor = 0.34 + (m.vacuoleFillPct / 100) * 0.68; // ~0.50 -> ~0.94
      const vacRx = 1.92 * vacScaleFactor;
      const vacRz = 1.38 * vacScaleFactor;
      const vacRy = 0.52 * (0.62 + vacScaleFactor * 0.45);
      const vacShiftX = 0.24 * (1 - retract * 0.45);

      for (let i = 0; i < vacPosAttr.count; i++) {
        const ux = vacUnitDirs[i * 3];
        const uy = vacUnitDirs[i * 3 + 1];
        const uz = vacUnitDirs[i * 3 + 2];
        const ang = Math.atan2(uz, ux);
        const wrinkle =
          1.0 +
          Math.sin(elapsed * 2.2 + ang * 4.0) * (0.012 + retract * 0.025) +
          Math.cos(uy * 5.0 + elapsed * 1.5) * (0.01 + retract * 0.02);
        const flatY = Math.sign(uy) * Math.pow(Math.abs(uy), 0.78);

        vacPosAttr.setXYZ(
          i,
          ux * vacRx * wrinkle + vacShiftX,
          flatY * vacRy + 0.04,
          uz * vacRz * wrinkle
        );
      }
      vacPosAttr.needsUpdate = true;
      vacuoleGeo.computeVertexNormals();

      // Vacuole color deepens slightly as cell sap becomes more concentrated during exosmosis
      vacuoleMat.color.setHex(retract > 0.45 ? 0x0284c7 : bulge > 0.4 ? 0x38bdf8 : 0x0ea5e9);
      vacuoleMat.opacity = 0.72 + bulge * 0.14;

      // 4. Nucleus moves inward with shrinking protoplast
      const nucX = -1.62 * (1 - retract * 0.42);
      const nucZ = -0.35 * (1 - retract * 0.35);
      nucleusGroup.position.set(nucX, 0.12 + Math.sin(elapsed * 1.3) * 0.025, nucZ);
      nucleusGroup.rotation.y = elapsed * 0.18;

      // 5. Chloroplasts press tightly against membrane rim and pull inward during plasmolysis
      CHLOROPLAST_SPECS.forEach((spec, idx) => {
        const mesh = chloroplastMeshes[idx];
        const hexMod = hexRadiusScale(spec.angle);
        const concavePinch = 1.0 - retract * 0.12 * Math.pow(Math.sin(3 * spec.angle), 2);
        const rx = memRx * spec.radialFactor * hexMod * concavePinch * 0.84;
        const rz = memRz * spec.radialFactor * hexMod * concavePinch * 0.84;
        const drift = Math.sin(elapsed * 0.9 + idx * 1.3) * 0.03;
        mesh.position.set(
          Math.cos(spec.angle + drift) * rx,
          spec.yOffset + Math.cos(elapsed * 1.4 + idx) * 0.025,
          Math.sin(spec.angle + drift) * rz
        );
        mesh.rotation.y = -spec.angle + Math.PI / 2;
      });

      // 6. Mitochondria sit neatly in cytoplasmic rim
      mitoMeshes.forEach((mesh, idx) => {
        const ang = mitoAngles[idx];
        const rx = memRx * 0.74;
        const rz = memRz * 0.74;
        mesh.position.set(
          Math.cos(ang) * rx,
          -0.12 + Math.sin(elapsed * 1.6 + idx) * 0.02,
          Math.sin(ang) * rz
        );
      });

      // 7. Animate 72 H2O Water Molecules crossing the Aquaporins!
      // Net flux direction: +1 = Inward (Hypotonic), 0 = Bidirectional Equilibrium (Isotonic), -1 = Outward (Hypertonic)
      const gradient = ISOTONIC_M - cMolar; // +0.30 (hypotonic) .. 0 (isotonic) .. -0.70 (hypertonic)
      const isBalanced = Math.abs(gradient) <= 0.04;
      const fluxStrength = Math.min(1, Math.abs(gradient) / 0.35);

      for (let i = 0; i < WATER_COUNT; i++) {
        const p = waterParticles[i];
        const baseAngle = poreAngles[p.poreIndex] + p.spreadAngle;
        const speedMult = isBalanced ? 0.55 : 0.75 + fluxStrength * 1.25;
        const travel = (p.phase + elapsed * p.speed * speedMult) % 1;

        let radialNorm: number;
        if (isBalanced) {
          // Half move inward, half move outward at equal gentle speed
          radialNorm = p.directionSign === 1 ? 1.55 - travel * 0.95 : 0.6 + travel * 0.95;
        } else if (gradient > 0) {
          // Endosmosis: outside (1.65) -> across membrane -> into vacuole (0.45)
          radialNorm = 1.65 - travel * 1.2;
        } else {
          // Exosmosis: inside vacuole (0.45) -> across membrane -> outside bath (1.68)
          radialNorm = 0.45 + travel * 1.23;
        }

        const px = Math.cos(baseAngle) * 2.65 * radialNorm;
        const pz = Math.sin(baseAngle) * 2.1 * radialNorm;
        const py = p.yJitter + Math.sin(travel * Math.PI) * 0.22;

        // Smooth fade-in/out scale at endpoints of journey
        const edgeFade = Math.sin(travel * Math.PI);
        const s = 0.45 + edgeFade * 0.72;

        _vPos.set(px, py, pz);
        _quat.identity();
        _scale.setScalar(s);
        _mat4.compose(_vPos, _quat, _scale);
        waterInstanced.setMatrixAt(i, _mat4);
      }
      waterInstanced.instanceMatrix.needsUpdate = true;

      // 8. Animate 64 External Sucrose Solute Molecules (density scales directly with concentrationM!)
      const activeSoluteCount = Math.round(cMolar * SOLUTE_COUNT);
      for (let i = 0; i < SOLUTE_COUNT; i++) {
        if (i >= activeSoluteCount) {
          _vPos.set(0, -50, 0);
          _quat.identity();
          _scale.setScalar(0.0001);
          _mat4.compose(_vPos, _quat, _scale);
          soluteInstanced.setMatrixAt(i, _mat4);
          continue;
        }

        const sp = soluteParticles[i];
        const ang = sp.angle + elapsed * sp.orbitSpeed;
        let rx: number;
        let rz: number;

        // During plasmolysis, sucrose crosses the fully permeable cell wall and fills the gap outside the retracted plasma membrane!
        if (sp.entersGap && retract > 0.22) {
          const wallInnerX = 2.48;
          const wallInnerZ = 1.94;
          const midFactor = 0.55;
          rx = THREE.MathUtils.lerp(memRx * 1.06, wallInnerX * 0.94, midFactor);
          rz = THREE.MathUtils.lerp(memRz * 1.06, wallInnerZ * 0.94, midFactor);
        } else {
          rx = 3.25 * sp.baseRadius;
          rz = 2.65 * sp.baseRadius;
        }

        const bob = Math.sin(elapsed * 1.5 + i) * 0.1;
        _vPos.set(Math.cos(ang) * rx, sp.yPos + bob, Math.sin(ang) * rz);
        _euler.set(elapsed * sp.spinSpeed, elapsed * sp.spinSpeed * 0.7, 0);
        _quat.setFromEuler(_euler);
        _scale.setScalar(0.95);
        _mat4.compose(_vPos, _quat, _scale);
        soluteInstanced.setMatrixAt(i, _mat4);
      }
      soluteInstanced.instanceMatrix.needsUpdate = true;

      // 9. Build Live 3D Anchor Specs for Callout Labels
      activeLabelAnchors.length = 0;
      activeLabelAnchors.push(
        {
          id: 'wall',
          text: 'Cellulose cell wall (rigid)',
          worldPos: new THREE.Vector3(2.85, 0.72, -1.1),
          offsetX: 88,
          offsetY: -44,
        },
        {
          id: 'vacuole',
          text:
            m.stateId === 'turgid'
              ? 'Central vacuole (swollen)'
              : m.stateId === 'plasmolysed'
              ? 'Shrunken vacuole'
              : 'Central vacuole',
          worldPos: new THREE.Vector3(vacShiftX + 0.15, vacRy + 0.08, 0.15),
          offsetX: 68,
          offsetY: -52,
        },
        {
          id: 'nucleus',
          text: 'Nucleus',
          worldPos: new THREE.Vector3(nucX, 0.42, nucZ),
          offsetX: -85,
          offsetY: -46,
        },
        {
          id: 'chloroplast',
          text: 'Chloroplasts',
          worldPos: chloroplastMeshes[7].position.clone(),
          offsetX: -90,
          offsetY: 48,
        }
      );

      if (retract > 0.25) {
        activeLabelAnchors.push(
          {
            id: 'membrane',
            text: 'Retracted cell membrane',
            worldPos: new THREE.Vector3(memRx * 0.85, 0.42, memRz * 0.48),
            offsetX: 98,
            offsetY: 36,
          },
          {
            id: 'gap',
            text: 'Sucrose solution in gap',
            worldPos: new THREE.Vector3(2.35, 0.15, 0.95),
            offsetX: 96,
            offsetY: 68,
          }
        );
      } else {
        activeLabelAnchors.push({
          id: 'water',
          text:
            m.stateId === 'turgid'
              ? 'H₂O entering (Endosmosis)'
              : 'Equal H₂O exchange',
          worldPos: new THREE.Vector3(3.15, 0.2, 1.45),
          offsetX: 92,
          offsetY: 42,
        });
      }
    }

    function computeProjectedLabels(): ProjectedLabel[] {
      if (!showLabelsRef.current) return [];
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      if (w <= 0 || h <= 0) return [];
      const out: ProjectedLabel[] = [];
      for (const spec of activeLabelAnchors) {
        _vProj.copy(spec.worldPos);
        _vProj.project(camera);
        if (_vProj.z > 1) continue;
        const ax = (_vProj.x * 0.5 + 0.5) * w;
        const ay = (-_vProj.y * 0.5 + 0.5) * h;
        const lx = Math.max(88, Math.min(w - 88, ax + spec.offsetX));
        const ly = Math.max(28, Math.min(h - 28, ay + spec.offsetY));
        out.push({ id: spec.id, text: spec.text, ax, ay, lx, ly });
      }
      return out;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!mountEl) return;
      const nw = Math.max(mountEl.clientWidth, 280);
      const nh = Math.max(mountEl.clientHeight, 320);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObserver.observe(mountEl);

    updateOsmosisScene(smoothMolarityRef.current, 0);
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

      if (watchLessonRef.current && !lessonPausedRef.current) {
        const nextSec = lessonTimeRef.current + delta * lessonSpeedRef.current;
        if (nextSec >= LESSON_DURATION_SEC) {
          lessonTimeRef.current = LESSON_DURATION_SEC;
          setLessonTime(LESSON_DURATION_SEC);
          lessonPausedRef.current = true;
          setLessonPaused(true);
          const finalM = computeMolarityForLessonTime(LESSON_DURATION_SEC);
          targetMolarityRef.current = finalM;
          setConcentrationM(finalM);
        } else {
          lessonTimeRef.current = nextSec;
          setLessonTime(nextSec);
          const mappedM = computeMolarityForLessonTime(nextSec);
          targetMolarityRef.current = mappedM;
          setConcentrationM(mappedM);
        }
      }

      smoothMolarityRef.current = THREE.MathUtils.damp(
        smoothMolarityRef.current,
        targetMolarityRef.current,
        5.5,
        delta
      );

      updateOsmosisScene(smoothMolarityRef.current, elapsed);
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
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      controls.dispose();

      shadowTex.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      spurGeo.dispose();
      poreGeo.dispose();
      poreMat.dispose();
      membraneGeo.dispose();
      membraneMat.dispose();
      rimRingGeo.dispose();
      rimRingMat.dispose();
      vacuoleGeo.dispose();
      vacuoleMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      nucleolusGeo.dispose();
      nucleolusMat.dispose();
      chloroplastGeo.dispose();
      chloroplastMat.dispose();
      mitoGeo.dispose();
      mitoMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      soluteGeo.dispose();
      soluteMat.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

  // Handlers
  const handleSelectPreset = (m: number) => {
    setWatchLessonActive(false);
    setConcentrationM(m);
  };

  const handlePlotPoint = () => {
    setPlottedPoints((prev) => {
      const exists = prev.some((p) => Math.abs(p.molarity - metrics.concentrationM) < 0.03);
      if (exists) return prev;
      return [
        ...prev,
        {
          molarity: Number(metrics.concentrationM.toFixed(2)),
          massChangePct: metrics.massChangePct,
          stateId: metrics.stateId,
        },
      ].sort((a, b) => a.molarity - b.molarity);
    });
  };

  const handleReset = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setConcentrationM(0.0);
    setPlottedPoints([{ molarity: 0.0, massChangePct: 18.0, stateId: 'turgid' }]);
  };

  const handleWatchLesson = () => {
    if (watchLessonActive) {
      setWatchLessonActive(false);
      setLessonPaused(false);
      return;
    }
    lessonTimeRef.current = 0;
    setLessonTime(0);
    setLessonPaused(false);
    lessonPausedRef.current = false;
    setConcentrationM(0.0);
    targetMolarityRef.current = 0.0;
    setWatchLessonActive(true);
    setDockCollapsed(false);
  };

  const handleScrubLesson = (sec: number) => {
    const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, sec));
    lessonTimeRef.current = clamped;
    setLessonTime(clamped);
    const mappedM = computeMolarityForLessonTime(clamped);
    targetMolarityRef.current = mappedM;
    setConcentrationM(mappedM);
  };

  const handleCycleLessonSpeed = () => {
    setLessonSpeed((prev) => (prev === 0.75 ? 1 : prev === 1 ? 1.5 : 0.75));
  };

  const handleTakeOverFromLesson = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
  };

  // Live SVG curve path for % Change in Mass vs Sucrose Molarity (0.00 -> 1.00 M)
  const curveSvgPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const c = i / 40;
      const m = computeOsmosisMetrics(c);
      const x = 36 + c * 224;
      const y = 66 - (m.massChangePct / 24) * 50; // 0% at y=66
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  const currentDotX = 36 + metrics.concentrationM * 224;
  const currentDotY = 66 - (metrics.massChangePct / 24) * 50;

  const completedCount = Object.values(completedChallenges).filter(Boolean).length;

  const surfaceBg = darkMode ? 'bg-[#131823] text-slate-100' : 'bg-[#edf4f8] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#1b2232] border-white/[0.09] text-slate-100'
    : 'bg-slate-50 border-slate-200 text-slate-900';
  const dockBg = darkMode
    ? 'bg-[#111622]/95 border-white/[0.12] text-slate-100'
    : 'bg-white/95 border-slate-300 text-slate-900 shadow-lg';

  const stateAccent =
    metrics.stateId === 'turgid'
      ? darkMode
        ? 'text-cyan-300'
        : 'text-cyan-700'
      : metrics.stateId === 'plasmolysed'
      ? darkMode
        ? 'text-amber-300'
        : 'text-amber-700'
      : darkMode
      ? 'text-emerald-300'
      : 'text-emerald-700';

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
          darkMode ? 'bg-[#10141f] border-white/[0.08]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleWatchLesson}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              watchLessonActive
                ? 'bg-cyan-500 text-slate-950'
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
              Try Challenge ({completedCount}/{OSMOSIS_CHALLENGES.length})
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
          {OSMOSIS_CHALLENGES.map((ch) => {
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

      {/* MAIN CONTENT: 3D STAGE + SCIENTIFIC TELEMETRY & GRAPH */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D INTERACTIVE VIEWPORT */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[430px] sm:h-[520px] lg:h-[580px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* 3D Projected Callout Labels */}
          {showLabels && projectedLabels.length > 0 && (
            <svg className="pointer-events-none absolute inset-0 w-full h-full overflow-visible">
              {projectedLabels.map((lbl) => (
                <g key={lbl.id}>
                  <line
                    x1={lbl.ax}
                    y1={lbl.ay}
                    x2={lbl.lx}
                    y2={lbl.ly}
                    stroke={darkMode ? 'rgba(226,232,240,0.65)' : 'rgba(30,41,59,0.62)'}
                    strokeWidth="1.25"
                  />
                  <circle
                    cx={lbl.ax}
                    cy={lbl.ay}
                    r="2.8"
                    fill={darkMode ? '#f8fafc' : '#0f172a'}
                  />
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
                    ? 'bg-[#101521] border-white/[0.16] text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {lbl.text}
              </div>
            ))}

          {/* Guided Lesson Caption Banner */}
          {watchLessonActive && (
            <div className="pointer-events-none absolute top-4 inset-x-4 flex justify-center">
              <div
                className={`max-w-xl px-4 py-2.5 rounded-2xl border text-center ${
                  darkMode
                    ? 'bg-[#10141f] border-cyan-400/40 text-white'
                    : 'bg-white border-cyan-500/40 text-slate-900 shadow-md'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-500">
                  {activeLessonChapter.id} of {OSMOSIS_LESSON_CHAPTERS.length} ·{' '}
                  {activeLessonChapter.title}
                </div>
                <p className="text-xs sm:text-sm font-bold mt-0.5 leading-snug">
                  {level === 'o_level' ? activeLessonChapter.oCaption : activeLessonChapter.aCaption}
                </p>
              </div>
            </div>
          )}

          {/* Subtle Bottom Interaction Cue */}
          {!dockCollapsed && (
            <div className="pointer-events-none absolute bottom-2 inset-x-0 text-center">
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  darkMode ? 'text-slate-400 bg-[#131823]/85' : 'text-slate-600 bg-[#edf4f8]/90'
                }`}
              >
                Drag to orbit · Scroll to zoom · Click the cell to switch solution states
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SCIENTIFIC READOUT & LIVE OSMOSIS GRAPH PANEL */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-5 flex flex-col justify-between gap-4 overflow-y-auto ${
            darkMode ? 'bg-[#111622] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-4">
            {/* State Headline */}
            <div>
              <div
                className={`text-xs font-semibold ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {metrics.solutionType} bath · {metrics.concentrationM.toFixed(2)} M sucrose
              </div>
              <h2 className={`text-2xl font-black tracking-tight mt-0.5 ${stateAccent}`}>
                {metrics.stateLabel}
              </h2>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {metrics.stateId === 'turgid'
                  ? 'Water moves into the cell sap across the selectively permeable membrane. The central vacuole expands and builds outward turgor pressure against the rigid cellulose wall.'
                  : metrics.stateId === 'plasmolysed'
                  ? 'Water exits the vacuole into the concentrated external sucrose solution. The protoplast shrinks and the cell membrane pulls away from the rigid cellulose cell wall.'
                  : 'External sucrose concentration matches cell sap (~0.30 M). Water crosses equally in both directions so cell mass stays constant and turgor pressure drops to zero.'}
              </p>
            </div>

            {/* Key Quantitative Readouts */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className={`p-3 rounded-xl border ${cardBg}`}>
                <div className="text-[11px] font-semibold opacity-70">Mass Change</div>
                <div className="text-lg font-black font-mono tabular-nums mt-0.5">
                  {metrics.massChangePct > 0 ? '+' : ''}
                  {metrics.massChangePct.toFixed(1)}%
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${cardBg}`}>
                <div className="text-[11px] font-semibold opacity-70">Vacuole Volume</div>
                <div className="text-lg font-black font-mono tabular-nums mt-0.5">
                  {metrics.vacuoleFillPct}%
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${cardBg}`}>
                <div className="text-[11px] font-semibold opacity-70">Turgor Pressure (Ψp)</div>
                <div className="text-base font-black font-mono tabular-nums mt-0.5">
                  +{metrics.turgorKPa} kPa
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${cardBg}`}>
                <div className="text-[11px] font-semibold opacity-70">Net Water Flow</div>
                <div className="text-xs font-bold mt-1 leading-tight">{metrics.waterDirection}</div>
              </div>
            </div>

            {/* A-Level Water Potential Breakdown */}
            {level === 'a_level' && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 font-mono tabular-nums ${
                  darkMode
                    ? 'bg-sky-500/10 border-sky-400/25 text-sky-100'
                    : 'bg-sky-50 border-sky-200 text-sky-950'
                }`}
              >
                <div className="font-sans font-bold text-[11px] uppercase tracking-wide opacity-80">
                  Water Potential Equation: Ψ = Ψs + Ψp
                </div>
                <div className="flex justify-between">
                  <span>External Ψext:</span>
                  <span className="font-bold">{metrics.waterPotentialExtKPa} kPa</span>
                </div>
                <div className="flex justify-between">
                  <span>Cell Sap Ψs / Ψp:</span>
                  <span className="font-bold">
                    {metrics.solutePotentialCellKPa} / +{metrics.turgorKPa} kPa
                  </span>
                </div>
                <div className="flex justify-between border-t border-current/15 pt-1">
                  <span>Cell Ψcell:</span>
                  <span className="font-bold">{metrics.waterPotentialCellKPa} kPa</span>
                </div>
              </div>
            )}

            {/* Live NECTA % Mass Change vs Sucrose Concentration Graph */}
            <div className={`p-3 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">% Mass Change vs Sucrose (M)</span>
                <span className="text-[11px] font-mono opacity-75 tabular-nums">
                  {plottedPoints.length} pts
                </span>
              </div>

              <svg viewBox="0 0 280 132" className="w-full h-32 overflow-visible">
                {/* Zero mass-change reference line (Isotonic crossing) */}
                <line
                  x1="36"
                  y1="66"
                  x2="262"
                  y2="66"
                  stroke={darkMode ? 'rgba(148,163,184,0.35)' : 'rgba(100,116,139,0.4)'}
                  strokeDasharray="3 3"
                />
                {/* Axes */}
                <line
                  x1="36"
                  y1="14"
                  x2="36"
                  y2="116"
                  stroke={darkMode ? '#64748b' : '#475569'}
                  strokeWidth="1.2"
                />
                <line
                  x1="36"
                  y1="116"
                  x2="264"
                  y2="116"
                  stroke={darkMode ? '#64748b' : '#475569'}
                  strokeWidth="1.2"
                />

                {/* Theoretical smooth osmosis curve */}
                <path
                  d={curveSvgPath}
                  fill="none"
                  stroke={darkMode ? '#38bdf8' : '#0284c7'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Isotonic crossing marker at 0.30 M */}
                <circle
                  cx={36 + ISOTONIC_M * 224}
                  cy={66}
                  r="3.2"
                  fill="none"
                  stroke={darkMode ? '#34d399' : '#059669'}
                  strokeWidth="1.5"
                />

                {/* Student plotted experimental points */}
                {plottedPoints.map((pt, i) => {
                  const px = 36 + pt.molarity * 224;
                  const py = 66 - (pt.massChangePct / 24) * 50;
                  return (
                    <circle
                      key={`pt-${i}`}
                      cx={px}
                      cy={py}
                      r="3.5"
                      fill={darkMode ? '#fbbf24' : '#d97706'}
                    />
                  );
                })}

                {/* Live active point */}
                <circle
                  cx={currentDotX}
                  cy={currentDotY}
                  r="5"
                  fill={darkMode ? '#22d3ee' : '#0891b2'}
                  stroke={darkMode ? '#0f172a' : '#ffffff'}
                  strokeWidth="1.8"
                />

                {/* Axis labels */}
                <text
                  x="30"
                  y="24"
                  textAnchor="end"
                  fontSize="9"
                  fill={darkMode ? '#94a3b8' : '#64748b'}
                >
                  +20%
                </text>
                <text
                  x="30"
                  y="69"
                  textAnchor="end"
                  fontSize="9"
                  fill={darkMode ? '#94a3b8' : '#64748b'}
                >
                  0%
                </text>
                <text
                  x="30"
                  y="114"
                  textAnchor="end"
                  fontSize="9"
                  fill={darkMode ? '#94a3b8' : '#64748b'}
                >
                  −22%
                </text>
                <text
                  x="36"
                  y="128"
                  textAnchor="middle"
                  fontSize="9"
                  fill={darkMode ? '#94a3b8' : '#64748b'}
                >
                  0.0M
                </text>
                <text
                  x={36 + ISOTONIC_M * 224}
                  y="128"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={darkMode ? '#34d399' : '#059669'}
                >
                  0.3M
                </text>
                <text
                  x="260"
                  y="128"
                  textAnchor="middle"
                  fontSize="9"
                  fill={darkMode ? '#94a3b8' : '#64748b'}
                >
                  1.0M
                </text>
              </svg>
            </div>
          </div>

          {/* NECTA Exam Note */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode
                ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <strong className="font-bold">NECTA Biology Note:</strong> Unlike animal cells, a plant
            cell does <em>not</em> burst in distilled water because its rigid{' '}
            <span className="font-semibold">cellulose cell wall</span> resists excess turgor
            pressure.
          </div>
        </aside>
      </div>

      {/* UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK */}
      <div
        className={`border-t transition-all ${
          darkMode ? 'border-white/[0.08] bg-[#0f141f]' : 'border-slate-200 bg-slate-50'
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
                <span>Show Osmosis Controls</span>
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
                {OSMOSIS_LESSON_CHAPTERS.map((ch) => {
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
                        className="h-full bg-cyan-500 rounded-full transition-[width] duration-75"
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
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/25'
                    : 'bg-cyan-50 border-cyan-400 text-cyan-900 hover:bg-cyan-100'
                }`}
              >
                Take over from here
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {OSMOSIS_LESSON_CHAPTERS.map((ch) => {
                const isCurrent = activeLessonChapter.id === ch.id;
                return (
                  <button
                    key={`chap-${ch.id}`}
                    type="button"
                    onClick={() => handleScrubLesson(ch.startSec + 0.1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold text-left truncate cursor-pointer transition-colors ${
                      isCurrent
                        ? darkMode
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                          : 'bg-cyan-50 text-cyan-900 border border-cyan-300'
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
            {/* Row 1: Solution Presets + Plot + Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: 'Distilled Water (0.00 M)', val: 0.0 },
                  { label: 'Isotonic (0.30 M)', val: 0.3 },
                  { label: 'Concentrated Sucrose (0.80 M)', val: 0.8 },
                ].map((preset) => {
                  const isActive = Math.abs(concentrationM - preset.val) < 0.03;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap ${
                        isActive
                          ? darkMode
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-slate-900 text-white border-slate-900'
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlotPoint}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                    darkMode
                      ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plot Point</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
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

            {/* Row 2: External Sucrose Concentration Slider */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <span>External Sucrose Concentration:</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={concentrationM}
                onChange={(e) => {
                  setWatchLessonActive(false);
                  setConcentrationM(Number(e.target.value));
                }}
                aria-label="External sucrose concentration in molar"
                className="flex-1 min-w-[180px] accent-cyan-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-black tabular-nums w-16 text-right shrink-0">
                {concentrationM.toFixed(2)} M
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Osmosis3DSimulation;
