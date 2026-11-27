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
  RotateCcw,
  Sparkles,
  Tag,
} from 'lucide-react';
import { MathFormula } from './MathFormula';
import { naturalMathToLatex, parseQuadraticCoefficients } from './mathFormulaParser';

export interface Quadratic3DSimulationProps {
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

const LESSON_DURATION_SEC = 65;

const LESSON_CHAPTERS: LessonChapter[] = [
  {
    index: 0,
    title: 'Shape & direction (coefficient a)',
    startSec: 0,
    endSec: 17,
    oCaption:
      'In y = ax² + bx + c, the value of a controls whether the parabola opens upward (U-shape, a > 0) or downward (∩-shape, a < 0), and how steep it is.',
    aCaption:
      'The leading coefficient a governs curvature (d²y/dx² = 2a): a > 0 produces a global minimum turning point; a < 0 gives a global maximum.',
  },
  {
    index: 1,
    title: 'Vertex & axis of symmetry',
    startSec: 17,
    endSec: 34,
    oCaption:
      'Changing b shifts the turning point (vertex) left and right along the axis of symmetry x = −b / (2a).',
    aCaption:
      'Setting dy/dx = 2ax + b = 0 locates the stationary point at x = −b/(2a), matching completed-square form y = a(x − h)² + k.',
  },
  {
    index: 2,
    title: 'Vertical shift & y-intercept (c)',
    startSec: 34,
    endSec: 50,
    oCaption:
      'The constant c moves the entire curve straight up or down without changing its shape, marking the exact y-intercept (0, c).',
    aCaption:
      'Translating vertically by c alters the number of real roots without affecting the gradient dy/dx or the x-coordinate of the turning point.',
  },
  {
    index: 3,
    title: 'Roots & the discriminant Δ = b² − 4ac',
    startSec: 50,
    endSec: 65,
    oCaption:
      'Where the curve crosses the x-axis are the real roots! If Δ > 0 there are 2 roots; Δ = 0 touches once; Δ < 0 never crosses the x-axis.',
    aCaption:
      'By the quadratic formula x = (−b ± √Δ)/(2a), Δ > 0 yields 2 distinct real roots, Δ = 0 gives a repeated root, and Δ < 0 produces complex conjugates.',
  },
];

interface QuadChallenge {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  check: (a: number, b: number, c: number) => boolean;
}

const QUAD_CHALLENGES: QuadChallenge[] = [
  {
    id: 'ch_repeated_root',
    title: 'Exact Repeated Root (Δ = 0)',
    prompt: 'Make the parabola sit right on the x-axis with exactly ONE repeated root (Δ = b² − 4ac = 0, a ≠ 0)!',
    hint: 'Try a = 1, b = −2, c = 1 (or a = 1, b = 4, c = 4).',
    check: (a, b, c) => Math.abs(a) >= 0.2 && Math.abs(b * b - 4 * a * c) < 0.08,
  },
  {
    id: 'ch_inverted_vertex',
    title: 'Inverted Arch with Max at y = 4',
    prompt: 'Flip the parabola upside-down (a < 0) so its maximum turning point sits at height y = 4!',
    hint: 'Set a = −1, b = 0, c = 4 (or shift b and adjust c so vertex y = 4).',
    check: (a, b, c) => {
      if (a >= -0.1) return false;
      const vx = -b / (2 * a);
      const vy = a * vx * vx + b * vx + c;
      return Math.abs(vy - 4) <= 0.15;
    },
  },
  {
    id: 'ch_no_real_roots',
    title: 'Floating Parabola (Δ < 0)',
    prompt: 'Lift an upward parabola (a > 0) completely above the x-axis so it has NO real roots (Δ < 0)!',
    hint: 'Keep a = 1, b = 0 and raise c above 1.',
    check: (a, b, c) => a > 0.2 && b * b - 4 * a * c < -0.5,
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

const _vProj = new THREE.Vector3();

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

function formatEquation(a: number, b: number, c: number): string {
  const parts: string[] = [];
  if (Math.abs(a) > 0.01) {
    parts.push(`${a === 1 ? '' : a === -1 ? '−' : a.toFixed(1)}x²`);
  }
  if (Math.abs(b) > 0.01) {
    const sign = b > 0 ? (parts.length ? ' + ' : '') : parts.length ? ' − ' : '−';
    const mag = Math.abs(b);
    parts.push(`${sign}${mag === 1 ? '' : mag.toFixed(1)}x`);
  }
  if (Math.abs(c) > 0.01 || parts.length === 0) {
    const sign = c >= 0 ? (parts.length ? ' + ' : '') : parts.length ? ' − ' : '−';
    parts.push(`${sign}${Math.abs(c).toFixed(1)}`);
  }
  return `y = ${parts.join('')}`;
}

export const Quadratic3DSimulation: React.FC<Quadratic3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 2',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [aVal, setAVal] = useState<number>(1.0);
  const [bVal, setBVal] = useState<number>(-2.0);
  const [cVal, setCVal] = useState<number>(-3.0);
  const [writtenQuadText, setWrittenQuadText] = useState<string>('x^2 - 2x - 3');
  const [writtenQuadError, setWrittenQuadError] = useState<string>('');

  const handleApplyWrittenQuad = () => {
    const parsed = parseQuadraticCoefficients(writtenQuadText);
    if (!parsed) {
      setWrittenQuadError('Write a quadratic or linear formula in x, e.g. x^2 - 2x - 3');
      return;
    }
    setWrittenQuadError('');
    setWatchLessonActive(false);
    setAVal(Math.max(-3, Math.min(3, parsed.a)));
    setBVal(Math.max(-6, Math.min(6, parsed.b)));
    setCVal(Math.max(-5, Math.min(5, parsed.c)));
  };

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
  const [challengeIdx, setChallengeIdx] = useState<number | null>(null);

  // Derived Quadratic Properties
  const mathProps = useMemo(() => {
    const isLinear = Math.abs(aVal) < 0.05;
    if (isLinear) {
      const root = Math.abs(bVal) > 0.05 ? -cVal / bVal : null;
      return {
        isLinear: true,
        discriminant: null as number | null,
        vertex: null as { x: number; y: number } | null,
        roots: root !== null ? [root] : [],
        rootType: root !== null ? 'Linear (1 x-intercept)' : 'Horizontal line',
      };
    }
    const disc = bVal * bVal - 4 * aVal * cVal;
    const vx = -bVal / (2 * aVal);
    const vy = aVal * vx * vx + bVal * vx + cVal;
    let roots: number[] = [];
    let rootType = 'No real roots (Δ < 0)';
    if (disc > 0.02) {
      const sq = Math.sqrt(disc);
      roots = [(-bVal - sq) / (2 * aVal), (-bVal + sq) / (2 * aVal)].sort((m, n) => m - n);
      rootType = '2 distinct real roots (Δ > 0)';
    } else if (Math.abs(disc) <= 0.02) {
      roots = [vx];
      rootType = '1 repeated real root (Δ = 0)';
    }
    return { isLinear: false, discriminant: disc, vertex: { x: vx, y: vy }, roots, rootType };
  }, [aVal, bVal, cVal]);

  const valueTable = useMemo(() => {
    return [-2, -1, 0, 1, 2, 3].map((x) => ({
      x,
      y: Number((aVal * x * x + bVal * x + cVal).toFixed(1)),
    }));
  }, [aVal, bVal, cVal]);

  const activeChapter = useMemo(() => {
    for (let i = LESSON_CHAPTERS.length - 1; i >= 0; i--) {
      if (lessonTimeSec >= LESSON_CHAPTERS[i].startSec) return LESSON_CHAPTERS[i];
    }
    return LESSON_CHAPTERS[0];
  }, [lessonTimeSec]);

  const activeChallenge = challengeIdx !== null ? QUAD_CHALLENGES[challengeIdx] : null;
  const challengeSolved = useMemo(() => {
    if (!activeChallenge) return false;
    return activeChallenge.check(aVal, bVal, cVal);
  }, [activeChallenge, aVal, bVal, cVal]);

  // Mutable refs for 60fps Three.js loop
  const aRef = useRef<number>(aVal);
  const bRef = useRef<number>(bVal);
  const cRef = useRef<number>(cVal);
  const darkModeRef = useRef<boolean>(darkMode);
  const showLabelsRef = useRef<boolean>(showLabels);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonPausedRef = useRef<boolean>(lessonPaused);
  const lessonTimeRef = useRef<number>(lessonTimeSec);
  const lessonSpeedRef = useRef<number>(lessonSpeed);
  const lastUiSyncRef = useRef<number>(0);
  const lastLabelPushRef = useRef<number>(0);

  useEffect(() => {
    aRef.current = aVal;
  }, [aVal]);
  useEffect(() => {
    bRef.current = bVal;
  }, [bVal]);
  useEffect(() => {
    cRef.current = cVal;
  }, [cVal]);
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

  // ==================== THREE.JS 3D PARABOLA STUDIO ====================
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
    camera.position.set(1.8, 1.4, 14.5);

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
    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.2));
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.9);
    dirLight.position.set(6, 10, 8);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 8.0;
    controls.maxDistance = 24.0;
    controls.target.set(0, 0, 0);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };

    // Scale: 1 mathematical unit = 0.65 world units (covers x in [-6, 6], y in [-6, 6])
    const UNIT = 0.65;
    const HALF_SPAN = 6 * UNIT;

    // 1. Translucent Frosted 3D Coordinate Glass Board
    const boardMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.08,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide,
      })
    );
    const boardMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(HALF_SPAN * 2, HALF_SPAN * 2)), boardMat);
    boardMesh.position.z = -0.05;
    scene.add(boardMesh);

    // Subtle Grid Lines
    const gridPts: THREE.Vector3[] = [];
    for (let i = -6; i <= 6; i++) {
      if (i === 0) continue;
      gridPts.push(new THREE.Vector3(i * UNIT, -HALF_SPAN, -0.03), new THREE.Vector3(i * UNIT, HALF_SPAN, -0.03));
      gridPts.push(new THREE.Vector3(-HALF_SPAN, i * UNIT, -0.03), new THREE.Vector3(HALF_SPAN, i * UNIT, -0.03));
    }
    const gridMat = trackMat(new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.35 }));
    scene.add(new THREE.LineSegments(trackGeo(new THREE.BufferGeometry().setFromPoints(gridPts)), gridMat));

    // Brushed Metallic X and Y Axes Cylinders + Arrow Cones
    const axisMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 }));
    const xAxis = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.025, 0.025, HALF_SPAN * 2 + 0.4, 14)), axisMat);
    xAxis.rotation.z = Math.PI / 2;
    const yAxis = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.025, 0.025, HALF_SPAN * 2 + 0.4, 14)), axisMat);
    const xArrow = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.085, 0.26, 14)), axisMat);
    xArrow.rotation.z = -Math.PI / 2;
    xArrow.position.x = HALF_SPAN + 0.25;
    const yArrow = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.085, 0.26, 14)), axisMat);
    yArrow.position.y = HALF_SPAN + 0.25;
    scene.add(xAxis, yAxis, xArrow, yArrow);

    // 2. Dynamic 3D Glowing Parabola Ribbon (Extruded Strip along Curve — updated in-place with ZERO GC!)
    const CURVE_SAMPLES = 96;
    const ribbonPos = new Float32Array((CURVE_SAMPLES + 1) * 2 * 3);
    const ribbonIdx: number[] = [];
    for (let i = 0; i < CURVE_SAMPLES; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      ribbonIdx.push(a, b, c, b, d, c);
    }
    const ribbonGeo = trackGeo(new THREE.BufferGeometry());
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPos, 3));
    ribbonGeo.setIndex(ribbonIdx);
    const ribbonMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: new THREE.Color(0xfbbf24),
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.35,
        side: THREE.DoubleSide,
      })
    );
    const parabolaRibbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    scene.add(parabolaRibbon);

    // Core glowing 3D centerline tube highlight
    const linePos = new Float32Array((CURVE_SAMPLES + 1) * 3);
    const lineGeo = trackGeo(new THREE.BufferGeometry());
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const curveCenterLine = new THREE.Line(
      lineGeo,
      trackMat(new THREE.LineBasicMaterial({ color: 0xfef08a }))
    );
    scene.add(curveCenterLine);

    // 3. Axis of Symmetry Vertical Plane / Line
    const symLineMat = trackMat(
      new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.16, gapSize: 0.12 })
    );
    const symLineGeo = trackGeo(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -HALF_SPAN, 0.04),
      new THREE.Vector3(0, HALF_SPAN, 0.04),
    ]));
    const symLine = new THREE.Line(symLineGeo, symLineMat);
    symLine.computeLineDistances();
    scene.add(symLine);

    // 4. Key Glowing 3D Feature Orbs: Vertex (sky), Root 1 & Root 2 (emerald), Y-Intercept (violet)
    const orbGeo = trackGeo(new THREE.SphereGeometry(0.145, 22, 18));
    const vertexOrb = new THREE.Mesh(
      orbGeo,
      trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9, roughness: 0.15 }))
    );
    const root1Orb = new THREE.Mesh(
      orbGeo,
      trackMat(new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9, roughness: 0.15 }))
    );
    const root2Orb = new THREE.Mesh(
      orbGeo,
      trackMat(new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9, roughness: 0.15 }))
    );
    const yIntOrb = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.12, 18, 16)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x7c3aed, emissiveIntensity: 0.85, roughness: 0.18 }))
    );
    scene.add(vertexOrb, root1Orb, root2Orb, yIntOrb);

    // Dynamic 3D Label Anchors
    const vertexAnchor = new THREE.Vector3();
    const root1Anchor = new THREE.Vector3();
    const root2Anchor = new THREE.Vector3();
    const yIntAnchor = new THREE.Vector3();

    const labelSpecs: LabelSpec[] = [
      { id: 'vertex', text: 'Vertex (turning point)', worldPos: vertexAnchor, offsetX: 88, offsetY: 26, visible: () => vertexOrb.visible },
      { id: 'r1', text: 'Root x₁', worldPos: root1Anchor, offsetX: -54, offsetY: -28, visible: () => root1Orb.visible },
      { id: 'r2', text: 'Root x₂', worldPos: root2Anchor, offsetX: 54, offsetY: -28, visible: () => root2Orb.visible },
      { id: 'yint', text: 'y-intercept (0, c)', worldPos: yIntAnchor, offsetX: -84, offsetY: 22, visible: () => yIntOrb.visible },
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

    const resizeObserver = new ResizeObserver(() => {
      if (!mountEl) return;
      const nw = Math.max(mountEl.clientWidth, 280);
      const nh = Math.max(mountEl.clientHeight, 320);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObserver.observe(mountEl);

    if (!isSoftwareGl) renderer.compile(scene, camera);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let dA = aRef.current;
    let dB = bRef.current;
    let dC = cRef.current;

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
      const isDark = darkModeRef.current;
      scene.background = isDark ? bgDark : bgLight;
      boardMat.color.setHex(isDark ? 0x1e293b : 0xffffff);
      boardMat.opacity = isDark ? 0.28 : 0.65;

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
          // Chapter 1: Sweep a from +1.5 -> -1.2
          const f = t / 17;
          aRef.current = Number((1.5 - Math.sin(f * Math.PI) * 2.5).toFixed(1));
          bRef.current = 0;
          cRef.current = -1;
        } else if (t < 34) {
          // Chapter 2: Sweep b to move vertex horizontally
          const f = (t - 17) / 17;
          aRef.current = 1.0;
          bRef.current = Number((-4 + f * 8).toFixed(1));
          cRef.current = -1;
        } else if (t < 50) {
          // Chapter 3: Vertical shift c from -4 -> +3
          const f = (t - 34) / 16;
          aRef.current = 1.0;
          bRef.current = -2.0;
          cRef.current = Number((-4 + f * 7).toFixed(1));
        } else {
          // Chapter 4: Cycle Δ > 0 -> Δ = 0 -> Δ < 0
          const f = (t - 50) / 15;
          aRef.current = 1.0;
          bRef.current = -2.0;
          cRef.current = f < 0.33 ? -3.0 : f < 0.66 ? 1.0 : 3.0;
        }

        const nowTs = performance.now();
        if (nowTs - lastUiSyncRef.current > 110) {
          lastUiSyncRef.current = nowTs;
          setLessonTimeSec(Number(t.toFixed(2)));
          setAVal(aRef.current);
          setBVal(bRef.current);
          setCVal(cRef.current);
        }
      }

      dA = THREE.MathUtils.damp(dA, aRef.current, 7, delta);
      dB = THREE.MathUtils.damp(dB, bRef.current, 7, delta);
      dC = THREE.MathUtils.damp(dC, cRef.current, 7, delta);

      // Update 3D extruded parabola ribbon vertices in-place
      const rAttr = ribbonGeo.getAttribute('position') as THREE.BufferAttribute;
      const lAttr = lineGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i <= CURVE_SAMPLES; i++) {
        const xMath = -6 + (i / CURVE_SAMPLES) * 12;
        const yMath = THREE.MathUtils.clamp(dA * xMath * xMath + dB * xMath + dC, -6.2, 6.2);
        const wx = xMath * UNIT;
        const wy = yMath * UNIT;
        rAttr.setXYZ(i * 2, wx, wy, 0.24);
        rAttr.setXYZ(i * 2 + 1, wx, wy, -0.02);
        lAttr.setXYZ(i, wx, wy, 0.25);
      }
      rAttr.needsUpdate = true;
      lAttr.needsUpdate = true;
      ribbonGeo.computeVertexNormals();

      // Update key glowing markers
      const isQuad = Math.abs(dA) >= 0.05;
      if (isQuad) {
        const vx = -dB / (2 * dA);
        const vy = dA * vx * vx + dB * vx + dC;
        const inBounds = Math.abs(vx) <= 6 && Math.abs(vy) <= 6;
        vertexOrb.visible = inBounds;
        vertexOrb.position.set(vx * UNIT, vy * UNIT, 0.14);
        vertexAnchor.copy(vertexOrb.position);

        symLine.visible = Math.abs(vx) <= 6;
        symLine.position.x = vx * UNIT;

        const disc = dB * dB - 4 * dA * dC;
        if (disc > 0.02) {
          const sq = Math.sqrt(disc);
          const x1 = (-dB - sq) / (2 * dA);
          const x2 = (-dB + sq) / (2 * dA);
          root1Orb.visible = Math.abs(x1) <= 6;
          root1Orb.position.set(x1 * UNIT, 0, 0.14);
          root1Anchor.copy(root1Orb.position);
          root2Orb.visible = Math.abs(x2) <= 6;
          root2Orb.position.set(x2 * UNIT, 0, 0.14);
          root2Anchor.copy(root2Orb.position);
        } else if (Math.abs(disc) <= 0.02) {
          root1Orb.visible = Math.abs(vx) <= 6;
          root1Orb.position.set(vx * UNIT, 0, 0.14);
          root1Anchor.copy(root1Orb.position);
          root2Orb.visible = false;
        } else {
          root1Orb.visible = false;
          root2Orb.visible = false;
        }
      } else {
        vertexOrb.visible = false;
        symLine.visible = false;
        const r = Math.abs(dB) > 0.05 ? -dC / dB : 99;
        root1Orb.visible = Math.abs(r) <= 6;
        root1Orb.position.set(r * UNIT, 0, 0.14);
        root1Anchor.copy(root1Orb.position);
        root2Orb.visible = false;
      }

      yIntOrb.visible = Math.abs(dC) <= 6;
      yIntOrb.position.set(0, dC * UNIT, 0.14);
      yIntAnchor.copy(yIntOrb.position);

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
      resizeObserver.disconnect();
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

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
                ? 'bg-amber-400 text-slate-950'
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
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
              showLabels
                ? darkMode
                  ? 'bg-amber-500/15 border-amber-400/60 text-amber-200'
                  : 'bg-amber-50 border-amber-500/60 text-amber-800'
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
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
              activeChallenge
                ? 'bg-amber-400 border-amber-300 text-slate-950'
                : darkMode
                ? 'bg-white/[0.05] border-white/[0.12] text-amber-300 hover:bg-white/[0.1]'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeChallenge ? 'Exit Challenge' : 'Try Math Challenge'}</span>
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
              className={`px-3 py-1 rounded-full font-bold cursor-pointer ${
                level === 'o_level'
                  ? darkMode ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              O-Level
            </button>
            <button
              type="button"
              onClick={() => setLevel('a_level')}
              className={`px-3 py-1 rounded-full font-bold cursor-pointer ${
                level === 'a_level'
                  ? darkMode ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A-Level
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`p-2 rounded-xl border cursor-pointer ${
              darkMode ? 'bg-[#1a1f2d] border-white/[0.1] text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
        {/* 3D PARABOLA STAGE (8 cols) */}
        <div
          className={`lg:col-span-8 relative flex flex-col ${
            isFullscreen ? 'min-h-[60vh]' : 'h-[450px] sm:h-[540px] lg:h-[600px]'
          }`}
        >
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

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
                style={{ left: `${lbl.lx}px`, top: `${lbl.ly}px`, transform: 'translate(-50%, -50%)' }}
                className={`pointer-events-none absolute px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap shadow-xs border ${
                  darkMode ? 'bg-[#121622] border-white/[0.16] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {lbl.text}
              </div>
            ))}

          {watchLessonActive && (
            <div className="pointer-events-none absolute bottom-3 inset-x-4 flex justify-center">
              <div
                className={`max-w-2xl px-5 py-3 rounded-2xl border text-center ${
                  darkMode ? 'bg-[#10141f]/95 border-white/[0.14] text-white' : 'bg-white/95 border-slate-300 text-slate-900 shadow-md'
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
        </div>

        {/* RIGHT ALGEBRAIC ANALYSIS PANEL (4 cols) */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-4 sm:p-5 flex flex-col justify-between gap-3.5 lg:max-h-[600px] overflow-y-auto ${
            darkMode ? 'bg-[#131722] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3.5">
            <div>
              <div className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {mathProps.isLinear ? 'Linear Function' : 'Quadratic Function'}
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-amber-500">
                <MathFormula tex={naturalMathToLatex(formatEquation(aVal, bVal, cVal), '')} />
              </div>
              <p className={`text-xs mt-1 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {mathProps.rootType}
              </p>
            </div>

            {/* Direct Write Formula Option */}
            <div className={`p-2.5 rounded-xl border space-y-1.5 ${cardBg}`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-amber-500 uppercase tracking-wider">Write Quadratic Formula</span>
                <span className="opacity-75">
                  <MathFormula tex={naturalMathToLatex(writtenQuadText, 'y = ')} />
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={writtenQuadText}
                  onChange={(e) => {
                    setWrittenQuadText(e.target.value);
                    setWrittenQuadError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyWrittenQuad();
                    }
                  }}
                  placeholder="e.g. x^2 - 2x - 3 or -x^2 + 4"
                  className={`flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                    darkMode
                      ? 'bg-[#121622] border-white/[0.14] text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApplyWrittenQuad}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shrink-0"
                >
                  Plot
                </button>
              </div>
              {writtenQuadError && (
                <div className="text-[11px] font-bold text-rose-500">{writtenQuadError}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-bold uppercase text-sky-500">
                  Vertex <MathFormula tex="(h, k)" />
                </div>
                <div className="font-mono font-black text-sm mt-0.5">
                  {mathProps.vertex
                    ? `(${mathProps.vertex.x.toFixed(2)}, ${mathProps.vertex.y.toFixed(2)})`
                    : 'None (linear)'}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-bold uppercase text-emerald-500">
                  Discriminant <MathFormula tex="\Delta = b^2 - 4ac" />
                </div>
                <div className="font-mono font-black text-sm mt-0.5">
                  {mathProps.discriminant !== null ? mathProps.discriminant.toFixed(2) : '—'}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border col-span-2 ${cardBg}`}>
                <div className="text-[10px] font-bold uppercase text-violet-500">Real x-intercepts (Roots)</div>
                <div className="font-mono font-black text-sm mt-0.5">
                  {mathProps.roots.length === 0 ? (
                    'None (curve does not cross x-axis)'
                  ) : (
                    <MathFormula
                      tex={mathProps.roots.map((r, i) => `x_{${i + 1}} = ${r.toFixed(2)}`).join(', \\; ')}
                    />
                  )}
                </div>
              </div>
            </div>

            {activeChallenge && (
              <div
                className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                  challengeSolved
                    ? darkMode ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-100' : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : darkMode ? 'bg-amber-500/10 border-amber-400/40 text-amber-100' : 'bg-amber-50 border-amber-300 text-amber-950'
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
                    onClick={() => setChallengeIdx((p) => (p === null ? 0 : (p + 1) % QUAD_CHALLENGES.length))}
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    Next Math Challenge →
                  </button>
                )}
              </div>
            )}

            {/* Live Coordinate Value Table */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${cardBg}`}>
              <div className="text-[11px] font-bold">Coordinate Table (x, y)</div>
              <div className="grid grid-cols-6 gap-1 text-center font-mono text-[11px] tabular-nums">
                {valueTable.map((row) => (
                  <div key={row.x} className={`p-1.5 rounded-lg ${darkMode ? 'bg-white/[0.04]' : 'bg-slate-50'}`}>
                    <div className="text-[10px] text-slate-400">x={row.x}</div>
                    <div className="font-bold text-amber-500">{row.y}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode ? 'bg-amber-500/10 border-amber-400/25 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="font-bold flex flex-wrap items-center gap-1.5">
              {level === 'o_level' ? (
                <>
                  <span>Axis of symmetry:</span>
                  <MathFormula tex="x = -\frac{b}{2a}" />
                </>
              ) : (
                <>
                  <span>Derivative:</span>
                  <MathFormula
                    tex={`\\frac{dy}{dx} = ${(2 * aVal).toFixed(1)}x ${
                      bVal >= 0 ? '+' : '-'
                    } ${Math.abs(bVal).toFixed(1)}`}
                  />
                </>
              )}
            </div>
            <div className="text-[11px] mt-1 opacity-90 flex flex-wrap items-center gap-1.5">
              {level === 'o_level' ? (
                <>
                  <span>Quadratic formula:</span>
                  <MathFormula tex="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
                </>
              ) : (
                <>
                  <span>Second derivative:</span>
                  <MathFormula tex={`\\frac{d^2y}{dx^2} = ${(2 * aVal).toFixed(1)}`} />
                  <span>({aVal > 0 ? 'Minimum' : aVal < 0 ? 'Maximum' : 'Inflection/Linear'})</span>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM DOCK */}
      <div className={`border-t ${darkMode ? 'border-white/[0.08] bg-[#10141e]' : 'border-slate-200 bg-slate-50'}`}>
        {!watchLessonActive && (
          <div className="flex justify-center -mt-3">
            <button
              type="button"
              onClick={() => setDockCollapsed((p) => !p)}
              className={`px-3 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${dockBg}`}
            >
              {dockCollapsed ? <><ChevronUp className="w-3.5 h-3.5" /><span>Show Controls</span></> : <><ChevronDown className="w-3.5 h-3.5" /><span>Hide Controls</span></>}
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
                    className={`h-2.5 rounded-full overflow-hidden cursor-pointer ${darkMode ? 'bg-white/15' : 'bg-slate-300'}`}
                  >
                    <div className="h-full bg-amber-400 transition-all duration-100" style={{ width: `${Math.round(fill * 100)}%` }} />
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
              onClick={() => {
                setWatchLessonActive(false);
                setLessonPaused(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer shrink-0 ${
                darkMode ? 'bg-[#1c2231] border-white/[0.16] text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              Take over from here
            </button>
          </div>
        ) : (
          !dockCollapsed && (
            <div className="px-4 py-3.5 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-center text-xs">
              <label className="space-y-1">
                <div className="flex justify-between font-bold tabular-nums">
                  <span>Coefficient a</span>
                  <span className="text-amber-500">{aVal.toFixed(1)}</span>
                </div>
                <input type="range" min={-3} max={3} step={0.5} value={aVal} onChange={(e) => setAVal(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
              </label>
              <label className="space-y-1">
                <div className="flex justify-between font-bold tabular-nums">
                  <span>Coefficient b</span>
                  <span className="text-sky-500">{bVal.toFixed(1)}</span>
                </div>
                <input type="range" min={-6} max={6} step={0.5} value={bVal} onChange={(e) => setBVal(Number(e.target.value))} className="w-full accent-sky-500 cursor-pointer" />
              </label>
              <label className="space-y-1">
                <div className="flex justify-between font-bold tabular-nums">
                  <span>Constant c</span>
                  <span className="text-violet-500">{cVal.toFixed(1)}</span>
                </div>
                <input type="range" min={-5} max={5} step={0.5} value={cVal} onChange={(e) => setCVal(Number(e.target.value))} className="w-full accent-violet-500 cursor-pointer" />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAVal(1);
                    setBVal(-2);
                    setCVal(-3);
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    darkMode ? 'bg-[#1a2030] border-white/[0.12] text-slate-200 hover:bg-[#252d40]' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset x²−2x−3</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Quadratic3DSimulation;
