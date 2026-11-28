import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronRight,
  Copy,
  Crown,
  Flame,
  Ghost,
  Hammer,
  HelpCircle,
  Lightbulb,
  Link2,
  Lock,
  Maximize2,
  Minimize2,
  Plus,
  RotateCcw,
  Share2,
  Snowflake,
  Star,
  Trophy,
  Undo2,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { soundEngine } from './gameSoundEngine';
import {
  WrongWayLiveRoomDoc,
  getWrongWayLiveRoomFromCloud,
  saveWrongWayLiveRoomToCloud,
  subscribeToWrongWayLiveRoom,
} from '../firebase';

export interface WrongWayGameProps {
  onBackToHub: () => void;
}

export type WrongWayMode = 'campaign' | 'vs_ai' | 'online_friend' | 'pass_2p' | 'pass_4p';
export type WrongWayDifficulty = 'easy' | 'normal' | 'hard' | 'hardcore';
export type WallOrientation = 'H' | 'V';

export interface GridPos {
  r: number;
  c: number;
}

export interface PlacedWall {
  id: string;
  r: number; // Top-left intersection index: 0 .. boardSize - 2
  c: number; // Top-left intersection index: 0 .. boardSize - 2
  orientation: WallOrientation;
  ownerId: number; // -1 for pre-placed campaign obstacles, 0..3 for players
}

export interface PlayerState {
  id: number;
  name: string;
  isAI: boolean;
  r: number;
  c: number;
  wallsLeft: number;
  colorHex: string;
  glowHex: string;
  badgeBg: string;
  goalType: 'ROW_TOP' | 'ROW_BOTTOM' | 'COL_LEFT' | 'COL_RIGHT' | 'CENTER_STAR';
  frozenTurns: number;
}

export interface HistorySnapshot {
  players: PlayerState[];
  walls: PlacedWall[];
  turnIndex: number;
  moveCount: number;
}

export interface CampaignZoneInfo {
  zone: number;
  name: string;
  subtitle: string;
  accent: string;
  difficulty: WrongWayDifficulty;
}

export interface CampaignLevelConfig {
  level: number;
  zone: number;
  zoneName: string;
  title: string;
  isBoss: boolean;
  boardSize: number;
  playerWalls: number;
  aiWalls: number;
  difficulty: WrongWayDifficulty;
  parMoves: number;
  presetWalls: Array<{ r: number; c: number; orientation: WallOrientation }>;
}

const STORAGE_KEY = 'elimika_wrong_way_save_v1';

export interface WrongWaySaveData {
  unlockedLevel: number;
  starsByLevel: Record<number, number>;
  claimedZoneChests: number[];
  powerInventory: {
    hint: number;
    undo: number;
    dash: number;
    ghost: number;
    hammer: number;
    freeze: number;
    extraWalls: number;
  };
}

const DEFAULT_SAVE: WrongWaySaveData = {
  unlockedLevel: 1,
  starsByLevel: {},
  claimedZoneChests: [],
  powerInventory: {
    hint: 5,
    undo: 5,
    dash: 3,
    ghost: 3,
    hammer: 3,
    freeze: 3,
    extraWalls: 3,
  },
};

export const CAMPAIGN_ZONES: CampaignZoneInfo[] = [
  {
    zone: 1,
    name: 'Neon Corridor',
    subtitle: 'Master straight jumps, diagonal sidesteps & wall traps',
    accent: '#22d3ee',
    difficulty: 'easy',
  },
  {
    zone: 2,
    name: 'Cyber Labyrinth',
    subtitle: 'Pre-built laser barriers & chokepoint detours',
    accent: '#f43f5e',
    difficulty: 'normal',
  },
  {
    zone: 3,
    name: 'Quantum Crossroads',
    subtitle: 'Asymmetric wall counts & center-board battles',
    accent: '#a855f7',
    difficulty: 'normal',
  },
  {
    zone: 4,
    name: 'Plasma Fortress',
    subtitle: 'Aggressive AI blockers & narrow escape lanes',
    accent: '#f59e0b',
    difficulty: 'hard',
  },
  {
    zone: 5,
    name: 'Void Gauntlet',
    subtitle: 'High-density maze puzzles & counter-wall duels',
    accent: '#10b981',
    difficulty: 'hard',
  },
  {
    zone: 6,
    name: 'Apex Singularity',
    subtitle: 'Grandmaster survival tactics & Boss Finals',
    accent: '#ec4899',
    difficulty: 'hardcore',
  },
];

function buildCampaignLevels(): CampaignLevelConfig[] {
  const levels: CampaignLevelConfig[] = [];
  for (let lvl = 1; lvl <= 60; lvl++) {
    const zoneIdx = Math.floor((lvl - 1) / 10);
    const zoneInfo = CAMPAIGN_ZONES[zoneIdx];
    const inZoneNum = ((lvl - 1) % 10) + 1;
    const isBoss = inZoneNum === 10;
    const boardSize = 9;

    // Deterministic preset walls for levels >= 3
    const presetWalls: Array<{ r: number; c: number; orientation: WallOrientation }> = [];
    if (lvl >= 3) {
      const count = Math.min(6, Math.floor((lvl - 1) / 9) + (inZoneNum >= 5 ? 2 : 1));
      let seed = lvl * 137 + zoneInfo.zone * 31;
      const nextRand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };

      for (let i = 0; i < count * 4 && presetWalls.length < count; i++) {
        const r = 2 + Math.floor(nextRand() * 4); // rows 2..5 (middle band)
        const c = 1 + Math.floor(nextRand() * 6); // cols 1..6
        const orientation: WallOrientation = nextRand() > 0.45 ? 'H' : 'V';
        const conflict = presetWalls.some((w) => {
          if (w.r === r && w.c === c) return true;
          if (w.orientation === orientation) {
            if (orientation === 'H' && w.r === r && Math.abs(w.c - c) <= 1) return true;
            if (orientation === 'V' && w.c === c && Math.abs(w.r - r) <= 1) return true;
          }
          return false;
        });
        if (!conflict) {
          presetWalls.push({ r, c, orientation });
        }
      }
    }

    const playerWalls = isBoss ? 8 : Math.max(6, 10 - Math.floor(zoneIdx / 2));
    const aiWalls = isBoss ? 12 : 9 + Math.floor(lvl / 10);
    const difficulty: WrongWayDifficulty = isBoss
      ? zoneIdx >= 2
        ? 'hardcore'
        : 'hard'
      : zoneIdx === 0 && inZoneNum <= 3
      ? 'easy'
      : zoneInfo.difficulty;

    const bossTitles = [
      'Gatekeeper Prime',
      'Labyrinth Warden',
      'Quantum Architect',
      'Plasma Overlord',
      'Void Sentinel',
      'Grandmaster Apex',
    ];

    levels.push({
      level: lvl,
      zone: zoneInfo.zone,
      zoneName: zoneInfo.name,
      title: isBoss ? `BOSS: ${bossTitles[zoneIdx]}` : `${zoneInfo.name} ${inZoneNum}`,
      isBoss,
      boardSize,
      playerWalls,
      aiWalls,
      difficulty,
      parMoves: 12 + Math.floor(lvl / 8),
      presetWalls,
    });
  }
  return levels;
}

export const ALL_CAMPAIGN_LEVELS = buildCampaignLevels();

// --- CORE QUORIDOR / WRONG WAY GRAPH & WALL GEOMETRY ENGINE ---

/**
 * Checks whether placing a candidate wall (r, c, orientation) physically overlaps
 * or crosses any existing wall on the board.
 */
export function doesWallCollide(
  r: number,
  c: number,
  orientation: WallOrientation,
  walls: PlacedWall[],
  boardSize: number
): boolean {
  if (r < 0 || r >= boardSize - 1 || c < 0 || c >= boardSize - 1) return true;
  for (const w of walls) {
    // Exact center intersection cross or identical slot
    if (w.r === r && w.c === c) return true;
    // Half-overlap along the same orientation (since each wall spans 2 squares)
    if (w.orientation === orientation) {
      if (orientation === 'H' && w.r === r && Math.abs(w.c - c) === 1) return true;
      if (orientation === 'V' && w.c === c && Math.abs(w.r - r) === 1) return true;
    }
  }
  return false;
}

/**
 * Checks if a wall blocks the step between adjacent cells (r1, c1) and (r2, c2).
 */
export function isEdgeBlockedByWall(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  walls: PlacedWall[]
): boolean {
  if (r1 === r2) {
    // Horizontal move between (r1, minC) and (r1, minC + 1)
    const minC = Math.min(c1, c2);
    for (const w of walls) {
      if (w.orientation === 'V' && w.c === minC && (w.r === r1 || w.r === r1 - 1)) {
        return true;
      }
    }
    return false;
  }
  if (c1 === c2) {
    // Vertical move between (minR, c1) and (minR + 1, c1)
    const minR = Math.min(r1, r2);
    for (const w of walls) {
      if (w.orientation === 'H' && w.r === minR && (w.c === c1 || w.c === c1 - 1)) {
        return true;
      }
    }
    return false;
  }
  return true;
}

export function hasPlayerReachedGoal(p: PlayerState, boardSize: number): boolean {
  const center = Math.floor(boardSize / 2);
  switch (p.goalType) {
    case 'ROW_TOP':
      return p.r === 0;
    case 'ROW_BOTTOM':
      return p.r === boardSize - 1;
    case 'COL_LEFT':
      return p.c === 0;
    case 'COL_RIGHT':
      return p.c === boardSize - 1;
    case 'CENTER_STAR':
      return p.r === center && p.c === center;
  }
}

export function isCellGoalForPlayer(r: number, c: number, p: PlayerState, boardSize: number): boolean {
  const center = Math.floor(boardSize / 2);
  switch (p.goalType) {
    case 'ROW_TOP':
      return r === 0;
    case 'ROW_BOTTOM':
      return r === boardSize - 1;
    case 'COL_LEFT':
      return c === 0;
    case 'COL_RIGHT':
      return c === boardSize - 1;
    case 'CENTER_STAR':
      return r === center && c === center;
  }
}

/**
 * Shortest-path BFS from a player's current cell to any goal cell.
 * Returns { dist, firstStep, path } or null if no path exists (Golden Rule check).
 */
export function computeShortestPathToGoal(
  player: PlayerState,
  walls: PlacedWall[],
  boardSize: number
): { dist: number; path: GridPos[] } | null {
  if (isCellGoalForPlayer(player.r, player.c, player, boardSize)) {
    return { dist: 0, path: [{ r: player.r, c: player.c }] };
  }

  const visited = new Uint8Array(boardSize * boardSize);
  const parent = new Int16Array(boardSize * boardSize).fill(-1);
  const queueR = new Int8Array(boardSize * boardSize);
  const queueC = new Int8Array(boardSize * boardSize);

  let head = 0;
  let tail = 0;
  const startIdx = player.r * boardSize + player.c;
  visited[startIdx] = 1;
  queueR[tail] = player.r;
  queueC[tail] = player.c;
  tail++;

  // Order directions toward the player's goal first for cleaner shortest paths
  const dirs =
    player.goalType === 'ROW_TOP'
      ? [
          [-1, 0],
          [0, -1],
          [0, 1],
          [1, 0],
        ]
      : player.goalType === 'ROW_BOTTOM'
      ? [
          [1, 0],
          [0, 1],
          [0, -1],
          [-1, 0],
        ]
      : [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ];

  let foundGoalIdx = -1;

  while (head < tail) {
    const cr = queueR[head];
    const cc = queueC[head];
    head++;
    const curIdx = cr * boardSize + cc;

    if (isCellGoalForPlayer(cr, cc, player, boardSize)) {
      foundGoalIdx = curIdx;
      break;
    }

    for (let d = 0; d < 4; d++) {
      const nr = cr + dirs[d][0];
      const nc = cc + dirs[d][1];
      if (nr < 0 || nr >= boardSize || nc < 0 || nc >= boardSize) continue;
      const nIdx = nr * boardSize + nc;
      if (visited[nIdx]) continue;
      if (isEdgeBlockedByWall(cr, cc, nr, nc, walls)) continue;

      visited[nIdx] = 1;
      parent[nIdx] = curIdx;
      queueR[tail] = nr;
      queueC[tail] = nc;
      tail++;
    }
  }

  if (foundGoalIdx === -1) return null;

  const path: GridPos[] = [];
  let trace = foundGoalIdx;
  while (trace !== -1) {
    const tr = Math.floor(trace / boardSize);
    const tc = trace % boardSize;
    path.push({ r: tr, c: tc });
    trace = parent[trace];
  }
  path.reverse();
  return { dist: path.length - 1, path };
}

/**
 * Full Golden Rule validation:
 * 1. Wall must not collide/cross existing walls.
 * 2. Every active player on the board must retain at least 1 valid open path to their goal.
 */
export function validateWallPlacement(
  r: number,
  c: number,
  orientation: WallOrientation,
  walls: PlacedWall[],
  players: PlayerState[],
  boardSize: number
): { valid: boolean; reason?: string } {
  if (doesWallCollide(r, c, orientation, walls, boardSize)) {
    return { valid: false, reason: 'Overlaps an existing wall' };
  }
  const candidateWalls: PlacedWall[] = [
    ...walls,
    { id: 'candidate', r, c, orientation, ownerId: -1 },
  ];
  for (const p of players) {
    const pathInfo = computeShortestPathToGoal(p, candidateWalls, boardSize);
    if (!pathInfo) {
      return {
        valid: false,
        reason: `Golden Rule: Cannot completely trap ${p.name}!`,
      };
    }
  }
  return { valid: true };
}

/**
 * Computes all legal pawn moves for `player`, including:
 * - Orthogonal 1-step moves
 * - Straight 2-square jump over an adjacent pawn
 * - Diagonal sidestep if the straight jump behind an adjacent pawn is blocked by a wall, board edge, or third pawn
 * - Ghost Power: allows stepping through an adjacent wall into an unoccupied cell
 */
export function getLegalPawnMoves(
  player: PlayerState,
  allPlayers: PlayerState[],
  walls: PlacedWall[],
  boardSize: number,
  ghostActive = false
): Array<{ r: number; c: number; isJump?: boolean; isDiagonalJump?: boolean; isGhostPhase?: boolean }> {
  const moves: Array<{
    r: number;
    c: number;
    isJump?: boolean;
    isDiagonalJump?: boolean;
    isGhostPhase?: boolean;
  }> = [];

  const isOccupied = (r: number, c: number) =>
    allPlayers.some((p) => p.id !== player.id && p.r === r && p.c === c);

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of dirs) {
    const nr = player.r + dr;
    const nc = player.c + dc;
    if (nr < 0 || nr >= boardSize || nc < 0 || nc >= boardSize) continue;

    const blocked = isEdgeBlockedByWall(player.r, player.c, nr, nc, walls);

    if (blocked) {
      if (ghostActive && !isOccupied(nr, nc)) {
        moves.push({ r: nr, c: nc, isGhostPhase: true });
      }
      continue;
    }

    if (!isOccupied(nr, nc)) {
      moves.push({ r: nr, c: nc });
    } else {
      // Adjacent square has an opponent pawn! Check straight jump:
      const jr = nr + dr;
      const jc = nc + dc;
      const canJumpStraight =
        jr >= 0 &&
        jr < boardSize &&
        jc >= 0 &&
        jc < boardSize &&
        !isEdgeBlockedByWall(nr, nc, jr, jc, walls) &&
        !isOccupied(jr, jc);

      if (canJumpStraight) {
        moves.push({ r: jr, c: jc, isJump: true });
      } else {
        // Straight jump is blocked by a wall, board boundary, or another pawn -> allow diagonal sidesteps around the opponent pawn
        const perpDirs =
          dr !== 0
            ? [
                [0, -1],
                [0, 1],
              ]
            : [
                [-1, 0],
                [1, 0],
              ];
        for (const [pdr, pdc] of perpDirs) {
          const diagR = nr + pdr;
          const diagC = nc + pdc;
          if (diagR < 0 || diagR >= boardSize || diagC < 0 || diagC >= boardSize) continue;
          if (!isEdgeBlockedByWall(nr, nc, diagR, diagC, walls) && !isOccupied(diagR, diagC)) {
            moves.push({ r: diagR, c: diagC, isDiagonalJump: true });
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Counts how many open orthogonal escape neighbors a player has around their current cell,
 * plus how close their shortest path is to being pinched by existing walls (Funnel Potential).
 */
function evaluateCorridorPinchBonus(
  targetPlayer: PlayerState,
  newWall: { r: number; c: number; orientation: WallOrientation },
  existingWalls: PlacedWall[],
  newPath: GridPos[],
  boardSize: number
): number {
  let bonus = 0;

  // 1. Reward walls that connect to existing walls or board edges to form continuous 4+ square barriers
  if (newWall.orientation === 'H') {
    if (newWall.c === 0 || newWall.c === boardSize - 2) bonus += 0.35;
    for (const w of existingWalls) {
      if (w.orientation === 'H' && w.r === newWall.r && Math.abs(w.c - newWall.c) === 2) {
        bonus += 0.65; // Extends a horizontal barrier wall!
      }
      if (
        w.orientation === 'V' &&
        Math.abs(w.r - newWall.r) <= 1 &&
        Math.abs(w.c - newWall.c) <= 1
      ) {
        bonus += 0.55; // Forms an L-corner trap!
      }
    }
  } else {
    if (newWall.r === 0 || newWall.r === boardSize - 2) bonus += 0.35;
    for (const w of existingWalls) {
      if (w.orientation === 'V' && w.c === newWall.c && Math.abs(w.r - newWall.r) === 2) {
        bonus += 0.65; // Extends a vertical barrier wall!
      }
      if (
        w.orientation === 'H' &&
        Math.abs(w.r - newWall.r) <= 1 &&
        Math.abs(w.c - newWall.c) <= 1
      ) {
        bonus += 0.55; // Forms an L-corner trap!
      }
    }
  }

  // 2. Reward walls placed right in front of the opponent's current pawn or next 2 steps
  const distToPawn = Math.hypot(newWall.r + 0.5 - targetPlayer.r, newWall.c + 0.5 - targetPlayer.c);
  if (distToPawn <= 2.2) {
    bonus += 0.45;
  }

  // 3. Reward pushing the opponent's path away from the center toward the outer board edge
  if (newPath.length > 1) {
    const nextStep = newPath[1];
    const centerCol = Math.floor(boardSize / 2);
    bonus += Math.abs(nextStep.c - centerCol) * 0.14;
  }

  return bonus;
}

/**
 * Computes the smartest action (Move or Wall Drop) for any player using:
 * - Immediate shortest-path differential (Opponent shortest path - Self shortest path)
 * - L-corner & multi-wall barrier extension synergy (so AI builds real mazes even when a single wall only adds +1 step)
 * - 2-Wall Lookahead (checks if placing this wall sets up a devastating follow-up wall on the next turn)
 * - Anti-Jump awareness (avoids stepping directly in front of an opponent pawn if it gives them a free 2-square jump)
 */
export function computeBestTacticalAction(
  actorIndex: number,
  players: PlayerState[],
  walls: PlacedWall[],
  boardSize: number,
  difficulty: WrongWayDifficulty
):
  | { type: 'MOVE'; to: GridPos; score: number }
  | { type: 'WALL'; r: number; c: number; orientation: WallOrientation; score: number } {
  const actor = players[actorIndex];
  const opponents = players.filter((_, idx) => idx !== actorIndex);

  const legalMoves = getLegalPawnMoves(actor, players, walls, boardSize, false);

  // Find leading opponent (closest to their goal)
  let leadingOpp = opponents[0];
  let leadingOppPath = computeShortestPathToGoal(leadingOpp, walls, boardSize);
  let leadingOppDist = leadingOppPath ? leadingOppPath.dist : 99;

  for (const opp of opponents) {
    const p = computeShortestPathToGoal(opp, walls, boardSize);
    if (p && p.dist < leadingOppDist) {
      leadingOpp = opp;
      leadingOppPath = p;
      leadingOppDist = p.dist;
    }
  }

  // 1. Evaluate all legal pawn moves (with Anti-Jump check!)
  let bestMove: GridPos = legalMoves[0] || { r: actor.r, c: actor.c };
  let bestMoveEffectiveDist = 999;

  for (const mv of legalMoves) {
    const tempActor: PlayerState = { ...actor, r: mv.r, c: mv.c };
    if (hasPlayerReachedGoal(tempActor, boardSize)) {
      return { type: 'MOVE', to: { r: mv.r, c: mv.c }, score: 10000 };
    }
    const pathRes = computeShortestPathToGoal(tempActor, walls, boardSize);
    let d = pathRes ? pathRes.dist : 999;

    // Anti-Jump Awareness: if stepping onto (mv.r, mv.c) places us directly adjacent to leadingOpp
    // with no wall between us, the opponent will jump straight over us next turn (+1 free step for them)!
    const manhattanToOpp = Math.abs(mv.r - leadingOpp.r) + Math.abs(mv.c - leadingOpp.c);
    if (
      difficulty !== 'easy' &&
      manhattanToOpp === 1 &&
      !isEdgeBlockedByWall(mv.r, mv.c, leadingOpp.r, leadingOpp.c, walls)
    ) {
      d += 0.85; // Penalize handing the opponent a free jump
    }

    const centerBias = -Math.abs(mv.c - Math.floor(boardSize / 2)) * 0.03;
    if (d - centerBias < bestMoveEffectiveDist) {
      bestMoveEffectiveDist = d - centerBias;
      bestMove = { r: mv.r, c: mv.c };
    }
  }

  const currentSelfPath = computeShortestPathToGoal(actor, walls, boardSize);
  const currentSelfDist = currentSelfPath ? currentSelfPath.dist : 99;
  const moveGain = currentSelfDist - Math.floor(bestMoveEffectiveDist);

  // If actor can jump over the opponent right now (moveGain >= 2), take the jump!
  if (moveGain >= 2) {
    return { type: 'MOVE', to: bestMove, score: moveGain + 1.5 };
  }

  // If actor has no walls left, or Easy difficulty randomly skips wall checks
  if (actor.wallsLeft <= 0 || (difficulty === 'easy' && Math.random() < 0.55)) {
    return { type: 'MOVE', to: bestMove, score: moveGain };
  }

  // 2. Gather candidate wall coordinates along the leading opponent's shortest path AND existing wall tips
  const candidateCoords = new Set<string>();
  const pathNodes = leadingOppPath ? leadingOppPath.path : [{ r: leadingOpp.r, c: leadingOpp.c }];
  const searchDepth =
    difficulty === 'hardcore' ? 8 : difficulty === 'hard' ? 6 : difficulty === 'normal' ? 4 : 3;

  for (const node of pathNodes.slice(0, searchDepth)) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const wr = node.r + dr;
        const wc = node.c + dc;
        if (wr >= 0 && wr < boardSize - 1 && wc >= 0 && wc < boardSize - 1) {
          candidateCoords.add(`${wr},${wc}`);
        }
      }
    }
  }

  let bestWall: {
    r: number;
    c: number;
    orientation: WallOrientation;
    tacticalScore: number;
    oppDelay: number;
  } | null = null;

  for (const key of candidateCoords) {
    const [wr, wc] = key.split(',').map(Number);
    for (const orientation of ['H', 'V'] as WallOrientation[]) {
      const check = validateWallPlacement(wr, wc, orientation, walls, players, boardSize);
      if (!check.valid) continue;

      const testWalls: PlacedWall[] = [
        ...walls,
        { id: 'test', r: wr, c: wc, orientation, ownerId: actor.id },
      ];
      const newOppPath = computeShortestPathToGoal(leadingOpp, testWalls, boardSize);
      const newSelfPath = computeShortestPathToGoal(actor, testWalls, boardSize);
      if (!newOppPath || !newSelfPath) continue;

      const oppDelay = newOppPath.dist - leadingOppDist;
      const selfDelay = newSelfPath.dist - currentSelfDist;
      const rawNetDelay = oppDelay - selfDelay;

      // Skip walls that hurt us more than the opponent
      if (rawNetDelay < 0) continue;

      const corridorBonus = evaluateCorridorPinchBonus(
        leadingOpp,
        { r: wr, c: wc, orientation },
        walls,
        newOppPath.path,
        boardSize
      );

      // 2-Wall Trap Lookahead (for Hard / Hardcore when a wall forces a sidestep or extends a trap)
      let lookaheadComboGain = 0;
      if (
        (difficulty === 'hard' || difficulty === 'hardcore') &&
        actor.wallsLeft >= 2 &&
        oppDelay >= 0 &&
        newOppPath.path.length > 1
      ) {
        const nextNode = newOppPath.path[1];
        for (let dr = -1; dr <= 0; dr++) {
          for (let dc = -1; dc <= 0; dc++) {
            const nr2 = nextNode.r + dr;
            const nc2 = nextNode.c + dc;
            if (nr2 < 0 || nr2 >= boardSize - 1 || nc2 < 0 || nc2 >= boardSize - 1) continue;
            for (const o2 of ['H', 'V'] as WallOrientation[]) {
              if (doesWallCollide(nr2, nc2, o2, testWalls, boardSize)) continue;
              const comboWalls: PlacedWall[] = [
                ...testWalls,
                { id: 'test2', r: nr2, c: nc2, orientation: o2, ownerId: actor.id },
              ];
              const oppComboPath = computeShortestPathToGoal(leadingOpp, comboWalls, boardSize);
              const selfComboPath = computeShortestPathToGoal(actor, comboWalls, boardSize);
              if (oppComboPath && selfComboPath) {
                const totalComboNet =
                  oppComboPath.dist - leadingOppDist - (selfComboPath.dist - currentSelfDist);
                if (totalComboNet > lookaheadComboGain) {
                  lookaheadComboGain = totalComboNet;
                }
              }
            }
          }
        }
      }

      const tacticalScore =
        rawNetDelay * 1.15 + corridorBonus + Math.max(0, lookaheadComboGain - rawNetDelay) * 0.42;

      if ((oppDelay >= 1 || lookaheadComboGain >= 2) && (!bestWall || tacticalScore > bestWall.tacticalScore)) {
        bestWall = { r: wr, c: wc, orientation, tacticalScore, oppDelay };
      }
    }
  }

  // 3. Decide whether to drop the best wall or move the pawn
  if (bestWall) {
    // When the opponent is ahead or tied in the race, AI proactively drops walls to break the 1st-mover advantage!
    const isBehindOrTied = leadingOppDist <= currentSelfDist;
    const isOpponentCloseToGoal = leadingOppDist <= 5;

    const threshold =
      difficulty === 'hardcore'
        ? isBehindOrTied || isOpponentCloseToGoal
          ? 0.95
          : 1.55
        : difficulty === 'hard'
        ? isBehindOrTied || isOpponentCloseToGoal
          ? 1.05
          : 1.65
        : difficulty === 'normal'
        ? isBehindOrTied || isOpponentCloseToGoal
          ? 1.15
          : 1.85
        : 1.9;

    if (bestWall.tacticalScore >= threshold) {
      return {
        type: 'WALL',
        r: bestWall.r,
        c: bestWall.c,
        orientation: bestWall.orientation,
        score: bestWall.tacticalScore,
      };
    }
  }

  return { type: 'MOVE', to: bestMove, score: moveGain };
}

export const WrongWayGame: React.FC<WrongWayGameProps> = ({ onBackToHub }) => {
  const [saveData, setSaveData] = useState<WrongWaySaveData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SAVE,
          ...parsed,
          powerInventory: { ...DEFAULT_SAVE.powerInventory, ...(parsed.powerInventory || {}) },
        };
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_SAVE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch {
      // Ignore storage error
    }
  }, [saveData]);

  const [mode, setMode] = useState<WrongWayMode>('campaign');
  const [selectedZone, setSelectedZone] = useState<number>(1);
  const [activeLevelNum, setActiveLevelNum] = useState<number>(1);
  const [showLevelDrawer, setShowLevelDrawer] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [aiDifficulty, setAiDifficulty] = useState<WrongWayDifficulty>('normal');
  const [muted, setMuted] = useState<boolean>(() => soundEngine.isMuted());

  // First-Mover Balance Rules:
  // 1. Second-Mover Bonus Wall (+1 wall for players moving after Player 1)
  // 2. Last-Chance Equalizer Turn (if the first mover reaches the goal, the second mover gets 1 final turn to tie/counter)
  // 3. Alternating Starter option (You, AI/P2, or Auto-Alternate)
  const [starterPreference, setStarterPreference] = useState<'p1' | 'p2' | 'alternate'>('alternate');
  const [equalizerRuleEnabled, setEqualizerRuleEnabled] = useState<boolean>(true);
  const [matchStarterIdx, setMatchStarterIdx] = useState<number>(0);
  const [equalizerPendingWinner, setEqualizerPendingWinner] = useState<PlayerState | null>(null);
  const [isDrawResult, setIsDrawResult] = useState<boolean>(false);
  const matchCountRef = useRef<number>(0);

  // Live Friend Online Multiplayer State
  const [myLivePlayerId] = useState<string>(() => {
    try {
      const existing = sessionStorage.getItem('elimika_ww_live_pid');
      if (existing) return existing;
      const created = `ww_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36).slice(-4)}`;
      sessionStorage.setItem('elimika_ww_live_pid', created);
      return created;
    } catch {
      return `ww_${Math.random().toString(36).slice(2, 10)}`;
    }
  });
  const [liveRoomId, setLiveRoomId] = useState<string | null>(null);
  const [liveRoomDoc, setLiveRoomDoc] = useState<WrongWayLiveRoomDoc | null>(null);
  const [myLiveSeat, setMyLiveSeat] = useState<0 | 1>(0);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copiedInviteLink, setCopiedInviteLink] = useState<boolean>(false);

  // Race Finish Format:
  // - true ('Same Finish' / WallRush style): Both orbs start at the BOTTOM row and race to the SAME TOP FINISH line!
  // - false ('Opposite Sides'): P1 starts at bottom, P2 starts at top (and in Live Friend mode, each player's own device screen rotates 180° so every player starts at the bottom of their own screen!)
  const [sameSideFinish, setSameSideFinish] = useState<boolean>(true);

  // Board State
  const [boardSize, setBoardSize] = useState<number>(9);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [walls, setWalls] = useState<PlacedWall[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [winner, setWinner] = useState<PlayerState | null>(null);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);

  // Wall Placement & Drag-from-Tray State
  const [trayOrientation, setTrayOrientation] = useState<WallOrientation>('H');
  const [placingWallMode, setPlacingWallMode] = useState<boolean>(false);
  const [hoverWallSlot, setHoverWallSlot] = useState<{
    r: number;
    c: number;
    orientation: WallOrientation;
  } | null>(null);
  const [isDraggingWallFromTray, setIsDraggingWallFromTray] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Active Tactical Power States
  const [dashStepsRemaining, setDashStepsRemaining] = useState<number>(0);
  const [ghostActive, setGhostActive] = useState<boolean>(false);
  const [hammerActive, setHammerActive] = useState<boolean>(false);
  const [hintAction, setHintAction] = useState<
    | { type: 'MOVE'; to: GridPos }
    | { type: 'WALL'; r: number; c: number; orientation: WallOrientation }
    | null
  >(null);

  const boardRef = useRef<HTMLDivElement | null>(null);

  const activeCampaignLevel = useMemo(
    () => ALL_CAMPAIGN_LEVELS.find((l) => l.level === activeLevelNum) || ALL_CAMPAIGN_LEVELS[0],
    [activeLevelNum]
  );

  const showToast = useCallback((msg: string) => {
    setStatusBanner(msg);
  }, []);

  useEffect(() => {
    if (!statusBanner) return;
    const t = window.setTimeout(() => setStatusBanner(null), 3000);
    return () => clearTimeout(t);
  }, [statusBanner]);

  // Initialize or Reset Match
  const initMatch = useCallback(
    (
      targetMode: WrongWayMode = mode,
      targetLevel: number = activeLevelNum,
      targetDiff: WrongWayDifficulty = aiDifficulty
    ) => {
      setWinner(null);
      setEqualizerPendingWinner(null);
      setIsDrawResult(false);
      setHistory([]);
      setMoveCount(0);
      setPlacingWallMode(false);
      setHoverWallSlot(null);
      setIsDraggingWallFromTray(false);
      setDashStepsRemaining(0);
      setGhostActive(false);
      setHammerActive(false);
      setHintAction(null);
      setStatusBanner(null);

      // Determine who starts this match to balance first-turn advantage
      let startIdx = 0;
      if (targetMode === 'campaign') {
        // In campaign, even-numbered levels & boss levels let the AI open first, and whoever goes 2nd gets +1 bonus wall
        startIdx = targetLevel % 2 === 0 ? 1 : 0;
      } else if (targetMode === 'pass_4p') {
        startIdx = matchCountRef.current % 4;
      } else {
        if (starterPreference === 'p1') startIdx = 0;
        else if (starterPreference === 'p2') startIdx = 1;
        else startIdx = matchCountRef.current % 2;
      }
      matchCountRef.current += 1;
      setMatchStarterIdx(startIdx);
      setTurnIndex(startIdx);

      if (targetMode === 'pass_4p') {
        const size = 11;
        const mid = Math.floor(size / 2);
        setBoardSize(size);
        setWalls([]);
        setPlayers([
          {
            id: 0,
            name: 'Cyan Orb',
            isAI: false,
            r: size - 1,
            c: mid,
            wallsLeft: startIdx === 0 ? 7 : 8,
            colorHex: '#22d3ee',
            glowHex: 'rgba(34,211,238,0.75)',
            badgeBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
            goalType: 'CENTER_STAR',
            frozenTurns: 0,
          },
          {
            id: 1,
            name: 'Pink Orb',
            isAI: false,
            r: 0,
            c: mid,
            wallsLeft: startIdx === 1 ? 7 : 8,
            colorHex: '#f43f5e',
            glowHex: 'rgba(244,63,94,0.75)',
            badgeBg: 'bg-rose-500/20 border-rose-400 text-rose-200',
            goalType: 'CENTER_STAR',
            frozenTurns: 0,
          },
          {
            id: 2,
            name: 'Gold Orb',
            isAI: false,
            r: mid,
            c: 0,
            wallsLeft: startIdx === 2 ? 7 : 8,
            colorHex: '#fbbf24',
            glowHex: 'rgba(251,191,36,0.75)',
            badgeBg: 'bg-amber-500/20 border-amber-400 text-amber-200',
            goalType: 'CENTER_STAR',
            frozenTurns: 0,
          },
          {
            id: 3,
            name: 'Emerald Orb',
            isAI: false,
            r: mid,
            c: size - 1,
            wallsLeft: startIdx === 3 ? 7 : 8,
            colorHex: '#34d399',
            glowHex: 'rgba(52,211,153,0.75)',
            badgeBg: 'bg-emerald-500/20 border-emerald-400 text-emerald-200',
            goalType: 'CENTER_STAR',
            frozenTurns: 0,
          },
        ]);
        return;
      }

      const size = 9;
      const mid = Math.floor(size / 2);
      setBoardSize(size);

      if (targetMode === 'campaign') {
        const lvlCfg =
          ALL_CAMPAIGN_LEVELS.find((l) => l.level === targetLevel) || ALL_CAMPAIGN_LEVELS[0];
        // Second mover receives +1 bonus wall to offset opening tempo
        const p1Walls = startIdx === 1 ? lvlCfg.playerWalls + 1 : lvlCfg.playerWalls;
        const p2Walls = startIdx === 0 ? lvlCfg.aiWalls + 1 : lvlCfg.aiWalls;
        const initialPlayers: PlayerState[] = [
          {
            id: 0,
            name: 'You (Cyan)',
            isAI: false,
            r: size - 1,
            c: sameSideFinish ? 2 : mid,
            wallsLeft: p1Walls,
            colorHex: '#22d3ee',
            glowHex: 'rgba(34,211,238,0.8)',
            badgeBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
            goalType: 'ROW_TOP',
            frozenTurns: 0,
          },
          {
            id: 1,
            name: lvlCfg.isBoss ? lvlCfg.title : `Zone ${lvlCfg.zone} AI`,
            isAI: true,
            r: sameSideFinish ? size - 1 : 0,
            c: sameSideFinish ? size - 3 : mid,
            wallsLeft: p2Walls,
            colorHex: '#f43f5e',
            glowHex: 'rgba(244,63,94,0.8)',
            badgeBg: 'bg-rose-500/20 border-rose-400 text-rose-200',
            goalType: sameSideFinish ? 'ROW_TOP' : 'ROW_BOTTOM',
            frozenTurns: 0,
          },
        ];

        const validPresetWalls: PlacedWall[] = [];
        lvlCfg.presetWalls.forEach((pw, idx) => {
          const check = validateWallPlacement(
            pw.r,
            pw.c,
            pw.orientation,
            validPresetWalls,
            initialPlayers,
            size
          );
          if (check.valid) {
            validPresetWalls.push({
              id: `preset-${idx}`,
              r: pw.r,
              c: pw.c,
              orientation: pw.orientation,
              ownerId: -1,
            });
          }
        });

        setPlayers(initialPlayers);
        setWalls(validPresetWalls);
        return;
      }

      // Vs AI, Live Friend, or 2-Player Pass & Play: Second mover gets 11 walls vs First mover's 10 walls (+1 Second-Mover Compensation)
      const isVsAi = targetMode === 'vs_ai';
      const isOnlineFriend = targetMode === 'online_friend';
      setWalls([]);
      setPlayers([
        {
          id: 0,
          name: isOnlineFriend
            ? myLiveSeat === 0
              ? 'You (Cyan)'
              : 'Host (Cyan)'
            : isVsAi
            ? 'You (Cyan)'
            : 'Player 1 (Cyan)',
          isAI: false,
          r: size - 1,
          c: sameSideFinish ? 2 : mid,
          wallsLeft: startIdx === 0 ? 10 : 11,
          colorHex: '#22d3ee',
          glowHex: 'rgba(34,211,238,0.8)',
          badgeBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
          goalType: 'ROW_TOP',
          frozenTurns: 0,
        },
        {
          id: 1,
          name: isOnlineFriend
            ? myLiveSeat === 1
              ? 'You (Pink)'
              : 'Friend (Pink)'
            : isVsAi
            ? `Neon AI (${targetDiff.toUpperCase()})`
            : 'Player 2 (Pink)',
          isAI: isVsAi,
          r: sameSideFinish ? size - 1 : 0,
          c: sameSideFinish ? size - 3 : mid,
          wallsLeft: startIdx === 1 ? 10 : 11,
          colorHex: '#f43f5e',
          glowHex: 'rgba(244,63,94,0.8)',
          badgeBg: 'bg-rose-500/20 border-rose-400 text-rose-200',
          goalType: sameSideFinish ? 'ROW_TOP' : 'ROW_BOTTOM',
          frozenTurns: 0,
        },
      ]);
    },
    [mode, activeLevelNum, aiDifficulty, starterPreference, myLiveSeat, sameSideFinish]
  );

  useEffect(() => {
    if (mode === 'online_friend') return;
    initMatch(mode, activeLevelNum, aiDifficulty);
  }, [mode, activeLevelNum, aiDifficulty, sameSideFinish, initMatch]);

  // Publish a live room state to both Firestore and Express SSE/REST
  const publishLiveRoomState = useCallback(async (docToSave: WrongWayLiveRoomDoc) => {
    setLiveRoomDoc(docToSave);
    try {
      fetch('/api/wrong-way/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docToSave),
      }).catch(() => {});
    } catch {
      // Ignore network error
    }
    await saveWrongWayLiveRoomToCloud(docToSave);
  }, []);

  // Serialize/deserialize walls + sameSideFinish flag inside wallsJson so Firestore & SSE sync the finish mode seamlessly
  const encodeLiveWallsJson = useCallback((wallsList: PlacedWall[], isSameSide: boolean): string => {
    return JSON.stringify({ sameSide: isSameSide, walls: wallsList });
  }, []);

  const decodeLiveWallsJson = useCallback(
    (rawJson: string | undefined, fallbackSameSide: boolean): { walls: PlacedWall[]; sameSide: boolean } => {
      try {
        const parsed = JSON.parse(rawJson || '[]');
        if (Array.isArray(parsed)) {
          return { walls: parsed, sameSide: fallbackSameSide };
        }
        if (parsed && Array.isArray(parsed.walls)) {
          return { walls: parsed.walls, sameSide: Boolean(parsed.sameSide) };
        }
      } catch {
        // Ignore parse error
      }
      return { walls: [], sameSide: fallbackSameSide };
    },
    []
  );

  // Reconstruct local board state from a WrongWayLiveRoomDoc snapshot
  const applyLiveRoomSnapshot = useCallback(
    (incomingDoc: WrongWayLiveRoomDoc) => {
      if (!incomingDoc || !incomingDoc.roomId) return;

      let effectiveDoc = incomingDoc;
      let seat: 0 | 1 = myLiveSeat;

      if (incomingDoc.hostId === myLivePlayerId) {
        seat = 0;
      } else if (incomingDoc.guestId === myLivePlayerId) {
        seat = 1;
      } else if (!incomingDoc.guestId || incomingDoc.guestId === '') {
        // Automatically claim Seat 1 (Guest / Pink Orb) when a friend opens the invite link!
        seat = 1;
        effectiveDoc = {
          ...incomingDoc,
          guestId: myLivePlayerId,
          guestName: 'Friend (Pink)',
          status: 'playing',
          updatedAt: new Date().toISOString(),
        };
        setMyLiveSeat(1);
        publishLiveRoomState(effectiveDoc);
        showToast('🟢 Connected live! You start at the bottom as Pink Orb ↑');
      }

      setMyLiveSeat(seat);
      setLiveRoomDoc(effectiveDoc);
      setBoardSize(9);

      const { walls: parsedWalls, sameSide: roomSameSide } = decodeLiveWallsJson(
        effectiveDoc.wallsJson,
        sameSideFinish
      );
      setSameSideFinish(roomSameSide);

      const nextPlayers: PlayerState[] = [
        {
          id: 0,
          name: seat === 0 ? 'You (Cyan)' : 'Friend (Cyan)',
          isAI: false,
          r: effectiveDoc.p0R,
          c: effectiveDoc.p0C,
          wallsLeft: effectiveDoc.p0Walls,
          colorHex: '#22d3ee',
          glowHex: 'rgba(34,211,238,0.8)',
          badgeBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
          goalType: 'ROW_TOP',
          frozenTurns: 0,
        },
        {
          id: 1,
          name:
            seat === 1
              ? 'You (Pink)'
              : effectiveDoc.guestId
              ? 'Friend (Pink)'
              : 'Waiting for Friend...',
          isAI: false,
          r: effectiveDoc.p1R,
          c: effectiveDoc.p1C,
          wallsLeft: effectiveDoc.p1Walls,
          colorHex: '#f43f5e',
          glowHex: 'rgba(244,63,94,0.8)',
          badgeBg: 'bg-rose-500/20 border-rose-400 text-rose-200',
          goalType: roomSameSide ? 'ROW_TOP' : 'ROW_BOTTOM',
          frozenTurns: 0,
        },
      ];

      setPlayers(nextPlayers);
      setWalls(parsedWalls);
      setTurnIndex(effectiveDoc.turnIndex);
      setMatchStarterIdx(effectiveDoc.starterIndex);
      setMoveCount(effectiveDoc.moveCount);

      if (
        effectiveDoc.equalizerPendingIndex === 0 ||
        effectiveDoc.equalizerPendingIndex === 1
      ) {
        setEqualizerPendingWinner(nextPlayers[effectiveDoc.equalizerPendingIndex]);
      } else {
        setEqualizerPendingWinner(null);
      }

      if (effectiveDoc.winnerIndex === 2) {
        setIsDrawResult(true);
        setWinner(nextPlayers[0]);
      } else if (effectiveDoc.winnerIndex === 0 || effectiveDoc.winnerIndex === 1) {
        setIsDrawResult(false);
        setWinner(nextPlayers[effectiveDoc.winnerIndex]);
      } else {
        setIsDrawResult(false);
        setWinner(null);
      }
    },
    [myLivePlayerId, myLiveSeat, publishLiveRoomState, showToast, decodeLiveWallsJson, sameSideFinish]
  );

  // Create a brand new Live Friend room & open shareable invite link modal
  const createLiveFriendRoom = useCallback(
    async (openModal = true, targetSameSide: boolean = sameSideFinish) => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      const initialDoc: WrongWayLiveRoomDoc = {
        roomId: code,
        hostId: myLivePlayerId,
        guestId: '',
        hostName: 'Host (Cyan)',
        guestName: 'Waiting for Friend...',
        status: 'waiting',
        turnIndex: 0,
        starterIndex: 0,
        p0R: 8,
        p0C: targetSameSide ? 2 : 4,
        p0Walls: 10,
        p1R: targetSameSide ? 8 : 0,
        p1C: targetSameSide ? 6 : 4,
        p1Walls: 11,
        wallsJson: encodeLiveWallsJson([], targetSameSide),
        winnerIndex: -1,
        equalizerPendingIndex: -1,
        moveCount: 0,
        updatedAt: new Date().toISOString(),
      };

      setTutorialStep(null);
      setMode('online_friend');
      setLiveRoomId(code);
      setMyLiveSeat(0);
      applyLiveRoomSnapshot(initialDoc);
      if (openModal) setShowInviteModal(true);

      try {
        const nextUrl = `${window.location.pathname}?wrongWayRoom=${code}#wrong-way`;
        window.history.replaceState({}, '', nextUrl);
      } catch {
        // Ignore history error
      }

      await publishLiveRoomState(initialDoc);
    },
    [myLivePlayerId, sameSideFinish, encodeLiveWallsJson, applyLiveRoomSnapshot, publishLiveRoomState]
  );

  // Join an existing Live Friend room by 6-char code or URL parameter
  const joinLiveFriendRoom = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (!code || code.length < 3) {
        showToast('Enter a valid Room Code');
        return;
      }

      setTutorialStep(null);
      setMode('online_friend');
      setLiveRoomId(code);
      setShowInviteModal(false);

      try {
        const nextUrl = `${window.location.pathname}?wrongWayRoom=${code}#wrong-way`;
        window.history.replaceState({}, '', nextUrl);
      } catch {
        // Ignore history error
      }

      // 1. Try Firestore first (works across ais-dev and ais-pre containers!)
      let foundDoc = await getWrongWayLiveRoomFromCloud(code);

      // 2. Fallback to Express local endpoint if not yet in Firestore
      if (!foundDoc) {
        try {
          const resp = await fetch(`/api/wrong-way/rooms/${encodeURIComponent(code)}`);
          if (resp.ok) {
            const json = await resp.json();
            if (json?.room) foundDoc = json.room as WrongWayLiveRoomDoc;
          }
        } catch {
          // Ignore fetch error
        }
      }

      if (foundDoc) {
        applyLiveRoomSnapshot(foundDoc);
      } else {
        // If room doesn't exist yet, initialize it with this player as Host so the code works immediately
        const newDoc: WrongWayLiveRoomDoc = {
          roomId: code,
          hostId: myLivePlayerId,
          guestId: '',
          hostName: 'Host (Cyan)',
          guestName: 'Waiting for Friend...',
          status: 'waiting',
          turnIndex: 0,
          starterIndex: 0,
          p0R: 8,
          p0C: sameSideFinish ? 2 : 4,
          p0Walls: 10,
          p1R: sameSideFinish ? 8 : 0,
          p1C: sameSideFinish ? 6 : 4,
          p1Walls: 11,
          wallsJson: encodeLiveWallsJson([], sameSideFinish),
          winnerIndex: -1,
          equalizerPendingIndex: -1,
          moveCount: 0,
          updatedAt: new Date().toISOString(),
        };
        setMyLiveSeat(0);
        applyLiveRoomSnapshot(newDoc);
        await publishLiveRoomState(newDoc);
      }
    },
    [myLivePlayerId, sameSideFinish, encodeLiveWallsJson, applyLiveRoomSnapshot, publishLiveRoomState, showToast]
  );

  // Auto-join room on mount if URL contains ?wrongWayRoom=CODE
  const didCheckInitialUrlRoomRef = useRef<boolean>(false);
  useEffect(() => {
    if (didCheckInitialUrlRoomRef.current) return;
    didCheckInitialUrlRoomRef.current = true;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let code = searchParams.get('wrongWayRoom');
      if (!code && window.location.hash.includes('wrongWayRoom=')) {
        const hashQuery = window.location.hash.split('?')[1] || '';
        code = new URLSearchParams(hashQuery).get('wrongWayRoom');
      }
      if (code && code.trim().length >= 3) {
        joinLiveFriendRoom(code.trim());
      }
    } catch {
      // Ignore URL parse error
    }
  }, [joinLiveFriendRoom]);

  // Real-time subscription to Firestore + Express SSE stream when in a Live Friend room
  useEffect(() => {
    if (mode !== 'online_friend' || !liveRoomId) return;

    const unsubFirestore = subscribeToWrongWayLiveRoom(liveRoomId, (cloudDoc) => {
      if (cloudDoc) {
        applyLiveRoomSnapshot(cloudDoc);
      }
    });

    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/wrong-way/rooms/${encodeURIComponent(liveRoomId)}/events`);
      es.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(ev.data) as WrongWayLiveRoomDoc;
          if (parsed && parsed.roomId) {
            applyLiveRoomSnapshot(parsed);
          }
        } catch {
          // Ignore malformed SSE payload
        }
      };
    } catch {
      // Ignore SSE error if offline
    }

    return () => {
      unsubFirestore();
      if (es) es.close();
    };
  }, [mode, liveRoomId, applyLiveRoomSnapshot]);

  // Shareable Invite URL generator (automatically uses public shared ais-pre origin if running inside ais-dev preview)
  const shareableInviteUrl = useMemo(() => {
    if (!liveRoomId || typeof window === 'undefined') return '';
    const publicOrigin = window.location.origin.replace('//ais-dev-', '//ais-pre-');
    return `${publicOrigin}${window.location.pathname}?wrongWayRoom=${liveRoomId}#wrong-way`;
  }, [liveRoomId]);

  const handleCopyInviteLink = async () => {
    if (!shareableInviteUrl) return;
    try {
      await navigator.clipboard.writeText(shareableInviteUrl);
      setCopiedInviteLink(true);
      soundEngine.playDiscovery();
      showToast('🔗 Invite link copied! Send it to your friend.');
      window.setTimeout(() => setCopiedInviteLink(false), 2500);
    } catch {
      showToast(`Room Code: ${liveRoomId}`);
    }
  };

  const currentPlayer = players[turnIndex] || players[0];

  // Interactive Coach, Path Guide & 3-Step Practice Tutorial State
  const [showShortestPathGuide, setShowShortestPathGuide] = useState<boolean>(true);
  const [showTacticalCoach, setShowTacticalCoach] = useState<boolean>(true);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null); // null = normal play, 1..3 = interactive practice steps

  // Shortest-path distance & full cell path telemetry for each player
  const shortestPathsByPlayer = useMemo(() => {
    const map: Record<number, { dist: number; path: GridPos[] }> = {};
    for (const p of players) {
      const res = computeShortestPathToGoal(p, walls, boardSize);
      map[p.id] = res || { dist: 99, path: [] };
    }
    return map;
  }, [players, walls, boardSize]);

  const shortestDistances = useMemo(() => {
    const map: Record<number, number> = {};
    for (const p of players) {
      map[p.id] = shortestPathsByPlayer[p.id]?.dist ?? 99;
    }
    return map;
  }, [players, shortestPathsByPlayer]);

  // Live tactical coach recommendation for the human player
  const coachAdvice = useMemo(() => {
    if (!currentPlayer || currentPlayer.isAI || winner) return null;
    if (tutorialStep === 1) {
      return {
        badge: 'STEP 1 OF 3 • MOVE YOUR ORB',
        headline: 'Tap the glowing cyan square directly above your orb to step forward!',
        detail: 'Your goal is to reach Row 1 (the top cyan edge) before the pink orb reaches Row 9.',
        recommendedWall: null,
      };
    }
    if (tutorialStep === 2) {
      const opp = players[1];
      const recR = Math.max(0, Math.min(boardSize - 2, opp ? opp.r : 1));
      const recC = Math.max(0, Math.min(boardSize - 2, opp ? opp.c : 4));
      return {
        badge: 'STEP 2 OF 3 • BLOCK WITH A LASER WALL',
        headline: 'Drag a Horizontal wall from the tray (or tap the pulsing gold slot in front of Pink)!',
        detail: 'Each wall spans 2 squares. Placing a wall right in front of your rival forces them to detour around it!',
        recommendedWall: { r: recR, c: recC, orientation: 'H' as WallOrientation },
      };
    }
    if (tutorialStep === 3) {
      return {
        badge: 'STEP 3 OF 3 • THE JUMP & GOLDEN RULE',
        headline: 'Watch the Shortest-Path step counter! Keep your steps lower than your rival’s.',
        detail: 'When two orbs meet face-to-face, you can JUMP 2 squares straight over them! Win this practice round to graduate.',
        recommendedWall: null,
      };
    }

    const myDist = shortestDistances[currentPlayer.id] ?? 99;
    const opponents = players.filter((p) => p.id !== currentPlayer.id);
    let leadingOpp = opponents[0];
    let oppDist = leadingOpp ? shortestDistances[leadingOpp.id] ?? 99 : 99;
    for (const opp of opponents) {
      const d = shortestDistances[opp.id] ?? 99;
      if (d < oppDist) {
        leadingOpp = opp;
        oppDist = d;
      }
    }

    const bestAction = computeBestTacticalAction(turnIndex, players, walls, boardSize, 'hardcore');
    if (myDist < oppDist) {
      return {
        badge: `YOU LEAD BY ${oppDist - myDist} STEP${oppDist - myDist > 1 ? 'S' : ''}`,
        headline: 'You are ahead in the race — advance your orb along the cyan path!',
        detail: 'When you have the shorter path, keep stepping forward unless the opponent is about to jump over you.',
        recommendedWall:
          bestAction.type === 'WALL'
            ? { r: bestAction.r, c: bestAction.c, orientation: bestAction.orientation }
            : null,
      };
    }
    if (bestAction.type === 'WALL' && currentPlayer.wallsLeft > 0) {
      return {
        badge: myDist === oppDist ? 'TIED RACE • DROP A WALL' : `BEHIND BY ${myDist - oppDist} • BLOCK NOW`,
        headline: `Drop a ${bestAction.orientation === 'H' ? 'Horizontal ━' : 'Vertical ┃'} wall to detour ${leadingOpp?.name || 'your rival'}!`,
        detail: 'Hover or drag a wall over the board to see the live (+Steps) impact badge before you drop it.',
        recommendedWall: { r: bestAction.r, c: bestAction.c, orientation: bestAction.orientation },
      };
    }
    return {
      badge: 'ADVANCE ORB',
      headline: 'Step your orb forward toward the finish line!',
      detail: 'Conserve your remaining walls for L-corner traps when the opponent gets closer.',
      recommendedWall: null,
    };
  }, [
    currentPlayer,
    winner,
    tutorialStep,
    players,
    boardSize,
    shortestDistances,
    turnIndex,
    walls,
  ]);

  // Interactive 3-Step Guided Tutorial launcher
  const startInteractiveTutorial = useCallback(() => {
    soundEngine.playDiscovery();
    setMode('vs_ai');
    setAiDifficulty('easy');
    setTutorialStep(1);
    setShowShortestPathGuide(true);
    setShowTacticalCoach(true);
    setWinner(null);
    setEqualizerPendingWinner(null);
    setIsDrawResult(false);
    setHistory([]);
    setMoveCount(0);
    setPlacingWallMode(false);
    setHoverWallSlot(null);
    setTrayOrientation('H');
    setBoardSize(9);
    setWalls([]);
    setMatchStarterIdx(0);
    setTurnIndex(0);
    setPlayers([
      {
        id: 0,
        name: 'You (Cyan)',
        isAI: false,
        r: 8,
        c: 4,
        wallsLeft: 10,
        colorHex: '#22d3ee',
        glowHex: 'rgba(34,211,238,0.8)',
        badgeBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-200',
        goalType: 'ROW_TOP',
        frozenTurns: 0,
      },
      {
        id: 1,
        name: 'Coach Bot (Pink)',
        isAI: true,
        r: 0,
        c: 4,
        wallsLeft: 10,
        colorHex: '#f43f5e',
        glowHex: 'rgba(244,63,94,0.8)',
        badgeBg: 'bg-rose-500/20 border-rose-400 text-rose-200',
        goalType: 'ROW_BOTTOM',
        frozenTurns: 0,
      },
    ]);
    showToast('🎓 Interactive Practice Started! Follow the Coach Banner above the board.');
  }, [showToast]);

  // Legal moves for current player
  const legalMovesForTurn = useMemo(() => {
    if (!currentPlayer || winner || currentPlayer.isAI) return [];
    if (mode === 'online_friend' && turnIndex !== myLiveSeat) return [];
    return getLegalPawnMoves(currentPlayer, players, walls, boardSize, ghostActive);
  }, [currentPlayer, players, walls, boardSize, winner, ghostActive, mode, turnIndex, myLiveSeat]);

  // Advance Turn (handles Freeze power skipping frozen opponent turns)
  const advanceTurn = useCallback(
    (nextPlayers: PlayerState[], currentIdx: number) => {
      const count = nextPlayers.length;
      let candidateIdx = (currentIdx + 1) % count;
      const updatedPlayers = nextPlayers.map((p) => ({ ...p }));

      if (updatedPlayers[candidateIdx].frozenTurns > 0) {
        updatedPlayers[candidateIdx].frozenTurns -= 1;
        showToast(`❄️ ${updatedPlayers[candidateIdx].name} is Frozen and skips a turn!`);
        candidateIdx = (candidateIdx + 1) % count;
      }

      setPlayers(updatedPlayers);
      setTurnIndex(candidateIdx);
    },
    [showToast]
  );

  // Handle Victory
  const handleVictory = useCallback(
    (winningPlayer: PlayerState, totalPlayerMoves: number) => {
      setWinner(winningPlayer);
      setTutorialStep(null);
      if (winningPlayer.id === 0) {
        soundEngine.playVictory();
        if (mode === 'campaign') {
          const par = activeCampaignLevel.parMoves;
          const starsEarned = totalPlayerMoves <= par ? 3 : totalPlayerMoves <= par + 5 ? 2 : 1;
          setSaveData((prev) => {
            const prevStars = prev.starsByLevel[activeLevelNum] || 0;
            const nextUnlocked = Math.min(60, Math.max(prev.unlockedLevel, activeLevelNum + 1));
            return {
              ...prev,
              unlockedLevel: nextUnlocked,
              starsByLevel: {
                ...prev.starsByLevel,
                [activeLevelNum]: Math.max(prevStars, starsEarned),
              },
            };
          });
        }
      } else {
        soundEngine.playWrong();
      }
    },
    [mode, activeCampaignLevel, activeLevelNum]
  );

  // Helper to sync live room state after a move or wall drop in online_friend mode
  const syncLiveActionToCloud = useCallback(
    (
      nextPlayers: PlayerState[],
      nextWalls: PlacedWall[],
      nextTurnIdx: number,
      nextMoveCount: number,
      nextWinnerIdx: number,
      nextEqualizerIdx: number
    ) => {
      if (mode !== 'online_friend' || !liveRoomDoc) return;
      const p0 = nextPlayers[0];
      const p1 = nextPlayers[1];
      if (!p0 || !p1) return;
      const updatedDoc: WrongWayLiveRoomDoc = {
        ...liveRoomDoc,
        status: nextWinnerIdx !== -1 ? 'finished' : liveRoomDoc.guestId ? 'playing' : 'waiting',
        turnIndex: nextTurnIdx,
        p0R: p0.r,
        p0C: p0.c,
        p0Walls: p0.wallsLeft,
        p1R: p1.r,
        p1C: p1.c,
        p1Walls: p1.wallsLeft,
        wallsJson: encodeLiveWallsJson(nextWalls, sameSideFinish),
        winnerIndex: nextWinnerIdx,
        equalizerPendingIndex: nextEqualizerIdx,
        moveCount: nextMoveCount,
        updatedAt: new Date().toISOString(),
      };
      publishLiveRoomState(updatedDoc);
    },
    [mode, liveRoomDoc, sameSideFinish, encodeLiveWallsJson, publishLiveRoomState]
  );

  // Execute a Pawn Move
  const executePawnMove = useCallback(
    (targetR: number, targetC: number) => {
      if (!currentPlayer || winner) return;
      if (mode === 'online_friend' && turnIndex !== myLiveSeat) {
        showToast("⏳ Waiting for your friend's turn...");
        return;
      }

      // Save snapshot for Undo if human move
      if (!currentPlayer.isAI) {
        setHistory((prev) => [
          ...prev.slice(-15),
          {
            players: players.map((p) => ({ ...p })),
            walls: walls.map((w) => ({ ...w })),
            turnIndex,
            moveCount,
          },
        ]);
        if (tutorialStep === 1) {
          setTutorialStep(2);
          setPlacingWallMode(true);
        } else if (tutorialStep === 3) {
          setTutorialStep(null);
        }
      }

      soundEngine.playClick();
      setHintAction(null);
      setGhostActive(false);
      if (tutorialStep !== 1) {
        setPlacingWallMode(false);
      }

      const updatedPlayers = players.map((p, idx) =>
        idx === turnIndex ? { ...p, r: targetR, c: targetC } : { ...p }
      );
      const movedPlayer = updatedPlayers[turnIndex];
      const nextMoveCount = turnIndex === 0 ? moveCount + 1 : moveCount;
      if (turnIndex === 0) setMoveCount(nextMoveCount);

      const reachedGoal = hasPlayerReachedGoal(movedPlayer, boardSize);

      // If we are currently in the Last-Chance Equalizer turn for the 2nd mover:
      if (equalizerPendingWinner) {
        setPlayers(updatedPlayers);
        if (reachedGoal) {
          // Second mover equalized on the exact same turn count!
          // Tie-breaker: whoever has more walls remaining in their tray wins (or Shared Victory Draw if equal!)
          setEqualizerPendingWinner(null);
          if (movedPlayer.wallsLeft > equalizerPendingWinner.wallsLeft) {
            showToast(
              `⚖️ Equalized! ${movedPlayer.name} wins tie-breaker with ${movedPlayer.wallsLeft} walls left!`
            );
            handleVictory(movedPlayer, nextMoveCount);
            syncLiveActionToCloud(updatedPlayers, walls, turnIndex, nextMoveCount, movedPlayer.id, -1);
          } else if (equalizerPendingWinner.wallsLeft > movedPlayer.wallsLeft) {
            showToast(
              `⚖️ Equalized! ${equalizerPendingWinner.name} wins tie-breaker with ${equalizerPendingWinner.wallsLeft} walls left!`
            );
            handleVictory(equalizerPendingWinner, nextMoveCount);
            syncLiveActionToCloud(
              updatedPlayers,
              walls,
              turnIndex,
              nextMoveCount,
              equalizerPendingWinner.id,
              -1
            );
          } else {
            setIsDrawResult(true);
            handleVictory(movedPlayer, nextMoveCount);
            syncLiveActionToCloud(updatedPlayers, walls, turnIndex, nextMoveCount, 2, -1);
          }
        } else {
          // Second mover failed to reach the goal on their equalizer turn -> first mover wins!
          const firstWinner = equalizerPendingWinner;
          setEqualizerPendingWinner(null);
          handleVictory(firstWinner, nextMoveCount);
          syncLiveActionToCloud(updatedPlayers, walls, turnIndex, nextMoveCount, firstWinner.id, -1);
        }
        return;
      }

      if (reachedGoal) {
        setPlayers(updatedPlayers);
        // Check if Last-Chance Equalizer Rule applies (2-player modes when the match starter reaches goal first)
        const secondMoverIdx = (matchStarterIdx + 1) % updatedPlayers.length;
        const secondMover = updatedPlayers[secondMoverIdx];
        if (
          equalizerRuleEnabled &&
          updatedPlayers.length === 2 &&
          turnIndex === matchStarterIdx &&
          secondMover.frozenTurns === 0
        ) {
          setEqualizerPendingWinner(movedPlayer);
          setDashStepsRemaining(0);
          setTurnIndex(secondMoverIdx);
          showToast(
            `⚖️ Last-Chance Equalizer! ${secondMover.name} gets 1 final turn to reach the goal & force a tie-breaker!`
          );
          syncLiveActionToCloud(
            updatedPlayers,
            walls,
            secondMoverIdx,
            nextMoveCount,
            -1,
            movedPlayer.id
          );
          return;
        }

        handleVictory(movedPlayer, nextMoveCount);
        syncLiveActionToCloud(updatedPlayers, walls, turnIndex, nextMoveCount, movedPlayer.id, -1);
        return;
      }

      // Check if Dash Power gives a second step this turn
      if (!currentPlayer.isAI && dashStepsRemaining > 1) {
        setDashStepsRemaining(1);
        setPlayers(updatedPlayers);
        showToast('⚡ Dash active: Make your 2nd move!');
        return;
      }

      setDashStepsRemaining(0);
      const nextTurnIdx = (turnIndex + 1) % updatedPlayers.length;
      advanceTurn(updatedPlayers, turnIndex);
      syncLiveActionToCloud(updatedPlayers, walls, nextTurnIdx, nextMoveCount, -1, -1);
    },
    [
      currentPlayer,
      winner,
      mode,
      myLiveSeat,
      players,
      walls,
      turnIndex,
      moveCount,
      boardSize,
      dashStepsRemaining,
      equalizerPendingWinner,
      equalizerRuleEnabled,
      matchStarterIdx,
      tutorialStep,
      handleVictory,
      advanceTurn,
      showToast,
      syncLiveActionToCloud,
    ]
  );

  // Execute a Wall Placement
  const executeWallDrop = useCallback(
    (r: number, c: number, orientation: WallOrientation) => {
      if (!currentPlayer || winner) return;
      if (mode === 'online_friend' && turnIndex !== myLiveSeat) {
        showToast("⏳ Waiting for your friend's turn...");
        return;
      }
      if (currentPlayer.wallsLeft <= 0) {
        soundEngine.playWrong();
        showToast('No walls remaining in your tray!');
        return;
      }

      const validation = validateWallPlacement(r, c, orientation, walls, players, boardSize);
      if (!validation.valid) {
        soundEngine.playWrong();
        showToast(validation.reason || 'Invalid wall placement');
        return;
      }

      if (!currentPlayer.isAI) {
        setHistory((prev) => [
          ...prev.slice(-15),
          {
            players: players.map((p) => ({ ...p })),
            walls: walls.map((w) => ({ ...w })),
            turnIndex,
            moveCount,
          },
        ]);
        if (tutorialStep === 2) {
          setTutorialStep(3);
        }
      }

      soundEngine.playUnlock();
      setHintAction(null);
      setPlacingWallMode(false);
      setHoverWallSlot(null);
      setDashStepsRemaining(0);

      const newWall: PlacedWall = {
        id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        r,
        c,
        orientation,
        ownerId: currentPlayer.id,
      };

      const nextWalls = [...walls, newWall];
      const nextPlayers = players.map((p, idx) =>
        idx === turnIndex ? { ...p, wallsLeft: p.wallsLeft - 1 } : { ...p }
      );
      const nextMoveCount = turnIndex === 0 ? moveCount + 1 : moveCount;
      if (turnIndex === 0) setMoveCount(nextMoveCount);

      setWalls(nextWalls);

      // If a player drops a wall during an Equalizer turn instead of reaching the goal, the pending winner takes the victory
      if (equalizerPendingWinner) {
        const firstWinner = equalizerPendingWinner;
        setEqualizerPendingWinner(null);
        setPlayers(nextPlayers);
        handleVictory(firstWinner, nextMoveCount);
        syncLiveActionToCloud(nextPlayers, nextWalls, turnIndex, nextMoveCount, firstWinner.id, -1);
        return;
      }

      const nextTurnIdx = (turnIndex + 1) % nextPlayers.length;
      advanceTurn(nextPlayers, turnIndex);
      syncLiveActionToCloud(nextPlayers, nextWalls, nextTurnIdx, nextMoveCount, -1, -1);
    },
    [
      currentPlayer,
      winner,
      mode,
      myLiveSeat,
      walls,
      players,
      boardSize,
      turnIndex,
      moveCount,
      equalizerPendingWinner,
      tutorialStep,
      handleVictory,
      advanceTurn,
      showToast,
      syncLiveActionToCloud,
    ]
  );

  // Rematch handler that also syncs live friend rooms (and optional finish mode switch)
  const handleRestartOrRematch = useCallback(
    (overrideSameSide?: boolean) => {
      setTutorialStep(null);
      const effSameSide = typeof overrideSameSide === 'boolean' ? overrideSameSide : sameSideFinish;
      if (typeof overrideSameSide === 'boolean') {
        setSameSideFinish(overrideSameSide);
      }
      if (mode === 'online_friend' && liveRoomDoc) {
        const nextStarter = (liveRoomDoc.starterIndex + 1) % 2;
        const rematchDoc: WrongWayLiveRoomDoc = {
          ...liveRoomDoc,
          status: liveRoomDoc.guestId ? 'playing' : 'waiting',
          turnIndex: nextStarter,
          starterIndex: nextStarter,
          p0R: 8,
          p0C: effSameSide ? 2 : 4,
          p0Walls: nextStarter === 0 ? 10 : 11,
          p1R: effSameSide ? 8 : 0,
          p1C: effSameSide ? 6 : 4,
          p1Walls: nextStarter === 1 ? 10 : 11,
          wallsJson: encodeLiveWallsJson([], effSameSide),
          winnerIndex: -1,
          equalizerPendingIndex: -1,
          moveCount: 0,
          updatedAt: new Date().toISOString(),
        };
        applyLiveRoomSnapshot(rematchDoc);
        publishLiveRoomState(rematchDoc);
        return;
      }
      initMatch(mode, activeLevelNum, aiDifficulty);
    },
    [
      mode,
      liveRoomDoc,
      sameSideFinish,
      encodeLiveWallsJson,
      applyLiveRoomSnapshot,
      publishLiveRoomState,
      initMatch,
      activeLevelNum,
      aiDifficulty,
    ]
  );

  // AI Turn Execution Effect
  useEffect(() => {
    if (!currentPlayer || !currentPlayer.isAI || winner) return;

    const effDifficulty =
      tutorialStep !== null
        ? 'easy'
        : mode === 'campaign'
        ? activeCampaignLevel.difficulty
        : aiDifficulty;

    const timer = window.setTimeout(() => {
      const action = computeBestTacticalAction(
        turnIndex,
        players,
        walls,
        boardSize,
        effDifficulty
      );
      if (action.type === 'WALL' && tutorialStep === null) {
        executeWallDrop(action.r, action.c, action.orientation);
      } else if (action.type === 'MOVE') {
        executePawnMove(action.to.r, action.to.c);
      } else {
        const fallbackMoves = getLegalPawnMoves(currentPlayer, players, walls, boardSize, false);
        if (fallbackMoves[0]) {
          executePawnMove(fallbackMoves[0].r, fallbackMoves[0].c);
        }
      }
    }, 440);

    return () => clearTimeout(timer);
  }, [
    currentPlayer,
    winner,
    tutorialStep,
    mode,
    activeCampaignLevel,
    aiDifficulty,
    turnIndex,
    players,
    walls,
    boardSize,
    executeWallDrop,
    executePawnMove,
  ]);

  // In Live Friend mode when playing Opposite Sides, Device 2 (myLiveSeat === 1) sees the board flipped 180°
  // so that on EVERY device screen, the local player starts at the BOTTOM of their own screen and races UPWARD!
  const isBoardFlipped = mode === 'online_friend' && myLiveSeat === 1 && !sameSideFinish;

  // --- POINTER DRAG-FROM-DOCK & DIRECT BOARD GROOVE / INTERSECTION CALCULATION ---
  const computeIntersectionFromClientXY = useCallback(
    (clientX: number, clientY: number): { r: number; c: number } | null => {
      const el = boardRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }
      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;

      // Intersections sit at internal grid corners (1 .. boardSize - 1) / boardSize
      const rawC = Math.round(relX * boardSize) - 1;
      const rawR = Math.round(relY * boardSize) - 1;
      const visC = Math.max(0, Math.min(boardSize - 2, rawC));
      const visR = Math.max(0, Math.min(boardSize - 2, rawR));
      const r = isBoardFlipped ? boardSize - 2 - visR : visR;
      const c = isBoardFlipped ? boardSize - 2 - visC : visC;
      return { r, c };
    },
    [boardSize, isBoardFlipped]
  );

  // Detects direct hover/tap on horizontal or vertical grooves between grid cells even without pressing the wall dock first
  const computeDirectGrooveWallFromClientXY = useCallback(
    (
      clientX: number,
      clientY: number
    ): { r: number; c: number; orientation: WallOrientation } | null => {
      const el = boardRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }
      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;

      const gx = relX * boardSize;
      const gy = relY * boardSize;

      const nearestIntX = Math.round(gx);
      const nearestIntY = Math.round(gy);
      const distX = Math.abs(gx - nearestIntX);
      const distY = Math.abs(gy - nearestIntY);

      // If placingWallMode is explicitly active (user tapped +Horizontal or +Vertical button), lock to trayOrientation
      if (placingWallMode || isDraggingWallFromTray || tutorialStep === 2) {
        const visC = Math.max(0, Math.min(boardSize - 2, nearestIntX - 1));
        const visR = Math.max(0, Math.min(boardSize - 2, nearestIntY - 1));
        const r = isBoardFlipped ? boardSize - 2 - visR : visR;
        const c = isBoardFlipped ? boardSize - 2 - visC : visC;
        return { r, c, orientation: trayOrientation };
      }

      // Otherwise, if pointer is inside an internal groove between cells (within 23% of a grid line), auto-detect H vs V!
      const isInternalHorizGroove =
        nearestIntY >= 1 && nearestIntY <= boardSize - 1 && distY < 0.22;
      const isInternalVertGroove =
        nearestIntX >= 1 && nearestIntX <= boardSize - 1 && distX < 0.22;

      if (!isInternalHorizGroove && !isInternalVertGroove) {
        return null;
      }

      if (isInternalHorizGroove && (!isInternalVertGroove || distY <= distX)) {
        const visR = Math.max(0, Math.min(boardSize - 2, nearestIntY - 1));
        const visC = Math.max(0, Math.min(boardSize - 2, Math.floor(gx)));
        const r = isBoardFlipped ? boardSize - 2 - visR : visR;
        const c = isBoardFlipped ? boardSize - 2 - visC : visC;
        return { r, c, orientation: 'H' };
      } else {
        const visC = Math.max(0, Math.min(boardSize - 2, nearestIntX - 1));
        const visR = Math.max(0, Math.min(boardSize - 2, Math.floor(gy)));
        const r = isBoardFlipped ? boardSize - 2 - visR : visR;
        const c = isBoardFlipped ? boardSize - 2 - visC : visC;
        return { r, c, orientation: 'V' };
      }
    },
    [boardSize, placingWallMode, isDraggingWallFromTray, tutorialStep, trayOrientation, isBoardFlipped]
  );

  useEffect(() => {
    if (!isDraggingWallFromTray) return;

    const handleGlobalMove = (e: PointerEvent) => {
      const slot = computeIntersectionFromClientXY(e.clientX, e.clientY);
      if (slot) {
        setHoverWallSlot({ r: slot.r, c: slot.c, orientation: trayOrientation });
      } else {
        setHoverWallSlot(null);
      }
    };

    const handleGlobalUp = (e: PointerEvent) => {
      setIsDraggingWallFromTray(false);
      const slot = computeIntersectionFromClientXY(e.clientX, e.clientY);
      if (slot) {
        executeWallDrop(slot.r, slot.c, trayOrientation);
      } else {
        setHoverWallSlot(null);
      }
    };

    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
    };
  }, [isDraggingWallFromTray, trayOrientation, computeIntersectionFromClientXY, executeWallDrop]);

  // Direct handler for tapping or dragging the dedicated Horizontal (━) or Vertical (┃) dock buttons
  const handleSelectOrDragWallOrientation = (
    orientation: WallOrientation,
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    if (!currentPlayer || currentPlayer.isAI || winner) return;
    if (mode === 'online_friend' && turnIndex !== myLiveSeat) {
      showToast("⏳ Waiting for your friend's turn...");
      return;
    }
    if (currentPlayer.wallsLeft <= 0) {
      soundEngine.playWrong();
      showToast('No walls remaining in your tray!');
      return;
    }
    e.preventDefault();
    soundEngine.playClick();
    setHammerActive(false);

    // If user taps the already-active orientation button without dragging, toggle back to Move Orb mode
    const alreadyActiveSameOrientation = placingWallMode && trayOrientation === orientation;
    setTrayOrientation(orientation);
    setPlacingWallMode(!alreadyActiveSameOrientation ? true : true);
    setIsDraggingWallFromTray(true);
  };

  // Fullscreen toggle support
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const onFsChange = () => {
      setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await (containerRef.current || document.documentElement).requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore if iframe restricts native fullscreen; layout is already locked fixed inset-0 100dvh
    }
  };

  // --- TACTICAL POWER HANDLERS ---
  const consumePower = (key: keyof WrongWaySaveData['powerInventory']): boolean => {
    if (saveData.powerInventory[key] <= 0) {
      soundEngine.playWrong();
      showToast(`No ${key.toUpperCase()} charges left! Win campaign zone chests to refill.`);
      return false;
    }
    setSaveData((prev) => ({
      ...prev,
      powerInventory: {
        ...prev.powerInventory,
        [key]: Math.max(0, prev.powerInventory[key] - 1),
      },
    }));
    return true;
  };

  const handleUseHint = () => {
    if (!currentPlayer || currentPlayer.isAI || winner) return;
    if (!consumePower('hint')) return;
    soundEngine.playDiscovery();
    const best = computeBestTacticalAction(turnIndex, players, walls, boardSize, 'hardcore');
    if (best.type === 'MOVE') {
      setHintAction({ type: 'MOVE', to: best.to });
      showToast('💡 Hint: Advance your orb to the highlighted golden square!');
    } else {
      setHintAction({
        type: 'WALL',
        r: best.r,
        c: best.c,
        orientation: best.orientation,
      });
      setTrayOrientation(best.orientation);
      setPlacingWallMode(true);
      setHoverWallSlot({ r: best.r, c: best.c, orientation: best.orientation });
      showToast(
        `💡 Hint: Tap the highlighted ${best.orientation === 'H' ? 'Horizontal ━' : 'Vertical ┃'} slot on the board!`
      );
    }
  };

  const handleUseUndo = () => {
    if (history.length === 0 || winner) {
      soundEngine.playWrong();
      showToast('Nothing to undo yet!');
      return;
    }
    if (!consumePower('undo')) return;
    soundEngine.playClick();
    const last = history[history.length - 1];
    setPlayers(last.players);
    setWalls(last.walls);
    setTurnIndex(last.turnIndex);
    setMoveCount(last.moveCount);
    setEqualizerPendingWinner(null);
    setHistory((prev) => prev.slice(0, -1));
    setHintAction(null);
    showToast('⏪ Rewound to your previous turn!');
  };

  const handleUseDash = () => {
    if (!currentPlayer || currentPlayer.isAI || winner || dashStepsRemaining > 0) return;
    if (!consumePower('dash')) return;
    soundEngine.playDiscovery();
    setDashStepsRemaining(2);
    setPlacingWallMode(false);
    showToast('⚡ Dash activated! Move your orb TWICE this turn.');
  };

  const handleUseGhost = () => {
    if (!currentPlayer || currentPlayer.isAI || winner || ghostActive) return;
    if (!consumePower('ghost')) return;
    soundEngine.playDiscovery();
    setGhostActive(true);
    setPlacingWallMode(false);
    showToast('👻 Ghost Phase active! Step directly through any adjacent wall.');
  };

  const handleUseHammer = () => {
    if (!currentPlayer || currentPlayer.isAI || winner) return;
    if (walls.length === 0) {
      soundEngine.playWrong();
      showToast('No walls on the grid to smash!');
      return;
    }
    if (hammerActive) {
      setHammerActive(false);
      return;
    }
    soundEngine.playClick();
    setHammerActive(true);
    setPlacingWallMode(false);
    showToast('🔨 Tap any glowing wall on the board to shatter it!');
  };

  const handleSmashWall = (wallId: string) => {
    if (!hammerActive) return;
    if (!consumePower('hammer')) {
      setHammerActive(false);
      return;
    }
    soundEngine.playUnlock();
    setWalls((prev) => prev.filter((w) => w.id !== wallId));
    setHammerActive(false);
    showToast('💥 Wall shattered!');
  };

  const handleUseFreeze = () => {
    if (!currentPlayer || currentPlayer.isAI || winner) return;
    if (!consumePower('freeze')) return;
    soundEngine.playDiscovery();
    const nextIdx = (turnIndex + 1) % players.length;
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === nextIdx ? { ...p, frozenTurns: p.frozenTurns + 1 } : p))
    );
    showToast(`❄️ Froze ${players[nextIdx].name} for their next turn!`);
  };

  const handleUseExtraWalls = () => {
    if (!currentPlayer || currentPlayer.isAI || winner) return;
    if (!consumePower('extraWalls')) return;
    soundEngine.playUnlock();
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === turnIndex ? { ...p, wallsLeft: p.wallsLeft + 2 } : p))
    );
    showToast('🧱 +2 Neon Walls added to your tray!');
  };

  const handleClaimZoneChest = (zoneNum: number) => {
    if (saveData.claimedZoneChests.includes(zoneNum)) return;
    soundEngine.playVictory();
    setSaveData((prev) => ({
      ...prev,
      claimedZoneChests: [...prev.claimedZoneChests, zoneNum],
      powerInventory: {
        hint: prev.powerInventory.hint + 3,
        undo: prev.powerInventory.undo + 3,
        dash: prev.powerInventory.dash + 2,
        ghost: prev.powerInventory.ghost + 2,
        hammer: prev.powerInventory.hammer + 2,
        freeze: prev.powerInventory.freeze + 2,
        extraWalls: prev.powerInventory.extraWalls + 2,
      },
    }));
    showToast(`🎁 Zone ${zoneNum} Chest Opened! +2 to all Tactical Powers!`);
  };

  // Validate current hover wall preview & compute live step-delay impact (+Steps on Opponent vs Self)
  const hoverWallValidation = useMemo(() => {
    if (!hoverWallSlot || !currentPlayer) return null;
    if (currentPlayer.wallsLeft <= 0) {
      return { valid: false, reason: '0 walls left', oppDelta: 0, selfDelta: 0 };
    }
    const baseCheck = validateWallPlacement(
      hoverWallSlot.r,
      hoverWallSlot.c,
      hoverWallSlot.orientation,
      walls,
      players,
      boardSize
    );
    if (!baseCheck.valid) {
      return { ...baseCheck, oppDelta: 0, selfDelta: 0 };
    }

    const testWalls: PlacedWall[] = [
      ...walls,
      {
        id: 'preview',
        r: hoverWallSlot.r,
        c: hoverWallSlot.c,
        orientation: hoverWallSlot.orientation,
        ownerId: currentPlayer.id,
      },
    ];
    const opp = players.find((p) => p.id !== currentPlayer.id) || players[0];
    const newOppPath = computeShortestPathToGoal(opp, testWalls, boardSize);
    const newSelfPath = computeShortestPathToGoal(currentPlayer, testWalls, boardSize);
    const oppDelta = (newOppPath?.dist ?? 99) - (shortestDistances[opp.id] ?? 99);
    const selfDelta = (newSelfPath?.dist ?? 99) - (shortestDistances[currentPlayer.id] ?? 99);

    return {
      valid: true,
      oppDelta,
      selfDelta,
    };
  }, [hoverWallSlot, currentPlayer, walls, players, boardSize, shortestDistances]);

  const totalCampaignStars = useMemo(
    () => Object.values(saveData.starsByLevel).reduce((acc, s) => acc + s, 0),
    [saveData.starsByLevel]
  );

  const toggleMute = () => {
    const next = !muted;
    soundEngine.setMuted(next);
    setMuted(next);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] h-[100dvh] w-screen bg-[#0b0416] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 overflow-hidden select-none"
    >
      {/* Ambient Deep Neon Purple & Cyan Radial Studio Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 18% 15%, rgba(34,211,238,0.16) 0%, transparent 42%), radial-gradient(circle at 82% 80%, rgba(244,63,94,0.16) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(139,92,246,0.12) 0%, transparent 60%)',
        }}
      />

      {/* COMPACT FULL-SCREEN TOP BAR */}
      <header className="relative z-20 shrink-0 border-b border-purple-500/25 bg-[#120724]/90 backdrop-blur-md px-3 sm:px-5 py-1.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Exit to Hub + Title */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToHub}
              className="px-2 py-1 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 flex items-center gap-1 text-xs font-bold cursor-pointer transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </button>

            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase bg-gradient-to-r from-cyan-300 via-purple-200 to-rose-400 bg-clip-text text-transparent">
              Wrong Way
            </h1>
          </div>

          {/* Center: Mode Switcher Tabs + Clean Player Wall Pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-[#1b0b36] p-0.5 rounded-xl border border-purple-500/30">
              {(
                [
                  { id: 'campaign', label: '60 Lvls', icon: Crown },
                  { id: 'vs_ai', label: 'Vs AI', icon: Bot },
                  { id: 'online_friend', label: 'Live Friend', icon: Share2 },
                  { id: 'pass_2p', label: '2P', icon: Users },
                  { id: 'pass_4p', label: '4P', icon: Star },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = mode === tab.id && tutorialStep === null;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setTutorialStep(null);
                      if (tab.id === 'online_friend') {
                        if (!liveRoomId) {
                          createLiveFriendRoom(true);
                        } else {
                          setMode('online_friend');
                          setShowInviteModal(true);
                        }
                      } else {
                        setMode(tab.id);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer transition ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                        : 'text-purple-200/75 hover:text-white hover:bg-purple-900/50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Clean Player Wall Counters */}
            <div className="hidden sm:flex items-center gap-1.5">
              {players.map((p, idx) => {
                const isTurn = idx === turnIndex && !winner;
                return (
                  <div
                    key={p.id}
                    className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 text-[11px] font-black ${
                      isTurn
                        ? 'bg-[#1f0d3d] border-cyan-400 text-white'
                        : 'bg-[#140828]/80 border-purple-500/25 text-purple-300 opacity-75'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: p.colorHex,
                        boxShadow: `0 0 8px ${p.colorHex}`,
                      }}
                    />
                    <span>{p.wallsLeft}W</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Finish Direction Toggle, Level/AI/Invite Settings, Fullscreen, Rules, Sound, Restart */}
          <div className="flex items-center gap-1">
            {mode !== 'pass_4p' && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  const nextSameSide = !sameSideFinish;
                  handleRestartOrRematch(nextSameSide);
                }}
                title="Switch between Same-Side Finish (both start at bottom & race to top) and Opposite Sides"
                className={`px-2 py-1 rounded-lg border text-[11px] font-black flex items-center gap-1 cursor-pointer transition ${
                  sameSideFinish
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                    : 'bg-purple-950/70 border-purple-500/30 text-purple-200'
                }`}
              >
                <span>{sameSideFinish ? '🏁 Same Finish' : '⇅ Opposite'}</span>
              </button>
            )}

            {mode === 'online_friend' && (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-[11px] font-black flex items-center gap-1 cursor-pointer"
              >
                <Link2 className="w-3 h-3 text-cyan-300" />
                <span>{liveRoomId ? `Invite (${liveRoomId})` : 'Invite'}</span>
              </button>
            )}

            {mode === 'campaign' && (
              <button
                type="button"
                onClick={() => setShowLevelDrawer(true)}
                className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-[11px] font-black flex items-center gap-1 cursor-pointer"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Lv {activeLevelNum}</span>
              </button>
            )}

            {mode === 'vs_ai' && (
              <div className="hidden md:flex items-center gap-0.5 bg-purple-950/70 p-0.5 rounded-lg border border-purple-500/30">
                {(['easy', 'normal', 'hard', 'hardcore'] as WrongWayDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAiDifficulty(d)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase cursor-pointer transition ${
                      aiDifficulty === d
                        ? 'bg-rose-500 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={toggleBrowserFullscreen}
              title={isBrowserFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-cyan-300 cursor-pointer"
            >
              {isBrowserFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              aria-label="How to Play"
              className="p-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-purple-200 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label="Toggle Sound"
              className="p-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-purple-200 cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleRestartOrRematch()}
              aria-label="Restart Match"
              className="p-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-purple-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* CENTER: LARGE, PLAIN & CLEAN NEON ROOM BOARD (With Top 🏁 FINISH Line & Bottom Start for Every Device!) */}
      <main className="relative z-10 flex-1 min-h-0 w-full flex flex-col items-center justify-center px-2 py-1">
        {/* Clean WallRush-Style 🏁 FINISH Header Line directly above the board */}
        {mode !== 'pass_4p' && (
          <div className="w-[min(71dvh,94vw)] sm:w-[min(73dvh,660px)] flex items-center gap-3 mb-1">
            <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/70 to-emerald-400" />
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase text-emerald-300">
              <span>🏁</span>
              <span>FINISH</span>
            </div>
            <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-emerald-400/70 to-emerald-400" />
          </div>
        )}

        <div
          ref={boardRef}
          onPointerMove={(e) => {
            if (!currentPlayer || currentPlayer.isAI || winner) return;
            if (mode === 'online_friend' && turnIndex !== myLiveSeat) return;
            const slot = computeDirectGrooveWallFromClientXY(e.clientX, e.clientY);
            if (slot) {
              setHoverWallSlot(slot);
            } else {
              setHoverWallSlot(null);
            }
          }}
          onPointerLeave={() => {
            if (!isDraggingWallFromTray) setHoverWallSlot(null);
          }}
          onClick={(e) => {
            if (!currentPlayer || currentPlayer.isAI || winner) return;
            const slot = computeDirectGrooveWallFromClientXY(e.clientX, e.clientY);
            if (slot) {
              executeWallDrop(slot.r, slot.c, slot.orientation);
            }
          }}
          className="relative aspect-square h-[min(70dvh,94vw)] w-[min(70dvh,94vw)] sm:h-[min(72dvh,660px)] sm:w-[min(72dvh,660px)] bg-[#130627] rounded-2xl p-2.5 sm:p-3 border-2 border-purple-500/45 shadow-[0_0_45px_rgba(139,92,246,0.28)] select-none touch-none"
        >
          {/* Grid Cells Layer (Rendered from each device's bottom-up perspective when isBoardFlipped is active!) */}
          <div
            className="w-full h-full grid relative"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
              gap: '7px',
            }}
          >
            {Array.from({ length: boardSize * boardSize }).map((_, idx) => {
              const visR = Math.floor(idx / boardSize);
              const visC = idx % boardSize;
              const r = isBoardFlipped ? boardSize - 1 - visR : visR;
              const c = isBoardFlipped ? boardSize - 1 - visC : visC;
              const center = Math.floor(boardSize / 2);
              const isCenterStar = mode === 'pass_4p' && r === center && c === center;
              const isTopVisualFinishRow = mode !== 'pass_4p' && visR === 0;
              const isBottomVisualRow = mode !== 'pass_4p' && visR === boardSize - 1;

              const legalMove = legalMovesForTurn.find((m) => m.r === r && m.c === c);
              const isHintMove =
                hintAction?.type === 'MOVE' &&
                hintAction.to.r === r &&
                hintAction.to.c === c;
              const occupant = players.find((p) => p.r === r && p.c === c);

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    if (legalMove) {
                      e.stopPropagation();
                      executePawnMove(r, c);
                    }
                  }}
                  className={`relative rounded-xl border flex items-center justify-center transition-all ${
                    isHintMove
                      ? 'bg-amber-400/30 border-amber-300 cursor-pointer'
                      : legalMove
                      ? 'bg-cyan-500/20 hover:bg-cyan-400/35 border-cyan-400/75 cursor-pointer'
                      : isCenterStar
                      ? 'bg-amber-500/15 border-amber-400/50'
                      : isTopVisualFinishRow
                      ? 'bg-emerald-500/20 border-emerald-400/45'
                      : isBottomVisualRow && !sameSideFinish
                      ? 'bg-rose-950/35 border-rose-500/25'
                      : 'bg-[#1c0b38]/90 border-purple-500/20'
                  }`}
                >
                  {/* 4-Player Center Golden Star Goal */}
                  {isCenterStar && !occupant && (
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  )}

                  {/* Glowing Orb Pawn */}
                  {occupant && (
                    <div
                      className={`w-[72%] h-[72%] rounded-full transition-transform duration-200 flex items-center justify-center relative ${
                        occupant.id === currentPlayer?.id && !winner ? 'scale-105' : 'scale-95'
                      }`}
                      style={{
                        background: `radial-gradient(circle at 32% 30%, #ffffff 0%, ${occupant.colorHex} 48%, #090314 100%)`,
                        boxShadow: `0 0 18px ${occupant.colorHex}, inset 0 0 8px rgba(255,255,255,0.8)`,
                      }}
                    >
                      {occupant.frozenTurns > 0 && (
                        <Snowflake className="w-3.5 h-3.5 text-white drop-shadow" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* PLACED NEON WALLS LAYER (Perspective-adjusted for Device 2 when isBoardFlipped is active) */}
            {walls.map((w) => {
              const visWallR = isBoardFlipped ? boardSize - 2 - w.r : w.r;
              const visWallC = isBoardFlipped ? boardSize - 2 - w.c : w.c;
              const centerPctX = ((visWallC + 1) / boardSize) * 100;
              const centerPctY = ((visWallR + 1) / boardSize) * 100;
              const spanPct = (2 / boardSize) * 100 - 1.2;

              const wallColor =
                w.ownerId === 0
                  ? '#22d3ee'
                  : w.ownerId === 1
                  ? '#f43f5e'
                  : w.ownerId === 2
                  ? '#fbbf24'
                  : w.ownerId === 3
                  ? '#34d399'
                  : '#c084fc';

              return (
                <div
                  key={w.id}
                  onClick={(e) => {
                    if (hammerActive) {
                      e.stopPropagation();
                      handleSmashWall(w.id);
                    }
                  }}
                  style={{
                    left: `${centerPctX}%`,
                    top: `${centerPctY}%`,
                    width: w.orientation === 'H' ? `${spanPct}%` : '8px',
                    height: w.orientation === 'V' ? `${spanPct}%` : '8px',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: wallColor,
                    boxShadow: `0 0 14px ${wallColor}, 0 0 4px #ffffff`,
                  }}
                  className={`absolute z-20 rounded-full transition ${
                    hammerActive
                      ? 'cursor-pointer ring-2 ring-amber-300 animate-pulse hover:scale-110'
                      : 'pointer-events-none'
                  }`}
                />
              );
            })}

            {/* CLEAN GHOST WALL PREVIEW (Perspective-adjusted for Device 2 when isBoardFlipped is active) */}
            {hoverWallSlot && !winner && (
              <div
                style={{
                  left: `${(((isBoardFlipped ? boardSize - 2 - hoverWallSlot.c : hoverWallSlot.c) + 1) / boardSize) * 100}%`,
                  top: `${(((isBoardFlipped ? boardSize - 2 - hoverWallSlot.r : hoverWallSlot.r) + 1) / boardSize) * 100}%`,
                  width:
                    hoverWallSlot.orientation === 'H'
                      ? `${(2 / boardSize) * 100 - 1.2}%`
                      : '8px',
                  height:
                    hoverWallSlot.orientation === 'V'
                      ? `${(2 / boardSize) * 100 - 1.2}%`
                      : '8px',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: hoverWallValidation?.valid ? '#38bdf8' : '#ef4444',
                  boxShadow: hoverWallValidation?.valid
                    ? '0 0 16px #38bdf8, 0 0 4px #ffffff'
                    : '0 0 16px #ef4444',
                }}
                className="absolute z-30 rounded-full pointer-events-none opacity-85 transition-all duration-75"
              />
            )}
          </div>
        </div>
      </main>

      {/* BOTTOM DOCK: DIRECT HORIZONTAL (━) & VERTICAL (┃) WALL PLACEMENT + TACTICAL POWERS (Zero Scroll!) */}
      <footer className="relative z-20 shrink-0 w-full max-w-[540px] mx-auto px-2.5 pb-2 pt-1 space-y-1.5">
        {/* ROW 1: DIRECT MOVE ORB / + HORIZONTAL WALL (━) / + VERTICAL WALL (┃) DOCK */}
        <div className="grid grid-cols-3 gap-2 bg-[#16082c]/95 border border-purple-400/40 rounded-2xl p-1.5 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
          {/* 1. Move Orb Mode Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setPlacingWallMode(false);
              setHoverWallSlot(null);
              setHammerActive(false);
            }}
            className={`h-12 rounded-xl border px-2 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
              !placingWallMode && !hammerActive
                ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-cyan-300 text-white shadow-[0_0_14px_rgba(34,211,238,0.35)]'
                : 'bg-purple-950/60 hover:bg-purple-900/60 border-purple-500/30 text-purple-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: currentPlayer?.colorHex || '#22d3ee',
                  boxShadow: `0 0 8px ${currentPlayer?.colorHex || '#22d3ee'}`,
                }}
              />
              <span className="text-xs font-black">Move Orb</span>
            </div>
            <span className="text-[9px] text-cyan-200/80 font-bold">Tap glowing cell</span>
          </button>

          {/* 2. Direct Horizontal Wall (━) Button & Drag Pad */}
          <button
            type="button"
            onPointerDown={(e) => handleSelectOrDragWallOrientation('H', e)}
            onClick={() => {
              setTrayOrientation('H');
              setPlacingWallMode(true);
            }}
            className={`h-12 rounded-xl border-2 px-2 flex flex-col items-center justify-center gap-1 select-none touch-none cursor-grab active:cursor-grabbing transition ${
              placingWallMode && trayOrientation === 'H'
                ? 'bg-cyan-500/25 border-cyan-300 text-white shadow-[0_0_16px_rgba(34,211,238,0.45)]'
                : 'bg-purple-950/75 hover:bg-purple-900/80 border-cyan-400/50 text-cyan-100'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-8 h-2 rounded-full inline-block"
                style={{
                  backgroundColor: currentPlayer?.colorHex || '#22d3ee',
                  boxShadow: `0 0 10px ${currentPlayer?.colorHex || '#22d3ee'}`,
                }}
              />
              <span className="text-[10px] font-black text-amber-300">
                ({currentPlayer?.wallsLeft ?? 0})
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wide">
              + Horizontal ━
            </span>
          </button>

          {/* 3. Direct Vertical Wall (┃) Button & Drag Pad */}
          <button
            type="button"
            onPointerDown={(e) => handleSelectOrDragWallOrientation('V', e)}
            onClick={() => {
              setTrayOrientation('V');
              setPlacingWallMode(true);
            }}
            className={`h-12 rounded-xl border-2 px-2 flex flex-col items-center justify-center gap-0.5 select-none touch-none cursor-grab active:cursor-grabbing transition ${
              placingWallMode && trayOrientation === 'V'
                ? 'bg-rose-500/25 border-rose-300 text-white shadow-[0_0_16px_rgba(244,63,94,0.45)]'
                : 'bg-purple-950/75 hover:bg-purple-900/80 border-rose-400/50 text-rose-100'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-4 rounded-full inline-block"
                style={{
                  backgroundColor: currentPlayer?.colorHex || '#f43f5e',
                  boxShadow: `0 0 10px ${currentPlayer?.colorHex || '#f43f5e'}`,
                }}
              />
              <span className="text-[10px] font-black uppercase tracking-wide">
                + Vertical ┃
              </span>
              <span className="text-[10px] font-black text-amber-300">
                ({currentPlayer?.wallsLeft ?? 0})
              </span>
            </div>
            <span className="text-[9px] text-purple-200/80 font-bold">Tap or Drag to grid</span>
          </button>
        </div>

        {/* ROW 2: COMPACT SINGLE-ROW TACTICAL POWERS & FAIR-START TOGGLE */}
        {(mode === 'campaign' || mode === 'vs_ai') ? (
          <div className="grid grid-cols-7 gap-1 bg-[#140726]/90 border border-purple-500/30 rounded-xl p-1">
            {[
              {
                id: 'hint',
                label: 'Hint',
                count: saveData.powerInventory.hint,
                icon: Lightbulb,
                onClick: handleUseHint,
                active: !!hintAction,
                color: 'text-amber-300',
              },
              {
                id: 'undo',
                label: 'Undo',
                count: saveData.powerInventory.undo,
                icon: Undo2,
                onClick: handleUseUndo,
                active: false,
                color: 'text-cyan-300',
              },
              {
                id: 'dash',
                label: 'Dash',
                count: saveData.powerInventory.dash,
                icon: Zap,
                onClick: handleUseDash,
                active: dashStepsRemaining > 0,
                color: 'text-yellow-300',
              },
              {
                id: 'ghost',
                label: 'Ghost',
                count: saveData.powerInventory.ghost,
                icon: Ghost,
                onClick: handleUseGhost,
                active: ghostActive,
                color: 'text-purple-300',
              },
              {
                id: 'hammer',
                label: 'Smash',
                count: saveData.powerInventory.hammer,
                icon: Hammer,
                onClick: handleUseHammer,
                active: hammerActive,
                color: 'text-rose-300',
              },
              {
                id: 'freeze',
                label: 'Freeze',
                count: saveData.powerInventory.freeze,
                icon: Snowflake,
                onClick: handleUseFreeze,
                active: false,
                color: 'text-sky-300',
              },
              {
                id: 'extraWalls',
                label: '+2W',
                count: saveData.powerInventory.extraWalls,
                icon: Plus,
                onClick: handleUseExtraWalls,
                active: false,
                color: 'text-emerald-300',
              },
            ].map((pw) => {
              const Icon = pw.icon;
              return (
                <button
                  key={pw.id}
                  type="button"
                  onClick={pw.onClick}
                  className={`py-1 px-1 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition ${
                    pw.active
                      ? 'bg-amber-500/25 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                      : 'bg-purple-950/70 hover:bg-purple-900/70 border-purple-500/25'
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    <Icon className={`w-3 h-3 ${pw.color}`} />
                    <span className="text-[9px] font-black text-amber-300">{pw.count}</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-200 leading-tight">
                    {pw.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : mode === 'online_friend' ? (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#140726]/95 border border-purple-500/35 text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  liveRoomDoc?.guestId ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="font-black text-white truncate">
                {!liveRoomDoc?.guestId
                  ? 'Waiting for friend to open link...'
                  : turnIndex === myLiveSeat
                  ? `🟢 Your Turn (${myLiveSeat === 0 ? 'Cyan Orb ↑' : 'Pink Orb ↑'})`
                  : `⏳ Friend's Turn (${myLiveSeat === 0 ? 'Pink Orb' : 'Cyan Orb'})`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-black text-[10px] flex items-center gap-1 cursor-pointer"
              >
                {copiedInviteLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedInviteLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-2 py-0.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-400/40 text-purple-100 font-black text-[10px] cursor-pointer"
              >
                Room
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-[#140726]/90 border border-purple-500/30 text-[11px] text-purple-200">
            <span>
              {mode === 'pass_4p'
                ? '⭐ 4P Star Race: Non-starters get +1 Wall'
                : '👥 2P Local: 2nd Mover gets +1 Wall & Equalizer'}
            </span>
            {mode === 'pass_2p' && (
              <button
                type="button"
                onClick={() => setEqualizerRuleEnabled((v) => !v)}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-black text-[10px] cursor-pointer"
              >
                ⚖️ Equalizer: {equalizerRuleEnabled ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        )}
      </footer>

      {/* LIVE FRIEND INVITE LINK & ROOM CODE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#17092e] border-2 border-cyan-400/55 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_0_50px_rgba(34,211,238,0.28)]">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-300" />
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                  Play With Friend Live
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-3 py-1 rounded-xl bg-purple-900 hover:bg-purple-800 text-xs font-black text-purple-100 cursor-pointer"
              >
                Close
              </button>
            </div>

            {liveRoomId && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#110522] border border-cyan-400/35 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                      Your Live Room Code
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        liveRoomDoc?.guestId
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      }`}
                    >
                      {liveRoomDoc?.guestId ? '🟢 Friend Connected' : '⏳ Waiting for Friend'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-2xl font-black tracking-widest text-white font-mono">
                      {liveRoomId}
                    </span>
                    <button
                      type="button"
                      onClick={() => createLiveFriendRoom(false)}
                      className="px-2.5 py-1 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/40 text-[11px] font-bold text-purple-200 cursor-pointer"
                    >
                      New Room
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRestartOrRematch(true)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-black cursor-pointer transition ${
                        sameSideFinish
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                          : 'bg-purple-950/60 border-purple-500/30 text-purple-300'
                      }`}
                    >
                      🏁 Same Finish (Top)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRestartOrRematch(false)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-black cursor-pointer transition ${
                        !sameSideFinish
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                          : 'bg-purple-950/60 border-purple-500/30 text-purple-300'
                      }`}
                    >
                      ⇅ Opposite (Auto-Flip)
                    </button>
                  </div>

                  <p className="text-[11px] text-purple-200/90 leading-relaxed">
                    {sameSideFinish ? (
                      <>
                        <strong>Same-Side Finish:</strong> Both you (<strong className="text-cyan-300">Cyan Orb</strong>) and your friend (<strong className="text-rose-300">Pink Orb</strong>) start at the bottom and race to the top <strong>🏁 FINISH</strong> line!
                      </>
                    ) : (
                      <>
                        <strong>Opposite Sides (Bottom-View on Both Screens):</strong> You start at the bottom on your screen, and your friend’s screen automatically rotates 180° so they also start at the bottom on their device!
                      </>
                    )}
                  </p>

                  <div className="flex items-center gap-1.5 bg-[#1b0b36] p-1.5 rounded-xl border border-purple-500/30">
                    <input
                      type="text"
                      readOnly
                      value={shareableInviteUrl}
                      className="w-full bg-transparent text-[11px] text-cyan-100 px-2 focus:outline-none select-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-black text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedInviteLink ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: 'Play Wrong Way Live with me!',
                            text: `Join my Wrong Way live room (${liveRoomId})!`,
                            url: shareableInviteUrl,
                          });
                        } catch {
                          // Ignore cancel
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Invite Link</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Join a Friend's Room by Code */}
            <div className="p-3.5 rounded-2xl bg-[#110522]/90 border border-purple-500/30 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-purple-300">
                Have a Friend’s Room Code?
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code (e.g. WW7K9P)"
                  maxLength={12}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#1b0b36] border border-purple-500/40 text-xs font-black tracking-wider text-white uppercase placeholder:text-purple-400/50 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => joinLiveFriendRoom(joinCodeInput)}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs cursor-pointer shrink-0"
                >
                  Join Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 60-LEVEL / 6-ZONE CAMPAIGN MODAL OVERLAY (Doesn't push board down!) */}
      {showLevelDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-3xl w-full max-h-[88dvh] overflow-y-auto bg-[#180a30] border border-purple-400/45 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
              <div>
                <h2 className="text-base sm:text-lg font-black text-cyan-300 uppercase">
                  60 Campaign Levels • 6 Neon Zones
                </h2>
                <p className="text-xs text-purple-300">
                  Total Stars: {totalCampaignStars}/180 • Clear a Zone to unlock Tactical Power Chests
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelDrawer(false)}
                className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-xs font-black text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
              {CAMPAIGN_ZONES.map((z) => {
                const isSelected = selectedZone === z.zone;
                return (
                  <button
                    key={z.zone}
                    type="button"
                    onClick={() => setSelectedZone(z.zone)}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-purple-600/35 border-cyan-400 text-white shadow-[0_0_14px_rgba(34,211,238,0.25)]'
                        : 'bg-purple-950/50 border-purple-500/25 text-purple-300 hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                      Zone {z.zone}
                    </div>
                    <div className="text-xs font-black truncate">{z.name}</div>
                  </button>
                );
              })}
            </div>

            {(() => {
              const zoneObj = CAMPAIGN_ZONES[selectedZone - 1];
              const zoneLevels = ALL_CAMPAIGN_LEVELS.filter((l) => l.zone === selectedZone);
              const zoneCompleted = zoneLevels.every(
                (l) => (saveData.starsByLevel[l.level] || 0) >= 1
              );
              const chestClaimed = saveData.claimedZoneChests.includes(selectedZone);

              return (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-purple-200 font-medium">{zoneObj.subtitle}</span>
                    {zoneCompleted && !chestClaimed && (
                      <button
                        type="button"
                        onClick={() => handleClaimZoneChest(selectedZone)}
                        className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 animate-pulse cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Claim Zone {selectedZone} Reward Chest!</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {zoneLevels.map((lvl) => {
                      const unlocked = lvl.level <= saveData.unlockedLevel;
                      const stars = saveData.starsByLevel[lvl.level] || 0;
                      const isCurrent = lvl.level === activeLevelNum;
                      return (
                        <button
                          key={lvl.level}
                          type="button"
                          disabled={!unlocked}
                          onClick={() => {
                            setActiveLevelNum(lvl.level);
                            setShowLevelDrawer(false);
                          }}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                            isCurrent
                              ? 'bg-cyan-500/30 border-cyan-300 text-white shadow-[0_0_12px_rgba(34,211,238,0.4)] cursor-pointer'
                              : unlocked
                              ? 'bg-purple-950/70 hover:bg-purple-900 border-purple-500/35 text-purple-100 cursor-pointer'
                              : 'bg-purple-950/25 border-purple-800/20 text-purple-600 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-0.5 text-xs font-black">
                            {!unlocked ? (
                              <Lock className="w-3 h-3" />
                            ) : lvl.isBoss ? (
                              <Flame className="w-3.5 h-3.5 text-rose-400" />
                            ) : null}
                            <span>{lvl.level}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-2.5 h-2.5 ${
                                  s <= stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-purple-800'
                                }`}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* VICTORY / MATCH RESULT MODAL */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#17092e] border-2 border-cyan-400/60 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_50px_rgba(34,211,238,0.3)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase">
                {mode === 'campaign' ? `Level ${activeLevelNum} Complete` : 'Match Complete'}
              </span>
              <h2 className="text-2xl font-black text-white mt-2">
                {isDrawResult ? 'Equalized Draw! (Shared Victory)' : `${winner.name} Wins!`}
              </h2>
              <p className="text-xs text-purple-200 mt-1">
                {isDrawResult
                  ? `Both orbs reached the finish line on turn ${moveCount} with equal walls left!`
                  : `Completed in ${moveCount} turns.`}
              </p>
            </div>

            {mode === 'campaign' && winner.id === 0 && (
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3].map((s) => {
                  const earned =
                    moveCount <= activeCampaignLevel.parMoves
                      ? 3
                      : moveCount <= activeCampaignLevel.parMoves + 5
                      ? 2
                      : 1;
                  return (
                    <Star
                      key={s}
                      className={`w-8 h-8 ${
                        s <= earned
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                          : 'text-purple-800'
                      }`}
                    />
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRestartOrRematch()}
                className="px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-400/40 text-xs font-black text-white cursor-pointer"
              >
                {mode === 'online_friend' ? 'Live Rematch' : 'Replay'}
              </button>
              {mode === 'campaign' && winner.id === 0 && activeLevelNum < 60 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextLvl = Math.min(60, activeLevelNum + 1);
                    setActiveLevelNum(nextLvl);
                    setSelectedZone(Math.floor((nextLvl - 1) / 10) + 1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>Next Level {activeLevelNum + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HOW TO PLAY & WINNING STRATEGY MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#17092e] border border-purple-400/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <h2 className="text-lg font-black text-cyan-300 uppercase tracking-wide">
                How to Play &amp; Win Wrong Way
              </h2>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="px-3 py-1 rounded-lg bg-purple-900 text-xs font-black text-purple-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-purple-100 leading-relaxed">
              <p>
                <strong className="text-cyan-300">1. The Goal:</strong> Your Cyan Orb starts at the bottom and races to the <strong>Top Row</strong>. The Pink Orb starts at the top and races to the <strong>Bottom Row</strong>.
              </p>
              <p>
                <strong className="text-rose-300">2. Move OR Drop Walls Directly (No Scrolling!):</strong>
                <br />• <strong>To Move:</strong> Tap any glowing cyan square next to your orb.
                <br />• <strong>To Drop a Horizontal (━) or Vertical (┃) Wall:</strong> Use the <strong>+ Horizontal ━</strong> and <strong>+ Vertical ┃</strong> buttons docked right below the board (tap or drag them onto the board), OR simply tap directly on any horizontal/vertical gap between squares on the board!
              </p>
              <p>
                <strong className="text-amber-300">3. Pro Strategy — How to Beat the First Mover:</strong>
                <br />• <strong>Watch the Path Dots:</strong> The cyan and pink dots on the board show each player’s shortest path.
                <br />• <strong>Connect Walls into L-Traps:</strong> Place a Horizontal wall right in front of your rival, then connect a Vertical wall beside it on the next turn to force a long detour.
                <br />• <strong>Use the Jump Rule:</strong> When standing face-to-face with your opponent, you can <strong>jump 2 squares straight over them</strong>!
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRulesModal(false);
                  startInteractiveTutorial();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-black text-xs cursor-pointer"
              >
                🎓 Start 3-Step Interactive Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WrongWayGame;
