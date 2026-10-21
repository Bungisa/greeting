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
  'Form 5': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Economics', 'Accountancy', 'Commerce', 'English Language', 'Kiswahili', 'Computer Science'],
  'Form 6': ['General Studies', 'Academic Communication', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'Economics', 'Accountancy', 'Commerce', 'English Language', 'Kiswahili', 'Computer Science'],
};

export const TIE_SYLLABUS_COMPETENCES: Record<string, Record<string, string[]>> = {
  'Basic Mathematics': {
    'Form 1': [
      'Chapter 1: Concept of Mathematics (Meaning, Branches & Relationship with Other Subjects)',
      'Chapter 2: Numbers I (Base Ten Numeration, Natural, Whole & Integer Operations, BODMAS, Factors & Multiples, HCF & LCM)',
      'Chapter 3: Fractions (Proper, Improper, Mixed Fractions & Operations on Fractions)',
      'Chapter 4: Decimals and Percentages (Conversions & Operations on Decimals and Percentages)',
      'Chapter 5: Metric Units (Length, Mass, Time & Capacity Conversions and Operations)',
      'Chapter 6: Approximations (Rounding Off, Decimal Places & Significant Figures)',
      'Chapter 7: Introduction to Geometry (Points, Lines, Angles, Polygons & Constructions)',
      'Chapter 8: Algebra (Algebraic Expressions, Linear Equations, Simultaneous Equations & Linear Inequalities)',
      'Chapter 9: Numbers II (Rational, Irrational & Real Numbers, Absolute Value & Number Line)',
      'Chapter 10: Ratios, Profit and Loss (Ratios, Proportions, Profit/Loss Percentage & Simple Interest)',
      'Chapter 11: Coordinate Geometry (Coordinates of a Point, Gradient/Slope & Equation of a Straight Line y = mx + c)',
      'Chapter 12: Perimeters and Areas (Triangles, Quadrilaterals, Circles & Combined Plane Figures)',
    ],
    'Form 2': [
      'Chapter 1: Exponents and Radicals (Laws of Exponents/Indices, Simplifying Radicals/Surds & Rationalising the Denominator)',
      'Chapter 2: Algebra (Binary Operations, Brackets, Quadratic Expressions & Factorisation)',
      'Chapter 3: Quadratic Equations (Solving by Factorisation, Completing the Square & General Quadratic Formula)',
      'Chapter 4: Logarithms (Standard Form A × 10^n, Laws of Logarithms & Mathematical Tables)',
      'Chapter 5: Congruence (Congruence Postulates SSS, SAS, ASA, AAS, RHS & Proofs)',
      'Chapter 6: Similarity (Similar Polygons, Similarity Theorems & Ratio of Areas of Similar Figures)',
      'Chapter 7: Geometrical Transformations (Reflection, Rotation, Translation & Enlargement)',
      'Chapter 8: Pythagoras Theorem (Proof & Real-Life Right-Angled Triangle Applications)',
      'Chapter 9: Trigonometry (Sine, Cosine, Tangent Ratios, Special Angles 30°, 45°, 60° & Angles of Elevation/Depression)',
      'Chapter 10: Sets (Description of Sets, Subsets, Venn Diagrams, Union, Intersection & Complement)',
      'Chapter 11: Statistics (Frequency Distribution Tables, Histograms, Frequency Polygons, Pie Charts & Line Graphs)',
    ],
    'Form 3': [
      'Chapter 1: Relations (Relations, Domain & Range, Graphs of Linear/Quadratic Relations & Inverse of a Relation)',
      'Chapter 2: Functions (Concept of Function, Linear, Quadratic, Polynomial, Step & Absolute Value Functions, Inverse Functions)',
      'Chapter 3: Statistics (Mean, Median, Mode for Grouped & Ungrouped Data, Assumed Mean & Ogive/Cumulative Frequency)',
      'Chapter 4: Rates and Variations (Rates of Exchange, Direct, Inverse, Joint & Partial Variations)',
      'Chapter 5: Sequences and Series (Arithmetic Progression AP, Geometric Progression GP, Arithmetic/Geometric Mean & Compound Interest)',
      'Chapter 6: Circles (Parts of a Circle, Central & Inscribed Angles, Chord Properties, Cyclic Quadrilaterals & Tangent Theorems)',
      'Chapter 7: The Earth as a Sphere (Great & Small Circles, Latitudes & Longitudes, Distance in Kilometres & Nautical Miles)',
      'Chapter 8: Accounts (Double Entry Principle, Cash Book, Ledger, Trial Balance, Trading, Profit & Loss Account & Balance Sheet)',
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
      'Chapter 1: Numbers (Number Patterns, Divisibility Rules, Base Numerals & Modular Arithmetic)',
      'Chapter 2: Symmetrical Properties of Plane Figures (Lines of Symmetry & Rotational Symmetry)',
      'Chapter 3: Algebra (Algebraic Fractions, Simultaneous Equations in Three Unknowns & Absolute Value Equations)',
      'Chapter 4: Geometrical Constructions and Loci (Concept of Locus, Equidistant Loci & Constructions)',
      'Chapter 5: Coordinate Geometry I (Internal & External Division of a Line Segment, Distance from a Point to a Line)',
      'Chapter 6: Sets and Logic (Operations on Three Sets, Venn Diagrams, Truth Tables & Logical Statements)',
    ],
    'Form 2': [
      'Chapter 1: Algebra II (Polynomials, Remainder Theorem, Factor Theorem & Synthetic Division)',
      'Chapter 2: Simultaneous Equations (Linear and Quadratic Simultaneous Equations & Word Problems)',
      'Chapter 3: Variations and Series (Summation Notation Σ, Sum of Natural Numbers, Squares & Cubes)',
      'Chapter 4: Coordinate Geometry of a Circle (Standard & General Equation of a Circle, Tangent & Normal to a Circle)',
      'Chapter 5: Trigonometry (Radian Measure, Arc Length, Sector Area, Reciprocal Ratios sec, cosec, cot & Identities)',
      'Chapter 6: Permutations and Combinations (Factorial Notation, Fundamental Counting Principle, nPr & nCr)',
    ],
    'Form 3': [
      'Chapter 1: Functions and Relations (Composite Functions, Rational Functions & Asymptotes)',
      'Chapter 2: Sequences, Series and Binomial Theorem (Binomial Expansion & Pascal Triangle)',
      'Chapter 3: Differentiation (Limits, First Principles, Chain Rule, Product Rule, Quotient Rule, Tangents & Stationary Points)',
      'Chapter 4: Integration (Indefinite & Definite Integrals, Area Under a Curve & Volume of Revolution)',
      'Chapter 5: Kinematics (Displacement, Velocity & Acceleration using Calculus)',
    ],
    'Form 4': [
      'Chapter 1: Vectors in 2D and 3D (Unit Vectors i, j, k, Dot/Scalar Product, Angle Between Vectors & Work Done)',
      'Chapter 2: Matrices and Determinants (3×3 Matrices, Cofactors, Adjoint, Inverse & 3×3 Simultaneous Equations)',
      'Chapter 3: Probability and Statistics (Standard Deviation, Variance, Quartiles, Conditional Probability & Bayes Rule)',
      'Chapter 4: Trigonometry II (Double Angle, Factor Formulae & Solving Trigonometric Equations)',
    ],
  },
  'Physics': {
    'Form 1': [
      'Chapter 1: Introduction to Physics (Concept of Physics, Relationship with Other Subjects & Importance of Physics)',
      'Chapter 2: Introduction to Laboratory Practice (Laboratory Rules, Safety Measures, First Aid & Warning Signs)',
      'Chapter 3: Measurement (Fundamental & Derived Quantities, Vernier Calliper, Micrometer Screw Gauge, Mass, Weight, Volume & Density)',
      'Chapter 4: Force (Concept of Force, Types of Forces: Gravity, Friction, Normal, Tension & Effects of Forces)',
      'Chapter 5: Archimedes Principle and Law of Flotation (Upthrust, Apparent Weight, Relative Density, Sinking, Floating & Hydrometer)',
      'Chapter 6: Structure and Properties of Matter (States of Matter, Hooke Law & Elasticity, Adhesion, Cohesion, Surface Tension, Capillarity, Diffusion & Osmosis)',
      'Chapter 7: Pressure (Pressure in Solids P = F/A, Pressure in Liquids P = ρgh, Pascal Principle, Hydraulic Press, Atmospheric Pressure & Barometers)',
      'Chapter 8: Work, Energy and Power (Work W = Fd, Kinetic Energy ½mv², Potential Energy mgh, Conservation of Energy & Power P = W/t)',
      'Chapter 9: Light (Sources of Light, Propagation of Light, Shadows, Eclipses, Pinhole Camera & Reflection at Plane Mirrors)',
    ],
    'Form 2': [
      'Chapter 1: Static Electricity (Origin of Charges, Law of Electrostatics, Gold-Leaf Electroscope, Capacitors & Capacitance)',
      'Chapter 2: Current Electricity (Electric Current I = Q/t, Voltage, Ohm Law V = IR, Factors Affecting Resistance & Series/Parallel Resistors)',
      'Chapter 3: Magnetism (Magnetic & Non-Magnetic Materials, Magnetisation, Demagnetisation, Magnetic Fields & Earth Magnetic Field)',
      'Chapter 4: Forces in Equilibrium (Moment of a Force, Principle of Moments, Parallel Forces, Centre of Gravity & Types of Equilibrium)',
      'Chapter 5: Simple Machines (Mechanical Advantage, Velocity Ratio, Efficiency, Levers, Pulleys, Inclined Plane, Screw Jack, Wheel & Axle, Hydraulic Press)',
      'Chapter 6: Motion in a Straight Line (Distance, Displacement, Speed, Velocity, Acceleration, Equations of Uniformly Accelerated Motion & Free Fall)',
      'Chapter 7: Newton Laws of Motion (First Law & Inertia, Second Law & Linear Momentum F = ma, Conservation of Momentum & Third Law)',
      'Chapter 8: Temperature (Concept of Temperature, Fixed Points, Celsius & Kelvin Scales, Liquid-in-Glass Thermometers)',
      'Chapter 9: Sustainable Energy Sources (Water/Hydroelectric, Solar, Wind, Sea Wave, Geothermal & Tidal Energy)',
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
  },
  'Chemistry': {
    'Form 1': [
      'Chapter 1: Introduction to Chemistry (Concept of Chemistry & Its Importance in Daily Life, Agriculture, Medicine and Industry)',
      'Chapter 2: Laboratory Techniques and Safety (Rules and Safety Precautions, First Aid Kit, Basic Chemistry Apparatus & Warning Signs)',
      'Chapter 3: Heat Sources and Flames (Bunsen Burner Parts, Luminous vs Non-Luminous Flames & Uses of Flames)',
      'Chapter 4: The Scientific Procedure (Steps of Scientific Investigation: Problem Identification, Hypothesis, Experimentation, Data Interpretation & Conclusion)',
      'Chapter 5: Matter (Concept of Matter, States of Matter, Particulate Nature, Physical and Chemical Changes)',
      'Chapter 6: Elements, Compounds and Mixtures (Chemical Symbols, Elements vs Compounds, Solutions, Suspensions, Emulsions & Methods of Separating Mixtures)',
      'Chapter 7: Air, Combustion, Rusting and Firefighting (Composition of Air, Combustion, Conditions & Prevention of Rusting, Classes of Fire & Fire Extinguishers)',
    ],
    'Form 2': [
      'Chapter 1: Oxygen (Laboratory Preparation of Oxygen using Hydrogen Peroxide & Potassium Chlorate, Physical/Chemical Properties & Uses)',
      'Chapter 2: Hydrogen (Laboratory Preparation of Hydrogen from Zinc & Dilute HCl, Properties, Industrial Manufacture & Uses)',
      'Chapter 3: Water (Occurrence, Properties, Water Cycle, Water Treatment & Purification, Importance of Water)',
      'Chapter 4: Fuels and Energy (Categories of Fuels, Destructive Distillation of Coal/Wood, Biogas, Calorific Value & Conservation of Energy)',
      'Chapter 5: Atomic Structure (Sub-Atomic Particles, Atomic Number Z, Mass Number A, Isotopes, Relative Atomic Mass & Electronic Configuration)',
      'Chapter 6: Periodic Classification (Development of the Periodic Table, Periods & Groups, Periodic Trends in Electronegativity, Atomic Radius & Metallic Character)',
      'Chapter 7: Formula, Bonding and Nomenclature (Valency, Electrovalent/Ionic Bonding, Covalent Bonding, Oxidation States, Radicals, Empirical/Molecular Formulae & IUPAC Nomenclature)',
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
  },
  'Biology': {
    'Form 1': [
      'Chapter 1: Introduction to Biology (Basic Concepts, Branches of Biology, Scientific Processes & Importance of Studying Biology)',
      'Chapter 2: Safety in Our Environment (First Aid, First Aid Kit, Common Accidents at Home and School, Waste & Waste Disposal)',
      'Chapter 3: Health and Immunity (Concept of Health and Immunity, Types of Immunity, Factors Affecting Body Immunity, Personal Hygiene & Good Manners, Infections and Diseases)',
      'Chapter 4: Cell Structure and Organisation (The Microscope, Plant and Animal Cell Structures, Functions of Organelles, Cell Differentiation & Specialised Cells)',
      'Chapter 5: Classification of Living Things (Concept of Classification, Artificial vs Natural Systems, Taxonomic Ranks & Binomial Nomenclature)',
      'Chapter 6: Viruses, Kingdom Monera and Kingdom Protoctista (Characteristics, Structure, Reproduction & Economic Importance of Viruses, Bacteria, Amoeba, Paramecium, Euglena & Plasmodium)',
    ],
    'Form 2': [
      'Chapter 1: Kingdom Fungi and Kingdom Plantae (Fungi: Mushroom, Yeast, Bread Mould; Plantae: Division Bryophyta & Division Filicinophyta)',
      'Chapter 2: Nutrition (Concept of Nutrition, Food Nutrients, Biochemical Food Tests, Balanced Diet, Nutritional Deficiencies, Digestive System in Humans & Photosynthesis in Plants)',
      'Chapter 3: Food Processing, Preservation and Storage (Importance and Traditional vs Modern Methods of Food Preservation and Storage)',
      'Chapter 4: Balance of Nature (Natural Environment, Biotic & Abiotic Factors, Interaction of Organisms, Food Chains & Food Webs)',
      'Chapter 5: Transport of Materials in Living Things (Diffusion, Osmosis & Mass Flow; Mammalian Heart, Blood Vessels, Blood Components, Blood Groups; Xylem, Phloem & Transpiration)',
      'Chapter 6: Gaseous Exchange and Respiration (Gaseous Exchange in Mammals, Fish, Amphibians, Insects & Plants; Aerobic and Anaerobic Respiration)',
    ],
    'Form 3': [
      'Chapter 1: Classification of Living Things (Kingdom Plantae: Division Coniferophyta & Division Angiospermophyta — Monocotyledonae vs Dicotyledonae)',
      'Chapter 2: Movement (Concept of Movement and Locomotion, Human Skeletal System, Joints, Antagonistic Muscles & Movement in Plants/Tropisms)',
      'Chapter 3: Coordination (Nervous Coordination in Humans, Central & Peripheral Nervous System, Reflex Arc, Sense Organs [Eye, Ear, Skin, Nose, Tongue], Hormonal/Endocrine System & Plant Tropisms)',
      'Chapter 4: Excretion (Concept of Excretion, Excretory Products, Mammalian Urinary System, Structure of the Nephron, Urine Formation & Excretion in Plants)',
      'Chapter 5: Regulation (Concept of Regulation/Homeostasis, Temperature Regulation in Endotherms & Ectotherms, Osmoregulation & Blood Sugar Regulation by Insulin and Glucagon)',
      'Chapter 6: Reproduction (Mitosis and Meiosis, Asexual vs Sexual Reproduction, Reproduction in Flowering Plants, Pollination, Fertilisation, Human Reproductive System, Pregnancy & Family Planning)',
    ],
    'Form 4': [
      'Chapter 1: Growth (Concept of Growth, Mitosis and Growth, Growth Curves, Seed Dormancy, Viability & Epigeal vs Hypogeal Germination)',
      'Chapter 2: Genetics (Hereditary Material DNA & RNA, Concept of Genetics, Mendel First Law, Monohybrid Inheritance, Incomplete/Co-dominance, Sex Determination, Sex-Linked Traits & Variation/Mutation)',
      'Chapter 3: Classification of Living Things (Kingdom Animalia: Phylum Platyhelminthes, Aschelminthes/Nematoda, Annelida, Arthropoda & Chordata)',
      'Chapter 4: Evolution (Concept of Organic Evolution, Origin of Life, Lamarckism, Darwinism/Natural Selection, Evidence of Evolution: Fossils, Comparative Anatomy, Embryology)',
      'Chapter 5: HIV/AIDS and STIs (Relationship Between HIV, AIDS and STIs, Management and Control of HIV/AIDS and STIs, Counselling and Voluntary Testing)',
    ],
  },
  'Historia ya Tanzania na Maadili': {
    'Form 1': [
      'Sura ya Kwanza: Dhana ya Historia ya Tanzania na Maadili (Maana ya Historia ya Tanzania, Dhana ya Maadili, Umuhimu wa Somo na Uhusiano na Masomo Mengine)',
      'Sura ya Pili: Chimbuko la Jamii za Kitanzania na Maadili Yake (Asili ya Jamii za Kitanzania: Wakushiti, Wabantu, Waniloti na Wakhoisani; Maadili na Mila za Asili)',
      'Sura ya Tatu: Mifumo ya Maisha, Uchumi na Utawala katika Jamii za Awali za Tanzania (Kilimo, Ufugaji, Uhunzi wa Chuma, Biashara ya Masafa Marefu na Mifumo ya Kiutawala)',
      'Sura ya Nne: Urithi wa Kitanzania na Utambulisho wa Taifa (Urithi wa Kiutamaduni na Kihistoria, Lugha ya Kiswahili, Tunu za Taifa: Utu, Uzalendo, Umoja na Amani)',
      'Sura ya Tano: Maadili na Uadilifu katika Jamii ya Tanzania (Misingi ya Maadili katika Familia, Shule na Jamii; Kupinga Rushwa na Mmomonyoko wa Maadili)',
      'Sura ya Sita: Haki na Wajibu wa Raia katika Kulinda Maadili na Tunu za Taifa (Katiba, Haki za Binadamu, Wajibu wa Mwanafunzi na Raia Mwema)',
    ],
    'Form 2': [
      'Sura ya Kwanza: Mwingiliano wa Jamii za Kitanzania na Wageni Kabla ya Ukoloni (Wafanyabiashara wa Kiarabu, Kiajemi na Kireno; Athari za Kiuchumi, Kijamii na Kimaadili)',
      'Sura ya Pili: Uvamizi wa Kikoloni na Mapambano ya Wananchi wa Tanzania (Ugawaji wa Afrika Mashariki, Utawala wa Kijerumani na Kiingereza; Mapambano ya Mkwawa, Abushiri, Mirambo, Kinjekitile na Vita vya Majimaji 1905–1907)',
      'Sura ya Tatu: Mabadiliko ya Kiuchumi, Kijamii na Kimaadili Wakati wa Ukoloni (Uchumi wa Kikoloni, Kilimo cha Mazao ya Biashara, Elimu ya Kikoloni na Athari Zake kwa Maadili ya Kitanzania)',
      'Sura ya Nne: Harakati za Kudai Uhuru Tanganyika na Zanzibar (Vyama vya Wafanyakazi na Wakulima, TAA, TANU na Mwalimu Julius K. Nyerere; ASP na Sheikh Abeid Amani Karume; Uhuru wa Tanganyika 1961)',
      'Sura ya Tano: Mapinduzi Matukufu ya Zanzibar (1964) na Muungano wa Tanganyika na Zanzibar (Sababu za Mapinduzi ya Januari 12, 1964; Muungano wa Aprili 26, 1964 na Umuhimu Wake)',
      'Sura ya Sita: Ujenzi wa Taifa, Azimio la Arusha (1967) na Maadili ya Uongozi (Siasa ya Ujamaa na Kujitegemea, Vijiji vya Ujamaa, Miiko ya Uongozi na Maadili ya Taifa)',
    ],
    'Form 3': [
      'Sura ya Kwanza: Maendeleo ya Kisiasa, Kiuchumi na Kijamii Tanzania Baada ya Azimio la Arusha',
      'Sura ya Pili: Mageuzi ya Kiuchumi na Kisiasa Tanzania (Mfumo wa Vyama Vingi 1992, Uchumi wa Soko na Uwekezaji)',
      'Sura ya Tatu: Maadili ya Uongozi, Utawala Bora na Uwajibikaji wa Umma nchini Tanzania',
      'Sura ya Nne: Kulinda Rasilimali za Taifa, Mazingira na Maadili ya Kazi',
    ],
    'Form 4': [
      'Sura ya Kwanza: Mchango wa Tanzania katika Ukombozi wa Bara la Afrika (Kamati ya Ukombozi ya OAU, Mwalimu Nyerere na Nchi za Mstari wa Mbele)',
      'Sura ya Pili: Tanzania katika Jumuiya za Kikanda na Kimataifa (EAC, SADC, AU, UN na Diplomasia ya Uchumi)',
      'Sura ya Tatu: Utandawazi, Sayansi na Teknolojia na Mustakabali wa Maadili ya Kitanzania',
      'Sura ya Nne: Tathmini ya Urithi wa Taifa, Uzalendo na Dira ya Maendeleo ya Tanzania',
    ],
  },
  'Business Studies': {
    'Form 1': [
      'Chapter 1: Concept and Scope of Business Studies (Meaning, Components of Business Studies, Importance & Relationship with Other Disciplines)',
      'Chapter 2: Production, Distribution and Consumption (Concept of Human Wants, Goods & Services, Factors of Production: Land, Labour, Capital, Entrepreneurship)',
      'Chapter 3: Entrepreneurship and Business Opportunities (Concept of Entrepreneurship, Qualities of an Entrepreneur, Identifying Viable Business Opportunities in Tanzania)',
      'Chapter 4: Sole Proprietorship and Business Formation (Features, Formation, Sources of Capital, Advantages & Challenges of Sole Proprietorship)',
      'Chapter 5: Business Environment and Business Ethics (Internal & External Business Environment, Ethical Practices, Fair Competition & Corporate Social Responsibility)',
      'Chapter 6: Consumer Protection and Basic Financial Literacy (Rights & Responsibilities of Consumers, TBS, FCC, Personal Budgeting & Saving Culture)',
    ],
    'Form 2': [
      'Chapter 1: Forms of Business Units (Partnerships, Co-operative Societies/SACCOS, Private & Public Limited Liability Companies, Public Corporations)',
      'Chapter 2: Domestic Trade (Retail Trade: Small-Scale vs Large-Scale Retailers; Wholesale Trade & Documents Used in Home Trade)',
      'Chapter 3: Warehousing and Stock Control (Types of Warehouses, Functions of Warehousing & Basic Inventory Management)',
      'Chapter 4: Transport and Communication in Business (Modes of Transport in Tanzania: Road, SGR Railway, Water, Air, Pipeline & Digital Business Communication)',
      'Chapter 5: Money, Banking and Mobile Financial Services (Evolution of Money, Central Bank BoT, Commercial Banks & Mobile Money Services)',
      'Chapter 6: Insurance and Business Risk Management (Principles of Insurance: Indemnity, Utmost Good Faith, Insurable Interest, Subrogation & Types of Policies)',
    ],
    'Form 3': [
      'Chapter 1: Marketing and Market Research (Marketing Mix 4Ps: Product, Price, Place, Promotion, Digital Marketing & Customer Care)',
      'Chapter 2: Fundamentals of Financial Accounting (Double Entry System, Source Documents, Books of Prime Entry, Ledger & Trial Balance)',
      'Chapter 3: Financial Statements of a Sole Trader (Income Statement / Trading, Profit & Loss Account and Statement of Financial Position / Balance Sheet)',
      'Chapter 4: Taxation and Business Compliance in Tanzania (TRA, Direct & Indirect Taxes, VAT, PAYE, TIN, EFD Receipts & Business Licensing/BRELA)',
    ],
    'Form 4': [
      'Chapter 1: Business Planning and Project Management (Writing a Comprehensive Business Plan, Executive Summary, Financial Projections & Cash Flow)',
      'Chapter 2: International Trade and Regional Economic Integration (Import/Export Procedures, Balance of Trade/Payments, EAC, SADC & AfCFTA)',
      'Chapter 3: Human Resource and Operations Management (Recruitment, Motivation, Leadership & Quality Control)',
      'Chapter 4: Financial Markets and Investment in Tanzania (Dar es Salaam Stock Exchange DSE, Shares, Bonds, Collective Investment Schemes/UTT AMIS)',
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
      'Chapter 1: Word Processing (Concept of Word Processing, Creating, Editing, Formatting, Tables, Mail Merge & Printing Documents)',
      'Chapter 2: Spreadsheet (Concept of Electronic Spreadsheets, Cell Referencing, Built-in Formulas SUM, AVERAGE, IF, RANK & Creating Charts)',
      'Chapter 3: Computer Networks and Communications (Concept of Networking, LAN, MAN, WAN, Network Topologies: Star, Bus, Ring, Mesh & Network Devices)',
      'Chapter 4: The Internet (Concept of the Internet, World Wide Web, Web Browsers, Search Engines, Electronic Mail & Online Safety)',
      'Chapter 5: Computer Security, Privacy and Ethics (Malware, Antivirus, Firewalls, Cybercrime Laws in Tanzania & Digital Ethics)',
    ],
    'Form 3': [
      'Chapter 1: Problem Solving and Algorithms (Problem Definition, Pseudocode, Flowcharts & Control Structures: Sequence, Selection, Iteration)',
      'Chapter 2: Programming Fundamentals (Data Types, Variables, Operators, Conditional Statements, Loops, Functions & Arrays in Python/C/JavaScript)',
      'Chapter 3: Database Management Systems (Relational Databases, Tables, Primary & Foreign Keys, Queries/SQL, Forms & Reports)',
      'Chapter 4: Website Design and Development (HTML Structure, Tags, Lists, Tables, Forms, Hyperlinks & CSS Styling)',
    ],
    'Form 4': [
      'Chapter 1: Data Representation and Logic Gates (Binary, Octal, Hexadecimal Conversions, Binary Arithmetic & Logic Gates AND, OR, NOT, NAND, NOR, XOR)',
      'Chapter 2: System Analysis and Design (System Development Life Cycle SDLC: Investigation, Analysis, Design, Implementation, Testing & Maintenance)',
      'Chapter 3: Multimedia and Desktop Publishing (DTP Concepts, Graphic Design, Audio/Video Processing & Publication Layout)',
      'Chapter 4: Emerging Technologies and Impact of ICT on Society (Artificial Intelligence, Cloud Computing, IoT, E-Commerce & E-Government in Tanzania)',
    ],
  },
  'Geography': {
    'Form 1': [
      'Chapter 1: Concept of Geography (Meaning, Branches: Physical, Human & Practical Geography, and Importance of Studying Geography)',
      'Chapter 2: The Solar System (Sun, Planets, Satellites, Asteroids, Comets, Earth Shape, Rotation & Revolution, Eclipses, Latitudes, Longitudes & Time Calculation)',
      'Chapter 3: Major Features of the Earth Surface (Continents, Relief Features: Mountains, Plateaus, Plains, Rift Valleys; Oceans, Seas, Lakes & River Basins)',
      'Chapter 4: Weather and Climate (Meaning of Weather vs Climate, Elements of Weather, Weather Station, Stevenson Screen, Instruments, Weather Forecasting & Major Climatic Regions)',
      'Chapter 5: Map Work (Concept & Components of a Map, Types of Maps, Map Scale, Measuring Distances & Areas, Compass Bearing, Direction & Grid References)',
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
  },
  'History': {
    'Form 1': [
      'Chapter 1: Sources and Importance of History (Meaning of History, Importance & Sources: Oral Traditions, Historical Sites, Archaeology, Archives, Museums, Written Records, Anthropology & Linguistics)',
      'Chapter 2: Evolution of Man, Technology and Environment (Theories of Origin of Man: Creation vs Evolution, Stages of Human Evolution, Early, Middle & Late Stone Age and Iron Age)',
      'Chapter 3: Development of Economic Activities and Their Impact (Agriculture, Handcraft & Mining Industries [Iron, Salt, Gold, Copper], Local & Regional Long-Distance Trade in Pre-Colonial Africa)',
      'Chapter 4: Development of Social and Political Systems (Kinship/Clan Organisation, Age-Set System, Ntemiship, Centralised vs Decentralised States in Pre-Colonial Africa)',
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
  },
  'Civics': {
    'Form 1': [
      'Chapter 1: Our Nation (Components of Our Nation, National Symbols: Flag, Coat of Arms, Anthem, Uhuru Torch, Currency, Constitution & National Festivals)',
      'Chapter 2: Promotion of Life Skills (Meaning & Types of Life Skills: Self-Awareness, Assertiveness, Empathy, Problem-Solving, Critical Thinking, Effective Communication & Leadership)',
      'Chapter 3: Human Rights (Concept, Categories of Human Rights, Universal Declaration of Human Rights, Abuse of Human Rights & Role of CHRAGG)',
      'Chapter 4: Responsible Citizenship (Concept of Citizen and Citizenship, Types of Citizenship in Tanzania, Privileges, Responsibilities & Special Groups)',
      'Chapter 5: Work (Concept & Importance of Work for Self and National Development)',
      'Chapter 6: Family Life, Proper Behaviour and Road Safety Education (Courtship, Marriage, Family Stability, Responsible Decision Making, Road Signs, Causes & Prevention of Road Accidents)',
    ],
    'Form 2': [
      'Chapter 1: Government of Tanzania (Concept & Types of Government, Constitution of the United Republic of Tanzania, Three Pillars: Executive, Legislature/Bunge, Judiciary; Union vs Non-Union Matters & Local Government)',
      'Chapter 2: Democracy (Concept, Direct vs Indirect/Representative Democracy, Principles of Democracy, Multi-Party System & Democratic Elections in Tanzania/INEC)',
      'Chapter 3: Gender (Gender Concepts: Sex vs Gender, Gender Roles, Stereotypes, Discrimination, Negative Socio-Cultural Practices & Women Empowerment)',
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
      'Chapter 2: Principles of Double Entry System (Concept of Business Transaction, Debit & Credit Rules for Personal, Real & Nominal Accounts)',
      'Chapter 3: Source Documents and Books of Prime Entry (Invoices, Credit/Debit Notes, Receipts; Sales Day Book, Purchases Day Book, Returns Inwards/Outwards Journals & General Journal)',
      'Chapter 4: Ledger Accounts (Posting from Books of Prime Entry to Sales, Purchases & General Ledgers and Balancing Off Accounts)',
      'Chapter 5: Trial Balance (Purpose, Preparation of a Trial Balance & Errors Not Affecting the Trial Balance)',
      'Chapter 6: Elementary Financial Statements (Income Statement / Trading and Profit & Loss Account and Statement of Financial Position / Balance Sheet)',
    ],
    'Form 2': [
      'Chapter 1: Books of Prime Entry — Cash Books (Two-Column Cash Book, Three-Column Cash Book with Cash/Trade Discounts & Petty Cash Book with Imprest System)',
      'Chapter 2: Bank Reconciliation Statement (Reasons for Discrepancies Between Cash Book and Bank Statement, Unpresented Cheques, Uncredited Deposits, Updating Cash Book & Preparing Bank Reconciliation Statement)',
      'Chapter 3: Government Accounting and Budgeting (Sources of Government Revenue, Capital vs Recurrent Expenditure, Consolidated Fund, Accounting Officers, CAG & Government Budget)',
      'Chapter 4: Correction of Errors and Suspense Account (Errors Disclosed vs Not Disclosed by Trial Balance, Journal Entries for Correction & Suspense Account)',
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
      'Chapter 1: The Scope of Commerce (Concept of Commerce, Branches of Commerce: Trade and Aids to Trade & Importance of Commerce)',
      'Chapter 2: Production (Concept, Stages of Production: Primary, Secondary, Tertiary; Factors of Production, Specialisation & Division of Labour)',
      'Chapter 3: Entrepreneurship (Meaning, Characteristics of Entrepreneurs, Innovation, Business Plan & Self-Employment)',
      'Chapter 4: Domestic/Home Trade (Retail Trade, Small & Large Scale Retailers, Modern Trends in Retailing & Wholesale Trade)',
    ],
    'Form 2': [
      'Chapter 1: Theory of Demand and Supply (Laws of Demand and Supply, Demand/Supply Schedules & Curves, Equilibrium Price & Price Elasticity of Demand/Supply)',
      'Chapter 2: Warehousing Management (Meaning, Types of Warehouses: Private, Public, Bonded; Stock Administration: Stock Level, Rate of Stock Turnover, Mark-up & Margin)',
      'Chapter 3: Transportation (Elements of Transport, Modes of Transport, Containerisation & Factors for Choosing Mode of Transport)',
      'Chapter 4: Communication and Advertising (Importance of Business Communication, Postal/Telecommunication Services & Sales Promotion/Advertising)',
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
      'Chapter 1: Introduction to Agriculture (Concept, Branches of Agriculture, Importance to Tanzanian Economy & Relationship with Other Subjects)',
      'Chapter 2: Farm Tools, Equipment and Workshop Technology (Hand Tools, Maintenance, Farm Workshop Safety & Basic Carpentry/Metalwork)',
      'Chapter 3: Soil Science I (Concept of Soil, Weathering & Soil Formation, Soil Constituents, Soil Profile & Physical Properties of Soil)',
      'Chapter 4: Introduction to Crop Production (Classification of Crops, Land Preparation, Planting Materials, Spacing, Weeding & Harvesting)',
      'Chapter 5: Introduction to Livestock Production (Classes & Breeds of Cattle, Poultry, Goats, Sheep, Pigs & Rabbits Kept in Tanzania)',
    ],
    'Form 2': [
      'Chapter 1: Factors of Production and Farm Management (Land, Labour, Capital, Entrepreneurship, Farm Records & Gross Margin Analysis)',
      'Chapter 2: Soil Fertility, Manures and Fertilisers (Essential Macro & Micro Plant Nutrients, Organic Manures, Inorganic Fertilisers & Fertiliser Calculations)',
      'Chapter 3: Crop Pests, Weeds and Diseases (Identification, Economic Damage & Integrated Pest/Disease Management)',
      'Chapter 4: Livestock Nutrition, Housing and Health (Livestock Feeds, Ration Formulation, Parasites, Common Livestock Diseases & Vaccination)',
    ],
    'Form 3': [
      'Chapter 1: Soil and Water Conservation, Irrigation and Drainage (Soil Erosion Control, Surface, Overhead & Drip Irrigation)',
      'Chapter 2: Agronomy of Selected Field and Horticultural Crops (Maize, Rice, Beans, Cassava, Coffee, Cotton, Cashew, Tomatoes & Onions)',
      'Chapter 3: Animal Breeding and Reproduction (Reproductive Systems, Heat Detection, Artificial Insemination & Selection)',
      'Chapter 4: Agricultural Marketing and Price Fluctuations (Marketing Functions, Co-operatives, Warehouse Receipt System & Storable Commodities)',
    ],
    'Form 4': [
      'Chapter 1: Agricultural Mechanisation and Farm Structures (Tractors, Ploughs, Fences, Crush, Dip Tank & Crop Storage Structures)',
      'Chapter 2: Agroforestry and Environmental Conservation in Agriculture (Silvopastoral, Agrosilvicultural Systems & Climate-Smart Agriculture)',
      'Chapter 3: Financial Analysis in Agribusiness (Partial Budget, Complete Budget, Break-Even Analysis & Agricultural Credit)',
    ],
  },
  'Home Economics': {
    'Form 1': [
      'Chapter 1: Introduction to Home Economics (Concept, Branches: Food & Human Nutrition, Textiles & Garment Construction, Home Management)',
      'Chapter 2: Personal Hygiene, Good Grooming and Safety in the Home (First Aid, Kitchen Hygiene & Waste Disposal)',
      'Chapter 3: Food and Nutrition I (Six Classes of Food Nutrients: Carbohydrates, Proteins, Lipids, Vitamins, Minerals, Water & Dietary Fibre)',
      'Chapter 4: Kitchen Equipment and Cooking Methods (Moist Heat: Boiling, Stewing, Steaming; Dry Heat: Baking, Roasting, Grilling & Frying)',
      'Chapter 5: Sewing Equipment and Basic Stitches (Hand Sewing Tools, Sewing Machine Parts, Temporary & Permanent Stitches)',
    ],
    'Form 2': [
      'Chapter 1: Meal Planning and Balanced Diets for Different Groups (Infants, Pregnant/Lactating Mothers, Adolescents, Elderly & Invalid Diets)',
      'Chapter 2: Food Spoilage, Preservation and Hygiene (Causes of Food Spoilage, Principles & Methods of Food Preservation)',
      'Chapter 3: Textile Fibres and Fabrics (Natural vs Man-Made Fibres: Cotton, Linen, Wool, Silk, Nylon, Polyester; Seams & Fastenings)',
      'Chapter 4: Care of the Home and Laundry Work (Cleaning Agents, Stain Removal, Washing & Finishing Different Fabrics)',
    ],
    'Form 3': [
      'Chapter 1: Baking, Pastry, Cake Making and Flour Mixtures (Raising Agents: Yeast, Baking Powder, Steam & Air)',
      'Chapter 2: Maternal and Child Health Care (Antenatal Care, Immunisation Schedule, Weaning & Childhood Nutritional Disorders)',
      'Chapter 3: Garment Construction (Taking Body Measurements, Pattern Drafting, Cutting Out & Assembling a Garment)',
    ],
    'Form 4': [
      'Chapter 1: Consumer Education and Family Budgeting (Wise Buying, Food Labelling, Managing Family Income & Entrepreneurship in Catering/Tailoring)',
      'Chapter 2: Interior Decoration, Housing and Sanitation (Ventilation, Lighting, Flower Arrangement & Sustainable Home Management)',
    ],
  },
  'English Language': {
    'Form 1': [
      'Chapter 1: Listening to and Understanding Simple Texts (Listening for Specific & General Information)',
      'Chapter 2: Giving Directions and Locating Places (Prepositions of Place, Landmarks & Compass Directions)',
      'Chapter 3: Using a Dictionary (Alphabetical Order, Guide Words, Pronunciation, Parts of Speech & Multiple Meanings)',
      'Chapter 4: Expressing Personal and Group Routines/Habits (Simple Present Tense, Adverbs of Frequency)',
      'Chapter 5: Expressing Ongoing Activities (Present Continuous Tense)',
      'Chapter 6: Expressing Likes and Dislikes, Preferences & Talking About One Family',
      'Chapter 7: Expressing Opinions and Feelings & Talking About Past Events/Activities (Simple Past Tense)',
      'Chapter 8: Expressing Future Plans and Activities (Will / Going to)',
      'Chapter 9: Reading for Comprehension and Interpreting Literary Works (Stories, Poems & Characters)',
      'Chapter 10: Writing Personal and Friendly Letters',
    ],
    'Form 2': [
      'Chapter 1: Listening to Various Simple Oral Texts & Talking About Celebrations/Accidents',
      'Chapter 2: Asking for Services and Making Telephone Calls',
      'Chapter 3: Analysing Information from the Media (Newspapers, Radio, TV, Facts vs Opinions)',
      'Chapter 4: Giving Descriptions of People, Things and Places (Adjectives & Comparisons)',
      'Chapter 5: Talking About Cultural Activities and Expressing Opinions in Debates',
      'Chapter 6: Grammar & Structure (Active and Passive Voice, Conditional Sentences Type 1, 2 & 3, Question Tags)',
      'Chapter 7: Reading for Comprehension & Summary Writing',
      'Chapter 8: Interpreting Literary Works (Novels, Short Stories & Poetry)',
      'Chapter 9: Writing Cards, Invitations, Messages and Official Notices',
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
  },
  'Kiswahili': {
    'Form 1': [
      'Sura ya Kwanza: Mawasiliano na Dhana ya Lugha (Maana ya Mawasiliano, Vipengele vya Mawasiliano, Dhana ya Lugha na Matamshi na Lafudhi ya Kiswahili)',
      'Sura ya Pili: Aina za Maneno na Matumizi ya Kamusi (Nomino N, Kiwakilishi W, Kivumishi V, Kitenzi T, Kielezi E, Kiunganishi U, Kihusishi H, Kihisishi Hs na Kamusi)',
      'Sura ya Tatu: Fasihi kwa Ujumla na Fasihi Simulizi (Maana ya Sanaa na Fasihi, Tanzu za Fasihi Simulizi: Hadithi, Ushairi, Semi, Maigizo na Uhakiki Wake)',
      'Sura ya Nne: Uandishi wa Insha na Barua (Insha za Wasifu za Kisanaa na Zisizo za Kisanaa, Barua ya Kirafiki na Anwani za Bahasha)',
      'Sura ya Tano: Ufahamu na Kusoma kwa Kina (Ufahamu wa Kusikiliza na Kusoma, Kufupisha Habari)',
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
      '1.0 Calculating Devices & Hyperbolic Functions',
      '2.0 Sets, Logic and Mathematical Induction',
      '3.0 Coordinate Geometry I (Conic Sections: Circles, Parabola, Ellipse, Hyperbola)',
      '4.0 Functions, Polynomials, Algebra (Series, Binomial Theorem, Partial Fractions)',
      '5.0 Trigonometry (Identities, Inverse Trig Functions, T-Formulae)',
      '6.0 Linear Programming & Differentiation / Integration I',
    ],
    'Form 6': [
      '1.0 Coordinate Geometry II (Polar Coordinates & Parametric Equations)',
      '2.0 Vectors in 3D (Dot Product, Cross Product, Lines & Planes in 3D)',
      '3.0 Complex Numbers (Argand Diagram, Polar Form, De Moivre Theorem, Roots of Unity)',
      '4.0 Differential Equations (1st & 2nd Order ODEs, Exact & Integrating Factor, Modelling)',
      '5.0 Numerical Methods (Newton-Raphson, Secant, Trapezoidal & Simpson Rules)',
      '6.0 Probability and Statistics (Binomial, Poisson & Normal Distributions)',
    ],
  },
  'Basic Applied Mathematics (BAM)': {
    'Form 5': ['Chapter 1: Calculating Devices', 'Chapter 2: Functions', 'Chapter 3: Algebra (Simultaneous Equations, Sequences & Series)', 'Chapter 4: Differentiation', 'Chapter 5: Integration', 'Chapter 6: Statistics'],
    'Form 6': ['Chapter 1: Probability', 'Chapter 2: Trigonometry', 'Chapter 3: Exponential and Logarithmic Functions', 'Chapter 4: Matrices (3×3 Determinant, Inverse, Cramer Rule)', 'Chapter 5: Linear Programming'],
  },
  'Economics': {
    'Form 5': [
      'Chapter 1: Subject Matter of Economics (Scarcity, Choice, Opportunity Cost, Production Possibility Frontier & Economic Systems)',
      'Chapter 2: Theory of Production (Factors of Production, Law of Diminishing Returns, Returns to Scale & Economies of Scale)',
      'Chapter 3: Theory of Demand and Supply (Demand & Supply Laws, Equilibrium Price, Price/Income/Cross Elasticity)',
      'Chapter 4: Theory of the Firm and Market Structures (Perfect Competition, Monopoly, Monopolistic Competition & Oligopoly)',
      'Chapter 5: Theory of Money, Banking and Price Indices (Functions of Money, Quantity Theory MV = PT, Inflation & Deflation)',
      'Chapter 6: Population and Employment (Population Theories: Malthusian vs Optimum, Labour Market & Unemployment)',
    ],
    'Form 6': [
      'Chapter 1: National Income Accounting (GDP, GNP, NNP, Circular Flow of Income, Multiplier & Accelerator Principles)',
      'Chapter 2: Public Finance and Fiscal Policy (Government Revenue, Taxation Principles, National Budget & Public Debt)',
      'Chapter 3: Financial Institutions and Monetary Policy (Central Bank BoT Instruments, Commercial Banks & Capital Markets)',
      'Chapter 4: International Trade and Balance of Payments (Comparative Advantage, Terms of Trade, Exchange Rates & Regional Integration EAC/SADC)',
      'Chapter 5: Economic Planning, Growth and Development in Tanzania (Indicators of Development, Agriculture, Industrialisation & Environmental Economics)',
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
    keywords: ['sequence', 'series', 'arithmetic progression', 'geometric progression', 'compound interest'],
    title: 'Sequences & Series (Basic Mathematics — Form 3 TIE Textbook Chapter 5)',
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
  chapterSummaryMarkdown: string;
  chapterDeepNotes: string;
} {
  const cleanCls = normalizeClassName(cls || 'Form 1');
  const cleanSub = normalizeSubjectName(subject || 'Basic Mathematics');
  const allChapters = getSyllabusTopicsForClassSubject(cleanCls, cleanSub);

  const attachedBook =
    (siteResources?.focusedResource &&
    (siteResources.focusedResource.category?.toLowerCase().includes('book') ||
      siteResources.focusedResource.title?.toLowerCase().includes('book') ||
      siteResources.focusedResource.title?.toLowerCase().includes('tie'))
      ? siteResources.focusedResource
      : null) ||
    siteResources?.books?.[0] ||
    null;

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
    : [cleanChapHeading];

  const chaptersTocMarkdown = allChapters
    .map((c, idx) => `${c === matchedChapter ? '👉 ' : `• `}**${c}**${c === matchedChapter ? ' *(Active Matched Chapter)*' : ''}`)
    .join('\n');

  const subTopicsMarkdown = subTopicsList
    .map(
      (st, idx) =>
        `  ${idx + 1}. **${st}:** Covers official TIE textbook definitions, governing principles/laws, worked textbook examples, and chapter revision exercises on *${st}*.`
    )
    .join('\n');

  const chapterDeepNotes = `Official TIE Textbook Reference: ${bookTitle}
Active Matched Textbook Chapter: ${matchedChapter}
Sub-Topics in ${matchedChapter}: ${subTopicsList.join('; ')}
All Chapters in ${cleanCls} ${cleanSub} TIE Textbook:
${allChapters.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;

  const chapterSummaryMarkdown = `📖 **Uploaded TIE Textbook Integrated:** **${bookTitle}**\n\n**1. 📑 Complete Official Chapters & Topics in the ${cleanCls} ${cleanSub} TIE Textbook:**\n${chaptersTocMarkdown}\n\n**2. 🔍 Detailed TIE Textbook Chapter Breakdown — ${matchedChapter}:**\n• **Main Textbook Chapter:** **${matchedChapter}**\n• **Sub-Topics & Concepts in the TIE Student's Book:**\n${subTopicsMarkdown}`;

  return {
    bookTitle,
    allChapters,
    matchedChapter,
    chapterSummaryMarkdown,
    chapterDeepNotes,
  };
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

  const parsed = parseClassSubjectTopicFromPrompt(cleanInput, cls, subject);
  const effectiveCls = siteResources?.focusedResource?.form || parsed.cls;
  const effectiveSub = siteResources?.focusedResource?.subject || parsed.subject;
  const syllabusTopics = getSyllabusTopicsForClassSubject(effectiveCls, effectiveSub);
  const effectiveTbInfo = getTieTextbookChapterContent(effectiveCls, effectiveSub, cleanInput, siteResources);
  const effectiveTopic =
    parsed.topic && parsed.topic !== 'ALL'
      ? parsed.topic
      : effectiveTbInfo.matchedChapter.replace(/^(?:Chapter\s+\d+|Sura\s+ya\s+\w+|\d+\.\d+):\s*/i, '');

  const resourceSummaryLines: string[] = [];
  if (siteResources?.focusedResource) {
    const fr = siteResources.focusedResource;
    resourceSummaryLines.push(
      `• **📌 Pinned Active Source:** **${fr.title}** (${fr.category} · ${fr.form} · ${fr.subject} · ${fr.year})`
    );
    if (fr.customContent && fr.customContent.trim().length > 0) {
      resourceSummaryLines.push(
        `• **📄 Attached Excerpt / Notes from "${fr.title}":**\n${fr.customContent.trim().slice(0, 1200)}`
      );
    }
  }
  if (siteResources) {
    if (siteResources.books.length > 0) {
      resourceSummaryLines.push(
        `• **Uploaded TIE Books (${effectiveCls} ${effectiveSub}):** ${siteResources.books
          .slice(0, 4)
          .map((b) => `${b.title} (${b.form})`)
          .join(', ')}`
      );
    }
    if (siteResources.syllabuses.length > 0) {
      resourceSummaryLines.push(
        `• **Official TIE Syllabuses:** ${siteResources.syllabuses
          .slice(0, 3)
          .map((s) => `${s.title} (${s.form})`)
          .join(', ')}`
      );
    }
    if (siteResources.papers.length > 0) {
      resourceSummaryLines.push(
        `• **Attached Past Papers (${siteResources.papers.length}):** ${siteResources.papers
          .slice(0, 5)
          .map((p) => `${p.title} (${p.year})`)
          .join(', ')}`
      );
    }
  }
  const siteResourcesBlock =
    resourceSummaryLines.length > 0
      ? `\n\n**📚 Integrated Elimika Website Resources (${effectiveCls} ${effectiveSub}):**\n${resourceSummaryLines.join('\n')}`
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
      return `📘 **TIE Textbook Reference:** **${effectiveTbInfo.bookTitle}** (${effectiveTbInfo.matchedChapter})\n\n📐 **Direct Answer & Step-by-Step Solution:**\nGiven linear equation:\n$$${a}x ${
        b >= 0 ? '+ ' + b : '- ' + Math.abs(b)
      } = ${c}$$\n\n• **Step 1 (Collect like terms):**\n$$${a}x = ${c} - (${b}) = ${rhs}$$ *(M1 — 01 Mark)*\n• **Step 2 (Divide both sides by ${a}):**\n$$x = \\frac{${rhs}}{${a}} = ${xVal}$$ *(A1 — 01 Mark)*\n\n✅ **Final Answer:** $x = ${xVal}$ **(Total: 02 Marks)**${siteResourcesBlock}`;
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
      return `📘 **TIE Textbook Reference:** **${effectiveTbInfo.bookTitle}** (${effectiveTbInfo.matchedChapter})\n\n📐 **Direct Answer & Quadratic Equation Solution:**\nGiven:\n$$${a}x^2 ${
        b >= 0 ? '+ ' + b : '- ' + Math.abs(b)
      }x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0$$\n\nUsing the TIE Textbook Quadratic Formula:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$ *(M1 — 01 Mark)*\n• Discriminant $\\Delta = (${b})^2 - 4(${a})(${c}) = ${disc}$ *(M1 — 01 Mark)*\n• **Roots:** $x_1 = ${r1}$ or $x_2 = ${r2}$ *(A1 — 01 Mark)*${siteResourcesBlock}`;
    }
  }

  for (const entry of MOHA_BUILTIN_KNOWLEDGE) {
    if (entry.keywords.some((kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(lower))) {
      return `📘 **Official TIE Textbook Reference:** **${effectiveTbInfo.bookTitle}**\n**Matched Textbook Chapter:** **${effectiveTbInfo.matchedChapter}**\n\n### 📌 Direct Answer (${entry.title}):\n${entry.content}${siteResourcesBlock}`;
    }
  }

  if (lower.includes('marking scheme') || lower.includes('rubric')) {
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
    lower.includes('syllabus') ||
    lower.includes('competence') ||
    lower.includes('topics') ||
    lower.includes('chapters') ||
    lower.includes('table of contents') ||
    lower.includes('sura') ||
    lower.includes('tie book') ||
    lower.includes('textbook') ||
    lower.includes('summary') ||
    lower.includes('revision') ||
    lower.includes('summarize')
  ) {
    const topicWorked = buildContentIntegratedQuizQuestions(
      effectiveCls,
      effectiveSub,
      effectiveTopic,
      siteResources,
      parsed.subTopic
    );
    const ex1 = topicWorked[0];
    const ex2 = topicWorked[1];
    return `${effectiveTbInfo.chapterSummaryMarkdown}\n\n**3. 📐 Worked Examples & Questions from ${effectiveTbInfo.bookTitle} (${effectiveTbInfo.matchedChapter}):**\n• **Worked Question 1:** ${ex1?.question}\n  - **Step-by-Step Solution:** ${ex1?.explanation}\n  - **Model Answer:** **${ex1?.options[ex1.correctIndex]}** *(02 Marks)*\n• **Worked Question 2:** ${ex2?.question}\n  - **Step-by-Step Solution:** ${ex2?.explanation}\n  - **Model Answer:** **${ex2?.options[ex2.correctIndex]}** *(02 Marks)*${siteResourcesBlock}`;
  }

  if (
    lower.includes('quiz') ||
    lower.includes('test me') ||
    lower.includes('maswali') ||
    lower.includes('practice') ||
    lower.includes('5 high-yield') ||
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
      .slice(0, lower.includes('5 high-yield') ? 5 : 20)
      .map(
        (q, idx) =>
          `**Question ${idx + 1} (${q.sourceRef || effectiveTbInfo.bookTitle} — ${effectiveTbInfo.matchedChapter}):**\n${q.question}\n${q.options
            .map((opt, oIdx) => `   ${String.fromCharCode(65 + oIdx)}) ${opt}`)
            .join('\n')}\n• **Correct Answer:** **${String.fromCharCode(65 + q.correctIndex)}) ${
            q.options[q.correctIndex]
          }**\n• **Step-by-Step Marking Scheme:** ${q.explanation}`
      )
      .join('\n\n');

    return `🎯 **Official TIE Textbook & NECTA Questions — ${effectiveCls} ${effectiveSub}**\n**TIE Textbook Reference:** **${effectiveTbInfo.bookTitle}**\n**Textbook Chapter / Topic:** **${effectiveTbInfo.matchedChapter}**\n\n${formattedQuestions}${siteResourcesBlock}`;
  }

  const topicWorked = buildContentIntegratedQuizQuestions(
    effectiveCls,
    effectiveSub,
    effectiveTopic,
    siteResources,
    parsed.subTopic
  );
  const bestMatches = [...topicWorked].sort((a, b) => {
    const qWords = lower.split(/\s+/).filter((w) => w.length >= 4);
    const scoreA = qWords.reduce((acc, w) => acc + (`${a.question} ${a.explanation}`.toLowerCase().includes(w) ? 2 : 0), 0);
    const scoreB = qWords.reduce((acc, w) => acc + (`${b.question} ${b.explanation}`.toLowerCase().includes(w) ? 2 : 0), 0);
    return scoreB - scoreA;
  });
  const sampleQ1 = bestMatches[0] || topicWorked[0];
  const sampleQ2 = bestMatches[1] || topicWorked[1];
  const sampleQ3 = bestMatches[2] || topicWorked[2];

  return `📘 **Direct Answer According to Official TIE Textbook (${effectiveTbInfo.bookTitle}):**\n• **Question / Prompt Analyzed:** *"${cleanInput}"*\n• **Relevant TIE Textbook Chapter:** **${effectiveTbInfo.matchedChapter}**\n\n${effectiveTbInfo.chapterSummaryMarkdown}\n\n**3. ✅ Step-by-Step Answered Questions on ${effectiveTbInfo.matchedChapter} (${effectiveCls} ${effectiveSub}):**\n• **Question 1 (${sampleQ1?.sourceRef || 'TIE Textbook'}):**\n  *Question:* ${sampleQ1?.question}\n  *Direct Answer:* **${sampleQ1?.options[sampleQ1.correctIndex]}**\n  *Step-by-Step Marking Scheme:* ${sampleQ1?.explanation}\n\n• **Question 2 (${sampleQ2?.sourceRef || 'TIE Textbook'}):**\n  *Question:* ${sampleQ2?.question}\n  *Direct Answer:* **${sampleQ2?.options[sampleQ2.correctIndex]}**\n  *Step-by-Step Marking Scheme:* ${sampleQ2?.explanation}\n\n• **Question 3 (${sampleQ3?.sourceRef || 'NECTA Past Paper'}):**\n  *Question:* ${sampleQ3?.question}\n  *Direct Answer:* **${sampleQ3?.options[sampleQ3.correctIndex]}**\n  *Step-by-Step Marking Scheme:* ${sampleQ3?.explanation}${siteResourcesBlock}`;
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
      .filter((w) => w.length >= 4 && !promptStopWords.has(w));
    let score = 0;
    for (const w of words) {
      if (hasWordPhrase(queryLower, w)) score += 4;
      else if (w.length >= 6 && queryLower.includes(w.slice(0, w.length - 1))) score += 2;
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

  // If no topic matched in current class, check other classes ONLY within the SAME subject (so e.g. "Logarithms" in Math finds Form 2 Math Chapter 4)
  if (!matchedTopic && bestScore === 0) {
    const allClasses = Object.keys(TIE_CURRICULUM_SUBJECTS);
    for (const candidateCls of allClasses) {
      const candidateTopics = getSyllabusTopicsForClassSubject(candidateCls, subject);
      for (const t of candidateTopics) {
        const sc = scoreTopicMatch(t, lower);
        if (sc >= 4 && sc > bestScore) {
          bestScore = sc;
          matchedTopic = t.replace(/^\d+\.\d+\s*/, '');
          if (!explicitClassFound) {
            cls = candidateCls;
          }
        }
      }
    }
  }

  // Check subject-scoped topic keywords if still not matched
  if (!matchedTopic) {
    const directTopicMap: Array<{
      keywords: string[];
      topic: string;
      defaultForm?: string;
      subjects: string[];
    }> = [
      { keywords: ['logarithm', 'standard form', 'antilog'], topic: 'Chapter 4: Logarithms (Standard Form A × 10^n, Laws of Logarithms & Mathematical Tables)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics', 'Basic Applied Mathematics (BAM)'] },
      { keywords: ['exponent', 'indices', 'radicals', 'surds'], topic: 'Chapter 1: Exponents and Radicals (Laws of Exponents/Indices, Simplifying Radicals/Surds & Rationalising the Denominator)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
      { keywords: ['quadratic equation', 'completing the square', 'discriminant', 'factorisation'], topic: 'Chapter 3: Quadratic Equations (Solving by Factorisation, Completing the Square & General Quadratic Formula)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
      { keywords: ['trigonometry', 'sine rule', 'cosine rule', 'angle of elevation', 'angle of depression'], topic: 'Chapter 9: Trigonometry (Sine, Cosine, Tangent Ratios, Special Angles 30°, 45°, 60° & Angles of Elevation/Depression)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
      { keywords: ['pythagoras', 'hypotenuse'], topic: 'Chapter 8: Pythagoras Theorem (Proof & Real-Life Right-Angled Triangle Applications)', defaultForm: 'Form 2', subjects: ['Basic Mathematics'] },
      { keywords: ['venn diagram', 'subset', 'union of sets', 'intersection of sets'], topic: 'Chapter 10: Sets (Description of Sets, Subsets, Venn Diagrams, Union, Intersection & Complement)', defaultForm: 'Form 2', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
      { keywords: ['mean', 'median', 'mode', 'histogram', 'ogive', 'cumulative frequency'], topic: 'Chapter 3: Statistics (Mean, Median, Mode for Grouped & Ungrouped Data, Assumed Mean & Ogive/Cumulative Frequency)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Geography', 'Basic Applied Mathematics (BAM)'] },
      { keywords: ['domain and range', 'inverse relation'], topic: 'Chapter 1: Relations (Relations, Domain & Range, Graphs of Linear/Quadratic Relations & Inverse of a Relation)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
      { keywords: ['composite function', 'inverse function', 'polynomial function'], topic: 'Chapter 2: Functions (Concept of Function, Linear, Quadratic, Polynomial, Step & Absolute Value Functions, Inverse Functions)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
      { keywords: ['arithmetic progression', 'geometric progression', 'compound interest', 'sequences and series'], topic: 'Chapter 5: Sequences and Series (Arithmetic Progression AP, Geometric Progression GP, Arithmetic/Geometric Mean & Compound Interest)', defaultForm: 'Form 3', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
      { keywords: ['direct variation', 'inverse variation', 'joint variation'], topic: 'Chapter 4: Rates and Variations (Rates of Exchange, Direct, Inverse, Joint & Partial Variations)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
      { keywords: ['chord properties', 'cyclic quadrilateral', 'tangent theorem'], topic: 'Chapter 6: Circles (Parts of a Circle, Central & Inscribed Angles, Chord Properties, Cyclic Quadrilaterals & Tangent Theorems)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
      { keywords: ['earth as a sphere', 'nautical mile', 'great circle', 'small circle'], topic: 'Chapter 7: The Earth as a Sphere (Great & Small Circles, Latitudes & Longitudes, Distance in Kilometres & Nautical Miles)', defaultForm: 'Form 3', subjects: ['Basic Mathematics'] },
      { keywords: ['determinant', 'cramer', 'singular matrix', 'inverse matrix', 'matrices'], topic: 'Chapter 7: Matrices and Transformations (2×2 Matrix Operations, Determinant, Inverse Matrix, Simultaneous Equations & Linear Transformations)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Additional Mathematics', 'Basic Applied Mathematics (BAM)'] },
      { keywords: ['position vector', 'unit vector', 'dot product'], topic: 'Chapter 6: Vectors (Displacement & Position Vectors, Magnitude & Direction, Vector Addition, Scalar Multiplication & Bearings)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Physics', 'Additional Mathematics'] },
      { keywords: ['mutually exclusive', 'independent events', 'tree diagram', 'probability'], topic: 'Chapter 4: Probability (Sample Space, Event Probability, Mutually Exclusive Events, Independent Events & Tree Diagrams)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
      { keywords: ['linear programming', 'feasible region', 'objective function'], topic: 'Chapter 8: Linear Programming (Formulating Constraints, Objective Function, Graphing Feasible Region & Optimal Value)', defaultForm: 'Form 4', subjects: ['Basic Mathematics', 'Basic Applied Mathematics (BAM)'] },
      { keywords: ['simultaneous equation', 'linear equation', 'linear inequality'], topic: 'Chapter 8: Algebra (Algebraic Expressions, Linear Equations, Simultaneous Equations & Linear Inequalities)', defaultForm: 'Form 1', subjects: ['Basic Mathematics', 'Additional Mathematics'] },
      { keywords: ['simple interest', 'profit and loss'], topic: 'Chapter 10: Ratios, Profit and Loss (Ratios, Proportions, Profit/Loss Percentage & Simple Interest)', defaultForm: 'Form 1', subjects: ['Basic Mathematics'] },
      { keywords: ['differentiation', 'integration', 'derivative', 'stationary point', 'calculus'], topic: 'Chapter 3: Differentiation (Limits, First Principles, Chain Rule, Product Rule, Quotient Rule, Tangents & Stationary Points)', defaultForm: 'Form 3', subjects: ['Additional Mathematics', 'Advanced Mathematics', 'Basic Applied Mathematics (BAM)'] },
      { keywords: ['double entry', 'trial balance', 'ledger', 'balance sheet'], topic: 'Chapter 2: Principles of Double Entry System (Concept of Business Transaction, Debit & Credit Rules for Personal, Real & Nominal Accounts)', defaultForm: 'Form 1', subjects: ['Book-Keeping', 'Business Studies', 'Accountancy', 'Basic Mathematics'] },
      { keywords: ['ohm law', "ohm's law", 'resistor', 'current electricity'], topic: 'Chapter 2: Current Electricity (Electric Current I = Q/t, Voltage, Ohm Law V = IR, Factors Affecting Resistance & Series/Parallel Resistors)', defaultForm: 'Form 2', subjects: ['Physics'] },
      { keywords: ['archimedes', 'law of flotation', 'upthrust', 'relative density'], topic: 'Chapter 5: Archimedes Principle and Law of Flotation (Upthrust, Apparent Weight, Relative Density, Sinking, Floating & Hydrometer)', defaultForm: 'Form 1', subjects: ['Physics'] },
      { keywords: ['newton law', "newton's law", 'uniformly accelerated', 'linear momentum'], topic: 'Chapter 7: Newton Laws of Motion (First Law & Inertia, Second Law & Linear Momentum F = ma, Conservation of Momentum & Third Law)', defaultForm: 'Form 2', subjects: ['Physics'] },
      { keywords: ['mechanical advantage', 'velocity ratio', 'simple machine', 'pulley'], topic: 'Chapter 5: Simple Machines (Mechanical Advantage, Velocity Ratio, Efficiency, Levers, Pulleys, Inclined Plane, Screw Jack, Wheel & Axle, Hydraulic Press)', defaultForm: 'Form 2', subjects: ['Physics'] },
      { keywords: ['snell law', 'refractive index', 'total internal reflection', 'curved mirror'], topic: 'Chapter 3: Light (Reflection at Curved Mirrors, Mirror Formula 1/f = 1/u + 1/v, Refraction of Light, Snell Law, Total Internal Reflection, Lenses & Dispersion)', defaultForm: 'Form 3', subjects: ['Physics'] },
      { keywords: ['specific heat capacity', 'latent heat', 'boyle law', 'charles law'], topic: 'Chapter 7: Measurement of Thermal Energy (Heat Capacity C = mc, Specific Heat Capacity Q = mcΔθ, Change of State & Specific Latent Heat Q = mL)', defaultForm: 'Form 3', subjects: ['Physics'] },
      { keywords: ['radioactivity', 'half-life', 'half life', 'alpha particle', 'beta particle'], topic: 'Chapter 3: Radioactivity (Structure of the Nucleus, Isotopes, Alpha, Beta & Gamma Radiation, Nuclear Equations, Half-Life Calculations, Nuclear Fission & Fusion)', defaultForm: 'Form 4', subjects: ['Physics', 'Chemistry'] },
      { keywords: ['mole concept', 'molar mass', 'stoichiometry', 'avogadro', 'empirical formula'], topic: 'Chapter 4: The Mole Concept and Related Calculations (Avogadro Constant, Molar Mass, Molar Gas Volume at STP 22.4 dm³ & Stoichiometric Reacting Masses)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
      { keywords: ['titration', 'molarity', 'volumetric analysis'], topic: 'Chapter 5: Volumetric Analysis (Standard Solutions, Acid-Base Titration Apparatus, Choice of Indicators, Molarity M = conc/Mr & Percentage Purity/Water of Crystallisation)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
      { keywords: ['electrolysis', 'faraday', 'cathode', 'anode'], topic: 'Chapter 6: Ionic Theory and Electrolysis (Electrolytes vs Non-Electrolytes, Preferential Discharge of Ions, Faraday First & Second Laws of Electrolysis & Industrial Applications)', defaultForm: 'Form 3', subjects: ['Chemistry'] },
      { keywords: ['homologous series', 'alkane', 'alkene', 'alkyne', 'carboxylic acid'], topic: 'Chapter 2: Introduction to Organic Chemistry (Homologous Series, Isomerism, Alkanes, Alkenes, Alkynes, Alcohols/Alkanols, Carboxylic Acids/Alkanoic Acids, Esterification & Soap/Polymers)', defaultForm: 'Form 4', subjects: ['Chemistry'] },
      { keywords: ['photosynthesis', 'digestive system', 'food test', 'balanced diet'], topic: 'Chapter 2: Nutrition (Concept of Nutrition, Food Nutrients, Biochemical Food Tests, Balanced Diet, Nutritional Deficiencies, Digestive System in Humans & Photosynthesis in Plants)', defaultForm: 'Form 2', subjects: ['Biology'] },
      { keywords: ['osmosis', 'transpiration', 'xylem', 'phloem', 'mammalian heart'], topic: 'Chapter 5: Transport of Materials in Living Things (Diffusion, Osmosis & Mass Flow; Mammalian Heart, Blood Vessels, Blood Components, Blood Groups; Xylem, Phloem & Transpiration)', defaultForm: 'Form 2', subjects: ['Biology'] },
      { keywords: ['mendel', 'monohybrid', 'punnett', 'sex-linked', 'genetics'], topic: 'Chapter 2: Genetics (Hereditary Material DNA & RNA, Concept of Genetics, Mendel First Law, Monohybrid Inheritance, Incomplete/Co-dominance, Sex Determination, Sex-Linked Traits & Variation/Mutation)', defaultForm: 'Form 4', subjects: ['Biology'] },
      { keywords: ['topographical map', 'grid reference', 'contour', 'intervisibility'], topic: 'Chapter 5: Map Reading and Map Interpretation (Topographical Maps, Contours, Cross-Section/Relief Profile, Intervisibility, Gradient, Drainage Patterns & Human Settlements)', defaultForm: 'Form 3', subjects: ['Geography'] },
    ];

    for (const item of directTopicMap) {
      const subjectCompatible = item.subjects.some((s) => matchesSubjectQuery(s, subject));
      if (!subjectCompatible && explicitSubjectFound) continue;
      if (item.keywords.some((kw) => hasWordPhrase(lower, kw))) {
        if (subjectCompatible) {
          matchedTopic = item.topic;
          if (!explicitClassFound && item.defaultForm) {
            cls = item.defaultForm;
          }
          matchedFromPrompt = true;
          break;
        }
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


