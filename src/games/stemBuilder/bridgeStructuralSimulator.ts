import { BRIDGE_COMPONENT_CATALOG } from './stemBuilderCurriculum';
import {
  BridgeComponentType,
  BridgeMissionConfig,
  BridgeSimulationResult,
  BridgeSnapNode,
  PlacedBridgePiece,
  StemDifficulty,
} from './stemBuilderTypes';

export const SCORING_WEIGHTS = {
  STRUCTURAL_MAX: 40,
  MATH_MAX: 25,
  BUDGET_MAX: 20,
  OBJECTIVES_MAX: 15,
} as const;

export function getDifficultyLoadAndBudget(
  mission: BridgeMissionConfig,
  difficulty: StemDifficulty
): { effectiveLoadKn: number; effectiveBudget: number; timeLimitSeconds: number | null } {
  switch (difficulty) {
    case 'Easy':
      return {
        effectiveLoadKn: Math.round(mission.vehicleLoadKn * 0.7),
        effectiveBudget: Math.round(mission.baseBudget * 1.65),
        timeLimitSeconds: null,
      };
    case 'Medium':
      return {
        effectiveLoadKn: Math.round(mission.vehicleLoadKn * 0.85),
        effectiveBudget: Math.round(mission.baseBudget * 1.45),
        timeLimitSeconds: null,
      };
    case 'Hard':
      return {
        effectiveLoadKn: mission.vehicleLoadKn,
        effectiveBudget: Math.round(mission.baseBudget * 1.25),
        timeLimitSeconds: 300,
      };
    case 'Exam Challenge':
      return {
        effectiveLoadKn: Math.round(mission.vehicleLoadKn * 1.1),
        effectiveBudget: Math.round(mission.baseBudget * 1.15),
        timeLimitSeconds: 240,
      };
  }
}

export function calculateNodeGeometry(
  nodeA: BridgeSnapNode,
  nodeB: BridgeSnapNode,
  type: BridgeComponentType
): { lengthMeters: number; angleDeg: number; cost: number } {
  const dx = nodeB.x - nodeA.x;
  const dy = nodeB.y - nodeA.y;
  const lengthMeters = Number(Math.hypot(dx, dy).toFixed(2));
  const angleDeg = Number(((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1));
  const spec = BRIDGE_COMPONENT_CATALOG[type];
  const cost = Math.round(lengthMeters * spec.unitCostPerMeter);
  return { lengthMeters, angleDeg, cost };
}

/**
 * Smart, forgiving component placement:
 * Automatically adapts the component type if the player connects deck nodes (auto Road Deck)
 * or riverbed nodes (auto Concrete Pillar) or truss nodes (auto Truss Strut), so players
 * never get stuck fighting strict tool rules!
 */
export function validateComponentPlacement(
  mission: BridgeMissionConfig,
  existingPieces: PlacedBridgePiece[],
  requestedType: BridgeComponentType,
  startNodeId: string,
  endNodeId: string
): { valid: boolean; reason?: string; piece?: PlacedBridgePiece } {
  if (startNodeId === endNodeId) {
    return { valid: false, reason: 'Tap a second node to connect your bridge piece!' };
  }

  const nodeA = mission.nodes.find((n) => n.id === startNodeId);
  const nodeB = mission.nodes.find((n) => n.id === endNodeId);
  if (!nodeA || !nodeB) {
    return { valid: false, reason: 'Invalid snap node selected.' };
  }

  // Prevent duplicate component between the same pair of nodes
  const duplicate = existingPieces.some(
    (p) =>
      (p.startNodeId === startNodeId && p.endNodeId === endNodeId) ||
      (p.startNodeId === endNodeId && p.endNodeId === startNodeId)
  );
  if (duplicate) {
    return {
      valid: false,
      reason: 'Already connected! Tap a piece in Delete mode if you want to remove it.',
    };
  }

  // Smart Auto-Type Selection so building is effortless and frustration-free
  let effectiveType: BridgeComponentType = requestedType;
  const bothOnDeck = nodeA.y === 0 && nodeB.y === 0;
  const touchesRiverbed = nodeA.role === 'riverbed_base' || nodeB.role === 'riverbed_base';
  const touchesTruss = nodeA.role === 'truss_top' || nodeB.role === 'truss_top';

  if (bothOnDeck) {
    effectiveType = 'road_deck';
  } else if (touchesRiverbed) {
    effectiveType = 'concrete_pillar';
  } else if (touchesTruss && (requestedType === 'road_deck' || requestedType === 'concrete_pillar')) {
    effectiveType = 'truss_strut';
  }

  const { lengthMeters, angleDeg, cost } = calculateNodeGeometry(nodeA, nodeB, effectiveType);
  const spec = BRIDGE_COMPONENT_CATALOG[effectiveType];

  // Very generous span allowance (+6m buffer) so players can connect nodes freely
  if (lengthMeters > spec.maxSpanMeters + 6.5) {
    return {
      valid: false,
      reason: `That jump (${lengthMeters}m) is super wide! Connect to the middle node first, or use the 1-Tap Quick-Build buttons!`,
    };
  }

  return {
    valid: true,
    piece: {
      id: `piece-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: effectiveType,
      startNodeId,
      endNodeId,
      lengthMeters,
      angleDeg,
      cost,
      stressRatio: 0.25,
      status: 'ok',
    },
  };
}

/**
 * Forgiving, fun educational structural simulation model.
 * Any continuous road deck from L0 to R0 with at least 1 support piece PASSES!
 * Extra pillars, truss triangles, budget savings, and the Turbo Quiz award up to 3 Stars (100 pts).
 */
export function evaluateBridgeDesign(
  mission: BridgeMissionConfig,
  pieces: PlacedBridgePiece[],
  difficulty: StemDifficulty,
  mathAnswerCorrect: boolean
): BridgeSimulationResult {
  const { effectiveLoadKn, effectiveBudget } = getDifficultyLoadAndBudget(mission, difficulty);
  const totalCost = pieces.reduce((acc, p) => acc + p.cost, 0);

  // 1. Check continuous Road Deck along mission.requiredDeckNodeOrder (or any path along y=0 from L0 to R0)
  const deckOrder = mission.requiredDeckNodeOrder;
  const missingDeckSegments: string[] = [];
  for (let i = 0; i < deckOrder.length - 1; i++) {
    const a = deckOrder[i];
    const b = deckOrder[i + 1];
    const hasDeck = pieces.some(
      (p) =>
        p.type === 'road_deck' &&
        ((p.startNodeId === a && p.endNodeId === b) || (p.startNodeId === b && p.endNodeId === a))
    );
    if (!hasDeck) {
      missingDeckSegments.push(`${a} → ${b}`);
    }
  }
  const connectedRoadDeck = missingDeckSegments.length === 0;

  // 2. Build adjacency graph to detect disconnected pieces
  const adjacency = new Map<string, string[]>();
  mission.nodes.forEach((n) => adjacency.set(n.id, []));
  pieces.forEach((p) => {
    adjacency.get(p.startNodeId)?.push(p.endNodeId);
    adjacency.get(p.endNodeId)?.push(p.startNodeId);
  });

  const groundedNodes = new Set<string>();
  const queue: string[] = [];
  mission.nodes
    .filter((n) => n.role === 'bank_anchor' || n.role === 'riverbed_base')
    .forEach((n) => {
      groundedNodes.add(n.id);
      queue.push(n.id);
    });

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const next of adjacency.get(curr) || []) {
      if (!groundedNodes.has(next)) {
        groundedNodes.add(next);
        queue.push(next);
      }
    }
  }

  const disconnectedPieceIds: string[] = [];
  pieces.forEach((p) => {
    if (!groundedNodes.has(p.startNodeId) || !groundedNodes.has(p.endNodeId)) {
      disconnectedPieceIds.push(p.id);
    }
  });

  // 3. Check support at intermediate deck joints (D1, D2, D3)
  const intermediateDeckNodes = mission.nodes.filter((n) => n.role === 'deck_joint');
  const unsupportedDeckNodeIds: string[] = [];

  for (const dNode of intermediateDeckNodes) {
    const connectedNonDeck = pieces.filter(
      (p) =>
        p.type !== 'road_deck' &&
        (p.startNodeId === dNode.id || p.endNodeId === dNode.id) &&
        !disconnectedPieceIds.includes(p.id)
    );

    if (connectedNonDeck.length === 0) {
      unsupportedDeckNodeIds.push(dNode.id);
    }
  }

  // 4. Count closed triangles
  let trussTriangleCount = 0;
  const nodeIds = mission.nodes.map((n) => n.id);
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      for (let k = j + 1; k < nodeIds.length; k++) {
        const u = nodeIds[i];
        const v = nodeIds[j];
        const w = nodeIds[k];
        const uv = adjacency.get(u)?.includes(v);
        const vw = adjacency.get(v)?.includes(w);
        const wu = adjacency.get(w)?.includes(u);
        if (uv && vw && wu) {
          trussTriangleCount++;
        }
      }
    }
  }

  const supportPieces = pieces.filter(
    (p) => p.type !== 'road_deck' && !disconnectedPieceIds.includes(p.id)
  );
  const hasAnySupport = supportPieces.length >= 1;

  // 5. Generous educational load capacity so any supported bridge easily handles the vehicle load
  const rawSupportCapacity = supportPieces.reduce((sum, p) => {
    const spec = BRIDGE_COMPONENT_CATALOG[p.type];
    return sum + spec.loadCapacityKn * 0.65;
  }, 95);

  const trussBonus = Math.min(120, trussTriangleCount * 35);
  const unsupportedPenalty = unsupportedDeckNodeIds.length * 25;
  const loadCapacityKn = Math.max(
    60,
    Math.round(rawSupportCapacity + trussBonus - unsupportedPenalty)
  );

  const overloadedPieceIds: string[] = [];
  pieces.forEach((p) => {
    if (disconnectedPieceIds.includes(p.id)) {
      p.stressRatio = 0;
      p.status = 'disconnected';
      return;
    }
    const spec = BRIDGE_COMPONENT_CATALOG[p.type];
    let localStress = (effectiveLoadKn / Math.max(110, loadCapacityKn)) * (135 / spec.loadCapacityKn);
    if (!hasAnySupport && p.type === 'road_deck') {
      localStress = 1.25;
    }
    p.stressRatio = Number(Math.min(1.35, localStress).toFixed(2));
    if (p.stressRatio > 1.05) {
      p.status = 'overloaded';
      overloadedPieceIds.push(p.id);
    } else if (p.stressRatio > 0.78) {
      p.status = 'warning';
    } else {
      p.status = 'ok';
    }
  });

  const maxDeflectionMm = Number(
    (
      (effectiveLoadKn / Math.max(80, loadCapacityKn)) * 6.5 +
      unsupportedDeckNodeIds.length * 7
    ).toFixed(1)
  );

  // 6. Forgiving Mission Objectives
  const withinBudget = totalCost > 0 && totalCost <= effectiveBudget;
  const loadRequirementMet = connectedRoadDeck && hasAnySupport;

  const objectivesMet: Array<{ label: string; met: boolean }> = [
    {
      label: `Continuous Road Deck (${mission.spanMeters}m span: ${deckOrder.join(' → ')})`,
      met: connectedRoadDeck,
    },
    {
      label: `Bridge supported with Pillars, Beams, or Truss Bracing (${supportPieces.length} support piece${supportPieces.length === 1 ? '' : 's'} placed)`,
      met: loadRequirementMet,
    },
    {
      label: `Material cost (${totalCost} units) within ${effectiveBudget} units budget`,
      met: withinBudget,
    },
  ];

  // 7. Compute 100-Point Score Breakdown
  let structuralScore = 0;
  if (connectedRoadDeck) {
    structuralScore += 20;
    if (hasAnySupport) {
      structuralScore += 12;
    }
    const supportedRatio =
      (intermediateDeckNodes.length - unsupportedDeckNodeIds.length) /
      Math.max(1, intermediateDeckNodes.length);
    structuralScore += Math.round(supportedRatio * 8);
  }
  structuralScore = Math.min(SCORING_WEIGHTS.STRUCTURAL_MAX, Math.max(0, structuralScore));

  const mathScore = mathAnswerCorrect ? SCORING_WEIGHTS.MATH_MAX : 0;

  let budgetScore = 0;
  if (pieces.length > 0 && connectedRoadDeck) {
    if (totalCost <= effectiveBudget) {
      budgetScore = SCORING_WEIGHTS.BUDGET_MAX;
    } else {
      budgetScore = 12;
    }
  }

  const metCount = objectivesMet.filter((o) => o.met).length;
  const objectivesScore = Math.round((metCount / objectivesMet.length) * SCORING_WEIGHTS.OBJECTIVES_MAX);

  // Any continuous road deck + at least 1 support piece PASSES!
  const passed = connectedRoadDeck && hasAnySupport;

  const totalScore = Math.min(100, structuralScore + mathScore + budgetScore + objectivesScore);

  const stars: 0 | 1 | 2 | 3 = !passed
    ? 0
    : totalScore >= 85
    ? 3
    : totalScore >= 65
    ? 2
    : 1;

  // 8. Funny, encouraging diagnostic commentary
  const detailedReasons: string[] = [];
  if (!connectedRoadDeck) {
    detailedReasons.push(
      `🚨 Ayayaa! Missing Road Deck at: ${missingDeckSegments.join(', ')}. Tap "🛣️ 1-Tap Road Deck" at the top so the Dala-Dala doesn't dive into the crocodile river!`
    );
  }
  if (connectedRoadDeck && !hasAnySupport) {
    detailedReasons.push(
      `🐊 Ebwana! A floating road with zero supports?! Tap "🏛️ 1-Tap Pillars" or "🔺 1-Tap Truss" so the bridge doesn't fold like chapati!`
    );
  }
  if (passed && unsupportedDeckNodeIds.length > 0) {
    detailedReasons.push(
      `🎉 Bridge held up! Pro tip: Add a Pillar or Truss at ${unsupportedDeckNodeIds.join(', ')} for maximum 100% structural score!`
    );
  }
  if (!mathAnswerCorrect) {
    detailedReasons.push(
      `🚀 Want +25 Bonus Points & Nitro Flames? Tap the "🚀 Nitro Quiz Boost" button and pick the right answer!`
    );
  }
  if (passed && mathAnswerCorrect) {
    detailedReasons.push(
      `🏆 WOYOOO! Engineering Masterpiece! Capacity ${loadCapacityKn} kN carried the ${effectiveLoadKn} kN vehicle with ease — even the river crocodiles are applauding!`
    );
  }

  const feedbackSummary = passed
    ? `🎉 HAKUNA MATATA! Your bridge passed! The ${mission.vehicleLabel} zoomed across the ${mission.spanMeters}m river safely!`
    : !connectedRoadDeck
    ? `💦 SPLASH! The road deck wasn't finished! Tap "🛣️ 1-Tap Road Deck" or "✨ 1-Tap Miracle Bridge" to fix it instantly!`
    : `💦 BOING-SPLASH! The road had zero pillars or truss supports! Tap "🏛️ 1-Tap Pillars" to hold it up!`;

  return {
    passed,
    structuralScore,
    mathScore,
    budgetScore,
    objectivesScore,
    totalScore,
    stars,
    breakdown: [
      {
        label: 'Structural Performance & Stability',
        earned: structuralScore,
        max: SCORING_WEIGHTS.STRUCTURAL_MAX,
        explanation: connectedRoadDeck
          ? `Capacity ${loadCapacityKn} kN vs ${effectiveLoadKn} kN load (${supportPieces.length} support members).`
          : 'Complete the Road Deck from L0 to R0.',
      },
      {
        label: 'Nitro STEM Quiz Power-Up',
        earned: mathScore,
        max: SCORING_WEIGHTS.MATH_MAX,
        explanation: mathAnswerCorrect
          ? 'Nitro STEM Quiz solved! (+25 pts & Nitro Boost active!)'
          : 'Tap "🚀 Nitro Quiz" to answer 1 quick multiple-choice question for +25 pts.',
      },
      {
        label: 'Budget Efficiency',
        earned: budgetScore,
        max: SCORING_WEIGHTS.BUDGET_MAX,
        explanation: `Material cost: ${totalCost} / ${effectiveBudget} units.`,
      },
      {
        label: 'Completion of Mission Objectives',
        earned: objectivesScore,
        max: SCORING_WEIGHTS.OBJECTIVES_MAX,
        explanation: `${metCount} of ${objectivesMet.length} bridge objectives completed.`,
      },
    ],
    maxDeflectionMm,
    loadCapacityKn,
    vehicleLoadKn: effectiveLoadKn,
    totalCost,
    budgetLimit: effectiveBudget,
    connectedRoadDeck,
    unsupportedDeckNodeIds,
    overloadedPieceIds,
    disconnectedPieceIds,
    objectivesMet,
    feedbackSummary,
    detailedReasons,
    educationalEstimateNote:
      'Bongo Bridge Physics Engine: Load capacity (kN), stress colors, and deflection (mm) are interactive educational simulations.',
  };
}

/**
 * 1-Tap Helper 1: Lay the entire horizontal Road Deck across the river in 1 click!
 */
export function buildRoadDeckOnlyPieces(
  mission: BridgeMissionConfig,
  existingPieces: PlacedBridgePiece[] = []
): PlacedBridgePiece[] {
  const pieces = [...existingPieces];
  for (let i = 0; i < mission.requiredDeckNodeOrder.length - 1; i++) {
    const a = mission.requiredDeckNodeOrder[i];
    const b = mission.requiredDeckNodeOrder[i + 1];
    const res = validateComponentPlacement(mission, pieces, 'road_deck', a, b);
    if (res.valid && res.piece) {
      pieces.push(res.piece);
    }
  }
  return pieces;
}

/**
 * 1-Tap Helper 2: Add Concrete River Pillars under every deck joint (plus road deck if missing)!
 */
export function addPillarsToBridgePieces(
  mission: BridgeMissionConfig,
  existingPieces: PlacedBridgePiece[] = []
): PlacedBridgePiece[] {
  const pieces = buildRoadDeckOnlyPieces(mission, existingPieces);
  const pairs: Array<[string, string]> = [
    ['B1', 'D1'],
    ['B2', 'D2'],
    ['B3', 'D3'],
  ];
  for (const [bNode, dNode] of pairs) {
    const res = validateComponentPlacement(mission, pieces, 'concrete_pillar', bNode, dNode);
    if (res.valid && res.piece) {
      pieces.push(res.piece);
    }
  }
  return pieces;
}

/**
 * 1-Tap Helper 3: Add a Triangular Truss Arch above the road deck (plus road deck if missing)!
 */
export function addTrussArchToBridgePieces(
  mission: BridgeMissionConfig,
  existingPieces: PlacedBridgePiece[] = []
): PlacedBridgePiece[] {
  const pieces = buildRoadDeckOnlyPieces(mission, existingPieces);
  const tryAdd = (type: BridgeComponentType, a: string, b: string) => {
    const res = validateComponentPlacement(mission, pieces, type, a, b);
    if (res.valid && res.piece) {
      pieces.push(res.piece);
    }
  };

  if (mission.spanMeters <= 12) {
    tryAdd('truss_strut', 'L0', 'T1');
    tryAdd('truss_strut', 'D1', 'T1');
    tryAdd('truss_strut', 'R0', 'T1');
  } else if (mission.spanMeters <= 18) {
    tryAdd('truss_strut', 'L0', 'T1');
    tryAdd('truss_strut', 'D1', 'T1');
    tryAdd('steel_beam', 'T1', 'T2');
    tryAdd('truss_strut', 'D1', 'T2');
    tryAdd('truss_strut', 'D2', 'T2');
    tryAdd('truss_strut', 'R0', 'T2');
  } else {
    tryAdd('truss_strut', 'L0', 'T1');
    tryAdd('truss_strut', 'D1', 'T1');
    tryAdd('steel_beam', 'T1', 'T2');
    tryAdd('truss_strut', 'D2', 'T2');
    tryAdd('steel_beam', 'T2', 'T3');
    tryAdd('truss_strut', 'D3', 'T3');
    tryAdd('truss_strut', 'R0', 'T3');
  }

  return pieces;
}

/**
 * 1-Tap Helper 4: Complete Miracle 3-Star Bridge (Road Deck + Pillars + Truss Arch)!
 */
export function buildRecommendedBlueprintPieces(
  mission: BridgeMissionConfig
): PlacedBridgePiece[] {
  const withPillars = addPillarsToBridgePieces(mission, []);
  return addTrussArchToBridgePieces(mission, withPillars);
}
