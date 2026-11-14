import { getPhysicsF2DiagramSvg } from '../data/physicsF2Diagrams.ts';
import { getMathF1DiagramSvg } from '../data/mathF1Bank.ts';
import { getAdvMathF6DiagramSvg } from '../data/advMathF6Bank.ts';

export interface QuestionDiagramSpec {
  title: string;
  svgHtml: string;
  caption?: string;
}

function escapeSvgText(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanLatexForSvgLabel(raw: string): string {
  return escapeSvgText(
    String(raw || '')
      .replace(/\$/g, '')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\overline\{([^}]*)\}/g, '$1')
      .replace(/\\triangle\s*/g, '△')
      .replace(/\\angle\s*/g, '∠')
      .replace(/\\circ/g, '°')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\mu/g, 'μ')
      .replace(/\\cap/g, '∩')
      .replace(/\\cup/g, '∪')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\ne/g, '≠')
      .replace(/\\times/g, '×')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Strictly inspects the question text itself (never triggering on topic name alone)
 * and generates a question-specific, dynamically parameterized SVG diagram ONLY when
 * the question genuinely describes or requires a figure, geometric shape, Venn diagram,
 * graph with specific features, switching network, or 3D solid.
 *
 * Purely algebraic, symbolic, or numerical questions return `null` so no repeated or
 * irrelevant diagrams are ever displayed.
 */
export function getQuestionDiagramSvg(
  questionText: string,
  _topic?: string,
  _subTopic?: string,
  _subject?: string
): QuestionDiagramSpec | null {
  if (!questionText) return null;

  // Strip leading "[Form X • Chapter Y: ...]" or "[Exercise X.Y QZ]" metadata tag before analyzing
  const body = questionText.replace(/^\s*(\[[^\]]+\]\s*)+/g, '').trim();
  const qLower = body.toLowerCase();
  const subLower = (_subject || '').toLowerCase();

  // Check Form 1 Basic Mathematics exact vector SVG diagrams
  const mathF1Diagram = getMathF1DiagramSvg(questionText, _topic, _subTopic);
  if (mathF1Diagram) return mathF1Diagram;

  // Check Form 6 Advanced Mathematics exact vector SVG diagrams
  const advMathF6Diagram = getAdvMathF6DiagramSvg(questionText, _topic, _subTopic);
  if (advMathF6Diagram) return advMathF6Diagram;

  // Check Form 2 Physics high-precision vector SVG diagrams first when subject is Physics or question has Physics F2 figures
  if (
    subLower.includes('physics') ||
    subLower.includes('fizikia') ||
    /figure\s+[1-6]\.\d+|electroscope|wheatstone|metre bridge|concave mirror|convex mirror|compound microscope|astronomical telescope/i.test(
      questionText
    )
  ) {
    const physDiagram = getPhysicsF2DiagramSvg(questionText, _topic, _subTopic);
    if (physDiagram) return physDiagram;
  }

  // ============================================================================
  // 1. ELECTRICAL SWITCHING NETWORK (Only when question asks about switches/terminals)
  // ============================================================================
  if (
    qLower.includes('switching') ||
    qLower.includes('electrical network') ||
    qLower.includes('switches in parallel') ||
    qLower.includes('switches in series') ||
    (qLower.includes('current flows') && (qLower.includes('t_1') || qLower.includes('terminal')))
  ) {
    const exprMatch = body.match(/\$([^$]*(?:\\land|\\lor)[^$]*)\$/);
    const exprLabel = exprMatch ? cleanLatexForSvgLabel(exprMatch[1]) : 'p ∧ (q ∨ r)';
    const isParallelOfSeries = qLower.includes('(p \\land q) \\lor') || qLower.includes('parallel with');

    if (isParallelOfSeries) {
      return {
        title: `Switching Circuit: ${exprLabel}`,
        caption: `Parallel branches between terminals T₁ and T₂ for ${exprLabel}`,
        svgHtml: `<svg viewBox="0 0 400 165" class="w-full max-w-[360px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="165" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="35" cy="85" r="4.5" fill="#0f172a"/>
          <text x="35" y="106" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">T₁</text>
          <line x1="40" y1="85" x2="95" y2="85" stroke="#0f172a" stroke-width="2.2"/>
          <line x1="95" y1="45" x2="95" y2="125" stroke="#0f172a" stroke-width="2.2"/>
          <!-- Upper branch: p and q in series -->
          <line x1="95" y1="45" x2="135" y2="45" stroke="#0f172a" stroke-width="2.2"/>
          <line x1="135" y1="45" x2="165" y2="28" stroke="#2563eb" stroke-width="2.6"/>
          <text x="150" y="23" text-anchor="middle" font-size="11" font-weight="800" fill="#1d4ed8">p</text>
          <line x1="170" y1="45" x2="215" y2="45" stroke="#0f172a" stroke-width="2.2"/>
          <line x1="215" y1="45" x2="245" y2="28" stroke="#059669" stroke-width="2.6"/>
          <text x="230" y="23" text-anchor="middle" font-size="11" font-weight="800" fill="#047857">q</text>
          <line x1="250" y1="45" x2="305" y2="45" stroke="#0f172a" stroke-width="2.2"/>
          <!-- Lower branch: r -->
          <line x1="95" y1="125" x2="175" y2="125" stroke="#0f172a" stroke-width="2.2"/>
          <line x1="175" y1="125" x2="215" y2="106" stroke="#d97706" stroke-width="2.6"/>
          <text x="195" y="102" text-anchor="middle" font-size="11" font-weight="800" fill="#b45309">r / ¬p</text>
          <line x1="220" y1="125" x2="305" y2="125" stroke="#0f172a" stroke-width="2.2"/>
          <line x1="305" y1="45" x2="305" y2="125" stroke="#0f172a" stroke-width="2.2"/>
          <line x1="305" y1="85" x2="360" y2="85" stroke="#0f172a" stroke-width="2.2"/>
          <circle cx="365" cy="85" r="4.5" fill="#0f172a"/>
          <text x="365" y="106" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">T₂</text>
        </svg>`,
      };
    }

    return {
      title: `Switching Circuit: ${exprLabel}`,
      caption: `Series-parallel switching network between T₁ and T₂`,
      svgHtml: `<svg viewBox="0 0 400 165" class="w-full max-w-[360px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="165" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="35" cy="85" r="4.5" fill="#0f172a"/>
        <text x="35" y="106" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">T₁</text>
        <line x1="40" y1="85" x2="90" y2="85" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="90" y1="85" x2="125" y2="66" stroke="#2563eb" stroke-width="2.6"/>
        <text x="108" y="60" text-anchor="middle" font-size="11.5" font-weight="800" fill="#1d4ed8">p</text>
        <line x1="130" y1="85" x2="175" y2="85" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="175" y1="48" x2="175" y2="122" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="175" y1="48" x2="215" y2="48" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="215" y1="48" x2="250" y2="30" stroke="#059669" stroke-width="2.6"/>
        <text x="233" y="25" text-anchor="middle" font-size="11.5" font-weight="800" fill="#047857">q</text>
        <line x1="255" y1="48" x2="295" y2="48" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="175" y1="122" x2="215" y2="122" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="215" y1="122" x2="250" y2="104" stroke="#d97706" stroke-width="2.6"/>
        <text x="233" y="99" text-anchor="middle" font-size="11.5" font-weight="800" fill="#b45309">r</text>
        <line x1="255" y1="122" x2="295" y2="122" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="295" y1="48" x2="295" y2="122" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="295" y1="85" x2="360" y2="85" stroke="#0f172a" stroke-width="2.2"/>
        <circle cx="365" cy="85" r="4.5" fill="#0f172a"/>
        <text x="365" y="106" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">T₂</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 2. VENN DIAGRAMS (Only when question explicitly mentions Venn diagram or a 2/3-group survey)
  // ============================================================================
  const isVennSurvey =
    qLower.includes('venn diagram') ||
    (qLower.includes('in a survey') && (qLower.includes('both') || qLower.includes('all three'))) ||
    (qLower.includes('in a class of') && qLower.includes('both')) ||
    (qLower.includes('in a group of') && qLower.includes('both')) ||
    (qLower.includes('in a form 3') && qLower.includes('all three')) ||
    (qLower.includes('in an examination') && qLower.includes('passed') && qLower.includes('both')) ||
    (qLower.includes('n(a \\cap b \\cap c)'));

  if (isVennSurvey) {
    const nums = (body.match(/\b\d+\b/g) || []).map(Number);
    const isThreeSet =
      qLower.includes('all three') ||
      qLower.includes('three subjects') ||
      qLower.includes('a \\cap b \\cap c') ||
      qLower.includes('e \\cap k \\cap f') ||
      (qLower.includes('physics') && qLower.includes('chemistry') && qLower.includes('biology'));

    if (isThreeSet) {
      const centerVal = nums.length >= 7 ? String(nums[nums.length - 1]) : 'x';
      return {
        title: '3-Set Venn Diagram',
        caption: 'Three intersecting sets inside Universal Set μ',
        svgHtml: `<svg viewBox="0 0 360 215" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="344" height="199" rx="10" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
          <text x="20" y="26" font-size="12" font-weight="800" fill="#0f172a">μ</text>
          <circle cx="150" cy="88" r="52" fill="#3b82f6" fill-opacity="0.14" stroke="#2563eb" stroke-width="2"/>
          <circle cx="210" cy="88" r="52" fill="#10b981" fill-opacity="0.14" stroke="#059669" stroke-width="2"/>
          <circle cx="180" cy="140" r="52" fill="#f59e0b" fill-opacity="0.14" stroke="#d97706" stroke-width="2"/>
          <text x="110" y="56" font-size="12" font-weight="800" fill="#1d4ed8">A</text>
          <text x="248" y="56" font-size="12" font-weight="800" fill="#047857">B</text>
          <text x="180" y="186" text-anchor="middle" font-size="12" font-weight="800" fill="#b45309">C</text>
          <text x="180" y="109" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">${escapeSvgText(centerVal)}</text>
        </svg>`,
      };
    }

    // Extract actual group names if present
    let labelA = 'Set A';
    let labelB = 'Set B';
    if (qLower.includes('mathematics') && qLower.includes('physics')) {
      labelA = 'Math (M)';
      labelB = 'Physics (P)';
    } else if (qLower.includes('mathematics') && qLower.includes('english')) {
      labelA = 'Math (M)';
      labelB = 'English (E)';
    } else if (qLower.includes('chemistry') && qLower.includes('biology')) {
      labelA = 'Chem (C)';
      labelB = 'Bio (B)';
    } else if (qLower.includes('maize') && qLower.includes('beans')) {
      labelA = 'Maize (M)';
      labelB = 'Beans (B)';
    } else if (qLower.includes('football') && qLower.includes('basketball')) {
      labelA = 'Football';
      labelB = 'Basketball';
    } else if (qLower.includes('p \\cap q')) {
      labelA = 'Set P';
      labelB = 'Set Q';
    }

    const totalStr = nums[0] ? `n(μ) = ${nums[0]}` : 'μ';
    const bothStr = nums.length >= 3 ? `${nums[2]}` : 'x';

    return {
      title: `Venn Diagram: ${labelA} & ${labelB}`,
      caption: `Two-set Venn diagram inside Universal Set (${totalStr})`,
      svgHtml: `<svg viewBox="0 0 360 185" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="344" height="169" rx="10" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <text x="20" y="27" font-size="12" font-weight="800" fill="#0f172a">${escapeSvgText(totalStr)}</text>
        <circle cx="145" cy="98" r="54" fill="#3b82f6" fill-opacity="0.15" stroke="#2563eb" stroke-width="2.2"/>
        <circle cx="215" cy="98" r="54" fill="#10b981" fill-opacity="0.15" stroke="#059669" stroke-width="2.2"/>
        <text x="112" y="54" font-size="11.5" font-weight="800" fill="#1d4ed8">${escapeSvgText(labelA)}</text>
        <text x="235" y="54" font-size="11.5" font-weight="800" fill="#047857">${escapeSvgText(labelB)}</text>
        <text x="115" y="102" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3a8a">Only A</text>
        <text x="180" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">${escapeSvgText(bothStr)}</text>
        <text x="245" y="102" text-anchor="middle" font-size="11" font-weight="700" fill="#065f46">Only B</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 3. SIMILAR & CONGRUENT TRIANGLES (Only when question describes a specific triangle figure)
  // ============================================================================
  // 3A. Bowtie / Hourglass intersecting triangles (e.g. △ABE and △CDE or △AOB and △COD with AB || CD)
  if (
    (qLower.includes('abe') && qLower.includes('cde')) ||
    (qLower.includes('aob') && qLower.includes('cod')) ||
    (qLower.includes('pxq') && qLower.includes('rxs')) ||
    (qLower.includes('intersect') && qLower.includes('parallel') && qLower.includes('similar'))
  ) {
    return {
      title: 'Intersecting Similar Triangles (AB ∥ DC)',
      caption: 'Vertically opposite angles at E and alternate interior angles give △ABE ∼ △DCE',
      svgHtml: `<svg viewBox="0 0 360 195" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="195" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Left vertical/slanted segment AB and Right segment CD intersecting at E -->
        <polygon points="75,35 75,160 185,98" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.3"/>
        <polygon points="285,35 285,160 185,98" fill="#ecfdf5" stroke="#047857" stroke-width="2.3"/>
        <!-- Parallel arrows on AB and CD -->
        <polyline points="70,92 75,84 80,92" fill="none" stroke="#1d4ed8" stroke-width="2"/>
        <polyline points="280,92 285,84 290,92" fill="none" stroke="#047857" stroke-width="2"/>
        <circle cx="185" cy="98" r="3.5" fill="#dc2626"/>
        <text x="58" y="38" font-size="12" font-weight="800" fill="#0f172a">A</text>
        <text x="58" y="165" font-size="12" font-weight="800" fill="#0f172a">B</text>
        <text x="185" y="84" text-anchor="middle" font-size="12" font-weight="800" fill="#dc2626">E</text>
        <text x="295" y="38" font-size="12" font-weight="800" fill="#0f172a">C</text>
        <text x="295" y="165" font-size="12" font-weight="800" fill="#0f172a">D</text>
      </svg>`,
    };
  }

  // 3B. Triangle with line DE || BC (Basic Proportionality / Intercept Theorem)
  if (
    qLower.includes('de \\parallel bc') ||
    qLower.includes('parallel to bc') ||
    (qLower.includes('parallel to') && qLower.includes('intersects ab'))
  ) {
    const adMatch = body.match(/AD\}?\s*=\s*([0-9.]+)\s*(?:\\text\{)?(cm|m)?/i);
    const dbMatch = body.match(/DB\}?\s*=\s*([0-9.]+)\s*(?:\\text\{)?(cm|m)?/i);
    const deMatch = body.match(/DE\}?\s*=\s*([0-9.]+)\s*(?:\\text\{)?(cm|m)?/i);
    const bcMatch = body.match(/BC\}?\s*=\s*([0-9.]+)\s*(?:\\text\{)?(cm|m)?/i);

    const adLabel = adMatch ? `AD = ${adMatch[1]} ${adMatch[2] || 'cm'}` : 'AD';
    const dbLabel = dbMatch ? `DB = ${dbMatch[1]} ${dbMatch[2] || 'cm'}` : 'DB';
    const deLabel = deMatch ? `DE = ${deMatch[1]} ${deMatch[2] || 'cm'}` : 'DE';
    const bcLabel = bcMatch ? `BC = ${bcMatch[1]} ${bcMatch[2] || 'cm'}` : 'BC';

    return {
      title: 'Similar Triangles: Line DE Parallel to Base BC (DE ∥ BC)',
      caption: '△ADE ∼ △ABC by AA Similarity',
      svgHtml: `<svg viewBox="0 0 360 195" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="195" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <polygon points="180,22 65,168 295,168" fill="#eff6ff" stroke="#1e293b" stroke-width="2.3"/>
        <line x1="120" y1="98" x2="240" y2="98" stroke="#2563eb" stroke-width="2.5"/>
        <text x="180" y="16" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0f172a">A</text>
        <text x="104" y="102" font-size="12" font-weight="800" fill="#1d4ed8">D</text>
        <text x="248" y="102" font-size="12" font-weight="800" fill="#1d4ed8">E</text>
        <text x="48" y="172" font-size="12.5" font-weight="800" fill="#0f172a">B</text>
        <text x="304" y="172" font-size="12.5" font-weight="800" fill="#0f172a">C</text>
        <text x="115" y="60" font-size="10.5" font-weight="800" fill="#dc2626">${escapeSvgText(adLabel)}</text>
        <text x="72" y="138" font-size="10.5" font-weight="800" fill="#047857">${escapeSvgText(dbLabel)}</text>
        <text x="180" y="92" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1d4ed8">${escapeSvgText(deLabel)}</text>
        <text x="180" y="185" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0f172a">${escapeSvgText(bcLabel)}</text>
      </svg>`,
    };
  }

  // 3C. Angle Bisector Theorem in △ABC (AD bisects ∠BAC)
  if (qLower.includes('bisector') && qLower.includes('bac') && qLower.includes('bc')) {
    return {
      title: 'Angle Bisector in △ABC (AD Bisects ∠BAC)',
      caption: 'Angle Bisector Theorem: AB / AC = BD / DC',
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <polygon points="165,24 65,162 295,162" fill="#eff6ff" stroke="#1e293b" stroke-width="2.3"/>
        <line x1="165" y1="24" x2="165" y2="162" stroke="#dc2626" stroke-width="2.2" stroke-dasharray="4,3"/>
        <text x="165" y="17" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0f172a">A</text>
        <text x="50" y="166" font-size="12.5" font-weight="800" fill="#0f172a">B</text>
        <text x="165" y="178" text-anchor="middle" font-size="12" font-weight="800" fill="#dc2626">D</text>
        <text x="304" y="166" font-size="12.5" font-weight="800" fill="#0f172a">C</text>
        <text x="152" y="56" font-size="10" font-weight="800" fill="#dc2626">θ</text>
        <text x="172" y="56" font-size="10" font-weight="800" fill="#dc2626">θ</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 4. CIRCLE GEOMETRY (Sub-typed to the exact circle theorem in the question!)
  // ============================================================================
  // 4A. Intersecting Chords (AX * XB = CX * XD) or Secants / Tangent-Secant from external point P
  if (
    (qLower.includes('chord') && qLower.includes('intersect') && qLower.includes('inside a circle')) ||
    (qLower.includes('secant') && qLower.includes('circle'))
  ) {
    if (qLower.includes('secant')) {
      return {
        title: 'Secant Segments from External Point P',
        caption: 'External Power of a Point: PA · PB = PC · PD (or PT² = PA · PB)',
        svgHtml: `<svg viewBox="0 0 370 190" class="w-full max-w-[350px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
          <rect width="370" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="235" cy="95" r="68" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
          <!-- External point P at (55, 95) -->
          <line x1="55" y1="95" x2="285" y2="48" stroke="#2563eb" stroke-width="2.3"/>
          <line x1="55" y1="95" x2="285" y2="142" stroke="#059669" stroke-width="2.3"/>
          <circle cx="55" cy="95" r="4" fill="#dc2626"/>
          <circle cx="172" cy="71" r="3.5" fill="#1d4ed8"/>
          <circle cx="285" cy="48" r="3.5" fill="#1d4ed8"/>
          <circle cx="172" cy="119" r="3.5" fill="#047857"/>
          <circle cx="285" cy="142" r="3.5" fill="#047857"/>
          <text x="40" y="99" font-size="12" font-weight="800" fill="#dc2626">P</text>
          <text x="168" y="62" font-size="11.5" font-weight="800" fill="#1d4ed8">A</text>
          <text x="294" y="48" font-size="11.5" font-weight="800" fill="#1d4ed8">B</text>
          <text x="168" y="136" font-size="11.5" font-weight="800" fill="#047857">C</text>
          <text x="294" y="148" font-size="11.5" font-weight="800" fill="#047857">D/T</text>
        </svg>`,
      };
    }

    return {
      title: 'Intersecting Chords AB and CD at Point X',
      caption: 'Internal Intersecting Chords Theorem: AX · XB = CX · XD',
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="180" cy="95" r="70" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
        <line x1="120" y1="58" x2="245" y2="122" stroke="#2563eb" stroke-width="2.4"/>
        <line x1="125" y1="138" x2="235" y2="45" stroke="#059669" stroke-width="2.4"/>
        <circle cx="176" cy="87" r="4" fill="#dc2626"/>
        <text x="106" y="56" font-size="12" font-weight="800" fill="#1d4ed8">A</text>
        <text x="253" y="128" font-size="12" font-weight="800" fill="#1d4ed8">B</text>
        <text x="112" y="146" font-size="12" font-weight="800" fill="#047857">C</text>
        <text x="242" y="42" font-size="12" font-weight="800" fill="#047857">D</text>
        <text x="176" y="75" text-anchor="middle" font-size="12" font-weight="800" fill="#dc2626">X</text>
      </svg>`,
    };
  }

  // 4B. Cyclic Quadrilateral ABCD or PQRS
  if (qLower.includes('cyclic quadrilateral')) {
    const isPQRS = qLower.includes('pqrs');
    const [v1, v2, v3, v4] = isPQRS ? ['P', 'Q', 'R', 'S'] : ['A', 'B', 'C', 'D'];
    const angMatches = body.match(/\d+\s*\^?\\?circ|\d+°/g) || [];
    const ang1 = angMatches[0] ? cleanLatexForSvgLabel(angMatches[0]) : 'θ₁';

    return {
      title: `Cyclic Quadrilateral ${v1}${v2}${v3}${v4} Inscribed in a Circle`,
      caption: `Opposite interior angles of a cyclic quadrilateral are supplementary (sum to 180°)`,
      svgHtml: `<svg viewBox="0 0 360 195" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="195" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="180" cy="98" r="72" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
        <polygon points="122,55 232,48 245,135 118,142" fill="#eff6ff" fill-opacity="0.65" stroke="#2563eb" stroke-width="2.3"/>
        <line x1="118" y1="142" x2="295" y2="131" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,3"/>
        <text x="108" y="52" font-size="12" font-weight="800" fill="#0f172a">${v1}</text>
        <text x="240" y="44" font-size="12" font-weight="800" fill="#0f172a">${v2}</text>
        <text x="254" y="148" font-size="12" font-weight="800" fill="#0f172a">${v3}</text>
        <text x="102" y="150" font-size="12" font-weight="800" fill="#0f172a">${v4}</text>
        <text x="215" y="68" font-size="10.5" font-weight="800" fill="#dc2626">${escapeSvgText(ang1)}</text>
      </svg>`,
    };
  }

  // 4C. Tangent(s) to a Circle from External Point T
  if (qLower.includes('tangent') && qLower.includes('circle')) {
    return {
      title: 'Tangent(s) from External Point T to Circle (Centre O)',
      caption: 'Radius OP ⊥ Tangent TP (∠OPT = 90°) and equal tangents TA = TB',
      svgHtml: `<svg viewBox="0 0 370 190" class="w-full max-w-[350px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="370" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="135" cy="95" r="64" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
        <!-- Center O(135,95), External point T(295,95), Tangent points A/P(161,36) and B(161,154) -->
        <line x1="135" y1="95" x2="161" y2="36" stroke="#dc2626" stroke-width="2.2"/>
        <line x1="135" y1="95" x2="161" y2="154" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>
        <line x1="161" y1="36" x2="295" y2="95" stroke="#2563eb" stroke-width="2.4"/>
        <line x1="161" y1="154" x2="295" y2="95" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,3"/>
        <line x1="135" y1="95" x2="295" y2="95" stroke="#059669" stroke-width="2"/>
        <circle cx="135" cy="95" r="3.5" fill="#0f172a"/>
        <circle cx="295" cy="95" r="4" fill="#1d4ed8"/>
        <text x="120" y="99" font-size="12" font-weight="800" fill="#0f172a">O</text>
        <text x="160" y="26" font-size="12" font-weight="800" fill="#dc2626">P / A (90°)</text>
        <text x="160" y="172" font-size="12" font-weight="800" fill="#64748b">B</text>
        <text x="308" y="99" font-size="12" font-weight="800" fill="#1d4ed8">T</text>
      </svg>`,
    };
  }

  // 4D. Chord & Perpendicular Distance from Centre O
  if (qLower.includes('chord') && (qLower.includes('radius') || qLower.includes('centre'))) {
    const rMatch = body.match(/radius\s*(?:of\s*)?\$?(\d+(?:\.\d+)?)/i);
    const rLabel = rMatch ? `r = ${rMatch[1]} cm` : 'r';

    return {
      title: 'Circle Chord AB and Perpendicular Distance OM from Centre O',
      caption: 'Perpendicular from centre O bisects chord AB (AM = MB) and OA² = OM² + AM²',
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="180" cy="95" r="68" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
        <!-- Chord AB at y=135 -->
        <line x1="125" y1="135" x2="235" y2="135" stroke="#2563eb" stroke-width="2.6"/>
        <!-- Radius OA -->
        <line x1="180" y1="95" x2="125" y2="135" stroke="#dc2626" stroke-width="2.2"/>
        <!-- Perpendicular OM -->
        <line x1="180" y1="95" x2="180" y2="135" stroke="#059669" stroke-width="2.2"/>
        <polyline points="180,127 188,127 188,135" fill="none" stroke="#059669" stroke-width="1.8"/>
        <circle cx="180" cy="95" r="3.5" fill="#0f172a"/>
        <text x="180" y="86" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">O</text>
        <text x="110" y="142" font-size="12" font-weight="800" fill="#1d4ed8">A</text>
        <text x="243" y="142" font-size="12" font-weight="800" fill="#1d4ed8">B</text>
        <text x="180" y="150" text-anchor="middle" font-size="11" font-weight="800" fill="#047857">M</text>
        <text x="142" y="108" font-size="10.5" font-weight="800" fill="#dc2626">${escapeSvgText(rLabel)}</text>
        <text x="192" y="118" font-size="10.5" font-weight="800" fill="#047857">d</text>
      </svg>`,
    };
  }

  // 4E. Sector / Arc Length / Angle at Centre vs Circumference
  if (
    (qLower.includes('arc') && qLower.includes('circle')) ||
    (qLower.includes('sector') && qLower.includes('circle')) ||
    (qLower.includes('subtend') && qLower.includes('circumference')) ||
    (qLower.includes('diameter') && qLower.includes('circumference'))
  ) {
    const degMatch = body.match(/(\d+)\s*\^?\\?circ|(\d+)\s*°/);
    const degVal = degMatch ? `${degMatch[1] || degMatch[2]}°` : 'θ';
    const rMatch = body.match(/radius\s*(?:of\s*)?\$?(\d+(?:\.\d+)?)/i);
    const rVal = rMatch ? `r = ${rMatch[1]} cm` : 'r';

    return {
      title: `Circle Sector & Subtended Angle (${degVal})`,
      caption: `Central angle ∠AOB = ${degVal} with radius ${rVal}`,
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="180" cy="98" r="68" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
        <path d="M180,98 L128,142 A68,68 0 0,0 232,142 Z" fill="#dbeafe" fill-opacity="0.65" stroke="#2563eb" stroke-width="2.2"/>
        <line x1="128" y1="142" x2="180" y2="30" stroke="#059669" stroke-width="1.8" stroke-dasharray="4,3"/>
        <line x1="232" y1="142" x2="180" y2="30" stroke="#059669" stroke-width="1.8" stroke-dasharray="4,3"/>
        <circle cx="180" cy="98" r="3.5" fill="#0f172a"/>
        <text x="180" y="89" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0f172a">O</text>
        <text x="180" y="122" text-anchor="middle" font-size="11" font-weight="800" fill="#dc2626">${escapeSvgText(degVal)}</text>
        <text x="142" y="115" font-size="10.5" font-weight="800" fill="#1d4ed8">${escapeSvgText(rVal)}</text>
        <text x="114" y="152" font-size="12" font-weight="800" fill="#0f172a">A</text>
        <text x="242" y="152" font-size="12" font-weight="800" fill="#0f172a">B</text>
        <text x="180" y="23" text-anchor="middle" font-size="11.5" font-weight="800" fill="#047857">C</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 5. RIGHT-ANGLED TRIANGLES, LADDER, ELEVATION/DEPRESSION & COMPASS BEARINGS
  // (Strictly only when the question describes a geometric triangle/tower/cliff/ladder/bearing!)
  // ============================================================================
  if (qLower.includes('bearing')) {
    const degMatches = body.match(/\b\d{2,3}\s*\^?\\?circ|\b\d{2,3}°/g) || [];
    const b1 = degMatches[0] ? cleanLatexForSvgLabel(degMatches[0]) : 'θ°';

    return {
      title: `Compass Bearing Diagram (${b1} Clockwise from North)`,
      caption: 'Three-figure bearings measured clockwise from true North (N)',
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="95" y1="145" x2="95" y2="30" stroke="#1d4ed8" stroke-width="2"/>
        <polygon points="95,24 90,34 100,34" fill="#1d4ed8"/>
        <text x="95" y="19" text-anchor="middle" font-size="11.5" font-weight="800" fill="#1d4ed8">N</text>
        <line x1="245" y1="75" x2="245" y2="22" stroke="#1d4ed8" stroke-width="2"/>
        <polygon points="245,16 240,25 250,25" fill="#1d4ed8"/>
        <text x="245" y="13" text-anchor="middle" font-size="11.5" font-weight="800" fill="#1d4ed8">N</text>
        <line x1="95" y1="145" x2="245" y2="75" stroke="#0f172a" stroke-width="2.5"/>
        <path d="M95,110 A35,35 0 0,1 126,130" fill="none" stroke="#dc2626" stroke-width="2"/>
        <text x="122" y="108" font-size="11" font-weight="800" fill="#dc2626">${escapeSvgText(b1)}</text>
        <circle cx="95" cy="145" r="4" fill="#0f172a"/>
        <circle cx="245" cy="75" r="4" fill="#0f172a"/>
        <text x="78" y="155" font-size="12" font-weight="800" fill="#0f172a">A</text>
        <text x="256" y="80" font-size="12" font-weight="800" fill="#0f172a">B</text>
      </svg>`,
    };
  }

  const isRightTriangleProblem =
    qLower.includes('right-angled') ||
    qLower.includes('right triangle') ||
    qLower.includes('hypotenuse') ||
    qLower.includes('ladder') ||
    qLower.includes('angle of elevation') ||
    qLower.includes('angles of elevation') ||
    qLower.includes('angle of depression') ||
    (qLower.includes('diagonal') && qLower.includes('rectangle'));

  if (isRightTriangleProblem) {
    const triMatch = body.match(/\\triangle\s*([A-Z]{3})|triangle\s+([A-Z]{3})/i);
    const triName = (triMatch?.[1] || triMatch?.[2] || 'ABC').toUpperCase();
    const [vA, vB, vC] = [triName[0] || 'A', triName[1] || 'B', triName[2] || 'C'];

    const degMatch = body.match(/(\d+)\s*\^?\\?circ|(\d+)\s*°/);
    const angleLabel = degMatch ? `${degMatch[1] || degMatch[2]}°` : 'θ';

    const measureMatches = body.match(/\d+(?:\.\d+)?\s*(?:\\text\{)?\s*(?:cm|m|km)\b/gi) || [];
    const m1 = measureMatches[0] ? cleanLatexForSvgLabel(measureMatches[0]) : 'Adjacent';
    const m2 = measureMatches[1] ? cleanLatexForSvgLabel(measureMatches[1]) : 'Opposite / Hypotenuse';

    return {
      title: `Right-Angled Triangle △${vA}${vB}${vC} (${angleLabel})`,
      caption: `Right-angled figure showing ${m1}, ${m2}, and angle ${angleLabel}`,
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <polygon points="70,152 280,152 280,36" fill="#eff6ff" stroke="#1e293b" stroke-width="2.4"/>
        <polyline points="262,152 262,134 280,134" fill="none" stroke="#dc2626" stroke-width="2"/>
        <path d="M115,152 A45,45 0 0,0 110,130" fill="none" stroke="#2563eb" stroke-width="2"/>
        <text x="126" y="144" font-size="11.5" font-weight="800" fill="#1d4ed8">${escapeSvgText(angleLabel)}</text>
        <text x="52" y="156" font-size="12.5" font-weight="800" fill="#0f172a">${vA}</text>
        <text x="290" y="156" font-size="12.5" font-weight="800" fill="#0f172a">${vB} (90°)</text>
        <text x="280" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0f172a">${vC}</text>
        <text x="175" y="174" text-anchor="middle" font-size="11" font-weight="800" fill="#047857">${escapeSvgText(m1)}</text>
        <text x="160" y="84" text-anchor="middle" font-size="11" font-weight="800" fill="#1d4ed8">${escapeSvgText(m2)}</text>
      </svg>`,
    };
  }

  // 5B. Scalene Triangle (Sine Rule / Cosine Rule / Area of △ABC or △PQR)
  if (
    (qLower.includes('\\triangle') || qLower.includes('triangle')) &&
    (qLower.includes('sine rule') ||
      qLower.includes('cosine rule') ||
      qLower.includes('included angle') ||
      qLower.includes('equilateral triangle') ||
      qLower.includes('isosceles triangle') ||
      qLower.includes('largest interior angle'))
  ) {
    const isPQR = qLower.includes('pqr');
    const [vA, vB, vC] = isPQR ? ['P', 'Q', 'R'] : ['A', 'B', 'C'];
    const degMatch = body.match(/(\d+)\s*\^?\\?circ|(\d+)\s*°/);
    const angLabel = degMatch ? `${degMatch[1] || degMatch[2]}°` : 'θ';
    const cmMatches = body.match(/\d+(?:\.\d+)?\s*(?:\\text\{)?\s*cm/gi) || [];
    const side1 = cmMatches[0] ? cleanLatexForSvgLabel(cmMatches[0]) : 'c';
    const side2 = cmMatches[1] ? cleanLatexForSvgLabel(cmMatches[1]) : 'b';

    return {
      title: `Triangle △${vA}${vB}${vC} (${side1}, ${side2}, ∠ = ${angLabel})`,
      caption: `Labeled triangle △${vA}${vB}${vC} for Sine / Cosine / Area calculation`,
      svgHtml: `<svg viewBox="0 0 360 185" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="185" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <polygon points="65,152 295,152 205,36" fill="#ecfdf5" fill-opacity="0.6" stroke="#0f172a" stroke-width="2.4"/>
        <path d="M105,152 A40,40 0 0,0 92,126" fill="none" stroke="#dc2626" stroke-width="2"/>
        <text x="112" y="142" font-size="11" font-weight="800" fill="#dc2626">${escapeSvgText(angLabel)}</text>
        <text x="48" y="156" font-size="12.5" font-weight="800" fill="#0f172a">${vA}</text>
        <text x="306" y="156" font-size="12.5" font-weight="800" fill="#0f172a">${vB}</text>
        <text x="205" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0f172a">${vC}</text>
        <text x="120" y="86" text-anchor="middle" font-size="11" font-weight="800" fill="#1d4ed8">${escapeSvgText(side1)}</text>
        <text x="180" y="172" text-anchor="middle" font-size="11" font-weight="800" fill="#047857">${escapeSvgText(side2)}</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 6. LINEAR PROGRAMMING FEASIBLE REGION (Only when vertices or feasible region are in the question)
  // ============================================================================
  if (
    qLower.includes('feasible region') ||
    qLower.includes('corner points') ||
    (qLower.includes('vertices') && (qLower.includes('maximize') || qLower.includes('minimize')))
  ) {
    const coordMatches = body.match(/\(\s*\d+\s*,\s*\d+\s*\)/g) || [];
    const vLabels = coordMatches.length > 0 ? coordMatches.slice(0, 4).join(', ') : '(0,0), (x₁,0), (x*,y*), (0,y₁)';

    return {
      title: 'Linear Programming Feasible Region on xy-Plane',
      caption: `Corner points: ${vLabels}`,
      svgHtml: `<svg viewBox="0 0 360 195" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="195" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="50" y1="158" x2="330" y2="158" stroke="#0f172a" stroke-width="2"/>
        <line x1="50" y1="158" x2="50" y2="20" stroke="#0f172a" stroke-width="2"/>
        <polygon points="50,158 50,68 155,95 225,158" fill="#10b981" fill-opacity="0.22" stroke="#059669" stroke-width="2.4"/>
        <circle cx="50" cy="158" r="4" fill="#0f172a"/>
        <circle cx="50" cy="68" r="4" fill="#047857"/>
        <circle cx="155" cy="95" r="4.5" fill="#dc2626"/>
        <circle cx="225" cy="158" r="4" fill="#047857"/>
        <text x="165" y="90" font-size="11" font-weight="800" fill="#dc2626">Intersection Vertex</text>
        <text x="120" y="135" text-anchor="middle" font-size="10.5" font-weight="800" fill="#065f46">Feasible Region</text>
        <text x="190" y="182" text-anchor="middle" font-size="10" font-weight="700" fill="#334155">Vertices: ${escapeSvgText(vLabels)}</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 7. GRAPHS OF FUNCTIONS: ASYMPTOTES & PARABOLA TURNING POINTS (Only when question asks for graph/asymptote/vertex)
  // ============================================================================
  if (qLower.includes('asymptote')) {
    const fnMatch = body.match(/\$([^$]+)\$/);
    const fnLabel = fnMatch ? cleanLatexForSvgLabel(fnMatch[1]) : 'y = f(x)';
    return {
      title: `Rational Function Asymptotes: ${fnLabel}`,
      caption: 'Vertical and horizontal/oblique asymptotes (dashed lines)',
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="35" y1="120" x2="330" y2="120" stroke="#64748b" stroke-width="1.5"/>
        <line x1="135" y1="18" x2="135" y2="175" stroke="#64748b" stroke-width="1.5"/>
        <line x1="200" y1="18" x2="200" y2="175" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,4"/>
        <line x1="35" y1="82" x2="330" y2="82" stroke="#059669" stroke-width="2" stroke-dasharray="5,4"/>
        <path d="M50,94 Q175,100 188,168" fill="none" stroke="#2563eb" stroke-width="2.5"/>
        <path d="M212,22 Q225,65 320,72" fill="none" stroke="#2563eb" stroke-width="2.5"/>
        <text x="208" y="32" font-size="10" font-weight="800" fill="#dc2626">Vertical Asymptote</text>
        <text x="45" y="75" font-size="10" font-weight="800" fill="#047857">Horizontal Asymptote</text>
      </svg>`,
    };
  }

  if (
    (qLower.includes('turning point') || qLower.includes('vertex')) &&
    (qLower.includes('quadratic') || qLower.includes('parabola') || qLower.includes('x^2') || qLower.includes('t^2'))
  ) {
    const isDownward = qLower.includes('-x^2') || qLower.includes('-2x^2') || qLower.includes('-5t^2') || qLower.includes('maximum');
    const pathD = isDownward ? 'M110,165 Q195,5 280,165' : 'M110,30 Q195,195 280,30';
    const vY = isDownward ? 85 : 112;

    return {
      title: `Quadratic Parabola (${isDownward ? 'Maximum Turning Point' : 'Minimum Turning Point'})`,
      caption: 'Parabola showing vertex V(h, k) and axis of symmetry x = h',
      svgHtml: `<svg viewBox="0 0 360 190" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="40" y1="135" x2="325" y2="135" stroke="#0f172a" stroke-width="1.8"/>
        <line x1="95" y1="18" x2="95" y2="175" stroke="#0f172a" stroke-width="1.8"/>
        <line x1="195" y1="18" x2="195" y2="175" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="5,4"/>
        <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="2.6"/>
        <circle cx="195" cy="${vY}" r="4.5" fill="#dc2626"/>
        <text x="205" y="${vY + 4}" font-size="11" font-weight="800" fill="#dc2626">Vertex V(h, k)</text>
        <text x="202" y="30" font-size="10" font-weight="800" fill="#dc2626">Axis x = h</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 8. CALCULUS: AREA BOUNDED BY A CURVE OR TANGENT TO A CURVE AT A POINT
  // ============================================================================
  if (qLower.includes('area of the region') || qLower.includes('bounded by the curve')) {
    return {
      title: 'Definite Integral: Shaded Area Bounded by Curve y = f(x)',
      caption: 'Area A = ∫ f(x) dx between the curve and the x-axis',
      svgHtml: `<svg viewBox="0 0 360 185" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="185" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="40" y1="148" x2="325" y2="148" stroke="#0f172a" stroke-width="2"/>
        <line x1="65" y1="168" x2="65" y2="20" stroke="#0f172a" stroke-width="2"/>
        <path d="M110,148 L110,95 Q185,28 260,80 L260,148 Z" fill="#3b82f6" fill-opacity="0.22" stroke="#2563eb" stroke-width="1.5"/>
        <path d="M75,132 Q185,12 305,105" fill="none" stroke="#1d4ed8" stroke-width="2.5"/>
        <text x="185" y="120" text-anchor="middle" font-size="11" font-weight="800" fill="#1e3a8a">Shaded Region A</text>
      </svg>`,
    };
  }

  if (qLower.includes('tangent') && qLower.includes('normal') && qLower.includes('curve')) {
    const ptMatch = body.match(/\(\s*-?\d+\s*,\s*-?\d+\s*\)/);
    const ptLabel = ptMatch ? ptMatch[0] : 'P(x₀, y₀)';
    return {
      title: `Tangent & Normal to Curve at ${ptLabel}`,
      caption: `Perpendicular tangent and normal lines intersecting at ${ptLabel} on y = f(x)`,
      svgHtml: `<svg viewBox="0 0 360 185" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="185" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="40" y1="150" x2="325" y2="150" stroke="#0f172a" stroke-width="1.8"/>
        <line x1="65" y1="168" x2="65" y2="20" stroke="#0f172a" stroke-width="1.8"/>
        <path d="M85,45 Q165,155 285,35" fill="none" stroke="#2563eb" stroke-width="2.5"/>
        <line x1="145" y1="138" x2="295" y2="48" stroke="#dc2626" stroke-width="2.2"/>
        <line x1="175" y1="35" x2="255" y2="162" stroke="#059669" stroke-width="2" stroke-dasharray="4,3"/>
        <circle cx="220" cy="93" r="4.5" fill="#dc2626"/>
        <text x="232" y="96" font-size="11" font-weight="800" fill="#dc2626">${escapeSvgText(ptLabel)}</text>
        <text x="275" y="42" font-size="10.5" font-weight="800" fill="#dc2626">Tangent</text>
        <text x="165" y="28" font-size="10.5" font-weight="800" fill="#047857">Normal</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 9. 3D SOLIDS (Cylinder, Cone, Pyramid) — Only when a specific solid is in the question
  // ============================================================================
  if (qLower.includes('cylinder') || qLower.includes('cone') || qLower.includes('pyramid')) {
    const cmMatches = body.match(/\d+(?:\.\d+)?\s*(?:\\text\{)?\s*(?:cm|m)\b/gi) || [];
    const d1 = cmMatches[0] ? cleanLatexForSvgLabel(cmMatches[0]) : 'r';
    const d2 = cmMatches[1] ? cleanLatexForSvgLabel(cmMatches[1]) : 'h';

    if (qLower.includes('cone') || qLower.includes('pyramid')) {
      return {
        title: `Right ${qLower.includes('cone') ? 'Cone' : 'Pyramid'} (${d1}, ${d2})`,
        caption: `Base dimension ${d1} and vertical/slant height ${d2}`,
        svgHtml: `<svg viewBox="0 0 340 185" class="w-full max-w-[320px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
          <rect width="340" height="185" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
          <polygon points="170,26 95,145 245,145" fill="#eff6ff" fill-opacity="0.6" stroke="#1d4ed8" stroke-width="2.2"/>
          <ellipse cx="170" cy="145" rx="75" ry="18" fill="#dbeafe" fill-opacity="0.5" stroke="#1d4ed8" stroke-width="2"/>
          <line x1="170" y1="26" x2="170" y2="145" stroke="#059669" stroke-width="2" stroke-dasharray="4,3"/>
          <line x1="170" y1="145" x2="245" y2="145" stroke="#dc2626" stroke-width="2"/>
          <text x="208" y="140" text-anchor="middle" font-size="11" font-weight="800" fill="#dc2626">${escapeSvgText(d1)}</text>
          <text x="155" y="95" text-anchor="end" font-size="11" font-weight="800" fill="#047857">${escapeSvgText(d2)}</text>
        </svg>`,
      };
    }

    return {
      title: `Right Circular Cylinder (${d1}, ${d2})`,
      caption: `Cylinder with radius ${d1} and height ${d2}`,
      svgHtml: `<svg viewBox="0 0 340 185" class="w-full max-w-[320px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="340" height="185" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <ellipse cx="170" cy="42" rx="62" ry="16" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="108" y1="42" x2="108" y2="142" stroke="#1d4ed8" stroke-width="2.2"/>
        <line x1="232" y1="42" x2="232" y2="142" stroke="#1d4ed8" stroke-width="2.2"/>
        <ellipse cx="170" cy="142" rx="62" ry="16" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="170" y1="42" x2="232" y2="42" stroke="#dc2626" stroke-width="2"/>
        <line x1="170" y1="42" x2="170" y2="142" stroke="#059669" stroke-width="2" stroke-dasharray="4,3"/>
        <text x="200" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#dc2626">${escapeSvgText(d1)}</text>
        <text x="158" y="95" text-anchor="end" font-size="11" font-weight="800" fill="#047857">${escapeSvgText(d2)}</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 10. GROUPED FREQUENCY DISTRIBUTION / CLASS INTERVAL TABLE
  // Dynamically parses class intervals (e.g. 10–19, 20–29, ...) and frequencies
  // from the question text and renders a crisp bordered SVG frequency table.
  // ============================================================================
  const intervalTableMatch = body.match(
    /Class\s+Intervals?\s*:\s*([^|;\n]+?)\s*(?:\||;)\s*Frequenc(?:y|ies)(?:\s*\(f\))?\s*:\s*([^.;\n]+)/i
  );
  const inlineIntervals = body.match(/\b\d+\s*(?:–|-|\\text\{–\}|\\text\{-\})\s*\d+\b/g) || [];

  if (intervalTableMatch || (inlineIntervals.length >= 3 && qLower.includes('frequenc'))) {
    let intervals: string[] = [];
    let freqs: string[] = [];

    if (intervalTableMatch) {
      intervals = intervalTableMatch[1]
        .split(/\s*,\s*/)
        .map((s) => cleanLatexForSvgLabel(s).replace(/-/g, '–'))
        .filter(Boolean);
      freqs = intervalTableMatch[2]
        .split(/\s*,\s*/)
        .map((s) => cleanLatexForSvgLabel(s))
        .filter(Boolean);
    } else {
      intervals = inlineIntervals.slice(0, 7).map((s) => cleanLatexForSvgLabel(s).replace(/-/g, '–'));
      const afterFreq = body.split(/frequenc(?:y|ies)(?:\s*\(?f\)?)?\s*(?:are|is|:)?/i)[1] || '';
      const freqTokens = afterFreq.match(/\b(?:\d+|[a-z])\b/gi) || [];
      freqs = freqTokens.slice(0, intervals.length);
    }

    if (intervals.length >= 3 && freqs.length >= intervals.length) {
      const cols = intervals.length;
      const labelColW = 108;
      const dataColW = Math.max(46, Math.floor((392 - labelColW) / cols));
      const totalW = labelColW + dataColW * cols + 16;
      const startX = 8;
      const startY = 8;
      const rowH = 28;

      // Compute class midpoints (x) and cumulative frequencies (cf) when numeric
      const midpoints = intervals.map((iv) => {
        const m = iv.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/);
        if (!m) return '—';
        const mid = (Number(m[1]) + Number(m[2])) / 2;
        return Number.isInteger(mid) ? String(mid) : mid.toFixed(1);
      });

      let runningCf = 0;
      let allNumericFreq = true;
      const cfValues = freqs.slice(0, cols).map((fStr) => {
        const n = Number(fStr);
        if (!Number.isFinite(n)) {
          allNumericFreq = false;
          return '—';
        }
        runningCf += n;
        return String(runningCf);
      });

      const tableH = rowH * 4;
      const svgH = tableH + 16;

      let cellsSvg = '';
      const rowLabels = ['Class Interval', 'Class Mark (x)', 'Frequency (f)', 'Cum. Freq (cf)'];
      const rowBgs = ['#eff6ff', '#f8fafc', '#ffffff', '#ecfdf5'];
      const rowTextColors = ['#1e3a8a', '#334155', '#0f172a', '#065f46'];

      for (let r = 0; r < 4; r++) {
        const y = startY + r * rowH;
        cellsSvg += `<rect x="${startX}" y="${y}" width="${labelColW}" height="${rowH}" fill="${rowBgs[r]}" stroke="#94a3b8" stroke-width="1.2"/>`;
        cellsSvg += `<text x="${startX + 8}" y="${y + 18}" font-size="10.5" font-weight="800" fill="${rowTextColors[r]}">${rowLabels[r]}</text>`;

        for (let c = 0; c < cols; c++) {
          const x = startX + labelColW + c * dataColW;
          const val =
            r === 0
              ? intervals[c]
              : r === 1
              ? midpoints[c]
              : r === 2
              ? freqs[c]
              : cfValues[c];
          cellsSvg += `<rect x="${x}" y="${y}" width="${dataColW}" height="${rowH}" fill="${rowBgs[r]}" stroke="#94a3b8" stroke-width="1.2"/>`;
          cellsSvg += `<text x="${x + dataColW / 2}" y="${y + 18}" text-anchor="middle" font-size="11" font-weight="${r === 0 || r === 2 ? '800' : '700'}" fill="${rowTextColors[r]}">${escapeSvgText(val)}</text>`;
        }
      }

      const totalFreqCaption = allNumericFreq ? `Total Frequency N = ∑f = ${runningCf}` : 'Grouped Frequency Distribution Table';

      return {
        title: `Grouped Frequency Distribution Table (${cols} Class Intervals)`,
        caption: `${totalFreqCaption} — showing Class Intervals, Midpoints (x), Frequencies (f), and Cumulative Frequencies (cf)`,
        svgHtml: `<svg viewBox="0 0 ${totalW} ${svgH}" class="w-full max-w-[460px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
          <rect width="${totalW}" height="${svgH}" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
          ${cellsSvg}
        </svg>`,
      };
    }
  }

  // ============================================================================
  // 11. CUMULATIVE FREQUENCY OGIVE / HISTOGRAM (Only when explicitly named in question)
  // ============================================================================
  if (qLower.includes('ogive') || qLower.includes('cumulative frequency curve') || qLower.includes('histogram')) {
    return {
      title: 'Cumulative Frequency Curve (Ogive) & Histogram',
      caption: 'Estimating quartiles and percentiles from cumulative frequency N',
      svgHtml: `<svg viewBox="0 0 360 185" class="w-full max-w-[340px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="360" height="185" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="50" y1="150" x2="325" y2="150" stroke="#0f172a" stroke-width="2"/>
        <line x1="50" y1="150" x2="50" y2="20" stroke="#0f172a" stroke-width="2"/>
        <path d="M65,150 C110,142 150,95 195,55 C235,32 275,26 310,24" fill="none" stroke="#dc2626" stroke-width="2.6"/>
        <line x1="50" y1="85" x2="165" y2="85" stroke="#059669" stroke-width="1.8" stroke-dasharray="4,3"/>
        <line x1="165" y1="85" x2="165" y2="150" stroke="#059669" stroke-width="1.8" stroke-dasharray="4,3"/>
        <text x="165" y="166" text-anchor="middle" font-size="10.5" font-weight="800" fill="#047857">Q₂ (Median)</text>
        <text x="285" y="42" font-size="11" font-weight="800" fill="#dc2626">Ogive</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 12. ICS CHAPTER 3 — FIGURE 3.1: ABACUS MODEL (Early Calculating Device)
  // ============================================================================
  if (/\babacus\b/i.test(body) || /figure\s*3\.1/i.test(body)) {
    return {
      title: 'Figure 3.1: Abacus Model (Early Mechanical Calculating Frame)',
      caption: 'Upper Deck (Heaven Beads = 5 units each), Dividing Beam, and Lower Deck (Earth Beads = 1 unit each) on Place-Value Rods',
      svgHtml: `<svg viewBox="0 0 420 210" class="w-full max-w-[400px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="420" height="210" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Outer Wooden Frame -->
        <rect x="35" y="18" width="260" height="162" rx="6" fill="#fef3c7" stroke="#78350f" stroke-width="7"/>
        <!-- Horizontal Dividing Beam -->
        <line x1="35" y1="74" x2="295" y2="74" stroke="#78350f" stroke-width="6"/>
        <!-- Vertical Place-Value Rods -->
        <line x1="80" y1="18" x2="80" y2="180" stroke="#92400e" stroke-width="3"/>
        <line x1="135" y1="18" x2="135" y2="180" stroke="#92400e" stroke-width="3"/>
        <line x1="190" y1="18" x2="190" y2="180" stroke="#92400e" stroke-width="3"/>
        <line x1="245" y1="18" x2="245" y2="180" stroke="#92400e" stroke-width="3"/>
        <!-- Upper Deck Beads (Value = 5) -->
        <ellipse cx="80" cy="40" rx="16" ry="8" fill="#1e3a8a" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="135" cy="56" rx="16" ry="8" fill="#1e3a8a" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="190" cy="40" rx="16" ry="8" fill="#1e3a8a" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="245" cy="56" rx="16" ry="8" fill="#1e3a8a" stroke="#0f172a" stroke-width="1.2"/>
        <!-- Lower Deck Beads (Value = 1) -->
        <ellipse cx="80" cy="96" rx="16" ry="8" fill="#2563eb" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="80" cy="116" rx="16" ry="8" fill="#2563eb" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="80" cy="156" rx="16" ry="8" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.2"/>
        <ellipse cx="135" cy="96" rx="16" ry="8" fill="#2563eb" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="135" cy="138" rx="16" ry="8" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.2"/>
        <ellipse cx="135" cy="158" rx="16" ry="8" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.2"/>
        <ellipse cx="190" cy="96" rx="16" ry="8" fill="#2563eb" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="190" cy="116" rx="16" ry="8" fill="#2563eb" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="190" cy="136" rx="16" ry="8" fill="#2563eb" stroke="#0f172a" stroke-width="1.2"/>
        <ellipse cx="245" cy="138" rx="16" ry="8" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.2"/>
        <ellipse cx="245" cy="158" rx="16" ry="8" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1.2"/>
        <!-- Place-Value Rod Labels -->
        <text x="80" y="196" text-anchor="middle" font-size="9.5" font-weight="800" fill="#334155">10³ (Th)</text>
        <text x="135" y="196" text-anchor="middle" font-size="9.5" font-weight="800" fill="#334155">10² (H)</text>
        <text x="190" y="196" text-anchor="middle" font-size="9.5" font-weight="800" fill="#334155">10¹ (T)</text>
        <text x="245" y="196" text-anchor="middle" font-size="9.5" font-weight="800" fill="#334155">10⁰ (O)</text>
        <!-- Callout Labels on Right -->
        <text x="308" y="45" font-size="9.5" font-weight="800" fill="#1e3a8a">Upper Deck</text>
        <text x="308" y="57" font-size="8.5" font-weight="700" fill="#475569">(Bead = 5)</text>
        <text x="308" y="77" font-size="9.5" font-weight="800" fill="#78350f">Dividing Beam</text>
        <text x="308" y="122" font-size="9.5" font-weight="800" fill="#2563eb">Lower Deck</text>
        <text x="308" y="134" font-size="8.5" font-weight="700" fill="#475569">(Bead = 1)</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 13. ICS CHAPTER 3 — EXERCISE 3.1 Q1: COMPUTER GENERATIONS MATCHING TABLE
  // ============================================================================
  if (qLower.includes('column a') && qLower.includes('column b') && qLower.includes('generation')) {
    return {
      title: 'Exercise 3.1 Q1: Computer Generations Matching Table',
      caption: 'Match each computer generation in Column A with its core electronic technology in Column B',
      svgHtml: `<svg viewBox="0 0 460 198" class="w-full max-w-[450px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="460" height="198" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Table Header -->
        <rect x="10" y="10" width="220" height="28" fill="#24132F" stroke="#493751" stroke-width="1.2"/>
        <rect x="230" y="10" width="220" height="28" fill="#24132F" stroke="#493751" stroke-width="1.2"/>
        <text x="20" y="28" font-size="11" font-weight="800" fill="#ffffff">Column A (Computer Generation)</text>
        <text x="240" y="28" font-size="11" font-weight="800" fill="#ffffff">Column B (Core Technology)</text>
        <!-- Row 1 -->
        <rect x="10" y="38" width="220" height="29" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="230" y="38" width="220" height="29" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="18" y="57" font-size="10.5" font-weight="700" fill="#0f172a">(i) Second generation computers</text>
        <text x="238" y="57" font-size="10.5" font-weight="700" fill="#1e3a8a">(a) Very Large Scale Integration (VLSI)</text>
        <!-- Row 2 -->
        <rect x="10" y="67" width="220" height="29" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="230" y="67" width="220" height="29" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <text x="18" y="86" font-size="10.5" font-weight="700" fill="#0f172a">(ii) Fifth generation computers</text>
        <text x="238" y="86" font-size="10.5" font-weight="700" fill="#1e3a8a">(b) Vacuum tubes</text>
        <!-- Row 3 -->
        <rect x="10" y="96" width="220" height="29" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="230" y="96" width="220" height="29" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="18" y="115" font-size="10.5" font-weight="700" fill="#0f172a">(iii) Fourth generation computers</text>
        <text x="238" y="115" font-size="10.5" font-weight="700" fill="#1e3a8a">(c) Transistors</text>
        <!-- Row 4 -->
        <rect x="10" y="125" width="220" height="29" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="230" y="125" width="220" height="29" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <text x="18" y="144" font-size="10.5" font-weight="700" fill="#0f172a">(iv) First generation computers</text>
        <text x="238" y="144" font-size="10.5" font-weight="700" fill="#1e3a8a">(d) Artificial intelligence (AI)</text>
        <!-- Row 5 -->
        <rect x="10" y="154" width="220" height="32" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <rect x="230" y="154" width="220" height="32" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
        <text x="18" y="174" font-size="10.5" font-weight="700" fill="#0f172a">(v) Third generation computers</text>
        <text x="238" y="174" font-size="10.5" font-weight="700" fill="#1e3a8a">(e) Semiconductor technology (ICs)</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 14. ICS CHAPTER 4 — EXERCISE 4.1 Q2: MOTHERBOARD BACK PANEL PORTS (Labeled A–F)
  // ============================================================================
  if (
    /ports\s+labeled\s+a\s*[–-]\s*f/i.test(body) ||
    (qLower.includes('motherboard') && qLower.includes('port'))
  ) {
    return {
      title: 'Exercise 4.1 Q2: Motherboard Back Panel I/O Ports (Labeled A–F)',
      caption: 'Identify Ports A, B, C, D, E, and F and the peripheral devices that connect to each port',
      svgHtml: `<svg viewBox="0 0 460 215" class="w-full max-w-[450px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="460" height="215" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Metallic I/O Shield Backplate -->
        <rect x="16" y="24" width="428" height="125" rx="8" fill="#f1f5f9" stroke="#475569" stroke-width="2.5"/>
        <!-- Port A: PS/2 Keyboard (Purple) & Mouse (Green) -->
        <circle cx="50" cy="58" r="15" fill="#7e22ce" stroke="#0f172a" stroke-width="1.8"/>
        <circle cx="50" cy="100" r="15" fill="#16a34a" stroke="#0f172a" stroke-width="1.8"/>
        <circle cx="50" cy="58" r="4" fill="#ffffff"/>
        <circle cx="50" cy="100" r="4" fill="#ffffff"/>
        <rect x="36" y="124" width="28" height="18" rx="4" fill="#24132F"/>
        <text x="50" y="137" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">A</text>
        <!-- Port B: Parallel / Serial Port -->
        <rect x="88" y="45" width="58" height="26" rx="5" fill="#db2777" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="94" y="84" width="46" height="24" rx="5" fill="#0d9488" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="103" y="124" width="28" height="18" rx="4" fill="#24132F"/>
        <text x="117" y="137" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">B</text>
        <!-- Port C: VGA / HDMI Video Port -->
        <rect x="164" y="45" width="56" height="28" rx="5" fill="#1d4ed8" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="172" y="85" width="40" height="18" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="178" y="124" width="28" height="18" rx="4" fill="#24132F"/>
        <text x="192" y="137" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">C</text>
        <!-- Port D: Dual USB Ports Stack -->
        <rect x="240" y="43" width="48" height="30" rx="3" fill="#0284c7" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="246" y="50" width="36" height="6" fill="#e0f2fe"/>
        <rect x="240" y="82" width="48" height="30" rx="3" fill="#0284c7" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="246" y="89" width="36" height="6" fill="#e0f2fe"/>
        <rect x="250" y="124" width="28" height="18" rx="4" fill="#24132F"/>
        <text x="264" y="137" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">D</text>
        <!-- Port E: RJ-45 Ethernet LAN Port -->
        <rect x="310" y="52" width="48" height="46" rx="4" fill="#f59e0b" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="318" y="62" width="32" height="26" rx="2" fill="#1e293b"/>
        <rect x="320" y="124" width="28" height="18" rx="4" fill="#24132F"/>
        <text x="334" y="137" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">E</text>
        <!-- Port F: 3.5mm Audio Jacks (Mic / Line-Out / Line-In) -->
        <circle cx="400" cy="46" r="11" fill="#ec4899" stroke="#0f172a" stroke-width="1.6"/>
        <circle cx="400" cy="74" r="11" fill="#22c55e" stroke="#0f172a" stroke-width="1.6"/>
        <circle cx="400" cy="102" r="11" fill="#38bdf8" stroke="#0f172a" stroke-width="1.6"/>
        <rect x="386" y="124" width="28" height="18" rx="4" fill="#24132F"/>
        <text x="400" y="137" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff">F</text>
        <!-- Legend Summary Below -->
        <text x="230" y="168" text-anchor="middle" font-size="9.5" font-weight="800" fill="#1e293b">A: PS/2 (Mouse/KB) • B: Parallel/Serial • C: VGA/HDMI (Monitor)</text>
        <text x="230" y="185" text-anchor="middle" font-size="9.5" font-weight="800" fill="#1e293b">D: USB Ports • E: RJ-45 Network (LAN) • F: Audio Jacks (Speaker/Mic)</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 15. ICS CHAPTER 4 — COMPUTER SYSTEM IPO CYCLE BLOCK DIAGRAM (INPUT -> CPU -> OUTPUT)
  // ============================================================================
  if (
    qLower.includes('ipo cycle') ||
    qLower.includes('input -> process') ||
    qLower.includes('block diagram of a computer') ||
    qLower.includes('functional components of the cpu') ||
    qLower.includes('function of the central processing unit')
  ) {
    return {
      title: 'Computer System Block Diagram (IPO Cycle: Input → Process → Output)',
      caption: 'Data Flow & Control Signals between Input Unit, CPU (CU, ALU, Registers), Memory/Storage, and Output Unit',
      svgHtml: `<svg viewBox="0 0 460 210" class="w-full max-w-[450px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="icsArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#1e293b" />
          </marker>
        </defs>
        <rect width="460" height="210" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- INPUT UNIT -->
        <rect x="16" y="55" width="95" height="62" rx="8" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
        <text x="63" y="82" text-anchor="middle" font-size="11" font-weight="900" fill="#1e3a8a">INPUT UNIT</text>
        <text x="63" y="98" text-anchor="middle" font-size="8.5" font-weight="700" fill="#334155">(Keyboard, Mouse)</text>
        <!-- Arrow Input -> CPU -->
        <line x1="111" y1="86" x2="148" y2="86" stroke="#1e293b" stroke-width="2.2" marker-end="url(#icsArrow)"/>
        <!-- CPU BOX -->
        <rect x="152" y="18" width="156" height="116" rx="8" fill="#f3e8ff" stroke="#6b21a8" stroke-width="2.2"/>
        <text x="230" y="34" text-anchor="middle" font-size="10.5" font-weight="900" fill="#581c87">PROCESS — CPU</text>
        <rect x="164" y="42" width="132" height="24" rx="4" fill="#ffffff" stroke="#7e22ce" stroke-width="1.2"/>
        <text x="230" y="58" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3b0764">Control Unit (CU)</text>
        <rect x="164" y="72" width="132" height="24" rx="4" fill="#ffffff" stroke="#7e22ce" stroke-width="1.2"/>
        <text x="230" y="88" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3b0764">Arithmetic Logic Unit (ALU)</text>
        <rect x="164" y="102" width="132" height="22" rx="4" fill="#ffffff" stroke="#7e22ce" stroke-width="1.2"/>
        <text x="230" y="117" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3b0764">Registers / Cache</text>
        <!-- Arrow CPU -> Output -->
        <line x1="308" y1="86" x2="345" y2="86" stroke="#1e293b" stroke-width="2.2" marker-end="url(#icsArrow)"/>
        <!-- OUTPUT UNIT -->
        <rect x="349" y="55" width="95" height="62" rx="8" fill="#dcfce7" stroke="#15803d" stroke-width="2"/>
        <text x="396" y="82" text-anchor="middle" font-size="11" font-weight="900" fill="#14532d">OUTPUT UNIT</text>
        <text x="396" y="98" text-anchor="middle" font-size="8.5" font-weight="700" fill="#334155">(Monitor, Printer)</text>
        <!-- Bidirectional Arrows CPU <-> Storage -->
        <line x1="215" y1="134" x2="215" y2="154" stroke="#1e293b" stroke-width="2" marker-end="url(#icsArrow)"/>
        <line x1="245" y1="154" x2="245" y2="134" stroke="#1e293b" stroke-width="2" marker-end="url(#icsArrow)"/>
        <!-- MEMORY & STORAGE UNIT -->
        <rect x="135" y="156" width="190" height="42" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
        <text x="230" y="174" text-anchor="middle" font-size="10" font-weight="900" fill="#78350f">MAIN MEMORY &amp; STORAGE</text>
        <text x="230" y="189" text-anchor="middle" font-size="8.5" font-weight="700" fill="#92400e">(RAM, ROM, HDD / SSD / Flash)</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 16. ICS CHAPTER 6 — UPS / SURGE PROTECTION SETUP DIAGRAM
  // ============================================================================
  if (
    /\bups\b/i.test(body) ||
    qLower.includes('uninterruptible power supply') ||
    qLower.includes('surge protector') ||
    qLower.includes('power fluctuations')
  ) {
    return {
      title: 'Chapter 6: UPS & Surge Protection Power Connection Setup',
      caption: 'Wall Mains Socket (240V AC) → UPS Unit (Battery Backup & Surge Suppression) → Computer System Unit & Monitor',
      svgHtml: `<svg viewBox="0 0 460 155" class="w-full max-w-[450px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="pwrArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#059669" />
          </marker>
        </defs>
        <rect width="460" height="155" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Wall Socket -->
        <rect x="18" y="38" width="90" height="75" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
        <rect x="55" y="54" width="16" height="10" rx="2" fill="#334155"/>
        <rect x="43" y="72" width="12" height="8" rx="2" fill="#334155"/>
        <rect x="71" y="72" width="12" height="8" rx="2" fill="#334155"/>
        <text x="63" y="102" text-anchor="middle" font-size="10" font-weight="900" fill="#0f172a">WALL SOCKET</text>
        <text x="63" y="132" text-anchor="middle" font-size="8.5" font-weight="700" fill="#64748b">220–240V AC Mains</text>
        <!-- Arrow Socket -> UPS -->
        <line x1="108" y1="75" x2="152" y2="75" stroke="#059669" stroke-width="2.6" marker-end="url(#pwrArrow)"/>
        <!-- UPS Unit -->
        <rect x="156" y="28" width="132" height="94" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="2.2"/>
        <text x="222" y="54" text-anchor="middle" font-size="11.5" font-weight="900" fill="#991b1b">UPS UNIT</text>
        <text x="222" y="72" text-anchor="middle" font-size="9.5" font-weight="800" fill="#b91c1c">(Battery Backup &amp;</text>
        <text x="222" y="86" text-anchor="middle" font-size="9.5" font-weight="800" fill="#b91c1c">Surge Protection)</text>
        <circle cx="202" cy="104" r="5" fill="#22c55e"/>
        <text x="228" y="108" font-size="8.5" font-weight="800" fill="#15803d">ONLINE</text>
        <!-- Arrow UPS -> Computer -->
        <line x1="288" y1="75" x2="328" y2="75" stroke="#059669" stroke-width="2.6" marker-end="url(#pwrArrow)"/>
        <!-- Computer System Unit & Monitor -->
        <rect x="332" y="30" width="112" height="90" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <rect x="344" y="42" width="52" height="38" rx="4" fill="#dbeafe" stroke="#1e40af" stroke-width="1.6"/>
        <rect x="362" y="80" width="16" height="6" fill="#1e40af"/>
        <rect x="404" y="40" width="28" height="46" rx="3" fill="#1e293b"/>
        <circle cx="418" cy="76" r="3" fill="#38bdf8"/>
        <text x="388" y="106" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1e3a8a">SYSTEM UNIT &amp; MONITOR</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 17. GEOGRAPHY FORM TWO CHAPTER 1 — FIGURE 1.1: LAYERS OF THE EARTH (INTERNAL STRUCTURE)
  // ============================================================================
  if (
    qLower.includes('figure 1.1') ||
    qLower.includes('layers of the earth') ||
    qLower.includes('internal layers') ||
    (qLower.includes('lithosphere') && qLower.includes('asthenosphere')) ||
    (qLower.includes('inner core') && qLower.includes('hottest')) ||
    (qLower.includes('outer core') && qLower.includes('solid'))
  ) {
    return {
      title: 'Figure 1.1: Layers of the Earth (Internal Structure)',
      caption: 'Concentric Internal Zones: Crust / Lithosphere (0–100 km) • Mantle / Asthenosphere (up to 2,900 km) • Outer & Inner Core (NIFE)',
      svgHtml: `<svg viewBox="0 0 380 190" class="w-full max-w-[360px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="190" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Crust (Outer Green Ring) -->
        <circle cx="155" cy="92" r="76" fill="#dcfce7" stroke="#16a34a" stroke-width="6"/>
        <!-- Mantle (Middle Amber Ring) -->
        <circle cx="155" cy="92" r="62" fill="#fef3c7" stroke="#f59e0b" stroke-width="20"/>
        <!-- Outer & Inner Core (Central Red Circle) -->
        <circle cx="155" cy="92" r="32" fill="#dc2626" stroke="#b91c1c" stroke-width="2.5"/>
        <circle cx="155" cy="92" r="15" fill="#991b1b" stroke="#fef2f2" stroke-width="1.2" stroke-dasharray="2,2"/>
        <text x="155" y="96" font-family="Times New Roman, serif" font-size="10.5" font-weight="bold" fill="#ffffff" text-anchor="middle">Core</text>
        <!-- Callout Lines & Labels -->
        <line x1="202" y1="32" x2="255" y2="26" stroke="#14532d" stroke-width="1.6"/>
        <text x="260" y="29" font-family="Times New Roman, serif" font-size="11" font-weight="bold" fill="#14532d">Crust (Lithosphere)</text>
        <line x1="205" y1="68" x2="255" y2="62" stroke="#78350f" stroke-width="1.6"/>
        <text x="260" y="65" font-family="Times New Roman, serif" font-size="11" font-weight="bold" fill="#78350f">Mantle (Asthenosphere)</text>
        <line x1="184" y1="102" x2="255" y2="102" stroke="#991b1b" stroke-width="1.6"/>
        <text x="260" y="105" font-family="Times New Roman, serif" font-size="11" font-weight="bold" fill="#991b1b">Outer &amp; Inner Core</text>
        <text x="190" y="176" font-family="Times New Roman, serif" font-size="11.5" font-weight="bold" fill="#0f172a" text-anchor="middle">Figure 1.1: Layers of the Earth</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 18. GEOGRAPHY FORM TWO CHAPTER 2 — VERTICAL STRUCTURE OF THE ATMOSPHERE
  // ============================================================================
  if (
    (qLower.includes('atmosphere') || qLower.includes('atmospheric layer')) &&
    (qLower.includes('troposphere') ||
      qLower.includes('stratosphere') ||
      qLower.includes('mesosphere') ||
      qLower.includes('thermosphere') ||
      qLower.includes('ozone layer') ||
      qLower.includes('ascending order'))
  ) {
    return {
      title: 'Chapter 2: Vertical Structure & Layers of the Earth’s Atmosphere',
      caption: 'Ascending Order from Surface Outward: Troposphere (0–16 km) → Stratosphere (Ozone Layer, 16–50 km) → Mesosphere (50–80 km) → Thermosphere (>80 km)',
      svgHtml: `<svg viewBox="0 0 430 205" class="w-full max-w-[420px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="430" height="205" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- 4. Thermosphere -->
        <rect x="18" y="14" width="394" height="38" rx="4" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.4"/>
        <text x="28" y="31" font-size="10.5" font-weight="900" fill="#4c1d95">4. THERMOSPHERE (&gt;80 km)</text>
        <text x="28" y="45" font-size="9" font-weight="700" fill="#5b21b6">Ionosphere, Auroras &amp; Satellites • Temp rises (&gt;1,000°C)</text>
        <!-- 3. Mesosphere -->
        <rect x="18" y="56" width="394" height="38" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.4"/>
        <text x="28" y="73" font-size="10.5" font-weight="900" fill="#1e3a8a">3. MESOSPHERE (50–80 km)</text>
        <text x="28" y="87" font-size="9" font-weight="700" fill="#1d4ed8">Meteors burn up • Coldest layer (drops to -90°C at Mesopause)</text>
        <!-- 2. Stratosphere -->
        <rect x="18" y="98" width="394" height="42" rx="4" fill="#fef3c7" stroke="#d97706" stroke-width="1.4"/>
        <text x="28" y="115" font-size="10.5" font-weight="900" fill="#78350f">2. STRATOSPHERE (12/16–50 km)</text>
        <text x="28" y="131" font-size="9" font-weight="800" fill="#92400e">Contains OZONE LAYER (O₃ absorbs UV rays) • Temp increases</text>
        <!-- 1. Troposphere -->
        <rect x="18" y="144" width="394" height="46" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
        <text x="28" y="162" font-size="10.5" font-weight="900" fill="#14532d">1. TROPOSPHERE (0–12/18 km)</text>
        <text x="28" y="178" font-size="9" font-weight="800" fill="#166534">Weather events (Rain, Clouds, Storms) &amp; Living Organisms</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 19. GEOGRAPHY FORM TWO CHAPTER 3 — CONTOUR REPRESENTATION OF A HILL / SLOPES
  // ============================================================================
  if (
    qLower.includes('contour representation of a hill') ||
    (qLower.includes('contour') &&
      (qLower.includes('steep') ||
        qLower.includes('gentle') ||
        qLower.includes('plateau') ||
        qLower.includes('escarpment') ||
        qLower.includes('ridge') ||
        qLower.includes('spur') ||
        qLower.includes('cliff') ||
        qLower.includes('layer tinting') ||
        qLower.includes('hachure') ||
        qLower.includes('spot height')))
  ) {
    return {
      title: 'Chapter 3: Contour Representation of a Hill (Steep vs Gentle Slope)',
      caption: 'Concentric brown contour lines (VI = 100 m): Closely packed contours (Left) = Steep Slope • Widely spaced contours (Right) = Gentle Slope',
      svgHtml: `<svg viewBox="0 0 380 155" class="w-full max-w-[360px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="155" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Concentric contour ellipses shifted slightly left to illustrate steep (left) vs gentle (right) -->
        <ellipse cx="190" cy="70" rx="145" ry="52" fill="none" stroke="#d97706" stroke-width="1.8"/>
        <text x="315" y="73" font-family="Times New Roman, serif" font-size="9.5" font-weight="bold" fill="#92400e">100m</text>
        <ellipse cx="182" cy="70" rx="110" ry="38" fill="none" stroke="#d97706" stroke-width="1.8"/>
        <text x="274" y="73" font-family="Times New Roman, serif" font-size="9.5" font-weight="bold" fill="#92400e">200m</text>
        <ellipse cx="172" cy="70" rx="74" ry="25" fill="none" stroke="#d97706" stroke-width="1.8"/>
        <text x="230" y="73" font-family="Times New Roman, serif" font-size="9.5" font-weight="bold" fill="#92400e">300m</text>
        <ellipse cx="162" cy="70" rx="36" ry="12" fill="none" stroke="#d97706" stroke-width="1.8"/>
        <circle cx="158" cy="70" r="3.2" fill="#0f172a"/>
        <text x="158" y="65" font-family="Times New Roman, serif" font-size="9.5" font-weight="bold" fill="#0f172a" text-anchor="middle">• 420m</text>
        <!-- Labels for Steep vs Gentle -->
        <text x="56" y="24" font-size="9.5" font-weight="900" fill="#dc2626">Steep Slope (Close)</text>
        <text x="285" y="24" font-size="9.5" font-weight="900" fill="#15803d" text-anchor="middle">Gentle Slope (Wide)</text>
        <text x="190" y="142" font-family="Times New Roman, serif" font-size="11.5" font-weight="bold" fill="#0f172a" text-anchor="middle">Contour Representation of a Hill</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 20. GEOGRAPHY FORM TWO CHAPTER 3 — CROSS-SECTION, INTERVISIBILITY & VE
  // ============================================================================
  if (
    qLower.includes('intervisibility') ||
    qLower.includes('vertical exaggeration') ||
    (qLower.includes('cross-section') && (qLower.includes('vs') || qLower.includes('hs') || qLower.includes('ve')))
  ) {
    return {
      title: 'Chapter 3: Relief Cross-Section, Line of Sight (Intervisibility) & Vertical Exaggeration',
      caption: 'VE = HS / VS • Points A and B are NOT intervisible when an intervening hill rises above the straight Line of Sight',
      svgHtml: `<svg viewBox="0 0 420 175" class="w-full max-w-[400px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="420" height="175" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Axes -->
        <line x1="48" y1="22" x2="48" y2="142" stroke="#0f172a" stroke-width="2"/>
        <line x1="48" y1="142" x2="395" y2="142" stroke="#0f172a" stroke-width="2"/>
        <text x="26" y="32" font-size="9" font-weight="800" fill="#334155">500m</text>
        <text x="26" y="70" font-size="9" font-weight="800" fill="#334155">300m</text>
        <text x="26" y="110" font-size="9" font-weight="800" fill="#334155">100m</text>
        <!-- Relief Profile Curve with Intervening Hill -->
        <path d="M 48,118 Q 105,130 145,105 Q 205,28 255,95 Q 310,132 375,65 L 375,142 L 48,142 Z" fill="#fef3c7" stroke="#b45309" stroke-width="2.4"/>
        <!-- Dashed Line of Sight A to B blocked by intervening peak -->
        <line x1="65" y1="120" x2="375" y2="65" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,4"/>
        <circle cx="65" cy="120" r="4" fill="#1d4ed8"/>
        <text x="65" y="110" font-size="10.5" font-weight="900" fill="#1d4ed8" text-anchor="middle">Point A</text>
        <circle cx="375" cy="65" r="4" fill="#1d4ed8"/>
        <text x="375" y="54" font-size="10.5" font-weight="900" fill="#1d4ed8" text-anchor="middle">Point B</text>
        <text x="206" y="45" font-size="9.5" font-weight="900" fill="#dc2626" text-anchor="middle">Intervening Hill (Blocks View)</text>
        <text x="220" y="162" font-size="10" font-weight="900" fill="#0f172a" text-anchor="middle">Horizontal Baseline (HS) • Line of Sight Obstruction</text>
      </svg>`,
    };
  }

  // ============================================================================
  // 21. GEOGRAPHY FORM TWO CHAPTER 4 — 9-SECTOR PHOTOGRAPH INTERPRETATION GRID
  // ============================================================================
  if (
    (String(_subject || '').toLowerCase().includes('geography') || qLower.includes('photograph')) &&
    (qLower.includes('horizontal photograph') ||
      qLower.includes('oblique') ||
      qLower.includes('vertical aerial') ||
      qLower.includes('foreground') ||
      qLower.includes('photograph interpretation'))
  ) {
    return {
      title: 'Chapter 4: Geographical Photograph 9-Sector Interpretation Divisions',
      caption: 'Back-to-Front Planes (Background, Middleground, Foreground) × Left-to-Right Columns (Scale diminishes toward Background)',
      svgHtml: `<svg viewBox="0 0 420 180" class="w-full max-w-[400px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="420" height="180" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Outer Frame -->
        <rect x="20" y="15" width="380" height="144" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
        <!-- Row 1: Background -->
        <rect x="20" y="15" width="380" height="48" fill="#dbeafe" fill-opacity="0.55" stroke="#0f172a" stroke-width="1.2"/>
        <!-- Row 2: Middleground -->
        <rect x="20" y="63" width="380" height="48" fill="#dcfce7" fill-opacity="0.55" stroke="#0f172a" stroke-width="1.2"/>
        <!-- Row 3: Foreground -->
        <rect x="20" y="111" width="380" height="48" fill="#fef3c7" fill-opacity="0.65" stroke="#0f172a" stroke-width="1.2"/>
        <!-- Vertical Dividers -->
        <line x1="146" y1="15" x2="146" y2="159" stroke="#0f172a" stroke-width="1.4" stroke-dasharray="4,3"/>
        <line x1="273" y1="15" x2="273" y2="159" stroke="#0f172a" stroke-width="1.4" stroke-dasharray="4,3"/>
        <!-- Labels -->
        <text x="83" y="43" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1e3a8a">Left Background</text>
        <text x="210" y="43" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1e3a8a">Middle Background</text>
        <text x="336" y="43" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1e3a8a">Right Background</text>
        <text x="83" y="91" text-anchor="middle" font-size="9.5" font-weight="900" fill="#14532d">Left Middleground</text>
        <text x="210" y="91" text-anchor="middle" font-size="9.5" font-weight="900" fill="#14532d">Centre Middleground</text>
        <text x="336" y="91" text-anchor="middle" font-size="9.5" font-weight="900" fill="#14532d">Right Middleground</text>
        <text x="83" y="139" text-anchor="middle" font-size="9.5" font-weight="900" fill="#78350f">Left Foreground</text>
        <text x="210" y="139" text-anchor="middle" font-size="9.5" font-weight="900" fill="#78350f">Middle Foreground</text>
        <text x="336" y="139" text-anchor="middle" font-size="9.5" font-weight="900" fill="#78350f">Right Foreground</text>
      </svg>`,
    };
  }

  // ==========================================================================
  // FORM 2 BIOLOGY DIAGRAMS (Chapters 2, 3, 4 & 5 — TIE Student's Book)
  // ==========================================================================
  // 1. Figure 2.1: Human Digestive System
  if (
    subLower.includes('biology') &&
    (qLower.includes('figure 2.1') ||
      qLower.includes('stomach enzymes') ||
      (qLower.includes('pepsin') && qLower.includes('fish and milk')))
  ) {
    return {
      title: 'Figure 2.1: The Human Digestive System',
      caption: 'Alimentary Canal & Accessory Digestive Organs (Oesophagus → Stomach [HCl, Pepsin, Rennin] → Duodenum/Liver/Pancreas → Ileum → Colon)',
      svgHtml: `<svg viewBox="0 0 260 280" class="w-full max-w-[260px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="260" height="280" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Oesophagus -->
        <path d="M120 15 L120 90" stroke="#dc2626" stroke-width="8" fill="none" stroke-linecap="round"/>
        <text x="134" y="45" font-size="10" font-weight="800" fill="#0f172a">Oesophagus</text>
        <!-- Liver -->
        <polygon points="65,85 115,85 102,125 65,115" fill="#991b1b" opacity="0.88" stroke="#7f1d1d" stroke-width="1.2"/>
        <text x="26" y="105" font-size="10" font-weight="800" fill="#7f1d1d">Liver</text>
        <!-- Stomach -->
        <path d="M120 90 C158 90, 168 135, 130 148 C108 154, 104 128, 120 120" fill="#fca5a5" stroke="#dc2626" stroke-width="2.5"/>
        <text x="160" y="122" font-size="10" font-weight="900" fill="#991b1b">Stomach</text>
        <text x="160" y="134" font-size="8.5" font-weight="700" fill="#475569">(Pepsin &amp; Rennin)</text>
        <!-- Pancreas -->
        <ellipse cx="132" cy="158" rx="22" ry="6" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="162" y="162" font-size="9.5" font-weight="800" fill="#854d0e">Pancreas</text>
        <!-- Large Intestine (Colon) -->
        <rect x="75" y="168" width="95" height="68" rx="10" fill="none" stroke="#15803d" stroke-width="9"/>
        <text x="178" y="195" font-size="9.5" font-weight="800" fill="#14532d">Colon</text>
        <!-- Small Intestine (Ileum) -->
        <path d="M92 184 Q122 174 148 188 T95 206 T148 220" fill="none" stroke="#ea580c" stroke-width="5" stroke-linecap="round"/>
        <text x="85" y="255" font-size="10" font-weight="800" fill="#9a3412">Small Intestine (Ileum) &amp; Rectum</text>
      </svg>`,
    };
  }

  // 2. Chapter 3: Diffusion Process Across Concentration Gradient
  if (
    subLower.includes('biology') &&
    (qLower.includes('diffusion process diagram') ||
      (qLower.includes('osmosis and diffusion') && qLower.includes('plasmolysis and haemolysis')))
  ) {
    return {
      title: 'Chapter 3: Diffusion Process Down a Concentration Gradient',
      caption: 'Net Movement of Solute Particles from High Concentration to Low Concentration Until Dynamic Equilibrium',
      svgHtml: `<svg viewBox="0 0 360 150" class="w-full max-w-[360px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="bioDiffArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626"/>
          </marker>
        </defs>
        <rect x="8" y="8" width="344" height="134" rx="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <!-- High Concentration Cluster -->
        <circle cx="50" cy="40" r="6" fill="#1e40af"/><circle cx="70" cy="35" r="6" fill="#1e40af"/>
        <circle cx="55" cy="60" r="6" fill="#1e40af"/><circle cx="78" cy="58" r="6" fill="#1e40af"/>
        <circle cx="45" cy="82" r="6" fill="#1e40af"/><circle cx="68" cy="80" r="6" fill="#1e40af"/>
        <circle cx="60" cy="100" r="6" fill="#1e40af"/><circle cx="84" cy="95" r="6" fill="#1e40af"/>
        <text x="30" y="126" font-size="10" font-weight="900" fill="#1e3a8a">High Concentration</text>
        <!-- Diffusion Arrow -->
        <line x1="115" y1="70" x2="215" y2="70" stroke="#dc2626" stroke-width="3.5" marker-end="url(#bioDiffArrow)"/>
        <text x="130" y="56" font-size="10" font-weight="900" fill="#dc2626">Net Diffusion</text>
        <!-- Low Concentration Cluster -->
        <circle cx="265" cy="45" r="6" fill="#1e40af"/>
        <circle cx="305" cy="72" r="6" fill="#1e40af"/>
        <circle cx="275" cy="98" r="6" fill="#1e40af"/>
        <text x="242" y="126" font-size="10" font-weight="900" fill="#1e3a8a">Low Concentration</text>
      </svg>`,
    };
  }

  // 3. Chapter 4: Transverse Section of Young Dicot Stem & Root
  if (
    subLower.includes('biology') &&
    qLower.includes('transverse section of a young stem and root')
  ) {
    return {
      title: 'Chapter 4: Transverse Section (TS) of a Young Dicot Stem vs. Dicot Root',
      caption: 'A = Epidermis / Cortex, B = Phloem (Translocation), C = Xylem (Water & Mineral Conduction)',
      svgHtml: `<svg viewBox="0 0 380 175" class="w-full max-w-[380px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="380" height="175" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Young Dicot Stem TS -->
        <circle cx="100" cy="82" r="60" fill="#ecfdf5" stroke="#047857" stroke-width="2.5"/>
        <circle cx="100" cy="82" r="42" fill="#ffffff" stroke="#10b981" stroke-width="1.2" stroke-dasharray="3,2"/>
        <!-- Vascular bundles in ring -->
        <ellipse cx="100" cy="40" rx="7" ry="10" fill="#fde047" stroke="#b91c1c" stroke-width="1.5"/>
        <ellipse cx="100" cy="124" rx="7" ry="10" fill="#fde047" stroke="#b91c1c" stroke-width="1.5"/>
        <ellipse cx="58" cy="82" rx="10" ry="7" fill="#fde047" stroke="#b91c1c" stroke-width="1.5"/>
        <ellipse cx="142" cy="82" rx="10" ry="7" fill="#fde047" stroke="#b91c1c" stroke-width="1.5"/>
        <text x="100" y="85" text-anchor="middle" font-size="9" font-weight="800" fill="#065f46">Pith</text>
        <text x="100" y="160" text-anchor="middle" font-size="10" font-weight="900" fill="#0f172a">Young Dicot Stem TS</text>
        <!-- Young Dicot Root TS -->
        <circle cx="280" cy="82" r="56" fill="#fefce8" stroke="#a16207" stroke-width="2.5"/>
        <circle cx="280" cy="82" r="24" fill="#ffffff" stroke="#ca8a04" stroke-width="1.5"/>
        <!-- Star-shaped Xylem (C) -->
        <path d="M280 62 L285 77 L300 82 L285 87 L280 102 L275 87 L260 82 L275 77 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.2"/>
        <!-- Phloem patches (B) -->
        <circle cx="290" cy="72" r="3.5" fill="#2563eb"/><circle cx="290" cy="92" r="3.5" fill="#2563eb"/>
        <circle cx="270" cy="72" r="3.5" fill="#2563eb"/><circle cx="270" cy="92" r="3.5" fill="#2563eb"/>
        <text x="280" y="160" text-anchor="middle" font-size="10" font-weight="900" fill="#0f172a">Young Dicot Root TS</text>
        <!-- Labels A, B, C -->
        <text x="190" y="32" text-anchor="middle" font-size="9.5" font-weight="900" fill="#047857">A: Epidermis/Cortex</text>
        <text x="190" y="48" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1d4ed8">B: Phloem</text>
        <text x="190" y="64" text-anchor="middle" font-size="9.5" font-weight="900" fill="#b91c1c">C: Xylem</text>
      </svg>`,
    };
  }

  // 4. Figure 5.1: Mammalian Heart Chambers
  if (
    subLower.includes('biology') &&
    (qLower.includes('figure 5.1') ||
      qLower.includes('mammalian heart chambers') ||
      (qLower.includes('bicuspid valve') && qLower.includes('heart')))
  ) {
    return {
      title: 'Figure 5.1: Simplified Mammalian Heart Chambers (Double Pump)',
      caption: 'Right Side (Deoxygenated Blood → Lungs) Separated by Septum from Left Side (Oxygenated Blood → Aorta/Body)',
      svgHtml: `<svg viewBox="0 0 300 220" class="w-full max-w-[300px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="220" rx="10" fill="#fff1f2" stroke="#fecdd3" stroke-width="1.5"/>
        <!-- Heart Outline -->
        <path d="M150 198 L65 112 C42 68 95 28 150 68 C205 28 258 68 235 112 Z" fill="#fee2e2" stroke="#b91c1c" stroke-width="3"/>
        <!-- Interventricular Septum -->
        <line x1="150" y1="68" x2="150" y2="198" stroke="#7f1d1d" stroke-width="4"/>
        <!-- Atrioventricular Divider (Tricuspid / Bicuspid Valves) -->
        <line x1="68" y1="112" x2="232" y2="112" stroke="#b91c1c" stroke-width="2.5" stroke-dasharray="5,4"/>
        <!-- Chamber Labels -->
        <text x="108" y="94" text-anchor="middle" font-size="10.5" font-weight="900" fill="#1e3a8a">Right Atrium</text>
        <text x="192" y="94" text-anchor="middle" font-size="10.5" font-weight="900" fill="#991b1b">Left Atrium</text>
        <text x="110" y="142" text-anchor="middle" font-size="10.5" font-weight="900" fill="#1e3a8a">Right Ventricle</text>
        <text x="190" y="142" text-anchor="middle" font-size="10.5" font-weight="900" fill="#991b1b">Left Ventricle</text>
        <!-- Valve Labels -->
        <text x="105" y="123" text-anchor="middle" font-size="8.5" font-weight="800" fill="#334155">Tricuspid Valve</text>
        <text x="195" y="123" text-anchor="middle" font-size="8.5" font-weight="800" fill="#b91c1c">Bicuspid Valve</text>
        <text x="150" y="213" text-anchor="middle" font-size="9" font-weight="800" fill="#7f1d1d">Muscular Septum</text>
      </svg>`,
    };
  }

  // ============================================================================
  // FORM 5 COMPUTER SCIENCE TEXTBOOK DIAGRAMS (Chapters 1 to 8)
  // ============================================================================
  if (
    qLower.includes('von neumann') ||
    qLower.includes('figure 1.5') ||
    qLower.includes('activity 1.1:') ||
    qLower.includes('activity 1.2:')
  ) {
    return {
      title: 'Figure 1.5: Von Neumann Architecture',
      caption: 'CPU (ALU, Registers, Control Unit) connected via Address/Data Bus to Memory Unit and I/O Devices',
      svgHtml: `<svg viewBox="0 0 650 240" class="w-full max-w-[520px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="650" height="240" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="20" y="90" width="100" height="50" rx="6" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <text x="70" y="120" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#1e3a8a">Input Device</text>
        <rect x="180" y="20" width="260" height="190" rx="8" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
        <text x="200" y="45" font-family="sans-serif" font-weight="800" font-size="14" fill="#0f172a">CPU</text>
        <rect x="200" y="60" width="110" height="130" rx="6" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
        <text x="255" y="95" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#0f172a">ALU</text>
        <text x="255" y="125" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#2563eb">Registers</text>
        <text x="255" y="155" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#047857">Control Unit</text>
        <rect x="350" y="60" width="75" height="130" rx="6" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
        <text x="387" y="120" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#854d0e">Memory</text>
        <text x="387" y="138" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#854d0e">Unit</text>
        <line x1="310" y1="95" x2="350" y2="95" stroke="#0f172a" stroke-width="1.8"/>
        <text x="330" y="88" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#334155">Address Bus</text>
        <line x1="310" y1="150" x2="350" y2="150" stroke="#0f172a" stroke-width="1.8"/>
        <text x="330" y="143" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="#334155">Data Bus</text>
        <rect x="500" y="90" width="110" height="50" rx="6" fill="#ecfdf5" stroke="#047857" stroke-width="2"/>
        <text x="555" y="120" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#065f46">Output Device</text>
        <line x1="120" y1="115" x2="180" y2="115" stroke="#0f172a" stroke-width="2"/>
        <line x1="440" y1="115" x2="500" y2="115" stroke="#0f172a" stroke-width="2"/>
      </svg>`,
    };
  }

  if (
    qLower.includes('figure 1.33') ||
    (qLower.includes('exercise 1.6') && (qLower.includes('q1') || qLower.includes('q2') || qLower.includes('q3')))
  ) {
    return {
      title: 'Figure 1.33: Combinational Logic Gate Circuit (Output Q)',
      caption: 'Inputs A, B, C feeding OR, AND, and NOT gates to produce intermediate wires D, E, F and final output Q',
      svgHtml: `<svg viewBox="0 0 600 220" class="w-full max-w-[500px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="220" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="20" y="55" font-weight="bold" font-size="14" fill="#0f172a">A</text>
        <line x1="40" y1="50" x2="140" y2="50" stroke="#0f172a" stroke-width="2"/>
        <text x="20" y="105" font-weight="bold" font-size="14" fill="#0f172a">B</text>
        <line x1="40" y1="100" x2="100" y2="100" stroke="#0f172a" stroke-width="2"/>
        <circle cx="100" cy="100" r="3.5" fill="#1d4ed8"/>
        <line x1="100" y1="100" x2="100" y2="70" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="100" y1="70" x2="140" y2="70" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="100" y1="100" x2="100" y2="130" stroke="#1d4ed8" stroke-width="2"/>
        <line x1="100" y1="130" x2="260" y2="130" stroke="#1d4ed8" stroke-width="2"/>
        <text x="20" y="175" font-weight="bold" font-size="14" fill="#0f172a">C</text>
        <line x1="40" y1="170" x2="140" y2="170" stroke="#0f172a" stroke-width="2"/>
        <path d="M140,40 Q155,60 140,80 Q180,80 195,60 Q180,40 140,40 Z" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <text x="163" y="65" font-size="10" font-weight="700" fill="#1e3a8a">OR</text>
        <polygon points="140,155 140,185 170,170" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
        <circle cx="175" cy="170" r="4" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
        <line x1="195" y1="60" x2="390" y2="60" stroke="#0f172a" stroke-width="2"/>
        <text x="290" y="52" font-weight="bold" font-size="13" fill="#1d4ed8">D</text>
        <line x1="180" y1="170" x2="260" y2="170" stroke="#0f172a" stroke-width="2"/>
        <text x="220" y="162" font-weight="bold" font-size="13" fill="#dc2626">E</text>
        <path d="M260,120 L285,120 A25,25 0 0,1 285,180 L260,180 Z" fill="#ecfdf5" stroke="#047857" stroke-width="2"/>
        <text x="268" y="155" font-size="10" font-weight="700" fill="#065f46">AND</text>
        <line x1="310" y1="150" x2="360" y2="150" stroke="#0f172a" stroke-width="2"/>
        <text x="335" y="142" font-weight="bold" font-size="13" fill="#047857">F</text>
        <line x1="360" y1="150" x2="360" y2="90" stroke="#0f172a" stroke-width="2"/>
        <line x1="360" y1="90" x2="390" y2="90" stroke="#0f172a" stroke-width="2"/>
        <path d="M390,50 L415,50 A25,25 0 0,1 415,100 L390,100 Z" fill="#fefce8" stroke="#ca8a04" stroke-width="2"/>
        <text x="398" y="80" font-size="10" font-weight="700" fill="#854d0e">AND</text>
        <line x1="440" y1="75" x2="500" y2="75" stroke="#0f172a" stroke-width="2"/>
        <text x="515" y="80" font-weight="bold" font-size="15" fill="#0f172a">Q</text>
      </svg>`,
    };
  }

  if (
    qLower.includes('memory hierarchy') ||
    qLower.includes('figure 1.38') ||
    qLower.includes('book storage in the library system')
  ) {
    return {
      title: 'Figure 1.38: Computer Memory Hierarchy Pyramid',
      caption: 'From top to bottom: CPU Registers → Cache (SRAM) → Main Memory (DRAM) → Secondary/Offline Storage (Access Speed & Cost/Bit increase upward; Capacity increases downward)',
      svgHtml: `<svg viewBox="0 0 560 220" class="w-full max-w-[480px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="560" height="220" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <polygon points="260,20 110,195 410,195" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2.2"/>
        <line x1="222" y1="64" x2="298" y2="64" stroke="#1d4ed8" stroke-width="1.8"/>
        <line x1="185" y1="108" x2="335" y2="108" stroke="#1d4ed8" stroke-width="1.8"/>
        <line x1="148" y1="152" x2="372" y2="152" stroke="#1d4ed8" stroke-width="1.8"/>
        <text x="260" y="54" text-anchor="middle" font-size="11" font-weight="800" fill="#1e3a8a">Registers</text>
        <text x="260" y="92" text-anchor="middle" font-size="11.5" font-weight="800" fill="#047857">Cache (L1 / L2 / L3 SRAM)</text>
        <text x="260" y="135" text-anchor="middle" font-size="12" font-weight="800" fill="#b45309">Main Memory (RAM / DRAM)</text>
        <text x="260" y="180" text-anchor="middle" font-size="12" font-weight="800" fill="#0f172a">Secondary Storage (SSD / Magnetic Disk)</text>
        <line x1="65" y1="185" x2="65" y2="32" stroke="#dc2626" stroke-width="2"/>
        <polygon points="60,36 65,24 70,36" fill="#dc2626"/>
        <text x="55" y="110" text-anchor="end" font-size="10" font-weight="800" fill="#dc2626">Faster &amp; Costlier</text>
        <line x1="455" y1="32" x2="455" y2="185" stroke="#047857" stroke-width="2"/>
        <polygon points="450,181 455,193 460,181" fill="#047857"/>
        <text x="465" y="110" font-size="10" font-weight="800" fill="#047857">Larger Capacity</text>
      </svg>`,
    };
  }

  if (
    qLower.includes('mama chapati') ||
    qLower.includes('figure 2.7') ||
    (qLower.includes('pipeline') && qLower.includes('if') && qLower.includes('wb'))
  ) {
    return {
      title: 'Figure 2.7: 5-Stage Instruction Pipeline Timing Diagram',
      caption: 'Overlapping execution of Instruction Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), and Write Back (WB)',
      svgHtml: `<svg viewBox="0 0 560 190" class="w-full max-w-[490px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="560" height="190" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="25" y="32" font-size="11" font-weight="800" fill="#334155">Instr.</text>
        <text x="115" y="32" font-size="10.5" font-weight="700" fill="#475569">CC1</text>
        <text x="165" y="32" font-size="10.5" font-weight="700" fill="#475569">CC2</text>
        <text x="215" y="32" font-size="10.5" font-weight="700" fill="#475569">CC3</text>
        <text x="265" y="32" font-size="10.5" font-weight="700" fill="#475569">CC4</text>
        <text x="315" y="32" font-size="10.5" font-weight="700" fill="#475569">CC5</text>
        <text x="365" y="32" font-size="10.5" font-weight="700" fill="#475569">CC6</text>
        <text x="415" y="32" font-size="10.5" font-weight="700" fill="#475569">CC7</text>
        <text x="465" y="32" font-size="10.5" font-weight="700" fill="#475569">CC8</text>
        <!-- Row 1 -->
        <text x="25" y="62" font-size="11" font-weight="800" fill="#0f172a">I₁</text>
        <rect x="100" y="45" width="46" height="24" rx="4" fill="#dbeafe" stroke="#2563eb"/><text x="123" y="61" text-anchor="middle" font-size="10" font-weight="800" fill="#1e3a8a">IF</text>
        <rect x="150" y="45" width="46" height="24" rx="4" fill="#dcfce7" stroke="#16a34a"/><text x="173" y="61" text-anchor="middle" font-size="10" font-weight="800" fill="#14532d">ID</text>
        <rect x="200" y="45" width="46" height="24" rx="4" fill="#fef9c3" stroke="#ca8a04"/><text x="223" y="61" text-anchor="middle" font-size="10" font-weight="800" fill="#713f12">EX</text>
        <rect x="250" y="45" width="46" height="24" rx="4" fill="#fce7f3" stroke="#db2777"/><text x="273" y="61" text-anchor="middle" font-size="10" font-weight="800" fill="#831843">MEM</text>
        <rect x="300" y="45" width="46" height="24" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="323" y="61" text-anchor="middle" font-size="10" font-weight="800" fill="#4c1d95">WB</text>
        <!-- Row 2 -->
        <text x="25" y="96" font-size="11" font-weight="800" fill="#0f172a">I₂</text>
        <rect x="150" y="79" width="46" height="24" rx="4" fill="#dbeafe" stroke="#2563eb"/><text x="173" y="95" text-anchor="middle" font-size="10" font-weight="800" fill="#1e3a8a">IF</text>
        <rect x="200" y="79" width="46" height="24" rx="4" fill="#dcfce7" stroke="#16a34a"/><text x="223" y="95" text-anchor="middle" font-size="10" font-weight="800" fill="#14532d">ID</text>
        <rect x="250" y="79" width="46" height="24" rx="4" fill="#fef9c3" stroke="#ca8a04"/><text x="273" y="95" text-anchor="middle" font-size="10" font-weight="800" fill="#713f12">EX</text>
        <rect x="300" y="79" width="46" height="24" rx="4" fill="#fce7f3" stroke="#db2777"/><text x="323" y="95" text-anchor="middle" font-size="10" font-weight="800" fill="#831843">MEM</text>
        <rect x="350" y="79" width="46" height="24" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="373" y="95" text-anchor="middle" font-size="10" font-weight="800" fill="#4c1d95">WB</text>
        <!-- Row 3 -->
        <text x="25" y="130" font-size="11" font-weight="800" fill="#0f172a">I₃</text>
        <rect x="200" y="113" width="46" height="24" rx="4" fill="#dbeafe" stroke="#2563eb"/><text x="223" y="129" text-anchor="middle" font-size="10" font-weight="800" fill="#1e3a8a">IF</text>
        <rect x="250" y="113" width="46" height="24" rx="4" fill="#dcfce7" stroke="#16a34a"/><text x="273" y="129" text-anchor="middle" font-size="10" font-weight="800" fill="#14532d">ID</text>
        <rect x="300" y="113" width="46" height="24" rx="4" fill="#fef9c3" stroke="#ca8a04"/><text x="323" y="129" text-anchor="middle" font-size="10" font-weight="800" fill="#713f12">EX</text>
        <rect x="350" y="113" width="46" height="24" rx="4" fill="#fce7f3" stroke="#db2777"/><text x="373" y="129" text-anchor="middle" font-size="10" font-weight="800" fill="#831843">MEM</text>
        <rect x="400" y="113" width="46" height="24" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="423" y="129" text-anchor="middle" font-size="10" font-weight="800" fill="#4c1d95">WB</text>
        <!-- Row 4 -->
        <text x="25" y="164" font-size="11" font-weight="800" fill="#0f172a">I₄</text>
        <rect x="250" y="147" width="46" height="24" rx="4" fill="#dbeafe" stroke="#2563eb"/><text x="273" y="163" text-anchor="middle" font-size="10" font-weight="800" fill="#1e3a8a">IF</text>
        <rect x="300" y="147" width="46" height="24" rx="4" fill="#dcfce7" stroke="#16a34a"/><text x="323" y="163" text-anchor="middle" font-size="10" font-weight="800" fill="#14532d">ID</text>
        <rect x="350" y="147" width="46" height="24" rx="4" fill="#fef9c3" stroke="#ca8a04"/><text x="373" y="163" text-anchor="middle" font-size="10" font-weight="800" fill="#713f12">EX</text>
        <rect x="400" y="147" width="46" height="24" rx="4" fill="#fce7f3" stroke="#db2777"/><text x="423" y="163" text-anchor="middle" font-size="10" font-weight="800" fill="#831843">MEM</text>
        <rect x="450" y="147" width="46" height="24" rx="4" fill="#ede9fe" stroke="#7c3aed"/><text x="473" y="163" text-anchor="middle" font-size="10" font-weight="800" fill="#4c1d95">WB</text>
      </svg>`,
    };
  }

  if (
    qLower.includes('osi model') ||
    qLower.includes('figure 3.4') ||
    (qLower.includes('osi') && qLower.includes('tcp/ip'))
  ) {
    return {
      title: 'Figure 3.4: 7-Layer OSI Model vs. 4-Layer TCP/IP Reference Model',
      caption: 'Comparison of the ISO/OSI 7 layers with the TCP/IP protocol suite layers',
      svgHtml: `<svg viewBox="0 0 540 230" class="w-full max-w-[480px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="230" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="145" y="24" text-anchor="middle" font-size="12" font-weight="800" fill="#1e3a8a">OSI Model (7 Layers)</text>
        <text x="395" y="24" text-anchor="middle" font-size="12" font-weight="800" fill="#065f46">TCP/IP Model (4 Layers)</text>
        <rect x="55" y="34" width="180" height="24" rx="4" fill="#eff6ff" stroke="#2563eb"/><text x="145" y="50" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1e3a8a">7. Application</text>
        <rect x="55" y="61" width="180" height="24" rx="4" fill="#eff6ff" stroke="#2563eb"/><text x="145" y="77" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1e3a8a">6. Presentation</text>
        <rect x="55" y="88" width="180" height="24" rx="4" fill="#eff6ff" stroke="#2563eb"/><text x="145" y="104" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1e3a8a">5. Session</text>
        <rect x="55" y="115" width="180" height="24" rx="4" fill="#fefce8" stroke="#ca8a04"/><text x="145" y="131" text-anchor="middle" font-size="10.5" font-weight="700" fill="#854d0e">4. Transport (TCP/UDP)</text>
        <rect x="55" y="142" width="180" height="24" rx="4" fill="#ecfdf5" stroke="#059669"/><text x="145" y="158" text-anchor="middle" font-size="10.5" font-weight="700" fill="#065f46">3. Network (IP)</text>
        <rect x="55" y="169" width="180" height="24" rx="4" fill="#f1f5f9" stroke="#475569"/><text x="145" y="185" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0f172a">2. Data Link (MAC)</text>
        <rect x="55" y="196" width="180" height="24" rx="4" fill="#f1f5f9" stroke="#475569"/><text x="145" y="212" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0f172a">1. Physical</text>
        <rect x="305" y="34" width="180" height="78" rx="4" fill="#eff6ff" stroke="#2563eb"/><text x="395" y="77" text-anchor="middle" font-size="11.5" font-weight="800" fill="#1e3a8a">Application Layer</text>
        <rect x="305" y="115" width="180" height="24" rx="4" fill="#fefce8" stroke="#ca8a04"/><text x="395" y="131" text-anchor="middle" font-size="11" font-weight="800" fill="#854d0e">Transport Layer</text>
        <rect x="305" y="142" width="180" height="24" rx="4" fill="#ecfdf5" stroke="#059669"/><text x="395" y="158" text-anchor="middle" font-size="11" font-weight="800" fill="#065f46">Internet Layer</text>
        <rect x="305" y="169" width="180" height="51" rx="4" fill="#f1f5f9" stroke="#475569"/><text x="395" y="198" text-anchor="middle" font-size="11" font-weight="800" fill="#0f172a">Network Access Layer</text>
      </svg>`,
    };
  }

  if (
    qLower.includes('figure 8.25') ||
    qLower.includes('server-side scripting') ||
    (qLower.includes('php') && qLower.includes('web server') && qLower.includes('client'))
  ) {
    return {
      title: 'Figure 8.25: Server-Side PHP & Database Scripting Workflow',
      caption: '1. Client sends HTTP Request → 2. Web Server locates .php script → 3. PHP Engine queries MySQL via PDO → 4. Pure HTML response returned to Browser',
      svgHtml: `<svg viewBox="0 0 650 200" class="w-full max-w-[520px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
        <rect width="650" height="200" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="30" y="60" width="130" height="80" rx="6" fill="#eff6ff" stroke="#1d4ed8" stroke-width="2"/>
        <text x="95" y="95" text-anchor="middle" font-weight="bold" font-size="13" fill="#1e3a8a">Client</text>
        <text x="95" y="115" text-anchor="middle" font-size="11" fill="#334155">(Web Browser)</text>
        <rect x="460" y="45" width="155" height="110" rx="6" fill="#ecfdf5" stroke="#047857" stroke-width="2"/>
        <text x="537" y="70" text-anchor="middle" font-weight="bold" font-size="13" fill="#065f46">Web Server</text>
        <rect x="475" y="80" width="125" height="25" rx="4" fill="#ffffff" stroke="#059669"/>
        <text x="537" y="97" text-anchor="middle" font-size="10" font-weight="700" fill="#0f172a">2. Locate .php File</text>
        <rect x="475" y="115" width="125" height="28" rx="4" fill="#fefce8" stroke="#ca8a04"/>
        <text x="537" y="133" text-anchor="middle" font-size="10" font-weight="700" fill="#854d0e">3. PHP Engine + PDO</text>
        <line x1="160" y1="80" x2="460" y2="80" stroke="#1d4ed8" stroke-width="2"/>
        <polygon points="452,75 460,80 452,85" fill="#1d4ed8"/>
        <text x="310" y="72" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3a8a">1. HTTP Request (GET / POST)</text>
        <line x1="460" y1="125" x2="160" y2="125" stroke="#047857" stroke-width="2"/>
        <polygon points="168,120 160,125 168,130" fill="#047857"/>
        <text x="310" y="118" text-anchor="middle" font-size="11" font-weight="700" fill="#065f46">4. HTML Stream Returned to Client</text>
      </svg>`,
    };
  }

  return null;
}

