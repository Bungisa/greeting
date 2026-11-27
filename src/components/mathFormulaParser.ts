/**
 * Natural math formula parser, LaTeX converter, and coefficient extractor
 * for direct formula writing across all mathematics simulations.
 */

export interface ParsedCustomFormula {
  raw: string;
  cleanExpr: string;
  isPolar: boolean;
  latex: string;
  evaluate: ((v: number) => number) | null;
  error?: string;
}

/**
 * Converts a natural user-typed mathematical formula (e.g. "y = (2x^2 - 3x + 1)/(x - 2)" or "r = 4cos(3theta)")
 * into clean LaTeX suitable for MathJax rendering.
 */
export function naturalMathToLatex(input: string, defaultPrefix = 'y = '): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';

  let prefix = '';
  let expr = trimmed;

  const eqMatch = trimmed.match(/^([yYrR]|f\s*\(\s*x\s*\)|r\s*\(\s*(?:theta|θ)\s*\))\s*=\s*(.+)$/);
  if (eqMatch) {
    const lhs = eqMatch[1].replace(/theta/gi, '\\theta').replace(/θ/g, '\\theta');
    prefix = `${lhs} = `;
    expr = eqMatch[2].trim();
  } else if (defaultPrefix) {
    prefix = defaultPrefix;
  }

  let tex = expr;

  // Replace unicode superscripts
  tex = tex
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/√\s*\(([^()]+)\)/g, '\\sqrt{$1}')
    .replace(/√\s*([a-zA-Z0-9.]+)/g, '\\sqrt{$1}')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\ne ')
    .replace(/±/g, '\\pm ');

  // Convert simple top-level or parenthesized fractions: (A)/(B) -> \frac{A}{B}
  tex = tex.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
  tex = tex.replace(/\(([^()]+)\)\s*\/\s*([a-zA-Z0-9.^]+)/g, '\\frac{$1}{$2}');
  tex = tex.replace(/([a-zA-Z0-9.^]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
  tex = tex.replace(/\b([0-9]+|[a-zA-Z])\s*\/\s*([0-9]+|[a-zA-Z])\b/g, '\\frac{$1}{$2}');

  // Absolute value |...| -> \left|...\right|
  tex = tex.replace(/\|([^|]+)\|/g, '\\left|$1\\right|');
  tex = tex.replace(/\babs\s*\(([^()]+)\)/gi, '\\left|$1\\right|');

  // Square root and n-th roots
  tex = tex.replace(/\bsqrt\s*\(([^()]+)\)/gi, '\\sqrt{$1}');
  tex = tex.replace(/\bcbrt\s*\(([^()]+)\)/gi, '\\sqrt[3]{$1}');

  // Floor and ceil
  tex = tex.replace(/\bfloor\s*\(([^()]+)\)/gi, '\\lfloor $1 \\rfloor');
  tex = tex.replace(/\bceil\s*\(([^()]+)\)/gi, '\\lceil $1 \\rceil');

  // Exponents with parentheses: ^(2x+1) -> ^{2x+1}
  tex = tex.replace(/\^\s*\(([^()]+)\)/g, '^{$1}');
  // Exponents with multi-char numbers/variables: ^-2x or ^12 -> ^{-2x}
  tex = tex.replace(/\^\s*(-?[0-9]+(?:\.[0-9]+)?[a-zA-Z]?)/g, '^{$1}');

  // Standard functions & Greek symbols
  tex = tex
    .replace(/\btheta\b/gi, '\\theta ')
    .replace(/θ/g, '\\theta ')
    .replace(/\bpi\b/gi, '\\pi ')
    .replace(/π/g, '\\pi ')
    .replace(/\barcsin\b/gi, '\\arcsin')
    .replace(/\barccos\b/gi, '\\arccos')
    .replace(/\barctan\b/gi, '\\arctan')
    .replace(/\bsin\b/gi, '\\sin')
    .replace(/\bcos\b/gi, '\\cos')
    .replace(/\btan\b/gi, '\\tan')
    .replace(/\bsec\b/gi, '\\sec')
    .replace(/\bcsc\b/gi, '\\csc')
    .replace(/\bcot\b/gi, '\\cot')
    .replace(/\bln\b/gi, '\\ln')
    .replace(/\blog\b/gi, '\\log')
    .replace(/\*/g, ' \\cdot ');

  return `${prefix}${tex}`;
}

/**
 * Compiles a user-written mathematical expression into a safe JavaScript evaluator function f(v),
 * where v is x (Cartesian) or theta in radians (Polar).
 */
export function parseCustomFormula(input: string, degMode = false): ParsedCustomFormula {
  const raw = (input || '').trim();
  if (!raw) {
    return {
      raw,
      cleanExpr: '',
      isPolar: false,
      latex: '',
      evaluate: null,
      error: 'Enter a formula',
    };
  }

  let isPolar = false;
  let expr = raw;

  // Detect lhs like y = ..., f(x) = ..., r = ...
  const lhsMatch = raw.match(/^([yYrR]|f\s*\(\s*x\s*\)|r\s*\(\s*(?:theta|θ)\s*\))\s*=\s*(.+)$/);
  if (lhsMatch) {
    const lhs = lhsMatch[1].toLowerCase();
    if (lhs.startsWith('r')) {
      isPolar = true;
    }
    expr = lhsMatch[2].trim();
  } else if (/\btheta\b|θ/i.test(raw)) {
    isPolar = true;
  }

  const latex = naturalMathToLatex(raw, isPolar ? 'r = ' : 'y = ');

  try {
    let js = expr;

    // Normalize unicode symbols
    js = js
      .replace(/−/g, '-')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/π/g, '(Math.PI)')
      .replace(/θ/g, 'theta');

    // Convert |...| to abs(...)
    // Handle simple nested or single |...| pairs
    let prev = '';
    while (prev !== js && /\|([^|]+)\|/.test(js)) {
      prev = js;
      js = js.replace(/\|([^|]+)\|/g, 'abs($1)');
    }

    // Replace √(...) or √x
    js = js
      .replace(/√\s*\(([^()]+)\)/g, 'sqrt($1)')
      .replace(/√\s*([a-zA-Z0-9.]+)/g, 'sqrt($1)');

    // Protect known function names with placeholders before implicit multiplication
    const fnNames = [
      'arcsin',
      'arccos',
      'arctan',
      'asin',
      'acos',
      'atan',
      'sinh',
      'cosh',
      'tanh',
      'sin',
      'cos',
      'tan',
      'sec',
      'csc',
      'cot',
      'sqrt',
      'cbrt',
      'abs',
      'ln',
      'log10',
      'log',
      'exp',
      'floor',
      'ceil',
      'round',
    ];

    // Replace "theta" with single variable symbol `t` and `x` with `x`
    js = js.replace(/\btheta\b/gi, 't');
    js = js.replace(/\bpi\b/gi, 'P');

    const tokens: string[] = [];
    let tokenized = js;
    fnNames.forEach((fn, idx) => {
      const reg = new RegExp(`\\b${fn}\\b`, 'gi');
      tokenized = tokenized.replace(reg, () => {
        const key = `__FN${idx}__`;
        tokens[idx] = fn.toLowerCase();
        return key;
      });
    });

    // Insert implicit multiplication:
    // 1. Number followed by variable, constant, opening paren, or function token: 2x -> 2*x, 2(x+1) -> 2*(x+1), 2sin(x) -> 2*sin(x)
    tokenized = tokenized.replace(/(\d(?:\.\d+)?)\s*(?=[xtPe(__])/gi, '$1*');
    // 2. Variable or closing paren followed by variable, constant, opening paren, or function token: (x+1)(x-1) -> (x+1)*(x-1), x(x+1) -> x*(x+1), x sin(x) -> x*sin(x)
    tokenized = tokenized.replace(/([xtPe)])\s*(?=[xtPe(__])/gi, '$1*');
    // 3. Variable/closing paren followed by digit (only when not preceded by ^)
    tokenized = tokenized.replace(/([)])\s*(\d)/g, '$1*$2');

    // Convert power ^ to **
    tokenized = tokenized.replace(/\^/g, '**');

    // Restore function tokens to helper calls
    fnNames.forEach((fn, idx) => {
      const key = `__FN${idx}__`;
      tokenized = tokenized.replace(new RegExp(key, 'g'), `_fn.${fn.toLowerCase()}`);
    });

    // Replace constants P -> Math.PI, e -> Math.E
    tokenized = tokenized.replace(/\bP\b/g, '(Math.PI)');
    tokenized = tokenized.replace(/\be\b/g, '(Math.E)');

    // Validate only safe characters remain
    const strippedCheck = tokenized.replace(/_fn\.[a-z0-9]+|Math\.PI|Math\.E/g, '');
    if (/[^0-9xt+\-*/().\s,]/.test(strippedCheck)) {
      return {
        raw,
        cleanExpr: expr,
        isPolar,
        latex,
        evaluate: null,
        error: 'Unsupported symbol in formula',
      };
    }

    const toAngle = degMode && !isPolar ? (v: number) => (v * Math.PI) / 180 : (v: number) => v;
    const _fn: Record<string, (v: number) => number> = {
      sin: (v) => Math.sin(toAngle(v)),
      cos: (v) => Math.cos(toAngle(v)),
      tan: (v) => Math.tan(toAngle(v)),
      sec: (v) => 1 / Math.cos(toAngle(v)),
      csc: (v) => 1 / Math.sin(toAngle(v)),
      cot: (v) => 1 / Math.tan(toAngle(v)),
      asin: (v) => Math.asin(v),
      acos: (v) => Math.acos(v),
      atan: (v) => Math.atan(v),
      arcsin: (v) => Math.asin(v),
      arccos: (v) => Math.acos(v),
      arctan: (v) => Math.atan(v),
      sinh: (v) => Math.sinh(v),
      cosh: (v) => Math.cosh(v),
      tanh: (v) => Math.tanh(v),
      sqrt: (v) => Math.sqrt(v),
      cbrt: (v) => Math.cbrt(v),
      abs: (v) => Math.abs(v),
      ln: (v) => Math.log(v),
      log: (v) => Math.log10(v),
      log10: (v) => Math.log10(v),
      exp: (v) => Math.exp(v),
      floor: (v) => Math.floor(v),
      ceil: (v) => Math.ceil(v),
      round: (v) => Math.round(v),
    };

    // Unary minus before exponentiation in JS throws SyntaxError (e.g. -x**2).
    // Wrap simple variable/number powers: x**2 -> (x**2)
    const safeJs = tokenized.replace(
      /([xt]|\d+(?:\.\d+)?|\([^()]+\))\s*\*\*\s*(-?\d+(?:\.\d+)?|[xt]|\([^()]+\))/g,
      '($1**$2)'
    );

    const compiled = new Function('_fn', 'x', 't', `"use strict"; return (${safeJs});`) as (
      fnObj: Record<string, (v: number) => number>,
      x: number,
      t: number
    ) => number;

    // Test evaluation at a couple of points
    const testVal = compiled(_fn, 1.23, 0.5);
    if (typeof testVal !== 'number') {
      throw new Error('Result is not a number');
    }

    const evaluate = (v: number): number => {
      try {
        const res = compiled(_fn, v, v);
        return typeof res === 'number' ? res : NaN;
      } catch {
        return NaN;
      }
    };

    return {
      raw,
      cleanExpr: expr,
      isPolar,
      latex,
      evaluate,
    };
  } catch {
    return {
      raw,
      cleanExpr: expr,
      isPolar,
      latex,
      evaluate: null,
      error: 'Check formula syntax (e.g. x^2 - 2x - 3)',
    };
  }
}

/**
 * Extracts quadratic coefficients (a, b, c) from a written formula like "2x^2 - 3x + 1" or "y = -x² + 4"
 * by evaluating f(x) at x = 0, 1, -1 and verifying f(2).
 */
export function parseQuadraticCoefficients(
  input: string
): { a: number; b: number; c: number } | null {
  const parsed = parseCustomFormula(input);
  if (!parsed.evaluate || parsed.isPolar) return null;
  const f = parsed.evaluate;
  const f0 = f(0);
  const f1 = f(1);
  const fm1 = f(-1);
  const f2 = f(2);
  if (![f0, f1, fm1, f2].every((v) => Number.isFinite(v))) return null;

  const c = f0;
  const a = (f1 + fm1) / 2 - c;
  const b = (f1 - fm1) / 2;

  // Verify it is actually quadratic/linear at x = 2 and x = 3
  const expected2 = a * 4 + b * 2 + c;
  const f3 = f(3);
  const expected3 = a * 9 + b * 3 + c;
  if (Math.abs(f2 - expected2) > 1e-4 || Math.abs(f3 - expected3) > 1e-4) {
    return null;
  }

  return {
    a: Math.round(a * 100) / 100,
    b: Math.round(b * 100) / 100,
    c: Math.round(c * 100) / 100,
  };
}

/**
 * Extracts linear coefficients (m, c) from a written formula like "y = 2x - 3"
 */
export function parseLinearCoefficients(
  input: string
): { m: number; c: number } | null {
  const quad = parseQuadraticCoefficients(input);
  if (!quad || Math.abs(quad.a) > 1e-4) return null;
  return { m: quad.b, c: quad.c };
}

/**
 * Extracts cubic coefficients (a, b, c, d) from a written formula like "x^3 - 3x"
 */
export function parseCubicCoefficients(
  input: string
): { a: number; b: number; c: number; d: number } | null {
  const parsed = parseCustomFormula(input);
  if (!parsed.evaluate || parsed.isPolar) return null;
  const f = parsed.evaluate;
  const f0 = f(0);
  const f1 = f(1);
  const fm1 = f(-1);
  const f2 = f(2);
  const fm2 = f(-2);
  if (![f0, f1, fm1, f2, fm2].every((v) => Number.isFinite(v))) return null;

  const d = f0;
  const b = (f1 + fm1) / 2 - d;
  // f(1) - f(-1) = 2(a + c) => a + c = (f1 - fm1)/2
  const aPlusC = (f1 - fm1) / 2;
  // f(2) = 8a + 4b + 2c + d = 6a + 4b + 2(a+c) + d
  const a = (f2 - 4 * b - 2 * aPlusC - d) / 6;
  const c = aPlusC - a;

  const expectedM2 = a * -8 + b * 4 + c * -2 + d;
  if (Math.abs(fm2 - expectedM2) > 1e-3) return null;

  return {
    a: Math.round(a * 100) / 100,
    b: Math.round(b * 100) / 100,
    c: Math.round(c * 100) / 100,
    d: Math.round(d * 100) / 100,
  };
}

/**
 * Extracts trig wave parameters (amplitude, frequency, fn) from expressions like "1.5 sin(2x)" or "-2cos(0.5theta)"
 */
export function parseTrigWaveFormula(
  input: string
): { fn: 'sin' | 'cos' | 'tan'; a: number; b: number; d: number } | null {
  const clean = (input || '')
    .trim()
    .replace(/^y\s*=\s*/i, '')
    .replace(/\s+/g, '');
  const match = clean.match(
    /^([+-]?\d*(?:\.\d+)?)\*?(sin|cos|tan)\(([+-]?\d*(?:\.\d+)?)\*?(?:x|theta|θ)\)([+-]\d+(?:\.\d+)?)?$/i
  );
  if (!match) return null;
  const aRaw = match[1];
  const fn = match[2].toLowerCase() as 'sin' | 'cos' | 'tan';
  const bRaw = match[3];
  const dRaw = match[4];

  const a =
    aRaw === '' || aRaw === '+'
      ? 1
      : aRaw === '-'
      ? -1
      : parseFloat(aRaw);
  const b =
    bRaw === '' || bRaw === '+'
      ? 1
      : bRaw === '-'
      ? -1
      : parseFloat(bRaw);
  const d = dRaw ? parseFloat(dRaw) : 0;

  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(d)) return null;
  return { fn, a, b, d };
}
