import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Compass,
  Crown,
  Eye,
  Gamepad2,
  Key,
  Lock,
  Play,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

const StemArenaGame = React.lazy(() =>
  import('./StemArenaGame').then((m) => ({ default: m.StemArenaGame }))
);
const TreasureHuntGame = React.lazy(() =>
  import('./games/TreasureHuntGame').then((m) => ({ default: m.TreasureHuntGame }))
);
const EscapeClassroomGame = React.lazy(() =>
  import('../games/EscapeClassroomGame').then((m) => ({ default: m.EscapeClassroomGame }))
);
const TugOfWarGame = React.lazy(() =>
  import('../games/TugOfWarGame').then((m) => ({ default: m.TugOfWarGame }))
);
const ElimikaGoldBallGame = React.lazy(() =>
  import('../games/ElimikaGoldBallGame').then((m) => ({ default: m.ElimikaGoldBallGame }))
);
const TeacherClassroomGameStudio = React.lazy(() =>
  import('./games/TeacherClassroomGameStudio').then((m) => ({
    default: m.TeacherClassroomGameStudio,
  }))
);
import type { ClassroomCreationOption } from '../games/teacherClassroomGameEngine';
import {
  ElimikaPlayProgress,
  getAvailableSubjectsForClass,
  getAvailableTopicsForClassSubject,
  loadPlayProgress,
  PLAY_CLASSES,
} from '../games/gameDataAndStorage';

import { PaperRecord, TIE_CURRICULUM_SUBJECTS } from '../data/curriculumData';

export type PlayGameRoute =
  | 'hub'
  | 'gold_ball'
  | 'stem_builder'
  | 'treasure_hunt'
  | 'treasure_hunt_live'
  | 'escape_classroom'
  | 'stem_arena'
  | 'tug_of_war'
  | 'classroom_studio';

interface ElimikaPlayHubProps {
  initialRoute?: PlayGameRoute;
  initialClass?: string;
  initialSubject?: string;
  initialTopic?: string;
  allPapers?: PaperRecord[];
  onExitPlay?: () => void;
}

export const ElimikaPlayHub: React.FC<ElimikaPlayHubProps> = ({
  initialRoute = 'hub',
  initialClass = 'Form 4',
  initialSubject = 'Basic Mathematics',
  initialTopic = 'ALL',
  allPapers,
}) => {
  const [activeRoute, setActiveRoute] = useState<PlayGameRoute>(initialRoute);
  const [studioInitialOption, setStudioInitialOption] = useState<ClassroomCreationOption>('bank');
  const [progress, setProgress] = useState<ElimikaPlayProgress>(() => loadPlayProgress());
  const [selectedLaunchClass, setSelectedLaunchClass] = useState<string>(initialClass || 'Form 4');
  const [selectedLaunchSubject, setSelectedLaunchSubject] = useState<string>(
    initialSubject || 'Basic Mathematics'
  );
  const [selectedLaunchTopic, setSelectedLaunchTopic] = useState<string>(initialTopic || 'ALL');

  useEffect(() => {
    setActiveRoute(initialRoute);
  }, [initialRoute]);

  useEffect(() => {
    const handleReturnToHub = () => setActiveRoute('hub');
    window.addEventListener('elimika-play-return-hub', handleReturnToHub);
    return () => window.removeEventListener('elimika-play-return-hub', handleReturnToHub);
  }, []);

  useEffect(() => {
    if (initialClass) {
      setSelectedLaunchClass(initialClass);
      const validSubs =
        getAvailableSubjectsForClass(initialClass, allPapers) ||
        TIE_CURRICULUM_SUBJECTS[initialClass] || ['Basic Mathematics'];
      const nextSub =
        initialSubject && validSubs.includes(initialSubject)
          ? initialSubject
          : validSubs.includes(selectedLaunchSubject)
          ? selectedLaunchSubject
          : validSubs[0] || 'Basic Mathematics';
      setSelectedLaunchSubject(nextSub);
      const validTopics = getAvailableTopicsForClassSubject(initialClass, nextSub, allPapers);
      if (initialTopic && initialTopic !== 'ALL' && validTopics.includes(initialTopic)) {
        setSelectedLaunchTopic(initialTopic);
      } else {
        setSelectedLaunchTopic('ALL');
      }
    }
  }, [initialClass, initialSubject, initialTopic]);

  const availableSubjectsForClass = useMemo(
    () =>
      getAvailableSubjectsForClass(selectedLaunchClass, allPapers) ||
      TIE_CURRICULUM_SUBJECTS[selectedLaunchClass] || ['Basic Mathematics'],
    [selectedLaunchClass, allPapers]
  );

  const availableTopicsForSelection = useMemo(
    () => getAvailableTopicsForClassSubject(selectedLaunchClass, selectedLaunchSubject, allPapers),
    [selectedLaunchClass, selectedLaunchSubject, allPapers]
  );

  const handleClassChangeInHub = (nextClass: string) => {
    setSelectedLaunchClass(nextClass);
    const validSubs =
      getAvailableSubjectsForClass(nextClass, allPapers) ||
      TIE_CURRICULUM_SUBJECTS[nextClass] || ['Basic Mathematics'];
    const nextSub = validSubs.includes(selectedLaunchSubject)
      ? selectedLaunchSubject
      : validSubs[0] || 'Basic Mathematics';
    setSelectedLaunchSubject(nextSub);
    setSelectedLaunchTopic('ALL');
  };

  const handleSubjectChangeInHub = (nextSubject: string) => {
    setSelectedLaunchSubject(nextSubject);
    setSelectedLaunchTopic('ALL');
  };

  const navigateToGame = (route: PlayGameRoute) => {
    setActiveRoute(route);
    setProgress(loadPlayProgress());
    if (typeof window !== 'undefined') {
      const hashMap: Record<PlayGameRoute, string> = {
        hub: '#play',
        gold_ball: '#gold-ball',
        stem_builder: '#gold-ball',
        treasure_hunt: '#treasure-hunt',
        treasure_hunt_live: '#treasure-hunt-live',
        escape_classroom: '#escape-classroom',
        stem_arena: '#stem-arena',
        tug_of_war: '#tug-of-war',
        classroom_studio: '#classroom-studio',
      };
      window.history.replaceState(null, '', hashMap[route]);
    }
  };

  const openTeacherClassroomStudio = (option: ClassroomCreationOption) => {
    setStudioInitialOption(option);
    navigateToGame('classroom_studio');
  };

  const gameLoadingFallback = (
    <div className="w-full min-h-[45vh] flex items-center justify-center p-6">
      <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (activeRoute === 'stem_arena') {
    return (
      <Suspense fallback={gameLoadingFallback}>
        <StemArenaGame onExitGame={() => navigateToGame('hub')} />
      </Suspense>
    );
  }

  if (activeRoute === 'treasure_hunt' || activeRoute === 'treasure_hunt_live') {
    return (
      <Suspense fallback={gameLoadingFallback}>
        <TreasureHuntGame
          initialClass={selectedLaunchClass}
          initialSubject={selectedLaunchSubject}
          initialTopic={selectedLaunchTopic}
          allPapers={allPapers}
          onExitToHub={() => navigateToGame('hub')}
          onProgressUpdate={(p) => setProgress(p)}
        />
      </Suspense>
    );
  }

  if (activeRoute === 'escape_classroom') {
    return (
      <div className="pb-16 lg:pb-0">
        <Suspense fallback={gameLoadingFallback}>
          <EscapeClassroomGame
            initialClass={selectedLaunchClass}
            initialSubject={selectedLaunchSubject}
            initialTopic={selectedLaunchTopic}
            allPapers={allPapers}
            onExitToHub={() => navigateToGame('hub')}
            onProgressUpdate={(p) => setProgress(p)}
          />
        </Suspense>
      </div>
    );
  }

  if (activeRoute === 'tug_of_war') {
    return (
      <div className="pb-16 lg:pb-0">
        <Suspense fallback={gameLoadingFallback}>
          <TugOfWarGame
            initialClass={selectedLaunchClass}
            initialSubject={selectedLaunchSubject}
            initialTopic={selectedLaunchTopic}
            allPapers={allPapers}
            onExitToHub={() => navigateToGame('hub')}
            onProgressUpdate={(p) => setProgress(p)}
          />
        </Suspense>
      </div>
    );
  }

  if (activeRoute === 'classroom_studio') {
    return (
      <div className="pb-16 lg:pb-0">
        <Suspense fallback={gameLoadingFallback}>
          <TeacherClassroomGameStudio
            initialClass={selectedLaunchClass}
            initialSubject={selectedLaunchSubject}
            initialTopic={selectedLaunchTopic}
            initialCreationOption={studioInitialOption}
            allPapers={allPapers}
            onBackToGamesHub={() => navigateToGame('hub')}
          />
        </Suspense>
      </div>
    );
  }

  // ==================== ELIMIKA GOLD BALL – THE ULTIMATE TRACKING CHALLENGE ====================
  if (activeRoute === 'gold_ball' || activeRoute === 'stem_builder') {
    return (
      <div className="pb-16 lg:pb-0 max-w-6xl mx-auto p-2 sm:p-4">
        <Suspense fallback={gameLoadingFallback}>
          <ElimikaGoldBallGame onBackToHub={() => navigateToGame('hub')} />
        </Suspense>
      </div>
    );
  }

  // ==================== SCREEN 8: LEARNING GAMES HUB ====================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24">
      {/* Golden-Yellow & Royal Blue Hero Banner (Matches Screen 8 in Both Design References) */}
      <div className="bg-gradient-to-br from-[#0A3D91] via-[#1548A8] to-[#1D4ED8] text-white px-4 sm:px-6 pt-5 pb-6 border-b border-blue-800 shadow-md relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
                <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-black text-[11px] uppercase tracking-wider mb-1">
                  <span>★ Elimika Game Arcade</span>
                  <span>•</span>
                  <span>{selectedLaunchClass}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Learning <span className="text-amber-300">Games</span>
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 font-medium">
                  Play. Learn. Improve. — Curriculum-aligned 3D &amp; STEM games for every topic.
                </p>
              </div>
            </div>

            {/* Score & XP Pill */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 flex items-center gap-2 text-xs font-black">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>{progress.totalXp} XP</span>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-950 text-xs font-black">
                {progress.adventuresCompleted.length + progress.roomsEscaped.length} Won
              </div>
            </div>
          </div>

          {/* Class, Subject & Topic Selector Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/20 text-xs">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-slate-900">
              <span className="font-bold text-slate-500 shrink-0">Class:</span>
              <select
                aria-label="Select Game Class"
                value={selectedLaunchClass}
                onChange={(e) => handleClassChangeInHub(e.target.value)}
                className="w-full bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer"
              >
                {PLAY_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-slate-900">
              <span className="font-bold text-slate-500 shrink-0">Subject:</span>
              <select
                aria-label="Select Game Subject"
                value={selectedLaunchSubject}
                onChange={(e) => handleSubjectChangeInHub(e.target.value)}
                className="w-full bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer truncate"
              >
                {availableSubjectsForClass.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-slate-900">
              <span className="font-bold text-slate-500 shrink-0">Topic:</span>
              <select
                aria-label="Select Game Topic"
                value={selectedLaunchTopic}
                onChange={(e) => setSelectedLaunchTopic(e.target.value)}
                className="w-full bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer truncate"
              >
                <option value="ALL">All Topics ({availableTopicsForSelection.length})</option>
                {availableTopicsForSelection.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* ==================== ELIMIKA BATTLE ==================== */}
        <section className="bg-gradient-to-r from-[#0A3D91] via-[#1548A8] to-[#1D4ED8] text-white rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-400/30">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Users className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Elimika Battle</h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Live classroom team battle for 2–6 teams with lucky boxes &amp; custom questions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openTeacherClassroomStudio('bank')}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Play Elimika Battle →</span>
          </button>
        </section>

        {/* 2x2 Vibrant Learning Games Grid (Matches Screen 8 in Both Design References) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* GAME 1: NECTA TREASURE HUNT (Royal Blue Card with Gold Trophy) */}
          <div className="bg-gradient-to-br from-[#0A3D91] to-[#2563EB] text-white rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between gap-4 border border-blue-400/30">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-300 font-black text-[11px]">
                  <Compass className="w-3.5 h-3.5" /> 3D Island Adventure
                </span>
                <h2 className="text-xl font-black tracking-tight">NECTA Treasure Hunt</h2>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Explore 6 connected 3D islands across Zanzibar, Kilimanjaro &amp; Serengeti. Unlock golden chests by solving {selectedLaunchClass} {selectedLaunchSubject} questions!
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs">
              <span className="text-blue-100 font-bold truncate">
                📍 {selectedLaunchTopic === 'ALL' ? 'All Chapters' : selectedLaunchTopic}
              </span>
              <button
                type="button"
                onClick={() => navigateToGame('treasure_hunt')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Crown className="w-4 h-4" />
                <span>Play 3D Hunt →</span>
              </button>
            </div>
          </div>

          {/* GAME 2: ESCAPE THE ROOM (Emerald Green Card with Wooden Door / Key) */}
          <div className="bg-gradient-to-br from-[#059669] to-[#16A34A] text-white rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between gap-4 border border-emerald-300/30">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-200 font-black text-[11px]">
                  <Key className="w-3.5 h-3.5" /> 3D Classroom Escape
                </span>
                <h2 className="text-xl font-black tracking-tight">Escape the Room</h2>
                <p className="text-xs text-emerald-50 leading-relaxed">
                  Walk around the 3D Science Lab &amp; Classroom. Crack Lock #1 to Lock #4 on your selected topic to open the exit door!
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-300 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Lock className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs">
              <span className="text-emerald-50 font-bold truncate">
                🔑 {selectedLaunchTopic === 'ALL' ? 'All Chapters' : selectedLaunchTopic}
              </span>
              <button
                type="button"
                onClick={() => navigateToGame('escape_classroom')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Key className="w-4 h-4" />
                <span>Play 3D Escape →</span>
              </button>
            </div>
          </div>

          {/* GAME 3: ELIMIKA GOLD BALL – THE ULTIMATE TRACKING CHALLENGE (Dark Teal & 24K Gold Card) */}
          <div className="bg-gradient-to-br from-[#032229] via-[#063842] to-[#0d5c63] text-white rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between gap-4 border border-teal-400/40">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-black text-[11px]">
                  <Eye className="w-3.5 h-3.5" /> 9 Viral Reel Modes • 3D Ball &amp; Die Tracking
                </span>
                <h2 className="text-xl font-black tracking-tight">Elimika Gold Ball</h2>
                <p className="text-xs text-teal-100 leading-relaxed">
                  Track the 24K Gold Ball or 3D Golden Die across 9 viral formations (8 Cups One Die, Mission Impossible, Figure-8 Infinity, Chaos Clover, 3×3 Insane, Brain Breaker, Orbit &amp; Split Brain) with wide cup gaps &amp; parallel lane passing!
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md border border-yellow-200">
                <Trophy className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs">
              <span className="text-teal-100 font-bold truncate">
                🏆 9 Reel Formations • 10 Levels • 4 Power-Ups
              </span>
              <button
                type="button"
                onClick={() => navigateToGame('gold_ball')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Play Gold Ball →</span>
              </button>
            </div>
          </div>

          {/* GAME 4: MATH CHALLENGE / ELIMIKA STEM ARENA (Golden Orange Card) */}
          <div className="bg-gradient-to-br from-[#EA580C] to-[#F59E0B] text-white rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between gap-4 border border-amber-300/30">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" /> 20 Arcade Waves
                </span>
                <h2 className="text-xl font-black tracking-tight">Math Challenge: STEM Arena</h2>
                <p className="text-xs text-amber-50 leading-relaxed">
                  Pilot the seeker orb across a 60fps physics arena and intercept the glowing orb carrying the right mathematical answer!
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center shrink-0 shadow-md font-black text-xl">
                +−×÷
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs">
              <span className="text-amber-50 font-bold truncate">
                ⚡ Fast Mental Math Reflexes
              </span>
              <button
                type="button"
                onClick={() => navigateToGame('stem_arena')}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Math Arena →</span>
              </button>
            </div>
          </div>

          {/* GAME 5: ELIMIKA TUG OF WAR (3D Team Blue vs Team Orange Sports Arena) */}
          <div className="sm:col-span-2 bg-gradient-to-r from-[#1D4ED8] via-[#0F172A] to-[#EA580C] text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-amber-400/50">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px]">
                <Users className="w-3.5 h-3.5" /> NEW · 3D Sports Arena · Team Blue vs Team Orange
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Elimika Tug of War
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Compete in Two-Team Classroom Mode, Player vs Smart AI, Quick Play, or Teacher Controlled Mode! Answer {selectedLaunchClass} {selectedLaunchSubject} questions (MCQ, True/False &amp; Numerical) to heave the 3D braided rope across the winning line.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigateToGame('tug_of_war')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Trophy className="w-4 h-4" />
                <span>Play 3D Tug of War →</span>
              </button>
            </div>
          </div>
        </section>

        {/* Earn Points & Achievements Callout Card (Matches Reference 2 Screen 4) */}
        <section className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Earn Points &amp; Achievements
              </h3>
              <p className="text-xs text-slate-600">
                Be the top learner! Complete 3D islands, escape rooms, and bridge challenges to unlock badges.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-slate-900 font-black">
              ⭐ {progress.totalXp} Points
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{progress.unlockedBadges.length} Badges</span>
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};
