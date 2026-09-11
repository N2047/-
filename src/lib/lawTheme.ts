import { LawCategory } from "./lawsData";

export interface LawCategoryTheme {
  id: LawCategory | "all";
  name_ne: string;
  name_en: string;
  short_ne: string;
  icon: string;
  colorName_ne: string;
  dotColor: string;
  spineColor: string;
  // Category Bar Button Styles
  btnActive: string;
  btnInactive: string;
  // Document Card Styles
  cardClasses: string;
  badgeClasses: string;
  levelBadgeClasses: string;
  titleHoverClasses: string;
}

export const LAW_THEMES: Record<LawCategory | "all", LawCategoryTheme> = {
  all: {
    id: "all",
    name_ne: "सबै",
    name_en: "All Documents",
    short_ne: "सबै",
    icon: "📚",
    colorName_ne: "सबै दस्तावेज",
    dotColor: "bg-slate-700 dark:bg-slate-200",
    spineColor: "bg-slate-700 dark:bg-slate-300",
    btnActive: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-black shadow-md ring-2 ring-slate-400 border border-slate-800 dark:border-slate-200",
    btnInactive: "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700",
    cardClasses: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600",
    badgeClasses: "bg-slate-800 text-white",
    levelBadgeClasses: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    titleHoverClasses: "group-hover:text-blue-900 dark:group-hover:text-blue-400",
  },
  act: {
    id: "act",
    name_ne: "ऐन",
    name_en: "Acts",
    short_ne: "ऐन",
    icon: "⚖️",
    colorName_ne: "हल्का कलेजी (Wine / Maroon)",
    dotColor: "bg-[#7a1324]",
    spineColor: "bg-[#7a1324]",
    btnActive: "bg-[#7a1324] text-white font-black shadow-md ring-2 ring-[#a12338] border border-[#580d19]",
    btnInactive: "bg-[#fdf2f4] dark:bg-[#2b1016] text-[#7a1324] dark:text-[#f8cad1] hover:bg-[#fae2e6] dark:hover:bg-[#38151e] border border-[#f3b5c0] dark:border-[#5c1c28]",
    cardClasses: "bg-[#fdf3f5] dark:bg-[#250f15] border-[#eec8ce] dark:border-[#521b27] hover:border-[#8e192c] dark:hover:border-[#a3253b] text-[#580d19] dark:text-[#fce4e8]",
    badgeClasses: "bg-[#7a1324] text-white border border-[#580d19] shadow-xs",
    levelBadgeClasses: "bg-[#fae2e6] dark:bg-[#43141d] text-[#6d0f1e] dark:text-[#f8cad1] border border-[#e8b5be]/60",
    titleHoverClasses: "group-hover:text-[#7a1324] dark:group-hover:text-[#f8b4c0]",
  },
  rule: {
    id: "rule",
    name_ne: "नियमावली",
    name_en: "Rules / Regulations",
    short_ne: "नियमावली",
    icon: "📜",
    colorName_ne: "हल्का निलो (Light Blue)",
    dotColor: "bg-[#1d4ed8]",
    spineColor: "bg-[#2563eb]",
    btnActive: "bg-[#1d4ed8] text-white font-black shadow-md ring-2 ring-[#3b82f6] border border-[#1e40af]",
    btnInactive: "bg-[#eff6ff] dark:bg-[#0c1e3d] text-[#1d4ed8] dark:text-[#bfdbfe] hover:bg-[#dbeafe] dark:hover:bg-[#132c57] border border-[#bfdbfe] dark:border-[#1e40af]",
    cardClasses: "bg-[#f0f7ff] dark:bg-[#0c182e] border-[#bfdbfe] dark:border-[#1e3a8a] hover:border-[#2563eb] dark:hover:border-[#3b82f6] text-[#0f2d59] dark:text-[#dbeafe]",
    badgeClasses: "bg-[#1d4ed8] text-white border border-[#1e40af] shadow-xs",
    levelBadgeClasses: "bg-[#dbeafe] dark:bg-[#1e3a8a]/70 text-[#1e40af] dark:text-[#bfdbfe] border border-[#bfdbfe]/60",
    titleHoverClasses: "group-hover:text-blue-800 dark:group-hover:text-blue-300",
  },
  procedure: {
    id: "procedure",
    name_ne: "कार्यविधि",
    name_en: "Procedures",
    short_ne: "कार्यविधि",
    icon: "📋",
    colorName_ne: "हल्का खैरो (Light Gray)",
    dotColor: "bg-[#475569]",
    spineColor: "bg-[#475569]",
    btnActive: "bg-[#475569] text-white font-black shadow-md ring-2 ring-[#64748b] border border-[#334155]",
    btnInactive: "bg-[#f1f5f9] dark:bg-[#1e293b] text-[#334155] dark:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#2c3b52] border border-[#cbd5e1] dark:border-[#475569]",
    cardClasses: "bg-[#f8fafc] dark:bg-[#18202c] border-[#cbd5e1] dark:border-[#334155] hover:border-[#475569] dark:hover:border-[#64748b] text-[#1e293b] dark:text-[#e2e8f0]",
    badgeClasses: "bg-[#475569] text-white border border-[#334155] shadow-xs",
    levelBadgeClasses: "bg-[#e2e8f0] dark:bg-[#334155] text-[#334155] dark:text-[#e2e8f0] border border-[#cbd5e1]/60",
    titleHoverClasses: "group-hover:text-slate-900 dark:group-hover:text-slate-100",
  },
  directive: {
    id: "directive",
    name_ne: "निर्देशिका",
    name_en: "Directives",
    short_ne: "निर्देशिका",
    icon: "🧭",
    colorName_ne: "हल्का पहेलो (Light Yellow)",
    dotColor: "bg-[#ca8a04]",
    spineColor: "bg-[#ca8a04]",
    btnActive: "bg-[#ca8a04] text-white font-black shadow-md ring-2 ring-[#eab308] border border-[#a16207]",
    btnInactive: "bg-[#fefce8] dark:bg-[#292207] text-[#854d0e] dark:text-[#fde047] hover:bg-[#fef08a] dark:hover:bg-[#3d330c] border border-[#fde047] dark:border-[#713f12]",
    cardClasses: "bg-[#fefde8] dark:bg-[#221c06] border-[#fde047] dark:border-[#713f12] hover:border-[#ca8a04] dark:hover:border-[#ca8a04] text-[#713f12] dark:text-[#fef9c3]",
    badgeClasses: "bg-[#ca8a04] text-white border border-[#a16207] shadow-xs",
    levelBadgeClasses: "bg-[#fef08a] dark:bg-[#713f12]/60 text-[#854d0e] dark:text-[#fef08a] border border-[#fde047]/60",
    titleHoverClasses: "group-hover:text-amber-800 dark:group-hover:text-amber-300",
  },
  guideline: {
    id: "guideline",
    name_ne: "मार्गदर्शन",
    name_en: "Guidelines",
    short_ne: "मार्गदर्शन",
    icon: "🚩",
    colorName_ne: "हल्का रातो (Light Red)",
    dotColor: "bg-[#e11d48]",
    spineColor: "bg-[#e11d48]",
    btnActive: "bg-[#e11d48] text-white font-black shadow-md ring-2 ring-[#f43f5e] border border-[#be123c]",
    btnInactive: "bg-[#fff1f2] dark:bg-[#2c0d15] text-[#be123c] dark:text-[#fecdd3] hover:bg-[#ffe4e6] dark:hover:bg-[#40121d] border border-[#fecdd3] dark:border-[#881337]",
    cardClasses: "bg-[#fff1f3] dark:bg-[#270c13] border-[#fecdd3] dark:border-[#881337] hover:border-[#e11d48] dark:hover:border-[#e11d48] text-[#881337] dark:text-[#ffe4e6]",
    badgeClasses: "bg-[#e11d48] text-white border border-[#be123c] shadow-xs",
    levelBadgeClasses: "bg-[#ffe4e6] dark:bg-[#881337]/60 text-[#9f1239] dark:text-[#fecdd3] border border-[#fecdd3]/60",
    titleHoverClasses: "group-hover:text-rose-800 dark:group-hover:text-rose-300",
  },
  circular: {
    id: "circular",
    name_ne: "परिपत्र",
    name_en: "Circulars",
    short_ne: "परिपत्र",
    icon: "📨",
    colorName_ne: "हल्का हरियो (Light Green)",
    dotColor: "bg-[#15803d]",
    spineColor: "bg-[#16a34a]",
    btnActive: "bg-[#15803d] text-white font-black shadow-md ring-2 ring-[#22c55e] border border-[#166534]",
    btnInactive: "bg-[#f0fdf4] dark:bg-[#0c2415] text-[#15803d] dark:text-[#bbf7d0] hover:bg-[#dcfce7] dark:hover:bg-[#133820] border border-[#bbf7d0] dark:border-[#166534]",
    cardClasses: "bg-[#f1fdf5] dark:bg-[#092113] border-[#bbf7d0] dark:border-[#166534] hover:border-[#16a34a] dark:hover:border-[#22c55e] text-[#14532d] dark:text-[#dcfce7]",
    badgeClasses: "bg-[#15803d] text-white border border-[#166534] shadow-xs",
    levelBadgeClasses: "bg-[#dcfce7] dark:bg-[#166534]/60 text-[#166534] dark:text-[#bbf7d0] border border-[#bbf7d0]/60",
    titleHoverClasses: "group-hover:text-emerald-800 dark:group-hover:text-emerald-300",
  },
};

export function getLawTheme(category: LawCategory | string): LawCategoryTheme {
  if (category in LAW_THEMES) {
    return LAW_THEMES[category as LawCategory];
  }
  return LAW_THEMES.all;
}
