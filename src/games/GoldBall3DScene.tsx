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

// Wide-Gap Non-Overlapping Passing Trajectories:
// 1. PASS_BY_LANE: Two or three cups exchange positions by pulling into wide, separated parallel/curved passing lanes
//    with an asymmetric lead/follow timing offset so you clearly watch them PASS by each other with >1.3 units of open space between them (never colliding or flipping in place).
// 2. PERIMETER_RING_SPIN: Smooth carousel stream rotation around the outer perimeter / oval / figure-8 loop.
export type SpotQuestMoveTrajectory =
  | {
      kind: 'PASS_BY_LANE';
      cupId: number;
      fromSlot: number;
      toSlot: number;
      laneOffsetWorld: number; // Signed perpendicular passing lane distance in world units (guarantees wide visible gap between passing cups)
      leadLagBias: number;     // Asymmetric lead (+0.11) vs follow (-0.11) timing offset so one cup visibly leads while the other passes alongside
      isFeint: boolean;
      peekDecoyLift: boolean;
    }
  | {
      kind: 'PERIMETER_RING_SPIN';
      cupId: number;
      fromSlot: number;
      toSlot: number;
      startAngle: number;
      deltaAngle: number;
      startRadiusX: number;
      startRadiusZ: number;
      endRadiusX: number;
      endRadiusZ: number;
      ringRadiusX: number;
      ringRadiusZ: number;
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

// 8 outer oval ring slots of Mission Impossible (slots 0..7 are the outer oval ring, slot 8 is the center hub!)
const MISSION_IMPOSSIBLE_RING_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7];

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
 * Every formation now has significantly increased spacing between cups so there is a wide, unobstructed
 * dark floor gap between every cup silhouette and passing lanes never crowd or overlap.
 */
export function getFormationBaseSlots(
  mode: ReelChallengeMode
): Array<{ x: number; z: number; group: 'top' | 'bottom' | 'all' }> {
  // 1. BRAIN BREAKER (12 Cups Wide 3x4 Grid — Reel DgIdJcEwjXV)
  if (mode === 'brain_breaker_12') {
    const slots: Array<{ x: number; z: number; group: 'all' }> = [];
    const colSpacing = 2.82; // Increased from 2.05 -> 2.82 for crystal-clear horizontal passing lanes
    const rowSpacing = 2.18; // Increased from 1.72 -> 2.18 for clear vertical gaps between all 4 rows
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
    const radius = 3.72; // Increased from 3.05 -> 3.72
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
    const radius = 4.12; // Increased from 3.45 -> 4.12
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
    const colSpacing = 2.92; // Increased from 2.25 -> 2.92
    const rowZ = 2.35;       // Increased from 1.78 -> 2.35
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
    // Matches the exact 8-cup vertical stadium oval layout from Reel DeU6nw4yeSM
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
    // Slot 8 is the Center Hub Cup (0, 0) where the gold ball is revealed at start in Reel Df0w2I2Ma2j!
    slots.push({ x: 0, z: 0, group: 'all' });
    return slots;
  }

  // 7. FOLLOW THE GOLD: FIGURE-8 INFINITY TRACK (12 Cups on Hourglass Infinity Loop — Reel DfLSUkHvDeD)
  if (mode === 'infinity_figure8_12') {
    // Matches the 12-node vertical hourglass / figure-8 loop from Reel DfLSUkHvDeD
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
    // 3 clover petals at -90 deg (Top), +150 deg (Bottom-Left), and +30 deg (Bottom-Right)
    // Each petal has 4 well-separated cup positions along its loop
    const slots: Array<{ x: number; z: number; group: 'all' }> = [];
    const lobeAngles = [-Math.PI / 2, (5 * Math.PI) / 6, Math.PI / 6];
    for (let lobe = 0; lobe < 3; lobe++) {
      const theta = lobeAngles[lobe];
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const px = -sinT;
      const pz = cosT;

      // 4 nodes forming a wide teardrop petal loop: Outer Tip, Right Flank, Left Flank, Inner Neck
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
  const spX = 2.72; // Increased from 2.02 -> 2.72 (+35% wider gap between columns!)
  const spZ = 2.54; // Increased from 2.02 -> 2.54 (+26% wider gap between rows!)
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

    // Metallic 24K gold gradient face with warm bevel border
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

    // Draw dark recessed pips
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

// Create a crisp transparent decal texture with the cup number (1..12) printed directly on the front wall of the 3D cup
function createCupNumberDecalTexture(num: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 256);

  ctx.font = '900 138px Inter, system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.45)';
  ctx.strokeText(String(num), 128, 134);

  ctx.fillStyle = '#02171b';
  ctx.fillText(String(num), 128, 134);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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
 * Compute a wide, guaranteed non-overlapping lateral passing lane offset (in world units)
 * when two cups exchange positions between slot1 and slot2:
 * - Returns a minimum perpendicular lane bow of >= 1.22 world units from the connecting centerline,
 *   so the two passing cups stay >= 2.44 world units apart at midpoint (leaving > 1.35 units of clear empty floor between them!).
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

// Build the Choreography Plan where cups exchange positions by PASSING EACH OTHER in wide, clearly visible lanes
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
    // Smooth accelerando with slightly longer base glide so the wide lane passing motion is crystal clear
    const durationScale = 1.26 - progressRatio * 0.40;
    const holdPauseSec = Math.max(0.042, 0.075 - progressRatio * 0.025);

    // -------------------------------------------------------------------------
    // 1. SPLIT BRAIN MODE (Reel DgJ68l6HJVw: 3 Top + 3 Bottom Simultaneous Wide Passes)
    // -------------------------------------------------------------------------
    if (cfg.reelMode === 'split_brain_2x3') {
      const topSlots = [0, 1, 2];
      const botSlots = [3, 4, 5];

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
          leadLagBias: 0.11,
          isFeint: topFeint,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: cT2,
          fromSlot: t2,
          toSlot: t1,
          laneOffsetWorld: topLane,
          leadLagBias: -0.11,
          isFeint: topFeint,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: cB1,
          fromSlot: b1,
          toSlot: b2,
          laneOffsetWorld: botLane,
          leadLagBias: 0.11,
          isFeint: botFeint,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: cB2,
          fromSlot: b2,
          toSlot: b1,
          laneOffsetWorld: botLane,
          leadLagBias: -0.11,
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
    // 2. FIGURE-8 INFINITY LOOP STREAM PASSING (Reel DfLSUkHvDeD — 12 Cups)
    // -------------------------------------------------------------------------
    if (cfg.reelMode === 'infinity_figure8_12' && step % 3 === 1) {
      // Shift all 12 cups smoothly along the Figure-8 Infinity track by +1 or -1 station so they glide past each other along the ∞ loop!
      const shift = step % 2 === 0 ? 1 : -1;
      const trajectories: SpotQuestMoveTrajectory[] = [];
      const newCupAtSlot = [...cupAtSlot];

      for (let idx = 0; idx < 12; idx++) {
        const fromSlot = FIGURE8_LOOP_ORDER[idx];
        const toSlot = FIGURE8_LOOP_ORDER[(idx + shift + 12) % 12];
        const cupId = cupAtSlot[fromSlot];
        trajectories.push({
          kind: 'PASS_BY_LANE',
          cupId,
          fromSlot,
          toSlot,
          laneOffsetWorld: 0.45 * shift,
          leadLagBias: 0,
          isFeint: false,
          peekDecoyLift: false,
        });
        currentSlotOfCup[cupId] = toSlot;
        newCupAtSlot[toSlot] = cupId;
      }
      for (let s = 0; s < 12; s++) cupAtSlot[s] = newCupAtSlot[s];
      plan.push({ trajectories, durationScale: durationScale * 1.15, holdPauseSec });
      continue;
    }

    // -------------------------------------------------------------------------
    // 3. CHAOS MODE 3-PETAL CLOVER LOBE STREAM PASSING (Reel DfpCaSfMD1v — 12 Cups)
    // -------------------------------------------------------------------------
    if (cfg.reelMode === 'chaos_trefoil_12' && step % 2 === 1) {
      // Rotate one or two 4-cup clover petals in a smooth continuous stream around their petal loop!
      const ballSlot = currentSlotOfCup[ballCupId];
      const activeChain =
        TREFOIL_PETAL_CHAINS.find((ch) => ch.includes(ballSlot)) ||
        TREFOIL_PETAL_CHAINS[step % TREFOIL_PETAL_CHAINS.length];
      const reverse = step % 4 === 3;
      const ordered = reverse ? [...activeChain].reverse() : activeChain;
      const n = ordered.length;
      const trajectories: SpotQuestMoveTrajectory[] = [];
      const movedCups = ordered.map((s) => cupAtSlot[s]);

      for (let i = 0; i < n; i++) {
        const fromSlot = ordered[i];
        const toSlot = ordered[(i + 1) % n];
        const cupId = movedCups[i];
        trajectories.push({
          kind: 'PASS_BY_LANE',
          cupId,
          fromSlot,
          toSlot,
          laneOffsetWorld: reverse ? -0.68 : 0.68,
          leadLagBias: 0,
          isFeint: false,
          peekDecoyLift: false,
        });
        currentSlotOfCup[cupId] = toSlot;
        cupAtSlot[toSlot] = cupId;
      }
      plan.push({ trajectories, durationScale: durationScale * 1.12, holdPauseSec });
      continue;
    }

    // -------------------------------------------------------------------------
    // 4. SIGNATURE 8-CUP OUTER PERIMETER CAROUSEL RING ROTATION
    //    (On Classic 3x3 Grid, Mission Impossible 8-Ring+Center, and 8-Cup Crimson Die Oval!)
    // -------------------------------------------------------------------------
    const is3x3Grid = cfg.reelMode === 'classic_3x3' && cupCount === 9;
    const isMissionImpossible = cfg.reelMode === 'mission_impossible_9' && cupCount === 9;
    const isCrimsonOval = cfg.reelMode === 'crimson_die_oval_8' && cupCount === 8;

    const shouldTriggerPerimeterRing =
      (is3x3Grid || isMissionImpossible || isCrimsonOval) &&
      totalSteps >= 6 &&
      (step === Math.floor(totalSteps * 0.35) ||
        step === Math.floor(totalSteps * 0.68) ||
        (totalSteps >= 14 && step === Math.floor(totalSteps * 0.85)));

    if (shouldTriggerPerimeterRing) {
      const ringSlots = is3x3Grid ? PERIMETER_CW_SLOTS_3X3 : MISSION_IMPOSSIBLE_RING_SLOTS;
      const shiftOptions = [2, -2, 3, -3];
      const shiftSteps = shiftOptions[step % shiftOptions.length];
      const ringRx = is3x3Grid ? 3.35 : isMissionImpossible ? 3.45 : 3.25;
      const ringRz = is3x3Grid ? 3.20 : isMissionImpossible ? 3.95 : 3.95;

      const trajectories: SpotQuestMoveTrajectory[] = [];
      const newCupAtSlot = [...cupAtSlot];

      for (let idx = 0; idx < 8; idx++) {
        const fromSlot = ringSlots[idx];
        const nextRingIdx = (idx + shiftSteps + 8) % 8;
        const toSlot = ringSlots[nextRingIdx];
        const cupId = cupAtSlot[fromSlot];

        const fromCoord = baseSlots[fromSlot];
        const toCoord = baseSlots[toSlot];

        const startAngle = Math.atan2(fromCoord.z / ringRz, fromCoord.x / ringRx);
        const endAngle = Math.atan2(toCoord.z / ringRz, toCoord.x / ringRx);

        let deltaAngle = endAngle - startAngle;
        if (shiftSteps > 0) {
          while (deltaAngle <= 0) deltaAngle += Math.PI * 2;
        } else {
          while (deltaAngle >= 0) deltaAngle -= Math.PI * 2;
        }

        trajectories.push({
          kind: 'PERIMETER_RING_SPIN',
          cupId,
          fromSlot,
          toSlot,
          startAngle,
          deltaAngle,
          startRadiusX: Math.abs(fromCoord.x) > 0.01 ? Math.hypot(fromCoord.x, fromCoord.z * (ringRx / ringRz)) : ringRx,
          startRadiusZ: Math.abs(fromCoord.z) > 0.01 ? Math.hypot(fromCoord.x * (ringRz / ringRx), fromCoord.z) : ringRz,
          endRadiusX: Math.abs(toCoord.x) > 0.01 ? Math.hypot(toCoord.x, toCoord.z * (ringRx / ringRz)) : ringRx,
          endRadiusZ: Math.abs(toCoord.z) > 0.01 ? Math.hypot(toCoord.x * (ringRz / ringRx), toCoord.z) : ringRz,
          ringRadiusX: ringRx,
          ringRadiusZ: ringRz,
        });

        currentSlotOfCup[cupId] = toSlot;
        newCupAtSlot[toSlot] = cupId;
      }

      for (let s = 0; s < cupCount; s++) cupAtSlot[s] = newCupAtSlot[s];

      plan.push({
        trajectories,
        durationScale: Math.max(1.28, durationScale * 1.45),
        holdPauseSec: holdPauseSec + 0.025,
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // 5. 3-CUP COLUMN / DIAGONAL "SNAKE STREAM" PASS (On 3x3 Grid)
    //    Cups 1 and 2 glide forward along one lane while Cup 3 loops wide in the outer passing lane!
    // -------------------------------------------------------------------------
    const shouldTriggerSnakeTrain =
      is3x3Grid &&
      step > 1 &&
      (step % 4 === 2 || (cfg.simultaneousSwaps >= 2 && step % 3 === 1));

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
          laneOffsetWorld: 0.72 * sideSign,
          leadLagBias: 0.08,
          isFeint: false,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: c1,
          fromSlot: s1,
          toSlot: s2,
          laneOffsetWorld: 0.72 * sideSign,
          leadLagBias: 0.08,
          isFeint: false,
          peekDecoyLift: false,
        },
        {
          kind: 'PASS_BY_LANE',
          cupId: c2,
          fromSlot: s2,
          toSlot: s0,
          laneOffsetWorld: 1.65 * sideSign, // Loops wide around the outside lane so it clearly passes the other two cups!
          leadLagBias: -0.08,
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
    // 6. WIDE TWO-LANE PASS-BY EXCHANGES (PASS_BY_LANE)
    //    Two cups exchange positions by pulling into wide left/right passing lanes
    //    with lead/follow timing offset so you clearly see them pass each other!
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
      if (!usedSlots.has(ballSlot) && p === 0 && Math.random() < 0.84) {
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
          return d >= 1.6 && d <= 4.6;
        });
        if (near.length > 0) candidates = near;
      }

      // If this is a 2nd simultaneous pair (p > 0), filter candidates so its midpoint is far (>= 3.3 units) from Pair 1
      // so the two passing pairs NEVER cross or overlap each other in the middle of the arena!
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

      // Notice: because cup1 goes from slot1 -> slot2 and cup2 goes from slot2 -> slot1,
      // their forward vectors (to - from) are opposite, so using the same signed laneOffsetWorld
      // pushes cup1 to the LEFT passing lane and cup2 to the RIGHT passing lane!
      // And leadLagBias (+0.11 vs -0.11) makes cup1 visibly lead through its lane while cup2 passes by in the opposite lane!
      trajectories.push({
        kind: 'PASS_BY_LANE',
        cupId: cup1,
        fromSlot: slot1,
        toSlot: slot2,
        laneOffsetWorld,
        leadLagBias: 0.11,
        isFeint,
        peekDecoyLift: peekDecoy1,
      });
      trajectories.push({
        kind: 'PASS_BY_LANE',
        cupId: cup2,
        fromSlot: slot2,
        toSlot: slot1,
        laneOffsetWorld,
        leadLagBias: -0.11,
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
        durationScale,
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
  const [cupSlotPositions, setCupSlotPositions] = useState<number[]>(
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
    orbitAngle: number;
    activePlan: ShuffleWaveStep[];
    currentStepIndex: number;
    stepProgress: number;
    pauseRemainingSec: number;
    isShuffling: boolean;
    burstTimer: number;
  }>({
    cupSlots: Array.from({ length: MAX_CUPS }, (_, i) => i),
    cupWorldPos: Array.from({ length: MAX_CUPS }, () => ({ x: 0, z: 0, liftY: 0 })),
    orbitAngle: 0,
    activePlan: [],
    currentStepIndex: 0,
    stepProgress: 0,
    pauseRemainingSec: 0,
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
    for (let i = 0; i < MAX_CUPS; i++) {
      const s = baseSlots[i] || { x: 0, z: 0 };
      eng.cupWorldPos[i] = { x: s.x, z: s.z, liftY: 0 };
    }
    setCupSlotPositions([...eng.cupSlots]);
  }, [levelConfig.level, levelConfig.reelMode]);

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
      eng.isShuffling = true;
      if (plan.length > 0) {
        stateRef.current.onShuffleStepSound(
          1000 / Math.max(170, levelConfig.stepDurationMs * plan[0].durationScale)
        );
      } else {
        eng.isShuffling = false;
        stateRef.current.onShuffleComplete();
      }
    } else {
      eng.isShuffling = false;
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

    const numberDecalTextures: THREE.CanvasTexture[] = Array.from({ length: MAX_CUPS }, (_, idx) =>
      createCupNumberDecalTexture(idx + 1)
    );

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

    // --- SEAMLESS DARK RADIAL STUDIO FLOOR ---
    const arenaGroup = new THREE.Group();
    scene.add(arenaGroup);

    const tableMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(levelConfig.environment.tableBaseColor),
      roughness: 0.42,
      metalness: 0.18,
    });
    const tableBody = new THREE.Mesh(new THREE.PlaneGeometry(32, 32), tableMat);
    tableBody.rotation.x = -Math.PI / 2;
    tableBody.position.y = 0.0;
    tableBody.receiveShadow = true;
    arenaGroup.add(tableBody);

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
    for (const chain of TREFOIL_PETAL_CHAINS) {
      const pts = chain.map((idx) => new THREE.Vector3(trefoilSlots[idx].x, 0.018, trefoilSlots[idx].z));
      const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5);
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

    // --- 12 SLEEK INVERTED 3D CUPS (COMPACT FOOTPRINT FOR >2X CUP-WIDTH GAPS + FRONT-WALL NUMBER DECALS) ---
    const cupWallGeo = new THREE.CylinderGeometry(0.30, 0.45, 1.08, 48, 1, true);
    cupWallGeo.translate(0, 0.55, 0);

    const numberPatchGeo = new THREE.CylinderGeometry(
      0.34,
      0.415,
      0.54,
      24,
      1,
      true,
      -Math.PI * 0.22,
      Math.PI * 0.44
    );
    numberPatchGeo.translate(0, 0.52, 0.012);

    const innerCavityGeo = new THREE.CylinderGeometry(0.28, 0.43, 1.04, 36, 1, true);
    innerCavityGeo.translate(0, 0.53, 0);

    const whiteTopCapGeo = new THREE.CircleGeometry(0.285, 48);
    const topRimBevelGeo = new THREE.TorusGeometry(0.295, 0.02, 16, 48);
    const bottomLipTorusGeo = new THREE.TorusGeometry(0.448, 0.022, 16, 48);
    const contactShadowGeo = new THREE.CircleGeometry(0.52, 36);

    const innerCavityMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#021317'),
      roughness: 0.7,
      side: THREE.BackSide,
    });

    const whiteTopCapMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f1f5f9'),
      emissive: new THREE.Color('#cbd5e1'),
      emissiveIntensity: 0.16,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.6,
    });

    const crimsonTopCapMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ef4444'),
      emissive: new THREE.Color('#991b1b'),
      emissiveIntensity: 0.18,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 0.85,
    });

    const topBevelMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e2e8f0'),
      roughness: 0.2,
      metalness: 0.35,
      clearcoat: 0.8,
    });

    interface CupVisualNode {
      id: number;
      rootGroup: THREE.Group;
      cupLifter: THREE.Group;
      wallMesh: THREE.Mesh;
      wallMat: THREE.MeshPhysicalMaterial;
      topCapMesh: THREE.Mesh;
      numberPatchMesh: THREE.Mesh;
      numberPatchMat: THREE.MeshBasicMaterial;
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

      const numberPatchMat = new THREE.MeshBasicMaterial({
        map: numberDecalTextures[i],
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const numberPatchMesh = new THREE.Mesh(numberPatchGeo, numberPatchMat);
      numberPatchMesh.userData = { cupId: i };
      cupLifter.add(numberPatchMesh);

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
        numberPatchMesh,
        numberPatchMat,
        bottomLipMat,
        selectionHalo,
        selectionHaloMat,
        shadowDisc,
        shadowMat,
      });
    }

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

    const quinticEase = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

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

      // Advance continuous orbital rotation in ORBIT / MIND TRAP modes
      if (cfg.orbitSpeedRadPerSec > 0 && !st.isPaused && !st.freezeActive) {
        const speedMult = st.slowMotionActive ? 0.45 : 1.0;
        const phaseMult = st.phase === 'SHUFFLING' ? 1.0 : st.phase === 'SELECTING' ? 0.32 : 0.18;
        const dirSign =
          cfg.hasMidShuffleFeints && eng.currentStepIndex >= Math.floor(cfg.shuffleSteps / 2) ? -1 : 1;
        eng.orbitAngle += dt * cfg.orbitSpeedRadPerSec * speedMult * phaseMult * dirSign;
      }

      const activeWave: ShuffleWaveStep | undefined =
        st.phase === 'SHUFFLING' && eng.isShuffling ? eng.activePlan[eng.currentStepIndex] : undefined;

      // 1. Advance Shuffle Wave Progress (with crisp Grid-Lock Snap Pause between passes)
      if (st.phase === 'SHUFFLING' && eng.isShuffling && activeWave && !st.isPaused && !st.freezeActive) {
        const speedMultiplier = st.slowMotionActive ? 0.48 : 1.0;

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
              eng.isShuffling = false;
              setCupSlotPositions([...eng.cupSlots]);
              st.onShuffleComplete();
            }
          }
        } else {
          const stepDurSec =
            Math.max(0.16, (cfg.stepDurationMs * activeWave.durationScale) / 1000) / speedMultiplier;
          eng.stepProgress += dt / stepDurSec;

          if (eng.stepProgress >= 1.0) {
            eng.stepProgress = 1.0;
            for (const traj of activeWave.trajectories) {
              const isFeint = traj.kind === 'PASS_BY_LANE' && traj.isFeint;
              if (!isFeint) {
                eng.cupSlots[traj.cupId] = traj.toSlot;
              }
              const finalSlot = isFeint ? traj.fromSlot : traj.toSlot;
              const slotCoord = getWorldSlotCoord(finalSlot, cfg, eng.orbitAngle);
              eng.cupWorldPos[traj.cupId].x = slotCoord.x;
              eng.cupWorldPos[traj.cupId].z = slotCoord.z;
            }
            eng.pauseRemainingSec = activeWave.holdPauseSec;
          }
        }
      }

      // 2. Update each cup's 3D position (Strictly upright — wide two-lane passing trajectories!)
      const damp = 1 - Math.exp(-18 * (dt || 0.016));
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

        // Crimson cups have a crimson top cap & lip matching Reel DeU6nw4yeSM; other cups have white caps
        const desiredCapMat = targetSkin === 'crimson_gloss' ? crimsonTopCapMat : whiteTopCapMat;
        if (node.topCapMesh.material !== desiredCapMat) {
          node.topCapMesh.material = desiredCapMat;
        }
        node.bottomLipMat.color.set(targetSkin === 'crimson_gloss' ? '#fca5a5' : '#a7f3d0');

        // Front-wall printed number decal (1..12)
        const currentSlot = eng.cupSlots[cupId];
        const numberTex = numberDecalTextures[currentSlot] || numberDecalTextures[0];
        if (node.numberPatchMat.map !== numberTex) {
          node.numberPatchMat.map = numberTex;
          node.numberPatchMat.needsUpdate = true;
        }
        const targetNumberOpacity = showCupNumbers ? 0.95 : 0.0;
        node.numberPatchMat.opacity += (targetNumberOpacity - node.numberPatchMat.opacity) * 0.25;

        const posState = eng.cupWorldPos[cupId];
        const slotCoord = getWorldSlotCoord(currentSlot, cfg, eng.orbitAngle);

        const activeTraj =
          st.phase === 'SHUFFLING' && activeWave && eng.pauseRemainingSec <= 0
            ? activeWave.trajectories.find((tr) => tr.cupId === cupId)
            : undefined;

        if (activeTraj) {
          const rawT = Math.max(0, Math.min(1, eng.stepProgress));

          if (activeTraj.kind === 'PERIMETER_RING_SPIN') {
            const eT = quinticEase(rawT);
            const circleMorph = Math.sin(eT * Math.PI);
            const baseRx = activeTraj.startRadiusX + (activeTraj.endRadiusX - activeTraj.startRadiusX) * eT;
            const baseRz = activeTraj.startRadiusZ + (activeTraj.endRadiusZ - activeTraj.startRadiusZ) * eT;
            const rxNow = baseRx * (1 - circleMorph * 0.85) + activeTraj.ringRadiusX * (circleMorph * 0.85);
            const rzNow = baseRz * (1 - circleMorph * 0.85) + activeTraj.ringRadiusZ * (circleMorph * 0.85);
            const angleNow = activeTraj.startAngle + activeTraj.deltaAngle * eT;

            posState.x = Math.cos(angleNow) * rxNow;
            posState.z = Math.sin(angleNow) * rzNow;
          } else {
            // TRUE 3-PHASE TRAPEZOIDAL PARALLEL PASS-BY CORRIDOR (PASS_BY_LANE):
            // Instead of revolving in a circle ("swapping"), the two cups:
            //   Phase 1 (0.00 -> 0.22): Step perpendicularly out into two wide, separated parallel lanes (Left Lane & Right Lane)
            //   Phase 2 (0.22 -> 0.78): Glide in STRAIGHT PARALLEL LINES right past each other with >1.8 units of open floor between them!
            //   Phase 3 (0.78 -> 1.00): Merge perpendicularly from their parallel passing lanes into their destination positions!
            const fromNow = getWorldSlotCoord(activeTraj.fromSlot, cfg, eng.orbitAngle);
            const toNow = getWorldSlotCoord(activeTraj.toSlot, cfg, eng.orbitAngle);

            const warpedT = Math.max(
              0,
              Math.min(1, rawT + activeTraj.leadLagBias * Math.sin(rawT * Math.PI))
            );

            let forwardT: number;
            let laneFactor: number;

            if (activeTraj.isFeint) {
              // Mind Trap feint: steps into the passing lane, glides halfway along the parallel track, and backs up
              forwardT = Math.sin(rawT * Math.PI) * 0.48;
              laneFactor = Math.sin(rawT * Math.PI);
            } else if (warpedT < 0.20) {
              // Phase 1: Step out into the parallel passing lane while beginning forward acceleration
              const p1 = quinticEase(warpedT / 0.20);
              laneFactor = p1;
              forwardT = p1 * 0.10;
            } else if (warpedT < 0.80) {
              // Phase 2: Glide straight past the other cup along parallel passing lanes (constant wide lateral separation!)
              const p2 = (warpedT - 0.20) / 0.60;
              const smoothP2 = p2 * p2 * (3 - 2 * p2);
              laneFactor = 1.0;
              forwardT = 0.10 + smoothP2 * 0.80;
            } else {
              // Phase 3: Having completely passed each other, merge smoothly from the parallel lane into the target slot
              const p3 = quinticEase((warpedT - 0.80) / 0.20);
              laneFactor = 1.0 - p3;
              forwardT = 0.90 + p3 * 0.10;
            }

            const dx = toNow.x - fromNow.x;
            const dz = toNow.z - fromNow.z;
            const dist = Math.max(0.001, Math.hypot(dx, dz));
            const ux = dx / dist;
            const uz = dz / dist;

            // Unit perpendicular normal pointing to the left of the cup's travel direction
            const nx = -uz;
            const nz = ux;

            // Clamp lateral offset so outer cups stay well inside the camera viewport while maintaining >= 1.75 units between passing cups
            const laneShift = Math.sign(activeTraj.laneOffsetWorld) * Math.min(1.02, Math.abs(activeTraj.laneOffsetWorld) * 0.76);

            posState.x = fromNow.x + dx * forwardT + nx * laneShift * laneFactor;
            posState.z = fromNow.z + dz * forwardT + nz * laneShift * laneFactor;
          }
        } else {
          posState.x += (slotCoord.x - posState.x) * damp;
          posState.z += (slotCoord.z - posState.z) * damp;
        }

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
          if (activeTraj && activeTraj.kind === 'PASS_BY_LANE' && activeTraj.peekDecoyLift) {
            targetLiftY = Math.sin(eng.stepProgress * Math.PI) * 0.68;
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

        // Strictly upright tabletop glide
        node.rootGroup.position.set(posState.x, 0, posState.z);
        node.cupLifter.position.y = posState.liftY;

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
        } else if (st.phase === 'SELECTING' && st.hoveredCupId === cupId) {
          node.selectionHaloMat.color.set('#2dd4bf');
          node.selectionHaloMat.opacity = 0.78;
        } else {
          node.selectionHaloMat.opacity *= 0.85;
        }
      }

      // 3. Synchronize Primary Target: Shiny Golden Ball OR 3D Golden Die!
      const ballOwnerPos = eng.cupWorldPos[st.ballCupId] || { x: 0, z: 0, liftY: 0 };
      const isPrimaryVisible = ballOwnerPos.liftY > 0.035 || st.extraVisionActive;
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
        }
      }

      // 4. Synchronize Secondary Pink Ball (Split Brain)
      if (cfg.reelMode === 'split_brain_2x3' && st.secondaryBallCupId !== null) {
        const pinkOwnerPos = eng.cupWorldPos[st.secondaryBallCupId] || { x: 0, z: 0, liftY: 0 };
        pinkBallGroup.position.x = pinkOwnerPos.x;
        pinkBallGroup.position.z = pinkOwnerPos.z;
        const isPinkVisible = pinkOwnerPos.liftY > 0.035 || st.extraVisionActive;
        pinkBallGroup.visible = isPinkVisible;
        if (isPinkVisible) {
          pinkBallMesh.position.y = 0.34 + Math.max(0, Math.cos(now * 0.005) * 0.035);
        }
      } else {
        pinkBallGroup.visible = false;
      }

      // 5. Synchronize Decoy Balls (Mind Trap)
      for (let dIdx = 0; dIdx < MAX_DECOYS; dIdx++) {
        const dGroup = decoyBallGroups[dIdx];
        const dCupId = st.decoyCupIds[dIdx];
        if (typeof dCupId === 'number' && dCupId < cupCount) {
          const dPos = eng.cupWorldPos[dCupId] || { x: 0, z: 0, liftY: 0 };
          dGroup.position.x = dPos.x;
          dGroup.position.z = dPos.z;
          dGroup.visible = dPos.liftY > 0.04;
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
      numberPatchGeo.dispose();
      innerCavityGeo.dispose();
      whiteTopCapGeo.dispose();
      topRimBevelGeo.dispose();
      bottomLipTorusGeo.dispose();
      contactShadowGeo.dispose();
      dieBoxGeo.dispose();
      dieRingGeo.dispose();
      ovalTubeGeo.dispose();
      fig8TubeGeo.dispose();
      trefoilGeos.forEach((g) => g.dispose());
      innerCavityMat.dispose();
      whiteTopCapMat.dispose();
      crimsonTopCapMat.dispose();
      topBevelMat.dispose();
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
      dividerLineMat.dispose();
      bottomHalfFloorMat.dispose();
      ovalTubeMat.dispose();
      fig8TubeMat.dispose();
      trefoilTrackMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      goldGlowTex.dispose();
      pinkGlowTex.dispose();
      decoyGlowTex.dispose();
      numberDecalTextures.forEach((t) => t.dispose());
      Object.values(skinTextures).forEach((t) => t.dispose());
      envMap.dispose();
      pmremGenerator.dispose();
      cupNodes.forEach((n) => {
        n.wallMat.dispose();
        n.numberPatchMat.dispose();
        n.bottomLipMat.dispose();
        n.selectionHaloMat.dispose();
        n.shadowMat.dispose();
      });
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCupAtGridSlot = (slotIdx: number): number => {
    const found = cupSlotPositions.slice(0, levelConfig.cupCount).indexOf(slotIdx);
    return found >= 0 ? found : slotIdx;
  };

  const trueBallSlotNumber = (cupSlotPositions[ballCupId] ?? ballCupId) + 1;

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
      <div className="relative w-full h-full min-h-[380px] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#03161b] to-[#072a32] rounded-2xl border border-teal-500/30">
        <div className="grid grid-cols-3 gap-4 max-w-sm w-full">
          {Array.from({ length: levelConfig.cupCount }, (_, slotIdx) => {
            const cupId = getCupAtGridSlot(slotIdx);
            const isBallHere = cupId === ballCupId || cupId === secondaryBallCupId;
            return (
              <button
                key={slotIdx}
                type="button"
                disabled={phase !== 'SELECTING' || revealedEmptyCupIds.includes(cupId)}
                onClick={() => phase === 'SELECTING' && onSelectCup(cupId)}
                className="h-24 rounded-2xl border border-teal-400/40 bg-teal-900/50 flex flex-col items-center justify-center text-white font-black"
              >
                <span>Cup #{slotIdx + 1}</span>
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
    <div className="relative w-full max-w-full min-w-0 h-[390px] sm:h-[460px] select-none overflow-hidden rounded-2xl">
      {/* Main Three.js Interactive 3D Canvas Container */}
      <div ref={containerRef} className="w-full max-w-full min-w-0 h-full touch-none overflow-hidden" />

      {/* Authentic Bold Top Center Title Overlay inside the 3D Arena */}
      <div className="pointer-events-none absolute top-2.5 inset-x-2 sm:inset-x-4 flex flex-col items-center text-center">
        <div className="text-lg sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] uppercase leading-tight">
          {levelConfig.reelHeaderTitle}
        </div>
        <div className="text-[10px] sm:text-sm font-extrabold tracking-widest text-slate-100 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] uppercase mt-0.5">
          {renderStyledSubtitle(levelConfig.reelHeaderSubtitle)}
        </div>
      </div>

      {/* Active Power-Up Status Ribbons */}
      <div className="pointer-events-none absolute top-16 left-3 flex flex-wrap gap-2">
        {freezeActive && (
          <div className="px-3 py-1 rounded-lg bg-sky-950/90 border border-sky-400/60 text-sky-200 text-xs font-bold tracking-wider uppercase shadow-lg">
            FREEZE ACTIVE — PASSING PAUSED
          </div>
        )}
        {slowMotionActive && (
          <div className="px-3 py-1 rounded-lg bg-teal-950/90 border border-teal-400/60 text-teal-200 text-xs font-bold tracking-wider uppercase shadow-lg">
            SLOW MOTION — 50% SPEED
          </div>
        )}
        {extraVisionActive && (
          <div className="px-3 py-1 rounded-lg bg-amber-950/90 border border-amber-400/70 text-amber-200 text-xs font-bold tracking-wider uppercase shadow-lg">
            EXTRA VISION — X-RAY PULSE
          </div>
        )}
      </div>

      {/* Authentic Bottom-Center Countdown (3... 2... 1...) */}
      {phase === 'COUNTDOWN' && countdownNum !== null && countdownNum !== undefined && (
        <div className="pointer-events-none absolute bottom-4 inset-x-0 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] tabular-nums">
            {countdownNum}
          </span>
        </div>
      )}

      {/* Authentic Bottom-Center "WHICH CUP?" + Numbered Dock */}
      {phase === 'SELECTING' && !isPaused && (
        <div className="absolute bottom-2.5 inset-x-3 flex flex-col items-center justify-center pointer-events-none gap-1.5">
          <div className="text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            <div className="text-lg sm:text-xl font-black text-white tracking-wide uppercase leading-none">
              {levelConfig.targetType === 'golden_die' ? 'WHICH CUP HIDES THE DIE?' : 'WHICH CUP?'}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-200 mt-0.5">
              {levelConfig.reelMode === 'split_brain_2x3'
                ? 'Tap 1 Top Cup (1–3) & 1 Bottom Cup (4–6)'
                : 'Tap the numbered cup on screen or below'}
            </div>
          </div>

          <div className="pointer-events-auto bg-[#021418]/90 border border-teal-400/35 rounded-xl px-2.5 py-1.5 shadow-xl flex items-center gap-1.5 flex-wrap justify-center">
            {Array.from({ length: levelConfig.cupCount }, (_, slotIdx) => {
              const cupId = getCupAtGridSlot(slotIdx);
              const isDisabled =
                revealedEmptyCupIds.includes(cupId) ||
                selectedCupId === cupId ||
                selectedSecondaryCupId === cupId;
              return (
                <button
                  key={slotIdx}
                  type="button"
                  disabled={isDisabled}
                  onMouseEnter={() => setHoveredCupId(cupId)}
                  onMouseLeave={() => setHoveredCupId(null)}
                  onClick={() => onSelectCup(cupId)}
                  className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                    selectedCupId === cupId || selectedSecondaryCupId === cupId
                      ? 'bg-amber-400 text-slate-950 border border-white'
                      : isDisabled
                      ? 'bg-slate-800/60 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                      : hoveredCupId === cupId
                      ? 'bg-amber-400 text-slate-950 border border-amber-200 scale-105 shadow-md'
                      : 'bg-teal-900/85 text-teal-100 border border-teal-500/45 hover:bg-teal-700/85 active:scale-95'
                  }`}
                  title={`Select Cup #${slotIdx + 1}`}
                >
                  {slotIdx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Authentic Bottom-Center Reveal Caption ("IT WAS CUP 4 — Did you get it?") */}
      {phase === 'REVEALING' && (
        <div className="pointer-events-none absolute bottom-3 inset-x-4 flex flex-col items-center text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide uppercase">
            IT WAS CUP {trueBallSlotNumber}
          </div>
          <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
            {selectedCupId === ballCupId ? 'Bullseye! You nailed it!' : 'Did you get it?'}
          </div>
        </div>
      )}
    </div>
  );
};
