import {
  type AngleUnit,
  type CalcCurveKind,
  type CalculusAnalysis,
  type ConicAnalysis,
  type ConicKind,
  type CubicAnalysis,
  EPS,
  evalCalcCurve,
  evalExp,
  evalLog,
  evalTrig,
  type ExpLogAnalysis,
  type ExpLogKind,
  fmtNum,
  formatPoly2,
  type ModulusAnalysis,
  type ModulusKind,
  type Point2D,
  type PolarAnalysis,
  type PolarCurveKind,
  evalPolarR,
  type SimPairKind,
  type SimultaneousAnalysis,
  type TrigAnalysis,
  type TrigFuncType,
} from './graphSketcherMath';

export interface CanvasDrawHelpers {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  viewCenter: Point2D;
  darkMode: boolean;
  toScreenX: (mx: number) => number;
  toScreenY: (my: number) => number;
  drawTag: (text: string, sx: number, sy: number, color: string, align?: CanvasTextAlign) => void;
  drawPointDot: (
    mx: number,
    my: number,
    fillHex: string,
    label?: string,
    offsetX?: number,
    offsetY?: number,
    hollow?: boolean
  ) => void;
}

function strokeContinuousCurve(
  h: CanvasDrawHelpers,
  fn: (x: number) => number,
  color: string,
  lineWidth = 2.9,
  dashed = false,
  samples = 460
) {
  const { ctx, H, xMin, xMax, yMin, yMax, viewCenter, toScreenX, toScreenY } = h;
  const yClip = (yMax - yMin) * 3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([7, 5]);
  ctx.beginPath();
  let penDown = false;
  let prevY = 0;

  for (let i = 0; i <= samples; i++) {
    const mx = xMin + ((xMax - xMin) * i) / samples;
    const my = fn(mx);
    if (!Number.isFinite(my) || Math.abs(my - viewCenter.y) > yClip) {
      penDown = false;
      continue;
    }
    if (penDown && Math.abs(my - prevY) > (yMax - yMin) * 1.3) {
      penDown = false;
    }
    const sx = toScreenX(mx);
    const sy = toScreenY(my);
    if (!penDown || sy < -H * 2 || sy > H * 3) {
      if (sy >= -H * 2 && sy <= H * 3) {
        ctx.moveTo(sx, sy);
        penDown = true;
      } else {
        penDown = false;
      }
    } else {
      ctx.lineTo(sx, sy);
    }
    prevY = my;
  }
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// 5. CUBIC & POLYNOMIAL RENDERER
// ============================================================================
export function drawCubicMode(
  h: CanvasDrawHelpers,
  a: number,
  b: number,
  c: number,
  d: number,
  info: CubicAnalysis,
  showTableDots: boolean
) {
  strokeContinuousCurve(h, (x) => a * x * x * x + b * x * x + c * x + d, '#8b5cf6', 3, false, 480);

  if (showTableDots) {
    info.table.forEach((pt) => h.drawPointDot(pt.x, pt.y, '#a78bfa'));
  }

  // y-intercept
  h.drawPointDot(0, info.yIntercept, '#38bdf8', `(0, ${fmtNum(info.yIntercept)})`, 9, -11);

  // Real roots
  info.roots.forEach((r, idx) => {
    h.drawPointDot(r, 0, '#10b981', `r${idx + 1} = ${fmtNum(r)}`, 7, 15);
  });

  // Inflection point
  if (info.inflection) {
    h.drawPointDot(
      info.inflection.x,
      info.inflection.y,
      '#f59e0b',
      `Inflection (${fmtNum(info.inflection.x)}, ${fmtNum(info.inflection.y)})`,
      10,
      14
    );
  }

  // Turning points (Local Max / Min)
  info.turningPoints.forEach((tp) => {
    const isMax = tp.kind === 'Local Max';
    h.drawPointDot(
      tp.x,
      tp.y,
      '#f43f5e',
      `${isMax ? 'Max' : 'Min'} (${fmtNum(tp.x)}, ${fmtNum(tp.y)})`,
      10,
      isMax ? -14 : 15
    );
  });
}

// ============================================================================
// 6. TRIGONOMETRIC RENDERER (sin, cos, tan with dashed asymptotes)
// ============================================================================
export function drawTrigMode(
  h: CanvasDrawHelpers,
  func: TrigFuncType,
  a: number,
  b: number,
  c: number,
  d: number,
  unit: AngleUnit,
  info: TrigAnalysis,
  showTableDots: boolean
) {
  const { ctx, W, H, xMin, xMax, toScreenX, toScreenY, drawTag, darkMode } = h;

  // Midline y = d
  if (Math.abs(d) > EPS) {
    const sy = toScreenY(d);
    if (sy >= 0 && sy <= H) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = darkMode ? 'rgba(56,189,248,0.5)' : 'rgba(2,132,199,0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
      ctx.stroke();
      ctx.restore();
      drawTag(`Midline y = ${fmtNum(d)}`, W - 12, sy - 11, '#0284c7', 'right');
    }
  }

  // Vertical Asymptotes for tan(x)
  const asymptotes: number[] = [];
  if (func === 'tan' && info.asymptoteStep !== null && info.firstAsymptoteOffset !== null) {
    const step = info.asymptoteStep;
    const kStart = Math.floor((xMin - info.firstAsymptoteOffset) / step) - 1;
    const kEnd = Math.ceil((xMax - info.firstAsymptoteOffset) / step) + 1;
    for (let k = kStart; k <= kEnd; k++) {
      const va = info.firstAsymptoteOffset + k * step;
      if (va >= xMin - step * 0.1 && va <= xMax + step * 0.1) {
        asymptotes.push(va);
        const sx = toScreenX(va);
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, H);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // Curve (branch-safe for tan!)
  if (func === 'tan' && asymptotes.length > 0) {
    const breaks = [xMin, ...asymptotes.filter((v) => v > xMin && v < xMax), xMax];
    ctx.save();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2.8;
    const yClip = (h.yMax - h.yMin) * 2.5;
    for (let seg = 0; seg < breaks.length - 1; seg++) {
      const margin = (breaks[seg + 1] - breaks[seg]) * 0.006;
      const l = breaks[seg] + (seg > 0 ? margin : 0);
      const r = breaks[seg + 1] - (seg < breaks.length - 2 ? margin : 0);
      if (r <= l) continue;
      const steps = 110;
      ctx.beginPath();
      let down = false;
      for (let i = 0; i <= steps; i++) {
        const mx = l + ((r - l) * i) / steps;
        const my = evalTrig(func, a, b, c, d, mx, unit);
        if (!Number.isFinite(my) || Math.abs(my - h.viewCenter.y) > yClip) {
          down = false;
          continue;
        }
        const sx = toScreenX(mx);
        const sy = toScreenY(my);
        if (!down) {
          ctx.moveTo(sx, sy);
          down = true;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  } else {
    strokeContinuousCurve(
      h,
      (x) => evalTrig(func, a, b, c, d, x, unit),
      func === 'sin' ? '#0ea5e9' : '#f59e0b',
      3,
      false,
      540
    );
  }

  // Key angle dots
  if (showTableDots) {
    info.table.forEach((pt) => {
      if (pt.y !== null) {
        h.drawPointDot(pt.x, pt.y, '#10b981');
      }
    });
  }
}

// ============================================================================
// 7. EXPONENTIAL & LOGARITHMIC RENDERER
// ============================================================================
export function drawExpLogMode(
  h: CanvasDrawHelpers,
  kind: ExpLogKind,
  a: number,
  base: number,
  shiftH: number,
  shiftK: number,
  info: ExpLogAnalysis
) {
  const { ctx, W, H, xMin, xMax, toScreenX, toScreenY, drawTag, darkMode } = h;
  const safeBase = Math.max(0.05, base);

  if (kind === 'exp') {
    // Horizontal asymptote y = k
    const sy = toScreenY(shiftK);
    if (sy >= -10 && sy <= H + 10) {
      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
      ctx.stroke();
      ctx.restore();
      drawTag(`HA: y = ${fmtNum(shiftK)}`, W - 12, sy - 11, '#f43f5e', 'right');
    }

    strokeContinuousCurve(h, (x) => evalExp(a, safeBase, shiftH, shiftK, x), '#0ea5e9', 3);

    if (info.yIntercept !== null && Number.isFinite(info.yIntercept)) {
      h.drawPointDot(0, info.yIntercept, '#f59e0b', `(0, ${fmtNum(info.yIntercept)})`, 9, -11);
    }
    if (info.xIntercept !== null && Number.isFinite(info.xIntercept)) {
      h.drawPointDot(info.xIntercept, 0, '#10b981', `(${fmtNum(info.xIntercept)}, 0)`, 8, 15);
    }
    return;
  }

  if (kind === 'log') {
    // Vertical asymptote x = h
    const sx = toScreenX(shiftH);
    if (sx >= -10 && sx <= W + 10) {
      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H);
      ctx.stroke();
      ctx.restore();
      drawTag(`VA: x = ${fmtNum(shiftH)}`, sx + 8, 28, '#f43f5e');
    }

    // Domain x > h
    strokeContinuousCurve(
      h,
      (x) => (x > shiftH + 1e-4 ? evalLog(a, safeBase, shiftH, shiftK, x) : NaN),
      '#10b981',
      3,
      false,
      560
    );

    if (info.xIntercept !== null && Number.isFinite(info.xIntercept)) {
      h.drawPointDot(info.xIntercept, 0, '#f59e0b', `(${fmtNum(info.xIntercept)}, 0)`, 8, 15);
    }
    if (info.yIntercept !== null && Number.isFinite(info.yIntercept)) {
      h.drawPointDot(0, info.yIntercept, '#38bdf8', `(0, ${fmtNum(info.yIntercept)})`, 9, -11);
    }
    return;
  }

  // Inverse Reflection Pair: y = b^x, y = log_b(x), and mirror line y = x
  ctx.save();
  ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.6)' : 'rgba(71,85,105,0.55)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(toScreenX(xMin - 2), toScreenY(xMin - 2));
  ctx.lineTo(toScreenX(xMax + 2), toScreenY(xMax + 2));
  ctx.stroke();
  ctx.restore();
  const mirrorX = Math.min(xMax - 1.5, h.yMax - 1.5);
  drawTag('y = x (Mirror)', toScreenX(mirrorX) - 6, toScreenY(mirrorX) - 14, darkMode ? '#cbd5e1' : '#475569', 'right');

  strokeContinuousCurve(h, (x) => Math.pow(safeBase, x), '#0ea5e9', 2.9);
  strokeContinuousCurve(h, (x) => (x > 1e-4 ? Math.log(x) / Math.log(safeBase) : NaN), '#10b981', 2.9, false, 560);

  // Highlight mirrored pair points (0, 1) <-> (1, 0) and (1, b) <-> (b, 1)
  h.drawPointDot(0, 1, '#0ea5e9', '(0, 1)', -8, -12);
  h.drawPointDot(1, 0, '#10b981', '(1, 0)', 8, 15);
  h.drawPointDot(1, safeBase, '#0ea5e9', `(1, ${fmtNum(safeBase)})`, -12, -12);
  h.drawPointDot(safeBase, 1, '#10b981', `(${fmtNum(safeBase)}, 1)`, 8, 14);
}

// ============================================================================
// 8. CIRCLE & CONIC SECTIONS RENDERER
// ============================================================================
export function drawConicsMode(
  h: CanvasDrawHelpers,
  kind: ConicKind,
  ch: number,
  ck: number,
  a: number,
  b: number,
  hyperbolaAxis: 'horizontal' | 'vertical',
  showCircleTangent: boolean,
  info: ConicAnalysis
) {
  const { ctx, xMin, xMax, yMin, yMax, toScreenX, toScreenY, drawTag, darkMode } = h;
  const safeA = Math.max(0.5, Math.abs(a));
  const safeB = Math.max(0.5, Math.abs(b));

  if (kind === 'circle') {
    const rx = Math.abs(toScreenX(ch + safeA) - toScreenX(ch));
    const ry = Math.abs(toScreenY(ck + safeA) - toScreenY(ck));
    ctx.save();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(toScreenX(ch), toScreenY(ck), rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (showCircleTangent && info.tangentPoint && info.tangentNormalDir) {
      const tp = info.tangentPoint;
      const { x: nx, y: ny } = info.tangentNormalDir;
      // Radius segment from Center to Tangent Point
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(toScreenX(ch), toScreenY(ck));
      ctx.lineTo(toScreenX(tp.x), toScreenY(tp.y));
      ctx.stroke();
      ctx.restore();

      // Tangent Line perpendicular to radius: direction (-ny, nx)
      const len = Math.hypot(nx, ny) || 1;
      const ux = -ny / len;
      const uy = nx / len;
      const span = Math.max(xMax - xMin, yMax - yMin) * 1.5;
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(toScreenX(tp.x - ux * span), toScreenY(tp.y - uy * span));
      ctx.lineTo(toScreenX(tp.x + ux * span), toScreenY(tp.y + uy * span));
      ctx.stroke();
      ctx.restore();

      h.drawPointDot(tp.x, tp.y, '#10b981', `T(${fmtNum(tp.x)}, ${fmtNum(tp.y)})`, 10, -12);
    }

    h.drawPointDot(ch, ck, '#f43f5e', `Center (${fmtNum(ch)}, ${fmtNum(ck)})`, 10, 14);
    return;
  }

  if (kind === 'ellipse') {
    const rx = Math.abs(toScreenX(ch + safeA) - toScreenX(ch));
    const ry = Math.abs(toScreenY(ck + safeB) - toScreenY(ck));
    ctx.save();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(toScreenX(ch), toScreenY(ck), rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Axes inside ellipse
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.4)' : 'rgba(71,85,105,0.35)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(toScreenX(ch - safeA), toScreenY(ck));
    ctx.lineTo(toScreenX(ch + safeA), toScreenY(ck));
    ctx.moveTo(toScreenX(ch), toScreenY(ck - safeB));
    ctx.lineTo(toScreenX(ch), toScreenY(ck + safeB));
    ctx.stroke();
    ctx.restore();

    h.drawPointDot(ch, ck, '#94a3b8', `C(${fmtNum(ch)}, ${fmtNum(ck)})`, 8, -11);
    info.vertices.forEach((v, i) => h.drawPointDot(v.x, v.y, '#0ea5e9', `V${i + 1}`, 8, -10));
    info.foci.forEach((f, i) => h.drawPointDot(f.x, f.y, '#f43f5e', `F${i + 1}`, 8, 14));
    return;
  }

  // Hyperbola: draw dashed asymptotes + reference box + two smooth branches
  info.asymptotes.forEach((as, idx) => {
    ctx.save();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin - 2), toScreenY(as.m * (xMin - 2) + as.b));
    ctx.lineTo(toScreenX(xMax + 2), toScreenY(as.m * (xMax + 2) + as.b));
    ctx.stroke();
    ctx.restore();
    if (idx === 0) {
      const lx = ch + safeA * 1.8;
      const ly = as.m * lx + as.b;
      if (lx > xMin && lx < xMax && ly > yMin && ly < yMax) {
        drawTag(`Asymptote`, toScreenX(lx) + 6, toScreenY(ly) - 10, '#f43f5e');
      }
    }
  });

  // Subtle central rectangle
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.3)' : 'rgba(100,116,139,0.3)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(
    toScreenX(ch - safeA),
    toScreenY(ck + safeB),
    toScreenX(ch + safeA) - toScreenX(ch - safeA),
    toScreenY(ck - safeB) - toScreenY(ck + safeB)
  );
  ctx.restore();

  // Parametric hyperbola branches (t in [-3.2, 3.2])
  const drawBranch = (sign: 1 | -1) => {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const t = -3.2 + (6.4 * i) / steps;
      const mx = hyperbolaAxis === 'horizontal' ? ch + sign * safeA * Math.cosh(t) : ch + safeA * Math.sinh(t);
      const my = hyperbolaAxis === 'horizontal' ? ck + safeB * Math.sinh(t) : ck + sign * safeB * Math.cosh(t);
      if (mx < xMin - 20 || mx > xMax + 20 || my < yMin - 20 || my > yMax + 20) {
        started = false;
        continue;
      }
      const sx = toScreenX(mx);
      const sy = toScreenY(my);
      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();
    ctx.restore();
  };
  drawBranch(1);
  drawBranch(-1);

  h.drawPointDot(ch, ck, '#94a3b8', `C(${fmtNum(ch)}, ${fmtNum(ck)})`, 8, -11);
  info.vertices.forEach((v, i) => h.drawPointDot(v.x, v.y, '#0ea5e9', `V${i + 1}`, 8, -11));
  info.foci.forEach((f, i) => h.drawPointDot(f.x, f.y, '#10b981', `F${i + 1}`, 8, 14));
}

// ============================================================================
// 9. MODULUS & PIECEWISE / STEP RENDERER
// ============================================================================
export function drawModulusMode(
  h: CanvasDrawHelpers,
  kind: ModulusKind,
  a: number,
  shiftH: number,
  shiftK: number,
  stepFreq: number,
  pwSplit: number,
  pwLeftM: number,
  pwLeftC: number,
  pwRightM: number,
  pwRightC: number,
  info: ModulusAnalysis
) {
  const { ctx, H, xMin, xMax, toScreenX, toScreenY, drawTag, darkMode } = h;

  if (kind === 'abs') {
    // Axis of symmetry x = h
    const sx = toScreenX(shiftH);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = darkMode ? 'rgba(56,189,248,0.5)' : 'rgba(2,132,199,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, H);
    ctx.stroke();
    ctx.restore();

    // Two exact rays meeting sharply at vertex (h, k)
    ctx.save();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin - 2), toScreenY(a * Math.abs(xMin - 2 - shiftH) + shiftK));
    ctx.lineTo(toScreenX(shiftH), toScreenY(shiftK));
    ctx.lineTo(toScreenX(xMax + 2), toScreenY(a * Math.abs(xMax + 2 - shiftH) + shiftK));
    ctx.stroke();
    ctx.restore();

    h.drawPointDot(shiftH, shiftK, '#f43f5e', `Vertex (${fmtNum(shiftH)}, ${fmtNum(shiftK)})`, 10, a >= 0 ? 15 : -14);
    info.xIntercepts.forEach((r) => h.drawPointDot(r, 0, '#10b981', `(${fmtNum(r)}, 0)`, 7, 15));
    if (info.yIntercept !== null) {
      h.drawPointDot(0, info.yIntercept, '#f59e0b', `(0, ${fmtNum(info.yIntercept)})`, 9, -11);
    }
    return;
  }

  if (kind === 'floor') {
    const b = Math.max(0.25, Math.abs(stepFreq));
    const stepW = 1 / b;
    const nStart = Math.floor(b * xMin) - 1;
    const nEnd = Math.ceil(b * xMax) + 1;

    ctx.save();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    for (let n = nStart; n <= nEnd; n++) {
      const xl = n * stepW;
      const xr = (n + 1) * stepW;
      const y = a * n + shiftK;
      ctx.beginPath();
      ctx.moveTo(toScreenX(xl), toScreenY(y));
      ctx.lineTo(toScreenX(xr), toScreenY(y));
      ctx.stroke();
    }
    ctx.restore();

    // Closed left dot ● and open right dot ○ on each visible step
    for (let n = nStart; n <= nEnd; n++) {
      const xl = n * stepW;
      const xr = (n + 1) * stepW;
      const y = a * n + shiftK;
      h.drawPointDot(xl, y, '#0ea5e9', undefined, 0, 0, false);
      h.drawPointDot(xr, y, '#0ea5e9', undefined, 0, 0, true);
    }
    return;
  }

  // Piecewise 2-branch function split at x = pwSplit
  const splitSx = toScreenX(pwSplit);
  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.45)' : 'rgba(71,85,105,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(splitSx, 0);
  ctx.lineTo(splitSx, H);
  ctx.stroke();
  ctx.restore();
  drawTag(`Split x = ${fmtNum(pwSplit)}`, splitSx + 7, 28, darkMode ? '#cbd5e1' : '#475569');

  // Left branch: x < pwSplit
  const leftEndY = pwLeftM * pwSplit + pwLeftC;
  ctx.save();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(toScreenX(xMin - 2), toScreenY(pwLeftM * (xMin - 2) + pwLeftC));
  ctx.lineTo(toScreenX(pwSplit), toScreenY(leftEndY));
  ctx.stroke();
  ctx.restore();

  // Right branch: x >= pwSplit
  const rightStartY = pwRightM * pwSplit + pwRightC;
  ctx.save();
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(toScreenX(pwSplit), toScreenY(rightStartY));
  ctx.lineTo(toScreenX(xMax + 2), toScreenY(pwRightM * (xMax + 2) + pwRightC));
  ctx.stroke();
  ctx.restore();

  // Open circle on left limit, filled circle on right (x >= split)
  if (Math.abs(leftEndY - rightStartY) > 1e-4) {
    h.drawPointDot(pwSplit, leftEndY, '#f59e0b', `○ (${fmtNum(pwSplit)}, ${fmtNum(leftEndY)})`, -95, -10, true);
    h.drawPointDot(pwSplit, rightStartY, '#0ea5e9', `● (${fmtNum(pwSplit)}, ${fmtNum(rightStartY)})`, 10, -10, false);
  } else {
    h.drawPointDot(pwSplit, rightStartY, '#10b981', `Continuous (${fmtNum(pwSplit)}, ${fmtNum(rightStartY)})`, 10, -12, false);
  }
}

// ============================================================================
// 10. SIMULTANEOUS EQUATIONS / INTERSECTIONS RENDERER
// ============================================================================
export function drawSimultaneousMode(
  h: CanvasDrawHelpers,
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
  q2c: number,
  info: SimultaneousAnalysis
) {
  const { ctx, xMin, xMax, toScreenX, toScreenY } = h;

  if (kind === 'line_quad') {
    strokeContinuousCurve(h, (x) => qa * x * x + qb * x + qc, '#f59e0b', 3);
    ctx.save();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin - 2), toScreenY(lm * (xMin - 2) + ld));
    ctx.lineTo(toScreenX(xMax + 2), toScreenY(lm * (xMax + 2) + ld));
    ctx.stroke();
    ctx.restore();
  } else if (kind === 'line_circle') {
    const r = Math.max(0.5, Math.abs(cr));
    const rx = Math.abs(toScreenX(ch + r) - toScreenX(ch));
    const ry = Math.abs(toScreenY(ck + r) - toScreenY(ck));
    ctx.save();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(toScreenX(ch), toScreenY(ck), rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin - 2), toScreenY(lm * (xMin - 2) + ld));
    ctx.lineTo(toScreenX(xMax + 2), toScreenY(lm * (xMax + 2) + ld));
    ctx.stroke();
    ctx.restore();

    h.drawPointDot(ch, ck, '#94a3b8');
  } else {
    strokeContinuousCurve(h, (x) => qa * x * x + qb * x + qc, '#f59e0b', 3);
    strokeContinuousCurve(h, (x) => q2a * x * x + q2b * x + q2c, '#0ea5e9', 3);
  }

  // Exact intersection dots
  info.intersections.forEach((pt, idx) => {
    h.drawPointDot(
      pt.x,
      pt.y,
      '#10b981',
      `P${idx + 1}(${fmtNum(pt.x)}, ${fmtNum(pt.y)})`,
      10,
      idx === 0 ? -13 : 15
    );
  });
}

// ============================================================================
// 11. CALCULUS: TANGENT, NORMAL & DEFINITE INTEGRAL RENDERER
// ============================================================================
export function drawCalculusMode(
  h: CanvasDrawHelpers,
  curve: CalcCurveKind,
  a: number,
  b: number,
  c: number,
  intA: number,
  intB: number,
  showTangent: boolean,
  showNormal: boolean,
  showIntegral: boolean,
  info: CalculusAnalysis
) {
  const { ctx, xMin, xMax, yMin, yMax, toScreenX, toScreenY, drawTag, darkMode } = h;

  // 1. Definite Integral Shaded Area (Emerald above x-axis, Rose below x-axis)
  if (showIntegral && Math.abs(intB - intA) > 1e-4) {
    const lo = Math.min(intA, intB);
    const hi = Math.max(intA, intB);
    const steps = 180;
    const dx = (hi - lo) / steps;
    const zeroSy = toScreenY(0);

    for (let i = 0; i < steps; i++) {
      const x1 = lo + i * dx;
      const x2 = x1 + dx;
      const y1 = evalCalcCurve(curve, a, b, c, x1);
      const y2 = evalCalcCurve(curve, a, b, c, x2);
      const midY = (y1 + y2) * 0.5;
      ctx.save();
      ctx.fillStyle =
        midY >= 0
          ? darkMode
            ? 'rgba(16, 185, 129, 0.28)'
            : 'rgba(16, 185, 129, 0.22)'
          : darkMode
          ? 'rgba(244, 63, 94, 0.28)'
          : 'rgba(244, 63, 94, 0.22)';
      ctx.beginPath();
      ctx.moveTo(toScreenX(x1), zeroSy);
      ctx.lineTo(toScreenX(x1), toScreenY(y1));
      ctx.lineTo(toScreenX(x2), toScreenY(y2));
      ctx.lineTo(toScreenX(x2), zeroSy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Vertical boundary lines at x = a and x = b
    [lo, hi].forEach((bx, i) => {
      const sx = toScreenX(bx);
      const by = evalCalcCurve(curve, a, b, c, bx);
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, zeroSy);
      ctx.lineTo(sx, toScreenY(by));
      ctx.stroke();
      ctx.restore();
      drawTag(`${i === 0 ? 'a' : 'b'}=${fmtNum(bx)}`, sx, zeroSy + 14, '#10b981', 'center');
    });
  }

  // 2. Main Function Curve f(x)
  strokeContinuousCurve(h, (x) => evalCalcCurve(curve, a, b, c, x), '#0ea5e9', 3.1, false, 480);

  // 3. Tangent Line at x0
  if (showTangent) {
    const mT = info.slopeTangent;
    const cT = info.y0 - mT * info.x0;
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin - 2), toScreenY(mT * (xMin - 2) + cT));
    ctx.lineTo(toScreenX(xMax + 2), toScreenY(mT * (xMax + 2) + cT));
    ctx.stroke();
    ctx.restore();
    const tagX = info.x0 + 1.4;
    const tagY = mT * tagX + cT;
    if (tagX > xMin && tagX < xMax && tagY > yMin && tagY < yMax) {
      drawTag(`Tangent (m=${fmtNum(mT)})`, toScreenX(tagX), toScreenY(tagY) - 12, '#d97706');
    }
  }

  // 4. Normal Line at x0
  if (showNormal) {
    ctx.save();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    if (info.slopeNormal === null) {
      const sx = toScreenX(info.x0);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h.H);
    } else {
      const mN = info.slopeNormal;
      const cN = info.y0 - mN * info.x0;
      ctx.moveTo(toScreenX(xMin - 2), toScreenY(mN * (xMin - 2) + cN));
      ctx.lineTo(toScreenX(xMax + 2), toScreenY(mN * (xMax + 2) + cN));
    }
    ctx.stroke();
    ctx.restore();
  }

  // 5. Point of Tangency P(x0, f(x0))
  h.drawPointDot(
    info.x0,
    info.y0,
    '#f43f5e',
    `P(${fmtNum(info.x0)}, ${fmtNum(info.y0)})`,
    10,
    -13
  );
}

// ============================================================================
// 12. POLAR GRAPHING RENDERER (r = f(θ) with Polar Radial Grid Overlay)
// ============================================================================
export function drawPolarMode(
  h: CanvasDrawHelpers,
  kind: PolarCurveKind,
  trig: 'cos' | 'sin',
  a: number,
  b: number,
  n: number,
  showPolarGrid: boolean,
  showProbeRay: boolean,
  info: PolarAnalysis
) {
  const { ctx, W, H, xMin, xMax, yMin, yMax, toScreenX, toScreenY, drawTag, darkMode } = h;
  const poleX = toScreenX(0);
  const poleY = toScreenY(0);
  const pxPerUnit = Math.abs(toScreenX(1) - toScreenX(0));
  const maxRView = Math.max(Math.abs(xMin), Math.abs(xMax), Math.abs(yMin), Math.abs(yMax)) * 1.4;

  // 1. Optional Polar Radial Grid Overlay (concentric circles + 30° angle spokes)
  if (showPolarGrid) {
    const rStep = maxRView > 16 ? 2 : 1;
    ctx.save();
    ctx.strokeStyle = darkMode ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.16)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let r = rStep; r <= maxRView; r += rStep) {
      const radiusPx = r * pxPerUnit;
      ctx.beginPath();
      ctx.arc(poleX, poleY, radiusPx, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial angle rays every 30°
    const rayAngles = [30, 60, 120, 150, 210, 240, 300, 330];
    const rayLenPx = Math.hypot(W, H);
    ctx.strokeStyle = darkMode ? 'rgba(56, 189, 248, 0.13)' : 'rgba(2, 132, 199, 0.13)';
    for (const deg of rayAngles) {
      const rad = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(poleX, poleY);
      ctx.lineTo(poleX + Math.cos(rad) * rayLenPx, poleY - Math.sin(rad) * rayLenPx);
      ctx.stroke();

      // Label angle ray at a clean visible radius
      const labelR = Math.min(maxRView * 0.48, 4.2);
      const lx = toScreenX(labelR * Math.cos(rad));
      const ly = toScreenY(labelR * Math.sin(rad));
      if (lx > 24 && lx < W - 24 && ly > 20 && ly < H - 20) {
        drawTag(`${deg}°`, lx, ly, darkMode ? 'rgba(125,211,252,0.75)' : 'rgba(3,105,161,0.75)', 'center');
      }
    }
    ctx.restore();
  }

  // 2. Plot Polar Curve r = f(θ)
  const safeN = Math.max(1, Math.round(Math.abs(n)));
  const maxTheta = kind === 'spiral' ? 4 * Math.PI : 2 * Math.PI;
  const steps = kind === 'spiral' ? 960 : 720;

  const strokePolarBranch = (sign: 1 | -1, color: string) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    let penDown = false;
    for (let i = 0; i <= steps; i++) {
      const theta = (maxTheta * i) / steps;
      const rVal = evalPolarR(kind, trig, a, b, safeN, theta);
      if (rVal === null || !Number.isFinite(rVal)) {
        penDown = false;
        continue;
      }
      const rSigned = sign * rVal;
      const mx = rSigned * Math.cos(theta);
      const my = rSigned * Math.sin(theta);
      const sx = toScreenX(mx);
      const sy = toScreenY(my);
      if (sx < -W || sx > W * 2 || sy < -H || sy > H * 2) {
        penDown = false;
        continue;
      }
      if (!penDown) {
        ctx.moveTo(sx, sy);
        penDown = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  strokePolarBranch(1, '#0ea5e9');
  if (kind === 'lemniscate') {
    // Also plot the negative root branch -sqrt(a^2 trig(2θ))
    strokePolarBranch(-1, '#0ea5e9');
  }

  // Pole (origin) marker
  h.drawPointDot(0, 0, '#f59e0b', 'Pole (0, 0)', 9, 14);

  // 3. Interactive Polar Ray Vector from Pole to (r(θ), θ)
  if (showProbeRay && info.probeR !== null && info.probeX !== null && info.probeY !== null) {
    const px = toScreenX(info.probeX);
    const py = toScreenY(info.probeY);

    ctx.save();
    ctx.strokeStyle = info.probeR >= 0 ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 2.4;
    if (info.probeR < 0) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(poleX, poleY);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();

    h.drawPointDot(
      info.probeX,
      info.probeY,
      info.probeR >= 0 ? '#10b981' : '#f43f5e',
      `P(r=${fmtNum(info.probeR)}, θ=${fmtNum(info.probeThetaDeg)}°)`,
      10,
      -13
    );
  }
}

// ============================================================================
// 13. CUSTOM WRITTEN FORMULA RENDERER (y = f(x) or r = f(θ))
// ============================================================================
export function drawCustomFormulaMode(
  h: CanvasDrawHelpers,
  fn1: ((v: number) => number) | null,
  isPolar1: boolean,
  fn2: ((v: number) => number) | null,
  isPolar2: boolean,
  roots: number[],
  yIntercept: number | null,
  table: Array<{ x: number; y: number }>,
  showTableDots: boolean
) {
  const { ctx, W, H, xMin, xMax, yMin, yMax, toScreenX, toScreenY, drawTag, darkMode } = h;

  const drawPolarCustom = (fn: (theta: number) => number, color: string) => {
    const poleX = toScreenX(0);
    const poleY = toScreenY(0);
    const pxPerUnit = Math.abs(toScreenX(1) - toScreenX(0));
    const maxRView = Math.max(Math.abs(xMin), Math.abs(xMax), Math.abs(yMin), Math.abs(yMax)) * 1.4;
    const rStep = maxRView > 16 ? 2 : 1;

    ctx.save();
    ctx.strokeStyle = darkMode ? 'rgba(56, 189, 248, 0.14)' : 'rgba(2, 132, 199, 0.14)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let r = rStep; r <= maxRView; r += rStep) {
      ctx.beginPath();
      ctx.arc(poleX, poleY, r * pxPerUnit, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    const maxTheta = 2 * Math.PI;
    const steps = 720;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    let penDown = false;
    for (let i = 0; i <= steps; i++) {
      const theta = (maxTheta * i) / steps;
      const rVal = fn(theta);
      if (!Number.isFinite(rVal)) {
        penDown = false;
        continue;
      }
      const mx = rVal * Math.cos(theta);
      const my = rVal * Math.sin(theta);
      const sx = toScreenX(mx);
      const sy = toScreenY(my);
      if (sx < -W || sx > W * 2 || sy < -H || sy > H * 2) {
        penDown = false;
        continue;
      }
      if (!penDown) {
        ctx.moveTo(sx, sy);
        penDown = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();
    ctx.restore();
    h.drawPointDot(0, 0, '#f59e0b', 'Pole (0, 0)', 9, 14);
  };

  if (fn1) {
    if (isPolar1) {
      drawPolarCustom(fn1, '#0ea5e9');
    } else {
      strokeContinuousCurve(h, fn1, '#0ea5e9', 3.1, false, 640);
      if (showTableDots) {
        table.forEach((pt) => {
          if (Number.isFinite(pt.y)) {
            h.drawPointDot(pt.x, pt.y, '#38bdf8');
          }
        });
      }
      if (yIntercept !== null && Number.isFinite(yIntercept)) {
        h.drawPointDot(0, yIntercept, '#f59e0b', `(0, ${fmtNum(yIntercept)})`, 9, -11);
      }
      roots.forEach((r, idx) => {
        h.drawPointDot(r, 0, '#10b981', `x${idx + 1} = ${fmtNum(r)}`, 7, 15);
      });
    }
  }

  if (fn2) {
    if (isPolar2) {
      drawPolarCustom(fn2, '#ec4899');
    } else {
      strokeContinuousCurve(h, fn2, '#ec4899', 2.6, true, 540);
      const midX = viewCenterLabelX(xMin, xMax);
      const midY = fn2(midX);
      if (Number.isFinite(midY) && midY > yMin + 0.5 && midY < yMax - 0.5) {
        drawTag('g(x)', toScreenX(midX) + 8, toScreenY(midY) - 12, '#ec4899');
      }
    }
  }
}

function viewCenterLabelX(xMin: number, xMax: number): number {
  return xMin + (xMax - xMin) * 0.68;
}

export function getModeEquationTitle(params: {
  mode: string;
  linM: number;
  linC: number;
  quadA: number;
  quadB: number;
  quadC: number;
  ratP2: number;
  ratP1: number;
  ratP0: number;
  ratQ2: number;
  ratQ1: number;
  ratQ0: number;
  cubA: number;
  cubB: number;
  cubC: number;
  cubD: number;
  trigFunc: TrigFuncType;
  trigA: number;
  trigB: number;
  trigC: number;
  trigD: number;
  trigUnit: AngleUnit;
  expKind: ExpLogKind;
  expA: number;
  expBase: number;
  expH: number;
  expK: number;
  conicEq: string;
  modKind: ModulusKind;
  modA: number;
  modH: number;
  modK: number;
  stepFreq: number;
  pwSplit: number;
  simKind: SimPairKind;
  calcFormula: string;
  polarEq?: string;
  customFormulaText?: string;
}): string {
  switch (params.mode) {
    case 'custom':
      return params.customFormulaText ? params.customFormulaText : 'y = f(x)';
    case 'linear':
      return `y = ${formatPoly2(0, params.linM, params.linC)}`;
    case 'quadratic':
      return `y = ${formatPoly2(params.quadA, params.quadB, params.quadC)}`;
    case 'lp':
      return 'Linear Programming — Unwanted Regions Shaded';
    case 'rational':
      return `f(x) = (${formatPoly2(params.ratP2, params.ratP1, params.ratP0)}) / (${formatPoly2(params.ratQ2, params.ratQ1, params.ratQ0)})`;
    case 'cubic': {
      const parts: string[] = [];
      const add = (val: number, sym: string) => {
        if (Math.abs(val) <= EPS) return;
        const av = Math.abs(val);
        const body = sym && Math.abs(av - 1) < EPS ? sym : `${fmtNum(av)}${sym}`;
        parts.push(parts.length === 0 ? (val < 0 ? `−${body}` : body) : val < 0 ? ` − ${body}` : ` + ${body}`);
      };
      add(params.cubA, 'x³');
      add(params.cubB, 'x²');
      add(params.cubC, 'x');
      if (Math.abs(params.cubD) > EPS || parts.length === 0) {
        parts.push(
          parts.length === 0
            ? `${fmtNum(params.cubD)}`
            : params.cubD < 0
            ? ` − ${fmtNum(Math.abs(params.cubD))}`
            : ` + ${fmtNum(params.cubD)}`
        );
      }
      return `y = ${parts.join('')}`;
    }
    case 'trig': {
      const inner = `${Math.abs(params.trigB - 1) < EPS ? '' : fmtNum(params.trigB)}x${
        Math.abs(params.trigC) > EPS
          ? params.trigC > 0
            ? ` + ${fmtNum(params.trigC)}${params.trigUnit === 'deg' ? '°' : ''}`
            : ` − ${fmtNum(Math.abs(params.trigC))}${params.trigUnit === 'deg' ? '°' : ''}`
          : ''
      }`;
      const lead = Math.abs(params.trigA - 1) < EPS ? '' : Math.abs(params.trigA + 1) < EPS ? '−' : `${fmtNum(params.trigA)}`;
      const tail =
        Math.abs(params.trigD) > EPS
          ? params.trigD > 0
            ? ` + ${fmtNum(params.trigD)}`
            : ` − ${fmtNum(Math.abs(params.trigD))}`
          : '';
      return `y = ${lead}${params.trigFunc}(${inner})${tail}`;
    }
    case 'explog': {
      const b = fmtNum(Math.max(0.05, params.expBase));
      if (params.expKind === 'inverse') return `y = ${b}ˣ  &  y = log_${b}(x)  (Inverse Reflection)`;
      const hShift =
        Math.abs(params.expH) < EPS
          ? 'x'
          : params.expH > 0
          ? `x − ${fmtNum(params.expH)}`
          : `x + ${fmtNum(Math.abs(params.expH))}`;
      const kShift =
        Math.abs(params.expK) < EPS
          ? ''
          : params.expK > 0
          ? ` + ${fmtNum(params.expK)}`
          : ` − ${fmtNum(Math.abs(params.expK))}`;
      const aLead = Math.abs(params.expA - 1) < EPS ? '' : Math.abs(params.expA + 1) < EPS ? '−' : `${fmtNum(params.expA)}·`;
      return params.expKind === 'exp'
        ? `y = ${aLead}${b}^(${hShift})${kShift}`
        : `y = ${aLead}log_${b}(${hShift})${kShift}`;
    }
    case 'conics':
      return params.conicEq;
    case 'modulus':
      if (params.modKind === 'abs') {
        const inner =
          Math.abs(params.modH) < EPS
            ? 'x'
            : params.modH > 0
            ? `x − ${fmtNum(params.modH)}`
            : `x + ${fmtNum(Math.abs(params.modH))}`;
        const kStr =
          Math.abs(params.modK) < EPS
            ? ''
            : params.modK > 0
            ? ` + ${fmtNum(params.modK)}`
            : ` − ${fmtNum(Math.abs(params.modK))}`;
        return `y = ${Math.abs(params.modA - 1) < EPS ? '' : Math.abs(params.modA + 1) < EPS ? '−' : fmtNum(params.modA)}|${inner}|${kStr}`;
      }
      if (params.modKind === 'floor') {
        return `y = ${fmtNum(params.modA)}·⌊${fmtNum(params.stepFreq)}x⌋${Math.abs(params.modK) > EPS ? (params.modK > 0 ? ` + ${fmtNum(params.modK)}` : ` − ${fmtNum(Math.abs(params.modK))}`) : ''}`;
      }
      return `Piecewise Function (Split at x = ${fmtNum(params.pwSplit)})`;
    case 'simultaneous':
      return params.simKind === 'line_quad'
        ? 'Simultaneous: Parabola & Straight Line'
        : params.simKind === 'line_circle'
        ? 'Simultaneous: Circle & Straight Line'
        : 'Simultaneous: Two Quadratic Curves';
    case 'calculus':
      return `${params.calcFormula}  —  Tangent, Normal & Integral`;
    case 'polar':
      return `Polar Curve: ${params.polarEq || 'r = f(θ)'}`;
    default:
      return 'XY Plane Graph Sketcher';
  }
}

function poly2ToLatex(a: number, b: number, c: number): string {
  return formatPoly2(a, b, c)
    .replace(/x²/g, 'x^2')
    .replace(/−/g, '-');
}

export function getModeEquationLatex(params: {
  mode: string;
  linM: number;
  linC: number;
  quadA: number;
  quadB: number;
  quadC: number;
  ratP2: number;
  ratP1: number;
  ratP0: number;
  ratQ2: number;
  ratQ1: number;
  ratQ0: number;
  cubA: number;
  cubB: number;
  cubC: number;
  cubD: number;
  trigFunc: TrigFuncType;
  trigA: number;
  trigB: number;
  trigC: number;
  trigD: number;
  trigUnit: AngleUnit;
  expKind: ExpLogKind;
  expA: number;
  expBase: number;
  expH: number;
  expK: number;
  conicEq: string;
  modKind: ModulusKind;
  modA: number;
  modH: number;
  modK: number;
  stepFreq: number;
  pwSplit: number;
  simKind: SimPairKind;
  calcFormula: string;
  polarEq?: string;
  customLatex?: string;
}): string {
  switch (params.mode) {
    case 'custom':
      return params.customLatex || 'y = f(x)';
    case 'linear':
      return `y = ${poly2ToLatex(0, params.linM, params.linC)}`;
    case 'quadratic':
      return `y = ${poly2ToLatex(params.quadA, params.quadB, params.quadC)}`;
    case 'lp':
      return '\\text{Linear Programming: } Z = px + qy';
    case 'rational':
      return `f(x) = \\frac{${poly2ToLatex(params.ratP2, params.ratP1, params.ratP0)}}{${poly2ToLatex(params.ratQ2, params.ratQ1, params.ratQ0)}}`;
    case 'cubic': {
      const title = getModeEquationTitle(params);
      return title.replace(/x³/g, 'x^3').replace(/x²/g, 'x^2').replace(/−/g, '-');
    }
    case 'trig': {
      const inner = `${Math.abs(params.trigB - 1) < EPS ? '' : fmtNum(params.trigB)}x${
        Math.abs(params.trigC) > EPS
          ? params.trigC > 0
            ? ` + ${fmtNum(params.trigC)}${params.trigUnit === 'deg' ? '^\\circ' : ''}`
            : ` - ${fmtNum(Math.abs(params.trigC))}${params.trigUnit === 'deg' ? '^\\circ' : ''}`
          : ''
      }`;
      const lead = Math.abs(params.trigA - 1) < EPS ? '' : Math.abs(params.trigA + 1) < EPS ? '-' : `${fmtNum(params.trigA)}`;
      const tail =
        Math.abs(params.trigD) > EPS
          ? params.trigD > 0
            ? ` + ${fmtNum(params.trigD)}`
            : ` - ${fmtNum(Math.abs(params.trigD))}`
          : '';
      return `y = ${lead}\\${params.trigFunc}(${inner})${tail}`;
    }
    case 'explog': {
      const b = fmtNum(Math.max(0.05, params.expBase));
      if (params.expKind === 'inverse') return `y = ${b}^x \\;\\text{ and }\\; y = \\log_{${b}}(x)`;
      const hShift =
        Math.abs(params.expH) < EPS
          ? 'x'
          : params.expH > 0
          ? `x - ${fmtNum(params.expH)}`
          : `x + ${fmtNum(Math.abs(params.expH))}`;
      const kShift =
        Math.abs(params.expK) < EPS
          ? ''
          : params.expK > 0
          ? ` + ${fmtNum(params.expK)}`
          : ` - ${fmtNum(Math.abs(params.expK))}`;
      const aLead = Math.abs(params.expA - 1) < EPS ? '' : Math.abs(params.expA + 1) < EPS ? '-' : `${fmtNum(params.expA)}\\cdot `;
      return params.expKind === 'exp'
        ? `y = ${aLead}${b}^{${hShift}}${kShift}`
        : `y = ${aLead}\\log_{${b}}(${hShift})${kShift}`;
    }
    case 'conics':
      return params.conicEq
        .replace(/²/g, '^2')
        .replace(/−/g, '-')
        .replace(/\(([^()]+)\)\^2\s*\/\s*([0-9.]+)\^2/g, '\\frac{($1)^2}{$2^2}')
        .replace(/([xy])\^2\s*\/\s*([0-9.]+)\^2/g, '\\frac{$1^2}{$2^2}');
    case 'modulus':
      if (params.modKind === 'abs') {
        const inner =
          Math.abs(params.modH) < EPS
            ? 'x'
            : params.modH > 0
            ? `x - ${fmtNum(params.modH)}`
            : `x + ${fmtNum(Math.abs(params.modH))}`;
        const kStr =
          Math.abs(params.modK) < EPS
            ? ''
            : params.modK > 0
            ? ` + ${fmtNum(params.modK)}`
            : ` - ${fmtNum(Math.abs(params.modK))}`;
        const aLead = Math.abs(params.modA - 1) < EPS ? '' : Math.abs(params.modA + 1) < EPS ? '-' : fmtNum(params.modA);
        return `y = ${aLead}\\left|${inner}\\right|${kStr}`;
      }
      if (params.modKind === 'floor') {
        const kStr =
          Math.abs(params.modK) > EPS
            ? params.modK > 0
              ? ` + ${fmtNum(params.modK)}`
              : ` - ${fmtNum(Math.abs(params.modK))}`
            : '';
        return `y = ${fmtNum(params.modA)}\\lfloor ${fmtNum(params.stepFreq)}x \\rfloor${kStr}`;
      }
      return `f(x) \\text{ piecewise at } x_0 = ${fmtNum(params.pwSplit)}`;
    case 'simultaneous':
      return params.simKind === 'line_quad'
        ? '\\text{Simultaneous: } y = ax^2 + bx + c \\;\\&\\; y = mx + d'
        : params.simKind === 'line_circle'
        ? '\\text{Simultaneous: } (x-h)^2 + (y-k)^2 = r^2 \\;\\&\\; y = mx + d'
        : '\\text{Simultaneous: } y = a_1x^2 + b_1x + c_1 \\;\\&\\; y = a_2x^2 + b_2x + c_2';
    case 'calculus':
      return params.calcFormula.replace(/x³/g, 'x^3').replace(/x²/g, 'x^2').replace(/−/g, '-').replace(/sin/g, '\\sin');
    case 'polar':
      return (params.polarEq || 'r = f(\\theta)')
        .replace(/²/g, '^2')
        .replace(/−/g, '-')
        .replace(/cos/g, '\\cos ')
        .replace(/sin/g, '\\sin ')
        .replace(/θ/g, '\\theta');
    default:
      return 'y = f(x)';
  }
}


