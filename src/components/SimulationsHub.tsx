import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Atom,
  BookOpen,
  Dna,
  FlaskConical,
  Gauge,
  Heart,
  Leaf,
  Microscope,
  Search,
  Sigma,
  Sparkles,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react';
import type { DiagramPreset } from './InteractiveDiagramLab';
import type { VirtualLabSubMode, VirtualLabSubject } from './VirtualScienceLab';
import { TIE_CURRICULUM_SUBJECTS } from '../data/curriculumData';

// Static studio 3D preview renders for every simulation card
import imgMitosis3D from '../assets/images/sim_mitosis_3d_1795215064560.jpg';
import imgPhotosynthesis from '../assets/images/sim_photosynthesis_1795215064101.jpg';
import imgOhmCircuit from '../assets/images/sim_ohm_circuit_1795215064440.jpg';
import imgOhmRheostat from '../assets/images/sim_ohm_rheostat_1795215064682.jpg';
import imgPendulum from '../assets/images/sim_pendulum_1795215117886.jpg';
import imgTitrationCurve from '../assets/images/sim_titration_curve_1795215118317.jpg';
import imgTitrationLab from '../assets/images/sim_titration_lab_1795215117250.jpg';
import imgQualitativeSalt from '../assets/images/sim_qualitative_salt_1795215117515.jpg';
import imgQuadraticGraph from '../assets/images/sim_quadratic_graph_1795215118750.jpg';
import imgTrigWaves from '../assets/images/sim_trig_waves_1795220663340.jpg';
import imgPlantOsmosis3D from '../assets/images/sim_plant_osmosis_3d_1795279369839.jpg';
import imgHumanHeart3D from '../assets/images/sim_human_heart_3d_1795283136171.jpg';

const InteractiveDiagramLab = React.lazy(() =>
  import('./InteractiveDiagramLab').then((m) => ({ default: m.InteractiveDiagramLab }))
);
const VirtualScienceLab = React.lazy(() =>
  import('./VirtualScienceLab').then((m) => ({ default: m.VirtualScienceLab }))
);
const Mitosis3DSimulation = React.lazy(() =>
  import('./Mitosis3DSimulation').then((m) => ({ default: m.Mitosis3DSimulation }))
);
const OhmsLaw3DSimulation = React.lazy(() =>
  import('./OhmsLaw3DSimulation').then((m) => ({ default: m.OhmsLaw3DSimulation }))
);
const Titration3DSimulation = React.lazy(() =>
  import('./Titration3DSimulation').then((m) => ({ default: m.Titration3DSimulation }))
);
const Photosynthesis3DSimulation = React.lazy(() =>
  import('./Photosynthesis3DSimulation').then((m) => ({ default: m.Photosynthesis3DSimulation }))
);
const Pendulum3DSimulation = React.lazy(() =>
  import('./Pendulum3DSimulation').then((m) => ({ default: m.Pendulum3DSimulation }))
);
const Quadratic3DSimulation = React.lazy(() =>
  import('./Quadratic3DSimulation').then((m) => ({ default: m.Quadratic3DSimulation }))
);
const TrigWaves3DSimulation = React.lazy(() =>
  import('./TrigWaves3DSimulation').then((m) => ({ default: m.TrigWaves3DSimulation }))
);
const Osmosis3DSimulation = React.lazy(() =>
  import('./Osmosis3DSimulation').then((m) => ({ default: m.Osmosis3DSimulation }))
);
const Heart3DSimulation = React.lazy(() =>
  import('./Heart3DSimulation').then((m) => ({ default: m.Heart3DSimulation }))
);

export type SimulationSubjectKey = 'biology' | 'physics' | 'chemistry' | 'mathematics';

export interface SimulationItem {
  id: string;
  title: string;
  shortDesc: string;
  subject: SimulationSubjectKey;
  subtopicId: string;
  subtopicLabel: string;
  categoryTag: '3D VISUALISATION' | 'QUANTITATIVE LAB' | 'INTERACTIVE DIAGRAM';
  previewImage: string;
  engine:
    | 'diagram'
    | 'lab'
    | 'mitosis3d'
    | 'ohms3d'
    | 'titration3d'
    | 'photosynthesis3d'
    | 'pendulum3d'
    | 'quadratic3d'
    | 'trig3d'
    | 'osmosis3d'
    | 'heart3d';
  diagramPreset?: DiagramPreset;
  labSubject?: VirtualLabSubject;
  labSubMode?: VirtualLabSubMode;
  has3D?: boolean;
  keywords: string[];
}

export interface SimulationsHubProps {
  darkMode?: boolean;
  activeClass: string;
  onChangeClass: (newClass: string) => void;
  activeSubject?: string;
  initialDiagramPreset?: DiagramPreset;
  initialTab?: 'diagrams' | 'labs';
  onLaunchPracticalQuiz?: (cls: string, subject: string, topic: string) => void;
}

interface SubjectMeta {
  key: SimulationSubjectKey;
  label: string;
  accentHex: string;
  lightAccentHex: string;
  topBarClass: string;
  textActiveDark: string;
  textActiveLight: string;
  borderActiveDark: string;
  borderActiveLight: string;
  iconBgDark: string;
  iconBgLight: string;
  iconColorDark: string;
  iconColorLight: string;
  renderIcon: (className?: string) => React.ReactNode;
}

const SUBJECT_META: SubjectMeta[] = [
  {
    key: 'biology',
    label: 'Biology',
    accentHex: '#22d3ee',
    lightAccentHex: '#0891b2',
    topBarClass: 'from-cyan-400 via-teal-400 to-cyan-500',
    textActiveDark: 'text-cyan-300',
    textActiveLight: 'text-cyan-700',
    borderActiveDark: 'border-cyan-400/60 shadow-[0_0_24px_-8px_rgba(34,211,238,0.45)]',
    borderActiveLight: 'border-cyan-500/70 shadow-md shadow-cyan-500/10',
    iconBgDark: 'bg-cyan-500/10 border-cyan-400/20',
    iconBgLight: 'bg-cyan-50 border-cyan-200',
    iconColorDark: 'text-cyan-300',
    iconColorLight: 'text-cyan-600',
    renderIcon: (cls = 'w-5 h-5') => <Dna className={cls} />,
  },
  {
    key: 'physics',
    label: 'Physics',
    accentHex: '#38bdf8',
    lightAccentHex: '#0284c7',
    topBarClass: 'from-sky-400 via-cyan-400 to-indigo-500',
    textActiveDark: 'text-sky-300',
    textActiveLight: 'text-sky-700',
    borderActiveDark: 'border-sky-400/60 shadow-[0_0_24px_-8px_rgba(56,189,248,0.45)]',
    borderActiveLight: 'border-sky-500/70 shadow-md shadow-sky-500/10',
    iconBgDark: 'bg-sky-500/10 border-sky-400/20',
    iconBgLight: 'bg-sky-50 border-sky-200',
    iconColorDark: 'text-sky-300',
    iconColorLight: 'text-sky-600',
    renderIcon: (cls = 'w-5 h-5') => <Atom className={cls} />,
  },
  {
    key: 'chemistry',
    label: 'Chemistry',
    accentHex: '#34d399',
    lightAccentHex: '#059669',
    topBarClass: 'from-emerald-400 via-teal-400 to-green-500',
    textActiveDark: 'text-emerald-300',
    textActiveLight: 'text-emerald-700',
    borderActiveDark: 'border-emerald-400/60 shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)]',
    borderActiveLight: 'border-emerald-500/70 shadow-md shadow-emerald-500/10',
    iconBgDark: 'bg-emerald-500/10 border-emerald-400/20',
    iconBgLight: 'bg-emerald-50 border-emerald-200',
    iconColorDark: 'text-emerald-300',
    iconColorLight: 'text-emerald-600',
    renderIcon: (cls = 'w-5 h-5') => <FlaskConical className={cls} />,
  },
  {
    key: 'mathematics',
    label: 'Mathematics',
    accentHex: '#fbbf24',
    lightAccentHex: '#d97706',
    topBarClass: 'from-amber-400 via-yellow-400 to-orange-400',
    textActiveDark: 'text-amber-300',
    textActiveLight: 'text-amber-700',
    borderActiveDark: 'border-amber-400/60 shadow-[0_0_24px_-8px_rgba(251,191,36,0.45)]',
    borderActiveLight: 'border-amber-500/70 shadow-md shadow-amber-500/10',
    iconBgDark: 'bg-amber-500/10 border-amber-400/20',
    iconBgLight: 'bg-amber-50 border-amber-200',
    iconColorDark: 'text-amber-300',
    iconColorLight: 'text-amber-600',
    renderIcon: (cls = 'w-5 h-5') => <Sigma className={cls} />,
  },
];

const SIMULATION_CATALOG: SimulationItem[] = [
  // BIOLOGY (4)
  {
    id: 'bio-heart-3d',
    title: 'Human Heart & Double Circulation',
    shortDesc:
      'Explore a beating 3D 4-chamber cutaway heart with animated tricuspid, bicuspid and semilunar valves, oxygenated/deoxygenated blood streams, live ECG and LUB–DUB sound.',
    subject: 'biology',
    subtopicId: 'bio_circulation',
    subtopicLabel: 'Human Circulation & Physiology',
    categoryTag: '3D VISUALISATION',
    previewImage: imgHumanHeart3D,
    engine: 'heart3d',
    has3D: true,
    keywords: [
      'heart',
      'circulation',
      'double circulation',
      'aorta',
      'vena cava',
      'pulmonary',
      'ventricle',
      'atrium',
      'valve',
      'ecg',
      'blood',
      '3d',
    ],
  },
  {
    id: 'bio-mitosis-3d',
    title: 'Mitosis & Cell Division',
    shortDesc:
      'One living 3D cell followed through interphase, prophase, metaphase, anaphase, telophase and cytokinesis. Play, pause or drag to any moment.',
    subject: 'biology',
    subtopicId: 'bio_division',
    subtopicLabel: 'Cell Division',
    categoryTag: '3D VISUALISATION',
    previewImage: imgMitosis3D,
    engine: 'mitosis3d',
    has3D: true,
    keywords: [
      'mitosis',
      'cell division',
      'prophase',
      'metaphase',
      'anaphase',
      'telophase',
      'cytokinesis',
      'chromosome',
      'chromatid',
      'spindle',
      'diploid',
      '3d',
    ],
  },
  {
    id: 'bio-photosynthesis',
    title: 'Photosynthesis & Vascular Flow',
    shortDesc:
      'Explore a 3D leaf cross-section with palisade chloroplasts, clickable guard cells, xylem water flow, phloem glucose export and limiting factors.',
    subject: 'biology',
    subtopicId: 'bio_energy',
    subtopicLabel: 'Energy & Transport in Plants',
    categoryTag: '3D VISUALISATION',
    previewImage: imgPhotosynthesis,
    engine: 'photosynthesis3d',
    diagramPreset: 'bio_photosynthesis',
    has3D: true,
    keywords: ['photosynthesis', 'xylem', 'phloem', 'leaf', 'chloroplast', 'stomata', 'co2', 'light', 'glucose', '3d'],
  },
  {
    id: 'bio-osmosis-3d',
    title: 'Plant Cell Osmosis & Plasmolysis',
    shortDesc:
      'Immerse a 3D plant cell in hypotonic, isotonic and hypertonic sucrose solutions. Watch H₂O flow, vacuole swelling, membrane retraction and live % mass change curves.',
    subject: 'biology',
    subtopicId: 'bio_cells',
    subtopicLabel: 'Cells & Osmosis',
    categoryTag: '3D VISUALISATION',
    previewImage: imgPlantOsmosis3D,
    engine: 'osmosis3d',
    has3D: true,
    keywords: [
      'osmosis',
      'plant cell',
      'turgid',
      'flaccid',
      'plasmolysis',
      'vacuole',
      'water potential',
      'sucrose',
      'membrane',
      'cell wall',
      '3d',
    ],
  },

  // PHYSICS (3)
  {
    id: 'phys-ohm-diagram',
    title: "Ohm's Law DC Circuit",
    shortDesc:
      'Step through open and closed circuits in 3D, click the switch, dial or resistor directly, plot V–I points and test Ohm’s Law live.',
    subject: 'physics',
    subtopicId: 'phys_electricity',
    subtopicLabel: 'Electricity & Circuits',
    categoryTag: '3D VISUALISATION',
    previewImage: imgOhmCircuit,
    engine: 'ohms3d',
    has3D: true,
    keywords: ['ohm', 'circuit', 'voltage', 'current', 'resistance', 'ammeter', 'voltmeter', 'power', '3d'],
  },
  {
    id: 'phys-ohm-lab',
    title: 'Rheostat & V–I Slope Bench',
    shortDesc:
      'Slide a 3D laboratory rheostat, log ammeter and voltmeter readings and deduce the unknown resistance Rₓ from the V–I gradient.',
    subject: 'physics',
    subtopicId: 'phys_electricity',
    subtopicLabel: 'Electricity & Circuits',
    categoryTag: 'QUANTITATIVE LAB',
    previewImage: imgOhmRheostat,
    engine: 'lab',
    labSubject: 'physics',
    labSubMode: 'ohm',
    has3D: true,
    keywords: ['rheostat', 'ohm', 'practical', 'voltage', 'current', 'slope', 'resistor', 'necta'],
  },
  {
    id: 'phys-pendulum',
    title: 'Simple Pendulum & Gravity g',
    shortDesc:
      'Release a 3D brass bob across Earth, Moon and Mars gravity, watch live PE/KE energy bars, time swings and plot T² vs L to calculate g.',
    subject: 'physics',
    subtopicId: 'phys_mechanics',
    subtopicLabel: 'Mechanics & Oscillations',
    categoryTag: '3D VISUALISATION',
    previewImage: imgPendulum,
    engine: 'pendulum3d',
    has3D: true,
    keywords: ['pendulum', 'gravity', 'oscillation', 'period', 'mechanics', 'retort stand', 'graph', 'energy', '3d'],
  },

  // CHEMISTRY (3)
  {
    id: 'chem-titration-diagram',
    title: 'Acid–Base Titration & pH Curve',
    shortDesc:
      'Step through pipetting, meniscus reading, tap control and drop-by-drop end-point detection in 3D with a zoomed meniscus loupe and live pH curve.',
    subject: 'chemistry',
    subtopicId: 'chem_volumetric',
    subtopicLabel: 'Volumetric Analysis & Acids',
    categoryTag: '3D VISUALISATION',
    previewImage: imgTitrationCurve,
    engine: 'titration3d',
    diagramPreset: 'chem_titration',
    has3D: true,
    keywords: ['titration', 'ph', 'acid', 'base', 'naoh', 'hcl', 'burette', 'meniscus', 'equivalence', '3d'],
  },
  {
    id: 'chem-titration-lab',
    title: 'Volumetric Titration Practical',
    shortDesc:
      'Dispense drops from a 3D burette using Methyl Orange or Phenolphthalein, record concordant titres and compute unknown molarity.',
    subject: 'chemistry',
    subtopicId: 'chem_volumetric',
    subtopicLabel: 'Volumetric Analysis & Acids',
    categoryTag: 'QUANTITATIVE LAB',
    previewImage: imgTitrationLab,
    engine: 'lab',
    labSubject: 'chemistry',
    labSubMode: 'titration',
    has3D: true,
    keywords: ['volumetric', 'burette', 'pipette', 'methyl orange', 'phenolphthalein', 'molarity', 'titration'],
  },
  {
    id: 'chem-qualitative',
    title: 'Qualitative Salt Analysis (Q1–Q4)',
    shortDesc:
      'Perform dry heating, NaOH, NH₃(aq), BaCl₂ and AgNO₃ confirmatory tests to identify cations and anions in unknown salt samples.',
    subject: 'chemistry',
    subtopicId: 'chem_qualitative',
    subtopicLabel: 'Qualitative Salt Analysis',
    categoryTag: '3D VISUALISATION',
    previewImage: imgQualitativeSalt,
    engine: 'lab',
    labSubject: 'chemistry',
    labSubMode: 'qualitative',
    has3D: true,
    keywords: ['qualitative', 'salt', 'cation', 'anion', 'precipitate', 'cuso4', 'feso4', 'znco3', 'nh4cl'],
  },

  // MATHEMATICS (2)
  {
    id: 'math-quadratic',
    title: 'Quadratic & Linear Function Grapher',
    shortDesc:
      'Sculpt a glowing 3D parabola y = ax² + bx + c, inspect vertex and root orbs, test discriminant cases and explore live coordinate value tables.',
    subject: 'mathematics',
    subtopicId: 'math_functions',
    subtopicLabel: 'Functions & Coordinate Graphs',
    categoryTag: '3D VISUALISATION',
    previewImage: imgQuadraticGraph,
    engine: 'quadratic3d',
    diagramPreset: 'math_quadratic',
    has3D: true,
    keywords: ['quadratic', 'parabola', 'graph', 'vertex', 'discriminant', 'roots', 'function', 'table', '3d'],
  },
  {
    id: 'math-trig-waves',
    title: 'Trigonometry Unit Circle & 3D Waves',
    shortDesc:
      'Rotate a 3D unit circle radius arm and watch live sine and cosine ribbons unfurl across space with special angles, amplitude and frequency controls.',
    subject: 'mathematics',
    subtopicId: 'math_trig',
    subtopicLabel: 'Trigonometry & Periodic Waves',
    categoryTag: '3D VISUALISATION',
    previewImage: imgTrigWaves,
    engine: 'trig3d',
    has3D: true,
    keywords: ['trigonometry', 'unit circle', 'sine', 'cosine', 'wave', 'radian', 'amplitude', 'frequency', '3d'],
  },
];

function getSubtopicIcon(subtopicId: string) {
  switch (subtopicId) {
    case 'bio_circulation':
      return <Heart className="w-4 h-4 text-rose-500" />;
    case 'bio_division':
      return <Dna className="w-4 h-4 text-pink-500" />;
    case 'bio_energy':
      return <Leaf className="w-4 h-4 text-emerald-500" />;
    case 'bio_cells':
      return <Microscope className="w-4 h-4 text-cyan-500" />;
    case 'phys_electricity':
      return <Zap className="w-4 h-4 text-amber-500" />;
    case 'phys_mechanics':
      return <Gauge className="w-4 h-4 text-sky-500" />;
    case 'chem_volumetric':
      return <FlaskConical className="w-4 h-4 text-emerald-500" />;
    case 'chem_qualitative':
      return <Sparkles className="w-4 h-4 text-teal-500" />;
    case 'math_functions':
      return <TrendingUp className="w-4 h-4 text-amber-500" />;
    case 'math_trig':
      return <Waves className="w-4 h-4 text-violet-500" />;
    default:
      return <BookOpen className="w-4 h-4 text-slate-400" />;
  }
}

function getCardMedallionIcon(subject: SimulationSubjectKey) {
  switch (subject) {
    case 'biology':
      return <Dna className="w-4 h-4" />;
    case 'physics':
      return <Zap className="w-4 h-4" />;
    case 'chemistry':
      return <FlaskConical className="w-4 h-4" />;
    case 'mathematics':
      return <Sigma className="w-4 h-4" />;
  }
}

export const SimulationsHub: React.FC<SimulationsHubProps> = ({
  darkMode = false,
  activeClass,
  onChangeClass,
  activeSubject,
  onLaunchPracticalQuiz,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'all' | SimulationSubjectKey>('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);

  const activeSimulation = useMemo(
    () => SIMULATION_CATALOG.find((s) => s.id === activeSimulationId) || null,
    [activeSimulationId]
  );

  // Sync browser/phone back button cleanly when opening a simulation
  useEffect(() => {
    const onPopState = () => {
      setActiveSimulationId(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openSimulation = (simId: string) => {
    setActiveSimulationId(simId);
    try {
      window.history.pushState({ elimikaSimId: simId }, '');
    } catch {
      // ignore history errors in sandboxed iframes
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeSimulation = () => {
    setActiveSimulationId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubject = (subj: 'all' | SimulationSubjectKey) => {
    setSelectedSubject(subj);
    setSelectedSubtopic('all');
    if (activeSimulationId) {
      setActiveSimulationId(null);
    }
  };

  // Counts per subject
  const subjectCounts = useMemo(() => {
    const counts: Record<SimulationSubjectKey, number> = {
      biology: 0,
      physics: 0,
      chemistry: 0,
      mathematics: 0,
    };
    for (const item of SIMULATION_CATALOG) {
      counts[item.subject] += 1;
    }
    return counts;
  }, []);

  // Items matching selected subject + search query
  const subjectFilteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SIMULATION_CATALOG.filter((item) => {
      if (selectedSubject !== 'all' && item.subject !== selectedSubject) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.subtopicLabel.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
      );
    });
  }, [selectedSubject, searchQuery]);

  // Subtopic filter chips derived dynamically from matching items
  const subtopicChips = useMemo(() => {
    const map = new Map<
      string,
      { id: string; label: string; count: number; subject: SimulationSubjectKey }
    >();
    for (const item of subjectFilteredItems) {
      const existing = map.get(item.subtopicId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(item.subtopicId, {
          id: item.subtopicId,
          label: item.subtopicLabel,
          count: 1,
          subject: item.subject,
        });
      }
    }
    return Array.from(map.values());
  }, [subjectFilteredItems]);

  // Grouped sections for display
  const groupedSections = useMemo(() => {
    const items =
      selectedSubtopic === 'all'
        ? subjectFilteredItems
        : subjectFilteredItems.filter((i) => i.subtopicId === selectedSubtopic);

    const groups = new Map<
      string,
      {
        subtopicId: string;
        subtopicLabel: string;
        subject: SimulationSubjectKey;
        items: SimulationItem[];
      }
    >();

    for (const item of items) {
      const existing = groups.get(item.subtopicId);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(item.subtopicId, {
          subtopicId: item.subtopicId,
          subtopicLabel: item.subtopicLabel,
          subject: item.subject,
          items: [item],
        });
      }
    }

    return Array.from(groups.values());
  }, [subjectFilteredItems, selectedSubtopic]);

  const activeSubjectMeta = useMemo(
    () => SUBJECT_META.find((m) => m.key === (activeSimulation?.subject || selectedSubject)) || null,
    [activeSimulation, selectedSubject]
  );

  const siblingSimulations = useMemo(() => {
    if (!activeSimulation) return [];
    return SIMULATION_CATALOG.filter((s) => s.subject === activeSimulation.subject);
  }, [activeSimulation]);

  return (
    <div
      className={`min-h-screen pb-24 transition-colors ${
        darkMode ? 'bg-[#080b13] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* TOP NAVIGATION STRIP (Maintains App Light/Dark Mode) */}
      <header
        className={`sticky top-0 z-30 border-b print:hidden transition-colors ${
          darkMode
            ? 'bg-[#0b101b]/95 border-white/[0.08]'
            : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand & Horizontal Subject Links */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => handleSelectSubject('all')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white flex items-center justify-center shadow-sm">
                <FlaskConical className="w-4.5 h-4.5 stroke-[2.4]" />
              </div>
              <span
                className={`text-base font-black tracking-tight ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Elimika{' '}
                <span className={darkMode ? 'text-cyan-300' : 'text-cyan-700'}>
                  Simulations
                </span>
              </span>
            </button>

            <nav aria-label="Simulation Subjects" className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => handleSelectSubject('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedSubject === 'all' && !activeSimulation
                    ? darkMode
                      ? 'text-white bg-white/[0.08]'
                      : 'text-slate-950 bg-slate-100'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              {SUBJECT_META.map((subj) => {
                const isActive = activeSimulation
                  ? activeSimulation.subject === subj.key
                  : selectedSubject === subj.key;
                return (
                  <button
                    key={subj.key}
                    type="button"
                    onClick={() => handleSelectSubject(subj.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? darkMode
                          ? `${subj.textActiveDark} bg-white/[0.07]`
                          : `${subj.textActiveLight} bg-slate-100`
                        : darkMode
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {subj.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search & Class Level */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!activeSimulation && (
              <div className="relative flex-1 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search simulations..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 ${
                    darkMode
                      ? 'bg-[#111726] border-white/[0.1] text-white placeholder-slate-500'
                      : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                />
              </div>
            )}

            <select
              aria-label="Class Level"
              value={activeClass}
              onChange={(e) => onChangeClass(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:border-cyan-500 cursor-pointer shrink-0 ${
                darkMode
                  ? 'bg-[#111726] border-white/[0.1] text-slate-200'
                  : 'bg-slate-100 border-slate-200 text-slate-900'
              }`}
            >
              {Object.keys(TIE_CURRICULUM_SUBJECTS).map((cls) => (
                <option
                  key={cls}
                  value={cls}
                  className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
                >
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ACTIVE SIMULATION FOCUSED STAGE */}
      {activeSimulation ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
          {/* Compact Breadcrumb & Same-Subject Quick Switcher */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border rounded-2xl p-3.5 sm:px-5 ${
              darkMode
                ? 'bg-[#101624] border-white/[0.08]'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={closeSimulation}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                  darkMode
                    ? 'bg-white/[0.07] hover:bg-white/[0.12] text-slate-100'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Simulations</span>
              </button>
              <div className="min-w-0">
                <div
                  className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <span
                    style={{
                      color: darkMode
                        ? activeSubjectMeta?.accentHex || '#22d3ee'
                        : activeSubjectMeta?.lightAccentHex || '#0891b2',
                    }}
                  >
                    {activeSubjectMeta?.label}
                  </span>
                  <span>·</span>
                  <span className="truncate">{activeSimulation.subtopicLabel}</span>
                </div>
                <h1
                  className={`text-sm sm:text-base font-black truncate ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {activeSimulation.title}
                </h1>
              </div>
            </div>

            {siblingSimulations.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {siblingSimulations.map((sib) => {
                  const isCurrent = sib.id === activeSimulation.id;
                  return (
                    <button
                      key={sib.id}
                      type="button"
                      onClick={() => openSimulation(sib.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                        isCurrent
                          ? darkMode
                            ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/50'
                            : 'bg-cyan-50 text-cyan-800 border-cyan-400'
                          : darkMode
                          ? 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border-white/[0.06]'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {sib.title.split(':')[0].split('(')[0].trim()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mounted Simulation Engine */}
          <div
            className={
              activeSimulation.engine === 'mitosis3d' ||
              activeSimulation.engine === 'ohms3d' ||
              activeSimulation.engine === 'titration3d' ||
              activeSimulation.engine === 'photosynthesis3d' ||
              activeSimulation.engine === 'pendulum3d' ||
              activeSimulation.engine === 'quadratic3d' ||
              activeSimulation.engine === 'trig3d' ||
              activeSimulation.engine === 'osmosis3d' ||
              activeSimulation.engine === 'heart3d'
                ? ''
                : 'text-slate-900'
            }
          >
            <Suspense
              fallback={
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Loading simulation workspace...</span>
                </div>
              }
            >
              {activeSimulation.engine === 'mitosis3d' ? (
                <Mitosis3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'ohms3d' ? (
                <OhmsLaw3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'titration3d' ? (
                <Titration3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'photosynthesis3d' ? (
                <Photosynthesis3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'pendulum3d' ? (
                <Pendulum3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'quadratic3d' ? (
                <Quadratic3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'trig3d' ? (
                <TrigWaves3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'osmosis3d' ? (
                <Osmosis3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'heart3d' ? (
                <Heart3DSimulation darkMode={darkMode} activeClass={activeClass} />
              ) : activeSimulation.engine === 'diagram' ? (
                <InteractiveDiagramLab
                  initialPreset={activeSimulation.diagramPreset}
                  activeClass={activeClass}
                  activeSubject={activeSubject || activeSubjectMeta?.label || 'Physics'}
                  hidePresetBar
                />
              ) : (
                <VirtualScienceLab
                  activeClass={activeClass}
                  initialSubject={activeSimulation.labSubject}
                  initialSubMode={activeSimulation.labSubMode}
                  embeddedMode
                  onLaunchPracticalQuiz={onLaunchPracticalQuiz}
                />
              )}
            </Suspense>
          </div>
        </main>
      ) : (
        /* SIMULATION CATALOG HUB (Theme-Adaptive Light & Dark Mode) */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-7">
          {/* SUBJECT CATEGORY CARDS GRID */}
          <section aria-label="Subjects">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {SUBJECT_META.map((subj) => {
                const count = subjectCounts[subj.key];
                const isSelected = selectedSubject === subj.key;
                return (
                  <button
                    key={subj.key}
                    type="button"
                    onClick={() => handleSelectSubject(isSelected ? 'all' : subj.key)}
                    className={`relative overflow-hidden rounded-2xl border p-4 flex items-center gap-3.5 text-left transition-all cursor-pointer group ${
                      darkMode
                        ? `bg-[#101522] hover:bg-[#141b2d] ${
                            isSelected
                              ? subj.borderActiveDark
                              : 'border-white/[0.08] hover:border-white/[0.18]'
                          }`
                        : `bg-white hover:bg-slate-50/70 ${
                            isSelected
                              ? subj.borderActiveLight
                              : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                          }`
                    }`}
                  >
                    {/* Colored top-edge accent bar */}
                    <div
                      className={`absolute inset-x-0 top-0 h-[3.5px] bg-gradient-to-r ${subj.topBarClass}`}
                    />
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        darkMode
                          ? `${subj.iconBgDark} ${subj.iconColorDark}`
                          : `${subj.iconBgLight} ${subj.iconColorLight}`
                      }`}
                    >
                      {subj.renderIcon('w-5 h-5')}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-[15px] font-bold leading-tight truncate ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {subj.label}
                      </div>
                      <div
                        className={`text-xs font-medium mt-0.5 tabular-nums ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {count} {count === 1 ? 'simulation' : 'simulations'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SUBTOPIC FILTER CHIPS */}
          <section aria-label="Subtopic Filters" className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubtopic('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                selectedSubtopic === 'all'
                  ? darkMode
                    ? 'bg-cyan-500/15 border-cyan-400/70 text-cyan-200'
                    : 'bg-cyan-50 border-cyan-500 text-cyan-900'
                  : darkMode
                  ? 'bg-[#101522] border-white/[0.09] text-slate-300 hover:border-white/20 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-950'
              }`}
            >
              <span>All</span>
              <span className="text-[11px] font-semibold opacity-80 tabular-nums">
                {subjectFilteredItems.length}
              </span>
            </button>

            {subtopicChips.map((chip) => {
              const isSelected = selectedSubtopic === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedSubtopic(isSelected ? 'all' : chip.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? darkMode
                        ? 'bg-cyan-500/15 border-cyan-400/70 text-cyan-200'
                        : 'bg-cyan-50 border-cyan-500 text-cyan-900'
                      : darkMode
                      ? 'bg-[#101522] border-white/[0.09] text-slate-300 hover:border-white/20 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-950'
                  }`}
                >
                  {getSubtopicIcon(chip.id)}
                  <span>{chip.label}</span>
                  <span
                    className={`text-[11px] font-bold tabular-nums ml-0.5 ${
                      darkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </section>

          {/* GROUPED EDITORIAL VISUAL SIMULATION CARDS (Studio 3D Pictures matching Reference Screenshot) */}
          {groupedSections.length === 0 ? (
            <div
              className={`rounded-2xl border py-14 px-6 text-center space-y-2 ${
                darkMode ? 'bg-[#101522] border-white/[0.08]' : 'bg-white border-slate-200'
              }`}
            >
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                No matching simulations found
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Try clearing your search or selecting another subject above.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                  setSelectedSubtopic('all');
                }}
                className={`mt-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                  darkMode
                    ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/25'
                    : 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100'
                }`}
              >
                Show All Simulations
              </button>
            </div>
          ) : (
            <div className="space-y-9">
              {groupedSections.map((group) => {
                const subjMeta = SUBJECT_META.find((m) => m.key === group.subject);
                return (
                  <section key={group.subtopicId} className="space-y-4">
                    {/* Section Heading */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {getSubtopicIcon(group.subtopicId)}
                        <h2
                          className={`text-base sm:text-lg font-bold tracking-tight ${
                            darkMode ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {group.subtopicLabel}
                        </h2>
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            darkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {group.items.length}
                        </span>
                      </div>
                      {selectedSubject === 'all' && subjMeta && (
                        <button
                          type="button"
                          onClick={() => handleSelectSubject(subjMeta.key)}
                          className="text-xs font-semibold hover:underline cursor-pointer"
                          style={{
                            color: darkMode ? subjMeta.accentHex : subjMeta.lightAccentHex,
                          }}
                        >
                          {subjMeta.label} →
                        </button>
                      )}
                    </div>

                    {/* Editorial Studio Preview Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((sim) => {
                        const cardSubj = SUBJECT_META.find((m) => m.key === sim.subject);
                        return (
                          <button
                            key={sim.id}
                            type="button"
                            onClick={() => openSimulation(sim.id)}
                            className={`rounded-2xl border hover:-translate-y-0.5 transition-all overflow-hidden text-left flex flex-col cursor-pointer group ${
                              darkMode
                                ? 'bg-[#171921] border-white/[0.09] hover:border-white/[0.24] shadow-lg shadow-black/25'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg'
                            }`}
                          >
                            {/* Top Studio 3D Preview Picture Frame */}
                            <div className="relative aspect-[16/10] w-full bg-[#dfe3e8]">
                              <div className="w-full h-full overflow-hidden">
                                <img
                                  src={sim.previewImage}
                                  alt={sim.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                />
                              </div>

                              {/* Top-Left Subject Tag (matching reference screenshot) */}
                              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#151821]/90 text-white text-[11px] font-bold tracking-wide shadow-xs">
                                {cardSubj?.label}
                              </span>

                              {/* Top-Right 3D Badge if applicable */}
                              {sim.has3D && (
                                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#151821]/85 text-cyan-300 border border-cyan-400/35 text-[10px] font-black tracking-wider">
                                  3D
                                </span>
                              )}

                              {/* Overlapping Circular Subject Icon Medallion on Image/Body Seam */}
                              <div
                                className={`absolute right-4 -bottom-5 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md border ${
                                  darkMode
                                    ? 'bg-[#262a36] border-white/[0.15] text-white'
                                    : 'bg-slate-900 border-white text-white'
                                }`}
                              >
                                {getCardMedallionIcon(sim.subject)}
                              </div>
                            </div>

                            {/* Editorial Card Body */}
                            <div className="p-5 pt-5 flex-1 flex flex-col justify-between gap-4">
                              <div className="space-y-1.5">
                                <div
                                  className={`text-[11px] font-mono tracking-wide ${
                                    darkMode ? 'text-slate-400' : 'text-slate-500'
                                  }`}
                                >
                                  {sim.subtopicLabel}
                                </div>
                                <h3
                                  className={`text-lg sm:text-[19px] font-serif font-bold leading-snug tracking-tight ${
                                    darkMode
                                      ? 'text-white group-hover:text-cyan-200'
                                      : 'text-slate-900 group-hover:text-cyan-800'
                                  }`}
                                >
                                  {sim.title}
                                </h3>
                                <p
                                  className={`text-xs sm:text-[13px] leading-relaxed line-clamp-3 pt-0.5 ${
                                    darkMode ? 'text-slate-400' : 'text-slate-600'
                                  }`}
                                >
                                  {sim.shortDesc}
                                </p>
                              </div>

                              {/* Clean Divider + Category Footer with Diagonal Launch Arrow */}
                              <div
                                className={`pt-3.5 border-t flex items-center justify-between text-[11px] font-bold tracking-[0.12em] uppercase ${
                                  darkMode
                                    ? 'border-white/[0.08] text-slate-400 group-hover:text-slate-200'
                                    : 'border-slate-100 text-slate-500 group-hover:text-slate-900'
                                }`}
                              >
                                <span>{sim.categoryTag}</span>
                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default SimulationsHub;
