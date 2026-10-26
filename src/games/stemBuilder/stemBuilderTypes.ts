export type StemSubject =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'Geography';

export type FormLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type StemDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Exam Challenge';

export type StemActivityType =
  | 'bridge_3d'
  | 'virtual_lab'
  | 'interactive_diagram'
  | 'coding_puzzle'
  | 'data_investigation';

export type GraphicsQuality = 'Low' | 'Medium' | 'High';

export type BridgeComponentType =
  | 'road_deck'
  | 'steel_beam'
  | 'truss_strut'
  | 'concrete_pillar'
  | 'suspension_cable';

export interface BridgeComponentSpec {
  type: BridgeComponentType;
  label: string;
  swahiliLabel: string;
  unitCostPerMeter: number;
  maxSpanMeters: number;
  loadCapacityKn: number;
  description: string;
  colorHex: string;
}

export interface BridgeSnapNode {
  id: string;
  label: string;
  x: number; // meters from center (-12 to +12)
  y: number; // elevation in meters (-4 riverbed, 0 deck level, +4 upper truss/tower)
  z: number; // 0 center plane
  role: 'bank_anchor' | 'deck_joint' | 'truss_top' | 'riverbed_base';
}

export interface PlacedBridgePiece {
  id: string;
  type: BridgeComponentType;
  startNodeId: string;
  endNodeId: string;
  lengthMeters: number;
  angleDeg: number;
  cost: number;
  stressRatio?: number;
  status?: 'ok' | 'warning' | 'overloaded' | 'disconnected';
}

export interface BridgeMathCheckpoint {
  question: string;
  unit: string;
  expectedValue: number;
  tolerance: number;
  formulaHint: string;
  workedSolution: string;
}

export interface BridgeMissionConfig {
  missionId: string;
  missionNumber: number;
  title: string;
  formLevel: FormLevel;
  engineerRankTitle: string;
  subject: 'Mathematics' | 'Physics';
  topicId: string;
  terrainType: 'river' | 'gorge' | 'valley' | 'estuary' | 'rift_canyon';
  spanMeters: number;
  baseBudget: number;
  vehicleLoadKn: number;
  vehicleLabel: string;
  allowedComponents: BridgeComponentType[];
  requireTrussTriangle?: boolean;
  requireCenterPillar?: boolean;
  minClearanceMeters?: number;
  nodes: BridgeSnapNode[];
  requiredDeckNodeOrder: string[];
  starterPieces?: Array<{ type: BridgeComponentType; startNodeId: string; endNodeId: string }>;
  missionBrief: string;
  objectives: string[];
  mathCheckpoint: {
    Easy: BridgeMathCheckpoint;
    Medium: BridgeMathCheckpoint;
    Hard: BridgeMathCheckpoint;
    'Exam Challenge': BridgeMathCheckpoint;
  };
}

export interface InteractiveTaskStep {
  id: string;
  difficulty: StemDifficulty;
  title: string;
  scenario: string;
  investigationPrompt: string;
  diagramType:
    | 'circuit'
    | 'titration'
    | 'cell_osmosis'
    | 'algorithm_flow'
    | 'contour_map'
    | 'coord_graph'
    | 'genetics_punnett'
    | 'equilibrium_rate';
  interactiveParameterLabel: string;
  parameterMin: number;
  parameterMax: number;
  parameterStep: number;
  parameterDefault: number;
  parameterUnit: string;
  targetParameterValue?: number;
  numericalQuestion: string;
  expectedAnswer: number | string;
  numericTolerance?: number;
  answerUnit?: string;
  multipleChoiceOptions?: string[];
  correctOptionIndex?: number;
  reflectionQuestion: string;
  reflectionOptions: string[];
  correctReflectionIndex: number;
  hint: string;
  workedSolution: string;
}

export interface CurriculumTopicRecord {
  id: string;
  subject: StemSubject;
  formLevel: FormLevel;
  topic: string;
  swahiliTerm: string;
  description: string;
  subtopics: string[];
  curriculumReference: string | null;
  curriculumVerified: boolean;
  requiredPriorKnowledge: string[];
  learningObjectives: string[];
  difficultyLevels: StemDifficulty[];
  activityTypes: StemActivityType[];
  primaryActivityType: StemActivityType;
  bridgeMissionId?: string;
  estimatedMinutes: number;
  rewards: {
    xp: number;
    coins: number;
    badgeId?: string;
    badgeLabel?: string;
  };
  assessmentCriteria: string[];
  hints: string[];
  workedSolutions: string[];
  interactiveTasks: Record<StemDifficulty, InteractiveTaskStep>;
}

export interface ScoreBreakdownItem {
  label: string;
  earned: number;
  max: number;
  explanation: string;
}

export interface BridgeSimulationResult {
  passed: boolean;
  structuralScore: number; // out of 40
  mathScore: number; // out of 25
  budgetScore: number; // out of 20
  objectivesScore: number; // out of 15
  totalScore: number; // out of 100
  stars: 0 | 1 | 2 | 3;
  breakdown: ScoreBreakdownItem[];
  maxDeflectionMm: number;
  loadCapacityKn: number;
  vehicleLoadKn: number;
  totalCost: number;
  budgetLimit: number;
  connectedRoadDeck: boolean;
  unsupportedDeckNodeIds: string[];
  overloadedPieceIds: string[];
  disconnectedPieceIds: string[];
  objectivesMet: Array<{ label: string; met: boolean }>;
  feedbackSummary: string;
  detailedReasons: string[];
  educationalEstimateNote: string;
}

export interface StemSessionRecord {
  id: string;
  timestamp: string;
  subject: StemSubject;
  formLevel: FormLevel;
  topicId: string;
  topicName: string;
  difficulty: StemDifficulty;
  activityType: StemActivityType;
  score: number;
  stars: number;
  passed: boolean;
}

export interface StemBuilderProgress {
  xp: number;
  coins: number;
  unlockedBadges: string[];
  completedTopicIds: string[];
  completedMissionIds: string[];
  bestScoresByTopic: Record<string, number>;
  bestStarsByTopic: Record<string, number>;
  recentSessions: StemSessionRecord[];
  tutorialSeen: boolean;
  graphicsQuality: GraphicsQuality;
  untimedPracticeMode: boolean;
}
