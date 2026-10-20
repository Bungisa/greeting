import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  Compass,
  Crown,
  Gem,
  HelpCircle,
  Key,
  Lock,
  Map as MapIcon,
  Pause,
  Play,
  RotateCcw,
  Scroll,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { MathText } from '../utils/mathRenderer';
import { soundEngine } from './gameSoundEngine';
import {
  ElimikaPlayProgress,
  GameDifficulty,
  GameQuestion,
  PLAY_CLASSES,
  PLAY_SUBJECTS,
  TREASURE_ADVENTURE_WORLDS,
  TreasureAdventureWorld,
  TreasureCheckpoint,
  getQuestionsForTreasureHunt,
  loadPlayProgress,
  savePlayProgress,
} from './gameDataAndStorage';

interface NectaTreasureHuntGameProps {
  initialClass?: string;
  initialSubject?: string;
  onExitToHub: () => void;
  onProgressUpdate?: (p: ElimikaPlayProgress) => void;
}

type HuntPhase = 'SETUP' | 'EXPLORING' | 'PAUSED' | 'TREASURE_REVEALED';

export const NectaTreasureHuntGame: React.FC<NectaTreasureHuntGameProps> = ({
  initialClass = 'Form 3',
  initialSubject = 'Basic Mathematics',
  onExitToHub,
  onProgressUpdate,
}) => {
  const [progress, setProgress] = useState<ElimikaPlayProgress>(() => loadPlayProgress());
  const [selectedWorldId, setSelectedWorldId] = useState<string>(TREASURE_ADVENTURE_WORLDS[0].id);
  const [selectedClass, setSelectedClass] = useState<string>(
    PLAY_CLASSES.includes(initialClass as never) ? initialClass : 'Form 3'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    PLAY_SUBJECTS.includes(initialSubject as never) ? initialSubject : 'Basic Mathematics'
  );
  const [difficulty, setDifficulty] = useState<GameDifficulty>('Medium');

  const [phase, setPhase] = useState<HuntPhase>('SETUP');
  const [currentCheckpointIdx, setCurrentCheckpointIdx] = useState<number>(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);
  const [activeCheckpointModalIdx, setActiveCheckpointModalIdx] = useState<number | null>(null);
  const [checkpointSubQuestionIdx, setCheckpointSubQuestionIdx] = useState<number>(0);

  const [sessionXp, setSessionXp] = useState<number>(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Question interaction state inside active checkpoint
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [totalQuestionsAttempted, setTotalQuestionsAttempted] = useState<number>(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Audio controls
  const [muted, setMuted] = useState<boolean>(soundEngine.isMuted());
  const [musicOn, setMusicOn] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(soundEngine.getVolume());

  // Canvas & character animation state
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const explorerPosRef = useRef<{ xPct: number; yPct: number }>({
    xPct: TREASURE_ADVENTURE_WORLDS[0].checkpoints[0].xPct,
    yPct: TREASURE_ADVENTURE_WORLDS[0].checkpoints[0].yPct,
  });

  const activeWorld: TreasureAdventureWorld = useMemo(
    () =>
      TREASURE_ADVENTURE_WORLDS.find((w) => w.id === selectedWorldId) ||
      TREASURE_ADVENTURE_WORLDS[0],
    [selectedWorldId]
  );

  const questions: GameQuestion[] = useMemo(
    () => getQuestionsForTreasureHunt(selectedSubject, selectedClass, difficulty),
    [selectedSubject, selectedClass, difficulty]
  );

  const CHECKPOINT_QUESTION_RANGES: Array<[number, number]> = [
    [0, 2],
    [3, 5],
    [6, 8],
    [9, 12],
    [13, 16],
    [17, 19],
  ];

  // Timer during active exploration
  useEffect(() => {
    if (phase !== 'EXPLORING') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Stop music on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopBackgroundMusic();
    };
  }, []);

  // Animated 3D-inspired adventure terrain & water canvas
  useEffect(() => {
    if (phase !== 'EXPLORING' && phase !== 'PAUSED') return;
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let tick = 0;

    const renderFrame = () => {
      tick += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Deep water / sky background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, activeWorld.skyColor);
      bgGrad.addColorStop(1, activeWorld.waterColor);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle animated water wave lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      for (let row = 0; row < 8; row++) {
        const yBase = (h / 8) * row + 30;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 24) {
          const yOffset = Math.sin(x * 0.02 + tick + row) * 4;
          if (x === 0) ctx.moveTo(x, yBase + yOffset);
          else ctx.lineTo(x, yBase + yOffset);
        }
        ctx.stroke();
      }

      // 3. Draw stylized 3D-layered island landmasses under each checkpoint
      activeWorld.checkpoints.forEach((cp, idx) => {
        const cx = (cp.xPct / 100) * w;
        const cy = (cp.yPct / 100) * h;
        const rx = idx === 5 ? 74 : 56;
        const ry = idx === 5 ? 44 : 34;

        // 3D Island cliff shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, rx + 6, ry + 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sandy shore rim
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 5, rx + 3, ry + 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lush green / highland island top
        ctx.fillStyle = activeWorld.islandColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw bridges & glowing adventure trail connecting checkpoints
      for (let i = 0; i < activeWorld.checkpoints.length - 1; i++) {
        const a = activeWorld.checkpoints[i];
        const b = activeWorld.checkpoints[i + 1];
        const ax = (a.xPct / 100) * w;
        const ay = (a.yPct / 100) * h;
        const bx = (b.xPct / 100) * w;
        const by = (b.yPct / 100) * h;

        const isUnlockedPath = completedCheckpoints.includes(a.id);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineWidth = isUnlockedPath ? 6 : 4;
        ctx.strokeStyle = isUnlockedPath ? '#fbbf24' : 'rgba(255,255,255,0.28)';
        if (!isUnlockedPath) {
          ctx.setLineDash([8, 8]);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 5. Smoothly interpolate Explorer Avatar position toward current checkpoint
      const targetCp =
        activeWorld.checkpoints[currentCheckpointIdx] || activeWorld.checkpoints[0];
      explorerPosRef.current.xPct += (targetCp.xPct - explorerPosRef.current.xPct) * 0.08;
      explorerPosRef.current.yPct += (targetCp.yPct - explorerPosRef.current.yPct) * 0.08;

      const ex = (explorerPosRef.current.xPct / 100) * w;
      const ey = (explorerPosRef.current.yPct / 100) * h - 22 + Math.sin(tick * 2.2) * 3;

      // Explorer glowing aura
      const aura = ctx.createRadialGradient(ex, ey, 4, ex, ey, 26);
      aura.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
      aura.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(ex, ey, 26, 0, Math.PI * 2);
      ctx.fill();

      // Explorer avatar token
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ex, ey, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fbbf24';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', ex, ey);

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [phase, activeWorld, completedCheckpoints, currentCheckpointIdx]);

  const persistProgress = (updated: ElimikaPlayProgress) => {
    savePlayProgress(updated);
    setProgress(updated);
    onProgressUpdate?.(updated);
  };

  const startNewAdventure = () => {
    soundEngine.playClick();
    const startCp = activeWorld.checkpoints[0];
    explorerPosRef.current = { xPct: startCp.xPct, yPct: startCp.yPct };
    setCurrentCheckpointIdx(0);
    setCompletedCheckpoints([]);
    setActiveCheckpointModalIdx(0);
    setSessionXp(0);
    setInventory([]);
    setDiscoveredClues([]);
    setElapsedSeconds(0);
    setSelectedOptionIdx(null);
    setAttemptCount(0);
    setTotalQuestionsAttempted(0);
    setFirstTryCorrectCount(0);
    setHintVisible(false);
    setFeedbackState('idle');
    setPhase('EXPLORING');
    if (musicOn && !muted) {
      soundEngine.startBackgroundMusic('adventure');
    }
  };

  const resumeSavedAdventure = () => {
    const saved = progress.savedTreasureSession;
    if (!saved) return;
    soundEngine.playClick();
    setSelectedWorldId(saved.worldId);
    setSelectedClass(saved.cls);
    setSelectedSubject(saved.subject);
    setDifficulty(saved.difficulty);
    setCurrentCheckpointIdx(saved.currentCheckpointIdx);
    setCompletedCheckpoints(saved.completedCheckpoints);
    setSessionXp(saved.xpEarned);
    setInventory(saved.inventory);
    setActiveCheckpointModalIdx(saved.currentCheckpointIdx);
    setPhase('EXPLORING');
  };

  const openCheckpointChallenge = (idx: number) => {
    const isUnlocked = idx === 0 || completedCheckpoints.includes(activeWorld.checkpoints[idx - 1].id);
    if (!isUnlocked) {
      soundEngine.playWrong();
      return;
    }
    soundEngine.playClick();
    setCurrentCheckpointIdx(idx);
    setActiveCheckpointModalIdx(idx);
    setCheckpointSubQuestionIdx(0);
    setSelectedOptionIdx(null);
    setAttemptCount(0);
    setHintVisible(false);
    setFeedbackState('idle');
  };

  const handleUseHint = () => {
    if (hintVisible) return;
    soundEngine.playDiscovery();
    setHintVisible(true);
    setSessionXp((xp) => Math.max(0, xp - 10));
  };

  const handleSubmitCheckpointAnswer = () => {
    if (activeCheckpointModalIdx === null || selectedOptionIdx === null) return;
    const [startQ, endQ] = CHECKPOINT_QUESTION_RANGES[activeCheckpointModalIdx] || [0, 1];
    const totalSubQns = endQ - startQ + 1;
    const globalQIdx = Math.min(questions.length - 1, startQ + checkpointSubQuestionIdx);
    const q = questions[globalQIdx] || questions[0];
    const cp = activeWorld.checkpoints[activeCheckpointModalIdx];

    setTotalQuestionsAttempted((c) => c + 1);

    if (selectedOptionIdx === q.correctIndex) {
      soundEngine.playCorrect();
      setFeedbackState('correct');
      const isFirstTry = attemptCount === 0;
      if (isFirstTry) {
        setFirstTryCorrectCount((c) => c + 1);
      }
      const bonusXp = isFirstTry ? 15 : 0;
      const earned = q.xpReward + bonusXp;
      const nextXp = sessionXp + earned;
      setSessionXp(nextXp);

      const isLastQuestionOfCheckpoint = checkpointSubQuestionIdx + 1 >= totalSubQns;
      if (isLastQuestionOfCheckpoint) {
        const nextCompleted = completedCheckpoints.includes(cp.id)
          ? completedCheckpoints
          : [...completedCheckpoints, cp.id];
        setCompletedCheckpoints(nextCompleted);

        const nextInv = inventory.includes(cp.rewardItemName)
          ? inventory
          : [...inventory, cp.rewardItemName];
        setInventory(nextInv);

        const nextClues = discoveredClues.includes(cp.clueFragment)
          ? discoveredClues
          : [...discoveredClues, cp.clueFragment];
        setDiscoveredClues(nextClues);

        const nextCheckpointIdx = Math.min(
          activeWorld.checkpoints.length - 1,
          activeCheckpointModalIdx + 1
        );
        const updatedProgress: ElimikaPlayProgress = {
          ...progress,
          totalXp: progress.totalXp + earned,
          collectedArtifacts: Array.from(
            new Set([...progress.collectedArtifacts, cp.rewardItemName])
          ),
          savedTreasureSession:
            nextCompleted.length >= activeWorld.checkpoints.length
              ? null
              : {
                  worldId: activeWorld.id,
                  cls: selectedClass,
                  subject: selectedSubject,
                  difficulty,
                  currentCheckpointIdx: nextCheckpointIdx,
                  completedCheckpoints: nextCompleted,
                  xpEarned: nextXp,
                  inventory: nextInv,
                },
        };
        persistProgress(updatedProgress);
      }
    } else {
      soundEngine.playWrong();
      setAttemptCount((a) => a + 1);
      setFeedbackState('wrong');
    }
  };

  const handleAdvanceAfterCorrect = () => {
    if (activeCheckpointModalIdx === null) return;
    const [startQ, endQ] = CHECKPOINT_QUESTION_RANGES[activeCheckpointModalIdx] || [0, 1];
    const totalSubQns = endQ - startQ + 1;

    if (checkpointSubQuestionIdx + 1 < totalSubQns) {
      soundEngine.playClick();
      setCheckpointSubQuestionIdx((s) => s + 1);
      setSelectedOptionIdx(null);
      setAttemptCount(0);
      setHintVisible(false);
      setFeedbackState('idle');
      return;
    }

    const isFinalStage = activeCheckpointModalIdx >= activeWorld.checkpoints.length - 1;
    if (isFinalStage) {
      soundEngine.playVictory();
      const badgeName = `Treasure Master: ${activeWorld.name}`;
      const bestPrev = progress.treasureHighScores[activeWorld.id] || 0;
      const updatedProgress: ElimikaPlayProgress = {
        ...progress,
        adventuresCompleted: Array.from(
          new Set([...progress.adventuresCompleted, activeWorld.id])
        ),
        unlockedBadges: Array.from(new Set([...progress.unlockedBadges, badgeName])),
        treasureHighScores: {
          ...progress.treasureHighScores,
          [activeWorld.id]: Math.max(bestPrev, sessionXp),
        },
        savedTreasureSession: null,
      };
      persistProgress(updatedProgress);
      setActiveCheckpointModalIdx(null);
      setPhase('TREASURE_REVEALED');
    } else {
      soundEngine.playUnlock();
      const nextIdx = activeCheckpointModalIdx + 1;
      setCurrentCheckpointIdx(nextIdx);
      setActiveCheckpointModalIdx(null);
      setCheckpointSubQuestionIdx(0);
      setSelectedOptionIdx(null);
      setAttemptCount(0);
      setHintVisible(false);
      setFeedbackState('idle');
    }
  };

  const renderRewardIcon = (iconType: TreasureCheckpoint['rewardItemIcon']) => {
    switch (iconType) {
      case 'key':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'gem':
        return <Gem className="w-4 h-4 text-sky-400" />;
      case 'map':
        return <MapIcon className="w-4 h-4 text-emerald-400" />;
      case 'scroll':
        return <Scroll className="w-4 h-4 text-purple-300" />;
      case 'compass':
        return <Compass className="w-4 h-4 text-orange-400" />;
      case 'crown':
        return <Crown className="w-4 h-4 text-yellow-300" />;
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Game Navigation & HUD Bar */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.stopBackgroundMusic();
              onExitToHub();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Elimika Play Hub</span>
          </button>
          <div>
            <div className="text-sm sm:text-base font-black text-amber-400 tracking-tight">
              NECTA Treasure Hunt
            </div>
            <div className="text-[11px] text-slate-400">
              {selectedClass} · {selectedSubject} · {difficulty} Mode
            </div>
          </div>
        </div>

        {/* HUD Metrics & Sound Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
          {phase !== 'SETUP' && (
            <>
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-bold text-amber-300">
                XP: {sessionXp}
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-bold text-emerald-300">
                Checkpoints: {completedCheckpoints.length} / {activeWorld.checkpoints.length}
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-bold text-sky-300">
                Time: {formatTime(elapsedSeconds)}
              </div>
              <button
                onClick={() => setPhase((p) => (p === 'PAUSED' ? 'EXPLORING' : 'PAUSED'))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                {phase === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{phase === 'PAUSED' ? 'Resume' : 'Pause'}</span>
              </button>
            </>
          )}

          {/* Audio Controls */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                const nextMute = !muted;
                setMuted(nextMute);
                soundEngine.setMuted(nextMute);
              }}
              className="text-slate-200 hover:text-amber-300 cursor-pointer"
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                soundEngine.setVolume(v);
                if (v > 0 && muted) {
                  setMuted(false);
                  soundEngine.setMuted(false);
                }
              }}
              aria-label="Sound volume"
              className="w-16 accent-amber-400 cursor-pointer"
            />
            <button
              onClick={() => {
                const nextMusic = !musicOn;
                setMusicOn(nextMusic);
                if (nextMusic && !muted) {
                  soundEngine.startBackgroundMusic('adventure');
                } else {
                  soundEngine.stopBackgroundMusic();
                }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                musicOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {musicOn ? 'Music: ON' : 'Music: OFF'}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== PHASE 1: ADVENTURE SETUP SCREEN ==================== */}
      {phase === 'SETUP' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Elimika Play · Interactive Curriculum Expedition
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  NECTA Treasure Hunt Adventure
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Explore iconic Tanzanian worlds, unlock 6 sequential academic checkpoints, collect keys, gems, and map fragments, and conquer the Final Guardian Examination to claim the Grand Treasure.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-1 shrink-0 tabular-nums">
                <div className="text-slate-400 font-semibold">Total Explorer XP</div>
                <div className="text-2xl font-black text-amber-400">{progress.totalXp} XP</div>
                <div className="text-slate-400">
                  Adventures Completed: {progress.adventuresCompleted.length} / {TREASURE_ADVENTURE_WORLDS.length}
                </div>
              </div>
            </div>

            {/* Resume Saved Session Banner */}
            {progress.savedTreasureSession && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-amber-300">
                    Saved Expedition Available ({progress.savedTreasureSession.cls} · {progress.savedTreasureSession.subject})
                  </div>
                  <div className="text-slate-300">
                    {progress.savedTreasureSession.completedCheckpoints.length} of 6 Checkpoints Unlocked · {progress.savedTreasureSession.xpEarned} XP Earned
                  </div>
                </div>
                <button
                  onClick={resumeSavedAdventure}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Resume Saved Expedition →
                </button>
              </div>
            )}

            {/* Step 1: Choose Adventure World */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-200">
                1. Select Your Adventure World
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TREASURE_ADVENTURE_WORLDS.map((world) => {
                  const selected = world.id === selectedWorldId;
                  const completed = progress.adventuresCompleted.includes(world.id);
                  return (
                    <button
                      key={world.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedWorldId(world.id);
                      }}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        selected
                          ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs text-amber-400 font-bold">
                          <span>{world.region}</span>
                          {completed && <span className="text-emerald-400">✓ Completed</span>}
                        </div>
                        <div className="text-base font-black text-white">{world.name}</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{world.description}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                        <span>Prize: {world.finalTreasureName}</span>
                        <span className="font-bold text-amber-300">6 Checkpoints</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Class, Subject & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  2. Select Class Level
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm"
                >
                  {PLAY_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  3. Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm"
                >
                  {PLAY_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  4. Select Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as GameDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border cursor-pointer transition-colors ${
                        difficulty === d
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Note: All questions are curriculum-aligned sample practice problems with full step-by-step explanations.
              </div>
              <button
                onClick={startNewAdventure}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Treasure Hunt Expedition</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ==================== PHASE 2: INTERACTIVE WORLD MAP & CHECKPOINTS ==================== */}
      {(phase === 'EXPLORING' || phase === 'PAUSED') && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Interactive Animated World Map */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-black text-amber-400">{activeWorld.name}</span>
                <span className="text-slate-400"> · Click an unlocked checkpoint on the map to solve its challenge</span>
              </div>
              <button
                onClick={startNewAdventure}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Map</span>
              </button>
            </div>

            <div className="relative w-full h-[380px] sm:h-[460px] select-none">
              <canvas
                ref={mapCanvasRef}
                width={860}
                height={460}
                className="w-full h-full block object-cover"
              />

              {/* Interactive Checkpoint Nodes Overlay */}
              {activeWorld.checkpoints.map((cp, idx) => {
                const isDone = completedCheckpoints.includes(cp.id);
                const isAvailable =
                  idx === 0 || completedCheckpoints.includes(activeWorld.checkpoints[idx - 1].id);
                const isCurrent = currentCheckpointIdx === idx;

                return (
                  <button
                    key={cp.id}
                    onClick={() => openCheckpointChallenge(idx)}
                    style={{ left: `${cp.xPct}%`, top: `${cp.yPct}%` }}
                    className={`-translate-x-1/2 -translate-y-1/2 absolute group transition-transform cursor-pointer ${
                      isCurrent ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                    }`}
                  >
                    <div
                      className={`px-3 py-1.5 rounded-xl border-2 shadow-lg flex items-center gap-1.5 text-xs font-black whitespace-nowrap ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-300 text-white'
                          : isAvailable
                          ? cp.isBossStage
                            ? 'bg-rose-600 border-amber-300 text-white'
                            : 'bg-amber-400 border-white text-slate-950'
                          : 'bg-slate-900/90 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                      ) : isAvailable ? (
                        renderRewardIcon(cp.rewardItemIcon)
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span>{cp.title}</span>
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-white bg-slate-950/85 px-2 py-0.5 rounded text-center">
                      {isDone
                        ? 'Completed ✓'
                        : isAvailable
                        ? cp.isBossStage
                          ? '⚔️ Final Boss Exam'
                          : cp.isSpecialStage
                          ? '★ Special Stage'
                          : 'Tap to Enter'
                        : 'Locked'}
                    </div>
                  </button>
                );
              })}

              {/* Pause Overlay */}
              {phase === 'PAUSED' && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-6 text-center z-30">
                  <h3 className="text-xl font-black text-white">Expedition Paused</h3>
                  <p className="text-xs text-slate-300 max-w-sm">
                    Take your time. Your unlocked checkpoints, artifacts, and XP are safely preserved.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPhase('EXPLORING')}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Resume Adventure
                    </button>
                    <button
                      onClick={() => setPhase('SETUP')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Change Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Active Challenge / Inventory & Discovered Clues */}
          <div className="lg:col-span-4 space-y-4">
            {activeCheckpointModalIdx !== null ? (
              (() => {
                const cp = activeWorld.checkpoints[activeCheckpointModalIdx];
                const [startQ, endQ] = CHECKPOINT_QUESTION_RANGES[activeCheckpointModalIdx] || [0, 1];
                const totalSubQns = endQ - startQ + 1;
                const globalQIdx = Math.min(questions.length - 1, startQ + checkpointSubQuestionIdx);
                const q = questions[globalQIdx] || questions[0];
                const isLastSubQn = checkpointSubQuestionIdx + 1 >= totalSubQns;
                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-[11px] font-bold text-amber-400">
                          {cp.title} · Question {globalQIdx + 1} of 20 (Stage Qn {checkpointSubQuestionIdx + 1}/{totalSubQns})
                        </div>
                        <div className="text-xs text-slate-400">
                          Topic: {q.topic} · Reward: +{q.xpReward} XP
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {renderRewardIcon(cp.rewardItemIcon)}
                        <span>{cp.rewardItemName}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">{q.sourceLabel}</div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white leading-relaxed">
                      <MathText text={q.question} />
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedOptionIdx === oIdx;
                        const isCorrectOption = oIdx === q.correctIndex;
                        let optionStyle =
                          'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-400/60';
                        if (feedbackState === 'correct' && isCorrectOption) {
                          optionStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200';
                        } else if (feedbackState === 'wrong' && isSelected) {
                          optionStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
                        } else if (isSelected) {
                          optionStyle = 'bg-amber-400/15 border-amber-400 text-amber-200';
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={feedbackState === 'correct'}
                            onClick={() => {
                              soundEngine.playClick();
                              setSelectedOptionIdx(oIdx);
                              if (feedbackState === 'wrong') setFeedbackState('idle');
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 transition-colors cursor-pointer ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded bg-slate-800 text-slate-200 font-black flex items-center justify-center shrink-0 text-[11px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <MathText text={opt} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Hint Display */}
                    {hintVisible && (
                      <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs text-amber-200">
                        <strong>Explorer Hint:</strong> <MathText text={q.hint} />
                      </div>
                    )}

                    {/* Wrong Attempt Constructive Feedback */}
                    {feedbackState === 'wrong' && (
                      <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700 text-xs text-rose-100 space-y-1.5">
                        <div className="font-bold">
                          Not quite right yet (Attempt {attemptCount}).
                        </div>
                        {attemptCount >= 2 ? (
                          <div>
                            <strong>Guided Academic Explanation:</strong>{' '}
                            <MathText text={q.explanation} />
                          </div>
                        ) : (
                          <div>
                            Review the question carefully, use the Explorer Hint if needed, and select another option.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Correct Answer Feedback & Step-by-Step Working */}
                    {feedbackState === 'correct' && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-xs text-emerald-100 space-y-2">
                        <div className="font-black text-emerald-300">
                          {isLastSubQn
                            ? `✓ Checkpoint Unlocked! You found: ${cp.rewardItemName}`
                            : `✓ Stage Question ${checkpointSubQuestionIdx + 1} of ${totalSubQns} Solved!`}
                        </div>
                        <div>
                          <strong>Step-by-Step Solution:</strong> <MathText text={q.explanation} />
                        </div>
                        {isLastSubQn && (
                          <div className="p-2 rounded-lg bg-slate-950/80 text-amber-300 font-semibold">
                            {cp.clueFragment}
                          </div>
                        )}
                        <button
                          onClick={handleAdvanceAfterCorrect}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                        >
                          {!isLastSubQn
                            ? `Next Stage Question (${checkpointSubQuestionIdx + 2}/${totalSubQns}) →`
                            : activeCheckpointModalIdx >= activeWorld.checkpoints.length - 1
                            ? 'Open Grand Treasure Vault →'
                            : 'Continue to Next Checkpoint →'}
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {feedbackState !== 'correct' && (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleUseHint}
                          disabled={hintVisible}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{hintVisible ? 'Hint Shown' : 'Use Hint (-10 XP)'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={selectedOptionIdx === null}
                          onClick={handleSubmitCheckpointAnswer}
                          className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs cursor-pointer"
                        >
                          Verify Answer
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-sm font-black text-white">
                  Select Next Unlocked Checkpoint
                </div>
                <p className="text-xs text-slate-300">
                  Click Checkpoint #{currentCheckpointIdx + 1} on the adventure map to solve the next curriculum puzzle.
                </p>
                <button
                  onClick={() => openCheckpointChallenge(currentCheckpointIdx)}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Open Checkpoint #{currentCheckpointIdx + 1} Challenge
                </button>
              </div>
            )}

            {/* Explorer Satchel (Collected Artifacts & Clues) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-black text-slate-200 flex items-center justify-between">
                <span>Collected Relics &amp; Clues ({inventory.length}/6)</span>
              </div>
              {inventory.length === 0 ? (
                <div className="text-xs text-slate-500">
                  Complete checkpoints to collect ancient keys, gems, compasses, and vault clues.
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {inventory.map((item, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-semibold"
                    >
                      ★ {item}
                    </div>
                  ))}
                  {discoveredClues.map((clue, i) => (
                    <div
                      key={`clue-${i}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300 text-[11px]"
                    >
                      {clue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ==================== PHASE 3: GRAND TREASURE REVEALED SUMMARY ==================== */}
      {phase === 'TREASURE_REVEALED' && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex items-center">
          <div className="w-full bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center mx-auto">
              <Crown className="w-9 h-9 text-amber-300" />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Expedition Complete · All 6 Checkpoints Conquered
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                You Uncovered {activeWorld.finalTreasureName}!
              </h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto">
                Outstanding work mastering {selectedClass} {selectedSubject} across {activeWorld.name}.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left tabular-nums">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Expedition XP</div>
                <div className="text-xl font-black text-amber-400">+{sessionXp} XP</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">First-Try Accuracy</div>
                <div className="text-xl font-black text-emerald-400">
                  {Math.round((firstTryCorrectCount / Math.max(1, activeWorld.checkpoints.length)) * 100)}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Time Taken</div>
                <div className="text-xl font-black text-sky-400">{formatTime(elapsedSeconds)}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Relics Collected</div>
                <div className="text-xl font-black text-purple-300">{inventory.length} / 6</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Achievement Badge Awarded: Treasure Master — {activeWorld.name}</span>
              </div>
              <div className="text-xs text-slate-300">
                Relics Added to Permanent Vault: {inventory.join(' · ')}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={startNewAdventure}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                Play Adventure Again
              </button>
              <button
                onClick={() => setPhase('SETUP')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Choose Another World / Subject
              </button>
              <button
                onClick={onExitToHub}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Return to Elimika Play Hub
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
