import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FlaskConical,
  HelpCircle,
  Key,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MathText } from '../utils/mathRenderer';
import { soundEngine } from './gameSoundEngine';
import {
  ESCAPE_ROOM_SCENARIOS,
  ElimikaPlayProgress,
  EscapeRoomPuzzleSet,
  EscapeRoomScenario,
  GameDifficulty,
  PLAY_CLASSES,
  PLAY_SUBJECTS,
  getEscapeRoomPuzzles,
  loadPlayProgress,
  savePlayProgress,
} from './gameDataAndStorage';

interface EscapeClassroomGameProps {
  initialClass?: string;
  initialSubject?: string;
  onExitToHub: () => void;
  onProgressUpdate?: (p: ElimikaPlayProgress) => void;
}

type EscapePhase = 'SETUP' | 'IN_ROOM' | 'PAUSED' | 'ESCAPED' | 'TIME_UP';

type RoomObjectId =
  | 'chalkboard'
  | 'desk'
  | 'lab_bench'
  | 'bookshelf'
  | 'clock'
  | 'cabinet'
  | 'logic_board'
  | 'exit_door';

interface RoomObjectHotspot {
  id: RoomObjectId;
  keyShortcut: string;
  label: string;
  zoneSubtitle: string;
  leftPct: number;
  topPct: number;
}

const ROOM_OBJECTS: RoomObjectHotspot[] = [
  {
    id: 'chalkboard',
    keyShortcut: '1',
    label: '1. Chalkboard & Smartboard',
    zoneSubtitle: 'Puzzle 1: 3-Digit Cipher',
    leftPct: 30,
    topPct: 26,
  },
  {
    id: 'clock',
    keyShortcut: '2',
    label: '2. Wall Clock',
    zoneSubtitle: 'Inspect Time & Calibration Clue',
    leftPct: 58,
    topPct: 18,
  },
  {
    id: 'bookshelf',
    keyShortcut: '3',
    label: '3. TIE Reference Bookshelf',
    zoneSubtitle: 'Inspect Formula & Law Tome',
    leftPct: 14,
    topPct: 48,
  },
  {
    id: 'desk',
    keyShortcut: '4',
    label: '4. Teacher’s Desk Drawer',
    zoneSubtitle: 'Inspect UV Lens & Notes',
    leftPct: 34,
    topPct: 68,
  },
  {
    id: 'lab_bench',
    keyShortcut: '5',
    label: '5. Science Lab Bench',
    zoneSubtitle: 'Puzzle 2: Structure & Function',
    leftPct: 56,
    topPct: 64,
  },
  {
    id: 'cabinet',
    keyShortcut: '6',
    label: '6. Locked Supply Cabinet',
    zoneSubtitle: 'Puzzle 3: Unlock Master Key',
    leftPct: 74,
    topPct: 48,
  },
  {
    id: 'logic_board',
    keyShortcut: '7',
    label: '7. Logic Synthesis Board',
    zoneSubtitle: 'Puzzle 4: Master Sequence',
    leftPct: 68,
    topPct: 28,
  },
  {
    id: 'exit_door',
    keyShortcut: '8',
    label: '8. Heavy Exit Door Keypad',
    zoneSubtitle: 'Final Escape Lock',
    leftPct: 88,
    topPct: 52,
  },
];

export const EscapeClassroomGame: React.FC<EscapeClassroomGameProps> = ({
  initialClass = 'Form 3',
  initialSubject = 'Basic Mathematics',
  onExitToHub,
  onProgressUpdate,
}) => {
  const [progress, setProgress] = useState<ElimikaPlayProgress>(() => loadPlayProgress());
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ESCAPE_ROOM_SCENARIOS[0].id);
  const [selectedClass, setSelectedClass] = useState<string>(
    PLAY_CLASSES.includes(initialClass as never) ? initialClass : 'Form 3'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    PLAY_SUBJECTS.includes(initialSubject as never) ? initialSubject : 'Basic Mathematics'
  );
  const [difficulty, setDifficulty] = useState<GameDifficulty>('Easy');
  const [untimedMode, setUntimedMode] = useState<boolean>(false);

  const [phase, setPhase] = useState<EscapePhase>('SETUP');
  const [activeObject, setActiveObject] = useState<RoomObjectId>('chalkboard');

  // Timer & Score state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionXp, setSessionXp] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showCurrentHint, setShowCurrentHint] = useState<boolean>(false);

  // Puzzle completion & inventory states
  const [puzzle1Solved, setPuzzle1Solved] = useState<boolean>(false);
  const [puzzle2Solved, setPuzzle2Solved] = useState<boolean>(false);
  const [puzzle3Solved, setPuzzle3Solved] = useState<boolean>(false);
  const [puzzle4Solved, setPuzzle4Solved] = useState<boolean>(false);

  const [inventory, setInventory] = useState<string[]>([]);
  const [puzzle1Input, setPuzzle1Input] = useState<string>('');
  const [puzzle2VerifiedIds, setPuzzle2VerifiedIds] = useState<string[]>([]);
  const [puzzle3SelectedIdx, setPuzzle3SelectedIdx] = useState<number | null>(null);
  const [puzzle4SelectedIdx, setPuzzle4SelectedIdx] = useState<number | null>(null);
  const [exitKeypadInput, setExitKeypadInput] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Audio controls
  const [muted, setMuted] = useState<boolean>(soundEngine.isMuted());
  const [musicOn, setMusicOn] = useState<boolean>(false);

  const activeScenario: EscapeRoomScenario = useMemo(
    () =>
      ESCAPE_ROOM_SCENARIOS.find((r) => r.id === selectedRoomId) || ESCAPE_ROOM_SCENARIOS[0],
    [selectedRoomId]
  );

  const puzzleSet: EscapeRoomPuzzleSet = useMemo(
    () => getEscapeRoomPuzzles(selectedRoomId, selectedClass, selectedSubject, difficulty),
    [selectedRoomId, selectedClass, selectedSubject, difficulty]
  );

  const solvedCount =
    (puzzle1Solved ? 1 : 0) +
    (puzzle2Solved ? 1 : 0) +
    (puzzle3Solved ? 1 : 0) +
    (puzzle4Solved ? 1 : 0);

  // Countdown & elapsed timer
  useEffect(() => {
    if (phase !== 'IN_ROOM') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      if (!untimedMode) {
        setRemainingSeconds((rem) => {
          if (rem <= 1) {
            soundEngine.playWrong();
            setPhase('TIME_UP');
            return 0;
          }
          return rem - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, untimedMode]);

  // Keyboard shortcuts 1-8 for inspecting room objects
  useEffect(() => {
    if (phase !== 'IN_ROOM') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      const found = ROOM_OBJECTS.find((o) => o.keyShortcut === e.key);
      if (found) {
        soundEngine.playClick();
        setActiveObject(found.id);
        setShowCurrentHint(false);
        setFeedbackBanner(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase]);

  useEffect(() => {
    return () => {
      soundEngine.stopBackgroundMusic();
    };
  }, []);

  const persistProgress = (updated: ElimikaPlayProgress) => {
    savePlayProgress(updated);
    setProgress(updated);
    onProgressUpdate?.(updated);
  };

  const addInventoryItem = (item: string) => {
    setInventory((prev) => (prev.includes(item) ? prev : [...prev, item]));
  };

  const startRoomSession = (forceUntimed?: boolean) => {
    soundEngine.playClick();
    const useUntimed = forceUntimed !== undefined ? forceUntimed : untimedMode;
    if (forceUntimed !== undefined) setUntimedMode(forceUntimed);

    const baseSecs =
      difficulty === 'Easy'
        ? activeScenario.defaultTimeSeconds
        : difficulty === 'Medium'
        ? Math.round(activeScenario.defaultTimeSeconds * 0.85)
        : Math.round(activeScenario.defaultTimeSeconds * 0.75);

    setRemainingSeconds(baseSecs);
    setElapsedSeconds(0);
    setSessionXp(0);
    setHintsUsed(0);
    setShowCurrentHint(false);
    setPuzzle1Solved(false);
    setPuzzle2Solved(false);
    setPuzzle3Solved(false);
    setPuzzle4Solved(false);
    setInventory([]);
    setPuzzle1Input('');
    setPuzzle2VerifiedIds([]);
    setPuzzle3SelectedIdx(null);
    setPuzzle4SelectedIdx(null);
    setExitKeypadInput('');
    setFeedbackBanner({
      type: 'info',
      message: useUntimed
        ? 'Untimed Practice Mode active. Inspect objects 1–8 to solve all 4 puzzles and unlock the Exit Door.'
        : 'Room Lockdown active! Inspect the Chalkboard, Lab Bench, Cabinet, and Logic Board to escape.',
    });
    setActiveObject('chalkboard');
    setPhase('IN_ROOM');

    if (musicOn && !muted) {
      soundEngine.startBackgroundMusic('mystery');
    }
  };

  const handleUseHint = () => {
    if (showCurrentHint) return;
    soundEngine.playDiscovery();
    setShowCurrentHint(true);
    setHintsUsed((h) => h + 1);
    if (hintsUsed >= 3) {
      setSessionXp((xp) => Math.max(0, xp - 10));
    }
  };

  const handleVerifyPuzzle1 = () => {
    const clean = puzzle1Input.trim();
    if (clean === puzzleSet.puzzle1Math.correctCode) {
      soundEngine.playCorrect();
      if (!puzzle1Solved) {
        setPuzzle1Solved(true);
        setSessionXp((xp) => xp + 75);
        addInventoryItem(`Chalkboard Cipher: ${puzzleSet.puzzle1Math.correctCode}`);
      }
      setFeedbackBanner({
        type: 'success',
        message: `Chalkboard Cipher Solved! Code ${puzzleSet.puzzle1Math.correctCode} added to your inventory.`,
      });
    } else {
      soundEngine.playWrong();
      setFeedbackBanner({
        type: 'error',
        message: `Incorrect 3-digit code ("${clean || 'empty'}"). Solve each equation for the 3 digits or click Hint.`,
      });
    }
  };

  const handleTogglePuzzle2Pair = (id: string) => {
    soundEngine.playClick();
    const next = puzzle2VerifiedIds.includes(id)
      ? puzzle2VerifiedIds
      : [...puzzle2VerifiedIds, id];
    setPuzzle2VerifiedIds(next);

    if (next.length === puzzleSet.puzzle2Matching.pairs.length && !puzzle2Solved) {
      soundEngine.playCorrect();
      setPuzzle2Solved(true);
      setSessionXp((xp) => xp + 75);
      addInventoryItem(`Lab Latch Digit: ${puzzleSet.puzzle2Matching.unlockedClueDigit}`);
      setFeedbackBanner({
        type: 'success',
        message: `All 3 Lab Structures Verified! Magnetic Latch Digit (${puzzleSet.puzzle2Matching.unlockedClueDigit}) unlocked.`,
      });
    }
  };

  const handleVerifyPuzzle3 = () => {
    if (puzzle3SelectedIdx === null) return;
    if (puzzle3SelectedIdx === puzzleSet.puzzle3CircuitOrLab.correctIndex) {
      soundEngine.playUnlock();
      if (!puzzle3Solved) {
        setPuzzle3Solved(true);
        setSessionXp((xp) => xp + 85);
        addInventoryItem(puzzleSet.puzzle3CircuitOrLab.unlockedItemName);
      }
      setFeedbackBanner({
        type: 'success',
        message: `Supply Cabinet Unlocked! You obtained the ${puzzleSet.puzzle3CircuitOrLab.unlockedItemName}.`,
      });
    } else {
      soundEngine.playWrong();
      setFeedbackBanner({
        type: 'error',
        message: 'Cabinet lock rejected that reading. Check the formula and try again.',
      });
    }
  };

  const handleVerifyPuzzle4 = () => {
    if (puzzle4SelectedIdx === null) return;
    if (puzzle4SelectedIdx === puzzleSet.puzzle4Logic.correctIndex) {
      soundEngine.playUnlock();
      if (!puzzle4Solved) {
        setPuzzle4Solved(true);
        setSessionXp((xp) => xp + 90);
        addInventoryItem(`Master Sequence: ${puzzleSet.puzzle4Logic.masterSequenceCode}`);
        setExitKeypadInput(puzzleSet.puzzle4Logic.masterSequenceCode);
      }
      setFeedbackBanner({
        type: 'success',
        message: `Master Escape Sequence (${puzzleSet.puzzle4Logic.masterSequenceCode}) synthesized! Head to Object #8 (Heavy Exit Door).`,
      });
    } else {
      soundEngine.playWrong();
      setFeedbackBanner({
        type: 'error',
        message: 'Sequence mismatch. Check the geometric/square progression pattern and try again.',
      });
    }
  };

  const handleAttemptFinalEscape = () => {
    if (!puzzle1Solved || !puzzle2Solved || !puzzle3Solved || !puzzle4Solved) {
      soundEngine.playWrong();
      setFeedbackBanner({
        type: 'error',
        message: `Security Lock Active: You have solved ${solvedCount} of 4 station puzzles. Complete all 4 puzzles first!`,
      });
      return;
    }

    const cleanCode = exitKeypadInput.trim();
    if (cleanCode !== puzzleSet.puzzle4Logic.masterSequenceCode) {
      soundEngine.playWrong();
      setFeedbackBanner({
        type: 'error',
        message: `Invalid Master Keypad Code. Enter ${puzzleSet.puzzle4Logic.masterSequenceCode} from your Logic Board.`,
      });
      return;
    }

    soundEngine.playVictory();
    const timeBonus = untimedMode ? 50 : Math.min(150, Math.floor(remainingSeconds / 3));
    const totalRoomXp = sessionXp + 100 + timeBonus;
    setSessionXp(totalRoomXp);

    const badgeName = `Escape Specialist: ${activeScenario.name}`;
    const prevBestTime = progress.escapeBestTimes[activeScenario.id] || 99999;
    const updated: ElimikaPlayProgress = {
      ...progress,
      totalXp: progress.totalXp + totalRoomXp,
      roomsEscaped: Array.from(new Set([...progress.roomsEscaped, activeScenario.id])),
      unlockedBadges: Array.from(new Set([...progress.unlockedBadges, badgeName])),
      escapeBestTimes: {
        ...progress.escapeBestTimes,
        [activeScenario.id]: Math.min(prevBestTime, elapsedSeconds),
      },
    };
    persistProgress(updated);
    setPhase('ESCAPED');
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header & HUD */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
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
            <div className="text-sm sm:text-base font-black text-sky-400 tracking-tight">
              Escape the Classroom
            </div>
            <div className="text-[11px] text-slate-400">
              {activeScenario.name} · {selectedClass} · {selectedSubject}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs tabular-nums">
          {phase !== 'SETUP' && (
            <>
              <div
                className={`px-3 py-1.5 rounded-lg border font-black flex items-center gap-1.5 ${
                  !untimedMode && remainingSeconds < 90
                    ? 'bg-rose-950 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-sky-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {untimedMode
                    ? `Practice Time: ${formatClock(elapsedSeconds)}`
                    : `Countdown: ${formatClock(remainingSeconds)}`}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-bold text-emerald-300">
                Puzzles Solved: {solvedCount} / 4
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-bold text-amber-300">
                XP: {sessionXp}
              </div>

              <button
                onClick={() => setPhase((p) => (p === 'PAUSED' ? 'IN_ROOM' : 'PAUSED'))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                {phase === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{phase === 'PAUSED' ? 'Resume' : 'Pause'}</span>
              </button>
            </>
          )}

          {/* Audio Controls */}
          <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                const nextMute = !muted;
                setMuted(nextMute);
                soundEngine.setMuted(nextMute);
              }}
              className="text-slate-200 hover:text-sky-300 cursor-pointer"
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                const nextMusic = !musicOn;
                setMusicOn(nextMusic);
                if (nextMusic && !muted) {
                  soundEngine.startBackgroundMusic('mystery');
                } else {
                  soundEngine.stopBackgroundMusic();
                }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                musicOn ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {musicOn ? 'Music: ON' : 'Music: OFF'}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== PHASE 1: SETUP SCREEN ==================== */}
      {phase === 'SETUP' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Elimika Play · Interactive Academic Escape Room
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Escape the Classroom
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                  Inspect interactive objects around the room, uncover hidden clues, solve 4 sequential curriculum puzzles, and enter the master sequence into the exit keypad before time runs out.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-1 shrink-0 tabular-nums">
                <div className="text-slate-400 font-semibold">Rooms Escaped</div>
                <div className="text-2xl font-black text-sky-400">
                  {progress.roomsEscaped.length} / {ESCAPE_ROOM_SCENARIOS.length}
                </div>
                <div className="text-slate-400">Total XP: {progress.totalXp}</div>
              </div>
            </div>

            {/* Room Selection */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-200">1. Choose an Escape Room</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ESCAPE_ROOM_SCENARIOS.map((room) => {
                  const selected = room.id === selectedRoomId;
                  const escaped = progress.roomsEscaped.includes(room.id);
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedRoomId(room.id);
                        setDifficulty(room.recommendedDifficulty);
                      }}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        selected
                          ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-400/30'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                          <span>{room.environment}</span>
                          {escaped && <span className="text-emerald-400">✓ Escaped</span>}
                        </div>
                        <div className="text-base font-black text-white">{room.name}</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{room.description}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                        <span>Recommended: {room.recommendedDifficulty}</span>
                        <span className="font-bold text-sky-300">
                          {Math.floor(room.defaultTimeSeconds / 60)} mins
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Class, Subject, Difficulty & Timer Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  2. Class Level
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
                  3. Focus Subject
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
                  4. Difficulty
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Easy', 'Medium', 'Hard'] as GameDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 px-2 rounded-xl font-bold text-xs border cursor-pointer ${
                        difficulty === d
                          ? 'bg-sky-400 text-slate-950 border-sky-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  5. Timer Mode
                </label>
                <button
                  type="button"
                  onClick={() => setUntimedMode((u) => !u)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs border cursor-pointer ${
                    untimedMode
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  {untimedMode ? '✓ Untimed Practice Mode' : '⏱️ Countdown Timer Mode'}
                </button>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Tip: You can click any object in the room or press keyboard keys 1–8 to inspect it.
              </div>
              <button
                onClick={() => startRoomSession()}
                className="px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enter Escape Room</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ==================== PHASE 2: INTERACTIVE ROOM EXPLORATION ==================== */}
      {(phase === 'IN_ROOM' || phase === 'PAUSED') && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Cols: Interactive 3D-Perspective Classroom / Lab Environment */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-black text-sky-400">{activeScenario.name}</span>
                  <span className="text-slate-400"> · Click any object (or press 1–8) to inspect</span>
                </div>
                <button
                  onClick={() => startRoomSession()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Room</span>
                </button>
              </div>

              {/* 3D-Perspective Architectural Room Stage */}
              <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-950 overflow-hidden select-none">
                {/* Perspective Room SVG Architecture (Walls, Floor, Chalkboard, Windows, Lab Bench, Door) */}
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full object-cover"
                  aria-label="Interactive Classroom Escape Room"
                >
                  <defs>
                    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#090d16" />
                    </linearGradient>
                  </defs>

                  {/* Back & Side Walls */}
                  <rect x="0" y="0" width="800" height="310" fill="url(#wallGrad)" />
                  {/* Perspective Floor */}
                  <polygon points="0,450 800,450 700,310 100,310" fill="url(#floorGrad)" />
                  <line x1="100" y1="310" x2="700" y2="310" stroke="#334155" strokeWidth="3" />
                  <line x1="100" y1="310" x2="0" y2="450" stroke="#334155" strokeWidth="2" />
                  <line x1="700" y1="310" x2="800" y2="450" stroke="#334155" strokeWidth="2" />

                  {/* 1. Chalkboard on Back Wall */}
                  <rect
                    x="150"
                    y="65"
                    width="240"
                    height="115"
                    rx="6"
                    fill="#064e3b"
                    stroke="#b45309"
                    strokeWidth="6"
                  />
                  <text x="170" y="100" fill="#a7f3d0" fontSize="13" fontFamily="monospace" fontWeight="bold">
                    3A - 2 = 4 | √16 = B | 2³ = C
                  </text>
                  <text x="170" y="128" fill="#fde68a" fontSize="11" fontFamily="monospace">
                    PIN = [ A ][ B ][ C ]
                  </text>

                  {/* 2. Wall Clock */}
                  <circle cx="465" cy="80" r="24" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />
                  <line x1="465" y1="80" x2="465" y2="63" stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1="465" y1="80" x2="480" y2="85" stroke="#f59e0b" strokeWidth="2.5" />

                  {/* 3. TIE Reference Bookshelf (Left Wall) */}
                  <rect x="65" y="135" width="70" height="175" fill="#451a03" stroke="#78350f" strokeWidth="4" />
                  <rect x="73" y="150" width="14" height="35" fill="#2563eb" />
                  <rect x="90" y="150" width="14" height="35" fill="#10b981" />
                  <rect x="107" y="150" width="14" height="35" fill="#f59e0b" />
                  <rect x="73" y="200" width="16" height="38" fill="#8b5cf6" />
                  <rect x="93" y="200" width="18" height="38" fill="#ec4899" />

                  {/* 4. Teacher's Desk */}
                  <rect x="200" y="265" width="140" height="70" rx="4" fill="#78350f" stroke="#92400e" strokeWidth="3" />
                  <rect x="245" y="280" width="50" height="22" fill="#451a03" stroke="#fbbf24" strokeWidth="1.5" />

                  {/* 5. Science Lab Bench */}
                  <rect x="380" y="255" width="165" height="80" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                  <circle cx="430" cy="240" r="12" fill="#0ea5e9" opacity="0.8" />
                  <polygon points="465,255 478,225 491,255" fill="#10b981" opacity="0.85" />

                  {/* 6. Locked Supply Cabinet */}
                  <rect x="560" y="150" width="78" height="155" rx="4" fill="#334155" stroke="#64748b" strokeWidth="3" />
                  <line x1="599" y1="150" x2="599" y2="305" stroke="#1e293b" strokeWidth="2" />

                  {/* 7. Logic Synthesis Board */}
                  <rect x="515" y="75" width="115" height="60" rx="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="3" />

                  {/* 8. Heavy Exit Door & Keypad (Right Wall) */}
                  <polygon
                    points="675,115 765,140 765,395 675,325"
                    fill={solvedCount === 4 ? '#064e3b' : '#31102F'}
                    stroke={solvedCount === 4 ? '#34d399' : '#f43f5e'}
                    strokeWidth="4"
                  />
                  <rect x="652" y="220" width="16" height="28" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                </svg>

                {/* Interactive Hotspot Buttons */}
                {ROOM_OBJECTS.map((obj) => {
                  const isSelected = activeObject === obj.id;
                  const isSolvedObj =
                    (obj.id === 'chalkboard' && puzzle1Solved) ||
                    (obj.id === 'lab_bench' && puzzle2Solved) ||
                    (obj.id === 'cabinet' && puzzle3Solved) ||
                    (obj.id === 'logic_board' && puzzle4Solved);

                  return (
                    <button
                      key={obj.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveObject(obj.id);
                        setShowCurrentHint(false);
                        setFeedbackBanner(null);
                      }}
                      style={{ left: `${obj.leftPct}%`, top: `${obj.topPct}%` }}
                      className={`-translate-x-1/2 -translate-y-1/2 absolute transition-transform cursor-pointer ${
                        isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                      }`}
                    >
                      <div
                        className={`px-2.5 py-1.5 rounded-xl border-2 shadow-lg flex items-center gap-1.5 text-[11px] font-black whitespace-nowrap ${
                          isSolvedObj
                            ? 'bg-emerald-600 border-emerald-200 text-white'
                            : isSelected
                            ? 'bg-sky-400 border-white text-slate-950'
                            : obj.id === 'exit_door'
                            ? 'bg-rose-600 border-amber-300 text-white'
                            : 'bg-slate-900/95 border-slate-600 text-slate-100'
                        }`}
                      >
                        {isSolvedObj ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                        ) : obj.id === 'exit_door' ? (
                          solvedCount === 4 ? (
                            <Unlock className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-rose-200 shrink-0" />
                          )
                        ) : (
                          <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        )}
                        <span>{obj.label}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Pause Overlay */}
                {phase === 'PAUSED' && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-4 p-6 text-center z-30">
                    <h3 className="text-xl font-black text-white">Escape Room Paused</h3>
                    <p className="text-xs text-slate-300 max-w-sm">
                      Timer is paused. Take a breath and resume when ready.
                    </p>
                    <button
                      onClick={() => setPhase('IN_ROOM')}
                      className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Resume Escape Room
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory & Collected Clues Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-black text-slate-200">
                <span>Collected Inventory &amp; Code Fragments ({inventory.length})</span>
                <span className="text-slate-400">
                  Master Sequence Status: {puzzle4Solved ? puzzleSet.puzzle4Logic.masterSequenceCode : 'Incomplete'}
                </span>
              </div>
              {inventory.length === 0 ? (
                <div className="text-xs text-slate-400">
                  No items collected yet. Inspect the Chalkboard (#1), Desk (#4), Lab Bench (#5), and Cabinet (#6).
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {inventory.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-sky-500/40 text-xs font-bold text-sky-300 flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Active Object Inspection & Academic Puzzle Deck */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            {feedbackBanner && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  feedbackBanner.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : feedbackBanner.type === 'error'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                    : 'bg-sky-950/70 border-sky-500/50 text-sky-200'
                }`}
              >
                {feedbackBanner.message}
              </div>
            )}

            {/* OBJECT 1: CHALKBOARD (PUZZLE 1 - MATH 3-DIGIT CODE) */}
            {activeObject === 'chalkboard' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-bold text-sky-400">Object #1 · Interactive Chalkboard</div>
                    <h3 className="text-base font-black text-white">{puzzleSet.puzzle1Math.title}</h3>
                  </div>
                  {puzzle1Solved && (
                    <span className="text-xs font-bold text-emerald-400">✓ Solved</span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <MathText text={puzzleSet.puzzle1Math.prompt} />
                </p>

                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-700/60 text-xs sm:text-sm font-bold text-emerald-100">
                  <MathText text={puzzleSet.puzzle1Math.equationDisplay} />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={puzzle1Input}
                    onChange={(e) => setPuzzle1Input(e.target.value)}
                    placeholder="Enter 3-digit PIN (e.g. 248)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-black tracking-widest text-sm"
                  />
                  <button
                    onClick={handleVerifyPuzzle1}
                    className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Unlock PIN
                  </button>
                </div>

                {showCurrentHint && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700 text-xs text-amber-200">
                    <strong>Hint:</strong> <MathText text={puzzleSet.puzzle1Math.hint} />
                  </div>
                )}

                {puzzle1Solved && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong>Academic Explanation:</strong>{' '}
                    <MathText text={puzzleSet.puzzle1Math.explanation} />
                  </div>
                )}
              </div>
            )}

            {/* OBJECT 2: WALL CLOCK */}
            {activeObject === 'clock' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-xs font-bold text-sky-400">Object #2 · Laboratory Wall Clock</div>
                  <h3 className="text-base font-black text-white">Inspecting the Frozen Wall Clock</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The clock hands are frozen. Engraved on the brass rim is a technician’s reminder for the Locked Supply Cabinet (#6):
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-semibold space-y-1.5">
                  <div>“To release the Brass Master Key in Cabinet #6:”</div>
                  <div>
                    <MathText text="• For Electric Circuits: Apply Ohm’s Law $I = \frac{V}{R}$." />
                  </div>
                  <div>
                    <MathText text="• For Map Scales ($1:50,000$): $1\text{ cm}$ on the map equals $0.5\text{ km}$ on the ground." />
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playDiscovery();
                    addInventoryItem('Clock Calibration Note');
                    setActiveObject('cabinet');
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Save Note &amp; Inspect Locked Cabinet (#6) →
                </button>
              </div>
            )}

            {/* OBJECT 3: TIE REFERENCE BOOKSHELF */}
            {activeObject === 'bookshelf' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-xs font-bold text-sky-400">Object #3 · TIE Reference Bookshelf</div>
                  <h3 className="text-base font-black text-white">Official Curriculum Formula &amp; Concept Tome</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-300">1. Logarithms &amp; Exponents:</strong>{' '}
                    <MathText text="If $\log_{10}(x) = k$, then $x = 10^k$. Also $2^3 = 8$ and $\sqrt{16} = 4$." />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-300">2. Biology &amp; Chemistry Practicals:</strong>{' '}
                    <MathText text="Chloroplasts trap light for photosynthesis; Iodine turns blue-black with starch; Mitochondria generate ATP." />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-sky-300">3. Sequences &amp; Series:</strong>{' '}
                    <MathText text="In a Geometric Progression $2, 4, 8, 16, \dots$ with ratio $r = 2$, the 5th term is $16 \times 2 = 32$." />
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playDiscovery();
                    addInventoryItem('TIE Formula Reference Bookmark');
                    setFeedbackBanner({
                      type: 'info',
                      message: 'Formula Reference Bookmark added to your inventory!',
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Bookmark Reference Formulas</span>
                </button>
              </div>
            )}

            {/* OBJECT 4: TEACHER'S DESK DRAWER */}
            {activeObject === 'desk' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-xs font-bold text-sky-400">Object #4 · Teacher’s Desk Drawer</div>
                  <h3 className="text-base font-black text-white">Chief Invigilator’s Desk Inspection</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inside the top drawer, you find a UV Magnifying Lens and the Invigilator’s Security Protocol card:
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-slate-200 space-y-1.5">
                  <div className="font-bold text-amber-300">Exit Door Security Protocol:</div>
                  <div>1. Solve the Chalkboard 3-digit PIN (Object #1).</div>
                  <div>2. Verify all 3 specimens on the Science Lab Bench (Object #5).</div>
                  <div>3. Unlock the Brass Master Key inside the Supply Cabinet (Object #6).</div>
                  <div>4. Synthesize the Master Sequence on the Logic Board (Object #7).</div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playDiscovery();
                    addInventoryItem('UV Magnifier Lens');
                    setActiveObject('lab_bench');
                  }}
                  className="w-full py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Collect UV Lens &amp; Inspect Lab Bench (#5) →
                </button>
              </div>
            )}

            {/* OBJECT 5: SCIENCE LAB BENCH (PUZZLE 2) */}
            {activeObject === 'lab_bench' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-bold text-sky-400">Object #5 · Science Laboratory Bench</div>
                    <h3 className="text-base font-black text-white">{puzzleSet.puzzle2Matching.title}</h3>
                  </div>
                  {puzzle2Solved && (
                    <span className="text-xs font-bold text-emerald-400">✓ Solved</span>
                  )}
                </div>

                <p className="text-xs text-slate-300">{puzzleSet.puzzle2Matching.prompt}</p>

                <div className="space-y-2.5">
                  {puzzleSet.puzzle2Matching.pairs.map((pair) => {
                    const verified = puzzle2VerifiedIds.includes(pair.id);
                    return (
                      <div
                        key={pair.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          verified
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                            : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-amber-300">{pair.structure}</span>
                          <button
                            onClick={() => handleTogglePuzzle2Pair(pair.id)}
                            className={`px-2.5 py-1 rounded-lg font-black text-[11px] cursor-pointer ${
                              verified
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                            }`}
                          >
                            {verified ? '✓ Verified' : 'Verify Match'}
                          </button>
                        </div>
                        <div className="text-slate-300">
                          <MathText text={pair.functionDesc} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {puzzle2Solved && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong>Academic Explanation:</strong>{' '}
                    <MathText text={puzzleSet.puzzle2Matching.explanation} />
                  </div>
                )}
              </div>
            )}

            {/* OBJECT 6: LOCKED SUPPLY CABINET (PUZZLE 3) */}
            {activeObject === 'cabinet' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-bold text-sky-400">Object #6 · Locked Supply Cabinet</div>
                    <h3 className="text-base font-black text-white">{puzzleSet.puzzle3CircuitOrLab.title}</h3>
                  </div>
                  {puzzle3Solved && (
                    <span className="text-xs font-bold text-emerald-400">✓ Solved</span>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  <MathText text={puzzleSet.puzzle3CircuitOrLab.prompt} />
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white">
                  <MathText text={puzzleSet.puzzle3CircuitOrLab.question} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {puzzleSet.puzzle3CircuitOrLab.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundEngine.playClick();
                        setPuzzle3SelectedIdx(idx);
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                        puzzle3SelectedIdx === idx
                          ? 'bg-sky-400/20 border-sky-400 text-sky-200'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <MathText text={opt} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleVerifyPuzzle3}
                  disabled={puzzle3SelectedIdx === null}
                  className="w-full py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-40 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Unlock Supply Cabinet
                </button>

                {showCurrentHint && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700 text-xs text-amber-200">
                    <strong>Hint:</strong> <MathText text={puzzleSet.puzzle3CircuitOrLab.hint} />
                  </div>
                )}

                {puzzle3Solved && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong>Academic Explanation:</strong>{' '}
                    <MathText text={puzzleSet.puzzle3CircuitOrLab.explanation} />
                  </div>
                )}
              </div>
            )}

            {/* OBJECT 7: MATHEMATICAL LOGIC BOARD (PUZZLE 4) */}
            {activeObject === 'logic_board' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-bold text-sky-400">Object #7 · Logic Synthesis Board</div>
                    <h3 className="text-base font-black text-white">{puzzleSet.puzzle4Logic.title}</h3>
                  </div>
                  {puzzle4Solved && (
                    <span className="text-xs font-bold text-emerald-400">✓ Solved</span>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  <MathText text={puzzleSet.puzzle4Logic.prompt} />
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white">
                  <MathText text={puzzleSet.puzzle4Logic.question} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {puzzleSet.puzzle4Logic.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundEngine.playClick();
                        setPuzzle4SelectedIdx(idx);
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                        puzzle4SelectedIdx === idx
                          ? 'bg-sky-400/20 border-sky-400 text-sky-200'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <MathText text={opt} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleVerifyPuzzle4}
                  disabled={puzzle4SelectedIdx === null}
                  className="w-full py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-40 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Synthesize Master Escape Sequence
                </button>

                {showCurrentHint && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700 text-xs text-amber-200">
                    <strong>Hint:</strong> <MathText text={puzzleSet.puzzle4Logic.hint} />
                  </div>
                )}

                {puzzle4Solved && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong>Academic Explanation:</strong>{' '}
                    <MathText text={puzzleSet.puzzle4Logic.explanation} />
                  </div>
                )}
              </div>
            )}

            {/* OBJECT 8: HEAVY EXIT DOOR & DIGITAL KEYPAD */}
            {activeObject === 'exit_door' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-xs font-bold text-rose-400">Object #8 · Heavy Exit Door Keypad</div>
                  <h3 className="text-base font-black text-white">Final Escape Lock Verification</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`p-2.5 rounded-xl border font-bold ${
                      puzzle1Solved
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    1. Chalkboard PIN: {puzzle1Solved ? puzzleSet.puzzle1Math.correctCode : 'Locked'}
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-bold ${
                      puzzle2Solved
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    2. Lab Latch: {puzzle2Solved ? `Digit ${puzzleSet.puzzle2Matching.unlockedClueDigit}` : 'Locked'}
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-bold ${
                      puzzle3Solved
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    3. Brass Key: {puzzle3Solved ? 'Collected ✓' : 'Locked'}
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border font-bold ${
                      puzzle4Solved
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    4. Master Code: {puzzle4Solved ? puzzleSet.puzzle4Logic.masterSequenceCode : 'Locked'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Enter Master Escape Sequence:
                  </label>
                  <input
                    type="text"
                    value={exitKeypadInput}
                    onChange={(e) => setExitKeypadInput(e.target.value)}
                    placeholder={
                      puzzle4Solved
                        ? puzzleSet.puzzle4Logic.masterSequenceCode
                        : 'Solve Puzzles 1–4 first'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-black tracking-wider text-sm"
                  />
                </div>

                <button
                  onClick={handleAttemptFinalEscape}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm cursor-pointer shadow-lg"
                >
                  Unlock Exit Door &amp; Escape Now →
                </button>
              </div>
            )}

            {/* Shared Hint Footer Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleUseHint}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {hintsUsed < 3
                    ? `Free Hint (${3 - hintsUsed} left)`
                    : 'Request Hint (-10 XP)'}
                </span>
              </button>
              <span className="text-slate-400">
                Station {activeObject.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </main>
      )}

      {/* ==================== PHASE 3: ESCAPED VICTORY SCREEN ==================== */}
      {phase === 'ESCAPED' && (
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex items-center">
          <div className="w-full bg-slate-900 border-2 border-emerald-400/80 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto">
              <Unlock className="w-9 h-9 text-emerald-300" />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Door Unlocked · Escape Successful!
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                You Escaped {activeScenario.name}!
              </h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto">
                Brilliant analytical deduction! You solved all 4 curriculum stations and unlocked the exit with code{' '}
                <strong className="text-amber-300">{puzzleSet.puzzle4Logic.masterSequenceCode}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left tabular-nums">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Room XP</div>
                <div className="text-xl font-black text-amber-400">+{sessionXp} XP</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Escape Time</div>
                <div className="text-xl font-black text-sky-400">{formatClock(elapsedSeconds)}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Puzzles Solved</div>
                <div className="text-xl font-black text-emerald-400">4 / 4</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Hints Used</div>
                <div className="text-xl font-black text-purple-300">{hintsUsed}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Badge Earned: Escape Specialist — {activeScenario.name}</span>
              </div>
              <div className="text-slate-300">
                Academic Concepts Mastered: Algebraic Equations, Biological/Chemical Structure-Function Analysis, Ohm’s Law / Map Scale Calculation, and Mathematical Sequences.
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startRoomSession()}
                className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                Play Room Again
              </button>
              <button
                onClick={() => setPhase('SETUP')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Try Another Escape Room
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

      {/* ==================== PHASE 4: TIME UP RETRY SCREEN ==================== */}
      {phase === 'TIME_UP' && (
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex items-center">
          <div className="w-full bg-slate-900 border-2 border-rose-500/70 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Time Ran Out!</h2>
            <p className="text-sm text-slate-300">
              You solved {solvedCount} of 4 puzzles before the countdown reached zero. Don’t worry—every great scholar learns by trying again!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startRoomSession(false)}
                className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                Retry With Timer
              </button>
              <button
                onClick={() => startRoomSession(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                Retry in Untimed Practice Mode
              </button>
              <button
                onClick={() => setPhase('SETUP')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                Room Setup
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
