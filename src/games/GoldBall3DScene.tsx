import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CupPatternSkin, GoldBallLevelConfig, ReelChallengeMode } from './goldBallData';

export type RoundPhase =
  | 'OBSERVE'
  | 'COUNTDOWN'
  | 'SHUFFLING'
  | 'SELECTING'
  | 'REVEALING';

// Natural Tabletop Glide & Flexible Ring Rotation Trajectories:
// 1. PASS_BY_LANE: Two cups revolve smoothly around their shared midpoint in a true 180° elliptical turntable orbit.
// 2. RING_CAROUSEL_ROTATION: All cups on a full ring or sub-ring glide along the exact same unified closed polar-spline perimeter rail without switching or crossing radii.
// 3. RING_ARC_SWAP: Two cups on a circular/oval ring weave past each other along concentric inner & outer curved ring arcs following the ring's curvature.
// 4. TRACK_SPLINE_GLIDE: Cups glide smoothly directly along the Figure-8 Infinity or 3-Petal Clover spline tracks.
export type SpotQuestMoveTrajectory =
  | {
      kind: 'PASS_BY_LANE';
      cupId: number;
      fromSlot: number;
      toSlot: number;
      laneOffsetWorld: number;
      leadLagBias: number;
      isFeint: boolean;
      peekDecoyLift: boolean;
    }
  | {
      kind: 'RING_CAROUSEL_ROTATION';
      cupId: number;
      fromSlot: number;
      toSlot: number;
      ringSlots: number[];
      fromRingIdx: number;
      deltaSteps: number;
      roundnessBlend: number;
    }
  | {
      kind: 'RING_ARC_SWAP';
      cupId: number;
      fromSlot: number;
      toSlot: number;
      ringSlots: number[];
      fromRingIdx: number;
      deltaSteps: number;
      radialLaneOffset: number;
      isFeint: boolean;
      peekDecoyLift: boolean;
    }
  | {
      kind: 'TRACK_SPLINE_GLIDE';
      cupId: number;
      fromSlot: number;
      toSlot: number;
      trackKind: 'figure8' | 'trefoil';
      chainIndex: number; // 0 for figure8, 0..3 for trefoil petal/roundabout chains
      fromNodeIdx: number;
      deltaSteps: number; // +1, +2, -1, -2 stations along the closed spline
      totalNodes: number;
    };

export interface ShuffleWaveStep {
  trajectories: SpotQuestMoveTrajectory[];
  durationScale: number;
  holdPauseSec: number;
}

export interface GoldBall3DSceneProps {
  levelConfig: GoldBallLevelConfig;
  phase: RoundPhase;
  countdownNum?: number | null;
  ballCupId: number;
  secondaryBallCupId: number | null;
  decoyCupIds: number[];
  selectedCupId: number | null;
  selectedSecondaryCupId: number | null;
  revealedEmptyCupIds: number[];
  showTrueBallCup: boolean;
  isPaused: boolean;
  freezeActive: boolean;
  slowMotionActive: boolean;
  extraVisionActive: boolean;
  celebrationBurstKey: number;
  onShuffleStepSound: (speedFactor: number) => void;
  onShuffleComplete: () => void;
  onSelectCup: (cupId: number) => void;
}

const MAX_CUPS = 12;

// 8 outer perimeter slots of the 3x3 grid in clockwise order around center slot 4
const PERIMETER_CW_SLOTS_3X3 = [0, 1, 2, 5, 8, 7, 6, 3];

// 4-cup 2x2 quad mini-rings and center diamond ring on the 3x3 grid (clockwise cyclic order)
const SUB_RINGS_3X3: number[][] = [
  [0, 1, 4, 3], // Top-left 2x2 quad ring
  [1, 2, 5, 4], // Top-right 2x2 quad ring
  [3, 4, 7, 6], // Bottom-left 2x2 quad ring
  [4, 5, 8, 7], // Bottom-right 2x2 quad ring
  [1, 5, 7, 3], // Center 4-cup diamond ring
];

// 10 outer perimeter slots of the 3x4 grid (Brain Breaker) in clockwise order around inner slots [4, 7]
const PERIMETER_CW_SLOTS_3X4 = [0, 1, 2, 5, 8, 11, 10, 9, 6, 3];

// Dual non-overlapping sub-rings on the 3x4 grid (Brain Breaker) for synchronized counter-rotating wheels
const DUAL_SUB_RINGS_3X4: Array<[number[], number[]]> = [
  [
    [0, 1, 2, 5, 4, 3],     // Top 6-cup ring
    [6, 7, 8, 11, 10, 9],   // Bottom 6-cup ring
  ],
  [
    [0, 1, 4, 3],           // Top-left 2x2 quad ring
    [7, 8, 11, 10],         // Bottom-right 2x2 quad ring
  ],
  [
    [1, 2, 5, 4],           // Top-right 2x2 quad ring
    [6, 7, 10, 9],          // Bottom-left 2x2 quad ring
  ],
];

// 8 outer oval ring slots of Mission Impossible & 8-cup circular/oval rings
const RING_8_CW_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];

// 10 circular ring slots of Mind Trap
const RING_10_CW_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// 4-cup Hub-and-Rim quadrant rings in Mission Impossible (including center hub slot 8 in clockwise cyclic order!)
const MISSION_IMPOSSIBLE_HUB_RINGS: number[][] = [
  [0, 1, 2, 8], // Top-right quadrant loop with center hub
  [2, 3, 4, 8], // Bottom-right quadrant loop with center hub
  [4, 5, 6, 8], // Bottom-left quadrant loop with center hub
  [6, 7, 0, 8], // Top-left quadrant loop with center hub
];

// 3-slot collinear & L-shaped passing chains on the 3x3 grid
const SNAKE_CHAINS_3X3: number[][] = [
  [1, 4, 7], // Center vertical column
  [0, 3, 6], // Left vertical column
  [2, 5, 8], // Right vertical column
  [1, 3, 6], // Top-center -> Mid-left -> Bottom-left
  [1, 5, 8], // Top-center -> Mid-right -> Bottom-right
  [0, 4, 8], // Main diagonal
  [2, 4, 6], // Anti-diagonal
  [3, 4, 5], // Middle horizontal row
];

// Figure-8 Infinity loop sequential order (12 slots around the top loop, crossing, and bottom loop)
const FIGURE8_LOOP_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Chaos Trefoil 3-petal clover lobes (4 slots per petal lobe + central roundabout connections)
const TREFOIL_PETAL_CHAINS: number[][] = [
  [0, 1, 2, 3],   // Top clover petal
  [4, 5, 6, 7],   // Bottom-left clover petal
  [8, 9, 10, 11], // Bottom-right clover petal
  [3, 7, 11],     // Inner central roundabout triangle connecting all 3 petals
];

/**
 * Wide-Gap Formation Base Slots:
 * Every formation has generous spacing between cups so there is a wide, unobstructed
 * dark floor gap between every cup silhouette and passing lanes never crowd or overlap.
 */
export function getFormationBaseSlots(
  mode: ReelChallengeMode
): Array<{ x: number; z: number; group: 'top' | 'bottom' | 'all' }> {
  // 1. BRAIN BREAKER (12 Cups Wide 3x4 Grid — Reel DgIdJcEwjXV)
  if (mode === 'brain_breaker_12') {
    const slots: Array<{ x: number; z: number; group: 'all' }> = [];
    const colSpacing = 2.82;
    const rowSpacing = 2.18;
    const rowOffsets = [-1.5 * rowSpacing, -0.5 * rowSpacing, 0.5 * rowSpacing, 1.5 * rowSpacing];
    const colOffsets = [-colSpacing, 0, colSpacing];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        slots.push({ x: colOffsets[c], z: rowOffsets[r], group: 'all' });
      }
    }
    return slots;
  }

  // 2. ORBIT RING (8 Cups Wide Circular Orbit — Reel DgJUbbThWMO)
  if (mode === 'orbit_ring_8') {
    const slots: Array<{ x: number; z: number; group: 'all' }> = [];
    const radius = 3.72;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      slots.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        group: 'all',
      });
    }
    return slots;
  }

  // 3. MIND TRAP (10 Cups Wide Circular Ring — Reel DfXezRcqEN9)
  if (mode === 'mind_trap_ring_10') {
    const slots: Array<{ x: number; z: number; group: 'all' }> = [];
    const radius = 4.12;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
      slots.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        group: 'all',
      });
    }
    return slots;
  }

  // 4. SPLIT BRAIN (6 Cups Wide Dual Top & Bottom Rows — Reel DgJ68l6HJVw)
  if (mode === 'split_brain_2x3') {
    const colSpacing = 2.92;
    const rowZ = 2.35;
    return [
      { x: -colSpacing, z: -rowZ, group: 'top' },
      { x: 0, z: -rowZ, group: 'top' },
      { x: colSpacing, z: -rowZ, group: 'top' },
      { x: -colSpacing, z: rowZ, group: 'bottom' },
      { x: 0, z: rowZ, group: 'bottom' },
      { x: colSpacing, z: rowZ, group: 'bottom' },
    ];
  }

  // 5. 8 CUPS. ONE DIE. (8 Crimson Cups in Wide Stadium Oval — Reel DeU6nw4yeSM)
  if (mode === 'crimson_die_oval_8') {
    const rx = 3.25;
    const rz = 3.95;
    const angles = [
      -Math.PI / 2,        // 0: Top Apex (where the Golden Die starts!)
      -Math.PI / 4,        // 1: Upper-Right
      0,                   // 2: Mid-Right
      Math.PI / 4,         // 3: Lower-Right
      Math.PI / 2,         // 4: Bottom Apex
      (3 * Math.PI) / 4,   // 5: Lower-Left
      Math.PI,             // 6: Mid-Left
      (-3 * Math.PI) / 4,  // 7: Upper-Left
    ];
    return angles.map((a) => ({
      x: Math.cos(a) * rx,
      z: Math.sin(a) * rz,
      group: 'all' as const,
    }));
  }

  // 6. MISSION IMPOSSIBLE (8 Outer Oval Ring Cups + 1 Center Hub Cup — Reel Df0w2I2Ma2j)
  if (mode === 'mission_impossible_9') {
    const rx = 3.45;
    const rz = 3.95;
    const slots: Array<{ x: number; z: number; group: 'all' }> = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      slots.push({
        x: Math.cos(angle) * rx,
        z: Math.sin(angle) * rz,
        group: 'all',
      });
    }
    // Slot 8 is the Center Hub Cup (0, 0)
    slots.push({ x: 0, z: 0, group: 'all' });
    return slots;
  }

  // 7. FOLLOW THE GOLD: FIGURE-8 INFINITY TRACK (12 Cups on Hourglass Infinity Loop — Reel DfLSUkHvDeD)
  if (mode === 'infinity_figure8_12') {
    return [
      { x: -0.95, z: -3.95, group: 'all' }, // 0: Top-left crown
      { x: 1.55, z: -3.65, group: 'all' },  // 1: Top-right crown (Gold start)
      { x: 2.95, z: -2.25, group: 'all' },  // 2: Upper-right outer arc
      { x: 1.45, z: -0.95, group: 'all' },  // 3: Upper-right inner waist
      { x: 0.0, z: 0.0, group: 'all' },     // 4: Center X-crossing hub
      { x: -1.45, z: 0.95, group: 'all' },  // 5: Lower-left inner waist
      { x: -2.95, z: 2.35, group: 'all' },  // 6: Lower-left outer arc
      { x: -1.65, z: 3.75, group: 'all' },  // 7: Bottom-left base
      { x: 0.85, z: 3.95, group: 'all' },   // 8: Bottom-right base
      { x: 2.95, z: 2.65, group: 'all' },   // 9: Lower-right outer arc
      { x: 2.25, z: 1.15, group: 'all' },   // 10: Lower-right inner waist
      { x: -2.45, z: -1.75, group: 'all' }, // 11: Upper-left outer arc
    ];
  }

  // 8. CHAOS MODE: 3-PETAL CLOVER TREFOIL TRACK (12 Cups on 3-Lobe Clover — Reel DfpCaSfMD1v)
  if (mode === 'chaos_trefoil_12') {
    const slots: Array<{ x: number; z: number; group: 'all' }> = [];
    const lobeAngles = [-Math.PI / 2, (5 * Math.PI) / 6, Math.PI / 6];
    for (let lobe = 0; lobe < 3; lobe++) {
      const theta = lobeAngles[lobe];
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const px = -sinT;
      const pz = cosT;

      const localNodes = [
        { forward: 4.15, side: 0.0 },   // Outer tip of petal
        { forward: 2.95, side: 1.28 },  // Right arc of petal
        { forward: 2.65, side: -1.28 }, // Left arc of petal
        { forward: 1.42, side: 0.0 },   // Inner roundabout neck
      ];
      for (const n of localNodes) {
        slots.push({
          x: cosT * n.forward + px * n.side,
          z: sinT * n.forward + pz * n.side,
          group: 'all',
        });
      }
    }
    return slots;
  }

  // 9. CLASSIC 3x3 GRID (9 Cups with Wide Visibility Gaps — Reel DfcZtTayh_9 & DfRJyp0Pir4)
  const spX = 2.72;
  const spZ = 2.54;
  return [
    { x: -spX, z: -spZ, group: 'all' },
    { x: 0, z: -spZ, group: 'all' },
    { x: spX, z: -spZ, group: 'all' },
    { x: -spX, z: 0, group: 'all' },
    { x: 0, z: 0, group: 'all' },
    { x: spX, z: 0, group: 'all' },
    { x: -spX, z: spZ, group: 'all' },
    { x: 0, z: spZ, group: 'all' },
    { x: spX, z: spZ, group: 'all' },
  ];
}

// Procedural @spotquest & @sight.twist Cup Wall Textures
function createCupSkinTexture(skin: CupPatternSkin, baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const topColor =
    skin === 'crimson_gloss'
      ? '#dc2626'
      : skin === 'emerald_mirror'
      ? '#059669'
      : baseHex;
  const bottomDarkColor =
    skin === 'crimson_gloss'
      ? '#450a0a'
      : skin === 'emerald_mirror'
      ? '#022c22'
      : '#053b38';

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, topColor);
  bgGrad.addColorStop(0.55, topColor);
  bgGrad.addColorStop(1, bottomDarkColor);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Signature left-side vertical specular sheen highlight
  const sheenGrad = ctx.createLinearGradient(0, 0, 512, 0);
  if (skin === 'crimson_gloss') {
    sheenGrad.addColorStop(0.0, 'rgba(255,255,255,0.0)');
    sheenGrad.addColorStop(0.20, 'rgba(254,202,202,0.08)');
    sheenGrad.addColorStop(0.28, 'rgba(254,226,226,0.58)');
    sheenGrad.addColorStop(0.32, 'rgba(255,255,255,0.78)');
    sheenGrad.addColorStop(0.37, 'rgba(248,113,113,0.35)');
    sheenGrad.addColorStop(0.58, 'rgba(0,0,0,0.22)');
    sheenGrad.addColorStop(0.86, 'rgba(0,0,0,0.42)');
    sheenGrad.addColorStop(1.0, 'rgba(255,255,255,0.05)');
  } else {
    sheenGrad.addColorStop(0.0, 'rgba(255,255,255,0.0)');
    sheenGrad.addColorStop(0.18, 'rgba(255,255,255,0.05)');
    sheenGrad.addColorStop(0.26, 'rgba(167,243,208,0.54)');
    sheenGrad.addColorStop(0.31, 'rgba(255,255,255,0.82)');
    sheenGrad.addColorStop(0.36, 'rgba(167,243,208,0.36)');
    sheenGrad.addColorStop(0.54, 'rgba(0,0,0,0.18)');
    sheenGrad.addColorStop(0.84, 'rgba(0,0,0,0.38)');
    sheenGrad.addColorStop(1.0, 'rgba(255,255,255,0.06)');
  }

  if (skin === 'vertical_stripes') {
    const stripeCount = 14;
    const stripeW = 512 / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? baseHex : '#f1f5f9';
      ctx.fillRect(i * stripeW, 24, stripeW + 1, 464);
    }
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, 512, 512);
  } else if (skin === 'zigzag_chevron') {
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, 512, 512);

    const drawZigZagBand = (centerY: number, amplitude: number, lineW: number) => {
      const peaks = 10;
      const stepX = 512 / (peaks * 2);
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= peaks * 2; i++) {
        const x = i * stepX;
        const y = centerY + (i % 2 === 0 ? -amplitude : amplitude);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = lineW;
      ctx.lineJoin = 'miter';
      ctx.stroke();
      ctx.restore();
    };

    drawZigZagBand(230, 26, 15);
    drawZigZagBand(335, 24, 13);
  } else if (skin === 'collar_band') {
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, 512, 512);

    const collarGrad = ctx.createLinearGradient(0, 55, 512, 55);
    collarGrad.addColorStop(0, '#cbd5e1');
    collarGrad.addColorStop(0.32, '#ffffff');
    collarGrad.addColorStop(0.65, '#94a3b8');
    collarGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = collarGrad;
    ctx.fillRect(0, 38, 512, 62);
  } else {
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, 512, 512);
  }

  // Crisp bottom lip crescent
  ctx.fillStyle = skin === 'crimson_gloss' ? '#fca5a5' : '#ccfbf1';
  ctx.fillRect(0, 494, 512, 18);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Create 6 Procedural Golden Die Face Textures (Pips 1..6) for Reel DeU6nw4yeSM ("8 CUPS. ONE DIE.")
function createGoldenDieFaceTextures(): THREE.CanvasTexture[] {
  const pipLayouts: Record<number, Array<[number, number]>> = {
    1: [[128, 128]],
    2: [
      [72, 72],
      [184, 184],
    ],
    3: [
      [68, 68],
      [128, 128],
      [188, 188],
    ],
    4: [
      [72, 72],
      [184, 72],
      [72, 184],
      [184, 184],
    ],
    5: [
      [68, 68],
      [188, 68],
      [128, 128],
      [68, 188],
      [188, 188],
    ],
    6: [
      [72, 64],
      [184, 64],
      [72, 128],
      [184, 128],
      [72, 192],
      [184, 192],
    ],
  };

  return [1, 2, 3, 4, 5, 6].map((faceNum) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.35, '#fbbf24');
    grad.addColorStop(0.75, '#d97706');
    grad.addColorStop(1, '#92400e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(254, 249, 195, 0.75)';
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, 240, 240);

    for (const [px, py] of pipLayouts[faceNum]) {
      ctx.beginPath();
      ctx.arc(px, py, 21, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

// Create a premium camera-facing gold-rimmed circular medallion texture for cup numbers (1..12)
function createPremiumNumberBadgeTexture(num: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 256);

  const halo = ctx.createRadialGradient(128, 128, 80, 128, 128, 126);
  halo.addColorStop(0, 'rgba(251, 191, 36, 0.36)');
  halo.addColorStop(0.65, 'rgba(251, 191, 36, 0.12)');
  halo.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  const bgGrad = ctx.createRadialGradient(108, 92, 16, 128, 128, 96);
  bgGrad.addColorStop(0, '#0c3b45');
  bgGrad.addColorStop(0.65, '#041d24');
  bgGrad.addColorStop(1, '#020e12');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(128, 128, 92, 0, Math.PI * 2);
  ctx.fill();

  const rimGrad = ctx.createLinearGradient(36, 36, 220, 220);
  rimGrad.addColorStop(0, '#fef08a');
  rimGrad.addColorStop(0.32, '#f59e0b');
  rimGrad.addColorStop(0.65, '#fde047');
  rimGrad.addColorStop(1, '#b45309');
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 92, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(128, 128, 79, 0, Math.PI * 2);
  ctx.stroke();

  const sheen = ctx.createLinearGradient(128, 42, 128, 126);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(128, 78, 56, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '900 104px Inter, system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#fffbeb';
  ctx.fillText(String(num), 128, 133);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Create a luxury radial-brushed obsidian studio tabletop texture with fine gold inlay rings
function createStudioTableTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  const cx = 512;
  const cy = 512;

  const baseGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 512);
  baseGrad.addColorStop(0, '#c8d8dc');
  baseGrad.addColorStop(0.32, '#96aeb5');
  baseGrad.addColorStop(0.65, '#597178');
  baseGrad.addColorStop(0.9, '#2b3d42');
  baseGrad.addColorStop(1, '#182428');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.028)' : 'rgba(0,0,0,0.032)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48);
    ctx.lineTo(Math.cos(a) * 500, Math.sin(a) * 500);
    ctx.stroke();
  }
  ctx.restore();

  const ringSpecs = [
    { r: 162, w: 2.0, alpha: 0.24 },
    { r: 248, w: 1.5, alpha: 0.16 },
    { r: 342, w: 2.8, alpha: 0.34 },
    { r: 356, w: 1.2, alpha: 0.20 },
  ];
  for (const ring of ringSpecs) {
    ctx.strokeStyle = `rgba(251, 191, 36, ${ring.alpha})`;
    ctx.lineWidth = ring.w;
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(253, 224, 71, 0.32)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const inner = i % 6 === 0 ? 330 : 336;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * 342, cy + Math.sin(a) * 342);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Compute frozen, natural visual reading order (top-to-bottom rows, left-to-right) once cups stop moving
function computeVisualCupOrdering(
  cupWorldPos: Array<{ x: number; z: number }>,
  cupCount: number
): { displayNumByCup: number[]; orderedCupIds: number[] } {
  const items = Array.from({ length: cupCount }, (_, cupId) => ({
    cupId,
    x: cupWorldPos[cupId]?.x ?? 0,
    z: cupWorldPos[cupId]?.z ?? 0,
  }));

  items.sort((a, b) => a.z - b.z);
  const rows: Array<typeof items> = [];
  const ROW_Z_THRESHOLD = 0.85;
  for (const item of items) {
    const lastRow = rows[rows.length - 1];
    if (lastRow && Math.abs(item.z - lastRow[0].z) <= ROW_Z_THRESHOLD) {
      lastRow.push(item);
    } else {
      rows.push([item]);
    }
  }

  const orderedCupIds: number[] = [];
  for (const row of rows) {
    row.sort((a, b) => a.x - b.x);
    for (const item of row) {
      orderedCupIds.push(item.cupId);
    }
  }

  const displayNumByCup = Array.from({ length: MAX_CUPS }, (_, i) => i + 1);
  orderedCupIds.forEach((cupId, idx) => {
    displayNumByCup[cupId] = idx + 1;
  });

  return { displayNumByCup, orderedCupIds };
}

function createRadialGlowTexture(hexColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  grad.addColorStop(0, hexColor);
  grad.addColorStop(0.35, `${hexColor}88`);
  grad.addColorStop(0.7, `${hexColor}22`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Evaluate a unified closed Polar-Spline Ring Carousel point so EVERY cup on `ringSlots`
 * travels along the exact same continuous perimeter rail without ever switching chords or crossing radii.
 * Guarantees 100% machine-precision agreement with `fromSlot` at eT = 0 and `toSlot` at eT = 1.
 */
function evaluateUnifiedRingCarouselPoint(
  ringSlots: number[],
  fromRingIdx: number,
  deltaSteps: number,
  roundnessBlend: number,
  eT: number,
  getSlotCoord: (slotIdx: number) => { x: number; z: number }
): { x: number; z: number; angle: number } {
  const m = ringSlots.length;
  const coords = ringSlots.map((s) => getSlotCoord(s));

  let cx = 0;
  let cz = 0;
  for (let k = 0; k < m; k++) {
    cx += coords[k].x;
    cz += coords[k].z;
  }
  cx /= m;
  cz /= m;

  const radii: number[] = new Array(m);
  const rawAngles: number[] = new Array(m);
  let sumR = 0;
  for (let k = 0; k < m; k++) {
    const dx = coords[k].x - cx;
    const dz = coords[k].z - cz;
    const r = Math.hypot(dx, dz);
    radii[k] = r;
    sumR += r;
    rawAngles[k] = Math.atan2(dz, dx);
  }
  const avgR = sumR / m;

  // Unwrap angles around the closed ring so [0 .. m] is strictly monotonic
  const unwrappedAngles: number[] = new Array(m + 1);
  unwrappedAngles[0] = rawAngles[0];
  for (let k = 1; k <= m; k++) {
    const a = rawAngles[k % m];
    let diff = a - unwrappedAngles[k - 1];
    while (diff <= -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    unwrappedAngles[k] = unwrappedAngles[k - 1] + diff;
  }

  const u = fromRingIdx + deltaSteps * eT;
  const uMod = ((u % m) + m) % m;
  const idx0 = Math.min(m - 1, Math.floor(uMod));
  const f = uMod - idx0;

  // Smooth C1 periodic Catmull-Rom radius interpolation along the shared ring curve
  const rPrev = radii[(idx0 - 1 + m) % m];
  const rCurr = radii[idx0];
  const rNext = radii[(idx0 + 1) % m];
  const rNext2 = radii[(idx0 + 2) % m];
  const f2 = f * f;
  const f3 = f2 * f;
  const rBase =
    0.5 *
    (2 * rCurr +
      (-rPrev + rNext) * f +
      (2 * rPrev - 5 * rCurr + 4 * rNext - rNext2) * f2 +
      (-rPrev + 3 * rCurr - 3 * rNext + rNext2) * f3);

  // Smoothly flex polygonal grid rings toward a rounded wheel mid-spin while keeping t=0 and t=1 exact
  const flexAlpha = Math.sin(Math.PI * Math.max(0, Math.min(1, eT))) * roundnessBlend;
  const rFinal = (1 - flexAlpha) * rBase + flexAlpha * avgR;

  // Smooth periodic angle interpolation along the ring
  const aPrev = idx0 === 0 ? unwrappedAngles[m - 1] - (unwrappedAngles[m] - unwrappedAngles[0]) : unwrappedAngles[idx0 - 1];
  const aCurr = unwrappedAngles[idx0];
  const aNext = unwrappedAngles[idx0 + 1];
  const aNext2 =
    idx0 + 2 <= m
      ? unwrappedAngles[idx0 + 2]
      : unwrappedAngles[1] + (unwrappedAngles[m] - unwrappedAngles[0]);
  const angleFinal =
    0.5 *
    (2 * aCurr +
      (-aPrev + aNext) * f +
      (2 * aPrev - 5 * aCurr + 4 * aNext - aNext2) * f2 +
      (-aPrev + 3 * aCurr - 3 * aNext + aNext2) * f3);

  return {
    x: cx + rFinal * Math.cos(angleFinal),
    z: cz + rFinal * Math.sin(angleFinal),
    angle: angleFinal,
  };
}

/**
 * Compute a wide, guaranteed non-overlapping lateral passing lane offset (in world units)
 * when two cups revolve around their shared midpoint in a 180° elliptical turntable orbit.
 */
function computeWidePassLaneOffset(
  c1: { x: number; z: number },
  c2: { x: number; z: number },
  directionSign: 1 | -1
): number {
  const dist = Math.hypot(c2.x - c1.x, c2.z - c1.z);
  const mag = Math.max(1.22, Math.min(1.72, dist * 0.44));
  return mag * directionSign;
}

/**
 * Helper to append a natural unified Ring Carousel Rotation wave for any cyclic ring of slots
 */
function appendRingCarouselTrajectories(
  ringSlots: number[],
  shiftSteps: number,
  roundnessBlend: number,
  cupAtSlot: number[],
  currentSlotOfCup: number[],
  trajectories: SpotQuestMoveTrajectory[]
): void {
  const m = ringSlots.length;
  const movedCups = ringSlots.map((s) => cupAtSlot[s]);

  for (let idx = 0; idx < m; idx++) {
    const fromSlot = ringSlots[idx];
    const nextIdx = (((idx + shiftSteps) % m) + m) % m;
    const toSlot = ringSlots[nextIdx];
    const cupId = movedCups[idx];

    trajectories.push({
      kind: 'RING_CAROUSEL_ROTATION',
      cupId,
      fromSlot,
      toSlot,
      ringSlots,
      fromRingIdx: idx,
      deltaSteps: shiftSteps,
      roundnessBlend,
    });

    currentSlotOfCup[cupId] = toSlot;
    cupAtSlot[toSlot] = cupId;
  }
}

// Build the Choreography Plan with natural continuous ring rotations, sub-ring carousels, curved ring-arc weaves, and 180° elliptical turntable orbits
function buildSpotQuestChoreographyPlan(
  cfg: GoldBallLevelConfig,
  initialSlotsByCup: number[],
  ballCupId: number,
  secondaryBallCupId: number | null,
  decoyCupIds: number[]
): ShuffleWaveStep[] {
  const cupCount = cfg.cupCount;
  const currentSlotOfCup = initialSlotsByCup.slice(0, cupCount);
  const cupAtSlot = new Array(cupCount).fill(0).map((_, slot) => currentSlotOfCup.indexOf(slot));
  const baseSlots = getFormationBaseSlots(cfg.reelMode);

  const areNeighbors3x3 = (s1: number, s2: number) => {
    const r1 = Math.floor(s1 / 3);
    const c1 = s1 % 3;
    const r2 = Math.floor(s2 / 3);
    const c2 = s2 % 3;
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1 && s1 !== s2;
  };

  const plan: ShuffleWaveStep[] = [];
  const totalSteps = cfg.shuffleSteps;

  for (let step = 0; step < totalSteps; step++) {
    const progressRatio = totalSteps > 1 ? step / (totalSteps - 1) : 1;
    // Fluid accelerando with near-zero micro-pause so waves blend naturally
    const durationScale = 1.16 - progressRatio * 0.32;
    const holdPauseSec = Math.max(0.005, 0.016 - progressRatio * 0.009);

    // -------------------------------------------------------------------------
    // 1. SPLIT BRAIN MODE (Reel DgJ68l6HJVw: 3 Top + 3 Bottom Simultaneous Orbits & Oval Carousels)
    // -------------------------------------------------------------------------
    if (cfg.reelMode === 'split_brain_2x3') {
      const topSlots = [0, 1, 2];
      const botSlots = [3, 4, 5];

      // Every 3rd step: full 3-cup oval conveyor stream on both top and bottom rows simultaneously!
      if (step % 3 === 1) {
        const topDir = step % 2 === 0 ? 1 : -1;
        const botDir = -topDir;
        const [t0, t1, t2] = topDir > 0 ? topSlots : [2, 1, 0];
        const [b0, b1, b2] = botDir > 0 ? botSlots : [5, 4, 3];
        const cT0 = cupAtSlot[t0];
        const cT1 = cupAtSlot[t1];
        const cT2 = cupAtSlot[t2];
        const cB0 = cupAtSlot[b0];
        const cB1 = cupAtSlot[b1];
        const cB2 = cupAtSlot[b2];

        const trajectories: SpotQuestMoveTrajectory[] = [
          { kind: 'PASS_BY_LANE', cupId: cT0, fromSlot: t0, toSlot: t1, laneOffsetWorld: 0.48 * topDir, leadLagBias: 0.03, isFeint: false, peekDecoyLift: false },
          { kind: 'PASS_BY_LANE', cupId: cT1, fromSlot: t1, toSlot: t2, laneOffsetWorld: 0.48 * topDir, leadLagBias: 0.03, isFeint: false, peekDecoyLift: false },
          { kind: 'PASS_BY_LANE', cupId: cT2, fromSlot: t2, toSlot: t0, laneOffsetWorld: 1.45 * topDir, leadLagBias: -0.03, isFeint: false, peekDecoyLift: false },
          { kind: 'PASS_BY_LANE', cupId: cB0, fromSlot: b0, toSlot: b1, laneOffsetWorld: 0.48 * botDir, leadLagBias: 0.03, isFeint: false, peekDecoyLift: false },
          { kind: 'PASS_BY_LANE', cupId: cB1, fromSlot: b1, toSlot: b2, laneOffsetWorld: 0.48 * botDir, leadLagBias: 0.03, isFeint: false, peekDecoyLift: false },
          { kind: 'PASS_BY_LANE', cupId: cB2, fromSlot: b2, toSlot: b0, laneOffsetWorld: 1.45 * botDir, leadLagBias: -0.03, isFeint: false, peekDecoyLift: false },
        ];

        currentSlotOfCup[cT0] = t1;
        currentSlotOfCup[cT1] = t2;
        currentSlotOfCup[cT2] = t0;
        cupAtSlot[t1] = cT0;
        cupAtSlot[t2] = cT1;
        cupAtSlot[t0] = cT2;

        currentSlotOfCup[cB0] = b1;
        currentSlotOfCup[cB1] = b2;
        currentSlotOfCup[cB2] = b0;
        cupAtSlot[b1] = cB0;
        cupAtSlot[b2] = cB1;
        cupAtSlot[b0] = cB2;

        plan.push({ trajectories, durationScale: durationScale * 1.14, holdPauseSec: 0.006 });
        continue;
      }

      const t1 = topSlots[Math.floor(Math.random() * 3)];
      const tPool = topSlots.filter((s) => s !== t1);
      const t2 = tPool[Math.floor(Math.random() * tPool.length)];
      const topFeint = cfg.hasMidShuffleFeints && step % 4 === 2;

      const b1 = botSlots[Math.floor(Math.random() * 3)];
      const bPool = botSlots.filter((s) => s !== b1);
      const b2 = bPool[Math.floor(Math.random() * bPool.length)];
      const botFeint = cfg.hasMidShuffleFeints && step % 5 === 3;

      const cT1 = cupAtSlot[t1];
      const cT2 = cupAtSlot[t2];
      const cB1 = cupAtSlot[b1];
      const cB2 = cupAtSlot[b2];

      const topLane = computeWidePassLaneOffset(baseSlots[t1], baseSlots[t2], step % 2 === 0 ? 1 : -1);
      const botLane = computeWidePassLaneOffset(baseSlots[b1], baseSlots[b2], step % 2 === 0 ? -1 : 1);

      const trajectories: SpotQuestMoveTrajectory[] = [
        {
          kind: 'PASS_BY_LANE',
          cupId: cT1,
          fromSlot: t1,
          toSlot: t2,
          laneOffsetWorld: topLane,
          leadLagBias: 0.03,
          isFeint: topFeint,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: cT2,
          fromSlot: t2,
          toSlot: t1,
          laneOffsetWorld: topLane,
          leadLagBias: -0.03,
          isFeint: topFeint,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: cB1,
          fromSlot: b1,
          toSlot: b2,
          laneOffsetWorld: botLane,
          leadLagBias: 0.03,
          isFeint: botFeint,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: cB2,
          fromSlot: b2,
          toSlot: b1,
          laneOffsetWorld: botLane,
          leadLagBias: -0.03,
          isFeint: botFeint,
          peekDecoyLift: false,
        },
      ];

      if (!topFeint) {
        currentSlotOfCup[cT1] = t2;
        currentSlotOfCup[cT2] = t1;
        cupAtSlot[t1] = cT2;
        cupAtSlot[t2] = cT1;
      }
      if (!botFeint) {
        currentSlotOfCup[cB1] = b2;
        currentSlotOfCup[cB2] = b1;
        cupAtSlot[b1] = cB2;
        cupAtSlot[b2] = cB1;
      }

      plan.push({ trajectories, durationScale, holdPauseSec });
      continue;
    }

    // -------------------------------------------------------------------------
    // 2. FIGURE-8 INFINITY LOOP SPLINE GLIDE (Reel DfLSUkHvDeD — 12 Cups)
    // -------------------------------------------------------------------------
    if (cfg.reelMode === 'infinity_figure8_12' && step % 3 !== 2) {
      const shiftOptions = [1, 2, -1, 1, -2, 2];
      const shift = shiftOptions[step % shiftOptions.length];
      const trajectories: SpotQuestMoveTrajectory[] = [];
      const newCupAtSlot = [...cupAtSlot];

      for (let idx = 0; idx < 12; idx++) {
        const fromSlot = FIGURE8_LOOP_ORDER[idx];
        const toSlot = FIGURE8_LOOP_ORDER[(idx + shift + 12) % 12];
        const cupId = cupAtSlot[fromSlot];
        trajectories.push({
          kind: 'TRACK_SPLINE_GLIDE',
          cupId,
          fromSlot,
          toSlot,
          trackKind: 'figure8',
          chainIndex: 0,
          fromNodeIdx: idx,
          deltaSteps: shift,
          totalNodes: 12,
        });
        currentSlotOfCup[cupId] = toSlot;
        newCupAtSlot[toSlot] = cupId;
      }
      for (let s = 0; s < 12; s++) cupAtSlot[s] = newCupAtSlot[s];
      plan.push({
        trajectories,
        durationScale: durationScale * (Math.abs(shift) > 1 ? 1.42 : 1.12),
        holdPauseSec: 0.004,
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // 3. CHAOS MODE 3-PETAL CLOVER SPLINE GLIDE (Reel DfpCaSfMD1v — 12 Cups)
    // -------------------------------------------------------------------------
    if (cfg.reelMode === 'chaos_trefoil_12' && step % 4 !== 3) {
      const ballSlot = currentSlotOfCup[ballCupId];
      const useCenterTriangle = step % 3 === 1 && TREFOIL_PETAL_CHAINS[3].includes(ballSlot);
      const chainIndex = useCenterTriangle
        ? 3
        : (() => {
            const idx = TREFOIL_PETAL_CHAINS.slice(0, 3).findIndex((ch) => ch.includes(ballSlot));
            return idx >= 0 ? idx : step % 3;
          })();
      const activeChain = TREFOIL_PETAL_CHAINS[chainIndex];
      const deltaSteps = step % 4 === 2 ? -1 : 1;
      const n = activeChain.length;
      const trajectories: SpotQuestMoveTrajectory[] = [];
      const movedCups = activeChain.map((s) => cupAtSlot[s]);

      for (let i = 0; i < n; i++) {
        const fromSlot = activeChain[i];
        const toSlot = activeChain[(i + deltaSteps + n) % n];
        const cupId = movedCups[i];
        trajectories.push({
          kind: 'TRACK_SPLINE_GLIDE',
          cupId,
          fromSlot,
          toSlot,
          trackKind: 'trefoil',
          chainIndex,
          fromNodeIdx: i,
          deltaSteps,
          totalNodes: n,
        });
        currentSlotOfCup[cupId] = toSlot;
        cupAtSlot[toSlot] = cupId;
      }

      // Rotate all 3 clover petals simultaneously in alternating directions for signature @spotquestt Clover energy
      if (chainIndex < 3) {
        for (let offset = 1; offset <= 2; offset++) {
          if (offset === 2 && cfg.simultaneousSwaps < 2) break;
          const otherIdx = (chainIndex + offset) % 3;
          const otherChain = TREFOIL_PETAL_CHAINS[otherIdx];
          const otherDelta = offset === 1 ? -deltaSteps : deltaSteps;
          const otherCups = otherChain.map((s) => cupAtSlot[s]);
          for (let i = 0; i < otherChain.length; i++) {
            const fromSlot = otherChain[i];
            const toSlot = otherChain[(i + otherDelta + otherChain.length) % otherChain.length];
            const cupId = otherCups[i];
            trajectories.push({
              kind: 'TRACK_SPLINE_GLIDE',
              cupId,
              fromSlot,
              toSlot,
              trackKind: 'trefoil',
              chainIndex: otherIdx,
              fromNodeIdx: i,
              deltaSteps: otherDelta,
              totalNodes: otherChain.length,
            });
            currentSlotOfCup[cupId] = toSlot;
            cupAtSlot[toSlot] = cupId;
          }
        }
      }

      plan.push({ trajectories, durationScale: durationScale * 1.15, holdPauseSec: 0.004 });
      continue;
    }

    // -------------------------------------------------------------------------
    // 4. DEDICATED CIRCULAR & OVAL RING MODES:
    //    `orbit_ring_8`, `mind_trap_ring_10`, `crimson_die_oval_8`, `mission_impossible_9`
    //    -> Natural Continuous Ring Rotations & Curved Concentric Ring-Arc Weaves (NO chord switching!)
    // -------------------------------------------------------------------------
    const isOrbit8 = cfg.reelMode === 'orbit_ring_8' && cupCount === 8;
    const isMindTrap10 = cfg.reelMode === 'mind_trap_ring_10' && cupCount === 10;
    const isCrimsonOval8 = cfg.reelMode === 'crimson_die_oval_8' && cupCount === 8;
    const isMissionImpossible9 = cfg.reelMode === 'mission_impossible_9' && cupCount === 9;

    if (isOrbit8 || isMindTrap10 || isCrimsonOval8 || isMissionImpossible9) {
      const ringSlots = isMindTrap10 ? RING_10_CW_SLOTS : RING_8_CW_SLOTS;
      const ringLen = ringSlots.length;
      const trajectories: SpotQuestMoveTrajectory[] = [];

      // Case 4A: Mission Impossible 4-Cup Hub-and-Rim Sub-Ring Carousel Rotation (every 3rd step)
      // Smoothly rotates the center hub cup (slot 8) and 3 outer ring cups in a continuous 4-cup circular loop!
      if (isMissionImpossible9 && step % 3 === 0) {
        const ballSlot = currentSlotOfCup[ballCupId];
        const matchingHubRings = MISSION_IMPOSSIBLE_HUB_RINGS.filter((r) => r.includes(ballSlot));
        const hubRing =
          matchingHubRings.length > 0
            ? matchingHubRings[step % matchingHubRings.length]
            : MISSION_IMPOSSIBLE_HUB_RINGS[step % MISSION_IMPOSSIBLE_HUB_RINGS.length];
        const shift = step % 2 === 0 ? 1 : -1;
        appendRingCarouselTrajectories(hubRing, shift, 0.52, cupAtSlot, currentSlotOfCup, trajectories);
        plan.push({
          trajectories,
          durationScale: durationScale * 1.15,
          holdPauseSec: 0.005,
        });
        continue;
      }

      // Case 4B: Full-Ring Unified Carousel Rotation (50% of steps in ring modes)
      // All 8 or 10 cups glide around the exact circular/oval perimeter track in lockstep!
      if (step % 2 === 0) {
        const shiftOptions = [2, -1, 1, -2, 3, -2];
        const shiftSteps = shiftOptions[step % shiftOptions.length];
        appendRingCarouselTrajectories(ringSlots, shiftSteps, 0.0, cupAtSlot, currentSlotOfCup, trajectories);
        plan.push({
          trajectories,
          durationScale: Math.max(1.08, durationScale * (Math.abs(shiftSteps) >= 3 ? 1.44 : Math.abs(shiftSteps) === 2 ? 1.24 : 1.06)),
          holdPauseSec: 0.004,
        });
        continue;
      }

      // Case 4C: Curved Concentric Ring-Arc Weaves (`RING_ARC_SWAP`) along the ring circumference!
      // Pairs of adjacent or near cups overtake each other along concentric inner/outer circular arcs following the ring curve!
      const usedRingIndices = new Set<number>();
      const maxPairs = cfg.simultaneousSwaps >= 2 ? 2 : 1;
      const ballSlot = currentSlotOfCup[ballCupId];
      const ballRingIdx = ringSlots.indexOf(ballSlot);

      for (let p = 0; p < maxPairs; p++) {
        let idx1 = -1;
        if (p === 0 && ballRingIdx >= 0 && !usedRingIndices.has(ballRingIdx)) {
          idx1 = ballRingIdx;
        } else {
          const available = Array.from({ length: ringLen }, (_, i) => i).filter((i) => !usedRingIndices.has(i));
          if (available.length < 2) break;
          idx1 = available[Math.floor(Math.random() * available.length)];
        }

        // Pick a neighbor 1 or 2 steps away along the ring circumference so the weave follows the ring arc naturally
        const stepOffsets = [1, -1, 2, -2];
        const validOffsets = stepOffsets.filter((off) => {
          const targetIdx = (idx1 + off + ringLen) % ringLen;
          if (usedRingIndices.has(targetIdx)) return false;
          // If step is ±2, also ensure the intermediate slot isn't colliding with another pair
          if (Math.abs(off) === 2) {
            const midIdx = (idx1 + Math.sign(off) + ringLen) % ringLen;
            if (usedRingIndices.has(midIdx)) return false;
          }
          return true;
        });

        if (validOffsets.length === 0) continue;
        const deltaSteps = validOffsets[Math.floor(Math.random() * validOffsets.length)];
        const idx2 = (idx1 + deltaSteps + ringLen) % ringLen;

        usedRingIndices.add(idx1);
        usedRingIndices.add(idx2);
        if (Math.abs(deltaSteps) === 2) {
          usedRingIndices.add((idx1 + Math.sign(deltaSteps) + ringLen) % ringLen);
        }

        const slot1 = ringSlots[idx1];
        const slot2 = ringSlots[idx2];
        const cup1 = cupAtSlot[slot1];
        const cup2 = cupAtSlot[slot2];

        const isFeint = cfg.hasMidShuffleFeints && p > 0 && step % 4 === 3;
        const peekDecoy1 = cfg.decoyBallsCount > 0 && decoyCupIds.includes(cup1) && step % 3 === 1;
        const peekDecoy2 = cfg.decoyBallsCount > 0 && decoyCupIds.includes(cup2) && step % 3 === 1;
        const radialMag = Math.abs(deltaSteps) === 2 ? 0.72 : 0.62;
        const radialSign = (step + p) % 2 === 0 ? 1 : -1;

        trajectories.push({
          kind: 'RING_ARC_SWAP',
          cupId: cup1,
          fromSlot: slot1,
          toSlot: slot2,
          ringSlots,
          fromRingIdx: idx1,
          deltaSteps,
          radialLaneOffset: radialMag * radialSign,
          isFeint,
          peekDecoyLift: peekDecoy1,
        });
        trajectories.push({
          kind: 'RING_ARC_SWAP',
          cupId: cup2,
          fromSlot: slot2,
          toSlot: slot1,
          ringSlots,
          fromRingIdx: idx2,
          deltaSteps: -deltaSteps,
          radialLaneOffset: -radialMag * radialSign,
          isFeint,
          peekDecoyLift: peekDecoy2,
        });

        if (!isFeint) {
          currentSlotOfCup[cup1] = slot2;
          currentSlotOfCup[cup2] = slot1;
          cupAtSlot[slot2] = cup1;
          cupAtSlot[slot1] = cup2;
        }
      }

      if (trajectories.length > 0) {
        plan.push({
          trajectories,
          durationScale: durationScale * 1.12,
          holdPauseSec: 0.005,
        });
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // 5. BRAIN BREAKER 3x4 GRID (12 Cups):
    //    10-Cup Outer Perimeter Ring Carousel + Dual Counter-Rotating 6-Cup / 2x2 Sub-Rings
    // -------------------------------------------------------------------------
    const isBrainBreaker12 = cfg.reelMode === 'brain_breaker_12' && cupCount === 12;
    if (isBrainBreaker12 && step % 2 === 1) {
      const trajectories: SpotQuestMoveTrajectory[] = [];

      if (step % 4 === 1) {
        // Full 10-cup outer perimeter carousel rotation + simultaneous 180° inner hub turntable orbit on slots [4, 7]!
        const shiftOptions = [2, -1, 1, -2];
        const shift = shiftOptions[Math.floor(step / 4) % shiftOptions.length];
        appendRingCarouselTrajectories(
          PERIMETER_CW_SLOTS_3X4,
          shift,
          0.62,
          cupAtSlot,
          currentSlotOfCup,
          trajectories
        );

        // Simultaneously orbit the two inner column hub cups (slots 4 and 7) around each other
        const c4 = cupAtSlot[4];
        const c7 = cupAtSlot[7];
        const innerLane = computeWidePassLaneOffset(baseSlots[4], baseSlots[7], shift > 0 ? 1 : -1);
        trajectories.push(
          {
            kind: 'PASS_BY_LANE',
            cupId: c4,
            fromSlot: 4,
            toSlot: 7,
            laneOffsetWorld: innerLane,
            leadLagBias: 0.02,
            isFeint: false,
            peekDecoyLift: false,
          },
          {
            kind: 'PASS_BY_LANE',
            cupId: c7,
            fromSlot: 7,
            toSlot: 4,
            laneOffsetWorld: innerLane,
            leadLagBias: -0.02,
            isFeint: false,
            peekDecoyLift: false,
          }
        );
        currentSlotOfCup[c4] = 7;
        currentSlotOfCup[c7] = 4;
        cupAtSlot[7] = c4;
        cupAtSlot[4] = c7;

        plan.push({
          trajectories,
          durationScale: durationScale * (Math.abs(shift) > 1 ? 1.34 : 1.16),
          holdPauseSec: 0.005,
        });
        continue;
      } else {
        // Dual Simultaneous Counter-Rotating Sub-Rings (Top & Bottom 6-Cup Rings or Diagonal 2x2 Quads)
        const pairIdx = Math.floor(step / 2) % DUAL_SUB_RINGS_3X4.length;
        const [ringA, ringB] = DUAL_SUB_RINGS_3X4[pairIdx];
        const shiftA = step % 3 === 0 ? 2 : 1;
        const shiftB = -shiftA;
        appendRingCarouselTrajectories(ringA, shiftA, 0.65, cupAtSlot, currentSlotOfCup, trajectories);
        appendRingCarouselTrajectories(ringB, shiftB, 0.65, cupAtSlot, currentSlotOfCup, trajectories);
        plan.push({
          trajectories,
          durationScale: durationScale * 1.18,
          holdPauseSec: 0.005,
        });
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // 6. CLASSIC 3x3 GRID (9 Cups):
    //    8-Cup Outer Perimeter Ring Carousel + 4-Cup 2x2 Quad / Diamond Sub-Ring Carousels
    // -------------------------------------------------------------------------
    const is3x3Grid = cfg.reelMode === 'classic_3x3' && cupCount === 9;

    if (is3x3Grid && step % 3 === 1) {
      const trajectories: SpotQuestMoveTrajectory[] = [];
      const useFullOuterPerimeter = step % 6 === 1 || step === totalSteps - 2;

      if (useFullOuterPerimeter) {
        // Unified 8-cup outer perimeter ring rotation around center slot 4
        const shiftOptions = [2, -1, 1, -2, 3, -2];
        const shiftSteps = shiftOptions[step % shiftOptions.length];
        appendRingCarouselTrajectories(
          PERIMETER_CW_SLOTS_3X3,
          shiftSteps,
          0.74,
          cupAtSlot,
          currentSlotOfCup,
          trajectories
        );
        plan.push({
          trajectories,
          durationScale: Math.max(1.14, durationScale * (Math.abs(shiftSteps) >= 3 ? 1.45 : Math.abs(shiftSteps) === 2 ? 1.26 : 1.12)),
          holdPauseSec: 0.004,
        });
        continue;
      } else {
        // 4-Cup 2x2 Quad Mini-Ring or Center Diamond Ring Carousel Rotation!
        const ballSlot = currentSlotOfCup[ballCupId];
        const matchingSubRings = SUB_RINGS_3X3.filter((r) => r.includes(ballSlot));
        const subRing =
          matchingSubRings.length > 0
            ? matchingSubRings[step % matchingSubRings.length]
            : SUB_RINGS_3X3[step % SUB_RINGS_3X3.length];
        const shiftSteps = step % 2 === 0 ? 1 : -1;
        appendRingCarouselTrajectories(
          subRing,
          shiftSteps,
          0.72,
          cupAtSlot,
          currentSlotOfCup,
          trajectories
        );
        plan.push({
          trajectories,
          durationScale: durationScale * 1.12,
          holdPauseSec: 0.005,
        });
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // 7. 3-CUP COLUMN / DIAGONAL "SNAKE STREAM" PASS (On 3x3 Grid)
    // -------------------------------------------------------------------------
    const shouldTriggerSnakeTrain =
      is3x3Grid &&
      step > 1 &&
      step % 4 === 2;

    if (shouldTriggerSnakeTrain) {
      const ballSlot = currentSlotOfCup[ballCupId];
      const matchingChains = SNAKE_CHAINS_3X3.filter((chain) => chain.includes(ballSlot));
      const chain =
        matchingChains.length > 0
          ? matchingChains[Math.floor(Math.random() * matchingChains.length)]
          : SNAKE_CHAINS_3X3[Math.floor(Math.random() * SNAKE_CHAINS_3X3.length)];

      const reverseDir = Math.random() < 0.5;
      const [s0, s1, s2] = reverseDir ? [chain[2], chain[1], chain[0]] : chain;
      const c0 = cupAtSlot[s0];
      const c1 = cupAtSlot[s1];
      const c2 = cupAtSlot[s2];

      const sideSign = step % 2 === 0 ? 1 : -1;

      const trajectories: SpotQuestMoveTrajectory[] = [
        {
          kind: 'PASS_BY_LANE',
          cupId: c0,
          fromSlot: s0,
          toSlot: s1,
          laneOffsetWorld: 0.45 * sideSign,
          leadLagBias: 0.03,
          isFeint: false,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: c1,
          fromSlot: s1,
          toSlot: s2,
          laneOffsetWorld: 0.45 * sideSign,
          leadLagBias: 0.03,
          isFeint: false,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: c2,
          fromSlot: s2,
          toSlot: s0,
          laneOffsetWorld: 1.52 * sideSign,
          leadLagBias: -0.03,
          isFeint: false,
          peekDecoyLift: false,
        },
      ];

      currentSlotOfCup[c0] = s1;
      currentSlotOfCup[c1] = s2;
      currentSlotOfCup[c2] = s0;
      cupAtSlot[s1] = c0;
      cupAtSlot[s2] = c1;
      cupAtSlot[s0] = c2;

      plan.push({
        trajectories,
        durationScale: durationScale * 1.12,
        holdPauseSec,
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // 8. 180° ELLIPTICAL TURNTABLE PAIR ORBITS (All Modes)
    // -------------------------------------------------------------------------
    const usedSlots = new Set<number>();
    const usedPairMidpoints: Array<{ x: number; z: number }> = [];
    const allSlots = Array.from({ length: cupCount }, (_, i) => i);
    const trajectories: SpotQuestMoveTrajectory[] = [];

    const maxPairsThisStep =
      step < 2
        ? 1
        : cfg.simultaneousSwaps >= 2 && step % 2 === 1
        ? 2
        : 1;

    for (let p = 0; p < maxPairsThisStep; p++) {
      const freeSlots = allSlots.filter((s) => !usedSlots.has(s));
      if (freeSlots.length < 2) break;

      const ballSlot = currentSlotOfCup[ballCupId];
      let slot1: number;
      if (isMissionImpossible9 && p === 0 && !usedSlots.has(8)) {
        slot1 = 8;
      } else if (!usedSlots.has(ballSlot) && p === 0 && Math.random() < 0.84) {
        slot1 = ballSlot;
      } else {
        slot1 = freeSlots[Math.floor(Math.random() * freeSlots.length)];
      }

      let candidates = freeSlots.filter((s) => s !== slot1 && !usedSlots.has(s));

      if (is3x3Grid) {
        const neighbors = candidates.filter((s) => areNeighbors3x3(slot1, s));
        if (neighbors.length > 0) candidates = neighbors;
      } else {
        const c1 = baseSlots[slot1];
        const near = candidates.filter((s) => {
          const c2 = baseSlots[s];
          const d = Math.hypot(c1.x - c2.x, c1.z - c2.z);
          return d >= 1.5 && d <= 4.6;
        });
        if (near.length > 0) candidates = near;
      }

      if (usedPairMidpoints.length > 0) {
        const c1 = baseSlots[slot1];
        candidates = candidates.filter((s) => {
          const c2 = baseSlots[s];
          const mx = (c1.x + c2.x) * 0.5;
          const mz = (c1.z + c2.z) * 0.5;
          return usedPairMidpoints.every((m) => Math.hypot(mx - m.x, mz - m.z) >= 3.3);
        });
      }

      if (candidates.length === 0) break;
      const slot2 = candidates[Math.floor(Math.random() * candidates.length)];

      usedSlots.add(slot1);
      usedSlots.add(slot2);
      usedPairMidpoints.push({
        x: (baseSlots[slot1].x + baseSlots[slot2].x) * 0.5,
        z: (baseSlots[slot1].z + baseSlots[slot2].z) * 0.5,
      });

      const cup1 = cupAtSlot[slot1];
      const cup2 = cupAtSlot[slot2];

      const isFeint = cfg.hasMidShuffleFeints && p > 0 && step % 4 === 3;
      const peekDecoy1 = cfg.decoyBallsCount > 0 && decoyCupIds.includes(cup1) && step % 4 === 2;
      const peekDecoy2 = cfg.decoyBallsCount > 0 && decoyCupIds.includes(cup2) && step % 4 === 2;

      const laneSign: 1 | -1 = (step + p) % 2 === 0 ? 1 : -1;
      const laneOffsetWorld = computeWidePassLaneOffset(baseSlots[slot1], baseSlots[slot2], laneSign);

      trajectories.push({
        kind: 'PASS_BY_LANE',
        cupId: cup1,
        fromSlot: slot1,
        toSlot: slot2,
        laneOffsetWorld,
        leadLagBias: 0.025,
        isFeint,
        peekDecoyLift: peekDecoy1,
      });
      trajectories.push({
        kind: 'PASS_BY_LANE',
        cupId: cup2,
        fromSlot: slot2,
        toSlot: slot1,
        laneOffsetWorld,
        leadLagBias: -0.025,
        isFeint,
        peekDecoyLift: peekDecoy2,
      });

      if (!isFeint) {
        currentSlotOfCup[cup1] = slot2;
        currentSlotOfCup[cup2] = slot1;
        cupAtSlot[slot2] = cup1;
        cupAtSlot[slot1] = cup2;
      }
    }

    if (trajectories.length > 0) {
      let maxDist = 2.8;
      for (const tr of trajectories) {
        const c1 = baseSlots[tr.fromSlot];
        const c2 = baseSlots[tr.toSlot];
        if (c1 && c2) {
          maxDist = Math.max(maxDist, Math.hypot(c2.x - c1.x, c2.z - c1.z));
        }
      }
      const distFactor = Math.max(0.86, Math.min(1.32, maxDist / 3.25));
      plan.push({
        trajectories,
        durationScale: durationScale * distFactor,
        holdPauseSec,
      });
    }
  }

  void secondaryBallCupId;
  return plan;
}

export const GoldBall3DScene: React.FC<GoldBall3DSceneProps> = ({
  levelConfig,
  phase,
  countdownNum,
  ballCupId,
  secondaryBallCupId,
  decoyCupIds,
  selectedCupId,
  selectedSecondaryCupId,
  revealedEmptyCupIds,
  showTrueBallCup,
  isPaused,
  freezeActive,
  slowMotionActive,
  extraVisionActive,
  celebrationBurstKey,
  onShuffleStepSound,
  onShuffleComplete,
  onSelectCup,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglFallback, setWebglFallback] = useState(false);
  const [hoveredCupId, setHoveredCupId] = useState<number | null>(null);
  // Frozen visual-order mapping (index i -> cupId labeled i + 1) computed ONCE when cups come to a full stop
  const [orderedCupIds, setOrderedCupIds] = useState<number[]>(
    Array.from({ length: MAX_CUPS }, (_, i) => i)
  );

  const stateRef = useRef({
    phase,
    ballCupId,
    secondaryBallCupId,
    decoyCupIds,
    selectedCupId,
    selectedSecondaryCupId,
    revealedEmptyCupIds,
    showTrueBallCup,
    isPaused,
    freezeActive,
    slowMotionActive,
    extraVisionActive,
    levelConfig,
    hoveredCupId: null as number | null,
    onShuffleStepSound,
    onShuffleComplete,
    onSelectCup,
  });

  useEffect(() => {
    stateRef.current = {
      phase,
      ballCupId,
      secondaryBallCupId,
      decoyCupIds,
      selectedCupId,
      selectedSecondaryCupId,
      revealedEmptyCupIds,
      showTrueBallCup,
      isPaused,
      freezeActive,
      slowMotionActive,
      extraVisionActive,
      levelConfig,
      hoveredCupId,
      onShuffleStepSound,
      onShuffleComplete,
      onSelectCup,
    };
  }, [
    phase,
    ballCupId,
    secondaryBallCupId,
    decoyCupIds,
    selectedCupId,
    selectedSecondaryCupId,
    revealedEmptyCupIds,
    showTrueBallCup,
    isPaused,
    freezeActive,
    slowMotionActive,
    extraVisionActive,
    levelConfig,
    hoveredCupId,
    onShuffleStepSound,
    onShuffleComplete,
    onSelectCup,
  ]);

  const shuffleEngineRef = useRef<{
    cupSlots: number[];
    cupWorldPos: Array<{ x: number; z: number; liftY: number }>;
    cupMotion: Array<{
      prevX: number;
      prevZ: number;
      spinY: number;
      spinVelY: number;
      leanX: number;
      leanZ: number;
    }>;
    displayNumByCup: number[];
    orbitAngle: number;
    orbitVel: number;
    activePlan: ShuffleWaveStep[];
    currentStepIndex: number;
    stepProgress: number;
    pauseRemainingSec: number;
    finalSettleSec: number;
    isShuffling: boolean;
    burstTimer: number;
  }>({
    cupSlots: Array.from({ length: MAX_CUPS }, (_, i) => i),
    cupWorldPos: Array.from({ length: MAX_CUPS }, () => ({ x: 0, z: 0, liftY: 0 })),
    cupMotion: Array.from({ length: MAX_CUPS }, () => ({
      prevX: 0,
      prevZ: 0,
      spinY: 0,
      spinVelY: 0,
      leanX: 0,
      leanZ: 0,
    })),
    displayNumByCup: Array.from({ length: MAX_CUPS }, (_, i) => i + 1),
    orbitAngle: 0,
    orbitVel: 0,
    activePlan: [],
    currentStepIndex: 0,
    stepProgress: 0,
    pauseRemainingSec: 0,
    finalSettleSec: 0,
    isShuffling: false,
    burstTimer: 0,
  });

  useEffect(() => {
    if (celebrationBurstKey > 0) {
      shuffleEngineRef.current.burstTimer = 1.6;
    }
  }, [celebrationBurstKey]);

  const getWorldSlotCoord = useCallback(
    (slotIdx: number, cfg: GoldBallLevelConfig, orbitAngle: number): { x: number; z: number } => {
      const baseSlots = getFormationBaseSlots(cfg.reelMode);
      const base = baseSlots[slotIdx] || { x: 0, z: 0 };
      if (
        cfg.orbitSpeedRadPerSec > 0 &&
        (cfg.reelMode === 'orbit_ring_8' || cfg.reelMode === 'mind_trap_ring_10')
      ) {
        const cosA = Math.cos(orbitAngle);
        const sinA = Math.sin(orbitAngle);
        return {
          x: base.x * cosA - base.z * sinA,
          z: base.x * sinA + base.z * cosA,
        };
      }
      return { x: base.x, z: base.z };
    },
    []
  );

  // Reset cup slot positions when level / formation changes
  useEffect(() => {
    const eng = shuffleEngineRef.current;
    const baseSlots = getFormationBaseSlots(levelConfig.reelMode);
    eng.cupSlots = Array.from({ length: MAX_CUPS }, (_, i) => i);
    eng.orbitAngle = 0;
    eng.orbitVel = 0;
    eng.finalSettleSec = 0;
    for (let i = 0; i < MAX_CUPS; i++) {
      const s = baseSlots[i] || { x: 0, z: 0 };
      eng.cupWorldPos[i] = { x: s.x, z: s.z, liftY: 0 };
      eng.cupMotion[i] = { prevX: s.x, prevZ: s.z, spinY: 0, spinVelY: 0, leanX: 0, leanZ: 0 };
    }
    const { displayNumByCup, orderedCupIds: initialOrder } = computeVisualCupOrdering(
      eng.cupWorldPos,
      levelConfig.cupCount
    );
    eng.displayNumByCup = displayNumByCup;
    setOrderedCupIds(initialOrder);
  }, [levelConfig.level, levelConfig.reelMode, levelConfig.cupCount]);

  // Start shuffling when phase transitions to 'SHUFFLING'
  useEffect(() => {
    const eng = shuffleEngineRef.current;
    if (phase === 'SHUFFLING') {
      const plan = buildSpotQuestChoreographyPlan(
        levelConfig,
        eng.cupSlots,
        ballCupId,
        secondaryBallCupId,
        decoyCupIds
      );
      eng.activePlan = plan;
      eng.currentStepIndex = 0;
      eng.stepProgress = 0;
      eng.pauseRemainingSec = 0;
      eng.finalSettleSec = 0;
      eng.orbitVel = 0;
      eng.isShuffling = true;
      if (plan.length > 0) {
        stateRef.current.onShuffleStepSound(
          1000 / Math.max(170, levelConfig.stepDurationMs * plan[0].durationScale)
        );
      } else {
        eng.isShuffling = false;
        const { displayNumByCup, orderedCupIds: frozenOrder } = computeVisualCupOrdering(
          eng.cupWorldPos,
          levelConfig.cupCount
        );
        eng.displayNumByCup = displayNumByCup;
        setOrderedCupIds(frozenOrder);
        stateRef.current.onShuffleComplete();
      }
    } else {
      eng.isShuffling = false;
      eng.finalSettleSec = 0;
      eng.orbitVel = 0;
    }
  }, [phase, levelConfig, ballCupId, secondaryBallCupId, decoyCupIds]);

  // Main Three.js Scene Setup & 60fps Animation Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        setWebglFallback(true);
        return;
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererStr = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '') : '';
      const isSoftwareGl = /SwiftShader|Software|llvmpipe|Mesa OffScreen/i.test(rendererStr);

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.setSize(
        Math.max(1, container.clientWidth || 340),
        Math.max(1, container.clientHeight || 420),
        false
      );
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch {
      setWebglFallback(true);
      return;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(levelConfig.environment.bgTop);
    scene.fog = new THREE.FogExp2(levelConfig.environment.fogColor, 0.022);

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(1, container.clientWidth || 340) / Math.max(1, container.clientHeight || 420),
      0.1,
      85
    );

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envMap;

    const skinTextures: Record<CupPatternSkin, THREE.CanvasTexture> = {
      specular_turquoise: createCupSkinTexture('specular_turquoise', '#14b8a6'),
      zigzag_chevron: createCupSkinTexture('zigzag_chevron', '#0d9488'),
      vertical_stripes: createCupSkinTexture('vertical_stripes', '#0d9488'),
      collar_band: createCupSkinTexture('collar_band', '#0e7490'),
      crimson_gloss: createCupSkinTexture('crimson_gloss', '#dc2626'),
      emerald_mirror: createCupSkinTexture('emerald_mirror', '#059669'),
    };

    const numberBadgeTextures: THREE.CanvasTexture[] = Array.from({ length: MAX_CUPS }, (_, idx) =>
      createPremiumNumberBadgeTexture(idx + 1)
    );
    const studioTableTex = createStudioTableTexture();

    const dieFaceTextures = createGoldenDieFaceTextures();
    const dieFaceMaterials = dieFaceTextures.map(
      (tex) =>
        new THREE.MeshPhysicalMaterial({
          map: tex,
          metalness: 0.85,
          roughness: 0.14,
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
        })
    );

    const goldGlowTex = createRadialGlowTexture('#fbbf24');
    const pinkGlowTex = createRadialGlowTexture('#ec4899');
    const decoyGlowTex = createRadialGlowTexture('#94a3b8');

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(levelConfig.environment.ambientColor, 1.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#e0f2fe', '#022c22', 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(levelConfig.environment.keyLightColor, 2.5);
    keyLight.position.set(5.5, 13.5, 7.5);
    keyLight.castShadow = renderer.shadowMap.enabled;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 32;
    const d = 8.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(levelConfig.environment.fillLightColor, 1.4);
    fillLight.position.set(-6.5, 6.5, -4.5);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(levelConfig.environment.rimLightColor, 2.3, 30, Math.PI / 3, 0.5, 1);
    rimLight.position.set(0, 11.5, -8.5);
    scene.add(rimLight);

    // --- LUXURY BRUSHED-OBSIDIAN & GOLD-INLAY STUDIO FLOOR ---
    const arenaGroup = new THREE.Group();
    scene.add(arenaGroup);

    const tableMat = new THREE.MeshStandardMaterial({
      map: studioTableTex,
      color: new THREE.Color(levelConfig.environment.tableBaseColor),
      roughness: 0.36,
      metalness: 0.24,
    });
    const tableBody = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), tableMat);
    tableBody.rotation.x = -Math.PI / 2;
    tableBody.position.y = 0.0;
    tableBody.receiveShadow = true;
    arenaGroup.add(tableBody);

    // Subtle luxury brushed-gold studio stage rim ring
    const stageRimGeo = new THREE.TorusGeometry(6.35, 0.032, 16, 96);
    const stageRimMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f5c84c'),
      emissive: new THREE.Color('#92400e'),
      emissiveIntensity: 0.16,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.9,
    });
    const stageRimMesh = new THREE.Mesh(stageRimGeo, stageRimMat);
    stageRimMesh.rotation.x = Math.PI / 2;
    stageRimMesh.position.y = 0.025;
    arenaGroup.add(stageRimMesh);

    // 1. Split-Brain horizontal white divider line & plum bottom floor plane
    const splitDividerGroup = new THREE.Group();
    const dividerLineMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#f8fafc') });
    const dividerLineMesh = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.04, 0.09), dividerLineMat);
    dividerLineMesh.position.set(0, 0.02, 0);
    splitDividerGroup.add(dividerLineMesh);

    const bottomHalfFloorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#230829'),
      roughness: 0.38,
      metalness: 0.2,
    });
    const bottomHalfFloor = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 6.5), bottomHalfFloorMat);
    bottomHalfFloor.rotation.x = -Math.PI / 2;
    bottomHalfFloor.position.set(0, 0.008, 3.25);
    bottomHalfFloor.receiveShadow = true;
    splitDividerGroup.add(bottomHalfFloor);
    scene.add(splitDividerGroup);

    // 2. Crimson Die Neon Stadium Oval Track Outline (Matches Reel DeU6nw4yeSM!)
    const stadiumOvalGroup = new THREE.Group();
    const ovalPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      ovalPoints.push(new THREE.Vector3(Math.cos(a) * 4.25, 0.02, Math.sin(a) * 4.95));
    }
    const ovalCurve = new THREE.CatmullRomCurve3(ovalPoints, true);
    const ovalTubeGeo = new THREE.TubeGeometry(ovalCurve, 96, 0.038, 12, true);
    const ovalTubeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.82,
    });
    const ovalTubeMesh = new THREE.Mesh(ovalTubeGeo, ovalTubeMat);
    stadiumOvalGroup.add(ovalTubeMesh);
    scene.add(stadiumOvalGroup);

    // 3. Figure-8 Hourglass Infinity Track Guide Curve (Matches Reel DfLSUkHvDeD!)
    const figure8TrackGroup = new THREE.Group();
    const fig8Slots = getFormationBaseSlots('infinity_figure8_12');
    const fig8Points = FIGURE8_LOOP_ORDER.map((idx) => new THREE.Vector3(fig8Slots[idx].x, 0.018, fig8Slots[idx].z));
    const fig8Curve = new THREE.CatmullRomCurve3(fig8Points, true, 'centripetal', 0.5);
    const fig8TubeGeo = new THREE.TubeGeometry(fig8Curve, 120, 0.025, 8, true);
    const fig8TubeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#5eead4'),
      transparent: true,
      opacity: 0.42,
    });
    const fig8TubeMesh = new THREE.Mesh(fig8TubeGeo, fig8TubeMat);
    figure8TrackGroup.add(fig8TubeMesh);
    scene.add(figure8TrackGroup);

    // 4. Chaos Mode 3-Petal Clover Trefoil Track Guide Curves (Matches Reel DfpCaSfMD1v!)
    const trefoilTrackGroup = new THREE.Group();
    const trefoilSlots = getFormationBaseSlots('chaos_trefoil_12');
    const trefoilTrackMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#34d399'),
      transparent: true,
      opacity: 0.44,
    });
    const trefoilGeos: THREE.BufferGeometry[] = [];
    const trefoilCurves: THREE.CatmullRomCurve3[] = [];
    for (const chain of TREFOIL_PETAL_CHAINS) {
      const pts = chain.map((idx) => new THREE.Vector3(trefoilSlots[idx].x, 0.018, trefoilSlots[idx].z));
      const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5);
      trefoilCurves.push(curve);
      const geo = new THREE.TubeGeometry(curve, 64, 0.024, 8, true);
      trefoilGeos.push(geo);
      trefoilTrackGroup.add(new THREE.Mesh(geo, trefoilTrackMat));
    }
    scene.add(trefoilTrackGroup);

    // --- PRIMARY SHINY GOLDEN BALL ---
    const goldBallGroup = new THREE.Group();
    scene.add(goldBallGroup);

    const goldBallMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffd700'),
      emissive: new THREE.Color('#b45309'),
      emissiveIntensity: 0.34,
      metalness: 0.96,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
    });
    const goldBallMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 48), goldBallMat);
    goldBallMesh.castShadow = true;
    goldBallMesh.position.y = 0.34;
    goldBallGroup.add(goldBallMesh);

    const goldFloorGlowMat = new THREE.MeshBasicMaterial({
      map: goldGlowTex,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const goldFloorGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), goldFloorGlowMat);
    goldFloorGlow.rotation.x = -Math.PI / 2;
    goldFloorGlow.position.y = 0.022;
    goldBallGroup.add(goldFloorGlow);

    const goldRevealRingGeo = new THREE.TorusGeometry(0.56, 0.022, 14, 48);
    const goldRevealRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fde047'),
      transparent: true,
      opacity: 0.85,
    });
    const goldRevealRing = new THREE.Mesh(goldRevealRingGeo, goldRevealRingMat);
    goldRevealRing.rotation.x = Math.PI / 2;
    goldRevealRing.position.y = 0.028;
    goldBallGroup.add(goldRevealRing);

    // --- 3D GOLDEN DIE TARGET (Reel DeU6nw4yeSM: "8 CUPS. ONE DIE.") ---
    const goldenDieGroup = new THREE.Group();
    scene.add(goldenDieGroup);

    const dieBoxGeo = new THREE.BoxGeometry(0.52, 0.52, 0.52);
    const goldenDieMesh = new THREE.Mesh(dieBoxGeo, dieFaceMaterials);
    goldenDieMesh.castShadow = true;
    goldenDieMesh.position.y = 0.42;
    goldenDieMesh.rotation.set(0.35, Math.PI / 4, 0.25);
    goldenDieGroup.add(goldenDieMesh);

    const dieRingGeo = new THREE.TorusGeometry(0.62, 0.028, 16, 48);
    const dieRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fbbf24'),
      transparent: true,
      opacity: 0.9,
    });
    const dieFloorRing = new THREE.Mesh(dieRingGeo, dieRingMat);
    dieFloorRing.rotation.x = Math.PI / 2;
    dieFloorRing.position.y = 0.025;
    goldenDieGroup.add(dieFloorRing);

    const dieFloorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), goldFloorGlowMat);
    dieFloorGlow.rotation.x = -Math.PI / 2;
    dieFloorGlow.position.y = 0.02;
    goldenDieGroup.add(dieFloorGlow);
    goldenDieGroup.visible = false;

    // --- SECONDARY PINK/MAGENTA BALL (SPLIT BRAIN) ---
    const pinkBallGroup = new THREE.Group();
    scene.add(pinkBallGroup);

    const pinkBallMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f43f5e'),
      emissive: new THREE.Color('#be185d'),
      emissiveIntensity: 0.38,
      metalness: 0.88,
      roughness: 0.1,
      clearcoat: 1.0,
    });
    const pinkBallMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 48), pinkBallMat);
    pinkBallMesh.castShadow = true;
    pinkBallMesh.position.y = 0.34;
    pinkBallGroup.add(pinkBallMesh);

    const pinkFloorGlowMat = new THREE.MeshBasicMaterial({
      map: pinkGlowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pinkFloorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 1.95), pinkFloorGlowMat);
    pinkFloorGlow.rotation.x = -Math.PI / 2;
    pinkFloorGlow.position.y = 0.022;
    pinkBallGroup.add(pinkFloorGlow);

    // --- DECOY BALLS (MIND TRAP) ---
    const MAX_DECOYS = 3;
    const decoyBallGroups: THREE.Group[] = [];
    const decoyBallMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#cbd5e1'),
      emissive: new THREE.Color('#334155'),
      emissiveIntensity: 0.25,
      metalness: 0.95,
      roughness: 0.1,
      clearcoat: 1.0,
    });
    const decoyGlowMat = new THREE.MeshBasicMaterial({
      map: decoyGlowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    for (let dIdx = 0; dIdx < MAX_DECOYS; dIdx++) {
      const dGroup = new THREE.Group();
      const dMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 36, 36), decoyBallMat);
      dMesh.position.y = 0.32;
      dGroup.add(dMesh);
      const dGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), decoyGlowMat);
      dGlow.rotation.x = -Math.PI / 2;
      dGlow.position.y = 0.022;
      dGroup.add(dGlow);
      dGroup.visible = false;
      scene.add(dGroup);
      decoyBallGroups.push(dGroup);
    }

    // --- 12 LUXURY INVERTED 3D CUPS (GOLD METALLIC COLLARS + FLOATING MEDALLION NUMBER BADGES) ---
    const cupWallGeo = new THREE.CylinderGeometry(0.30, 0.45, 1.08, 48, 1, true);
    cupWallGeo.translate(0, 0.55, 0);

    const innerCavityGeo = new THREE.CylinderGeometry(0.28, 0.43, 1.04, 36, 1, true);
    innerCavityGeo.translate(0, 0.53, 0);

    const whiteTopCapGeo = new THREE.CircleGeometry(0.285, 48);
    const topRimBevelGeo = new THREE.TorusGeometry(0.295, 0.02, 16, 48);
    const goldCollarGeo = new THREE.TorusGeometry(0.326, 0.015, 14, 48);
    const bottomLipTorusGeo = new THREE.TorusGeometry(0.448, 0.022, 16, 48);
    const contactShadowGeo = new THREE.CircleGeometry(0.54, 36);

    const innerCavityMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#021317'),
      roughness: 0.7,
      side: THREE.BackSide,
    });

    const whiteTopCapMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f8fafc'),
      emissive: new THREE.Color('#cbd5e1'),
      emissiveIntensity: 0.14,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.7,
    });

    const crimsonTopCapMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ef4444'),
      emissive: new THREE.Color('#991b1b'),
      emissiveIntensity: 0.18,
      roughness: 0.18,
      metalness: 0.16,
      clearcoat: 0.88,
    });

    const topBevelMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e2e8f0'),
      roughness: 0.18,
      metalness: 0.42,
      clearcoat: 0.85,
    });

    const goldCollarMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f7ca4f'),
      emissive: new THREE.Color('#78350f'),
      emissiveIntensity: 0.15,
      metalness: 0.94,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    });

    interface CupVisualNode {
      id: number;
      rootGroup: THREE.Group;
      cupLifter: THREE.Group;
      wallMesh: THREE.Mesh;
      wallMat: THREE.MeshPhysicalMaterial;
      topCapMesh: THREE.Mesh;
      numberBadgeSprite: THREE.Sprite;
      numberBadgeMat: THREE.SpriteMaterial;
      bottomLipMat: THREE.MeshBasicMaterial;
      selectionHalo: THREE.Mesh;
      selectionHaloMat: THREE.MeshBasicMaterial;
      shadowDisc: THREE.Mesh;
      shadowMat: THREE.MeshBasicMaterial;
    }

    const cupNodes: CupVisualNode[] = [];

    for (let i = 0; i < MAX_CUPS; i++) {
      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      const shadowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#010a0d'),
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      });
      const shadowDisc = new THREE.Mesh(contactShadowGeo, shadowMat);
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.015;
      rootGroup.add(shadowDisc);

      const selectionHaloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#2dd4bf'),
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const selectionHalo = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.03, 14, 48), selectionHaloMat);
      selectionHalo.rotation.x = Math.PI / 2;
      selectionHalo.position.y = 0.025;
      rootGroup.add(selectionHalo);

      const cupLifter = new THREE.Group();
      rootGroup.add(cupLifter);

      const wallMat = new THREE.MeshPhysicalMaterial({
        map: skinTextures.specular_turquoise,
        color: new THREE.Color('#ffffff'),
        emissive: new THREE.Color('#042f2e'),
        emissiveIntensity: 0.16,
        metalness: 0.24,
        roughness: 0.16,
        clearcoat: 0.95,
        clearcoatRoughness: 0.1,
        reflectivity: 0.95,
        transparent: true,
        opacity: 1.0,
      });

      const wallMesh = new THREE.Mesh(cupWallGeo, wallMat);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallMesh.userData = { cupId: i };
      cupLifter.add(wallMesh);

      const numberBadgeMat = new THREE.SpriteMaterial({
        map: numberBadgeTextures[i],
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const numberBadgeSprite = new THREE.Sprite(numberBadgeMat);
      numberBadgeSprite.position.set(0, 1.46, 0);
      numberBadgeSprite.scale.set(0.66, 0.66, 1);
      numberBadgeSprite.renderOrder = 8;
      numberBadgeSprite.userData = { cupId: i };
      // Attached to rootGroup so cup body rotation never tilts or hides the medallion
      rootGroup.add(numberBadgeSprite);

      const innerCavity = new THREE.Mesh(innerCavityGeo, innerCavityMat);
      innerCavity.userData = { cupId: i };
      cupLifter.add(innerCavity);

      const topCapMesh = new THREE.Mesh(whiteTopCapGeo, whiteTopCapMat);
      topCapMesh.rotation.x = -Math.PI / 2;
      topCapMesh.position.y = 1.075;
      topCapMesh.userData = { cupId: i };
      cupLifter.add(topCapMesh);

      const topBevel = new THREE.Mesh(topRimBevelGeo, topBevelMat);
      topBevel.rotation.x = Math.PI / 2;
      topBevel.position.y = 1.085;
      topBevel.userData = { cupId: i };
      cupLifter.add(topBevel);

      const goldCollar = new THREE.Mesh(goldCollarGeo, goldCollarMat);
      goldCollar.rotation.x = Math.PI / 2;
      goldCollar.position.y = 0.94;
      goldCollar.userData = { cupId: i };
      cupLifter.add(goldCollar);

      const bottomLipMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#a7f3d0'),
      });
      const bottomLip = new THREE.Mesh(bottomLipTorusGeo, bottomLipMat);
      bottomLip.rotation.x = Math.PI / 2;
      bottomLip.position.y = 0.024;
      bottomLip.userData = { cupId: i };
      cupLifter.add(bottomLip);

      cupNodes.push({
        id: i,
        rootGroup,
        cupLifter,
        wallMesh,
        wallMat,
        topCapMesh,
        numberBadgeSprite,
        numberBadgeMat,
        bottomLipMat,
        selectionHalo,
        selectionHaloMat,
        shadowDisc,
        shadowMat,
      });
    }

    // --- AMBIENT STUDIO GOLDEN BOKEH DUST MOTES ---
    const MOTE_COUNT = 44;
    const motePositions = new Float32Array(MOTE_COUNT * 3);
    const motePhases: number[] = [];
    for (let i = 0; i < MOTE_COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 4.2 + Math.random() * 5.2;
      motePositions[i * 3] = Math.cos(a) * r;
      motePositions[i * 3 + 1] = 0.6 + Math.random() * 4.5;
      motePositions[i * 3 + 2] = Math.sin(a) * r;
      motePhases.push(Math.random() * Math.PI * 2);
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteMat = new THREE.PointsMaterial({
      map: goldGlowTex,
      color: new THREE.Color('#fde68a'),
      size: 0.24,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ambientMotes = new THREE.Points(moteGeo, moteMat);
    scene.add(ambientMotes);

    // --- GOLDEN PARTICLE SYSTEM ---
    const PARTICLE_COUNT = 90;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleVelocities: Array<{ vx: number; vy: number; vz: number }> = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.15 + Math.random() * 0.55;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 0.8;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      particleVelocities.push({
        vx: Math.cos(angle) * (0.8 + Math.random() * 1.6),
        vy: 1.4 + Math.random() * 2.4,
        vz: Math.sin(angle) * (0.8 + Math.random() * 1.6),
      });
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color('#fde047'),
      size: 0.14,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- POINTER / TOUCH RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pickableMeshes: THREE.Object3D[] = [];
    cupNodes.forEach((node) => {
      node.cupLifter.children.forEach((child) => pickableMeshes.push(child));
      pickableMeshes.push(node.numberBadgeSprite);
    });

    const getCupFromEvent = (clientX: number, clientY: number): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableMeshes, false);
      for (const hit of hits) {
        const hitCupId = hit.object.userData?.cupId;
        if (typeof hitCupId === 'number' && hitCupId < stateRef.current.levelConfig.cupCount) {
          return hitCupId;
        }
      }
      return null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (stateRef.current.phase !== 'SELECTING' || stateRef.current.isPaused) {
        if (stateRef.current.hoveredCupId !== null) setHoveredCupId(null);
        renderer.domElement.style.cursor = 'default';
        return;
      }
      const cupId = getCupFromEvent(e.clientX, e.clientY);
      if (cupId !== null && !stateRef.current.revealedEmptyCupIds.includes(cupId)) {
        renderer.domElement.style.cursor = 'pointer';
        if (stateRef.current.hoveredCupId !== cupId) setHoveredCupId(cupId);
      } else {
        renderer.domElement.style.cursor = 'default';
        if (stateRef.current.hoveredCupId !== null) setHoveredCupId(null);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (stateRef.current.phase !== 'SELECTING' || stateRef.current.isPaused) return;
      const cupId = getCupFromEvent(e.clientX, e.clientY);
      if (cupId !== null && !stateRef.current.revealedEmptyCupIds.includes(cupId)) {
        stateRef.current.onSelectCup(cupId);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    let lastViewportW = 0;
    let lastViewportH = 0;
    let lastFramedMode: ReelChallengeMode | null = null;

    const fitCameraToViewport = (rawW: number, rawH: number, mode: ReelChallengeMode) => {
      const w = Math.max(1, Math.floor(rawW));
      const h = Math.max(1, Math.floor(rawH));
      lastViewportW = w;
      lastViewportH = h;
      lastFramedMode = mode;

      const aspect = w / h;
      camera.aspect = aspect;

      // Compute exact outer slot bounds of the current formation so all cups & parallel passing lanes fit inside portrait screens
      const slots = getFormationBaseSlots(mode);
      let maxSlotX = 2.72;
      let maxSlotZ = 2.54;
      for (const s of slots) {
        maxSlotX = Math.max(maxSlotX, Math.abs(s.x));
        maxSlotZ = Math.max(maxSlotZ, Math.abs(s.z));
      }
      if (mode === 'crimson_die_oval_8') {
        maxSlotX = Math.max(maxSlotX, 4.25);
        maxSlotZ = Math.max(maxSlotZ, 4.95);
      }

      // Required visible half-width & half-depth (includes cup radius 0.45, halo 0.64, and out-swinging parallel passing lanes)
      const reqHalfWidth = maxSlotX + 1.55;
      const reqHalfDepth = maxSlotZ + 1.65;

      // Steeper overhead studio angle on portrait screens (like 9:16 Reels) prevents front-row horizontal clipping
      const elevDeg = aspect < 0.95 ? 56 : 47;
      const elevRad = THREE.MathUtils.degToRad(elevDeg);
      const dirY = Math.sin(elevRad);
      const dirZ = Math.cos(elevRad);

      const vFovRad = THREE.MathUtils.degToRad(camera.fov);
      const tanHalfVFov = Math.tan(vFovRad / 2);
      const tanHalfHFov = Math.max(0.12, tanHalfVFov * aspect);

      const lookAtY = 0.12;
      const lookAtZ = 0.22;
      const frontAdvance = Math.max(0, (maxSlotZ - lookAtZ) * dirZ + 0.58);

      // 1. Distance required so [-reqHalfWidth, +reqHalfWidth] at the front-most row fits 100% horizontally
      const distForWidth = reqHalfWidth / tanHalfHFov + frontAdvance;

      // 2. Distance required so [-reqHalfDepth, +reqHalfDepth] fits vertically between the top title and bottom cup dock
      const projectedHalfHeight = reqHalfDepth * dirY + 0.95 * dirZ;
      const distForHeight = projectedHalfHeight / (0.65 * tanHalfVFov) + 1.15;

      const dist = Math.max(distForWidth, distForHeight);

      camera.position.set(0, lookAtY + dirY * dist, lookAtZ + dirZ * dist);
      camera.lookAt(0, lookAtY, lookAtZ);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const handleResize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width || container.clientWidth || 340));
      const h = Math.max(1, Math.floor(rect.height || container.clientHeight || 420));
      fitCameraToViewport(w, h, stateRef.current.levelConfig.reelMode);
    };
    handleResize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // --- 60FPS ANIMATION LOOP ---
    let animFrameId = 0;
    let lastTime = performance.now();

    const naturalEase = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x)));

    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);
      const rawDt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const st = stateRef.current;
      const eng = shuffleEngineRef.current;
      const cfg = st.levelConfig;
      const cupCount = cfg.cupCount;

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (
        (cw > 0 && ch > 0 && (cw !== lastViewportW || ch !== lastViewportH)) ||
        cfg.reelMode !== lastFramedMode
      ) {
        fitCameraToViewport(cw || lastViewportW || 340, ch || lastViewportH || 420, cfg.reelMode);
      }

      scene.background = new THREE.Color(cfg.environment.bgTop);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.set(cfg.environment.fogColor);
      }
      tableMat.color.set(cfg.environment.tableBaseColor);
      keyLight.color.set(cfg.environment.keyLightColor);
      fillLight.color.set(cfg.environment.fillLightColor);
      rimLight.color.set(cfg.environment.rimLightColor);

      splitDividerGroup.visible = cfg.reelMode === 'split_brain_2x3';
      stadiumOvalGroup.visible = cfg.reelMode === 'crimson_die_oval_8';
      figure8TrackGroup.visible = cfg.reelMode === 'infinity_figure8_12';
      trefoilTrackGroup.visible = cfg.reelMode === 'chaos_trefoil_12';

      const dt = st.isPaused ? 0 : rawDt;

      // Smoothly damp continuous orbital angular velocity so rings accelerate, reverse, and settle without abrupt snaps
      let targetOrbitVel = 0;
      if (
        cfg.orbitSpeedRadPerSec > 0 &&
        st.phase === 'SHUFFLING' &&
        eng.isShuffling &&
        eng.finalSettleSec <= 0 &&
        !st.isPaused &&
        !st.freezeActive
      ) {
        const speedMult = st.slowMotionActive ? 0.45 : 1.0;
        const dirSign =
          cfg.hasMidShuffleFeints && eng.currentStepIndex >= Math.floor(cfg.shuffleSteps / 2) ? -1 : 1;
        targetOrbitVel = cfg.orbitSpeedRadPerSec * speedMult * dirSign;
      }
      const orbitDamp = 1 - Math.exp(-7.5 * (dt || 0.016));
      eng.orbitVel += (targetOrbitVel - eng.orbitVel) * orbitDamp;
      if (Math.abs(eng.orbitVel) < 0.002 && targetOrbitVel === 0) {
        eng.orbitVel = 0;
      }
      if (!st.isPaused && !st.freezeActive) {
        eng.orbitAngle += dt * eng.orbitVel;
      }

      const activeWave: ShuffleWaveStep | undefined =
        st.phase === 'SHUFFLING' && eng.isShuffling && eng.finalSettleSec <= 0
          ? eng.activePlan[eng.currentStepIndex]
          : undefined;

      // 1. Advance Shuffle Wave Progress (with a clean 0.24s full-stop settle beat before numbers appear)
      if (st.phase === 'SHUFFLING' && eng.isShuffling && !st.isPaused && !st.freezeActive) {
        const speedMultiplier = st.slowMotionActive ? 0.48 : 1.0;

        if (eng.finalSettleSec > 0) {
          // Cups are 100% stationary — let micro-lean and spin come to total rest before numbering
          eng.finalSettleSec -= dt;
          if (eng.finalSettleSec <= 0) {
            eng.finalSettleSec = 0;
            eng.orbitVel = 0;
            eng.isShuffling = false;
            // Snap exact slot coordinates & freeze visual top-to-bottom, left-to-right cup numbers ONCE
            for (let cid = 0; cid < cupCount; cid++) {
              const sc = getWorldSlotCoord(eng.cupSlots[cid], cfg, eng.orbitAngle);
              eng.cupWorldPos[cid].x = sc.x;
              eng.cupWorldPos[cid].z = sc.z;
            }
            const { displayNumByCup, orderedCupIds: frozenOrder } = computeVisualCupOrdering(
              eng.cupWorldPos,
              cupCount
            );
            eng.displayNumByCup = displayNumByCup;
            setOrderedCupIds(frozenOrder);
            st.onShuffleComplete();
          }
        } else if (activeWave) {
          if (eng.pauseRemainingSec > 0) {
            eng.pauseRemainingSec -= dt * speedMultiplier;
            if (eng.pauseRemainingSec <= 0) {
              eng.currentStepIndex += 1;
              eng.stepProgress = 0;
              eng.pauseRemainingSec = 0;
              if (eng.currentStepIndex < eng.activePlan.length) {
                const nextWave = eng.activePlan[eng.currentStepIndex];
                st.onShuffleStepSound(
                  (1000 / Math.max(165, cfg.stepDurationMs * nextWave.durationScale)) * speedMultiplier
                );
              } else {
                // Trigger final full-stop settle beat before showing numbers
                eng.finalSettleSec = 0.24;
              }
            }
          } else {
            const stepDurSec =
              Math.max(0.16, (cfg.stepDurationMs * activeWave.durationScale) / 1000) / speedMultiplier;
            eng.stepProgress += dt / stepDurSec;

            if (eng.stepProgress >= 1.0) {
              eng.stepProgress = 1.0;
              for (const traj of activeWave.trajectories) {
                const isFeint =
                  (traj.kind === 'PASS_BY_LANE' || traj.kind === 'RING_ARC_SWAP') && traj.isFeint;
                if (!isFeint) {
                  eng.cupSlots[traj.cupId] = traj.toSlot;
                }
                const finalSlot = isFeint ? traj.fromSlot : traj.toSlot;
                const slotCoord = getWorldSlotCoord(finalSlot, cfg, eng.orbitAngle);
                eng.cupWorldPos[traj.cupId].x = slotCoord.x;
                eng.cupWorldPos[traj.cupId].z = slotCoord.z;
              }
              if (eng.currentStepIndex + 1 >= eng.activePlan.length) {
                eng.currentStepIndex += 1;
                eng.finalSettleSec = 0.24;
              } else {
                eng.pauseRemainingSec = activeWave.holdPauseSec;
              }
            }
          }
        }
      }

      // 2. Update each cup's 3D position, natural physical rotation, micro-lean & frozen number medallion
      const damp = 1 - Math.exp(-18 * (dt || 0.016));
      const rotDamp = 1 - Math.exp(-11 * (dt || 0.016));
      const showCupNumbers = st.phase === 'SELECTING' || st.phase === 'REVEALING';

      for (let cupId = 0; cupId < MAX_CUPS; cupId++) {
        const node = cupNodes[cupId];
        if (cupId >= cupCount) {
          node.rootGroup.visible = false;
          continue;
        }
        node.rootGroup.visible = true;

        const targetSkin: CupPatternSkin =
          cfg.reelMode === 'split_brain_2x3' && cupId >= 3 && cfg.secondaryCupSkin
            ? cfg.secondaryCupSkin
            : cfg.cupSkin;
        if (node.wallMat.map !== skinTextures[targetSkin]) {
          node.wallMat.map = skinTextures[targetSkin];
          node.wallMat.needsUpdate = true;
        }

        const desiredCapMat = targetSkin === 'crimson_gloss' ? crimsonTopCapMat : whiteTopCapMat;
        if (node.topCapMesh.material !== desiredCapMat) {
          node.topCapMesh.material = desiredCapMat;
        }
        node.bottomLipMat.color.set(targetSkin === 'crimson_gloss' ? '#fca5a5' : '#a7f3d0');

        // Frozen gold-rimmed medallion badge (1..cupCount) — only visible once cups are 100% still!
        const frozenDisplayNum = eng.displayNumByCup[cupId] || cupId + 1;
        const badgeTex = numberBadgeTextures[frozenDisplayNum - 1] || numberBadgeTextures[0];
        if (node.numberBadgeMat.map !== badgeTex) {
          node.numberBadgeMat.map = badgeTex;
          node.numberBadgeMat.needsUpdate = true;
        }
        const targetBadgeOpacity = showCupNumbers ? 1.0 : 0.0;
        node.numberBadgeMat.opacity += (targetBadgeOpacity - node.numberBadgeMat.opacity) * (showCupNumbers ? 0.22 : 0.35);
        node.numberBadgeSprite.visible = node.numberBadgeMat.opacity > 0.02;

        const currentSlot = eng.cupSlots[cupId];
        const posState = eng.cupWorldPos[cupId];
        const motion = eng.cupMotion[cupId];
        const slotCoord = getWorldSlotCoord(currentSlot, cfg, eng.orbitAngle);

        const activeTraj =
          st.phase === 'SHUFFLING' && activeWave && eng.pauseRemainingSec <= 0
            ? activeWave.trajectories.find((tr) => tr.cupId === cupId)
            : undefined;

        let spinDirectionHint = 0;
        let glideHoverY = 0;

        if (activeTraj) {
          const rawT = Math.max(0, Math.min(1, eng.stepProgress));

          if (activeTraj.kind === 'TRACK_SPLINE_GLIDE') {
            const eT = naturalEase(rawT);
            const curve =
              activeTraj.trackKind === 'figure8'
                ? fig8Curve
                : trefoilCurves[activeTraj.chainIndex] || trefoilCurves[0];
            const uRaw = (activeTraj.fromNodeIdx + activeTraj.deltaSteps * eT) / activeTraj.totalNodes;
            const u = ((uRaw % 1) + 1) % 1;
            const pt = curve.getPoint(u);
            posState.x = pt.x;
            posState.z = pt.z;
            spinDirectionHint = Math.sign(activeTraj.deltaSteps || 1) * 1.15;
            glideHoverY = Math.sin(eT * Math.PI) * 0.032;
          } else if (activeTraj.kind === 'RING_CAROUSEL_ROTATION') {
            // Unified Polar-Spline Ring Carousel: all cups on the ring/sub-ring evaluate the exact same periodic curve
            const eT = naturalEase(rawT);
            const ringPt = evaluateUnifiedRingCarouselPoint(
              activeTraj.ringSlots,
              activeTraj.fromRingIdx,
              activeTraj.deltaSteps,
              activeTraj.roundnessBlend,
              eT,
              (s) => getWorldSlotCoord(s, cfg, eng.orbitAngle)
            );
            posState.x = ringPt.x;
            posState.z = ringPt.z;
            spinDirectionHint = -Math.sign(activeTraj.deltaSteps || 1) * 1.3;
            glideHoverY = Math.sin(eT * Math.PI) * 0.036;
          } else if (activeTraj.kind === 'RING_ARC_SWAP') {
            // Curved Concentric Ring-Arc Weave: cups overtake along the ring's natural circular arc instead of chord switching
            let forwardT: number;
            let radialFactor: number;
            if (activeTraj.isFeint) {
              const feint = Math.sin(rawT * Math.PI);
              forwardT = feint * 0.45;
              radialFactor = Math.pow(feint, 0.85);
            } else {
              const eT = naturalEase(rawT);
              forwardT = eT;
              radialFactor = Math.sin(eT * Math.PI);
            }
            const ringPt = evaluateUnifiedRingCarouselPoint(
              activeTraj.ringSlots,
              activeTraj.fromRingIdx,
              activeTraj.deltaSteps,
              0,
              forwardT,
              (s) => getWorldSlotCoord(s, cfg, eng.orbitAngle)
            );
            const rShift = activeTraj.radialLaneOffset * radialFactor;
            posState.x = ringPt.x + Math.cos(ringPt.angle) * rShift;
            posState.z = ringPt.z + Math.sin(ringPt.angle) * rShift;
            spinDirectionHint = -Math.sign(activeTraj.deltaSteps || 1) * 1.25;
            glideHoverY = Math.sin(rawT * Math.PI) * 0.04;
          } else {
            // True 180-degree Elliptical Turntable Orbit around the pair's shared midpoint (smooth C2 circular swap)
            const fromNow = getWorldSlotCoord(activeTraj.fromSlot, cfg, eng.orbitAngle);
            const toNow = getWorldSlotCoord(activeTraj.toSlot, cfg, eng.orbitAngle);

            const warpedT = Math.max(
              0,
              Math.min(1, rawT + activeTraj.leadLagBias * Math.sin(rawT * Math.PI))
            );

            let phi: number;
            let lateralEnvelope: number;

            if (activeTraj.isFeint) {
              const feint = Math.sin(rawT * Math.PI);
              phi = feint * (Math.PI * 0.44);
              lateralEnvelope = Math.sin(phi);
            } else {
              const eT = naturalEase(warpedT);
              phi = Math.PI * eT;
              lateralEnvelope = Math.sin(phi);
            }

            const mx = (fromNow.x + toNow.x) * 0.5;
            const mz = (fromNow.z + toNow.z) * 0.5;
            const dx = toNow.x - fromNow.x;
            const dz = toNow.z - fromNow.z;
            const dist = Math.max(0.001, Math.hypot(dx, dz));
            const halfDist = dist * 0.5;
            const ux = dx / dist;
            const uz = dz / dist;

            const nx = -uz;
            const nz = ux;

            const baseShift = Math.min(1.18, Math.abs(activeTraj.laneOffsetWorld) * 0.84);
            const laneShift = Math.sign(activeTraj.laneOffsetWorld) * (dist > 4.5 ? Math.max(1.15, baseShift) : baseShift);

            const alongOffset = -halfDist * Math.cos(phi);
            const sideOffset = laneShift * lateralEnvelope;

            posState.x = mx + ux * alongOffset + nx * sideOffset;
            posState.z = mz + uz * alongOffset + nz * sideOffset;
            spinDirectionHint = Math.sign(activeTraj.laneOffsetWorld || 1) * 1.15;
            glideHoverY = lateralEnvelope * 0.038;
          }
        } else {
          posState.x += (slotCoord.x - posState.x) * damp;
          posState.z += (slotCoord.z - posState.z) * damp;
        }

        // Compute natural instantaneous velocity for organic 3D spin & subtle inertial micro-lean
        let vx = 0;
        let vz = 0;
        if (dt > 0.0005 && !st.isPaused) {
          vx = (posState.x - motion.prevX) / dt;
          vz = (posState.z - motion.prevZ) / dt;
        }
        motion.prevX = posState.x;
        motion.prevZ = posState.z;

        const speed = Math.hypot(vx, vz);
        const isActivelyMoving = st.phase === 'SHUFFLING' && !st.freezeActive && eng.finalSettleSec <= 0 && speed > 0.08;

        // Smooth physical Y-rotation proportional to glide speed & arc direction (settles cleanly to rest)
        const targetSpinVel = isActivelyMoving
          ? (spinDirectionHint || (cupId % 2 === 0 ? 1 : -1)) * Math.min(5.2, speed * 0.45)
          : 0;
        motion.spinVelY += (targetSpinVel - motion.spinVelY) * rotDamp;
        if (Math.abs(motion.spinVelY) < 0.004) motion.spinVelY = 0;
        motion.spinY += motion.spinVelY * dt;

        // Determine target vertical lift (liftY)
        let targetLiftY = 0;
        const isPrimaryBallCup = cupId === st.ballCupId;
        const isSecondaryBallCup = cfg.reelMode === 'split_brain_2x3' && cupId === st.secondaryBallCupId;
        const isDecoyCup = st.decoyCupIds.includes(cupId);

        if (st.phase === 'OBSERVE') {
          if (isPrimaryBallCup || isSecondaryBallCup || isDecoyCup) {
            targetLiftY = 1.38;
          }
        } else if (st.phase === 'SHUFFLING') {
          if (
            activeTraj &&
            (activeTraj.kind === 'PASS_BY_LANE' || activeTraj.kind === 'RING_ARC_SWAP') &&
            activeTraj.peekDecoyLift
          ) {
            targetLiftY = Math.sin(eng.stepProgress * Math.PI) * 0.68;
          } else {
            targetLiftY = glideHoverY;
          }
        } else if (st.phase === 'SELECTING') {
          if (st.revealedEmptyCupIds.includes(cupId)) {
            targetLiftY = 1.32;
          } else if (st.selectedCupId === cupId || st.selectedSecondaryCupId === cupId) {
            targetLiftY = 0.3;
          } else if (st.hoveredCupId === cupId) {
            targetLiftY = 0.14;
          }
        } else if (st.phase === 'REVEALING') {
          if (st.selectedCupId === cupId || st.selectedSecondaryCupId === cupId) {
            targetLiftY = 1.44;
          } else if (st.showTrueBallCup && (isPrimaryBallCup || isSecondaryBallCup)) {
            targetLiftY = 1.42;
          } else if (st.revealedEmptyCupIds.includes(cupId)) {
            targetLiftY = 1.25;
          }
        }

        posState.liftY += (targetLiftY - posState.liftY) * damp;

        // Subtle inertial lean + gentle centrifugal banking during ring rotations
        const liftTiltX = -0.1 * Math.min(1, posState.liftY / 1.38);
        const targetLeanZ = isActivelyMoving ? Math.max(-0.075, Math.min(0.075, -vx * 0.011)) : 0;
        const targetLeanX =
          (isActivelyMoving ? Math.max(-0.075, Math.min(0.075, vz * 0.011)) : 0) + liftTiltX;
        motion.leanX += (targetLeanX - motion.leanX) * rotDamp;
        motion.leanZ += (targetLeanZ - motion.leanZ) * rotDamp;

        node.rootGroup.position.set(posState.x, 0, posState.z);
        node.cupLifter.position.y = posState.liftY;
        node.cupLifter.rotation.set(motion.leanX, motion.spinY, motion.leanZ);

        // Smoothly float the gold medallion right above the cup crown (scales gently on hover or reveal)
        const isHovered = st.phase === 'SELECTING' && st.hoveredCupId === cupId;
        const badgeScale = (0.56 + 0.14 * node.numberBadgeMat.opacity) * (isHovered ? 1.12 : 1.0);
        node.numberBadgeSprite.scale.set(badgeScale, badgeScale, 1);
        node.numberBadgeSprite.position.set(0, 1.44 + posState.liftY, 0);

        const shadowScale = Math.max(0.52, 1 - posState.liftY * 0.22);
        node.shadowDisc.scale.set(shadowScale, shadowScale, 1);
        node.shadowMat.opacity = Math.max(0.18, 0.65 - posState.liftY * 0.28);

        const isExtraVisionTarget = st.extraVisionActive && (isPrimaryBallCup || isSecondaryBallCup);
        const targetOpacity = isExtraVisionTarget ? 0.28 : 1.0;
        node.wallMat.opacity += (targetOpacity - node.wallMat.opacity) * 0.2;

        if (isExtraVisionTarget) {
          node.wallMat.emissive.set(isSecondaryBallCup ? '#ec4899' : '#fbbf24');
          node.wallMat.emissiveIntensity = 0.75;
        } else if (st.freezeActive && st.phase === 'SHUFFLING') {
          node.wallMat.emissive.set('#38bdf8');
          node.wallMat.emissiveIntensity = 0.45;
        } else {
          node.wallMat.emissive.set(targetSkin === 'crimson_gloss' ? '#3b0707' : '#042f2e');
          node.wallMat.emissiveIntensity = 0.16;
        }

        if (isExtraVisionTarget) {
          node.selectionHaloMat.color.set(isSecondaryBallCup ? '#ec4899' : '#fbbf24');
          node.selectionHaloMat.opacity = 0.88;
        } else if (st.phase === 'SELECTING' && (st.selectedCupId === cupId || st.selectedSecondaryCupId === cupId)) {
          node.selectionHaloMat.color.set('#fbbf24');
          node.selectionHaloMat.opacity = 0.92;
        } else if (st.phase === 'REVEALING' && (cupId === st.selectedCupId || cupId === st.selectedSecondaryCupId)) {
          const isRight =
            (cupId === st.selectedCupId && cupId === st.ballCupId) ||
            (cupId === st.selectedSecondaryCupId && cupId === st.secondaryBallCupId);
          node.selectionHaloMat.color.set(isRight ? '#fbbf24' : '#f43f5e');
          node.selectionHaloMat.opacity = 0.92;
        } else if (isHovered) {
          node.selectionHaloMat.color.set('#fbbf24');
          node.selectionHaloMat.opacity = 0.82;
        } else {
          node.selectionHaloMat.opacity *= 0.85;
        }
      }

      // 3. Synchronize Primary Target: Shiny Golden Ball OR 3D Golden Die!
      // NEVER reveal target or its floor glow/ring while hovering during SELECTING (unless X-Ray Extra Vision is active)
      const canRevealTargets = st.phase === 'OBSERVE' || st.phase === 'REVEALING';
      const ballOwnerPos = eng.cupWorldPos[st.ballCupId] || { x: 0, z: 0, liftY: 0 };
      const isPrimaryVisible = st.extraVisionActive || (canRevealTargets && ballOwnerPos.liftY > 0.08);
      const isGoldenDieMode = cfg.targetType === 'golden_die' || cfg.reelMode === 'crimson_die_oval_8';

      if (isGoldenDieMode) {
        goldBallGroup.visible = false;
        goldenDieGroup.position.x = ballOwnerPos.x;
        goldenDieGroup.position.z = ballOwnerPos.z;
        goldenDieGroup.visible = isPrimaryVisible;
        if (isPrimaryVisible) {
          goldenDieMesh.position.y = 0.42 + Math.max(0, Math.sin(now * 0.005) * 0.04);
          goldenDieMesh.rotation.y = now * 0.0012;
          goldenDieMesh.rotation.x = 0.38 + Math.sin(now * 0.002) * 0.12;
        }
      } else {
        goldenDieGroup.visible = false;
        goldBallGroup.position.x = ballOwnerPos.x;
        goldBallGroup.position.z = ballOwnerPos.z;
        goldBallGroup.visible = isPrimaryVisible;
        if (isPrimaryVisible) {
          goldBallMesh.position.y = 0.34 + Math.max(0, Math.sin(now * 0.005) * 0.035);
          goldBallMesh.rotation.y = now * 0.0014;
          const ringPulse = 1 + Math.sin(now * 0.006) * 0.07;
          goldRevealRing.scale.set(ringPulse, ringPulse, 1);
          goldRevealRingMat.opacity = 0.62 + Math.sin(now * 0.006) * 0.26;
        }
      }

      // 4. Synchronize Secondary Pink Ball (Split Brain)
      if (cfg.reelMode === 'split_brain_2x3' && st.secondaryBallCupId !== null) {
        const pinkOwnerPos = eng.cupWorldPos[st.secondaryBallCupId] || { x: 0, z: 0, liftY: 0 };
        pinkBallGroup.position.x = pinkOwnerPos.x;
        pinkBallGroup.position.z = pinkOwnerPos.z;
        const isPinkVisible = st.extraVisionActive || (canRevealTargets && pinkOwnerPos.liftY > 0.08);
        pinkBallGroup.visible = isPinkVisible;
        if (isPinkVisible) {
          pinkBallMesh.position.y = 0.34 + Math.max(0, Math.cos(now * 0.005) * 0.035);
        }
      } else {
        pinkBallGroup.visible = false;
      }

      // 5. Synchronize Decoy Balls (Mind Trap) — never visible on hover during SELECTING
      const canRevealDecoys = st.phase === 'OBSERVE' || st.phase === 'SHUFFLING' || st.phase === 'REVEALING';
      for (let dIdx = 0; dIdx < MAX_DECOYS; dIdx++) {
        const dGroup = decoyBallGroups[dIdx];
        const dCupId = st.decoyCupIds[dIdx];
        if (typeof dCupId === 'number' && dCupId < cupCount) {
          const dPos = eng.cupWorldPos[dCupId] || { x: 0, z: 0, liftY: 0 };
          dGroup.position.x = dPos.x;
          dGroup.position.z = dPos.z;
          dGroup.visible = canRevealDecoys && dPos.liftY > 0.08;
        } else {
          dGroup.visible = false;
        }
      }

      // 6. Golden Particle Burst
      const shouldEmitParticles =
        (st.phase === 'OBSERVE' && ballOwnerPos.liftY > 0.5) ||
        (st.phase === 'REVEALING' && st.selectedCupId === st.ballCupId && ballOwnerPos.liftY > 0.5) ||
        eng.burstTimer > 0;

      if (eng.burstTimer > 0) {
        eng.burstTimer = Math.max(0, eng.burstTimer - dt);
      }

      if (shouldEmitParticles) {
        particleSystem.position.set(ballOwnerPos.x, 0.25, ballOwnerPos.z);
        particleMat.opacity = Math.min(0.95, particleMat.opacity + dt * 4);
        const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let px = posAttr.getX(i) + particleVelocities[i].vx * dt;
          let py = posAttr.getY(i) + particleVelocities[i].vy * dt;
          let pz = posAttr.getZ(i) + particleVelocities[i].vz * dt;
          if (py > 2.4) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.12 + Math.random() * 0.35;
            px = Math.cos(angle) * r;
            py = 0.15;
            pz = Math.sin(angle) * r;
          }
          posAttr.setXYZ(i, px, py, pz);
        }
        posAttr.needsUpdate = true;
      } else {
        particleMat.opacity = Math.max(0, particleMat.opacity - dt * 3.5);
      }

      // 7. Gentle Ambient Studio Bokeh Drift
      ambientMotes.rotation.y = now * 0.00008;
      const moteAttr = moteGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < MOTE_COUNT; i++) {
        const yBase = moteAttr.getY(i);
        moteAttr.setY(i, yBase + Math.sin(now * 0.001 + motePhases[i]) * 0.0012);
      }
      moteAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);

      cupWallGeo.dispose();
      innerCavityGeo.dispose();
      whiteTopCapGeo.dispose();
      topRimBevelGeo.dispose();
      goldCollarGeo.dispose();
      bottomLipTorusGeo.dispose();
      contactShadowGeo.dispose();
      stageRimGeo.dispose();
      goldRevealRingGeo.dispose();
      dieBoxGeo.dispose();
      dieRingGeo.dispose();
      ovalTubeGeo.dispose();
      fig8TubeGeo.dispose();
      trefoilGeos.forEach((g) => g.dispose());
      innerCavityMat.dispose();
      whiteTopCapMat.dispose();
      crimsonTopCapMat.dispose();
      topBevelMat.dispose();
      goldCollarMat.dispose();
      stageRimMat.dispose();
      goldRevealRingMat.dispose();
      goldBallMat.dispose();
      goldFloorGlowMat.dispose();
      dieRingMat.dispose();
      dieFaceMaterials.forEach((m) => m.dispose());
      dieFaceTextures.forEach((t) => t.dispose());
      pinkBallMat.dispose();
      pinkFloorGlowMat.dispose();
      decoyBallMat.dispose();
      decoyGlowMat.dispose();
      tableMat.dispose();
      studioTableTex.dispose();
      dividerLineMat.dispose();
      bottomHalfFloorMat.dispose();
      ovalTubeMat.dispose();
      fig8TubeMat.dispose();
      trefoilTrackMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      moteGeo.dispose();
      moteMat.dispose();
      goldGlowTex.dispose();
      pinkGlowTex.dispose();
      decoyGlowTex.dispose();
      numberBadgeTextures.forEach((t) => t.dispose());
      Object.values(skinTextures).forEach((t) => t.dispose());
      envMap.dispose();
      pmremGenerator.dispose();
      cupNodes.forEach((n) => {
        n.wallMat.dispose();
        n.numberBadgeMat.dispose();
        n.bottomLipMat.dispose();
        n.selectionHaloMat.dispose();
        n.shadowMat.dispose();
      });
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCupForDisplayIndex = (displayIdx: number): number => {
    return orderedCupIds[displayIdx] ?? displayIdx;
  };

  const trueBallDisplayIdx = orderedCupIds.slice(0, levelConfig.cupCount).indexOf(ballCupId);
  const trueBallSlotNumber = trueBallDisplayIdx >= 0 ? trueBallDisplayIdx + 1 : ballCupId + 1;

  const renderStyledSubtitle = (subtitle: string) => {
    const parts = subtitle.split(/(GOLD|DIE|BOTH BALLS|NEVER STOP SPINNING|INFINITY|TREFOIL)/g);
    return parts.map((part, idx) =>
      part === 'GOLD' ||
      part === 'DIE' ||
      part === 'BOTH BALLS' ||
      part === 'NEVER STOP SPINNING' ||
      part === 'INFINITY' ||
      part === 'TREFOIL' ? (
        <span key={idx} className="text-amber-400">
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  if (webglFallback) {
    return (
      <div className="relative w-full h-full min-h-[380px] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#03161b] to-[#072a32] rounded-2xl border border-amber-400/25">
        <div className="grid grid-cols-3 gap-4 max-w-sm w-full">
          {Array.from({ length: levelConfig.cupCount }, (_, displayIdx) => {
            const cupId = getCupForDisplayIndex(displayIdx);
            const isBallHere = cupId === ballCupId || cupId === secondaryBallCupId;
            return (
              <button
                key={displayIdx}
                type="button"
                disabled={phase !== 'SELECTING' || revealedEmptyCupIds.includes(cupId)}
                onClick={() => phase === 'SELECTING' && onSelectCup(cupId)}
                className="h-24 rounded-2xl border border-amber-400/35 bg-teal-900/50 flex flex-col items-center justify-center text-white font-black"
              >
                <span>Cup #{displayIdx + 1}</span>
                {phase === 'OBSERVE' && isBallHere && (
                  <span className="text-amber-300 text-xs">
                    ● {levelConfig.targetType === 'golden_die' ? 'DIE' : 'BALL'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-full min-w-0 h-[390px] sm:h-[465px] select-none overflow-hidden rounded-2xl bg-[#021216]">
      {/* Main Three.js Interactive 3D Canvas Container */}
      <div ref={containerRef} className="w-full max-w-full min-w-0 h-full touch-none overflow-hidden" />

      {/* Subtle studio vignette frame */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-400/20 shadow-[inset_0_0_48px_rgba(0,0,0,0.55)]" />

      {/* Top Center Studio Title Overlay */}
      <div className="pointer-events-none absolute top-3 inset-x-3 flex flex-col items-center text-center">
        <div className="text-lg sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] uppercase leading-none">
          {levelConfig.reelHeaderTitle}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-amber-400/70" />
          <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.2em] text-slate-100/95 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] uppercase">
            {renderStyledSubtitle(levelConfig.reelHeaderSubtitle)}
          </span>
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-amber-400/70" />
        </div>
      </div>

      {/* Active Power-Up Status Indicators */}
      {(freezeActive || slowMotionActive || extraVisionActive) && (
        <div className="pointer-events-none absolute top-14 left-3 flex items-center gap-2 text-[11px] font-black tracking-widest uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
          {freezeActive && <span className="text-sky-300">FREEZE</span>}
          {slowMotionActive && <span className="text-teal-300">SLOW-MO</span>}
          {extraVisionActive && <span className="text-amber-300">X-RAY</span>}
        </div>
      )}

      {/* Countdown (3... 2... 1...) */}
      {phase === 'COUNTDOWN' && countdownNum !== null && countdownNum !== undefined && (
        <div className="pointer-events-none absolute bottom-5 inset-x-0 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl font-black text-amber-300 drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] tabular-nums">
            {countdownNum}
          </span>
        </div>
      )}

      {/* Direct "WHICH CUP?" + Frozen Gold-Trimmed Numbered Dock */}
      {phase === 'SELECTING' && !isPaused && (
        <div className="absolute bottom-2.5 inset-x-3 flex flex-col items-center justify-center pointer-events-none gap-1.5">
          <div className="text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            <div className="text-sm sm:text-base font-black text-amber-200 tracking-[0.18em] uppercase leading-none">
              {levelConfig.reelMode === 'split_brain_2x3' ? 'PICK 1 TOP + 1 BOTTOM' : 'PICK A CUP'}
            </div>
          </div>

          <div className="pointer-events-auto bg-[#021116]/90 backdrop-blur-md border border-amber-400/35 rounded-2xl px-2.5 py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.65)] flex items-center gap-1.5 flex-wrap justify-center">
            {Array.from({ length: levelConfig.cupCount }, (_, displayIdx) => {
              const cupId = getCupForDisplayIndex(displayIdx);
              const isDisabled =
                revealedEmptyCupIds.includes(cupId) ||
                selectedCupId === cupId ||
                selectedSecondaryCupId === cupId;
              return (
                <button
                  key={displayIdx}
                  type="button"
                  disabled={isDisabled}
                  onMouseEnter={() => setHoveredCupId(cupId)}
                  onMouseLeave={() => setHoveredCupId(null)}
                  onClick={() => onSelectCup(cupId)}
                  className={`w-8 h-8 rounded-full text-xs font-black transition-all cursor-pointer tabular-nums ${
                    selectedCupId === cupId || selectedSecondaryCupId === cupId
                      ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-2 border-amber-100 shadow-md shadow-amber-500/30'
                      : isDisabled
                      ? 'bg-slate-900/60 text-slate-600 border border-slate-700/40 cursor-not-allowed'
                      : hoveredCupId === cupId
                      ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border border-amber-100 scale-110 shadow-lg shadow-amber-400/35'
                      : 'bg-[#04242c] text-amber-100 border border-amber-400/45 hover:border-amber-300 hover:bg-[#063440] active:scale-95'
                  }`}
                  title={`Cup ${displayIdx + 1}`}
                >
                  {displayIdx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reveal Caption */}
      {phase === 'REVEALING' && (
        <div className="pointer-events-none absolute bottom-3.5 inset-x-4 flex flex-col items-center text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
          <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-[0.14em] uppercase">
            CUP {trueBallSlotNumber}
          </div>
        </div>
      )}
    </div>
  );
};
