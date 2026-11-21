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

export interface TrigWaves3DSimulationProps {
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
    title: 'The unit circle & angle θ',
    startSec: 0,
    endSec: 17,
    oCaption:
      'As the glowing radius arm rotates counter-clockwise around the circle, its vertical height gives sin(θ) and its horizontal width gives cos(θ).',
    aCaption:
      'A point P(cos θ, sin θ) on the unit circle satisfies cos²θ + sin²θ = 1, defining circular trigonometric functions for every real angle θ in radians.',
  },
  {
    index: 1,
    title: 'Generating the sine wave',
    startSec: 17,
    endSec: 34,
    oCaption:
      'Watch the cyan Sine wave unroll straight from the height of point P: it starts at 0, peaks at 90° (+1), returns to 0 at 180°, and troughs at 270° (−1)!',
    aCaption:
      'Unfolding vertical displacement y = A sin(θ) over [0, 2π] generates a smooth periodic sinusoid with period 2π and zeroes at integer multiples of π.',
  },
  {
    index: 2,
    title: 'Cosine & 90° phase shift',
    startSec: 34,
    endSec: 50,
    oCaption:
      'The violet Cosine wave traces the horizontal position of P — it looks just like Sine, shifted 90° ahead so cos(0°) = +1!',
    aCaption:
      'Because cos(θ) = sin(θ + π/2), the cosine waveform leads the sine wave by a quarter-cycle phase difference of π/2 radians.',
  },
  {
    index: 3,
    title: 'Amplitude (A) & frequency (B)',
    startSec: 50,
    endSec: 65,
    oCaption:
      'Increasing Amplitude A stretches the wave taller, while increasing Frequency B packs more complete waves into every 360° cycle!',
    aCaption:
      'In y = A sin(Bx), amplitude |A| scales vertical range to [−A, +A] while angular frequency B compresses period to T = 2π / B (360° / B).',
  },
];

interface TrigChallenge {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  check: (angleDeg: number, amp: number, freq: number) => boolean;
}

const TRIG_CHALLENGES: TrigChallenge[] = [
  {
    id: 'ch_sin_half',
    title: 'Special Angle: sin(θ) = 0.50',
    prompt: 'Pause the rotation and set angle θ so sin(θ) = 0.50 in Quadrant I!',
    hint: 'Remember the special triangle angle: sin(30°) = 0.50.',
    check: (deg) => Math.abs((deg % 360) - 30) <= 2,
  },
  {
    id: 'ch_double_wave',
    title: 'Tall Double-Frequency Wave',
    prompt: 'Set Amplitude A = 2.0 and Frequency B = 2 so two tall complete waves fit inside 360°!',
    hint: 'Use the Amplitude and Frequency sliders below.',
    check: (_deg, amp, freq) => Math.abs(amp - 2.0) < 0.08 && Math.abs(freq - 2.0) < 0.08,
  },
  {
    id: 'ch_pythagoras',
    title: '45° Equal Legs (sin θ = cos θ)',
    prompt: 'Rotate point P to 45° where sin(θ) and cos(θ) are equal (≈ 0.71)!',
    hint: 'Set Angle θ = 45° (π/4 rad).',
    check: (deg) => Math.abs((deg % 360) - 45) <= 2,
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

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export const TrigWaves3DSimulation: React.FC<TrigWaves3DSimulationProps> = ({
  darkMode = false,
  activeClass = 'Form 4',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [angleDeg, setAngleDeg] = useState<number>(45);
  const [amplitude, setAmplitude] = useState<number>(1.5);
  const [frequency, setFrequency] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showCosine, setShowCosine] = useState<boolean>(true);

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

  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.abs(cosVal) < 0.02 ? null : sinVal / cosVal;
  const periodDeg = Math.round(360 / frequency);

  const activeChapter = useMemo(() => {
    for (let i = LESSON_CHAPTERS.length - 1; i >= 0; i--) {
      if (lessonTimeSec >= LESSON_CHAPTERS[i].startSec) return LESSON_CHAPTERS[i];
    }
    return LESSON_CHAPTERS[0];
  }, [lessonTimeSec]);

  const activeChallenge = challengeIdx !== null ? TRIG_CHALLENGES[challengeIdx] : null;
  const challengeSolved = useMemo(() => {
    if (!activeChallenge) return false;
    return activeChallenge.check(angleDeg, amplitude, frequency);
  }, [activeChallenge, angleDeg, amplitude, frequency]);

  const angleDegRef = useRef<number>(angleDeg);
  const ampRef = useRef<number>(amplitude);
  const freqRef = useRef<number>(frequency);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const showCosRef = useRef<boolean>(showCosine);
  const darkModeRef = useRef<boolean>(darkMode);
  const showLabelsRef = useRef<boolean>(showLabels);
  const watchLessonRef = useRef<boolean>(watchLessonActive);
  const lessonPausedRef = useRef<boolean>(lessonPaused);
  const lessonTimeRef = useRef<number>(lessonTimeSec);
  const lessonSpeedRef = useRef<number>(lessonSpeed);
  const lastUiSyncRef = useRef<number>(0);
  const lastLabelPushRef = useRef<number>(0);

  useEffect(() => {
    angleDegRef.current = angleDeg;
  }, [angleDeg]);
  useEffect(() => {
    ampRef.current = amplitude;
  }, [amplitude]);
  useEffect(() => {
    freqRef.current = frequency;
  }, [frequency]);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);
  useEffect(() => {
    showCosRef.current = showCosine;
  }, [showCosine]);
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

  // ==================== THREE.JS 3D UNIT CIRCLE + SINE & COSINE WAVE RIBBONS ====================
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
    camera.position.set(2.8, 2.1, 10.6);

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

    scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.15));
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.9);
    dirLight.position.set(6, 9, 7);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 6.2;
    controls.maxDistance = 18.0;
    controls.target.set(0.6, 0.0, 0);

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

    // Unit Circle centered at (-2.4, 0, 0)
    const CIRCLE_X = -2.4;
    const circleGroup = new THREE.Group();
    circleGroup.position.set(CIRCLE_X, 0, 0);
    scene.add(circleGroup);

    const aluminumMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.22, metalness: 0.88 }));
    const glassDiscMat = trackMat(
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, roughness: 0.12, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    const circleRing = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(1.0, 0.045, 16, 64)), aluminumMat);
    const circleGlass = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(1.0, 48)), glassDiscMat);
    circleGroup.add(circleRing, circleGlass);

    // Crosshairs on circle + main Wave Axis extending right from x = -1.2 -> +4.8
    const axisMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.35, metalness: 0.7 }));
    const waveAxis = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 6.2, 12)), axisMat);
    waveAxis.rotation.z = Math.PI / 2;
    waveAxis.position.set(1.8, 0, 0);
    scene.add(waveAxis);

    // Glowing Amber Rotating Radius Arm + Point P
    const armMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.85, roughness: 0.2 }));
    const radiusArmPivot = new THREE.Group();
    const radiusBar = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 1.0, 12)), armMat);
    radiusBar.rotation.z = -Math.PI / 2;
    radiusBar.position.x = 0.5;
    const pointP = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.11, 18, 16)), armMat);
    pointP.position.x = 1.0;
    radiusArmPivot.add(radiusBar, pointP);
    circleGroup.add(radiusArmPivot);

    // Vertical sin(θ) cyan projection leg & Horizontal cos(θ) violet leg + Connector Line to Wave
    const sinLegGeo = trackGeo(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]));
    const sinLeg = new THREE.Line(sinLegGeo, trackMat(new THREE.LineBasicMaterial({ color: 0x22d3ee })));
    const cosLegGeo = trackGeo(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]));
    const cosLeg = new THREE.Line(cosLegGeo, trackMat(new THREE.LineBasicMaterial({ color: 0xa78bfa })));
    const bridgeGeo = trackGeo(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]));
    const bridgeLine = new THREE.Line(bridgeGeo, trackMat(new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.14, gapSize: 0.1 })));
    scene.add(sinLeg, cosLeg, bridgeLine);

    // Glowing Floating 3D SINE Wave Ribbon (Cyan) + COSINE Wave Ribbon (Violet)
    const WAVE_SAMPLES = 100;
    const buildRibbon = (colorHex: number, emissiveHex: number) => {
      const arr = new Float32Array((WAVE_SAMPLES + 1) * 2 * 3);
      const idx: number[] = [];
      for (let i = 0; i < WAVE_SAMPLES; i++) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      const g = trackGeo(new THREE.BufferGeometry());
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      g.setIndex(idx);
      const m = trackMat(
        new THREE.MeshStandardMaterial({
          color: colorHex,
          emissive: new THREE.Color(emissiveHex),
          emissiveIntensity: 0.72,
          roughness: 0.2,
          metalness: 0.2,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        })
      );
      const mesh = new THREE.Mesh(g, m);
      scene.add(mesh);
      return { mesh, geo: g };
    };

    const sinRibbon = buildRibbon(0x22d3ee, 0x06b6d4);
    const cosRibbon = buildRibbon(0xa78bfa, 0x7c3aed);

    const pWorldAnchor = new THREE.Vector3(CIRCLE_X + 1, 1, 0);
    const labelSpecs: LabelSpec[] = [
      { id: 'p', text: 'Point P (cos θ, sin θ)', worldPos: pWorldAnchor, offsetX: -76, offsetY: -36 },
      { id: 'sin', text: 'y = A sin(Bθ)', worldPos: new THREE.Vector3(1.6, 1.4, 0.2), offsetX: 38, offsetY: -34 },
      { id: 'cos', text: 'y = A cos(Bθ)', worldPos: new THREE.Vector3(2.8, -1.2, -0.3), offsetX: 42, offsetY: 32 },
    ];

    function computeProjectedLabels(): ProjectedLabel[] {
      if (!showLabelsRef.current) return [];
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      if (w <= 0 || h <= 0) return [];
      const out: ProjectedLabel[] = [];
      for (const spec of labelSpecs) {
        if (spec.id === 'cos' && !showCosRef.current) continue;
        _vProj.copy(spec.worldPos);
        _vProj.project(camera);
        if (_vProj.z > 1) continue;
        const ax = (_vProj.x * 0.5 + 0.5) * w;
        const ay = (-_vProj.y * 0.5 + 0.5) * h;
        const lx = Math.max(78, Math.min(w - 78, ax + spec.offsetX));
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
    let dAmp = ampRef.current;
    let dFreq = freqRef.current;

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
        angleDegRef.current = (t * 28) % 360;
        if (t < 17) {
          ampRef.current = 1.4;
          freqRef.current = 1.0;
          showCosRef.current = false;
        } else if (t < 34) {
          ampRef.current = 1.5;
          freqRef.current = 1.0;
          showCosRef.current = false;
        } else if (t < 50) {
          ampRef.current = 1.5;
          freqRef.current = 1.0;
          showCosRef.current = true;
        } else {
          const f = (t - 50) / 15;
          ampRef.current = Number((1.2 + Math.sin(f * Math.PI) * 1.0).toFixed(1));
          freqRef.current = f > 0.45 ? 2.0 : 1.0;
          showCosRef.current = true;
        }
      } else if (autoRotateRef.current) {
        angleDegRef.current = (angleDegRef.current + delta * 42) % 360;
      }

      dAmp = THREE.MathUtils.damp(dAmp, ampRef.current, 6, delta);
      dFreq = THREE.MathUtils.damp(dFreq, freqRef.current, 6, delta);
      const theta = (angleDegRef.current * Math.PI) / 180;

      // Scale circle visually to match Amplitude A
      circleGroup.scale.setScalar(dAmp);
      radiusArmPivot.rotation.z = theta;

      const px = CIRCLE_X + Math.cos(theta) * dAmp;
      const py = Math.sin(theta) * dAmp;
      pWorldAnchor.set(px, py, 0.1);

      // Update right-triangle legs + dashed bridge line to wave origin x = -0.3
      const waveStartX = -0.3;
      const sinAttr = sinLegGeo.getAttribute('position') as THREE.BufferAttribute;
      sinAttr.setXYZ(0, px, 0, 0.04);
      sinAttr.setXYZ(1, px, py, 0.04);
      sinAttr.needsUpdate = true;

      const cosAttr = cosLegGeo.getAttribute('position') as THREE.BufferAttribute;
      cosAttr.setXYZ(0, CIRCLE_X, 0, 0.04);
      cosAttr.setXYZ(1, px, 0, 0.04);
      cosAttr.needsUpdate = true;

      const brAttr = bridgeGeo.getAttribute('position') as THREE.BufferAttribute;
      brAttr.setXYZ(0, px, py, 0.06);
      brAttr.setXYZ(1, waveStartX, py, 0.06);
      brAttr.needsUpdate = true;
      bridgeLine.computeLineDistances();

      // Update floating 3D Sine & Cosine wave ribbons unrolling smoothly to the right
      const sPos = sinRibbon.geo.getAttribute('position') as THREE.BufferAttribute;
      const cPos = cosRibbon.geo.getAttribute('position') as THREE.BufferAttribute;
      const waveLen = 5.2;
      for (let i = 0; i <= WAVE_SAMPLES; i++) {
        const u = i / WAVE_SAMPLES;
        const wx = waveStartX + u * waveLen;
        const phase = theta - u * Math.PI * 2 * dFreq;
        const sy = Math.sin(phase) * dAmp;
        const cy = Math.cos(phase) * dAmp;
        sPos.setXYZ(i * 2, wx, sy, 0.22);
        sPos.setXYZ(i * 2 + 1, wx, sy, 0.02);
        cPos.setXYZ(i * 2, wx, cy, -0.18);
        cPos.setXYZ(i * 2 + 1, wx, cy, -0.38);
      }
      sPos.needsUpdate = true;
      cPos.needsUpdate = true;
      sinRibbon.geo.computeVertexNormals();
      cosRibbon.geo.computeVertexNormals();
      cosRibbon.mesh.visible = showCosRef.current;

      const nowTs = performance.now();
      if (nowTs - lastUiSyncRef.current > 85) {
        lastUiSyncRef.current = nowTs;
        setAngleDeg(Math.round(angleDegRef.current));
        if (watchLessonRef.current) {
          setLessonTimeSec(Number(lessonTimeRef.current.toFixed(2)));
          setAmplitude(ampRef.current);
          setFrequency(freqRef.current);
          setShowCosine(showCosRef.current);
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              watchLessonActive
                ? 'bg-cyan-400 text-slate-950'
                : darkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
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
                ? darkMode ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-200' : 'bg-cyan-50 border-cyan-500/60 text-cyan-800'
                : darkMode ? 'bg-white/[0.05] border-white/[0.12] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Labels {showLabels ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCosine((p) => !p)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
              showCosine
                ? darkMode ? 'bg-violet-500/15 border-violet-400/60 text-violet-200' : 'bg-violet-50 border-violet-500/60 text-violet-800'
                : darkMode ? 'bg-white/[0.05] border-white/[0.12] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            Cosine: {showCosine ? 'ON' : 'OFF'}
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
                : darkMode ? 'bg-white/[0.05] border-white/[0.12] text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeChallenge ? 'Exit Challenge' : 'Try Math Challenge'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className={`inline-flex p-0.5 rounded-full border text-xs ${darkMode ? 'bg-[#1a1f2d] border-white/[0.1]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setLevel('o_level')}
              className={`px-3 py-1 rounded-full font-bold cursor-pointer ${
                level === 'o_level' ? (darkMode ? 'bg-white text-slate-950' : 'bg-slate-900 text-white') : darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              O-Level
            </button>
            <button
              type="button"
              onClick={() => setLevel('a_level')}
              className={`px-3 py-1 rounded-full font-bold cursor-pointer ${
                level === 'a_level' ? (darkMode ? 'bg-white text-slate-950' : 'bg-slate-900 text-white') : darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              A-Level
            </button>
          </div>
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`p-2 rounded-xl border cursor-pointer ${
              darkMode ? 'bg-[#1a1f2d] border-white/[0.1] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
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
                  <line x1={lbl.ax} y1={lbl.ay} x2={lbl.lx} y2={lbl.ly} stroke={darkMode ? 'rgba(226,232,240,0.68)' : 'rgba(30,41,59,0.62)'} strokeWidth="1.25" />
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

        {/* RIGHT TRIGONOMETRY READOUT PANEL */}
        <aside
          className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l p-4 sm:p-5 flex flex-col justify-between gap-3.5 lg:max-h-[600px] overflow-y-auto ${
            darkMode ? 'bg-[#131722] border-white/[0.08]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3.5">
            <div>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
                  {angleDeg}°
                </span>
                <span className={`text-sm font-mono font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ({(angleRad / Math.PI).toFixed(2)}π rad)
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-cyan-500 mt-1">
                y = {amplitude.toFixed(1)} sin({frequency.toFixed(1)}θ) · Period = {periodDeg}°
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 tabular-nums text-center">
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-bold uppercase text-cyan-500">sin(θ)</div>
                <div className="text-base font-mono font-black">{sinVal.toFixed(2)}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-bold uppercase text-violet-500">cos(θ)</div>
                <div className="text-base font-mono font-black">{cosVal.toFixed(2)}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${cardBg}`}>
                <div className="text-[10px] font-bold uppercase text-amber-500">tan(θ)</div>
                <div className="text-base font-mono font-black">{tanVal === null ? '∞' : tanVal.toFixed(2)}</div>
              </div>
            </div>

            {/* Quick Special Angles Buttons */}
            <div className={`p-3 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="text-[11px] font-bold">Jump to Special Angles</div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 30, 45, 60, 90, 120, 180, 270, 315, 360].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => {
                      setWatchLessonActive(false);
                      setAutoRotate(false);
                      setAngleDeg(deg);
                    }}
                    className={`py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer ${
                      Math.abs(angleDeg - deg) <= 1
                        ? 'bg-cyan-500 text-slate-950'
                        : darkMode ? 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.12]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
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
                    onClick={() => setChallengeIdx((p) => (p === null ? 0 : (p + 1) % TRIG_CHALLENGES.length))}
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    Next Math Challenge →
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              darkMode ? 'bg-cyan-500/10 border-cyan-400/25 text-cyan-100' : 'bg-cyan-50 border-cyan-200 text-cyan-950'
            }`}
          >
            <div className="font-bold font-mono">
              sin²({angleDeg}°) + cos²({angleDeg}°) = {(sinVal * sinVal + cosVal * cosVal).toFixed(2)}
            </div>
            <div className="text-[11px] mt-0.5 opacity-90">
              {level === 'o_level'
                ? 'SOH–CAH–TOA extends smoothly to all 4 quadrants via the unit circle!'
                : 'd/dθ (sin θ) = cos θ · Period T = 2π/B · Phase shift cos θ = sin(θ + π/2).'}
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
                    <div className="h-full bg-cyan-400 transition-all duration-100" style={{ width: `${Math.round(fill * 100)}%` }} />
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
                  <span>Angle θ</span>
                  <span className="text-amber-500">{angleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={angleDeg}
                  onChange={(e) => {
                    setAutoRotate(false);
                    setAngleDeg(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </label>
              <label className="space-y-1">
                <div className="flex justify-between font-bold tabular-nums">
                  <span>Amplitude (A)</span>
                  <span className="text-cyan-500">{amplitude.toFixed(1)}</span>
                </div>
                <input type="range" min={0.5} max={2.2} step={0.1} value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} className="w-full accent-cyan-500 cursor-pointer" />
              </label>
              <label className="space-y-1">
                <div className="flex justify-between font-bold tabular-nums">
                  <span>Frequency (B)</span>
                  <span className="text-violet-500">{frequency.toFixed(1)}×</span>
                </div>
                <input type="range" min={0.5} max={3.0} step={0.5} value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full accent-violet-500 cursor-pointer" />
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAutoRotate((p) => !p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                    darkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{autoRotate ? 'Pause' : 'Spin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAmplitude(1.5);
                    setFrequency(1.0);
                    setAngleDeg(45);
                    setAutoRotate(true);
                  }}
                  className={`p-2 rounded-xl border cursor-pointer ${
                    darkMode ? 'bg-[#1a2030] border-white/[0.12] text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                  title="Reset defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TrigWaves3DSimulation;
