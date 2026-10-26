import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    katex?: {
      renderToString: (
        tex: string,
        options?: {
          displayMode?: boolean;
          throwOnError?: boolean;
          strict?: boolean | string;
          trust?: boolean;
        }
      ) => string;
    };
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      texReset?: () => void;
    };
  }
}

const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
  'ⁿ': 'n',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
  'ₐ': 'a',
  'ₑ': 'e',
  'ᵢ': 'i',
  'ⱼ': 'j',
  'ₖ': 'k',
  'ₙ': 'n',
  'ₘ': 'm',
  'ₓ': 'x',
  'ᵧ': 'y',
};

function convertUnicodeSuperSub(str: string): string {
  let out = str;
  // Convert sequences of unicode superscripts like x² or 10⁻³ or xⁿ⁻¹
  out = out.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ]+)/g, (match) => {
    const converted = Array.from(match)
      .map((ch) => SUPERSCRIPT_MAP[ch] ?? ch)
      .join('');
    return converted.length === 1 ? `^${converted}` : `^{${converted}}`;
  });
  // Convert sequences of unicode subscripts like a₁ or A₁₀ or log₁₀
  out = out.replace(/([₀₁₂₃₄₅₆⁷₈₉ₐₑᵢⱼₖₙₘₓᵧ]+)/g, (match) => {
    const converted = Array.from(match)
      .map((ch) => SUBSCRIPT_MAP[ch] ?? ch)
      .join('');
    return converted.length === 1 ? `_${converted}` : `_{${converted}}`;
  });
  return out;
}

function cleanInnerLatex(tex: string): string {
  let out = convertUnicodeSuperSub(tex);
  out = out
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/±/g, ' \\pm ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/≠/g, ' \\ne ')
    .replace(/≈/g, ' \\approx ')
    .replace(/π/g, '\\pi ')
    .replace(/θ/g, '\\theta ')
    .replace(/α/g, '\\alpha ')
    .replace(/β/g, '\\beta ')
    .replace(/γ/g, '\\gamma ')
    .replace(/λ/g, '\\lambda ')
    .replace(/Δ/g, '\\Delta ')
    .replace(/∩/g, ' \\cap ')
    .replace(/∪/g, ' \\cup ')
    .replace(/→/g, ' \\rightarrow ')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}')
    .replace(/√(\d+[a-zA-Z0-9^_{}]*)/g, '\\sqrt{$1}');
  return out;
}

/**
 * Normalizes plain-text or Unicode mathematical expressions into LaTeX $...$ delimiters
 * while preserving any existing $...$, $$...$$, \(...\), or \[...\] blocks.
 */
export function normalizeMathExpressions(raw: string): string {
  if (!raw) return '';

  // 1. Protect existing LaTeX blocks first
  const mathBlocks: string[] = [];
  const protectedText = raw.replace(
    /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([\s\S]+?\\\))/g,
    (match) => {
      const idx = mathBlocks.length;
      if (match.startsWith('$$') && match.endsWith('$$')) {
        mathBlocks.push(`$$${cleanInnerLatex(match.slice(2, -2))}$$`);
      } else if (match.startsWith('\\[') && match.endsWith('\\]')) {
        mathBlocks.push(`$$${cleanInnerLatex(match.slice(2, -2))}$$`);
      } else if (match.startsWith('\\(') && match.endsWith('\\)')) {
        mathBlocks.push(`$${cleanInnerLatex(match.slice(2, -2))}$`);
      } else {
        mathBlocks.push(`$${cleanInnerLatex(match.slice(1, -1))}$`);
      }
      return `@@PROTECTED_MATH_${idx}@@`;
    }
  );

  const stashMath = (latex: string): string => {
    const idx = mathBlocks.length;
    mathBlocks.push(`$${cleanInnerLatex(latex)}$`);
    return `@@PROTECTED_MATH_${idx}@@`;
  };

  let text = protectedText;

  // 2. Definite & indefinite integrals: e.g. ∫₁³ (3x² + 2x) dx or ∫(3x² + 2x)dx
  text = text.replace(
    /∫([₀₁₂₃₄₅₆₇₈₉0-9a-zA-Z⁻⁺]*)\s*([⁰¹²³⁴⁵⁶⁷⁸⁹0-9a-zA-Z⁻⁺]*)\s*(\([^)]+\)|[a-zA-Z0-9^²³⁴_+\-*/\s]+?)\s*d([xytuv])/g,
    (_m, lower, upper, body, dvar) => {
      const lowClean = convertUnicodeSuperSub(lower || '').replace(/^_/, '');
      const upClean = convertUnicodeSuperSub(upper || '').replace(/^\^/, '');
      const limits =
        lowClean && upClean
          ? `_${lowClean.length > 1 ? `{${lowClean}}` : lowClean}^${upClean.length > 1 ? `{${upClean}}` : upClean}`
          : '';
      return stashMath(`\\int${limits} ${body.trim()} \\, d${dvar}`);
    }
  );

  // 3. Calculus derivatives: d/dx(xⁿ) = nxⁿ⁻¹, d²y/dx², dy/dx, Δy/Δx
  text = text.replace(/\bd\/dx\(([^)]+)\)\s*=\s*([a-zA-Z0-9⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ^_{}\-+]+)/g, (_m, arg, rhs) =>
    stashMath(`\\frac{d}{dx}(${arg}) = ${rhs}`)
  );
  text = text.replace(/\bd²y\/dx²\b/g, () => stashMath('\\frac{d^2y}{dx^2}'));
  text = text.replace(/\bdy\/dx\b/g, () => stashMath('\\frac{dy}{dx}'));
  text = text.replace(/Δy\s*\/\s*Δx/g, () => stashMath('\\frac{\\Delta y}{\\Delta x}'));

  // 4. Square roots: √(8² + 6²), √[(5 - (-1))² + (10 - 2)²], √144
  text = text.replace(/√\[([^\]]+)\]/g, (_m, inner) => stashMath(`\\sqrt{${inner}}`));
  text = text.replace(/√\(([^)]+)\)/g, (_m, inner) => stashMath(`\\sqrt{${inner}}`));
  text = text.replace(/√(\d+(?:\.\d+)?)/g, (_m, num) => stashMath(`\\sqrt{${num}}`));

  // 5. Logarithms: log₁₀(x), log₂(x), log_10(x)
  text = text.replace(
    /\blog([₀₁₂₃₄₅₆₇₈₉ₐₑᵢⱼₖₙₘₓᵧ]+|_\d+|_[a-zA-Z])\s*(\([^)]+\)|[a-zA-Z0-9^²³⁴]+)/g,
    (_m, sub, arg) => {
      const subClean = convertUnicodeSuperSub(sub).replace(/^_/, '');
      const subFormatted = subClean.length === 1 ? `_${subClean}` : `_{${subClean}}`;
      return stashMath(`\\log${subFormatted}${arg}`);
    }
  );

  // 6. Vectors with arrow combining mark: AB⃗, OB⃗, OA⃗
  text = text.replace(/\b([A-Z]{1,2})\u20d7/g, (_m, vec) => stashMath(`\\vec{${vec}}`));

  // 7. Set & Probability expressions: P(A ∩ B), P(A ∪ B), n(A ∪ B), A ∩ B, A ∪ B
  text = text.replace(/\b([Pn])\(([A-Z])\s*([∩∪])\s*([A-Z])\)/g, (_m, fn, a, op, b) =>
    stashMath(`${fn}(${a} ${op === '∩' ? '\\cap' : '\\cup'} ${b})`)
  );

  // 8. Trig & Pi expressions: 2πrh, πr²h, (1/3)πr²h, 2πr, 96π, sin²θ + cos²θ = 1
  text = text.replace(/\(1\/3\)πr²h/g, () => stashMath('\\frac{1}{3}\\pi r^2 h'));
  text = text.replace(/\b2πrh\b/g, () => stashMath('2\\pi r h'));
  text = text.replace(/\bπr²h\b/g, () => stashMath('\\pi r^2 h'));
  text = text.replace(/\b2πr\b/g, () => stashMath('2\\pi r'));
  text = text.replace(/\b(\d+)π\b/g, (_m, n) => stashMath(`${n}\\pi`));
  text = text.replace(/sin²θ\s*\+\s*cos²θ\s*=\s*1/gi, () => stashMath('\\sin^2\\theta + \\cos^2\\theta = 1'));

  // 9. Subscripted/Superscripted tokens & equations (e.g. A₁₀ = 31, S₁₀ = 175, Gₙ = G₁ × r^(n - 1), 12x² - 12x + 5)
  text = text.replace(
    /\b([a-zA-Z0-9]*[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ₀₁₂₃₄₅₆₇₈₉ₐₑᵢⱼₖₙₘₓᵧ]+[a-zA-Z0-9⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ₀₁₂₃₄₅₆₇₈₉ₐₑᵢⱼₖₙₘₓᵧ]*(?:\s*[+\-×÷=]\s*[a-zA-Z0-9⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ₀₁₂₃₄₅₆₇₈₉ₐₑᵢⱼₖₙₘₓᵧ()]+)*)/g,
    (match) => stashMath(match)
  );

  // 10. Exponent expressions like r^(n - 1) or 2^(x + 1)
  text = text.replace(/\b([a-zA-Z0-9]+)\^\(([^)]+)\)/g, (_m, base, exp) =>
    stashMath(`${base}^{${exp}}`)
  );

  // 11. Restore all protected math blocks
  return text.replace(/@@PROTECTED_MATH_(\d+)@@/g, (_m, idxStr) => {
    const idx = Number(idxStr);
    return mathBlocks[idx] ?? _m;
  });
}

function escapeHtmlBasic(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Renders a single LaTeX string to HTML using KaTeX if available, or returns delimited LaTeX for MathJax.
 */
export function renderLatexSnippet(latex: string, displayMode: boolean): string {
  const cleaned = cleanInnerLatex(latex.trim());
  if (typeof window !== 'undefined' && window.katex?.renderToString) {
    try {
      return window.katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      // Fallback to MathJax delimiters
    }
  }
  return displayMode ? `$$${escapeHtmlBasic(cleaned)}$$` : `$${escapeHtmlBasic(cleaned)}$`;
}

/**
 * Converts a plain or markdown string containing mathematical expressions into safe HTML
 * with synchronously rendered KaTeX/MathJax formulas.
 */
export function renderMathTextToHtml(raw: string): string {
  if (!raw) return '';
  const normalized = normalizeMathExpressions(raw);

  const renderedMathSnippets: string[] = [];
  const withPlaceholders = normalized.replace(
    /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g,
    (match) => {
      const idx = renderedMathSnippets.length;
      const isDisplay = match.startsWith('$$') && match.endsWith('$$');
      const inner = isDisplay ? match.slice(2, -2) : match.slice(1, -1);
      renderedMathSnippets.push(renderLatexSnippet(inner, isDisplay));
      return `@@RENDERED_MATH_${idx}@@`;
    }
  );

  const escaped = escapeHtmlBasic(withPlaceholders).replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );

  return escaped.replace(/@@RENDERED_MATH_(\d+)@@/g, (_m, idxStr) => {
    const idx = Number(idxStr);
    return renderedMathSnippets[idx] ?? _m;
  });
}

/**
 * Triggers both KaTeX auto-render and MathJax 3 typesetting on a DOM container.
 */
export function typesetMathInElement(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined') return;

  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
        ],
        throwOnError: false,
      });
    } catch {
      // ignore katex error
    }
  }

  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([element]).catch(() => {
      // ignore mathjax error
    });
  }
}

/**
 * Reusable React component that renders any text/question/option/explanation
 * with automatic MathJax & KaTeX formatting.
 */
export const MathText: React.FC<{
  text: string;
  className?: string;
  as?: 'span' | 'div';
}> = ({ text, className = '', as = 'span' }) => {
  const ref = useRef<HTMLElement | null>(null);
  const html = renderMathTextToHtml(text);

  useEffect(() => {
    if (ref.current) {
      typesetMathInElement(ref.current);
    }
  }, [text]);

  return React.createElement(as, {
    ref: (el: HTMLElement | null) => {
      ref.current = el;
    },
    className,
    dangerouslySetInnerHTML: { __html: html },
  });
};

// ============================================================================
// MATHJAX-STYLE 2D CANVAS TYPESETTER FOR WHITE-BACKGROUND PDF EXPORT
// Renders stacked fractions (\frac{a}{b}), radicals (\sqrt{x}) with vinculum
// overbars, superscripts (x^2), subscripts (x_1), italic math variables, and
// Greek/mathematical operators onto a pure #ffffff white background canvas.
// ============================================================================

type MathAstNode =
  | { type: 'sym'; text: string; italic?: boolean; bold?: boolean }
  | { type: 'frac'; num: MathAstNode[]; den: MathAstNode[] }
  | { type: 'sqrt'; index?: MathAstNode[]; body: MathAstNode[] }
  | { type: 'supsub'; base: MathAstNode[]; sup?: MathAstNode[]; sub?: MathAstNode[] };

interface MathBoxMetrics {
  width: number;
  ascent: number;
  descent: number;
}

const LATEX_COMMAND_MAP: Record<string, { text: string; italic?: boolean }> = {
  times: { text: ' × ' },
  div: { text: ' ÷ ' },
  pm: { text: ' ± ' },
  mp: { text: ' ∓ ' },
  cdot: { text: ' · ' },
  le: { text: ' ≤ ' },
  leq: { text: ' ≤ ' },
  ge: { text: ' ≥ ' },
  geq: { text: ' ≥ ' },
  ne: { text: ' ≠ ' },
  neq: { text: ' ≠ ' },
  approx: { text: ' ≈ ' },
  equiv: { text: ' ≡ ' },
  propto: { text: ' ∝ ' },
  sim: { text: ' ∼ ' },
  to: { text: ' → ' },
  rightarrow: { text: ' → ' },
  leftarrow: { text: ' ← ' },
  Rightarrow: { text: ' ⇒ ' },
  implies: { text: ' ⇒ ' },
  iff: { text: ' ⇔ ' },
  Leftrightarrow: { text: ' ⇔ ' },
  cap: { text: ' ∩ ' },
  cup: { text: ' ∪ ' },
  in: { text: ' ∈ ' },
  subset: { text: ' ⊂ ' },
  subseteq: { text: ' ⊆ ' },
  infty: { text: '∞' },
  circ: { text: '°' },
  degree: { text: '°' },
  angle: { text: '∠' },
  perp: { text: ' ⊥ ' },
  parallel: { text: ' ∥ ' },
  triangle: { text: '△' },
  therefore: { text: ' ∴ ' },
  because: { text: ' ∵ ' },
  forall: { text: '∀' },
  exists: { text: '∃' },
  partial: { text: '∂' },
  nabla: { text: '∇' },
  int: { text: '∫' },
  sum: { text: '∑' },
  prod: { text: '∏' },
  alpha: { text: 'α', italic: true },
  beta: { text: 'β', italic: true },
  gamma: { text: 'γ', italic: true },
  delta: { text: 'δ', italic: true },
  epsilon: { text: 'ε', italic: true },
  zeta: { text: 'ζ', italic: true },
  eta: { text: 'η', italic: true },
  theta: { text: 'θ', italic: true },
  iota: { text: 'ι', italic: true },
  kappa: { text: 'κ', italic: true },
  lambda: { text: 'λ', italic: true },
  mu: { text: 'μ', italic: true },
  nu: { text: 'ν', italic: true },
  xi: { text: 'ξ', italic: true },
  pi: { text: 'π', italic: true },
  rho: { text: 'ρ', italic: true },
  sigma: { text: 'σ', italic: true },
  tau: { text: 'τ', italic: true },
  phi: { text: 'φ', italic: true },
  chi: { text: 'χ', italic: true },
  psi: { text: 'ψ', italic: true },
  omega: { text: 'ω', italic: true },
  Delta: { text: 'Δ' },
  Gamma: { text: 'Γ' },
  Lambda: { text: 'Λ' },
  Omega: { text: 'Ω' },
  Phi: { text: 'Φ' },
  Pi: { text: 'Π' },
  Sigma: { text: 'Σ' },
  Theta: { text: 'Θ' },
  sin: { text: 'sin ' },
  cos: { text: 'cos ' },
  tan: { text: 'tan ' },
  sec: { text: 'sec ' },
  csc: { text: 'csc ' },
  cosec: { text: 'cosec ' },
  cot: { text: 'cot ' },
  log: { text: 'log' },
  ln: { text: 'ln ' },
  lim: { text: 'lim' },
  max: { text: 'max' },
  min: { text: 'min' },
  quad: { text: '   ' },
  qquad: { text: '     ' },
};

function readBracedGroup(src: string, startIdx: number): { content: string; nextIdx: number } {
  let i = startIdx;
  while (i < src.length && src[i] === ' ') i++;
  if (i >= src.length) return { content: '', nextIdx: i };
  if (src[i] !== '{') {
    if (src[i] === '\\') {
      let j = i + 1;
      while (j < src.length && /[a-zA-Z]/.test(src[j])) j++;
      return { content: src.slice(i, j), nextIdx: j };
    }
    return { content: src[i], nextIdx: i + 1 };
  }
  let depth = 0;
  let j = i;
  while (j < src.length) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) {
        return { content: src.slice(i + 1, j), nextIdx: j + 1 };
      }
    }
    j++;
  }
  return { content: src.slice(i + 1), nextIdx: src.length };
}

function parseMathLatexToAst(rawLatex: string, forceBold = false): MathAstNode[] {
  const src = cleanInnerLatex(rawLatex);
  const nodes: MathAstNode[] = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === ' ' || ch === '\t' || ch === '\n') {
      i++;
      continue;
    }

    if (ch === '{') {
      const grp = readBracedGroup(src, i);
      nodes.push(...parseMathLatexToAst(grp.content, forceBold));
      i = grp.nextIdx;
      continue;
    }

    if (ch === '\\') {
      let j = i + 1;
      if (j < src.length && !/[a-zA-Z]/.test(src[j])) {
        const escChar = src[j];
        if (escChar === ',' || escChar === ';' || escChar === ':') {
          nodes.push({ type: 'sym', text: ' ', bold: forceBold });
        } else if (escChar !== '!') {
          nodes.push({ type: 'sym', text: escChar, bold: forceBold });
        }
        i = j + 1;
        continue;
      }
      while (j < src.length && /[a-zA-Z]/.test(src[j])) j++;
      const cmd = src.slice(i + 1, j);
      i = j;

      if (cmd === 'left' || cmd === 'right' || cmd === 'displaystyle') {
        if (cmd === 'left' || cmd === 'right') {
          while (i < src.length && src[i] === ' ') i++;
          if (i < src.length && src[i] !== '.') {
            nodes.push({ type: 'sym', text: src[i], bold: forceBold });
            i++;
          } else if (i < src.length && src[i] === '.') {
            i++;
          }
        }
        continue;
      }

      if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
        const numGrp = readBracedGroup(src, i);
        const denGrp = readBracedGroup(src, numGrp.nextIdx);
        i = denGrp.nextIdx;
        nodes.push({
          type: 'frac',
          num: parseMathLatexToAst(numGrp.content, forceBold),
          den: parseMathLatexToAst(denGrp.content, forceBold),
        });
        continue;
      }

      if (cmd === 'sqrt') {
        while (i < src.length && src[i] === ' ') i++;
        let indexNodes: MathAstNode[] | undefined;
        if (src[i] === '[') {
          const closeBracket = src.indexOf(']', i + 1);
          if (closeBracket !== -1) {
            indexNodes = parseMathLatexToAst(src.slice(i + 1, closeBracket), forceBold);
            i = closeBracket + 1;
          }
        }
        const bodyGrp = readBracedGroup(src, i);
        i = bodyGrp.nextIdx;
        nodes.push({
          type: 'sqrt',
          index: indexNodes,
          body: parseMathLatexToAst(bodyGrp.content, forceBold),
        });
        continue;
      }

      if (cmd === 'text' || cmd === 'mathrm' || cmd === 'textrm' || cmd === 'operatorname') {
        const txtGrp = readBracedGroup(src, i);
        i = txtGrp.nextIdx;
        nodes.push({ type: 'sym', text: txtGrp.content, italic: false, bold: forceBold });
        continue;
      }

      if (cmd === 'mathbf' || cmd === 'boldsymbol' || cmd === 'textbf') {
        const bGrp = readBracedGroup(src, i);
        i = bGrp.nextIdx;
        nodes.push(...parseMathLatexToAst(bGrp.content, true));
        continue;
      }

      if (cmd === 'vec' || cmd === 'overrightarrow') {
        const vGrp = readBracedGroup(src, i);
        i = vGrp.nextIdx;
        nodes.push({
          type: 'sym',
          text: `${vGrp.content}\u20d7`,
          italic: true,
          bold: forceBold,
        });
        continue;
      }

      if (cmd === 'xrightarrow') {
        const overGrp = readBracedGroup(src, i);
        i = overGrp.nextIdx;
        nodes.push({
          type: 'frac',
          num: parseMathLatexToAst(overGrp.content, forceBold),
          den: [{ type: 'sym', text: ' ───→ ' }],
        });
        continue;
      }

      const mapped = LATEX_COMMAND_MAP[cmd];
      if (mapped) {
        nodes.push({
          type: 'sym',
          text: mapped.text,
          italic: mapped.italic,
          bold: forceBold,
        });
      } else {
        nodes.push({ type: 'sym', text: cmd, italic: false, bold: forceBold });
      }
      continue;
    }

    if (ch === '^' || ch === '_') {
      const baseNode: MathAstNode =
        nodes.length > 0 ? nodes.pop()! : { type: 'sym', text: '' };
      let supNodes: MathAstNode[] | undefined =
        baseNode.type === 'supsub' ? baseNode.sup : undefined;
      let subNodes: MathAstNode[] | undefined =
        baseNode.type === 'supsub' ? baseNode.sub : undefined;
      const actualBase: MathAstNode[] =
        baseNode.type === 'supsub' ? baseNode.base : [baseNode];

      while (i < src.length && (src[i] === '^' || src[i] === '_')) {
        const kind = src[i];
        const grp = readBracedGroup(src, i + 1);
        i = grp.nextIdx;
        if (kind === '^') {
          supNodes = parseMathLatexToAst(grp.content, forceBold);
        } else {
          subNodes = parseMathLatexToAst(grp.content, forceBold);
        }
        while (i < src.length && src[i] === ' ') i++;
      }

      nodes.push({
        type: 'supsub',
        base: actualBase,
        sup: supNodes,
        sub: subNodes,
      });
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      nodes.push({ type: 'sym', text: src.slice(i, j), italic: false, bold: forceBold });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      nodes.push({ type: 'sym', text: ch, italic: true, bold: forceBold });
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '=') {
      const displayOp = ch === '-' ? ' − ' : ` ${ch} `;
      nodes.push({ type: 'sym', text: displayOp, italic: false, bold: forceBold });
      i++;
      continue;
    }

    nodes.push({ type: 'sym', text: ch, italic: false, bold: forceBold });
    i++;
  }

  return nodes;
}

function setMathFont(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  italic = false,
  bold = false
): void {
  const style = italic ? 'italic ' : '';
  const weight = bold ? '700 ' : '500 ';
  ctx.font = `${style}${weight}${fontSize}px "Times New Roman", "Cambria Math", Georgia, serif`;
}

function measureMathAstList(
  ctx: CanvasRenderingContext2D,
  nodes: MathAstNode[],
  fontSize: number
): MathBoxMetrics {
  let width = 0;
  let ascent = fontSize * 0.78;
  let descent = fontSize * 0.24;

  for (const node of nodes) {
    const m = measureSingleMathNode(ctx, node, fontSize);
    width += m.width;
    if (m.ascent > ascent) ascent = m.ascent;
    if (m.descent > descent) descent = m.descent;
  }
  return { width, ascent, descent };
}

function measureSingleMathNode(
  ctx: CanvasRenderingContext2D,
  node: MathAstNode,
  fontSize: number
): MathBoxMetrics {
  if (node.type === 'sym') {
    setMathFont(ctx, fontSize, node.italic, node.bold);
    const w = ctx.measureText(node.text).width;
    return {
      width: w,
      ascent: fontSize * 0.78,
      descent: fontSize * 0.24,
    };
  }

  if (node.type === 'frac') {
    const subSize = Math.max(10, fontSize * 0.82);
    const numM = measureMathAstList(ctx, node.num, subSize);
    const denM = measureMathAstList(ctx, node.den, subSize);
    const padX = fontSize * 0.28;
    const axisShift = fontSize * 0.28;
    const gap = fontSize * 0.16;
    return {
      width: Math.max(numM.width, denM.width) + padX * 2,
      ascent: axisShift + gap + numM.ascent + numM.descent,
      descent: Math.max(fontSize * 0.24, denM.ascent + denM.descent + gap - axisShift),
    };
  }

  if (node.type === 'sqrt') {
    const bodyM = measureMathAstList(ctx, node.body, fontSize);
    const hookW = fontSize * 0.62;
    const padRight = fontSize * 0.15;
    const topPad = fontSize * 0.18;
    return {
      width: hookW + bodyM.width + padRight,
      ascent: bodyM.ascent + topPad,
      descent: bodyM.descent + fontSize * 0.06,
    };
  }

  // supsub
  const baseM = measureMathAstList(ctx, node.base, fontSize);
  const scriptSize = Math.max(9, fontSize * 0.68);
  const supM = node.sup ? measureMathAstList(ctx, node.sup, scriptSize) : null;
  const subM = node.sub ? measureMathAstList(ctx, node.sub, scriptSize) : null;
  const scriptW = Math.max(supM ? supM.width : 0, subM ? subM.width : 0) + fontSize * 0.06;
  const supAscent = supM ? Math.max(baseM.ascent, fontSize * 0.42 + supM.ascent) : baseM.ascent;
  const subDescent = subM ? Math.max(baseM.descent, fontSize * 0.24 + subM.descent) : baseM.descent;
  return {
    width: baseM.width + scriptW,
    ascent: supAscent,
    descent: subDescent,
  };
}

function drawMathAstList(
  ctx: CanvasRenderingContext2D,
  nodes: MathAstNode[],
  startX: number,
  baselineY: number,
  fontSize: number
): number {
  let x = startX;
  for (const node of nodes) {
    x = drawSingleMathNode(ctx, node, x, baselineY, fontSize);
  }
  return x;
}

function drawSingleMathNode(
  ctx: CanvasRenderingContext2D,
  node: MathAstNode,
  x: number,
  baselineY: number,
  fontSize: number
): number {
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#0f172a';

  if (node.type === 'sym') {
    setMathFont(ctx, fontSize, node.italic, node.bold);
    ctx.fillText(node.text, x, baselineY);
    return x + ctx.measureText(node.text).width;
  }

  if (node.type === 'frac') {
    const subSize = Math.max(10, fontSize * 0.82);
    const numM = measureMathAstList(ctx, node.num, subSize);
    const denM = measureMathAstList(ctx, node.den, subSize);
    const padX = fontSize * 0.28;
    const totalW = Math.max(numM.width, denM.width) + padX * 2;
    const axisY = baselineY - fontSize * 0.28;
    const gap = fontSize * 0.16;

    // Draw numerator centered above fraction bar
    const numX = x + (totalW - numM.width) / 2;
    const numBaseline = axisY - gap - numM.descent;
    drawMathAstList(ctx, node.num, numX, numBaseline, subSize);

    // Draw horizontal vinculum (fraction bar)
    ctx.save();
    ctx.lineWidth = Math.max(1.2, fontSize * 0.065);
    ctx.beginPath();
    ctx.moveTo(x + padX * 0.4, axisY);
    ctx.lineTo(x + totalW - padX * 0.4, axisY);
    ctx.stroke();
    ctx.restore();

    // Draw denominator centered below fraction bar
    const denX = x + (totalW - denM.width) / 2;
    const denBaseline = axisY + gap + denM.ascent;
    drawMathAstList(ctx, node.den, denX, denBaseline, subSize);

    return x + totalW;
  }

  if (node.type === 'sqrt') {
    const bodyM = measureMathAstList(ctx, node.body, fontSize);
    const hookW = fontSize * 0.62;
    const padRight = fontSize * 0.15;
    const topY = baselineY - bodyM.ascent - fontSize * 0.1;
    const bottomY = baselineY + bodyM.descent * 0.75;
    const midY = baselineY - bodyM.ascent * 0.35;

    ctx.save();
    ctx.lineWidth = Math.max(1.3, fontSize * 0.068);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + hookW * 0.08, midY + fontSize * 0.12);
    ctx.lineTo(x + hookW * 0.24, midY);
    ctx.lineTo(x + hookW * 0.52, bottomY);
    ctx.lineTo(x + hookW * 0.92, topY);
    ctx.lineTo(x + hookW + bodyM.width + padRight * 0.7, topY);
    ctx.stroke();
    ctx.restore();

    drawMathAstList(ctx, node.body, x + hookW, baselineY, fontSize);
    return x + hookW + bodyM.width + padRight;
  }

  // supsub
  const baseM = measureMathAstList(ctx, node.base, fontSize);
  const afterBaseX = drawMathAstList(ctx, node.base, x, baselineY, fontSize);
  const scriptSize = Math.max(9, fontSize * 0.68);
  let maxScriptEnd = afterBaseX;

  if (node.sup) {
    const supBaseline = baselineY - Math.max(fontSize * 0.4, baseM.ascent * 0.55);
    const endSup = drawMathAstList(ctx, node.sup, afterBaseX + 1, supBaseline, scriptSize);
    if (endSup > maxScriptEnd) maxScriptEnd = endSup;
  }
  if (node.sub) {
    const subBaseline = baselineY + Math.max(fontSize * 0.24, baseM.descent * 0.85);
    const endSub = drawMathAstList(ctx, node.sub, afterBaseX + 1, subBaseline, scriptSize);
    if (endSub > maxScriptEnd) maxScriptEnd = endSub;
  }
  return maxScriptEnd + fontSize * 0.04;
}

type RichParagraphToken =
  | { kind: 'text'; text: string; bold: boolean }
  | { kind: 'math'; nodes: MathAstNode[]; display: boolean };

function tokenizeRichMathLine(rawLine: string, defaultBold = false): RichParagraphToken[] {
  const normalized = normalizeMathExpressions(
    rawLine
      .replace(/^#{1,4}\s*/, '')
      .replace(/^\s*[-*]\s+/, '• ')
  );

  // Split by $$...$$ or $...$
  const parts = normalized.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  const tokens: RichParagraphToken[] = [];

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const inner = part.slice(2, -2).trim();
      if (inner) {
        tokens.push({
          kind: 'math',
          nodes: parseMathLatexToAst(inner, defaultBold),
          display: true,
        });
      }
      continue;
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      const inner = part.slice(1, -1).trim();
      if (inner) {
        tokens.push({
          kind: 'math',
          nodes: parseMathLatexToAst(inner, defaultBold),
          display: false,
        });
      }
      continue;
    }

    // Handle **bold** segments inside plain text
    const boldSegments = part.split(/(\*\*.*?\*\*)/g);
    for (const seg of boldSegments) {
      if (!seg) continue;
      const isBold = defaultBold || (seg.startsWith('**') && seg.endsWith('**'));
      const cleanSeg = seg.startsWith('**') && seg.endsWith('**') ? seg.slice(2, -2) : seg;
      const words = cleanSeg.split(/(\s+)/);
      for (const w of words) {
        if (!w) continue;
        tokens.push({ kind: 'text', text: w, bold: isBold });
      }
    }
  }

  return tokens;
}

/**
 * Renders a single paragraph or equation line (containing plain text, **bold**,
 * inline $...$ math, or display $$...$$ math) onto a high-DPI pure white (#ffffff)
 * HTML5 Canvas with MathJax-style typography, and returns its PNG data URL and
 * exact dimensions in millimeters for embedding into jsPDF.
 */
export function renderRichMathParagraphToPng(
  rawLine: string,
  maxWidthMm: number,
  isHeading = false
): { dataUrl: string; widthMm: number; heightMm: number } | null {
  if (typeof document === 'undefined') return null;
  const trimmed = rawLine.trim();
  if (!trimmed) return null;

  // 1 mm = 3.78 CSS px; we render at 2.5x retina scale for razor-sharp PDF print quality
  const pxPerMm = 3.78;
  const scale = 2.5;
  const contentWidthPx = Math.max(180, Math.round(maxWidthMm * pxPerMm));
  const baseFontSize = isHeading ? 15.5 : 14;
  const mathFontSize = isHeading ? 16.5 : 15;

  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) return null;

  const isPureDisplayMath =
    trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.slice(2, -2).indexOf('$$') === -1;

  if (isPureDisplayMath) {
    const innerLatex = trimmed.slice(2, -2).trim();
    const ast = parseMathLatexToAst(innerLatex, false);
    const metrics = measureMathAstList(mCtx, ast, mathFontSize * 1.08);
    const padY = 8;
    const totalH = Math.ceil(metrics.ascent + metrics.descent + padY * 2);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(contentWidthPx * scale);
    canvas.height = Math.round(totalH * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Always fill 100% pure white background (#ffffff)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);

    const drawX = Math.max(8, (contentWidthPx - metrics.width) / 2);
    const baselineY = padY + metrics.ascent;
    drawMathAstList(ctx, ast, drawX, baselineY, mathFontSize * 1.08);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      widthMm: maxWidthMm,
      heightMm: Number((totalH / pxPerMm).toFixed(2)),
    };
  }

  const tokens = tokenizeRichMathLine(trimmed, isHeading);
  if (tokens.length === 0) return null;

  interface MeasuredToken {
    token: RichParagraphToken;
    width: number;
    ascent: number;
    descent: number;
  }

  const measured: MeasuredToken[] = tokens.map((tk) => {
    if (tk.kind === 'text') {
      mCtx.font = `${tk.bold ? '700' : '400'} ${baseFontSize}px "Inter", "Segoe UI", Arial, sans-serif`;
      const w = mCtx.measureText(tk.text).width;
      return {
        token: tk,
        width: w,
        ascent: baseFontSize * 0.8,
        descent: baseFontSize * 0.25,
      };
    }
    const fSize = tk.display ? mathFontSize * 1.06 : mathFontSize;
    const m = measureMathAstList(mCtx, tk.nodes, fSize);
    return {
      token: tk,
      width: m.width + 3,
      ascent: m.ascent + 2,
      descent: m.descent + 2,
    };
  });

  interface WrappedLine {
    items: MeasuredToken[];
    ascent: number;
    descent: number;
  }

  const lines: WrappedLine[] = [];
  let currentItems: MeasuredToken[] = [];
  let currentW = 0;
  let maxAsc = baseFontSize * 0.82;
  let maxDesc = baseFontSize * 0.26;
  const maxLineW = contentWidthPx - 6;

  const pushCurrentLine = () => {
    if (currentItems.length === 0) return;
    lines.push({ items: currentItems, ascent: maxAsc, descent: maxDesc });
    currentItems = [];
    currentW = 0;
    maxAsc = baseFontSize * 0.82;
    maxDesc = baseFontSize * 0.26;
  };

  for (const item of measured) {
    const isWhitespaceOnly =
      item.token.kind === 'text' && /^\s+$/.test(item.token.text);
    if (currentItems.length === 0 && isWhitespaceOnly) {
      continue;
    }
    if (currentItems.length > 0 && currentW + item.width > maxLineW && !isWhitespaceOnly) {
      pushCurrentLine();
    }
    currentItems.push(item);
    currentW += item.width;
    if (item.ascent > maxAsc) maxAsc = item.ascent;
    if (item.descent > maxDesc) maxDesc = item.descent;
  }
  pushCurrentLine();

  if (lines.length === 0) return null;

  const lineGap = 5;
  const topPad = isHeading ? 4 : 2;
  const bottomPad = isHeading ? 4 : 2;
  let totalHeightPx = topPad + bottomPad;
  for (let i = 0; i < lines.length; i++) {
    totalHeightPx += lines[i].ascent + lines[i].descent + (i < lines.length - 1 ? lineGap : 0);
  }
  totalHeightPx = Math.ceil(totalHeightPx);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(contentWidthPx * scale);
  canvas.height = Math.round(totalHeightPx * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Always paint a 100% pure white background (#ffffff)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);

  let cursorY = topPad;
  for (const line of lines) {
    const baselineY = cursorY + line.ascent;
    let cursorX = 2;
    for (const item of line.items) {
      if (item.token.kind === 'text') {
        ctx.fillStyle = '#0f172a';
        ctx.font = `${item.token.bold ? '700' : '400'} ${baseFontSize}px "Inter", "Segoe UI", Arial, sans-serif`;
        ctx.fillText(item.token.text, cursorX, baselineY);
        cursorX += item.width;
      } else {
        const fSize = item.token.display ? mathFontSize * 1.06 : mathFontSize;
        drawMathAstList(ctx, item.token.nodes, cursorX + 1.5, baselineY, fSize);
        cursorX += item.width;
      }
    }
    cursorY += line.ascent + line.descent + lineGap;
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    widthMm: maxWidthMm,
    heightMm: Number((totalHeightPx / pxPerMm).toFixed(2)),
  };
}

