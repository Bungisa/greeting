import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Tag,
} from 'lucide-react';

export interface Mitosis3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type SyllabusLevel = 'o_level' | 'a_level';

interface MitosisStageInfo {
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
  chromosomesPerCell: number;
  ploidyLabel: string;
  cellCount: 1 | 2;
}

const MITOSIS_STAGES: MitosisStageInfo[] = [
  {
    id: 'before',
    t: 0.0,
    oLabel: 'Before',
    aLabel: 'Interphase (G1)',
    oTitle: 'Before division',
    aTitle: 'Interphase — G1 Growth Phase',
    subtitle: 'Mitosis · resting parent cell',
    oDescription:
      'A single parent cell contains 4 chromosomes inside its nucleus — 2 from the mother (pink) and 2 from the father (blue). The DNA is uncoiled as thin threads.',
    aDescription:
      'During G1 phase the diploid cell (2n = 4) grows metabolically, synthesises organelles and proteins, and maintains uncondensed euchromatin inside an intact nuclear envelope with a visible nucleolus.',
    lessonCaption:
      'Before mitosis starts, the cell contains 4 diploid chromosomes loosely coiled inside the nucleus.',
    chromosomesPerCell: 4,
    ploidyLabel: 'diploid (2n)',
    cellCount: 1,
  },
  {
    id: 'copying',
    t: 0.14,
    oLabel: 'Copying',
    aLabel: 'S Phase (DNA)',
    oTitle: 'Copying DNA',
    aTitle: 'Interphase — S Phase (DNA Replication)',
    subtitle: 'Mitosis · DNA replication',
    oDescription:
      'Every chromosome makes an exact copy of itself. Each copied pair stays joined together at the centre so no genetic information is lost.',
    aDescription:
      'Semi-conservative DNA replication duplicates every chromosome into two identical sister chromatids joined at a centromere by cohesin rings. Total DNA content doubles (2C → 4C) while chromosome number stays 2n = 4.',
    lessonCaption:
      'Each chromosome makes an exact copy of itself so both new cells will receive a complete set of DNA.',
    chromosomesPerCell: 4,
    ploidyLabel: 'diploid · copied',
    cellCount: 1,
  },
  {
    id: 'ready',
    t: 0.28,
    oLabel: 'Ready',
    aLabel: 'G2 Preparation',
    oTitle: 'Getting ready',
    aTitle: 'Interphase — G2 Preparation Phase',
    subtitle: 'Mitosis · centrosomes ready',
    oDescription:
      'The cell finishes growing and prepares energy and structures called centrioles that will pull the copied chromosomes apart.',
    aDescription:
      'In G2 phase the cell checks replicated DNA for errors, builds ATP reserves, and duplicates its centrosomes (centriole pairs) which begin organising astral microtubules near the nuclear envelope.',
    lessonCaption:
      'Centrioles prepare at the edge of the nucleus and the cell gets ready to divide.',
    chromosomesPerCell: 4,
    ploidyLabel: 'diploid · ready',
    cellCount: 1,
  },
  {
    id: 'prophase',
    t: 0.43,
    oLabel: 'Shorten',
    aLabel: 'Prophase',
    oTitle: 'Chromosomes shorten',
    aTitle: 'Prophase — Condensation & Spindle Formation',
    subtitle: 'Mitosis · prophase',
    oDescription:
      'Mitosis begins. The chromosomes shorten and thicken into visible X-shapes, the nucleus breaks down, and spindle fibres start stretching across the cell.',
    aDescription:
      'Chromatin supercoils into compact X-shaped sister chromatids. The nucleolus disappears, the nuclear envelope fragments into vesicles, and centrosomes migrate to opposite poles forming a mitotic spindle.',
    lessonCaption:
      'Mitosis begins. The chromosomes shorten and thicken, and the nucleus breaks down.',
    chromosomesPerCell: 4,
    ploidyLabel: 'diploid (2n)',
    cellCount: 1,
  },
  {
    id: 'metaphase',
    t: 0.57,
    oLabel: 'Line up',
    aLabel: 'Metaphase',
    oTitle: 'Chromosomes line up',
    aTitle: 'Metaphase — Equatorial Alignment',
    subtitle: 'Mitosis · metaphase',
    oDescription:
      'Spindle fibres attach to the centre of every chromosome and line all 4 chromosomes neatly along the middle equator of the cell.',
    aDescription:
      'Kinetochore microtubules from opposite poles bind each sister chromatid’s kinetochore, aligning all 4 chromosomes precisely along the metaphase plate to satisfy the spindle assembly checkpoint.',
    lessonCaption:
      'Spindle fibres guide all 4 chromosomes into a single neat line across the middle of the cell.',
    chromosomesPerCell: 4,
    ploidyLabel: 'diploid (2n)',
    cellCount: 1,
  },
  {
    id: 'anaphase',
    t: 0.72,
    oLabel: 'Separate',
    aLabel: 'Anaphase',
    oTitle: 'Copies move apart',
    aTitle: 'Anaphase — Sister Chromatid Separation',
    subtitle: 'Mitosis · anaphase',
    oDescription:
      'Each chromosome splits at its centre. Spindle fibres shorten and pull the identical copies to opposite ends of the cell.',
    aDescription:
      'Separase cleaves cohesin at the centromeres; kinetochore microtubules depolymerise and pull V-shaped daughter chromosomes toward opposite poles while polar microtubules elongate the cell.',
    lessonCaption:
      'The copied chromatids split apart and spindle fibres pull an identical set toward each end of the cell.',
    chromosomesPerCell: 4,
    ploidyLabel: '4 per pole',
    cellCount: 1,
  },
  {
    id: 'telophase',
    t: 0.86,
    oLabel: 'New nuclei',
    aLabel: 'Telophase',
    oTitle: 'New nuclei form',
    aTitle: 'Telophase — Nuclear Envelope Reformation',
    subtitle: 'Mitosis · telophase',
    oDescription:
      'Two new nuclear membranes form around the two sets of chromosomes, the spindle fibres disappear, and the cell pinches inward in the middle.',
    aDescription:
      'Daughter chromosomes reach the poles and decondense into chromatin; nuclear envelopes and nucleoli reassemble around both diploid sets while an actin-myosin contractile ring forms the cleavage furrow.',
    lessonCaption:
      'Two new nuclei form around the separated chromosomes and the cell membrane pinches inward.',
    chromosomesPerCell: 4,
    ploidyLabel: 'diploid (2n)',
    cellCount: 1,
  },
  {
    id: 'cytokinesis',
    t: 1.0,
    oLabel: 'Two cells',
    aLabel: 'Cytokinesis',
    oTitle: 'Two cells',
    aTitle: 'Cytokinesis — Two Identical Daughter Cells',
    subtitle: 'Mitosis · two cells',
    oDescription:
      'The cell divides. Mitosis has made two genetically identical cells. It is used for growth, repair of damaged tissues, replacement of cells and asexual reproduction.',
    aDescription:
      'Abscission completes cytokinesis, producing two genetically identical diploid daughter cells (2n = 4), each inheriting 2 maternal and 2 paternal chromosomes for tissue growth and repair.',
    lessonCaption:
      'Cytokinesis completes! Mitosis produces two genetically identical diploid daughter cells.',
    chromosomesPerCell: 4,
    ploidyLabel: 'diploid',
    cellCount: 2,
  },
];

interface MitosisLessonChapter {
  id: number;
  title: string;
  startSec: number;
  endSec: number;
  startT: number;
  endT: number;
  oCaption: string;
  aCaption: string;
}

const LESSON_DURATION_SEC = 65;

const MITOSIS_LESSON_CHAPTERS: MitosisLessonChapter[] = [
  {
    id: 1,
    title: 'Interphase & DNA copying',
    startSec: 0,
    endSec: 16,
    startT: 0.0,
    endT: 0.28,
    oCaption:
      'Before mitosis begins, the cell grows and makes an exact copy of all 4 chromosomes (2 from the mother, 2 from the father) inside its nucleus.',
    aCaption:
      'During Interphase (G1 → S → G2), semi-conservative DNA replication duplicates every chromosome into paired sister chromatids (2C → 4C) while centrosomes duplicate.',
  },
  {
    id: 2,
    title: 'Prophase & Metaphase',
    startSec: 16,
    endSec: 33,
    startT: 0.28,
    endT: 0.58,
    oCaption:
      'Chromosomes shorten and thicken into X-shapes, the nuclear membrane breaks down, and spindle fibres line all 4 chromosomes neatly along the middle.',
    aCaption:
      'Chromatin supercoils into visible chromosomes, the nuclear envelope fragments, and kinetochore microtubules align every sister chromatid pair on the metaphase plate.',
  },
  {
    id: 3,
    title: 'Anaphase separation',
    startSec: 33,
    endSec: 50,
    startT: 0.58,
    endT: 0.78,
    oCaption:
      'Each chromosome splits at its centre. Spindle fibres shorten and pull identical copies to opposite ends so both poles receive a full set of 4.',
    aCaption:
      'Separase cleaves centromeric cohesin; depolymerising kinetochore microtubules drag V-shaped daughter chromosomes to opposite poles while polar fibres elongate the cell.',
  },
  {
    id: 4,
    title: 'Telophase & Cytokinesis',
    startSec: 50,
    endSec: 65,
    startT: 0.78,
    endT: 1.0,
    oCaption:
      'Two new nuclei form around the separated chromosomes and the cell pinches apart into two genetically identical diploid daughter cells.',
    aCaption:
      'Nuclear envelopes and nucleoli reassemble as chromosomes decondense; the actin–myosin cleavage furrow completes cytokinesis, yielding two identical diploid cells (2n = 4).',
  },
];

function formatLessonTime(sec: number): string {
  const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, Math.floor(sec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getLessonChapter(sec: number): MitosisLessonChapter {
  for (const ch of MITOSIS_LESSON_CHAPTERS) {
    if (sec < ch.endSec) return ch;
  }
  return MITOSIS_LESSON_CHAPTERS[MITOSIS_LESSON_CHAPTERS.length - 1];
}

function computeMitosisProgressForLessonTime(sec: number): number {
  const ch = getLessonChapter(sec);
  const local = Math.max(0, Math.min(1, (sec - ch.startSec) / Math.max(0.01, ch.endSec - ch.startSec)));
  const eased = local * local * (3 - 2 * local);
  return ch.startT + (ch.endT - ch.startT) * eased;
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

// Chromosome specs: 4 diploid chromosomes (2 homologous pairs: long pair + short pair)
interface ChromosomeBlueprint {
  index: number;
  origin: 'mother' | 'father';
  colorHex: number;
  armLength: number;
  equatorY: number;
  equatorZ: number;
  prophasePos: [number, number, number];
  prophaseTilt: [number, number, number];
}

const CHROMOSOME_BLUEPRINTS: ChromosomeBlueprint[] = [
  {
    index: 0,
    origin: 'mother',
    colorHex: 0xe25b88, // rose pink (maternal, long)
    armLength: 0.72,
    equatorY: 1.02,
    equatorZ: 0.08,
    prophasePos: [-0.28, 0.52, 0.25],
    prophaseTilt: [0.35, 0.4, -0.55],
  },
  {
    index: 1,
    origin: 'father',
    colorHex: 0x4b93e8, // sky blue (paternal, long)
    armLength: 0.72,
    equatorY: 0.34,
    equatorZ: -0.08,
    prophasePos: [0.22, -0.35, 0.22],
    prophaseTilt: [-0.45, -0.35, 0.6],
  },
  {
    index: 2,
    origin: 'mother',
    colorHex: 0xe25b88, // rose pink (maternal, short)
    armLength: 0.5,
    equatorY: -0.34,
    equatorZ: 0.08,
    prophasePos: [0.35, 0.36, -0.22],
    prophaseTilt: [0.25, -0.5, 0.45],
  },
  {
    index: 3,
    origin: 'father',
    colorHex: 0x4b93e8, // sky blue (paternal, short)
    armLength: 0.5,
    equatorY: -1.02,
    equatorZ: -0.08,
    prophasePos: [-0.25, -0.52, -0.2],
    prophaseTilt: [-0.3, 0.45, -0.4],
  },
];

// Reusable math scratch variables (zero per-frame GC allocations)
const _vProj = new THREE.Vector3();
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vMid = new THREE.Vector3();
const _matDummy = new THREE.Matrix4();
const _quatDummy = new THREE.Quaternion();
const _scaleDummy = new THREE.Vector3();
const _upAxis = new THREE.Vector3(0, 1, 0);

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function getStageForProgress(t: number): MitosisStageInfo {
  let closest = MITOSIS_STAGES[0];
  let bestDist = Infinity;
  for (const s of MITOSIS_STAGES) {
    const d = Math.abs(s.t - t);
    if (d < bestDist) {
      bestDist = d;
      closest = s;
    }
  }
  return closest;
}

/**
 * Generates a Fresnel-lit translucent biological membrane material using PBR onBeforeCompile
 * so both cell membranes and nuclear envelopes have the signature glowing translucent rim
 * seen in studio 3D biology simulations while remaining fast on both GPU and software WebGL.
 */
function createMembraneMaterial(
  baseColorHex: number,
  rimColorHex: number,
  opacity: number,
  isDark: boolean
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: new THREE.Color(baseColorHex) },
      uRimColor: { value: new THREE.Color(rimColorHex) },
      uOpacity: { value: opacity },
      uRimPower: { value: isDark ? 2.1 : 1.85 },
      uLightDir: { value: new THREE.Vector3(0.45, 0.72, 0.52).normalize() },
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
        float diff = max(dot(normalize(vWorldNormal), uLightDir), 0.0) * 0.45 + 0.55;
        vec3 col = mix(uBaseColor * diff, uRimColor, fresnel * 0.85);
        float alpha = clamp(uOpacity * (0.38 + fresnel * 1.15), 0.0, 0.88);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
}

/**
 * Generates an organic tangled 3D chromatin curve inside a nucleus of radius R
 */
function buildChromatinPoints(seed: number, radius: number, segments = 46): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const angle = u * Math.PI * 5.2 + seed * 1.7;
    const elev = Math.sin(u * Math.PI * 3.1 + seed * 2.3) * 0.72;
    const r = radius * (0.42 + 0.44 * Math.sin(u * Math.PI * 2.4 + seed));
    const x = Math.cos(angle) * Math.cos(elev) * r;
    const y = Math.sin(elev) * r;
    const z = Math.sin(angle) * Math.cos(elev) * r;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

export const Mitosis3DSimulation: React.FC<Mitosis3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 4',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Interactive playback & UI state
  const [progress, setProgress] = useState<number>(0.43); // Launch directly in Prophase (instantly captivating!)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [watchLessonActive, setWatchLessonActive] = useState<boolean>(false);
  const [lessonTime, setLessonTime] = useState<number>(0);
  const [lessonPaused, setLessonPaused] = useState<boolean>(false);
  const [lessonSpeed, setLessonSpeed] = useState<0.75 | 1 | 1.5>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [level, setLevel] = useState<SyllabusLevel>(() =>
    activeClass.includes('5') || activeClass.includes('6') ? 'a_level' : 'o_level'
  );
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);

  // Mutable refs so the WebGL loop stays completely stable across React state updates
  const targetProgressRef = useRef<number>(progress);
  const currentProgressRef = useRef<number>(progress);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonTimeRef = useRef<number>(0);
  const lessonPausedRef = useRef<boolean>(false);
  const lessonSpeedRef = useRef<number>(1);
  const showLabelsRef = useRef<boolean>(showLabels);
  const darkModeRef = useRef<boolean>(darkMode);
  const lastLabelPushRef = useRef<number>(0);

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
    lessonSpeedRef.current = lessonSpeed;
  }, [lessonSpeed]);

  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);

  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

  const activeLessonChapter = useMemo(() => getLessonChapter(lessonTime), [lessonTime]);

  const currentStage = useMemo(() => getStageForProgress(progress), [progress]);

  // Toggle Fullscreen on the simulation wrapper cleanly
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
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Main Three.js WebGL scene setup (mounts once, responds smoothly to refs)
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
    camera.position.set(0, 0.35, 11.4);

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

    // Procedural Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Balanced 3-point warm/cool scientific lighting rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5.5, 7.5, 6.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.1);
    rimLight.position.set(-6.0, -3.5, -5.0);
    scene.add(rimLight);

    // Orbit Controls (drag cell to rotate freely, scroll/pinch to zoom)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 6.2;
    controls.maxDistance = 18;
    controls.rotateSpeed = 0.78;
    controls.target.set(0, 0, 0);

    // Root biological assembly
    const mitosisRoot = new THREE.Group();
    scene.add(mitosisRoot);

    // ==================== 1. CELL MEMBRANES (Smooth Pinch & Split) ====================
    const cellGeoBase = new THREE.SphereGeometry(2.65, 56, 40);
    const cellBasePos = cellGeoBase.attributes.position.array.slice() as Float32Array;
    const cellMatLeft = createMembraneMaterial(
      darkModeRef.current ? 0x525a6c : 0x64748b,
      darkModeRef.current ? 0xcbd5e1 : 0x334155,
      darkModeRef.current ? 0.56 : 0.36,
      darkModeRef.current
    );
    const cellMatRight = createMembraneMaterial(
      darkModeRef.current ? 0x525a6c : 0x64748b,
      darkModeRef.current ? 0xcbd5e1 : 0x334155,
      darkModeRef.current ? 0.56 : 0.36,
      darkModeRef.current
    );

    // Primary morphing single-cell membrane (elongates & pinches during Telophase)
    const primaryCellMesh = new THREE.Mesh(cellGeoBase, cellMatLeft);
    primaryCellMesh.renderOrder = 20;
    mitosisRoot.add(primaryCellMesh);

    // Daughter cell pair meshes (smoothly blend in at late Telophase → full Cytokinesis)
    const daughterGeo = new THREE.SphereGeometry(2.12, 48, 36);
    const daughterLeftMesh = new THREE.Mesh(daughterGeo, cellMatLeft);
    const daughterRightMesh = new THREE.Mesh(daughterGeo, cellMatRight);
    daughterLeftMesh.renderOrder = 20;
    daughterRightMesh.renderOrder = 20;
    mitosisRoot.add(daughterLeftMesh, daughterRightMesh);

    // ==================== 2. NUCLEAR ENVELOPES & NUCLEOLI ====================
    const nucleusGeo = new THREE.SphereGeometry(1.18, 40, 28);
    const nucMatMain = createMembraneMaterial(0x748199, 0xe2e8f0, 0.52, darkModeRef.current);
    const nucMatD1 = createMembraneMaterial(0x748199, 0xe2e8f0, 0.52, darkModeRef.current);
    const nucMatD2 = createMembraneMaterial(0x748199, 0xe2e8f0, 0.52, darkModeRef.current);

    const mainNucleusMesh = new THREE.Mesh(nucleusGeo, nucMatMain);
    mainNucleusMesh.renderOrder = 14;
    mitosisRoot.add(mainNucleusMesh);

    const daughterNucLeft = new THREE.Mesh(nucleusGeo, nucMatD1);
    const daughterNucRight = new THREE.Mesh(nucleusGeo, nucMatD2);
    daughterNucLeft.renderOrder = 14;
    daughterNucRight.renderOrder = 14;
    mitosisRoot.add(daughterNucLeft, daughterNucRight);

    const nucleolusGeo = new THREE.SphereGeometry(0.24, 24, 18);
    const nucleolusMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.48,
      metalness: 0.08,
      transparent: true,
      opacity: 0.72,
    });
    const mainNucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    mainNucleolus.position.set(0.18, -0.14, 0.08);
    mainNucleusMesh.add(mainNucleolus);

    const daughterNucleolusL = new THREE.Mesh(nucleolusGeo, nucleolusMat.clone());
    daughterNucleolusL.position.set(0.16, -0.12, 0.08);
    daughterNucLeft.add(daughterNucleolusL);

    const daughterNucleolusR = new THREE.Mesh(nucleolusGeo, nucleolusMat.clone());
    daughterNucleolusR.position.set(-0.16, -0.12, 0.08);
    daughterNucRight.add(daughterNucleolusR);

    // ==================== 3. INTERPHASE / TELOPHASE CHROMATIN STRANDS ====================
    const chromatinMainGroup = new THREE.Group();
    const chromatinLeftGroup = new THREE.Group();
    const chromatinRightGroup = new THREE.Group();
    mitosisRoot.add(chromatinMainGroup, chromatinLeftGroup, chromatinRightGroup);

    const chromatinMaterials: THREE.MeshStandardMaterial[] = [];

    function populateChromatinGroup(targetGroup: THREE.Group, scaleRadius: number, seedOffset: number) {
      CHROMOSOME_BLUEPRINTS.forEach((bp, idx) => {
        const pts = buildChromatinPoints(idx * 1.45 + seedOffset, scaleRadius, 44);
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.038, 8, false);
        const mat = new THREE.MeshStandardMaterial({
          color: bp.colorHex,
          roughness: 0.36,
          metalness: 0.08,
          transparent: true,
          opacity: 0.95,
        });
        chromatinMaterials.push(mat);
        const mesh = new THREE.Mesh(tubeGeo, mat);
        targetGroup.add(mesh);
      });
    }

    populateChromatinGroup(chromatinMainGroup, 0.88, 0.2);
    populateChromatinGroup(chromatinLeftGroup, 0.78, 0.5);
    populateChromatinGroup(chromatinRightGroup, 0.78, 0.5); // Genetically identical!

    // ==================== 4. BEADED 3D CONDENSED CHROMATIDS (8 Sister Chromatids) ====================
    // Each of the 4 chromosomes has 2 sister chromatids (leftSister & rightSister).
    // Each chromatid is rendered as a chain of 15 glossy overlapping chromatin beads
    // forming a crisp segmented 3D rod/chevron (just like the reference screenshots!).
    const BEADS_PER_CHROMATID = 15;
    const TOTAL_CHROMATIDS = CHROMOSOME_BLUEPRINTS.length * 2;
    const TOTAL_BEADS = TOTAL_CHROMATIDS * BEADS_PER_CHROMATID;

    const beadGeo = new THREE.SphereGeometry(0.115, 16, 14);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.32,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
    });
    const chromatidInstanced = new THREE.InstancedMesh(beadGeo, beadMat, TOTAL_BEADS);
    chromatidInstanced.frustumCulled = false;
    chromatidInstanced.castShadow = !isSoftwareGl;
    chromatidInstanced.receiveShadow = !isSoftwareGl;
    chromatidInstanced.renderOrder = 10;

    const colorScratch = new THREE.Color();
    for (let c = 0; c < CHROMOSOME_BLUEPRINTS.length; c++) {
      const bp = CHROMOSOME_BLUEPRINTS[c];
      for (let side = 0; side < 2; side++) {
        const chromatidIdx = c * 2 + side;
        for (let b = 0; b < BEADS_PER_CHROMATID; b++) {
          const instanceIdx = chromatidIdx * BEADS_PER_CHROMATID + b;
          colorScratch.setHex(bp.colorHex);
          // Slight subtle luminance banding along chromatid arms for realistic 3D depth
          const bandShift = b === Math.floor(BEADS_PER_CHROMATID / 2) ? 0.14 : (b % 3 === 0 ? 0.05 : -0.04);
          colorScratch.offsetHSL(0, 0, bandShift);
          chromatidInstanced.setColorAt(instanceIdx, colorScratch);
        }
      }
    }
    if (chromatidInstanced.instanceColor) {
      chromatidInstanced.instanceColor.needsUpdate = true;
    }
    mitosisRoot.add(chromatidInstanced);

    // Centromere anchor spheres (for crisp attachment of kinetochore spindle fibers)
    const centromereGeo = new THREE.SphereGeometry(0.085, 14, 12);
    const centromereMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const centromereMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < TOTAL_CHROMATIDS; i++) {
      const m = new THREE.Mesh(centromereGeo, centromereMat);
      m.renderOrder = 11;
      mitosisRoot.add(m);
      centromereMeshes.push(m);
    }

    // ==================== 5. CENTROSOMES (CENTRIOLES + RADIAL ASTERS) ====================
    function createCentrosomeGroup(): { group: THREE.Group; asterLines: THREE.LineSegments } {
      const group = new THREE.Group();
      const barrelGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.22, 12);
      const barrelMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.35,
        metalness: 0.25,
      });
      const c1 = new THREE.Mesh(barrelGeo, barrelMat);
      c1.rotation.z = Math.PI / 2;
      const c2 = new THREE.Mesh(barrelGeo, barrelMat);
      c2.position.set(0.04, 0.07, 0.04);
      group.add(c1, c2);

      // Radial aster rays
      const rayPts: number[] = [];
      const rayCount = 18;
      for (let i = 0; i < rayCount; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / rayCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const len = 0.42 + (i % 3) * 0.14;
        rayPts.push(0, 0, 0);
        rayPts.push(
          Math.sin(phi) * Math.cos(theta) * len,
          Math.sin(phi) * Math.sin(theta) * len,
          Math.cos(phi) * len
        );
      }
      const asterGeo = new THREE.BufferGeometry();
      asterGeo.setAttribute('position', new THREE.Float32BufferAttribute(rayPts, 3));
      const asterMat = new THREE.LineBasicMaterial({
        color: 0xdbeafe,
        transparent: true,
        opacity: 0.55,
      });
      const asterLines = new THREE.LineSegments(asterGeo, asterMat);
      group.add(asterLines);
      return { group, asterLines };
    }

    const leftCentrosome = createCentrosomeGroup();
    const rightCentrosome = createCentrosomeGroup();
    mitosisRoot.add(leftCentrosome.group, rightCentrosome.group);

    // ==================== 6. DYNAMIC SPINDLE FIBERS (Kinetochore + Polar) ====================
    // 8 kinetochore fibers (pole -> centromere) + 12 arched polar spindle fibers (pole -> pole)
    const POLAR_FIBERS = 12;
    const POLAR_SEGMENTS = 16;
    const KINETOCHORE_FIBERS = TOTAL_CHROMATIDS;
    const totalFiberSegments = KINETOCHORE_FIBERS + POLAR_FIBERS * POLAR_SEGMENTS;
    const spindlePositions = new Float32Array(totalFiberSegments * 2 * 3);
    const spindleGeo = new THREE.BufferGeometry();
    spindleGeo.setAttribute('position', new THREE.BufferAttribute(spindlePositions, 3));
    const spindleMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.48,
    });
    const spindleLines = new THREE.LineSegments(spindleGeo, spindleMat);
    spindleLines.frustumCulled = false;
    spindleLines.renderOrder = 8;
    mitosisRoot.add(spindleLines);

    // ==================== SCENE UPDATE FUNCTION (Continuous t in [0, 1]) ====================
    const centromereWorldPositions: THREE.Vector3[] = Array.from(
      { length: TOTAL_CHROMATIDS },
      () => new THREE.Vector3()
    );

    const activeLabelAnchors: LabelSpec[] = [];

    function updateMitosisScene(t: number, elapsed: number) {
      // Theme color sync
      const isDark = darkModeRef.current;
      scene.background = isDark ? bgDark : bgLight;
      const cellBaseCol = isDark ? 0x525a6c : 0x64748b;
      const cellRimCol = isDark ? 0xdbeafe : 0x334155;
      cellMatLeft.uniforms.uBaseColor.value.setHex(cellBaseCol);
      cellMatLeft.uniforms.uRimColor.value.setHex(cellRimCol);
      cellMatRight.uniforms.uBaseColor.value.setHex(cellBaseCol);
      cellMatRight.uniforms.uRimColor.value.setHex(cellRimCol);
      spindleMat.color.setHex(isDark ? 0xe2e8f0 : 0x475569);
      (leftCentrosome.asterLines.material as THREE.LineBasicMaterial).color.setHex(
        isDark ? 0xdbeafe : 0x475569
      );
      (rightCentrosome.asterLines.material as THREE.LineBasicMaterial).color.setHex(
        isDark ? 0xdbeafe : 0x475569
      );

      // Smooth phase envelopes
      const condenseFactor = smoothstep(0.28, 0.44, t) * (1 - smoothstep(0.84, 0.96, t));
      const interphaseChromatinAlpha = 1 - smoothstep(0.30, 0.44, t);
      const daughterChromatinAlpha = smoothstep(0.83, 0.95, t);
      const copyThickness = 1 + 0.45 * smoothstep(0.10, 0.22, t);

      const mainNucleusAlpha = 1 - smoothstep(0.36, 0.49, t);
      const daughterNucleusAlpha = smoothstep(0.80, 0.93, t);

      const spindleAlpha = smoothstep(0.35, 0.50, t) * (1 - smoothstep(0.79, 0.90, t));
      const centrosomeVisibility = smoothstep(0.22, 0.34, t) * (1 - smoothstep(0.85, 0.96, t));

      const alignMetaphase = smoothstep(0.44, 0.57, t);
      const separateAnaphase = smoothstep(0.62, 0.78, t);
      const telophaseCluster = smoothstep(0.76, 0.90, t);
      const furrowPinch = smoothstep(0.72, 0.91, t);
      const splitBlend = smoothstep(0.88, 0.98, t);

      // 1. Cell membrane elongation, cleavage furrow pinch, and daughter separation
      const elongateX = 1.0 + 0.34 * smoothstep(0.58, 0.88, t);
      const pinchDepth = furrowPinch * 0.72;
      const cellPosAttr = cellGeoBase.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < cellPosAttr.count; i++) {
        const bx = cellBasePos[i * 3];
        const by = cellBasePos[i * 3 + 1];
        const bz = cellBasePos[i * 3 + 2];
        const normX = bx / 2.65;
        // Gaussian cleavage furrow pinch right at x = 0
        const waist = 1.0 - pinchDepth * Math.exp(-(normX * normX) * 5.8);
        cellPosAttr.setXYZ(i, bx * elongateX, by * waist, bz * waist);
      }
      cellPosAttr.needsUpdate = true;
      cellGeoBase.computeVertexNormals();

      primaryCellMesh.visible = splitBlend < 0.99;
      cellMatLeft.uniforms.uOpacity.value = (isDark ? 0.55 : 0.36) * (1 - splitBlend * 0.95);

      // Daughter cells emerge seamlessly as primary cell completes cleavage
      const daughterOffsetX = 1.65 + 0.78 * splitBlend;
      daughterLeftMesh.visible = splitBlend > 0.02;
      daughterRightMesh.visible = splitBlend > 0.02;
      daughterLeftMesh.position.set(-daughterOffsetX, 0, 0);
      daughterRightMesh.position.set(daughterOffsetX, 0, 0);
      const daughterScale = 0.86 + 0.14 * splitBlend;
      daughterLeftMesh.scale.setScalar(daughterScale);
      daughterRightMesh.scale.setScalar(daughterScale);
      cellMatRight.uniforms.uOpacity.value = (isDark ? 0.55 : 0.36) * splitBlend;
      if (splitBlend > 0.5) {
        // Use matching material opacity on both daughters once split dominates
        cellMatLeft.uniforms.uOpacity.value = (isDark ? 0.55 : 0.36) * splitBlend;
        primaryCellMesh.visible = false;
      }

      // 2. Nuclei & Nucleoli
      mainNucleusMesh.visible = mainNucleusAlpha > 0.02;
      nucMatMain.uniforms.uOpacity.value = (isDark ? 0.52 : 0.34) * mainNucleusAlpha;
      nucleolusMat.opacity = 0.7 * (1 - smoothstep(0.32, 0.43, t));
      mainNucleolus.visible = nucleolusMat.opacity > 0.02;

      const daughterNucX = THREE.MathUtils.lerp(1.58, daughterOffsetX, splitBlend);
      daughterNucLeft.visible = daughterNucleusAlpha > 0.02;
      daughterNucRight.visible = daughterNucleusAlpha > 0.02;
      daughterNucLeft.position.set(-daughterNucX, 0, 0);
      daughterNucRight.position.set(daughterNucX, 0, 0);
      const dNucScale = 0.68 + 0.22 * daughterNucleusAlpha;
      daughterNucLeft.scale.setScalar(dNucScale);
      daughterNucRight.scale.setScalar(dNucScale);
      nucMatD1.uniforms.uOpacity.value = (isDark ? 0.52 : 0.34) * daughterNucleusAlpha;
      nucMatD2.uniforms.uOpacity.value = (isDark ? 0.52 : 0.34) * daughterNucleusAlpha;
      (daughterNucleolusL.material as THREE.MeshStandardMaterial).opacity = 0.68 * daughterNucleusAlpha;
      (daughterNucleolusR.material as THREE.MeshStandardMaterial).opacity = 0.68 * daughterNucleusAlpha;

      // 3. Interphase & Daughter Chromatin Strands
      chromatinMainGroup.visible = interphaseChromatinAlpha > 0.02;
      chromatinMainGroup.scale.setScalar(copyThickness * (1 - 0.18 * smoothstep(0.30, 0.44, t)));
      chromatinMainGroup.rotation.y = elapsed * 0.14;
      chromatinMainGroup.rotation.x = Math.sin(elapsed * 0.25) * 0.08;

      chromatinLeftGroup.visible = daughterChromatinAlpha > 0.02;
      chromatinRightGroup.visible = daughterChromatinAlpha > 0.02;
      chromatinLeftGroup.position.set(-daughterNucX, 0, 0);
      chromatinRightGroup.position.set(daughterNucX, 0, 0);
      chromatinLeftGroup.rotation.y = elapsed * 0.12;
      chromatinRightGroup.rotation.y = elapsed * 0.12;

      chromatinMaterials.forEach((m, i) => {
        if (i < 4) {
          m.opacity = interphaseChromatinAlpha * 0.95;
        } else {
          m.opacity = daughterChromatinAlpha * 0.95;
        }
      });

      // 4. Centrosomes migrating to opposite poles
      const poleX = THREE.MathUtils.lerp(0.95, 2.08, smoothstep(0.28, 0.56, t)) + 0.38 * smoothstep(0.62, 0.86, t);
      const poleY = THREE.MathUtils.lerp(0.85, 0.0, smoothstep(0.28, 0.48, t));
      leftCentrosome.group.visible = centrosomeVisibility > 0.02;
      rightCentrosome.group.visible = centrosomeVisibility > 0.02;
      leftCentrosome.group.position.set(-poleX, poleY, 0);
      rightCentrosome.group.position.set(poleX, -poleY * 0.5, 0);
      leftCentrosome.group.scale.setScalar(0.5 + 0.5 * centrosomeVisibility);
      rightCentrosome.group.scale.setScalar(0.5 + 0.5 * centrosomeVisibility);

      // 5. Condensed 3D Beaded Sister Chromatids (Prophase → Metaphase → Anaphase → Telophase)
      chromatidInstanced.visible = condenseFactor > 0.02;
      beadMat.opacity = Math.min(1, condenseFactor * 1.15);
      centromereMat.opacity = beadMat.opacity * 0.85;

      const polePullTargetX = THREE.MathUtils.lerp(1.38, daughterNucX, telophaseCluster);

      for (let c = 0; c < CHROMOSOME_BLUEPRINTS.length; c++) {
        const bp = CHROMOSOME_BLUEPRINTS[c];

        // Prophase random cluster → Metaphase equator alignment
        const baseX = THREE.MathUtils.lerp(bp.prophasePos[0], 0, alignMetaphase);
        const baseY = THREE.MathUtils.lerp(bp.prophasePos[1], bp.equatorY, alignMetaphase);
        const baseZ = THREE.MathUtils.lerp(bp.prophasePos[2], bp.equatorZ, alignMetaphase);

        // During Telophase, gather chromosomes neatly inside the new daughter nuclei
        const teloY = THREE.MathUtils.lerp(baseY, (c - 1.5) * 0.34, telophaseCluster);
        const teloZ = THREE.MathUtils.lerp(baseZ, (c % 2 === 0 ? 0.14 : -0.14), telophaseCluster);

        // Gentle organic micro-motion
        const bob = Math.sin(elapsed * 1.3 + c * 1.7) * 0.03 * (1 - separateAnaphase * 0.5);

        for (let side = 0; side < 2; side++) {
          const dir = side === 0 ? -1 : 1; // -1 moves to left pole, +1 moves to right pole
          const chromatidIdx = c * 2 + side;

          // Centromere position: stays paired in Prophase/Metaphase, pulls sharply apart in Anaphase!
          const sepX = dir * (0.08 + polePullTargetX * separateAnaphase);
          const cx = baseX * (1 - separateAnaphase) + sepX;
          const cy = teloY + bob;
          const cz = teloZ;

          centromereWorldPositions[chromatidIdx].set(cx, cy, cz);
          const centMesh = centromereMeshes[chromatidIdx];
          centMesh.visible = condenseFactor > 0.05;
          centMesh.position.set(cx, cy, cz);

          // Tilt in Prophase flattens cleanly upright in Metaphase & Anaphase
          const rotZ = bp.prophaseTilt[2] * (1 - alignMetaphase);
          const rotY = bp.prophaseTilt[1] * (1 - alignMetaphase);
          const cosZ = Math.cos(rotZ);
          const sinZ = Math.sin(rotZ);

          // V-chevron bend during Anaphase (centromere leads toward pole, tips trail back!)
          const chevronPull = smoothstep(0.62, 0.74, t) * (1 - 0.35 * telophaseCluster);
          const xFlare = (1 - separateAnaphase) * 0.24; // X-shape arm splay before split

          for (let b = 0; b < BEADS_PER_CHROMATID; b++) {
            const u = (b / (BEADS_PER_CHROMATID - 1)) * 2 - 1; // -1 (bottom tip) to +1 (top tip)
            const absU = Math.abs(u);

            // Local chromatid coordinates relative to centromere
            // Before split: gentle X-splay; During Anaphase: sharp V-chevron trailing away from pole
            const localX =
              dir * (xFlare * absU * absU - chevronPull * 0.42 * absU);
            const localY = u * bp.armLength * (0.85 + 0.15 * condenseFactor);
            const localZ = Math.sin(u * Math.PI) * 0.05 * dir + rotY * u * 0.22;

            // Apply prophase Z rotation
            const rx = localX * cosZ - localY * sinZ;
            const ry = localX * sinZ + localY * cosZ;

            const beadScale =
              (0.76 + 0.24 * Math.sin((b / (BEADS_PER_CHROMATID - 1)) * Math.PI)) *
              (0.45 + 0.55 * condenseFactor);

            _vA.set(cx + rx, cy + ry, cz + localZ);
            _quatDummy.identity();
            _scaleDummy.setScalar(beadScale);
            _matDummy.compose(_vA, _quatDummy, _scaleDummy);
            chromatidInstanced.setMatrixAt(chromatidIdx * BEADS_PER_CHROMATID + b, _matDummy);
          }
        }
      }
      chromatidInstanced.instanceMatrix.needsUpdate = true;

      // 6. Update Dynamic Spindle Fibers (Kinetochore + Curved Polar Fibers)
      spindleLines.visible = spindleAlpha > 0.02;
      spindleMat.opacity = (isDark ? 0.52 : 0.46) * spindleAlpha;

      if (spindleLines.visible) {
        let ptr = 0;
        const leftPole = leftCentrosome.group.position;
        const rightPole = rightCentrosome.group.position;

        // Kinetochore fibers: each pole connects to its 4 sister chromatids
        for (let i = 0; i < TOTAL_CHROMATIDS; i++) {
          const isLeft = i % 2 === 0;
          const pole = isLeft ? leftPole : rightPole;
          const target = centromereWorldPositions[i];
          // During early Prophase fibers grow gradually from pole toward chromatids
          const reach = smoothstep(0.36, 0.52, t);
          _vB.lerpVectors(pole, target, reach);
          spindlePositions[ptr++] = pole.x;
          spindlePositions[ptr++] = pole.y;
          spindlePositions[ptr++] = pole.z;
          spindlePositions[ptr++] = _vB.x;
          spindlePositions[ptr++] = _vB.y;
          spindlePositions[ptr++] = _vB.z;
        }

        // Curved Polar Microtubules arching across the spindle basket
        for (let f = 0; f < POLAR_FIBERS; f++) {
          const angle = (f / POLAR_FIBERS) * Math.PI * 2;
          const bowRadius = (0.72 + (f % 3) * 0.34) * smoothstep(0.35, 0.55, t);
          const bowY = Math.cos(angle) * bowRadius;
          const bowZ = Math.sin(angle) * bowRadius * 0.72;
          _vMid.set(0, bowY, bowZ);

          for (let s = 0; s < POLAR_SEGMENTS; s++) {
            const u0 = s / POLAR_SEGMENTS;
            const u1 = (s + 1) / POLAR_SEGMENTS;

            // Quadratic Bezier interpolation: leftPole -> _vMid -> rightPole
            const inv0 = 1 - u0;
            const x0 = inv0 * inv0 * leftPole.x + 2 * inv0 * u0 * _vMid.x + u0 * u0 * rightPole.x;
            const y0 = inv0 * inv0 * leftPole.y + 2 * inv0 * u0 * _vMid.y + u0 * u0 * rightPole.y;
            const z0 = inv0 * inv0 * leftPole.z + 2 * inv0 * u0 * _vMid.z + u0 * u0 * rightPole.z;

            const inv1 = 1 - u1;
            const x1 = inv1 * inv1 * leftPole.x + 2 * inv1 * u1 * _vMid.x + u1 * u1 * rightPole.x;
            const y1 = inv1 * inv1 * leftPole.y + 2 * inv1 * u1 * _vMid.y + u1 * u1 * rightPole.y;
            const z1 = inv1 * inv1 * leftPole.z + 2 * inv1 * u1 * _vMid.z + u1 * u1 * rightPole.z;

            spindlePositions[ptr++] = x0;
            spindlePositions[ptr++] = y0;
            spindlePositions[ptr++] = z0;
            spindlePositions[ptr++] = x1;
            spindlePositions[ptr++] = y1;
            spindlePositions[ptr++] = z1;
          }
        }
        (spindleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }

      // 7. Build Live 3D Anchor Specs for Callout Labels
      activeLabelAnchors.length = 0;
      if (t < 0.34) {
        activeLabelAnchors.push(
          {
            id: 'membrane',
            text: 'cell membrane',
            worldPos: _vA.set(1.85, 1.85, 0).clone(),
            offsetX: 68,
            offsetY: -36,
          },
          {
            id: 'nucleus',
            text: 'nucleus',
            worldPos: new THREE.Vector3(0.1, 1.18, 0),
            offsetX: 74,
            offsetY: -54,
          },
          {
            id: 'chromatin',
            text: t > 0.1 ? 'copied chromatin (DNA)' : 'chromatin (DNA)',
            worldPos: new THREE.Vector3(-0.32, 0.25, 0.2),
            offsetX: -120,
            offsetY: -38,
          }
        );
      } else if (t < 0.51) {
        activeLabelAnchors.push(
          {
            id: 'nucleus',
            text: 'nucleus breaking down',
            worldPos: new THREE.Vector3(0.05, 1.16, 0),
            offsetX: 78,
            offsetY: -58,
          },
          {
            id: 'chromosome',
            text: 'chromosome',
            worldPos: centromereWorldPositions[0].clone(),
            offsetX: -115,
            offsetY: -44,
          },
          {
            id: 'spindle',
            text: 'spindle fibres',
            worldPos: new THREE.Vector3(1.15, -0.45, 0),
            offsetX: 90,
            offsetY: 54,
          }
        );
      } else if (t < 0.64) {
        activeLabelAnchors.push(
          {
            id: 'metaphase',
            text: 'chromosomes lined up',
            worldPos: centromereWorldPositions[0].clone(),
            offsetX: -120,
            offsetY: -54,
          },
          {
            id: 'spindle',
            text: 'spindle fibres',
            worldPos: new THREE.Vector3(1.15, 0.55, 0),
            offsetX: 88,
            offsetY: -48,
          },
          {
            id: 'centrosome',
            text: 'centriole pole',
            worldPos: leftCentrosome.group.position.clone(),
            offsetX: -80,
            offsetY: 54,
          }
        );
      } else if (t < 0.80) {
        activeLabelAnchors.push(
          {
            id: 'apart',
            text: 'copies moving apart',
            worldPos: centromereWorldPositions[0].clone().add(new THREE.Vector3(0, 0.48, 0)),
            offsetX: -115,
            offsetY: -56,
          },
          {
            id: 'spindle',
            text: 'spindle fibres',
            worldPos: new THREE.Vector3(0.4, -0.25, 0),
            offsetX: 96,
            offsetY: 58,
          }
        );
      } else if (t < 0.93) {
        activeLabelAnchors.push(
          {
            id: 'new_nuc',
            text: 'new nucleus forming',
            worldPos: new THREE.Vector3(-daughterNucX, 0.95, 0),
            offsetX: -95,
            offsetY: -56,
          },
          {
            id: 'furrow',
            text: 'cleavage furrow',
            worldPos: new THREE.Vector3(0, 1.32, 0),
            offsetX: 65,
            offsetY: -56,
          }
        );
      } else {
        activeLabelAnchors.push(
          {
            id: 'd1',
            text: 'identical cell 1 (2n = 4)',
            worldPos: new THREE.Vector3(-daughterOffsetX, 2.05, 0),
            offsetX: -36,
            offsetY: -38,
          },
          {
            id: 'd2',
            text: 'identical cell 2 (2n = 4)',
            worldPos: new THREE.Vector3(daughterOffsetX, 2.05, 0),
            offsetX: 36,
            offsetY: -38,
          }
        );
      }
    }

    // Project 3D label coordinates into container CSS pixels
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
        const lx = Math.max(82, Math.min(w - 82, ax + spec.offsetX));
        const ly = Math.max(30, Math.min(h - 30, ay + spec.offsetY));
        out.push({ id: spec.id, text: spec.text, ax, ay, lx, ly });
      }
      return out;
    }

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!mountEl) return;
      const nw = Math.max(mountEl.clientWidth, 280);
      const nh = Math.max(mountEl.clientHeight, 320);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObserver.observe(mountEl);

    // Pre-compile shaders on hardware WebGL
    updateMitosisScene(currentProgressRef.current, 0);
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Animation loop with software WebGL fence pacing
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

      // Advance timeline when playing or running 1:05 guided lesson
      if (watchLessonRef.current) {
        if (!lessonPausedRef.current) {
          const nextSec = lessonTimeRef.current + delta * lessonSpeedRef.current;
          if (nextSec >= LESSON_DURATION_SEC) {
            lessonTimeRef.current = LESSON_DURATION_SEC;
            setLessonTime(LESSON_DURATION_SEC);
            lessonPausedRef.current = true;
            setLessonPaused(true);
            targetProgressRef.current = 1.0;
            setProgress(1.0);
          } else {
            lessonTimeRef.current = nextSec;
            setLessonTime(nextSec);
            const mappedT = computeMitosisProgressForLessonTime(nextSec);
            targetProgressRef.current = mappedT;
            setProgress(Number(mappedT.toFixed(4)));
          }
        }
      } else if (isPlayingRef.current) {
        const nextT = targetProgressRef.current + delta * 0.062;
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

      // Exponentially damp visual scene progress for silky-smooth stage jumps & scrubbing
      currentProgressRef.current = THREE.MathUtils.damp(
        currentProgressRef.current,
        targetProgressRef.current,
        9.0,
        delta
      );

      updateMitosisScene(currentProgressRef.current, elapsed);
      controls.update();
      renderer.render(scene, camera);

      // Update projected 3D callout labels at ~30fps
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
      resizeObserver.disconnect();
      controls.dispose();

      // Dispose all geometries & materials cleanly
      cellGeoBase.dispose();
      daughterGeo.dispose();
      nucleusGeo.dispose();
      nucleolusGeo.dispose();
      beadGeo.dispose();
      centromereGeo.dispose();
      spindleGeo.dispose();
      cellMatLeft.dispose();
      cellMatRight.dispose();
      nucMatMain.dispose();
      nucMatD1.dispose();
      nucMatD2.dispose();
      nucleolusMat.dispose();
      beadMat.dispose();
      centromereMat.dispose();
      spindleMat.dispose();
      chromatinMaterials.forEach((m) => m.dispose());
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

  const handleTogglePlay = () => {
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
    lessonTimeRef.current = 0;
    setLessonTime(0);
    setLessonPaused(false);
    lessonPausedRef.current = false;
    setProgress(0);
    targetProgressRef.current = 0;
    setIsPlaying(false);
    setWatchLessonActive(true);
    setDockCollapsed(false);
  };

  const handleScrubLesson = (sec: number) => {
    const clamped = Math.max(0, Math.min(LESSON_DURATION_SEC, sec));
    lessonTimeRef.current = clamped;
    setLessonTime(clamped);
    const mappedT = computeMitosisProgressForLessonTime(clamped);
    targetProgressRef.current = mappedT;
    setProgress(Number(mappedT.toFixed(4)));
  };

  const handleCycleLessonSpeed = () => {
    setLessonSpeed((prev) => (prev === 0.75 ? 1 : prev === 1 ? 1.5 : 0.75));
  };

  const handleTakeOverFromLesson = () => {
    setWatchLessonActive(false);
    setLessonPaused(false);
    setIsPlaying(false);
  };

  const handleStartAgain = () => {
    setWatchLessonActive(false);
    setIsPlaying(false);
    setProgress(0);
    targetProgressRef.current = 0;
  };

  const handleJumpStage = (stageT: number) => {
    setWatchLessonActive(false);
    setIsPlaying(false);
    setProgress(stageT);
    targetProgressRef.current = stageT;
  };

  // Theme-adaptive styling classes (NO backdrop-blur over WebGL!)
  const surfaceBg = darkMode ? 'bg-[#161922] text-slate-100' : 'bg-[#f1f5fb] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#1d2230] border-white/[0.1] text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';
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
      {/* TOP BAR: Watch Lesson, Labels Switch, Syllabus Level, Fullscreen */}
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
                ? 'bg-cyan-500 text-slate-950'
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

      {/* MAIN CONTENT: Unobstructed 3D Viewport + Clean Side Summary Panel */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D INTERACTIVE CANVAS STAGE (8 cols on desktop — 100% unobstructed center) */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[430px] sm:h-[520px] lg:h-[580px]'
          }`}
        >
          {/* Isolated WebGL mount div */}
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* 3D-to-2D Projected Callout Labels Overlay (Zero backdrop-blur!) */}
          {showLabels && projectedLabels.length > 0 && (
            <svg className="pointer-events-none absolute inset-0 w-full h-full overflow-visible">
              {projectedLabels.map((lbl) => (
                <g key={lbl.id}>
                  <line
                    x1={lbl.ax}
                    y1={lbl.ay}
                    x2={lbl.lx}
                    y2={lbl.ly}
                    stroke={darkMode ? 'rgba(226,232,240,0.68)' : 'rgba(30,41,59,0.65)'}
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
                    ? 'bg-[#121622] border-white/[0.16] text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {lbl.text}
              </div>
            ))}

          {/* Guided Lesson Caption Banner (appears only during Watch Lesson mode) */}
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
                  {activeLessonChapter.id} of {MITOSIS_LESSON_CHAPTERS.length} · {activeLessonChapter.title}
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
                  darkMode ? 'text-slate-400 bg-[#161922]/85' : 'text-slate-500 bg-[#f1f5fb]/90'
                }`}
              >
                Click Play, or drag the slider to any moment. Drag the cell to turn it.
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SCIENTIFIC EXPLANATION & CHROMOSOME TRACKER PANEL (4 cols on desktop) */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-5 flex flex-col justify-between gap-5 ${
            darkMode
              ? 'bg-[#131722] border-white/[0.08]'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-4">
            <div>
              <div
                className={`text-xs font-semibold ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {currentStage.subtitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                {level === 'o_level' ? currentStage.oTitle : currentStage.aTitle}
              </h2>
            </div>

            <p
              className={`text-sm leading-relaxed ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {level === 'o_level' ? currentStage.oDescription : currentStage.aDescription}
            </p>

            {/* Chromosomes in each cell readout */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${cardBg}`}>
              <span
                className={`text-xs font-semibold ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Chromosomes in each cell
              </span>
              <div className="text-right">
                <div className="text-lg font-black tabular-nums leading-none">
                  {currentStage.chromosomesPerCell}
                </div>
                <div
                  className={`text-[11px] font-medium mt-0.5 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {currentStage.ploidyLabel}
                </div>
              </div>
            </div>

            {/* Maternal / Paternal Chromosome Bar Summary (matching Screenshot 1!) */}
            <div className="space-y-2.5">
              <div
                className={`text-xs font-semibold ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {currentStage.cellCount === 2 ? 'The two identical daughter cells:' : 'Chromosome set in this cell:'}
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {Array.from({ length: currentStage.cellCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl border flex items-end gap-1.5 ${
                      darkMode ? 'bg-[#1d2230] border-white/[0.1]' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-6 rounded-full bg-[#e25b88]" title="Maternal chromosome 1 (long)" />
                    <span className="w-1.5 h-6 rounded-full bg-[#4b93e8]" title="Paternal chromosome 1 (long)" />
                    <span className="w-1.5 h-4 rounded-full bg-[#e25b88]" title="Maternal chromosome 2 (short)" />
                    <span className="w-1.5 h-4 rounded-full bg-[#4b93e8]" title="Paternal chromosome 2 (short)" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-3.5 rounded-full bg-[#e25b88] inline-block" />
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>from the mother</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-3.5 rounded-full bg-[#4b93e8] inline-block" />
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>from the father</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick NECTA Key Takeaway */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode
                ? 'bg-cyan-500/10 border-cyan-400/25 text-cyan-100'
                : 'bg-cyan-50 border-cyan-200 text-cyan-950'
            }`}
          >
            <strong className="font-bold">NECTA Biology Note:</strong> Mitosis preserves chromosome number (
            <span className="font-mono font-bold">2n → 2n</span>), producing 2 genetically identical somatic cells for growth and tissue repair.
          </div>
        </aside>
      </div>

      {/* UNIFIED COLLAPSIBLE BOTTOM CONTROL DOCK (Scrubber + 8 Stage Buttons) */}
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
                <span>Show Timeline Controls</span>
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

              {/* 4-Chapter Interactive Video Scrubber */}
              <div className="flex-1 min-w-[200px] grid grid-cols-4 gap-1.5 items-center">
                {MITOSIS_LESSON_CHAPTERS.map((ch) => {
                  const span = ch.endSec - ch.startSec;
                  const fillPct = Math.max(0, Math.min(1, (lessonTime - ch.startSec) / span)) * 100;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
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
              {MITOSIS_LESSON_CHAPTERS.map((ch) => {
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
                    setWatchLessonActive(false);
                    setIsPlaying(false);
                    const val = Number(e.target.value);
                    setProgress(val);
                    targetProgressRef.current = val;
                  }}
                  aria-label="Mitosis timeline progress"
                  className="w-full accent-cyan-500 cursor-pointer"
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

            {/* Row 2: 8 Stage Jump Buttons (matching Reference Screenshot 1!) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {MITOSIS_STAGES.map((stage) => {
                const isActive = currentStage.id === stage.id;
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Mitosis3DSimulation;
