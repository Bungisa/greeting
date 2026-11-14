import { GameDifficulty, GameQuestion } from './gameDataAndStorage';
import {
  computeQuestionSignature,
  doesQuestionTopicMatchSelectedTopic,
  getSeenSignaturesForClassSubject,
  getStoredBankQuestionsForClassSubject,
  getVariantOffsetForClassSubject,
  resetSeenQuestionsForClassSubject,
} from '../utils/questionBankManager';

export interface LevelSpecificSeed {
  cls: string;
  subject: string;
  chapter: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  hint: string;
  pinDigitClue?: {
    equationPrompt: string;
    digitValue: number;
    stepHint: string;
  };
}

/**
 * Curated, challenging, level-specific questions directly grounded in Official TIE Student's Textbooks
 * for Form 1, Form 2, Form 3, Form 4, Form 5, Form 6, and Standard 1–7.
 */
export const TIE_LEVEL_TEXTBOOK_BANK: LevelSpecificSeed[] = [
  // ============================================================================
  // FORM 1 — BASIC MATHEMATICS (TIE Form 1 Student's Book — All 12 Chapters)
  // ============================================================================
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 2: Numbers I (HCF, LCM & BODMAS)',
    question:
      'Three school bells ring at intervals of $15\\text{ minutes}$, $20\\text{ minutes}$, and $30\\text{ minutes}$ respectively. If they all ring together at $8:00\\text{ a.m.}$, at what time will they next ring together?',
    options: ['$9:00\\text{ a.m.}$', '$8:45\\text{ a.m.}$', '$9:30\\text{ a.m.}$', '$10:00\\text{ a.m.}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Find the Lowest Common Multiple (LCM) of $15, 20,$ and $30$: $15 = 3 \\times 5$, $20 = 2^2 \\times 5$, $30 = 2 \\times 3 \\times 5$. Step 2: $\\text{LCM} = 2^2 \\times 3 \\times 5 = 60\\text{ minutes} = 1\\text{ hour}$. Step 3: $8:00\\text{ a.m.} + 1\\text{ hour} = 9:00\\text{ a.m.}$',
    hint: 'Find the LCM of $15, 20,$ and $30$ in minutes, then convert to hours.',
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 2: Numbers I (Prime Factorisation & Integers)',
    question:
      'Given that the Highest Common Factor (HCF) of two numbers is $12$ and their Lowest Common Multiple (LCM) is $180$, if one of the numbers is $36$, find the other number:',
    options: ['$60$', '$48$', '$72$', '$45$'],
    correctIndex: 0,
    explanation:
      'Step 1: For any two positive integers $A$ and $B$, $A \\times B = \\text{HCF} \\times \\text{LCM}$. Step 2: $36 \\times B = 12 \\times 180 = 2,160 \\Rightarrow B = \\frac{2,160}{36} = 60$.',
    hint: 'Use the identity $\\text{First Number} \\times \\text{Second Number} = \\text{HCF} \\times \\text{LCM}$.',
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 3: Fractions, Decimals and Percentages',
    question:
      'Evaluate the exact value of $\\frac{3\\frac{1}{2} - 1\\frac{3}{4}}{2\\frac{1}{3} \\times \\frac{3}{4}}$ in its simplest form:',
    options: ['$1$', '$\\frac{7}{4}$', '$\\frac{4}{7}$', '$2$'],
    correctIndex: 0,
    explanation:
      'Step 1 (Numerator): $3\\frac{1}{2} - 1\\frac{3}{4} = \\frac{7}{2} - \\frac{7}{4} = \\frac{14 - 7}{4} = \\frac{7}{4}$. Step 2 (Denominator): $2\\frac{1}{3} \\times \\frac{3}{4} = \\frac{7}{3} \\times \\frac{3}{4} = \\frac{7}{4}$. Step 3: $\\frac{7/4}{7/4} = 1$.',
    hint: 'Convert all mixed numbers to improper fractions first, then evaluate numerator and denominator separately.',
    pinDigitClue: {
      equationPrompt: 'If $\\frac{7/4}{7/4} = A$, find $A$',
      digitValue: 1,
      stepHint: 'Any non-zero fraction divided by itself equals 1.',
    },
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 4 & 9: Recurring Decimals & Rational Numbers',
    question:
      'Convert the recurring decimal $0.\\dot{2}\\dot{7}$ ($0.272727\\dots$) into a fraction $\\frac{a}{b}$ in its lowest terms:',
    options: ['$\\frac{3}{11}$', '$\\frac{27}{100}$', '$\\frac{9}{37}$', '$\\frac{3}{10}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Let $x = 0.272727\\dots$. Since two digits repeat, multiply by $100$: $100x = 27.2727\\dots$. Step 2: Subtract: $100x - x = 27 \\Rightarrow 99x = 27 \\Rightarrow x = \\frac{27}{99} = \\frac{3}{11}$.',
    hint: 'Let $x = 0.2727\\dots$, multiply by $100$, subtract $x$, and simplify $\\frac{27}{99}$.',
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 5 & 6: Metric Units and Approximations',
    question:
      'Express the number $0.004876$ correct to **two significant figures** and state its value in standard notation:',
    options: [
      '$0.0049$ (or $4.9 \\times 10^{-3}$)',
      '$0.0048$ (or $4.8 \\times 10^{-3}$)',
      '$0.0050$ (or $5.0 \\times 10^{-3}$)',
      '$0.00488$ (or $4.88 \\times 10^{-3}$)',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Leading zeros are not significant. The first two significant digits are $4$ and $8$. Step 2: The third significant digit is $7 \\ge 5$, so round $8$ up to $9$, giving $0.0049 = 4.9 \\times 10^{-3}$.',
    hint: 'Start counting significant figures from the first non-zero digit ($4$).',
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 7: Introduction to Geometry (Angles & Polygons)',
    question:
      'Two supplementary angles are in the ratio $4 : 5$. Find the measure of the smaller angle and the exterior angle of a regular polygon with $9$ sides:',
    options: [
      'Smaller angle $= 80^\\circ$ ; Exterior angle $= 40^\\circ$',
      'Smaller angle $= 40^\\circ$ ; Exterior angle $= 40^\\circ$',
      'Smaller angle $= 80^\\circ$ ; Exterior angle $= 45^\\circ$',
      'Smaller angle $= 100^\\circ$ ; Exterior angle $= 40^\\circ$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Supplementary angles add up to $180^\\circ$. Total parts $= 4 + 5 = 9$. Smaller angle $= \\frac{4}{9} \\times 180^\\circ = 80^\\circ$. Step 2: Exterior angle of a regular $9$-sided polygon $= \\frac{360^\\circ}{9} = 40^\\circ$.',
    hint: 'Supplementary angles sum to $180^\\circ$, and exterior angles of any polygon sum to $360^\\circ$.',
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 8: Algebra (Simultaneous Linear Equations)',
    question:
      'Solve the simultaneous equations $3x + 2y = 19$ and $2x - y = 8$ to find the value of $(x + y)$:',
    options: ['$7$', '$5$', '$2$', '$9$'],
    correctIndex: 0,
    explanation:
      'Step 1: From $2x - y = 8$, we get $y = 2x - 8$. Step 2: Substitute into $3x + 2(2x - 8) = 19 \\Rightarrow 7x - 16 = 19 \\Rightarrow 7x = 35 \\Rightarrow x = 5$. Step 3: $y = 2(5) - 8 = 2$. Therefore $x + y = 5 + 2 = 7$.',
    hint: 'Multiply the second equation by $2$ and add it to the first equation to eliminate $y$.',
    pinDigitClue: {
      equationPrompt: 'From $3x + 2y = 19$ and $2x - y = 8$, find $x$',
      digitValue: 5,
      stepHint: 'Add $3x + 2y = 19$ and $4x - 2y = 16$ to get $7x = 35$.',
    },
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 10: Ratios, Profit, Loss and Simple Interest',
    question:
      'A shopkeeper marks a radio at $25\\%$ above its cost price of $\\text{TZS } 80,000$, then allows a cash discount of $10\\%$ on the marked price. Calculate the actual percentage profit made:',
    options: ['$12.5\\%$', '$15.0\\%$', '$10.0\\%$', '$20.0\\%$'],
    correctIndex: 0,
    explanation:
      'Step 1: Marked Price $= 80,000 \\times 1.25 = \\text{TZS } 100,000$. Step 2: Selling Price after $10\\%$ discount $= 100,000 \\times 0.90 = \\text{TZS } 90,000$. Step 3: Profit $= 90,000 - 80,000 = \\text{TZS } 10,000$. Percentage Profit $= \\frac{10,000}{80,000} \\times 100\\% = 12.5\\%$.',
    hint: 'First compute the Marked Price ($125\\%$ of $80,000$), then take $90\\%$ of that Marked Price.',
    pinDigitClue: {
      equationPrompt: 'Time $T$ (years) if $\\text{TZS } 50,000$ earns $\\text{TZS } 12,000$ at $8\\%$ p.a.',
      digitValue: 3,
      stepHint: '$T = \\frac{100 \\times I}{P \\times R} = \\frac{1,200,000}{400,000} = 3$.',
    },
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 11: Coordinate Geometry',
    question:
      'Find the equation of the straight line passing through the point $(2, -3)$ which is perpendicular to the line $2x + 4y = 9$:',
    options: [
      '$y = 2x - 7$',
      '$y = -\\frac{1}{2}x - 2$',
      '$y = 2x + 7$',
      '$y = -2x + 1$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Rewrite $2x + 4y = 9 \\Rightarrow y = -\\frac{1}{2}x + \\frac{9}{4}$, so gradient $m_1 = -\\frac{1}{2}$. Step 2: For a perpendicular line, $m_1 m_2 = -1 \\Rightarrow m_2 = 2$. Step 3: Using $(2, -3)$: $y - (-3) = 2(x - 2) \\Rightarrow y = 2x - 7$.',
    hint: 'Find the gradient $m_1$ of $2x + 4y = 9$ first, then use $m_2 = -1/m_1$.',
  },
  {
    cls: 'Form 1',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 12: Perimeters and Areas',
    question:
      'A circular track has an inner radius of $14\\text{ m}$ and an outer radius of $21\\text{ m}$. Using $\\pi = \\frac{22}{7}$, calculate the area of the running track between the two circles:',
    options: ['$770\\text{ m}^2$', '$1,386\\text{ m}^2$', '$616\\text{ m}^2$', '$385\\text{ m}^2$'],
    correctIndex: 0,
    explanation:
      'Step 1: Area of annulus $A = \\pi(R^2 - r^2) = \\frac{22}{7}(21^2 - 14^2)$. Step 2: Factor as difference of two squares: $\\frac{22}{7}(21 - 14)(21 + 14) = \\frac{22}{7} \\times 7 \\times 35 = 22 \\times 35 = 770\\text{ m}^2$.',
    hint: 'Use $A = \\pi(R^2 - r^2) = \\pi(R - r)(R + r)$ with $R = 21$ and $r = 14$.',
  },

  // ============================================================================
  // FORM 1 — ADDITIONAL MATHEMATICS (TIE Form 1 Additional Mathematics Book)
  // ============================================================================
  {
    cls: 'Form 1',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 1: Numbers (Base Numerals & Number Systems)',
    question:
      'Convert the base-five numeral $342_{\\text{five}}$ to base ten, and then express the result in binary (base two):',
    options: [
      '$97_{\\text{ten}} = 1100001_{\\text{two}}$',
      '$97_{\\text{ten}} = 1010001_{\\text{two}}$',
      '$87_{\\text{ten}} = 1010111_{\\text{two}}$',
      '$92_{\\text{ten}} = 1011100_{\\text{two}}$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Expand $342_{\\text{five}} = 3(5^2) + 4(5^1) + 2(5^0) = 75 + 20 + 2 = 97_{\\text{ten}}$. Step 2: Express $97$ as powers of $2$: $97 = 64 + 32 + 1 = 1\\cdot 2^6 + 1\\cdot 2^5 + 0\\cdot 2^4 + 0\\cdot 2^3 + 0\\cdot 2^2 + 0\\cdot 2^1 + 1\\cdot 2^0 = 1100001_{\\text{two}}$.',
    hint: 'First compute $3 \\times 25 + 4 \\times 5 + 2$, then decompose into powers of $2$ ($64 + 32 + 1$).',
  },
  {
    cls: 'Form 1',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 1: Numbers (Modular Arithmetic & Divisibility)',
    question:
      'Find the smallest positive integer $x$ satisfying the linear congruence $4x + 5 \\equiv 2 \\pmod{7}$, and evaluate $(23 \\times 19) \\pmod{6}$:',
    options: [
      '$x = 1$ ; $(23 \\times 19) \\equiv 5 \\pmod{6}$',
      '$x = 3$ ; $(23 \\times 19) \\equiv 1 \\pmod{6}$',
      '$x = 1$ ; $(23 \\times 19) \\equiv 1 \\pmod{6}$',
      '$x = 5$ ; $(23 \\times 19) \\equiv 5 \\pmod{6}$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: $4x + 5 \\equiv 2 \\pmod{7} \\Rightarrow 4x \\equiv -3 \\equiv 4 \\pmod{7} \\Rightarrow x = 1$. Step 2: Modulo $6$: $23 \\equiv 5 \\pmod{6}$ and $19 \\equiv 1 \\pmod{6}$, so $23 \\times 19 \\equiv 5 \\times 1 = 5 \\pmod{6}$.',
    hint: 'Subtract $5$ from both sides modulo $7$ so $4x \\equiv -3 \\equiv 4 \\pmod{7}$.',
  },
  {
    cls: 'Form 1',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 2: Symmetry (Lines of Symmetry & Rotational Symmetry)',
    question:
      'A regular hexagon and a rectangle (non-square) are drawn on a plane. State the number of lines of symmetry $L$ and the angle of rotational symmetry $\\theta$ of the regular hexagon:',
    options: [
      '$L = 6$ lines of symmetry ; $\\theta = 60^\\circ$ (Order $6$)',
      '$L = 6$ lines of symmetry ; $\\theta = 120^\\circ$ (Order $3$)',
      '$L = 3$ lines of symmetry ; $\\theta = 60^\\circ$ (Order $6$)',
      '$L = 12$ lines of symmetry ; $\\theta = 30^\\circ$ (Order $12$)',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: A regular $n$-gon has $n$ lines of symmetry and rotational symmetry of order $n$. For a regular hexagon ($n = 6$), $L = 6$. Step 2: Angle of rotation $\\theta = \\frac{360^\\circ}{6} = 60^\\circ$.',
    hint: 'For any regular polygon with $n$ sides, the order of rotational symmetry is $n$ and the smallest angle of rotation is $360^\\circ / n$.',
  },
  {
    cls: 'Form 1',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 3: Algebra (Transposition of Formulae & Inequalities)',
    question:
      'Make $u$ the subject of the lens/mirror formula $\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}$, and find the value of $u$ when $f = 12\\text{ cm}$ and $v = 36\\text{ cm}$:',
    options: [
      '$u = \\frac{fv}{v - f} = 18\\text{ cm}$',
      '$u = \\frac{fv}{f + v} = 9\\text{ cm}$',
      '$u = \\frac{v - f}{fv} = 18\\text{ cm}$',
      '$u = \\frac{fv}{f - v} = -18\\text{ cm}$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: $\\frac{1}{u} = \\frac{1}{f} - \\frac{1}{v} = \\frac{v - f}{fv}$. Taking reciprocals gives $u = \\frac{fv}{v - f}$. Step 2: Substitute $f = 12, v = 36$: $u = \\frac{12 \\times 36}{36 - 12} = \\frac{432}{24} = 18\\text{ cm}$.',
    hint: 'Isolate $\\frac{1}{u} = \\frac{1}{f} - \\frac{1}{v}$, combine over common denominator $fv$, then invert.',
  },
  {
    cls: 'Form 1',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 4: Geometrical Constructions (Inscribed & Circumscribed Polygons)',
    question:
      'In a geometrical construction of an angle of $75^\\circ$ using only a ruler and a pair of compasses, which combination of standard constructed angles is bisected?',
    options: [
      'Construct $60^\\circ$ and $90^\\circ$, then bisect the $30^\\circ$ angle between them ($60^\\circ + 15^\\circ = 75^\\circ$)',
      'Construct $45^\\circ$ and $60^\\circ$, then bisect the angle between them',
      'Bisect an angle of $120^\\circ$ twice',
      'Construct $90^\\circ$ and $120^\\circ$, then bisect the angle between them',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Construct a $60^\\circ$ angle and a perpendicular $90^\\circ$ ray from the same vertex. Step 2: The angle between $60^\\circ$ and $90^\\circ$ is $30^\\circ$. Bisecting this $30^\\circ$ interval adds $15^\\circ$ to $60^\\circ$, yielding $60^\\circ + 15^\\circ = 75^\\circ$.',
    hint: 'Notice that $75^\\circ = 60^\\circ + \\frac{1}{2}(90^\\circ - 60^\\circ)$.',
  },
  {
    cls: 'Form 1',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 5: Coordinate Geometry (Internal & External Division of a Line Segment)',
    question:
      'Find the coordinates of point $P(x, y)$ which divides the line segment joining $A(-2, 5)$ and $B(8, -5)$ internally in the ratio $2 : 3$:',
    options: ['$(2, 1)$', '$(4, -1)$', '$(3, 0)$', '$(1, 2)$'],
    correctIndex: 0,
    explanation:
      'Step 1: Using the internal section formula $P(x, y) = \\left(\\frac{m x_2 + n x_1}{m + n}, \\frac{m y_2 + n y_1}{m + n}\\right)$ with $m = 2, n = 3$: Step 2: $x = \\frac{2(8) + 3(-2)}{2 + 3} = \\frac{16 - 6}{5} = 2$, and $y = \\frac{2(-5) + 3(5)}{5} = \\frac{-10 + 15}{5} = 1$. Thus $P = (2, 1)$.',
    hint: 'Apply $x = \\frac{mx_2 + nx_1}{m+n}$ and $y = \\frac{my_2 + ny_1}{m+n}$ with $m=2, n=3$.',
  },
  {
    cls: 'Form 1',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 5: Coordinate Geometry (Collinear Points & Perpendicular Bisector)',
    question:
      'If the points $A(1, 2)$, $B(3, 6)$, and $C(k, 12)$ are collinear, find the value of $k$:',
    options: ['$k = 6$', '$k = 5$', '$k = 7$', '$k = 4$'],
    correctIndex: 0,
    explanation:
      'Step 1: Since $A, B,$ and $C$ are collinear, gradient $m_{AB} = m_{BC}$. Step 2: $m_{AB} = \\frac{6 - 2}{3 - 1} = \\frac{4}{2} = 2$. Step 3: $\\frac{12 - 6}{k - 3} = 2 \\Rightarrow \\frac{6}{k - 3} = 2 \\Rightarrow k - 3 = 3 \\Rightarrow k = 6$.',
    hint: 'Equate the slope between $A(1,2)$ and $B(3,6)$ to the slope between $B(3,6)$ and $C(k,12)$.',
  },

  // ============================================================================
  // FORM 2 — ADDITIONAL MATHEMATICS (TIE Form 2 Additional Mathematics Book)
  // ============================================================================
  {
    cls: 'Form 2',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 1: Algebra (Simultaneous Linear & Quadratic Systems)',
    question:
      'Find the positive coordinates $(x, y)$ where the straight line $y = x + 1$ intersects the circle $x^2 + y^2 = 25$:',
    options: ['$(3, 4)$', '$(4, 3)$', '$(3, 5)$', '$(2, 3)$'],
    correctIndex: 0,
    explanation:
      'Step 1: Substitute $y = x + 1$ into $x^2 + y^2 = 25$: $x^2 + (x + 1)^2 = 25 \\Rightarrow 2x^2 + 2x - 24 = 0 \\Rightarrow x^2 + x - 12 = 0$. Step 2: Factorise $(x + 4)(x - 3) = 0$. For $x > 0$, $x = 3$ and $y = 3 + 1 = 4$.',
    hint: 'Substitute $y = x + 1$ into $x^2 + y^2 = 25$ and solve the resulting quadratic equation.',
  },
  {
    cls: 'Form 2',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 3: Logic (Propositions, Converse, Contrapositive & Truth Tables)',
    question:
      'Given the conditional statement $p \\rightarrow q$: "If a quadrilateral is a rhombus, then its diagonals are perpendicular", which expression is logically equivalent (having the exact same truth table) to $p \\rightarrow q$?',
    options: [
      'The contrapositive $(\\sim q \\rightarrow \\sim p)$ and $(\\sim p \\vee q)$',
      'The converse $(q \\rightarrow p)$',
      'The inverse $(\\sim p \\rightarrow \\sim q)$',
      'The negation $\\sim(p \\rightarrow q) \\equiv (p \\wedge \\sim q)$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: By the laws of mathematical logic, an implication $p \\rightarrow q$ is logically equivalent to its contrapositive $\\sim q \\rightarrow \\sim p$ and to the disjunction $\\sim p \\vee q$.',
    hint: 'Recall that an implication and its contrapositive always have identical truth tables.',
  },
  {
    cls: 'Form 2',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 4: Locus (Cartesian Equation of a Locus)',
    question:
      'Find the Cartesian equation of the locus of a moving point $P(x, y)$ such that its distance from $A(2, 0)$ is twice its distance from $B(-1, 0)$:',
    options: [
      '$x^2 + y^2 + 4x = 0$',
      '$x^2 + y^2 - 4x = 0$',
      '$3x^2 + 3y^2 + 4x = 0$',
      '$x^2 + y^2 + 2x - 3 = 0$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Given $PA = 2PB \\Rightarrow PA^2 = 4PB^2$. Step 2: $(x - 2)^2 + y^2 = 4[(x + 1)^2 + y^2] \\Rightarrow x^2 - 4x + 4 + y^2 = 4x^2 + 8x + 4 + 4y^2$. Step 3: Collect terms: $3x^2 + 3y^2 + 12x = 0 \\Rightarrow x^2 + y^2 + 4x = 0$.',
    hint: 'Square both sides of $PA = 2PB$ so $(x - 2)^2 + y^2 = 4[(x + 1)^2 + y^2]$.',
  },

  // ============================================================================
  // FORM 3 — ADDITIONAL MATHEMATICS (TIE Form 3 Additional Mathematics Book)
  // ============================================================================
  {
    cls: 'Form 3',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 2: Equation and Remainder Theorem (Roots α, β & Polynomials)',
    question:
      'If $\\alpha$ and $\\beta$ are the roots of the quadratic equation $2x^2 - 6x + 5 = 0$, find the exact value of $\\alpha^2 + \\beta^2$:',
    options: ['$4$', '$9$', '$\\frac{13}{2}$', '$14$'],
    correctIndex: 0,
    explanation:
      'Step 1: Sum of roots $\\alpha + \\beta = -\\frac{b}{a} = \\frac{6}{2} = 3$, and product of roots $\\alpha\\beta = \\frac{c}{a} = \\frac{5}{2}$. Step 2: $\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta = 3^2 - 2\\left(\\frac{5}{2}\\right) = 9 - 5 = 4$.',
    hint: 'Use $\\alpha + \\beta = 3$, $\\alpha\\beta = \\frac{5}{2}$, and the identity $\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta$.',
  },
  {
    cls: 'Form 3',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 2: Equation and Remainder Theorem',
    question:
      'When the polynomial $P(x) = 2x^3 + kx^2 - 5x + 6$ is divided by $(x - 2)$, the remainder is $12$. Find the value of the constant $k$:',
    options: ['$k = 0$', '$k = 2$', '$k = -1$', '$k = 3$'],
    correctIndex: 0,
    explanation:
      'Step 1: By the Remainder Theorem, $P(2) = 12$. Step 2: $2(2)^3 + k(2)^2 - 5(2) + 6 = 12 \\Rightarrow 16 + 4k - 10 + 6 = 12 \\Rightarrow 12 + 4k = 12 \\Rightarrow k = 0$.',
    hint: 'Substitute $x = 2$ into $P(x)$ and set $P(2) = 12$.',
  },
  {
    cls: 'Form 3',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 3: Functions (Rational Functions & Asymptotes)',
    question:
      'Determine the vertical asymptote and horizontal asymptote of the rational function $f(x) = \\frac{3x - 5}{x - 2}$:',
    options: [
      'Vertical asymptote: $x = 2$ ; Horizontal asymptote: $y = 3$',
      'Vertical asymptote: $x = -2$ ; Horizontal asymptote: $y = 3$',
      'Vertical asymptote: $x = 2$ ; Horizontal asymptote: $y = -5$',
      'Vertical asymptote: $x = 3$ ; Horizontal asymptote: $y = 2$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Set denominator $x - 2 = 0 \\Rightarrow x = 2$ is the vertical asymptote. Step 2: Divide leading terms $\\lim_{x \\to \\infty} \\frac{3x - 5}{x - 2} = \\frac{3}{1} = 3$, so $y = 3$ is the horizontal asymptote.',
    hint: 'Set denominator to zero for the vertical asymptote, and take the ratio of leading coefficients of $x$ for the horizontal asymptote.',
  },
  {
    cls: 'Form 3',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 6: Differentiation (Calculus — Power Rule & Stationary Points)',
    question:
      'Find the derivative $\\frac{dy}{dx}$ of $y = x^3 - 6x^2 + 9x + 2$ and determine the $x$-coordinates of its stationary (turning) points:',
    options: [
      '$\\frac{dy}{dx} = 3x^2 - 12x + 9$ ; stationary at $x = 1$ and $x = 3$',
      '$\\frac{dy}{dx} = 3x^2 - 6x + 9$ ; stationary at $x = 1$ and $x = 3$',
      '$\\frac{dy}{dx} = 3x^2 - 12x + 9$ ; stationary at $x = -1$ and $x = -3$',
      '$\\frac{dy}{dx} = x^2 - 4x + 3$ ; stationary at $x = 2$ and $x = 3$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Differentiate term-by-term: $\\frac{dy}{dx} = 3x^2 - 12x + 9$. Step 2: At stationary points, $\\frac{dy}{dx} = 0 \\Rightarrow 3(x^2 - 4x + 3) = 0 \\Rightarrow 3(x - 1)(x - 3) = 0 \\Rightarrow x = 1$ or $x = 3$.',
    hint: 'Differentiate $y$ with respect to $x$ and solve $\\frac{dy}{dx} = 0$.',
  },

  // ============================================================================
  // FORM 4 — ADDITIONAL MATHEMATICS (TIE Form 4 Additional Mathematics Book)
  // ============================================================================
  {
    cls: 'Form 4',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 1: Integration (Definite Integrals & Area Under a Curve)',
    question:
      'Evaluate the definite integral $\\int_1^3 (3x^2 - 2x + 1)\\,dx$:',
    options: ['$20$', '$18$', '$22$', '$16$'],
    correctIndex: 0,
    explanation:
      'Step 1: Antiderivative $F(x) = [x^3 - x^2 + x]_1^3$. Step 2: Evaluate at limits: $F(3) = 27 - 9 + 3 = 21$, and $F(1) = 1 - 1 + 1 = 1$. Step 3: $F(3) - F(1) = 21 - 1 = 20$.',
    hint: 'Integrate to get $[x^3 - x^2 + x]_1^3$, then compute $F(3) - F(1)$.',
  },
  {
    cls: 'Form 4',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 2: Vectors in 2D and 3D (Dot Product & Orthogonal Vectors)',
    question:
      'Find the scalar (dot) product of the 3D vectors $\\vec{a} = 2\\mathbf{i} - 3\\mathbf{j} + 4\\mathbf{k}$ and $\\vec{b} = 3\\mathbf{i} + 2\\mathbf{j} + \\mathbf{k}$:',
    options: ['$4$', '$16$', '$-4$', '$8$'],
    correctIndex: 0,
    explanation:
      'Step 1: $\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y + a_z b_z$. Step 2: $(2)(3) + (-3)(2) + (4)(1) = 6 - 6 + 4 = 4$.',
    hint: 'Multiply corresponding $\\mathbf{i}, \\mathbf{j}, \\mathbf{k}$ components and add them together.',
  },
  {
    cls: 'Form 4',
    subject: 'Additional Mathematics',
    chapter: 'Chapter 4: Permutations, Combinations and Probability',
    question:
      'A school academic committee of $4$ students is to be chosen from $5$ Form Four students and $4$ Form Three students. In how many ways can the committee be formed if it must contain **exactly $2$ Form Four** and **$2$ Form Three** students?',
    options: ['$60$ ways', '$126$ ways', '$30$ ways', '$120$ ways'],
    correctIndex: 0,
    explanation:
      'Step 1: Choose $2$ from $5$ Form Four students: $^5C_2 = \\frac{5 \\times 4}{2 \\times 1} = 10$. Step 2: Choose $2$ from $4$ Form Three students: $^4C_2 = \\frac{4 \\times 3}{2 \\times 1} = 6$. Step 3: Total committees $= 10 \\times 6 = 60$ ways.',
    hint: 'Compute $^5C_2 \\times ^4C_2$.',
  },

  // ============================================================================
  // FORM 2 — BASIC MATHEMATICS (TIE Form 2 Student's Book)
  // ============================================================================
  {
    cls: 'Form 2',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 1: Rates and Variations',
    question:
      'Given that $y$ varies directly as $x^2$ and inversely as $\\sqrt{z}$, and $y = 12$ when $x = 3$ and $z = 16$, find the value of $y$ when $x = 5$ and $z = 25$:',
    options: ['$26\\frac{2}{3}$ (or $\\frac{80}{3}$)', '$32$', '$24$', '$16$'],
    correctIndex: 0,
    explanation:
      'Step 1: $y = \\frac{kx^2}{\\sqrt{z}}$. Substitute $y = 12, x = 3, z = 16$: $12 = \\frac{k(9)}{4} \\Rightarrow 9k = 48 \\Rightarrow k = \\frac{16}{3}$. Step 2: For $x = 5, z = 25$: $y = \\frac{(16/3)(25)}{5} = \\frac{80}{3} = 26\\frac{2}{3}$.',
    hint: 'Write $y = \\frac{kx^2}{\\sqrt{z}}$ and solve for the constant of proportionality $k$ first.',
    pinDigitClue: {
      equationPrompt: 'If $y = \\frac{kx}{z}$ and $y = 6$ when $x = 9, z = 3$, find $k$',
      digitValue: 2,
      stepHint: '$6 = k(9/3) \\Rightarrow 3k = 6 \\Rightarrow k = 2$.',
    },
  },
  {
    cls: 'Form 2',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 4: Quadratic Equations',
    question:
      'If the quadratic equation $2x^2 - kx + 8 = 0$ has equal (repeated) real roots, find the positive value of $k$:',
    options: ['$k = 8$', '$k = 4$', '$k = 16$', '$k = 6$'],
    correctIndex: 0,
    explanation:
      'Step 1: For equal real roots, the discriminant $\\Delta = b^2 - 4ac = 0$. Step 2: $(-k)^2 - 4(2)(8) = 0 \\Rightarrow k^2 = 64 \\Rightarrow k = 8$ (positive value).',
    hint: 'Set the discriminant $b^2 - 4ac = 0$ where $a = 2, b = -k, c = 8$.',
    pinDigitClue: {
      equationPrompt: 'Positive value of $k$ for equal roots in $2x^2 - kx + 8 = 0$',
      digitValue: 8,
      stepHint: 'Set $k^2 - 4(2)(8) = 0 \\Rightarrow k^2 = 64$.',
    },
  },
  {
    cls: 'Form 2',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 5 & 6: Exponents, Radicals and Logarithms',
    question:
      'Solve for $x$ in the logarithmic equation $\\log_{10}(x - 1) + \\log_{10}(x + 2) = 1$ (for $x > 1$):',
    options: ['$x = 3$', '$x = 4$', '$x = 2$', '$x = 5$'],
    correctIndex: 0,
    explanation:
      'Step 1: Combine logs: $\\log_{10}[(x - 1)(x + 2)] = 1 \\Rightarrow (x - 1)(x + 2) = 10^1 = 10$. Step 2: Expand: $x^2 + x - 2 = 10 \\Rightarrow x^2 + x - 12 = 0 \\Rightarrow (x + 4)(x - 3) = 0$. Since $x > 1$, $x = 3$.',
    hint: 'Use $\\log A + \\log B = \\log(AB) = 1 \\Rightarrow AB = 10$.',
    pinDigitClue: {
      equationPrompt: 'Solve $\\log_2(x + 5) = 3$ for $x$',
      digitValue: 3,
      stepHint: '$x + 5 = 2^3 = 8 \\Rightarrow x = 3$.',
    },
  },
  {
    cls: 'Form 2',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 7: Sets and Venn Diagrams',
    question:
      'In a Form 2 class of $50$ students, $32$ study Physics ($P$), $28$ study Chemistry ($C$), and $6$ study neither subject. How many students study **both** Physics and Chemistry?',
    options: ['$16$ students', '$10$ students', '$22$ students', '$14$ students'],
    correctIndex: 0,
    explanation:
      'Step 1: $n(P \\cup C) = n(\\mu) - n(P \\cup C)\' = 50 - 6 = 44$. Step 2: $n(P \\cap C) = n(P) + n(C) - n(P \\cup C) = 32 + 28 - 44 = 16$ students.',
    hint: 'First subtract the $6$ students who study neither from $50$ to find $n(P \\cup C)$.',
  },
  {
    cls: 'Form 2',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 8: Trigonometry',
    question:
      'Without using mathematical tables, evaluate the exact value of $\\frac{\\sin 60^\\circ \\cos 30^\\circ + \\sin 30^\\circ \\cos 60^\\circ}{\\tan 45^\\circ}$:',
    options: ['$1$', '$\\frac{\\sqrt{3}}{2}$', '$\\frac{1}{2}$', '$\\sqrt{3}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Substitute special angle values: $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}, \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}, \\sin 30^\\circ = \\frac{1}{2}, \\cos 60^\\circ = \\frac{1}{2}, \\tan 45^\\circ = 1$. Step 2: $\\frac{(\\frac{\\sqrt{3}}{2})(\\frac{\\sqrt{3}}{2}) + (\\frac{1}{2})(\\frac{1}{2})}{1} = \\frac{3}{4} + \\frac{1}{4} = 1$.',
    hint: 'Recall $\\sin 60^\\circ = \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}$ and $\\sin 30^\\circ = \\cos 60^\\circ = \\frac{1}{2}$.',
  },

  // ============================================================================
  // FORM 3 — BASIC MATHEMATICS (TIE Form 3 Student's Book)
  // ============================================================================
  {
    cls: 'Form 3',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 2: Functions (Composite & Inverse Functions)',
    question:
      'Given $f(x) = 2x - 3$ and $g(x) = x^2 + 1$, find the value of $f^{-1}(g(2))$:',
    options: ['$4$', '$7$', '$5$', '$3$'],
    correctIndex: 0,
    explanation:
      'Step 1: Evaluate $g(2) = 2^2 + 1 = 5$. Step 2: Find $f^{-1}(x)$: let $y = 2x - 3 \\Rightarrow x = \\frac{y + 3}{2}$. Step 3: Substitute $5$: $f^{-1}(5) = \\frac{5 + 3}{2} = 4$.',
    hint: 'First compute $g(2)$, then solve $2x - 3 = g(2)$ for $x$.',
    pinDigitClue: {
      equationPrompt: 'If $f(x) = 2x - 3$ and $g(x) = x^2 + 1$, find $f^{-1}(g(2))$',
      digitValue: 4,
      stepHint: '$g(2) = 5$, and $2x - 3 = 5 \\Rightarrow x = 4$.',
    },
  },
  {
    cls: 'Form 3',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 5: Sequences and Series (AP & GP)',
    question:
      'The 3rd term of a Geometric Progression (GP) with positive common ratio $r$ is $18$ and its 6th term is $486$. Find the common ratio $r$ and the first term $G_1$:',
    options: [
      '$r = 3, \\; G_1 = 2$',
      '$r = 2, \\; G_1 = 4.5$',
      '$r = 3, \\; G_1 = 6$',
      '$r = 6, \\; G_1 = 0.5$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: $G_3 = G_1 r^2 = 18$ and $G_6 = G_1 r^5 = 486$. Step 2: Divide $\\frac{G_6}{G_3} = r^3 = \\frac{486}{18} = 27 \\Rightarrow r = 3$. Step 3: $G_1(3^2) = 18 \\Rightarrow 9G_1 = 18 \\Rightarrow G_1 = 2$.',
    hint: 'Divide $G_6 = G_1 r^5$ by $G_3 = G_1 r^2$ to get $r^3$.',
    pinDigitClue: {
      equationPrompt: 'Common ratio $r$ if $G_3 = 18$ and $G_6 = 486$ in a GP',
      digitValue: 3,
      stepHint: '$r^3 = 486 / 18 = 27 \\Rightarrow r = 3$.',
    },
  },
  {
    cls: 'Form 3',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 6: Circles (Chord & Tangent Theorems)',
    question:
      'Two chords $AB$ and $CD$ intersect internally at point $P$ inside a circle. Given $AP = 6\\text{ cm}$, $PB = 8\\text{ cm}$, and $CP = 4\\text{ cm}$, calculate the total length of chord $CD$:',
    options: ['$16\\text{ cm}$', '$12\\text{ cm}$', '$14\\text{ cm}$', '$10\\text{ cm}$'],
    correctIndex: 0,
    explanation:
      'Step 1: By the intersecting chords theorem, $AP \\times PB = CP \\times PD$. Step 2: $6 \\times 8 = 4 \\times PD \\Rightarrow PD = \\frac{48}{4} = 12\\text{ cm}$. Step 3: Total length of chord $CD = CP + PD = 4 + 12 = 16\\text{ cm}$.',
    hint: 'First find $PD$ using $AP \\cdot PB = CP \\cdot PD$, then add $CP + PD$ for the full chord $CD$.',
    pinDigitClue: {
      equationPrompt: 'If tangent $PT = 6\\text{ cm}$ and secant $PA = 3\\text{ cm}$, find $PB$ where $PT^2 = PA \\cdot PB$ (divide by 2)',
      digitValue: 6,
      stepHint: '$PT^2 = 36 = 3 \\times 12$, and $12 / 2 = 6$.',
    },
  },
  {
    cls: 'Form 3',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 7: Earth as a Sphere',
    question:
      'Two towns $P(12^\\circ\\text{S}, 30^\\circ\\text{E})$ and $Q(18^\\circ\\text{N}, 30^\\circ\\text{E})$ lie on the same meridian of longitude. Calculate the distance between $P$ and $Q$ in nautical miles ($\\text{nm}$):',
    options: ['$1,800\\text{ nm}$', '$360\\text{ nm}$', '$3,330\\text{ nm}$', '$900\\text{ nm}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Since $P$ is South and $Q$ is North of the Equator on the same meridian, angular difference $\\theta = 12^\\circ + 18^\\circ = 30^\\circ$. Step 2: Distance along a great circle in nautical miles $= 60 \\times \\theta = 60 \\times 30 = 1,800\\text{ nm}$.',
    hint: 'Add latitudes in opposite hemispheres ($12^\\circ + 18^\\circ$) and multiply by $60\\text{ nm/degree}$.',
  },
  {
    cls: 'Form 3',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 3: Linear Programming',
    question:
      'Maximize the objective function $Z = 50x + 40y$ subject to the corner points of a feasible region: $O(0,0), A(6,0), B(4,5),$ and $C(0,7)$:',
    options: [
      'Maximum $Z = 400$ at $B(4, 5)$',
      'Maximum $Z = 300$ at $A(6, 0)$',
      'Maximum $Z = 280$ at $C(0, 7)$',
      'Maximum $Z = 360$ at $B(4, 5)$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Evaluate $Z = 50x + 40y$ at each vertex: At $O(0,0) \\Rightarrow 0$; At $A(6,0) \\Rightarrow 300$; At $B(4,5) \\Rightarrow 50(4) + 40(5) = 200 + 200 = 400$; At $C(0,7) \\Rightarrow 280$. Step 2: Maximum value is $400$ at $(4,5)$.',
    hint: 'Substitute each corner point $(x, y)$ into $Z = 50x + 40y$.',
  },

  // ============================================================================
  // FORM 4 — BASIC MATHEMATICS (TIE Form 4 Student's Book)
  // ============================================================================
  {
    cls: 'Form 4',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 7: Matrices and Transformations',
    question:
      'Given the matrix $A = \\begin{pmatrix} 4 & 2 \\\\ 5 & 3 \\end{pmatrix}$, find its determinant $|A|$ and the $(1,1)$ entry of its inverse $A^{-1}$:',
    options: [
      '$|A| = 2$ ; $(1,1)$ entry of $A^{-1}$ is $1.5$ (or $\\frac{3}{2}$)',
      '$|A| = 22$ ; $(1,1)$ entry of $A^{-1}$ is $\\frac{4}{22}$',
      '$|A| = 2$ ; $(1,1)$ entry of $A^{-1}$ is $2$',
      '$|A| = -2$ ; $(1,1)$ entry of $A^{-1}$ is $-1.5$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: $|A| = (4 \\times 3) - (2 \\times 5) = 12 - 10 = 2$. Step 2: $A^{-1} = \\frac{1}{2}\\begin{pmatrix} 3 & -2 \\\\ -5 & 4 \\end{pmatrix}$, so the top-left $(1,1)$ entry is $\\frac{3}{2} = 1.5$.',
    hint: 'Compute $|A| = ad - bc$, then swap $a$ and $d$ and divide by $|A|$.',
    pinDigitClue: {
      equationPrompt: 'Determinant $|A|$ of $A = \\begin{pmatrix} 4 & 2 \\\\ 5 & 3 \\end{pmatrix}$',
      digitValue: 2,
      stepHint: '$|A| = (4)(3) - (2)(5) = 12 - 10 = 2$.',
    },
  },
  {
    cls: 'Form 4',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 4: Probability',
    question:
      'Two independent events $A$ and $B$ have probabilities $P(A) = \\frac{2}{5}$ and $P(B) = \\frac{1}{4}$. Calculate the probability $P(A \\cup B)$ that at least one of the events occurs:',
    options: ['$\\frac{11}{20}$', '$\\frac{13}{20}$', '$\\frac{1}{10}$', '$\\frac{3}{9}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Since $A$ and $B$ are independent, $P(A \\cap B) = P(A) \\times P(B) = \\frac{2}{5} \\times \\frac{1}{4} = \\frac{2}{20}$. Step 2: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = \\frac{8}{20} + \\frac{5}{20} - \\frac{2}{20} = \\frac{11}{20}$.',
    hint: 'Use $P(A \\cup B) = P(A) + P(B) - P(A)P(B)$ for independent events.',
    pinDigitClue: {
      equationPrompt: 'If $\\vec{u} = 3\\mathbf{i} + 4\\mathbf{j}$, find magnitude $|\\vec{u}|$',
      digitValue: 5,
      stepHint: '$|\\vec{u}| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.',
    },
  },
  {
    cls: 'Form 4',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 3: Three-Dimensional Figures',
    question:
      'A right rectangular pyramid has a base measuring $8\\text{ cm}$ by $6\\text{ cm}$ and a vertical height $h = 12\\text{ cm}$. Calculate the length of each slant edge from the apex $V$ to a base corner:',
    options: ['$13\\text{ cm}$', '$15\\text{ cm}$', '$10\\text{ cm}$', '$14\\text{ cm}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Diagonal of the rectangular base $d = \\sqrt{8^2 + 6^2} = \\sqrt{64 + 36} = 10\\text{ cm}$. Step 2: Distance from base center $O$ to a corner is $\\frac{d}{2} = 5\\text{ cm}$. Step 3: Slant edge $l = \\sqrt{h^2 + 5^2} = \\sqrt{12^2 + 5^2} = \\sqrt{169} = 13\\text{ cm}$.',
    hint: 'First find half the base diagonal ($5\\text{ cm}$), then apply Pythagoras theorem with vertical height $12\\text{ cm}$.',
    pinDigitClue: {
      equationPrompt: 'Value of $k$ if vectors $2\\mathbf{i} + 3\\mathbf{j}$ and $6\\mathbf{i} - k\\mathbf{j}$ are perpendicular ($\\vec{a}\\cdot\\vec{b}=0$)',
      digitValue: 4,
      stepHint: '$2(6) + 3(-k) = 0 \\Rightarrow 12 = 3k \\Rightarrow k = 4$.',
    },
  },
  {
    cls: 'Form 4',
    subject: 'Basic Mathematics',
    chapter: 'Chapter 5: Trigonometry (Sine & Cosine Rules)',
    question:
      'In $\\triangle ABC$, side $a = 7\\text{ cm}$, side $b = 8\\text{ cm}$, and the included angle $C = 60^\\circ$. Using the Cosine Rule, calculate the exact length of side $c$:',
    options: ['$\\sqrt{57}\\text{ cm}$', '$\\sqrt{113}\\text{ cm}$', '$\\sqrt{65}\\text{ cm}$', '$7.5\\text{ cm}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Cosine Rule: $c^2 = a^2 + b^2 - 2ab\\cos C$. Step 2: $c^2 = 7^2 + 8^2 - 2(7)(8)\\cos 60^\\circ = 49 + 64 - 112(0.5) = 113 - 56 = 57 \\Rightarrow c = \\sqrt{57}\\text{ cm}$.',
    hint: 'Apply $c^2 = a^2 + b^2 - 2ab\\cos 60^\\circ$ with $\\cos 60^\\circ = 0.5$.',
  },

  // ============================================================================
  // PHYSICS — FORM 1, FORM 2, FORM 3, FORM 4 (TIE Physics Student's Books)
  // ============================================================================
  {
    cls: 'Form 1',
    subject: 'Physics',
    chapter: 'Chapter 6: Archimedes’ Principle and Law of Flotation',
    question:
      'A solid metal cylinder weighs $36\\text{ N}$ in air, $28\\text{ N}$ when completely immersed in water, and $30\\text{ N}$ when completely immersed in an unknown liquid $L$. Calculate the relative density of liquid $L$:',
    options: ['$0.75$', '$1.33$', '$0.83$', '$4.50$'],
    correctIndex: 0,
    explanation:
      'Step 1: Upthrust in liquid $L = 36 - 30 = 6\\text{ N}$. Step 2: Upthrust in water $= 36 - 28 = 8\\text{ N}$. Step 3: Relative density of liquid $= \\frac{\\text{Upthrust in liquid}}{\\text{Upthrust in water}} = \\frac{6}{8} = 0.75$.',
    hint: 'Divide the apparent loss of weight in liquid $L$ by the apparent loss of weight in water.',
    pinDigitClue: {
      equationPrompt: 'Relative density of a solid weighing $24\\text{ N}$ in air and $18\\text{ N}$ in water',
      digitValue: 4,
      stepHint: '$\\text{R.D.} = \\frac{24}{24 - 18} = \\frac{24}{6} = 4$.',
    },
  },
  {
    cls: 'Form 1',
    subject: 'Physics',
    chapter: 'Chapter 8: Pressure in Liquids and Solids',
    question:
      'In a hydraulic press, the area of the small piston is $0.02\\text{ m}^2$ and the area of the large piston is $0.50\\text{ m}^2$. What effort force on the small piston is required to lift a load of $4,000\\text{ N}$ on the large piston?',
    options: ['$160\\text{ N}$', '$250\\text{ N}$', '$80\\text{ N}$', '$200\\text{ N}$'],
    correctIndex: 0,
    explanation:
      'Step 1: By Pascal’s Principle, $\\frac{F_1}{A_1} = \\frac{F_2}{A_2}$. Step 2: $F_1 = 4,000 \\times \\frac{0.02}{0.50} = 4,000 \\times \\frac{1}{25} = 160\\text{ N}$.',
    hint: 'Use Pascal’s principle $\\frac{F_1}{A_1} = \\frac{F_2}{A_2}$.',
  },
  {
    cls: 'Form 2',
    subject: 'Physics',
    chapter: 'Chapter 4: Moment of a Force & Equilibrium',
    question:
      'A uniform metre rule ($100\\text{ cm}$) is pivoted at the $40\\text{ cm}$ mark and balances horizontally when a mass of $60\\text{ g}$ is hung at the $20\\text{ cm}$ mark. Calculate the mass of the metre rule:',
    options: ['$120\\text{ g}$', '$80\\text{ g}$', '$60\\text{ g}$', '$100\\text{ g}$'],
    correctIndex: 0,
    explanation:
      'Step 1: The weight of a uniform metre rule acts at its centre of gravity ($50\\text{ cm}$ mark), which is $50 - 40 = 10\\text{ cm}$ from the pivot. Step 2: Anticlockwise moment $= 60\\text{ g} \\times (40 - 20)\\text{ cm} = 1200\\text{ g}\\cdot\\text{cm}$. Step 3: $M \\times 10 = 1200 \\Rightarrow M = 120\\text{ g}$.',
    hint: 'Remember the weight of the uniform metre rule acts at the $50\\text{ cm}$ mark.',
    pinDigitClue: {
      equationPrompt: 'Mechanical Advantage if a machine lifts $360\\text{ N}$ with an effort of $60\\text{ N}$',
      digitValue: 6,
      stepHint: '$\\text{M.A.} = \\frac{\\text{Load}}{\\text{Effort}} = \\frac{360}{60} = 6$.',
    },
  },
  {
    cls: 'Form 2',
    subject: 'Physics',
    chapter: 'Chapter 5: Simple Machines (Pulleys & Efficiency)',
    question:
      'A block and tackle pulley system with Velocity Ratio ($\\text{VR} = 5$) operates at an efficiency of $80\\%$. Calculate the effort required to raise a load of $600\\text{ N}$:',
    options: ['$150\\text{ N}$', '$120\\text{ N}$', '$200\\text{ N}$', '$96\\text{ N}$'],
    correctIndex: 0,
    explanation:
      'Step 1: $\\text{Efficiency} = \\frac{\\text{MA}}{\\text{VR}} \\times 100\\% \\Rightarrow 80\\% = \\frac{\\text{MA}}{5} \\times 100\\% \\Rightarrow \\text{MA} = 4$. Step 2: $\\text{MA} = \\frac{\\text{Load}}{\\text{Effort}} \\Rightarrow \\text{Effort} = \\frac{600}{4} = 150\\text{ N}$.',
    hint: 'First find $\\text{MA} = \\text{Efficiency} \\times \\text{VR}$, then divide Load by $\\text{MA}$.',
  },
  {
    cls: 'Form 3',
    subject: 'Physics',
    chapter: 'Chapter 9: Current Electricity (Internal Resistance & EMF)',
    question:
      'A dry cell of electromotive force $E = 3.0\\text{ V}$ and internal resistance $r = 0.5\\,\\Omega$ is connected to two parallel resistors of $4\\,\\Omega$ and $4\\,\\Omega$. Calculate the terminal potential difference $V$ across the cell:',
    options: ['$2.4\\text{ V}$', '$2.0\\text{ V}$', '$2.5\\text{ V}$', '$1.8\\text{ V}$'],
    correctIndex: 0,
    explanation:
      'Step 1: Equivalent external resistance $R = \\frac{4 \\times 4}{4 + 4} = 2.0\\,\\Omega$. Step 2: Current $I = \\frac{E}{R + r} = \\frac{3.0}{2.0 + 0.5} = 1.2\\text{ A}$. Step 3: Terminal voltage $V = IR = 1.2 \\times 2.0 = 2.4\\text{ V}$.',
    hint: 'First find the parallel resistance $R = 2\\,\\Omega$, then use $I = \\frac{E}{R + r}$ and $V = IR$.',
    pinDigitClue: {
      equationPrompt: 'Current $I$ (in A) when $E = 12\\text{ V}, R = 3\\,\\Omega, r = 1\\,\\Omega$',
      digitValue: 3,
      stepHint: '$I = \\frac{E}{R + r} = \\frac{12}{3 + 1} = 3\\text{ A}$.',
    },
  },
  {
    cls: 'Form 4',
    subject: 'Physics',
    chapter: 'Chapter 3: Radioactivity and Nuclear Energy',
    question:
      'Thorium-234 ($^{234}_{90}\\text{Th}$) decays by emitting two beta ($\\beta^-$) particles and one alpha ($^4_2\\text{He}$) particle to form nuclide $X$. Determine the mass number $A$ and atomic number $Z$ of nuclide $X$:',
    options: [
      '$A = 230, \\; Z = 90$',
      '$A = 230, \\; Z = 86$',
      '$A = 232, \\; Z = 89$',
      '$A = 230, \\; Z = 88$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Two $\\beta^-$ emissions leave mass number unchanged ($234$) and increase atomic number by $2$ ($90 + 2 = 92$). Step 2: One $\\alpha$ emission decreases mass number by $4$ ($234 - 4 = 230$) and decreases atomic number by $2$ ($92 - 2 = 90$).',
    hint: 'Each $\\beta^-$ increases $Z$ by $1$, while an $\\alpha$ particle decreases $A$ by $4$ and $Z$ by $2$.',
    pinDigitClue: {
      equationPrompt: 'Number of half-lives elapsed when $80\\text{ g}$ decays to $5\\text{ g}$',
      digitValue: 4,
      stepHint: '$80 \\rightarrow 40 \\rightarrow 20 \\rightarrow 10 \\rightarrow 5\\text{ g}$ is $4$ half-lives.',
    },
  },

  // ============================================================================
  // CHEMISTRY — FORM 1, FORM 2, FORM 3, FORM 4 (TIE Chemistry Student's Books)
  // ============================================================================
  {
    cls: 'Form 1',
    subject: 'Chemistry',
    chapter: 'Chapter 5: Matter and Separation of Mixtures',
    question:
      'A student is given a solid mixture of Ammonium Chloride ($\\text{NH}_4\\text{Cl}$) and Sodium Chloride ($\\text{NaCl}$). Which separation method directly separates pure $\\text{NH}_4\\text{Cl}$ from $\\text{NaCl}$, and why?',
    options: [
      'Sublimation — because Ammonium Chloride sublimes directly from solid to vapour upon heating while Sodium Chloride does not',
      'Simple distillation — because Sodium Chloride has a lower boiling point than water',
      'Paper chromatography — because both salts have different Rf values in ethanol',
      'Decantation — because Ammonium Chloride is denser than mercury',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: According to TIE Form 1 Chemistry Chapter 5, $\\text{NH}_4\\text{Cl}$, Iodine, and Camphor sublime upon heating, allowing direct separation from non-subliming $\\text{NaCl}$.',
    hint: 'Recall which common laboratory salt changes directly from solid to gas on heating.',
  },
  {
    cls: 'Form 2',
    subject: 'Chemistry',
    chapter: 'Chapter 5 & 7: Atomic Structure, Isotopes & Chemical Bonding',
    question:
      'Naturally occurring Chlorine consists of two isotopes: $^{35}_{17}\\text{Cl}$ ($75\\%$ abundance) and $^{37}_{17}\\text{Cl}$ ($25\\%$ abundance). Calculate its Relative Atomic Mass ($A_r$) and state the formula of the compound formed between element $M$ (atomic number $13$) and Chlorine:',
    options: [
      '$A_r = 35.5$ ; Formula is $M\\text{Cl}_3$',
      '$A_r = 36.0$ ; Formula is $M\\text{Cl}_2$',
      '$A_r = 35.5$ ; Formula is $M_3\\text{Cl}$',
      '$A_r = 36.5$ ; Formula is $M\\text{Cl}$',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: $A_r = \\frac{(35 \\times 75) + (37 \\times 25)}{100} = 26.25 + 9.25 = 35.5$. Step 2: Element $M$ ($Z=13$, Aluminium) has electronic configuration $2:8:3$ (valency $3$), while Cl has valency $1$, giving $M\\text{Cl}_3$.',
    hint: 'Compute weighted average $(0.75 \\times 35) + (0.25 \\times 37)$, and find valency of $Z = 13$ ($2:8:3$).',
    pinDigitClue: {
      equationPrompt: 'Valency of element $M$ with atomic number $Z = 13$ ($2:8:3$)',
      digitValue: 3,
      stepHint: 'An atom with $3$ valence electrons loses $3$ electrons, so its valency is $3$.',
    },
  },
  {
    cls: 'Form 3',
    subject: 'Chemistry',
    chapter: 'Chapter 5: Volumetric Analysis (Titration & Water of Crystallization)',
    question:
      '$25.0\\text{ cm}^3$ of a solution containing $14.3\\text{ g/dm}^3$ of hydrated sodium carbonate ($\\text{Na}_2\\text{CO}_3 \\cdot x\\text{H}_2\\text{O}$) required $25.0\\text{ cm}^3$ of $0.10\\text{ M HCl}$ for complete neutralization ($\\text{Na}_2\\text{CO}_3 + 2\\text{HCl} \\rightarrow 2\\text{NaCl} + \\text{H}_2\\text{O} + \\text{CO}_2$). Determine the value of $x$ [Na=23, C=12, O=16, H=1]:',
    options: ['$x = 10$', '$x = 5$', '$x = 7$', '$x = 1$'],
    correctIndex: 0,
    explanation:
      'Step 1: $\\frac{M_b V_b}{M_a V_a} = \\frac{1}{2} \\Rightarrow M_b = \\frac{0.10 \\times 25.0}{2 \\times 25.0} = 0.05\\text{ M}$. Step 2: Molar mass $M_r = \\frac{\\text{Concentration (g/dm}^3\\text{)}}{\\text{Molarity}} = \\frac{14.3}{0.05} = 286\\text{ g/mol}$. Step 3: $106 + 18x = 286 \\Rightarrow 18x = 180 \\Rightarrow x = 10$.',
    hint: 'Find molarity $M_b = 0.05\\text{ M}$, then divide $14.3\\text{ g/dm}^3$ by $0.05\\text{ M}$ to get molar mass $286\\text{ g/mol}$.',
    pinDigitClue: {
      equationPrompt: 'Number of Faradays needed to deposit $1\\text{ mole}$ of $\\text{Al}$ from $\\text{Al}^{3+}$',
      digitValue: 3,
      stepHint: '$\\text{Al}^{3+} + 3e^- \\rightarrow \\text{Al}$ requires $3$ Faradays.',
    },
  },
  {
    cls: 'Form 4',
    subject: 'Chemistry',
    chapter: 'Chapter 2: Organic Chemistry (Isomerism & Reactions)',
    question:
      'An organic compound $A$ ($\\text{C}_2\\text{H}_6\\text{O}$) reacts with metallic sodium to liberate hydrogen gas, and when warmed with acidified potassium dichromate(VI) ($\\text{K}_2\\text{Cr}_2\\text{O}_7$), it turns the orange solution green to form compound $B$ ($\\text{C}_2\\text{H}_4\\text{O}_2$). Identify $A$ and $B$:',
    options: [
      '$A$ is Ethanol ($\\text{CH}_3\\text{CH}_2\\text{OH}$) and $B$ is Ethanoic acid ($\\text{CH}_3\\text{COOH}$)',
      '$A$ is Methoxymethane ($\\text{CH}_3\\text{OCH}_3$) and $B$ is Ethene ($\\text{C}_2\\text{H}_4$)',
      '$A$ is Ethanal ($\\text{CH}_3\\text{CHO}$) and $B$ is Ethanol',
      '$A$ is Propanoic acid and $B$ is Ethyl ethanoate',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Reaction with Na liberating $\\text{H}_2$ proves $A$ is an alkanol (Ethanol). Step 2: Oxidation of primary alkanol (ethanol) with acidified $\\text{K}_2\\text{Cr}_2\\text{O}_7$ reduces orange $\\text{Cr}_2\\text{O}_7^{2-}$ to green $\\text{Cr}^{3+}$ and yields Ethanoic acid ($B$).',
    hint: 'Primary alcohols react with Na to release $\\text{H}_2$ and oxidize to carboxylic acids.',
  },

  // ============================================================================
  // BIOLOGY — FORM 1, FORM 2, FORM 3, FORM 4 (TIE Biology Student's Books)
  // ============================================================================
  {
    cls: 'Form 1',
    subject: 'Biology',
    chapter: 'Chapter 3: Cell Structure and Organization',
    question:
      'A student prepares a temporary wet mount of an onion epidermal peel and a human cheek smear under a light microscope. Which combination of structures is present in the onion epidermal cell but completely absent in the human cheek cell?',
    options: [
      'Cellulose cell wall and a large permanent central vacuole bounded by a tonoplast',
      'Plasma membrane, cytoplasm, and nucleus',
      'Mitochondria and ribosomes',
      'Centrioles and small temporary vesicles',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Onion epidermal cells are plant cells possessing a rigid cellulose cell wall and a large central sap vacuole (note: onion bulb epidermis lacks chloroplasts because it is underground). Animal cheek cells lack both cell walls and large central vacuoles.',
    hint: 'Think of the structural features that distinguish a subterranean plant epidermal cell from an animal cell.',
  },
  {
    cls: 'Form 2',
    subject: 'Biology',
    chapter: 'Chapter 5: Transport of Materials in Living Things',
    question:
      'A fresh potato cylinder of initial length $50\\text{ mm}$ is immersed in a concentrated sucrose solution ($1.0\\text{ M}$) for $45$ minutes. What happens to the length and texture of the potato cylinder, and by what process?',
    options: [
      'It decreases in length (e.g. to $46\\text{ mm}$) and becomes flaccid because water molecules move out of the cells by osmosis into the hypertonic sucrose solution',
      'It increases in length to $55\\text{ mm}$ and becomes turgid due to endosmosis',
      'It bursts due to haemolysis as sucrose molecules diffuse into the cell wall',
      'Its length remains unchanged at $50\\text{ mm}$ because plant cell walls are impermeable to water',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Concentrated $1.0\\text{ M}$ sucrose is hypertonic (lower water potential) relative to potato cell sap. Step 2: Water leaves the vacuoles by osmosis (exosmosis), causing plasmolysis and making the tissue shrink and become flaccid.',
    hint: 'Compare the water potential inside the potato cells with the concentrated $1.0\\text{ M}$ sucrose solution.',
  },
  {
    cls: 'Form 3',
    subject: 'Biology',
    chapter: 'Chapter 5: Regulation (Homeostasis & Blood Glucose Control)',
    question:
      'After a person consumes a carbohydrate-rich meal, blood glucose concentration rises above the normal $90\\text{ mg/100 cm}^3$ set point. How do the Islets of Langerhans in the pancreas and the liver restore normal blood glucose levels?',
    options: [
      'Beta ($\\beta$) cells of the Islets of Langerhans secrete Insulin, which stimulates liver and muscle cells to convert excess glucose into glycogen and increase cellular respiration',
      'Alpha ($\\alpha$) cells secrete Glucagon to hydrolyse glycogen into glucose',
      'The adrenal medulla secretes Adrenaline to inhibit glucose uptake by cells',
      'The nephron glomerulus stops filtering glucose so it accumulates in the renal artery',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Beta cells detect high blood glucose and secrete Insulin into the bloodstream. Step 2: Insulin causes hepatocytes (liver cells) to convert glucose to insoluble glycogen (glycogenesis) and increases cell membrane permeability to glucose.',
    hint: 'Recall the hormone secreted by Beta ($\\beta$) cells of the pancreas when blood sugar is high.',
  },
  {
    cls: 'Form 4',
    subject: 'Biology',
    chapter: 'Chapter 2: Genetics (Sex-Linked Inheritance & ABO Blood Groups)',
    question:
      'A woman with normal vision whose father was red-green colour-blind ($X^C X^c$) marries a man with normal vision ($X^C Y$). What is the probability that their **son** will be colour-blind?',
    options: [
      '$50\\%$ (or $\\frac{1}{2}$ of their sons)',
      '$100\\%$ of their sons',
      '$0\\%$ of their sons',
      '$75\\%$ of their sons',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Crossing carrier mother $X^C X^c \\times$ normal father $X^C Y$ produces male offspring genotypes: $\\frac{1}{2}\\,X^C Y$ (normal vision son) and $\\frac{1}{2}\\,X^c Y$ (colour-blind son). Step 2: Therefore $50\\%$ of their sons will be colour-blind.',
    hint: 'A son inherits his Y chromosome from his father and either $X^C$ or $X^c$ from his carrier mother.',
  },

  // ============================================================================
  // GEOGRAPHY, HISTORY, CIVICS, KISWAHILI, ENGLISH (LEVEL-SPECIFIC TEXTBOOK)
  // ============================================================================
  {
    cls: 'Form 3',
    subject: 'Geography',
    chapter: 'Chapter 6: Map Reading and Map Interpretation',
    question:
      'On a topographical map of scale $1:50,000$, two grid squares each measure $2\\text{ cm} \\times 2\\text{ cm}$. If a coffee estate covers $5$ full grid squares and $6$ half grid squares, calculate the actual ground area of the coffee estate in $\\text{km}^2$:',
    options: ['$8.0\\text{ km}^2$', '$16.0\\text{ km}^2$', '$11.0\\text{ km}^2$', '$4.0\\text{ km}^2$'],
    correctIndex: 0,
    explanation:
      'Step 1: At $1:50,000$, a $2\\text{ cm} \\times 2\\text{ cm}$ grid square represents $1\\text{ km} \\times 1\\text{ km} = 1.0\\text{ km}^2$. Step 2: Total squares $= 5 + \\frac{6}{2} = 8$ squares. Step 3: Area $= 8 \\times 1.0\\text{ km}^2 = 8.0\\text{ km}^2$.',
    hint: 'Use the Grid Square method: $\\text{Total squares} = \\text{Full} + \\frac{\\text{Half}}{2}$, and each $2\\text{ cm}$ square equals $1\\text{ km}^2$.',
    pinDigitClue: {
      equationPrompt: 'Area in $\\text{km}^2$ of $8$ grid squares on a $1:50,000$ map ($1\\text{ sq} = 1\\text{ km}^2$)',
      digitValue: 8,
      stepHint: '$8 \\times 1\\text{ km}^2 = 8$.',
    },
  },
  {
    cls: 'Form 3',
    subject: 'History',
    chapter: 'Chapter 3: Colonial Economy in Africa',
    question:
      'Why did the British colonial state in East Africa preserve peasant agriculture in Uganda and parts of Tanganyika (such as Bukoba and Kilimanjaro) while promoting white settler plantation agriculture in the Kenya Highlands?',
    options: [
      'Peasant production in Tanganyika (a UN Mandate/Trust Territory) and Uganda was cheaper to administer without large-scale land alienation expenses, whereas Kenya had a large British settler lobby supported by Crown Land Ordinances and the Kipande labour system',
      'Uganda and Tanganyika had no fertile soil or rainfall suitable for cash crops',
      'African peasants in Kenya refused to grow maize or keep cattle before 1950',
      'The Berlin Conference prohibited cash crops such as coffee and cotton in Tanganyika',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: According to TIE Form 3 History Chapter 3, Tanganyika’s status as a League of Nations Mandate after 1919 restricted massive settler land alienation compared to Kenya, making peasant cash-crop production (coffee, cotton) more profitable and politically stable for the colonial state.',
    hint: 'Compare Tanganyika’s League of Nations Mandate status and peasant cost-efficiency with Kenya’s Crown Land settler policies.',
  },
  {
    cls: 'Form 4',
    subject: 'History',
    chapter: 'Chapter 2: Nationalism and Decolonisation in Africa',
    question:
      'Why did the liberation of Lusophone African colonies (Mozambique under FRELIMO, Angola under MPLA, and Guinea-Bissau under PAIGC) require prolonged armed struggle rather than peaceful constitutional negotiations?',
    options: [
      'Salazar’s fascist dictatorship in Portugal regarded the colonies as "Overseas Provinces" of Portugal, banned all African political parties, and economically depended on colonial exploitation because Portugal itself was industrially weak',
      'African nationalists in Mozambique and Angola rejected independence offers in the 1950s',
      'The OAULiberation Committee headquartered in Dar es Salaam opposed FRELIMO and MPLA',
      'Portugal granted universal adult suffrage in 1945 but no candidates stood for election',
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Unlike Britain or France, Portugal under Estado Novo dictatorship refused constitutional decolonisation, violently suppressed peaceful protests (e.g. Mueda Massacre 1960 in Mozambique), forcing FRELIMO (1962), MPLA (1956), and PAIGC to wage guerrilla warfare until 1974/1975.',
    hint: 'Consider Portugal’s dictatorship and its refusal to allow peaceful political parties.',
  },
];

function doesSubjectMatchStrict(seedSubject: string, targetSubject: string): boolean {
  const s = seedSubject.trim().toLowerCase();
  const t = targetSubject.trim().toLowerCase();
  if (s === t) return true;
  // Never conflate Basic Mathematics, Additional Mathematics, and Advanced Mathematics
  if (t.includes('additional math') || s.includes('additional math')) {
    return t.includes('additional math') && s.includes('additional math');
  }
  if (t.includes('advanced math') || s.includes('advanced math')) {
    return t.includes('advanced math') && s.includes('advanced math');
  }
  if (t.includes('applied math') || s.includes('applied math')) {
    return t.includes('applied math') && s.includes('applied math');
  }
  return s.includes(t) || t.includes(s);
}

/**
 * Generates 20 distinct, challenging, level-accurate questions from the Stored Textbook Question Bank
 * and Official TIE Textbook chapters for the exact Class, Subject, and Topic—never repeating questions
 * that the student has already answered until a full bank cycle is completed.
 */
export function buildLevelAccurateTextbookQuestions(
  cls: string,
  subject: string,
  topic: string,
  difficulty: GameDifficulty,
  existingQuestions: GameQuestion[],
  subTopic: string = 'ALL',
  roundOffset: number = 0
): GameQuestion[] {
  const normCls = (cls || 'Form 1').trim();
  const normSub = (subject || 'Basic Mathematics').trim();
  const baseXp = difficulty === 'Hard' ? 100 : difficulty === 'Medium' ? 80 : 65;

  const rotateOpts = (
    opts: string[],
    correctIdx: number,
    shiftSeed: number
  ): { options: string[]; correctIndex: number } => {
    const len = opts.length;
    if (len < 2) return { options: opts, correctIndex: 0 };
    const safeIdx = Math.max(0, Math.min(len - 1, correctIdx));
    const targetVal = opts[safeIdx];
    const shift = ((shiftSeed % len) + len) % len;
    const rotated = new Array<string>(len);
    for (let i = 0; i < len; i++) {
      rotated[(i + shift) % len] = opts[i];
    }
    return {
      options: rotated,
      correctIndex: Math.max(0, rotated.indexOf(targetVal)),
    };
  };

  // 0. Pull Stored Textbook Questions extracted from uploaded books first!
  let storedTextbookQuestions = getStoredBankQuestionsForClassSubject(normCls, normSub, topic);
  if (subTopic && subTopic !== 'ALL') {
    const subFiltered = storedTextbookQuestions.filter((sq) =>
      doesQuestionTopicMatchSelectedTopic(sq.subTopic || '', sq.topic || '', subTopic)
    );
    if (subFiltered.length >= 4) {
      storedTextbookQuestions = subFiltered;
    } else if (subFiltered.length > 0) {
      const rest = storedTextbookQuestions.filter((sq) => !subFiltered.includes(sq));
      storedTextbookQuestions = [...subFiltered, ...rest];
    }
  }

  let studentSeenSigs = getSeenSignaturesForClassSubject(normCls, normSub);
  const variantOffset = getVariantOffsetForClassSubject(normCls, normSub) + Math.max(0, roundOffset);

  // 1. Filter curated TIE Textbook seeds matching exact Class & Subject AND selected Topic (never mix other Form levels or other chapters!)
  const exactClassMatches = TIE_LEVEL_TEXTBOOK_BANK.filter(
    (s) =>
      s.cls.toLowerCase() === normCls.toLowerCase() &&
      doesSubjectMatchStrict(s.subject, normSub) &&
      (!topic || topic === 'ALL' || doesQuestionTopicMatchSelectedTopic(s.chapter, '', topic))
  );

  const unseenPool: GameQuestion[] = [];
  const seenFallbackPool: GameQuestion[] = [];
  const addedSignatures = new Set<string>();

  const pushCandidate = (q: GameQuestion) => {
    const sig = computeQuestionSignature(q.question);
    if (!sig || addedSignatures.has(sig)) return;
    addedSignatures.add(sig);
    if (studentSeenSigs.has(sig)) {
      seenFallbackPool.push(q);
    } else {
      unseenPool.push(q);
    }
  };

  // Priority A: Extracted questions stored from Uploaded Textbooks
  storedTextbookQuestions.forEach((sq, idx) => {
    const rotated = rotateOpts([...sq.options], sq.correctIndex, idx + 1 + roundOffset);
    pushCandidate({
      id: sq.id || `stored-tb-${normCls}-${normSub}-${idx}`,
      cls: normCls,
      subject: normSub,
      topic: sq.topic || (topic !== 'ALL' ? topic : normSub),
      subTopic: sq.subTopic,
      difficulty,
      question: sq.question,
      options: rotated.options,
      correctIndex: rotated.correctIndex,
      explanation: sq.explanation,
      hint:
        sq.hint ||
        `Apply the ${normCls} ${normSub} textbook formula and step-by-step method for ${sq.topic || normSub}.`,
      xpReward: baseXp + 15,
      sourceLabel: sq.sourceRef || `📘 ${sq.textbookTitle}`,
      isBossOrSpecial: idx >= 12,
    });
  });

  const hasUploadedBank = storedTextbookQuestions.length > 0;

  if (!hasUploadedBank) {
    // Priority B: Curated level-specific TIE textbook questions (only when no stored bank questions exist for this topic)
    exactClassMatches.forEach((seed, idx) => {
      const bookCitation = `📘 Official TIE ${normCls} ${normSub} Student's Book — ${seed.chapter}`;
      const rotated = rotateOpts([...seed.options], seed.correctIndex, idx + 1 + roundOffset);
      pushCandidate({
        id: `tie-tb-${normCls}-${normSub}-${idx}`,
        cls: normCls,
        subject: normSub,
        topic: topic !== 'ALL' ? topic : seed.chapter,
        difficulty,
        question: `[${normCls} • ${seed.chapter}] ${seed.question}`,
        options: rotated.options,
        correctIndex: rotated.correctIndex,
        explanation: seed.explanation,
        hint: seed.hint,
        xpReward: baseXp + (idx >= 4 ? 15 : 0),
        sourceLabel: bookCitation,
        isBossOrSpecial: idx >= 4,
      });
    });

    // Priority C: Existing curriculum questions if unique and matching exact topic
    existingQuestions.forEach((eq) => {
      if (topic && topic !== 'ALL' && !doesQuestionTopicMatchSelectedTopic(eq.topic || '', eq.subTopic || '', topic)) {
        return;
      }
      pushCandidate({
        ...eq,
        sourceLabel: eq.sourceLabel.includes('Student')
          ? eq.sourceLabel
          : `📘 Official TIE ${normCls} ${normSub} Student's Textbook (${eq.topic})`,
      });
    });

    // Priority D: Multi-chapter parameterized textbook problems matching the requested topic
    let variantIdx = 1;
    while (unseenPool.length < 20 && variantIdx <= 40) {
      const v = variantOffset + variantIdx++;
      const rawQ = buildParameterizedLevelProblem(normCls, normSub, topic, difficulty, v, baseXp);
      const rotated = rotateOpts(rawQ.options, rawQ.correctIndex, v + 2);
      pushCandidate({
        ...rawQ,
        options: rotated.options,
        correctIndex: rotated.correctIndex,
      });
    }
  }

  // If the student has seen most of the bank, rotate the cycle using the authentic uploaded textbook questions
  if (unseenPool.length < 20 && seenFallbackPool.length > 0) {
    if (unseenPool.length < 6) {
      resetSeenQuestionsForClassSubject(normCls, normSub, true);
      studentSeenSigs = new Set<string>();
    }
    for (const sItem of seenFallbackPool) {
      if (unseenPool.length >= 20) break;
      unseenPool.push(sItem);
    }
  }

  if (roundOffset > 0 && unseenPool.length > 8) {
    const shift = (roundOffset * 8) % unseenPool.length;
    const shifted = [...unseenPool.slice(shift), ...unseenPool.slice(0, shift)];
    return shifted.slice(0, Math.max(20, shifted.length));
  }

  return unseenPool.slice(0, Math.max(20, unseenPool.length));
}

function buildParameterizedLevelProblem(
  cls: string,
  subject: string,
  topic: string,
  difficulty: GameDifficulty,
  v: number,
  baseXp: number
): GameQuestion {
  const sLower = subject.toLowerCase();
  const cLower = cls.toLowerCase();
  const tLower = (topic || 'ALL').toLowerCase();
  const bookLabel = `📘 Official TIE ${cls} ${subject} Student's Book`;
  let archetype = v % 5;

  if (tLower !== 'all') {
    if (sLower.includes('additional math') && cLower.includes('form 1')) {
      if (tLower.includes('symmetry')) archetype = 1;
      else if (tLower.includes('algebra')) archetype = 2;
      else if (tLower.includes('coordinate')) archetype = 3;
      else if (tLower.includes('number')) archetype = v % 2 === 0 ? 0 : 4;
    } else if (sLower.includes('math') || sLower.includes('hisabati')) {
      if (tLower.includes('algebra') || tLower.includes('equation')) archetype = 0;
      else if (tLower.includes('ratio') || tLower.includes('profit') || tLower.includes('interest')) archetype = 1;
      else if (tLower.includes('coordinate') || tLower.includes('gradient')) archetype = 2;
      else if (tLower.includes('perimeter') || tLower.includes('area') || tLower.includes('geometry')) archetype = 3;
      else if (tLower.includes('number') || tLower.includes('fraction') || tLower.includes('decimal') || tLower.includes('approx')) archetype = 4;
    }
  }

  // ============================================================================
  // ADDITIONAL MATHEMATICS PARAMETERIZED MULTI-CHAPTER TEXTBOOK PROBLEMS
  // ============================================================================
  if (sLower.includes('additional math')) {
    if (cLower.includes('form 1')) {
      if (archetype === 0) {
        // Chapter 1: Base Numerals Conversion
        const d2 = (v % 4) + 1;
        const d1 = ((v + 2) % 4) + 1;
        const d0 = (v + 1) % 5;
        const base10 = d2 * 25 + d1 * 5 + d0;
        return {
          id: `dyn-f1-addmath-base-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 1: Numbers (Base Numerals)',
          difficulty,
          question: `[${cls} Additional Math • Chapter 1: Numbers] Convert the base-five numeral $${d2}${d1}${d0}_{\\text{five}}$ into a base-ten (denary) integer:`,
          options: [
            `$${base10}_{\\text{ten}}$`,
            `$${base10 + 5}_{\\text{ten}}$`,
            `$${Math.max(10, base10 - 10)}_{\\text{ten}}$`,
            `$${(d2 + d1 + d0) * 5}_{\\text{ten}}$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Expand in powers of $5$: $${d2}${d1}${d0}_{\\text{five}} = ${d2}(5^2) + ${d1}(5^1) + ${d0}(5^0)$. Step 2: $= ${d2 * 25} + ${d1 * 5} + ${d0} = ${base10}_{\\text{ten}}$.`,
          hint: `Multiply the digits by $5^2 = 25$, $5^1 = 5$, and $5^0 = 1$ respectively and sum.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 1: Numbers`,
        };
      }
      if (archetype === 1) {
        // Chapter 2: Regular Polygon Symmetry
        const nSides = (v % 7) + 5; // 5 to 11 sides
        const rotAngle = Number((360 / nSides).toFixed(1));
        return {
          id: `dyn-f1-addmath-sym-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 2: Symmetry',
          difficulty,
          question: `[${cls} Additional Math • Chapter 2: Symmetry] A regular polygon has $${nSides}$ equal sides. Determine its number of lines of symmetry $L$, order of rotational symmetry $R$, and smallest angle of rotation $\\theta$:`,
          options: [
            `$L = ${nSides},\\; R = ${nSides},\\; \\theta = ${rotAngle}^\\circ$`,
            `$L = ${nSides * 2},\\; R = ${nSides},\\; \\theta = ${rotAngle}^\\circ$`,
            `$L = ${nSides},\\; R = ${Math.max(2, nSides - 2)},\\; \\theta = ${(180 / nSides).toFixed(1)}^\\circ$`,
            `$L = ${nSides - 1},\\; R = ${nSides - 1},\\; \\theta = ${rotAngle}^\\circ$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Every regular $n$-sided polygon has $L = n = ${nSides}$ lines of symmetry and rotational symmetry of order $R = ${nSides}$. Step 2: Smallest angle of rotational symmetry $\\theta = \\frac{360^\\circ}{${nSides}} = ${rotAngle}^\\circ$.`,
          hint: `For a regular $n$-gon, $L = R = n$ and $\\theta = 360^\\circ / n$.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 2: Symmetry`,
        };
      }
      if (archetype === 2) {
        // Chapter 3: Algebra — Transposition of Formulae
        const aVal = (v % 5) + 2;
        const bVal = (v % 4) + 3;
        const xSol = (v % 6) + 2;
        const yVal = aVal * xSol + bVal;
        return {
          id: `dyn-f1-addmath-alg-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 3: Algebra (Transposition & Equations)',
          difficulty,
          question: `[${cls} Additional Math • Chapter 3: Algebra] Given the formula $T = 2\\pi\\sqrt{\\frac{L + ${bVal}}{g}}$, if $\\left(\\frac{T}{2\\pi}\\right)^2 g = ${yVal}$, find the value of $L$ when divided by $${aVal}$:`,
          options: [
            `$${xSol}$ (since $L = ${aVal * xSol}$)`,
            `$${xSol + 2}$`,
            `$${Math.max(1, xSol - 1)}$`,
            `$${yVal}$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Square both sides: $\\left(\\frac{T}{2\\pi}\\right)^2 g = L + ${bVal} = ${yVal}$. Step 2: $L = ${yVal} - ${bVal} = ${aVal * xSol}$. Step 3: Dividing $L$ by $${aVal}$ gives $\\frac{${aVal * xSol}}{${aVal}} = ${xSol}$.`,
          hint: `Use $L + ${bVal} = ${yVal}$ to find $L$, then divide by $${aVal}$.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 3: Algebra`,
        };
      }
      if (archetype === 3) {
        // Chapter 5: Coordinate Geometry — Internal Division of a Line Segment
        const m = 1;
        const n = 2;
        const x1 = v % 5;
        const y1 = 2;
        const x2 = x1 + 6;
        const y2 = 8;
        const px = (m * x2 + n * x1) / (m + n);
        const py = (m * y2 + n * y1) / (m + n);
        return {
          id: `dyn-f1-addmath-coord-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 5: Coordinate Geometry',
          difficulty,
          question: `[${cls} Additional Math • Chapter 5: Coordinate Geometry] Find the coordinates of the point $P(x, y)$ that divides the line segment joining $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$ internally in the ratio $1 : 2$:`,
          options: [
            `$(${px}, ${py})$`,
            `$(${px + 2}, ${py + 2})$`,
            `$(${(x1 + x2) / 2}, ${(y1 + y2) / 2})$`,
            `$(${px - 1}, ${py + 1})$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Using $P = \\left(\\frac{m x_2 + n x_1}{m+n}, \\frac{m y_2 + n y_1}{m+n}\\right)$ with $m=1, n=2$: Step 2: $x = \\frac{1(${x2}) + 2(${x1})}{3} = ${px}$, and $y = \\frac{1(${y2}) + 2(${y1})}{3} = ${py}$.`,
          hint: `Apply the internal division formula with $m = 1$ and $n = 2$.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 5: Coordinate Geometry`,
        };
      }
      // Archetype 4: Chapter 1 Modular Arithmetic
      const modN = 7;
      const aNum = 10 + v * 3;
      const bNum = 8 + v * 2;
      const rem = (aNum + bNum) % modN;
      return {
        id: `dyn-f1-addmath-mod-${v}`,
        cls,
        subject,
        topic: topic !== 'ALL' ? topic : 'Chapter 1: Numbers (Modular Operations)',
        difficulty,
        question: `[${cls} Additional Math • Chapter 1: Modular Arithmetic] Evaluate the least non-negative residue of $(${aNum} + ${bNum}) \\pmod{${modN}}$:`,
        options: [
          `$${rem} \\pmod{${modN}}$`,
          `$${(rem + 2) % modN} \\pmod{${modN}}$`,
          `$${(rem + 4) % modN} \\pmod{${modN}}$`,
          `$${(rem + 1) % modN} \\pmod{${modN}}$`,
        ],
        correctIndex: 0,
        explanation: `Step 1: Sum $= ${aNum} + ${bNum} = ${aNum + bNum}$. Step 2: Divide $${aNum + bNum}$ by $${modN}$: $${aNum + bNum} = ${Math.floor((aNum + bNum) / modN)} \\times ${modN} + ${rem}$, so the remainder is $${rem}$.`,
        hint: `Add $${aNum} + ${bNum}$ and find the remainder upon division by $${modN}$.`,
        xpReward: baseXp,
        sourceLabel: `${bookLabel} — Chapter 1: Numbers`,
      };
    }

    // Form 2–4 Additional Mathematics Parameterized Problems
    if (cLower.includes('form 2')) {
      const kConst = (v % 6) + 2;
      const xVal = (v % 4) + 2;
      const yVal = kConst * xVal * xVal;
      return {
        id: `dyn-f2-addmath-${v}`,
        cls,
        subject,
        topic: topic !== 'ALL' ? topic : 'Chapter 2: Variations & Locus',
        difficulty,
        question: `[${cls} Additional Math • Variations & Locus] Given that $y$ varies directly as $x^2$ with constant of variation $k = ${kConst}$, calculate $y$ when $x = ${xVal}$ and state the locus radius $r$ of $x^2 + y^2 = ${xVal * xVal}$:`,
        options: [
          `$y = ${yVal}, \\quad r = ${xVal}$`,
          `$y = ${kConst * xVal}, \\quad r = ${xVal * xVal}$`,
          `$y = ${yVal + kConst}, \\quad r = ${xVal}$`,
          `$y = ${yVal / 2}, \\quad r = ${xVal * 2}$`,
        ],
        correctIndex: 0,
        explanation: `Step 1: $y = kx^2 = ${kConst}(${xVal}^2) = ${yVal}$. Step 2: The circle $x^2 + y^2 = ${xVal * xVal}$ has radius $r = \\sqrt{${xVal * xVal}} = ${xVal}$.`,
        hint: `Compute $y = ${kConst} \\times ${xVal}^2$ and $r = \\sqrt{${xVal * xVal}}$.`,
        xpReward: baseXp + 10,
        sourceLabel: `${bookLabel} — Chapter 2 & 4: Variations & Locus`,
      };
    }

    // Form 3 & 4 Additional Mathematics (Polynomials, Differentiation, Integration)
    const cCoeff = (v % 5) + 2;
    const xPt = (v % 4) + 1;
    const derivVal = 3 * xPt * xPt + 2 * cCoeff * xPt;
    return {
      id: `dyn-f34-addmath-${v}`,
      cls,
      subject,
      topic: topic !== 'ALL' ? topic : 'Differentiation, Integration & Polynomials',
      difficulty,
      question: `[${cls} Additional Math • Calculus] Find the gradient of the tangent $\\frac{dy}{dx}$ to the curve $y = x^3 + ${cCoeff}x^2 - 4$ at the point where $x = ${xPt}$:`,
      options: [
        `$\\frac{dy}{dx} = ${derivVal}$`,
        `$\\frac{dy}{dx} = ${derivVal + 6}$`,
        `$\\frac{dy}{dx} = ${xPt * xPt * xPt + cCoeff * xPt * xPt - 4}$`,
        `$\\frac{dy}{dx} = ${Math.max(1, derivVal - 4)}$`,
      ],
      correctIndex: 0,
      explanation: `Step 1: Differentiate $y = x^3 + ${cCoeff}x^2 - 4$: $\\frac{dy}{dx} = 3x^2 + ${2 * cCoeff}x$. Step 2: At $x = ${xPt}$, gradient $= 3(${xPt}^2) + ${2 * cCoeff}(${xPt}) = ${derivVal}$.`,
      hint: `Differentiate using $\\frac{d}{dx}(x^n) = nx^{n-1}$ and substitute $x = ${xPt}$.`,
      xpReward: baseXp + 15,
      sourceLabel: `${bookLabel} — Calculus & Algebra`,
    };
  }

  // ============================================================================
  // BASIC MATHEMATICS PARAMETERIZED LEVEL-SPECIFIC TEXTBOOK PROBLEMS
  // ============================================================================
  if (sLower.includes('math') || sLower.includes('hisabati')) {
    if (cLower.includes('form 1') || cLower.includes('standard')) {
      if (archetype === 0) {
        // Chapter 8: Simultaneous Linear Equations
        const a = (v % 5) + 2;
        const xVal = (v % 6) + 2;
        const yVal = (v % 4) + 1;
        const c1 = a * xVal + yVal;
        const c2 = xVal - yVal;
        const sumXY = xVal + yVal;
        return {
          id: `dyn-f1-math-alg-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 8: Algebra (Simultaneous Linear Equations)',
          difficulty,
          question: `[${cls} Textbook • Chapter 8: Algebra] Solve the simultaneous linear equations $${a}x + y = ${c1}$ and $x - y = ${c2}$ to find the value of $(x + y)$:`,
          options: [
            `$${sumXY}$ (where $x = ${xVal},\\; y = ${yVal}$)`,
            `$${sumXY + 2}$ (where $x = ${xVal + 1},\\; y = ${yVal + 1}$)`,
            `$${Math.max(1, sumXY - 2)}$`,
            `$${xVal * yVal}$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Add the two equations to eliminate $y$: $(${a} + 1)x = ${c1 + c2} \\Rightarrow ${a + 1}x = ${c1 + c2} \\Rightarrow x = ${xVal}$. Step 2: $y = x - ${c2} = ${yVal}$. Therefore $x + y = ${sumXY}$.`,
          hint: `Add both equations together to eliminate $+y$ and $-y$, then divide by $${a + 1}$.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 8: Algebra`,
        };
      }
      if (archetype === 1) {
        // Chapter 10: Simple Interest, Profit & Loss
        const principal = ((v % 8) + 2) * 10000;
        const rate = (v % 5) + 6;
        const years = (v % 3) + 2;
        const interest = (principal * rate * years) / 100;
        return {
          id: `dyn-f1-math-si-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 10: Ratios, Profit, Loss and Simple Interest',
          difficulty,
          question: `[${cls} Textbook • Chapter 10] Calculate the Simple Interest ($I$) earned when a principal of $\\text{TZS } ${principal.toLocaleString()}$ is invested at $${rate}\\%$ per annum for $${years}\\text{ years}$:`,
          options: [
            `$\\text{TZS } ${interest.toLocaleString()}$`,
            `$\\text{TZS } ${(interest + principal / 10).toLocaleString()}$`,
            `$\\text{TZS } ${(interest / 2).toLocaleString()}$`,
            `$\\text{TZS } ${(principal + interest).toLocaleString()}$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Using $I = \\frac{PRT}{100} = \\frac{${principal} \\times ${rate} \\times ${years}}{100} = \\text{TZS } ${interest.toLocaleString()}$.`,
          hint: `Use the Simple Interest formula $I = \\frac{P \\times R \\times T}{100}$.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 10: Ratios, Profit and Loss`,
        };
      }
      if (archetype === 2) {
        // Chapter 11: Coordinate Geometry (Gradient & Line Equation)
        const mSlope = (v % 5) + 2;
        const x1 = (v % 4) + 1;
        const cInt = (v % 6) - 2;
        const y1 = mSlope * x1 + cInt;
        const x2 = x1 + 3;
        const y2 = mSlope * x2 + cInt;
        return {
          id: `dyn-f1-math-coord-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 11: Coordinate Geometry',
          difficulty,
          question: `[${cls} Textbook • Chapter 11: Coordinate Geometry] Find the gradient $m$ and $y$-intercept $c$ of the straight line passing through $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$:`,
          options: [
            `$m = ${mSlope}, \\quad c = ${cInt}$`,
            `$m = ${mSlope + 1}, \\quad c = ${cInt - 2}$`,
            `$m = \\frac{1}{${mSlope}}, \\quad c = ${y1}$`,
            `$m = -${mSlope}, \\quad c = ${cInt + 4}$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Gradient $m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - (${y1})}{${x2} - ${x1}} = \\frac{${y2 - y1}}{3} = ${mSlope}$. Step 2: From $y = mx + c$, $${y1} = ${mSlope}(${x1}) + c \\Rightarrow c = ${cInt}$.`,
          hint: `Compute $m = \\frac{y_2 - y_1}{x_2 - x_1}$ first, then substitute point $A(${x1}, ${y1})$ into $y = mx + c$.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 11: Coordinate Geometry`,
        };
      }
      if (archetype === 3) {
        // Chapter 12: Perimeters and Areas
        const length = (v % 8) + 8;
        const width = (v % 5) + 4;
        const perim = 2 * (length + width);
        const area = length * width;
        return {
          id: `dyn-f1-math-area-${v}`,
          cls,
          subject,
          topic: topic !== 'ALL' ? topic : 'Chapter 12: Perimeters and Areas',
          difficulty,
          question: `[${cls} Textbook • Chapter 12: Perimeters & Areas] A rectangular school garden has a length of $${length}\\text{ m}$ and a width of $${width}\\text{ m}$. Calculate its perimeter $P$ and area $A$:`,
          options: [
            `$P = ${perim}\\text{ m}, \\quad A = ${area}\\text{ m}^2$`,
            `$P = ${length + width}\\text{ m}, \\quad A = ${area}\\text{ m}^2$`,
            `$P = ${perim}\\text{ m}, \\quad A = ${area + length}\\text{ m}^2$`,
            `$P = ${perim + 4}\\text{ m}, \\quad A = ${perim * 2}\\text{ m}^2$`,
          ],
          correctIndex: 0,
          explanation: `Step 1: Perimeter $P = 2(l + w) = 2(${length} + ${width}) = ${perim}\\text{ m}$. Step 2: Area $A = l \\times w = ${length} \\times ${width} = ${area}\\text{ m}^2$.`,
          hint: `Use $P = 2(l + w)$ and $A = l \\times w$.`,
          xpReward: baseXp,
          sourceLabel: `${bookLabel} — Chapter 12: Perimeters and Areas`,
        };
      }
      // Archetype 4: Chapter 2 & 3 Fractions, Percentages & HCF/LCM
      const numBase = ((v % 7) + 2) * 20;
      const pct = ((v % 4) + 1) * 15;
      const resVal = (numBase * pct) / 100;
      return {
        id: `dyn-f1-math-pct-${v}`,
        cls,
        subject,
        topic: topic !== 'ALL' ? topic : 'Chapter 3 & 4: Fractions, Decimals and Percentages',
        difficulty,
        question: `[${cls} Textbook • Chapter 4: Percentages] In a school library shelf of $${numBase}$ textbooks, $${pct}\\%$ are Mathematics books. How many Mathematics books are on the shelf?`,
        options: [
          `$${resVal}$ books`,
          `$${resVal + 6}$ books`,
          `$${Math.max(2, numBase - resVal)}$ books`,
          `$${resVal * 2}$ books`,
        ],
        correctIndex: 0,
        explanation: `Step 1: Number of Mathematics books $= \\frac{${pct}}{100} \\times ${numBase} = ${resVal}$ books.`,
        hint: `Multiply $${numBase}$ by $\\frac{${pct}}{100}$.`,
        xpReward: baseXp,
        sourceLabel: `${bookLabel} — Chapter 4: Decimals and Percentages`,
      };
    }

    if (cLower.includes('form 2')) {
      const r1 = (v % 6) + 2;
      const r2 = (v % 5) + 4;
      const bCoeff = r1 + r2;
      const cCoeff = r1 * r2;
      return {
        id: `dyn-f2-math-${v}`,
        cls,
        subject,
        topic: topic !== 'ALL' ? topic : 'Chapter 4: Quadratic Equations & Logarithms',
        difficulty,
        question: `[${cls} Textbook • Chapter 4] Find the two roots of the quadratic equation $x^2 - ${bCoeff}x + ${cCoeff} = 0$ and state the value of $\\log_{10}(10^{x_1 + x_2})$:`,
        options: [
          `Roots: $x = ${r1}$ or $x = ${r2}$ ; $\\log_{10}(10^{x_1+x_2}) = ${bCoeff}$`,
          `Roots: $x = -${r1}$ or $x = -${r2}$ ; value $= -${bCoeff}$`,
          `Roots: $x = ${r1}$ or $x = ${r2}$ ; value $= ${cCoeff}$`,
          `Roots: $x = ${r1 - 1}$ or $x = ${r2 + 1}$ ; value $= ${bCoeff}$`,
        ],
        correctIndex: 0,
        explanation: `Step 1: Factorise $(x - ${r1})(x - ${r2}) = 0 \\Rightarrow x_1 = ${r1},\\; x_2 = ${r2}$. Step 2: $\\log_{10}(10^{x_1 + x_2}) = x_1 + x_2 = ${r1} + ${r2} = ${bCoeff}$.`,
        hint: `Find two numbers that multiply to $${cCoeff}$ and add up to $${bCoeff}$.`,
        xpReward: baseXp,
        sourceLabel: `${bookLabel} — Chapter 4 & 6: Quadratics & Logarithms`,
      };
    }

    if (cLower.includes('form 4') || cLower.includes('form 5') || cLower.includes('form 6')) {
      const kVal = (v % 7) + 2;
      const bVal = 3;
      const cVal = 2 * kVal;
      const dVal = 6;
      return {
        id: `dyn-f4-math-${v}`,
        cls,
        subject,
        topic: topic !== 'ALL' ? topic : 'Chapter 7: Matrices and Transformations',
        difficulty,
        question: `[${cls} Textbook • Matrices] Find the value of $x$ for which the matrix $P = \\begin{pmatrix} x + 1 & ${bVal} \\\\ ${cVal} & ${dVal} \\end{pmatrix}$ has determinant $|P| = 6$:`,
        options: [
          `$x = ${kVal}$`,
          `$x = ${kVal + 2}$`,
          `$x = ${kVal - 1}$`,
          `$x = ${2 * kVal}$`,
        ],
        correctIndex: 0,
        explanation: `Step 1: $|P| = ${dVal}(x + 1) - (${bVal} \\times ${cVal}) = 6$. Step 2: $6(x + 1) - ${3 * cVal} = 6 \\Rightarrow 6x + 6 - ${6 * kVal} = 6 \\Rightarrow 6x = ${6 * kVal} \\Rightarrow x = ${kVal}$.`,
        hint: `Set $(x + 1)(${dVal}) - (${bVal})(${cVal}) = 6$ and solve for $x$.`,
        xpReward: baseXp + 15,
        sourceLabel: `${bookLabel} — Chapter 7: Matrices and Transformations`,
      };
    }

    // Default Form 3 Math (AP/GP & Functions)
    const a1 = (v % 8) * 2 + 1;
    const d = (v % 5) + 2;
    const n = 10;
    const an = a1 + (n - 1) * d;
    const sn = (n / 2) * (a1 + an);
    return {
      id: `dyn-f3-math-${v}`,
      cls,
      subject,
      topic: topic !== 'ALL' ? topic : 'Chapter 5: Sequences and Series',
      difficulty,
      question: `[${cls} Textbook • Chapter 5] In an Arithmetic Progression (AP), the first term is $A_1 = ${a1}$ and the common difference is $d = ${d}$. Calculate the $10\\text{th}$ term ($A_{10}$) and the sum of the first $10$ terms ($S_{10}$):`,
      options: [
        `$A_{10} = ${an}, \\quad S_{10} = ${sn}$`,
        `$A_{10} = ${an + d}, \\quad S_{10} = ${sn + 20}$`,
        `$A_{10} = ${an - d}, \\quad S_{10} = ${sn - 15}$`,
        `$A_{10} = ${a1 * 10}, \\quad S_{10} = ${sn}$`,
      ],
      correctIndex: 0,
      explanation: `Step 1: $A_{10} = A_1 + 9d = ${a1} + 9(${d}) = ${an}$. Step 2: $S_{10} = \\frac{10}{2}(A_1 + A_{10}) = 5(${a1} + ${an}) = ${sn}$.`,
      hint: `Use $A_n = A_1 + (n-1)d$ and $S_n = \\frac{n}{2}(A_1 + A_n)$ with $n = 10$.`,
      xpReward: baseXp + 10,
      sourceLabel: `${bookLabel} — Chapter 5: Sequences and Series`,
    };
  }

  // PHYSICS PARAMETERIZED LEVEL-SPECIFIC TEXTBOOK PROBLEMS
  if (sLower.includes('physic')) {
    const rExt = (v % 7) + 3;
    const rInt = 1;
    const currentI = 2;
    const emf = currentI * (rExt + rInt);
    const termV = currentI * rExt;
    return {
      id: `dyn-phys-${cls}-${v}`,
      cls,
      subject,
      topic: topic !== 'ALL' ? topic : 'Current Electricity & Energy',
      difficulty,
      question: `[${cls} Textbook • Physics] A battery of EMF $E = ${emf}\\text{ V}$ and internal resistance $r = ${rInt}\\,\\Omega$ is connected across a load resistor of $R = ${rExt}\\,\\Omega$. Calculate the circuit current $I$ and terminal voltage $V$:`,
      options: [
        `$I = ${currentI}\\text{ A}, \\quad V = ${termV}\\text{ V}$`,
        `$I = ${(emf / rExt).toFixed(1)}\\text{ A}, \\quad V = ${emf}\\text{ V}$`,
        `$I = ${currentI + 1}\\text{ A}, \\quad V = ${termV - 2}\\text{ V}$`,
        `$I = 1.0\\text{ A}, \\quad V = ${rExt}\\text{ V}$`,
      ],
      correctIndex: 0,
      explanation: `Step 1: $I = \\frac{E}{R + r} = \\frac{${emf}}{${rExt} + ${rInt}} = ${currentI}\\text{ A}$. Step 2: Terminal voltage $V = IR = ${currentI} \\times ${rExt} = ${termV}\\text{ V}$.`,
      hint: `Apply $I = \\frac{E}{R + r}$ first, then multiply $I \\times R$ for terminal voltage.`,
      xpReward: baseXp + 10,
      sourceLabel: `${bookLabel} — Electricity & Mechanics`,
    };
  }

  // CHEMISTRY PARAMETERIZED LEVEL-SPECIFIC TEXTBOOK PROBLEMS
  if (sLower.includes('chemi')) {
    const volBase = 25;
    const molBase = 0.2;
    const volAcid = 20 + (v % 5) * 5;
    const molAcid = Number(((molBase * volBase) / volAcid).toFixed(3));
    return {
      id: `dyn-chem-${cls}-${v}`,
      cls,
      subject,
      topic: topic !== 'ALL' ? topic : 'Quantitative & Volumetric Chemistry',
      difficulty,
      question: `[${cls} Textbook • Chemistry] In a laboratory reaction, $${volBase}\\text{ cm}^3$ of $${molBase}\\text{ M KOH}$ completely neutralizes $${volAcid}\\text{ cm}^3$ of nitric acid ($\\text{HNO}_3$). Calculate the molarity $M_a$ of the $\\text{HNO}_3$ solution:`,
      options: [
        `$${molAcid}\\text{ M}$`,
        `$${(molAcid * 2).toFixed(3)}\\text{ M}$`,
        `$${(molAcid * 0.5).toFixed(3)}\\text{ M}$`,
        `$0.150\\text{ M}$`,
      ],
      correctIndex: 0,
      explanation: `Step 1: Mole ratio $\\text{KOH} : \\text{HNO}_3 = 1 : 1$. Step 2: $M_a V_a = M_b V_b \\Rightarrow M_a = \\frac{${molBase} \\times ${volBase}}{${volAcid}} = ${molAcid}\\text{ M}$.`,
      hint: `Use $M_a V_a = M_b V_b$ for the $1:1$ neutralization between $\\text{KOH}$ and $\\text{HNO}_3$.`,
      xpReward: baseXp + 10,
      sourceLabel: `${bookLabel} — Volumetric & Stoichiometric Analysis`,
    };
  }

  // GEOGRAPHY PARAMETERIZED LEVEL-SPECIFIC TEXTBOOK PROBLEMS
  const mapCm = 6 + (v % 10) * 2;
  const groundKm = mapCm * 0.5;
  return {
    id: `dyn-gen-${cls}-${subject}-${v}`,
    cls,
    subject,
    topic: topic !== 'ALL' ? topic : `${cls} ${subject} Textbook Competence`,
    difficulty,
    question: `[${cls} Textbook • ${subject}] In a field study recorded in the ${cls} ${subject} Student's Book, a linear transect measures $${mapCm}\\text{ cm}$ on a $1:50,000$ topographical map. Determine the true ground distance in kilometres:`,
    options: [
      `$${groundKm.toFixed(1)}\\text{ km}$`,
      `$${(groundKm * 2).toFixed(1)}\\text{ km}$`,
      `$${(groundKm * 0.5).toFixed(1)}\\text{ km}$`,
      `$${(groundKm + 3).toFixed(1)}\\text{ km}$`,
    ],
    correctIndex: 0,
    explanation: `Step 1: Scale $1:50,000$ means $1\\text{ cm} = 0.5\\text{ km}$. Step 2: Ground distance $= ${mapCm} \\times 0.5 = ${groundKm.toFixed(1)}\\text{ km}$.`,
    hint: `Multiply the map length ($${mapCm}\\text{ cm}$) by $0.5\\text{ km/cm}$.`,
    xpReward: baseXp,
    sourceLabel: `${bookLabel}`,
  };
}
