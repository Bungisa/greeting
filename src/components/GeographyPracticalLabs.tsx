import React, { useMemo, useState } from 'react';
import {
  INITIAL_TANZANIA_CROP_STATS,
  POPULATION_PYRAMID_PRESETS,
  type CropStatRow,
} from './geographySimulationsData';

interface LabProps {
  darkMode?: boolean;
}

// ============================================================================
// 5. EXTERNAL EARTH FORCES: RIVER PROFILE, OX-BOW LAKES & COASTAL LANDFORMS
// ============================================================================
export const RiversCoastsLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const [stage, setStage] = useState<'upper' | 'middle' | 'lower' | 'coastal'>('lower');
  const [meanderProgression, setMeanderProgression] = useState<number>(75); // 0..100 for ox-bow cut-off

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'upper', label: '1. Youthful / Upper Stage (Waterfall & V-Valley)' },
            { id: 'middle', label: '2. Mature / Middle Stage (Meander Cliff & Slip-Off)' },
            { id: 'lower', label: '3. Old / Lower Stage (Ox-Bow Lake & Delta)' },
            { id: 'coastal', label: '4. Coastal Landforms & Coral Reefs' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStage(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
              stage === tab.id
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div
          className={`lg:col-span-8 rounded-2xl border p-5 space-y-4 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {stage === 'upper' && (
            <>
              <h3 className="text-sm sm:text-base font-black">
                Upper / Youthful River Course: Steep Gradient, Vertical Erosion, Waterfall &amp; Plunge Pool
              </h3>
              <svg viewBox="0 0 600 260" className="w-full rounded-xl bg-sky-950/30 border border-slate-300 dark:border-slate-800">
                {/* Soft rock base */}
                <rect x="0" y="125" width="320" height="135" fill="#b45309" />
                <text x="145" y="195" textAnchor="middle" fill="#fef3c7" fontSize="11" fontWeight="bold">
                  LESS RESISTANT SOFT ROCK (Undercut by Hydraulic Action &amp; Abrasion)
                </text>
                {/* Hard cap rock overhanging */}
                <polygon points="0,75 345,75 335,125 0,125" fill="#57534e" stroke="#292524" strokeWidth="2" />
                <text x="165" y="103" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                  HARD RESISTANT CAP ROCK (Overhang)
                </text>

                {/* River & Waterfall drop into plunge pool */}
                <path
                  d="M 0 62 L 340 62 Q 365 65 368 195 L 600 195 L 600 235 L 305 235 Q 290 205 320 180 Z"
                  fill="#0ea5e9"
                />
                {/* Plunge pool swirl */}
                <ellipse cx="348" cy="215" rx="45" ry="22" fill="#0284c7" stroke="#bae6fd" strokeDasharray="4 3" />
                <text x="355" y="218" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                  PLUNGE POOL (Eddy Abrasion)
                </text>
                <text x="465" y="105" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                  ← Waterfall Retreats Upstream (Gorge)
                </text>
              </svg>
            </>
          )}

          {stage === 'middle' && (
            <>
              <h3 className="text-sm sm:text-base font-black">
                Middle / Mature River Course: Lateral Erosion, Concave River Cliff &amp; Convex Slip-Off Slope
              </h3>
              <svg viewBox="0 0 600 260" className="w-full rounded-xl bg-slate-950 border border-slate-800">
                {/* Cross-section of asymmetric meander channel */}
                <path
                  d="M 30 70 L 145 70 L 160 195 Q 260 205 460 110 L 570 110 L 570 240 L 30 240 Z"
                  fill="#854d0e"
                />
                {/* Water cross-section */}
                <path d="M 150 105 L 160 195 Q 260 205 450 110 Z" fill="#0284c7" />
                {/* Shingle / Alluvium deposition on slip-off slope */}
                <polygon points="355,152 455,110 470,122 365,162" fill="#fde047" />
                {/* Fastest current marker near outer bank */}
                <circle cx="195" cy="145" r="14" fill="#ef4444" />
                <text x="195" y="149" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                  Fast
                </text>

                <text x="95" y="55" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">
                  OUTER CONCAVE BANK
                </text>
                <text x="95" y="135" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
                  Steep River Cliff (Undercutting)
                </text>
                <text x="480" y="92" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="bold">
                  INNER CONVEX BANK (Slip-Off Slope Deposition)
                </text>
              </svg>
            </>
          )}

          {stage === 'lower' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-black">
                  Lower / Old Stage: Meander Neck Narrowing → Ox-Bow Lake Cut-Off &amp; Floodplain
                </h3>
                <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                  {meanderProgression < 40
                    ? 'Stage 1: Pronounced Meander Loop'
                    : meanderProgression < 78
                      ? 'Stage 2: Narrow Meander Neck (Swan-Neck)'
                      : 'Stage 3: Flood Cut-Off & Sealed Ox-Bow Lake'}
                </span>
              </div>

              <svg viewBox="0 0 600 260" className="w-full rounded-xl bg-emerald-950/60 border border-slate-300 dark:border-slate-800">
                {(() => {
                  const neckGap = Math.max(8, 72 - (meanderProgression / 100) * 68);
                  const isCutOff = meanderProgression >= 78;
                  return (
                    <g>
                      {/* Alluvial Floodplain label */}
                      <text x="300" y="25" textAnchor="middle" fill="#a7f3d0" fontSize="11" fontWeight="bold">
                        BROAD ALLUVIAL FLOODPLAIN WITH NATURAL LEVEES
                      </text>

                      {/* Meander loop (becomes isolated Ox-Bow Lake after cut-off) */}
                      <path
                        d={`M ${300 - neckGap} 170 C 165 30, 435 30, ${300 + neckGap} 170`}
                        fill="none"
                        stroke={isCutOff ? '#38bdf8' : '#0284c7'}
                        strokeWidth="24"
                        strokeLinecap="round"
                      />

                      {/* Silt plugs sealing off the Ox-Bow Lake when cut off */}
                      {isCutOff && (
                        <>
                          <rect x={282 - neckGap} y="152" width="32" height="16" rx="4" fill="#ca8a04" />
                          <rect x={286 + neckGap} y="152" width="32" height="16" rx="4" fill="#ca8a04" />
                          <text x="300" y="95" textAnchor="middle" fill="#e0f2fe" fontSize="12" fontWeight="bold">
                            OX-BOW LAKE (Cut-Off)
                          </text>
                          <text x="300" y="146" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                            Alluvial Silt Plugs
                          </text>
                        </>
                      )}

                      {/* Main River Channel (straightens when neck breaches) */}
                      <path
                        d={
                          isCutOff
                            ? 'M 40 185 Q 300 175 560 185'
                            : `M 40 185 Q 240 185 ${300 - neckGap} 170 M ${300 + neckGap} 170 Q 360 185 560 185`
                        }
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="24"
                        strokeLinecap="round"
                      />
                      <text x="115" y="220" textAnchor="middle" fill="#bae6fd" fontSize="10" fontWeight="bold">
                        River Flow →
                      </text>
                    </g>
                  );
                })()}
              </svg>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Drag to Advance Meander Erosion &amp; Ox-Bow Cut-Off</span>
                  <span className="font-mono">{meanderProgression}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={meanderProgression}
                  onChange={(e) => setMeanderProgression(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {stage === 'coastal' && (
            <>
              <h3 className="text-sm sm:text-base font-black">
                Coastal Wave Erosion (Cave → Arch → Stack → Stump) &amp; Coral Reefs
              </h3>
              <svg viewBox="0 0 600 250" className="w-full rounded-xl bg-slate-950 border border-slate-800">
                {/* Sea level */}
                <rect x="0" y="175" width="600" height="75" fill="#0369a1" />
                {/* Headland & Arch */}
                <path d="M 0 65 L 330 65 L 330 185 L 0 185 Z" fill="#a16207" />
                {/* Cave */}
                <path d="M 110 185 Q 130 135 150 185 Z" fill="#1e293b" />
                <text x="130" y="125" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                  1. Sea Cave
                </text>
                {/* Arch opening */}
                <path d="M 245 185 Q 275 105 305 185 Z" fill="#0f172a" />
                <text x="275" y="55" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                  2. Natural Arch
                </text>
                {/* Isolated Stack */}
                <rect x="395" y="72" width="44" height="113" fill="#a16207" />
                <text x="417" y="58" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  3. Stack (Pillar)
                </text>
                {/* Eroded Stump */}
                <rect x="495" y="148" width="46" height="37" fill="#854d0e" />
                <text x="518" y="138" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  4. Stump
                </text>
              </svg>
            </>
          )}
        </div>

        {/* Right 4 Cols: NECTA River & Coastal Summary */}
        <div
          className={`lg:col-span-4 rounded-2xl border p-4 space-y-3 text-xs ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            NECTA External Forces Guide
          </div>
          <p>
            <strong>River Erosion Processes:</strong> Hydraulic action (water force in cracks), Corrasion/Abrasion (load grinding bed), Attrition (boulders colliding into smaller pebbles), and Solution/Corrosion.
          </p>
          <p>
            <strong>Conditions for Delta Formation:</strong> Active vertical/lateral erosion upstream supplying large sediment load, shallow continental shelf at mouth, weak tidal currents, and flocculation of clay particles.
          </p>
          <p>
            <strong>Conditions for Coral Reef Growth (East African Coast):</strong> Warm tropical sea water (20°C–30°C), shallow sunlit water (&lt; 60 m), clear sediment-free saline water, and plentiful oxygenated plankton.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. GEOGRAPHICAL DATA & STATISTICAL GRAPHS LAB (FORM 3–6 / NECTA QN 5)
// ============================================================================
export const StatisticalGraphsLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const [chartType, setChartType] = useState<'comparative_bar' | 'divided_bar' | 'pie_chart' | 'pyramid'>(
    'comparative_bar'
  );
  const [rows, setRows] = useState<CropStatRow[]>(INITIAL_TANZANIA_CROP_STATS);
  const [selectedPieYearIdx, setSelectedPieYearIdx] = useState<number>(3); // 2025
  const [pyramidPreset, setPyramidPreset] = useState<'tanzania' | 'kenya' | 'japan'>('tanzania');

  const activeRow = rows[selectedPieYearIdx] || rows[0];
  const rowTotal = activeRow.coffee + activeRow.cashew + activeRow.cotton + activeRow.tea;

  const pieSlices = useMemo(() => {
    const items = [
      { label: 'Cashew Nuts', val: activeRow.cashew, color: '#f59e0b' },
      { label: 'Cotton', val: activeRow.cotton, color: '#0ea5e9' },
      { label: 'Coffee', val: activeRow.coffee, color: '#10b981' },
      { label: 'Tea', val: activeRow.tea, color: '#8b5cf6' },
    ];
    let accDeg = 0;
    return items.map((item) => {
      const pct = rowTotal > 0 ? (item.val / rowTotal) * 100 : 0;
      const deg = (pct / 100) * 360;
      const startDeg = accDeg;
      accDeg += deg;
      return { ...item, pct, deg, startDeg, endDeg: accDeg };
    });
  }, [activeRow, rowTotal]);

  const pyramidData = POPULATION_PYRAMID_PRESETS[pyramidPreset];
  const dependencyMetrics = useMemo(() => {
    const c = pyramidData.cohorts;
    const youthPct = c[0].malePct + c[0].femalePct;
    const elderlyPct = c[4].malePct + c[4].femalePct + c[5].malePct + c[5].femalePct;
    const workingPct =
      c[1].malePct + c[1].femalePct + c[2].malePct + c[2].femalePct + c[3].malePct + c[3].femalePct;
    const depRatio = workingPct > 0 ? ((youthPct + elderlyPct) / workingPct) * 100 : 0;
    return { youthPct, elderlyPct, workingPct, depRatio };
  }, [pyramidData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'comparative_bar', label: '1. Comparative (Group) Bar Graph' },
            { id: 'divided_bar', label: '2. Compound (Divided) Bar Graph' },
            { id: 'pie_chart', label: '3. Divided Circle (Pie Chart — 360°)' },
            { id: 'pyramid', label: '4. Age–Sex Population Pyramid' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setChartType(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
              chartType === t.id
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Interactive Statistical Graph Canvas/SVG */}
        <div
          className={`lg:col-span-7 rounded-2xl border p-5 space-y-4 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {chartType === 'comparative_bar' && (
            <>
              <h3 className="text-sm sm:text-base font-black">
                Comparative (Grouped) Bar Graph: Tanzania Cash Crops Export (&apos;000 Tonnes)
              </h3>
              <svg viewBox="0 0 560 265" className="w-full">
                {[0, 100, 200, 300].map((val) => {
                  const y = 225 - (val / 320) * 185;
                  return (
                    <g key={val}>
                      <line
                        x1="48"
                        y1={y}
                        x2="535"
                        y2={y}
                        stroke={darkMode ? 'rgba(148,163,184,0.16)' : '#e2e8f0'}
                      />
                      <text x="42" y={y + 3} textAnchor="end" fontSize="10" fill="#64748b">
                        {val}
                      </text>
                    </g>
                  );
                })}
                {rows.map((r, rIdx) => {
                  const groupX = 72 + rIdx * 118;
                  const bars = [
                    { v: r.cashew, c: '#f59e0b' },
                    { v: r.cotton, c: '#0ea5e9' },
                    { v: r.coffee, c: '#10b981' },
                    { v: r.tea, c: '#8b5cf6' },
                  ];
                  return (
                    <g key={r.year}>
                      {bars.map((b, bIdx) => {
                        const h = (b.v / 320) * 185;
                        return (
                          <rect
                            key={bIdx}
                            x={groupX + bIdx * 18}
                            y={225 - h}
                            width="16"
                            height={h}
                            rx="2"
                            fill={b.c}
                          />
                        );
                      })}
                      <text
                        x={groupX + 36}
                        y="244"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={darkMode ? '#e2e8f0' : '#1e293b'}
                      >
                        {r.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </>
          )}

          {chartType === 'divided_bar' && (
            <>
              <h3 className="text-sm sm:text-base font-black">
                Compound (Divided) Bar Graph: Cumulative Crop Export Totals (&apos;000 Tonnes)
              </h3>
              <svg viewBox="0 0 560 265" className="w-full">
                {[0, 200, 400, 600].map((val) => {
                  const y = 225 - (val / 650) * 185;
                  return (
                    <g key={val}>
                      <line
                        x1="48"
                        y1={y}
                        x2="535"
                        y2={y}
                        stroke={darkMode ? 'rgba(148,163,184,0.16)' : '#e2e8f0'}
                      />
                      <text x="42" y={y + 3} textAnchor="end" fontSize="10" fill="#64748b">
                        {val}
                      </text>
                    </g>
                  );
                })}
                {rows.map((r, rIdx) => {
                  const x = 85 + rIdx * 115;
                  const parts = [
                    { v: r.cashew, c: '#f59e0b' },
                    { v: r.cotton, c: '#0ea5e9' },
                    { v: r.coffee, c: '#10b981' },
                    { v: r.tea, c: '#8b5cf6' },
                  ];
                  let cumY = 225;
                  return (
                    <g key={r.year}>
                      {parts.map((p, idx) => {
                        const h = (p.v / 650) * 185;
                        cumY -= h;
                        return <rect key={idx} x={x} y={cumY} width="54" height={h} fill={p.c} />;
                      })}
                      <text
                        x={x + 27}
                        y="244"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={darkMode ? '#e2e8f0' : '#1e293b'}
                      >
                        {r.year} ({r.cashew + r.cotton + r.coffee + r.tea})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </>
          )}

          {chartType === 'pie_chart' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black">
                  Divided Circle (Pie Chart) for Year {activeRow.year} (Total = {rowTotal},000 Tonnes)
                </h3>
                <div className="flex gap-1">
                  {rows.map((r, idx) => (
                    <button
                      key={r.year}
                      type="button"
                      onClick={() => setSelectedPieYearIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedPieYearIdx === idx
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {r.year}
                    </button>
                  ))}
                </div>
              </div>
              <svg viewBox="0 0 460 250" className="w-full">
                {pieSlices.map((s) => {
                  const r = 95;
                  const cx = 145;
                  const cy = 125;
                  const startRad = ((s.startDeg - 90) * Math.PI) / 180;
                  const endRad = ((s.endDeg - 90) * Math.PI) / 180;
                  const x1 = cx + r * Math.cos(startRad);
                  const y1 = cy + r * Math.sin(startRad);
                  const x2 = cx + r * Math.cos(endRad);
                  const y2 = cy + r * Math.sin(endRad);
                  const largeArc = s.deg > 180 ? 1 : 0;
                  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  return <path key={s.label} d={d} fill={s.color} stroke="#ffffff" strokeWidth="2" />;
                })}
                {pieSlices.map((s, idx) => (
                  <g key={s.label} transform={`translate(270, ${45 + idx * 45})`}>
                    <rect x="0" y="0" width="14" height="14" rx="3" fill={s.color} />
                    <text
                      x="22"
                      y="11"
                      fontSize="11"
                      fontWeight="bold"
                      fill={darkMode ? '#f8fafc' : '#0f172a'}
                    >
                      {s.label}: {s.val}k ({s.pct.toFixed(1)}% → {s.deg.toFixed(1)}°)
                    </text>
                    <text x="22" y="25" fontSize="9.5" fill="#64748b">
                      Formula: ({s.val} ÷ {rowTotal}) × 360° = {s.deg.toFixed(1)}°
                    </text>
                  </g>
                ))}
              </svg>
            </>
          )}

          {chartType === 'pyramid' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-black">{pyramidData.name}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    {pyramidData.shapeLabel}
                  </p>
                </div>
                <select
                  value={pyramidPreset}
                  onChange={(e) => setPyramidPreset(e.target.value as 'tanzania' | 'kenya' | 'japan')}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  <option value="tanzania">Tanzania (Developing Expansive Pyramid)</option>
                  <option value="kenya">Transitional Economy Pyramid</option>
                  <option value="japan">Developed Country (Aging / Constructive)</option>
                </select>
              </div>

              <svg viewBox="0 0 540 250" className="w-full">
                <line x1="270" y1="20" x2="270" y2="215" stroke="#64748b" strokeWidth="1.5" />
                <text x="170" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0284c7">
                  ← MALE (% of Total Pop)
                </text>
                <text x="370" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#e11d48">
                  FEMALE (% of Total Pop) →
                </text>
                {[...pyramidData.cohorts].reverse().map((c, idx) => {
                  const y = 28 + idx * 30;
                  const mW = (c.malePct / 24) * 190;
                  const fW = (c.femalePct / 24) * 190;
                  return (
                    <g key={c.ageGroup}>
                      <rect x={270 - mW} y={y} width={mW} height="22" rx="3" fill="#0ea5e9" />
                      <rect x="270" y={y} width={fW} height="22" rx="3" fill="#f43f5e" />
                      <text
                        x={270 - mW - 6}
                        y={y + 15}
                        textAnchor="end"
                        fontSize="10"
                        fontWeight="bold"
                        fill={darkMode ? '#cbd5e1' : '#334155'}
                      >
                        {c.malePct}%
                      </text>
                      <text
                        x={270 + fW + 6}
                        y={y + 15}
                        textAnchor="start"
                        fontSize="10"
                        fontWeight="bold"
                        fill={darkMode ? '#cbd5e1' : '#334155'}
                      >
                        {c.femalePct}%
                      </text>
                      <text x="28" y={y + 15} fontSize="10" fontWeight="bold" fill="#64748b">
                        Age {c.ageGroup}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
                <span>Youth (0–14): {dependencyMetrics.youthPct.toFixed(1)}%</span>
                <span>Working (15–59): {dependencyMetrics.workingPct.toFixed(1)}%</span>
                <span>Elderly (60+): {dependencyMetrics.elderlyPct.toFixed(1)}%</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  Dependency Ratio = {dependencyMetrics.depRatio.toFixed(1)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right 5 Cols: Interactive Data Editor & NECTA Method Advantages/Disadvantages */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`rounded-2xl border p-4 space-y-3 ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Edit Year {activeRow.year} Export Values (&apos;000 Tonnes)
            </div>
            {(
              [
                { key: 'cashew', label: 'Cashew Nuts', color: 'accent-amber-500' },
                { key: 'cotton', label: 'Cotton', color: 'accent-sky-500' },
                { key: 'coffee', label: 'Coffee', color: 'accent-emerald-500' },
                { key: 'tea', label: 'Tea', color: 'accent-violet-500' },
              ] as const
            ).map((crop) => (
              <div key={crop.key}>
                <div className="flex justify-between text-xs font-bold">
                  <span>{crop.label}</span>
                  <span className="font-mono">{activeRow[crop.key]}k tonnes</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={310}
                  value={activeRow[crop.key]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRows((prev) =>
                      prev.map((r, i) => (i === selectedPieYearIdx ? { ...r, [crop.key]: val } : r))
                    );
                  }}
                  className={`w-full ${crop.color} cursor-pointer`}
                />
              </div>
            ))}
          </div>

          <div
            className={`rounded-2xl border p-4 space-y-2 text-xs ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              NECTA Exam Notes (Advantages &amp; Limitations)
            </div>
            <p>
              • <strong>Comparative Bar Graph:</strong> Easy to compare individual items side-by-side across years, but does not show cumulative totals directly.
            </p>
            <p>
              • <strong>Compound (Divided) Bar Graph:</strong> Shows both total production and component breakdown in one bar, though reading intermediate segment values requires subtraction.
            </p>
            <p>
              • <strong>Divided Circle (Pie Chart):</strong> Visually clear proportion of each component (θ = (x ÷ ∑x) × 360°), but loses accuracy if there are more than 6–7 tiny sectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. ELEMENTARY SURVEYING: CHAIN, PRISMATIC COMPASS & LEVELLING LAB (FORM 3–4)
// ============================================================================
export const SurveyingSimulationLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const [surveyTab, setSurveyTab] = useState<'levelling' | 'chain' | 'compass'>('levelling');

  // Levelling staff readings (meters) at 4 stations from single instrument setup
  const [benchmarkRL] = useState<number>(100.0);
  const [bsA, setBsA] = useState<number>(1.45); // Back Sight at Benchmark A
  const [isB, setIsB] = useState<number>(2.15); // Intermediate Sight at B
  const [isC, setIsC] = useState<number>(1.25); // Intermediate Sight at C
  const [fsD, setFsD] = useState<number>(0.85); // Fore Sight at D

  // Chain survey right-angle obstacle parameters
  const [obstacleWidthM, setObstacleWidthM] = useState<number>(24);
  const [offsetDistM, setOffsetDistM] = useState<number>(14);

  // Prismatic Compass station error simulation
  const [localAttractionAtB, setLocalAttractionAtB] = useState<number>(0); // 0° = no attraction

  const levellingTable = useMemo(() => {
    const hpc = benchmarkRL + bsA;
    const readings = [
      { stn: 'A (BM)', bs: bsA, is: null as number | null, fs: null as number | null },
      { stn: 'B', bs: null, is: isB, fs: null },
      { stn: 'C', bs: null, is: isC, fs: null },
      { stn: 'D', bs: null, is: null, fs: fsD },
    ];

    let prevStaff = bsA;
    let prevRL = benchmarkRL;
    let sumRise = 0;
    let sumFall = 0;

    const computed = readings.map((r, idx) => {
      if (idx === 0) {
        return { ...r, rise: 0, fall: 0, hpc, rl: benchmarkRL, remark: 'Bench Mark (100.00m)' };
      }
      const currStaff = (r.is ?? r.fs) || 0;
      const diff = prevStaff - currStaff; // Note: smaller staff reading = higher ground (Rise!)
      const rise = diff > 0 ? diff : 0;
      const fall = diff < 0 ? Math.abs(diff) : 0;
      sumRise += rise;
      sumFall += fall;
      const rl = prevRL + rise - fall;
      prevStaff = currStaff;
      prevRL = rl;
      return {
        ...r,
        rise,
        fall,
        hpc: null,
        rl,
        remark: idx === 3 ? 'Final Station' : 'Intermediate Point',
      };
    });

    const sumBS = bsA;
    const sumFS = fsD;
    const bsMinusFs = sumBS - sumFS;
    const riseMinusFall = sumRise - sumFall;
    const lastMinusFirstRL = computed[computed.length - 1].rl - benchmarkRL;

    return {
      hpc,
      computed,
      sumBS,
      sumFS,
      sumRise,
      sumFall,
      bsMinusFs,
      riseMinusFall,
      lastMinusFirstRL,
    };
  }, [benchmarkRL, bsA, isB, isC, fsD]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSurveyTab('levelling')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
            surveyTab === 'levelling'
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          1. Leveling (Rise &amp; Fall + Height of Collimation)
        </button>
        <button
          type="button"
          onClick={() => setSurveyTab('chain')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
            surveyTab === 'chain'
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          2. Chain &amp; Tape Survey (Offsets &amp; Obstacles)
        </button>
        <button
          type="button"
          onClick={() => setSurveyTab('compass')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
            surveyTab === 'compass'
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          3. Prismatic Compass Traverse &amp; Local Attraction
        </button>
      </div>

      {surveyTab === 'levelling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 Cols: Interactive Levelling Line-of-Collimation Diagram & Booking Table */}
          <div
            className={`lg:col-span-7 rounded-2xl border p-5 space-y-4 ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <h3 className="text-sm sm:text-base font-black">
              Dumpy Level Telescope Sighting &amp; Sopwith Staff Readings (HPC = {levellingTable.hpc.toFixed(2)} m)
            </h3>
            <svg viewBox="0 0 580 220" className="w-full rounded-xl bg-slate-950 border border-slate-800">
              {/* Horizontal Line of Collimation */}
              <line
                x1="35"
                y1="55"
                x2="545"
                y2="55"
                stroke="#facc15"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text x="290" y="44" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                HORIZONTAL LINE OF COLLIMATION (HPC = {levellingTable.hpc.toFixed(2)} m)
              </text>

              {/* Ground Terrain Polygon connecting stations A, B, C, D */}
              {(() => {
                const xs = [70, 215, 365, 510];
                const staffVals = [bsA, isB, isC, fsD];
                const groundYs = staffVals.map((s) => 55 + s * 42);
                const polyPts = [
                  `35,215`,
                  ...xs.map((x, i) => `${x},${groundYs[i]}`),
                  `545,${groundYs[3]}`,
                  `545,215`,
                ].join(' ');
                return (
                  <g>
                    <polygon points={polyPts} fill="#78350f" stroke="#d97706" strokeWidth="2.5" />
                    {xs.map((x, i) => (
                      <g key={i}>
                        {/* Vertical graduated staff */}
                        <rect x={x - 4} y="50" width="8" height={groundYs[i] - 50} fill="#f8fafc" stroke="#dc2626" />
                        <circle cx={x} cy="55" r="4" fill="#ef4444" />
                        <text
                          x={x}
                          y={groundYs[i] + 16}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          Stn {['A (BM)', 'B', 'C', 'D'][i]}
                        </text>
                        <text
                          x={x}
                          y="30"
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          Staff: {staffVals[i].toFixed(2)}m
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>

            {/* Standard NECTA Booking Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono tabular-nums border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="p-2 border border-slate-300 dark:border-slate-700">Stn</th>
                    <th className="p-2 border border-slate-300 dark:border-slate-700">BS (m)</th>
                    <th className="p-2 border border-slate-300 dark:border-slate-700">IS (m)</th>
                    <th className="p-2 border border-slate-300 dark:border-slate-700">FS (m)</th>
                    <th className="p-2 border border-slate-300 dark:border-slate-700 text-emerald-600">Rise</th>
                    <th className="p-2 border border-slate-300 dark:border-slate-700 text-rose-600">Fall</th>
                    <th className="p-2 border border-slate-300 dark:border-slate-700">HPC</th>
                    <th className="p-2 border border-slate-300 dark:border-slate-700 font-black">RL (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {levellingTable.computed.map((row) => (
                    <tr key={row.stn}>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold">{row.stn}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        {row.bs !== null ? row.bs.toFixed(2) : '—'}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        {row.is !== null ? row.is.toFixed(2) : '—'}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        {row.fs !== null ? row.fs.toFixed(2) : '—'}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-emerald-600 font-bold">
                        {row.rise > 0 ? `+${row.rise.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-rose-600 font-bold">
                        {row.fall > 0 ? `-${row.fall.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        {row.hpc !== null ? row.hpc.toFixed(2) : '—'}
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-black">
                        {row.rl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 5 Cols: Staff Sliders & NECTA Arithmetic Check */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`rounded-2xl border p-4 space-y-3 ${
                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Adjust Staff Readings (Smaller Staff = Higher Ground)
              </div>
              {[
                { label: 'Station A Back Sight (BS)', val: bsA, set: setBsA },
                { label: 'Station B Intermediate Sight (IS)', val: isB, set: setIsB },
                { label: 'Station C Intermediate Sight (IS)', val: isC, set: setIsC },
                { label: 'Station D Fore Sight (FS)', val: fsD, set: setFsD },
              ].map((ctrl) => (
                <div key={ctrl.label}>
                  <div className="flex justify-between text-xs font-bold">
                    <span>{ctrl.label}</span>
                    <span className="font-mono">{ctrl.val.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={3.2}
                    step={0.05}
                    value={ctrl.val}
                    onChange={(e) => ctrl.set(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div
              className={`rounded-2xl border p-4 space-y-2 text-xs font-mono ${
                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Mandatory NECTA Arithmetic Check ✓
              </div>
              <div>
                1. ∑BS - ∑FS = {levellingTable.sumBS.toFixed(2)} - {levellingTable.sumFS.toFixed(2)} ={' '}
                <strong>{levellingTable.bsMinusFs.toFixed(2)} m</strong>
              </div>
              <div>
                2. ∑Rise - ∑Fall = {levellingTable.sumRise.toFixed(2)} - {levellingTable.sumFall.toFixed(2)} ={' '}
                <strong>{levellingTable.riseMinusFall.toFixed(2)} m</strong>
              </div>
              <div>
                3. Last RL - First RL ={' '}
                {levellingTable.computed[levellingTable.computed.length - 1].rl.toFixed(2)} - 100.00 ={' '}
                <strong>{levellingTable.lastMinusFirstRL.toFixed(2)} m</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {surveyTab === 'chain' && (
        <div
          className={`rounded-2xl border p-5 space-y-4 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <h3 className="text-sm sm:text-base font-black">
            Chain &amp; Tape Surveying: Perpendicular Offsets &amp; Overcoming a Pond/Building Obstacle
          </h3>
          <svg viewBox="0 0 600 230" className="w-full rounded-xl bg-slate-950 border border-slate-800">
            {/* Main Survey Baseline AB */}
            <line x1="40" y1="155" x2="210" y2="155" stroke="#facc15" strokeWidth="3" />
            <line x1="390" y1="155" x2="560" y2="155" stroke="#facc15" strokeWidth="3" />
            {/* Obstacle Pond between C (210) and D (390) */}
            <ellipse cx="300" cy="155" rx="75" ry="34" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x="300" y="159" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
              POND OBSTACLE (CD = {obstacleWidthM} m)
            </text>

            {/* Right-Angle Offset Rectangle C -> E -> F -> D */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              points={`210,155 210,${155 - offsetDistM * 5} 390,${155 - offsetDistM * 5} 390,155`}
            />
            <text
              x="300"
              y={145 - offsetDistM * 5}
              textAnchor="middle"
              fill="#34d399"
              fontSize="11"
              fontWeight="bold"
            >
              Measured Parallel Line EF = CD = {obstacleWidthM} m (Perpendicular Offset = {offsetDistM} m)
            </text>
          </svg>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block">Obstacle Width CD ({obstacleWidthM} m)</label>
              <input
                type="range"
                min={12}
                max={50}
                value={obstacleWidthM}
                onChange={(e) => setObstacleWidthM(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-bold block">Right-Angle Offset CE &amp; DF ({offsetDistM} m)</label>
              <input
                type="range"
                min={8}
                max={22}
                value={offsetDistM}
                onChange={(e) => setOffsetDistM(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {surveyTab === 'compass' && (
        <div
          className={`rounded-2xl border p-5 space-y-4 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-black">
              Prismatic Compass Traverse: Detecting Local Attraction (|FB - BB| = 180°)
            </h3>
            <span
              className={`text-xs font-bold ${
                localAttractionAtB === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {localAttractionAtB === 0
                ? '✓ All Stations Free from Local Attraction (|FB - BB| = 180°)'
                : `⚠ Local Attraction of ${localAttractionAtB > 0 ? `+${localAttractionAtB}°` : `${localAttractionAtB}°`} detected at Station B!`}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">
              Simulate Magnetic Iron / Power-Line Local Attraction at Station B ({localAttractionAtB}°)
            </label>
            <input
              type="range"
              min={-6}
              max={6}
              step={1}
              value={localAttractionAtB}
              onChange={(e) => setLocalAttractionAtB(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono tabular-nums border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Line</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Observed FB</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Observed BB</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">|FB - BB|</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700">Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { line: 'AB', fb: 65, bb: 245 + localAttractionAtB },
                  { line: 'BC', fb: 140 + localAttractionAtB, bb: 320 },
                  { line: 'CD', fb: 250, bb: 70 },
                  { line: 'DA', fb: 335, bb: 155 },
                ].map((r) => {
                  const diff = Math.abs(r.fb - r.bb);
                  const ok = diff === 180;
                  return (
                    <tr key={r.line}>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold">{r.line}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">{r.fb}°</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">{r.bb}°</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold">{diff}°</td>
                      <td
                        className={`p-2 border border-slate-200 dark:border-slate-800 font-bold ${
                          ok ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {ok ? '180° Exact (Stations Free)' : `Error = ${diff - 180}° (Local Attraction at B)`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 8. SOIL PROFILE (O–A–B–C–R), TEXTURE TRIANGLE & ROCK CYCLE SIMULATOR (FORM 3)
// ============================================================================
export const SoilRocksLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const [leachingIntensity, setLeachingIntensity] = useState<number>(45); // 0..100
  const [sandPct, setSandPct] = useState<number>(40);
  const [clayPct, setClayPct] = useState<number>(20);
  const [selectedRockStage, setSelectedRockStage] = useState<'igneous' | 'sedimentary' | 'metamorphic'>(
    'igneous'
  );

  const siltPct = Math.max(0, 100 - sandPct - clayPct);

  const soilClass = useMemo(() => {
    if (clayPct >= 40) return { name: 'Clay Soil', props: 'Very fine particles (<0.002 mm), high water retention, poor drainage, sticky when wet.' };
    if (sandPct >= 70) return { name: 'Sandy Soil', props: 'Coarse particles (0.05–2.0 mm), large air spaces, rapid drainage, low nutrient retention.' };
    if (siltPct >= 55) return { name: 'Silty Soil', props: 'Medium-fine particles (0.002–0.05 mm), smooth texture, retains moisture well.' };
    return { name: 'Loam Soil (Ideal Agricultural Soil)', props: 'Balanced mixture of sand, silt, and clay with rich humus, good aeration, and optimal water retention.' };
  }, [sandPct, clayPct, siltPct]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left 6 Cols: Interactive Soil Profile Horizons (O, A, B, C, R) & Texture Classifier */}
      <div
        className={`lg:col-span-6 rounded-2xl border p-5 space-y-4 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <h3 className="text-sm sm:text-base font-black">
          1. Vertical Soil Profile (Horizons O, A, B, C, R) &amp; Leaching
        </h3>

        <svg viewBox="0 0 500 250" className="w-full rounded-xl border border-slate-300 dark:border-slate-800">
          {/* Horizon O */}
          <rect x="0" y="0" width="500" height="28" fill="#14532d" />
          <text x="16" y="18" fill="#dcfce7" fontSize="11" fontWeight="bold">
            HORIZON O — Organic Litter &amp; Humus (Decomposing leaves)
          </text>
          {/* Horizon A (Eluviation) */}
          <rect
            x="0"
            y="28"
            width="500"
            height="54"
            fill={leachingIntensity > 65 ? '#57534e' : '#422006'}
          />
          <text x="16" y="54" fill="#fef3c7" fontSize="11" fontWeight="bold">
            HORIZON A — Topsoil (Zone of Eluviation / Leaching: {leachingIntensity}%)
          </text>
          {/* Horizon B (Illuviation) */}
          <rect
            x="0"
            y="82"
            width="500"
            height="62"
            fill={leachingIntensity > 65 ? '#9a3412' : '#b45309'}
          />
          <text x="16" y="114" fill="#fff" fontSize="11" fontWeight="bold">
            HORIZON B — Subsoil (Zone of Illuviation / Iron-Clay Accumulation)
          </text>
          {/* Horizon C */}
          <rect x="0" y="144" width="500" height="54" fill="#78716c" />
          <text x="16" y="174" fill="#f8fafc" fontSize="11" fontWeight="bold">
            HORIZON C — Weathered Parent Material (Regolith / Saprolite)
          </text>
          {/* Horizon R */}
          <rect x="0" y="198" width="500" height="52" fill="#334155" />
          <text x="16" y="228" fill="#e2e8f0" fontSize="11" fontWeight="bold">
            HORIZON R — Unweathered Parent Bedrock
          </text>
        </svg>

        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>Rainfall Percolation &amp; Leaching Intensity (Eluviation A → Illuviation B)</span>
            <span className="font-mono">{leachingIntensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={leachingIntensity}
            onChange={(e) => setLeachingIntensity(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        {/* Soil Texture Composition Mixer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>Soil Texture: Sand {sandPct}% · Silt {siltPct}% · Clay {clayPct}%</span>
            <span className="text-emerald-600 dark:text-emerald-400">{soilClass.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Sand % ({sandPct}%)</label>
              <input
                type="range"
                min={10}
                max={85}
                value={sandPct}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setSandPct(s);
                  if (s + clayPct > 95) setClayPct(Math.max(5, 95 - s));
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Clay % ({clayPct}%)</label>
              <input
                type="range"
                min={5}
                max={75}
                value={clayPct}
                onChange={(e) => {
                  const c = Number(e.target.value);
                  setClayPct(c);
                  if (sandPct + c > 95) setSandPct(Math.max(10, 95 - c));
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">{soilClass.props}</p>
        </div>
      </div>

      {/* Right 6 Cols: Interactive Rock Cycle Simulator */}
      <div
        className={`lg:col-span-6 rounded-2xl border p-5 space-y-4 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <h3 className="text-sm sm:text-base font-black">
          2. Interactive Rock Cycle (Igneous ↔ Sedimentary ↔ Metamorphic)
        </h3>

        <div className="flex gap-2">
          {(
            [
              { id: 'igneous', label: 'Igneous Rocks' },
              { id: 'sedimentary', label: 'Sedimentary Rocks' },
              { id: 'metamorphic', label: 'Metamorphic Rocks' },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRockStage(r.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                selectedRockStage === r.id
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 480 210" className="w-full rounded-xl bg-slate-950 border border-slate-800">
          {/* Connecting Arrows */}
          <line x1="125" y1="65" x2="355" y2="65" stroke="#38bdf8" strokeWidth="2.5" />
          <text x="240" y="53" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
            Weathering, Erosion, Compaction &amp; Cementation →
          </text>

          <line x1="365" y1="75" x2="255" y2="170" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="365" y="138" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
            Heat &amp; Pressure ↙
          </text>

          <line x1="225" y1="170" x2="115" y2="75" stroke="#ef4444" strokeWidth="2.5" />
          <text x="115" y="138" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
            ↖ Melting &amp; Cooling (Magma)
          </text>

          {/* 3 Nodes */}
          <g onClick={() => setSelectedRockStage('igneous')} className="cursor-pointer">
            <rect
              x="35"
              y="42"
              width="125"
              height="44"
              rx="10"
              fill={selectedRockStage === 'igneous' ? '#dc2626' : '#334155'}
              stroke="#fff"
            />
            <text x="97" y="68" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
              IGNEOUS ROCK
            </text>
          </g>

          <g onClick={() => setSelectedRockStage('sedimentary')} className="cursor-pointer">
            <rect
              x="320"
              y="42"
              width="135"
              height="44"
              rx="10"
              fill={selectedRockStage === 'sedimentary' ? '#0284c7' : '#334155'}
              stroke="#fff"
            />
            <text x="387" y="68" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
              SEDIMENTARY
            </text>
          </g>

          <g onClick={() => setSelectedRockStage('metamorphic')} className="cursor-pointer">
            <rect
              x="170"
              y="150"
              width="140"
              height="44"
              rx="10"
              fill={selectedRockStage === 'metamorphic' ? '#d97706' : '#334155'}
              stroke="#fff"
            />
            <text x="240" y="176" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
              METAMORPHIC
            </text>
          </g>
        </svg>

        {selectedRockStage === 'igneous' && (
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs space-y-1.5">
            <div className="font-black text-rose-800 dark:text-rose-300">
              Igneous Rocks (Crystallized from Molten Magma or Lava)
            </div>
            <p>
              • <strong>Plutonic / Intrusive (Slow cooling deep underground → Large crystals):</strong> Granite (Dodoma, Mwanza inselbergs), Gabbro, Diorite.
            </p>
            <p>
              • <strong>Volcanic / Extrusive (Rapid cooling on surface → Fine/glassy crystals):</strong> Basalt, Obsidian, Pumice, Rhyolite (Rungwe &amp; Kilimanjaro).
            </p>
            <p>
              • <strong>Characteristics:</strong> Crystalline, non-stratified (no layers), contain no fossils.
            </p>
          </div>
        )}

        {selectedRockStage === 'sedimentary' && (
          <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 text-xs space-y-1.5">
            <div className="font-black text-sky-800 dark:text-sky-300">
              Sedimentary Rocks (Deposited in Strata &amp; Lithified)
            </div>
            <p>
              • <strong>Mechanically Formed (Clastic):</strong> Sandstone, Shale, Conglomerate, Mudstone.
            </p>
            <p>
              • <strong>Organically Formed:</strong> Coral Limestone &amp; Chalk (Dar es Salaam, Tanga, Zanzibar coast), Coal (Ngaka &amp; Kiwira).
            </p>
            <p>
              • <strong>Chemically Formed (Evaporites):</strong> Rock salt (Halite), Gypsum (Kilwa), Dolomite.
            </p>
            <p>
              • <strong>Characteristics:</strong> Stratified (bedding planes), non-crystalline, often contain fossils.
            </p>
          </div>
        )}

        {selectedRockStage === 'metamorphic' && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs space-y-1.5">
            <div className="font-black text-amber-800 dark:text-amber-300">
              Metamorphic Rocks (Transformed by Intense Heat &amp; Pressure)
            </div>
            <p>
              • <strong>Key NECTA Transformations:</strong>
              <br />– Limestone → <strong>Marble</strong>
              <br />– Clay / Shale → <strong>Slate</strong> → <strong>Schist</strong>
              <br />– Sandstone → <strong>Quartzite</strong>
              <br />– Granite → <strong>Gneiss</strong> (common in Usambara &amp; Uluguru basement complex)
              <br />– Coal → <strong>Graphite / Diamond</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
