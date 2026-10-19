import React, { useState } from 'react';
import { Play, RotateCcw, Sliders } from 'lucide-react';

export type DiagramPreset = 'physics_ohm' | 'math_quadratic' | 'bio_photosynthesis' | 'chem_titration';

interface InteractiveDiagramLabProps {
  initialPreset?: DiagramPreset;
  activeClass: string;
  activeSubject: string;
  onSendToChat?: (summaryText: string) => void;
}

export const InteractiveDiagramLab: React.FC<InteractiveDiagramLabProps> = ({
  initialPreset = 'physics_ohm',
  activeClass,
  activeSubject,
  onSendToChat,
}) => {
  const [preset, setPreset] = useState<DiagramPreset>(() => {
    const s = activeSubject.toLowerCase();
    if (s.includes('math') || s.includes('hisabati')) return 'math_quadratic';
    if (s.includes('biolog') || s.includes('sayansi')) return 'bio_photosynthesis';
    if (s.includes('chemi')) return 'chem_titration';
    if (s.includes('physic')) return 'physics_ohm';
    return initialPreset;
  });

  // 1. Physics: Ohm's Law Circuit State
  const [voltage, setVoltage] = useState<number>(12);
  const [resistance, setResistance] = useState<number>(4);
  const currentI = Number((voltage / resistance).toFixed(2));
  const powerP = Number((voltage * currentI).toFixed(2));

  // 2. Math: Quadratic & Linear Graph State (y = ax^2 + bx + c)
  const [coefA, setCoefA] = useState<number>(1);
  const [coefB, setCoefB] = useState<number>(-2);
  const [coefC, setCoefC] = useState<number>(-3);
  const discriminant = Number((coefB * coefB - 4 * coefA * coefC).toFixed(2));
  const vertexX = coefA !== 0 ? Number((-coefB / (2 * coefA)).toFixed(2)) : 0;
  const vertexY =
    coefA !== 0 ? Number((coefA * vertexX * vertexX + coefB * vertexX + coefC).toFixed(2)) : coefC;

  // 3. Biology: Photosynthesis & Vascular Flow State
  const [lightIntensity, setLightIntensity] = useState<number>(75);
  const [co2Level, setCo2Level] = useState<number>(65);
  const photosynthesisRate = Math.round(Math.min(lightIntensity, co2Level) * 0.92 + Math.max(lightIntensity, co2Level) * 0.08);

  // 4. Chemistry: Volumetric Titration State
  const [naohVolume, setNaohVolume] = useState<number>(20.0);
  const equivalenceVol = 25.0;
  const currentPh = React.useMemo(() => {
    const diff = naohVolume - equivalenceVol;
    if (Math.abs(diff) < 0.25) return 7.0;
    if (diff < 0) {
      return Number(Math.max(1.2, 2.2 + Math.log10(25 / Math.max(0.3, -diff)) * 1.4).toFixed(2));
    }
    return Number(Math.min(13.2, 11.2 + Math.log10(Math.max(0.3, diff) / 5) * 0.9).toFixed(2));
  }, [naohVolume]);

  function resetCurrentPreset() {
    if (preset === 'physics_ohm') {
      setVoltage(12);
      setResistance(4);
    } else if (preset === 'math_quadratic') {
      setCoefA(1);
      setCoefB(-2);
      setCoefC(-3);
    } else if (preset === 'bio_photosynthesis') {
      setLightIntensity(75);
      setCo2Level(65);
    } else {
      setNaohVolume(20.0);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Preset Selector Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setPreset('physics_ohm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              preset === 'physics_ohm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ⚡ Physics: Ohm&apos;s Law Circuit
          </button>
          <button
            onClick={() => setPreset('math_quadratic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              preset === 'math_quadratic'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📐 Math: Function Graph &amp; Table
          </button>
          <button
            onClick={() => setPreset('bio_photosynthesis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              preset === 'bio_photosynthesis'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🧬 Biology: Xylem, Phloem &amp; Photosynthesis
          </button>
          <button
            onClick={() => setPreset('chem_titration')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              preset === 'chem_titration'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🧪 Chemistry: Titration &amp; Burette Table
          </button>
        </div>

        <button
          onClick={resetCurrentPreset}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. PHYSICS: OHM'S LAW CIRCUIT DIAGRAM + LIVE TABLE */}
      {preset === 'physics_ohm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Stage: Interactive Circuit SVG (7 cols) */}
          <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Interactive DC Circuit Diagram — Ohm&apos;s Law (V = I × R)
                </h4>
                <p className="text-xs text-slate-500">
                  Adjust Voltage (V) and Resistance (R) sliders to observe live Ammeter &amp; Voltmeter readings
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 tabular-nums">
                ● ACTIVE: {currentI} A
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
              <svg viewBox="0 0 500 260" className="w-full h-auto max-h-60">
                {/* Main circuit loop wire */}
                <rect
                  x="70"
                  y="45"
                  width="360"
                  height="160"
                  rx="12"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                />
                {/* Animated electron current pulses */}
                <rect
                  x="70"
                  y="45"
                  width="360"
                  height="160"
                  rx="12"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="4"
                  strokeDasharray="10 24"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="68"
                    to="0"
                    dur={`${Math.max(0.35, 3.2 - currentI * 0.25)}s`}
                    repeatCount="indefinite"
                  />
                </rect>

                {/* Battery on Left */}
                <rect x="42" y="95" width="56" height="60" rx="8" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
                <line x1="54" y1="115" x2="86" y2="115" stroke="#22c55e" strokeWidth="4" />
                <line x1="62" y1="130" x2="78" y2="130" stroke="#ef4444" strokeWidth="4" />
                <text x="70" y="90" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                  E = {voltage} V
                </text>

                {/* Ammeter on Top */}
                <circle cx="250" cy="45" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                <text x="250" y="43" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                  A
                </text>
                <text x="250" y="57" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  {currentI}A
                </text>

                {/* Resistor R on Bottom */}
                <rect
                  x="190"
                  y="187"
                  width="120"
                  height="36"
                  rx="6"
                  fill="#1e293b"
                  stroke="#f59e0b"
                  strokeWidth="3"
                />
                <text x="250" y="209" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="bold">
                  R = {resistance} Ω
                </text>

                {/* Voltmeter in Parallel below Resistor */}
                <line x1="170" y1="205" x2="170" y2="245" stroke="#a855f7" strokeWidth="2.5" />
                <line x1="330" y1="205" x2="330" y2="245" stroke="#a855f7" strokeWidth="2.5" />
                <line x1="170" y1="245" x2="330" y2="245" stroke="#a855f7" strokeWidth="2.5" />
                <circle cx="250" cy="245" r="16" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" />
                <text x="250" y="249" textAnchor="middle" fill="#e9d5ff" fontSize="10" fontWeight="bold">
                  V={voltage}V
                </text>

                {/* Direction Arrow */}
                <polygon points="155,39 169,45 155,51" fill="#facc15" />
                <text x="155" y="30" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="bold">
                  Current (I) →
                </text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>
                Formula: <strong>I = V / R = {voltage} / {resistance} = {currentI} A</strong>
              </span>
              <span>
                Power Dissipated: <strong>P = V × I = {powerP} W</strong>
              </span>
            </div>
          </div>

          {/* Right Deck: Sliders + Clear Experimental Data Table (5 cols) */}
          <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Circuit Parameter Controls</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1 tabular-nums">
                  <span>Potential Difference (V):</span>
                  <span className="text-blue-700">{voltage} Volts (V)</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={24}
                  step={1}
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1 tabular-nums">
                  <span>Resistance (R):</span>
                  <span className="text-amber-700">{resistance} Ohms (Ω)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Clear Experimental Observation Table */}
            <div className="official-tie-doc !mt-0">
              <div className="font-bold text-[11px] uppercase mb-1.5 text-center">
                Table of Results: Ohm&apos;s Law Verification (R = {resistance} Ω)
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Trial</th>
                    <th>Voltage V (Volts)</th>
                    <th>Current I = V/R (Amps)</th>
                    <th>Ratio V/I (Ω)</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {[0.5, 1, 1.5, 2].map((mult, idx) => {
                    const vTest = Number((voltage * mult).toFixed(1));
                    const iTest = Number((vTest / resistance).toFixed(2));
                    return (
                      <tr key={idx} className={mult === 1 ? 'bg-blue-50 font-bold' : ''}>
                        <td>{idx + 1}</td>
                        <td>{vTest} V</td>
                        <td>{iTest} A</td>
                        <td>{resistance.toFixed(1)} Ω</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {onSendToChat && (
              <button
                onClick={() =>
                  onSendToChat(
                    `Explain the Ohm's Law experiment where V = ${voltage}V and R = ${resistance}Ω giving I = ${currentI}A, and draw the full NECTA marking scheme table.`
                  )
                }
                className="w-full py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Send Table &amp; Circuit Analysis to Chat</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. MATHEMATICS: QUADRATIC & LINEAR GRAPH PLOTTER + COORDINATE TABLE */}
      {preset === 'math_quadratic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Interactive Coordinate Graph — y = {coefA}x² {coefB >= 0 ? `+ ${coefB}` : `- ${Math.abs(coefB)}`}x{' '}
                  {coefC >= 0 ? `+ ${coefC}` : `- ${Math.abs(coefC)}`}
                </h4>
                <p className="text-xs text-slate-500">
                   Turning Point (Vertex): ({vertexX}, {vertexY}) · Discriminant Δ = {discriminant}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 tabular-nums">
                {discriminant > 0 ? '● 2 Real Roots' : discriminant === 0 ? '● 1 Repeated Root' : '▲ Complex Roots'}
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
              <svg viewBox="0 0 400 240" className="w-full h-auto max-h-60">
                {/* Grid lines */}
                {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((g) => {
                  const xPos = 200 + g * 20;
                  const yPos = 120 - g * 12;
                  return (
                    <React.Fragment key={g}>
                      <line x1={xPos} y1={0} x2={xPos} y2={240} stroke="#1e293b" strokeWidth="1" />
                      <line x1={0} y1={yPos} x2={400} y2={yPos} stroke="#1e293b" strokeWidth="1" />
                    </React.Fragment>
                  );
                })}
                {/* Axes */}
                <line x1={0} y1={120} x2={400} y2={120} stroke="#94a3b8" strokeWidth="2" />
                <line x1={200} y1={0} x2={200} y2={240} stroke="#94a3b8" strokeWidth="2" />
                <text x="385" y="114" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                  x
                </text>
                <text x="206" y="14" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                  y
                </text>

                {/* Quadratic Curve Polyline */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points={Array.from({ length: 81 }, (_, idx) => {
                    const xVal = -8 + idx * 0.2;
                    const yVal = coefA * xVal * xVal + coefB * xVal + coefC;
                    const sx = 200 + xVal * 20;
                    const sy = Math.max(-20, Math.min(260, 120 - yVal * 12));
                    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
                  }).join(' ')}
                />

                {/* Vertex Point Marker */}
                {coefA !== 0 && (
                  <g>
                    <circle
                      cx={200 + vertexX * 20}
                      cy={Math.max(10, Math.min(230, 120 - vertexY * 12))}
                      r="5"
                      fill="#f59e0b"
                    />
                    <text
                      x={208 + vertexX * 20}
                      y={Math.max(15, Math.min(225, 118 - vertexY * 12))}
                      fill="#fde68a"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      V({vertexX}, {vertexY})
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Axis of Symmetry: <strong>x = {vertexX}</strong></span>
              <span>y-intercept: <strong>(0, {coefC})</strong></span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Function Coefficients (y = ax² + bx + c)</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold tabular-nums">
                  <span>Coefficient a:</span>
                  <span className="text-blue-700">a = {coefA}</span>
                </div>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={0.5}
                  value={coefA}
                  onChange={(e) => setCoefA(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold tabular-nums">
                  <span>Coefficient b:</span>
                  <span className="text-emerald-700">b = {coefB}</span>
                </div>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={1}
                  value={coefB}
                  onChange={(e) => setCoefB(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold tabular-nums">
                  <span>Constant c (y-intercept):</span>
                  <span className="text-amber-700">c = {coefC}</span>
                </div>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={1}
                  value={coefC}
                  onChange={(e) => setCoefC(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Table of Values for Plotting */}
            <div className="official-tie-doc !mt-0">
              <div className="font-bold text-[11px] uppercase mb-1.5 text-center">
                Table of Values for y = {coefA}x² + ({coefB})x + ({coefC})
              </div>
              <table>
                <thead>
                  <tr>
                    <th>x</th>
                    {[-3, -2, -1, 0, 1, 2, 3].map((xVal) => (
                      <th key={xVal} style={{ textAlign: 'center' }}>
                        {xVal}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  <tr>
                    <td><strong>y</strong></td>
                    {[-3, -2, -1, 0, 1, 2, 3].map((xVal) => {
                      const yVal = Number((coefA * xVal * xVal + coefB * xVal + coefC).toFixed(1));
                      return (
                        <td key={xVal} style={{ textAlign: 'center' }}>
                          {yVal}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {onSendToChat && (
              <button
                onClick={() =>
                  onSendToChat(
                    `Solve and analyze the quadratic function y = ${coefA}x^2 + (${coefB})x + (${coefC}), showing its table of values, vertex, and roots step-by-step.`
                  )
                }
                className="w-full py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Send Graph &amp; Table Solution to Chat</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. BIOLOGY: PHOTOSYNTHESIS & VASCULAR BUNDLE (XYLEM & PHLOEM) DIAGRAM */}
      {preset === 'bio_photosynthesis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Interactive Leaf Vascular Transport (Xylem &amp; Phloem) &amp; Photosynthesis
                </h4>
                <p className="text-xs text-slate-500">
                  Cerulean Blue = Xylem (Water/Minerals Up) · Golden Marigold = Phloem (Glucose Translocation)
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 tabular-nums">
                ● Rate: {photosynthesisRate}%
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
              <svg viewBox="0 0 500 240" className="w-full h-auto max-h-60">
                {/* Sunlight rays */}
                <circle cx="65" cy="45" r="24" fill="#facc15" opacity={0.4 + lightIntensity / 180} />
                <text x="65" y="84" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                  Sunlight ({lightIntensity}%)
                </text>

                {/* Xylem Vessel (Cerulean Blue #0EA5E9) */}
                <path d="M 140 220 L 140 60 L 260 60" fill="none" stroke="#0ea5e9" strokeWidth="14" strokeLinecap="round" />
                <path
                  d="M 140 220 L 140 60 L 260 60"
                  fill="none"
                  stroke="#e0f2fe"
                  strokeWidth="6"
                  strokeDasharray="8 18"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="52"
                    to="0"
                    dur={`${Math.max(0.4, 2.5 - photosynthesisRate * 0.018)}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <text x="140" y="235" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  XYLEM (H₂O Up)
                </text>

                {/* Leaf Chloroplast Factory */}
                <rect
                  x="250"
                  y="35"
                  width="180"
                  height="110"
                  rx="20"
                  fill="#065f46"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                <text x="340" y="65" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                  CHLOROPLAST
                </text>
                <text x="340" y="85" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">
                  6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
                </text>
                <text x="340" y="108" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">
                  ATP &amp; Glucose Synthesis: {photosynthesisRate}%
                </text>

                {/* Phloem Vessel (Golden Marigold #EAB308) */}
                <path d="M 340 145 L 340 215 L 220 215" fill="none" stroke="#eab308" strokeWidth="14" strokeLinecap="round" />
                <path
                  d="M 340 145 L 340 215 L 220 215"
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="6"
                  strokeDasharray="8 18"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="52"
                    to="0"
                    dur={`${Math.max(0.4, 2.5 - photosynthesisRate * 0.018)}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <text x="340" y="235" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="bold">
                  PHLOEM (Sugars Down)
                </text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Xylem: <strong>Unidirectional (Water &amp; Mineral Salts)</strong></span>
              <span>Phloem: <strong>Bidirectional Translocation (Sucrose)</strong></span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Environmental Limiting Factors</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold tabular-nums">
                  <span>Sunlight Intensity:</span>
                  <span className="text-amber-700">{lightIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold tabular-nums">
                  <span>CO₂ Concentration:</span>
                  <span className="text-emerald-700">{co2Level}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={co2Level}
                  onChange={(e) => setCo2Level(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Comparison Table: Xylem vs Phloem */}
            <div className="official-tie-doc !mt-0">
              <div className="font-bold text-[11px] uppercase mb-1.5 text-center">
                TIE Comparison Table: Xylem vs Phloem Vessels
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Xylem Tissue</th>
                    <th>Phloem Tissue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Substance</strong></td>
                    <td>Water &amp; dissolved minerals</td>
                    <td>Manufactured organic food (sucrose)</td>
                  </tr>
                  <tr>
                    <td><strong>Direction</strong></td>
                    <td>Upward only (roots → leaves)</td>
                    <td>Upward &amp; downward (translocation)</td>
                  </tr>
                  <tr>
                    <td><strong>Cells</strong></td>
                    <td>Dead lignified vessels/tracheids</td>
                    <td>Living sieve tubes &amp; companion cells</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {onSendToChat && (
              <button
                onClick={() =>
                  onSendToChat(
                    `Draw a complete comparison table between Xylem and Phloem and explain the Light and Dark stages of Photosynthesis for ${activeClass} Biology.`
                  )
                }
                className="w-full py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Send Biology Table &amp; Notes to Chat</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. CHEMISTRY: VOLUMETRIC TITRATION CURVE & BURETTE TABLE */}
      {preset === 'chem_titration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Interactive Acid-Base Titration (HCl + NaOH → NaCl + H₂O)
                </h4>
                <p className="text-xs text-slate-500">
                  Equivalence Point at 25.00 cm³ · Indicator: Phenolphthalein (Colorless in Acid → Pink in Base)
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border tabular-nums ${
                  currentPh >= 8.2
                    ? 'bg-pink-100 text-pink-900 border-pink-300'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                pH = {currentPh} ({currentPh >= 8.2 ? '● Pink Endpoint' : '● Colorless'})
              </span>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
              <svg viewBox="0 0 460 230" className="w-full h-auto max-h-60">
                {/* Left: Conical Flask & Burette */}
                <rect x="65" y="15" width="14" height="85" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                <rect
                  x="67"
                  y={15 + Math.min(75, naohVolume * 1.8)}
                  width="10"
                  height={Math.max(5, 85 - naohVolume * 1.8)}
                  fill="#38bdf8"
                />
                {/* Conical Flask */}
                <polygon
                  points="55,125 89,125 110,195 34,195"
                  fill={currentPh >= 8.2 ? '#f472b6' : '#e2e8f0'}
                  fillOpacity={currentPh >= 8.2 ? 0.65 : 0.25}
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                />
                <text x="72" y="215" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                  Flask pH: {currentPh}
                </text>

                {/* Right: pH Titration Curve */}
                <line x1="170" y1="195" x2="430" y2="195" stroke="#94a3b8" strokeWidth="2" />
                <line x1="170" y1="20" x2="170" y2="195" stroke="#94a3b8" strokeWidth="2" />
                <text x="300" y="218" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                  Volume of NaOH Added (cm³)
                </text>
                <text x="155" y="30" textAnchor="end" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                  pH 14
                </text>

                {/* S-shaped Titration Curve */}
                <path
                  d="M 170 180 Q 270 175 295 160 L 300 55 Q 315 35 420 32"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                {/* Current Titration Marker on Curve */}
                <circle
                  cx={170 + (naohVolume / 50) * 250}
                  cy={195 - (currentPh / 14) * 170}
                  r="6"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 tabular-nums">
              <span>Volume of NaOH Added: <strong>{naohVolume.toFixed(2)} cm³</strong></span>
              <span>Mole Ratio nA : nB = <strong>1 : 1</strong></span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
                <Sliders className="w-4 h-4 text-rose-600" />
                <span>Burette Titrant Control (NaOH Volume)</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold tabular-nums">
                  <span>Burette Reading (cm³):</span>
                  <span className="text-rose-700">{naohVolume.toFixed(2)} cm³</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  step={0.5}
                  value={naohVolume}
                  onChange={(e) => setNaohVolume(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Standard NECTA Titration Burette Table */}
            <div className="official-tie-doc !mt-0">
              <div className="font-bold text-[11px] uppercase mb-1.5 text-center">
                NECTA Volumetric Analysis Table of Results (Pipette = 25.0 cm³)
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Burette Reading (cm³)</th>
                    <th>Pilot</th>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  <tr>
                    <td><strong>Final Reading (cm³)</strong></td>
                    <td>25.60</td>
                    <td>25.00</td>
                    <td>49.90</td>
                    <td>25.10</td>
                  </tr>
                  <tr>
                    <td><strong>Initial Reading (cm³)</strong></td>
                    <td>0.00</td>
                    <td>0.00</td>
                    <td>25.00</td>
                    <td>0.00</td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold">
                    <td><strong>Volume Used (cm³)</strong></td>
                    <td>25.60</td>
                    <td>25.00</td>
                    <td>24.90</td>
                    <td>25.10</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[10px] font-bold mt-1">
                Average Titre Volume V = (25.00 + 24.90 + 25.10) / 3 = 25.00 cm³
              </div>
            </div>

            {onSendToChat && (
              <button
                onClick={() =>
                  onSendToChat(
                    `Draw a complete NECTA Chemistry Titration table of results and show how to calculate the Molarity and concentration in g/dm³ using M_A V_A / M_B V_B = n_A / n_B.`
                  )
                }
                className="w-full py-2 px-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Send Titration Table &amp; Calculations to Chat</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
