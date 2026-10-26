import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Camera,
  CheckCircle2,
  Eye,
  HelpCircle,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BRIDGE_COMPONENT_CATALOG } from './stemBuilderCurriculum';
import {
  BridgeComponentType,
  BridgeMissionConfig,
  BridgeSimulationResult,
  BridgeSnapNode,
  PlacedBridgePiece,
} from './stemBuilderTypes';

export type FunnyVehicleType = 'dala_dala' | 'bodaboda' | 'pilau_truck' | 'hippo_truck';
export type BridgeBuildZone = 'deck' | 'pillars' | 'truss';

interface Bridge3DViewportProps {
  mission: BridgeMissionConfig;
  pieces: PlacedBridgePiece[];
  selectedTool: BridgeComponentType | 'inspect_delete';
  selectedStartNodeId: string | null;
  selectedPieceId: string | null;
  simulationResult: BridgeSimulationResult | null;
  isTesting: boolean;
  onSelectNode: (nodeId: string) => void;
  onSelectPiece: (pieceId: string | null) => void;
  onRemovePiece: (pieceId: string) => void;
  // Interactive direct-on-bridge question builder props
  onTriggerZoneQuestion?: (zone: BridgeBuildZone) => void;
  deckBuilt?: boolean;
  pillarsBuilt?: boolean;
  trussBuilt?: boolean;
  vehicleType?: FunnyVehicleType;
  nitroActive?: boolean;
  fullScreenMode?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onRunBridgeTest?: () => void;
  onResetBridge?: () => void;
  children?: React.ReactNode;
}

export const Bridge3DViewport: React.FC<Bridge3DViewportProps> = ({
  mission,
  pieces,
  selectedTool,
  selectedStartNodeId,
  selectedPieceId,
  simulationResult,
  isTesting,
  onSelectNode,
  onSelectPiece,
  onRemovePiece,
  onTriggerZoneQuestion,
  deckBuilt = false,
  pillarsBuilt = false,
  trussBuilt = false,
  vehicleType = 'dala_dala',
  nitroActive = false,
  fullScreenMode = true,
  isFullscreen: externalIsFullscreen,
  onToggleFullscreen,
  onRunBridgeTest,
  onResetBridge,
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const crocGroupRef = useRef<THREE.Group | null>(null);
  const fxGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const pieceMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const zoneMeshesRef = useRef<Map<BridgeBuildZone, THREE.Object3D>>(new Map());
  const requestRenderRef = useRef<() => void>(() => {});

  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'elevation' | 'top'>('perspective');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [internalFullscreen, setInternalFullscreen] = useState<boolean>(false);

  const isExpandedFullscreen =
    externalIsFullscreen !== undefined ? externalIsFullscreen : internalFullscreen;

  const handleFullscreenToggle = () => {
    const nextFullscreen = !isExpandedFullscreen;
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      setInternalFullscreen(nextFullscreen);
    }
    if (typeof document !== 'undefined') {
      if (nextFullscreen && !document.fullscreenElement && wrapperRef.current?.requestFullscreen) {
        wrapperRef.current.requestFullscreen().catch(() => {});
      } else if (!nextFullscreen && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);
  };

  const callbacksRef = useRef({
    onSelectNode,
    onSelectPiece,
    selectedTool,
    onTriggerZoneQuestion,
  });
  callbacksRef.current = {
    onSelectNode,
    onSelectPiece,
    selectedTool,
    onTriggerZoneQuestion,
  };

  // 1. Initialize Three.js Scene, Environment, Crocodile River, and Vehicle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = Math.max(300, container.clientWidth || window.innerWidth);
    const height = Math.max(300, container.clientHeight || window.innerHeight);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c192c);
    scene.fog = new THREE.FogExp2(0x0c192c, 0.011);
    sceneRef.current = scene;

    const aspect = width / height;
    const initialFov = aspect < 1 ? Math.min(68, Math.round(46 / Math.max(0.62, aspect * 0.92))) : 46;
    const camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.5, 250);
    const baseDist = mission.spanMeters <= 12 ? 20 : mission.spanMeters <= 18 ? 25 : 30;
    const mobileMultiplier = aspect < 0.75 ? 1.28 : aspect < 1 ? 1.12 : 1.0;
    const camDist = baseDist * mobileMultiplier;
    camera.position.set(3.5, 6.8, camDist * 0.88);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.minDistance = 7;
    controls.maxDistance = 75;
    controls.target.set(0, 0.3, 0);
    controlsRef.current = controls;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.05);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    sunLight.position.set(18, 28, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    rimLight.position.set(-18, 12, -14);
    scene.add(rimLight);

    // Static Environment Group: River Valley, Banks, Trees, Signs, and Swimming Crocodiles!
    const envGroup = new THREE.Group();
    const halfSpan = mission.spanMeters / 2;
    const bankWidth = 18;
    const bankDepth = 22;

    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.82,
      metalness: 0.05,
    });
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x57534e,
      roughness: 0.9,
      metalness: 0.08,
    });

    // Left & Right Banks
    const leftBank = new THREE.Mesh(new THREE.BoxGeometry(bankWidth, 7, bankDepth), cliffMat);
    leftBank.position.set(-(halfSpan + bankWidth / 2), -3.5, 0);
    leftBank.receiveShadow = true;
    envGroup.add(leftBank);

    const leftGrass = new THREE.Mesh(new THREE.BoxGeometry(bankWidth, 0.45, bankDepth), bankMat);
    leftGrass.position.set(-(halfSpan + bankWidth / 2), -0.1, 0);
    envGroup.add(leftGrass);

    const rightBank = new THREE.Mesh(new THREE.BoxGeometry(bankWidth, 7, bankDepth), cliffMat);
    rightBank.position.set(halfSpan + bankWidth / 2, -3.5, 0);
    rightBank.receiveShadow = true;
    envGroup.add(rightBank);

    const rightGrass = new THREE.Mesh(new THREE.BoxGeometry(bankWidth, 0.45, bankDepth), bankMat);
    rightGrass.position.set(halfSpan + bankWidth / 2, -0.1, 0);
    envGroup.add(rightGrass);

    // Approach Asphalt Roads
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
    const leftApproach = new THREE.Mesh(new THREE.BoxGeometry(bankWidth, 0.16, 3.6), roadMat);
    leftApproach.position.set(-(halfSpan + bankWidth / 2), 0.02, 0);
    envGroup.add(leftApproach);

    const rightApproach = new THREE.Mesh(new THREE.BoxGeometry(bankWidth, 0.16, 3.6), roadMat);
    rightApproach.position.set(halfSpan + bankWidth / 2, 0.02, 0);
    envGroup.add(rightApproach);

    // River Water & Riverbed
    const waterGeo = new THREE.BoxGeometry(mission.spanMeters + 2, 2.2, bankDepth);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.18,
      metalness: 0.35,
      transparent: true,
      opacity: 0.82,
    });
    const riverWater = new THREE.Mesh(waterGeo, waterMat);
    riverWater.position.set(0, -4.6, 0);
    envGroup.add(riverWater);

    const bedGeo = new THREE.BoxGeometry(mission.spanMeters + bankWidth * 2, 1.5, bankDepth);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95 });
    const riverBed = new THREE.Mesh(bedGeo, bedMat);
    riverBed.position.set(0, -6.2, 0);
    envGroup.add(riverBed);

    // Acacia Trees on both banks
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const treePositions = [
      [-(halfSpan + 4.5), 0, -5.2],
      [-(halfSpan + 8.5), 0, 5.2],
      [halfSpan + 4.5, 0, -5.2],
      [halfSpan + 8.5, 0, 5.2],
    ];
    treePositions.forEach(([tx, ty, tz]) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.4, 8), trunkMat);
      trunk.position.y = 1.2;
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.2, 9), canopyMat);
      canopy.position.y = 2.9;
      tree.add(trunk, canopy);
      tree.position.set(tx, ty, tz);
      envGroup.add(tree);
    });

    scene.add(envGroup);

    // Swimming 3D Crocodiles in the River!
    const crocGroup = new THREE.Group();
    const crocMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    const crocDarkMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    [-3.5, 3.5].forEach((zPos, idx) => {
      const croc = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.75), crocMat);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.55), crocMat);
      snout.position.set(1.5, -0.02, 0);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.6, 6), crocDarkMat);
      tail.rotation.z = Math.PI / 2;
      tail.position.set(-1.7, 0, 0);
      // Back ridges
      for (let r = -0.8; r <= 0.8; r += 0.5) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 4), crocDarkMat);
        spike.position.set(r, 0.28, 0);
        croc.add(spike);
      }
      // Bulging yellow eyes
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), eyeMat);
      eyeL.position.set(0.75, 0.24, 0.22);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), eyeMat);
      eyeR.position.set(0.75, 0.24, -0.22);
      const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), pupilMat);
      pupL.position.set(0.84, 0.25, 0.22);
      const pupR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), pupilMat);
      pupR.position.set(0.84, 0.25, -0.22);

      croc.add(body, snout, tail, eyeL, eyeR, pupL, pupR);
      croc.position.set(idx === 0 ? -2.2 : 2.2, -3.45, zPos);
      if (idx === 1) croc.rotation.y = Math.PI;
      crocGroup.add(croc);
    });
    scene.add(crocGroup);
    crocGroupRef.current = crocGroup;

    // Special Effects Group (Fireworks / Splash)
    const fxGroup = new THREE.Group();
    scene.add(fxGroup);
    fxGroupRef.current = fxGroup;

    // Dynamic Bridge & Ghost Hotspots Group
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    // Vehicle Group
    const vehicleGroup = new THREE.Group();
    vehicleGroup.position.set(-(halfSpan + 2.8), 0.15, 0);
    scene.add(vehicleGroup);
    vehicleGroupRef.current = vehicleGroup;

    // Render loop + gentle crocodile swim animation
    let animFrameId = 0;
    let isDisposed = false;

    const renderScene = () => {
      if (isDisposed) return;
      controls.update();
      renderer.render(scene, camera);
    };
    requestRenderRef.current = renderScene;

    let crocTimer = 0;
    const animateAmbient = () => {
      if (isDisposed) return;
      crocTimer += 0.04;
      if (crocGroupRef.current) {
        crocGroupRef.current.children.forEach((croc, i) => {
          const dir = i === 0 ? 1 : -1;
          croc.position.x = Math.sin(crocTimer * 0.7 + i * 2) * (halfSpan * 0.45) * dir;
          croc.rotation.y =
            Math.cos(crocTimer * 0.7 + i * 2) * dir >= 0 ? 0 : Math.PI;
          croc.position.y = -3.45 + Math.sin(crocTimer * 2 + i) * 0.06;
        });
      }
      controls.update();
      renderer.render(scene, camera);
      animFrameId = window.requestAnimationFrame(animateAmbient);
    };
    animFrameId = window.requestAnimationFrame(animateAmbient);

    // Raycaster for clicking nodes, pieces, OR direct 3D Bridge Build Zones!
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const nodeObjects = Array.from(nodeMeshesRef.current.values());
      const hits = raycaster.intersectObjects(nodeObjects, false);
      const hitNodeId = hits.length > 0 ? (hits[0].object.userData.nodeId as string) : null;
      setHoveredNodeId((prev) => (prev !== hitNodeId ? hitNodeId : prev));
    };

    const handlePointerUp = (e: PointerEvent) => {
      const moveDist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moveDist > 9) return; // Orbit drag, not click

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // 1. Check if player clicked a glowing 3D Ghost Build Zone directly on the bridge!
      const zoneObjects = Array.from(zoneMeshesRef.current.values());
      const zoneHits = raycaster.intersectObjects(zoneObjects, true);
      if (zoneHits.length > 0 && callbacksRef.current.onTriggerZoneQuestion) {
        let obj: THREE.Object3D | null = zoneHits[0].object;
        while (obj && !obj.userData?.buildZone) {
          obj = obj.parent;
        }
        if (obj?.userData?.buildZone) {
          callbacksRef.current.onTriggerZoneQuestion(obj.userData.buildZone as BridgeBuildZone);
          return;
        }
      }

      // 2. Check if player clicked a Snap Node
      const nodeObjects = Array.from(nodeMeshesRef.current.values());
      const nodeHits = raycaster.intersectObjects(nodeObjects, false);
      if (nodeHits.length > 0) {
        const nodeId = nodeHits[0].object.userData.nodeId as string;
        if (nodeId && callbacksRef.current.selectedTool !== 'inspect_delete') {
          callbacksRef.current.onSelectNode(nodeId);
          return;
        }
      }

      // 3. Check if player clicked an existing bridge piece
      const pieceObjects = Array.from(pieceMeshesRef.current.values());
      const pieceHits = raycaster.intersectObjects(pieceObjects, true);
      if (pieceHits.length > 0) {
        let obj: THREE.Object3D | null = pieceHits[0].object;
        while (obj && !obj.userData?.pieceId) {
          obj = obj.parent;
        }
        if (obj?.userData?.pieceId) {
          callbacksRef.current.onSelectPiece(obj.userData.pieceId as string);
          return;
        }
      }

      callbacksRef.current.onSelectPiece(null);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', handlePointerDown);
    domElem.addEventListener('pointermove', handlePointerMove);
    domElem.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(300, containerRef.current.clientWidth || window.innerWidth);
      const h = Math.max(300, containerRef.current.clientHeight || window.innerHeight);
      const nextAspect = w / h;
      cameraRef.current.aspect = nextAspect;
      cameraRef.current.fov =
        nextAspect < 1 ? Math.min(68, Math.round(46 / Math.max(0.62, nextAspect * 0.92))) : 46;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      domElem.removeEventListener('pointermove', handlePointerMove);
      domElem.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      renderer.dispose();
    };
  }, [mission.missionId, mission.spanMeters]);

  // 2. Rebuild 3D Vehicle Appearance whenever vehicleType or nitroActive changes
  useEffect(() => {
    const vehicleGroup = vehicleGroupRef.current;
    if (!vehicleGroup) return;
    while (vehicleGroup.children.length > 0) {
      vehicleGroup.remove(vehicleGroup.children[0]);
    }

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 14);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });

    const colorMap: Record<FunnyVehicleType, { primary: number; roof: number; stripe: number }> = {
      dala_dala: { primary: 0xf59e0b, roof: 0xffffff, stripe: 0x10b981 },
      bodaboda: { primary: 0xef4444, roof: 0xfacc15, stripe: 0x38bdf8 },
      pilau_truck: { primary: 0xec4899, roof: 0xfef08a, stripe: 0xa855f7 },
      hippo_truck: { primary: 0x8b5cf6, roof: 0x22d3ee, stripe: 0xf97316 },
    };
    const palette = colorMap[vehicleType];

    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.42, 1.45),
      new THREE.MeshStandardMaterial({ color: palette.primary, roughness: 0.3 })
    );
    chassis.position.y = 0.48;
    vehicleGroup.add(chassis);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.65, 1.35),
      new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.25 })
    );
    cabin.position.set(-0.08, 0.98, 0);
    vehicleGroup.add(cabin);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.62, 0.14, 1.48),
      new THREE.MeshBasicMaterial({ color: palette.stripe })
    );
    stripe.position.set(0, 0.56, 0);
    vehicleGroup.add(stripe);

    // Headlights
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const leftLamp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.24), lampMat);
    leftLamp.position.set(1.31, 0.52, 0.46);
    const rightLamp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.24), lampMat);
    rightLamp.position.set(1.31, 0.52, -0.46);
    vehicleGroup.add(leftLamp, rightLamp);

    // 4 Wheels (or big monster wheels for hippo_truck)
    const wheelScale = vehicleType === 'hippo_truck' ? 1.35 : 1.0;
    const wheelOffsets = [
      [-0.85, 0.32, 0.72],
      [0.85, 0.32, 0.72],
      [-0.85, 0.32, -0.72],
      [0.85, 0.32, -0.72],
    ];
    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.scale.set(wheelScale, wheelScale, wheelScale);
      wheel.position.set(wx, wy, wz);
      vehicleGroup.add(wheel);
    });

    // Nitro Flame Cone at the rear if Nitro Quiz Boost is active!
    if (nitroActive) {
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.4, 10),
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      flame.rotation.z = Math.PI / 2;
      flame.position.set(-1.95, 0.5, 0);
      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.9, 8),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      innerFlame.rotation.z = Math.PI / 2;
      innerFlame.position.set(-1.7, 0.5, 0);
      vehicleGroup.add(flame, innerFlame);
    }
  }, [vehicleType, nitroActive]);

  // 3. Synchronize Dynamic Nodes, Placed Bridge Pieces, and 3D Interactive Ghost Build Zones
  useEffect(() => {
    const dynamicGroup = dynamicGroupRef.current;
    if (!dynamicGroup) return;

    while (dynamicGroup.children.length > 0) {
      dynamicGroup.remove(dynamicGroup.children[0]);
    }
    nodeMeshesRef.current.clear();
    pieceMeshesRef.current.clear();
    zoneMeshesRef.current.clear();

    const nodeMap = new Map<string, BridgeSnapNode>();
    mission.nodes.forEach((n) => nodeMap.set(n.id, n));

    // A. Render 3D Clickable Ghost Build Zones for unbuilt sections so players can click directly on the bridge!
    if (!deckBuilt) {
      const ghostDeckGroup = new THREE.Group();
      ghostDeckGroup.userData = { buildZone: 'deck' as BridgeBuildZone };
      const ghostDeckMesh = new THREE.Mesh(
        new THREE.BoxGeometry(mission.spanMeters, 0.36, 3.0),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.28,
          wireframe: false,
        })
      );
      ghostDeckMesh.position.set(0, 0, 0);
      const ghostDeckWire = new THREE.Mesh(
        new THREE.BoxGeometry(mission.spanMeters, 0.4, 3.05),
        new THREE.MeshBasicMaterial({
          color: 0x7dd3fc,
          wireframe: true,
        })
      );
      ghostDeckGroup.add(ghostDeckMesh, ghostDeckWire);
      dynamicGroup.add(ghostDeckGroup);
      zoneMeshesRef.current.set('deck', ghostDeckGroup);
    }

    if (!pillarsBuilt) {
      const ghostPillarGroup = new THREE.Group();
      ghostPillarGroup.userData = { buildZone: 'pillars' as BridgeBuildZone };
      mission.nodes
        .filter((n) => n.role === 'riverbed_base')
        .forEach((bNode) => {
          const ghostCol = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.55, 4.0, 12),
            new THREE.MeshBasicMaterial({
              color: 0x2dd4bf,
              transparent: true,
              opacity: 0.28,
            })
          );
          ghostCol.position.set(bNode.x, -2.0, 0);
          ghostPillarGroup.add(ghostCol);
        });
      dynamicGroup.add(ghostPillarGroup);
      zoneMeshesRef.current.set('pillars', ghostPillarGroup);
    }

    if (!trussBuilt) {
      const ghostTrussGroup = new THREE.Group();
      ghostTrussGroup.userData = { buildZone: 'truss' as BridgeBuildZone };
      const ghostArch = new THREE.Mesh(
        new THREE.BoxGeometry(mission.spanMeters * 0.85, 3.2, 2.6),
        new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.16,
          wireframe: true,
        })
      );
      ghostArch.position.set(0, 2.0, 0);
      ghostTrussGroup.add(ghostArch);
      dynamicGroup.add(ghostTrussGroup);
      zoneMeshesRef.current.set('truss', ghostTrussGroup);
    }

    // B. Render Snap Nodes
    mission.nodes.forEach((node) => {
      const isSelectedStart = selectedStartNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const isUnsupported = simulationResult?.unsupportedDeckNodeIds.includes(node.id);

      let nodeColor = 0x3b82f6;
      if (node.role === 'bank_anchor') nodeColor = 0x10b981;
      else if (node.role === 'truss_top') nodeColor = 0xf59e0b;
      else if (node.role === 'riverbed_base') nodeColor = 0x14b8a6;

      if (isUnsupported) nodeColor = 0xef4444;
      if (isSelectedStart) nodeColor = 0xa855f7;
      else if (isHovered) nodeColor = 0x38bdf8;

      const radius = isSelectedStart ? 0.62 : isHovered ? 0.55 : 0.46;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 18, 18),
        new THREE.MeshStandardMaterial({
          color: nodeColor,
          emissive: isSelectedStart || isHovered ? nodeColor : 0x000000,
          emissiveIntensity: isSelectedStart ? 0.6 : isHovered ? 0.4 : 0.15,
          roughness: 0.25,
          metalness: 0.3,
        })
      );
      sphere.position.set(node.x, node.y, node.z);
      sphere.userData = { nodeId: node.id };
      dynamicGroup.add(sphere);
      nodeMeshesRef.current.set(node.id, sphere);
    });

    // C. Render Placed Bridge Components
    pieces.forEach((piece) => {
      const nA = nodeMap.get(piece.startNodeId);
      const nB = nodeMap.get(piece.endNodeId);
      if (!nA || !nB) return;

      const startVec = new THREE.Vector3(nA.x, nA.y, nA.z);
      const endVec = new THREE.Vector3(nB.x, nB.y, nB.z);
      const midVec = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
      const length = startVec.distanceTo(endVec);
      const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();

      const spec = BRIDGE_COMPONENT_CATALOG[piece.type];
      const isSelected = selectedPieceId === piece.id;

      let baseColor = new THREE.Color(spec.colorHex);
      if (simulationResult) {
        if (piece.status === 'overloaded' || piece.status === 'disconnected') {
          baseColor = new THREE.Color(0xef4444);
        } else if (piece.status === 'warning') {
          baseColor = new THREE.Color(0xf59e0b);
        }
      }
      if (isSelected) {
        baseColor = new THREE.Color(0xa855f7);
      }

      const memberGroup = new THREE.Group();
      memberGroup.userData = { pieceId: piece.id };

      if (piece.type === 'road_deck') {
        const deckSlab = new THREE.Mesh(
          new THREE.BoxGeometry(length, 0.36, 3.2),
          new THREE.MeshStandardMaterial({
            color: isSelected ? 0x9333ea : piece.status === 'overloaded' ? 0xdc2626 : 0x334155,
            roughness: 0.6,
            metalness: 0.2,
          })
        );
        const railMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.3,
          metalness: 0.7,
        });
        const frontRail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.4, 0.14), railMat);
        frontRail.position.set(0, 0.34, 1.5);
        const backRail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.4, 0.14), railMat);
        backRail.position.set(0, 0.34, -1.5);
        const centerLine = new THREE.Mesh(
          new THREE.BoxGeometry(length * 0.82, 0.38, 0.16),
          new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        memberGroup.add(deckSlab, frontRail, backRail, centerLine);
        memberGroup.position.copy(midVec);
        const angleZ = Math.atan2(endVec.y - startVec.y, endVec.x - startVec.x);
        memberGroup.rotation.z = angleZ;
      } else if (piece.type === 'concrete_pillar') {
        const pierMat = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.7,
          metalness: 0.15,
        });
        const colFront = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.48, length, 12),
          pierMat
        );
        colFront.position.z = 0.85;
        const colBack = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.48, length, 12),
          pierMat
        );
        colBack.position.z = -0.85;
        const capBeam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.48, 2.7), pierMat);
        capBeam.position.y = length / 2 - 0.25;
        memberGroup.add(colFront, colBack, capBeam);
        memberGroup.position.copy(midVec);
      } else {
        const radius =
          piece.type === 'steel_beam' ? 0.23 : piece.type === 'truss_strut' ? 0.18 : 0.1;
        const memberMat = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.3,
          metalness: 0.65,
        });

        const cylGeo = new THREE.CylinderGeometry(radius, radius, length, 10);
        const frontMember = new THREE.Mesh(cylGeo, memberMat);
        frontMember.position.z = 1.25;
        const backMember = new THREE.Mesh(cylGeo, memberMat);
        backMember.position.z = -1.25;
        memberGroup.add(frontMember, backMember);

        if (piece.type !== 'suspension_cable') {
          const crossTie = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.09, 2.5, 8),
            memberMat
          );
          crossTie.rotation.x = Math.PI / 2;
          memberGroup.add(crossTie);
        }

        memberGroup.position.copy(midVec);
        const upAxis = new THREE.Vector3(0, 1, 0);
        memberGroup.quaternion.setFromUnitVectors(upAxis, dir);
      }

      dynamicGroup.add(memberGroup);
      pieceMeshesRef.current.set(piece.id, memberGroup);
    });
  }, [
    mission,
    pieces,
    selectedStartNodeId,
    selectedPieceId,
    hoveredNodeId,
    simulationResult,
    deckBuilt,
    pillarsBuilt,
    trussBuilt,
  ]);

  // 4. Animate Test Vehicle Crossing + Fireworks or River Splash!
  useEffect(() => {
    const vehicle = vehicleGroupRef.current;
    const fxGroup = fxGroupRef.current;
    if (!vehicle || !fxGroup) return;

    while (fxGroup.children.length > 0) {
      fxGroup.remove(fxGroup.children[0]);
    }

    const halfSpan = mission.spanMeters / 2;
    const startX = -(halfSpan + 2.8);
    const endX = halfSpan + 2.8;

    if (!isTesting) {
      vehicle.position.set(startX, 0.15, 0);
      vehicle.rotation.set(0, 0, 0);
      return;
    }

    let animId = 0;
    const startTime = performance.now();
    const durationMs = nitroActive ? 1900 : 2500;
    const passed = simulationResult?.passed ?? false;
    const hasRoad = simulationResult?.connectedRoadDeck ?? false;

    // Create 3D celebration confetti spheres if passed, or water splash spheres if failed!
    const particles: Array<{ mesh: THREE.Mesh; vx: number; vy: number; vz: number }> = [];
    const particleColors = passed
      ? [0xfacc15, 0x10b981, 0x38bdf8, 0xf43f5e, 0xa855f7]
      : [0x38bdf8, 0x7dd3fc, 0xe0f2fe];

    for (let i = 0; i < 28; i++) {
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(passed ? 0.22 : 0.26, 8, 8),
        new THREE.MeshBasicMaterial({
          color: particleColors[i % particleColors.length],
        })
      );
      pMesh.visible = false;
      fxGroup.add(pMesh);
      particles.push({
        mesh: pMesh,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 7 + 3,
        vz: (Math.random() - 0.5) * 6,
      });
    }

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const stopProgress = passed ? 1.0 : hasRoad ? 0.5 : 0.22;
      const effectiveT = Math.min(t, stopProgress);
      const curX = startX + (endX - startX) * effectiveT;

      let curY = 0.15;
      let tiltZ = 0;

      if (!passed && t >= stopProgress) {
        // Funny nose-dive into the crocodile river!
        const fallProgress = Math.min(1, (t - stopProgress) / (1 - stopProgress));
        curY = 0.15 - fallProgress * 3.6;
        tiltZ = -fallProgress * 0.65;

        // Trigger splash droplets
        particles.forEach((p) => {
          p.mesh.visible = true;
          p.mesh.position.set(
            curX + p.vx * fallProgress * 0.45,
            -3.2 + p.vy * fallProgress * 0.45 - 3.5 * fallProgress * fallProgress,
            p.vz * fallProgress * 0.45
          );
        });
      } else {
        // Happy bouncy Dala-Dala ride across the bridge!
        curY = 0.15 + Math.abs(Math.sin(t * Math.PI * 6)) * 0.08;
        tiltZ = Math.sin(t * Math.PI * 6) * 0.03;

        if (passed && t > 0.55) {
          const fwProgress = (t - 0.55) / 0.45;
          particles.forEach((p) => {
            p.mesh.visible = true;
            p.mesh.position.set(
              p.vx * fwProgress,
              2.5 + p.vy * fwProgress - 4.0 * fwProgress * fwProgress,
              p.vz * fwProgress
            );
          });
        }
      }

      vehicle.position.set(curX, curY, 0);
      vehicle.rotation.z = tiltZ;

      if (t < 1) {
        animId = window.requestAnimationFrame(step);
      }
    };

    animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [isTesting, mission.spanMeters, simulationResult, nitroActive]);

  // 5. Camera View Preset Controls
  const applyCameraPreset = (preset: 'perspective' | 'elevation' | 'top') => {
    setCameraPreset(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const aspect = camera.aspect || 1;
    const baseDist = mission.spanMeters <= 12 ? 20 : mission.spanMeters <= 18 ? 25 : 30;
    const mobileMultiplier = aspect < 0.75 ? 1.28 : aspect < 1 ? 1.12 : 1.0;
    const camDist = baseDist * mobileMultiplier;

    if (preset === 'perspective') {
      camera.position.set(3.5, 6.8, camDist * 0.88);
    } else if (preset === 'elevation') {
      camera.position.set(0, 1.5, camDist);
    } else {
      camera.position.set(0, camDist * 0.95, 2);
    }
    controls.target.set(0, 0.3, 0);
    controls.update();
  };

  const adjustZoom = (factor: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.multiplyScalar(factor);
    controls.update();
  };

  const selectedPiece = pieces.find((p) => p.id === selectedPieceId) || null;

  return (
    <div
      ref={wrapperRef}
      className={
        isExpandedFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-[100dvh] bg-slate-950 overflow-hidden select-none'
          : `relative w-full ${
              fullScreenMode ? 'h-full' : 'h-[480px] sm:h-[560px]'
            } bg-slate-950 overflow-hidden select-none`
      }
    >
      {/* 3D WebGL Canvas */}
      {webglSupported ? (
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-300">
          <Camera className="w-8 h-8 text-amber-400 mb-2" />
          <div className="font-bold text-sm text-white">
            Interactive Bridge Mode (Tap any Build Hotspot on the Bridge!)
          </div>
        </div>
      )}

      {/* Prominent Fullscreen Toggle Button on Top-Right of 3D Canvas */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {onResetBridge && pieces.length > 0 && (
          <button
            type="button"
            onClick={onResetBridge}
            disabled={isTesting}
            className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-rose-950/90 border border-slate-700 text-slate-200 hover:text-rose-200 text-xs font-bold flex items-center gap-1 shadow-xl backdrop-blur-md cursor-pointer"
            title="Reset Bridge"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleFullscreenToggle}
          aria-label={isExpandedFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Bridge'}
          className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xl shadow-sky-500/30 border border-white/60 transition-transform active:scale-95 cursor-pointer"
          title={isExpandedFullscreen ? 'Exit Fullscreen' : 'Expand 3D Bridge to Fullscreen'}
        >
          {isExpandedFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* DIRECT ON-BRIDGE CLICKABLE BUILD HOTSPOTS (Click directly on the bridge to pop up the STEM Question & build!) */}
      {onTriggerZoneQuestion && !isTesting && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2">
          {/* Spot 3: Overhead Truss Arch (Above the bridge) */}
          <div className="pointer-events-auto -translate-y-12 sm:-translate-y-20">
            <button
              type="button"
              onClick={() => onTriggerZoneQuestion('truss')}
              className={`group px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border-2 font-black text-[11px] sm:text-sm shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                trussBuilt
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 hover:scale-105'
                  : 'bg-amber-500/95 hover:bg-amber-400 border-white text-slate-950 animate-bounce shadow-amber-500/40'
              }`}
            >
              {trussBuilt ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>🔺 Truss Built! (Tap Qn)</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
                  <span>🔺 Step 3: Tap Bridge Arch → Answer Qn &amp; Build Truss!</span>
                </>
              )}
            </button>
          </div>

          {/* Spot 1: Main Road Deck (Right across the middle of the river bridge) */}
          <div className="pointer-events-auto my-1.5 sm:my-2">
            <button
              type="button"
              onClick={() => onTriggerZoneQuestion('deck')}
              className={`group px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border-2 font-black text-[11px] sm:text-sm shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                deckBuilt
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 hover:scale-105'
                  : 'bg-sky-400 hover:bg-sky-300 border-white text-slate-950 scale-105 animate-pulse shadow-sky-400/50'
              }`}
            >
              {deckBuilt ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>🛣️ Road Deck Built! (Tap Qn)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
                  <span>🛣️ Step 1: Tap Bridge → Answer Qn to Build Road Deck!</span>
                </>
              )}
            </button>
          </div>

          {/* Spot 2: Riverbed Concrete Pillars (Below the deck in the crocodile river) */}
          <div className="pointer-events-auto translate-y-10 sm:translate-y-16">
            <button
              type="button"
              onClick={() => onTriggerZoneQuestion('pillars')}
              className={`group px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border-2 font-black text-[11px] sm:text-sm shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                pillarsBuilt
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 hover:scale-105'
                  : 'bg-teal-400 hover:bg-teal-300 border-white text-slate-950 animate-bounce shadow-teal-400/50'
              }`}
            >
              {pillarsBuilt ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>🏛️ Pillars Built! (Tap Qn)</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
                  <span>🏛️ Step 2: Tap River → Answer Qn to Drop Pillars! 🐊</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Camera Controls Pill (Top Left on Mobile, Bottom Left on Desktop) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 text-[11px] shadow-xl">
        <button
          type="button"
          onClick={() => applyCameraPreset('perspective')}
          className={`px-2 py-1 rounded-lg font-bold cursor-pointer ${
            cameraPreset === 'perspective'
              ? 'bg-sky-500 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          3D Orbit
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('elevation')}
          className={`px-2 py-1 rounded-lg font-bold cursor-pointer ${
            cameraPreset === 'elevation'
              ? 'bg-sky-500 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Side
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('top')}
          className={`px-2 py-1 rounded-lg font-bold cursor-pointer ${
            cameraPreset === 'top'
              ? 'bg-sky-500 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Top
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(0.84)}
          title="Zoom In"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => adjustZoom(1.18)}
          title="Zoom Out"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* When in pure expanded fullscreen mode, provide floating Drive button at bottom right */}
      {isExpandedFullscreen && onRunBridgeTest && (
        <div className="absolute bottom-4 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 shadow-2xl">
            {onTriggerZoneQuestion && (
              <>
                <button
                  type="button"
                  onClick={() => onTriggerZoneQuestion('deck')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black cursor-pointer ${
                    deckBuilt ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-400 text-slate-950'
                  }`}
                >
                  {deckBuilt ? '✅ Deck' : '🛣️ 1. Deck Qn'}
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerZoneQuestion('pillars')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black cursor-pointer ${
                    pillarsBuilt ? 'bg-emerald-500/20 text-emerald-300' : 'bg-teal-400 text-slate-950'
                  }`}
                >
                  {pillarsBuilt ? '✅ Pillars' : '🏛️ 2. Pillars Qn'}
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerZoneQuestion('truss')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black cursor-pointer ${
                    trussBuilt ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {trussBuilt ? '✅ Truss' : '🔺 3. Truss Qn'}
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onRunBridgeTest}
            disabled={isTesting}
            className="pointer-events-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isTesting ? '🚐 CROSSING...' : '🚐 DRIVE NOW!'}</span>
          </button>
        </div>
      )}

      {/* Selected Component Inspector Overlay */}
      {selectedPiece && (
        <div className="absolute bottom-24 right-3 z-20 bg-slate-950/95 border border-violet-500/70 rounded-2xl p-3 text-xs text-slate-100 shadow-2xl max-w-xs space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-violet-300 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{BRIDGE_COMPONENT_CATALOG[selectedPiece.type].label}</span>
            </span>
            <button
              type="button"
              onClick={() => onSelectPiece(null)}
              className="text-slate-400 hover:text-white text-[11px] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="text-[11px] text-slate-300 tabular-nums">
            {selectedPiece.startNodeId} → {selectedPiece.endNodeId} ({selectedPiece.lengthMeters}m ·{' '}
            {selectedPiece.cost} units)
          </div>
          <button
            type="button"
            onClick={() => onRemovePiece(selectedPiece.id)}
            className="w-full py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Piece</span>
          </button>
        </div>
      )}

      {/* Fullscreen Question Modals & Post-Report Modals rendered inside the fullscreen container */}
      {children}
    </div>
  );
};
