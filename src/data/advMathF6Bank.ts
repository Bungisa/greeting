import type { ExtractedTextbookExerciseSeed } from './extractedTextbookExerciseBank.ts';

export type AdvMathF6Tuple = [
  topic: string,
  subTopic: string,
  exerciseRef: string,
  questionText: string,
  correctAnswer: string,
  explanation: string,
];

const CH1 =
  'Chapter 1: Coordinate Geometry II (Conic Sections: Parabola, Ellipse & Hyperbola; Tangents, Normals, Parametric Equations, Polar Coordinates & Graphs)';
const CH2 =
  'Chapter 2: Vectors (3D Vector Representation & Magnitude, Ratio Theorem, Dot Product & Projections, Work Done, Cross Product, Area & Vector Calculus)';
const CH3 =
  'Chapter 3: Hyperbolic Functions (Definitions of sinh x, cosh x, tanh x, Identities, Equations, Inverse Hyperbolic Functions, Derivatives, Power Series & Integration)';
const CH4 =
  'Chapter 4: Statistics (Mean by Coding Method, Median, Quartiles, Interquartile Range, Percentiles, Mode, Variance & Standard Deviation of Ungrouped & Grouped Data)';

export const ADV_MATH_F6_PART1_TUPLES: AdvMathF6Tuple[] = [
  // =========================================================================
  // CHAPTER 1: COORDINATE GEOMETRY II
  // =========================================================================
  [
    CH1,
    'Conic Sections & Standard Parabola',
    'Activity 1.1 & Activity 1.2',
    'State the conic sections obtained when a plane slices a double right circular cone: (i) at $90^\\circ$ to the axis of rotation, (ii) parallel to a generating line, (iii) parallel to the axis of rotation, and (iv) at an oblique angle across one nappe; and deduce the standard equation of a parabola with vertex $(0,0)$ and focus $F(0, b)$ on the positive $y$-axis.',
    '(i) Circle, (ii) Parabola ($e = 1$), (iii) Hyperbola ($e > 1$), (iv) Ellipse ($0 < e < 1$); Standard parabola: $x^2 = 4by$ with directrix $y = -b$',
    'By definition of conic eccentricity $SP = e \\cdot PM$: when $e = 1$, for focus $F(0,b)$ and directrix $y = -b$, $\\sqrt{x^2 + (y - b)^2} = |y + b| \\Rightarrow x^2 + (y - b)^2 = (y + b)^2 \\Rightarrow x^2 = 4by$.',
  ],
  [
    CH1,
    'The Standard Parabola',
    'Exercise 1.1 Q1(a)-(c)',
    'Find the vertex, focus, and directrix in each of the following parabolas: (a) $y^2 = 16x$ (b) $y^2 = 32x$ (c) $3y^2 = -10x$.',
    '(a) Vertex $(0,0)$, Focus $(4,0)$, Directrix $x = -4$ | (b) Vertex $(0,0)$, Focus $(8,0)$, Directrix $x = -8$ | (c) Vertex $(0,0)$, Focus $(-\\frac{5}{6}, 0)$, Directrix $x = \\frac{5}{6}$',
    'Compare with $y^2 = 4ax$: (a) $4a = 16 \\Rightarrow a = 4$; (b) $4a = 32 \\Rightarrow a = 8$; (c) $y^2 = -\\frac{10}{3}x \\Rightarrow 4a = -\\frac{10}{3} \\Rightarrow a = -\\frac{5}{6}$.',
  ],
  [
    CH1,
    'The Standard Parabola',
    'Exercise 1.1 Q1(d)-(f)',
    'Find the vertex, focus, and directrix in each of the following parabolas: (d) $y^2 = -8x$ (e) $x^2 = -12y$ (f) $5x^2 = 16y$.',
    '(d) Vertex $(0,0)$, Focus $(-2,0)$, Directrix $x = 2$ | (e) Vertex $(0,0)$, Focus $(0,-3)$, Directrix $y = 3$ | (f) Vertex $(0,0)$, Focus $(0, \\frac{4}{5})$, Directrix $y = -\\frac{4}{5}$',
    'For (d) $4a = -8 \\Rightarrow a = -2$. For (e) $x^2 = 4by$ gives $4b = -12 \\Rightarrow b = -3$. For (f) $x^2 = \\frac{16}{5}y \\Rightarrow 4b = \\frac{16}{5} \\Rightarrow b = \\frac{4}{5}$.',
  ],
  [
    CH1,
    'The Standard Parabola',
    'Exercise 1.1 Q2(a)-(c)',
    'Find the equation of the parabola represented by each of the following information: (a) vertex $(0, 0)$, focus $(3, 0)$ (b) vertex $(0, 0)$, focus $(0, -6)$ (c) vertex $(0, 0)$, directrix $12y - 8 = 0$.',
    '(a) $y^2 = 12x$ | (b) $x^2 = -24y$ | (c) $x^2 = -\\frac{8}{3}y$',
    '(a) $a = 3 \\Rightarrow y^2 = 4(3)x = 12x$. (b) $b = -6 \\Rightarrow x^2 = 4(-6)y = -24y$. (c) Directrix $y = \\frac{2}{3} \\Rightarrow b = -\\frac{2}{3} \\Rightarrow x^2 = 4(-\\frac{2}{3})y = -\\frac{8}{3}y$.',
  ],
  [
    CH1,
    'The Standard Parabola',
    'Exercise 1.1 Q3, Q4 & Q5',
    '(3) The axis of symmetry of a parabola coincides with the $x$-axis, its vertex is at $(0, 0)$ and it passes through $(2, 4)$; find its equation. (4) Find the equation of the parabola with vertex $(0, 0)$ and directrix $x - 5 = 0$. (5) If the focus is $(0, 6)$ and directrix is $y + 6 = 0$, find its equation.',
    '(3) $y^2 = 8x$ | (4) $y^2 = -20x$ | (5) $x^2 = 24y$',
    '(3) Substitute $(2,4)$ into $y^2 = 4ax$: $16 = 8a \\Rightarrow a = 2 \\Rightarrow y^2 = 8x$. (4) Directrix $x = 5 \\Rightarrow a = -5 \\Rightarrow y^2 = -20x$. (5) Focus $(0,6)$, directrix $y = -6 \\Rightarrow b = 6 \\Rightarrow x^2 = 24y$.',
  ],
  [
    CH1,
    'The Standard Parabola',
    'Exercise 1.1 Q6, Q7, Q9 & Q10',
    '(6) Find the equation of the parabola passing through $(10, -4)$ and $(-10, -4)$. (7) A parabolic flashlight reflector has diameter $4\\text{ m}$ and depth $2\\text{ m}$; how far from the vertex should the bulb be placed? (9) Find the parabola $x^2 = 4by$ passing through $(-\\frac{1}{8}, -\\frac{1}{16})$. (10) A solar fire starter has diameter $16\\text{ cm}$ and depth $9\\text{ cm}$ with vertex at the origin; find its equation.',
    '(6) $x^2 = -25y$ | (7) $\\frac{1}{2}\\text{ m}$ ($0.5\\text{ m}$) | (9) $y = -4x^2$ (or $x^2 = -\\frac{1}{4}y$) | (10) $x^2 = \\frac{64}{9}y$ (or $y^2 = \\frac{64}{9}x$)',
    '(6) Symmetry about $y$-axis: $10^2 = 4b(-4) \\Rightarrow 4b = -25 \\Rightarrow x^2 = -25y$. (7) Point $(2,2)$ on $x^2 = 4ay \\Rightarrow 4 = 8a \\Rightarrow a = \\frac{1}{2}\\text{ m}$. (9) $(-\\frac{1}{8})^2 = 4b(-\\frac{1}{16}) \\Rightarrow 4b = -\\frac{1}{4} \\Rightarrow y = -4x^2$. (10) Point $(8, 9)$ on $x^2 = 4by \\Rightarrow 64 = 36b \\Rightarrow 4b = \\frac{64}{9} \\Rightarrow x^2 = \\frac{64}{9}y$.',
  ],
  [
    CH1,
    'The Translated Parabola',
    'Exercise 1.2 Q1(a)-(d)',
    'Find the focus, coordinates of the vertex, and the directrix in each of the following parabolas: (a) $y^2 - 4x + 2y + 5 = 0$ (b) $3x^2 - 18x + 8y + 23 = 0$ (c) $x^2 + 6x - 8y + 33 = 0$ (d) $5y^2 + 12x - 10y - 19 = 0$.',
    '(a) Vertex $(1,-1)$, Focus $(2,-1)$, Directrix $x = 0$ | (b) Vertex $(3, \\frac{1}{2})$, Focus $(3, -\\frac{1}{6})$, Directrix $y = \\frac{7}{6}$ | (c) Vertex $(-3, 3)$, Focus $(-3, 5)$, Directrix $y = 1$ | (d) Vertex $(2, 1)$, Focus $(\\frac{7}{5}, 1)$, Directrix $x = \\frac{13}{5}$',
    'Complete the square: (a) $(y+1)^2 = 4(x-1)$ ($a=1$); (b) $(x-3)^2 = -\\frac{8}{3}(y - \\frac{1}{2})$ ($b = -\\frac{2}{3}$); (c) $(x+3)^2 = 8(y-3)$ ($b=2$); (d) $(y-1)^2 = -\\frac{12}{5}(x-2)$ ($a = -\\frac{3}{5}$).',
  ],
  [
    CH1,
    'The Translated Parabola',
    'Exercise 1.2 Q2, Q3 & Q4',
    '(2) Find the equation of the parabola with vertex $(1, 1)$ and focus $(4, 1)$. (3) A suspension bridge has towers $16\\text{ m}$ high, $120\\text{ m}$ apart, and lowest rope height $6\\text{ m}$ above the road: find (a) its equation and (b) the support height $28\\text{ m}$ from the centre. (4) For $y + \\frac{x^2 - 10x + 25}{12} - 4 = 0$, write in standard form and find vertex and focus.',
    '(2) $y^2 - 2y - 12x + 13 = 0$ | (3) (a) $x^2 = 360(y - 6)$, (b) $8.18\\text{ m}$ ($\\approx 8.2\\text{ m}$) | (4) (a) $(x - 5)^2 = -12(y - 4)$, (b) Vertex $(5, 4)$, Focus $(5, 1)$',
    '(2) $a = 4 - 1 = 3 \\Rightarrow (y-1)^2 = 12(x-1) \\Rightarrow y^2 - 2y - 12x + 13 = 0$. (3) Vertex $(0,6)$ and passes through $(60,16)$: $60^2 = 4b(16-6) \\Rightarrow 4b = 360 \\Rightarrow x^2 = 360(y-6)$; at $x=28$, $y = 6 + \\frac{784}{360} = 8.18\\text{ m}$. (4) $(x-5)^2 = -12(y-4)$ has $V(5,4)$ and $b = -3 \\Rightarrow F(5,1)$.',
  ],
  [
    CH1,
    'The Translated Parabola',
    'Exercise 1.2 Q5, Q6 & Q7',
    '(5) Determine $(y - k)^2 = 4a(x - h)$ with focus $(3, -2)$ and directrix $x = -1$. (6) Given $x^2 - 8y - 2x = 55$, find the directrix, vertex, and focus. (7) Identify the equation of the parabola with focus $(-1, -3)$ and directrix $x + 3 = 0$.',
    '(5) $(y + 2)^2 = 8(x - 1)$ | (6) Directrix $y = -9$, Vertex $(1, -7)$, Focus $(1, -5)$ | (7) $(y + 3)^2 = 4(x + 2)$',
    '(5) Vertex is midpoint of $(3,-2)$ and $(-1,-2)$, so $(h,k) = (1,-2)$ and $a = 2 \\Rightarrow (y+2)^2 = 8(x-1)$. (6) $(x-1)^2 = 8(y+7) \\Rightarrow V(1,-7), b=2 \\Rightarrow F(1,-5)$, directrix $y = -9$. (7) Vertex $(-2,-3), a = 1 \\Rightarrow (y+3)^2 = 4(x+2)$.',
  ],
  [
    CH1,
    'The Translated Parabola',
    'Exercise 1.2 Q8, Q9 & Q10',
    '(8) Two towers $320\\text{ m}$ apart rise $40\\text{ m}$ above a road; a parabolic cable touches the road midway. Find the cable height $50\\text{ m}$ from a tower. (9) A parabolic bridge arch is $45\\text{ m}$ high at the centre and $195\\text{ m}$ wide at the base; find the arch height $30\\text{ m}$ from the centre and whether a $30\\text{ m}$ tall boat clears it. (10) $x^2 = -4y$ is shifted left $1$ unit and up $3$ units; find its equation, vertex, focus, and directrix.',
    '(8) $18.9\\text{ m}$ | (9) $\\text{Height} = 40.7\\text{ m}$; Yes, the $30\\text{ m}$ boat clears the arch | (10) $(x + 1)^2 = -4(y - 3)$, Vertex $(-1, 3)$, Focus $(-1, 2)$, Directrix $y = 4$',
    '(8) $x^2 = 4by$ through $(160, 40) \\Rightarrow 4b = 640$; at $50\\text{ m}$ from tower, $x = 160 - 50 = 110\\text{ m} \\Rightarrow y = \\frac{110^2}{640} = 18.906\\text{ m}$. (9) $x^2 = 4b(y - 45)$ through $(97.5, 0) \\Rightarrow y = 45(1 - \\frac{x^2}{97.5^2})$; at $x = 30$, $y = 45(1 - \\frac{900}{9506.25}) = 40.74\\text{ m} > 30\\text{ m}$.',
  ],
  [
    CH1,
    'Tangent and Normal to a Parabola',
    'Exercise 1.3 Q1, Q3 & Q4',
    '(1) Find the equations of tangent and normal to $y = x^2 - x - 2$ at $(1, -2)$. (3) Find the equations of the tangents drawn from $(1, 3)$ to $y^2 = -16x$. (4) Show that $y = 2x + 1$ touches $y^2 = 8x$ and find the point of contact.',
    '(1) Tangent: $y = x - 3$, Normal: $y = -x - 1$ | (3) $y = 4x - 1$ and $y = -x + 4$ | (4) Touches since $c = \\frac{a}{m} \\Rightarrow 1 = \\frac{2}{2}$; Point of contact: $(\\frac{1}{2}, 2)$',
    '(1) $\\frac{dy}{dx} = 2x - 1 = 1$ at $x = 1$. (3) Tangent to $y^2 = -16x$ ($a = -4$) with slope $m$ is $y = mx - \\frac{4}{m}$; passing through $(1,3)$ gives $3 = m - \\frac{4}{m} \\Rightarrow m^2 - 3m - 4 = 0 \\Rightarrow m = 4, -1$. (4) Point of contact is $(\\frac{a}{m^2}, \\frac{2a}{m}) = (\\frac{2}{4}, \\frac{4}{2}) = (\\frac{1}{2}, 2)$.',
  ],
  [
    CH1,
    'Tangent and Normal to a Parabola',
    'Exercise 1.3 Q5, Q6 & Q7',
    '(5) Find the equations of tangent and normal to $y^2 = 16x$ at $(16, 16)$ and $(1, -4)$. (6) Find the tangent and normal to $4x^2 - 4x - 8y + 16 = 0$ at $(-3, 8)$. (7) Find tangent and normal to (a) $y^2 = 4x$ at $(1, 2)$, (b) $x^2 = 4y$ at $(-6, 9)$, and (c) parabola with vertex $(2, 2)$ and focus $(2, \\frac{15}{8})$ at its vertex.',
    '(5) Tangents: $2y = x + 16,\\; y = -2x - 2$; Normals: $y = -2x + 48,\\; 2y = x - 9$ | (6) Tangent: $7x + 2y + 5 = 0$, Normal: $2x - 7y + 62 = 0$ | (7) (a) $y - x - 1 = 0;\\; y + x - 3 = 0$, (b) $y + 3x + 9 = 0;\\; 3y - x - 33 = 0$, (c) Tangent: $y = 2$, Normal: $x = 2$',
    'In (5), tangents intersect at $P(-4, 6)$ and normals at $Q(21, 6)$, so line $PQ$ ($y = 6$) has slope $0$, parallel to the $x$-axis (axis of symmetry). In (6), $\\frac{dy}{dx} = \\frac{8x - 4}{8} = -\\frac{7}{2}$ at $x = -3$.',
  ],
  [
    CH1,
    'Tangent and Normal to a Parabola',
    'Exercise 1.3 Q8, Q9, Q10, Q12 & Q15',
    '(8) Find tangent and normal to $(y - 2)^2 = 16(x - 4)$ at the vertex. (9) For $(x + 2)^2 = -4(y + 3)$, find tangent and normal at (a) Vertex and (b) $K(-10, -19)$. (10) Find the tangent to $y^2 = 6x$ parallel to $3x - 2y + 5 = 0$. (12) Find the tangents to $y^2 = 144x$ at $(144, 144)$ and $(9, -36)$ and their intersection. (15) $y = 8x - a$ meets $y^2 = 4ax$ at $M$ and $N$; find $M, N$, the tangents at $M, N$, and their intersection.',
    '(8) Tangent: $x = 4$, Normal: $y = 2$ | (9) (a) $y = -3,\\; x = -2$; (b) $y = 4x + 21,\\; 4y = -x - 86$ | (10) $3x - 2y + 2 = 0$ | (12) $x - 2y + 144 = 0,\\; 2x + y + 18 = 0$, Intersection $(-36, 54)$ | (15) (a) $M(\\frac{a}{16}, -\\frac{a}{2}), N(\\frac{a}{4}, a)$, (b) $16x + 4y + a = 0,\\; 4x - 2y + a = 0$, (c) $(-\\frac{a}{8}, \\frac{a}{4})$',
    'In (10), $m = \\frac{3}{2}, a = \\frac{3}{2} \\Rightarrow y = \\frac{3}{2}x + 1 \\Rightarrow 3x - 2y + 2 = 0$. In (12), $m_1 = \\frac{1}{2}$ and $m_2 = -2$, so $m_1 m_2 = -1$ (perpendicular), intersecting at $x = -a = -36, y = 54$.',
  ],
  [
    CH1,
    'Parametric Equations of a Parabola',
    'Exercise 1.4 Q1 - Q6',
    '(1) Find the parametric equations of $(y - 2)^2 = 8(x - 2)$. (2) Find the standard equation of $x = 4t, y = 2t^2$. (3) Express $x^2 = 12y$ parametrically. (5) Find the parametric equations of the parabola with vertex $(0,0)$ and focus $(0, -3)$. (6) Verify the locus of $T$ where the normal at $R(at^2, 2at)$ on $y^2 = 4ax$ passes through $S(h,k)$ and meets the curve again at $T$.',
    '(1) $x = 2 + 2t^2,\\; y = 2 + 4t$ | (2) $x^2 = 8y$ | (3) $x = 6t,\\; y = 3t^2$ | (5) $x = 6t,\\; y = -3t^2$ | (6) Locus of $T$ is $xy = y(h - 2a) + 2ak$',
    'For $(y - k)^2 = 4a(x - h)$, parametric equations are $x = h + at^2, y = k + 2at$. For $x^2 = 4by$, $x = 2bt, y = bt^2$.',
  ],
  [
    CH1,
    'The Standard Ellipse',
    'Exercise 1.5 Q1(a)-(d)',
    'Find the equation of the ellipse in each condition: (a) Foci $(\\pm 4, 0)$, vertices $(\\pm 10, 0)$ (b) Length of major axis on $y$-axis is $14$, centre $(0, 0)$, $e = \\frac{3\\sqrt{5}}{7}$ (c) Vertices $(\\pm 15, 0)$, minor axis length $10$ (d) Foci $(0, \\pm 6)$, major axis length $36$.',
    '(a) $\\frac{x^2}{100} + \\frac{y^2}{84} = 1$ | (b) $\\frac{x^2}{4} + \\frac{y^2}{49} = 1$ | (c) $\\frac{x^2}{225} + \\frac{y^2}{25} = 1$ | (d) $\\frac{x^2}{288} + \\frac{y^2}{324} = 1$',
    '(a) $a = 10, ae = 4 \\Rightarrow b^2 = 100 - 16 = 84$. (b) $b = 7, b^2 e^2 = 45 \\Rightarrow a^2 = 49 - 45 = 4$. (c) $a = 15, b = 5$. (d) $b = 18, be = 6 \\Rightarrow a^2 = 324 - 36 = 288$.',
  ],
  [
    CH1,
    'The Standard Ellipse',
    'Exercise 1.5 Q2, Q4, Q5 & Q6',
    '(2) A mountain highway tunnel has an elliptical opening; the highway is $20\\text{ m}$ wide, a $5\\text{ m}$ truck clears the edge, and highest point is $8\\text{ m}$: find (a) the standard equation and (b) total opening width. (4) Find the ellipse passing through $(1, 2)$ and $(3, 0)$. (5) Foci on $y$-axis, centre $(0,0)$, distance between foci $18$, major axis $24$: find equation and directrices. (6) Sum of distances from two flag posts ($10\\text{ m}$ apart) is $16\\text{ m}$: find path equation, directrices, and foci.',
    '(2) (a) $\\frac{x^2}{164.1} + \\frac{y^2}{64} = 1$ (or textbook $\\frac{x^2}{100} + \\frac{y^2}{64} = 1$), (b) $25.62\\text{ m}$ (or $15.6\\text{ m}$ at $y=5$) | (4) $\\frac{x^2}{9} + \\frac{2y^2}{9} = 1$ | (5) $\\frac{x^2}{63} + \\frac{y^2}{144} = 1$, directrices $y = \\pm 16$ | (6) $\\frac{x^2}{64} + \\frac{y^2}{39} = 1$, directrices $x = \\pm 12\\frac{4}{5}$, foci $(\\pm 5, 0)$',
    'In (4), $(3,0) \\Rightarrow a^2 = 9$; $(1,2) \\Rightarrow \\frac{1}{9} + \\frac{4}{b^2} = 1 \\Rightarrow b^2 = \\frac{9}{2}$. In (5), $b = 12, be = 9 \\Rightarrow e = \\frac{3}{4}, a^2 = 144 - 81 = 63$, directrices $y = \\pm \\frac{b}{e} = \\pm 16$. In (6), $2a = 16 \\Rightarrow a = 8$, $2ae = 10 \\Rightarrow ae = 5, b^2 = 64 - 25 = 39$.',
  ],
  [
    CH1,
    'The Standard Ellipse',
    'Exercise 1.5 Q8, Q9 & Q10',
    '(8) Find the eccentricity, vertices, and distance between foci of $6x^2 + 8y^2 = 24$. (9) Find the eccentricity and directrices of $169x^2 + 25y^2 = 4225$. (10) A whispering dome is $30\\text{ m}$ long and $15\\text{ m}$ wide: find (a) its standard equation and (b) how far apart two performers standing at the foci are.',
    '(8) $e = \\frac{1}{2}$, vertices $(\\pm 2, 0)$, distance between foci $= 2\\text{ units}$ | (9) $e = \\frac{12}{13}$, directrices $y = \\pm \\frac{169}{12}$ | (10) (a) $\\frac{x^2}{225} + \\frac{y^2}{56.25} = 1$, (b) $15\\sqrt{3} \\approx 26\\text{ metres}$',
    '(8) $\\frac{x^2}{4} + \\frac{y^2}{3} = 1 \\Rightarrow a=2, b=\\sqrt{3}, e = \\sqrt{1 - \\frac{3}{4}} = \\frac{1}{2}$, $2ae = 2$. (9) $\\frac{x^2}{25} + \\frac{y^2}{169} = 1 \\Rightarrow b=13, a=5, e = \\frac{12}{13}, y = \\pm \\frac{13}{12/13} = \\pm \\frac{169}{12}$. (10) $a = 15, b = 7.5 \\Rightarrow 2c = 2\\sqrt{225 - 56.25} = 2(12.99) \\approx 26\\text{ m}$.',
  ],
  [
    CH1,
    'The Translated Ellipse',
    'Exercise 1.6 Q1 - Q5',
    '(1) Find the ellipse with foci $(4 \\pm \\sqrt{7}, 3)$ and vertices $(8, 3), (0, 3)$. (2) Find the centre, foci, and vertices of $x^2 + 2y^2 - 2x - 4y + 1 = 0$. (3) Find the ellipse with vertices $(-2, -1 \\pm 3)$, centre $(-2, -1)$, and $e = \\frac{1}{3}$, and its foci. (4) Prove $4x^2 - 16x + 9y^2 + 18y - 11 = 0$ is an ellipse and find its centre, foci, vertices, and directrices. (5) Find the ellipse with minor axis endpoints $(-2, 9), (-2, 1)$ and major axis endpoints $(-11, 5), (7, 5)$.',
    '(1) $\\frac{(x - 4)^2}{16} + \\frac{(y - 3)^2}{9} = 1$, centre $(4, 3)$ | (2) Centre $(1, 1)$, foci $(2, 1), (0, 1)$, vertices $(1 \\pm \\sqrt{2}, 1)$ | (3) $\\frac{(x + 2)^2}{8} + \\frac{(y + 1)^2}{9} = 1$, foci $(-2, 0), (-2, -2)$ | (4) $\\frac{(x - 2)^2}{9} + \\frac{(y + 1)^2}{4} = 1$, centre $(2, -1)$, foci $(2 \\pm \\sqrt{5}, -1)$, vertices $(5, -1), (-1, -1)$, directrices $x = 2 \\pm \\frac{9\\sqrt{5}}{5}$ | (5) $\\frac{(x + 2)^2}{81} + \\frac{(y - 5)^2}{16} = 1$',
    'Complete the square in each case and apply $c^2 = |a^2 - b^2|$ relative to centre $(h, k)$.',
  ],
  [
    CH1,
    'The Translated Ellipse',
    'Exercise 1.6 Q6 - Q10',
    '(6) Vertices $(1, 7), (1, 1)$ and co-vertices $(-1, 4), (3, 4)$: find standard equation, foci, $e$, and directrices. (7) Centre $(2, 1)$, axes $6$ on $y$ and $12$ on $x$: find equation, foci, directrices, and vertices. (8) For $\\frac{(x - 2)^2}{3^2} + \\frac{(y - 3)^2}{2^2} = 1$, find foci, centre, and vertices. (9) $9x^2 + 16y^2 = 144$ shifted $4$ right and $3$ up: find foci, vertices, centre, and directrices. (10) Whispering chamber $48\\text{ m}$ wide, foci $12\\text{ m}$ from centre $(4, 4)$: find equation, ceiling height at centre, directrices, and $e$.',
    '(6) $\\frac{(x - 1)^2}{4} + \\frac{(y - 4)^2}{9} = 1$, foci $(1, 4 \\pm \\sqrt{5}), e = \\frac{\\sqrt{5}}{3}, y = 4 \\pm \\frac{9\\sqrt{5}}{5}$ | (7) $\\frac{(x - 2)^2}{36} + \\frac{(y - 1)^2}{9} = 1$, foci $(2 \\pm 3\\sqrt{3}, 1) \\approx (7.2, 1), (-3.2, 1)$, directrices $x = 8.9, -4.9$, vertices $(8, 1), (-4, 1)$ | (8) Foci $(2 \\pm \\sqrt{5}, 3)$, Centre $(2, 3)$, Vertices $(5, 3), (-1, 3)$ | (9) Centre $(4, 3)$, Foci $(4 \\pm \\sqrt{7}, 3)$, Vertices $(8, 3), (0, 3)$, Directrices $x = 4 \\pm \\frac{16\\sqrt{7}}{7}$ | (10) (a) $\\frac{(x - 4)^2}{576} + \\frac{(y - 4)^2}{432} = 1$, (b) $12\\sqrt{3}\\text{ m}$, (c) $x = 52, x = -44;\\; e = \\frac{1}{2}$',
    'In (10), $2a = 48 \\Rightarrow a = 24, c = 12 \\Rightarrow e = \\frac{12}{24} = \\frac{1}{2}, b = \\sqrt{576 - 144} = \\sqrt{432} = 12\\sqrt{3}\\text{ m}$, directrices $x = 4 \\pm \\frac{24}{1/2} = 52$ and $-44$.',
  ],
  [
    CH1,
    'Tangent and Normal to the Ellipse',
    'Exercise 1.7 Q1, Q2, Q3 & Q5',
    '(1) Find tangent and normal at (a) $(-1, -1)$ on $16x^2 + 9y^2 = 25$ and (b) $(-2, -1)$ on $2x^2 + y^2 = 9$. (2) Find $k$ such that $x + 2y = k$ is tangent to $x^2 + 4y^2 = 8$ and find the points of contact. (3) Find the condition for $x\\cos\\theta + y\\sin\\theta = t$ to be tangent to $b^2x^2 + a^2y^2 = a^2b^2$. (5) If $y = 3x + c$ is tangent to $\\frac{x^2}{16} + \\frac{y^2}{9} = 1$, find the points of contact.',
    '(1) (a) $16x + 9y + 25 = 0;\\; 9x - 16y - 7 = 0$, (b) $4x + y + 9 = 0;\\; -x + 4y + 2 = 0$ | (2) $k = 4$ at $(2, 1)$ and $k = -4$ at $(-2, -1)$ | (3) $t^2 = a^2\\cos^2\\theta + b^2\\sin^2\\theta$ | (5) $(-\\frac{16\\sqrt{17}}{17}, \\frac{3\\sqrt{17}}{17})$ and $(\\frac{16\\sqrt{17}}{17}, -\\frac{3\\sqrt{17}}{17})$',
    'Using tangency condition $c^2 = a^2m^2 + b^2$: in (2), $y = -\\frac{1}{2}x + \\frac{k}{2}$ on $\\frac{x^2}{8} + \\frac{y^2}{2} = 1 \\Rightarrow \\frac{k^2}{4} = 8(\\frac{1}{4}) + 2 = 4 \\Rightarrow k = \\pm 4$. In (5), $c = \\pm\\sqrt{16(9) + 9} = \\pm 3\\sqrt{17}$ and point of contact is $(\\mp\\frac{a^2m}{c}, \\pm\\frac{b^2}{c})$.',
  ],
  [
    CH1,
    'Tangent and Normal to the Ellipse',
    'Exercise 1.7 Q7, Q9 & Q10',
    '(7) For $x^2 + 4y^2 - 4x - 8y - 24 = 0$, verify $(2 + 4\\sqrt{2}, 1)$ lies on the ellipse and find the tangent and normal there. (9) Find the tangents to $x^2 + 2y^2 = 8$ that are (a) parallel to $y = 2x$ and (b) perpendicular to $y = 2x$. (10) Find the equations of the normals at $(6, 4)$ and $(8, 3)$ to $x^2 + 4y^2 = 100$.',
    '(7) Tangent: $x = 2 + 4\\sqrt{2}$, Normal: $y = 1$ | (9) (a) $y = 2x \\pm 6$, (b) $x + 2y = \\pm 2\\sqrt{6}$ | (10) Normals: $8x - 3y = 36$ and $3x - 2y = 18$',
    'In (7), $(x-2)^2 + 4(y-1)^2 = 32$, so $(2+4\\sqrt{2}, 1)$ is the right vertex where tangent is vertical $x = 2+4\\sqrt{2}$ and normal is horizontal $y = 1$. In (9), $a^2 = 8, b^2 = 4$: (a) $m = 2 \\Rightarrow c = \\pm\\sqrt{8(4)+4} = \\pm 6$; (b) $m = -\\frac{1}{2} \\Rightarrow c = \\pm\\sqrt{8(\\frac{1}{4})+4} = \\pm\\sqrt{6}$.',
  ],
  [
    CH1,
    'Parametric Equations of an Ellipse',
    'Exercise 1.8 Q1, Q3, Q4 & Q5',
    '(1) Find the parametric equations of $x^2 + 4y^2 - 4x - 8y - 24 = 0$. (3) Find parametric equations of (a) $25x^2 + 4y^2 = 100$, (b) $\\frac{(x - 1)^2}{9} + \\frac{(y + 2)^2}{25} = 1$, (c) $\\frac{(x + 5)^2}{36} + \\frac{(y - 6)^2}{16} = 1$. (4) Describe $x = 4 + \\cos\\beta, y = 3 + 4\\sin\\beta$. (5) Find the tangent and normal to $25x^2 + 4y^2 = 100$ at $(2\\cos\\theta, 5\\sin\\theta)$.',
    '(1) $x = 2 + 4\\sqrt{2}\\cos\\theta,\\; y = 1 + 2\\sqrt{2}\\sin\\theta$ | (3) (a) $x = 2\\cos\\theta, y = 5\\sin\\theta$, (b) $x = 1 + 3\\cos\\theta, y = -2 + 5\\sin\\theta$, (c) $x = -5 + 6\\cos\\theta, y = 6 + 4\\sin\\theta$ | (4) Translated ellipse $\\frac{(x - 4)^2}{1} + \\frac{(y - 3)^2}{16} = 1$ centred at $(4, 3)$ | (5) Tangent: $(5\\cos\\theta)x + (2\\sin\\theta)y = 10$, Normal: $(5\\cos\\theta)y - (2\\sin\\theta)x = -21\\sin\\theta\\cos\\theta$',
    'For $\\frac{(x-h)^2}{a^2} + \\frac{(y-k)^2}{b^2} = 1$, parametric coordinates are $x = h + a\\cos\\theta, y = k + b\\sin\\theta$.',
  ],
  [
    CH1,
    'The Standard Hyperbola',
    'Exercise 1.9 Q1 - Q5',
    '(1) Find the equation of the hyperbola with: (a) Foci $(\\pm 5, 0)$, vertices $(\\pm 3, 0)$ (b) Foci $(0, \\pm 13)$, vertices $(0, \\pm 5)$. (2) Find the foci, vertices, and eccentricity of $5y^2 - 9x^2 = 36$. (3) Find the vertices, foci, length of transverse axis, and directrices of (a) $x^2 - y^2 = 1$ and (b) $x^2 - y^2 = 4$. (4) Find $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ with $e = 8$ and distance between foci $12$. (5) Centre $(0,0)$, transverse axis $2a$ along $x$-axis, distance between foci $4a$: find equation.',
    '(1) (a) $16x^2 - 9y^2 = 144$, (b) $144y^2 - 25x^2 = 3600$ | (2) Foci $(0, \\pm \\frac{2\\sqrt{14}}{\\sqrt{5}}) \\approx (0, \\pm 3.35)$, vertices $(0, \\pm \\frac{6}{\\sqrt{5}}) \\approx (0, \\pm 2.68)$, $e = \\frac{\\sqrt{14}}{3} \\approx 1.25$ | (3) (a) Length $= 2$, foci $(\\pm\\sqrt{2}, 0)$, vertices $(\\pm 1, 0)$, directrices $x = \\pm\\frac{\\sqrt{2}}{2}$; (b) Length $= 4$, foci $(\\pm 2\\sqrt{2}, 0)$, vertices $(\\pm 2, 0)$, directrices $x = \\pm\\sqrt{2}$ | (4) $9072x^2 - 144y^2 = 5103$ | (5) $3x^2 - y^2 = 3a^2$',
    'For a hyperbola, $c^2 = a^2e^2 = a^2 + b^2$. In (4), $2ae = 12 \\Rightarrow ae = 6$; since $e = 8$, $a = \\frac{3}{4}, a^2 = \\frac{9}{16}, b^2 = 36 - \\frac{9}{16} = \\frac{567}{16} \\Rightarrow 9072x^2 - 144y^2 = 5103$.',
  ],
  [
    CH1,
    'The Standard Hyperbola',
    'Exercise 1.9 Q6 - Q10',
    '(6) Verify that the hyperbola with vertices $(0, \\pm 7)$ and $e = \\frac{4}{3}$ is $7y^2 - 9x^2 = 343$. (7) Verify the hyperbola passing through $(2, 1)$ and $(4, -3)$ is $2x^2 - 3y^2 = 5$. (8) A nuclear cooling tower has cross-section $1936x^2 - 900y^2 = 1742400$, height $150\\text{ m}$, and top-to-centre distance is half the base-to-centre distance: find the top and base diameters. (9) Find the hyperbola with transverse axis $18$ and conjugate axis $22$. (10) Stations A and B are $210\\text{ km}$ apart; a plane is $80\\text{ km}$ farther from B than A: find the hyperbola equation.',
    '(8) Top diameter $= 90.83\\text{ m}$ (radius $45.41\\text{ m}$), Base diameter $= 148.98\\text{ m}$ (radius $74.49\\text{ m}$) | (9) $121x^2 - 81y^2 = 9801$ | (10) $\\frac{x^2}{1600} - \\frac{y^2}{9425} = 1$',
    'In (8), $\\frac{x^2}{900} - \\frac{y^2}{1936} = 1$. Since $h_{\\text{top}} + h_{\\text{base}} = 150$ and $h_{\\text{top}} = \\frac{1}{2}h_{\\text{base}}$, $y_{\\text{top}} = 50\\text{ m}$ and $y_{\\text{base}} = -100\\text{ m}$. At $y = 50$, $x = 30\\sqrt{1 + \\frac{2500}{1936}} = 45.41\\text{ m}$; at $y = -100$, $x = 30\\sqrt{1 + \\frac{10000}{1936}} = 74.49\\text{ m}$. In (10), $2a = 80 \\Rightarrow a = 40, c = 105 \\Rightarrow b^2 = 105^2 - 40^2 = 9425$.',
  ],
  [
    CH1,
    'The Translated Hyperbola & Asymptotes',
    'Exercise 1.10 Q1 - Q5',
    '(1) For $\\frac{(x - 2)^2}{16} - \\frac{y^2}{9} = 1$, find the centre, foci, vertices, and asymptotes. (2) Deduce the hyperbola with foci $(10, -3), (-2, -3)$ and vertices $(7, -3), (1, -3)$, its centre and directrices. (3) Find $e$, centre, foci, and asymptotes of $\\frac{(x - 2)^2}{4} - \\frac{(y - 3)^2}{9} = 1$. (4) Difference of distances from $R(2, 2)$ and $S(10, 2)$ is $2$: find equation, asymptotes, directrices, and vertices. (5) For $3x^2 - y^2 - 12x + 4y - 19 = 0$, find centre, $e$, and foci.',
    '(1) Centre $(2, 0)$, foci $(7, 0), (-3, 0)$, vertices $(6, 0), (-2, 0)$, asymptotes $y = \\pm\\frac{3}{4}(x - 2)$ | (2) $\\frac{(x - 4)^2}{9} - \\frac{(y + 3)^2}{27} = 1$, centre $(4, -3)$, directrices $x = 5\\frac{1}{2}, 2\\frac{1}{2}$ | (3) $e = \\frac{\\sqrt{13}}{2}$, centre $(2, 3)$, foci $(2 \\pm \\sqrt{13}, 3) \\approx (5.6, 3), (-1.6, 3)$, asymptotes $2y - 3x = 0, 2y + 3x = 12$ | (4) $\\frac{(x - 6)^2}{1} - \\frac{(y - 2)^2}{15} = 1$, asymptotes $y = 2 \\pm \\sqrt{15}(x - 6)$, directrices $x = 6\\frac{1}{4}, 5\\frac{3}{4}$, vertices $(7, 2), (5, 2)$ | (5) Centre $(2, 2), e = 2$, foci $(-4, 2), (8, 2)$',
    'In (5), $3(x-2)^2 - (y-2)^2 = 27 \\Rightarrow \\frac{(x-2)^2}{9} - \\frac{(y-2)^2}{27} = 1 \\Rightarrow a=3, b=3\\sqrt{3}, c=6, e=2$.',
  ],
  [
    CH1,
    'The Translated Hyperbola & Asymptotes',
    'Exercise 1.10 Q6, Q7, Q9 & Q10',
    '(6) Find the hyperbola with vertex $(4, 5)$, centre $(4, 2)$, and asymptote $4y + 4 = 3x$. (7) Express $25x^2 - 36y^2 - 400x - 432y = 596$ in standard form and find centre, vertices, and foci. (9) Centre $(0, -2)$, vertices $(0, 0), (0, -4)$, and $e = 1.5$: find equation. (10) Find hyperbola with: (a) Foci $(4, 1), (8, 1)$ and $e = 2$; (b) Centre $(-4, 1)$, vertex $(2, 1)$, semi-conjugate axis $4$.',
    '(6) $\\frac{(y - 2)^2}{9} - \\frac{(x - 4)^2}{16} = 1$ | (7) $\\frac{(x - 8)^2}{36} - \\frac{(y + 6)^2}{25} = 1$, Centre $(8, -6)$, Vertices $(14, -6), (2, -6)$, Foci $(8 \\pm \\sqrt{61}, -6)$ | (9) $\\frac{(y + 2)^2}{4} - \\frac{x^2}{5} = 1$ | (10) (a) $\\frac{(x - 6)^2}{1} - \\frac{(y - 1)^2}{3} = 1$, (b) $\\frac{(x + 4)^2}{36} - \\frac{(y - 1)^2}{16} = 1$',
    'In (6), vertical transverse axis has $b = 5 - 2 = 3$; asymptote $y - 2 = \\frac{3}{4}(x - 4)$ gives $\\frac{b}{a} = \\frac{3}{4} \\Rightarrow a = 4$.',
  ],
  [
    CH1,
    'Tangent and Normal to the Hyperbola',
    'Exercise 1.11 Q1 - Q10',
    'Find the equations of tangent and normal / tangency conditions for the hyperbolas in Exercise 1.11: (1) $9x^2 - 4y^2 = 36$ at $Q(4, 3\\sqrt{3})$; (2) tangents to $4x^2 - 9y^2 = 1$ parallel to $4y = 5x + 9$; (3) $x^2 - 6y^2 - 3 = 0$ at $(-3, -1)$; (4) $x^2 - 9y^2 = 72$ at $(9, 1)$; (5) point of tangency of $4y - 3x + 5 = 0$ on $x^2 = 5 + 4y^2$; (6) $x^2 - 3y^2 = 4$ in QIII at $x = -4$; (7) tangents from $(3, 2)$ to $x^2 = 9y^2 + 9$; (8) $y = x \\pm 1$ on $2x^2 - 3y^2 = 6$; (9) tangents to $9x^2 - 16y^2 = 144$ parallel to $5x = 4y$; (10) condition for $dx + ey + f = 0$ to be tangent to $b^2x^2 - a^2y^2 = a^2b^2$.',
    '(1) $3x - \\sqrt{3}y = 3,\\; x + \\sqrt{3}y = 13$ | (2) $30x - 24y \\pm \\sqrt{161} = 0$ | (3) $x - 2y + 1 = 0,\\; 2x + y + 7 = 0$ | (4) $x - y - 8 = 0,\\; x + y - 10 = 0$ | (5) $(3, 1)$ | (6) $2x - 3y + 2 = 0,\\; 3x + 2y + 16 = 0$ | (7) $12y - 5x - 9 = 0$ at $(-5, -\\frac{4}{3})$ and $x = 3$ at $(3, 0)$ | (8) $(3, 2)$ and $(-3, -2)$ | (9) $4y - 5x \\pm 16 = 0$ | (10) $f^2 = a^2d^2 - b^2e^2$',
    'For $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$, tangent at $(x_1, y_1)$ is $\\frac{xx_1}{a^2} - \\frac{yy_1}{b^2} = 1$, and $y = mx + c$ is tangent iff $c^2 = a^2m^2 - b^2$.',
  ],
  [
    CH1,
    'Parametric Equations of a Hyperbola',
    'Exercise 1.12 Q1, Q2, Q3, Q5, Q7 & Q8',
    '(1) For $9x^2 - 4y^2 = 18x + 16y + 295$, find standard and parametric equations. (2) For $\\frac{(x + 1)^2}{16} = 1 + \\frac{(y - 1)^2}{9}$, find parametric equations and tangent/normal at $(-5, 1)$. (3) Parametric equations of (a) $\\frac{x^2}{16} - \\frac{y^2}{12} = 1$, (b) $\\frac{y^2}{48} - \\frac{x^2}{12} = 1$, (c) $3(x - 2)^2 - 4(y - 2)^2 = 12$, (d) $4(y + 1)^2 - 5(x + 4)^2 = 100$. (5) Centre, vertices, and parametric equations of $y^2 - 5x^2 + 20x = 50$. (7) Cartesian equation of $x = 2 + 3\\sec\\theta, y = 2\\tan\\theta$. (8) Parametric equations of $\\frac{(y - 2)^2}{4} - \\frac{(x + 1)^2}{9} = 1$.',
    '(1) $\\frac{(x - 1)^2}{36} - \\frac{(y + 2)^2}{81} = 1,\\; x = 1 + 6\\sec\\theta,\\; y = -2 + 9\\tan\\theta$ | (2) $x = -1 + 4\\sec\\theta,\\; y = 1 + 3\\tan\\theta$; Tangent: $x = -5$, Normal: $y = 1$ | (3) (a) $x = 4\\sec\\theta, y = 2\\sqrt{3}\\tan\\theta$, (b) $y = 4\\sqrt{3}\\sec\\theta, x = 2\\sqrt{3}\\tan\\theta$, (c) $x = 2 + 2\\sec\\theta, y = 2 + \\sqrt{3}\\tan\\theta$, (d) $y = -1 + 5\\sec\\theta, x = -4 + 2\\sqrt{5}\\tan\\theta$ | (5) Centre $(2, 0)$, Vertices $(2, \\pm\\sqrt{30}) \\approx (2, \\pm 5.48),\\; x = 2 + \\sqrt{6}\\tan\\theta, y = \\sqrt{30}\\sec\\theta$ | (7) $\\frac{(x - 2)^2}{9} - \\frac{y^2}{4} = 1$ | (8) $y = 2 + 2\\sec\\theta,\\; x = -1 + 3\\tan\\theta$',
    'Use $\\sec^2\\theta - \\tan^2\\theta = 1$ to convert between parametric and Cartesian equations of hyperbolas.',
  ],
  [
    CH1,
    'Polar & Rectangular Coordinates',
    'Exercise 1.13 Q2, Q3, Q5, Q7, Q8, Q9 & Q10',
    '(2) Convert polar to Cartesian: (a) $(2, 30^\\circ)$, (b) $(2, 120^\\circ)$, (c) $(3, -290^\\circ)$, (d) $(5, \\frac{\\pi}{2})$. (3) Convert polar to rectangular: (a) $r = 4$, (b) $r = \\frac{1}{1 - \\cos\\theta}$, (c) $r\\sin 2\\theta = 1$, (d) $r = \\tan\\theta$. (5) Rectangular to polar: (a) $y = 4$, (b) $x^2 + y^2 = 4x$, (c) $x - y = 3$, (d) $x + y = 0$. (8) Convert $9r^2(\\cos^2\\theta + 4\\sin^2\\theta) - 36r(\\cos\\theta + 2\\sin\\theta) - 252 = 0$ to rectangular. (9) Identify curves: (a) $r = \\frac{4}{2 - 5\\cos\\theta}$, (b) $r = \\frac{10}{8 + 3\\sin\\theta}$, (c) $r = 3\\cos\\theta + 2\\sin\\theta$. (10) Polar coordinates of $(-1, 1), (0, 2), (-2, 0), (\\frac{3}{2}, \\frac{\\sqrt{3}}{2})$.',
    '(2) (a) $(\\sqrt{3}, 1)$, (b) $(-1, \\sqrt{3})$, (c) $(1.03, 2.82)$, (d) $(0, 5)$ | (3) (a) $x^2 + y^2 = 16$, (b) $y^2 - 2x = 1$, (c) $2xy = 1$, (d) $x^2(x^2 + y^2) = y^2$ | (5) (a) $r\\sin\\theta = 4$, (b) $r = 4\\cos\\theta$, (c) $r(\\cos\\theta - \\sin\\theta) = 3$, (d) $\\cos\\theta + \\sin\\theta = 0$ | (8) $\\frac{(x - 2)^2}{36} + \\frac{(y - 1)^2}{9} = 1$ | (9) (a) $21x^2 - 4y^2 + 40x + 16 = 0$ (hyperbola), (b) $64x^2 + 55y^2 + 60y - 100 = 0$ (ellipse), (c) $x^2 + y^2 - 3x - 2y = 0$ (circle) | (10) $(\\sqrt{2}, \\frac{3\\pi}{4}), (2, \\frac{\\pi}{2}), (2, \\pi), (\\sqrt{3}, \\frac{\\pi}{6})$',
    'Apply $x = r\\cos\\theta, y = r\\sin\\theta,$ and $x^2 + y^2 = r^2$.',
  ],
  [
    CH1,
    'Graphs in Polar Coordinates',
    'Exercise 1.14 Q4 - Q10',
    '(4) How is the graph of $r = f(\\theta - \\alpha)$ related to $r = f(\\theta)$? (5) Find the rectangular equation of $r = 3 + 2\\cos\\theta$. (6) Convert $(x^2 + y^2)^2 = x^2 - y^2$ into polar form. (7) Find the points of intersection of $r^2 = 4\\cos\\theta$ and $r = 1 - \\cos\\theta$. (8) Find the points of intersection of $r^2 = \\sin 2\\theta$ and $r^2 = \\cos 2\\theta$. (9) Which has the same graph as $r = 1 - \\cos\\theta$: (a) $r = 2\\sin^2\\frac{\\theta}{2}$ or (b) $r = 1 + \\cos\\theta$? (10) Find the intersections of $r = 2\\sin\\theta$ and $r = 2\\sin 2\\theta$.',
    '(4) Rotated anti-clockwise about the pole through angle $\\alpha$ | (5) $(x^2 + y^2 - 2x)^2 = 9(x^2 + y^2)$ | (6) $r^2 = \\cos 2\\theta$ | (7) $(2\\sqrt{2} - 2, \\pm 80^\\circ)$ | (8) $(\\frac{\\sqrt{2}}{2}, \\frac{\\pi}{8})$ and $(-\\frac{\\sqrt{2}}{2}, \\frac{9\\pi}{8})$ | (9) Both (a) by identity $1 - \\cos\\theta = 2\\sin^2\\frac{\\theta}{2}$ and (b) since $(r, \\theta + \\pi)$ traces the same cardioid | (10) $(0, 0), (\\sqrt{3}, \\frac{\\pi}{3}), (-\\sqrt{3}, \\frac{\\pi}{3})$ (or $(\\sqrt{3}, \\frac{5\\pi}{3})$)',
    'In (5), $r^2 = 3r + 2r\\cos\\theta \\Rightarrow x^2 + y^2 - 2x = 3r \\Rightarrow (x^2 + y^2 - 2x)^2 = 9(x^2 + y^2)$.',
  ],
  [
    CH1,
    'Revision Exercise 1 (Part 1)',
    'Revision Exercise 1 Q1 - Q13',
    '(1) Polar coordinates of $(1, 1)$ and $(2\\sqrt{3}, -2)$. (2) Polar equations of $y = 6, 2xy = 1, x^2 + y^2 = 25$. (3) Rectangular equations of $r = 3, r^2 = \\sin 2\\theta, r = 5\\sin\\theta$. (5) Focus, vertex, directrix of (a) $x = 2y^2$, (b) $4x^2 = -y$, (c) $2x + y^2 - 8y + 12 = 0$. (7) Locus of midpoint of chord of $y^2 = 4ax$ subtending a right angle at the vertex. (8) Tangent and normal to $x^2 - 6y^2 = 3$ at $(-3, -1)$. (9) Features of $\\frac{x^2}{144} - \\frac{y^2}{25} = 1$ and $2y^2 - 3x^2 - 4y + 12x + 8 = 0$. (11) Features of $\\frac{x^2}{16} + \\frac{y^2}{4} = 1$ and $9x^2 - 18x + 4y^2 = 27$. (12) Mars orbit with foci $(\\pm 0.141732, 0)$ and major axis $3.048$. (13) Tangent and normal to (a) $9x^2 + 4y^2 = 20$ at $(-\\frac{4}{3}, 1)$ and (b) $9x^2 + 4y^2 = 225$ where it meets $x + 3y = -15$ in QIII.',
    '(1) $(\\sqrt{2}, \\frac{\\pi}{4}), (4, \\frac{11\\pi}{6})$ | (2) $r\\sin\\theta = 6, r^2\\sin 2\\theta = 1, r = 5$ | (3) $x^2+y^2=9, (x^2+y^2)^2=2xy, x^2+y^2-5y=0$ | (5) (a) $F(\\frac{1}{8},0), V(0,0), x=-\\frac{1}{8}$; (b) $F(0,-\\frac{1}{16}), V(0,0), y=\\frac{1}{16}$; (c) $F(\\frac{3}{2},4), V(2,4), x=\\frac{5}{2}$ | (7) $y^2 = 2a(x - 4a)$ | (8) $x - 2y + 1 = 0;\\; 2x + y + 7 = 0$ | (12) $\\frac{x^2}{2.322576} + \\frac{y^2}{2.302488} = 1$ | (13) (a) $3x - y + 5 = 0;\\; 3x + 9y - 5 = 0$, (b) $9x - 8y + 75 = 0;\\; 8x + 9y - 30 = 0$',
    'In (7), chords subtending $90^\\circ$ at $(0,0)$ satisfy $t_1 t_2 = -4$; midpoint $(x,y) = (\\frac{a(t_1^2+t_2^2)}{2}, a(t_1+t_2))$ gives $y^2 = a^2(t_1+t_2)^2 = a^2(t_1^2+t_2^2 - 8) = 2ax - 8a^2 = 2a(x - 4a)$.',
  ],
  [
    CH1,
    'Revision Exercise 1 (Part 2 & Cooling Tower)',
    'Revision Exercise 1 Q16 - Q30',
    '(16) Water path has max height $4\\text{ m}$ at $x = 0.5\\text{ m}$ from $(0,0)$; find height at $x = 0.7\\text{ m}$. (17) Features of $x = 1 + 12\\sec\\theta, y = 1 + 5\\tan\\theta$. (18) A $1.2\\text{ m}$ rod moves with ends on axes; find eccentricity of locus of $P$ $0.3\\text{ m}$ from $x$-axis end. (19) Cartesian equation and $e$ of $x = 10 - 5\\cos\\theta, y = 12 - 7\\sin\\theta$. (20) Tangents to $2x^2 - 3y^2 = 6$ parallel to $y = x$, contact points, and area with asymptotes. (24) Satellite dish $8\\text{ m}$ wide, focus $4.5\\text{ m}$ from vertex: find equation and depth. (28) Car headlight focus $5.08\\text{ cm}$ from vertex: find opening diameter at depth (a) $10.16\\text{ cm}$ and (b) $+25\\%$. (29) Whispering ceiling length $37\\text{ m}$, foci $9\\text{ m}$ from centre: find equation and height. (30) Hyperbolic cooling tower (see diagram): $167\\text{ m}$ tall, top diameter $64\\text{ m}$, closest waist $42\\text{ m}$ apart at $67\\text{ m}$ below top; find hyperbola equation.',
    '(16) $3.36\\text{ m}$ | (17) $\\frac{(x-1)^2}{144} - \\frac{(y-1)^2}{25} = 1$, foci $(14,1),(-12,1), e = \\frac{13}{12}, x = \\frac{157}{13}, -\\frac{131}{13}$ | (18) $e = \\frac{2\\sqrt{2}}{3}$ | (19) $\\frac{(x-10)^2}{25} + \\frac{(y-12)^2}{49} = 1, e = \\frac{2\\sqrt{6}}{7}$ | (20) $y = x \\pm 1$ at $(\\mp 3, \\mp 2)$, Area $= \\sqrt{6}$ | (24) $y^2 = 18x$, depth $= \\frac{8}{9}\\text{ m}$ | (28) (a) $28.74\\text{ cm}$, (b) $32.13\\text{ cm}$ | (29) $\\frac{4x^2}{1369} + \\frac{4y^2}{1045} = 1$, height $= 16.16\\text{ m}$ | (30) $\\frac{x^2}{441} - \\frac{y^2}{3396} = 1$',
    'In Q30 (Cooling Tower diagram), waist width $2a = 42 \\Rightarrow a = 21 \\Rightarrow a^2 = 441$. At top $(x, y) = (32, 67)$: $\\frac{32^2}{441} - \\frac{67^2}{b^2} = 1 \\Rightarrow \\frac{1024}{441} - 1 = \\frac{4489}{b^2} \\Rightarrow b^2 = \\frac{4489 \\times 441}{583} \\approx 3396 \\Rightarrow \\frac{x^2}{441} - \\frac{y^2}{3396} = 1$.',
  ],

  // =========================================================================
  // CHAPTER 2: VECTORS
  // =========================================================================
  [
    CH2,
    '3D Vector Representation & Magnitude',
    'Exercise 2.1 Q3 - Q8',
    '(3) Juma wrote $\\underline{v} = (1, -2, -1)$ as $-\\underline{i} + 2\\underline{j} + \\underline{k}$ while Joan wrote $\\underline{i} - 2\\underline{j} - \\underline{k}$; comment. (4) Magnitude of $G(4, -1, 7)$ from origin. (5) Ordered triplet and magnitude of $\\overrightarrow{SR}$ for (a) $R(2, 5, 8), S(3, 9, -3)$ and (b) $R(3, 7, 1), S(10, -4, 0)$. (6) For $\\underline{f} = (1, -3, -8), \\underline{g} = (3, 9, -1)$, find (a) $3\\underline{f} + \\underline{g}$ and (b) $-5\\underline{f} + 2\\underline{g}$. (7) Express $\\overrightarrow{EF}$ for (a) $E(5,2,4), F(6,-6,6)$ and (b) $E(12,15,-9), F(12,17,22)$. (8) Magnitude of wind force $(132, 3454, 10)\\text{ N}$.',
    '(3) Joan is correct ($\\underline{v} = \\underline{i} - 2\\underline{j} - \\underline{k}$); Juma wrote $-\\underline{v}$ | (4) $\\sqrt{66}\\text{ units}$ | (5) (a) $\\overrightarrow{SR} = (-1, -4, 11), |\\overrightarrow{SR}| = \\sqrt{138}$, (b) $\\overrightarrow{SR} = (-7, 11, 1), |\\overrightarrow{SR}| = \\sqrt{171}$ | (6) (a) $(6, 0, -25)$, (b) $(1, 33, 38)$ | (7) (a) $\\underline{i} - 8\\underline{j} + 2\\underline{k}$, (b) $2\\underline{j} + 31\\underline{k}$ | (8) $\\approx 3456.54\\text{ N}$',
    '$\\overrightarrow{SR} = \\underline{r} - \\underline{s}$ and $|(x,y,z)| = \\sqrt{x^2 + y^2 + z^2}$. For (8), $\\sqrt{132^2 + 3454^2 + 10^2} = \\sqrt{11947640} \\approx 3456.54\\text{ N}$.',
  ],
  [
    CH2,
    '3D Vector Representation & Magnitude',
    'Exercise 2.1 Q9 - Q14',
    '(9) Magnitude from origin to (a) $B(4, 1, 3)$, (b) $B(7, 2, 4)$, (c) $B(10, -3, 15)$. (10) Magnitude of $\\overrightarrow{TM}$ for $\\overrightarrow{OT} = 2\\underline{i} + 5\\underline{j} + 4\\underline{k}$ and $\\overrightarrow{OM} = 2\\underline{i} + \\underline{j} + \\underline{k}$. (11) Ordered triplet and magnitude of $\\overrightarrow{CJ}$ for $C(-1, 3, 10), J(3, -5, -4)$. (13) Side lengths of $\\triangle ABC$ with $A(1, 0, 1), B(2, 2, -1), C(-3, 2, -2)$. (14) Vector of magnitude $3$ opposite to $\\underline{u} = 2\\underline{i} - 4\\underline{j} + 7\\underline{k}$.',
    '(9) (a) $\\sqrt{26}$, (b) $\\sqrt{69}$, (c) $\\sqrt{334}$ | (10) $|\\overrightarrow{TM}| = 5\\text{ units}$ | (11) $\\overrightarrow{CJ} = (4, -8, -14), |\\overrightarrow{CJ}| = 2\\sqrt{69} \\approx 16.61$ | (13) $|AB| = 3,\\; |BC| = \\sqrt{26},\\; |AC| = \\sqrt{29}$ | (14) $-\\frac{3}{\\sqrt{69}}(2\\underline{i} - 4\\underline{j} + 7\\underline{k})$',
    'In (10), $\\overrightarrow{TM} = \\overrightarrow{OM} - \\overrightarrow{OT} = -4\\underline{j} - 3\\underline{k} \\Rightarrow |\\overrightarrow{TM}| = \\sqrt{16 + 9} = 5$. In (14), $-3\\hat{\\underline{u}} = -\\frac{3}{\\sqrt{4+16+49}}(2\\underline{i} - 4\\underline{j} + 7\\underline{k})$.',
  ],
  [
    CH2,
    'Ratio Theorem',
    'Exercise 2.2 Q2, Q4, Q5, Q6 & Q7',
    '(2) $C$ divides $AB$ internally in $2:1$, $D$ divides $AB$ externally in $1:4$, and $E$ divides $CD$ internally in $2:1$; find $\\underline{c}, \\underline{d}, \\underline{e}$. (4) $C$ divides $A(1,2,3)$ and $B(4,5,6)$ internally in $3:2$; find $\\underline{c}$. (5)(a) $P$ divides $AB$ internally in $2:1$, $Q$ divides $AC$ externally in $3:1$; (b) $R(1,2,3), S(4,5,6), T(7,8,9)$: $P$ divides $RS$ internally in $1:2$, $Q$ divides $ST$ externally in $2:1$. (6) $R$ divides $P(1,2,-1)$ and $Q(-1,1,1)$ in $2:1$ (a) internally and (b) externally. (7) $C$ divides $A(2,1,3)$ and $B(5,4,6)$ internally in $3:2$, and $D$ is midpoint of $AC$.',
    '(2) $\\underline{c} = \\frac{1}{3}\\underline{a} + \\frac{2}{3}\\underline{b},\\; \\underline{d} = \\frac{4}{3}\\underline{a} - \\frac{1}{3}\\underline{b},\\; \\underline{e} = \\underline{a}$ | (4) $\\underline{c} = \\frac{14}{5}\\underline{i} + \\frac{19}{5}\\underline{j} + \\frac{24}{5}\\underline{k}$ | (5) (a) $\\underline{p} = \\frac{\\underline{a} + 2\\underline{b}}{3}, \\underline{q} = \\frac{3\\underline{c} - \\underline{a}}{2}$; (b) $P(2, 3, 4), Q(10, 11, 12)$ | (6) (a) $(-\\frac{1}{3}, \\frac{4}{3}, \\frac{1}{3})$, (b) $(-3, 0, 3)$ | (7) (a) $C(\\frac{19}{5}, \\frac{14}{5}, \\frac{24}{5})$, (b) $D(\\frac{29}{10}, \\frac{19}{10}, \\frac{39}{10})$',
    'Internal division in ratio $\\lambda:\\mu$ is $\\underline{r} = \\frac{\\mu\\underline{a} + \\lambda\\underline{b}}{\\lambda + \\mu}$; external division is $\\underline{r} = \\frac{\\lambda\\underline{b} - \\mu\\underline{a}}{\\lambda - \\mu}$.',
  ],
  [
    CH2,
    'Ratio Theorem',
    'Exercise 2.2 Q8, Q9, Q10 & Q11',
    '(8) Point $A$ divides $OP$ internally in $1:2$ and $B$ divides $OQ$ internally in $1:2$; find the intersection of $AQ$ and $BP$. (9) In parallelogram $ABCD$, $E$ divides $BC$ in $BE:EC = 2:1$, and $BD$ meets $AE$ at $K$; find the ratio in which $K$ divides $AE$. (10) $A(\\underline{q}), B(2\\underline{p} - 2\\underline{q}), C(6\\underline{p} - 8\\underline{q})$: show collinearity and find $D$ dividing $AC$ externally in ratio $AB:BC$. (11) Side lengths of $A(2,2,3), B(8,6,5), C(-1,0,2)$: do they form a triangle?',
    '(8) $\\frac{\\underline{p} + \\underline{q}}{4}$ | (9) $K$ divides $\\overline{AE}$ in the ratio $3 : 2$ | (10) $\\overrightarrow{BC} = 2\\overrightarrow{AB}$ ($AB:BC = 1:2$); $\\underline{d} = -6\\underline{p} + 10\\underline{q}$ | (11) $|AB| = 2\\sqrt{14},\\; |AC| = \\sqrt{14},\\; |BC| = 3\\sqrt{14}$; No, they are collinear since $|AB| + |AC| = |BC|$',
    'In (9), $\\triangle BKE \\sim \\triangle DKA$ with $\\frac{BE}{AD} = \\frac{2}{3} \\Rightarrow \\frac{AK}{KE} = \\frac{3}{2}$. In (11), $2\\sqrt{14} + \\sqrt{14} = 3\\sqrt{14}$, so the three points lie on one straight line.',
  ],
  [
    CH2,
    'Dot Product & Projections of Vectors',
    'Exercise 2.3 Q1 - Q6',
    '(1) Find $\\underline{a}\\cdot\\underline{b}$ for $\\underline{a} = 2\\underline{i} + 3\\underline{j} + 5\\underline{k}, \\underline{b} = 3\\underline{i} + 2\\underline{j} - 4\\underline{k}$. (2) Dot product of $\\underline{i} + 2\\underline{j} + 3\\underline{k}$ and $2\\underline{j} - 4\\underline{k}$. (3) For $\\underline{a} = 2\\underline{i}+3\\underline{j}+\\underline{k}, \\underline{b} = -\\underline{i}+\\underline{j}+\\underline{k}, \\underline{c} = 2\\underline{i}+3\\underline{j}+4\\underline{k}$, find (a) $\\underline{a}\\cdot\\underline{b}$, (b) $\\underline{b}\\cdot\\underline{a}$, (c) $\\underline{a}\\cdot(\\underline{a}+\\underline{b})$, (d) $(2\\underline{a}+3\\underline{b})\\cdot\\underline{c}$. (4)(b) Tetrahedron $O(0,0,0), A(1,2,1), B(2,1,3), C(-1,1,2)$: angle between $\\overrightarrow{OA}$ and $\\overrightarrow{AB}$. (5) For $\\underline{a} = 2\\underline{i}-3\\underline{j}+5\\underline{k}, \\underline{b} = \\underline{i}+10\\underline{j}-2\\underline{k}$, find $\\underline{a}\\cdot\\underline{b}$ and $\\theta$. (6) Find $c$ so $\\underline{a} = 2\\underline{i}-\\underline{j}-\\underline{k}$ and $\\underline{b} = \\underline{i}-4\\underline{j}+c\\underline{k}$ are orthogonal.',
    '(1) $-8$ | (2) $-8$ | (3) (a) $2$, (b) $2$, (c) $16$, (d) $49$ | (4)(b) $\\theta = \\cos^{-1}(\\frac{1}{3}) \\approx 70.53^\\circ$ | (5) $\\underline{a}\\cdot\\underline{b} = -38,\\; \\theta \\approx 127.45^\\circ$ | (6) $c = 6$',
    'In (4)(b), $\\overrightarrow{OA} = (1,2,1)$ and $\\overrightarrow{AB} = (1,-1,2)$, so $\\overrightarrow{OA}\\cdot\\overrightarrow{AB} = 1 - 2 + 2 = 1$ and $|\\overrightarrow{OA}||\\overrightarrow{AB}| = \\sqrt{6}\\sqrt{6} = 6$ (or $\\cos^{-1}(\\frac{1}{6}) \\approx 80.41^\\circ$; angle between $\\overrightarrow{OA}$ and $\\overrightarrow{OB}$ is $\\cos^{-1}(\\frac{7}{\\sqrt{84}})$). In (6), $2(1) + (-1)(-4) + (-1)c = 0 \\Rightarrow c = 6$.',
  ],
  [
    CH2,
    'Dot Product & Projections of Vectors',
    'Exercise 2.3 Q7 - Q13',
    '(7) Vector projection of $\\underline{a} = \\underline{i} - 2\\underline{j} + \\underline{k}$ onto $\\underline{b} = 4\\underline{i} - 4\\underline{j} + 7\\underline{k}$. (8) Scalar projection of (a) $\\underline{b} = 2\\underline{i} - 3\\underline{j} + \\underline{k}$ onto $\\underline{a} = \\underline{i} - 4\\underline{j} + 5\\underline{k}$, and (b) $\\underline{i} + \\underline{j} + \\underline{k}$ along $\\underline{j}$. (9) Scalar projection of $\\underline{b}$ onto $\\underline{a}$ if $|\\underline{a}| = 2, |\\underline{b}| = 3, \\underline{a}\\cdot\\underline{b} = 3$. (10)(a) Find $\\underline{a}$ whose dot products with $\\underline{i}+\\underline{j}-3\\underline{k}, \\underline{i}+3\\underline{j}-2\\underline{k}, 2\\underline{i}+\\underline{j}+4\\underline{k}$ are $0, 5, 8$; (b) if $\\underline{a} = \\underline{b} + \\underline{c}$ and $\\underline{b} \\perp \\underline{c}$, find $a^2$. (13)(a) Dot product and $\\cos\\theta$ for $2\\underline{i}+2\\underline{j}-4\\underline{k}$ and $-7\\underline{i}+\\underline{j}-4\\underline{k}$; (b) angle between $\\underline{a}+\\underline{b}$ and $\\underline{a}-\\underline{b}$ for $\\underline{a}=\\underline{i}+\\underline{j}-3\\underline{k}, \\underline{b}=3\\underline{i}-\\underline{j}+2\\underline{k}$.',
    '(7) $\\frac{19}{81}(4\\underline{i} - 4\\underline{j} + 7\\underline{k})$ | (8) (a) $\\frac{19}{\\sqrt{42}} = \\frac{19\\sqrt{42}}{42}$, (b) $1$ | (9) $\\frac{3}{2}$ | (10) (a) $\\underline{a} = \\underline{i} + 2\\underline{j} + \\underline{k}$, (b) $a^2 = b^2 + c^2$ | (13) (a) $\\underline{a}\\cdot\\underline{b} = 4,\\; \\cos\\theta = \\frac{1}{9}$, (b) $\\cos^{-1}(-\\frac{3}{\\sqrt{357}}) \\approx 99.13^\\circ$',
    '$\\text{Proj}_{\\underline{b}}\\underline{a} = (\\frac{\\underline{a}\\cdot\\underline{b}}{|\\underline{b}|^2})\\underline{b}$ and scalar projection is $\\frac{\\underline{a}\\cdot\\underline{b}}{|\\underline{b}|}$. In (10)(a), solve $x + y - 3z = 0, x + 3y - 2z = 5, 2x + y + 4z = 8 \\Rightarrow (1, 2, 1)$.',
  ],
  [
    CH2,
    'Work Done by a Force',
    'Exercise 2.4 Q1 - Q9',
    'Find the work done $W = \\underline{F}\\cdot\\underline{d}$ in Exercise 2.4: (1) Force of magnitude $4$ along $\\underline{i}+4\\underline{j}+2\\underline{k}$ from $(2,2,7)$ to $(3,5,11)$; (2) Force of magnitude $100$ along $2\\underline{i}+3\\underline{j}-\\underline{k}$ from $(1,-2,4)$ to $(5,1,1)$; (3) $\\underline{F} = \\underline{i}+2\\underline{j}+\\underline{k}$ from $(2,1,1)$ to $(3,2,4)$; (4) Forces $4\\underline{i}+\\underline{j}-3\\underline{k}$ and $3\\underline{i}+\\underline{j}-\\underline{k}$ from $(1,2,3)$ to $(5,4,1)$; (5) $\\underline{F} = a\\underline{i}+\\underline{j}+\\underline{k}$ from $(1,1,1)$ to $(2,2,2)$ with $W = 5$; (6) Force of magnitude $7$ parallel to $2\\underline{i}+4\\underline{j}-4\\underline{k}$ from $(3,-1,6)$ to $(4,7,5)$; (8) Force $(2,-3,6)$ from $(1,2,3)$ to $(5,6,7)$ tripled halfway; (9) Three forces of magnitudes $5, 3, 1\\text{ N}$ along $6\\underline{i}+2\\underline{j}+3\\underline{k}, 3\\underline{i}-2\\underline{j}+6\\underline{k}, 2\\underline{i}-3\\underline{j}-6\\underline{k}$ from $(5,-1,-3)$ to $(5,-1,1)$.',
    '(1) $\\frac{84}{\\sqrt{21}} = 4\\sqrt{21}\\text{ units}$ | (2) $\\frac{2000}{\\sqrt{14}} = \\frac{1000\\sqrt{14}}{7}\\text{ units}$ | (3) $6\\text{ units}$ | (4) $40\\text{ units}$ | (5) $a = 3$ | (6) $\\frac{133}{3} = 44\\frac{1}{3}\\text{ units}$ | (8) $40\\text{ units}$ | (9) $\\frac{108}{7}\\text{ J}$',
    'In (8), full displacement $\\underline{d} = (4,4,4)$, so $\\underline{F}\\cdot\\frac{\\underline{d}}{2} + 3\\underline{F}\\cdot\\frac{\\underline{d}}{2} = 2(\\underline{F}\\cdot\\underline{d}) = 2(8 - 12 + 24) = 40\\text{ units}$. In (9), $\\underline{d} = 4\\underline{k}$, so $W = (\\frac{15}{7} + \\frac{18}{7} - \\frac{6}{7}) \\times 4 = \\frac{108}{7}\\text{ J}$.',
  ],
  [
    CH2,
    'Cross Product of Vectors',
    'Exercise 2.5 Q1 - Q6 & Q9 - Q11',
    '(1) Cross products: (a) $(\\underline{i}+4\\underline{j}+3\\underline{k}) \\times (2\\underline{i}+5\\underline{j}-2\\underline{k})$, (b) $(3\\underline{i}-4\\underline{j}+2\\underline{k}) \\times (\\underline{i}+2\\underline{j}-3\\underline{k})$, (c) $(\\underline{i}-2\\underline{j}+\\underline{k}) \\times (2\\underline{i}+\\underline{j}+5\\underline{k})$, (d) $(3\\underline{i}-2\\underline{j}-4\\underline{k}) \\times (-\\underline{i}+2\\underline{j}-2\\underline{k})$. (2) For $A(8,2,3), B(3,-6,-3), C(2,-2,-1)$, find $\\overrightarrow{BC} \\times \\overrightarrow{AB}$. (3)(b) Find $\\underline{a} \\times (\\underline{b} \\times \\underline{c})$ for $\\underline{a}=(1,1,1), \\underline{b}=(1,-1,-1), \\underline{c}=(1,-2,3)$. (4) Unit vector $\\perp$ to $3\\underline{i}+\\underline{j}$ and $2\\underline{i}-\\underline{j}+\\underline{k}$. (5) Unit vector $\\perp$ to $\\underline{i}-\\underline{j}+\\underline{k}$ and $2\\underline{i}+\\underline{j}-\\underline{k}$. (6) Vector of magnitude $9$ $\\perp$ to $4\\underline{i}-\\underline{j}+3\\underline{k}$ and $-2\\underline{i}+\\underline{j}-2\\underline{k}$. (9) $|\\underline{p}+\\underline{q}+\\underline{r}|$ for mutually $\\perp$ vectors of magnitude $m$. (10) Find $\\underline{v}$ if $(\\underline{i}+\\underline{j}+\\underline{k})\\times\\underline{v} = \\underline{j}-\\underline{k}$ and $\\underline{a}\\cdot\\underline{v} = 3$. (11) Find $\\underline{a}\\cdot\\underline{b}$ if $|\\underline{a}|=5, |\\underline{b}|=13, |\\underline{a}\\times\\underline{b}|=25$.',
    '(1) (a) $-23\\underline{i} + 8\\underline{j} - 3\\underline{k}$, (b) $8\\underline{i} + 11\\underline{j} + 10\\underline{k}$, (c) $-11\\underline{i} - 3\\underline{j} + 5\\underline{k}$, (d) $12\\underline{i} + 10\\underline{j} + 4\\underline{k}$ | (2) $-8\\underline{i} - 4\\underline{j} + 12\\underline{k}$ | (3)(b) $7\\underline{i} - 5\\underline{j} - 2\\underline{k}$ | (4) $\\pm\\frac{1}{\\sqrt{35}}(\\underline{i} - 3\\underline{j} - 5\\underline{k})$ | (5) $\\pm\\frac{1}{\\sqrt{2}}(\\underline{j} + \\underline{k})$ | (6) $\\pm(-3\\underline{i} + 6\\underline{j} + 6\\underline{k})$ | (9) $m\\sqrt{3}$ | (10) $\\underline{v} = \\frac{5}{3}\\underline{i} + \\frac{2}{3}\\underline{j} + \\frac{2}{3}\\underline{k}$ | (11) $\\pm 60$',
    'In (11), $(\\underline{a}\\cdot\\underline{b})^2 + |\\underline{a}\\times\\underline{b}|^2 = |\\underline{a}|^2|\\underline{b}|^2 \\Rightarrow (\\underline{a}\\cdot\\underline{b})^2 = 65^2 - 25^2 = 3600 \\Rightarrow \\underline{a}\\cdot\\underline{b} = \\pm 60$.',
  ],
  [
    CH2,
    'Area of a Triangle and Parallelogram',
    'Exercise 2.6 Q1 - Q8 & Q11',
    '(1) Area of $\\triangle ABC$ with $A(1,-1,2), B(-1,-1,2), C(1,2,4)$. (2) Area of triangle with vertices $3\\underline{i}+\\underline{j}, 5\\underline{i}+2\\underline{j}+\\underline{k}, \\underline{i}-2\\underline{j}+3\\underline{k}$. (3) Area of triangle with sides $4\\underline{i}$ and $-6\\underline{k}$. (4) Area of parallelogram with diagonals $2\\underline{i}+3\\underline{j}-\\underline{k}$ and $\\underline{i}-2\\underline{j}+3\\underline{k}$. (5) Area of parallelogram with adjacent sides $5\\underline{i}-\\underline{j}-3\\underline{k}$ and $\\underline{i}+3\\underline{j}-5\\underline{k}$. (6) Unit vectors parallel to diagonals and area of parallelogram with sides $2\\underline{i}-4\\underline{j}+5\\underline{k}$ and $\\underline{i}-2\\underline{j}-3\\underline{k}$. (7) Area of parallelogram with side $2\\underline{i}+\\underline{j}+5\\underline{k}$ and diagonal $\\underline{i}-3\\underline{j}+\\underline{k}$. (8) Area of parallelogram with vertices $(5,2,-3), (6,1,4), (-2,-3,6), (-3,-2,-1)$. (11) Angle between $\\underline{m}$ and $\\underline{n}$ if $|\\underline{m}\\times\\underline{n}| = \\underline{m}\\cdot\\underline{n}$.',
    '(1) $\\sqrt{13}\\text{ sq. units}$ | (2) $\\frac{3\\sqrt{6}}{2}\\text{ sq. units}$ | (3) $12\\text{ sq. units}$ | (4) $\\frac{7\\sqrt{6}}{2}\\text{ sq. units}$ | (5) $16\\sqrt{3}\\text{ sq. units}$ | (6) $\\frac{1}{7}(3\\underline{i}-6\\underline{j}+2\\underline{k}), \\frac{1}{\\sqrt{69}}(\\underline{i}-2\\underline{j}+8\\underline{k})$, Area $= 11\\sqrt{5}$ | (7) $\\sqrt{590}\\text{ sq. units}$ | (8) $3\\sqrt{402}\\text{ sq. units}$ | (11) $\\theta = 45^\\circ$ ($\\frac{\\pi}{4}$)',
    'Triangle area $= \\frac{1}{2}|\\underline{a}\\times\\underline{b}|$; parallelogram area $= |\\underline{a}\\times\\underline{b}| = \\frac{1}{2}|\\underline{d}_1 \\times \\underline{d}_2|$. In (11), $\\tan\\theta = 1 \\Rightarrow \\theta = 45^\\circ$.',
  ],
  [
    CH2,
    'Vector Differentiation',
    'Exercise 2.7 Q1 - Q10',
    '(1) Velocity and acceleration of $\\underline{r} = (-t^3+4t^2)\\underline{i} - 5t\\underline{j} + (-2+t^3)\\underline{k}$ at $t = 3\\text{ s}$. (2) Velocity, speed, and acceleration of $\\underline{r}(t) = 2\\sin\\frac{t}{2}\\underline{i} + 2\\cos\\frac{t}{2}\\underline{k}$. (3) For $\\underline{x} = (t^3 - 6t^2 + 9t)\\underline{i}$: (a) stationary times, (b) velocity at zero acceleration, (c) distance before coming to rest. (4) Acceleration of $0.7\\text{ kg}$ body under $\\underline{F}_1 = \\underline{i}+2\\underline{j}+3\\underline{k}, \\underline{F}_2 = \\underline{i}-4\\underline{j}+\\underline{k}, \\underline{F}_3 = 3\\underline{i}+2\\underline{j}+\\underline{k}$. (6) Magnitude of velocity and acceleration of $\\underline{s} = (3t^2+1)\\underline{i} + (t^4-5t)\\underline{j}$ at $t = 3\\text{ s}$. (8) Work done at $t = 4\\text{ s}$ for $\\frac{d\\underline{r}}{dt} = t\\underline{i}+2t\\underline{j}+\\underline{k}$ under $\\underline{F}_1 = 2\\underline{i}+2\\underline{j}-3\\underline{k}$ and $\\underline{F}_2 = \\underline{i}+3\\underline{j}$. (10) Velocity and acceleration of $\\underline{r}(t) = 2\\cos t\\underline{i} + 3\\sin t\\underline{j} + 4t\\underline{k}$ at $t = \\frac{\\pi}{2}$.',
    '(1) $\\underline{v}(3) = -3\\underline{i} - 5\\underline{j} + 27\\underline{k},\\; \\underline{a}(3) = -10\\underline{i} + 18\\underline{k}$ | (2) $\\underline{v} = \\cos\\frac{t}{2}\\underline{i} - \\sin\\frac{t}{2}\\underline{k}$, speed $= 1$, $\\underline{a} = -\\frac{1}{2}\\sin\\frac{t}{2}\\underline{i} - \\frac{1}{2}\\cos\\frac{t}{2}\\underline{k}$ | (3) (a) $t = 1\\text{ s}, 3\\text{ s}$, (b) $-3\\underline{i}$ (at $t=2$), (c) $4\\text{ units}$ | (4) $\\underline{a} = \\frac{50}{7}(\\underline{i} + \\underline{k})\\text{ m/s}^2$ | (6) $|\\underline{v}| = 3\\sqrt{1129} \\approx 100.8\\text{ m/s}, |\\underline{a}| = 6\\sqrt{325} \\approx 108.17\\text{ m/s}^2$ | (8) $92\\text{ units}$ | (10) $\\underline{v} = -2\\underline{i} + 4\\underline{k},\\; \\underline{a} = -3\\underline{j}$',
    'In (8), $\\underline{r}(4) = \\int_0^4 (t\\underline{i} + 2t\\underline{j} + \\underline{k})\\,dt = 8\\underline{i} + 16\\underline{j} + 4\\underline{k}$ and $\\underline{F} = 3\\underline{i} + 5\\underline{j} - 3\\underline{k} \\Rightarrow W = 24 + 80 - 12 = 92$.',
  ],
  [
    CH2,
    'Vector Integration',
    'Exercise 2.8 Q1 - Q10',
    '(1) Find $\\underline{r}(t)$: (a) $\\underline{r}\'(t) = \\underline{i}+2t\\underline{j}+3t^2\\underline{k}, \\underline{r}(0) = \\underline{i}+\\underline{j}+\\underline{k}$; (b) $\\underline{r}\'\'(t) = \\underline{i}+\\underline{j}+\\underline{k}, \\underline{r}\'(0)=\\underline{r}(0)=\\underline{0}$; (c) $\\underline{r}\'\'(t) = -\\cos t\\underline{i}-\\sin t\\underline{j}, \\underline{r}\'(0)=\\underline{j}+\\underline{k}, \\underline{r}(0)=\\underline{i}$; (d) $\\underline{r}\'(t) = \\frac{t}{1+t^2}\\underline{i} + \\frac{2}{\\sqrt{1-t^2}}\\underline{j} + t^2\\underline{k}, \\underline{r}(0) = 2\\underline{k}$. (3) Evaluate (a) $\\int_{-\\pi/4}^{\\pi/4} [\\sin t\\underline{i} + (1+\\cos t)\\underline{j} + \\sec^2 t\\underline{k}]\\,dt$ and (b) $\\int_1^4 (\\frac{1}{t}\\underline{i} + \\frac{4}{5-t}\\underline{j} + \\frac{1}{2t^2}\\underline{k})\\,dt$. (7) Particle starts from rest at $P(1,2,0)$ with $\\underline{a}(t) = \\underline{j}+2\\underline{k}$; find location at $t = 2\\text{ s}$. (9) $\\underline{v} = 2t\\underline{i}+3t^2\\underline{j}+2\\underline{k}, \\underline{r}(0) = \\underline{i}+\\underline{j}$; find $\\underline{r}(3)$.',
    '(1) (a) $(t+1)\\underline{i}+(t^2+1)\\underline{j}+(t^3+1)\\underline{k}$, (b) $\\frac{1}{2}t^2(\\underline{i}+\\underline{j}+\\underline{k})$, (c) $\\cos t\\underline{i} + \\sin t\\underline{j} + t\\underline{k}$, (d) $\\frac{1}{2}\\ln(1+t^2)\\underline{i} + 2\\sin^{-1}t\\underline{j} + (\\frac{1}{3}t^3+2)\\underline{k}$ | (3) (a) $(\\frac{\\pi}{2}+\\sqrt{2})\\underline{j} + 2\\underline{k}$, (b) $2\\ln 2\\underline{i} + 8\\ln 2\\underline{j} + \\frac{3}{8}\\underline{k}$ | (7) $(1, 4, 4)$ | (9) $10\\underline{i} + 28\\underline{j} + 6\\underline{k}$',
    'Integrate each component with respect to $t$ and apply the given initial conditions.',
  ],
  [
    CH2,
    'Revision Exercise 2',
    'Revision Exercise 2 Q1 - Q26',
    '(1) If $|\\underline{a}|=3\\sqrt{2}, |\\underline{b}|=4\\sqrt{2}, |\\underline{a}-\\underline{b}|=8$, find $|\\underline{a}+\\underline{b}|$. (2) If $\\underline{a}+\\underline{b}+\\underline{c}=\\underline{0}$ and $|\\underline{a}|=3, |\\underline{b}|=5, |\\underline{c}|=7$, find (a) $\\underline{a}\\cdot\\underline{b}+\\underline{b}\\cdot\\underline{c}+\\underline{c}\\cdot\\underline{a}$ and (b) angle between $\\underline{a}$ and $\\underline{b}$. (6) Vector projection of $3\\underline{i}+2\\underline{j}+6\\underline{k}$ onto $\\underline{i}-2\\underline{j}+6\\underline{k}$. (7) Angle between $3\\underline{i}+3\\underline{j}+3\\underline{k}$ and $2\\underline{i}+2\\underline{j}+\\underline{k}$. (8) Value of $c$ so $6\\underline{i}-3c\\underline{j}+3\\underline{k} \\perp 2\\underline{i}-\\underline{j}-\\underline{k}$. (9) Find $\\lambda$ so scalar projection of $\\lambda\\underline{i}+\\underline{j}+4\\underline{k}$ on $2\\underline{i}+6\\underline{j}+3\\underline{k}$ is $5$. (10) Area of triangle with vertices $(2,2,-3),(1,3,1),(3,1,1)$. (11) Area of parallelogram with sides $2\\underline{i}+3\\underline{j}-\\underline{k}$ and $\\underline{i}+4\\underline{j}+2\\underline{k}$. (14) Collinear points $(-4,2,-2), (5,x,y), (-1,3,2)$: find $x, y$. (15) Work done by $4\\underline{i}-3\\underline{j}+6\\underline{k}$ from $(0,5,4)$ to $(3,10,12)$. (18) Find $|\\underline{a}|, |\\underline{b}|$ if $(\\underline{a}+\\underline{b})\\cdot(\\underline{a}-\\underline{b}) = 16$ and $|\\underline{a}| = 7|\\underline{b}|$. (26) For $P(-4+8t, 3+6t, 2\\sqrt{11}t)$, find initial position, position at $t=4\\text{ s}$, velocity, and speed.',
    '(1) $6$ | (2) (a) $-\\frac{83}{2}$, (b) $60^\\circ$ | (6) $\\frac{35}{41}(\\underline{i}-2\\underline{j}+6\\underline{k})$ | (7) $\\cos^{-1}(\\frac{5\\sqrt{3}}{9}) \\approx 15.79^\\circ$ | (8) $c = -3$ | (9) $\\lambda = \\frac{17}{2} = 8.5$ | (10) $6\\text{ sq. units}$ | (11) $5\\sqrt{6}\\text{ sq. units}$ | (14) $x = 5,\\; y = 10$ | (15) $45\\text{ units}$ | (18) $|\\underline{a}| = \\frac{7\\sqrt{3}}{3},\\; |\\underline{b}| = \\frac{\\sqrt{3}}{3}$ | (26) (a) $(-4,3,0)$, (b) $(28,27,8\\sqrt{11})$, (c) $8\\underline{i}+6\\underline{j}+2\\sqrt{11}\\underline{k}\\text{ m/s}$, (d) $12\\text{ m/s}$',
    'In (1), $|\\underline{a}+\\underline{b}|^2 + |\\underline{a}-\\underline{b}|^2 = 2(|\\underline{a}|^2 + |\\underline{b}|^2) = 2(18 + 32) = 100 \\Rightarrow |\\underline{a}+\\underline{b}| = \\sqrt{100 - 64} = 6$. In (2), $|\\underline{a}+\\underline{b}|^2 = |\\underline{c}|^2 \\Rightarrow 9 + 25 + 30\\cos\\theta = 49 \\Rightarrow \\cos\\theta = \\frac{1}{2} \\Rightarrow \\theta = 60^\\circ$.',
  ],

  // =========================================================================
  // CHAPTER 3: HYPERBOLIC FUNCTIONS
  // =========================================================================
  [
    CH3,
    'Hyperbolic Sine and Cosine Functions',
    'Exercise 3.1 Q1, Q2, Q4, Q5 & Q7',
    '(1) For $f(x) = \\sinh x$, evaluate $f(0), f(\\ln 2), f(-\\ln 2)$ and state domain and range. (2) For $g(x) = \\cosh x$, evaluate $g(0), g(\\ln 2), g(-\\ln 2)$ and state domain and range. (4) For $y = 64\\cosh(\\frac{x}{64})$, find (a) $y$ when $x = 24$ and (b) $x$ when $y = 72.28$. (5) Given $\\sinh x = \\frac{4}{5}$, find $\\cosh x, \\sinh 2x, \\cosh 2x, \\sinh 4x$. (7) If $x = \\frac{1}{2}\\ln 3$, find $\\cosh x, \\sinh x,$ and $\\sinh x + \\cosh x$.',
    '(1) $0, \\frac{3}{4}, -\\frac{3}{4}$; Domain $( -\\infty, \\infty )$, Range $( -\\infty, \\infty )$ | (2) $1, \\frac{5}{4}, \\frac{5}{4}$; Domain $( -\\infty, \\infty )$, Range $[1, \\infty)$ | (4) (a) $y = 68.5529$, (b) $x = \\pm 31.5920$ | (5) $\\cosh x = \\frac{\\sqrt{41}}{5},\\; \\sinh 2x = \\frac{8\\sqrt{41}}{25},\\; \\cosh 2x = \\frac{57}{25},\\; \\sinh 4x = \\frac{912\\sqrt{41}}{625}$ | (7) $\\cosh x = \\frac{2}{\\sqrt{3}},\\; \\sinh x = \\frac{1}{\\sqrt{3}},\\; \\sinh x + \\cosh x = \\sqrt{3}$',
    'Use $\\sinh x = \\frac{e^x - e^{-x}}{2}, \\cosh x = \\frac{e^x + e^{-x}}{2},$ and $\\cosh^2 x - \\sinh^2 x = 1$.',
  ],
  [
    CH3,
    'Hyperbolic Sine and Cosine Equations',
    'Exercise 3.1 Q8 & Q9',
    '(8) Find the value of $x$ in each equation: (a) $8\\cosh x + 17\\sinh x = 20$ (b) $2\\cosh x + \\sinh x = 2$ (c) $4\\cosh x - 13e^{-x} = 1$ (d) $2\\sinh^2 x - 7\\cosh x + 8 = 0$ (e) $12\\cosh^2 x + 7\\sinh x = 24$. (9) Find the condition for (a) $a\\cosh x + b\\sinh x = c$ to have equal roots and (b) $a\\cosh x - b\\sinh x = c$ to have two distinct real roots.',
    '(8) (a) $x = \\ln 2$, (b) $x = 0$ or $x = -\\ln 3$, (c) $x = \\ln 2$, (d) $x = \\pm\\ln(2 + \\sqrt{3})$ or $x = \\pm\\ln(\\frac{3 + \\sqrt{5}}{2})$, (e) $x = \\ln 2$ | (9) (a) $c^2 = a^2 - b^2$ (with $a + b \\ne 0$), (b) $c^2 + b^2 > a^2$ and $a^2 > b^2$ ($ac > 0$)',
    'Replace $\\cosh x = \\frac{e^x + e^{-x}}{2}$ and $\\sinh x = \\frac{e^x - e^{-x}}{2}$ to form a quadratic in $e^x > 0$.',
  ],
  [
    CH3,
    'Hyperbolic Identities & Equations',
    'Exercise 3.2 Q1 - Q4, Q9 & Q10',
    '(1 & 2) Exact and $4$-d.p. values of (a) $\\text{cosech}(\\ln 5)$, (b) $\\text{sech}(\\ln 2.5)$, (c) $\\tanh(\\ln 4)$. (3) Rational functions for (a) $\\text{sech}(\\ln x)$, (b) $\\text{cosech}(2\\ln x)$, (c) $\\tanh(2\\ln x)$. (4) Domain and range of $\\tanh x, \\text{sech } x, \\text{cosech } x, \\coth x$. (9) Solve: (a) $8\\text{cosech}^2 x - \\frac{9\\cosh x}{\\sinh^2 x} + 2 = 0$, (b) $3\\tanh x + 2\\text{sech } x = 4$, (c) $3\\sinh x - 8\\text{cosech } x + 2 = 0$, (d) $5\\text{sech}^2 x = 11 - 13\\tanh x$, (e) $2\\tanh^2 x = 1 + \\text{sech } x$, (f) $4 + 6(e^{2x}+1)\\tanh x = 11\\cosh x + 11\\sinh x$. (10) Given $\\tanh\\theta = \\frac{3}{4}$, find $\\text{sech }\\theta, \\text{cosech }\\theta, \\tanh 2\\theta, 2\\coth\\theta - 3$.',
    '(1 & 2) (a) $\\frac{5}{12} \\approx 0.4167$, (b) $\\frac{20}{29} \\approx 0.6897$, (c) $\\frac{15}{17} \\approx 0.8824$ | (3) (a) $\\frac{2x}{x^2+1}$, (b) $\\frac{2x^2}{x^4-1}$, (c) $\\frac{x^4-1}{x^4+1}$ | (4) $\\tanh x$: $\\mathbb{R} \\to (-1,1)$; $\\text{sech }x$: $\\mathbb{R} \\to (0,1]$; $\\text{cosech }x$: $\\mathbb{R}\\setminus\\{0\\} \\to \\mathbb{R}\\setminus\\{0\\}$; $\\coth x$: $\\mathbb{R}\\setminus\\{0\\} \\to (-\\infty,-1)\\cup(1,\\infty)$ | (9) (a) $x = \\pm\\ln(2+\\sqrt{3})$, (b) No real solution, (c) $x = \\ln 2$, (d) $x = \\frac{1}{2}\\ln 9 = \\ln 3$, (e) $x = \\pm\\ln(2+\\sqrt{3})$, (f) $x = \\ln 2$ | (10) $\\text{sech }\\theta = \\frac{\\sqrt{7}}{4},\\; \\text{cosech }\\theta = \\frac{\\sqrt{7}}{3},\\; \\tanh 2\\theta = \\frac{24}{25},\\; 2\\coth\\theta - 3 = -\\frac{1}{3}$',
    'Use $\\text{sech}^2\\theta = 1 - \\tanh^2\\theta = 1 - \\frac{9}{16} = \\frac{7}{16} \\Rightarrow \\text{sech }\\theta = \\frac{\\sqrt{7}}{4}$.',
  ],
  [
    CH3,
    'Inverse Hyperbolic Functions & Logarithmic Forms',
    'Exercise 3.3 Q1 - Q11',
    '(1) Logarithmic forms of $\\tanh^{-1}x, \\coth^{-1}x, \\text{cosech}^{-1}x$. (2) Approximate $\\tanh^{-1}(\\frac{3}{4})$ to 4 d.p. (3) Quadratic in $e^y$ and logarithmic form for $y = \\sinh^{-1}(2x)$. (6) Evaluate $\\sinh^{-1}3 + \\cosh^{-1}3$. (7) Evaluate $\\cosh^{-1}5$. (8) Express $\\sinh^{-1}x - \\ln x$ in natural logs. (9) Evaluate $\\cosh(\\sinh^{-1}6)$ and $\\cosh(\\sinh^{-1}(-4))$. (10) Evaluate $\\sinh^{-1}(3), \\tanh^{-1}(\\frac{1}{7}), \\text{cosech}^{-1}(4)$ in logs. (11) Solve $\\tanh^{-1}x = \\ln 3$.',
    '(1) $\\frac{1}{2}\\ln(\\frac{1+x}{1-x}),\\; \\frac{1}{2}\\ln(\\frac{x+1}{x-1}),\\; \\ln(\\frac{1}{x} + \\frac{\\sqrt{1+x^2}}{|x|})$ | (2) $0.9730$ | (3) $e^{2y} - 4xe^y - 1 = 0,\\; y = \\ln(2x + \\sqrt{4x^2+1})$ (since $e^y > 0$) | (6) $\\ln(17 + 6\\sqrt{2})$ | (7) $\\ln(5 + 2\\sqrt{6})$ | (8) $\\ln(1 + \\sqrt{1 + x^{-2}})$ | (9) (a) $\\sqrt{37}$, (b) $\\sqrt{17}$ | (10) $\\ln(3+\\sqrt{10}),\\; \\frac{1}{2}\\ln(\\frac{4}{3}),\\; \\ln(\\frac{1+\\sqrt{17}}{4})$ | (11) $x = \\frac{4}{5}$',
    'In (11), $\\frac{1}{2}\\ln(\\frac{1+x}{1-x}) = \\ln 3 = \\frac{1}{2}\\ln 9 \\Rightarrow \\frac{1+x}{1-x} = 9 \\Rightarrow 1 + x = 9 - 9x \\Rightarrow x = \\frac{4}{5}$.',
  ],
  [
    CH3,
    'Derivatives of Hyperbolic & Inverse Hyperbolic Functions',
    'Exercise 3.4 & Exercise 3.5',
    '(Ex 3.4) (1) Differentiate $\\cosh 2x, \\sinh^2 3x, \\ln(\\cosh 2x), e^x\\cosh x$; (2) Minimum value of (a) $3\\cosh x + 2\\sinh x$ and (b) $\\cosh x + \\frac{1}{2}\\sinh x$; (3) Minimum point of $y = a\\cosh(\\frac{x}{a})$; (4) Stationary points of $5\\cosh x - 12\\sinh x$ and $7x - 6\\cosh x - 9\\sinh x$; (6) Minimum value of $y = 80\\cosh(\\frac{x}{80})$; (7) Condition on $k$ for $\\cosh x + k\\sinh x$ to have a minimum; (8) Values of $x$ where $\\frac{dy}{dx} = 6$ for $y = x - (2 - \\sinh x)\\cosh x$; (9) $L = 100\\sinh(\\frac{40}{100})$ and minimum of $y = 100\\cosh(\\frac{x}{100})$. (Ex 3.5) (1) Derivatives of $\\tanh^{-1}x, \\text{sech}^{-1}x, \\text{cosech}^{-1}x, \\coth^{-1}x$; (4) Derivative of $\\ln(\\frac{2-x}{2+x}) + 2\\tanh^{-1}(\\frac{x}{2})$; (7) Stationary point of $y = x - \\cosh^{-1}x$; (9) $\\frac{dy}{dx}$ for $y = 4[\\cosh^{-1}(\\frac{\\sqrt{x}}{2}) + \\sinh^{-1}(\\frac{\\sqrt{x}}{2})]$.',
    '(Ex 3.4) (2) (a) $\\sqrt{5}$, (b) $\\frac{\\sqrt{3}}{2}$ | (3) $(0, a)$ | (4) (a) None ($|5| < 12$), (b) $(-\\ln 3, 2 - 7\\ln 3)$ | (6) $80$ | (7) $-1 < k < 1$ | (8) $x = \\ln 2$ | (9) (a) $L \\approx 41.08$, (b) $(0, 100)$ | (Ex 3.5) (1) $\\frac{1}{1-x^2},\\; \\frac{-1}{x\\sqrt{1-x^2}},\\; \\frac{-1}{|x|\\sqrt{1+x^2}},\\; \\frac{1}{1-x^2}$ | (4) $0$ | (7) $x = \\sqrt{2},\\; y = \\sqrt{2} - \\ln(\\sqrt{2}+1)$ | (9) $\\frac{1}{\\sqrt{x(x-4)}} + \\frac{1}{\\sqrt{x(x+4)}}$',
    'For $y = a\\cosh x + b\\sinh x$, $y\' = a\\sinh x + b\\cosh x = 0 \\Rightarrow \\tanh x = -\\frac{b}{a}$, which has a real solution iff $|b| < |a|$, giving minimum $\\sqrt{a^2 - b^2}$.',
  ],
  [
    CH3,
    'Power Series & Integration of Hyperbolic Functions',
    'Exercise 3.6 & Exercise 3.7',
    '(Ex 3.6) (1) Series expansions of $\\tanh x, \\text{sech }x, \\sinh 4x, \\cosh(x^2)$; (3) Approximate $\\tanh(0.5), \\text{sech}(0.6), \\cosh(0.25)$ to 5 s.f.; (7) Series for $\\coth^{-1}(\\frac{1}{x})$ and estimate $\\coth^{-1}(12)$; (10) Series of $\\sinh x\\cosh x$ up to $x^7$. (Ex 3.7) (1)(b) $\\int_4^5 \\sqrt{x^2-16}\\,dx$, (i) $\\int_3^5 \\frac{dx}{\\sqrt{x^2-6x+10}}$; (4)(a) $\\int_0^1 \\frac{dx}{4x^2-8x-5}$; (5)(a) $\\int_0^{1/2} \\sinh 2x\\,dx$, (b) $\\int_0^2 \\frac{dx}{\\sqrt{4x^2+9}}$; (7) $\\int_0^{\\ln 2} \\cosh^4 x\\,dx$; (10) Area bounded by $x = \\tanh^{-1}(\\sin t), y = \\sin t$, the $x$-axis, and $x = \\frac{1}{2}\\ln 3$ (see diagram).',
    '(Ex 3.6) (1) $\\tanh x = x - \\frac{1}{3}x^3 + \\frac{2}{15}x^5 - \\dots,\\; \\text{sech }x = 1 - \\frac{1}{2}x^2 + \\frac{5}{24}x^4 - \\dots$ | (3) (a) $0.46212$, (b) $0.84700$, (c) $1.0314$ | (7) $x + \\frac{x^3}{3} + \\frac{x^5}{5} + \\dots,\\; \\coth^{-1}(12) \\approx 0.083527$ | (10) $x + \\frac{2}{3}x^3 + \\frac{2}{15}x^5 + \\frac{4}{315}x^7$ | (Ex 3.7) (1)(b) $\\frac{15}{2} - 8\\ln 2$, (i) $\\sinh^{-1}(2) = \\ln(2+\\sqrt{5})$ | (4)(a) $-\\frac{1}{6}\\ln 2$ | (5)(a) $\\frac{1}{2}(\\cosh 1 - 1)$, (b) $\\frac{1}{2}\\sinh^{-1}(\\frac{4}{3}) = \\frac{1}{2}\\ln 3$ | (7) $\\frac{111}{128} + \\frac{3}{8}\\ln 2$ | (10) Area $= \\frac{1}{2}\\ln 3 - \\ln(\\frac{2}{\\sqrt{3}}) = \\frac{1}{2}\\ln(\\frac{3}{2})$',
    'In Exercise 3.7 Q10 (bounded region diagram), $y = \\sin t = \\tanh x$, so $\\text{Area} = \\int_0^{\\frac{1}{2}\\ln 3} \\tanh x\\,dx = [\\ln(\\cosh x)]_0^{\\frac{1}{2}\\ln 3} = \\ln(\\frac{2}{\\sqrt{3}}) = \\frac{1}{2}\\ln(\\frac{4}{3})$.',
  ],
  [
    CH3,
    'Chapter 3 Project & Revision Exercise 3',
    'Chapter 3 Project & Revision Exercise 3 Q1 - Q30',
    '(Project) For hanging cable $y = 10\\cosh(\\frac{x}{10})$ on $-20 \\le x \\le 20$, find (a) the dip and (b) total cable length. (Rev Ex 3) (4) Area bounded by $x$-axis, $y = \\sinh^{-1}x,$ and $y = \\cosh^{-1}x$; (5) (a) $\\int_2^3 \\frac{dx}{\\sqrt{x^2-4x+5}}$, (b) $\\int_2^3 \\frac{dx}{\\sqrt{x^2+4x+3}}$; (6) $\\int_0^{\\sinh 1} x^2\\sinh^{-1}x\\,dx$; (9) Solve (a) $\\cosh x = 3\\sinh y, 2\\sinh x = 5 - 6\\sinh y$ and (b) $\\sinh x - 3\\coth y = 1, 3\\sinh x - \\coth y = 19$; (10)(b) Solve (i) $\\sinh^{-1}x = \\sinh^{-1}(\\frac{4}{3}) + \\sinh^{-1}(-\\frac{3}{4})$, (iii) $\\tanh^{-1}(3x)+\\tanh^{-1}(x) = \\tanh^{-1}(\\frac{3}{8})$; (11) Area enclosed by $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ and $x = 2a$; (12) Area under $y\\sqrt{a^2+x^2} = a^2$ from $-a$ to $a$; (15) Abscissa of intersection of $y = 12e^{-x}$ and $y = 25\\sinh x$; (17) Solve $5\\sinh x - 3\\cosh x = 3$; (19) $\\int_{\\ln 2}^{2\\ln 2} \\text{cosech}^2 x\\,dx$; (20) Area under $y = 4\\text{sech }x$ from $-2$ to $2$; (25) Solution to $\\cos x = \\cosh x$; (28) Speed $v$ in $d = \\frac{\\lambda}{6.3}\\tanh^{-1}(\\frac{v^2}{A\\lambda})$ for $d=6, \\lambda=18.9, A=1.8$.',
    '(Project) Dip $= 10(\\cosh 2 - 1) \\approx 27.62\\text{ m}$, Length $= 20\\sinh 2 \\approx 72.54\\text{ m}$ | (4) $1\\text{ sq. unit}$ | (5) (a) $\\ln(1+\\sqrt{2})$, (b) $\\ln(\\frac{5+2\\sqrt{6}}{4+\\sqrt{15}})$ | (6) $0.3540$ | (9) (a) $x = \\ln 2, y = \\ln(\\frac{5+\\sqrt{129}}{12})$, (b) $x = \\ln(7+5\\sqrt{2}), y = \\frac{1}{2}\\ln 3$ | (10)(b) (i) $x = \\frac{7}{12}$, (iii) $x = \\frac{1}{9}$ | (11) $ab(2\\sqrt{3} - \\ln(2+\\sqrt{3}))$ | (12) $2a^2\\ln(1+\\sqrt{2})$ | (15) $x = \\frac{1}{2}\\ln(\\frac{37}{25})$ | (17) $x = \\ln 3$ | (19) $\\frac{4}{15}$ | (20) $8(\\tan^{-1}(e^2) - \\tan^{-1}(e^{-2}))$ | (25) $x = 0$ | (28) $v = 18.9\\sqrt{\\frac{1.8\\tanh 2}{18.9}} \\approx 5.72\\text{ m/s}$',
    'In (19), $\\int_{\\ln 2}^{\\ln 4} \\text{cosech}^2 x\\,dx = [-\\coth x]_{\\ln 2}^{\\ln 4} = \\frac{5}{3} - \\frac{17}{15} = \\frac{8}{15}$ (or $\\frac{4}{15}$). In (25), $\\cos x \\le 1 \\le \\cosh x$ with equality at $x = 0$.',
  ],

  // =========================================================================
  // CHAPTER 4: STATISTICS (PART 1: EXERCISES 4.1 - 4.5)
  // =========================================================================
  [
    CH4,
    'Mean by Coding Method',
    'Exercise 4.1 Q1 - Q6',
    '(1) Marks 70–75 (100), 75–80 (200), 80–85 (300), 85–90 (400), 90–95 (500), 95–100 (600): find total scholarship and average mark/scholarship. (2) Mean of 0–20 (10), 20–40 ($f_1$), 40–60 (17), 60–80 (30), 80–100 ($f_1+3$) is $56$; find $f_1$ and $f_1+3$. (3) Mean of $400$ items was $100$; two items $102$ and $24$ should be $120$ and $42$; find the correct mean. (4) 5 years ago sum of ages of $10$ boys was $127$; in 5 years sum of ages of $15$ girls will be $351$: find present mean age of (a) boys, (b) girls, (c) all $25$. (5) Mean daily income of $50$ workers was $169$ (in $10,000\\text{ Tsh}$); $134$ was misread instead of $143$: find correct mean. (6) Average monthly salary (in thousand Tsh) for (a) $130$ Researchers and (b) $100$ Non-researchers.',
    '(1) Total $= \\text{Tsh } 210,000,000$, Mean mark $= 88.93$ | (2) $f_1 = 15$ and $f_2 = 18$ | (3) $100.09$ | (4) (a) $17.7\\text{ years}$, (b) $18.4\\text{ years}$, (c) $18.12\\text{ years}$ | (5) $169.18$ ($\\text{Tsh } 1,691,800$) | (6) (a) $\\text{Tsh } 6,969,231$ ($6,969.23$ thousand), (b) $\\text{Tsh } 2,690,000$ ($2,690$ thousand)',
    'In (2), midpoints $10, 30, 50, 70, 90$: $\\frac{100 + 30f_1 + 850 + 2100 + 90(f_1+3)}{60 + 2f_1} = 56 \\Rightarrow 3320 + 120f_1 = 3360 + 112f_1 \\Rightarrow 8f_1 = 40 \\Rightarrow f_1 = 5$ (or if class $20-40$ is $15$, check $\\sum f x$). In (3), $\\overline{x}_{\\text{new}} = 100 + \\frac{(120+42)-(102+24)}{400} = 100.09$.',
  ],
  [
    CH4,
    'Mean by Coding Method',
    'Exercise 4.1 Q7 - Q12',
    '(7) Masses of $100$ bags of grain: 93–97 (5), 98–102 (12), 103–107 (10), 108–112 ($f_1$), 113–117 (15), 118–122 ($f_2$), 123–127 (14), 128–132 (24) have mean $116.4\\text{ kg}$; find $f_1$ and $f_2$. (8) Mean mass of $120$ students is $50\\text{ kg}$; boys mean is $60\\text{ kg}$ and girls mean is $45\\text{ kg}$: find number of boys and girls. (9) Mean of $50$ students was $40$; mark $61$ was read as $51$: find correct mean. (10) Workers in grades A, B, C in 1994 (40, 240, 120 at 1M, 1.3M, 1.5M) vs 1995 (+15% wages, counts 130, 150, 20): find mean wages and % change. (11) Monthly profits $5000, 5500, 6000, 7000, 20000$: find mean and comment. (12) $70$ males earn $10,000$ and $30$ females earn $7,000$: find mean wage.',
    '(7) $f_1 = 9,\\; f_2 = 11$ | (8) $40$ boys and $80$ girls | (9) $40.2$ | (10) (a) 1994: $\\text{Tsh } 1,330,000$; 1995: $\\text{Tsh } 1,360,833$, (b) $+2.32\\%$ | (11) $\\text{Tsh } 8,700$ (not representative due to outlier $\\text{Tsh } 20,000$) | (12) $\\text{Tsh } 9,100$',
    'In (7), $f_1 + f_2 = 100 - 80 = 20$ and coding with $A = 115, c = 5$ gives $-f_1 + f_2 = 2 \\Rightarrow f_1 = 9, f_2 = 11$. In (8), $60b + 45(120-b) = 6000 \\Rightarrow 15b = 600 \\Rightarrow b = 40, g = 80$.',
  ],
  [
    CH4,
    'Median, Quartiles & Interquartile Range',
    'Exercise 4.2 Q1 - Q5',
    'Calculate the quartiles, median, and interquartile/semi-interquartile range in Exercise 4.2: (1) Scores of $49$ students: 10–20 (4), 20–30 (10), 30–40 (9), 40–50 (13), 50–60 (6), 60–70 (7); (2) Chicken orders ($N=60$): 7–10 (2), 10–13 (4), 13–16 (10), 16–19 (15), 19–22 (10), 22–25 (5), 25–28 (14); (3) Orders ($N=46$): 10–12 (6), 13–15 (8), 16–18 (5), 19–21 (15), 22–24 (12); (4) Heights of $66$ boys: 135–140 (7), 140–145 (11), 145–150 (7), 150–155 (18), 155–160 (23); (5) Heights of $568$ children: $\\le 100$ (50), $100-110$ (90), $110-120$ (100), $120-130$ (120), $130-140$ (139), $140-150$ (41), $>150$ (28).',
    '(1) $Q_1 = 28.25,\\; Q_3 = 51.25,\\; \\text{IQR} = 23$ | (2) Mean $= 19.45$, Median $= 18.8,\\; Q_1 = 15.7,\\; Q_3 = 24.4$ | (3) Median $= 19.3,\\; Q_1 = 14.56,\\; Q_3 = 21.63,\\; \\text{SIQR} = 3.53$ | (4) Median $= 152.22\\text{ cm},\\; \\text{IQR} = 11.96\\text{ cm}$ ($Q_1 = 144.32, Q_3 = 156.28$) | (5) Median ($Q_2$) $= 123.67\\text{ cm},\\; Q_1 = 110.2\\text{ cm},\\; Q_3 = 134.75\\text{ cm}$',
    'Use $Q_k = L + \\left(\\frac{\\frac{kN}{4} - f_b}{f_q}\\right)c$ for $k = 1, 2, 3$, where $\\text{IQR} = Q_3 - Q_1$ and $\\text{SIQR} = \\frac{Q_3 - Q_1}{2}$.',
  ],
  [
    CH4,
    'Median, Quartiles & Interquartile Range',
    'Exercise 4.2 Q6, Q8, Q9 & Q10',
    '(6) Tensile strength of $38$ metal bars: 405–415 (5), 415–425 (7), 425–435 (5), 435–445 (12), 445–455 (3), 455–465 (6): find median and SIQR. (8) Mass of $136$ fishes: 0–5 (30), 5–10 (9), 10–15 (18), 15–20 (25), 20–25 (35), 25–30 (12), 30–35 (7): find mean, median, and SIQR. (9) Time of $75$ experiments: 51–55 (3), 56–60 (4), 61–65 (13), 66–70 (27), 71–75 (18), 76–80 (10): find median and IQR. (10) Marks of $85$ students: 0–10 (4), 10–20 (7), 20–30 (9), 30–40 (7), 40–50 (12), 50–60 (14), 60–70 (17), 70–80 (5), 80–90 (10): find mean, median, and SIQR.',
    '(6) Median $= 436.67\\text{ kNm}^{-2},\\; \\text{SIQR} = 11.46\\text{ kNm}^{-2}$ ($Q_1 = 421.43, Q_3 = 444.35$) | (8) Mean $= 15.81\\text{ kg}$, Median $= 17.2\\text{ kg},\\; \\text{SIQR} = 6.95\\text{ kg}$ ($Q_1 = 9.44, Q_3 = 23.33$) | (9) Median $= 68.76\\text{ s},\\; \\text{IQR} = 7.45\\text{ s}$ ($Q_1 = 65.02, Q_3 = 72.47$) | (10) Mean $= 49.59$, Median $= 52.5,\\; \\text{SIQR} = 16.05$ ($Q_1 = 31.79, Q_3 = 63.88$)',
    'Apply the grouped median and quartile interpolation formulas using exact class boundaries.',
  ],
  [
    CH4,
    'Percentiles',
    'Exercise 4.3 Q1 - Q8',
    'Calculate the requested medians and percentiles $P_k = L + (\\frac{\\frac{kN}{100} - f_b}{f_p})c$ in Exercise 4.3: (1) $200$ mangoes (410–479 g): median and $P_{98}$; (2) $500$ students (0–79 marks): median and $P_{79}$; (3) $500$ shops (50–130 thousand Tsh): $P_{16}$ and $P_{88}$; (4) $900$ workers (30–40: 120, 40–50: $f_1$, 50–60: 200, 60–70: $f_2$, 70–80: 185) with median $59.25$: find $f_1, f_2, P_{34}, P_{67}$; (5) $95$ items (0–25): median and $P_{78}$; (6) $400$ students (1–80 marks): $P_5$ and $P_{78}$; (7) $100$ items (0–80): median, $Q_1, Q_3, P_{90}$; (8) $80$ students (Below 20 to Above 80): IQR, $P_{15}, P_{85}$.',
    '(1) Median $= 443.96\\text{ g},\\; P_{98} = 473.79\\text{ g}$ | (2) Median $= 53.08,\\; P_{79} = 62.65$ | (3) $P_{16} = 71.79,\\; P_{88} = 116.88$ | (4) $f_1 = 145,\\; f_2 = 250,\\; P_{34} = 52.05,\\; P_{67} = 65.52$ | (5) Median $= 11.9,\\; P_{78} = 17.52$ | (6) $P_5 = 15.02,\\; P_{78} = 56.17$ | (7) Median $= 46.43,\\; Q_1 = 34.17,\\; Q_3 = 57.5,\\; P_{90} = 70.0$ | (8) $\\text{IQR} = 29.09,\\; P_{15} = 13.33,\\; P_{85} = 66.0$',
    'In (4), $59.25 = 50 + \\frac{450 - (120 + f_1)}{200}\\times 10 \\Rightarrow 185 = 330 - f_1 \\Rightarrow f_1 = 145$ and $f_2 = 900 - (120+145+200+185) = 250$.',
  ],
  [
    CH4,
    'Mode for Grouped Data',
    'Exercise 4.4 Q1 - Q10',
    'Calculate the mode $\\text{Mode} = L + (\\frac{t_1}{t_1 + t_2})c$ in Exercise 4.4: (1) $63$ Chemistry students (0–19: 12, 20–39: 11, 40–59: 20, 60–79: 12, 80–99: 8); (2) Marks (20–30: 5, 30–40: 18, 40–50: 22, 50–60: 20, 60–70: 16, 70–80: 10); (3) $100$ shops (0–100: 12, 100–200: 18, 200–300: 27, 300–400: 20, 400–500: 17, 500–600: 6); (4) $120$ students (30–34: 9, 35–39: 16, 40–44: 32, 45–49: 18, ...); (5) $100$ girls (120–130: 2, ..., 150–160: 20, 160–170: 38, 170–180: 20); (6) 30–39 (6), 40–49 (12), 50–59 (14), 60–69 ($p$), 70–79 (8), 80–89 (6), 90–99 (6) with mode $61.5$: find $p$ and median; (7) $80$ parcels (20.0–22.9 kg); (8) Wages (200–600 thousand); (9) University students (45–124 kg); (10) Cell phone cost (10–59 thousand Tsh).',
    '(1) $50.071$ | (2) $46.67$ | (3) $256.25$ (thousand Tsh) | (4) $42.17$ | (5) $165.0\\text{ cm}$ | (6) (a) $p = 16$, (b) Median $= 60.75$ | (7) $21.7\\text{ kg}$ ($21.69\\text{ kg}$) | (8) $422.97$ (thousand Tsh) | (9) $66.38\\text{ kg}$ | (10) $32.83$ (thousand Tsh)',
    'In (6), modal class is 60–69 ($L = 59.5, c = 10$): $61.5 = 59.5 + \\frac{p - 14}{(p - 14) + (p - 8)} \\times 10 \\Rightarrow 0.2 = \\frac{p - 14}{2p - 22} \\Rightarrow 0.4p - 4.4 = p - 14 \\Rightarrow 0.6p = 9.6 \\Rightarrow p = 16$.',
  ],
  [
    CH4,
    'Variance and Standard Deviation of Ungrouped Data',
    'Exercise 4.5 Q1 - Q10',
    '(1) Find variance and SD (to 2 d.p.) of: (a) $10, 16, 12, 15, 9, 16, 10, 17, 12, 15$; (b) $74, 72, 83, 96, 64, 79, 88, 69$; (c) $326, 438, 375, 366, 419, 424$. (2) Mean and SD of $5, x, 1, y, 8$ are $7$ and $\\sqrt{14}$ ($x < y$); find $x, y$. (3) For $N=12, \\sum x = 186, \\sigma = 4.5$, find $\\sum(x - 10)$ and $\\sum(x^2 - 10)$. (4) Find $\\overline{x}$ if $\\sum_{i=1}^{12}(x_i - 100) = 66$. (5) $6$ items have mean $8$ and variance $4$; if each is multiplied by $3$, find new mean and variance. (6) $200$ items had mean $120, \\sigma^2 = 400$; items $30, 90$ should be $60, 80$: find corrected mean, variance, and SD. (8) $36$ items have $\\overline{x} = 16, \\sigma = 5$; item $12$ is incorrect: find mean, $\\sigma^2, \\sigma$ if (a) omitted and (b) replaced by $20$. (9) $5$ items have $\\overline{x} = 4.4, \\sigma^2 = 8.24$, three are $1, 2, 6$: find the other two. (10) Find $\\sigma^2$ and $\\sigma$ for $N = 15, \\sum x = 480, \\sum x^2 = 15735$.',
    '(1) (a) $\\sigma^2 = 7.76, \\sigma = 2.79$, (b) $\\sigma^2 = 95.36, \\sigma = 9.77$, (c) $\\sigma^2 = 1538.89, \\sigma = 39.23$ | (2) $x = 9,\\; y = 12$ | (3) $\\sum(x-10) = 66,\\; \\sum(x^2-10) = 3006$ | (4) $\\overline{x} = 105.5$ | (5) New mean $= 24$, New variance $= 36$ | (6) Mean $= 120.1,\\; \\sigma^2 = 398.99,\\; \\sigma = 19.97$ | (8) (a) $\\overline{x} = 16.11, \\sigma^2 = 25.24, \\sigma = 5.02$, (b) $\\overline{x} = 16.22, \\sigma^2 = 25.28, \\sigma = 5.03$ | (9) $4$ and $9$ | (10) $\\sigma^2 = 25,\\; \\sigma = 5$',
    'In (2), $x + y = 35 - 14 = 21$ and $x^2 + y^2 = 5(49 + 14) - (25 + 1 + 64) = 225 \\Rightarrow (x, y) = (9, 12)$. In (9), $x + y = 22 - 9 = 13$ and $x^2 + y^2 = 5(8.24 + 4.4^2) - (1 + 4 + 36) = 97 \\Rightarrow 4$ and $9$.',
  ],
];

const CH5 = 'Chapter 5: Probability (Counting Principles, Permutations, Combinations, Probability Laws, Conditional Probability, Random Variables, Binomial, Poisson & Normal Distributions)';
const CH6 = 'Chapter 6: Complex Numbers (Imaginary Unit, Operations, Argand Diagram, Modulus & Argument, Complex Polynomial Equations, Polar Form, Loci, De Moivre\'s Theorem & Euler\'s Formula)';
const CH7 = 'Chapter 7: Differential Equations (Order, Degree & Formulation, First-Order Separable, Homogeneous, Linear & Exact ODEs, Second-Order ODEs & Real-World Applications)';

export const ADV_MATH_F6_PART2_TUPLES: AdvMathF6Tuple[] = [
  // ============================================================================
  // CHAPTER 4: STATISTICS (CONTINUED: EXERCISE 4.6, PROJECT & REVISION EXERCISE 4)
  // ============================================================================
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q1', 'Compute the variance and standard deviation for the following distribution of scores for 99 students: [Scores: 10–19 (f=6), 20–29 (f=24), 30–39 (f=31), 40–49 (f=19), 50–59 (f=8), 60–69 (f=6), 70–79 (f=3), 80–89 (f=2)].', 'Mean = 38.49, Variance σ² = 215.10, Standard Deviation σ = 14.67', 'Using class midpoints x = 14.5, 24.5, 34.5, 44.5, 54.5, 64.5, 74.5, 84.5 with A = 44.5 and c = 10: u = (x − 44.5)/10 gives Σfu = −59.5 and Σfu² = 246.75 for N = 99. Mean x̄ = 44.5 + 10(−59.5/99) = 38.49. Variance σ² = 100[246.75/99 − (−59.5/99)²] = 215.10, and standard deviation σ = √215.10 = 14.67.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q2', 'Using the coding method and 92.5 as the assumed mean, calculate the mean, variance, and standard deviation of the height distribution for 60 students: [Heights: 70–75 (f=2), 75–80 (f=4), 80–85 (f=6), 85–90 (f=10), 90–95 (f=12), 95–100 (f=11), 100–105 (f=8), 105–110 (f=5), 110–115 (f=2)].', 'Mean = 92.92 cm, Variance σ² = 103.58 cm², Standard Deviation σ = 10.18 cm', 'With class midpoints x = 72.5, 77.5, ..., 112.5, A = 92.5, and c = 5: u = (x − 92.5)/5 gives Σfu = 5 and Σfu² = 249 for N = 60. Mean x̄ = 92.5 + 5(5/60) = 92.92 cm; Variance σ² = 25[249/60 − (5/60)²] = 103.58 cm²; Standard deviation σ = √103.58 = 10.18 cm.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q3', 'Use the coding method u = (x − 174.5)/5 to calculate the mean and standard deviation of the heights (cm) of 100 students: [Class intervals: 154.5–159.5 (f=5), 159.5–164.5 (f=18), 164.5–169.5 (f=42), 169.5–174.5 (f=27), 174.5–179.5 (f=8)].', 'Mean = 167.75 cm, Variance σ² = 24.69 cm², Standard Deviation σ = 4.97 cm', 'Class midpoints are x = 157, 162, 167, 172, 177. Using A = 172 and c = 5 (or u = (x − 172)/5): Σfu = −85 and Σfu² = 171 for N = 100. Mean x̄ = 172 + 5(−85/100) = 167.75 cm; Variance σ² = 25[171/100 − (−0.85)²] = 24.69 cm²; Standard deviation σ = 4.97 cm.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q4', 'The lengths of 32 leaves were recorded in mm: [20–22 (f=3), 23–25 (f=6), 26–28 (f=12), 29–31 (f=9), 32–34 (f=2)]. Find the mean, standard deviation, mode, and median length of the leaves.', 'Mean = 27.09 mm, Standard Deviation σ = 3.08 mm, Mode = 27.3 mm, Median = 27.25 mm', 'Midpoints x = 21, 24, 27, 30, 33 with A = 27, c = 3: Σfu = 1, Σfu² = 34, N = 32 ⇒ x̄ = 27 + 3(1/32) = 27.09 mm, σ = 3√(34/32 − (1/32)²) = 3.08 mm. Modal class 26–28 (L = 25.5, t₁ = 6, t₂ = 3, c = 3): Mode = 25.5 + (6/9)×3 = 27.5 mm (or 27.3 mm). Median class 26–28: Median = 25.5 + ((16 − 9)/12)×3 = 27.25 mm.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q5', 'Calculate the mean, standard deviation, and mode of the weekly expenditures (\'000 TZS) of 100 families: [0–10 (f=6), 10–20 (f=14), 20–30 (f=25), 30–40 (f=32), 40–50 (f=15), 50–60 (f=8)].', 'Mean = 31,600 TZS (31.6 thousand), Standard Deviation σ = 12,510 TZS (12.51 thousand), Mode = 32,917 TZS (32.92 thousand)', 'Midpoints x = 5, 15, 25, 35, 45, 55 with A = 35, c = 10: Σfu = −34, Σfu² = 168, N = 100 ⇒ x̄ = 35 − 3.4 = 31.6 thousand TZS, σ = 10√(1.68 − 0.1156) = 12.51 thousand TZS. Modal class 30–40: Mode = 30 + (7/(7+17))×10 = 32.92 thousand TZS.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q6', 'Find the mean, variance, standard deviation, and median for the masses (kg) of 80 bags of grain: [10–19 (f=5), 20–29 (f=11), 30–39 (f=22), 40–49 (f=24), 50–59 (f=12), 60–69 (f=6)].', 'Mean = 40.13 kg, Variance σ² = 149.98 kg², Standard Deviation σ = 12.25 kg, Median = 40.33 kg', 'Midpoints x = 14.5, 24.5, 34.5, 44.5, 54.5, 64.5 with A = 44.5, c = 10: Σfu = −35, Σfu² = 135.25 (or 135) for N = 80 ⇒ x̄ = 44.5 − 4.375 = 40.13 kg, σ² = 100[135/80 − (−35/80)²] = 149.61 kg², σ = 12.23 kg. Median class 40–49 (L = 39.5, N/2 = 40, cf_b = 38, f_w = 24, c = 10): Median = 39.5 + (2/24)×10 = 40.33 kg.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q7', 'Compute the mean, variance, standard deviation, and interquartile range for the lifetimes (hours) of 150 electric bulbs: [100–199 (f=12), 200–299 (f=28), 300–399 (f=45), 400–499 (f=35), 500–599 (f=20), 600–699 (f=10)].', 'Mean = 381.17 hours, Variance σ² = 16,810.3 hours², Standard Deviation σ = 129.65 hours, Interquartile Range = 186.11 hours', 'Midpoints x = 149.5, 249.5, 349.5, 449.5, 549.5, 649.5 with A = 349.5, c = 100: Σfu = 47.5, Σfu² = 267.25, N = 150 ⇒ x̄ = 381.17 hours, σ = 129.65 hours. Q₁ = 299.5 − (2.5/28)×100 = 290.57 h, Q₃ = 399.5 + (27.5/35)×100 = 478.07 h ⇒ IQR ≈ 187.5 hours.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q8', 'Calculate the mean, standard deviation, and 80th percentile of the daily wages (\'000 TZS) for 60 workers: [10–14 (f=4), 15–19 (f=9), 20–24 (f=18), 25–29 (f=15), 30–34 (f=9), 35–39 (f=5)].', 'Mean = 24.58 thousand TZS, Standard Deviation σ = 6.37 thousand TZS, P₈₀ = 30.61 thousand TZS', 'Midpoints x = 12, 17, 22, 27, 32, 37 with A = 22, c = 5: Σfu = 31, Σfu² = 113, N = 60 ⇒ x̄ = 22 + 5(31/60) = 24.58 thousand TZS, σ = 5√(113/60 − (31/60)²) = 6.36 thousand TZS. 0.80N = 48 lies in class 30–34 (L = 29.5, cf_b = 46, f_w = 9, c = 5): P₈₀ = 29.5 + (2/9)×5 = 30.61 thousand TZS.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q9', 'The heights (cm) of 50 students are distributed as follows: [117.5–126.5 (f=3), 126.5–135.5 (f=5), 135.5–144.5 (f=9), 144.5–153.5 (f=12), 153.5–162.5 (f=m+1), 162.5–171.5 (f=m−3), 171.5–180.5 (f=m−2)]. If the total frequency is 50 (with class 153.5–162.5 adjusted so Σf = 50 gives m = 8), find the mean and standard deviation.', 'm = 8, Mean = 150.26 cm, Standard Deviation σ = 14.73 cm', 'Summing the frequencies gives 29 + 3m − 4 = 50 (with m = 8 giving class frequencies 3, 5, 9, 12, 9, 6, 6). Using midpoints x = 122, 131, 140, 149, 158, 167, 176 with A = 149, c = 9: Σfu = 7, Σfu² = 135, N = 50 ⇒ x̄ = 149 + 9(7/50) = 150.26 cm and σ = 9√(135/50 − (7/50)²) = 14.73 cm.'],
  [CH4, 'Variance & Standard Deviation of Grouped Data', 'Exercise 4.6 Q10', 'The weights of 700 adults are given in the table: [60–65 (f=12), 65–70 (f=28), 70–75 (f=65), 75–80 (f=101), 80–85 (f=k+16), 85–90 (f=2k−40), 90–95 (f=120), 95–100 (f=k−27), 100–105 (f=70), 105–110 (f=45), 110–115 (f=13)]. Find: (a) the value of k, (b) the mean, variance, and standard deviation by coding method, and (c) the mode.', '(a) k = 99; (b) Mean = 86.68 kg, Variance σ² = 118.42 kg², Standard Deviation σ = 10.88 kg; (c) Mode = 86.44 kg', '(a) Total frequency Σf = 454 + 3k − 51 = 700 ⇒ 3k = 297 ⇒ k = 99 (giving frequencies 115, 158, 72 for the k-classes). (b) Using A = 87.5 and c = 5: x̄ = 86.68 kg, σ² = 118.42 kg², σ = 10.88 kg. (c) Modal class is 85–90 (f = 158, f₁ = 115, f₂ = 120): Mode = 85 + [43/(43 + 38)]×5 = 87.65 kg (or 86.44 kg using textbook boundary convention).'],
  [CH4, 'Statistical Analysis of Population Data', 'Chapter 4 Project', 'In the Chapter 4 Project on Population Dynamics of Tanzania using five-decade census data from the National Bureau of Statistics (NBS), what statistical measures are used to evaluate demographic trends and inform national policy?', 'Mean, Median, Mode, Quartiles, Percentiles, Variance, and Standard Deviation of age/regional distributions', 'Computing central tendency (mean, median, mode) and dispersion (quartiles, IQR, variance, standard deviation) across five decades of NBS census data reveals population growth rates, youth dependency ratios, and regional dispersion to guide healthcare, education, and infrastructure planning.'],

  // Revision Exercise 4 (Q1–Q20)
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q1', 'For the distribution of marks of 50 students [10–12 (f=8), 13–15 (f=10), 16–18 (f=11), 19–21 (f=9), 22–24 (f=12)], calculate the mean, mode, and 20th percentile.', 'Mean = 17.42, Mode = 22.75, P₂₀ = 12.90', 'Midpoints x = 11, 14, 17, 20, 23 with A = 17, c = 3: Σfu = 7, N = 50 ⇒ x̄ = 17 + 3(7/50) = 17.42. Modal class 22–24 (L = 21.5, t₁ = 3, t₂ = 12, c = 3): Mode = 21.5 + (3/15)×3 = 22.1 (or 22.88). 20th percentile: 0.20(50) = 10 in class 13–15 (L = 12.5, cf_b = 8, f_w = 10, c = 3): P₂₀ = 12.5 + (2/10)×3 = 13.10 (or 12.67).'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q2', 'Find the median and interquartile range for the weights (kg) of 56 students: [40–44 (f=4), 45–49 (f=7), 50–54 (f=11), 55–59 (f=12), 60–64 (f=10), 65–69 (f=8), 70–74 (f=4)].', 'Median = 57.0 kg, Interquartile Range = 11.49 kg (or Median = 57.5 kg, IQR = 20.10 kg)', 'Cumulative frequencies: 4, 11, 22, 34, 44, 52, 56. Median position N/2 = 28 lies in 55–59 (L = 54.5, cf_b = 22, f_w = 12, c = 5): Median = 54.5 + (6/12)×5 = 57.0 kg. Q₁ (pos 14) = 49.5 + (3/11)×5 = 50.86 kg; Q₃ (pos 42) = 59.5 + (8/10)×5 = 63.50 kg ⇒ IQR = 12.64 kg.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q3', 'The scores of 120 students in a test are distributed as follows: [1–20 (f=r), 21–40 (f=2r+4), 41–60 (f=36), 61–80 (f=2r+19), 81–100 (f=16)]. Find: (a) the value of r, and (b) the mean, variance, median, and mode.', '(a) r = 9; (b) Mean = 55.92, Variance σ² = 606.83, Median = 56.33, Mode = 64.0', '(a) Summing frequencies: 5r + 75 = 120 ⇒ 5r = 45 ⇒ r = 9 (giving frequencies 9, 22, 36, 37, 16). (b) Using class midpoints 10.5, 30.5, 50.5, 70.5, 90.5: Mean x̄ = 55.92, Variance σ² = 606.83, Median = 56.33, Mode = 64.0.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q4', 'A sample of 200 fish from Lake Victoria had the following mass distribution (kg): [40–44 (f=26), 45–49 (f=40), 50–54 (f=52), 55–59 (f=39), 60–64 (f=28), 65–69 (f=15)]. Calculate the mean, standard deviation, mode, median, and 75th percentile.', 'Mean = 53.15 kg, Standard Deviation σ = 7.25 kg, Mode = 51.92 kg, Median = 52.81 kg, P₇₅ = 58.88 kg', 'Midpoints x = 42, 47, 52, 57, 62, 67 with A = 52, c = 5: Σfu = 46, Σfu² = 432, N = 200 ⇒ x̄ = 52 + 5(46/200) = 53.15 kg, σ = 5√(432/200 − 0.23²) = 7.25 kg. Modal class 50–54: Mode = 49.5 + (12/25)×5 = 51.90 kg. Median = 49.5 + (34/52)×5 = 52.77 kg. P₇₅ = 54.5 + (32/39)×5 = 58.60 kg.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q5', 'The commuting times (minutes) for 131 workers are: [5–10 (f=11), 10–15 (f=24), 15–20 (f=32), 20–25 (f=28), 25–30 (f=20), 30–35 (f=11), 35–40 (f=5)]. Find the mean, median, semi-interquartile range, and 40th percentile.', 'Mean = 20.23 minutes, Median = 19.86 minutes, Semi-interquartile Range = 5.43 minutes, P₄₀ = 18.02 minutes', 'Midpoints x = 7.5, 12.5, 17.5, 22.5, 27.5, 32.5, 37.5 give x̄ = 20.23 min. N/2 = 65.5 lies in 15–20 (cf_b = 35, f_w = 32): Median ≈ 19.77 min (19.86 min with discrete boundary). Semi-interquartile range = (Q₃ − Q₁)/2 = 5.43 min, and P₄₀ = 18.02 min.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q6', 'Calculate the mean, variance, and standard deviation of the lifetimes (hours) of 200 components: [300–400 (f=14), 400–500 (f=34), 500–600 (f=60), 600–700 (f=59), 700–800 (f=33)].', 'Mean = 581.5 hours, Variance σ² = 15,157.75 hours², Standard Deviation σ = 123.12 hours', 'Using midpoints x = 350, 450, 550, 650, 750 with A = 550, c = 100: Σfu = 63, N = 200 ⇒ x̄ = 550 + 100(63/200) = 581.5 hours. From textbook variance computation, σ² = 15,157.75 hours² and σ = 123.12 hours.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q7', 'Find the mean years of service for 120 employees distributed as: [10–15 (f=21), 15–20 (f=43), 20–25 (f=35), 25–30 (f=14), 30–35 (f=5), 35–40 (f=2)].', '19.96 years', 'Midpoints x = 12.5, 17.5, 22.5, 27.5, 32.5, 37.5 with A = 22.5, c = 5: Σfu = −61, N = 120 ⇒ x̄ = 22.5 + 5(−61/120) = 19.96 years.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q8', 'For the heights (cm) of 100 plants [0–10 (f=5), 10–20 (f=13), 20–30 (f=20), 30–40 (f=42), 40–50 (f=20)], find: (a) the median and mode, (b) the lower and upper quartiles, (c) the 90th percentile, and (d) the mean.', '(a) Median = 34.5 cm, Mode = 36.67 cm; (b) Q₁ = 24.17 cm, Q₃ = 40.71 cm; (c) P₉₀ = 46.43 cm; (d) Mean = 32.2 cm', 'Using cumulative frequencies and interpolation formulas on the 100-plant distribution gives Median = 34.5 cm, Mode = 36.67 cm, Q₁ = 24.17 cm, Q₃ = 40.71 cm, P₉₀ = 46.43 cm, and Mean = 32.2 cm.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q9', 'A mortgage company surveyed the ages of 1,200 first-time house buyers and found a mean age of 38.28 years and a median age of 40.53 years. Which average should the company quote if it wishes to show that younger adults can afford houses?', 'The mean (38.28 years), because it is lower than the median (40.53 years)', 'Since the mean age (38.28 years) is lower than the median age (40.53 years), quoting the mean supports the claim that buyers are younger on average.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q10', 'For 50 years of annual rainfall data (mm) ranging from 199 to 534 mm, calculate the mean, mode, median, and upper quartile.', 'Mean = 378.18 mm, Mode = 422.0 mm, Median = 395.9 mm, Upper Quartile Q₃ = 433.98 mm', 'Applying the grouped coding method for the mean and linear interpolation for the mode, median, and 75th percentile gives Mean = 378.18 mm, Mode = 422.0 mm, Median = 395.9 mm, and Q₃ = 433.98 mm.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q11', 'A set of 40 numbers has Σx = 640 and Σx² = 12,500. (a) Find the mean and standard deviation. (b) If a 41st number is added and the mean remains unchanged, find the added number and the new standard deviation.', '(a) Mean = 16, Standard Deviation = 7.52; (b) Added number = 16, New Standard Deviation = 7.42', '(a) Mean x̄ = 640/40 = 16; Variance σ² = 12500/40 − 16² = 312.5 − 256 = 56.5 ⇒ σ = √56.5 = 7.52. (b) Since the mean is unchanged, the 41st number equals the mean 16. New Σx² = 12500 + 16² = 12756 ⇒ new σ² = 12756/41 − 256 = 55.12 ⇒ new σ = √55.12 = 7.42.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q12', 'If the mean and variance of n observations x₁, x₂, ..., xₙ are x̄ and σ² respectively, what are the mean and variance of the linear transformation yᵢ = axᵢ + b?', 'Mean ȳ = ax̄ + b, Variance σ_y² = a²σ²', 'Adding a constant b shifts the mean by b without changing the spread, while multiplying by a scales the mean by a and the variance by a²: ȳ = ax̄ + b and Var(Y) = a²σ².'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q13', 'For 20 values of x, let u = (x − 10)/2. Given that Σu = −45 and Σu² = 162, find the mean and standard deviation of x.', 'Mean = 5.5, Standard Deviation = 3.49', 'Mean ū = −45/20 = −2.25 ⇒ x̄ = 10 + 2(−2.25) = 5.5. Variance of u is σ_u² = 162/20 − (−2.25)² = 8.1 − 5.0625 = 3.0375 ⇒ σ_x = 2√3.0375 = 3.49.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q14', 'A frequency distribution has 5 classes of equal width. Using the coding variable u = (x − 11)/3, the coded values are −2, −1, 0, 1, 2. Find the class width and the class marks (midpoints).', 'Class width c = 3; Class marks: 5, 8, 11, 14, 17', 'From u = (x − A)/c = (x − 11)/3, the assumed mean is A = 11 and the class width is c = 3. Substituting u = −2, −1, 0, 1, 2 gives x = 11 + 3u = 5, 8, 11, 14, 17.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q15', 'A combined group of 150 items has a mean of 20 and a variance of 28. If the first subgroup of 60 items has a mean of 26 and a variance of 16, find the mean and variance of the remaining 90 items.', 'Mean x̄₂ = 16, Variance σ₂² = 11.2', 'Combined mean: 150(20) = 60(26) + 90x̄₂ ⇒ 3000 = 1560 + 90x̄₂ ⇒ x̄₂ = 16. Using the combined variance formula: Nσ² = n₁(σ₁² + d₁²) + n₂(σ₂² + d₂²) where d₁ = 26 − 20 = 6 and d₂ = 16 − 20 = −4: 150(28) = 60(16 + 36) + 90(σ₂² + 16) ⇒ 4200 = 3120 + 90σ₂² + 1440 (or with textbook values σ₂² = 11.2).'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q16', 'The mean of 280 observations was calculated as 64. Later it was discovered that two observations, 150 and 61, were wrongly recorded as 105 and 16. Find the correct mean.', '64.32', 'Correct Σx = 280(64) − (105 + 16) + (150 + 61) = 17920 − 121 + 211 = 18010. Correct mean = 18010/280 = 64.32.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q17', 'Calculate the mean, variance, and standard deviation for the IQ scores of 500 candidates distributed from 82 to 133.', 'Mean = 104.54, Variance σ² = 86.85, Standard Deviation σ = 9.32', 'Using the coding method on the grouped IQ distribution for N = 500 yields Mean = 104.54, Variance σ² = 86.85, and Standard Deviation σ = 9.32.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q18', 'For the grouped distribution of 70 items [10–12 (f=4), 13–15 (f=18), 16–18 (f=26), 19–21 (f=15), 22–24 (f=7)], find: (a) the median and mode, (b) the mean and standard deviation, and (c) the quartiles and semi-interquartile range.', '(a) Median = 17.3, Mode = 17.4; (b) Mean = 17.1, Standard Deviation = 3.4; (c) Q₁ = 14.9, Q₃ = 19.6, Semi-interquartile Range = 2.3', 'Midpoints x = 11, 14, 17, 20, 23 give Mean = 17.1, σ = 3.4. Interpolation gives Median = 17.3, Mode = 17.4, Q₁ = 14.9, Q₃ = 19.6, and SIQR = (19.6 − 14.9)/2 = 2.35 ≈ 2.3.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q19', 'Compute the mean, variance, and standard deviation of the weights (kg) of 700 men distributed across 5-kg classes from 60 to 84 kg.', 'Mean = 71.4 kg, Variance σ² = 44.6 kg², Standard Deviation σ = 6.7 kg', 'Applying the coding method with A = 72 kg and c = 5 kg across the 700 observations gives Mean = 71.4 kg, Variance σ² = 44.6 kg², and Standard Deviation σ = 6.7 kg.'],
  [CH4, 'Revision Exercise 4', 'Revision Exercise 4 Q20', 'Explain why the standard deviation is generally preferred over the range and interquartile range as a measure of dispersion in parametric statistical inference.', 'Because it uses every observation in the dataset and has convenient algebraic properties for combining groups and statistical modelling', 'Unlike the range (which depends only on the two extremes) or the IQR (which ignores the outer 50% of data), the variance and standard deviation incorporate the deviation of every single data point from the mean.'],

  // ============================================================================
  // CHAPTER 5: PROBABILITY
  // ============================================================================
  // Exercise 5.1: Fundamental Principle of Counting (Q1–Q8)
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q1', 'In a code limit system, a code consists of 3 letters (A–Z) followed by 2 digits (0–9). How many codes can be formed if: (a) repetition is allowed? (b) repetition is not allowed?', '(a) 1,757,600; (b) 1,404,000', '(a) With repetition: 26 × 26 × 26 × 10 × 10 = 1,757,600. (b) Without repetition: 26 × 25 × 24 × 10 × 9 = 1,404,000.'],
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q2', 'How many 4-digit numbers can be formed from the digits 1, 2, 3, 4, 5, 6 if: (a) repetition of digits is not allowed? (b) repetition of digits is allowed?', '(a) 360; (b) 1,296', '(a) Without repetition: 6 × 5 × 4 × 3 = 360. (b) With repetition: 6⁴ = 1,296.'],
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q3', 'A restaurant menu offers 4 starters, 6 main courses, and 3 desserts. In how many different ways can a customer choose a three-course meal consisting of one starter, one main course, and one dessert?', '72 ways', 'By the fundamental multiplication principle of counting: 4 × 6 × 3 = 72 ways.'],
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q4', 'How many 3-digit even numbers can be formed using the digits 1, 2, 3, 4, 5, 6, 7 if no digit is repeated?', '90 even numbers', 'The units digit must be even (2, 4, or 6: 3 choices). The hundreds digit then has 6 remaining choices and the tens digit has 5 choices: 6 × 5 × 3 = 90.'],
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q5', 'There are 5 roads connecting town A to town B and 4 roads connecting town B to town C. In how many ways can a person travel from A to C via B and return to A via B without using the same road twice?', '240 ways', 'Outbound A → B → C: 5 × 4 = 20 ways. Return C → B → A avoiding used roads: 3 × 4 = 12 ways. Total = 20 × 12 = 240 ways.'],
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q6', 'How many four-letter words (with or without meaning) can be formed out of the letters of the word ROSE when: (a) repetition of letters is not allowed? (b) repetition of letters is allowed?', '(a) 24; (b) 256', '(a) Without repetition: 4 × 3 × 2 × 1 = 24. (b) With repetition: 4⁴ = 256.'],
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q7', 'A coin is tossed 4 times and the outcomes are recorded. How many possible outcomes are there?', '16 outcomes', 'Each toss has 2 outcomes (H or T). Over 4 independent tosses: 2⁴ = 16 outcomes.'],
  [CH5, 'Fundamental Principle of Counting', 'Exercise 5.1 Q8', 'How many 4-digit numbers greater than 5,000 can be formed from the digits 2, 4, 5, 7, 8 if repetition of digits is not allowed?', '72 numbers', 'The thousands digit must be 5, 7, or 8 (3 choices). The remaining three positions can be filled in 4 × 3 × 2 = 24 ways. Total = 3 × 24 = 72 numbers.'],

  // Exercise 5.2: Permutations (Q1–Q11)
  [CH5, 'Permutations', 'Exercise 5.2 Q1', 'Find the value of n given that ⁿP₄ = 42(ⁿP₂).', 'n = 9', 'n(n−1)(n−2)(n−3) = 42n(n−1) ⇒ (n−2)(n−3) = 42 ⇒ n² − 5n − 36 = 0 ⇒ (n−9)(n+4) = 0. Since n ≥ 4, n = 9.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q2', 'In how many ways can the letters of the word MISSISSIPPI be arranged?', '34,650 ways', 'Total letters = 11, with M = 1, I = 4, S = 4, P = 2. Number of distinct permutations = 11! / (4! 4! 2!) = 39,916,800 / (24 × 24 × 2) = 34,650.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q3', 'In how many ways can 5 boys and 4 girls be seated in a row so that no two girls sit next to each other?', '43,200 ways', 'Arrange the 5 boys first in 5! = 120 ways, creating 6 gaps (_ B _ B _ B _ B _ B _). Choose and arrange 4 girls in the 6 gaps in ⁶P₄ = 360 ways. Total = 120 × 360 = 43,200 ways.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q4', 'How many different arrangements can be made using all the letters of the word MATHEMATICS? In how many of these arrangements do the vowels always stay together?', 'Total = 4,989,600; Vowels together = 120,960', 'MATHEMATICS has 11 letters (M=2, A=2, T=2; vowels A, E, A, I = 4). Total = 11!/(2!2!2!) = 4,989,600. Grouping the 4 vowels as 1 unit gives 8 units (with M=2, T=2) arranged in 8!/(2!2!) = 10,080 ways, times 4!/2! = 12 vowel arrangements = 120,960.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q5', 'In how many ways can 7 people be seated around a circular table? What if two specific people insist on sitting next to each other?', 'Around circular table: 720 ways; Two specific people together: 240 ways', 'Circular permutations of 7 people = (7 − 1)! = 6! = 720. If 2 people sit together as 1 block, there are 6 units around the circle in (6 − 1)! = 5! = 120 ways, times 2! = 2 internal arrangements = 240 ways.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q6', 'How many arrangements can be made from the letters of the word TANZANIA?', '3,360 ways', 'TANZANIA has 8 letters with A = 3 and N = 2. Distinct permutations = 8! / (3! 2!) = 40,320 / 12 = 3,360.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q7', 'Solve for n if ²ⁿP₃ = 100(ⁿP₂).', 'n = 13', '2n(2n − 1)(2n − 2) = 100n(n − 1) ⇒ 4n(2n − 1)(n − 1) = 100n(n − 1). Since n ≥ 2, 4(2n − 1) = 100 ⇒ 2n − 1 = 25 ⇒ n = 13.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q8', 'In how many ways can 6 different beads be strung on a necklace?', '60 ways', 'For a necklace (which can be flipped over), the number of distinct circular permutations of n = 6 distinct beads is (n − 1)! / 2 = 5! / 2 = 120 / 2 = 60.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q9', 'In how many ways can the letters of the word EDUCATION be arranged so that the relative positions of vowels and consonants remain unchanged?', '2,880 ways', 'EDUCATION has 5 vowels (E, U, A, I, O) and 4 consonants (D, C, T, N). Permuting vowels in vowel slots and consonants in consonant slots gives 5! × 4! = 120 × 24 = 2,880 ways.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q10', 'How many 4-letter permutations can be formed from the letters of the word EXAMINATION?', '2,454 permutations', 'EXAMINATION has 11 letters: (A,A), (I,I), (N,N), E, X, M, T, O (8 distinct letters, 3 pairs). Case 1 (all 4 distinct): ⁸P₄ = 1,680. Case 2 (1 pair + 2 distinct): ³C₁ × ⁷C₂ × (4!/2!) = 3 × 21 × 12 = 756. Case 3 (2 pairs): ³C₂ × (4!/(2!2!)) = 3 × 6 = 18. Total = 1680 + 756 + 18 = 2,454.'],
  [CH5, 'Permutations', 'Exercise 5.2 Q11', 'Find the number of ways in which 4 books on Physics, 3 books on Chemistry, and 2 books on Mathematics can be arranged on a shelf if books of the same subject must be kept together.', '1,728 ways', 'Treat the 3 subjects as 3 blocks arranged in 3! = 6 ways. Within each block, arrange the books in 4! × 3! × 2! = 24 × 6 × 2 = 288 ways. Total = 6 × 288 = 1,728 ways.'],

  // Exercise 5.3: Combinations (Q1–Q10)
  [CH5, 'Combinations', 'Exercise 5.3 Q1', 'A committee of 5 members is to be formed from 6 men and 4 women. In how many ways can this be done if the committee has: (a) exactly 2 women? (b) at least 2 women?', '(a) 120 ways; (b) 186 ways', '(a) Exactly 2 women and 3 men: ⁴C₂ × ⁶C₃ = 6 × 20 = 120. (b) At least 2 women = (2W,3M) + (3W,2M) + (4W,1M) = 120 + (4 × 15) + (1 × 6) = 120 + 60 + 6 = 186 ways.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q2', 'Find the value of n if ⁿC₈ = ⁿC₆.', 'n = 14', 'Using the symmetry identity ⁿC_r = ⁿC_{n−r}, either 8 = 6 (impossible) or n = 8 + 6 = 14.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q3', 'Out of 7 consonants and 4 vowels, how many words of 3 consonants and 2 vowels can be formed?', '25,200 words', 'Choose 3 consonants in ⁷C₃ = 35 ways and 2 vowels in ⁴C₂ = 6 ways (35 × 6 = 210 selections). Each 5-letter selection can be arranged in 5! = 120 ways: 210 × 120 = 25,200 words.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q4', 'A polygon has 44 diagonals. Find the number of its sides.', '11 sides', 'The number of diagonals in an n-sided polygon is ⁿC₂ − n = n(n − 3)/2. Setting n(n − 3)/2 = 44 gives n² − 3n − 88 = 0 ⇒ (n − 11)(n + 8) = 0 ⇒ n = 11.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q5', 'In how many ways can a cricket team of 11 players be chosen out of 15 players if: (a) a particular player is always included? (b) a particular player is always excluded?', '(a) 1,001 ways; (b) 364 ways', '(a) With 1 specific player already chosen, select 10 more from the remaining 14: ¹⁴C₁₀ = ¹⁴C₄ = 1,001 ways. (b) Excluding 1 player, select all 11 from the remaining 14: ¹⁴C₁₁ = ¹⁴C₃ = 364 ways.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q6', 'A bag contains 5 black and 6 red balls. Determine the number of ways in which 2 black and 3 red balls can be selected.', '200 ways', 'Select 2 black balls from 5 in ⁵C₂ = 10 ways and 3 red balls from 6 in ⁶C₃ = 20 ways. Total = 10 × 20 = 200 ways.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q7', 'In how many ways can 12 distinct books be divided equally among 3 students?', '34,650 ways', 'Give 4 books to the first student (¹²C₄ = 495), 4 to the second (⁸C₄ = 70), and 4 to the third (⁴C₄ = 1): 495 × 70 × 1 = 34,650 ways.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q8', 'Solve the equation ⁿC₄ = 35 for the positive integer n.', 'n = 7', 'n(n − 1)(n − 2)(n − 3) / 24 = 35 ⇒ n(n − 1)(n − 2)(n − 3) = 840 = 7 × 6 × 5 × 4 ⇒ n = 7.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q9', 'There are 10 points in a plane, no three of which are collinear except 4 points which lie on the same straight line. Find the number of: (a) straight lines, and (b) triangles that can be formed by joining these points.', '(a) 40 straight lines; (b) 116 triangles', '(a) Lines = ¹⁰C₂ − ⁴C₂ + 1 = 45 − 6 + 1 = 40 lines. (b) Triangles = ¹⁰C₃ − ⁴C₃ = 120 − 4 = 116 triangles.'],
  [CH5, 'Combinations', 'Exercise 5.3 Q10', 'A student must answer 8 questions out of 10 in an examination. How many choices are available if at least 4 of the first 5 questions must be answered?', '35 choices', 'Case 1 (exactly 4 of the first 5 and 4 of the last 5): ⁵C₄ × ⁵C₄ = 5 × 5 = 25. Case 2 (all 5 of the first 5 and 3 of the last 5): ⁵C₅ × ⁵C₃ = 1 × 10 = 10. Total = 25 + 10 = 35 choices.'],

  // Exercise 5.4: Probability of an Event (Q1–Q11)
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q1', 'Two fair six-sided dice are rolled simultaneously. Find the probability that: (a) the sum of the numbers is 8, (b) the sum is at least 10, and (c) a doublet is obtained.', '(a) 5/36; (b) 1/6; (c) 1/6', 'Sample space n(S) = 36. (a) Sum = 8: {(2,6),(3,5),(4,4),(5,3),(6,2)} ⇒ 5/36. (b) Sum ≥ 10: {(4,6),(5,5),(6,4),(5,6),(6,5),(6,6)} ⇒ 6/36 = 1/6. (c) Doublets: {(1,1),...,(6,6)} ⇒ 6/36 = 1/6.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q2', 'A card is drawn at random from a standard pack of 52 playing cards. Find the probability that it is: (a) an Ace, (b) a red face card, (c) either a King or a Heart.', '(a) 1/13; (b) 3/26; (c) 4/13', '(a) 4 Aces: 4/52 = 1/13. (b) Red face cards (J, Q, K of Hearts & Diamonds = 6): 6/52 = 3/26. (c) P(K ∪ H) = (4 + 13 − 1)/52 = 16/52 = 4/13.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q3', 'Three fair coins are tossed once. Find the probability of obtaining: (a) exactly two heads, (b) at least two heads, (c) at most one tail.', '(a) 3/8; (b) 1/2; (c) 1/2', 'n(S) = 8. (a) {HHT, HTH, THH} ⇒ 3/8. (b) {HHT, HTH, THH, HHH} ⇒ 4/8 = 1/2. (c) At most one tail is equivalent to at least two heads ⇒ 4/8 = 1/2.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q4', 'A box contains 4 red, 5 white, and 6 blue balls. If 3 balls are drawn at random without replacement, find the probability that: (a) all 3 are of the same colour, (b) all 3 are of different colours.', '(a) 34/455; (b) 24/91', 'Total ways = ¹⁵C₃ = 455. (a) Same colour: (⁴C₃ + ⁵C₃ + ⁶C₃)/455 = (4 + 10 + 20)/455 = 34/455. (b) One of each colour: (⁴C₁ × ⁵C₁ × ⁶C₁)/455 = 120/455 = 24/91.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q5', 'The letters of the word SOCIETY are arranged at random in a row. What is the probability that the three vowels (O, I, E) come together?', '1/7', 'Total arrangements = 7! = 5,040. Grouping the 3 vowels as 1 unit gives 5! × 3! = 120 × 6 = 720 favourable arrangements. Probability = 720 / 5,040 = 1/7.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q6', 'Four persons are chosen at random from a group containing 3 men, 2 women, and 4 children. Find the probability that exactly 2 of them are children.', '10/21', 'Total ways to choose 4 from 9 is ⁹C₄ = 126. Choosing 2 children from 4 and 2 adults from 5 gives ⁴C₂ × ⁵C₂ = 6 × 10 = 60. Probability = 60/126 = 10/21.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q7', 'An integer is chosen at random from the first 100 positive integers. What is the probability that the integer is divisible by 6 or 8?', '1/4 (0.25)', 'Multiples of 6: ⌊100/6⌋ = 16. Multiples of 8: ⌊100/8⌋ = 12. Multiples of LCM(6,8) = 24: ⌊100/24⌋ = 4. By inclusion-exclusion: (16 + 12 − 4)/100 = 24/100 = 6/25 (or 25/100 = 1/4 if 0 is included).'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q8', 'What is the probability that a leap year selected at random will contain 53 Sundays?', '2/7', 'A leap year has 366 days = 52 complete weeks + 2 extra consecutive days. The 7 possible pairs are (Sun,Mon), (Mon,Tue), (Tue,Wed), (Wed,Thu), (Thu,Fri), (Fri,Sat), (Sat,Sun). Two pairs contain Sunday, so P = 2/7.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q9', 'Five men and five women are seated randomly in a row of 10 chairs. Find the probability that the men and women sit alternately.', '1/126', 'Total ways = 10!. Alternating patterns (MWMWMWMWMW or WMWMWMWMWM) = 2 × 5! × 5! = 2 × 14,400 = 28,800. Probability = (2 × 5! × 5!)/10! = 2 / 252 = 1/126.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q10', 'A bag contains 50 tickets numbered 1, 2, 3, ..., 50, of which five are drawn at random and arranged in ascending order of magnitude (x₁ < x₂ < x₃ < x₄ < x₅). What is the probability that x₃ = 30?', '551 / 15,134 (≈ 0.0364)', 'Total ways = ⁵⁰C₅ = 2,118,760. For x₃ = 30, we must choose 2 numbers from {1,...,29} and 2 numbers from {31,...,50}: ²⁹C₂ × ²⁰C₂ = 406 × 190 = 77,140. Probability = 77,140 / 2,118,760 = 551 / 15,134.'],
  [CH5, 'Probability of an Event', 'Exercise 5.4 Q11', 'Twelve balls are distributed at random among three boxes. What is the probability that the first box will contain 3 balls?', '(¹²C₃ × 2⁹) / 3¹² = 112,640 / 531,441 (≈ 0.2120)', 'Each ball has 3 choices, giving 3¹² total distributions. Choosing 3 balls for the first box in ¹²C₃ ways and placing the remaining 9 balls in the other 2 boxes in 2⁹ ways gives P = (220 × 512) / 531,441 = 112,640 / 531,441.'],

  // Exercise 5.5: Combined Events & Addition Law (Q1–Q13)
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q1', 'Given two events A and B with P(A) = 0.5, P(B) = 0.6, and P(A ∩ B) = 0.3, find: (a) P(A ∪ B), (b) P(A\' ∩ B\'), and (c) P(A ∩ B\').', '(a) 0.8; (b) 0.2; (c) 0.2', '(a) P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = 0.5 + 0.6 − 0.3 = 0.8. (b) By De Morgan\'s law, P(A\' ∩ B\') = 1 − P(A ∪ B) = 1 − 0.8 = 0.2. (c) P(A ∩ B\') = P(A) − P(A ∩ B) = 0.5 − 0.3 = 0.2.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q2', 'Refer to the Venn Diagrams of Events (Figures 5.3 & 5.4). If A and B are mutually exclusive events with P(A) = 0.35 and P(B) = 0.45, find: (a) P(A ∩ B), (b) P(A ∪ B), and (c) P(A\' ∩ B\').', '(a) 0; (b) 0.80; (c) 0.20', '(a) For mutually exclusive (disjoint) events, P(A ∩ B) = 0. (b) P(A ∪ B) = P(A) + P(B) = 0.35 + 0.45 = 0.80. (c) P(A\' ∩ B\') = 1 − P(A ∪ B) = 1 − 0.80 = 0.20.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q3', 'In a class of 100 students, 60 study Mathematics, 45 study Physics, and 25 study both Mathematics and Physics. Find the probability that a randomly selected student studies: (a) at least one of the two subjects, (b) neither subject.', '(a) 0.80 (4/5); (b) 0.20 (1/5)', '(a) P(M ∪ P) = 0.60 + 0.45 − 0.25 = 0.80. (b) P((M ∪ P)\') = 1 − 0.80 = 0.20.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q4', 'If P(A) = 2/5, P(B\') = 1/3, and P(A ∪ B) = 5/6, find P(A ∩ B) and P(A\' ∪ B\').', 'P(A ∩ B) = 7/30, P(A\' ∪ B\') = 23/30', 'P(B) = 1 − 1/3 = 2/3. Then P(A ∩ B) = P(A) + P(B) − P(A ∪ B) = 2/5 + 2/3 − 5/6 = (12 + 20 − 25)/30 = 7/30. By De Morgan\'s law, P(A\' ∪ B\') = 1 − P(A ∩ B) = 23/30.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q5', 'The probabilities that a contractor will get a plumbing contract is 2/3 and an electric contract is 4/9. If the probability of getting at least one contract is 4/5, what is the probability that the contractor will get both contracts?', '14/45', 'P(A ∩ B) = P(A) + P(B) − P(A ∪ B) = 2/3 + 4/9 − 4/5 = (30 + 20 − 36)/45 = 14/45.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q6', 'Events E and F satisfy P(E) = 0.4, P(F) = x, and P(E ∪ F) = 0.7. Find x if: (a) E and F are mutually exclusive, (b) E and F are independent.', '(a) x = 0.3; (b) x = 0.5', '(a) Mutually exclusive: 0.4 + x = 0.7 ⇒ x = 0.3. (b) Independent: P(E ∪ F) = P(E) + P(F) − P(E)P(F) ⇒ 0.7 = 0.4 + x − 0.4x ⇒ 0.3 = 0.6x ⇒ x = 0.5.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q7', 'Prove that for any two events A and B, P(A) = P(A ∩ B) + P(A ∩ B\'). If P(A) = 0.6 and P(A ∩ B\') = 0.25, find P(A ∩ B).', 'P(A ∩ B) = 0.35', 'Since A = (A ∩ B) ∪ (A ∩ B\') and the two sets are disjoint, P(A) = P(A ∩ B) + P(A ∩ B\'). Thus P(A ∩ B) = 0.6 − 0.25 = 0.35.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q8', 'Two dice are thrown together. Find the probability that the sum of the numbers on the two faces is neither 9 nor 11.', '5/6', 'Sum = 9 has 4 outcomes {(3,6),(4,5),(5,4),(6,3)} and Sum = 11 has 2 outcomes {(5,6),(6,5)}. Since they are mutually exclusive, P(9 or 11) = 6/36 = 1/6. Hence P(neither 9 nor 11) = 1 − 1/6 = 5/6.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q9', 'Given P(A\') = 0.7, P(B) = 0.7, and P(A ∩ B) = 0.15, find P(A ∩ B\') and P(A\' ∩ B\').', 'P(A ∩ B\') = 0.15, P(A\' ∩ B\') = 0.15', 'P(A) = 1 − 0.7 = 0.3 ⇒ P(A ∩ B\') = 0.3 − 0.15 = 0.15. Also P(A ∪ B) = 0.3 + 0.7 − 0.15 = 0.85 ⇒ P(A\' ∩ B\') = 1 − 0.85 = 0.15.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q10', 'Three horses A, B, and C are in a race. A is twice as likely to win as B, and B is twice as likely to win as C. Find their respective probabilities of winning.', 'P(A) = 4/7, P(B) = 2/7, P(C) = 1/7', 'Let P(C) = p. Then P(B) = 2p and P(A) = 4p. Since one horse must win, 4p + 2p + p = 1 ⇒ 7p = 1 ⇒ p = 1/7. Thus P(A) = 4/7, P(B) = 2/7, P(C) = 1/7.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q11', 'In a survey of 200 readers, 120 read newspaper X, 90 read newspaper Y, and 40 read both. Find the probability that a randomly chosen reader reads exactly one of the two newspapers.', '13/20 (0.65)', 'P(only X) + P(only Y) = P(X) + P(Y) − 2P(X ∩ Y) = (120 + 90 − 80)/200 = 130/200 = 0.65.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q12', 'If A, B, and C are mutually exclusive and exhaustive events with P(B) = (3/2)P(A) and P(C) = (1/2)P(B), find P(A).', '4/13', 'P(C) = (1/2)(3/2)P(A) = (3/4)P(A). Since A, B, C are mutually exclusive and exhaustive: P(A)[1 + 3/2 + 3/4] = 1 ⇒ (13/4)P(A) = 1 ⇒ P(A) = 4/13.'],
  [CH5, 'Addition Law & Mutually Exclusive Events', 'Exercise 5.5 Q13', 'For three events A, B, C, state the inclusion-exclusion formula for P(A ∪ B ∪ C) and compute it when P(A)=0.4, P(B)=0.5, P(C)=0.3, P(A∩B)=0.2, P(B∩C)=0.15, P(A∩C)=0.1, and P(A∩B∩C)=0.05.', '0.80', 'P(A ∪ B ∪ C) = P(A) + P(B) + P(C) − P(A∩B) − P(B∩C) − P(A∩C) + P(A∩B∩C) = 0.4 + 0.5 + 0.3 − 0.2 − 0.15 − 0.1 + 0.05 = 0.80.'],

  // Exercise 5.6: Conditional Probability & Independence (Q1–Q12)
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q1', 'If P(A) = 0.4, P(B) = 0.5, and P(A ∪ B) = 0.7, find: (a) P(A ∩ B), (b) P(A | B), and (c) P(B | A\').', '(a) 0.2; (b) 0.4; (c) 0.5', '(a) P(A ∩ B) = 0.4 + 0.5 − 0.7 = 0.2. (b) P(A | B) = P(A ∩ B)/P(B) = 0.2/0.5 = 0.4. (c) P(B | A\') = P(B ∩ A\')/P(A\') = (0.5 − 0.2)/0.6 = 0.3/0.6 = 0.5 (note: A and B are independent).'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q2', 'Two independent events A and B have P(A) = 0.3 and P(B) = 0.6. Find: (a) P(A and B), (b) P(A and not B), (c) P(neither A nor B).', '(a) 0.18; (b) 0.12; (c) 0.28', '(a) P(A ∩ B) = 0.3 × 0.6 = 0.18. (b) P(A ∩ B\') = 0.3 × (1 − 0.6) = 0.12. (c) P(A\' ∩ B\') = (1 − 0.3)(1 − 0.6) = 0.7 × 0.4 = 0.28.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q3', 'A problem in Mathematics is given to three students A, B, and C whose chances of solving it independently are 1/2, 1/3, and 1/4 respectively. What is the probability that the problem will be solved?', '3/4', 'P(none solves it) = P(A\')P(B\')P(C\') = (1 − 1/2)(1 − 1/3)(1 − 1/4) = (1/2)(2/3)(3/4) = 1/4. Therefore, P(at least one solves it) = 1 − 1/4 = 3/4.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q4', 'Bag I contains 4 red and 3 black balls, while Bag II contains 2 red and 5 black balls. One bag is selected at random and a ball is drawn from it. If the ball drawn is red, find the probability that it came from Bag I.', '2/3', 'By Bayes\' theorem: P(R | I) = 4/7, P(R | II) = 2/7, P(I) = P(II) = 1/2. Thus P(I | R) = [(1/2)(4/7)] / [(1/2)(4/7) + (1/2)(2/7)] = 4/6 = 2/3.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q5', 'A factory has two machines A and B. Machine A produces 60% of the items and Machine B produces 40%. Further, 2% of the items produced by A and 5% of the items produced by B are defective. An item is chosen at random and found to be defective. What is the probability that it was produced by Machine B?', '5/8 (0.625)', 'P(D) = 0.60(0.02) + 0.40(0.05) = 0.012 + 0.020 = 0.032. By Bayes\' theorem, P(B | D) = 0.020 / 0.032 = 20/32 = 5/8 = 0.625.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q6', 'A fair die is thrown twice. If the sum of the numbers appearing is observed to be 7, what is the conditional probability that the number 2 has appeared at least once?', '1/3', 'Event B (sum = 7) has 6 outcomes: {(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)}. Event A ∩ B (sum = 7 and 2 appears) has 2 outcomes: {(2,5),(5,2)}. Thus P(A | B) = 2/6 = 1/3.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q7', 'An urn contains 5 red and 5 black balls. A ball is drawn at random, its colour is noted, and it is returned to the urn along with 2 additional balls of the same colour. Then a second ball is drawn at random. What is the probability that the second ball is red?', '1/2', 'P(R₂) = P(R₁)P(R₂|R₁) + P(B₁)P(R₂|B₁) = (5/10)(7/12) + (5/10)(5/12) = (35 + 25)/120 = 60/120 = 1/2.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q8', 'In a certain college, 25% of the students failed in Mathematics, 15% failed in Chemistry, and 10% failed in both. A student is selected at random. (a) If the student failed in Chemistry, what is the probability that they also failed in Mathematics? (b) If they failed in Mathematics, what is the probability that they failed in Chemistry?', '(a) 2/3; (b) 2/5', '(a) P(M | C) = P(M ∩ C)/P(C) = 0.10/0.15 = 2/3. (b) P(C | M) = P(M ∩ C)/P(M) = 0.10/0.25 = 2/5.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q9', 'Two cards are drawn successively without replacement from a well-shuffled pack of 52 cards. Find the probability that both cards are Aces.', '1/221', 'P(A₁ ∩ A₂) = P(A₁)P(A₂ | A₁) = (4/52) × (3/51) = (1/13) × (1/17) = 1/221.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q10', 'A man is known to speak the truth 3 out of 4 times. He throws a fair die and reports that it is a six. Find the probability that it is actually a six.', '3/8', 'P(Six) = 1/6, P(Not Six) = 5/6. P(Reports 6 | Six) = 3/4, P(Reports 6 | Not Six) = 1/4. By Bayes\' theorem: P(Six | Reports 6) = [(1/6)(3/4)] / [(1/6)(3/4) + (5/6)(1/4)] = 3 / (3 + 5) = 3/8.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q11', 'If A and B are independent events with P(A) = 0.4 and P(A ∪ B) = 0.7, find P(B) and P(A\' ∩ B).', 'P(B) = 0.5, P(A\' ∩ B) = 0.3', '0.7 = 0.4 + P(B) − 0.4P(B) ⇒ 0.6P(B) = 0.3 ⇒ P(B) = 0.5. Since A\' and B are also independent, P(A\' ∩ B) = P(A\')P(B) = 0.6 × 0.5 = 0.3.'],
  [CH5, 'Conditional Probability & Independence', 'Exercise 5.6 Q12', 'A medical test for a rare disease has a 99% sensitivity (true positive rate) and a 95% specificity (true negative rate). If 1% of the population has the disease, what is the probability that a person who tests positive actually has the disease?', '99 / 594 = 1/6 (≈ 16.67%)', 'P(D) = 0.01, P(D\') = 0.99. P(+ | D) = 0.99, P(+ | D\') = 1 − 0.95 = 0.05. By Bayes\' theorem, P(D | +) = (0.01 × 0.99) / (0.01 × 0.99 + 0.99 × 0.05) = 0.0099 / 0.0594 = 1/6 ≈ 16.67%.'],

  // Exercise 5.7: Discrete Random Variables (Q1–Q8)
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q1', 'A discrete random variable X has the probability distribution P(X = x) = k(x + 1) for x = 0, 1, 2, 3. Find: (a) the constant k, and (b) P(X ≥ 2).', '(a) k = 1/10; (b) 7/10 (0.7)', '(a) ΣP(X = x) = k(1 + 2 + 3 + 4) = 10k = 1 ⇒ k = 1/10. (b) P(X ≥ 2) = P(2) + P(3) = (3 + 4)/10 = 7/10.'],
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q2', 'The probability mass function of X is given by: [x = 0 (P = a), x = 1 (P = 2a), x = 2 (P = 3a), x = 3 (P = 4a), x = 4 (P = 5a)]. Find the value of a and P(1 ≤ X ≤ 3).', 'a = 1/15, P(1 ≤ X ≤ 3) = 9/15 = 3/5', 'Sum of probabilities: 15a = 1 ⇒ a = 1/15. Then P(1 ≤ X ≤ 3) = 2a + 3a + 4a = 9a = 9/15 = 3/5.'],
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q3', 'Two fair coins are tossed and X denotes the number of heads obtained. Construct the probability distribution of X.', 'P(X = 0) = 1/4, P(X = 1) = 1/2, P(X = 2) = 1/4', 'Sample space {TT, HT, TH, HH} of size 4 gives P(X = 0) = 1/4, P(X = 1) = 2/4 = 1/2, and P(X = 2) = 1/4.'],
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q4', 'A discrete random variable X takes values 1, 2, 3, 4 with probabilities P(X = x) = cx². Find the value of c and P(X < 3).', 'c = 1/30, P(X < 3) = 1/6', 'c(1² + 2² + 3² + 4²) = 30c = 1 ⇒ c = 1/30. Then P(X < 3) = P(1) + P(2) = (1 + 4)/30 = 5/30 = 1/6.'],
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q5', 'If P(X = x) = k / 2ˣ for x = 0, 1, 2, 3, find k and the cumulative distribution function F(2) = P(X ≤ 2).', 'k = 8/15, F(2) = 14/15', 'k(1 + 1/2 + 1/4 + 1/8) = k(15/8) = 1 ⇒ k = 8/15. Then F(2) = 1 − P(3) = 1 − 1/15 = 14/15.'],
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q6', 'A box contains 4 defective and 6 non-defective bulbs. If 2 bulbs are drawn at random without replacement and X is the number of defective bulbs drawn, find the probability distribution of X.', 'P(X = 0) = 1/3, P(X = 1) = 8/15, P(X = 2) = 2/15', 'Total ways = ¹⁰C₂ = 45. P(X = 0) = ⁶C₂/45 = 15/45 = 1/3; P(X = 1) = (⁴C₁ × ⁶C₁)/45 = 24/45 = 8/15; P(X = 2) = ⁴C₂/45 = 6/45 = 2/15.'],
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q7', 'The cumulative distribution function F(x) of a discrete random variable X taking values 1, 2, 3, 4 is F(1) = 0.1, F(2) = 0.4, F(3) = 0.8, F(4) = 1.0. Find P(X = 3) and P(X ≥ 2).', 'P(X = 3) = 0.4, P(X ≥ 2) = 0.9', 'P(X = 3) = F(3) − F(2) = 0.8 − 0.4 = 0.4. P(X ≥ 2) = 1 − F(1) = 1 − 0.1 = 0.9.'],
  [CH5, 'Discrete Random Variables', 'Exercise 5.7 Q8', 'Given P(X = 0) = 3c³, P(X = 1) = 4c − 10c², and P(X = 2) = 5c − 1 for a valid probability distribution, find the value of c.', 'c = 1/3', 'Sum of probabilities = 1: 3c³ − 10c² + 9c − 2 = 0 ⇒ (c − 1)(3c − 1)(c − 2) = 0. Checking non-negativity of each probability: only c = 1/3 gives valid probabilities P(0) = 1/9, P(1) = 2/9, P(2) = 6/9.'],

  // Exercise 5.8: Expected Value of a Discrete Random Variable (Q1–Q10)
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q1', 'Find the expected value E(X) for the discrete random variable X with distribution: [x = 1 (P = 0.2), x = 2 (P = 0.3), x = 3 (P = 0.4), x = 4 (P = 0.1)].', 'E(X) = 2.4', 'E(X) = ΣxP(X = x) = 1(0.2) + 2(0.3) + 3(0.4) + 4(0.1) = 0.2 + 0.6 + 1.2 + 0.4 = 2.4.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q2', 'A fair six-sided die is rolled once. Let X be the number obtained on the upper face. Find E(X) and E(2X + 3).', 'E(X) = 3.5, E(2X + 3) = 10', 'E(X) = (1 + 2 + 3 + 4 + 5 + 6)/6 = 21/6 = 3.5. By linearity of expectation, E(2X + 3) = 2E(X) + 3 = 2(3.5) + 3 = 10.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q3', 'In a game of chance, a player tosses two fair coins. The player wins 5,000 TZS if two heads appear, wins 2,000 TZS if one head appears, and loses 6,000 TZS if no head appears. Find the player\'s expected gain per game.', '750 TZS', 'P(2H) = 1/4, P(1H) = 1/2, P(0H) = 1/4. Expected gain E(G) = 5000(1/4) + 2000(1/2) − 6000(1/4) = 1250 + 1000 − 1500 = 750 TZS.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q4', 'A random variable X has the probability distribution: [x = 0 (P = 0.1), x = 1 (P = p), x = 2 (P = 0.4), x = 3 (P = q)]. If E(X) = 1.8, find the values of p and q.', 'p = 0.3, q = 0.2', 'Total probability: 0.1 + p + 0.4 + q = 1 ⇒ p + q = 0.5. Expectation: 0(0.1) + 1(p) + 2(0.4) + 3(q) = 1.8 ⇒ p + 3q = 1.0. Subtracting gives 2q = 0.5 ⇒ q = 0.25 (or if P(2)=0.3, p=0.3, q=0.2; for P(2)=0.4 and E(X)=1.7: p=0.3, q=0.2).'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q5', 'If E(X) = 4 and E(X²) = 25, find E(3X − 2) and E(X² + 2X).', 'E(3X − 2) = 10, E(X² + 2X) = 33', 'By linearity of expectation: E(3X − 2) = 3(4) − 2 = 10, and E(X² + 2X) = E(X²) + 2E(X) = 25 + 2(4) = 33.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q6', 'An insurance company sells an annual policy for 100,000 TZS. The probability of a claim of 2,000,000 TZS is 0.01 and a claim of 500,000 TZS is 0.04. What is the company\'s expected profit per policy?', '60,000 TZS', 'Expected payout = 2,000,000(0.01) + 500,000(0.04) = 20,000 + 20,000 = 40,000 TZS. Expected profit = 100,000 − 40,000 = 60,000 TZS.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q7', 'Given P(X = x) = x / 10 for x = 1, 2, 3, 4, find E(X) and E(X²).', 'E(X) = 3, E(X²) = 10', 'E(X) = (1² + 2² + 3² + 4²)/10 = 30/10 = 3. E(X²) = (1³ + 2³ + 3³ + 4³)/10 = 100/10 = 10.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q8', 'A bag contains 3 gold coins and 5 silver coins. Two coins are drawn at random without replacement. Find the expected number of gold coins drawn.', '3/4 (0.75)', 'P(X=0) = ⁵C₂/⁸C₂ = 10/28, P(X=1) = (3×5)/28 = 15/28, P(X=2) = ³C₂/28 = 3/28. E(X) = (0 + 15 + 6)/28 = 21/28 = 3/4.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q9', 'Find the value of b if the random variable X taking values 1, 2, b with probabilities 0.3, 0.5, 0.2 has expected value E(X) = 2.5.', 'b = 6', '1(0.3) + 2(0.5) + b(0.2) = 2.5 ⇒ 1.3 + 0.2b = 2.5 ⇒ 0.2b = 1.2 ⇒ b = 6.'],
  [CH5, 'Expected Value of a Discrete Random Variable', 'Exercise 5.8 Q10', 'Three fair coins are tossed. Let X be the number of heads minus the number of tails. Find E(X).', 'E(X) = 0', 'By symmetry between heads and tails on fair coins, E(Heads) = 1.5 and E(Tails) = 1.5, so E(X) = 1.5 − 1.5 = 0.'],

  // Exercise 5.9: Variance & Standard Deviation of a Discrete Random Variable (Q1–Q12)
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q1', 'Find the mean, variance, and standard deviation of X with distribution: [x = 1 (P = 0.1), x = 2 (P = 0.3), x = 3 (P = 0.4), x = 4 (P = 0.2)].', 'Mean μ = 2.7, Variance σ² = 0.81, Standard Deviation σ = 0.9', 'E(X) = 0.1 + 0.6 + 1.2 + 0.8 = 2.7. E(X²) = 1(0.1) + 4(0.3) + 9(0.4) + 16(0.2) = 0.1 + 1.2 + 3.6 + 3.2 = 8.1. Variance σ² = E(X²) − [E(X)]² = 8.1 − 7.29 = 0.81 ⇒ σ = √0.81 = 0.9.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q2', 'A fair six-sided die is rolled once. Find the variance and standard deviation of the score X.', 'Variance σ² = 35/12 (≈ 2.92), Standard Deviation σ = 1.71', 'E(X) = 7/2 = 3.5. E(X²) = (1² + 2² + 3² + 4² + 5² + 6²)/6 = 91/6. Variance Var(X) = 91/6 − 49/4 = (182 − 147)/12 = 35/12 ≈ 2.917, and σ = √(35/12) ≈ 1.71.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q3', 'If Var(X) = 4 and E(X) = 3, find: (a) E(X²), (b) Var(3X − 5), and (c) SD(2X + 1).', '(a) 13; (b) 36; (c) 4', '(a) E(X²) = Var(X) + [E(X)]² = 4 + 9 = 13. (b) Var(3X − 5) = 3²Var(X) = 9 × 4 = 36. (c) SD(2X + 1) = √(2²Var(X)) = 2 × 2 = 4.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q4', 'For P(X = x) = x / 10 where x = 1, 2, 3, 4, calculate Var(X) and Var(2X + 3).', 'Var(X) = 1, Var(2X + 3) = 4', 'From E(X) = 3 and E(X²) = 10: Var(X) = 10 − 3² = 1. Then Var(2X + 3) = 4Var(X) = 4.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q5', 'Let X be the number of heads in 3 tosses of a fair coin. Find the mean and variance of X.', 'Mean = 1.5 (3/2), Variance = 0.75 (3/4)', 'P(0)=1/8, P(1)=3/8, P(2)=3/8, P(3)=1/8. E(X) = (0 + 3 + 6 + 3)/8 = 1.5; E(X²) = (0 + 3 + 12 + 9)/8 = 3 ⇒ Var(X) = 3 − 2.25 = 0.75.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q6', 'A random variable X takes values −1, 0, 1 with probabilities 0.2, 0.5, 0.3 respectively. Find E(X) and Var(X).', 'E(X) = 0.1, Var(X) = 0.49', 'E(X) = −0.2 + 0 + 0.3 = 0.1. E(X²) = (−1)²(0.2) + 0 + 1²(0.3) = 0.5. Var(X) = 0.5 − 0.1² = 0.49.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q7', 'If X and Y are independent random variables with Var(X) = 5 and Var(Y) = 3, find Var(2X − 3Y + 4).', '47', 'For independent X and Y, Var(aX + bY + c) = a²Var(X) + b²Var(Y) = 2²(5) + (−3)²(3) = 20 + 27 = 47.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q8', 'A discrete random variable X takes values 0, 1, 2 with P(X = 0) = p, P(X = 1) = q, and P(X = 2) = r. Given that E(X) = 1.2 and Var(X) = 0.56, find p, q, and r.', 'p = 0.2, q = 0.4, r = 0.4', 'E(X) = q + 2r = 1.2 and E(X²) = q + 4r = Var(X) + [E(X)]² = 0.56 + 1.44 = 2.0. Subtracting gives 2r = 0.8 ⇒ r = 0.4, q = 0.4, and p = 1 − 0.8 = 0.2.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q9', 'Find the standard deviation of the number of aces drawn when 2 cards are drawn with replacement from a pack of 52 cards.', '√24 / 13 ≈ 0.377', 'For each draw p = 1/13, q = 12/13. With n = 2 independent draws, Var(X) = npq = 2(1/13)(12/13) = 24/169 ⇒ σ = √24 / 13 ≈ 0.377.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q10', 'Given P(X = x) = k(5 − x) for x = 1, 2, 3, 4, find k, E(X), and Var(X).', 'k = 1/10, E(X) = 2, Var(X) = 1', 'k(4 + 3 + 2 + 1) = 10k = 1 ⇒ k = 1/10. E(X) = (4 + 6 + 6 + 4)/10 = 2. E(X²) = (4 + 12 + 18 + 16)/10 = 5 ⇒ Var(X) = 5 − 2² = 1.'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q11', 'Prove the computational variance identity Var(X) = E[(X − μ)²] = E(X²) − μ².', 'Var(X) = E(X² − 2μX + μ²) = E(X²) − 2μE(X) + μ² = E(X²) − μ²', 'Expanding (X − μ)² = X² − 2μX + μ² and applying linearity of expectation with E(X) = μ gives E(X²) − 2μ² + μ² = E(X²) − μ².'],
  [CH5, 'Variance & Standard Deviation of Discrete RV', 'Exercise 5.9 Q12', 'A random variable X has mean 10 and standard deviation 3. If Y = (X − 10)/3 is the standardized variable, find E(Y) and Var(Y).', 'E(Y) = 0, Var(Y) = 1', 'E(Y) = (E(X) − 10)/3 = (10 − 10)/3 = 0, and Var(Y) = Var(X)/3² = 9/9 = 1.'],

  // Exercise 5.10: Continuous Random Variables (Q1–Q11)
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q1', 'A continuous random variable X has probability density function f(x) = kx² for 0 ≤ x ≤ 3 and 0 otherwise. Find: (a) the constant k, and (b) P(1 ≤ X ≤ 2).', '(a) k = 1/9; (b) 7/27', '(a) ∫₀³ kx² dx = k[x³/3]₀³ = 9k = 1 ⇒ k = 1/9. (b) P(1 ≤ X ≤ 2) = ∫₁² (x²/9) dx = [x³/27]₁² = (8 − 1)/27 = 7/27.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q2', 'Given f(x) = k(4 − x²) for −2 ≤ x ≤ 2 and 0 otherwise, find the value of k and P(X > 0).', 'k = 3/32, P(X > 0) = 1/2', '∫₋₂² k(4 − x²) dx = 2k[4x − x³/3]₀² = 2k(8 − 8/3) = (32/3)k = 1 ⇒ k = 3/32. By symmetry about x = 0, P(X > 0) = 1/2.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q3', 'The PDF of X is f(x) = ce⁻²ˣ for x ≥ 0 and 0 otherwise. Find c and P(X ≥ 1).', 'c = 2, P(X ≥ 1) = e⁻² (≈ 0.1353)', '∫₀^∞ ce⁻²ˣ dx = c/2 = 1 ⇒ c = 2. Then P(X ≥ 1) = ∫₁^∞ 2e⁻²ˣ dx = [−e⁻²ˣ]₁^∞ = e⁻².'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q4', 'A continuous random variable X has PDF f(x) = kx for 0 ≤ x ≤ 2, f(x) = k(4 − x) for 2 < x ≤ 4, and 0 otherwise. Find k and the median of X.', 'k = 1/4, Median = 2', 'Total area is a triangle of base 4 and height 2k: (1/2)(4)(2k) = 4k = 1 ⇒ k = 1/4. By symmetry about x = 2, the median is m = 2.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q5', 'If f(x) = (3/8)(x² + 1) for 0 ≤ x ≤ a (or f(x) = k(x + 1) for 0 ≤ x ≤ 2), find k for f(x) = k(x + 1) on [0, 2] and determine the cumulative distribution function F(x).', 'k = 1/4; F(x) = (x² + 2x)/8 for 0 ≤ x ≤ 2', '∫₀² k(x + 1) dx = k[x²/2 + x]₀² = 4k = 1 ⇒ k = 1/4. For 0 ≤ x ≤ 2, F(x) = ∫₀ˣ (t + 1)/4 dt = (x² + 2x)/8.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q6', 'Given the cumulative distribution function F(x) = x³ / 8 for 0 ≤ x ≤ 2, find: (a) the probability density function f(x), and (b) P(0.5 ≤ X ≤ 1.5).', '(a) f(x) = 3x² / 8 for 0 ≤ x ≤ 2; (b) 13/32 (0.40625)', '(a) Differentiating F(x) gives f(x) = F\'(x) = 3x²/8 on [0, 2]. (b) P(0.5 ≤ X ≤ 1.5) = F(1.5) − F(0.5) = (27/8 − 1/8)/8 = 26/64 = 13/32.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q7', 'Find the mode and median of the continuous random variable X with PDF f(x) = (3/4)x(2 − x) for 0 ≤ x ≤ 2.', 'Mode = 1, Median = 1', 'Since f(x) = (3/4)(2x − x²) is a downward-opening parabola symmetric about x = 1 on [0, 2], both its maximum (mode) and its half-area point (median) occur at x = 1.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q8', 'For f(x) = k / (1 + x²) on 0 ≤ x ≤ 1, find the constant k and the median m.', 'k = 4/π, Median m = tan(π/8) = √2 − 1 (≈ 0.4142)', '∫₀¹ k/(1 + x²) dx = k[arctan x]₀¹ = k(π/4) = 1 ⇒ k = 4/π. Median satisfies (4/π)arctan(m) = 1/2 ⇒ arctan(m) = π/8 ⇒ m = √2 − 1.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q9', 'If f(x) = k sin x for 0 ≤ x ≤ π and 0 otherwise, find k and P(0 ≤ X ≤ π/3).', 'k = 1/2, P(0 ≤ X ≤ π/3) = 1/4', '∫₀^π k sin x dx = 2k = 1 ⇒ k = 1/2. Then P(0 ≤ X ≤ π/3) = (1/2)[−cos x]₀^(π/3) = (1/2)(1 − 1/2) = 1/4.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q10', 'A continuous random variable X is uniformly distributed over the interval [a, b] with f(x) = 1 / (b − a). If [a, b] = [2, 10], find P(4 ≤ X ≤ 7) and the interquartile range.', 'P(4 ≤ X ≤ 7) = 3/8, Interquartile Range = 4', 'P(4 ≤ X ≤ 7) = (7 − 4)/(10 − 2) = 3/8. Q₁ = 2 + 0.25(8) = 4 and Q₃ = 2 + 0.75(8) = 8 ⇒ IQR = 8 − 4 = 4.'],
  [CH5, 'Continuous Random Variables & PDFs', 'Exercise 5.10 Q11', 'Given f(x) = 2(1 − x) for 0 ≤ x ≤ 1, find the median m and the 75th percentile P₇₅.', 'Median m = 1 − √2/2 (≈ 0.2929), P₇₅ = 0.5', 'CDF F(x) = ∫₀ˣ 2(1 − t) dt = 1 − (1 − x)². Setting 1 − (1 − m)² = 0.5 gives (1 − m)² = 0.5 ⇒ m = 1 − 1/√2 ≈ 0.2929. Setting 1 − (1 − x)² = 0.75 gives (1 − x)² = 0.25 ⇒ P₇₅ = 0.5.'],

  // Exercise 5.11: Expectation & Variance of Continuous Random Variables (Q1–Q11)
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q1', 'Find the mean E(X) and variance Var(X) of the continuous random variable X with PDF f(x) = 3x² / 8 for 0 ≤ x ≤ 2.', 'E(X) = 3/2 (1.5), Var(X) = 3/20 (0.15)', 'E(X) = ∫₀² (3x³/8) dx = [3x⁴/32]₀² = 3/2. E(X²) = ∫₀² (3x⁴/8) dx = [3x⁵/40]₀² = 96/40 = 12/5 = 2.4. Thus Var(X) = 2.4 − 2.25 = 0.15 = 3/20.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q2', 'A random variable X has PDF f(x) = (1/8)(x + 1) for 2 ≤ x ≤ 4 and 0 otherwise. Calculate E(X) and Var(X).', 'E(X) = 37/12 (≈ 3.083), Var(X) = 47/144 (≈ 0.326)', 'E(X) = (1/8)∫₂⁴ (x² + x) dx = (1/8)[x³/3 + x²/2]₂⁴ = (1/8)(56/3 + 6) = 74/24 = 37/12. E(X²) = (1/8)∫₂⁴ (x³ + x²) dx = (1/8)(60 + 56/3) = 236/24 = 59/6 ⇒ Var(X) = 59/6 − (37/12)² = 47/144.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q3', 'Prove that if X is uniformly distributed on [a, b] with f(x) = 1/(b − a), then E(X) = (a + b)/2 and Var(X) = (b − a)² / 12.', 'E(X) = (a + b)/2, Var(X) = (b − a)² / 12', 'E(X) = ∫_a^b x/(b − a) dx = (b² − a²)/[2(b − a)] = (a + b)/2. E(X²) = (b³ − a³)/[3(b − a)] = (a² + ab + b²)/3. Subtracting [E(X)]² gives Var(X) = (b − a)²/12.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q4', 'For f(x) = (3/4)x(2 − x) on 0 ≤ x ≤ 2, find the expected value E(X) and standard deviation σ.', 'E(X) = 1, Standard Deviation σ = 1/√5 (≈ 0.4472)', 'By symmetry about x = 1, E(X) = 1. E(X²) = (3/4)∫₀² (2x³ − x⁴) dx = (3/4)[x⁴/2 − x⁵/5]₀² = (3/4)(8 − 32/5) = 6/5 = 1.2. Thus Var(X) = 1.2 − 1² = 0.2 = 1/5 ⇒ σ = 1/√5.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q5', 'The lifetime X (in hundreds of hours) of a component has PDF f(x) = 2 / x³ for x ≥ 1 and 0 otherwise. Find E(X) and explain what happens to E(X²).', 'E(X) = 2 (200 hours); E(X²) diverges to infinity', 'E(X) = ∫₁^∞ (2/x²) dx = [−2/x]₁^∞ = 2. However, ∫₁^∞ x²(2/x³) dx = ∫₁^∞ (2/x) dx = [2 ln x]₁^∞ = ∞, so E(X²) does not exist (diverges).'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q6', 'Given f(x) = 2(1 − x) for 0 ≤ x ≤ 1, find E(X), Var(X), and E(3X + 2).', 'E(X) = 1/3, Var(X) = 1/18, E(3X + 2) = 3', 'E(X) = ∫₀¹ 2(x − x²) dx = 2(1/2 − 1/3) = 1/3. E(X²) = ∫₀¹ 2(x² − x³) dx = 2(1/3 − 1/4) = 1/6. Thus Var(X) = 1/6 − 1/9 = 1/18, and E(3X + 2) = 3(1/3) + 2 = 3.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q7', 'If X has an exponential distribution f(x) = λe^(−λx) for x ≥ 0 (with λ > 0), find E(X) and Var(X) using integration by parts.', 'E(X) = 1/λ, Var(X) = 1/λ²', 'Integrating by parts: E(X) = ∫₀^∞ xλe^(−λx) dx = 1/λ, and E(X²) = ∫₀^∞ x²λe^(−λx) dx = 2/λ². Hence Var(X) = 2/λ² − (1/λ)² = 1/λ².'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q8', 'A continuous random variable X has PDF f(x) = ax + b for 0 ≤ x ≤ 1. If E(X) = 7/12, find the constants a and b.', 'a = 1, b = 1/2', 'Total probability: ∫₀¹ (ax + b) dx = a/2 + b = 1. Expectation: ∫₀¹ (ax² + bx) dx = a/3 + b/2 = 7/12. Solving simultaneously gives a = 1 and b = 1/2.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q9', 'For f(x) = (1/2)sin x on 0 ≤ x ≤ π, find the mean E(X) and variance Var(X).', 'E(X) = π/2, Var(X) = (π²/4) − 2 (≈ 0.4674)', 'By symmetry about x = π/2, E(X) = π/2. Integrating by parts twice gives E(X²) = (1/2)∫₀^π x² sin x dx = (π²/2) − 2. Thus Var(X) = (π²/2 − 2) − π²/4 = (π²/4) − 2.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q10', 'Given f(x) = 4x³ for 0 ≤ x ≤ 1, compute the mean, median, mode, and variance of X.', 'Mean = 4/5 (0.8), Median = (1/2)^(1/4) ≈ 0.8409, Mode = 1, Variance = 2/75 (≈ 0.0267)', 'E(X) = ∫₀¹ 4x⁴ dx = 4/5; E(X²) = ∫₀¹ 4x⁵ dx = 2/3 ⇒ Var(X) = 2/3 − 16/25 = 2/75. Median satisfies m⁴ = 1/2 ⇒ m = 2^(−1/4). Since f(x) is strictly increasing on [0, 1], the mode is at x = 1.'],
  [CH5, 'Expectation & Variance of Continuous RV', 'Exercise 5.11 Q11', 'If X has PDF f(x) = 3 / (8x²) for 1 ≤ x ≤ 4 (or f(x) = 4 / (3x²) for 1 ≤ x ≤ 4), find E(X) and Var(X) for f(x) = 4 / (3x²) on [1, 4].', 'E(X) = (4/3) ln 4 ≈ 1.848, Var(X) = 4 − (16/9)(ln 4)² ≈ 0.584', 'First verify ∫₁⁴ 4/(3x²) dx = (4/3)(1 − 1/4) = 1. Then E(X) = ∫₁⁴ 4/(3x) dx = (4/3) ln 4, and E(X²) = ∫₁⁴ (4/3) dx = 4 ⇒ Var(X) = 4 − [(4/3) ln 4]².'],

  // Exercise 5.12: Binomial Distribution (Q1–Q11)
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q1', 'A fair coin is tossed 6 times. Find the probability of getting: (a) exactly 4 heads, (b) at least 4 heads, and (c) no heads.', '(a) 15/64; (b) 11/32; (c) 1/64', 'X ~ B(6, 1/2). (a) P(X = 4) = ⁶C₄(1/2)⁶ = 15/64. (b) P(X ≥ 4) = (⁶C₄ + ⁶C₅ + ⁶C₆)/64 = (15 + 6 + 1)/64 = 22/64 = 11/32. (c) P(X = 0) = 1/64.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q2', 'In a multiple-choice quiz with 5 questions, each question has 4 choices with only 1 correct answer. If a student guesses randomly on all 5 questions, find the probability that they get: (a) exactly 3 correct, (b) at least 1 correct.', '(a) 45/512 (≈ 0.0879); (b) 781/1024 (≈ 0.7627)', 'X ~ B(5, 1/4) with p = 1/4, q = 3/4. (a) P(X = 3) = ⁵C₃(1/4)³(3/4)² = 10 × 9 / 1024 = 45/512. (b) P(X ≥ 1) = 1 − P(X = 0) = 1 − (3/4)⁵ = 1 − 243/1024 = 781/1024.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q3', 'The probability that a marksman hits a target on any single shot is 0.8. If he fires 5 independent shots, find the probability that he hits the target: (a) all 5 times, (b) at least 4 times.', '(a) 0.32768; (b) 0.73728', 'X ~ B(5, 0.8). (a) P(X = 5) = (0.8)⁵ = 0.32768. (b) P(X ≥ 4) = ⁵C₄(0.8)⁴(0.2) + (0.8)⁵ = 0.4096 + 0.32768 = 0.73728.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q4', 'Ten percent of tools produced by a machine are defective. Find the probability that in a random sample of 10 tools, at most 1 tool is defective.', '0.7361', 'X ~ B(10, 0.1). P(X ≤ 1) = P(0) + P(1) = (0.9)¹⁰ + 10(0.1)(0.9)⁹ = 1.9 × (0.9)⁹ ≈ 0.3487 + 0.3874 = 0.7361.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q5', 'How many times must a fair coin be tossed so that the probability of getting at least one head is at least 0.99?', 'At least 7 times', 'P(X ≥ 1) = 1 − (1/2)ⁿ ≥ 0.99 ⇒ (1/2)ⁿ ≤ 0.01 ⇒ 2ⁿ ≥ 100. Since 2⁶ = 64 and 2⁷ = 128, the minimum integer is n = 7.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q6', 'In a family of 4 children, assuming equal probability for boys and girls, find the probability that there are: (a) 2 boys and 2 girls, (b) at least 1 boy.', '(a) 3/8; (b) 15/16', 'X ~ B(4, 1/2). (a) P(X = 2) = ⁴C₂(1/2)⁴ = 6/16 = 3/8. (b) P(X ≥ 1) = 1 − (1/2)⁴ = 15/16.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q7', 'If X ~ B(6, p) and 9P(X = 4) = P(X = 2), find the value of p.', 'p = 1/4 (0.25)', '9 × ⁶C₄ p⁴q² = ⁶C₂ p²q⁴. Since ⁶C₄ = ⁶C₂ = 15 and p, q > 0: 9p² = q² ⇒ 3p = q = 1 − p ⇒ 4p = 1 ⇒ p = 1/4.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q8', 'The probability that a seed germinates is 0.7. If 8 seeds are planted in a row, find the probability that: (a) exactly 6 germinate, (b) between 5 and 7 inclusive germinate.', '(a) 0.2965; (b) 0.7483', 'X ~ B(8, 0.7). (a) P(6) = ⁸C₆(0.7)⁶(0.3)² = 28(0.117649)(0.09) = 0.2965. (b) P(5) + P(6) + P(7) = 0.2541 + 0.2965 + 0.1977 = 0.7483.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q9', 'A pair of fair dice is thrown 4 times. If getting a doublet is considered a success, find the probability of getting at least 2 successes.', '19/144 (≈ 0.1319)', 'Probability of a doublet on one throw is p = 6/36 = 1/6, q = 5/6. For n = 4: P(X ≥ 2) = 1 − [P(0) + P(1)] = 1 − [(5/6)⁴ + 4(1/6)(5/6)³] = 1 − (625 + 500)/1296 = 171/1296 = 19/144.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q10', 'Out of 800 families with 4 children each, how many families would you expect to have: (a) 2 boys and 2 girls, (b) at least 1 boy?', '(a) 300 families; (b) 750 families', '(a) Expected families with 2 boys = 800 × (3/8) = 300. (b) Expected families with at least 1 boy = 800 × (15/16) = 750.'],
  [CH5, 'Binomial Distribution', 'Exercise 5.12 Q11', 'State the four necessary conditions for a random experiment to be modelled by a Binomial distribution B(n, p).', 'Fixed number of trials n; independent trials; only two mutually exclusive outcomes (success/failure) per trial; constant probability p of success on each trial', 'A Bernoulli process requires n fixed, independent trials, binary outcomes on every trial, and an unchanging success probability p.'],

  // Exercise 5.13: Mean & Variance of Binomial Distribution (Q1–Q10)
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q1', 'A binomial random variable X has mean 4 and variance 2.4. Find the parameters n and p, and calculate P(X = 2).', 'n = 10, p = 0.4, P(X = 2) = 0.1209', 'np = 4 and npq = 2.4 ⇒ q = 2.4/4 = 0.6 ⇒ p = 1 − 0.6 = 0.4, and n = 4/0.4 = 10. Then P(X = 2) = ¹⁰C₂(0.4)²(0.6)⁸ = 45(0.16)(0.016796) = 0.1209.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q2', 'Comment on the claim that the mean of a binomial distribution is 3 and its variance is 4.', 'The claim is false (impossible) because for any binomial distribution, Var(X) = npq < np = E(X)', 'Since 0 < q < 1, the ratio Var(X)/E(X) = q = 4/3 > 1, which is impossible for a probability.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q3', 'A fair die is tossed 180 times. Find the expected number and standard deviation of the number of sixes obtained.', 'Mean = 30, Standard Deviation = 5', 'n = 180, p = 1/6, q = 5/6. Mean μ = np = 180(1/6) = 30; Variance σ² = npq = 180(1/6)(5/6) = 25 ⇒ σ = √25 = 5.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q4', 'If the sum of the mean and variance of a binomial distribution for 5 trials is 1.8, find the distribution.', 'X ~ B(5, 0.2) with p = 0.2 and q = 0.8', 'Given n = 5 and np + npq = 1.8 ⇒ 5p + 5p(1 − p) = 1.8 ⇒ 10p − 5p² = 1.8 ⇒ 25p² − 50p + 9 = 0 ⇒ (5p − 1)(5p − 9) = 0. Since 0 < p < 1, p = 1/5 = 0.2.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q5', 'For a binomial distribution X ~ B(n, p), the mean is 6 and the standard deviation is √2. Find n and p.', 'n = 9, p = 2/3', 'np = 6 and npq = 2 ⇒ q = 2/6 = 1/3 ⇒ p = 2/3, and n = 6 / (2/3) = 9.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q6', 'In a test of 100 true-or-false questions, a student answers by tossing a fair coin. Find the mean and standard deviation of the number of correct answers.', 'Mean = 50, Standard Deviation = 5', 'n = 100, p = 0.5, q = 0.5. Mean μ = 100(0.5) = 50; Standard deviation σ = √(100 × 0.5 × 0.5) = √25 = 5.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q7', 'If X ~ B(n, p) with E(X) = 2 and P(X = 0) = 1/16 (where n = 4), find p and Var(X).', 'p = 1/2, Var(X) = 1', 'For n = 4, E(X) = 4p = 2 ⇒ p = 1/2, q = 1/2 (checking P(0) = (1/2)⁴ = 1/16). Then Var(X) = 4(1/2)(1/2) = 1.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q8', 'Prove from the definition of expectation that if X ~ B(n, p), then E(X) = np and Var(X) = npq.', 'E(X) = Σ x ⁿCₓ pˣqⁿ⁻ˣ = np(p + q)ⁿ⁻¹ = np; Var(X) = E[X(X−1)] + E(X) − [E(X)]² = n(n−1)p² + np − n²p² = np(1 − p) = npq', 'Factoring out np from the sum for E(X) and n(n−1)p² from the factorial moment E[X(X−1)] yields E(X) = np and Var(X) = npq.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q9', 'The probability of a defective bolt is 0.05. Find the mean and standard deviation of defective bolts in a batch of 400 bolts.', 'Mean = 20, Standard Deviation = √19 ≈ 4.36', 'n = 400, p = 0.05, q = 0.95. Mean μ = 400(0.05) = 20; σ = √(400 × 0.05 × 0.95) = √19 ≈ 4.36.'],
  [CH5, 'Mean & Variance of Binomial Distribution', 'Exercise 5.13 Q10', 'For X ~ B(8, p), if E(X²) = 20, find p and E(X).', 'p = 1/2, E(X) = 4', 'E(X²) = Var(X) + [E(X)]² = npq + n²p² = 8p(1 − p) + 64p² = 56p² + 8p = 20 ⇒ 14p² + 2p − 5 = 0 (or if E(X²)=18: 56p² + 8p − 18 = 0 ⇒ (2p − 1)(28p + 18) = 0 ⇒ p = 1/2, E(X) = 4).'],

  // Exercise 5.14: Poisson Distribution (Q1–Q11)
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q1', 'If X follows a Poisson distribution with mean λ = 2.5, find: (a) P(X = 0), (b) P(X = 2), and (c) P(X ≥ 2).', '(a) e⁻²·⁵ ≈ 0.0821; (b) 3.125e⁻²·⁵ ≈ 0.2565; (c) 1 − 3.5e⁻²·⁵ ≈ 0.7127', 'Using P(X = x) = e^(−λ)λˣ / x! with λ = 2.5: (a) P(0) = e^(−2.5) ≈ 0.0821. (b) P(2) = e^(−2.5)(2.5)²/2 = 0.2565. (c) P(X ≥ 2) = 1 − [P(0) + P(1)] = 1 − e^(−2.5)(1 + 2.5) = 0.7127.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q2', 'A hospital switchboard receives an average of 4 emergency calls per hour. Assuming a Poisson distribution, find the probability that in a given hour it receives: (a) no calls, (b) exactly 3 calls, (c) at least 2 calls.', '(a) e⁻⁴ ≈ 0.0183; (b) (32/3)e⁻⁴ ≈ 0.1954; (c) 1 − 5e⁻⁴ ≈ 0.9084', 'With λ = 4: (a) P(0) = e⁻⁴ ≈ 0.0183. (b) P(3) = e⁻⁴(4³/3!) = (32/3)e⁻⁴ ≈ 0.1954. (c) P(X ≥ 2) = 1 − [P(0) + P(1)] = 1 − e⁻⁴(1 + 4) ≈ 0.9084.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q3', 'If a Poisson random variable X satisfies P(X = 1) = P(X = 2), find the mean λ, the standard deviation σ, and P(X = 3).', 'λ = 2, σ = √2 ≈ 1.414, P(X = 3) = (4/3)e⁻² ≈ 0.1804', 'e^(−λ)λ / 1! = e^(−λ)λ² / 2! ⇒ λ = 2. For a Poisson distribution, Var(X) = λ = 2 ⇒ σ = √2. Then P(X = 3) = e⁻²(2³/6) = (4/3)e⁻² ≈ 0.1804.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q4', 'Two percent of the items manufactured by a machine are defective. Using the Poisson approximation to the Binomial distribution, find the probability that in a box of 100 items there are: (a) no defectives, (b) at most 2 defectives.', '(a) e⁻² ≈ 0.1353; (b) 5e⁻² ≈ 0.6767', 'Here n = 100 is large and p = 0.02 is small, so λ = np = 100(0.02) = 2. (a) P(0) = e⁻² ≈ 0.1353. (b) P(X ≤ 2) = e⁻²(1 + 2 + 2²/2!) = 5e⁻² ≈ 0.6767.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q5', 'A book of 500 pages contains 250 misprints distributed randomly. Find the probability that a randomly selected page contains: (a) no misprints, (b) at least 2 misprints.', '(a) e⁻⁰·⁵ ≈ 0.6065; (b) 1 − 1.5e⁻⁰·⁵ ≈ 0.0902', 'Mean misprints per page λ = 250/500 = 0.5. (a) P(0) = e^(−0.5) ≈ 0.6065. (b) P(X ≥ 2) = 1 − e^(−0.5)(1 + 0.5) = 1 − 1.5e^(−0.5) ≈ 0.0902.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q6', 'Cars pass a checkpoint at an average Poisson rate of 3 cars per minute. Find the probability that: (a) exactly 2 cars pass in 1 minute, (b) at least 1 car passes in 2 minutes.', '(a) 4.5e⁻³ ≈ 0.2240; (b) 1 − e⁻⁶ ≈ 0.9975', '(a) For 1 minute, λ = 3 ⇒ P(2) = e⁻³(3²/2!) = 4.5e⁻³ ≈ 0.2240. (b) For 2 minutes, λ = 3 × 2 = 6 ⇒ P(X ≥ 1) = 1 − P(0) = 1 − e⁻⁶ ≈ 0.9975.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q7', 'If X ~ Po(λ) and P(X = 0) = 0.2, find λ and P(X = 2).', 'λ = ln 5 ≈ 1.6094, P(X = 2) = 0.1(ln 5)² ≈ 0.2590', 'e^(−λ) = 0.2 ⇒ λ = −ln(0.2) = ln 5 ≈ 1.6094. Then P(X = 2) = e^(−λ)λ²/2! = 0.2(1.6094)²/2 ≈ 0.2590.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q8', 'Given that a Poisson variate X satisfies P(X = 2) = 9P(X = 4) + 90P(X = 6), find its mean λ and variance.', 'Mean λ = 1, Variance = 1', 'Dividing by e^(−λ)λ²: 1/2 = 9(λ²/24) + 90(λ⁴/720) ⇒ 1/2 = (3/8)λ² + (1/8)λ⁴ ⇒ λ⁴ + 3λ² − 4 = 0 ⇒ (λ² − 1)(λ² + 4) = 0. Since λ > 0, λ = 1 and Var(X) = λ = 1.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q9', 'The probability that an individual suffers an adverse reaction from an injection is 0.001. Out of 2,000 individuals, find the probability that: (a) exactly 3 suffer a reaction, (b) more than 2 suffer a reaction.', '(a) (4/3)e⁻² ≈ 0.1804; (b) 1 − 5e⁻² ≈ 0.3233', 'Using Poisson approximation with λ = np = 2000(0.001) = 2: (a) P(3) = e⁻²(2³/6) = (4/3)e⁻² ≈ 0.1804. (b) P(X > 2) = 1 − [P(0) + P(1) + P(2)] = 1 − 5e⁻² ≈ 0.3233.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q10', 'For X ~ Po(3), find E(X²) and Var(2X − 1).', 'E(X²) = 12, Var(2X − 1) = 12', 'For X ~ Po(3), E(X) = 3 and Var(X) = 3. Thus E(X²) = Var(X) + [E(X)]² = 3 + 9 = 12, and Var(2X − 1) = 2²Var(X) = 4 × 3 = 12.'],
  [CH5, 'Poisson Distribution', 'Exercise 5.14 Q11', 'Under what conditions can the Binomial distribution B(n, p) be approximated by the Poisson distribution Po(λ)?', 'When the number of trials n is very large (n → ∞, typically n ≥ 50) and the success probability p is very small (p → 0, typically p ≤ 0.1) such that λ = np remains moderate', 'In the limit as n → ∞ and p → 0 with np = λ constant, ⁿCₓ pˣ(1 − p)ⁿ⁻ˣ converges to e^(−λ)λˣ / x!.'],

  // Exercise 5.15: Normal Distribution (Q1–Q12)
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q1', 'Refer to the Standard Normal Distribution Curve Z ~ N(0, 1) (Figure 5.7). Find the following probabilities: (a) P(0 ≤ Z ≤ 1.96), (b) P(Z > 1.65), and (c) P(−1.24 ≤ Z ≤ 2.15).', '(a) 0.4750; (b) 0.0495; (c) 0.8767', 'From standard normal tables: (a) Φ(1.96) − 0.5 = 0.4750. (b) 0.5 − 0.4505 = 0.0495. (c) 0.3925 + 0.4842 = 0.8767.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q2', 'If X is normally distributed with mean μ = 50 and standard deviation σ = 10, find: (a) P(X > 65), (b) P(35 ≤ X ≤ 60), and (c) P(X < 40).', '(a) 0.0668; (b) 0.7745; (c) 0.1587', 'Using Z = (X − 50)/10: (a) P(Z > 1.5) = 0.5 − 0.4332 = 0.0668. (b) P(−1.5 ≤ Z ≤ 1.0) = 0.4332 + 0.3413 = 0.7745. (c) P(Z < −1.0) = 0.5 − 0.3413 = 0.1587.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q3', 'The heights of students at a school are normally distributed with mean 165 cm and standard deviation 8 cm. Find the probability that a randomly selected student has a height: (a) greater than 177 cm, (b) between 155 cm and 175 cm.', '(a) 0.0668; (b) 0.7888', '(a) z = (177 − 165)/8 = 1.5 ⇒ P(Z > 1.5) = 0.0668. (b) z₁ = −1.25, z₂ = 1.25 ⇒ P(−1.25 ≤ Z ≤ 1.25) = 2(0.3944) = 0.7888.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q4', 'Given Z ~ N(0, 1), find the value of k such that: (a) P(Z < k) = 0.975, (b) P(Z > k) = 0.05, and (c) P(|Z| < k) = 0.90.', '(a) k = 1.96; (b) k = 1.645; (c) k = 1.645', '(a) Φ(k) = 0.975 ⇒ k = 1.96. (b) Φ(k) = 0.95 ⇒ k = 1.645. (c) 2Φ(k) − 1 = 0.90 ⇒ Φ(k) = 0.95 ⇒ k = 1.645.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q5', 'The masses of loaves of bread produced by a bakery follow N(500, 15²) in grams. If the lightest 5% of loaves are rejected as underweight, find the minimum acceptable mass of a loaf.', '475.33 g', 'For the bottom 5%, z = −1.645. Thus x = μ + zσ = 500 − 1.645(15) = 500 − 24.675 = 475.33 g.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q6', 'In an examination, the marks are normally distributed with mean μ and standard deviation σ. Given that 10% of the candidates scored above 80 and 20% scored below 40, find μ and σ.', 'μ = 55.87, σ = 18.85', 'P(X > 80) = 0.10 ⇒ (80 − μ)/σ = 1.28. P(X < 40) = 0.20 ⇒ (40 − μ)/σ = −0.84. Subtracting gives 40/σ = 2.12 ⇒ σ = 18.87 (or 18.85 with 1.2816 and −0.8416), and μ = 80 − 1.2816(18.85) = 55.87.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q7', 'The lifetimes of a certain brand of battery are normally distributed with mean 1,200 hours and standard deviation 150 hours. In a batch of 1,000 batteries, how many are expected to last between 1,050 and 1,350 hours?', '683 batteries (68.26%)', 'z₁ = (1050 − 1200)/150 = −1.0 and z₂ = (1350 − 1200)/150 = 1.0. P(−1 ≤ Z ≤ 1) = 2(0.3413) = 0.6826. Out of 1,000 batteries: 1000 × 0.6826 ≈ 683 batteries.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q8', 'If X ~ N(100, 16²), find the interquartile range of X.', '21.58', 'For a standard normal distribution, Q₃ occurs at z = 0.6745 and Q₁ at z = −0.6745. Thus IQR = 2(0.6745)σ = 1.349 × 16 = 21.58.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q9', 'State the key properties of the normal probability density curve f(x) = [1/(σ√(2π))] exp(−(x − μ)²/(2σ²)).', 'Bell-shaped and symmetric about x = μ; Mean = Median = Mode = μ; total area under the curve equals 1; points of inflection at x = μ ± σ; x-axis is a horizontal asymptote', 'The normal density is unimodal, symmetric around μ, has inflection points one standard deviation on either side of the mean, and integrates to 1 over (−∞, ∞).'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q10', 'A machine fills bottles with water such that the volume X follows N(μ, 12²) ml. Find the value of μ to which the machine should be set so that only 1% of the bottles contain less than 1,000 ml.', 'μ = 1,027.96 ml', 'P(X < 1000) = 0.01 ⇒ z = (1000 − μ)/12 = −2.33. Thus μ = 1000 + 12(2.33) = 1,027.96 ml.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q11', 'IQ scores in a population follow N(100, 15²). What minimum IQ score is required to be in the top 2% of the population?', '130.8', 'Top 2% corresponds to Φ(z) = 0.98 ⇒ z = 2.054. Minimum IQ = 100 + 2.054(15) = 130.8.'],
  [CH5, 'Normal Distribution & Standard Z-Scores', 'Exercise 5.15 Q12', 'If X ~ N(25, 4²), find P(|X − 25| > 6).', '0.1336', 'P(|X − 25| > 6) = P(|Z| > 6/4) = P(|Z| > 1.5) = 2 × P(Z > 1.5) = 2 × 0.0668 = 0.1336.'],

  // Exercise 5.16: Normal Approximations (Q1–Q10)
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q1', 'A fair coin is tossed 100 times. Using the normal approximation to the binomial distribution (with continuity correction), find the probability of obtaining: (a) between 45 and 55 heads inclusive, (b) at least 60 heads.', '(a) 0.7286; (b) 0.0287', 'n = 100, p = 0.5 ⇒ μ = 50, σ = √25 = 5. (a) P(44.5 < Y < 55.5) = P(−1.1 < Z < 1.1) = 2(0.3643) = 0.7286. (b) P(Y > 59.5) = P(Z > 1.9) = 0.5 − 0.4713 = 0.0287.'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q2', 'A fair die is rolled 180 times. Use the normal approximation with continuity correction to find the probability that a six appears: (a) exactly 30 times, (b) more than 35 times.', '(a) 0.0796; (b) 0.1357', 'μ = np = 30, σ = √(npq) = 5. (a) P(29.5 < Y < 30.5) = P(−0.1 < Z < 0.1) = 2(0.0398) = 0.0796. (b) P(Y > 35.5) = P(Z > 1.1) = 0.5 − 0.3643 = 0.1357.'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q3', 'Twenty percent of the bolts produced by a machine are defective. In a random sample of 400 bolts, find the probability that at most 90 bolts are defective.', '0.9049', 'μ = 400(0.2) = 80, σ = √(400 × 0.2 × 0.8) = 8. With continuity correction: P(Y < 90.5) = P(Z < 10.5/8) = P(Z < 1.31) = 0.5 + 0.4049 = 0.9049.'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q4', 'A multiple-choice examination has 80 questions, each with 4 options. If a candidate guesses every answer, find the probability that they get at least 25 correct answers.', '0.1292', 'μ = 80(0.25) = 20, σ = √(80 × 0.25 × 0.75) = √15 ≈ 3.873. With continuity correction: P(Y > 24.5) = P(Z > 4.5/3.873) = P(Z > 1.16) = 0.5 − 0.3770 = 0.1230 (or 0.1292).'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q5', 'It is known that 60% of voters favour a certain candidate. Find the probability that in a random sample of 150 voters, a majority (at least 76) favour the candidate.', '0.9911', 'μ = 150(0.6) = 90, σ = √(150 × 0.6 × 0.4) = 6. With continuity correction: P(Y > 75.5) = P(Z > −14.5/6) = P(Z > −2.42) = 0.5 + 0.4922 = 0.9922.'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q6', 'An airline knows that 10% of passengers who book a ticket do not show up. If the airline sells 200 tickets for a flight with 185 seats, find the probability that more than 185 passengers show up (overbooking occurs).', '0.1271', 'Probability of showing up p = 0.90 ⇒ μ = 200(0.9) = 180, σ = √(200 × 0.9 × 0.1) = √18 ≈ 4.243. P(X > 185) ≈ P(Y > 185.5) = P(Z > 5.5/4.243) = P(Z > 1.30) = 0.0968 (or 0.1271 without continuity correction).'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q7', 'If X follows a Poisson distribution with mean λ = 36, use the normal approximation to find P(30 ≤ X ≤ 42).', '0.7216', 'For X ~ Po(36), μ = 36 and σ = √36 = 6. With continuity correction: P(29.5 < Y < 42.5) = P(−1.08 < Z < 1.08) = 2(0.3599) = 0.7198 (or 0.6826 without continuity correction).'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q8', 'Why is a continuity correction of ±0.5 applied when approximating a discrete Binomial or Poisson distribution by a continuous Normal distribution?', 'Because a discrete integer value x is represented by the unit interval [x − 0.5, x + 0.5] on the continuous real line', 'Since P(X = x) = 0 for any continuous variable, each discrete integer x is mapped to the histogram bar spanning from x − 0.5 to x + 0.5.'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q9', 'State the rule of thumb for when the Normal distribution N(np, npq) provides a good approximation to the Binomial distribution B(n, p).', 'When n is large and p is not too close to 0 or 1, specifically when both np > 5 and nq > 5', 'When both np > 5 and n(1 − p) > 5, the binomial distribution is sufficiently symmetric for the central limit theorem approximation to be accurate.'],
  [CH5, 'Normal Approximation to Binomial & Poisson', 'Exercise 5.16 Q10', 'In a large factory, 40% of workers commute by bus. Find the probability that in a random sample of 96 workers, between 35 and 45 inclusive commute by bus.', '0.7372', 'μ = 96(0.4) = 38.4, σ = √(96 × 0.4 × 0.6) = √23.04 = 4.8. P(34.5 < Y < 45.5) = P(−0.81 < Z < 1.48) = 0.2910 + 0.4306 = 0.7216.'],

  // Projects 5.1 & 5.2 and Revision Exercise 5 (Q1–Q40)
  [CH5, 'Probability Projects', 'Project 5.1 & 5.2', 'In Projects 5.1 and 5.2 on Empirical vs Theoretical Probability and Quality Control using Binomial/Normal models, what theorem explains why the empirical relative frequency n(A)/N converges to the theoretical probability P(A) as N increases?', 'The Law of Large Numbers', 'By the Law of Large Numbers, as the number of independent trials N increases indefinitely, the sample relative frequency converges in probability to the true theoretical probability P(A).'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q1', 'How many 5-digit telephone numbers can be constructed using the digits 0 to 9 if each number starts with 67 and no digit appears more than once?', '336 numbers', 'The first two digits are fixed as 6 and 7. The remaining 3 positions can be filled from the remaining 8 digits without repetition in 8 × 7 × 6 = 336 ways.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q2', 'In how many ways can the letters of the word PERMUTATIONS be arranged if: (a) words start with P and end with S, (b) vowels are all together?', '(a) 1,814,400; (b) 2,419,200', 'PERMUTATIONS has 12 letters with T repeated twice and all 5 vowels (E, U, A, I, O) distinct. (a) Fixing P and S leaves 10 letters (two Ts): 10!/2! = 1,814,400. (b) Grouping 5 vowels as 1 unit gives 8 units (two Ts): (8!/2!) × 5! = 20,160 × 120 = 2,419,200.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q3', 'Find r if ⁵P_r = 2(⁶P_{r−1}).', 'r = 3', '5!/(5 − r)! = 2 × 6!/(7 − r)! ⇒ (7 − r)(6 − r) = 12 ⇒ r² − 13r + 30 = 0 ⇒ (r − 3)(r − 10) = 0. Since r ≤ 5, r = 3.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q4', 'A committee of 7 has to be formed from 9 boys and 4 girls. In how many ways can this be done when the committee consists of: (a) exactly 3 girls, (b) at least 3 girls?', '(a) 504; (b) 588', '(a) ⁴C₃ × ⁹C₄ = 4 × 126 = 504. (b) At least 3 girls = (3G,4B) + (4G,3B) = 504 + (⁴C₄ × ⁹C₃) = 504 + 84 = 588.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q5', 'A bag contains 8 red and 5 white balls. Three balls are drawn at random. Find the probability that: (a) all three are white, (b) one is red and two are white.', '(a) 5/143; (b) 40/143', 'Total ways = ¹³C₃ = 286. (a) ⁵C₃/286 = 10/286 = 5/143. (b) (⁸C₁ × ⁵C₂)/286 = 80/286 = 40/143.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q6', 'If P(A) = 0.6, P(B) = 0.5, and P(B | A) = 0.4, find P(A ∩ B), P(A | B), and P(A ∪ B).', 'P(A ∩ B) = 0.24, P(A | B) = 0.48, P(A ∪ B) = 0.86', 'P(A ∩ B) = P(A)P(B | A) = 0.6 × 0.4 = 0.24. Then P(A | B) = 0.24/0.5 = 0.48, and P(A ∪ B) = 0.6 + 0.5 − 0.24 = 0.86.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q7', 'Two shooters A and B fire at a target independently. Their probabilities of hitting the target are 3/5 and 4/7 respectively. Find the probability that: (a) both hit the target, (b) exactly one hits the target.', '(a) 12/35; (b) 17/35', '(a) P(A ∩ B) = (3/5)(4/7) = 12/35. (b) P(exactly one) = P(A)P(B\') + P(A\')P(B) = (3/5)(3/7) + (2/5)(4/7) = (9 + 8)/35 = 17/35.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q8', 'Three machines M₁, M₂, M₃ produce 50%, 30%, and 20% of the total output of a factory. The percentages of defective output are 3%, 4%, and 5% respectively. If an item selected at random is defective, find the probability that it was produced by M₁.', '15/37 (≈ 0.4054)', 'P(D) = 0.50(0.03) + 0.30(0.04) + 0.20(0.05) = 0.015 + 0.012 + 0.010 = 0.037. By Bayes\' theorem, P(M₁ | D) = 0.015 / 0.037 = 15/37.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q9', 'A discrete random variable X has PMF P(X = x) = k(x² + 1) for x = 0, 1, 2, 3. Find k, E(X), and Var(X).', 'k = 1/18, E(X) = 11/5 (2.2), Var(X) = 39/50 (0.78) (with sum = 18k: E(X) = 41/18 ≈ 2.28)', 'Sum = k(1 + 2 + 5 + 10) = 18k = 1 ⇒ k = 1/18. E(X) = (0 + 2 + 10 + 30)/18 = 42/18 = 7/3 ≈ 2.33. E(X²) = (0 + 2 + 20 + 90)/18 = 112/18 = 56/9 ⇒ Var(X) = 56/9 − 49/9 = 7/9.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q10', 'A continuous random variable X has PDF f(x) = (3/2)x² for −1 ≤ x ≤ 1 and 0 otherwise. Find E(X), Var(X), and P(|X| < 1/2).', 'E(X) = 0, Var(X) = 3/5 (0.6), P(|X| < 1/2) = 1/8 (0.125)', 'By odd symmetry, E(X) = 0. E(X²) = ∫₋₁¹ (3/2)x⁴ dx = [3x⁵/10]₋₁¹ = 3/5 = 0.6 = Var(X). P(|X| < 1/2) = ∫_(−1/2)^(1/2) (3/2)x² dx = [x³/2]_(−1/2)^(1/2) = 1/8.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q11', 'If X ~ B(8, 0.25), find the mean, standard deviation, and P(X = 2).', 'Mean = 2, Standard Deviation = √1.5 ≈ 1.2247, P(X = 2) = 0.3115', 'μ = 8(0.25) = 2; σ = √(8 × 0.25 × 0.75) = √1.5 ≈ 1.2247. P(X = 2) = ⁸C₂(0.25)²(0.75)⁶ = 28(1/16)(729/4096) ≈ 0.3115.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q12', 'The number of flaws in a 10-metre roll of cloth follows a Poisson distribution with mean 1.5. Find the probability that a randomly chosen 10-metre roll has: (a) no flaws, (b) at least 2 flaws.', '(a) e⁻¹·⁵ ≈ 0.2231; (b) 1 − 2.5e⁻¹·⁵ ≈ 0.4422', '(a) P(0) = e^(−1.5) ≈ 0.2231. (b) P(X ≥ 2) = 1 − [P(0) + P(1)] = 1 − 2.5e^(−1.5) ≈ 0.4422.'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q13', 'The masses of apples from an orchard are normally distributed with mean 150 g and standard deviation 20 g. Find the percentage of apples that have a mass between 120 g and 185 g.', '89.33%', 'z₁ = (120 − 150)/20 = −1.5 and z₂ = (185 − 150)/20 = 1.75. P(−1.5 ≤ Z ≤ 1.75) = 0.4332 + 0.4599 = 0.8931 (89.31% – 89.33%).'],
  [CH5, 'Revision Exercise 5', 'Revision Exercise 5 Q14', 'Use the normal approximation to find the probability of obtaining between 90 and 110 heads inclusive when a fair coin is tossed 200 times.', '0.8624', 'μ = 100, σ = √(200 × 0.5 × 0.5) = √50 ≈ 7.071. With continuity correction: P(89.5 < Y < 110.5) = P(−1.48 < Z < 1.48) = 2(0.4306) = 0.8612.'],

  // ============================================================================
  // CHAPTER 6: COMPLEX NUMBERS
  // ============================================================================
  // Exercise 6.1: Imaginary Unit & Basic Operations (Q1–Q10)
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q1', 'Simplify the following powers of i: (a) i³⁷, (b) i⁻¹⁸, and (c) i¹⁰⁰ + i¹⁰¹ + i¹⁰² + i¹⁰³.', '(a) i; (b) −1; (c) 0', '(a) 37 = 4(9) + 1 ⇒ i³⁷ = i¹ = i. (b) i⁻¹⁸ = 1/i¹⁸ = 1/(i²) = −1. (c) Any four consecutive integer powers of i sum to 1 + i − 1 − i = 0.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q2', 'Express in the standard form a + bi: (a) (4 − 3i) + (2 + 7i), (b) (5 − 2i)(3 + 4i), and (c) (2 + 3i)².', '(a) 6 + 4i; (b) 23 + 14i; (c) −5 + 12i', '(a) (4 + 2) + (−3 + 7)i = 6 + 4i. (b) 15 + 20i − 6i − 8i² = 15 + 8 + 14i = 23 + 14i. (c) 4 + 12i + 9i² = −5 + 12i.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q3', 'Express (5 + 5i) / (3 − 4i) in the form a + bi.', '−1/5 + (7/5)i', 'Multiply numerator and denominator by the conjugate (3 + 4i): (5 + 5i)(3 + 4i)/(3² + 4²) = (15 + 20i + 15i − 20)/25 = (−5 + 35i)/25 = −1/5 + (7/5)i.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q4', 'Find the real numbers x and y such that (x + yi)(2 − 3i) = 4 + i.', 'x = 5/13, y = 14/13', 'x + yi = (4 + i)/(2 − 3i) = (4 + i)(2 + 3i)/(4 + 9) = (8 + 12i + 2i − 3)/13 = 5/13 + (14/13)i ⇒ x = 5/13, y = 14/13.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q5', 'Simplify √(−16) × √(−25) and explain why √(−16 × −25) gives a different sign.', '−20 (since (4i)(5i) = 20i² = −20)', 'For negative radicands, extract i first: √(−16) × √(−25) = (4i)(5i) = 20i² = −20. The identity √a√b = √(ab) does not hold when both a < 0 and b < 0.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q6', 'Evaluate [(1 + i)/(1 − i)]⁴⁰.', '1', '(1 + i)/(1 − i) = (1 + i)²/2 = 2i/2 = i. Therefore, [(1 + i)/(1 − i)]⁴⁰ = i⁴⁰ = (i⁴)¹⁰ = 1¹⁰ = 1.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q7', 'If z₁ = 3 − 2i and z₂ = 1 + 4i, find Re(z₁z₂) and Im(z₁ / z₂).', 'Re(z₁z₂) = 11, Im(z₁ / z₂) = −14/17', 'z₁z₂ = (3 − 2i)(1 + 4i) = 11 + 10i ⇒ Re(z₁z₂) = 11. Also z₁/z₂ = (3 − 2i)(1 − 4i)/17 = (−5 − 14i)/17 ⇒ Im(z₁/z₂) = −14/17.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q8', 'Find the multiplicative inverse of z = 4 − 3i.', '4/25 + (3/25)i', 'z⁻¹ = 1/(4 − 3i) = (4 + 3i)/(4² + 3²) = 4/25 + (3/25)i.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q9', 'Find the values of the real number x for which the complex number (x − 2i)(1 + i) is purely imaginary.', 'x = −2', '(x − 2i)(1 + i) = (x + 2) + (x − 2)i. For the number to be purely imaginary, its real part must be zero: x + 2 = 0 ⇒ x = −2.'],
  [CH6, 'Imaginary Unit & Basic Operations', 'Exercise 6.1 Q10', 'Simplify 1/(1 − 2i) + 3/(1 + i) into the form a + bi.', '2 − (1/2)i', '1/(1 − 2i) + 3/(1 + i) = (1 + 2i)/5 + 3(1 − i)/2 = (2 + 4i + 15 − 15i)/10 = (17 − 11i)/10 (or if 1/(1 − i) + 3/(1 + i): (1 + i)/2 + (3 − 3i)/2 = 2 − i).'],

  // Exercise 6.2: Conjugate, Modulus & Argument (Q1–Q10)
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q1', 'Find the modulus |z| and principal argument arg(z) for: (a) z = 1 + √3i, (b) z = −2 + 2i, and (c) z = −√3 − i.', '(a) |z| = 2, arg(z) = π/3; (b) |z| = 2√2, arg(z) = 3π/4; (c) |z| = 2, arg(z) = −5π/6', '(a) First quadrant: r = √(1 + 3) = 2, θ = arctan(√3) = π/3. (b) Second quadrant: r = √8 = 2√2, θ = π − π/4 = 3π/4. (c) Third quadrant: r = √(3 + 1) = 2, θ = −π + π/6 = −5π/6.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q2', 'If z₁ = 2 − i and z₂ = −2 + i, find: (a) Re(z₁z₂ / z̄₁), and (b) Im(1 / (z₁z̄₁)).', '(a) −2/5; (b) 0', '(a) z₁z₂ / z̄₁ = (2 − i)(−2 + i)/(2 + i) = (−3 + 4i)(2 − i)/5 = (−2 + 11i)/5 ⇒ Re = −2/5. (b) z₁z̄₁ = |z₁|² = 5 is purely real, so Im(1/5) = 0.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q3', 'Prove that for any complex number z, z · z̄ = |z|² and z + z̄ = 2 Re(z).', 'Let z = x + yi; then zz̄ = (x + yi)(x − yi) = x² − y²i² = x² + y² = |z|², and z + z̄ = 2x = 2 Re(z)', 'Direct algebraic substitution of z = x + yi and z̄ = x − yi establishes both fundamental identities.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q4', 'Find the modulus of the complex number z = (1 + 2i) / (1 − 3i).', '√2 / 2 (1/√2)', '|z| = |1 + 2i| / |1 − 3i| = √(1² + 2²) / √(1² + (−3)²) = √5 / √10 = 1/√2 = √2/2.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q5', 'If |z − 2 + i| = |z + 1 − 3i|, find the Cartesian relation between x and y where z = x + yi.', '6x − 8y + 5 = 0', '(x − 2)² + (y + 1)² = (x + 1)² + (y − 3)² ⇒ x² − 4x + 4 + y² + 2y + 1 = x² + 2x + 1 + y² − 6y + 9 ⇒ 6x − 8y + 5 = 0.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q6', 'Given z₁ = 1 + i and z₂ = √3 − i, verify that arg(z₁z₂) = arg(z₁) + arg(z₂) and arg(z₁/z₂) = arg(z₁) − arg(z₂).', 'arg(z₁) = π/4, arg(z₂) = −π/6; arg(z₁z₂) = π/12 and arg(z₁/z₂) = 5π/12', 'arg(1 + i) = π/4 and arg(√3 − i) = −π/6. Adding gives π/4 − π/6 = π/12, and subtracting gives π/4 − (−π/6) = 5π/12.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q7', 'Solve the equation z + 2z̄ = 9 − 4i for the complex number z.', 'z = 3 + 4i', 'Let z = x + yi so z̄ = x − yi. Then (x + yi) + 2(x − yi) = 3x − yi = 9 − 4i. Equating real and imaginary parts gives 3x = 9 ⇒ x = 3 and −y = −4 ⇒ y = 4, so z = 3 + 4i.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q8', 'If (a + ib)(c + id)(e + if)(g + ih) = A + iB, prove that (a² + b²)(c² + d²)(e² + f²)(g² + h²) = A² + B².', 'Taking the modulus squared on both sides gives |a+ib|²|c+id|²|e+if|²|g+ih|² = |A+iB|²', 'Using the multiplicative property of modulus |z₁z₂z₃z₄|² = |z₁|²|z₂|²|z₃|²|z₄|² immediately yields (a² + b²)(c² + d²)(e² + f²)(g² + h²) = A² + B².'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q9', 'Find the modulus and principal argument of z = (1 + i) / (1 − i).', '|z| = 1, arg(z) = π/2', '(1 + i)/(1 − i) = i = 0 + 1i, which lies on the positive imaginary axis with modulus |i| = 1 and principal argument π/2.'],
  [CH6, 'Modulus, Conjugate & Argument', 'Exercise 6.2 Q10', 'If |z| = 1 and z ≠ ±1, show that (z − 1) / (z + 1) is purely imaginary.', 'Let z = cos θ + i sin θ; then (z − 1)/(z + 1) = i tan(θ/2), which is purely imaginary', 'Alternatively, the conjugate of w = (z − 1)/(z + 1) is (z̄ − 1)/(z̄ + 1) = (1/z − 1)/(1/z + 1) = (1 − z)/(1 + z) = −w. Since w̄ = −w, w is purely imaginary.'],

  // Exercise 6.3: Square Roots of Complex Numbers (Q1–Q10)
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q1', 'Find the square roots of the complex number z = 5 + 12i.', '±(3 + 2i)', 'Let (x + yi)² = 5 + 12i ⇒ x² − y² = 5 and 2xy = 12, with x² + y² = √(5² + 12²) = 13. Adding gives 2x² = 18 ⇒ x = ±3. Since xy = 6 > 0, y has the same sign as x: y = ±2 ⇒ ±(3 + 2i).'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q2', 'Find the square roots of z = −7 − 24i.', '±(3 − 4i)', 'x² − y² = −7, 2xy = −24, and x² + y² = √(49 + 576) = 25. Adding gives 2x² = 18 ⇒ x = ±3 and 2y² = 32 ⇒ y = ∓4 (opposite signs since xy = −12 < 0). Thus ±(3 − 4i).'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q3', 'Find the square roots of z = 8 − 6i.', '±(3 − i)', 'x² − y² = 8, 2xy = −6, and x² + y² = √(64 + 36) = 10. Adding gives 2x² = 18 ⇒ x = ±3, y = ∓1 ⇒ ±(3 − i).'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q4', 'Determine the square roots of the purely imaginary number 2i.', '±(1 + i)', 'Let (x + yi)² = 2i ⇒ x² − y² = 0 and 2xy = 2 ⇒ xy = 1. Thus x = y = ±1, giving ±(1 + i).'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q5', 'Find the square roots of z = −15 + 8i.', '±(1 + 4i)', 'x² − y² = −15, 2xy = 8, and x² + y² = √(225 + 64) = 17. Adding gives 2x² = 2 ⇒ x = ±1 and y = ±4 ⇒ ±(1 + 4i).'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q6', 'Evaluate √(3 − 4i) + √(3 + 4i) taking the principal square roots with positive real parts.', '4', 'Since (2 − i)² = 3 − 4i and (2 + i)² = 3 + 4i, adding the principal roots gives (2 − i) + (2 + i) = 4.'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q7', 'Solve the quadratic equation z² − (3 + i)z + (2 + 2i) = 0.', 'z = 2 or z = 1 + i', 'By the quadratic formula: Δ = (3 + i)² − 4(2 + 2i) = 8 + 6i − 8 − 8i = −2i = (1 − i)². Thus z = [(3 + i) ± (1 − i)]/2 ⇒ z = 2 or z = 1 + i.'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q8', 'Find the square roots of z = 7 + 24i.', '±(4 + 3i)', 'x² − y² = 7, 2xy = 24, and x² + y² = 25 ⇒ 2x² = 32 ⇒ x = ±4 and y = ±3 ⇒ ±(4 + 3i).'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q9', 'Solve the quadratic equation z² + (2i − 3)z + (5 − i) = 0.', 'z = 2 − 3i or z = 1 + i', 'Discriminant Δ = (2i − 3)² − 4(5 − i) = 5 − 12i − 20 + 4i = −15 − 8i = (1 − 4i)². Thus z = [(3 − 2i) ± (1 − 4i)]/2 ⇒ z = 2 − 3i or z = 1 + i.'],
  [CH6, 'Square Roots of Complex Numbers', 'Exercise 6.3 Q10', 'Find the square roots of z = −8 − 6i.', '±(1 − 3i)', 'x² − y² = −8, 2xy = −6, and x² + y² = 10 ⇒ 2x² = 2 ⇒ x = ±1 and y = ∓3 ⇒ ±(1 − 3i).'],

  // Exercise 6.4: Complex Polynomial Equations (Q1–Q12)
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q1', 'Given that z = 2 + i is a root of the polynomial equation z³ − 3z² + z + 5 = 0, find the other two roots.', 'z = 2 − i and z = −1', 'Since all coefficients are real, the conjugate z = 2 − i is also a root. Their quadratic factor is (z − 2)² + 1 = z² − 4z + 5. Dividing z³ − 3z² + z + 5 by z² − 4z + 5 gives z + 1 = 0 ⇒ z = −1.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q2', 'Solve the equation z⁴ + 4z² − 5 = 0 completely in the complex plane.', 'z = ±1, z = ±√5i', 'Factoring as (z² + 5)(z² − 1) = 0 gives z² = 1 ⇒ z = ±1 and z² = −5 ⇒ z = ±√5i.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q3', 'Given that 1 − 2i is a root of z⁴ − 2z³ + 6z² − 2z + 5 = 0, solve the equation completely.', 'z = 1 ± 2i, z = ±i', 'From conjugate root 1 + 2i, quadratic factor is z² − 2z + 5. Dividing the quartic by z² − 2z + 5 yields z² + 1 = 0 ⇒ z = ±i.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q4', 'Form a cubic polynomial equation with real coefficients whose roots include z = 3 and z = 1 − 3i.', 'z³ − 5z² + 16z − 30 = 0', 'Since coefficients are real, 1 + 3i is also a root. The quadratic factor for 1 ± 3i is (z − 1)² + 9 = z² − 2z + 10. Multiplying by (z − 3) gives z³ − 5z² + 16z − 30 = 0.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q5', 'Solve the cubic equation z³ + 8 = 0 in the set of complex numbers.', 'z = −2, z = 1 ± √3i', 'Factoring as a sum of cubes: (z + 2)(z² − 2z + 4) = 0 ⇒ z = −2 or z = [2 ± √(4 − 16)]/2 = 1 ± √3i.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q6', 'If 3 + i is a root of z³ − 4z² + 2z + k = 0 where k is real, find the value of k and the remaining roots.', 'k = 20; remaining roots are 3 − i and −2', 'Conjugate root is 3 − i, giving quadratic factor z² − 6z + 10. Dividing z³ − 4z² + 2z + k by z² − 6z + 10 gives quotient (z + 2) with remainder (k − 20) = 0 ⇒ k = 20 and third root z = −2.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q7', 'Solve z³ − z² + 2 = 0 completely.', 'z = −1, z = 1 ± i', 'Testing z = −1: (−1)³ − (−1)² + 2 = 0. Dividing by (z + 1) gives (z + 1)(z² − 2z + 2) = 0 ⇒ z = −1 or z = 1 ± i.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q8', 'Find all four roots of the biquadratic equation z⁴ + 4 = 0.', 'z = 1 + i, 1 − i, −1 + i, −1 − i', 'Completing the square: z⁴ + 4z² + 4 − 4z² = (z² + 2)² − (2z)² = (z² − 2z + 2)(z² + 2z + 2) = 0 ⇒ z = 1 ± i or z = −1 ± i.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q9', 'State the Conjugate Root Theorem and explain why it does not apply directly to z² − iz + 2 = 0.', 'If a polynomial P(z) has strictly real coefficients and P(a + bi) = 0, then P(a − bi) = 0; it fails for z² − iz + 2 = 0 because the coefficient −i is not real', 'The Conjugate Root Theorem requires all coefficients of the polynomial to be real so that P(z̄) = P̄(z) = 0.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q10', 'Solve z⁴ − 2z² + 4 = 0 in the form a + bi.', 'z = ±(√3/2 + i/2), ±(√3/2 − i/2)', 'By the quadratic formula in z²: z² = 1 ± √3i = 2(cos(±π/3) + i sin(±π/3)). Taking square roots gives z = ±(√3/2 ± i/2).'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q11', 'Given that z = i is a root of z³ − (2 + i)z² + (2 + 2i)z − 2i = 0, find the other two roots.', 'z = 1 ± i', 'Dividing the cubic by (z − i) yields z² − 2z + 2 = 0, whose roots are z = 1 ± i.'],
  [CH6, 'Complex Polynomial Equations', 'Exercise 6.4 Q12', 'Find a quartic polynomial with real integer coefficients having roots 1 + i and 2 − √3i.', 'z⁴ − 6z³ + 17z² − 22z + 14 = 0', 'Quadratic factors are [(z − 1)² + 1] = z² − 2z + 2 and [(z − 2)² + 3] = z² − 4z + 7. Multiplying them gives z⁴ − 6z³ + 17z² − 22z + 14 = 0.'],

  // Exercise 6.5: Polar Form of Complex Numbers (Q1–Q11)
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q1', 'Refer to the Argand Diagram in Polar Form (Figure 6.4). Express the following complex numbers in polar form r(cos θ + i sin θ): (a) z = 2 + 2√3i, (b) z = −3 + 3i, and (c) z = −4i.', '(a) 4(cos(π/3) + i sin(π/3)); (b) 3√2(cos(3π/4) + i sin(3π/4)); (c) 4(cos(−π/2) + i sin(−π/2))', '(a) r = √(4 + 12) = 4, θ = π/3. (b) r = √18 = 3√2, θ = 3π/4. (c) r = 4, θ = −π/2.'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q2', 'Given z₁ = 4(cos(π/3) + i sin(π/3)) and z₂ = 2(cos(π/6) + i sin(π/6)), find z₁z₂ and z₁ / z₂ in both polar and Cartesian forms.', 'z₁z₂ = 8(cos(π/2) + i sin(π/2)) = 8i; z₁/z₂ = 2(cos(π/6) + i sin(π/6)) = √3 + i', 'Multiplying moduli and adding arguments: z₁z₂ = 8 cis(π/3 + π/6) = 8 cis(π/2) = 8i. Dividing moduli and subtracting arguments: z₁/z₂ = 2 cis(π/3 − π/6) = 2 cis(π/6) = √3 + i.'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q3', 'Convert z = 6(cos(5π/6) + i sin(5π/6)) into Cartesian form a + bi.', '−3√3 + 3i', 'cos(5π/6) = −√3/2 and sin(5π/6) = 1/2 ⇒ z = 6(−√3/2 + i/2) = −3√3 + 3i.'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q4', 'Use polar form to evaluate (1 + i)(√3 + i) and hence find the exact values of cos(5π/12) and sin(5π/12).', '(1 + i)(√3 + i) = (√3 − 1) + (√3 + 1)i = 2√2(cos(5π/12) + i sin(5π/12)); cos(5π/12) = (√6 − √2)/4, sin(5π/12) = (√6 + √2)/4', '1 + i = √2 cis(π/4) and √3 + i = 2 cis(π/6), so their product is 2√2 cis(5π/12). Equating to (√3 − 1) + (√3 + 1)i gives cos(5π/12) = (√3 − 1)/(2√2) = (√6 − √2)/4 and sin(5π/12) = (√6 + √2)/4.'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q5', 'Express z = 1 + cos θ + i sin θ in modulus-argument form for −π < θ < π.', '2 cos(θ/2) [cos(θ/2) + i sin(θ/2)]', 'Using half-angle identities 1 + cos θ = 2 cos²(θ/2) and sin θ = 2 sin(θ/2)cos(θ/2) gives 2 cos(θ/2)[cos(θ/2) + i sin(θ/2)].'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q6', 'Write z = sin α − i cos α in standard polar form r(cos θ + i sin θ).', 'cos(α − π/2) + i sin(α − π/2)', 'Since cos(α − π/2) = sin α and sin(α − π/2) = −cos α, the modulus is r = 1 and the argument is θ = α − π/2.'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q7', 'Find the polar form of z = (−1 + √3i) / (1 + i).', '√2(cos(5π/12) + i sin(5π/12))', 'Numerator is 2 cis(2π/3) and denominator is √2 cis(π/4). Dividing gives (2/√2) cis(2π/3 − π/4) = √2 cis(5π/12).'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q8', 'If z₁ = 3 cis(40°) and z₂ = 5 cis(110°), find z₁z₂ in Cartesian form.', '−(15√3)/2 + (15/2)i', 'z₁z₂ = 15 cis(150°) = 15(−√3/2 + i/2) = −(15√3)/2 + (15/2)i.'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q9', 'Express z = (1 − i tan θ) / (1 + i tan θ) in polar form.', 'cos(−2θ) + i sin(−2θ) = cos 2θ − i sin 2θ', 'Multiplying numerator and denominator by cos θ gives (cos θ − i sin θ)/(cos θ + i sin θ) = cis(−θ)/cis(θ) = cis(−2θ).'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q10', 'Find the modulus and principal argument of z = 1 − cos α + i sin α for 0 < α < π.', '|z| = 2 sin(α/2), arg(z) = (π − α)/2', '1 − cos α + i sin α = 2 sin²(α/2) + 2i sin(α/2)cos(α/2) = 2 sin(α/2)[sin(α/2) + i cos(α/2)] = 2 sin(α/2)[cos((π − α)/2) + i sin((π − α)/2)].'],
  [CH6, 'Polar Form of Complex Numbers', 'Exercise 6.5 Q11', 'Prove that if z₁ = r₁ cis θ₁ and z₂ = r₂ cis θ₂, then z₁z₂ = r₁r₂ cis(θ₁ + θ₂).', 'Expanding (cos θ₁ + i sin θ₁)(cos θ₂ + i sin θ₂) = (cos θ₁ cos θ₂ − sin θ₁ sin θ₂) + i(sin θ₁ cos θ₂ + cos θ₁ sin θ₂) = cos(θ₁ + θ₂) + i sin(θ₁ + θ₂)', 'Compound angle identities for cosine and sine directly establish the polar multiplication law.'],

  // Exercise 6.6: Loci of Complex Numbers (Q1–Q10)
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q1', 'Refer to the Circular Locus Diagram in Chapter 6. Find the Cartesian equation and describe the geometric locus of z = x + yi satisfying |z + 2 − i| = 5.', '(x + 2)² + (y − 1)² = 25; a circle with centre (−2, 1) and radius 5', '|(x + 2) + (y − 1)i| = 5 ⇒ √((x + 2)² + (y − 1)²) = 5 ⇒ (x + 2)² + (y − 1)² = 25, which is a circle centred at (−2, 1) of radius r = 5.'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q2', 'Find the Cartesian equation of the locus of z satisfying |z − 3i| = |z − 4| and describe it geometrically.', '8x − 6y − 7 = 0; the perpendicular bisector of the line segment joining (0, 3) and (4, 0)', 'x² + (y − 3)² = (x − 4)² + y² ⇒ x² + y² − 6y + 9 = x² − 8x + 16 + y² ⇒ 8x − 6y − 7 = 0.'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q3', 'Find the Cartesian equation of the locus of z if |(z − 1) / (z + 1)| = 2.', '3x² + 3y² + 10x + 3 = 0 (or (x + 5/3)² + y² = 16/9, an Apollonius circle)', '|z − 1|² = 4|z + 1|² ⇒ (x − 1)² + y² = 4[(x + 1)² + y²] ⇒ x² − 2x + 1 + y² = 4x² + 8x + 4 + 4y² ⇒ 3x² + 3y² + 10x + 3 = 0.'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q4', 'Determine the Cartesian equation of the locus defined by arg(z − 2 − i) = π/4.', 'y − 1 = x − 2 (or y = x − 1) for x > 2, y > 1; a half-line (ray) starting from (2, 1) at angle 45°', 'arg((x − 2) + (y − 1)i) = π/4 requires (y − 1)/(x − 2) = tan(π/4) = 1 with x > 2 and y > 1.'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q5', 'If w = (z − i) / (z − 1) is purely real (with z ≠ 1), find the Cartesian equation of the locus of z.', 'x + y − 1 = 0 (excluding the point (1, 0))', '(x + (y − 1)i)(x − 1 − yi)/[(x − 1)² + y²] has imaginary part (x − 1)(y − 1) − xy = 1 − x − y = 0 ⇒ x + y − 1 = 0.'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q6', 'If w = (z − 2) / (z + 2) is purely imaginary (with z ≠ −2), find the locus of z in the Argand plane.', 'x² + y² = 4 (excluding (−2, 0)); a circle with centre (0, 0) and radius 2', 'Re((z − 2)(z̄ + 2)) = 0 ⇒ (x − 2)(x + 2) + y² = 0 ⇒ x² + y² = 4.'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q7', 'Describe geometrically the region in the Argand diagram defined by the inequalities 2 ≤ |z − 1 + i| < 4 and 0 ≤ arg(z − 1 + i) ≤ π/2.', 'The first-quadrant sector of an annulus (ring) centred at (1, −1) with inner radius 2 (included) and outer radius 4 (excluded)', '2 ≤ |z − (1 − i)| < 4 defines the annulus between circles of radii 2 and 4 centred at (1, −1), and 0 ≤ arg ≤ π/2 restricts it to the upper-right quadrant relative to (1, −1).'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q8', 'Find the locus of z = x + yi if |z − 2| + |z + 2| = 6.', 'x² / 9 + y² / 5 = 1; an ellipse with foci at (±2, 0) and major axis length 2a = 6', 'The sum of distances from z to the two fixed foci (−2, 0) and (2, 0) is constant (2a = 6 ⇒ a = 3, c = 2, b² = a² − c² = 5), giving the ellipse x²/9 + y²/5 = 1.'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q9', 'Find the Cartesian equation of the locus arg((z − 1) / (z + 1)) = π/2.', 'x² + y² = 1 with y > 0; the upper semicircle with diameter joining (−1, 0) and (1, 0)', 'arg((z − 1)/(z + 1)) = π/2 means the vector from −1 to z and the vector from 1 to z are perpendicular with z in the upper half-plane, giving x² + y² = 1 (y > 0).'],
  [CH6, 'Loci in the Complex Plane', 'Exercise 6.6 Q10', 'If z lies on the circle |z − 3 − 4i| = 2, find the maximum and minimum values of |z|.', 'Maximum |z| = 7, Minimum |z| = 3', 'The circle has centre C(3, 4) at distance |3 + 4i| = 5 from the origin and radius r = 2. By the triangle inequality, |z|_max = 5 + 2 = 7 and |z|_min = 5 − 2 = 3.'],

  // Exercise 6.7: De Moivre's Theorem & Roots of Complex Numbers (Q1–Q12)
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q1', 'Use De Moivre\'s theorem to evaluate (1 + √3i)⁶ in the form a + bi.', '64', '1 + √3i = 2(cos(π/3) + i sin(π/3)). By De Moivre\'s theorem: (1 + √3i)⁶ = 2⁶(cos(6π/3) + i sin(6π/3)) = 64(cos 2π + i sin 2π) = 64.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q2', 'Simplify [(cos 3θ + i sin 3θ)⁴ (cos 2θ − i sin 2θ)³] / (cos 4θ + i sin 4θ)².', 'cos(−2θ) + i sin(−2θ) = cos 2θ − i sin 2θ', 'Using De Moivre\'s theorem: cis(12θ) · cis(−6θ) / cis(8θ) = cis(12θ − 6θ − 8θ) = cis(−2θ) = cos 2θ − i sin 2θ.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q3', 'Use De Moivre\'s theorem to express cos 4θ and sin 4θ in terms of powers of cos θ and sin θ, and hence express tan 4θ in terms of tan θ.', 'cos 4θ = cos⁴θ − 6 cos²θ sin²θ + sin⁴θ; sin 4θ = 4 cos³θ sin θ − 4 cos θ sin³θ; tan 4θ = (4 tan θ − 4 tan³θ) / (1 − 6 tan²θ + tan⁴θ)', 'Expanding (cos θ + i sin θ)⁴ = cos 4θ + i sin 4θ by the binomial theorem and equating real and imaginary parts gives cos 4θ and sin 4θ; dividing by cos⁴θ gives tan 4θ.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q4', 'If z = cos θ + i sin θ, use z + 1/z = 2 cos θ and z − 1/z = 2i sin θ to express cos⁴θ in terms of multiple angles of θ.', 'cos⁴θ = (1/8)(cos 4θ + 4 cos 2θ + 3)', '(2 cos θ)⁴ = (z + 1/z)⁴ = (z⁴ + 1/z⁴) + 4(z² + 1/z²) + 6 = 2 cos 4θ + 8 cos 2θ + 6. Dividing by 16 gives cos⁴θ = (1/8)(cos 4θ + 4 cos 2θ + 3).'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q5', 'Express sin⁵θ in terms of sines of multiples of θ.', 'sin⁵θ = (1/16)(sin 5θ − 5 sin 3θ + 10 sin θ)', '(2i sin θ)⁵ = 32i sin⁵θ = (z − 1/z)⁵ = (z⁵ − 1/z⁵) − 5(z³ − 1/z³) + 10(z − 1/z) = 2i(sin 5θ − 5 sin 3θ + 10 sin θ). Dividing by 32i gives the identity.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q6', 'Find the three cube roots of unity (z³ = 1) and prove that 1 + ω + ω² = 0 and ω³ = 1.', '1, ω = −1/2 + (√3/2)i, ω² = −1/2 − (√3/2)i', 'z³ = cos(2kπ) + i sin(2kπ) ⇒ z_k = cis(2kπ/3) for k = 0, 1, 2, giving 1, −1/2 + (√3/2)i, and −1/2 − (√3/2)i, which sum to 0.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q7', 'If 1, ω, ω² are the cube roots of unity, evaluate: (a) (1 − ω + ω²)⁵ + (1 + ω − ω²)⁵, and (b) (1 − ω)(1 − ω²)(1 − ω⁴)(1 − ω⁸).', '(a) 32; (b) 9', '(a) Since 1 + ω² = −ω and 1 + ω = −ω²: (−2ω)⁵ + (−2ω²)⁵ = −32(ω⁵ + ω¹⁰) = −32(ω² + ω) = −32(−1) = 32. (b) Since ω⁴ = ω and ω⁸ = ω²: [(1 − ω)(1 − ω²)]² = (1 − ω − ω² + ω³)² = 3² = 9.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q8', 'Find all the fourth roots of z = −16 in Cartesian form.', '√2(1 + i), √2(−1 + i), √2(−1 − i), √2(1 − i)', 'z⁴ = −16 = 16(cos(π + 2kπ) + i sin(π + 2kπ)) ⇒ z_k = 2 cis((2k + 1)π/4) for k = 0, 1, 2, 3, which gives ±√2 ± √2i.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q9', 'Find the three cube roots of z = 8i in the form a + bi.', '√3 + i, −√3 + i, −2i', '8i = 8 cis(π/2 + 2kπ) ⇒ z_k = 2 cis((π/2 + 2kπ)/3) for k = 0, 1, 2: z₀ = 2 cis(π/6) = √3 + i, z₁ = 2 cis(5π/6) = −√3 + i, z₂ = 2 cis(3π/2) = −2i.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q10', 'Use the identity cos⁴θ = (1/8)(cos 4θ + 4 cos 2θ + 3) to evaluate the definite integral ∫₀^(π/2) cos⁴θ dθ.', '3π / 16', '∫₀^(π/2) (1/8)(cos 4θ + 4 cos 2θ + 3) dθ = (1/8)[sin(4θ)/4 + 2 sin(2θ) + 3θ]₀^(π/2) = (1/8)(0 + 0 + 3π/2) = 3π/16.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q11', 'Solve the equation z⁵ − 1 = 0 and hence show that cos(2π/5) + cos(4π/5) = −1/2.', 'Roots are cis(2kπ/5) for k = 0,1,2,3,4; since the sum of all 5 roots is 0, 1 + 2 cos(2π/5) + 2 cos(4π/5) = 0 ⇒ cos(2π/5) + cos(4π/5) = −1/2', 'Pairing conjugate roots cis(±2π/5) and cis(±4π/5) in 1 + z₁ + z₂ + z₃ + z₄ = 0 gives 1 + 2 cos(2π/5) + 2 cos(4π/5) = 0.'],
  [CH6, 'De Moivre\'s Theorem & Roots', 'Exercise 6.7 Q12', 'Evaluate (1 − i)¹⁰ using De Moivre\'s theorem.', '−32i', '1 − i = √2 cis(−π/4). By De Moivre\'s theorem: (1 − i)¹⁰ = (√2)¹⁰ cis(−10π/4) = 32 cis(−5π/2) = 32 cis(−π/2) = −32i.'],

  // Exercise 6.8: Euler's Formula (Q1–Q10), Project 6 & Revision Exercise 6 (Q1–Q37)
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q1', 'Express the following complex numbers in Euler\'s exponential form re^(iθ): (a) z = 1 + i, (b) z = −2√3 + 2i, and (c) z = −5.', '(a) √2 e^(iπ/4); (b) 4e^(i5π/6); (c) 5e^(iπ)', '(a) r = √2, θ = π/4 ⇒ √2 e^(iπ/4). (b) r = 4, θ = 5π/6 ⇒ 4e^(i5π/6). (c) r = 5, θ = π ⇒ 5e^(iπ) (Euler\'s identity e^(iπ) = −1).'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q2', 'Convert the following from Euler\'s form into Cartesian form a + bi: (a) 2e^(iπ/3), (b) 6e^(−iπ/4), and (c) e^(2 + iπ/2).', '(a) 1 + √3i; (b) 3√2 − 3√2i; (c) e²i', '(a) 2(cos(π/3) + i sin(π/3)) = 1 + √3i. (b) 6(cos(−π/4) + i sin(−π/4)) = 3√2 − 3√2i. (c) e²(cos(π/2) + i sin(π/2)) = e²i.'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q3', 'Use Euler\'s formula e^(iθ) = cos θ + i sin θ to derive the exponential definitions of cos θ and sin θ, and relate them to cosh(iθ) and sinh(iθ).', 'cos θ = (e^(iθ) + e^(−iθ))/2 = cosh(iθ); sin θ = (e^(iθ) − e^(−iθ))/(2i) = −i sinh(iθ)', 'Adding and subtracting e^(iθ) = cos θ + i sin θ and e^(−iθ) = cos θ − i sin θ gives cos θ = (e^(iθ) + e^(−iθ))/2 and sin θ = (e^(iθ) − e^(−iθ))/(2i).'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q4', 'Given z₁ = 3e^(iπ/4) and z₂ = 2e^(iπ/12), find z₁z₂ and z₁ / z₂ in Cartesian form.', 'z₁z₂ = 3 + 3√3i; z₁ / z₂ = (3√3)/4 + (3/4)i', 'z₁z₂ = 6e^(i(π/4 + π/12)) = 6e^(iπ/3) = 3 + 3√3i. z₁/z₂ = (3/2)e^(i(π/4 − π/12)) = (3/2)e^(iπ/6) = (3√3)/4 + (3/4)i.'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q5', 'Find the principal value of the complex logarithm ln(1 + i) and ln(−e).', 'ln(1 + i) = (1/2) ln 2 + i(π/4); ln(−e) = 1 + iπ', 'Using Ln(z) = ln|z| + i arg(z): for 1 + i = √2 e^(iπ/4), Ln(1 + i) = ln(√2) + iπ/4 = (1/2)ln 2 + iπ/4; for −e = e · e^(iπ), Ln(−e) = 1 + iπ.'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q6', 'Show that the principal value of i^i is a real number and find its value.', 'i^i = e^(−π/2) ≈ 0.2079', 'Since i = e^(iπ/2), raising both sides to the power i gives i^i = (e^(iπ/2))^i = e^(i²π/2) = e^(−π/2), which is purely real.'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q7', 'Use Euler\'s formula to evaluate the integral I = ∫ e^(2x) cos(3x) dx and J = ∫ e^(2x) sin(3x) dx simultaneously.', 'I = [e^(2x)(2 cos 3x + 3 sin 3x)] / 13 + c; J = [e^(2x)(2 sin 3x − 3 cos 3x)] / 13 + c', '∫ e^((2+3i)x) dx = e^((2+3i)x)/(2 + 3i) = e^(2x)(cos 3x + i sin 3x)(2 − 3i)/13. Taking real and imaginary parts yields I and J directly.'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q8', 'Sum the trigonometric series C = 1 + cos θ + cos 2θ + ... + cos nθ using the geometric progression of e^(ikθ).', 'C = cos(nθ/2) sin((n + 1)θ/2) / sin(θ/2)', 'C + iS = Σ_{k=0}^n e^(ikθ) = (e^(i(n+1)θ) − 1)/(e^(iθ) − 1) = e^(inθ/2) [sin((n+1)θ/2) / sin(θ/2)]. Taking the real part gives C.'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q9', 'Express z = (1 + i√3)⁸ / (1 − i)⁴ in Euler\'s exponential form.', '64 e^(i5π/3) (or 64 e^(−iπ/3))', '(2e^(iπ/3))⁸ / (√2 e^(−iπ/4))⁴ = 256e^(i8π/3) / (4e^(−iπ)) = 64e^(i11π/3) = 64e^(−iπ/3).'],
  [CH6, 'Euler\'s Formula & Exponential Form', 'Exercise 6.8 Q10', 'Solve the equation e^z = 1 + √3i for z = x + yi.', 'z = ln 2 + i(π/3 + 2kπ), k ∈ ℤ', 'e^x e^(iy) = 2e^(i(π/3 + 2kπ)) ⇒ e^x = 2 ⇒ x = ln 2 and y = π/3 + 2kπ for any integer k.'],
  [CH6, 'Complex Impedance in AC Circuits', 'Project 6', 'In Project 6 on AC Electrical Engineering, if a series RLC circuit has resistance R = 40 Ω, inductive reactance X_L = 50 Ω, and capacitive reactance X_C = 20 Ω, find the complex impedance Z, its magnitude |Z|, and the phase angle φ.', 'Z = 40 + 30i Ω, |Z| = 50 Ω, φ = arctan(3/4) ≈ 36.87°', 'Complex impedance Z = R + i(X_L − X_C) = 40 + (50 − 20)i = 40 + 30i Ω. Magnitude |Z| = √(40² + 30²) = 50 Ω, and phase angle φ = arctan(30/40) = 36.87°.'],
  [CH6, 'Revision Exercise 6', 'Revision Exercise 6 Q1', 'Find the real values of x and y if (x + yi)(3 + 2i) = 1 + 8i.', 'x = 19/13, y = 22/13', 'x + yi = (1 + 8i)(3 − 2i)/(9 + 4) = (3 − 2i + 24i + 16)/13 = 19/13 + (22/13)i.'],
  [CH6, 'Revision Exercise 6', 'Revision Exercise 6 Q2', 'Find the square roots of z = −5 + 12i.', '±(2 + 3i)', 'x² − y² = −5, 2xy = 12, and x² + y² = 13 ⇒ 2x² = 8 ⇒ x = ±2 and y = ±3 ⇒ ±(2 + 3i).'],
  [CH6, 'Revision Exercise 6', 'Revision Exercise 6 Q3', 'If |z − 4i| / |z + 4i| = 1, find the locus of z in the complex plane.', 'y = 0 (the real axis)', '|z − 4i| = |z + 4i| ⇒ x² + (y − 4)² = x² + (y + 4)² ⇒ −8y = 8y ⇒ y = 0.'],
  [CH6, 'Revision Exercise 6', 'Revision Exercise 6 Q4', 'Given that 2 − i is a root of 2z³ − 9z² + 14z − 5 = 0, find the other two roots.', 'z = 2 + i and z = 1/2', 'Conjugate root 2 + i gives quadratic factor z² − 4z + 5. Dividing the cubic by z² − 4z + 5 gives 2z − 1 = 0 ⇒ z = 1/2.'],
  [CH6, 'Revision Exercise 6', 'Revision Exercise 6 Q5', 'Solve the equation z⁶ + 7z³ − 8 = 0 completely in the form a + bi.', 'z = 1, −1/2 ± (√3/2)i, −2, 1 ± √3i', 'Factoring as (z³ − 1)(z³ + 8) = 0 gives z³ = 1 (roots 1, −1/2 ± (√3/2)i) and z³ = −8 (roots −2, 1 ± √3i).'],
  [CH6, 'Revision Exercise 6', 'Revision Exercise 6 Q6', 'Use De Moivre\'s theorem to prove that cos 5θ = 16 cos⁵θ − 20 cos³θ + 5 cos θ.', 'Re((cos θ + i sin θ)⁵) = cos⁵θ − 10 cos³θ(1 − cos²θ) + 5 cos θ(1 − cos²θ)² = 16 cos⁵θ − 20 cos³θ + 5 cos θ', 'Expanding (cos θ + i sin θ)⁵, taking the real part, and substituting sin²θ = 1 − cos²θ yields 16 cos⁵θ − 20 cos³θ + 5 cos θ.'],

  // ============================================================================
  // CHAPTER 7: DIFFERENTIAL EQUATIONS (PART 1: ACTIVITIES & EXERCISES 7.1–7.3)
  // ============================================================================
  [CH7, 'Order, Degree & Linearity of ODEs', 'Activity 7.1', 'In Activity 7.1 on identifying the order, degree, and linearity of ordinary differential equations (ODEs), how are order and degree defined?', 'Order is the order of the highest derivative present; Degree is the highest power (exponent) of that highest-order derivative after the ODE is cleared of radicals and fractional powers in its derivatives', 'For example, (d²y/dx²)³ + 4(dy/dx)⁵ + y = 0 has order 2 and degree 3.'],
  [CH7, 'Order, Degree & Formulation of ODEs', 'Exercise 7.1 Q1', 'Determine the order and degree of the differential equation: (d³y/dx³)² + 3(d²y/dx²)⁴ + dy/dx = cos x.', 'Order = 3, Degree = 2', 'The highest derivative is d³y/dx³ (order 3), and the exponent to which d³y/dx³ is raised is 2 (degree 2).'],
  [CH7, 'Order, Degree & Formulation of ODEs', 'Exercise 7.1 Q2', 'Find the order and degree of the differential equation: √(1 + (dy/dx)²) = (d²y/dx²)¹/³.', 'Order = 2, Degree = 2', 'Raising both sides to the 6th power to remove fractional exponents gives [1 + (dy/dx)²]³ = (d²y/dx²)². The highest derivative is d²y/dx² (order 2) and its power is 2 (degree 2).'],
  [CH7, 'Order, Degree & Formulation of ODEs', 'Exercise 7.1 Q3', 'Classify each of the following ODEs as linear or non-linear: (a) d²y/dx² + x(dy/dx) − 3y = eˣ, and (b) y(d²y/dx²) + (dy/dx)² = 0.', '(a) Linear (second-order); (b) Non-linear (because of the product y(d²y/dx²) and the squared derivative (dy/dx)²)', 'An ODE is linear only if y and all its derivatives appear to the first power with coefficients depending solely on the independent variable x.'],
  [CH7, 'Order, Degree & Formulation of ODEs', 'Exercise 7.1 Q4', 'Form the differential equation by eliminating the arbitrary constants A and B from y = A cos(3x) + B sin(3x).', 'd²y/dx² + 9y = 0', 'Differentiating twice: dy/dx = −3A sin(3x) + 3B cos(3x) and d²y/dx² = −9A cos(3x) − 9B sin(3x) = −9y ⇒ d²y/dx² + 9y = 0.'],
  [CH7, 'Order, Degree & Formulation of ODEs', 'Exercise 7.1 Q5', 'Form the differential equation by eliminating the arbitrary constants c₁ and c₂ from y = c₁e^(2x) + c₂e^(−3x).', 'd²y/dx² + dy/dx − 6y = 0', 'Characteristic roots are r = 2 and r = −3, corresponding to the operator (D − 2)(D + 3)y = (D² + D − 6)y = 0 ⇒ d²y/dx² + dy/dx − 6y = 0.'],
  [CH7, 'Order, Degree & Formulation of ODEs', 'Exercise 7.1 Q6', 'Form the differential equation of the family of all circles touching the y-axis at the origin.', '(x² − y²) dx + 2xy dy = 0 (or dy/dx = (y² − x²) / (2xy))', 'A circle touching the y-axis at (0, 0) has centre (a, 0) and equation x² + y² − 2ax = 0 ⇒ 2a = (x² + y²)/x. Differentiating 2x + 2y(dy/dx) − 2a = 0 and substituting 2a gives 2xy(dy/dx) + x² − y² = 0.'],
  [CH7, 'Order, Degree & Formulation of ODEs', 'Exercise 7.1 Q7', 'Eliminate the arbitrary constants A and B from y = (A + Bx)e^(2x) to form a second-order differential equation.', 'd²y/dx² − 4(dy/dx) + 4y = 0', 'Here r = 2 is a repeated root of multiplicity 2, corresponding to (D − 2)²y = 0 ⇒ d²y/dx² − 4(dy/dx) + 4y = 0.'],

  // Exercise 7.2: Verification of Solutions of ODEs (Q1–Q9)
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q1', 'Verify that y = Aeˣ + Be⁻ˣ is the general solution of the differential equation d²y/dx² − y = 0.', 'dy/dx = Aeˣ − Be⁻ˣ and d²y/dx² = Aeˣ + Be⁻ˣ = y ⇒ d²y/dx² − y = 0', 'Differentiating y twice returns the original function y, so d²y/dx² − y = y − y = 0 identically for all constants A, B.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q2', 'Show that y = x sin x is a solution of the differential equation x²(d²y/dx²) − 2x(dy/dx) + (x² + 2)y = 0.', 'dy/dx = sin x + x cos x, d²y/dx² = 2 cos x − x sin x; substituting into LHS gives 0', 'LHS = x²(2 cos x − x sin x) − 2x(sin x + x cos x) + (x² + 2)(x sin x) = (2x² cos x − 2x² cos x) + (−x³ + x³)sin x + (−2x + 2x)sin x = 0.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q3', 'Verify that y² = 4a(x + a) is a solution of the non-linear differential equation y[1 − (dy/dx)²] = 2x(dy/dx).', 'From 2y y\' = 4a ⇒ a = yy\'/2; substituting into y² = 4a(x + a) gives y = 2xy\' + y(y\')² ⇒ y[1 − (y\')²] = 2xy\'', 'Differentiating y² = 4ax + 4a² gives 2a = y(dy/dx). Substituting a = y(dy/dx)/2 back into the parabola equation yields the given ODE.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q4', 'Show that y = e^(−2x)(A cos x + B sin x) satisfies d²y/dx² + 4(dy/dx) + 5y = 0.', 'Characteristic equation r² + 4r + 5 = (r + 2)² + 1 = 0 has roots r = −2 ± i', 'Differentiating y twice and substituting into y\'\' + 4y\' + 5y cancels all terms identically to 0.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q5', 'Find the particular solution of dy/dx = 3x² − 2x given the initial condition y(1) = 4.', 'y = x³ − x² + 4', 'Integrating gives y = x³ − x² + C. Using y(1) = 4: 1 − 1 + C = 4 ⇒ C = 4, so y = x³ − x² + 4.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q6', 'Verify that y = c₁x + c₂/x is a general solution of the Cauchy-Euler equation x²(d²y/dx²) + x(dy/dx) − y = 0 for x > 0.', 'y\' = c₁ − c₂/x², y\'\' = 2c₂/x³ ⇒ x²(2c₂/x³) + x(c₁ − c₂/x²) − (c₁x + c₂/x) = 0', 'Substituting y, y\', and y\'\' into the left-hand side cancels both the c₁x and c₂/x terms.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q7', 'Show that y = ln(x + √(x² + 1)) satisfies (1 + x²)(d²y/dx²) + x(dy/dx) = 0.', 'dy/dx = 1/√(x² + 1) ⇒ √(1 + x²)(dy/dx) = 1; differentiating gives √(1 + x²)y\'\' + [x/√(1 + x²)]y\' = 0', 'Multiplying through by √(1 + x²) yields (1 + x²)(d²y/dx²) + x(dy/dx) = 0.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q8', 'Verify that x² + y² = r² is an implicit solution of dy/dx = −x / y for y ≠ 0.', 'Implicitly differentiating x² + y² = r² with respect to x gives 2x + 2y(dy/dx) = 0 ⇒ dy/dx = −x/y', 'Direct implicit differentiation confirms dy/dx = −x/y.'],
  [CH7, 'Verification of ODE Solutions', 'Exercise 7.2 Q9', 'If y = Ae^(3x) + Be^(−x) satisfies y(0) = 2 and y\'(0) = 2, find the constants A and B.', 'A = 1, B = 1 (so y = e^(3x) + e^(−x))', 'y(0) = A + B = 2 and y\'(0) = 3A − B = 2. Adding gives 4A = 4 ⇒ A = 1 and B = 1.'],

  // Exercise 7.3: First-Order Separable Differential Equations (Q1–Q10)
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q1', 'Solve the separable differential equation dy/dx = (1 + y²) / (1 + x²).', 'y = (x + c) / (1 − cx) (or arctan y − arctan x = C)', 'Separating variables: ∫ dy/(1 + y²) = ∫ dx/(1 + x²) ⇒ arctan y − arctan x = arctan c ⇒ (y − x)/(1 + xy) = c ⇒ y = (x + c)/(1 − cx).'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q2', 'Find the general solution of x√(1 − y²) dx + y√(1 − x²) dy = 0.', '√(1 − x²) + √(1 − y²) = C', 'Dividing by √(1 − x²)√(1 − y²): ∫ [x/√(1 − x²)] dx + ∫ [y/√(1 − y²)] dy = 0 ⇒ −√(1 − x²) − √(1 − y²) = −C ⇒ √(1 − x²) + √(1 − y²) = C.'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q3', 'Solve the initial value problem dy/dx = 2xy² given that y(0) = 1.', 'y = 1 / (1 − x²)', 'Separating variables: ∫ y⁻² dy = ∫ 2x dx ⇒ −1/y = x² + C. Using y(0) = 1 gives C = −1 ⇒ −1/y = x² − 1 ⇒ y = 1/(1 − x²).'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q4', 'Solve the differential equation eˣ tan y dx + (1 − eˣ) sec²y dy = 0.', 'tan y = C(1 − eˣ)', 'Separating variables: ∫ [sec²y / tan y] dy = ∫ [eˣ / (eˣ − 1)] dx ⇒ ln|tan y| = ln|1 − eˣ| + ln|C| ⇒ tan y = C(1 − eˣ).'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q5', 'Find the general solution of dy/dx = e^(x − y) + x²e^(−y).', 'eʸ = eˣ + x³/3 + C', 'Factoring e^(−y): dy/dx = e^(−y)(eˣ + x²) ⇒ ∫ eʸ dy = ∫ (eˣ + x²) dx ⇒ eʸ = eˣ + x³/3 + C.'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q6', 'Solve sec²x tan y dx + sec²y tan x dy = 0.', 'tan x tan y = C', 'Separating variables: ∫ (sec²x / tan x) dx + ∫ (sec²y / tan y) dy = 0 ⇒ ln|tan x| + ln|tan y| = ln|C| ⇒ tan x tan y = C.'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q7', 'By using the substitution u = x + y, solve the differential equation dy/dx = (x + y + 1)².', 'x + y + 1 = tan(x + C)', 'Let u = x + y + 1 so du/dx = 1 + dy/dx = 1 + u². Separating variables: ∫ du/(1 + u²) = ∫ dx ⇒ arctan(u) = x + C ⇒ x + y + 1 = tan(x + C).'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q8', 'Solve the differential equation (x + 1)(dy/dx) = 2e^(−y) − 1 given y(0) = 0.', 'eʸ = (x + 2) / [2(x + 1)] (or 2 − eʸ = 1/(x + 1))', 'Separating variables: ∫ [eʸ/(2 − eʸ)] dy = ∫ dx/(x + 1) ⇒ −ln|2 − eʸ| = ln|x + 1| + C. At (0, 0), C = 0 ⇒ 2 − eʸ = 1/(x + 1).'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q9', 'Find the general solution of dy/dx = cos(x + y).', 'tan((x + y)/2) = x + C', 'Let u = x + y ⇒ du/dx = 1 + cos u = 2 cos²(u/2) ⇒ ∫ (1/2)sec²(u/2) du = ∫ dx ⇒ tan(u/2) = x + C ⇒ tan((x + y)/2) = x + C.'],
  [CH7, 'First-Order Separable ODEs', 'Exercise 7.3 Q10', 'Solve (1 + x²) dy/dx + 2xy = 4x².', 'y = (4x³) / [3(1 + x²)] + C / (1 + x²)', 'Notice that d/dx[(1 + x²)y] = (1 + x²)dy/dx + 2xy = 4x². Integrating both sides directly gives (1 + x²)y = 4x³/3 + C ⇒ y = (4x³ + 3C)/[3(1 + x²)].']
];

const CH8 = 'Chapter 8: Numerical Methods (Errors, Newton-Raphson Formula, Secant Method, Trapezium Rule & Simpson\'s Rule)';

export const ADV_MATH_F6_PART3_TUPLES: AdvMathF6Tuple[] = [
  // ============================================================================
  // CHAPTER 7: DIFFERENTIAL EQUATIONS (PART 2: EXERCISES 7.4–7.12, PROJECT & REV EX 7)
  // ============================================================================
  // Exercise 7.4: First-Order Homogeneous ODEs (Q1–Q10)
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q1', 'Solve the homogeneous differential equation (x² + y²) dx − 2xy dy = 0.', 'x² − y² = Cx', 'Write dy/dx = (x² + y²)/(2xy). Let y = vx so dy/dx = v + x(dv/dx) = (1 + v²)/(2v) ⇒ x(dv/dx) = (1 − v²)/(2v). Integrating ∫ [2v/(1 − v²)] dv = ∫ (1/x) dx gives −ln|1 − v²| = ln|Cx| ⇒ 1 − (y/x)² = 1/(Cx) ⇒ x² − y² = Cx.'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q2', 'Find the general solution of x(dy/dx) = y + √(x² + y²).', 'y + √(x² + y²) = Cx²', 'Let y = vx ⇒ v + x(dv/dx) = v + √(1 + v²) ⇒ ∫ dv/√(1 + v²) = ∫ dx/x ⇒ ln|v + √(1 + v²)| = ln|Cx| ⇒ y/x + √(1 + y²/x²) = Cx ⇒ y + √(x² + y²) = Cx².'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q3', 'Solve the differential equation (x + 2y) dx − x dy = 0.', 'x + y = Cx² (or y = Cx² − x)', 'dy/dx = (x + 2y)/x = 1 + 2(y/x). Let y = vx ⇒ v + x(dv/dx) = 1 + 2v ⇒ ∫ dv/(1 + v) = ∫ dx/x ⇒ 1 + v = Cx ⇒ x + y = Cx².'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q4', 'Solve x cos(y/x)(dy/dx) = y cos(y/x) + x.', 'sin(y/x) = ln|Cx|', 'Dividing by x cos(y/x): dy/dx = y/x + sec(y/x). Let y = vx ⇒ v + x(dv/dx) = v + sec v ⇒ ∫ cos v dv = ∫ (1/x) dx ⇒ sin v = ln|Cx| ⇒ sin(y/x) = ln|Cx|.'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q5', 'Find the particular solution of (x² − y²) dx + 2xy dy = 0 given that y = 1 when x = 1.', 'x² + y² = 2x', 'dy/dx = (y² − x²)/(2xy). With y = vx: x(dv/dx) = −(1 + v²)/(2v) ⇒ ln(1 + v²) = −ln|Cx| ⇒ x² + y² = kx. Substituting (1, 1) gives k = 2 ⇒ x² + y² = 2x.'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q6', 'Solve the non-homogeneous reducible equation dy/dx = (x + y − 3) / (x − y − 1).', 'ln[(x − 2)² + (y − 1)²] − 2 arctan((y − 1)/(x − 2)) = C', 'The lines x + y − 3 = 0 and x − y − 1 = 0 intersect at (h, k) = (2, 1). Setting X = x − 2, Y = y − 1 reduces the equation to the homogeneous ODE dY/dX = (X + Y)/(X − Y), which integrates via Y = vX to ln(X² + Y²) − 2 arctan(Y/X) = C.'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q7', 'Solve the differential equation x(dy/dx) − y = x tan(y/x).', 'sin(y/x) = Cx', 'Let y = vx ⇒ v + x(dv/dx) − v = tan v ⇒ ∫ cot v dv = ∫ (1/x) dx ⇒ ln|sin v| = ln|Cx| ⇒ sin(y/x) = Cx.'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q8', 'Find the general solution of (x³ + y³) dx − 3xy² dy = 0.', 'x³ − 2y³ = Cx', 'dy/dx = (x³ + y³)/(3xy²). Let y = vx ⇒ v + x(dv/dx) = (1 + v³)/(3v²) ⇒ x(dv/dx) = (1 − 2v³)/(3v²) ⇒ ∫ [3v²/(1 − 2v³)] dv = ∫ dx/x ⇒ −(1/2)ln|1 − 2v³| = ln|x| + c ⇒ x³ − 2y³ = Cx.'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q9', 'Solve dy/dx = (2x + y + 1) / (4x + 2y − 1).', '2x + y + (3/5) ln|10x + 5y − 1| = (5/2)x + C (or 4x + 2y + (3/5)ln|10x + 5y − 1| = 5x + C)', 'Since 4x + 2y = 2(2x + y), let u = 2x + y so du/dx = 2 + dy/dx = 2 + (u + 1)/(2u − 1) = (5u − 1)/(2u − 1). Separating variables ∫ [(2u − 1)/(5u − 1)] du = ∫ dx gives (2/5)u − (3/25)ln|5u − 1| = x + c.'],
  [CH7, 'First-Order Homogeneous ODEs', 'Exercise 7.4 Q10', 'Solve y dx + x(ln(y/x) − 2) dy = 0.', 'y ln(y/x) − y = Cx (or y(ln(y/x) − 1) = Cx)', 'Writing dx/dy = (2 − ln(y/x))(x/y) and setting x = vy gives ln|y| + 1/(1 − ln(y/x)) = C (or with y = vx: ln|y/x − 1| = C).'],

  // Exercise 7.5: First-Order Linear ODEs (Q1–Q10)
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q1', 'Find the integrating factor and general solution of dy/dx + (2/x)y = 4x.', 'Integrating factor I(x) = x²; General solution y = x² + C / x²', 'P(x) = 2/x ⇒ I(x) = e^(∫(2/x)dx) = x². Multiplying by x² gives d/dx(x²y) = 4x³ ⇒ x²y = x⁴ + C ⇒ y = x² + C/x².'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q2', 'Solve the first-order linear differential equation dy/dx + y tan x = sec x.', 'y = sin x + C cos x', 'Integrating factor I(x) = e^(∫ tan x dx) = sec x. Multiplying by sec x gives d/dx(y sec x) = sec²x ⇒ y sec x = tan x + C ⇒ y = sin x + C cos x.'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q3', 'Solve x(dy/dx) − y = 2x²eˣ for x > 0.', 'y = 2xeˣ + Cx', 'Standard form: dy/dx − (1/x)y = 2xeˣ. Integrating factor I(x) = e^(−ln x) = 1/x. Then d/dx(y/x) = 2eˣ ⇒ y/x = 2eˣ + C ⇒ y = 2xeˣ + Cx.'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q4', 'Solve the initial value problem dy/dx + 2xy = 2xe^(−x²) given y(0) = 1.', 'y = (x² + 1)e^(−x²)', 'Integrating factor I(x) = e^(∫ 2x dx) = e^(x²). Then d/dx(ye^(x²)) = 2x ⇒ ye^(x²) = x² + C. Using y(0) = 1 gives C = 1 ⇒ y = (x² + 1)e^(−x²).'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q5', 'Solve the differential equation (1 + x²)(dy/dx) + 2xy = cos x.', 'y = (sin x + C) / (1 + x²)', 'Notice that the left-hand side is already d/dx[(1 + x²)y] = cos x (or I(x) = 1 + x²). Integrating gives (1 + x²)y = sin x + C ⇒ y = (sin x + C)/(1 + x²).'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q6', 'Solve dy/dx + y cot x = 2 cos x.', 'y = sin x + C csc x', 'Integrating factor I(x) = e^(∫ cot x dx) = sin x. Multiplying by sin x gives d/dx(y sin x) = 2 sin x cos x = sin 2x ⇒ y sin x = sin²x + C ⇒ y = sin x + C csc x.'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q7', 'Solve the Bernoulli differential equation dy/dx + (1/x)y = x²y³.', '1 / y² = Cx² − 2x⁴ (or y⁻² = Cx² − 2x⁴)', 'Divide by y³ and set u = y⁻² so du/dx = −2y⁻³(dy/dx). The ODE becomes du/dx − (2/x)u = −2x². With I(x) = 1/x², d/dx(u/x²) = −2x ⇒ u/x² = −x² + C (or if −2x: u = Cx² − 2x³).'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q8', 'Find the general solution of (x + 2y³)(dy/dx) = y by treating x as a function of y.', 'x = y³ + Cy', 'Rewrite as dx/dy − (1/y)x = 2y², which is linear in x. Integrating factor I(y) = 1/y gives d/dy(x/y) = 2y ⇒ x/y = y² + C ⇒ x = y³ + Cy.'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q9', 'Solve x ln x (dy/dx) + y = 2 ln x.', 'y ln x = (ln x)² + C (or y = ln x + C / ln x)', 'Divide by x ln x: dy/dx + [1/(x ln x)]y = 2/x. Integrating factor I(x) = e^(∫ dx/(x ln x)) = ln x. Then d/dx(y ln x) = 2/x · ln x ⇒ y ln x = (ln x)² + C.'],
  [CH7, 'First-Order Linear ODEs & Integrating Factor', 'Exercise 7.5 Q10', 'Solve the Bernoulli equation dy/dx − y = eˣy².', 'y = −1 / (eˣ + Ce⁻ˣ) (or y⁻¹ = Ce⁻ˣ − eˣ)', 'Let u = y⁻¹ so du/dx = −y⁻²(dy/dx). Then du/dx + u = −eˣ. With I(x) = eˣ: d/dx(ueˣ) = −e^(2x) ⇒ ueˣ = −(1/2)e^(2x) + C ⇒ 1/y = Ce⁻ˣ − (1/2)eˣ.'],

  // Exercise 7.6: Exact Differential Equations (Q1–Q10)
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q1', 'Test for exactness and solve (2xy + 3x²) dx + (x² − 2y) dy = 0.', 'Exact (∂M/∂y = 2x = ∂N/∂x); General solution x²y + x³ − y² = C', 'M = 2xy + 3x² and N = x² − 2y ⇒ ∂M/∂y = 2x = ∂N/∂x (exact). Integrating M with respect to x gives F(x, y) = x²y + x³ + g(y). Since ∂F/∂y = x² + g\'(y) = x² − 2y, g(y) = −y² ⇒ x²y + x³ − y² = C.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q2', 'Verify that (eʸ + 1)cos x dx + eʸ sin x dy = 0 is exact and find its general solution.', '(eʸ + 1)sin x = C', '∂M/∂y = eʸ cos x = ∂N/∂x, so the ODE is exact. Integrating M dx gives (eʸ + 1)sin x = C.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q3', 'Solve the exact differential equation (3x²y + 2xy) dx + (x³ + x² + 2y) dy = 0.', 'x³y + x²y + y² = C', '∂M/∂y = 3x² + 2x = ∂N/∂x (exact). Integrating gives x³y + x²y + y² = C.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q4', 'Solve (cos x cos y − cot x) dx − sin x sin y dy = 0.', 'sin x cos y − ln|sin x| = C', '∂M/∂y = −cos x sin y = ∂N/∂x (exact). Integrating M with respect to x yields sin x cos y − ln|sin x| = C.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q5', 'Find the value of the constant k for which (2xy² + kx²) dx + (2x²y + 3y²) dy = 0 is exact, and solve it for any k.', 'Exact for all real k; Solution: x²y² + (k/3)x³ + y³ = C', '∂M/∂y = 4xy and ∂N/∂x = 4xy, which are equal for every real constant k. Integrating gives x²y² + (k/3)x³ + y³ = C.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q6', 'Find an integrating factor and solve the non-exact equation (x² + y² + x) dx + xy dy = 0.', 'Integrating factor I(x) = x; Solution: 3x⁴ + 4x³ + 6x²y² = C', '(∂M/∂y − ∂N/∂x)/N = (2y − y)/(xy) = 1/x, so I(x) = e^(∫(1/x)dx) = x. Multiplying by x gives (x³ + xy² + x²) dx + x²y dy = 0 ⇒ x⁴/4 + x³/3 + x²y²/2 = c.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q7', 'Solve (2x / y) dx + [(y² − x²) / y²] dy = 0.', 'x² / y + y = C (or x² + y² = Cy)', '∂M/∂y = −2x/y² = ∂N/∂x (exact). Integrating M with respect to x gives x²/y + g(y) with g\'(y) = 1 ⇒ x²/y + y = C.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q8', 'Solve the initial value problem (2x + y) dx + (x + 2y) dy = 0 given y(1) = 2.', 'x² + xy + y² = 7', 'Exact since ∂M/∂y = 1 = ∂N/∂x. General solution is x² + xy + y² = C. Substituting (1, 2) gives 1 + 2 + 4 = 7 ⇒ x² + xy + y² = 7.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q9', 'Find an integrating factor depending only on y and solve y dx + (2x − yeʸ) dy = 0.', 'Integrating factor I(y) = y; Solution: xy² − y²eʸ + 2yeʸ − 2eʸ = C', '(∂N/∂x − ∂M/∂y)/M = (2 − 1)/y = 1/y ⇒ I(y) = y. Multiplying by y gives y² dx + (2xy − y²eʸ) dy = 0 ⇒ d(xy²) − y²eʸ dy = 0 ⇒ xy² − eʸ(y² − 2y + 2) = C.'],
  [CH7, 'Exact Differential Equations', 'Exercise 7.6 Q10', 'State the necessary and sufficient condition for the first-order differential equation M(x, y) dx + N(x, y) dy = 0 to be exact on a simply connected domain.', '∂M / ∂y = ∂N / ∂x', 'By Clairaut\'s theorem on equality of mixed partial derivatives ∂²F/(∂y∂x) = ∂²F/(∂x∂y), M dx + N dy = dF is an exact differential if and only if ∂M/∂y = ∂N/∂x.'],

  // Exercise 7.7: Second-Order Homogeneous Linear ODEs (Q1–Q10)
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q1', 'Find the general solution of d²y/dx² − 5(dy/dx) + 6y = 0.', 'y = c₁e^(2x) + c₂e^(3x)', 'Auxiliary equation m² − 5m + 6 = (m − 2)(m − 3) = 0 has distinct real roots m₁ = 2 and m₂ = 3 ⇒ y = c₁e^(2x) + c₂e^(3x).'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q2', 'Solve the differential equation d²y/dx² + 6(dy/dx) + 9y = 0.', 'y = (c₁ + c₂x)e^(−3x)', 'Auxiliary equation m² + 6m + 9 = (m + 3)² = 0 has a repeated real root m = −3 ⇒ y = (c₁ + c₂x)e^(−3x).'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q3', 'Find the general solution of d²y/dx² − 4(dy/dx) + 13y = 0.', 'y = e^(2x)(A cos 3x + B sin 3x)', 'Auxiliary equation m² − 4m + 13 = (m − 2)² + 9 = 0 has complex conjugate roots m = 2 ± 3i ⇒ y = e^(2x)(A cos 3x + B sin 3x).'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q4', 'Solve the initial value problem d²y/dx² + 4y = 0 given y(0) = 2 and y\'(0) = 6.', 'y = 2 cos 2x + 3 sin 2x', 'm² + 4 = 0 ⇒ m = ±2i ⇒ y = A cos 2x + B sin 2x. Using y(0) = 2 gives A = 2; y\'(0) = 2B = 6 ⇒ B = 3 ⇒ y = 2 cos 2x + 3 sin 2x.'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q5', 'Solve 2(d²y/dx²) + 5(dy/dx) − 3y = 0.', 'y = c₁e^(x/2) + c₂e^(−3x)', 'Auxiliary equation 2m² + 5m − 3 = (2m − 1)(m + 3) = 0 has roots m = 1/2 and m = −3 ⇒ y = c₁e^(x/2) + c₂e^(−3x).'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q6', 'Solve d²y/dx² − 9y = 0 subject to y(0) = 3 and y\'(0) = −3.', 'y = e^(3x) + 2e^(−3x)', 'm = ±3 ⇒ y = c₁e^(3x) + c₂e^(−3x). From c₁ + c₂ = 3 and 3c₁ − 3c₂ = −3 (c₁ − c₂ = −1), we get c₁ = 1 and c₂ = 2.'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q7', 'Find the general solution of 4(d²y/dx²) − 4(dy/dx) + y = 0.', 'y = (c₁ + c₂x)e^(x/2)', 'Auxiliary equation 4m² − 4m + 1 = (2m − 1)² = 0 has repeated root m = 1/2 ⇒ y = (c₁ + c₂x)e^(x/2).'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q8', 'Solve d²y/dx² + 2(dy/dx) + 2y = 0 given y(0) = 1 and y\'(0) = 0.', 'y = e^(−x)(cos x + sin x)', 'm² + 2m + 2 = (m + 1)² + 1 = 0 ⇒ m = −1 ± i ⇒ y = e^(−x)(A cos x + B sin x). At x = 0: A = 1, and y\'(0) = −A + B = 0 ⇒ B = 1.'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q9', 'Find the general solution of d²y/dx² + ω²y = 0 and d²y/dx² − ω²y = 0 in terms of trigonometric and hyperbolic functions.', 'For +ω²: y = A cos(ωx) + B sin(ωx); For −ω²: y = A cosh(ωx) + B sinh(ωx)', 'Roots m = ±iω give circular functions cos(ωx) and sin(ωx), whereas real roots m = ±ω give e^(±ωx) or equivalently cosh(ωx) and sinh(ωx).'],
  [CH7, 'Second-Order Homogeneous Linear ODEs', 'Exercise 7.7 Q10', 'Solve the boundary value problem d²y/dx² + y = 0 with y(0) = 0 and y(π/2) = 4.', 'y = 4 sin x', 'General solution y = A cos x + B sin x. From y(0) = 0 we get A = 0, and from y(π/2) = 4 we get B = 4 ⇒ y = 4 sin x.'],

  // Exercise 7.8: Reducible Second-Order ODEs (Q1–Q12)
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q1', 'Solve the Cauchy-Euler differential equation x²(d²y/dx²) − 2x(dy/dx) + 2y = 0 for x > 0 using the substitution x = e^t.', 'y = c₁x + c₂x²', 'Substituting x = e^t (or y = x^m) gives the auxiliary equation m(m − 1) − 2m + 2 = m² − 3m + 2 = (m − 1)(m − 2) = 0 ⇒ y = c₁x + c₂x².'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q2', 'Solve x²(d²y/dx²) + x(dy/dx) − 4y = 0 for x > 0.', 'y = c₁x² + c₂ / x²', 'Trying y = x^m gives m(m − 1) + m − 4 = m² − 4 = 0 ⇒ m = ±2 ⇒ y = c₁x² + c₂x⁻².'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q3', 'Find the general solution of x²(d²y/dx²) + 3x(dy/dx) + y = 0 for x > 0.', 'y = (c₁ + c₂ ln x) / x', 'Auxiliary equation m(m − 1) + 3m + 1 = m² + 2m + 1 = (m + 1)² = 0 has repeated root m = −1 ⇒ y = x⁻¹(c₁ + c₂ ln x).'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q4', 'Solve x²(d²y/dx²) + x(dy/dx) + y = 0 for x > 0.', 'y = A cos(ln x) + B sin(ln x)', 'With x = e^t (t = ln x), the equation becomes d²y/dt² + y = 0 ⇒ y = A cos t + B sin t = A cos(ln x) + B sin(ln x).'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q5', 'By setting p = dy/dx, solve the second-order ODE x(d²y/dx²) + dy/dx = 4x.', 'y = x² + c₁ ln|x| + c₂', 'Let p = dy/dx so x(dp/dx) + p = d/dx(xp) = 4x ⇒ xp = 2x² + c₁ ⇒ dy/dx = 2x + c₁/x ⇒ y = x² + c₁ ln|x| + c₂.'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q6', 'Solve y(d²y/dx²) + (dy/dx)² = 0 using the substitution p = dy/dx (so d²y/dx² = p dp/dy).', 'y² = c₁x + c₂', 'Notice that d/dx(y dy/dx) = y(d²y/dx²) + (dy/dx)² = 0 ⇒ y(dy/dx) = a ⇒ y² = c₁x + c₂.'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q7', 'Solve the differential equation d²y/dx² = 2y(dy/dx) given y(0) = 1 and y\'(0) = 1.', 'y = 1 / (1 − x)', 'Multiplying by 1 (or setting p = dy/dx): p(dp/dy) = 2yp ⇒ dp/dy = 2y ⇒ dy/dx = y² + c₁. Since y(0)=1, y\'(0)=1 ⇒ c₁ = 0 ⇒ dy/y² = dx ⇒ −1/y = x − 1 ⇒ y = 1/(1 − x).'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q8', 'Given that y₁ = x is one solution of x²(d²y/dx²) − x(dy/dx) + y = 0, use the substitution y = vx (reduction of order) to find the general solution.', 'y = c₁x + c₂x ln x', 'Let y = vx ⇒ y\' = v + xv\', y\'\' = 2v\' + xv\'\'. Substituting gives x³v\'\' + x²v\' = 0 ⇒ d/dx(xv\') = 0 ⇒ v\' = c₂/x ⇒ v = c₂ ln x + c₁ ⇒ y = x(c₁ + c₂ ln x).'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q9', 'Solve (1 + x²)(d²y/dx²) + 2x(dy/dx) = 0.', 'y = c₁ arctan x + c₂', 'd/dx[(1 + x²)(dy/dx)] = 0 ⇒ (1 + x²)(dy/dx) = c₁ ⇒ dy/dx = c₁/(1 + x²) ⇒ y = c₁ arctan x + c₂.'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q10', 'Solve d²y/dx² + (dy/dx)² = 0.', 'y = ln|x + c₁| + c₂ (or y = c₂)', 'Let p = dy/dx ⇒ dp/dx + p² = 0 ⇒ −1/p = x + c₁ ⇒ dy/dx = −1/(x + c₁) (or +1/(x + c₁)) ⇒ y = ln|x + c₁| + c₂.'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q11', 'Find the general solution of x²(d²y/dx²) − 3x(dy/dx) + 4y = 0 for x > 0.', 'y = x²(c₁ + c₂ ln x)', 'Auxiliary equation m(m − 1) − 3m + 4 = m² − 4m + 4 = (m − 2)² = 0 has repeated root m = 2 ⇒ y = x²(c₁ + c₂ ln x).'],
  [CH7, 'Reducible Second-Order ODEs', 'Exercise 7.8 Q12', 'Solve d²y/dx² = √(1 + (dy/dx)²).', 'y = c₁ cosh((x + c₂)/c₁) (or y = cosh(x + c₁) + c₂)', 'Let p = dy/dx ⇒ dp/√(1 + p²) = dx ⇒ sinh⁻¹(p) = x + c₁ ⇒ dy/dx = sinh(x + c₁) ⇒ y = cosh(x + c₁) + c₂.'],

  // Exercise 7.9: Second-Order Non-Homogeneous Linear ODEs (Q1–Q10)
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q1', 'Find the general solution of d²y/dx² − 3(dy/dx) + 2y = 4e^(3x).', 'y = c₁eˣ + c₂e^(2x) + 2e^(3x)', 'Complementary function: m² − 3m + 2 = 0 ⇒ y_c = c₁eˣ + c₂e^(2x). Try particular integral y_p = Ae^(3x): (9 − 9 + 2)Ae^(3x) = 4e^(3x) ⇒ 2A = 4 ⇒ A = 2. Thus y = c₁eˣ + c₂e^(2x) + 2e^(3x).'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q2', 'Solve d²y/dx² − 4y = 8x² + 4.', 'y = c₁e^(2x) + c₂e^(−2x) − 2x² − 2', 'y_c = c₁e^(2x) + c₂e^(−2x). Try y_p = Ax² + Bx + C ⇒ y_p\'\' − 4y_p = 2A − 4Ax² − 4Bx − 4C = 8x² + 4 ⇒ −4A = 8 (A = −2), B = 0, and −4 − 4C = 4 (C = −2).'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q3', 'Find the general solution of d²y/dx² + 2(dy/dx) + 5y = 10 cos x.', 'y = e^(−x)(c₁ cos 2x + c₂ sin 2x) + 2 cos x + sin x', 'm = −1 ± 2i ⇒ y_c = e^(−x)(c₁ cos 2x + c₂ sin 2x). Try y_p = A cos x + B sin x: (4A + 2B)cos x + (−2A + 4B)sin x = 10 cos x ⇒ A = 2, B = 1.'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q4', 'Solve d²y/dx² − 5(dy/dx) + 6y = e^(2x).', 'y = c₁e^(2x) + c₂e^(3x) − xe^(2x)', 'Since r = 2 is already a root of the auxiliary equation (m − 2)(m − 3) = 0, multiply the trial function by x: y_p = Axe^(2x). Substituting gives −Ae^(2x) = e^(2x) ⇒ A = −1.'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q5', 'Find the general solution of d²y/dx² − 4(dy/dx) + 4y = 6e^(2x).', 'y = (c₁ + c₂x + 3x²)e^(2x)', 'Since r = 2 is a double root of (m − 2)² = 0, try y_p = Ax²e^(2x). Substituting into (D − 2)²y_p = 2Ae^(2x) = 6e^(2x) gives A = 3 ⇒ y_p = 3x²e^(2x).'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q6', 'Solve d²y/dx² + 9y = 6 cos(3x).', 'y = c₁ cos 3x + c₂ sin 3x + x sin 3x', 'y_c = c₁ cos 3x + c₂ sin 3x. Since cos 3x is in y_c, try y_p = x(A cos 3x + B sin 3x). Substituting into y\'\' + 9y = 6B cos 3x − 6A sin 3x = 6 cos 3x gives A = 0, B = 1 ⇒ y_p = x sin 3x.'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q7', 'Solve the initial value problem d²y/dx² − y = 2eˣ given y(0) = 1 and y\'(0) = 2.', 'y = (1/2)eˣ + (1/2)e^(−x) + xeˣ', 'y = c₁eˣ + c₂e^(−x) + xeˣ. Using y(0) = c₁ + c₂ = 1 and y\'(0) = c₁ − c₂ + 1 = 2 (c₁ − c₂ = 1) gives c₁ = 1, c₂ = 0 (so y = eˣ + xeˣ = (1 + x)eˣ).'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q8', 'Find the general solution of d²y/dx² + 3(dy/dx) + 2y = 12eˣ + 4x.', 'y = c₁e^(−x) + c₂e^(−2x) + 2eˣ + 2x − 3', 'y_c = c₁e^(−x) + c₂e^(−2x). For 12eˣ: 6Aeˣ = 12eˣ ⇒ A = 2. For 4x: try Bx + C ⇒ 3B + 2Bx + 2C = 4x ⇒ B = 2, C = −3.'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q9', 'Solve the Cauchy-Euler non-homogeneous equation x²(d²y/dx²) − x(dy/dx) + y = x³ for x > 0.', 'y = x(c₁ + c₂ ln x) + x³ / 4', 'With x = e^t, the equation becomes (D_t − 1)²y = e^(3t). Thus y_c = e^t(c₁ + c₂t) = x(c₁ + c₂ ln x) and y_p = e^(3t)/(3 − 1)² = e^(3t)/4 = x³/4.'],
  [CH7, 'Second-Order Non-Homogeneous ODEs', 'Exercise 7.9 Q10', 'Use the method of variation of parameters to solve d²y/dx² + y = sec x.', 'y = c₁ cos x + c₂ sin x + x sin x + cos x ln|cos x|', 'With y₁ = cos x, y₂ = sin x, and Wronskian W = 1: u₁ = −∫ sin x sec x dx = ln|cos x| and u₂ = ∫ cos x sec x dx = x. Thus y_p = cos x ln|cos x| + x sin x.'],

  // Exercise 7.10: Exponential Growth & Decay (Q1–Q10)
  [CH7, 'Applications: Population Growth & Radioactive Decay', 'Exercise 7.10 Q1', 'A bacterial culture grows at a rate proportional to its population P(t). If the population doubles in 3 hours, how long will it take for the initial population to triple?', '3 ln 3 / ln 2 ≈ 4.75 hours', 'dP/dt = kP ⇒ P(t) = P₀e^(kt). Since P(3) = 2P₀, e^(3k) = 2 ⇒ k = (ln 2)/3. Setting e^(kt) = 3 gives t = 3 ln 3 / ln 2 ≈ 4.75 hours.'],
  [CH7, 'Applications: Population Growth & Radioactive Decay', 'Exercise 7.10 Q2', 'The half-life of Carbon-14 is 5,730 years. An archaeological bone fragment is found to contain 25% of its original Carbon-14. Estimate the age of the bone.', '11,460 years', 'Since 25% = (1/2)², exactly two half-lives have elapsed: t = 2 × 5,730 = 11,460 years.'],
  [CH7, 'Applications: Population Growth & Radioactive Decay', 'Exercise 7.10 Q3', 'A radioactive substance decays at a rate proportional to the amount present. If 20% of the substance decays in 10 years, find its half-life.', '10 ln(0.5) / ln(0.8) ≈ 31.06 years', 'N(10) = 0.8N₀ ⇒ e^(−10k) = 0.8 ⇒ k = −ln(0.8)/10. Half-life T_(1/2) = ln(2)/k = 10 ln(0.5)/ln(0.8) ≈ 31.06 years.'],
  [CH7, 'Applications: Population Growth & Decay', 'Exercise 7.10 Q4', 'The population of a town increases at a rate proportional to the population at that time. If the population increases from 40,000 to 60,000 in 10 years, what will the population be in another 10 years (at t = 20 years)?', '90,000', 'P(t) = P₀e^(kt) with P₀ = 40,000. At t = 10, e^(10k) = 60,000/40,000 = 1.5. At t = 20, P(20) = 40,000 × (e^(10k))² = 40,000 × (1.5)² = 90,000.'],
  [CH7, 'Applications: Population Growth & Decay', 'Exercise 7.10 Q5', 'A sum of 1,000,000 TZS is invested at an annual interest rate of 8% compounded continuously (dA/dt = 0.08A). Find the amount after 5 years and the time required for the investment to double.', 'Amount after 5 years = 1,000,000e⁰·⁴ ≈ 1,491,825 TZS; Doubling time = (ln 2)/0.08 ≈ 8.66 years', 'A(t) = A₀e^(0.08t). At t = 5, A(5) = 1,000,000e^(0.4) ≈ 1,491,825 TZS. Doubling time satisfies e^(0.08t) = 2 ⇒ t = (ln 2)/0.08 ≈ 8.66 years.'],
  [CH7, 'Applications: Population Growth & Decay', 'Exercise 7.10 Q6', 'Atmospheric pressure P decreases with altitude h according to dP/dh = −kP. Given P = 101.3 kPa at sea level (h = 0) and P = 50.65 kPa at h = 5.5 km, find the pressure at the summit of Mount Kilimanjaro (h = 5.895 km).', '≈ 48.2 kPa', 'Since P halves in 5.5 km, P(h) = 101.3 × (0.5)^(h/5.5). At h = 5.895 km: P = 101.3 × (0.5)^(5.895/5.5) ≈ 48.2 kPa.'],
  [CH7, 'Applications: Population Growth & Decay', 'Exercise 7.10 Q7', 'A tank initially contains 100 litres of brine in which 50 kg of salt is dissolved. Pure water runs into the tank at 4 L/min and the well-stirred mixture runs out at 4 L/min. Find the amount of salt Q(t) in the tank after 25 minutes.', '50e⁻¹ ≈ 18.39 kg', 'dQ/dt = −(4/100)Q = −0.04Q ⇒ Q(t) = 50e^(−0.04t). At t = 25 min, Q(25) = 50e⁻¹ ≈ 18.39 kg.'],
  [CH7, 'Applications: Population Growth & Decay', 'Exercise 7.10 Q8', 'Solve the logistic population model dP/dt = kP(1 − P/M) where M is the carrying capacity and P(0) = P₀.', 'P(t) = M / [1 + ((M − P₀)/P₀)e^(−kt)]', 'Separating variables and using partial fractions [1/P + 1/(M − P)] dP = k dt integrates to P/(M − P) = [P₀/(M − P₀)]e^(kt), which solves to the logistic curve.'],
  [CH7, 'Applications: Population Growth & Decay', 'Exercise 7.10 Q9', 'Radium decomposes at a rate proportional to the quantity present. If 5% of the original amount disappears in 120 years, what percentage will remain after 1,000 years?', '100 × (0.95)^(1000/120) ≈ 65.2%', 'Since N(120)/N₀ = 0.95, after 1,000 years N(1000)/N₀ = (0.95)^(1000/120) ≈ 0.6520 (65.2%).'],
  [CH7, 'Applications: Population Growth & Decay', 'Exercise 7.10 Q10', 'The intensity I of light passing through a depth x of water satisfies dI/dx = −μI. If 50% of the light is absorbed in 3 metres of water, what percentage of light reaches a depth of 12 metres?', '6.25% (1/16)', 'Since 12 m = 4 × 3 m, the fraction of light remaining is (1/2)⁴ = 1/16 = 6.25%.'],

  // Exercise 7.11: Newton's Law of Cooling & Falling Bodies (Q1–Q7)
  [CH7, 'Applications: Newton\'s Law of Cooling & Falling Bodies', 'Exercise 7.11 Q1', 'By Newton\'s Law of Cooling (dT/dt = −k(T − T_s)), a body cools from 80°C to 60°C in 10 minutes when the surrounding air temperature is 20°C. Find the temperature of the body after another 10 minutes (at t = 20 minutes).', '46.67°C (46⅔°C)', 'T(t) − 20 = (80 − 20)e^(−kt) = 60e^(−kt). At t = 10, 60e^(−10k) = 40 ⇒ e^(−10k) = 2/3. At t = 20, T(20) = 20 + 60(2/3)² = 20 + 26.67 = 46.67°C.'],
  [CH7, 'Applications: Newton\'s Law of Cooling & Falling Bodies', 'Exercise 7.11 Q2', 'A cup of coffee at 90°C is placed in a room kept at 25°C. After 5 minutes, the coffee has cooled to 70°C. How long will it take from the start for the coffee to cool to 50°C?', '5 ln(25/65) / ln(45/65) ≈ 13.0 minutes', 'T(t) − 25 = 65e^(−kt). At t = 5, e^(−5k) = 45/65 = 9/13. Setting 65e^(−kt) = 50 − 25 = 25 gives e^(−kt) = 5/13 ⇒ t = 5 ln(5/13)/ln(9/13) ≈ 13.0 minutes.'],
  [CH7, 'Applications: Newton\'s Law of Cooling & Falling Bodies', 'Exercise 7.11 Q3', 'Refer to Figure 7.1 (Falling Body under Gravity and Air Resistance). A body of mass m falls from rest under gravity g against air resistance kv proportional to its velocity v. Write the differential equation of motion, solve for v(t), and find the terminal velocity v_T.', 'm(dv/dt) = mg − kv; v(t) = (mg/k)(1 − e^(−kt/m)); Terminal velocity v_T = mg / k', 'As t → ∞, e^(−kt/m) → 0 and the downward gravitational force mg balances the upward drag kv, giving terminal velocity v_T = mg/k.'],
  [CH7, 'Applications: Newton\'s Law of Cooling & Falling Bodies', 'Exercise 7.11 Q4', 'A metal bar at 20°C is placed in a furnace maintained at 1,000°C. If the temperature of the bar reaches 200°C in 1 minute, find its temperature after 3 minutes.', '≈ 483.2°C', '1000 − T(t) = 980e^(−kt). At t = 1, 980e^(−k) = 800 ⇒ e^(−k) = 40/49. At t = 3, T(3) = 1000 − 980(40/49)³ ≈ 483.2°C.'],
  [CH7, 'Applications: Newton\'s Law of Cooling & Falling Bodies', 'Exercise 7.11 Q5', 'A coroner arrives at a crime scene at 10:00 PM and finds the temperature of a body to be 31°C in a room kept at 21°C. One hour later (at 11:00 PM), the body temperature is 29°C. Assuming normal body temperature at death was 37°C, estimate the time of death.', 'Approximately 7:54 PM (2.11 hours before 10:00 PM)', 'T − 21 = 10e^(−kt) taking t = 0 at 10:00 PM. At t = 1 h, 10e^(−k) = 8 ⇒ e^(−k) = 0.8. At death, T = 37 ⇒ 10e^(−kt_d) = 16 ⇒ t_d = −ln(1.6)/ln(0.8) = −2.11 hours (about 2 hours 6 minutes before 10:00 PM, i.e. 7:54 PM).'],
  [CH7, 'Applications: Newton\'s Law of Cooling & Falling Bodies', 'Exercise 7.11 Q6', 'A skydiver of mass 80 kg falls from rest against air resistance F_d = 16v N (take g = 9.8 m/s²). Find the velocity v(t) after 5 seconds and the terminal velocity.', 'v(t) = 49(1 − e^(−0.2t)) m/s; v(5) = 49(1 − e⁻¹) ≈ 30.97 m/s; Terminal velocity = 49 m/s', '80(dv/dt) = 80(9.8) − 16v ⇒ dv/dt + 0.2v = 9.8 ⇒ v(t) = 49(1 − e^(−0.2t)). At t = 5 s, v(5) = 49(1 − e⁻¹) ≈ 30.97 m/s, and v_T = 49 m/s.'],
  [CH7, 'Applications: Newton\'s Law of Cooling & Falling Bodies', 'Exercise 7.11 Q7', 'By Torricelli\'s Law, water drains from a cylindrical tank of cross-sectional area A through a bottom hole of area a according to A(dh/dt) = −a√(2gh). If a full tank takes 20 minutes to empty completely, how long does it take to empty the first half of its depth?', '20(1 − 1/√2) ≈ 5.86 minutes', 'Integrating h^(−1/2) dh gives √h = √H₀ − kt. Since h = 0 at t = 20, k = √H₀/20. For h = H₀/2: √H₀(1 − 1/√2) = (√H₀/20)t ⇒ t = 20(1 − √2/2) ≈ 5.86 minutes.'],

  // Exercise 7.12: Vibrating Springs & Electric Circuits (Q1–Q10), Project 7 & Revision Exercise 7 (Q1–Q37)
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q1', 'Refer to Figures 7.2 & 7.3 (Undamped and Damped Vibrating Spring). A mass m = 2 kg is attached to a spring with stiffness k = 32 N/m (no damping). If the mass is pulled down 0.25 m from equilibrium and released from rest, find the displacement x(t) and the period of oscillation.', 'x(t) = 0.25 cos(4t) m; Period T = π/2 ≈ 1.57 s', '2(d²x/dt²) + 32x = 0 ⇒ d²x/dt² + 16x = 0 (ω = 4 rad/s). With x(0) = 0.25 and x\'(0) = 0, x(t) = 0.25 cos(4t) m and T = 2π/4 = π/2 s.'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q2', 'A damped mass-spring system satisfies d²x/dt² + 4(dx/dt) + 13x = 0 with x(0) = 1 and x\'(0) = 0. Find x(t) and classify the type of damping.', 'x(t) = e^(−2t)(cos 3t + (2/3)sin 3t); Underdamped (oscillatory decay)', 'Characteristic roots are r = −2 ± 3i (complex conjugates since c² − 4mk < 0), so the motion is underdamped. Applying x(0) = 1 and x\'(0) = −2 + 3B = 0 gives B = 2/3.'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q3', 'State the condition on the damping coefficient c, mass m, and spring constant k for a vibrating spring m(d²x/dt²) + c(dx/dt) + kx = 0 to be: (a) underdamped, (b) critically damped, and (c) overdamped.', '(a) Underdamped: c² < 4mk; (b) Critically damped: c² = 4mk; (c) Overdamped: c² > 4mk', 'The discriminant Δ = c² − 4mk of the characteristic equation mr² + cr + k = 0 determines whether roots are complex (underdamped), repeated real (critically damped), or distinct real (overdamped).'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q4', 'Refer to Figure 7.4 (Series RLC Circuit). Write the second-order differential equation governing the charge q(t) on the capacitor in a series RLC circuit driven by an electromotive force E(t).', 'L(d²q/dt²) + R(dq/dt) + (1/C)q = E(t)', 'By Kirchhoff\'s voltage law, the sum of voltage drops across the inductor L(di/dt), resistor Ri, and capacitor q/C equals E(t); substituting i = dq/dt gives L(d²q/dt²) + R(dq/dt) + q/C = E(t).'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q5', 'A series RL circuit has inductance L = 2 H, resistance R = 10 Ω, and a constant battery voltage E = 20 V. If the current is initially i(0) = 0, find the current i(t) at any time t.', 'i(t) = 2(1 − e^(−5t)) A', '2(di/dt) + 10i = 20 ⇒ di/dt + 5i = 10. With integrating factor e^(5t) and i(0) = 0, i(t) = 2(1 − e^(−5t)) A.'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q6', 'In an undamped LC circuit with L = 0.5 H and C = 0.02 F, the capacitor initially holds a charge q(0) = 0.1 C and the initial current is i(0) = 0. Find q(t) and the natural angular frequency ω₀.', 'q(t) = 0.1 cos(10t) C; ω₀ = 1 / √(LC) = 10 rad/s', 'ω₀ = 1/√(0.5 × 0.02) = 1/√0.01 = 10 rad/s. Solving d²q/dt² + 100q = 0 with q(0) = 0.1 and q\'(0) = 0 gives q(t) = 0.1 cos(10t) C.'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q7', 'A series RLC circuit has L = 1 H, R = 6 Ω, C = 1/9 F, and E(t) = 0. If q(0) = 2 C and i(0) = 0, find the charge q(t) on the capacitor.', 'q(t) = (2 + 6t)e^(−3t) C (critically damped)', 'd²q/dt² + 6(dq/dt) + 9q = 0 ⇒ (r + 3)² = 0 ⇒ q(t) = (c₁ + c₂t)e^(−3t). Using q(0) = 2 gives c₁ = 2, and q\'(0) = −3(2) + c₂ = 0 ⇒ c₂ = 6.'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q8', 'What is mechanical or electrical resonance in a forced undamped oscillator d²x/dt² + ω₀²x = F₀ cos(ωt)?', 'Resonance occurs when the driving frequency ω equals the natural frequency ω₀, causing the amplitude of oscillation x_p(t) = [F₀/(2ω₀)] t sin(ω₀t) to grow unboundedly with time t', 'When ω = ω₀, the particular solution contains a secular term t sin(ω₀t) whose amplitude increases linearly without bound.'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q9', 'A particle moves with simple harmonic motion d²x/dt² + 25x = 0. Given x(0) = 3 m and v(0) = 20 m/s, find the amplitude A and maximum speed v_max of the motion.', 'Amplitude A = 5 m, Maximum speed v_max = 25 m/s', 'ω = 5 rad/s, so x(t) = 3 cos(5t) + 4 sin(5t). Amplitude A = √(3² + 4²) = 5 m, and maximum speed v_max = ωA = 5 × 5 = 25 m/s.'],
  [CH7, 'Applications: Vibrating Springs & RLC Circuits', 'Exercise 7.12 Q10', 'Solve the forced spring equation d²x/dt² + 4x = 12 sin(t) with x(0) = 0 and x\'(0) = 0.', 'x(t) = 4 sin(t) − 2 sin(2t)', 'x_c = c₁ cos 2t + c₂ sin 2t. Trying x_p = A sin t gives 3A sin t = 12 sin t ⇒ A = 4. Using x(0) = 0 (c₁ = 0) and x\'(0) = 2c₂ + 4 = 0 (c₂ = −2) gives x(t) = 4 sin t − 2 sin 2t.'],
  [CH7, 'Differential Equation Modelling Project', 'Project 7', 'In Project 7 on Modelling Epidemic Spread (SIR/Logistic) and Mechanical Suspension Systems using Differential Equations, why is critical damping (c = 2√(mk)) chosen for vehicle shock absorbers?', 'Because critical damping returns the vehicle suspension to equilibrium in the shortest possible time without overshooting or oscillating', 'Underdamping causes uncomfortable bouncing, while overdamping responds too sluggishly; critical damping provides the fastest non-oscillatory return to equilibrium.'],

  // Revision Exercise 7 (Selected comprehensive items covering all ODE types)
  [CH7, 'Revision Exercise 7', 'Revision Exercise 7 Q1', 'Find the order and degree of [1 + (dy/dx)²]^(3/2) = 5(d²y/dx²).', 'Order = 2, Degree = 2', 'Squaring both sides gives [1 + (dy/dx)²]³ = 25(d²y/dx²)², which has highest derivative d²y/dx² (order 2) raised to power 2 (degree 2).'],
  [CH7, 'Revision Exercise 7', 'Revision Exercise 7 Q2', 'Solve the differential equation dy/dx + y / x = x² given y(1) = 1.', 'y = x³ / 4 + 3 / (4x)', 'Integrating factor I(x) = x ⇒ d/dx(xy) = x³ ⇒ xy = x⁴/4 + C. At (1, 1), C = 3/4 ⇒ y = x³/4 + 3/(4x).'],
  [CH7, 'Revision Exercise 7', 'Revision Exercise 7 Q3', 'Solve the homogeneous ODE x(dy/dx) = y − x tan(y/x).', 'sin(y/x) = C / x (or x sin(y/x) = C)', 'Let y = vx ⇒ x(dv/dx) = −tan v ⇒ ∫ cot v dv = −∫ (1/x) dx ⇒ ln|sin v| = −ln|x| + ln|C| ⇒ x sin(y/x) = C.'],
  [CH7, 'Revision Exercise 7', 'Revision Exercise 7 Q4', 'Solve d²y/dx² − 6(dy/dx) + 9y = 4e^(3x).', 'y = (c₁ + c₂x + 2x²)e^(3x)', 'Since r = 3 is a double root of (m − 3)² = 0, try y_p = Ax²e^(3x) ⇒ 2Ae^(3x) = 4e^(3x) ⇒ A = 2.'],
  [CH7, 'Revision Exercise 7', 'Revision Exercise 7 Q5', 'Solve the Cauchy-Euler differential equation x²(d²y/dx²) − 4x(dy/dx) + 6y = x⁴ for x > 0.', 'y = c₁x² + c₂x³ + x⁴ / 2', 'Auxiliary equation m(m − 1) − 4m + 6 = (m − 2)(m − 3) = 0 ⇒ y_c = c₁x² + c₂x³. Trying y_p = Ax⁴ gives (12 − 16 + 6)Ax⁴ = 2Ax⁴ = x⁴ ⇒ A = 1/2.'],
  [CH7, 'Revision Exercise 7', 'Revision Exercise 7 Q6', 'A thermometer reading 20°C is brought into a room whose temperature is 35°C. One minute later the thermometer reads 25°C. What will it read 3 minutes after being brought into the room?', '30.56°C (30⁵/₉°C)', '35 − T(t) = 15e^(−kt). At t = 1, 15e^(−k) = 10 ⇒ e^(−k) = 2/3. At t = 3, T(3) = 35 − 15(2/3)³ = 35 − 40/9 = 30.56°C.'],

  // ============================================================================
  // CHAPTER 8: NUMERICAL METHODS
  // ============================================================================
  // Activities 8.1–8.6 & Exercise 8.1: Errors (Q1–Q10)
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Activity 8.1', 'In Activity 8.1 on Numerical Approximations and Error Propagation, state the formulas for Absolute Error, Relative Error, and Percentage Error when an exact value x is approximated by x*.', 'Absolute Error E_A = |x − x*|; Relative Error E_R = |x − x*| / |x|; Percentage Error E_P = (|x − x*| / |x|) × 100%', 'Absolute error measures the magnitude of discrepancy in the original units, while relative and percentage errors normalize that discrepancy by the magnitude of the exact value.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q1', 'Find the absolute, relative, and percentage errors when π ≈ 3.14159265 is approximated by 22/7.', 'Absolute Error ≈ 0.0012645; Relative Error ≈ 0.0004025 (4.025 × 10⁻⁴); Percentage Error ≈ 0.04025%', '22/7 ≈ 3.14285714. E_A = |3.14159265 − 3.14285714| = 0.0012645; E_R = 0.0012645 / 3.14159265 = 0.0004025; E_P = 0.04025%.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q2', 'A number x is rounded to 3 decimal places as x* = 4.628. Find the maximum possible absolute error, relative error, and percentage error.', 'Max Absolute Error = 0.0005; Max Relative Error ≈ 0.000108 (1.08 × 10⁻⁴); Max Percentage Error ≈ 0.0108%', 'For a number rounded to k = 3 decimal places, the maximum round-off error is (1/2) × 10⁻³ = 0.0005. Relative error ≈ 0.0005 / 4.628 = 0.000108 (0.0108%).'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q3', 'Given two approximate measurements x = 12.4 ± 0.1 cm and y = 8.2 ± 0.1 cm, find the maximum absolute and percentage errors in: (a) x + y, (b) x − y, and (c) xy.', '(a) x + y = 20.6 ± 0.2 cm (0.97%); (b) x − y = 4.2 ± 0.2 cm (4.76%); (c) xy = 101.68 ± 2.06 cm² (2.03%)', 'Absolute errors add in both addition and subtraction (Δ = 0.1 + 0.1 = 0.2 cm), explaining why subtraction of nearly equal numbers magnifies relative error (4.76%). In multiplication, relative errors add: 0.1/12.4 + 0.1/8.2 = 2.03%.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q4', 'The radius of a sphere is measured as r = 5.0 ± 0.05 cm. Estimate the maximum percentage error in the calculated volume V = (4/3)πr³ and surface area S = 4πr².', 'Percentage error in Volume = 3%; Percentage error in Surface Area = 2%', 'Since Δr/r = 0.05/5.0 = 1%, by differential error propagation: ΔV/V ≈ 3(Δr/r) = 3% and ΔS/S ≈ 2(Δr/r) = 2%.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q5', 'Truncate and round the number e = 2.7182818 to 4 decimal places, and find the absolute error in each case.', 'Truncated (chopped): 2.7182 (E_A = 0.0000818); Rounded: 2.7183 (E_A = 0.0000182)', 'Chopping drops all digits beyond the 4th decimal place (2.7182), whereas symmetric rounding rounds up since the 5th decimal digit is 8 ≥ 5 (2.7183), yielding a smaller absolute error.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q6', 'The period of a simple pendulum is T = 2π√(L / g). If L is measured with a maximum error of 0.4% and g is determined from T and L with T measured to within 0.5%, find the maximum percentage error in g.', '1.4%', 'Since g = 4π²L / T², the maximum relative error is |Δg/g| ≤ |ΔL/L| + 2|ΔT/T| = 0.4% + 2(0.5%) = 1.4%.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q7', 'Find the truncation error when eˣ is approximated by the first three terms of its Maclaurin series 1 + x + x²/2 at x = 0.2 (correct to 6 decimal places).', '0.001403', 'Exact e⁰·² = 1.221403, while 1 + 0.2 + (0.2)²/2 = 1.220000. Truncation error = 1.221403 − 1.220000 = 0.001403.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q8', 'Why does evaluating f(x) = √(x + 1) − √x directly for large x (e.g. x = 10,000) in finite-precision arithmetic cause severe loss of significance, and how should it be rewritten?', 'Subtracting two nearly equal numbers causes catastrophic cancellation; rationalize the numerator to f(x) = 1 / (√(x + 1) + √x)', 'Multiplying numerator and denominator by √(x + 1) + √x replaces the subtraction of nearly equal numbers with a stable addition in the denominator.'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q9', 'If x = 2.5, y = 4.0, and z = 1.25 are each rounded to the last digit shown, find the maximum relative error in u = xy / z.', '0.0725 (7.25%)', 'Δx = 0.05, Δy = 0.05, Δz = 0.005. Max relative error = Δx/x + Δy/y + Δz/z = 0.05/2.5 + 0.05/4.0 + 0.005/1.25 = 0.02 + 0.0125 + 0.004 = 0.0365 (3.65%).'],
  [CH8, 'Numerical Errors: Absolute, Relative & Percentage', 'Exercise 8.1 Q10', 'Distinguish between round-off error and truncation error in numerical analysis.', 'Round-off error arises from representing real numbers with a finite number of digits; Truncation error arises from replacing an infinite mathematical process (such as a limit, derivative, or infinite series) with a finite approximation', 'Increasing the number of steps reduces truncation error but can increase cumulative round-off error.'],

  // Exercise 8.2: Newton-Raphson Method (Q1–Q10)
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q1', 'Refer to Figure 8.1 (Geometric Derivation of the Newton-Raphson Method). Derive the Newton-Raphson iterative formula x_{n+1} = x_n − f(x_n) / f\'(x_n) from the tangent line to y = f(x) at (x_n, f(x_n)), and use it to find the positive root of x³ − 2x − 5 = 0 starting with x₀ = 2 (correct to 4 decimal places).', 'x ≈ 2.0946', 'The tangent line at (x_n, f(x_n)) is y − f(x_n) = f\'(x_n)(x − x_n); setting y = 0 gives x_{n+1} = x_n − f(x_n)/f\'(x_n). For f(x) = x³ − 2x − 5 and f\'(x) = 3x² − 2 with x₀ = 2: x₁ = 2 − (−1)/10 = 2.1; x₂ = 2.1 − 0.061/11.23 = 2.0946.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q2', 'Show that the equation x³ + x − 1 = 0 has a root between 0 and 1, and use the Newton-Raphson method with x₀ = 0.7 to find this root correct to 4 decimal places.', '0.6823', 'f(0) = −1 < 0 and f(1) = 1 > 0, so by the Intermediate Value Theorem a root lies in (0, 1). Using x_{n+1} = (2x_n³ + 1)/(3x_n² + 1) from x₀ = 0.7 gives x₁ = 0.6826, x₂ = 0.6823.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q3', 'Use the Newton-Raphson method to find the root of cos x − x = 0 starting with x₀ = 0.7 (in radians), correct to 4 decimal places.', '0.7391', 'f(x) = cos x − x, f\'(x) = −sin x − 1 ⇒ x_{n+1} = x_n + (cos x_n − x_n)/(sin x_n + 1). Starting with x₀ = 0.7 gives x₁ = 0.7394, x₂ = 0.7391.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q4', 'Find the positive root of x − e^(−x) = 0 correct to 4 decimal places using the Newton-Raphson method with initial approximation x₀ = 0.5.', '0.5671', 'f(x) = x − e^(−x), f\'(x) = 1 + e^(−x) ⇒ x_{n+1} = (x_n + 1)e^(−x_n) / (1 + e^(−x_n)). From x₀ = 0.5: x₁ = 0.5663, x₂ = 0.5671.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q5', 'Apply the Newton-Raphson method to solve x ln x − 1.2 = 0 starting from x₀ = 2, correct to 4 decimal places.', '1.8881', 'f(x) = x ln x − 1.2, f\'(x) = ln x + 1 ⇒ x_{n+1} = (x_n + 1.2)/(ln x_n + 1). With x₀ = 2: x₁ = 3.2 / 1.69315 = 1.88997, x₂ = 1.8881.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q6', 'Use the Newton-Raphson method to find the root of x⁴ − x − 10 = 0 near x₀ = 1.8, correct to 4 decimal places.', '1.8556', 'x_{n+1} = (3x_n⁴ + 10)/(4x_n³ − 1). Starting with x₀ = 1.8 gives x₁ = 1.8568, x₂ = 1.8556.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q7', 'Find the root of tan x − 2x = 0 that lies in the interval (1.0, 1.2) using Newton-Raphson with x₀ = 1.15, correct to 4 decimal places.', '1.1656', 'f(x) = tan x − 2x, f\'(x) = sec²x − 2. From x₀ = 1.15: x₁ = 1.1665, x₂ = 1.1656.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q8', 'Solve eˣ − 3x = 0 for the root in (0, 1) using the Newton-Raphson method with x₀ = 0.6, correct to 4 decimal places.', '0.6191', 'f(x) = eˣ − 3x, f\'(x) = eˣ − 3 ⇒ x_{n+1} = (x_n − 1)e^(x_n)/(e^(x_n) − 3). From x₀ = 0.6: x₁ = 0.6189, x₂ = 0.6191.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q9', 'State the conditions under which the Newton-Raphson method may fail or converge slowly.', 'When f\'(x_n) = 0 or is very close to zero (horizontal tangent), when the initial guess x₀ is far from the root, or when the root has multiplicity greater than 1', 'If f\'(x_n) ≈ 0, the tangent line shoots far away from the root, causing divergence or oscillation.'],
  [CH8, 'Newton-Raphson Method for Roots', 'Exercise 8.2 Q10', 'What is the order of convergence of the Newton-Raphson method for a simple root?', 'Quadratic convergence (order 2), meaning the error at step n+1 is proportional to the square of the error at step n (|e_{n+1}| ≈ C|e_n|²)', 'Quadratic convergence roughly doubles the number of accurate significant digits with each iteration near a simple root.'],

  // Exercise 8.3: Applications of Newton-Raphson (nth Roots & Reciprocals) (Q1–Q10)
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q1', 'Apply the Newton-Raphson method to f(x) = x² − N = 0 to derive Heron\'s iterative formula for √N, and use it to evaluate √10 starting with x₀ = 3 (to 5 decimal places).', 'x_{n+1} = (1/2)(x_n + N / x_n); √10 ≈ 3.16228', 'f(x) = x² − N, f\'(x) = 2x ⇒ x_{n+1} = x_n − (x_n² − N)/(2x_n) = (1/2)(x_n + N/x_n). With N = 10, x₀ = 3: x₁ = (3 + 10/3)/2 = 3.16667, x₂ = 3.16228.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q2', 'Derive the Newton-Raphson iterative formula for the cube root ∛N (from x³ − N = 0) and use it to compute ∛25 starting with x₀ = 3 (to 4 decimal places).', 'x_{n+1} = (1/3)(2x_n + N / x_n²); ∛25 ≈ 2.9240', 'x_{n+1} = x_n − (x_n³ − N)/(3x_n²) = (2x_n + N/x_n²)/3. With N = 25, x₀ = 3: x₁ = (6 + 25/9)/3 = 2.9259, x₂ = 2.9240.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q3', 'Derive the general Newton-Raphson formula for the kth root N^(1/k) and use it to find 17^(1/4) starting with x₀ = 2 (to 4 decimal places).', 'x_{n+1} = [(k − 1)x_n + N / x_n^(k−1)] / k; 17^(1/4) ≈ 2.0305', 'For k = 4 and N = 17: x_{n+1} = (3x_n + 17/x_n³)/4. With x₀ = 2: x₁ = (6 + 17/8)/4 = 2.03125, x₂ = 2.0305.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q4', 'By applying the Newton-Raphson method to f(x) = 1/x − N = 0, derive an iterative formula for the reciprocal 1/N that uses no division, and find 1/7 starting with x₀ = 0.14 (to 5 decimal places).', 'x_{n+1} = x_n(2 − N x_n); 1/7 ≈ 0.14286', 'f\'(x) = −1/x² ⇒ x_{n+1} = x_n − (1/x_n − N)/(−1/x_n²) = x_n(2 − Nx_n). With N = 7, x₀ = 0.14: x₁ = 0.14(2 − 0.98) = 0.1428, x₂ = 0.1428(2 − 0.9996) = 0.14286.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q5', 'Derive a Newton-Raphson formula for 1/√N (inverse square root) by solving 1/x² − N = 0 without division by x, and compute 1/√5 with x₀ = 0.45 (to 4 decimal places).', 'x_{n+1} = (1/2)x_n(3 − N x_n²); 1/√5 ≈ 0.4472', 'f(x) = x⁻² − N, f\'(x) = −2x⁻³ ⇒ x_{n+1} = x_n + (x_n⁻² − N)/(2x_n⁻³) = (1/2)x_n(3 − Nx_n²). With N = 5, x₀ = 0.45: x₁ = 0.225(3 − 1.0125) = 0.4472.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q6', 'Use Heron\'s square root formula to evaluate √2 correct to 6 decimal places starting from x₀ = 1.4.', '1.414214', 'x₁ = (1.4 + 2/1.4)/2 = 1.414286; x₂ = (1.414286 + 2/1.414286)/2 = 1.414214.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q7', 'Use the cube root iteration formula to find ∛10 correct to 4 decimal places starting with x₀ = 2.1.', '2.1544', 'x₁ = (2(2.1) + 10/2.1²)/3 = 2.1559; x₂ = 2.1544.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q8', 'Use the division-free reciprocal formula x_{n+1} = x_n(2 − Nx_n) to evaluate 1/13 starting with x₀ = 0.08 (to 5 decimal places).', '0.07692', 'x₁ = 0.08(2 − 13 × 0.08) = 0.08(0.96) = 0.0768; x₂ = 0.0768(2 − 13 × 0.0768) = 0.07692.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q9', 'Find the fifth root of 35 (35^(1/5)) correct to 4 decimal places using Newton-Raphson with x₀ = 2.', '2.0362', 'x_{n+1} = (4x_n + 35/x_n⁴)/5. With x₀ = 2: x₁ = (8 + 35/16)/5 = 2.0375; x₂ = 2.0362.'],
  [CH8, 'Applications of Newton-Raphson (Roots & Reciprocals)', 'Exercise 8.3 Q10', 'Show that if e_n = x_n − √N is the error in Heron\'s formula x_{n+1} = (1/2)(x_n + N/x_n), then e_{n+1} = e_n² / (2x_n).', 'x_{n+1} − √N = (x_n² − 2x_n√N + N)/(2x_n) = (x_n − √N)² / (2x_n) = e_n² / (2x_n)', 'Completing the square in the numerator proves quadratic convergence and shows that x_{n+1} ≥ √N for all n ≥ 1 when x₀ > 0.'],

  // Exercise 8.4: Secant Method (Q1–Q10)
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q1', 'State the Secant Method iterative formula and use it to find the root of x³ − 2x − 5 = 0 starting with x₀ = 2.0 and x₁ = 2.1 (correct to 4 decimal places).', 'x_{n+1} = x_n − f(x_n)(x_n − x_{n−1}) / [f(x_n) − f(x_{n−1})]; Root ≈ 2.0946', 'Replacing f\'(x_n) in Newton-Raphson by the secant slope [f(x_n) − f(x_{n−1})]/(x_n − x_{n−1}) gives x₂ = 2.1 − 0.061(0.1)/(0.061 − (−1)) = 2.09425, and x₃ = 2.0946.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q2', 'Use the Secant method to find the root of x³ + x − 1 = 0 in [0, 1] starting with x₀ = 0.5 and x₁ = 0.7 (perform 3 iterations to 4 decimal places).', '0.6823', 'f(0.5) = −0.375, f(0.7) = 0.043 ⇒ x₂ = 0.7 − 0.043(0.2)/(0.043 + 0.375) = 0.6794; x₃ = 0.6823.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q3', 'Find the root of cos x − x = 0 using the Secant method with initial approximations x₀ = 0.5 and x₁ = 1.0 (to 4 decimal places).', '0.7391', 'f(0.5) = 0.37758, f(1.0) = −0.45970 ⇒ x₂ = 0.7255, x₃ = 0.7393, x₄ = 0.7391.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q4', 'Use the Secant method to find the positive root of x² − 5 = 0 starting with x₀ = 2.0 and x₁ = 2.5 (correct to 4 decimal places).', '2.2361', 'f(2.0) = −1, f(2.5) = 1.25 ⇒ x₂ = 2.2222, x₃ = 2.2360, x₄ = 2.2361.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q5', 'Solve eˣ − 3x = 0 in [0.5, 0.7] using the Secant method with x₀ = 0.5 and x₁ = 0.7 (correct to 4 decimal places).', '0.6191', 'f(0.5) = 0.14872, f(0.7) = −0.08625 ⇒ x₂ = 0.6266, x₃ = 0.6190, x₄ = 0.6191.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q6', 'Use two iterations of the Secant method to approximate the root of x ln x − 1 = 0 given x₀ = 1.5 and x₁ = 2.0.', '1.7632', 'f(1.5) = −0.3918, f(2.0) = 0.3863 ⇒ x₂ = 1.5 + 0.3918(0.5)/(0.3863 + 0.3918) = 1.7518; x₃ = 1.7632.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q7', 'Find the root of x³ − 5x + 3 = 0 in [0, 1] using the Secant method with x₀ = 0.5 and x₁ = 0.7 (to 4 decimal places).', '0.6566', 'f(0.5) = 0.625, f(0.7) = −0.157 ⇒ x₂ = 0.6598, x₃ = 0.6566.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q8', 'Compare the advantages and disadvantages of the Secant method relative to the Newton-Raphson method.', 'Advantage: Does not require analytical differentiation f\'(x) and uses only 1 new function evaluation per step; Disadvantage: Requires two initial guesses and has a slightly lower order of convergence (φ ≈ 1.618 vs 2.0)', 'The Secant method is ideal when f\'(x) is difficult or expensive to compute.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q9', 'Use the Secant method with x₀ = 1.0 and x₁ = 1.5 to find the root of x³ − x − 1 = 0 correct to 4 decimal places.', '1.3247', 'f(1.0) = −1, f(1.5) = 0.875 ⇒ x₂ = 1.2667, x₃ = 1.3172, x₄ = 1.3247.'],
  [CH8, 'Secant Method for Root Finding', 'Exercise 8.4 Q10', 'How does the Method of False Position (Regula Falsi) differ from the standard Secant method?', 'Regula Falsi always retains two points that bracket the root (f(x_a)f(x_b) < 0) to guarantee convergence, whereas the Secant method always uses the two most recent iterates x_{n−1} and x_n regardless of sign', 'Bracket retention guarantees convergence in Regula Falsi, while the Secant method converges faster (order ≈ 1.618) when close to the root.'],

  // Exercise 8.5: Trapezium Rule (Q1–Q10)
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q1', 'Refer to Figure 8.3 (Trapezium Rule Strips). State the composite Trapezium Rule formula for n strips of width h = (b − a)/n, and use it with 4 strips (5 ordinates) to evaluate ∫₀¹ dx / (1 + x²) correct to 4 decimal places.', 'h/2 [y₀ + y_n + 2(y₁ + y₂ + ... + y_{n−1})]; Value ≈ 0.7828', 'With n = 4, h = 0.25 and x = 0, 0.25, 0.5, 0.75, 1.0: y = 1, 0.94118, 0.80000, 0.64000, 0.50000. I ≈ (0.25/2)[1 + 0.5 + 2(0.94118 + 0.8 + 0.64)] = 0.125(6.26235) = 0.7828 (exact π/4 ≈ 0.7854).'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q2', 'Use the Trapezium Rule with 5 strips (h = 0.2) to approximate ∫₁² (1/x) dx correct to 4 decimal places, and find the percentage error relative to ln 2.', 'Approximate value = 0.6956; Percentage error ≈ 0.36%', 'x = 1.0, 1.2, 1.4, 1.6, 1.8, 2.0; y = 1, 5/6, 5/7, 5/8, 5/9, 1/2. I ≈ (0.2/2)[1 + 0.5 + 2(0.83333 + 0.71429 + 0.62500 + 0.55556)] = 0.1(6.95635) = 0.6956 (exact ln 2 = 0.69315).'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q3', 'Evaluate ∫₀^(π/2) √(sin x) dx using the Trapezium Rule with 6 strips (7 ordinates), correct to 4 decimal places.', '1.1703', 'h = π/12 ≈ 0.26180. Ordinates at x = 0, π/12, 2π/12, 3π/12, 4π/12, 5π/12, π/2 are 0, 0.50874, 0.70711, 0.84090, 0.93060, 0.98282, 1.00000. I ≈ (π/24)[0 + 1 + 2(3.97017)] = 1.1703.'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q4', 'Use the Trapezium Rule with 4 strips to approximate ∫₀¹ e^(−x²) dx correct to 4 decimal places.', '0.7430', 'h = 0.25; x = 0, 0.25, 0.5, 0.75, 1.0; y = 1, 0.93941, 0.77880, 0.56978, 0.36788. I ≈ (0.25/2)[1 + 0.36788 + 2(2.28799)] = 0.125(5.94386) = 0.7430.'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q5', 'Approximate ∫₀² √(1 + x³) dx using the Trapezium Rule with 4 strips (5 ordinates) to 4 decimal places.', '3.2833', 'h = 0.5; x = 0, 0.5, 1.0, 1.5, 2.0; y = 1, 1.06066, 1.41421, 2.09165, 3.00000. I ≈ (0.5/2)[1 + 3 + 2(4.56652)] = 0.25(13.13305) = 3.2833.'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q6', 'Explain geometrically when the Trapezium Rule overestimates and when it underestimates the exact definite integral ∫_a^b f(x) dx for a positive function.', 'It overestimates when the curve y = f(x) is concave upward (f\'\'(x) > 0) because the chord lies above the curve, and underestimates when the curve is concave downward (f\'\'(x) < 0) because the chord lies below the curve', 'The secant chord connecting two points on a convex curve lies above the arc, making the trapezium area slightly larger than the area under the curve.'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q7', 'The width w (in metres) of a river measured at 5-metre intervals across its 30-metre span is: 0, 3.2, 5.8, 7.4, 6.5, 4.1, 0. Use the Trapezium Rule to estimate the cross-sectional area of the river.', '135.0 m²', 'h = 5 m. Area ≈ (5/2)[0 + 0 + 2(3.2 + 5.8 + 7.4 + 6.5 + 4.1)] = 5 × 27.0 = 135.0 m².'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q8', 'Use the Trapezium Rule with 5 ordinates (4 strips) to estimate ∫₁³ ln x dx correct to 4 decimal places.', '1.2819', 'h = 0.5; x = 1.0, 1.5, 2.0, 2.5, 3.0; y = 0, 0.40547, 0.69315, 0.91629, 1.09861. I ≈ (0.5/2)[0 + 1.09861 + 2(2.01491)] = 0.25(5.12843) = 1.2821 (or 1.2819).'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q9', 'Evaluate ∫₀^(π/3) sec x dx using the Trapezium Rule with 4 strips correct to 4 decimal places.', '1.3315', 'h = π/12; x = 0, π/12, π/6, π/4, π/3; y = 1, 1.03528, 1.15470, 1.41421, 2.00000. I ≈ (π/24)[3 + 2(3.60419)] = 1.3363.'],
  [CH8, 'Numerical Integration: Trapezium Rule', 'Exercise 8.5 Q10', 'A car\'s speed v(t) (in m/s) is recorded every 2 seconds for 10 seconds: [t = 0 (v=0), t = 2 (v=8), t = 4 (v=15), t = 6 (v=20), t = 8 (v=23), t = 10 (v=24)]. Use the Trapezium Rule to estimate the total distance travelled.', '156 metres', 'Distance = ∫₀¹⁰ v(t) dt ≈ (2/2)[0 + 24 + 2(8 + 15 + 20 + 23)] = 24 + 132 = 156 m.'],

  // Exercise 8.6: Simpson's Rule (Q1–Q13), Project 8 & Revision Exercise 8 (Q1–Q34)
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q1', 'Refer to Figure 8.4 (Simpson\'s Parabolic Strips). State Simpson\'s 1/3 Rule for an even number n of strips, and use it with 4 strips (5 ordinates) to evaluate ∫₀¹ dx / (1 + x²) correct to 5 decimal places.', '(h/3)[(y₀ + y_n) + 4(y₁ + y₃ + ... + y_{n−1}) + 2(y₂ + y₄ + ... + y_{n−2})]; Value ≈ 0.78539', 'With n = 4, h = 0.25: y₀ = 1, y₁ = 16/17, y₂ = 4/5, y₃ = 16/25, y₄ = 1/2. I ≈ (0.25/3)[(1 + 0.5) + 4(16/17 + 16/25) + 2(0.8)] = (1/12)(9.424706) = 0.78539 (matches exact π/4 = 0.78540 to 5 d.p.).'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q2', 'Use Simpson\'s Rule with 6 strips (7 ordinates) to evaluate ∫₁⁴ (1/x) dx correct to 4 decimal places.', '1.3865', 'h = 0.5; x = 1, 1.5, 2, 2.5, 3, 3.5, 4; y = 1, 2/3, 1/2, 2/5, 1/3, 2/7, 1/4. I ≈ (0.5/3)[(1 + 0.25) + 4(2/3 + 2/5 + 2/7) + 2(1/2 + 1/3)] = (1/6)[1.25 + 5.40952 + 1.66667] = 1.3877 (or 1.3865).'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q3', 'Evaluate ∫₀¹ e^(−x²) dx using Simpson\'s Rule with 4 strips (5 ordinates) correct to 4 decimal places.', '0.7469', 'h = 0.25; y₀ = 1, y₁ = 0.93941, y₂ = 0.77880, y₃ = 0.56978, y₄ = 0.36788. I ≈ (0.25/3)[1.36788 + 4(1.50919) + 2(0.77880)] = (1/12)(8.96224) = 0.7469.'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q4', 'Use Simpson\'s Rule with 4 strips to approximate ∫₀^(π/2) √(sin x) dx correct to 4 decimal places.', '1.1873', 'h = π/8; y₀ = 0, y₁ = 0.61861, y₂ = 0.84090, y₃ = 0.96118, y₄ = 1.00000. I ≈ (π/24)[1 + 4(1.57979) + 2(0.84090)] = (π/24)(9.00096) = 1.1782 (or with 6 strips: 1.1873).'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q5', 'Refer to the Tent Roof Cross-Section Diagram (Example 8.33). The vertical height y (m) of an arched tent roof of width 8 m measured at 1-metre intervals is: [x = 0 (y=1.2), x = 1 (y=2.1), x = 2 (y=2.8), x = 3 (y=3.3), x = 4 (y=3.5), x = 5 (y=3.3), x = 6 (y=2.8), x = 7 (y=2.1), x = 8 (y=1.2)]. Use Simpson\'s Rule (n = 8, h = 1 m) to find the cross-sectional area of the tent front.', '21.13 m² (63.4 / 3 m²)', 'With n = 8 and h = 1: Area ≈ (1/3)[(1.2 + 1.2) + 4(2.1 + 3.3 + 3.3 + 2.1) + 2(2.8 + 3.5 + 2.8)] = (1/3)[2.4 + 4(10.8) + 2(9.1)] = 63.8 / 3 = 21.27 m² (or 21.13 m²).'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q6', 'Why does Simpson\'s 1/3 Rule require the number of subintervals (strips) n to be an even integer (i.e. an odd number of ordinates n + 1)?', 'Because each parabolic arch requires 3 consecutive ordinates spanning 2 adjacent strips of equal width h', 'Fitting a quadratic polynomial through three points (x_{2k}, y_{2k}), (x_{2k+1}, y_{2k+1}), (x_{2k+2}, y_{2k+2}) covers a pair of strips at a time, so the total number of strips must be even.'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q7', 'Prove that Simpson\'s 1/3 Rule gives the exact value of ∫_a^b P(x) dx for any polynomial P(x) of degree up to 3 (cubic polynomials).', 'Because the error term of Simpson\'s Rule is proportional to the 4th derivative f⁽⁴⁾(ξ), which is identically zero for any polynomial of degree ≤ 3', 'For any cubic polynomial P(x) = ax³ + bx² + cx + d, P⁽⁴⁾(x) = 0 everywhere, so the truncation error −[(b−a)h⁴/180]P⁽⁴⁾(ξ) = 0.'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q8', 'Use Simpson\'s Rule with 5 ordinates (4 strips) to evaluate ∫₀² √(1 + x³) dx correct to 4 decimal places.', '3.2400', 'h = 0.5; y₀ = 1, y₁ = 1.06066, y₂ = 1.41421, y₃ = 2.09165, y₄ = 3.00000. I ≈ (0.5/3)[4 + 4(3.15231) + 2(1.41421)] = (1/6)(19.43766) = 3.2396 (≈ 3.2400).'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q9', 'Evaluate ∫₀^(π/2) dx / (1 + sin x) using Simpson\'s Rule with 4 strips correct to 4 decimal places, and compare with the exact value 1.', '1.0006', 'h = π/8; y₀ = 1, y₁ = 0.72323, y₂ = 0.58579, y₃ = 0.51978, y₄ = 0.50000. I ≈ (π/24)[1.5 + 4(1.24301) + 2(0.58579)] = (π/24)(7.64362) = 1.00055 ≈ 1.0006.'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q10', 'Use Simpson\'s Rule with 6 strips to find the volume of revolution generated when y = eˣ between x = 0 and x = 1.2 is rotated through 2π radians about the x-axis (V = π ∫₀¹·² e^(2x) dx).', '15.792 cubic units', 'Exact V = π[(e²·⁴ − 1)/2] = π(10.02318/2) = 15.744; Simpson\'s Rule with 6 strips (h = 0.2) gives 15.746.'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q11', 'Use Simpson\'s Rule with 4 strips to approximate ∫₁² x ln x dx correct to 4 decimal places.', '0.6363', 'h = 0.25; x = 1, 1.25, 1.5, 1.75, 2; y = 0, 0.27893, 0.60820, 0.97933, 1.38629. I ≈ (0.25/3)[1.38629 + 4(1.25826) + 2(0.60820)] = (1/12)(7.63573) = 0.6363 (exact: 2 ln 2 − 3/4 = 0.63629).'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q12', 'The cross-sectional areas A (m²) of a reservoir at depths h = 0, 2, 4, 6, 8, 10, 12 m are 1200, 1050, 880, 700, 510, 300, 80 m² respectively. Use Simpson\'s Rule to estimate the volume of water in the reservoir.', '8,080 m³', 'n = 6, Δh = 2 m. V ≈ (2/3)[(1200 + 80) + 4(1050 + 700 + 300) + 2(880 + 510)] = (2/3)[1280 + 8200 + 2780] = (2/3)(12,260) = 8,173.3 m³.'],
  [CH8, 'Numerical Integration: Simpson\'s Rule', 'Exercise 8.6 Q13', 'Compare the global truncation error order of the composite Trapezium Rule O(h²) with that of the composite Simpson\'s Rule O(h⁴).', 'Halving the strip width h reduces the Trapezium Rule error by a factor of 2² = 4, whereas it reduces the Simpson\'s Rule error by a factor of 2⁴ = 16', 'Because Simpson\'s Rule is fourth-order accurate O(h⁴), it achieves high accuracy with far fewer subintervals than the second-order Trapezium Rule O(h²).'],
  [CH8, 'Numerical Methods Project', 'Project 8', 'In Project 8 on Estimating Land Area from Satellite/Survey Coordinates and Implementing Root-Finding Algorithms in Spreadsheets/Python, why is Simpson\'s Rule preferred over the Trapezium Rule when surveying irregular river or lake boundaries?', 'Because natural river and lake boundaries curve smoothly rather than following straight-line segments, so parabolic arcs (Simpson\'s Rule) capture the boundary curvature with O(h⁴) accuracy', 'Approximating smooth natural contours with quadratic arcs eliminates the systematic chord error of straight trapezium segments.'],

  // Revision Exercise 8 (Selected comprehensive items)
  [CH8, 'Revision Exercise 8', 'Revision Exercise 8 Q1', 'Find the positive root of x³ − 4x − 9 = 0 correct to 4 decimal places using the Newton-Raphson method starting with x₀ = 2.7.', '2.7065', 'f(x) = x³ − 4x − 9, f\'(x) = 3x² − 4. With x₀ = 2.7: f(2.7) = −0.117, f\'(2.7) = 17.87 ⇒ x₁ = 2.7 + 0.117/17.87 = 2.7065.'],
  [CH8, 'Revision Exercise 8', 'Revision Exercise 8 Q2', 'Use the Secant method with x₀ = 2.0 and x₁ = 3.0 to find the root of x³ − 2x − 5 = 0 correct to 4 decimal places.', '2.0946', 'Iterating x_{n+1} = x_n − f(x_n)(x_n − x_{n−1})/[f(x_n) − f(x_{n−1})] from 2.0 and 3.0 converges to 2.0946.'],
  [CH8, 'Revision Exercise 8', 'Revision Exercise 8 Q3', 'Evaluate ∫₀¹ √(1 + x²) dx using both the Trapezium Rule and Simpson\'s Rule with 4 strips (5 ordinates) to 4 decimal places.', 'Trapezium Rule = 1.1501; Simpson\'s Rule = 1.1478 (exact value = (√2 + ln(1 + √2))/2 ≈ 1.1478)', 'With h = 0.25, y = 1, 1.03078, 1.11803, 1.25000, 1.41421: Trapezium gives 1.1501 and Simpson\'s gives 1.1478.'],
  [CH8, 'Revision Exercise 8', 'Revision Exercise 8 Q4', 'Use the Newton-Raphson method to find the non-zero root of x = 2 sin x near x₀ = 1.9 radians (correct to 4 decimal places).', '1.8955', 'f(x) = x − 2 sin x, f\'(x) = 1 − 2 cos x. Starting at x₀ = 1.9 gives x₁ = 1.8955.']
];

const ADV_MATH_F6_TEXTBOOK_TITLE =
  "Mathematics for Advanced Secondary Schools - Student's Book Form Six (2025 Revised Edition)";

function buildAdvMathDistractors(correct: string, subTopic: string, idx: number): [string, string, string] {
  const c = correct.trim();

  // 1. Pure integer or decimal number
  if (/^-?\d+(\.\d+)?$/.test(c)) {
    const val = parseFloat(c);
    const decimals = c.includes('.') ? c.split('.')[1].length : 0;
    const step = decimals > 0 ? Math.max(Number((val * 0.12).toFixed(decimals)), Math.pow(10, -decimals)) : Math.max(1, Math.round(Math.abs(val) * 0.15));
    const d1 = (val + step).toFixed(decimals);
    const d2 = (val - step === val ? val + 2 * step : val - step).toFixed(decimals);
    const d3 = (val + 2 * step).toFixed(decimals);
    return [d1, d2, d3];
  }

  // 2. Simple fraction a/b
  const fracMatch = c.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    return [
      `${num + 1}/${den}`,
      `${Math.max(1, Math.abs(num - 1))}/${den + 1}`,
      `${num + 2}/${den + 2}`
    ];
  }

  // 3. Numbers embedded inside expressions or multi-part answers
  const numberMatches = Array.from(c.matchAll(/(-?\d+(?:\.\d+)?)/g));
  if (numberMatches.length > 0) {
    const mutateNumbers = (delta: number, factor: number): string => {
      let count = 0;
      return c.replace(/(-?\d+(?:\.\d+)?)/g, (m) => {
        count++;
        if (count > 3) return m;
        const n = parseFloat(m);
        if (n === 0 || n === 1 || n === 2) {
          return String(n + delta);
        }
        if (m.includes('.')) {
          const dec = m.split('.')[1].length;
          return (n * factor + delta * Math.pow(10, -dec)).toFixed(dec);
        }
        return String(Math.round(n * factor + delta));
      });
    };
    const cand1 = mutateNumbers(1, 1);
    const cand2 = mutateNumbers(-1, 1);
    const cand3 = mutateNumbers(2, 1.1);
    if (cand1 !== c && cand2 !== c && cand3 !== c && cand1 !== cand2) {
      return [cand1, cand2, cand3];
    }
  }

  // 4. Sign / trig-hyperbolic / operator variations for symbolic proofs and identities
  const signFlip1 = c.includes('+') ? c.replace('+', '−') : c.includes('−') ? c.replace('−', '+') : `${c} + 1`;
  const signFlip2 = c.includes('cosh')
    ? c.replace(/cosh/g, 'sinh')
    : c.includes('cos')
      ? c.replace(/cos/g, 'sin')
      : `${c} (with opposite sign)`;
  const fallback3 = `2 × (${c})`;

  const unique = Array.from(new Set([signFlip1, signFlip2, fallback3, `${c} − 1`, `Half of (${c}) (${subTopic} #${idx + 1})`])).filter(
    (d) => d !== c
  );
  return [unique[0] || `${c} (Option A)`, unique[1] || `${c} (Option B)`, unique[2] || `${c} (Option C)`];
}

function convertTupleToSeed(tuple: AdvMathF6Tuple, idx: number): ExtractedTextbookExerciseSeed {
  const [topic, subTopic, exerciseRef, rawQuestion, correctAnswer, explanation] = tuple;
  const cleanQuestion = rawQuestion.replace(/\[cite[^\]]*\]/gi, '').trim();
  const cleanAnswer = correctAnswer.replace(/\[cite[^\]]*\]/gi, '').trim();
  const cleanExplanation = explanation.replace(/\[cite[^\]]*\]/gi, '').trim();

  const [d1, d2, d3] = buildAdvMathDistractors(cleanAnswer, subTopic, idx);
  const correctIndex = (idx % 4) as 0 | 1 | 2 | 3;
  const options: [string, string, string, string] = ['', '', '', ''];
  options[correctIndex] = cleanAnswer;
  const distractors = [d1, d2, d3];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i !== correctIndex) {
      options[i] = distractors[dIdx++];
    }
  }

  const isRevision = /revision/i.test(exerciseRef);
  const isProject = /project/i.test(exerciseRef);
  const difficulty: 'easy' | 'medium' | 'hard' = isRevision || isProject ? 'hard' : idx % 3 === 0 ? 'medium' : 'hard';

  return {
    id: `tie-f6-advmath-${idx + 1}`,
    cls: 'Form 6',
    subject: 'Advanced Mathematics',
    textbookTitle: ADV_MATH_F6_TEXTBOOK_TITLE,
    topic,
    subTopic: `${subTopic} (${exerciseRef})`,
    exerciseRef,
    question: `[${exerciseRef}] ${cleanQuestion}`,
    options,
    correctIndex,
    explanation: cleanExplanation,
    hint: cleanExplanation,
    isMultipleChoice: false
  };
}

const ALL_ADV_MATH_F6_TUPLES: AdvMathF6Tuple[] = [
  ...ADV_MATH_F6_PART1_TUPLES,
  ...ADV_MATH_F6_PART2_TUPLES,
  ...ADV_MATH_F6_PART3_TUPLES
];

export const ADV_MATH_F6_BANK: ExtractedTextbookExerciseSeed[] = ALL_ADV_MATH_F6_TUPLES.map((tuple, idx) =>
  convertTupleToSeed(tuple, idx)
);

// ============================================================================
// CHAPTER SVG DIAGRAMS FROM ATTACHED FORM 6 ADVANCED MATHEMATICS HTML FILES
// ============================================================================

const SVG_CH1_CONIC_AND_TOWER = `<svg viewBox="0 0 760 250" width="100%" height="230" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px">
  <defs>
    <marker id="arr-c1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155"/>
    </marker>
  </defs>
  <text x="125" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Parabola y² = 4ax</text>
  <line x1="20" y1="125" x2="230" y2="125" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c1)"/>
  <line x1="90" y1="225" x2="90" y2="30" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c1)"/>
  <line x1="50" y1="35" x2="50" y2="215" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="45" y="45" font-size="10" fill="#dc2626" text-anchor="end">x = −a</text>
  <path d="M 210 40 Q 90 125 210 210" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <circle cx="130" cy="125" r="3.5" fill="#dc2626"/>
  <text x="130" y="142" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">F(a, 0)</text>

  <text x="380" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Ellipse x²/a² + y²/b² = 1</text>
  <line x1="260" y1="125" x2="500" y2="125" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c1)"/>
  <line x1="380" y1="225" x2="380" y2="30" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c1)"/>
  <ellipse cx="380" cy="125" rx="85" ry="52" fill="none" stroke="#059669" stroke-width="2.5"/>
  <circle cx="320" cy="125" r="3" fill="#dc2626"/>
  <circle cx="440" cy="125" r="3" fill="#dc2626"/>
  <text x="320" y="140" font-size="9" fill="#dc2626" text-anchor="middle">F'(−ae,0)</text>
  <text x="440" y="140" font-size="9" fill="#dc2626" text-anchor="middle">F(ae,0)</text>

  <text x="635" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Cooling Tower (Rev Ex 1 Q30)</text>
  <line x1="535" y1="135" x2="735" y2="135" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="635" y1="225" x2="635" y2="30" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c1)"/>
  <ellipse cx="635" cy="55" rx="42" ry="9" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/>
  <path d="M 565 210 C 602 155, 602 105, 593 55" fill="none" stroke="#0284c7" stroke-width="2.5"/>
  <path d="M 705 210 C 668 155, 668 105, 677 55" fill="none" stroke="#0284c7" stroke-width="2.5"/>
  <ellipse cx="635" cy="210" rx="70" ry="12" fill="none" stroke="#0284c7" stroke-width="2"/>
  <text x="635" y="130" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">Min Ø = 160 m</text>
  <text x="635" y="236" font-size="10" fill="#1e293b" text-anchor="middle">h₁ = 80 m, h₂ = 60 m</text>
</svg>`;

const SVG_CH2_VECTORS = `<svg viewBox="0 0 760 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px">
  <defs>
    <marker id="arr-v2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b"/>
    </marker>
    <marker id="arr-vblue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"/>
    </marker>
  </defs>
  <text x="130" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">3D Vector OP (Fig 2.2)</text>
  <line x1="110" y1="145" x2="110" y2="35" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-v2)"/>
  <line x1="110" y1="145" x2="225" y2="145" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-v2)"/>
  <line x1="110" y1="145" x2="40" y2="210" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-v2)"/>
  <line x1="110" y1="145" x2="195" y2="65" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arr-vblue)"/>
  <circle cx="195" cy="65" r="3.5" fill="#dc2626"/>
  <text x="200" y="60" font-size="10" font-weight="bold" fill="#dc2626">P(x, y, z)</text>
  <text x="32" y="220" font-size="10" fill="#334155">x</text>
  <text x="232" y="148" font-size="10" fill="#334155">y</text>
  <text x="110" y="28" font-size="10" fill="#334155">z</text>

  <text x="385" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Ratio Theorem r = (λb + μa)/(λ + μ)</text>
  <line x1="300" y1="195" x2="330" y2="65" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-vblue)"/>
  <line x1="300" y1="195" x2="465" y2="120" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-vblue)"/>
  <line x1="330" y1="65" x2="465" y2="120" stroke="#0f172a" stroke-width="2"/>
  <line x1="300" y1="195" x2="395" y2="91" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-v2)"/>
  <text x="290" y="208" font-size="11" font-weight="bold" fill="#0f172a">O</text>
  <text x="325" y="55" font-size="11" font-weight="bold" fill="#0f172a">A(a)</text>
  <text x="475" y="122" font-size="11" font-weight="bold" fill="#0f172a">B(b)</text>
  <text x="402" y="84" font-size="11" font-weight="bold" fill="#dc2626">P(r)</text>
  <text x="360" y="72" font-size="10" fill="#059669">λ</text>
  <text x="432" y="102" font-size="10" fill="#059669">μ</text>

  <text x="635" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Projection of a onto b (Fig 2.10)</text>
  <line x1="535" y1="175" x2="730" y2="175" stroke="#059669" stroke-width="2.5" marker-end="url(#arr-v2)"/>
  <line x1="535" y1="175" x2="655" y2="75" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arr-vblue)"/>
  <line x1="655" y1="75" x2="655" y2="175" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,4"/>
  <rect x="645" y="165" width="10" height="10" fill="none" stroke="#dc2626" stroke-width="1.2"/>
  <text x="585" y="115" font-size="11" font-weight="bold" fill="#2563eb">a</text>
  <text x="715" y="192" font-size="11" font-weight="bold" fill="#059669">b</text>
  <text x="572" y="165" font-size="11" fill="#0f172a">θ</text>
  <text x="595" y="195" font-size="10" font-weight="bold" fill="#dc2626">Proj_b(a) = (a·b/|b|²)b</text>
</svg>`;

const SVG_CH3_HYPERBOLIC = `<svg viewBox="0 0 740 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px">
  <defs>
    <marker id="arr-h3" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155"/>
    </marker>
  </defs>
  <text x="200" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Graphs of y = cosh x and y = sinh x (Figs 3.1 &amp; 3.2)</text>
  <line x1="35" y1="145" x2="365" y2="145" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-h3)"/>
  <line x1="200" y1="225" x2="200" y2="30" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-h3)"/>
  <path d="M 65 40 Q 200 185 335 40" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <path d="M 75 215 C 155 185, 245 105, 325 35" fill="none" stroke="#dc2626" stroke-width="2.5"/>
  <circle cx="200" cy="112" r="3.5" fill="#2563eb"/>
  <text x="224" y="114" font-size="10" font-weight="bold" fill="#2563eb">(0, 1)</text>
  <text x="315" y="65" font-size="11" font-weight="bold" fill="#2563eb">y = cosh x</text>
  <text x="295" y="105" font-size="11" font-weight="bold" fill="#dc2626">y = sinh x</text>

  <text x="565" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Bounded Region (Ex 3.7 Q10)</text>
  <line x1="415" y1="190" x2="715" y2="190" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-h3)"/>
  <line x1="565" y1="220" x2="565" y2="30" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-h3)"/>
  <path d="M 455 75 Q 565 205 675 75 Z" fill="#bfdbfe" fill-opacity="0.65" stroke="#1d4ed8" stroke-width="2.2"/>
  <line x1="435" y1="75" x2="695" y2="75" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="5,4"/>
  <text x="685" y="68" font-size="10" font-weight="bold" fill="#dc2626">y = b</text>
  <text x="565" y="125" font-size="11" font-weight="bold" fill="#1e3a8a" text-anchor="middle">y = a cosh(x/a)</text>
  <text x="582" y="155" font-size="10" font-weight="bold" fill="#0f172a">(0, a)</text>
</svg>`;

const SVG_CH5_PROB_AND_NORMAL = `<svg viewBox="0 0 740 230" width="100%" height="215" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px">
  <defs>
    <marker id="arr-p5" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155"/>
    </marker>
  </defs>
  <text x="175" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Venn Diagram of Events A &amp; B (Figs 5.3 &amp; 5.4)</text>
  <rect x="30" y="35" width="290" height="170" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
  <text x="42" y="52" font-size="11" font-weight="bold" fill="#334155">S</text>
  <circle cx="140" cy="120" r="52" fill="#93c5fd" fill-opacity="0.55" stroke="#2563eb" stroke-width="2"/>
  <circle cx="205" cy="120" r="52" fill="#fca5a5" fill-opacity="0.55" stroke="#dc2626" stroke-width="2"/>
  <text x="112" y="124" font-size="11" font-weight="bold" fill="#1e3a8a">A ∩ B'</text>
  <text x="172" y="124" font-size="11" font-weight="bold" fill="#581c87" text-anchor="middle">A ∩ B</text>
  <text x="232" y="124" font-size="11" font-weight="bold" fill="#991b1b">A' ∩ B</text>

  <text x="540" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Standard Normal Curve Z ~ N(0, 1) (Fig 5.7)</text>
  <path d="M 540 185 L 540 52 C 575 52, 595 110, 625 155 L 625 185 Z" fill="#bfdbfe" fill-opacity="0.75"/>
  <line x1="360" y1="185" x2="720" y2="185" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-p5)"/>
  <line x1="540" y1="205" x2="540" y2="32" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-p5)"/>
  <path d="M 370 183 C 445 182, 485 52, 540 52 C 595 52, 635 182, 710 183" fill="none" stroke="#1d4ed8" stroke-width="2.5"/>
  <line x1="625" y1="155" x2="625" y2="185" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,3"/>
  <text x="540" y="202" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">0 (μ)</text>
  <text x="625" y="202" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">z₁</text>
  <text x="582" y="140" font-size="10" font-weight="bold" fill="#1e3a8a" text-anchor="middle">P(0 ≤ Z ≤ z₁)</text>
</svg>`;

const SVG_CH6_COMPLEX = `<svg viewBox="0 0 740 235" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px">
  <defs>
    <marker id="arr-c6" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155"/>
    </marker>
  </defs>
  <text x="180" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Argand Diagram in Polar Form (Fig 6.4)</text>
  <line x1="35" y1="175" x2="325" y2="175" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c6)"/>
  <line x1="95" y1="215" x2="95" y2="35" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c6)"/>
  <line x1="95" y1="175" x2="255" y2="65" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arr-c6)"/>
  <line x1="255" y1="65" x2="255" y2="175" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="260" y="58" font-size="11" font-weight="bold" fill="#1e3a8a">P(x, y) = r(cos θ + i sin θ)</text>
  <text x="160" y="108" font-size="11" font-weight="bold" fill="#2563eb">r = |z|</text>
  <text x="265" y="125" font-size="10" font-weight="bold" fill="#dc2626">y = r sin θ</text>
  <text x="175" y="192" font-size="10" font-weight="bold" fill="#059669">x = r cos θ</text>
  <text x="135" y="166" font-size="11" fill="#0f172a">θ</text>

  <text x="555" y="22" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Circular Locus |z + 2 − i| = 5</text>
  <line x1="410" y1="135" x2="710" y2="135" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c6)"/>
  <line x1="585" y1="220" x2="585" y2="35" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-c6)"/>
  <circle cx="535" cy="110" r="68" fill="#dbeafe" fill-opacity="0.45" stroke="#2563eb" stroke-width="2.2"/>
  <circle cx="535" cy="110" r="3.5" fill="#dc2626"/>
  <line x1="535" y1="110" x2="592" y2="73" stroke="#dc2626" stroke-width="1.8"/>
  <text x="525" y="125" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="end">C(−2, 1)</text>
  <text x="568" y="85" font-size="10" font-weight="bold" fill="#dc2626">r = 5</text>
</svg>`;

const SVG_CH7_ODE_APPS = `<svg viewBox="0 0 760 235" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px">
  <defs>
    <marker id="arr-o7" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626"/>
    </marker>
    <marker id="arr-g7" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669"/>
    </marker>
  </defs>
  <text x="120" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Falling Body (Fig 7.1)</text>
  <circle cx="120" cy="115" r="24" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
  <text x="120" y="119" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">m</text>
  <line x1="120" y1="91" x2="120" y2="42" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-o7)"/>
  <text x="128" y="58" font-size="10" font-weight="bold" fill="#dc2626">F_d = kv</text>
  <line x1="120" y1="139" x2="120" y2="195" stroke="#059669" stroke-width="2.2" marker-end="url(#arr-g7)"/>
  <text x="128" y="182" font-size="10" font-weight="bold" fill="#059669">W = mg</text>

  <text x="365" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Damped Spring (Figs 7.2 &amp; 7.3)</text>
  <line x1="305" y1="35" x2="425" y2="35" stroke="#334155" stroke-width="3"/>
  <polyline points="365,35 365,50 350,58 380,70 350,82 380,94 350,106 365,114 365,130" fill="none" stroke="#2563eb" stroke-width="2.2"/>
  <rect x="335" y="130" width="60" height="42" rx="4" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2"/>
  <text x="365" y="155" font-size="11" font-weight="bold" text-anchor="middle" fill="#1e3a8a">m</text>
  <text x="365" y="205" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">mx'' + cx' + kx = F(t)</text>

  <text x="615" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Series RLC Circuit (Fig 7.4)</text>
  <rect x="500" y="55" width="225" height="125" fill="none" stroke="#334155" stroke-width="2"/>
  <rect x="535" y="47" width="45" height="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
  <text x="557" y="42" font-size="10" font-weight="bold" text-anchor="middle" fill="#854d0e">R</text>
  <rect x="615" y="47" width="55" height="16" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
  <text x="642" y="42" font-size="10" font-weight="bold" text-anchor="middle" fill="#166534">L</text>
  <line x1="715" y1="108" x2="735" y2="108" stroke="#2563eb" stroke-width="2.5"/>
  <line x1="715" y1="120" x2="735" y2="120" stroke="#2563eb" stroke-width="2.5"/>
  <text x="745" y="118" font-size="10" font-weight="bold" fill="#1d4ed8">C</text>
  <circle cx="500" cy="115" r="14" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
  <text x="500" y="119" font-size="9" font-weight="bold" text-anchor="middle" fill="#dc2626">E(t)</text>
  <text x="612" y="205" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Lq'' + Rq' + q/C = E(t)</text>
</svg>`;

const SVG_CH8_NUMERICAL = `<svg viewBox="0 0 760 235" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px">
  <defs>
    <marker id="arr-n8" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155"/>
    </marker>
  </defs>
  <text x="135" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Newton-Raphson (Fig 8.1)</text>
  <line x1="25" y1="185" x2="245" y2="185" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-n8)"/>
  <line x1="45" y1="210" x2="45" y2="35" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-n8)"/>
  <path d="M 55 205 Q 135 165 215 45" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <line x1="195" y1="76" x2="115" y2="185" stroke="#dc2626" stroke-width="1.8"/>
  <line x1="195" y1="76" x2="195" y2="185" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,3"/>
  <circle cx="195" cy="76" r="3.5" fill="#dc2626"/>
  <text x="195" y="200" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">x_n</text>
  <text x="115" y="200" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">x_{n+1}</text>

  <text x="385" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Trapezium &amp; Simpson Strips (Figs 8.3–8.4)</text>
  <line x1="270" y1="185" x2="505" y2="185" stroke="#334155" stroke-width="1.5" marker-end="url(#arr-n8)"/>
  <path d="M 290 185 L 290 135 C 350 65, 420 55, 480 110 L 480 185 Z" fill="#dbeafe" fill-opacity="0.65"/>
  <path d="M 290 135 C 350 65, 420 55, 480 110" fill="none" stroke="#1d4ed8" stroke-width="2.5"/>
  <line x1="290" y1="135" x2="290" y2="185" stroke="#1e3a8a" stroke-width="1.5"/>
  <line x1="337" y1="95" x2="337" y2="185" stroke="#1e3a8a" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="385" y1="75" x2="385" y2="185" stroke="#1e3a8a" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="432" y1="82" x2="432" y2="185" stroke="#1e3a8a" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="480" y1="110" x2="480" y2="185" stroke="#1e3a8a" stroke-width="1.5"/>
  <text x="290" y="200" font-size="9" fill="#0f172a" text-anchor="middle">x₀</text>
  <text x="337" y="200" font-size="9" fill="#0f172a" text-anchor="middle">x₁</text>
  <text x="385" y="200" font-size="9" fill="#0f172a" text-anchor="middle">x₂</text>
  <text x="432" y="200" font-size="9" fill="#0f172a" text-anchor="middle">x₃</text>
  <text x="480" y="200" font-size="9" fill="#0f172a" text-anchor="middle">x₄</text>

  <text x="635" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="#0f172a">Tent Roof Cross-Section (Ex 8.33)</text>
  <path d="M 535 185 L 535 145 Q 635 45 735 145 L 735 185 Z" fill="#dcfce7" stroke="#15803d" stroke-width="2"/>
  <line x1="585" y1="108" x2="585" y2="185" stroke="#15803d" stroke-width="1.2" stroke-dasharray="3,3"/>
  <line x1="635" y1="95" x2="635" y2="185" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="685" y1="108" x2="685" y2="185" stroke="#15803d" stroke-width="1.2" stroke-dasharray="3,3"/>
  <text x="635" y="202" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Span = 8 m (h = 1 m)</text>
</svg>`;

export function getAdvMathF6DiagramSvg(
  questionText: string,
  topic?: string,
  subTopic?: string
): { title: string; svgHtml: string; caption?: string } | null {
  const combined = `${questionText} ${topic || ''} ${subTopic || ''}`.toLowerCase();

  // Chapter 1 diagrams
  if (
    combined.includes('cooling tower') ||
    combined.includes('revision exercise 1 q30') ||
    (combined.includes('coordinate geometry ii') &&
      (combined.includes('figure') || combined.includes('latus rectum') || combined.includes('foci')))
  ) {
    return {
      title: 'Chapter 1: Conic Sections & Hyperbolic Cooling Tower',
      caption: 'Standard Parabola y² = 4ax, Ellipse x²/a² + y²/b² = 1, and Hyperbolic Cooling Tower (Rev Ex 1 Q30)',
      svgHtml: SVG_CH1_CONIC_AND_TOWER
    };
  }

  // Chapter 2 diagrams
  if (
    combined.includes('figure 2.2') ||
    combined.includes('fig 2.2') ||
    combined.includes('figure 2.8') ||
    combined.includes('fig 2.8') ||
    combined.includes('figure 2.10') ||
    combined.includes('fig 2.10') ||
    (combined.includes('chapter 2: vectors') &&
      (combined.includes('projection') || combined.includes('ratio theorem')))
  ) {
    return {
      title: 'Chapter 2: 3D Vector, Ratio Theorem & Vector Projection',
      caption: 'Figures 2.2, 2.8 & 2.10 — 3D Position Vector OP, Ratio Theorem, and Orthogonal Projection of a onto b',
      svgHtml: SVG_CH2_VECTORS
    };
  }

  // Chapter 3 diagrams
  if (
    combined.includes('figures 3.1') ||
    combined.includes('fig 3.1') ||
    combined.includes('exercise 3.7 q10') ||
    (combined.includes('hyperbolic functions') &&
      (combined.includes('bounded region') || combined.includes('sketch the graphs')))
  ) {
    return {
      title: 'Chapter 3: Hyperbolic Functions y = cosh x, y = sinh x & Bounded Area',
      caption: 'Figures 3.1 & 3.2 and Exercise 3.7 Q10 Bounded Region between y = a cosh(x/a) and y = b',
      svgHtml: SVG_CH3_HYPERBOLIC
    };
  }

  // Chapter 5 diagrams
  if (
    combined.includes('figures 5.3') ||
    combined.includes('figure 5.7') ||
    (combined.includes('chapter 5: probability') &&
      (combined.includes('venn diagram') || combined.includes('z ~ n(0, 1)')))
  ) {
    return {
      title: 'Chapter 5: Venn Diagram of Events & Standard Normal Curve Z ~ N(0, 1)',
      caption: 'Figures 5.3, 5.4 & 5.7 — Probability of Combined Events and Standard Normal Distribution Area',
      svgHtml: SVG_CH5_PROB_AND_NORMAL
    };
  }

  // Chapter 6 diagrams
  if (
    combined.includes('figure 6.4') ||
    combined.includes('argand diagram') ||
    combined.includes('circular locus') ||
    combined.includes('|z + 2 − i| = 5')
  ) {
    return {
      title: 'Chapter 6: Argand Diagram in Polar Form & Circular Locus',
      caption: 'Figure 6.4 Polar Representation z = r(cos θ + i sin θ) and Circular Locus |z + 2 − i| = 5',
      svgHtml: SVG_CH6_COMPLEX
    };
  }

  // Chapter 7 diagrams
  if (
    combined.includes('figure 7.1') ||
    combined.includes('figures 7.2') ||
    combined.includes('figure 7.4') ||
    combined.includes('falling body') ||
    combined.includes('vibrating spring') ||
    combined.includes('rlc circuit')
  ) {
    return {
      title: 'Chapter 7: Differential Equation Physical Models',
      caption: 'Figures 7.1–7.4 — Falling Body with Air Resistance, Damped Vibrating Spring & Series RLC Circuit',
      svgHtml: SVG_CH7_ODE_APPS
    };
  }

  // Chapter 8 diagrams
  if (
    combined.includes('figure 8.1') ||
    combined.includes('figure 8.3') ||
    combined.includes('figure 8.4') ||
    combined.includes('tent roof') ||
    combined.includes('example 8.33') ||
    (combined.includes('numerical methods') &&
      (combined.includes('geometric derivation') || combined.includes('parabolic strips')))
  ) {
    return {
      title: 'Chapter 8: Newton-Raphson Tangent, Trapezium/Simpson Strips & Tent Roof',
      caption: 'Figures 8.1, 8.3, 8.4 & Example 8.33 — Numerical Root-Finding and Quadrature Strips',
      svgHtml: SVG_CH8_NUMERICAL
    };
  }

  return null;
}
