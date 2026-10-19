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
