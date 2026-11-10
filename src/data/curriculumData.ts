import { FULL_EXTRACTED_TEXTBOOK_BANK } from './extractedTextbookExerciseBank.ts';
import { getPhysicsF2DiagramSvg } from './physicsF2Diagrams.ts';

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
  customContent?: string;
  attachedFileMimeType?: string;
  attachedFileName?: string;
  isUserAttached?: boolean;
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

export interface FocusedResourceInfo {
  id?: string;
  title: string;
  form: string;
  subject: string;
  category: string;
  year: string;
  paperUrl?: string | null;
  answersUrl?: string | null;
  customContent?: string;
  isBook?: boolean;
  isSyllabus?: boolean;
}

export interface SiteResourceContext {
  syllabuses: Array<{ title: string; form: string; subject: string; year: string; hasUrl: boolean; paperUrl?: string | null; customContent?: string }>;
  books: Array<{ title: string; form: string; subject: string; year: string; hasUrl: boolean; paperUrl?: string | null; customContent?: string }>;
  papers: Array<{ title: string; form: string; subject: string; year: string; category: string; hasUrl: boolean; hasAnswers: boolean; paperUrl?: string | null; customContent?: string }>;
  focusedResource?: FocusedResourceInfo | null;
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
  isMultipleChoice?: boolean;
}

export const CONFIG = {
  SHEET_ID: '1-7C_G-VAC2ICxuT3XwADzAluRoDvQyd04yS4BtSvXxM',
  ITEMS_PER_PAGE: 12,
  SEARCH_DEBOUNCE_MS: 200,
  ADMIN_WHATSAPP: '255689511868',
  WHATSAPP_CHANNEL_URL: 'https://whatsapp.com/channel/0029VbE4Ctl0G0Xbp8kQwu0t',
};

export function normalizeSearchSynonymText(raw: string): string {
  let s = String(raw || '')
    .toLowerCase()
    .replace(/[_/\\,.;:()[\]'"!?+-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return '';

  // Class level synonyms: f1..f6 -> form 1..form 6, std 1..7 / darasa 1..7 -> standard 1..7
  s = s
    .replace(/\bf\s*([1-6])\b/g, 'form $1')
    .replace(/\bform([1-6])\b/g, 'form $1')
    .replace(/\bkidato\s*(?:cha\s*)?([1-6])\b/g, 'form $1')
    .replace(/\bstd\.?\s*([1-7])\b/g, 'standard $1')
    .replace(/\bstandard([1-7])\b/g, 'standard $1')
    .replace(/\bdarasa\s*(?:la\s*)?([1-7])\b/g, 'standard $1')
    .replace(/\bpsle\b/g, 'standard 7 necta')
    .replace(/\bsfna\b/g, 'standard 4 necta')
    .replace(/\bftna\b/g, 'form 2 necta')
    .replace(/\bcsee\b/g, 'form 4 necta')
    .replace(/\bacsee\b/g, 'form 6 necta');

  // Subject synonyms (English + Swahili abbreviations)
  s = s
    .replace(/\b(maths|math|bmath|hisabati|hesabu)\b/g, 'mathematics hisabati')
    .replace(/\b(phy|phys|fizikia)\b/g, 'physics fizikia')
    .replace(/\b(chem|kemia)\b/g, 'chemistry kemia')
    .replace(/\b(bio|biolojia)\b/g, 'biology biolojia')
    .replace(/\b(geo|geog|jiografia)\b/g, 'geography jiografia')
    .replace(/\b(hist|historia)\b/g, 'history historia')
    .replace(/\b(civ|uraia)\b/g, 'civics uraia')
    .replace(/\b(eng|kiingereza)\b/g, 'english')
    .replace(/\b(kisw|swahili)\b/g, 'kiswahili')
    .replace(/\b(cs|ics|ict|tehama|comp)\b/g, 'computer science tehama')
    .replace(/\b(sayansi|sci|science)\b/g, 'science sayansi')
    .replace(/\b(agric|kilimo)\b/g, 'agriculture kilimo')
    .replace(/\b(comm|biashara)\b/g, 'commerce biashara')
    .replace(/\b(bk|bookkeeping)\b/g, 'book keeping');

  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Tokenized Smart Search with Tanzanian curriculum synonym normalization.
 * Splitting the query into tokens and normalizing synonyms ensures queries like
 * "F4 Maths 2025" or "Std 7 Sayansi" match "Form 4 Basic Mathematics (2025)"
 * and "Standard 7 Sayansi na Teknolojia".
 */
export function matchesSmartSearchTokens(rawQuery: string, targetHaystack: string): boolean {
  const qClean = String(rawQuery || '').trim();
  if (!qClean) return true;

  // Expand query tokens (keep individual user tokens mapped to canonical equivalents)
  let qNorm = String(qClean)
    .toLowerCase()
    .replace(/[_/\\,.;:()[\]'"!?+-]+/g, ' ')
    .replace(/\bf\s*([1-6])\b/g, 'form $1')
    .replace(/\bform([1-6])\b/g, 'form $1')
    .replace(/\bkidato\s*(?:cha\s*)?([1-6])\b/g, 'form $1')
    .replace(/\bstd\.?\s*([1-7])\b/g, 'standard $1')
    .replace(/\bstandard([1-7])\b/g, 'standard $1')
    .replace(/\bdarasa\s*(?:la\s*)?([1-7])\b/g, 'standard $1')
    .replace(/\bpsle\b/g, 'standard 7')
    .replace(/\bsfna\b/g, 'standard 4')
    .replace(/\bftna\b/g, 'form 2')
    .replace(/\bcsee\b/g, 'form 4')
    .replace(/\bacsee\b/g, 'form 6')
    .replace(/\b(maths|math|bmath|hesabu)\b/g, 'mathematics')
    .replace(/\b(phy|phys|fizikia)\b/g, 'physics')
    .replace(/\b(chem|kemia)\b/g, 'chemistry')
    .replace(/\b(bio|biolojia)\b/g, 'biology')
    .replace(/\b(geo|geog)\b/g, 'geography')
    .replace(/\b(hist)\b/g, 'history')
    .replace(/\b(civ)\b/g, 'civics')
    .replace(/\b(eng|kiingereza)\b/g, 'english')
    .replace(/\b(kisw|swahili)\b/g, 'kiswahili')
    .replace(/\b(cs|ics|ict|comp)\b/g, 'computer')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = qNorm.split(' ').filter(Boolean);
  if (tokens.length === 0) return true;

  const hayNorm = normalizeSearchSynonymText(targetHaystack);
  return tokens.every((token) => hayNorm.includes(token));
}

export const TIE_CURRICULUM_SUBJECTS: Record<string, string[]> = {
  'Standard 1': ['Kusoma', 'Kuandika', 'Kuhesabu', 'Afya na Mazingira', 'Michezo na Sanaa'],
  'Standard 2': ['Kusoma', 'Kuandika', 'Kuhesabu', 'Afya na Mazingira', 'Michezo na Sanaa'],
  'Standard 3': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi (Science)', 'Jiografia na Mazingira', 'Historia ya Tanzania na Maadili', 'Sanaa na Michezo'],
  'Standard 4': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi (Science)', 'Jiografia na Mazingira', 'Historia ya Tanzania na Maadili', 'Sanaa na Michezo'],
  'Standard 5': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Standard 6': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Standard 7': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Form 1': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Information and Computer Studies (ICS)', 'Computer Science', 'Agriculture', 'Home Economics'],
  'Form 2': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Information and Computer Studies (ICS)', 'Computer Science', 'Agriculture', 'Home Economics'],
  'Form 3': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Information and Computer Studies (ICS)', 'Computer Science', 'Agriculture', 'Home Economics', 'Literature in English'],
  'Form 4': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Information and Computer Studies (ICS)', 'Computer Science', 'Agriculture', 'Home Economics', 'Literature in English'],
  'Form 5': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Economics', 'Business Studies', 'Accountancy', 'Commerce', 'Agriculture', 'English Language', 'Literature in English', 'Kiswahili', 'Computer Science'],
  'Form 6': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Economics', 'Business Studies', 'Accountancy', 'Commerce', 'Agriculture', 'English Language', 'Literature in English', 'Kiswahili', 'Computer Science'],
};

export const TIE_SYLLABUS_COMPETENCES: Record<string, Record<string, string[]>> = {
  'Basic Mathematics': {
    'Form 1': [
      'Chapter 1: Concept of Mathematics (Meaning of Mathematics, Branches of Mathematics: Arithmetic, Algebra & Geometry, Relationship Between Mathematics and Other Subjects & Importance of Mathematics)',
      'Chapter 2: Numbers (Concept of Numbers, Rational Numbers on a Number Line, Repeating/Recurring Decimals, Converting Repeating Decimals into Fractions & Vice Versa, Irrational Numbers, Real Numbers, Inequalities in Real Numbers & Absolute Value of a Real Number)',
      'Chapter 3: Approximations (Meaning of Approximations, Rounding Off Numbers by Place Values, Rounding Off by Number of Decimal Places, Significant Figures & Approximations in Calculations)',
      'Chapter 4: Ratios and Proportions (Ratios, Combining Ratios A : B : C, Sharing in a Given Ratio, Direct and Inverse Proportions, Map Scales & Third/Fourth Proportionals)',
      'Chapter 5: Algebra (Algebraic Expressions, Simplifying Algebraic Fractions, Linear Equations in One Unknown, Equations Involving Absolute Values, Linear Simultaneous Equations by Elimination & Substitution, Word Problems & Inequalities in One Unknown)',
      'Chapter 6: Coordinate Geometry (Basic Concepts of Coordinate Geometry, Quadrants & Polygons on the xy-Plane, Gradient/Slope of a Straight Line, Equation of a Straight Line y = mx + c, General Equation ax + by + c = 0, x- and y-Intercepts, Graphing Linear Equations & Solving Simultaneous Equations Graphically)',
    ],
    'Form 2': [
      'Chapter 1: Rates and Variations (Rates, Currency Exchange Rates, Direct Variations, Inverse Variations, Joint and Combined Variations)',
      'Chapter 2: Congruence (Concept of Congruence, Postulates, Theorems and Proofs, Congruence of Triangles: SSS, SAS, AAS, ASA, RHS & Isosceles Triangle Theorems)',
      'Chapter 3: Similarity (Similar Figures, Similar Triangles, Similarity Theorems: AA, SSS, SAS & Intercept/Altitude Proportionality)',
      'Chapter 4: Algebra (Binary Operations, Transposition of Formulae, Quadratic Expressions, Factorisation by Splitting the Middle Term, Difference of Two Squares, Perfect Squares, Solving Quadratic Equations by Factorisation, Completing the Square & Quadratic Formula)',
      'Chapter 5: Exponents and Radicals (Exponents, Laws of Exponents, Exponential Equations, Fractional Exponents, Radicals/Surds, Operations on Radicals, Rationalising the Denominator & Square/Cube Roots)',
      'Chapter 6: Logarithms (Standard Form A × 10ⁿ, Concept of Logarithms, Laws of Logarithms, Change of Base, Antilogarithms & Applications of Logarithms)',
      'Chapter 7: Sets (Concept of a Set, Roster & Set-Builder Notation, Types of Sets, Subsets 2ⁿ, Operations on Sets: Union, Intersection, Complement, De Morgan Laws & Venn Diagrams)',
      'Chapter 8: Trigonometry (Trigonometric Ratios sin, cos, tan, Special Angles 0°, 30°, 45°, 60°, 90°, Trigonometric Ratios in All 4 Quadrants, Positive & Negative Angles, Complementary Angles & Angles of Elevation and Depression)',
    ],
    'Form 3': [
      'Chapter 1: Relations (Meaning of a Relation, Types of Relations: One-to-One, Many-to-One, One-to-Many & Many-to-Many, Domain and Range of a Relation, Graphs of Linear & Quadratic Relations and Inequalities & Inverse of a Relation R⁻¹)',
      'Chapter 2: Functions (Concept of a Function, Vertical & Horizontal Line Tests, Function Notation, Domain and Range of Functions, Graphs of Linear & Quadratic Functions, Turning Points & Axis of Symmetry, Step Floor/Ceiling Functions, Absolute Value Functions & Inverse Functions f⁻¹(x))',
      'Chapter 3: Linear Programming (Formulation of Linear Programming Problems, Decision Variables, Objective Function, Linear Inequality Constraints, Feasible Region, Corner Points & Optimal Solution and Value)',
      'Chapter 4: Sequences and Series (Sequences, Series, Arithmetic Progression AP, nth Term & Sum of AP, Arithmetic Mean AM, Geometric Progression GP, nth Term & Sum of GP, Geometric Mean GM & Compound Interest)',
      'Chapter 5: Circles (Parts of a Circle, Central Angles, Arc Length l = πrθ/180°, Radian Measure s = rθ, Angle Properties of Circles, Cyclic Quadrilaterals, Chord Properties, Intersecting Chords & Secants, Tangent Properties, Alternate Segment Theorem & Secant-Tangent Theorem)',
    ],
    'Form 4': [
      'Chapter 1: Coordinate Geometry (Midpoint, Distance Formula, Parallel & Perpendicular Lines m1·m2 = -1)',
      'Chapter 2: Area and Perimeter (Area of Any Triangle ½ab sin C, Rhombus, Parallelogram & Regular Polygons)',
      'Chapter 3: Three-Dimensional Figures (Prisms, Pyramids, Cones, Spheres, Angle Between a Line and a Plane, Surface Area & Volume)',
      'Chapter 4: Probability (Sample Space, Event Probability, Mutually Exclusive Events, Independent Events & Tree Diagrams)',
      'Chapter 5: Trigonometry (Trigonometric Ratios in All 4 Quadrants, Sine Rule, Cosine Rule, Compound Angle Identities & Graphs)',
      'Chapter 6: Vectors (Displacement & Position Vectors, Magnitude & Direction, Vector Addition, Scalar Multiplication & Bearings)',
      'Chapter 7: Matrices and Transformations (2×2 Matrix Operations, Determinant, Inverse Matrix, Simultaneous Equations & Linear Transformations)',
      'Chapter 8: Linear Programming (Formulating Constraints, Objective Function, Graphing Feasible Region & Optimal Value)',
    ],
  },
  'Additional Mathematics': {
    'Form 1': [
      'Chapter 1: Numbers (Number Patterns, Divisibility Rules, Base Numerals & Modular Operations)',
      'Chapter 2: Symmetry (Symmetrical Figures, Lines of Symmetry & Rotational Symmetry of Plane Figures)',
      'Chapter 3: Algebra (Algebraic Expressions, Transposition of Formulae, Simultaneous Equations & Inequalities)',
      'Chapter 4: Geometrical Constructions (Division of Line Segments, Angles, Perpendiculars & Polygons)',
      'Chapter 5: Coordinate Geometry (Internal & External Division of a Line Segment, Collinear Points, Parallel & Perpendicular Lines)',
    ],
    'Form 2': [
      'Chapter 1: Algebra (Simultaneous Equations Involving One Linear and One Quadratic Equation: Algebraic Solutions by Substitution, Graphical Solutions & Word Problems)',
      'Chapter 2: Variations (Direct Variations, Inverse Variations, Joint Variations & Graphical Representation)',
      'Chapter 3: Logic (Statements/Propositions, Truth Tables, Negation, Conjunction, Disjunction, Implication, Biconditional, Converse, Inverse, Contrapositive, Tautologies, Contradictions, Electrical Switching Networks & Validity of Arguments)',
      'Chapter 4: Locus (Concept of Locus, Locus About a Fixed Point/Circle, Locus About Two Fixed Points/Perpendicular Bisector, Locus About a Straight Line & Locus About Two Intersecting Lines)',
      'Chapter 5: Sets (Operations on Three Sets, Three-Set Venn Diagrams, Cardinality of Three Intersecting Finite Sets & Survey Word Problems)',
    ],
    'Form 3': [
      'Chapter 1: Sets (Set Properties: Commutative, Associative, Distributive, Identity, Complement & Idempotent Laws, Verification Using Venn Diagrams, Simplification of Set Expressions & De Morgan Laws)',
      'Chapter 2: Equation and Remainder Theorem (Roots of a Quadratic Equation α + β = -b/a and αβ = c/a, Forming Quadratic Equations from Symmetric Roots, Polynomial Long Division, Remainder Theorem & Factor Theorem)',
      'Chapter 3: Functions (Proper & Improper Rational Functions, Domain and Range of Rational Functions, Basic Operations, Partial Fractions, Vertical & Horizontal Asymptotes & Graphs of Rational Functions)',
      'Chapter 4: Statistics (Quartiles Q₁, Q₂, Q₃, Interquartile Range IQR & Semi-Interquartile Range SIR, Cumulative Frequency Curve/Ogive, Assumed Mean, Variance σ² & Standard Deviation σ for Grouped and Ungrouped Data)',
      'Chapter 5: Trigonometry (Pythagorean Trigonometric Identities, Elimination of θ, Compound Angle Formulae for sin(A±B), cos(A±B), tan(A±B), Double Angle Formulae & Solving Trigonometric Equations)',
      'Chapter 6: Differentiation (Derivative from First Principles, Power Rule, Chain Rule, Product Rule, Quotient Rule, Derivatives of Trigonometric Functions, Second Derivative, Rates of Change, Turning Points, Points of Inflexion, Optimization, Curve Sketching, Tangents & Normals)',
    ],
    'Form 4': [
      'Chapter 1: Integration (Indefinite & Definite Integrals, Area Under a Curve, Volume of Revolution & Kinematics)',
      'Chapter 2: Vectors in 2D and 3D (Unit Vectors i, j, k, Dot/Scalar Product, Angle Between Vectors & Work Done)',
      'Chapter 3: Matrices and Determinants (3×3 Matrices, Cofactors, Adjoint, Inverse & 3×3 Simultaneous Equations)',
      'Chapter 4: Permutations, Combinations and Probability (Factorial Notation, nPr, nCr, Conditional Probability & Independent Events)',
    ],
  },
  'Physics': {
    'Form 1': [
      'Chapter 1: Introduction to Physics (Concepts of Physics, Relationship with Other Subjects & Application of Physics in Daily Life)',
      'Chapter 2: Introduction to Laboratory Practice (Concept of Laboratory, Laboratory Rules and Safety, First Aid & Basic Principles of Scientific Investigation)',
      'Chapter 3: Measurement (Concept of Measurement, Physical Quantities, Basic Equipment and Their Uses: Vernier Calliper, Micrometer Screw Gauge, Mass, Weight & Volume)',
      'Chapter 4: Force (Concept of Force, Effects of Forces & Types of Forces: Gravity, Friction, Normal, Tension)',
      'Chapter 5: Density and Relative Density (Concept of Density ρ = m/V, Determination of Density & Relative Density of a Substance)',
      'Chapter 6: Archimedes Principle and the Law of Floatation (Concept of Upthrust, Archimedes Principle, Apparent Weight, Law of Floatation & Hydrometer)',
      'Chapter 7: Structure and Properties of Matter (Structure of Matter, Elasticity & Hooke Law, Adhesion and Cohesion, Surface Tension, Capillarity, Diffusion & Osmosis)',
      'Chapter 8: Pressure (Concept of Pressure P = F/A, Pressure Due to Solids, Pressure in Liquids P = ρgh, Pascal Principle, Hydraulic Press & Atmospheric Pressure)',
      'Chapter 9: Work, Energy and Power (Concept of Work W = Fd, Kinetic Energy ½mv², Potential Energy mgh, Conservation of Energy & Concept of Power P = W/t)',
      'Chapter 10: Introduction to Light (Concept of Light, Sources of Light, Propagation and Transmission of Light, Shadows, Eclipses, Pinhole Camera & Reflection of Light)',
    ],
    'Form 2': [
      'Chapter 1: Static Electricity',
      'Chapter 2: Current Electricity',
      'Chapter 3: Magnetism',
      'Chapter 4: Nature and Reflection of Light',
      'Chapter 5: Refraction and Dispersion of Light',
      'Chapter 6: Optical Instruments',
    ],
    'Form 3': [
      'Chapter 1: Applications of Vectors (Scalar & Vector Quantities, Triangle & Parallelogram Laws of Vector Addition, Relative Velocity & Resolution of Vectors)',
      'Chapter 2: Friction (Concept of Friction, Limiting Friction, Laws of Friction, Coefficient of Static & Dynamic Friction μ = F/R)',
      'Chapter 3: Light (Reflection at Curved Mirrors, Mirror Formula 1/f = 1/u + 1/v, Refraction of Light, Snell Law, Total Internal Reflection, Lenses & Dispersion)',
      'Chapter 4: Optical Instruments (Simple Microscope, Compound Microscope, Astronomical Telescope, Projection Lantern, Lens Camera & The Human Eye)',
      'Chapter 5: Thermal Expansion (Thermal Expansion of Solids, Liquids & Gases, Linear Expansivity α, Bimetallic Strip, Anomalous Expansion of Water & Gas Laws)',
      'Chapter 6: Transfer of Thermal Energy (Conduction, Convection, Radiation & Thermos Flask)',
      'Chapter 7: Measurement of Thermal Energy (Heat Capacity C = mc, Specific Heat Capacity Q = mcΔθ, Change of State & Specific Latent Heat Q = mL)',
      'Chapter 8: Vapour and Humidity (Evaporation, Saturated Vapour Pressure, Dew Point, Relative Humidity & Wet-and-Dry Bulb Hygrometer)',
      'Chapter 9: Thermal Current Electricity (Electromotive Force E, Internal Resistance r, E = I(R + r), Heating Effect of Electric Current, Electrical Power & Domestic Wiring)',
    ],
    'Form 4': [
      'Chapter 1: Waves (Wave Parameters v = fλ, Reflection, Refraction, Diffraction, Interference, Sound Waves, Musical Sounds, Resonance & Electromagnetic Spectrum)',
      'Chapter 2: Electromagnetism (Magnetic Field Around Conductors, Force on Current-Carrying Conductor, Faraday & Lenz Laws of Electromagnetic Induction, Generators & Transformers)',
      'Chapter 3: Radioactivity (Structure of the Nucleus, Isotopes, Alpha, Beta & Gamma Radiation, Nuclear Equations, Half-Life Calculations, Nuclear Fission & Fusion)',
      'Chapter 4: Thermionic Emission (Cathode Rays, Cathode-Ray Tube, X-Rays: Production, Properties & Uses)',
      'Chapter 5: Electronics (Insulators, Conductors, Intrinsic & Extrinsic Semiconductors, p-n Junction Diode, Half/Full-Wave Rectification, Transistors & Single-Stage Amplifiers)',
      'Chapter 6: Elementary Astronomy (Introduction to Astronomy, Constellations, The Solar System, Gravitational Force & Tides)',
      'Chapter 7: Geophysics (Structure & Composition of the Earth, Earthquakes, Volcanoes, Structure of the Atmosphere & Greenhouse Effect)',
    ],
    'Form 5': [
      'Chapter 1: Measurement and Dimensional Analysis (SI Units, Dimensions, Homogeneity & Error Propagation)',
      'Chapter 2: Mechanics — Newton Laws, Projectile Motion, Circular Motion, Gravitation & Simple Harmonic Motion (SHM)',
      'Chapter 3: Properties of Matter (Surface Tension, Viscosity, Poiseuille Formula, Bernoulli Principle & Elasticity)',
      'Chapter 4: Heat and Thermodynamics (Kinetic Theory of Gases, First & Second Laws of Thermodynamics & Thermal Conduction/Radiation)',
    ],
    'Form 6': [
      'Chapter 1: Electromagnetism (Magnetic Flux, Biot-Savart Law, Ampere Law, Faraday & Lenz Laws, Self and Mutual Inductance & AC Circuits)',
      'Chapter 2: Current Electricity (Kirchhoff Laws, Wheatstone Bridge, Potentiometer & Drift Velocity)',
      'Chapter 3: Electronics and Telecommunications (Semiconductors, Operational Amplifiers, Logic Gates & Modulation)',
      'Chapter 4: Atomic and Nuclear Physics (Photoelectric Effect, Bohr Hydrogen Atom, X-Rays, Mass Defect, Binding Energy & Radioactivity)',
      'Chapter 5: Environmental Physics (Solar Energy, Wind Power, Seismology & Soil Physics)',
    ],
  },
  'Chemistry': {
    'Form 1': [
      'Chapter 1: Introduction to Chemistry (Concept of Chemistry & Its Importance in Daily Life, Agriculture, Medicine and Industry)',
      'Chapter 2: Laboratory Techniques and Safety (Rules and Safety Precautions, First Aid Kit, Basic Chemistry Apparatus & Warning Signs)',
      'Chapter 3: Heat Sources and Flames (Bunsen Burner Parts, Luminous vs Non-Luminous Flames & Uses of Flames)',
      'Chapter 4: Scientific Method (Steps of Scientific Investigation: Problem Identification, Hypothesis, Experimentation, Data Interpretation & Conclusion)',
      'Chapter 5: Matter (Concept of Matter, States of Matter, Particulate Nature, Physical and Chemical Changes)',
      'Chapter 6: Elements, Compounds and Mixtures (Chemical Symbols, Elements vs Compounds, Solutions, Suspensions, Emulsions & Methods of Separating Mixtures)',
      'Chapter 7: Air, Combustion, Firefighting, and Rusting (Composition of Air, Combustion, Classes of Fire, Fire Extinguishers & Conditions/Prevention of Rusting)',
    ],
    'Form 2': [
      'Chapter 1: Atomic Structure',
      'Chapter 2: Periodic Classification',
      'Chapter 3: Chemical Bonding, Formula and Nomenclature',
      'Chapter 4: Chemical Reactions',
      'Chapter 5: Acids, Bases, and Salts',
    ],
    'Form 3': [
      'Chapter 1: Chemical Equations (Balancing Molecular Equations, State Symbols, Total & Net Ionic Equations)',
      'Chapter 2: Hardness of Water (Temporary & Permanent Hardness, Causes, Removal by Boiling, Washing Soda, Ion Exchange & Advantages/Disadvantages)',
      'Chapter 3: Acids, Bases and Salts (Natural & Synthetic Indicators, pH Scale, Neutralisation, Preparation, Properties, Solubility & Thermal Decomposition of Salts)',
      'Chapter 4: The Mole Concept and Related Calculations (Avogadro Constant, Molar Mass, Molar Gas Volume at STP 22.4 dm³ & Stoichiometric Reacting Masses)',
      'Chapter 5: Volumetric Analysis (Standard Solutions, Acid-Base Titration Apparatus, Choice of Indicators, Molarity M = conc/Mr & Percentage Purity/Water of Crystallisation)',
      'Chapter 6: Ionic Theory and Electrolysis (Electrolytes vs Non-Electrolytes, Preferential Discharge of Ions, Faraday First & Second Laws of Electrolysis & Industrial Applications)',
      'Chapter 7: Chemical Kinetics, Equilibrium and Energetics (Rate of Chemical Reactions, Factors Affecting Rate, Reversible Reactions, Le Chatelier Principle, Endothermic & Exothermic Reactions)',
      'Chapter 8: Extraction and Compounds of Metals (Extraction of Sodium, Aluminium, Iron & Copper; Oxides, Hydroxides, Carbonates, Nitrates, Chlorides & Sulphates of Metals)',
    ],
    'Form 4': [
      'Chapter 1: Non-Metals and Their Compounds (Chlorine, Hydrogen Chloride, Sulphur, Sulphur Dioxide, Contact Process for Sulphuric Acid, Nitrogen, Ammonia by Haber Process & Carbon)',
      'Chapter 2: Introduction to Organic Chemistry (Homologous Series, Isomerism, Alkanes, Alkenes, Alkynes, Alcohols/Alkanols, Carboxylic Acids/Alkanoic Acids, Esterification & Soap/Polymers)',
      'Chapter 3: Soil Chemistry (Soil Formation, Soil Reaction/pH, Liming, Plant Nutrients Macro/Micro, Manures, Straight & Compound Fertilisers)',
      'Chapter 4: Pollution (Terrestrial, Aquatic and Aerial Pollution, Acid Rain, Ozone Layer Depletion, Global Warming & Environmental Conservation)',
      'Chapter 5: Qualitative Analysis (Preliminary Tests, Flame Tests, Action of Heat, Action of Dilute/Concentrated Acids & Confirmatory Tests for Cations and Anions)',
    ],
    'Form 5': [
      'Chapter 1: The Atom (Rutherford & Bohr Models, Atomic Spectra, Quantum Numbers & Electronic Configuration)',
      'Chapter 2: Chemical Bonding (Hybridisation, VSEPR Theory, Hydrogen Bonding & Intermolecular Forces)',
      'Chapter 3: Gases and Relative Molecular Masses in Solution (Gas Laws, Ideal Gas Equation PV = nRT, Dalton Law, Colligative Properties & Raoult Law)',
      'Chapter 4: Chemical Energetics and Chemical Equilibrium (Hess Law, Born-Haber Cycle, Equilibrium Constants Kc and Kp)',
      'Chapter 5: Aliphatic and Aromatic Hydrocarbons (Alkanes, Alkenes, Alkynes, Benzene & Electrophilic Substitution)',
    ],
    'Form 6': [
      'Chapter 1: Chemical Kinetics and Electrochemistry (Order of Reaction, Arrhenius Equation, Electrode Potentials, Nernst Equation, pH & Buffer Solutions)',
      'Chapter 2: Transition Elements and Extraction of Metals (d-Block Chemistry, Complex Ions, Ligands & Metallurgy)',
      'Chapter 3: Organic Chemistry II — Haloalkanes, Alcohols, Phenols, Carbonyls, Carboxylic Acids, Amines & Polymers',
      'Chapter 4: Soil and Environmental Chemistry (Ion Exchange, Soil Colloids, Liming & Pollution Control)',
    ],
  },
  'Biology': {
    'Form 1': [
      'Chapter 1: Introduction to Biology (Basic Concepts and Terminologies, Branches of Biology & Importance of Studying Biology)',
      'Chapter 2: Biology Laboratory (Concept of Biology Laboratory, Laboratory Rules, Safety Symbols, Microscope & Common Apparatus)',
      'Chapter 3: Scientific Processes in Biology (Observation, Measurement & Steps of Scientific Investigation)',
      'Chapter 4: First Aid and Safety in Our Environment (First Aid Kit, Procedures for Common Accidents & Safety at Home and School)',
      'Chapter 5: Waste Disposal (Concept of Waste, Types of Waste, Principles of Waste Disposal & Effects of Poor Waste Disposal)',
      'Chapter 6: Personal Hygiene and Good Manners (Principles of Personal Hygiene, Good Manners & Care of the Body During Puberty)',
      'Chapter 7: Health, Immunity and Diseases (Concept of Health and Immunity, Types of Immunity & Common Infections and Diseases)',
      'Chapter 8: STIs, STDs, HIV and AIDS (Concept, Transmission, Symptoms, Prevention & Care and Support for PLWHA)',
      'Chapter 9: Cell Structure and Organization (Prokaryotic and Eukaryotic Cells, Plant and Animal Cell Organelles & Cell Differentiation)',
      'Chapter 10: Classification of Living Things (Artificial and Natural Classification Systems, Taxonomic Ranks & Binomial Nomenclature)',
      'Chapter 11: Viruses, Kingdom Monera and Kingdom Protoctista (Characteristics, Structure & Economic Importance of Viruses, Bacteria, Amoeba, Euglena, Paramecium & Plasmodium)',
    ],
    'Form 2': [
      'Chapter 1: Nutrition in Animals and Plants',
      'Chapter 2: Digestive System',
      'Chapter 3: Transport of Materials in Living Organisms',
      'Chapter 4: Transport of Materials in Flowering Plants',
      'Chapter 5: Transport of Materials in Mammals',
      'Chapter 6: Gas Exchange and Respiration',
    ],
    'Form 3': [
      'Chapter 1: Coordination in Plants (Concept of Coordination in Plants, Plant Hormones/Phytohormones & Tropic and Nastic Movements)',
      'Chapter 2: Coordination in Mammals (Nervous Coordination in Humans, Structure and Functions of Neurones, Nerve Impulse, Central & Peripheral Nervous System, Sense Organs & Drug Abuse)',
      'Chapter 3: Endocrine System (Concept of Endocrine System, Interaction Between Endocrine and Nervous System, Hormones & Endocrine Disorders)',
      'Chapter 4: Excretion in Animals and Plants (Concept of Excretion, Excretion in Humans, The Urinary System, Structure of the Nephron, Urine Formation & Disorders of the Excretory System)',
      'Chapter 5: Regulation (Concept of Regulation/Homeostasis, Homeostatic Mechanisms, Thermoregulation, Osmoregulation & Blood Sugar Regulation)',
      'Chapter 6: Classification of Plants, Movement and Reproduction (Coniferophyta & Angiospermophyta; Human Skeletal System & Muscles; Mitosis, Meiosis, Reproduction in Plants & Humans)',
    ],
    'Form 4': [
      'Chapter 1: Growth (Concept of Growth, Mitosis and Growth, Growth Curves, Seed Dormancy, Viability & Epigeal vs Hypogeal Germination)',
      'Chapter 2: Genetics (Hereditary Material DNA & RNA, Concept of Genetics, Mendel First Law, Monohybrid Inheritance, Incomplete/Co-dominance, Sex Determination, Sex-Linked Traits & Variation/Mutation)',
      'Chapter 3: Classification of Living Things (Kingdom Animalia: Phylum Platyhelminthes, Aschelminthes/Nematoda, Annelida, Arthropoda & Chordata)',
      'Chapter 4: Evolution (Concept of Organic Evolution, Origin of Life, Lamarckism, Darwinism/Natural Selection, Evidence of Evolution: Fossils, Comparative Anatomy, Embryology)',
      'Chapter 5: HIV/AIDS and STIs (Relationship Between HIV, AIDS and STIs, Management and Control of HIV/AIDS and STIs, Counselling and Voluntary Testing)',
    ],
    'Form 5': [
      'Chapter 1: Cytology and Biochemistry (Prokaryotic & Eukaryotic Ultrastructure, Carbohydrates, Lipids, Proteins, Enzymes & ATP)',
      'Chapter 2: Principles of Classification and Comparative Studies of Natural Groups of Organisms (Viruses, Monera, Protoctista, Fungi, Plantae & Animalia)',
      'Chapter 3: Coordination and Nutrition (Nerve Impulse Transmission, Synaptic Transmission, Phytohormones, C3 & C4 Photosynthesis and Digestion)',
      'Chapter 4: Gaseous Exchange and Respiration (Oxygen Dissociation Curves, Glycolysis, Krebs Cycle & Electron Transport Chain)',
    ],
    'Form 6': [
      'Chapter 1: Transportation and Homeostasis (Xylem Translocation, Munch Mass Flow Hypothesis, Mammalian Heart Cycle, Counter-Current Multiplier in Nephron & Thermoregulation)',
      'Chapter 2: Reproduction, Growth and Development (Gametogenesis, Double Fertilisation, Hormonal Control of Human Reproduction, Mitosis, Meiosis & Meristematic Growth)',
      'Chapter 3: Genetics and Molecular Biology (DNA Replication, Protein Synthesis Transcription/Translation, Mendelian & Non-Mendelian Dihybrid Inheritance, Epistasis & Gene Linkage)',
      'Chapter 4: Evolution and Ecology (Theories of Evolution, Speciation, Population Ecology, Energy Flow, Biogeochemical Cycles & Ecological Sampling)',
    ],
  },
  'Historia ya Tanzania na Maadili': {
    'Form 1': [
      'Sura ya Kwanza: Dhana ya Historia ya Tanzania na Maadili (Maana ya Historia ya Tanzania na Maadili, Umuhimu wa Kujifunza Historia ya Tanzania na Maadili)',
      'Sura ya Pili: Chimbuko la Jamii za Kitanzania na Maadili Yake (Asili ya Jamii za Kitanzania: Wakichembe/Wakhoisani, Wakushito, Wabantu na Wanilo; Maadili ya Jamii za Kitanzania)',
      'Sura ya Tatu: Maadili na Urithi wa Jamii za Kitanzania (Dhana ya Urithi wa Kitanzania, Urithi wa Kihistoria na Kiutamaduni: Isimila, Kondoa Irangi, Ngome Kongwe na Tunu za Taifa)',
      'Sura ya Nne: Fursa Zinazotokana na Urithi wa Jamii za Kitanzania (Utalii wa Kiutamaduni na Kihistoria, Tiba za Asili, Sanaa na Ujenzi wa Uchumi)',
      'Sura ya Tano: Mifumo katika Jamii za Kitanzania Kabla ya Ukoloni (Mifumo ya Kijamii, Kisiasa na Kiuchumi: Kilimo, Ufugaji, Uvuvi na Viwanda vya Jadi vya Uhunzi na Ufinyanzi)',
      'Sura ya Sita: Uhusiano kati ya Jamii za Kitanzania na Jamii Nyingine (Mwingiliano wa Kibiashara na Kiutamaduni Kabla ya Ukoloni)',
      'Sura ya Saba: Sayansi na Teknolojia Kabla ya Ukoloni (Teknolojia ya Ufuaji Chuma, Ujenzi, Kalenda za Asili na Tiba Asilia)',
    ],
    'Form 2': [
      'Sura ya Kwanza: Ukoloni katika Jamii za Kitanzania (Dhana ya Ukoloni, Mbinu za Kuweka Utawala wa Kikoloni na Mifumo ya Utawala wa Kijerumani na Kiingereza)',
      'Sura ya Pili: Athari za Ukoloni katika Maadili ya Kitanzania (Athari za Kiuchumi, Kijamii na Kiutamaduni; Maadili ya Kitanzania Yaliyodumishwa Wakati wa Ukoloni)',
      'Sura ya Tatu: Mapambano ya Awali Dhidi ya Uvamizi wa Kikoloni (Dhana ya Uvamizi wa Kikoloni, Sababu za Kupinga Uvamizi, Mapambano ya Mkwawa, Abushiri, Mirambo, Kinjekitile na Vita vya Majimaji 1905–1907)',
      'Sura ya Nne: Harakati za Kudai Uhuru wa Tanganyika na Zanzibar (Dhana na Misingi ya Kudai Uhuru, Mbinu Zilizotumika: TAA, TANU na Mwalimu Julius K. Nyerere; ASP na Sheikh Abeid Amani Karume)',
      'Sura ya Tano: Ujenzi wa Taifa Baada ya Ukoloni (Dhana ya Ujenzi wa Taifa, Mifumo Iliyojengwa Mwaka 1961 hadi 1966, Mikakati na Changamoto za Ujenzi wa Taifa)',
      'Sura ya Sita: Mapinduzi Matukufu ya Zanzibar (Dhana ya Mapinduzi, Chimbuko na Sababu za Mapinduzi ya Januari 12, 1964 na Mchango wa Mapinduzi Matukufu ya Zanzibar)',
    ],
    'Form 3': [
      'Sura ya Kwanza: Muungano wa Tanganyika na Zanzibar (Dhana ya Muungano, Chimbuko na Hatua za Muungano wa Tanganyika na Zanzibar wa Aprili 26, 1964)',
      'Sura ya Pili: Mchango wa Muungano wa Tanganyika na Zanzibar (Mafanikio ya Kisiasa, Kiuchumi, Kijamii na Ulinzi wa Maadili na Umoja wa Kitaifa)',
      'Sura ya Tatu: Chimbuko na Misingi ya Azimio la Arusha (Sababu za Kutangazwa kwa Azimio la Arusha 1967 na Siasa ya Ujamaa na Kujitegemea)',
      'Sura ya Nne: Ujenzi wa Taifa Wakati wa Azimio la Arusha (Utaifishaji wa Njia Kuu za Uchumi, Vijiji vya Ujamaa na Maendeleo ya Elimu na Afya)',
      'Sura ya Tano: Ujenzi wa Maadili Wakati wa Azimio la Arusha (Miiko ya Uongozi, Uzalendo, Uadilifu, Usawa na Kupinga Rushwa na Unyonyaji)',
      'Sura ya Sita: Tanzania katika Uhusiano wa Kikanda (Chimbuko la Uhusiano wa Kikanda: EAC, SADC na Kamati ya Ukombozi ya OAU)',
      'Sura ya Saba: Mchango wa Uhusiano wa Kikanda (Faida za Kiuchumi, Biashara, Miundombinu, Ulinzi na Diplomasia)',
      'Sura ya Nane: Changamoto za Uhusiano wa Kikanda (Changamoto za Kiuchumi, Kisiasa na Kijamii na Njia za Kuzitatua)',
    ],
    'Form 4': [
      'Sura ya Kwanza: Mageuzi ya Kisiasa, Kiuchumi na Kijamii Tanzania Tangu Mwaka 1985 (Mfumo wa Vyama Vingi 1992 na Uchumi wa Soko)',
      'Sura ya Pili: Tanzania katika Jumuiya za Kimataifa (Umoja wa Afrika AU, Umoja wa Mataifa UN na Diplomasia ya Uchumi)',
      'Sura ya Tatu: Utandawazi, Sayansi na Teknolojia na Ulinzi wa Maadili na Tunu za Taifa',
      'Sura ya Nne: Tathmini ya Urithi wa Taifa, Uzalendo, Uadilifu na Dira ya Maendeleo ya Tanzania',
    ],
    'Form 5': [
      'Sura ya Kwanza: Falsafa na Misingi ya Historia ya Tanzania na Maadili (Chimbuko la Taifa, Utambulisho na Tunu za Taifa)',
      'Sura ya Pili: Maendeleo ya Jamii na Teknolojia ya Asili Tanzania Kabla ya Ukoloni',
      'Sura ya Tatu: Uchumi wa Kikoloni, Harakati za Ukombozi na Misingi ya Utaifa Tanzania',
      'Sura ya Nne: Maadili ya Uongozi, Utawala wa Sheria na Uwajibikaji katika Jamii ya Tanzania',
    ],
    'Form 6': [
      'Sura ya Kwanza: Falsafa ya Ujamaa na Kujitegemea na Mageuzi ya Kiuchumi Tanzania',
      'Sura ya Pili: Muungano wa Tanganyika na Zanzibar, Katiba na Umoja wa Kitaifa',
      'Sura ya Tatu: Diplomasia ya Tanzania, Ukombozi wa Afrika na Ushirikiano wa Kimataifa',
      'Sura ya Nne: Maadili katika Sayansi, Teknolojia ya Habari na Maendeleo Endelevu',
    ],
  },
  'Business Studies': {
    'Form 1': [
      'Chapter 1: Introduction to Business Studies (The Concept of a Business, Business Processes, Terminologies Used in Business Studies & Importance of Business Studies in the Community)',
      'Chapter 2: Entrepreneurship (The Concept of Entrepreneurship, Characteristics of an Entrepreneur & Theories of Entrepreneurship)',
      'Chapter 3: Sole Proprietorship (The Concept of Sole Proprietorship, Formation of a Sole Proprietorship & Ways of Solving Challenges Faced by Sole Proprietorships)',
    ],
    'Form 2': [
      'Chapter 1: Production (The Concept of Production, Types of Production & Factors of Production: Land, Labour, Capital and Entrepreneurship)',
      'Chapter 2: Financing Small-Sized Businesses (The Concept of Small-Sized Businesses, Sources of Funds for Small Businesses & Microfinancing and Cooperatives in Facilitating Business Formation and Operations)',
      'Chapter 3: Small Business Management (The Concept of Small Business Management, Financial and Other Record-Keeping for a Small Business, Profit and Loss Calculation for a Small Business & Budgeting, Control and Administration)',
      'Chapter 4: Warehousing and Inventorying for Small Businesses (The Concept of Warehousing, The Concept of Inventorying, Essential Documents for Warehouse and Inventory Management & Methods for Inventory Management)',
      'Chapter 5: Business Opportunity Identification (The Concept of Business Opportunity & Ways of Identifying Business Opportunities)',
    ],
    'Form 3': [
      'Chapter 1: Forms of Business Units (Partnerships, Co-operative Societies, Joint Stock Companies & Public Enterprises)',
      'Chapter 2: Marketing and Distribution (Marketing Mix 4Ps: Product, Price, Place, Promotion, Market Research, Digital Marketing & Customer Care)',
      'Chapter 3: Financial Statements and Accounting for Business (Double Entry, Trial Balance, Income Statement / Profit & Loss Account and Statement of Financial Position / Balance Sheet)',
      'Chapter 4: Taxation, Business Regulation and Compliance in Tanzania (TRA, Direct & Indirect Taxes, VAT, TIN, EFD Receipts, BRELA & TBS)',
    ],
    'Form 4': [
      'Chapter 1: Business Planning and Project Management (Writing a Comprehensive Business Plan, Executive Summary, Financial Projections & Cash Flow)',
      'Chapter 2: International Trade and Regional Economic Integration (Import/Export Procedures, Balance of Trade/Payments, EAC, SADC & AfCFTA)',
      'Chapter 3: Banking, Insurance and Financial Markets in Tanzania (Central Bank BoT, Commercial Banks, Mobile Money, Principles of Insurance & Dar es Salaam Stock Exchange DSE)',
      'Chapter 4: Human Resource Management and Business Ethics (Recruitment, Motivation, Leadership, Quality Control & Corporate Social Responsibility)',
    ],
    'Form 5': [
      'Chapter 1: Nature and Scope of Business and Business Environment (Micro & Macro Environment, SWOT & PESTEL Analysis)',
      'Chapter 2: Entrepreneurship, Innovation and Business Start-Up Strategy',
      'Chapter 3: Business Organization, Corporate Governance and Management Principles',
      'Chapter 4: Production, Operations and Supply Chain Management',
    ],
    'Form 6': [
      'Chapter 1: Financial Management, Investment Appraisal and Financial Statements Analysis',
      'Chapter 2: Strategic Marketing Management, Consumer Behaviour and E-Commerce',
      'Chapter 3: Human Resource Management, Organizational Behaviour and Labour Laws in Tanzania',
      'Chapter 4: International Business, Trade Finance and Economic Integration',
    ],
  },
  'Information and Computer Studies (ICS)': {
    'Form 1': [
      'Chapter 1: Introduction to Information and Computer Studies',
      'Chapter 2: Data and Information',
      'Chapter 3: Computer Evolution',
      'Chapter 4: Computer Hardware and Software',
      'Chapter 5: Classification and Significance of Computers',
      'Chapter 6: Computer Handling',
    ],
    'Form 2': [
      'Chapter 1: Word Processing (Concept of Word Processing, Creating, Editing, Formatting Tables & Printing Documents)',
      'Chapter 2: Spreadsheet (Concept of Spreadsheet, Workbook, Formulas, Functions, Charts & Data Manipulation)',
      'Chapter 3: Computer Networks and Communications (Concept of Networking, Network Devices, Topologies & Types of Networks LAN, MAN, WAN)',
      'Chapter 4: The Internet (Concept of the Internet, Search Engines, Electronic Mail/E-Mail & E-Learning)',
    ],
    'Form 3': [
      'Chapter 1: Impact of Information and Communication Technology (ICT) on Society (E-Commerce, E-Government, Employment, Health, Culture & Cyber Ethics)',
      'Chapter 2: Web Development (Concept of Webpage & Website, HTML Structure, Tags, Lists, Tables, Hyperlinks & Publishing)',
      'Chapter 3: Database as Information Systems (Concept of Database, Manual vs Electronic Databases, Relational Database Design, Tables, Queries, Forms & Reports)',
    ],
    'Form 4': [
      'Chapter 1: Management of Database Information Systems (Advanced Queries, Relationships, Data Integrity & Security)',
      'Chapter 2: Presentation (Concept of Electronic Presentation, Creating Slides, Animations, Transitions & Delivering Presentations)',
      'Chapter 3: Desktop Publishing (Concept of DTP, Publication Design, Page Layout, Typography & Printing Publications)',
      'Chapter 4: Multimedia (Concept of Multimedia, Elements: Text, Audio, Image, Video, Animation & Multimedia Authoring)',
    ],
  },
  'Computer Science': {
    'Form 1': [
      'Chapter 1: Introduction to Information and Computer Studies',
      'Chapter 2: Data and Information',
      'Chapter 3: Computer Evolution',
      'Chapter 4: Computer Hardware and Software',
      'Chapter 5: Classification and Significance of Computers',
      'Chapter 6: Computer Handling',
    ],
    'Form 2': [
      'Chapter 1: The Internet (The Concept of the Internet, Basic Internet Related Concepts, Internet Connectivity, Internet Services and Applications & Ethical and Responsible Use of the Internet)',
      'Chapter 2: Cybersecurity (Concept of Cybersecurity, Cyber Threats and Attacks, Cybercrimes, Ethical Issues and Principles, Practices of Cybersecurity & Cloud Security)',
      'Chapter 3: Introduction to Computer Programming (The Concept of Programming, From Hardware to Code, Programming Languages, Algorithms, Pseudocode, Flowcharts, Data Types, Data Structures & Debugging)',
      'Chapter 4: Computer Programming with C (Concept of C Programming, Basic Syntax and Structure of a C Program, Variables, Data Types, Operators, Control Flow, Functions, Arrays, Strings & File Handling)',
      'Chapter 5: Computer Programming with Python (Concept of Python Programming, Python Syntax and Structure, Variables, Data Types, Operators, Conditional Statements, Loops, Functions, Lists, Strings, File Handling & Python Libraries)',
    ],
    'Form 3': [
      'Chapter 1: Problem Solving and Algorithms (Problem Definition, Pseudocode, Flowcharts & Control Structures: Sequence, Selection, Iteration)',
      'Chapter 2: Website Design and Development (HTML Structure, Tags, Lists, Tables, Forms, Hyperlinks, CSS Styling & JavaScript Interactivity)',
      'Chapter 3: Database Management Systems (Relational Databases, ER Diagrams, Tables, Primary & Foreign Keys, SQL Queries, Forms & Reports)',
      'Chapter 4: Computer Networks and Data Communication (LAN, MAN, WAN, Network Topologies, OSI Model & Network Devices)',
    ],
    'Form 4': [
      'Chapter 1: Data Representation and Logic Gates (Binary, Octal, Hexadecimal Conversions, Two Complement Binary Arithmetic & Logic Gates AND, OR, NOT, NAND, NOR, XOR)',
      'Chapter 2: System Analysis and Design (System Development Life Cycle SDLC: Investigation, Analysis, Design, Implementation, Testing & Maintenance)',
      'Chapter 3: Multimedia and Desktop Publishing (DTP Concepts, Graphic Design, Audio/Video Processing & Publication Layout)',
      'Chapter 4: Emerging Technologies and Impact of ICT on Society (Artificial Intelligence, Cloud Computing, IoT, E-Commerce & E-Government in Tanzania)',
    ],
    'Form 5': [
      'Chapter 1: Computer Architecture',
      'Chapter 2: Performance and Optimisation of Computer Processor',
      'Chapter 3: Advanced Computer Networks',
      'Chapter 4: Object Oriented Programming with C++',
      'Chapter 5: Object Oriented Programming with Java',
      'Chapter 6: Object Oriented Programming with Python',
      'Chapter 7: Operating Systems',
      'Chapter 8: Databases and Database Management Systems',
    ],
    'Form 6': [
      'Chapter 1: Relational Database Management Systems and SQL (Normalization 1NF, 2NF, 3NF, ER Modeling & SQL DDL/DML)',
      'Chapter 2: Data Communication, Computer Networking and TCP/IP Protocol Suite (IPv4/IPv6 Subnetting & Routing)',
      'Chapter 3: Web Engineering and Full-Stack Application Development (HTML5, CSS3, JavaScript & Backend Scripting)',
      'Chapter 4: Software Engineering, System Development Life Cycle (SDLC) and Emerging Technologies',
    ],
  },
  'Geography': {
    'Form 1': [
      'Chapter 1: The Concept of Geography (Meaning of Geography, Branches: Physical, Human & Practical Geography, Interrelationship & Importance of Studying Geography)',
      'Chapter 2: The Solar System (Concept of the Solar System, The Sun, Planets, Satellites, Asteroids, Comets, Earth Shape & Movements: Rotation, Revolution, Eclipses, Latitudes, Longitudes & Time Calculation)',
      'Chapter 3: Major Features of the Earth Surface (Continents, Major Relief Features: Mountains, Plateaus, Plains, Rift Valleys; Water Bodies: Oceans, Seas, Lakes & River Basins)',
      'Chapter 4: Weather and Climate (Meaning of Weather vs Climate, Elements of Weather, Weather Station, Stevenson Screen, Measuring Instruments, Weather Forecasting & Major Climatic Regions)',
      'Chapter 5: Map Work (Concept of a Map, Components/Essentials of a Map, Types of Maps, Map Scale, Measuring Distances & Areas, Compass Bearing, Direction & Grid References)',
    ],
    'Form 2': [
      'Chapter 1: The Internal Structure of the Earth',
      'Chapter 2: The External Structure of the Earth',
      'Chapter 3: Map Reading and Interpretation',
      'Chapter 4: Photograph Reading and Interpretation',
    ],
    'Form 3': [
      'Chapter 1: Structure of the Earth (Concentric Zones: Crust/Lithosphere, Mantle/Mesosphere, Core/Barysphere; Igneous, Sedimentary & Metamorphic Rocks and Rock Cycle)',
      'Chapter 2: Forces That Affect the Earth (Internal Forces: Earth Movements, Folding, Faulting, Vulcanicity, Earthquakes; External Forces: Weathering, Mass Wasting, River, Wind, Glacial & Wave Action)',
      'Chapter 3: Soil (Soil Formation, Factors, Soil Profile, Soil Properties: Texture, Structure, Porosity, pH, Soil Erosion & Soil Conservation)',
      'Chapter 4: Elementary Survey and Map Making (Chain/Tape Surveying, Prismatic Compass Survey, Plane Table Survey & Levelling, Booking & Plotting)',
      'Chapter 5: Map Reading and Map Interpretation (Topographical Maps, Contours, Cross-Section/Relief Profile, Intervisibility, Gradient, Drainage Patterns & Human Settlements)',
      'Chapter 6: Photograph Reading and Interpretation (Ground, Oblique & Vertical Aerial Photographs; Foreground, Middleground, Background; Estimating Scale, Time & Economic Activities)',
      'Chapter 7: Application of Simple Statistics (Types of Statistical Data, Line, Bar, Compound, Divergent Graphs, Pie Charts & Measures of Central Tendency)',
    ],
    'Form 4': [
      'Chapter 1: Introduction to Research (Concept, Types of Research, Stages of Research Work, Sampling Techniques, Data Collection Tools: Questionnaire, Interview, Observation)',
      'Chapter 2: Climate and Natural Regions (World Climatic Regions: Equatorial, Tropical Savannah, Hot Desert, Mediterranean, Tundra & Climate Change)',
      'Chapter 3: Human Population and Settlement (Population Distribution, Density, Census, Birth/Death/Fertility Rates, Migration, Population Pyramids & Rural/Urban Settlements)',
      'Chapter 4: Environmental Issues and Management (Biodiversity Loss, Deforestation, Desertification, Pollution, Waste Management & Environmental Conservation Laws in Tanzania)',
    ],
    'Form 5': [
      'Chapter 1: Physical Geography — Plate Tectonics, Internal & External Geomorphic Processes, Rocks and Hydrology',
      'Chapter 2: Climatology, Meteorology, Biogeography and Soil Science (Pedology)',
      'Chapter 3: Practical Geography — Topographical Map Interpretation, Surveying (Chain, Prismatic Compass, Plane Table, Levelling) & Aerial Photographs',
      'Chapter 4: Application of Statistics and Geographical Research Methods',
    ],
    'Form 6': [
      'Chapter 1: Population and Development (Demographic Transition, Migration, Settlement & Population Policies in Tanzania)',
      'Chapter 2: Regional Focal Studies — Agriculture, Livestock, Forestry, Fishing and Mining in Tanzania and Selected World Countries',
      'Chapter 3: Industrialisation, Energy Resources, Transport, Communication and Sustainable Tourism',
      'Chapter 4: Environmental Conservation, Climate Change and Sustainable Resource Management',
    ],
  },
  'History': {
    'Form 1': [
      'Chapter 1: Meaning, Importance, and Sources of History (Meaning of History, Importance of Studying History & Sources: Oral Traditions, Historical Sites, Archaeology, Archives, Museums, Written Records, Anthropology & Linguistics)',
      'Chapter 2: Human Evolution, Technology, and Environment (Origin of Man: Creation vs Evolution, Stages of Human Evolution, Stone Age [Early, Middle, Late] & Iron Age)',
      'Chapter 3: Development of Agriculture in Pre-Colonial African Societies (Crop Cultivation, Mixed Farming, Irrigation & Permanent Settlement)',
      'Chapter 4: Handicraft and Mining Industries in Pre-Colonial Africa (Bark-Cloth Making, Basketry, Pottery, Iron Smelting, Salt Making, Gold & Copper Mining)',
      'Chapter 5: Trade in Pre-Colonial Africa (Local Trade & Regional Long-Distance Trade in East, Central, West & North Africa)',
      'Chapter 6: Development of Social and Political Systems in Pre-Colonial Africa (Kinship/Clan Organization, Age-Set System & Ntemiship)',
      'Chapter 7: State Organisation in Pre-Colonial Africa (Centralised vs Decentralised States: Buganda, Bunyoro, Karagwe, Ghana, Mali, Songhai, Asante, Oyo, Kongo, Mwenemutapa & Zulu)',
    ],
    'Form 2': [
      'Chapter 1: Interactions Among the People of Africa (Social and Economic Factors for Interactions, Ngoni Migration: Causes & Effects)',
      'Chapter 2: Socio-Economic Development and Production in Pre-Colonial Africa (Modes of Production: Communalism, Slavery and Feudalism — Nyarubanja, Ubugabire, Umwinyi)',
      'Chapter 3: Africa and the External World (Early Contacts with Middle East & Far East, Portuguese Rule in East Africa, Dutch Settlement at the Cape, Slave Trade & Trans-Atlantic Slave Trade)',
      'Chapter 4: Industrial Capitalism (Transition from Mercantile to Industrial Capitalism, Demands of Industrial Capitalism, Agents of Industrial Capitalism: Explorers, Missionaries, Traders & Abolition of Slave Trade)',
    ],
    'Form 3': [
      'Chapter 1: Establishment of Colonialism (Scramble for and Partition of Africa, Berlin Conference 1884–1885, Imposition of Colonial Rule & African Reactions: Active/Passive Resistance, Majimaji, Samori Toure, Menelik II)',
      'Chapter 2: Colonial Administrative Systems (Direct Rule, Indirect Rule, Assimilation & Association Policies; Colonial Military and Legal Institutions)',
      'Chapter 3: Colonial Economy (Characteristics of Colonial Economy, Peasant, Plantation & Settler Agriculture, Colonial Mining, Trade, Transport/Railways & Migrant Labour)',
      'Chapter 4: Colonial Social Services (Colonial Education, Health, Water & Housing Services: Distribution, Objectives & Impact on Africa)',
    ],
    'Form 4': [
      'Chapter 1: Crises in the Capitalist System (First World War 1914–1918, Great Economic Depression 1929–1933, Second World War 1939–1945 & Their Impact on Africa)',
      'Chapter 2: Nationalism and Decolonisation (Rise of Mass Nationalism, Political Parties, Constitutional/Peaceful Struggle in Tanganyika, Ghana, Uganda; Armed Liberation in Mozambique, Angola, Zimbabwe & South Africa)',
      'Chapter 3: Changes in Political, Social and Economic Policies in Africa After Independence (Ideological Changes, Single-Party vs Multi-Party, Economic Development Strategies, Neo-Colonialism, Military Coups & Structural Adjustment Programmes)',
      'Chapter 4: Africa in International Affairs (Continental Cooperation: OAU/AU; Regional Integration: EAC, SADC, ECOWAS; Africa and the United Nations UN)',
    ],
    'Form 5': [
      'Chapter 1: Pre-Colonial African Societies and Modes of Production',
      'Chapter 2: Africa and Europe by the 15th to 19th Century (Mercantilism, Trans-Atlantic Slave Trade & Legitimate Trade)',
      'Chapter 3: People of African Origin in the New World (Diaspora, Pan-Africanism & Civil Rights Movement)',
      'Chapter 4: From Colonialism to the First World War (1880s–1914) and Colonial Economy',
      'Chapter 5: Colonial Economy and Social Services After the Second World War & Rise of Nationalism in Africa',
    ],
    'Form 6': [
      'Chapter 1: The Rise of Capitalism in Europe (Agrarian, Demographic, Scientific & Industrial Revolutions)',
      'Chapter 2: The Rise of Democracy in Europe (English, American & French Revolutions and 1848 Revolutions)',
      'Chapter 3: Imperialism, Territorial Division of the World and Dictatorships (Fascism in Italy, Nazism in Germany & First/Second World Wars)',
      'Chapter 4: Rise of Socialism (Russian Revolution 1917, Chinese Revolution 1949 & Cold War)',
      'Chapter 5: Emergence of USA as a Superpower, Neo-Colonialism and Underdevelopment in the Third World',
    ],
  },
  'Civics': {
    'Form 1': [
      'Chapter 1: Introduction to Civics (Meaning of Civics, Main Themes, Relationship Between Civics and Other Subjects & Importance of Studying Civics)',
      'Chapter 2: Our Nation (Meaning & Components of Our Nation, National Symbols: Flag, Coat of Arms, Anthem, Uhuru Torch, Currency, Constitution & National Festivals)',
      'Chapter 3: Promotion of Life Skills (Meaning & Types of Life Skills: Individual Life Skills, Social Life Skills & Effective Decision-Making Skills)',
      'Chapter 4: Human Rights (Meaning, Universal Declaration of Human Rights, Categories of Human Rights, Protection & Ways to Combat Human Rights Abuse)',
      'Chapter 5: Responsible Citizenship (Meaning of Citizen and Citizenship, Types of Citizenship in Tanzania, Privileges, Civic Responsibilities & Special Groups)',
      'Chapter 6: Career and Work-Related Activities (Meaning of Career and Work, Factors Affecting Career Development, Choosing a Career & Importance of Work)',
      'Chapter 7: Family Life Education (Concept of Family, Types of Families, Courtship, Marriage, Factors Contributing to Family Stability & Responsibilities of Family Members)',
      'Chapter 8: Proper Behaviour and Decision Making (Types of Behaviour, Elements of Proper Behaviour & Steps of Rational Decision-Making)',
      'Chapter 9: Road Safety Education (Road Signs, Causes of Road Accidents, Effects & Prevention of Road Accidents in Tanzania)',
    ],
    'Form 2': [
      'Chapter 1: Promotion of Life Skills (Social Problem-Solving Techniques, Steps in Social Problem Solving & Importance of Applying Problem-Solving Techniques)',
      'Chapter 2: The Government of the United Republic of Tanzania (Types of Governments, State Authorities: The Executive, The Legislature/Parliament, The Judiciary; Local Government Authorities & The Union of Tanganyika and Zanzibar)',
      'Chapter 3: The Constitution of the United Republic of Tanzania (Concept, Types of Constitutions, Structure of the 1977 Constitution, Constitutional Making, Amendments & Safeguarding the Constitution)',
      'Chapter 4: Democracy (Concept of Democracy, Principles of Democracy, Multiparty Democracy & Democratic Elections in Tanzania / INEC)',
      'Chapter 5: Gender (Gender Concepts, Gender Issues in Society, Negative Socio-Cultural Practices & Corrective Measures / Women Empowerment)',
    ],
    'Form 3': [
      'Chapter 1: Economic and Social Development (Concept & Indicators of Economic Development, Factors for Economic Development, Role of Financial Institutions: BoT, Commercial Banks, SACCOS, NSSF, NHIF)',
      'Chapter 2: Poverty (Concept, Levels, Types, Causes and Effects of Poverty in Tanzania & Strategies for Poverty Alleviation: MKUKUTA, TASAF)',
    ],
    'Form 4': [
      'Chapter 1: Culture (Concept, Characteristics, Elements & Importance of Culture, Positive vs Negative Cultural Values, Reproductive Health & Preservation of National Cultural Heritage)',
      'Chapter 2: Globalisation (Concept, Driving Forces, Aspects of Globalisation: Free Market, Structural Adjustment, Privatisation, Regional Integration & Opportunities/Challenges for Tanzania)',
    ],
  },
  'Book-Keeping': {
    'Form 1': [
      'Chapter 1: Introduction to Book-Keeping (Concept, Objectives, Importance, Users of Accounting Information & Accounting Equation Assets = Capital + Liabilities)',
      'Chapter 2: Principles of Double Entry (Concept of Business Transaction, Debit & Credit Rules for Personal, Real & Nominal Accounts)',
      'Chapter 3: Books of Prime Entry (Source Documents: Invoices, Credit/Debit Notes, Receipts; Sales Day Book, Purchases Day Book, Returns Inwards/Outwards Journals & General Journal)',
      'Chapter 4: Ledgers (Posting from Books of Prime Entry to Sales, Purchases & General Ledgers and Balancing Off Accounts)',
      'Chapter 5: Trial Balance (Purpose, Preparation of a Trial Balance & Errors Not Affecting the Trial Balance)',
      'Chapter 6: Elementary Financial Statements (Income Statement / Trading and Profit & Loss Account and Statement of Financial Position / Balance Sheet)',
    ],
    'Form 2': [
      'Chapter 1: Recording Cash Transactions (Concept of Cash Transactions, Single-Column, Two-Column & Three-Column Cash Books with Cash/Trade Discounts & Petty Cash Book with Imprest System)',
      'Chapter 2: Bank Records and Personal Records and Reconciliation (Reasons for Discrepancies Between Cash Book and Bank Statement, Unpresented Cheques, Uncredited Deposits, Updating Cash Book & Preparing Bank Reconciliation Statement)',
      'Chapter 3: Correction of Book-Keeping Errors (Errors Disclosed vs Not Disclosed by Trial Balance, Journal Entries for Correction & Suspense Account)',
      'Chapter 4: Concepts in Public Sector Budgeting and Accounting (Terminologies, Roles of Paymaster General, Accounting Officers, CAG, Government Revenue/Expenditure & Government Budget)',
    ],
    'Form 3': [
      'Chapter 1: Adjustments in Final Accounts (Accrued & Prepaid Expenses/Incomes, Bad Debts & Provision for Doubtful Debts, Depreciation: Straight-Line, Reducing Balance & Revaluation)',
      'Chapter 2: Control Accounts (Sales Ledger Control Account / Total Debtors & Purchases Ledger Control Account / Total Creditors)',
      'Chapter 3: Accounting for Single Entry and Incomplete Records (Statement of Affairs, Deriving Missing Sales/Purchases Figures & Final Accounts)',
      'Chapter 4: Accounts of Non-Profit Making Organisations (Receipts and Payments Account, Subscriptions Account, Income and Expenditure Account & Accumulated Fund)',
      'Chapter 5: Manufacturing Accounts (Prime Cost, Factory Overheads, Work-in-Progress & Cost of Production)',
    ],
    'Form 4': [
      'Chapter 1: Partnership Accounts (Partnership Deed, Profit & Loss Appropriation Account, Interest on Capital/Drawings, Admission, Goodwill & Dissolution)',
      'Chapter 2: Consignment and Joint Venture Accounts (Consignor, Consignee, Account Sales, Del Credere Commission & Valuation of Unsold Stock)',
      'Chapter 3: Departmental and Branch Accounts (Apportionment of Expenses, Departmental Income Statement & Branch Stock/Debtors Accounts)',
      'Chapter 4: Elements of Auditing (Concept, Objectives of Auditing, Internal vs External Audit, Audit Evidence & Auditor Report)',
    ],
  },
  'Commerce': {
    'Form 1': [
      'Chapter 1: The Basics of Commerce (Concept of Commerce, Elements: Trade and Aids to Trade & Importance of Commerce in Daily Life)',
      'Chapter 2: Production (Concept of Production, Stages: Primary, Secondary, Tertiary; Factors of Production, Specialisation & Division of Labour)',
      'Chapter 3: Entrepreneurship (Concept of Entrepreneurship, Characteristics of Entrepreneurs, Self-Employment & Innovation)',
      'Chapter 4: Domestic Trade (Retail Trade: Small-Scale & Large-Scale Retailers, Modern Trends in Retailing & Wholesale Trade)',
    ],
    'Form 2': [
      'Chapter 1: Entrepreneurship (Entrepreneurial Motivation, Business Ideas, Market Research & Business Plan Preparation)',
      'Chapter 2: Theories of Demand and Supply (Laws of Demand and Supply, Demand/Supply Schedules & Curves, Equilibrium Price & Price Elasticity of Demand and Supply)',
      'Chapter 3: Warehouse Management (Concept of Warehousing, Types of Warehouses: Private, Public, Bonded & Stock Administration: Stock Levels, Rate of Stock Turnover, Mark-up & Margin)',
      'Chapter 4: Transportation (Concept & Elements of Transport, Modes of Transport, Transport Documents, Containerisation & Factors for Choosing a Mode of Transport)',
    ],
    'Form 3': [
      'Chapter 1: Finance, Money and Banking (Barter System, Qualities & Functions of Money, Central Bank BoT, Commercial Banks, Cheques & Mobile Money)',
      'Chapter 2: Insurance (Pooling of Risks, Insurable vs Non-Insurable Risks, Principles of Insurance, Life & General Insurance Policies)',
      'Chapter 3: Marketing and Consumer Protection (Marketing Functions, Channels of Distribution, Branding, Packaging & Consumer Protection in Tanzania)',
      'Chapter 4: International Trade (Visible & Invisible Trade, Balance of Trade & Balance of Payments, Import/Export Documents: Bill of Lading, Certificate of Origin, Letter of Credit)',
    ],
    'Form 4': [
      'Chapter 1: Business Units (Sole Proprietorship, Partnerships, Joint Stock Companies, Co-operatives & Parastatals)',
      'Chapter 2: Taxation (Principles/Canons of Taxation, Direct vs Indirect Taxes, Progressive/Regressive/Proportional Tax Systems & TRA VAT/Income Tax)',
      'Chapter 3: Business Management and Ethics (Functions of Management: Planning, Organising, Staffing, Directing, Controlling & Business Ethics)',
    ],
  },
  'Agriculture': {
    'Form 1': [
      'Chapter 1: Introduction to Agriculture (Concept, Branches of Agriculture, Relationship with Other Subjects & Importance of Agriculture in Tanzania)',
      'Chapter 2: Crop Production (Concept of Crop Production, Classification of Agricultural Crops & Importance of Crops)',
      'Chapter 3: Cropping Systems and Patterns (Mono-Cropping, Intercropping, Mixed Cropping, Crop Rotation & Shifting Cultivation)',
      'Chapter 4: Introduction to Livestock Production (Concept & Classes of Livestock Kept in Tanzania)',
      'Chapter 5: Livestock Breeds (Breeds of Cattle, Poultry, Goats, Sheep, Pigs & Rabbits)',
      'Chapter 6: Livestock Farming Systems (Intensive, Semi-Intensive & Extensive Livestock Farming Systems)',
      'Chapter 7: Introduction to Mechanisation in Agriculture (Concept, Importance & Limitations of Farm Mechanisation)',
      'Chapter 8: Farm Tools and Equipment (Crop & Livestock Hand Tools, Uses and Maintenance)',
      'Chapter 9: Farm Workshop (Workshop Layout, Basic Workshop Tools & Safety Precautions)',
      'Chapter 10: Farm Machinery (Tillage, Planting, Spraying & Harvesting Machinery and Maintenance)',
      'Chapter 11: Farm Power (Human, Animal, Mechanical, Electrical, Solar, Wind & Biogas Farm Power)',
      'Chapter 12: The Concept of Soil (Meaning of Soil, Constituents of Soil, Weathering & Soil Formation, Soil Profile & Physical Properties of Soil)',
    ],
    'Form 2': [
      'Chapter 1: General Principles and Practices of Crop Production (Planning, Site Selection, Land Preparation, Planting, Nutrient & Soil Water Management, Pest Management, Harvesting, Post-Harvest & Farm Record Keeping)',
      'Chapter 2: Banana Production (Importance, Site Selection, Land Preparation, Planting, Agronomic Practices, Pest Control & Harvesting of Banana)',
      'Chapter 3: Cassava Production (Importance, Selection of Cuttings, Land Preparation, Planting, Weed/Pest Control & Post-Harvest Management of Cassava)',
      'Chapter 4: Sweet Potato Production (Importance, Vine Selection, Ridging/Mounding, Planting, Management & Harvesting of Sweet Potato)',
      'Chapter 5: Round Potato Production (Importance, Seed Tuber Selection, Earthing Up, Late Blight Control & Post-Harvest Management of Round Potato)',
      'Chapter 6: General Principles and Practices of Livestock Production (Planning, Breed Selection, Housing, Feeding, Health, Breeding, Processing & Record Keeping)',
      'Chapter 7: Pig Production (Housing of Pigs, Management of Classes of Pigs, Feed Formulation, Breeding, Disease Control & Marketing)',
      'Chapter 8: Rabbit Production (Selection of Rabbits, Hutch Housing, Feeding, Breeding, Disease Control & Record Keeping)',
    ],
    'Form 3': [
      'Chapter 1: Soil Fertility, Manures, Fertilisers and Soil & Water Conservation (Macro/Micro Nutrients, Fertiliser Calculations, Irrigation & Drainage)',
      'Chapter 2: Agronomy of Cereal, Pulse and Cash Crops (Maize, Paddy/Rice, Common Beans, Coffee, Cotton, Cashew & Horticultural Crops)',
      'Chapter 3: Dairy and Beef Cattle, Poultry and Small Ruminant Production',
      'Chapter 4: Agricultural Economics, Farm Records, Gross Margin Analysis and Marketing',
    ],
    'Form 4': [
      'Chapter 1: Agricultural Mechanisation and Farm Structures (Tractors, Ploughs, Fences, Crush, Dip Tank & Crop Storage Structures)',
      'Chapter 2: Agroforestry and Environmental Conservation in Agriculture (Silvopastoral, Agrosilvicultural Systems & Climate-Smart Agriculture)',
      'Chapter 3: Financial Analysis in Agribusiness (Partial Budget, Complete Budget, Break-Even Analysis & Agricultural Credit)',
    ],
    'Form 5': [
      'Chapter 1: Soil Science and Plant Nutrition (Soil Physics, Soil Chemistry, Ion Exchange, Soil Biology & Organic Matter)',
      'Chapter 2: Agricultural Engineering, Land Surveying, Irrigation Systems and Farm Machinery',
      'Chapter 3: Crop Physiology, Plant Breeding, Biotechnology and Seed Technology',
      'Chapter 4: Crop Protection — Entomology, Plant Pathology, Nematology and Weed Science',
    ],
    'Form 6': [
      'Chapter 1: Animal Nutrition, Physiology, Livestock Breeding and Pasture Management',
      'Chapter 2: Animal Health, Epidemiology, Livestock Parasites and Zoonotic Diseases',
      'Chapter 3: Agricultural Production Economics, Farm Management and Agribusiness Marketing',
      'Chapter 4: Sustainable Agriculture, Agro-Ecology and Aquaculture / Apiculture',
    ],
  },
  'Home Economics': {
    'Form 1': [
      'Chapter 1: Introduction to Home Economics (Concept of Home Economics, Main Areas: Food & Nutrition, Textiles & Garment Making, Home Management & Importance)',
      'Chapter 2: Good Manners and Good Grooming (Personal Hygiene, Care of Different Parts of the Body, Good Grooming & Good Manners)',
      'Chapter 3: Ideal House (Concept of a House, Qualities of an Ideal House, Rooms in a House & Furnishing the Home)',
      'Chapter 4: Sanitation in the House (Drainage Systems, Latrines/Toilets, Waste Disposal & Household Pests Control)',
      'Chapter 5: Kitchen (Types of Kitchens, Kitchen Plans, Hygiene, Safety in the Kitchen & Kitchen Equipment)',
    ],
    'Form 2': [
      'Chapter 1: Introduction to Sewing (Concept of Sewing, Sewing Tools and Equipment & Basic Hand-Sewing Techniques)',
      'Chapter 2: Sewing Machine (Types of Sewing Machines, Parts & Functions, Threading, Care and Common Machine Faults & Remedies)',
      'Chapter 3: Basic Sewing Stitches (Temporary Stitches, Permanent Joining/Neatening Stitches & Decorative Stitches)',
      'Chapter 4: Laundry (Concept of Laundry Work, Laundry Agents, Stain Removal, Care Labels & Laundering Different Fabrics)',
      'Chapter 5: Food and Nutrition (Food Nutrients: Proteins, Carbohydrates, Lipids, Vitamins, Minerals, Water & Fibre; Malnutrition & Nutritional Disorders)',
      'Chapter 6: Cooking Food (Reasons for Cooking Food, Moist Heat & Dry Heat Methods of Cooking)',
      'Chapter 7: Maternal and Child Health (Antenatal Care, Postnatal Care, Breastfeeding, Weaning & Immunisation)',
    ],
    'Form 3': [
      'Chapter 1: Meal Planning and Diets for Various Groups (Pregnant/Lactating Women, Infants, Adolescents, Manual Workers, Elderly & Invalids)',
      'Chapter 2: Baking, Flour Mixtures, Food Preservation and Convenience Foods',
      'Chapter 3: Textile Fibres, Seams, Control of Fullness, Openings, Fastenings and Garment Construction',
    ],
    'Form 4': [
      'Chapter 1: Consumer Education and Family Budgeting (Wise Buying, Food Labelling, Managing Family Income & Entrepreneurship in Catering/Tailoring)',
      'Chapter 2: Interior Decoration, Housing and Sanitation (Ventilation, Lighting, Flower Arrangement & Sustainable Home Management)',
    ],
  },
  'English Language': {
    'Form 1': [
      'Chapter 1: Listening to Simple Texts (Listening for Specific & General Information)',
      'Chapter 2: Giving Directions (Compass Points, Prepositions of Place & Landmarks)',
      'Chapter 3: Using a Dictionary (Alphabetical Order, Guide Words, Pronunciation, Parts of Speech & Meanings)',
      'Chapter 4: Daily Routines (Expressing Personal and Group Routines Using Simple Present Tense)',
      'Chapter 5: Describing Ongoing Activities (Present Continuous Tense)',
      'Chapter 6: Likes and Dislikes (Expressing Preferences Using Like, Dislike, Prefer)',
      'Chapter 7: Family Tree (Describing Family Relationships and Occupations)',
      'Chapter 8: Expressing Opinions and Feelings',
      'Chapter 9: Expressing Past Events (Simple Past & Past Continuous Tense)',
      'Chapter 10: Expressing Future Plans (Going to / Will / Shall)',
      'Chapter 11: Intensive Reading (Reading for Comprehension, Vocabulary & Answering Questions)',
      'Chapter 12: Reading Literary Works (Interpreting Simple Stories and Poems: Characters, Setting & Message)',
      'Chapter 13: Media Information (Analysing Information from Non-Literary Texts & Media)',
      'Chapter 14: Friendly Letters (Format and Writing Personal/Friendly Letters)',
      'Chapter 15: Taking Notes (Listening and Writing Notes from Oral & Written Texts)',
      'Chapter 16: Forms and Diaries (Filling in Official Forms & Keeping a Personal Diary)',
    ],
    'Form 2': [
      'Chapter 1: Listening (Listening for Specific Information & Comprehending Oral Texts)',
      'Chapter 2: Producing Oral Messages (Pronunciation, Stress, Intonation, Dialogues & Debates)',
      'Chapter 3: Vocabulary (Word Formation: Prefixes, Suffixes, Synonyms, Antonyms & Context Clues)',
      'Chapter 4: Grammar and Vocabulary (Tenses, Active & Passive Voice, Conditional Sentences, Prepositions, Conjunctions & Question Tags)',
      'Chapter 5: Reading for Comprehension (Skimming, Scanning, Intensive Reading & Summary Writing)',
      'Chapter 6: Comprehending Oral Messages (Listening to Broadcasts, Announcements & Speeches)',
      'Chapter 7: Responding to Oral and Written Communication (Writing Invitations, Cards, Official Notices, Telephone Messages & Short Compositions)',
    ],
    'Form 3': [
      'Chapter 1: Listening for Information from Different Sources & Participating in Formal Debates/Interviews',
      'Chapter 2: Using Appropriate Language Content and Style in Speaking (Concessions, Cause & Effect, Contrast)',
      'Chapter 3: Advanced Grammar (Direct & Indirect/Reported Speech, Relative Clauses, Phrasal Verbs & Tenses)',
      'Chapter 4: Reading Intensive Comprehension & Summary Writing',
      'Chapter 5: Literary Analysis — Form and Content (Themes, Characterisation, Figures of Speech, Conflict & Relevance in Novels, Plays & Poetry)',
      'Chapter 6: Writing Narrative, Expository, Descriptive and Argumentative Essays & Speeches',
    ],
    'Form 4': [
      'Chapter 1: Appreciation and Critical Analysis of Literary Works (Selected NECTA Plays, Novels and Summons/Selected Poems)',
      'Chapter 2: Writing Curriculum Vitae (CV), Job Application Letters, Official Business Letters, Memos & Reports',
      'Chapter 3: Comprehensive Grammar & Structure Synthesis (Inversion, Correlative Conjunctions, Prepositions, Concord/Subject-Verb Agreement)',
      'Chapter 4: NECTA Paper 1 & Literature Examination Mastery',
    ],
    'Form 5': [
      'Chapter 1: Introduction to Language and Linguistics (Characteristics of Human Language, Competence vs Performance & Functions of Language)',
      'Chapter 2: English Phonetics and Phonology (IPA Vowels, Consonants, Syllable Structure, Word Stress & Intonation)',
      'Chapter 3: English Morphology and Word Formation Processes (Inflectional & Derivational Morphemes, Affixation, Compounding, Blending)',
      'Chapter 4: Syntax and Advanced English Grammar (Phrase Structure, Clauses, Sentence Types, Concord & Stylistics)',
    ],
    'Form 6': [
      'Chapter 1: Sociolinguistics and Status of English in Tanzania (Bilingualism, Code-Switching, Registers, Dialects & Standard English)',
      'Chapter 2: Translation and Interpretation Principles (Methods of Translation, Equivalence & Challenges Between English and Kiswahili)',
      'Chapter 3: Advanced Reading, Note-Taking, Summary Writing and Official Correspondence (Minutes, Reports, Speeches, CV)',
      'Chapter 4: Appreciation of Literature — Literary Theories, Poetry, Drama and Prose Fiction',
    ],
  },
  'Literature in English': {
    'Form 3': [
      'Chapter 1: Introduction to Literature (Meaning, Functions of Literature, Oral vs Written Literature)',
      'Chapter 2: Elements of Literature — Form and Content (Plot, Setting, Characterisation, Style, Point of View, Theme, Message, Philosophy)',
      'Chapter 3: Literary Genres and Figurative Language (Prose/Novels, Drama/Plays, Poetry & Poetic Devices: Simile, Metaphor, Personification, Irony, Satire, Symbolism)',
      'Chapter 4: Analysis of Selected Plays and Novels',
    ],
    'Form 4': [
      'Chapter 1: Appreciation and Analysis of Poetry (Traditional vs Modern/Free Verse Poetry, Persona, Tone, Mood & Poetic Diction)',
      'Chapter 2: Comparative Analysis of Selected NECTA Plays (The Lion and the Jewel, The Trials of Brother Jero, Dilemma of a Ghost, The Government Inspector)',
      'Chapter 3: Comparative Analysis of Selected NECTA Novels (A Walk in the Night, Houseboy, The Old Man and the Medal, The Concubine)',
      'Chapter 4: Answering 15-Mark NECTA Literature Essay Questions',
    ],
    'Form 5': [
      'Chapter 1: Concepts and Theories of Literature (Mimetic, Pragmatic, Expressive, Marxist, Feminist & Post-Colonial Literary Theories)',
      'Chapter 2: Oral Literature in Africa (Genres, Performance, Aesthetic Features & Relevance in Contemporary Society)',
      'Chapter 3: Poetic Appreciation and Critical Analysis of Selected Advanced Level Poems',
    ],
    'Form 6': [
      'Chapter 1: Critical Analysis of Selected Advanced Level Plays (Tragedy, Comedy, Tragicomedy & Dramatic Techniques)',
      'Chapter 2: Critical Analysis of Selected Advanced Level Novels and Short Stories',
      'Chapter 3: Comparative Literary Essays on Form and Content',
    ],
  },
  'Kiswahili': {
    'Form 1': [
      'Sura ya Kwanza: Lugha na Mawasiliano (Dhana ya Mawasiliano, Vipengele vya Mawasiliano, Dhana ya Lugha na Herufi na Matamshi ya Kiswahili)',
      'Sura ya Pili: Aina za Maneno (Nomino N, Kiwakilishi W, Kivumishi V, Kitenzi T, Kielezi E, Kiunganishi U, Kihusishi H, Kihisishi Hs na Matumizi ya Kamusi)',
      'Sura ya Tatu: Fasihi kwa Ujumla (Maana ya Sanaa na Fasihi, Dhima za Fasihi, Aina za Fasihi: Fasihi Simulizi na Fasihi Andishi)',
      'Sura ya Nne: Simulizi za Kifasihi (Tanzu za Fasihi Simulizi: Hadithi, Ushairi, Semi, Maigizo na Uhakiki wa Kazi za Fasihi Simulizi)',
      'Sura ya Tano: Uandishi wa Insha na Barua za Kirafiki (Insha za Wasifu za Kisanaa na Zisizo za Kisanaa, Muundo wa Barua ya Kirafiki na Anwani za Bahasha)',
      'Sura ya Sita: Ufahamu (Ufahamu wa Kusikiliza, Ufahamu wa Kusoma na Kufupisha Habari)',
    ],
    'Form 2': [
      'Sura ya Kwanza: Uundaji wa Maneno (Uambishaji: Viambishi Awali na Tamati, Mzizi wa Neno, Mnyumbuliko/Kauli za Vitenzi na Uradidi)',
      'Sura ya Pili: Matumizi ya Lugha katika Miktadha Mbalimbali (Rejesta za Mahakamani, Hospitalini, Sokoni, Hotelini; Misimu na Lugha ya Kimazungumzo)',
      'Sura ya Tatu: Uhakiki wa Kazi za Fasihi Simulizi (Vipengele vya Fani na Maudhui katika Tanzu za Fasihi Simulizi)',
      'Sura ya Nne: Uhifadhi wa Kazi za Fasihi Simulizi (Njia za Kuhifadhi: Kichwani, Maandishi, Vinasa Sauti na Kanda za Video; Umuhimu na Changamoto)',
      'Sura ya Tano: Utungaji wa Barua Rasmi, Simu na Kadi za Mialiko (Muundo wa Barua ya Kikazi/Rasmi, Uandishi wa Simu za Maandishi na Kadi za Mwaliko)',
      'Sura ya Sita: Ufahamu na Ufupisho (Kusoma kwa Ufahamu na Hatua za Kuandika Ufupisho)',
    ],
    'Form 3': [
      'Sura ya Kwanza: Ngeli za Nomino na Upatanisho wa Kisarufi (Ngeli ya A-WA, U-I, LI-YA, KI-VI, I-ZI, U-ZI, U-YA, KU na PA-MU-KU)',
      'Sura ya Pili: Mjengo wa Tungo na Uchambuzi wa Sentensi (Tungo Neno, Kirai, Kishazi na Sentensi: Sahili, Ambatano na Changamano; Uchanganuzi kwa Njia ya Matawi na Visanduku)',
      'Sura ya Tatu: Historia na Maendeleo ya Kiswahili (Asili ya Kiswahili: Kibantu, Ukuaji na Kuenea Wakati wa Waarabu na Wakoloni wa Kijerumani na Kiingereza)',
      'Sura ya Nne: Uhakiki wa Kazi za Fasihi Andishi (Fani na Maudhui katika Riwaya, Tamthiliya na Ushairi)',
      'Sura ya Tano: Uandishi wa Matangazo, Kumbukumbu za Mikutano na Insha za Hoja',
    ],
    'Form 4': [
      'Sura ya Kwanza: Kuenea na Kukua kwa Kiswahili Baada ya Uhuru (Taasisi za Ukuzaji wa Kiswahili: BAKITA, TATAKI, TAKILUKI, UKUTA na Kiswahili Kimataifa)',
      'Sura ya Pili: Ufahamu, Ufupisho na Utungaji wa Risala, Hotuba na Maombi ya Kazi (CV)',
      'Sura ya Tatu: Uhakiki wa Riwaya Teule, Tamthiliya Teule na Diwani za Mashairi (NECTA Kidato cha Nne)',
      'Sura ya Nne: Majaribio na Marudio ya Mtihani wa Taifa (NECTA CSEE Kiswahili)',
    ],
    'Form 5': [
      'Sura ya Kwanza: Matumizi ya Sarufi na Utumizi wa Lugha (Fonetiki na Fonolojia ya Kiswahili, Mofolojia, Sintaksia na Semantiki)',
      'Sura ya Pili: Chimbuko, Ukuaji na Kuenea kwa Lugha ya Kiswahili',
      'Sura ya Tatu: Maendeleo ya Fasihi Simulizi na Fasihi Andishi ya Kiswahili (Nadharia za Uhakiki wa Fasihi)',
      'Sura ya Nne: Uandishi wa Insha, Kumbukumbu za Mikutano, Ripoti, Hotuba na Ufahamu',
    ],
    'Form 6': [
      'Sura ya Kwanza: Ukuzaji na Uenezaji wa Kiswahili Kitaifa na Kimataifa',
      'Sura ya Pili: Tafsiri na Ukalimani (Dhana, Aina, Mbinu, Hatua na Changamoto za Tafsiri na Ukalimani)',
      'Sura ya Tatu: Uhakiki wa Utenzi, Diwani za Mashairi, Riwaya na Tamthiliya Teule (Karatasi ya Pili)',
      'Sura ya Nne: Utungaji wa Kazi za Kifasihi (Mashairi ya Kimapokeo na Kisasa, Hadithi na Tamthiliya)',
    ],
  },
  'Academic Communication': {
    'Form 5': [
      'Chapter 1: Nature and Process of Human Communication (Elements, Verbal & Non-Verbal Communication, Barriers & Effective Communication)',
      'Chapter 2: Study Skills, Listening and Note-Taking Strategies in Academic Contexts',
      'Chapter 3: Reading Skills, Information Literacy and Referencing Styles (APA, MLA & Plagiarism Prevention)',
      'Chapter 4: Academic Writing — Paragraphs, Essays, Technical Reports and Research Proposals',
    ],
    'Form 6': [
      'Chapter 1: Oral Presentation Skills, Public Speaking, Seminars and Interviews',
      'Chapter 2: Official and Business Correspondence (Letters, Memos, Minutes, CV & Digital Communication)',
      'Chapter 3: Critical Thinking, Argumentation and Analytical Writing',
      'Chapter 4: Phonology, Stress, Intonation and Register in Professional Communication',
    ],
  },
  'Hisabati (Mathematics)': {
    'Standard 3': ['1.0 Namba Nzima (Kusoma na Kuandika hadi 10,000)', '2.0 Matendo katika Namba (Kujumlisha na Kutoa)', '3.0 Sehemu, Fedha ya Tanzania na Wakati', '4.0 Maumbo Bapa na Vipimo vya Urefu na Uzito'],
    'Standard 4': ['1.0 Namba Nzima na Namba za Kirumi', '2.0 Kujumlisha, Kutoa, Kuzidisha na Kugawanya', '3.0 Sehemu, Fedha, Wakati na Vipimo', '4.0 Maumbo, Mzingo na Takwimu za Msingi'],
    'Standard 5': ['1.0 Namba Nzima hadi Milioni Moja, Vigawe na Vigawanyo (KKS na KKT)', '2.0 Sehemu na Desimali', '3.0 Jometria (Pembe, Pembetatu, Mstatili, Mraba na Eneo)', '4.0 Aljebra ya Msingi, Fedha na Takwimu'],
    'Standard 6': ['1.0 Namba Nzima hadi Milioni Kumi, Sehemu, Desimali na Asilimia', '2.0 Uwiano, Faida na Hasara, na Hesabu za Biashara', '3.0 Jometria ya Majira ya Nukta, Maumbo ya Mche na Mzingo/Eneo la Duara', '4.0 Aljebra na Majedwali ya Takwimu/Chati za Duara'],
    'Standard 7': ['1.0 Namba Nzima hadi Bilioni Moja, Namba Hasi na Chanya (Integers), Kipeuo cha Pili', '2.0 Sehemu, Desimali, Asilimia, Faida, Hasara na Riba Rahisi (Simple Interest)', '3.0 Mwendokasi, Umbali na Wakati (Speed, Distance & Time)', '4.0 Jometria, Theorem ya Pythagoras, Eneo la Uso na Ujazo wa Maumbo ya 3D, Aljebra na Takwimu'],
  },
  'Sayansi na Teknolojia': {
    'Standard 5': ['1.0 Viumbe Hai (Mimea na Wanyama, Usanisinuru na Uzazi)', '2.0 Nishati (Mwanga, Sauti, Joto na Umeme)', '3.0 Maada na Hali Zake, Maji na Mazingira', '4.0 Afya, Lishe, Huduma ya Kwanza na TEHAMA ya Msingi'],
    'Standard 6': ['1.0 Mifumo ya Mwili wa Binadamu (Mzunguko wa Damu, Upumuaji na Uzazi)', '2.0 Nishati Mbadala, Mashine Rahisi na Kazi', '3.0 Hewa, Gesi ya Oksijeni na Kabonidayoksaidi, na Udongo', '4.0 Usalama Mtandaoni, Programu Jedwali (Spreadsheet) na Afya ya Jamii'],
    'Standard 7': ['1.0 Mfumo wa Fahamu, Milango ya Fahamu na Utoaji Taka Mwilini (Excretion)', '2.0 Umeme na Sumaku, Mawimbi, Nyuzi za Optiki na Mashine Tata', '3.0 Mabadiliko ya Kikemikali, Kutu na Uzimaji Moto', '4.0 Antena, Mtandao wa Intaneti, Afya na VVU/UKIMWI'],
  },
  'Advanced Mathematics': {
    'Form 5': [
      'Chapter 1: Calculating Devices (Scientific Calculator Operations, Statistical & Matrix Modes)',
      'Chapter 2: Hyperbolic Functions (Definitions of sinh x, cosh x, tanh x, Identities, Inverse Hyperbolic Functions & Equations)',
      'Chapter 3: Linear Programming (Formulation of LPP, Graphical Method, Transportation Problems & Simplex Method)',
      'Chapter 4: Statistics (Grouped Data, Quartiles, Percentiles, Assumed Mean, Variance & Standard Deviation)',
      'Chapter 5: Sets (Set Laws, Algebraic Simplification of Sets, Symmetric Difference & Venn Diagrams)',
      'Chapter 6: Logic (Propositions, Truth Tables, Logical Equivalence, Laws of Algebra of Propositions, Validity of Arguments & Electrical Switching Networks)',
      'Chapter 7: Coordinate Geometry I (Distance from a Point to a Line, Angle Between Two Lines, Locus, Equations of a Circle, Orthogonal Circles & Tangents)',
      'Chapter 8: Functions (Polynomial, Rational, Exponential & Logarithmic Functions, Domain, Range, Asymptotes & Curve Sketching)',
      'Chapter 9: Algebra (Sequences & Series, Mathematical Induction, Binomial Theorem, Partial Fractions, Roots of Polynomial Equations & Determinants)',
      'Chapter 10: Trigonometry (Compound, Double & Half-Angle Formulae, Factor Formulae, t-Formulae, R-Formulae, Inverse Trig Functions & General Solutions)',
      'Chapter 11: Differentiation (First Principles, Chain/Product/Quotient Rules, Implicit & Parametric Differentiation, Maclaurin & Taylor Series, Partial Derivatives & Applications)',
      'Chapter 12: Integration (Integration by Substitution, By Parts, Partial Fractions, Trigonometric Integrals, Area Under a Curve & Volume of Revolution)',
    ],
    'Form 6': [
      'Chapter 1: Coordinate Geometry II (Conic Sections: Parabola, Ellipse & Hyperbola; Tangents, Normals, Eccentricity & Polar Coordinates)',
      'Chapter 2: Vectors (Vectors in 3D Space, Dot/Scalar Product, Cross/Vector Product, Area of Triangle/Parallelogram, Vector Equations of Lines & Planes and Vector Calculus)',
      'Chapter 3: Complex Numbers (Argand Diagram, Modulus-Argument/Polar Form, Euler Form, De Moivre Theorem, nth Roots of Unity & Loci in the Complex Plane)',
      'Chapter 4:Probability (Permutations & Combinations, Conditional Probability, Bayes Theorem, Discrete & Continuous Random Variables, Binomial, Poisson & Normal Distributions)',
      'Chapter 5: Numerical Methods (Errors, Iterative Methods, Newton-Raphson Formula, Secant Method, Trapezoidal Rule & Simpson Rule)',
      'Chapter 6: Differential Equations (First-Order Separable, Homogeneous, Exact & Linear ODEs; Second-Order Linear ODEs with Constant Coefficients & Real-World Modelling)',
    ],
  },
  'Basic Applied Mathematics (BAM)': {
    'Form 5': [
      'Chapter 1: Calculating Devices',
      'Chapter 2: Functions (Linear, Quadratic, Polynomial & Rational Functions, Domain and Range)',
      'Chapter 3: Algebra (Simultaneous Equations, Arithmetic & Geometric Progressions, Ratio & Variations)',
      'Chapter 4: Differentiation (Rules of Differentiation, Marginal Cost/Revenue & Turning Points)',
      'Chapter 5: Integration (Indefinite & Definite Integrals and Area Under a Curve)',
      'Chapter 6: Statistics (Frequency Distributions, Histograms, Ogive, Mean, Median, Mode, Variance & Standard Deviation)',
    ],
    'Form 6': [
      'Chapter 1: Probability (Permutations, Combinations, Mutually Exclusive & Independent Events)',
      'Chapter 2: Trigonometry (Trigonometric Ratios, Sine & Cosine Rules, Compound Angles & Graphs)',
      'Chapter 3: Exponential and Logarithmic Functions (Laws, Graphs, Growth & Decay Models)',
      'Chapter 4: Matrices (Operations, 3×3 Determinant, Inverse Matrix & Solving Simultaneous Equations by Cramer Rule)',
      'Chapter 5: Linear Programming (Formulating Constraints, Graphical Feasible Region & Optimal Value)',
    ],
  },
  'Economics': {
    'Form 5': [
      'Chapter 1: Subject Matter of Economics (Scarcity, Choice, Opportunity Cost, Production Possibility Frontier & Economic Systems)',
      'Chapter 2: Theory of Production (Factors of Production, Law of Diminishing Returns, Returns to Scale & Economies of Scale)',
      'Chapter 3: Theory of Demand and Supply (Demand & Supply Laws, Equilibrium Price, Price/Income/Cross Elasticity)',
      'Chapter 4: Theory of the Firm and Market Structures (Cost & Revenue Curves, Perfect Competition, Monopoly, Monopolistic Competition & Oligopoly)',
      'Chapter 5: Theory of Money, Banking and Price Indices (Functions of Money, Quantity Theory MV = PT, Price Index Numbers, Inflation & Deflation)',
      'Chapter 6: Population, Labour and Employment (Population Theories: Malthusian vs Optimum, Theories of Wages & Unemployment)',
    ],
    'Form 6': [
      'Chapter 1: National Income Accounting (GDP, GNP, NNP, Circular Flow of Income, Consumption, Investment, Multiplier & Accelerator Principles)',
      'Chapter 2: Public Finance and Fiscal Policy (Government Revenue, Taxation Principles, Incidence of Tax, National Budget & Public Debt)',
      'Chapter 3: Financial Institutions and Monetary Policy (Central Bank BoT Instruments, Commercial Banks, Non-Bank Financial Institutions & Capital Markets)',
      'Chapter 4: International Trade and Balance of Payments (Absolute & Comparative Advantage, Terms of Trade, Exchange Rates, BoP & Regional Economic Integration EAC/SADC/AfCFTA)',
      'Chapter 5: Economic Planning, Growth and Development in Tanzania (Indicators of Development, Structure of Tanzanian Economy, Agriculture, Industrialisation & Environmental Economics)',
    ],
  },
  'Accountancy': {
    'Form 5': [
      'Chapter 1: Theoretical Framework of Accounting (Accounting Concepts, Conventions, IFRS/IAS Standards & Double Entry Review)',
      'Chapter 2: Correction of Errors, Suspense Accounts and Control Accounts',
      'Chapter 3: Accounting for Depreciation, Bad Debts and Provisions (IAS 16 Property, Plant and Equipment)',
      'Chapter 4: Single Entry, Incomplete Records and Non-Profit Making Organisations',
      'Chapter 5: Partnership Accounts (Admission, Retirement, Dissolution & Piecemeal Realisation)',
    ],
    'Form 6': [
      'Chapter 1: Company Accounts (Issue of Shares and Debentures, Redemption & Published Financial Statements IAS 1)',
      'Chapter 2: Statement of Cash Flows (IAS 7 Operating, Investing & Financing Cash Flows) and Financial Ratio Analysis',
      'Chapter 3: Branch, Departmental, Consignment and Joint Venture Accounts',
      'Chapter 4: Cost and Management Accounting (Stock Valuation FIFO/LIFO/AVCO, Marginal vs Absorption Costing, Break-Even & Budgeting)',
      'Chapter 5: Auditing and Payroll Accounting in Tanzania',
    ],
  },
  'General Studies': {
    'Form 5': [
      'Chapter 1: Philosophy and Religion (Concept of Philosophy, Branches of Philosophy, African Philosophy & Role of Religion in Society)',
      'Chapter 2: Contemporary Cross-Cutting Issues in Tanzania (Gender, HIV/AIDS, Environmental Conservation, Drug Abuse & Corruption)',
      'Chapter 3: Science and Technology in Development (Role of Science & Technology, Appropriate Technology & Cyber Ethics)',
    ],
    'Form 6': [
      'Chapter 1: Democratic Process and Governance (Pillars of Democracy, Rule of Law, Human Rights & Good Governance in Tanzania)',
      'Chapter 2: International Affairs and Cooperation (Foreign Policy of Tanzania, Diplomacy, EAC, SADC, AU, Commonwealth & UN)',
      'Chapter 3: Life Skills, Moral Values and Entrepreneurship',
    ],
  },
  'Maarifa ya Jamii': {
    'Standard 5': ['Sura ya 1: Mazingira Yetu na Utunzaji Wake', 'Sura ya 2: Kutunza Kumbukumbu za Matukio ya Kihistoria', 'Sura ya 3: Hali ya Hewa na Majanga ya Asili', 'Sura ya 4: Utamaduni, Mashujaa Wetu na Uhusiano na Mataifa Mengine', 'Sura ya 5: Jua, Mfumo wa Jua naKusoma Ramani', 'Sura ya 6: Shughuli za Uzalishaji Mali na Ujasiriamali'],
    'Standard 6': ['Sura ya 1: Majanga ya Asili na Utunzaji wa Mazingira', 'Sura ya 2: Ukombozi wa Bara la Afrika na Mashujaa wa Afrika', 'Sura ya 3: Tabianchi ya Tanzania na Mabadiliko ya Tabianchi', 'Sura ya 4: Kusoma Ramani, Latitudo na Longitudo', 'Sura ya 5: Rasilimali za Tanzania, Uzalishaji Mali na Ujasiriamali'],
    'Standard 7': ['Sura ya 1: Mazingira na Majanga ya Asili (Tetemeko la Ardhi na Mlipuko wa Volkano)', 'Sura ya 2: Historia ya Ukombozi na Uhusiano wa Tanzania na Jumuiya za Kimataifa', 'Sura ya 3: Mfumo wa Jua, Kupatwa kwa Jua na Mwezi na Majira ya Mwaka', 'Sura ya 4: Kusoma Ramani, Idadi ya Watu na Makazi', 'Sura ya 5: Uchumi, Biashara na Ujasiriamali'],
  },
  'Uraia na Maadili': {
    'Standard 5': ['Sura ya 1: Kupenda Nchi Yetu na Alama za Taifa', 'Sura ya 2: kujithamini, Kuheshimu Jamii na Kujenga Uhusiano Mwema', 'Sura ya 3: Uwajibikaji, Uadilifu na Haki za Binadamu', 'Sura ya 4: Demokrasia, Utawala Bora na Ushirikiano wa Kimataifa'],
    'Standard 6': ['Sura ya 1: Kuheshimu Jamii, Tunu za Taifa na Utamaduni', 'Sura ya 2: Uwajibikaji katika Familia na Shule', 'Sura ya 3: Demokrasia, Haki za Binadamu na Kupinga Rushwa', 'Sura ya 4: Uhusiano wa Tanzania na Mataifa Mengine (EAC, SADC, AU, UN)'],
    'Standard 7': ['Sura ya 1: Kudumisha Amani, Utu na Haki za Binadamu', 'Sura ya 2: Uadilifu, Kupinga Rushwa na Kutunza Rasilimali za Umma', 'Sura ya 3: Mhimili wa Serikali, Bunge na Mahakama nchini Tanzania', 'Sura ya 4: Diplomasia na Ushirikiano wa Kimataifa'],
  },
};

export const OFFICIAL_ATTACHED_TIE_BOOKS: PaperRecord[] = [
  { id: 'tie-drive-book-1', title: 'MAYOMBYA--Form V', form: 'Form 5', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1JQ_4wOjpYW0hrjgtOzzIjeOMVtBc_V2a/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-2', title: 'TIE ENGLISH LANGUAGE 1 New', form: 'Form 5', subject: 'English Language', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1nhF1VaUgBALmoGA2QmDQ4rnc6a-DA-qi/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-3', title: 'Physical Chemistry For Advanced', form: 'Form 5', subject: 'Chemistry', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1muTE75iWOCcgIGg3lhRd3BG_u09_Yfa3/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-4', title: 'FASIHI YA KISWAHILI F5 NEW', form: 'Form 5', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1IlM9kduH4tifZ_-Wr-qgqz_QIxfU2fXD/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-5', title: 'HISTORIA YA TANZANIA NA MAADILI', form: 'Form 5', subject: 'Historia ya Tanzania na Maadili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1sMjLH2WaFYIx5k2v1CPiRn-slRiml5mE/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-6', title: 'ARABIC FORM FIVE (TIE)', form: 'Form 5', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1xGEafcyO9UNVR8mNkCPWF7j3smYfB36y/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-7', title: 'BUSINESS STUDIES-FORM 5', form: 'Form 5', subject: 'Business Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1bi8wbvqNkrxIsamZ73ThGWcXpOO0NKgX/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-8', title: 'LITERATURE BOOK 5', form: 'Form 5', subject: 'Literature in English', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1_VWunaXX_q8kZBtf8yohWTc8XlGsi0av/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-9', title: 'ACADEMIC F5 BOOK', form: 'Form 5', subject: 'Academic Communication', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1iZBaoHHBOuCrcFL9YV27CT8BsaRAJfEc/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-10', title: 'History For Advanced Level', form: 'Form 5', subject: 'History', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1f7Iiu2Bi8j_GokwMilFIbU_sNsUfw3lY/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-11', title: 'BIOLOGY FV 2024 BOOK', form: 'Form 5', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1pBEljwalOKhMs5OZw2M7XHuIVa7f1CmD/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-12', title: 'Agriculture form five Textbook new Syllabus', form: 'Form 5', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/12JbUMEQZP0IvJPgspuBr0KUPmEEAD_E9/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-13', title: 'Academic Communication Form 5', form: 'Form 5', subject: 'Academic Communication', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1lq4pfhROClc0JfZAiTxW8of-djpiek-F/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-14', title: 'FORM FIVE STUDENTS BOOK', form: 'Form 5', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/14KgcGHmexjfdFKs0uglcAGf144RMuOJw/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-15', title: 'Physics f5 teachers guide new', form: 'Form 5', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1CWDHxGa2G8eEYM5S6kqSetg9Wzj44tg-/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-16', title: 'Mathematics Teachers Guide Form five', form: 'Form 5', subject: 'Advanced Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1cN5csh-1HMbDQx5OlgrapcDLWqMMZoff/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-17', title: 'Kiswahili Kidato cha Tano New', form: 'Form 5', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1NHVeQiPLmIjXHjjGHDvREfE1cC3YKHZ4/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-18', title: 'Mathematics for Advanced Form Five New', form: 'Form 5', subject: 'Advanced Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1_XrDje4QW89_pGuzPf0vPcksq2MQl1WO/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-19', title: 'Practical Geo 5&6', form: 'Form 5', subject: 'Geography', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/19uEJY5wc0LOKbN9ieDplQRqfFtyud23I/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-20', title: 'Physical Geo 5&6 New', form: 'Form 5', subject: 'Geography', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1rEWgY_lR73AcorECYOayox1LkxWWx3nO/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-21', title: 'General And Inorganic Chemistry', form: 'Form 5', subject: 'Chemistry', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1J9GWx9whDnW7TfnmCxULMCwzLDt_9A8B/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-22', title: 'F5 & F6 Organic Chemistry NEW SYLLABUS', form: 'Form 6', subject: 'Chemistry', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1VLw49KTcOw6NuVHUs7MgTsicEqQU19gC/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-23', title: 'MICROECONOMICS 5', form: 'Form 5', subject: 'Economics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1E1cU9iP_X_T-aadgH0lAhLHMObp1xV1S/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-24', title: 'F6 LITERATURE TIE', form: 'Form 6', subject: 'Literature in English', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1zImb5ZPj1FTugnCd0_3vS3Puyorjmw89/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-25', title: 'MAYOMBYA--Form VI', form: 'Form 6', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/16x42xdN3hIerBiBpp1qEDcT-F12QJ0Xv/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-26', title: 'Mathematics-MAYOMBYA', form: 'Form 6', subject: 'Advanced Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Ucak6AkXUl8A5fi5DVrWj67l0ijWU9G1/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-27', title: 'Historia ya Tanzania Na Maadili kidato cha sita', form: 'Form 6', subject: 'Historia ya Tanzania na Maadili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1XLAEQvEjUXLjiYlozV5JHorL8DNjFQbf/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-28', title: 'Basic Applied Mathematics', form: 'Form 6', subject: 'Basic Applied Mathematics (BAM)', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1DvghyGIdOfZ91YuSQWP_gawWTBglPghj/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-29', title: 'Advanced mathematics F6 New syllabus', form: 'Form 6', subject: 'Advanced Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1KDd_iQidz_dGbnUyhS-e9w2aCvNqmAq4/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-30', title: 'Download PDF TIE Books Form Six - All Subjects (2)', form: 'Form 6', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1NNOH2xCbEcibkpx-wEd04N4iKknQ9kWN/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-31', title: 'Download PDF TIE Books Form Six - All Subjects (1)', form: 'Form 6', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1hSg-BpTu8SrxHkUaBbgYNY1KD84vI04f/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-32', title: 'Download PDF TIE Books Form Six - All Subjects', form: 'Form 6', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1_FW_CsLWwjkG5xU4wPDUwJxWyitTqdp4/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-33', title: 'MACROECONOMICS TIE (NEW SYLLABUS)', form: 'Form 6', subject: 'Economics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1LzuAj1XYYHp_KxmMJwGCyNj_a3LTXTwz/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-34', title: 'F6 PHYSICS TIE', form: 'Form 6', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1vW40BswXdTvYJVOExmvaDjXTje4jI56a/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-35', title: 'F6 LITERATURE TIE (2)', form: 'Form 6', subject: 'Literature in English', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/167LZhH4zLEBF80nn_9uErC7X8n7REvUA/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-36', title: 'COMPUTER SCIENCE F6', form: 'Form 6', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Rnkyb0AEd3kSX-ADJ-W9YmaVDEcXAKU6/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-37', title: 'F6 FASIHI YA KISWAHILI TIE', form: 'Form 6', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1n1Oe4FIkYFBltmy7jNPQALqSrCTnzL59/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-38', title: 'F6 BUSINESS STUDIES TIE', form: 'Form 6', subject: 'Business Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1IVOU3meD1WtFN5iQ-IgPR5QIkr99ek4x/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-39', title: 'F6 BIOLOGY TIE', form: 'Form 6', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1ZDcrrHBngTEP1TGqhcqeDMlXbZ1pUQGh/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-40', title: 'F6 AGRICULTURE NEW TIE', form: 'Form 6', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/10vV-WsYAF2HLplluPd4QgcO_V9D0XRRU/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-41', title: 'KISWAHILI KIDATO CHA SITA, (1)', form: 'Form 6', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1OVDwcMAl5_5sKCysZiCBQpo_Uvk-8jXX/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-42', title: "ACADEMIC COMMUNICATION STUDENT'S BOOK SIX BY MR. MORIS", form: 'Form 6', subject: 'Academic Communication', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1GnucxIDo7Wn7GwBrP_qvY7Q4n2tQvQm_/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-43', title: 'History f6 New syllabus', form: 'Form 6', subject: 'History', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1fZaanbwo1LSlUYibkpknQFUEU25mg5sY/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-44', title: 'FORM SIX PHYSICS NEW SYLLABUS', form: 'Form 6', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1v_sL9VJr7LzmfQTxPidlzZC84DjQ0h9p/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-45', title: 'F6 ACCOUNTANCY TIE', form: 'Form 6', subject: 'Accountancy', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Sst_xjY1H9HX2lJ4mdugDCVMrMCNkKCs/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-46', title: 'TIE Form Six New', form: 'Form 6', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1XKEyhSOGAwfdxkXmVjiCB0YXJUzvAKFd/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-47', title: 'COMPUTER SCIENCE F5', form: 'Form 5', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1u4plOQlNba9PS8ntAGcg7Tjbvld7O7GZ/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-48', title: "Economics Teacher's guide F5", form: 'Form 5', subject: 'Economics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1t_d9rQxPc7m5Dn6R8E3LY9NMPVDhbdga/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-49', title: 'Agriculture Form Six', form: 'Form 6', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1WeiTum4yLHCiXXBn9CWSVnGVHJ4YAXMN/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-50', title: 'FASIHI YA KISWAHILI F5 NEW (2)', form: 'Form 5', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1ck5tzwHGwCE6ukrgW7Zn5D2-YAWLz9dc/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-51', title: "Additional Mathematics for Secondary Schools Student's Book Form Three (TIE 2023)", form: 'Form 3', subject: 'Additional Mathematics', year: '2023', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1o6_JCDYRIwDcMrXLlNtD-YJqNi-BFC1m/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-52', title: 'HTM TIE BOOK 3', form: 'Form 3', subject: 'Historia ya Tanzania na Maadili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Z4FozWO42KRLx6mcfEf9GIhlR3qg6lOC/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-53', title: 'BIOLOGY FORM 3 TIE NEW', form: 'Form 3', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Q94YKhRZphRYjeJIPHPkvD7ZCnh_zGKt/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-54', title: "Mathematics for Secondary Schools Student's Book Form Three (TIE 2025 Revised Edition)", form: 'Form 3', subject: 'Basic Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1euVsPlxlXUYLdkX7ajEk7FjMRDgVNO8j/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-55', title: 'F3 BUSINESS STUDIES BOOK TIE', form: 'Form 3', subject: 'Business Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1uRLc0lLlqogCdCn8EP8CXCTFwxsvYEaU/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-56', title: 'Home Economics Form Two', form: 'Form 2', subject: 'Home Economics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1pKLsxQpklSiPjBnvLWuUFUifIUcyquY1/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-57', title: 'CIVICS F2', form: 'Form 2', subject: 'Civics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1txw6yyIKY3cBScGxWD3vqwmjsI3hklMD/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-58', title: 'Commerce Form Two', form: 'Form 2', subject: 'Commerce', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1zlL-jvfixNKwiJG99hETtm43tWf3fI8D/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-59', title: 'Engineering Science', form: 'Form 2', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1vSzuW4qfvDwAcKS7KyA-Sk_sucv8D7_W/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-60', title: 'EDK', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1R6x4sfCtXgJErbYENW_OdpiykmllWlUw/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-61', title: 'Auto Body Repair', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1hYvT073lbyLy1fTG9aIW4WMRgcosBeP0/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-62', title: 'History F2 New Syllabus', form: 'Form 2', subject: 'History', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1drf8VIg6MfpGZNWVqkl1FlMGpDlGOhUg/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-63', title: 'Civil Draughting', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1iKjv2r-Y2PFxdGp8Dwr6dkDwWzbV4Cw6/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-64', title: 'Carpentry', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Azml-3sf_QJJ0K-2WRrOlv1fL_J8yTQW/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-65', title: 'Auto Electric', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1dbahC6Tbzba1T7FuDGCmhX0SMCRK7gL0/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-66', title: 'Leather Goods and Footwears F2', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/158395mpowtwNNYAjuDUxEcJgJyOFkdgq/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-67', title: 'Arts & Design', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/16fgdixfMmRJnmYfhIq_msCFoH4xiXkqc/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-68', title: "Biology for Secondary Schools — Student's Book Form Two (TIE Comprehensive Question Bank)", form: 'Form 2', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/question_bank_bios_f2_b5ea2aa5.html', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-68-pdf', title: 'BIOLOGY FORM 2 TIE NEW SYLLABUS', form: 'Form 2', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1A0voCf2A83VvMEEaQONtnyQhuNGBXrX2/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-69', title: 'Geography F2', form: 'Form 2', subject: 'Geography', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1IloB7ZSJzZ1BxkzibrC7uCzaiEsRgC0s/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-70', title: 'Acting F2', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1uR6zEY6mryLyA8AIwSbYxIT0dotA3aC5/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-71', title: "Additional Mathematics Form Two (TIE 2023 Student's Book)", form: 'Form 2', subject: 'Additional Mathematics', year: '2023', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1GlOxsR4aMBoQBPxDpqWQ0H4aRwlbn_I1/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-72', title: 'AGRICULTURE F2 TIE NEW SYLLABUS', form: 'Form 2', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1ceZTZ9uuyylvj7mKvyQgZZRmxepfuJE1/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-73', title: 'Agromechanics', form: 'Form 2', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1n58bAzDBkMX6EM3VrAQQj_eHfh3uwpft/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-74', title: 'Animal Health and Production', form: 'Form 2', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1xGo30_Jwid5C1x2SfK_7FXIQ6igs2xz4/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-75', title: 'Book-Keeping Form Two', form: 'Form 2', subject: 'Book-Keeping', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1NFbIZfc0e1UvH8qAipB5Um7B5wGvI4AT/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-76', title: "Chemistry for Secondary Schools — Student's Book Form Two (TIE Comprehensive Question Bank)", form: 'Form 2', subject: 'Chemistry', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/question_bank_chem_f2_4c234b42.html', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-76-pdf', title: 'Chemistry F2 TIE', form: 'Form 2', subject: 'Chemistry', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1h26uIRH4UD5_UrD6CMsfDrQ800OtJlj3/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-77', title: 'Chinese', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1IlPUOuHFWIPj0IT9kSqoRBCcq_91_3Kj/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-78', title: 'computer science 2', form: 'Form 2', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1YWevhyTnKHWCNagX4gpGhI5229L642BC/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-79', title: 'ENGLISH FORM TWO-NEW BOOK', form: 'Form 2', subject: 'English Language', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1rZpMHLdlmDyXPFwyBBr54HWOj_2F5Vvi/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-80', title: 'F II-EDK', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1pU62bBm_qTQt9Qej73-rK9vDHG9x56dJ/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-81', title: 'kiswahili f2', form: 'Form 2', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Uy6QCfS8lORVPB38N4vej6PY_KOgzVah/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-82', title: 'PHYSICS F2 NEW TIE', form: 'Form 2', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1FLxPeajErXbEESO0Evezeh4QL8pQ8LY8/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-83', title: 'HISTORIA YA TANZANIA NA MAADILI KIDATO CHA PILI', form: 'Form 2', subject: 'Historia ya Tanzania na Maadili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1EhCwHX6cmAqtEdF1zvbEG_HuQbBtZdEU/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-84', title: 'Mathematics Form Two (TIE 2024 Revised Edition)', form: 'Form 2', subject: 'Basic Mathematics', year: '2024', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1yhx10LAspqFck81xdn56WcPsnH_JbLzI/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-85', title: 'BUSINESS STUDIES F2', form: 'Form 2', subject: 'Business Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1ttUVMMlXRG1tXVuwECsB6_OgYbgCJeHZ/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-86', title: 'BUSINESS STUDIES FI', form: 'Form 1', subject: 'Business Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1O4Ax5H-gAT5UaHbXCq9ztqROv_zrKPrt/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-87', title: 'F1 Engineering Science', form: 'Form 1', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/13tvaVdsstSbCp5xiQR7x9D8T7KXs3MUZ/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-88', title: 'GRAPHIC DESIGN ONE', form: 'Form 1', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1K6tabjXnyEGphH4Q80A71zUbWjxq-p1r/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-89', title: 'ARABIC FORM ONE (TIE)', form: 'Form 1', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1DEZckilK1GXaTsaUFE2M4RimoMBRtVoo/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-90', title: 'Additional Mathematics Form I', form: 'Form 1', subject: 'Additional Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/104HQOCmb8SaJCWNvMHfn6Ff236DA6sBM/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-91', title: 'Historia ya Tanzania na Maadili kitabu cha Mwanafunzi Kidato cha Kwanza', form: 'Form 1', subject: 'Historia ya Tanzania na Maadili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1UrNR3Dd7lxZR8Tp66O0wM-9NgqrEmmvy/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-92', title: 'Agriculture F1', form: 'Form 1', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1KmcYUqPkXoRjmRwrop4t33gtHS2M6S_t/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-93', title: 'BIOLOGY F1', form: 'Form 1', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1w2j6WfBPDEQIUZvYFJoWF-YcnalgjUAN/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-94', title: 'Book Keeping F1', form: 'Form 1', subject: 'Book-Keeping', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1ZzInPa700Y4_pzgY0tK1oJEXu1VNI08n/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-95', title: 'CHEMISTRY F1', form: 'Form 1', subject: 'Chemistry', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/12w3buklw125scVNcJB6r1TMwZz5x7KfQ/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-96', title: 'CIVICS F1', form: 'Form 1', subject: 'Civics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1_JDCPIYBwKspvLLhBAKJ7Bb7ieiAnQu_/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-97', title: 'Commerce F1', form: 'Form 1', subject: 'Commerce', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1hx_Zt7F3jUarc7FJm65L-aqVu0oG7nWr/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-98', title: 'ENGLISH F1 TIE', form: 'Form 1', subject: 'English Language', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1YuIBXOzleVolDl1T5Gd5CXmDegATFRMh/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-99', title: 'GEOGRAPHY F1', form: 'Form 1', subject: 'Geography', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1dNmaVjNfZ-7HgI3ETJ3szjHa7I1x16PS/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-100', title: 'HISTORY F1 TIE', form: 'Form 1', subject: 'History', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1coCwP76dwQM74WwuVwqOKzEh1eHQ1gPY/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-101', title: 'Home Economics F1', form: 'Form 1', subject: 'Home Economics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/16sPDL6ymcvAKTnL_66j_dATs-4tzuaQm/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-102', title: 'ICT Computer Studies F1', form: 'Form 1', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/15rOmh17imv9zkPsJL7Wo7PxUTDWIBHyx/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-103', title: 'Kiswahili F1', form: 'Form 1', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1LfBotG42DW_gV_L7eBAutmt_ffKWIry_/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-104', title: 'MATHEMATICS F1 (TIE 2023 Revised Book)', form: 'Form 1', subject: 'Basic Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1g0lE1PZAyD1wjQP_EyjzUJow39caujxn/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-105', title: 'PHYSICS F1', form: 'Form 1', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1mUAUNoLsP0c_kAJ89Uhr0Zl5O13mgyVp/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-cs-f5-1', title: "Computer Science for Advanced Secondary Schools — Student's Book Form Five (Chapters 1–4 Question Bank)", form: 'Form 5', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/computer_f5_bank_of_qns_1950aee2.html', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-cs-f5-2', title: "Computer Science for Advanced Secondary Schools — Student's Book Form Five (Chapters 4–5 Question Bank)", form: 'Form 5', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/computer_f5_bank_of_ques_87e7b403.html', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-cs-f5-3', title: "Computer Science for Advanced Secondary Schools — Student's Book Form Five (Chapters 5–8 Question Bank)", form: 'Form 5', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/computer_f5_bank_of_questions_1e5f4d7b.html', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-cs-f5-4', title: "Computer Science for Advanced Secondary Schools — Student's Book Form Five (Chapter 8 & Projects Question Bank)", form: 'Form 5', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/computer_f5_bank_8d71db45.html', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-geo-f2-bank', title: "Geography for Secondary Schools — Student's Book Form Two (TIE Comprehensive Question Bank)", form: 'Form 2', subject: 'Geography', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/question_bank_F2_Geo_3cb6195c.html', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-ics-f1-bank', title: "Information and Computer Studies for Secondary Schools — Student's Book Form One (TIE Comprehensive Question Bank)", form: 'Form 1', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: '/assets/aistudio/question_bank_70b39640.html', answersUrl: null, isBook: true, isSyllabus: false },
];

export const MOHA_BUILTIN_KNOWLEDGE = [
  {
    keywords: [
      'relationship between mathematics and other subjects',
      'relationships between mathematics and other subjects',
      'mathematics and other subjects',
      'concept of mathematics',
      'branches of mathematics',
      'importance of mathematics',
      'meaning of mathematics',
    ],
    title: 'Concept of Mathematics & Relationship with Other Subjects (Basic Mathematics — Form 1 TIE Textbook Chapter 1)',
    content: `**1. Meaning & Branches of Mathematics (TIE Form 1 Student's Textbook — Chapter 1):**\n• **Meaning:** Mathematics is the science of numbers, quantities, shapes, patterns, space, and logical relationships.\n• **Core Branches of Mathematics:**\n  1. **Arithmetic:** Study of numbers and fundamental operations ($+, -, \\times, \\div$), fractions, decimals, percentages, ratios, and financial calculations.\n  2. **Algebra:** Representation of numbers and quantities using letters/symbols to formulate and solve equations, inequalities, and functions.\n  3. **Geometry & Trigonometry:** Study of properties, measurements, angles, congruence, similarity, and relationships of points, lines, 2D plane figures, and 3D solids.\n  4. **Statistics & Probability:** Collection, organization, presentation, analysis, and interpretation of numerical data and prediction of likelihood of events.\n\n**2. Relationship Between Mathematics and Other Subjects:**\nMathematics is the universal language and quantitative foundation for almost every subject in the Tanzanian curriculum:\n• **Physics:** Physics laws and formulas are expressed mathematically—e.g., Newton's Second Law ($F = ma$), Ohm's Law ($V = IR$), kinematics equations ($s = ut + \\frac{1}{2}at^2$), density ($\\rho = \\frac{m}{V}$), and wave speed ($v = f\\lambda$).\n• **Chemistry:** Used in balancing chemical equations, the **Mole Concept & Stoichiometry** ($n = \\frac{m}{M_r}$), **Volumetric Analysis / Titration** ($\\frac{M_A V_A}{M_B V_B} = \\frac{n_A}{n_B}$), pH calculations ($\\text{pH} = -\\log_{10}[\\text{H}^+]$), and percentage composition.\n• **Biology:** Applied in **Genetics** (Mendelian phenotypic/genotypic ratios $3:1$ and $9:3:3:1$, probability in Punnett squares), microscope magnification ($\\text{Magnification} = \\frac{\\text{Image Size}}{\\text{Actual Size}}$), population sampling (quadrats, capture-recapture), and plotting growth curves.\n• **Geography:** Essential in **Map Reading & Scale Conversion** (e.g., $1:50,000$), calculating ground distances and areas, gradient/slope, local time and longitude ($1^\\circ = 4\\text{ minutes}$), and **Geographical Statistics** (climographs, pie charts, histograms).\n• **Book-Keeping, Accountancy, Commerce & Business Studies:** Used in the **Accounting Equation** ($\\text{Assets} = \\text{Capital} + \\text{Liabilities}$), balancing ledgers and Trial Balances, calculating Profit & Loss, Simple and Compound Interest ($I = \\frac{PRT}{100}$), depreciation, and taxation (VAT).\n• **Economics:** Used in Demand and Supply equations, Price Elasticity of Demand ($E_d = \\frac{\\%\\Delta Q_d}{\\%\\Delta P}$), National Income (GDP/GNP) accounting, and cost/revenue optimization.\n• **Computer Science / ICT:** Built on binary number systems (base $2$), Boolean logic gates (AND, OR, NOT), algorithms, and spreadsheet formulas.\n• **Agriculture:** Applied in calculating seed rates, fertilizer application ratios per hectare, plant spacing, livestock feed rations, and farm records.\n• **History, Languages & Fine Arts:** Used in chronological timelines, centuries/dates (BCE/CE), geometric symmetry and proportions in visual arts, and rhythm/time signatures in music.`,
  },
  {
    keywords: [
      'meaning of a relation',
      'types of relations',
      'domain and range of a relation',
      'inverse of a relation',
      'graphs of relations',
      'pictorial representation of a relation',
    ],
    title: 'Relations (Basic Mathematics — Form 3 TIE Textbook Chapter 1)',
    content: `**1. Meaning of a Relation (TIE Basic Mathematics Form 3 Textbook — Chapter 1):**\nA **relation** $R$ between two sets $A$ and $B$ is a rule or correspondence that associates elements of set $A$ with elements of set $B$. Formally, a relation $R$ from set $A$ to set $B$ is a subset of the Cartesian product $A \\times B$:\n$$R = \\{(x, y) : x \\in A,\\; y \\in B\\}$$\n\n**2. Domain and Range of a Relation:**\n• **Domain ($\\text{Dom}(R)$):** The set of all first coordinates ($x$-values / inputs) in the ordered pairs of $R$.\n• **Range ($\\text{Range}(R)$):** The set of all second coordinates ($y$-values / outputs) in the ordered pairs of $R$.\n\n**3. Four Types of Relations:**\n1. **One-to-One Relation:** Each element in the domain is mapped to a unique element in the range.\n2. **Many-to-One Relation:** Two or more elements in the domain map to the same element in the range (e.g., $R = \\{(x, y) : y = x^2\\}$).\n3. **One-to-Many Relation:** A single element in the domain maps to more than one element in the range (e.g., $R = \\{(x, y) : y^2 = x\\}$).\n4. **Many-to-Many Relation:** Multiple elements in the domain map to multiple elements in the range.\n\n**4. Inverse of a Relation ($R^{-1}$):**\nThe inverse of a relation $R$, denoted $R^{-1}$, is obtained by interchanging the coordinates of each ordered pair $(x, y) \\rightarrow (y, x)$:\n$$R^{-1} = \\{(y, x) : (x, y) \\in R\\}$$\n• Note: $\\text{Domain of } R^{-1} = \\text{Range of } R$, and $\\text{Range of } R^{-1} = \\text{Domain of } R$.\n• **Worked Example:** Find the inverse of $R = \\{(x, y) : y = 2x - 4\\}$:\n  - **Step 1:** Interchange $x$ and $y$: $x = 2y - 4$\n  - **Step 2:** Make $y$ the subject: $2y = x + 4 \\implies y = \\frac{x + 4}{2}$\n  - **Answer:** $$R^{-1} = \\left\\{(x, y) : y = \\frac{x + 4}{2}\\right\\}$$`,
  },
  {
    keywords: ['photosynthesis', 'nutrition in plants', 'chlorophyll', 'photolysis', 'calvin cycle'],
    title: 'Photosynthesis (Biology — Form 2 TIE Textbook Chapter 2: Nutrition)',
    content: `**Definition (TIE Biology Form 2 Textbook):** Photosynthesis is the biochemical process by which green plants manufacture organic food (glucose) from carbon dioxide and water in the presence of sunlight energy trapped by chlorophyll.\n\n**Balanced Chemical Equation:**\n$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Sunlight / Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$\n\n**Stages of Photosynthesis:**\n1. **Light Reaction (Photolysis - Grana):** Splits water molecules ($2\\text{H}_2\\text{O} \\rightarrow 4\\text{H}^+ + \\text{O}_2 + 4e^-$) and forms ATP.\n2. **Dark Reaction (Calvin Cycle - Stroma):** Reduces $\\text{CO}_2$ using hydrogen ions and ATP to form glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$).\n\n**Leaf Adaptations (NECTA Points - 02 Marks @):**\n• Broad, flat lamina for large surface area to trap maximum sunlight.\n• Numerous stomata for efficient gaseous exchange ($\\text{CO}_2$ and $\\text{O}_2$).\n• Palisade mesophyll cells densely packed with chloroplasts.\n• Network of xylem (supplies water) and phloem (translocates manufactured food).`,
  },
  {
    keywords: ['ohm', 'resistance', 'current electricity', 'voltage', 'resistor'],
    title: "Ohm's Law & Current Electricity (Physics — Form 2 TIE Textbook Chapter 2)",
    content: `**Ohm's Law (TIE Physics Form 2 Textbook):** States that electric current ($I$) flowing through a metallic conductor is directly proportional to the potential difference ($V$) across its ends, provided temperature and other physical conditions remain constant.\n\n$$V = I \\times R \\quad \\Rightarrow \\quad I = \\frac{V}{R} \\quad \\Rightarrow \\quad R = \\frac{V}{I}$$\n\n**Combination of Resistors:**\n• **Series Arrangement:** $R_{\\text{total}} = R_1 + R_2 + R_3$ (Same current $I$ flows through each).\n• **Parallel Arrangement:** $\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2}$ (Same voltage $V$ across each).\n\n**Factors Affecting Resistance ($R = \\rho \\frac{L}{A}$):**\n1. Length of conductor ($R \\propto L$)\n2. Cross-sectional area ($R \\propto \\frac{1}{A}$)\n3. Temperature of conductor\n4. Nature of material (Resistivity $\\rho$)`,
  },
  {
    keywords: ['archimedes', 'flotation', 'upthrust', 'buoyancy', 'hydrometer'],
    title: "Archimedes' Principle & Law of Flotation (Physics — Form 1 TIE Textbook Chapter 5)",
    content: `**1. Archimedes' Principle (TIE Physics Form 1 Textbook):** States that when a body is partially or totally immersed in a fluid, it experiences an upthrust which is equal to the weight of the fluid displaced.\n$$\\text{Upthrust } (U) = \\text{Real Weight } (W_a) - \\text{Apparent Weight } (W_f)$$\n$$\\text{Relative Density (R.D)} = \\frac{\\text{Weight in Air}}{\\text{Upthrust in Water}} = \\frac{W_a}{W_a - W_w}$$\n\n**2. Law of Flotation:** A floating body displaces its own weight of the fluid in which it floats.\n• Applications: Ships, submarines, hydrometers, hot-air balloons.`,
  },
  {
    keywords: ['mole', 'molarity', 'titration', 'avogadro', 'volumetric'],
    title: 'The Mole Concept & Volumetric Analysis (Chemistry — Form 3 TIE Textbook Chapters 4 & 5)',
    content: `**Key Formulas (TIE Chemistry Form 3 Textbook):**\n1. $\\text{Number of moles }(n) = \\frac{\\text{Mass }(m)}{\\text{Molar Mass }(M_r)} = \\frac{\\text{Number of Particles }(N)}{6.02 \\times 10^{23}}$\n2. At STP, $n = \\frac{\\text{Volume of gas (dm}^3\\text{)}}{22.4\\text{ dm}^3/\\text{mol}}$\n3. $\\text{Molarity }(M) = \\frac{\\text{Concentration in g/dm}^3}{\\text{Molar Mass }(M_r)}$\n4. **Titration Equation:**\n$$\\frac{M_A V_A}{M_B V_B} = \\frac{n_A}{n_B}$$\nWhere $M_A, V_A, n_A$ are molarity, volume, and stoichiometric mole ratio of the acid, and $M_B, V_B, n_B$ are for the base.`,
  },
  {
    keywords: ['quadratic', 'factorize', 'roots', 'discriminant', 'completing the square'],
    title: 'Quadratic Equations & Expressions (Basic Mathematics — Form 2 TIE Textbook Chapters 2 & 3)',
    content: `**General Form (TIE Basic Mathematics Form 2 Textbook):** $ax^2 + bx + c = 0$ where $a \\neq 0$.\n\n**General Quadratic Formula:**\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n**Nature of Roots (Discriminant $\\Delta = b^2 - 4ac$):**\n• If $b^2 - 4ac > 0$: Two distinct real roots.\n• If $b^2 - 4ac = 0$: Two equal (repeated) real roots.\n• If $b^2 - 4ac < 0$: No real roots (complex roots).`,
  },
  {
    keywords: ['rate and variation', 'rates and variations', 'direct variation', 'inverse variation', 'joint variation', 'partial variation', 'varies directly', 'varies inversely', 'constant of proportionality'],
    title: 'Rates and Variations (Basic Mathematics — Form 2 TIE Textbook)',
    content: `**1. Rates (TIE Basic Mathematics Form 2 Textbook):**\nA **rate** is a comparison of two quantities of different kinds measured in different units (e.g., $\\text{Speed} = \\frac{\\text{Distance (km)}}{\\text{Time (h)}}$, $\\text{Rate of Work} = \\frac{\\text{Work Done}}{\\text{Time Taken}}$, Currency Exchange Rates).\n\n**2. Direct Variation ($y \\propto x$):**\nTwo quantities $y$ and $x$ vary directly if their ratio is constant:\n$$y \\propto x \\implies y = kx \\quad \\text{where } k = \\frac{y}{x} \\text{ is the constant of proportionality.}$$\n• For two states $(x_1, y_1)$ and $(x_2, y_2)$: $$\\frac{y_1}{x_1} = \\frac{y_2}{x_2}$$\n• **Graph:** The graph of $y = kx$ is a **straight line passing through the origin $(0,0)$** with gradient $k$.\n\n**3. Inverse Variation ($y \\propto \\frac{1}{x}$):**\nTwo quantities $y$ and $x$ vary inversely if their product is constant:\n$$y \\propto \\frac{1}{x} \\implies y = \\frac{k}{x} \\quad \\text{where } k = xy$$\n• For two states $(x_1, y_1)$ and $(x_2, y_2)$: $$x_1 y_1 = x_2 y_2$$\n• **Graph:** The graph of $y = \\frac{k}{x}$ against $x$ is a **rectangular hyperbola** (curved graph approaching the axes), while $y$ against $\\frac{1}{x}$ is a straight line through the origin.\n\n**4. Joint Variation & Partial Variation:**\n• **Joint Variation:** $y$ varies directly as $x$ and inversely as $z^2$: $$y \\propto \\frac{x}{z^2} \\implies y = \\frac{kx}{z^2}$$\n• **Partial Variation:** $y$ is partly constant and partly varies as $x$: $$y = a + bx$$\n\n**Worked Example (Form 2 TIE Textbook):**\n*Question:* Given that $y$ varies directly as $x$ and inversely as $\\sqrt{z}$, and $y = 12$ when $x = 6$ and $z = 9$. Find the equation connecting $y, x, z$ and find $y$ when $x = 10$ and $z = 25$.\n• **Step 1 (Formulate Equation):** $$y \\propto \\frac{x}{\\sqrt{z}} \\implies y = \\frac{kx}{\\sqrt{z}}$$\n• **Step 2 (Find Constant $k$):** Substitute $y = 12,\\; x = 6,\\; z = 9$:\n$$12 = \\frac{k(6)}{\\sqrt{9}} = \\frac{6k}{3} = 2k \\implies k = 6$$\n• **Step 3 (Connecting Equation & Value of $y$):**\n$$y = \\frac{6x}{\\sqrt{z}} \\implies y = \\frac{6(10)}{\\sqrt{25}} = \\frac{60}{5} = 12$$\n• **Final Answer:** $$\\mathbf{y = \\frac{6x}{\\sqrt{z}}, \\quad y = 12}$$`,
  },
  {
    keywords: ['sequence', 'series', 'arithmetic progression', 'geometric progression', 'compound interest'],
    title: 'Sequences & Series (Basic Mathematics — Form 3 TIE Textbook Chapter 4)',
    content: `**1. Arithmetic Progression (AP) — TIE Basic Mathematics Form 3 Textbook:**\n• $n^{\\text{th}}$ Term: $A_n = A_1 + (n - 1)d$\n• Sum of $n$ terms: $S_n = \\frac{n}{2}[2A_1 + (n - 1)d] = \\frac{n}{2}(A_1 + A_n)$\n\n**2. Geometric Progression (GP):**\n• $n^{\\text{th}}$ Term: $G_n = G_1 r^{n - 1}$\n• Sum of $n$ terms: $S_n = \\frac{G_1(r^n - 1)}{r - 1}$ (for $r > 1$) or $S_n = \\frac{G_1(1 - r^n)}{1 - r}$ (for $r < 1$)\n\n**3. Compound Interest:**\n$$A_n = P\\left(1 + \\frac{R}{100}\\right)^n$$`,
  },
  {
    keywords: ['integration', 'indefinite integral', 'definite integral', 'area under a curve', 'volume of revolution', 'antiderivative'],
    title: 'Chapter 1: Integration (Indefinite & Definite Integrals, Area Under a Curve, Volume of Revolution & Kinematics)',
    content: `**1. Meaning of Integration (TIE Form 4 Additional Mathematics & Form 5–6 BAM / Advanced Mathematics):**\nIntegration is the **reverse process of differentiation** (also called finding the **antiderivative**). If $\\frac{d}{dx}[F(x)] = f(x)$, then:\n$$\\int f(x)\\,dx = F(x) + C$$\nwhere $C$ is the **constant of integration**.\n\n**2. Fundamental Rules of Integration:**\n• **Power Rule:**\n$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$\n• **Constant Rule:** $\\int k\\,dx = kx + C$\n• **Standard Trigonometric & Reciprocal Integrals:**\n$$\\int \\cos x\\,dx = \\sin x + C, \\quad \\int \\sin x\\,dx = -\\cos x + C, \\quad \\int \\frac{1}{x}\\,dx = \\ln|x| + C$$\n\n**3. Definite Integrals & Applications:**\n• **Definite Integral (Fundamental Theorem of Calculus):**\n$$\\int_a^b f(x)\\,dx = \\Big[F(x)\\Big]_a^b = F(b) - F(a)$$\n• **Area Under a Curve $y = f(x)$ from $x = a$ to $x = b$:**\n$$\\text{Area } (A) = \\int_a^b y\\,dx$$\n• **Volume of Solid of Revolution (rotated $360^\\circ$ about the $x$-axis):**\n$$\\text{Volume } (V) = \\pi \\int_a^b y^2\\,dx$$\n• **Kinematics Application:** Velocity $v = \\int a\\,dt$ and Displacement $s = \\int v\\,dt$.\n\n**4. Step-by-Step Worked Examples:**\n• **Example 1 (Indefinite Integral):** Find $\\int (6x^2 - 4x + 5)\\,dx$.\n  - **Step 1:** Apply the power rule term by term:\n    $$\\int 6x^2\\,dx - \\int 4x^1\\,dx + \\int 5\\,dx = \\frac{6x^{2+1}}{3} - \\frac{4x^{1+1}}{2} + 5x + C$$\n  - **Step 2 (Simplify):**\n    $$\\mathbf{2x^3 - 2x^2 + 5x + C}$$\n\n• **Example 2 (Definite Integral):** Evaluate $\\int_1^3 (3x^2 + 2x)\\,dx$.\n  - **Step 1 (Integrate):** $\\Big[x^3 + x^2\\Big]_1^3$\n  - **Step 2 (Substitute Upper & Lower Limits):**\n    $$(3^3 + 3^2) - (1^3 + 1^2) = (27 + 9) - (1 + 1) = 36 - 2 = \\mathbf{34}$$\n\n• **Example 3 (Area Under a Curve):** Find the area enclosed by the curve $y = x^2$, the $x$-axis, and the lines $x = 0$ and $x = 3$.\n  - **Step 1:** $A = \\int_0^3 x^2\\,dx = \\left[\\frac{x^3}{3}\\right]_0^3 = \\frac{27}{3} - 0 = \\mathbf{9\\text{ square units}}$.`,
  },
  {
    keywords: ['differentiation', 'first principles', 'power rule', 'chain rule', 'product rule', 'quotient rule', 'stationary point', 'turning point', 'tangent and normal'],
    title: 'Chapter 6: Differentiation (First Principles, Power/Chain/Product/Quotient Rules, Turning Points, Tangents & Normals)',
    content: `**1. Meaning of Differentiation (TIE Form 3 Additional Mathematics & Form 5–6 BAM / Advanced Mathematics):**\nDifferentiation measures the **instantaneous rate of change** of a function $y = f(x)$ with respect to $x$, which geometrically represents the **gradient of the tangent** to the curve at any point.\n\n**2. Differentiation from First Principles:**\n$$\\frac{dy}{dx} = f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$\n\n**3. Core Rules of Differentiation:**\n• **Power Rule:** If $y = ax^n$, then $\\frac{dy}{dx} = anx^{n-1}$\n• **Chain Rule:** $\\frac{dy}{dx} = \\frac{dy}{du} \\times \\frac{du}{dx}$\n• **Product Rule:** $\\frac{d}{dx}(uv) = u\\frac{dv}{dx} + v\\frac{du}{dx}$\n• **Quotient Rule:** $\\frac{d}{dx}\\left(\\frac{u}{v}\\right) = \\frac{v\\frac{du}{dx} - u\\frac{dv}{dx}}{v^2}$\n• **Trigonometric Derivatives:** $\\frac{d}{dx}(\\sin x) = \\cos x, \\quad \\frac{d}{dx}(\\cos x) = -\\sin x$\n\n**4. Step-by-Step Worked Examples:**\n• **Example 1 (Gradient of a Curve):** Differentiate $y = 4x^3 - 6x^2 + 5x - 9$ and find $\\frac{dy}{dx}$ at $x = 2$.\n  - **Step 1:** $\\frac{dy}{dx} = 12x^2 - 12x + 5$\n  - **Step 2:** At $x = 2$: $\\frac{dy}{dx} = 12(2)^2 - 12(2) + 5 = 48 - 24 + 5 = \\mathbf{29}$.\n\n• **Example 2 (Stationary / Turning Points):** Find the stationary points of $y = x^3 - 3x^2 - 9x + 5$.\n  - **Step 1:** At stationary points, $\\frac{dy}{dx} = 0 \\implies 3x^2 - 6x - 9 = 0$\n  - **Step 2:** Divide by $3$: $x^2 - 2x - 3 = (x - 3)(x + 1) = 0 \\implies \\mathbf{x = 3 \\text{ or } x = -1}$.`,
  },
  {
    keywords: ['newton', 'motion', 'acceleration', 'velocity', 'momentum', 'impulse'],
    title: "Newton's Laws of Motion & Linear Motion (Physics — Form 2 TIE Textbook Chapters 6 & 7)",
    content: `**Equations of Uniformly Accelerated Motion (TIE Physics Form 2 Textbook):**\n1. $v = u + at$\n2. $s = ut + \\frac{1}{2}at^2$\n3. $v^2 = u^2 + 2as$\n\n**Newton's Three Laws of Motion:**\n• **1st Law (Inertia):** A body remains at rest or uniform motion in a straight line unless acted upon by an external resultant force.\n• **2nd Law:** Rate of change of momentum is directly proportional to applied force ($F = ma = \\frac{mv - mu}{t}$).\n• **3rd Law:** To every action there is an equal and opposite reaction.`,
  },
  {
    keywords: ['historia ya tanzania na maadili', 'tunu za taifa', 'maadili ya kitanzania', 'chimbuko la jamii', 'azimio la arusha', 'majimaji', 'muungano'],
    title: 'Historia ya Tanzania na Maadili — Kitabu cha Mwanafunzi (TET/TIE Kidato cha 1 & 2)',
    content: `**Muhtasari wa Kitabu cha Mwanafunzi (Taasisi ya Elimu Tanzania — TET):**\n• **Sura ya 1 (Dhana ya Historia ya Tanzania na Maadili):** Historia ya Tanzania ni elimu inayochambua matukio, mabadiliko na maendeleo ya jamii za Kitanzania tangu kale hadi sasa pamoja na misingi ya maadili (utu, uzalendo, uadilifu, umoja na uwajibikaji).\n• **Sura ya 2 (Chimbuko la Jamii za Kitanzania):** Makundi makuu manne ya lugha na jamii yaliyoanza kuishi Tanzania ni **Wakhoisani** (wawindaji na wakusanyaji wa awali kama Wahadzabe na Wasandawe), **Wakushiti** (Wairaqw, Wagorowa), **Wabantu** (walioleta teknolojia ya kilimo na uhunzi wa chuma), na **Waniloti** (Wamaasai, Waluo, Wadatoga).\n• **Sura ya 3 & 4 (Mifumo ya Kiutawala na Urithi wa Taifa):** Mifumo ya ukoo, rika na utemi (kama Watemi wa Wasukuma, Wanyamwezi na Wahehe) ilijenga mshikamano, haki na maadili ya kazi.\n• **Tunu za Taifa la Tanzania:** Utu na Heshima, Uhuru na Umoja, Amani na Utulivu, Uzalendo, Uadilifu na Kufanya Kazi kwa Bidii.`,
  },
  {
    keywords: ['information and computer studies', 'computer generations', 'computer evolution', 'computer hardware', 'computer handling', 'data and information'],
    title: 'Computer Science / Information and Computer Studies (TIE Form 1 & 2 Student Textbook)',
    content: `**Official TIE Textbook Chapter Breakdown (Information and Computer Studies / Computer Science):**\n• **Chapter 1 & 2 (Concept of ICS, Data and Information):**\n  - **Data:** Raw, unorganised facts and figures (numbers, letters, symbols) that have little meaning on their own.\n  - **Information:** Processed, organised, and structured data that is meaningful and useful for decision-making ($\\text{Data} \\xrightarrow{\\text{Processing}} \\text{Information}$).\n• **Chapter 3 (Computer Evolution & Generations):**\n  1. **1st Generation (1940–1956):** Vacuum tubes (e.g., ENIAC, UNIVAC).\n  2. **2nd Generation (1956–1963):** Transistors.\n  3. **3rd Generation (1964–1971):** Integrated Circuits (ICs).\n  4. **4th Generation (1971–Present):** Microprocessors / VLSI.\n  5. **5th Generation (Present & Beyond):** Artificial Intelligence (AI) & Parallel Processing.\n• **Chapter 4 & 6 (Computer Hardware, Software & Computer Handling):**\n  - **Hardware:** Input devices, Central Processing Unit (ALU, Control Unit, Registers), Main Memory (RAM & ROM), Secondary Storage, Output devices.\n  - **Computer Handling:** Using Uninterruptible Power Supply (UPS), surge protectors, utility programs (antivirus, disk defragmenter, backup), and dust/moisture protection.`,
  },
  {
    keywords: ['business studies', 'sole proprietorship', 'factors of production', 'entrepreneurship', 'warehousing', 'marketing mix'],
    title: 'Business Studies — Official TIE Student Textbook (Form 1 & Form 2)',
    content: `**Official TIE Business Studies Textbook Summary:**\n• **Chapter 1 & 2 (Scope of Business Studies & Production):**\n  - **Business Studies** integrates Commerce, Book-Keeping/Accounting, Economics, Entrepreneurship, and Office Management.\n  - **Four Factors of Production & Their Rewards:**\n    1. **Land** $\\rightarrow$ Reward is **Rent**\n    2. **Labour** $\\rightarrow$ Reward is **Wages / Salaries**\n    3. **Capital** $\\rightarrow$ Reward is **Interest**\n    4. **Entrepreneurship** $\\rightarrow$ Reward is **Profit**\n• **Chapter 3 & 4 (Entrepreneurship & Business Units):**\n  - **Sole Proprietorship:** Owned and managed by one person; easy to form, enjoys all profits, but bears **unlimited liability**.\n  - **Partnership:** 2 to 20 partners governed by a **Partnership Deed**.\n  - **Co-operative Societies (AMCOS & SACCOS):** Democratic control (one member, one vote) and patronage refund.`,
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

export function classifySingleSubjectString(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;
  const lower = s.toLowerCase().replace(/\s+/g, ' ');

  // Primary School Subjects (check first so they are never misclassified or dropped)
  if (lower.includes('uraia na maadili') || lower.includes('civic and moral')) return 'Uraia na Maadili';
  if (lower.includes('sayansi na teknolojia') || lower.includes('science and technology')) return 'Sayansi na Teknolojia';
  if (lower.includes('maarifa ya jamii') || lower.includes('social studies')) return 'Maarifa ya Jamii';
  if (lower.includes('stadi za kazi') || lower.includes('vocational skills')) return 'Stadi za Kazi';
  if (lower.includes('jiografia na mazingira')) return 'Jiografia na Mazingira';
  if (lower.includes('afya na mazingira')) return 'Afya na Mazingira';
  if (lower.includes('michezo na sanaa')) return 'Michezo na Sanaa';
  if (lower.includes('sanaa na michezo')) return 'Sanaa na Michezo';
  if (lower === 'kusoma' || /\bkusoma\b/i.test(lower)) return 'Kusoma';
  if (lower === 'kuandika' || /\bkuandika\b/i.test(lower)) return 'Kuandika';
  if (lower === 'kuhesabu' || /\bkuhesabu\b/i.test(lower)) return 'Kuhesabu';
  if (lower === 'hisabati' || lower === 'hisabati (mathematics)' || lower.includes('hisabati')) return 'Hisabati (Mathematics)';
  if (lower === 'sayansi' || lower === 'sayansi (science)') return 'Sayansi (Science)';

  // Custom / Religious / Technical Subjects
  if (lower === 'edk' || /\bedk\b/i.test(lower) || lower.includes('elimu ya dini ya kiislamu') || lower.includes('islamic knowledge')) {
    return 'Elimu ya Dini ya Kiislamu (EDK)';
  }
  if (lower.includes('bible knowledge') || lower.includes('divinity')) return 'Bible Knowledge';
  if (lower === 'arabic' || lower.includes('arabic')) return 'Arabic';
  if (lower === 'french' || lower.includes('french')) return 'French';
  if (lower === 'chinese' || lower.includes('chinese')) return 'Chinese';
  if (lower === 'fine art' || lower.includes('fine art')) return 'Fine Art';
  if (lower.includes('engineering science')) return 'Engineering Science';

  return null;
}

export function normalizeSubjectName(rawSubject: string, rawTitle = ''): string {
  const s = (rawSubject || '').trim();
  const rawLower = s.toLowerCase().replace(/\s+/g, ' ');
  const titleLower = (rawTitle || '').toLowerCase().replace(/\s+/g, ' ');

  // Self-heal any previously cached record where rawSubject was wrongly set to 'Computer Science'
  // due to the old 'ics ' substring match on titles like 'Physics ', 'Mathematics ', 'Civics ', 'Economics '
  const isMismatchedCachedComputer =
    rawLower === 'computer science' &&
    titleLower.length > 0 &&
    !/\b(computer|ics|ict|information\s+and\s+computer)\b/i.test(titleLower);
  const lower = isMismatchedCachedComputer ? '' : rawLower;

  // Handle sheet rows where title explicitly starts with "History Form ..." while subject column had a copy-paste typo
  if (
    /^history\s+form\s+(five|six|5|6|one|two|three|four|1|2|3|4)\b/i.test(titleLower) &&
    !lower.includes('historia')
  ) {
    return 'History';
  }

  // Primary & Custom/Religious Subject Classification (priority check)
  const primaryOrCustomFromSubject = classifySingleSubjectString(lower ? s : '');
  if (primaryOrCustomFromSubject) return primaryOrCustomFromSubject;
  const primaryOrCustomFromTitle = classifySingleSubjectString(rawTitle);
  if (primaryOrCustomFromTitle && (!lower || lower === 'general' || lower === 'general studies')) {
    return primaryOrCustomFromTitle;
  }

  // 1. Historia ya Tanzania na Maadili
  if (
    lower === 'htm' ||
    lower.includes('historia ya tanzania') ||
    titleLower.includes('historia ya tanzania na maadil')
  ) {
    return 'Historia ya Tanzania na Maadili';
  }

  // 2. Computer Science / Information and Computer Studies (ICS / ICT)
  // Strict word boundaries so 'Physics', 'Mathematics', 'Civics', 'Economics' never match 'ics'
  if (
    lower === 'ict' ||
    lower === 'ics' ||
    lower.includes('computer') ||
    /\b(information and computer|computer science|computer studies|ics|ict)\b/i.test(lower) ||
    /\b(information and computer studies|computer science)\b/i.test(titleLower) ||
    (!lower && /\b(ics|ict|computer science|information and computer)\b/i.test(titleLower)) ||
    /\b(form\s*[1-6]\s+(ics|ict)|^(ics|ict)\s+(tie|form|book|mock|necta|ftna|csee))\b/i.test(titleLower)
  ) {
    return 'Computer Science';
  }

  // 3. Basic Applied Mathematics (BAM)
  if (
    lower === 'bam' ||
    lower.includes('basic applied math') ||
    titleLower.includes('basic applied math') ||
    /\bbam\b/i.test(titleLower)
  ) {
    return 'Basic Applied Mathematics (BAM)';
  }

  // 4. Advanced Mathematics
  if (
    lower.includes('advanced math') ||
    lower.includes('adv math') ||
    titleLower.includes('advanced math') ||
    titleLower.includes('mayombya')
  ) {
    return 'Advanced Mathematics';
  }

  // 5. Additional Mathematics
  if (
    lower.includes('additional math') ||
    lower.includes('aditional math') ||
    titleLower.includes('additional math') ||
    titleLower.includes('aditional math')
  ) {
    return 'Additional Mathematics';
  }

  // 6. Basic Mathematics
  if (
    lower === 'basic mathematics' ||
    lower === 'mathematics' ||
    lower === 'math' ||
    lower === 'maths' ||
    lower.startsWith('basic math') ||
    (!lower && /\b(basic mathematics|mathematics)\b/i.test(titleLower))
  ) {
    return 'Basic Mathematics';
  }

  // 7. Physics (including Physics 1, Physics 2A, Physics (Practical))
  if (lower.startsWith('physics') || (!lower && /\bphysics\b/i.test(titleLower))) {
    return 'Physics';
  }

  // 8. Chemistry (including Chemistry 1, Chemistry 02, Chemistry (Practical), Physical/Organic/Inorganic Chemistry)
  if (
    lower.startsWith('chemistry') ||
    lower.includes('chemistry') ||
    (!lower && /\bchemistry\b/i.test(titleLower))
  ) {
    return 'Chemistry';
  }

  // 9. Biology (including Biology 1, Biology 2A, Biology (Practical))
  if (lower.startsWith('biology') || (!lower && /\bbiology\b/i.test(titleLower))) {
    return 'Biology';
  }

  // 10. Geography (including Physical Geography, Practical Geography)
  if (lower.includes('geography') || (!lower && /\bgeography\b/i.test(titleLower))) {
    return 'Geography';
  }

  // 11. Literature in English
  if (
    lower === 'literature' ||
    lower === 'literature in english' ||
    lower.includes('literature in english') ||
    (!lower && /\bliterature\b/i.test(titleLower))
  ) {
    return 'Literature in English';
  }

  // 12. English Language
  if (
    lower === 'english' ||
    lower === 'english language' ||
    lower.startsWith('english language') ||
    (!lower && /\benglish\b/i.test(titleLower))
  ) {
    return 'English Language';
  }

  // 13. Book-Keeping
  if (
    lower === 'book-keeping' ||
    lower === 'book keeping' ||
    lower === 'bookkeeping' ||
    lower === 'b.keeping' ||
    titleLower.includes('book-keeping') ||
    titleLower.includes('book keeping') ||
    titleLower.includes('bookkeeping') ||
    titleLower.includes('b.keeping')
  ) {
    return 'Book-Keeping';
  }

  // 14. Business Studies
  if (
    lower.includes('business studies') ||
    lower.includes('bussiness studies') ||
    titleLower.includes('bussiness studies') ||
    titleLower.includes('business studies')
  ) {
    return 'Business Studies';
  }

  // 15. Home Economics / Food and Human Nutrition (check before Economics)
  if (
    lower === 'home economics' ||
    lower.includes('home economics') ||
    lower.includes('food and human nutrition') ||
    (!lower && /\b(home economics|food and human nutrition)\b/i.test(titleLower))
  ) {
    return 'Home Economics';
  }

  // 16. Economics (including Microeconomics, Macroeconomics)
  if (
    lower === 'economics' ||
    lower.includes('economics') ||
    (!lower && /\b(economics|macroeconomics|microeconomics)\b/i.test(titleLower))
  ) {
    return 'Economics';
  }

  // 17. Kiswahili / Fasihi ya Kiswahili
  if (
    lower === 'fasihi ya kiswahili' ||
    lower === 'kiswahili' ||
    (!lower && /\bkiswahili\b/i.test(titleLower))
  ) {
    return 'Kiswahili';
  }

  // 18. Civics
  if (lower === 'civics' || lower.startsWith('civics') || (!lower && /\bcivics\b/i.test(titleLower))) {
    return 'Civics';
  }

  // 19. History
  if (lower === 'history' || lower.startsWith('history') || (!lower && /\bhistory\b/i.test(titleLower))) {
    return 'History';
  }

  // 20. Commerce
  if (lower === 'commerce' || lower.startsWith('commerce') || (!lower && /\bcommerce\b/i.test(titleLower))) {
    return 'Commerce';
  }

  // 21. Agriculture
  if (lower.includes('agriculture') || (!lower && /\bagriculture\b/i.test(titleLower))) {
    return 'Agriculture';
  }

  // 22. Accountancy
  if (lower.includes('accountancy') || (!lower && /\baccountancy\b/i.test(titleLower))) {
    return 'Accountancy';
  }

  // 23. Academic Communication
  if (
    lower.includes('academic communication') ||
    (!lower && /\bacademic communication\b/i.test(titleLower))
  ) {
    return 'Academic Communication';
  }

  // 24. General Studies
  if (lower.includes('general studies') || (!lower && /\bgeneral studies\b/i.test(titleLower))) {
    return 'General Studies';
  }

  // 25. Arabic / French / Fine Art / Bible Knowledge
  if (lower === 'arabic' || (!lower && /\barabic\b/i.test(titleLower))) return 'Arabic';
  if (lower === 'french' || (!lower && /\bfrench\b/i.test(titleLower))) return 'French';
  if (lower === 'fine art' || (!lower && /\bfine art\b/i.test(titleLower))) return 'Fine Art';
  if (lower.includes('bible knowledge') || (!lower && /\bbible knowledge\b/i.test(titleLower))) {
    return 'Bible Knowledge';
  }

  return s || 'General';
}

export function matchesSubjectQuery(recordSubject: string, targetSubject: string, recordTitle = ''): boolean {
  const normA = normalizeSubjectName(recordSubject, recordTitle).toLowerCase();
  const normB = normalizeSubjectName(targetSubject).toLowerCase();
  if (normA === normB) return true;
  if (
    (normA === 'hisabati (mathematics)' && normB === 'basic mathematics') ||
    (normB === 'hisabati (mathematics)' && normA === 'basic mathematics')
  ) {
    return true;
  }
  if (normA.includes(normB) || normB.includes(normA)) {
    if (
      normA.includes('additional') !== normB.includes('additional') ||
      normA.includes('advanced') !== normB.includes('advanced') ||
      normA.includes('applied') !== normB.includes('applied') ||
      normA.includes('maadili') !== normB.includes('maadili') ||
      normA.includes('teknolojia') !== normB.includes('teknolojia') ||
      normA.includes('mazingira') !== normB.includes('mazingira') ||
      normA.includes('jamii') !== normB.includes('jamii') ||
      normA.includes('stadi') !== normB.includes('stadi') ||
      normA.includes('home') !== normB.includes('home') ||
      normA.includes('literature') !== normB.includes('literature') ||
      normA.includes('computer') !== normB.includes('computer') ||
      normA.includes('business') !== normB.includes('business') ||
      normA.includes('general') !== normB.includes('general')
    ) {
      return false;
    }
    return true;
  }
  return false;
}

export function matchesFormRange(recordForm: string, targetClass: string): boolean {
  const cleanTarget = normalizeClassName(targetClass);
  const cleanRecord = normalizeClassName(recordForm);
  if (cleanRecord === cleanTarget) return true;

  const rLower = (recordForm || '').toLowerCase();
  const formNumMatch = cleanTarget.match(/^Form\s+(\d)$/i);
  if (formNumMatch) {
    const n = Number(formNumMatch[1]);
    if (rLower.includes('form 1 - 4') || rLower.includes('form 1-4') || rLower.includes('form i - iv')) {
      return n >= 1 && n <= 4;
    }
    if (rLower.includes('form 3 - 4') || rLower.includes('form 3-4') || rLower.includes('form iii - iv')) {
      return n >= 3 && n <= 4;
    }
    if (rLower.includes('form 5 - 6') || rLower.includes('form 5-6') || rLower.includes('form v - vi')) {
      return n >= 5 && n <= 6;
    }
  }
  const stdNumMatch = cleanTarget.match(/^Standard\s+(\d)$/i);
  if (stdNumMatch) {
    const n = Number(stdNumMatch[1]);
    if (rLower.includes('std 1 - 4') || rLower.includes('standard 1 - 4')) {
      return n >= 1 && n <= 4;
    }
    if (rLower.includes('std 1 - 7') || rLower.includes('standard 1 - 7')) {
      return n >= 1 && n <= 7;
    }
  }
  return false;
}

export function getSyllabusTopicsForClassSubject(cls: string, subject: string): string[] {
  const cleanCls = normalizeClassName(cls || 'Form 3');
  const rawSub = (subject || '').trim();
  const cleanSub = normalizeSubjectName(rawSub || 'Basic Mathematics');

  // 1. Prioritize exact chapters from uploaded textbook banks (FULL_EXTRACTED_TEXTBOOK_BANK) whenever present for this Class & Subject
  const uploadedTopicsSet = new Set<string>();
  for (const seed of FULL_EXTRACTED_TEXTBOOK_BANK) {
    if (
      normalizeClassName(seed.cls) === cleanCls &&
      matchesSubjectQuery(seed.subject, cleanSub)
    ) {
      const cleanChapterTitle = (seed.topic || '').replace(/\s*\([^)]+\)\s*$/, '').trim();
      if (cleanChapterTitle) {
        uploadedTopicsSet.add(cleanChapterTitle);
      }
    }
  }
  if (uploadedTopicsSet.size > 0) {
    return Array.from(uploadedTopicsSet);
  }

  // 2. Otherwise look up TIE_SYLLABUS_COMPETENCES, prioritizing exact subject key matches that have this class level
  const allKeys = Object.keys(TIE_SYLLABUS_COMPETENCES);
  const exactKeyWithClass =
    allKeys.find(
      (k) => k.toLowerCase() === rawSub.toLowerCase() && Boolean(TIE_SYLLABUS_COMPETENCES[k]?.[cleanCls])
    ) ||
    allKeys.find(
      (k) => k.toLowerCase() === cleanSub.toLowerCase() && Boolean(TIE_SYLLABUS_COMPETENCES[k]?.[cleanCls])
    ) ||
    allKeys.find(
      (k) => matchesSubjectQuery(k, cleanSub) && Boolean(TIE_SYLLABUS_COMPETENCES[k]?.[cleanCls])
    );

  if (exactKeyWithClass && TIE_SYLLABUS_COMPETENCES[exactKeyWithClass]?.[cleanCls]) {
    return TIE_SYLLABUS_COMPETENCES[exactKeyWithClass][cleanCls];
  }

  const fallbackKey =
    allKeys.find((k) => k.toLowerCase() === rawSub.toLowerCase()) ||
    allKeys.find((k) => k.toLowerCase() === cleanSub.toLowerCase()) ||
    allKeys.find((k) => matchesSubjectQuery(k, cleanSub));

  if (fallbackKey && TIE_SYLLABUS_COMPETENCES[fallbackKey]) {
    const classMap = TIE_SYLLABUS_COMPETENCES[fallbackKey];
    if (classMap[cleanCls]) {
      return classMap[cleanCls];
    }
    return Object.values(classMap).flat().slice(0, 8);
  }
  return [
    `Chapter 1: Core Principles and Competence Foundations in ${cleanSub}`,
    `Chapter 2: Conceptual Analysis and Practical Procedures in ${cleanSub}`,
    `Chapter 3: Problem Solving, Calculations, and Real-Life Applications in ${cleanSub}`,
    `Chapter 4: NECTA Examination Assessment and Revision in ${cleanSub}`,
  ];
}

export function getTieTextbookChapterContent(
  cls: string,
  subject: string,
  queryOrTopic = '',
  siteResources?: SiteResourceContext
): {
  bookTitle: string;
  allChapters: string[];
  matchedChapter: string;
  subTopicsList: string[];
  attachedExcerpt: string;
  chapterSummaryMarkdown: string;
  chapterDeepNotes: string;
} {
  const cleanCls = normalizeClassName(cls || 'Form 1');
  const cleanSub = normalizeSubjectName(subject || 'Basic Mathematics');
  const baseChapters = getSyllabusTopicsForClassSubject(cleanCls, cleanSub);

  const attachedBook =
    (siteResources?.focusedResource &&
    (siteResources.focusedResource.category?.toLowerCase().includes('book') ||
      siteResources.focusedResource.title?.toLowerCase().includes('book') ||
      siteResources.focusedResource.title?.toLowerCase().includes('tie') ||
      Boolean(siteResources.focusedResource.customContent))
      ? siteResources.focusedResource
      : null) ||
    siteResources?.books?.[0] ||
    null;

  const rawAttachedText = (
    siteResources?.focusedResource?.customContent ||
    attachedBook?.customContent ||
    ''
  ).trim();

  // Extract any explicit chapters/units from the attached textbook custom content (including Table of Contents lines)
  const customExtractedChapters = extractTextbookChaptersFromText(rawAttachedText);

  const allChapters =
    customExtractedChapters.length > 0
      ? [
          ...customExtractedChapters,
          ...baseChapters.filter(
            (bc) => !customExtractedChapters.some((cc) => cc.toLowerCase() === bc.toLowerCase())
          ),
        ]
      : baseChapters;

  const bookTitle = attachedBook?.title
    ? `${attachedBook.title} (${cleanCls} ${cleanSub} — Official TIE Student's Textbook)`
    : `${cleanCls} ${cleanSub} — Official TIE Student's Textbook`;

  const qLower = (queryOrTopic || '').toLowerCase();
  let matchedChapter = allChapters[0] || `Chapter 1: Introduction to ${cleanSub}`;

  const chapNumMatch = qLower.match(
    /\b(?:chapter|sura\s+ya|topic|unit)\s*(?:(\d+)|(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|kwanza|pili|tatu|nne|tano|sita|saba|nane))\b/i
  );
  const wordMap: Record<string, number> = {
    one: 1, kwanza: 1,
    two: 2, pili: 2,
    three: 3, tatu: 3,
    four: 4, nne: 4,
    five: 5, tano: 5,
    six: 6, sita: 6,
    seven: 7, saba: 7,
    eight: 8, nane: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
  };

  const stopWords = new Set([
    'chapter', 'sura', 'and', 'the', 'for', 'with', 'from', 'explain', 'official',
    'textbook', 'student', 'book', 'tie', 'including', 'sub', 'topics', 'definitions',
    'formulas', 'step', 'worked', 'examples', 'necta', 'examination', 'questions',
    'syllabus', 'competences', 'integrated', 'website', 'resources', 'what', 'are',
    'give', 'show', 'summary', 'summarize', 'notes', 'form', 'standard',
  ]);

  if (chapNumMatch) {
    const idx = chapNumMatch[1]
      ? parseInt(chapNumMatch[1], 10) - 1
      : (wordMap[chapNumMatch[2].toLowerCase()] || 1) - 1;
    if (idx >= 0 && idx < allChapters.length) {
      matchedChapter = allChapters[idx];
    }
  } else if (qLower.trim().length > 2) {
    const hasWord = (text: string, word: string) =>
      new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
    let bestScore = 0;
    for (const ch of allChapters) {
      const mainTitlePart = ch.split('(')[0].toLowerCase();
      const chWords = Array.from(
        new Set(
          ch
            .toLowerCase()
            .replace(/[(),:&/-]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 3 && !stopWords.has(w))
        )
      );
      let sc = 0;
      for (const w of chWords) {
        if (hasWord(qLower, w)) {
          sc += mainTitlePart.includes(w) ? 10 : 4;
        } else if (w.endsWith('s') && w.length >= 5 && hasWord(qLower, w.slice(0, -1))) {
          sc += mainTitlePart.includes(w) ? 8 : 3;
        }
      }
      if (sc > bestScore) {
        bestScore = sc;
        matchedChapter = ch;
      }
    }
  }

  const parenMatch = matchedChapter.match(/\(([^)]+)\)/);
  const cleanChapHeading = matchedChapter
    .replace(/\s*\([^)]+\)/, '')
    .replace(/^(?:Chapter\s+\d+|Sura\s+ya\s+\w+|\d+\.\d+):\s*/i, '')
    .trim();
  const subTopicsList = parenMatch
    ? parenMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean)
    : getSubTopicsForMainTopic(cleanSub, cleanChapHeading);

  const chaptersTocMarkdown = allChapters
    .map((c) => `${c === matchedChapter ? '👉 ' : `• `}**${c}**${c === matchedChapter ? ' *(Active Matched Chapter)*' : ''}`)
    .join('\n');

  const subTopicsMarkdown = subTopicsList
    .map(
      (st, idx) =>
        `  ${idx + 1}. **${st}:** Covers official TIE textbook definitions, governing principles/laws, worked textbook examples, and chapter revision exercises on *${st}*.`
    )
    .join('\n');

  const attachedExcerptBlock = rawAttachedText
    ? `\n\n**3. 📄 Direct Content Extracted from Attached Textbook (${attachedBook?.title || bookTitle}):**\n${rawAttachedText.slice(0, 1800)}`
    : '';

  const chapterDeepNotes = `Official TIE Textbook Reference: ${bookTitle}
Active Matched Textbook Chapter: ${matchedChapter}
Sub-Topics in ${matchedChapter}: ${subTopicsList.join('; ')}
All Chapters in ${cleanCls} ${cleanSub} TIE Textbook:
${allChapters.map((c, i) => `${i + 1}. ${c}`).join('\n')}${
    rawAttachedText ? `\nAttached Textbook Content:\n${rawAttachedText.slice(0, 3500)}` : ''
  }`;

  const chapterSummaryMarkdown = `📖 **Attached TIE Textbook Integrated:** **${bookTitle}**\n\n**1. 📑 Complete Official Chapters & Topics in the ${cleanCls} ${cleanSub} TIE Textbook:**\n${chaptersTocMarkdown}\n\n**2. 🔍 Detailed TIE Textbook Chapter Breakdown — ${matchedChapter}:**\n• **Main Textbook Chapter:** **${matchedChapter}**\n• **Sub-Topics & Concepts in the TIE Student's Book:**\n${subTopicsMarkdown}${attachedExcerptBlock}`;

  return {
    bookTitle,
    allChapters,
    matchedChapter,
    subTopicsList,
    attachedExcerpt: rawAttachedText,
    chapterSummaryMarkdown,
    chapterDeepNotes,
  };
}

export function extractTextbookChaptersFromText(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];
  const wordToNumMap: Record<string, number> = {
    one: 1, kwanza: 1,
    two: 2, pili: 2,
    three: 3, tatu: 3,
    four: 4, nne: 4,
    five: 5, tano: 5,
    six: 6, sita: 6,
    seven: 7, saba: 7,
    eight: 8, nane: 8,
    nine: 9, tisa: 9,
    ten: 10, kumi: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
  };

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const found: string[] = [];
  const seenNums = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(
      /^(?:(chapter|sura\s+ya|topic|unit|module)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|kwanza|pili|tatu|nne|tano|sita|saba|nane|tisa|kumi))\s*(?:[:.\-–—]\s*(.*))?$/i
    );
    if (!match) continue;
    const prefixType = match[1].toLowerCase().startsWith('sura') ? 'Sura ya' : 'Chapter';
    const rawNum = match[2].toLowerCase();
    const numVal = wordToNumMap[rawNum] || parseInt(rawNum, 10) || found.length + 1;
    let titlePart = (match[3] || '').trim();

    // If the chapter heading is on one line and the title is on the very next line (common in TIE textbooks)
    if (!titlePart && i + 1 < lines.length) {
      const nextLine = lines[i + 1].replace(/\.{2,}\s*\d+$/, '').trim();
      if (
        nextLine.length >= 3 &&
        nextLine.length <= 95 &&
        !/^(chapter|sura|page|table\s+of\s+contents|introduction)/i.test(nextLine)
      ) {
        titlePart = nextLine;
      }
    }

    // Strip trailing TOC leader dots and page numbers like "Rates and variations ............. 64"
    titlePart = titlePart
      .replace(/\.{2,}\s*\d+\s*$/, '')
      .replace(/\s+\d+\s*$/, '')
      .trim();

    if (titlePart.length >= 3 && titlePart.length <= 110) {
      const key = `${prefixType}-${numVal}`;
      if (!seenNums.has(key)) {
        seenNums.add(key);
        found.push(
          prefixType === 'Sura ya'
            ? `Sura ya ${numVal}: ${titlePart}`
            : `Chapter ${numVal}: ${titlePart}`
        );
      }
    }
    if (found.length >= 16) break;
  }

  return found;
}

export function buildTopicDiagramSvg(
  cls: string,
  subject: string,
  topic: string,
  subTopic: string,
  subTopicsList: string[] = [],
  customCaption?: string
): { title: string; caption: string; svgHtml: string } {
  const sLower = (subject || '').toLowerCase();
  const tLower = `${topic} ${subTopic}`.toLowerCase();
  const safeTopic = escapeHtml(topic || subject);
  const safeSubTopic = escapeHtml(subTopic || topic || subject);
  const st1 = escapeHtml(subTopicsList[0] || subTopic || 'Core Principle');
  const st2 = escapeHtml(subTopicsList[1] || 'Governing Mechanism / Formula');
  const st3 = escapeHtml(subTopicsList[2] || 'Practical Application & Output');

  // 1. Dedicated Diagram for Rates and Variations (Direct Variation y = kx & Inverse Variation y = k/x)
  if (
    tLower.includes('variation') ||
    tLower.includes('rates and') ||
    tLower.includes('rate and') ||
    tLower.includes('proportional') ||
    tLower.includes('varies directly') ||
    tLower.includes('varies inversely')
  ) {
    return {
      title: `Direct Variation (y = kx) & Inverse Variation (y = k/x) Graphs — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Official TIE Form 2 Basic Mathematics graphical illustration of Direct Variation (straight line through the origin) and Inverse Variation (rectangular hyperbola).`,
      svgHtml: `<svg viewBox="0 0 640 245" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="245" fill="#ffffff" rx="8" />
        <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">TIE FORM 2 MATHEMATICS: DIRECT &amp; INVERSE VARIATION GRAPHS</text>
        <!-- Left Graph: Direct Variation y = kx -->
        <rect x="24" y="34" width="280" height="175" fill="#ffffff" stroke="#cbd5e1" rx="6" />
        <text x="164" y="52" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1e3a8a">(a) Direct Variation: y ∝ x  ⇒  y = kx</text>
        <line x1="58" y1="184" x2="276" y2="184" stroke="#0f172a" stroke-width="1.8" />
        <line x1="58" y1="184" x2="58" y2="62" stroke="#0f172a" stroke-width="1.8" />
        <text x="282" y="188" font-size="10" font-weight="800" fill="#0f172a">x</text>
        <text x="54" y="58" font-size="10" font-weight="800" fill="#0f172a">y</text>
        <text x="46" y="194" font-size="9.5" font-weight="700" fill="#334155">0</text>
        <!-- Straight line through origin -->
        <line x1="58" y1="184" x2="255" y2="74" stroke="#2563eb" stroke-width="2.8" />
        <circle cx="124" cy="147" r="4" fill="#dc2626" />
        <circle cx="190" cy="110" r="4" fill="#dc2626" />
        <line x1="124" y1="147" x2="190" y2="147" stroke="#64748b" stroke-width="1.3" stroke-dasharray="3,3" />
        <line x1="190" y1="147" x2="190" y2="110" stroke="#64748b" stroke-width="1.3" stroke-dasharray="3,3" />
        <text x="157" y="160" text-anchor="middle" font-size="9" font-weight="700" fill="#334155">Δx</text>
        <text x="206" y="132" font-size="9" font-weight="700" fill="#334155">Δy</text>
        <text x="180" y="82" font-size="10" font-weight="800" fill="#1d4ed8">Slope k = y / x</text>
        <!-- Right Graph: Inverse Variation y = k/x -->
        <rect x="336" y="34" width="280" height="175" fill="#ffffff" stroke="#cbd5e1" rx="6" />
        <text x="476" y="52" text-anchor="middle" font-size="10.5" font-weight="800" fill="#047857">(b) Inverse Variation: y ∝ 1/x  ⇒  y = k/x</text>
        <line x1="370" y1="184" x2="588" y2="184" stroke="#0f172a" stroke-width="1.8" />
        <line x1="370" y1="184" x2="370" y2="62" stroke="#0f172a" stroke-width="1.8" />
        <text x="594" y="188" font-size="10" font-weight="800" fill="#0f172a">x</text>
        <text x="366" y="58" font-size="10" font-weight="800" fill="#0f172a">y</text>
        <text x="358" y="194" font-size="9.5" font-weight="700" fill="#334155">0</text>
        <!-- Hyperbola curve -->
        <path d="M 386 72 Q 405 162 572 176" fill="none" stroke="#059669" stroke-width="2.8" />
        <circle cx="402" cy="105" r="4" fill="#dc2626" />
        <circle cx="465" cy="154" r="4" fill="#dc2626" />
        <text x="448" y="104" font-size="9.5" font-weight="800" fill="#065f46">(x₁, y₁)</text>
        <text x="500" y="148" font-size="9.5" font-weight="800" fill="#065f46">(x₂, y₂)</text>
        <text x="495" y="120" font-size="10" font-weight="800" fill="#047857">k = x₁y₁ = x₂y₂</text>
        <text x="320" y="228" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">Key Rule: Direct Variation passes through (0,0) with y₁/x₁ = y₂/x₂; Inverse Variation has constant product x₁y₁ = x₂y₂.</text>
      </svg>`,
    };
  }

  // 2. Dedicated Diagram for Trigonometry, Pythagoras Theorem & Angles of Elevation/Depression
  if (
    tLower.includes('trig') ||
    tLower.includes('pythagoras') ||
    tLower.includes('hypotenuse') ||
    tLower.includes('elevation') ||
    tLower.includes('depression') ||
    tLower.includes('sine') ||
    tLower.includes('cosine') ||
    tLower.includes('triangle')
  ) {
    return {
      title: `Right-Angled Triangle, Pythagoras & Trigonometric Ratios — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Standard TIE ${escapeHtml(cls)} ${escapeHtml(subject)} geometric diagram showing Opposite, Adjacent, Hypotenuse, and angle θ.`,
      svgHtml: `<svg viewBox="0 0 640 235" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="235" fill="#ffffff" rx="8" />
        <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">RIGHT-ANGLED TRIANGLE &amp; TRIGONOMETRIC RATIOS</text>
        <!-- Right-Angled Triangle ABC -->
        <polygon points="85,185 295,185 295,55" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.5" />
        <!-- Right angle square at B (295,185) -->
        <rect x="277" y="167" width="18" height="18" fill="none" stroke="#0f172a" stroke-width="1.8" />
        <!-- Angle arc at A (85,185) -->
        <path d="M 125 185 A 40 40 0 0 0 119 164" fill="none" stroke="#dc2626" stroke-width="2" />
        <text x="134" y="177" font-size="12" font-weight="800" fill="#dc2626">θ</text>
        <!-- Vertex Labels -->
        <text x="70" y="192" font-size="12" font-weight="800" fill="#0f172a">A</text>
        <text x="303" y="192" font-size="12" font-weight="800" fill="#0f172a">B</text>
        <text x="303" y="54" font-size="12" font-weight="800" fill="#0f172a">C</text>
        <!-- Side Labels -->
        <text x="190" y="204" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1e3a8a">Adjacent (b)</text>
        <text x="312" y="125" font-size="10.5" font-weight="800" fill="#047857">Opposite (a)</text>
        <text x="172" y="110" text-anchor="middle" font-size="10.5" font-weight="800" fill="#b45309">Hypotenuse (c)</text>
        <!-- Formulas Box -->
        <rect x="385" y="42" width="230" height="152" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <text x="400" y="64" font-size="10.5" font-weight="800" fill="#0f172a">Governing Formulas (SOHCAHTOA):</text>
        <text x="400" y="88" font-size="10" font-weight="700" fill="#1e3a8a">• sin θ = Opposite / Hypotenuse = a / c</text>
        <text x="400" y="110" font-size="10" font-weight="700" fill="#047857">• cos θ = Adjacent / Hypotenuse = b / c</text>
        <text x="400" y="132" font-size="10" font-weight="700" fill="#b45309">• tan θ = Opposite / Adjacent = a / b</text>
        <text x="400" y="156" font-size="10" font-weight="800" fill="#0f172a">• Pythagoras: a² + b² = c²</text>
        <text x="400" y="178" font-size="9.5" font-weight="700" fill="#475569">• sin²θ + cos²θ = 1</text>
        <text x="320" y="222" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">Always sketch and label the right-angled triangle before substituting values.</text>
      </svg>`,
    };
  }

  // 3. Dedicated Diagram for Sets & Venn Diagrams
  if (tLower.includes('venn') || tLower.includes('subset') || tLower.includes('union') || tLower.includes('intersection') || /\bsets?\b/.test(tLower)) {
    return {
      title: `Venn Diagram of Intersecting Sets A and B in Universal Set μ — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Official TIE Form 2 Basic Mathematics Venn diagram illustrating regions A only, A ∩ B, B only, and complement (A ∪ B)'.`,
      svgHtml: `<svg viewBox="0 0 640 235" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="235" fill="#ffffff" rx="8" />
        <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">VENN DIAGRAM REPRESENTATION OF SETS (A ∩ B AND A ∪ B)</text>
        <!-- Universal Set Box -->
        <rect x="40" y="36" width="310" height="162" fill="#ffffff" stroke="#0f172a" stroke-width="2" rx="6" />
        <text x="54" y="54" font-size="12" font-weight="900" fill="#0f172a">μ (U)</text>
        <!-- Circle A and Circle B -->
        <circle cx="155" cy="118" r="56" fill="#dbeafe" fill-opacity="0.55" stroke="#1d4ed8" stroke-width="2.2" />
        <circle cx="230" cy="118" r="56" fill="#dcfce7" fill-opacity="0.55" stroke="#15803d" stroke-width="2.2" />
        <text x="120" y="75" font-size="11" font-weight="800" fill="#1e3a8a">Set A</text>
        <text x="255" y="75" font-size="11" font-weight="800" fill="#14532d">Set B</text>
        <text x="122" y="122" text-anchor="middle" font-size="10" font-weight="800" fill="#1e3a8a">A ∩ B&apos;</text>
        <text x="192" y="122" text-anchor="middle" font-size="10.5" font-weight="900" fill="#0f172a">A ∩ B</text>
        <text x="262" y="122" text-anchor="middle" font-size="10" font-weight="800" fill="#14532d">A&apos; ∩ B</text>
        <text x="315" y="186" text-anchor="end" font-size="10" font-weight="700" fill="#475569">(A ∪ B)&apos;</text>
        <!-- Set Formulas Box -->
        <rect x="372" y="36" width="240" height="162" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <text x="386" y="60" font-size="10.5" font-weight="800" fill="#0f172a">Key Cardinality Formulas:</text>
        <text x="386" y="86" font-size="10" font-weight="700" fill="#1e3a8a">• n(A ∪ B) = n(A) + n(B) − n(A ∩ B)</text>
        <text x="386" y="110" font-size="10" font-weight="700" fill="#047857">• n(A only) = n(A) − n(A ∩ B)</text>
        <text x="386" y="134" font-size="10" font-weight="700" fill="#047857">• n(B only) = n(B) − n(A ∩ B)</text>
        <text x="386" y="158" font-size="10" font-weight="700" fill="#334155">• n(μ) = n(A ∪ B) + n(A ∪ B)&apos;</text>
        <text x="386" y="180" font-size="9.5" font-weight="700" fill="#475569">• De Morgan: (A ∪ B)&apos; = A&apos; ∩ B&apos;</text>
        <text x="320" y="220" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">Always fill the intersection region n(A ∩ B) first when solving Venn diagram problems.</text>
      </svg>`,
    };
  }

  // 4. Dedicated Diagram for Circles & Circle Theorems
  if (tLower.includes('circle') || tLower.includes('chord') || tLower.includes('cyclic') || tLower.includes('tangent theorem')) {
    return {
      title: `Circle Theorems — Central Angle, Inscribed Angle & Tangent — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Official TIE Form 3 Basic Mathematics geometric diagram illustrating angle at the centre (2θ), inscribed angle (θ), and tangent perpendicularity.`,
      svgHtml: `<svg viewBox="0 0 640 235" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="235" fill="#ffffff" rx="8" />
        <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">TIE CIRCLE THEOREMS &amp; CHORD / TANGENT PROPERTIES</text>
        <circle cx="185" cy="118" r="74" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.5" />
        <circle cx="185" cy="118" r="3.5" fill="#0f172a" />
        <text x="185" y="133" text-anchor="middle" font-size="10" font-weight="800" fill="#0f172a">O (2θ)</text>
        <!-- Points A, B on bottom arc, P on top arc -->
        <line x1="125" y1="162" x2="185" y2="118" stroke="#dc2626" stroke-width="2" />
        <line x1="245" y1="162" x2="185" y2="118" stroke="#dc2626" stroke-width="2" />
        <line x1="125" y1="162" x2="185" y2="44" stroke="#059669" stroke-width="2" />
        <line x1="245" y1="162" x2="185" y2="44" stroke="#059669" stroke-width="2" />
        <line x1="125" y1="162" x2="245" y2="162" stroke="#334155" stroke-width="1.8" stroke-dasharray="4,3" />
        <text x="112" y="168" font-size="11" font-weight="800" fill="#0f172a">A</text>
        <text x="252" y="168" font-size="11" font-weight="800" fill="#0f172a">B</text>
        <text x="185" y="38" text-anchor="middle" font-size="11" font-weight="800" fill="#047857">P (θ)</text>
        <!-- Tangent at bottom -->
        <line x1="95" y1="192" x2="275" y2="192" stroke="#0f172a" stroke-width="2" />
        <text x="282" y="195" font-size="10" font-weight="800" fill="#0f172a">Tangent</text>
        <!-- Summary Box -->
        <rect x="350" y="42" width="265" height="152" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <text x="364" y="64" font-size="10.5" font-weight="800" fill="#0f172a">Core Circle Theorems:</text>
        <text x="364" y="88" font-size="10" font-weight="700" fill="#1e3a8a">• ∠AOB = 2 × ∠APB (Angle at centre)</text>
        <text x="364" y="110" font-size="10" font-weight="700" fill="#047857">• Angle in a semicircle = 90°</text>
        <text x="364" y="132" font-size="10" font-weight="700" fill="#334155">• Opposite angles of cyclic quad = 180°</text>
        <text x="364" y="154" font-size="10" font-weight="700" fill="#b45309">• Radius ⊥ Tangent at point of contact</text>
        <text x="364" y="176" font-size="9.5" font-weight="700" fill="#475569">• Intersecting chords: AP · PB = CP · PD</text>
        <text x="320" y="220" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">State the exact geometric theorem in brackets for every step in NECTA solutions.</text>
      </svg>`,
    };
  }

  if (sLower.includes('physic') || tLower.includes('circuit') || tLower.includes('ohm') || tLower.includes('current') || tLower.includes('force')) {
    const f2VectorSvg = getPhysicsF2DiagramSvg(`${topic} ${subTopic}`, topic, subTopic);
    if (f2VectorSvg) {
      return {
        title: f2VectorSvg.title || `High-Precision Vector Physics Diagram — ${safeSubTopic}`,
        caption:
          customCaption ||
          f2VectorSvg.caption ||
          `Official TIE ${escapeHtml(cls)} ${escapeHtml(subject)} vector diagram illustrating ${safeSubTopic} (${safeTopic}).`,
        svgHtml: f2VectorSvg.svgHtml,
      };
    }
    return {
      title: `Labeled Physics Experimental & Theoretical Diagram — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Standard TIE ${escapeHtml(cls)} ${escapeHtml(subject)} schematic illustrating the experimental setup, variables, and governing relationship for ${safeSubTopic} (${safeTopic}).`,
      svgHtml: `<svg viewBox="0 0 640 230" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="230" fill="#ffffff" rx="8" />
        <text x="320" y="24" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">TIE PHYSICS LAB SCHEMATIC: ${safeSubTopic.toUpperCase().slice(0, 48)}</text>
        <!-- Circuit / Apparatus Frame -->
        <rect x="90" y="55" width="460" height="125" fill="none" stroke="#1e293b" stroke-width="2.5" rx="6" />
        <!-- DC Source / Input -->
        <rect x="65" y="95" width="50" height="44" rx="6" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2" />
        <text x="90" y="115" text-anchor="middle" font-size="10" font-weight="800" fill="#1e3a8a">Source (E)</text>
        <text x="90" y="129" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4ed8">+ / −</text>
        <!-- Ammeter (Series) -->
        <circle cx="220" cy="55" r="20" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
        <text x="220" y="59" text-anchor="middle" font-size="12" font-weight="900" fill="#92400e">A</text>
        <text x="220" y="88" text-anchor="middle" font-size="9.5" font-weight="700" fill="#475569">Ammeter (I)</text>
        <!-- Load / Resistor / Test Specimen -->
        <rect x="330" y="41" width="110" height="28" rx="4" fill="#e0e7ff" stroke="#4338ca" stroke-width="2" />
        <text x="385" y="59" text-anchor="middle" font-size="10" font-weight="800" fill="#312e81">${st1.slice(0, 18)}</text>
        <!-- Voltmeter (Parallel) -->
        <line x1="345" y1="69" x2="345" y2="120" stroke="#0f766e" stroke-width="1.8" stroke-dasharray="4,3" />
        <line x1="425" y1="69" x2="425" y2="120" stroke="#0f766e" stroke-width="1.8" stroke-dasharray="4,3" />
        <line x1="345" y1="120" x2="425" y2="120" stroke="#0f766e" stroke-width="1.8" />
        <circle cx="385" cy="120" r="17" fill="#ccfbf1" stroke="#0f766e" stroke-width="2" />
        <text x="385" y="124" text-anchor="middle" font-size="11" font-weight="900" fill="#115e59">V</text>
        <!-- Rheostat / Variable Control -->
        <rect x="250" y="166" width="130" height="26" rx="4" fill="#dcfce7" stroke="#15803d" stroke-width="2" />
        <text x="315" y="183" text-anchor="middle" font-size="10" font-weight="800" fill="#14532d">Variable Control (R)</text>
        <!-- Key annotations -->
        <text x="320" y="214" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">Key Labels: [1] Source/Input  •  [2] Measuring Instrument (A/V)  •  [3] ${st2.slice(0, 28)}</text>
      </svg>`,
    };
  }

  if (sLower.includes('chemi') || tLower.includes('titration') || tLower.includes('acid') || tLower.includes('mole') || tLower.includes('atom')) {
    return {
      title: `Labeled Chemistry Apparatus & Reaction Setup — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Standard TIE ${escapeHtml(cls)} ${escapeHtml(subject)} laboratory apparatus and reaction pathway for ${safeSubTopic} (${safeTopic}).`,
      svgHtml: `<svg viewBox="0 0 640 235" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="235" fill="#ffffff" rx="8" />
        <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">TIE CHEMISTRY LABORATORY SETUP: ${safeSubTopic.toUpperCase().slice(0, 44)}</text>
        <!-- Retort Stand -->
        <line x1="150" y1="38" x2="150" y2="200" stroke="#334155" stroke-width="4" />
        <rect x="105" y="198" width="110" height="10" rx="3" fill="#475569" />
        <line x1="150" y1="75" x2="230" y2="75" stroke="#475569" stroke-width="3" />
        <!-- Burette / Column -->
        <rect x="223" y="40" width="16" height="92" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
        <circle cx="231" cy="136" r="4" fill="#0369a1" />
        <text x="315" y="65" font-size="10.5" font-weight="800" fill="#0369a1">← Graduated Burette (${st1.slice(0, 22)})</text>
        <text x="315" y="82" font-size="9.5" font-weight="600" fill="#475569">• Standard Titrant / Reagent Solution</text>
        <!-- Conical Flask -->
        <polygon points="216,148 246,148 264,195 198,195" fill="#dcfce7" stroke="#15803d" stroke-width="2" />
        <rect x="224" y="138" width="14" height="10" fill="none" stroke="#15803d" stroke-width="2" />
        <text x="315" y="168" font-size="10.5" font-weight="800" fill="#166534">← Conical Flask (${st2.slice(0, 24)})</text>
        <text x="315" y="185" font-size="9.5" font-weight="600" fill="#475569">• Analyte + Indicator on White Tile</text>
        <text x="320" y="222" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">Key Observation &amp; Stoichiometry: ${st3.slice(0, 46)}</text>
      </svg>`,
    };
  }

  if (sLower.includes('biolog') || sLower.includes('sayansi') || tLower.includes('cell') || tLower.includes('photo') || tLower.includes('plant') || tLower.includes('human')) {
    return {
      title: `Labeled Biological Structure & Physiological Pathway — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Official TIE ${escapeHtml(cls)} ${escapeHtml(subject)} labeled biological structure and functional mechanism for ${safeSubTopic} (${safeTopic}).`,
      svgHtml: `<svg viewBox="0 0 640 235" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="235" fill="#ffffff" rx="8" />
        <text x="320" y="24" text-anchor="middle" font-size="12" font-weight="800" fill="#064e3b">TIE BIOLOGY LABELED DIAGRAM: ${safeSubTopic.toUpperCase().slice(0, 46)}</text>
        <!-- Outer Biological Membrane / Wall -->
        <rect x="75" y="45" width="250" height="150" rx="26" fill="#dcfce7" stroke="#15803d" stroke-width="3" />
        <rect x="90" y="58" width="220" height="124" rx="20" fill="#ffffff" stroke="#22c55e" stroke-width="2" stroke-dasharray="5,3" />
        <!-- Central Nucleus / Core Organelle -->
        <circle cx="165" cy="120" r="32" fill="#ede9fe" stroke="#6d28d9" stroke-width="2.5" />
        <circle cx="165" cy="120" r="11" fill="#c4b5fd" />
        <!-- Functional Organelle / Chloroplast / Mitochondrion -->
        <ellipse cx="250" cy="95" rx="28" ry="15" fill="#bbf7d0" stroke="#166534" stroke-width="2" />
        <ellipse cx="245" cy="145" rx="26" ry="14" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
        <!-- Callout Lines & Labels -->
        <line x1="300" y1="65" x2="365" y2="65" stroke="#15803d" stroke-width="1.8" />
        <text x="372" y="69" font-size="10.5" font-weight="800" fill="#14532d">1. Outer Boundary / Structure (${st1.slice(0, 22)})</text>
        <line x1="197" y1="120" x2="365" y2="115" stroke="#6d28d9" stroke-width="1.8" />
        <text x="372" y="119" font-size="10.5" font-weight="800" fill="#4c1d95">2. Regulatory / Core Center (${st2.slice(0, 22)})</text>
        <line x1="271" y1="145" x2="365" y2="162" stroke="#ca8a04" stroke-width="1.8" />
        <text x="372" y="166" font-size="10.5" font-weight="800" fill="#854d0e">3. Physiological Site (${st3.slice(0, 22)})</text>
        <text x="320" y="218" text-anchor="middle" font-size="10" font-weight="700" fill="#065f46">Adaptation &amp; Function: Specialized structure enables efficient ${safeSubTopic.toLowerCase()} in organisms.</text>
      </svg>`,
    };
  }

  // Dedicated Diagram for Linear Programming (Feasible Region, Boundary Lines & Corner Points)
  if (
    tLower.includes('linear programming') ||
    tLower.includes('feasible') ||
    tLower.includes('objective function') ||
    tLower.includes('simultaneous linear inequalit')
  ) {
    return {
      title: `Linear Programming — Feasible Region, Constraint Lines & Corner Points — ${safeSubTopic}`,
      caption:
        customCaption ||
        `Official TIE Form 3 Basic Mathematics Linear Programming graph showing constraint boundary lines, shaded Feasible Region R, and corner points O, A, B, C.`,
      svgHtml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 245" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="245" fill="#ffffff" rx="8" />
        <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">LINEAR PROGRAMMING: FEASIBLE REGION &amp; OPTIMAL CORNER POINTS</text>
        <!-- Shaded Feasible Region Polygon O(70,195) -> A(220,195) -> B(160,105) -> C(70,60) -->
        <polygon points="70,195 220,195 160,105 70,60" fill="#dbeafe" fill-opacity="0.7" stroke="#1d4ed8" stroke-width="2" />
        <!-- Coordinate Axes -->
        <line x1="70" y1="195" x2="335" y2="195" stroke="#0f172a" stroke-width="2.2" />
        <line x1="70" y1="195" x2="70" y2="35" stroke="#0f172a" stroke-width="2.2" />
        <text x="342" y="199" font-size="11" font-weight="800" fill="#0f172a">x</text>
        <text x="66" y="30" font-size="11" font-weight="800" fill="#0f172a">y</text>
        <!-- Constraint Line L1: x + 2y = 16 through (70,60) and (310,195) -->
        <line x1="70" y1="60" x2="310" y2="195" stroke="#2563eb" stroke-width="2.2" />
        <text x="235" y="138" font-size="9.5" font-weight="800" fill="#1d4ed8">L₁: x + 2y ≤ 16</text>
        <!-- Constraint Line L2: 3x + 2y = 24 through (110,45) and (220,195) -->
        <line x1="100" y1="35" x2="220" y2="195" stroke="#dc2626" stroke-width="2.2" />
        <text x="135" y="52" font-size="9.5" font-weight="800" fill="#dc2626">L₂: 3x + 2y ≤ 24</text>
        <!-- Corner Points -->
        <circle cx="70" cy="195" r="4" fill="#0f172a" />
        <circle cx="220" cy="195" r="4.5" fill="#dc2626" />
        <circle cx="160" cy="105" r="5" fill="#16a34a" />
        <circle cx="70" cy="60" r="4.5" fill="#2563eb" />
        <text x="52" y="210" font-size="9.5" font-weight="800" fill="#0f172a">O(0,0)</text>
        <text x="210" y="212" font-size="9.5" font-weight="800" fill="#dc2626">A(8,0)</text>
        <text x="168" y="102" font-size="10" font-weight="900" fill="#15803d">B(4,6) Optimal</text>
        <text x="32" y="64" font-size="9.5" font-weight="800" fill="#1d4ed8">C(0,8)</text>
        <text x="122" y="158" text-anchor="middle" font-size="10" font-weight="900" fill="#1e3a8a">Feasible</text>
        <text x="122" y="171" text-anchor="middle" font-size="10" font-weight="900" fill="#1e3a8a">Region (R)</text>
        <!-- Corner Point Evaluation Table Box -->
        <rect x="365" y="42" width="252" height="162" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <text x="379" y="64" font-size="10.5" font-weight="800" fill="#0f172a">Objective Function: Max Z = 40x + 50y</text>
        <text x="379" y="88" font-size="10" font-weight="700" fill="#334155">• At O(0, 0):  Z = 40(0) + 50(0) = 0</text>
        <text x="379" y="110" font-size="10" font-weight="700" fill="#dc2626">• At A(8, 0):  Z = 40(8) + 50(0) = 320</text>
        <text x="379" y="132" font-size="10" font-weight="900" fill="#15803d">• At B(4, 6):  Z = 40(4) + 50(6) = 460 (Max)</text>
        <text x="379" y="154" font-size="10" font-weight="700" fill="#1d4ed8">• At C(0, 8):  Z = 40(0) + 50(8) = 400</text>
        <text x="379" y="182" font-size="9.5" font-weight="700" fill="#475569">Non-negativity constraints: x ≥ 0, y ≥ 0</text>
        <text x="320" y="230" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">Steps: 1. Formulate constraints  2. Plot boundary lines  3. Shade Feasible Region  4. Test Corner Points.</text>
      </svg>`,
    };
  }

  if (sLower.includes('math') || sLower.includes('hisabati') || tLower.includes('graph') || tLower.includes('equation') || tLower.includes('function') || tLower.includes('linear') || tLower.includes('coordinate')) {
    return {
      title: `Cartesian Coordinate & Graphical Representation — ${safeSubTopic}`,
      caption:
        customCaption ||
        `TIE ${escapeHtml(cls)} ${escapeHtml(subject)} graphical and geometric illustration of ${safeSubTopic} (${safeTopic}).`,
      svgHtml: `<svg viewBox="0 0 640 235" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <rect x="0" y="0" width="640" height="235" fill="#ffffff" rx="8" />
        <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">TIE MATHEMATICS GRAPHICAL MODEL: ${safeSubTopic.toUpperCase().slice(0, 44)}</text>
        <!-- Grid lines -->
        <line x1="80" y1="115" x2="340" y2="115" stroke="#475569" stroke-width="1.8" />
        <line x1="210" y1="38" x2="210" y2="198" stroke="#475569" stroke-width="1.8" />
        <text x="346" y="119" font-size="11" font-weight="800" fill="#0f172a">x</text>
        <text x="214" y="45" font-size="11" font-weight="800" fill="#0f172a">y</text>
        <!-- Curve & Linear Tangent/Secant -->
        <path d="M 115 55 Q 210 195 305 55" fill="none" stroke="#2563eb" stroke-width="3" />
        <line x1="125" y1="155" x2="310" y2="75" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3" />
        <circle cx="163" cy="115" r="4.5" fill="#16a34a" />
        <circle cx="257" cy="115" r="4.5" fill="#16a34a" />
        <circle cx="210" cy="125" r="4.5" fill="#9333ea" />
        <!-- Mathematical Annotations -->
        <rect x="370" y="50" width="245" height="140" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <text x="384" y="74" font-size="10.5" font-weight="800" fill="#1e3a8a">Key Geometric &amp; Algebraic Features:</text>
        <text x="384" y="98" font-size="10" font-weight="700" fill="#334155">• Focus 1: ${st1.slice(0, 28)}</text>
        <text x="384" y="120" font-size="10" font-weight="700" fill="#334155">• Focus 2: ${st2.slice(0, 28)}</text>
        <text x="384" y="142" font-size="10" font-weight="700" fill="#334155">• Roots / Intercepts: x₁, x₂ &amp; Vertex</text>
        <text x="384" y="166" font-size="10" font-weight="800" fill="#047857">• Verification: Substitute into formula</text>
        <text x="320" y="220" text-anchor="middle" font-size="10" font-weight="700" fill="#475569">Always label axes, intercepts, and turning points clearly in NECTA Section B &amp; C.</text>
      </svg>`,
    };
  }

  // Universal Structured Concept & Process Diagram for Geography, History, Civics, Commerce, English, Kiswahili, etc.
  return {
    title: `TIE Curriculum Concept & Structural Diagram — ${safeSubTopic}`,
    caption:
      customCaption ||
      `Official TIE ${escapeHtml(cls)} ${escapeHtml(subject)} structural concept diagram showing the relationship between sub-topics in ${safeTopic} (${safeSubTopic}).`,
    svgHtml: `<svg viewBox="0 0 640 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
      <rect x="0" y="0" width="640" height="220" fill="#ffffff" rx="8" />
      <text x="320" y="24" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">TIE TEXTBOOK CONCEPT DIAGRAM: ${safeTopic.toUpperCase().slice(0, 48)}</text>
      <!-- Top Central Node: Main Chapter / Topic -->
      <rect x="190" y="40" width="260" height="42" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2" />
      <text x="320" y="65" text-anchor="middle" font-size="11" font-weight="800" fill="#1e3a8a">${safeSubTopic.slice(0, 34)}</text>
      <!-- Connecting Arrows -->
      <line x1="320" y1="82" x2="115" y2="122" stroke="#475569" stroke-width="2" />
      <line x1="320" y1="82" x2="320" y2="122" stroke="#475569" stroke-width="2" />
      <line x1="320" y1="82" x2="525" y2="122" stroke="#475569" stroke-width="2" />
      <!-- Pillar 1 -->
      <rect x="30" y="122" width="170" height="58" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="2" />
      <text x="115" y="144" text-anchor="middle" font-size="10" font-weight="800" fill="#1d4ed8">1. Foundation &amp; Meaning</text>
      <text x="115" y="162" text-anchor="middle" font-size="9.5" font-weight="600" fill="#1e293b">${st1.slice(0, 24)}</text>
      <!-- Pillar 2 -->
      <rect x="235" y="122" width="170" height="58" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="2" />
      <text x="320" y="144" text-anchor="middle" font-size="10" font-weight="800" fill="#047857">2. Key Principles / Stages</text>
      <text x="320" y="162" text-anchor="middle" font-size="9.5" font-weight="600" fill="#1e293b">${st2.slice(0, 24)}</text>
      <!-- Pillar 3 -->
      <rect x="440" y="122" width="170" height="58" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="2" />
      <text x="525" y="144" text-anchor="middle" font-size="10" font-weight="800" fill="#b45309">3. Application in Tanzania</text>
      <text x="525" y="162" text-anchor="middle" font-size="9.5" font-weight="600" fill="#1e293b">${st3.slice(0, 24)}</text>
      <text x="320" y="204" text-anchor="middle" font-size="10" font-weight="700" fill="#475569">Source: Official TIE ${escapeHtml(cls)} ${escapeHtml(subject)} Student&apos;s Textbook Chapter Summary</text>
    </svg>`,
  };
}

export function renderTopicDiagramBlockHtml(
  cls: string,
  subject: string,
  topic: string,
  subTopic: string,
  subTopicsList: string[] = [],
  customCaption?: string
): string {
  const diag = buildTopicDiagramSvg(cls, subject, topic, subTopic, subTopicsList, customCaption);
  return `<div style="margin:12px 0; padding:12px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
    <div style="font-weight:800; font-size:12px; color:#0f172a; margin-bottom:8px; text-align:center;">${diag.title}</div>
    ${diag.svgHtml}
    <div style="font-size:11px; color:#475569; margin-top:8px; text-align:center; font-style:italic;">${diag.caption}</div>
  </div>`;
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
  const teacher = escapeHtml((meta.teacher || 'SUBJECT TEACHER').toUpperCase());
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
    const tbInfo = getTieTextbookChapterContent(
      meta.cls || 'Form 1',
      meta.subject || 'Basic Mathematics',
      `${meta.topic || ''} ${meta.subTopic || ''}`,
      meta.siteResources
    );
    const topicQuestions = buildContentIntegratedQuizQuestions(
      meta.cls || 'Form 1',
      meta.subject || 'Basic Mathematics',
      meta.topic || tbInfo.matchedChapter,
      meta.siteResources,
      meta.subTopic
    );
    const q1 = topicQuestions[0];
    const q2 = topicQuestions[1];
    const q3 = topicQuestions[2];

    const concepts = aiEnhancedDetails?.keyConcepts?.length
      ? aiEnhancedDetails.keyConcepts
      : [
          {
            heading: `1. Textbook Chapter Overview & Sub-Topics (${tbInfo.matchedChapter})`,
            explanation: `Directly following "${tbInfo.bookTitle}", this chapter covers the core sub-topics: ${tbInfo.subTopicsList.join(', ')}. ${
              tbInfo.attachedExcerpt
                ? `Attached Textbook Content: ${tbInfo.attachedExcerpt.slice(0, 650)}`
                : `Students must master the foundational definitions, governing laws, and standard TIE textbook procedures for ${subTopic}.`
            }`,
          },
          {
            heading: `2. Governing Principles, Formulas & Step-by-Step Methodology (${subTopic})`,
            explanation: `When solving textbook or NECTA problems on ${subTopic}, begin by stating the governing principle or formula from ${tbInfo.bookTitle}. Extract all given parameters in standard units, show each intermediate derivation step clearly, and verify the final result.`,
          },
          {
            heading: `3. Practical & Real-Life Applications in Tanzania`,
            explanation: `Concepts from ${tbInfo.matchedChapter} (${subTopic}) are applied in laboratory practicals, industrial processes, environmental management, and socio-economic problem solving across Tanzania.`,
          },
        ];

    const examples = aiEnhancedDetails?.workedExamples?.length
      ? aiEnhancedDetails.workedExamples
      : [
          {
            problem: q1
              ? `${q1.question} (${q1.sourceRef || tbInfo.bookTitle})`
              : `Worked Example 1 (${tbInfo.bookTitle}): Define ${subTopic} and solve a standard problem under ${tbInfo.matchedChapter}.`,
            solution: q1
              ? `Step 1 (Methodology & Analysis): ${q1.explanation}\nStep 2 (Verified Textbook Answer): ${q1.options[q1.correctIndex]} [02 Marks]`
              : `Step 1 (Identify Given Data & Definition): State the official TIE ${cls} ${subject} definition of ${subTopic} and write down the given parameters [01 Mark].\nStep 2 (Formula / Principle): State the governing formula or principle linking the variables [02 Marks].\nStep 3 (Substitution & Final Answer): Substitute the values step-by-step and state the final answer with appropriate units [02 Marks].`,
          },
          {
            problem: q2
              ? `${q2.question} (${q2.sourceRef || 'NECTA Past Paper Standard'})`
              : `Worked Example 2 (NECTA Past Paper Application): Explain how ${subTopic} is applied in practical situations in Tanzania.`,
            solution: q2
              ? `Step 1 (Methodology & Analysis): ${q2.explanation}\nStep 2 (Verified Answer): ${q2.options[q2.correctIndex]} [02 Marks]`
              : `Step 1 (Core Mechanism): Identify the main principle of ${subTopic} involved in the scenario [02 Marks].\nStep 2 (Practical Explanation): Explain two concrete ways ${subTopic} operates in laboratory or daily Tanzanian contexts [02 Marks].\nStep 3 (Conclusion): Summarize the expected observation or result clearly [01 Mark].`,
          },
        ];

    const practiceQs = aiEnhancedDetails?.practiceQuestions?.length
      ? aiEnhancedDetails.practiceQuestions
      : [
          {
            question: q3
              ? `${q3.question} (04 Marks)`
              : `From ${tbInfo.bookTitle} (${tbInfo.matchedChapter}), define ${subTopic} and state its governing principles. (04 Marks)`,
            answerHint: q3
              ? `${q3.explanation} (Answer: ${q3.options[q3.correctIndex]})`
              : `Clear TIE textbook definition = 02 Marks; Two valid principles (01 Mark each) = 02 Marks.`,
          },
          {
            question: `Draw a neat, well-labeled diagram illustrating ${subTopic} (${tbInfo.matchedChapter}) and explain the function of each labeled part. (06 Marks)`,
            answerHint: `Neat labeled textbook diagram = 03 Marks; Clear explanation of three labeled parts/stages (01 Mark each) = 03 Marks.`,
          },
          {
            question: `Solve a structured problem on ${subTopic} from ${tbInfo.bookTitle} showing all working steps clearly. (10 Marks)`,
            answerHint: `Given data (02 Marks) → Formula/Method (02 Marks) → Step-by-step working (04 Marks) → Final Answer with units (02 Marks).`,
          },
        ];

    const diagramBlock = buildTopicDiagramSvg(
      meta.cls || 'Form 1',
      meta.subject || 'Basic Mathematics',
      tbInfo.matchedChapter || meta.topic || 'Core Topic',
      meta.subTopic || meta.topic || 'Specific Activity',
      tbInfo.subTopicsList,
      aiEnhancedDetails?.notesSummary
    );

    const stripRawSvgMarkup = (txt: string) =>
      String(txt || '')
        .replace(/```(?:xml|svg|html)?\s*<svg[\s\S]*?(?:<\/svg>|$)\s*```?/gi, '')
        .replace(/<svg\b[\s\S]*?(?:<\/svg\s*>|$)/gi, '')
        .trim();

    const formatExplanationHtml = (raw: string) => {
      const escaped = escapeHtml(stripRawSvgMarkup(raw));
      const sentences = escaped
        .split(/(?<=\.)\s+|\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sentences.length <= 1) {
        return `<p style="margin:0; line-height:1.65; color:var(--text-primary);">${escaped}</p>`;
      }
      return `<p style="margin:0 0 6px 0; line-height:1.65; color:var(--text-primary);">${sentences[0]}</p>
        <ul style="margin:0; padding-left:18px; color:var(--text-secondary); line-height:1.6;">
          ${sentences
            .slice(1)
            .map((s) => `<li style="margin-bottom:3px;">${s}</li>`)
            .join('')}
        </ul>`;
    };

    const formatSolutionStepsHtml = (raw: string) => {
      const escaped = escapeHtml(stripRawSvgMarkup(raw));
      const lines = escaped
        .split(/\n+|(?=\bStep\s*\d+)/i)
        .map((s) => s.trim())
        .filter(Boolean);
      return lines
        .map(
          (line) =>
            `<div style="margin-bottom:4px; line-height:1.6; color:var(--text-primary);">• ${line.replace(
              /^(Step\s*\d+[^:]*:)/i,
              '<strong>$1</strong>'
            )}</div>`
        )
        .join('');
    };

    return `<div class="official-tie-doc" style="padding:18px 20px; line-height:1.6; color:var(--text-primary); background:var(--bg-surface); border:1px solid var(--border-strong); border-radius:10px;">
      <!-- Clean Document Title Banner -->
      <div style="text-align:center; border-bottom:2px solid var(--border-strong); padding-bottom:10px; margin-bottom:14px;">
        <div style="font-weight:800; font-size:11px; letter-spacing:0.04em; color:var(--text-secondary); text-transform:uppercase;">
          THE UNITED REPUBLIC OF TANZANIA · TANZANIA INSTITUTE OF EDUCATION (TIE)
        </div>
        <div style="font-weight:900; font-size:15px; color:var(--text-primary); margin-top:2px; text-transform:uppercase;">
          ${school} — COMPREHENSIVE TEXTBOOK LESSON NOTES
        </div>
        <div style="font-weight:700; font-size:12px; color:#6366f1; margin-top:2px;">
          ${cls} · ${subject} — ${escapeHtml(tbInfo.matchedChapter)}: ${subTopic}
        </div>
      </div>

      <!-- Clean Metadata Strip -->
      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:10px 14px; margin-bottom:16px; font-size:11.5px; line-height:1.6;">
        <div style="display:flex; flex-wrap:wrap; gap:6px 20px;">
          <div><strong>Class:</strong> ${cls}</div>
          <div><strong>Subject:</strong> ${subject}</div>
          <div><strong>Attached TIE Textbook:</strong> ${escapeHtml(tbInfo.bookTitle)}</div>
          <div><strong>Chapter / Topic:</strong> ${escapeHtml(tbInfo.matchedChapter)}</div>
          <div><strong>Sub-Topic:</strong> ${subTopic}</div>
          <div><strong>Prepared By:</strong> ${teacher}</div>
        </div>
        <div style="margin-top:6px; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--text-secondary);">
          <strong>Chapter Sub-Topics Covered:</strong> ${escapeHtml(tbInfo.subTopicsList.join(' • '))}
        </div>
      </div>

      <!-- PART I: STRUCTURED TOPIC NOTES FOLLOWING ATTACHED TEXTBOOK -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid var(--border-strong); padding-bottom:4px; margin-bottom:10px;">
          Part I: Core Textbook Notes &amp; Key Concepts (${escapeHtml(tbInfo.bookTitle)})
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${concepts
            .map(
              (c) => `<div style="padding:10px 14px; background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px;">
                <div style="font-weight:800; font-size:12.5px; color:#6366f1; margin-bottom:5px;">
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

      <!-- PART II: LABELED TEXTBOOK DIAGRAM & VISUAL ILLUSTRATION -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid var(--border-strong); padding-bottom:4px; margin-bottom:10px;">
          Part II: Labeled Textbook Diagram &amp; Visual Illustration
        </div>
        <div style="padding:12px 14px; background:var(--bg-elevated); border:1px solid var(--border-strong); border-radius:8px;">
          <div style="font-weight:800; font-size:12px; color:var(--text-primary); margin-bottom:8px; text-align:center;">
            ${diagramBlock.title}
          </div>
          ${diagramBlock.svgHtml}
          <div style="font-size:11px; color:var(--text-secondary); margin-top:8px; text-align:center; font-style:italic;">
            ${diagramBlock.caption}
          </div>
        </div>
      </div>

      <!-- PART III: STEP-BY-STEP WORKED EXAMPLES -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid var(--border-strong); padding-bottom:4px; margin-bottom:10px;">
          Part III: Step-by-Step Worked Examples (TIE Textbook &amp; NECTA Standard)
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${examples
            .map(
              (ex, idx) => `<div style="padding:12px 14px; background:var(--bg-elevated); border:1px solid var(--border-strong); border-radius:8px;">
                <div style="font-weight:800; font-size:12px; color:var(--text-primary); margin-bottom:6px;">
                  Example ${idx + 1}: ${escapeHtml(ex.problem)}
                </div>
                <div style="font-size:11.5px; padding-top:6px; border-top:1px dashed var(--border-strong);">
                  <div style="font-weight:800; color:#10b981; margin-bottom:4px;">Worked Solution:</div>
                  ${formatSolutionStepsHtml(ex.solution)}
                </div>
              </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- PART IV: SELF-ASSESSMENT & REVISION EXERCISE -->
      <div>
        <div style="font-weight:900; font-size:12.5px; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid var(--border-strong); padding-bottom:4px; margin-bottom:10px;">
          Part IV: Self-Assessment &amp; Textbook Chapter Revision Exercise
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${practiceQs
            .map(
              (pq, idx) => `<div style="padding:10px 14px; background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; font-size:12px;">
                <div style="font-weight:800; color:var(--text-primary); margin-bottom:4px;">
                  Question ${idx + 1}: ${escapeHtml(pq.question)}
                </div>
                <div style="font-size:11.5px; color:var(--callout-emerald-text); background:var(--callout-emerald-bg); border:1px solid var(--callout-emerald-border); padding:5px 10px; border-radius:6px;">
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
              ? `<tr><td colspan="12" style="text-align:center; font-weight:800; background:var(--callout-amber-bg); color:var(--callout-amber-text);">Registration &amp; Orientation Course (13/01/2026 - 28/02/2026)</td></tr>`
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
          <tr><td colspan="12" style="text-align:center; font-weight:800; background:var(--bg-elevated); color:var(--text-primary);">MID-TERM ASSESSMENT &amp; SHORT BREAK</td></tr>
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
          <tr style="background:var(--bg-elevated); color:var(--text-primary); font-weight:900;">
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
  siteResources?: SiteResourceContext,
  history: Array<{ id?: string; role: 'user' | 'ai'; text: string }> = []
): string {
  const cleanInput = (userText || '').trim();
  const lower = cleanInput.toLowerCase();

  const parsed = parseClassSubjectTopicFromPrompt(cleanInput, cls, subject);
  const effectiveCls = parsed.matchedFromPrompt
    ? parsed.cls
    : siteResources?.focusedResource?.form || parsed.cls;
  const effectiveSub = parsed.matchedFromPrompt
    ? parsed.subject
    : siteResources?.focusedResource?.subject || parsed.subject;
  const syllabusTopics = getSyllabusTopicsForClassSubject(effectiveCls, effectiveSub);
  const tbLookupQuery =
    parsed.matchedFromPrompt && parsed.topic && parsed.topic !== 'ALL'
      ? parsed.topic
      : cleanInput;
  const effectiveTbInfo = getTieTextbookChapterContent(
    effectiveCls,
    effectiveSub,
    tbLookupQuery,
    siteResources
  );
  const effectiveTopic =
    parsed.topic && parsed.topic !== 'ALL'
      ? parsed.topic
      : effectiveTbInfo.matchedChapter.replace(/^(?:Chapter\s+\d+|Sura\s+ya\s+\w+|\d+\.\d+):\s*/i, '');

  // 1. Check teacher's custom self-learning memory ("🧠 Teach AI") first
  for (const item of learnedMemory) {
    const itemTopicLower = (item.topic || '').trim().toLowerCase();
    if (!itemTopicLower) continue;
    const topicWords = itemTopicLower.split(/\s+/).filter((w) => w.length >= 3);
    const exactMatch = lower.includes(itemTopicLower) || itemTopicLower.includes(lower);
    const wordMatch =
      topicWords.length > 0 &&
      topicWords.every((w) => lower.includes(w));
    if (exactMatch || wordMatch) {
      return `🧠 **From Custom Teacher Memory — ${item.topic}:**\n\n${item.content}`;
    }
  }

  // 2. Smart Conversational, Empathy & Follow-Up Routing (never dump unrelated math chapters)
  const strippedPunct = lower.replace(/[^a-z0-9\s]/g, '').trim();

  // 2A. Personal wellbeing / feeling unwell / tired / stressed
  if (
    /\b(not\s+feeling\s+well|dont\s+feeling\s+well|don\s*t\s+feel\s+well|dont\s+feel\s+well|feeling\s+sick|i\s+am\s+sick|im\s+sick|have\s+a\s+headache|feeling\s+tired|i\s+am\s+tired|im\s+tired|feeling\s+sad|stressed|exhausted|najisikia\s+vibaya|sijisikii\s+vizuri|naumwa|nimechoka)\b/i.test(
      strippedPunct
    )
  ) {
    const isSw = /\b(najisikia|sijisikii|naumwa|nimechoka)\b/i.test(strippedPunct);
    if (isSw) {
      return `Pole sana! 💙 Afya yako ni muhimu kuliko kitu chochote. Tafadhali pumzika vizuri, kunywa maji ya kutosha, na upate matibabu ikibidi.\n\nUtakapojisikia vizuri kuendelea na masomo ya **${effectiveCls} • ${effectiveSub}**, nitakuwa hapa kukusaidia hatua kwa hatua. Nakutakia afya njema na kupona haraka!`;
    }
    return `I am so sorry to hear that you are not feeling well today! 💙 Your health always comes first.\n\nPlease take some time to rest, drink plenty of water, and take care of yourself. You don't have to force yourself to study heavy topics right now—whenever you feel better and want a light 5-minute review of **${effectiveCls} • ${effectiveSub}**, I will be right here ready to help you. Get well soon!`;
  }

  // 2B. Follow-up / "I don't understand" / "Explain simpler" / "How did you get that?"
  if (
    /^(i\s+dont\s+understand|i\s+do\s+not\s+understand|dont\s+understand|i\s+dont\s+get\s+it|i\s+am\s+confused|im\s+confused|confused|explain\s+again|explain\s+more|explain\s+simpler|make\s+it\s+simple|make\s+it\s+easier|in\s+simple\s+words|can\s+you\s+explain|how\s+did\s+you\s+get\s+that|why|how|sijaelewa|bado\s+sijaelewa|nieleweshe|fafanua|rudia|eleza\s+tena)$/i.test(
      strippedPunct
    ) ||
    /\b(i\s+don'?t\s+understand|bado\s+sijaelewa|explain\s+in\s+simple|break\s+it\s+down\s+simply)\b/i.test(lower)
  ) {
    const lastAiMsg = [...history]
      .reverse()
      .find((m) => m.role === 'ai' && m.id !== 'msg-welcome' && !m.text.includes('official-tie-doc'));

    if (lastAiMsg && lastAiMsg.text) {
      const cleanLast = lastAiMsg.text
        .replace(/<!--DIAGRAM_START-->[\s\S]*?<!--DIAGRAM_END-->/g, '')
        .replace(/<[^>]+>/g, ' ')
        .trim();

      if (cleanLast.includes('48.5') || cleanLast.toLowerCase().includes('assumed mean')) {
        return `No problem at all! Let me break down that **Assumed Mean** calculation into **3 very simple steps**:\n\n1. **What we are given:**\n   • Guessing starting point (**Assumed Mean**, $A$) $= 45.5$\n   • Total number of students/items ($\\sum f$) $= 50$\n   • Total difference from our guess ($\\sum fd$) $= 150$\n\n2. **Find the average adjustment:**\n   Divide the total difference by the total frequency:\n   $$\\frac{\\sum fd}{\\sum f} = \\frac{150}{50} = 3$$\n\n3. **Add the adjustment to the Assumed Mean:**\n   $$\\text{Actual Mean } (\\bar{x}) = 45.5 + 3 = \\mathbf{48.5}$$\n\n💡 *Think of it like this:* You guessed the average was $45.5$, and on average the scores were $3$ points higher than your guess—so $45.5 + 3 = 48.5$! Which step would you like me to explain further?`;
      }

      const lines = cleanLast
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .slice(0, 6);

      return `No problem! Let me explain **${effectiveCls} • ${effectiveSub} (${effectiveTopic})** in a much simpler, step-by-step way:\n\n1. **Core Idea in Plain Words:**\n   Instead of memorizing long formulas first, focus on what the question gives you (**Given data**) and what it wants you to find (**Target**).\n\n2. **Simplified Breakdown of the Previous Point:**\n${lines.map((l) => `   • ${l}`).join('\n')}\n\n3. **Let's Take One Small Step at a Time:**\n   Tell me which specific part or number felt confusing (for example: *"How did we get step 2?"* or *"Give me an easier example on ${effectiveTopic}"*), and I will walk through that single step slowly!`;
    }

    return `No problem at all! 😊 Let's slow down and make it super simple.\n\nWe are currently in **${effectiveCls} • ${effectiveSub}** (${effectiveTopic}). Tell me:\n• Which specific **topic, formula, or question** are you looking at right now?\n• Or type any question here and I will break it down into **easy, beginner-friendly steps**!`;
  }

  const greetingPatterns = [
    'hi',
    'hello',
    'hey',
    'hii',
    'helo',
    'good morning',
    'good afternoon',
    'good evening',
    'good day',
    'greetings',
    'hi there',
    'hello there',
    'hey there',
    'hi moha',
    'hello moha',
    'hey moha',
    'mambo',
    'habari',
    'shikamoo',
    'niaje',
    'sasa',
    'hujambo',
    'hamjambo',
  ];
  if (
    greetingPatterns.includes(strippedPunct) ||
    /^(hi|hello|hey|greetings|mambo|habari|shikamoo|good\s+(morning|afternoon|evening))(\s+moha(\s+ai)?)?$/i.test(
      strippedPunct
    )
  ) {
    if (/^(mambo|habari|shikamoo|niaje|sasa|hujambo|hamjambo)/i.test(strippedPunct)) {
      return `Habari! 👋 Karibu kwenye **Moha AI** ndani ya **Elimika Tanzania**.\n\nKwa sasa tupo kwenye **${effectiveCls} — ${effectiveSub}**. Unaweza kuniuliza swali lolote la masomo, kuomba maelezo rahisi ya mada, au kufanya maswali ya mazoezi. Nikusaidie nini leo?`;
    }
    return `Hello! 👋 Welcome to **Moha AI**, your intelligent academic assistant on **Elimika**.\n\nI noticed your current workspace is set to **${effectiveCls} — ${effectiveSub}**. How can I help you today?\n\n• **Ask a Question:** Type any topic, concept, or math/science problem for a clear step-by-step explanation.\n• **Past Paper & Book Solver:** Ask for worked solutions on any syllabus topic or past paper.\n• **Teacher Studio:** Switch to **Studio & Docs** to generate and download official 4-Stage TIE Lesson Plans or 12-Col PO-RALG Schemes of Work.`;
  }

  if (
    /^(how are you|how are you doing|how are you holding up|how is it going|how is your day|how do you do|whats up|what is up|are you there|are you online|habari yako|unaendeleaje|uko poa|kwa hali)\b/i.test(
      strippedPunct
    )
  ) {
    return `I am doing great and ready to help! 😊\n\nWe are currently focusing on **${effectiveCls} — ${effectiveSub}**, or you can ask me about any Primary (Std 1–7), Secondary (Form 1–4), or Advanced (Form 5–6) subject. What would you like to work on?`;
  }

  if (
    /^(who are you|what are you|what is your name|introduce yourself|tell me about yourself|what is moha|what is moha ai|what is elimika|wewe ni nani)$/i.test(
      strippedPunct
    )
  ) {
    return `I am **Moha AI**, the built-in educational tutor and teacher studio engine for **Elimika**.\n\n**What I can do for you:**\n1. **Step-by-Step Tutoring:** Explain any Primary, O-Level, or A-Level topic in clear English or Kiswahili with worked examples and diagrams.\n2. **Teacher Document Studio:** Instantly generate official **4-Stage TIE Lesson Plans**, **12-Column PO-RALG Schemes of Work**, **Lesson Notes**, and **Log Books** with 1-click PDF export.`;
  }

  if (
    /^(help|what can you do|how to use|how does this work|commands|options|features|nisaidie|msaada)$/i.test(
      strippedPunct
    )
  ) {
    return `Here is how to get the most out of **Moha AI**:\n\n• **Ask Anything:** e.g., *"Explain Newton's Second Law"*, *"Solve 2x + 5 = 15"*, or *"What is photosynthesis?"*\n• **Daily Quiz:** Click **🎯 Daily Quiz** in the top bar for NECTA practice questions.\n• **Official Teacher Documents:** Use **📘 Studio & Docs** (**Lesson Plan**, **Scheme of Work**, **Notes**, **Log Book**) to generate printable A4 PDFs.`;
  }

  if (
    /^(thank you|thanks|thank u|thx|ty|thanks a lot|thank you so much|ok|okay|got it|understood|nice|great|awesome|cool|perfect|asante|asante sana|sawa|poa|vizuri|bye|good night|see you)$/i.test(
      strippedPunct
    )
  ) {
    return `You're very welcome! 😊 Let me know whenever you have another question, need practice problems, or want to generate a Lesson Plan or Scheme of Work.`;
  }

  if (lower.includes('lesson plan') && (lower.includes('create') || lower.includes('prepare') || lower.includes('generate') || lower.includes('make') || lower.includes('write'))) {
    return buildInstantOfficialDocument('lessonplan', {
      school: 'ELIMIKA SECONDARY SCHOOL',
      teacher: 'SUBJECT TEACHER',
      cls: effectiveCls,
      subject: effectiveSub,
      topic: effectiveTbInfo.matchedChapter || syllabusTopics[0] || `${effectiveSub} Core Topic`,
      subTopic: cleanInput.replace(/create|prepare|generate|make|write|a|lesson plan|for|on/gi, '').trim() || effectiveTopic,
      date: new Date().toISOString().split('T')[0],
      siteResources,
    });
  }

  if (lower.includes('scheme of work') && (lower.includes('create') || lower.includes('prepare') || lower.includes('generate') || lower.includes('make') || lower.includes('write'))) {
    return buildInstantOfficialDocument('schemeofwork', {
      school: 'ELIMIKA SECONDARY SCHOOL',
      teacher: 'SUBJECT TEACHER',
      cls: effectiveCls,
      subject: effectiveSub,
      topic: effectiveTbInfo.matchedChapter || syllabusTopics[0] || `${effectiveSub} Core Topic`,
      subTopic: cleanInput.replace(/create|prepare|generate|make|write|a|scheme of work|for|on/gi, '').trim() || effectiveTopic,
      date: new Date().toISOString().split('T')[0],
      siteResources,
    });
  }

  if (lower.includes('lesson note') || lower.includes('prepare notes') || lower.includes('topic notes')) {
    return buildInstantOfficialDocument('lessonnotes', {
      school: 'ELIMIKA SECONDARY SCHOOL',
      teacher: 'SUBJECT TEACHER',
      cls: effectiveCls,
      subject: effectiveSub,
      topic: effectiveTbInfo.matchedChapter || syllabusTopics[0] || `${effectiveSub} Core Topic`,
      subTopic: cleanInput.replace(/lesson notes|prepare notes|topic notes/gi, '').trim() || effectiveTopic,
      date: new Date().toISOString().split('T')[0],
      siteResources,
    });
  }

  // Simultaneous equations solver: e.g., "2x + y = 5 and x + 2y = 4"
  const simulMatch = cleanInput.match(
    /([+-]?\d*)x\s*([+-]\s*\d*)y\s*=\s*([+-]?\d+(?:\.\d+)?)\s*(?:,|and|;|\n)\s*([+-]?\d*)x\s*([+-]\s*\d*)y\s*=\s*([+-]?\d+(?:\.\d+)?)/i
  );
  if (simulMatch) {
    const parseCoef = (s: string) => {
      const cleaned = s.replace(/\s+/g, '');
      if (cleaned === '' || cleaned === '+') return 1;
      if (cleaned === '-') return -1;
      return parseFloat(cleaned);
    };
    const a1 = parseCoef(simulMatch[1]);
    const b1 = parseCoef(simulMatch[2]);
    const c1 = parseFloat(simulMatch[3]);
    const a2 = parseCoef(simulMatch[4]);
    const b2 = parseCoef(simulMatch[5]);
    const c2 = parseFloat(simulMatch[6]);
    const det = a1 * b2 - a2 * b1;
    if (det !== 0 && !Number.isNaN(det)) {
      const xVal = (c1 * b2 - c2 * b1) / det;
      const yVal = (a1 * c2 - a2 * c1) / det;
      return `**Step 1 (Write the System of Linear Equations):**\n$$\\begin{cases} ${a1}x + (${b1})y = ${c1} \\\\ ${a2}x + (${b2})y = ${c2} \\end{cases}$$\n**Step 2 (Elimination / Cramer's Determinant):**\n$$\\Delta = (${a1})(${b2}) - (${a2})(${b1}) = ${det}$$\n$$x = \\frac{(${c1})(${b2}) - (${c2})(${b1})}{${det}} = ${xVal}, \\quad y = \\frac{(${a1})(${c2}) - (${a2})(${c1})}{${det}} = ${yVal}$$\n\n**Final Answer:** $$\\mathbf{x = ${xVal}, \\quad y = ${yVal}}$$`;
    }
  }

  // Linear equation solver (supports variables on both sides: ax + b = cx + d or ax + b = c)
  const twoSideLinearMatch = cleanInput.match(
    /(?:solve\s+)?([+-]?\d*)x\s*([+-]\s*\d+)?\s*=\s*([+-]?\d*)x\s*([+-]\s*\d+)/i
  );
  if (twoSideLinearMatch && !cleanInput.includes('x^2')) {
    const parseCoef = (s?: string) => {
      const cleaned = (s || '').replace(/\s+/g, '');
      if (cleaned === '' || cleaned === '+') return 1;
      if (cleaned === '-') return -1;
      return parseFloat(cleaned);
    };
    const a = parseCoef(twoSideLinearMatch[1]);
    const b = twoSideLinearMatch[2] ? parseFloat(twoSideLinearMatch[2].replace(/\s+/g, '')) : 0;
    const c = parseCoef(twoSideLinearMatch[3]);
    const d = parseFloat(twoSideLinearMatch[4].replace(/\s+/g, ''));
    if (a - c !== 0 && !Number.isNaN(a) && !Number.isNaN(c) && !Number.isNaN(d)) {
      const netCoef = a - c;
      const netRhs = d - b;
      const xVal = netRhs / netCoef;
      return `**Step 1 (Collect $x$ terms on the left and constants on the right):**\n$$(${a} - ${c})x = ${d} - (${b}) \\implies ${netCoef}x = ${netRhs}$$\n**Step 2 (Divide both sides by $${netCoef}$):**\n$$x = \\frac{${netRhs}}{${netCoef}} = ${xVal}$$\n\n**Final Answer:** $$\\mathbf{x = ${xVal}}$$`;
    }
  }

  // Linear equation solver: e.g., "solve 2x + 5 = 15"
  const linearEqMatch = cleanInput.match(/(?:solve\s+)?([+-]?\d*)x\s*([+-]\s*\d+)\s*=\s*([+-]?\d+)/i);
  if (linearEqMatch && !cleanInput.includes('x^2')) {
    const a = parseFloat(linearEqMatch[1] || '1');
    const b = parseFloat(linearEqMatch[2].replace(/\s+/g, ''));
    const c = parseFloat(linearEqMatch[3]);
    if (a !== 0 && !Number.isNaN(a) && !Number.isNaN(b) && !Number.isNaN(c)) {
      const rhs = c - b;
      const xVal = rhs / a;
      return `**Step 1:** Isolate the variable term $${a}x$:\n$$${a}x = ${c} - (${b}) = ${rhs}$$\n**Step 2:** Divide both sides by $${a}$:\n$$x = \\frac{${rhs}}{${a}} = ${xVal}$$\n\n**Final Answer:** $$\\mathbf{x = ${xVal}}$$`;
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
      return `**Step 1 (Coefficients & Discriminant):** $a = ${a},\\; b = ${b},\\; c = ${c}$\n$$\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${disc}$$\n**Step 2 (Quadratic Formula):**\n$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{${-b} \\pm ${Math.sqrt(disc)}}{${2 * a}}$$\n\n**Final Answer:** $$\\mathbf{x_1 = ${r1}, \\quad x_2 = ${r2}}$$`;
    }
  }

  // Coordinate geometry gradient & line solver: e.g., "line passing through (1, 2) and (4, 8)"
  const twoPointsMatch = cleanInput.match(
    /\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\)\s*(?:and|to|,)\s*\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\)/i
  );
  if (twoPointsMatch) {
    const x1 = parseFloat(twoPointsMatch[1]);
    const y1 = parseFloat(twoPointsMatch[2]);
    const x2 = parseFloat(twoPointsMatch[3]);
    const y2 = parseFloat(twoPointsMatch[4]);
    if (x2 !== x1) {
      const m = (y2 - y1) / (x2 - x1);
      const c = y1 - m * x1;
      const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
      return `**Step 1 (Find the Gradient $m$):**\n$$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = \\frac{${y2 - y1}}{${x2 - x1}} = ${m}$$\n**Step 2 (Find the Equation of the Straight Line $y = mx + c$):**\n$$y - (${y1}) = ${m}(x - (${x1})) \\implies y = ${m}x ${cSign}$$\n\n**Final Answer:** **Gradient $m = ${m}$, Equation: $y = ${m}x ${cSign}$**`;
    }
  }

  // Percentage Solver: e.g., "what is 15% of 240"
  const pctMatch = cleanInput.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const total = parseFloat(pctMatch[2]);
    const result = (pct / 100) * total;
    return `**Step 1:** Convert $${pct}\\%$ to a fraction: $\\frac{${pct}}{100} = ${pct / 100}$\n**Step 2:** Multiply by $${total}$:\n$$\\frac{${pct}}{100} \\times ${total} = ${result}$$\n\n**Final Answer:** $$\\mathbf{${result}}$$`;
  }

  // Universal Arithmetic Evaluator
  const sanitizedMath = cleanInput
    .replace(/^(?:what\s+is|calculate|evaluate|solve|find|compute)\s+/i, '')
    .replace(/\?+$/, '')
    .replace(/\^/g, '**')
    .trim();
  if (/^[0-9+\-*/().\s*]+$/.test(sanitizedMath) && /[+\-*/]/.test(sanitizedMath)) {
    try {
      const val = Function(`"use strict"; return (${sanitizedMath});`)();
      if (typeof val === 'number' && Number.isFinite(val)) {
        const displayExpr = sanitizedMath.replace(/\*\*/g, '^');
        return `**Expression:** $$${displayExpr}$$\n**Final Answer:** $$\\mathbf{${val}}$$`;
      }
    } catch {
      // Fall through
    }
  }

  // If the user uploaded a photo with the default "Solve this question step-by-step." prompt and the AI vision call timed out
  if (/^solve\s+this\s+question\s+step-by-step\.?$/i.test(cleanInput)) {
    return `📷 **Image Upload Notice:** Your question photo took too long to upload over the current mobile connection, or the AI Vision service timed out.\n\n**How to get your instant step-by-step solution right now:**\n1. **Tap Send again** (images are now automatically compressed for faster mobile upload), **OR**\n2. **Type or dictate (🎤) the question text** (for example: *"Solve 2x + y = 5 and x + 2y = 4"* or *"Find the inverse of f(x) = 3x - 5"*) and Moha AI will solve every part step-by-step immediately!`;
  }

  const explicitlyWantsDiagram = /\b(draw|chora|sketch|diagram|mchoro|plot\s+a\s+graph)\b/i.test(lower);
  const explicitlyWantsChapters =
    /\b(chapters|table of contents|syllabus|show me the official tie textbook chapters)\b/i.test(lower);

  for (const entry of MOHA_BUILTIN_KNOWLEDGE) {
    if (entry.keywords.some((kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(lower))) {
      const diagHtml = explicitlyWantsDiagram
        ? `\n\n<!--DIAGRAM_START-->${renderTopicDiagramBlockHtml(
            effectiveCls,
            effectiveSub,
            effectiveTbInfo.matchedChapter || entry.title,
            parsed.subTopic || effectiveTopic
          )}<!--DIAGRAM_END-->`
        : '';
      return `📘 **${effectiveCls} ${effectiveSub} — ${entry.title}**\n\n${entry.content}${diagHtml}`;
    }
  }

  // If a specific document/paper has extracted text in customContent, solve directly from that document's text
  const focusedDoc = siteResources?.focusedResource;
  if (focusedDoc && focusedDoc.customContent && focusedDoc.customContent.trim().length > 80) {
    const cleanExcerpt = focusedDoc.customContent.trim().slice(0, 4500);
    return `📄 **${focusedDoc.title} (${focusedDoc.form} ${focusedDoc.subject} · ${focusedDoc.year})**\n\n**Extracted Paper Content & Questions:**\n${cleanExcerpt}`;
  }

  if ((lower === 'marking scheme' || lower === 'prepare marking scheme') && !lower.includes('solve')) {
    return buildInstantOfficialDocument('markingscheme', {
      school: 'ELIMIKA SECONDARY SCHOOL',
      teacher: 'SUBJECT EXAMINER',
      cls: effectiveCls,
      subject: effectiveSub,
      topic: effectiveTbInfo.matchedChapter || syllabusTopics[0] || `${effectiveSub} Core Topic`,
      subTopic: cleanInput.slice(0, 65),
      date: new Date().toISOString().split('T')[0],
      siteResources,
    });
  }

  if (explicitlyWantsChapters) {
    return effectiveTbInfo.chapterSummaryMarkdown;
  }

  const topicQuiz = buildContentIntegratedQuizQuestions(
    effectiveCls,
    effectiveSub,
    effectiveTopic,
    siteResources,
    parsed.subTopic
  );

  // Match the questions in topicQuiz that are closest to the user's specific query words
  const queryWords = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !['what', 'explain', 'give', 'from', 'with', 'question', 'questions', 'solve', 'about'].includes(w));

  const scoredQuiz = topicQuiz
    .map((q, idx) => {
      const hay = `${q.question} ${q.explanation} ${q.options[q.correctIndex]}`.toLowerCase();
      let score = 0;
      for (const w of queryWords) {
        if (hay.includes(w)) score += 3;
      }
      return { q, score, idx };
    })
    .sort((a, b) => b.score - a.score || a.idx - b.idx);

  const selectedItems = scoredQuiz.slice(0, 4).map((x) => x.q);

  if (
    lower.includes('quiz') ||
    lower.includes('test me') ||
    lower.includes('maswali') ||
    lower.includes('practice') ||
    lower.includes('5 high-yield') ||
    lower.includes('exercise')
  ) {
    const formattedQuestions = scoredQuiz
      .slice(0, 5)
      .map(
        ({ q }, idx) =>
          `**${idx + 1}. ${q.question}**\n• **Working / Explanation:** ${q.explanation}\n• **Verified Answer:** **${
            q.options[q.correctIndex]
          }**`
      )
      .join('\n\n');

    return `📘 **${effectiveCls} • ${effectiveSub} (${effectiveTopic}) — Worked NECTA Competence Questions:**\n\n${formattedQuestions}`;
  }

  const diagramBlock = explicitlyWantsDiagram
    ? `\n\n<!--DIAGRAM_START-->${renderTopicDiagramBlockHtml(
        effectiveCls,
        effectiveSub,
        effectiveTbInfo.matchedChapter,
        parsed.subTopic || effectiveTopic
      )}<!--DIAGRAM_END-->`
    : '';

  const subTopicsSummary =
    effectiveTbInfo.subTopicsList.length > 0
      ? `**Core Sub-Topics & Key Concepts (${effectiveTbInfo.matchedChapter}):**\n${effectiveTbInfo.subTopicsList
          .map((st, idx) => `${idx + 1}. **${st}**`)
          .join('\n')}\n\n`
      : '';

  const workedBreakdown = selectedItems
    .slice(0, 3)
    .map(
      (item, idx) =>
        `**${idx + 1}. ${item.question}**\n• **Step-by-Step Analysis:** ${item.explanation}\n• **Key Takeaway / Answer:** **${item.options[item.correctIndex]}**`
    )
    .join('\n\n');

  return `📘 **${effectiveCls} • ${effectiveSub} — ${effectiveTopic}**\n\n${subTopicsSummary}**Worked Competence Examples & Analysis:**\n\n${workedBreakdown}${diagramBlock}`;
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
  let cls = normalizeClassName(defaultCls || 'Form 3');
  let subject = normalizeSubjectName(defaultSubject || 'Basic Mathematics');
  let matchedFromPrompt = false;

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hasWordPhrase = (text: string, phrase: string): boolean => {
    const cleanP = phrase.trim();
    if (!cleanP) return false;
    return new RegExp(`\\b${escapeRegex(cleanP)}\\b`, 'i').test(text);
  };

  // 1. Detect explicit Class in prompt (e.g., "Form 1", "Form 2", "Standard 7", "Std 4", "Kidato cha 1")
  const formMatch = lower.match(
    /\b(?:form|kidato\s*cha)\s*([1-6]|one|two|three|four|five|six|kwanza|pili|tatu|nne|tano|sita|i|ii|iii|iv|v|vi)\b/i
  );
  const stdMatch = lower.match(
    /\b(?:standard|std|darasa\s*la)\s*([1-7]|one|two|three|four|five|six|seven|kwanza|pili|tatu|nne|tano|sita|saba)\b/i
  );
  const wordToNum: Record<string, string> = {
    one: '1', kwanza: '1',
    two: '2', pili: '2',
    three: '3', tatu: '3',
    four: '4', nne: '4',
    five: '5', tano: '5',
    six: '6', sita: '6',
    seven: '7', saba: '7',
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

  // 2. Detect explicit Subject in prompt ONLY using strict word boundaries so "ics" NEVER matches "physics", "civics", "topics", or "mathematics"
  const subjectAliases: Array<{ keywords: string[]; target: string }> = [
    { keywords: ['historia ya tanzania na maadili', 'historia ya tanzania', 'htm'], target: 'Historia ya Tanzania na Maadili' },
    { keywords: ['additional mathematics', 'additional math', 'aditional mathematics'], target: 'Additional Mathematics' },
    { keywords: ['advanced mathematics', 'advanced math', 'pure mathematics', 'pure math'], target: 'Advanced Mathematics' },
    { keywords: ['basic applied mathematics', 'basic applied math', 'bam'], target: 'Basic Applied Mathematics (BAM)' },
    { keywords: ['basic mathematics', 'mathematics', 'maths', 'math', 'hisabati'], target: 'Basic Mathematics' },
    { keywords: ['business studies', 'bussiness studies'], target: 'Business Studies' },
    { keywords: ['computer science', 'information and computer studies', 'ict', 'ics', 'tehama'], target: 'Computer Science' },
    { keywords: ['home economics', 'food and human nutrition', 'food and human nutritions'], target: 'Home Economics' },
    { keywords: ['book-keeping', 'book keeping', 'bookkeeping'], target: 'Book-Keeping' },
    { keywords: ['literature in english'], target: 'Literature in English' },
    { keywords: ['physics', 'fizikia'], target: 'Physics' },
    { keywords: ['chemistry', 'kemia'], target: 'Chemistry' },
    { keywords: ['biology', 'baiolojia'], target: 'Biology' },
    { keywords: ['geography', 'jiografia'], target: 'Geography' },
    { keywords: ['history'], target: 'History' },
    { keywords: ['agriculture', 'kilimo'], target: 'Agriculture' },
    { keywords: ['commerce'], target: 'Commerce' },
    { keywords: ['accountancy'], target: 'Accountancy' },
    { keywords: ['economics', 'uchumi'], target: 'Economics' },
    { keywords: ['civics', 'uraia na maadili', 'uraia'], target: 'Civics' },
    { keywords: ['kiswahili', 'fasihi ya kiswahili', 'fasihi simulizi', 'sarufi'], target: 'Kiswahili' },
    { keywords: ['english language', 'english'], target: 'English Language' },
    { keywords: ['sayansi na teknolojia'], target: 'Sayansi na Teknolojia' },
    { keywords: ['maarifa ya jamii'], target: 'Maarifa ya Jamii' },
    { keywords: ['general studies'], target: 'General Studies' },
  ];

  let explicitSubjectFound = false;
  for (const alias of subjectAliases) {
    if (alias.keywords.some((kw) => hasWordPhrase(lower, kw))) {
      const classSubjects = TIE_CURRICULUM_SUBJECTS[cls] || [];
      const exactInClass = classSubjects.find((s) => matchesSubjectQuery(s, alias.target));
      subject = exactInClass || alias.target;
      explicitSubjectFound = true;
      matchedFromPrompt = true;
      break;
    }
  }

  // 3. Detect Topic / Chapter from prompt across current class first
  const currentTopics = getSyllabusTopicsForClassSubject(cls, subject);
  let matchedTopic = '';

  // 3a. Check if the user explicitly specified a Chapter number (e.g., "Chapter 2", "Sura ya Pili", "Topic 3")
  const chapNumMatch = lower.match(
    /\b(?:chapter|sura\s+ya|topic|unit)\s*(?:(\d+)|(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|kwanza|pili|tatu|nne|tano|sita|saba|nane))\b/i
  );
  const chapWordMap: Record<string, number> = {
    one: 1, kwanza: 1,
    two: 2, pili: 2,
    three: 3, tatu: 3,
    four: 4, nne: 4,
    five: 5, tano: 5,
    six: 6, sita: 6,
    seven: 7, saba: 7,
    eight: 8, nane: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
  };
  if (chapNumMatch) {
    const idx = chapNumMatch[1]
      ? parseInt(chapNumMatch[1], 10) - 1
      : (chapWordMap[chapNumMatch[2].toLowerCase()] || 1) - 1;
    if (idx >= 0 && idx < currentTopics.length) {
      matchedTopic = currentTopics[idx].replace(/^\d+\.\d+\s*/, '');
      matchedFromPrompt = true;
    }
  }

  const promptStopWords = new Set([
    'and', 'the', 'for', 'with', 'into', 'from', 'explain', 'official', 'textbook',
    'student', 'book', 'tie', 'including', 'sub', 'topics', 'definitions', 'formulas',
    'step', 'worked', 'examples', 'necta', 'examination', 'questions', 'syllabus',
    'competences', 'integrated', 'website', 'resources', 'what', 'are', 'give', 'show',
    'summary', 'summarize', 'notes', 'form', 'standard', 'chapter', 'chapters', 'sura',
    'meaning', 'concept', 'introduction', 'want', 'learn', 'between', 'other', 'subjects',
  ]);

  const scoreTopicMatch = (topicStr: string, queryLower: string): number => {
    const cleanT = topicStr.replace(/^(?:Chapter\s+\d+|Sura\s+ya\s+\w+|\d+\.\d+):\s*/i, '').toLowerCase();
    const words = Array.from(
      new Set(
        cleanT
          .replace(/[(),&/-]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length >= 3 && !promptStopWords.has(w))
      )
    );
    let score = 0;
    for (const w of words) {
      if (hasWordPhrase(queryLower, w)) {
        score += 4;
      } else if (w.endsWith('s') && w.length >= 5 && hasWordPhrase(queryLower, w.slice(0, -1))) {
        score += 3;
      }
    }
    return score;
  };

  let bestScore = 0;
  if (!matchedTopic) {
    for (const t of currentTopics) {
      const sc = scoreTopicMatch(t, lower);
      if (sc > bestScore) {
        bestScore = sc;
        matchedTopic = t.replace(/^\d+\.\d+\s*/, '');
      }
    }
  }

  // If no strong topic matched in current class, check Form 1 -> Form 2 -> Form 3 -> Form 4 -> others within the SAME subject
  if (!explicitClassFound && bestScore < 8) {
    const orderedClasses = [
      'Form 1',
      'Form 2',
      'Form 3',
      'Form 4',
      'Form 5',
      'Form 6',
      ...Object.keys(TIE_CURRICULUM_SUBJECTS),
    ];
    const seenCls = new Set<string>();
    for (const candidateCls of orderedClasses) {
      if (seenCls.has(candidateCls)) continue;
      seenCls.add(candidateCls);
      const candidateTopics = getSyllabusTopicsForClassSubject(candidateCls, subject);
      for (const t of candidateTopics) {
        const sc = scoreTopicMatch(t, lower);
        if (sc >= 4 && sc > bestScore) {
          bestScore = sc;
          matchedTopic = t.replace(/^\d+\.\d+\s*/, '');
          cls = candidateCls;
          matchedFromPrompt = true;
        }
      }
    }
  }

  // Check cross-subject & authoritative TIE Textbook topic map (automatically maps topics like Rate and Variation -> Form 2)
  const directTopicMap: Array<{
    keywords: string[];
    topic: string;
    defaultForm?: string;
    subjects: string[];
  }> = [
    { keywords: ['relationship between mathematics and other subjects', 'relationships between mathematics and other subjects', 'mathematics and other subjects', 'concept of mathematics', 'branches of mathematics', 'importance of mathematics'], topic: 'Chapter 1: Concept of Mathematics (Meaning of Mathematics, Branches of Mathematics, Relationship Between Mathematics and Other Subjects & Importance of Mathematics)', defaultForm: 'Form 1', subjects: ['Basic Mathematics'] },
    { keywords: ['rate and variation', 'rates and variations', 'direct variation', 'inverse variation', 'joint variation', 'partial variation', 'varies directly', 'varies inversely'], topic: 'Chapter 1: Rates and Variations (Rates of Quantities, Direct Variation, Inverse Variation, Joint Variation & Partial Variation)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['congruence', 'congruent triangles', 'postulates of congruence'], topic: 'Chapter 2: Congruence and Similarity (Congruence of Triangles, Postulates SAS/ASA/SSS/RHS & Similarity of Polygons)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['pythagoras', 'hypotenuse'], topic: 'Chapter 3: Pythagoras Theorem (Proof of Pythagoras Theorem & Real-Life Right-Angled Triangle Applications)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['quadratic equation', 'completing the square', 'discriminant', 'difference of two squares'], topic: 'Chapter 4: Quadratic Equations (Algebraic Expressions, Factorisation, Completing the Square & General Quadratic Formula)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['exponent', 'indices', 'radicals', 'surds'], topic: 'Chapter 5: Exponents and Radicals (Laws of Exponents/Indices, Simplifying Radicals/Surds & Rationalising the Denominator)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['logarithm', 'standard form', 'antilog'], topic: 'Chapter 6: Logarithms (Standard Form A × 10^n, Laws of Logarithms & Mathematical Tables)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['venn diagram', 'subset', 'union of sets', 'intersection of sets'], topic: 'Chapter 7: Sets (Description of Sets, Types of Sets, Subsets, Power Sets, Venn Diagrams, Union, Intersection & Complement)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['trigonometry', 'sine rule', 'cosine rule', 'angle of elevation', 'angle of depression', 'trigonometric ratios'], topic: 'Chapter 8: Trigonometry (Trigonometric Ratios Sine, Cosine & Tangent, Special Angles 30°, 45°, 60° & Angles of Elevation and Depression)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['domain and range', 'inverse relation', 'types of relations', 'meaning of a relation'], topic: 'Chapter 1: Relations (Meaning of a Relation, Types of Relations, Domain and Range of a Relation, Graphs of Relations & Inverse of a Relation)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
    { keywords: ['composite function', 'inverse function', 'polynomial function'], topic: 'Chapter 2: Functions (Concept of Function, Linear, Quadratic, Polynomial, Step & Absolute Value Functions, Inverse Functions)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['linear programming', 'feasible region', 'objective function'], topic: 'Chapter 3: Linear Programming (Formulating Simultaneous Linear Inequalities, Objective Function, Feasible Region & Optimal Value)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['arithmetic mean', 'assumed mean', 'median', 'mode', 'histogram', 'ogive', 'cumulative frequency', 'statistics'], topic: 'Chapter 6: Statistics (Mean, Median, Mode for Grouped & Ungrouped Data, Assumed Mean, Histograms, Frequency Polygons & Cumulative Frequency Curve/Ogive)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Geography', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['arithmetic progression', 'geometric progression', 'compound interest', 'sequences and series'], topic: 'Chapter 4: Sequences and Series (Sequences, Series, Arithmetic Progression AP, Arithmetic Mean, Geometric Progression GP, Geometric Mean & Compound Interest)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['chord properties', 'cyclic quadrilateral', 'tangent theorem'], topic: 'Chapter 5: Circles (Concept of a Circle, Central Angles, Arc Length of a Circle, Radian Measure, Angle Properties of Circles, Cyclic Quadrilaterals, Chord Properties & Tangent Properties of Circles)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
    { keywords: ['earth as a sphere', 'nautical mile', 'great circle', 'small circle'], topic: 'Chapter 7: The Earth as a Sphere & Accounts (Great & Small Circles, Latitudes & Longitudes, Distance in Kilometres & Nautical Miles; Double Entry Principle, Cash Book, Ledger, Trial Balance & Financial Statements)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
    { keywords: ['determinant', 'cramer', 'singular matrix', 'inverse matrix', 'matrices'], topic: 'Chapter 7: Matrices and Transformations (2×2 Matrix Operations, Determinant, Inverse Matrix, Simultaneous Equations & Linear Transformations)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Additional Mathematics', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['position vector', 'unit vector', 'dot product'], topic: 'Chapter 6: Vectors (Displacement & Position Vectors, Magnitude & Direction, Vector Addition, Scalar Multiplication & Bearings)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Physics', 'Additional Mathematics'] },
    { keywords: ['mutually exclusive', 'independent events', 'tree diagram', 'probability'], topic: 'Chapter 4: Probability (Sample Space, Event Probability, Mutually Exclusive Events, Independent Events & Tree Diagrams)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['simultaneous equation', 'linear equation', 'linear inequality'], topic: 'Chapter 5: Algebra (Algebraic Expressions, Simplifying Algebraic Fractions, Linear Equations in One Unknown, Equations Involving Absolute Values, Linear Simultaneous Equations by Elimination & Substitution, Word Problems & Inequalities in One Unknown)', defaultForm: 'Form 1', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['ratios and proportions', 'third proportional', 'fourth proportional', 'sharing in ratio'], topic: 'Chapter 4: Ratios and Proportions (Ratios, Combining Ratios A : B : C, Sharing in a Given Ratio, Direct and Inverse Proportions, Map Scales & Third/Fourth Proportionals)', defaultForm: 'Form 1', subjects: ['Basic Mathematics'] },
    { keywords: ['coordinate geometry', 'gradient of a line', 'equation of a line', 'parallel and perpendicular lines'], topic: 'Chapter 6: Coordinate Geometry (Basic Concepts of Coordinate Geometry, Quadrants & Polygons on the xy-Plane, Gradient/Slope of a Straight Line, Equation of a Straight Line y = mx + c, General Equation ax + by + c = 0, x- and y-Intercepts, Graphing Linear Equations & Solving Simultaneous Equations Graphically)', defaultForm: 'Form 1', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['integration', 'integral', 'integrals', 'indefinite integral', 'definite integral', 'area under a curve', 'volume of revolution', 'antiderivative'], topic: 'Chapter 1: Integration (Indefinite & Definite Integrals, Area Under a Curve, Volume of Revolution & Kinematics)', defaultForm: 'Form 4', subjects: ['Additional Mathematics', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Basic Mathematics'] },
    { keywords: ['differentiation', 'differentiate', 'derivative', 'derivatives', 'first principles', 'chain rule', 'product rule', 'quotient rule', 'stationary point', 'turning point', 'tangent and normal', 'calculus'], topic: 'Chapter 6: Differentiation (Derivative of a Function, First Principles, Power Rule, Chain Rule, Product Rule, Quotient Rule, Derivatives of Trigonometric Functions, Rates of Change, Turning Points, Curve Sketching, Tangents & Normals)', defaultForm: 'Form 3', subjects: ['Additional Mathematics', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Basic Mathematics'] },
    { keywords: ['double entry', 'trial balance', 'ledger', 'balance sheet'], topic: 'Chapter 7: The Earth as a Sphere & Accounts (Great & Small Circles, Latitudes & Longitudes, Distance in Kilometres & Nautical Miles; Double Entry Principle, Cash Book, Ledger, Trial Balance & Financial Statements)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Book-Keeping', 'Business Studies', 'Accountancy'] },
    { keywords: ['ohm law', "ohm's law", 'resistor', 'current electricity'], topic: 'Chapter 2: Current Electricity (Concept of Current Electricity, Ohm Law V = IR, Resistance to an Electric Current, Series/Parallel Resistors, Heating Effect of an Electric Current, Electrical Installations & Cells)', defaultForm: 'Form 2', subjects: ['Physics'] },
    { keywords: ['archimedes', 'law of flotation', 'upthrust', 'relative density'], topic: 'Chapter 6: Archimedes Principle and the Law of Floatation (Concept of Upthrust, Archimedes Principle, Apparent Weight, Law of Floatation & Hydrometer)', defaultForm: 'Form 1', subjects: ['Physics'] },
    { keywords: ['newton law', "newton's law", 'uniformly accelerated', 'linear momentum'], topic: 'Chapter 7: Forces in Equilibrium, Simple Machines & Linear Motion (Moment of a Force, Principle of Moments, Centre of Gravity, Levers, Pulleys, Equations of Uniformly Accelerated Motion, Newton Laws of Motion, Temperature & Sustainable Energy)', defaultForm: 'Form 2', subjects: ['Physics'] },
    { keywords: ['mechanical advantage', 'velocity ratio', 'simple machine', 'pulley'], topic: 'Chapter 7: Forces in Equilibrium, Simple Machines & Linear Motion (Moment of a Force, Principle of Moments, Centre of Gravity, Levers, Pulleys, Equations of Uniformly Accelerated Motion, Newton Laws of Motion, Temperature & Sustainable Energy)', defaultForm: 'Form 2', subjects: ['Physics'] },
    { keywords: ['snell law', 'refractive index', 'total internal reflection', 'curved mirror'], topic: 'Chapter 3: Light (Reflection at Curved Mirrors, Mirror Formula 1/f = 1/u + 1/v, Refraction of Light, Snell Law, Total Internal Reflection, Lenses & Dispersion)', defaultForm: 'Form 3', subjects: ['Physics'] },
    { keywords: ['specific heat capacity', 'latent heat', 'thermal expansion'], topic: 'Chapter 7: Measurement of Thermal Energy (Heat Capacity C = mc, Specific Heat Capacity Q = mcΔθ, Change of State & Specific Latent Heat Q = mL)', defaultForm: 'Form 3', subjects: ['Physics'] },
    { keywords: ['radioactivity', 'half-life', 'half life', 'alpha particle', 'beta particle'], topic: 'Chapter 3: Radioactivity (Structure of the Nucleus, Isotopes, Alpha, Beta & Gamma Radiation, Nuclear Equations, Half-Life Calculations, Nuclear Fission & Fusion)', defaultForm: 'Form 4', subjects: ['Physics', 'Chemistry'] },
    { keywords: ['mole concept', 'molar mass', 'stoichiometry', 'avogadro', 'empirical formula'], topic: 'Chapter 4: The Mole Concept and Related Calculations (Avogadro Constant, Molar Mass, Molar Gas Volume at STP 22.4 dm³ & Stoichiometric Reacting Masses)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
    { keywords: ['titration', 'molarity', 'volumetric analysis'], topic: 'Chapter 5: Volumetric Analysis (Standard Solutions, Acid-Base Titration Apparatus, Choice of Indicators, Molarity M = conc/Mr & Percentage Purity/Water of Crystallisation)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
    { keywords: ['electrolysis', 'faraday', 'cathode', 'anode'], topic: 'Chapter 6: Ionic Theory and Electrolysis (Electrolytes vs Non-Electrolytes, Preferential Discharge of Ions, Faraday First & Second Laws of Electrolysis & Industrial Applications)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
    { keywords: ['homologous series', 'alkane', 'alkene', 'alkyne', 'carboxylic acid'], topic: 'Chapter 2: Introduction to Organic Chemistry (Homologous Series, Isomerism, Alkanes, Alkenes, Alkynes, Alcohols/Alkanols, Carboxylic Acids/Alkanoic Acids, Esterification & Soap/Polymers)', defaultForm: 'Form 4', subjects: ['Chemistry'] },
    { keywords: ['photosynthesis', 'digestive system', 'food test', 'balanced diet'], topic: 'Chapter 1: Nutrition in Animals and Plants (Concept of Nutrition, Nutrients, Balanced Diet, Nutritional Requirements, Nutritional Deficiencies, Biochemical Food Tests & Photosynthesis)', defaultForm: 'Form 2', subjects: ['Biology'] },
    { keywords: ['osmosis', 'transpiration', 'xylem', 'phloem', 'mammalian heart'], topic: 'Chapter 4: Transport of Materials in Flowering Plants (The Vascular System: Xylem and Phloem, Absorption and Movement of Water and Mineral Salts, Transpiration & Guttation)', defaultForm: 'Form 2', subjects: ['Biology'] },
    { keywords: ['mendel', 'monohybrid', 'punnett', 'sex-linked', 'genetics'], topic: 'Chapter 2: Genetics (Hereditary Material DNA & RNA, Concept of Genetics, Mendel First Law, Monohybrid Inheritance, Incomplete/Co-dominance, Sex Determination, Sex-Linked Traits & Variation/Mutation)', defaultForm: 'Form 4', subjects: ['Biology'] },
    { keywords: ['topographical map', 'grid reference', 'contour', 'intervisibility'], topic: 'Chapter 6: Map Reading and Map Interpretation (Topographical Maps, Contours, Cross-Section/Relief Profile, Intervisibility, Gradient, Drainage Patterns & Human Settlements)', defaultForm: 'Form 3', subjects: ['Geography'] },
  ];

  for (const item of directTopicMap) {
    const subjectCompatible = item.subjects.some((s) => matchesSubjectQuery(s, subject));
    if (!subjectCompatible && explicitSubjectFound) continue;
    if (item.keywords.some((kw) => hasWordPhrase(lower, kw))) {
      matchedTopic = item.topic;
      if (!subjectCompatible && !explicitSubjectFound && item.subjects[0]) {
        subject = item.subjects[0];
      }
      if (!explicitClassFound && item.defaultForm) {
        cls = item.defaultForm;
      }
      matchedFromPrompt = true;
      break;
    }
  }

  const finalTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const topic =
    matchedTopic ||
    (finalTopics[0] ? finalTopics[0].replace(/^\d+\.\d+\s*/, '') : `Core Principles of ${subject}`);
  const subTopics = getSubTopicsForMainTopic(cls, subject, topic);
  let subTopic = subTopics[0] || `${topic} — Problem Solving`;
  let bestSubScore = 0;
  for (const st of subTopics) {
    const stWords = st
      .replace(/—.*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !['with', 'from', 'between', 'other', 'problem', 'solving'].includes(w));
    let sScore = 0;
    for (const sw of stWords) {
      if (hasWordPhrase(lower, sw) || (sw.endsWith('s') && hasWordPhrase(lower, sw.slice(0, -1))) || hasWordPhrase(lower, `${sw}s`)) {
        sScore += 3;
      }
    }
    if (sScore > bestSubScore) {
      bestSubScore = sScore;
      subTopic = st;
    }
  }

  return { cls, subject, topic, subTopic, matchedFromPrompt };
}

export function getSubTopicsForMainTopic(
  clsOrSubject: string,
  subjectOrMainTopic: string,
  optionalMainTopic?: string
): string[] {
  const explicitCls = optionalMainTopic !== undefined ? normalizeClassName(clsOrSubject) : '';
  const subject = optionalMainTopic !== undefined ? subjectOrMainTopic : clsOrSubject;
  const mainTopic = optionalMainTopic !== undefined ? optionalMainTopic : subjectOrMainTopic;
  const cleanMain = (mainTopic || '').replace(/^\d+\.\d+\s*/, '').trim();
  const cleanSub = normalizeSubjectName(subject || '');

  // 1. Prioritize real sub-topics / exercises from uploaded textbook banks (FULL_EXTRACTED_TEXTBOOK_BANK)
  if (cleanMain && cleanMain.toUpperCase() !== 'ALL') {
    const chMatch = cleanMain.match(/^chapter\s+(\d+)\b/i);
    const mainCore = cleanMain.replace(/\s*\([^)]+\)\s*$/, '').trim().toLowerCase();
    const uploadedSubTopics = new Set<string>();
    for (const seed of FULL_EXTRACTED_TEXTBOOK_BANK) {
      if (explicitCls && normalizeClassName(seed.cls) !== explicitCls) continue;
      if (cleanSub && !matchesSubjectQuery(seed.subject, cleanSub)) continue;
      const seedTopicLower = (seed.topic || '').replace(/\s*\([^)]+\)\s*$/, '').trim().toLowerCase();
      const seedChMatch = seedTopicLower.match(/^chapter\s+(\d+)\b/i);
      const topicMatches =
        seedTopicLower === mainCore ||
        seedTopicLower.includes(mainCore) ||
        mainCore.includes(seedTopicLower) ||
        Boolean(chMatch && seedChMatch && chMatch[1] === seedChMatch[1]);
      if (topicMatches && seed.subTopic && seed.subTopic.trim()) {
        uploadedSubTopics.add(seed.subTopic.trim());
      }
    }
    if (uploadedSubTopics.size > 0) {
      return Array.from(uploadedSubTopics);
    }
  }

  // 2. If the topic string has parenthetical sub-items like "Algebra (Linear Equations, Simultaneous Equations, Inequalities)", extract them
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
  _siteResources?: SiteResourceContext,
  subTopic?: string,
  _sourceFilter: 'ALL' | 'BOOK' | 'PAPER' | 'textbook' | 'past_paper' = 'ALL'
): QuizItem[] {
  const normCls = (cls || '').trim().toLowerCase();
  const normSubj = (subject || '').trim().toLowerCase();

  let matching = FULL_EXTRACTED_TEXTBOOK_BANK.filter((seed) => {
    const seedCls = seed.cls.trim().toLowerCase();
    const seedSubj = seed.subject.trim().toLowerCase();
    const classMatches = seedCls === normCls;
    const subjectMatches =
      seedSubj === normSubj ||
      (normSubj.includes('computer') && seedSubj.includes('computer')) ||
      (normSubj === 'mathematics' && seedSubj === 'mathematics') ||
      (normSubj === 'additional mathematics' && seedSubj === 'additional mathematics');
    return classMatches && subjectMatches;
  });

  if (topic && topic !== 'ALL' && topic.trim().length > 0) {
    const cleanTopic = topic.replace(/^\d+\.\d+\s*/, '').trim().toLowerCase();
    const chMatch = cleanTopic.match(/^chapter\s+(\d+)\b/i);
    const topicFiltered = matching.filter((seed) => {
      const seedTopic = seed.topic.toLowerCase();
      if (chMatch) {
        const seedCh = seedTopic.match(/^chapter\s+(\d+)\b/i);
        if (seedCh && seedCh[1] === chMatch[1]) return true;
      }
      return (
        seedTopic === cleanTopic ||
        seedTopic.includes(cleanTopic) ||
        cleanTopic.includes(seedTopic)
      );
    });
    if (topicFiltered.length > 0) {
      matching = topicFiltered;
    }
  }

  if (subTopic && subTopic !== 'ALL' && subTopic.trim().length > 0) {
    const cleanSub = subTopic.trim().toLowerCase();
    const subFiltered = matching.filter(
      (seed) =>
        seed.subTopic.toLowerCase().includes(cleanSub) ||
        cleanSub.includes(seed.subTopic.toLowerCase())
    );
    if (subFiltered.length > 0) {
      matching = subFiltered;
    }
  }

  return matching.map((seed) => ({
    question: seed.question,
    options: [...seed.options],
    correctIndex: seed.correctIndex,
    explanation: seed.explanation,
    hint: seed.hint,
    topic: seed.topic,
    subTopic: seed.subTopic,
    sourceRef: `📘 ${seed.textbookTitle} — ${seed.exerciseRef}`,
    sourceCitation: `📘 ${seed.textbookTitle} — ${seed.exerciseRef}`,
    isMultipleChoice: seed.isMultipleChoice ?? false,
  }));
}
