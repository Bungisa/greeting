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
  cameraMode: CameraViewMode;
  isModalOpen: boolean;
  isEscaped: boolean;
  externalMoveDir: { x: number; z: number };
  walkToStationTrigger: { id: RoomStationId; seq: number } | null;
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

function createChalkboardTexture(equationText: string, solved: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#053326';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#065f46';
  ctx.lineWidth = 3;
  for (let i = 0; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }

  ctx.fillStyle = '#fde68a';
  ctx.font = '900 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★ LOCK #1 · CHALKBOARD CIPHER ★', 256, 48);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 22px monospace';
  const cleanEq = equationText.replace(/\$/g, '').slice(0, 42);
  ctx.fillText(cleanEq || '3A - 2 = 4 | √16 = B | 2³ = C', 256, 118);

  ctx.fillStyle = solved ? '#4ade80' : '#38bdf8';
  ctx.font = '900 28px monospace';
  ctx.fillText(solved ? '✓ PIN UNLOCKED' : 'SOLVE FOR 3-DIGIT PIN', 256, 192);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const EscapeClassroom3DScene: React.FC<EscapeClassroom3DSceneProps> = ({
  roomThemeId,
  recommendedNextStation,
  solvedMap,
  chalkboardEquation,
  cameraMode,
  isModalOpen,
  isEscaped,
  externalMoveDir,
  walkToStationTrigger,
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

  const cameraModeRef = useRef<CameraViewMode>(cameraMode);
  cameraModeRef.current = cameraMode;

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

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 7.2, 8.8);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.minPolarAngle = 0.25;
    controls.minDistance = 3.5;
    controls.maxDistance = 18;
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

    // Walls (Back, Left, Right)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.08,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.3,
    });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(14.6, 5.2, 0.35), wallMat);
    backWall.position.set(0, 2.6, -6.1);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 12.4), wallMat);
    leftWall.position.set(-7.1, 2.6, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 12.4), wallMat);
    rightWall.position.set(7.1, 2.6, 0);
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);

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

    // 3 Glowing Specimen Flasks on Lab Bench
    const flaskColors = [0x10b981, 0x38bdf8, 0xf59e0b];
    for (let i = 0; i < 3; i++) {
      const flask = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.52, 18),
        new THREE.MeshStandardMaterial({
          color: flaskColors[i],
          emissive: flaskColors[i],
          emissiveIntensity: 0.45,
          roughness: 0.15,
          metalness: 0.1,
        })
      );
      flask.position.set(-0.75 + i * 0.75, 1.46, 0);
      labGroup.add(flask);
    }
    registerStationProp('lab_bench', labGroup);

    // 6. LOCKED SUPPLY CABINET (LOCK #3)
    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(6.45, 0, -2.2);
    const cabinetBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 3.2, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.35 })
    );
    cabinetBody.position.set(0, 1.6, 0);
    cabinetGroup.add(cabinetBody);

    const cabinetLockPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.45, 0.35),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
      })
    );
    cabinetLockPad.position.set(-0.45, 1.7, 0);
    cabinetGroup.add(cabinetLockPad);
    registerStationProp('cabinet', cabinetGroup);

    // 7. LOGIC SYNTHESIS BOARD (LOCK #4)
    const logicGroup = new THREE.Group();
    logicGroup.position.set(3.2, 0, -5.82);
    const logicFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.85, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x312e81, metalness: 0.5, roughness: 0.3 })
    );
    logicFrame.position.set(0, 2.55, 0);
    logicGroup.add(logicFrame);

    const logicScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 1.55),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.65,
        roughness: 0.2,
      })
    );
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

    // ==================== MAIN ANIMATION LOOP ====================
    const clock = new THREE.Clock();
    let walkCycle = 0;
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

        const stateKey = `${state}:${badge}`;
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
              Boolean(solved.chalkboard)
            );
            boardFaceMat.needsUpdate = true;
            oldBoard?.dispose();
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

        const scalePulse =
          isHighlighted || proximityFactor > 0.35
            ? 1 + Math.sin(elapsed * pulseSpeed) * 0.11
            : 0.85;
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

      // Character Limb & Body Animation
      if (isEscapedRef.current) {
        // Door swings open and character celebrates!
        doorHingePivot.rotation.y = THREE.MathUtils.lerp(
          doorHingePivot.rotation.y,
          -Math.PI * 0.62,
          dt * 4
        );
        doorPanelMat.color.setHex(0x059669);
        bodyRig.position.y = Math.abs(Math.sin(elapsed * 7)) * 0.28;
        leftArmPivot.rotation.x = Math.PI * 0.85 + Math.sin(elapsed * 10) * 0.25;
        rightArmPivot.rotation.x = Math.PI * 0.85 - Math.sin(elapsed * 10) * 0.25;
        leftLegPivot.rotation.x = Math.sin(elapsed * 7) * 0.25;
        rightLegPivot.rotation.x = -Math.sin(elapsed * 7) * 0.25;
      } else if (isMoving) {
        walkCycle += dt * 11;
        const swing = Math.sin(walkCycle) * 0.65;
        leftLegPivot.rotation.x = swing;
        rightLegPivot.rotation.x = -swing;
        leftArmPivot.rotation.x = -swing * 0.8;
        rightArmPivot.rotation.x = swing * 0.8;
        bodyRig.position.y = Math.abs(Math.cos(walkCycle)) * 0.09;
        headPivot.rotation.y = THREE.MathUtils.lerp(headPivot.rotation.y, 0, dt * 8);
      } else {
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

      // Camera mode choreography
      const mode = cameraModeRef.current;
      if (mode === 'chase') {
        _desiredCamPos.set(
          THREE.MathUtils.clamp(playerGroup.position.x * 0.65, -4.5, 4.5),
          5.2,
          Math.min(7.8, playerGroup.position.z + 5.2)
        );
        camera.position.lerp(_desiredCamPos, dt * 4.5);
        _lookTarget.set(
          playerGroup.position.x * 0.8,
          1.35,
          playerGroup.position.z - 1.5
        );
        controls.target.lerp(_lookTarget, dt * 6);
        controls.update();
      } else if (mode === 'overview') {
        camera.position.lerp(_overviewPos, dt * 4);
        controls.target.lerp(_overviewTarget, dt * 5);
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
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(rafId);
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
