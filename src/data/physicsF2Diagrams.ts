import type { QuestionDiagramSpec } from '../utils/questionDiagramGenerator.ts';

const SHARED_SVG_DEFS = `<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#111"/>
  </marker>
  <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#d93025"/>
  </marker>
  <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#1a73e8"/>
  </marker>
  <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#188038"/>
  </marker>
  <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#e8f0fe" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#aecbfa" stop-opacity="0.55"/>
  </linearGradient>
  <linearGradient id="brass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#fbbc04"/>
    <stop offset="50%" stop-color="#fde293"/>
    <stop offset="100%" stop-color="#f29900"/>
  </linearGradient>
  <pattern id="mirror-hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="0" y2="6" stroke="#5f6368" stroke-width="1.5"/>
  </pattern>
</defs>`;

export const PHYSICS_F2_SVG_ELECTROSCOPE = `<svg viewBox="0 0 520 340" class="w-full max-w-[480px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="520" height="340" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Wooden Base -->
  <rect x="110" y="290" width="220" height="18" rx="3" fill="#8d6e63" stroke="#4e342e" stroke-width="2"/>
  <!-- Metal Case -->
  <rect x="125" y="105" width="190" height="185" fill="#f8f9fa" stroke="#37474f" stroke-width="3"/>
  <rect x="135" y="115" width="170" height="165" fill="url(#glass-grad)" stroke="#90a4ae" stroke-width="1"/>
  <!-- Insulator Plug (Ebonite/Rubber) -->
  <rect x="195" y="88" width="50" height="32" rx="3" fill="#455a64" stroke="#263238" stroke-width="2"/>
  <!-- Brass Cap (Disc) -->
  <ellipse cx="220" cy="42" rx="58" ry="12" fill="url(#brass-grad)" stroke="#b06000" stroke-width="2"/>
  <!-- Negative Charges on Cap -->
  <text x="185" y="46" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1a73e8">-   -   -   -</text>
  <!-- Brass Stem / Rod -->
  <rect x="216" y="54" width="8" height="165" fill="url(#brass-grad)" stroke="#b06000" stroke-width="1.5"/>
  <!-- Brass Plate -->
  <rect x="215" y="190" width="10" height="45" fill="#f29900" stroke="#b06000" stroke-width="1"/>
  <!-- Diverging Gold Leaf -->
  <path d="M 224,192 Q 245,215 262,232 L 256,236 Q 240,218 224,200 Z" fill="#ffd700" stroke="#b06000" stroke-width="1.2"/>
  <!-- Repelled Charges on Plate & Leaf -->
  <text x="202" y="212" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1a73e8">-</text>
  <text x="202" y="228" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1a73e8">-</text>
  <text x="248" y="214" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1a73e8">-</text>
  <text x="262" y="228" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1a73e8">-</text>
  <!-- Earthing Symbol on Case -->
  <line x1="125" y1="250" x2="70" y2="250" stroke="#263238" stroke-width="2"/>
  <line x1="70" y1="250" x2="70" y2="280" stroke="#263238" stroke-width="2"/>
  <line x1="52" y1="280" x2="88" y2="280" stroke="#263238" stroke-width="2.5"/>
  <line x1="58" y1="287" x2="82" y2="287" stroke="#263238" stroke-width="2"/>
  <line x1="64" y1="294" x2="76" y2="294" stroke="#263238" stroke-width="2"/>
  <text x="70" y="312" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#111">Earth</text>
  <!-- Callout Lines & Labels -->
  <line x1="278" y1="42" x2="355" y2="42" stroke="#111" stroke-width="1.2" marker-start="url(#arrow)"/>
  <text x="362" y="46" font-family="sans-serif" font-size="13" font-weight="bold" fill="#111">Brass cap</text>
  <line x1="245" y1="102" x2="355" y2="102" stroke="#111" stroke-width="1.2" marker-start="url(#arrow)"/>
  <text x="362" y="106" font-family="sans-serif" font-size="13" font-weight="bold" fill="#111">Insulator (Ebonite)</text>
  <line x1="224" y1="150" x2="355" y2="150" stroke="#111" stroke-width="1.2" marker-start="url(#arrow)"/>
  <text x="362" y="154" font-family="sans-serif" font-size="13" font-weight="bold" fill="#111">Brass rod (stem)</text>
  <line x1="258" y1="225" x2="355" y2="210" stroke="#111" stroke-width="1.2" marker-start="url(#arrow)"/>
  <text x="362" y="214" font-family="sans-serif" font-size="13" font-weight="bold" fill="#111">Gold leaf</text>
  <line x1="215" y1="225" x2="355" y2="245" stroke="#111" stroke-width="1.2" marker-start="url(#arrow)"/>
  <text x="362" y="249" font-family="sans-serif" font-size="13" font-weight="bold" fill="#111">Brass plate</text>
  <line x1="315" y1="275" x2="355" y2="275" stroke="#111" stroke-width="1.2" marker-start="url(#arrow)"/>
  <text x="362" y="279" font-family="sans-serif" font-size="13" font-weight="bold" fill="#111">Earthed metal case</text>
</svg>`;

export const PHYSICS_F2_SVG_CAPACITORS = `<svg viewBox="0 0 760 260" class="w-full max-w-[680px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="760" height="260" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Capacitors in Series -->
  <text x="130" y="24" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Series Connection (Fig 1.36)</text>
  <polyline points="30,100 30,65 65,65" fill="none" stroke="#111" stroke-width="2"/>
  <!-- C1 -->
  <line x1="65" y1="45" x2="65" y2="85" stroke="#1a73e8" stroke-width="3.5"/>
  <line x1="75" y1="45" x2="75" y2="85" stroke="#1a73e8" stroke-width="3.5"/>
  <text x="70" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">C₁</text>
  <text x="70" y="102" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#111">V₁</text>
  <line x1="75" y1="65" x2="120" y2="65" stroke="#111" stroke-width="2"/>
  <!-- C2 -->
  <line x1="120" y1="45" x2="120" y2="85" stroke="#1a73e8" stroke-width="3.5"/>
  <line x1="130" y1="45" x2="130" y2="85" stroke="#1a73e8" stroke-width="3.5"/>
  <text x="125" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">C₂</text>
  <text x="125" y="102" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#111">V₂</text>
  <line x1="130" y1="65" x2="175" y2="65" stroke="#111" stroke-width="2"/>
  <!-- C3 -->
  <line x1="175" y1="45" x2="175" y2="85" stroke="#1a73e8" stroke-width="3.5"/>
  <line x1="185" y1="45" x2="185" y2="85" stroke="#1a73e8" stroke-width="3.5"/>
  <text x="180" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">C₃</text>
  <text x="180" y="102" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#111">V₃</text>
  <polyline points="185,65 225,65 225,180 135,180" fill="none" stroke="#111" stroke-width="2"/>
  <polyline points="30,100 30,180 123,180" fill="none" stroke="#111" stroke-width="2"/>
  <!-- Battery V -->
  <line x1="123" y1="162" x2="123" y2="198" stroke="#d93025" stroke-width="2.5"/>
  <line x1="135" y1="170" x2="135" y2="190" stroke="#111" stroke-width="4.5"/>
  <text x="112" y="168" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">+</text>
  <text x="129" y="218" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">V = V₁ + V₂ + V₃</text>

  <!-- (b) Capacitors in Parallel (Fig 1.37 & Fig 1.50) -->
  <text x="515" y="24" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(b) Parallel Circuit (Fig 1.37 &amp; Fig 1.50)</text>
  <line x1="360" y1="60" x2="360" y2="118" stroke="#111" stroke-width="2"/>
  <line x1="342" y1="118" x2="378" y2="118" stroke="#d93025" stroke-width="2.5"/>
  <line x1="350" y1="128" x2="370" y2="128" stroke="#111" stroke-width="4.5"/>
  <text x="330" y="128" text-anchor="end" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">3.0 V</text>
  <line x1="360" y1="128" x2="360" y2="195" stroke="#111" stroke-width="2"/>
  <line x1="360" y1="60" x2="620" y2="60" stroke="#111" stroke-width="2"/>
  <line x1="360" y1="195" x2="620" y2="195" stroke="#111" stroke-width="2"/>
  <!-- Branch 1: 0.3 uF -->
  <circle cx="485" cy="60" r="3.5" fill="#111"/>
  <circle cx="485" cy="195" r="3.5" fill="#111"/>
  <line x1="485" y1="60" x2="485" y2="120" stroke="#111" stroke-width="2"/>
  <line x1="465" y1="120" x2="505" y2="120" stroke="#1a73e8" stroke-width="3.5"/>
  <line x1="465" y1="132" x2="505" y2="132" stroke="#1a73e8" stroke-width="3.5"/>
  <line x1="485" y1="132" x2="485" y2="195" stroke="#111" stroke-width="2"/>
  <text x="515" y="130" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">C₁ = 0.3 µF</text>
  <!-- Branch 2: 0.6 uF -->
  <line x1="620" y1="60" x2="620" y2="120" stroke="#111" stroke-width="2"/>
  <line x1="600" y1="120" x2="640" y2="120" stroke="#1a73e8" stroke-width="3.5"/>
  <line x1="600" y1="132" x2="640" y2="132" stroke="#1a73e8" stroke-width="3.5"/>
  <line x1="620" y1="132" x2="620" y2="195" stroke="#111" stroke-width="2"/>
  <text x="650" y="130" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">C₂ = 0.6 µF</text>
  <text x="515" y="225" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">C_T = C₁ + C₂</text>
</svg>`;

export const PHYSICS_F2_SVG_BRIDGES = `<svg viewBox="0 0 780 310" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="310" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Wheatstone Bridge -->
  <text x="165" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Balanced Wheatstone Bridge (Fig 2.28)</text>
  <circle cx="55" cy="145" r="4" fill="#111"/><text x="38" y="149" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">A</text>
  <circle cx="165" cy="50" r="4" fill="#111"/><text x="165" y="40" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">B</text>
  <circle cx="275" cy="145" r="4" fill="#111"/><text x="288" y="149" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">C</text>
  <circle cx="165" cy="240" r="4" fill="#111"/><text x="165" y="258" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">D</text>

  <!-- Diamond Arms with Rotated Resistors -->
  <line x1="55" y1="145" x2="165" y2="50" stroke="#111" stroke-width="2"/>
  <rect x="85" y="85" width="44" height="16" fill="#fff" stroke="#1a73e8" stroke-width="2" transform="rotate(-40.8 107 93)"/>
  <text x="85" y="75" font-family="sans-serif" font-weight="bold" font-size="13" fill="#1a73e8">P</text>

  <line x1="165" y1="50" x2="275" y2="145" stroke="#111" stroke-width="2"/>
  <rect x="200" y="85" width="44" height="16" fill="#fff" stroke="#1a73e8" stroke-width="2" transform="rotate(40.8 222 93)"/>
  <text x="235" y="75" font-family="sans-serif" font-weight="bold" font-size="13" fill="#1a73e8">Q</text>

  <line x1="55" y1="145" x2="165" y2="240" stroke="#111" stroke-width="2"/>
  <rect x="85" y="185" width="44" height="16" fill="#fff" stroke="#188038" stroke-width="2" transform="rotate(40.8 107 193)"/>
  <text x="85" y="218" font-family="sans-serif" font-weight="bold" font-size="13" fill="#188038">R</text>

  <line x1="165" y1="240" x2="275" y2="145" stroke="#111" stroke-width="2"/>
  <rect x="200" y="185" width="44" height="16" fill="#fff" stroke="#d93025" stroke-width="2" transform="rotate(-40.8 222 193)"/>
  <text x="238" y="218" font-family="sans-serif" font-weight="bold" font-size="13" fill="#d93025">X</text>

  <!-- Center Galvanometer Branch -->
  <line x1="165" y1="50" x2="165" y2="125" stroke="#111" stroke-width="1.8"/>
  <circle cx="165" cy="145" r="20" fill="#fff" stroke="#111" stroke-width="2"/>
  <text x="165" y="150" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#111">G</text>
  <line x1="165" y1="165" x2="165" y2="240" stroke="#111" stroke-width="1.8"/>

  <!-- External Battery Loop -->
  <polyline points="55,145 25,145 25,280 155,280" fill="none" stroke="#111" stroke-width="1.8"/>
  <polyline points="275,145 305,145 305,280 168,280" fill="none" stroke="#111" stroke-width="1.8"/>
  <line x1="155" y1="266" x2="155" y2="294" stroke="#d93025" stroke-width="2.5"/>
  <line x1="168" y1="273" x2="168" y2="287" stroke="#111" stroke-width="4.5"/>

  <!-- (b) Slide-Wire Metre Bridge (Fig 2.30, 2.31 & 2.32) -->
  <text x="555" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(b) Slide-Wire Metre Bridge (Fig 2.30 &amp; 2.32)</text>
  <polygon points="360,95 425,95 425,107 372,107 372,190 360,190" fill="#b0bec5" stroke="#37474f" stroke-width="1.5"/>
  <rect x="495" y="95" width="120" height="12" fill="#b0bec5" stroke="#37474f" stroke-width="1.5"/>
  <polygon points="750,95 685,95 685,107 738,107 738,190 750,190" fill="#b0bec5" stroke="#37474f" stroke-width="1.5"/>

  <!-- Standard Resistor R & Unknown Resistor X -->
  <line x1="415" y1="95" x2="415" y2="55" stroke="#111" stroke-width="2"/>
  <line x1="505" y1="95" x2="505" y2="55" stroke="#111" stroke-width="2"/>
  <line x1="415" y1="55" x2="435" y2="55" stroke="#111" stroke-width="2"/>
  <rect x="435" y="43" width="50" height="24" fill="#e8f0fe" stroke="#1a73e8" stroke-width="2"/>
  <text x="460" y="59" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">R = 10 Ω</text>
  <line x1="485" y1="55" x2="505" y2="55" stroke="#111" stroke-width="2"/>

  <line x1="605" y1="95" x2="605" y2="55" stroke="#111" stroke-width="2"/>
  <line x1="695" y1="95" x2="695" y2="55" stroke="#111" stroke-width="2"/>
  <line x1="605" y1="55" x2="625" y2="55" stroke="#111" stroke-width="2"/>
  <rect x="625" y="43" width="50" height="24" fill="#fce8e6" stroke="#d93025" stroke-width="2"/>
  <text x="650" y="59" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">R_x (X)</text>
  <line x1="675" y1="55" x2="695" y2="55" stroke="#111" stroke-width="2"/>

  <!-- Uniform Resistance Wire AB (100 cm) -->
  <line x1="366" y1="190" x2="744" y2="190" stroke="#d93025" stroke-width="3.5"/>
  <circle cx="366" cy="190" r="4" fill="#111"/><text x="348" y="195" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">A</text>
  <circle cx="744" cy="190" r="4" fill="#111"/><text x="756" y="195" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">B</text>

  <!-- Galvanometer & Sliding Jockey J -->
  <circle cx="555" cy="101" r="3.5" fill="#111"/>
  <line x1="555" y1="101" x2="555" y2="125" stroke="#111" stroke-width="1.8"/>
  <circle cx="555" cy="142" r="17" fill="#fff" stroke="#111" stroke-width="2"/>
  <text x="555" y="147" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">G</text>
  <line x1="555" y1="159" x2="545" y2="185" stroke="#111" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="562" y="180" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">J (Jockey)</text>

  <!-- Balance Length Dimensions l1 and l2 -->
  <line x1="366" y1="212" x2="545" y2="212" stroke="#1a73e8" stroke-width="1.5" marker-start="url(#arrow-blue)" marker-end="url(#arrow-blue)"/>
  <text x="455" y="228" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#1a73e8">l₁ = 48 cm</text>

  <line x1="545" y1="212" x2="744" y2="212" stroke="#188038" stroke-width="1.5" marker-start="url(#arrow-green)" marker-end="url(#arrow-green)"/>
  <text x="645" y="228" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#188038">l₂ = 52 cm</text>

  <!-- Bottom Cell & Switch -->
  <polyline points="366,190 366,275 515,275" fill="none" stroke="#111" stroke-width="1.8"/>
  <line x1="515" y1="262" x2="515" y2="288" stroke="#d93025" stroke-width="2.5"/>
  <line x1="527" y1="268" x2="527" y2="282" stroke="#111" stroke-width="4.5"/>
  <text x="521" y="302" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">E</text>
  <line x1="527" y1="275" x2="600" y2="275" stroke="#111" stroke-width="1.8"/>
  <line x1="600" y1="275" x2="625" y2="262" stroke="#111" stroke-width="2"/>
  <text x="615" y="295" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">S</text>
  <polyline points="630,275 744,275 744,190" fill="none" stroke="#111" stroke-width="1.8"/>
</svg>`;

export const PHYSICS_F2_SVG_CIRCUITS = `<svg viewBox="0 0 780 270" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="270" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Fig 2.66 V-I Graph -->
  <text x="135" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">(a) Fig 2.66: I-V Characteristic Graph</text>
  <g stroke="#e0e0e0" stroke-width="1">
    <line x1="45" y1="45" x2="235" y2="45"/><line x1="45" y1="75" x2="235" y2="75"/>
    <line x1="45" y1="105" x2="235" y2="105"/><line x1="45" y1="135" x2="235" y2="135"/>
    <line x1="45" y1="165" x2="235" y2="165"/><line x1="83" y1="45" x2="83" y2="195"/>
    <line x1="121" y1="45" x2="121" y2="195"/><line x1="159" y1="45" x2="159" y2="195"/>
    <line x1="197" y1="45" x2="197" y2="195"/><line x1="235" y1="45" x2="235" y2="195"/>
  </g>
  <line x1="45" y1="195" x2="245" y2="195" stroke="#111" stroke-width="2" marker-end="url(#arrow)"/>
  <line x1="45" y1="195" x2="45" y2="35" stroke="#111" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="25" y="45" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">I (A)</text>
  <text x="235" y="218" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">V (V)</text>
  <text x="45" y="210" text-anchor="middle" font-size="10" fill="#111">0</text>
  <text x="83" y="210" text-anchor="middle" font-size="10" fill="#111">2</text>
  <text x="121" y="210" text-anchor="middle" font-size="10" fill="#111">4</text>
  <text x="159" y="210" text-anchor="middle" font-size="10" fill="#111">6</text>
  <text x="197" y="210" text-anchor="middle" font-size="10" fill="#111">8</text>
  <text x="235" y="210" text-anchor="middle" font-size="10" fill="#111">10</text>
  <text x="36" y="169" text-anchor="end" font-size="10" fill="#111">1</text>
  <text x="36" y="139" text-anchor="end" font-size="10" fill="#111">2</text>
  <text x="36" y="109" text-anchor="end" font-size="10" fill="#111">3</text>
  <text x="36" y="79" text-anchor="end" font-size="10" fill="#111">4</text>
  <text x="36" y="49" text-anchor="end" font-size="10" fill="#111">5</text>
  <line x1="45" y1="195" x2="235" y2="45" stroke="#d93025" stroke-width="2.5"/>
  <circle cx="83" cy="165" r="3.5" fill="#1a73e8"/>
  <circle cx="159" cy="105" r="3.5" fill="#1a73e8"/>
  <circle cx="235" cy="45" r="3.5" fill="#1a73e8"/>

  <!-- (b) Fig 2.71 Series-Parallel Network -->
  <text x="520" y="20" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">(b) Fig 2.71: Series-Parallel Resistor Network (Q13)</text>
  <line x1="330" y1="65" x2="330" y2="120" stroke="#111" stroke-width="2"/>
  <line x1="312" y1="120" x2="348" y2="120" stroke="#d93025" stroke-width="2.5"/>
  <line x1="320" y1="132" x2="340" y2="132" stroke="#111" stroke-width="4.5"/>
  <text x="305" y="130" text-anchor="end" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">V_B = 24 V</text>
  <line x1="330" y1="132" x2="330" y2="210" stroke="#111" stroke-width="2"/>
  <line x1="330" y1="65" x2="395" y2="65" stroke="#111" stroke-width="2"/>
  <rect x="395" y="53" width="60" height="24" fill="#e8f0fe" stroke="#1a73e8" stroke-width="2"/>
  <text x="425" y="69" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">R₁ = 5 Ω</text>
  <line x1="455" y1="65" x2="660" y2="65" stroke="#111" stroke-width="2"/>
  <circle cx="535" cy="65" r="4" fill="#d93025"/>
  <text x="535" y="52" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#d93025">A</text>
  <line x1="535" y1="65" x2="535" y2="112" stroke="#111" stroke-width="2"/>
  <rect x="515" y="112" width="40" height="55" fill="#e6f4ea" stroke="#188038" stroke-width="2"/>
  <text x="535" y="144" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">R₂=10Ω</text>
  <line x1="535" y1="167" x2="535" y2="210" stroke="#111" stroke-width="2"/>
  <line x1="660" y1="65" x2="660" y2="112" stroke="#111" stroke-width="2"/>
  <rect x="640" y="112" width="40" height="55" fill="#e6f4ea" stroke="#188038" stroke-width="2"/>
  <text x="660" y="144" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">R₃=10Ω</text>
  <line x1="660" y1="167" x2="660" y2="210" stroke="#111" stroke-width="2"/>
  <circle cx="535" cy="210" r="4" fill="#d93025"/>
  <text x="535" y="230" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#d93025">B</text>
  <line x1="330" y1="210" x2="660" y2="210" stroke="#111" stroke-width="2"/>
</svg>`;

export const PHYSICS_F2_SVG_MAGNETISM = `<svg viewBox="0 0 780 270" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="270" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Bar Magnet Field Lines (Fig 3.32) -->
  <text x="180" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Bar Magnet Field Pattern (Fig 3.32)</text>
  <path d="M 135,120 C 80,25 280,25 225,120" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-mid="url(#arrow-blue)"/>
  <path d="M 150,120 C 120,60 240,60 210,120" fill="none" stroke="#1a73e8" stroke-width="1.8"/>
  <polygon points="184,71 176,75 184,79" fill="#1a73e8"/>
  <polygon points="184,44 176,48 184,52" fill="#1a73e8"/>
  <path d="M 135,152 C 80,245 280,245 225,152" fill="none" stroke="#1a73e8" stroke-width="1.8"/>
  <path d="M 150,152 C 120,210 240,210 210,152" fill="none" stroke="#1a73e8" stroke-width="1.8"/>
  <polygon points="184,193 176,197 184,201" fill="#1a73e8"/>
  <polygon points="184,218 176,222 184,226" fill="#1a73e8"/>
  <line x1="115" y1="136" x2="45" y2="136" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <line x1="115" y1="126" x2="55" y2="95" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <line x1="115" y1="146" x2="55" y2="177" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <line x1="315" y1="136" x2="250" y2="136" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <line x1="305" y1="95" x2="250" y2="126" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <line x1="305" y1="177" x2="250" y2="146" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <rect x="115" y="120" width="65" height="32" fill="#d93025" stroke="#111" stroke-width="2"/>
  <text x="147" y="141" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#fff">N</text>
  <rect x="180" y="120" width="65" height="32" fill="#1a73e8" stroke="#111" stroke-width="2"/>
  <text x="212" y="141" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#fff">S</text>

  <!-- (b) Like Poles Repelling & Neutral Point X (Fig 3.35) -->
  <text x="565" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(b) Like Poles Repulsion &amp; Neutral Point X (Fig 3.35)</text>
  <rect x="390" y="120" width="90" height="32" fill="#d93025" stroke="#111" stroke-width="2"/>
  <text x="435" y="141" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#fff">N</text>
  <rect x="650" y="120" width="90" height="32" fill="#d93025" stroke="#111" stroke-width="2"/>
  <text x="695" y="141" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#fff">N</text>
  <path d="M 480,126 Q 548,122 548,45" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <path d="M 480,134 Q 532,132 525,55" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <path d="M 480,146 Q 548,150 548,225" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <path d="M 480,138 Q 532,140 525,215" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <path d="M 650,126 Q 582,122 582,45" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <path d="M 650,134 Q 598,132 605,55" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <path d="M 650,146 Q 582,150 582,225" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <path d="M 650,138 Q 598,140 605,215" fill="none" stroke="#1a73e8" stroke-width="1.8" marker-end="url(#arrow-blue)"/>
  <circle cx="565" cy="136" r="14" fill="#fef7e0" stroke="#f29900" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="565" y="141" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#d93025">X</text>
  <text x="565" y="250" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#111">X = Neutral Point (Zero Net Field)</text>
</svg>`;

export const PHYSICS_F2_SVG_MIRRORS = `<svg viewBox="0 0 780 300" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="300" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Concave Mirror Real Image Formation (Fig 4.24 & 4.26) -->
  <text x="195" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Concave Mirror Ray Diagram (Fig 4.24 &amp; 4.26)</text>
  <line x1="20" y1="150" x2="365" y2="150" stroke="#111" stroke-width="1.5"/>
  <path d="M 320,45 Q 360,150 320,255" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M 320,45 Q 360,150 320,255 L 328,255 Q 368,150 328,45 Z" fill="url(#mirror-hatch)"/>
  <circle cx="340" cy="150" r="3.5" fill="#111"/><text x="352" y="165" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">P</text>
  <circle cx="250" cy="150" r="3.5" fill="#111"/><text x="250" y="168" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">F</text>
  <circle cx="160" cy="150" r="3.5" fill="#111"/><text x="160" y="168" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">C</text>
  <line x1="80" y1="150" x2="80" y2="85" stroke="#188038" stroke-width="3" marker-end="url(#arrow-green)"/>
  <text x="80" y="75" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#188038">A (Object)</text>
  <text x="80" y="168" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#188038">B</text>
  <line x1="80" y1="85" x2="334" y2="85" stroke="#d93025" stroke-width="1.6" marker-mid="url(#arrow-red)"/>
  <line x1="334" y1="85" x2="175" y2="208" stroke="#1a73e8" stroke-width="1.6"/>
  <line x1="80" y1="85" x2="334" y2="182" stroke="#d93025" stroke-width="1.6"/>
  <line x1="334" y1="182" x2="175" y2="182" stroke="#1a73e8" stroke-width="1.6"/>
  <line x1="209" y1="150" x2="209" y2="180" stroke="#1a73e8" stroke-width="3" marker-end="url(#arrow-blue)"/>
  <text x="209" y="198" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#1a73e8">A' (Image)</text>
  <text x="209" y="143" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#1a73e8">B'</text>

  <!-- (b) Convex Mirror Virtual Image Formation (Fig 4.27 & 4.28) -->
  <text x="580" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(b) Convex Mirror Ray Diagram (Fig 4.27 &amp; 4.28)</text>
  <line x1="400" y1="150" x2="760" y2="150" stroke="#111" stroke-width="1.5"/>
  <path d="M 575,45 Q 535,150 575,255" fill="none" stroke="#111" stroke-width="3"/>
  <path d="M 575,45 Q 535,150 575,255 L 583,255 Q 543,150 583,45 Z" fill="url(#mirror-hatch)"/>
  <circle cx="555" cy="150" r="3.5" fill="#111"/><text x="542" y="168" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">P</text>
  <circle cx="635" cy="150" r="3.5" fill="#111"/><text x="635" y="168" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">F</text>
  <circle cx="715" cy="150" r="3.5" fill="#111"/><text x="715" y="168" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">C</text>
  <line x1="455" y1="150" x2="455" y2="80" stroke="#188038" stroke-width="3" marker-end="url(#arrow-green)"/>
  <text x="455" y="70" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#188038">Object</text>
  <line x1="455" y1="80" x2="562" y2="80" stroke="#d93025" stroke-width="1.6"/>
  <line x1="562" y1="80" x2="490" y2="11" stroke="#1a73e8" stroke-width="1.6" marker-end="url(#arrow-blue)"/>
  <line x1="562" y1="80" x2="635" y2="150" stroke="#1a73e8" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="455" y1="80" x2="557" y2="107" stroke="#d93025" stroke-width="1.6"/>
  <line x1="557" y1="107" x2="715" y2="150" stroke="#1a73e8" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="599" y1="150" x2="599" y2="118" stroke="#1a73e8" stroke-width="2.5" stroke-dasharray="2,1" marker-end="url(#arrow-blue)"/>
  <text x="605" y="110" font-family="sans-serif" font-weight="bold" font-size="11" fill="#1a73e8">Virtual Image</text>
</svg>`;

export const PHYSICS_F2_SVG_REFRACTION_PRISM = `<svg viewBox="0 0 780 290" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="290" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Rectangular Glass Block (Fig 5.5 & 5.6) -->
  <text x="175" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Refraction in Rectangular Glass Block (Fig 5.5)</text>
  <rect x="65" y="85" width="220" height="110" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <text x="275" y="105" text-anchor="end" font-family="sans-serif" font-size="11" fill="#1557b0">Glass Block</text>
  <line x1="130" y1="40" x2="130" y2="145" stroke="#555" stroke-width="1.3" stroke-dasharray="4,3"/>
  <text x="135" y="48" font-family="sans-serif" font-size="11" fill="#111">N</text>
  <line x1="75" y1="35" x2="130" y2="85" stroke="#d93025" stroke-width="2" marker-mid="url(#arrow-red)"/>
  <text x="115" y="70" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">i</text>
  <line x1="130" y1="85" x2="175" y2="195" stroke="#1a73e8" stroke-width="2" marker-mid="url(#arrow-blue)"/>
  <text x="137" y="118" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">r</text>
  <line x1="175" y1="145" x2="175" y2="250" stroke="#555" stroke-width="1.3" stroke-dasharray="4,3"/>
  <text x="162" y="248" font-family="sans-serif" font-size="11" fill="#111">N'</text>
  <line x1="175" y1="195" x2="230" y2="245" stroke="#d93025" stroke-width="2" marker-end="url(#arrow-red)"/>
  <text x="186" y="222" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">e</text>
  <line x1="130" y1="85" x2="265" y2="208" stroke="#999" stroke-width="1.2" stroke-dasharray="3,3"/>

  <!-- (b) Triangular Glass Prism Minimum Deviation (Fig 5.11 & 5.14) -->
  <text x="565" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(b) Triangular Glass Prism Deviation (Fig 5.11 &amp; 5.14)</text>
  <polygon points="565,45 455,225 675,225" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2.2"/>
  <text x="565" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">A</text>
  <text x="440" y="232" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">B</text>
  <text x="685" y="232" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">C</text>
  <line x1="415" y1="185" x2="510" y2="135" stroke="#d93025" stroke-width="2"/>
  <line x1="510" y1="135" x2="625" y2="75" stroke="#555" stroke-width="1.3" stroke-dasharray="4,3"/>
  <line x1="510" y1="135" x2="620" y2="135" stroke="#1a73e8" stroke-width="2.2"/>
  <line x1="620" y1="135" x2="715" y2="185" stroke="#d93025" stroke-width="2" marker-end="url(#arrow-red)"/>
  <line x1="620" y1="135" x2="565" y2="106" stroke="#555" stroke-width="1.3" stroke-dasharray="4,3"/>
  <line x1="470" y1="110" x2="565" y2="168" stroke="#333" stroke-width="1.2" stroke-dasharray="3,3"/>
  <line x1="660" y1="110" x2="565" y2="168" stroke="#333" stroke-width="1.2" stroke-dasharray="3,3"/>
  <path d="M 592,92 A 30,30 0 0,1 592,120" fill="none" stroke="#d93025" stroke-width="1.8"/>
  <text x="605" y="112" font-family="sans-serif" font-weight="bold" font-size="13" fill="#d93025">D</text>
  <text x="488" y="132" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">i</text>
  <text x="532" y="148" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">r</text>
  <text x="595" y="148" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">i₂</text>
  <text x="642" y="132" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">e</text>
</svg>`;

export const PHYSICS_F2_SVG_REV5_DIAGRAMS = `<svg viewBox="0 0 760 220" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="760" height="220" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Fig 5.44 -->
  <text x="95" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">Figure 5.44 (Air–Water)</text>
  <rect x="20" y="105" width="150" height="80" fill="url(#glass-grad)" opacity="0.5"/>
  <line x1="20" y1="105" x2="170" y2="105" stroke="#1a73e8" stroke-width="2"/>
  <line x1="95" y1="35" x2="95" y2="185" stroke="#555" stroke-width="1.4" stroke-dasharray="4,3"/>
  <line x1="35" y1="55" x2="95" y2="105" stroke="#d93025" stroke-width="2" marker-mid="url(#arrow-red)"/>
  <line x1="95" y1="105" x2="132" y2="175" stroke="#1a73e8" stroke-width="2" marker-end="url(#arrow-blue)"/>
  <text x="35" y="95" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">Air</text>
  <text x="35" y="125" font-family="sans-serif" font-weight="bold" font-size="11" fill="#1557b0">Water</text>
  <text x="62" y="100" font-family="sans-serif" font-weight="bold" font-size="11" fill="#d93025">40°</text>

  <!-- Fig 5.45 -->
  <text x="290" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">Figure 5.45 (Media P, Q, R)</text>
  <rect x="210" y="38" width="160" height="45" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
  <text x="224" y="65" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">P</text>
  <rect x="210" y="83" width="160" height="45" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="1.5"/>
  <text x="224" y="110" font-family="sans-serif" font-weight="bold" font-size="13" fill="#1a73e8">Q</text>
  <rect x="210" y="128" width="160" height="45" fill="#e6f4ea" stroke="#188038" stroke-width="1.5"/>
  <text x="224" y="155" font-family="sans-serif" font-weight="bold" font-size="13" fill="#188038">R</text>
  <line x1="235" y1="28" x2="280" y2="83" stroke="#d93025" stroke-width="2"/>
  <line x1="280" y1="83" x2="295" y2="128" stroke="#1a73e8" stroke-width="2"/>
  <line x1="295" y1="128" x2="335" y2="178" stroke="#188038" stroke-width="2" marker-end="url(#arrow-green)"/>

  <!-- Fig 5.47 Right-Angled Prism -->
  <text x="565" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">Figure 5.47 (Right-Angled Prism 90°–45°–45°)</text>
  <polygon points="495,38 495,182 645,182" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2.2"/>
  <rect x="495" y="168" width="14" height="14" fill="none" stroke="#111" stroke-width="1.5"/>
  <text x="515" y="176" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">90°</text>
  <text x="602" y="176" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">45°</text>
  <!-- Blue, Green, Red Rays -->
  <line x1="430" y1="72" x2="530" y2="72" stroke="#1a73e8" stroke-width="2" marker-mid="url(#arrow-blue)"/>
  <line x1="530" y1="72" x2="530" y2="182" stroke="#1a73e8" stroke-width="2" marker-end="url(#arrow-blue)"/>
  <text x="424" y="76" text-anchor="end" font-family="sans-serif" font-weight="bold" font-size="11" fill="#1a73e8">Blue (1.47)</text>
  <line x1="430" y1="108" x2="568" y2="108" stroke="#188038" stroke-width="2" marker-mid="url(#arrow-green)"/>
  <line x1="568" y1="108" x2="568" y2="182" stroke="#188038" stroke-width="2" marker-end="url(#arrow-green)"/>
  <text x="424" y="112" text-anchor="end" font-family="sans-serif" font-weight="bold" font-size="11" fill="#188038">Green (1.44)</text>
  <line x1="430" y1="142" x2="603" y2="142" stroke="#d93025" stroke-width="2" marker-mid="url(#arrow-red)"/>
  <line x1="603" y1="142" x2="665" y2="168" stroke="#d93025" stroke-width="2" marker-end="url(#arrow-red)"/>
  <text x="424" y="146" text-anchor="end" font-family="sans-serif" font-weight="bold" font-size="11" fill="#d93025">Red (1.39)</text>
</svg>`;

export const PHYSICS_F2_SVG_LENSES = `<svg viewBox="0 0 780 290" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="290" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Convex Lens Ray Diagram (Fig 5.38) -->
  <text x="195" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Convex Lens Image Formation (Fig 5.38)</text>
  <line x1="15" y1="145" x2="375" y2="145" stroke="#111" stroke-width="1.5"/>
  <path d="M 195,50 Q 218,145 195,240 Q 172,145 195,50 Z" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <line x1="195" y1="50" x2="195" y2="240" stroke="#1a73e8" stroke-width="1" stroke-dasharray="3,3"/>
  <circle cx="195" cy="145" r="3" fill="#111"/><text x="202" y="160" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">O</text>
  <circle cx="130" cy="145" r="3" fill="#111"/><text x="130" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">F₁</text>
  <circle cx="65" cy="145" r="3" fill="#111"/><text x="65" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">2F₁</text>
  <circle cx="260" cy="145" r="3" fill="#111"/><text x="260" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">F₂</text>
  <circle cx="325" cy="145" r="3" fill="#111"/><text x="325" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">2F₂</text>
  <line x1="40" y1="145" x2="40" y2="85" stroke="#188038" stroke-width="3" marker-end="url(#arrow-green)"/>
  <text x="40" y="75" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#188038">A</text>
  <text x="40" y="162" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#188038">B</text>
  <line x1="40" y1="85" x2="195" y2="85" stroke="#d93025" stroke-width="1.6"/>
  <line x1="195" y1="85" x2="325" y2="205" stroke="#1a73e8" stroke-width="1.6" marker-end="url(#arrow-blue)"/>
  <line x1="40" y1="85" x2="325" y2="195" stroke="#d93025" stroke-width="1.6" marker-end="url(#arrow-red)"/>
  <line x1="307" y1="145" x2="307" y2="186" stroke="#1a73e8" stroke-width="3" marker-end="url(#arrow-blue)"/>
  <text x="307" y="204" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#1a73e8">A'</text>
  <text x="307" y="138" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#1a73e8">B'</text>

  <!-- (b) Concave Lens Ray Diagram (Fig 5.39) -->
  <text x="585" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(b) Concave Lens Image Formation (Fig 5.39)</text>
  <line x1="405" y1="145" x2="765" y2="145" stroke="#111" stroke-width="1.5"/>
  <path d="M 570,50 L 600,50 Q 584,145 600,240 L 570,240 Q 586,145 570,50 Z" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <line x1="585" y1="50" x2="585" y2="240" stroke="#1a73e8" stroke-width="1" stroke-dasharray="3,3"/>
  <circle cx="585" cy="145" r="3" fill="#111"/><text x="592" y="160" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">O</text>
  <circle cx="510" cy="145" r="3" fill="#111"/><text x="510" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">F₁</text>
  <circle cx="435" cy="145" r="3" fill="#111"/><text x="435" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">2F₁</text>
  <circle cx="660" cy="145" r="3" fill="#111"/><text x="660" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">F₂</text>
  <line x1="460" y1="145" x2="460" y2="75" stroke="#188038" stroke-width="3" marker-end="url(#arrow-green)"/>
  <text x="460" y="65" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#188038">Object</text>
  <line x1="460" y1="75" x2="585" y2="75" stroke="#d93025" stroke-width="1.6"/>
  <line x1="585" y1="75" x2="675" y2="25" stroke="#1a73e8" stroke-width="1.6" marker-end="url(#arrow-blue)"/>
  <line x1="510" y1="145" x2="585" y2="75" stroke="#1a73e8" stroke-width="1.4" stroke-dasharray="4,3"/>
  <line x1="460" y1="75" x2="685" y2="201" stroke="#d93025" stroke-width="1.6" marker-end="url(#arrow-red)"/>
  <line x1="538" y1="145" x2="538" y2="119" stroke="#1a73e8" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
  <text x="538" y="110" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="10" fill="#1a73e8">Image</text>
</svg>`;

export const PHYSICS_F2_SVG_OPTICAL_INSTRUMENTS = `<svg viewBox="0 0 780 320" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="320" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Compound Microscope (Fig 6.4) -->
  <text x="195" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Compound Microscope Ray Diagram (Fig 6.4)</text>
  <line x1="15" y1="125" x2="375" y2="125" stroke="#111" stroke-width="1.5"/>
  <path d="M 105,75 Q 120,125 105,175 Q 90,125 105,75 Z" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <text x="105" y="192" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">Objective (O)</text>
  <path d="M 285,45 Q 306,125 285,205 Q 264,125 285,45 Z" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <text x="285" y="222" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">Eyepiece (E)</text>
  <circle cx="72" cy="125" r="2.5" fill="#111"/><text x="72" y="140" text-anchor="middle" font-size="10" fill="#111">F_o</text>
  <circle cx="205" cy="125" r="2.5" fill="#111"/><text x="205" y="118" text-anchor="middle" font-size="10" fill="#111">F_e</text>
  <line x1="55" y1="125" x2="55" y2="98" stroke="#188038" stroke-width="2.5" marker-end="url(#arrow-green)"/>
  <text x="55" y="92" text-anchor="middle" font-size="10" font-weight="bold" fill="#188038">A</text>
  <text x="55" y="138" text-anchor="middle" font-size="10" font-weight="bold" fill="#188038">B</text>
  <line x1="55" y1="98" x2="105" y2="98" stroke="#d93025" stroke-width="1.3"/>
  <line x1="105" y1="98" x2="285" y2="185" stroke="#d93025" stroke-width="1.3"/>
  <line x1="55" y1="98" x2="285" y2="198" stroke="#d93025" stroke-width="1.3"/>
  <line x1="220" y1="125" x2="220" y2="162" stroke="#1a73e8" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
  <text x="220" y="118" text-anchor="middle" font-size="10" font-weight="bold" fill="#1a73e8">B'</text>
  <text x="220" y="175" text-anchor="middle" font-size="10" font-weight="bold" fill="#1a73e8">A' (I₁)</text>
  <line x1="285" y1="185" x2="355" y2="145" stroke="#1a73e8" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
  <line x1="285" y1="198" x2="355" y2="158" stroke="#1a73e8" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
  <line x1="285" y1="185" x2="35" y2="275" stroke="#1a73e8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="285" y1="198" x2="35" y2="275" stroke="#1a73e8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="35" y1="125" x2="35" y2="275" stroke="#1a73e8" stroke-width="2.5" stroke-dasharray="4,2" marker-end="url(#arrow-blue)"/>
  <text x="35" y="118" text-anchor="middle" font-size="10" font-weight="bold" fill="#1a73e8">B''</text>
  <text x="115" y="295" text-anchor="middle" font-size="11" font-weight="bold" fill="#1a73e8">A'' (Final Virtual Image I₂)</text>

  <!-- (b) Astronomical Telescope in Normal Adjustment (Fig 6.8) -->
  <text x="585" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(b) Astronomical Telescope Ray Diagram (Fig 6.8)</text>
  <line x1="400" y1="125" x2="765" y2="125" stroke="#111" stroke-width="1.5"/>
  <path d="M 475,45 Q 496,125 475,205 Q 454,125 475,45 Z" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <text x="475" y="222" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">Objective (f_o)</text>
  <path d="M 685,70 Q 700,125 685,180 Q 670,125 685,70 Z" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <text x="685" y="197" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#111">Eyepiece (f_e)</text>
  <line x1="405" y1="75" x2="475" y2="95" stroke="#d93025" stroke-width="1.5"/>
  <line x1="405" y1="105" x2="475" y2="125" stroke="#d93025" stroke-width="1.5"/>
  <text x="435" y="121" font-family="sans-serif" font-style="italic" font-size="12" fill="#111">α</text>
  <line x1="475" y1="95" x2="685" y2="195" stroke="#d93025" stroke-width="1.5"/>
  <line x1="475" y1="125" x2="685" y2="185" stroke="#d93025" stroke-width="1.5"/>
  <line x1="610" y1="125" x2="610" y2="163" stroke="#188038" stroke-width="2.5" marker-end="url(#arrow-green)"/>
  <text x="610" y="118" text-anchor="middle" font-size="10" font-weight="bold" fill="#188038">F_o / F_e (B')</text>
  <text x="610" y="178" text-anchor="middle" font-size="10" font-weight="bold" fill="#188038">A'</text>
  <line x1="685" y1="185" x2="755" y2="135" stroke="#1a73e8" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
  <line x1="685" y1="195" x2="755" y2="145" stroke="#1a73e8" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
  <line x1="685" y1="185" x2="465" y2="290" stroke="#1a73e8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <line x1="685" y1="195" x2="475" y2="295" stroke="#1a73e8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="515" y="295" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1a73e8">Final Image at ∞</text>
</svg>`;

export const PHYSICS_F2_SVG_HUMAN_EYE = `<svg viewBox="0 0 780 310" class="w-full max-w-[700px] h-auto mx-auto" xmlns="http://www.w3.org/2000/svg">
  ${SHARED_SVG_DEFS}
  <rect width="780" height="310" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- (a) Anatomy of the Human Eye (Fig 6.18) -->
  <text x="195" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#111">(a) Structure of the Human Eye (Fig 6.18)</text>
  <path d="M 105,105 A 82,82 0 1,1 105,215 Q 72,160 105,105 Z" fill="#f8f9fa" stroke="#37474f" stroke-width="3"/>
  <path d="M 125,95 A 74,74 0 1,1 125,225" fill="none" stroke="#d93025" stroke-width="2.5"/>
  <path d="M 255,148 L 295,148 M 255,172 L 295,172" stroke="#37474f" stroke-width="2.5"/>
  <rect x="253" y="150" width="42" height="20" fill="#fef7e0"/>
  <ellipse cx="122" cy="160" rx="12" ry="36" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="2"/>
  <path d="M 115,92 L 122,124 M 115,228 L 122,196" stroke="#5f6368" stroke-width="3"/>
  <line x1="104" y1="108" x2="104" y2="142" stroke="#4e342e" stroke-width="4"/>
  <line x1="104" y1="178" x2="104" y2="212" stroke="#4e342e" stroke-width="4"/>
  <line x1="88" y1="135" x2="48" y2="115" stroke="#111" stroke-width="1"/><text x="45" y="112" text-anchor="end" font-size="11" font-weight="bold" fill="#111">Cornea</text>
  <line x1="104" y1="160" x2="48" y2="160" stroke="#111" stroke-width="1"/><text x="45" y="164" text-anchor="end" font-size="11" font-weight="bold" fill="#111">Pupil</text>
  <line x1="104" y1="192" x2="48" y2="205" stroke="#111" stroke-width="1"/><text x="45" y="209" text-anchor="end" font-size="11" font-weight="bold" fill="#111">Iris</text>
  <line x1="122" y1="135" x2="122" y2="55" stroke="#111" stroke-width="1"/><text x="122" y="48" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">Crystalline Lens</text>
  <line x1="185" y1="160" x2="185" y2="265" stroke="#111" stroke-width="1"/><text x="185" y="280" text-anchor="middle" font-size="11" font-weight="bold" fill="#111">Vitreous Humour</text>
  <line x1="242" y1="115" x2="295" y2="95" stroke="#111" stroke-width="1"/><text x="300" y="99" font-size="11" font-weight="bold" fill="#d93025">Retina</text>
  <text x="300" y="164" font-size="11" font-weight="bold" fill="#111">Optic Nerve</text>

  <!-- (b) Myopia & Diverging Lens Correction (Fig 6.21 & 6.22) -->
  <text x="575" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#111">(b) Myopia (Short-Sightedness) &amp; Concave Lens Correction</text>
  <ellipse cx="645" cy="85" rx="52" ry="38" fill="#f8f9fa" stroke="#37474f" stroke-width="2"/>
  <ellipse cx="606" cy="85" rx="6" ry="22" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="1.5"/>
  <line x1="480" y1="72" x2="606" y2="72" stroke="#d93025" stroke-width="1.4"/>
  <line x1="480" y1="98" x2="606" y2="98" stroke="#d93025" stroke-width="1.4"/>
  <line x1="606" y1="72" x2="695" y2="92" stroke="#1a73e8" stroke-width="1.4"/>
  <line x1="606" y1="98" x2="695" y2="78" stroke="#1a73e8" stroke-width="1.4"/>
  <circle cx="672" cy="85" r="3" fill="#d93025"/>
  <text x="615" y="138" text-anchor="middle" font-size="11" fill="#d93025">1. Uncorrected Myopia: Focus in front of retina</text>

  <path d="M 545,175 L 557,175 Q 550,210 557,245 L 545,245 Q 552,210 545,175 Z" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="1.8"/>
  <ellipse cx="645" cy="210" rx="52" ry="38" fill="#f8f9fa" stroke="#37474f" stroke-width="2"/>
  <ellipse cx="606" cy="210" rx="6" ry="22" fill="url(#glass-grad)" stroke="#1a73e8" stroke-width="1.5"/>
  <line x1="480" y1="198" x2="551" y2="198" stroke="#d93025" stroke-width="1.4"/>
  <line x1="480" y1="222" x2="551" y2="222" stroke="#d93025" stroke-width="1.4"/>
  <line x1="551" y1="198" x2="606" y2="192" stroke="#1a73e8" stroke-width="1.4"/>
  <line x1="551" y1="222" x2="606" y2="228" stroke="#1a73e8" stroke-width="1.4"/>
  <line x1="606" y1="192" x2="697" y2="210" stroke="#188038" stroke-width="1.6"/>
  <line x1="606" y1="228" x2="697" y2="210" stroke="#188038" stroke-width="1.6"/>
  <circle cx="697" cy="210" r="3" fill="#188038"/>
  <text x="615" y="265" text-anchor="middle" font-size="11" fill="#188038">2. Corrected with Concave Lens: Focus on retina</text>
</svg>`;

export function getPhysicsF2DiagramSvg(
  questionText: string,
  topic?: string,
  subTopic?: string
): QuestionDiagramSpec | null {
  if (!questionText) return null;
  const qLower = questionText.toLowerCase();
  const topicLower = (topic || '').toLowerCase();
  const subLower = (subTopic || '').toLowerCase();

  // 1. Chapter 1: Gold-Leaf Electroscope (Fig 1.17)
  if (
    qLower.includes('electroscope') ||
    qLower.includes('figure 1.17') ||
    qLower.includes('brass cap') ||
    qLower.includes('gold leaf') ||
    qLower.includes('gold-leaf') ||
    qLower.includes('proof plane')
  ) {
    return {
      title: 'Figure 1.17: Gold-Leaf Electroscope (High-Precision Vector Schematic)',
      caption: 'Brass cap, ebonite insulator, brass stem/plate, diverging gold leaf, and earthed metal case',
      svgHtml: PHYSICS_F2_SVG_ELECTROSCOPE,
    };
  }

  // 2. Chapter 1: Capacitor Networks (Figs 1.36, 1.37 & 1.50)
  if (
    qLower.includes('figure 1.36') ||
    qLower.includes('figure 1.37') ||
    qLower.includes('figure 1.50') ||
    (qLower.includes('capacitor') &&
      (qLower.includes('series') ||
        qLower.includes('parallel') ||
        qLower.includes('effective capacitance') ||
        qLower.includes('equivalent capacitance')))
  ) {
    return {
      title: 'Figures 1.36, 1.37 & 1.50: Capacitor Network Schematics (Series & Parallel)',
      caption: '(a) Capacitors in series V = V₁ + V₂ + V₃; (b) Parallel capacitor network (3.0 V across 0.3 µF and 0.6 µF)',
      svgHtml: PHYSICS_F2_SVG_CAPACITORS,
    };
  }

  // 3. Chapter 2: Wheatstone Bridge & Slide-Wire Metre Bridge (Figs 2.28, 2.30, 2.31, 2.32)
  if (
    qLower.includes('wheatstone') ||
    qLower.includes('metre bridge') ||
    qLower.includes('meter bridge') ||
    qLower.includes('figure 2.28') ||
    qLower.includes('figure 2.30') ||
    qLower.includes('figure 2.31') ||
    qLower.includes('figure 2.32') ||
    qLower.includes('potentiometer')
  ) {
    return {
      title: 'Figures 2.28, 2.30 & 2.32: Balanced Wheatstone Bridge & Slide-Wire Metre Bridge',
      caption: '(a) Balanced Wheatstone bridge (P/Q = R/X); (b) Slide-wire metre bridge with galvanometer G and jockey J',
      svgHtml: PHYSICS_F2_SVG_BRIDGES,
    };
  }

  // 4. Chapter 2: Revision Exercise 2 Circuit Diagrams & I-V Graph (Figs 2.23, 2.24, 2.35, 2.36, 2.40, 2.65–2.74)
  if (
    qLower.includes('figure 2.23') ||
    qLower.includes('figure 2.24') ||
    qLower.includes('figure 2.35') ||
    qLower.includes('figure 2.36') ||
    qLower.includes('figure 2.40') ||
    qLower.includes('figure 2.63') ||
    qLower.includes('figure 2.65') ||
    qLower.includes('figure 2.66') ||
    qLower.includes('figure 2.67') ||
    qLower.includes('figure 2.69') ||
    qLower.includes('figure 2.70') ||
    qLower.includes('figure 2.71') ||
    qLower.includes('figure 2.72') ||
    qLower.includes('figure 2.73') ||
    qLower.includes('figure 2.74') ||
    (topicLower.includes('current electricity') &&
      (qLower.includes('plot a graph of') ||
        qLower.includes('resistors in series') ||
        qLower.includes('connected in parallel') ||
        qLower.includes('circuit diagram')))
  ) {
    return {
      title: 'Figures 2.66 & 2.71: Ohmic I–V Characteristic Graph & Series-Parallel Resistor Network',
      caption: '(a) Linear I–V characteristic graph (R = ΔV/ΔI = 2.0 Ω); (b) 24 V battery with R₁ = 5 Ω in series with R₂ = 10 Ω ∥ R₃ = 10 Ω',
      svgHtml: PHYSICS_F2_SVG_CIRCUITS,
    };
  }

  // 5. Chapter 3: Magnetism Field Patterns & Neutral Point X (Figs 3.32, 3.35, 3.55–3.63)
  if (
    qLower.includes('figure 3.32') ||
    qLower.includes('figure 3.35') ||
    qLower.includes('figure 3.55') ||
    qLower.includes('figure 3.56') ||
    qLower.includes('figure 3.57') ||
    qLower.includes('figure 3.58') ||
    qLower.includes('figure 3.59') ||
    qLower.includes('figure 3.60') ||
    qLower.includes('figure 3.61') ||
    qLower.includes('figure 3.62') ||
    qLower.includes('figure 3.63') ||
    qLower.includes('neutral point') ||
    qLower.includes('magnetic shielding') ||
    (qLower.includes('magnetic') && (qLower.includes('field lines') || qLower.includes('lines of force') || qLower.includes('iron filings')))
  ) {
    return {
      title: 'Figures 3.32 & 3.35: Bar Magnet Field Pattern & Like Poles Repulsion / Neutral Point X',
      caption: '(a) Magnetic field lines emerging from North (N) and entering South (S); (b) Repelling N–N poles with zero-field Neutral Point X',
      svgHtml: PHYSICS_F2_SVG_MAGNETISM,
    };
  }

  // 6. Chapter 4: Concave & Convex Mirror Ray Diagrams (Figs 4.24, 4.26, 4.27)
  if (
    qLower.includes('figure 4.24') ||
    qLower.includes('figure 4.26') ||
    qLower.includes('figure 4.27') ||
    qLower.includes('concave mirror') ||
    qLower.includes('convex mirror') ||
    qLower.includes('converging mirror') ||
    qLower.includes('diverging mirror') ||
    qLower.includes('spherical mirror') ||
    qLower.includes('curved mirror')
  ) {
    return {
      title: 'Figures 4.24, 4.26 & 4.27: Concave & Convex Mirror Optical Ray Diagrams',
      caption: '(a) Concave mirror forming a real inverted image between C and F; (b) Convex mirror forming a virtual upright diminished image behind the mirror',
      svgHtml: PHYSICS_F2_SVG_MIRRORS,
    };
  }

  // 7A. Chapter 5: Revision Exercise 5 Specific Diagrams (Figs 5.44, 5.45, 5.47)
  if (
    qLower.includes('figure 5.44') ||
    qLower.includes('figure 5.45') ||
    qLower.includes('figure 5.47') ||
    (qLower.includes('right-angled prism') && qLower.includes('1.39'))
  ) {
    return {
      title: 'Figures 5.44, 5.45 & 5.47: Air–Water Refraction, Multi-Layer Media (P, Q, R) & Right-Angled Prism Total Internal Reflection',
      caption: 'Fig 5.44 (glancing angle 40° → i = 50°), Fig 5.45 (ray bending across media P, Q, R), and Fig 5.47 (Blue, Green, Red rays in 90°–45°–45° prism)',
      svgHtml: PHYSICS_F2_SVG_REV5_DIAGRAMS,
    };
  }

  // 7B. Chapter 5: Rectangular Glass Block & Triangular Glass Prism (Figs 5.5, 5.11, 5.14, 5.16)
  if (
    qLower.includes('figure 5.5') ||
    qLower.includes('figure 5.11') ||
    qLower.includes('figure 5.14') ||
    qLower.includes('figure 5.16') ||
    qLower.includes('glass block') ||
    qLower.includes('glass slab') ||
    qLower.includes('triangular prism') ||
    qLower.includes('glass prism') ||
    qLower.includes('equilateral prism') ||
    qLower.includes('minimum deviation') ||
    (qLower.includes('angle of deviation') && qLower.includes('prism'))
  ) {
    return {
      title: 'Figures 5.5 & 5.11: Refraction in a Rectangular Glass Block & Triangular Glass Prism Deviation',
      caption: '(a) Lateral displacement through a parallel-sided glass block (i = e); (b) Angle of deviation D through triangular prism ABC',
      svgHtml: PHYSICS_F2_SVG_REFRACTION_PRISM,
    };
  }

  // 8. Chapter 5: Convex & Concave Lenses (Figs 5.38, 5.39, 5.46)
  if (
    qLower.includes('figure 5.38') ||
    qLower.includes('figure 5.39') ||
    qLower.includes('figure 5.46') ||
    (qLower.includes('convex lens') && !qLower.includes('microscope') && !qLower.includes('telescope')) ||
    (qLower.includes('concave lens') && !qLower.includes('myop') && !qLower.includes('eye')) ||
    (qLower.includes('converging lens') && !qLower.includes('camera')) ||
    qLower.includes('diverging lens') ||
    qLower.includes('lens equation') ||
    qLower.includes('lens formula')
  ) {
    return {
      title: 'Figures 5.38 & 5.39: Convex (Converging) & Concave (Diverging) Lens Ray Diagrams',
      caption: '(a) Convex lens forming a real inverted image between F₂ and 2F₂; (b) Concave lens forming a virtual upright diminished image on the same side as the object',
      svgHtml: PHYSICS_F2_SVG_LENSES,
    };
  }

  // 9. Chapter 6: Compound Microscope & Astronomical Telescope (Figs 6.4 & 6.8)
  if (
    qLower.includes('figure 6.4') ||
    qLower.includes('figure 6.8') ||
    qLower.includes('compound microscope') ||
    qLower.includes('astronomical telescope') ||
    qLower.includes('observatory telescope') ||
    qLower.includes('homemade telescope') ||
    (qLower.includes('objective lens') && qLower.includes('eyepiece'))
  ) {
    return {
      title: 'Figures 6.4 & 6.8: Compound Microscope & Astronomical Telescope Optical Ray Diagrams',
      caption: '(a) Compound microscope (Objective O forms real intermediate image I₁ inside F_e; Eyepiece E forms magnified virtual image I₂); (b) Astronomical telescope in normal adjustment (L = f_o + f_e, M = f_o / f_e)',
      svgHtml: PHYSICS_F2_SVG_OPTICAL_INSTRUMENTS,
    };
  }

  // 10. Chapter 6: Human Eye Anatomy & Myopia/Hyperopia Correction (Figs 6.18, 6.21, 6.22, 6.25)
  if (
    qLower.includes('figure 6.18') ||
    qLower.includes('figure 6.21') ||
    qLower.includes('figure 6.22') ||
    qLower.includes('figure 6.23') ||
    qLower.includes('figure 6.25') ||
    qLower.includes('human eye') ||
    qLower.includes('cornea') ||
    qLower.includes('retina') ||
    qLower.includes('ciliary muscle') ||
    qLower.includes('myop') ||
    qLower.includes('near-sighted') ||
    qLower.includes('short-sighted') ||
    qLower.includes('hyperop') ||
    qLower.includes('far-sighted') ||
    qLower.includes('long-sighted') ||
    (qLower.includes('blackboard') && qLower.includes('desk')) ||
    (subLower.includes('human eye') && (qLower.includes('eye') || qLower.includes('vision') || qLower.includes('defect')))
  ) {
    return {
      title: 'Figures 6.18, 6.21 & 6.22: Anatomy of the Human Eye & Correction of Vision Defects',
      caption: '(a) Structure of the human eye (Cornea, Iris, Pupil, Crystalline Lens, Retina, Optic Nerve); (b) Uncorrected Myopia (focus in front of retina) vs. Concave Lens Correction (focus on retina)',
      svgHtml: PHYSICS_F2_SVG_HUMAN_EYE,
    };
  }

  return null;
}
