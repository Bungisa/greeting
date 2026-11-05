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
  | 'stem_builder'
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
  initialClass = 'Form 1',
  initialSubject = 'Basic Mathematics',
  initialTopic = 'ALL',
  allPapers,
  onExitPlay,
}) => {
  const [activeRoute, setActiveRoute] = useState<PlayGameRoute>(
    initialRoute === 'stem_builder' ? 'hub' : initialRoute
  );
  const [progress, setProgress] = useState<ElimikaPlayProgress>(() => loadPlayProgress());
  const [selectedLaunchClass, setSelectedLaunchClass] = useState<string>(initialClass || 'Form 1');
  const [selectedLaunchSubject, setSelectedLaunchSubject] = useState<string>(
    initialSubject || 'Basic Mathematics'
  );

  useEffect(() => {
    setActiveRoute(initialRoute === 'stem_builder' ? 'hub' : initialRoute);
  }, [initialRoute]);

  const navigateToGame = (route: PlayGameRoute) => {
    const resolvedRoute = route === 'stem_builder' ? 'hub' : route;
    setActiveRoute(resolvedRoute);
    if (typeof window !== 'undefined') {
      const hashMap: Record<PlayGameRoute, string> = {
        hub: '#play',
        stem_builder: '#play',
        treasure_hunt: '#treasure-hunt',
        treasure_hunt_live: '#treasure-hunt-live',
        escape_classroom: '#escape-classroom',
        stem_arena: '#stem-arena',
      };
      window.history.replaceState(null, '', hashMap[resolvedRoute]);
    }
  };

  if (activeRoute === 'stem_arena') {
    return <StemArenaGame onExitGame={() => navigateToGame('hub')} />;
  }

  if (activeRoute === 'treasure_hunt' || activeRoute === 'treasure_hunt_live') {
    return (
      <TreasureHuntGame
        initialClass={selectedLaunchClass}
        initialSubject={selectedLaunchSubject}
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
        initialClass={selectedLaunchClass}
        initialSubject={selectedLaunchSubject}
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
          <div className="bg-slate-900 border-2 border-amber-400/70 hover:border-amber-400 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Full-Screen 3D · Non-Repeating Bank</span>
                </span>
                <span>Math &amp; Add. Math Ready</span>
              </div>
              <h2 className="text-xl font-black text-white">1. 3D NECTA Treasure Hunt</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Move your 3D Explorer across 6 connected 3D islands in Zanzibar, Kilimanjaro, or Serengeti. Questions are pulled from your persistent Textbook Question Bank and never repeat across sessions!
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5">
                {[
                  { cls: 'Form 1', sub: 'Basic Mathematics', label: 'Form 1 Math' },
                  { cls: 'Form 1', sub: 'Additional Mathematics', label: 'Form 1 Add. Math' },
                  { cls: 'Form 1', sub: 'Computer Science', label: 'Form 1 ICS / Computer' },
                  { cls: 'Form 2', sub: 'Chemistry', label: 'Form 2 Chemistry' },
                  { cls: 'Form 2', sub: 'Geography', label: 'Form 2 Geography' },
                  { cls: 'Form 2', sub: 'Basic Mathematics', label: 'Form 2 Math' },
                  { cls: 'Form 2', sub: 'Additional Mathematics', label: 'Form 2 Add. Math' },
                  { cls: 'Form 3', sub: 'Basic Mathematics', label: 'Form 3 Math' },
                  { cls: 'Form 3', sub: 'Additional Mathematics', label: 'Form 3 Add. Math' },
                ].map((p) => {
                  const isSel =
                    selectedLaunchClass === p.cls && selectedLaunchSubject === p.sub;
                  return (
                    <button
                      key={`${p.cls}-${p.sub}`}
                      type="button"
                      onClick={() => {
                        setSelectedLaunchClass(p.cls);
                        setSelectedLaunchSubject(p.sub);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        isSel
                          ? 'bg-emerald-400 text-slate-950 border-white'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="pt-1 space-y-1 text-xs text-slate-400">
                <div>• Pre-loaded TIE Textbook &amp; NECTA Question Bank</div>
                <div>• Non-repeating question tracker for every student play</div>
                <div>• Click-to-walk, WASD / Arrows, Shovel Dig &amp; 3D cameras</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigateToGame('treasure_hunt')}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>
                  Play #1 Treasure Hunt ({selectedLaunchClass} · {selectedLaunchSubject}) →
                </span>
              </button>
            </div>
          </div>

          {/* GAME 2: ESCAPE THE CLASSROOM */}
          <div className="bg-slate-900 border border-slate-800 hover:border-sky-400/70 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Full-Screen 3D · 3 Rooms</span>
                </span>
                <span>Form 1–3 Banks Ready</span>
              </div>
              <h2 className="text-xl font-black text-white">2. 3D Escape the Classroom</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Move your 3D student around a full-screen 3D laboratory. Follow the glowing START and NEXT signs from Lock #1 to Lock #4 to unlock the heavy exit door using your Textbook Question Bank.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5">
                {[
                  { cls: 'Form 1', sub: 'Basic Mathematics', label: 'Form 1 Math' },
                  { cls: 'Form 1', sub: 'Additional Mathematics', label: 'Form 1 Add. Math' },
                  { cls: 'Form 1', sub: 'Computer Science', label: 'Form 1 ICS / Computer' },
                  { cls: 'Form 2', sub: 'Chemistry', label: 'Form 2 Chemistry' },
                  { cls: 'Form 2', sub: 'Geography', label: 'Form 2 Geography' },
                  { cls: 'Form 2', sub: 'Basic Mathematics', label: 'Form 2 Math' },
                  { cls: 'Form 2', sub: 'Additional Mathematics', label: 'Form 2 Add. Math' },
                  { cls: 'Form 3', sub: 'Basic Mathematics', label: 'Form 3 Math' },
                  { cls: 'Form 3', sub: 'Additional Mathematics', label: 'Form 3 Add. Math' },
                ].map((p) => {
                  const isSel =
                    selectedLaunchClass === p.cls && selectedLaunchSubject === p.sub;
                  return (
                    <button
                      key={`esc-${p.cls}-${p.sub}`}
                      type="button"
                      onClick={() => {
                        setSelectedLaunchClass(p.cls);
                        setSelectedLaunchSubject(p.sub);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        isSel
                          ? 'bg-sky-400 text-slate-950 border-white'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-sky-400/50'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="pt-1 space-y-1 text-xs text-slate-400">
                <div>• Full-screen 3D room &amp; animated walking character</div>
                <div>• Glowing START HERE &amp; NEXT LOCK signs (no long text)</div>
                <div>• Click-to-walk, WASD / Arrows &amp; 3D camera angles</div>
              </div>
            </div>

            <button
              onClick={() => navigateToGame('escape_classroom')}
              className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                Play #2 Escape Room ({selectedLaunchClass} · {selectedLaunchSubject}) →
              </span>
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
