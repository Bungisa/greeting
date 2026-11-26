import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Plus,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  analyzeCalculus,
  analyzeConic,
  analyzeCubic,
  analyzeExpLog,
  analyzeModulus,
  analyzeRational,
  analyzeSimultaneous,
  analyzeTrig,
  type AngleUnit,
  type CalcCurveKind,
  clipPolygonHalfPlane,
  computePolygonAreaAndCentroid,
  type ConicKind,
  CONSTRAINT_COLORS,
  EPS,
  evalCalcCurve,
  evalExp,
  evalLog,
  evalTrig,
  type ExpLogKind,
  fmtNum,
  formatLinearExpr,
  formatPiMultiple,
  formatPoly2,
  type GraphMode,
  type InequalityOp,
  LP_PRESETS,
  type LPConstraint,
  type ModulusKind,
  niceGridStep,
  type Point2D,
  RATIONAL_PRESETS,
  type SimPairKind,
  type TrigFuncType,
} from './graphSketcherMath';
import {
  type CanvasDrawHelpers,
  drawCalculusMode,
  drawConicsMode,
  drawCubicMode,
  drawExpLogMode,
  drawModulusMode,
  drawSimultaneousMode,
  drawTrigMode,
  getModeEquationTitle,
} from './graphSketcherCanvas';
import {
  GraphSketcherNewBottomStrip,
  GraphSketcherNewRightControls,
} from './GraphSketcherNewControls';

export interface GraphSketcherXYSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

const MODE_TABS: Array<{ id: GraphMode; label: string }> = [
  { id: 'linear', label: 'Straight Line' },
  { id: 'quadratic', label: 'Quadratic' },
  { id: 'cubic', label: 'Cubic' },
  { id: 'lp', label: 'Linear Programming' },
  { id: 'rational', label: 'Rational & Asymptotes' },
  { id: 'trig', label: 'Trigonometric' },
  { id: 'explog', label: 'Exp & Log' },
  { id: 'conics', label: 'Circle & Conics' },
  { id: 'modulus', label: 'Modulus & Piecewise' },
  { id: 'simultaneous', label: 'Simultaneous' },
  { id: 'calculus', label: 'Calculus (Tangent & ∫)' },
];

export const GraphSketcherXYSimulation: React.FC<GraphSketcherXYSimulationProps> = ({
  darkMode = false,
}) => {
  const [mode, setMode] = useState<GraphMode>('linear');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Viewport transform: center math coordinates + pixels per vertical unit
  const [viewCenter, setViewCenter] = useState<Point2D>({ x: 0, y: 0 });
  const [pxPerUnit, setPxPerUnit] = useState<number>(42);
  const [showTableDots, setShowTableDots] = useState<boolean>(true);
  const [hoverMath, setHoverMath] = useState<Point2D | null>(null);

  // 1. Straight Line
  const [linM, setLinM] = useState<number>(2);
  const [linC, setLinC] = useState<number>(-1);
  const [showSlopeTri, setShowSlopeTri] = useState<boolean>(true);
  const [showSecondLine, setShowSecondLine] = useState<boolean>(false);
  const [linM2, setLinM2] = useState<number>(-0.5);
  const [linC2, setLinC2] = useState<number>(4);

  // 2. Quadratic
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-2);
  const [quadC, setQuadC] = useState<number>(-3);

  // 3. Linear Programming (Unwanted Region Shaded -> Feasible Region Clear)
  const [lpConstraints, setLpConstraints] = useState<LPConstraint[]>(LP_PRESETS[0].constraints);
  const [lpObjP, setLpObjP] = useState<number>(LP_PRESETS[0].objP);
  const [lpObjQ, setLpObjQ] = useState<number>(LP_PRESETS[0].objQ);
  const [lpObjGoal, setLpObjGoal] = useState<'max' | 'min'>(LP_PRESETS[0].objGoal);
  const [showObjectiveLine, setShowObjectiveLine] = useState<boolean>(true);

  // 4. Rational Function
  const [ratP2, setRatP2] = useState<number>(0);
  const [ratP1, setRatP1] = useState<number>(2);
  const [ratP0, setRatP0] = useState<number>(1);
  const [ratQ2, setRatQ2] = useState<number>(0);
  const [ratQ1, setRatQ1] = useState<number>(1);
  const [ratQ0, setRatQ0] = useState<number>(-2);

  // 5. Cubic & Polynomial
  const [cubA, setCubA] = useState<number>(1);
  const [cubB, setCubB] = useState<number>(0);
  const [cubC, setCubC] = useState<number>(-3);
  const [cubD, setCubD] = useState<number>(0);

  // 6. Trigonometric
  const [trigFunc, setTrigFunc] = useState<TrigFuncType>('sin');
  const [trigUnit, setTrigUnit] = useState<AngleUnit>('deg');
  const [trigA, setTrigA] = useState<number>(2);
  const [trigB, setTrigB] = useState<number>(1);
  const [trigC, setTrigC] = useState<number>(0);
  const [trigD, setTrigD] = useState<number>(0);

  // 7. Exponential & Logarithmic
  const [expKind, setExpKind] = useState<ExpLogKind>('exp');
  const [expA, setExpA] = useState<number>(1);
  const [expBase, setExpBase] = useState<number>(2);
  const [expH, setExpH] = useState<number>(0);
  const [expK, setExpK] = useState<number>(0);

  // 8. Circle & Conic Sections
  const [conicKind, setConicKind] = useState<ConicKind>('circle');
  const [conicH, setConicH] = useState<number>(1);
  const [conicK, setConicK] = useState<number>(-1);
  const [conicA, setConicA] = useState<number>(3);
  const [conicB, setConicB] = useState<number>(2);
  const [circleTanDeg, setCircleTanDeg] = useState<number>(45);
  const [showCircleTangent, setShowCircleTangent] = useState<boolean>(true);
  const [hyperbolaAxis, setHyperbolaAxis] = useState<'horizontal' | 'vertical'>('horizontal');

  // 9. Modulus & Piecewise / Step
  const [modKind, setModKind] = useState<ModulusKind>('abs');
  const [modA, setModA] = useState<number>(1);
  const [modH, setModH] = useState<number>(1);
  const [modK, setModK] = useState<number>(-2);
  const [stepFreq, setStepFreq] = useState<number>(1);
  const [pwSplit, setPwSplit] = useState<number>(1);
  const [pwLeftM, setPwLeftM] = useState<number>(1);
  const [pwLeftC, setPwLeftC] = useState<number>(2);
  const [pwRightM, setPwRightM] = useState<number>(-0.5);
  const [pwRightC, setPwRightC] = useState<number>(1);

  // 10. Simultaneous Equations
  const [simKind, setSimKind] = useState<SimPairKind>('line_quad');
  const [simQa, setSimQa] = useState<number>(1);
  const [simQb, setSimQb] = useState<number>(-1);
  const [simQc, setSimQc] = useState<number>(-2);
  const [simLm, setSimLm] = useState<number>(1);
  const [simLd, setSimLd] = useState<number>(1);
  const [simCh, setSimCh] = useState<number>(0);
  const [simCk, setSimCk] = useState<number>(0);
  const [simCr, setSimCr] = useState<number>(3);
  const [simQ2a, setSimQ2a] = useState<number>(-0.5);
  const [simQ2b, setSimQ2b] = useState<number>(1);
  const [simQ2c, setSimQ2c] = useState<number>(3);

  // 11. Calculus: Tangent, Normal & Definite Integral
  const [calcCurve, setCalcCurve] = useState<CalcCurveKind>('quadratic');
  const [calcA, setCalcA] = useState<number>(0.5);
  const [calcB, setCalcB] = useState<number>(-1);
  const [calcC, setCalcC] = useState<number>(-1.5);
  const [calcX0, setCalcX0] = useState<number>(2);
  const [calcIntA, setCalcIntA] = useState<number>(-1);
  const [calcIntB, setCalcIntB] = useState<number>(3);
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [showNormal, setShowNormal] = useState<boolean>(true);
  const [showIntegral, setShowIntegral] = useState<boolean>(true);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasBoxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 720, height: 460 });

  // Horizontal scale factor (1 for standard Cartesian; 1/60 in Trig Degree mode so 360° fits naturally!)
  const pxPerUnitX = mode === 'trig' && trigUnit === 'deg' ? pxPerUnit / 60 : pxPerUnit;
  const pxPerUnitY = pxPerUnit;

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startCenter: Point2D;
  }>({ active: false, startX: 0, startY: 0, startCenter: { x: 0, y: 0 } });

  const resetViewportForMode = useCallback(
    (targetMode: GraphMode, unitOverride?: AngleUnit) => {
      const activeUnit = unitOverride ?? trigUnit;
      if (targetMode === 'lp') {
        setViewCenter({ x: 4.5, y: 4.5 });
        setPxPerUnit(38);
      } else if (targetMode === 'trig') {
        if (activeUnit === 'deg') {
          setViewCenter({ x: 180, y: 0 });
          setPxPerUnit(54);
        } else {
          setViewCenter({ x: Math.PI, y: 0 });
          setPxPerUnit(54);
        }
      } else {
        setViewCenter({ x: 0, y: 0 });
        setPxPerUnit(42);
      }
    },
    [trigUnit]
  );

  const handleSwitchMode = (next: GraphMode) => {
    setMode(next);
    resetViewportForMode(next);
  };

  const handleChangeTrigUnit = (nextUnit: AngleUnit) => {
    if (nextUnit === trigUnit) return;
    setTrigUnit(nextUnit);
    setTrigC(0);
    resetViewportForMode('trig', nextUnit);
  };

  // ResizeObserver for crisp responsive HiDPI canvas
  useEffect(() => {
    const box = canvasBoxRef.current;
    if (!box) return;
    const sync = () => {
      const w = Math.max(260, Math.floor(box.clientWidth));
      const h = Math.max(300, Math.floor(box.clientHeight));
      setCanvasSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };
    sync();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(box);
    window.addEventListener('resize', sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  // ============================================================================
  // MATHEMATICAL ANALYSES (Live Memoized)
  // ============================================================================
  const linearInfo = useMemo(() => {
    const xInt = Math.abs(linM) > EPS ? -linC / linM : null;
    const angleDeg = (Math.atan(linM) * 180) / Math.PI;
    let intersection: Point2D | null = null;
    let relation = '';
    if (showSecondLine) {
      if (Math.abs(linM - linM2) < EPS) {
        relation = Math.abs(linC - linC2) < EPS ? 'Coincident lines (same line)' : 'Parallel lines (no intersection)';
      } else {
        const ix = (linC2 - linC) / (linM - linM2);
        const iy = linM * ix + linC;
        intersection = { x: ix, y: iy };
        relation =
          Math.abs(linM * linM2 + 1) < 1e-3 ? 'Perpendicular lines (m₁ · m₂ = −1)' : 'Intersecting lines';
      }
    }
    const table = [-2, -1, 0, 1, 2, 3].map((x) => ({ x, y: linM * x + linC }));
    return { xInt, angleDeg, intersection, relation, table };
  }, [linM, linC, showSecondLine, linM2, linC2]);

  const quadraticInfo = useMemo(() => {
    const isLinear = Math.abs(quadA) < EPS;
    const h = isLinear ? 0 : -quadB / (2 * quadA);
    const k = isLinear ? quadC : quadA * h * h + quadB * h + quadC;
    const disc = quadB * quadB - 4 * quadA * quadC;
    const roots: number[] = [];
    if (!isLinear) {
      if (disc > EPS) {
        const s = Math.sqrt(disc);
        roots.push((-quadB - s) / (2 * quadA), (-quadB + s) / (2 * quadA));
        roots.sort((u, v) => u - v);
      } else if (Math.abs(disc) <= EPS) {
        roots.push(h);
      }
    } else if (Math.abs(quadB) > EPS) {
      roots.push(-quadC / quadB);
    }

    const centerInt = Math.round(h);
    const table = [-3, -2, -1, 0, 1, 2, 3].map((dx) => {
      const x = centerInt + dx;
      return { x, y: quadA * x * x + quadB * x + quadC };
    });

    return {
      isLinear,
      vertex: { x: h, y: k },
      disc,
      roots,
      opens: quadA > EPS ? 'Upward (Minimum)' : quadA < -EPS ? 'Downward (Maximum)' : 'Straight Line',
      table,
    };
  }, [quadA, quadB, quadC]);

  const lpInfo = useMemo(() => {
    const BOUND = 500;
    let poly: Point2D[] = [
      { x: -BOUND, y: -BOUND },
      { x: BOUND, y: -BOUND },
      { x: BOUND, y: BOUND },
      { x: -BOUND, y: BOUND },
    ];
    const active = lpConstraints.filter((ct) => ct.enabled && (Math.abs(ct.a) > EPS || Math.abs(ct.b) > EPS));
    for (const ct of active) {
      if (ct.op === '<=' || ct.op === '<') {
        poly = clipPolygonHalfPlane(poly, ct.a, ct.b, ct.c);
      } else {
        poly = clipPolygonHalfPlane(poly, -ct.a, -ct.b, -ct.c);
      }
    }

    const isBounded = poly.length >= 3 && poly.every((p) => Math.abs(p.x) < BOUND * 0.8 && Math.abs(p.y) < BOUND * 0.8);
    const rawCorners = poly.filter((p) => Math.abs(p.x) < BOUND * 0.8 && Math.abs(p.y) < BOUND * 0.8);
    const corners: Point2D[] = [];
    for (const pt of rawCorners) {
      if (!corners.some((c) => Math.hypot(c.x - pt.x, c.y - pt.y) < 1e-4)) {
        corners.push(pt);
      }
    }

    const evaluated = corners.map((pt, idx) => ({
      label: String.fromCharCode(65 + idx),
      x: pt.x,
      y: pt.y,
      z: lpObjP * pt.x + lpObjQ * pt.y,
    }));

    let optimal: (typeof evaluated)[number] | null = null;
    if (evaluated.length > 0) {
      optimal = evaluated.reduce((best, cur) =>
        lpObjGoal === 'max' ? (cur.z > best.z ? cur : best) : cur.z < best.z ? cur : best
      );
    }

    return {
      active,
      feasiblePoly: poly,
      isBounded,
      isEmpty: poly.length < 3,
      corners: evaluated,
      optimal,
    };
  }, [lpConstraints, lpObjP, lpObjQ, lpObjGoal]);

  const rationalInfo = useMemo(
    () => analyzeRational(ratP2, ratP1, ratP0, ratQ2, ratQ1, ratQ0),
    [ratP2, ratP1, ratP0, ratQ2, ratQ1, ratQ0]
  );

  const cubicInfo = useMemo(() => analyzeCubic(cubA, cubB, cubC, cubD), [cubA, cubB, cubC, cubD]);
  const trigInfo = useMemo(
    () => analyzeTrig(trigFunc, trigA, trigB, trigC, trigD, trigUnit),
    [trigFunc, trigA, trigB, trigC, trigD, trigUnit]
  );
  const expLogInfo = useMemo(
    () => analyzeExpLog(expKind, expA, expBase, expH, expK),
    [expKind, expA, expBase, expH, expK]
  );
  const conicInfo = useMemo(
    () => analyzeConic(conicKind, conicH, conicK, conicA, conicB, circleTanDeg, hyperbolaAxis),
    [conicKind, conicH, conicK, conicA, conicB, circleTanDeg, hyperbolaAxis]
  );
  const modulusInfo = useMemo(
    () => analyzeModulus(modKind, modA, modH, modK, stepFreq, pwSplit, pwLeftM, pwLeftC, pwRightM, pwRightC),
    [modKind, modA, modH, modK, stepFreq, pwSplit, pwLeftM, pwLeftC, pwRightM, pwRightC]
  );
  const simultaneousInfo = useMemo(
    () =>
      analyzeSimultaneous(
        simKind,
        simQa,
        simQb,
        simQc,
        simLm,
        simLd,
        simCh,
        simCk,
        simCr,
        simQ2a,
        simQ2b,
        simQ2c
      ),
    [simKind, simQa, simQb, simQc, simLm, simLd, simCh, simCk, simCr, simQ2a, simQ2b, simQ2c]
  );
  const calculusInfo = useMemo(
    () => analyzeCalculus(calcCurve, calcA, calcB, calcC, calcX0, calcIntA, calcIntB),
    [calcCurve, calcA, calcB, calcC, calcX0, calcIntA, calcIntB]
  );

  // ============================================================================
  // CANVAS RENDERING ENGINE
  // ============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: W, height: H } = canvasSize;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const toScreenX = (mx: number) => W / 2 + (mx - viewCenter.x) * pxPerUnitX;
    const toScreenY = (my: number) => H / 2 - (my - viewCenter.y) * pxPerUnitY;

    const xMin = viewCenter.x - W / (2 * pxPerUnitX);
    const xMax = viewCenter.x + W / (2 * pxPerUnitX);
    const yMin = viewCenter.y - H / (2 * pxPerUnitY);
    const yMax = viewCenter.y + H / (2 * pxPerUnitY);

    // 1. Background drafting surface
    ctx.fillStyle = darkMode ? '#0b1220' : '#fafbfc';
    ctx.fillRect(0, 0, W, H);

    // 2. Adaptive Major & Minor Grid (with Degree/Radian smart steps in Trig mode!)
    let stepX = niceGridStep(xMax - xMin);
    if (mode === 'trig') {
      if (trigUnit === 'deg') {
        const span = xMax - xMin;
        stepX = span > 700 ? 180 : span > 260 ? 90 : 45;
      } else {
        const span = xMax - xMin;
        stepX = span > 14 ? Math.PI : Math.PI / 2;
      }
    }
    const stepY = niceGridStep(yMax - yMin);
    const minorStepX = stepX / 2;
    const minorStepY = stepY / 2;

    ctx.lineWidth = 1;
    ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.06)' : 'rgba(15,23,42,0.05)';
    const firstMinorX = Math.floor(xMin / minorStepX) * minorStepX;
    for (let x = firstMinorX; x <= xMax + minorStepX; x += minorStepX) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H);
      ctx.stroke();
    }
    const firstMinorY = Math.floor(yMin / minorStepY) * minorStepY;
    for (let y = firstMinorY; y <= yMax + minorStepY; y += minorStepY) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
      ctx.stroke();
    }

    ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.12)';
    const firstMajorX = Math.floor(xMin / stepX) * stepX;
    for (let x = firstMajorX; x <= xMax + stepX; x += stepX) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H);
      ctx.stroke();
    }
    const firstMajorY = Math.floor(yMin / stepY) * stepY;
    for (let y = firstMajorY; y <= yMax + stepY; y += stepY) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
      ctx.stroke();
    }

    const drawTag = (
      text: string,
      sx: number,
      sy: number,
      color: string,
      align: CanvasTextAlign = 'left'
    ) => {
      ctx.save();
      ctx.font = '700 11.5px Inter, system-ui, sans-serif';
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = darkMode ? 'rgba(11,18,32,0.92)' : 'rgba(250,251,252,0.94)';
      ctx.strokeText(text, sx, sy);
      ctx.fillStyle = color;
      ctx.fillText(text, sx, sy);
      ctx.restore();
    };

    const drawPointDot = (
      mx: number,
      my: number,
      fillHex: string,
      label?: string,
      offsetX = 9,
      offsetY = -10,
      hollow = false
    ) => {
      const sx = toScreenX(mx);
      const sy = toScreenY(my);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, hollow ? 5.5 : 5, 0, Math.PI * 2);
      if (hollow) {
        ctx.fillStyle = darkMode ? '#0b1220' : '#fafbfc';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = fillHex;
        ctx.stroke();
      } else {
        ctx.fillStyle = fillHex;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = darkMode ? '#0b1220' : '#ffffff';
        ctx.stroke();
      }
      if (label) {
        drawTag(label, sx + offsetX, sy + offsetY, fillHex);
      }
      ctx.restore();
    };

    // ==========================================================================
    // LP FIRST LAYER: UNWANTED-REGION SHADING (Before Axes)
    // ==========================================================================
    if (mode === 'lp') {
      const viewPolyMath: Point2D[] = [
        { x: xMin - 1, y: yMin - 1 },
        { x: xMax + 1, y: yMin - 1 },
        { x: xMax + 1, y: yMax + 1 },
        { x: xMin - 1, y: yMax + 1 },
      ];

      lpInfo.active.forEach((ct, idx) => {
        const unwantedPoly =
          ct.op === '<=' || ct.op === '<'
            ? clipPolygonHalfPlane(viewPolyMath, -ct.a, -ct.b, -ct.c)
            : clipPolygonHalfPlane(viewPolyMath, ct.a, ct.b, ct.c);

        if (unwantedPoly.length < 3) return;

        ctx.save();
        ctx.beginPath();
        unwantedPoly.forEach((pt, i) => {
          const sx = toScreenX(pt.x);
          const sy = toScreenY(pt.y);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();

        ctx.fillStyle = darkMode ? 'rgba(244, 63, 94, 0.11)' : 'rgba(225, 29, 72, 0.065)';
        ctx.fill();

        ctx.clip();
        const angleDeg = [35, 145, 62, 118, 22, 158, 48][idx % 7];
        const rad = (angleDeg * Math.PI) / 180;
        const cosA = Math.cos(rad);
        const sinA = Math.sin(rad);
        const diag = Math.hypot(W, H);
        const spacing = 13;

        ctx.strokeStyle = darkMode ? 'rgba(244, 63, 94, 0.28)' : 'rgba(190, 18, 60, 0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let d = -diag; d <= diag; d += spacing) {
          const px = W / 2 + d * -sinA;
          const py = H / 2 + d * cosA;
          ctx.moveTo(px - cosA * diag, py - sinA * diag);
          ctx.lineTo(px + cosA * diag, py + sinA * diag);
        }
        ctx.stroke();
        ctx.restore();
      });

      if (!lpInfo.isEmpty) {
        let visibleFeasible = lpInfo.feasiblePoly;
        visibleFeasible = clipPolygonHalfPlane(visibleFeasible, -1, 0, -xMin);
        visibleFeasible = clipPolygonHalfPlane(visibleFeasible, 1, 0, xMax);
        visibleFeasible = clipPolygonHalfPlane(visibleFeasible, 0, -1, -yMin);
        visibleFeasible = clipPolygonHalfPlane(visibleFeasible, 0, 1, yMax);

        if (visibleFeasible.length >= 3) {
          ctx.save();
          ctx.beginPath();
          visibleFeasible.forEach((p, i) => {
            const sx = toScreenX(p.x);
            const sy = toScreenY(p.y);
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          });
          ctx.closePath();
          ctx.strokeStyle = darkMode ? 'rgba(16, 185, 129, 0.65)' : 'rgba(5, 150, 105, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          const { area, centroid } = computePolygonAreaAndCentroid(visibleFeasible);
          if (centroid && area > 0.25) {
            const csx = toScreenX(centroid.x);
            const csy = toScreenY(centroid.y);
            drawTag('FEASIBLE', csx, csy - 7, darkMode ? '#34d399' : '#047857', 'center');
            drawTag('REGION (R)', csx, csy + 7, darkMode ? '#34d399' : '#047857', 'center');
          }
          ctx.restore();
        }
      }
    }

    // ==========================================================================
    // 3. X & Y AXES WITH ARROWS AND NUMERIC TICKS
    // ==========================================================================
    const originX = toScreenX(0);
    const originY = toScreenY(0);
    const axisColor = darkMode ? '#cbd5e1' : '#0f172a';
    const tickLabelColor = darkMode ? '#94a3b8' : '#475569';

    ctx.save();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.8;

    if (originY >= -2 && originY <= H + 2) {
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(W, originY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W - 9, originY - 4.5);
      ctx.lineTo(W - 1, originY);
      ctx.lineTo(W - 9, originY + 4.5);
      ctx.stroke();
      drawTag('x', W - 14, Math.max(14, Math.min(H - 14, originY - 14)), axisColor, 'center');
    }

    if (originX >= -2 && originX <= W + 2) {
      ctx.beginPath();
      ctx.moveTo(originX, H);
      ctx.lineTo(originX, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(originX - 4.5, 9);
      ctx.lineTo(originX, 1);
      ctx.lineTo(originX + 4.5, 9);
      ctx.stroke();
      drawTag('y', Math.max(16, Math.min(W - 16, originX + 14)), 14, axisColor, 'center');
    }

    ctx.font = '600 10.5px Inter, system-ui, sans-serif';
    ctx.fillStyle = tickLabelColor;
    const clampedAxisY = Math.max(14, Math.min(H - 16, originY));
    const clampedAxisX = Math.max(24, Math.min(W - 14, originX));

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = firstMajorX; x <= xMax + stepX; x += stepX) {
      if (Math.abs(x) < 1e-6) continue;
      const sx = toScreenX(x);
      if (sx < 18 || sx > W - 18) continue;
      if (originY >= 0 && originY <= H) {
        ctx.beginPath();
        ctx.moveTo(sx, originY - 3.5);
        ctx.lineTo(sx, originY + 3.5);
        ctx.stroke();
      }
      const xLabel =
        mode === 'trig'
          ? trigUnit === 'deg'
            ? `${fmtNum(x)}°`
            : formatPiMultiple(x)
          : fmtNum(x);
      ctx.fillText(xLabel, sx, clampedAxisY + 6);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = firstMajorY; y <= yMax + stepY; y += stepY) {
      if (Math.abs(y) < 1e-6) continue;
      const sy = toScreenY(y);
      if (sy < 14 || sy > H - 14) continue;
      if (originX >= 0 && originX <= W) {
        ctx.beginPath();
        ctx.moveTo(originX - 3.5, sy);
        ctx.lineTo(originX + 3.5, sy);
        ctx.stroke();
      }
      ctx.fillText(fmtNum(y), clampedAxisX - 7, sy);
    }

    if (originX >= 12 && originX <= W - 12 && originY >= 12 && originY <= H - 12) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('0', originX - 6, originY + 5);
    }
    ctx.restore();

    const helpers: CanvasDrawHelpers = {
      ctx,
      W,
      H,
      xMin,
      xMax,
      yMin,
      yMax,
      viewCenter,
      darkMode,
      toScreenX,
      toScreenY,
      drawTag,
      drawPointDot,
    };

    // ==========================================================================
    // MODE 1: STRAIGHT LINE
    // ==========================================================================
    if (mode === 'linear') {
      const drawStraightLine = (m: number, c: number, color: string, label: string, dashed = false) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.8;
        if (dashed) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(toScreenX(xMin - 2), toScreenY(m * (xMin - 2) + c));
        ctx.lineTo(toScreenX(xMax + 2), toScreenY(m * (xMax + 2) + c));
        ctx.stroke();
        ctx.restore();

        const labelX = Math.max(xMin + 1.5, Math.min(xMax - 2.2, viewCenter.x + (xMax - xMin) * 0.22));
        const labelY = m * labelX + c;
        if (labelY > yMin + 0.6 && labelY < yMax - 0.6) {
          drawTag(label, toScreenX(labelX) + 6, toScreenY(labelY) - 14, color);
        }
      };

      drawStraightLine(linM, linC, '#0284c7', `y = ${formatPoly2(0, linM, linC)}`);

      if (showSlopeTri && Math.abs(linM) > 1e-4) {
        const x1 = 0;
        const y1 = linC;
        const x2 = 1;
        const y2 = linM * x2 + linC;

        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(toScreenX(x1), toScreenY(y1));
        ctx.lineTo(toScreenX(x2), toScreenY(y1));
        ctx.lineTo(toScreenX(x2), toScreenY(y2));
        ctx.stroke();
        ctx.restore();

        drawTag(`Δx = 1`, toScreenX((x1 + x2) / 2), toScreenY(y1) + (linM > 0 ? 13 : -12), '#d97706', 'center');
        drawTag(`Δy = ${fmtNum(linM)}`, toScreenX(x2) + 8, toScreenY((y1 + y2) / 2), '#d97706', 'left');
      }

      if (showSecondLine) {
        drawStraightLine(linM2, linC2, '#ec4899', `L₂: y = ${formatPoly2(0, linM2, linC2)}`);
        if (linearInfo.intersection) {
          drawPointDot(
            linearInfo.intersection.x,
            linearInfo.intersection.y,
            '#10b981',
            `P(${fmtNum(linearInfo.intersection.x)}, ${fmtNum(linearInfo.intersection.y)})`,
            10,
            -12
          );
        }
      }

      if (showTableDots) {
        linearInfo.table.forEach((pt) => drawPointDot(pt.x, pt.y, '#38bdf8'));
      }

      drawPointDot(0, linC, '#f59e0b', `y-int (0, ${fmtNum(linC)})`, 10, -10);
      if (linearInfo.xInt !== null && Math.abs(linearInfo.xInt) > 1e-5) {
        drawPointDot(linearInfo.xInt, 0, '#10b981', `x-int (${fmtNum(linearInfo.xInt)}, 0)`, 8, 15);
      }
    }

    // ==========================================================================
    // MODE 2: QUADRATIC GRAPH
    // ==========================================================================
    if (mode === 'quadratic') {
      if (!quadraticInfo.isLinear) {
        const ax = toScreenX(quadraticInfo.vertex.x);
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = darkMode ? 'rgba(56,189,248,0.65)' : 'rgba(2,132,199,0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ax, 0);
        ctx.lineTo(ax, H);
        ctx.stroke();
        ctx.restore();
        drawTag(`x = ${fmtNum(quadraticInfo.vertex.x)}`, ax + 7, 26, '#0284c7');
      }

      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const SAMPLES = 420;
      let started = false;
      for (let i = 0; i <= SAMPLES; i++) {
        const mx = xMin + ((xMax - xMin) * i) / SAMPLES;
        const my = quadA * mx * mx + quadB * mx + quadC;
        const sx = toScreenX(mx);
        const sy = toScreenY(my);
        if (sy < -H * 2 || sy > H * 3) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(sx, sy);
          started = true;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();
      ctx.restore();

      if (showTableDots) {
        quadraticInfo.table.forEach((pt) => drawPointDot(pt.x, pt.y, '#fbbf24'));
      }

      drawPointDot(0, quadC, '#38bdf8', `(0, ${fmtNum(quadC)})`, 9, -10);
      quadraticInfo.roots.forEach((r, i) => drawPointDot(r, 0, '#10b981', `x${i + 1} = ${fmtNum(r)}`, 7, 15));

      if (!quadraticInfo.isLinear) {
        const vLabel = `${quadA > 0 ? 'Min' : 'Max'} (${fmtNum(quadraticInfo.vertex.x)}, ${fmtNum(quadraticInfo.vertex.y)})`;
        drawPointDot(
          quadraticInfo.vertex.x,
          quadraticInfo.vertex.y,
          '#f43f5e',
          vLabel,
          10,
          quadA > 0 ? 16 : -14
        );
      }
    }

    // ==========================================================================
    // MODE 3: LINEAR PROGRAMMING LINES & CORNERS
    // ==========================================================================
    if (mode === 'lp') {
      lpInfo.active.forEach((ct, idx) => {
        const color = CONSTRAINT_COLORS[idx % CONSTRAINT_COLORS.length];
        const isStrict = ct.op === '<' || ct.op === '>';
        let pA: Point2D;
        let pB: Point2D;
        if (Math.abs(ct.b) > Math.abs(ct.a)) {
          const x1 = xMin - 2;
          const x2 = xMax + 2;
          pA = { x: x1, y: (ct.c - ct.a * x1) / ct.b };
          pB = { x: x2, y: (ct.c - ct.a * x2) / ct.b };
        } else {
          const y1 = yMin - 2;
          const y2 = yMax + 2;
          pA = { x: (ct.c - ct.b * y1) / ct.a, y: y1 };
          pB = { x: (ct.c - ct.b * y2) / ct.a, y: y2 };
        }

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4;
        if (isStrict) ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(toScreenX(pA.x), toScreenY(pA.y));
        ctx.lineTo(toScreenX(pB.x), toScreenY(pB.y));
        ctx.stroke();
        ctx.restore();

        if (Math.abs(ct.a) > EPS && Math.abs(ct.b) > EPS) {
          const mx = Math.max(xMin + 0.8, Math.min(xMax - 2.2, ct.c / (2 * ct.a)));
          const my = (ct.c - ct.a * mx) / ct.b;
          if (my > yMin + 0.5 && my < yMax - 0.5) {
            drawTag(`${formatLinearExpr(ct.a, ct.b)} = ${fmtNum(ct.c)}`, toScreenX(mx) + 6, toScreenY(my) - 10, color);
          }
        }
      });

      if (showObjectiveLine && lpInfo.optimal && (Math.abs(lpObjP) > EPS || Math.abs(lpObjQ) > EPS)) {
        const zStar = lpInfo.optimal.z;
        let oA: Point2D;
        let oB: Point2D;
        if (Math.abs(lpObjQ) > Math.abs(lpObjP)) {
          oA = { x: xMin - 2, y: (zStar - lpObjP * (xMin - 2)) / lpObjQ };
          oB = { x: xMax + 2, y: (zStar - lpObjP * (xMax + 2)) / lpObjQ };
        } else {
          oA = { x: (zStar - lpObjQ * (yMin - 2)) / lpObjP, y: yMin - 2 };
          oB = { x: (zStar - lpObjQ * (yMax + 2)) / lpObjP, y: yMax + 2 };
        }
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(toScreenX(oA.x), toScreenY(oA.y));
        ctx.lineTo(toScreenX(oB.x), toScreenY(oB.y));
        ctx.stroke();
        ctx.restore();
      }

      lpInfo.corners.forEach((cp) => {
        const isOpt = lpInfo.optimal?.label === cp.label;
        drawPointDot(
          cp.x,
          cp.y,
          isOpt ? '#10b981' : '#f59e0b',
          `${cp.label}(${fmtNum(cp.x)}, ${fmtNum(cp.y)})${isOpt ? ' ★' : ''}`,
          9,
          -11
        );
      });
    }

    // ==========================================================================
    // MODE 4: RATIONAL FUNCTION WITH ASYMPTOTES
    // ==========================================================================
    if (mode === 'rational') {
      const { verticalAsymptotes, horizontalAsymptote, obliqueAsymptote, holes, xIntercepts, yIntercept } =
        rationalInfo;

      verticalAsymptotes.forEach((va) => {
        const sx = toScreenX(va);
        if (sx < -10 || sx > W + 10) return;
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, H);
        ctx.stroke();
        ctx.restore();
        drawTag(`VA: x = ${fmtNum(va)}`, sx + 7, 28, '#f43f5e');
      });

      if (horizontalAsymptote !== null) {
        const sy = toScreenY(horizontalAsymptote);
        if (sy >= -10 && sy <= H + 10) {
          ctx.save();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.setLineDash([7, 5]);
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(W, sy);
          ctx.stroke();
          ctx.restore();
          drawTag(`HA: y = ${fmtNum(horizontalAsymptote)}`, W - 12, sy - 11, '#10b981', 'right');
        }
      }

      if (obliqueAsymptote !== null) {
        const { m, b } = obliqueAsymptote;
        ctx.save();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.moveTo(toScreenX(xMin - 2), toScreenY(m * (xMin - 2) + b));
        ctx.lineTo(toScreenX(xMax + 2), toScreenY(m * (xMax + 2) + b));
        ctx.stroke();
        ctx.restore();

        const tx = xMax - (xMax - xMin) * 0.24;
        const ty = m * tx + b;
        if (ty > yMin + 0.5 && ty < yMax - 0.5) {
          drawTag(`OA: y = ${formatPoly2(0, m, b)}`, toScreenX(tx), toScreenY(ty) - 13, '#8b5cf6', 'center');
        }
      }

      const evalRat = (x: number) => {
        const den = ratQ2 * x * x + ratQ1 * x + ratQ0;
        if (Math.abs(den) < 1e-6) return NaN;
        return (ratP2 * x * x + ratP1 * x + ratP0) / den;
      };

      const breaks = [xMin, ...verticalAsymptotes.filter((v) => v > xMin && v < xMax), xMax];
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.9;
      const yClipMargin = (yMax - yMin) * 3;

      for (let seg = 0; seg < breaks.length - 1; seg++) {
        const a = breaks[seg] + (seg > 0 ? 0.002 : 0);
        const b = breaks[seg + 1] - (seg < breaks.length - 2 ? 0.002 : 0);
        if (b <= a) continue;
        const steps = Math.max(120, Math.round(((b - a) / (xMax - xMin)) * 700));
        ctx.beginPath();
        let penDown = false;
        let prevY = 0;

        for (let i = 0; i <= steps; i++) {
          const mx = a + ((b - a) * i) / steps;
          const my = evalRat(mx);
          if (!Number.isFinite(my) || Math.abs(my - viewCenter.y) > yClipMargin) {
            penDown = false;
            continue;
          }
          if (penDown && Math.abs(my - prevY) > (yMax - yMin) * 1.4) {
            penDown = false;
          }
          const sx = toScreenX(mx);
          const sy = toScreenY(my);
          if (!penDown) {
            ctx.moveTo(sx, sy);
            penDown = true;
          } else {
            ctx.lineTo(sx, sy);
          }
          prevY = my;
        }
        ctx.stroke();
      }
      ctx.restore();

      if (yIntercept !== null) drawPointDot(0, yIntercept, '#f59e0b', `(0, ${fmtNum(yIntercept)})`, 9, -10);
      xIntercepts.forEach((xi) => drawPointDot(xi, 0, '#10b981', `(${fmtNum(xi)}, 0)`, 7, 15));
      holes.forEach((hole) =>
        drawPointDot(hole.x, hole.y, '#f43f5e', `Hole (${fmtNum(hole.x)}, ${fmtNum(hole.y)})`, 10, -12, true)
      );
    }

    // ==========================================================================
    // MODES 5–11: NEW GRAPH SKETCHING MODULES
    // ==========================================================================
    if (mode === 'cubic') drawCubicMode(helpers, cubA, cubB, cubC, cubD, cubicInfo, showTableDots);
    if (mode === 'trig') drawTrigMode(helpers, trigFunc, trigA, trigB, trigC, trigD, trigUnit, trigInfo, showTableDots);
    if (mode === 'explog') drawExpLogMode(helpers, expKind, expA, expBase, expH, expK, expLogInfo);
    if (mode === 'conics')
      drawConicsMode(helpers, conicKind, conicH, conicK, conicA, conicB, hyperbolaAxis, showCircleTangent, conicInfo);
    if (mode === 'modulus')
      drawModulusMode(
        helpers,
        modKind,
        modA,
        modH,
        modK,
        stepFreq,
        pwSplit,
        pwLeftM,
        pwLeftC,
        pwRightM,
        pwRightC,
        modulusInfo
      );
    if (mode === 'simultaneous')
      drawSimultaneousMode(
        helpers,
        simKind,
        simQa,
        simQb,
        simQc,
        simLm,
        simLd,
        simCh,
        simCk,
        simCr,
        simQ2a,
        simQ2b,
        simQ2c,
        simultaneousInfo
      );
    if (mode === 'calculus')
      drawCalculusMode(
        helpers,
        calcCurve,
        calcA,
        calcB,
        calcC,
        calcIntA,
        calcIntB,
        showTangent,
        showNormal,
        showIntegral,
        calculusInfo
      );

    // ==========================================================================
    // INTERACTIVE HOVER COORDINATE PROBE
    // ==========================================================================
    if (hoverMath) {
      const hsx = toScreenX(hoverMath.x);
      const hsy = toScreenY(hoverMath.y);
      ctx.save();
      ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.35)' : 'rgba(15,23,42,0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hsx, 0);
      ctx.lineTo(hsx, H);
      ctx.moveTo(0, hsy);
      ctx.lineTo(W, hsy);
      ctx.stroke();
      ctx.restore();

      const hx = hoverMath.x;
      let traceY: number | null = null;
      if (mode === 'linear') traceY = linM * hx + linC;
      else if (mode === 'quadratic') traceY = quadA * hx * hx + quadB * hx + quadC;
      else if (mode === 'cubic') traceY = cubA * hx * hx * hx + cubB * hx * hx + cubC * hx + cubD;
      else if (mode === 'rational') {
        const den = ratQ2 * hx * hx + ratQ1 * hx + ratQ0;
        if (Math.abs(den) > 0.02) traceY = (ratP2 * hx * hx + ratP1 * hx + ratP0) / den;
      } else if (mode === 'trig') {
        const v = evalTrig(trigFunc, trigA, trigB, trigC, trigD, hx, trigUnit);
        if (Number.isFinite(v)) traceY = v;
      } else if (mode === 'explog') {
        if (expKind === 'exp' || expKind === 'inverse') traceY = evalExp(expKind === 'inverse' ? 1 : expA, expBase, expKind === 'inverse' ? 0 : expH, expKind === 'inverse' ? 0 : expK, hx);
        else {
          const v = evalLog(expA, expBase, expH, expK, hx);
          if (Number.isFinite(v)) traceY = v;
        }
      } else if (mode === 'modulus') {
        if (modKind === 'abs') traceY = modA * Math.abs(hx - modH) + modK;
        else if (modKind === 'floor') traceY = modA * Math.floor(Math.max(0.25, Math.abs(stepFreq)) * hx) + modK;
        else traceY = hx < pwSplit ? pwLeftM * hx + pwLeftC : pwRightM * hx + pwRightC;
      } else if (mode === 'calculus') {
        traceY = evalCalcCurve(calcCurve, calcA, calcB, calcC, hx);
      }

      if (traceY !== null && Number.isFinite(traceY) && traceY >= yMin && traceY <= yMax) {
        const xStr = mode === 'trig' && trigUnit === 'deg' ? `${fmtNum(hx)}°` : fmtNum(hx);
        drawPointDot(hx, traceY, darkMode ? '#38bdf8' : '#0f172a', `(${xStr}, ${fmtNum(traceY)})`, 10, -12);
      }
    }
  }, [
    canvasSize,
    darkMode,
    viewCenter,
    pxPerUnitX,
    pxPerUnitY,
    mode,
    linM,
    linC,
    showSlopeTri,
    showSecondLine,
    linM2,
    linC2,
    linearInfo,
    quadA,
    quadB,
    quadC,
    quadraticInfo,
    lpInfo,
    lpObjP,
    lpObjQ,
    showObjectiveLine,
    ratP2,
    ratP1,
    ratP0,
    ratQ2,
    ratQ1,
    ratQ0,
    rationalInfo,
    cubA,
    cubB,
    cubC,
    cubD,
    cubicInfo,
    trigFunc,
    trigUnit,
    trigA,
    trigB,
    trigC,
    trigD,
    trigInfo,
    expKind,
    expA,
    expBase,
    expH,
    expK,
    expLogInfo,
    conicKind,
    conicH,
    conicK,
    conicA,
    conicB,
    hyperbolaAxis,
    showCircleTangent,
    conicInfo,
    modKind,
    modA,
    modH,
    modK,
    stepFreq,
    pwSplit,
    pwLeftM,
    pwLeftC,
    pwRightM,
    pwRightC,
    modulusInfo,
    simKind,
    simQa,
    simQb,
    simQc,
    simLm,
    simLd,
    simCh,
    simCk,
    simCr,
    simQ2a,
    simQ2b,
    simQ2c,
    simultaneousInfo,
    calcCurve,
    calcA,
    calcB,
    calcC,
    calcIntA,
    calcIntB,
    showTangent,
    showNormal,
    showIntegral,
    calculusInfo,
    showTableDots,
    hoverMath,
  ]);

  // ============================================================================
  // POINTER PANNING, WHEEL ZOOM & HOVER HANDLERS
  // ============================================================================
  const screenToMath = (clientX: number, clientY: number): Point2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: viewCenter.x + (sx - rect.width / 2) / pxPerUnitX,
      y: viewCenter.y - (sy - rect.height / 2) / pxPerUnitY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startCenter: { ...viewCenter },
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setViewCenter({
        x: dragRef.current.startCenter.x - dx / pxPerUnitX,
        y: dragRef.current.startCenter.y + dy / pxPerUnitY,
      });
    }
    const pt = screenToMath(e.clientX, e.clientY);
    if (pt) setHoverMath(pt);
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setPxPerUnit((prev) => Math.max(12, Math.min(140, prev * factor)));
  };

  const handleToggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  const addLPConstraint = () => {
    if (lpConstraints.length >= 7) return;
    setLpConstraints((prev) => [
      ...prev,
      { id: `c_${Date.now()}`, a: 1, b: 2, op: '<=', c: 10, enabled: true },
    ]);
  };

  const updateLPConstraint = (id: string, patch: Partial<LPConstraint>) => {
    setLpConstraints((prev) => prev.map((ct) => (ct.id === id ? { ...ct, ...patch } : ct)));
  };

  const removeLPConstraint = (id: string) => {
    setLpConstraints((prev) => prev.filter((ct) => ct.id !== id));
  };

  const panelCard = darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200';
  const inputClass = `w-16 px-2 py-1 rounded-lg border text-xs font-bold text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
    darkMode ? 'bg-[#0b1220] border-white/[0.12] text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

  const equationTitle = getModeEquationTitle({
    mode,
    linM,
    linC,
    quadA,
    quadB,
    quadC,
    ratP2,
    ratP1,
    ratP0,
    ratQ2,
    ratQ1,
    ratQ0,
    cubA,
    cubB,
    cubC,
    cubD,
    trigFunc,
    trigA,
    trigB,
    trigC,
    trigD,
    trigUnit,
    expKind,
    expA,
    expBase,
    expH,
    expK,
    conicEq: conicInfo.equationText,
    modKind,
    modA,
    modH,
    modK,
    stepFreq,
    pwSplit,
    simKind,
    calcFormula: calculusInfo.curveFormula,
  });

  const supportsPlotDots = mode === 'linear' || mode === 'quadratic' || mode === 'cubic' || mode === 'trig';

  return (
    <div
      ref={wrapperRef}
      className={`w-full max-w-full min-w-0 overflow-x-hidden rounded-2xl border transition-colors ${
        darkMode
          ? 'bg-[#0e1525] border-white/[0.08] text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      } ${isFullscreen ? 'p-4 h-screen overflow-y-auto' : 'p-3 sm:p-5'}`}
    >
      {/* Top 11-Mode Switcher + Utility Controls */}
      <div className="flex flex-wrap items-start justify-between gap-2.5 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div
          className={`flex flex-wrap items-center gap-1 p-1 rounded-xl border flex-1 min-w-0 ${
            darkMode ? 'bg-[#0a101d] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {MODE_TABS.map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSwitchMode(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? darkMode
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-white text-slate-950 shadow-xs'
                    : darkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {supportsPlotDots && (
            <button
              type="button"
              onClick={() => setShowTableDots((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                showTableDots
                  ? darkMode
                    ? 'bg-cyan-500/15 border-cyan-400/45 text-cyan-200'
                    : 'bg-cyan-50 border-cyan-400 text-cyan-900'
                  : darkMode
                  ? 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Plot Points {showTableDots ? 'On' : 'Off'}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode
                ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-200'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Split Workspace: Interactive XY Plane + Controls & Math Readout */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Interactive XY Coordinate Plane */}
        <div className="lg:col-span-8 space-y-2.5 min-w-0">
          <div
            ref={canvasBoxRef}
            className={`relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border ${
              darkMode ? 'border-white/[0.09] bg-[#0b1220]' : 'border-slate-200 bg-[#fafbfc]'
            }`}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => {
                dragRef.current.active = false;
                setHoverMath(null);
              }}
              onWheel={handleWheel}
              className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
            />

            {/* Top-Left Live Equation Header */}
            <div className="pointer-events-none absolute top-3 left-3.5 right-28">
              <div
                className={`text-sm sm:text-base font-black tracking-tight ${
                  darkMode ? 'text-white drop-shadow' : 'text-slate-900'
                }`}
              >
                {equationTitle}
              </div>
              <div className={`text-[11px] font-semibold mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {hoverMath
                  ? `Cursor: (${mode === 'trig' && trigUnit === 'deg' ? `${fmtNum(hoverMath.x)}°` : fmtNum(hoverMath.x)}, ${fmtNum(hoverMath.y)}) · Drag to pan · Scroll to zoom`
                  : mode === 'lp'
                  ? 'Shaded/hatched = Unwanted region · Clear white area = Feasible Region (R)'
                  : 'Drag to pan · Scroll or use + / − to zoom · Hover curve to read coordinates'}
              </div>
            </div>

            {/* Bottom-Right Zoom & Reset Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPxPerUnit((p) => Math.min(140, p * 1.25))}
                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-[#0f172a]/90 hover:bg-[#1e293b] text-slate-200 border-white/10'
                    : 'bg-white/95 hover:bg-white text-slate-800 border-slate-300'
                }`}
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPxPerUnit((p) => Math.max(12, p * 0.8))}
                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-[#0f172a]/90 hover:bg-[#1e293b] text-slate-200 border-white/10'
                    : 'bg-white/95 hover:bg-white text-slate-800 border-slate-300'
                }`}
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => resetViewportForMode(mode)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors inline-flex items-center gap-1 ${
                  darkMode
                    ? 'bg-[#0f172a]/90 hover:bg-[#1e293b] text-amber-300 border-amber-400/30'
                    : 'bg-white/95 hover:bg-white text-amber-700 border-amber-300'
                }`}
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* Bottom Summary Strips: Original 4 Modes */}
          {(mode === 'linear' || mode === 'quadratic') && (
            <div className={`rounded-2xl border p-3.5 ${panelCard}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  Table of Values (for Graph Paper Sketching)
                </span>
                <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {mode === 'linear' ? 'Choose 2–3 clean points & rule a straight line' : 'Centered around vertex'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse tabular-nums">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="py-1.5 px-2 font-black text-left">x</th>
                      {(mode === 'linear' ? linearInfo.table : quadraticInfo.table).map((pt) => (
                        <th key={pt.x} className="py-1.5 px-2 font-bold">{pt.x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1.5 px-2 font-black text-left text-amber-500">y</td>
                      {(mode === 'linear' ? linearInfo.table : quadraticInfo.table).map((pt) => (
                        <td key={pt.x} className="py-1.5 px-2 font-extrabold">{fmtNum(pt.y)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {mode === 'lp' && (
            <div className={`rounded-2xl border p-3.5 ${panelCard}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  Feasible Region Corner Points &amp; Objective Table
                </span>
                <span className={`text-[11px] font-bold ${lpInfo.isEmpty ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {lpInfo.isEmpty
                    ? 'Empty Feasible Region (No solution)'
                    : lpInfo.isBounded
                    ? `Bounded Region · ${lpInfo.corners.length} Corner Points`
                    : `Unbounded Region · ${lpInfo.corners.length} Finite Corner Points`}
                </span>
              </div>
              {lpInfo.corners.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse tabular-nums">
                    <thead>
                      <tr className={`border-b text-left ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                        <th className="py-1.5 pr-3">Vertex</th>
                        <th className="py-1.5 pr-3">Coordinates (x, y)</th>
                        <th className="py-1.5 pr-3">Z = {formatLinearExpr(lpObjP, lpObjQ)}</th>
                        <th className="py-1.5 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lpInfo.corners.map((cp) => {
                        const isOpt = lpInfo.optimal?.label === cp.label;
                        return (
                          <tr
                            key={cp.label}
                            className={`border-b last:border-0 ${
                              darkMode ? 'border-white/[0.06]' : 'border-slate-200/70'
                            } ${isOpt ? (darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') : ''}`}
                          >
                            <td className="py-1.5 pr-3 font-black">{cp.label}</td>
                            <td className="py-1.5 pr-3 font-mono font-bold">({fmtNum(cp.x)}, {fmtNum(cp.y)})</td>
                            <td className="py-1.5 pr-3 font-black text-amber-500">{fmtNum(cp.z)}</td>
                            <td className="py-1.5 text-right font-bold text-emerald-500">
                              {isOpt ? (lpObjGoal === 'max' ? '★ Maximum' : '★ Minimum') : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Adjust constraints so their wanted regions overlap to reveal the unshaded feasible region.
                </p>
              )}
            </div>
          )}

          {mode === 'rational' && (
            <div className={`rounded-2xl border p-3.5 space-y-2 ${panelCard}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider">Asymptotes &amp; Key Features</span>
                <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Dashed lines show boundaries the curve approaches
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-rose-500">Vertical Asymptote (VA)</span>
                  <span className="font-mono font-extrabold">
                    {rationalInfo.verticalAsymptotes.length > 0
                      ? rationalInfo.verticalAsymptotes.map((v) => `x = ${fmtNum(v)}`).join(', ')
                      : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-emerald-500">Horizontal Asymptote (HA)</span>
                  <span className="font-mono font-extrabold">
                    {rationalInfo.horizontalAsymptote !== null
                      ? `y = ${fmtNum(rationalInfo.horizontalAsymptote)}`
                      : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-violet-500">Oblique / Slant Asymptote</span>
                  <span className="font-mono font-extrabold">
                    {rationalInfo.obliqueAsymptote
                      ? `y = ${formatPoly2(0, rationalInfo.obliqueAsymptote.m, rationalInfo.obliqueAsymptote.b)}`
                      : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-500">Removable Holes</span>
                  <span className="font-mono font-extrabold">
                    {rationalInfo.holes.length > 0
                      ? rationalInfo.holes.map((h) => `(${fmtNum(h.x)}, ${fmtNum(h.y)})`).join(', ')
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Summary Strips: New 7 Modes */}
          <GraphSketcherNewBottomStrip
            mode={mode}
            darkMode={darkMode}
            panelCard={panelCard}
            cubicInfo={cubicInfo}
            trigInfo={trigInfo}
            expLogInfo={expLogInfo}
            modulusInfo={modulusInfo}
            simultaneousInfo={simultaneousInfo}
            calculusInfo={calculusInfo}
            conicInfo={conicInfo}
          />
        </div>

        {/* RIGHT: Mode Controls & Live Mathematical Properties */}
        <div className="lg:col-span-4 space-y-3 min-w-0">
          {/* ============ MODE 1: STRAIGHT LINE ============ */}
          {mode === 'linear' && (
            <>
              <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">Straight Line (y = mx + c)</span>
                  <button
                    type="button"
                    onClick={() => { setLinM(2); setLinC(-1); }}
                    className={`text-[11px] font-bold cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Gradient (m)</span>
                    <input type="number" step={0.5} value={linM} onChange={(e) => setLinM(Number(e.target.value) || 0)} className={inputClass} />
                  </div>
                  <input type="range" min={-6} max={6} step={0.25} value={Math.max(-6, Math.min(6, linM))} onChange={(e) => setLinM(Number(e.target.value))} className="w-full accent-sky-500 cursor-pointer h-1.5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>y-Intercept (c)</span>
                    <input type="number" step={0.5} value={linC} onChange={(e) => setLinC(Number(e.target.value) || 0)} className={inputClass} />
                  </div>
                  <input type="range" min={-8} max={8} step={0.5} value={Math.max(-8, Math.min(8, linC))} onChange={(e) => setLinC(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer h-1.5" />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSlopeTri((v) => !v)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      showSlopeTri
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-500'
                        : darkMode
                        ? 'border-white/10 text-slate-400'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    Rise/Run Triangle {showSlopeTri ? 'On' : 'Off'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSecondLine((v) => !v)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      showSecondLine
                        ? 'bg-pink-500/15 border-pink-500/50 text-pink-500'
                        : darkMode
                        ? 'border-white/10 text-slate-400'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    Compare Line L₂ {showSecondLine ? 'On' : 'Off'}
                  </button>
                </div>

                {showSecondLine && (
                  <div className="pt-2.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-pink-500">
                      Line L₂ (y = m₂x + c₂)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center justify-between gap-1">
                        <span>m₂</span>
                        <input type="number" step={0.5} value={linM2} onChange={(e) => setLinM2(Number(e.target.value) || 0)} className={inputClass} />
                      </label>
                      <label className="flex items-center justify-between gap-1">
                        <span>c₂</span>
                        <input type="number" step={0.5} value={linC2} onChange={(e) => setLinC2(Number(e.target.value) || 0)} className={inputClass} />
                      </label>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setLinM2(linM); setLinC2(linC + 3); }}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${darkMode ? 'border-white/10 text-slate-300' : 'border-slate-300 text-slate-700'}`}
                      >
                        Make Parallel
                      </button>
                      {Math.abs(linM) > EPS && (
                        <button
                          type="button"
                          onClick={() => setLinM2(Number((-1 / linM).toFixed(2)))}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold border cursor-pointer ${darkMode ? 'border-white/10 text-slate-300' : 'border-slate-300 text-slate-700'}`}
                        >
                          Make Perpendicular
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
                <div className="font-black uppercase tracking-wider text-sky-500">Line Properties</div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Slope-Intercept Form</span>
                  <span className="font-mono font-bold">y = {formatPoly2(0, linM, linC)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>y-Intercept</span>
                  <span className="font-mono font-bold text-amber-500">(0, {fmtNum(linC)})</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>x-Intercept</span>
                  <span className="font-mono font-bold text-emerald-500">
                    {linearInfo.xInt !== null ? `(${fmtNum(linearInfo.xInt)}, 0)` : 'None (horizontal)'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Angle with x-axis</span>
                  <span className="font-bold tabular-nums">{linearInfo.angleDeg.toFixed(1)}°</span>
                </div>
                {showSecondLine && (
                  <div className="pt-1.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-1">
                    <div className="font-bold text-pink-500">{linearInfo.relation}</div>
                    {linearInfo.intersection && (
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Intersection Point</span>
                        <span className="font-mono font-extrabold text-emerald-500">
                          ({fmtNum(linearInfo.intersection.x)}, {fmtNum(linearInfo.intersection.y)})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============ MODE 2: QUADRATIC ============ */}
          {mode === 'quadratic' && (
            <>
              <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">Quadratic (y = ax² + bx + c)</span>
                  <button
                    type="button"
                    onClick={() => { setQuadA(1); setQuadB(-2); setQuadC(-3); }}
                    className={`text-[11px] font-bold cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Reset
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    { label: '2 Roots', a: 1, b: -2, c: -3 },
                    { label: 'Max Vertex', a: -1, b: 4, c: 0 },
                    { label: 'Double Root', a: 1, b: -4, c: 4 },
                    { label: 'No Real Roots', a: 1, b: 0, c: 2 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setQuadA(p.a); setQuadB(p.b); setQuadC(p.c); }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        darkMode
                          ? 'bg-[#0b1220] border-white/10 text-slate-300 hover:text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {[
                  { label: 'Coefficient a', val: quadA, set: setQuadA, min: -4, max: 4, step: 0.25 },
                  { label: 'Coefficient b', val: quadB, set: setQuadB, min: -8, max: 8, step: 0.5 },
                  { label: 'Constant c', val: quadC, set: setQuadC, min: -8, max: 8, step: 0.5 },
                ].map((ctrl) => (
                  <div key={ctrl.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{ctrl.label}</span>
                      <input type="number" step={ctrl.step} value={ctrl.val} onChange={(e) => ctrl.set(Number(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={Math.max(ctrl.min, Math.min(ctrl.max, ctrl.val))} onChange={(e) => ctrl.set(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer h-1.5" />
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
                <div className="font-black uppercase tracking-wider text-amber-500">Parabola Characteristics</div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Shape</span>
                  <span className="font-bold">{quadraticInfo.opens}</span>
                </div>
                {!quadraticInfo.isLinear && (
                  <>
                    <div className="flex justify-between gap-2">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Turning Point (Vertex)</span>
                      <span className="font-mono font-extrabold text-rose-500">
                        ({fmtNum(quadraticInfo.vertex.x)}, {fmtNum(quadraticInfo.vertex.y)})
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Axis of Symmetry</span>
                      <span className="font-mono font-bold text-sky-500">x = {fmtNum(quadraticInfo.vertex.x)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Discriminant (b² − 4ac)</span>
                      <span className="font-bold tabular-nums">{fmtNum(quadraticInfo.disc)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>x-Intercepts (Roots)</span>
                  <span className="font-mono font-extrabold text-emerald-500">
                    {quadraticInfo.roots.length > 0 ? quadraticInfo.roots.map((r) => fmtNum(r)).join(', ') : 'No real roots'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>y-Intercept</span>
                  <span className="font-mono font-bold text-sky-400">(0, {fmtNum(quadC)})</span>
                </div>
              </div>
            </>
          )}

          {/* ============ MODE 3: LINEAR PROGRAMMING ============ */}
          {mode === 'lp' && (
            <>
              <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">LP Presets</span>
                  <span className="text-[11px] font-bold text-rose-500">Unwanted Shaded</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LP_PRESETS.map((pr) => (
                    <button
                      key={pr.name}
                      type="button"
                      onClick={() => {
                        setLpConstraints(pr.constraints.map((c) => ({ ...c })));
                        setLpObjP(pr.objP);
                        setLpObjQ(pr.objQ);
                        setLpObjGoal(pr.objGoal);
                        setViewCenter(pr.viewCenter);
                        setPxPerUnit(pr.viewScale);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        darkMode
                          ? 'bg-[#0b1220] border-white/10 text-slate-300 hover:text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {pr.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black uppercase tracking-wider">Constraints (ax + by ⋚ c)</span>
                  <button
                    type="button"
                    onClick={addLPConstraint}
                    disabled={lpConstraints.length >= 7}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white text-[11px] font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                  {lpConstraints.map((ct, idx) => {
                    const color = CONSTRAINT_COLORS[idx % CONSTRAINT_COLORS.length];
                    return (
                      <div
                        key={ct.id}
                        className={`flex items-center gap-1 p-1.5 rounded-xl border text-xs ${
                          darkMode ? 'bg-[#0b1220] border-white/[0.08]' : 'bg-white border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={ct.enabled}
                          onChange={(e) => updateLPConstraint(ct.id, { enabled: e.target.checked })}
                          className="accent-sky-500 cursor-pointer shrink-0"
                          aria-label={`Toggle constraint ${idx + 1}`}
                        />
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <input
                          type="number"
                          step={1}
                          value={ct.a}
                          onChange={(e) => updateLPConstraint(ct.id, { a: Number(e.target.value) || 0 })}
                          className="w-10 px-1 py-0.5 rounded border text-center font-bold bg-transparent border-slate-300 dark:border-white/15"
                          aria-label="Coefficient a"
                        />
                        <span className="font-bold">x +</span>
                        <input
                          type="number"
                          step={1}
                          value={ct.b}
                          onChange={(e) => updateLPConstraint(ct.id, { b: Number(e.target.value) || 0 })}
                          className="w-10 px-1 py-0.5 rounded border text-center font-bold bg-transparent border-slate-300 dark:border-white/15"
                          aria-label="Coefficient b"
                        />
                        <span className="font-bold">y</span>
                        <select
                          value={ct.op}
                          onChange={(e) => updateLPConstraint(ct.id, { op: e.target.value as InequalityOp })}
                          className={`px-1 py-0.5 rounded border font-extrabold cursor-pointer ${
                            darkMode ? 'bg-[#151e32] border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="<=">≤</option>
                          <option value=">=">≥</option>
                          <option value="<">&lt;</option>
                          <option value=">">&gt;</option>
                        </select>
                        <input
                          type="number"
                          step={1}
                          value={ct.c}
                          onChange={(e) => updateLPConstraint(ct.id, { c: Number(e.target.value) || 0 })}
                          className="w-11 px-1 py-0.5 rounded border text-center font-bold bg-transparent border-slate-300 dark:border-white/15"
                          aria-label="Constant c"
                        />
                        {lpConstraints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLPConstraint(ct.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer ml-auto"
                            title="Delete constraint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className={`text-[11px] leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Solid line = ≤ / ≥ (included) · Dashed line = &lt; / &gt; (excluded). Hatched shading marks each
                  unwanted region so the valid feasible region stays clear and unshaded.
                </p>
              </div>

              <div className={`rounded-2xl border p-3.5 space-y-2.5 text-xs ${panelCard}`}>
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-wider text-emerald-500">
                    Objective Function (Z = px + qy)
                  </span>
                  <div className="flex items-center gap-1">
                    {(['max', 'min'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setLpObjGoal(g)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase cursor-pointer border ${
                          lpObjGoal === g
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : darkMode
                            ? 'border-white/10 text-slate-400'
                            : 'border-slate-300 text-slate-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold">Z =</span>
                  <input type="number" step={1} value={lpObjP} onChange={(e) => setLpObjP(Number(e.target.value) || 0)} className={inputClass} />
                  <span className="font-bold">x +</span>
                  <input type="number" step={1} value={lpObjQ} onChange={(e) => setLpObjQ(Number(e.target.value) || 0)} className={inputClass} />
                  <span className="font-bold">y</span>
                </div>

                <label className="flex items-center gap-2 text-[11px] font-semibold cursor-pointer">
                  <input type="checkbox" checked={showObjectiveLine} onChange={(e) => setShowObjectiveLine(e.target.checked)} className="accent-emerald-500" />
                  <span>Show optimal objective line (dashed green)</span>
                </label>

                {lpInfo.optimal && (
                  <div className="pt-1.5 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                      Optimal {lpObjGoal === 'max' ? 'Maximum' : 'Minimum'} at {lpInfo.optimal.label}
                    </span>
                    <span className="font-black text-emerald-500 tabular-nums">Z = {fmtNum(lpInfo.optimal.z)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============ MODE 4: RATIONAL FUNCTION ============ */}
          {mode === 'rational' && (
            <>
              <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
                <div className="text-xs font-black uppercase tracking-wider">Rational Function Presets</div>
                <div className="flex flex-wrap gap-1.5">
                  {RATIONAL_PRESETS.map((pr) => (
                    <button
                      key={pr.name}
                      type="button"
                      onClick={() => {
                        setRatP2(pr.p2); setRatP1(pr.p1); setRatP0(pr.p0);
                        setRatQ2(pr.q2); setRatQ1(pr.q1); setRatQ0(pr.q0);
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        darkMode
                          ? 'bg-[#0b1220] border-white/10 text-slate-300 hover:text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {pr.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-sky-500">
                    Numerator P(x) = p₂x² + p₁x + p₀
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <label className="flex flex-col gap-0.5"><span className="text-[10px]">p₂ (x²)</span><input type="number" step={1} value={ratP2} onChange={(e) => setRatP2(Number(e.target.value) || 0)} className={inputClass} /></label>
                    <label className="flex flex-col gap-0.5"><span className="text-[10px]">p₁ (x)</span><input type="number" step={1} value={ratP1} onChange={(e) => setRatP1(Number(e.target.value) || 0)} className={inputClass} /></label>
                    <label className="flex flex-col gap-0.5"><span className="text-[10px]">p₀ (const)</span><input type="number" step={1} value={ratP0} onChange={(e) => setRatP0(Number(e.target.value) || 0)} className={inputClass} /></label>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-white/[0.08]">
                  <div className="text-[11px] font-black uppercase tracking-wider text-rose-500">
                    Denominator Q(x) = q₂x² + q₁x + q₀
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <label className="flex flex-col gap-0.5"><span className="text-[10px]">q₂ (x²)</span><input type="number" step={1} value={ratQ2} onChange={(e) => setRatQ2(Number(e.target.value) || 0)} className={inputClass} /></label>
                    <label className="flex flex-col gap-0.5"><span className="text-[10px]">q₁ (x)</span><input type="number" step={1} value={ratQ1} onChange={(e) => setRatQ1(Number(e.target.value) || 0)} className={inputClass} /></label>
                    <label className="flex flex-col gap-0.5"><span className="text-[10px]">q₀ (const)</span><input type="number" step={1} value={ratQ0} onChange={(e) => setRatQ0(Number(e.target.value) || 0)} className={inputClass} /></label>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
                <div className="font-black uppercase tracking-wider text-sky-500">Domain &amp; Intercepts</div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Domain</span>
                  <span className="font-mono font-bold text-right">{rationalInfo.domainText}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>x-Intercepts</span>
                  <span className="font-mono font-bold text-emerald-500">
                    {rationalInfo.xIntercepts.length > 0
                      ? rationalInfo.xIntercepts.map((v) => `(${fmtNum(v)}, 0)`).join(', ')
                      : 'None'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>y-Intercept</span>
                  <span className="font-mono font-bold text-amber-500">
                    {rationalInfo.yIntercept !== null ? `(0, ${fmtNum(rationalInfo.yIntercept)})` : 'Undefined'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ============ MODES 5–11: NEW GRAPH CONTROLS ============ */}
          <GraphSketcherNewRightControls
            mode={mode}
            darkMode={darkMode}
            panelCard={panelCard}
            inputClass={inputClass}
            cubA={cubA} setCubA={setCubA}
            cubB={cubB} setCubB={setCubB}
            cubC={cubC} setCubC={setCubC}
            cubD={cubD} setCubD={setCubD}
            cubicInfo={cubicInfo}
            trigFunc={trigFunc} setTrigFunc={setTrigFunc}
            trigUnit={trigUnit} onChangeTrigUnit={handleChangeTrigUnit}
            trigA={trigA} setTrigA={setTrigA}
            trigB={trigB} setTrigB={setTrigB}
            trigC={trigC} setTrigC={setTrigC}
            trigD={trigD} setTrigD={setTrigD}
            trigInfo={trigInfo}
            expKind={expKind} setExpKind={setExpKind}
            expA={expA} setExpA={setExpA}
            expBase={expBase} setExpBase={setExpBase}
            expH={expH} setExpH={setExpH}
            expK={expK} setExpK={setExpK}
            expLogInfo={expLogInfo}
            conicKind={conicKind} setConicKind={setConicKind}
            conicH={conicH} setConicH={setConicH}
            conicK={conicK} setConicK={setConicK}
            conicA={conicA} setConicA={setConicA}
            conicB={conicB} setConicB={setConicB}
            circleTanDeg={circleTanDeg} setCircleTanDeg={setCircleTanDeg}
            showCircleTangent={showCircleTangent} setShowCircleTangent={setShowCircleTangent}
            hyperbolaAxis={hyperbolaAxis} setHyperbolaAxis={setHyperbolaAxis}
            conicInfo={conicInfo}
            modKind={modKind} setModKind={setModKind}
            modA={modA} setModA={setModA}
            modH={modH} setModH={setModH}
            modK={modK} setModK={setModK}
            stepFreq={stepFreq} setStepFreq={setStepFreq}
            pwSplit={pwSplit} setPwSplit={setPwSplit}
            pwLeftM={pwLeftM} setPwLeftM={setPwLeftM}
            pwLeftC={pwLeftC} setPwLeftC={setPwLeftC}
            pwRightM={pwRightM} setPwRightM={setPwRightM}
            pwRightC={pwRightC} setPwRightC={setPwRightC}
            modulusInfo={modulusInfo}
            simKind={simKind} setSimKind={setSimKind}
            simQa={simQa} setSimQa={setSimQa}
            simQb={simQb} setSimQb={setSimQb}
            simQc={simQc} setSimQc={setSimQc}
            simLm={simLm} setSimLm={setSimLm}
            simLd={simLd} setSimLd={setSimLd}
            simCh={simCh} setSimCh={setSimCh}
            simCk={simCk} setSimCk={setSimCk}
            simCr={simCr} setSimCr={setSimCr}
            simQ2a={simQ2a} setSimQ2a={setSimQ2a}
            simQ2b={simQ2b} setSimQ2b={setSimQ2b}
            simQ2c={simQ2c} setSimQ2c={setSimQ2c}
            simultaneousInfo={simultaneousInfo}
            calcCurve={calcCurve} setCalcCurve={setCalcCurve}
            calcA={calcA} setCalcA={setCalcA}
            calcB={calcB} setCalcB={setCalcB}
            calcC={calcC} setCalcC={setCalcC}
            calcX0={calcX0} setCalcX0={setCalcX0}
            calcIntA={calcIntA} setCalcIntA={setCalcIntA}
            calcIntB={calcIntB} setCalcIntB={setCalcIntB}
            showTangent={showTangent} setShowTangent={setShowTangent}
            showNormal={showNormal} setShowNormal={setShowNormal}
            showIntegral={showIntegral} setShowIntegral={setShowIntegral}
            calculusInfo={calculusInfo}
          />
        </div>
      </div>
    </div>
  );
};
