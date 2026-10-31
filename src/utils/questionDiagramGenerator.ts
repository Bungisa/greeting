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

  return null;
}
