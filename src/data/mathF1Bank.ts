import type { ExtractedTextbookExerciseSeed } from './extractedTextbookExerciseBank.ts';
import type { QuestionDiagramSpec } from '../utils/questionDiagramGenerator.ts';
import { MATH_F1_PART1_TUPLES } from './mathF1Part1.ts';
import { MATH_F1_PART2_TUPLES } from './mathF1Part2.ts';

const MATH_F1_TEXTBOOK_TITLE =
  "Mathematics for Secondary Schools - Student's Book Form One (2023 Revised Edition)";

const SVG_ARROW_DEFS = `<defs>
  <marker id="math-f1-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#111"/>
  </marker>
  <marker id="math-f1-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#1a73e8"/>
  </marker>
  <marker id="math-f1-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#d93025"/>
  </marker>
</defs>`;

export const MATH_F1_CH2_DIAGRAM_SVG = `<svg width="760" height="240" viewBox="0 0 760 240" class="w-full h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SVG_ARROW_DEFS}
  <rect width="760" height="240" rx="8" fill="#ffffff"/>
  <text x="195" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">Figure 2.1: Categories of Real Numbers</text>
  <rect x="95" y="30" width="200" height="28" rx="5" fill="#1a73e8"/>
  <text x="195" y="49" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#fff">Real Numbers (R)</text>
  <line x1="195" y1="58" x2="105" y2="78" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <line x1="195" y1="58" x2="285" y2="78" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <rect x="30" y="80" width="150" height="28" rx="5" fill="#e8f0fe" stroke="#1a73e8" stroke-width="1.8"/>
  <text x="105" y="99" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11.5" fill="#1557b0">Rational Numbers (Q)</text>
  <rect x="210" y="80" width="150" height="28" rx="5" fill="#fce8e6" stroke="#d93025" stroke-width="1.8"/>
  <text x="285" y="99" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11.5" fill="#c5221f">Irrational Numbers (Q')</text>
  <line x1="105" y1="108" x2="105" y2="126" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <rect x="30" y="128" width="150" height="26" rx="5" fill="#e6f4ea" stroke="#188038" stroke-width="1.8"/>
  <text x="105" y="146" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11.5" fill="#137333">Integers (Z)</text>
  <line x1="105" y1="154" x2="105" y2="172" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <rect x="30" y="174" width="150" height="26" rx="5" fill="#fef7e0" stroke="#f29900" stroke-width="1.8"/>
  <text x="105" y="192" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11.5" fill="#b06000">Whole Numbers (W)</text>
  <line x1="105" y1="200" x2="105" y2="212" stroke="#111" stroke-width="1.8"/>
  <text x="105" y="226" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11.5" fill="#111">Natural Numbers (N)</text>

  <text x="565" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">Number Line Representation (Rev Ex 2 Q5)</text>
  <line x1="395" y1="100" x2="735" y2="100" stroke="#111" stroke-width="2" marker-start="url(#math-f1-arrow)" marker-end="url(#math-f1-arrow)"/>
  <g stroke="#111" stroke-width="1.5" fill="#111">
    <line x1="430" y1="94" x2="430" y2="106"/><text x="430" y="122" text-anchor="middle" font-size="11" stroke="none">-3</text>
    <line x1="480" y1="94" x2="480" y2="106"/><text x="480" y="122" text-anchor="middle" font-size="11" stroke="none">-2</text>
    <line x1="530" y1="94" x2="530" y2="106"/><text x="530" y="122" text-anchor="middle" font-size="11" stroke="none">-1</text>
    <line x1="580" y1="94" x2="580" y2="106"/><text x="580" y="122" text-anchor="middle" font-size="11" stroke="none">0</text>
    <line x1="630" y1="94" x2="630" y2="106"/><text x="630" y="122" text-anchor="middle" font-size="11" stroke="none">1</text>
    <line x1="680" y1="94" x2="680" y2="106"/><text x="680" y="122" text-anchor="middle" font-size="11" stroke="none">2</text>
  </g>
  <line x1="442.5" y1="68" x2="617.5" y2="68" stroke="#1a73e8" stroke-width="2.5"/>
  <line x1="442.5" y1="68" x2="442.5" y2="100" stroke="#1a73e8" stroke-dasharray="3,2"/>
  <line x1="617.5" y1="68" x2="617.5" y2="100" stroke="#1a73e8" stroke-dasharray="3,2"/>
  <circle cx="442.5" cy="68" r="4.5" fill="#fff" stroke="#1a73e8" stroke-width="2"/>
  <circle cx="617.5" cy="68" r="4.5" fill="#1a73e8"/>
  <text x="442.5" y="55" text-anchor="middle" font-size="11" font-weight="bold" fill="#1a73e8">-11/4 (Excluded)</text>
  <text x="625" y="55" text-anchor="middle" font-size="11" font-weight="bold" fill="#1a73e8">3/4 (Included)</text>
  <text x="555" y="155" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#1557b0">Inequality: -11/4 &lt; x ≤ 3/4</text>
</svg>`;

export const MATH_F1_CH5_DIAGRAM_SVG = `<svg width="760" height="230" viewBox="0 0 760 230" class="w-full h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SVG_ARROW_DEFS}
  <rect width="760" height="230" rx="8" fill="#ffffff"/>
  <text x="125" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">Ex 5.3 Q9(a): Angles on a Straight Line</text>
  <line x1="20" y1="165" x2="230" y2="165" stroke="#111" stroke-width="2.5"/>
  <line x1="125" y1="165" x2="175" y2="65" stroke="#1a73e8" stroke-width="2"/>
  <path d="M 90,165 A 35,35 0 0,1 141,133" fill="none" stroke="#d93025" stroke-width="1.5"/>
  <path d="M 141,133 A 35,35 0 0,1 160,165" fill="none" stroke="#188038" stroke-width="1.5"/>
  <text x="72" y="130" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#d93025">(4x + 80°)/2</text>
  <text x="182" y="148" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#188038">x - 40°</text>

  <text x="380" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">Ex 5.3 Q9(b): Intersecting Lines</text>
  <line x1="275" y1="115" x2="485" y2="115" stroke="#111" stroke-width="2"/>
  <line x1="380" y1="40" x2="380" y2="195" stroke="#111" stroke-width="2"/>
  <line x1="315" y1="55" x2="445" y2="175" stroke="#1a73e8" stroke-width="2"/>
  <text x="330" y="105" font-size="11" font-weight="bold" fill="#111">x + 60°</text>
  <text x="415" y="95" font-size="11" font-weight="bold" fill="#111">2x</text>
  <text x="430" y="138" font-size="11" font-weight="bold" fill="#111">30°</text>
  <text x="405" y="175" font-size="11" font-weight="bold" fill="#111">4x - 50°</text>
  <text x="320" y="155" font-size="11" font-weight="bold" fill="#111">3x - 30°</text>

  <text x="630" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">Ex 5.7 Q10: Simultaneous Figures</text>
  <rect x="525" y="45" width="110" height="65" fill="#e8f0fe" stroke="#1a73e8" stroke-width="2"/>
  <text x="580" y="40" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">2x + 6y</text>
  <text x="580" y="125" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">5x + y</text>
  <text x="642" y="82" font-size="11" font-weight="bold" fill="#111">3x + y</text>

  <polygon points="695,130 645,205 745,205" fill="#fef7e0" stroke="#f29900" stroke-width="2"/>
  <line x1="665" y1="168" x2="675" y2="174" stroke="#d93025" stroke-width="2"/>
  <line x1="725" y1="168" x2="715" y2="174" stroke="#d93025" stroke-width="2"/>
  <text x="695" y="158" text-anchor="middle" font-size="10" font-weight="bold" fill="#111">5x+50°</text>
  <text x="695" y="220" text-anchor="middle" font-size="10" font-weight="bold" fill="#111">Base angle: 3y-15°</text>
</svg>`;

export const MATH_F1_CH6_DIAGRAM_SVG = `<svg width="780" height="270" viewBox="0 0 780 270" class="w-full h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SVG_ARROW_DEFS}
  <rect width="780" height="270" rx="8" fill="#ffffff"/>
  <text x="130" y="18" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">(a) Ex 6.1 Q2: Points on the xy-plane</text>
  <g stroke="#e0e0e0" stroke-width="1">
    <line x1="25" y1="45" x2="235" y2="45"/><line x1="25" y1="75" x2="235" y2="75"/>
    <line x1="25" y1="105" x2="235" y2="105"/><line x1="25" y1="135" x2="235" y2="135"/>
    <line x1="25" y1="165" x2="235" y2="165"/><line x1="25" y1="195" x2="235" y2="195"/>
    <line x1="25" y1="225" x2="235" y2="225"/>
    <line x1="40" y1="35" x2="40" y2="235"/><line x1="70" y1="35" x2="70" y2="235"/>
    <line x1="100" y1="35" x2="100" y2="235"/><line x1="130" y1="35" x2="130" y2="235"/>
    <line x1="160" y1="35" x2="160" y2="235"/><line x1="190" y1="35" x2="190" y2="235"/>
    <line x1="220" y1="35" x2="220" y2="235"/>
  </g>
  <line x1="20" y1="135" x2="240" y2="135" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <line x1="130" y1="240" x2="130" y2="30" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <text x="238" y="150" font-size="11" font-weight="bold" fill="#111">x</text>
  <text x="140" y="38" font-size="11" font-weight="bold" fill="#111">y</text>
  <circle cx="145" cy="45" r="3" fill="#d93025"/><text x="152" y="48" font-size="10" font-weight="bold" fill="#111">P(0.5, 3)</text>
  <circle cx="70" cy="75" r="3" fill="#d93025"/><text x="42" y="72" font-size="10" font-weight="bold" fill="#111">H(-2, 2)</text>
  <circle cx="190" cy="90" r="3" fill="#d93025"/><text x="195" y="93" font-size="10" font-weight="bold" fill="#111">N(2, 1.5)</text>
  <circle cx="70" cy="120" r="3" fill="#d93025"/><text x="42" y="118" font-size="10" font-weight="bold" fill="#111">Q(-2, 0.5)</text>
  <circle cx="70" cy="180" r="3" fill="#d93025"/><text x="40" y="184" font-size="10" font-weight="bold" fill="#111">L(-2, -1.5)</text>
  <circle cx="160" cy="195" r="3" fill="#d93025"/><text x="165" y="198" font-size="10" font-weight="bold" fill="#111">M(1, -2)</text>
  <circle cx="115" cy="225" r="3" fill="#d93025"/><text x="72" y="228" font-size="10" font-weight="bold" fill="#111">J(-0.5, -3)</text>
  <circle cx="220" cy="225" r="3" fill="#d93025"/><text x="190" y="242" font-size="10" font-weight="bold" fill="#111">K(3, -3)</text>

  <text x="390" y="18" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">(b) Ex 6.2 Q3: Polygon PQR</text>
  <line x1="270" y1="150" x2="505" y2="150" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <line x1="400" y1="240" x2="400" y2="30" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <polygon points="466,194 400,62 301,194" fill="#e8f0fe" fill-opacity="0.6" stroke="#1a73e8" stroke-width="2"/>
  <circle cx="466" cy="194" r="3.5" fill="#d93025"/><text x="472" y="208" font-size="10" font-weight="bold" fill="#111">P(3, -2)</text>
  <circle cx="400" cy="62" r="3.5" fill="#d93025"/><text x="408" y="62" font-size="10" font-weight="bold" fill="#111">Q(0, 4)</text>
  <circle cx="301" cy="194" r="3.5" fill="#d93025"/><text x="275" y="210" font-size="10" font-weight="bold" fill="#111">R(-4.5, -2)</text>

  <text x="645" y="18" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">(c) Graphical Simultaneous Solution</text>
  <line x1="535" y1="165" x2="760" y2="165" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <line x1="610" y1="240" x2="610" y2="30" stroke="#111" stroke-width="1.8" marker-end="url(#math-f1-arrow)"/>
  <line x1="585" y1="250" x2="690" y2="40" stroke="#1a73e8" stroke-width="2"/>
  <text x="692" y="55" font-size="10" font-weight="bold" fill="#1a73e8">y = 2x - 1</text>
  <line x1="565" y1="50" x2="730" y2="215" stroke="#d93025" stroke-width="2"/>
  <text x="715" y="230" font-size="10" font-weight="bold" fill="#d93025">y = -x + 2</text>
  <circle cx="645" cy="130" r="4.5" fill="#188038"/>
  <text x="655" y="128" font-size="11" font-weight="bold" fill="#188038">Intersection (1, 1)</text>
</svg>`;

export function getMathF1DiagramSvg(
  questionText: string,
  topic?: string,
  subTopic?: string
): QuestionDiagramSpec | null {
  const q = `${questionText} ${topic || ''} ${subTopic || ''}`;
  if (
    /Exercise 5\.3 Q9|Exercise 5\.7 Q10|\(4x\s*\+\s*80\^\\circ\)\/2|rectangle with opposite sides.*2x \+ 6y/i.test(
      q
    )
  ) {
    return {
      title: 'Geometric Angle & Polygon Diagrams (Exercise 5.3 Q9 & Exercise 5.7 Q10)',
      caption: 'Angles on a straight line, intersecting lines, and simultaneous rectangle/isosceles triangle figures',
      svgHtml: MATH_F1_CH5_DIAGRAM_SVG,
    };
  }
  if (/Exercise 6\.1 Q2|Exercise 6\.2 Q3|Polygon PQR|P\(0\.5,\s*3\).*H\(-2,\s*2\)/i.test(q)) {
    return {
      title: 'Coordinate Plane Points (Ex 6.1 Q2), Polygon PQR (Ex 6.2 Q3) & Graphical Solution',
      caption: 'Cartesian xy-plane coordinates, Triangle PQR, and graphical simultaneous intersection',
      svgHtml: MATH_F1_CH6_DIAGRAM_SVG,
    };
  }
  if (/Revision Exercise 2 Q5|open circle at.*-\\frac\{11\}\{4\}.*solid dot at.*\\frac\{3\}\{4\}|Figure 2\.1/i.test(q)) {
    return {
      title: 'Categories of Real Numbers (Figure 2.1) & Number Line Inequality (Rev Ex 2 Q5)',
      caption: 'Hierarchy of Real Numbers and Number Line Interval Representation',
      svgHtml: MATH_F1_CH2_DIAGRAM_SVG,
    };
  }
  return null;
}

function buildMathF1Distractors(topic: string, answer: string, idx: number): [string, string, string] {
  const intMatch = answer.match(/^\$?(-?\d+(?:\.\d+)?)\$?$/);
  if (intMatch) {
    const val = parseFloat(intMatch[1]);
    if (!Number.isNaN(val)) {
      return [`$${val + 2}$`, `$${val - 1}$`, `$${val * 2 === val ? val + 5 : val * 2}$`];
    }
  }
  if (topic.includes('Chapter 1')) {
    return [
      'Mathematics is only concerned with memorizing multiplication tables without real-life application.',
      'Mathematical concepts are isolated from natural sciences, commerce, and daily measurement.',
      'Only qualitative verbal descriptions are used without numbers, ratios, or geometric patterns.',
    ];
  }
  if (topic.includes('Chapter 2')) {
    const pool = [
      '$-\\frac{3}{5}$ (terminating decimal $-0.6$)',
      '$0.\\dot{3} = \\frac{1}{3}$ on the left side of $-1$',
      'Irrational number because its denominator is a whole number',
      '$x \\le -\\frac{11}{4}$ or $x > \\frac{3}{4}$',
    ];
    return [pool[idx % 4], pool[(idx + 1) % 4], pool[(idx + 2) % 4]];
  }
  if (topic.includes('Chapter 3')) {
    const pool = [
      '$10,000$ (rounded to 1 significant figure only)',
      '$0.005$ (truncated without rounding the next digit)',
      '$250.00$ (rounded to nearest hundreds instead of decimal places)',
      '$3.100$ (ignoring the thousandths digit carry-over)',
    ];
    return [pool[idx % 4], pool[(idx + 1) % 4], pool[(idx + 2) % 4]];
  }
  if (topic.includes('Chapter 4')) {
    const pool = [
      '$3:7$ (inverted ratio without simplifying common factors)',
      'Tshs 24,000 (dividing equally instead of using the given ratio)',
      '$45\\%$ (dividing denominator by numerator)',
      '$12\\text{ kg}$ (using the difference of ratio parts instead of the sum)',
    ];
    return [pool[idx % 4], pool[(idx + 1) % 4], pool[(idx + 2) % 4]];
  }
  if (topic.includes('Chapter 5')) {
    const pool = [
      '$x = -2, y = 5$ (sign error when transposing terms)',
      '$x = 4, y = -3$ (subtracting instead of adding during elimination)',
      '$x < -3$ (forgetting to reverse the inequality sign when dividing by a negative)',
      '$3x - 2y = 0$ (combining unlike variables into a single term)',
    ];
    return [pool[idx % 4], pool[(idx + 1) % 4], pool[(idx + 2) % 4]];
  }
  const pool = [
    '$y = -2x - 3$ (interchanging $x$-intercept and $y$-intercept)',
    'Gradient $m = 0$ (vertical line parallel to the $y$-axis)',
    'Quadrant II where $x > 0$ and $y < 0$',
    'Intersection point $(-1, -2)$',
  ];
  return [pool[idx % 4], pool[(idx + 1) % 4], pool[(idx + 2) % 4]];
}

const ALL_MATH_F1_TUPLES = [...MATH_F1_PART1_TUPLES, ...MATH_F1_PART2_TUPLES];

export const MATH_F1_BANK: ExtractedTextbookExerciseSeed[] = ALL_MATH_F1_TUPLES.map(
  ([topic, subTopic, exerciseRef, questionText, correctAnswer, explanation], idx) => {
    const distractors = buildMathF1Distractors(topic, correctAnswer, idx);
    const correctIndex = idx % 4;
    const orderedOptions: [string, string, string, string] = ['', '', '', ''];
    let dIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        orderedOptions[i] = correctAnswer;
      } else {
        orderedOptions[i] = distractors[dIdx++];
      }
    }

    return {
      id: `math_f1_2023_${idx + 1}`,
      cls: 'Form 1',
      subject: 'Basic Mathematics',
      topic,
      subTopic,
      exerciseRef,
      textbookTitle: MATH_F1_TEXTBOOK_TITLE,
      question: questionText.startsWith('[') ? questionText : `[${exerciseRef}] ${questionText}`,
      options: orderedOptions,
      correctIndex,
      explanation: `${correctAnswer} — ${explanation}`,
      hint: explanation,
      isMultipleChoice: false,
    };
  }
);
