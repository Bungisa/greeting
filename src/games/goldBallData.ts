// ELIMIKA GOLD BALL – THE ULTIMATE TRACKING CHALLENGE
// Enhanced with 9 Viral @spotquest & @sight.twist Instagram Reel Mechanics:
// 1. INSANE 3x3 GRID (9 Cups Wide-Gap 3x3 Grid) - Reel DfRJyp0Pir4 & DfcZtTayh_9
// 2. BRAIN BREAKER (12 Cups Wide-Gap 3x4 Grid, Zig-Zag Chevron Cups) - Reel DgIdJcEwjXV
// 3. ORBIT RING (8 Cups Circular Ring that Never Stops Spinning) - Reel DgJUbbThWMO
// 4. SPLIT BRAIN (Dual Arena: Track Top Gold Ball & Bottom Pink Ball at Once) - Reel DgJ68l6HJVw
// 5. MIND TRAP (10 Cups Circular Ring with Decoy Balls & Mid-Shuffle Feints) - Reel DfXezRcqEN9
// 6. 8 CUPS. ONE DIE. (8 Crimson Red Cups in Neon Oval Stadium + 3D Golden Die) - Reel DeU6nw4yeSM
// 7. MISSION IMPOSSIBLE (9 Emerald-Teal Cups in 8-Outer-Ring + 1-Center-Hub Wheel) - Reel Df0w2I2Ma2j
// 8. FOLLOW THE GOLD: FIGURE-8 INFINITY (12 Cups on Hourglass Infinity Loop Track) - Reel DfLSUkHvDeD
// 9. CHAOS MODE: 3-LEAF TREFOIL (12 Cups on 3-Petal Clover Orbital Track) - Reel DfpCaSfMD1v

import { loadPlayProgress, savePlayProgress } from './gameDataAndStorage';

export type PowerUpType = 'freeze' | 'slow_motion' | 'extra_vision' | 'second_chance';

export type ReelChallengeMode =
  | 'classic_3x3'          // 9 Cups (Wide-Gap 3x3 Grid) - Reel DfRJyp0Pir4 & DfcZtTayh_9
  | 'orbit_ring_8'         // 8 Cups (Wide Spinning Circular Orbit) - Reel DgJUbbThWMO
  | 'split_brain_2x3'      // 6 Cups (3 Top + 3 Bottom Dual Ball Tracking) - Reel DgJ68l6HJVw
  | 'mind_trap_ring_10'    // 10 Cups (Wide Circular Ring + Decoy Balls & Feints) - Reel DfXezRcqEN9
  | 'brain_breaker_12'     // 12 Cups (Wide-Gap 3x4 Grid) - Reel DgIdJcEwjXV
  | 'crimson_die_oval_8'   // 8 Crimson Cups (Vertical Stadium Oval + 3D Golden Die) - Reel DeU6nw4yeSM
  | 'mission_impossible_9' // 9 Emerald Cups (8 Outer Oval Ring + 1 Center Hub) - Reel Df0w2I2Ma2j
  | 'infinity_figure8_12'  // 12 Cups (Hourglass Figure-8 Infinity Track) - Reel DfLSUkHvDeD
  | 'chaos_trefoil_12';    // 12 Cups (3-Petal Clover Trefoil Track) - Reel DfpCaSfMD1v

export type CupPatternSkin =
  | 'specular_turquoise' // Glossy turquoise frustum with white top cap & glowing cyan-white bottom rim
  | 'zigzag_chevron'     // Double golden zig-zag chevron bands with white top cap
  | 'vertical_stripes'   // Crisp turquoise & white vertical stripes
  | 'collar_band'        // Metallic teal body with bold silver-white upper collar ring
  | 'crimson_gloss'      // Reel DeU6nw4yeSM: High-gloss ruby crimson cup with crimson-red top cap & specular sheen
  | 'emerald_mirror';    // Reel Df0w2I2Ma2j & DfpCaSfMD1v: Deep emerald-jade metallic body with bright white cap

export type TrackingTargetType = 'gold_ball' | 'golden_die';

export interface PowerUpDefinition {
  id: PowerUpType;
  name: string;
  shortLabel: string;
  description: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
}

export const GOLD_BALL_POWER_UPS: Record<PowerUpType, PowerUpDefinition> = {
  freeze: {
    id: 'freeze',
    name: 'FREEZE',
    shortLabel: 'Freeze Passing & Orbit',
    description: 'Temporarily stops all cups and orbital rotation mid-shuffle for 2.5 seconds so you can lock onto the target.',
    accentColor: '#38bdf8',
    borderColor: 'rgba(56, 189, 248, 0.45)',
    bgGradient: 'linear-gradient(135deg, rgba(12,74,110,0.85), rgba(7,89,133,0.65))',
  },
  slow_motion: {
    id: 'slow_motion',
    name: 'SLOW MOTION',
    shortLabel: '50% Passing Speed',
    description: 'Reduces cup passing and orbit rotation speed by 50% for the entire active round.',
    accentColor: '#2dd4bf',
    borderColor: 'rgba(45, 212, 191, 0.45)',
    bgGradient: 'linear-gradient(135deg, rgba(19,78,74,0.85), rgba(15,118,110,0.65))',
  },
  extra_vision: {
    id: 'extra_vision',
    name: 'EXTRA VISION',
    shortLabel: 'X-Ray Gold Pulse',
    description: 'Briefly reveals the hidden Gold Ball or Golden Die inside its cup with a translucent X-ray aura.',
    accentColor: '#fbbf24',
    borderColor: 'rgba(251, 191, 36, 0.5)',
    bgGradient: 'linear-gradient(135deg, rgba(120,53,15,0.85), rgba(146,64,14,0.65))',
  },
  second_chance: {
    id: 'second_chance',
    name: 'SECOND CHANCE',
    shortLabel: 'Wrong Pick Shield',
    description: 'Allows one additional cup selection after a wrong answer without losing a life.',
    accentColor: '#c084fc',
    borderColor: 'rgba(192, 132, 252, 0.45)',
    bgGradient: 'linear-gradient(135deg, rgba(88,28,135,0.85), rgba(107,33,168,0.65))',
  },
};

export type ShuffleComplexityMode =
  | 'single_adjacent'
  | 'single_any'
  | 'double_parallel'
  | 'double_crossing'
  | 'triple_sync'
  | 'vortex_rotation'
  | 'phantom_feint'
  | 'chaos_master';

export interface GoldBallLevelConfig {
  level: number;
  name: string;
  titleBadge: string;
  reelHeaderTitle: string;
  reelHeaderSubtitle: string;
  reelMode: ReelChallengeMode;
  targetType?: TrackingTargetType;
  cupCount: number;
  cupSkin: CupPatternSkin;
  cupTintHex: string;
  secondaryCupSkin?: CupPatternSkin;
  orbitSpeedRadPerSec: number;
  decoyBallsCount: number;
  hasMidShuffleFeints: boolean;
  themeName: string;
  themeDescription: string;
  environment: {
    bgTop: string;
    bgBottom: string;
    fogColor: string;
    tableBaseColor: string;
    tableRimColor: string;
    gridLineColor: string;
    keyLightColor: string;
    fillLightColor: string;
    rimLightColor: string;
    ambientColor: string;
    cardAccent: string;
  };
  roundsCount: number;
  observationTimeMs: number;
  shuffleSteps: number;
  stepDurationMs: number;
  simultaneousSwaps: number;
  complexityMode: ShuffleComplexityMode;
  complexityLabel: string;
  speedLabel: string;
  completionBonus: number;
  celebrationTitle: string;
  celebrationSubtitle: string;
  celebrationBadge: string;
}

export const GOLD_BALL_LEVELS: GoldBallLevelConfig[] = [
  {
    level: 1,
    name: 'Rookie',
    titleBadge: 'LEVEL 01',
    reelHeaderTitle: 'ROOKIE ARENA',
    reelHeaderSubtitle: 'NINE CUPS, ONE GOLD BALL',
    reelMode: 'classic_3x3',
    targetType: 'gold_ball',
    cupCount: 9,
    cupSkin: 'specular_turquoise',
    cupTintHex: '#14b8a6',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 0,
    hasMidShuffleFeints: false,
    themeName: 'Zanzibar Lagoon Wide 3×3 Grid',
    themeDescription: 'Nine classic specular turquoise 3D cups with wide visibility gaps and smooth two-lane passing.',
    environment: {
      bgTop: '#03161b',
      bgBottom: '#072a32',
      fogColor: '#041f26',
      tableBaseColor: '#05252d',
      tableRimColor: '#14b8a6',
      gridLineColor: '#2dd4bf',
      keyLightColor: '#fff7ed',
      fillLightColor: '#2dd4bf',
      rimLightColor: '#fbbf24',
      ambientColor: '#134e4a',
      cardAccent: '#2dd4bf',
    },
    roundsCount: 3,
    observationTimeMs: 2300,
    shuffleSteps: 6,
    stepDurationMs: 640,
    simultaneousSwaps: 1,
    complexityMode: 'single_adjacent',
    complexityLabel: 'Wide 3×3 Grid • Clear Two-Lane Passing',
    speedLabel: 'Gentle (1.6 passes/s)',
    completionBonus: 250,
    celebrationTitle: 'ROOKIE TRACKER CERTIFIED!',
    celebrationSubtitle: 'Your eyes locked onto the golden sphere as cups glided past each other in wide lanes.',
    celebrationBadge: 'Lagoon Spotter',
  },
  {
    level: 2,
    name: 'Beginner',
    titleBadge: 'LEVEL 02',
    reelHeaderTitle: '8 CUPS. ONE DIE.',
    reelHeaderSubtitle: 'TRACK THE DIE',
    reelMode: 'crimson_die_oval_8',
    targetType: 'golden_die',
    cupCount: 8,
    cupSkin: 'crimson_gloss',
    cupTintHex: '#dc2626',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 0,
    hasMidShuffleFeints: false,
    themeName: 'Sight Twist Crimson Stadium Oval (8 Cups + Die)',
    themeDescription: 'Inspired by Reel DeU6nw4yeSM: 8 glossy crimson cups in a neon stadium oval hiding a 3D Golden Die!',
    environment: {
      bgTop: '#030712',
      bgBottom: '#0a0f1f',
      fogColor: '#050814',
      tableBaseColor: '#070b19',
      tableRimColor: '#38bdf8',
      gridLineColor: '#818cf8',
      keyLightColor: '#fffbeb',
      fillLightColor: '#38bdf8',
      rimLightColor: '#f43f5e',
      ambientColor: '#1e1b4b',
      cardAccent: '#f43f5e',
    },
    roundsCount: 3,
    observationTimeMs: 2150,
    shuffleSteps: 8,
    stepDurationMs: 540,
    simultaneousSwaps: 1,
    complexityMode: 'double_parallel',
    complexityLabel: '8 Crimson Cups Oval • Track the 3D Golden Die',
    speedLabel: 'Steady (1.8 passes/s)',
    completionBonus: 350,
    celebrationTitle: 'GOLDEN DIE MASTERED!',
    celebrationSubtitle: 'You tracked the 3D Golden Die across every wide-lane crimson cup pass in the stadium oval.',
    celebrationBadge: 'Crimson Die Spotter',
  },
  {
    level: 3,
    name: 'Explorer',
    titleBadge: 'LEVEL 03',
    reelHeaderTitle: 'ORBIT',
    reelHeaderSubtitle: 'THE CUPS NEVER STOP SPINNING',
    reelMode: 'orbit_ring_8',
    targetType: 'gold_ball',
    cupCount: 8,
    cupSkin: 'collar_band',
    cupTintHex: '#14b8a6',
    orbitSpeedRadPerSec: 0.65,
    decoyBallsCount: 0,
    hasMidShuffleFeints: false,
    themeName: 'Kilimanjaro Wide Orbital Ring (8 Cups)',
    themeDescription: 'Inspired by Reel DgJUbbThWMO: 8 widely spaced cups revolve continuously while passing along wide arcs!',
    environment: {
      bgTop: '#041724',
      bgBottom: '#092a3e',
      fogColor: '#062030',
      tableBaseColor: '#072536',
      tableRimColor: '#06b6d4',
      gridLineColor: '#22d3ee',
      keyLightColor: '#fde68a',
      fillLightColor: '#06b6d4',
      rimLightColor: '#fbbf24',
      ambientColor: '#164e63',
      cardAccent: '#22d3ee',
    },
    roundsCount: 3,
    observationTimeMs: 1950,
    shuffleSteps: 9,
    stepDurationMs: 490,
    simultaneousSwaps: 2,
    complexityMode: 'double_crossing',
    complexityLabel: '8-Cup Continuous Spinning Orbit',
    speedLabel: 'Orbiting (2.0 passes/s)',
    completionBonus: 450,
    celebrationTitle: 'ORBITAL VISION UNLOCKED!',
    celebrationSubtitle: 'Even when the 8-cup ring never stopped spinning, you followed every wide passing arc.',
    celebrationBadge: 'Orbit Pathfinder',
  },
  {
    level: 4,
    name: 'Challenger',
    titleBadge: 'LEVEL 04',
    reelHeaderTitle: 'SPLIT BRAIN',
    reelHeaderSubtitle: 'TRACK BOTH BALLS AT ONCE',
    reelMode: 'split_brain_2x3',
    targetType: 'gold_ball',
    cupCount: 6,
    cupSkin: 'zigzag_chevron',
    secondaryCupSkin: 'vertical_stripes',
    cupTintHex: '#14b8a6',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 0,
    hasMidShuffleFeints: false,
    themeName: 'Dual-Cortex Wide Split Arena (Top & Bottom)',
    themeDescription: 'Inspired by Reel DgJ68l6HJVw: Track the Top Gold Ball AND Bottom Pink Ball simultaneously with wide lane separation!',
    environment: {
      bgTop: '#041d21',
      bgBottom: '#1f0924',
      fogColor: '#0a1f24',
      tableBaseColor: '#09272c',
      tableRimColor: '#f59e0b',
      gridLineColor: '#2dd4bf',
      keyLightColor: '#fef08a',
      fillLightColor: '#ec4899',
      rimLightColor: '#fbbf24',
      ambientColor: '#115e59',
      cardAccent: '#f472b6',
    },
    roundsCount: 3,
    observationTimeMs: 2100,
    shuffleSteps: 9,
    stepDurationMs: 465,
    simultaneousSwaps: 2,
    complexityMode: 'double_parallel',
    complexityLabel: 'Split Brain • Track 2 Balls Simultaneously',
    speedLabel: 'Dual Sync (2.1 passes/s)',
    completionBonus: 600,
    celebrationTitle: 'SPLIT-BRAIN MASTERY!',
    celebrationSubtitle: 'You tracked both the Top Gold Ball and the Bottom Pink Ball at the exact same time!',
    celebrationBadge: 'Dual-Cortex Genius',
  },
  {
    level: 5,
    name: 'Skilled',
    titleBadge: 'LEVEL 05',
    reelHeaderTitle: 'MISSION IMPOSSIBLE',
    reelHeaderSubtitle: 'CAN YOU ACTUALLY FIND THE BALL?',
    reelMode: 'mission_impossible_9',
    targetType: 'gold_ball',
    cupCount: 9,
    cupSkin: 'emerald_mirror',
    cupTintHex: '#10b981',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 0,
    hasMidShuffleFeints: false,
    themeName: 'Sight Twist Emerald Hub & Wheel (9 Cups)',
    themeDescription: 'Inspired by Reel Df0w2I2Ma2j: 8 outer oval ring cups + 1 center hub cup with wide passing lanes & mirror reflections!',
    environment: {
      bgTop: '#01110e',
      bgBottom: '#03221c',
      fogColor: '#021713',
      tableBaseColor: '#021a16',
      tableRimColor: '#10b981',
      gridLineColor: '#34d399',
      keyLightColor: '#ffffff',
      fillLightColor: '#10b981',
      rimLightColor: '#fbbf24',
      ambientColor: '#064e3b',
      cardAccent: '#10b981',
    },
    roundsCount: 3,
    observationTimeMs: 1900,
    shuffleSteps: 11,
    stepDurationMs: 420,
    simultaneousSwaps: 2,
    complexityMode: 'vortex_rotation',
    complexityLabel: '8-Outer + 1-Center Wheel • Hub-and-Spoke Passing',
    speedLabel: 'Tactical (2.4 passes/s)',
    completionBonus: 750,
    celebrationTitle: 'MISSION IMPOSSIBLE ACCOMPLISHED!',
    celebrationSubtitle: 'You tracked the gold ball through every center-hub and perimeter ring pass!',
    celebrationBadge: 'Impossible Agent',
  },
  {
    level: 6,
    name: 'Advanced',
    titleBadge: 'LEVEL 06',
    reelHeaderTitle: 'MIND TRAP',
    reelHeaderSubtitle: 'FOLLOW GOLD, TRUST NOTHING',
    reelMode: 'mind_trap_ring_10',
    targetType: 'gold_ball',
    cupCount: 10,
    cupSkin: 'collar_band',
    cupTintHex: '#0ea5e9',
    orbitSpeedRadPerSec: 0.45,
    decoyBallsCount: 2,
    hasMidShuffleFeints: true,
    themeName: 'Manyara Wide Mind-Trap Ring (10 Cups)',
    themeDescription: 'Inspired by Reel DfXezRcqEN9: 10 widely spaced cups in a ring with decoy balls and mid-pass feints!',
    environment: {
      bgTop: '#041524',
      bgBottom: '#09263e',
      fogColor: '#061d30',
      tableBaseColor: '#072236',
      tableRimColor: '#38bdf8',
      gridLineColor: '#2dd4bf',
      keyLightColor: '#fffbeb',
      fillLightColor: '#38bdf8',
      rimLightColor: '#facc15',
      ambientColor: '#0c4a6e',
      cardAccent: '#38bdf8',
    },
    roundsCount: 3,
    observationTimeMs: 1750,
    shuffleSteps: 12,
    stepDurationMs: 385,
    simultaneousSwaps: 2,
    complexityMode: 'phantom_feint',
    complexityLabel: '10-Cup Wide Ring • Decoy Balls & Fake-Out Passes',
    speedLabel: 'Deceptive (2.6 passes/s)',
    completionBonus: 950,
    celebrationTitle: 'MIND TRAP DEFEATED!',
    celebrationSubtitle: 'You ignored every decoy ball and mid-pass fake-out to find the true Gold Ball.',
    celebrationBadge: 'Illusion Breaker',
  },
  {
    level: 7,
    name: 'Expert',
    titleBadge: 'LEVEL 07',
    reelHeaderTitle: 'FOLLOW THE GOLD',
    reelHeaderSubtitle: 'FIGURE-8 INFINITY TRACK',
    reelMode: 'infinity_figure8_12',
    targetType: 'gold_ball',
    cupCount: 12,
    cupSkin: 'specular_turquoise',
    cupTintHex: '#14b8a6',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 0,
    hasMidShuffleFeints: false,
    themeName: 'Sight Twist Hourglass Figure-8 Track (12 Cups)',
    themeDescription: 'Inspired by Reel DfLSUkHvDeD: 12 cups spaced along an hourglass Figure-8 infinity track, passing cleanly along loops!',
    environment: {
      bgTop: '#020b10',
      bgBottom: '#051c24',
      fogColor: '#031319',
      tableBaseColor: '#03161d',
      tableRimColor: '#2dd4bf',
      gridLineColor: '#5eead4',
      keyLightColor: '#fff7ed',
      fillLightColor: '#2dd4bf',
      rimLightColor: '#fbbf24',
      ambientColor: '#0f4c5c',
      cardAccent: '#2dd4bf',
    },
    roundsCount: 3,
    observationTimeMs: 1550,
    shuffleSteps: 14,
    stepDurationMs: 345,
    simultaneousSwaps: 2,
    complexityMode: 'vortex_rotation',
    complexityLabel: '12-Cup Figure-8 Infinity Loop • Stream & Lane Passing',
    speedLabel: 'Blazing (2.9 passes/s)',
    completionBonus: 1200,
    celebrationTitle: 'FIGURE-8 INFINITY CONQUERED!',
    celebrationSubtitle: 'Your eyes glided effortlessly across the top and bottom loops of the Figure-8 track!',
    celebrationBadge: 'Infinity Seer',
  },
  {
    level: 8,
    name: 'Master',
    titleBadge: 'LEVEL 08',
    reelHeaderTitle: 'BRAIN BREAKER',
    reelHeaderSubtitle: 'TWELVE CUPS, ONE GOLD BALL',
    reelMode: 'brain_breaker_12',
    targetType: 'gold_ball',
    cupCount: 12,
    cupSkin: 'zigzag_chevron',
    cupTintHex: '#14b8a6',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 1,
    hasMidShuffleFeints: false,
    themeName: 'Ngorongoro Wide 12-Cup Brain Breaker (3×4)',
    themeDescription: 'Inspired by Reel DgIdJcEwjXV: 12 widely spaced chevron cups in a 3×4 grid with wide passing lanes!',
    environment: {
      bgTop: '#090d24',
      bgBottom: '#06262e',
      fogColor: '#071a26',
      tableBaseColor: '#072129',
      tableRimColor: '#fb923c',
      gridLineColor: '#14b8a6',
      keyLightColor: '#ffedd5',
      fillLightColor: '#2dd4bf',
      rimLightColor: '#fb923c',
      ambientColor: '#134e4a',
      cardAccent: '#fb923c',
    },
    roundsCount: 3,
    observationTimeMs: 1350,
    shuffleSteps: 16,
    stepDurationMs: 305,
    simultaneousSwaps: 2,
    complexityMode: 'triple_sync',
    complexityLabel: 'Wide 3×4 Grid (12 Cups) • Multi-Lane Passing',
    speedLabel: 'Supersonic (3.3 passes/s)',
    completionBonus: 1500,
    celebrationTitle: 'BRAIN BREAKER SURVIVED!',
    celebrationSubtitle: 'Twelve widely spaced cups passing across 4 rows could not hide the golden sphere from you.',
    celebrationBadge: '12-Cup Grandmaster',
  },
  {
    level: 9,
    name: 'Legendary',
    titleBadge: 'LEVEL 09',
    reelHeaderTitle: 'CHAOS MODE',
    reelHeaderSubtitle: 'HOW MANY ROUNDS DID IT TAKE YOU?',
    reelMode: 'chaos_trefoil_12',
    targetType: 'gold_ball',
    cupCount: 12,
    cupSkin: 'emerald_mirror',
    cupTintHex: '#10b981',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 1,
    hasMidShuffleFeints: true,
    themeName: 'Sight Twist 3-Petal Clover Trefoil Arena (12 Cups)',
    themeDescription: 'Inspired by Reel DfpCaSfMD1v: 12 emerald cups arranged along a 3-petal clover orbital track with rapid lobe rotations and passes!',
    environment: {
      bgTop: '#010d0b',
      bgBottom: '#031f1a',
      fogColor: '#021411',
      tableBaseColor: '#021713',
      tableRimColor: '#34d399',
      gridLineColor: '#10b981',
      keyLightColor: '#fef08a',
      fillLightColor: '#10b981',
      rimLightColor: '#eab308',
      ambientColor: '#064e3b',
      cardAccent: '#34d399',
    },
    roundsCount: 3,
    observationTimeMs: 1150,
    shuffleSteps: 19,
    stepDurationMs: 265,
    simultaneousSwaps: 2,
    complexityMode: 'chaos_master',
    complexityLabel: '12-Cup 3-Petal Trefoil Track • Lobe Stream Passing',
    speedLabel: 'Lightning (3.8 passes/s)',
    completionBonus: 2000,
    celebrationTitle: 'CHAOS TREFOIL LEGEND!',
    celebrationSubtitle: 'You mastered the 3-petal clover orbital track without losing sight of the gold!',
    celebrationBadge: 'Chaos Trefoil Legend',
  },
  {
    level: 10,
    name: 'Insane',
    titleBadge: 'LEVEL 10',
    reelHeaderTitle: 'INSANE MODE',
    reelHeaderSubtitle: 'BET YOU LOSE IT HALFWAY',
    reelMode: 'classic_3x3',
    targetType: 'gold_ball',
    cupCount: 9,
    cupSkin: 'specular_turquoise',
    cupTintHex: '#14b8a6',
    orbitSpeedRadPerSec: 0,
    decoyBallsCount: 1,
    hasMidShuffleFeints: true,
    themeName: 'Quantum Teal 3×3 Singularity Arena (9 Cups)',
    themeDescription: 'Inspired by Reel DfcZtTayh_9 & DfRJyp0Pir4: Wide-spaced 3×3 grid with high-speed two-lane passes, 8-cup perimeter ring spins, and snake trains!',
    environment: {
      bgTop: '#010d11',
      bgBottom: '#041f27',
      fogColor: '#02151a',
      tableBaseColor: '#031a21',
      tableRimColor: '#f43f5e',
      gridLineColor: '#2dd4bf',
      keyLightColor: '#ffffff',
      fillLightColor: '#2dd4bf',
      rimLightColor: '#fbbf24',
      ambientColor: '#0d3b44',
      cardAccent: '#f43f5e',
    },
    roundsCount: 3,
    observationTimeMs: 950,
    shuffleSteps: 24,
    stepDurationMs: 225,
    simultaneousSwaps: 2,
    complexityMode: 'chaos_master',
    complexityLabel: 'Wide 3×3 Blitz • Perimeter Ring Spins + Two-Lane Passes',
    speedLabel: 'INSANE (4.4 passes/s)',
    completionBonus: 3000,
    celebrationTitle: 'ULTIMATE ELIMIKA GOLD BALL CHAMPION!',
    celebrationSubtitle: 'You have conquered all 10 levels including INSANE MODE with superhuman visual tracking!',
    celebrationBadge: 'Immortal Gold Champion',
  },
];

// All 9 Viral Instagram Reel Presets (@spotquest + @sight.twist) for instant 1-tap play
export const SPOTQUEST_REEL_PRESETS: Array<{
  id: ReelChallengeMode;
  reelCode: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  defaultLevel: number;
  accentColor: string;
}> = [
  {
    id: 'classic_3x3',
    reelCode: 'DfcZtTayh_9',
    title: 'INSANE 3×3 GRID',
    subtitle: 'FOLLOW THE GOLD BALL',
    badge: '9 CUPS • WIDE 3×3',
    description: 'Wide-spaced 3×3 grid with clear two-lane passing, 8-cup outer ring spins, and snake trains.',
    defaultLevel: 1,
    accentColor: '#2dd4bf',
  },
  {
    id: 'crimson_die_oval_8',
    reelCode: 'DeU6nw4yeSM',
    title: '8 CUPS. ONE DIE.',
    subtitle: 'TRACK THE DIE',
    badge: '8 CRIMSON CUPS • 3D DIE',
    description: '8 glossy crimson-red 3D cups in a neon stadium oval track hiding a rotating 3D Golden Die!',
    defaultLevel: 2,
    accentColor: '#f43f5e',
  },
  {
    id: 'mission_impossible_9',
    reelCode: 'Df0w2I2Ma2j',
    title: 'MISSION IMPOSSIBLE',
    subtitle: '8-RING + CENTER HUB',
    badge: '9 EMERALD CUPS • WHEEL',
    description: '8 emerald cups in a wide outer oval ring around 1 central hub cup with spoke-and-rim passing lanes.',
    defaultLevel: 5,
    accentColor: '#10b981',
  },
  {
    id: 'infinity_figure8_12',
    reelCode: 'DfLSUkHvDeD',
    title: 'FOLLOW THE GOLD (∞)',
    subtitle: 'FIGURE-8 INFINITY LOOP',
    badge: '12 CUPS • FIGURE-8',
    description: '12 turquoise cups spaced along a glowing hourglass Figure-8 track with smooth loop & crossing passes.',
    defaultLevel: 7,
    accentColor: '#38bdf8',
  },
  {
    id: 'chaos_trefoil_12',
    reelCode: 'DfpCaSfMD1v',
    title: 'CHAOS MODE (CLOVER)',
    subtitle: '3-PETAL TREFOIL TRACK',
    badge: '12 CUPS • 3-LOBE TRACK',
    description: '12 emerald-mirror cups arranged on a 3-leaf clover orbital track with petal-stream rotations and lane passes.',
    defaultLevel: 9,
    accentColor: '#34d399',
  },
  {
    id: 'brain_breaker_12',
    reelCode: 'DgIdJcEwjXV',
    title: 'BRAIN BREAKER',
    subtitle: 'TWELVE CUPS, ONE GOLD BALL',
    badge: '12 CUPS • WIDE 3×4',
    description: 'Wide-spaced 3×4 grid of 12 chevron-patterned cups where pairs pass cleanly in separate lanes.',
    defaultLevel: 8,
    accentColor: '#fb923c',
  },
  {
    id: 'orbit_ring_8',
    reelCode: 'DgJUbbThWMO',
    title: 'ORBIT RING',
    subtitle: 'THE CUPS NEVER STOP SPINNING',
    badge: '8 CUPS • SPINNING',
    description: '8 widely spaced cups in a circular ring that continuously orbits while cups pass along wide curved lanes.',
    defaultLevel: 3,
    accentColor: '#22d3ee',
  },
  {
    id: 'split_brain_2x3',
    reelCode: 'DgJ68l6HJVw',
    title: 'SPLIT BRAIN',
    subtitle: 'TRACK BOTH BALLS AT ONCE',
    badge: '2 BALLS • TOP & BOTTOM',
    description: 'Track the Top Gold Ball and Bottom Pink Ball simultaneously across two widely spaced rows!',
    defaultLevel: 4,
    accentColor: '#f472b6',
  },
  {
    id: 'mind_trap_ring_10',
    reelCode: 'DfXezRcqEN9',
    title: 'MIND TRAP',
    subtitle: 'FOLLOW GOLD, TRUST NOTHING',
    badge: '10 CUPS • DECOYS',
    description: '10 widely spaced cups in a circular ring with decoy distraction balls and mid-pass fake-outs.',
    defaultLevel: 6,
    accentColor: '#facc15',
  },
];

export interface GoldBallProgressState {
  highestUnlockedLevel: number;
  completedLevels: number[];
  bestScorePerLevel: Record<number, number>;
  bestStarsPerLevel: Record<number, number>;
  totalScore: number;
  bestSingleLevelScore: number;
  powerUps: Record<PowerUpType, number>;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  lastPlayedLevel: number;
}

const STORAGE_KEY = 'elimika_gold_ball_progress_v1';

export const DEFAULT_GOLD_BALL_PROGRESS: GoldBallProgressState = {
  highestUnlockedLevel: 1,
  completedLevels: [],
  bestScorePerLevel: {},
  bestStarsPerLevel: {},
  totalScore: 0,
  bestSingleLevelScore: 0,
  powerUps: {
    freeze: 3,
    slow_motion: 3,
    extra_vision: 2,
    second_chance: 2,
  },
  soundEnabled: true,
  vibrationEnabled: true,
  lastPlayedLevel: 1,
};

export function loadGoldBallProgress(): GoldBallProgressState {
  if (typeof window === 'undefined') return { ...DEFAULT_GOLD_BALL_PROGRESS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GOLD_BALL_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<GoldBallProgressState>;

    const completed = Array.isArray(parsed.completedLevels)
      ? parsed.completedLevels.filter((n) => typeof n === 'number' && n >= 1 && n <= 10)
      : [];
    let validHighest = 1;
    for (let lvl = 1; lvl <= 9; lvl++) {
      if (completed.includes(lvl)) {
        validHighest = lvl + 1;
      } else {
        break;
      }
    }

    return {
      highestUnlockedLevel: validHighest,
      completedLevels: Array.from(new Set(completed)).sort((a, b) => a - b),
      bestScorePerLevel: parsed.bestScorePerLevel && typeof parsed.bestScorePerLevel === 'object' ? parsed.bestScorePerLevel : {},
      bestStarsPerLevel: parsed.bestStarsPerLevel && typeof parsed.bestStarsPerLevel === 'object' ? parsed.bestStarsPerLevel : {},
      totalScore: typeof parsed.totalScore === 'number' && parsed.totalScore >= 0 ? parsed.totalScore : 0,
      bestSingleLevelScore:
        typeof parsed.bestSingleLevelScore === 'number' && parsed.bestSingleLevelScore >= 0 ? parsed.bestSingleLevelScore : 0,
      powerUps: {
        freeze: typeof parsed.powerUps?.freeze === 'number' ? Math.max(0, parsed.powerUps.freeze) : 3,
        slow_motion: typeof parsed.powerUps?.slow_motion === 'number' ? Math.max(0, parsed.powerUps.slow_motion) : 3,
        extra_vision: typeof parsed.powerUps?.extra_vision === 'number' ? Math.max(0, parsed.powerUps.extra_vision) : 2,
        second_chance: typeof parsed.powerUps?.second_chance === 'number' ? Math.max(0, parsed.powerUps.second_chance) : 2,
      },
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      vibrationEnabled: typeof parsed.vibrationEnabled === 'boolean' ? parsed.vibrationEnabled : true,
      lastPlayedLevel:
        typeof parsed.lastPlayedLevel === 'number' && parsed.lastPlayedLevel >= 1 && parsed.lastPlayedLevel <= validHighest
          ? parsed.lastPlayedLevel
          : validHighest,
    };
  } catch {
    return { ...DEFAULT_GOLD_BALL_PROGRESS };
  }
}

export function saveGoldBallProgress(state: GoldBallProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota warnings on constrained devices
  }
}

export function recordGoldBallLevelVictory(
  currentState: GoldBallProgressState,
  levelNumber: number,
  levelScore: number,
  starsEarned: 1 | 2 | 3
): {
  updatedState: GoldBallProgressState;
  newlyUnlockedLevel: number | null;
  rewardedPowerUp: PowerUpType | null;
} {
  const completedSet = new Set(currentState.completedLevels);
  const wasAlreadyCompleted = completedSet.has(levelNumber);
  completedSet.add(levelNumber);

  let highestUnlocked = 1;
  for (let lvl = 1; lvl <= 9; lvl++) {
    if (completedSet.has(lvl)) {
      highestUnlocked = lvl + 1;
    } else {
      break;
    }
  }

  const newlyUnlockedLevel =
    highestUnlocked > currentState.highestUnlockedLevel ? highestUnlocked : null;

  const prevBestScore = currentState.bestScorePerLevel[levelNumber] || 0;
  const newBestScoreForLevel = Math.max(prevBestScore, levelScore);

  const prevBestStars = currentState.bestStarsPerLevel[levelNumber] || 0;
  const newBestStarsForLevel = Math.max(prevBestStars, starsEarned);

  const updatedBestScores = {
    ...currentState.bestScorePerLevel,
    [levelNumber]: newBestScoreForLevel,
  };

  const sumOfLevelBests = Object.values(updatedBestScores).reduce((sum, val) => sum + val, 0);
  const updatedTotalScore = Math.max(currentState.totalScore + Math.round(levelScore * 0.35), sumOfLevelBests);

  let rewardedPowerUp: PowerUpType | null = null;
  const updatedPowerUps = { ...currentState.powerUps };
  if (!wasAlreadyCompleted || (starsEarned === 3 && prevBestStars < 3)) {
    const cycle: PowerUpType[] = ['freeze', 'slow_motion', 'extra_vision', 'second_chance'];
    rewardedPowerUp = cycle[(levelNumber - 1) % cycle.length];
    updatedPowerUps[rewardedPowerUp] = Math.min(9, (updatedPowerUps[rewardedPowerUp] || 0) + 1);
  }

  const updatedState: GoldBallProgressState = {
    ...currentState,
    highestUnlockedLevel: highestUnlocked,
    completedLevels: Array.from(completedSet).sort((a, b) => a - b),
    bestScorePerLevel: updatedBestScores,
    bestStarsPerLevel: {
      ...currentState.bestStarsPerLevel,
      [levelNumber]: newBestStarsForLevel,
    },
    totalScore: updatedTotalScore,
    bestSingleLevelScore: Math.max(currentState.bestSingleLevelScore, levelScore),
    powerUps: updatedPowerUps,
    lastPlayedLevel: Math.min(10, levelNumber + 1),
  };

  saveGoldBallProgress(updatedState);

  try {
    const globalProgress = loadPlayProgress();
    const xpGain = Math.max(40, Math.round(levelScore / 10));
    globalProgress.totalXp = (globalProgress.totalXp || 0) + xpGain;
    const badgeName = `Gold Ball: ${GOLD_BALL_LEVELS[levelNumber - 1]?.name || `Level ${levelNumber}`}`;
    if (!globalProgress.unlockedBadges.includes(badgeName)) {
      globalProgress.unlockedBadges.push(badgeName);
    }
    savePlayProgress(globalProgress);
  } catch {
    // Ignore global sync errors
  }

  return {
    updatedState,
    newlyUnlockedLevel,
    rewardedPowerUp,
  };
}

export function calculateStarRating(livesRemaining: number, levelScore: number, completionBonus: number): 1 | 2 | 3 {
  if (livesRemaining >= 3 && levelScore >= completionBonus + 300) {
    return 3;
  }
  if (livesRemaining >= 2) {
    return 2;
  }
  return 1;
}

class GoldBallAudioHaptics {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public vibrate(pattern: number | number[], enabled: boolean): void {
    if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    try {
      navigator.vibrate(pattern);
    } catch {}
  }

  public playCountdownTick(finalGo: boolean, soundEnabled: boolean, vibrationEnabled: boolean): void {
    this.vibrate(finalGo ? [25, 30, 40] : 18, vibrationEnabled);
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(finalGo ? 960 : 640, now);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  public playCupSwoosh(speedFactor = 1, soundEnabled = true): void {
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const dur = Math.max(0.11, Math.min(0.28, 0.24 / Math.max(0.6, speedFactor * 0.45)));

      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(900, now);
      bandpass.frequency.exponentialRampToValueAtTime(1650, now + dur * 0.5);
      bandpass.frequency.exponentialRampToValueAtTime(780, now + dur);
      bandpass.Q.setValueAtTime(1.6, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + dur * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      whiteNoise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + dur + 0.01);
    } catch {}
  }

  public playSelectionClockTick(soundEnabled: boolean): void {
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  public playCupLift(soundEnabled: boolean): void {
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.14);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } catch {}
  }

  public playCorrectReveal(soundEnabled: boolean, vibrationEnabled: boolean): void {
    this.vibrate([30, 40, 70], vibrationEnabled);
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      const now = ctx.currentTime;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.085, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.66);
      });
    } catch {}
  }

  public playWrongSelection(soundEnabled: boolean, vibrationEnabled: boolean): void {
    this.vibrate([90, 50, 110], vibrationEnabled);
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(135, now + 0.26);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playPowerUpActivate(type: PowerUpType, soundEnabled: boolean, vibrationEnabled: boolean): void {
    this.vibrate([20, 25, 45], vibrationEnabled);
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs =
        type === 'freeze'
          ? [784, 1046.5, 1318.5]
          : type === 'slow_motion'
          ? [659.25, 523.25, 392]
          : type === 'extra_vision'
          ? [523.25, 783.99, 1046.5, 1567.98]
          : [440, 659.25, 880];
      freqs.forEach((freq, idx) => {
        const start = now + idx * 0.055;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.23);
      });
    } catch {}
  }

  public playVictoryFanfare(soundEnabled: boolean, vibrationEnabled: boolean): void {
    this.vibrate([40, 50, 40, 50, 120], vibrationEnabled);
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      chord.forEach((freq, idx) => {
        const start = ctx.currentTime + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.13, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.46);
      });
    } catch {}
  }

  public playDefeatSound(soundEnabled: boolean, vibrationEnabled: boolean): void {
    this.vibrate([140, 60, 180], vibrationEnabled);
    if (!soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [330, 293.66, 261.63, 196];
      notes.forEach((freq, idx) => {
        const start = ctx.currentTime + idx * 0.11;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.31);
      });
    } catch {}
  }
}

export const goldBallFX = new GoldBallAudioHaptics();
