import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Edit3,
  Eye,
  EyeOff,
  FolderOpen,
  Grid,
  Image as ImageIcon,
  Layers,
  Minus,
  Palette,
  Pencil,
  Play,
  Plus,
  Save,
  Search,
  Shuffle,
  Sliders,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { PaperRecord, TIE_CURRICULUM_SUBJECTS } from '../../data/curriculumData';
import {
  clampAndValidateCustomization,
  ClassroomCreationOption,
  ClassroomGameCustomization,
  ClassroomGameQuestion,
  ClassroomGameSessionResult,
  ClassroomQuestionDifficulty,
  ClassroomQuestionType,
  createDefaultCustomization,
  deleteSavedTeacherGameFromStorage,
  filterQuestionBank,
  getAvailableSubjectsForClass,
  getDistinctBankSubTopics,
  getDistinctBankTopics,
  getUnifiedElimikaQuestionBank,
  isDuplicateInGameRoster,
  loadSavedGameResults,
  loadSavedTeacherGames,
  MATH_NOTATION_SNIPPETS,
  normalizeClassroomQuestionSignature,
  PLAY_CLASSES,
  QuestionBankFilterCriteria,
  SavedTeacherClassroomGame,
  saveTeacherGameToStorage,
  validateCustomQuestionInput,
} from '../../games/teacherClassroomGameEngine';
import { MathText } from '../../utils/mathRenderer';
import { ELIMIKA_BATTLE_THEMES, getElimikaBattleTheme } from '../../games/elimikaBattleThemes';
import { ProjectorClassroomGameBoard } from './ProjectorClassroomGameBoard';

export interface TeacherClassroomGameStudioProps {
  initialClass?: string;
  initialSubject?: string;
  initialTopic?: string;
  initialCreationOption?: ClassroomCreationOption;
  allPapers?: PaperRecord[];
  onBackToGamesHub: () => void;
}

type AddQuestionsTab = 'bank' | 'custom' | 'ai';

const TYPE_LABEL: Record<ClassroomQuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  short_answer: 'Short Answer',
};

const SOURCE_LABEL: Record<'bank' | 'custom' | 'ai', string> = {
  bank: 'Bank',
  custom: 'Custom',
  ai: 'AI',
};

const POINTS_PRESETS = [10, 15, 20, 25, 30];
const GRID_SIZE_PRESETS = [4, 8, 12, 16, 20, 24];
const TIMER_PRESETS = [15, 30, 45, 60, 90];

function getCorrectAnswerDisplay(q: ClassroomGameQuestion): string {
  if (q.questionType === 'short_answer') {
    return q.shortAnswer || q.options[0] || '';
  }
  if (q.questionType === 'true_false') {
    return q.correctIndex === 1 ? 'False' : 'True';
  }
  return q.options[q.correctIndex] || q.shortAnswer || q.options[0] || '';
}

function createEmptyDraft(cls: string, subject: string, topic: string) {
  return {
    editingId: null as string | null,
    questionType: 'multiple_choice' as ClassroomQuestionType,
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    shortAnswer: '',
    explanation: '',
    hint: '',
    points: 15,
    difficulty: 'Medium' as ClassroomQuestionDifficulty,
    topic: topic && topic !== 'ALL' ? topic : '',
    subTopic: '',
    imageUrl: '',
    cls,
    subject,
  };
}

export const TeacherClassroomGameStudio: React.FC<TeacherClassroomGameStudioProps> = ({
  initialClass = 'Form 4',
  initialSubject = 'Basic Mathematics',
  initialTopic = 'ALL',
  initialCreationOption = 'bank',
  allPapers,
  onBackToGamesHub,
}) => {
  // Core Game Metadata
  const [gameId, setGameId] = useState<string>(() => `game-${Date.now()}`);
  const [gameTitle, setGameTitle] = useState<string>(() => {
    const cleanTopic = initialTopic && initialTopic !== 'ALL' ? ` — ${initialTopic}` : '';
    return `${initialClass} ${initialSubject}${cleanTopic}`;
  });
  const [gameClass, setGameClass] = useState<string>(initialClass || 'Form 4');
  const [gameSubject, setGameSubject] = useState<string>(initialSubject || 'Basic Mathematics');
  const [gameTopic, setGameTopic] = useState<string>(
    initialTopic && initialTopic !== 'ALL' ? initialTopic : ''
  );

  // Game Question Roster (strictly separate from the Question Bank)
  const [questions, setQuestions] = useState<ClassroomGameQuestion[]>([]);

  // Game Customization (used by the clean Baamboozle-style Play Setup Modal)
  const [customization, setCustomization] = useState<ClassroomGameCustomization>(() =>
    createDefaultCustomization(12)
  );

  // Clean Preview Page Controls
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(false);
  const [revealedCardIds, setRevealedCardIds] = useState<Record<string, boolean>>({});
  const [editingDetailsOpen, setEditingDetailsOpen] = useState<boolean>(false);

  // Focused Modals (progressive disclosure — only one open at a time)
  const [playModalOpen, setPlayModalOpen] = useState<boolean>(false);
  const [playOptionsExpanded, setPlayOptionsExpanded] = useState<boolean>(false);
  const [playThemesExpanded, setPlayThemesExpanded] = useState<boolean>(false);
  const [renameTeamsOpen, setRenameTeamsOpen] = useState<boolean>(false);
  const [isPlayingBoard, setIsPlayingBoard] = useState<boolean>(false);

  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [addModalTab, setAddModalTab] = useState<AddQuestionsTab>(
    initialCreationOption === 'custom'
      ? 'custom'
      : initialCreationOption === 'mix'
      ? 'ai'
      : 'bank'
  );

  const [libraryModalOpen, setLibraryModalOpen] = useState<boolean>(false);
  const [libraryTab, setLibraryTab] = useState<'games' | 'results'>('games');

  // Saved Games & Past Results
  const [savedGames, setSavedGames] = useState<SavedTeacherClassroomGame[]>(() =>
    loadSavedTeacherGames()
  );
  const [savedResults, setSavedResults] = useState<ClassroomGameSessionResult[]>(() =>
    loadSavedGameResults()
  );

  // Toast feedback
  const [toast, setToast] = useState<{ text: string; tone: 'success' | 'error' | 'info' } | null>(
    null
  );
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (text: string, tone: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, tone });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Sync saved games & past results from backend on mount
  useEffect(() => {
    let active = true;
    fetch('/api/classroom-games/saved')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data.games)) return;
        setSavedGames((prev) => {
          const map = new Map<string, SavedTeacherClassroomGame>();
          [...data.games, ...prev].forEach((g: SavedTeacherClassroomGame) => {
            if (g && g.id && !map.has(g.id)) map.set(g.id, g);
          });
          return Array.from(map.values());
        });
      })
      .catch(() => {});

    fetch('/api/classroom-games/results')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data.results)) return;
        setSavedResults((prev) => {
          const map = new Map<string, ClassroomGameSessionResult>();
          [...data.results, ...prev].forEach((r: ClassroomGameSessionResult) => {
            if (r && r.id && !map.has(r.id)) map.set(r.id, r);
          });
          return Array.from(map.values());
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Unified Elimika Question Bank (strictly read-only repository)
  const fullQuestionBank = useMemo(() => getUnifiedElimikaQuestionBank(), []);

  // Question Bank Filter State
  const [bankFilter, setBankFilter] = useState<QuestionBankFilterCriteria>({
    cls: initialClass || 'Form 4',
    subject: initialSubject || 'Basic Mathematics',
    topic: initialTopic && initialTopic !== 'ALL' ? initialTopic : 'ALL',
    subTopic: 'ALL',
    difficulty: 'ALL',
    questionType: 'ALL',
    searchQuery: '',
  });
  const [bankPickCount, setBankPickCount] = useState<number>(8);
  const [previewBankId, setPreviewBankId] = useState<string | null>(null);

  const bankSubjectsForClass = useMemo(() => {
    if (bankFilter.cls === 'ALL') {
      const allSubs = new Set<string>();
      Object.values(TIE_CURRICULUM_SUBJECTS).forEach((arr) => arr.forEach((s) => allSubs.add(s)));
      return Array.from(allSubs).sort();
    }
    return (
      getAvailableSubjectsForClass(bankFilter.cls, allPapers) ||
      TIE_CURRICULUM_SUBJECTS[bankFilter.cls] || ['Basic Mathematics']
    );
  }, [bankFilter.cls, allPapers]);

  const gameSubjectsForClass = useMemo(
    () =>
      getAvailableSubjectsForClass(gameClass, allPapers) ||
      TIE_CURRICULUM_SUBJECTS[gameClass] || ['Basic Mathematics'],
    [gameClass, allPapers]
  );

  const bankTopics = useMemo(
    () => getDistinctBankTopics(fullQuestionBank, bankFilter.cls, bankFilter.subject, allPapers),
    [fullQuestionBank, bankFilter.cls, bankFilter.subject, allPapers]
  );

  const bankSubTopics = useMemo(
    () =>
      getDistinctBankSubTopics(
        fullQuestionBank,
        bankFilter.cls,
        bankFilter.subject,
        bankFilter.topic
      ),
    [fullQuestionBank, bankFilter.cls, bankFilter.subject, bankFilter.topic]
  );

  const filteredBankQuestions = useMemo(
    () => filterQuestionBank(fullQuestionBank, bankFilter),
    [fullQuestionBank, bankFilter]
  );

  // Custom Question Draft State
  const [draft, setDraft] = useState(() => createEmptyDraft(gameClass, gameSubject, gameTopic));
  const [mathToolbarOpen, setMathToolbarOpen] = useState<boolean>(false);
  const [draftExtraOpen, setDraftExtraOpen] = useState<boolean>(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Question Generator State (Option 3 Mix)
  const [aiTopic, setAiTopic] = useState<string>(
    initialTopic && initialTopic !== 'ALL' ? initialTopic : ''
  );
  const [aiDifficulty, setAiDifficulty] = useState<'Mixed' | ClassroomQuestionDifficulty>('Mixed');
  const [aiQuestionType, setAiQuestionType] = useState<'mixed' | ClassroomQuestionType>('mixed');
  const [aiCount, setAiCount] = useState<number>(5);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiGenerated, setAiGenerated] = useState<ClassroomGameQuestion[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  // Keep selected questionCount strictly <= available questions (accounting for difficulty filter)
  const eligibleQuestionsForPlay = useMemo(() => {
    if (customization.difficultyFilter === 'Mixed') return questions;
    const filtered = questions.filter((q) => q.difficulty === customization.difficultyFilter);
    return filtered.length > 0 ? filtered : questions;
  }, [questions, customization.difficultyFilter]);

  const maxAvailableToPlay = eligibleQuestionsForPlay.length;

  useEffect(() => {
    if (maxAvailableToPlay === 0) return;
    setCustomization((prev) => {
      if (prev.questionCount > maxAvailableToPlay || prev.questionCount < 1) {
        return clampAndValidateCustomization(
          { ...prev, questionCount: Math.min(prev.questionCount || 12, maxAvailableToPlay) },
          maxAvailableToPlay
        );
      }
      return prev;
    });
  }, [maxAvailableToPlay]);

  // Helper: derive creationMode automatically from sources in roster
  const derivedCreationMode: ClassroomCreationOption = useMemo(() => {
    const sources = new Set(questions.map((q) => q.source));
    if (sources.size > 1 || sources.has('ai')) return 'mix';
    if (sources.has('custom')) return 'custom';
    if (sources.has('bank')) return 'bank';
    return initialCreationOption;
  }, [questions, initialCreationOption]);

  // Add questions safely with duplicate protection
  const addUniqueQuestionsToGame = (incoming: ClassroomGameQuestion[], label = 'question') => {
    let addedCount = 0;
    let duplicateCount = 0;

    setQuestions((prev) => {
      const next = [...prev];
      for (const item of incoming) {
        if (isDuplicateInGameRoster(item, next)) {
          duplicateCount += 1;
          continue;
        }
        next.push(item);
        addedCount += 1;
      }
      return next;
    });

    if (addedCount > 0) {
      showToast(
        `Added ${addedCount} ${label}${addedCount === 1 ? '' : 's'}${
          duplicateCount > 0 ? ` (${duplicateCount} duplicate skipped)` : ''
        }.`,
        'success'
      );
    } else if (duplicateCount > 0) {
      showToast('Already in your game — duplicates are automatically skipped.', 'info');
    }
  };

  const handleToggleBankQuestion = (item: ClassroomGameQuestion) => {
    const exists = isDuplicateInGameRoster(item, questions);
    if (exists) {
      setQuestions((prev) =>
        prev.filter((q) => q.id !== item.id && q.signature !== item.signature)
      );
      showToast('Removed from game.', 'info');
    } else {
      addUniqueQuestionsToGame([item], 'bank question');
    }
  };

  const handleSelectSpecificBankCount = () => {
    const notAdded = filteredBankQuestions.filter((q) => !isDuplicateInGameRoster(q, questions));
    const count = Math.max(1, Math.min(notAdded.length, bankPickCount || 1));
    if (notAdded.length === 0) {
      showToast('All matching questions are already in your game.', 'info');
      return;
    }
    addUniqueQuestionsToGame(notAdded.slice(0, count), 'bank question');
  };

  const handleRandomSelectFromBank = () => {
    const notAdded = filteredBankQuestions.filter((q) => !isDuplicateInGameRoster(q, questions));
    if (notAdded.length === 0) {
      showToast('No new matching questions left to randomly pick.', 'info');
      return;
    }
    const pool = [...notAdded];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count = Math.max(1, Math.min(pool.length, bankPickCount || 8));
    addUniqueQuestionsToGame(pool.slice(0, count), 'random question');
  };

  const handleSelectAllMatchingBank = () => {
    const notAdded = filteredBankQuestions.filter((q) => !isDuplicateInGameRoster(q, questions));
    if (notAdded.length === 0) {
      showToast('All matching questions are already added.', 'info');
      return;
    }
    addUniqueQuestionsToGame(notAdded, 'bank question');
  };

  // Quick-fill 12 questions for empty state convenience
  const handleQuickFillFromBank = () => {
    const matching = filterQuestionBank(fullQuestionBank, {
      cls: gameClass,
      subject: gameSubject,
      topic: gameTopic || 'ALL',
      subTopic: 'ALL',
      difficulty: 'ALL',
      questionType: 'ALL',
      searchQuery: '',
    });
    const sourcePool = matching.length > 0 ? matching : fullQuestionBank;
    const pool = [...sourcePool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = pool.slice(0, Math.min(12, pool.length));
    addUniqueQuestionsToGame(picked, 'question');
    setCustomization((prev) =>
      clampAndValidateCustomization({ ...prev, questionCount: picked.length }, picked.length)
    );
  };

  // Custom Question Authoring Handlers
  const handleInsertMathSnippet = (snippet: string) => {
    const textarea = questionInputRef.current;
    if (!textarea) {
      setDraft((d) => ({ ...d, question: `${d.question}${d.question ? ' ' : ''}${snippet}` }));
      return;
    }
    const start = textarea.selectionStart ?? draft.question.length;
    const end = textarea.selectionEnd ?? draft.question.length;
    const updated = draft.question.slice(0, start) + snippet + draft.question.slice(end);
    setDraft((d) => ({ ...d, question: updated }));
    window.requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + snippet.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleDraftImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setDraftError('Please select a valid image file.');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setDraftError('Image must be smaller than 2.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraft((d) => ({ ...d, imageUrl: reader.result as string }));
        setDraftError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomQuestion = (keepOpenForAnother: boolean) => {
    setDraftError(null);
    const cleanedOptions =
      draft.questionType === 'true_false'
        ? ['True', 'False']
        : draft.questionType === 'short_answer'
        ? [draft.shortAnswer.trim()]
        : draft.options.map((o) => o.trim()).filter(Boolean);

    const validation = validateCustomQuestionInput({
      question: draft.question,
      questionType: draft.questionType,
      options:
        draft.questionType === 'multiple_choice'
          ? draft.options
          : cleanedOptions,
      correctIndex:
        draft.questionType === 'short_answer' ? 0 : draft.correctIndex,
      shortAnswer:
        draft.questionType === 'true_false'
          ? draft.correctIndex === 1
            ? 'False'
            : 'True'
          : draft.questionType === 'multiple_choice'
          ? draft.options[draft.correctIndex]?.trim() || ''
          : draft.shortAnswer.trim(),
      points: draft.points,
    });

    if (!validation.valid) {
      setDraftError(validation.error || 'Please complete all required fields.');
      return;
    }

    // Re-map correctIndex cleanly when blank options are stripped in MCQ
    let finalOptions = cleanedOptions;
    let finalCorrectIndex = draft.questionType === 'short_answer' ? 0 : draft.correctIndex;
    if (draft.questionType === 'multiple_choice') {
      const targetAnswer = (draft.options[draft.correctIndex] || '').trim();
      finalOptions = draft.options.map((o) => o.trim()).filter(Boolean);
      const foundIdx = finalOptions.findIndex((o) => o === targetAnswer);
      finalCorrectIndex = foundIdx >= 0 ? foundIdx : 0;
    }

    const sig = normalizeClassroomQuestionSignature(draft.question.trim(), draft.questionType);
    const newQuestion: ClassroomGameQuestion = {
      id: draft.editingId || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      signature: sig,
      source: 'custom',
      questionType: draft.questionType,
      subject: gameSubject,
      cls: gameClass,
      topic: draft.topic.trim() || gameTopic || gameSubject,
      subTopic: draft.subTopic.trim() || 'Custom Question',
      difficulty: draft.difficulty,
      question: draft.question.trim(),
      options: finalOptions,
      correctIndex: finalCorrectIndex,
      shortAnswer:
        draft.questionType === 'short_answer'
          ? draft.shortAnswer.trim()
          : finalOptions[finalCorrectIndex] || '',
      explanation: draft.explanation.trim(),
      hint: draft.hint.trim() || undefined,
      points: Math.max(1, Math.min(1000, Math.round(draft.points || 15))),
      imageUrl: draft.imageUrl.trim() || undefined,
      sourceRef: 'Teacher Custom Question',
    };

    if (draft.editingId) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === draft.editingId ? { ...newQuestion, source: q.source } : q))
      );
      showToast('Question updated.', 'success');
      setDraft(createEmptyDraft(gameClass, gameSubject, gameTopic));
      setAddModalOpen(false);
      return;
    }

    if (isDuplicateInGameRoster(newQuestion, questions)) {
      setDraftError('This exact question is already in your game.');
      return;
    }

    setQuestions((prev) => [...prev, newQuestion]);
    showToast('Question added to your game.', 'success');
    setDraft(createEmptyDraft(gameClass, gameSubject, gameTopic));
    setDraftExtraOpen(false);
    if (!keepOpenForAnother) {
      setAddModalOpen(false);
    }
  };

  const handleOpenEditQuestion = (q: ClassroomGameQuestion) => {
    setDraft({
      editingId: q.id,
      questionType: q.questionType,
      question: q.question,
      options:
        q.questionType === 'multiple_choice'
          ? q.options.length >= 2
            ? [...q.options]
            : [...q.options, '', ''].slice(0, 4)
          : ['', '', '', ''],
      correctIndex: q.correctIndex,
      shortAnswer: q.shortAnswer || getCorrectAnswerDisplay(q),
      explanation: q.explanation || '',
      hint: q.hint || '',
      points: q.points || 15,
      difficulty: q.difficulty,
      topic: q.topic || '',
      subTopic: q.subTopic || '',
      imageUrl: q.imageUrl || '',
      cls: q.cls || gameClass,
      subject: q.subject || gameSubject,
    });
    setDraftError(null);
    setAddModalTab('custom');
    setAddModalOpen(true);
  };

  const handleMoveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    showToast('Question deleted.', 'info');
  };

  // AI Question Generation Handler
  const handleGenerateAiQuestions = async () => {
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await fetch('/api/classroom-games/generate-ai-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cls: gameClass,
          subject: gameSubject,
          topic: aiTopic.trim() || gameTopic || gameSubject,
          difficulty: aiDifficulty,
          questionType: aiQuestionType,
          count: Math.max(1, Math.min(12, aiCount)),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Could not generate questions right now.');
      }
      const list: ClassroomGameQuestion[] = Array.isArray(data?.questions) ? data.questions : [];
      if (list.length === 0) {
        setAiError('No questions returned. Try a more specific topic.');
      } else {
        setAiGenerated(list);
      }
    } catch (err: any) {
      setAiError(err?.message || 'AI generation failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save / Load / Delete Games
  const handleSaveCurrentGame = () => {
    if (questions.length === 0) {
      showToast('Add at least one question before saving.', 'error');
      return;
    }
    const cleanTitle = gameTitle.trim() || `${gameClass} ${gameSubject} Game`;
    const validatedCustom = clampAndValidateCustomization(customization, questions.length);
    const now = new Date().toISOString();
    const existing = savedGames.find((g) => g.id === gameId);
    const payload: SavedTeacherClassroomGame = {
      id: gameId,
      title: cleanTitle,
      subject: gameSubject,
      cls: gameClass,
      topic: gameTopic || 'General',
      creationMode: derivedCreationMode,
      questions,
      customization: validatedCustom,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    const updatedList = saveTeacherGameToStorage(payload);
    setSavedGames(updatedList);
    setGameTitle(cleanTitle);
    showToast(`Saved "${cleanTitle}" (${questions.length} questions).`, 'success');
  };

  const handleLoadSavedGame = (saved: SavedTeacherClassroomGame, openPlayDirectly = false) => {
    setGameId(saved.id);
    setGameTitle(saved.title);
    setGameClass(saved.cls);
    setGameSubject(saved.subject);
    setGameTopic(saved.topic === 'General' ? '' : saved.topic);
    setQuestions(saved.questions || []);
    setCustomization(
      clampAndValidateCustomization(
        saved.customization || createDefaultCustomization(saved.questions.length),
        saved.questions.length
      )
    );
    setRevealedCardIds({});
    setLibraryModalOpen(false);
    if (openPlayDirectly && saved.questions.length > 0) {
      setPlayModalOpen(true);
    } else {
      showToast(`Loaded "${saved.title}".`, 'success');
    }
  };

  const handleDeleteSavedGame = (id: string) => {
    const updated = deleteSavedTeacherGameFromStorage(id);
    setSavedGames(updated);
    showToast('Saved game deleted.', 'info');
  };

  const handleStartNewBlankGame = () => {
    setGameId(`game-${Date.now()}`);
    setGameTitle(`${gameClass} ${gameSubject} Game`);
    setQuestions([]);
    setRevealedCardIds({});
    setCustomization(createDefaultCustomization(12));
    setLibraryModalOpen(false);
    showToast('Started a fresh game.', 'info');
  };

  // Launch Play Board
  const handleOpenPlayModal = () => {
    if (questions.length === 0) {
      showToast('Add at least 1 question first to play.', 'error');
      setAddModalTab('bank');
      setAddModalOpen(true);
      return;
    }
    setCustomization((prev) =>
      clampAndValidateCustomization(prev, Math.max(1, eligibleQuestionsForPlay.length))
    );
    setPlayOptionsExpanded(false);
    setPlayThemesExpanded(false);
    setRenameTeamsOpen(false);
    setPlayModalOpen(true);
  };

  const handleLaunchProjectorBoard = () => {
    const safeCustom = clampAndValidateCustomization(
      customization,
      Math.max(1, eligibleQuestionsForPlay.length)
    );
    setCustomization(safeCustom);
    setPlayModalOpen(false);
    setIsPlayingBoard(true);
  };

  // Toggle single card answer preview
  const toggleCardAnswer = (id: string) => {
    setRevealedCardIds((prev) => {
      const currentlyShown = showAllAnswers ? prev[id] !== false : Boolean(prev[id]);
      return { ...prev, [id]: !currentlyShown };
    });
  };

  const handleToggleShowAllAnswers = () => {
    const next = !showAllAnswers;
    setShowAllAnswers(next);
    setRevealedCardIds({});
  };

  const openAddQuestionsAt = (tab: AddQuestionsTab) => {
    if (tab === 'custom') {
      setDraft(createEmptyDraft(gameClass, gameSubject, gameTopic));
      setDraftError(null);
    }
    setAddModalTab(tab);
    setAddModalOpen(true);
  };

  // Active Projector Board View
  if (isPlayingBoard) {
    return (
      <ProjectorClassroomGameBoard
        gameId={gameId}
        gameTitle={gameTitle.trim() || `${gameClass} ${gameSubject}`}
        subject={gameSubject}
        cls={gameClass}
        topic={gameTopic || 'General'}
        questions={questions}
        customization={clampAndValidateCustomization(
          customization,
          Math.max(1, eligibleQuestionsForPlay.length)
        )}
        onExitToSetup={() => setIsPlayingBoard(false)}
        onResultSaved={(res) => {
          setSavedResults((prev) => [res, ...prev.filter((r) => r.id !== res.id)]);
        }}
      />
    );
  }

  // Valid Grid Size buttons strictly <= available questions
  const validGridPresets = GRID_SIZE_PRESETS.filter((n) => n < maxAvailableToPlay);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      {/* Compact Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToGamesHub}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0A3D91] dark:hover:text-sky-400 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Games</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Elimika Battle
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setLibraryTab('games');
                setLibraryModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-slate-500" />
              <span>My Games</span>
              {savedGames.length > 0 && (
                <span className="text-slate-400 dark:text-slate-500 tabular-nums">
                  ({savedGames.length})
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveCurrentGame}
              disabled={questions.length === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-45 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#0A3D91] dark:text-sky-400" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPlayModal}
              className="px-4 py-1.5 rounded-xl bg-[#0A3D91] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play</span>
            </button>
          </div>
        </div>
      </header>

      {/* Subtle Floating Toast */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 border ${
              toast.tone === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : toast.tone === 'info'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Main Baamboozle-Simple Two-Column Layout: Left Game Control Card + Right Question Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Clean Game Summary & Primary Actions (Sticky on Desktop) */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
              {/* Game Title & Metadata */}
              {!editingDetailsOpen ? (
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                      {gameTitle || 'Untitled Classroom Game'}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setEditingDetailsOpen(true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                      title="Edit game title, class & subject"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {gameClass} · {gameSubject}
                    {gameTopic ? ` · ${gameTopic}` : ''}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums pt-0.5">
                    {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Game Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingDetailsOpen(false)}
                      className="text-xs font-bold text-[#0A3D91] dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                  <input
                    type="text"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    placeholder="Game title..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      aria-label="Game Class"
                      value={gameClass}
                      onChange={(e) => {
                        const nextCls = e.target.value;
                        setGameClass(nextCls);
                        const subs =
                          getAvailableSubjectsForClass(nextCls, allPapers) ||
                          TIE_CURRICULUM_SUBJECTS[nextCls] || ['Basic Mathematics'];
                        if (!subs.includes(gameSubject)) {
                          setGameSubject(subs[0] || 'Basic Mathematics');
                        }
                        setBankFilter((bf) => ({
                          ...bf,
                          cls: nextCls,
                          subject: subs.includes(bf.subject) ? bf.subject : subs[0] || 'ALL',
                          topic: 'ALL',
                          subTopic: 'ALL',
                        }));
                      }}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      {PLAY_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Game Subject"
                      value={gameSubject}
                      onChange={(e) => {
                        const nextSub = e.target.value;
                        setGameSubject(nextSub);
                        setBankFilter((bf) => ({
                          ...bf,
                          subject: nextSub,
                          topic: 'ALL',
                          subTopic: 'ALL',
                        }));
                      }}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none cursor-pointer truncate"
                    >
                      {gameSubjectsForClass.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={gameTopic}
                    onChange={(e) => setGameTopic(e.target.value)}
                    placeholder="Topic (optional, e.g. Probability)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  />
                </div>
              )}

              {/* Big Primary Play Button */}
              <button
                type="button"
                onClick={handleOpenPlayModal}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0A3D91] hover:bg-blue-800 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Play</span>
              </button>

              {/* Show / Hide Answers Switch (Baamboozle signature simplicity) */}
              <div className="flex items-center justify-between pt-1 pb-1 border-y border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  {showAllAnswers ? (
                    <Eye className="w-4 h-4 text-[#0A3D91] dark:text-sky-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Show Answers</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showAllAnswers}
                  onClick={handleToggleShowAllAnswers}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    showAllAnswers ? 'bg-[#0A3D91]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      showAllAnswers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Clean Add Questions Actions */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Add Questions
                </div>
                <button
                  type="button"
                  onClick={() => openAddQuestionsAt('bank')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Question Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAddQuestionsAt('custom')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#0A3D91] dark:text-sky-400 shrink-0" />
                  <span>Write Question</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAddQuestionsAt('ai')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>AI Question Mix</span>
                </button>
              </div>

              {/* Secondary Utility Row */}
              {questions.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={handleStartNewBlankGame}
                    className="font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    New Game
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLibraryTab('results');
                      setLibraryModalOpen(true);
                    }}
                    className="font-semibold text-slate-500 hover:text-[#0A3D91] dark:hover:text-sky-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Results ({savedResults.length})</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT COLUMN: Question Preview Grid (Click card to reveal answer!) */}
          <section className="lg:col-span-8 xl:col-span-9">
            {questions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center space-y-6">
                <div className="max-w-md mx-auto space-y-2">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Build your classroom game in seconds
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pick questions from the Elimika Question Bank, write your own, or mix in AI questions — then hit Play.
                  </p>
                </div>

                {/* 3 Clear Creation Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
                  <button
                    type="button"
                    onClick={() => openAddQuestionsAt('bank')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0A3D91] dark:hover:border-sky-400 bg-slate-50/70 dark:bg-slate-800/50 transition cursor-pointer space-y-1.5"
                  >
                    <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Question Bank
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Filter by class, subject, topic &amp; difficulty.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAddQuestionsAt('custom')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0A3D91] dark:hover:border-sky-400 bg-slate-50/70 dark:bg-slate-800/50 transition cursor-pointer space-y-1.5"
                  >
                    <Edit3 className="w-5 h-5 text-[#0A3D91] dark:text-sky-400" />
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Create My Own
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      MCQ, True/False &amp; Short Answer with math &amp; images.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAddQuestionsAt('ai')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0A3D91] dark:hover:border-sky-400 bg-slate-50/70 dark:bg-slate-800/50 transition cursor-pointer space-y-1.5"
                  >
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Mix with AI
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Generate topic questions and combine freely.
                    </p>
                  </button>
                </div>

                {/* 1-Click Instant Starter */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleQuickFillFromBank}
                    className="px-5 py-2.5 rounded-xl bg-[#0A3D91] hover:bg-blue-800 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Quick Fill 12 Questions ({gameClass} {gameSubject})</span>
                  </button>

                  {savedGames.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setLibraryTab('games');
                        setLibraryModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      Open Saved Game ({savedGames.length})
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Subtle Hint Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>Tap any question card to preview its answer.</span>
                  <span className="tabular-nums font-medium">
                    {questions.length} cards ready · click Play to launch
                  </span>
                </div>

                {/* Baamboozle-Style Clean Question Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {questions.map((q, idx) => {
                    const isAnswerVisible = showAllAnswers
                      ? revealedCardIds[q.id] !== false
                      : Boolean(revealedCardIds[q.id]);
                    const answerText = getCorrectAnswerDisplay(q);

                    return (
                      <article
                        key={q.id}
                        onClick={() => toggleCardAnswer(q.id)}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition flex flex-col justify-between cursor-pointer overflow-hidden"
                      >
                        {/* Optional Question Image */}
                        {q.imageUrl && (
                          <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                            <img
                              src={q.imageUrl}
                              alt={`Question ${idx + 1}`}
                              className="w-full h-36 object-contain"
                            />
                          </div>
                        )}

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              <span className="tabular-nums">#{idx + 1}</span>
                              <span>
                                {TYPE_LABEL[q.questionType]} · {q.difficulty} · {SOURCE_LABEL[q.source]}
                              </span>
                            </div>

                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                              <MathText as="div" text={q.question} />
                            </div>

                            {/* Compact MCQ Choices Preview */}
                            {q.questionType === 'multiple_choice' && q.options.length > 0 && (
                              <div className="space-y-1 pt-1">
                                {q.options.map((opt, optIdx) => {
                                  const isRight = isAnswerVisible && optIdx === q.correctIndex;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`text-xs flex items-start gap-1.5 ${
                                        isRight
                                          ? 'font-bold text-emerald-700 dark:text-emerald-400'
                                          : 'text-slate-500 dark:text-slate-400'
                                      }`}
                                    >
                                      <span className="font-bold shrink-0">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span className="line-clamp-2">
                                        <MathText text={opt} />
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Answer Reveal Area (Fades in cleanly on card tap or Show Answers switch) */}
                          <div
                            className={`pt-2.5 border-t border-slate-100 dark:border-slate-800 transition-opacity duration-200 ${
                              isAnswerVisible ? 'opacity-100' : 'opacity-0 select-none'
                            }`}
                          >
                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              Answer: <MathText text={answerText} />
                            </div>
                          </div>
                        </div>

                        {/* Clean Card Footer (Points on left, compact edit/reorder/delete on right) */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 tabular-nums">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{q.points} pts</span>
                          </span>

                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveQuestion(idx, -1)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === questions.length - 1}
                              onClick={() => handleMoveQuestion(idx, 1)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(q)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0A3D91] dark:hover:text-sky-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 cursor-pointer"
                              title="Edit question"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {/* Quick "+ Add Question" Card at end of grid */}
                  <button
                    type="button"
                    onClick={() => openAddQuestionsAt('bank')}
                    className="min-h-[180px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0A3D91] dark:hover:border-sky-400 bg-white/60 dark:bg-slate-900/40 hover:bg-blue-50/30 dark:hover:bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-[#0A3D91] dark:hover:text-sky-400 transition cursor-pointer p-6"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm font-bold">Add Questions</span>
                    <span className="text-xs text-slate-400">Bank · Custom · AI</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ==================== SUPER-SIMPLE BAAMBOOZLE-STYLE PLAY SETUP MODAL ==================== */}
      {playModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPlayModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                  {gameTitle || 'Play Classroom Game'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pick teams, choose number of questions, and start.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPlayModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close setup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* 1. TEAMS SELECTOR (2 - 6 Big Tap Buttons) */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                  <Users className="w-4 h-4 text-[#0A3D91] dark:text-sky-400" />
                  <span>Teams</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {[2, 3, 4, 5, 6].map((n) => {
                    const active = customization.teamCount === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setCustomization((prev) =>
                            clampAndValidateCustomization({ ...prev, teamCount: n }, maxAvailableToPlay)
                          )
                        }
                        className={`w-12 h-12 rounded-xl font-extrabold text-base tabular-nums transition cursor-pointer ${
                          active
                            ? 'bg-[#0A3D91] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setRenameTeamsOpen((v) => !v)}
                    className="text-xs font-semibold text-slate-500 hover:text-[#0A3D91] dark:hover:text-sky-400 cursor-pointer"
                  >
                    {renameTeamsOpen ? 'Hide team names' : 'Rename teams'}
                  </button>
                </div>

                {renameTeamsOpen && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                    {Array.from({ length: customization.teamCount }, (_, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={customization.teamNames[idx] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomization((prev) => {
                            const nextNames = [...prev.teamNames];
                            nextNames[idx] = val;
                            return { ...prev, teamNames: nextNames };
                          });
                        }}
                        placeholder={`Team ${idx + 1}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 2. GRID SIZE / NUMBER OF QUESTIONS (Never exceeds available!) */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                  <Grid className="w-4 h-4 text-[#0A3D91] dark:text-sky-400" />
                  <span>Grid Size</span>
                  <span className="text-xs font-medium text-slate-400 tabular-nums">
                    ({maxAvailableToPlay} available)
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {validGridPresets.map((n) => {
                    const active = customization.questionCount === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setCustomization((prev) =>
                            clampAndValidateCustomization(
                              { ...prev, questionCount: n },
                              maxAvailableToPlay
                            )
                          )
                        }
                        className={`min-w-12 h-11 px-3.5 rounded-xl font-extrabold text-sm tabular-nums transition cursor-pointer ${
                          active
                            ? 'bg-[#0A3D91] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      setCustomization((prev) =>
                        clampAndValidateCustomization(
                          { ...prev, questionCount: maxAvailableToPlay },
                          maxAvailableToPlay
                        )
                      )
                    }
                    className={`h-11 px-4 rounded-xl font-extrabold text-sm tabular-nums transition cursor-pointer ${
                      customization.questionCount === maxAvailableToPlay
                        ? 'bg-[#0A3D91] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All ({maxAvailableToPlay})
                  </button>
                </div>

                {/* Compact Exact Stepper */}
                {maxAvailableToPlay > 1 && (
                  <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                    <span>Exact count:</span>
                    <button
                      type="button"
                      disabled={customization.questionCount <= 1}
                      onClick={() =>
                        setCustomization((prev) =>
                          clampAndValidateCustomization(
                            { ...prev, questionCount: prev.questionCount - 1 },
                            maxAvailableToPlay
                          )
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-35 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-slate-800 dark:text-slate-100 w-7 text-center tabular-nums">
                      {customization.questionCount}
                    </span>
                    <button
                      type="button"
                      disabled={customization.questionCount >= maxAvailableToPlay}
                      onClick={() =>
                        setCustomization((prev) =>
                          clampAndValidateCustomization(
                            { ...prev, questionCount: prev.questionCount + 1 },
                            maxAvailableToPlay
                          )
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-35 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* 2B. QUESTION DISPLAY MODE: Answers Only vs Multiple Choice */}
              <div className="text-center space-y-2.5">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                  <BookOpen className="w-4 h-4 text-[#0A3D91] dark:text-sky-400" />
                  <span>Question Mode</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setCustomization((prev) => ({ ...prev, answerDisplayMode: 'answer_only' }))
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      (customization.answerDisplayMode || 'answer_only') === 'answer_only'
                        ? 'bg-[#0A3D91] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Answers Only
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomization((prev) => ({
                        ...prev,
                        answerDisplayMode: 'multiple_choice',
                      }))
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      customization.answerDisplayMode === 'multiple_choice'
                        ? 'bg-[#0A3D91] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Multiple Choice
                  </button>
                </div>
              </div>

              {/* 3. COLLAPSIBLE OPTIONS & THEMES ACCORDIONS (Clean Baamboozle pattern) */}
              <div className="text-center space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlayThemesExpanded((v) => !v);
                      setPlayOptionsExpanded(false);
                    }}
                    className={`px-4 py-2 rounded-xl border text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
                      playThemesExpanded
                        ? 'border-[#0A3D91] bg-blue-50 dark:bg-blue-950/40 text-[#0A3D91] dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-[#0A3D91] dark:text-sky-400" />
                    <span>
                      Theme: {getElimikaBattleTheme(customization.boardTheme).name}
                    </span>
                    {playThemesExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPlayOptionsExpanded((v) => !v);
                      setPlayThemesExpanded(false);
                    }}
                    className={`px-4 py-2 rounded-xl border text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
                      playOptionsExpanded
                        ? 'border-[#0A3D91] bg-blue-50 dark:bg-blue-950/40 text-[#0A3D91] dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-slate-500" />
                    <span>Options</span>
                    {playOptionsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>

                {playThemesExpanded && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left pt-1">
                    {ELIMIKA_BATTLE_THEMES.map((theme) => {
                      const isSelected = (customization.boardTheme || 'numbers') === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() =>
                            setCustomization((prev) => ({ ...prev, boardTheme: theme.id }))
                          }
                          className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-[#0A3D91] bg-blue-50/70 dark:bg-blue-950/30 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.swatchClass} text-white flex items-center justify-center shrink-0 shadow-xs ${
                              theme.id === 'numbers' ? 'text-xs font-black' : 'text-xl'
                            }`}
                          >
                            {theme.previewIcon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {theme.name}
                            </span>
                            {isSelected && (
                              <span className="block text-[10px] font-bold text-[#0A3D91] dark:text-sky-400">
                                Selected
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {playOptionsExpanded && (
                  <div className="text-left rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 divide-y divide-slate-200/80 dark:divide-slate-800">
                    {/* Option Row: Shuffle Questions */}
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Shuffle className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Shuffle Questions
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {customization.questionOrder === 'random'
                              ? 'Questions appear in random order'
                              : 'Questions appear in manual order'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={customization.questionOrder === 'random'}
                        onClick={() =>
                          setCustomization((p) => ({
                            ...p,
                            questionOrder: p.questionOrder === 'random' ? 'manual' : 'random',
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                          customization.questionOrder === 'random'
                            ? 'bg-[#0A3D91]'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            customization.questionOrder === 'random'
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Option Row: Lucky Mystery Boxes */}
                    <div className="px-4 py-3 space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              Lucky Boxes
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Hidden bonus, team point gift, or lose points boxes
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={customization.luckyBoxesEnabled !== false}
                          onClick={() =>
                            setCustomization((p) => ({
                              ...p,
                              luckyBoxesEnabled: p.luckyBoxesEnabled === false,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                            customization.luckyBoxesEnabled !== false
                              ? 'bg-[#0A3D91]'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              customization.luckyBoxesEnabled !== false
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {customization.luckyBoxesEnabled !== false && (
                        <div className="flex items-center gap-1.5 pl-7">
                          {[2, 4, 6].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() =>
                                setCustomization((p) => ({ ...p, luckyBoxCount: cnt }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums cursor-pointer ${
                                (customization.luckyBoxCount ?? 4) === cnt
                                  ? 'bg-[#0A3D91] text-white'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {cnt} Lucky
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Option Row: Timer */}
                    <div className="px-4 py-3 space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              Timer
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Countdown seconds per question
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={customization.timerEnabled}
                          onClick={() =>
                            setCustomization((p) => ({ ...p, timerEnabled: !p.timerEnabled }))
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                            customization.timerEnabled
                              ? 'bg-[#0A3D91]'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              customization.timerEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {customization.timerEnabled && (
                        <div className="flex items-center gap-1.5 pl-7">
                          {TIMER_PRESETS.map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() =>
                                setCustomization((p) => ({ ...p, timerSeconds: sec }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums cursor-pointer ${
                                customization.timerSeconds === sec
                                  ? 'bg-[#0A3D91] text-white'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Option Row: Lose Points */}
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Lose Points
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Allow deducting points on wrong answers
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={customization.allowNegativeDeduction}
                        onClick={() =>
                          setCustomization((p) => ({
                            ...p,
                            allowNegativeDeduction: !p.allowNegativeDeduction,
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                          customization.allowNegativeDeduction
                            ? 'bg-[#0A3D91]'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            customization.allowNegativeDeduction ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Option Row: Show Explanation */}
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Show Explanation
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Display worked solution when answer is revealed
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={customization.showExplanationOnReveal}
                        onClick={() =>
                          setCustomization((p) => ({
                            ...p,
                            showExplanationOnReveal: !p.showExplanationOnReveal,
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                          customization.showExplanationOnReveal
                            ? 'bg-[#0A3D91]'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            customization.showExplanationOnReveal
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Option Row: Difficulty */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Difficulty
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() =>
                              setCustomization((p) => ({ ...p, difficultyFilter: diff }))
                            }
                            className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              customization.difficultyFilter === diff
                                ? 'bg-[#0A3D91] text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Option Row: Points Mode */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Points
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setCustomization((p) => ({ ...p, pointsMode: 'per_question' }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              customization.pointsMode === 'per_question'
                                ? 'bg-[#0A3D91] text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            Per Question
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCustomization((p) => ({ ...p, pointsMode: 'uniform' }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              customization.pointsMode === 'uniform'
                                ? 'bg-[#0A3D91] text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            Uniform
                          </button>
                        </div>
                      </div>
                      {customization.pointsMode === 'uniform' && (
                        <div className="flex items-center gap-1.5">
                          {POINTS_PRESETS.map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() =>
                                setCustomization((p) => ({ ...p, uniformPoints: pts }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums cursor-pointer ${
                                customization.uniformPoints === pts
                                  ? 'bg-[#0A3D91] text-white'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {pts} pts
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Option Row: Answer Reveal */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Answer Reveal
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { id: 'manual', label: 'Teacher Check' },
                            { id: 'on_select', label: 'On Choice' },
                            { id: 'on_timer_end', label: 'Timer End' },
                          ] as const
                        ).map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() =>
                              setCustomization((p) => ({ ...p, answerRevealMode: mode.id }))
                            }
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer ${
                              customization.answerRevealMode === mode.id
                                ? 'bg-[#0A3D91] text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Launch Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                {customization.teamCount} Teams · {customization.questionCount} Qns
                {customization.luckyBoxesEnabled !== false &&
                (customization.luckyBoxCount ?? 4) > 0
                  ? ` + ${customization.luckyBoxCount ?? 4} Lucky`
                  : ''}
              </div>
              <button
                type="button"
                onClick={handleLaunchProjectorBoard}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Game</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FOCUSED ADD QUESTIONS MODAL (BANK / CUSTOM / AI MIX) ==================== */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
          >
            {/* Modal Header with Clean 3-Tab Switcher */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setAddModalTab('bank')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                    addModalTab === 'bank'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Question Bank
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalTab('custom')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                    addModalTab === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {draft.editingId ? 'Edit Question' : 'Write Question'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalTab('ai')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                    addModalTab === 'ai'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  AI Mix
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {questions.length} in game
                </span>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#0A3D91] text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

            {/* TAB 1: ELIMIKA QUESTION BANK */}
            {addModalTab === 'bank' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Compact Search & Filter Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={bankFilter.searchQuery}
                      onChange={(e) =>
                        setBankFilter((bf) => ({ ...bf, searchQuery: e.target.value }))
                      }
                      placeholder="Search questions, topics, or keywords..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    <select
                      aria-label="Filter Class"
                      value={bankFilter.cls}
                      onChange={(e) => {
                        const cls = e.target.value;
                        setBankFilter((bf) => ({
                          ...bf,
                          cls,
                          topic: 'ALL',
                          subTopic: 'ALL',
                        }));
                      }}
                      className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                    >
                      <option value="ALL">All Classes</option>
                      {PLAY_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter Subject"
                      value={bankFilter.subject}
                      onChange={(e) =>
                        setBankFilter((bf) => ({
                          ...bf,
                          subject: e.target.value,
                          topic: 'ALL',
                          subTopic: 'ALL',
                        }))
                      }
                      className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer truncate"
                    >
                      <option value="ALL">All Subjects</option>
                      {bankSubjectsForClass.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter Topic"
                      value={bankFilter.topic}
                      onChange={(e) =>
                        setBankFilter((bf) => ({
                          ...bf,
                          topic: e.target.value,
                          subTopic: 'ALL',
                        }))
                      }
                      className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer truncate"
                    >
                      <option value="ALL">All Topics</option>
                      {bankTopics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter Subtopic"
                      value={bankFilter.subTopic}
                      onChange={(e) =>
                        setBankFilter((bf) => ({ ...bf, subTopic: e.target.value }))
                      }
                      className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer truncate"
                    >
                      <option value="ALL">All Subtopics</option>
                      {bankSubTopics.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter Difficulty"
                      value={bankFilter.difficulty}
                      onChange={(e) =>
                        setBankFilter((bf) => ({
                          ...bf,
                          difficulty: e.target.value as QuestionBankFilterCriteria['difficulty'],
                        }))
                      }
                      className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                    >
                      <option value="ALL">Any Difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>

                    <select
                      aria-label="Filter Question Type"
                      value={bankFilter.questionType}
                      onChange={(e) =>
                        setBankFilter((bf) => ({
                          ...bf,
                          questionType: e.target.value as QuestionBankFilterCriteria['questionType'],
                        }))
                      }
                      className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                    >
                      <option value="ALL">All Types</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>

                  {/* Quick Bulk Action Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                      {filteredBankQuestions.length} questions available
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 text-slate-500">
                        <span>Count:</span>
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, filteredBankQuestions.length)}
                          value={bankPickCount}
                          onChange={(e) =>
                            setBankPickCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-slate-800 dark:text-white tabular-nums"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleSelectSpecificBankCount}
                        disabled={filteredBankQuestions.length === 0}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#0A3D91] font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                      >
                        Select {bankPickCount}
                      </button>
                      <button
                        type="button"
                        onClick={handleRandomSelectFromBank}
                        disabled={filteredBankQuestions.length === 0}
                        className="px-3 py-1.5 rounded-lg bg-[#0A3D91] hover:bg-blue-800 text-white font-bold inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Random {bankPickCount}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectAllMatchingBank}
                        disabled={filteredBankQuestions.length === 0}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 font-bold text-emerald-700 dark:text-emerald-400 disabled:opacity-40 cursor-pointer"
                      >
                        Add All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filtered Bank Results List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBankQuestions.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                      No matching questions found. Try clearing a filter or switching class/subject.
                    </div>
                  ) : (
                    filteredBankQuestions.slice(0, 80).map((item) => {
                      const alreadyAdded = isDuplicateInGameRoster(item, questions);
                      const isPreviewOpen = previewBankId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1 flex-1">
                              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                {item.cls} · {item.subject} · {item.topic} ·{' '}
                                {TYPE_LABEL[item.questionType]} · {item.difficulty} · {item.points} pts
                              </div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                                <MathText as="div" text={item.question} />
                              </div>

                              {isPreviewOpen && (
                                <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                                  {item.questionType === 'multiple_choice' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                      {item.options.map((opt, idx) => (
                                        <div
                                          key={idx}
                                          className={
                                            idx === item.correctIndex
                                              ? 'font-bold text-emerald-700 dark:text-emerald-400'
                                              : ''
                                          }
                                        >
                                          {String.fromCharCode(65 + idx)}. <MathText text={opt} />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="font-bold text-emerald-700 dark:text-emerald-400">
                                    Answer: <MathText text={getCorrectAnswerDisplay(item)} />
                                  </div>
                                  {item.explanation && (
                                    <div className="text-slate-500 dark:text-slate-400">
                                      <MathText text={item.explanation} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewBankId(isPreviewOpen ? null : item.id)
                                }
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                {isPreviewOpen ? 'Hide' : 'Preview'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleBankQuestion(item)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition ${
                                  alreadyAdded
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-[#0A3D91] hover:bg-blue-800 text-white'
                                }`}
                              >
                                {alreadyAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {filteredBankQuestions.length > 80 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Showing first 80 of {filteredBankQuestions.length} matching questions — use search or filters to narrow down, or click Random / Add All.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: WRITE CUSTOM QUESTION (OPTION 1) */}
            {addModalTab === 'custom' && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {draftError && (
                  <div className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                    {draftError}
                  </div>
                )}

                {/* Question Type Segmented Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                    {(
                      [
                        { id: 'multiple_choice', label: 'Multiple Choice' },
                        { id: 'true_false', label: 'True / False' },
                        { id: 'short_answer', label: 'Short Answer' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            questionType: t.id,
                            correctIndex: 0,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          draft.questionType === t.id
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Points & Difficulty */}
                  <div className="flex items-center gap-2 text-xs">
                    <select
                      aria-label="Question Points"
                      value={draft.points}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, points: parseInt(e.target.value, 10) || 15 }))
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold cursor-pointer"
                    >
                      {[5, 10, 15, 20, 25, 30, 50].map((pts) => (
                        <option key={pts} value={pts}>
                          {pts} pts
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Question Difficulty"
                      value={draft.difficulty}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          difficulty: e.target.value as ClassroomQuestionDifficulty,
                        }))
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold cursor-pointer"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Question Prompt + Collapsible Math Symbols + Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Question
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMathToolbarOpen((v) => !v)}
                        className="text-xs font-bold text-[#0A3D91] dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        {mathToolbarOpen ? 'Hide Math Symbols' : 'fx Math Symbols'}
                      </button>
                      <input
                        ref={imageFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleDraftImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0A3D91] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Image</span>
                      </button>
                    </div>
                  </div>

                  {mathToolbarOpen && (
                    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      {MATH_NOTATION_SNIPPETS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleInsertMathSnippet(item.snippet)}
                          title={item.label}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#0A3D91] text-xs font-semibold cursor-pointer"
                        >
                          {item.display}
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    ref={questionInputRef}
                    rows={3}
                    value={draft.question}
                    onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
                    placeholder="Type your question here... (Use $x^2$ for math notation)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  />

                  {draft.question.includes('$') && (
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm">
                      <span className="text-[11px] font-bold uppercase text-slate-400 mr-2">
                        Preview:
                      </span>
                      <MathText text={draft.question} />
                    </div>
                  )}

                  {draft.imageUrl && (
                    <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2">
                      <img
                        src={draft.imageUrl}
                        alt="Attached question diagram"
                        className="max-h-36 rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, imageUrl: '' }))}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Answer Area */}
                {draft.questionType === 'multiple_choice' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Answer Choices (click circle to mark correct)
                      </label>
                      {draft.options.length < 5 && (
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({ ...d, options: [...d.options, ''] }))
                          }
                          className="text-xs font-bold text-[#0A3D91] dark:text-sky-400 cursor-pointer"
                        >
                          + Add Choice
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {draft.options.map((opt, idx) => {
                        const isCorrect = draft.correctIndex === idx;
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDraft((d) => ({ ...d, correctIndex: idx }))}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition ${
                                isCorrect
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                              }`}
                              title="Mark as correct answer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraft((d) => ({
                                  ...d,
                                  options: d.options.map((o, i) => (i === idx ? val : o)),
                                }));
                              }}
                              placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                            />
                            {draft.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((d) => ({
                                    ...d,
                                    options: d.options.filter((_, i) => i !== idx),
                                    correctIndex:
                                      d.correctIndex === idx
                                        ? 0
                                        : d.correctIndex > idx
                                        ? d.correctIndex - 1
                                        : d.correctIndex,
                                  }))
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {draft.questionType === 'true_false' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Correct Answer
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['True', 'False'] as const).map((label, idx) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, correctIndex: idx }))}
                          className={`py-3 rounded-xl font-extrabold text-sm border transition cursor-pointer ${
                            draft.correctIndex === idx
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {draft.questionType === 'short_answer' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={draft.shortAnswer}
                      onChange={(e) => setDraft((d) => ({ ...d, shortAnswer: e.target.value }))}
                      placeholder="e.g. 4/7 or Photosynthesis"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                    />
                  </div>
                )}

                {/* Collapsible Optional Explanation & Image URL */}
                <div>
                  <button
                    type="button"
                    onClick={() => setDraftExtraOpen((v) => !v)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {draftExtraOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    <span>Optional explanation, topic or image link</span>
                  </button>

                  {draftExtraOpen && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <textarea
                        rows={2}
                        value={draft.explanation}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, explanation: e.target.value }))
                        }
                        placeholder="Explanation shown after revealing the answer (optional)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={draft.topic}
                          onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}
                          placeholder="Topic (optional)"
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                        />
                        <div className="relative">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={draft.imageUrl}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, imageUrl: e.target.value }))
                            }
                            placeholder="Image URL (optional)"
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {!draft.editingId && (
                    <button
                      type="button"
                      onClick={() => handleSaveCustomQuestion(true)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      Save &amp; Add Another
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSaveCustomQuestion(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#0A3D91] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold cursor-pointer"
                  >
                    {draft.editingId ? 'Save Changes' : 'Add to Game'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: AI QUESTION MIX (OPTION 3) */}
            {addModalTab === 'ai' && (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Topic ({gameClass} {gameSubject})
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder={gameTopic || 'e.g. Probability, Photosynthesis...'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Difficulty
                    </label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) =>
                        setAiDifficulty(e.target.value as 'Mixed' | ClassroomQuestionDifficulty)
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Mixed">Mixed</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Type
                    </label>
                    <select
                      value={aiQuestionType}
                      onChange={(e) =>
                        setAiQuestionType(e.target.value as 'mixed' | ClassroomQuestionType)
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold cursor-pointer"
                    >
                      <option value="mixed">Mixed</option>
                      <option value="multiple_choice">MCQ</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={aiCount}
                      onChange={(e) =>
                        setAiCount(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 5)))
                      }
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold text-center tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={handleGenerateAiQuestions}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#0A3D91] hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{aiLoading ? 'Working...' : 'Generate'}</span>
                    </button>
                  </div>
                </div>

                {aiError && (
                  <div className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                    {aiError}
                  </div>
                )}

                {aiGenerated.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {aiGenerated.length} generated questions ready
                      </span>
                      <button
                        type="button"
                        onClick={() => addUniqueQuestionsToGame(aiGenerated, 'AI question')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Add All Unique
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {aiGenerated.map((item) => {
                        const added = isDuplicateInGameRoster(item, questions);
                        return (
                          <div
                            key={item.id}
                            className="p-4 flex items-start justify-between gap-4 bg-white dark:bg-slate-900"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="text-[11px] font-semibold text-slate-400">
                                {TYPE_LABEL[item.questionType]} · {item.difficulty} · {item.points}{' '}
                                pts
                              </div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                <MathText as="div" text={item.question} />
                              </div>
                              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                Answer: <MathText text={getCorrectAnswerDisplay(item)} />
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={added}
                              onClick={() => addUniqueQuestionsToGame([item], 'AI question')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer ${
                                added
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-[#0A3D91] hover:bg-blue-800 text-white'
                              }`}
                            >
                              {added ? 'Added' : '+ Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MY SAVED GAMES & PAST RESULTS MODAL ==================== */}
      {libraryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLibraryModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
          >
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setLibraryTab('games')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold cursor-pointer ${
                    libraryTab === 'games'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Saved Games ({savedGames.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryTab('results')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold cursor-pointer ${
                    libraryTab === 'results'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Past Results ({savedResults.length})
                </button>
              </div>
              <button
                type="button"
                onClick={() => setLibraryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {libraryTab === 'games' ? (
                savedGames.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No saved games yet
                    </p>
                    <p className="text-xs text-slate-400">
                      Build a game and click Save to reuse it anytime in class.
                    </p>
                  </div>
                ) : (
                  savedGames.map((sg) => (
                    <div
                      key={sg.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {sg.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {sg.cls} · {sg.subject} · {sg.questions?.length || 0} questions
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedGame(sg, false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadSavedGame(sg, true)}
                          className="px-3 py-1.5 rounded-lg bg-[#0A3D91] hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Play</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedGame(sg.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete saved game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : savedResults.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No completed sessions yet
                  </p>
                  <p className="text-xs text-slate-400">
                    Finished classroom game leaderboards saved from the board appear here.
                  </p>
                </div>
              ) : (
                savedResults.map((res) => {
                  const sortedTeams = [...(res.teams || [])].sort((a, b) => b.score - a.score);
                  const winner = sortedTeams[0];
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {res.gameTitle}
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {new Date(res.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {res.cls} · {res.subject} · {res.playedTilesCount}/{res.totalTiles} played
                        {winner ? ` · Winner: ${winner.name} (${winner.score} pts)` : ''}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {sortedTeams.map((t, i) => (
                          <span key={t.id}>
                            #{i + 1} {t.name}: {t.score}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
