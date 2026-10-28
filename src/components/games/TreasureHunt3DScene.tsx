import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TreasureAdventureWorld } from '../../games/gameDataAndStorage';

export type TreasureCameraMode = 'chase' | 'overview' | 'orbit';
export type TimeOfDayMode = 'day' | 'sunset' | 'night';

export interface IslandNode3D {
  index: number;
  id: number;
  title: string;
  shortTag: string;
  position: [number, number, number];
  standPosition: [number, number, number];
}

export interface DigSpot3D {
  id: string;
  rewardTitle: string;
  xpBonus: number;
  tip: string;
  dug: boolean;
  position: [number, number, number];
}

// 6 Island 3D Positions arranged in a scenic archipelago path connected by bridges
export const ISLAND_POSITIONS_3D: Array<{
  pos: [number, number, number];
  stand: [number, number, number];
  radius: number;
}> = [
  { pos: [-7.5, 0, 4.2], stand: [-7.5, 0.35, 5.1], radius: 2.3 },
  { pos: [-3.2, 0, 1.4], stand: [-3.2, 0.35, 2.3], radius: 2.2 },
  { pos: [-5.2, 0, -3.4], stand: [-5.2, 0.35, -2.5], radius: 2.2 },
  { pos: [0.4, 0, -3.8], stand: [0.4, 0.35, -2.9], radius: 2.3 },
  { pos: [4.6, 0, 1.2], stand: [4.6, 0.35, 2.1], radius: 2.3 },
  { pos: [7.4, 0, -3.2], stand: [7.4, 0.45, -2.1], radius: 2.8 },
];

export const DIG_SPOT_POSITIONS_3D: Record<string, [number, number, number]> = {
  'dig-1': [-6.3, 0.36, 3.5],
  'dig-2': [-0.2, 0.36, -4.4],
  'dig-3': [5.4, 0.36, 0.5],
};

interface TreasureHunt3DSceneProps {
  world: TreasureAdventureWorld;
  timeOfDay: TimeOfDayMode;
  cameraMode: TreasureCameraMode;
  completedCheckpointIds: number[];
  recommendedCheckpointIdx: number;
  buriedSpots: Array<{
    id: string;
    dug: boolean;
    rewardTitle: string;
    xpBonus: number;
    tip: string;
  }>;
  isModalOpen: boolean;
  isVictory: boolean;
  externalMoveDir: { x: number; z: number };
  walkTargetTrigger: {
    type: 'checkpoint' | 'dig';
    checkpointIdx?: number;
    digId?: string;
    seq: number;
  } | null;
  onArriveAtCheckpoint: (idx: number) => void;
  onArriveAtDigSpot: (spotId: string) => void;
  onProximityChange: (info: {
    checkpointIdx: number | null;
    digSpotId: string | null;
    compassDeg: number;
    distMeters: number;
  }) => void;
}

function createFloatingSignTexture(
  badgeText: string,
  titleText: string,
  state: 'start' | 'next' | 'done' | 'locked' | 'vault' | 'dig'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;

  const palette = {
    start: {
      bg: '#064e3b',
      border: '#fbbf24',
      badgeBg: '#fbbf24',
      badgeText: '#0f172a',
      title: '#ffffff',
      glow: '#f59e0b',
    },
    next: {
      bg: '#451a03',
      border: '#fbbf24',
      badgeBg: '#f59e0b',
      badgeText: '#0f172a',
      title: '#fef3c7',
      glow: '#fbbf24',
    },
    vault: {
      bg: '#3b0764',
      border: '#facc15',
      badgeBg: '#facc15',
      badgeText: '#0f172a',
      title: '#fef08a',
      glow: '#eab308',
    },
    done: {
      bg: '#064e3b',
      border: '#34d399',
      badgeBg: '#10b981',
      badgeText: '#022c22',
      title: '#a7f3d0',
      glow: '#10b981',
    },
    locked: {
      bg: '#0f172a',
      border: '#475569',
      badgeBg: '#334155',
      badgeText: '#cbd5e1',
      title: '#94a3b8',
      glow: '#334155',
    },
    dig: {
      bg: '#78350f',
      border: '#fde047',
      badgeBg: '#facc15',
      badgeText: '#0f172a',
      title: '#fef9c3',
      glow: '#facc15',
    },
  }[state];

  const x = 16;
  const y = 16;
  const w = canvas.width - 32;
  const h = 152;
  const r = 28;

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = state === 'start' || state === 'next' || state === 'vault' ? 22 : 8;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = palette.bg;
  ctx.fill();
  ctx.lineWidth = state === 'start' || state === 'next' || state === 'vault' ? 8 : 5;
  ctx.strokeStyle = palette.border;
  ctx.stroke();
  ctx.restore();

  // Top Badge
  const badgeW = Math.min(w - 36, Math.max(200, badgeText.length * 21 + 40));
  const badgeX = (canvas.width - badgeW) / 2;
  ctx.fillStyle = palette.badgeBg;
  ctx.beginPath();
  ctx.roundRect(badgeX, 30, badgeW, 46, 14);
  ctx.fill();

  ctx.fillStyle = palette.badgeText;
  ctx.font = '900 25px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, canvas.width / 2, 54);

  // Main concise title
  ctx.fillStyle = palette.title;
  ctx.font = '800 30px "Inter", system-ui, sans-serif';
  ctx.fillText(titleText.slice(0, 24), canvas.width / 2, 122);

  // Pointer triangle
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 24, y + h);
  ctx.lineTo(canvas.width / 2 + 24, y + h);
  ctx.lineTo(canvas.width / 2, y + h + 34);
  ctx.closePath();
  ctx.fillStyle = palette.border;
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export const TreasureHunt3DScene: React.FC<TreasureHunt3DSceneProps> = ({
  world,
  timeOfDay,
  cameraMode,
  completedCheckpointIds,
  recommendedCheckpointIdx,
  buriedSpots,
  isModalOpen,
  isVictory,
  externalMoveDir,
  walkTargetTrigger,
  onArriveAtCheckpoint,
  onArriveAtDigSpot,
  onProximityChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState<boolean>(false);

  const completedRef = useRef<number[]>(completedCheckpointIds);
  completedRef.current = completedCheckpointIds;

  const recommendedRef = useRef<number>(recommendedCheckpointIdx);
  recommendedRef.current = recommendedCheckpointIdx;

  const buriedRef = useRef(buriedSpots);
  buriedRef.current = buriedSpots;

  const cameraModeRef = useRef<TreasureCameraMode>(cameraMode);
  cameraModeRef.current = cameraMode;

  const timeOfDayRef = useRef<TimeOfDayMode>(timeOfDay);
  timeOfDayRef.current = timeOfDay;

  const isModalOpenRef = useRef<boolean>(isModalOpen);
  isModalOpenRef.current = isModalOpen;

  const isVictoryRef = useRef<boolean>(isVictory);
  isVictoryRef.current = isVictory;

  const externalMoveRef = useRef(externalMoveDir);
  externalMoveRef.current = externalMoveDir;

  const onArriveCpRef = useRef(onArriveAtCheckpoint);
  onArriveCpRef.current = onArriveAtCheckpoint;

  const onArriveDigRef = useRef(onArriveAtDigSpot);
  onArriveDigRef.current = onArriveAtDigSpot;

  const onProximityRef = useRef(onProximityChange);
  onProximityRef.current = onProximityChange;

  const pendingWalkRef = useRef<{
    x: number;
    z: number;
    checkpointIdx?: number;
    digSpotId?: string;
  } | null>(null);

  const digAnimTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!walkTargetTrigger) return;
    if (
      walkTargetTrigger.type === 'checkpoint' &&
      walkTargetTrigger.checkpointIdx !== undefined
    ) {
      const node = ISLAND_POSITIONS_3D[walkTargetTrigger.checkpointIdx];
      if (node) {
        pendingWalkRef.current = {
          x: node.stand[0],
          z: node.stand[2],
          checkpointIdx: walkTargetTrigger.checkpointIdx,
        };
      }
    } else if (walkTargetTrigger.type === 'dig' && walkTargetTrigger.digId) {
      const pos = DIG_SPOT_POSITIONS_3D[walkTargetTrigger.digId];
      if (pos) {
        pendingWalkRef.current = {
          x: pos[0],
          z: pos[2] + 0.55,
          digSpotId: walkTargetTrigger.digId,
        };
      }
    }
  }, [walkTargetTrigger]);

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
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x042f49);
    scene.fog = new THREE.FogExp2(0x042f49, 0.018);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      120
    );
    camera.position.set(-7.5, 6.8, 11.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = 0.2;
    controls.minDistance = 4;
    controls.maxDistance = 26;
    controls.target.set(-4, 0.5, 1);

    // ==================== LIGHTING ====================
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    sunLight.position.set(10, 16, 10);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(1024, 1024);
      const d = 14;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    const beaconLight = new THREE.PointLight(0xfbbf24, 3.0, 9);
    beaconLight.position.set(-7.5, 3.2, 4.2);
    scene.add(beaconLight);

    // ==================== 3D SHIMMERING OCEAN ====================
    const oceanGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(world.waterColor || '#0284c7'),
      roughness: 0.22,
      metalness: 0.35,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.y = -0.15;
    oceanMesh.receiveShadow = !isSoftwareGl;
    scene.add(oceanMesh);

    const pickableObjects: THREE.Object3D[] = [oceanMesh];

    // ==================== 6 3D ISLANDS, BRIDGES, PALMS & TREASURE CHESTS ====================
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const islandTopMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(world.islandColor || '#15803d'),
      roughness: 0.75,
    });
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.8,
    });
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x57534e,
      roughness: 0.85,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.7,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.8,
      roughness: 0.2,
    });

    const chestDataMap: Map<
      number,
      {
        chestGroup: THREE.Group;
        baseChestScale: number;
        chestMats: THREE.MeshStandardMaterial[];
        lidPivot: THREE.Group;
        signSprite: THREE.Sprite;
        ringMesh: THREE.Mesh;
        ringMat: THREE.MeshBasicMaterial;
        sonarRingMesh: THREE.Mesh;
        sonarRingMat: THREE.MeshBasicMaterial;
        crystalMesh: THREE.Mesh;
        crystalMat: THREE.MeshStandardMaterial;
        baseSignY: number;
        lastStateKey: string;
      }
    > = new Map();

    ISLAND_POSITIONS_3D.forEach((isl, idx) => {
      const cp = world.checkpoints[idx] || {
        id: idx + 1,
        title: `Island ${idx + 1}`,
      };
      const islandGroup = new THREE.Group();
      islandGroup.position.set(isl.pos[0], 0, isl.pos[2]);
      worldGroup.add(islandGroup);

      // Rock base
      const rockBase = new THREE.Mesh(
        new THREE.CylinderGeometry(isl.radius * 1.08, isl.radius * 1.22, 0.55, 24),
        rockMat
      );
      rockBase.position.y = -0.1;
      rockBase.receiveShadow = !isSoftwareGl;
      islandGroup.add(rockBase);

      // Sandy beach rim
      const sandRim = new THREE.Mesh(
        new THREE.CylinderGeometry(isl.radius * 0.96, isl.radius * 1.06, 0.28, 24),
        sandMat
      );
      sandRim.position.y = 0.14;
      sandRim.receiveShadow = !isSoftwareGl;
      sandRim.userData.checkpointIdx = idx;
      pickableObjects.push(sandRim);
      islandGroup.add(sandRim);

      // Lush green top
      const grassTop = new THREE.Mesh(
        new THREE.CylinderGeometry(isl.radius * 0.82, isl.radius * 0.92, 0.22, 24),
        islandTopMat
      );
      grassTop.position.y = 0.26;
      grassTop.receiveShadow = !isSoftwareGl;
      grassTop.userData.checkpointIdx = idx;
      pickableObjects.push(grassTop);
      islandGroup.add(grassTop);

      // 3D Palm Trees on the island
      const palmOffsets = [
        [-isl.radius * 0.52, -isl.radius * 0.35],
        [isl.radius * 0.55, -isl.radius * 0.3],
      ];
      palmOffsets.forEach(([px, pz]) => {
        const palmGroup = new THREE.Group();
        palmGroup.position.set(px, 0.35, pz);
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.15, 1.65, 8),
          woodMat
        );
        trunk.position.y = 0.82;
        trunk.castShadow = !isSoftwareGl;
        palmGroup.add(trunk);

        const crownMat = new THREE.MeshStandardMaterial({
          color: 0x16a34a,
          roughness: 0.6,
        });
        for (let f = 0; f < 5; f++) {
          const frond = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 5), crownMat);
          const angle = (f / 5) * Math.PI * 2;
          frond.position.set(Math.cos(angle) * 0.28, 1.65, Math.sin(angle) * 0.28);
          frond.rotation.z = -Math.cos(angle) * 0.6;
          frond.rotation.x = Math.sin(angle) * 0.6;
          palmGroup.add(frond);
        }
        islandGroup.add(palmGroup);
      });

      // 3D Treasure Chest at island center (with unique materials per island for proximity emissive pulse)
      const chestGroup = new THREE.Group();
      chestGroup.position.set(0, 0.37, -0.15);
      chestGroup.userData.checkpointIdx = idx;
      islandGroup.add(chestGroup);

      const chestScale = idx === 5 ? 1.35 : 1.0;
      chestGroup.scale.setScalar(chestScale);

      const chestWoodMat = woodMat.clone();
      const chestGoldMat = goldMat.clone();
      const chestMats: THREE.MeshStandardMaterial[] = [chestWoodMat, chestGoldMat];

      const chestBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.52, 0.65),
        chestWoodMat
      );
      chestBox.position.y = 0.26;
      chestBox.castShadow = !isSoftwareGl;
      chestGroup.add(chestBox);

      const goldBand = new THREE.Mesh(
        new THREE.BoxGeometry(0.99, 0.12, 0.69),
        chestGoldMat
      );
      goldBand.position.y = 0.42;
      chestGroup.add(goldBand);

      // Hinged Chest Lid
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, 0.52, -0.32);
      chestGroup.add(lidPivot);

      const lidMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.28, 0.65),
        idx === 5 ? chestGoldMat : chestWoodMat
      );
      lidMesh.position.set(0, 0.14, 0.32);
      lidPivot.add(lidMesh);

      chestGroup.traverse((c) => {
        c.userData.checkpointIdx = idx;
        if ((c as THREE.Mesh).isMesh) pickableObjects.push(c);
      });

      // Glowing Floor Ring where the explorer stands
      const ringGeo = new THREE.RingGeometry(0.55, 0.8, 28);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(isl.stand[0], 0.39, isl.stand[2]);
      ringMesh.userData.checkpointIdx = idx;
      pickableObjects.push(ringMesh);
      scene.add(ringMesh);

      // Expanding 3D Sonar Ripple Ring (non-verbal proximity & start cue)
      const sonarRingGeo = new THREE.RingGeometry(0.62, 0.72, 32);
      const sonarRingMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      });
      const sonarRingMesh = new THREE.Mesh(sonarRingGeo, sonarRingMat);
      sonarRingMesh.rotation.x = -Math.PI / 2;
      sonarRingMesh.position.set(isl.stand[0], 0.4, isl.stand[2]);
      scene.add(sonarRingMesh);

      // Rotating 3D Diamond Beacon Crystal floating directly above the chest
      const crystalGeo = new THREE.OctahedronGeometry(0.22, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.9,
        roughness: 0.15,
        metalness: 0.75,
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.position.set(isl.pos[0], 1.85, isl.pos[2] - 0.15);
      crystalMesh.userData.checkpointIdx = idx;
      pickableObjects.push(crystalMesh);
      scene.add(crystalMesh);

      // Floating 3D Signboard above each island
      const signMat = new THREE.SpriteMaterial({
        map: createFloatingSignTexture(`STAGE ${idx + 1}`, cp.title, 'locked'),
        transparent: true,
        depthTest: false,
      });
      const signSprite = new THREE.Sprite(signMat);
      const baseSignY = idx === 5 ? 3.55 : 3.1;
      signSprite.position.set(isl.pos[0], baseSignY, isl.pos[2]);
      signSprite.scale.set(2.8, 1.2, 1);
      signSprite.renderOrder = 25;
      signSprite.userData.checkpointIdx = idx;
      pickableObjects.push(signSprite);
      scene.add(signSprite);

      chestDataMap.set(idx, {
        chestGroup,
        baseChestScale: chestScale,
        chestMats,
        lidPivot,
        signSprite,
        ringMesh,
        ringMat,
        sonarRingMesh,
        sonarRingMat,
        crystalMesh,
        crystalMat,
        baseSignY,
        lastStateKey: '',
      });

      // Wooden suspension bridge connecting to next island
      if (idx < ISLAND_POSITIONS_3D.length - 1) {
        const nextIsl = ISLAND_POSITIONS_3D[idx + 1];
        const startV = new THREE.Vector3(isl.pos[0], 0.3, isl.pos[2]);
        const endV = new THREE.Vector3(nextIsl.pos[0], 0.3, nextIsl.pos[2]);
        const dist = startV.distanceTo(endV);
        const midV = startV.clone().lerp(endV, 0.5);

        const bridgeDeck = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.1, dist),
          woodMat
        );
        bridgeDeck.position.copy(midV);
        bridgeDeck.lookAt(endV);
        bridgeDeck.receiveShadow = !isSoftwareGl;
        worldGroup.add(bridgeDeck);
      }
    });

    // ==================== 3 BURIED X-MARK DIG SPOTS ====================
    const digVisualsMap: Map<
      string,
      {
        group: THREE.Group;
        xBarMat: THREE.MeshStandardMaterial;
        sonarRingMesh: THREE.Mesh;
        sonarRingMat: THREE.MeshBasicMaterial;
        signSprite: THREE.Sprite;
        lastDug: boolean;
      }
    > = new Map();

    Object.entries(DIG_SPOT_POSITIONS_3D).forEach(([digId, pos]) => {
      const digGroup = new THREE.Group();
      digGroup.position.set(pos[0], pos[1], pos[2]);
      digGroup.userData.digSpotId = digId;
      worldGroup.add(digGroup);

      const xBarMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      });
      const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.16), xBarMat);
      bar1.rotation.y = Math.PI / 4;
      digGroup.add(bar1);

      const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.16), xBarMat);
      bar2.rotation.y = -Math.PI / 4;
      digGroup.add(bar2);

      digGroup.traverse((c) => {
        c.userData.digSpotId = digId;
        if ((c as THREE.Mesh).isMesh) pickableObjects.push(c);
      });

      const sonarRingGeo = new THREE.RingGeometry(0.42, 0.52, 24);
      const sonarRingMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      });
      const sonarRingMesh = new THREE.Mesh(sonarRingGeo, sonarRingMat);
      sonarRingMesh.rotation.x = -Math.PI / 2;
      sonarRingMesh.position.set(pos[0], pos[1] + 0.02, pos[2]);
      scene.add(sonarRingMesh);

      const digSignMat = new THREE.SpriteMaterial({
        map: createFloatingSignTexture('⛏️ DIG RELIC', 'Buried X-Spot', 'dig'),
        transparent: true,
        depthTest: false,
      });
      const digSign = new THREE.Sprite(digSignMat);
      digSign.position.set(pos[0], 1.85, pos[2]);
      digSign.scale.set(1.85, 0.82, 1);
      digSign.renderOrder = 22;
      digSign.userData.digSpotId = digId;
      pickableObjects.push(digSign);
      scene.add(digSign);

      digVisualsMap.set(digId, {
        group: digGroup,
        xBarMat,
        sonarRingMesh,
        sonarRingMat,
        signSprite: digSign,
        lastDug: false,
      });
    });

    // Dynamic Proximity PointLight that illuminates whichever chest or dig spot the Explorer approaches
    const proximityPointLight = new THREE.PointLight(0xfbbf24, 0, 4.5);
    proximityPointLight.position.set(ISLAND_POSITIONS_3D[0].pos[0], 1.6, ISLAND_POSITIONS_3D[0].pos[2]);
    scene.add(proximityPointLight);

    // ==================== ANIMATED FLOOR TRAIL DOTS (EXPLORER -> NEXT STAGE) ====================
    const TRAIL_DOT_COUNT = 12;
    const trailDots: THREE.Mesh[] = [];
    const dotGeo = new THREE.CircleGeometry(0.18, 16);
    for (let i = 0; i < TRAIL_DOT_COUNT; i++) {
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.9,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(0, 0.42, 0);
      scene.add(dot);
      trailDots.push(dot);
    }

    // ==================== ANIMATED 3D EXPLORER CHARACTER ====================
    const explorerGroup = new THREE.Group();
    const startStand = ISLAND_POSITIONS_3D[0].stand;
    explorerGroup.position.set(startStand[0], startStand[1], startStand[2]);
    scene.add(explorerGroup);

    const bodyRig = new THREE.Group();
    explorerGroup.add(bodyRig);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.55 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
    const packMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.5 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.7, 0.32), jacketMat);
    torso.position.set(0, 1.08, 0);
    torso.castShadow = !isSoftwareGl;
    bodyRig.add(torso);

    // Expedition Backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.24), packMat);
    backpack.position.set(0, 1.1, -0.24);
    bodyRig.add(backpack);

    // Head + Explorer Safari Hat
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.46, 0);
    bodyRig.add(headPivot);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), skinMat);
    headMesh.position.set(0, 0.21, 0);
    headPivot.add(headMesh);

    const hatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.06, 20),
      hatMat
    );
    hatBrim.position.set(0, 0.42, 0);
    headPivot.add(hatBrim);

    const hatDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.18, 16),
      hatMat
    );
    hatDome.position.set(0, 0.51, 0);
    headPivot.add(hatDome);

    // Arms
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.36, 1.36, 0);
    bodyRig.add(leftArmPivot);
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.58, 0.17), jacketMat);
    leftArm.position.set(0, -0.24, 0);
    leftArmPivot.add(leftArm);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.36, 1.36, 0);
    bodyRig.add(rightArmPivot);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.58, 0.17), jacketMat);
    rightArm.position.set(0, -0.24, 0);
    rightArmPivot.add(rightArm);

    // Legs
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.14, 0.74, 0);
    bodyRig.add(leftLegPivot);
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.68, 0.2), pantsMat);
    leftLeg.position.set(0, -0.34, 0);
    leftLegPivot.add(leftLeg);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.14, 0.74, 0);
    bodyRig.add(rightLegPivot);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.68, 0.2), pantsMat);
    rightLeg.position.set(0, -0.34, 0);
    rightLegPivot.add(rightLeg);

    // Glowing foot ring under explorer
    const explorerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.36, 0.52, 24),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
    );
    explorerRing.rotation.x = -Math.PI / 2;
    explorerRing.position.y = 0.03;
    explorerGroup.add(explorerRing);

    // ==================== INPUT & RAYCASTING ====================
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
    let downPos = { x: 0, y: 0 };
    let hoveredCheckpointIdx: number | null = null;
    let hoveredDigSpotId: string | null = null;

    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableObjects, true);
      const digHit = hits.find((h) => h.object.userData?.digSpotId);
      const cpHit = hits.find((h) => h.object.userData?.checkpointIdx !== undefined);

      hoveredDigSpotId = digHit ? (digHit.object.userData.digSpotId as string) : null;
      hoveredCheckpointIdx =
        !digHit && cpHit ? (cpHit.object.userData.checkpointIdx as number) : null;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 8) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableObjects, true);
      if (hits.length === 0) return;

      // Check dig spot hit
      const digHit = hits.find((h) => h.object.userData?.digSpotId);
      if (digHit) {
        const dId = digHit.object.userData.digSpotId as string;
        const pos = DIG_SPOT_POSITIONS_3D[dId];
        if (pos) {
          pendingWalkRef.current = {
            x: pos[0],
            z: pos[2] + 0.5,
            digSpotId: dId,
          };
          return;
        }
      }

      // Check island/checkpoint/sign hit
      const cpHit = hits.find((h) => h.object.userData?.checkpointIdx !== undefined);
      if (cpHit) {
        const idx = cpHit.object.userData.checkpointIdx as number;
        const node = ISLAND_POSITIONS_3D[idx];
        if (node) {
          pendingWalkRef.current = {
            x: node.stand[0],
            z: node.stand[2],
            checkpointIdx: idx,
          };
          return;
        }
      }

      // Walk to clicked ocean/ground point
      const pt = hits[0].point;
      pendingWalkRef.current = {
        x: THREE.MathUtils.clamp(pt.x, -10, 10),
        z: THREE.MathUtils.clamp(pt.z, -7, 7),
      };
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // ==================== ANIMATION LOOP ====================
    const clock = new THREE.Clock();
    let walkCycle = 0;
    let rafId = 0;
    let disposed = false;
    let lastProximityStr = '';

    // Pre-allocated vectors & colors to avoid GC allocations inside tick()
    const tempSkyColor = new THREE.Color();
    const tempDesiredCam = new THREE.Vector3();
    const tempLookTarget = new THREE.Vector3();
    const overviewCamPos = new THREE.Vector3(0, 14.5, 11.8);
    const overviewLookTarget = new THREE.Vector3(0, 0.4, -0.5);

    const afterDraw = isSoftwareGl
      ? (cb: FrameRequestCallback) =>
          window.setTimeout(() => {
            if (!disposed) rafId = requestAnimationFrame(cb);
          }, 16)
      : (cb: FrameRequestCallback) => {
          rafId = requestAnimationFrame(cb);
        };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Update Time-of-Day atmosphere
      const tod = timeOfDayRef.current;
      const targetSkyHex =
        tod === 'sunset' ? 0x431407 : tod === 'night' ? 0x020617 : 0x042f49;
      tempSkyColor.setHex(targetSkyHex);
      (scene.background as THREE.Color).lerp(tempSkyColor, dt * 3);
      sunLight.intensity = tod === 'night' ? 0.65 : tod === 'sunset' ? 1.4 : 2.0;

      // Update Island Signs, Chest Lids & 3D Proximity Pulse Highlights
      const completed = completedRef.current;
      const recIdx = recommendedRef.current;

      let closestActivePos: { x: number; y: number; z: number } | null = null;
      let closestActiveFactor = 0;
      let closestActiveColor = 0xfbbf24;

      ISLAND_POSITIONS_3D.forEach((isl, idx) => {
        const cp = world.checkpoints[idx] || { id: idx + 1, title: `Stage ${idx + 1}` };
        const data = chestDataMap.get(idx);
        if (!data) return;

        const isDone = completed.includes(cp.id);
        const isRecommended = idx === recIdx && !isDone;
        const isHovered = hoveredCheckpointIdx === idx;

        // Calculate real-time distance between Explorer and this Island's chest stand
        const distToChest = Math.hypot(
          explorerGroup.position.x - isl.stand[0],
          explorerGroup.position.z - isl.stand[2]
        );
        const proximityFactor = THREE.MathUtils.clamp(1 - distToChest / 3.8, 0, 1);

        if (!isDone && proximityFactor > closestActiveFactor) {
          closestActiveFactor = proximityFactor;
          closestActivePos = { x: isl.pos[0], y: 1.5, z: isl.pos[2] };
          closestActiveColor = isRecommended ? 0xfbbf24 : 0x38bdf8;
        }

        let state: 'start' | 'next' | 'done' | 'locked' | 'vault' = 'locked';
        let badge = `STAGE ${idx + 1}`;

        if (isDone) {
          state = 'done';
          badge = `✓ STAGE ${idx + 1} DONE`;
        } else if (isRecommended) {
          if (idx === 0) {
            state = 'start';
            badge = '★ START HERE · #1';
          } else if (idx === 5) {
            state = 'vault';
            badge = '★ FINAL VAULT · #6';
          } else {
            state = 'next';
            badge = `★ NEXT · STAGE ${idx + 1}`;
          }
        }

        const stateKey = `${state}:${badge}`;
        if (data.lastStateKey !== stateKey) {
          data.lastStateKey = stateKey;
          const oldTex = data.signSprite.material.map;
          data.signSprite.material.map = createFloatingSignTexture(badge, cp.title, state);
          data.signSprite.material.needsUpdate = true;
          oldTex?.dispose();
        }

        // Open chest lid smoothly when completed
        const targetLidRot = isDone ? -Math.PI * 0.58 : 0;
        data.lidPivot.rotation.x = THREE.MathUtils.lerp(
          data.lidPivot.rotation.x,
          targetLidRot,
          dt * 5
        );

        // Pulse frequency speeds up as the Explorer gets closer
        const pulseSpeed = 4.2 + proximityFactor * 5.0;
        const wave = 0.5 + 0.5 * Math.sin(elapsed * pulseSpeed + idx);

        // 1. Subtle 3D Emissive Glow & Scale Breathing on the Treasure Chest itself
        let targetEmissiveHex = 0x000000;
        let targetEmissiveIntensity = 0;

        if (isDone) {
          targetEmissiveHex = 0x10b981;
          targetEmissiveIntensity = 0.14 + proximityFactor * 0.2 * wave;
        } else if (isRecommended) {
          targetEmissiveHex = 0xf59e0b;
          targetEmissiveIntensity =
            0.28 + 0.32 * wave + proximityFactor * (0.42 + 0.35 * wave);
        } else if (proximityFactor > 0.05 || isHovered) {
          targetEmissiveHex = 0x38bdf8;
          targetEmissiveIntensity = Math.max(proximityFactor, isHovered ? 0.65 : 0) * (0.28 + 0.35 * wave);
        }

        data.chestMats.forEach((mat) => {
          mat.emissive.setHex(targetEmissiveHex);
          mat.emissiveIntensity = THREE.MathUtils.lerp(
            mat.emissiveIntensity,
            targetEmissiveIntensity,
            dt * 10
          );
        });

        const chestBreath = !isDone
          ? 1 +
            (isRecommended ? 0.035 : 0.01) * Math.sin(elapsed * pulseSpeed) +
            proximityFactor * 0.045 * wave +
            (isHovered ? 0.035 : 0)
          : 1;
        data.chestGroup.scale.setScalar(data.baseChestScale * chestBreath);

        // 2. Rotating 3D Diamond Beacon Crystal above the Chest
        data.crystalMesh.rotation.y = elapsed * (1.8 + proximityFactor * 2.8);
        data.crystalMesh.position.y =
          1.78 + Math.sin(elapsed * 4.2 + idx) * (0.1 + proximityFactor * 0.08);
        const crystalScale = isDone
          ? 0.65
          : isRecommended
            ? 1.08 + proximityFactor * 0.32 + 0.1 * wave
            : 0.72 + proximityFactor * 0.35;
        data.crystalMesh.scale.setScalar(crystalScale);

        if (isDone) {
          data.crystalMat.color.setHex(0x34d399);
          data.crystalMat.emissive.setHex(0x059669);
          data.crystalMat.emissiveIntensity = 0.5;
        } else if (isRecommended) {
          data.crystalMat.color.setHex(0xfde047);
          data.crystalMat.emissive.setHex(0xd97706);
          data.crystalMat.emissiveIntensity = 0.85 + 0.6 * wave + proximityFactor * 0.5;
        } else {
          data.crystalMat.color.setHex(0x38bdf8);
          data.crystalMat.emissive.setHex(0x0284c7);
          data.crystalMat.emissiveIntensity = 0.35 + proximityFactor * 0.7 * wave;
        }

        // 3. Expanding 3D Floor Sonar Ripple Ring when nearby or on Start/Recommended Chest
        if (!isDone && (isRecommended || proximityFactor > 0.08 || isHovered)) {
          data.sonarRingMesh.visible = true;
          const sonarSpeed = isRecommended ? 1.25 + proximityFactor * 0.65 : 0.9 + proximityFactor * 0.8;
          const sonarPhase = (elapsed * sonarSpeed + idx * 0.25) % 1;
          data.sonarRingMesh.scale.setScalar(1.0 + sonarPhase * (1.1 + proximityFactor * 0.55));
          data.sonarRingMat.color.setHex(isRecommended ? 0xfbbf24 : 0x38bdf8);
          data.sonarRingMat.opacity =
            (1 - sonarPhase) * (isRecommended ? 0.68 : 0.45 * Math.max(proximityFactor, 0.4));
        } else {
          data.sonarRingMesh.visible = false;
        }

        // Bobbing sign & pulsing base ring
        const bob = isRecommended
          ? Math.sin(elapsed * 4.5) * 0.24
          : Math.sin(elapsed * 2 + idx) * 0.06;
        data.signSprite.position.y = data.baseSignY + bob;
        const scalePulse = isRecommended
          ? 1.05 + Math.sin(elapsed * 5) * 0.1 + proximityFactor * 0.08
          : 0.85 + proximityFactor * 0.12;
        data.signSprite.scale.set(2.85 * scalePulse, 1.22 * scalePulse, 1);

        if (isDone) {
          data.ringMat.color.setHex(0x10b981);
          data.ringMat.opacity = 0.55;
        } else if (isRecommended) {
          data.ringMat.color.setHex(0xfbbf24);
          data.ringMat.opacity = 0.7 + Math.sin(elapsed * 6) * 0.28;
          data.ringMesh.scale.setScalar(1.08 + Math.sin(elapsed * 5) * 0.14);
        } else {
          data.ringMat.color.setHex(0x38bdf8);
          data.ringMat.opacity = 0.28 + proximityFactor * 0.45;
          data.ringMesh.scale.setScalar(0.92 + proximityFactor * 0.16);
        }
      });

      // Update Buried Dig Spots visibility & 3D Proximity Pulse
      buriedRef.current.forEach((spot, sIdx) => {
        const vis = digVisualsMap.get(spot.id);
        if (!vis) return;
        vis.group.visible = !spot.dug;
        vis.signSprite.visible = !spot.dug;
        vis.sonarRingMesh.visible = !spot.dug;
        if (spot.dug) return;

        const pos = DIG_SPOT_POSITIONS_3D[spot.id];
        const distToDig = pos
          ? Math.hypot(explorerGroup.position.x - pos[0], explorerGroup.position.z - pos[2])
          : 99;
        const digProx = THREE.MathUtils.clamp(1 - distToDig / 3.2, 0, 1);
        const isDigHovered = hoveredDigSpotId === spot.id;
        const digWave = 0.5 + 0.5 * Math.sin(elapsed * (4.5 + digProx * 5) + sIdx);

        if (pos && digProx > closestActiveFactor) {
          closestActiveFactor = digProx;
          closestActivePos = { x: pos[0], y: 1.2, z: pos[2] };
          closestActiveColor = 0xf59e0b;
        }

        vis.xBarMat.emissive.setHex(digProx > 0.1 || isDigHovered ? 0xf59e0b : 0x991b1b);
        vis.xBarMat.emissiveIntensity =
          0.35 + 0.3 * digWave + Math.max(digProx, isDigHovered ? 0.6 : 0) * 0.65;
        vis.group.scale.setScalar(1 + digProx * 0.14 * digWave + (isDigHovered ? 0.08 : 0));

        const sonarPhase = (elapsed * (1.0 + digProx * 0.8) + sIdx * 0.33) % 1;
        vis.sonarRingMesh.scale.setScalar(1.0 + sonarPhase * (0.9 + digProx * 0.5));
        vis.sonarRingMat.opacity = (1 - sonarPhase) * (0.35 + digProx * 0.45);

        vis.signSprite.position.y = 1.85 + Math.sin(elapsed * 3.5) * 0.12;
      });

      // Smoothly position and pulse the dynamic Proximity PointLight over the closest interactive target
      if (closestActivePos && closestActiveFactor > 0.05) {
        const targetLightPos = closestActivePos as { x: number; y: number; z: number };
        proximityPointLight.position.x = THREE.MathUtils.lerp(
          proximityPointLight.position.x,
          targetLightPos.x,
          dt * 8
        );
        proximityPointLight.position.y = THREE.MathUtils.lerp(
          proximityPointLight.position.y,
          targetLightPos.y,
          dt * 8
        );
        proximityPointLight.position.z = THREE.MathUtils.lerp(
          proximityPointLight.position.z,
          targetLightPos.z,
          dt * 8
        );
        proximityPointLight.color.setHex(closestActiveColor);
        proximityPointLight.intensity = THREE.MathUtils.lerp(
          proximityPointLight.intensity,
          closestActiveFactor * (1.5 + 0.6 * Math.sin(elapsed * 7)),
          dt * 8
        );
      } else {
        proximityPointLight.intensity = THREE.MathUtils.lerp(
          proximityPointLight.intensity,
          0,
          dt * 6
        );
      }

      // Update glowing trail from Explorer to Recommended Island
      const targetNode = ISLAND_POSITIONS_3D[recIdx] || ISLAND_POSITIONS_3D[0];
      beaconLight.position.x = THREE.MathUtils.lerp(
        beaconLight.position.x,
        targetNode.pos[0],
        0.1
      );
      beaconLight.position.z = THREE.MathUtils.lerp(
        beaconLight.position.z,
        targetNode.pos[2],
        0.1
      );

      const sx = explorerGroup.position.x;
      const sz = explorerGroup.position.z;
      const ex = targetNode.stand[0];
      const ez = targetNode.stand[2];
      const trailDist = Math.hypot(ex - sx, ez - sz);

      trailDots.forEach((dot, i) => {
        if (trailDist < 1.2 || isVictoryRef.current) {
          dot.visible = false;
          return;
        }
        dot.visible = true;
        const t = ((i / TRAIL_DOT_COUNT) + elapsed * 0.42) % 1;
        dot.position.x = THREE.MathUtils.lerp(sx, ex, t);
        dot.position.z = THREE.MathUtils.lerp(sz, ez, t);
        (dot.material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.9;
      });

      // Explorer Movement
      let moveX = externalMoveRef.current.x;
      let moveZ = externalMoveRef.current.z;

      if (!isModalOpenRef.current) {
        if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) moveZ -= 1;
        if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) moveZ += 1;
        if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) moveX -= 1;
        if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) moveX += 1;
      }

      const hasManual = Math.hypot(moveX, moveZ) > 0.05;
      if (hasManual) {
        pendingWalkRef.current = null;
      }

      let isMoving = false;
      const speed = 5.2;

      if (hasManual) {
        const len = Math.hypot(moveX, moveZ);
        const nx = moveX / len;
        const nz = moveZ / len;
        explorerGroup.position.x = THREE.MathUtils.clamp(
          explorerGroup.position.x + nx * speed * dt,
          -10,
          10
        );
        explorerGroup.position.z = THREE.MathUtils.clamp(
          explorerGroup.position.z + nz * speed * dt,
          -7,
          7
        );
        const targetAngle = Math.atan2(nx, nz);
        const diff =
          ((targetAngle - explorerGroup.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        explorerGroup.rotation.y += diff * Math.min(1, dt * 12);
        isMoving = true;
      } else if (pendingWalkRef.current) {
        const target = pendingWalkRef.current;
        const dx = target.x - explorerGroup.position.x;
        const dz = target.z - explorerGroup.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.14) {
          const step = Math.min(dist, speed * dt);
          explorerGroup.position.x += (dx / dist) * step;
          explorerGroup.position.z += (dz / dist) * step;
          const targetAngle = Math.atan2(dx, dz);
          const diff =
            ((targetAngle - explorerGroup.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          explorerGroup.rotation.y += diff * Math.min(1, dt * 12);
          isMoving = true;
        } else {
          explorerGroup.position.x = target.x;
          explorerGroup.position.z = target.z;
          const arrivedCp = target.checkpointIdx;
          const arrivedDig = target.digSpotId;
          pendingWalkRef.current = null;

          if (arrivedDig !== undefined) {
            digAnimTimerRef.current = 0.8;
            onArriveDigRef.current(arrivedDig);
          } else if (arrivedCp !== undefined) {
            onArriveCpRef.current(arrivedCp);
          }
        }
      }

      // Character Animation (Walking, Digging, Victory, or Idle)
      if (digAnimTimerRef.current > 0) {
        digAnimTimerRef.current -= dt;
        leftArmPivot.rotation.x = -Math.PI * 0.5 + Math.sin(elapsed * 18) * 0.6;
        rightArmPivot.rotation.x = -Math.PI * 0.5 + Math.sin(elapsed * 18) * 0.6;
        bodyRig.position.y = Math.abs(Math.sin(elapsed * 14)) * 0.12;
      } else if (isVictoryRef.current) {
        bodyRig.position.y = Math.abs(Math.sin(elapsed * 7)) * 0.3;
        leftArmPivot.rotation.x = Math.PI * 0.85 + Math.sin(elapsed * 10) * 0.25;
        rightArmPivot.rotation.x = Math.PI * 0.85 - Math.sin(elapsed * 10) * 0.25;
      } else if (isMoving) {
        walkCycle += dt * 12;
        const swing = Math.sin(walkCycle) * 0.68;
        leftLegPivot.rotation.x = swing;
        rightLegPivot.rotation.x = -swing;
        leftArmPivot.rotation.x = -swing * 0.8;
        rightArmPivot.rotation.x = swing * 0.8;
        bodyRig.position.y = Math.abs(Math.cos(walkCycle)) * 0.1;
      } else {
        leftLegPivot.rotation.x = THREE.MathUtils.lerp(leftLegPivot.rotation.x, 0, dt * 8);
        rightLegPivot.rotation.x = THREE.MathUtils.lerp(rightLegPivot.rotation.x, 0, dt * 8);
        leftArmPivot.rotation.x = THREE.MathUtils.lerp(
          leftArmPivot.rotation.x,
          Math.sin(elapsed * 2) * 0.08,
          dt * 6
        );
        rightArmPivot.rotation.x = THREE.MathUtils.lerp(
          rightArmPivot.rotation.x,
          -Math.sin(elapsed * 2) * 0.08,
          dt * 6
        );
        bodyRig.position.y = Math.sin(elapsed * 3) * 0.03;
        headPivot.rotation.y = Math.sin(elapsed * 1.6) * 0.26;
      }

      // Proximity & Compass Bearing Calculation
      let nearCp: number | null = null;
      ISLAND_POSITIONS_3D.forEach((isl, idx) => {
        const d = Math.hypot(
          explorerGroup.position.x - isl.stand[0],
          explorerGroup.position.z - isl.stand[2]
        );
        if (d < 1.9) nearCp = idx;
      });

      let nearDig: string | null = null;
      buriedRef.current.forEach((spot) => {
        if (spot.dug) return;
        const pos = DIG_SPOT_POSITIONS_3D[spot.id];
        if (!pos) return;
        const d = Math.hypot(explorerGroup.position.x - pos[0], explorerGroup.position.z - pos[2]);
        if (d < 1.6) nearDig = spot.id;
      });

      const compassDeg = Math.round(
        ((Math.atan2(ex - sx, -(ez - sz)) * 180) / Math.PI + 360) % 360
      );
      const distMeters = Math.round(trailDist * 12);
      const proxKey = `${nearCp}:${nearDig}:${compassDeg}:${distMeters}`;
      if (proxKey !== lastProximityStr) {
        lastProximityStr = proxKey;
        onProximityRef.current({
          checkpointIdx: nearCp,
          digSpotId: nearDig,
          compassDeg,
          distMeters,
        });
      }

      // Camera Choreography
      const cMode = cameraModeRef.current;
      if (cMode === 'chase') {
        tempDesiredCam.set(
          explorerGroup.position.x * 0.85,
          6.2,
          explorerGroup.position.z + 6.4
        );
        camera.position.lerp(tempDesiredCam, dt * 4.5);
        tempLookTarget.set(
          explorerGroup.position.x,
          1.1,
          explorerGroup.position.z - 1.2
        );
        controls.target.lerp(tempLookTarget, dt * 6);
        controls.update();
      } else if (cMode === 'overview') {
        camera.position.lerp(overviewCamPos, dt * 4);
        controls.target.lerp(overviewLookTarget, dt * 5);
        controls.update();
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
      afterDraw(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [world]);

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-200 p-6 text-center">
        <div>
          <div className="text-base font-black text-amber-400">3D Island Expedition Ready</div>
          <div className="text-xs text-slate-400 mt-1">
            Use the Stage buttons below to unlock each island chest.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-pointer select-none overflow-hidden"
      title="Click any glowing 3D island sign, chest, or dig spot to walk there"
    />
  );
};
