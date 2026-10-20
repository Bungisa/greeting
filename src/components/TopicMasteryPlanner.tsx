import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  TIE_CURRICULUM_SUBJECTS,
  getSyllabusTopicsForClassSubject,
  getSubTopicsForMainTopic,
} from '../data/curriculumData';

export interface QuizHistoryEntry {
  id: string;
  cls: string;
  subject: string;
  topic: string;
  score: number;
  total: number;
  date: string;
}

export interface TopicMasteryPlannerProps {
  activeClass: string;
  activeSubject: string;
  quizHistory: QuizHistoryEntry[];
  onLaunchTopicQuiz: (cls: string, subject: string, topic: string) => void;
  onOpenTopicNotes?: (cls: string, subject: string, topic: string) => void;
  onLogManualPractice?: (cls: string, subject: string, topic: string, scoreOutOf20: number) => void;
}

type MasteryTier = 'mastered' | 'developing' | 'needs_revision' | 'unattempted';
type FilterMode = 'ALL' | MasteryTier;
type PlanHorizon = 7 | 14 | 30;

interface TopicMasteryStat {
  rawTopic: string;
  cleanTopic: string;
  topicCode: string;
  subTopics: string[];
  attempts: number;
  bestScoreOutOf20: number;
  avgAccuracyPct: number;
  lastPracticed: string | null;
  tier: MasteryTier;
}

interface ScheduledRevisionDay {
  dayNumber: number;
  dateLabel: string;
  subject: string;
  topic: string;
  subTopicFocus: string;
  priorityReason: string;
  tier: MasteryTier;
  targetAccuracyPct: number;
}

const COMPLETED_DAYS_STORAGE_KEY = 'elimika_revision_plan_completed_days_v1';
const EXAM_DATE_STORAGE_KEY = 'elimika_target_exam_date_v1';

export const TopicMasteryPlanner: React.FC<TopicMasteryPlannerProps> = ({
  activeClass,
  activeSubject,
  quizHistory,
  onLaunchTopicQuiz,
  onOpenTopicNotes,
  onLogManualPractice,
}) => {
  const allClasses = useMemo(() => Object.keys(TIE_CURRICULUM_SUBJECTS), []);
  const [selectedClass, setSelectedClass] = useState<string>(
    allClasses.includes(activeClass) ? activeClass : 'Form 4'
  );
  const subjectsForClass = useMemo(
    () => TIE_CURRICULUM_SUBJECTS[selectedClass] || ['Basic Mathematics'],
    [selectedClass]
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjectsForClass.includes(activeSubject) ? activeSubject : subjectsForClass[0]
  );

  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [planHorizon, setPlanHorizon] = useState<PlanHorizon>(7);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'timetable'>('heatmap');
  const [manualScoreTopic, setManualScoreTopic] = useState<string | null>(null);
  const [manualScoreValue, setManualScoreValue] = useState<number>(16);

  const [targetExamDate, setTargetExamDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(EXAM_DATE_STORAGE_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [completedDayKeys, setCompletedDayKeys] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_DAYS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {};
  });

  useEffect(() => {
    if (allClasses.includes(activeClass)) {
      setSelectedClass(activeClass);
    }
  }, [activeClass, allClasses]);

  useEffect(() => {
    const subs = TIE_CURRICULUM_SUBJECTS[selectedClass] || ['Basic Mathematics'];
    if (!subs.includes(selectedSubject)) {
      setSelectedSubject(subs[0]);
    }
  }, [selectedClass, selectedSubject]);

  const handleSaveExamDate = (val: string) => {
    setTargetExamDate(val);
    try {
      localStorage.setItem(EXAM_DATE_STORAGE_KEY, val);
    } catch {
      // ignore
    }
  };

  const toggleDayCompleted = (dayKey: string) => {
    setCompletedDayKeys((prev) => {
      const next = { ...prev, [dayKey]: !prev[dayKey] };
      try {
        localStorage.setItem(COMPLETED_DAYS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Compute Topic Mastery Heatmap Stats for Selected Class & Subject
  const topicMasteryStats: TopicMasteryStat[] = useMemo(() => {
    const rawTopics = getSyllabusTopicsForClassSubject(selectedClass, selectedSubject);
    return rawTopics.map((rawT, idx) => {
      const codeMatch = rawT.match(/^(\d+\.\d+)/);
      const topicCode = codeMatch ? codeMatch[1] : `${idx + 1}.0`;
      const cleanTopic = rawT.replace(/^\d+\.\d+\s*/, '').trim();
      const subTopics = getSubTopicsForMainTopic(selectedSubject, cleanTopic);

      const matchingRecords = quizHistory.filter((q) => {
        const sameClass = q.cls.toLowerCase() === selectedClass.toLowerCase();
        const sameSub =
          q.subject.toLowerCase().includes(selectedSubject.toLowerCase()) ||
          selectedSubject.toLowerCase().includes(q.subject.toLowerCase());
        const qTopicClean = q.topic.replace(/^\d+\.\d+\s*/, '').trim().toLowerCase();
        const cleanLower = cleanTopic.toLowerCase();
        const sameTopic =
          qTopicClean.includes(cleanLower) ||
          cleanLower.includes(qTopicClean) ||
          (q.topic === 'ALL' && idx === 0);
        return sameClass && sameSub && sameTopic;
      });

      if (matchingRecords.length === 0) {
        return {
          rawTopic: rawT,
          cleanTopic,
          topicCode,
          subTopics,
          attempts: 0,
          bestScoreOutOf20: 0,
          avgAccuracyPct: 0,
          lastPracticed: null,
          tier: 'unattempted',
        };
      }

      const accuracies = matchingRecords.map((r) =>
        Math.round((r.score / Math.max(1, r.total)) * 100)
      );
      const avgAccuracyPct = Math.round(
        accuracies.reduce((acc, v) => acc + v, 0) / accuracies.length
      );
      const bestAccuracy = Math.max(...accuracies);
      const bestScoreOutOf20 = Math.round((bestAccuracy / 100) * 20);
      const lastPracticed = matchingRecords[0]?.date || null;

      let tier: MasteryTier = 'needs_revision';
      if (avgAccuracyPct >= 75) tier = 'mastered';
      else if (avgAccuracyPct >= 50) tier = 'developing';

      return {
        rawTopic: rawT,
        cleanTopic,
        topicCode,
        subTopics,
        attempts: matchingRecords.length,
        bestScoreOutOf20,
        avgAccuracyPct,
        lastPracticed,
        tier,
      };
    });
  }, [selectedClass, selectedSubject, quizHistory]);

  const filteredTopics = useMemo(() => {
    if (filterMode === 'ALL') return topicMasteryStats;
    return topicMasteryStats.filter((t) => t.tier === filterMode);
  }, [topicMasteryStats, filterMode]);

  // Summary counts for current subject
  const summaryCounts = useMemo(() => {
    const mastered = topicMasteryStats.filter((t) => t.tier === 'mastered').length;
    const developing = topicMasteryStats.filter((t) => t.tier === 'developing').length;
    const needsRevision = topicMasteryStats.filter((t) => t.tier === 'needs_revision').length;
    const unattempted = topicMasteryStats.filter((t) => t.tier === 'unattempted').length;
    const practiced = topicMasteryStats.filter((t) => t.attempts > 0);
    const overallReadiness =
      practiced.length > 0
        ? Math.round(
            practiced.reduce((acc, t) => acc + t.avgAccuracyPct, 0) /
              Math.max(1, topicMasteryStats.length)
          )
        : 0;
    return {
      total: topicMasteryStats.length,
      mastered,
      developing,
      needsRevision,
      unattempted,
      overallReadiness,
    };
  }, [topicMasteryStats]);

  // Build Smart Weak-Topic Revision Timetable across Class Subjects
  const scheduledDays: ScheduledRevisionDay[] = useMemo(() => {
    const allCandidateTopics: Array<{
      subject: string;
      cleanTopic: string;
      subTopicFocus: string;
      tier: MasteryTier;
      avgAccuracyPct: number;
      priorityScore: number;
      priorityReason: string;
    }> = [];

    // Prioritize current selectedSubject first, plus core subjects of selectedClass
    const orderedSubjects = [
      selectedSubject,
      ...subjectsForClass.filter((s) => s !== selectedSubject).slice(0, 5),
    ];

    orderedSubjects.forEach((subj, sIdx) => {
      const rawTopics = getSyllabusTopicsForClassSubject(selectedClass, subj);
      rawTopics.forEach((rawT, tIdx) => {
        const cleanTopic = rawT.replace(/^\d+\.\d+\s*/, '').trim();
        const subTopics = getSubTopicsForMainTopic(subj, cleanTopic);
        const subTopicFocus = subTopics[0] || cleanTopic;

        const matching = quizHistory.filter(
          (q) =>
            q.cls.toLowerCase() === selectedClass.toLowerCase() &&
            q.subject.toLowerCase() === subj.toLowerCase() &&
            q.topic.toLowerCase().includes(cleanTopic.toLowerCase())
        );

        let tier: MasteryTier = 'unattempted';
        let avgAccuracyPct = 0;
        let priorityScore = 70 - sIdx * 3 - tIdx;
        let priorityReason = 'Unattempted Core Syllabus Competence — Build Foundation';

        if (matching.length > 0) {
          const accs = matching.map((r) => Math.round((r.score / Math.max(1, r.total)) * 100));
          avgAccuracyPct = Math.round(accs.reduce((a, b) => a + b, 0) / accs.length);
          if (avgAccuracyPct < 50) {
            tier = 'needs_revision';
            priorityScore = 100 - avgAccuracyPct;
            priorityReason = `Critical Weak Topic (${avgAccuracyPct}% accuracy) — Immediate Remediation`;
          } else if (avgAccuracyPct < 75) {
            tier = 'developing';
            priorityScore = 80 - avgAccuracyPct * 0.3;
            priorityReason = `Developing Competence (${avgAccuracyPct}% accuracy) — Target 80%+ Mastery`;
          } else {
            tier = 'mastered';
            priorityScore = 25 - tIdx;
            priorityReason = `Mastered (${avgAccuracyPct}% accuracy) — Spaced Exam Retention`;
          }
        }

        allCandidateTopics.push({
          subject: subj,
          cleanTopic,
          subTopicFocus,
          tier,
          avgAccuracyPct,
          priorityScore,
          priorityReason,
        });
      });
    });

    allCandidateTopics.sort((a, b) => b.priorityScore - a.priorityScore);

    const days: ScheduledRevisionDay[] = [];
    const baseDate = new Date();
    for (let i = 0; i < planHorizon; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateLabel = d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      const item = allCandidateTopics[i % Math.max(1, allCandidateTopics.length)];
      days.push({
        dayNumber: i + 1,
        dateLabel,
        subject: item.subject,
        topic: item.cleanTopic,
        subTopicFocus: item.subTopicFocus,
        priorityReason: item.priorityReason,
        tier: item.tier,
        targetAccuracyPct: item.tier === 'mastered' ? 90 : 80,
      });
    }
    return days;
  }, [selectedClass, selectedSubject, subjectsForClass, quizHistory, planHorizon]);

  const daysUntilExam = useMemo(() => {
    const target = new Date(targetExamDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [targetExamDate]);

  const completedPlanCount = useMemo(() => {
    return scheduledDays.filter(
      (d) => completedDayKeys[`${selectedClass}-${d.dayNumber}-${d.topic}`]
    ).length;
  }, [scheduledDays, completedDayKeys, selectedClass]);

  return (
    <div className="space-y-6">
      {/* Header & Class / Subject Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-violet-700">
              NECTA Examination Readiness · Syllabus Competence Tracker
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Topic Mastery Heatmap &amp; Smart Weak-Topic Revision Planner
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Track your accuracy across every official TIE syllabus topic, pinpoint weak areas in red and amber, and generate an automated countdown revision timetable with 20-question solving drills.
            </p>
          </div>

          {/* Segmented View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('heatmap')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Topic Mastery Heatmap</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timetable'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-violet-600" />
              <span>Smart Revision Timetable</span>
            </button>
          </div>
        </div>

        {/* Class, Subject & Target Exam Date Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">1. Select Class Level</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
            >
              {allClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">2. Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
            >
              {subjectsForClass.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              3. Target NECTA / Mock Exam Date ({daysUntilExam} days left)
            </label>
            <input
              type="date"
              value={targetExamDate}
              onChange={(e) => handleSaveExamDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
            />
          </div>
        </div>

        {/* 4-Column Mastery KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 tabular-nums">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-800">Mastered (≥75%)</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {summaryCounts.mastered}{' '}
              <span className="text-xs font-bold text-emerald-600">/ {summaryCounts.total}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="text-[11px] font-semibold text-amber-900">Developing (50–74%)</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {summaryCounts.developing}{' '}
              <span className="text-xs font-bold text-amber-600">/ {summaryCounts.total}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="text-[11px] font-semibold text-rose-900">Needs Revision (&lt;50%)</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">
              {summaryCounts.needsRevision}{' '}
              <span className="text-xs font-bold text-rose-600">/ {summaryCounts.total}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-600">Unattempted Topics</div>
            <div className="text-2xl font-black text-slate-800 mt-0.5">
              {summaryCounts.unattempted}{' '}
              <span className="text-xs font-bold text-slate-500">/ {summaryCounts.total}</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-violet-50/70 border border-violet-200">
            <div className="text-[11px] font-semibold text-violet-900">Syllabus Readiness</div>
            <div className="text-2xl font-black text-violet-700 mt-0.5">
              {summaryCounts.overallReadiness}%
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TAB 1: VISUAL TOPIC MASTERY HEATMAP ==================== */}
      {activeTab === 'heatmap' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {selectedClass} · {selectedSubject} Syllabus Heatmap ({filteredTopics.length} Topics)
              </h3>
              <p className="text-xs text-slate-500">
                Click &ldquo;Practice 20 Qns&rdquo; on any topic to launch a 20-question solving session and upgrade its mastery color.
              </p>
            </div>

            {/* Interactive Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              {(
                [
                  { id: 'ALL', label: `All (${summaryCounts.total})` },
                  { id: 'needs_revision', label: `Needs Revision (${summaryCounts.needsRevision})` },
                  { id: 'developing', label: `Developing (${summaryCounts.developing})` },
                  { id: 'mastered', label: `Mastered (${summaryCounts.mastered})` },
                  { id: 'unattempted', label: `Unattempted (${summaryCounts.unattempted})` },
                ] as Array<{ id: FilterMode; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    filterMode === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((item) => {
              const cardBorder =
                item.tier === 'mastered'
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : item.tier === 'developing'
                  ? 'border-amber-300 bg-amber-50/30'
                  : item.tier === 'needs_revision'
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-slate-200 bg-slate-50/50';

              const barColor =
                item.tier === 'mastered'
                  ? 'bg-emerald-600'
                  : item.tier === 'developing'
                  ? 'bg-amber-500'
                  : item.tier === 'needs_revision'
                  ? 'bg-rose-600'
                  : 'bg-slate-300';

              const statusLabel =
                item.tier === 'mastered'
                  ? 'Mastered (Exam Ready)'
                  : item.tier === 'developing'
                  ? 'Developing (Practice Needed)'
                  : item.tier === 'needs_revision'
                  ? 'Needs Urgent Revision'
                  : 'Not Practiced Yet';

              const statusTextColor =
                item.tier === 'mastered'
                  ? 'text-emerald-800'
                  : item.tier === 'developing'
                  ? 'text-amber-800'
                  : item.tier === 'needs_revision'
                  ? 'text-rose-800'
                  : 'text-slate-500';

              return (
                <div
                  key={item.rawTopic}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors ${cardBorder}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className={`text-[11px] font-bold ${statusTextColor}`}>
                          Topic {item.topicCode} · {statusLabel}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mt-0.5">
                          {item.cleanTopic}
                        </h4>
                      </div>
                      <div className="text-right tabular-nums shrink-0">
                        <div className="text-lg font-black text-slate-900">
                          {item.attempts > 0 ? `${item.avgAccuracyPct}%` : '—'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.attempts > 0
                            ? `Best: ${item.bestScoreOutOf20}/20 (${item.attempts}x)`
                            : '0 quizzes'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${item.attempts > 0 ? Math.max(8, item.avgAccuracyPct) : 0}%` }}
                      />
                    </div>

                    {/* Sub-topics inline list */}
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Sub-topics: </span>
                      {item.subTopics.slice(0, 4).join(' · ')}
                    </div>
                  </div>

                  {/* Manual Score Logger if active */}
                  {manualScoreTopic === item.cleanTopic && onLogManualPractice && (
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs">
                      <label className="font-semibold text-slate-700">
                        Score out of 20:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={manualScoreValue}
                        onChange={(e) =>
                          setManualScoreValue(Math.max(0, Math.min(20, Number(e.target.value) || 0)))
                        }
                        className="w-16 px-2 py-1 rounded border border-slate-300 font-bold text-center tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onLogManualPractice(selectedClass, selectedSubject, item.cleanTopic, manualScoreValue);
                          setManualScoreTopic(null);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        Save Score
                      </button>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      {item.lastPracticed ? `Last practiced: ${item.lastPracticed}` : 'Ready for 20-Qn diagnostic'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {onLogManualPractice && (
                        <button
                          type="button"
                          onClick={() =>
                            setManualScoreTopic((prev) =>
                              prev === item.cleanTopic ? null : item.cleanTopic
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold cursor-pointer"
                        >
                          Log Score
                        </button>
                      )}
                      {onOpenTopicNotes && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenTopicNotes(selectedClass, selectedSubject, item.cleanTopic)
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Notes</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchTopicQuiz(selectedClass, selectedSubject, item.cleanTopic)
                        }
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Practice 20 Qns</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: SMART WEAK-TOPIC REVISION TIMETABLE ==================== */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Smart Weak-Topic Revision Timetable ({selectedClass})
              </h3>
              <p className="text-xs text-slate-500">
                Automatically prioritizes red (&lt;50%), unattempted, and amber (50–74%) syllabus topics across your subjects.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
                {([7, 14, 30] as PlanHorizon[]).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setPlanHorizon(h)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      planHorizon === h
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {h}-Day Plan
                  </button>
                ))}
              </div>
              <div className="text-xs font-bold text-emerald-700 tabular-nums px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                Completed: {completedPlanCount}/{planHorizon} Days
              </div>
            </div>
          </div>

          {/* Day-by-Day Schedule List */}
          <div className="space-y-3">
            {scheduledDays.map((day) => {
              const dayKey = `${selectedClass}-${day.dayNumber}-${day.topic}`;
              const isDone = Boolean(completedDayKeys[dayKey]);

              return (
                <div
                  key={dayKey}
                  className={`p-4 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : day.tier === 'needs_revision'
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleDayCompleted(dayKey)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300 hover:border-violet-600'
                      }`}
                      title={isDone ? 'Mark as incomplete' : 'Mark day complete'}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                        <span className="font-black text-slate-900">
                          Day {day.dayNumber} ({day.dateLabel})
                        </span>
                        <span>·</span>
                        <span className="font-bold text-violet-700">{day.subject}</span>
                        <span>·</span>
                        <span>{day.priorityReason}</span>
                      </div>

                      <div className="text-sm font-black text-slate-900">
                        Topic: {day.topic}{' '}
                        <span className="font-semibold text-slate-600">
                          (Focus: {day.subTopicFocus})
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4 pt-0.5">
                        <span>
                          <strong>Block 1 (40 min):</strong> Read TIE Student&apos;s Book &amp; worked examples on {day.subTopicFocus}
                        </span>
                        <span>
                          <strong>Block 2 (45 min):</strong> Solve 20 NECTA Past Paper questions (Target ≥{day.targetAccuracyPct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {onOpenTopicNotes && (
                      <button
                        type="button"
                        onClick={() => onOpenTopicNotes(selectedClass, day.subject, day.topic)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs cursor-pointer"
                      >
                        Study Notes
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onLaunchTopicQuiz(selectedClass, day.subject, day.topic)}
                      className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start 20-Qn Drill</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicMasteryPlanner;
