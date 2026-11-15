import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Bot,
  Clock,
  Flame,
  GraduationCap,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { PaperRecord, TIE_CURRICULUM_SUBJECTS } from '../data/curriculumData';
import {
  ElimikaPlayProgress,
  GameDifficulty,
  GameQuestion,
  getAvailableSubjectsForClass,
  getAvailableTopicsForClassSubject,
  getQuestionsForTreasureHunt,
  loadPlayProgress,
  PLAY_CLASSES,
  savePlayProgress,
} from './gameDataAndStorage';
import { soundEngine } from './gameSoundEngine';
import { TugCameraPreset, TugOfWar3DScene } from './TugOfWar3DScene';
import { MathText } from '../utils/mathRenderer';

export type TugGameMode = 'classroom' | 'vs_ai' | 'quick_play' | 'teacher';
export type TugQuestionType = 'ALL' | 'multiple_choice' | 'true_false' | 'short_numerical';
export type TugScreen =
  | '1_intro'
  | '2_mode'
  | '3_curriculum'
  | '4_teams'
  | '5_gameplay'
  | '8_results';

export interface TugFormattedQuestion {
  id: string;
  kind: 'multiple_choice' | 'true_false' | 'short_numerical';
  topic: string;
  difficulty: GameDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  numericalAnswer?: string;
  explanation: string;
  sourceLabel: string;
  xpReward: number;
}

interface TugOfWarGameProps {
  initialClass?: string;
  initialSubject?: string;
  initialTopic?: string;
  allPapers?: PaperRecord[];
  onExitToHub: () => void;
  onProgressUpdate?: (p: ElimikaPlayProgress) => void;
}

/**
 * Builds a diverse, non-repeating pool of Multiple Choice, True/False, and Short Numerical questions
 * where every single question index represents a distinct curriculum problem.
 */
function buildTugOfWarQuestionPool(
  baseQuestions: GameQuestion[],
  cls: string,
  subject: string,
  difficulty: GameDifficulty,
  filterType: TugQuestionType
): TugFormattedQuestion[] {
  const mcPool: TugFormattedQuestion[] = [];
  const tfPool: TugFormattedQuestion[] = [];
  const numPool: TugFormattedQuestion[] = [];
  const mixedDistinctPool: TugFormattedQuestion[] = [];

  baseQuestions.forEach((q, idx) => {
    const mcItem: TugFormattedQuestion = {
      id: `mc-${q.id}-${idx}`,
      kind: 'multiple_choice',
      topic: q.topic || subject,
      difficulty: q.difficulty || difficulty,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      sourceLabel: q.sourceLabel || `Sample Practice — ${cls} ${subject} Aligned`,
      xpReward: q.xpReward || 60,
    };
    mcPool.push(mcItem);

    const rightOpt = q.options[q.correctIndex] || q.options[0] || '';
    const wrongOpt = q.options[(q.correctIndex + 1) % Math.max(1, q.options.length)] || '';
    const makeTrue = idx % 2 === 0;
    const candidateStatement = makeTrue ? rightOpt : wrongOpt;
    let tfItem: TugFormattedQuestion | null = null;
    if (candidateStatement) {
      tfItem = {
        id: `tf-${q.id}-${idx}`,
        kind: 'true_false',
        topic: q.topic || subject,
        difficulty: q.difficulty || difficulty,
        question: `True or False: For "${q.question}", the correct answer is ${candidateStatement}.`,
        options: ['True', 'False'],
        correctIndex: makeTrue ? 0 : 1,
        explanation: `${makeTrue ? 'True!' : `False! The correct answer is ${rightOpt}.`} ${q.explanation}`,
        sourceLabel: q.sourceLabel || `Sample Practice — ${cls} ${subject} Aligned`,
        xpReward: 55,
      };
      tfPool.push(tfItem);
    }

    const cleanNumMatch = rightOpt
      .replace(/\$|\\text\{[^}]*\}|[a-zA-Z%=,:;()°^\s]+/g, '')
      .match(/^-?\d+(\.\d+)?$/);
    let numItem: TugFormattedQuestion | null = null;
    if (cleanNumMatch) {
      const numericVal = cleanNumMatch[0];
      numItem = {
        id: `num-${q.id}-${idx}`,
        kind: 'short_numerical',
        topic: q.topic || subject,
        difficulty: q.difficulty || difficulty,
        question: `${q.question} (Enter the numerical value only)`,
        options: [numericVal],
        correctIndex: 0,
        numericalAnswer: numericVal,
        explanation: `Numerical Answer: ${numericVal}. ${q.explanation}`,
        sourceLabel: q.sourceLabel || `Sample Practice — ${cls} ${subject} Aligned`,
        xpReward: 75,
      };
      numPool.push(numItem);
    }

    // In ALL mode, pick exactly ONE format per distinct base question so adjacent questions NEVER repeat!
    if (idx % 5 === 3 && tfItem) {
      mixedDistinctPool.push(tfItem);
    } else if (idx % 5 === 4 && numItem) {
      mixedDistinctPool.push(numItem);
    } else {
      mixedDistinctPool.push(mcItem);
    }
  });

  // Dedicated Short Numerical curriculum sample questions
  const sampleNumericalFallback: TugFormattedQuestion[] = [
    {
      id: `num-fallback-1-${cls}`,
      kind: 'short_numerical',
      topic: subject,
      difficulty,
      question:
        subject.toLowerCase().includes('phys')
          ? 'A resistor of $4\\,\\Omega$ carries a current of $3\\text{ A}$. Calculate the potential difference $V$ in Volts ($V = IR$).'
          : subject.toLowerCase().includes('chem')
          ? 'What is the number of neutrons in a Sodium atom $^{23}_{11}\\text{Na}$ ($A = 23, Z = 11$)?'
          : subject.toLowerCase().includes('bio')
          ? 'How many chambers does a normal mammalian heart have?'
          : subject.toLowerCase().includes('geo')
          ? 'How many degrees of longitude does the Earth rotate in $1\\text{ hour}$?'
          : 'Solve for $x$: $3x + 7 = 22$. Enter the numerical value of $x$.',
      options: [
        subject.toLowerCase().includes('phys') || subject.toLowerCase().includes('chem')
          ? '12'
          : subject.toLowerCase().includes('bio')
          ? '4'
          : subject.toLowerCase().includes('geo')
          ? '15'
          : '5',
      ],
      correctIndex: 0,
      numericalAnswer:
        subject.toLowerCase().includes('phys') || subject.toLowerCase().includes('chem')
          ? '12'
          : subject.toLowerCase().includes('bio')
          ? '4'
          : subject.toLowerCase().includes('geo')
          ? '15'
          : '5',
      explanation:
        subject.toLowerCase().includes('phys')
          ? 'By Ohm’s Law, $V = I \\times R = 3 \\times 4 = 12\\text{ V}$.'
          : subject.toLowerCase().includes('chem')
          ? 'Neutrons $N = A - Z = 23 - 11 = 12$.'
          : subject.toLowerCase().includes('bio')
          ? 'A mammalian heart has 4 chambers: left atrium, right atrium, left ventricle, and right ventricle.'
          : subject.toLowerCase().includes('geo')
          ? 'The Earth rotates $360^\\circ$ in $24\\text{ hours}$, which is $\\frac{360}{24} = 15^\\circ$ per hour.'
          : '$3x = 22 - 7 = 15 \\Rightarrow x = 5$.',
      sourceLabel: `Sample Practice — ${cls} ${subject} Curriculum Aligned`,
      xpReward: 70,
    },
    {
      id: `num-fallback-2-${cls}`,
      kind: 'short_numerical',
      topic: subject,
      difficulty,
      question:
        'In an Arithmetic Progression with first term $a_1 = 4$ and common difference $d = 3$, what is the 5th term?',
      options: ['16'],
      correctIndex: 0,
      numericalAnswer: '16',
      explanation: '$A_5 = a_1 + (5 - 1)d = 4 + 4 \\times 3 = 16$.',
      sourceLabel: `Sample Practice — ${cls} Curriculum Aligned`,
      xpReward: 70,
    },
    {
      id: `num-fallback-3-${cls}`,
      kind: 'short_numerical',
      topic: subject,
      difficulty,
      question:
        'A vehicle travels $120\\text{ km}$ in $2\\text{ hours}$. What is its average speed in $\\text{km/h}$?',
      options: ['60'],
      correctIndex: 0,
      numericalAnswer: '60',
      explanation: 'Average speed $= \\frac{\\text{Distance}}{\\text{Time}} = \\frac{120}{2} = 60\\text{ km/h}$.',
      sourceLabel: `Sample Practice — ${cls} Curriculum Aligned`,
      xpReward: 70,
    },
  ];

  numPool.push(...sampleNumericalFallback);
  mixedDistinctPool.push(...sampleNumericalFallback);

  if (filterType === 'multiple_choice') {
    return mcPool.length > 0 ? mcPool : mixedDistinctPool;
  }
  if (filterType === 'true_false') {
    return tfPool.length > 0 ? tfPool : mixedDistinctPool;
  }
  if (filterType === 'short_numerical') {
    return numPool.length > 0 ? numPool : mixedDistinctPool;
  }
  return mixedDistinctPool;
}

export const TugOfWarGame: React.FC<TugOfWarGameProps> = ({
  initialClass = 'Form 3',
  initialSubject = 'Basic Mathematics',
  initialTopic = 'ALL',
  allPapers,
  onExitToHub,
  onProgressUpdate,
}) => {
  // ==================== NAVIGATION & SETUP STATE ====================
  const [screen, setScreen] = useState<TugScreen>('1_intro');
  const [gameMode, setGameMode] = useState<TugGameMode>('classroom');
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || 'Form 3');
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || 'Basic Mathematics'
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'ALL');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('Medium');
  const [questionType, setQuestionType] = useState<TugQuestionType>('ALL');

  // ==================== TEAM & MATCH CONFIGURATION ====================
  const [teamBlueName, setTeamBlueName] = useState<string>('Team Blue');
  const [teamOrangeName, setTeamOrangeName] = useState<string>('Team Orange');
  const [winSteps, setWinSteps] = useState<number>(5);
  const [questionTimerSec, setQuestionTimerSec] = useState<number>(20); // 0 = untimed
  const [aiDifficulty, setAiDifficulty] = useState<GameDifficulty>('Medium');

  // ==================== LIVE MATCH GAMEPLAY STATE ====================
  /** Negative steps = pulled toward Team Blue (Left); Positive steps = pulled toward Team Orange (Right) */
  const [ropeSteps, setRopeSteps] = useState<number>(0);
  const [activeTurn, setActiveTurn] = useState<'blue' | 'orange'>('blue');
  const [blueScore, setBlueScore] = useState<number>(0);
  const [orangeScore, setOrangeScore] = useState<number>(0);
  const [blueStreak, setBlueStreak] = useState<number>(0);
  const [orangeStreak, setOrangeStreak] = useState<number>(0);
  const [maxStreakInMatch, setMaxStreakInMatch] = useState<number>(0);
  const [blueCorrectCount, setBlueCorrectCount] = useState<number>(0);
  const [orangeCorrectCount, setOrangeCorrectCount] = useState<number>(0);
  const [totalAnsweredInMatch, setTotalAnsweredInMatch] = useState<number>(0);

  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numericalInput, setNumericalInput] = useState<string>('');
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);
  const [stealChanceActive, setStealChanceActive] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'correct' | 'wrong' | 'steal' | 'timeout';
    title: string;
    detail: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<'blue' | 'orange' | null>(null);
  const [lastPullEvent, setLastPullEvent] = useState<{
    team: 'blue' | 'orange';
    seq: number;
  } | null>(null);
  const [aiThinking, setAiThinking] = useState<boolean>(false);

  // ==================== 3D VIEWPORT, CAMERA & SOUND CONTROLS ====================
  const [cameraPreset, setCameraPreset] = useState<TugCameraPreset>('stadium');
  const [cameraRotateTrigger, setCameraRotateTrigger] = useState<{
    deltaAngle: number;
    seq: number;
  } | null>(null);
  const [forceLite2D, setForceLite2D] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(() => soundEngine.isMuted());
  const [progress, setProgress] = useState<ElimikaPlayProgress>(() => loadPlayProgress());
  const [personalBestScore, setPersonalBestScore] = useState<number>(() => {
    const p = loadPlayProgress();
    return p.treasureHighScores['tug_of_war_best'] || 0;
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const nextTurnRef = useRef<'blue' | 'orange'>('blue');

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAutoAdvanceTimer();
  }, []);

  // ==================== CURRICULUM DATA MEMOS ====================
  const availableSubjects = useMemo(
    () =>
      getAvailableSubjectsForClass(selectedClass, allPapers) ||
      TIE_CURRICULUM_SUBJECTS[selectedClass] || ['Basic Mathematics'],
    [selectedClass, allPapers]
  );

  const availableTopics = useMemo(
    () => getAvailableTopicsForClassSubject(selectedClass, selectedSubject, allPapers),
    [selectedClass, selectedSubject, allPapers]
  );

  // Gather multiple rounds of distinct questions so a match has a large non-repeating question bank
  const rawQuestions = useMemo(() => {
    const combined: GameQuestion[] = [];
    const seen = new Set<string>();
    for (let roundOffset = 0; roundOffset < 4; roundOffset++) {
      const batch = getQuestionsForTreasureHunt(
        selectedSubject,
        selectedClass,
        difficulty,
        selectedTopic,
        'ALL',
        allPapers,
        'ALL',
        'ALL',
        roundOffset * 6
      );
      for (const q of batch) {
        if (!seen.has(q.question)) {
          seen.add(q.question);
          combined.push(q);
        }
      }
    }
    return combined;
  }, [selectedSubject, selectedClass, difficulty, selectedTopic, allPapers]);

  const questionPool = useMemo(
    () =>
      buildTugOfWarQuestionPool(
        rawQuestions,
        selectedClass,
        selectedSubject,
        difficulty,
        questionType
      ),
    [rawQuestions, selectedClass, selectedSubject, difficulty, questionType]
  );

  const currentQuestion: TugFormattedQuestion | undefined =
    questionPool[questionIdx % Math.max(1, questionPool.length)];

  // ==================== FULLSCREEN & SOUND HANDLERS ====================
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [isFullscreen]);

  const handleToggleFullscreen = () => {
    soundEngine.playClick();
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (next && containerRef.current && containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else if (!next && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleMute = () => {
    const next = !soundMuted;
    soundEngine.setMuted(next);
    setSoundMuted(next);
    if (!next) soundEngine.playClick();
  };

  const handleRotateCamera = (deltaAngle: number) => {
    soundEngine.playClick();
    setCameraRotateTrigger((prev) => ({
      deltaAngle,
      seq: (prev?.seq || 0) + 1,
    }));
  };

  // ==================== START / RESET MATCH ====================
  const startMatch = (overrideMode?: TugGameMode) => {
    clearAutoAdvanceTimer();
    const activeMode = overrideMode || gameMode;
    soundEngine.playClick();
    if (activeMode === 'vs_ai') {
      setTeamOrangeName('Moha AI Challenger');
    } else if (activeMode === 'quick_play') {
      setTeamBlueName('Team Blue');
      setTeamOrangeName('Team Orange');
    }

    nextTurnRef.current = 'blue';
    setRopeSteps(0);
    setActiveTurn('blue');
    setBlueScore(0);
    setOrangeScore(0);
    setBlueStreak(0);
    setOrangeStreak(0);
    setMaxStreakInMatch(0);
    setBlueCorrectCount(0);
    setOrangeCorrectCount(0);
    setTotalAnsweredInMatch(0);
    setQuestionIdx(0);
    setSelectedOption(null);
    setNumericalInput('');
    setIsAnswerLocked(false);
    setStealChanceActive(false);
    setFeedbackBanner(null);
    setWinnerTeam(null);
    setIsPaused(false);
    setAiThinking(false);
    setTimeLeft(questionTimerSec > 0 ? questionTimerSec : 0);
    setScreen('5_gameplay');
  };

  // ==================== VICTORY & REWARD PERSISTENCE ====================
  const triggerMatchVictory = (
    winningTeam: 'blue' | 'orange',
    finalBlueScore: number,
    finalOrangeScore: number,
    bestStreak: number
  ) => {
    setWinnerTeam(winningTeam);
    soundEngine.playCrowdCheer();
    soundEngine.playVictory();

    const highestTeamScore = Math.max(finalBlueScore, finalOrangeScore);
    const earnedXp = 120 + bestStreak * 20;
    const currentProg = loadPlayProgress();
    const prevBest = currentProg.treasureHighScores['tug_of_war_best'] || 0;
    const nextBest = Math.max(prevBest, highestTeamScore);

    const newBadges = [...currentProg.unlockedBadges];
    if (!newBadges.includes('Tug of War Champion')) {
      newBadges.push('Tug of War Champion');
    }
    if (bestStreak >= 3 && !newBadges.includes('Rope Master Streak')) {
      newBadges.push('Rope Master Streak');
    }
    if (gameMode === 'vs_ai' && winningTeam === 'blue' && !newBadges.includes('AI Tug Conqueror')) {
      newBadges.push('AI Tug Conqueror');
    }

    const updated = savePlayProgress({
      ...currentProg,
      totalXp: currentProg.totalXp + earnedXp,
      unlockedBadges: newBadges,
      treasureHighScores: {
        ...currentProg.treasureHighScores,
        tug_of_war_best: nextBest,
      },
    });
    setProgress(updated);
    setPersonalBestScore(nextBest);
    if (onProgressUpdate) onProgressUpdate(updated);
  };

  // ==================== ADVANCE TO NEXT QUESTION ====================
  const advanceToNextQuestion = (overrideNextTurn?: 'blue' | 'orange') => {
    clearAutoAdvanceTimer();
    if (winnerTeam) {
      setScreen('8_results');
      return;
    }
    const targetTurn: 'blue' | 'orange' =
      gameMode === 'vs_ai' ? 'blue' : overrideNextTurn || nextTurnRef.current;
    nextTurnRef.current = targetTurn;
    setSelectedOption(null);
    setNumericalInput('');
    setIsAnswerLocked(false);
    setStealChanceActive(false);
    setFeedbackBanner(null);
    setAiThinking(false);
    setActiveTurn(targetTurn);
    setQuestionIdx((idx) => idx + 1);
    if (questionTimerSec > 0) {
      setTimeLeft(questionTimerSec);
    }
  };

  // ==================== EVALUATE ANSWER (CORRECT / WRONG) ====================
  const evaluateSubmission = (isCorrect: boolean, chosenIndex: number | null) => {
    if (isAnswerLocked || !currentQuestion || winnerTeam) return;
    clearAutoAdvanceTimer();
    setIsAnswerLocked(true);
    setSelectedOption(chosenIndex);
    setTotalAnsweredInMatch((n) => n + 1);

    const answeringTeam: 'blue' | 'orange' = gameMode === 'vs_ai' ? 'blue' : activeTurn;
    const opposingTeam: 'blue' | 'orange' = answeringTeam === 'blue' ? 'orange' : 'blue';
    const teamLabel = answeringTeam === 'blue' ? teamBlueName : teamOrangeName;
    const oppLabel = opposingTeam === 'blue' ? teamBlueName : teamOrangeName;
    const nextTurn: 'blue' | 'orange' = gameMode === 'vs_ai' ? 'blue' : opposingTeam;
    nextTurnRef.current = nextTurn;

    if (isCorrect) {
      soundEngine.playCorrect();
      soundEngine.playRopePull();
      setLastPullEvent((prev) => ({
        team: answeringTeam,
        seq: (prev?.seq || 0) + 1,
      }));

      // Move rope 1 step toward answering team's winning boundary
      const deltaStep = answeringTeam === 'blue' ? -1 : 1;
      const nextRopeSteps = Math.max(-winSteps, Math.min(winSteps, ropeSteps + deltaStep));
      setRopeSteps(nextRopeSteps);

      const nextStreak = (answeringTeam === 'blue' ? blueStreak : orangeStreak) + 1;
      const nextMaxStreak = Math.max(maxStreakInMatch, nextStreak);
      setMaxStreakInMatch(nextMaxStreak);

      const pointsAwarded = 100 + (nextStreak > 1 ? (nextStreak - 1) * 25 : 0);
      const nextBlueScore = answeringTeam === 'blue' ? blueScore + pointsAwarded : blueScore;
      const nextOrangeScore = answeringTeam === 'orange' ? orangeScore + pointsAwarded : orangeScore;

      if (answeringTeam === 'blue') {
        setBlueScore(nextBlueScore);
        setBlueStreak(nextStreak);
        setBlueCorrectCount((c) => c + 1);
      } else {
        setOrangeScore(nextOrangeScore);
        setOrangeStreak(nextStreak);
        setOrangeCorrectCount((c) => c + 1);
      }

      // Check if rope crossed the winning boundary
      if (Math.abs(nextRopeSteps) >= winSteps) {
        setFeedbackBanner({
          type: 'correct',
          title: `🏆 ${teamLabel} Pulled the Rope Over the Winning Line!`,
          detail: `+${pointsAwarded} pts! ${currentQuestion.explanation}`,
        });
        triggerMatchVictory(answeringTeam, nextBlueScore, nextOrangeScore, nextMaxStreak);
        autoAdvanceTimerRef.current = window.setTimeout(() => setScreen('8_results'), 2000);
        return;
      }

      const stepsRemaining = winSteps - Math.abs(nextRopeSteps);
      setFeedbackBanner({
        type: 'correct',
        title: `💪 Great Pull by ${teamLabel}! (+${pointsAwarded} pts · Streak ×${nextStreak})`,
        detail: `Rope moved toward ${teamLabel}! (${stepsRemaining} more pull${
          stepsRemaining === 1 ? '' : 's'
        } to win). ${currentQuestion.explanation}`,
      });

      if (gameMode !== 'teacher') {
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          advanceToNextQuestion(nextTurn);
        }, 1350);
      }
    } else {
      // Incorrect answer: No unfair rope movement from wrong answer; opposing team gets their opportunity!
      soundEngine.playWrong();
      if (answeringTeam === 'blue') {
        setBlueStreak(0);
      } else {
        setOrangeStreak(0);
      }

      if (gameMode === 'vs_ai') {
        // In Player vs AI Mode, AI Challenger immediately takes its opportunity to answer & pull
        const accuracyTarget =
          aiDifficulty === 'Easy' ? 0.5 : aiDifficulty === 'Medium' ? 0.68 : 0.84;
        const aiAnswersCorrectly = Math.random() < accuracyTarget;

        if (aiAnswersCorrectly) {
          soundEngine.playRopePull();
          setLastPullEvent((prev) => ({
            team: 'orange',
            seq: (prev?.seq || 0) + 1,
          }));
          const nextRopeSteps = Math.max(-winSteps, Math.min(winSteps, ropeSteps + 1));
          setRopeSteps(nextRopeSteps);
          const nextOrangeStreak = orangeStreak + 1;
          const aiPoints = 100 + (nextOrangeStreak > 1 ? (nextOrangeStreak - 1) * 25 : 0);
          const nextOrangeScore = orangeScore + aiPoints;
          setOrangeScore(nextOrangeScore);
          setOrangeStreak(nextOrangeStreak);
          setOrangeCorrectCount((c) => c + 1);

          if (Math.abs(nextRopeSteps) >= winSteps) {
            setFeedbackBanner({
              type: 'steal',
              title: `🤖 ${teamOrangeName} Answered Correctly & Pulled Over the Winning Line!`,
              detail: `${currentQuestion.explanation}`,
            });
            triggerMatchVictory('orange', blueScore, nextOrangeScore, maxStreakInMatch);
            autoAdvanceTimerRef.current = window.setTimeout(() => setScreen('8_results'), 2000);
            return;
          }

          setFeedbackBanner({
            type: 'steal',
            title: `🤖 ${teamOrangeName} Capitalized on the Opportunity & Pulled the Rope! (+${aiPoints} pts)`,
            detail: `Your answer was off, and ${teamOrangeName} answered correctly! ${currentQuestion.explanation}`,
          });
        } else {
          setOrangeStreak(0);
          setFeedbackBanner({
            type: 'wrong',
            title: `🤝 Nice Try! ${teamOrangeName} Also Missed — Rope Holds Steady!`,
            detail: currentQuestion.explanation,
          });
        }

        autoAdvanceTimerRef.current = window.setTimeout(() => {
          advanceToNextQuestion('blue');
        }, 1500);
      } else {
        setFeedbackBanner({
          type: 'wrong',
          title: `🤝 Nice Try, ${teamLabel}! Rope Stays Steady — ${oppLabel}’s Turn Next!`,
          detail: currentQuestion.explanation,
        });
        if (gameMode !== 'teacher') {
          autoAdvanceTimerRef.current = window.setTimeout(() => {
            advanceToNextQuestion(opposingTeam);
          }, 1450);
        }
      }
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (!currentQuestion || isAnswerLocked) return;
    const isRight = optIndex === currentQuestion.correctIndex;
    evaluateSubmission(isRight, optIndex);
  };

  const handleSubmitNumerical = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion || isAnswerLocked || !numericalInput.trim()) return;
    const expected = (currentQuestion.numericalAnswer || currentQuestion.options[0] || '').trim();
    const userVal = numericalInput.trim();
    const isRight =
      userVal === expected ||
      (Number.isFinite(Number(userVal)) &&
        Number.isFinite(Number(expected)) &&
        Math.abs(Number(userVal) - Number(expected)) < 0.01);
    evaluateSubmission(isRight, 0);
  };

  // ==================== QUESTION COUNTDOWN TIMER ====================
  useEffect(() => {
    if (
      screen !== '5_gameplay' ||
      isPaused ||
      isAnswerLocked ||
      winnerTeam ||
      questionTimerSec <= 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, isPaused, isAnswerLocked, winnerTeam, questionTimerSec, activeTurn, questionIdx]);

  // Handle Time-Out when timer hits 0 (without cancelling autoAdvanceTimerRef on isAnswerLocked re-render)
  useEffect(() => {
    if (
      screen === '5_gameplay' &&
      questionTimerSec > 0 &&
      timeLeft === 0 &&
      !isAnswerLocked &&
      !winnerTeam &&
      !isPaused
    ) {
      clearAutoAdvanceTimer();
      setIsAnswerLocked(true);
      soundEngine.playWrong();
      const opposingTeam: 'blue' | 'orange' =
        gameMode === 'vs_ai' ? 'blue' : activeTurn === 'blue' ? 'orange' : 'blue';
      nextTurnRef.current = opposingTeam;
      const activeName = activeTurn === 'blue' ? teamBlueName : teamOrangeName;
      const oppName =
        gameMode === 'vs_ai'
          ? teamOrangeName
          : opposingTeam === 'blue'
          ? teamBlueName
          : teamOrangeName;

      if (activeTurn === 'blue') setBlueStreak(0);
      else setOrangeStreak(0);

      if (gameMode === 'vs_ai') {
        const accuracyTarget =
          aiDifficulty === 'Easy' ? 0.5 : aiDifficulty === 'Medium' ? 0.68 : 0.84;
        const aiAnswersCorrectly = Math.random() < accuracyTarget;
        if (aiAnswersCorrectly) {
          soundEngine.playRopePull();
          setLastPullEvent((prev) => ({
            team: 'orange',
            seq: (prev?.seq || 0) + 1,
          }));
          const nextRopeSteps = Math.max(-winSteps, Math.min(winSteps, ropeSteps + 1));
          setRopeSteps(nextRopeSteps);
          const nextOrangeScore = orangeScore + 100;
          setOrangeScore(nextOrangeScore);
          setOrangeCorrectCount((c) => c + 1);

          if (Math.abs(nextRopeSteps) >= winSteps) {
            triggerMatchVictory('orange', blueScore, nextOrangeScore, maxStreakInMatch);
            autoAdvanceTimerRef.current = window.setTimeout(() => setScreen('8_results'), 2000);
            return;
          }
          setFeedbackBanner({
            type: 'timeout',
            title: `⏰ Time Up! ${teamOrangeName} Answered & Pulled the Rope! (+100 pts)`,
            detail: currentQuestion?.explanation || '',
          });
        } else {
          setFeedbackBanner({
            type: 'timeout',
            title: `⏰ Time Up! Rope Holds Steady.`,
            detail: currentQuestion?.explanation || '',
          });
        }
      } else {
        setFeedbackBanner({
          type: 'timeout',
          title: `⏰ Time Up for ${activeName}! Rope Holds Steady.`,
          detail: `Switching turn to ${oppName}. ${currentQuestion?.explanation || ''}`,
        });
      }

      if (gameMode !== 'teacher') {
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          advanceToNextQuestion(opposingTeam);
        }, 1450);
      }
    }
  }, [timeLeft, screen, questionTimerSec, isAnswerLocked, winnerTeam, isPaused]);


  // ==================== SCREEN 1: GAME INTRODUCTION SCREEN ====================
  if (screen === '1_intro') {
    return (
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0A2558] to-slate-900 text-white flex flex-col pb-20"
      >
        <div className="max-w-5xl w-full mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onExitToHub}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Games Hub</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-amber-300 tabular-nums">⭐ {progress.totalXp} XP</span>
            <span className="text-slate-400">·</span>
            <span className="text-sky-300 tabular-nums">Best: {personalBestScore} pts</span>
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="max-w-5xl w-full mx-auto px-4 py-2 flex-1 flex flex-col justify-center gap-5">
          {/* Live 3D Sports Ground Preview Banner */}
          <div className="relative h-60 sm:h-72 rounded-3xl overflow-hidden border-2 border-sky-400/40 shadow-2xl bg-sky-900">
            <TugOfWar3DScene
              ropeSteps={0}
              winSteps={5}
              teamBlueName="Team Blue"
              teamOrangeName="Team Orange"
              activeTurn="blue"
              winnerTeam={null}
              lastPullEvent={null}
              cameraPreset="stadium"
              forceLite2D={forceLite2D}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex flex-col justify-end p-5 sm:p-7">
              <div className="text-xs font-bold text-amber-300 tracking-wide mb-1">
                ELIMIKA 3D SCHOOL SPORTS ARENA · {selectedClass} · {selectedSubject}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Elimika <span className="text-sky-400">Tug</span> of{' '}
                <span className="text-orange-400">War</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-1">
                Team Blue vs. Team Orange! Answer curriculum questions accurately to heave the braided
                rope across the winning line.
              </p>
            </div>
          </div>

          {/* Primary Launch Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen('2_mode');
              }}
              className="sm:col-span-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 text-white font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Configure Match &amp; Choose Mode →</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGameMode('quick_play');
                startMatch('quick_play');
              }}
              className="py-4 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Instant Quick Play</span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <div className="font-black text-sky-300 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> 2-Team Classroom
              </div>
              <p className="text-slate-300">Custom team names, alternating turns &amp; steal chances.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <div className="font-black text-orange-300 flex items-center gap-1.5">
                <Bot className="w-4 h-4" /> Player vs Smart AI
              </div>
              <p className="text-slate-300">Compete solo against an adaptive AI opponent.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <div className="font-black text-emerald-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> Teacher Mode
              </div>
              <p className="text-slate-300">Select questions, control turns &amp; lead the class.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> Std 1–7 &amp; Form 1–6
              </div>
              <p className="text-slate-300">MCQ, True/False &amp; Numerical questions across all subjects.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 2: GAME MODE SELECTION ====================
  if (screen === '2_mode') {
    const modes: Array<{
      id: TugGameMode;
      title: string;
      subtitle: string;
      desc: string;
      icon: React.ReactNode;
      accent: string;
    }> = [
      {
        id: 'classroom',
        title: 'Two-Team Classroom Mode',
        subtitle: 'Team Blue vs Team Orange (Same Device / Smartboard)',
        desc: 'Divide students into two teams, customize team names, and take turns answering to pull the rope!',
        icon: <Users className="w-6 h-6 text-sky-400" />,
        accent: 'border-sky-500/50 bg-sky-950/40',
      },
      {
        id: 'vs_ai',
        title: 'Player vs AI Mode',
        subtitle: 'Solo Student vs Moha Smart Challenger',
        desc: 'Play as Team Blue against an AI-controlled Team Orange with configurable Easy, Medium, or Hard AI accuracy.',
        icon: <Bot className="w-6 h-6 text-orange-400" />,
        accent: 'border-orange-500/50 bg-orange-950/40',
      },
      {
        id: 'quick_play',
        title: 'Quick Play Mode',
        subtitle: 'Instant Action with Random Curriculum Questions',
        desc: 'Jump straight onto the sports field with randomized questions for your selected class and subject.',
        icon: <Zap className="w-6 h-6 text-amber-400" />,
        accent: 'border-amber-500/50 bg-amber-950/40',
      },
      {
        id: 'teacher',
        title: 'Teacher Controlled Mode',
        subtitle: 'Classroom Projector & Teacher Moderation',
        desc: 'Teacher selects questions, controls when to advance to the next question, and moderates team pulls.',
        icon: <GraduationCap className="w-6 h-6 text-emerald-400" />,
        accent: 'border-emerald-500/50 bg-emerald-950/40',
      },
    ];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-20">
        <div className="max-w-4xl w-full mx-auto px-4 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setScreen('1_intro')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-xs font-bold text-slate-400">Step 1 of 3 · Select Game Mode</div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black">Choose Your Tug of War Mode</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select how you want to play today’s educational tug-of-war match.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modes.map((m) => {
              const selected = gameMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setGameMode(m.id);
                    if (m.id === 'quick_play') {
                      startMatch('quick_play');
                    } else {
                      setScreen('3_curriculum');
                    }
                  }}
                  className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selected
                      ? 'border-amber-400 bg-white/10 shadow-lg'
                      : `${m.accent} hover:bg-white/10`
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-white/10">{m.icon}</div>
                      <span className="text-xs font-bold text-amber-300">
                        {m.id === 'quick_play' ? 'Instant Start →' : 'Configure →'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">{m.title}</h3>
                    <div className="text-xs font-bold text-slate-300">{m.subtitle}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 3: EDUCATION LEVEL, SUBJECT & TOPIC SELECTION ====================
  if (screen === '3_curriculum') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-20">
        <div className="max-w-4xl w-full mx-auto px-4 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setScreen('2_mode')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Modes
            </button>
            <div className="text-xs font-bold text-slate-400">
              Step 2 of 3 · Curriculum &amp; Question Settings
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Select Level, Subject &amp; Question Format
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Supports Primary (Standard 1–7) and Secondary (Form 1–6) across all subjects.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
            {/* Education Level (Standard 1-7 & Form 1-6) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                1. Education Level (Standard 1–7 / Form 1–6)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {PLAY_CLASSES.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedClass(cls);
                      const subs =
                        getAvailableSubjectsForClass(cls, allPapers) ||
                        TIE_CURRICULUM_SUBJECTS[cls] || ['Basic Mathematics'];
                      if (!subs.includes(selectedSubject)) {
                        setSelectedSubject(subs[0] || 'Basic Mathematics');
                      }
                      setSelectedTopic('ALL');
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                      selectedClass === cls
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject & Topic Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">2. Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedTopic('ALL');
                  }}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">3. Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Topics ({availableTopics.length})</option>
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Difficulty & Question Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">4. Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as GameDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 rounded-xl font-bold text-xs cursor-pointer ${
                        difficulty === diff
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">5. Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as TugQuestionType)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Formats (MCQ + True/False + Numerical)</option>
                  <option value="multiple_choice">Multiple Choice Only</option>
                  <option value="true_false">True or False Only</option>
                  <option value="short_numerical">Short Numerical Answers Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen('4_teams');
              }}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm cursor-pointer shadow-lg"
            >
              Next: Team Setup &amp; Match Rules →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 4: TEAM SETUP SCREEN ====================
  if (screen === '4_teams') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-20">
        <div className="max-w-4xl w-full mx-auto px-4 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setScreen('3_curriculum')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Curriculum
            </button>
            <div className="text-xs font-bold text-slate-400">Step 3 of 3 · Team Setup &amp; Rules</div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black">Customize Teams &amp; Match Rules</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Set custom team names, winning pull distance, and countdown timer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team Blue Setup */}
            <div className="bg-blue-950/50 border-2 border-blue-500/40 rounded-3xl p-5 space-y-3">
              <div className="text-xs font-black text-sky-400">LEFT SIDE · TEAM BLUE</div>
              <label className="text-xs font-bold text-slate-300 block">Team Blue Name</label>
              <input
                type="text"
                value={teamBlueName}
                onChange={(e) => setTeamBlueName(e.target.value)}
                maxLength={24}
                placeholder="Team Blue"
                className="w-full bg-slate-900 border border-blue-400/40 rounded-xl px-3.5 py-2.5 text-sm font-black text-white focus:outline-none"
              />
            </div>

            {/* Team Orange Setup */}
            <div className="bg-orange-950/50 border-2 border-orange-500/40 rounded-3xl p-5 space-y-3">
              <div className="text-xs font-black text-orange-400">
                RIGHT SIDE · {gameMode === 'vs_ai' ? 'AI OPPONENT' : 'TEAM ORANGE'}
              </div>
              <label className="text-xs font-bold text-slate-300 block">Team Orange Name</label>
              <input
                type="text"
                value={teamOrangeName}
                onChange={(e) => setTeamOrangeName(e.target.value)}
                maxLength={24}
                placeholder="Team Orange"
                className="w-full bg-slate-900 border border-orange-400/40 rounded-xl px-3.5 py-2.5 text-sm font-black text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Match Rules Configuration */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Winning Boundary Distance
              </label>
              <select
                value={winSteps}
                onChange={(e) => setWinSteps(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer"
              >
                <option value={3}>3 Pulls (Fast Match)</option>
                <option value={5}>5 Pulls (Standard Match)</option>
                <option value={7}>7 Pulls (Marathon Match)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Question Timer (Seconds)
              </label>
              <select
                value={questionTimerSec}
                onChange={(e) => setQuestionTimerSec(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer"
              >
                <option value={15}>15 Seconds (Blitz)</option>
                <option value={20}>20 Seconds (Standard)</option>
                <option value={30}>30 Seconds (Extended)</option>
                <option value={45}>45 Seconds (Calculation)</option>
                <option value={0}>Untimed (Classroom Discussion)</option>
              </select>
            </div>

            {gameMode === 'vs_ai' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  AI Opponent Accuracy
                </label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as GameDifficulty)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer"
                >
                  <option value="Easy">Easy Bot (~52% Accuracy)</option>
                  <option value="Medium">Medium Bot (~72% Accuracy)</option>
                  <option value="Hard">Hard Bot (~86% Accuracy)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">3D Graphics Mode</label>
                <button
                  type="button"
                  onClick={() => setForceLite2D((v) => !v)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2.5 text-xs font-bold text-left text-white cursor-pointer"
                >
                  {forceLite2D ? '⚡ Lite 2D Arena Active' : '🏟️ Full 3D Stadium Active'}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => startMatch()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-amber-500 to-orange-600 hover:opacity-95 text-slate-950 font-black text-base sm:text-lg shadow-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Start Tug of War Match Now!</span>
          </button>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 8: GAME RESULTS SCREEN ====================
  if (screen === '8_results') {
    const winningName =
      winnerTeam === 'orange' ? teamOrangeName : teamBlueName;
    const isBlueWinner = winnerTeam !== 'orange';

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center px-4 py-8 pb-24">
        <div className="max-w-3xl w-full mx-auto bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
            <Trophy className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-300">
              ELIMIKA TUG OF WAR · FINAL MATCH RESULTS
            </div>
            <h2 className="text-2xl sm:text-4xl font-black">
              🎉 {winningName} Wins the Tug of War!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {selectedClass} · {selectedSubject} ·{' '}
              {selectedTopic === 'ALL' ? 'All Topics' : selectedTopic}
            </p>
          </div>

          {/* Team Scoreboard Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-2xl border-2 ${
                isBlueWinner
                  ? 'bg-blue-950/70 border-sky-400'
                  : 'bg-slate-800/60 border-white/10'
              }`}
            >
              <div className="text-xs font-black text-sky-400">{teamBlueName}</div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums mt-1">
                {blueScore} pts
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {blueCorrectCount} Correct Pulls
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border-2 ${
                !isBlueWinner
                  ? 'bg-orange-950/70 border-orange-400'
                  : 'bg-slate-800/60 border-white/10'
              }`}
            >
              <div className="text-xs font-black text-orange-400">{teamOrangeName}</div>
              <div className="text-2xl sm:text-3xl font-black tabular-nums mt-1">
                {orangeScore} pts
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {orangeCorrectCount} Correct Pulls
              </div>
            </div>
          </div>

          {/* Progression & Badges Awarded */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Total XP: {progress.totalXp} XP</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Flame className="w-4 h-4" />
              <span>Best Streak: ×{maxStreakInMatch}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-300">
              <Award className="w-4 h-4" />
              <span>Personal Best: {personalBestScore} pts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => startMatch()}
              className="py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Rematch</span>
            </button>
            <button
              type="button"
              onClick={() => setScreen('3_curriculum')}
              className="py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm cursor-pointer"
            >
              Change Subject / Topic
            </button>
            <button
              type="button"
              onClick={onExitToHub}
              className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm cursor-pointer"
            >
              Back to Games Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 5, 6 & 7: MAIN GAMEPLAY + QUESTION UI + PAUSE MODAL ====================
  const ropePercentage = Math.round(((ropeSteps + winSteps) / (2 * winSteps)) * 100);
  const activeTeamName = activeTurn === 'blue' ? teamBlueName : teamOrangeName;

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-[120] w-screen h-[100dvh] bg-slate-950 text-white flex flex-col overflow-y-auto'
          : 'min-h-screen bg-slate-950 text-white flex flex-col pb-20'
      }
    >
      {/* Top Compact Match Header */}
      <div className="bg-slate-900 border-b border-white/10 px-3 sm:px-5 py-2.5 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
            <span className="text-xs font-black text-slate-300 hidden sm:inline">
              {selectedClass} · {selectedSubject}
            </span>
          </div>

          {/* Live Team Blue vs Team Orange Scoreboard Pill */}
          <div className="flex items-center gap-2 sm:gap-4 bg-slate-950 border border-white/15 px-3 py-1 rounded-2xl text-xs sm:text-sm font-black tabular-nums">
            <div className="flex items-center gap-1.5 text-sky-400">
              <span>{teamBlueName}:</span>
              <span>{blueScore}</span>
              {blueStreak > 1 && (
                <span className="text-[11px] text-amber-300">🔥×{blueStreak}</span>
              )}
            </div>
            <span className="text-slate-500">VS</span>
            <div className="flex items-center gap-1.5 text-orange-400">
              <span>{teamOrangeName}:</span>
              <span>{orangeScore}</span>
              {orangeStreak > 1 && (
                <span className="text-[11px] text-amber-300">🔥×{orangeStreak}</span>
              )}
            </div>
          </div>

          {/* Right Controls: Sound, Fullscreen & Restart */}
          <div className="flex items-center gap-1.5">
            {questionTimerSec > 0 && (
              <div
                className={`px-2.5 py-1 rounded-xl font-black text-xs flex items-center gap-1 tabular-nums ${
                  timeLeft <= 5
                    ? 'bg-rose-600 text-white'
                    : 'bg-white/10 text-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title={soundMuted ? 'Unmute' : 'Mute'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: 3D Tug-of-War Stadium Viewport + Question & Answer Interface */}
      <div className="max-w-6xl w-full mx-auto px-3 sm:px-5 py-3 flex-1 flex flex-col gap-3">
        {/* 3D Sports Ground Viewport */}
        <div
          className={`relative w-full ${
            isFullscreen ? 'h-[44dvh] min-h-[250px]' : 'h-56 sm:h-72'
          } rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl bg-sky-900 shrink-0`}
        >
          <TugOfWar3DScene
            ropeSteps={ropeSteps}
            winSteps={winSteps}
            teamBlueName={teamBlueName}
            teamOrangeName={teamOrangeName}
            activeTurn={activeTurn}
            winnerTeam={winnerTeam}
            lastPullEvent={lastPullEvent}
            cameraPreset={cameraPreset}
            cameraRotateTrigger={cameraRotateTrigger}
            forceLite2D={forceLite2D}
          />

          {/* Top-Left 360° Camera & View Controls Overlay */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1 bg-slate-950/75 backdrop-blur-xs border border-white/15 p-1 rounded-xl text-[11px] font-bold">
            {(
              [
                { id: 'stadium', label: '🏟️ Stadium' },
                { id: 'overhead', label: '🗺️ Top View' },
                { id: 'close', label: '🎥 Action' },
              ] as const
            ).map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => setCameraPreset(cam.id)}
                className={`px-2 py-1 rounded-lg cursor-pointer ${
                  cameraPreset === cam.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {cam.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleRotateCamera(-Math.PI / 3)}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 cursor-pointer"
              title="Rotate Camera Left 60°"
            >
              ↺ Left
            </button>
            <button
              type="button"
              onClick={() => handleRotateCamera(Math.PI / 3)}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 cursor-pointer"
              title="Rotate Camera Right 60°"
            >
              ↻ Right
            </button>
            <button
              type="button"
              onClick={() => setForceLite2D((v) => !v)}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 cursor-pointer"
              title="Switch between 3D and 2D Lite mode"
            >
              {forceLite2D ? '3D' : '2D Lite'}
            </button>
          </div>

          {/* Bottom Rope Tug-of-War Meter Bar */}
          <div className="absolute bottom-2.5 inset-x-3 z-10 bg-slate-950/85 backdrop-blur-xs border border-white/15 rounded-2xl px-3.5 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-sky-400">
                ◀ {teamBlueName} Win ({Math.max(0, -ropeSteps)}/{winSteps})
              </span>
              <span className="text-amber-300">
                {ropeSteps === 0
                  ? 'CENTER LINE'
                  : ropeSteps < 0
                  ? `${teamBlueName} Leading by ${Math.abs(ropeSteps)}`
                  : `${teamOrangeName} Leading by ${ropeSteps}`}
              </span>
              <span className="text-orange-400">
                ({Math.max(0, ropeSteps)}/{winSteps}) {teamOrangeName} Win ▶
              </span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-blue-600 via-slate-700 to-orange-600 overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/80 -translate-x-1/2" />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-md transition-all duration-300"
                style={{ left: `${ropePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Teacher Controlled Mode Moderation Bar */}
        {gameMode === 'teacher' && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-black text-emerald-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Teacher Controls (Question #{questionIdx + 1} of {questionPool.length})</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTurn(activeTurn === 'blue' ? 'orange' : 'blue')}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
              >
                Switch Turn ({activeTeamName})
              </button>
              <button
                type="button"
                onClick={() =>
                  advanceToNextQuestion(activeTurn === 'blue' ? 'orange' : 'blue')
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black cursor-pointer"
              >
                Next Question →
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerMatchVictory(
                    ropeSteps <= 0 ? 'blue' : 'orange',
                    blueScore,
                    orangeScore,
                    maxStreakInMatch
                  );
                  setScreen('8_results');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer"
              >
                End &amp; Show Winner
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 6: QUESTION AND ANSWER INTERFACE */}
        {currentQuestion && (
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Turn Banner & Question Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 ${
                      activeTurn === 'blue'
                        ? 'bg-blue-600 text-white'
                        : 'bg-orange-600 text-white'
                    }`}
                  >
                    <span>
                      {activeTurn === 'blue' ? '🔵' : '🟠'} {activeTeamName}’s Turn to Pull!
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 text-amber-300 font-black text-xs tabular-nums">
                    Question #{questionIdx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400 font-semibold hidden sm:block">
                    <span>{currentQuestion.topic}</span>
                    <span> · </span>
                    <span>
                      {currentQuestion.kind === 'true_false'
                        ? 'True / False'
                        : currentQuestion.kind === 'short_numerical'
                        ? 'Numerical'
                        : 'Multiple Choice'}
                    </span>
                  </div>

                  {isAnswerLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        if (winnerTeam) {
                          clearAutoAdvanceTimer();
                          setScreen('8_results');
                        } else {
                          advanceToNextQuestion(nextTurnRef.current);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                    >
                      {winnerTeam ? 'View Winner →' : 'Next Question →'}
                    </button>
                  )}
                </div>
              </div>

              {/* Clear Question Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-sm sm:text-base font-bold text-white leading-relaxed">
                <MathText as="div" text={currentQuestion.question} />
              </div>

              {/* AI Thinking Indicator */}
              {aiThinking && (
                <div className="p-3 rounded-2xl bg-orange-950/60 border border-orange-400/40 text-orange-200 text-xs font-bold flex items-center gap-2">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>{teamOrangeName} is calculating an answer...</span>
                </div>
              )}

              {/* Answer Input Area: Multiple Choice / True-False vs Short Numerical */}
              {currentQuestion.kind === 'short_numerical' ? (
                <form onSubmit={handleSubmitNumerical} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={isAnswerLocked || aiThinking}
                      value={numericalInput}
                      onChange={(e) => setNumericalInput(e.target.value)}
                      placeholder="Enter numerical answer (e.g. 12)..."
                      className="flex-1 bg-slate-950 border-2 border-white/20 focus:border-amber-400 rounded-2xl px-4 py-3 text-base font-black text-white focus:outline-none tabular-nums"
                    />
                    <button
                      type="submit"
                      disabled={isAnswerLocked || aiThinking || !numericalInput.trim()}
                      className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-sm cursor-pointer shrink-0"
                    >
                      Pull Rope!
                    </button>
                  </div>

                  {/* Touch-Friendly Quick Number Pad for Mobile & Smartboards */}
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        disabled={isAnswerLocked || aiThinking}
                        onClick={() => setNumericalInput((prev) => `${prev}${digit}`)}
                        className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm cursor-pointer tabular-nums"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                </form>
              ) : (
                <div
                  className={`grid grid-cols-1 ${
                    currentQuestion.kind === 'true_false' ? 'sm:grid-cols-2' : 'sm:grid-cols-2'
                  } gap-2.5`}
                >
                  {currentQuestion.options.map((opt, idx) => {
                    const isPicked = selectedOption === idx;
                    const isRight = idx === currentQuestion.correctIndex;
                    let btnStyle =
                      'bg-slate-800/90 hover:bg-slate-800 border-white/15 text-white';

                    if (isAnswerLocked) {
                      if (isRight) {
                        btnStyle =
                          'bg-emerald-900/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400';
                      } else if (isPicked) {
                        btnStyle = 'bg-rose-900/70 border-rose-400 text-rose-100';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswerLocked || aiThinking}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer min-h-[52px] ${btnStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            activeTurn === 'blue'
                              ? 'bg-blue-600 text-white'
                              : 'bg-orange-600 text-white'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">
                          <MathText text={opt} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Friendly Feedback Banner with Instant Next Question Action in ALL Modes */}
            {feedbackBanner && (
              <div
                className={`mt-3 p-3.5 rounded-2xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  feedbackBanner.type === 'correct'
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
                    : feedbackBanner.type === 'steal'
                    ? 'bg-amber-950/90 border-amber-400 text-amber-100'
                    : 'bg-slate-800 border-white/20 text-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-black">{feedbackBanner.title}</div>
                  <div className="text-xs opacity-90">
                    <MathText text={feedbackBanner.detail} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (winnerTeam) {
                      clearAutoAdvanceTimer();
                      setScreen('8_results');
                    } else {
                      advanceToNextQuestion(nextTurnRef.current);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md"
                >
                  {winnerTeam ? 'See Winner →' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SCREEN 7: PAUSE SCREEN MODAL */}
      {isPaused && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-white/20 rounded-3xl max-w-md w-full p-6 space-y-4 text-center shadow-2xl">
            <h3 className="text-xl font-black text-white">Match Paused</h3>
            <p className="text-xs text-slate-400">
              {teamBlueName} ({blueScore} pts) vs {teamOrangeName} ({orangeScore} pts)
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Match</span>
              </button>
              <button
                type="button"
                onClick={() => startMatch()}
                className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Match</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setScreen('3_curriculum');
                }}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm cursor-pointer"
              >
                Change Subject / Topic / Teams
              </button>
              <button
                type="button"
                onClick={onExitToHub}
                className="w-full py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-sm cursor-pointer"
              >
                Exit to Games Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
