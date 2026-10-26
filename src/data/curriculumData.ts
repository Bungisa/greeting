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
  'Standard 3': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi (Science)', 'Jiografia na Mazingira', 'Historia ya Tanzania na Maadili', 'Sanaa na Michezo'],
  'Standard 4': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi (Science)', 'Jiografia na Mazingira', 'Historia ya Tanzania na Maadili', 'Sanaa na Michezo'],
  'Standard 5': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Standard 6': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Standard 7': ['Kiswahili', 'English Language', 'Hisabati (Mathematics)', 'Sayansi na Teknolojia', 'Maarifa ya Jamii', 'Uraia na Maadili', 'Stadi za Kazi'],
  'Form 1': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Agriculture', 'Home Economics'],
  'Form 2': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Agriculture', 'Home Economics'],
  'Form 3': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Agriculture', 'Home Economics', 'Literature in English'],
  'Form 4': ['Basic Mathematics', 'Additional Mathematics', 'English Language', 'Kiswahili', 'Biology', 'Physics', 'Chemistry', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Business Studies', 'Civics', 'Book-Keeping', 'Commerce', 'Computer Science', 'Agriculture', 'Home Economics', 'Literature in English'],
  'Form 5': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Economics', 'Business Studies', 'Accountancy', 'Commerce', 'Agriculture', 'English Language', 'Literature in English', 'Kiswahili', 'Computer Science'],
  'Form 6': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Historia ya Tanzania na Maadili', 'Economics', 'Business Studies', 'Accountancy', 'Commerce', 'Agriculture', 'English Language', 'Literature in English', 'Kiswahili', 'Computer Science'],
};

export const TIE_SYLLABUS_COMPETENCES: Record<string, Record<string, string[]>> = {
  'Basic Mathematics': {
    'Form 1': [
      'Chapter 1: Concept of Mathematics (Meaning of Mathematics, Branches of Mathematics, Relationship Between Mathematics and Other Subjects & Importance of Mathematics)',
      'Chapter 2: Numbers I (Base Ten Numeration, Place Value & Total Value, Natural and Whole Numbers, Even, Odd & Prime Numbers, Operations on Whole Numbers, BODMAS, Factors & Multiples, HCF & LCM, Operations on Integers)',
      'Chapter 3: Fractions (Proper, Improper and Mixed Fractions, Equivalent Fractions, Comparison of Fractions & Operations on Fractions)',
      'Chapter 4: Decimals and Percentages (Decimals, Types of Decimals, Operations on Decimals & Percentages)',
      'Chapter 5: Metric Units (Metric Units of Length, Metric Units of Mass, Metric Units of Time & Metric Units of Capacity)',
      'Chapter 6: Approximations (Rounding Off Numbers, Approximations in Calculations, Significant Figures & Decimal Places)',
      'Chapter 7: Introduction to Geometry (Points, Lines, Rays, Line Segments and Planes, Angles, Perpendicular Lines, Transversals, Polygons, Triangles, Quadrilaterals & Circles)',
      'Chapter 8: Algebra (Algebraic Expressions, Linear Equations in One Unknown, Simultaneous Linear Equations & Linear Inequalities)',
      'Chapter 9: Numbers II (Rational Numbers, Irrational Numbers, Real Numbers & Absolute Value of a Real Number)',
      'Chapter 10: Ratios, Profit and Loss (Ratios, Proportions, Profit and Loss & Simple Interest)',
      'Chapter 11: Coordinate Geometry (Coordinates of a Point, Gradient/Slope of a Line, Equation of a Straight Line y = mx + c & Graphing Linear Equations)',
      'Chapter 12: Perimeters and Areas (Perimeters of Triangles and Quadrilaterals, Circumference of a Circle, Areas of Triangles, Quadrilaterals & Circles)',
    ],
    'Form 2': [
      'Chapter 1: Rates and Variations (Rates, Direct Variation, Inverse Variation, Joint Variation & Partial Variation)',
      'Chapter 2: Congruence (The Concept of Congruence, Postulates, Theorems and Proofs & Congruence of Triangles: SSS, SAS, ASA, AAS, RHS)',
      'Chapter 3: Similarity (Similar Figures, Similar Triangles & Similarity Theorems)',
      'Chapter 4: Algebra (Binary Operations, Transposition of Formulae, Quadratic Expressions, Factorisation of Quadratic Expressions & Quadratic Equations)',
      'Chapter 5: Exponents and Radicals (Exponents, Laws of Exponents, Exponential Equations, Fractional Exponents, Radicals/Surds, Rationalisation of Denominators & Finding Roots by Calculators)',
      'Chapter 6: Logarithms (Standard Form of Numbers, Concept of Logarithms, Laws of Logarithms, Logarithms of Numbers, Antilogarithms & Applications of Logarithms)',
      'Chapter 7: Sets (Concept of a Set, Types of Sets, Subsets, Operations on Sets: Union, Intersection, Complement & Venn Diagrams)',
      'Chapter 8: Trigonometry (Trigonometric Ratios sin, cos, tan, Pythagoras Theorem, Trigonometric Ratios of Special Angles 30°, 45°, 60°, Trigonometric Ratios of Any Angle, Inverse of Trigonometric Ratios & Angles of Elevation and Depression)',
    ],
    'Form 3': [
      'Chapter 1: Relations (Meaning of a Relation, Types of Relations, Domain and Range of a Relation, Graphs of Relations & Inverse of a Relation)',
      'Chapter 2: Functions (Concept of a Function, Function Notation, Domain and Range of a Function, Graphs of Linear, Quadratic, Step & Absolute Value Functions, Inverse of a Function)',
      'Chapter 3: Linear Programming (Formulation of Linear Programming Problems, Objective Function, Constraints, Feasible Region & Graphical Solutions)',
      'Chapter 4: Sequences and Series (Sequences, Series, Arithmetic Progression AP, Arithmetic Mean, Geometric Progression GP, Geometric Mean & Compound Interest)',
      'Chapter 5: Circles (Concept of a Circle, Central Angles, Arc Length of a Circle, Radian Measure, Angle Properties of Circles, Cyclic Quadrilaterals, Chord Properties & Tangent Properties of Circles)',
      'Chapter 6: Statistics (Mean, Median, Mode for Grouped & Ungrouped Data, Assumed Mean, Histograms, Frequency Polygons & Cumulative Frequency Curve/Ogive)',
      'Chapter 7: The Earth as a Sphere & Accounts (Great & Small Circles, Latitudes & Longitudes, Distance in Kilometres & Nautical Miles; Double Entry Principle, Cash Book, Ledger, Trial Balance & Financial Statements)',
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
      'Chapter 1: Algebra (Simultaneous Equations with Two and Three Unknowns, Linear & Quadratic Systems)',
      'Chapter 2: Variations (Direct, Inverse, Joint and Partial Variations & Graphical Representation)',
      'Chapter 3: Logic (Statements, Propositions, Truth Tables, Negation, Conjunction, Disjunction, Implication, Converse, Inverse, Contrapositive & Validity of Arguments)',
      'Chapter 4: Locus (Concept of Locus, Locus About a Point, Two Fixed Points, Intersecting Lines & Cartesian Representation of Loci)',
      'Chapter 5: Sets (Set Operations, Cardinality of Three Intersecting Sets & Venn Diagrams)',
    ],
    'Form 3': [
      'Chapter 1: Sets (Set Properties, Verification of Set Properties Using Venn Diagrams, Simplification of Set Expressions & De Morgan Laws)',
      'Chapter 2: Equation and Remainder Theorem (Nature & Sum/Product of Roots of a Quadratic Equation α and β, Polynomial Division & The Remainder Theorem)',
      'Chapter 3: Functions (Rational Functions, Domain and Range of Rational Functions, Basic Operations, Asymptotes & Graphs of Rational Functions)',
      'Chapter 4: Statistics (Quartiles, Interquartile Range, Measures of Central Tendency, Assumed Mean, Measures of Dispersion, Variance & Standard Deviation)',
      'Chapter 5: Trigonometry (Trigonometric Identities, Derivation of Identities, Compound Angle Formulae, Double Angle Formulae & Trigonometric Equations)',
      'Chapter 6: Differentiation (Derivative of a Function, First Principles, Power Rule, Chain Rule, Product Rule, Quotient Rule, Derivatives of Trigonometric Functions, Rates of Change, Turning Points, Curve Sketching, Tangents & Normals)',
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
      'Chapter 1: Static Electricity (Concept of Static Electricity, Conductors and Insulators, Gold-Leaf Electroscope, Capacitors, Charge Distribution & Lightning and Thunderstorms)',
      'Chapter 2: Current Electricity (Concept of Current Electricity, Ohm Law V = IR, Resistance to an Electric Current, Series/Parallel Resistors, Heating Effect of an Electric Current, Electrical Installations & Cells)',
      'Chapter 3: Magnetism (Concept of Magnetism, Magnetisation and Demagnetisation, Magnetic Field of a Magnet & Earth Magnetic Field)',
      'Chapter 4: Nature and Reflection of Light (Concept of Light, Propagation and Transmission of Light, Reflection Through a Plane Mirror & Reflection from Curved Mirrors: Concave & Convex Mirrors, Mirror Formula 1/f = 1/u + 1/v)',
      'Chapter 5: Refraction and Dispersion of Light (Concept of Refraction of Light, Snell Law, Total Internal Reflection, Refraction by a Glass Prism, Colours of Light & Refraction by Lenses)',
      'Chapter 6: Optical Instruments (Simple Microscope, Compound Microscope, Astronomical Telescope, Binoculars, Lens Camera & The Human Eye)',
      'Chapter 7: Forces in Equilibrium, Simple Machines & Linear Motion (Moment of a Force, Principle of Moments, Centre of Gravity, Levers, Pulleys, Equations of Uniformly Accelerated Motion, Newton Laws of Motion, Temperature & Sustainable Energy)',
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
      'Chapter 1: Atomic Structure (Concept of Atomic Structure, Dalton Atomic Theory, Sub-Atomic Particles, Electronic Arrangement, Atomic Number Z, Mass Number A, Nuclide Notation, Isotopes & Relative Atomic Mass)',
      'Chapter 2: Periodic Classification (Development of the Periodic Table, Modern Periodic Table, Electronic Configuration & Trends in Physical and Chemical Properties Across Periods and Down Groups)',
      'Chapter 3: Chemical Bonding, Formula and Nomenclature (Formation of Ions, Electrovalent/Ionic Bonding, Covalent Bonding, Valency, Radicals, Oxidation State, Empirical/Molecular Formulas & IUPAC Nomenclature)',
      'Chapter 4: Chemical Reactions (Concept of Chemical Reactions, Balancing Chemical Equations, Types of Chemical Reactions & Ionic Equations)',
      'Chapter 5: Acids, Bases, and Salts (Properties & Strengths of Acids and Bases, Basicity of an Acid, Acidity of a Base, Neutralisation Reaction, Acid-Base Indicators, pH Scale, Preparation, Properties & Uses of Salts)',
      'Chapter 6: Oxygen, Hydrogen, Water and Fuels (Laboratory Preparation & Properties of Oxygen and Hydrogen, Water Treatment & Fuels and Energy)',
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
      'Chapter 1: Nutrition in Animals and Plants (Concept of Nutrition, Nutrients, Balanced Diet, Nutritional Requirements, Nutritional Deficiencies, Biochemical Food Tests & Photosynthesis)',
      'Chapter 2: Digestive System (The Human Digestion Process, Digestive System of Ruminants & Disorders and Diseases of the Human Digestive System)',
      'Chapter 3: Transport of Materials in Living Organisms (Concept of Transportation of Materials, Diffusion, Osmosis and Mass Flow)',
      'Chapter 4: Transport of Materials in Flowering Plants (The Vascular System: Xylem and Phloem, Absorption and Movement of Water and Mineral Salts, Transpiration & Guttation)',
      'Chapter 5: Transport of Materials in Mammals (The Mammalian Heart, Blood Vessels, The Blood, ABO & Rhesus Blood Groups, Blood Transfusion, Blood Circulation & Lymphatic System)',
      'Chapter 6: Gas Exchange and Respiration (Gas Exchange in Mammals, Gas Exchange in Plants, Aerobic and Anaerobic Respiration & Respiratory Disorders)',
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
  'Computer Science': {
    'Form 1': [
      'Chapter 1: Introduction to Information and Computer Studies / Computer Science (Concept of ICS/Computer Science & Relationship with Other Subjects)',
      'Chapter 2: Data and Information (Concept of Data and Information, Information Dissemination, Modern Ways of Disseminating Information & Communication Media)',
      'Chapter 3: Computer Evolution (Early Computer Development: Abacus, Napier Bones, Pascaline, Analytical Engine & Computer Generations 1st to 5th)',
      'Chapter 4: Computer Hardware and Software (Input Devices, CPU/Processor, Primary & Secondary Memory, Output Devices; System Software/Operating Systems & Application Software)',
      'Chapter 5: Classification and Significance of Computers (Classification by Size, Purpose & Data Handled; Significance of Computers in Education, Health, Banking & Industry)',
      'Chapter 6: Computer Handling (Concept of Computer Handling, Power Management/UPS, Utility Programs, Data Backup & Computer Security)',
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
      'Chapter 1: Computer Architecture, Number Systems and Boolean Algebra (Logic Gates, Karnaugh Maps & Microprocessor Organization)',
      'Chapter 2: Operating Systems and Computer Security',
      'Chapter 3: Data Structures and Algorithms (Arrays, Linked Lists, Stacks, Queues, Trees, Sorting & Searching Algorithms)',
      'Chapter 4: Structured and Object-Oriented Programming in C++ / Python',
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
      'Chapter 1: Human Activities (Concept and Major Types of Human Activities: Primary, Secondary, Tertiary, Quaternary & Quinary)',
      'Chapter 2: Agriculture (Small-Scale Subsistence vs Large-Scale Commercial/Plantation Farming, Major Cash Crops in Tanzania & Livestock Keeping)',
      'Chapter 3: Water Management for Economic Development (Uses of Water, River Basin Development Projects: Rufiji/JNHPP, Tennessee Valley Authority, Water Conservation)',
      'Chapter 4: Sustainable Use of Forest Resources (Types of Forests, Importance of Forests, Deforestation & Forest Conservation in Tanzania)',
      'Chapter 5: Sustainable Mining (Types of Minerals, Methods of Mining: Open Cast, Underground, Alluvial; Contribution & Environmental Impact of Mining in Tanzania)',
      'Chapter 6: Tourism (Concept, Domestic & International Tourism, Tourist Attractions in Tanzania: Serengeti, Ngorongoro, Kilimanjaro, Zanzibar & Sustainable Eco-Tourism)',
      'Chapter 7: Manufacturing Industry (Types of Industries, Factors for Location of Industries, Focal Studies & Challenges of Industrialisation in Tanzania)',
      'Chapter 8: Sustainable Use of Power and Energy Resources (Renewable & Non-Renewable Energy: Hydroelectric, Natural Gas, Solar, Wind, Geothermal, Coal & Biogas)',
      'Chapter 9: Transport (Land, Railway, Water, Air & Pipeline Transport in East Africa, Importance & Challenges)',
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
  { id: 'tie-drive-book-51', title: 'ADDITIONAL BOOK 3', form: 'Form 3', subject: 'Additional Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1o6_JCDYRIwDcMrXLlNtD-YJqNi-BFC1m/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-52', title: 'HTM TIE BOOK 3', form: 'Form 3', subject: 'Historia ya Tanzania na Maadili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Z4FozWO42KRLx6mcfEf9GIhlR3qg6lOC/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-53', title: 'BIOLOGY FORM 3 TIE NEW', form: 'Form 3', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Q94YKhRZphRYjeJIPHPkvD7ZCnh_zGKt/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-54', title: 'FORM THREE TIE MATHEMATICS', form: 'Form 3', subject: 'Basic Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1euVsPlxlXUYLdkX7ajEk7FjMRDgVNO8j/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
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
  { id: 'tie-drive-book-68', title: 'BIOLOGY FORM 2 TIE NEW SYLLABUS', form: 'Form 2', subject: 'Biology', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1A0voCf2A83VvMEEaQONtnyQhuNGBXrX2/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-69', title: 'Geography F2', form: 'Form 2', subject: 'Geography', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1IloB7ZSJzZ1BxkzibrC7uCzaiEsRgC0s/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-70', title: 'Acting F2', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1uR6zEY6mryLyA8AIwSbYxIT0dotA3aC5/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-71', title: 'Additional Mathematics Form Two', form: 'Form 2', subject: 'Additional Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1GlOxsR4aMBoQBPxDpqWQ0H4aRwlbn_I1/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-72', title: 'AGRICULTURE F2 TIE NEW SYLLABUS', form: 'Form 2', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1ceZTZ9uuyylvj7mKvyQgZZRmxepfuJE1/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-73', title: 'Agromechanics', form: 'Form 2', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1n58bAzDBkMX6EM3VrAQQj_eHfh3uwpft/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-74', title: 'Animal Health and Production', form: 'Form 2', subject: 'Agriculture', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1xGo30_Jwid5C1x2SfK_7FXIQ6igs2xz4/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-75', title: 'Book-Keeping Form Two', form: 'Form 2', subject: 'Book-Keeping', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1NFbIZfc0e1UvH8qAipB5Um7B5wGvI4AT/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-76', title: 'Chemistry F2 TIE', form: 'Form 2', subject: 'Chemistry', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1h26uIRH4UD5_UrD6CMsfDrQ800OtJlj3/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-77', title: 'Chinese', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1IlPUOuHFWIPj0IT9kSqoRBCcq_91_3Kj/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-78', title: 'computer science 2', form: 'Form 2', subject: 'Computer Science', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1YWevhyTnKHWCNagX4gpGhI5229L642BC/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-79', title: 'ENGLISH FORM TWO-NEW BOOK', form: 'Form 2', subject: 'English Language', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1rZpMHLdlmDyXPFwyBBr54HWOj_2F5Vvi/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-80', title: 'F II-EDK', form: 'Form 2', subject: 'General Studies', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1pU62bBm_qTQt9Qej73-rK9vDHG9x56dJ/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-81', title: 'kiswahili f2', form: 'Form 2', subject: 'Kiswahili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1Uy6QCfS8lORVPB38N4vej6PY_KOgzVah/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-82', title: 'PHYSICS F2 NEW TIE', form: 'Form 2', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1FLxPeajErXbEESO0Evezeh4QL8pQ8LY8/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-83', title: 'HISTORIA YA TANZANIA NA MAADILI KIDATO CHA PILI', form: 'Form 2', subject: 'Historia ya Tanzania na Maadili', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1EhCwHX6cmAqtEdF1zvbEG_HuQbBtZdEU/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-84', title: 'Basic Mathematics F2', form: 'Form 2', subject: 'Basic Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1yhx10LAspqFck81xdn56WcPsnH_JbLzI/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
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
  { id: 'tie-drive-book-104', title: 'MATH TIE BOOK 1', form: 'Form 1', subject: 'Basic Mathematics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1g0lE1PZAyD1wjQP_EyjzUJow39caujxn/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
  { id: 'tie-drive-book-105', title: 'PHYSICS F1', form: 'Form 1', subject: 'Physics', year: '2025', category: 'TIE Book', paperUrl: 'https://drive.google.com/file/d/1mUAUNoLsP0c_kAJ89Uhr0Zl5O13mgyVp/view?usp=drive_link', answersUrl: null, isBook: true, isSyllabus: false },
];

export const MOHA_BUILTIN_KNOWLEDGE = [
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

export function normalizeSubjectName(rawSubject: string, rawTitle = ''): string {
  const s = (rawSubject || '').trim();
  const lower = s.toLowerCase();
  const titleLower = (rawTitle || '').toLowerCase();

  if (lower === 'htm' || lower.includes('historia ya tanzania') || titleLower.includes('historia ya tanzania na maadili')) {
    return 'Historia ya Tanzania na Maadili';
  }
  if (lower === 'ict' || lower === 'ics' || lower.includes('computer') || lower.includes('information and computer') || titleLower.includes('ict tie') || titleLower.includes('ics ')) {
    return 'Computer Science';
  }
  if (lower === 'english' || lower === 'english language' || titleLower.includes('english tie')) {
    return 'English Language';
  }
  if (lower === 'book-keeping' || lower === 'book keeping' || lower === 'bookkeeping' || titleLower.includes('book-keeping') || titleLower.includes('book keeping')) {
    return 'Book-Keeping';
  }
  if (lower === 'business studies' || lower === 'bussiness studies' || titleLower.includes('bussiness studies') || titleLower.includes('business studies')) {
    return 'Business Studies';
  }
  if (lower === 'additional mathematics' || lower === 'aditional mathematics' || titleLower.includes('additional mathematics') || titleLower.includes('aditional mathematics')) {
    return 'Additional Mathematics';
  }
  if (lower === 'home economics' || lower.includes('food and human nutrition')) {
    return 'Home Economics';
  }
  if (lower === 'fasihi ya kiswahili' || lower === 'kiswahili') {
    return 'Kiswahili';
  }
  if (lower === 'basic mathematics' || lower === 'mathematics') {
    return 'Basic Mathematics';
  }
  return s || 'General';
}

export function matchesSubjectQuery(recordSubject: string, targetSubject: string, recordTitle = ''): boolean {
  const normA = normalizeSubjectName(recordSubject, recordTitle).toLowerCase();
  const normB = normalizeSubjectName(targetSubject).toLowerCase();
  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) {
    if (
      (normA.includes('additional') !== normB.includes('additional')) ||
      (normA.includes('maadili') !== normB.includes('maadili'))
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
  const cleanSub = normalizeSubjectName(subject || 'Basic Mathematics');
  const subjectKey = Object.keys(TIE_SYLLABUS_COMPETENCES).find(
    (k) => matchesSubjectQuery(k, cleanSub)
  );
  if (subjectKey && TIE_SYLLABUS_COMPETENCES[subjectKey]) {
    const classMap = TIE_SYLLABUS_COMPETENCES[subjectKey];
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
    let bestScore = 0;
    for (const ch of allChapters) {
      const chWords = ch
        .toLowerCase()
        .replace(/[(),:&/-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !stopWords.has(w));
      let sc = 0;
      for (const w of chWords) {
        if (qLower.includes(w)) sc += 4;
        else if (w.length >= 5 && qLower.includes(w.slice(0, 4))) sc += 2;
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
      title: `Figure 1.1: Direct Variation (y = kx) & Inverse Variation (y = k/x) Graphs — ${safeSubTopic}`,
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
      title: `Figure 1.1: Right-Angled Triangle, Pythagoras & Trigonometric Ratios — ${safeSubTopic}`,
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
      title: `Figure 1.1: Venn Diagram of Intersecting Sets A and B in Universal Set μ — ${safeSubTopic}`,
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
      title: `Figure 1.1: Circle Theorems — Central Angle, Inscribed Angle & Tangent — ${safeSubTopic}`,
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
    return {
      title: `Figure 1.1: Labeled Physics Experimental & Theoretical Diagram — ${safeSubTopic}`,
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
      title: `Figure 1.1: Labeled Chemistry Apparatus & Reaction Setup — ${safeSubTopic}`,
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
      title: `Figure 1.1: Labeled Biological Structure & Physiological Pathway — ${safeSubTopic}`,
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
      title: `Figure 3.1: Linear Programming — Feasible Region, Constraint Lines & Corner Points — ${safeSubTopic}`,
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
      title: `Figure 1.1: Cartesian Coordinate & Graphical Representation — ${safeSubTopic}`,
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
    title: `Figure 1.1: TIE Textbook Concept & Structural Diagram — ${safeSubTopic}`,
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
      const escaped = escapeHtml(stripRawSvgMarkup(raw));
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
          ${school} — COMPREHENSIVE TEXTBOOK LESSON NOTES
        </div>
        <div style="font-weight:700; font-size:12px; color:#1d4ed8; margin-top:2px;">
          ${cls} · ${subject} — ${escapeHtml(tbInfo.matchedChapter)}: ${subTopic}
        </div>
      </div>

      <!-- Clean Metadata Strip -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; margin-bottom:16px; font-size:11.5px; line-height:1.6;">
        <div style="display:flex; flex-wrap:wrap; gap:6px 20px;">
          <div><strong>Class:</strong> ${cls}</div>
          <div><strong>Subject:</strong> ${subject}</div>
          <div><strong>Attached TIE Textbook:</strong> ${escapeHtml(tbInfo.bookTitle)}</div>
          <div><strong>Chapter / Topic:</strong> ${escapeHtml(tbInfo.matchedChapter)}</div>
          <div><strong>Sub-Topic:</strong> ${subTopic}</div>
          <div><strong>Prepared By:</strong> ${teacher}</div>
        </div>
        <div style="margin-top:6px; padding-top:6px; border-top:1px solid #e2e8f0; color:#475569;">
          <strong>Chapter Sub-Topics Covered:</strong> ${escapeHtml(tbInfo.subTopicsList.join(' • '))}
        </div>
      </div>

      <!-- PART I: STRUCTURED TOPIC NOTES FOLLOWING ATTACHED TEXTBOOK -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:#0f172a; text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:10px;">
          Part I: Core Textbook Notes &amp; Key Concepts (${escapeHtml(tbInfo.bookTitle)})
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

      <!-- PART II: LABELED TEXTBOOK DIAGRAM & VISUAL ILLUSTRATION -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:#0f172a; text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:10px;">
          Part II: Labeled Textbook Diagram &amp; Visual Illustration
        </div>
        <div style="padding:12px 14px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
          <div style="font-weight:800; font-size:12px; color:#0f172a; margin-bottom:8px; text-align:center;">
            ${diagramBlock.title}
          </div>
          ${diagramBlock.svgHtml}
          <div style="font-size:11px; color:#475569; margin-top:8px; text-align:center; font-style:italic;">
            ${diagramBlock.caption}
          </div>
        </div>
      </div>

      <!-- PART III: STEP-BY-STEP WORKED EXAMPLES -->
      <div style="margin-bottom:18px;">
        <div style="font-weight:900; font-size:12.5px; color:#0f172a; text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:10px;">
          Part III: Step-by-Step Worked Examples (TIE Textbook &amp; NECTA Standard)
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

      <!-- PART IV: SELF-ASSESSMENT & REVISION EXERCISE -->
      <div>
        <div style="font-weight:900; font-size:12.5px; color:#0f172a; text-transform:uppercase; letter-spacing:0.03em; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:10px;">
          Part IV: Self-Assessment &amp; Textbook Chapter Revision Exercise
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

  const parsed = parseClassSubjectTopicFromPrompt(cleanInput, cls, subject);
  const effectiveCls = parsed.matchedFromPrompt
    ? parsed.cls
    : siteResources?.focusedResource?.form || parsed.cls;
  const effectiveSub = parsed.matchedFromPrompt
    ? parsed.subject
    : siteResources?.focusedResource?.subject || parsed.subject;
  const syllabusTopics = getSyllabusTopicsForClassSubject(effectiveCls, effectiveSub);
  const effectiveTbInfo = getTieTextbookChapterContent(effectiveCls, effectiveSub, cleanInput, siteResources);
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

  // 2. Smart Conversational Routing (greetings, identity, general chat — never dump syllabuses)
  const strippedPunct = lower.replace(/[^a-z0-9\s]/g, '').trim();
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
  ];
  if (greetingPatterns.includes(strippedPunct) || /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))(\s+moha(\s+ai)?)?$/i.test(strippedPunct)) {
    return `Hello! 👋 Welcome to **Moha AI**, your intelligent academic assistant on **Elimika**.\n\nI noticed your current workspace is set to **${effectiveCls} — ${effectiveSub}**. How can I help you today?\n\n• **Ask a Question:** Type any topic, concept, or math/science problem for a clear step-by-step explanation.\n• **Past Paper & Book Solver:** Select a resource above or click **Solve** for worked solutions.\n• **Teacher Studio:** Switch to **4-Stage TIE Lesson Plan** or **12-Col PO-RALG Scheme of Work** to generate and download official PDF documents.\n• **🧠 Teach AI:** Click **Teach AI** in the top bar to save your own custom notes or topics into my permanent memory.`;
  }

  if (
    /^(how are you|how are you doing|how is it going|how do you do|are you there|are you online)$/i.test(strippedPunct)
  ) {
    return `I am doing great and ready to help! 😊\n\nWe are currently focusing on **${effectiveCls} — ${effectiveSub}**, or you can ask me about any Primary (Std 1–7), Secondary (Form 1–4), or Advanced (Form 5–6) subject. What would you like to work on?`;
  }

  if (
    /^(who are you|what are you|what is your name|introduce yourself|tell me about yourself|what is moha|what is moha ai|what is elimika)$/i.test(strippedPunct)
  ) {
    return `I am **Moha AI**, the built-in educational tutor and teacher studio engine for **Elimika**.\n\n**What I can do for you:**\n1. **Step-by-Step Tutoring:** Explain any Primary, O-Level, or A-Level topic in clear English with worked examples and diagrams.\n2. **Teacher Document Studio:** Instantly generate official **4-Stage TIE Lesson Plans**, **12-Column PO-RALG Schemes of Work**, **Lesson Notes**, **Exams**, and **Marking Schemes** with 1-click PDF export.\n3. **Self-Learning Memory (🧠 Teach AI):** Permanently remember custom notes, definitions, and school-specific topics that you teach me.`;
  }

  if (
    /^(help|what can you do|how to use|how does this work|commands|options|features)$/i.test(strippedPunct)
  ) {
    return `Here is how to get the most out of **Moha AI**:\n\n• **Ask Anything:** e.g., *"Explain Newton's Second Law"*, *"Solve 2x + 5 = 15"*, or *"What is photosynthesis?"*\n• **Generate Practice Questions:** Click **5 Qns** or type *"Give me a quiz on ${syllabusTopics[0] || effectiveSub}"*.\n• **Official Teacher Documents:** Use the top tabs (**Lesson Plan**, **Scheme of Work**, **Lesson Notes**, **Exam Paper**, **Marking Scheme**) to generate printable A4 PDFs.\n• **🧠 Teach AI:** Click **Teach AI** in the toolbar to add custom notes to your permanent browser memory.`;
  }

  if (
    /^(thank you|thanks|thank u|thx|ty|thanks a lot|thank you so much|ok|okay|got it|understood|nice|great|awesome|cool|perfect)$/i.test(strippedPunct)
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

  for (const entry of MOHA_BUILTIN_KNOWLEDGE) {
    if (entry.keywords.some((kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(lower))) {
      const diagHtml = renderTopicDiagramBlockHtml(
        effectiveCls,
        effectiveSub,
        effectiveTbInfo.matchedChapter || entry.title,
        parsed.subTopic || effectiveTopic
      );
      return `📘 **${effectiveTbInfo.bookTitle} — ${effectiveTbInfo.matchedChapter}**\n\n${entry.content}\n\n<!--DIAGRAM_START-->${diagHtml}<!--DIAGRAM_END-->`;
    }
  }

  // If a specific document/paper has extracted text in customContent, solve directly from that document's text
  const focusedDoc = siteResources?.focusedResource;
  if (focusedDoc && focusedDoc.customContent && focusedDoc.customContent.trim().length > 80) {
    const cleanExcerpt = focusedDoc.customContent.trim().slice(0, 4500);
    const diagHtml = renderTopicDiagramBlockHtml(
      effectiveCls,
      effectiveSub,
      focusedDoc.title,
      effectiveTopic
    );
    return `📄 **${focusedDoc.title} (${focusedDoc.form} ${focusedDoc.subject} · ${focusedDoc.year})**\n\n**Extracted Paper Content & Questions:**\n${cleanExcerpt}\n\n<!--DIAGRAM_START-->${diagHtml}<!--DIAGRAM_END-->`;
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

  if (
    lower.includes('quiz') ||
    lower.includes('test me') ||
    lower.includes('maswali') ||
    lower.includes('practice') ||
    lower.includes('5 high-yield') ||
    lower.includes('exercise') ||
    lower.includes('solve')
  ) {
    const topicQuiz = buildContentIntegratedQuizQuestions(
      effectiveCls,
      effectiveSub,
      effectiveTopic,
      siteResources,
      parsed.subTopic
    );
    const formattedQuestions = topicQuiz
      .slice(0, 5)
      .map(
        (q, idx) =>
          `**${idx + 1}. ${q.question}**\n• **Working:** ${q.explanation}\n• **Answer:** **${
            q.options[q.correctIndex]
          }**`
      )
      .join('\n\n');

    const headerLabel = focusedDoc
      ? `📄 **${focusedDoc.title} (${focusedDoc.form} ${focusedDoc.subject})**`
      : `📘 **${effectiveTbInfo.bookTitle} (${effectiveTbInfo.matchedChapter})**`;

    const solveDiagramHtml = renderTopicDiagramBlockHtml(
      effectiveCls,
      effectiveSub,
      effectiveTbInfo.matchedChapter,
      parsed.subTopic || effectiveTopic
    );

    return `${headerLabel}\n\n${formattedQuestions}\n\n<!--DIAGRAM_START-->${solveDiagramHtml}<!--DIAGRAM_END-->`;
  }

  const topicWorked = buildContentIntegratedQuizQuestions(
    effectiveCls,
    effectiveSub,
    effectiveTopic,
    siteResources,
    parsed.subTopic
  );
  const sampleQ1 = topicWorked[0];
  const diagramBlock = `\n\n<!--DIAGRAM_START-->${renderTopicDiagramBlockHtml(
    effectiveCls,
    effectiveSub,
    effectiveTbInfo.matchedChapter,
    parsed.subTopic || effectiveTopic
  )}<!--DIAGRAM_END-->`;

  return `${effectiveTbInfo.chapterSummaryMarkdown}${diagramBlock}${
    sampleQ1
      ? `\n\n**Worked Example:**\n• **Question:** ${sampleQ1.question}\n• **Solution:** ${sampleQ1.explanation}\n• **Answer:** **${sampleQ1.options[sampleQ1.correctIndex]}**`
      : ''
  }`;
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
  ]);

  const scoreTopicMatch = (topicStr: string, queryLower: string): number => {
    const cleanT = topicStr.replace(/^(?:Chapter\s+\d+|Sura\s+ya\s+\w+|\d+\.\d+):\s*/i, '').toLowerCase();
    const words = cleanT
      .replace(/[(),&/-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !promptStopWords.has(w));
    let score = 0;
    for (const w of words) {
      if (hasWordPhrase(queryLower, w)) score += 4;
      else if (w.length >= 5 && queryLower.includes(w.slice(0, w.length - 1))) score += 2;
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

  // If no topic matched in current class, check Form 1 -> Form 2 -> Form 3 -> Form 4 -> others within the SAME subject
  if (!matchedTopic && bestScore === 0) {
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
          if (!explicitClassFound) {
            cls = candidateCls;
            matchedFromPrompt = true;
          }
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
    { keywords: ['rate and variation', 'rates and variations', 'direct variation', 'inverse variation', 'joint variation', 'partial variation', 'varies directly', 'varies inversely'], topic: 'Chapter 1: Rates and Variations (Rates of Quantities, Direct Variation, Inverse Variation, Joint Variation & Partial Variation)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['congruence', 'congruent triangles', 'postulates of congruence'], topic: 'Chapter 2: Congruence and Similarity (Congruence of Triangles, Postulates SAS/ASA/SSS/RHS & Similarity of Polygons)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['pythagoras', 'hypotenuse'], topic: 'Chapter 3: Pythagoras Theorem (Proof of Pythagoras Theorem & Real-Life Right-Angled Triangle Applications)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['quadratic equation', 'completing the square', 'discriminant', 'difference of two squares'], topic: 'Chapter 4: Quadratic Equations (Algebraic Expressions, Factorisation, Completing the Square & General Quadratic Formula)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['exponent', 'indices', 'radicals', 'surds'], topic: 'Chapter 5: Exponents and Radicals (Laws of Exponents/Indices, Simplifying Radicals/Surds & Rationalising the Denominator)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
    { keywords: ['logarithm', 'standard form', 'antilog'], topic: 'Chapter 6: Logarithms (Standard Form A × 10^n, Laws of Logarithms & Mathematical Tables)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['venn diagram', 'subset', 'union of sets', 'intersection of sets'], topic: 'Chapter 7: Sets (Description of Sets, Types of Sets, Subsets, Power Sets, Venn Diagrams, Union, Intersection & Complement)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['trigonometry', 'sine rule', 'cosine rule', 'angle of elevation', 'angle of depression', 'trigonometric ratios'], topic: 'Chapter 8: Trigonometry (Trigonometric Ratios Sine, Cosine & Tangent, Special Angles 30°, 45°, 60° & Angles of Elevation and Depression)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['domain and range', 'inverse relation'], topic: 'Chapter 1: Relations (Relations, Domain & Range, Graphs of Linear/Quadratic Relations & Inverse of a Relation)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
    { keywords: ['composite function', 'inverse function', 'polynomial function'], topic: 'Chapter 2: Functions (Concept of Function, Linear, Quadratic, Polynomial, Step & Absolute Value Functions, Inverse Functions)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['linear programming', 'feasible region', 'objective function'], topic: 'Chapter 3: Linear Programming (Formulating Simultaneous Linear Inequalities, Objective Function, Feasible Region & Optimal Value)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['mean', 'median', 'mode', 'histogram', 'ogive', 'cumulative frequency'], topic: 'Chapter 4: Statistics (Mean, Median, Mode for Grouped & Ungrouped Data, Assumed Mean, Histograms & Ogive/Cumulative Frequency)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Geography', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['arithmetic progression', 'geometric progression', 'compound interest', 'sequences and series'], topic: 'Chapter 5: Sequences and Series (Arithmetic Progression AP, Geometric Progression GP, Arithmetic/Geometric Mean & Compound Interest)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['chord properties', 'cyclic quadrilateral', 'tangent theorem'], topic: 'Chapter 6: Circles (Parts of a Circle, Central & Inscribed Angles, Chord Properties, Cyclic Quadrilaterals & Tangent Theorems)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
    { keywords: ['earth as a sphere', 'nautical mile', 'great circle', 'small circle'], topic: 'Chapter 7: Earth as a Sphere (Great & Small Circles, Latitudes & Longitudes, Distance Along Great & Small Circles in km and Nautical Miles)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
    { keywords: ['determinant', 'cramer', 'singular matrix', 'inverse matrix', 'matrices'], topic: 'Chapter 7: Matrices and Transformations (2×2 Matrix Operations, Determinant, Inverse Matrix, Simultaneous Equations & Linear Transformations)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Additional Mathematics', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['position vector', 'unit vector', 'dot product'], topic: 'Chapter 6: Vectors (Displacement & Position Vectors, Magnitude & Direction, Vector Addition, Scalar Multiplication & Bearings)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Physics', 'Additional Mathematics'] },
    { keywords: ['mutually exclusive', 'independent events', 'tree diagram', 'probability'], topic: 'Chapter 4: Probability (Sample Space, Event Probability, Mutually Exclusive Events, Independent Events & Tree Diagrams)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['simultaneous equation', 'linear equation', 'linear inequality'], topic: 'Chapter 3: Algebra (Algebraic Expressions, Linear Equations in One Unknown, Simultaneous Equations & Inequalities)', defaultForm: 'Form 1', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['simple interest', 'profit and loss'], topic: 'Chapter 4: Ratios, Profit and Loss (Ratios, Proportions, Profit/Loss Percentage & Simple Interest)', defaultForm: 'Form 1', subjects: ['Basic Mathematics'] },
    { keywords: ['coordinate geometry', 'gradient of a line', 'equation of a line', 'parallel and perpendicular lines'], topic: 'Chapter 5: Coordinate Geometry (Coordinates of a Point, Gradient/Slope of a Line, Equation of a Line, Parallel & Perpendicular Lines)', defaultForm: 'Form 1', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
    { keywords: ['differentiation', 'integration', 'derivative', 'stationary point', 'calculus'], topic: 'Chapter 5: Differentiation (Limits, Derivative from First Principles, Polynomial Differentiation, Tangents, Normals & Rates of Change)', defaultForm: 'Form 2', subjects: ['Additional Mathematics', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)'] },
    { keywords: ['double entry', 'trial balance', 'ledger', 'balance sheet'], topic: 'Chapter 8: Accounting (Principle of Double Entry, Trial Balance, Trading Profit & Loss Account and Balance Sheet)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Book-Keeping', 'Business Studies', 'Accountancy'] },
    { keywords: ['ohm law', "ohm's law", 'resistor', 'current electricity'], topic: 'Chapter 1: Current Electricity (Concept of Current Electricity, Electric Current I = Q/t, Voltage, Ohm Law V = IR & Series/Parallel Resistors)', defaultForm: 'Form 2', subjects: ['Physics'] },
    { keywords: ['archimedes', 'law of flotation', 'upthrust', 'relative density'], topic: 'Chapter 3: Archimedes Principle and the Law of Flotation (Upthrust, Apparent Weight, Relative Density, Sinking, Floating & Hydrometer)', defaultForm: 'Form 1', subjects: ['Physics'] },
    { keywords: ['newton law', "newton's law", 'uniformly accelerated', 'linear momentum'], topic: 'Chapter 5: Motion in a Straight Line and Newton Laws of Motion (Distance, Displacement, Velocity, Equations of Uniformly Accelerated Motion, Inertia & Conservation of Linear Momentum)', defaultForm: 'Form 2', subjects: ['Physics'] },
    { keywords: ['mechanical advantage', 'velocity ratio', 'simple machine', 'pulley'], topic: 'Chapter 4: Simple Machines (Mechanical Advantage, Velocity Ratio, Efficiency, Levers, Pulleys, Inclined Plane, Screw Jack, Wheel & Axle, Hydraulic Press)', defaultForm: 'Form 2', subjects: ['Physics'] },
    { keywords: ['snell law', 'refractive index', 'total internal reflection', 'curved mirror'], topic: 'Chapter 3: Light (Reflection at Curved Mirrors, Mirror Formula 1/f = 1/u + 1/v, Refraction of Light, Snell Law, Total Internal Reflection, Lenses & Optical Instruments)', defaultForm: 'Form 3', subjects: ['Physics'] },
    { keywords: ['specific heat capacity', 'latent heat', 'thermal expansion'], topic: 'Chapter 5: Thermal Expansion and Measurement of Thermal Energy (Thermal Expansion of Solids, Liquids & Gases, Specific Heat Capacity Q = mcΔθ & Specific Latent Heat Q = mL)', defaultForm: 'Form 3', subjects: ['Physics'] },
    { keywords: ['radioactivity', 'half-life', 'half life', 'alpha particle', 'beta particle'], topic: 'Chapter 3: Radioactivity (Structure of the Nucleus, Isotopes, Alpha, Beta & Gamma Radiation, Nuclear Equations, Half-Life Calculations, Nuclear Fission & Fusion)', defaultForm: 'Form 4', subjects: ['Physics', 'Chemistry'] },
    { keywords: ['mole concept', 'molar mass', 'stoichiometry', 'avogadro', 'empirical formula'], topic: 'Chapter 3: The Mole Concept and Related Calculations (Avogadro Constant, Molar Mass, Molar Gas Volume at STP 22.4 dm³ & Stoichiometric Reacting Masses)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
    { keywords: ['titration', 'molarity', 'volumetric analysis'], topic: 'Chapter 4: Volumetric Analysis (Standard Solutions, Acid-Base Titration Apparatus, Choice of Indicators, Molarity M = conc/Mr & Percentage Purity/Water of Crystallisation)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
    { keywords: ['electrolysis', 'faraday', 'cathode', 'anode'], topic: 'Chapter 5: Ionic Theory and Electrolysis (Electrolytes vs Non-Electrolytes, Preferential Discharge of Ions, Faraday First & Second Laws of Electrolysis & Industrial Applications)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
    { keywords: ['homologous series', 'alkane', 'alkene', 'alkyne', 'carboxylic acid'], topic: 'Chapter 2: Introduction to Organic Chemistry (Homologous Series, Isomerism, Alkanes, Alkenes, Alkynes, Alcohols/Alkanols, Carboxylic Acids/Alkanoic Acids, Esterification & Soap/Polymers)', defaultForm: 'Form 4', subjects: ['Chemistry'] },
    { keywords: ['photosynthesis', 'digestive system', 'food test', 'balanced diet'], topic: 'Chapter 1: Nutrition (Concept of Nutrition, Food Nutrients, Biochemical Food Tests, Balanced Diet, Digestive System in Humans & Photosynthesis in Plants)', defaultForm: 'Form 2', subjects: ['Biology'] },
    { keywords: ['osmosis', 'transpiration', 'xylem', 'phloem', 'mammalian heart'], topic: 'Chapter 2: Transport of Materials in Living Things (Diffusion, Osmosis & Mass Flow; Mammalian Heart, Blood Vessels, Blood Groups; Xylem, Phloem & Transpiration)', defaultForm: 'Form 2', subjects: ['Biology'] },
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

  const focusedTitle = siteResources?.focusedResource?.title;
  const focusedIsBook =
    siteResources?.focusedResource?.category?.toLowerCase().includes('book') ||
    siteResources?.focusedResource?.title?.toLowerCase().includes('book');

  const matchedBookTitle =
    (focusedTitle && focusedIsBook ? focusedTitle : undefined) ||
    siteResources?.books?.[0]?.title ||
    `Official TIE ${cls} ${subject} Student's Textbook`;
  const matchedPaperTitle =
    (focusedTitle && !focusedIsBook ? focusedTitle : undefined) ||
    (siteResources?.papers?.[0]
      ? `${siteResources.papers[0].title} (${siteResources.papers[0].year})`
      : `NECTA ${cls} ${subject} Past Examination Paper`);

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

  const rotateQuizOptions = (
    options: string[],
    correctIndex: number,
    shiftSeed: number
  ): { options: string[]; correctIndex: number } => {
    if (!Array.isArray(options) || options.length < 2) {
      return { options, correctIndex: 0 };
    }
    const safeIdx = Math.max(0, Math.min(options.length - 1, correctIndex));
    const correctVal = options[safeIdx];
    const len = options.length;
    const shift = ((shiftSeed % len) + len) % len;
    if (shift === 0) return { options: [...options], correctIndex: safeIdx };
    const rotated = new Array<string>(len);
    for (let i = 0; i < len; i++) {
      rotated[(i + shift) % len] = options[i];
    }
    const newCorrect = rotated.indexOf(correctVal);
    return { options: rotated, correctIndex: newCorrect >= 0 ? newCorrect : 0 };
  };

  const buildAdditionalSubjectQuestions = (): Array<Omit<QuizItem, 'topic' | 'subTopic' | 'sourceRef'>> => {
    const subT = (i: number) => availableSubTopics[i % Math.max(1, availableSubTopics.length)] || focusSubTopic;

    if (subLower.includes('math') || subLower.includes('hisabati') || subLower.includes('kuhesabu')) {
      return [
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Solve for $x$ in the linear fractional equation: $\\frac{2x + 2}{3} - \\frac{x - 2}{4} = 2$`,
          options: ['$x = 2$', '$x = 4$', '$x = 3$', '$x = 5$'],
          correctIndex: 0,
          explanation: `Step 1: Multiply every term by the LCM of $3$ and $4$, which is $12$: $4(2x + 2) - 3(x - 2) = 24$. Step 2: Expand brackets: $8x + 8 - 3x + 6 = 24 \\Rightarrow 5x + 14 = 24$. Step 3: $5x = 10 \\Rightarrow x = 2$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] If $a * b = a^2 + 2ab - b^2$, evaluate $3 * 2$`,
          options: ['$17$', '$13$', '$21$', '$9$'],
          correctIndex: 0,
          explanation: `Step 1: Substitute $a = 3$ and $b = 2$ into the binary operation $a * b = a^2 + 2ab - b^2$. Step 2: $3 * 2 = (3)^2 + 2(3)(2) - (2)^2 = 9 + 12 - 4 = 17$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Find the sum of the interior angles of a regular $10$-sided polygon (decagon) and the size of each interior angle`,
          options: [
            'Sum $= 1440^\\circ$ ; Each interior angle $= 144^\\circ$',
            'Sum $= 1800^\\circ$ ; Each interior angle $= 180^\\circ$',
            'Sum $= 1260^\\circ$ ; Each interior angle $= 126^\\circ$',
            'Sum $= 1080^\\circ$ ; Each interior angle $= 108^\\circ$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Sum of interior angles $= (n - 2) \\times 180^\\circ = (10 - 2) \\times 180^\\circ = 8 \\times 180^\\circ = 1440^\\circ$. Step 2: Each interior angle $= \\frac{1440^\\circ}{10} = 144^\\circ$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Simplify the algebraic fraction: $\\frac{x^2 - 9}{x^2 + 5x + 6}$ for $x \\neq -3, -2$`,
          options: [
            '$\\frac{x - 3}{x + 2}$',
            '$\\frac{x + 3}{x + 2}$',
            '$\\frac{x - 3}{x - 2}$',
            '$\\frac{x - 9}{x + 6}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Factorise numerator using difference of two squares: $x^2 - 9 = (x - 3)(x + 3)$. Step 2: Factorise denominator: $x^2 + 5x + 6 = (x + 2)(x + 3)$. Step 3: Cancel common factor $(x + 3)$ to get $\\frac{x - 3}{x + 2}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] A ladder $13\\text{ m}$ long leans against a vertical wall with its foot $5\\text{ m}$ from the base of the wall. How high up the wall does the ladder reach?`,
          options: ['$12\\text{ m}$', '$8\\text{ m}$', '$10\\text{ m}$', '$11\\text{ m}$'],
          correctIndex: 0,
          explanation: `Step 1: Apply Pythagoras' theorem $h^2 + b^2 = c^2$, where $b = 5\\text{ m}$ and $c = 13\\text{ m}$. Step 2: $h = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12\\text{ m}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Find the equation of a straight line with gradient $m = -2$ passing through the point $(3, 5)$`,
          options: [
            '$y = -2x + 11$',
            '$y = -2x - 1$',
            '$y = 2x - 1$',
            '$y = -2x + 5$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Use point-slope formula $y - y_1 = m(x - x_1)$. Step 2: $y - 5 = -2(x - 3) \\Rightarrow y - 5 = -2x + 6 \\Rightarrow y = -2x + 11$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Three bells toll together at intervals of $12$, $15$, and $20$ minutes respectively. If they toll together at $8:00\\text{ AM}$, at what time will they next toll together?`,
          options: ['$9:00\\text{ AM}$', '$8:45\\text{ AM}$', '$9:30\\text{ AM}$', '$10:00\\text{ AM}$'],
          correctIndex: 0,
          explanation: `Step 1: Find the LCM of $12$, $15$, and $20$: $12 = 2^2 \\times 3$, $15 = 3 \\times 5$, $20 = 2^2 \\times 5 \\Rightarrow \\text{LCM} = 2^2 \\times 3 \\times 5 = 60\\text{ minutes}$ ($1\\text{ hour}$). Step 2: $8:00\\text{ AM} + 1\\text{ hour} = 9:00\\text{ AM}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] If $\\log_{10} x = 2 \\log_{10} 3 + \\log_{10} 5$, find the exact value of $x$`,
          options: ['$x = 45$', '$x = 30$', '$x = 15$', '$x = 75$'],
          correctIndex: 0,
          explanation: `Step 1: Apply the power and product laws of logarithms: $2 \\log_{10} 3 + \\log_{10} 5 = \\log_{10}(3^2) + \\log_{10} 5 = \\log_{10}(9 \\times 5) = \\log_{10} 45$. Step 2: Therefore, $x = 45$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] The ages of Neema and Baraka are in the ratio $3 : 5$. If the sum of their ages is $32\\text{ years}$, find Baraka's age`,
          options: ['$20\\text{ years}$', '$12\\text{ years}$', '$24\\text{ years}$', '$18\\text{ years}$'],
          correctIndex: 0,
          explanation: `Step 1: Total ratio parts $= 3 + 5 = 8$ parts. Step 2: Baraka's share $= \\frac{5}{8} \\times 32 = 5 \\times 4 = 20\\text{ years}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Find the inverse of the matrix $A = \\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix}$`,
          options: [
            '$A^{-1} = \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$',
            '$A^{-1} = \\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix}$',
            '$A^{-1} = \\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}$',
            '$A^{-1} = \\begin{pmatrix} -2 & 1 \\\\ 5 & -3 \\end{pmatrix}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Determinant $|A| = (3)(2) - (1)(5) = 6 - 5 = 1$. Step 2: Swap main diagonal elements and negate off-diagonal elements: $A^{-1} = \\frac{1}{1}\\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Calculate the compound amount when $\\text{TZS } 100,000$ is invested for $2\\text{ years}$ at $10\\%$ per annum compounded annually`,
          options: [
            '$\\text{TZS } 121,000$',
            '$\\text{TZS } 120,000$',
            '$\\text{TZS } 110,000$',
            '$\\text{TZS } 133,100$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Use the compound interest formula $A = P\\left(1 + \\frac{r}{100}\\right)^n$. Step 2: $A = 100,000 \\times (1.10)^2 = 100,000 \\times 1.21 = \\text{TZS } 121,000$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] In an Arithmetic Progression (A.P.), the first term is $a_1 = 7$ and the common difference is $d = 4$. Find the $12\\text{th}$ term ($a_{12}$) and the sum of the first $12$ terms ($S_{12}$)`,
          options: [
            '$a_{12} = 51$ ; $S_{12} = 348$',
            '$a_{12} = 55$ ; $S_{12} = 360$',
            '$a_{12} = 47$ ; $S_{12} = 324$',
            '$a_{12} = 51$ ; $S_{12} = 312$',
          ],
          correctIndex: 0,
          explanation: `Step 1: $a_{12} = a_1 + (12 - 1)d = 7 + 11(4) = 7 + 44 = 51$. Step 2: $S_{12} = \\frac{12}{2}(a_1 + a_{12}) = 6(7 + 51) = 6 \\times 58 = 348$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] If $y$ varies inversely as the square of $x$ ($y \\propto \\frac{1}{x^2}$) and $y = 4$ when $x = 3$, find the value of $y$ when $x = 6$`,
          options: ['$y = 1$', '$y = 2$', '$y = 8$', '$y = 0.5$'],
          correctIndex: 0,
          explanation: `Step 1: $y = \\frac{k}{x^2} \\Rightarrow k = y x^2 = 4 \\times 3^2 = 36$. Step 2: When $x = 6$, $y = \\frac{36}{6^2} = \\frac{36}{36} = 1$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] In a class of $45$ students, $28$ study Physics, $22$ study Chemistry, and $3$ study neither subject. How many students study BOTH Physics and Chemistry?`,
          options: ['$8$ students', '$5$ students', '$11$ students', '$14$ students'],
          correctIndex: 0,
          explanation: `Step 1: $n(P \\cup C) = 45 - 3 = 42$. Step 2: Using $n(P \\cup C) = n(P) + n(C) - n(P \\cap C) \\Rightarrow 42 = 28 + 22 - n(P \\cap C) \\Rightarrow n(P \\cap C) = 50 - 42 = 8$ students.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Given that $\\sin \\theta = \\frac{3}{5}$ where $\\theta$ is an acute angle, evaluate $\\cos \\theta + \\tan \\theta$`,
          options: [
            '$\\frac{31}{20}$ (or $1.55$)',
            '$\\frac{7}{5}$ (or $1.40$)',
            '$\\frac{19}{20}$ (or $0.95$)',
            '$\\frac{23}{15}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: By Pythagoras' theorem, adjacent side $= \\sqrt{5^2 - 3^2} = 4$. Step 2: $\\cos \\theta = \\frac{4}{5}$ and $\\tan \\theta = \\frac{3}{4}$. Step 3: $\\frac{4}{5} + \\frac{3}{4} = \\frac{16 + 15}{20} = \\frac{31}{20} = 1.55$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Calculate the curved surface area of a right circular cylinder of radius $r = 7\\text{ cm}$ and height $h = 10\\text{ cm}$ (Take $\\pi = \\frac{22}{7}$)`,
          options: ['$440\\text{ cm}^2$', '$1,540\\text{ cm}^2$', '$748\\text{ cm}^2$', '$220\\text{ cm}^2$'],
          correctIndex: 0,
          explanation: `Step 1: Curved surface area of a cylinder $= 2 \\pi r h$. Step 2: $\\text{CSA} = 2 \\times \\frac{22}{7} \\times 7 \\times 10 = 44 \\times 10 = 440\\text{ cm}^2$.`,
        },
      ];
    }

    if (subLower.includes('physics')) {
      return [
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Two resistors of $4\\text{ }\\Omega$ and $12\\text{ }\\Omega$ are connected in parallel across a battery. Calculate their equivalent (effective) resistance $R_T$`,
          options: ['$3.0\\text{ }\\Omega$', '$16.0\\text{ }\\Omega$', '$8.0\\text{ }\\Omega$', '$0.33\\text{ }\\Omega$'],
          correctIndex: 0,
          explanation: `Step 1: For two resistors in parallel, $R_T = \\frac{R_1 \\times R_2}{R_1 + R_2}$. Step 2: $R_T = \\frac{4 \\times 12}{4 + 12} = \\frac{48}{16} = 3.0\\text{ }\\Omega$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] A stone of mass $0.5\\text{ kg}$ is thrown vertically upwards with an initial velocity of $20\\text{ m/s}$. Taking $g = 10\\text{ m/s}^2$, calculate the maximum height reached`,
          options: ['$20\\text{ m}$', '$10\\text{ m}$', '$40\\text{ m}$', '$15\\text{ m}$'],
          correctIndex: 0,
          explanation: `Step 1: At maximum height, final velocity $v = 0\\text{ m/s}$. Step 2: Using $v^2 = u^2 - 2gh \\Rightarrow 0 = 20^2 - 2(10)h \\Rightarrow 20h = 400 \\Rightarrow h = 20\\text{ m}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] A machine with a Velocity Ratio ($VR$) of $5$ requires an effort of $250\\text{ N}$ to lift a load of $1,000\\text{ N}$. Calculate its Mechanical Advantage ($MA$) and Efficiency ($\\eta$)`,
          options: [
            '$MA = 4$ ; Efficiency $= 80\\%$',
            '$MA = 5$ ; Efficiency $= 100\\%$',
            '$MA = 4$ ; Efficiency $= 75\\%$',
            '$MA = 0.25$ ; Efficiency $= 20\\%$',
          ],
          correctIndex: 0,
          explanation: `Step 1: $MA = \\frac{\\text{Load}}{\\text{Effort}} = \\frac{1000\\text{ N}}{250\\text{ N}} = 4$. Step 2: Efficiency $\\eta = \\frac{MA}{VR} \\times 100\\% = \\frac{4}{5} \\times 100\\% = 80\\%$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Calculate the liquid pressure at a depth of $8\\text{ m}$ in freshwater of density $\\rho = 1,000\\text{ kg/m}^3$ (Take $g = 10\\text{ N/kg}$)`,
          options: ['$80,000\\text{ Pa}$ ($80\\text{ kPa}$)', '$8,000\\text{ Pa}$', '$125\\text{ Pa}$', '$800,000\\text{ Pa}$'],
          correctIndex: 0,
          explanation: `Step 1: Hydrostatic pressure formula $P = \\rho g h$. Step 2: $P = 1,000 \\times 10 \\times 8 = 80,000\\text{ Pa}$ ($80\\text{ kPa}$).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] An uniform metre rule is pivoted at the $50\\text{ cm}$ mark. A mass of $40\\text{ g}$ is suspended at the $20\\text{ cm}$ mark. Where must a $60\\text{ g}$ mass be suspended to balance the rule horizontally?`,
          options: [
            'At the $70\\text{ cm}$ mark ($20\\text{ cm}$ from the pivot)',
            'At the $80\\text{ cm}$ mark ($30\\text{ cm}$ from the pivot)',
            'At the $65\\text{ cm}$ mark ($15\\text{ cm}$ from the pivot)',
            'At the $75\\text{ cm}$ mark ($25\\text{ cm}$ from the pivot)',
          ],
          correctIndex: 0,
          explanation: `Step 1: By the Principle of Moments, Anticlockwise Moment $=$ Clockwise Moment: $40 \\times (50 - 20) = 60 \\times d_2$. Step 2: $40 \\times 30 = 60 d_2 \\Rightarrow d_2 = \\frac{1200}{60} = 20\\text{ cm}$ to the right of $50\\text{ cm}$, which is the $70\\text{ cm}$ mark.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] An electric kettle rated $2,000\\text{ W}$, $240\\text{ V}$ is switched on for $3\\text{ minutes}$. Calculate the electrical energy consumed in Joules`,
          options: ['$360,000\\text{ J}$ ($360\\text{ kJ}$)', '$6,000\\text{ J}$', '$480,000\\text{ J}$', '$120,000\\text{ J}$'],
          correctIndex: 0,
          explanation: `Step 1: Convert time to seconds: $t = 3 \\times 60 = 180\\text{ s}$. Step 2: Electrical energy $E = P \\times t = 2,000\\text{ W} \\times 180\\text{ s} = 360,000\\text{ J}$ ($360\\text{ kJ}$).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] An object weighs $35\\text{ N}$ in air and $27\\text{ N}$ when completely immersed in water. Calculate the upthrust (buoyant force) and the volume of water displaced ($\\rho_w = 1000\\text{ kg/m}^3, g = 10\\text{ N/kg}$)`,
          options: [
            'Upthrust $= 8\\text{ N}$ ; Volume $= 8.0 \\times 10^{-4}\\text{ m}^3$',
            'Upthrust $= 62\\text{ N}$ ; Volume $= 6.2 \\times 10^{-3}\\text{ m}^3$',
            'Upthrust $= 8\\text{ N}$ ; Volume $= 8.0 \\times 10^{-2}\\text{ m}^3$',
            'Upthrust $= 12\\text{ N}$ ; Volume $= 1.2 \\times 10^{-3}\\text{ m}^3$',
          ],
          correctIndex: 0,
          explanation: `Step 1: By Archimedes' Principle, Upthrust $U = W_{\\text{air}} - W_{\\text{water}} = 35\\text{ N} - 27\\text{ N} = 8\\text{ N}$. Step 2: Since $U = \\rho_w g V$, $V = \\frac{8}{1000 \\times 10} = 8.0 \\times 10^{-4}\\text{ m}^3$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] A body of mass $4\\text{ kg}$ moving at $6\\text{ m/s}$ collides with and sticks to a stationary body of mass $2\\text{ kg}$. Calculate their common velocity after collision`,
          options: ['$4.0\\text{ m/s}$', '$3.0\\text{ m/s}$', '$2.0\\text{ m/s}$', '$5.0\\text{ m/s}$'],
          correctIndex: 0,
          explanation: `Step 1: By Conservation of Linear Momentum, $m_1 u_1 + m_2 u_2 = (m_1 + m_2)v$. Step 2: $(4 \\times 6) + (2 \\times 0) = (4 + 2)v \\Rightarrow 24 = 6v \\Rightarrow v = 4.0\\text{ m/s}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] A spiral spring of natural length $15\\text{ cm}$ extends to $19\\text{ cm}$ when a load of $20\\text{ N}$ is hung from it. What will be its total length when a load of $35\\text{ N}$ is applied (within the elastic limit)?`,
          options: ['$22\\text{ cm}$', '$7\\text{ cm}$', '$25\\text{ cm}$', '$21\\text{ cm}$'],
          correctIndex: 0,
          explanation: `Step 1: By Hooke's Law $F = ke$, spring constant $k = \\frac{20\\text{ N}}{19 - 15\\text{ cm}} = 5\\text{ N/cm}$. Step 2: For $35\\text{ N}$, extension $e_2 = \\frac{35}{5} = 7\\text{ cm}$. Total length $= 15 + 7 = 22\\text{ cm}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Calculate the capacitance $C$ of a parallel-plate capacitor that stores a charge of $6.0 \\times 10^{-4}\\text{ C}$ when connected across a $12\\text{ V}$ supply`,
          options: ['$50\\text{ }\\mu\\text{F}$ ($5.0 \\times 10^{-5}\\text{ F}$)', '$7.2 \\times 10^{-3}\\text{ F}$', '$20\\text{ }\\mu\\text{F}$', '$100\\text{ }\\mu\\text{F}$'],
          correctIndex: 0,
          explanation: `Step 1: Use $Q = CV \\Rightarrow C = \\frac{Q}{V}$. Step 2: $C = \\frac{6.0 \\times 10^{-4}\\text{ C}}{12\\text{ V}} = 5.0 \\times 10^{-5}\\text{ F} = 50\\text{ }\\mu\\text{F}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] A simple pendulum completes $40$ oscillations in $80\\text{ seconds}$. Calculate its period $T$ and frequency $f$`,
          options: [
            '$T = 2.0\\text{ s}$ ; $f = 0.5\\text{ Hz}$',
            '$T = 0.5\\text{ s}$ ; $f = 2.0\\text{ Hz}$',
            '$T = 2.0\\text{ s}$ ; $f = 2.0\\text{ Hz}$',
            '$T = 4.0\\text{ s}$ ; $f = 0.25\\text{ Hz}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Period $T = \\frac{\\text{Total time}}{\\text{Number of oscillations}} = \\frac{80\\text{ s}}{40} = 2.0\\text{ s}$. Step 2: Frequency $f = \\frac{1}{T} = \\frac{1}{2.0} = 0.5\\text{ Hz}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] An object is placed $30\\text{ cm}$ in front of a converging (convex) lens of focal length $f = 10\\text{ cm}$. Calculate the image distance $v$`,
          options: ['$v = 15\\text{ cm}$ (real image)', '$v = 20\\text{ cm}$', '$v = 30\\text{ cm}$', '$v = 7.5\\text{ cm}$'],
          correctIndex: 0,
          explanation: `Step 1: Use the real-is-positive lens formula $\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$. Step 2: $\\frac{1}{10} = \\frac{1}{30} + \\frac{1}{v} \\Rightarrow \\frac{1}{v} = \\frac{3 - 1}{30} = \\frac{2}{30} \\Rightarrow v = 15\\text{ cm}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] A step-down transformer has $1,200$ turns in the primary coil and $60$ turns in the secondary coil. If the primary is connected to $240\\text{ V AC}$, calculate the secondary output voltage $V_S$`,
          options: ['$12\\text{ V}$', '$24\\text{ V}$', '$4,800\\text{ V}$', '$6\\text{ V}$'],
          correctIndex: 0,
          explanation: `Step 1: Transformer turns ratio equation: $\\frac{V_S}{V_P} = \\frac{N_S}{N_P}$. Step 2: $V_S = 240 \\times \\frac{60}{1200} = \\frac{240}{20} = 12\\text{ V}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] How much thermal energy is required to raise the temperature of $2.0\\text{ kg}$ of water from $25^\\circ\\text{C}$ to $75^\\circ\\text{C}$? [Specific heat capacity of water $c = 4,200\\text{ J/(kg K)}$]`,
          options: ['$420,000\\text{ J}$ ($420\\text{ kJ}$)', '$210,000\\text{ J}$', '$84,000\\text{ J}$', '$630,000\\text{ J}$'],
          correctIndex: 0,
          explanation: `Step 1: Use $Q = m c \\Delta \\theta$ where $\\Delta \\theta = 75 - 25 = 50\\text{ K}$. Step 2: $Q = 2.0 \\times 4,200 \\times 50 = 420,000\\text{ J}$ ($420\\text{ kJ}$).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] A radioactive sample of Iodine-$131$ has a half-life of $8\\text{ days}$. If the initial mass is $64\\text{ g}$, what mass remains undecayed after $24\\text{ days}$?`,
          options: ['$8\\text{ g}$', '$16\\text{ g}$', '$4\\text{ g}$', '$32\\text{ g}$'],
          correctIndex: 0,
          explanation: `Step 1: Number of half-lives $n = \\frac{24\\text{ days}}{8\\text{ days}} = 3$. Step 2: Remaining mass $m = m_0 \\left(\\frac{1}{2}\\right)^n = 64 \\times \\frac{1}{8} = 8\\text{ g}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] In a Physics Paper 2 Simple Pendulum experiment, a student plots $T^2\\text{ (s}^2\\text{)}$ against length $L\\text{ (m)}$ and obtains a straight-line slope $S = 4.02\\text{ s}^2/\\text{m}$. Calculate the acceleration due to gravity $g$`,
          options: ['$g = 9.82\\text{ m/s}^2$', '$g = 10.50\\text{ m/s}^2$', '$g = 8.90\\text{ m/s}^2$', '$g = 4.02\\text{ m/s}^2$'],
          correctIndex: 0,
          explanation: `Step 1: From $T = 2\\pi\\sqrt{L/g}$, squaring gives $T^2 = \\left(\\frac{4\\pi^2}{g}\\right)L$, so $\\text{Slope } S = \\frac{4\\pi^2}{g}$. Step 2: $g = \\frac{4\\pi^2}{4.02} = \\frac{39.478}{4.02} \\approx 9.82\\text{ m/s}^2$.`,
        },
      ];
    }

    if (subLower.includes('chemistry')) {
      return [
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Calculate the volume occupied at STP by $8.8\\text{ g}$ of carbon dioxide ($\text{CO}_2$) gas [Given: $\text{C} = 12, \text{O} = 16$, Molar Volume at STP $= 22.4\\text{ dm}^3$ ]`,
          options: ['$4.48\\text{ dm}^3$', '$2.24\\text{ dm}^3$', '$11.20\\text{ dm}^3$', '$8.96\\text{ dm}^3$'],
          correctIndex: 0,
          explanation: `Step 1: Molar mass of $\\text{CO}_2 = 12 + 2(16) = 44\\text{ g/mol}$. Step 2: Moles $n = \\frac{8.8}{44} = 0.20\\text{ mol}$. Step 3: Volume at STP $= 0.20 \\times 22.4 = 4.48\\text{ dm}^3$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Determine the oxidation state (number) of Chromium ($\text{Cr}$) in the dichromate ion $\\text{Cr}_2\\text{O}_7^{2-}$`,
          options: ['$+6$', '$+3$', '$+7$', '$+12$'],
          correctIndex: 0,
          explanation: `Step 1: Let oxidation state of $\\text{Cr}$ be $x$, and $\\text{O} = -2$. Step 2: $2x + 7(-2) = -2 \\Rightarrow 2x - 14 = -2 \\Rightarrow 2x = +12 \\Rightarrow x = +6$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] In the Haber process $\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g)\\text{ }(\\Delta H = -92\\text{ kJ/mol})$, which conditions favour maximum equilibrium yield of ammonia according to Le Chatelier's Principle?`,
          options: [
            'High pressure ($200\\text{ atm}$), moderate temperature ($450^\\circ\\text{C}$), and finely divided iron catalyst',
            'Low pressure ($1\\text{ atm}$) and very high temperature ($1000^\\circ\\text{C}$)',
            'High temperature ($800^\\circ\\text{C}$) and vanadium(V) oxide catalyst',
            'Atmospheric pressure and room temperature without catalyst',
          ],
          correctIndex: 0,
          explanation: `Step 1: Forward reaction reduces gas moles ($4\\text{ mol} \\to 2\\text{ mol}$), so high pressure shifts equilibrium to the right. Step 2: Forward reaction is exothermic, so moderate temperature ($450^\\circ\\text{C}$) with an iron ($\text{Fe}$) catalyst gives optimal rate and yield.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Which chemical reagent is used in the laboratory to distinguish between ethene (an alkene) and ethane (an alkane)?`,
          options: [
            'Bromine water (or acidified $\\text{KMnO}_4$), which is decolourized by ethene but not ethane',
            'Universal indicator solution',
            'Limewater ($\\text{Ca(OH)}_2$), which turns milky with ethane',
            'Anhydrous copper(II) sulphate powder',
          ],
          correctIndex: 0,
          explanation: `Step 1: Ethene ($\\text{C}_2\\text{H}_4$) has a $\\text{C}=\\text{C}$ double bond (unsaturated) and undergoes addition reaction to decolourize reddish-brown bromine water. Step 2: Ethane ($\\text{C}_2\\text{H}_6$) is saturated and does not react in the dark.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Calculate the percentage composition by mass of Nitrogen in ammonium nitrate ($\text{NH}_4\text{NO}_3$) [Given: $\text{N} = 14, \text{H} = 1, \text{O} = 16$]`,
          options: ['$35.0\\%$', '$17.5\\%$', '$28.0\\%$', '$42.0\\%$'],
          correctIndex: 0,
          explanation: `Step 1: Molar mass of $\\text{NH}_4\\text{NO}_3 = 14 + 4(1) + 14 + 3(16) = 80\\text{ g/mol}$. Step 2: Total mass of Nitrogen $= 2 \\times 14 = 28\\text{ g}$. Step 3: $\\%\\text{ N} = \\frac{28}{80} \\times 100\\% = 35.0\\%$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] When aqueous barium chloride ($\text{BaCl}_2$) is added to a solution followed by dilute hydrochloric acid, a thick white precipitate insoluble in dilute $\text{HCl}$ is formed. Which anion is confirmed?`,
          options: [
            'Sulphate ion ($\\text{SO}_4^{2-}$)',
            'Carbonate ion ($\\text{CO}_3^{2-}$)',
            'Sulphite ion ($\\text{SO}_3^{2-}$)',
            'Nitrate ion ($\\text{NO}_3^-$)',
          ],
          correctIndex: 0,
          explanation: `Step 1: $\\text{Ba}^{2+}(aq) + \\text{SO}_4^{2-}(aq) \\to \\text{BaSO}_4(s)$ (white precipitate). Step 2: Unlike $\\text{BaCO}_3$ or $\\text{BaSO}_3$, barium sulphate ($\\text{BaSO}_4$) is insoluble in dilute $\\text{HCl}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] If $50\\text{ cm}^3$ of $2.0\\text{ M}$ $\\text{H}_2\\text{SO}_4$ stock solution is diluted with distilled water to make $500\\text{ cm}^3$ of solution, calculate the molarity of the diluted solution`,
          options: ['$0.20\\text{ M}$', '$0.40\\text{ M}$', '$0.10\\text{ M}$', '$0.50\\text{ M}$'],
          correctIndex: 0,
          explanation: `Step 1: Apply the dilution law $M_1 V_1 = M_2 V_2$. Step 2: $2.0 \\times 50 = M_2 \\times 500 \\Rightarrow M_2 = \\frac{100}{500} = 0.20\\text{ M}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Which method is used to remove permanent hardness of water caused by dissolved $\\text{CaSO}_4$ and $\\text{MgSO}_4$?`,
          options: [
            'Addition of washing soda ($\\text{Na}_2\\text{CO}_3$) or use of an ion-exchange resin',
            'Simple boiling of the water only',
            'Filtration through sand and gravel',
            'Chlorination of the water supply',
          ],
          correctIndex: 0,
          explanation: `Step 1: Permanent hardness is caused by $\\text{Ca}^{2+}$ and $\\text{Mg}^{2+}$ sulphates/chlorides and cannot be removed by boiling. Step 2: Adding washing soda precipitates insoluble carbonates: $\\text{CaSO}_4 + \\text{Na}_2\\text{CO}_3 \\to \\text{CaCO}_3(s) + \\text{Na}_2\\text{SO}_4$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] In the extraction of iron in the Blast Furnace, what is the primary role of limestone ($\text{CaCO}_3$)?`,
          options: [
            'It decomposes to $\\text{CaO}$, which reacts with sandy silica ($\\text{SiO}_2$) impurities to form molten calcium silicate slag ($\\text{CaSiO}_3$)',
            'It oxidizes iron(II) to iron(III)',
            'It acts as a catalyst to lower the melting point of iron',
            'It cools the bottom of the blast furnace',
          ],
          correctIndex: 0,
          explanation: `Step 1: $\\text{CaCO}_3(s) \\to \\text{CaO}(s) + \\text{CO}_2(g)$. Step 2: Basic $\\text{CaO}$ neutralizes acidic impurity $\\text{SiO}_2$: $\\text{CaO} + \\text{SiO}_2 \\to \\text{CaSiO}_3(l)$ (slag).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Two isotopes of Chlorine are $^{35}_{17}\\text{Cl}$ ($75\\%$ abundance) and $^{37}_{17}\\text{Cl}$ ($25\\%$ abundance). Calculate the Relative Atomic Mass ($RAM$) of Chlorine`,
          options: ['$35.5$', '$36.0$', '$35.2$', '$36.5$'],
          correctIndex: 0,
          explanation: `Step 1: $RAM = \\frac{(35 \\times 75) + (37 \\times 25)}{100}$. Step 2: $RAM = \\frac{2625 + 925}{100} = \\frac{3550}{100} = 35.5$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] What is the pH of a $0.001\\text{ M}$ ($1.0 \\times 10^{-3}\\text{ M}$) aqueous solution of hydrochloric acid ($\text{HCl}$)?`,
          options: ['$\\text{pH} = 3$', '$\\text{pH} = 1$', '$\\text{pH} = 11$', '$\\text{pH} = 4$'],
          correctIndex: 0,
          explanation: `Step 1: $\\text{HCl}$ is a strong monobasic acid that ionizes completely, so $[\\text{H}^+] = 1.0 \\times 10^{-3}\\text{ M}$. Step 2: $\\text{pH} = -\\log_{10}[\\text{H}^+] = -\\log_{10}(10^{-3}) = 3$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] In a NECTA Chemistry Paper 2 titration, $25.0\\text{ cm}^3$ of $0.10\\text{ M }\\text{Na}_2\\text{CO}_3$ required $20.0\\text{ cm}^3$ of $\\text{HCl}$ for complete neutralization ($\\text{Na}_2\\text{CO}_3 + 2\\text{HCl} \\to 2\\text{NaCl} + \\text{H}_2\\text{O} + \\text{CO}_2$). Calculate the molarity of $\\text{HCl}$`,
          options: ['$0.25\\text{ M}$', '$0.125\\text{ M}$', '$0.20\\text{ M}$', '$0.50\\text{ M}$'],
          correctIndex: 0,
          explanation: `Step 1: Use $\\frac{M_A V_A}{M_B V_B} = \\frac{n_A}{n_B}$ where $n_A = 2, n_B = 1$. Step 2: $\\frac{M_A \\times 20.0}{0.10 \\times 25.0} = \\frac{2}{1} \\Rightarrow M_A = \\frac{2 \\times 2.5}{20.0} = 0.25\\text{ M}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] According to Faraday's First Law of Electrolysis, what mass of Copper ($\\text{Cu} = 63.5$) is deposited at the cathode when a current of $2.0\\text{ A}$ flows through aqueous $\\text{CuSO}_4$ for $1,930\\text{ seconds}$? ($1\\text{ F} = 96,500\\text{ C/mol}$)`,
          options: ['$1.27\\text{ g}$', '$2.54\\text{ g}$', '$0.635\\text{ g}$', '$3.81\\text{ g}$'],
          correctIndex: 0,
          explanation: `Step 1: Charge $Q = I t = 2.0 \\times 1930 = 3,860\\text{ C}$. Step 2: Since $\\text{Cu}^{2+} + 2e^- \\to \\text{Cu}$, $z = 2$. Mass $m = \\frac{Q \\times M}{z \\times F} = \\frac{3860 \\times 63.5}{2 \\times 96500} = 1.27\\text{ g}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] An organic compound contains $52.2\\%$ Carbon, $13.0\\%$ Hydrogen, and $34.8\\%$ Oxygen by mass. Determine its empirical formula [$\\text{C}=12, \\text{H}=1, \\text{O}=16$]`,
          options: ['$\\text{C}_2\\text{H}_6\\text{O}$', '$\\text{CH}_2\\text{O}$', '$\\text{C}_2\\text{H}_4\\text{O}_2$', '$\\text{C}_3\\text{H}_8\\text{O}$'],
          correctIndex: 0,
          explanation: `Step 1: Mole ratios: $\\text{C} = \\frac{52.2}{12} = 4.35$; $\\text{H} = \\frac{13.0}{1} = 13.0$; $\\text{O} = \\frac{34.8}{16} = 2.175$. Step 2: Divide by smallest ($2.175$): $\\text{C}=2, \\text{H}=6, \\text{O}=1 \\Rightarrow \\text{C}_2\\text{H}_6\\text{O}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] In Qualitative Analysis, when aqueous sodium hydroxide ($\\text{NaOH}$) is added dropwise and then in excess to a salt solution, a pale blue precipitate forms which is insoluble in excess $\\text{NaOH}$. Which cation is present?`,
          options: ['Copper(II) ion ($\\text{Cu}^{2+}$)', 'Zinc(II) ion ($\\text{Zn}^{2+}$)', 'Iron(III) ion ($\\text{Fe}^{3+}$)', 'Calcium(II) ion ($\\text{Ca}^{2+}$)'],
          correctIndex: 0,
          explanation: `Step 1: $\\text{Cu}^{2+}(aq) + 2\\text{OH}^-(aq) \\to \\text{Cu(OH)}_2(s)$, which is a characteristic pale blue precipitate insoluble in excess $\\text{NaOH}$ (but soluble in excess aqueous ammonia to form deep blue $[\\text{Cu(NH}_3)_4]^{2+}$).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Which indicator is suitable for the titration of a strong acid ($\\text{HCl}$) against a weak base ($\\text{Na}_2\\text{CO}_3$ or $\\text{NH}_3(aq)$)?`,
          options: ['Methyl Orange (M.O.)', 'Phenolphthalein (P.O.P.)', 'Universal Indicator Paper', 'Starch Indicator'],
          correctIndex: 0,
          explanation: `Step 1: A strong acid vs weak base titration has its equivalence point in the acidic pH range ($\\text{pH } 3.1\\text{–}4.4$), where Methyl Orange changes sharply from yellow to orange-pink.`,
        },
      ];
    }

    if (subLower.includes('biology') || subLower.includes('sayansi')) {
      return [
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] When a red blood cell is placed in a concentrated salt solution (hypertonic solution), what physiological process occurs?`,
          options: [
            'It loses water by osmosis and shrinks (crenation)',
            'It gains water by osmosis and bursts (haemolysis)',
            'It becomes fully turgid due to its rigid cell wall',
            'It undergoes plasmolysis as its cell wall detaches',
          ],
          correctIndex: 0,
          explanation: `Step 1: In a hypertonic solution, water potential is higher inside the red blood cell than outside. Step 2: Water moves out by osmosis across the cell membrane, causing the red blood cell to shrink and wrinkle (crenation).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] In human blood groups (ABO system), a mother has blood group A (heterozygous $I^A I^O$) and the father has blood group B (heterozygous $I^B I^O$). Which blood groups are possible among their children?`,
          options: [
            'All four blood groups: AB, A, B, and O (in a $1 : 1 : 1 : 1$ ratio)',
            'Only blood groups A and B',
            'Only blood group AB',
            'Only blood groups A, B, and AB',
          ],
          correctIndex: 0,
          explanation: `Step 1: Parental gametes are $I^A, I^O \\times I^B, I^O$. Step 2: Offspring genotypes are $I^A I^B$ (Group AB), $I^A I^O$ (Group A), $I^B I^O$ (Group B), and $I^O I^O$ (Group O) with $25\\%$ probability each.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] In an ecological study using the capture-recapture method (Lincoln Index), $40$ Tilapia fish were captured, marked, and released. Later, $50$ fish were captured and $10$ of them had marks. Estimate the total Tilapia population $N$`,
          options: ['$200$ fish', '$100$ fish', '$400$ fish', '$90$ fish'],
          correctIndex: 0,
          explanation: `Step 1: Lincoln Index formula: $N = \\frac{n_1 \\times n_2}{m_2}$. Step 2: Substitute $n_1 = 40$, $n_2 = 50$, $m_2 = 10 \\Rightarrow N = \\frac{40 \\times 50}{10} = 200$ fish.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Which blood vessel in the mammalian circulatory system carries oxygenated blood at low pressure directly from the lungs to the left atrium of the heart?`,
          options: [
            'Pulmonary vein',
            'Pulmonary artery',
            'Aorta',
            'Hepatic portal vein',
          ],
          correctIndex: 0,
          explanation: `Step 1: Most veins carry deoxygenated blood, EXCEPT the pulmonary vein. Step 2: The pulmonary vein transports freshly oxygenated blood from the lungs into the left atrium.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] When a food sample is mixed with sodium hydroxide ($\text{NaOH}$) solution followed by a few drops of $1\\%$ copper(II) sulphate ($\text{CuSO}_4$) solution (Biuret test), a purple/violet colour appears. What nutrient is present?`,
          options: ['Proteins', 'Non-reducing sugars', 'Starch', 'Lipids'],
          correctIndex: 0,
          explanation: `Step 1: The Biuret test uses dilute $\\text{NaOH}$ and $1\\%$ $\\text{CuSO}_4$. Step 2: Peptide bonds in proteins form a purple/violet coordination complex with $\\text{Cu}^{2+}$ ions.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] In the mammalian kidney nephron, where does ultrafiltration take place and what causes the high hydrostatic pressure?`,
          options: [
            'In the glomerulus inside Bowman’s capsule, because the afferent arteriole is wider than the efferent arteriole',
            'In the Loop of Henle due to active transport of sodium ions',
            'In the collecting duct due to antidiuretic hormone (ADH)',
            'In the distal convoluted tubule due to aldosterone',
          ],
          correctIndex: 0,
          explanation: `Step 1: The afferent arteriole entering the glomerulus has a larger lumen diameter than the efferent arteriole leaving it. Step 2: This builds high hydrostatic pressure that forces water, glucose, urea, and salts into Bowman's capsule.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Calculate the Respiratory Quotient ($RQ = \\frac{\\text{Volume of CO}_2\\text{ evolved}}{\\text{Volume of O}_2\\text{ consumed}}$) when $6$ moles of $\\text{CO}_2$ are produced from $6$ moles of $\\text{O}_2$ during complete oxidation of glucose`,
          options: ['$RQ = 1.0$', '$RQ = 0.7$', '$RQ = 0.9$', '$RQ = 1.5$'],
          correctIndex: 0,
          explanation: `Step 1: Formula $RQ = \\frac{\\text{CO}_2\\text{ produced}}{\\text{O}_2\\text{ consumed}}$. Step 2: For carbohydrate (glucose) oxidation: $RQ = \\frac{6}{6} = 1.0$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Which plant hormone (phytohormone) is synthesized at the shoot apex and causes phototropism by migrating to the shaded side to stimulate cell elongation?`,
          options: ['Auxin (Indole-3-acetic acid, IAA)', 'Abscisic acid (ABA)', 'Ethylene (Ethene)', 'Cytokinin'],
          correctIndex: 0,
          explanation: `Step 1: Unilateral light causes auxins (IAA) to diffuse from the illuminated side to the shaded side of the shoot tip. Step 2: Higher auxin concentration on the shaded side promotes faster cell elongation, bending the shoot towards light.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Trace the correct sequence of neurons and structures in a spinal reflex arc when a student accidentally touches a hot object`,
          options: [
            'Pain Receptor $\\to$ Sensory Neuron $\\to$ Relay (Intermediate) Neuron in Spinal Cord $\\to$ Motor Neuron $\\to$ Effector (Biceps Muscle)',
            'Effector $\\to$ Motor Neuron $\\to$ Sensory Neuron $\\to$ Brain $\\to$ Receptor',
            'Receptor $\\to$ Motor Neuron $\\to$ Relay Neuron $\\to$ Sensory Neuron $\\to$ Effector',
            'Brain $\\to$ Relay Neuron $\\to$ Receptor $\\to$ Effector',
          ],
          correctIndex: 0,
          explanation: `Step 1: Receptor detects thermal stimulus and generates an impulse along the Sensory Neuron (dorsal root). Step 2: Relay neuron in grey matter synapses with the Motor Neuron (ventral root) to contract the Effector muscle.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Colour blindness is an X-linked recessive trait ($X^c$). If a carrier mother ($X^C X^c$) marries a normal-vision father ($X^C Y$), what is the probability that their son will be colour-blind?`,
          options: [
            '$50\\%$ of their sons ($1/2$ of sons, or $25\\%$ of all children)',
            '$100\\%$ of their sons',
            '$0\\%$ of their sons',
            '$50\\%$ of their daughters',
          ],
          correctIndex: 0,
          explanation: `Step 1: Sons inherit a $Y$ chromosome from their father and either $X^C$ ($50\\%$) or $X^c$ ($50\\%$) from their carrier mother. Step 2: Thus $1/2$ ($50\\%$) of sons will have genotype $X^c Y$ (colour-blind).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Which kingdom in the Five-Kingdom classification system consists of eukaryotic organisms with chitinous cell walls that feed heterotrophically by saprophytic absorption (e.g. Mucor, Yeast, Mushroom)?`,
          options: ['Kingdom Fungi', 'Kingdom Plantae', 'Kingdom Protoctista', 'Kingdom Monera'],
          correctIndex: 0,
          explanation: `Step 1: Kingdom Fungi members lack chlorophyll, have cell walls made of chitin (not cellulose), and secrete extracellular enzymes for saprophytic nutrition.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] In a Biology Paper 2 Food Test, why is dilute hydrochloric acid ($\\text{HCl}$) boiled with a sucrose solution before adding sodium hydroxide ($\\text{NaOH}$) and Benedict's solution?`,
          options: [
            'Dilute $\\text{HCl}$ hydrolyzes the glycosidic bond in non-reducing sugar (sucrose) into reducing sugars (glucose and fructose), and $\\text{NaOH}$ neutralizes excess acid',
            'Dilute $\\text{HCl}$ oxidizes starch directly into proteins',
            'Dilute $\\text{HCl}$ acts as a blue-black colour indicator',
            'Dilute $\\text{HCl}$ emulsifies lipids into droplets',
          ],
          correctIndex: 0,
          explanation: `Step 1: Sucrose is a non-reducing disaccharide. Boiling with dilute $\\text{HCl}$ hydrolyzes it into glucose + fructose. Step 2: $\\text{NaOH}$ neutralizes the acid so Benedict's reagent can work in alkaline medium.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Using the mammalian dental formula of an adult human ($I \\frac{2}{2}, C \\frac{1}{1}, PM \\frac{2}{2}, M \\frac{3}{3}$), calculate the total number of permanent teeth`,
          options: ['$32$ teeth', '$16$ teeth', '$28$ teeth', '$20$ teeth'],
          correctIndex: 0,
          explanation: `Step 1: Count teeth in one half of upper and lower jaws $= (2+1+2+3) + (2+1+2+3) = 8 + 8 = 16$. Step 2: Multiply by $2$ for both sides of the mouth: $16 \\times 2 = 32$ teeth.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] During aerobic cellular respiration, how many net molecules of ATP are synthesized per molecule of glucose during Glycolysis in the cytoplasm versus the complete aerobic pathway?`,
          options: [
            'Net $2\\text{ ATP}$ in Glycolysis ; $36\\text{–}38\\text{ ATP}$ total in complete aerobic respiration',
            'Net $38\\text{ ATP}$ in Glycolysis ; $2\\text{ ATP}$ in Krebs cycle',
            'Net $0\\text{ ATP}$ in Glycolysis ; $10\\text{ ATP}$ total',
            'Net $4\\text{ ATP}$ in anaerobic fermentation',
          ],
          correctIndex: 0,
          explanation: `Step 1: Glycolysis invests $2\\text{ ATP}$ and produces $4\\text{ ATP}$ (net gain $= 2\\text{ ATP}$). Step 2: Krebs cycle and oxidative phosphorylation in mitochondria yield a total of $36\\text{–}38\\text{ ATP}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Which class of Phylum Arthropoda is characterized by having three body divisions (head, thorax, abdomen), three pairs of jointed walking legs ($6$ legs), and one pair of antennae?`,
          options: ['Class Insecta', 'Class Arachnida', 'Class Crustacea', 'Class Diplopoda'],
          correctIndex: 0,
          explanation: `Step 1: Class Insecta (e.g., grasshopper, housefly, cockroach) possesses a head, thorax, and abdomen, $3$ pairs of thoracic legs, and $1$ pair of antennae.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Under a light microscope with an eyepiece lens marked $\\times 10$ and an objective lens marked $\\times 40$, calculate the total magnification of the specimen`,
          options: ['$\\times 400$', '$\\times 50$', '$\\times 40$', '$\\times 4,000$'],
          correctIndex: 0,
          explanation: `Step 1: Total Magnification $= \\text{Eyepiece Magnification} \\times \\text{Objective Magnification}$. Step 2: $10 \\times 40 = \\times 400$.`,
        },
      ];
    }

    if (subLower.includes('geography') || subLower.includes('jiografia')) {
      return [
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] On a contoured topographical map, two stations A (altitude $1,200\\text{ m}$) and B (altitude $1,600\\text{ m}$) are separated by a horizontal ground distance of $4\\text{ km}$. Calculate the gradient between A and B`,
          options: ['$1\\text{ in }10$ (or $1:10$)', '$1\\text{ in }40$ (or $1:40$)', '$1\\text{ in }100$ (or $1:100$)', '$1\\text{ in }4$ (or $1:4$)'],
          correctIndex: 0,
          explanation: `Step 1: Vertical Interval ($VI$) $= 1,600\\text{ m} - 1,200\\text{ m} = 400\\text{ m}$. Step 2: Horizontal Equivalent ($HE$) $= 4\\text{ km} = 4,000\\text{ m}$. Step 3: Gradient $= \\frac{VI}{HE} = \\frac{400}{4,000} = \\frac{1}{10}$ ($1\\text{ in }10$).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] If the forward bearing of town Y from town X is $065^\\circ$, calculate the back bearing of town X from town Y`,
          options: ['$245^\\circ$', '$115^\\circ$', '$295^\\circ$', '$155^\\circ$'],
          correctIndex: 0,
          explanation: `Step 1: Rule for Back Bearing: If Forward Bearing $< 180^\\circ$, add $180^\\circ$. Step 2: Back Bearing $= 065^\\circ + 180^\\circ = 245^\\circ$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] A weather station records a maximum daily temperature of $31^\\circ\\text{C}$ and a minimum daily temperature of $19^\\circ\\text{C}$. Calculate the Mean Daily Temperature and Diurnal Temperature Range`,
          options: [
            'Mean $= 25^\\circ\\text{C}$ ; Diurnal Range $= 12^\\circ\\text{C}$',
            'Mean $= 25^\\circ\\text{C}$ ; Diurnal Range $= 50^\\circ\\text{C}$',
            'Mean $= 12^\\circ\\text{C}$ ; Diurnal Range $= 25^\\circ\\text{C}$',
            'Mean $= 26^\\circ\\text{C}$ ; Diurnal Range $= 10^\\circ\\text{C}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Mean Daily Temperature $= \\frac{31 + 19}{2} = \\frac{50}{2} = 25^\\circ\\text{C}$. Step 2: Diurnal Range $= \\text{Max} - \\text{Min} = 31^\\circ\\text{C} - 19^\\circ\\text{C} = 12^\\circ\\text{C}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Which drainage pattern develops on a volcanic cone or dome (such as Mount Kilimanjaro or Mount Meru) where rivers flow outwards in all directions from a central peak?`,
          options: [
            'Radial drainage pattern',
            'Dendritic drainage pattern',
            'Trellis drainage pattern',
            'Centripetal drainage pattern',
          ],
          correctIndex: 0,
          explanation: `Step 1: On a conical dome or volcano, streams radiate outwards downhill in all directions like the spokes of a wheel, forming a Radial drainage pattern.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] When interpreting a ground-level versus a low-oblique photograph in NECTA Geography Paper, which feature distinguishes a low-oblique photograph?`,
          options: [
            'The camera is tilted at an angle from above so the horizon is NOT visible, and scale decreases from foreground to background',
            'The horizon is clearly visible occupying the top third of the photo',
            'It shows only the rooftops of buildings vertically from $90^\\circ$ overhead',
            'It has a uniform scale throughout like a topographical map',
          ],
          correctIndex: 0,
          explanation: `Step 1: Oblique photographs are taken with the camera axis tilted. Step 2: In a low-oblique photo ($\\approx 30^\\circ$), the horizon is not visible, unlike a high-oblique photo ($\\approx 60^\\circ$).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] In chain and tape surveying, which instrument is used specifically to set out right angles ($90^\\circ$ offsets) from the main survey chain line to objects on either side?`,
          options: [
            'Cross staff (or Optical Square)',
            'Ranging rod',
            'Abney level',
            'Gunter’s chain',
          ],
          correctIndex: 0,
          explanation: `Step 1: A Cross Staff or Optical Square is used in chain surveying to establish perpendicular ($90^\\circ$) offset lines from the baseline to lateral details.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] At $28^\\circ\\text{C}$, a cubic metre of air holds $15\\text{ g/m}^3$ of water vapour (Absolute Humidity), while saturated air at $28^\\circ\\text{C}$ can hold $30\\text{ g/m}^3$. Calculate the Relative Humidity ($RH$)`,
          options: ['$50\\%$', '$200\\%$', '$45\\%$', '$15\\%$'],
          correctIndex: 0,
          explanation: `Step 1: $RH = \\frac{\\text{Actual Vapour Content}}{\\text{Saturation Vapour Capacity}} \\times 100\\%$. Step 2: $RH = \\frac{15}{30} \\times 100\\% = 50\\%$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Which East African lakes were formed within the Western and Eastern branches of the Great East African Rift Valley by tectonic faulting (graben formation)?`,
          options: [
            'Lake Tanganyika, Lake Nyasa (Malawi), and Lake Natron',
            'Lake Victoria and Lake Kyoga',
            'Lake Chad and Lake Tana',
            'Lake Ngozi and Lake Duluti only',
          ],
          correctIndex: 0,
          explanation: `Step 1: Rift valley lakes occupy elongated, steep-sided grabens formed by tensional/compressional faulting. Step 2: Lake Tanganyika and Lake Nyasa are classic deep Rift Valley lakes, whereas Lake Victoria occupies a down-warped crustal basin.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] In geographic research methodology, a researcher selects every $10\\text{th}$ household from an alphabetical village register of $500$ households. Which probability sampling technique is this?`,
          options: [
            'Systematic random sampling',
            'Snowball sampling',
            'Purposive (judgmental) sampling',
            'Quota sampling',
          ],
          correctIndex: 0,
          explanation: `Step 1: Selecting units at a fixed regular interval ($k = \\frac{N}{n} = 10$) from an ordered sampling frame is Systematic Sampling.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] If a country has $18\\text{ million}$ children aged $0\\text{–}14$, $2\\text{ million}$ elderly people aged $65+$, and $25\\text{ million}$ working-age people aged $15\\text{–}64$, calculate the Age Dependency Ratio`,
          options: ['$80\\%$ (or $0.8 : 1$)', '$125\\%$', '$72\\%$', '$44\\%$'],
          correctIndex: 0,
          explanation: `Step 1: $\\text{Dependency Ratio} = \\frac{\\text{Pop}(0\\text{–}14) + \\text{Pop}(65+)}{\\text{Pop}(15\\text{–}64)} \\times 100\\%$. Step 2: $\\frac{18 + 2}{25} \\times 100\\% = \\frac{20}{25} \\times 100\\% = 80\\%$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Convert the Representative Fraction ($RF$) map scale $1 : 250,000$ into a direct statement scale in kilometres`,
          options: [
            '$1\\text{ cm}$ on the map represents $2.5\\text{ km}$ on the ground',
            '$1\\text{ cm}$ on the map represents $25\\text{ km}$ on the ground',
            '$1\\text{ cm}$ on the map represents $0.25\\text{ km}$ on the ground',
            '$1\\text{ cm}$ on the map represents $5.0\\text{ km}$ on the ground',
          ],
          correctIndex: 0,
          explanation: `Step 1: Since $1\\text{ km} = 100,000\\text{ cm}$, divide $250,000\\text{ cm}$ by $100,000$. Step 2: $\\frac{250,000}{100,000} = 2.5\\text{ km}$, so $1\\text{ cm}$ represents $2.5\\text{ km}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] When it is $12:00\\text{ Noon}$ at Greenwich Meridian ($0^\\circ$), what is the local time in Dar es Salaam, Tanzania located at longitude $39^\\circ\\text{E}$?`,
          options: ['$2:36\\text{ PM}$ ($14:36\\text{ hrs}$)', '$9:24\\text{ AM}$', '$3:00\\text{ PM}$', '$1:39\\text{ PM}$'],
          correctIndex: 0,
          explanation: `Step 1: Earth rotates $1^\\circ$ every $4\\text{ minutes}$, so $39^\\circ \\times 4 = 156\\text{ minutes} = 2\\text{ hours } 36\\text{ minutes}$. Step 2: Since $39^\\circ\\text{E}$ is East of Greenwich, add time: $12:00 + 2:36 = 2:36\\text{ PM}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] On a topographical map of scale $1 : 50,000$, a sisal estate covers $12$ full grid squares and $8$ half grid squares (where each grid square measures $2\\text{ cm} \\times 2\\text{ cm}$). Calculate the area of the estate in $\\text{km}^2$`,
          options: ['$16\\text{ km}^2$', '$20\\text{ km}^2$', '$12\\text{ km}^2$', '$8\\text{ km}^2$'],
          correctIndex: 0,
          explanation: `Step 1: Total complete squares $= 12 + \\frac{8}{2} = 16$ squares. Step 2: At scale $1:50,000$, $2\\text{ cm} = 1\\text{ km}$, so each grid square $= 1\\text{ km} \\times 1\\text{ km} = 1\\text{ km}^2$. Total area $= 16\\text{ km}^2$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Which type of chemical weathering involves the reaction of rainwater containing dissolved carbon dioxide (weak carbonic acid) with limestone ($\\text{CaCO}_3$) to form soluble calcium bicarbonate, creating karst landforms like Amboni Caves in Tanga?`,
          options: ['Carbonation', 'Exfoliation (Onion-skin peeling)', 'Frost shattering', 'Oxidation'],
          correctIndex: 0,
          explanation: `Step 1: $\\text{H}_2\\text{CO}_3 + \\text{CaCO}_3(s) \\to \\text{Ca(HCO}_3)_2(aq)$ is Carbonation, which dissolves jointed limestone rock to form caves, stalactites, and stalagmites.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] In the internal structure of the Earth, what is the name of the seismic discontinuity separating the Crust (SIAL/SIMA) from the underlying Mantle?`,
          options: ['Mohorovicic (Moho) discontinuity', 'Gutenberg discontinuity', 'Conrad discontinuity', 'Lehmann discontinuity'],
          correctIndex: 0,
          explanation: `Step 1: The Mohorovicic discontinuity (Moho) marks the boundary between the Earth's crust and the mantle, whereas the Gutenberg discontinuity separates the mantle from the core.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] Calculate the arithmetic mean and median of the following annual rainfall figures (in $\\text{mm}$) recorded at five stations: $600, 850, 700, 950, 900$`,
          options: [
            'Mean $= 800\\text{ mm}$ ; Median $= 850\\text{ mm}$',
            'Mean $= 850\\text{ mm}$ ; Median $= 700\\text{ mm}$',
            'Mean $= 800\\text{ mm}$ ; Median $= 700\\text{ mm}$',
            'Mean $= 750\\text{ mm}$ ; Median $= 850\\text{ mm}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Mean $= \\frac{600 + 850 + 700 + 950 + 900}{5} = \\frac{4000}{5} = 800\\text{ mm}$. Step 2: Arrange in ascending order ($600, 700, 850, 900, 950$) $\\Rightarrow$ middle value (Median) $= 850\\text{ mm}$.`,
        },
      ];
    }

    if (
      subLower.includes('book-keeping') ||
      subLower.includes('account') ||
      subLower.includes('commerce') ||
      subLower.includes('business') ||
      subLower.includes('economics')
    ) {
      return [
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] A business has Current Assets of $\\text{TZS } 4,500,000$ (including Closing Stock of $\\text{TZS } 1,500,000$) and Current Liabilities of $\\text{TZS } 1,500,000$. Calculate Working Capital, Current Ratio, and Acid-Test (Quick) Ratio`,
          options: [
            'Working Capital $= \\text{TZS } 3,000,000$ ; Current Ratio $= 3 : 1$ ; Acid-Test Ratio $= 2 : 1$',
            'Working Capital $= \\text{TZS } 6,000,000$ ; Current Ratio $= 2 : 1$ ; Acid-Test Ratio $= 3 : 1$',
            'Working Capital $= \\text{TZS } 3,000,000$ ; Current Ratio $= 2 : 1$ ; Acid-Test Ratio $= 1 : 1$',
            'Working Capital $= \\text{TZS } 1,500,000$ ; Current Ratio $= 3 : 1$ ; Acid-Test Ratio $= 1.5 : 1$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Working Capital $= \\text{CA} - \\text{CL} = 4,500,000 - 1,500,000 = \\text{TZS } 3,000,000$. Step 2: Current Ratio $= \\frac{4,500,000}{1,500,000} = 3 : 1$. Step 3: Acid-Test Ratio $= \\frac{4,500,000 - 1,500,000}{1,500,000} = 2 : 1$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] Given Cost of Goods Sold ($\text{COGS}$) $= \\text{TZS } 3,600,000$, Opening Stock $= \\text{TZS } 500,000$, and Closing Stock $= \\text{TZS } 700,000$, calculate the Average Stock and Rate of Stock Turnover ($\text{ROST}$)`,
          options: [
            'Average Stock $= \\text{TZS } 600,000$ ; $\\text{ROST} = 6\\text{ times}$',
            'Average Stock $= \\text{TZS } 1,200,000$ ; $\\text{ROST} = 3\\text{ times}$',
            'Average Stock $= \\text{TZS } 600,000$ ; $\\text{ROST} = 5\\text{ times}$',
            'Average Stock $= \\text{TZS } 500,000$ ; $\\text{ROST} = 7.2\\text{ times}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Average Stock $= \\frac{500,000 + 700,000}{2} = \\text{TZS } 600,000$. Step 2: Rate of Stock Turnover $= \\frac{\\text{COGS}}{\\text{Average Stock}} = \\frac{3,600,000}{600,000} = 6\\text{ times}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] A petty cashier operates on an imprest float of $\\text{TZS } 200,000$ per week. During the week, total petty cash vouchers paid amounted to $\\text{TZS } 165,000$. How much reimbursement is required to restore the imprest?`,
          options: ['$\\text{TZS } 165,000$', '$\\text{TZS } 35,000$', '$\\text{TZS } 200,000$', '$\\text{TZS } 365,000$'],
          correctIndex: 0,
          explanation: `Step 1: Under the Petty Cash Imprest System, the amount reimbursed at the end of the period equals the exact amount spent ($\\text{TZS } 165,000$) so the balance is restored from $\\text{TZS } 35,000$ back to $\\text{TZS } 200,000$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] A trader's Cash Book (Bank Column) shows a debit balance of $\\text{TZS } 800,000$. Unpresented cheques total $\\text{TZS } 250,000$ and uncredited deposits total $\\text{TZS } 150,000$. Find the balance as per Bank Statement`,
          options: ['$\\text{TZS } 900,000$', '$\\text{TZS } 700,000$', '$\\text{TZS } 1,050,000$', '$\\text{TZS } 400,000$'],
          correctIndex: 0,
          explanation: `Step 1: Start with Cash Book balance $= 800,000$. Step 2: Add Unpresented Cheques ($+250,000$) and Subtract Uncredited Deposits ($-150,000$) $\\Rightarrow 800,000 + 250,000 - 150,000 = \\text{TZS } 900,000$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] If a retailer applies a Mark-up of $25\\%$ ($\frac{1}{4}$) on Cost Price, what is the corresponding Gross Profit Margin on Selling Price?`,
          options: ['$20\\%$ ($\\frac{1}{5}$)', '$25\\%$ ($\\frac{1}{4}$)', '$33.3\\%$ ($\\frac{1}{3}$)', '$15\\%$'],
          correctIndex: 0,
          explanation: `Step 1: If Mark-up $= \\frac{1}{4}$, then Margin $= \\frac{1}{4 + 1} = \\frac{1}{5}$. Step 2: Convert $\\frac{1}{5}$ to percentage: $\\frac{1}{5} \\times 100\\% = 20\\%$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] When the price of a commodity rises from $\\text{TZS } 1,000$ to $\\text{TZS } 1,200$ ($+20\\%$), quantity demanded falls from $500\\text{ units}$ to $400\\text{ units}$ ($-20\\%$). Calculate the Price Elasticity of Demand ($PED$)`,
          options: ['$PED = 1.0$ (Unitary elastic)', '$PED = 2.0$ (Elastic)', '$PED = 0.5$ (Inelastic)', '$PED = 0$ (Perfectly inelastic)'],
          correctIndex: 0,
          explanation: `Step 1: $\\%\\Delta Q_d = \\frac{-100}{500} \\times 100\\% = -20\\%$; $\\%\\Delta P = \\frac{+200}{1000} \\times 100\\% = +20\\%$. Step 2: $|PED| = \\frac{20\\%}{20\\%} = 1.0$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Which Book of Prime (Original) Entry is used to record credit purchases of goods meant specifically for resale?`,
          options: [
            'Purchases Day Book (Purchases Journal)',
            'Sales Day Book (Sales Journal)',
            'General Journal',
            'Cash Book',
          ],
          correctIndex: 0,
          explanation: `Step 1: All credit purchases of trading inventory/stock are recorded first in the Purchases Day Book (Purchases Journal) from incoming purchase invoices.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] A delivery van costing $\\text{TZS } 10,000,000$ is depreciated at $20\\%$ per annum using the Reducing (Diminishing) Balance Method. Calculate the depreciation charge for Year 2`,
          options: ['$\\text{TZS } 1,600,000$', '$\\text{TZS } 2,000,000$', '$\\text{TZS } 6,400,000$', '$\\text{TZS } 3,600,000$'],
          correctIndex: 0,
          explanation: `Step 1: Year 1 depreciation $= 20\\% \\times 10,000,000 = 2,000,000$; Net Book Value at end of Year 1 $= 8,000,000$. Step 2: Year 2 depreciation $= 20\\% \\times 8,000,000 = \\text{TZS } 1,600,000$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Which error is NOT disclosed by a Trial Balance even though the debit and credit totals agree?`,
          options: [
            'Error of Principle (e.g., debiting Motor Repairs to Motor Vehicles Asset Account)',
            'Single-sided casting error in the Sales Account',
            'Posting $\\text{TZS } 45,000$ to the debit side and $\\text{TZS } 54,000$ to the credit side',
            'Omitting one side of a double-entry transaction',
          ],
          correctIndex: 0,
          explanation: `Step 1: Errors of Principle, Commission, Complete Omission, Original Entry, and Compensating Errors preserve equal total debits and credits and therefore do not affect Trial Balance agreement.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] An invoice for goods worth $\\text{TZS } 1,000,000$ offers a $10\\%$ Trade Discount and a $5\\%$ Cash Discount if paid within $14\\text{ days}$. If the buyer pays within $10\\text{ days}$, how much cash is paid?`,
          options: ['$\\text{TZS } 855,000$', '$\\text{TZS } 850,000$', '$\\text{TZS } 900,000$', '$\\text{TZS } 950,000$'],
          correctIndex: 0,
          explanation: `Step 1: Deduct $10\\%$ Trade Discount from list price: $1,000,000 - 100,000 = \\text{TZS } 900,000$ (Invoice price). Step 2: Deduct $5\\%$ Cash Discount on $\\text{TZS } 900,000$ ($45,000$): $900,000 - 45,000 = \\text{TZS } 855,000$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] In international trade, if Tanzania's Visible Exports are $\\text{TZS } 950\\text{ billion}$ and Visible Imports are $\\text{TZS } 1,100\\text{ billion}$, calculate the Balance of Trade (Visible Balance)`,
          options: [
            'Unfavourable Balance of Trade (Deficit) of $-\\text{TZS } 150\\text{ billion}$',
            'Favourable Balance of Trade (Surplus) of $+\\text{TZS } 150\\text{ billion}$',
            'Balanced Trade of $\\text{TZS } 2,050\\text{ billion}$',
            'Surplus of $+\\text{TZS } 950\\text{ billion}$',
          ],
          correctIndex: 0,
          explanation: `Step 1: Balance of Trade $= \\text{Visible Exports} - \\text{Visible Imports}$. Step 2: $950 - 1,100 = -150\\text{ billion}$ (a visible trade deficit).`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] If a firm's Total Assets are $\\text{TZS } 18,500,000$ and Total Liabilities are $\\text{TZS } 6,200,000$, calculate the Owner's Equity (Capital) using the Accounting Equation`,
          options: ['$\\text{TZS } 12,300,000$', '$\\text{TZS } 24,700,000$', '$\\text{TZS } 11,300,000$', '$\\text{TZS } 6,200,000$'],
          correctIndex: 0,
          explanation: `Step 1: Accounting Equation: $\\text{Assets} = \\text{Capital} + \\text{Liabilities}$. Step 2: $\\text{Capital} = 18,500,000 - 6,200,000 = \\text{TZS } 12,300,000$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(1)}] Under the Straight-Line Method of depreciation, a machine costing $\\text{TZS } 8,500,000$ has an estimated residual (scrap) value of $\\text{TZS } 500,000$ after a useful life of $5\\text{ years}$. Calculate the annual depreciation expense`,
          options: ['$\\text{TZS } 1,600,000\\text{ per year}$', '$\\text{TZS } 1,700,000\\text{ per year}$', '$\\text{TZS } 1,800,000\\text{ per year}$', '$\\text{TZS } 1,500,000\\text{ per year}$'],
          correctIndex: 0,
          explanation: `Step 1: $\\text{Annual Depreciation} = \\frac{\\text{Cost} - \\text{Scrap Value}}{\\text{Useful Life}}$. Step 2: $\\frac{8,500,000 - 500,000}{5} = \\frac{8,000,000}{5} = \\text{TZS } 1,600,000\\text{ per year}$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(2)}] In an insurance contract, which principle states that the insured cannot recover more than the actual financial loss suffered (preventing profiteering from a loss)?`,
          options: ['Principle of Indemnity', 'Principle of Insurable Interest', 'Principle of Utmost Good Faith (Uberrimae Fidei)', 'Principle of Proximate Cause'],
          correctIndex: 0,
          explanation: `Step 1: The Principle of Indemnity restores the insured to the same financial position occupied immediately before the loss, without allowing profit.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(3)}] Given Opening Capital $= \\text{TZS } 5,000,000$, Net Profit for the year $= \\text{TZS } 1,800,000$, and Owner's Drawings $= \\text{TZS } 400,000$, calculate the Closing Capital`,
          options: ['$\\text{TZS } 6,400,000$', '$\\text{TZS } 7,200,000$', '$\\text{TZS } 3,600,000$', '$\\text{TZS } 6,800,000$'],
          correctIndex: 0,
          explanation: `Step 1: $\\text{Closing Capital} = \\text{Opening Capital} + \\text{Net Profit} - \\text{Drawings}$. Step 2: $5,000,000 + 1,800,000 - 400,000 = \\text{TZS } 6,400,000$.`,
        },
        {
          question: `[${cls} • ${focusTopic} — ${subT(0)}] In a Control Account, which item is debited to the Sales Ledger (Total Debtors) Control Account?`,
          options: ['Credit sales for the period and Dishonoured cheques from customers', 'Cash received from debtors', 'Sales returns (Returns Inwards)', 'Bad debts written off'],
          correctIndex: 0,
          explanation: `Step 1: Credit sales and dishonoured cheques increase the total amount owed by trade debtors and are therefore debited to the Sales Ledger Control Account.`,
        },
      ];
    }

    // Default / History / Civics / English / Kiswahili / General Subjects — 16 rich sub-topic questions
    return [
      {
        question: `[${cls} • ${focusTopic} — ${subT(1)}] According to ${matchedBookTitle}, which core competence objective is developed when studying "${subT(1)}" under "${focusTopic}"?`,
        options: [
          `Analyzing the causes, key principles, and practical Tanzanian applications of "${subT(1)}" with verified evidence`,
          'Listing isolated definitions without connecting them to the topic',
          'Skipping practical case studies and historical/social context',
          'Memorizing headings without explaining their meaning',
        ],
        correctIndex: 0,
        explanation: `Step 1: Identify the competence focus of "${subT(1)}" in ${cls} ${subject}. Step 2: Connect its core concepts to real-world Tanzanian and East African examples as required by TIE.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(2)}] In ${matchedPaperTitle} (Section A Multiple Choice & Matching Items), how do examiners test your understanding of "${subT(2)}"?`,
        options: [
          `By requiring you to distinguish accurate concepts, chronology, or rules of "${subT(2)}" from closely related distractors`,
          'By asking questions unrelated to the official syllabus',
          'By awarding marks without checking the chosen letter',
          'By testing only topics from other subjects',
        ],
        correctIndex: 0,
        explanation: `Step 1: Read the stem on "${subT(2)}" carefully. Step 2: Eliminate options that contradict official TIE ${cls} ${subject} definitions before selecting the verified letter.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(3)}] When answering a short-answer NECTA Section B question on "${subT(3)}" (${focusTopic}), why is it important to give a concrete Tanzanian or African example for each point?`,
        options: [
          `Because NECTA marking schemes allocate specific marks for linking theoretical points on "${subT(3)}" to authentic real-life examples`,
          'Examples are optional and never carry any marks',
          'Examples replace the need to state the main point',
          'Only foreign examples are accepted in NECTA exams',
        ],
        correctIndex: 0,
        explanation: `Step 1: State the main point clearly (1 Mark). Step 2: Explain the mechanism/reason (1 Mark). Step 3: Provide a relevant Tanzanian/East African example on "${subT(3)}" (1 Mark).`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(0)}] Which of the following best describes the relationship between the main competence "${focusTopic}" and its specific sub-topic "${subT(0)}" in ${cls} ${subject}?`,
        options: [
          `"${subT(0)}" provides the specific analytical skills, rules, and evidence needed to master the broader competence of "${focusTopic}"`,
          `"${subT(0)}" is completely independent of "${focusTopic}"`,
          `"${subT(0)}" is only studied outside the classroom`,
          `"${focusTopic}" excludes "${subT(0)}" in national examinations`,
        ],
        correctIndex: 0,
        explanation: `Step 1: In the TIE competence-based curriculum, each main topic ("${focusTopic}") is broken down into specific teachable sub-topics such as "${subT(0)}" that build cumulative mastery.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(1)}] While revising "${subT(1)}" from ${matchedBookTitle}, a student compares two contrasting perspectives or cases. Which higher-order cognitive skill (Bloom's Taxonomy) is being practiced?`,
        options: [
          `Analysis and Evaluation of "${subT(1)}"`,
          'Rote recall without comprehension',
          'Passive copying of notes',
          'Guessing without evidence',
        ],
        correctIndex: 0,
        explanation: `Step 1: Comparing, contrasting, and evaluating evidence on "${subT(1)}" develops higher-order Analysis and Evaluation skills tested in Section B and Section C of NECTA papers.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(2)}] In ${matchedPaperTitle}, a question asks: "Examine six (6) factors/impacts related to ${subT(2)}." What is the mandatory structure of the introduction paragraph?`,
        options: [
          `Define the key term(s) in "${subT(2)}", specify the relevant time period/context, and outline the direction of the essay (02 Marks)`,
          'Start numbering Point 1 immediately without any definition',
          'Repeat the question word-for-word as the introduction',
          'Write the conclusion at the beginning of the essay',
        ],
        correctIndex: 0,
        explanation: `Step 1: A complete NECTA essay introduction defines the core concept of "${subT(2)}", situates it in context, and earns the full 02 Introduction Marks.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(3)}] Which study strategy using ${matchedBookTitle} and ${matchedPaperTitle} is most effective for mastering "${subT(3)}" before the national examination?`,
        options: [
          `Study the conceptual notes and worked examples on "${subT(3)}" in ${matchedBookTitle}, then solve corresponding Section A, B, and C questions in ${matchedPaperTitle}`,
          'Read only the table of contents without solving past paper questions',
          'Memorize past paper answers without understanding why they are correct',
          'Skip "${subT(3)}" and focus only on one sub-topic',
        ],
        correctIndex: 0,
        explanation: `Step 1: Combine textbook conceptual mastery (${matchedBookTitle}) with timed past-paper application (${matchedPaperTitle}) on "${subT(3)}".`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(0)}] When evaluating cause-and-effect relationships in "${subT(0)}" (${cls} ${subject}), how should you distinguish between immediate causes and long-term underlying factors?`,
        options: [
          `Explain how long-term structural conditions in "${focusTopic}" created the foundation, while immediate triggers directly initiated the outcome in "${subT(0)}"`,
          'Treat all factors as identical without explanation',
          'Mention only dates or names without explaining causation',
          'Ignore the sequence of events',
        ],
        correctIndex: 0,
        explanation: `Step 1: Differentiate underlying structural factors from immediate triggers in "${subT(0)}" to demonstrate deep analytical mastery in ${cls} ${subject}.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(1)}] In a collaborative classroom discussion on "${subT(1)}" (${focusTopic}), how should students verify whether a proposed statement is accurate?`,
        options: [
          `Cross-check the statement against the official TIE ${cls} ${subject} Textbook (${matchedBookTitle}) and NECTA Marking Scheme standards`,
          'Accept any unverified opinion without checking the syllabus',
          'Ignore textbook definitions and formulas',
          'Skip verification altogether',
        ],
        correctIndex: 0,
        explanation: `Step 1: Always ground academic arguments on "${subT(1)}" in the authoritative TIE curriculum and official NECTA marking rubrics.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(2)}] If a Section B question on "${subT(2)}" carries $10\\text{ marks}$ and asks for five (5) brief explanations, how are the marks distributed in the official marking scheme?`,
        options: [
          '$02\\text{ marks}$ for each well-explained point ($5 \\times 2 = 10\\text{ marks}$)',
          '$10\\text{ marks}$ for the first point and $0\\text{ marks}$ for the rest',
          '$05\\text{ marks}$ for the title and $05\\text{ marks}$ for the margin',
          '$01\\text{ mark}$ total for all five points',
        ],
        correctIndex: 0,
        explanation: `Step 1: Divide total marks ($10$) by the required number of points ($5$) $\\Rightarrow 02\\text{ marks}$ per point (1 mark for the key point + 1 mark for clear explanation/example).`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(3)}] What is the purpose of the concluding paragraph in a $15\\text{-mark}$ NECTA essay on "${focusTopic}" (${subT(3)})?`,
        options: [
          `To synthesize the main arguments presented on "${subT(3)}" and provide a concise, relevant judgment or recommendation ($01\\text{–}02\\text{ marks}$)`,
          'To introduce completely new unrelated topics not discussed in the body',
          'To copy the introduction word-for-word',
          'To leave the essay unfinished',
        ],
        correctIndex: 0,
        explanation: `Step 1: A strong conclusion summarizes the weight of the arguments on "${subT(3)}" and provides a sound analytical judgment to secure the final conclusion marks.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(0)}] In ${matchedPaperTitle}, how should a candidate handle a Matching Items question (List A and List B) on "${subT(0)}" to avoid losing marks?`,
        options: [
          `First match the items in List A whose definitions in "${subT(0)}" are certain, then carefully compare remaining options in List B to avoid duplicate letters`,
          'Assign the same letter from List B to every item in List A',
          'Leave half of the matching items blank',
          'Write sentences instead of the required letter',
        ],
        correctIndex: 0,
        explanation: `Step 1: Secure certain matches first. Step 2: Eliminate used letters in List B and verify each remaining concept against "${subT(0)}" in ${matchedBookTitle}.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(1)}] When a NECTA question on "${subT(1)}" (${focusTopic}) uses the command verb "Contrast" or "Differentiate", what format is expected in your answer?`,
        options: [
          `Present clear comparative points joined by contrasting conjunctions ("whereas", "while", "on the other hand") addressing both sides of "${subT(1)}"`,
          'Describe only one side and ignore the second concept',
          'List single words without explanation',
          'Write only definitions without comparing them',
        ],
        correctIndex: 0,
        explanation: `Step 1: "Differentiate" or "Contrast" requires side-by-side comparison of both concepts in "${subT(1)}" within each point to earn full marks.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(2)}] How does mastering "${subT(2)}" in ${cls} ${subject} prepare students for real-life civic, socio-economic, or communication challenges in Tanzania?`,
        options: [
          `It equips learners with practical problem-solving, critical thinking, and communication skills applicable to Tanzanian society`,
          'It is only useful for passing a single classroom test',
          'It discourages practical application outside school',
          'It has no connection to national development',
        ],
        correctIndex: 0,
        explanation: `Step 1: The TIE curriculum is competence-based, meaning "${subT(2)}" directly builds practical skills for national development and daily problem-solving.`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(3)}] If a question on "${subT(3)}" in ${matchedPaperTitle} asks you to "Outline four (4) lessons or solutions", what should each numbered point contain?`,
        options: [
          `A concise heading/key point followed by a clear one-to-two sentence explanation grounded in "${subT(3)}"`,
          'A single vague word with no explanation',
          'A ten-page unnumbered paragraph',
          'Unrelated points from another subject',
        ],
        correctIndex: 0,
        explanation: `Step 1: State the point clearly and follow it with a brief explanation showing how it applies to "${subT(3)}".`,
      },
      {
        question: `[${cls} • ${focusTopic} — ${subT(0)}] Before submitting your examination answer booklet for ${cls} ${subject}, what final verification should you perform on your answers for "${focusTopic}"?`,
        options: [
          `Check that all question numbers match the paper, all required points are complete, and key terms in "${focusTopic}" are accurately spelled and explained`,
          'Cross out correct workings without replacement',
          'Leave multiple-choice boxes empty',
          'Remove introductions and conclusions from essays',
        ],
        correctIndex: 0,
        explanation: `Step 1: Reviewing question numbering, completeness of points, and clarity of explanations on "${focusTopic}" prevents avoidable mark loss.`,
      },
    ];
  };

  const attachMetadata = (items: Array<Omit<QuizItem, 'topic' | 'subTopic' | 'sourceRef'>>): QuizItem[] => {
    const sources = [src1, src2, src3, src4];
    const extraItems = buildAdditionalSubjectQuestions();
    const combined = [...items, ...extraItems].slice(0, 20);
    return combined.map((item, idx) => {
      const rotated = rotateQuizOptions(item.options, item.correctIndex, idx + 1);
      const itemSubTopic =
        availableSubTopics.length > 0
          ? availableSubTopics[idx % availableSubTopics.length]
          : focusSubTopic;
      return {
        ...item,
        options: rotated.options,
        correctIndex: rotated.correctIndex,
        topic: focusTopic,
        subTopic: idx < items.length ? focusSubTopic : itemSubTopic,
        sourceRef: sources[idx % sources.length],
      };
    });
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


