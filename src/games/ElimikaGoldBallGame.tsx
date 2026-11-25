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

      const modeHint =
        cfg.reelMode === 'split_brain_2x3'
          ? 'Track BOTH the Top Gold Ball AND Bottom Pink Ball as cups pass in wide lanes!'
          : cfg.targetType === 'golden_die' || cfg.reelMode === 'crimson_die_oval_8'
          ? 'Lock your eyes on the 3D GOLDEN DIE as the 8 crimson cups pass each other!'
          : cfg.reelMode === 'infinity_figure8_12'
          ? 'Follow the golden sphere along the Figure-8 Infinity loop and passing lanes!'
          : cfg.reelMode === 'chaos_trefoil_12'
          ? 'Follow the golden sphere across the 3-petal clover lobes and roundabout passes!'
          : cfg.decoyBallsCount > 0
          ? 'Ignore the silver decoy balls — lock your eyes ONLY on the GOLD BALL!'
          : cfg.reelMode === 'orbit_ring_8'
          ? 'The 8-cup ring will keep spinning while cups pass each other across wide arcs!'
          : `Memorize which of the ${cfg.cupCount} widely spaced cups covers the golden ball!`;

      setFeedbackBanner({
        text: `ROUND ${roundNumber} OF ${cfg.roundsCount} — ${cfg.reelHeaderTitle}`,
        subtext: modeHint,
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
        text: 'GET READY TO TRACK!',
        subtext: `${activeLevelConfig.complexityLabel} • ${activeLevelConfig.speedLabel}`,
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
              ? 'SPLIT BRAIN SHUFFLE — TRACK TOP & BOTTOM!'
              : activeLevelConfig.reelMode === 'orbit_ring_8'
              ? 'ORBIT SHUFFLE — THE CUPS NEVER STOP SPINNING!'
              : activeLevelConfig.decoyBallsCount > 0
              ? 'MIND TRAP SHUFFLE — FOLLOW GOLD, TRUST NOTHING!'
              : 'SHUFFLING — FOLLOW THE GOLD BALL!',
          subtext: 'Use FREEZE, SLOW MOTION, or EXTRA VISION if you need a tactical edge.',
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
          ? 'SELECT BOTH CUPS: 1 TOP (GOLD) + 1 BOTTOM (PINK)!'
          : 'WHICH CUP? TAP THE 3D CUP OR NUMBER!',
      subtext:
        activeLevelConfig.reelMode === 'split_brain_2x3'
          ? 'Tap one cup in the Top row and one cup in the Bottom row.'
          : `Tap the cup (1–${activeLevelConfig.cupCount}) hiding the shiny golden ball!`,
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
          text: isSplitBrain
            ? `DUAL-BRAIN BULLSEYE! +${roundGain} PTS`
            : `BRILLIANT TRACKING! +${roundGain} PTS`,
          subtext: `Base +${basePts} • Speed Bonus +${speedBonus}${
            streakPts > 0 ? ` • Streak ×${newStreak} (+${streakPts})` : ''
          }`,
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
            text: 'SECOND CHANCE SHIELD USED!',
            subtext: 'Empty cup revealed without losing a life! Pick again now.',
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
          text: nextLives > 0 ? `MISSED! 1 LIFE LOST (${nextLives} REMAINING)` : 'ALL 3 LIVES EXHAUSTED!',
          subtext:
            nextLives > 0
              ? 'Watch where the true ball was hiding — get ready to retry this round!'
              : 'You ran out of lives before completing the level.',
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
            text: isTopCup
              ? 'TOP CUP LOCKED IN! NOW PICK A BOTTOM CUP (4–6)'
              : 'BOTTOM CUP LOCKED IN! NOW PICK A TOP CUP (1–3)',
            subtext: 'Split Brain requires tracking both the Top Gold Ball and Bottom Pink Ball!',
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
      setFeedbackBanner({
        text: 'FREEZE ACTIVATED!',
        subtext: 'All cups and orbital rings frozen mid-trajectory for 2.5 seconds!',
        tone: 'teal',
      });
    } else if (type === 'slow_motion') {
      if ((phase !== 'SHUFFLING' && phase !== 'COUNTDOWN' && phase !== 'OBSERVE') || slowMotionActive) return;
      setSlowMotionActive(true);
      setFeedbackBanner({
        text: 'SLOW MOTION ENGAGED!',
        subtext: 'Shuffle and orbit speed reduced by 50% for this round.',
        tone: 'teal',
      });
    } else if (type === 'extra_vision') {
      if ((phase !== 'SHUFFLING' && phase !== 'SELECTING') || extraVisionActive) return;
      setExtraVisionActive(true);
      if (extraVisionTimerRef.current) clearTimeout(extraVisionTimerRef.current);
      extraVisionTimerRef.current = window.setTimeout(() => {
        setExtraVisionActive(false);
      }, 1750);
      setFeedbackBanner({
        text: 'EXTRA VISION X-RAY PULSE!',
        subtext: 'Revealing the true ball(s) through their cups!',
        tone: 'gold',
      });
    } else if (type === 'second_chance') {
      if ((phase !== 'SELECTING' && phase !== 'SHUFFLING') || secondChanceArmed) return;
      setSecondChanceArmed(true);
      setFeedbackBanner({
        text: 'SECOND CHANCE SHIELD ARMED!',
        subtext: 'Your next wrong selection in this round will not cost a life!',
        tone: 'purple',
      });
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
      <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-[#02161b] via-[#05262e] to-[#03191f] text-white p-4 sm:p-6 flex flex-col justify-between rounded-3xl border border-teal-500/25 shadow-2xl space-y-6">
        {/* Top Bar: Back to Games Hub + Audio / Vibration Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-teal-500/20">
          <div className="flex items-center gap-3">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-950/80 hover:bg-teal-900/90 border border-teal-500/35 text-teal-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-teal-300" />
                <span>Elimika Games Hub</span>
              </button>
            )}
            <div className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
              9 Viral Reel Modes • Wide-Gap Two-Lane Passing
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                progress.soundEnabled
                  ? 'bg-teal-900/70 border-teal-400/45 text-teal-100'
                  : 'bg-slate-900/70 border-slate-700 text-slate-400'
              }`}
            >
              {progress.soundEnabled ? <Volume2 className="w-4 h-4 text-teal-300" /> : <VolumeX className="w-4 h-4" />}
              <span>Sound {progress.soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleVibration}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                progress.vibrationEnabled
                  ? 'bg-teal-900/70 border-teal-400/45 text-teal-100'
                  : 'bg-slate-900/70 border-slate-700 text-slate-400'
              }`}
            >
              <Smartphone className={`w-4 h-4 ${progress.vibrationEnabled ? 'text-amber-300' : ''}`} />
              <span>Haptics {progress.vibrationEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-teal-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ELIMIKA TANZANIA • 3D VISUAL TRACKING ARENA</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-teal-200">
              ELIMIKA GOLD BALL
            </h1>
            <p className="text-sm sm:text-base font-bold text-teal-200 tracking-wide uppercase">
              9 Viral Challenge Modes: 8 Cups One Die • Mission Impossible • Figure-8 Infinity • Chaos Clover • 3×3 Insane • Brain Breaker • Orbit • Split Brain • Mind Trap
            </p>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl leading-relaxed">
              Track the gleaming 24K golden sphere or 3D Golden Die across wide-spaced formations where cups clearly{' '}
              <span className="text-amber-300 font-semibold">pass each other in separated lanes</span> from{' '}
              <span className="text-teal-300 font-semibold">Level 1: Rookie</span> to{' '}
              <span className="text-amber-300 font-semibold">Level 10: Insane</span>, or tap any of the 9 Viral Reel
              modes below!
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => startLevel(progress.highestUnlockedLevel, null)}
                className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>
                  PLAY LEVEL {progress.highestUnlockedLevel}: {currentConfig.name.toUpperCase()}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('LEVEL_SELECT')}
                className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-teal-900/80 hover:bg-teal-800/90 border border-teal-400/45 text-teal-50 font-bold text-sm sm:text-base shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Grid className="w-5 h-5 text-teal-300" />
                <span>LEVEL SELECTION (1–10)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Progress & Power-Up Inventory */}
          <div className="lg:col-span-5">
            <div className="p-5 rounded-2xl bg-[#031d24]/90 border border-teal-400/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-300/80">
                    Current Campaign Stage
                  </div>
                  <div className="text-lg font-black text-white">
                    Level {progress.highestUnlockedLevel} • {currentConfig.name} ({currentConfig.reelHeaderTitle})
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-yellow-200/60">
                  <Trophy className="w-6 h-6 text-slate-950" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-teal-950/75 border border-teal-500/25">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300/75">
                    Total Score
                  </div>
                  <div className="text-xl font-black text-amber-300 mt-0.5">
                    {progress.totalScore.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/75 border border-teal-500/25">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300/75">
                    Best Level Score
                  </div>
                  <div className="text-xl font-black text-teal-200 mt-0.5">
                    {progress.bestSingleLevelScore.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/75 border border-teal-500/25">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300/75">
                    Stars Earned
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-lg font-black text-white">{totalStarsEarned} / 30</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-950/75 border border-teal-500/25">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300/75">
                    Levels Completed
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-lg font-black text-white">{progress.completedLevels.length} / 10</span>
                  </div>
                </div>
              </div>

              {/* Power-Ups */}
              <div className="pt-2 border-t border-teal-500/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300/80 mb-2">
                  Tactical Power-Up Inventory
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(GOLD_BALL_POWER_UPS) as PowerUpType[]).map((key) => {
                    const def = GOLD_BALL_POWER_UPS[key];
                    return (
                      <div
                        key={key}
                        className="p-2 rounded-xl bg-teal-950/90 border border-teal-500/30 flex flex-col items-center text-center"
                      >
                        <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
                          {renderPowerUpIcon(key, 'w-3.5 h-3.5')}
                          <span>×{progress.powerUps[key]}</span>
                        </div>
                        <div className="text-[9px] font-bold text-teal-100 mt-0.5 truncate w-full">{def.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 9 Viral Reel Challenge Modes Strip */}
        <div className="space-y-3 pt-2 border-t border-teal-500/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                9 Viral Reel Challenge Formations (Tap Any Mode to Play at Level {progress.highestUnlockedLevel} Speed)
              </span>
            </div>
            <span className="text-xs text-teal-300/80">
              Wide Cup Gaps • Two-Lane Non-Overlapping Passing • Featured Across Campaign Levels 1–10
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SPOTQUEST_REEL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => startLevel(progress.highestUnlockedLevel, preset.id)}
                className="text-left p-3.5 rounded-2xl bg-[#031d24]/90 hover:bg-[#062d38] border border-teal-400/35 hover:border-amber-400/70 transition-all flex flex-col justify-between gap-2.5 group cursor-pointer shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: `${preset.accentColor}22`,
                        color: preset.accentColor,
                        border: `1px solid ${preset.accentColor}66`,
                      }}
                    >
                      {preset.badge}
                    </span>
                    <Play className="w-3.5 h-3.5 text-amber-400 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-sm font-black text-white">{preset.title}</div>
                  <div className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide mt-0.5">
                    {preset.subtitle}
                  </div>
                  <p className="text-[11px] text-teal-100/75 mt-1.5 leading-snug">{preset.description}</p>
                </div>
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
      <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-[#02161b] via-[#05262e] to-[#03191f] text-white p-4 sm:p-6 rounded-3xl border border-teal-500/25 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-teal-500/20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScreen('HOME')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-950/80 hover:bg-teal-900/90 border border-teal-500/35 text-teal-100 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-teal-300" />
              <span>Back to Gold Ball Home</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">SELECT ARENA LEVEL (1–10)</h2>
              <p className="text-xs text-teal-200/80">
                Strict sequential unlocking from Level 1 (Rookie) to Level 10 (Insane 12-Cup Singularity).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-teal-950/85 border border-teal-400/30">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{totalStarsEarned} / 30 Stars</span>
            </div>
            <span className="text-teal-600">•</span>
            <div className="text-sm font-bold text-teal-200">
              Unlocked: {progress.highestUnlockedLevel}/10
            </div>
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
                    ? 'bg-[#042229]/95 border-teal-400/45 hover:border-amber-400/70 shadow-lg'
                    : 'bg-[#021418]/75 border-teal-900/50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase"
                      style={{
                        backgroundColor: isUnlocked ? `${lvl.environment.cardAccent}22` : 'rgba(15,23,42,0.7)',
                        color: isUnlocked ? lvl.environment.cardAccent : '#64748b',
                        border: `1px solid ${isUnlocked ? lvl.environment.cardAccent : '#334155'}`,
                      }}
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
                      <div className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white">{lvl.name}</h3>
                  <div className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wide mt-0.5">
                    {lvl.reelHeaderTitle} • {lvl.cupCount} Cups
                  </div>
                  <p className="text-[11px] text-teal-100/70 mt-1 line-clamp-2">{lvl.themeDescription}</p>

                  <div className="mt-3 pt-2.5 border-t border-teal-500/20 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-teal-200/85">
                      <span>Formation:</span>
                      <span className="font-bold text-white">{lvl.reelHeaderTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-teal-200/85">
                      <span>Speed:</span>
                      <span className="font-bold text-amber-300">{lvl.speedLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-teal-200/85">
                      <span>Best Score:</span>
                      <span className="font-bold text-emerald-300">
                        {bestScore > 0 ? bestScore.toLocaleString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => startLevel(lvl.level, null)}
                      className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        lvl.level === progress.highestUnlockedLevel
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-400'
                          : 'bg-teal-800/80 hover:bg-teal-700 text-teal-50 border border-teal-400/40'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Replay Level' : 'Play Level'}</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 font-bold text-[11px] flex items-center justify-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Complete Level {lvl.level - 1}</span>
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
            <span>
              LEVEL {activeLevelNum} ({activeLevelConfig.name.toUpperCase()}) COMPLETE •{' '}
              {activeLevelConfig.celebrationBadge}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300">
            {activeLevelConfig.celebrationTitle}
          </h2>
          <p className="text-sm text-teal-100/85 max-w-md mx-auto leading-relaxed">
            {activeLevelConfig.celebrationSubtitle}
          </p>

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
          <p className="text-sm text-teal-100/80 leading-relaxed">
            The golden ball slipped past your gaze on{' '}
            <span className="text-amber-300 font-bold">
              Level {activeLevelNum}: {activeLevelConfig.name} ({activeLevelConfig.reelHeaderTitle})
            </span>
            . Sharpen your focus and retry the level to unlock the next stage!
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
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-[#02161b] via-[#04232b] to-[#021419] text-white p-3 sm:p-5 rounded-3xl border border-teal-500/30 shadow-2xl flex flex-col justify-between gap-3 relative">
      {/* Top Gameplay HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-12 items-center gap-2.5 bg-[#031c22]/95 border border-teal-500/30 rounded-2xl px-3.5 py-2.5 shadow-lg">
        <div className="sm:col-span-4 flex items-center gap-2.5">
          <div
            className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shrink-0"
            style={{
              backgroundColor: `${activeLevelConfig.environment.cardAccent}25`,
              color: activeLevelConfig.environment.cardAccent,
              border: `1px solid ${activeLevelConfig.environment.cardAccent}66`,
            }}
          >
            LVL {activeLevelConfig.level} • {activeLevelConfig.name}
          </div>
          <div className="text-xs text-teal-200/90 font-semibold truncate">
            Round{' '}
            <span className="text-white font-black">
              {currentRound}/{activeLevelConfig.roundsCount}
            </span>
            <span className="ml-1.5 text-amber-300 font-bold">({activeLevelConfig.cupCount} Cups)</span>
          </div>
        </div>

        {/* Three Animated Heart Lives */}
        <div className="sm:col-span-4 flex items-center justify-end sm:justify-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300/80 hidden md:inline">
            Lives:
          </span>
          <div className={`flex items-center gap-1.5 ${lostHeartAnim ? 'scale-110' : ''} transition-transform`}>
            {[1, 2, 3].map((heartIndex) => {
              const alive = heartIndex <= lives;
              return (
                <div
                  key={heartIndex}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    alive
                      ? 'bg-rose-500/20 border-rose-400/50 scale-100 shadow-sm shadow-rose-500/20'
                      : 'bg-slate-900/70 border-slate-800 scale-90 opacity-40'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      alive ? 'text-rose-400 fill-rose-500' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          {secondChanceArmed && (
            <span
              className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-400/60 text-purple-200 text-[10px] font-bold uppercase"
              title="Second Chance Shield Armed"
            >
              Shield On
            </span>
          )}
        </div>

        {/* Animated Score + Streak + Sound + Pause */}
        <div className="col-span-2 sm:col-span-4 flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-teal-500/20">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-teal-950/90 border border-amber-400/40 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-teal-300 font-semibold">Score:</span>
              <span className="text-sm font-black text-amber-300 tabular-nums">
                {displayedScore.toLocaleString()}
              </span>
            </div>

            {streak >= 2 && (
              <div className="px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>×{streak}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-500/35 text-teal-200 cursor-pointer"
              title={progress.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            >
              {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={() => setIsPaused(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-900/80 hover:bg-teal-800 border border-teal-400/45 text-teal-50 text-xs font-bold cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Tap Live 9-Mode Formation Switcher Bar right inside the Gameplay Screen */}
      <div className="bg-[#031c22]/95 border border-teal-500/30 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 shrink-0 px-1.5">
          Arena Mode:
        </span>
        {SPOTQUEST_REEL_PRESETS.map((preset) => {
          const isCurrent = activeLevelConfig.reelMode === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => startLevel(activeLevelNum, preset.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wide shrink-0 transition-all cursor-pointer border ${
                isCurrent
                  ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-sm'
                  : 'bg-teal-950/85 hover:bg-teal-900 text-teal-100 border-teal-500/35'
              }`}
            >
              {preset.title}
            </button>
          );
        })}
      </div>

      {/* Live Instruction / Phase Feedback Banner */}
      {feedbackBanner && (
        <div
          className={`px-4 py-2 rounded-xl border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 ${
            feedbackBanner.tone === 'gold'
              ? 'bg-amber-950/60 border-amber-400/50 text-amber-200'
              : feedbackBanner.tone === 'rose'
              ? 'bg-rose-950/70 border-rose-400/50 text-rose-200'
              : feedbackBanner.tone === 'purple'
              ? 'bg-purple-950/70 border-purple-400/50 text-purple-200'
              : 'bg-teal-950/75 border-teal-400/45 text-teal-100'
          }`}
        >
          <span className="text-xs sm:text-sm font-black tracking-wide uppercase">{feedbackBanner.text}</span>
          {feedbackBanner.subtext && (
            <span className="text-[11px] sm:text-xs opacity-85">{feedbackBanner.subtext}</span>
          )}
        </div>
      )}

      {/* Center 3D Game Environment Viewport */}
      <div className="relative flex-1 min-h-[400px] sm:min-h-[460px] w-full rounded-2xl overflow-hidden border border-teal-500/30 shadow-inner">
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
      <div className="bg-[#031c22]/95 border border-teal-500/30 rounded-2xl p-3 shadow-lg space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-teal-300/85 px-1">
          <span className="font-bold uppercase tracking-wider">Tactical Power-Ups (Tap to Activate)</span>
          {activePowerUpInfo && (
            <span className="text-amber-300 font-semibold">
              {GOLD_BALL_POWER_UPS[activePowerUpInfo].name}: {GOLD_BALL_POWER_UPS[activePowerUpInfo].description}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                className="relative rounded-xl border p-2.5 flex items-center justify-between gap-2 transition-all"
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
                  className="flex-1 flex items-center gap-2.5 text-left cursor-pointer disabled:cursor-not-allowed"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: 'rgba(2, 22, 27, 0.65)',
                      borderColor: def.borderColor,
                      color: def.accentColor,
                    }}
                  >
                    {renderPowerUpIcon(type, 'w-5 h-5')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white truncate">{def.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-950/80 text-amber-300 text-[10px] font-black">
                        ×{count}
                      </span>
                    </div>
                    <div className="text-[10px] text-teal-100/80 truncate">
                      {isCurrentlyActive ? 'ACTIVE NOW' : def.shortLabel}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePowerUpInfo(activePowerUpInfo === type ? null : type)}
                  className="p-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-950/80 text-teal-200/80 cursor-pointer"
                  title={def.description}
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
