import React, { useEffect, useMemo, useState } from 'react';
import {
  ALL_SYLLABI,
  TIE_SUBJECT_OPTIONS,
  TieAtomicActivity,
  TieFormKey,
  TieSubjectKey,
  mapElimikaContextToTie,
} from '../data/tieSchemeSyllabi2027';

type RevisionMode = 'auto4' | 'auto8' | 'natural';

type CalendarSlot =
  | { type: 'banner'; text: string }
  | { type: 'week'; month: string; week: number };

type MergeableColKey =
  | 'mainComp'
  | 'specComp'
  | 'mainAct'
  | 'specAct'
  | 'month'
  | 'methods'
  | 'resources'
  | 'assessment'
  | 'ref';

interface ScheduleDataRow {
  type: 'data';
  isRevision: boolean;
  actId: number | string;
  mainComp: string;
  specComp: string;
  mainAct: string;
  specActsArray: string[];
  specAct: string;
  month: string;
  week: string;
  periods: number;
  methods: string;
  resources: string;
  assessment: string;
  ref: string;
  remarks: string;
  _spans: Record<MergeableColKey, number>;
}

type ScheduleItem = { type: 'banner'; text: string } | ScheduleDataRow;

export interface TieSchemeOfWorkGeneratorProps {
  initialClass?: string;
  initialSubject?: string;
  initialSchool?: string;
  initialTeacher?: string;
}

const MERGE_COLS: { key: MergeableColKey; parentKey: MergeableColKey | null }[] = [
  { key: 'mainComp', parentKey: null },
  { key: 'specComp', parentKey: 'mainComp' },
  { key: 'mainAct', parentKey: 'specComp' },
  { key: 'specAct', parentKey: 'mainAct' },
  { key: 'month', parentKey: null },
  { key: 'methods', parentKey: 'specComp' },
  { key: 'resources', parentKey: 'specComp' },
  { key: 'assessment', parentKey: 'specComp' },
  { key: 'ref', parentKey: null },
];

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCalendar(includeOrient: boolean): CalendarSlot[] {
  const months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
  ];
  const cal: CalendarSlot[] = [];

  if (includeOrient) {
    cal.push({
      type: 'banner',
      text: 'REGISTRATION & ORIENTATION COURSE (2ND WEEK OF JANUARY TO 2ND WEEK OF FEBRUARY 2027)',
    });
  }

  for (let m = 0; m < months.length; m++) {
    for (let w = 1; w <= 4; w++) {
      if (includeOrient && (m === 0 || (m === 1 && w <= 2))) continue;
      if (m === 2 && w === 4) {
        cal.push({
          type: 'banner',
          text: 'MID-TERM ASSESSMENT & MID-TERM BREAK (MARCH – APRIL 2027)',
        });
        continue;
      }
      if (m === 3 && w === 1) continue;
      if (m === 5) {
        if (w === 1) {
          cal.push({
            type: 'banner',
            text: 'TERMINAL EXAMINATIONS & FIRST-TERM BREAK (JUNE – JULY 2027)',
          });
        }
        continue;
      }
      if (m === 6 && w === 1) continue;
      if (m === 8 && w === 1) {
        cal.push({
          type: 'banner',
          text: 'MID-TERM TEST & MID-TERM BREAK (SEPTEMBER 2027)',
        });
        continue;
      }
      cal.push({ type: 'week', month: months[m], week: w });
    }
  }

  cal.push({
    type: 'banner',
    text: 'ANNUAL EXAMINATIONS & END OF YEAR HOLIDAY (NOVEMBER – DECEMBER 2027)',
  });
  return cal;
}

function buildRawScheduleRows(
  cal: CalendarSlot[],
  ppw: number,
  revMode: RevisionMode,
  subj: TieSubjectKey,
  formKey: TieFormKey,
  activities: TieAtomicActivity[],
  activeBook: string
): ScheduleItem[] {
  const totalWeekSlots = cal.filter((c) => c.type === 'week').length;
  const minRevWeeks = revMode === 'auto8' ? 8 : revMode === 'auto4' ? 4 : 0;
  const maxTeachingWeeks = Math.max(10, totalWeekSlots - minRevWeeks);
  const maxTeachingPeriods = maxTeachingWeeks * ppw;

  // Clone activities and scale periods proportionally ONLY if total exceeds maxTeachingPeriods
  const rawTotalPeriods = activities.reduce((s, a) => s + a.periods, 0);
  const workingActs = activities.map((a, idx) => {
    let effPeriods = a.periods;
    if (rawTotalPeriods > maxTeachingPeriods) {
      effPeriods = Math.max(1, Math.round((a.periods / rawTotalPeriods) * maxTeachingPeriods));
    }
    return { ...a, effPeriods, actId: idx };
  });

  const rawItems: ScheduleItem[] = [];
  let qPtr = 0;
  let rem = workingActs.length ? workingActs[0].effPeriods : 0;
  let cIdx = 0;

  while (cIdx < cal.length && qPtr < workingActs.length) {
    const slot = cal[cIdx];
    if (slot.type === 'banner') {
      rawItems.push({ type: 'banner', text: slot.text });
      cIdx++;
      continue;
    }

    const act = workingActs[qPtr];
    const monthName = slot.month;
    const weeks: number[] = [];
    let alloc = 0;

    while (
      cIdx < cal.length &&
      cal[cIdx].type === 'week' &&
      (cal[cIdx] as { type: 'week'; month: string; week: number }).month === monthName &&
      rem > 0
    ) {
      const weekSlot = cal[cIdx] as { type: 'week'; month: string; week: number };
      weeks.push(weekSlot.week);
      const take = Math.min(ppw, rem);
      alloc += take;
      rem -= take;
      cIdx++;
    }

    const weekText =
      weeks.length > 1 ? `${weeks[0]}&${weeks[weeks.length - 1]}` : `${weeks[0]}`;

    rawItems.push({
      type: 'data',
      isRevision: false,
      actId: act.actId,
      mainComp: act.mainComp,
      specComp: act.specComp,
      mainAct: act.mainAct,
      specActsArray: act.specActs,
      specAct: '',
      month: monthName,
      week: weekText,
      periods: alloc,
      methods: act.methods,
      resources: act.resources,
      assessment: act.assessment,
      ref: activeBook,
      remarks: '',
      _spans: {
        mainComp: 1,
        specComp: 1,
        mainAct: 1,
        specAct: 1,
        month: 1,
        methods: 1,
        resources: 1,
        assessment: 1,
        ref: 1,
      },
    });

    if (rem <= 0) {
      qPtr++;
      if (qPtr < workingActs.length) rem = workingActs[qPtr].effPeriods;
    }
  }

  // Fill ALL remaining calendar weeks before the final Annual Exam banner with structured Exam Revision!
  let revPhase = 1;
  while (cIdx < cal.length) {
    const slot = cal[cIdx];
    if (slot.type === 'banner') {
      rawItems.push({ type: 'banner', text: slot.text });
      cIdx++;
      continue;
    }

    const monthName = slot.month;
    const weeks: number[] = [];
    let alloc = 0;

    while (
      cIdx < cal.length &&
      cal[cIdx].type === 'week' &&
      (cal[cIdx] as { type: 'week'; month: string; week: number }).month === monthName
    ) {
      const weekSlot = cal[cIdx] as { type: 'week'; month: string; week: number };
      weeks.push(weekSlot.week);
      alloc += ppw;
      cIdx++;
    }

    const weekText =
      weeks.length > 1 ? `${weeks[0]}&${weeks[weeks.length - 1]}` : `${weeks[0]}`;
    const isMonth1 = revPhase === 1;

    rawItems.push({
      type: 'data',
      isRevision: true,
      actId: `rev_${revPhase}`,
      mainComp: `Comprehensive Revision & Examination Preparation (${subj})`,
      specComp: isMonth1
        ? `Consolidate mastery of Term I & Term II competences in ${subj}`
        : `Demonstrate examination readiness through NECTA/TIE past papers and timed mock drills`,
      mainAct: isMonth1
        ? `(a) Review core concepts, theories, practical skills, and challenging topics across the ${formKey} syllabus`
        : `(b) Solve past examination papers, conduct timed assessment drills, and review marking schemes`,
      specActsArray: [
        isMonth1
          ? `i. Guide students in groups to review key syllabus competences, summarise main concepts, and resolve difficult questions.`
          : `i. Administer timed past examination papers, guide peer/teacher marking scheme discussions, and provide targeted remediation.`,
      ],
      specAct: '',
      month: monthName,
      week: weekText,
      periods: alloc,
      methods: 'Group discussion, Past paper problem solving, Peer teaching, Q&A clinics',
      resources: `${subj} Past Examination Papers, Marking Schemes, TIE Student's Book (${formKey}), Summary Charts`,
      assessment: 'Timed Revision Tests, Past Paper Drills, Mock/Annual Exam Practice',
      ref: activeBook,
      remarks: '',
      _spans: {
        mainComp: 1,
        specComp: 1,
        mainAct: 1,
        specAct: 1,
        month: 1,
        methods: 1,
        resources: 1,
        assessment: 1,
        ref: 1,
      },
    });
    revPhase++;
  }

  // Distribute specific sub-activities across rows belonging to the same atomic activity
  const rowsByAct: Record<string, ScheduleDataRow[]> = {};
  rawItems.forEach((item) => {
    if (item.type === 'data') {
      const id = String(item.actId);
      if (!rowsByAct[id]) rowsByAct[id] = [];
      rowsByAct[id].push(item);
    }
  });

  Object.values(rowsByAct).forEach((rows) => {
    const lines = rows[0].specActsArray;
    const numRows = rows.length;
    if (numRows === 1) {
      rows[0].specAct = lines.join('\n');
    } else {
      rows.forEach((r, idx) => {
        if (lines.length >= numRows) {
          const start = Math.floor((idx * lines.length) / numRows);
          const end = Math.floor(((idx + 1) * lines.length) / numRows);
          r.specAct = lines.slice(start, Math.max(start + 1, end)).join('\n');
        } else {
          r.specAct = lines[idx] || lines[lines.length - 1];
        }
      });
    }
  });

  return rawItems;
}

function applyCellMerging(scheduleItems: ScheduleItem[]): ScheduleItem[] {
  scheduleItems.forEach((item) => {
    if (item.type === 'data') {
      MERGE_COLS.forEach((c) => {
        item._spans[c.key] = 1;
      });
    }
  });

  MERGE_COLS.forEach(({ key, parentKey }) => {
    let anchorIdx = -1;
    for (let i = 0; i < scheduleItems.length; i++) {
      const row = scheduleItems[i];
      if (row.type !== 'data') {
        anchorIdx = -1;
        continue;
      }
      if (anchorIdx === -1) {
        anchorIdx = i;
        continue;
      }
      const prev = scheduleItems[anchorIdx] as ScheduleDataRow;
      const sameValue = Boolean(row[key] && row[key] === prev[key]);
      const sameParent = !parentKey || row[parentKey] === prev[parentKey];

      if (sameValue && sameParent) {
        prev._spans[key] += 1;
        row._spans[key] = 0;
      } else {
        anchorIdx = i;
      }
    }
  });

  return scheduleItems;
}

function renderWordCell(
  row: ScheduleDataRow,
  key: MergeableColKey,
  content: string,
  alignCenter = false,
  preLine = false
): string {
  const span = row._spans[key];
  if (span === 0) return '';
  const spanAttr = span > 1 ? ` rowspan="${span}"` : '';
  const styles: string[] = [];
  if (alignCenter) styles.push('text-align:center; vertical-align:middle;');
  if (preLine) styles.push('white-space:pre-line;');
  const styleAttr = styles.length ? ` style="${styles.join(' ')}"` : '';
  return `<td${spanAttr}${styleAttr}>${escapeHtml(content).replace(/\n/g, '<br/>')}</td>`;
}

export const TieSchemeOfWorkGenerator: React.FC<TieSchemeOfWorkGeneratorProps> = ({
  initialClass,
  initialSubject,
  initialSchool,
  initialTeacher,
}) => {
  const initialMapping = useMemo(
    () => mapElimikaContextToTie(initialClass, initialSubject),
    // Only seed on mount; subject/form controls drive state after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [subject, setSubject] = useState<TieSubjectKey>(initialMapping.subject);
  const [formKey, setFormKey] = useState<TieFormKey>(initialMapping.form);
  const [schoolName, setSchoolName] = useState<string>(
    initialSchool?.trim() || '....................................'
  );
  const [teacherName, setTeacherName] = useState<string>(
    initialTeacher?.trim() || '....................................'
  );
  const [yearVal, setYearVal] = useState<string>('2027');
  const [revisionMode, setRevisionMode] = useState<RevisionMode>('auto4');

  const formKeys = useMemo(
    () => Object.keys(ALL_SYLLABI[subject]) as TieFormKey[],
    [subject]
  );

  const currentSyllabus = ALL_SYLLABI[subject][formKey] || ALL_SYLLABI[subject][formKeys[0]]!;

  const [ppwVal, setPpwVal] = useState<number>(currentSyllabus.ppw);
  const [orientToggle, setOrientToggle] = useState<boolean>(Boolean(currentSyllabus.orient));
  const [activeBook, setActiveBook] = useState<string>(currentSyllabus.book);
  const [currentActivities, setCurrentActivities] = useState<TieAtomicActivity[]>(() =>
    currentSyllabus.activities.map((a) => ({ ...a, specActs: [...a.specActs] }))
  );
  const [mobileControlsOpen, setMobileControlsOpen] = useState<boolean>(true);

  useEffect(() => {
    const cleanAfterPrint = () => {
      document.body.classList.remove('tie-scheme-print-mode');
    };
    window.addEventListener('afterprint', cleanAfterPrint);
    return () => {
      window.removeEventListener('afterprint', cleanAfterPrint);
      document.body.classList.remove('tie-scheme-print-mode');
    };
  }, []);

  const loadSyllabusData = (nextSubj: TieSubjectKey, nextForm: TieFormKey) => {
    const forms = Object.keys(ALL_SYLLABI[nextSubj]) as TieFormKey[];
    const resolvedForm = forms.includes(nextForm) ? nextForm : forms[0];
    const data = ALL_SYLLABI[nextSubj][resolvedForm]!;
    setSubject(nextSubj);
    setFormKey(resolvedForm);
    setPpwVal(data.ppw);
    setOrientToggle(Boolean(data.orient));
    setActiveBook(data.book);
    setCurrentActivities(data.activities.map((a) => ({ ...a, specActs: [...a.specActs] })));
  };

  const handleSubjectChange = (nextSubj: TieSubjectKey) => {
    loadSyllabusData(nextSubj, formKey);
  };

  const handleFormChange = (nextForm: TieFormKey) => {
    loadSyllabusData(subject, nextForm);
  };

  const updatePeriods = (idx: number, raw: string) => {
    const parsed = Math.max(1, parseInt(raw, 10) || 1);
    setCurrentActivities((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, periods: parsed } : item))
    );
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= currentActivities.length) return;
    setCurrentActivities((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const moveFirst = (idx: number) => {
    if (idx === 0) return;
    setCurrentActivities((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  const mergedItems = useMemo(() => {
    const effectivePpw = Math.max(1, Number(ppwVal) || 2);
    const cal = buildCalendar(orientToggle);
    const rawItems = buildRawScheduleRows(
      cal,
      effectivePpw,
      revisionMode,
      subject,
      formKey,
      currentActivities,
      activeBook
    );
    return applyCellMerging(rawItems);
  }, [orientToggle, ppwVal, revisionMode, subject, formKey, currentActivities, activeBook]);

  const effectiveYear = yearVal.trim() || '2027';

  const handleDownloadWord = () => {
    let tbodyHtml = '';
    mergedItems.forEach((item) => {
      if (item.type === 'banner') {
        tbodyHtml += `<tr><td colspan="12" class="break-row">${escapeHtml(item.text)}</td></tr>`;
      } else {
        const trClass = item.isRevision ? ' class="revision-row"' : '';
        tbodyHtml += `
          <tr${trClass}>
            ${renderWordCell(item, 'mainComp', item.mainComp, false, true)}
            ${renderWordCell(item, 'specComp', item.specComp, false, true)}
            ${renderWordCell(item, 'mainAct', item.mainAct, false, true)}
            ${renderWordCell(item, 'specAct', item.specAct, false, true)}
            ${renderWordCell(item, 'month', item.month, true)}
            <td style="text-align:center;">${escapeHtml(item.week)}</td>
            <td style="text-align:center;">${item.periods}</td>
            ${renderWordCell(item, 'methods', item.methods)}
            ${renderWordCell(item, 'resources', item.resources)}
            ${renderWordCell(item, 'assessment', item.assessment)}
            ${renderWordCell(item, 'ref', item.ref)}
            <td>${escapeHtml(item.remarks)}</td>
          </tr>
        `;
      }
    });

    const docFile = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(subject)} ${escapeHtml(formKey)} SCHEME OF WORK ${escapeHtml(effectiveYear)}</title>
        <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom></w:WordDocument></xml><![endif]-->
        <style>
          @page Section1 { size: 841.9pt 595.3pt; mso-page-orientation: landscape; margin: 1.2cm; }
          div.Section1 { page: Section1; font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000000; }
          .doc-title { text-align: center; font-family: 'Times New Roman', Times, serif; font-weight: bold; text-transform: uppercase; line-height: 1.35; margin-bottom: 10pt; font-size: 12pt; color: #000000; }
          table.meta-table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; font-family: 'Times New Roman', Times, serif; font-size: 11pt; font-weight: bold; }
          table.meta-table td { border: none !important; padding: 3pt 4pt; text-align: left; vertical-align: middle; color: #000000; }
          table.tie-scheme { width: 100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 10pt; }
          table.tie-scheme th, table.tie-scheme td { border: 1px solid #000000; padding: 5px; vertical-align: top; text-align: left; color: #000000; }
          table.tie-scheme th { background: #f1f5f9; font-weight: bold; text-align: center; }
          .break-row { background: #e2e8f0; text-align: center !important; font-weight: bold; padding: 6px; }
          .revision-row td { background: #fefce8; }
        </style>
      </head>
      <body>
        <div class="Section1">
          <div class="doc-title">
            <div>PRESIDENT’S OFFICE – REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</div>
            <div>SCHEME OF WORK – ${escapeHtml(effectiveYear)}</div>
          </div>
          <table class="meta-table">
            <tr>
              <td style="width:36%;">NAME OF SCHOOL: ${escapeHtml(schoolName)}</td>
              <td style="width:36%;">TEACHER'S NAME: ${escapeHtml(teacherName)}</td>
              <td style="width:28%;">SUBJECT: ${escapeHtml(subject)}</td>
            </tr>
            <tr>
              <td>CLASS: ${escapeHtml(formKey)}</td>
              <td>TERM: I &amp; II</td>
              <td>YEAR: ${escapeHtml(effectiveYear)}</td>
            </tr>
          </table>
          <table class="tie-scheme">
            <thead>
              <tr>
                <th>Main Competence</th>
                <th>Specific Competence</th>
                <th>Main Learning Activities</th>
                <th>Specific Learning Activities</th>
                <th>Month</th>
                <th>Week</th>
                <th>No. of Periods</th>
                <th>Teaching and Learning Methods</th>
                <th>Teaching and Learning Resources</th>
                <th>Assessment Tools</th>
                <th>References</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>${tbodyHtml}</tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const filename = `${subject.replace(/\s+/g, '_')}_${formKey.replace(/\s+/g, '_')}_SCHEME_OF_WORK_${effectiveYear}.doc`;
    const blob = new Blob(['\ufeff', docFile], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const handlePrintPdf = () => {
    document.body.classList.add('tie-scheme-print-mode');
    window.setTimeout(() => {
      window.print();
    }, 40);
  };

  return (
    <div className="tie-scheme-generator-root w-full max-w-[1600px] mx-auto space-y-3">
      {/* Top Action Header Bar (Hidden on Print) */}
      <div className="no-print print:hidden rounded-xl bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] text-white px-4 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
            TIE All-Subjects Master Scheme of Work Generator (2027)
          </h2>
          <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5">
            All 8 Subjects • Separate (a), (b), (c), (d) Activities • Zero Repetition • Auto-Fills Remaining 1–2 Months with Exam Revision
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileControlsOpen((v) => !v)}
            className="xl:hidden px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            {mobileControlsOpen ? '✕ Hide Settings' : '⚙️ Configure & Reorder'}
          </button>
          <button
            type="button"
            onClick={handleDownloadWord}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>📄 Download MS Word (.doc)</span>
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>🖨️ Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Controls + 12-Column Live Preview */}
      <div className="tie-scheme-layout grid grid-cols-1 xl:grid-cols-[410px_minmax(0,1fr)] gap-4 items-start">
        {/* Left Control Card (Hidden on Print) */}
        <aside
          className={`no-print print:hidden bg-white border border-slate-300 rounded-xl p-4 space-y-3 shadow-xs ${
            mobileControlsOpen ? 'block' : 'hidden xl:block'
          }`}
        >
          <div className="text-xs font-extrabold text-blue-700 uppercase border-b-2 border-slate-200 pb-1.5">
            1. Select Subject, Class &amp; Revision Window
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label
                htmlFor="tie-subject-selector"
                className="block text-[11px] font-bold text-slate-700 mb-1"
              >
                TIE Subject (All 8 Syllabi)
              </label>
              <select
                id="tie-subject-selector"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value as TieSubjectKey)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-xs bg-white text-slate-900"
              >
                {TIE_SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tie-form-selector"
                className="block text-[11px] font-bold text-slate-700 mb-1"
              >
                Form Level
              </label>
              <select
                id="tie-form-selector"
                value={formKey}
                onChange={(e) => handleFormChange(e.target.value as TieFormKey)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-xs bg-white text-slate-900"
              >
                {formKeys.map((fk) => (
                  <option key={fk} value={fk}>
                    {fk}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="tie-school-name"
                  className="block text-[11px] font-bold text-slate-700 mb-1"
                >
                  Name of School
                </label>
                <input
                  id="tie-school-name"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-xs bg-white text-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="tie-teacher-name"
                  className="block text-[11px] font-bold text-slate-700 mb-1"
                >
                  Teacher&apos;s Name
                </label>
                <input
                  id="tie-teacher-name"
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-xs bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="tie-year-val"
                  className="block text-[11px] font-bold text-slate-700 mb-1"
                >
                  Academic Year
                </label>
                <input
                  id="tie-year-val"
                  type="number"
                  value={yearVal}
                  onChange={(e) => setYearVal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-xs bg-white text-slate-900"
                />
              </div>
              <div>
                <label
                  htmlFor="tie-ppw-val"
                  className="block text-[11px] font-bold text-slate-700 mb-1"
                >
                  Periods Per Week
                </label>
                <input
                  id="tie-ppw-val"
                  type="number"
                  min={1}
                  max={12}
                  value={ppwVal}
                  onChange={(e) => setPpwVal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-xs bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tie-revision-mode"
                className="block text-[11px] font-bold text-slate-700 mb-1"
              >
                End-of-Year Exam Revision Reserve (Oct / Nov)
              </label>
              <select
                id="tie-revision-mode"
                value={revisionMode}
                onChange={(e) => setRevisionMode(e.target.value as RevisionMode)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold text-xs bg-white text-slate-900"
              >
                <option value="auto4">
                  Reserve At Least 1 Month (4 Weeks in November) for Exam Revision
                </option>
                <option value="auto8">
                  Reserve At Least 2 Months (8 Weeks in Oct &amp; Nov) for Exam Revision
                </option>
                <option value="natural">
                  Fill Only Remaining Unallocated Weeks with Exam Revision
                </option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 cursor-pointer select-none pt-0.5">
              <input
                type="checkbox"
                checked={orientToggle}
                onChange={(e) => setOrientToggle(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600"
              />
              <span>Include Form 1 Orientation Course (Jan W2 – Feb W2 2027)</span>
            </label>
          </div>

          <div className="text-xs font-extrabold text-blue-700 uppercase border-b-2 border-slate-200 pb-1.5 pt-2">
            2. Reorder Atomic Learning Activities
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Every single <strong>(a), (b), (c)...</strong> activity is separate. Reorder with{' '}
            <strong>1st</strong>, <strong>↑</strong>, or <strong>↓</strong>.
          </p>

          <ul className="space-y-1.5 max-h-[430px] overflow-y-auto pr-1">
            {currentActivities.map((act, i) => (
              <li
                key={`${subject}-${formKey}-${act.code}-${i}`}
                className="bg-slate-50 border border-slate-300 border-l-4 border-l-blue-600 rounded-md px-2.5 py-2 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0 text-[11px]">
                  <strong className="block text-slate-900 leading-tight mb-1">
                    #{i + 1} [{act.code}]: {act.title}
                  </strong>
                  <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                    Syllabus Periods:
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={act.periods}
                      onChange={(e) => updatePeriods(i, e.target.value)}
                      className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs font-bold bg-white text-slate-900"
                    />
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveFirst(i)}
                    title="Start with this activity"
                    className="px-1.5 py-1 text-[10px] font-bold bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-800 border border-slate-400 rounded cursor-pointer transition-colors"
                  >
                    1st
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(i, -1)}
                    title="Move up"
                    className="px-1.5 py-1 text-[10px] font-bold bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-800 border border-slate-400 rounded cursor-pointer transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(i, 1)}
                    title="Move down"
                    className="px-1.5 py-1 text-[10px] font-bold bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-800 border border-slate-400 rounded cursor-pointer transition-colors"
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Preview Sheet: Crisp White Paper + 12-Column TIE Table */}
        <main className="tie-sheet-container bg-white border border-slate-300 rounded-xl p-4 sm:p-6 overflow-x-auto shadow-xs">
          <div id="schemeDoc" className="min-w-[920px]">
            <div className="tie-doc-title">
              <div>PRESIDENT’S OFFICE – REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</div>
              <div>SCHEME OF WORK – {effectiveYear}</div>
            </div>

            <div className="tie-doc-meta">
              <div>NAME OF SCHOOL: {schoolName}</div>
              <div>TEACHER&apos;S NAME: {teacherName}</div>
              <div>SUBJECT: {subject}</div>
              <div>CLASS: {formKey}</div>
              <div>TERM: I &amp; II</div>
              <div>YEAR: {effectiveYear}</div>
            </div>

            <table className="tie-scheme">
              <thead>
                <tr>
                  <th>Main Competence</th>
                  <th>Specific Competence</th>
                  <th>Main Learning Activities</th>
                  <th>Specific Learning Activities</th>
                  <th>Month</th>
                  <th>Week</th>
                  <th>No. of Periods</th>
                  <th>Teaching and Learning Methods</th>
                  <th>Teaching and Learning Resources</th>
                  <th>Assessment Tools</th>
                  <th>References</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {mergedItems.map((item, idx) => {
                  if (item.type === 'banner') {
                    return (
                      <tr key={`banner-${idx}`}>
                        <td colSpan={12} className="tie-break-row">
                          {item.text}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={`row-${idx}-${item.actId}-${item.month}-${item.week}`}
                      className={item.isRevision ? 'tie-revision-row' : undefined}
                    >
                      {item._spans.mainComp > 0 && (
                        <td
                          rowSpan={item._spans.mainComp > 1 ? item._spans.mainComp : undefined}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {item.mainComp}
                        </td>
                      )}
                      {item._spans.specComp > 0 && (
                        <td
                          rowSpan={item._spans.specComp > 1 ? item._spans.specComp : undefined}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {item.specComp}
                        </td>
                      )}
                      {item._spans.mainAct > 0 && (
                        <td
                          rowSpan={item._spans.mainAct > 1 ? item._spans.mainAct : undefined}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {item.mainAct}
                        </td>
                      )}
                      {item._spans.specAct > 0 && (
                        <td
                          rowSpan={item._spans.specAct > 1 ? item._spans.specAct : undefined}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {item.specAct}
                        </td>
                      )}
                      {item._spans.month > 0 && (
                        <td
                          rowSpan={item._spans.month > 1 ? item._spans.month : undefined}
                          style={{ textAlign: 'center', verticalAlign: 'middle' }}
                        >
                          {item.month}
                        </td>
                      )}
                      <td style={{ textAlign: 'center' }}>{item.week}</td>
                      <td style={{ textAlign: 'center' }}>{item.periods}</td>
                      {item._spans.methods > 0 && (
                        <td rowSpan={item._spans.methods > 1 ? item._spans.methods : undefined}>
                          {item.methods}
                        </td>
                      )}
                      {item._spans.resources > 0 && (
                        <td rowSpan={item._spans.resources > 1 ? item._spans.resources : undefined}>
                          {item.resources}
                        </td>
                      )}
                      {item._spans.assessment > 0 && (
                        <td rowSpan={item._spans.assessment > 1 ? item._spans.assessment : undefined}>
                          {item.assessment}
                        </td>
                      )}
                      {item._spans.ref > 0 && (
                        <td rowSpan={item._spans.ref > 1 ? item._spans.ref : undefined}>
                          {item.ref}
                        </td>
                      )}
                      <td>{item.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TieSchemeOfWorkGenerator;
