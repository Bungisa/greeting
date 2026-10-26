import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Coins,
  Compass,
  Cpu,
  FlaskConical,
  Gauge,
  Hammer,
  HelpCircle,
  Layers,
  Lightbulb,
  Maximize2,
  Microscope,
  Minimize2,
  Play,
  Redo2,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Undo2,
  Volume2,
  VolumeX,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  BridgeComponentType,
  BridgeMissionConfig,
  BridgeSimulationResult,
  CurriculumTopicRecord,
  FormLevel,
  GraphicsQuality,
  PlacedBridgePiece,
  ScoreBreakdownItem,
  StemBuilderProgress,
  StemDifficulty,
  StemSubject,
} from './stemBuilderTypes';
import {
  BRIDGE_COMPONENT_CATALOG,
  BRIDGE_MISSIONS,
  FORM_LEVELS,
  STEM_BUILDER_TOPICS,
  STEM_SUBJECTS,
  loadStemBuilderProgress,
  recordStemActivityCompletion,
  saveStemBuilderProgress,
} from './stemBuilderCurriculum';
import {
  addPillarsToBridgePieces,
  addTrussArchToBridgePieces,
  buildRecommendedBlueprintPieces,
  buildRoadDeckOnlyPieces,
  evaluateBridgeDesign,
  getDifficultyLoadAndBudget,
  validateComponentPlacement,
} from './bridgeStructuralSimulator';
import {
  Bridge3DViewport,
  BridgeBuildZone,
  FunnyVehicleType,
} from './Bridge3DViewport';
import { AdaptiveStemActivityView } from './AdaptiveStemActivityView';

interface StemBuilderGameProps {
  onBack: () => void;
}

type BuilderTab = 'choose_challenge' | 'bridge_missions' | 'progress_dashboard';
type ActiveSessionMode = 'none' | 'bridge_3d' | 'adaptive_lab';

interface ZoneQuestionItem {
  zone: BridgeBuildZone;
  title: string;
  subtitle: string;
  kiparaJoke: string;
  question: string;
  formulaHint: string;
  options: Array<{ label: string; value: string; isCorrect: boolean }>;
  explanation: string;
}

const FUNNY_VEHICLES: Array<{
  id: FunnyVehicleType;
  emoji: string;
  name: string;
  tagline: string;
}> = [
  {
    id: 'dala_dala',
    emoji: '🚐',
    name: 'Mbagala Dala-Dala',
    tagline: '"Kimbiza! सीट bado zipo!"',
  },
  {
    id: 'bodaboda',
    emoji: '🛵',
    name: 'Turbo Bodaboda',
    tagline: '"Supersonic Sinza Express!"',
  },
  {
    id: 'pilau_truck',
    emoji: '🚚',
    name: 'Mama Ntilie Pilau',
    tagline: '"Pilau ya moto isipoe!"',
  },
  {
    id: 'hippo_truck',
    emoji: '🦛',
    name: 'Kiboko Monster 4x4',
    tagline: '"Heavyweight Champion!"',
  },
];

// Procedural Web Audio Synthesizer for hilarious sound effects (No external MP3 needed!)
function playBongoSound(
  effect: 'horn' | 'build' | 'correct' | 'wrong' | 'splash' | 'fanfare',
  muted: boolean
) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (effect === 'horn') {
      // Funny two-tone Dala-Dala horn ("Piga Hon! Peep-Peep!")
      [0, 0.18].forEach((offset) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(440, now + offset);
        osc2.frequency.setValueAtTime(554.37, now + offset);
        gain.gain.setValueAtTime(0.14, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now + offset);
        osc2.start(now + offset);
        osc1.stop(now + offset + 0.15);
        osc2.stop(now + offset + 0.15);
      });
    } else if (effect === 'build' || effect === 'correct') {
      const notes = effect === 'correct' ? [523.25, 659.25, 783.99, 1046.5] : [330, 440, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.16, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.23);
      });
    } else if (effect === 'wrong' || effect === 'splash') {
      // Comical descending boing/slide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.45);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (effect === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      const times = [0, 0.11, 0.22, 0.34, 0.5, 0.64];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + times[idx]);
        gain.gain.setValueAtTime(0.18, now + times[idx]);
        gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + times[idx]);
        osc.stop(now + times[idx] + 0.26);
      });
    }
  } catch {
    // Ignore audio context restrictions
  }
}

const SUBJECT_ICON_MAP: Record<StemSubject, React.ReactNode> = {
  Mathematics: <Compass className="w-5 h-5" />,
  Physics: <Zap className="w-5 h-5" />,
  Chemistry: <FlaskConical className="w-5 h-5" />,
  Biology: <Microscope className="w-5 h-5" />,
  'Computer Science': <Cpu className="w-5 h-5" />,
  Geography: <Layers className="w-5 h-5" />,
};

const DIFFICULTY_META: Record<
  StemDifficulty,
  { label: string; badge: string; desc: string; border: string }
> = {
  Easy: {
    label: 'Easy',
    badge: 'Guided Mode',
    desc: 'Extra budget (+65%), lighter test load, 1-click question building & hints.',
    border: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
  Medium: {
    label: 'Medium',
    badge: 'Standard NECTA',
    desc: 'Generous budget (+45%), standard vehicle load, interactive bridge questions.',
    border: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  },
  Hard: {
    label: 'Hard',
    badge: 'Strict Engineering',
    desc: 'Tighter budget, heavier load, multi-step structural reasoning.',
    border: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  'Exam Challenge': {
    label: 'Exam Challenge',
    badge: 'Timed Mastery',
    desc: 'Peak load, NECTA/ACSEE exam-style calculation questions on the bridge.',
    border: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  },
};

export const StemBuilderGame: React.FC<StemBuilderGameProps> = ({ onBack }) => {
  // Navigation & persistent student progress
  const [activeTab, setActiveTab] = useState<BuilderTab>('choose_challenge');
  const [sessionMode, setSessionMode] = useState<ActiveSessionMode>('none');
  const [progress, setProgress] = useState<StemBuilderProgress>(() =>
    loadStemBuilderProgress()
  );
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(false);

  // 5-Step "Choose Your STEM Challenge" State
  const [selectedSubject, setSelectedSubject] = useState<StemSubject>('Mathematics');
  const [selectedForm, setSelectedForm] = useState<FormLevel>(2);
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    const initial = STEM_BUILDER_TOPICS.find(
      (t) => t.subject === 'Mathematics' && t.formLevel === 2
    );
    return initial ? initial.id : STEM_BUILDER_TOPICS[0]?.id || '';
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<StemDifficulty>('Easy');
  const [untimedPractice, setUntimedPractice] = useState<boolean>(
    () => loadStemBuilderProgress().untimedPracticeMode || false
  );
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>(
    () => loadStemBuilderProgress().graphicsQuality || 'Medium'
  );

  // Active 3D Bridge Session State
  const [activeMissionId, setActiveMissionId] = useState<string>(
    BRIDGE_MISSIONS[0]?.missionId || 'M01'
  );
  const [placedPieces, setPlacedPieces] = useState<PlacedBridgePiece[]>([]);
  const [undoStack, setUndoStack] = useState<PlacedBridgePiece[][]>([]);
  const [redoStack, setRedoStack] = useState<PlacedBridgePiece[][]>([]);
  const [selectedTool, setSelectedTool] = useState<
    BridgeComponentType | 'inspect_delete'
  >('road_deck');
  const [selectedStartNodeId, setSelectedStartNodeId] = useState<string | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [placementFeedback, setPlacementFeedback] = useState<{
    type: 'info' | 'error' | 'success';
    text: string;
  } | null>(null);

  // Direct-from-Bridge Interactive Question Modal & Funny Arcade State
  const [activeZoneQuestion, setActiveZoneQuestion] =
    useState<BridgeBuildZone | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [zoneAnswerFeedback, setZoneAnswerFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [vehicleType, setVehicleType] = useState<FunnyVehicleType>('dala_dala');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [showManualToolsDrawer, setShowManualToolsDrawer] = useState<boolean>(false);
  const [bongoTvComment, setBongoTvComment] = useState<string>(
    '🎙️ Mzee Kipara: "Tap ANY glowing button right on the 3D bridge to answer a quick question and build it instantly!"'
  );

  // Simulation, Math Checkpoint & Report Modal State
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] =
    useState<BridgeSimulationResult | null>(null);
  const [mathCorrect, setMathCorrect] = useState<boolean>(false);
  const [showPostReportModal, setShowPostReportModal] = useState<boolean>(false);
  const [labCompletionReport, setLabCompletionReport] = useState<{
    passed: boolean;
    totalScore: number;
    stars: 0 | 1 | 2 | 3;
    breakdown: ScoreBreakdownItem[];
    feedbackSummary: string;
    workedSolution: string;
  } | null>(null);

  // Filter topics for the selected subject + form + search query
  const availableTopicsForSelection = useMemo(() => {
    return STEM_BUILDER_TOPICS.filter((topic) => {
      const matchesSubject = topic.subject === selectedSubject;
      const matchesForm = topic.formLevel === selectedForm;
      const matchesSearch =
        !topicSearch.trim() ||
        topic.topic.toLowerCase().includes(topicSearch.toLowerCase()) ||
        topic.swahiliTerm.toLowerCase().includes(topicSearch.toLowerCase()) ||
        topic.subtopics.some((s) =>
          s.toLowerCase().includes(topicSearch.toLowerCase())
        );
      return matchesSubject && matchesForm && matchesSearch;
    });
  }, [selectedSubject, selectedForm, topicSearch]);

  useEffect(() => {
    const validForSubjectAndForm = STEM_BUILDER_TOPICS.filter(
      (t) => t.subject === selectedSubject && t.formLevel === selectedForm
    );
    if (
      validForSubjectAndForm.length > 0 &&
      !validForSubjectAndForm.some((t) => t.id === selectedTopicId)
    ) {
      setSelectedTopicId(validForSubjectAndForm[0].id);
    }
  }, [selectedSubject, selectedForm, selectedTopicId]);

  const selectedTopic: CurriculumTopicRecord | undefined = useMemo(
    () =>
      STEM_BUILDER_TOPICS.find((t) => t.id === selectedTopicId) ||
      availableTopicsForSelection[0],
    [selectedTopicId, availableTopicsForSelection]
  );

  const activeMission: BridgeMissionConfig = useMemo(
    () =>
      BRIDGE_MISSIONS.find((m) => m.missionId === activeMissionId) ||
      BRIDGE_MISSIONS[0],
    [activeMissionId]
  );

  const missionSettings = useMemo(
    () => getDifficultyLoadAndBudget(activeMission, selectedDifficulty),
    [activeMission, selectedDifficulty]
  );

  const activeMathCheckpoint = useMemo(
    () => activeMission.mathCheckpoint[selectedDifficulty],
    [activeMission, selectedDifficulty]
  );

  const currentTotalCost = useMemo(
    () => placedPieces.reduce((acc, p) => acc + p.cost, 0),
    [placedPieces]
  );

  // Check which of the 3 main bridge sections are already built!
  const deckBuilt = useMemo(() => {
    const order = activeMission.requiredDeckNodeOrder;
    for (let i = 0; i < order.length - 1; i++) {
      const a = order[i];
      const b = order[i + 1];
      const found = placedPieces.some(
        (p) =>
          p.type === 'road_deck' &&
          ((p.startNodeId === a && p.endNodeId === b) ||
            (p.startNodeId === b && p.endNodeId === a))
      );
      if (!found) return false;
    }
    return true;
  }, [activeMission, placedPieces]);

  const pillarsBuilt = useMemo(
    () => placedPieces.some((p) => p.type === 'concrete_pillar'),
    [placedPieces]
  );

  const trussBuilt = useMemo(
    () =>
      placedPieces.some(
        (p) => p.type === 'truss_strut' || p.type === 'steel_beam'
      ),
    [placedPieces]
  );

  // Dynamically build the 3 Interactive Bridge Questions for the 3 Bridge Zones (Deck, Pillars, Truss)
  const bridgeZoneQuestions: Record<BridgeBuildZone, ZoneQuestionItem> = useMemo(() => {
    const segCount = Math.max(1, activeMission.requiredDeckNodeOrder.length - 1);
    const segLength = Number((activeMission.spanMeters / segCount).toFixed(1));
    const halfLoad = Number((missionSettings.effectiveLoadKn / 2).toFixed(1));
    const cp = activeMathCheckpoint;
    const correctVal = cp.expectedValue;
    const wrong1 = Number((correctVal + (correctVal >= 10 ? 6 : 2.5)).toFixed(2));
    const wrong2 = Number(Math.max(1, correctVal - (correctVal >= 10 ? 4 : 1.5)).toFixed(2));
    const wrong3 = Number((correctVal * 1.5 + 2).toFixed(2));

    return {
      deck: {
        zone: 'deck',
        title: '🛣️ Build Step 1: Horizontal Road Deck',
        subtitle: `${activeMission.subject} • Form ${activeMission.formLevel} (${activeMission.spanMeters}m River Span)`,
        kiparaJoke:
          '🧔🏾‍♂️ Engineer Mzee Kipara: "Jibu swali hili rahisi tuweke lami! Bila barabara Dala-Dala itageuka nyambizi (submarine)!"',
        question: `The river is ${activeMission.spanMeters} meters wide and divided into ${segCount} equal road deck segments (${activeMission.requiredDeckNodeOrder.join(' → ')}). How long is each Road Deck segment?`,
        formulaHint: `Segment Length = Total River Span (${activeMission.spanMeters} m) ÷ ${segCount} segments`,
        options: [
          {
            label: `${segLength} meters per segment`,
            value: `${segLength}`,
            isCorrect: true,
          },
          {
            label: `${Number((segLength + 4).toFixed(1))} meters per segment`,
            value: `${segLength + 4}`,
            isCorrect: false,
          },
          {
            label: `${Number((activeMission.spanMeters * 2).toFixed(1))} meters per segment`,
            value: `${activeMission.spanMeters * 2}`,
            isCorrect: false,
          },
          {
            label: `1.5 meters per segment`,
            value: '1.5',
            isCorrect: false,
          },
        ],
        explanation: `Awesome! ${activeMission.spanMeters}m ÷ ${segCount} = ${segLength}m per segment! The entire Road Deck is now locked in across the river!`,
      },
      pillars: {
        zone: 'pillars',
        title: '🏛️ Build Step 2: Riverbed Concrete Pillars',
        subtitle: `Upward Support Reaction & Equilibrium (${missionSettings.effectiveLoadKn} kN Vehicle)`,
        kiparaJoke:
          '🐊 Mama Ntilie: "Weka nguzo za zege haraka! Mamba wanacheka chini ya daraja wakiona barabara inaelea hewani!"',
        question: `Our test vehicle weighs ${missionSettings.effectiveLoadKn} kN. If the two sides of the bridge share this downward weight equally in static equilibrium, how much upward reaction force does each side support?`,
        formulaHint: `Upward Support per Side = Total Load (${missionSettings.effectiveLoadKn} kN) ÷ 2`,
        options: [
          {
            label: `${halfLoad} kN upward force on each side`,
            value: `${halfLoad}`,
            isCorrect: true,
          },
          {
            label: `${missionSettings.effectiveLoadKn * 2} kN upward force`,
            value: `${missionSettings.effectiveLoadKn * 2}`,
            isCorrect: false,
          },
          {
            label: `0 kN (bridges float by magic)`,
            value: '0',
            isCorrect: false,
          },
          {
            label: `${Number((halfLoad + 35).toFixed(1))} kN upward force`,
            value: `${halfLoad + 35}`,
            isCorrect: false,
          },
        ],
        explanation: `Boom! By Newton's Law of Equilibrium (ΣFy = 0), ${missionSettings.effectiveLoadKn} kN ÷ 2 = ${halfLoad} kN! Heavy-duty Concrete Pillars have been dropped into the riverbed!`,
      },
      truss: {
        zone: 'truss',
        title: '🔺 Build Step 3: Overhead Steel Truss & Nitro Boost',
        subtitle: `Mission Curriculum Checkpoint (+25 Bonus Points & Nitro Flames!)`,
        kiparaJoke:
          '🚀 Captain Dala-Dala: "Jibu swali hili la mwisho tuweke vyuma vya juu na NITRO FLAMES kwenye exhaust!"',
        question: cp.question,
        formulaHint: cp.formulaHint,
        options: [
          {
            label: `${correctVal} ${cp.unit}`,
            value: `${correctVal}`,
            isCorrect: true,
          },
          {
            label: `${wrong1} ${cp.unit}`,
            value: `${wrong1}`,
            isCorrect: false,
          },
          {
            label: `${wrong2} ${cp.unit}`,
            value: `${wrong2}`,
            isCorrect: false,
          },
          {
            label: `${wrong3} ${cp.unit}`,
            value: `${wrong3}`,
            isCorrect: false,
          },
        ],
        explanation: cp.workedSolution,
      },
    };
  }, [activeMission, missionSettings.effectiveLoadKn, activeMathCheckpoint]);

  // Toggle full-screen 3D canvas expansion (works on mobile, desktop, and inside iframes)
  const handleToggleFullscreen = useCallback(() => {
    setIsNativeFullscreen((prev) => {
      const next = !prev;
      if (!next && typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      window.setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 60);
      return next;
    });
  }, []);

  // Open a direct-on-bridge question popup when user clicks a bridge zone!
  const handleTriggerZoneQuestion = useCallback(
    (zone: BridgeBuildZone) => {
      if (isTesting) return;
      setActiveZoneQuestion(zone);
      setSelectedOptionIdx(null);
      setZoneAnswerFeedback(null);
    },
    [isTesting]
  );

  // Execute building the bridge section after answering (or using Free Engineer Assist)
  const applyBridgeZoneBuild = useCallback(
    (zone: BridgeBuildZone) => {
      setUndoStack((prev) => [...prev, placedPieces]);
      setRedoStack([]);
      setSimulationResult(null);

      if (zone === 'deck') {
        const nextPieces = buildRoadDeckOnlyPieces(activeMission, placedPieces);
        setPlacedPieces(nextPieces);
        setBongoTvComment(
          '🛣️ WOYOOO! Road Deck built across the river! Now tap "🏛️ Step 2: River Pillars" or "🔺 Step 3: Overhead Truss" on the bridge!'
        );
      } else if (zone === 'pillars') {
        const nextPieces = addPillarsToBridgePieces(activeMission, placedPieces);
        setPlacedPieces(nextPieces);
        setBongoTvComment(
          '🏛️ HAKUNA MATATA! Concrete River Pillars locked into the riverbed! Crocodiles are shocked! Ready to DRIVE or add Step 3 Truss!'
        );
      } else if (zone === 'truss') {
        const nextPieces = addTrussArchToBridgePieces(activeMission, placedPieces);
        setPlacedPieces(nextPieces);
        setMathCorrect(true);
        setBongoTvComment(
          '🚀 NITRO ARCH ACTIVATED! Triangular Steel Truss + +25 Bonus Points unlocked! Hit "DRIVE ACROSS BRIDGE NOW!"'
        );
      }
      playBongoSound('build', soundMuted);
    },
    [activeMission, placedPieces, soundMuted]
  );

  // Handle selecting an answer option inside the Direct-on-Bridge Question Modal
  const handleSelectZoneAnswer = (optIdx: number) => {
    if (!activeZoneQuestion) return;
    setSelectedOptionIdx(optIdx);
    const qItem = bridgeZoneQuestions[activeZoneQuestion];
    const chosen = qItem.options[optIdx];
    if (!chosen) return;

    if (chosen.isCorrect) {
      playBongoSound('correct', soundMuted);
      applyBridgeZoneBuild(activeZoneQuestion);
      setZoneAnswerFeedback({
        correct: true,
        message: `🎉 HONGERA! Correct Answer! ${qItem.explanation}`,
      });
    } else {
      playBongoSound('wrong', soundMuted);
      setZoneAnswerFeedback({
        correct: false,
        message: `🙈 Ayayaa! Not quite! Check the green formula hint above and tap another option (or tap "⚡ Build It For Me" below)!`,
      });
    }
  };

  // Start a session from the 5-step Choose Your STEM Challenge screen
  const handleStartChallengeFromSelector = () => {
    if (!selectedTopic) return;
    if (selectedTopic.primaryActivityType === 'bridge_3d') {
      const mId =
        selectedTopic.bridgeMissionId || BRIDGE_MISSIONS[0].missionId;
      launchBridgeMission(mId);
    } else {
      setLabCompletionReport(null);
      setSessionMode('adaptive_lab');
    }
  };

  // Launch a specific 3D Bridge Mission directly in FULL-SCREEN mode
  const launchBridgeMission = (missionId: string) => {
    setActiveMissionId(missionId);
    setPlacedPieces([]);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedTool('road_deck');
    setSelectedStartNodeId(null);
    setSelectedPieceId(null);
    setSimulationResult(null);
    setIsTesting(false);
    setMathCorrect(false);
    setShowPostReportModal(false);
    setActiveZoneQuestion(null);
    setBongoTvComment(
      '🎙️ Mzee Kipara: "Karibu! Tap Step 1, Step 2, or Step 3 directly on the 3D bridge to answer a question and build your bridge!"'
    );
    setPlacementFeedback(null);
    setSessionMode('bridge_3d');
  };

  // Handle clicking/tapping a snap node in the 3D viewport:
  // If user is in manual tools drawer, connects nodes; otherwise opens the smart bridge question popup!
  const handleSelectNode = (nodeId: string) => {
    if (isTesting) return;

    // If user hasn't opened manual drawer, clicking any node on the bridge pops up the next unbuilt zone question!
    if (!showManualToolsDrawer) {
      const clickedNode = activeMission.nodes.find((n) => n.id === nodeId);
      if (clickedNode?.role === 'riverbed_base' && !pillarsBuilt) {
        handleTriggerZoneQuestion('pillars');
        return;
      }
      if (clickedNode?.role === 'truss_top' && !trussBuilt) {
        handleTriggerZoneQuestion('truss');
        return;
      }
      if (!deckBuilt) {
        handleTriggerZoneQuestion('deck');
        return;
      }
      if (!pillarsBuilt) {
        handleTriggerZoneQuestion('pillars');
        return;
      }
      if (!trussBuilt) {
        handleTriggerZoneQuestion('truss');
        return;
      }
    }

    if (selectedTool === 'inspect_delete') {
      setPlacementFeedback({
        type: 'info',
        text: 'Select a structural component to connect nodes.',
      });
      return;
    }

    if (!selectedStartNodeId) {
      setSelectedStartNodeId(nodeId);
      setPlacementFeedback({
        type: 'info',
        text: `Node ${nodeId} selected! Tap a second node on the bridge to connect them.`,
      });
      return;
    }

    if (selectedStartNodeId === nodeId) {
      setSelectedStartNodeId(null);
      setPlacementFeedback(null);
      return;
    }

    const validation = validateComponentPlacement(
      activeMission,
      placedPieces,
      selectedTool,
      selectedStartNodeId,
      nodeId
    );

    if (!validation.valid || !validation.piece) {
      playBongoSound('wrong', soundMuted);
      setPlacementFeedback({
        type: 'error',
        text: validation.reason || 'Cannot connect those two nodes.',
      });
      setSelectedStartNodeId(null);
      return;
    }

    const newPiece = validation.piece;
    const spec = BRIDGE_COMPONENT_CATALOG[newPiece.type];

    playBongoSound('build', soundMuted);
    setUndoStack((prev) => [...prev, placedPieces]);
    setRedoStack([]);
    setPlacedPieces((prev) => [...prev, newPiece]);
    setSelectedStartNodeId(null);
    setSimulationResult(null);
    setPlacementFeedback({
      type: 'success',
      text: `✅ Built ${spec.label} (${newPiece.startNodeId} → ${newPiece.endNodeId})!`,
    });
  };

  const handleRemovePiece = (pieceId: string) => {
    if (isTesting) return;
    setUndoStack((prev) => [...prev, placedPieces]);
    setRedoStack([]);
    setPlacedPieces((prev) => prev.filter((p) => p.id !== pieceId));
    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null);
    }
    setSimulationResult(null);
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || isTesting) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, placedPieces]);
    setPlacedPieces(previous);
    setUndoStack((prev) => prev.slice(0, -1));
    setSimulationResult(null);
    setSelectedStartNodeId(null);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || isTesting) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, placedPieces]);
    setPlacedPieces(next);
    setRedoStack((prev) => prev.slice(0, -1));
    setSimulationResult(null);
  };

  const handleResetBridge = () => {
    if (isTesting) return;
    setUndoStack((prev) => [...prev, placedPieces]);
    setRedoStack([]);
    setPlacedPieces([]);
    setSelectedStartNodeId(null);
    setSelectedPieceId(null);
    setSimulationResult(null);
    setBongoTvComment(
      '🧹 Bridge cleared! Tap Step 1 on the bridge to answer a question and rebuild!'
    );
  };

  const handleLoadStarterBlueprint = () => {
    if (isTesting) return;
    const blueprint = buildRecommendedBlueprintPieces(activeMission);
    playBongoSound('fanfare', soundMuted);
    setUndoStack((prev) => [...prev, placedPieces]);
    setRedoStack([]);
    setPlacedPieces(blueprint);
    setMathCorrect(true);
    setSimulationResult(null);
    setBongoTvComment(
      '✨ MIRACLE BRIDGE BUILT! Road Deck + River Pillars + Steel Truss Arch ready! Now tap "🚐 DRIVE ACROSS BRIDGE NOW!"'
    );
  };

  // Run 3D Structural Simulation & Test Vehicle Crossing
  const handleRunBridgeTest = () => {
    playBongoSound('horn', soundMuted);
    const result = evaluateBridgeDesign(
      activeMission,
      placedPieces,
      selectedDifficulty,
      mathCorrect
    );

    setSimulationResult(result);
    setIsTesting(true);

    if (result.passed) {
      setBongoTvComment(
        '📣 PIGA HONI! Look at it go! Even the river crocodiles are clapping for your bridge!'
      );
    } else {
      setBongoTvComment(
        '😱 MAMA YANGU WE! The bridge isn’t finished! Hold on tight — crocodiles are waiting below!'
      );
    }

    window.setTimeout(() => {
      setIsTesting(false);
      playBongoSound(result.passed ? 'fanfare' : 'splash', soundMuted);
      const linkedTopic =
        STEM_BUILDER_TOPICS.find((t) => t.id === activeMission.topicId) ||
        selectedTopic ||
        STEM_BUILDER_TOPICS[0];

      if (linkedTopic) {
        const { updated } = recordStemActivityCompletion(progress, {
          topic: linkedTopic,
          difficulty: selectedDifficulty,
          activityType: 'bridge_3d',
          score: result.totalScore,
          stars: result.stars,
          passed: result.passed,
        });
        setProgress(updated);
      }
      setShowPostReportModal(true);
    }, 2600);
  };

  const handleCompleteTutorial = () => {
    const updated: StemBuilderProgress = { ...progress, tutorialSeen: true };
    saveStemBuilderProgress(updated);
    setProgress(updated);
    setShowTutorialModal(false);
  };

  const handleGraphicsQualityChange = (q: GraphicsQuality) => {
    setGraphicsQuality(q);
    const updated: StemBuilderProgress = { ...progress, graphicsQuality: q };
    saveStemBuilderProgress(updated);
    setProgress(updated);
  };

  const handleUntimedPracticeToggle = (checked: boolean) => {
    setUntimedPractice(checked);
    const updated: StemBuilderProgress = {
      ...progress,
      untimedPracticeMode: checked,
    };
    saveStemBuilderProgress(updated);
    setProgress(updated);
  };

  // ============================================================================
  // RENDER 1: ACTIVE ADAPTIVE LAB SESSION (Chemistry, Biology, ICT, Geography, Physics Lab)
  // ============================================================================
  if (sessionMode === 'adaptive_lab' && selectedTopic) {
    return (
      <div className="min-h-screen bg-slate-950 text-white py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSessionMode('none')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Challenge Selector
              </button>
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase">
                  {selectedTopic.subject} • Form {selectedTopic.formLevel} •{' '}
                  {selectedDifficulty}
                </div>
                <h1 className="text-base sm:text-lg font-black text-white">
                  {selectedTopic.topic} ({selectedTopic.swahiliTerm})
                </h1>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              {untimedPractice
                ? 'Untimed Practice Mode'
                : `Est. ${selectedTopic.estimatedMinutes} mins`}
            </div>
          </div>

          <AdaptiveStemActivityView
            topic={selectedTopic}
            difficulty={selectedDifficulty}
            defaultFullscreen={true}
            onBackToMenu={() => setSessionMode('none')}
            onCompleteActivity={(res) => {
              playBongoSound(res.passed ? 'fanfare' : 'build', soundMuted);
              const { updated } = recordStemActivityCompletion(progress, {
                topic: selectedTopic,
                difficulty: selectedDifficulty,
                activityType: selectedTopic.primaryActivityType,
                score: res.totalScore,
                stars: res.stars,
                passed: res.passed,
              });
              setProgress(updated);
              setLabCompletionReport(res);
            }}
          />

          {labCompletionReport && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase">
                  {labCompletionReport.passed
                    ? 'STEM Challenge Mastered!'
                    : 'Investigation Report'}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= labCompletionReport.stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-black text-white">
                  {labCompletionReport.feedbackSummary}
                </h3>
                <span className="text-xl font-black text-amber-400">
                  {labCompletionReport.totalScore}/100 Pts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {labCompletionReport.breakdown.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="text-slate-400 font-bold">{item.label}</div>
                    <div className="text-base font-black text-cyan-400 mt-0.5">
                      {item.earned} / {item.max}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-amber-300">Worked Solution:</div>
                <p className="leading-relaxed">
                  {labCompletionReport.workedSolution}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSessionMode('none')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  Choose Another STEM Challenge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 2: FULL-SCREEN 3D BRIDGE BUILDER SESSION (100vw x 100vh Immersive Arcade View!)
  // ============================================================================
  if (sessionMode === 'bridge_3d') {
    const currentMissionIndex = BRIDGE_MISSIONS.findIndex(
      (m) => m.missionId === activeMission.missionId
    );
    const nextMission =
      currentMissionIndex >= 0 &&
      currentMissionIndex + 1 < BRIDGE_MISSIONS.length
        ? BRIDGE_MISSIONS[currentMissionIndex + 1]
        : null;
    const currentQuestionModalItem = activeZoneQuestion
      ? bridgeZoneQuestions[activeZoneQuestion]
      : null;

    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
        {/* 1. Sleek Floating Top HUD Bar */}
        <div className="relative z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSessionMode('none')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-black border border-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Full Screen
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                  Mission #{activeMission.missionNumber} • Form{' '}
                  {activeMission.formLevel}
                </span>
                <span className="text-xs font-black text-white truncate max-w-[200px] sm:max-w-none">
                  {activeMission.title} ({activeMission.spanMeters}m River)
                </span>
              </div>
            </div>
          </div>

          {/* Live funny Bongo commentary ticker in the center */}
          <div className="hidden xl:flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold max-w-md truncate">
            <span>{bongoTvComment}</span>
          </div>

          {/* Right HUD Controls: Vehicle Picker, Horn, Sound, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Funny Vehicle Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {FUNNY_VEHICLES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVehicleType(v.id);
                    playBongoSound('horn', soundMuted);
                    setBongoTvComment(`${v.emoji} ${v.name}: ${v.tagline}`);
                  }}
                  title={`${v.name} — ${v.tagline}`}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vehicleType === v.id
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{v.emoji}</span>
                  <span className="hidden md:inline ml-1">{v.name.split(' ')[1]}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => playBongoSound('horn', false)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black cursor-pointer"
              title="Honk Dala-Dala Horn!"
            >
              📣 Piga Hon!
            </button>

            <button
              type="button"
              onClick={() => setSoundMuted((m) => !m)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              aria-label={isNativeFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/50 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              title="Expand 3D Bridge Canvas to Full Mobile Screen"
            >
              {isNativeFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. FULL-SCREEN 3D BRIDGE VIEWPORT (Occupies 100% of remaining height or 100dvh when Fullscreen toggled) */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <Bridge3DViewport
            mission={activeMission}
            pieces={placedPieces}
            selectedTool={selectedTool}
            selectedStartNodeId={selectedStartNodeId}
            selectedPieceId={selectedPieceId}
            simulationResult={simulationResult}
            isTesting={isTesting}
            onSelectNode={handleSelectNode}
            onSelectPiece={setSelectedPieceId}
            onRemovePiece={handleRemovePiece}
            onTriggerZoneQuestion={handleTriggerZoneQuestion}
            deckBuilt={deckBuilt}
            pillarsBuilt={pillarsBuilt}
            trussBuilt={trussBuilt}
            vehicleType={vehicleType}
            nitroActive={mathCorrect}
            fullScreenMode={true}
            isFullscreen={isNativeFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onRunBridgeTest={handleRunBridgeTest}
            onResetBridge={handleResetBridge}
          >
            {/* 4. DIRECT-ON-BRIDGE INTERACTIVE QUESTION MODAL (Rendered INSIDE Bridge3DViewport so it always displays in Fullscreen!) */}
            {currentQuestionModalItem && (
              <div className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="max-w-lg w-full rounded-3xl bg-slate-900 border-2 border-sky-400/80 p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase">
                        Answer to Build Bridge Section Instantly!
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                        {currentQuestionModalItem.title}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {currentQuestionModalItem.subtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveZoneQuestion(null)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Funny Character Speech Bubble */}
                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-xs text-amber-200 font-semibold">
                    {currentQuestionModalItem.kiparaJoke}
                  </div>

                  {/* Question & Formula Hint */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {currentQuestionModalItem.question}
                    </p>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                      💡 Easy Hint: {currentQuestionModalItem.formulaHint}
                    </div>
                  </div>

                  {/* 4 Multiple-Choice Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQuestionModalItem.options.map((opt, idx) => {
                      const isPicked = selectedOptionIdx === idx;
                      const showGreen =
                        zoneAnswerFeedback?.correct && opt.isCorrect;
                      const showRed =
                        isPicked && zoneAnswerFeedback && !zoneAnswerFeedback.correct;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectZoneAnswer(idx)}
                          className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            showGreen
                              ? 'bg-emerald-500 text-slate-950 border-white shadow-lg shadow-emerald-500/30'
                              : showRed
                              ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                              : 'bg-slate-950 hover:bg-slate-800 border-slate-700 hover:border-sky-400 text-white'
                          }`}
                        >
                          <span>
                            <strong className="text-amber-400 mr-1.5">
                              {String.fromCharCode(65 + idx)}.
                            </strong>
                            {opt.label}
                          </span>
                          {showGreen && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback & Instant Continue / Free Assist Buttons */}
                  {zoneAnswerFeedback && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs font-bold ${
                        zoneAnswerFeedback.correct
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                          : 'bg-rose-950/80 border-rose-400 text-rose-200'
                      }`}
                    >
                      {zoneAnswerFeedback.message}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeZoneQuestion) {
                          applyBridgeZoneBuild(activeZoneQuestion);
                          setActiveZoneQuestion(null);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-400/50 text-violet-200 text-xs font-black cursor-pointer"
                    >
                      ⚡ Free Engineer Assist (Build Section For Me!)
                    </button>

                    {zoneAnswerFeedback?.correct && (
                      <button
                        type="button"
                        onClick={() => setActiveZoneQuestion(null)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                      >
                        Awesome! Back to 3D Bridge →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Post-Simulation Celebration / Funny River Splash Modal (Rendered INSIDE Bridge3DViewport so it works in Fullscreen!) */}
            {showPostReportModal && simulationResult && (
              <div className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="max-w-lg w-full rounded-3xl bg-slate-900 border-2 border-slate-700 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        simulationResult.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {simulationResult.passed
                        ? '🏆 WOYOOO! BRIDGE PASSED!'
                        : '🐊 SPLASH IN THE CROCODILE RIVER!'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starNum) => (
                        <Star
                          key={starNum}
                          className={`w-6 h-6 ${
                            starNum <= simulationResult.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">
                      {activeMission.title} — {simulationResult.totalScore}/100 Pts
                    </h2>
                    <p className="text-xs text-slate-200 mt-1 font-semibold">
                      {simulationResult.feedbackSummary}
                    </p>
                  </div>

                  {/* If failed, provide a 1-click "Magic Fix & Drive Again" button! */}
                  {!simulationResult.passed && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostReportModal(false);
                        handleLoadStarterBlueprint();
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>🔧 1-Tap Magic Fix Bridge &amp; Try Again!</span>
                    </button>
                  )}

                  {/* 100-Point Rubric Breakdown */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {simulationResult.breakdown.map((bItem, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800"
                      >
                        <div className="text-slate-400 font-semibold">
                          {bItem.label}
                        </div>
                        <div className="text-base font-black text-emerald-400 mt-0.5">
                          {bItem.earned} / {bItem.max}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {bItem.explanation}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Funny Commentary & Diagnostics */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-amber-300">
                      Bongo Bridge TV Replay Notes:
                    </div>
                    <ul className="space-y-1 text-slate-300">
                      {simulationResult.detailedReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setShowPostReportModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                    >
                      Back to Bridge
                    </button>
                    <div className="flex items-center gap-2">
                      {nextMission && (
                        <button
                          onClick={() => {
                            setShowPostReportModal(false);
                            launchBridgeMission(nextMission.missionId);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          Next Bridge (#{nextMission.missionNumber})
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowPostReportModal(false);
                          setSessionMode('none');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        Main Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Bridge3DViewport>

          {/* Floating Mobile Commentary Banner */}
          <div className="xl:hidden absolute top-14 left-3 right-3 z-20 pointer-events-none flex justify-center">
            <div className="px-3 py-1 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-200 text-[11px] font-bold text-center shadow-lg max-w-md truncate">
              {bongoTvComment}
            </div>
          </div>

          {/* Optional Manual Node-by-Node Drawer (for students who also want manual beam placement) */}
          {showManualToolsDrawer && (
            <div className="absolute top-14 right-3 z-30 w-80 max-w-[92vw] rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-700 p-3.5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Hammer className="w-3.5 h-3.5" />
                  Manual Node Builder
                </span>
                <button
                  onClick={() => setShowManualToolsDrawer(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              {placementFeedback && (
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
                  {placementFeedback.text}
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  Object.keys(BRIDGE_COMPONENT_CATALOG) as BridgeComponentType[]
                ).map((typeKey) => {
                  const spec = BRIDGE_COMPONENT_CATALOG[typeKey];
                  const isSelected = selectedTool === typeKey;
                  return (
                    <button
                      key={typeKey}
                      onClick={() => setSelectedTool(typeKey)}
                      className={`p-2 rounded-xl border text-left text-xs font-bold cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {spec.label}
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-400">
                Tap any two nodes on the 3D bridge (or below) to connect:
              </div>
              <div className="flex flex-wrap gap-1">
                {activeMission.nodes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleSelectNode(n.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      selectedStartNodeId === n.id
                        ? 'bg-violet-600 border-violet-300 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {n.id}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <Undo2 className="w-3 h-3" /> Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <Redo2 className="w-3 h-3" /> Redo
                </button>
              </div>
            </div>
          )}

          {/* 3. Bottom Floating Action Dock (Direct Question-Build Buttons + GIANT DRIVE Button) */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl px-3 sm:px-4 py-2.5 shadow-2xl">
            {/* Direct Build-by-Question Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleTriggerZoneQuestion('deck')}
                disabled={isTesting}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  deckBuilt
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/25'
                }`}
              >
                <span>{deckBuilt ? '✅' : '🛣️'}</span>
                <span>Step 1: Road Deck (Qn)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerZoneQuestion('pillars')}
                disabled={isTesting}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  pillarsBuilt
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                    : 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-lg shadow-teal-400/25'
                }`}
              >
                <span>{pillarsBuilt ? '✅' : '🏛️'}</span>
                <span>Step 2: River Pillars (Qn)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerZoneQuestion('truss')}
                disabled={isTesting}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  trussBuilt
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/25'
                }`}
              >
                <span>{trussBuilt ? '✅' : '🔺'}</span>
                <span>Step 3: Steel Truss + Nitro (Qn)</span>
              </button>

              <button
                type="button"
                onClick={handleLoadStarterBlueprint}
                disabled={isTesting}
                className="px-3 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/45 border border-violet-400/50 text-violet-200 text-xs font-black flex items-center gap-1 cursor-pointer"
                title="Instantly build the complete 3-Star Bridge!"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>1-Tap Full Bridge</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualToolsDrawer((v) => !v)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                🛠️ Manual Nodes
              </button>

              {placedPieces.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetBridge}
                  disabled={isTesting}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-300 cursor-pointer"
                  title="Clear Bridge"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* GIANT DRIVE / TEST BRIDGE BUTTON */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleRunBridgeTest}
                disabled={isTesting}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isTesting
                    ? '🚐 CROSSING BRIDGE...'
                    : '🚐 DRIVE ACROSS BRIDGE NOW!'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 3: MAIN HUB — "CHOOSE YOUR STEM CHALLENGE", 15 MISSIONS & DASHBOARD
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Top Header */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800/80 px-4 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0"
              title="Back to Elimika Play Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  Full-Screen 3D Bridge Game &amp; STEM Virtual Lab
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  Forms 1–6 • Click Bridge to Answer &amp; Build!
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                STEM Builder: Build the Bridge (Bongo Edition)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Tap directly on the full-screen 3D bridge to pop up STEM questions, construct your bridge, and race the Dala-Dala over the crocodile river!
              </p>
            </div>
          </div>

          {/* Student Gamification Summary Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Engineering XP
                </div>
                <div className="text-xs font-black text-white">
                  {progress.xp.toLocaleString()} XP
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Coins className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  STEM Coins
                </div>
                <div className="text-xs font-black text-white">
                  {progress.coins.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Badges
                </div>
                <div className="text-xs font-black text-white">
                  {progress.unlockedBadges.length} Unlocked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GIANT 1-CLICK INSTANT PLAY HERO BANNER */}
        <div className="max-w-7xl mx-auto mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-950/90 via-indigo-950/90 to-emerald-950/90 border-2 border-sky-400/50 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center lg:text-left">
            <div className="text-xs font-black uppercase text-amber-300">
              🎮 Instant Full-Screen 3D Action — Bridge &amp; Animated Science Lab!
            </div>
            <div className="text-sm sm:text-base font-black text-white">
              Jump straight into the Full-Screen 3D Bridge Game or the 3D Interactive &amp; Animated Lab with Full-Screen Problem Solving!
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => launchBridgeMission(BRIDGE_MISSIONS[0].missionId)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY FULL-SCREEN 3D BRIDGE!</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const chemTopic =
                  STEM_BUILDER_TOPICS.find((t) => t.subject === 'Chemistry') ||
                  STEM_BUILDER_TOPICS[0];
                if (chemTopic) {
                  setSelectedSubject(chemTopic.subject);
                  setSelectedForm(chemTopic.formLevel);
                  setSelectedTopicId(chemTopic.id);
                }
                setLabCompletionReport(null);
                setSessionMode('adaptive_lab');
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>PLAY FULL-SCREEN 3D LAB!</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('choose_challenge')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'choose_challenge'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              Choose Your STEM Challenge
            </button>
            <button
              onClick={() => setActiveTab('bridge_missions')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'bridge_missions'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              All 15 3D Bridge Missions (Forms 1–6)
            </button>
            <button
              onClick={() => setActiveTab('progress_dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'progress_dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Student Progress &amp; Badges
            </button>
          </div>

          <button
            onClick={() => setShowTutorialModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-bold"
          >
            <HelpCircle className="w-4 h-4" />
            Interactive Tutorial
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: CHOOSE YOUR STEM CHALLENGE (5-STEP CURRICULUM SELECTOR)       */}
      {/* ==================================================================== */}
      {activeTab === 'choose_challenge' && (
        <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Curriculum-Driven Configuration
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Choose Your STEM Challenge
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Configure your subject, form level, syllabus topic, and difficulty before launching your 3D engineering or virtual lab session.
            </p>
          </div>

          {/* STEP 1: SELECT A SUBJECT */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  1
                </span>
                Select a Subject
              </h3>
              <span className="text-xs text-slate-400">
                6 Secondary STEM Subjects Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STEM_SUBJECTS.map((subj) => {
                const isSelected = selectedSubject === subj.id;
                return (
                  <button
                    key={subj.id}
                    onClick={() => setSelectedSubject(subj.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                      {SUBJECT_ICON_MAP[subj.id]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-sm text-white">
                          {subj.label}{' '}
                          <span className="text-xs font-normal text-slate-400">
                            ({subj.swahiliName})
                          </span>
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {subj.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: SELECT A FORM LEVEL */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  2
                </span>
                Select a Form Level (Forms 1–6)
              </h3>
              <span className="text-xs text-amber-300 font-bold">
                Currently Selected: Form {selectedForm}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {FORM_LEVELS.map((fItem) => {
                const isSelected = selectedForm === fItem.level;
                const countForForm = STEM_BUILDER_TOPICS.filter(
                  (t) =>
                    t.subject === selectedSubject && t.formLevel === fItem.level
                ).length;

                return (
                  <button
                    key={fItem.level}
                    onClick={() => setSelectedForm(fItem.level)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/80 text-slate-200 border-slate-800 hover:border-slate-700 font-bold'
                    }`}
                  >
                    <div className="text-sm">{fItem.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isSelected
                          ? 'text-slate-900 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {countForForm} {countForForm === 1 ? 'Topic' : 'Topics'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 3: SELECT A SPECIFIC TOPIC */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  3
                </span>
                Select a Specific Topic (Form {selectedForm} {selectedSubject})
              </h3>

              {/* Topic Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Search topic or subtopic..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {availableTopicsForSelection.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-sm font-bold text-slate-300">
                  No topics matched &ldquo;{topicSearch}&rdquo; in Form{' '}
                  {selectedForm}.
                </p>
                <button
                  onClick={() => setTopicSearch('')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-amber-300"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {availableTopicsForSelection.map((topic) => {
                  const isSelected = selectedTopic?.id === topic.id;
                  const bestScore = progress.bestScoresByTopic[topic.id];

                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              topic.primaryActivityType === 'bridge_3d'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {topic.primaryActivityType === 'bridge_3d'
                              ? '3D Bridge Engineering'
                              : topic.primaryActivityType.replace('_', ' ')}
                          </span>

                          {topic.curriculumVerified ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                              ✓ Verified TIE Syllabus
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold">
                              Curriculum Alignment Pending Verification
                            </span>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-black text-white">
                            {topic.topic}{' '}
                            <span className="text-xs font-normal text-slate-400">
                              ({topic.swahiliTerm})
                            </span>
                          </h4>
                          {bestScore !== undefined && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black shrink-0">
                              Best: {bestScore}%
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {topic.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {topic.subtopics.map((sub, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[72%]">
                          Objective: {topic.learningObjectives[0]}
                        </span>
                        <span className="font-bold text-amber-400 shrink-0">
                          ~{topic.estimatedMinutes} mins
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* STEP 4: SELECT DIFFICULTY & GRAPHICS SETTINGS */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  4
                </span>
                Select Difficulty &amp; Session Preferences
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={untimedPractice}
                    onChange={(e) =>
                      handleUntimedPracticeToggle(e.target.checked)
                    }
                    className="rounded accent-amber-500"
                  />
                  Untimed Practice Mode
                </label>

                <div className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">
                    3D Graphics:
                  </span>
                  {(['Low', 'Medium', 'High'] as GraphicsQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleGraphicsQualityChange(q)}
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        graphicsQuality === q
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(DIFFICULTY_META) as StemDifficulty[]).map((diff) => {
                const meta = DIFFICULTY_META[diff];
                const isSelected = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/40 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white">
                        {meta.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.border}`}
                      >
                        {meta.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {meta.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 5: CHALLENGE SUMMARY CARD & START BUTTON */}
          {selectedTopic && (
            <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase">
                      Step 5 • Ready to Launch
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-bold">
                      {selectedTopic.subject} • Form {selectedTopic.formLevel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 uppercase">
                      {selectedTopic.primaryActivityType === 'bridge_3d'
                        ? '3D Bridge Simulation'
                        : selectedTopic.primaryActivityType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {selectedTopic.topic} ({selectedTopic.swahiliTerm})
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {selectedTopic.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <div className="font-bold text-amber-400 uppercase text-[10px]">
                        Skills You Will Practice
                      </div>
                      <ul className="mt-1 space-y-1 text-slate-300">
                        {selectedTopic.learningObjectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                      <div className="font-bold text-cyan-400 uppercase text-[10px]">
                        Session Configuration
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Difficulty Mode:</span>
                        <span className="font-bold text-white">
                          {selectedDifficulty}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Estimated Duration:</span>
                        <span className="font-bold text-white">
                          {untimedPractice
                            ? 'Untimed Practice'
                            : `~${selectedTopic.estimatedMinutes} Minutes`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        {selectedTopic.curriculumReference ||
                          'Aligned with Secondary STEM Competence'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col items-stretch gap-3">
                  <button
                    onClick={handleStartChallengeFromSelector}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    START CHALLENGE
                  </button>
                  <div className="text-center text-[11px] text-slate-400">
                    {selectedTopic.primaryActivityType === 'bridge_3d'
                      ? `Launches 3D Bridge Mission (${
                          selectedTopic.bridgeMissionId || 'M01'
                        }) with interactive WebGL physics`
                      : `Launches Interactive ${selectedTopic.primaryActivityType.replace(
                          '_',
                          ' '
                        )} for Form ${selectedTopic.formLevel}`}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ALL 15 3D BRIDGE MISSIONS (FORMS 1–6 CAMPAIGN)                */}
      {/* ==================================================================== */}
      {activeTab === 'bridge_missions' && (
        <div className="max-w-7xl mx-auto px-4 pt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                15 Progressive Engineering Levels
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                3D Bridge Construction Campaign (Forms 1–6)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Select any mission below to jump directly into the 3D Bridge Builder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BRIDGE_MISSIONS.map((mission) => {
              const stars = progress.bestStarsByTopic[mission.topicId] || 0;
              const bestScore = progress.bestScoresByTopic[mission.topicId];

              return (
                <div
                  key={mission.missionId}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase">
                        Mission #{mission.missionNumber} • Form{' '}
                        {mission.formLevel}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-base font-black text-white">
                      {mission.title}
                    </h3>
                    <div className="text-xs font-semibold text-cyan-400">
                      {mission.subject} • {mission.engineerRankTitle}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {mission.missionBrief}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-slate-500">Span</div>
                        <div className="font-black text-white">
                          {mission.spanMeters}m
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-slate-500">Load</div>
                        <div className="font-black text-cyan-300">
                          {mission.vehicleLoadKn} kN
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-slate-500">Budget</div>
                        <div className="font-black text-emerald-300">
                          {mission.baseBudget.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {bestScore !== undefined ? (
                        <span className="text-xs font-bold text-emerald-400">
                          Best Score: {bestScore}/100
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Not attempted yet
                        </span>
                      )}

                      <button
                        onClick={() => launchBridgeMission(mission.missionId)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5"
                      >
                        Build in 3D
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: STUDENT PROGRESS DASHBOARD & BADGES                           */}
      {/* ==================================================================== */}
      {activeTab === 'progress_dashboard' && (
        <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold">
                Missions Completed
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {progress.completedMissionIds.length} / {BRIDGE_MISSIONS.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                3D Bridge Engineering Campaign
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold">
                Topics Mastered
              </div>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {progress.completedTopicIds.length} /{' '}
                {STEM_BUILDER_TOPICS.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Across Forms 1–6 Subjects
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold">
                Total Engineering XP
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {progress.xp.toLocaleString()} XP
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Persistent Local Profile
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-bold">
                Unlocked Badges
              </div>
              <div className="text-2xl font-black text-purple-400 mt-1">
                {progress.unlockedBadges.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Achievement Milestones
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white">
              Earned Badges &amp; Recent STEM Sessions
            </h3>

            {progress.unlockedBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.unlockedBadges.map((b, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black"
                  >
                    🏅 {b}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Complete any 3D Bridge Mission or Virtual Lab to unlock your first STEM Builder badge!
              </p>
            )}

            {progress.recentSessions.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Recent Sessions
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {progress.recentSessions.slice(0, 6).map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {sess.topicName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sess.subject} • Form {sess.formLevel} •{' '}
                          {sess.difficulty}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-400">
                          {sess.score}/100
                        </div>
                        <div className="text-[10px] text-amber-400">
                          {'★'.repeat(sess.stars)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* INTERACTIVE TUTORIAL MODAL                                           */}
      {/* ==================================================================== */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase">
                Quick Engineering Guide
              </span>
              <button
                onClick={handleCompleteTutorial}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <h3 className="text-lg font-black text-white">
              How to Play STEM Builder: Build the Bridge
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">
                  1. Connect Anchor &amp; Support Nodes in 3D
                </strong>
                Select a component (Road Deck, Steel Beam, Truss Strut, Pillar, or Cable), then tap a starting node and an ending node in the 3D viewport (or use the Quick Node Bar underneath the canvas).
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-cyan-400 block mb-0.5">
                  2. Build Triangles &amp; Continuous Road Decks
                </strong>
                Every bridge needs a continuous horizontal Road Deck from Left Bank (L0) to Right Bank (R0). Use diagonal Truss Struts or Concrete Pillars so intermediate deck joints (D1, D2, D3) are supported!
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">
                  3. Solve the STEM Checkpoint &amp; Test Your Bridge
                </strong>
                Solve the curriculum calculation checkpoint for +25 points, then press <strong>TEST BRIDGE IN 3D</strong> to watch the vehicle cross and inspect the real-time stress heatmap.
              </div>
            </div>

            <button
              onClick={handleCompleteTutorial}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
            >
              Got It — Let’s Build!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StemBuilderGame;
