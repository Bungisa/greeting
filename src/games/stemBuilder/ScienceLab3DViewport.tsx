import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Camera,
  CheckCircle2,
  Eye,
  Flame,
  FlaskConical,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export type Lab3DSceneMode =
  | 'titration'
  | 'equilibrium_rate'
  | 'circuit'
  | 'pendulum'
  | 'cell_osmosis'
  | 'genetics_punnett'
  | 'algorithm_flow'
  | 'contour_map'
  | 'coord_graph'
  | 'food_tests';

export type LabSolveStepId = 'investigate' | 'calculate' | 'conclude';

export interface ScienceLab3DViewportProps {
  sceneMode: Lab3DSceneMode;
  title: string;
  subtitle?: string;
  parameterLabel: string;
  parameterValue: number;
  parameterMin: number;
  parameterMax: number;
  parameterStep: number;
  parameterUnit: string;
  targetParameterValue?: number;
  liquidColorHex?: string;
  secondaryColorHex?: string;
  isReactionActive?: boolean;
  step1Complete?: boolean;
  step2Complete?: boolean;
  step3Complete?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onParameterChange?: (newVal: number) => void;
  onSelectSolveStep?: (step: LabSolveStepId) => void;
  onTriggerReaction?: () => void;
  onResetLab?: () => void;
  children?: React.ReactNode; // Full-screen solving overlays rendered directly inside the fullscreen 3D viewport
}

export const ScienceLab3DViewport: React.FC<ScienceLab3DViewportProps> = ({
  sceneMode,
  title,
  subtitle,
  parameterLabel,
  parameterValue,
  parameterMin,
  parameterMax,
  parameterStep,
  parameterUnit,
  targetParameterValue,
  liquidColorHex,
  secondaryColorHex,
  isReactionActive = false,
  step1Complete = false,
  step2Complete = false,
  step3Complete = false,
  isFullscreen: externalIsFullscreen,
  onToggleFullscreen,
  onParameterChange,
  onSelectSolveStep,
  onTriggerReaction,
  onResetLab,
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const labGroupRef = useRef<THREE.Group | null>(null);
  const clickableMeshesRef = useRef<THREE.Object3D[]>([]);

  // Animated sub-references updated inside the requestAnimationFrame loop
  const animStateRef = useRef<{
    sceneMode: Lab3DSceneMode;
    paramValue: number;
    paramMin: number;
    paramMax: number;
    targetVal: number;
    liquidHex: string;
    secondaryHex: string;
    reacting: boolean;
    burstTimer: number;
    // Dynamic 3D object handles
    liquidMesh: THREE.Mesh | null;
    buretteLiquidMesh: THREE.Mesh | null;
    dropletMesh: THREE.Mesh | null;
    flameGroup: THREE.Group | null;
    bubblesGroup: THREE.Group | null;
    pendulumArmGroup: THREE.Group | null;
    electronsGroup: THREE.Group | null;
    bulbGlowMesh: THREE.Mesh | null;
    ammeterNeedleGroup: THREE.Group | null;
    cellVacuoleMesh: THREE.Mesh | null;
    cellMembraneMesh: THREE.Mesh | null;
    organellesGroup: THREE.Group | null;
    aluCubesGroup: THREE.Group | null;
    terrainMesh: THREE.Mesh | null;
  }>({
    sceneMode,
    paramValue: parameterValue,
    paramMin: parameterMin,
    paramMax: parameterMax,
    targetVal: targetParameterValue ?? parameterValue,
    liquidHex: liquidColorHex || '#38bdf8',
    secondaryHex: secondaryColorHex || '#f43f5e',
    reacting: isReactionActive,
    burstTimer: 0,
    liquidMesh: null,
    buretteLiquidMesh: null,
    dropletMesh: null,
    flameGroup: null,
    bubblesGroup: null,
    pendulumArmGroup: null,
    electronsGroup: null,
    bulbGlowMesh: null,
    ammeterNeedleGroup: null,
    cellVacuoleMesh: null,
    cellMembraneMesh: null,
    organellesGroup: null,
    aluCubesGroup: null,
    terrainMesh: null,
  });

  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [internalFullscreen, setInternalFullscreen] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'bench' | 'closeup' | 'top'>('bench');
  const [reactionPulse, setReactionPulse] = useState<boolean>(false);
  const [hoveredApparatus, setHoveredApparatus] = useState<string | null>(null);

  const isExpandedFullscreen =
    externalIsFullscreen !== undefined ? externalIsFullscreen : internalFullscreen;

  const callbacksRef = useRef({
    onSelectSolveStep,
    onTriggerReaction,
  });
  useEffect(() => {
    callbacksRef.current = {
      onSelectSolveStep,
      onTriggerReaction,
    };
  }, [onSelectSolveStep, onTriggerReaction]);

  // Sync props into animStateRef
  useEffect(() => {
    const st = animStateRef.current;
    st.sceneMode = sceneMode;
    st.paramValue = parameterValue;
    st.paramMin = parameterMin;
    st.paramMax = parameterMax;
    st.targetVal = targetParameterValue ?? parameterValue;
    st.reacting = isReactionActive || reactionPulse;

    // Determine dynamic liquid color if not explicitly overridden
    if (liquidColorHex) {
      st.liquidHex = liquidColorHex;
    } else if (sceneMode === 'titration' || sceneMode === 'equilibrium_rate') {
      const target = targetParameterValue ?? 25;
      const diff = parameterValue - target;
      if (Math.abs(diff) <= parameterStep * 1.1) {
        st.liquidHex = '#fb923c'; // Equivalence sharp orange-pink
      } else if (diff < 0) {
        st.liquidHex = '#fde047'; // Alkaline yellow
      } else {
        st.liquidHex = '#f43f5e'; // Overshot red-pink
      }
    } else if (sceneMode === 'food_tests') {
      st.liquidHex = liquidColorHex || '#c2410c';
    } else {
      st.liquidHex = '#38bdf8';
    }
  }, [
    sceneMode,
    parameterValue,
    parameterMin,
    parameterMax,
    parameterStep,
    targetParameterValue,
    liquidColorHex,
    isReactionActive,
    reactionPulse,
  ]);

  const handleFullscreenToggle = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      setInternalFullscreen((prev) => !prev);
    }
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement && wrapperRef.current?.requestFullscreen) {
        wrapperRef.current.requestFullscreen().catch(() => {});
      } else if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);
  };

  const triggerAnimatedReactionBurst = () => {
    animStateRef.current.burstTimer = 3.2;
    setReactionPulse(true);
    if (onTriggerReaction) onTriggerReaction();
    window.setTimeout(() => setReactionPulse(false), 3200);
  };

  // Initialize Three.js WebGL Scene, Studio Lab Lighting & RoomEnvironment
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(
      rendererStr
    );

    const width = Math.max(320, container.clientWidth || window.innerWidth);
    const height = Math.max(320, container.clientHeight || window.innerHeight);

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);
    sceneRef.current = scene;

    // Environment map for realistic glass and brushed metal apparatus
    if (!isSoftwareGl) {
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        scene.environment = pmremGenerator.fromScene(
          new RoomEnvironment(),
          0.04
        ).texture;
        pmremGenerator.dispose();
      } catch {
        // Fallback if PMREM fails
      }
    }

    const isPortrait = width < height;
    const camera = new THREE.PerspectiveCamera(
      isPortrait ? 52 : 42,
      width / height,
      0.1,
      200
    );
    camera.position.set(0, isPortrait ? 3.8 : 3.4, isPortrait ? 8.6 : 7.2);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 3.2;
    controls.maxDistance = 22;
    controls.target.set(0, 1.9, 0);
    controls.update();
    controlsRef.current = controls;

    // Brighter Studio Laboratory Lighting for Crystal-Clear 3D Visibility
    const hemiLight = new THREE.HemisphereLight(0xf0f9ff, 0x1e293b, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(7, 12, 8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-8, 6, -6);
    scene.add(rimLight);

    const benchWarmLight = new THREE.PointLight(0xfbbf24, 1.25, 22);
    benchWarmLight.position.set(0, 5.5, 2.5);
    scene.add(benchWarmLight);

    // Build Permanent 3D Science Laboratory Bench & Tiled Backdrop
    const staticLabBenchGroup = new THREE.Group();
    scene.add(staticLabBenchGroup);

    // Lab Bench Top (Epoxy Resin Dark Slate Surface with Beveled Front Edge)
    const benchGeo = new THREE.BoxGeometry(16, 0.45, 8);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.28,
      metalness: 0.15,
    });
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.set(0, -0.225, 0);
    benchMesh.receiveShadow = true;
    staticLabBenchGroup.add(benchMesh);

    // Subtle Lab Bench Coordinate Grid
    const gridHelper = new THREE.GridHelper(15.6, 24, 0x38bdf8, 0x334155);
    gridHelper.position.set(0, 0.01, 0);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.28;
    staticLabBenchGroup.add(gridHelper);

    // Lab Bench Wooden/Steel Legs
    const legGeo = new THREE.BoxGeometry(0.45, 4.5, 0.45);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.6,
    });
    [
      [-7.2, -2.45, -3.2],
      [7.2, -2.45, -3.2],
      [-7.2, -2.45, 3.2],
      [7.2, -2.45, 3.2],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      staticLabBenchGroup.add(leg);
    });

    // Background Lab Shelf with Reagent Bottles
    const shelfGeo = new THREE.BoxGeometry(14, 0.22, 1.4);
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.3,
    });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(0, 4.2, -3.4);
    staticLabBenchGroup.add(shelf);

    // Decorative 3D Reagent Bottles on the back shelf
    const bottleColors = [0x38bdf8, 0xf59e0b, 0x10b981, 0xa855f7, 0xf43f5e];
    bottleColors.forEach((col, idx) => {
      const bx = -5 + idx * 2.5;
      const bottleGroup = new THREE.Group();
      bottleGroup.position.set(bx, 4.31, -3.4);

      const bBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.7, 20),
        new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          transparent: true,
          opacity: 0.45,
          roughness: 0.15,
        })
      );
      bBody.position.y = 0.35;
      bottleGroup.add(bBody);

      const bLiq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.42, 18),
        new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.2,
          roughness: 0.2,
        })
      );
      bLiq.position.y = 0.23;
      bottleGroup.add(bLiq);

      const bCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
      );
      bCap.position.y = 0.8;
      bottleGroup.add(bCap);

      staticLabBenchGroup.add(bottleGroup);
    });

    // Dynamic Apparatus Group (rebuilt when sceneMode changes) — scaled up for clear 3D visibility
    const labGroup = new THREE.Group();
    labGroup.scale.setScalar(1.28);
    scene.add(labGroup);
    labGroupRef.current = labGroup;

    // Raycaster for interactive 3D apparatus clicking & hover
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObjects(clickableMeshesRef.current, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.apparatusLabel) {
          obj = obj.parent;
        }
        if (obj?.userData?.apparatusLabel) {
          renderer.domElement.style.cursor = 'pointer';
          setHoveredApparatus(obj.userData.apparatusLabel);
          return;
        }
      }
      renderer.domElement.style.cursor = 'grab';
      setHoveredApparatus(null);
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 8) return; // Ignore camera orbit drags

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObjects(clickableMeshesRef.current, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.solveStep) {
          obj = obj.parent;
        }
        if (obj?.userData?.solveStep) {
          animStateRef.current.burstTimer = 2.5;
          if (callbacksRef.current.onTriggerReaction) {
            callbacksRef.current.onTriggerReaction();
          }
          if (callbacksRef.current.onSelectSolveStep) {
            callbacksRef.current.onSelectSolveStep(
              obj.userData.solveStep as LabSolveStepId
            );
          }
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    domElem.addEventListener('pointermove', onPointerMove);
    domElem.addEventListener('pointerup', onPointerUp);

    // Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(300, containerRef.current.clientWidth || window.innerWidth);
      const h = Math.max(300, containerRef.current.clientHeight || window.innerHeight);
      const portrait = w < h;
      cameraRef.current.fov = portrait ? 56 : 45;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObserver) resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Master 60fps Animation Loop
    const clock = new THREE.Clock();
    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const st = animStateRef.current;

      if (st.burstTimer > 0) {
        st.burstTimer = Math.max(0, st.burstTimer - delta);
      }
      const activeReaction = st.reacting || st.burstTimer > 0;

      // Normalized parameter ratio [0..1]
      const span = Math.max(0.0001, st.paramMax - st.paramMin);
      const norm = THREE.MathUtils.clamp((st.paramValue - st.paramMin) / span, 0, 1);

      // 1. Animate Chemistry Titration / Food Tests / Equilibrium
      if (st.liquidMesh) {
        const mat = st.liquidMesh.material as THREE.MeshStandardMaterial;
        mat.color.lerp(new THREE.Color(st.liquidHex), 0.12);
        mat.emissive.lerp(new THREE.Color(st.liquidHex), 0.12);
        mat.emissiveIntensity = activeReaction ? 0.45 + 0.2 * Math.sin(elapsed * 8) : 0.18;
        // Subtle liquid swirl & volume scale
        st.liquidMesh.scale.y = 0.7 + norm * 0.55;
        st.liquidMesh.rotation.y = elapsed * (activeReaction ? 3.5 : 0.8);
      }

      if (st.buretteLiquidMesh) {
        st.buretteLiquidMesh.scale.y = Math.max(0.08, 1 - norm * 0.85);
      }

      if (st.dropletMesh) {
        const dropSpeed = activeReaction ? 4.8 : 2.2;
        const dropPhase = (elapsed * dropSpeed) % 1;
        st.dropletMesh.position.y = 2.65 - dropPhase * 1.45;
        const dMat = st.dropletMesh.material as THREE.MeshStandardMaterial;
        dMat.opacity = dropPhase > 0.9 ? 0 : 0.9;
      }

      // 2. Animate Bunsen Burner Flame & Rising Effervescence Bubbles
      if (st.flameGroup) {
        const flameScale = activeReaction ? 1.35 : 0.85 + norm * 0.45;
        st.flameGroup.scale.set(
          flameScale + Math.sin(elapsed * 19) * 0.08,
          flameScale + Math.cos(elapsed * 23) * 0.14,
          flameScale + Math.sin(elapsed * 17) * 0.08
        );
      }

      if (st.bubblesGroup) {
        const bubbleSpeed = activeReaction ? 2.4 : 0.9 + norm * 1.1;
        st.bubblesGroup.children.forEach((b, idx) => {
          b.position.y += delta * bubbleSpeed * (0.7 + (idx % 4) * 0.2);
          b.position.x += Math.sin(elapsed * 5 + idx) * 0.003;
          if (b.position.y > 1.75) {
            b.position.y = 0.35;
          }
        });
      }

      // 3. Animate 3D Simple Pendulum (T = 2*pi*sqrt(L/g))
      if (st.pendulumArmGroup) {
        const lengthMeters = Math.max(0.2, st.paramValue / 100);
        const period = 2 * Math.PI * Math.sqrt(lengthMeters / 9.81);
        const maxAngleRad = activeReaction ? 0.52 : 0.38;
        const theta = maxAngleRad * Math.sin(((2 * Math.PI) / period) * elapsed);
        st.pendulumArmGroup.rotation.z = theta;

        // Dynamically scale string length & bob position
        const stringMesh = st.pendulumArmGroup.getObjectByName('pendulumString');
        const bobMesh = st.pendulumArmGroup.getObjectByName('pendulumBob');
        const visualLen = 1.4 + norm * 2.1;
        if (stringMesh) {
          stringMesh.scale.y = visualLen;
          stringMesh.position.y = -visualLen / 2;
        }
        if (bobMesh) {
          bobMesh.position.y = -visualLen;
        }
      }

      // 4. Animate 3D Ohm's Law Circuit (Electron Flow, Bulb Glow & Ammeter Needle)
      if (st.electronsGroup) {
        const resistance = Math.max(1, st.paramValue);
        const currentFactor = THREE.MathUtils.clamp(12 / resistance, 0.4, 6);
        st.electronsGroup.children.forEach((el, idx) => {
          const pathProgress = ((elapsed * 0.22 * currentFactor + idx / st.electronsGroup!.children.length) % 1);
          // Rectangular loop path around circuit board: x in [-2.6, 2.6], z in [-1.4, 1.4]
          let px = 0;
          let pz = 0;
          if (pathProgress < 0.25) {
            const t = pathProgress / 0.25;
            px = -2.6 + t * 5.2;
            pz = -1.4;
          } else if (pathProgress < 0.5) {
            const t = (pathProgress - 0.25) / 0.25;
            px = 2.6;
            pz = -1.4 + t * 2.8;
          } else if (pathProgress < 0.75) {
            const t = (pathProgress - 0.5) / 0.25;
            px = 2.6 - t * 5.2;
            pz = 1.4;
          } else {
            const t = (pathProgress - 0.75) / 0.25;
            px = -2.6;
            pz = 1.4 - t * 2.8;
          }
          el.position.set(px, 0.36, pz);
        });

        if (st.bulbGlowMesh) {
          const glowMat = st.bulbGlowMesh.material as THREE.MeshStandardMaterial;
          const intensity = THREE.MathUtils.clamp((1 - norm * 0.75) * 2.2, 0.25, 2.5);
          glowMat.emissiveIntensity = activeReaction ? intensity * 1.35 : intensity;
          const s = 0.85 + intensity * 0.22;
          st.bulbGlowMesh.scale.set(s, s, s);
        }

        if (st.ammeterNeedleGroup) {
          const targetAngle = THREE.MathUtils.lerp(0.65, -0.65, norm);
          st.ammeterNeedleGroup.rotation.z = THREE.MathUtils.lerp(
            st.ammeterNeedleGroup.rotation.z,
            targetAngle,
            0.1
          );
        }
      }

      // 5. Animate 3D Biological Cell Osmosis & Organelles
      if (st.cellVacuoleMesh) {
        // Higher molarity -> plasmolysis (vacuole shrinks); lower molarity -> turgid
        const turgorScale = THREE.MathUtils.lerp(1.35, 0.48, norm);
        const pulse = 1 + Math.sin(elapsed * 3.2) * 0.04;
        st.cellVacuoleMesh.scale.set(
          turgorScale * pulse,
          (0.85 + turgorScale * 0.25) * pulse,
          turgorScale * pulse
        );
      }
      if (st.organellesGroup) {
        st.organellesGroup.rotation.y = elapsed * 0.45;
        st.organellesGroup.children.forEach((org, i) => {
          org.position.y = 1.4 + Math.sin(elapsed * 2.5 + i) * 0.18;
        });
      }

      // 6. Animate 3D Computer Science ALU / Spatial Model
      if (st.aluCubesGroup) {
        const intVal = Math.max(0, Math.round(st.paramValue));
        st.aluCubesGroup.children.forEach((cube, bitIdx) => {
          const bitOn = ((intVal >> bitIdx) & 1) === 1;
          cube.position.y = THREE.MathUtils.lerp(
            cube.position.y,
            bitOn ? 2.1 + Math.sin(elapsed * 4 + bitIdx) * 0.12 : 1.1,
            0.12
          );
          cube.rotation.y += delta * (bitOn ? 1.8 : 0.3);
          const cMat = (cube as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (cMat) {
            cMat.color.setHex(bitOn ? 0x10b981 : 0x334155);
            cMat.emissive.setHex(bitOn ? 0x059669 : 0x0f172a);
            cMat.emissiveIntensity = bitOn ? 0.65 : 0.1;
          }
        });
      }

      if (st.terrainMesh) {
        st.terrainMesh.rotation.y = Math.sin(elapsed * 0.35) * 0.25;
        const marker = st.terrainMesh.getObjectByName('elevationPlane');
        if (marker) {
          marker.position.y = 0.4 + norm * 1.9;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      domElem.removeEventListener('pointermove', onPointerMove);
      domElem.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D Lab Apparatus whenever `sceneMode` changes
  useEffect(() => {
    const labGroup = labGroupRef.current;
    if (!labGroup) return;

    // Dispose previous meshes
    while (labGroup.children.length > 0) {
      const child = labGroup.children[0];
      labGroup.remove(child);
    }
    clickableMeshesRef.current = [];

    const st = animStateRef.current;
    st.liquidMesh = null;
    st.buretteLiquidMesh = null;
    st.dropletMesh = null;
    st.flameGroup = null;
    st.bubblesGroup = null;
    st.pendulumArmGroup = null;
    st.electronsGroup = null;
    st.bulbGlowMesh = null;
    st.ammeterNeedleGroup = null;
    st.cellVacuoleMesh = null;
    st.cellMembraneMesh = null;
    st.organellesGroup = null;
    st.aluCubesGroup = null;
    st.terrainMesh = null;

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.36,
      roughness: 0.1,
      metalness: 0.1,
    });

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.85,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.22,
      metalness: 0.8,
    });

    if (
      sceneMode === 'titration' ||
      sceneMode === 'equilibrium_rate' ||
      sceneMode === 'food_tests'
    ) {
      // ======================================================================
      // 3D CHEMISTRY / BIOCHEMISTRY LAB BENCH: RETORT STAND, BURETTE, FLASK,
      // BUNSEN BURNER WITH ANIMATED FLAME, AND 3D TEST TUBE RACK
      // ======================================================================
      const chemRoot = new THREE.Group();
      chemRoot.userData = {
        solveStep: 'investigate',
        apparatusLabel: '3D Titration Burette & Reaction Vessel (Click to Calibrate & Solve)',
      };
      labGroup.add(chemRoot);

      // 1. Retort Stand Base & Vertical Rod
      const basePlate = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.18, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 })
      );
      basePlate.position.set(-1.1, 0.09, 0);
      chemRoot.add(basePlate);

      // White Porcelain Tile under Conical Flask
      const tileMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.08, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
      );
      tileMesh.position.set(-0.35, 0.2, 0);
      chemRoot.add(tileMesh);

      const verticalRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 5.2, 16),
        steelMat
      );
      verticalRod.position.set(-1.9, 2.65, 0);
      chemRoot.add(verticalRod);

      // Clamp Arm holding Burette
      const clampArm = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.1, 0.14),
        steelMat
      );
      clampArm.position.set(-1.1, 3.85, 0);
      chemRoot.add(clampArm);

      // 2. Graduated 3D Burette Column
      const buretteTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 2.4, 24),
        glassMat
      );
      buretteTube.position.set(-0.35, 3.9, 0);
      buretteTube.userData = {
        solveStep: 'investigate',
        apparatusLabel: 'Graduated Burette — Click to Adjust Titrant Volume',
      };
      chemRoot.add(buretteTube);

      const buretteLiq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 2.1, 20),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.8,
          roughness: 0.15,
        })
      );
      buretteLiq.position.set(-0.35, 3.85, 0);
      chemRoot.add(buretteLiq);
      st.buretteLiquidMesh = buretteLiq;

      // Stopcock Valve
      const stopcock = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.12, 0.14),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
      );
      stopcock.position.set(-0.35, 2.65, 0);
      chemRoot.add(stopcock);

      // Falling Titrant Droplet
      const droplet = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.9,
        })
      );
      droplet.position.set(-0.35, 2.3, 0);
      chemRoot.add(droplet);
      st.dropletMesh = droplet;

      // 3. 3D Conical (Erlenmeyer) Flask
      const flaskGroup = new THREE.Group();
      flaskGroup.position.set(-0.35, 0.24, 0);
      flaskGroup.userData = {
        solveStep: 'calculate',
        apparatusLabel: 'Conical Reaction Flask — Click to Solve Stoichiometry & Endpoint',
      };
      chemRoot.add(flaskGroup);

      const flaskCone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.78, 1.15, 28),
        glassMat
      );
      flaskCone.position.y = 0.58;
      flaskGroup.add(flaskCone);

      const flaskNeck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.55, 24),
        glassMat
      );
      flaskNeck.position.y = 1.42;
      flaskGroup.add(flaskNeck);

      const flaskRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.035, 12, 24),
        glassMat
      );
      flaskRim.rotation.x = Math.PI / 2;
      flaskRim.position.y = 1.7;
      flaskGroup.add(flaskRim);

      // Swirling Coloured Reaction Liquid inside Flask
      const flaskLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.72, 0.56, 26),
        new THREE.MeshStandardMaterial({
          color: st.liquidHex,
          emissive: st.liquidHex,
          emissiveIntensity: 0.22,
          transparent: true,
          opacity: 0.9,
          roughness: 0.15,
        })
      );
      flaskLiquid.position.y = 0.32;
      flaskGroup.add(flaskLiquid);
      st.liquidMesh = flaskLiquid;

      // Rising Effervescence Bubbles inside Flask
      const bubblesGroup = new THREE.Group();
      flaskGroup.add(bubblesGroup);
      for (let i = 0; i < 16; i++) {
        const bMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.035 + (i % 3) * 0.015, 10, 10),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.75,
          })
        );
        const angle = (i / 16) * Math.PI * 2;
        const rad = 0.12 + (i % 4) * 0.09;
        bMesh.position.set(
          Math.cos(angle) * rad,
          0.35 + (i / 16) * 1.2,
          Math.sin(angle) * rad
        );
        bubblesGroup.add(bMesh);
      }
      st.bubblesGroup = bubblesGroup;

      // 4. 3D Bunsen Burner & Tripod Heating Station on the Right
      const burnerGroup = new THREE.Group();
      burnerGroup.position.set(2.2, 0, 0.2);
      burnerGroup.userData = {
        solveStep: 'conclude',
        apparatusLabel: 'Bunsen Burner & Test Tube Rack — Click to Observe & Conclude',
      };
      chemRoot.add(burnerGroup);

      const burnerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.55, 0.14, 20),
        brassMat
      );
      burnerBase.position.y = 0.07;
      burnerGroup.add(burnerBase);

      const burnerChimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 0.85, 18),
        steelMat
      );
      burnerChimney.position.y = 0.55;
      burnerGroup.add(burnerChimney);

      // Animated Dual-Core Flame
      const flameGroup = new THREE.Group();
      flameGroup.position.y = 1.05;
      burnerGroup.add(flameGroup);

      const outerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.75, 16),
        new THREE.MeshStandardMaterial({
          color: 0xf97316,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.75,
        })
      );
      outerFlame.position.y = 0.35;
      flameGroup.add(outerFlame);

      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.45, 14),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0ea5e9,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.9,
        })
      );
      innerFlame.position.y = 0.22;
      flameGroup.add(innerFlame);
      st.flameGroup = flameGroup;

      // 5. 3D Test Tube Rack with 4 Color-Coded Biochemical / Qualitative Salt Tubes
      const rackGroup = new THREE.Group();
      rackGroup.position.set(2.3, 0, -1.55);
      rackGroup.userData = {
        solveStep: 'conclude',
        apparatusLabel: 'Biochemical & Qualitative Test Tube Rack — Click to Inspect Inferences',
      };
      chemRoot.add(rackGroup);

      const rackBase = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.14, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
      );
      rackBase.position.y = 0.07;
      rackGroup.add(rackBase);

      const rackTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.1, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 })
      );
      rackTop.position.y = 1.05;
      rackGroup.add(rackTop);

      const tubeColors = [0x1e1b4b, 0xc2410c, 0x7e22ce, 0x10b981];
      tubeColors.forEach((tCol, idx) => {
        const tx = -0.9 + idx * 0.6;
        const tubeGlass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 1.45, 18),
          glassMat
        );
        tubeGlass.position.set(tx, 0.85, 0);
        rackGroup.add(tubeGlass);

        const tubeLiq = new THREE.Mesh(
          new THREE.CylinderGeometry(0.115, 0.115, 0.78, 16),
          new THREE.MeshStandardMaterial({
            color: tCol,
            emissive: tCol,
            emissiveIntensity: 0.28,
            roughness: 0.2,
          })
        );
        tubeLiq.position.set(tx, 0.52, 0);
        rackGroup.add(tubeLiq);
      });

      clickableMeshesRef.current.push(chemRoot);
    } else if (sceneMode === 'pendulum') {
      // ======================================================================
      // 3D PHYSICS SIMPLE PENDULUM APPARATUS (RETORT CLAMP, SWINGING BRASS BOB,
      // PROTRACTOR ARC & LASER PHOTOGATE TIMER)
      // ======================================================================
      const pendRoot = new THREE.Group();
      pendRoot.userData = {
        solveStep: 'investigate',
        apparatusLabel: '3D Simple Pendulum & Photogate Timer — Click to Measure & Solve g',
      };
      labGroup.add(pendRoot);

      const standBase = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.2, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 })
      );
      standBase.position.set(-1.6, 0.1, 0);
      pendRoot.add(standBase);

      const tallRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 4.8, 18),
        steelMat
      );
      tallRod.position.set(-1.6, 2.5, 0);
      pendRoot.add(tallRod);

      const topCrossArm = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.12, 0.18),
        steelMat
      );
      topCrossArm.position.set(-0.7, 4.65, 0);
      pendRoot.add(topCrossArm);

      // Protractor Reference Arc
      const protractor = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.82, 24, 1, Math.PI * 1.15, Math.PI * 0.7),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55,
        })
      );
      protractor.position.set(0, 4.65, -0.08);
      pendRoot.add(protractor);

      // Swinging Pendulum Pivot Group
      const pivotGroup = new THREE.Group();
      pivotGroup.position.set(0, 4.65, 0);
      pendRoot.add(pivotGroup);

      const stringMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1, 12),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc })
      );
      stringMesh.name = 'pendulumString';
      stringMesh.position.y = -1.2;
      pivotGroup.add(stringMesh);

      const bobMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 28, 28),
        brassMat
      );
      bobMesh.name = 'pendulumBob';
      bobMesh.position.y = -2.4;
      bobMesh.userData = {
        solveStep: 'calculate',
        apparatusLabel: 'Swinging Brass Pendulum Bob — Click to Calculate Period T & Gravity g',
      };
      pivotGroup.add(bobMesh);

      st.pendulumArmGroup = pivotGroup;
      clickableMeshesRef.current.push(pendRoot);
    } else if (sceneMode === 'circuit') {
      // ======================================================================
      // 3D OHM'S LAW & ELECTRICAL CIRCUIT WORKBENCH (DC POWER SUPPLY, GLOWING
      // FILAMENT BULB, SLIDING RHEOSTAT COIL, ANALOG AMMETER & ELECTRON PULSES)
      // ======================================================================
      const circuitRoot = new THREE.Group();
      circuitRoot.userData = {
        solveStep: 'investigate',
        apparatusLabel: "3D Ohm's Law Circuit Board — Click to Adjust Rheostat & Solve V = IR",
      };
      labGroup.add(circuitRoot);

      // Insulated Circuit Board Base
      const boardMesh = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 0.24, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.2 })
      );
      boardMesh.position.set(0, 0.12, 0);
      circuitRoot.add(boardMesh);

      // Copper Conductive Busbars forming Rectangular Loop
      const busMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.25,
        metalness: 0.85,
      });
      const horizTrackTop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.06, 0.12), busMat);
      horizTrackTop.position.set(0, 0.26, -1.4);
      circuitRoot.add(horizTrackTop);

      const horizTrackBot = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.06, 0.12), busMat);
      horizTrackBot.position.set(0, 0.26, 1.4);
      circuitRoot.add(horizTrackBot);

      const vertTrackLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 2.8), busMat);
      vertTrackLeft.position.set(-2.6, 0.26, 0);
      circuitRoot.add(vertTrackLeft);

      const vertTrackRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 2.8), busMat);
      vertTrackRight.position.set(2.6, 0.26, 0);
      circuitRoot.add(vertTrackRight);

      // 1. 12V DC Power Supply Unit (Left)
      const psuBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.2, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.4 })
      );
      psuBox.position.set(-2.6, 0.84, 0);
      circuitRoot.add(psuBox);

      // 2. Variable Rheostat Coil (Top)
      const rheoCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 2.2, 24),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.75 })
      );
      rheoCylinder.rotation.z = Math.PI / 2;
      rheoCylinder.position.set(0.3, 0.62, -1.4);
      rheoCylinder.userData = {
        solveStep: 'investigate',
        apparatusLabel: 'Variable Rheostat Resistor — Click to Adjust Resistance Ω',
      };
      circuitRoot.add(rheoCylinder);

      // 3. Analog Ammeter Gauge with Rotating Needle (Right)
      const meterBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 0.35, 28),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.5 })
      );
      meterBody.rotation.x = Math.PI / 4;
      meterBody.position.set(2.6, 0.75, 0);
      meterBody.userData = {
        solveStep: 'calculate',
        apparatusLabel: '3D Ammeter / Voltmeter — Click to Calculate Current I = V/R',
      };
      circuitRoot.add(meterBody);

      const needlePivot = new THREE.Group();
      needlePivot.position.set(2.6, 0.88, 0.14);
      needlePivot.rotation.x = -Math.PI / 4;
      const needle = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.48, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 })
      );
      needle.position.y = 0.2;
      needlePivot.add(needle);
      circuitRoot.add(needlePivot);
      st.ammeterNeedleGroup = needlePivot;

      // 4. Glowing Filament Lamp (Front Center)
      const bulbBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.36, 0.3, 20),
        steelMat
      );
      bulbBase.position.set(0, 0.39, 1.4);
      circuitRoot.add(bulbBase);

      const bulbGlass = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0xfde047,
          emissive: 0xfacc15,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.88,
        })
      );
      bulbGlass.position.set(0, 0.95, 1.4);
      bulbGlass.userData = {
        solveStep: 'conclude',
        apparatusLabel: 'Glowing Load Lamp — Click to Analyze Power & Resistance',
      };
      circuitRoot.add(bulbGlass);
      st.bulbGlowMesh = bulbGlass;

      // 5. Moving Electron Charge Spheres along Circuit Loop
      const electronsGroup = new THREE.Group();
      circuitRoot.add(electronsGroup);
      for (let i = 0; i < 20; i++) {
        const elSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 12, 12),
          new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 1.1,
          })
        );
        electronsGroup.add(elSphere);
      }
      st.electronsGroup = electronsGroup;
      clickableMeshesRef.current.push(circuitRoot);
    } else if (sceneMode === 'cell_osmosis' || sceneMode === 'genetics_punnett') {
      // ======================================================================
      // 3D BIOLOGY CELL OSMOSIS & MICROSCOPE STAGE (TRANSLUCENT CELL WALL,
      // PULSING TURGOR VACUOLE, NUCLEUS, CHLOROPLASTS & 3D MICROSCOPE)
      // ======================================================================
      const bioRoot = new THREE.Group();
      bioRoot.userData = {
        solveStep: 'investigate',
        apparatusLabel: '3D Plant Cell Osmosis & Microscope Model — Click to Investigate & Solve',
      };
      labGroup.add(bioRoot);

      // Outer Cellulose Cell Wall Frame
      const cellWall = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 2.2, 2.8),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.24,
          roughness: 0.2,
        })
      );
      cellWall.position.set(0, 1.35, 0);
      bioRoot.add(cellWall);

      // Dynamic Central Sap Vacuole (swells in hypotonic, shrinks in hypertonic)
      const vacuole = new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 28, 28),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.78,
          roughness: 0.15,
        })
      );
      vacuole.position.set(0, 1.35, 0);
      vacuole.userData = {
        solveStep: 'calculate',
        apparatusLabel: 'Central Sap Vacuole — Click to Solve Osmotic Water Potential',
      };
      bioRoot.add(vacuole);
      st.cellVacuoleMesh = vacuole;

      // Orbiting Chloroplasts & Nucleus
      const organelles = new THREE.Group();
      bioRoot.add(organelles);

      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0x7e22ce,
          emissiveIntensity: 0.4,
          roughness: 0.3,
        })
      );
      nucleus.position.set(-1.15, 1.5, 0.65);
      organelles.add(nucleus);

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const chloro = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.12, 0.22, 8, 16),
          new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x15803d,
            emissiveIntensity: 0.35,
          })
        );
        chloro.position.set(Math.cos(angle) * 1.4, 1.35, Math.sin(angle) * 0.95);
        chloro.rotation.z = Math.PI / 3;
        organelles.add(chloro);
      }
      st.organellesGroup = organelles;
      clickableMeshesRef.current.push(bioRoot);
    } else if (sceneMode === 'algorithm_flow') {
      // ======================================================================
      // 3D COMPUTER SCIENCE ALU BINARY REGISTER CUBES & DATA BUS
      // ======================================================================
      const csRoot = new THREE.Group();
      csRoot.userData = {
        solveStep: 'investigate',
        apparatusLabel: '3D CPU Binary Register & Logic Array — Click to Trace & Solve',
      };
      labGroup.add(csRoot);

      const aluGroup = new THREE.Group();
      csRoot.add(aluGroup);

      for (let bit = 0; bit < 5; bit++) {
        const xPos = (2 - bit) * 1.35; // MSB on left, LSB on right
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.9, 0.9),
          new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            emissiveIntensity: 0.5,
            roughness: 0.25,
            metalness: 0.5,
          })
        );
        cube.position.set(xPos, 1.5, 0);
        cube.userData = {
          solveStep: 'calculate',
          apparatusLabel: `Bit 2^${bit} Register Node — Click to Solve Algorithm Output`,
        };
        aluGroup.add(cube);
      }
      st.aluCubesGroup = aluGroup;
      clickableMeshesRef.current.push(csRoot);
    } else {
      // ======================================================================
      // 3D TOPOGRAPHIC MOUNT KILIMANJARO CONTOUR & COORDINATE GEOMETRY MODEL
      // ======================================================================
      const geoRoot = new THREE.Group();
      geoRoot.userData = {
        solveStep: 'investigate',
        apparatusLabel: '3D Topographic Elevation & Coordinate Model — Click to Solve',
      };
      labGroup.add(geoRoot);

      const terrainGroup = new THREE.Group();
      terrainGroup.position.set(0, 0.1, 0);
      geoRoot.add(terrainGroup);

      const tierColors = [0x065f46, 0x047857, 0x10b981, 0xf59e0b, 0xf8fafc];
      tierColors.forEach((col, idx) => {
        const tier = new THREE.Mesh(
          new THREE.CylinderGeometry(2.4 - idx * 0.42, 2.8 - idx * 0.42, 0.42, 32),
          new THREE.MeshStandardMaterial({
            color: col,
            roughness: 0.45,
            metalness: 0.15,
          })
        );
        tier.position.y = idx * 0.42 + 0.21;
        terrainGroup.add(tier);
      });

      const elevPlane = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 2.7, 32),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.6,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        })
      );
      elevPlane.rotation.x = Math.PI / 2;
      elevPlane.position.y = 1.2;
      elevPlane.name = 'elevationPlane';
      terrainGroup.add(elevPlane);

      st.terrainMesh = terrainGroup as unknown as THREE.Mesh;
      clickableMeshesRef.current.push(geoRoot);
    }
  }, [sceneMode]);

  // Camera Preset Switcher
  const applyCameraPreset = (preset: 'bench' | 'closeup' | 'top') => {
    setCameraPreset(preset);
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;

    if (preset === 'bench') {
      cam.position.set(0, 3.4, 7.2);
      ctrl.target.set(0, 1.9, 0);
    } else if (preset === 'closeup') {
      cam.position.set(0, 2.3, 4.6);
      ctrl.target.set(0, 1.7, 0);
    } else {
      cam.position.set(0, 9.8, 0.8);
      ctrl.target.set(0, 0.6, 0);
    }
    ctrl.update();
  };

  const adjustZoom = (factor: number) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    const offset = cam.position.clone().sub(ctrl.target).multiplyScalar(factor);
    if (offset.length() >= 4 && offset.length() <= 24) {
      cam.position.copy(ctrl.target).add(offset);
      ctrl.update();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={
        isExpandedFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-[100dvh] bg-slate-950 flex flex-col overflow-hidden'
          : 'relative w-full h-[540px] sm:h-[620px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col shadow-2xl'
      }
    >
      {/* 1. Top Floating 3D Lab HUD Header */}
      <div className="relative z-20 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3.5 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                3D Interactive Lab
              </span>
              {subtitle && (
                <span className="text-[11px] font-bold text-amber-300 truncate hidden sm:inline">
                  {subtitle}
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-black text-white truncate">
              {title}
            </h3>
          </div>
        </div>

        {/* Camera Presets, Reaction Trigger & Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
            <button
              type="button"
              onClick={() => applyCameraPreset('bench')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                cameraPreset === 'bench'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              3D Bench
            </button>
            <button
              type="button"
              onClick={() => applyCameraPreset('closeup')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                cameraPreset === 'closeup'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Close-Up
            </button>
            <button
              type="button"
              onClick={() => applyCameraPreset('top')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                cameraPreset === 'top'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Top View
            </button>
          </div>

          <button
            type="button"
            onClick={() => adjustZoom(0.84)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
            title="Zoom In 3D Lab"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => adjustZoom(1.18)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
            title="Zoom Out 3D Lab"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={triggerAnimatedReactionBurst}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Animate 3D Experiment</span>
          </button>

          {onResetLab && (
            <button
              type="button"
              onClick={onResetLab}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
              title="Reset 3D Experiment"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            title={isExpandedFullscreen ? 'Exit Full Screen' : 'Full Screen 3D Lab & Solve'}
          >
            {isExpandedFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen 3D</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main 3D WebGL Canvas Stage */}
      <div className="relative flex-1 w-full h-full min-h-[320px] overflow-hidden">
        {webglSupported ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 text-center text-slate-300">
            Interactive 3D Lab Mode Ready — Use the controls below to adjust parameters and solve!
          </div>
        )}

        {/* Hovered 3D Apparatus Tooltip Banner */}
        {hoveredApparatus && (
          <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-black shadow-lg">
            🔬 {hoveredApparatus}
          </div>
        )}

        {/* Unified Compact Bottom Dock: Live 3D Slider + Direct Step Solving Buttons */}
        {(onParameterChange || onSelectSolveStep) && (
          <div className="pointer-events-auto absolute bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[640px] z-20 bg-slate-950/90 backdrop-blur-md border border-slate-700/90 rounded-2xl px-3.5 py-2.5 shadow-2xl space-y-2">
            {onParameterChange && (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-black text-sky-300 flex items-center gap-1.5 truncate">
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {parameterLabel}:{' '}
                      <strong className="text-amber-300 font-mono">
                        {parameterValue} {parameterUnit}
                      </strong>
                    </span>
                  </span>
                  {targetParameterValue !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        onParameterChange(targetParameterValue);
                        triggerAnimatedReactionBurst();
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-[11px] font-black cursor-pointer shrink-0"
                    >
                      ⚡ Auto-Set ({targetParameterValue} {parameterUnit})
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min={parameterMin}
                  max={parameterMax}
                  step={parameterStep}
                  value={parameterValue}
                  onChange={(e) => onParameterChange(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 rounded-lg"
                />
              </div>
            )}

            {onSelectSolveStep && (
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => onSelectSolveStep('investigate')}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                    step1Complete
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                      : 'bg-slate-900 hover:bg-slate-800 border-sky-400/80 text-white'
                  }`}
                >
                  {step1Complete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Sliders className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )}
                  <span className="truncate">Step 1: Calibrate</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSolveStep('calculate')}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                    step2Complete
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                      : 'bg-slate-900 hover:bg-slate-800 border-amber-400/80 text-white'
                  }`}
                >
                  {step2Complete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="truncate">Step 2: Solve Qn</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSolveStep('conclude')}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                    step3Complete
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                      : 'bg-slate-900 hover:bg-slate-800 border-purple-400/80 text-white'
                  }`}
                >
                  {step3Complete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  )}
                  <span className="truncate">Step 3: Conclude</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Full-Screen Solving Overlays & Modals Rendered Directly Inside Full-Screen Container */}
        {children}
      </div>
    </div>
  );
};

export default ScienceLab3DViewport;
