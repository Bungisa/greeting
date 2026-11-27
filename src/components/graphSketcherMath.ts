export type GraphMode =
  | 'linear'
  | 'quadratic'
  | 'lp'
  | 'rational'
  | 'cubic'
  | 'trig'
  | 'explog'
  | 'conics'
  | 'modulus'
  | 'simultaneous'
  | 'calculus'
  | 'polar'
  | 'custom';

export type InequalityOp = '<=' | '>=' | '<' | '>';
export type TrigFuncType = 'sin' | 'cos' | 'tan';
export type AngleUnit = 'deg' | 'rad';
export type ExpLogKind = 'exp' | 'log' | 'inverse';
export type ConicKind = 'circle' | 'ellipse' | 'hyperbola';
export type ModulusKind = 'abs' | 'floor' | 'piecewise';
export type SimPairKind = 'line_quad' | 'line_circle' | 'quad_quad';
export type CalcCurveKind = 'quadratic' | 'cubic' | 'sine';
export type PolarCurveKind = 'rose' | 'limacon' | 'lemniscate' | 'spiral' | 'circle';

export interface LPConstraint {
  id: string;
  a: number;
  b: number;
  op: InequalityOp;
  c: number;
  enabled: boolean;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface RationalAnalysis {
  verticalAsymptotes: number[];
  holes: Point2D[];
  horizontalAsymptote: number | null;
  obliqueAsymptote: { m: number; b: number } | null;
  xIntercepts: number[];
  yIntercept: number | null;
  domainText: string;
}

export interface CubicTurningPoint extends Point2D {
  kind: 'Local Max' | 'Local Min';
}

export interface CubicAnalysis {
  roots: number[];
  turningPoints: CubicTurningPoint[];
  inflection: Point2D | null;
  yIntercept: number;
  endBehaviour: string;
  table: Point2D[];
}

export interface TrigAnalysis {
  amplitude: number | null;
  period: number;
  periodLabel: string;
  phaseShift: number;
  phaseLabel: string;
  midline: number;
  rangeText: string;
  asymptoteStep: number | null;
  firstAsymptoteOffset: number | null;
  table: Array<{ x: number; xLabel: string; y: number | null }>;
}

export interface ExpLogAnalysis {
  kind: ExpLogKind;
  behaviour: string;
  asymptoteLabel: string;
  xIntercept: number | null;
  yIntercept: number | null;
  domainText: string;
  rangeText: string;
  table: Array<{ x: number; y: number | null }>;
}

export interface ConicAnalysis {
  kind: ConicKind;
  equationText: string;
  expandedText?: string;
  center: Point2D;
  vertices: Point2D[];
  coVertices: Point2D[];
  foci: Point2D[];
  eccentricity: number;
  asymptotes: Array<{ m: number; b: number }>;
  areaOrMetric: string;
  tangentPoint?: Point2D;
  tangentEq?: string;
  tangentNormalDir?: Point2D;
}

export interface ModulusAnalysis {
  kind: ModulusKind;
  vertex?: Point2D;
  xIntercepts: number[];
  yIntercept: number | null;
  continuityText: string;
  leftLimit?: number;
  rightLimit?: number;
  table: Array<{ x: number; y: number }>;
}

export interface SimultaneousAnalysis {
  kind: SimPairKind;
  intersections: Point2D[];
  statusText: string;
  discriminantText: string;
}

export interface CalculusAnalysis {
  x0: number;
  y0: number;
  slopeTangent: number;
  slopeNormal: number | null;
  tangentEq: string;
  normalEq: string;
  signedIntegral: number;
  totalArea: number;
  curveFormula: string;
  derivativeFormula: string;
}

export interface PolarAnalysis {
  kind: PolarCurveKind;
  equationText: string;
  curveClass: string;
  symmetryText: string;
  maxRadius: number;
  domainText: string;
  probeThetaDeg: number;
  probeR: number | null;
  probeX: number | null;
  probeY: number | null;
  table: Array<{ thetaDeg: number; thetaLabel: string; r: number | null; x: number | null; y: number | null }>;
}

export const EPS = 1e-7;

export const CONSTRAINT_COLORS = [
  '#0284c7',
  '#d97706',
  '#7c3aed',
  '#0d9488',
  '#db2777',
  '#2563eb',
  '#ea580c',
];

export function fmtNum(n: number, maxDecimals = 2): string {
  if (!Number.isFinite(n)) return '—';
  const rounded = Math.abs(n) < 1e-9 ? 0 : n;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-6) {
    return String(Math.round(rounded));
  }
  return Number(rounded.toFixed(maxDecimals)).toString();
}

export function formatLinearExpr(a: number, b: number): string {
  const parts: string[] = [];
  if (Math.abs(a) > EPS) {
    if (Math.abs(a - 1) < EPS) parts.push('x');
    else if (Math.abs(a + 1) < EPS) parts.push('−x');
    else parts.push(`${fmtNum(a)}x`);
  }
  if (Math.abs(b) > EPS) {
    const absB = Math.abs(b);
    const term = Math.abs(absB - 1) < EPS ? 'y' : `${fmtNum(absB)}y`;
    if (parts.length === 0) {
      parts.push(b < 0 ? `−${term}` : term);
    } else {
      parts.push(b < 0 ? ` − ${term}` : ` + ${term}`);
    }
  }
  return parts.length ? parts.join('') : '0';
}

export function formatPoly2(a: number, b: number, c: number): string {
  const terms: string[] = [];
  if (Math.abs(a) > EPS) {
    if (Math.abs(a - 1) < EPS) terms.push('x²');
    else if (Math.abs(a + 1) < EPS) terms.push('−x²');
    else terms.push(`${fmtNum(a)}x²`);
  }
  if (Math.abs(b) > EPS) {
    const absB = Math.abs(b);
    const t = Math.abs(absB - 1) < EPS ? 'x' : `${fmtNum(absB)}x`;
    if (terms.length === 0) terms.push(b < 0 ? `−${t}` : t);
    else terms.push(b < 0 ? ` − ${t}` : ` + ${t}`);
  }
  if (Math.abs(c) > EPS || terms.length === 0) {
    const absC = Math.abs(c);
    if (terms.length === 0) terms.push(c < 0 ? `−${fmtNum(absC)}` : fmtNum(absC));
    else terms.push(c < 0 ? ` − ${fmtNum(absC)}` : ` + ${fmtNum(absC)}`);
  }
  return terms.join('');
}

export function formatPoly3(a: number, b: number, c: number, d: number): string {
  const terms: string[] = [];
  const pushTerm = (coeff: number, sym: string) => {
    if (Math.abs(coeff) <= EPS) return;
    const absC = Math.abs(coeff);
    const body = sym && Math.abs(absC - 1) < EPS ? sym : `${fmtNum(absC)}${sym}`;
    if (terms.length === 0) terms.push(coeff < 0 ? `−${body}` : body);
    else terms.push(coeff < 0 ? ` − ${body}` : ` + ${body}`);
  };
  pushTerm(a, 'x³');
  pushTerm(b, 'x²');
  pushTerm(c, 'x');
  if (Math.abs(d) > EPS || terms.length === 0) {
    const absD = Math.abs(d);
    if (terms.length === 0) terms.push(d < 0 ? `−${fmtNum(absD)}` : fmtNum(absD));
    else terms.push(d < 0 ? ` − ${fmtNum(absD)}` : ` + ${fmtNum(absD)}`);
  }
  return terms.join('');
}

export function formatShift(v: number, variable = 'x'): string {
  if (Math.abs(v) < EPS) return variable;
  return v > 0 ? `${variable} − ${fmtNum(v)}` : `${variable} + ${fmtNum(Math.abs(v))}`;
}

export function formatPiMultiple(val: number): string {
  const ratio = val / Math.PI;
  if (Math.abs(ratio) < 1e-5) return '0';
  // Check clean fractions with denominators 1, 2, 3, 4, 6
  const denoms = [1, 2, 3, 4, 6];
  for (const d of denoms) {
    const n = Math.round(ratio * d);
    if (Math.abs(ratio - n / d) < 1e-3 && n !== 0) {
      const sign = n < 0 ? '−' : '';
      const an = Math.abs(n);
      if (d === 1) return an === 1 ? `${sign}π` : `${sign}${an}π`;
      return an === 1 ? `${sign}π/${d}` : `${sign}${an}π/${d}`;
    }
  }
  return fmtNum(val);
}

export function niceGridStep(span: number): number {
  const rough = span / 10;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(1e-6, rough))));
  const norm = rough / pow;
  if (norm < 1.5) return 1 * pow;
  if (norm < 3.5) return 2 * pow;
  if (norm < 7.5) return 5 * pow;
  return 10 * pow;
}

/**
 * Sutherland-Hodgman clip of a 2D polygon against half-plane: nx*x + ny*y <= d
 */
export function clipPolygonHalfPlane(
  poly: Point2D[],
  nx: number,
  ny: number,
  d: number
): Point2D[] {
  if (poly.length === 0) return [];
  const out: Point2D[] = [];
  const evalFn = (p: Point2D) => nx * p.x + ny * p.y - d;

  for (let i = 0; i < poly.length; i++) {
    const curr = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const currVal = evalFn(curr);
    const prevVal = evalFn(prev);
    const currIn = currVal <= 1e-7;
    const prevIn = prevVal <= 1e-7;

    if (currIn !== prevIn) {
      const denom = prevVal - currVal;
      if (Math.abs(denom) > 1e-12) {
        const t = prevVal / denom;
        out.push({
          x: prev.x + t * (curr.x - prev.x),
          y: prev.y + t * (curr.y - prev.y),
        });
      }
    }
    if (currIn) {
      out.push(curr);
    }
  }
  return out;
}

export function computePolygonAreaAndCentroid(poly: Point2D[]): { area: number; centroid: Point2D | null } {
  if (poly.length < 3) return { area: 0, centroid: null };
  let a2 = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    const cross = p1.x * p2.y - p2.x * p1.y;
    a2 += cross;
    cx += (p1.x + p2.x) * cross;
    cy += (p1.y + p2.y) * cross;
  }
  if (Math.abs(a2) < 1e-9) return { area: 0, centroid: null };
  return {
    area: Math.abs(a2) * 0.5,
    centroid: { x: cx / (3 * a2), y: cy / (3 * a2) },
  };
}

export function analyzeRational(
  p2: number,
  p1: number,
  p0: number,
  q2: number,
  q1: number,
  q0: number
): RationalAnalysis {
  const numAt = (x: number) => p2 * x * x + p1 * x + p0;
  const denAt = (x: number) => q2 * x * x + q1 * x + q0;
  const numPrime = (x: number) => 2 * p2 * x + p1;
  const denPrime = (x: number) => 2 * q2 * x + q1;

  const denRoots: number[] = [];
  if (Math.abs(q2) > EPS) {
    const disc = q1 * q1 - 4 * q2 * q0;
    if (disc > EPS) {
      const s = Math.sqrt(disc);
      denRoots.push((-q1 - s) / (2 * q2), (-q1 + s) / (2 * q2));
    } else if (Math.abs(disc) <= EPS) {
      denRoots.push(-q1 / (2 * q2));
    }
  } else if (Math.abs(q1) > EPS) {
    denRoots.push(-q0 / q1);
  }
  denRoots.sort((a, b) => a - b);

  const uniqueDenRoots: number[] = [];
  for (const r of denRoots) {
    if (!uniqueDenRoots.some((u) => Math.abs(u - r) < 1e-5)) {
      uniqueDenRoots.push(r);
    }
  }

  const verticalAsymptotes: number[] = [];
  const holes: Point2D[] = [];

  for (const r of uniqueDenRoots) {
    if (Math.abs(numAt(r)) < 1e-5) {
      const dp = denPrime(r);
      if (Math.abs(dp) > 1e-5) {
        holes.push({ x: r, y: numPrime(r) / dp });
      } else if (Math.abs(numPrime(r)) < 1e-5 && Math.abs(q2) > EPS) {
        holes.push({ x: r, y: p2 / q2 });
      } else {
        verticalAsymptotes.push(r);
      }
    } else {
      verticalAsymptotes.push(r);
    }
  }

  const degN = Math.abs(p2) > EPS ? 2 : Math.abs(p1) > EPS ? 1 : 0;
  const degD = Math.abs(q2) > EPS ? 2 : Math.abs(q1) > EPS ? 1 : 0;

  let horizontalAsymptote: number | null = null;
  let obliqueAsymptote: { m: number; b: number } | null = null;

  if (degD > 0) {
    if (degN < degD) {
      horizontalAsymptote = 0;
    } else if (degN === degD) {
      horizontalAsymptote = degN === 2 ? p2 / q2 : p1 / q1;
    } else if (degN === 2 && degD === 1) {
      const m = p2 / q1;
      const b = (p1 - m * q0) / q1;
      const rem = p0 - b * q0;
      if (Math.abs(rem) > 1e-5) {
        obliqueAsymptote = { m, b };
      }
    }
  }

  const yIntercept = Math.abs(denAt(0)) > 1e-5 ? numAt(0) / denAt(0) : null;

  const rawNumRoots: number[] = [];
  if (Math.abs(p2) > EPS) {
    const disc = p1 * p1 - 4 * p2 * p0;
    if (disc > EPS) {
      const s = Math.sqrt(disc);
      rawNumRoots.push((-p1 - s) / (2 * p2), (-p1 + s) / (2 * p2));
    } else if (Math.abs(disc) <= EPS) {
      rawNumRoots.push(-p1 / (2 * p2));
    }
  } else if (Math.abs(p1) > EPS) {
    rawNumRoots.push(-p0 / p1);
  }
  const xIntercepts = rawNumRoots
    .filter((r) => Math.abs(denAt(r)) > 1e-5)
    .sort((a, b) => a - b);

  const excluded = [...verticalAsymptotes, ...holes.map((h) => h.x)].sort((a, b) => a - b);
  const domainText =
    excluded.length === 0
      ? 'x ∈ ℝ (All real numbers)'
      : `x ∈ ℝ, x ≠ ${excluded.map((v) => fmtNum(v)).join(', ')}`;

  return {
    verticalAsymptotes,
    holes,
    horizontalAsymptote,
    obliqueAsymptote,
    xIntercepts,
    yIntercept,
    domainText,
  };
}

// ============================================================================
// NEW MODE 5: CUBIC & POLYNOMIAL ANALYSIS
// ============================================================================
function bisectRoot(fn: (x: number) => number, left: number, right: number): number {
  let lo = left;
  let hi = right;
  let flo = fn(lo);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) * 0.5;
    const fmid = fn(mid);
    if (Math.abs(fmid) < 1e-10) return mid;
    if ((flo < 0 && fmid < 0) || (flo > 0 && fmid > 0)) {
      lo = mid;
      flo = fmid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) * 0.5;
}

export function analyzeCubic(a: number, b: number, c: number, d: number): CubicAnalysis {
  const f = (x: number) => a * x * x * x + b * x * x + c * x + d;
  const f2 = (x: number) => 6 * a * x + 2 * b;

  const turningPoints: CubicTurningPoint[] = [];
  let inflection: Point2D | null = null;
  const roots: number[] = [];

  if (Math.abs(a) > EPS) {
    // Turning points from 3ax^2 + 2bx + c = 0
    const qa = 3 * a;
    const qb = 2 * b;
    const qc = c;
    const disc = qb * qb - 4 * qa * qc;
    const critXs: number[] = [];
    if (disc > EPS) {
      const s = Math.sqrt(disc);
      const x1 = (-qb - s) / (2 * qa);
      const x2 = (-qb + s) / (2 * qa);
      critXs.push(Math.min(x1, x2), Math.max(x1, x2));
      for (const cx of critXs) {
        const second = f2(cx);
        turningPoints.push({
          x: cx,
          y: f(cx),
          kind: second < 0 ? 'Local Max' : 'Local Min',
        });
      }
    }

    // Inflection point: 6ax + 2b = 0
    const ix = -b / (3 * a);
    inflection = { x: ix, y: f(ix) };

    // Real roots via monotonic intervals separated by critical points
    const bound = Math.max(20, 2 + (Math.abs(b) + Math.abs(c) + Math.abs(d)) / Math.abs(a));
    const intervals = [-bound, ...critXs, bound];
    for (let i = 0; i < intervals.length - 1; i++) {
      const l = intervals[i];
      const r = intervals[i + 1];
      const fl = f(l);
      const fr = f(r);
      if (Math.abs(fl) < 1e-6) {
        if (!roots.some((u) => Math.abs(u - l) < 1e-4)) roots.push(l);
      }
      if (Math.abs(fr) < 1e-6) {
        if (!roots.some((u) => Math.abs(u - r) < 1e-4)) roots.push(r);
      }
      if ((fl < 0 && fr > 0) || (fl > 0 && fr < 0)) {
        const root = bisectRoot(f, l, r);
        if (!roots.some((u) => Math.abs(u - root) < 1e-4)) roots.push(root);
      }
    }
    roots.sort((u, v) => u - v);
  } else if (Math.abs(b) > EPS) {
    // Fallback to quadratic
    const disc = c * c - 4 * b * d;
    if (disc > EPS) {
      const s = Math.sqrt(disc);
      roots.push((-c - s) / (2 * b), (-c + s) / (2 * b));
      roots.sort((u, v) => u - v);
    } else if (Math.abs(disc) <= EPS) {
      roots.push(-c / (2 * b));
    }
    const vx = -c / (2 * b);
    turningPoints.push({ x: vx, y: f(vx), kind: b > 0 ? 'Local Min' : 'Local Max' });
  } else if (Math.abs(c) > EPS) {
    roots.push(-d / c);
  }

  const endBehaviour =
    a > EPS
      ? 'x → −∞: y → −∞  ·  x → +∞: y → +∞'
      : a < -EPS
      ? 'x → −∞: y → +∞  ·  x → +∞: y → −∞'
      : 'Degenerate (a = 0)';

  const centerX = inflection ? Math.round(inflection.x) : 0;
  const table = [-3, -2, -1, 0, 1, 2, 3].map((dx) => {
    const x = centerX + dx;
    return { x, y: f(x) };
  });

  return {
    roots,
    turningPoints,
    inflection,
    yIntercept: d,
    endBehaviour,
    table,
  };
}

// ============================================================================
// NEW MODE 6: TRIGONOMETRIC ANALYSIS
// ============================================================================
export function evalTrig(
  func: TrigFuncType,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  unit: AngleUnit
): number {
  const rad = unit === 'deg' ? ((b * x + c) * Math.PI) / 180 : b * x + c;
  if (func === 'sin') return a * Math.sin(rad) + d;
  if (func === 'cos') return a * Math.cos(rad) + d;
  const cosVal = Math.cos(rad);
  if (Math.abs(cosVal) < 1e-4) return NaN;
  return a * Math.tan(rad) + d;
}

export function analyzeTrig(
  func: TrigFuncType,
  a: number,
  b: number,
  c: number,
  d: number,
  unit: AngleUnit
): TrigAnalysis {
  const absB = Math.max(0.05, Math.abs(b));
  const basePeriod = func === 'tan' ? (unit === 'deg' ? 180 : Math.PI) : unit === 'deg' ? 360 : 2 * Math.PI;
  const period = basePeriod / absB;
  const periodLabel = unit === 'deg' ? `${fmtNum(period)}°` : formatPiMultiple(period);

  const phaseShift = Math.abs(b) > EPS ? -c / b : 0;
  const phaseLabel =
    Math.abs(phaseShift) < 1e-5
      ? '0 (none)'
      : unit === 'deg'
      ? `${fmtNum(phaseShift)}°`
      : formatPiMultiple(phaseShift);

  const amplitude = func === 'tan' ? null : Math.abs(a);
  const rangeText =
    func === 'tan'
      ? 'y ∈ ℝ (All real numbers)'
      : `[${fmtNum(d - Math.abs(a))}, ${fmtNum(d + Math.abs(a))}]`;

  let asymptoteStep: number | null = null;
  let firstAsymptoteOffset: number | null = null;
  if (func === 'tan' && Math.abs(b) > EPS) {
    const halfPeriod = unit === 'deg' ? 180 : Math.PI;
    const quarter = halfPeriod / 2;
    asymptoteStep = halfPeriod / Math.abs(b);
    firstAsymptoteOffset = (quarter - c) / b;
  }

  const keyXs =
    unit === 'deg'
      ? [0, 45, 90, 135, 180, 270, 360]
      : [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI];

  const table = keyXs.map((x) => {
    const y = evalTrig(func, a, b, c, d, x, unit);
    return {
      x,
      xLabel: unit === 'deg' ? `${x}°` : formatPiMultiple(x),
      y: Number.isFinite(y) && Math.abs(y) < 1e4 ? y : null,
    };
  });

  return {
    amplitude,
    period,
    periodLabel,
    phaseShift,
    phaseLabel,
    midline: d,
    rangeText,
    asymptoteStep,
    firstAsymptoteOffset,
    table,
  };
}

// ============================================================================
// NEW MODE 7: EXPONENTIAL & LOGARITHMIC ANALYSIS
// ============================================================================
export function evalExp(a: number, base: number, h: number, k: number, x: number): number {
  const safeBase = Math.max(0.05, base);
  return a * Math.pow(safeBase, x - h) + k;
}

export function evalLog(a: number, base: number, h: number, k: number, x: number): number {
  if (x <= h + 1e-6) return NaN;
  const safeBase = Math.max(0.05, base);
  if (Math.abs(safeBase - 1) < 1e-4) return NaN;
  return a * (Math.log(x - h) / Math.log(safeBase)) + k;
}

export function analyzeExpLog(
  kind: ExpLogKind,
  a: number,
  base: number,
  h: number,
  k: number
): ExpLogAnalysis {
  const safeBase = Math.max(0.05, base);
  if (kind === 'exp') {
    const yInt = evalExp(a, safeBase, h, k, 0);
    // a * base^(x-h) + k = 0 -> base^(x-h) = -k/a
    let xInt: number | null = null;
    if (Math.abs(a) > EPS && Math.abs(safeBase - 1) > 1e-4 && -k / a > 0) {
      xInt = h + Math.log(-k / a) / Math.log(safeBase);
    }
    const behaviour =
      safeBase > 1
        ? a >= 0
          ? 'Exponential Growth (increasing)'
          : 'Reflected Growth (decreasing)'
        : safeBase < 1
        ? a >= 0
          ? 'Exponential Decay (decreasing)'
          : 'Reflected Decay (increasing)'
        : 'Constant (base = 1)';
    const table = [-2, -1, 0, 1, 2, 3].map((dx) => {
      const x = Math.round(h) + dx;
      return { x, y: evalExp(a, safeBase, h, k, x) };
    });
    return {
      kind,
      behaviour,
      asymptoteLabel: `Horizontal Asymptote: y = ${fmtNum(k)}`,
      xIntercept: xInt,
      yIntercept: yInt,
      domainText: 'x ∈ ℝ',
      rangeText: a > 0 ? `y > ${fmtNum(k)}` : a < 0 ? `y < ${fmtNum(k)}` : `y = ${fmtNum(k)}`,
      table,
    };
  }

  if (kind === 'log') {
    // a * log_b(x - h) + k = 0 -> x = h + b^(-k/a)
    let xInt: number | null = null;
    if (Math.abs(a) > EPS && Math.abs(safeBase - 1) > 1e-4) {
      xInt = h + Math.pow(safeBase, -k / a);
    }
    const yInt = 0 > h ? evalLog(a, safeBase, h, k, 0) : null;
    const behaviour =
      safeBase > 1
        ? a >= 0
          ? 'Logarithmic Growth (increasing)'
          : 'Reflected Log (decreasing)'
        : 'Logarithmic Decay (0 < b < 1)';
    const sampleOffsets = [0.25, 0.5, 1, 2, 4, 8];
    const table = sampleOffsets.map((dx) => {
      const x = h + dx;
      const y = evalLog(a, safeBase, h, k, x);
      return { x, y: Number.isFinite(y) ? y : null };
    });
    return {
      kind,
      behaviour,
      asymptoteLabel: `Vertical Asymptote: x = ${fmtNum(h)}`,
      xIntercept: xInt,
      yIntercept: yInt !== null && Number.isFinite(yInt) ? yInt : null,
      domainText: `x > ${fmtNum(h)}`,
      rangeText: 'y ∈ ℝ',
      table,
    };
  }

  // Inverse pair: y = b^x and y = log_b(x) reflected across y = x
  const table = [-1, 0, 1, 2, 3].map((x) => ({ x, y: Math.pow(safeBase, x) }));
  return {
    kind,
    behaviour: 'Inverse Reflection across y = x (f⁻¹(x) swaps x and y)',
    asymptoteLabel: 'Exp HA: y = 0  ·  Log VA: x = 0',
    xIntercept: 1,
    yIntercept: 1,
    domainText: 'Exp: ℝ · Log: x > 0',
    rangeText: 'Exp: y > 0 · Log: ℝ',
    table,
  };
}

// ============================================================================
// NEW MODE 8: CIRCLE & CONIC SECTIONS ANALYSIS
// ============================================================================
export function analyzeConic(
  kind: ConicKind,
  h: number,
  k: number,
  a: number,
  b: number,
  tangentAngleDeg: number,
  hyperbolaAxis: 'horizontal' | 'vertical'
): ConicAnalysis {
  const safeA = Math.max(0.5, Math.abs(a));
  const safeB = Math.max(0.5, Math.abs(b));

  if (kind === 'circle') {
    const r = safeA;
    const D = -2 * h;
    const E = -2 * k;
    const F = h * h + k * k - r * r;
    const rad = (tangentAngleDeg * Math.PI) / 180;
    const tx = h + r * Math.cos(rad);
    const ty = k + r * Math.sin(rad);
    // Tangent to circle at (tx, ty): (tx - h)(x - h) + (ty - k)(y - k) = r^2
    // => (tx - h)x + (ty - k)y = (tx - h)tx + (ty - k)ty
    const nx = tx - h;
    const ny = ty - k;
    const rhs = nx * tx + ny * ty;
    let tangentEq = '';
    if (Math.abs(ny) < 1e-4) {
      tangentEq = `x = ${fmtNum(tx)}`;
    } else if (Math.abs(nx) < 1e-4) {
      tangentEq = `y = ${fmtNum(ty)}`;
    } else {
      const m = -nx / ny;
      const c = rhs / ny;
      tangentEq = `y = ${formatPoly2(0, m, c)}`;
    }
    const expandedTerms = [
      'x² + y²',
      Math.abs(D) > EPS ? `${D < 0 ? ' − ' : ' + '}${fmtNum(Math.abs(D))}x` : '',
      Math.abs(E) > EPS ? `${E < 0 ? ' − ' : ' + '}${fmtNum(Math.abs(E))}y` : '',
      Math.abs(F) > EPS ? `${F < 0 ? ' − ' : ' + '}${fmtNum(Math.abs(F))}` : '',
      ' = 0',
    ].join('');

    return {
      kind,
      equationText: `(${formatShift(h, 'x')})² + (${formatShift(k, 'y')})² = ${fmtNum(r * r)}`,
      expandedText: expandedTerms,
      center: { x: h, y: k },
      vertices: [
        { x: h + r, y: k },
        { x: h - r, y: k },
      ],
      coVertices: [
        { x: h, y: k + r },
        { x: h, y: k - r },
      ],
      foci: [{ x: h, y: k }],
      eccentricity: 0,
      asymptotes: [],
      areaOrMetric: `Area = ${fmtNum(Math.PI * r * r)} · Circumference = ${fmtNum(2 * Math.PI * r)}`,
      tangentPoint: { x: tx, y: ty },
      tangentEq,
      tangentNormalDir: { x: nx, y: ny },
    };
  }

  if (kind === 'ellipse') {
    const major = Math.max(safeA, safeB);
    const minor = Math.min(safeA, safeB);
    const c = Math.sqrt(Math.max(0, major * major - minor * minor));
    const horizontal = safeA >= safeB;
    const vertices = horizontal
      ? [
          { x: h - safeA, y: k },
          { x: h + safeA, y: k },
        ]
      : [
          { x: h, y: k - safeB },
          { x: h, y: k + safeB },
        ];
    const coVertices = horizontal
      ? [
          { x: h, y: k - safeB },
          { x: h, y: k + safeB },
        ]
      : [
          { x: h - safeA, y: k },
          { x: h + safeA, y: k },
        ];
    const foci = horizontal
      ? [
          { x: h - c, y: k },
          { x: h + c, y: k },
        ]
      : [
          { x: h, y: k - c },
          { x: h, y: k + c },
        ];
    return {
      kind,
      equationText: `(${formatShift(h, 'x')})²/${fmtNum(safeA * safeA)} + (${formatShift(k, 'y')})²/${fmtNum(safeB * safeB)} = 1`,
      center: { x: h, y: k },
      vertices,
      coVertices,
      foci,
      eccentricity: c / major,
      asymptotes: [],
      areaOrMetric: `Major axis = ${fmtNum(2 * major)} · Minor axis = ${fmtNum(2 * minor)} · Area = ${fmtNum(Math.PI * safeA * safeB)}`,
    };
  }

  // Hyperbola
  const c = Math.sqrt(safeA * safeA + safeB * safeB);
  const isHoriz = hyperbolaAxis === 'horizontal';
  const vertices = isHoriz
    ? [
        { x: h - safeA, y: k },
        { x: h + safeA, y: k },
      ]
    : [
        { x: h, y: k - safeB },
        { x: h, y: k + safeB },
      ];
  const coVertices = isHoriz
    ? [
        { x: h, y: k - safeB },
        { x: h, y: k + safeB },
      ]
    : [
        { x: h - safeA, y: k },
        { x: h + safeA, y: k },
      ];
  const foci = isHoriz
    ? [
        { x: h - c, y: k },
        { x: h + c, y: k },
      ]
    : [
        { x: h, y: k - c },
        { x: h, y: k + c },
      ];
  const m = safeB / safeA;
  const asymptotes = [
    { m, b: k - m * h },
    { m: -m, b: k + m * h },
  ];
  const equationText = isHoriz
    ? `(${formatShift(h, 'x')})²/${fmtNum(safeA * safeA)} − (${formatShift(k, 'y')})²/${fmtNum(safeB * safeB)} = 1`
    : `(${formatShift(k, 'y')})²/${fmtNum(safeB * safeB)} − (${formatShift(h, 'x')})²/${fmtNum(safeA * safeA)} = 1`;

  return {
    kind,
    equationText,
    center: { x: h, y: k },
    vertices,
    coVertices,
    foci,
    eccentricity: isHoriz ? c / safeA : c / safeB,
    asymptotes,
    areaOrMetric: `Focal dist c = ${fmtNum(c)} · Transverse = ${fmtNum(2 * (isHoriz ? safeA : safeB))}`,
  };
}

// ============================================================================
// NEW MODE 9: MODULUS & PIECEWISE / STEP ANALYSIS
// ============================================================================
export function analyzeModulus(
  kind: ModulusKind,
  a: number,
  h: number,
  k: number,
  stepFreq: number,
  pwSplit: number,
  pwLeftM: number,
  pwLeftC: number,
  pwRightM: number,
  pwRightC: number
): ModulusAnalysis {
  if (kind === 'abs') {
    const xIntercepts: number[] = [];
    if (Math.abs(a) > EPS) {
      const rhs = -k / a;
      if (rhs > EPS) {
        xIntercepts.push(h - rhs, h + rhs);
      } else if (Math.abs(rhs) <= EPS) {
        xIntercepts.push(h);
      }
    }
    const yIntercept = a * Math.abs(-h) + k;
    const ch = Math.round(h);
    const table = [-3, -2, -1, 0, 1, 2, 3].map((dx) => {
      const x = ch + dx;
      return { x, y: a * Math.abs(x - h) + k };
    });
    return {
      kind,
      vertex: { x: h, y: k },
      xIntercepts,
      yIntercept,
      continuityText: `Continuous everywhere · Sharp corner at (${fmtNum(h)}, ${fmtNum(k)})`,
      table,
    };
  }

  if (kind === 'floor') {
    const b = Math.max(0.25, Math.abs(stepFreq));
    const table = [-2, -1, 0, 1, 2, 3].map((x) => ({
      x,
      y: a * Math.floor(b * x) + k,
    }));
    return {
      kind,
      xIntercepts: [],
      yIntercept: a * Math.floor(0) + k,
      continuityText: `Jump discontinuity every Δx = ${fmtNum(1 / b)} (closed left dot ●, open right dot ○)`,
      table,
    };
  }

  // Piecewise
  const leftLimit = pwLeftM * pwSplit + pwLeftC;
  const rightLimit = pwRightM * pwSplit + pwRightC;
  const isContinuous = Math.abs(leftLimit - rightLimit) < 1e-4;
  const xIntercepts: number[] = [];
  if (Math.abs(pwLeftM) > EPS) {
    const r1 = -pwLeftC / pwLeftM;
    if (r1 < pwSplit - 1e-6) xIntercepts.push(r1);
  }
  if (Math.abs(pwRightM) > EPS) {
    const r2 = -pwRightC / pwRightM;
    if (r2 >= pwSplit - 1e-6) xIntercepts.push(r2);
  }
  const yIntercept = 0 < pwSplit ? pwLeftC : pwRightC;
  const cs = Math.round(pwSplit);
  const table = [-2, -1, 0, 1, 2, 3].map((dx) => {
    const x = cs + dx;
    return { x, y: x < pwSplit ? pwLeftM * x + pwLeftC : pwRightM * x + pwRightC };
  });

  return {
    kind,
    xIntercepts,
    yIntercept,
    leftLimit,
    rightLimit,
    continuityText: isContinuous
      ? `Continuous at x = ${fmtNum(pwSplit)} (left limit = right limit = ${fmtNum(rightLimit)})`
      : `Jump Discontinuity at x = ${fmtNum(pwSplit)}: lim⁻ = ${fmtNum(leftLimit)} (○), f(${fmtNum(pwSplit)}) = ${fmtNum(rightLimit)} (●)`,
    table,
  };
}

// ============================================================================
// NEW MODE 10: SIMULTANEOUS EQUATIONS / INTERSECTIONS
// ============================================================================
export function analyzeSimultaneous(
  kind: SimPairKind,
  qa: number,
  qb: number,
  qc: number,
  lm: number,
  ld: number,
  ch: number,
  ck: number,
  cr: number,
  q2a: number,
  q2b: number,
  q2c: number
): SimultaneousAnalysis {
  const intersections: Point2D[] = [];

  if (kind === 'line_quad') {
    // qa*x^2 + (qb - lm)x + (qc - ld) = 0
    const A = qa;
    const B = qb - lm;
    const C = qc - ld;
    if (Math.abs(A) > EPS) {
      const disc = B * B - 4 * A * C;
      if (disc > EPS) {
        const s = Math.sqrt(disc);
        const x1 = (-B - s) / (2 * A);
        const x2 = (-B + s) / (2 * A);
        [x1, x2].sort((u, v) => u - v).forEach((x) => intersections.push({ x, y: lm * x + ld }));
        return {
          kind,
          intersections,
          statusText: '2 Distinct Real Intersections (Secant)',
          discriminantText: `Δ = ${fmtNum(disc)} > 0`,
        };
      } else if (Math.abs(disc) <= EPS) {
        const x = -B / (2 * A);
        intersections.push({ x, y: lm * x + ld });
        return {
          kind,
          intersections,
          statusText: '1 Tangent Touch Point',
          discriminantText: 'Δ = 0',
        };
      }
      return {
        kind,
        intersections,
        statusText: 'No Real Intersection',
        discriminantText: `Δ = ${fmtNum(disc)} < 0`,
      };
    } else if (Math.abs(B) > EPS) {
      const x = -C / B;
      intersections.push({ x, y: lm * x + ld });
      return { kind, intersections, statusText: '1 Linear Intersection', discriminantText: 'Linear' };
    }
    return { kind, intersections, statusText: 'Parallel / Coincident', discriminantText: '—' };
  }

  if (kind === 'line_circle') {
    // (x - ch)^2 + (lm*x + ld - ck)^2 = cr^2
    const kShift = ld - ck;
    const A = 1 + lm * lm;
    const B = -2 * ch + 2 * lm * kShift;
    const C = ch * ch + kShift * kShift - cr * cr;
    const disc = B * B - 4 * A * C;
    if (disc > EPS) {
      const s = Math.sqrt(disc);
      const x1 = (-B - s) / (2 * A);
      const x2 = (-B + s) / (2 * A);
      [x1, x2].sort((u, v) => u - v).forEach((x) => intersections.push({ x, y: lm * x + ld }));
      return {
        kind,
        intersections,
        statusText: 'Secant Line (2 Intersections)',
        discriminantText: `Δ = ${fmtNum(disc)} > 0`,
      };
    } else if (Math.abs(disc) <= EPS) {
      const x = -B / (2 * A);
      intersections.push({ x, y: lm * x + ld });
      return {
        kind,
        intersections,
        statusText: 'Tangent Line (Touches at 1 Point)',
        discriminantText: 'Δ = 0',
      };
    }
    return {
      kind,
      intersections,
      statusText: 'Exterior Line (No Intersection)',
      discriminantText: `Δ = ${fmtNum(disc)} < 0`,
    };
  }

  // Two quadratics: (qa - q2a)x^2 + (qb - q2b)x + (qc - q2c) = 0
  const A = qa - q2a;
  const B = qb - q2b;
  const C = qc - q2c;
  if (Math.abs(A) > EPS) {
    const disc = B * B - 4 * A * C;
    if (disc > EPS) {
      const s = Math.sqrt(disc);
      const x1 = (-B - s) / (2 * A);
      const x2 = (-B + s) / (2 * A);
      [x1, x2]
        .sort((u, v) => u - v)
        .forEach((x) => intersections.push({ x, y: qa * x * x + qb * x + qc }));
      return {
        kind,
        intersections,
        statusText: '2 Distinct Real Intersections',
        discriminantText: `Δ = ${fmtNum(disc)} > 0`,
      };
    } else if (Math.abs(disc) <= EPS) {
      const x = -B / (2 * A);
      intersections.push({ x, y: qa * x * x + qb * x + qc });
      return { kind, intersections, statusText: 'Curves Touch Tangentially', discriminantText: 'Δ = 0' };
    }
    return { kind, intersections, statusText: 'No Real Intersection', discriminantText: `Δ = ${fmtNum(disc)} < 0` };
  } else if (Math.abs(B) > EPS) {
    const x = -C / B;
    intersections.push({ x, y: qa * x * x + qb * x + qc });
    return { kind, intersections, statusText: '1 Intersection Point', discriminantText: 'Same curvature a₁ = a₂' };
  }
  return { kind, intersections, statusText: 'Parallel or Coincident Parabolas', discriminantText: '—' };
}

// ============================================================================
// NEW MODE 11: CALCULUS (TANGENT, NORMAL & DEFINITE INTEGRAL)
// ============================================================================
export function evalCalcCurve(
  curve: CalcCurveKind,
  a: number,
  b: number,
  c: number,
  x: number
): number {
  if (curve === 'quadratic') return a * x * x + b * x + c;
  if (curve === 'cubic') return a * x * x * x + b * x + c;
  return a * Math.sin(b * x) + c;
}

export function evalCalcDeriv(
  curve: CalcCurveKind,
  a: number,
  b: number,
  x: number
): number {
  if (curve === 'quadratic') return 2 * a * x + b;
  if (curve === 'cubic') return 3 * a * x * x + b;
  return a * b * Math.cos(b * x);
}

export function analyzeCalculus(
  curve: CalcCurveKind,
  a: number,
  b: number,
  c: number,
  x0: number,
  intA: number,
  intB: number
): CalculusAnalysis {
  const y0 = evalCalcCurve(curve, a, b, c, x0);
  const mT = evalCalcDeriv(curve, a, b, x0);
  const cT = y0 - mT * x0;
  const tangentEq = `y = ${formatPoly2(0, mT, cT)}`;

  let slopeNormal: number | null = null;
  let normalEq = '';
  if (Math.abs(mT) < 1e-4) {
    normalEq = `x = ${fmtNum(x0)}`;
  } else {
    slopeNormal = -1 / mT;
    const cN = y0 - slopeNormal * x0;
    normalEq = `y = ${formatPoly2(0, slopeNormal, cN)}`;
  }

  // High-precision Simpson's rule integration (N = 200 subintervals)
  const N = 200;
  const h = (intB - intA) / N;
  let signedSum = 0;
  let absSum = 0;
  if (Math.abs(h) > 1e-9) {
    for (let i = 0; i <= N; i++) {
      const xi = intA + i * h;
      const yi = evalCalcCurve(curve, a, b, c, xi);
      const w = i === 0 || i === N ? 1 : i % 2 === 0 ? 2 : 4;
      signedSum += w * yi;
      absSum += w * Math.abs(yi);
    }
    signedSum *= h / 3;
    absSum *= Math.abs(h) / 3;
  }

  const curveFormula =
    curve === 'quadratic'
      ? `f(x) = ${formatPoly2(a, b, c)}`
      : curve === 'cubic'
      ? `f(x) = ${formatPoly3(a, 0, b, c)}`
      : `f(x) = ${fmtNum(a)}·sin(${fmtNum(b)}x)${Math.abs(c) > EPS ? (c > 0 ? ` + ${fmtNum(c)}` : ` − ${fmtNum(Math.abs(c))}`) : ''}`;

  const derivativeFormula =
    curve === 'quadratic'
      ? `f'(x) = ${formatPoly2(0, 2 * a, b)}`
      : curve === 'cubic'
      ? `f'(x) = ${formatPoly2(3 * a, 0, b)}`
      : `f'(x) = ${fmtNum(a * b)}·cos(${fmtNum(b)}x)`;

  return {
    x0,
    y0,
    slopeTangent: mT,
    slopeNormal,
    tangentEq,
    normalEq,
    signedIntegral: signedSum,
    totalArea: absSum,
    curveFormula,
    derivativeFormula,
  };
}

// ============================================================================
// PRESETS
// ============================================================================
export const LP_PRESETS: Array<{
  name: string;
  constraints: LPConstraint[];
  objP: number;
  objQ: number;
  objGoal: 'max' | 'min';
  viewCenter: Point2D;
  viewScale: number;
}> = [
  {
    name: 'Profit Max (Bounded)',
    constraints: [
      { id: 'c1', a: 1, b: 0, op: '>=', c: 0, enabled: true },
      { id: 'c2', a: 0, b: 1, op: '>=', c: 0, enabled: true },
      { id: 'c3', a: 1, b: 1, op: '<=', c: 8, enabled: true },
      { id: 'c4', a: 2, b: 1, op: '<=', c: 12, enabled: true },
    ],
    objP: 3,
    objQ: 2,
    objGoal: 'max',
    viewCenter: { x: 4.5, y: 4.5 },
    viewScale: 38,
  },
  {
    name: 'Cost Min (Diet)',
    constraints: [
      { id: 'c1', a: 1, b: 0, op: '>=', c: 0, enabled: true },
      { id: 'c2', a: 0, b: 1, op: '>=', c: 0, enabled: true },
      { id: 'c3', a: 1, b: 2, op: '>=', c: 6, enabled: true },
      { id: 'c4', a: 2, b: 1, op: '>=', c: 6, enabled: true },
      { id: 'c5', a: 1, b: 1, op: '<=', c: 9, enabled: true },
    ],
    objP: 4,
    objQ: 5,
    objGoal: 'min',
    viewCenter: { x: 4.5, y: 4.5 },
    viewScale: 38,
  },
  {
    name: 'Strict Boundary (<)',
    constraints: [
      { id: 'c1', a: 1, b: 0, op: '>=', c: 1, enabled: true },
      { id: 'c2', a: 0, b: 1, op: '>=', c: 1, enabled: true },
      { id: 'c3', a: 1, b: 1, op: '<', c: 7, enabled: true },
      { id: 'c4', a: 0, b: 1, op: '<=', c: 4, enabled: true },
    ],
    objP: 2,
    objQ: 3,
    objGoal: 'max',
    viewCenter: { x: 3.5, y: 3.5 },
    viewScale: 44,
  },
];

export const RATIONAL_PRESETS: Array<{
  name: string;
  p2: number;
  p1: number;
  p0: number;
  q2: number;
  q1: number;
  q0: number;
}> = [
  { name: '1 VA + 1 HA', p2: 0, p1: 2, p0: 1, q2: 0, q1: 1, q0: -2 },
  { name: '2 VAs + HA (y=0)', p2: 0, p1: 2, p0: 0, q2: 1, q1: 0, q0: -4 },
  { name: '2 VAs + HA (y=2)', p2: 2, p1: 0, p0: -2, q2: 1, q1: 0, q0: -4 },
  { name: 'Oblique (Slant) Asymptote', p2: 1, p1: 0, p0: 1, q2: 0, q1: 1, q0: -1 },
  { name: 'Hole + VA + HA', p2: 1, p1: 0, p0: -4, q2: 1, q1: -1, q0: -2 },
];

export const CUBIC_PRESETS = [
  { name: '3 Distinct Roots', a: 1, b: 0, c: -3, d: 0 },
  { name: 'S-Curve + Turning Pts', a: 0.5, b: -1.5, c: -2, d: 2 },
  { name: 'Double Root', a: 1, b: -3, c: 0, d: 4 },
  { name: 'Monotonic Inflection', a: 0.5, b: 0, c: 1, d: 0 },
];

// ============================================================================
// NEW MODE 12: POLAR GRAPHING (r = f(θ))
// ============================================================================
export function evalPolarR(
  kind: PolarCurveKind,
  trig: 'cos' | 'sin',
  a: number,
  b: number,
  n: number,
  thetaRad: number
): number | null {
  const fn = trig === 'cos' ? Math.cos : Math.sin;
  if (kind === 'rose') {
    return a * fn(n * thetaRad);
  }
  if (kind === 'limacon') {
    return a + b * fn(thetaRad);
  }
  if (kind === 'lemniscate') {
    const val = a * a * fn(2 * thetaRad);
    if (val < -1e-7) return null;
    return Math.sqrt(Math.max(0, val));
  }
  if (kind === 'spiral') {
    return a + b * thetaRad;
  }
  // Polar circle through pole: r = a cos(θ) or r = a sin(θ)
  return a * fn(thetaRad);
}

export function analyzePolar(
  kind: PolarCurveKind,
  trig: 'cos' | 'sin',
  a: number,
  b: number,
  n: number,
  probeThetaDeg: number
): PolarAnalysis {
  const safeN = Math.max(1, Math.round(Math.abs(n)));
  let equationText = '';
  let curveClass = '';
  let maxRadius = Math.abs(a);
  const symmetryText =
    kind === 'spiral'
      ? 'No axis symmetry (expanding spiral)'
      : trig === 'cos'
      ? 'Symmetric about Polar Axis (x-axis, θ = 0)'
      : 'Symmetric about Vertical Axis (y-axis, θ = π/2)';

  if (kind === 'rose') {
    equationText = `r = ${fmtNum(a)}·${trig}(${safeN === 1 ? '' : safeN}θ)`;
    const petals = safeN % 2 === 1 ? safeN : 2 * safeN;
    curveClass = `Rose Curve (${petals} petals, petal length |a| = ${fmtNum(Math.abs(a))})`;
    maxRadius = Math.abs(a);
  } else if (kind === 'limacon') {
    const sign = b >= 0 ? '+' : '−';
    equationText = `r = ${fmtNum(a)} ${sign} ${fmtNum(Math.abs(b))}·${trig}(θ)`;
    maxRadius = Math.abs(a) + Math.abs(b);
    const ratio = Math.abs(b) > EPS ? Math.abs(a) / Math.abs(b) : 99;
    if (Math.abs(ratio - 1) < 1e-3) {
      curveClass = 'Cardioid (Heart-shaped curve passing through pole)';
    } else if (ratio < 1) {
      curveClass = `Limaçon with Inner Loop (|a/b| = ${fmtNum(ratio)} < 1)`;
    } else if (ratio < 2) {
      curveClass = `Dimpled Limaçon (1 < |a/b| = ${fmtNum(ratio)} < 2)`;
    } else {
      curveClass = `Convex Limaçon (|a/b| = ${fmtNum(ratio)} ≥ 2)`;
    }
  } else if (kind === 'lemniscate') {
    equationText = `r² = ${fmtNum(a * a)}·${trig}(2θ)`;
    curveClass = `Lemniscate of Bernoulli (Figure-eight ∞, max r = ${fmtNum(Math.abs(a))})`;
    maxRadius = Math.abs(a);
  } else if (kind === 'spiral') {
    const sign = b >= 0 ? '+' : '−';
    equationText = `r = ${fmtNum(a)} ${sign} ${fmtNum(Math.abs(b))}θ`;
    curveClass = 'Archimedean Spiral (Constant spacing Δr = 2πb per turn)';
    maxRadius = Math.abs(a) + Math.abs(b) * 4 * Math.PI;
  } else {
    equationText = `r = ${fmtNum(a)}·${trig}(θ)`;
    curveClass =
      trig === 'cos'
        ? `Circle centered at (${fmtNum(a / 2)}, 0) with radius ${fmtNum(Math.abs(a) / 2)}`
        : `Circle centered at (0, ${fmtNum(a / 2)}) with radius ${fmtNum(Math.abs(a) / 2)}`;
    maxRadius = Math.abs(a);
  }

  const probeRad = (probeThetaDeg * Math.PI) / 180;
  const probeR = evalPolarR(kind, trig, a, b, safeN, probeRad);
  const probeX = probeR !== null ? probeR * Math.cos(probeRad) : null;
  const probeY = probeR !== null ? probeR * Math.sin(probeRad) : null;

  const sampleAngles = [
    { deg: 0, label: '0° (0)' },
    { deg: 30, label: '30° (π/6)' },
    { deg: 45, label: '45° (π/4)' },
    { deg: 60, label: '60° (π/3)' },
    { deg: 90, label: '90° (π/2)' },
    { deg: 120, label: '120° (2π/3)' },
    { deg: 180, label: '180° (π)' },
    { deg: 270, label: '270° (3π/2)' },
  ];

  const table = sampleAngles.map((ang) => {
    const rad = (ang.deg * Math.PI) / 180;
    const r = evalPolarR(kind, trig, a, b, safeN, rad);
    return {
      thetaDeg: ang.deg,
      thetaLabel: ang.label,
      r,
      x: r !== null ? r * Math.cos(rad) : null,
      y: r !== null ? r * Math.sin(rad) : null,
    };
  });

  return {
    kind,
    equationText,
    curveClass,
    symmetryText,
    maxRadius,
    domainText: kind === 'spiral' ? 'θ ∈ [0, 4π]' : 'θ ∈ [0, 2π] (0° to 360°)',
    probeThetaDeg,
    probeR,
    probeX,
    probeY,
    table,
  };
}

