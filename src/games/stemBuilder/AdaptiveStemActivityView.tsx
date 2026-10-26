import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Flame,
  Lightbulb,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import {
  CurriculumTopicRecord,
  ScoreBreakdownItem,
  StemDifficulty,
} from './stemBuilderTypes';
import {
  Lab3DSceneMode,
  LabSolveStepId,
  ScienceLab3DViewport,
} from './ScienceLab3DViewport';

interface AdaptiveStemActivityViewProps {
  topic: CurriculumTopicRecord;
  difficulty: StemDifficulty;
  defaultFullscreen?: boolean;
  onBackToMenu?: () => void;
  onCompleteActivity: (result: {
    passed: boolean;
    totalScore: number;
    stars: 0 | 1 | 2 | 3;
    breakdown: ScoreBreakdownItem[];
    feedbackSummary: string;
    workedSolution: string;
  }) => void;
}

export const AdaptiveStemActivityView: React.FC<AdaptiveStemActivityViewProps> = ({
  topic,
  difficulty,
  defaultFullscreen = true,
  onBackToMenu,
  onCompleteActivity,
}) => {
  const task = topic.interactiveTasks[difficulty];

  const [paramValue, setParamValue] = useState<number>(task.parameterDefault);
  const [numericInput, setNumericInput] = useState<string>('');
  const [selectedReflectionIdx, setSelectedReflectionIdx] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(defaultFullscreen);
  const [activeSolveModalStep, setActiveSolveModalStep] =
    useState<LabSolveStepId | null>(null);
  const [reactionActive, setReactionActive] = useState<boolean>(false);

  const [validationFeedback, setValidationFeedback] = useState<{
    checked: boolean;
    passed: boolean;
    totalScore: number;
    stars: 0 | 1 | 2 | 3;
    paramOk: boolean;
    numOk: boolean;
    refOk: boolean;
    message: string;
    breakdown: ScoreBreakdownItem[];
    workedSolution: string;
  } | null>(null);

  const targetParam = task.targetParameterValue ?? task.parameterDefault;
  const step1Complete = Math.abs(paramValue - targetParam) <= task.parameterStep * 1.1;

  const expectedNum = Number(task.expectedAnswer);
  const tolerance = task.numericTolerance ?? 0.2;
  const parsedUserNum = Number(numericInput.trim());
  const step2Complete =
    numericInput.trim().length > 0 &&
    !Number.isNaN(parsedUserNum) &&
    Math.abs(parsedUserNum - expectedNum) <= tolerance;

  const step3Complete = selectedReflectionIdx === task.correctReflectionIndex;

  // Generate helpful quick-choice numerical options around the expected answer so mobile users can either type OR tap to solve inside full screen
  const quickNumericChoices = useMemo(() => {
    if (Number.isNaN(expectedNum)) return [];
    const dec = Number.isInteger(expectedNum) ? 0 : 2;
    const fmt = (v: number) => Number(v.toFixed(dec));
    const delta = Math.max(1, Math.abs(expectedNum) * 0.25);
    const raw = [
      fmt(expectedNum),
      fmt(expectedNum + delta),
      fmt(Math.max(0, expectedNum - delta * 0.8)),
      fmt(expectedNum + delta * 1.8),
    ];
    const unique = Array.from(new Set(raw));
    return unique.sort((a, b) => a - b);
  }, [expectedNum]);

  const resetActivity = () => {
    setParamValue(task.parameterDefault);
    setNumericInput('');
    setSelectedReflectionIdx(null);
    setShowHint(false);
    setValidationFeedback(null);
    setReactionActive(false);
  };

  const handleOneTapSolveHelper = () => {
    setParamValue(targetParam);
    setNumericInput(String(task.expectedAnswer));
    setSelectedReflectionIdx(task.correctReflectionIndex);
    setReactionActive(true);
    window.setTimeout(() => setReactionActive(false), 3000);
  };

  const evaluateSubmission = () => {
    const paramOk = Math.abs(paramValue - targetParam) <= task.parameterStep * 1.1;
    const numOk =
      numericInput.trim().length > 0 &&
      !Number.isNaN(parsedUserNum) &&
      Math.abs(parsedUserNum - expectedNum) <= tolerance;
    const refOk = selectedReflectionIdx === task.correctReflectionIndex;

    const investigationScore = paramOk ? 40 : 24;
    const calculationScore = numOk ? 35 : 0;
    const reasoningScore = refOk ? 25 : 0;
    let totalScore = investigationScore + calculationScore + reasoningScore;

    const passed = numOk && refOk;
    if (!passed) {
      totalScore = Math.min(totalScore, 75);
    }

    const stars: 0 | 1 | 2 | 3 = !passed
      ? 0
      : totalScore >= 90
      ? 3
      : totalScore >= 75
      ? 2
      : 1;

    const breakdown: ScoreBreakdownItem[] = [
      {
        label: '3D Apparatus Calibration & Investigation',
        earned: investigationScore,
        max: 40,
        explanation: paramOk
          ? `3D Apparatus calibrated to ${paramValue} ${task.parameterUnit} (target ${targetParam} ${task.parameterUnit}).`
          : `Set to ${paramValue} ${task.parameterUnit}; optimal target was ${targetParam} ${task.parameterUnit}.`,
      },
      {
        label: 'Numerical Problem-Solving & Calculation',
        earned: calculationScore,
        max: 35,
        explanation: numOk
          ? `Correct numerical solution (${numericInput.trim()} ${task.answerUnit || ''}).`
          : `Expected ${task.expectedAnswer} ${task.answerUnit || ''}.`,
      },
      {
        label: 'Scientific Reasoning & Conclusion',
        earned: reasoningScore,
        max: 25,
        explanation: refOk
          ? 'Correct scientific principle & inference selected.'
          : 'Review the conceptual explanation in the worked solution.',
      },
    ];

    const workedSolutionText = `${task.workedSolution}\n\n${topic.workedSolutions.join('\n')}`;

    setReactionActive(true);
    setValidationFeedback({
      checked: true,
      passed,
      totalScore,
      stars,
      paramOk,
      numOk,
      refOk,
      message: passed
        ? `WOYOOO! 3D Lab Investigation Mastered! Score: ${totalScore}/100.`
        : 'Some steps need revision — check the instant feedback or use the 1-Tap Lab Helper!',
      breakdown,
      workedSolution: workedSolutionText,
    });

    onCompleteActivity({
      passed,
      totalScore,
      stars,
      breakdown,
      feedbackSummary: passed
        ? `Completed ${topic.topic} (${difficulty}) with ${totalScore}/100!`
        : `Attempt recorded (${totalScore}/100). Review the worked solution and retry to master all objectives.`,
      workedSolution: workedSolutionText,
    });
  };

  const sceneMode: Lab3DSceneMode = (task.diagramType as Lab3DSceneMode) || 'titration';

  return (
    <div className="space-y-5">
      {/* 3D Interactive & Animated Viewport (Supports Full-Screen + Full-Screen Solving Inside Full-Screen) */}
      <ScienceLab3DViewport
        sceneMode={sceneMode}
        title={`${topic.topic} — ${task.title}`}
        subtitle={`${topic.subject} • Form ${topic.formLevel} • ${difficulty} (${topic.swahiliTerm})`}
        parameterLabel={task.interactiveParameterLabel}
        parameterValue={paramValue}
        parameterMin={task.parameterMin}
        parameterMax={task.parameterMax}
        parameterStep={task.parameterStep}
        parameterUnit={task.parameterUnit}
        targetParameterValue={targetParam}
        isReactionActive={reactionActive}
        step1Complete={step1Complete}
        step2Complete={step2Complete}
        step3Complete={step3Complete}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
        onParameterChange={(val) => setParamValue(val)}
        onSelectSolveStep={(step) => setActiveSolveModalStep(step)}
        onTriggerReaction={() => {
          setReactionActive(true);
          window.setTimeout(() => setReactionActive(false), 3000);
        }}
        onResetLab={resetActivity}
      >
        {/* Top-Left Back to Menu & Open Full-Screen Solver Button Inside 3D Canvas */}
        <div className="pointer-events-auto absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2">
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-black flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Lab</span>
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setActiveSolveModalStep((prev) => (prev ? null : 'investigate'))
            }
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {activeSolveModalStep
                ? 'Hide Solving Workbench (View Full 3D Lab)'
                : 'Open Full-Screen Problem Solver'}
            </span>
          </button>
        </div>

        {/* ================================================================== */}
        {/* FULL-SCREEN INTERACTIVE PROBLEM SOLVING MODAL INSIDE FULL-SCREEN   */}
        {/* ================================================================== */}
        {activeSolveModalStep && (
          <div className="pointer-events-auto absolute inset-0 z-[150] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <div className="w-full max-w-lg max-h-[88vh] bg-slate-950 border-2 border-cyan-500/60 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
              <div className="space-y-4">
              {/* Solver Header & Step Tabs */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Full-Screen 3D Lab Problem Solver
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {task.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSolveModalStep(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Minimize Solver to Inspect Full 3D Scene"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Interactive Step Switcher Pills */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-[11px] font-black">
                <button
                  type="button"
                  onClick={() => setActiveSolveModalStep('investigate')}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeSolveModalStep === 'investigate'
                      ? 'bg-sky-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {step1Complete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>1. 3D Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSolveModalStep('calculate')}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeSolveModalStep === 'calculate'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {step2Complete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>2. Calculate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSolveModalStep('conclude')}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    activeSolveModalStep === 'conclude'
                      ? 'bg-emerald-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {step3Complete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                  <span>3. Conclude</span>
                </button>
              </div>

              {/* Scenario Brief */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {task.scenario}
              </div>

              {/* STEP 1 PANEL: 3D APPARATUS CALIBRATION */}
              {activeSolveModalStep === 'investigate' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-sky-300">
                      Step 1: Calibrate 3D Apparatus (40 pts)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        step1Complete
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {step1Complete ? '✓ Target Reached!' : `Target: ${targetParam} ${task.parameterUnit}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-semibold">
                    {task.investigationPrompt}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{task.interactiveParameterLabel}:</span>
                      <span className="text-amber-300 font-black">
                        {paramValue} {task.parameterUnit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={task.parameterMin}
                      max={task.parameterMax}
                      step={task.parameterStep}
                      value={paramValue}
                      onChange={(e) => setParamValue(Number(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setParamValue(targetParam);
                        setReactionActive(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 text-xs font-black cursor-pointer"
                    >
                      ⚡ Snap to Target ({targetParam} {task.parameterUnit})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSolveModalStep('calculate')}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                    >
                      Next: Step 2 Calculation →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 PANEL: NUMERICAL CALCULATION SOLVER */}
              {activeSolveModalStep === 'calculate' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-amber-300">
                      Step 2: Numerical Calculation (35 pts)
                    </span>
                    {step2Complete && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                        ✓ Correct Answer!
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-white font-bold leading-relaxed">
                    {task.numericalQuestion}
                  </p>

                  {/* Quick-Tap Answer Pills for Fast Touch Solving Inside Fullscreen */}
                  {quickNumericChoices.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold">
                        Tap a calculated value or type below:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {quickNumericChoices.map((val) => {
                          const isChosen =
                            numericInput.trim() !== '' &&
                            Math.abs(Number(numericInput) - val) < 0.001;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNumericInput(String(val))}
                              className={`py-2 px-3 rounded-xl border text-xs font-black font-mono cursor-pointer transition-all ${
                                isChosen
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                                  : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-700'
                              }`}
                            >
                              {val} {task.answerUnit || ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      value={numericInput}
                      onChange={(e) => setNumericInput(e.target.value)}
                      placeholder={`Type answer (${task.answerUnit || 'value'})`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-black focus:outline-none focus:border-amber-400 tabular-nums"
                    />
                    {task.answerUnit && (
                      <span className="text-xs font-bold text-slate-400">
                        {task.answerUnit}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowHint((p) => !p)}
                      className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Formula Hint' : 'Show Formula Hint'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSolveModalStep('conclude')}
                      className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black cursor-pointer"
                    >
                      Next: Step 3 Conclusion →
                    </button>
                  </div>

                  {showHint && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                      <strong>Formula Hint:</strong> {task.hint}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 PANEL: SCIENTIFIC REASONING & CONCLUSION */}
              {activeSolveModalStep === 'conclude' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-emerald-300">
                      Step 3: Scientific Conclusion (25 pts)
                    </span>
                    {step3Complete && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                        ✓ Principle Verified!
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-white font-bold leading-relaxed">
                    {task.reflectionQuestion}
                  </p>

                  <div className="space-y-2">
                    {task.reflectionOptions.map((opt, idx) => {
                      const isSelected = selectedReflectionIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedReflectionIdx(idx)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/25 border-emerald-400 text-white shadow'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Instant Validation Result & Worked Solution Inside Full-Screen Solver */}
              {validationFeedback && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    validationFeedback.passed
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
                      : 'bg-amber-950/80 border-amber-400 text-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{validationFeedback.message}</span>
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= validationFeedback.stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 leading-relaxed">
                    <div className="font-bold text-amber-300 mb-1">
                      Step-by-Step Worked Solution:
                    </div>
                    {validationFeedback.workedSolution}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Solver Action Buttons */}
            <div className="pt-4 mt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleOneTapSolveHelper}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                title="Auto-calibrate 3D apparatus and fill solution steps"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Tap Lab Guide</span>
              </button>

              <button
                type="button"
                onClick={evaluateSubmission}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Submit &amp; Run 3D Reaction</span>
              </button>
            </div>
            </div>
          </div>
        )}
      </ScienceLab3DViewport>
    </div>
  );
};
