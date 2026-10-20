import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Compass,
  Crown,
  Gamepad2,
  Key,
  Lock,
  Sparkles,
} from 'lucide-react';
import { StemArenaGame } from './StemArenaGame';
import { TreasureHuntGame } from './games/TreasureHuntGame';
import { EscapeClassroomGame } from '../games/EscapeClassroomGame';
import {
  ElimikaPlayProgress,
  loadPlayProgress,
} from '../games/gameDataAndStorage';

import { PaperRecord } from '../data/curriculumData';

export type PlayGameRoute =
  | 'hub'
  | 'treasure_hunt'
  | 'treasure_hunt_live'
  | 'escape_classroom'
  | 'stem_arena';

interface ElimikaPlayHubProps {
  initialRoute?: PlayGameRoute;
  initialClass?: string;
  initialSubject?: string;
  initialTopic?: string;
  allPapers?: PaperRecord[];
  onExitPlay: () => void;
}

export const ElimikaPlayHub: React.FC<ElimikaPlayHubProps> = ({
  initialRoute = 'hub',
  initialClass = 'Form 3',
  initialSubject = 'Basic Mathematics',
  initialTopic = 'ALL',
  allPapers,
  onExitPlay,
}) => {
  const [activeRoute, setActiveRoute] = useState<PlayGameRoute>(initialRoute);
  const [progress, setProgress] = useState<ElimikaPlayProgress>(() => loadPlayProgress());

  useEffect(() => {
    setActiveRoute(initialRoute);
  }, [initialRoute]);

  const navigateToGame = (route: PlayGameRoute) => {
    setActiveRoute(route);
    if (typeof window !== 'undefined') {
      const hashMap: Record<PlayGameRoute, string> = {
        hub: '#play',
        treasure_hunt: '#treasure-hunt',
        treasure_hunt_live: '#treasure-hunt-live',
        escape_classroom: '#escape-classroom',
        stem_arena: '#stem-arena',
      };
      window.history.replaceState(null, '', hashMap[route]);
    }
  };

  if (activeRoute === 'stem_arena') {
    return <StemArenaGame onExitGame={() => navigateToGame('hub')} />;
  }

  if (activeRoute === 'treasure_hunt' || activeRoute === 'treasure_hunt_live') {
    return (
      <TreasureHuntGame
        initialClass={initialClass}
        initialSubject={initialSubject}
        initialTopic={initialTopic}
        allPapers={allPapers}
        onExitToHub={() => navigateToGame('hub')}
        onProgressUpdate={(p) => setProgress(p)}
      />
    );
  }

  if (activeRoute === 'escape_classroom') {
    return (
      <EscapeClassroomGame
        initialClass={initialClass}
        initialSubject={initialSubject}
        initialTopic={initialTopic}
        allPapers={allPapers}
        onExitToHub={() => navigateToGame('hub')}
        onProgressUpdate={(p) => setProgress(p)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitPlay}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Elimika Home</span>
          </button>
          <div>
            <div className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
              <span>ELIMIKA PLAY</span>
            </div>
            <div className="text-xs text-slate-400">
              Interactive Curriculum Adventure &amp; Examination Mastery Games
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-amber-300">
            Total XP: {progress.totalXp}
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-emerald-300">
            Badges: {progress.unlockedBadges.length}
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 font-bold text-sky-300">
            Relics: {progress.collectedArtifacts.length}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Banner */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Tanzanian Curriculum Game Arcade · Standard 1–7 &amp; Form 1–6
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Choose Your Educational Adventure
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Master Mathematics, Biology, Chemistry, Physics, Geography, History, and English through interactive expeditions, classroom escape rooms, and rapid-fire STEM challenges.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 tabular-nums text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Adventures Won</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {progress.adventuresCompleted.length} / 3
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Rooms Escaped</div>
              <div className="text-xl font-black text-sky-400 mt-0.5">
                {progress.roomsEscaped.length} / 3
              </div>
            </div>
          </div>
        </section>

        {/* 3 Independent Game Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* GAME 1: NECTA TREASURE HUNT */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-400/70 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Live Island Expedition · 3 Worlds</span>
                </span>
                <span>6 Checkpoints · 20 Questions</span>
              </div>
              <h2 className="text-xl font-black text-white">1. NECTA Treasure Hunt</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Walk across the Zanzibar Spice Archipelago, Mount Kilimanjaro Peak, or the Serengeti Rift in real time. Solve 20 autogenerated curriculum questions across 6 checkpoints and excavate buried relics to open the Grand Vault.
              </p>
              <div className="pt-2 space-y-1 text-xs text-slate-400">
                <div>• Real-time walking avatar (WASD, Arrows &amp; Click-to-Walk)</div>
                <div>• Live magnetic compass, shovel X-digging &amp; Day/Night cycle</div>
                <div>• 20 questions per adventure with MathJax step-by-step solutions</div>
              </div>
            </div>

            <button
              onClick={() => navigateToGame('treasure_hunt')}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Play NECTA Treasure Hunt →</span>
            </button>
          </div>

          {/* GAME 2: ESCAPE THE CLASSROOM */}
          <div className="bg-slate-900 border border-slate-800 hover:border-sky-400/70 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Escape Room · 3 Rooms</span>
                </span>
                <span>8 Interactive Objects</span>
              </div>
              <h2 className="text-xl font-black text-white">2. Escape the Classroom</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Trapped inside the STEM Laboratory, Examination Hall, or Scholar’s Library! Inspect the chalkboard, desk drawer, lab bench, locked cabinet, and wall clock to synthesize the master keypad sequence before time runs out.
              </p>
              <div className="pt-2 space-y-1 text-xs text-slate-400">
                <div>• Interactive 3D-perspective room exploration</div>
                <div>• Countdown Timer + Untimed Practice Mode option</div>
                <div>• Inventory bar, progressive hints &amp; full explanations</div>
              </div>
            </div>

            <button
              onClick={() => navigateToGame('escape_classroom')}
              className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Play Escape the Classroom →</span>
            </button>
          </div>

          {/* GAME 3: STEM ARENA (ORIGINAL WORKING GAME — PRESERVED UNCHANGED) */}
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-400/70 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Arcade Action · Original</span>
                </span>
                <span>20 Waves</span>
              </div>
              <h2 className="text-xl font-black text-white">3. Elimika STEM Arena</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pilot the green seeker orb across the 2D physics arena and intercept the glowing orb carrying the correct mathematical value across 20 fast-paced NECTA waves.
              </p>
              <div className="pt-2 space-y-1 text-xs text-slate-400">
                <div>• Real-time 60fps HTML5 canvas arcade physics</div>
                <div>• Touch, mouse &amp; WASD / Arrow key controls</div>
                <div>• Rapid mental math &amp; logarithm reflex training</div>
              </div>
            </div>

            <button
              onClick={() => navigateToGame('stem_arena')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play STEM Arena (Original) →</span>
            </button>
          </div>
        </section>

        {/* Badges & Collected Relics Showcase */}
        {(progress.unlockedBadges.length > 0 || progress.collectedArtifacts.length > 0) && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Your Earned Badges &amp; Collected Relics</span>
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {progress.unlockedBadges.map((b, i) => (
                <span
                  key={`badge-${i}`}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 font-bold"
                >
                  🏆 {b}
                </span>
              ))}
              {progress.collectedArtifacts.map((a, i) => (
                <span
                  key={`art-${i}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-semibold"
                >
                  ★ {a}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
