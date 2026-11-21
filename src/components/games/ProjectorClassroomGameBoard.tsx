import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Clock,
  Crown,
  Gift,
  Maximize2,
  Minimize2,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  ClassroomGameCustomization,
  ClassroomGameQuestion,
  ClassroomGameSessionResult,
  ClassroomTeamStanding,
  DEFAULT_TEAM_PRESETS,
  saveClassroomGameResultToStorage,
} from '../../games/teacherClassroomGameEngine';
import { soundEngine } from '../../games/gameSoundEngine';
import {
  ELIMIKA_BATTLE_THEMES,
  ElimikaBattleThemeId,
  getElimikaBattleTheme,
} from '../../games/elimikaBattleThemes';
import { MathText } from '../../utils/mathRenderer';

interface ProjectorClassroomGameBoardProps {
  gameId: string;
  gameTitle: string;
  subject: string;
  cls: string;
  topic: string;
  questions: ClassroomGameQuestion[];
  customization: ClassroomGameCustomization;
  onExitToSetup: () => void;
  onResultSaved?: (result: ClassroomGameSessionResult) => void;
}

type LuckyBoxEffect = 'bonus' | 'steal' | 'lose';

interface LuckyBoxPayload {
  id: string;
  effect: LuckyBoxEffect;
  title: string;
  description: string;
  points: number;
}

type BoardTile =
  | {
      tileNumber: number;
      kind: 'question';
      id: string;
      question: ClassroomGameQuestion;
    }
  | {
      tileNumber: number;
      kind: 'lucky';
      id: string;
      lucky: LuckyBoxPayload;
    };

function getAnswerDisplay(q: ClassroomGameQuestion): string {
  if (q.questionType === 'short_answer') {
    return q.shortAnswer || q.options[0] || '';
  }
  if (q.questionType === 'true_false') {
    return q.correctIndex === 1 ? 'False' : 'True';
  }
  return q.options[q.correctIndex] || q.shortAnswer || q.options[0] || '';
}

function createLuckyPayloads(count: number): LuckyBoxPayload[] {
  const templates: Array<Omit<LuckyBoxPayload, 'id'>> = [
    {
      effect: 'bonus',
      title: 'Lucky Bonus!',
      description: 'No question! Your team wins +20 free bonus points!',
      points: 20,
    },
    {
      effect: 'steal',
      title: 'Team Point Gift!',
      description: 'Pick another team to give 15 of their points to your team!',
      points: 15,
    },
    {
      effect: 'lose',
      title: 'Oops! Unlucky Box',
      description: 'Bad luck! Your team loses 15 points.',
      points: 15,
    },
    {
      effect: 'bonus',
      title: 'Super Jackpot!',
      description: 'Lucky pick! Your team gets +25 free points!',
      points: 25,
    },
    {
      effect: 'steal',
      title: 'Lucky Point Transfer!',
      description: 'Choose any team to hand over 20 points to your team!',
      points: 20,
    },
    {
      effect: 'lose',
      title: 'Slip Up!',
      description: 'Oh no! Lose 10 points this turn.',
      points: 10,
    },
  ];

  return Array.from({ length: count }, (_, idx) => {
    const tpl = templates[idx % templates.length];
    return {
      ...tpl,
      id: `lucky-${idx + 1}-${Date.now()}`,
    };
  });
}

/**
 * Splits N tiles into balanced rows so the grid autofits the viewport cleanly
 * with ZERO empty gaps at the bottom-right corner.
 */
function buildBalancedRows(tiles: BoardTile[]): BoardTile[][] {
  const n = tiles.length;
  if (n === 0) return [];
  if (n <= 2) return [tiles];

  // Try exact clean rectangular factorization first (e.g. 8->2x4, 12->3x4, 16->4x4, 20->4x5, 24->4x6)
  let bestRows = 0;
  let bestScore = Infinity;

  for (let rows = 2; rows <= Math.min(6, n); rows++) {
    if (n % rows === 0) {
      const cols = n / rows;
      if (cols >= rows && cols / rows <= 2.6) {
        const ratioDiff = Math.abs(cols / rows - 1.45);
        if (ratioDiff < bestScore) {
          bestScore = ratioDiff;
          bestRows = rows;
        }
      }
    }
  }

  if (bestRows > 0) {
    const cols = n / bestRows;
    const result: BoardTile[][] = [];
    for (let r = 0; r < bestRows; r++) {
      result.push(tiles.slice(r * cols, (r + 1) * cols));
    }
    return result;
  }

  // Fallback for prime/odd totals: distribute evenly across rows so every row stretches 100% width with zero gap
  const targetRows =
    n <= 6 ? 2 : n <= 12 ? 3 : n <= 20 ? 4 : n <= 30 ? 5 : Math.ceil(Math.sqrt(n * 0.7));
  const basePerRow = Math.floor(n / targetRows);
  const remainder = n % targetRows;
  const result: BoardTile[][] = [];
  let cursor = 0;
  for (let r = 0; r < targetRows; r++) {
    const rowLen = basePerRow + (r < remainder ? 1 : 0);
    result.push(tiles.slice(cursor, cursor + rowLen));
    cursor += rowLen;
  }
  return result;
}

export const ProjectorClassroomGameBoard: React.FC<ProjectorClassroomGameBoardProps> = ({
  gameId,
  gameTitle,
  subject,
  cls,
  topic,
  questions,
  customization,
  onExitToSetup,
  onResultSaved,
}) => {
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [quickMenuOpen, setQuickMenuOpen] = useState<boolean>(false);
  const [activeThemeId, setActiveThemeId] = useState<ElimikaBattleThemeId>(
    customization.boardTheme || 'numbers'
  );

  const activeTheme = useMemo(() => getElimikaBattleTheme(activeThemeId), [activeThemeId]);

  const answerDisplayMode = customization.answerDisplayMode || 'answer_only';
  const luckyBoxesEnabled = customization.luckyBoxesEnabled !== false;
  const requestedLuckyCount = luckyBoxesEnabled ? Math.max(0, customization.luckyBoxCount ?? 4) : 0;

  // Build unified board tiles (questions + shuffled lucky mystery boxes)
  const buildBoardTiles = (forceShuffle?: boolean): BoardTile[] => {
    let pool = [...questions];
    if (customization.difficultyFilter !== 'Mixed') {
      const diffMatches = pool.filter((q) => q.difficulty === customization.difficultyFilter);
      if (diffMatches.length > 0) pool = diffMatches;
    }

    const shouldShuffleQuestions =
      forceShuffle !== undefined ? forceShuffle : customization.questionOrder === 'random';

    if (shouldShuffleQuestions) {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }

    const safeQCount = Math.max(
      1,
      Math.min(pool.length, customization.questionCount || pool.length)
    );
    const selectedQuestions = pool.slice(0, safeQCount).map((q) => ({
      ...q,
      points:
        customization.pointsMode === 'uniform'
          ? Math.max(1, customization.uniformPoints || 20)
          : Math.max(1, q.points || 15),
    }));

    const questionEntries: Array<Omit<BoardTile, 'tileNumber'>> = selectedQuestions.map((q) => ({
      kind: 'question',
      id: q.id,
      question: q,
    }));

    // Add Lucky Mystery Boxes (default 4, plus auto-even adjustment if total would be odd > 4 so grid stays even)
    let luckyCount = requestedLuckyCount;
    if (luckyBoxesEnabled && luckyCount > 0 && (selectedQuestions.length + luckyCount) % 2 === 1) {
      luckyCount += 1;
    }

    const luckyEntries: Array<Omit<BoardTile, 'tileNumber'>> = createLuckyPayloads(luckyCount).map(
      (lucky) => ({
        kind: 'lucky',
        id: lucky.id,
        lucky,
      })
    );

    // Interleave / shuffle lucky boxes randomly among tiles so players don't know which number is lucky
    const combined: Array<Omit<BoardTile, 'tileNumber'>> = [...questionEntries];
    for (const luckyItem of luckyEntries) {
      const insertAt = Math.floor(Math.random() * (combined.length + 1));
      combined.splice(insertAt, 0, luckyItem);
    }

    return combined.map((entry, idx) => ({
      ...entry,
      tileNumber: idx + 1,
    })) as BoardTile[];
  };

  const buildInitialTeams = (): ClassroomTeamStanding[] => {
    const count = Math.max(2, Math.min(6, customization.teamCount || 2));
    return Array.from({ length: count }, (_, idx) => {
      const preset = DEFAULT_TEAM_PRESETS[idx] || DEFAULT_TEAM_PRESETS[0];
      const customName = (customization.teamNames?.[idx] || '').trim() || `Team ${idx + 1}`;
      return {
        id: `team-${idx + 1}`,
        name: customName,
        colorHex: preset.colorHex,
        bgClass: preset.bgClass,
        borderClass: preset.borderClass,
        textClass: preset.textClass,
        score: 0,
        correctCount: 0,
        deductCount: 0,
      };
    });
  };

  const [tiles, setTiles] = useState<BoardTile[]>(() => buildBoardTiles());
  const [teams, setTeams] = useState<ClassroomTeamStanding[]>(() => buildInitialTeams());
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0);
  const [playedTileIds, setPlayedTileIds] = useState<Record<string, boolean>>({});

  // Active opened tile overlay
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);

  // Optional timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(customization.timerSeconds || 45);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Leaderboard / Finish State
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [resultSavedNotice, setResultSavedNotice] = useState<boolean>(false);

  const activeTile = useMemo(
    () => tiles.find((t) => t.id === activeTileId) || null,
    [tiles, activeTileId]
  );

  const activeTeam = teams[activeTeamIndex] || teams[0];
  const playedCount = useMemo(
    () => Object.values(playedTileIds).filter(Boolean).length,
    [playedTileIds]
  );
  const tileRows = useMemo(() => buildBalancedRows(tiles), [tiles]);

  // Fullscreen sync
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && boardContainerRef.current) {
        await boardContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore unsupported fullscreen errors
    }
  };

  // Optional Question Countdown Timer
  useEffect(() => {
    if (!customization.timerEnabled || !timerRunning || !activeTile || activeTile.kind !== 'question') {
      return;
    }
    if (secondsLeft <= 0) {
      setTimerRunning(false);
      if (customization.answerRevealMode === 'on_timer_end') {
        setIsAnswerRevealed(true);
      }
      if (soundEnabled) soundEngine.playWrong();
      return;
    }
    const id = window.setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [
    customization.timerEnabled,
    customization.answerRevealMode,
    timerRunning,
    secondsLeft,
    activeTile,
    soundEnabled,
  ]);

  const advanceTurnAndCheckFinish = (nextPlayedMap: Record<string, boolean>) => {
    setActiveTileId(null);
    setIsAnswerRevealed(false);
    setSelectedChoiceIdx(null);
    setTimerRunning(false);
    setActiveTeamIndex((prev) => (prev + 1) % Math.max(1, teams.length));

    const totalPlayed = Object.values(nextPlayedMap).filter(Boolean).length;
    if (totalPlayed >= tiles.length && tiles.length > 0) {
      if (soundEnabled) soundEngine.playVictory();
      setShowLeaderboard(true);
    }
  };

  const handleOpenTile = (tile: BoardTile) => {
    if (playedTileIds[tile.id]) return;
    if (soundEnabled) {
      if (tile.kind === 'lucky') {
        if (tile.lucky.effect === 'lose') {
          soundEngine.playWrong();
        } else {
          soundEngine.playCorrect();
        }
      } else {
        soundEngine.playClick();
      }
    }
    setActiveTileId(tile.id);
    setIsAnswerRevealed(false);
    setSelectedChoiceIdx(null);
    if (tile.kind === 'question' && customization.timerEnabled) {
      setSecondsLeft(customization.timerSeconds || 45);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
    setTimerRunning(false);
    if (soundEnabled) soundEngine.playClick();
  };

  const handleSelectChoice = (idx: number) => {
    if (isAnswerRevealed) return;
    setSelectedChoiceIdx(idx);
    if (soundEnabled) soundEngine.playClick();
    if (customization.answerRevealMode === 'on_select') {
      setIsAnswerRevealed(true);
      setTimerRunning(false);
    }
  };

  // Requirement 3: Simple "Yes" (award points) and "Nah" (no points awarded, or deduct if penalty enabled)
  const handleJudgeYes = () => {
    if (!activeTile || activeTile.kind !== 'question' || !activeTeam) return;
    const pts = activeTile.question.points;
    if (soundEnabled) soundEngine.playCorrect();

    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeam.id
          ? { ...t, score: t.score + pts, correctCount: t.correctCount + 1 }
          : t
      )
    );
    const nextPlayed = { ...playedTileIds, [activeTile.id]: true };
    setPlayedTileIds(nextPlayed);
    advanceTurnAndCheckFinish(nextPlayed);
  };

  const handleJudgeNah = () => {
    if (!activeTile || activeTile.kind !== 'question' || !activeTeam) return;
    const pts = activeTile.question.points;
    if (soundEnabled) soundEngine.playWrong();

    if (customization.allowNegativeDeduction) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === activeTeam.id
            ? { ...t, score: Math.max(0, t.score - pts), deductCount: t.deductCount + 1 }
            : t
        )
      );
    }
    const nextPlayed = { ...playedTileIds, [activeTile.id]: true };
    setPlayedTileIds(nextPlayed);
    advanceTurnAndCheckFinish(nextPlayed);
  };

  // Lucky Box Resolution Handlers
  const handleApplyLuckyBonusOrLose = () => {
    if (!activeTile || activeTile.kind !== 'lucky' || !activeTeam) return;
    const { effect, points } = activeTile.lucky;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== activeTeam.id) return t;
        if (effect === 'bonus') {
          return { ...t, score: t.score + points };
        }
        return { ...t, score: Math.max(0, t.score - points), deductCount: t.deductCount + 1 };
      })
    );

    const nextPlayed = { ...playedTileIds, [activeTile.id]: true };
    setPlayedTileIds(nextPlayed);
    advanceTurnAndCheckFinish(nextPlayed);
  };

  const handleApplyLuckySteal = (donorTeamId: string | null) => {
    if (!activeTile || activeTile.kind !== 'lucky' || !activeTeam) return;
    const amount = activeTile.lucky.points;
    if (soundEnabled) soundEngine.playCorrect();

    if (!donorTeamId) {
      // All opponents had 0 points — award bonus freely so the lucky box stays fun
      setTeams((prev) =>
        prev.map((t) => (t.id === activeTeam.id ? { ...t, score: t.score + amount } : t))
      );
    } else {
      setTeams((prev) => {
        const donor = prev.find((t) => t.id === donorTeamId);
        const transferable = donor ? Math.min(amount, Math.max(0, donor.score)) : 0;
        const awarded = transferable > 0 ? transferable : amount;
        return prev.map((t) => {
          if (t.id === donorTeamId) {
            return { ...t, score: Math.max(0, t.score - transferable) };
          }
          if (t.id === activeTeam.id) {
            return { ...t, score: t.score + awarded };
          }
          return t;
        });
      });
    }

    const nextPlayed = { ...playedTileIds, [activeTile.id]: true };
    setPlayedTileIds(nextPlayed);
    advanceTurnAndCheckFinish(nextPlayed);
  };

  const handleManualScoreAdjust = (teamId: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
  };

  const handleRestartGame = (shuffle = true) => {
    setTiles(buildBoardTiles(shuffle));
    setTeams(buildInitialTeams());
    setActiveTeamIndex(0);
    setPlayedTileIds({});
    setActiveTileId(null);
    setIsAnswerRevealed(false);
    setSelectedChoiceIdx(null);
    setShowLeaderboard(false);
    setResultSavedNotice(false);
    setQuickMenuOpen(false);
  };

  const handleSaveResults = () => {
    const sorted = [...teams]
      .sort((a, b) => b.score - a.score)
      .map((t, idx) => ({ ...t, rank: idx + 1 }));
    const result: ClassroomGameSessionResult = {
      id: `res-${Date.now()}`,
      gameId,
      gameTitle,
      subject,
      cls,
      topic,
      teams: sorted,
      totalTiles: tiles.length,
      playedTilesCount: playedCount,
      completedAt: new Date().toISOString(),
    };
    saveClassroomGameResultToStorage(result);
    setResultSavedNotice(true);
    if (onResultSaved) onResultSaved(result);
  };

  const sortedStandings = useMemo(
    () => [...teams].sort((a, b) => b.score - a.score),
    [teams]
  );

  return (
    <div
      ref={boardContainerRef}
      className="fixed inset-0 z-50 h-screen w-screen bg-[#F8FAFC] flex flex-col overflow-hidden select-none"
    >
      {/* ==================== TOP TEAM SCOREBOARD STRIP ==================== */}
      <header
        className={`shrink-0 ${activeTheme.headerBgClass} border-b ${activeTheme.headerBorderClass} px-3 sm:px-6 py-2.5 sm:py-3 relative shadow-xs`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 pr-14 sm:pr-28">
          <div className="flex-1 flex items-center justify-around gap-2 sm:gap-4">
            {teams.map((team, idx) => {
              const isTurn = idx === activeTeamIndex;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setActiveTeamIndex(idx)}
                  title="Click to make this team active"
                  className="flex flex-col items-center justify-center min-w-0 cursor-pointer group transition-transform active:scale-95"
                >
                  <span
                    className={`px-3 sm:px-4 py-0.5 rounded-md font-extrabold text-xs sm:text-base md:text-lg truncate max-w-[110px] sm:max-w-[180px] transition-colors ${
                      isTurn
                        ? `${activeTheme.activeTeamBadgeClass} shadow-xs`
                        : activeTheme.headerLightText
                        ? 'text-white/95 group-hover:bg-white/15'
                        : 'text-slate-800 group-hover:bg-amber-400/50'
                    }`}
                  >
                    {team.name}
                  </span>
                  <span
                    className={`text-xl sm:text-3xl font-black tabular-nums leading-tight mt-0.5 ${
                      activeTheme.headerLightText ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {team.score}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Far-Right Compact Circular Controls (Sound, Edit/Themes, Exit) */}
        <div className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col sm:flex-row items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className={`w-8 h-8 rounded-full ${activeTheme.controlBtnClass} flex items-center justify-center shadow-xs cursor-pointer`}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setQuickMenuOpen((v) => !v)}
            className={`w-8 h-8 rounded-full ${activeTheme.controlBtnClass} flex items-center justify-center shadow-xs cursor-pointer`}
            title="Edit scores, switch theme & options"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onExitToSetup}
            className={`w-8 h-8 rounded-full ${activeTheme.controlBtnClass} hover:bg-rose-600 flex items-center justify-center shadow-xs cursor-pointer`}
            title="Exit game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Quick Menu Popover (Adjust scores, Live Theme Switcher, Fullscreen, Finish, Restart) */}
        {quickMenuOpen && (
          <div className="absolute right-3 top-full mt-2 z-40 w-76 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 text-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Elimika Battle Controls
              </span>
              <button
                type="button"
                onClick={() => setQuickMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Manual Score Adjustments */}
            <div className="space-y-1.5">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 text-xs font-bold"
                >
                  <span className="truncate text-slate-700">{t.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleManualScoreAdjust(t.id, -5)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-9 text-center tabular-nums">{t.score}</span>
                    <button
                      type="button"
                      onClick={() => handleManualScoreAdjust(t.id, 5)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Theme Switcher */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Board Theme
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ELIMIKA_BATTLE_THEMES.map((theme) => {
                  const active = activeThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setActiveThemeId(theme.id)}
                      title={theme.name}
                      className={`px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition ${
                        active
                          ? 'bg-[#0A3D91] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{theme.previewIcon}</span>
                      <span className="max-w-[78px] truncate">{theme.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setQuickMenuOpen(false);
                  void toggleFullscreen();
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
                <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleRestartGame(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickMenuOpen(false);
                  setShowLeaderboard(true);
                }}
                className="col-span-2 px-3 py-2 rounded-xl bg-[#0A3D91] hover:bg-blue-800 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Finish &amp; Show Winner</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ==================== AUTOFIT ZERO-GAP THEMED TILE GRID ==================== */}
      <main
        className={`flex-1 min-h-0 p-2.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 ${activeTheme.boardBgClass} relative overflow-hidden`}
      >
        {tileRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex-1 min-h-0 flex gap-2.5 sm:gap-3">
            {row.map((tile) => {
              const isPlayed = Boolean(playedTileIds[tile.id]);
              const tileColorClass =
                activeTheme.tileClasses[(tile.tileNumber - 1) % activeTheme.tileClasses.length];
              const themeIcon =
                activeTheme.icons.length > 0
                  ? activeTheme.icons[(tile.tileNumber - 1) % activeTheme.icons.length]
                  : null;

              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={isPlayed}
                  onClick={() => handleOpenTile(tile)}
                  className={`relative flex-1 min-w-0 h-full rounded-2xl flex items-center justify-center transition-all duration-150 ${
                    isPlayed
                      ? `${activeTheme.playedTileClass} cursor-default`
                      : `${tileColorClass} active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer`
                  }`}
                >
                  {themeIcon ? (
                    <>
                      {/* Small Crisp Tile Number in Corner so Students Can Call Out Box Numbers Easily */}
                      <span
                        className={`absolute top-1.5 left-2 sm:top-2 sm:left-2.5 text-xs sm:text-sm md:text-base font-black tabular-nums leading-none ${
                          isPlayed ? 'opacity-45' : 'text-white/90 drop-shadow-xs'
                        }`}
                      >
                        {tile.tileNumber}
                      </span>
                      <span
                        className={`leading-none transition-transform ${
                          isPlayed
                            ? 'text-2xl sm:text-4xl opacity-20 grayscale'
                            : 'text-4xl sm:text-6xl md:text-7xl drop-shadow-sm'
                        }`}
                      >
                        {themeIcon}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`font-black tabular-nums tracking-tight ${
                        isPlayed
                          ? 'text-2xl sm:text-4xl opacity-45'
                          : 'text-3xl sm:text-5xl md:text-6xl drop-shadow-xs'
                      }`}
                    >
                      {tile.tileNumber}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* ==================== QUESTION OR LUCKY BOX OVERLAY (Pinned Footer — Never Clipped) ==================== */}
        {activeTile && (
          <div className="absolute inset-0 z-30 bg-slate-950/75 flex items-center justify-center p-2.5 sm:p-4 overflow-hidden">
            {activeTile.kind === 'question' ? (
              <div className="w-full max-w-4xl max-h-full bg-[#F3F4F6] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
                {/* Scrollable Question + Answer Cards Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {/* White Question Card with Themed Header Strip */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <div
                      className={`${activeTheme.questionHeaderClass} px-4 py-2 flex items-center justify-between relative`}
                    >
                      <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm font-bold min-w-[70px]">
                        {customization.timerEnabled && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full tabular-nums ${
                              secondsLeft <= 10
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/20 text-white'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{secondsLeft}s</span>
                          </span>
                        )}
                      </div>

                      <div className="text-amber-300 font-black text-lg sm:text-2xl tabular-nums">
                        {activeTile.question.points}
                      </div>

                      <div className="min-w-[70px] flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTileId(null);
                            setTimerRunning(false);
                          }}
                          className="p-1 rounded-lg text-white/75 hover:text-white hover:bg-white/15 cursor-pointer"
                          title="Close without scoring"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="px-4 py-5 sm:px-8 sm:py-6 text-center space-y-4">
                      {activeTile.question.imageUrl && (
                        <div className="flex justify-center">
                          <img
                            src={activeTile.question.imageUrl}
                            alt="Question visual"
                            className="max-h-40 sm:max-h-52 rounded-xl object-contain border border-slate-100"
                          />
                        </div>
                      )}

                      <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug break-words">
                        <MathText as="div" text={activeTile.question.question} />
                      </div>

                      {/* Multiple-Choice Options ONLY when teacher selected Multiple Choice mode */}
                      {answerDisplayMode === 'multiple_choice' &&
                        activeTile.question.questionType !== 'short_answer' &&
                        activeTile.question.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-left max-w-3xl mx-auto">
                            {activeTile.question.options.map((opt, idx) => {
                              const isPicked = selectedChoiceIdx === idx;
                              const isCorrectOpt = idx === activeTile.question.correctIndex;
                              let optStyle =
                                'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-800';
                              if (isAnswerRevealed) {
                                if (isCorrectOpt) {
                                  optStyle =
                                    'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
                                } else if (isPicked) {
                                  optStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                                }
                              } else if (isPicked) {
                                optStyle =
                                  'bg-blue-50 border-[#2563EB] text-[#0A3D91] ring-2 ring-blue-300';
                              }

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSelectChoice(idx)}
                                  className={`p-3 sm:p-3.5 rounded-xl border-2 font-bold text-sm sm:text-base flex items-center gap-2.5 transition cursor-pointer ${optStyle}`}
                                >
                                  <span className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
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
                  </div>

                  {/* Revealed Answer Card */}
                  {isAnswerRevealed && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-5 py-4 sm:px-7 sm:py-5 text-center space-y-1.5">
                      <div className="text-xl sm:text-3xl font-black text-[#0891B2] leading-snug break-words">
                        <MathText text={getAnswerDisplay(activeTile.question)} />
                      </div>
                      {customization.showExplanationOnReveal &&
                        activeTile.question.explanation && (
                          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto pt-1">
                            <MathText text={activeTile.question.explanation} />
                          </p>
                        )}
                    </div>
                  )}
                </div>

                {/* ALWAYS-VISIBLE PINNED ACTION BAR (Check OR Nah / Yes) */}
                <div className="shrink-0 px-4 py-3 bg-[#F3F4F6] border-t border-slate-200/80 flex items-center justify-center gap-4">
                  {!isAnswerRevealed ? (
                    <button
                      type="button"
                      onClick={handleRevealAnswer}
                      className="px-8 py-2.5 sm:py-3 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white font-extrabold text-base sm:text-lg inline-flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Search className="w-5 h-5" />
                      <span>Check</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleJudgeNah}
                        className="min-w-[130px] sm:min-w-[155px] px-7 py-2.5 sm:py-3 rounded-full bg-[#F43F5E] hover:bg-[#E11D48] active:scale-95 text-white font-extrabold text-base sm:text-lg inline-flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                      >
                        <X className="w-5 h-5 stroke-[3]" />
                        <span>Nah</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleJudgeYes}
                        className="min-w-[130px] sm:min-w-[155px] px-7 py-2.5 sm:py-3 rounded-full bg-[#22C55E] hover:bg-[#16A34A] active:scale-95 text-white font-extrabold text-base sm:text-lg inline-flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>Yes</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* ==================== LUCKY MYSTERY BOX OVERLAY ==================== */
              <div className="w-full max-w-2xl max-h-full bg-[#F3F4F6] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden p-3 sm:p-5">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 text-center flex flex-col max-h-full">
                  <div
                    className={`shrink-0 px-5 py-3 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 ${
                      activeTile.lucky.effect === 'bonus'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : activeTile.lucky.effect === 'steal'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                  >
                    {activeTile.lucky.effect === 'bonus' ? (
                      <Gift className="w-5 h-5" />
                    ) : activeTile.lucky.effect === 'steal' ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    <span>{activeTile.lucky.title}</span>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-4">
                    <div
                      className={`text-5xl sm:text-6xl font-black tabular-nums ${
                        activeTile.lucky.effect === 'lose'
                          ? 'text-rose-600'
                          : activeTile.lucky.effect === 'steal'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {activeTile.lucky.effect === 'lose'
                        ? `-${activeTile.lucky.points}`
                        : `+${activeTile.lucky.points}`}
                    </div>

                    <p className="text-lg sm:text-2xl font-extrabold text-slate-900">
                      {activeTile.lucky.description}
                    </p>

                    <p className="text-xs sm:text-sm font-bold text-slate-500">
                      Active Turn: <span className="text-[#0A3D91]">{activeTeam?.name}</span>
                    </p>

                    {activeTile.lucky.effect === 'steal' ? (
                      <div className="space-y-3 pt-1">
                        {(() => {
                          const opponents = teams.filter((t) => t.id !== activeTeam?.id);
                          const anyHasPoints = opponents.some((t) => t.score > 0);
                          return (
                            <>
                              <div className="flex flex-wrap items-center justify-center gap-2.5">
                                {opponents.map((opp) => (
                                  <button
                                    key={opp.id}
                                    type="button"
                                    onClick={() => handleApplyLuckySteal(opp.id)}
                                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm sm:text-base shadow-sm cursor-pointer transition"
                                  >
                                    Take from {opp.name} ({opp.score} pts)
                                  </button>
                                ))}
                              </div>
                              {!anyHasPoints && (
                                <button
                                  type="button"
                                  onClick={() => handleApplyLuckySteal(null)}
                                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm cursor-pointer"
                                >
                                  Claim +{activeTile.lucky.points} Bonus Instead
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={handleApplyLuckyBonusOrLose}
                          className={`px-9 py-2.5 sm:py-3 rounded-full text-white font-extrabold text-base sm:text-lg shadow-md cursor-pointer transition active:scale-95 ${
                            activeTile.lucky.effect === 'lose'
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          Okay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== FINAL LEADERBOARD OVERLAY ==================== */}
        {showLeaderboard && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
            <div className="w-full max-w-xl max-h-full bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
              <div className="shrink-0 bg-gradient-to-r from-[#0A3D91] to-[#2563EB] text-white p-5 text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                  <Crown className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight pt-1">
                  {sortedStandings[0]?.name} Wins!
                </h2>
                <p className="text-xs sm:text-sm text-blue-100">
                  {gameTitle} · {playedCount}/{tiles.length} tiles played
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-2.5">
                {sortedStandings.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`px-4 py-3 rounded-2xl flex items-center justify-between gap-3 border ${
                      idx === 0
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="font-extrabold text-slate-900 truncate">{t.name}</span>
                    </div>
                    <span className="text-xl font-black text-[#0A3D91] tabular-nums shrink-0">
                      {t.score} pts
                    </span>
                  </div>
                ))}
              </div>

              <div className="shrink-0 px-5 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveResults}
                  disabled={resultSavedNotice}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{resultSavedNotice ? 'Results Saved' : 'Save Results'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRestartGame(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#0A3D91] hover:bg-blue-800 text-white font-bold text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                <button
                  type="button"
                  onClick={onExitToSetup}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  Back to Setup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
