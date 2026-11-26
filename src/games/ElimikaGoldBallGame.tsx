import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Play,
  Grid,
  Trophy,
  Star,
  Lock,
  Heart,
  Pause,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Smartphone,
  Snowflake,
  Gauge,
  Eye,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Award,
  Flame,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import {
  GOLD_BALL_LEVELS,
  GOLD_BALL_POWER_UPS,
  GoldBallLevelConfig,
  GoldBallProgressState,
  PowerUpType,
  ReelChallengeMode,
  SPOTQUEST_REEL_PRESETS,
  calculateStarRating,
  goldBallFX,
  loadGoldBallProgress,
  recordGoldBallLevelVictory,
  saveGoldBallProgress,
} from './goldBallData';
import { GoldBall3DScene, RoundPhase } from './GoldBall3DScene';

export type GoldBallScreen = 'HOME' | 'LEVEL_SELECT' | 'GAMEPLAY' | 'VICTORY' | 'DEFEAT';

export interface ElimikaGoldBallGameProps {
  onBackToHub?: () => void;
}

export const ElimikaGoldBallGame: React.FC<ElimikaGoldBallGameProps> = ({ onBackToHub }) => {
  const [progress, setProgress] = useState<GoldBallProgressState>(() => loadGoldBallProgress());
  const [screen, setScreen] = useState<GoldBallScreen>('HOME');
  const [activeLevelNum, setActiveLevelNum] = useState<number>(() => {
    const initial = loadGoldBallProgress();
    return initial.highestUnlockedLevel;
  });
  // Optional reel mode override when player selects one of the 5 viral Reel modes to practice at their current unlocked level speed
  const [customReelModeOverride, setCustomReelModeOverride] = useState<ReelChallengeMode | null>(null);

  // Gameplay State
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [lostHeartAnim, setLostHeartAnim] = useState<boolean>(false);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [displayedScore, setDisplayedScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    basePoints: 0,
    timeBonus: 0,
    streakBonus: 0,
    completionBonus: 0,
    penalties: 0,
  });

  // Round 3D Tracking State
  const [phase, setPhase] = useState<RoundPhase>('OBSERVE');
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const [ballCupId, setBallCupId] = useState<number>(4);
  const [secondaryBallCupId, setSecondaryBallCupId] = useState<number | null>(null);
  const [decoyCupIds, setDecoyCupIds] = useState<number[]>([]);
  const [selectedCupId, setSelectedCupId] = useState<number | null>(null);
  const [selectedSecondaryCupId, setSelectedSecondaryCupId] = useState<number | null>(null);
  const [revealedEmptyCupIds, setRevealedEmptyCupIds] = useState<number[]>([]);
  const [showTrueBallCup, setShowTrueBallCup] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    text: string;
    subtext?: string;
    tone: 'gold' | 'teal' | 'rose' | 'purple';
  } | null>(null);
  const [celebrationBurstKey, setCelebrationBurstKey] = useState<number>(0);

  // Power-Up Active States in Current Round
  const [freezeActive, setFreezeActive] = useState<boolean>(false);
  const [slowMotionActive, setSlowMotionActive] = useState<boolean>(false);
  const [extraVisionActive, setExtraVisionActive] = useState<boolean>(false);
  const [secondChanceArmed, setSecondChanceArmed] = useState<boolean>(false);
  const [activePowerUpInfo, setActivePowerUpInfo] = useState<PowerUpType | null>(null);

  // Victory summary state
  const [victorySummary, setVictorySummary] = useState<{
    stars: 1 | 2 | 3;
    finalScore: number;
    newlyUnlockedLevel: number | null;
    rewardedPowerUp: PowerUpType | null;
  } | null>(null);

  const selectionStartTimeRef = useRef<number>(0);
  const freezeTimerRef = useRef<number | null>(null);
  const extraVisionTimerRef = useRef<number | null>(null);

  const baseLevelConfig: GoldBallLevelConfig =
    GOLD_BALL_LEVELS.find((l) => l.level === activeLevelNum) || GOLD_BALL_LEVELS[0];

  const applyReelModeOverride = useCallback(
    (baseCfg: GoldBallLevelConfig, modeOverride: ReelChallengeMode | null): GoldBallLevelConfig => {
      if (!modeOverride || modeOverride === baseCfg.reelMode) {
        return baseCfg;
      }
      if (modeOverride === 'crimson_die_oval_8') {
        return {
          ...baseCfg,
          reelMode: 'crimson_die_oval_8',
          targetType: 'golden_die',
          reelHeaderTitle: '8 CUPS. ONE DIE.',
          reelHeaderSubtitle: 'TRACK THE DIE',
          cupCount: 8,
          cupSkin: 'crimson_gloss',
          orbitSpeedRadPerSec: 0,
        };
      }
      if (modeOverride === 'mission_impossible_9') {
        return {
          ...baseCfg,
          reelMode: 'mission_impossible_9',
          targetType: 'gold_ball',
          reelHeaderTitle: 'MISSION IMPOSSIBLE',
          reelHeaderSubtitle: 'CAN YOU ACTUALLY FIND THE BALL?',
          cupCount: 9,
          cupSkin: 'emerald_mirror',
          orbitSpeedRadPerSec: 0,
        };
      }
      if (modeOverride === 'infinity_figure8_12') {
        return {
          ...baseCfg,
          reelMode: 'infinity_figure8_12',
          targetType: 'gold_ball',
          reelHeaderTitle: 'FOLLOW THE GOLD',
          reelHeaderSubtitle: 'FIGURE-8 INFINITY TRACK',
          cupCount: 12,
          cupSkin: 'specular_turquoise',
          orbitSpeedRadPerSec: 0,
        };
      }
      if (modeOverride === 'chaos_trefoil_12') {
        return {
          ...baseCfg,
          reelMode: 'chaos_trefoil_12',
          targetType: 'gold_ball',
          reelHeaderTitle: 'CHAOS MODE',
          reelHeaderSubtitle: '3-PETAL TREFOIL TRACK',
          cupCount: 12,
          cupSkin: 'emerald_mirror',
          orbitSpeedRadPerSec: 0,
        };
      }
      if (modeOverride === 'brain_breaker_12') {
        return {
          ...baseCfg,
          reelMode: 'brain_breaker_12',
          targetType: 'gold_ball',
          reelHeaderTitle: 'BRAIN BREAKER',
          reelHeaderSubtitle: 'TWELVE CUPS, ONE GOLD BALL',
          cupCount: 12,
          cupSkin: 'zigzag_chevron',
          orbitSpeedRadPerSec: 0,
        };
      }
      if (modeOverride === 'orbit_ring_8') {
        return {
          ...baseCfg,
          reelMode: 'orbit_ring_8',
          targetType: 'gold_ball',
          reelHeaderTitle: 'ORBIT',
          reelHeaderSubtitle: 'THE CUPS NEVER STOP SPINNING',
          cupCount: 8,
          cupSkin: 'collar_band',
          orbitSpeedRadPerSec: 0.72,
        };
      }
      if (modeOverride === 'split_brain_2x3') {
        return {
          ...baseCfg,
          reelMode: 'split_brain_2x3',
          targetType: 'gold_ball',
          reelHeaderTitle: 'SPLIT BRAIN',
          reelHeaderSubtitle: 'TRACK BOTH BALLS AT ONCE',
          cupCount: 6,
          cupSkin: 'zigzag_chevron',
          secondaryCupSkin: 'vertical_stripes',
          orbitSpeedRadPerSec: 0,
        };
      }
      if (modeOverride === 'mind_trap_ring_10') {
        return {
          ...baseCfg,
          reelMode: 'mind_trap_ring_10',
          targetType: 'gold_ball',
          reelHeaderTitle: 'MIND TRAP',
          reelHeaderSubtitle: 'FOLLOW GOLD, TRUST NOTHING',
          cupCount: 10,
          cupSkin: 'collar_band',
          orbitSpeedRadPerSec: 0.55,
          decoyBallsCount: Math.max(2, baseCfg.decoyBallsCount),
          hasMidShuffleFeints: true,
        };
      }
      return {
        ...baseCfg,
        reelMode: 'classic_3x3',
        targetType: 'gold_ball',
        reelHeaderTitle: 'INSANE 3×3',
        reelHeaderSubtitle: 'FOLLOW THE GOLD BALL',
        cupCount: 9,
        cupSkin: 'specular_turquoise',
        orbitSpeedRadPerSec: 0,
      };
    },
    []
  );

  // Apply custom Reel Mode formation override if chosen from the 9 Viral Reel Mode cards
  const activeLevelConfig: GoldBallLevelConfig = React.useMemo(
    () => applyReelModeOverride(baseLevelConfig, customReelModeOverride),
    [baseLevelConfig, customReelModeOverride, applyReelModeOverride]
  );

  // Animated score counter roll-up
  useEffect(() => {
    if (displayedScore === levelScore) return;
    const diff = levelScore - displayedScore;
    const step = diff > 0 ? Math.max(1, Math.ceil(diff / 8)) : Math.min(-1, Math.floor(diff / 8));
    const timer = window.setTimeout(() => {
      setDisplayedScore((prev) => prev + step);
    }, 24);
    return () => clearTimeout(timer);
  }, [levelScore, displayedScore]);

  useEffect(() => {
    return () => {
      if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
      if (extraVisionTimerRef.current) clearTimeout(extraVisionTimerRef.current);
    };
  }, []);

  const handleToggleSound = () => {
    const updated: GoldBallProgressState = {
      ...progress,
      soundEnabled: !progress.soundEnabled,
    };
    setProgress(updated);
    saveGoldBallProgress(updated);
  };

  const handleToggleVibration = () => {
    const nextVib = !progress.vibrationEnabled;
    const updated: GoldBallProgressState = {
      ...progress,
      vibrationEnabled: nextVib,
    };
    setProgress(updated);
    saveGoldBallProgress(updated);
    if (nextVib) {
      goldBallFX.vibrate(35, true);
    }
  };

  // Initialize a round inside the active level
  const beginRound = useCallback(
    (roundNumber: number, cfg: GoldBallLevelConfig, soundOn: boolean) => {
      if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
      if (extraVisionTimerRef.current) clearTimeout(extraVisionTimerRef.current);

      let primaryBall = 0;
      let secondaryBall: number | null = null;
      const decoys: number[] = [];

      if (cfg.reelMode === 'split_brain_2x3') {
        // Top row is cups 0..2 (Gold Ball), Bottom row is cups 3..5 (Pink Ball)
        primaryBall = Math.floor(Math.random() * 3);
        secondaryBall = 3 + Math.floor(Math.random() * 3);
      } else {
        primaryBall = Math.floor(Math.random() * cfg.cupCount);
        if (cfg.decoyBallsCount > 0) {
          const candidates = Array.from({ length: cfg.cupCount }, (_, i) => i).filter((i) => i !== primaryBall);
          for (let d = 0; d < Math.min(cfg.decoyBallsCount, candidates.length); d++) {
            const pickIdx = Math.floor(Math.random() * candidates.length);
            decoys.push(candidates[pickIdx]);
            candidates.splice(pickIdx, 1);
          }
        }
      }

      setCurrentRound(roundNumber);
      setBallCupId(primaryBall);
      setSecondaryBallCupId(secondaryBall);
      setDecoyCupIds(decoys);
      setSelectedCupId(null);
      setSelectedSecondaryCupId(null);
      setRevealedEmptyCupIds([]);
      setShowTrueBallCup(false);
      setFreezeActive(false);
      setSlowMotionActive(false);
      setExtraVisionActive(false);
      setCountdownNum(null);
      setPhase('OBSERVE');

      setFeedbackBanner({
        text: `ROUND ${roundNumber}/${cfg.roundsCount} — WATCH`,
        tone: 'gold',
      });
      goldBallFX.playCupLift(soundOn);
    },
    []
  );

  // Start a specific level (strictly validating sequential unlock)
  const startLevel = useCallback(
    (levelNumber: number, modeOverride: ReelChallengeMode | null = null) => {
      const latestProgress = loadGoldBallProgress();
      const targetLevel = Math.min(levelNumber, latestProgress.highestUnlockedLevel);
      const baseCfg = GOLD_BALL_LEVELS.find((l) => l.level === targetLevel) || GOLD_BALL_LEVELS[0];

      setCustomReelModeOverride(modeOverride);
      setActiveLevelNum(targetLevel);
      setLives(3);
      setLostHeartAnim(false);
      setLevelScore(0);
      setDisplayedScore(0);
      setStreak(0);
      setScoreBreakdown({
        basePoints: 0,
        timeBonus: 0,
        streakBonus: 0,
        completionBonus: 0,
        penalties: 0,
      });
      setSecondChanceArmed(false);
      setIsPaused(false);
      setVictorySummary(null);
      setScreen('GAMEPLAY');

      const effectiveCfg = applyReelModeOverride(baseCfg, modeOverride);
      beginRound(1, effectiveCfg, latestProgress.soundEnabled);
    },
    [beginRound, applyReelModeOverride]
  );

  // OBSERVE phase timer -> transitions to COUNTDOWN
  useEffect(() => {
    if (screen !== 'GAMEPLAY' || phase !== 'OBSERVE' || isPaused) return;
    const timer = window.setTimeout(() => {
      setPhase('COUNTDOWN');
      setCountdownNum(3);
      setFeedbackBanner({
        text: 'READY',
        tone: 'teal',
      });
      goldBallFX.playCountdownTick(false, progress.soundEnabled, progress.vibrationEnabled);
    }, activeLevelConfig.observationTimeMs);
    return () => clearTimeout(timer);
  }, [screen, phase, isPaused, activeLevelConfig, progress.soundEnabled, progress.vibrationEnabled]);

  // COUNTDOWN phase timer (3 -> 2 -> 1 -> SHUFFLING)
  useEffect(() => {
    if (screen !== 'GAMEPLAY' || phase !== 'COUNTDOWN' || isPaused || countdownNum === null) return;
    const timer = window.setTimeout(() => {
      if (countdownNum > 1) {
        setCountdownNum(countdownNum - 1);
        goldBallFX.playCountdownTick(false, progress.soundEnabled, progress.vibrationEnabled);
      } else {
        setCountdownNum(null);
        setPhase('SHUFFLING');
        setFeedbackBanner({
          text:
            activeLevelConfig.reelMode === 'split_brain_2x3'
              ? 'TRACK BOTH BALLS'
              : activeLevelConfig.targetType === 'golden_die'
              ? 'TRACK THE DIE'
              : 'FOLLOW THE GOLD',
          tone: 'teal',
        });
        goldBallFX.playCountdownTick(true, progress.soundEnabled, progress.vibrationEnabled);
      }
    }, 620);
    return () => clearTimeout(timer);
  }, [screen, phase, isPaused, countdownNum, activeLevelConfig, progress.soundEnabled, progress.vibrationEnabled]);

  const handleShuffleComplete = useCallback(() => {
    setFreezeActive(false);
    setPhase('SELECTING');
    selectionStartTimeRef.current = performance.now();
    setFeedbackBanner({
      text:
        activeLevelConfig.reelMode === 'split_brain_2x3'
          ? 'PICK 1 TOP + 1 BOTTOM'
          : 'WHICH CUP?',
      tone: 'gold',
    });
  }, [activeLevelConfig]);

  const handleShuffleStepSound = useCallback(
    (speedFactor: number) => {
      goldBallFX.playCupSwoosh(speedFactor, progress.soundEnabled);
    },
    [progress.soundEnabled]
  );

  // Ticking clock sound during SELECTING phase (matching 00:22-00:25 in Reel DfcZtTayh_9)
  useEffect(() => {
    if (screen !== 'GAMEPLAY' || phase !== 'SELECTING' || isPaused) return;
    goldBallFX.playSelectionClockTick(progress.soundEnabled);
    const interval = window.setInterval(() => {
      goldBallFX.playSelectionClockTick(progress.soundEnabled);
    }, 950);
    return () => clearInterval(interval);
  }, [screen, phase, isPaused, progress.soundEnabled]);

  // Evaluate round outcome once required cup selection(s) are complete
  const evaluateSelectionOutcome = useCallback(
    (primaryPick: number, secondaryPick: number | null) => {
      const elapsedMs = Math.max(200, performance.now() - selectionStartTimeRef.current);
      const isSplitBrain = activeLevelConfig.reelMode === 'split_brain_2x3';
      const isCorrect = isSplitBrain
        ? primaryPick === ballCupId && secondaryPick === secondaryBallCupId
        : primaryPick === ballCupId;

      if (isCorrect) {
        setPhase('REVEALING');
        setCelebrationBurstKey((k) => k + 1);
        goldBallFX.playCorrectReveal(progress.soundEnabled, progress.vibrationEnabled);

        const basePts = isSplitBrain ? 150 : 100;
        const speedBonus = Math.max(15, Math.min(125, Math.round(140 - elapsedMs / 48)));
        const newStreak = streak + 1;
        const streakPts = newStreak >= 2 ? (newStreak - 1) * 50 : 0;
        const roundGain = basePts + speedBonus + streakPts;

        setStreak(newStreak);
        const updatedScore = levelScore + roundGain;
        setLevelScore(updatedScore);
        setScoreBreakdown((prev) => ({
          ...prev,
          basePoints: prev.basePoints + basePts,
          timeBonus: prev.timeBonus + speedBonus,
          streakBonus: prev.streakBonus + streakPts,
        }));

        setFeedbackBanner({
          text: `CORRECT! +${roundGain} PTS`,
          tone: 'gold',
        });

        window.setTimeout(() => {
          if (currentRound < activeLevelConfig.roundsCount) {
            beginRound(currentRound + 1, activeLevelConfig, progress.soundEnabled);
          } else {
            const finalScore = updatedScore + activeLevelConfig.completionBonus;
            setLevelScore(finalScore);
            setScoreBreakdown((prev) => ({
              ...prev,
              completionBonus: activeLevelConfig.completionBonus,
            }));

            const starsEarned = calculateStarRating(lives, finalScore, activeLevelConfig.completionBonus);
            const result = recordGoldBallLevelVictory(progress, activeLevelNum, finalScore, starsEarned);
            setProgress(result.updatedState);
            setVictorySummary({
              stars: starsEarned,
              finalScore,
              newlyUnlockedLevel: result.newlyUnlockedLevel,
              rewardedPowerUp: result.rewardedPowerUp,
            });
            goldBallFX.playVictoryFanfare(progress.soundEnabled, progress.vibrationEnabled);
            setScreen('VICTORY');
          }
        }, 1850);
      } else {
        // INCORRECT SELECTION
        if (secondChanceArmed) {
          setSecondChanceArmed(false);
          if (!isSplitBrain) {
            setRevealedEmptyCupIds((prev) => [...prev, primaryPick]);
            setSelectedCupId(null);
          } else {
            const wrongCups: number[] = [];
            if (primaryPick !== ballCupId) {
              wrongCups.push(primaryPick);
              setSelectedCupId(null);
            }
            if (secondaryPick !== null && secondaryPick !== secondaryBallCupId) {
              wrongCups.push(secondaryPick);
              setSelectedSecondaryCupId(null);
            }
            setRevealedEmptyCupIds((prev) => [...prev, ...wrongCups]);
          }
          goldBallFX.playCupLift(progress.soundEnabled);
          setFeedbackBanner({
            text: 'SECOND CHANCE — PICK AGAIN',
            tone: 'purple',
          });
          return;
        }

        const nextLives = Math.max(0, lives - 1);
        const penalty = Math.min(levelScore, 50);
        const nextScore = Math.max(0, levelScore - penalty);

        setShowTrueBallCup(true);
        setPhase('REVEALING');
        setLives(nextLives);
        setLostHeartAnim(true);
        window.setTimeout(() => setLostHeartAnim(false), 700);
        setStreak(0);
        setLevelScore(nextScore);
        setScoreBreakdown((prev) => ({
          ...prev,
          penalties: prev.penalties + penalty,
        }));

        goldBallFX.playWrongSelection(progress.soundEnabled, progress.vibrationEnabled);
        setFeedbackBanner({
          text: nextLives > 0 ? `MISSED (${nextLives} LIVES LEFT)` : 'GAME OVER',
          tone: 'rose',
        });

        window.setTimeout(() => {
          if (nextLives <= 0) {
            goldBallFX.playDefeatSound(progress.soundEnabled, progress.vibrationEnabled);
            setScreen('DEFEAT');
          } else {
            beginRound(currentRound, activeLevelConfig, progress.soundEnabled);
          }
        }, 2200);
      }
    },
    [
      activeLevelConfig,
      ballCupId,
      secondaryBallCupId,
      progress,
      streak,
      levelScore,
      currentRound,
      lives,
      activeLevelNum,
      secondChanceArmed,
      beginRound,
    ]
  );

  // Handle Player Selecting a Cup
  const handleSelectCup = useCallback(
    (cupId: number) => {
      if (phase !== 'SELECTING' || isPaused || revealedEmptyCupIds.includes(cupId)) return;

      if (activeLevelConfig.reelMode === 'split_brain_2x3') {
        // Top row cups have IDs 0..2, Bottom row cups have IDs 3..5
        const isTopCup = cupId < 3;
        const nextPrimary = isTopCup ? cupId : selectedCupId;
        const nextSecondary = !isTopCup ? cupId : selectedSecondaryCupId;

        if (isTopCup) setSelectedCupId(cupId);
        else setSelectedSecondaryCupId(cupId);

        goldBallFX.playCupLift(progress.soundEnabled);

        if (nextPrimary !== null && nextSecondary !== null) {
          evaluateSelectionOutcome(nextPrimary, nextSecondary);
        } else {
          setFeedbackBanner({
            text: isTopCup ? 'NOW PICK A BOTTOM CUP (4–6)' : 'NOW PICK A TOP CUP (1–3)',
            tone: 'gold',
          });
        }
        return;
      }

      setSelectedCupId(cupId);
      evaluateSelectionOutcome(cupId, null);
    },
    [
      phase,
      isPaused,
      revealedEmptyCupIds,
      activeLevelConfig.reelMode,
      selectedCupId,
      selectedSecondaryCupId,
      progress.soundEnabled,
      evaluateSelectionOutcome,
    ]
  );

  // Activate one of the 4 Power-Ups
  const handleUsePowerUp = (type: PowerUpType) => {
    if (isPaused || screen !== 'GAMEPLAY') return;
    const count = progress.powerUps[type] || 0;
    if (count <= 0) {
      setActivePowerUpInfo(type);
      return;
    }

    if (type === 'freeze') {
      if (phase !== 'SHUFFLING' || freezeActive) return;
      setFreezeActive(true);
      if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
      freezeTimerRef.current = window.setTimeout(() => {
        setFreezeActive(false);
      }, 2500);
      setFeedbackBanner({ text: 'FREEZE', tone: 'teal' });
    } else if (type === 'slow_motion') {
      if ((phase !== 'SHUFFLING' && phase !== 'COUNTDOWN' && phase !== 'OBSERVE') || slowMotionActive) return;
      setSlowMotionActive(true);
      setFeedbackBanner({ text: 'SLOW MOTION', tone: 'teal' });
    } else if (type === 'extra_vision') {
      if ((phase !== 'SHUFFLING' && phase !== 'SELECTING') || extraVisionActive) return;
      setExtraVisionActive(true);
      if (extraVisionTimerRef.current) clearTimeout(extraVisionTimerRef.current);
      extraVisionTimerRef.current = window.setTimeout(() => {
        setExtraVisionActive(false);
      }, 1750);
      setFeedbackBanner({ text: 'EXTRA VISION', tone: 'gold' });
    } else if (type === 'second_chance') {
      if ((phase !== 'SELECTING' && phase !== 'SHUFFLING') || secondChanceArmed) return;
      setSecondChanceArmed(true);
      setFeedbackBanner({ text: 'SECOND CHANCE ARMED', tone: 'purple' });
    }

    const updated: GoldBallProgressState = {
      ...progress,
      powerUps: {
        ...progress.powerUps,
        [type]: Math.max(0, count - 1),
      },
    };
    setProgress(updated);
    saveGoldBallProgress(updated);
    goldBallFX.playPowerUpActivate(type, progress.soundEnabled, progress.vibrationEnabled);
  };

  const totalStarsEarned = Object.values(progress.bestStarsPerLevel).reduce((sum, s) => sum + s, 0);

  const renderPowerUpIcon = (type: PowerUpType, className = 'w-5 h-5') => {
    switch (type) {
      case 'freeze':
        return <Snowflake className={className} />;
      case 'slow_motion':
        return <Gauge className={className} />;
      case 'extra_vision':
        return <Eye className={className} />;
      case 'second_chance':
        return <ShieldCheck className={className} />;
    }
  };

  // ============================================================================
  // SCREEN A: GAME HOME SCREEN
  // ============================================================================
  if (screen === 'HOME') {
    const currentConfig =
      GOLD_BALL_LEVELS.find((l) => l.level === progress.highestUnlockedLevel) || GOLD_BALL_LEVELS[0];

    return (
      <div className="min-h-[calc(100vh-80px)] w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_#082f3a_0%,_#03151b_55%,_#010b0e_100%)] text-white p-3.5 sm:p-6 flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-amber-400/25 shadow-[0_24px_64px_rgba(0,0,0,0.65)] space-y-6">
        {/* Top Bar: Back to Games Hub + Audio / Haptics Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-400/15">
          <div className="flex items-center gap-2">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#041d24]/90 hover:bg-[#072a34] border border-teal-500/30 text-teal-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-300" />
                <span>Games Hub</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                progress.soundEnabled
                  ? 'bg-[#05232b] border-amber-400/35 text-amber-100'
                  : 'bg-slate-900/70 border-slate-700/70 text-slate-400'
              }`}
            >
              {progress.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
              <span>Sound</span>
            </button>

            <button
              type="button"
              onClick={handleToggleVibration}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                progress.vibrationEnabled
                  ? 'bg-[#05232b] border-amber-400/35 text-amber-100'
                  : 'bg-slate-900/70 border-slate-700/70 text-slate-400'
              }`}
            >
              <Smartphone className={`w-4 h-4 ${progress.vibrationEnabled ? 'text-amber-300' : ''}`} />
              <span>Haptics</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-amber-300/90">
              <span className="h-px w-6 bg-amber-400/70" />
              <span>3D STUDIO EDITION</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[0.98] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-400 to-amber-200 drop-shadow-[0_4px_24px_rgba(245,158,11,0.2)]">
              ELIMIKA GOLD BALL
            </h1>
            <p className="text-sm sm:text-base font-semibold text-teal-100/85">
              Follow the gold. Pick the cup.
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => startLevel(progress.highestUnlockedLevel, null)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-base shadow-[0_10px_30px_rgba(245,158,11,0.32)] ring-1 ring-inset ring-amber-100/60 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>PLAY LEVEL {progress.highestUnlockedLevel}</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('LEVEL_SELECT')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#05242d]/90 hover:bg-[#08333f] border border-amber-400/30 text-amber-50 font-bold text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Grid className="w-4 h-4 text-amber-300" />
                <span>LEVELS (1–10)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Luxury Progress & Power-Up Vault */}
          <div className="lg:col-span-5">
            <div className="p-5 rounded-2xl bg-[#03161c]/90 border border-amber-400/25 shadow-[0_14px_40px_rgba(0,0,0,0.45)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300/80">
                    Current Stage
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    Level {progress.highestUnlockedLevel} · {currentConfig.name}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-100/70">
                  <Trophy className="w-5 h-5 text-slate-950" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#041f27]/80 border border-teal-500/20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-teal-300/75">
                    Total Score
                  </div>
                  <div className="text-xl font-black text-amber-300 mt-0.5 tabular-nums">
                    {progress.totalScore.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#041f27]/80 border border-teal-500/20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-teal-300/75">
                    Best Score
                  </div>
                  <div className="text-xl font-black text-teal-100 mt-0.5 tabular-nums">
                    {progress.bestSingleLevelScore.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#041f27]/80 border border-teal-500/20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-teal-300/75">
                    Stars
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-lg font-black text-white tabular-nums">{totalStarsEarned} / 30</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#041f27]/80 border border-teal-500/20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-teal-300/75">
                    Cleared
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-lg font-black text-white tabular-nums">{progress.completedLevels.length} / 10</span>
                  </div>
                </div>
              </div>

              {/* Power-Ups */}
              <div className="pt-3 border-t border-amber-400/15">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300/75 mb-2">
                  Power-Ups
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(GOLD_BALL_POWER_UPS) as PowerUpType[]).map((key) => {
                    const def = GOLD_BALL_POWER_UPS[key];
                    return (
                      <div
                        key={key}
                        className="p-2 rounded-xl bg-[#041d24] border border-amber-400/20 flex flex-col items-center text-center"
                      >
                        <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                          {renderPowerUpIcon(key, 'w-3.5 h-3.5')}
                          <span className="tabular-nums">×{progress.powerUps[key]}</span>
                        </div>
                        <div className="text-[9px] font-bold text-teal-100/90 mt-0.5 truncate w-full">{def.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 9 Game Modes Strip */}
        <div className="space-y-3 pt-3 border-t border-amber-400/15">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-amber-100">
              Game Modes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SPOTQUEST_REEL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => startLevel(progress.highestUnlockedLevel, preset.id)}
                className="text-left p-3 rounded-xl bg-[#03171d]/90 hover:bg-[#062832] border border-teal-500/25 hover:border-amber-400/60 transition-all flex flex-col justify-between gap-1.5 group cursor-pointer shadow-md"
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: preset.accentColor }}
                  >
                    {preset.badge}
                  </span>
                  <Play className="w-3.5 h-3.5 text-amber-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <div className="text-xs sm:text-sm font-black text-white leading-tight">{preset.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCREEN B: LEVEL SELECTION SCREEN (10 PROGRESSIVE LEVELS)
  // ============================================================================
  if (screen === 'LEVEL_SELECT') {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_#082f3a_0%,_#03151b_55%,_#010b0e_100%)] text-white p-4 sm:p-6 rounded-3xl border border-amber-400/25 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-400/15">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScreen('HOME')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#041d24] hover:bg-[#072a34] border border-teal-500/30 text-teal-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span>Home</span>
            </button>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">LEVELS 1–10</h2>
          </div>

          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <span className="inline-flex items-center gap-1.5 text-amber-300 tabular-nums">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {totalStarsEarned} / 30
            </span>
            <span className="text-teal-600">·</span>
            <span className="text-teal-200 tabular-nums">Unlocked {progress.highestUnlockedLevel}/10</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {GOLD_BALL_LEVELS.map((lvl) => {
            const isUnlocked = lvl.level <= progress.highestUnlockedLevel;
            const isCompleted = progress.completedLevels.includes(lvl.level);
            const stars = progress.bestStarsPerLevel[lvl.level] || 0;
            const bestScore = progress.bestScorePerLevel[lvl.level] || 0;

            return (
              <div
                key={lvl.level}
                className={`relative rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-[#041d24]/95 border-amber-400/25 hover:border-amber-400/65 shadow-lg'
                    : 'bg-[#021115]/75 border-teal-900/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className="text-[11px] font-black tracking-widest uppercase"
                      style={{ color: isUnlocked ? lvl.environment.cardAccent : '#64748b' }}
                    >
                      {lvl.titleBadge}
                    </span>

                    {isUnlocked ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= stars ? 'text-amber-400 fill-amber-400' : 'text-teal-900 fill-teal-950'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <h3 className="text-base font-black text-white">{lvl.name}</h3>
                  <div className="text-[11px] font-bold text-amber-300/90 uppercase mt-0.5">
                    {lvl.reelHeaderTitle} · {lvl.cupCount} Cups
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-teal-500/15 flex items-center justify-between text-[11px] text-teal-200/80">
                    <span>Best</span>
                    <span className="font-bold text-amber-200 tabular-nums">
                      {bestScore > 0 ? bestScore.toLocaleString() : '—'}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => startLevel(lvl.level, null)}
                      className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        lvl.level === progress.highestUnlockedLevel
                          ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-200 hover:to-amber-400'
                          : 'bg-[#07303b] hover:bg-[#0a3e4d] text-amber-50 border border-amber-400/25'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Replay' : 'Play'}</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-500 font-bold text-[11px] flex items-center justify-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Level {lvl.level - 1} First</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCREEN D: VICTORY SCREEN
  // ============================================================================
  if (screen === 'VICTORY' && victorySummary) {
    const hasNextLevel = activeLevelNum < 10;
    const nextLevelConfig = hasNextLevel ? GOLD_BALL_LEVELS[activeLevelNum] : null;

    return (
      <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-[#02161b] via-[#062d36] to-[#03191f] text-white p-4 sm:p-6 rounded-3xl border border-amber-400/40 shadow-2xl flex flex-col items-center justify-center">
        <div className="max-w-xl w-full bg-[#04222a]/95 border border-amber-400/45 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>LEVEL {activeLevelNum} COMPLETE</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300">
            {activeLevelConfig.name.toUpperCase()} CLEARED!
          </h2>

          <div className="flex items-center justify-center gap-4 py-2">
            {[1, 2, 3].map((starIdx) => {
              const earned = starIdx <= victorySummary.stars;
              return (
                <div
                  key={starIdx}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform ${
                    earned
                      ? 'bg-gradient-to-br from-amber-400/30 to-yellow-600/30 border-amber-300 scale-110 shadow-lg shadow-amber-500/25'
                      : 'bg-teal-950/60 border-teal-800/50 opacity-45'
                  }`}
                >
                  <Star
                    className={`w-9 h-9 ${
                      earned ? 'text-amber-300 fill-amber-400' : 'text-teal-800 fill-teal-900'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-teal-950/80 border border-teal-500/30 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-teal-200">
              <span>Correct Selection Base Points</span>
              <span className="font-bold text-white">+{scoreBreakdown.basePoints}</span>
            </div>
            <div className="flex items-center justify-between text-teal-200">
              <span>Fast Reflex Time Bonus</span>
              <span className="font-bold text-teal-300">+{scoreBreakdown.timeBonus}</span>
            </div>
            <div className="flex items-center justify-between text-teal-200">
              <span>Consecutive Streak Bonus</span>
              <span className="font-bold text-amber-300">+{scoreBreakdown.streakBonus}</span>
            </div>
            <div className="flex items-center justify-between text-teal-200">
              <span>Level Completion Bonus</span>
              <span className="font-bold text-emerald-300">+{scoreBreakdown.completionBonus}</span>
            </div>
            {scoreBreakdown.penalties > 0 && (
              <div className="flex items-center justify-between text-rose-300">
                <span>Life Lost Penalty</span>
                <span className="font-bold">-{scoreBreakdown.penalties}</span>
              </div>
            )}
            <div className="pt-2 border-t border-teal-500/30 flex items-center justify-between text-base sm:text-lg font-black">
              <span className="text-amber-200">FINAL LEVEL SCORE</span>
              <span className="text-amber-300">{victorySummary.finalScore.toLocaleString()} PTS</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {victorySummary.newlyUnlockedLevel && (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Unlocked Level {victorySummary.newlyUnlockedLevel}:{' '}
                  {GOLD_BALL_LEVELS[victorySummary.newlyUnlockedLevel - 1]?.name}!
                </span>
              </div>
            )}
            {victorySummary.rewardedPowerUp && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-950/90 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>+1 {GOLD_BALL_POWER_UPS[victorySummary.rewardedPowerUp].name} Power-Up Earned!</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {hasNextLevel && nextLevelConfig && (
              <button
                type="button"
                onClick={() => startLevel(activeLevelNum + 1, null)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>
                  NEXT LEVEL ({activeLevelNum + 1}. {nextLevelConfig.name.toUpperCase()})
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => startLevel(activeLevelNum, customReelModeOverride)}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-teal-900/85 hover:bg-teal-800 border border-teal-400/45 text-teal-100 font-bold text-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay Level</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('HOME')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCREEN E: DEFEAT SCREEN
  // ============================================================================
  if (screen === 'DEFEAT') {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-[#02161b] via-[#1a0f1a] to-[#03191f] text-white p-4 sm:p-6 rounded-3xl border border-rose-500/35 shadow-2xl flex flex-col items-center justify-center">
        <div className="max-w-lg w-full bg-[#071e24]/95 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/45 text-rose-300 text-xs font-black uppercase tracking-widest">
            <span>ALL 3 LIVES EXHAUSTED</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white">GAME OVER</h2>
          <p className="text-sm font-bold text-amber-300">
            Level {activeLevelNum} • {activeLevelConfig.name}
          </p>

          <div className="p-4 rounded-2xl bg-teal-950/80 border border-teal-500/30 space-y-2 text-sm">
            <div className="flex items-center justify-between text-teal-200">
              <span>Rounds Reached</span>
              <span className="font-bold text-white">
                {currentRound} / {activeLevelConfig.roundsCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-teal-200">
              <span>Remaining Score</span>
              <span className="font-black text-amber-300 text-lg">{levelScore.toLocaleString()} PTS</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startLevel(activeLevelNum, customReelModeOverride)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RETRY LEVEL {activeLevelNum}</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('HOME')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-950/90 hover:bg-teal-900 border border-teal-500/40 text-teal-100 font-bold text-sm transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCREEN C: GAMEPLAY SCREEN
  // ============================================================================
  return (
    <div className="min-h-[calc(100vh-80px)] w-full max-w-full min-w-0 overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_#062731_0%,_#021318_58%,_#010a0d_100%)] text-white p-2 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-400/25 shadow-[0_24px_64px_rgba(0,0,0,0.65)] flex flex-col justify-between gap-2.5 sm:gap-3 relative">
      {/* Top Luxury Gameplay HUD */}
      <div className="w-full max-w-full min-w-0 grid grid-cols-2 sm:grid-cols-12 items-center gap-2 bg-[#03161c]/90 border border-amber-400/20 rounded-2xl px-3 sm:px-4 py-2.5 shadow-lg">
        {/* Level · Round Progress Dots */}
        <div className="sm:col-span-5 flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <span
            className="text-xs font-black uppercase tracking-wider shrink-0"
            style={{ color: activeLevelConfig.environment.cardAccent }}
          >
            LVL {activeLevelConfig.level} · {activeLevelConfig.name}
          </span>
          <span className="text-teal-700 text-xs">·</span>
          <div className="flex items-center gap-1.5" title={`Round ${currentRound} of ${activeLevelConfig.roundsCount}`}>
            <span className="text-[11px] text-teal-200/80 font-bold tabular-nums">
              R{currentRound}/{activeLevelConfig.roundsCount}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: activeLevelConfig.roundsCount }, (_, rIdx) => {
                const rNum = rIdx + 1;
                const isDone = rNum < currentRound;
                const isNow = rNum === currentRound;
                return (
                  <span
                    key={rNum}
                    className={`h-1.5 rounded-full transition-all ${
                      isDone
                        ? 'w-1.5 bg-amber-400'
                        : isNow
                        ? 'w-3.5 bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                        : 'w-1.5 bg-teal-800/80'
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <span className="text-[11px] text-amber-300/80 font-bold hidden md:inline">
            · {activeLevelConfig.cupCount} Cups
          </span>
        </div>

        {/* Three Animated Heart Lives */}
        <div className="sm:col-span-3 flex items-center justify-end sm:justify-center gap-2">
          <div className={`flex items-center gap-1.5 ${lostHeartAnim ? 'scale-110' : ''} transition-transform`}>
            {[1, 2, 3].map((heartIndex) => {
              const alive = heartIndex <= lives;
              return (
                <Heart
                  key={heartIndex}
                  className={`w-5 h-5 transition-all duration-300 ${
                    alive
                      ? 'text-rose-400 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.45)] scale-100'
                      : 'text-slate-700 scale-90 opacity-45'
                  }`}
                />
              );
            })}
          </div>
          {secondChanceArmed && (
            <ShieldCheck className="w-4 h-4 text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]" />
          )}
        </div>

        {/* Animated Score + Streak + Sound + Pause */}
        <div className="col-span-2 sm:col-span-4 flex items-center justify-between sm:justify-end gap-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-amber-400/15">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm sm:text-base font-black text-amber-300 tabular-nums">
                {displayedScore.toLocaleString()}
              </span>
            </div>

            {streak >= 2 && (
              <div className="flex items-center gap-0.5 text-amber-300 text-xs font-black tabular-nums">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>×{streak}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-[#041f27] hover:bg-[#072e39] border border-teal-500/25 text-amber-200 cursor-pointer transition-colors"
              title={progress.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            >
              {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={() => setIsPaused(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#05252e] hover:bg-[#083440] border border-amber-400/30 text-amber-50 text-xs font-bold cursor-pointer transition-colors"
            >
              <Pause className="w-3.5 h-3.5 text-amber-300" />
              <span>Pause</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Tap Live 9-Mode Formation Switcher Bar */}
      <div className="w-full max-w-full min-w-0 bg-[#03161c]/90 border border-amber-400/15 rounded-xl px-2.5 py-1.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300/85 shrink-0 pr-1">
          Mode
        </span>
        {SPOTQUEST_REEL_PRESETS.map((preset) => {
          const isCurrent = activeLevelConfig.reelMode === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => startLevel(activeLevelNum, preset.id)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wide transition-all cursor-pointer border ${
                isCurrent
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-amber-100 shadow-sm shadow-amber-500/25'
                  : 'bg-[#041e25] hover:bg-[#072c36] text-teal-100/90 border-teal-500/25'
              }`}
            >
              {preset.title}
            </button>
          );
        })}
      </div>

      {/* Live Phase Cue Bar */}
      {feedbackBanner && (
        <div
          className={`w-full max-w-full min-w-0 px-3 py-1.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
            feedbackBanner.tone === 'gold'
              ? 'bg-amber-950/45 border-amber-400/40 text-amber-200'
              : feedbackBanner.tone === 'rose'
              ? 'bg-rose-950/60 border-rose-400/45 text-rose-200'
              : feedbackBanner.tone === 'purple'
              ? 'bg-purple-950/60 border-purple-400/45 text-purple-200'
              : 'bg-[#041f27]/85 border-teal-400/30 text-teal-100'
          }`}
        >
          <span className="text-xs sm:text-sm font-black tracking-[0.14em] uppercase">{feedbackBanner.text}</span>
          {feedbackBanner.subtext && (
            <span className="text-[11px] sm:text-xs opacity-85">{feedbackBanner.subtext}</span>
          )}
        </div>
      )}

      {/* Center 3D Studio Arena Viewport */}
      <div className="relative w-full max-w-full min-w-0 rounded-2xl overflow-hidden border border-amber-400/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
        <GoldBall3DScene
          levelConfig={activeLevelConfig}
          phase={phase}
          countdownNum={countdownNum}
          ballCupId={ballCupId}
          secondaryBallCupId={secondaryBallCupId}
          decoyCupIds={decoyCupIds}
          selectedCupId={selectedCupId}
          selectedSecondaryCupId={selectedSecondaryCupId}
          revealedEmptyCupIds={revealedEmptyCupIds}
          showTrueBallCup={showTrueBallCup}
          isPaused={isPaused}
          freezeActive={freezeActive}
          slowMotionActive={slowMotionActive}
          extraVisionActive={extraVisionActive}
          celebrationBurstKey={celebrationBurstKey}
          onShuffleStepSound={handleShuffleStepSound}
          onShuffleComplete={handleShuffleComplete}
          onSelectCup={handleSelectCup}
        />
      </div>

      {/* Bottom Power-Up Control Bar */}
      <div className="w-full max-w-full min-w-0 bg-[#03161c]/90 border border-amber-400/20 rounded-2xl p-2 sm:p-3 shadow-lg space-y-1.5">
        {activePowerUpInfo && (
          <div className="text-[11px] text-amber-300 font-semibold px-1 text-center">
            {GOLD_BALL_POWER_UPS[activePowerUpInfo].name}: {GOLD_BALL_POWER_UPS[activePowerUpInfo].shortLabel}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(GOLD_BALL_POWER_UPS) as PowerUpType[]).map((type) => {
            const def = GOLD_BALL_POWER_UPS[type];
            const count = progress.powerUps[type] || 0;

            const isUsablePhase =
              (type === 'freeze' && phase === 'SHUFFLING' && !freezeActive) ||
              (type === 'slow_motion' &&
                (phase === 'OBSERVE' || phase === 'COUNTDOWN' || phase === 'SHUFFLING') &&
                !slowMotionActive) ||
              (type === 'extra_vision' && (phase === 'SHUFFLING' || phase === 'SELECTING') && !extraVisionActive) ||
              (type === 'second_chance' && (phase === 'SHUFFLING' || phase === 'SELECTING') && !secondChanceArmed);

            const isCurrentlyActive =
              (type === 'freeze' && freezeActive) ||
              (type === 'slow_motion' && slowMotionActive) ||
              (type === 'extra_vision' && extraVisionActive) ||
              (type === 'second_chance' && secondChanceArmed);

            return (
              <div
                key={type}
                className="relative rounded-xl border p-2 flex items-center justify-between gap-1.5 transition-all"
                style={{
                  background: def.bgGradient,
                  borderColor: isCurrentlyActive ? '#fbbf24' : def.borderColor,
                  opacity: count > 0 && (isUsablePhase || isCurrentlyActive) ? 1 : 0.62,
                }}
              >
                <button
                  type="button"
                  disabled={count <= 0 || !isUsablePhase}
                  onClick={() => handleUsePowerUp(type)}
                  className="flex-1 flex items-center gap-2 text-left cursor-pointer disabled:cursor-not-allowed min-w-0"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: 'rgba(2, 22, 27, 0.65)',
                      borderColor: def.borderColor,
                      color: def.accentColor,
                    }}
                  >
                    {renderPowerUpIcon(type, 'w-4 h-4')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-black text-white truncate">{def.name}</span>
                      <span className="px-1 rounded bg-slate-950/80 text-amber-300 text-[10px] font-black shrink-0">
                        ×{count}
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePowerUpInfo(activePowerUpInfo === type ? null : type)}
                  className="p-1 rounded-lg bg-slate-950/50 hover:bg-slate-950/80 text-teal-200/80 cursor-pointer shrink-0"
                  title={def.shortLabel}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 rounded-3xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#042229] border border-teal-400/45 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-bold uppercase">
              <span>GAME PAUSED</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Level {activeLevelConfig.level}: {activeLevelConfig.name}
            </h3>
            <p className="text-xs text-amber-300 font-bold uppercase">
              {activeLevelConfig.reelHeaderTitle} — {activeLevelConfig.reelHeaderSubtitle}
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleToggleSound}
                className="p-3 rounded-xl bg-teal-950/90 border border-teal-500/35 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {progress.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-teal-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span>Sound: {progress.soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVibration}
                className="p-3 rounded-xl bg-teal-950/90 border border-teal-500/35 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>Haptics: {progress.vibrationEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider cursor-pointer"
              >
                Resume Game
              </button>
              <button
                type="button"
                onClick={() => startLevel(activeLevelNum, customReelModeOverride)}
                className="w-full py-3 rounded-xl bg-teal-900/85 hover:bg-teal-800 border border-teal-400/40 text-teal-100 font-bold text-sm cursor-pointer"
              >
                Restart Level {activeLevelNum}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setScreen('LEVEL_SELECT');
                }}
                className="w-full py-3 rounded-xl bg-teal-950/90 hover:bg-teal-900 border border-teal-500/30 text-teal-200 font-bold text-sm cursor-pointer"
              >
                Level Selection
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setScreen('HOME');
                }}
                className="w-full py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm cursor-pointer"
              >
                Quit to Gold Ball Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElimikaGoldBallGame;
