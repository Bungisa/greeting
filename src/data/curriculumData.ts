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
            heading: `1. Meaning & Core Principles of ${subTopic}`,
            explanation: `In the official TIE ${cls} ${subject} curriculum under ${topic}, ${subTopic} encompasses fundamental definitions, governing laws, and real-world applications in Tanzania.`,
          },
          {
            heading: `2. Governing Formulas, Procedures & Mechanisms`,
            explanation: `Students must master the systematic procedures, mathematical/scientific relationships, and step-by-step derivations used to analyze ${subTopic}.`,
          },
          {
            heading: `3. Real-Life Applications in Tanzanian Context`,
            explanation: `Practical application of ${subTopic} in industry, agriculture, environmental conservation, and everyday problem solving across Tanzania.`,
          },
        ];

    const examples = aiEnhancedDetails?.workedExamples?.length
      ? aiEnhancedDetails.workedExamples
      : [
          {
            problem: `Worked Example 1 (NECTA Standard): Explain the primary principle of ${subTopic} and solve a standard structured question under ${topic}.`,
            solution: `Step 1: Identify given parameters and state the official TIE definition/formula. Step 2: Substitute values systematically and state the final conclusion with appropriate units [05 Marks].`,
          },
          {
            problem: `Worked Example 2 (Application): How is ${subTopic} applied in practical laboratory or field situations?`,
            solution: `By observing standard safety and scientific procedures outlined in the TIE ${cls} ${subject} textbook, learners verify theoretical predictions against empirical observations [05 Marks].`,
          },
        ];

    const practiceQs = aiEnhancedDetails?.practiceQuestions?.length
      ? aiEnhancedDetails.practiceQuestions
      : [
          {
            question: `Define ${subTopic} and state two key principles studied in ${cls} ${subject}. (04 Marks)`,
            answerHint: `Award 02 Marks for clear TIE textbook definition and 01 Mark @ for two valid principles.`,
          },
          {
            question: `Describe three practical applications of ${topic} (${subTopic}) in daily life in Tanzania. (06 Marks)`,
            answerHint: `Award 02 Marks @ for each well-explained application with relevant examples.`,
          },
          {
            question: `Solve a structured past-paper problem on ${subTopic} using step-by-step NECTA rubric procedures. (10 Marks)`,
            answerHint: `Data extraction (02 Marks), Formula/Method (02 Marks), Working (04 Marks), Final Answer (02 Marks).`,
          },
        ];

    return `<div class="official-tie-doc">
      <div style="text-align:center; font-weight:900; font-size:13px; margin-bottom:8px; text-transform:uppercase;">
        THE UNITED REPUBLIC OF TANZANIA — TANZANIA INSTITUTE OF EDUCATION (TIE)<br/>
        ${school} — OFFICIAL COMPREHENSIVE LESSON NOTES (${cls.toUpperCase()} ${subject.toUpperCase()})
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
          <td><strong>Prepared By:</strong> ${teacher}</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Integrated Website Resources (TIE Books, Syllabus &amp; Past Papers):</strong> ${resourceRefString}</td>
        </tr>
      </table>

      <div style="font-weight:900; font-size:11px; margin:8px 0 4px 0; text-transform:uppercase;">Section A: Structured Topic Notes &amp; Core Concepts</div>
      <table>
        <thead>
          <tr>
            <th style="width:30%;">CONCEPT / SUB-HEADING</th>
            <th style="width:70%;">DETAILED TIE CURRICULUM NOTES &amp; EXPLANATION</th>
          </tr>
        </thead>
        <tbody>
          ${concepts
            .map(
              (c) => `<tr>
            <td><strong>${escapeHtml(c.heading)}</strong></td>
            <td>${escapeHtml(c.explanation)}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div style="font-weight:900; font-size:11px; margin:8px 0 4px 0; text-transform:uppercase;">Section B: Worked Examples (Aligned with TIE Books &amp; Past Papers)</div>
      <table>
        <thead>
          <tr>
            <th style="width:40%;">PROBLEM / QUESTION</th>
            <th style="width:60%;">STEP-BY-STEP MODEL SOLUTION</th>
          </tr>
        </thead>
        <tbody>
          ${examples
            .map(
              (ex) => `<tr>
            <td><strong>${escapeHtml(ex.problem)}</strong></td>
            <td>${escapeHtml(ex.solution)}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <div style="font-weight:900; font-size:11px; margin:8px 0 4px 0; text-transform:uppercase;">Section C: Self-Assessment &amp; NECTA Past Paper Revision Exercise</div>
      <table>
        <thead>
          <tr>
            <th style="width:55%;">REVISION QUESTION</th>
            <th style="width:45%;">MARKING GUIDE / ANSWER KEY</th>
          </tr>
        </thead>
        <tbody>
          ${practiceQs
            .map(
              (pq, idx) => `<tr>
            <td><strong>Qn ${idx + 1}:</strong> ${escapeHtml(pq.question)}</td>
            <td>${escapeHtml(pq.answerHint)}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
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
    return `📜 **Official TIE Syllabus Overview — ${cls} ${subject}**\n\n**Main Competences & Topics:**\n${topicsList}${siteResourcesBlock}\n\n**Assessment Structure (NECTA Format):**\n• **Section A (16 Marks):** Multiple-choice & matching items covering core concepts.\n• **Section B (54 Marks):** 6 Short-answer & structured problem-solving questions (9 Marks each).\n• **Section C (30 Marks):** 2 Essay / comprehensive analytical questions (15 Marks each).\n\n💡 *Click **4-Stage Lesson Plan**, **Lesson Notes**, or **PO-RALG Scheme (2026)** above to generate ready-to-print PDF documents.*`;
  }

  if (lower.includes('summary') || lower.includes('revision') || lower.includes('formula')) {
    return `📝 **TIE Revision Summary — ${cls} ${subject}**\n\n**Core Syllabus Competences Covered:**\n${topicsList}${siteResourcesBlock}\n\n**Key Revision & Examination Checklist:**\n1. **Definitions & Laws:** Always state official TIE textbook definitions clearly before writing formulas.\n2. **Step-by-Step Working:** In NECTA marking schemes, method marks (**M1, M2**) are awarded for showing each intermediate step and formula substitution.\n3. **SI Units & Diagrams:** Include standard SI units on all final numerical answers and draw neat, well-labeled diagrams.\n\n*Ask me any specific topic or paste a question to get a complete step-by-step solution!*`;
  }

  if (lower.includes('practice') || lower.includes('questions')) {
    return `❓ **High-Yield NECTA Practice Questions & Marking Scheme — ${cls} ${subject}**\n\n**Question 1 (06 Marks):**\nState the core principles of **${
      syllabusTopics[0] || subject
    }** and give two real-life applications in Tanzania.\n• *Marking Rubric:* Clear definition = 02 Marks; Principle/Formula = 02 Marks; Two applications (1 mark @) = 02 Marks.\n\n**Question 2 (09 Marks):**\nExplain three major factors influencing processes studied under **${
      syllabusTopics[1] || subject
    }**.\n• *Marking Rubric:* 3 well-explained points with examples (03 Marks @) = 09 Marks.\n\n**Question 3 (15 Marks - Essay/Structured Analysis):**\nEvaluate five ways knowledge of **${subject}** contributes to industrial and socio-economic development in Tanzania.\n• *Marking Rubric:* Introduction (02 Marks) + 5 Points @ 2.5 Marks (12.5 Marks) + Conclusion (0.5 Mark) = 15 Marks.${siteResourcesBlock}`;
  }

  return `📘 **Moha AI Assistant — ${cls} ${subject}**\n**Topic / Query:** *"${cleanInput}"*\n\n**1. TIE Curriculum Alignment & Summary Table:**\n\n| Competence Area | Core Concept (${cls} ${subject}) | NECTA Weighting |\n| :--- | :--- | :--- |\n| ${syllabusTopics[0] || '1.0 Core Principles'} | Definitions, Laws & Governing Formulas | Section A & B (06–10 Marks) |\n| ${syllabusTopics[1] || '2.0 Practical Procedures'} | Step-by-Step Calculations & Diagrams | Section B (09 Marks) |\n| ${syllabusTopics[2] || '3.0 Real-Life Application'} | Tanzanian Socio-Economic & Lab Context | Section C (15 Marks) |\n\n**2. Step-by-Step NECTA Answering Guide:**\n• **Introduction / Definition (02 Marks):** Define the key concept clearly using standard TIE terminology.\n• **Core Explanation / Formula & Working (05 Marks):** State the governing principle, equation, or key points with clear examples.\n• **Conclusion / Real-Life Application (02 Marks):** Connect the concept to practical applications in Tanzania.${siteResourcesBlock}\n\n💡 *Tip: Click **🔬 Interactive Diagrams & Tables** above to explore live interactive scientific/math diagrams with sliders, or generate **Lesson Plans, Schemes of Work, and Lesson Notes**!*`;
}
