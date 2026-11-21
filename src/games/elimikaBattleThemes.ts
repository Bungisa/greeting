export type ElimikaBattleThemeId =
  | 'numbers'
  | 'safari'
  | 'space'
  | 'science'
  | 'football'
  | 'zanzibar'
  | 'emoji';

export interface ElimikaBattleTheme {
  id: ElimikaBattleThemeId;
  name: string;
  previewIcon: string;
  swatchClass: string;
  headerBgClass: string;
  headerBorderClass: string;
  headerLightText: boolean;
  activeTeamBadgeClass: string;
  controlBtnClass: string;
  boardBgClass: string;
  tileClasses: string[];
  playedTileClass: string;
  questionHeaderClass: string;
  icons: string[];
}

export const ELIMIKA_BATTLE_THEMES: ElimikaBattleTheme[] = [
  {
    id: 'numbers',
    name: 'Classic Numbers',
    previewIcon: '123',
    swatchClass: 'from-[#3B82F6] to-[#1D4ED8]',
    headerBgClass: 'bg-gradient-to-r from-[#FBBF24] via-[#FCD34D] to-[#FBBF24]',
    headerBorderClass: 'border-amber-400/70',
    headerLightText: false,
    activeTeamBadgeClass: 'bg-[#F43F5E] text-white',
    controlBtnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    boardBgClass: 'bg-white',
    tileClasses: [
      'bg-gradient-to-b from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] hover:from-[#60A5FA] hover:to-[#2563EB] border-b-4 border-[#1E40AF] text-white',
    ],
    playedTileClass: 'bg-slate-100 border border-slate-200/70 text-slate-300',
    questionHeaderClass: 'bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#2563EB]',
    icons: [],
  },
  {
    id: 'safari',
    name: 'Serengeti Safari',
    previewIcon: '🦁',
    swatchClass: 'from-[#059669] to-[#D97706]',
    headerBgClass: 'bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706]',
    headerBorderClass: 'border-amber-600/50',
    headerLightText: true,
    activeTeamBadgeClass: 'bg-slate-950 text-amber-300',
    controlBtnClass: 'bg-amber-700/80 hover:bg-amber-800 text-white',
    boardBgClass: 'bg-[#FFFBEB]',
    tileClasses: [
      'bg-gradient-to-b from-[#10B981] via-[#059669] to-[#047857] hover:from-[#34D399] hover:to-[#059669] border-b-4 border-[#065F46] text-white',
      'bg-gradient-to-b from-[#F59E0B] via-[#D97706] to-[#B45309] hover:from-[#FBBF24] hover:to-[#D97706] border-b-4 border-[#92400E] text-white',
      'bg-gradient-to-b from-[#14B8A6] via-[#0D9488] to-[#0F766E] hover:from-[#2DD4BF] hover:to-[#0D9488] border-b-4 border-[#115E59] text-white',
    ],
    playedTileClass: 'bg-amber-100/70 border border-amber-200/70 text-amber-300',
    questionHeaderClass: 'bg-gradient-to-r from-[#047857] via-[#059669] to-[#047857]',
    icons: [
      '🦁', '🦒', '🐘', '🦓', '🐆', '🦛', '🦏', '🦩',
      '🦅', '🐒', '🐃', '🐊', '🦜', '🐢', '🌴', '⛰️',
      '🌅', '🦌', '🦋', '🌺', '🦚', '🐾', '🦒', '🦁',
    ],
  },
  {
    id: 'space',
    name: 'Space Mission',
    previewIcon: '🚀',
    swatchClass: 'from-[#312E81] to-[#6366F1]',
    headerBgClass: 'bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#1E1B4B]',
    headerBorderClass: 'border-indigo-700/80',
    headerLightText: true,
    activeTeamBadgeClass: 'bg-[#F43F5E] text-white',
    controlBtnClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    boardBgClass: 'bg-[#0B1120]',
    tileClasses: [
      'bg-gradient-to-b from-[#4F46E5] via-[#3730A3] to-[#1E1B4B] hover:from-[#6366F1] hover:to-[#3730A3] border-b-4 border-[#312E81] text-white',
      'bg-gradient-to-b from-[#0284C7] via-[#1D4ED8] to-[#1E3A8A] hover:from-[#38BDF8] hover:to-[#1D4ED8] border-b-4 border-[#1E3A8A] text-white',
    ],
    playedTileClass: 'bg-slate-900/70 border border-slate-800 text-slate-700',
    questionHeaderClass: 'bg-gradient-to-r from-[#312E81] via-[#4F46E5] to-[#312E81]',
    icons: [
      '🚀', '🪐', '🌍', '🌙', '⭐', '☄️', '🛸', '👩‍🚀',
      '🛰️', '🔭', '🌌', '☀️', '🌠', '🌑', '⚡', '💫',
      '🌕', '🌎', '🧭', '👨‍🚀', '🪐', '🚀', '🌟', '🛸',
    ],
  },
  {
    id: 'science',
    name: 'Science Lab',
    previewIcon: '🧪',
    swatchClass: 'from-[#0D9488] to-[#0284C7]',
    headerBgClass: 'bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#0F766E]',
    headerBorderClass: 'border-teal-700/60',
    headerLightText: true,
    activeTeamBadgeClass: 'bg-amber-400 text-slate-950',
    controlBtnClass: 'bg-teal-800/80 hover:bg-teal-900 text-white',
    boardBgClass: 'bg-[#F0FDFA]',
    tileClasses: [
      'bg-gradient-to-b from-[#0EA5E9] via-[#0284C7] to-[#0369A1] hover:from-[#38BDF8] hover:to-[#0284C7] border-b-4 border-[#075985] text-white',
      'bg-gradient-to-b from-[#14B8A6] via-[#0D9488] to-[#0F766E] hover:from-[#2DD4BF] hover:to-[#0D9488] border-b-4 border-[#115E59] text-white',
    ],
    playedTileClass: 'bg-teal-100/60 border border-teal-200/70 text-teal-300',
    questionHeaderClass: 'bg-gradient-to-r from-[#0F766E] via-[#0284C7] to-[#0F766E]',
    icons: [
      '🧪', '🔬', '🧬', '⚛️', '🧲', '⚡', '🔋', '💡',
      '🌡️', '⚗️', '🧫', '🔭', '📐', '🧮', '⚙️', '💎',
      '🌿', '🧠', '🦠', '🫧', '⚖️', '📡', '🧭', '🔬',
    ],
  },
  {
    id: 'football',
    name: 'Stadium Cup',
    previewIcon: '⚽',
    swatchClass: 'from-[#16A34A] to-[#15803D]',
    headerBgClass: 'bg-gradient-to-r from-[#166534] via-[#15803D] to-[#166534]',
    headerBorderClass: 'border-green-800/60',
    headerLightText: true,
    activeTeamBadgeClass: 'bg-amber-400 text-slate-950',
    controlBtnClass: 'bg-green-800/90 hover:bg-green-900 text-white',
    boardBgClass: 'bg-[#ECFDF5]',
    tileClasses: [
      'bg-gradient-to-b from-[#22C55E] via-[#16A34A] to-[#15803D] hover:from-[#4ADE80] hover:to-[#16A34A] border-b-4 border-[#166534] text-white',
      'bg-gradient-to-b from-[#10B981] via-[#059669] to-[#047857] hover:from-[#34D399] hover:to-[#059669] border-b-4 border-[#065F46] text-white',
    ],
    playedTileClass: 'bg-emerald-100/60 border border-emerald-200/70 text-emerald-300',
    questionHeaderClass: 'bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#15803D]',
    icons: [
      '⚽', '🏆', '🥇', '👟', '🧤', '📣', '🚩', '🏟️',
      '⏱️', '🎯', '🔥', '💪', '🏅', '🎽', '⚡', '🌟',
      '🥁', '🎺', '🎉', '🥈', '🥉', '🥅', '⚽', '🏆',
    ],
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar Ocean',
    previewIcon: '⛵',
    swatchClass: 'from-[#06B6D4] to-[#0284C7]',
    headerBgClass: 'bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#0369A1]',
    headerBorderClass: 'border-sky-800/50',
    headerLightText: true,
    activeTeamBadgeClass: 'bg-amber-400 text-slate-950',
    controlBtnClass: 'bg-sky-800/80 hover:bg-sky-900 text-white',
    boardBgClass: 'bg-[#F0F9FF]',
    tileClasses: [
      'bg-gradient-to-b from-[#06B6D4] via-[#0891B2] to-[#0E7490] hover:from-[#22D3EE] hover:to-[#0891B2] border-b-4 border-[#155E75] text-white',
      'bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1] hover:from-[#7DD3FC] hover:to-[#0284C7] border-b-4 border-[#075985] text-white',
    ],
    playedTileClass: 'bg-sky-100/70 border border-sky-200/70 text-sky-300',
    questionHeaderClass: 'bg-gradient-to-r from-[#0E7490] via-[#0891B2] to-[#0E7490]',
    icons: [
      '⛵', '🐢', '🐬', '🐙', '🦀', '🐠', '🐡', '🦈',
      '🐳', '🪸', '🐚', '🧭', '🏝️', '⚓', '🌊', '💎',
      '🦜', '🥥', '🌴', '☀️', '🦞', '🪼', '🗺️', '⛵',
    ],
  },
  {
    id: 'emoji',
    name: 'Emoji Fun',
    previewIcon: '🎉',
    swatchClass: 'from-[#EC4899] to-[#8B5CF6]',
    headerBgClass: 'bg-gradient-to-r from-[#FBBF24] via-[#FCD34D] to-[#FBBF24]',
    headerBorderClass: 'border-amber-400/70',
    headerLightText: false,
    activeTeamBadgeClass: 'bg-[#F43F5E] text-white',
    controlBtnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    boardBgClass: 'bg-[#FFFDF7]',
    tileClasses: [
      'bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] hover:from-[#60A5FA] hover:to-[#2563EB] border-b-4 border-[#1E40AF] text-white',
      'bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED] border-b-4 border-[#5B21B6] text-white',
      'bg-gradient-to-b from-[#EC4899] to-[#BE185D] hover:from-[#F472B6] hover:to-[#DB2777] border-b-4 border-[#9D174D] text-white',
      'bg-gradient-to-b from-[#10B981] to-[#047857] hover:from-[#34D399] hover:to-[#059669] border-b-4 border-[#065F46] text-white',
      'bg-gradient-to-b from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#EA580C] border-b-4 border-[#B45309] text-white',
    ],
    playedTileClass: 'bg-slate-100 border border-slate-200/70 text-slate-300',
    questionHeaderClass: 'bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#7C3AED]',
    icons: [
      '🎯', '🌟', '🎈', '🎁', '🎨', '🎸', '🎲', '🧩',
      '🦄', '🐼', '🦊', '🐸', '🦋', '🌈', '🍕', '🍦',
      '🍓', '🍉', '👑', '💎', '🚀', '⚡', '🎪', '🎉',
    ],
  },
];

export function getElimikaBattleTheme(themeId?: string): ElimikaBattleTheme {
  return (
    ELIMIKA_BATTLE_THEMES.find((t) => t.id === themeId) || ELIMIKA_BATTLE_THEMES[0]
  );
}
