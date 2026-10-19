// Modular Curriculum Question Bank, Adventure Worlds, Escape Room Puzzles & Progress Persistence
// Clearly labels sample practice questions in accordance with educational integrity rules.

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface GameQuestion {
  id: string;
  subject: string;
  cls: string;
  topic: string;
  difficulty: GameDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  xpReward: number;
  sourceLabel: string;
  isBossOrSpecial?: boolean;
}

export interface TreasureCheckpoint {
  id: number;
  title: string;
  subtitle: string;
  landmarkType: 'harbour' | 'bridge' | 'forest' | 'temple' | 'cave' | 'vault';
  xPct: number;
  yPct: number;
  rewardItemName: string;
  rewardItemIcon: 'key' | 'gem' | 'map' | 'scroll' | 'compass' | 'crown';
  clueFragment: string;
  isSpecialStage?: boolean;
  isBossStage?: boolean;
}

export interface TreasureAdventureWorld {
  id: string;
  name: string;
  region: string;
  description: string;
  skyColor: string;
  waterColor: string;
  islandColor: string;
  accentColor: string;
  finalTreasureName: string;
  checkpoints: TreasureCheckpoint[];
}

export interface EscapeRoomScenario {
  id: string;
  name: string;
  environment: string;
  recommendedDifficulty: GameDifficulty;
  defaultTimeSeconds: number;
  description: string;
  storyIntro: string;
}

export interface ElimikaPlayProgress {
  totalXp: number;
  adventuresCompleted: string[];
  roomsEscaped: string[];
  unlockedBadges: string[];
  collectedArtifacts: string[];
  treasureHighScores: Record<string, number>;
  escapeBestTimes: Record<string, number>;
  savedTreasureSession?: {
    worldId: string;
    cls: string;
    subject: string;
    difficulty: GameDifficulty;
    currentCheckpointIdx: number;
    completedCheckpoints: number[];
    xpEarned: number;
    inventory: string[];
  } | null;
}

export const PLAY_SUBJECTS = [
  'Basic Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'Geography',
  'History',
  'English Language',
] as const;

export const PLAY_CLASSES = [
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
  'Form 5',
  'Form 6',
  'Standard 6',
  'Standard 7',
] as const;

export const TREASURE_ADVENTURE_WORLDS: TreasureAdventureWorld[] = [
  {
    id: 'zanzibar_archipelago',
    name: 'Zanzibar Spice & Coral Archipelago',
    region: 'Coastal Island Expedition',
    description:
      'Sail across turquoise coral lagoons, unlock ancient stone gates, and solve TIE curriculum challenges to open the Grand Sultan Vault.',
    skyColor: '#0284c7',
    waterColor: '#0369a1',
    islandColor: '#15803d',
    accentColor: '#f59e0b',
    finalTreasureName: 'The Golden Astrolabe of Zanzibar',
    checkpoints: [
      {
        id: 1,
        title: '1. Stone Town Harbour',
        subtitle: 'Embarkation Pier',
        landmarkType: 'harbour',
        xPct: 14,
        yPct: 74,
        rewardItemName: 'Bronze Harbour Key',
        rewardItemIcon: 'key',
        clueFragment: 'CLUE I: The first vault dial points to the prime number 3.',
      },
      {
        id: 2,
        title: '2. Coral Reef Suspension Bridge',
        subtitle: 'Lagoon Crossing',
        landmarkType: 'bridge',
        xPct: 31,
        yPct: 54,
        rewardItemName: 'Azure Coral Gem',
        rewardItemIcon: 'gem',
        clueFragment: 'CLUE II: Double the first dial to find the middle digit (6).',
      },
      {
        id: 3,
        title: '3. Jozani Mangrove Sanctuary',
        subtitle: 'Ancient Botanical Grove',
        landmarkType: 'forest',
        xPct: 48,
        yPct: 68,
        rewardItemName: 'Northern Map Fragment',
        rewardItemIcon: 'map',
        clueFragment: 'CLUE III: The spice compass always aligns East at 90 degrees.',
      },
      {
        id: 4,
        title: '4. Old Fort Arabesque Gate',
        subtitle: 'Multi-Step Scholar Challenge',
        landmarkType: 'temple',
        xPct: 63,
        yPct: 40,
        rewardItemName: 'Navigator Brass Compass',
        rewardItemIcon: 'compass',
        clueFragment: 'CLUE IV: The final vault digit equals 3 squared (9).',
        isSpecialStage: true,
      },
      {
        id: 5,
        title: '5. Luminous Limestone Cavern',
        subtitle: 'Crystal Bonus Stage',
        landmarkType: 'cave',
        xPct: 79,
        yPct: 60,
        rewardItemName: 'Ancient Swahili Scroll',
        rewardItemIcon: 'scroll',
        clueFragment: 'CLUE V: Combine the three dials (3 - 6 - 9) at the Grand Sanctuary.',
        isSpecialStage: true,
      },
      {
        id: 6,
        title: '6. House of Wonders Grand Vault',
        subtitle: 'Final Boss Examination',
        landmarkType: 'vault',
        xPct: 88,
        yPct: 26,
        rewardItemName: 'The Golden Astrolabe of Zanzibar',
        rewardItemIcon: 'crown',
        clueFragment: 'MASTER TREASURE UNLOCKED: Vault Code 369 Verified!',
        isBossStage: true,
      },
    ],
  },
  {
    id: 'kilimanjaro_sanctuary',
    name: 'Mount Kilimanjaro Knowledge Peak',
    region: 'Highland Alpine Expedition',
    description:
      'Ascend through rainforest trails, alpine moorlands, and glacial caverns by mastering step-by-step academic problems.',
    skyColor: '#1e3a8a',
    waterColor: '#1e293b',
    islandColor: '#047857',
    accentColor: '#38bdf8',
    finalTreasureName: 'The Uhuru Crystal Crown',
    checkpoints: [
      {
        id: 1,
        title: '1. Marangu Rainforest Gate',
        subtitle: 'Montane Trailhead (1,860m)',
        landmarkType: 'forest',
        xPct: 15,
        yPct: 78,
        rewardItemName: 'Timber Gate Key',
        rewardItemIcon: 'key',
        clueFragment: 'CLUE I: Atmospheric pressure drops as altitude increases.',
      },
      {
        id: 2,
        title: '2. Maundi Crater Ravine Bridge',
        subtitle: 'Cloud Forest Crossing (2,700m)',
        landmarkType: 'bridge',
        xPct: 32,
        yPct: 62,
        rewardItemName: 'Emerald Moss Gem',
        rewardItemIcon: 'gem',
        clueFragment: 'CLUE II: Temperature falls by 0.6°C per 100m of ascent.',
      },
      {
        id: 3,
        title: '3. Horombo Alpine Observatory',
        subtitle: 'Giant Senecio Valley (3,720m)',
        landmarkType: 'temple',
        xPct: 50,
        yPct: 48,
        rewardItemName: 'Alpine Map Fragment',
        rewardItemIcon: 'map',
        clueFragment: 'CLUE III: The summit latitude lies 3 degrees South of the Equator.',
      },
      {
        id: 4,
        title: '4. Mawenzi Lava Tower',
        subtitle: 'Special Steep Ascent Challenge',
        landmarkType: 'cave',
        xPct: 66,
        yPct: 36,
        rewardItemName: 'Barometric Altimeter',
        rewardItemIcon: 'compass',
        clueFragment: 'CLUE IV: Boiling point of water decreases at high altitude.',
        isSpecialStage: true,
      },
      {
        id: 5,
        title: '5. Rebmann Glacier Ice Cave',
        subtitle: 'Sub-Zero Bonus Stage (5,200m)',
        landmarkType: 'cave',
        xPct: 78,
        yPct: 52,
        rewardItemName: 'Glacial Parchment Scroll',
        rewardItemIcon: 'scroll',
        clueFragment: 'CLUE V: Uhuru Peak stands at 5,895 metres above sea level.',
        isSpecialStage: true,
      },
      {
        id: 6,
        title: '6. Uhuru Summit Sanctuary',
        subtitle: 'Roof of Africa Boss Exam (5,895m)',
        landmarkType: 'vault',
        xPct: 87,
        yPct: 22,
        rewardItemName: 'The Uhuru Crystal Crown',
        rewardItemIcon: 'crown',
        clueFragment: 'SUMMIT CONQUERED: Roof of Africa Scholar!',
        isBossStage: true,
      },
    ],
  },
  {
    id: 'serengeti_rift',
    name: 'Serengeti & Olduvai Ancient Rift',
    region: 'Great Rift Valley Expedition',
    description:
      'Cross the endless savannah plains, inspect granite kopjes, and decode ancient scientific inscriptions in Olduvai Gorge.',
    skyColor: '#7c2d12',
    waterColor: '#0f766e',
    islandColor: '#a16207',
    accentColor: '#facc15',
    finalTreasureName: 'The Olduvai Scholar Medallion',
    checkpoints: [
      {
        id: 1,
        title: '1. Naabi Hill Savannah Outpost',
        subtitle: 'Southern Plains Entry',
        landmarkType: 'harbour',
        xPct: 14,
        yPct: 70,
        rewardItemName: 'Acacia Bronze Key',
        rewardItemIcon: 'key',
        clueFragment: 'CLUE I: Producers convert solar energy into chemical energy.',
      },
      {
        id: 2,
        title: '2. Grumeti River Crossing',
        subtitle: 'Migration Ford',
        landmarkType: 'bridge',
        xPct: 30,
        yPct: 48,
        rewardItemName: 'Rift Peridot Gem',
        rewardItemIcon: 'gem',
        clueFragment: 'CLUE II: Only 10% of energy transfers between trophic levels.',
      },
      {
        id: 3,
        title: '3. Moru Granite Kopjes',
        subtitle: 'Savannah Inselberg Lookout',
        landmarkType: 'forest',
        xPct: 49,
        yPct: 64,
        rewardItemName: 'Rift Valley Map Fragment',
        rewardItemIcon: 'map',
        clueFragment: 'CLUE III: Divergent tectonic plates formed the East African Rift.',
      },
      {
        id: 4,
        title: '4. Olduvai Gorge Stratigraphy Site',
        subtitle: 'Cradle of Mankind Special Stage',
        landmarkType: 'temple',
        xPct: 65,
        yPct: 38,
        rewardItemName: 'Archaeologist Chronometer',
        rewardItemIcon: 'compass',
        clueFragment: 'CLUE IV: Zinjanthropus boisei was discovered in 1959 by Mary Leakey.',
        isSpecialStage: true,
      },
      {
        id: 5,
        title: '5. Shifting Volcanic Sands',
        subtitle: 'Magnetic Dune Bonus Stage',
        landmarkType: 'cave',
        xPct: 80,
        yPct: 58,
        rewardItemName: 'Cradle of Wisdom Scroll',
        rewardItemIcon: 'scroll',
        clueFragment: 'CLUE V: Barchan dunes migrate in the direction of prevailing winds.',
        isSpecialStage: true,
      },
      {
        id: 6,
        title: '6. Ngorongoro Caldera Royal Vault',
        subtitle: 'Final Guardian Examination',
        landmarkType: 'vault',
        xPct: 88,
        yPct: 24,
        rewardItemName: 'The Olduvai Scholar Medallion',
        rewardItemIcon: 'crown',
        clueFragment: 'CALDERA VAULT OPENED: Master of the Rift!',
        isBossStage: true,
      },
    ],
  },
];

export const ESCAPE_ROOM_SCENARIOS: EscapeRoomScenario[] = [
  {
    id: 'science_lab',
    name: 'Room 1: The Locked STEM Laboratory',
    environment: 'Science & Mathematics Laboratory',
    recommendedDifficulty: 'Easy',
    defaultTimeSeconds: 600, // 10 minutes
    description:
      'Inspect the chalkboard, lab bench, bookshelf, wall clock, and locked cabinet to synthesize the 4-part exit code before the lab lockdown completes.',
    storyIntro:
      'You stayed late in the Elimika Science & Math Laboratory preparing for the national practicals. The automatic magnetic lock engaged at dusk! Solve the 4 station puzzles around the room and enter the final keypad sequence on the Heavy Exit Door.',
  },
  {
    id: 'exam_hall',
    name: 'Room 2: The Midnight Examination Hall',
    environment: 'National Examination Hall',
    recommendedDifficulty: 'Medium',
    defaultTimeSeconds: 480, // 8 minutes
    description:
      'Combine algebra, scientific laws, and logical deduction hidden inside the Chief Invigilator’s desk, smartboard, and specimen locker.',
    storyIntro:
      'Inside the Examination Hall, four security seals guard the main exit. Inspect the room objects carefully—every solved academic challenge reveals part of the master unlock sequence.',
  },
  {
    id: 'ancient_library',
    name: 'Room 3: The Scholar’s Archive Library',
    environment: 'Historical & Scientific Archive',
    recommendedDifficulty: 'Hard',
    defaultTimeSeconds: 420, // 7 minutes
    description:
      'A high-stakes multi-step academic escape room requiring precision across equations, analytical concepts, and logic synthesis.',
    storyIntro:
      'Welcome to the Chief Scholar’s Archive. Only students who can connect mathematical reasoning, scientific observation, and logical synthesis can unlock the mahogany vault door.',
  },
];

const QUESTION_BANK: GameQuestion[] = [
  // ==================== BASIC MATHEMATICS ====================
  {
    id: 'math-1',
    subject: 'Basic Mathematics',
    cls: 'Form 2',
    topic: 'Logarithms & Exponents',
    difficulty: 'Easy',
    question: 'Solve for $x$ in the logarithmic equation: $\\log_{10}(2x + 4) = 1$',
    options: ['$x = 3$', '$x = 5$', '$x = 2$', '$x = 6$'],
    correctIndex: 0,
    explanation:
      'Step 1: Convert from logarithmic to exponential form: $2x + 4 = 10^1 = 10$. Step 2: $2x = 10 - 4 = 6 \\Rightarrow x = 3$.',
    hint: 'Remember that $\\log_{10}(A) = 1$ means $A = 10^1 = 10$.',
    xpReward: 50,
    sourceLabel: 'Sample Practice — TIE Form 2 Syllabus Aligned',
  },
  {
    id: 'math-2',
    subject: 'Basic Mathematics',
    cls: 'Form 2',
    topic: 'Quadratic Equations',
    difficulty: 'Easy',
    question: 'Find the positive root of the quadratic equation: $x^2 - 5x - 14 = 0$',
    options: ['$x = 7$', '$x = 2$', '$x = 14$', '$x = 5$'],
    correctIndex: 0,
    explanation:
      'Step 1: Factorise $x^2 - 5x - 14 = (x - 7)(x + 2) = 0$. Step 2: The roots are $x = 7$ or $x = -2$. Therefore, the positive root is $x = 7$.',
    hint: 'Find two numbers that multiply to $-14$ and add up to $-5$.',
    xpReward: 50,
    sourceLabel: 'Sample Practice — TIE Form 2 Syllabus Aligned',
  },
  {
    id: 'math-3',
    subject: 'Basic Mathematics',
    cls: 'Form 3',
    topic: 'Sequences & Series',
    difficulty: 'Medium',
    question:
      'In an Arithmetic Progression (AP), the first term $a_1 = 5$ and common difference $d = 4$. Find the 8th term ($A_8$).',
    options: ['$33$', '$37$', '$29$', '$32$'],
    correctIndex: 0,
    explanation:
      'Step 1: Use the $n$th term formula $A_n = a_1 + (n - 1)d$. Step 2: $A_8 = 5 + (8 - 1) \\times 4 = 5 + 28 = 33$.',
    hint: 'Use $A_n = a_1 + (n - 1)d$ with $n = 8$.',
    xpReward: 65,
    sourceLabel: 'Sample Practice — TIE Form 3 Syllabus Aligned',
  },
  {
    id: 'math-4',
    subject: 'Basic Mathematics',
    cls: 'Form 3',
    topic: 'Relations & Functions',
    difficulty: 'Medium',
    question:
      'Given the linear function $f(x) = 3x - 5$, find the value of the inverse function $f^{-1}(10)$.',
    options: ['$5$', '$25$', '$3$', '$15$'],
    correctIndex: 0,
    explanation:
      'Step 1: Let $y = 3x - 5 \\Rightarrow 3x = y + 5 \\Rightarrow f^{-1}(x) = \\frac{x + 5}{3}$. Step 2: Substitute $x = 10$: $f^{-1}(10) = \\frac{10 + 5}{3} = 5$.',
    hint: 'Set $3x - 5 = 10$ and solve for $x$.',
    xpReward: 75,
    sourceLabel: 'Sample Practice — TIE Form 3 Syllabus Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'math-5',
    subject: 'Basic Mathematics',
    cls: 'Form 4',
    topic: 'Matrices & Transformations',
    difficulty: 'Hard',
    question:
      'Find the value of $k$ for which the matrix $M = \\begin{pmatrix} k & 4 \\\\ 3 & 6 \\end{pmatrix}$ is singular (has no inverse).',
    options: ['$k = 2$', '$k = 3$', '$k = -2$', '$k = 6$'],
    correctIndex: 0,
    explanation:
      'Step 1: A matrix is singular when its determinant equals zero ($|M| = 0$). Step 2: $6k - (4 \\times 3) = 0 \\Rightarrow 6k = 12 \\Rightarrow k = 2$.',
    hint: 'Set the determinant $ad - bc = 0$.',
    xpReward: 85,
    sourceLabel: 'Sample Practice — TIE Form 4 Syllabus Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'math-6',
    subject: 'Basic Mathematics',
    cls: 'Form 4',
    topic: 'Coordinate Geometry & Vectors',
    difficulty: 'Hard',
    question:
      'Calculate the magnitude $|\\vec{v}|$ of the vector $\\vec{v} = 6\\mathbf{i} - 8\\mathbf{j}$ and the gradient of the line $4x - 2y + 9 = 0$.',
    options: [
      '$|\\vec{v}| = 10$ units ; gradient $m = 2$',
      '$|\\vec{v}| = 14$ units ; gradient $m = -2$',
      '$|\\vec{v}| = 10$ units ; gradient $m = 4$',
      '$|\\vec{v}| = 100$ units ; gradient $m = 2$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: $|\\vec{v}| = \\sqrt{6^2 + (-8)^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$. Step 2: Rearrange $4x - 2y + 9 = 0 \\Rightarrow 2y = 4x + 9 \\Rightarrow y = 2x + 4.5$, so $m = 2$.',
    hint: 'Use $|\\vec{v}| = \\sqrt{x^2 + y^2}$ and rewrite the line in $y = mx + c$ form.',
    xpReward: 100,
    sourceLabel: 'Sample Practice — TIE Form 4 Syllabus Aligned',
    isBossOrSpecial: true,
  },

  // ==================== BIOLOGY ====================
  {
    id: 'bio-1',
    subject: 'Biology',
    cls: 'Form 1',
    topic: 'Cell Structure & Organization',
    difficulty: 'Easy',
    question:
      'Which cell organelle is known as the powerhouse of the cell because it synthesizes ATP during aerobic respiration?',
    options: ['Mitochondrion', 'Ribosome', 'Golgi apparatus', 'Lysosome'],
    correctIndex: 0,
    explanation:
      'Mitochondria are the sites of the Krebs cycle and electron transport chain in aerobic respiration, generating ATP energy for cellular activities.',
    hint: 'It has a folded inner membrane called cristae.',
    xpReward: 50,
    sourceLabel: 'Sample Practice — TIE Biology Syllabus Aligned',
  },
  {
    id: 'bio-2',
    subject: 'Biology',
    cls: 'Form 2',
    topic: 'Nutrition & Food Tests',
    difficulty: 'Easy',
    question:
      'During a laboratory food test, a student adds Benedict’s solution to a food sample and heats it in a water bath. The mixture turns from blue to green, yellow, and finally brick-red. What nutrient is present?',
    options: ['Reducing sugar (e.g. Glucose)', 'Non-reducing sugar (Sucrose)', 'Protein', 'Starch'],
    correctIndex: 0,
    explanation:
      'Reducing sugars reduce copper(II) sulphate ($Cu^{2+}$, blue) in Benedict’s solution to insoluble copper(I) oxide ($Cu_2O$, brick-red precipitate) upon heating.',
    hint: 'This reagent tests for monosaccharides like glucose without needing dilute HCl hydrolysis.',
    xpReward: 55,
    sourceLabel: 'Sample Practice — TIE Form 2 Biology Aligned',
  },
  {
    id: 'bio-3',
    subject: 'Biology',
    cls: 'Form 2',
    topic: 'Transport of Materials in Living Things',
    difficulty: 'Medium',
    question:
      'Which blood vessel in mammals carries oxygenated blood under high pressure directly from the lungs to the left atrium of the heart?',
    options: ['Pulmonary vein', 'Pulmonary artery', 'Aorta', 'Vena cava'],
    correctIndex: 0,
    explanation:
      'The pulmonary vein is the only vein in the mammalian body (apart from the umbilical vein in a fetus) that carries oxygenated blood—returning it from the lungs to the left atrium.',
    hint: 'Veins carry blood toward the heart; "pulmonary" refers to the lungs.',
    xpReward: 65,
    sourceLabel: 'Sample Practice — TIE Form 2 Biology Aligned',
  },
  {
    id: 'bio-4',
    subject: 'Biology',
    cls: 'Form 3',
    topic: 'Excretion & Osmoregulation',
    difficulty: 'Medium',
    question:
      'When blood plasma becomes too concentrated (low water potential), the pituitary gland secretes more Antidiuretic Hormone (ADH). What is the effect of ADH on the kidney nephron?',
    options: [
      'Increases permeability of the collecting duct to reabsorb more water into the blood',
      'Decreases water reabsorption in the proximal convoluted tubule',
      'Stops ultrafiltration in the glomerulus',
      'Converts excess glucose into glycogen in the Loop of Henle',
    ],
    correctIndex: 0,
    explanation:
      'ADH makes the walls of the distal convoluted tubule and collecting duct more permeable to water, allowing more water to be reabsorbed by osmosis and producing a small volume of concentrated urine.',
    hint: 'Think about how the body conserves water on a hot day.',
    xpReward: 75,
    sourceLabel: 'Sample Practice — TIE Form 3 Biology Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'bio-5',
    subject: 'Biology',
    cls: 'Form 4',
    topic: 'Genetics & Variation',
    difficulty: 'Hard',
    question:
      'In pea plants, tallness ($T$) is dominant over dwarfness ($t$). If two heterozygous tall plants ($Tt \\times Tt$) are crossed and produce $120$ offspring, how many offspring are expected to be heterozygous tall ($Tt$)?',
    options: ['$60$ plants', '$90$ plants', '$30$ plants', '$40$ plants'],
    correctIndex: 0,
    explanation:
      'Step 1: Crossing $Tt \\times Tt$ gives genotypic ratio $1\\,TT : 2\\,Tt : 1\\,tt$. Step 2: Proportion of heterozygous tall ($Tt$) is $\\frac{2}{4} = \\frac{1}{2}$. Step 3: $\\frac{1}{2} \\times 120 = 60$ plants.',
    hint: 'Draw a Punnett square for $Tt \\times Tt$: what fraction is $Tt$ (not $TT$)?',
    xpReward: 90,
    sourceLabel: 'Sample Practice — TIE Form 4 Biology Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'bio-6',
    subject: 'Biology',
    cls: 'Form 4',
    topic: 'Classification & Magnification',
    difficulty: 'Hard',
    question:
      'A student views a specimen using a light microscope with an eyepiece lens of $\\times 10$ and an objective lens of $\\times 40$. If the drawing length is $60\\text{ mm}$ and actual specimen size is $0.15\\text{ mm}$, verify the total magnification.',
    options: [
      '$\\times 400$',
      '$\\times 50$',
      '$\\times 4000$',
      '$\\times 250$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Total Magnification $= \\text{Eyepiece} \\times \\text{Objective} = 10 \\times 40 = \\times 400$. Step 2: Linear magnification check: $\\frac{60\\text{ mm}}{0.15\\text{ mm}} = \\times 400$.',
    hint: 'Multiply eyepiece magnification by objective lens magnification.',
    xpReward: 100,
    sourceLabel: 'Sample Practice — TIE Biology Practical Aligned',
    isBossOrSpecial: true,
  },

  // ==================== PHYSICS ====================
  {
    id: 'phys-1',
    subject: 'Physics',
    cls: 'Form 2',
    topic: 'Current Electricity (Ohm’s Law)',
    difficulty: 'Easy',
    question:
      'Three resistors of $2\\,\\Omega$, $3\\,\\Omega$, and $5\\,\\Omega$ are connected in series across a $20\\text{ V}$ battery. Calculate the current $I$ flowing through the circuit.',
    options: ['$2\\text{ A}$', '$10\\text{ A}$', '$0.5\\text{ A}$', '$4\\text{ A}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Total series resistance $R_T = 2 + 3 + 5 = 10\\,\\Omega$. Step 2: By Ohm’s Law, $I = \\frac{V}{R_T} = \\frac{20\\text{ V}}{10\\,\\Omega} = 2\\text{ A}$.',
    hint: 'Add the series resistances first, then apply $I = \\frac{V}{R}$.',
    xpReward: 50,
    sourceLabel: 'Sample Practice — TIE Physics Syllabus Aligned',
  },
  {
    id: 'phys-2',
    subject: 'Physics',
    cls: 'Form 1',
    topic: 'Archimedes’ Principle & Density',
    difficulty: 'Easy',
    question:
      'A solid metal block weighs $45\\text{ N}$ in air and $35\\text{ N}$ when completely immersed in water. What is the upthrust (buoyant force) acting on the block?',
    options: ['$10\\text{ N}$', '$80\\text{ N}$', '$35\\text{ N}$', '$4.5\\text{ N}$'],
    correctIndex: 0,
    explanation:
      'By Archimedes’ Principle, Upthrust $=$ Real Weight in air $-$ Apparent Weight in fluid $= 45\\text{ N} - 35\\text{ N} = 10\\text{ N}$.',
    hint: 'Upthrust equals the apparent loss in weight when submerged.',
    xpReward: 50,
    sourceLabel: 'Sample Practice — TIE Form 1 Physics Aligned',
  },
  {
    id: 'phys-3',
    subject: 'Physics',
    cls: 'Form 2',
    topic: 'Equations of Uniformly Accelerated Motion',
    difficulty: 'Medium',
    question:
      'A car starts from rest ($u = 0\\text{ m/s}$) and accelerates uniformly at $3\\text{ m/s}^2$ for $6\\text{ seconds}$. Calculate the distance $s$ travelled.',
    options: ['$54\\text{ m}$', '$18\\text{ m}$', '$108\\text{ m}$', '$36\\text{ m}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Use $s = ut + \\frac{1}{2}at^2$. Step 2: $s = 0 + \\frac{1}{2} \\times 3 \\times 6^2 = 0.5 \\times 3 \\times 36 = 54\\text{ m}$.',
    hint: 'Use the second equation of motion: $s = ut + \\frac{1}{2}at^2$.',
    xpReward: 65,
    sourceLabel: 'Sample Practice — TIE Form 2 Physics Aligned',
  },
  {
    id: 'phys-4',
    subject: 'Physics',
    cls: 'Form 3',
    topic: 'Light: Lenses & Focal Length',
    difficulty: 'Medium',
    question:
      'An object is placed $30\\text{ cm}$ in front of a converging (convex) lens of focal length $f = 10\\text{ cm}$. Using the real-is-positive convention ($\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$), find the image distance $v$.',
    options: ['$v = 15\\text{ cm}$', '$v = 20\\text{ cm}$', '$v = 7.5\\text{ cm}$', '$v = 30\\text{ cm}$'],
    correctIndex: 0,
    explanation:
      'Step 1: $\\frac{1}{v} = \\frac{1}{f} - \\frac{1}{u} = \\frac{1}{10} - \\frac{1}{30} = \\frac{3 - 1}{30} = \\frac{2}{30} = \\frac{1}{15}$. Step 2: Therefore $v = 15\\text{ cm}$.',
    hint: 'Compute $\\frac{1}{10} - \\frac{1}{30}$ and take the reciprocal.',
    xpReward: 75,
    sourceLabel: 'Sample Practice — TIE Form 3 Physics Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'phys-5',
    subject: 'Physics',
    cls: 'Form 3',
    topic: 'Heat Capacity & Latent Heat',
    difficulty: 'Hard',
    question:
      'Calculate the quantity of heat energy $Q$ required to raise the temperature of $2\\text{ kg}$ of water from $25^\\circ\\text{C}$ to $75^\\circ\\text{C}$ (Specific heat capacity of water $c = 4200\\text{ J/kgK}$).',
    options: ['$420,000\\text{ J}$ ($420\\text{ kJ}$)', '$210,000\\text{ J}$', '$84,000\\text{ J}$', '$630,000\\text{ J}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Temperature change $\\Delta \\theta = 75 - 25 = 50\\text{ K}$. Step 2: $Q = mc\\Delta\\theta = 2 \\times 4200 \\times 50 = 420,000\\text{ J}$ ($420\\text{ kJ}$).',
    hint: 'Use $Q = mc\\Delta\\theta$ with $\\Delta\\theta = 50\\text{ K}$.',
    xpReward: 85,
    sourceLabel: 'Sample Practice — TIE Form 3 Physics Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'phys-6',
    subject: 'Physics',
    cls: 'Form 4',
    topic: 'Waves & Radioactivity',
    difficulty: 'Hard',
    question:
      'A radioactive isotope has a half-life $t_{1/2} = 8\\text{ days}$. Starting with an initial sample mass of $64\\text{ g}$, how much undecayed mass remains after $24\\text{ days}$?',
    options: ['$8\\text{ g}$', '$16\\text{ g}$', '$4\\text{ g}$', '$21.3\\text{ g}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Number of half-lives $n = \\frac{24}{8} = 3$. Step 2: Remaining mass $M = M_0 \\times (\\frac{1}{2})^n = 64 \\times (\\frac{1}{2})^3 = \\frac{64}{8} = 8\\text{ g}$.',
    hint: 'Determine how many 8-day half-lives fit into 24 days, then halve 64 that many times.',
    xpReward: 100,
    sourceLabel: 'Sample Practice — TIE Form 4 Physics Aligned',
    isBossOrSpecial: true,
  },

  // ==================== CHEMISTRY ====================
  {
    id: 'chem-1',
    subject: 'Chemistry',
    cls: 'Form 2',
    topic: 'Atomic Structure & Periodic Table',
    difficulty: 'Easy',
    question:
      'An atom of Sodium ($^{23}_{11}\\text{Na}$) has atomic number $Z = 11$ and mass number $A = 23$. What is its electronic configuration and number of neutrons?',
    options: [
      'Configuration: $2:8:1$ ; Neutrons: $12$',
      'Configuration: $2:8:2$ ; Neutrons: $11$',
      'Configuration: $2:8:1$ ; Neutrons: $23$',
      'Configuration: $2:9$ ; Neutrons: $12$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: $11$ electrons fill shells as $2:8:1$. Step 2: Number of neutrons $N = A - Z = 23 - 11 = 12$.',
    hint: 'Subtract atomic number $11$ from mass number $23$ to get neutrons.',
    xpReward: 50,
    sourceLabel: 'Sample Practice — TIE Form 2 Chemistry Aligned',
  },
  {
    id: 'chem-2',
    subject: 'Chemistry',
    cls: 'Form 3',
    topic: 'The Mole Concept & Stoichiometry',
    difficulty: 'Medium',
    question:
      'Calculate the number of moles in $22\\text{ g}$ of Carbon dioxide gas ($\\text{CO}_2$), given relative atomic masses $C = 12$ and $O = 16$.',
    options: ['$0.5\\text{ moles}$', '$1.0\\text{ mole}$', '$2.0\\text{ moles}$', '$0.25\\text{ moles}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Molar mass of $\\text{CO}_2 = 12 + (2 \\times 16) = 44\\text{ g/mol}$. Step 2: Moles $n = \\frac{\\text{mass}}{\\text{molar mass}} = \\frac{22}{44} = 0.5\\text{ moles}$.',
    hint: 'First find the molar mass of $\\text{CO}_2$ ($12 + 16 \\times 2$).',
    xpReward: 65,
    sourceLabel: 'Sample Practice — TIE Form 3 Chemistry Aligned',
  },
  {
    id: 'chem-3',
    subject: 'Chemistry',
    cls: 'Form 3',
    topic: 'Volumetric Analysis (Titration)',
    difficulty: 'Medium',
    question:
      'In a titration, $25.0\\text{ cm}^3$ of $0.1\\text{ M } \\text{NaOH}$ is completely neutralized by $20.0\\text{ cm}^3$ of dilute $\\text{HCl}$ ($\\text{NaOH} + \\text{HCl} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$). Find the molarity $M_a$ of the $\\text{HCl}$ acid.',
    options: ['$0.125\\text{ M}$', '$0.100\\text{ M}$', '$0.080\\text{ M}$', '$0.250\\text{ M}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Since mole ratio $n_a : n_b = 1 : 1$, $M_a V_a = M_b V_b$. Step 2: $M_a \\times 20.0 = 0.1 \\times 25.0 \\Rightarrow M_a = \\frac{2.5}{20.0} = 0.125\\text{ M}$.',
    hint: 'Use $M_a V_a = M_b V_b$ for a $1:1$ acid-base neutralization.',
    xpReward: 75,
    sourceLabel: 'Sample Practice — TIE Form 3 Chemistry Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'chem-4',
    subject: 'Chemistry',
    cls: 'Form 3',
    topic: 'Electrolysis & Faraday’s First Law',
    difficulty: 'Hard',
    question:
      'How many Faradays of electricity are required to deposit $1\\text{ mole}$ ($63.5\\text{ g}$) of Copper metal from copper(II) sulphate solution ($\\text{Cu}^{2+}_{(aq)} + 2e^- \\rightarrow \\text{Cu}_{(s)}$)?',
    options: ['$2\\text{ Faradays}$', '$1\\text{ Faraday}$', '$3\\text{ Faradays}$', '$0.5\\text{ Faradays}$'],
    correctIndex: 0,
    explanation:
      'From the half-reaction $\\text{Cu}^{2+} + 2e^- \\rightarrow \\text{Cu}$, $2\\text{ moles}$ of electrons ($2\\text{ Faradays}$) are required to discharge $1\\text{ mole}$ of divalent $\\text{Cu}^{2+}$ ions.',
    hint: 'Look at the charge on the $\\text{Cu}^{2+}$ ion.',
    xpReward: 85,
    sourceLabel: 'Sample Practice — TIE Form 3 Chemistry Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'chem-5',
    subject: 'Chemistry',
    cls: 'Form 4',
    topic: 'Organic Chemistry (Homologous Series)',
    difficulty: 'Hard',
    question:
      'Which general molecular formula and functional group represent the Alkanol (Alcohol) homologous series?',
    options: [
      '$C_nH_{2n+1}OH$ with functional group $-OH$ (hydroxyl)',
      '$C_nH_{2n}$ with functional group $C=C$',
      '$C_nH_{2n+1}COOH$ with functional group $-COOH$',
      '$C_nH_{2n+2}$ with single covalent bonds only',
    ],
    correctIndex: 0,
    explanation:
      'Alkanols (such as ethanol, $C_2H_5OH$) follow the general formula $C_nH_{2n+1}OH$ and contain the hydroxyl ($-OH$) functional group.',
    hint: 'Substitute $n = 2$ for ethanol ($C_2H_5OH$).',
    xpReward: 95,
    sourceLabel: 'Sample Practice — TIE Form 4 Chemistry Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'chem-6',
    subject: 'Chemistry',
    cls: 'Form 4',
    topic: 'Chemical Kinetics & Equilibrium',
    difficulty: 'Hard',
    question:
      'In the exothermic Haber process ($\\text{N}_{2(g)} + 3\\text{H}_{2(g)} \\rightleftharpoons 2\\text{NH}_{3(g)}$, $\\Delta H = -92\\text{ kJ/mol}$), which conditions favour a higher equilibrium yield of ammonia?',
    options: [
      'High pressure ($200\\text{ atm}$) and moderate temperature ($450^\\circ\\text{C}$) with an iron catalyst',
      'Low pressure ($1\\text{ atm}$) and very high temperature ($900^\\circ\\text{C}$)',
      'Removing nitrogen gas continuously from the reactor',
      'Adding water vapour to decompose the catalyst',
    ],
    correctIndex: 0,
    explanation:
      'By Le Chatelier’s Principle, 4 moles of gas on the left form 2 moles on the right, so high pressure shifts equilibrium toward $\\text{NH}_3$. Moderate temperature ($450^\\circ\\text{C}$) with finely divided iron balances yield and reaction rate.',
    hint: 'Count the gas moles on each side of $\\text{N}_2 + 3\\text{H}_2 \\rightleftharpoons 2\\text{NH}_3$.',
    xpReward: 100,
    sourceLabel: 'Sample Practice — TIE Form 4 Chemistry Aligned',
    isBossOrSpecial: true,
  },

  // ==================== GEOGRAPHY ====================
  {
    id: 'geo-1',
    subject: 'Geography',
    cls: 'Form 1',
    topic: 'Solar System, Longitude & Time',
    difficulty: 'Easy',
    question:
      'If the local time at Greenwich Prime Meridian ($0^\\circ$) is $12:00\\text{ Noon}$, what is the local time in Dar es Salaam located at longitude $45^\\circ\\text{E}$?',
    options: ['$3:00\\text{ PM}$ ($15:00\\text{ hrs}$)', '$9:00\\text{ AM}$', '$2:00\\text{ PM}$', '$4:00\\text{ PM}$'],
    correctIndex: 0,
    explanation:
      'Step 1: The Earth rotates $15^\\circ$ every $1\\text{ hour}$. Step 2: Time difference $= \\frac{45^\\circ}{15^\\circ} = 3\\text{ hours}$. Step 3: Since Dar es Salaam is East of Greenwich, add $3\\text{ hours}$: $12:00 + 3:00 = 3:00\\text{ PM}$.',
    hint: 'Divide $45^\\circ$ by $15^\\circ$ per hour and add because it is East.',
    xpReward: 55,
    sourceLabel: 'Sample Practice — TIE Geography Syllabus Aligned',
  },
  {
    id: 'geo-2',
    subject: 'Geography',
    cls: 'Form 3',
    topic: 'Map Reading & Scale Calculations',
    difficulty: 'Medium',
    question:
      'On a topographical map with scale $1:50,000$, a road measures $8\\text{ cm}$. What is the actual ground distance of the road in kilometres?',
    options: ['$4\\text{ km}$', '$8\\text{ km}$', '$40\\text{ km}$', '$2\\text{ km}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Scale $1:50,000$ means $1\\text{ cm}$ on the map represents $0.5\\text{ km}$ on the ground. Step 2: Ground distance $= 8 \\times 0.5\\text{ km} = 4\\text{ km}$.',
    hint: 'At $1:50,000$, every $2\\text{ cm}$ equals $1\\text{ km}$.',
    xpReward: 70,
    sourceLabel: 'Sample Practice — TIE Form 3 Geography Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'geo-3',
    subject: 'Geography',
    cls: 'Form 4',
    topic: 'Elementary Surveying & Research',
    difficulty: 'Hard',
    question:
      'During a chain survey along a line AB, if the forward bearing of B from A is $065^\\circ$, what is the back bearing of A from B?',
    options: ['$245^\\circ$', '$155^\\circ$', '$115^\\circ$', '$305^\\circ$'],
    correctIndex: 0,
    explanation:
      'Since the forward bearing ($065^\\circ$) is less than $180^\\circ$, add $180^\\circ$ to find the back bearing: $065^\\circ + 180^\\circ = 245^\\circ$.',
    hint: 'If Forward Bearing $< 180^\\circ$, Back Bearing $= \\text{FB} + 180^\\circ$.',
    xpReward: 90,
    sourceLabel: 'Sample Practice — TIE Form 3/4 Geography Aligned',
    isBossOrSpecial: true,
  },

  // ==================== HISTORY ====================
  {
    id: 'hist-1',
    subject: 'History',
    cls: 'Form 1',
    topic: 'Sources & Reconstruction of History',
    difficulty: 'Easy',
    question:
      'In which Tanzanian archaeological site did Dr. Mary and Louis Leakey discover the skull of Zinjanthropus boisei (Australopithecus boisei) in 1959?',
    options: ['Olduvai Gorge', 'Isimila Stone Age Site', 'Kondoa Irangi Caves', 'Kilwa Kisiwani'],
    correctIndex: 0,
    explanation:
      'Olduvai Gorge in the eastern Serengeti plains is world-famous as the "Cradle of Mankind" where Zinjanthropus boisei was unearthed in 1959.',
    hint: 'It is located in northern Tanzania near the Ngorongoro Conservation Area.',
    xpReward: 55,
    sourceLabel: 'Sample Practice — TIE History Syllabus Aligned',
  },
  {
    id: 'hist-2',
    subject: 'History',
    cls: 'Form 3',
    topic: 'African Resistance to Colonial Rule',
    difficulty: 'Medium',
    question:
      'What was the primary cause and significance of the Maji Maji War ($1905\\text{–}1907$) in southern German East Africa?',
    options: [
      'A united inter-ethnic uprising against forced cotton cultivation, heavy taxation, and brutal akida/jumbe rule',
      'A border dispute between British Kenya and Portuguese Mozambique',
      'A trade treaty signed at the Berlin Conference of 1884',
      'The construction of the TAZARA railway line',
    ],
    correctIndex: 0,
    explanation:
      'Led initially by Kinjekitile Ngwale in Matumbi hills, the Maji Maji uprising united over 20 southern ethnic groups against German forced cotton schemes and oppressive rule, inspiring later nationalist unity.',
    hint: 'It began in the Matumbi hills against German forced cotton schemes.',
    xpReward: 70,
    sourceLabel: 'Sample Practice — TIE Form 3 History Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'hist-3',
    subject: 'History',
    cls: 'Form 4',
    topic: 'Nationalism & Decolonisation in Tanzania',
    difficulty: 'Hard',
    question:
      'On what historic dates did (i) Tanganyika attain independence and (ii) Tanganyika unite with Zanzibar to form the United Republic of Tanzania?',
    options: [
      '(i) 9 December 1961 ; (ii) 26 April 1964',
      '(i) 26 April 1961 ; (ii) 9 December 1964',
      '(i) 7 July 1954 ; (ii) 12 January 1964',
      '(i) 9 December 1962 ; (ii) 5 February 1977',
    ],
    correctIndex: 0,
    explanation:
      'Tanganyika gained independence on 9 December 1961 under Mwalimu Julius Kambarage Nyerere, and united with Zanzibar (led by Sheikh Abeid Amani Karume) on 26 April 1964.',
    hint: 'Independence Day is celebrated in December; Union Day is in April.',
    xpReward: 95,
    sourceLabel: 'Sample Practice — TIE Form 4 History Aligned',
    isBossOrSpecial: true,
  },

  // ==================== ENGLISH LANGUAGE ====================
  {
    id: 'eng-1',
    subject: 'English Language',
    cls: 'Form 2',
    topic: 'Grammar: Conditional Sentences & Tenses',
    difficulty: 'Easy',
    question:
      'Complete the Type 3 conditional sentence correctly: "If Amina ________ harder for the mock exam, she would have passed with flying colours."',
    options: ['had studied', 'studied', 'has studied', 'would study'],
    correctIndex: 0,
    explanation:
      'In Type 3 Conditional (unfulfilled past condition), the "if" clause takes the Past Perfect tense ("had + past participle") and the main clause takes "would have + past participle".',
    hint: 'Use the Past Perfect tense ("had + past participle") in the if-clause.',
    xpReward: 50,
    sourceLabel: 'Sample Practice — TIE English Syllabus Aligned',
  },
  {
    id: 'eng-2',
    subject: 'English Language',
    cls: 'Form 3',
    topic: 'Active & Passive Voice / Question Tags',
    difficulty: 'Medium',
    question:
      'Choose the correct question tag for the statement: "The students rarely arrive late for morning laboratory practicals, ________?"',
    options: ['do they', 'don’t they', 'aren’t they', 'did they'],
    correctIndex: 0,
    explanation:
      'The adverb "rarely" carries a negative meaning, so the statement requires a positive question tag ("do they?").',
    hint: 'Words like "rarely", "seldom", and "hardly" make a clause negative.',
    xpReward: 70,
    sourceLabel: 'Sample Practice — TIE Form 3 English Aligned',
    isBossOrSpecial: true,
  },
  {
    id: 'eng-3',
    subject: 'English Language',
    cls: 'Form 4',
    topic: 'Literary Analysis & Figures of Speech',
    difficulty: 'Hard',
    question:
      'Identify the figure of speech used in the line: "The dry savannah grass whispered secrets to the evening wind as the sun bowed behind the hills."',
    options: ['Personification', 'Oxymoron', 'Simile', 'Hyperbole'],
    correctIndex: 0,
    explanation:
      'Giving human actions ("whispered secrets", "bowed") to non-human things (grass, sun) is called Personification.',
    hint: 'Non-human objects are given human actions.',
    xpReward: 90,
    sourceLabel: 'Sample Practice — TIE Form 4 Literature Aligned',
    isBossOrSpecial: true,
  },
];

/**
 * Returns a sequence of 6 modular questions tailored to the selected subject, class, and difficulty
 * for the 6 checkpoints of a NECTA Treasure Hunt adventure.
 */
export function getQuestionsForTreasureHunt(
  subject: string,
  cls: string,
  difficulty: GameDifficulty
): GameQuestion[] {
  const subNorm = subject.toLowerCase();
  const matchingSubject = QUESTION_BANK.filter(
    (q) => q.subject.toLowerCase().includes(subNorm) || subNorm.includes(q.subject.toLowerCase())
  );

  const pool = matchingSubject.length >= 3 ? [...matchingSubject] : [...QUESTION_BANK];

  // Sort so earlier checkpoints match easier/standard questions and final checkpoints get boss/special questions
  pool.sort((a, b) => {
    const scoreA = a.difficulty === 'Easy' ? 1 : a.difficulty === 'Medium' ? 2 : 3;
    const scoreB = b.difficulty === 'Easy' ? 1 : b.difficulty === 'Medium' ? 2 : 3;
    return difficulty === 'Hard' ? scoreB - scoreA : scoreA - scoreB;
  });

  // Ensure exactly 6 distinct checkpoints by supplementing from cross-curricular STEM/Humanities if needed
  const result: GameQuestion[] = [];
  for (const item of pool) {
    if (result.length < 6) {
      result.push({
        ...item,
        cls,
        xpReward:
          difficulty === 'Hard'
            ? Math.round(item.xpReward * 1.25)
            : difficulty === 'Medium'
            ? item.xpReward
            : Math.round(item.xpReward * 0.9),
      });
    }
  }

  for (const item of QUESTION_BANK) {
    if (result.length >= 6) break;
    if (!result.some((r) => r.id === item.id)) {
      result.push({
        ...item,
        cls,
      });
    }
  }

  return result.slice(0, 6);
}

export interface EscapeRoomPuzzleSet {
  puzzle1Math: {
    title: string;
    prompt: string;
    equationDisplay: string;
    correctCode: string; // 3-digit code e.g. "248"
    hint: string;
    explanation: string;
  };
  puzzle2Matching: {
    title: string;
    prompt: string;
    pairs: Array<{ id: string; structure: string; functionDesc: string }>;
    correctOrderIds: string[];
    unlockedClueDigit: string;
    hint: string;
    explanation: string;
  };
  puzzle3CircuitOrLab: {
    title: string;
    prompt: string;
    question: string;
    options: string[];
    correctIndex: number;
    unlockedItemName: string;
    hint: string;
    explanation: string;
  };
  puzzle4Logic: {
    title: string;
    prompt: string;
    question: string;
    options: string[];
    correctIndex: number;
    masterSequenceCode: string;
    hint: string;
    explanation: string;
  };
}

export function getEscapeRoomPuzzles(
  roomId: string,
  cls: string,
  subject: string,
  difficulty: GameDifficulty
): EscapeRoomPuzzleSet {
  if (roomId === 'exam_hall' || difficulty === 'Medium') {
    return {
      puzzle1Math: {
        title: 'Puzzle 1 — Smartboard Algebraic Cipher',
        prompt: `Solve the three equations for (${cls} • ${subject}) to discover the 3-digit Smartboard PIN (Digits: $x$, $y$, $z$):`,
        equationDisplay:
          'Digit 1 ($x$): $\\log_{10}(1000) = x$  |  Digit 2 ($y$): $2y - 3 = 7$  |  Digit 3 ($z$): $\\sqrt{49} = z$',
        correctCode: '357',
        hint: '$\\log_{10}(1000) = 3$, solve $2y = 10$, and $\\sqrt{49} = 7$.',
        explanation:
          'Step 1: Since $10^3 = 1000$, $x = 3$. Step 2: $2y - 3 = 7 \\Rightarrow 2y = 10 \\Rightarrow y = 5$. Step 3: $\\sqrt{49} = 7$. Thus the 3-digit PIN is 357.',
      },
      puzzle2Matching: {
        title: 'Puzzle 2 — Specimen Table Structure-Function Lock',
        prompt:
          'Select the correct scientific function for each biological/chemical structure to release the Cabinet Latch:',
        pairs: [
          {
            id: 'xylem',
            structure: '1. Xylem Vessels',
            functionDesc: 'Transports water and dissolved mineral salts upward from roots to leaves',
          },
          {
            id: 'alveoli',
            structure: '2. Alveoli (Air Sacs)',
            functionDesc: 'Provides a large moist surface area for gaseous exchange ($O_2$ and $CO_2$)',
          },
          {
            id: 'nephron',
            structure: '3. Kidney Glomerulus',
            functionDesc: 'Performs ultrafiltration of blood under high hydrostatic pressure',
          },
        ],
        correctOrderIds: ['xylem', 'alveoli', 'nephron'],
        unlockedClueDigit: '8',
        hint: 'Xylem transports water, Alveoli exchange gases in the lungs, and the Glomerulus filters blood.',
        explanation:
          'In the TIE Biology curriculum: Xylem conducts water and mineral ions upward; Alveoli are the gas exchange surfaces in mammalian lungs; and the Glomerulus filters small molecules from blood plasma.',
      },
      puzzle3CircuitOrLab: {
        title: 'Puzzle 3 — Locked Supply Cabinet (Ohm’s Law & Wall Clock)',
        prompt:
          'The cabinet electronic lock shows a $12\\text{ V}$ battery connected across a $3\\,\\Omega$ resistor in series with a $1\\,\\Omega$ resistor.',
        question:
          'Calculate the electric current $I$ flowing through the circuit ($I = \\frac{V}{R_1 + R_2}$) to unlock the Brass Master Key:',
        options: ['$I = 3\\text{ A}$', '$I = 4\\text{ A}$', '$I = 12\\text{ A}$', '$I = 1.5\\text{ A}$'],
        correctIndex: 0,
        unlockedItemName: 'Brass Master Key',
        hint: 'Total resistance $R_T = 3\\,\\Omega + 1\\,\\Omega = 4\\,\\Omega$. Divide $12\\text{ V}$ by $4\\,\\Omega$.',
        explanation:
          'Step 1: Series resistance $R_T = 3\\,\\Omega + 1\\,\\Omega = 4\\,\\Omega$. Step 2: By Ohm’s Law, $I = \\frac{12\\text{ V}}{4\\,\\Omega} = 3\\text{ A}$.',
      },
      puzzle4Logic: {
        title: 'Puzzle 4 — Logic Synthesis Board',
        prompt:
          'Combine your discovered clues: Smartboard PIN (357) + Specimen Digit (8) + Circuit Current (3 A).',
        question:
          'What is the sum of the three digits of the Smartboard PIN ($3 + 5 + 7$) multiplied by the Circuit Current ($3$)?',
        options: ['$45$', '$35$', '$54$', '$30$'],
        correctIndex: 0,
        masterSequenceCode: '357-83-45',
        hint: 'Add $3 + 5 + 7 = 15$, then multiply $15 \\times 3$.',
        explanation:
          'Step 1: Sum of PIN digits $= 3 + 5 + 7 = 15$. Step 2: Multiply by the $3\\text{ A}$ circuit reading: $15 \\times 3 = 45$. Master Escape Code: 357-83-45.',
      },
    };
  }

  if (roomId === 'ancient_library' || difficulty === 'Hard') {
    return {
      puzzle1Math: {
        title: 'Puzzle 1 — Archive Manuscript Cipher',
        prompt: `Solve the three equations for (${cls} • ${subject}) to unlock the 3-digit Archive Code (Digits: $a$, $b$, $c$):`,
        equationDisplay:
          'Digit 1 ($a$): Determinant of $\\begin{pmatrix} 3 & 1 \\\\ 2 & 2 \\end{pmatrix}$  |  Digit 2 ($b$): Gradient of $y = 6x - 9$  |  Digit 3 ($c$): $2^c = 8$',
        correctCode: '463',
        hint: 'Determinant $= (3 \\times 2) - (1 \\times 2) = 4$; gradient $m = 6$; and $2^3 = 8$.',
        explanation:
          'Step 1: Determinant $= 6 - 2 = 4$. Step 2: In $y = mx + c$, the gradient $m = 6$. Step 3: Since $2^3 = 8$, $c = 3$. Archive Code = 463.',
      },
      puzzle2Matching: {
        title: 'Puzzle 2 — Scholar’s Analytical Bench',
        prompt: 'Verify the three fundamental scientific & historical principles to unlock the Vault Dial:',
        pairs: [
          {
            id: 'faraday',
            structure: '1. Faraday’s First Law',
            functionDesc: 'Mass liberated during electrolysis is directly proportional to quantity of electricity ($m \\propto Q$)',
          },
          {
            id: 'boyle',
            structure: '2. Boyle’s Gas Law',
            functionDesc: 'At constant temperature, pressure of a fixed mass of gas is inversely proportional to volume ($P_1V_1 = P_2V_2$)',
          },
          {
            id: 'mendel',
            structure: '3. Mendel’s Law of Segregation',
            functionDesc: 'Paired alleles separate during gamete formation so each gamete carries one allele',
          },
        ],
        correctOrderIds: ['faraday', 'boyle', 'mendel'],
        unlockedClueDigit: '9',
        hint: 'Review the definitions of Faraday’s Law ($m = ZIt$), Boyle’s Law ($PV = k$), and Mendel’s first law.',
        explanation:
          'All three laws are foundational principles across TIE Form 3 and Form 4 Chemistry, Physics, and Biology.',
      },
      puzzle3CircuitOrLab: {
        title: 'Puzzle 3 — Mahogany Cabinet Calibration',
        prompt:
          'A topographical map inside the cabinet has a scale of $1:50,000$. A straight canal on the map measures $10\\text{ cm}$.',
        question: 'Calculate the actual ground length of the canal in kilometres to release the Brass Master Key:',
        options: ['$5\\text{ km}$', '$10\\text{ km}$', '$50\\text{ km}$', '$2.5\\text{ km}$'],
        correctIndex: 0,
        unlockedItemName: 'Brass Master Key',
        hint: 'At $1:50,000$, $1\\text{ cm} = 0.5\\text{ km}$. Multiply $10\\text{ cm} \\times 0.5\\text{ km}$.',
        explanation:
          'Step 1: $1\\text{ cm}$ represents $50,000\\text{ cm} = 0.5\\text{ km}$. Step 2: $10 \\times 0.5\\text{ km} = 5\\text{ km}$.',
      },
      puzzle4Logic: {
        title: 'Puzzle 4 — Master Archive Sequence',
        prompt:
          'Combine the Archive Code (463), the Bench Digit (9), and the Canal Distance (5 km).',
        question:
          'In the sequence $4, 9, 16, 25, x$, where each term is $n^2$, what is the next term $x$ after $25$?',
        options: ['$36$', '$30$', '$49$', '$32$'],
        correctIndex: 0,
        masterSequenceCode: '463-95-36',
        hint: 'The sequence is $2^2, 3^2, 4^2, 5^2, 6^2$.',
        explanation:
          'The terms are perfect squares: $2^2=4, 3^2=9, 4^2=16, 5^2=25$, so the next term is $6^2 = 36$. Master Escape Code: 463-95-36.',
      },
    };
  }

  // Default Room 1: The Locked STEM Laboratory
  return {
    puzzle1Math: {
      title: 'Puzzle 1 — Chalkboard 3-Digit Cipher',
      prompt: `Solve the chalkboard equations for (${cls} • ${subject}) to find the 3-digit code (Digits: $A$, $B$, $C$):`,
      equationDisplay:
        'Digit $A$: $3A - 2 = 4$  |  Digit $B$: $\\sqrt{16} = B$  |  Digit $C$: $2^3 = C$',
      correctCode: '248',
      hint: 'Solve $3A = 6 \\Rightarrow A = 2$; $\\sqrt{16} = 4$; and $2^3 = 8$.',
      explanation:
        'Step 1: $3A - 2 = 4 \\Rightarrow 3A = 6 \\Rightarrow A = 2$. Step 2: $\\sqrt{16} = 4 \\Rightarrow B = 4$. Step 3: $2^3 = 2 \\times 2 \\times 2 = 8 \\Rightarrow C = 8$. Therefore the 3-digit code is 248.',
    },
    puzzle2Matching: {
      title: 'Puzzle 2 — Laboratory Bench Organelle & Reagent Match',
      prompt:
        'Verify the three laboratory organelle and reagent pairings on the lab bench to reveal the hidden magnetic latch digit:',
      pairs: [
        {
          id: 'chloroplast',
          structure: '1. Chloroplast',
          functionDesc: 'Contains chlorophyll pigment that traps light energy for photosynthesis',
        },
        {
          id: 'iodine',
          structure: '2. Iodine Solution',
          functionDesc: 'Turns blue-black in the presence of starch',
        },
        {
          id: 'mitochondria',
          structure: '3. Mitochondrion',
          functionDesc: 'Synthesizes ATP energy during aerobic cellular respiration',
        },
      ],
      correctOrderIds: ['chloroplast', 'iodine', 'mitochondria'],
      unlockedClueDigit: '6',
      hint: 'Chloroplasts trap light, Iodine tests for starch (blue-black), and Mitochondria produce ATP.',
      explanation:
        'In TIE Biology & Chemistry practicals: Chloroplasts carry out photosynthesis; Iodine solution turns blue-black with starch; and Mitochondria generate ATP.',
    },
    puzzle3CircuitOrLab: {
      title: 'Puzzle 3 — Locked Supply Cabinet (Physics Measurement)',
      prompt:
        'The locked supply cabinet has a digital sensor showing a $20\\text{ V}$ source connected to a $5\\,\\Omega$ resistor.',
      question:
        'Using Ohm’s Law ($I = \\frac{V}{R}$), calculate the current $I$ required to release the Brass Master Key:',
      options: ['$I = 4\\text{ A}$', '$I = 2\\text{ A}$', '$I = 100\\text{ A}$', '$I = 5\\text{ A}$'],
      correctIndex: 0,
      unlockedItemName: 'Brass Master Key',
      hint: 'Divide voltage $V = 20\\text{ V}$ by resistance $R = 5\\,\\Omega$.',
      explanation:
        'By Ohm’s Law, $I = \\frac{V}{R} = \\frac{20\\text{ V}}{5\\,\\Omega} = 4\\text{ A}$. Unlocking this cabinet gives you the Brass Master Key!',
    },
    puzzle4Logic: {
      title: 'Puzzle 4 — Mathematical Logic Board',
      prompt:
        'Look at the pattern formed by your first three clues: Chalkboard Code ($2, 4, 8$), Lab Digit ($6$), and Cabinet Current ($4\\text{ A}$).',
      question:
        'In the geometric sequence on the chalkboard ($2, 4, 8, 16, \\dots$), what is the 5th term needed to complete the Master Exit Sequence?',
      options: ['$32$', '$24$', '$64$', '$20$'],
      correctIndex: 0,
      masterSequenceCode: '248-64-32',
      hint: 'Each term is multiplied by $2$: $2 \\times 2 = 4$, $4 \\times 2 = 8$, $8 \\times 2 = 16$, $16 \\times 2 = ?$',
      explanation:
        'This is a Geometric Progression with first term $G_1 = 2$ and common ratio $r = 2$. The 5th term is $G_5 = 2 \\times 2^4 = 32$. Master Exit Sequence: 248-64-32.',
    },
  };
}

const STORAGE_KEY = 'elimika_play_progress_v1';

const DEFAULT_PROGRESS: ElimikaPlayProgress = {
  totalXp: 0,
  adventuresCompleted: [],
  roomsEscaped: [],
  unlockedBadges: [],
  collectedArtifacts: [],
  treasureHighScores: {},
  escapeBestTimes: {},
  savedTreasureSession: null,
};

export function loadPlayProgress(): ElimikaPlayProgress {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_PROGRESS };
    return {
      totalXp: typeof parsed.totalXp === 'number' ? parsed.totalXp : 0,
      adventuresCompleted: Array.isArray(parsed.adventuresCompleted) ? parsed.adventuresCompleted : [],
      roomsEscaped: Array.isArray(parsed.roomsEscaped) ? parsed.roomsEscaped : [],
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      collectedArtifacts: Array.isArray(parsed.collectedArtifacts) ? parsed.collectedArtifacts : [],
      treasureHighScores:
        parsed.treasureHighScores && typeof parsed.treasureHighScores === 'object'
          ? parsed.treasureHighScores
          : {},
      escapeBestTimes:
        parsed.escapeBestTimes && typeof parsed.escapeBestTimes === 'object' ? parsed.escapeBestTimes : {},
      savedTreasureSession: parsed.savedTreasureSession || null,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function savePlayProgress(next: ElimikaPlayProgress): ElimikaPlayProgress {
  if (typeof window === 'undefined') return next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}
