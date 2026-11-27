import React, { useEffect, useRef, useState } from 'react';

interface MathJaxInstance {
  typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
  typesetClear?: (elements?: HTMLElement[]) => void;
  tex2chtml?: (tex: string, options?: { display?: boolean }) => HTMLElement;
  startup?: {
    promise?: Promise<void>;
    document?: {
      clear?: () => void;
      updateDocument?: () => void;
    };
  };
}

interface KatexInstance {
  renderToString?: (
    tex: string,
    options?: { throwOnError?: boolean; displayMode?: boolean }
  ) => string;
}

function getMathJax(): MathJaxInstance | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { MathJax?: MathJaxInstance }).MathJax;
}

function getKatex(): KatexInstance | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { katex?: KatexInstance }).katex;
}

interface MathFormulaProps {
  tex: string;
  display?: boolean;
  className?: string;
}

/**
 * Renders LaTeX mathematical expressions using MathJax 3 (with instant KaTeX fallback if MathJax is still initializing).
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  tex,
  display = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [mathJaxReady, setMathJaxReady] = useState<boolean>(
    () => Boolean(getMathJax()?.typesetPromise || getMathJax()?.tex2chtml)
  );

  useEffect(() => {
    if (mathJaxReady) return;
    let mounted = true;
    const interval = window.setInterval(() => {
      const mj = getMathJax();
      if (mj?.typesetPromise || mj?.tex2chtml) {
        if (mounted) setMathJaxReady(true);
        window.clearInterval(interval);
      }
    }, 150);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [mathJaxReady]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cleanTex = (tex || '').trim();
    if (!cleanTex) {
      el.innerHTML = '';
      return;
    }

    let cancelled = false;

    const renderWithMathJax = async () => {
      const mj = getMathJax();
      if (mj?.tex2chtml) {
        try {
          const node = mj.tex2chtml(cleanTex, { display });
          if (!cancelled && el) {
            el.innerHTML = '';
            el.appendChild(node);
            mj.startup?.document?.clear?.();
            mj.startup?.document?.updateDocument?.();
            return;
          }
        } catch {
          // fall through to typesetPromise or katex
        }
      }

      if (mj?.typesetPromise) {
        try {
          if (mj.typesetClear) {
            mj.typesetClear([el]);
          }
          el.textContent = display ? `\\[${cleanTex}\\]` : `\\(${cleanTex}\\)`;
          await mj.typesetPromise([el]);
          return;
        } catch {
          // fall through to katex
        }
      }

      const katex = getKatex();
      if (katex?.renderToString) {
        try {
          el.innerHTML = katex.renderToString(cleanTex, {
            throwOnError: false,
            displayMode: display,
          });
          return;
        } catch {
          // fall through
        }
      }

      el.textContent = cleanTex;
    };

    renderWithMathJax();

    return () => {
      cancelled = true;
    };
  }, [tex, display, mathJaxReady]);

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-center max-w-full overflow-x-auto align-middle ${className}`}
    />
  );
};

export interface QuickSymbol {
  label: string;
  insert: string;
}

export const DEFAULT_QUICK_SYMBOLS: QuickSymbol[] = [
  { label: 'x²', insert: 'x^2' },
  { label: 'x³', insert: 'x^3' },
  { label: '√x', insert: 'sqrt(x)' },
  { label: 'a/b', insert: '()/()' },
  { label: '|x|', insert: '|x|' },
  { label: 'π', insert: 'pi' },
  { label: 'θ', insert: 'theta' },
  { label: 'sin', insert: 'sin(x)' },
  { label: 'cos', insert: 'cos(x)' },
  { label: 'tan', insert: 'tan(x)' },
  { label: 'ln', insert: 'ln(x)' },
  { label: 'eˣ', insert: 'e^x' },
];
