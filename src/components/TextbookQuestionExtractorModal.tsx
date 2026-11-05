import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Database,
  FileUp,
  Layers,
  Link2,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { MathText } from '../utils/mathRenderer';
import {
  getSyllabusTopicsForClassSubject,
  PaperRecord,
  TIE_CURRICULUM_SUBJECTS,
} from '../data/curriculumData';
import {
  addQuestionsToStoredBank,
  getQuestionBankStats,
  getSeenSignaturesForClassSubject,
  getStoredBankQuestionsForClassSubject,
  resetSeenQuestionsForClassSubject,
  syncQuestionBankWithServer,
} from '../utils/questionBankManager';
import { getQuestionDiagramSvg } from '../utils/questionDiagramGenerator';

export interface TextbookQuestionExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: string;
  initialSubject?: string;
  initialTopic?: string;
  onQuestionsExtracted?: (info: {
    cls: string;
    subject: string;
    topic: string;
    textbookTitle: string;
    addedCount: number;
    totalStored: number;
    newResource?: PaperRecord;
  }) => void;
}

const CLASS_OPTIONS = [
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
  'Form 5',
  'Form 6',
  'Standard 7',
  'Standard 6',
  'Standard 5',
  'Standard 4',
  'Standard 3',
];

export const TextbookQuestionExtractorModal: React.FC<TextbookQuestionExtractorModalProps> = ({
  isOpen,
  onClose,
  initialClass = 'Form 1',
  initialSubject = 'Basic Mathematics',
  initialTopic = 'ALL',
  onQuestionsExtracted,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || 'Form 1');
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || 'Basic Mathematics'
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'ALL');
  const [textbookTitle, setTextbookTitle] = useState<string>(
    `Official TIE ${initialClass || 'Form 1'} ${initialSubject || 'Basic Mathematics'} Student's Textbook`
  );
  const [driveUrl, setDriveUrl] = useState<string>('');
  const [pastedTextbookContent, setPastedTextbookContent] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<{
    fileName: string;
    mimeType: string;
    base64Data: string;
    sizeKb: number;
  } | null>(null);
  const [extractCount, setExtractCount] = useState<number>(25);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedClass(initialClass || 'Form 1');
      setSelectedSubject(initialSubject || 'Basic Mathematics');
      setSelectedTopic(initialTopic || 'ALL');
      setTextbookTitle(
        `Official TIE ${initialClass || 'Form 1'} ${initialSubject || 'Basic Mathematics'} Student's Textbook`
      );
      void syncQuestionBankWithServer(initialClass, initialSubject).then(() => {
        setRefreshTick((t) => t + 1);
      });
    }
  }, [isOpen, initialClass, initialSubject, initialTopic]);

  const availableSubjects = useMemo(() => {
    const base = TIE_CURRICULUM_SUBJECTS[selectedClass] || [
      'Basic Mathematics',
      'Additional Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
    ];
    if (!base.includes('Additional Mathematics') && selectedClass.startsWith('Form ')) {
      return ['Basic Mathematics', 'Additional Mathematics', ...base.filter((s) => s !== 'Basic Mathematics')];
    }
    return base;
  }, [selectedClass]);

  const availableTopics = useMemo(
    () => getSyllabusTopicsForClassSubject(selectedClass, selectedSubject),
    [selectedClass, selectedSubject]
  );

  const stats = useMemo(
    () => getQuestionBankStats(selectedClass, selectedSubject, 25),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedClass, selectedSubject, refreshTick]
  );

  const storedQuestions = useMemo(
    () => getStoredBankQuestionsForClassSubject(selectedClass, selectedSubject, selectedTopic),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedClass, selectedSubject, selectedTopic, refreshTick]
  );

  const seenSet = useMemo(
    () => getSeenSignaturesForClassSubject(selectedClass, selectedSubject),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedClass, selectedSubject, refreshTick]
  );

  if (!isOpen) return null;

  const handleSelectQuickPreset = (cls: string, sub: string) => {
    setSelectedClass(cls);
    setSelectedSubject(sub);
    setSelectedTopic('ALL');
    setTextbookTitle(`Official TIE ${cls} ${sub} Student's Textbook`);
    setStatusMessage(null);
    void syncQuestionBankWithServer(cls, sub).then(() => setRefreshTick((t) => t + 1));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '').slice(0, 35000);
        setPastedTextbookContent((prev) => (prev ? `${prev}\n\n${text}` : text));
        if (!textbookTitle || textbookTitle.startsWith('Official TIE')) {
          setTextbookTitle(file.name.replace(/\.[^.]+$/, ''));
        }
        setStatusMessage({
          type: 'info',
          text: `Loaded text file "${file.name}" (${Math.round(file.size / 1024)} KB). Click "Extract & Store Questions" below!`,
        });
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = String(reader.result || '');
      const commaIdx = rawDataUrl.indexOf(',');
      const base64Data = commaIdx >= 0 ? rawDataUrl.slice(commaIdx + 1) : rawDataUrl;
      setAttachedFile({
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        base64Data,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
      });
      if (!textbookTitle || textbookTitle.startsWith('Official TIE')) {
        setTextbookTitle(file.name.replace(/\.[^.]+$/, ''));
      }
      setStatusMessage({
        type: 'info',
        text: `Attached PDF textbook "${file.name}" (${Math.max(1, Math.round(file.size / 1024))} KB). Click "Extract & Store Questions" to build your non-repeating question bank!`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleExtractAndStoreQuestions = async () => {
    setIsExtracting(true);
    setStatusMessage({
      type: 'info',
      text: `Scanning ${textbookTitle || `${selectedClass} ${selectedSubject} Textbook`} and extracting ${extractCount} unique questions into your non-repeating Question Bank...`,
    });

    try {
      let createdResource: PaperRecord | undefined = undefined;

      // 1. If user uploaded a PDF file, Google Drive URL, or custom text, also save it to /api/attached-resources so it appears in Books
      if (attachedFile || driveUrl.trim() || pastedTextbookContent.trim()) {
        try {
          const attachRes = await fetch('/api/attached-resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title:
                textbookTitle.trim() ||
                `Official TIE ${selectedClass} ${selectedSubject} Textbook`,
              form: selectedClass,
              subject: selectedSubject,
              year: new Date().getFullYear().toString(),
              category: 'TIE Book',
              paperUrl: driveUrl.trim() || null,
              isBook: true,
              isSyllabus: false,
              customContent: pastedTextbookContent.trim() || undefined,
              attachedFileName: attachedFile?.fileName,
              attachedFileMimeType: attachedFile?.mimeType,
              attachedFileBase64: attachedFile?.base64Data,
            }),
          });
          if (attachRes.ok) {
            const attachData = await attachRes.json();
            if (attachData.resource) {
              createdResource = attachData.resource as PaperRecord;
            }
          }
        } catch {
          // continue to extraction
        }
      }

      // 2. Call the Question Bank Extraction Endpoint
      const existingSigs = storedQuestions.map((q) => q.signature).slice(0, 400);
      const response = await fetch('/api/question-bank/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cls: selectedClass,
          subject: selectedSubject,
          topic: selectedTopic,
          textbookTitle:
            textbookTitle.trim() ||
            `Official TIE ${selectedClass} ${selectedSubject} Student's Textbook`,
          paperUrl: driveUrl.trim() || null,
          customContent: pastedTextbookContent.trim() || '',
          attachedFileBase64: attachedFile?.base64Data,
          attachedFileMimeType: attachedFile?.mimeType,
          attachedFileName: attachedFile?.fileName,
          count: extractCount,
          excludeSignatures: existingSigs,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const extractedList = Array.isArray(data.questions) ? data.questions : [];
        const { addedCount, totalInSubject } = addQuestionsToStoredBank(
          extractedList.map((q: Record<string, unknown>) => ({
            cls: selectedClass,
            subject: selectedSubject,
            topic: String(q.topic || (selectedTopic !== 'ALL' ? selectedTopic : selectedSubject)),
            subTopic: q.subTopic ? String(q.subTopic) : undefined,
            question: String(q.question || ''),
            options: Array.isArray(q.options) ? (q.options as string[]) : [],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: String(q.explanation || ''),
            hint: q.hint ? String(q.hint) : undefined,
            sourceRef: String(
              q.sourceRef ||
                `📘 ${textbookTitle.trim() || `TIE ${selectedClass} ${selectedSubject} Book`}`
            ),
            textbookTitle:
              textbookTitle.trim() || `Official TIE ${selectedClass} ${selectedSubject} Book`,
          }))
        );

        setRefreshTick((t) => t + 1);
        setStatusMessage({
          type: 'success',
          text: `✅ Extracted & stored ${addedCount > 0 ? addedCount : extractedList.length} textbook questions for ${selectedClass} ${selectedSubject}! Total stored in bank: ${totalInSubject} non-repeating questions.`,
        });

        onQuestionsExtracted?.({
          cls: selectedClass,
          subject: selectedSubject,
          topic: selectedTopic,
          textbookTitle:
            textbookTitle.trim() || `Official TIE ${selectedClass} ${selectedSubject} Book`,
          addedCount: addedCount > 0 ? addedCount : extractedList.length,
          totalStored: totalInSubject,
          newResource: createdResource,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Could not reach server extraction endpoint. Please check your connection and try again.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to extract textbook questions. Try uploading a smaller PDF or pasting chapter text.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-4 sm:p-6 text-slate-100 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Non-Repeating Textbook Question Bank
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Game #1 (3D Treasure Hunt) + Daily Quiz Synced
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Upload Textbook &amp; Extract Questions ({selectedClass} • {selectedSubject})
            </h2>
            <p className="text-xs text-slate-400">
              Upload your Mathematics, Additional Mathematics, or any TIE textbook PDF/link to extract and permanently store questions. Students will never see repeated questions in Game #1 or the Quiz section!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets for Uploaded TIE Question Banks */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
            ⚡ Quick Select: Uploaded TIE Textbook Question Banks
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { cls: 'Form 2', sub: 'Biology', label: '🧬 Form 2 Biology' },
              { cls: 'Form 2', sub: 'Chemistry', label: '🧪 Form 2 Chemistry' },
              { cls: 'Form 2', sub: 'Geography', label: '🌍 Form 2 Geography' },
              { cls: 'Form 1', sub: 'Computer Science', label: '💻 Form 1 Computer Science' },
              { cls: 'Form 1', sub: 'Basic Mathematics', label: '📘 Form 1 Basic Mathematics' },
              { cls: 'Form 1', sub: 'Additional Mathematics', label: '📐 Form 1 Additional Mathematics' },
              { cls: 'Form 2', sub: 'Basic Mathematics', label: '📘 Form 2 Basic Math' },
              { cls: 'Form 2', sub: 'Additional Mathematics', label: '📐 Form 2 Additional Math' },
              { cls: 'Form 3', sub: 'Basic Mathematics', label: '📘 Form 3 Basic Math' },
              { cls: 'Form 3', sub: 'Additional Mathematics', label: '📐 Form 3 Additional Math' },
              { cls: 'Form 4', sub: 'Basic Mathematics', label: '📘 Form 4 Basic Math' },
              { cls: 'Form 4', sub: 'Additional Mathematics', label: '📐 Form 4 Additional Math' },
            ].map((preset) => {
              const isSelected =
                selectedClass === preset.cls && selectedSubject === preset.sub;
              return (
                <button
                  key={`${preset.cls}-${preset.sub}`}
                  onClick={() => handleSelectQuickPreset(preset.cls, preset.sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Question Bank & Seen-Tracker Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 tabular-nums">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
            <div className="text-[11px] font-bold text-slate-400">Stored in Bank</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {stats.storedFromTextbooksCount + 25} Qns
            </div>
            <div className="text-[10px] text-slate-400">
              ({stats.storedFromTextbooksCount} extracted + 25 TIE core)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
            <div className="text-[11px] font-bold text-slate-400">Unseen Remaining</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {stats.unseenInStoredBankCount} Qns
            </div>
            <div className="text-[10px] text-emerald-300/80">Ready for next Game / Quiz</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/30">
            <div className="text-[11px] font-bold text-slate-400">Played / Solved</div>
            <div className="text-xl font-black text-sky-400 mt-0.5">
              {stats.seenByStudentCount} Qns
            </div>
            <div className="text-[10px] text-slate-400">Excluded from repeating</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-purple-500/30 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400">Bank Rotations</div>
              <div className="text-lg font-black text-purple-300">
                Cycle #{stats.cyclesCompleted + 1}
              </div>
            </div>
            <button
              onClick={() => {
                resetSeenQuestionsForClassSubject(selectedClass, selectedSubject, false);
                setRefreshTick((t) => t + 1);
                setStatusMessage({
                  type: 'info',
                  text: `Reset seen-questions history for ${selectedClass} ${selectedSubject}. All stored questions are now marked Unseen!`,
                });
              }}
              className="mt-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Seen History</span>
            </button>
          </div>
        </div>

        {/* Form Selectors: Class, Subject, Chapter/Topic, Textbook Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">1. Class Level</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const nextCls = e.target.value;
                setSelectedClass(nextCls);
                setSelectedTopic('ALL');
                setTextbookTitle(`Official TIE ${nextCls} ${selectedSubject} Student's Textbook`);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">2. Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const nextSub = e.target.value;
                setSelectedSubject(nextSub);
                setSelectedTopic('ALL');
                setTextbookTitle(`Official TIE ${selectedClass} ${nextSub} Student's Textbook`);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
            >
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              3. Target Chapter / Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold"
            >
              <option value="ALL">All Textbook Chapters ({selectedSubject})</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Textbook PDF / Google Drive Link / Paste Textbook Exercises */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-black text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Textbook Source to Extract Questions From</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">Questions per Extraction:</span>
              {[15, 25, 35].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setExtractCount(cnt)}
                  className={`px-2.5 py-1 rounded-lg font-black cursor-pointer ${
                    extractCount === cnt
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  +{cnt} Qns
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">
                Textbook Title / Edition
              </label>
              <input
                type="text"
                value={textbookTitle}
                onChange={(e) => setTextbookTitle(e.target.value)}
                placeholder={`Official TIE ${selectedClass} ${selectedSubject} Textbook`}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Google Drive Textbook PDF Link (Optional)</span>
              </label>
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 font-medium"
              />
            </div>
          </div>

          {/* Direct PDF / Text File Upload Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-amber-400/50 hover:border-amber-400 bg-slate-900/70 cursor-pointer transition-colors text-center">
              <FileUp className="w-6 h-6 text-amber-400 mb-1.5" />
              <span className="text-xs font-black text-white">
                {attachedFile
                  ? `📄 Attached: ${attachedFile.fileName} (${attachedFile.sizeKb} KB)`
                  : 'Click to Upload Textbook PDF or .TXT File'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Supports TIE Student&apos;s Books, Additional Math Books &amp; Exercise PDFs
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div>
              <textarea
                rows={3}
                value={pastedTextbookContent}
                onChange={(e) => setPastedTextbookContent(e.target.value)}
                placeholder="Or paste textbook chapter notes, worked examples, or exercise problems here to extract questions directly from them..."
                className="w-full h-full px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-bold border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                  : 'bg-sky-950/80 border-sky-400 text-sky-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-400">
              💡 Tip: You can click <strong>Extract &amp; Store</strong> multiple times for different chapters to build a 100+ question bank!
            </div>
            <button
              type="button"
              disabled={isExtracting}
              onClick={handleExtractAndStoreQuestions}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Textbook Questions...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    ⚡ Extract &amp; Store +{extractCount} Questions in Bank
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stored Questions Preview List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Stored Textbook Questions for {selectedClass} • {selectedSubject} (
                {storedQuestions.length} Extracted + Built-in TIE Bank)
              </span>
            </h3>
            {storedQuestions.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-400">
                ✓ Permanently Saved &amp; Non-Repeating
              </span>
            )}
          </div>

          {storedQuestions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between gap-3">
              <span>
                Currently using the built-in TIE {selectedClass} {selectedSubject} Textbook Bank (25+ level-specific questions). Upload your textbook PDF above or click <strong>&ldquo;⚡ Extract &amp; Store +{extractCount} Questions in Bank&rdquo;</strong> to extract and store more questions!
              </span>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {storedQuestions.slice(0, 30).map((q, idx) => {
                const isSeen = seenSet.has(q.signature);
                const qKey = q.id || String(idx);
                const isRevealed = Boolean(revealedSolutions[qKey]);
                const diagramSpec = getQuestionDiagramSvg(
                  q.question,
                  q.topic,
                  undefined,
                  selectedSubject
                );
                const finalAns =
                  Array.isArray(q.options) && q.options[q.correctIndex]
                    ? q.options[q.correctIndex]
                    : '';

                return (
                  <div
                    key={qKey}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-black text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {q.topic}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({q.textbookTitle})
                          </span>
                        </div>
                        <div className="text-slate-100 font-semibold leading-relaxed">
                          <MathText as="div" text={q.question} />
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                          isSeen
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isSeen ? '✓ Played' : '★ Unseen'}
                      </span>
                    </div>

                    {diagramSpec && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-300 space-y-1">
                        <div className="text-[10px] font-black text-slate-700 flex items-center justify-between">
                          <span>📐 {diagramSpec.title}</span>
                          <span className="text-[10px] text-slate-500">SVG Figure</span>
                        </div>
                        <div
                          className="w-full overflow-x-auto"
                          dangerouslySetInnerHTML={{ __html: diagramSpec.svgHtml }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedSolutions((prev) => ({
                            ...prev,
                            [qKey]: !prev[qKey],
                          }))
                        }
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] cursor-pointer"
                      >
                        {isRevealed ? '🙈 Hide Solution' : '💡 Show Solution'}
                      </button>
                    </div>

                    {isRevealed && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-100 space-y-1.5">
                        {finalAns && (
                          <div className="font-black text-emerald-300">
                            Final Answer: <MathText text={finalAns} />
                          </div>
                        )}
                        <div className="text-emerald-100/90 leading-relaxed">
                          <MathText as="div" text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Questions answered in Game #1 or Quiz Section are automatically marked as seen so they never repeat!
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer"
          >
            Done &amp; Return →
          </button>
        </div>
      </div>
    </div>
  );
};
