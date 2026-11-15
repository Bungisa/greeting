import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type RoomStationId =
  | 'chalkboard'
  | 'clock'
  | 'bookshelf'
  | 'desk'
  | 'lab_bench'
  | 'cabinet'
  | 'logic_board'
  | 'exit_door';

export type CameraViewMode = 'chase' | 'overview' | 'orbit';

export interface Station3DConfig {
  id: RoomStationId;
  shortTag: string;
  title: string;
  position: [number, number, number];
  standPosition: [number, number, number];
  faceAngle: number;
  isMainLock: boolean;
  lockStep?: number;
}

export const ROOM_STATIONS_3D: Station3DConfig[] = [
  {
    id: 'chalkboard',
    shortTag: 'LOCK 1',
    title: 'Chalkboard Cipher',
    position: [-3.2, 0, -5.5],
    standPosition: [-3.2, 0, -3.7],
    faceAngle: Math.PI,
    isMainLock: true,
    lockStep: 1,
  },
  {
    id: 'lab_bench',
    shortTag: 'LOCK 2',
    title: 'Lab Bench Specimens',
    position: [1.6, 0, -0.8],
    standPosition: [1.6, 0, 1.1],
    faceAngle: Math.PI,
    isMainLock: true,
    lockStep: 2,
  },
  {
    id: 'cabinet',
    shortTag: 'LOCK 3',
    title: 'Supply Cabinet Safe',
    position: [6.4, 0, -2.2],
    standPosition: [4.6, 0, -2.2],
    faceAngle: Math.PI / 2,
    isMainLock: true,
    lockStep: 3,
  },
  {
    id: 'logic_board',
    shortTag: 'LOCK 4',
    title: 'Master Logic Board',
    position: [3.2, 0, -5.5],
    standPosition: [3.2, 0, -3.7],
    faceAngle: Math.PI,
    isMainLock: true,
    lockStep: 4,
  },
  {
    id: 'exit_door',
    shortTag: 'EXIT DOOR',
    title: 'Escape Keypad Door',
    position: [6.7, 0, 2.4],
    standPosition: [4.8, 0, 2.4],
    faceAngle: Math.PI / 2,
    isMainLock: true,
    lockStep: 5,
  },
  {
    id: 'bookshelf',
    shortTag: 'CLUE',
    title: 'Formula Shelf',
    position: [-6.4, 0, -1.6],
    standPosition: [-4.7, 0, -1.6],
    faceAngle: -Math.PI / 2,
    isMainLock: false,
  },
  {
    id: 'desk',
    shortTag: 'CLUE',
    title: 'Teacher Desk UV',
    position: [-2.8, 0, 0.4],
    standPosition: [-2.8, 0, 2.0],
    faceAngle: Math.PI,
    isMainLock: false,
  },
  {
    id: 'clock',
    shortTag: 'CLUE',
    title: 'Wall Clock Clue',
    position: [0.0, 0, -5.5],
    standPosition: [0.0, 0, -3.8],
    faceAngle: Math.PI,
    isMainLock: false,
  },
];

interface EscapeClassroom3DSceneProps {
  roomThemeId: string;
  activeStation: RoomStationId;
  recommendedNextStation: RoomStationId;
  solvedMap: Record<RoomStationId, boolean>;
  chalkboardEquation: string;
  masterCodePreview: string;
  solvedPinPreview?: string;
  verifiedSpecimensCount?: number;
  cameraMode: CameraViewMode;
  isModalOpen: boolean;
  isEscaped: boolean;
  externalMoveDir: { x: number; z: number };
  walkToStationTrigger: { id: RoomStationId; seq: number } | null;
  cameraRotateTrigger?: { deltaAngle: number; seq: number } | null;
  onArriveAtStation: (id: RoomStationId) => void;
  onNearStationChange: (id: RoomStationId | null) => void;
}

function createSignCanvasTexture(
  badgeText: string,
  mainLabel: string,
  state: 'start' | 'next' | 'solved' | 'exit_ready' | 'locked' | 'clue'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const palette = {
    start: {
      bg: '#064e3b',
      border: '#34d399',
      badgeBg: '#fbbf24',
      badgeText: '#0f172a',
      title: '#ffffff',
      glow: '#10b981',
    },
    next: {
      bg: '#0c4a6e',
      border: '#38bdf8',
      badgeBg: '#f59e0b',
      badgeText: '#0f172a',
      title: '#ffffff',
      glow: '#0ea5e9',
    },
    exit_ready: {
      bg: '#065f46',
      border: '#4ade80',
      badgeBg: '#22c55e',
      badgeText: '#052e16',
      title: '#ecfdf5',
      glow: '#22c55e',
    },
    solved: {
      bg: '#064e3b',
      border: '#10b981',
      badgeBg: '#10b981',
      badgeText: '#022c22',
      title: '#a7f3d0',
      glow: '#059669',
    },
    locked: {
      bg: '#0f172a',
      border: '#475569',
      badgeBg: '#334155',
      badgeText: '#e2e8f0',
      title: '#cbd5e1',
      glow: '#334155',
    },
    clue: {
      bg: '#1e1b4b',
      border: '#818cf8',
      badgeBg: '#6366f1',
      badgeText: '#ffffff',
      title: '#e0e7ff',
      glow: '#6366f1',
    },
  }[state];

  // Outer card with rounded corners
  const r = 28;
  const x = 16;
  const y = 16;
  const w = canvas.width - 32;
  const h = 152;

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = state === 'start' || state === 'next' || state === 'exit_ready' ? 22 : 8;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = palette.bg;
  ctx.fill();
  ctx.lineWidth = state === 'start' || state === 'next' || state === 'exit_ready' ? 8 : 5;
  ctx.strokeStyle = palette.border;
  ctx.stroke();
  ctx.restore();

  // Top Pill Badge
  ctx.fillStyle = palette.badgeBg;
  const badgeW = Math.min(w - 40, Math.max(200, badgeText.length * 22 + 44));
  const badgeX = (canvas.width - badgeW) / 2;
  const badgeY = 32;
  const badgeH = 46;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 14);
  ctx.fill();

  ctx.fillStyle = palette.badgeText;
  ctx.font = '900 26px "Inter", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, canvas.width / 2, badgeY + badgeH / 2 + 1);

  // Main concise label
  ctx.fillStyle = palette.title;
  ctx.font = '800 32px "Inter", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(mainLabel, canvas.width / 2, 122);

  // Downward pointer triangle
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 26, y + h);
  ctx.lineTo(canvas.width / 2 + 26, y + h);
  ctx.lineTo(canvas.width / 2, y + h + 36);
  ctx.closePath();
  ctx.fillStyle = palette.border;
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createChalkboardTexture(
  equationText: string,
  solved: boolean,
  solvedPin: string = ''
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = solved ? '#042f2e' : '#053326';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = solved ? '#10b981' : '#065f46';
  ctx.lineWidth = 3;
  for (let i = 0; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }

  ctx.fillStyle = '#fde68a';
  ctx.font = '900 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★ LOCK #1 · CHALKBOARD CIPHER ★', 256, 44);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 20px monospace';
  const cleanEq = equationText.replace(/\$/g, '').slice(0, 44);
  ctx.fillText(cleanEq || 'Solve Problems A, B, C -> 3-Digit PIN', 256, 108);

  if (solved) {
    ctx.fillStyle = '#34d399';
    ctx.font = '900 28px monospace';
    ctx.fillText(`✓ PIN UNLOCKED: [ ${solvedPin || '✓✓✓'} ]`, 256, 176);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('PROCEED TO LOCK #2 (LAB BENCH)', 256, 222);
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 26px monospace';
    ctx.fillText('SOLVE FOR 3-DIGIT PIN [A][B][C]', 256, 184);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createLogicBoardTexture(masterCode: string, solved: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = solved ? '#022c22' : '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Circuit trace lines
  ctx.strokeStyle = solved ? '#10b981' : '#1d4ed8';
  ctx.lineWidth = 3;
  for (let y = 32; y < 256; y += 44) {
    ctx.beginPath();
    ctx.moveTo(16, y);
    ctx.lineTo(110, y);
    ctx.lineTo(135, y + 14);
    ctx.lineTo(496, y + 14);
    ctx.stroke();
  }

  ctx.fillStyle = solved ? '#6ee7b7' : '#38bdf8';
  ctx.font = '900 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★ LOCK #4 · LOGIC SYNTHESIS BOARD ★', 256, 46);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 19px monospace';
  ctx.fillText('GATE MATRIX: [PIN] + [LATCH] + [KEY]', 256, 108);

  ctx.fillStyle = solved ? '#4ade80' : '#fbbf24';
  ctx.font = '900 27px monospace';
  ctx.fillText(
    solved ? `✓ EXIT CODE: ${masterCode || 'READY'}` : `SYNTHESIZE: ${masterCode || '???-??-??'}`,
    256,
    182
  );

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const EscapeClassroom3DScene: React.FC<EscapeClassroom3DSceneProps> = ({
  roomThemeId,
  recommendedNextStation,
  solvedMap,
  chalkboardEquation,
  masterCodePreview,
  solvedPinPreview = '',
  verifiedSpecimensCount = 0,
  cameraMode,
  isModalOpen,
  isEscaped,
  externalMoveDir,
  walkToStationTrigger,
  cameraRotateTrigger = null,
  onArriveAtStation,
  onNearStationChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState<boolean>(false);

  // Refs for latest props inside animation loop
  const recommendedRef = useRef<RoomStationId>(recommendedNextStation);
  recommendedRef.current = recommendedNextStation;

  const solvedMapRef = useRef<Record<RoomStationId, boolean>>(solvedMap);
  solvedMapRef.current = solvedMap;

  const masterCodePreviewRef = useRef<string>(masterCodePreview);
  masterCodePreviewRef.current = masterCodePreview;

  const solvedPinPreviewRef = useRef<string>(solvedPinPreview);
  solvedPinPreviewRef.current = solvedPinPreview;

  const verifiedSpecimensRef = useRef<number>(verifiedSpecimensCount);
  verifiedSpecimensRef.current = verifiedSpecimensCount;

  const cameraModeRef = useRef<CameraViewMode>(cameraMode);
  const prevCameraModeRef = useRef<CameraViewMode>(cameraMode);
  const modePresetTransitionRef = useRef<number>(0);
  if (cameraModeRef.current !== cameraMode) {
    cameraModeRef.current = cameraMode;
    modePresetTransitionRef.current = 0.55;
  }

  const pendingRotateDeltaRef = useRef<number>(0);
  useEffect(() => {
    if (!cameraRotateTrigger) return;
    pendingRotateDeltaRef.current += cameraRotateTrigger.deltaAngle;
  }, [cameraRotateTrigger]);

  const isModalOpenRef = useRef<boolean>(isModalOpen);
  isModalOpenRef.current = isModalOpen;

  const isEscapedRef = useRef<boolean>(isEscaped);
  isEscapedRef.current = isEscaped;

  const externalMoveRef = useRef<{ x: number; z: number }>(externalMoveDir);
  externalMoveRef.current = externalMoveDir;

  const onArriveRef = useRef(onArriveAtStation);
  onArriveRef.current = onArriveAtStation;

  const onNearChangeRef = useRef(onNearStationChange);
  onNearChangeRef.current = onNearStationChange;

  const pendingTargetRef = useRef<{
    x: number;
    z: number;
    faceAngle?: number;
    stationId?: RoomStationId;
  } | null>(null);

  // Trigger walk from parent button/step bar
  useEffect(() => {
    if (!walkToStationTrigger) return;
    const st = ROOM_STATIONS_3D.find((s) => s.id === walkToStationTrigger.id);
    if (st) {
      pendingTargetRef.current = {
        x: st.standPosition[0],
        z: st.standPosition[2],
        faceAngle: st.faceAngle,
        stationId: st.id,
      };
    }
  }, [walkToStationTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /swiftshader|llvmpipe|software|mesa offscreen/i.test(gpuRenderer);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex =
      roomThemeId === 'exam_hall'
        ? 0x090f1d
        : roomThemeId === 'library_vault'
        ? 0x120d1d
        : 0x07111e;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.022);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const initialAspect = container.clientWidth / Math.max(1, container.clientHeight);
    const initialFov =
      initialAspect < 1
        ? Math.min(68, Math.round(52 / Math.max(0.56, Math.sqrt(initialAspect))))
        : 52;
    const initialZoomOut =
      initialAspect < 1
        ? THREE.MathUtils.clamp(1 / Math.max(0.45, initialAspect * 0.88), 1.18, 2.05)
        : 1.0;

    const camera = new THREE.PerspectiveCamera(
      initialFov,
      initialAspect,
      0.1,
      120
    );
    camera.position.set(0, 7.2 * initialZoomOut, 8.8 * initialZoomOut);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minPolarAngle = 0.25;
    controls.minDistance = 3.5;
    controls.maxDistance = 34;
    controls.target.set(0, 1.2, -1);

    // ==================== 3-POINT + ROOM LIGHTING ====================
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(6, 12, 8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 30;
      const d = 10;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(-8, 8, -6);
    scene.add(rimLight);

    // Dynamic spotlight following the active recommended station
    const beaconPointLight = new THREE.PointLight(0xfbbf24, 2.5, 7.5);
    beaconPointLight.position.set(-3.2, 3.2, -4.2);
    scene.add(beaconPointLight);

    // Subtle proximity point light that intensifies when the character approaches any interactive 3D object
    const proximityPointLight = new THREE.PointLight(0x34d399, 0, 5.5);
    proximityPointLight.position.set(-3.2, 2.2, -3.7);
    scene.add(proximityPointLight);

    // ==================== 3D ROOM ARCHITECTURE ====================
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Checkered / tiled floor
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#0f172a';
    fCtx.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        fCtx.fillStyle = (r + c) % 2 === 0 ? '#162033' : '#0f172a';
        fCtx.fillRect(c * 64, r * 64, 64, 64);
        fCtx.strokeStyle = '#1e293b';
        fCtx.lineWidth = 2;
        fCtx.strokeRect(c * 64, r * 64, 64, 64);
      }
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(3, 3);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(14.4, 12.4),
      new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.45,
        metalness: 0.1,
      })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    floorMesh.name = 'walkable_floor';
    roomGroup.add(floorMesh);

    // Walls (Back, Left, Right) with independent materials so any wall between the camera and the room automatically fades to transparent cutaway!
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.08,
      transparent: true,
      opacity: 1.0,
    });
    const leftWallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.08,
      transparent: true,
      opacity: 1.0,
    });
    const rightWallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.08,
      transparent: true,
      opacity: 1.0,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.3,
    });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(14.6, 5.2, 0.35), backWallMat);
    backWall.position.set(0, 2.6, -6.1);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 12.4), leftWallMat);
    leftWall.position.set(-7.1, 2.6, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Split Right Wall around the Exit Doorway (z = 1.25 to 3.55, y = 0 to 3.7) so opening the door reveals the Serengeti outside!
    const rightWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 7.45), rightWallMat);
    rightWallNorth.position.set(7.1, 2.6, -2.475);
    rightWallNorth.receiveShadow = true;
    roomGroup.add(rightWallNorth);

    const rightWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 2.65), rightWallMat);
    rightWallSouth.position.set(7.1, 2.6, 4.875);
    rightWallSouth.receiveShadow = true;
    roomGroup.add(rightWallSouth);

    const rightWallLintel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 2.3), rightWallMat);
    rightWallLintel.position.set(7.1, 4.45, 2.4);
    rightWallLintel.receiveShadow = true;
    roomGroup.add(rightWallLintel);

    // Baseboards
    const backTrim = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.25, 0.42), trimMat);
    backTrim.position.set(0, 0.125, -6.05);
    roomGroup.add(backTrim);

    // ==================== 8 INTERACTIVE 3D ROOM PROPS ====================
    const interactiveRoots: Map<RoomStationId, THREE.Group> = new Map();
    const stationMatRecords: Map<
      RoomStationId,
      Array<{
        mat: THREE.MeshStandardMaterial;
        baseEmissiveHex: number;
        baseEmissiveIntensity: number;
      }>
    > = new Map();
    const pickableMeshes: THREE.Object3D[] = [floorMesh];

    const registerStationProp = (id: RoomStationId, group: THREE.Group) => {
      group.userData.stationId = id;
      const matList: Array<{
        mat: THREE.MeshStandardMaterial;
        baseEmissiveHex: number;
        baseEmissiveIntensity: number;
      }> = [];

      group.traverse((child) => {
        child.userData.stationId = id;
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = !isSoftwareGl;
          mesh.receiveShadow = !isSoftwareGl;
          pickableMeshes.push(mesh);

          const m = mesh.material;
          if (m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const stdMat = m as THREE.MeshStandardMaterial;
            matList.push({
              mat: stdMat,
              baseEmissiveHex: stdMat.emissive ? stdMat.emissive.getHex() : 0x000000,
              baseEmissiveIntensity: stdMat.emissiveIntensity ?? 0,
            });
          }
        }
      });
      interactiveRoots.set(id, group);
      stationMatRecords.set(id, matList);
      roomGroup.add(group);
    };

    // 1. CHALKBOARD (LOCK #1)
    const chalkboardGroup = new THREE.Group();
    chalkboardGroup.position.set(-3.2, 0, -5.82);
    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.2, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 })
    );
    boardFrame.position.set(0, 2.5, 0);
    chalkboardGroup.add(boardFrame);

    const boardFaceMat = new THREE.MeshStandardMaterial({
      map: createChalkboardTexture(chalkboardEquation, Boolean(solvedMap.chalkboard)),
      roughness: 0.8,
    });
    const boardFace = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 1.9), boardFaceMat);
    boardFace.position.set(0, 2.5, 0.08);
    chalkboardGroup.add(boardFace);
    registerStationProp('chalkboard', chalkboardGroup);

    // 2. WALL CLOCK (CLUE)
    const clockGroup = new THREE.Group();
    clockGroup.position.set(0.0, 0, -5.82);
    const clockRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 0.12, 28),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.25 })
    );
    clockRim.rotation.x = Math.PI / 2;
    clockRim.position.set(0, 3.6, 0);
    clockGroup.add(clockRim);

    const clockFace = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 0.14, 28),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    clockFace.rotation.x = Math.PI / 2;
    clockFace.position.set(0, 3.6, 0.01);
    clockGroup.add(clockFace);

    const hourHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.34, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
    );
    hourHand.position.set(0, 3.72, 0.09);
    clockGroup.add(hourHand);
    registerStationProp('clock', clockGroup);

    // 3. TIE REFERENCE BOOKSHELF (CLUE)
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(-6.55, 0, -1.6);
    const shelfBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 3.4, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 })
    );
    shelfBody.position.set(0, 1.7, 0);
    shelfGroup.add(shelfBody);

    const bookColors = [0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6, 0x06b6d4];
    for (let i = 0; i < 6; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.48, 0.22),
        new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.4 })
      );
      book.position.set(0.12, i < 3 ? 2.2 : 1.3, -0.6 + (i % 3) * 0.55);
      shelfGroup.add(book);
    }
    registerStationProp('bookshelf', shelfGroup);

    // 4. TEACHER'S DESK (CLUE)
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-2.8, 0, 0.4);
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.14, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 })
    );
    deskTop.position.set(0, 1.05, 0);
    deskGroup.add(deskTop);

    const deskBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.0, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })
    );
    deskBase.position.set(0, 0.5, 0);
    deskGroup.add(deskBase);

    // Glowing UV Lens prop on desk
    const uvLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x9333ea,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      })
    );
    uvLens.position.set(0.35, 1.16, 0.1);
    deskGroup.add(uvLens);
    registerStationProp('desk', deskGroup);

    // 5. SCIENCE LAB BENCH (LOCK #2)
    const labGroup = new THREE.Group();
    labGroup.position.set(1.6, 0, -0.8);
    const benchCounter = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.1, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.25 })
    );
    benchCounter.position.set(0, 0.55, 0);
    labGroup.add(benchCounter);

    const benchTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.95, 0.1, 1.52),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.4 })
    );
    benchTop.position.set(0, 1.15, 0);
    labGroup.add(benchTop);

    // 3 Glowing Specimen Flasks on Lab Bench (react individually as each Specimen problem is verified!)
    const flaskColors = [0x38bdf8, 0xf59e0b, 0xa855f7];
    const specimenFlaskMeshes: THREE.Mesh[] = [];
    const specimenHaloRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const flaskMat = new THREE.MeshStandardMaterial({
        color: flaskColors[i],
        emissive: flaskColors[i],
        emissiveIntensity: 0.45,
        roughness: 0.15,
        metalness: 0.1,
      });
      const flask = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.54, 18), flaskMat);
      flask.position.set(-0.75 + i * 0.75, 1.46, 0);
      labGroup.add(flask);
      specimenFlaskMeshes.push(flask);

      const haloRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.03, 10, 24),
        new THREE.MeshBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.0,
        })
      );
      haloRing.rotation.x = Math.PI / 2;
      haloRing.position.set(-0.75 + i * 0.75, 1.85, 0);
      labGroup.add(haloRing);
      specimenHaloRings.push(haloRing);
    }
    registerStationProp('lab_bench', labGroup);

    // 6. LOCKED SUPPLY CABINET (LOCK #3) WITH HINGED SAFE DOOR & 3D GOLDEN MASTER KEY INSIDE
    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(6.45, 0, -2.2);
    const cabinetBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 3.2, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.35 })
    );
    cabinetBody.position.set(0, 1.6, 0);
    cabinetGroup.add(cabinetBody);

    // Hinged front safe door that swings open when Lock #3 is solved
    const cabinetDoorPivot = new THREE.Group();
    cabinetDoorPivot.position.set(-0.44, 1.6, -0.92);
    cabinetGroup.add(cabinetDoorPivot);

    const cabinetDoorPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.85, 1.84),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.28 })
    );
    cabinetDoorPanel.position.set(0, 0, 0.92);
    cabinetDoorPivot.add(cabinetDoorPanel);

    const cabinetLockPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.45, 0.35),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
      })
    );
    cabinetLockPad.position.set(-0.06, 0.1, 1.55);
    cabinetDoorPivot.add(cabinetLockPad);

    // 3D Golden Master Key spinning inside the safe (revealed when door swings open)
    const goldenKeyGroup = new THREE.Group();
    goldenKeyGroup.position.set(-0.55, 1.65, 0);
    const goldKeyMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      metalness: 0.85,
      roughness: 0.15,
    });
    const keyBow = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 12, 24), goldKeyMat);
    keyBow.position.set(0, 0.22, 0);
    goldenKeyGroup.add(keyBow);
    const keyShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 12), goldKeyMat);
    keyShaft.position.set(0, -0.05, 0);
    goldenKeyGroup.add(keyShaft);
    const keyBit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), goldKeyMat);
    keyBit.position.set(0.06, -0.18, 0);
    goldenKeyGroup.add(keyBit);
    cabinetGroup.add(goldenKeyGroup);

    registerStationProp('cabinet', cabinetGroup);

    // 7. LOGIC SYNTHESIS BOARD (LOCK #4) WITH LIVE CIRCUIT & CODE DISPLAY
    const logicGroup = new THREE.Group();
    logicGroup.position.set(3.2, 0, -5.82);
    const logicFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.85, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x312e81, metalness: 0.5, roughness: 0.3 })
    );
    logicFrame.position.set(0, 2.55, 0);
    logicGroup.add(logicFrame);

    const logicScreenMat = new THREE.MeshStandardMaterial({
      map: createLogicBoardTexture(masterCodePreviewRef.current, Boolean(solvedMapRef.current.logic_board)),
      roughness: 0.22,
      metalness: 0.1,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.32,
    });
    const logicScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.55), logicScreenMat);
    logicScreen.position.set(0, 2.55, 0.09);
    logicGroup.add(logicScreen);
    registerStationProp('logic_board', logicGroup);

    // 8. HEAVY SECURITY EXIT DOOR & KEYPAD (FINAL ESCAPE)
    const exitGroup = new THREE.Group();
    exitGroup.position.set(6.85, 0, 2.4);
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 3.7, 2.3),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
    );
    doorFrame.position.set(0, 1.85, 0);
    exitGroup.add(doorFrame);

    // Door pivot so it can swing open on escape!
    const doorHingePivot = new THREE.Group();
    doorHingePivot.position.set(-0.08, 0, -0.95);
    exitGroup.add(doorHingePivot);

    const doorPanelMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      metalness: 0.5,
      roughness: 0.35,
    });
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.45, 1.9), doorPanelMat);
    doorPanel.position.set(0, 1.725, 0.95);
    doorHingePivot.add(doorPanel);

    const keypadBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.52, 0.38),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
      })
    );
    keypadBox.position.set(-0.2, 1.6, -1.45);
    exitGroup.add(keypadBox);
    registerStationProp('exit_door', exitGroup);

    // ==================== FLOATING 3D SIGNS, PROXIMITY SONAR RINGS, 3D CRYSTALS & AURAS ====================
    const stationVisuals: Map<
      RoomStationId,
      {
        signSprite: THREE.Sprite;
        ringMesh: THREE.Mesh;
        ringMat: THREE.MeshBasicMaterial;
        sonarRingMesh: THREE.Mesh;
        sonarRingMat: THREE.MeshBasicMaterial;
        auraMesh: THREE.Mesh;
        auraMat: THREE.MeshBasicMaterial;
        crystalMesh: THREE.Mesh;
        crystalMat: THREE.MeshStandardMaterial;
        baseY: number;
        lastStateKey: string;
      }
    > = new Map();

    const sharedCrystalGeo = new THREE.OctahedronGeometry(0.2, 0);
    const sharedAuraGeo = new THREE.CylinderGeometry(0.72, 0.88, 2.2, 24, 1, true);

    ROOM_STATIONS_3D.forEach((st) => {
      const spriteMat = new THREE.SpriteMaterial({
        map: createSignCanvasTexture(st.shortTag, st.title, 'locked'),
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const baseY = st.id === 'clock' ? 4.55 : st.isMainLock ? 3.95 : 2.95;
      sprite.position.set(st.position[0], baseY, st.position[2]);
      sprite.scale.set(2.5, 1.08, 1);
      sprite.renderOrder = 20;
      sprite.userData.stationId = st.id;
      pickableMeshes.push(sprite);
      scene.add(sprite);

      // Primary glowing floor target ring at standPosition
      const ringGeo = new THREE.RingGeometry(0.52, 0.76, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(st.standPosition[0], 0.03, st.standPosition[2]);
      ringMesh.userData.stationId = st.id;
      pickableMeshes.push(ringMesh);
      scene.add(ringMesh);

      // Expanding 3D Sonar Ripple Ring (non-verbal proximity & start cue)
      const sonarGeo = new THREE.RingGeometry(0.65, 0.82, 32);
      const sonarRingMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const sonarRingMesh = new THREE.Mesh(sonarGeo, sonarRingMat);
      sonarRingMesh.rotation.x = -Math.PI / 2;
      sonarRingMesh.position.set(st.standPosition[0], 0.035, st.standPosition[2]);
      scene.add(sonarRingMesh);

      // Subtle 3D Vertical Proximity Aura Cylinder around the stand/interaction zone
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const auraMesh = new THREE.Mesh(sharedAuraGeo, auraMat);
      auraMesh.position.set(st.standPosition[0], 1.1, st.standPosition[2]);
      auraMesh.renderOrder = 10;
      scene.add(auraMesh);

      // Rotating 3D Diamond Beacon Crystal above the interactive prop
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
        metalness: 0.7,
        roughness: 0.15,
      });
      const crystalMesh = new THREE.Mesh(sharedCrystalGeo, crystalMat);
      crystalMesh.position.set(st.position[0], baseY - 0.68, st.position[2]);
      crystalMesh.userData.stationId = st.id;
      pickableMeshes.push(crystalMesh);
      scene.add(crystalMesh);

      stationVisuals.set(st.id, {
        signSprite: sprite,
        ringMesh,
        ringMat,
        sonarRingMesh,
        sonarRingMat,
        auraMesh,
        auraMat,
        crystalMesh,
        crystalMat,
        baseY,
        lastStateKey: '',
      });
    });

    // ==================== ANIMATED FLOOR GUIDE PATH DOTS (PLAYER -> NEXT SIGN) ====================
    const PATH_DOT_COUNT = 10;
    const pathDots: THREE.Mesh[] = [];
    const dotGeo = new THREE.CircleGeometry(0.16, 16);
    for (let i = 0; i < PATH_DOT_COUNT; i++) {
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.85,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(0, 0.04, 0);
      scene.add(dot);
      pathDots.push(dot);
    }

    // ==================== ANIMATED 3D STUDENT CHARACTER ====================
    // Spawn slightly in front of Lock #1 (Chalkboard) facing it so Lock #1 immediately pulses with non-verbal proximity cues!
    const playerGroup = new THREE.Group();
    playerGroup.position.set(-2.2, 0, -1.6);
    playerGroup.rotation.y = Math.PI;
    scene.add(playerGroup);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.55 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const packMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

    // Character Root Body (allows vertical bobbing during walk/jump)
    const bodyRig = new THREE.Group();
    playerGroup.add(bodyRig);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.32), shirtMat);
    torso.position.set(0, 1.12, 0);
    torso.castShadow = !isSoftwareGl;
    bodyRig.add(torso);

    // Backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.54, 0.22), packMat);
    backpack.position.set(0, 1.14, -0.24);
    backpack.castShadow = !isSoftwareGl;
    bodyRig.add(backpack);

    // Head Pivot
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.52, 0);
    bodyRig.add(headPivot);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), skinMat);
    headMesh.position.set(0, 0.22, 0);
    headMesh.castShadow = !isSoftwareGl;
    headPivot.add(headMesh);

    const hairCap = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.16, 0.47), hairMat);
    hairCap.position.set(0, 0.42, 0);
    headPivot.add(hairCap);

    // Eyes (facing +Z in local character space)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    [-0.1, 0.1].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.03), eyeMat);
      eye.position.set(ex, 0.24, 0.22);
      headPivot.add(eye);
      const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), pupilMat);
      pupil.position.set(ex, 0.24, 0.23);
      headPivot.add(pupil);
    });

    // Cool Safari Sunglasses & Happy Smile (activated when riding the Serengeti Safari Cruiser!)
    const sunglassesGroup = new THREE.Group();
    sunglassesGroup.visible = false;
    headPivot.add(sunglassesGroup);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.9 });
    const bridgeBar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.04), frameMat);
    bridgeBar.position.set(0, 0.27, 0.235);
    sunglassesGroup.add(bridgeBar);
    [-0.11, 0.11].forEach((lx) => {
      const lens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.11, 0.04), lensMat);
      lens.position.set(lx, 0.24, 0.235);
      sunglassesGroup.add(lens);
    });
    const smileMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.045, 0.03),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    smileMesh.position.set(0, 0.11, 0.225);
    sunglassesGroup.add(smileMesh);

    // ==================== 3D SERENGETI NATIONAL PARK & 4x4 SAFARI CRUISER OUTSIDE DOOR ====================
    const serengetiGroup = new THREE.Group();
    scene.add(serengetiGroup);

    // Golden Savanna Grassland Plane extending eastward outside the door (x = 7 to 110)
    const savannaGround = new THREE.Mesh(
      new THREE.PlaneGeometry(110, 80),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.88, metalness: 0.04 })
    );
    savannaGround.rotation.x = -Math.PI / 2;
    savannaGround.position.set(62, -0.01, 2.4);
    savannaGround.receiveShadow = !isSoftwareGl;
    serengetiGroup.add(savannaGround);

    // Red-Ochre Dusty Safari Road leading straight from the classroom Exit Door into the Serengeti
    const safariRoad = new THREE.Mesh(
      new THREE.PlaneGeometry(105, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.92, metalness: 0.02 })
    );
    safariRoad.rotation.x = -Math.PI / 2;
    safariRoad.position.set(59.5, 0.015, 2.4);
    safariRoad.receiveShadow = !isSoftwareGl;
    serengetiGroup.add(safariRoad);

    // Wooden "WELCOME TO SERENGETI NATIONAL PARK" Arch Gate at x = 16.5
    const gateGroup = new THREE.Group();
    gateGroup.position.set(16.5, 0, 2.4);
    const woodLogMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    [-2.3, 2.3].forEach((gz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.8, 12), woodLogMat);
      post.position.set(0, 2.4, gz);
      gateGroup.add(post);
    });
    const gateBeam = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.95, 5.4), woodLogMat);
    gateBeam.position.set(0, 4.6, 0);
    gateGroup.add(gateBeam);

    const gateCanvas = document.createElement('canvas');
    gateCanvas.width = 512;
    gateCanvas.height = 128;
    const gCtx = gateCanvas.getContext('2d')!;
    gCtx.fillStyle = '#451a03';
    gCtx.fillRect(0, 0, 512, 128);
    gCtx.strokeStyle = '#fbbf24';
    gCtx.lineWidth = 6;
    gCtx.strokeRect(6, 6, 500, 116);
    gCtx.fillStyle = '#fef08a';
    gCtx.font = '900 28px Inter, system-ui, sans-serif';
    gCtx.textAlign = 'center';
    gCtx.fillText('🦁 SERENGETI NATIONAL PARK', 256, 56);
    gCtx.fillStyle = '#34d399';
    gCtx.font = '700 20px Inter, system-ui, sans-serif';
    gCtx.fillText('TANZANIA • VIP STUDENT SAFARI', 256, 96);
    const gateTex = new THREE.CanvasTexture(gateCanvas);
    gateTex.colorSpace = THREE.SRGBColorSpace;
    const gateSignMat = new THREE.MeshBasicMaterial({ map: gateTex, side: THREE.DoubleSide });
    const gateSignFront = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.85), gateSignMat);
    gateSignFront.rotation.y = -Math.PI / 2;
    gateSignFront.position.set(-0.24, 4.6, 0);
    gateGroup.add(gateSignFront);
    serengetiGroup.add(gateGroup);

    // Golden Serengeti Sunset Sun on the Horizon
    const sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(6.5, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    sunOrb.position.set(98, 13, 2.4);
    serengetiGroup.add(sunOrb);

    // 8 Composite 3D Flat-Top Umbrella Acacia Trees along the Serengeti Safari Route
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c2d0c, roughness: 0.8 });
    const canopyMat1 = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.7 });
    const canopyMat2 = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.65 });
    const acaciaCoords: Array<[number, number, number]> = [
      [14, -3.5, 1.0],
      [21, 7.2, 1.15],
      [28, -4.8, 0.95],
      [35, 6.5, 1.2],
      [43, -4.2, 1.1],
      [51, 7.0, 1.05],
      [60, -5.0, 1.25],
      [68, 6.8, 1.0],
    ];
    acaciaCoords.forEach(([ax, az, sc]) => {
      const tree = new THREE.Group();
      tree.position.set(ax, 0, az);
      tree.scale.setScalar(sc);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 3.6, 10), trunkMat);
      trunk.position.set(0, 1.8, 0);
      trunk.rotation.z = 0.08;
      tree.add(trunk);
      const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.8, 8), trunkMat);
      branchL.position.set(-0.55, 3.8, 0.2);
      branchL.rotation.z = 0.65;
      tree.add(branchL);
      const branchR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.6, 8), trunkMat);
      branchR.position.set(0.55, 3.6, -0.2);
      branchR.rotation.z = -0.6;
      tree.add(branchR);
      const flatTop1 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 1.9, 0.42, 14), canopyMat1);
      flatTop1.position.set(-0.4, 4.45, 0.1);
      tree.add(flatTop1);
      const flatTop2 = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.5, 0.36, 14), canopyMat2);
      flatTop2.position.set(0.65, 4.15, -0.2);
      tree.add(flatTop2);
      serengetiGroup.add(tree);
    });

    // 4 Animated 3D Serengeti Giraffes along the trail (with swaying necks!)
    const giraffeNeckPivots: THREE.Group[] = [];
    const giraffeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
    const giraffeSpotMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const giraffeCoords: Array<[number, number, number]> = [
      [24, -2.6, 0.4],
      [38, 5.4, -0.5],
      [54, -2.8, 0.3],
      [64, 5.6, -0.4],
    ];
    giraffeCoords.forEach(([gx, gz, rotY]) => {
      const gGroup = new THREE.Group();
      gGroup.position.set(gx, 0, gz);
      gGroup.rotation.y = rotY;
      const gBody = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.75, 0.62), giraffeMat);
      gBody.position.set(0, 1.85, 0);
      gGroup.add(gBody);
      const gSpot = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 0.65), giraffeSpotMat);
      gSpot.position.set(0, 1.88, 0);
      gGroup.add(gSpot);
      [
        [-0.48, -0.2],
        [-0.48, 0.2],
        [0.48, -0.2],
        [0.48, 0.2],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 1.7, 8), giraffeMat);
        leg.position.set(lx, 0.85, lz);
        gGroup.add(leg);
      });
      const neckPivot = new THREE.Group();
      neckPivot.position.set(0.55, 2.1, 0);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 2.2, 10), giraffeMat);
      neck.position.set(0.35, 0.95, 0);
      neck.rotation.z = -0.32;
      neckPivot.add(neck);
      const gHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.26, 0.24), giraffeMat);
      gHead.position.set(0.78, 1.98, 0);
      neckPivot.add(gHead);
      gGroup.add(neckPivot);
      giraffeNeckPivots.push(neckPivot);
      serengetiGroup.add(gGroup);
    });

    // ==================== COMPOSITE 10-PART 3D 4x4 OPEN-ROOF SAFARI LAND CRUISER ====================
    const safariCarGroup = new THREE.Group();
    safariCarGroup.position.set(11.4, 0, 2.4);
    serengetiGroup.add(safariCarGroup);

    const safariBodyMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.32,
      metalness: 0.35,
    });
    const safariStripeMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
      metalness: 0.2,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.75,
    });
    const canopyFabricMat = new THREE.MeshStandardMaterial({
      color: 0xa16207,
      roughness: 0.75,
      metalness: 0.05,
    });

    const carChassis = new THREE.Group();
    safariCarGroup.add(carChassis);

    // 1. Lower 4x4 Body Hull & Side Doors
    const mainHull = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.82, 1.72), safariBodyMat);
    mainHull.position.set(0, 0.78, 0);
    mainHull.castShadow = !isSoftwareGl;
    carChassis.add(mainHull);

    // 2. Green Serengeti Safari Stripe along both sides
    const sideStripe = new THREE.Mesh(new THREE.BoxGeometry(3.54, 0.22, 1.76), safariStripeMat);
    sideStripe.position.set(0, 0.82, 0);
    carChassis.add(sideStripe);

    // 3. Front Engine Hood
    const frontHood = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.25, 1.62), safariBodyMat);
    frontHood.position.set(1.1, 1.24, 0);
    carChassis.add(frontHood);

    // 4. Rugged Steel Front Bull-Bar Bumper & Grille
    const bullBar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 1.78), darkMetalMat);
    bullBar.position.set(1.82, 0.72, 0);
    carChassis.add(bullBar);

    // 5. Glowing LED Safari Headlights
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.2,
    });
    [-0.58, 0.58].forEach((hz) => {
      const hLight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), headlightMat);
      hLight.rotation.z = Math.PI / 2;
      hLight.position.set(1.78, 0.92, hz);
      carChassis.add(hLight);
    });

    // 6. Windshield Frame & Glass
    const windshieldGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.72, 1.56),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.42,
        roughness: 0.1,
        metalness: 0.8,
        depthWrite: false,
      })
    );
    windshieldGlass.position.set(0.55, 1.56, 0);
    windshieldGlass.rotation.z = 0.22;
    carChassis.add(windshieldGlass);

    // 7. Open-Top Safari Viewing Roof Canopy on 4 Roll-Bar Pillars (with open roof hatch where the student stands!)
    [
      [-1.35, -0.74],
      [-1.35, 0.74],
      [0.35, -0.74],
      [0.35, 0.74],
    ].forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.15, 8), darkMetalMat);
      pillar.position.set(px, 1.72, pz);
      carChassis.add(pillar);
    });
    // Pop-up roof shade bars (leaving the center open so the student stands up enjoying the view!)
    const roofFrontRim = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 1.68), canopyFabricMat);
    roofFrontRim.position.set(0.32, 2.32, 0);
    carChassis.add(roofFrontRim);
    const roofBackRim = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 1.68), canopyFabricMat);
    roofBackRim.position.set(-1.28, 2.32, 0);
    carChassis.add(roofBackRim);

    // 8. Rear-Mounted Spare Off-Road Tire
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 });
    const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.26, 20), tireMat);
    spareTire.rotation.z = Math.PI / 2;
    spareTire.position.set(-1.86, 0.95, 0);
    carChassis.add(spareTire);

    // 9. 4 Spinning Off-Road All-Terrain Wheels
    const safariWheels: THREE.Group[] = [];
    [
      [1.08, -0.88],
      [1.08, 0.88],
      [-1.08, -0.88],
      [-1.08, 0.88],
    ].forEach(([wx, wz]) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, 0.44, wz);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.32, 20), tireMat);
      tire.rotation.x = Math.PI / 2;
      wGroup.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.34, 12), rimMat);
      rim.rotation.x = Math.PI / 2;
      wGroup.add(rim);
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.36), darkMetalMat);
      wGroup.add(spoke);
      safariCarGroup.add(wGroup);
      safariWheels.push(wGroup);
    });

    // 10. Savanna Dust Trail Puffs behind Rear Tires
    const dustPuffs: THREE.Mesh[] = [];
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      transparent: true,
      opacity: 0.0,
    });
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), dustMat.clone());
      puff.position.set(-2.2 - i * 0.45, 0.25, (i % 2 === 0 ? -1 : 1) * 0.65);
      safariCarGroup.add(puff);
      dustPuffs.push(puff);
    }

    // Left & Right Arms
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.38, 1.42, 0);
    bodyRig.add(leftArmPivot);
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), shirtMat);
    leftArm.position.set(0, -0.26, 0);
    leftArm.castShadow = !isSoftwareGl;
    leftArmPivot.add(leftArm);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.38, 1.42, 0);
    bodyRig.add(rightArmPivot);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), shirtMat);
    rightArm.position.set(0, -0.26, 0);
    rightArm.castShadow = !isSoftwareGl;
    rightArmPivot.add(rightArm);

    // Left & Right Legs
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.15, 0.76, 0);
    bodyRig.add(leftLegPivot);
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.66, 0.22), pantsMat);
    leftLeg.position.set(0, -0.33, 0);
    leftLeg.castShadow = !isSoftwareGl;
    leftLegPivot.add(leftLeg);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.3), shoeMat);
    leftShoe.position.set(0, -0.68, 0.04);
    leftLegPivot.add(leftShoe);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.15, 0.76, 0);
    bodyRig.add(rightLegPivot);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.66, 0.22), pantsMat);
    rightLeg.position.set(0, -0.33, 0);
    rightLeg.castShadow = !isSoftwareGl;
    rightLegPivot.add(rightLeg);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.3), shoeMat);
    rightShoe.position.set(0, -0.68, 0.04);
    rightLegPivot.add(rightShoe);

    // Player shadow/glow ring on floor
    const playerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.36, 0.5, 24),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      })
    );
    playerRing.rotation.x = -Math.PI / 2;
    playerRing.position.y = 0.02;
    playerGroup.add(playerRing);

    // ==================== KEYBOARD & POINTER INTERACTION ====================
    const keysPressed = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      keysPressed.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.code);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let hoveredStationId: RoomStationId | null = null;
    let lastHoverCheckTime = 0;

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheckTime < 60) return;
      lastHoverCheckTime = now;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableMeshes, true);
      const stHit = hits.find((h) => h.object.userData?.stationId);
      hoveredStationId = stHit ? (stHit.object.userData.stationId as RoomStationId) : null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 8) return; // Ignore camera orbit drags

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableMeshes, true);
      if (hits.length === 0) return;

      // Check if a station or sign was clicked first
      const stationHit = hits.find((h) => h.object.userData?.stationId);
      if (stationHit) {
        const stId = stationHit.object.userData.stationId as RoomStationId;
        const stConfig = ROOM_STATIONS_3D.find((s) => s.id === stId);
        if (stConfig) {
          pendingTargetRef.current = {
            x: stConfig.standPosition[0],
            z: stConfig.standPosition[2],
            faceAngle: stConfig.faceAngle,
            stationId: stConfig.id,
          };
          return;
        }
      }

      // Otherwise walk to clicked floor point
      const floorHit = hits.find((h) => h.object === floorMesh);
      if (floorHit) {
        const tx = THREE.MathUtils.clamp(floorHit.point.x, -5.8, 5.8);
        const tz = THREE.MathUtils.clamp(floorHit.point.z, -4.8, 4.8);
        pendingTargetRef.current = { x: tx, z: tz };
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Pre-allocated math helpers for zero GC inside tick()
    const _desiredCamPos = new THREE.Vector3();
    const _lookTarget = new THREE.Vector3();
    const _overviewPos = new THREE.Vector3(0, 11.2, 8.6);
    const _overviewTarget = new THREE.Vector3(0, 0.8, -0.8);
    const _pulseColor = new THREE.Color();
    const _baseColor = new THREE.Color();
    const _sunsetSkyColor = new THREE.Color(0x7c2d12);

    // ==================== MAIN ANIMATION LOOP ====================
    const clock = new THREE.Clock();
    let walkCycle = 0;
    let escapeStartTime = -1;
    let currentNearestId: RoomStationId | null = null;
    let rafId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl2 = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl2.fenceSync === 'function') {
        const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl2.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl2.getSyncParameter(sync, gl2.SYNC_STATUS);
          if (state === gl2.UNSIGNALED) {
            rafId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl2.deleteSync(sync);
            rafId = window.setTimeout(cb, 80);
          }
        };
        rafId = window.setTimeout(poll, 5);
      } else {
        rafId = window.setTimeout(cb, 80);
      }
    };

    const updateStationSignsAndProximityHighlights = (elapsed: number) => {
      const recId = recommendedRef.current;
      const solved = solvedMapRef.current;
      const px = playerGroup.position.x;
      const pz = playerGroup.position.z;

      let strongestProximityFactor = 0;
      let strongestProximityStation: Station3DConfig | null = null;

      ROOM_STATIONS_3D.forEach((st) => {
        const vis = stationVisuals.get(st.id);
        if (!vis) return;

        // Real-time 3D distance from character to this interactive object's stand spot
        const distToPlayer = Math.hypot(px - st.standPosition[0], pz - st.standPosition[2]);
        // Smooth proximity factor in [0, 1] when character is within 3.8m
        const proximityFactor = THREE.MathUtils.clamp(1 - distToPlayer / 3.8, 0, 1);
        const isHovered = hoveredStationId === st.id;
        const isHighlighted = st.id === recId && !solved[st.id];

        if (proximityFactor > strongestProximityFactor) {
          strongestProximityFactor = proximityFactor;
          strongestProximityStation = st;
        }

        let state: 'start' | 'next' | 'solved' | 'exit_ready' | 'locked' | 'clue' = 'locked';
        let badge = st.shortTag;

        if (solved[st.id]) {
          state = 'solved';
          badge = `✓ ${st.shortTag} DONE`;
        } else if (st.id === recId) {
          if (st.id === 'chalkboard') {
            state = 'start';
            badge = '★ START HERE · #1';
          } else if (st.id === 'exit_door') {
            state = 'exit_ready';
            badge = '★ UNLOCK EXIT NOW!';
          } else {
            state = 'next';
            badge = `★ NEXT · ${st.shortTag}`;
          }
        } else if (!st.isMainLock) {
          state = 'clue';
          badge = '💡 CLUE';
        }

        const stateKey = `${state}:${badge}:${
          st.id === 'chalkboard' ? solvedPinPreviewRef.current : ''
        }:${st.id === 'logic_board' ? masterCodePreviewRef.current : ''}`;
        if (vis.lastStateKey !== stateKey) {
          vis.lastStateKey = stateKey;
          const oldMap = vis.signSprite.material.map;
          vis.signSprite.material.map = createSignCanvasTexture(badge, st.title, state);
          vis.signSprite.material.needsUpdate = true;
          oldMap?.dispose();

          if (st.id === 'chalkboard') {
            const oldBoard = boardFaceMat.map;
            boardFaceMat.map = createChalkboardTexture(
              chalkboardEquation,
              Boolean(solved.chalkboard),
              solvedPinPreviewRef.current
            );
            boardFaceMat.needsUpdate = true;
            oldBoard?.dispose();
          }

          if (st.id === 'logic_board') {
            const oldLogic = logicScreenMat.map;
            logicScreenMat.map = createLogicBoardTexture(
              masterCodePreviewRef.current,
              Boolean(solved.logic_board)
            );
            logicScreenMat.needsUpdate = true;
            oldLogic?.dispose();
          }
        }

        // 1. NON-VERBAL 3D OBJECT MATERIAL EMISSIVE & SCALE PULSE WHEN CHARACTER IS NEARBY OR AT START
        const propGroup = interactiveRoots.get(st.id);
        const matRecords = stationMatRecords.get(st.id);
        const activeCueStrength = Math.max(
          proximityFactor,
          isHighlighted ? 0.65 : 0,
          isHovered ? 0.5 : 0
        );
        const pulseSpeed = 4.2 + proximityFactor * 5.0;
        const wave01 = 0.5 + 0.5 * Math.sin(elapsed * pulseSpeed);

        if (propGroup) {
          const scaleBoost =
            !solved[st.id] && activeCueStrength > 0.05
              ? 1 + activeCueStrength * wave01 * 0.038
              : 1;
          propGroup.scale.setScalar(scaleBoost);
        }

        if (matRecords) {
          const highlightHex = solved[st.id]
            ? 0x10b981
            : isHighlighted
            ? st.id === 'chalkboard'
              ? 0x34d399
              : 0xfbbf24
            : st.isMainLock
            ? 0x38bdf8
            : 0xa855f7;

          _pulseColor.setHex(highlightHex);

          for (let mIdx = 0; mIdx < matRecords.length; mIdx++) {
            const rec = matRecords[mIdx];
            _baseColor.setHex(rec.baseEmissiveHex);
            if (activeCueStrength > 0.04 && !solved[st.id]) {
              const blend = activeCueStrength * (0.28 + 0.45 * wave01);
              rec.mat.emissive.copy(_baseColor).lerp(_pulseColor, blend);
              rec.mat.emissiveIntensity =
                rec.baseEmissiveIntensity + activeCueStrength * (0.35 + 0.55 * wave01);
            } else {
              rec.mat.emissive.copy(_baseColor);
              rec.mat.emissiveIntensity = rec.baseEmissiveIntensity;
            }
          }
        }

        // 2. 3D ROTATING CRYSTAL BEACON & VERTICAL PROXIMITY AURA
        vis.crystalMesh.rotation.y = elapsed * (1.8 + proximityFactor * 3.2);
        vis.crystalMesh.position.y =
          vis.baseY - 0.68 + Math.sin(elapsed * pulseSpeed) * (0.08 + activeCueStrength * 0.1);
        const crystalScale =
          0.75 + activeCueStrength * 0.45 + Math.sin(elapsed * pulseSpeed) * 0.1;
        vis.crystalMesh.scale.setScalar(crystalScale);

        if (solved[st.id]) {
          vis.crystalMat.color.setHex(0x10b981);
          vis.crystalMat.emissive.setHex(0x059669);
          vis.crystalMat.emissiveIntensity = 0.5;
          vis.auraMat.opacity = 0;
          vis.sonarRingMat.opacity = 0;
        } else {
          const cueHex = isHighlighted
            ? st.id === 'chalkboard'
              ? 0x34d399
              : 0xfbbf24
            : st.isMainLock
            ? 0x38bdf8
            : 0x818cf8;
          vis.crystalMat.color.setHex(cueHex);
          vis.crystalMat.emissive.setHex(cueHex);
          vis.crystalMat.emissiveIntensity = 0.7 + activeCueStrength * wave01 * 1.1;

          // Subtle 3D Vertical Aura Cylinder pulses when character is nearby or on the START station
          vis.auraMat.color.setHex(cueHex);
          vis.auraMat.opacity =
            activeCueStrength > 0.15
              ? activeCueStrength * (0.06 + 0.12 * wave01)
              : 0;
          vis.auraMesh.scale.set(
            1 + wave01 * 0.08,
            0.7 + activeCueStrength * 0.4,
            1 + wave01 * 0.08
          );

          // Expanding 3D Sonar Ripple Ring on Floor
          const sonarPhase = (elapsed * (0.85 + proximityFactor * 0.9)) % 1;
          vis.sonarRingMat.color.setHex(cueHex);
          vis.sonarRingMat.opacity =
            activeCueStrength > 0.1
              ? (1 - sonarPhase) * activeCueStrength * 0.72
              : 0;
          const sonarScale = 1 + sonarPhase * (0.75 + activeCueStrength * 0.65);
          vis.sonarRingMesh.scale.setScalar(sonarScale);
        }

        // 3. Sign & Base Floor Ring Animation
        const bobOffset = isHighlighted
          ? Math.sin(elapsed * 4.5) * 0.22
          : Math.sin(elapsed * 2 + st.position[0]) * 0.06;
        vis.signSprite.position.y = vis.baseY + bobOffset;

        const curAspect = camera.aspect || 1;
        const mobileSignScale = curAspect < 0.65 ? 0.65 : curAspect < 1 ? 0.8 : 1.0;
        const scalePulse =
          (isHighlighted || proximityFactor > 0.35
            ? 1 + Math.sin(elapsed * pulseSpeed) * 0.11
            : 0.85) * mobileSignScale;
        vis.signSprite.scale.set(2.55 * scalePulse, 1.1 * scalePulse, 1);

        if (solved[st.id]) {
          vis.ringMat.color.setHex(0x10b981);
          vis.ringMat.opacity = 0.55;
          vis.ringMesh.scale.setScalar(1);
        } else if (isHighlighted || proximityFactor > 0.25) {
          vis.ringMat.color.setHex(
            st.id === 'exit_door'
              ? 0x22c55e
              : st.id === 'chalkboard' && isHighlighted
              ? 0x34d399
              : 0xfbbf24
          );
          vis.ringMat.opacity = 0.65 + Math.sin(elapsed * pulseSpeed) * 0.3;
          vis.ringMesh.scale.setScalar(1.06 + Math.sin(elapsed * pulseSpeed) * 0.14);
        } else {
          vis.ringMat.color.setHex(st.isMainLock ? 0x38bdf8 : 0x818cf8);
          vis.ringMat.opacity = 0.3;
          vis.ringMesh.scale.setScalar(0.92);
        }
      });

      // Update dynamic proximity PointLight to illuminate the nearby interactive object
      if (strongestProximityStation && strongestProximityFactor > 0.1) {
        const stObj = strongestProximityStation as Station3DConfig;
        proximityPointLight.position.x = THREE.MathUtils.lerp(
          proximityPointLight.position.x,
          stObj.position[0],
          0.18
        );
        proximityPointLight.position.z = THREE.MathUtils.lerp(
          proximityPointLight.position.z,
          stObj.position[2],
          0.18
        );
        proximityPointLight.intensity =
          strongestProximityFactor * (1.8 + Math.sin(elapsed * 7) * 0.7);
      } else {
        proximityPointLight.intensity = THREE.MathUtils.lerp(
          proximityPointLight.intensity,
          0,
          0.15
        );
      }

      // Move spotlight to recommended station
      const recStation = ROOM_STATIONS_3D.find((s) => s.id === recId);
      if (recStation) {
        beaconPointLight.position.x = THREE.MathUtils.lerp(
          beaconPointLight.position.x,
          recStation.position[0],
          0.1
        );
        beaconPointLight.position.z = THREE.MathUtils.lerp(
          beaconPointLight.position.z,
          recStation.position[2],
          0.1
        );
        beaconPointLight.intensity = 2.4 + Math.sin(elapsed * 5) * 0.8;

        // Animate glowing floor path dots from player to recommended station
        const startX = playerGroup.position.x;
        const startZ = playerGroup.position.z;
        const endX = recStation.standPosition[0];
        const endZ = recStation.standPosition[2];
        const totalDist = Math.hypot(endX - startX, endZ - startZ);

        pathDots.forEach((dot, i) => {
          if (totalDist < 1.1 || isEscapedRef.current) {
            dot.visible = false;
            return;
          }
          dot.visible = true;
          const flowT = ((i / PATH_DOT_COUNT) + elapsed * 0.45) % 1;
          dot.position.x = THREE.MathUtils.lerp(startX, endX, flowT);
          dot.position.z = THREE.MathUtils.lerp(startZ, endZ, flowT);
          const mat = dot.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.sin(flowT * Math.PI) * 0.9;
        });
      }
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      updateStationSignsAndProximityHighlights(elapsed);

      // Check WASD / Arrow / Touch D-Pad input
      let moveX = externalMoveRef.current.x;
      let moveZ = externalMoveRef.current.z;

      if (!isModalOpenRef.current) {
        if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) moveZ -= 1;
        if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) moveZ += 1;
        if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) moveX -= 1;
        if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) moveX += 1;
      }

      const hasManualInput = Math.hypot(moveX, moveZ) > 0.05;
      if (hasManualInput) {
        pendingTargetRef.current = null;
      }

      let isMoving = false;
      const walkSpeed = 4.4;

      if (hasManualInput) {
        const len = Math.hypot(moveX, moveZ);
        const nx = moveX / len;
        const nz = moveZ / len;

        playerGroup.position.x = THREE.MathUtils.clamp(
          playerGroup.position.x + nx * walkSpeed * dt,
          -5.8,
          5.8
        );
        playerGroup.position.z = THREE.MathUtils.clamp(
          playerGroup.position.z + nz * walkSpeed * dt,
          -4.8,
          4.8
        );

        const targetAngle = Math.atan2(nx, nz);
        const angleDiff =
          ((targetAngle - playerGroup.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        playerGroup.rotation.y += angleDiff * Math.min(1, dt * 12);
        isMoving = true;
      } else if (pendingTargetRef.current) {
        const target = pendingTargetRef.current;
        const dx = target.x - playerGroup.position.x;
        const dz = target.z - playerGroup.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.12) {
          const step = Math.min(dist, walkSpeed * dt);
          playerGroup.position.x += (dx / dist) * step;
          playerGroup.position.z += (dz / dist) * step;

          const targetAngle = Math.atan2(dx, dz);
          const angleDiff =
            ((targetAngle - playerGroup.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          playerGroup.rotation.y += angleDiff * Math.min(1, dt * 12);
          isMoving = true;
        } else {
          playerGroup.position.x = target.x;
          playerGroup.position.z = target.z;
          if (target.faceAngle !== undefined) {
            playerGroup.rotation.y = target.faceAngle;
          }
          const arrivedStation = target.stationId;
          pendingTargetRef.current = null;
          if (arrivedStation) {
            onArriveRef.current(arrivedStation);
          }
        }
      }

      // Animate physical 3D station reactions (Lab flasks, Supply Cabinet Safe door + Golden Key)
      const verifiedSpecimens = verifiedSpecimensRef.current;
      for (let i = 0; i < specimenFlaskMeshes.length; i++) {
        const flaskMesh = specimenFlaskMeshes[i];
        const haloRing = specimenHaloRings[i];
        const flaskMat = flaskMesh.material as THREE.MeshStandardMaterial;
        const haloMat = haloRing.material as THREE.MeshBasicMaterial;
        const isVerified = Boolean(solvedMapRef.current.lab_bench) || i < verifiedSpecimens;
        if (isVerified) {
          flaskMat.color.setHex(0x10b981);
          flaskMat.emissive.setHex(0x059669);
          flaskMat.emissiveIntensity = 0.9 + Math.sin(elapsed * 5 + i) * 0.25;
          flaskMesh.position.y = 1.46 + Math.sin(elapsed * 4 + i) * 0.04;
          haloMat.opacity = 0.75 + Math.sin(elapsed * 6 + i) * 0.2;
          haloRing.position.y = 1.82 + Math.sin(elapsed * 4 + i) * 0.08;
          haloRing.scale.setScalar(1 + Math.sin(elapsed * 5 + i) * 0.12);
        } else {
          flaskMesh.position.y = 1.46;
          haloMat.opacity = 0;
        }
      }

      const targetCabinetAngle = solvedMapRef.current.cabinet ? -Math.PI * 0.58 : 0;
      cabinetDoorPivot.rotation.y = THREE.MathUtils.damp(
        cabinetDoorPivot.rotation.y,
        targetCabinetAngle,
        4.5,
        dt
      );
      goldenKeyGroup.visible = Boolean(solvedMapRef.current.cabinet);
      if (solvedMapRef.current.cabinet) {
        goldenKeyGroup.rotation.y = elapsed * 2.6;
        goldenKeyGroup.position.y = 1.65 + Math.sin(elapsed * 3.5) * 0.08;
      }

      // Animate Serengeti Giraffes gently swaying their long necks
      giraffeNeckPivots.forEach((np, gIdx) => {
        np.rotation.z = Math.sin(elapsed * 1.6 + gIdx * 1.4) * 0.08;
      });

      // Character Limb & Body Animation + 3-Stage Serengeti Safari Getaway Sequence!
      if (isEscapedRef.current) {
        if (escapeStartTime < 0) {
          escapeStartTime = elapsed;
        }
        const escT = elapsed - escapeStartTime;

        // Warm up sky & key light into a golden Serengeti sunset!
        scene.background = _sunsetSkyColor;
        if (scene.fog && (scene.fog as THREE.FogExp2).color) {
          (scene.fog as THREE.FogExp2).color.copy(_sunsetSkyColor);
          (scene.fog as THREE.FogExp2).density = 0.012;
        }
        keyLight.color.setHex(0xfde68a);
        keyLight.intensity = 2.4;

        // 1. Swing Exit Door wide open outward toward the courtyard
        doorHingePivot.rotation.y = THREE.MathUtils.lerp(
          doorHingePivot.rotation.y,
          Math.PI * 0.68,
          dt * 5
        );
        doorPanelMat.color.setHex(0x059669);
        playerRing.visible = false;

        if (escT < 1.6) {
          // STAGE 1 (0.0s -> 1.6s): Student sprints out through the open classroom door toward the waiting Safari Cruiser!
          const runProgress = THREE.MathUtils.clamp(escT / 1.6, 0, 1);
          playerGroup.position.x = THREE.MathUtils.lerp(4.8, 10.2, runProgress);
          playerGroup.position.z = THREE.MathUtils.lerp(playerGroup.position.z, 2.4, dt * 8);
          playerGroup.position.y = 0;
          playerGroup.rotation.y = Math.PI / 2; // Facing +X toward the Safari Cruiser

          const runSwing = Math.sin(elapsed * 18) * 0.85;
          leftLegPivot.rotation.x = runSwing;
          rightLegPivot.rotation.x = -runSwing;
          leftArmPivot.rotation.x = -runSwing * 0.9;
          rightArmPivot.rotation.x = runSwing * 0.9;
          bodyRig.position.y = Math.abs(Math.cos(elapsed * 18)) * 0.14;
        } else if (escT < 2.4) {
          // STAGE 2 (1.6s -> 2.4s): Joyful high jump into the open-roof 4x4 Safari Land Cruiser!
          const jumpP = THREE.MathUtils.clamp((escT - 1.6) / 0.8, 0, 1);
          playerGroup.position.x = THREE.MathUtils.lerp(10.2, safariCarGroup.position.x - 0.35, jumpP);
          playerGroup.position.z = 2.4;
          playerGroup.position.y =
            THREE.MathUtils.lerp(0, 0.76, jumpP) + Math.sin(jumpP * Math.PI) * 1.15;
          playerGroup.rotation.y = Math.PI / 2;
          sunglassesGroup.visible = true;

          leftArmPivot.rotation.x = Math.PI * 0.95;
          rightArmPivot.rotation.x = Math.PI * 0.95;
          leftLegPivot.rotation.x = -0.35;
          rightLegPivot.rotation.x = 0.35;
        } else {
          // STAGE 3 (2.4s+): Riding the 4x4 Safari Land Cruiser through the Serengeti enjoying the wildlife!
          const driveT = escT - 2.4;
          const driveSpeed = 6.2;
          // Loop smoothly along the scenic Serengeti corridor (x = 11.4 -> 72)
          const carX = 11.4 + ((driveT * driveSpeed) % 60);
          safariCarGroup.position.x = carX;
          safariCarGroup.position.z = 2.4 + Math.sin(driveT * 1.3) * 0.28;

          // Realistic off-road 4x4 suspension bounce & wheel spin
          carChassis.position.y = Math.sin(elapsed * 15) * 0.035;
          carChassis.rotation.z = Math.sin(elapsed * 8) * 0.015;
          safariWheels.forEach((w) => {
            w.rotation.z -= driveSpeed * dt * 1.9;
          });

          // Animate golden savanna dust trail behind rear tires
          dustPuffs.forEach((puff, idx) => {
            const pMat = puff.material as THREE.MeshBasicMaterial;
            const cycle = (elapsed * 3.2 + idx * 0.35) % 1;
            puff.position.x = -2.0 - cycle * 2.6;
            puff.position.y = 0.22 + cycle * 0.65;
            puff.scale.setScalar(0.6 + cycle * 1.35);
            pMat.opacity = (1 - cycle) * 0.45;
          });

          // Student stands happily through the open safari roof wearing sunglasses, waving & admiring the giraffes!
          sunglassesGroup.visible = true;
          playerGroup.position.x = safariCarGroup.position.x - 0.35;
          playerGroup.position.z = safariCarGroup.position.z;
          playerGroup.position.y = 0.76 + carChassis.position.y;
          // Angle student slightly toward the camera/scenery so the player sees their sunglasses & waving!
          playerGroup.rotation.y = Math.PI * 0.38 + Math.sin(elapsed * 1.5) * 0.25;

          bodyRig.position.y = Math.abs(Math.sin(elapsed * 7)) * 0.12;
          // Right arm raised high waving in celebration; left arm steady or pumping with joy
          rightArmPivot.rotation.x = Math.PI * 0.92 + Math.sin(elapsed * 9) * 0.38;
          leftArmPivot.rotation.x = Math.PI * 0.78 - Math.sin(elapsed * 9) * 0.25;
          leftLegPivot.rotation.x = 0;
          rightLegPivot.rotation.x = 0;
          // Head turns left and right admiring the Serengeti giraffes and acacia trees!
          headPivot.rotation.y = Math.sin(elapsed * 2.4) * 0.52;
        }
      } else if (isMoving) {
        escapeStartTime = -1;
        sunglassesGroup.visible = false;
        playerRing.visible = true;
        walkCycle += dt * 11;
        const swing = Math.sin(walkCycle) * 0.65;
        leftLegPivot.rotation.x = swing;
        rightLegPivot.rotation.x = -swing;
        leftArmPivot.rotation.x = -swing * 0.8;
        rightArmPivot.rotation.x = swing * 0.8;
        bodyRig.position.y = Math.abs(Math.cos(walkCycle)) * 0.09;
        headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, 0, dt * 8);
      } else {
        escapeStartTime = -1;
        sunglassesGroup.visible = false;
        playerRing.visible = true;
        // Expressive "wants to escape" idle animation: breathing + looking toward highlighted station
        leftLegPivot.rotation.x = THREE.MathUtils.lerp(leftLegPivot.rotation.x, 0, dt * 8);
        rightLegPivot.rotation.x = THREE.MathUtils.lerp(rightLegPivot.rotation.x, 0, dt * 8);
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(
          leftArmPivot.rotation.x,
          Math.sin(elapsed * 2.2) * 0.08,
          dt * 6
        );
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(
          rightArmPivot.rotation.x,
          -Math.sin(elapsed * 2.2) * 0.08,
          dt * 6
        );
        bodyRig.position.y = Math.sin(elapsed * 3) * 0.025;
        headPivot.rotation.y = Math.sin(elapsed * 1.8) * 0.28;
      }

      // Detect nearest station for proximity prompt
      let closestId: RoomStationId | null = null;
      let closestDist = 1.95;
      for (const st of ROOM_STATIONS_3D) {
        const d = Math.hypot(
          playerGroup.position.x - st.standPosition[0],
          playerGroup.position.z - st.standPosition[2]
        );
        if (d < closestDist) {
          closestDist = d;
          closestId = st.id;
        }
      }
      if (closestId !== currentNearestId) {
        currentNearestId = closestId;
        onNearChangeRef.current(closestId);
      }

      // Smart Auto-Cutaway Classroom Walls: when the user rotates the 3D camera behind any wall, fade that wall so they can see the other side clearly!
      const targetBackOpacity = camera.position.z < -4.2 ? 0.14 : 1.0;
      backWallMat.opacity = THREE.MathUtils.lerp(backWallMat.opacity, targetBackOpacity, dt * 10);
      backWallMat.depthWrite = backWallMat.opacity > 0.85;

      const targetLeftOpacity = camera.position.x < -5.2 ? 0.14 : 1.0;
      leftWallMat.opacity = THREE.MathUtils.lerp(leftWallMat.opacity, targetLeftOpacity, dt * 10);
      leftWallMat.depthWrite = leftWallMat.opacity > 0.85;

      const targetRightOpacity = !isEscapedRef.current && camera.position.x > 5.2 ? 0.14 : 1.0;
      rightWallMat.opacity = THREE.MathUtils.lerp(rightWallMat.opacity, targetRightOpacity, dt * 10);
      rightWallMat.depthWrite = rightWallMat.opacity > 0.85;

      // Apply on-screen Rotate Left / Rotate Right button steps smoothly around current target
      if (Math.abs(pendingRotateDeltaRef.current) > 0.001) {
        const step = pendingRotateDeltaRef.current * Math.min(1, dt * 10);
        pendingRotateDeltaRef.current -= step;
        const offsetX = camera.position.x - controls.target.x;
        const offsetZ = camera.position.z - controls.target.z;
        const cosA = Math.cos(step);
        const sinA = Math.sin(step);
        camera.position.x = controls.target.x + offsetX * cosA - offsetZ * sinA;
        camera.position.z = controls.target.z + offsetX * sinA + offsetZ * cosA;
      }

      // Flexible 360° Camera Choreography:
      // Preserves user's drag/orbit rotation angle in ALL modes so they can always spin 360° to see any side!
      const mode = cameraModeRef.current;
      const aspect = camera.aspect || 1;
      const portraitZoomOut =
        aspect < 1
          ? THREE.MathUtils.clamp(1 / Math.max(0.45, aspect * 0.88), 1.18, 2.05)
          : 1.0;

      if (isEscapedRef.current) {
        const escT = Math.max(0, elapsed - escapeStartTime);
        if (escT < 2.4) {
          // Initial breakout transition: follow student sprinting out the open door into the 4x4 Safari Cruiser
          _desiredCamPos.set(
            playerGroup.position.x + 4.4 * portraitZoomOut,
            3.2 * (1 + (portraitZoomOut - 1) * 0.3),
            playerGroup.position.z + 4.4 * portraitZoomOut
          );
          _lookTarget.set(playerGroup.position.x, 1.6, 2.4);
          camera.position.lerp(_desiredCamPos, dt * 4.5);
          controls.target.lerp(_lookTarget, dt * 6);
        } else {
          // Riding the Safari Cruiser: carry the camera smoothly along with the moving 4x4 while letting the user rotate 360° around the car!
          _lookTarget.set(safariCarGroup.position.x - 0.1, 1.75, safariCarGroup.position.z);
          if (modePresetTransitionRef.current > 0) {
            modePresetTransitionRef.current = Math.max(0, modePresetTransitionRef.current - dt);
            if (mode === 'overview') {
              _desiredCamPos.set(
                safariCarGroup.position.x - 7.5,
                6.8 * portraitZoomOut,
                safariCarGroup.position.z + 8.5 * portraitZoomOut
              );
            } else {
              _desiredCamPos.set(
                safariCarGroup.position.x + 4.6 * portraitZoomOut,
                2.75 * (1 + (portraitZoomOut - 1) * 0.25),
                safariCarGroup.position.z + 4.2 * portraitZoomOut
              );
            }
            camera.position.lerp(_desiredCamPos, dt * 6);
          }
          const prevTx = controls.target.x;
          const prevTy = controls.target.y;
          const prevTz = controls.target.z;
          controls.target.lerp(_lookTarget, Math.min(1, dt * 10));
          camera.position.x += controls.target.x - prevTx;
          camera.position.y += controls.target.y - prevTy;
          camera.position.z += controls.target.z - prevTz;
        }
        controls.update();
      } else if (mode === 'chase') {
        _lookTarget.set(playerGroup.position.x * 0.85, 1.35, playerGroup.position.z * 0.85);
        if (modePresetTransitionRef.current > 0) {
          modePresetTransitionRef.current = Math.max(0, modePresetTransitionRef.current - dt);
          _desiredCamPos.set(
            THREE.MathUtils.clamp(playerGroup.position.x * 0.65, -4.5, 4.5),
            5.2 * (1 + (portraitZoomOut - 1) * 0.72),
            Math.min(7.8 * portraitZoomOut, playerGroup.position.z + 5.2 * portraitZoomOut)
          );
          camera.position.lerp(_desiredCamPos, dt * 6);
        }
        const prevTx = controls.target.x;
        const prevTy = controls.target.y;
        const prevTz = controls.target.z;
        controls.target.lerp(_lookTarget, Math.min(1, dt * 8));
        camera.position.x += controls.target.x - prevTx;
        camera.position.y += controls.target.y - prevTy;
        camera.position.z += controls.target.z - prevTz;
        controls.update();
      } else if (mode === 'overview') {
        if (modePresetTransitionRef.current > 0) {
          modePresetTransitionRef.current = Math.max(0, modePresetTransitionRef.current - dt);
          _desiredCamPos.set(
            _overviewPos.x,
            _overviewPos.y * (1 + (portraitZoomOut - 1) * 0.65),
            _overviewPos.z * portraitZoomOut
          );
          camera.position.lerp(_desiredCamPos, dt * 6);
          controls.target.lerp(_overviewTarget, dt * 6);
        }
        controls.update();
      } else {
        controls.update();
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      const nextAspect = w / h;
      camera.aspect = nextAspect;
      camera.fov =
        nextAspect < 1
          ? Math.min(68, Math.round(52 / Math.max(0.56, Math.sqrt(nextAspect))))
          : 52;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObserver) resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [roomThemeId, chalkboardEquation]);

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-300 p-6 text-center">
        <div>
          <div className="text-base font-black text-sky-400">3D Room Ready</div>
          <div className="text-xs text-slate-400 mt-1">
            Use the numbered lock buttons below to inspect each station.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-pointer select-none overflow-hidden"
      title="Click any glowing 3D sign or floor spot to walk there"
    />
  );
};
