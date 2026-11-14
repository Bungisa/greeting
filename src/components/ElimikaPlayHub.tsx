import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Compass,
  Crown,
  Gamepad2,
  Key,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Wrench,
} from 'lucide-react';
import { StemArenaGame } from './StemArenaGame';
import { TreasureHuntGame } from './games/TreasureHuntGame';
import { EscapeClassroomGame } from '../games/EscapeClassroomGame';
import {
  ElimikaPlayProgress,
  getAvailableSubjectsForClass,
  getAvailableTopicsForClassSubject,
  getQuestionsForTreasureHunt,
  loadPlayProgress,
  PLAY_CLASSES,
  savePlayProgress,
} from '../games/gameDataAndStorage';
import { MathText } from '../utils/mathRenderer';

import { PaperRecord, TIE_CURRICULUM_SUBJECTS } from '../data/curriculumData';

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
  const [progress, setProgress] = useState<ElimikaPlayProgress>(() => loadPlayProgress());
  const [selectedLaunchClass, setSelectedLaunchClass] = useState<string>(initialClass || 'Form 4');
  const [selectedLaunchSubject, setSelectedLaunchSubject] = useState<string>(
    initialSubject || 'Basic Mathematics'
  );
  const [selectedLaunchTopic, setSelectedLaunchTopic] = useState<string>(initialTopic || 'ALL');

  // Interactive STEM Builder: Build the Bridge State (Screen 9 from Design Reference)
  const [bridgeLevel, setBridgeLevel] = useState<number>(1);
  const [bridgeScore, setBridgeScore] = useState<number>(120);
  const [bridgeSegmentsBuilt, setBridgeSegmentsBuilt] = useState<number>(0);
  const [bridgeMaterial, setBridgeMaterial] = useState<'steel' | 'timber' | 'cable'>('steel');
  const [bridgeQuestionIdx, setBridgeQuestionIdx] = useState<number>(0);
  const [bridgeSelectedOpt, setBridgeSelectedOpt] = useState<number | null>(null);
  const [bridgeFeedback, setBridgeFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [bridgeVehicleCrossing, setBridgeVehicleCrossing] = useState<boolean>(false);
  const [bridgePaused, setBridgePaused] = useState<boolean>(false);

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

  const bridgeQuestions = useMemo(() => {
    return getQuestionsForTreasureHunt(
      selectedLaunchSubject,
      selectedLaunchClass,
      'Medium',
      selectedLaunchTopic,
      'ALL',
      allPapers
    );
  }, [selectedLaunchClass, selectedLaunchSubject, selectedLaunchTopic, allPapers, bridgeLevel]);

  const currentBridgeQuestion = bridgeQuestions[bridgeQuestionIdx % Math.max(1, bridgeQuestions.length)];

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
    if (typeof window !== 'undefined') {
      const hashMap: Record<PlayGameRoute, string> = {
        hub: '#play',
        stem_builder: '#stem-builder',
        treasure_hunt: '#treasure-hunt',
        treasure_hunt_live: '#treasure-hunt-live',
        escape_classroom: '#escape-classroom',
        stem_arena: '#stem-arena',
      };
      window.history.replaceState(null, '', hashMap[route]);
    }
  };

  const handleAnswerBridgeQuestion = (optIndex: number) => {
    if (!currentBridgeQuestion || bridgeSelectedOpt !== null) return;
    setBridgeSelectedOpt(optIndex);
    const isCorrect = optIndex === currentBridgeQuestion.correctIndex;
    if (isCorrect) {
      const nextSegs = Math.min(4, bridgeSegmentsBuilt + 1);
      setBridgeSegmentsBuilt(nextSegs);
      setBridgeScore((s) => s + 40);
      setBridgeFeedback({
        correct: true,
        message:
          nextSegs === 4
            ? '🌉 All 4 Truss Spans Complete! Testing heavy truck crossing!'
            : `✅ Span #${nextSegs} Reinforced! (${nextSegs}/4 spans built)`,
      });
      if (nextSegs === 4) {
        setBridgeVehicleCrossing(true);
        const currentProg = loadPlayProgress();
        const advId = `bridge_lvl_${bridgeLevel}`;
        const badgeName = 'STEM Bridge Engineer';
        const updated = savePlayProgress({
          ...currentProg,
          totalXp: currentProg.totalXp + 80,
          adventuresCompleted: currentProg.adventuresCompleted.includes(advId)
            ? currentProg.adventuresCompleted
            : [...currentProg.adventuresCompleted, advId],
          unlockedBadges: currentProg.unlockedBadges.includes(badgeName)
            ? currentProg.unlockedBadges
            : [...currentProg.unlockedBadges, badgeName],
        });
        setProgress(updated);
      }
    } else {
      setBridgeFeedback({
        correct: false,
        message: `⚠️ Structural calculation off! Review the correct answer below and reinforce the next span.`,
      });
    }
  };

  const handleNextBridgeStep = () => {
    setBridgeSelectedOpt(null);
    setBridgeFeedback(null);
    if (bridgeSegmentsBuilt >= 4) {
      setBridgeLevel((lvl) => (lvl < 5 ? lvl + 1 : 1));
      setBridgeSegmentsBuilt(0);
      setBridgeVehicleCrossing(false);
    }
    setBridgeQuestionIdx((idx) => idx + 1);
  };

  if (activeRoute === 'stem_arena') {
    return <StemArenaGame onExitGame={() => navigateToGame('hub')} />;
  }

  if (activeRoute === 'treasure_hunt' || activeRoute === 'treasure_hunt_live') {
    return (
      <TreasureHuntGame
        initialClass={selectedLaunchClass}
        initialSubject={selectedLaunchSubject}
        initialTopic={selectedLaunchTopic}
        allPapers={allPapers}
        onExitToHub={() => navigateToGame('hub')}
        onProgressUpdate={(p) => setProgress(p)}
      />
    );
  }

  if (activeRoute === 'escape_classroom') {
    return (
      <div className="pb-16 lg:pb-0">
        <EscapeClassroomGame
          initialClass={selectedLaunchClass}
          initialSubject={selectedLaunchSubject}
          initialTopic={selectedLaunchTopic}
          allPapers={allPapers}
          onExitToHub={() => navigateToGame('hub')}
          onProgressUpdate={(p) => setProgress(p)}
        />
      </div>
    );
  }

  // ==================== SCREEN 9: STEM BUILDER: BUILD THE BRIDGE ====================
  if (activeRoute === 'stem_builder') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A3D91] via-[#1E5BB8] to-[#E2F1FF] text-slate-900 flex flex-col pb-24">
        {/* Top Game HUD Bar (Matches Screen 9: Score: 120 | Level 1/5 | Pause/Back) */}
        <div className="bg-[#0A3D91] text-white px-4 py-3 border-b border-white/15 shadow-md">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigateToGame('hub')}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs cursor-pointer"
              >
                ← Games Hub
              </button>
              <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full font-black text-xs sm:text-sm shadow-xs tabular-nums">
                <Star className="w-4 h-4 fill-slate-950" />
                <span>Score: {bridgeScore}</span>
              </div>
            </div>

            {/* Live Class / Subject / Topic Switcher inside STEM Builder */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <select
                aria-label="Bridge Game Class"
                value={selectedLaunchClass}
                onChange={(e) => handleClassChangeInHub(e.target.value)}
                className="bg-white/15 text-white font-bold rounded-lg px-2 py-1 border border-white/25 focus:outline-none cursor-pointer"
              >
                {PLAY_CLASSES.map((cls) => (
                  <option key={cls} value={cls} className="bg-slate-900 text-white">
                    {cls}
                  </option>
                ))}
              </select>
              <select
                aria-label="Bridge Game Subject"
                value={selectedLaunchSubject}
                onChange={(e) => handleSubjectChangeInHub(e.target.value)}
                className="bg-white/15 text-amber-300 font-bold rounded-lg px-2 py-1 border border-white/25 focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {availableSubjectsForClass.map((sub) => (
                  <option key={sub} value={sub} className="bg-slate-900 text-white">
                    {sub}
                  </option>
                ))}
              </select>
              <select
                aria-label="Bridge Game Topic"
                value={selectedLaunchTopic}
                onChange={(e) => setSelectedLaunchTopic(e.target.value)}
                className="bg-white/15 text-emerald-200 font-bold rounded-lg px-2 py-1 border border-white/25 focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  All Topics
                </option>
                {availableTopicsForSelection.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-white tabular-nums">
                Level {bridgeLevel}/5
              </span>
              <button
                type="button"
                onClick={() => setBridgePaused((p) => !p)}
                className="w-9 h-9 rounded-full bg-sky-400/30 hover:bg-sky-400/50 border border-white/40 flex items-center justify-center text-white cursor-pointer"
                title={bridgePaused ? 'Resume Game' : 'Pause Game'}
              >
                {bridgePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl w-full mx-auto px-4 py-5 space-y-5 flex-1">
          {/* Floating Banner: "Build a strong bridge!" (Matches Screen 9) */}
          <div className="text-center">
            <div className="inline-block px-6 py-2.5 rounded-2xl bg-white/95 text-[#0A3D91] font-black text-lg sm:text-2xl shadow-lg border-2 border-sky-200">
              Build a strong bridge!
            </div>
          </div>

          {/* Interactive Bridge Engineering Stage (SVG Physics & Truss Visualizer) */}
          <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-xl overflow-hidden">
            <div className="relative bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 p-3 sm:p-5">
              <svg
                viewBox="0 0 800 310"
                className="w-full h-56 sm:h-72 rounded-2xl shadow-inner border border-sky-300/60 bg-gradient-to-b from-sky-300 via-sky-100 to-sky-200"
              >
                {/* Sun & Clouds */}
                <circle cx="690" cy="52" r="28" fill="#FACC15" opacity="0.9" />
                <g fill="#FFFFFF" opacity="0.85">
                  <ellipse cx="160" cy="55" rx="45" ry="16" />
                  <ellipse cx="185" cy="48" rx="35" ry="18" />
                  <ellipse cx="430" cy="42" rx="50" ry="15" />
                </g>

                {/* Distant Hills */}
                <path
                  d="M0,190 Q140,120 290,185 T590,175 T800,190 L800,310 L0,310 Z"
                  fill="#86EFAC"
                  opacity="0.65"
                />

                {/* Flowing River Canyon */}
                <rect x="130" y="220" width="540" height="90" fill="#0284C7" />
                <path
                  d="M140,245 Q220,235 300,245 T460,245 T640,245"
                  stroke="#7DD3FC"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M160,275 Q260,265 360,275 T560,275"
                  stroke="#BAE6FD"
                  strokeWidth="3"
                  fill="none"
                />

                {/* Left & Right Stone Canyon Cliffs & Masonry Piers */}
                <path d="M0,165 L145,165 L170,310 L0,310 Z" fill="#475569" />
                <path d="M0,165 L145,165 L145,182 L0,182 Z" fill="#16A34A" />
                <path d="M655,165 L800,165 L800,310 L630,310 Z" fill="#475569" />
                <path d="M655,165 L800,165 L800,182 L655,182 Z" fill="#16A34A" />

                {/* Stone Support Pillars in River */}
                <rect x="132" y="165" width="28" height="145" rx="4" fill="#64748B" stroke="#334155" strokeWidth="2" />
                <rect x="386" y="170" width="28" height="140" rx="4" fill="#64748B" stroke="#334155" strokeWidth="2" />
                <rect x="640" y="165" width="28" height="145" rx="4" fill="#64748B" stroke="#334155" strokeWidth="2" />

                {/* 4 Bridge Truss Spans (Built progressively as student solves questions) */}
                {[0, 1, 2, 3].map((spanIdx) => {
                  const xStart = 150 + spanIdx * 125;
                  const isBuilt = spanIdx < bridgeSegmentsBuilt;
                  const beamColor =
                    bridgeMaterial === 'steel'
                      ? '#D97706'
                      : bridgeMaterial === 'timber'
                      ? '#92400E'
                      : '#2563EB';
                  const glowColor = isBuilt ? '#FACC15' : '#94A3B8';

                  return (
                    <g key={spanIdx} opacity={isBuilt ? 1 : 0.28}>
                      {/* Lower Deck */}
                      <rect
                        x={xStart}
                        y={166}
                        width={125}
                        height={10}
                        fill={isBuilt ? beamColor : '#64748B'}
                        stroke="#1E293B"
                        strokeWidth="2"
                      />
                      {/* Top Chord */}
                      <line
                        x1={xStart + 10}
                        y1={105}
                        x2={xStart + 115}
                        y2={105}
                        stroke={isBuilt ? beamColor : '#94A3B8'}
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                      {/* Left & Right Diagonal Truss Struts */}
                      <line
                        x1={xStart}
                        y1={168}
                        x2={xStart + 35}
                        y2={105}
                        stroke={isBuilt ? beamColor : '#94A3B8'}
                        strokeWidth="6"
                      />
                      <line
                        x1={xStart + 35}
                        y1={105}
                        x2={xStart + 62}
                        y2={168}
                        stroke={isBuilt ? beamColor : '#94A3B8'}
                        strokeWidth="5"
                      />
                      <line
                        x1={xStart + 62}
                        y1={168}
                        x2={xStart + 90}
                        y2={105}
                        stroke={isBuilt ? beamColor : '#94A3B8'}
                        strokeWidth="5"
                      />
                      <line
                        x1={xStart + 90}
                        y1={105}
                        x2={xStart + 125}
                        y2={168}
                        stroke={isBuilt ? beamColor : '#94A3B8'}
                        strokeWidth="6"
                      />
                      {/* Node Bolts */}
                      <circle cx={xStart + 35} cy={105} r="5" fill={glowColor} stroke="#0F172A" strokeWidth="1.5" />
                      <circle cx={xStart + 90} cy={105} r="5" fill={glowColor} stroke="#0F172A" strokeWidth="1.5" />
                      <circle cx={xStart + 62} cy={168} r="5" fill={glowColor} stroke="#0F172A" strokeWidth="1.5" />
                      {/* Span Label */}
                      <text
                        x={xStart + 62}
                        y={194}
                        textAnchor="middle"
                        fill={isBuilt ? '#FFFFFF' : '#E2E8F0'}
                        fontSize="11"
                        fontWeight="900"
                      >
                        {isBuilt ? `SPAN ${spanIdx + 1} ✓` : `SPAN ${spanIdx + 1}`}
                      </text>
                    </g>
                  );
                })}

                {/* Engineer Avatar on Left Cliff (Matches Screen 9 Engineer with Yellow Hardhat) */}
                <g transform="translate(52, 112)">
                  {/* Hardhat */}
                  <path d="M10,12 Q24,-4 38,12 Z" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                  {/* Head */}
                  <circle cx="24" cy="20" r="10" fill="#8D5524" />
                  {/* Safety Vest Torso */}
                  <rect x="13" y="30" width="22" height="24" rx="5" fill="#F97316" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="18" y1="30" x2="18" y2="54" stroke="#FACC15" strokeWidth="3" />
                  <line x1="30" y1="30" x2="30" y2="54" stroke="#FACC15" strokeWidth="3" />
                </g>

                {/* Heavy Cargo Truck Crossing When Bridge is Complete */}
                {bridgeVehicleCrossing && (
                  <g transform="translate(350, 132)">
                    <rect x="0" y="4" width="66" height="26" rx="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    <rect x="66" y="10" width="24" height="20" rx="4" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                    <circle cx="18" cy="32" r="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
                    <circle cx="52" cy="32" r="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
                    <circle cx="78" cy="32" r="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
                    <text x="33" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">
                      ELIMIKA
                    </text>
                  </g>
                )}
              </svg>

              {/* Bottom Overlay Bar inside Stage: "Use the given materials to build the bridge." */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-[#0A3D91] text-white px-4 py-2.5 rounded-2xl shadow-md">
                <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    Use the given materials to build the bridge ({bridgeSegmentsBuilt}/4 Truss Spans Built)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {(['steel', 'timber', 'cable'] as const).map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setBridgeMaterial(mat)}
                      className={`px-2.5 py-1 rounded-lg font-black uppercase cursor-pointer transition-colors ${
                        bridgeMaterial === mat
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      }`}
                    >
                      {mat === 'steel' ? '🔩 Steel Truss' : mat === 'timber' ? '🪵 Timber' : '⛓️ Suspension'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setBridgeSegmentsBuilt(0);
                      setBridgeVehicleCrossing(false);
                      setBridgeSelectedOpt(null);
                      setBridgeFeedback(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                    title="Reset Bridge"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Curriculum Question Challenge Deck to Construct Each Bridge Span */}
            {currentBridgeQuestion && (
              <div className="p-4 sm:p-6 bg-white border-t border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0A3D91] font-black">
                    Span #{Math.min(4, bridgeSegmentsBuilt + 1)} Engineering Calculation · {selectedLaunchClass} · {selectedLaunchSubject}
                  </span>
                  <span className="font-bold text-slate-500">
                    Topic: {currentBridgeQuestion.topic}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-sm sm:text-base text-slate-900">
                  <MathText as="div" text={currentBridgeQuestion.question} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentBridgeQuestion.options.map((opt: string, i: number) => {
                    const isPicked = bridgeSelectedOpt === i;
                    const isRight = i === currentBridgeQuestion.correctIndex;
                    let btnCls =
                      'bg-white hover:bg-blue-50 border-slate-200 text-slate-800';
                    if (bridgeSelectedOpt !== null) {
                      if (isRight) {
                        btnCls = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
                      } else if (isPicked) {
                        btnCls = 'bg-rose-50 border-rose-400 text-rose-900';
                      }
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={bridgeSelectedOpt !== null}
                        onClick={() => handleAnswerBridgeQuestion(i)}
                        className={`p-3 rounded-xl border text-left font-bold text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer transition-all ${btnCls}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-[#0A3D91] text-white font-black text-xs flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">
                          <MathText text={opt} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {bridgeFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      bridgeFeedback.correct
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-black">{bridgeFeedback.message}</div>
                      <div className="text-xs opacity-90">
                        <MathText text={currentBridgeQuestion.explanation} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextBridgeStep}
                      className="px-4 py-2 rounded-xl bg-[#0A3D91] hover:bg-blue-800 text-white font-black text-xs whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {bridgeSegmentsBuilt >= 4 ? 'Next Bridge Level →' : 'Build Next Span →'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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

          {/* GAME 3: STEM BUILDER: BUILD THE BRIDGE (Purple Card — Matches Screen 8 & Screen 9) */}
          <div className="bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] text-white rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between gap-4 border border-purple-300/30">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-300 font-black text-[11px]">
                  <Wrench className="w-3.5 h-3.5" /> Engineering Simulation
                </span>
                <h2 className="text-xl font-black tracking-tight">STEM Builder: Build the Bridge</h2>
                <p className="text-xs text-purple-100 leading-relaxed">
                  Construct a 4-span truss bridge across the river canyon by solving {selectedLaunchClass} {selectedLaunchSubject} calculations and test heavy cargo loads!
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Wrench className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs">
              <span className="text-purple-100 font-bold truncate">
                🌉 5 Levels • Truss Physics
              </span>
              <button
                type="button"
                onClick={() => navigateToGame('stem_builder')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                <span>Build Bridge →</span>
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
