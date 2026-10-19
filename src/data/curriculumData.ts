export interface PaperRecord {
  id: string;
  title: string;
  form: string;
  subject: string;
  year: string;
  category: string;
  paperUrl: string | null;
  answersUrl: string | null;
  isBook: boolean;
  isSyllabus: boolean;
}

export interface LearnedMemoryItem {
  topic: string;
  content: string;
  cls: string;
  subject: string;
  timestamp: string;
}

export interface QuizHistoryRecord {
  id: string;
  cls: string;
  subject: string;
  topic: string;
  score: number;
  total: number;
  timestamp: string;
}

export interface UserProfileData {
  name: string;
  school: string;
  role: 'Teacher' | 'Student';
  targetClass: string;
}

export interface SiteResourceContext {
  syllabuses: Array<{ title: string; form: string; subject: string; year: string; hasUrl: boolean }>;
  books: Array<{ title: string; form: string; subject: string; year: string; hasUrl: boolean }>;
  papers: Array<{ title: string; form: string; subject: string; year: string; category: string; hasUrl: boolean; hasAnswers: boolean }>;
}

export interface TeacherMetadata {
  school: string;
  teacher: string;
  date: string;
  cls: string;
  subject: string;
  duration: string;
  topic: string;
  subTopic: string;
  regG: number;
  regB: number;
  regTotal: number;
  presG: number;
  presB: number;
  presTotal: number;
  siteResources?: SiteResourceContext;
}

export type OfficialDocType =
  | 'lessonplan'
  | 'schemeofwork'
  | 'markingscheme'
  | 'logbook'
  | 'lessonnotes'
  | 'exampaper'
  | 'blueprint';

export interface FlashcardItem {
  id: string;
  topic: string;
  front: string;
  back: string;
  formulaOrKeyPoint: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
  subTopic?: string;
  sourceRef?: string;
}

export const CONFIG = {
  SHEET_ID: '1-7C_G-VAC2ICxuT3XwADzAluRoDvQyd04yS4BtSvXxM',
  ITEMS_PER_PAGE: 12,
  SEARCH_DEBOUNCE_MS: 200,
  ADMIN_WHATSAPP: '255700000000',
};

export const TIE_CURRICULUM_SUBJECTS: Record<string, string[]> = {
  'Standard 1': ['Kusoma', 'Kuandika', 'Kuhesabu', 'Afya na Mazingira', 'Michezo na Sanaa'],
  'Standard 2': ['Kusoma', 'Kuandika', 'Kuhesabu', 'Afya na Mazingira', 'Michezo na Sanaa'],
  'Standard 3': ['Kiswahili', 'English', 'Hisabati (Mathematics)', 'Sayansi (Science)', 'Jiografia na Mazingira', 'Historia ya Tanzania na Maadili', 'Sanaa na Michezo'],
  'Standard 4': ['Kiswahili', 'English', 'Hisabati (Mathematics)', 'Sayansi (Science)', 'Jiografia na Mazingira', 'Historia ya Tanzania na Maadili', 'Sanaa na Michezo'],
  'Standard 5': ['Kiswahili', 'English', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Standard 6': ['Kiswahili', 'English', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Standard 7': ['Kiswahili', 'English', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Form 1': ['Basic Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Agriculture'],
  'Form 2': ['Basic Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Agriculture'],
  'Form 3': ['Basic Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Literature in English'],
  'Form 4': ['Basic Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Literature in English'],
  'Form 5': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Economics', 'Accountancy', 'Commerce', 'English Language', 'Kiswahili', 'Computer Science'],
  'Form 6': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Economics', 'Accountancy', 'Commerce', 'English Language', 'Kiswahili', 'Computer Science'],
};

export const TIE_SYLLABUS_COMPETENCES: Record<string, Record<string, string[]>> = {
  'Basic Mathematics': {
    'Form 1': [
      '1.0 Numbers & Mathematical Language (Rational, Irrational, Real Numbers, Approximations)',
      '2.0 Fractions, Decimals, Percentages, Ratios & Proportions',
      '3.0 Algebra (Linear Equations, Simultaneous Equations, Inequalities)',
      '4.0 Geometry & Coordinate Geometry (Gradient, Straight Line Equations)',
    ],
    'Form 2': [
      '1.0 Exponents, Radicals & Logarithms',
      '2.0 Algebra (Quadratic Expressions & Equations, Factorisation)',
      '3.0 Congruence, Similarity & Geometrical Transformations',
      '4.0 Pythagoras Theorem & Right-Angled Trigonometry',
      '5.0 Sets & Statistics',
    ],
    'Form 3': [
      '1.0 Relations & Functions (Linear, Quadratic, Polynomial)',
      '2.0 Sequences & Series (AP and GP)',
      '3.0 Circles, Earth as a Sphere (Great Circles, Meridians, Shortest Distance)',
      '4.0 Accounts (Double Entry, Trial Balance, Financial Statements)',
    ],
    'Form 4': [
      '1.0 Coordinate Geometry & Vectors',
      '2.0 Area & Perimeter of Regular Polygons',
      '3.0 Three-Dimensional Figures (Surface Area, Volume, Angle Between Line & Plane)',
      '4.0 Probability',
      '5.0 Matrices & Linear Transformations (2x2 Matrices, Inverse, Cramer Rule, Linear Programming)',
    ],
  },
  'Biology': {
    'Form 1': [
      '1.0 Introduction to Biology & Scientific Processes',
      '2.0 Safety in Our Environment & First Aid',
      '3.0 Cell Structure and Organization',
      '4.0 Classification of Living Things',
    ],
    'Form 2': [
      '1.0 Nutrition in Plants and Animals (Photosynthesis & Human Digestive System)',
      '2.0 Food Processing, Preservation and Storage',
      '3.0 Balance of Nature & Natural Environment',
      '4.0 Transport of Materials in Living Things',
      '5.0 Gaseous Exchange and Respiration',
    ],
    'Form 3': [
      '1.0 Classification of Kingdom Plantae & Animalia',
      '2.0 Movement & Locomotion',
      '3.0 Coordination (Nervous & Hormonal Systems) and Sense Organs',
      '4.0 Excretion and Regulation (Homeostasis)',
      '5.0 Reproduction in Plants and Animals',
    ],
    'Form 4': [
      '1.0 Growth and Development',
      '2.0 Genetics, Mendelian Inheritance & Variation',
      '3.0 Classification of Arthropoda & Chordata',
      '4.0 Organic Evolution',
      '5.0 HIV/AIDS and STIs',
    ],
  },
  'Chemistry': {
    'Form 1': [
      '1.0 Introduction to Chemistry & Laboratory Techniques',
      '2.0 Heat Sources, Flames & Scientific Procedure',
      '3.0 Matter (States, Physical & Chemical Changes, Separation of Mixtures)',
      '4.0 Air, Combustion, Rusting and Firefighting',
    ],
    'Form 2': [
      '1.0 Oxygen and Hydrogen',
      '2.0 Water (Treatment & Purification)',
      '3.0 Fuels and Energy',
      '4.0 Atomic Structure, Periodic Table, Bonding & Formulae/Nomenclature',
    ],
    'Form 3': [
      '1.0 Chemical Equations, Hardness of Water',
      '2.0 Acids, Bases and Salts',
      '3.0 The Mole Concept and Volumetric Analysis (Titration)',
      '4.0 Ionic Theory and Electrolysis (Faraday Laws)',
      '5.0 Chemical Kinetics, Equilibrium and Energetics',
    ],
    'Form 4': [
      '1.0 Extraction of Metals (Sodium, Aluminium, Iron, Copper)',
      '2.0 Compounds of Metals & Non-Metals (Chlorine, Sulphur, Nitrogen)',
      '3.0 Organic Chemistry (Hydrocarbons, Alcohols, Carboxylic Acids, Polymers)',
      '4.0 Soil Chemistry and Environmental Pollution',
    ],
  },
  'Physics': {
    'Form 1': [
      '1.0 Introduction to Physics & Laboratory Rules',
      '2.0 Measurement, Density & Relative Density',
      '3.0 Force, Archimedes Principle & Law of Flotation',
      '4.0 Structure and Properties of Matter (Elasticity, Surface Tension, Capillarity)',
      '5.0 Pressure, Work, Energy, Power & Light',
    ],
    'Form 2': [
      '1.0 Static Electricity & Current Electricity (Ohm Law)',
      '2.0 Magnetism & Earth Magnetic Field',
      '3.0 Forces in Equilibrium (Moments, Center of Gravity) & Simple Machines',
      '4.0 Motion in a Straight Line (Newton Laws of Motion)',
      '5.0 Temperature and Sustainable Energy Sources',
    ],
    'Form 3': [
      '1.0 Applications of Vectors & Friction',
      '2.0 Light (Reflection & Refraction at Curved Mirrors and Lenses, Optical Instruments)',
      '3.0 Thermal Expansion, Transfer of Thermal Energy & Measurement of Heat',
      '4.0 Vapour, Humidity and Current Electricity (EMF, Internal Resistance)',
    ],
    'Form 4': [
      '1.0 Waves & Sound Waves, Electromagnetic Spectrum',
      '2.0 Electromagnetism (Induction, Transformers)',
      '3.0 Radioactivity (Alpha, Beta, Gamma, Half-Life)',
      '4.0 Thermionic Emission & Electronics (Semiconductors, Diodes, Transistors)',
      '5.0 Elementary Astronomy & Geophysics',
    ],
  },
  'Geography': {
    'Form 1': ['1.0 Concept of Geography & The Solar System', '2.0 Major Features of the Earth Surface', '3.0 Weather and Climate', '4.0 Map Work'],
    'Form 2': ['1.0 Human Activities', '2.0 Agriculture, Water Management & Forest Resources', '3.0 Mining, Tourism, Manufacturing & Sustainable Energy', '4.0 Transport'],
    'Form 3': ['1.0 Structure of the Earth & Forces Affecting the Earth', '2.0 Soil', '3.0 Elementary Survey & Map Reading', '4.0 Photograph Reading & Application of Statistics'],
    'Form 4': ['1.0 Introduction to Research', '2.0 Climate and Natural Regions', '3.0 Human Population & Settlements', '4.0 Environmental Issues and Management'],
  },
  'History': {
    'Form 1': ['1.0 Sources and Importance of History', '2.0 Evolution of Man, Technology and Environment', '3.0 Development of Economic Activities and Their Impact', '4.0 Development of Social and Political Systems'],
    'Form 2': ['1.0 Interactions Among the People of Africa', '2.0 Socio-Economic Development and Production in Pre-Colonial Africa', '3.0 Africa and the External World', '4.0 Industrial Capitalism'],
    'Form 3': ['1.0 Establishment of Colonialism', '2.0 Colonial Administrative Systems', '3.0 Colonial Economy', '4.0 Colonial Social Services'],
    'Form 4': ['1.0 Crises in the Capitalist System', '2.0 Nationalism and Decolonisation', '3.0 Changes in Political, Social and Economic Policies in Africa After Independence', '4.0 Africa in International Affairs'],
  },
  'Civics': {
    'Form 1': ['1.0 Our Nation', '2.0 Promotion of Life Skills', '3.0 Human Rights & Responsible Citizenship', '4.0 Work, Family Life, Road Safety Education'],
    'Form 2': ['1.0 Government of Tanzania', '2.0 Democracy', '3.0 Gender'],
    'Form 3': ['1.0 Economic and Social Development', '2.0 Poverty Eradication in Tanzania'],
    'Form 4': ['1.0 Culture', '2.0 Globalization'],
  },
  'English Language': {
    'Form 1': ['1.0 Listening & Speaking Skills', '2.0 Reading Comprehension & Summary', '3.0 Grammar & Tenses', '4.0 Writing Personal & Official Letters'],
    'Form 2': ['1.0 Expressing Opinions & Debates', '2.0 Reading Literary Texts', '3.0 Active/Passive Voice & Conditional Sentences', '4.0 Writing Cards, Invitations & Compositions'],
    'Form 3': ['1.0 Literary Analysis (Novels, Plays, Poetry)', '2.0 Direct & Indirect Speech', '3.0 Essay & Speech Writing', '4.0 Comprehension & Summary Writing'],
    'Form 4': ['1.0 Appreciation of Literary Works (Plays, Novels, Poetry)', '2.0 Writing CV, Application Letters & Reports', '3.0 Advanced Grammar & Structure', '4.0 NECTA Paper 1 & Literature Revision'],
  },
  'Kiswahili': {
    'Form 1': ['1.0 Mawasiliano na Lugha', '2.0 Aina za Maneno na Sarufi', '3.0 Fasihi Simulizi', '4.0 Uandishi wa Barua na Insha'],
    'Form 2': ['1.0 Mnyumbuliko wa Maneno na Viambishi', '2.0 Uhakiki wa Kazi za Fasihi Simulizi', '3.0 Ufahamu na Ufupisho', '4.0 Utungaji wa Simu, Kadi na Risala'],
    'Form 3': ['1.0 Tungo na Uchambuzi wa Sentensi', '2.0 Maendeleo ya Kiswahili', '3.0 Uhakiki wa Fasihi Andishi (Riwaya, Tamthiliya, Ushairi)', '4.0 Uandishi wa Matangazo na Kumbukumbu'],
    'Form 4': ['1.0 Historia na Ukuzaji wa Kiswahili', '2.0 Uhakiki wa Riwaya, Tamthiliya na Mashairi', '3.0 Uandishi wa Hotuba na Insha za Kitaaluma', '4.0 Majaribio na Marudio ya NECTA'],
  },
};

export const MOHA_BUILTIN_KNOWLEDGE = [
  {
    keywords: ['photosynthesis', 'nutrition in plants', 'chlorophyll', 'photolysis', 'calvin cycle'],
    title: 'Photosynthesis (Biology — Form 2 Nutrition in Plants)',
    content: `**Definition:** Photosynthesis is the biochemical process by which green plants manufacture organic food (glucose) from carbon dioxide and water in the presence of sunlight energy trapped by chlorophyll.\n\n**Balanced Chemical Equation:**\n$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Sunlight / Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$\n\n**Stages of Photosynthesis:**\n1. **Light Reaction (Photolysis - Grana):** Splits water molecules ($2\\text{H}_2\\text{O} \\rightarrow 4\\text{H}^+ + \\text{O}_2 + 4e^-$) and forms ATP.\n2. **Dark Reaction (Calvin Cycle - Stroma):** Reduces $\\text{CO}_2$ using hydrogen ions and ATP to form glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$).\n\n**Leaf Adaptations (NECTA Points - 02 Marks @):**\n• Broad, flat lamina for large surface area to trap maximum sunlight.\n• Numerous stomata for efficient gaseous exchange ($\\text{CO}_2$ and $\\text{O}_2$).\n• Palisade mesophyll cells densely packed with chloroplasts.\n• Network of xylem (supplies water) and phloem (translocates manufactured food).`,
  },
  {
    keywords: ['ohm', 'resistance', 'current electricity', 'voltage', 'resistor'],
    title: "Ohm's Law & Current Electricity (Physics — Form 2)",
    content: `**Ohm's Law:** States that electric current ($I$) flowing through a metallic conductor is directly proportional to the potential difference ($V$) across its ends, provided temperature and other physical conditions remain constant.\n\n$$V = I \\times R \\quad \\Rightarrow \\quad I = \\frac{V}{R} \\quad \\Rightarrow \\quad R = \\frac{V}{I}$$\n\n**Combination of Resistors:**\n• **Series Arrangement:** $R_{\\text{total}} = R_1 + R_2 + R_3$ (Same current $I$ flows through each).\n• **Parallel Arrangement:** $\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2}$ (Same voltage $V$ across each).\n\n**Factors Affecting Resistance ($R = \\rho \\frac{L}{A}$):**\n1. Length of conductor ($R \\propto L$)\n2. Cross-sectional area ($R \\propto \\frac{1}{A}$)\n3. Temperature of conductor\n4. Nature of material (Resistivity $\\rho$)`,
  },
  {
    keywords: ['archimedes', 'flotation', 'upthrust', 'buoyancy', 'hydrometer'],
    title: "Archimedes' Principle & Law of Flotation (Physics — Form 1)",
    content: `**1. Archimedes' Principle:** States that when a body is partially or totally immersed in a fluid, it experiences an upthrust which is equal to the weight of the fluid displaced.\n$$\\text{Upthrust } (U) = \\text{Real Weight } (W_a) - \\text{Apparent Weight } (W_f)$$\n$$\\text{Relative Density (R.D)} = \\frac{\\text{Weight in Air}}{\\text{Upthrust in Water}} = \\frac{W_a}{W_a - W_w}$$\n\n**2. Law of Flotation:** A floating body displaces its own weight of the fluid in which it floats.\n• Applications: Ships, submarines, hydrometers, hot-air balloons.`,
  },
  {
    keywords: ['mole', 'molarity', 'titration', 'avogadro', 'volumetric'],
    title: 'The Mole Concept & Volumetric Analysis (Chemistry — Form 3)',
    content: `**Key Formulas:**\n1. $\\text{Number of moles }(n) = \\frac{\\text{Mass }(m)}{\\text{Molar Mass }(M_r)} = \\frac{\\text{Number of Particles }(N)}{6.02 \\times 10^{23}}$\n2. At STP, $n = \\frac{\\text{Volume of gas (dm}^3\\text{)}}{22.4\\text{ dm}^3/\\text{mol}}$\n3. $\\text{Molarity }(M) = \\frac{\\text{Concentration in g/dm}^3}{\\text{Molar Mass }(M_r)}$\n4. **Titration Equation:**\n$$\\frac{M_A V_A}{M_B V_B} = \\frac{n_A}{n_B}$$\nWhere $M_A, V_A, n_A$ are molarity, volume, and stoichiometric mole ratio of the acid, and $M_B, V_B, n_B$ are for the base.`,
  },
  {
    keywords: ['quadratic', 'factorize', 'roots', 'discriminant', 'completing the square'],
    title: 'Quadratic Equations & Expressions (Basic Mathematics — Form 2)',
    content: `**General Form:** $ax^2 + bx + c = 0$ where $a \\neq 0$.\n\n**General Quadratic Formula:**\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n**Nature of Roots (Discriminant $\\Delta = b^2 - 4ac$):**\n• If $b^2 - 4ac > 0$: Two distinct real roots.\n• If $b^2 - 4ac = 0$: Two equal (repeated) real roots.\n• If $b^2 - 4ac < 0$: No real roots (complex roots).`,
  },
  {
    keywords: ['sequence', 'series', 'arithmetic progression', 'geometric progression', 'compound interest'],
    title: 'Sequences & Series (Basic Mathematics — Form 3)',
    content: `**1. Arithmetic Progression (AP):**\n• $n^{\\text{th}}$ Term: $A_n = A_1 + (n - 1)d$\n• Sum of $n$ terms: $S_n = \\frac{n}{2}[2A_1 + (n - 1)d] = \\frac{n}{2}(A_1 + A_n)$\n\n**2. Geometric Progression (GP):**\n• $n^{\\text{th}}$ Term: $G_n = G_1 r^{n - 1}$\n• Sum of $n$ terms: $S_n = \\frac{G_1(r^n - 1)}{r - 1}$ (for $r > 1$) or $S_n = \\frac{G_1(1 - r^n)}{1 - r}$ (for $r < 1$)\n\n**3. Compound Interest:**\n$$A_n = P\\left(1 + \\frac{R}{100}\\right)^n$$`,
  },
  {
    keywords: ['newton', 'motion', 'acceleration', 'velocity', 'momentum', 'impulse'],
    title: "Newton's Laws of Motion & Linear Motion (Physics — Form 2)",
    content: `**Equations of Uniformly Accelerated Motion:**\n1. $v = u + at$\n2. $s = ut + \\frac{1}{2}at^2$\n3. $v^2 = u^2 + 2as$\n\n**Newton's Three Laws of Motion:**\n• **1st Law (Inertia):** A body remains at rest or uniform motion in a straight line unless acted upon by an external resultant force.\n• **2nd Law:** Rate of change of momentum is directly proportional to applied force ($F = ma = \\frac{mv - mu}{t}$).\n• **3rd Law:** To every action there is an equal and opposite reaction.`,
  },
];

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeClassName(rawForm: string): string {
  const f = (rawForm || '').trim();
  const lower = f.toLowerCase();
  if (/^(form\s*1|form\s*i|form\s*one|f1)$/i.test(lower)) return 'Form 1';
  if (/^(form\s*2|form\s*ii|form\s*two|f2)$/i.test(lower)) return 'Form 2';
  if (/^(form\s*3|form\s*iii|form\s*three|f3)$/i.test(lower)) return 'Form 3';
  if (/^(form\s*4|form\s*iv|form\s*four|f4)$/i.test(lower)) return 'Form 4';
  if (/^(form\s*5|form\s*v|form\s*five|f5)$/i.test(lower)) return 'Form 5';
  if (/^(form\s*6|form\s*vi|form\s*six|f6)$/i.test(lower)) return 'Form 6';
  if (/^(std\s*1|standard\s*1|standard\s*i)$/i.test(lower)) return 'Standard 1';
  if (/^(std\s*2|standard\s*2|standard\s*ii)$/i.test(lower)) return 'Standard 2';
  if (/^(std\s*3|standard\s*3|standard\s*iii)$/i.test(lower)) return 'Standard 3';
  if (/^(std\s*4|standard\s*4|standard\s*iv)$/i.test(lower)) return 'Standard 4';
  if (/^(std\s*5|standard\s*5|standard\s*v)$/i.test(lower)) return 'Standard 5';
  if (/^(std\s*6|standard\s*6|standard\s*vi)$/i.test(lower)) return 'Standard 6';
  if (/^(std\s*7|standard\s*7|standard\s*vii)$/i.test(lower)) return 'Standard 7';
  return f || 'Form 4';
}

export function getSyllabusTopicsForClassSubject(cls: string, subject: string): string[] {
  const cleanCls = normalizeClassName(cls || 'Form 3');
  const cleanSub = (subject || 'Basic Mathematics').trim();
  const subjectKey = Object.keys(TIE_SYLLABUS_COMPETENCES).find(
    (k) => k.toLowerCase() === cleanSub.toLowerCase() || cleanSub.toLowerCase().includes(k.toLowerCase())
  );
  if (subjectKey && TIE_SYLLABUS_COMPETENCES[subjectKey]) {
    const classMap = TIE_SYLLABUS_COMPETENCES[subjectKey];
    if (classMap[cleanCls]) {
      return classMap[cleanCls];
    }
    return Object.values(classMap).flat().slice(0, 6);
  }
  return [
    `1.0 Core Principles and Competence Foundations in ${cleanSub}`,
    `2.0 Conceptual Analysis and Practical Procedures in ${cleanSub}`,
    `3.0 Problem Solving, Calculations, and Real-Life Applications in ${cleanSub}`,
    `4.0 NECTA Examination Assessment and Revision in ${cleanSub}`,
  ];
}

export function isFormOneClass(clsStr: string): boolean {
  const c = (clsStr || '').trim().toLowerCase();
  return c === 'form 1' || c === 'form one' || c === 'form i';
}

export function getDefaultFlashcardsForSubject(cls: string, subject: string): FlashcardItem[] {
  const topics = getSyllabusTopicsForClassSubject(cls, subject);
  return [
    {
      id: `fc-1-${cls}-${subject}`,
      topic: topics[0] || `1.0 Core Principles of ${subject}`,
      front: `What is the primary competence focus of ${topics[0] || subject} in ${cls} ${subject}?`,
      back: `Mastering fundamental definitions, governing laws, and standard TIE textbook procedures for ${topics[0] || subject} to solve real-world Tanzanian problems.`,
      formulaOrKeyPoint: `NECTA Section A & B (06–09 Marks)`,
    },
    {
      id: `fc-2-${cls}-${subject}`,
      topic: topics[1] || `2.0 Practical & Analytical Methods in ${subject}`,
      front: `How are marks awarded in NECTA Section B structured questions for ${topics[1] || subject}?`,
      back: `1 Mark for extracting given data, 2 Marks for stating the governing formula/principle, 4 Marks for systematic step-by-step substitution, and 2 Marks for final answer with SI units.`,
      formulaOrKeyPoint: `Method Marks (M1, M2) + Accuracy Mark (A1)`,
    },
    {
      id: `fc-3-${cls}-${subject}`,
      topic: topics[2] || `3.0 Problem Solving in ${subject}`,
      front: `State three essential steps when answering experimental or diagram-based questions in ${cls} ${subject}.`,
      back: `1. Draw a clear, well-labeled diagram or table of values. 2. Identify independent and dependent variables. 3. Formulate a scientific/mathematical conclusion linked to TIE theory.`,
      formulaOrKeyPoint: `TIE Competence-Based Assessment`,
    },
    {
      id: `fc-4-${cls}-${subject}`,
      topic: topics[3] || `4.0 NECTA Examination Revision in ${subject}`,
      front: `How should a candidate structure a 15-Mark Section C Essay / Comprehensive Problem in ${cls} ${subject}?`,
      back: `Include a clear Introduction defining key terms (02 Marks), 5 to 6 well-explained body paragraphs or worked stages (12 Marks), and a relevant Conclusion (01 Mark).`,
      formulaOrKeyPoint: `Section C Weighting: 30 Marks Total`,
    },
  ];
}

export function buildInstantOfficialDocument(
  type: OfficialDocType,
  meta: Partial<TeacherMetadata>,
  aiEnhancedDetails?: {
    mainCompetence?: string;
    specificCompetence?: string;
    introTeacher?: string;
    introStudent?: string;
    compTeacher?: string;
    compStudent?: string;
    designTeacher?: string;
    designStudent?: string;
    realTeacher?: string;
    realStudent?: string;
    remarks?: string;
    markingItems?: Array<{ qn: string; item: string; rubric: string; marks: string }>;
    notesSummary?: string;
    keyConcepts?: Array<{ heading: string; explanation: string }>;
    workedExamples?: Array<{ problem: string; solution: string }>;
    practiceQuestions?: Array<{ question: string; answerHint: string }>;
  }
): string {
  const school = escapeHtml((meta.school || 'SECONDARY SCHOOL').toUpperCase());
  const teacher = escapeHtml((meta.teacher || 'MWALIMU').toUpperCase());
  const cls = escapeHtml(meta.cls || 'Form 1');
  const subject = escapeHtml(meta.subject || 'Basic Mathematics');
  const topic = escapeHtml(meta.topic || 'Core Competence');
  const subTopic = escapeHtml(meta.subTopic || meta.topic || 'Specific Activity');
  const dateStr = escapeHtml(meta.date || new Date().toISOString().split('T')[0]);
  const duration = escapeHtml(meta.duration || '80 Minutes');
  const regG = meta.regG ?? 25;
  const regB = meta.regB ?? 25;
  const regTotal = regG + regB;
  const presG = meta.presG ?? 24;
  const presB = meta.presB ?? 24;
  const presTotal = presG + presB;

  const matchedBooks = meta.siteResources?.books?.map((b) => escapeHtml(b.title)).slice(0, 2) || [];
  const matchedPapers = meta.siteResources?.papers?.map((p) => `${escapeHtml(p.title)} (${escapeHtml(p.year)})`).slice(0, 3) || [];
  const matchedSyllabuses = meta.siteResources?.syllabuses?.map((s) => escapeHtml(s.title)).slice(0, 2) || [];

  const resourceRefString = [
    matchedBooks.length > 0 ? matchedBooks.join(', ') : `Official TIE ${cls} ${subject} Student's Book`,
    matchedSyllabuses.length > 0 ? matchedSyllabuses.join(', ') : `TIE ${subject} Syllabus`,
    matchedPapers.length > 0 ? `Elimika Past Papers: ${matchedPapers.join(', ')}` : `NECTA Past Examination Papers`,
  ].join(' • ');

  if (type === 'lessonnotes') {
    const concepts = aiEnhancedDetails?.keyConcepts?.length
      ? aiEnhancedDetails.keyConcepts
      : [
          {
            heading: `1. Meaning, Definition & Core Principles of ${subTopic}`,
            explanation: `In the official TIE ${cls} ${subject} curriculum under the main topic "${topic}", ${subTopic} covers the foundational definitions, governing laws, and core scientific/academic principles. Students should always begin by stating the clear TIE Student's Book definition before explaining the underlying mechanism.`,
          },
          {
            heading: `2. Key Formulas, Standard Procedures & Step-by-Step Mechanisms`,
            explanation: `To solve problems on ${subTopic} accurately in NECTA examinations, first list all given data in standard SI units, state the governing formula or rule, substitute the values systematically, and write the final conclusion clearly.`,
          },
          {
            heading: `3. Real-Life Applications & Importance in Tanzania`,
            explanation: `${subTopic} is widely applied across Tanzania in everyday problem solving, industrial production, environmental conservation, healthcare, and technology. Understanding practical examples earns full application marks in Section B and Section C.`,
          },
        ];

    const examples = aiEnhancedDetails?.workedExamples?.length
      ? aiEnhancedDetails.workedExamples
      : [
          {
            problem: `Worked Example 1 (TIE Textbook Standard): Define ${subTopic} and solve a standard structured problem under ${topic}.`,
            solution: `Step 1 (Identify Given Data & Definition): State the official TIE ${cls} ${subject} definition of ${subTopic} and write down the given parameters [01 Mark].\nStep 2 (Formula / Principle): State the governing formula or principle linking the variables [02 Marks].\nStep 3 (Substitution & Final Answer): Substitute the values step-by-step and state the final answer with appropriate units [02 Marks].`,
          },
          {
            problem: `Worked Example 2 (NECTA Past Paper Application): Explain how ${subTopic} is applied in practical laboratory or real-life situations in Tanzania.`,
            solution: `Step 1 (Core Mechanism): Identify the main principle of ${subTopic} involved in the scenario [02 Marks].\nStep 2 (Practical Explanation): Explain two concrete ways ${subTopic} operates in laboratory or daily Tanzanian contexts [02 Marks].\nStep 3 (Conclusion): Summarize the expected observation or result clearly [01 Mark].`,
          },
        ];

    const practiceQs = aiEnhancedDetails?.practiceQuestions?.length
      ? aiEnhancedDetails.practiceQuestions
      : [
          {
            question: `Define ${subTopic} and state two fundamental principles studied in ${cls} ${subject}. (04 Marks)`,
            answerHint: `Clear TIE textbook definition = 02 Marks; Two valid principles (01 Mark each) = 02 Marks.`,
          },
          {
            question: `Describe three practical applications of ${topic} (${subTopic}) in daily life in Tanzania. (06 Marks)`,
            answerHint: `Three well-explained applications with relevant examples (02 Marks each) = 06 Marks.`,
          },
          {
            question: `Solve a structured past-paper problem on ${subTopic} showing all working steps clearly. (10 Marks)`,
            answerHint: `Given data (02 Marks) → Formula/Method (02 Marks) → Step-by-step working (04 Marks) → Final Answer with units (02 Marks).`,
          },
        ];

    const formatExplanationHtml = (raw: string) => {
      const escaped = escapeHtml(raw);
      const sentences = escaped
        .split(/(?<=\.)\s+|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sentences.length <= 1) {
        return `<p style="margin:0; line-height:1.65; color:#1e293b;">${escaped}</p>`;
      }
      return `<p style="margin:0 0 6px 0; line-height:1.65; color:#1e293b;">${sentences[0]}</p>
        <ul style="margin:0; padding-left:18px; color:#334155; line-height:1.6;">
          ${sentences
            .slice(1)
            .map((s) => `<li style="margin-bottom:3px;">${s}</li>`)
            .join('')}
        </ul>`;
    };

    const formatSolutionStepsHtml = (raw: string) => {
      const escaped = escapeHtml(raw);
      const lines = escaped
        .split(/\n+|(?=\bStep\s*\d+)/i)
        .map((s) => s.trim())
        .filter(Boolean);
      return lines
        .map(
          (line) =>
            `<div style="margin-bottom:4px; line-height:1.6; color:#1e293b;">• ${line.replace(
              /^(Step\s*\d+[^:]*:)/i,
              '<strong>$1</strong>'
            )}</div>`
        )
        .join('');
    };

    return `<div class="official-tie-doc" style="padding:18px 20px; line-height:1.6; color:#0f172a; background:#ffffff; border:1px solid #cbd5e1; border-radius:10px;">
      <!-- Clean Document Title Banner -->
      <div style="text-align:center; border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:14px;">
        <div style="font-weight:800; font-size:11px; letter-spacing:0.04em; color:#475569; text-transform:uppercase;">
          THE UNITED REPUBLIC OF TANZANIA · TANZANIA INSTITUTE OF EDUCATION (TIE)
        </div>
        <div style="font-weight:900; font-size:15px; color:#0f172a; margin-top:2px; text-transform:uppercase;">
          ${school} — COMPREHENSIVE LESSON NOTES
        </div>
        <div style="font-weight:700; font-size:12px; color:#1d4ed8; margin-top:2px;">
          ${cls} · ${subject} — ${topic}: ${subTopic}
        </div>
      </div>

      <!-- Clean Metadata Strip (No Table) -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; margin-bottom:16px; font-size:11.5px; line-height:1.6;">
        <div style="display:flex; flex-wrap:wrap; gap:6px 20px;">
          <div><strong>Class:</strong> ${cls}</div>
          <div><strong>Subject:</strong> ${subject}</div>
          <div><strong>Main Topic:</strong> ${topic}</div>
          <div><strong>Sub-Topic:</strong> ${subTopic}</div>
          <div><strong>Prepared By:</strong> ${teacher}</div>
          <div><strong>Date:</strong> ${dateStr}</div>
        </div>
        <div style="margin-top:6px; padding-top:6px; border-top:1px solid #e2e8f0; color:#475569;">
          <strong>Reference Materials:</strong> ${resourceRefString}
        </div>
      </div>

      <!-- PART I: STRUCTURED TOPIC NOTES (CLEAN PROSE & BULLETS, NO TABLE) -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:#0f172a; text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:10px;">
          Part I: Core Topic Notes &amp; Key Concepts
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${concepts
            .map(
              (c) => `<div style="padding:10px 14px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px;">
                <div style="font-weight:800; font-size:12.5px; color:#1e3a8a; margin-bottom:5px;">
                  ${escapeHtml(c.heading)}
                </div>
                <div style="font-size:12px;">
                  ${formatExplanationHtml(c.explanation)}
                </div>
              </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- PART II: STEP-BY-STEP WORKED EXAMPLES (NO TABLE) -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:#0f172a; text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:10px;">
          Part II: Step-by-Step Worked Examples (TIE Textbook &amp; NECTA Standard)
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${examples
            .map(
              (ex, idx) => `<div style="padding:12px 14px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
                <div style="font-weight:800; font-size:12px; color:#0f172a; margin-bottom:6px;">
                  Example ${idx + 1}: ${escapeHtml(ex.problem)}
                </div>
                <div style="font-size:11.5px; padding-top:6px; border-top:1px dashed #cbd5e1;">
                  <div style="font-weight:800; color:#047857; margin-bottom:4px;">Worked Solution:</div>
                  ${formatSolutionStepsHtml(ex.solution)}
                </div>
              </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- PART III: SELF-ASSESSMENT & REVISION EXERCISE (NO TABLE) -->
      <div>
        <div style="font-weight:900; font-size:12.5px; color:#0f172a; text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:10px;">
          Part III: Self-Assessment &amp; NECTA Revision Exercise
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${practiceQs
            .map(
              (pq, idx) => `<div style="padding:10px 14px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; font-size:12px;">
                <div style="font-weight:800; color:#0f172a; margin-bottom:4px;">
                  Question ${idx + 1}: ${escapeHtml(pq.question)}
                </div>
                <div style="font-size:11.5px; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:5px 10px; border-radius:6px;">
                  <strong>Marking Guide / Key Points:</strong> ${escapeHtml(pq.answerHint)}
                </div>
              </div>`
            )
            .join('')}
        </div>
      </div>
    </div>`;
  }

  if (type === 'markingscheme') {
    const items = aiEnhancedDetails?.markingItems?.length
      ? aiEnhancedDetails.markingItems
      : [
          {
            qn: '1 (a)',
            item: `Define key terms and state governing principles of ${subTopic}.`,
            rubric: `• Clear definition of ${subTopic} = 02 Marks<br/>• Correct governing formula or principle = 02 Marks<br/>• One real-life application = 01 Mark`,
            marks: '05 Marks',
          },
          {
            qn: '1 (b)',
            item: `Explain three major factors or procedures in ${subTopic}.`,
            rubric: `• Factor/Procedure 1 well explained = 02 Marks<br/>• Factor/Procedure 2 well explained = 02 Marks<br/>• Factor/Procedure 3 well explained = 02 Marks`,
            marks: '06 Marks',
          },
          {
            qn: '2',
            item: `Solve structured problem and calculate required parameters for ${subTopic}.`,
            rubric: `• Extracting given data = 01 Mark<br/>• Appropriate formula/method = 02 Marks<br/>• Substitution &amp; calculation = 03 Marks<br/>• Final answer with SI units = 02 Marks`,
            marks: '08 Marks',
          },
          {
            qn: '3',
            item: `Essay / Comprehensive Analysis: Evaluate the importance of ${topic} in socio-economic development in Tanzania.`,
            rubric: `• Introduction = 02 Marks<br/>• 5 Well-explained main points (5 × 2.5) = 12.5 Marks<br/>• Relevant conclusion = 0.5 Mark`,
            marks: '15 Marks',
          },
        ];

    return `<div class="official-tie-doc">
      <div style="text-align:center; font-weight:900; font-size:13px; margin-bottom:8px; text-transform:uppercase;">
        THE UNITED REPUBLIC OF TANZANIA — NATIONAL EXAMINATIONS COUNCIL (NECTA)<br/>
        ${school} — OFFICIAL MARKING SCHEME (${cls.toUpperCase()} ${subject.toUpperCase()})
      </div>
      <table>
        <tr>
          <td><strong>Subject:</strong> ${subject}</td>
          <td><strong>Class:</strong> ${cls}</td>
          <td><strong>Date:</strong> ${dateStr}</td>
        </tr>
        <tr>
          <td><strong>Main Topic:</strong> ${topic}</td>
          <td><strong>Sub-Topic:</strong> ${subTopic}</td>
          <td><strong>Examiner:</strong> ${teacher}</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Referenced Past Papers &amp; TIE Books:</strong> ${resourceRefString}</td>
        </tr>
      </table>
      <table>
        <thead>
          <tr>
            <th style="width:10%;">QN NO.</th>
            <th style="width:32%;">ASSESSMENT ITEM</th>
            <th style="width:43%;">MODEL ANSWER &amp; SCORING RUBRIC</th>
            <th style="width:15%;">MARKS</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (row) => `<tr>
            <td><strong>${escapeHtml(row.qn)}</strong></td>
            <td>${escapeHtml(row.item)}</td>
            <td>${row.rubric}</td>
            <td><strong>${escapeHtml(row.marks)}</strong></td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <table>
        <tr>
          <td><strong>TOTAL MARKS: 34 MARKS</strong></td>
          <td><strong>Verified By Teacher:</strong> ${teacher}</td>
          <td><strong>Academic Sign:</strong> __________________</td>
        </tr>
      </table>
    </div>`;
  }

  if (type === 'lessonplan') {
    const mainComp = escapeHtml(aiEnhancedDetails?.mainCompetence || `Demonstrate mastery of ${subject} concepts in ${topic}`);
    const specComp = escapeHtml(aiEnhancedDetails?.specificCompetence || `Apply knowledge and skills of ${topic} (${subTopic}) in solving real-life problems`);
    const introT = escapeHtml(aiEnhancedDetails?.introTeacher || `Guide students through brainstorming questions to connect prior knowledge to ${subTopic}.`);
    const introS = escapeHtml(aiEnhancedDetails?.introStudent || `Respond to questions and share prior experiences related to ${subTopic}.`);
    const compT = escapeHtml(aiEnhancedDetails?.compTeacher || `Organize students in manageable groups to investigate, discuss, and demonstrate procedures on ${subTopic} using ${matchedBooks[0] || `TIE ${cls} ${subject} Book`}.`);
    const compS = escapeHtml(aiEnhancedDetails?.compStudent || `Collaborate in groups to analyze examples from the TIE textbook, discuss steps, and present findings on ${subTopic}.`);
    const desT = escapeHtml(aiEnhancedDetails?.designTeacher || `Guide students to apply acquired knowledge of ${subTopic} to solve past paper problems (${matchedPapers[0] || 'NECTA Past Papers'}).`);
    const desS = escapeHtml(aiEnhancedDetails?.designStudent || `Work out structured past examination and practical problems involving ${subTopic}.`);
    const realT = escapeHtml(aiEnhancedDetails?.realTeacher || `Administer short individual assessment tasks from ${matchedPapers[0] || 'NECTA questions'} and evaluate student mastery of ${subTopic}.`);
    const realS = escapeHtml(aiEnhancedDetails?.realStudent || `Complete individual exercises, summarize key points, and take home assignment.`);
    const remarks = escapeHtml(
      aiEnhancedDetails?.remarks ||
        `The lesson on ${subTopic} was successfully understood by ${presTotal} present students using ${resourceRefString}.`
    );

    return `<div class="official-tie-doc">
      <div style="text-align:center; font-weight:900; font-size:13px; margin-bottom:8px; text-transform:uppercase;">
        PRESIDENT'S OFFICE (PO-RALG) — TANZANIA INSTITUTE OF EDUCATION (TIE)<br/>
        COMPETENCE-BASED LESSON PLAN
      </div>
      <table>
        <tr>
          <td><strong>School:</strong> ${school}</td>
          <td><strong>Teacher:</strong> ${teacher}</td>
        </tr>
        <tr>
          <td><strong>Class:</strong> ${cls}</td>
          <td><strong>Subject:</strong> ${subject}</td>
        </tr>
        <tr>
          <td><strong>Time:</strong> ${duration}</td>
          <td><strong>Date:</strong> ${dateStr}</td>
        </tr>
      </table>
      <table>
        <thead>
          <tr><th colspan="6" style="text-align:center;">STUDENT ATTENDANCE</th></tr>
          <tr>
            <th colspan="3" style="text-align:center;">REGISTERED</th>
            <th colspan="3" style="text-align:center;">PRESENT</th>
          </tr>
          <tr>
            <th>Girls</th><th>Boys</th><th>Total</th>
            <th>Girls</th><th>Boys</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${regG}</td><td>${regB}</td><td><strong>${regTotal}</strong></td>
            <td>${presG}</td><td>${presB}</td><td><strong>${presTotal}</strong></td>
          </tr>
        </tbody>
      </table>
      <table>
        <tr><td style="width:28%;"><strong>Main Competence:</strong></td><td>${mainComp}</td></tr>
        <tr><td><strong>Specific Competence:</strong></td><td>${specComp}</td></tr>
        <tr><td><strong>Main Topic:</strong></td><td>${topic}</td></tr>
        <tr><td><strong>Sub-Topic / Activity:</strong></td><td>${subTopic}</td></tr>
        <tr><td><strong>Teaching &amp; Learning Resources:</strong></td><td>${resourceRefString}</td></tr>
      </table>
      <div style="font-weight:900; font-size:11px; margin:6px 0 4px 0; text-transform:uppercase;">Teaching and Learning Process (4-Stage TIE Model)</div>
      <table>
        <thead>
          <tr>
            <th style="width:16%;">Stages</th>
            <th style="width:10%;">Time</th>
            <th style="width:26%;">Teaching Activities</th>
            <th style="width:26%;">Learning Activities</th>
            <th style="width:22%;">Assessment Criteria</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Introduction</strong></td>
            <td>10 Mins</td>
            <td>${introT}</td>
            <td>${introS}</td>
            <td>Prior knowledge of ${subTopic} is clearly stated.</td>
          </tr>
          <tr>
            <td><strong>2. Competence Development</strong></td>
            <td>35 Mins</td>
            <td>${compT}</td>
            <td>${compS}</td>
            <td>Core principles &amp; procedures of ${subTopic} are demonstrated.</td>
          </tr>
          <tr>
            <td><strong>3. Design</strong></td>
            <td>20 Mins</td>
            <td>${desT}</td>
            <td>${desS}</td>
            <td>Practical and past paper problems on ${subTopic} are solved accurately.</td>
          </tr>
          <tr>
            <td><strong>4. Realisation</strong></td>
            <td>15 Mins</td>
            <td>${realT}</td>
            <td>${realS}</td>
            <td>Assessment questions on ${subTopic} are answered correctly.</td>
          </tr>
        </tbody>
      </table>
      <table>
        <tr>
          <td><strong>Teacher's Evaluation / Remarks:</strong> ${remarks}</td>
        </tr>
      </table>
    </div>`;
  }

  if (type === 'schemeofwork') {
    const showOrientation = isFormOneClass(meta.cls || '');
    const bookRef = matchedBooks[0] || `TIE (${cls} ${subject} Student's Book)`;
    const paperRef = matchedPapers[0] || `NECTA Past Papers`;
    return `<div class="official-tie-doc" data-orientation="landscape">
      <div style="text-align:center; font-weight:900; font-size:13px; margin-bottom:6px; text-transform:uppercase;">
        PRESIDENT'S OFFICE — PO-RALG SCHEME OF WORK - 2026
      </div>
      <table>
        <tr>
          <td><strong>TEACHER:</strong> ${teacher}</td>
          <td><strong>SCHOOL:</strong> ${school}</td>
          <td><strong>SUBJECT:</strong> ${subject.toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>CLASS:</strong> ${cls.toUpperCase()}</td>
          <td><strong>TERM:</strong> 1st &amp; 2nd</td>
          <td><strong>DATE:</strong> ${dateStr}</td>
        </tr>
      </table>
      <table>
        <thead>
          <tr>
            <th>MAIN COMPETENCES</th>
            <th>SPECIFIC COMPETENCES</th>
            <th>LEARNING ACTIVITIES</th>
            <th>SPECIFIC ACTIVITIES</th>
            <th>MONTH</th>
            <th>WEEK</th>
            <th>PERIODS</th>
            <th>METHODS</th>
            <th>RESOURCES</th>
            <th>ASSESSMENT</th>
            <th>REFERENCES</th>
            <th>REMARK</th>
          </tr>
        </thead>
        <tbody>
          ${
            showOrientation
              ? `<tr><td colspan="12" style="text-align:center; font-weight:800; background:#fef3c7;">Registration &amp; Orientation Course (13/01/2026 - 28/02/2026)</td></tr>`
              : ''
          }
          <tr>
            <td>1.0 Demonstrate mastery of ${topic}</td>
            <td>1.1 Apply concepts of ${topic}</td>
            <td>(a) Explain core concepts and principles of ${topic} (${subTopic})</td>
            <td>Guide students to brainstorm, define terms, and discuss importance of ${subTopic}</td>
            <td>${showOrientation ? 'MARCH' : 'JANUARY'}</td>
            <td>1st &amp; 2nd</td>
            <td>6</td>
            <td>Group Discussion, Think-Pair-Share</td>
            <td>Charts, Real Objects, Models</td>
            <td>Oral Questions, Class Exercises</td>
            <td>${bookRef}</td>
            <td></td>
          </tr>
          <tr>
            <td>1.0 Demonstrate mastery of ${topic}</td>
            <td>1.2 Solve problems on ${topic}</td>
            <td>(b) Perform calculations and practical tasks on ${subTopic}</td>
            <td>Demonstrate worked examples and guide students to solve problems on ${subTopic}</td>
            <td>${showOrientation ? 'MARCH' : 'FEBRUARY'}</td>
            <td>3rd &amp; 4th</td>
            <td>6</td>
            <td>Problem Solving, Demonstration</td>
            <td>Lesson Notes, Past Papers</td>
            <td>Quizzes, Group Assignments</td>
            <td>${bookRef}</td>
            <td></td>
          </tr>
          <tr>
            <td>2.0 Consolidate mastery of ${topic}</td>
            <td>2.1 Evaluate real-life applications of ${subTopic}</td>
            <td>(c) Analyze NECTA past questions on ${topic}</td>
            <td>Guide students through structured revision and practical projects</td>
            <td>${showOrientation ? 'APRIL' : 'MARCH'}</td>
            <td>1st &amp; 2nd</td>
            <td>6</td>
            <td>Project Work, Q&amp;A</td>
            <td>${paperRef}</td>
            <td>Monthly Test</td>
            <td>${bookRef}</td>
            <td></td>
          </tr>
          <tr><td colspan="12" style="text-align:center; font-weight:800; background:#f1f5f9;">MID-TERM ASSESSMENT &amp; SHORT BREAK</td></tr>
        </tbody>
      </table>
    </div>`;
  }

  if (type === 'exampaper') {
    const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
    const t1 = escapeHtml(syllabusTopics[0] || topic);
    const t2 = escapeHtml(syllabusTopics[1] || subTopic);
    const t3 = escapeHtml(syllabusTopics[2] || `Applications of ${subject}`);
    return `<div class="official-tie-doc">
      <div style="text-align:center; font-weight:900; font-size:13px; margin-bottom:8px; text-transform:uppercase;">
        THE UNITED REPUBLIC OF TANZANIA — NATIONAL EXAMINATIONS COUNCIL OF TANZANIA (NECTA) FORMAT<br/>
        ${school} — ${cls.toUpperCase()} ${subject.toUpperCase()} EXAMINATION PAPER
      </div>
      <table>
        <tr>
          <td><strong>Subject:</strong> ${subject}</td>
          <td><strong>Class / Level:</strong> ${cls}</td>
          <td><strong>Time Allowed:</strong> 3:00 Hours</td>
        </tr>
        <tr>
          <td><strong>Focus Topic:</strong> ${topic} (${subTopic})</td>
          <td><strong>Date:</strong> ${dateStr}</td>
          <td><strong>Candidate's Number:</strong> ______________________</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Instructions:</strong> This paper consists of Sections <strong>A, B, and C</strong> with a total of <strong>11 questions</strong>. Answer ALL questions in Sections A and B, and TWO (2) questions from Section C. All writing must be in blue or black ink, and diagrams in pencil.</td>
        </tr>
      </table>

      <div style="font-weight:900; font-size:11px; margin:8px 0 4px 0; text-transform:uppercase;">SECTION A (16 Marks) — Answer ALL questions in this section</div>
      <table>
        <thead>
          <tr>
            <th style="width:10%;">QN</th>
            <th style="width:75%;">EXAMINATION QUESTION ITEM</th>
            <th style="width:15%;">MARKS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1.</strong></td>
            <td>
              <strong>Multiple Choice Items (i – x):</strong> For each of the items (i)–(x), choose the correct answer from the given alternatives and write its letter beside the item number.<br/>
              (i) Which principle best defines the core competence of <strong>${subTopic}</strong> under <strong>${topic}</strong> in ${cls} ${subject}?<br/>
              &nbsp;&nbsp;A. Systematic application of TIE governing laws &nbsp;&nbsp;B. Random estimation &nbsp;&nbsp;C. Non-empirical guessing &nbsp;&nbsp;D. Unverified assumptions<br/>
              (ii) In standard ${subject} analysis of <strong>${t1}</strong>, which parameter remains constant under standard conditions?<br/>
              &nbsp;&nbsp;A. Primary proportionality constant &nbsp;&nbsp;B. Arbitrary variable &nbsp;&nbsp;C. Uncontrolled error &nbsp;&nbsp;D. External noise<br/>
              (iii)–(x) Standard competence items covering <strong>${t1}</strong>, <strong>${t2}</strong>, and <strong>${t3}</strong> from ${resourceRefString}.
            </td>
            <td><strong>10 Marks</strong><br/>(01 Mark @)</td>
          </tr>
          <tr>
            <td><strong>2.</strong></td>
            <td>
              <strong>Matching Items:</strong> Match the concepts and descriptions in <strong>List A</strong> (from <em>${subTopic}</em>) with their corresponding terms or formulas in <strong>List B</strong> by writing the letter of the correct response beside the item number (i)–(vi).
            </td>
            <td><strong>06 Marks</strong><br/>(01 Mark @)</td>
          </tr>
        </tbody>
      </table>

      <div style="font-weight:900; font-size:11px; margin:8px 0 4px 0; text-transform:uppercase;">SECTION B (54 Marks) — Answer ALL SIX (6) questions in this section (09 Marks Each)</div>
      <table>
        <thead>
          <tr>
            <th style="width:10%;">QN</th>
            <th style="width:75%;">STRUCTURED &amp; PROBLEM-SOLVING QUESTIONS</th>
            <th style="width:15%;">MARKS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>3.</strong></td>
            <td>(a) Define the key terms associated with <strong>${subTopic}</strong> as used in ${cls} ${subject}. (03 Marks)<br/>(b) State and explain three governing rules or procedures of <strong>${subTopic}</strong> with clear examples. (06 Marks)</td>
            <td><strong>09 Marks</strong></td>
          </tr>
          <tr>
            <td><strong>4.</strong></td>
            <td>(a) Draw a neat, well-labeled diagram or structured table illustrating the relationship between variables in <strong>${topic}</strong>. (04 Marks)<br/>(b) Calculate / determine the unknown value in a standard problem on <strong>${subTopic}</strong>, showing all steps clearly. (05 Marks)</td>
            <td><strong>09 Marks</strong></td>
          </tr>
          <tr>
            <td><strong>5.</strong></td>
            <td>Compare and contrast the key processes in <strong>${t1}</strong> and <strong>${t2}</strong> using a structured comparison table with three criteria.</td>
            <td><strong>09 Marks</strong></td>
          </tr>
          <tr>
            <td><strong>6.</strong></td>
            <td>A student at ${school} conducted an investigation on <strong>${subTopic}</strong>. Formulate the hypothesis, list the apparatus/materials required, and outline four sequential steps to verify the expected outcome.</td>
            <td><strong>09 Marks</strong></td>
          </tr>
          <tr>
            <td><strong>7.</strong></td>
            <td>Solve the structured NECTA past-paper application problem on <strong>${t2}</strong> and interpret the significance of your result.</td>
            <td><strong>09 Marks</strong></td>
          </tr>
          <tr>
            <td><strong>8.</strong></td>
            <td>Explain three common challenges encountered when applying <strong>${t3}</strong> in Tanzania and propose three practical solutions.</td>
            <td><strong>09 Marks</strong></td>
          </tr>
        </tbody>
      </table>

      <div style="font-weight:900; font-size:11px; margin:8px 0 4px 0; text-transform:uppercase;">SECTION C (30 Marks) — Answer TWO (2) questions from this section (15 Marks Each)</div>
      <table>
        <thead>
          <tr>
            <th style="width:10%;">QN</th>
            <th style="width:75%;">ESSAY / COMPREHENSIVE ANALYTICAL QUESTIONS</th>
            <th style="width:15%;">MARKS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>9.</strong></td>
            <td>With the aid of relevant examples and equations/diagrams, evaluate six ways in which mastery of <strong>${topic} (${subTopic})</strong> contributes to industrial, technological, and socio-economic development in Tanzania.</td>
            <td><strong>15 Marks</strong></td>
          </tr>
          <tr>
            <td><strong>10.</strong></td>
            <td>Critically analyze the fundamental principles of <strong>${t1}</strong> and <strong>${t2}</strong>, showing how they are integrated in solving complex real-life problems in ${subject}.</td>
            <td><strong>15 Marks</strong></td>
          </tr>
          <tr>
            <td><strong>11.</strong></td>
            <td>Design a comprehensive practical or analytical framework for addressing a community challenge in Tanzania using concepts learned in <strong>${cls} ${subject}</strong>.</td>
            <td><strong>15 Marks</strong></td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  if (type === 'blueprint') {
    const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
    const rows = [
      { topicName: syllabusTopics[0] || topic, periods: 12, weight: '30%', rem: 4, und: 4, app: 10, ana: 6, eva: 6, total: 30 },
      { topicName: syllabusTopics[1] || subTopic, periods: 10, weight: '25%', rem: 3, und: 4, app: 9, ana: 9, eva: 0, total: 25 },
      { topicName: syllabusTopics[2] || `Practical Applications of ${subject}`, periods: 10, weight: '25%', rem: 3, und: 2, app: 5, ana: 0, eva: 15, total: 25 },
      { topicName: syllabusTopics[3] || `Revision & Synthesis in ${subject}`, periods: 8, weight: '20%', rem: 2, und: 3, app: 0, ana: 0, eva: 15, total: 20 },
    ];
    return `<div class="official-tie-doc" data-orientation="landscape">
      <div style="text-align:center; font-weight:900; font-size:13px; margin-bottom:8px; text-transform:uppercase;">
        PRESIDENT'S OFFICE (PO-RALG) — NECTA &amp; TIE EXAMINATION TABLE OF SPECIFICATIONS (BLUEPRINT)<br/>
        ${school} — ${cls.toUpperCase()} ${subject.toUpperCase()} ASSESSMENT MATRIX
      </div>
      <table>
        <tr>
          <td><strong>School:</strong> ${school}</td>
          <td><strong>Teacher / Examiner:</strong> ${teacher}</td>
          <td><strong>Class &amp; Subject:</strong> ${cls} ${subject}</td>
          <td><strong>Date:</strong> ${dateStr}</td>
        </tr>
        <tr>
          <td colspan="4"><strong>Integrated Curriculum References:</strong> ${resourceRefString}</td>
        </tr>
      </table>
      <table>
        <thead>
          <tr>
            <th style="width:26%;">TOPIC / SPECIFIC COMPETENCE</th>
            <th style="width:8%;">PERIODS</th>
            <th style="width:9%;">WEIGHT (%)</th>
            <th style="width:10%;">REMEMBERING (12%)</th>
            <th style="width:11%;">UNDERSTANDING (13%)</th>
            <th style="width:11%;">APPLYING (24%)</th>
            <th style="width:11%;">ANALYZING (15%)</th>
            <th style="width:14%;">EVALUATING / CREATING (36%)</th>
            <th style="width:10%;">TOTAL MARKS</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>
            <td><strong>${escapeHtml(r.topicName)}</strong></td>
            <td>${r.periods}</td>
            <td><strong>${r.weight}</strong></td>
            <td>${r.rem} Marks</td>
            <td>${r.und} Marks</td>
            <td>${r.app} Marks</td>
            <td>${r.ana} Marks</td>
            <td>${r.eva} Marks</td>
            <td><strong>${r.total} Marks</strong></td>
          </tr>`
            )
            .join('')}
          <tr style="background:#f1f5f9; font-weight:900;">
            <td>TOTAL (NECTA STANDARD 100%)</td>
            <td>40</td>
            <td>100%</td>
            <td>12 Marks</td>
            <td>13 Marks</td>
            <td>24 Marks</td>
            <td>15 Marks</td>
            <td>36 Marks</td>
            <td>100 Marks</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  return `<div class="official-tie-doc">
    <div style="text-align:center; font-weight:900; font-size:13px; margin-bottom:8px; text-transform:uppercase;">
      PRESIDENT'S OFFICE (PO-RALG) — SUBJECT LOG BOOK — ${school}
    </div>
    <table>
      <tr>
        <td><strong>Teacher:</strong> ${teacher}</td>
        <td><strong>Class:</strong> ${cls}</td>
        <td><strong>Subject:</strong> ${subject}</td>
      </tr>
      <tr>
        <td colspan="3"><strong>Integrated Resources:</strong> ${resourceRefString}</td>
      </tr>
    </table>
    <table>
      <thead>
        <tr>
          <th>DATE</th>
          <th>MAIN TOPIC</th>
          <th>SUB-TOPIC</th>
          <th>PERIODS</th>
          <th>TEACHER'S COMMENT</th>
          <th>HOD REMARKS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${dateStr}</td>
          <td>${topic}</td>
          <td>${subTopic}</td>
          <td>3</td>
          <td>Taught and assessed successfully (${teacher})</td>
          <td>Checked &amp; Verified</td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

export function generateLocalSmartTutorReply(
  userText: string,
  cls: string,
  subject: string,
  learnedMemory: LearnedMemoryItem[] = [],
  siteResources?: SiteResourceContext
): string {
  const cleanInput = (userText || '').trim();
  const lower = cleanInput.toLowerCase();

  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const topicsList = syllabusTopics.map((t) => `• ${t}`).join('\n');

  const resourceSummaryLines: string[] = [];
  if (siteResources) {
    if (siteResources.books.length > 0) {
      resourceSummaryLines.push(`• **TIE Books on Website:** ${siteResources.books.slice(0, 3).map((b) => b.title).join(', ')}`);
    }
    if (siteResources.syllabuses.length > 0) {
      resourceSummaryLines.push(`• **Official Syllabuses on Website:** ${siteResources.syllabuses.slice(0, 3).map((s) => s.title).join(', ')}`);
    }
    if (siteResources.papers.length > 0) {
      resourceSummaryLines.push(
        `• **Past Papers on Website (${siteResources.papers.length} found):** ${siteResources.papers
          .slice(0, 4)
          .map((p) => `${p.title} (${p.year})`)
          .join(', ')}`
      );
    }
  }
  const siteResourcesBlock =
    resourceSummaryLines.length > 0
      ? `\n\n**📚 Integrated Elimika Website Resources (${cls} ${subject}):**\n${resourceSummaryLines.join('\n')}`
      : '';

  // Check learned memory first
  for (const item of learnedMemory) {
    if (lower.includes(item.topic.toLowerCase()) || item.topic.toLowerCase().includes(lower)) {
      return `🧠 **Moha AI (Learned Memory — ${item.topic}):**\n\n${item.content}\n\n*(Saved on ${item.timestamp})*${siteResourcesBlock}`;
    }
  }

  if (lower.includes('lesson note') || lower.includes('prepare notes') || lower.includes('topic notes')) {
    return buildInstantOfficialDocument('lessonnotes', {
      school: 'ELIMIKA SECONDARY SCHOOL',
      teacher: 'SUBJECT TEACHER',
      cls,
      subject,
      topic: syllabusTopics[0] || `${subject} Core Topic`,
      subTopic: cleanInput.replace(/lesson notes|prepare notes|topic notes/gi, '').trim() || syllabusTopics[0] || subject,
      date: new Date().toISOString().split('T')[0],
      siteResources,
    });
  }

  // Linear equation solver: e.g., "solve 2x + 5 = 15"
  const linearEqMatch = cleanInput.match(/solve\s+([+-]?\d*)x\s*([+-]\s*\d+)\s*=\s*([+-]?\d+)/i);
  if (linearEqMatch) {
    const a = parseFloat(linearEqMatch[1] || '1');
    const b = parseFloat(linearEqMatch[2].replace(/\s+/g, ''));
    const c = parseFloat(linearEqMatch[3]);
    if (a !== 0) {
      const rhs = c - b;
      const xVal = rhs / a;
      return `📐 **Step-by-Step Mathematical Solution (${cls} ${subject}):**\n\nGiven linear equation:\n$$${a}x ${
        b >= 0 ? '+ ' + b : '- ' + Math.abs(b)
      } = ${c}$$\n\n• **Step 1 (Collect like terms):**\n$$${a}x = ${c} - (${b}) = ${rhs}$$\n• **Step 2 (Divide both sides by ${a}):**\n$$x = \\frac{${rhs}}{${a}} = ${xVal}$$\n\n✅ **Final Answer:** $x = ${xVal}$ (02 Marks)${siteResourcesBlock}`;
    }
  }

  // Quadratic equation solver: e.g., "solve x^2 - 5x + 6 = 0"
  const quadMatch = cleanInput.match(/([+-]?\d*)x\^2\s*([+-]\s*\d+)x\s*([+-]\s*\d+)\s*=\s*0/i);
  if (quadMatch) {
    const a = parseFloat(quadMatch[1] || '1');
    const b = parseFloat(quadMatch[2].replace(/\s+/g, ''));
    const c = parseFloat(quadMatch[3].replace(/\s+/g, ''));
    const disc = b * b - 4 * a * c;
    if (disc >= 0 && a !== 0) {
      const r1 = (-b + Math.sqrt(disc)) / (2 * a);
      const r2 = (-b - Math.sqrt(disc)) / (2 * a);
      return `📐 **Quadratic Equation Solution (${cls} ${subject}):**\n\nGiven:\n$$${a}x^2 ${
        b >= 0 ? '+ ' + b : '- ' + Math.abs(b)
      }x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0$$\n\nUsing the quadratic formula:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n• Discriminant $\\Delta = (${b})^2 - 4(${a})(${c}) = ${disc}$\n• **Roots:** $x_1 = ${r1}$ or $x_2 = ${r2}$${siteResourcesBlock}`;
    }
  }

  for (const entry of MOHA_BUILTIN_KNOWLEDGE) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return `📘 **${entry.title}**\n\n${entry.content}${siteResourcesBlock}\n\n💡 *Need an official Lesson Plan, Lesson Notes, or Marking Scheme? Click **4-Stage Lesson Plan**, **Lesson Notes**, or **Marking Scheme** in the toolbar above!*`;
    }
  }

  if (lower.includes('marking scheme') || lower.includes('rubric')) {
    return buildInstantOfficialDocument('markingscheme', {
      school: 'ELIMIKA SECONDARY SCHOOL',
      teacher: 'SUBJECT EXAMINER',
      cls,
      subject,
      topic: syllabusTopics[0] || `${subject} Core Topic`,
      subTopic: cleanInput.slice(0, 65),
      date: new Date().toISOString().split('T')[0],
      siteResources,
    });
  }

  if (lower.includes('syllabus') || lower.includes('competence') || lower.includes('topics')) {
    return `📜 **Official TIE Syllabus — ${cls} ${subject}**\n\n**1. Main Syllabus Topics:**\n${topicsList}\n\n**2. NECTA Exam Structure:**\n• **Section A (16 Marks):** Multiple-choice & matching items.\n• **Section B (54 Marks):** 6 Short-answer questions (09 Marks each).\n• **Section C (30 Marks):** 2 Essay / analytical questions (15 Marks each).${siteResourcesBlock}`;
  }

  if (lower.includes('summary') || lower.includes('revision') || lower.includes('formula')) {
    return `📝 **Simple Revision Summary — ${cls} ${subject}**\n\n**1. Key Topics to Revise:**\n${topicsList}\n\n**2. Easy 3-Step Exam Strategy:**\n• **Step 1 (Definition):** Write the clear TIE textbook definition first (01–02 Marks).\n• **Step 2 (Formula & Substitution):** State the formula before substituting numbers to earn method marks (**M1**).\n• **Step 3 (Final Answer & Units):** Write the final answer clearly with correct SI units (**A1**).${siteResourcesBlock}`;
  }

  // Smart Class, Subject & Topic extraction from user prompt
  const parsed = parseClassSubjectTopicFromPrompt(cleanInput, cls, subject);
  const effectiveCls = parsed.cls;
  const effectiveSub = parsed.subject;
  const effectiveTopics = getSyllabusTopicsForClassSubject(effectiveCls, effectiveSub);
  const effectiveTopic =
    parsed.topic && parsed.topic !== 'ALL'
      ? parsed.topic
      : effectiveTopics[0]?.replace(/^\d+\.\d+\s*/, '') || `${effectiveSub} Core Competence`;

  if (
    lower.includes('quiz') ||
    lower.includes('test me') ||
    lower.includes('maswali') ||
    lower.includes('practice') ||
    lower.includes('questions') ||
    lower.includes('exercise')
  ) {
    const topicQuiz = buildContentIntegratedQuizQuestions(
      effectiveCls,
      effectiveSub,
      effectiveTopic,
      siteResources,
      parsed.subTopic
    );
    const formattedQuestions = topicQuiz
      .map(
        (q, idx) =>
          `**Question ${idx + 1} (${q.sourceRef || 'TIE Textbook & NECTA Past Paper'}):**\n${q.question}\n${q.options
            .map((opt, oIdx) => `   ${String.fromCharCode(65 + oIdx)}) ${opt}`)
            .join('\n')}\n• **Correct Answer:** **${String.fromCharCode(65 + q.correctIndex)}) ${
            q.options[q.correctIndex]
          }**\n• **Worked Solution:** ${q.explanation}`
      )
      .join('\n\n');

    return `🎯 **Topic-Specific Problem-Solving Quiz — ${effectiveCls} ${effectiveSub}**\n**Specified Topic:** **${effectiveTopic}** (${parsed.subTopic})\n\n${formattedQuestions}${siteResourcesBlock}`;
  }

  // Also check if user asked about a specific topic in math/science/etc. and provide a worked example from that exact topic
  const topicWorked = buildContentIntegratedQuizQuestions(
    effectiveCls,
    effectiveSub,
    effectiveTopic,
    siteResources,
    parsed.subTopic
  );
  const sampleQ1 = topicWorked[0];
  const sampleQ2 = topicWorked[1];

  return `📘 **Moha AI Study Notes & Worked Solutions — ${effectiveCls} ${effectiveSub}**\n**Specified Topic:** **${effectiveTopic}** (*"${cleanInput}"*)\n\n**1. 📌 Key Concept & Official TIE Syllabus Competence:**\n• Under the **${effectiveCls} ${effectiveSub}** TIE curriculum, **${effectiveTopic}** focuses on **${parsed.subTopic}**.\n• Always begin by stating the governing definition or formula from the **Official TIE ${effectiveCls} ${effectiveSub} Student's Textbook**.\n\n**2. 📐 Worked Examples on ${effectiveTopic} (Step-by-Step):**\n• **Worked Example 1 (${sampleQ1?.sourceRef || 'TIE Textbook'}):**\n  *Problem:* ${sampleQ1?.question}\n  *Solution:* ${sampleQ1?.explanation}\n  *Answer:* **${sampleQ1?.options[sampleQ1.correctIndex]}**\n\n• **Worked Example 2 (${sampleQ2?.sourceRef || 'NECTA Past Paper'}):**\n  *Problem:* ${sampleQ2?.question}\n  *Solution:* ${sampleQ2?.explanation}\n  *Answer:* **${sampleQ2?.options[sampleQ2.correctIndex]}**\n\n**3. ✅ NECTA Marking Tip:**\n• Separate your given data, formula (**M1**), substitution (**M1**), and final answer with units (**A1**) on clear lines.${siteResourcesBlock}`;
}

export function parseClassSubjectTopicFromPrompt(
  prompt: string,
  defaultCls = 'Form 3',
  defaultSubject = 'Basic Mathematics'
): {
  cls: string;
  subject: string;
  topic: string;
  subTopic: string;
  matchedFromPrompt: boolean;
} {
  const raw = (prompt || '').trim();
  const lower = raw.toLowerCase();
  let cls = defaultCls || 'Form 3';
  let subject = defaultSubject || 'Basic Mathematics';
  let matchedFromPrompt = false;

  // 1. Detect explicit Class in prompt (e.g., "Form 1", "Form 2", "Standard 7", "Std 4")
  const formMatch = lower.match(/\bform\s*([1-6]|one|two|three|four|five|six|i|ii|iii|iv|v|vi)\b/i);
  const stdMatch = lower.match(/\b(?:standard|std|darasa\s*la)\s*([1-7]|one|two|three|four|five|six|seven)\b/i);
  const wordToNum: Record<string, string> = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    i: '1',
    ii: '2',
    iii: '3',
    iv: '4',
    v: '5',
    vi: '6',
  };

  let explicitClassFound = false;
  if (formMatch && formMatch[1]) {
    const n = wordToNum[formMatch[1].toLowerCase()] || formMatch[1];
    cls = `Form ${n}`;
    explicitClassFound = true;
    matchedFromPrompt = true;
  } else if (stdMatch && stdMatch[1]) {
    const n = wordToNum[stdMatch[1].toLowerCase()] || stdMatch[1];
    cls = `Standard ${n}`;
    explicitClassFound = true;
    matchedFromPrompt = true;
  }

  // 2. Detect explicit Subject in prompt
  const subjectAliases: Array<{ keywords: string[]; target: string }> = [
    { keywords: ['advanced math', 'pure math'], target: 'Advanced Mathematics' },
    { keywords: ['basic applied math', 'bam'], target: 'Basic Applied Mathematics (BAM)' },
    { keywords: ['math', 'mathematics', 'hisabati', 'kuhesabu', 'algebra', 'logarithm', 'trigonometr', 'matrix', 'matrices', 'quadratic', 'vector', 'probability', 'calculus'], target: 'Basic Mathematics' },
    { keywords: ['physics', 'fizikia'], target: 'Physics' },
    { keywords: ['chemistry', 'kemia'], target: 'Chemistry' },
    { keywords: ['biology', 'baiolojia'], target: 'Biology' },
    { keywords: ['geography', 'jiografia'], target: 'Geography' },
    { keywords: ['history', 'historia'], target: 'History' },
    { keywords: ['kiswahili'], target: 'Kiswahili' },
    { keywords: ['english'], target: 'English Language' },
    { keywords: ['civics', 'uraia'], target: 'Civics' },
    { keywords: ['book-keeping', 'book keeping', 'bookkeeping', 'accountancy', 'accounts'], target: 'Book-Keeping' },
    { keywords: ['commerce', 'biashara'], target: 'Commerce' },
    { keywords: ['economics', 'uchumi'], target: 'Economics' },
    { keywords: ['computer', 'ict', 'tehama'], target: 'Computer Studies (ICS)' },
    { keywords: ['science and technology', 'sayansi'], target: 'Science and Technology' },
  ];

  for (const alias of subjectAliases) {
    if (alias.keywords.some((kw) => lower.includes(kw))) {
      const classSubjects = TIE_CURRICULUM_SUBJECTS[cls] || [];
      const exactInClass = classSubjects.find(
        (s) =>
          s.toLowerCase() === alias.target.toLowerCase() ||
          s.toLowerCase().includes(alias.target.split(' ')[0].toLowerCase())
      );
      subject = exactInClass || alias.target;
      matchedFromPrompt = true;
      break;
    }
  }

  // 3. Detect Topic from prompt across current class first, then across all classes for this subject
  const currentTopics = getSyllabusTopicsForClassSubject(cls, subject);
  let matchedTopic = '';

  const scoreTopicMatch = (topicStr: string, queryLower: string): number => {
    const cleanT = topicStr.replace(/^\d+\.\d+\s*/, '').toLowerCase();
    const words = cleanT
      .replace(/[(),&/-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !['and', 'the', 'for', 'with', 'into', 'from'].includes(w));
    let score = 0;
    for (const w of words) {
      const stem = w.slice(0, Math.max(4, w.length - 2));
      if (queryLower.includes(w)) score += 3;
      else if (queryLower.includes(stem)) score += 2;
    }
    return score;
  };

  let bestScore = 0;
  for (const t of currentTopics) {
    const sc = scoreTopicMatch(t, lower);
    if (sc > bestScore) {
      bestScore = sc;
      matchedTopic = t.replace(/^\d+\.\d+\s*/, '');
    }
  }

  // If no strong topic match in current class, check other classes for this subject so e.g. "Logarithms" finds Form 2 Math Logarithms
  if (bestScore === 0) {
    const allClasses = Object.keys(TIE_CURRICULUM_SUBJECTS);
    for (const candidateCls of allClasses) {
      const candidateTopics = getSyllabusTopicsForClassSubject(candidateCls, subject);
      for (const t of candidateTopics) {
        const sc = scoreTopicMatch(t, lower);
        if (sc > bestScore) {
          bestScore = sc;
          matchedTopic = t.replace(/^\d+\.\d+\s*/, '');
          if (!explicitClassFound) {
            cls = candidateCls;
          }
        }
      }
    }
  }

  // Also check direct math/science topic keywords if user typed a short topic name like "indices", "surds", "simultaneous", "differentiation", etc.
  if (!matchedTopic) {
    const directTopicMap: Array<{ keywords: string[]; topic: string; defaultForm?: string }> = [
      { keywords: ['logarithm', 'log ', 'standard form', 'antilog'], topic: 'Logarithms (Standard Form, Laws of Logarithms)', defaultForm: 'Form 2' },
      { keywords: ['exponent', 'indice', 'index', 'radical', 'surd'], topic: 'Exponents and Radicals (Laws of Indices, Surds)', defaultForm: 'Form 2' },
      { keywords: ['quadratic', 'factoris', 'completing the square', 'discriminant'], topic: 'Quadratic Equations (Factorisation, Completing the Square, Quadratic Formula)', defaultForm: 'Form 2' },
      { keywords: ['trigonometr', 'sine', 'cosine', 'tangent', 'sin ', 'cos ', 'tan ', 'bearing', 'elevation'], topic: 'Trigonometry (Sine, Cosine, Tangent Ratios, Sine & Cosine Rules)', defaultForm: 'Form 2' },
      { keywords: ['pythagoras', 'hypotenuse'], topic: 'Pythagoras Theorem', defaultForm: 'Form 2' },
      { keywords: ['set', 'venn', 'subset', 'union', 'intersection'], topic: 'Sets (Set Notation, Venn Diagrams, Operations on Sets)', defaultForm: 'Form 2' },
      { keywords: ['statistic', 'mean', 'median', 'mode', 'histogram', 'ogive', 'variance'], topic: 'Statistics (Mean, Median, Mode, Frequency Distribution)', defaultForm: 'Form 3' },
      { keywords: ['relation', 'domain', 'range', 'inverse relation'], topic: 'Relations (Domain, Range, Graphs & Inverse of a Relation)', defaultForm: 'Form 3' },
      { keywords: ['function', 'composite function', 'turning point', 'polynomial'], topic: 'Functions (Linear, Quadratic & Polynomial Functions, Inverse)', defaultForm: 'Form 3' },
      { keywords: ['sequence', 'series', 'arithmetic progression', 'geometric progression', 'compound interest', 'ap ', 'gp '], topic: 'Sequences and Series (Arithmetic Progression AP, Geometric Progression GP & Compound Interest)', defaultForm: 'Form 3' },
      { keywords: ['variation', 'direct variation', 'inverse variation', 'joint variation', 'rate'], topic: 'Rates and Variations (Direct, Inverse & Joint Variations)', defaultForm: 'Form 3' },
      { keywords: ['circle', 'chord', 'arc length', 'sector', 'cyclic'], topic: 'Circles (Chord Properties, Angle Properties, Tangent Properties)', defaultForm: 'Form 3' },
      { keywords: ['earth as a sphere', 'sphere', 'latitude', 'longitude', 'nautical', 'meridian', 'great circle'], topic: 'The Earth as a Sphere (Latitudes, Longitudes, Distances along Great & Small Circles)', defaultForm: 'Form 3' },
      { keywords: ['matri', 'determinant', 'cramer', 'singular matrix', 'inverse matrix'], topic: 'Matrices and Transformations (2x2 Operations, Determinants, Inverse, Simultaneous Equations)', defaultForm: 'Form 4' },
      { keywords: ['vector', 'position vector', 'unit vector', 'magnitude', 'dot product'], topic: 'Vectors (Position Vectors, Magnitude, Direction, Velocity & Force Resolution)', defaultForm: 'Form 4' },
      { keywords: ['probabilit', 'mutually exclusive', 'independent event', 'tree diagram', 'dice', 'coin'], topic: 'Probability (Mutually Exclusive & Independent Events, Tree Diagrams)', defaultForm: 'Form 4' },
      { keywords: ['linear programming', 'feasible', 'objective function', 'constraint'], topic: 'Linear Programming (Constraints, Feasible Region & Optimal Objective Value)', defaultForm: 'Form 4' },
      { keywords: ['three-dimensional', '3d', 'pyramid', 'cone', 'cylinder', 'prism', 'surface area', 'volume'], topic: 'Three-Dimensional Figures (Angles Between Lines & Planes, Surface Area & Volume of Cones, Pyramids, Spheres)', defaultForm: 'Form 4' },
      { keywords: ['coordinate', 'gradient', 'slope', 'midpoint', 'perpendicular', 'parallel line'], topic: 'Coordinate Geometry (Gradient, Equation of a Line, Parallel & Perpendicular Lines)', defaultForm: 'Form 4' },
      { keywords: ['simultaneous', 'linear equation', 'inequalit', 'algebra'], topic: 'Algebra (Linear Equations, Simultaneous Equations, Inequalities)', defaultForm: 'Form 1' },
      { keywords: ['fraction', 'decimal', 'percentage'], topic: 'Fractions, Decimals and Percentages', defaultForm: 'Form 1' },
      { keywords: ['ratio', 'profit', 'loss', 'simple interest', 'discount'], topic: 'Ratio, Profit and Loss (Simple Interest, Balance Sheet)', defaultForm: 'Form 1' },
      { keywords: ['approximation', 'significant figure', 'decimal place'], topic: 'Approximations (Rounding Off, Significant Figures, Decimal Places)', defaultForm: 'Form 1' },
      { keywords: ['congruence', 'similarity', 'similar triangle', 'postulate'], topic: 'Congruence & Similarity of Triangles', defaultForm: 'Form 2' },
      { keywords: ['calculus', 'differentiat', 'integrat', 'derivative', 'stationary point'], topic: 'Calculus (Differentiation & Definite/Indefinite Integration)', defaultForm: 'Form 5' },
      { keywords: ['account', 'double entry', 'trial balance', 'ledger', 'balance sheet'], topic: 'Accounts (Double Entry, Trial Balance, Trading, Profit & Loss, Balance Sheet)', defaultForm: 'Form 3' },
      { keywords: ['ohm', 'resistor', 'current electricity', 'circuit', 'voltage'], topic: "Current Electricity (Ohm's Law, Series & Parallel Resistors)", defaultForm: 'Form 2' },
      { keywords: ['density', 'archimedes', 'flotation', 'upthrust', 'relative density'], topic: "Archimedes' Principle, Law of Flotation & Density", defaultForm: 'Form 1' },
      { keywords: ['motion', 'kinematics', 'acceleration', 'velocity', 'newton', 'momentum'], topic: "Equations of Uniformly Accelerated Motion & Newton's Laws", defaultForm: 'Form 2' },
      { keywords: ['work', 'energy', 'power', 'machine', 'mechanical advantage', 'efficiency'], topic: 'Work, Energy, Power & Simple Machines (MA, VR, Efficiency)', defaultForm: 'Form 2' },
      { keywords: ['light', 'refraction', 'lens', 'mirror', 'focal length', 'snell'], topic: 'Light, Curved Mirrors, Lenses & Refractive Index', defaultForm: 'Form 3' },
      { keywords: ['heat', 'thermal', 'specific heat', 'gas law', 'boyle', 'charles'], topic: 'Thermal Expansion, Heat Capacity & Gas Laws', defaultForm: 'Form 3' },
      { keywords: ['wave', 'sound', 'frequency', 'wavelength', 'echo', 'electromagnetic'], topic: 'Waves, Sound, Echoes & Electromagnetic Induction', defaultForm: 'Form 4' },
      { keywords: ['radioactiv', 'half-life', 'half life', 'alpha', 'beta', 'nuclear'], topic: 'Radioactivity, Half-Life & Atomic Physics', defaultForm: 'Form 4' },
      { keywords: ['mole', 'molar mass', 'stoichiometr', 'avogadro', 'empirical formula'], topic: 'The Mole Concept and Volumetric Analysis', defaultForm: 'Form 3' },
      { keywords: ['titration', 'molarity', 'neutralization', 'acid', 'base'], topic: 'Volumetric Analysis (Acid-Base Titration & Molarity Calculations)', defaultForm: 'Form 3' },
      { keywords: ['electrolysis', 'faraday', 'cathode', 'anode', 'electrochemical'], topic: 'Ionic Theory and Electrolysis (Faraday First & Second Laws)', defaultForm: 'Form 3' },
      { keywords: ['organic', 'alkane', 'alkene', 'alkyne', 'alcohol', 'carboxylic', 'polymer'], topic: 'Organic Chemistry (Hydrocarbons, Alcohols, Carboxylic Acids)', defaultForm: 'Form 4' },
      { keywords: ['genetic', 'mendel', 'monohybrid', 'punnett', 'dna', 'heredity'], topic: 'Genetics (Mendelian Inheritance, Monohybrid Crosses, Sex Linkage)', defaultForm: 'Form 4' },
      { keywords: ['map', 'scale', 'bearing', 'grid reference', 'topographical'], topic: 'Map Reading and Map Interpretation (Scale, Distance & Area)', defaultForm: 'Form 3' },
    ];

    for (const item of directTopicMap) {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        matchedTopic = item.topic;
        if (!explicitClassFound && item.defaultForm) {
          cls = item.defaultForm;
        }
        matchedFromPrompt = true;
        break;
      }
    }
  }

  const finalTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const topic =
    matchedTopic ||
    (finalTopics[0] ? finalTopics[0].replace(/^\d+\.\d+\s*/, '') : `Core Principles of ${subject}`);
  const subTopics = getSubTopicsForMainTopic(cls, subject, topic);
  const subTopic = subTopics[0] || `${topic} — Problem Solving`;

  return { cls, subject, topic, subTopic, matchedFromPrompt };
}

export function getSubTopicsForMainTopic(
  clsOrSubject: string,
  subjectOrMainTopic: string,
  optionalMainTopic?: string
): string[] {
  const subject = optionalMainTopic !== undefined ? subjectOrMainTopic : clsOrSubject;
  const mainTopic = optionalMainTopic !== undefined ? optionalMainTopic : subjectOrMainTopic;
  const cleanMain = (mainTopic || '').replace(/^\d+\.\d+\s*/, '').trim();

  // If the topic string has parenthetical sub-items like "Algebra (Linear Equations, Simultaneous Equations, Inequalities)", extract them
  const parenMatch = cleanMain.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const parts = parenMatch[1]
      .split(/[,&]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    if (parts.length >= 2) {
      return [
        ...parts.map((p) => `${p} — Problem Solving`),
        `Past Paper Application Problems on ${cleanMain.replace(/\s*\([^)]+\)/, '')}`,
        `TIE Textbook Worked Exercises on ${cleanMain.replace(/\s*\([^)]+\)/, '')}`,
      ];
    }
  }

  // Split by comma or ampersand if present
  const baseTitle = cleanMain.replace(/\s*\([^)]+\)/, '').trim() || `${subject} Core Topic`;
  const splitParts = baseTitle
    .split(/[,&]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  if (splitParts.length >= 2) {
    return [
      ...splitParts.map((p) => `${p} (Calculations & Solving)`),
      `TIE Textbook Chapter Exercises — ${baseTitle}`,
      `NECTA Past Paper Structured Questions — ${baseTitle}`,
    ];
  }

  return [
    `1. Fundamental Concepts & Formula Application in ${baseTitle}`,
    `2. Step-by-Step Numerical & Structured Problem Solving in ${baseTitle}`,
    `3. TIE Textbook Chapter Exercise Problems on ${baseTitle}`,
    `4. NECTA Past Examination Questions on ${baseTitle}`,
  ];
}

export function buildContentIntegratedQuizQuestions(
  cls: string,
  subject: string,
  topic?: string,
  siteResources?: SiteResourceContext,
  subTopic?: string,
  sourceFilter: 'ALL' | 'BOOK' | 'PAPER' | 'textbook' | 'past_paper' = 'ALL'
): QuizItem[] {
  const isPaperOnly = sourceFilter === 'PAPER' || sourceFilter === 'past_paper';
  const isBookOnly = sourceFilter === 'BOOK' || sourceFilter === 'textbook';
  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const cleanTopics = syllabusTopics.map((t) => t.replace(/^\d+\.\d+\s*/, ''));
  const focusTopic =
    topic && topic !== 'ALL'
      ? topic.replace(/^\d+\.\d+\s*/, '')
      : cleanTopics[0] || `Core Principles of ${subject}`;

  const availableSubTopics = getSubTopicsForMainTopic(cls, subject, focusTopic);
  const focusSubTopic =
    subTopic && subTopic !== 'ALL' && subTopic.trim().length > 0
      ? subTopic.trim()
      : availableSubTopics[0] || `${focusTopic} — Problem Solving`;

  const matchedBookTitle =
    siteResources?.books?.[0]?.title || `Official TIE ${cls} ${subject} Student's Textbook`;
  const matchedPaperTitle =
    siteResources?.papers?.[0]
      ? `${siteResources.papers[0].title} (${siteResources.papers[0].year})`
      : `NECTA ${cls} ${subject} Past Examination Paper`;

  const src1 = isPaperOnly
    ? `📄 NECTA Past Paper: ${matchedPaperTitle}`
    : `📘 TIE Textbook: ${matchedBookTitle}`;
  const src2 = isBookOnly
    ? `📘 TIE Textbook: ${matchedBookTitle} (Review Exercise)`
    : `📄 NECTA Past Paper: ${matchedPaperTitle} (Section B)`;
  const src3 = isPaperOnly
    ? `📄 NECTA Past Paper: ${matchedPaperTitle} (Structured Problem)`
    : `📘 TIE Textbook: ${matchedBookTitle} (Worked Exercise)`;
  const src4 = isBookOnly
    ? `📘 TIE Textbook: ${matchedBookTitle} (Revision Problem)`
    : `📄 NECTA Past Paper: ${matchedPaperTitle} (Exam Question)`;

  const subLower = subject.toLowerCase();
  const topicCombinedLower = `${focusTopic} ${focusSubTopic} ${cls}`.toLowerCase();

  const attachMetadata = (items: Array<Omit<QuizItem, 'topic' | 'subTopic' | 'sourceRef'>>): QuizItem[] => {
    const sources = [src1, src2, src3, src4];
    return items.map((item, idx) => ({
      ...item,
      topic: focusTopic,
      subTopic: focusSubTopic,
      sourceRef: sources[idx % sources.length],
    }));
  };

  // ============================================================================
  // 1. MATHEMATICS / HISABATI / BAM / ADVANCED MATH — TOPIC- & CLASS-SPECIFIC BANK
  // ============================================================================
  if (subLower.includes('math') || subLower.includes('hisabati') || subLower.includes('kuhesabu')) {
    // 1A. LOGARITHMS & STANDARD FORM (Form 2)
    if (topicCombinedLower.includes('logarithm') || topicCombinedLower.includes('standard form')) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Evaluate without using mathematical tables: log₁₀ 25 + log₁₀ 4`,
          options: ['2', '100', '1', '0.5'],
          correctIndex: 0,
          explanation: `Step 1: Apply the product law of logarithms: log₁₀ A + log₁₀ B = log₁₀(A × B). Step 2: log₁₀ 25 + log₁₀ 4 = log₁₀(25 × 4) = log₁₀ 100. Step 3: Since 100 = 10², log₁₀(10²) = 2.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Solve for x in the logarithmic equation: log₂(x - 1) = 3`,
          options: ['x = 7', 'x = 9', 'x = 8', 'x = 10'],
          correctIndex: 1,
          explanation: `Step 1: Convert from logarithmic form log_b(N) = y to exponential form N = bʸ. Step 2: x - 1 = 2³ = 8. Step 3: Add 1 to both sides → x = 8 + 1 = 9.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Given that log₁₀ 2 = 0.3010 and log₁₀ 3 = 0.4771, calculate the value of log₁₀ 18`,
          options: ['1.2552', '1.0791', '0.7781', '1.3010'],
          correctIndex: 0,
          explanation: `Step 1: Express 18 in prime factors of 2 and 3 → 18 = 2 × 9 = 2 × 3². Step 2: Apply log laws → log₁₀ 18 = log₁₀ 2 + 2 log₁₀ 3. Step 3: Substitute given values → 0.3010 + 2(0.4771) = 0.3010 + 0.9542 = 1.2552.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Express 0.000456 in standard form (scientific notation) A × 10ⁿ and state its logarithm characteristic`,
          options: [
            '4.56 × 10⁻⁴ (Characteristic = -4 or 4̄)',
            '4.56 × 10⁴ (Characteristic = 4)',
            '45.6 × 10⁻⁵ (Characteristic = -5)',
            '0.456 × 10⁻³ (Characteristic = -3)',
          ],
          correctIndex: 0,
          explanation: `Step 1: Move the decimal point 4 places to the right so 1 ≤ A < 10 → A = 4.56, n = -4. Step 2: Standard form is 4.56 × 10⁻⁴, and the characteristic of its common logarithm is 4̄ (or -4).`,
        },
      ]);
    }

    // 1B. EXPONENTS (INDICES) AND RADICALS / SURDS (Form 2)
    if (
      topicCombinedLower.includes('exponent') ||
      topicCombinedLower.includes('radical') ||
      topicCombinedLower.includes('indice') ||
      topicCombinedLower.includes('surd')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Solve for x in the exponential equation: 2^(2x + 1) = 32`,
          options: ['x = 2', 'x = 3', 'x = 2.5', 'x = 4'],
          correctIndex: 0,
          explanation: `Step 1: Express both sides with the same base 2 → 32 = 2⁵. Step 2: Equate the exponents → 2x + 1 = 5. Step 3: 2x = 4 → x = 2.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Simplify the radical expression: √50 + √18 - √8`,
          options: ['6√2', '8√2', '4√2', '5√2'],
          correctIndex: 0,
          explanation: `Step 1: Factor out perfect squares → √50 = √(25×2) = 5√2; √18 = √(9×2) = 3√2; √8 = √(4×2) = 2√2. Step 2: Combine like surds → (5 + 3 - 2)√2 = 6√2.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Rationalize the denominator and simplify: 6 / (√5 - √2)`,
          options: ['2(√5 + √2)', '3(√5 - √2)', '6(√5 + √2)', '√5 + √2'],
          correctIndex: 0,
          explanation: `Step 1: Multiply numerator and denominator by the conjugate (√5 + √2). Step 2: Denominator = (√5)² - (√2)² = 5 - 2 = 3. Step 3: Result = 6(√5 + √2) / 3 = 2(√5 + √2).`,
        },
        {
          question: `[${cls} • ${focusTopic}] Evaluate using laws of fractional and negative indices: (27)^(2/3) × (16)^(-1/4)`,
          options: ['4.5 (or 9/2)', '18', '3/2', '6'],
          correctIndex: 0,
          explanation: `Step 1: (27)^(2/3) = (³√27)² = 3² = 9. Step 2: (16)^(-1/4) = 1 / (⁴√16) = 1/2. Step 3: Multiply → 9 × (1/2) = 9/2 = 4.5.`,
        },
      ]);
    }

    // 1C. QUADRATIC EQUATIONS (Form 2)
    if (
      topicCombinedLower.includes('quadratic') ||
      topicCombinedLower.includes('completing the square') ||
      topicCombinedLower.includes('factoris')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Solve the quadratic equation x² - 7x + 12 = 0 by factorisation`,
          options: ['x = 3 or x = 4', 'x = -3 or x = -4', 'x = 2 or x = 6', 'x = 1 or x = 12'],
          correctIndex: 0,
          explanation: `Step 1: Find two numbers whose sum is -7 and product is +12 → -3 and -4. Step 2: Factorise → (x - 3)(x - 4) = 0. Step 3: Set each factor to zero → x = 3 or x = 4.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the positive value of k for which the quadratic equation x² - kx + 9 = 0 has equal (repeated) real roots`,
          options: ['k = 6', 'k = 3', 'k = 9', 'k = 12'],
          correctIndex: 0,
          explanation: `Step 1: For equal real roots, the discriminant Δ = b² - 4ac = 0. Step 2: Substitute a = 1, b = -k, c = 9 → (-k)² - 4(1)(9) = 0. Step 3: k² = 36 → k = 6.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Solve 2x² + 5x - 3 = 0 using the quadratic formula`,
          options: [
            'x = 1/2 or x = -3',
            'x = -1/2 or x = 3',
            'x = 1 or x = -3/2',
            'x = 2 or x = -3',
          ],
          correctIndex: 0,
          explanation: `Step 1: Here a = 2, b = 5, c = -3. Step 2: x = [-5 ± √(5² - 4(2)(-3))] / (2×2) = [-5 ± √(25 + 24)] / 4 = (-5 ± 7) / 4. Step 3: x₁ = 2/4 = 1/2 and x₂ = -12/4 = -3.`,
        },
        {
          question: `[${cls} • ${focusTopic}] What constant term must be added to the algebraic expression x² + 10x to make it a perfect square?`,
          options: ['25', '10', '5', '100'],
          correctIndex: 0,
          explanation: `Step 1: To complete the square for x² + bx, add (b / 2)². Step 2: Here b = 10, so (10 / 2)² = 5² = 25, giving (x + 5)².`,
        },
      ]);
    }

    // 1D. TRIGONOMETRY & PYTHAGORAS THEOREM (Form 2 & Form 4)
    if (
      topicCombinedLower.includes('trigonometr') ||
      topicCombinedLower.includes('pythagoras') ||
      topicCombinedLower.includes('sine') ||
      topicCombinedLower.includes('cosine')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] In a right-angled triangle ABC (right-angled at B), given that sin A = 3/5 for acute angle A, find cos A and tan A`,
          options: [
            'cos A = 4/5, tan A = 3/4',
            'cos A = 3/4, tan A = 4/5',
            'cos A = 5/4, tan A = 3/5',
            'cos A = 2/5, tan A = 3/2',
          ],
          correctIndex: 0,
          explanation: `Step 1: sin A = Opposite / Hypotenuse = 3 / 5. Step 2: By Pythagoras theorem, Adjacent = √(5² - 3²) = √(25 - 9) = √16 = 4. Step 3: cos A = Adjacent / Hypotenuse = 4/5 and tan A = Opposite / Adjacent = 3/4.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Without using mathematical tables or calculator, evaluate: 2 sin 30° + cos 60° + tan 45°`,
          options: ['2.5 (or 5/2)', '2.0', '1.5', '3.0'],
          correctIndex: 0,
          explanation: `Step 1: Recall special angle ratios: sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1. Step 2: Substitute → 2(1/2) + 1/2 + 1 = 1 + 0.5 + 1 = 2.5 (or 5/2).`,
        },
        {
          question: `[${cls} • ${focusTopic}] From a point on level ground 24 m away from the foot of a vertical flagpole, a rope of length 26 m reaches the top of the flagpole. Calculate the vertical height of the flagpole`,
          options: ['10 m', '12 m', '8 m', '14 m'],
          correctIndex: 0,
          explanation: `Step 1: Apply Pythagoras theorem: a² + b² = c², where base b = 24 m and hypotenuse c = 26 m. Step 2: Height h = √(26² - 24²) = √(676 - 576) = √100 = 10 m.`,
        },
        {
          question: `[${cls} • ${focusTopic}] In triangle PQR, side p = 8 cm, side q = 10 cm, and included angle R = 60°. Use the Cosine Rule to find the length of side r`,
          options: ['√84 cm (≈ 9.17 cm)', '√164 cm (≈ 12.81 cm)', '9.00 cm', '√64 cm (8.00 cm)'],
          correctIndex: 0,
          explanation: `Step 1: Cosine Rule: r² = p² + q² - 2pq cos R. Step 2: Substitute p = 8, q = 10, cos 60° = 0.5 → r² = 64 + 100 - 2(8)(10)(0.5) = 164 - 80 = 84. Step 3: r = √84 ≈ 9.17 cm.`,
        },
      ]);
    }

    // 1E. SETS & VENN DIAGRAMS (Form 2)
    if (topicCombinedLower.includes('set') || topicCombinedLower.includes('venn')) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] In a class of 45 students, 28 study Biology, 22 study Chemistry, and 10 study both subjects. How many students study neither Biology nor Chemistry?`,
          options: ['5 students', '10 students', '8 students', '3 students'],
          correctIndex: 0,
          explanation: `Step 1: Use the set formula n(B ∪ C) = n(B) + n(C) - n(B ∩ C). Step 2: n(B ∪ C) = 28 + 22 - 10 = 40. Step 3: Students studying neither = Total - n(B ∪ C) = 45 - 40 = 5 students.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Given sets A and B such that n(A) = 18, n(B) = 15, and n(A ∪ B) = 27, find n(A ∩ B)`,
          options: ['6', '9', '12', '3'],
          correctIndex: 0,
          explanation: `Step 1: Formula: n(A ∩ B) = n(A) + n(B) - n(A ∪ B). Step 2: Substitute values → n(A ∩ B) = 18 + 15 - 27 = 33 - 27 = 6.`,
        },
        {
          question: `[${cls} • ${focusTopic}] How many total subsets (including the empty set and the set itself) does a finite set M = {a, b, c, d, e} have?`,
          options: ['32 subsets', '25 subsets', '16 subsets', '10 subsets'],
          correctIndex: 0,
          explanation: `Step 1: A set with n elements has 2ⁿ subsets. Step 2: Here n(M) = 5 elements, so number of subsets = 2⁵ = 32 subsets.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Given universal set U = {1, 2, 3, 4, 5, 6, 7, 8}, A = {2, 4, 6, 8}, and B = {1, 2, 3, 4}, list the elements of A ∩ B'`,
          options: ['{6, 8}', '{2, 4}', '{1, 3, 5, 7}', '{5, 6, 7, 8}'],
          correctIndex: 0,
          explanation: `Step 1: Find complement B' in U → B' = {5, 6, 7, 8}. Step 2: Intersect A = {2, 4, 6, 8} with B' = {5, 6, 7, 8} → A ∩ B' = {6, 8}.`,
        },
      ]);
    }

    // 1F. STATISTICS (Form 2, Form 3 & Form 5)
    if (
      topicCombinedLower.includes('statistic') ||
      topicCombinedLower.includes('mean') ||
      topicCombinedLower.includes('median') ||
      topicCombinedLower.includes('mode')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Calculate the arithmetic mean and median of the following test scores: 4, 8, 6, 10, 12, 6, 10`,
          options: [
            'Mean = 8, Median = 8',
            'Mean = 7.5, Median = 6',
            'Mean = 8, Median = 10',
            'Mean = 9, Median = 8',
          ],
          correctIndex: 0,
          explanation: `Step 1: Sum of scores = 4 + 8 + 6 + 10 + 12 + 6 + 10 = 56; Mean = 56 / 7 = 8. Step 2: Arrange in ascending order: 4, 6, 6, 8, 10, 10, 12 → middle (4th) value is Median = 8.`,
        },
        {
          question: `[${cls} • ${focusTopic}] The mean of 5 numbers is 14. When a sixth number x is added, the new mean becomes 16. Find the value of x`,
          options: ['x = 26', 'x = 24', 'x = 20', 'x = 18'],
          correctIndex: 0,
          explanation: `Step 1: Sum of the first 5 numbers = 5 × 14 = 70. Step 2: Sum of all 6 numbers = 6 × 16 = 96. Step 3: Sixth number x = 96 - 70 = 26.`,
        },
        {
          question: `[${cls} • ${focusTopic}] In a grouped frequency distribution, the assumed mean A = 45.5, total frequency ∑f = 50, and ∑fd = 150 (where d = x - A). Calculate the actual mean x̄`,
          options: ['48.5', '42.5', '46.5', '50.5'],
          correctIndex: 0,
          explanation: `Step 1: Assumed mean formula: x̄ = A + (∑fd / ∑f). Step 2: Substitute A = 45.5, ∑fd = 150, ∑f = 50 → x̄ = 45.5 + (150 / 50) = 45.5 + 3.0 = 48.5.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the mode and range of the data set: 12, 18, 15, 18, 21, 14, 18, 10`,
          options: [
            'Mode = 18, Range = 11',
            'Mode = 15, Range = 11',
            'Mode = 18, Range = 9',
            'Mode = 21, Range = 10',
          ],
          correctIndex: 0,
          explanation: `Step 1: Mode is the most frequent value → 18 (appears 3 times). Step 2: Range = Highest value - Lowest value = 21 - 10 = 11.`,
        },
      ]);
    }

    // 1G. RELATIONS & FUNCTIONS (Form 3)
    if (
      topicCombinedLower.includes('relation') ||
      topicCombinedLower.includes('function') ||
      topicCombinedLower.includes('domain') ||
      topicCombinedLower.includes('inverse')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Given the linear function f(x) = 3x - 5, find its inverse function f⁻¹(x) and evaluate f⁻¹(10)`,
          options: [
            'f⁻¹(x) = (x + 5)/3 ; f⁻¹(10) = 5',
            'f⁻¹(x) = (x - 5)/3 ; f⁻¹(10) = 5/3',
            'f⁻¹(x) = 3x + 5 ; f⁻¹(10) = 35',
            'f⁻¹(x) = (x + 3)/5 ; f⁻¹(10) = 13/5',
          ],
          correctIndex: 0,
          explanation: `Step 1: Let y = 3x - 5. Swap x and y → x = 3y - 5. Step 2: Solve for y → 3y = x + 5 → f⁻¹(x) = (x + 5)/3. Step 3: Evaluate at x = 10 → f⁻¹(10) = (10 + 5)/3 = 15/3 = 5.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Given functions f(x) = 2x + 1 and g(x) = x² - 3, calculate the value of the composite function fg(2)`,
          options: ['3', '5', '1', '7'],
          correctIndex: 0,
          explanation: `Step 1: First evaluate the inner function g(2) = (2)² - 3 = 4 - 3 = 1. Step 2: Substitute into f → f(g(2)) = f(1) = 2(1) + 1 = 3.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the turning point (vertex) and axis of symmetry of the quadratic function f(x) = x² - 6x + 11`,
          options: [
            'Vertex = (3, 2), Axis of symmetry: x = 3',
            'Vertex = (-3, 2), Axis of symmetry: x = -3',
            'Vertex = (3, 11), Axis of symmetry: x = 3',
            'Vertex = (6, 2), Axis of symmetry: x = 6',
          ],
          correctIndex: 0,
          explanation: `Step 1: Axis of symmetry x = -b / (2a) = -(-6) / (2×1) = 3. Step 2: Minimum value y = f(3) = (3)² - 6(3) + 11 = 9 - 18 + 11 = 2. Thus vertex is (3, 2).`,
        },
        {
          question: `[${cls} • ${focusTopic}] State the domain of the real rational function f(x) = (x + 2) / (x - 4)`,
          options: [
            'All real numbers x except x = 4 (x ∈ ℝ, x ≠ 4)',
            'All real numbers x except x = -2',
            'All real numbers x ≥ 4',
            'All real numbers x ∈ ℝ',
          ],
          correctIndex: 0,
          explanation: `Step 1: A rational function is undefined when its denominator equals zero. Step 2: Set x - 4 ≠ 0 → x ≠ 4. Thus Domain = {x ∈ ℝ : x ≠ 4}.`,
        },
      ]);
    }

    // 1H. RATES & VARIATIONS (Form 3)
    if (topicCombinedLower.includes('variation') || topicCombinedLower.includes('rate')) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Given that y varies directly as x (y ∝ x), and y = 24 when x = 6, find the value of y when x = 10`,
          options: ['y = 40', 'y = 36', 'y = 14.4', 'y = 60'],
          correctIndex: 0,
          explanation: `Step 1: Write equation y = kx. Step 2: Find constant of proportionality k = y / x = 24 / 6 = 4. Step 3: When x = 10, y = 4 × 10 = 40.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Given that p varies inversely as the square of q (p ∝ 1/q²), and p = 8 when q = 3, find p when q = 6`,
          options: ['p = 2', 'p = 4', 'p = 16', 'p = 1'],
          correctIndex: 0,
          explanation: `Step 1: p = k / q². Step 2: Substitute p = 8, q = 3 → k = 8 × 3² = 8 × 9 = 72. Step 3: When q = 6, p = 72 / 6² = 72 / 36 = 2.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Six (6) technicians working at the same rate can wire a school laboratory in 10 days. How many days will 15 technicians take to complete the same job?`,
          options: ['4 days', '6 days', '25 days', '5 days'],
          correctIndex: 0,
          explanation: `Step 1: Number of workers and days are inversely proportional (W₁ × D₁ = W₂ × D₂). Step 2: 6 × 10 = 15 × D₂ → D₂ = 60 / 15 = 4 days.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Joint variation: z varies directly as x and inversely as y (z = kx/y). If z = 12 when x = 8 and y = 2, find z when x = 15 and y = 5`,
          options: ['z = 9', 'z = 15', 'z = 6', 'z = 18'],
          correctIndex: 0,
          explanation: `Step 1: z = kx / y → 12 = k(8) / 2 = 4k → k = 3. Step 2: For x = 15 and y = 5, z = (3 × 15) / 5 = 45 / 5 = 9.`,
        },
      ]);
    }

    // 1I. SEQUENCES AND SERIES (Form 3)
    if (
      topicCombinedLower.includes('sequence') ||
      topicCombinedLower.includes('series') ||
      topicCombinedLower.includes('progression') ||
      topicCombinedLower.includes('compound interest')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] In an Arithmetic Progression (AP), the first term a₁ = 4 and the common difference d = 3. Find the 10th term (A₁₀) and the sum of the first 10 terms (S₁₀)`,
          options: [
            'A₁₀ = 31, S₁₀ = 175',
            'A₁₀ = 34, S₁₀ = 190',
            'A₁₀ = 31, S₁₀ = 155',
            'A₁₀ = 28, S₁₀ = 160',
          ],
          correctIndex: 0,
          explanation: `Step 1: A₁₀ = a₁ + (10 - 1)d = 4 + 9(3) = 31. Step 2: Sum S₁₀ = (n/2)(a₁ + A₁₀) = (10/2)(4 + 31) = 5 × 35 = 175.`,
        },
        {
          question: `[${cls} • ${focusTopic}] In a Geometric Progression (GP), the first term G₁ = 3 and the common ratio r = 2. Find the 6th term (G₆)`,
          options: ['96', '64', '48', '192'],
          correctIndex: 0,
          explanation: `Step 1: Formula for nth term of a GP is Gₙ = G₁ × r^(n - 1). Step 2: Substitute G₁ = 3, r = 2, n = 6 → G₆ = 3 × 2⁵ = 3 × 32 = 96.`,
        },
        {
          question: `[${cls} • ${focusTopic}] The 3rd term of an Arithmetic Progression is 11 and the 7th term is 23. Find the first term (a₁) and common difference (d)`,
          options: [
            'a₁ = 5, d = 3',
            'a₁ = 3, d = 4',
            'a₁ = 2, d = 3',
            'a₁ = 6, d = 2.5',
          ],
          correctIndex: 0,
          explanation: `Step 1: A₃ = a₁ + 2d = 11 and A₇ = a₁ + 6d = 23. Step 2: Subtract the equations → 4d = 12 → d = 3. Step 3: Substitute d = 3 into a₁ + 2(3) = 11 → a₁ = 5.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the positive geometric mean (GM) between 4 and 36`,
          options: ['12', '20', '18', '14'],
          correctIndex: 0,
          explanation: `Step 1: The geometric mean between two positive numbers a and b is GM = √(a × b). Step 2: GM = √(4 × 36) = √144 = 12.`,
        },
      ]);
    }

    // 1J. CIRCLES & THE EARTH AS A SPHERE (Form 3)
    if (
      topicCombinedLower.includes('circle') ||
      topicCombinedLower.includes('sphere') ||
      topicCombinedLower.includes('earth') ||
      topicCombinedLower.includes('chord') ||
      topicCombinedLower.includes('latitude')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] An arc of a circle of radius r = 14 cm subtends an angle of θ = 90° at the centre. Calculate the length of the arc (Take π = 22/7)`,
          options: ['22 cm', '44 cm', '154 cm', '11 cm'],
          correctIndex: 0,
          explanation: `Step 1: Arc length formula l = (θ / 360°) × 2πr. Step 2: Substitute θ = 90°, r = 14 cm → l = (90 / 360) × 2 × (22/7) × 14 = (1/4) × 88 = 22 cm.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Two towns P(12°S, 35°E) and Q(18°N, 35°E) lie on the same meridian of longitude. Calculate the distance between P and Q in nautical miles (nm)`,
          options: ['1,800 nm', '360 nm', '1,080 nm', '3,335 nm'],
          correctIndex: 0,
          explanation: `Step 1: Since P is South and Q is North of the Equator on the same meridian, angular difference α = 12° + 18° = 30°. Step 2: Distance along a great circle in nautical miles = 60 × α = 60 × 30 = 1,800 nm.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A chord of length 16 cm is at a perpendicular distance of 6 cm from the centre of a circle. Calculate the radius of the circle`,
          options: ['10 cm', '12 cm', '8 cm', '14 cm'],
          correctIndex: 0,
          explanation: `Step 1: The perpendicular from the centre bisects the chord into two segments of 16 / 2 = 8 cm each. Step 2: By Pythagoras theorem, r = √(8² + 6²) = √(64 + 36) = √100 = 10 cm.`,
        },
        {
          question: `[${cls} • ${focusTopic}] In a cyclic quadrilateral ABCD inscribed in a circle, if interior angle ABC = 112°, find the size of the opposite interior angle ADC`,
          options: ['68°', '112°', '78°', '56°'],
          correctIndex: 0,
          explanation: `Step 1: Theorem: Opposite interior angles of a cyclic quadrilateral are supplementary (add up to 180°). Step 2: ∠ADC = 180° - 112° = 68°.`,
        },
      ]);
    }

    // 1K. MATRICES AND TRANSFORMATIONS (Form 4 & Form 2)
    if (
      topicCombinedLower.includes('matri') ||
      topicCombinedLower.includes('determinant') ||
      topicCombinedLower.includes('transformation')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Find the determinant |A| of the 2×2 matrix A = [[5, 3], [2, 4]]`,
          options: ['14', '26', '6', '-14'],
          correctIndex: 0,
          explanation: `Step 1: For a 2×2 matrix [[a, b], [c, d]], determinant |A| = ad - bc. Step 2: |A| = (5 × 4) - (3 × 2) = 20 - 6 = 14.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the value of k for which the matrix M = [[k, 6], [2, 3]] is singular (has no inverse)`,
          options: ['k = 4', 'k = 9', 'k = -4', 'k = 1'],
          correctIndex: 0,
          explanation: `Step 1: A matrix is singular when its determinant equals zero (|M| = 0). Step 2: (k × 3) - (6 × 2) = 0 → 3k - 12 = 0 → k = 4.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Solve the simultaneous equations 2x + y = 7 and x + 3y = 11 using the matrix inverse / Cramer's rule`,
          options: [
            'x = 2, y = 3',
            'x = 3, y = 1',
            'x = 1, y = 5',
            'x = 4, y = -1',
          ],
          correctIndex: 0,
          explanation: `Step 1: Determinant Δ = (2×3) - (1×1) = 5. Step 2: Δₓ = (7×3) - (1×11) = 21 - 11 = 10 → x = 10/5 = 2. Step 3: Δᵧ = (2×11) - (7×1) = 22 - 7 = 15 → y = 15/5 = 3.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the coordinates of the image P' when point P(3, -2) is rotated through 90° anticlockwise about the origin (0, 0)`,
          options: ['P\'(2, 3)', 'P\'(-2, -3)', 'P\'(-3, 2)', 'P\'(2, -3)'],
          correctIndex: 0,
          explanation: `Step 1: The transformation matrix for 90° anticlockwise rotation about the origin is R₉₀ = [[0, -1], [1, 0]], which maps (x, y) → (-y, x). Step 2: (3, -2) → (-(-2), 3) = (2, 3).`,
        },
      ]);
    }

    // 1L. VECTORS (Form 4)
    if (topicCombinedLower.includes('vector')) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Given vectors a = 3i + 4j and b = 2i - j, calculate the resultant vector r = 2a + b and the magnitude |a|`,
          options: [
            'r = 8i + 7j ; |a| = 5 units',
            'r = 5i + 3j ; |a| = 7 units',
            'r = 8i + 9j ; |a| = 5 units',
            'r = 6i + 4j ; |a| = 25 units',
          ],
          correctIndex: 0,
          explanation: `Step 1: 2a + b = 2(3i + 4j) + (2i - j) = (6 + 2)i + (8 - 1)j = 8i + 7j. Step 2: Magnitude |a| = √(3² + 4²) = √(9 + 16) = √25 = 5 units.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the unit vector â in the direction of vector v = 6i - 8j`,
          options: [
            '0.6i - 0.8j (or (3/5)i - (4/5)j)',
            '6i - 8j',
            '0.8i - 0.6j',
            '3i - 4j',
          ],
          correctIndex: 0,
          explanation: `Step 1: Calculate magnitude |v| = √(6² + (-8)²) = √(36 + 64) = √100 = 10. Step 2: Unit vector v̂ = v / |v| = (6/10)i - (8/10)j = 0.6i - 0.8j.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the value of scalar k if vectors p = 4i + kj and q = 3i - 2j are perpendicular (orthogonal)`,
          options: ['k = 6', 'k = -6', 'k = 8/3', 'k = 2'],
          correctIndex: 0,
          explanation: `Step 1: Two non-zero vectors are perpendicular if their dot (scalar) product p · q = 0. Step 2: (4)(3) + (k)(-2) = 0 → 12 - 2k = 0 → k = 6.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Given points A(2, 5) and B(8, -3), find the component form of displacement vector AB⃗`,
          options: ['6i - 8j', '10i + 2j', '-6i + 8j', '6i + 2j'],
          correctIndex: 0,
          explanation: `Step 1: Displacement vector AB⃗ = OB⃗ - OA⃗ = (x₂ - x₁)i + (y₂ - y₁)j. Step 2: AB⃗ = (8 - 2)i + (-3 - 5)j = 6i - 8j.`,
        },
      ]);
    }

    // 1M. PROBABILITY (Form 4)
    if (topicCombinedLower.includes('probabilit')) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] A fair six-sided die is rolled once. Find the probability of obtaining a prime number`,
          options: ['1/2', '1/3', '2/3', '5/6'],
          correctIndex: 0,
          explanation: `Step 1: Sample space S = {1, 2, 3, 4, 5, 6}, so n(S) = 6. Step 2: Prime numbers on a die E = {2, 3, 5}, so n(E) = 3. Step 3: P(E) = n(E) / n(S) = 3/6 = 1/2.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A bag contains 5 red balls and 3 blue balls. Two balls are drawn at random one after another without replacement. Find the probability that both balls are red`,
          options: ['5/14', '25/64', '15/56', '5/8'],
          correctIndex: 0,
          explanation: `Step 1: Total balls = 5 + 3 = 8. P(1st Red) = 5/8. Step 2: Without replacement, 4 red balls remain out of 7 total → P(2nd Red | 1st Red) = 4/7. Step 3: P(Both Red) = (5/8) × (4/7) = 20/56 = 5/14.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Events A and B are independent such that P(A) = 0.4 and P(B) = 0.5. Calculate P(A ∩ B) and P(A ∪ B)`,
          options: [
            'P(A ∩ B) = 0.20 ; P(A ∪ B) = 0.70',
            'P(A ∩ B) = 0.90 ; P(A ∪ B) = 0.20',
            'P(A ∩ B) = 0.20 ; P(A ∪ B) = 0.90',
            'P(A ∩ B) = 0.10 ; P(A ∪ B) = 0.80',
          ],
          correctIndex: 0,
          explanation: `Step 1: For independent events, P(A ∩ B) = P(A) × P(B) = 0.4 × 0.5 = 0.20. Step 2: P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.4 + 0.5 - 0.20 = 0.70.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Two fair coins are tossed simultaneously. What is the probability of getting at least one Head?`,
          options: ['3/4', '1/2', '1/4', '1'],
          correctIndex: 0,
          explanation: `Step 1: Sample space S = {HH, HT, TH, TT} with n(S) = 4. Step 2: Outcomes with at least one Head E = {HH, HT, TH}, so n(E) = 3. Step 3: P(E) = 3/4.`,
        },
      ]);
    }

    // 1N. COORDINATE GEOMETRY & LINEAR PROGRAMMING (Form 1 & Form 4)
    if (
      topicCombinedLower.includes('coordinate') ||
      topicCombinedLower.includes('linear programming') ||
      topicCombinedLower.includes('gradient') ||
      topicCombinedLower.includes('slope')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Find the gradient m and the equation of the straight line passing through points A(2, 3) and B(6, 15)`,
          options: [
            'm = 3 ; y = 3x - 3',
            'm = 3 ; y = 3x + 3',
            'm = 2 ; y = 2x - 1',
            'm = 4 ; y = 4x - 5',
          ],
          correctIndex: 0,
          explanation: `Step 1: Gradient m = (15 - 3) / (6 - 2) = 12 / 4 = 3. Step 2: Using point (2, 3): y - 3 = 3(x - 2) → y = 3x - 6 + 3 → y = 3x - 3.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the equation of a straight line passing through (4, -1) that is perpendicular to the line 2x - y + 5 = 0`,
          options: [
            'x + 2y - 2 = 0 (or y = -½x + 1)',
            '2x + y - 7 = 0',
            'x - 2y - 6 = 0',
            'y = 2x - 9',
          ],
          correctIndex: 0,
          explanation: `Step 1: Rewrite 2x - y + 5 = 0 as y = 2x + 5, so m₁ = 2. Step 2: Perpendicular gradient m₂ = -1 / m₁ = -1/2. Step 3: Equation: y - (-1) = (-1/2)(x - 4) → 2y + 2 = -x + 4 → x + 2y - 2 = 0.`,
        },
        {
          question: `[${cls} • ${focusTopic}] In a Linear Programming problem, the corner points of the feasible region are O(0,0), A(6,0), B(4,5), and C(0,7). Maximize the objective function Z = 40x + 30y`,
          options: [
            'Maximum Z = 310 at point B(4, 5)',
            'Maximum Z = 240 at point A(6, 0)',
            'Maximum Z = 210 at point C(0, 7)',
            'Maximum Z = 350 at point B(4, 5)',
          ],
          correctIndex: 0,
          explanation: `Step 1: Evaluate Z = 40x + 30y at each corner point: Z(0,0) = 0; Z(6,0) = 240; Z(4,5) = 40(4) + 30(5) = 160 + 150 = 310; Z(0,7) = 210. Step 2: Maximum value is Z = 310 at (4, 5).`,
        },
        {
          question: `[${cls} • ${focusTopic}] Calculate the length (distance) and midpoint M of the line segment joining P(-1, 2) and Q(5, 10)`,
          options: [
            'Distance = 10 units ; Midpoint M = (2, 6)',
            'Distance = 14 units ; Midpoint M = (3, 6)',
            'Distance = 10 units ; Midpoint M = (3, 4)',
            'Distance = 8 units ; Midpoint M = (2, 6)',
          ],
          correctIndex: 0,
          explanation: `Step 1: Distance d = √[(5 - (-1))² + (10 - 2)²] = √(6² + 8²) = √100 = 10 units. Step 2: Midpoint M = ((-1 + 5)/2, (2 + 10)/2) = (2, 6).`,
        },
      ]);
    }

    // 1O. 3D FIGURES, AREAS, PERIMETERS, GEOMETRY, CONGRUENCE & SIMILARITY (Form 1, Form 2 & Form 4)
    if (
      topicCombinedLower.includes('three-dimensional') ||
      topicCombinedLower.includes('3d') ||
      topicCombinedLower.includes('area') ||
      topicCombinedLower.includes('perimeter') ||
      topicCombinedLower.includes('geometry') ||
      topicCombinedLower.includes('congruence') ||
      topicCombinedLower.includes('similarity') ||
      topicCombinedLower.includes('volume')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Calculate the curved surface area (CSA) and volume (V) of a solid cylinder of base radius r = 7 cm and height h = 10 cm (Take π = 22/7)`,
          options: [
            'CSA = 440 cm² ; Volume = 1,540 cm³',
            'CSA = 220 cm² ; Volume = 770 cm³',
            'CSA = 440 cm² ; Volume = 440 cm³',
            'CSA = 748 cm² ; Volume = 1,540 cm³',
          ],
          correctIndex: 0,
          explanation: `Step 1: Curved Surface Area = 2πrh = 2 × (22/7) × 7 × 10 = 440 cm². Step 2: Volume V = πr²h = (22/7) × 7 × 7 × 10 = 154 × 10 = 1,540 cm³.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A right circular cone has base radius r = 6 cm and perpendicular height h = 8 cm. Find its slant height l and volume V in terms of π`,
          options: [
            'l = 10 cm ; V = 96π cm³',
            'l = 14 cm ; V = 288π cm³',
            'l = 10 cm ; V = 48π cm³',
            'l = 12 cm ; V = 96π cm³',
          ],
          correctIndex: 0,
          explanation: `Step 1: Slant height l = √(r² + h²) = √(6² + 8²) = √100 = 10 cm. Step 2: Volume of cone V = (1/3)πr²h = (1/3) × π × 36 × 8 = 96π cm³.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Two similar triangles have corresponding side lengths in the ratio 2 : 5. If the area of the smaller triangle is 16 cm², calculate the area of the larger triangle`,
          options: ['100 cm²', '40 cm²', '64 cm²', '80 cm²'],
          correctIndex: 0,
          explanation: `Step 1: Ratio of areas of similar figures equals the square of the ratio of their corresponding sides: A₁ / A₂ = (s₁ / s₂)² = (2 / 5)² = 4 / 25. Step 2: 16 / A₂ = 4 / 25 → A₂ = (16 × 25) / 4 = 100 cm².`,
        },
        {
          question: `[${cls} • ${focusTopic}] Calculate the size of each interior angle of a regular octagon (8-sided polygon)`,
          options: ['135°', '120°', '140°', '108°'],
          correctIndex: 0,
          explanation: `Step 1: Exterior angle of a regular n-gon = 360° / n = 360° / 8 = 45°. Step 2: Interior angle = 180° - 45° = 135°.`,
        },
      ]);
    }

    // 1P. NUMBERS, FRACTIONS, DECIMALS, APPROXIMATIONS, RATIO, PROFIT & INTEREST (Primary & Form 1)
    if (
      topicCombinedLower.includes('number') ||
      topicCombinedLower.includes('fraction') ||
      topicCombinedLower.includes('decimal') ||
      topicCombinedLower.includes('percentage') ||
      topicCombinedLower.includes('approximation') ||
      topicCombinedLower.includes('ratio') ||
      topicCombinedLower.includes('profit') ||
      topicCombinedLower.includes('interest') ||
      topicCombinedLower.includes('metric') ||
      cls.toLowerCase().includes('standard')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Calculate the Simple Interest (I = PRT/100) earned on TZS 400,000 deposited for 3 years at an annual interest rate of 8%`,
          options: ['TZS 96,000', 'TZS 32,000', 'TZS 120,000', 'TZS 496,000'],
          correctIndex: 0,
          explanation: `Step 1: Formula I = (P × R × T) / 100. Step 2: Substitute P = 400,000, R = 8, T = 3 → I = (400,000 × 8 × 3) / 100 = 4,000 × 24 = TZS 96,000.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Evaluate the fraction expression step-by-step: (3/4) + (2/5) ÷ (4/15)`,
          options: ['2 ¼ (or 9/4)', '1 ¾ (or 7/4)', '11/20', '3/2'],
          correctIndex: 0,
          explanation: `Step 1: Apply BODMAS — divide first: (2/5) ÷ (4/15) = (2/5) × (15/4) = 3/2. Step 2: Add fractions: 3/4 + 3/2 = 3/4 + 6/4 = 9/4 = 2 ¼.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A trader bought a solar lamp for TZS 50,000 and sold it for TZS 62,500. Calculate the percentage profit`,
          options: ['25%', '20%', '12.5%', '15%'],
          correctIndex: 0,
          explanation: `Step 1: Profit = Selling Price - Buying Price = 62,500 - 50,000 = TZS 12,500. Step 2: Percentage Profit = (12,500 / 50,000) × 100% = 25%.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Round off 0.04876 correct to (i) 2 significant figures and (ii) 3 decimal places`,
          options: [
            '(i) 0.049 (2 s.f.) ; (ii) 0.049 (3 d.p.)',
            '(i) 0.048 (2 s.f.) ; (ii) 0.048 (3 d.p.)',
            '(i) 0.05 (2 s.f.) ; (ii) 0.049 (3 d.p.)',
            '(i) 0.049 (2 s.f.) ; (ii) 0.0488 (3 d.p.)',
          ],
          correctIndex: 0,
          explanation: `Step 1: Leading zeros are not significant; first two significant digits are 4 and 8, followed by 7 (≥5), so 2 s.f. = 0.049. Step 2: Third decimal place is 8 followed by 7, so 3 d.p. = 0.049.`,
        },
      ]);
    }

    // 1Q. CALCULUS: DIFFERENTIATION & INTEGRATION (Form 5 & Form 6 BAM / Advanced Math)
    if (
      topicCombinedLower.includes('calculus') ||
      topicCombinedLower.includes('differentiat') ||
      topicCombinedLower.includes('integrat') ||
      cls.includes('Form 5') ||
      cls.includes('Form 6')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Differentiate y = 4x³ - 6x² + 5x - 9 with respect to x, and find the gradient dy/dx at x = 2`,
          options: [
            'dy/dx = 12x² - 12x + 5 ; at x = 2, dy/dx = 29',
            'dy/dx = 12x² - 6x + 5 ; at x = 2, dy/dx = 41',
            'dy/dx = 4x² - 12x + 5 ; at x = 2, dy/dx = -3',
            'dy/dx = 12x² - 12x ; at x = 2, dy/dx = 24',
          ],
          correctIndex: 0,
          explanation: `Step 1: Apply power rule d/dx(xⁿ) = nxⁿ⁻¹ → dy/dx = 12x² - 12x + 5. Step 2: Substitute x = 2 → 12(2)² - 12(2) + 5 = 48 - 24 + 5 = 29.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Evaluate the definite integral: ∫₁³ (3x² + 2x) dx`,
          options: ['34', '26', '36', '28'],
          correctIndex: 0,
          explanation: `Step 1: Integrate term by term: ∫(3x² + 2x)dx = [x³ + x²]₁³. Step 2: Substitute upper and lower limits → (3³ + 3²) - (1³ + 1²) = (27 + 9) - (1 + 1) = 36 - 2 = 34.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the x-coordinates of the stationary (turning) points of the curve y = x³ - 3x² - 9x + 5`,
          options: [
            'x = 3 and x = -1',
            'x = -3 and x = 1',
            'x = 3 and x = 1',
            'x = 0 and x = 3',
          ],
          correctIndex: 0,
          explanation: `Step 1: Stationary points occur where dy/dx = 0. Step 2: dy/dx = 3x² - 6x - 9 = 0 → divide by 3: x² - 2x - 3 = 0. Step 3: Factorise (x - 3)(x + 1) = 0 → x = 3 or x = -1.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Find the equation of the tangent to the curve y = x² + 3x - 1 at the point (1, 3)`,
          options: [
            'y = 5x - 2',
            'y = 3x',
            'y = 5x + 2',
            'y = 2x + 1',
          ],
          correctIndex: 0,
          explanation: `Step 1: dy/dx = 2x + 3. At x = 1, gradient of tangent m = 2(1) + 3 = 5. Step 2: Equation of tangent through (1, 3): y - 3 = 5(x - 1) → y = 5x - 2.`,
        },
      ]);
    }

    // 1R. ACCOUNTS IN MATHEMATICS (Form 3)
    if (topicCombinedLower.includes('account') || topicCombinedLower.includes('double entry')) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] A trader has Opening Stock TZS 500,000, Purchases TZS 1,400,000, Closing Stock TZS 300,000, and Sales TZS 2,200,000. Calculate Cost of Goods Sold (COGS) and Gross Profit`,
          options: [
            'COGS = TZS 1,600,000 ; Gross Profit = TZS 600,000',
            'COGS = TZS 1,900,000 ; Gross Profit = TZS 300,000',
            'COGS = TZS 1,400,000 ; Gross Profit = TZS 800,000',
            'COGS = TZS 1,100,000 ; Gross Profit = TZS 1,100,000',
          ],
          correctIndex: 0,
          explanation: `Step 1: COGS = Opening Stock + Purchases - Closing Stock = 500,000 + 1,400,000 - 300,000 = TZS 1,600,000. Step 2: Gross Profit = Sales - COGS = 2,200,000 - 1,600,000 = TZS 600,000.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Using the Accounting Equation (Assets = Capital + Liabilities), find Capital when Total Assets = TZS 9,200,000 and Liabilities = TZS 2,700,000`,
          options: ['TZS 6,500,000', 'TZS 11,900,000', 'TZS 7,500,000', 'TZS 5,500,000'],
          correctIndex: 0,
          explanation: `Step 1: Capital = Assets - Liabilities. Step 2: Capital = 9,200,000 - 2,700,000 = TZS 6,500,000.`,
        },
        {
          question: `[${cls} • ${focusTopic}] In Double Entry principles, when a business pays rent of TZS 300,000 in cash, which accounts are debited and credited?`,
          options: [
            'Debit Rent Account TZS 300,000 ; Credit Cash Account TZS 300,000',
            'Debit Cash Account TZS 300,000 ; Credit Rent Account TZS 300,000',
            'Debit Capital Account TZS 300,000 ; Credit Rent Account TZS 300,000',
            'Debit Rent Account TZS 300,000 ; Credit Bank Account TZS 300,000',
          ],
          correctIndex: 0,
          explanation: `Step 1: Rent is an expense that increases → Debit Rent Account. Step 2: Cash is an asset that decreases → Credit Cash Account.`,
        },
        {
          question: `[${cls} • ${focusTopic}] If Gross Profit is TZS 850,000 and Total Operating Expenses (Wages, Rent, Electricity) are TZS 320,000, calculate the Net Profit`,
          options: ['TZS 530,000', 'TZS 1,170,000', 'TZS 430,000', 'TZS 500,000'],
          correctIndex: 0,
          explanation: `Step 1: Net Profit = Gross Profit - Total Expenses. Step 2: Net Profit = 850,000 - 320,000 = TZS 530,000.`,
        },
      ]);
    }

    // 1S. ALGEBRA: LINEAR EQUATIONS, SIMULTANEOUS EQUATIONS & INEQUALITIES (Form 1 & General Math)
    return attachMetadata([
      {
        question: `[${cls} • ${focusTopic}] Solve the simultaneous linear equations: 2x + y = 11 and x - y = 1`,
        options: [
          'x = 4, y = 3',
          'x = 3, y = 5',
          'x = 5, y = 1',
          'x = 4, y = 2',
        ],
        correctIndex: 0,
        explanation: `Step 1: Add the two equations to eliminate y → (2x + x) + (y - y) = 11 + 1 → 3x = 12 → x = 4. Step 2: Substitute x = 4 into x - y = 1 → 4 - y = 1 → y = 3.`,
      },
      {
        question: `[${cls} • ${focusTopic}] Solve for x in the linear equation: 3(2x - 4) + 5 = 23`,
        options: ['x = 5', 'x = 3', 'x = 6', 'x = 4'],
        correctIndex: 0,
        explanation: `Step 1: Expand brackets → 6x - 12 + 5 = 23. Step 2: Simplify → 6x - 7 = 23. Step 3: Add 7 to both sides → 6x = 30 → x = 5.`,
      },
      {
        question: `[${cls} • ${focusTopic}] Solve the linear inequality 5 - 2x ≤ 13 for real values of x`,
        options: ['x ≥ -4', 'x ≤ -4', 'x ≥ 4', 'x ≤ -9'],
        correctIndex: 0,
        explanation: `Step 1: Subtract 5 from both sides → -2x ≤ 8. Step 2: Divide both sides by -2 and reverse the inequality sign → x ≥ -4.`,
      },
      {
        question: `[${cls} • ${focusTopic}] Make u the subject of the kinematics formula v² = u² + 2as (for u > 0)`,
        options: [
          'u = √(v² - 2as)',
          'u = v - √(2as)',
          'u = √(v² + 2as)',
          'u = (v² - 2as) / 2',
        ],
        correctIndex: 0,
        explanation: `Step 1: Subtract 2as from both sides → u² = v² - 2as. Step 2: Take the square root of both sides → u = √(v² - 2as).`,
      },
    ]);
  }

  // ============================================================================
  // 2. PHYSICS — TOPIC-SPECIFIC NUMERICAL & CONCEPTUAL SOLVING PROBLEMS
  // ============================================================================
  if (subLower.includes('physics')) {
    if (
      topicCombinedLower.includes('light') ||
      topicCombinedLower.includes('optic') ||
      topicCombinedLower.includes('lens') ||
      topicCombinedLower.includes('mirror')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] An object is placed 30 cm in front of a converging (convex) lens of focal length f = 10 cm. Calculate the image distance v`,
          options: ['v = 15 cm (real image)', 'v = 20 cm', 'v = 7.5 cm', 'v = 30 cm'],
          correctIndex: 0,
          explanation: `Step 1: Real-is-positive lens formula: 1/f = 1/u + 1/v. Step 2: 1/10 = 1/30 + 1/v → 1/v = 1/10 - 1/30 = (3 - 1)/30 = 2/30 = 1/15. Step 3: v = 15 cm.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A ray of light travels from air into glass with an angle of incidence i = 60° and angle of refraction r = 35.3° (given sin 60° = 0.866, sin 35.3° = 0.577). Calculate the refractive index η of the glass`,
          options: ['η = 1.50', 'η = 1.33', 'η = 0.67', 'η = 1.70'],
          correctIndex: 0,
          explanation: `Step 1: By Snell's Law, η = sin i / sin r. Step 2: η = 0.866 / 0.577 = 1.50.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Two plane mirrors are inclined at an angle of θ = 60° to each other. Calculate the number of images n formed when an object is placed between them`,
          options: ['5 images', '6 images', '4 images', '3 images'],
          correctIndex: 0,
          explanation: `Step 1: Formula for number of images in inclined mirrors: n = (360° / θ) - 1. Step 2: n = (360° / 60°) - 1 = 6 - 1 = 5 images.`,
        },
        {
          question: `[${cls} • ${focusTopic}] If the real depth of a swimming pool is 3.0 m and the refractive index of water is 4/3, calculate the apparent depth of the pool`,
          options: ['2.25 m', '4.00 m', '1.75 m', '2.50 m'],
          correctIndex: 0,
          explanation: `Step 1: Refractive index η = Real Depth / Apparent Depth. Step 2: Apparent Depth = Real Depth / η = 3.0 / (4/3) = (3.0 × 3) / 4 = 2.25 m.`,
        },
      ]);
    }

    if (
      topicCombinedLower.includes('heat') ||
      topicCombinedLower.includes('thermal') ||
      topicCombinedLower.includes('gas') ||
      topicCombinedLower.includes('temperature')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Calculate the quantity of heat Q required to raise the temperature of 2.0 kg of water from 20°C to 70°C (Specific heat capacity of water c = 4,200 J/kg°C)`,
          options: ['420,000 J (420 kJ)', '210,000 J (210 kJ)', '84,000 J (84 kJ)', '588,000 J'],
          correctIndex: 0,
          explanation: `Step 1: Formula Q = mcΔθ. Step 2: Δθ = 70°C - 20°C = 50°C. Step 3: Q = 2.0 × 4,200 × 50 = 420,000 J (420 kJ).`,
        },
        {
          question: `[${cls} • ${focusTopic}] A fixed mass of gas occupies 600 cm³ at a pressure of 100 kPa. Assuming constant temperature (Boyle's Law), find its volume when pressure increases to 150 kPa`,
          options: ['400 cm³', '900 cm³', '300 cm³', '450 cm³'],
          correctIndex: 0,
          explanation: `Step 1: Boyle's Law: P₁V₁ = P₂V₂. Step 2: 100 × 600 = 150 × V₂ → V₂ = 60,000 / 150 = 400 cm³.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Convert 37°C (normal human body temperature) to the Kelvin (absolute) temperature scale`,
          options: ['310 K', '236 K', '300 K', '373 K'],
          correctIndex: 0,
          explanation: `Step 1: T(K) = θ(°C) + 273. Step 2: T = 37 + 273 = 310 K.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A steel bridge rail of length 20 m is heated through a temperature rise of 40°C. Given linear expansivity α = 1.2 × 10⁻⁵ K⁻¹, calculate the linear expansion ΔL`,
          options: ['0.0096 m (9.6 mm)', '0.096 m (96 mm)', '0.0048 m (4.8 mm)', '0.012 m'],
          correctIndex: 0,
          explanation: `Step 1: Formula ΔL = α × L₀ × Δθ. Step 2: ΔL = 1.2 × 10⁻⁵ × 20 × 40 = 0.0096 m (9.6 mm).`,
        },
      ]);
    }

    if (
      topicCombinedLower.includes('wave') ||
      topicCombinedLower.includes('sound') ||
      topicCombinedLower.includes('radioactiv') ||
      topicCombinedLower.includes('atom') ||
      topicCombinedLower.includes('electromagnet')
    ) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] A radio station broadcasts at a frequency f = 100 MHz (1.0 × 10⁸ Hz). Given the speed of electromagnetic waves c = 3.0 × 10⁸ m/s, calculate the wavelength λ`,
          options: ['3.0 m', '0.33 m', '30 m', '300 m'],
          correctIndex: 0,
          explanation: `Step 1: Wave equation v = fλ → λ = c / f. Step 2: λ = (3.0 × 10⁸ m/s) / (1.0 × 10⁸ Hz) = 3.0 m.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A radioactive sample of initial mass 80 g has a half-life (t₁/₂) of 5 days. Calculate the mass of the sample remaining undecayed after 15 days`,
          options: ['10 g', '20 g', '5 g', '40 g'],
          correctIndex: 0,
          explanation: `Step 1: Number of half-lives n = Total time / t₁/₂ = 15 / 5 = 3 half-lives. Step 2: Remaining mass N = N₀ × (1/2)ⁿ = 80 × (1/2)³ = 80 / 8 = 10 g.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A step-down transformer has 1,200 turns in the primary coil and 60 turns in the secondary coil. If the primary is connected to 240 V AC, calculate the secondary output voltage Vₛ`,
          options: ['12 V', '24 V', '4,800 V', '6 V'],
          correctIndex: 0,
          explanation: `Step 1: Transformer turns ratio: Vₛ / Vₚ = Nₛ / Nₚ. Step 2: Vₛ = 240 × (60 / 1,200) = 240 / 20 = 12 V.`,
        },
        {
          question: `[${cls} • ${focusTopic}] A ship sends an ultrasonic pulse to the seabed and receives the echo 0.8 seconds later. If the speed of sound in seawater is 1,500 m/s, calculate the depth of the sea`,
          options: ['600 m', '1,200 m', '300 m', '750 m'],
          correctIndex: 0,
          explanation: `Step 1: Echo formula: Depth d = (v × t) / 2. Step 2: d = (1,500 m/s × 0.8 s) / 2 = 1,200 / 2 = 600 m.`,
        },
      ]);
    }

    return attachMetadata([
      {
        question: `[${cls} • ${focusTopic}] A resistor of resistance R = 6 Ω is connected across a 12 V battery. Calculate the electric current I flowing through the circuit`,
        options: ['I = 2.0 A', 'I = 0.5 A', 'I = 72 A', 'I = 6.0 A'],
        correctIndex: 0,
        explanation: `Step 1: Given V = 12 V, R = 6 Ω. Step 2: Apply Ohm's Law (V = IR → I = V / R). Step 3: Substitute values → I = 12 V / 6 Ω = 2.0 A.`,
      },
      {
        question: `[${cls} • ${focusTopic}] A car accelerates uniformly from rest (u = 0 m/s) to a velocity of 20 m/s in 5 seconds. Calculate its acceleration (a) and distance covered (s)`,
        options: [
          'a = 4 m/s², s = 50 m',
          'a = 5 m/s², s = 100 m',
          'a = 4 m/s², s = 25 m',
          'a = 2 m/s², s = 40 m',
        ],
        correctIndex: 0,
        explanation: `Step 1: Acceleration a = (v - u) / t = (20 - 0) / 5 = 4 m/s². Step 2: Distance s = ut + ½at² = 0 + ½(4)(5²) = 2 × 25 = 50 m.`,
      },
      {
        question: `[${cls} • ${focusTopic}] A solid block has a mass of 450 g and a volume of 150 cm³. Calculate the density of the block in g/cm³ and kg/m³`,
        options: [
          '3.0 g/cm³ (3,000 kg/m³)',
          '0.33 g/cm³ (330 kg/m³)',
          '30 g/cm³ (300 kg/m³)',
          '1.5 g/cm³ (1,500 kg/m³)',
        ],
        correctIndex: 0,
        explanation: `Step 1: Density ρ = Mass / Volume = 450 g / 150 cm³ = 3.0 g/cm³. Step 2: Convert to SI units → 3.0 × 1000 = 3,000 kg/m³.`,
      },
      {
        question: `[${cls} • ${focusTopic}] A crane lifts a load of 500 N through a vertical height of 8 m in 10 seconds. Calculate the work done (W) and power developed (P)`,
        options: [
          'W = 4,000 J, P = 400 W',
          'W = 400 J, P = 40 W',
          'W = 5,000 J, P = 500 W',
          'W = 62.5 J, P = 6.25 W',
        ],
        correctIndex: 0,
        explanation: `Step 1: Work Done W = Force × Distance = 500 N × 8 m = 4,000 J. Step 2: Power P = Work Done / Time = 4,000 J / 10 s = 400 W.`,
      },
    ]);
  }

  // ============================================================================
  // 3. CHEMISTRY — TOPIC-SPECIFIC SOLVING PROBLEMS
  // ============================================================================
  if (subLower.includes('chemistry')) {
    if (topicCombinedLower.includes('organic') || topicCombinedLower.includes('hydrocarbon')) {
      return attachMetadata([
        {
          question: `[${cls} • ${focusTopic}] Determine the molecular formula and homologous series of a hydrocarbon with 4 carbon atoms that decolourizes bromine water (general formula CₙH₂ₙ)`,
          options: [
            'C₄H₈ (Butene — Alkene series)',
            'C₄H₁₀ (Butane — Alkane series)',
            'C₄H₆ (Butyne — Alkyne series)',
            'C₄H₉OH (Butanol — Alcohol series)',
          ],
          correctIndex: 0,
          explanation: `Step 1: Decolourization of bromine water confirms an unsaturated hydrocarbon (Alkene, CₙH₂ₙ). Step 2: For n = 4, formula is C₄H₈ (Butene).`,
        },
        {
          question: `[${cls} • ${focusTopic}] An organic compound contains 52.2% Carbon, 13.0% Hydrogen, and 34.8% Oxygen by mass. Find its empirical formula [C = 12, H = 1, O = 16]`,
          options: ['C₂H₆O', 'CH₂O', 'C₂H₄O₂', 'C₃H₈O'],
          correctIndex: 0,
          explanation: `Step 1: Mole ratios: C = 52.2/12 = 4.35; H = 13.0/1 = 13.0; O = 34.8/16 = 2.175. Step 2: Divide by smallest (2.175): C = 2, H = 6, O = 1 → Empirical formula is C₂H₆O.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Which reaction occurs when ethanoic acid (CH₃COOH) is warmed with ethanol (C₂H₅OH) in the presence of concentrated H₂SO₄ catalyst?`,
          options: [
            'Esterification forming sweet-smelling ethyl ethanoate (CH₃COOC₂H₅) and water',
            'Saponification forming soap and glycerol',
            'Hydrogenation forming ethane',
            'Fermentation forming carbon dioxide',
          ],
          correctIndex: 0,
          explanation: `Step 1: Carboxylic acid + Alcohol ⇌ Ester + Water (Esterification). Step 2: CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O.`,
        },
        {
          question: `[${cls} • ${focusTopic}] Complete combustion of 1 mole of propane (C₃H₈) in excess oxygen produces how many moles of CO₂ and H₂O?`,
          options: [
            '3 moles of CO₂ and 4 moles of H₂O',
            '3 moles of CO₂ and 8 moles of H₂O',
            '2 moles of CO₂ and 3 moles of H₂O',
            '4 moles of CO₂ and 3 moles of H₂O',
          ],
          correctIndex: 0,
          explanation: `Step 1: Write balanced combustion equation: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O. Step 2: 1 mole of C₃H₈ yields 3 moles of CO₂ and 4 moles of H₂O.`,
        },
      ]);
    }

    return attachMetadata([
      {
        question: `[${cls} • ${focusTopic}] Calculate the number of moles in 21.2 g of anhydrous sodium carbonate (Na₂CO₃). [Given: Na = 23, C = 12, O = 16]`,
        options: ['0.20 moles', '0.50 moles', '2.00 moles', '0.10 moles'],
        correctIndex: 0,
        explanation: `Step 1: Calculate Molar Mass (Mr) of Na₂CO₃ = (2 × 23) + 12 + (3 × 16) = 46 + 12 + 48 = 106 g/mol. Step 2: Moles n = m / Mr = 21.2 g / 106 g/mol = 0.20 moles.`,
      },
      {
        question: `[${cls} • ${focusTopic}] In a volumetric titration, 25.0 cm³ of 0.10 M NaOH completely neutralized 20.0 cm³ of dilute HCl. Calculate the molarity (Mₐ) of the HCl acid`,
        options: ['0.125 M', '0.080 M', '0.250 M', '0.100 M'],
        correctIndex: 0,
        explanation: `Step 1: Reaction equation HCl + NaOH → NaCl + H₂O (mole ratio nₐ : n_b = 1 : 1). Step 2: Apply (MₐVₐ)/nₐ = (M_bV_b)/n_b → Mₐ × 20.0 = 0.10 × 25.0. Step 3: Mₐ = 2.5 / 20.0 = 0.125 M.`,
      },
      {
        question: `[${cls} • ${focusTopic}] An element X has atomic number Z = 17 and mass number A = 35. Determine its electronic configuration, number of neutrons, and valency`,
        options: [
          'Config: 2:8:7, Neutrons: 18, Valency: 1',
          'Config: 2:8:5, Neutrons: 17, Valency: 3',
          'Config: 2:8:8, Neutrons: 18, Valency: 0',
          'Config: 2:7, Neutrons: 18, Valency: 2',
        ],
        correctIndex: 0,
        explanation: `Step 1: Electrons = Z = 17 → Electronic configuration is 2:8:7. Step 2: Neutrons N = A - Z = 35 - 17 = 18. Step 3: Since outermost shell has 7 electrons, it gains 1 electron → Valency = 1.`,
      },
      {
        question: `[${cls} • ${focusTopic}] Calculate the mass of copper deposited at the cathode when a current of 2.0 A is passed through CuSO₄ solution for 1,930 seconds. [Cu = 64, 1 F = 96,500 C]`,
        options: ['1.28 g', '2.56 g', '0.64 g', '3.20 g'],
        correctIndex: 0,
        explanation: `Step 1: Quantity of charge Q = It = 2.0 A × 1,930 s = 3,860 C. Step 2: Cu²⁺ + 2e⁻ → Cu requires 2 Faradays (2 × 96,500 C) for 64 g. Step 3: Mass m = (64 × 3,860) / (2 × 96,500) = 1.28 g.`,
      },
    ]);
  }

  // ============================================================================
  // 4. BIOLOGY / SAYANSI — TOPIC-SPECIFIC SOLVING PROBLEMS
  // ============================================================================
  if (subLower.includes('biology') || subLower.includes('sayansi')) {
    return attachMetadata([
      {
        question: `[${cls} • ${focusTopic}] In a Mendelian monohybrid cross, a heterozygous tall pea plant (Tt) is crossed with another heterozygous tall pea plant (Tt). What is the phenotypic ratio and probability of obtaining a dwarf (tt) offspring?`,
        options: [
          '3 Tall : 1 Dwarf (25% probability of dwarf tt)',
          '1 Tall : 1 Dwarf (50% probability of dwarf tt)',
          'All Tall (0% probability of dwarf tt)',
          '2 Tall : 2 Dwarf (50% probability of dwarf tt)',
        ],
        correctIndex: 0,
        explanation: `Step 1: Parental genotypes: Tt × Tt. Step 2: Gametes: T and t from each parent. Step 3: Offspring (F₁) genotypes: TT, Tt, Tt, tt (1:2:1). Step 4: Phenotypic ratio = 3 Tall : 1 Dwarf (1/4 = 25% dwarf).`,
      },
      {
        question: `[${cls} • ${focusTopic}] A student observes a plant cell using a light microscope with an eyepiece lens of ×10 and an objective lens of ×40. If the actual length of the cell is 0.05 mm, calculate the total magnification and image size`,
        options: [
          'Total Magnification = ×400, Image Size = 20 mm',
          'Total Magnification = ×50, Image Size = 2.5 mm',
          'Total Magnification = ×400, Image Size = 2.0 mm',
          'Total Magnification = ×40, Image Size = 5.0 mm',
        ],
        correctIndex: 0,
        explanation: `Step 1: Total Magnification = Eyepiece × Objective = 10 × 40 = ×400. Step 2: Image Size = Actual Size × Total Magnification = 0.05 mm × 400 = 20 mm.`,
      },
      {
        question: `[${cls} • ${focusTopic}] During aerobic respiration, 1 molecule of glucose (C₆H₁₂O₆) is completely oxidized. Solve the balanced equation to find how many molecules of CO₂, H₂O, and ATP are produced`,
        options: [
          '6 CO₂ + 6 H₂O + 38 ATP',
          '2 CO₂ + 2 H₂O + 2 ATP',
          '12 CO₂ + 6 H₂O + 18 ATP',
          '6 CO₂ + 12 H₂O + 2 ATP',
        ],
        correctIndex: 0,
        explanation: `Step 1: Balanced equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP (2880 kJ). Step 2: Complete aerobic oxidation yields 6 molecules of carbon dioxide, 6 molecules of water, and 38 ATP molecules.`,
      },
      {
        question: `[${cls} • ${focusTopic}] A food sample tested with Benedict's solution turned from blue to green, yellow, and finally brick-red precipitate upon boiling. Identify the food substance and its digestive enzyme`,
        options: [
          'Reducing Sugar (e.g. Glucose/Maltose) — maltose is hydrolysed by maltase in the ileum',
          'Starch — digested by salivary amylase',
          'Protein — digested by pepsin in the stomach',
          'Lipids — emulsified by bile salts',
        ],
        correctIndex: 0,
        explanation: `Step 1: Observation: Blue to brick-red precipitate with Benedict's solution on heating confirms a Reducing Sugar. Step 2: In digestion, pancreatic amylase converts starch to maltose in the duodenum, and maltase converts maltose to glucose.`,
      },
    ]);
  }

  // ============================================================================
  // 5. GEOGRAPHY / JIOGRAFIA — MAP SCALE, TIME, CLIMATE & RESEARCH SOLVING
  // ============================================================================
  if (subLower.includes('geography') || subLower.includes('jiografia')) {
    return attachMetadata([
      {
        question: `[${cls} • ${focusTopic}] On a topographical map of scale 1:50,000, the map distance measured along a road between two towns is 14 cm. Calculate the actual ground distance in kilometres (km)`,
        options: ['7.0 km', '14.0 km', '3.5 km', '70.0 km'],
        correctIndex: 0,
        explanation: `Step 1: Scale 1:50,000 means 1 cm on map represents 50,000 cm (0.5 km) on the ground. Step 2: Ground distance = 14 cm × 0.5 km/cm = 7.0 km.`,
      },
      {
        question: `[${cls} • ${focusTopic}] If the local time at Dodoma (36°E) is 10:00 AM, calculate the local time at Accra (0° Greenwich Meridian)`,
        options: ['7:36 AM', '12:24 PM', '8:00 AM', '9:24 AM'],
        correctIndex: 0,
        explanation: `Step 1: Difference in longitude = 36° - 0° = 36°. Step 2: Time difference = 36 × 4 minutes = 144 minutes = 2 hours 24 minutes. Step 3: Since Accra (0°) is West of Dodoma (36°E), subtract time → 10:00 AM - 2 hr 24 min = 7:36 AM.`,
      },
      {
        question: `[${cls} • ${focusTopic}] If the temperature at Dar es Salaam (sea level, 0 m) is 30°C, calculate the temperature at the summit of Mount Kilimanjaro (5,895 m) using the normal environmental lapse rate of 0.6°C per 100 m`,
        options: ['-5.37°C', '+5.37°C', '-15.20°C', '0.00°C'],
        correctIndex: 0,
        explanation: `Step 1: Elevation difference = 5,895 m. Step 2: Temperature drop = (5,895 / 100) × 0.6°C = 58.95 × 0.6 = 35.37°C. Step 3: Temperature at summit = 30°C - 35.37°C = -5.37°C.`,
      },
      {
        question: `[${cls} • ${focusTopic}] A regular rectangular farm on a 1:50,000 map measures 6 cm by 4 cm. Calculate the actual area of the farm in square kilometres (km²)`,
        options: ['6.0 km²', '24.0 km²', '12.0 km²', '3.0 km²'],
        correctIndex: 0,
        explanation: `Step 1: Convert map dimensions using 1 cm = 0.5 km → Length = 6 × 0.5 = 3.0 km; Width = 4 × 0.5 = 2.0 km. Step 2: Area = Length × Width = 3.0 km × 2.0 km = 6.0 km².`,
      },
    ]);
  }

  // ============================================================================
  // 6. BOOK-KEEPING / ACCOUNTANCY / COMMERCE / BUSINESS / ECONOMICS
  // ============================================================================
  if (
    subLower.includes('book-keeping') ||
    subLower.includes('account') ||
    subLower.includes('commerce') ||
    subLower.includes('business') ||
    subLower.includes('economics')
  ) {
    return attachMetadata([
      {
        question: `[${cls} • ${focusTopic}] A trader has Total Assets of TZS 8,500,000 and Total Liabilities of TZS 2,300,000. Use the Accounting Equation to calculate the Capital (Owner's Equity)`,
        options: ['TZS 6,200,000', 'TZS 10,800,000', 'TZS 4,250,000', 'TZS 5,200,000'],
        correctIndex: 0,
        explanation: `Step 1: Accounting Equation: Assets = Capital + Liabilities. Step 2: Rearrange for Capital = Assets - Liabilities. Step 3: Capital = 8,500,000 - 2,300,000 = TZS 6,200,000.`,
      },
      {
        question: `[${cls} • ${focusTopic}] Given Opening Stock = TZS 400,000, Net Purchases = TZS 1,800,000, Closing Stock = TZS 500,000, and Net Sales = TZS 2,600,000, calculate Cost of Goods Sold (COGS) and Gross Profit`,
        options: [
          'COGS = TZS 1,700,000; Gross Profit = TZS 900,000',
          'COGS = TZS 2,200,000; Gross Profit = TZS 400,000',
          'COGS = TZS 1,900,000; Gross Profit = TZS 700,000',
          'COGS = TZS 1,300,000; Gross Profit = TZS 1,300,000',
        ],
        correctIndex: 0,
        explanation: `Step 1: Cost of Goods Sold (COGS) = Opening Stock + Net Purchases - Closing Stock = 400,000 + 1,800,000 - 500,000 = TZS 1,700,000. Step 2: Gross Profit = Net Sales - COGS = 2,600,000 - 1,700,000 = TZS 900,000.`,
      },
      {
        question: `[${cls} • ${focusTopic}] When a business buys office furniture for TZS 600,000 paying by cheque, how is this transaction recorded in the double-entry books?`,
        options: [
          'Debit Office Furniture Account TZS 600,000; Credit Bank Account TZS 600,000',
          'Debit Purchases Account TZS 600,000; Credit Cash Account TZS 600,000',
          'Debit Bank Account TZS 600,000; Credit Office Furniture Account TZS 600,000',
          'Debit Capital Account TZS 600,000; Credit Bank Account TZS 600,000',
        ],
        correctIndex: 0,
        explanation: `Step 1: Office Furniture (Asset) increases → Debit Furniture Account TZS 600,000. Step 2: Bank balance (Asset) decreases via cheque → Credit Bank Account TZS 600,000.`,
      },
      {
        question: `[${cls} • ${focusTopic}] A machine costing TZS 2,000,000 is depreciated at 10% per annum using the Straight-Line Method. Calculate its Net Book Value (NBV) after 3 years`,
        options: ['TZS 1,400,000', 'TZS 1,800,000', 'TZS 1,458,000', 'TZS 600,000'],
        correctIndex: 0,
        explanation: `Step 1: Annual Depreciation = 10% × 2,000,000 = TZS 200,000 per year. Step 2: Accumulated Depreciation for 3 years = 3 × 200,000 = TZS 600,000. Step 3: Net Book Value = 2,000,000 - 600,000 = TZS 1,400,000.`,
      },
    ]);
  }

  // ============================================================================
  // 7. DEFAULT / ARTS / LANGUAGES / HISTORY / CIVICS — TOPIC-INTEGRATED SOLVING
  // ============================================================================
  return attachMetadata([
    {
      question: `[${cls} • ${focusTopic}] Solve this structured TIE Textbook question on "${focusSubTopic}": Which analytical step is required first when answering a Section B question on "${focusSubTopic}" in ${cls} ${subject}?`,
      options: [
        `Identify the key concept of "${focusSubTopic}", state its official TIE definition, and apply relevant Tanzanian examples`,
        'List unrelated points without defining the key terms',
        'Provide a one-word answer without explanation',
        'Omit examples and conclusions',
      ],
      correctIndex: 0,
      explanation: `Step 1: Define the key term in "${focusSubTopic}" (02 Marks). Step 2: Explain the core points with clear Tanzanian examples (05 Marks). Step 3: Summarize the conclusion clearly (02 Marks).`,
    },
    {
      question: `[${cls} • ${focusTopic}] From ${matchedPaperTitle}: When solving a 9-mark structured question on "${focusSubTopic}" requiring three explained points, how should you structure your work to earn full marks?`,
      options: [
        `Present 3 distinct, numbered points on "${focusSubTopic}", each with a clear statement, explanation, and vivid example (3 × 3 = 09 Marks)`,
        'Write a single unformatted paragraph without headings',
        'Write only bullet titles without explanations',
        'Skip the question introduction',
      ],
      correctIndex: 0,
      explanation: `Step 1: State Point 1 + explanation + example (03 Marks). Step 2: State Point 2 + explanation + example (03 Marks). Step 3: State Point 3 + explanation + example (03 Marks) = 09 Marks total.`,
    },
    {
      question: `[${cls} • ${focusTopic}] From ${matchedBookTitle} (Chapter Exercise on "${focusTopic}"): Which of the following best demonstrates practical problem-solving mastery of "${focusSubTopic}"?`,
      options: [
        `Connecting the principles of "${focusSubTopic}" to real-life socio-economic, historical, or communication applications in Tanzania`,
        'Memorizing isolated words without context',
        'Ignoring the syllabus competence objectives',
        'Copying questions without solving them',
      ],
      correctIndex: 0,
      explanation: `Step 1: Understand the theoretical principle of "${focusSubTopic}" in ${matchedBookTitle}. Step 2: Apply it to solve real-life Tanzanian case studies as tested in NECTA examinations.`,
    },
    {
      question: `[${cls} • ${focusTopic}] From ${matchedPaperTitle} (Section C Essay Problem — 15 Marks on "${focusTopic}"): Solve the mark distribution for a 6-point analytical essay on "${focusSubTopic}":`,
      options: [
        'Introduction: 2 Marks | 6 Explained Points (6 × 2 = 12 Marks) | Conclusion: 1 Mark = 15 Marks',
        'Introduction: 5 Marks | Main Body: 5 Marks | Conclusion: 5 Marks',
        'Introduction: 0 Marks | Main Body: 15 Marks | Conclusion: 0 Marks',
        'Introduction: 10 Marks | Main Body: 5 Marks',
      ],
      correctIndex: 0,
      explanation: `Step 1: Define key terms in the Introduction (02 Marks). Step 2: Present 6 well-argued points on "${focusSubTopic}" at 02 Marks each (12 Marks). Step 3: Write a relevant Conclusion (01 Mark) = 15 Marks.`,
    },
  ]);
}


