import React from 'react';
import {
  type AngleUnit,
  type CalcCurveKind,
  type CalculusAnalysis,
  type ConicAnalysis,
  type ConicKind,
  CUBIC_PRESETS,
  type CubicAnalysis,
  type ExpLogAnalysis,
  type ExpLogKind,
  fmtNum,
  formatPoly2,
  type GraphMode,
  type ModulusAnalysis,
  type ModulusKind,
  type SimPairKind,
  type SimultaneousAnalysis,
  type TrigAnalysis,
  type TrigFuncType,
} from './graphSketcherMath';

export interface NewModesControlsProps {
  mode: GraphMode;
  darkMode: boolean;
  panelCard: string;
  inputClass: string;

  // Cubic
  cubA: number; setCubA: (v: number) => void;
  cubB: number; setCubB: (v: number) => void;
  cubC: number; setCubC: (v: number) => void;
  cubD: number; setCubD: (v: number) => void;
  cubicInfo: CubicAnalysis;

  // Trig
  trigFunc: TrigFuncType; setTrigFunc: (v: TrigFuncType) => void;
  trigUnit: AngleUnit; onChangeTrigUnit: (v: AngleUnit) => void;
  trigA: number; setTrigA: (v: number) => void;
  trigB: number; setTrigB: (v: number) => void;
  trigC: number; setTrigC: (v: number) => void;
  trigD: number; setTrigD: (v: number) => void;
  trigInfo: TrigAnalysis;

  // Exp/Log
  expKind: ExpLogKind; setExpKind: (v: ExpLogKind) => void;
  expA: number; setExpA: (v: number) => void;
  expBase: number; setExpBase: (v: number) => void;
  expH: number; setExpH: (v: number) => void;
  expK: number; setExpK: (v: number) => void;
  expLogInfo: ExpLogAnalysis;

  // Conics
  conicKind: ConicKind; setConicKind: (v: ConicKind) => void;
  conicH: number; setConicH: (v: number) => void;
  conicK: number; setConicK: (v: number) => void;
  conicA: number; setConicA: (v: number) => void;
  conicB: number; setConicB: (v: number) => void;
  circleTanDeg: number; setCircleTanDeg: (v: number) => void;
  showCircleTangent: boolean; setShowCircleTangent: (v: boolean) => void;
  hyperbolaAxis: 'horizontal' | 'vertical'; setHyperbolaAxis: (v: 'horizontal' | 'vertical') => void;
  conicInfo: ConicAnalysis;

  // Modulus & Piecewise
  modKind: ModulusKind; setModKind: (v: ModulusKind) => void;
  modA: number; setModA: (v: number) => void;
  modH: number; setModH: (v: number) => void;
  modK: number; setModK: (v: number) => void;
  stepFreq: number; setStepFreq: (v: number) => void;
  pwSplit: number; setPwSplit: (v: number) => void;
  pwLeftM: number; setPwLeftM: (v: number) => void;
  pwLeftC: number; setPwLeftC: (v: number) => void;
  pwRightM: number; setPwRightM: (v: number) => void;
  pwRightC: number; setPwRightC: (v: number) => void;
  modulusInfo: ModulusAnalysis;

  // Simultaneous
  simKind: SimPairKind; setSimKind: (v: SimPairKind) => void;
  simQa: number; setSimQa: (v: number) => void;
  simQb: number; setSimQb: (v: number) => void;
  simQc: number; setSimQc: (v: number) => void;
  simLm: number; setSimLm: (v: number) => void;
  simLd: number; setSimLd: (v: number) => void;
  simCh: number; setSimCh: (v: number) => void;
  simCk: number; setSimCk: (v: number) => void;
  simCr: number; setSimCr: (v: number) => void;
  simQ2a: number; setSimQ2a: (v: number) => void;
  simQ2b: number; setSimQ2b: (v: number) => void;
  simQ2c: number; setSimQ2c: (v: number) => void;
  simultaneousInfo: SimultaneousAnalysis;

  // Calculus
  calcCurve: CalcCurveKind; setCalcCurve: (v: CalcCurveKind) => void;
  calcA: number; setCalcA: (v: number) => void;
  calcB: number; setCalcB: (v: number) => void;
  calcC: number; setCalcC: (v: number) => void;
  calcX0: number; setCalcX0: (v: number) => void;
  calcIntA: number; setCalcIntA: (v: number) => void;
  calcIntB: number; setCalcIntB: (v: number) => void;
  showTangent: boolean; setShowTangent: (v: boolean) => void;
  showNormal: boolean; setShowNormal: (v: boolean) => void;
  showIntegral: boolean; setShowIntegral: (v: boolean) => void;
  calculusInfo: CalculusAnalysis;
}

const SliderRow: React.FC<{
  label: string;
  val: number;
  set: (v: number) => void;
  min: number;
  max: number;
  step: number;
  accent?: string;
  inputClass: string;
}> = ({ label, val, set, min, max, step, accent = 'accent-sky-500', inputClass }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs font-semibold">
      <span>{label}</span>
      <input
        type="number"
        step={step}
        value={val}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          set(Number.isFinite(parsed) ? parsed : 0);
        }}
        className={inputClass}
      />
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={Math.max(min, Math.min(max, val))}
      onChange={(e) => set(Number(e.target.value))}
      className={`w-full ${accent} cursor-pointer h-1.5`}
    />
  </div>
);

export const GraphSketcherNewBottomStrip: React.FC<{
  mode: GraphMode;
  darkMode: boolean;
  panelCard: string;
  cubicInfo: CubicAnalysis;
  trigInfo: TrigAnalysis;
  expLogInfo: ExpLogAnalysis;
  modulusInfo: ModulusAnalysis;
  simultaneousInfo: SimultaneousAnalysis;
  calculusInfo: CalculusAnalysis;
  conicInfo: ConicAnalysis;
}> = ({
  mode,
  darkMode,
  panelCard,
  cubicInfo,
  trigInfo,
  expLogInfo,
  modulusInfo,
  simultaneousInfo,
  calculusInfo,
  conicInfo,
}) => {
  if (mode === 'cubic') {
    return (
      <div className={`rounded-2xl border p-3.5 ${panelCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider">Table of Values (Cubic Curve)</span>
          <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {cubicInfo.endBehaviour}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse tabular-nums">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-1.5 px-2 font-black text-left">x</th>
                {cubicInfo.table.map((pt) => (
                  <th key={pt.x} className="py-1.5 px-2 font-bold">{pt.x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 px-2 font-black text-left text-violet-500">y</td>
                {cubicInfo.table.map((pt) => (
                  <td key={pt.x} className="py-1.5 px-2 font-extrabold">{fmtNum(pt.y)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === 'trig') {
    return (
      <div className={`rounded-2xl border p-3.5 ${panelCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider">Key Angle Values</span>
          <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Period: {trigInfo.periodLabel} · Range: {trigInfo.rangeText}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse tabular-nums">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-1.5 px-2 font-black text-left">x</th>
                {trigInfo.table.map((pt) => (
                  <th key={pt.xLabel} className="py-1.5 px-2 font-bold">{pt.xLabel}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 px-2 font-black text-left text-sky-500">y</td>
                {trigInfo.table.map((pt) => (
                  <td key={pt.xLabel} className="py-1.5 px-2 font-extrabold">
                    {pt.y === null ? <span className="text-rose-500">undef</span> : fmtNum(pt.y)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === 'explog') {
    return (
      <div className={`rounded-2xl border p-3.5 ${panelCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider">Table of Values &amp; Asymptote</span>
          <span className="text-[11px] font-bold text-rose-500">{expLogInfo.asymptoteLabel}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse tabular-nums">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-1.5 px-2 font-black text-left">x</th>
                {expLogInfo.table.map((pt) => (
                  <th key={pt.x} className="py-1.5 px-2 font-bold">{fmtNum(pt.x)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 px-2 font-black text-left text-emerald-500">y</td>
                {expLogInfo.table.map((pt) => (
                  <td key={pt.x} className="py-1.5 px-2 font-extrabold">
                    {pt.y === null ? '—' : fmtNum(pt.y)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === 'conics') {
    return (
      <div className={`rounded-2xl border p-3.5 space-y-1.5 text-xs ${panelCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-black uppercase tracking-wider">Conic Section Summary</span>
          <span className="font-mono font-bold text-sky-500">{conicInfo.equationText}</span>
        </div>
        <div className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {conicInfo.areaOrMetric}
          {conicInfo.expandedText ? ` · General form: ${conicInfo.expandedText}` : ''}
        </div>
      </div>
    );
  }

  if (mode === 'modulus') {
    return (
      <div className={`rounded-2xl border p-3.5 ${panelCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider">Table of Values</span>
          <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {modulusInfo.continuityText}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse tabular-nums">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-1.5 px-2 font-black text-left">x</th>
                {modulusInfo.table.map((pt) => (
                  <th key={pt.x} className="py-1.5 px-2 font-bold">{fmtNum(pt.x)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 px-2 font-black text-left text-sky-500">y</td>
                {modulusInfo.table.map((pt) => (
                  <td key={pt.x} className="py-1.5 px-2 font-extrabold">{fmtNum(pt.y)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mode === 'simultaneous') {
    return (
      <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-black uppercase tracking-wider">Intersection Solutions</span>
          <span className="font-bold text-emerald-500">
            {simultaneousInfo.statusText} ({simultaneousInfo.discriminantText})
          </span>
        </div>
        {simultaneousInfo.intersections.length > 0 ? (
          <div className="flex flex-wrap gap-4 font-mono font-extrabold text-emerald-500">
            {simultaneousInfo.intersections.map((pt, i) => (
              <span key={i}>
                P{i + 1} = ({fmtNum(pt.x)}, {fmtNum(pt.y)})
              </span>
            ))}
          </div>
        ) : (
          <div className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
            No real intersection points — adjust parameters until the graphs meet.
          </div>
        )}
      </div>
    );
  }

  if (mode === 'calculus') {
    return (
      <div className={`rounded-2xl border p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs ${panelCard}`}>
        <div>
          <div className="text-[11px] font-bold uppercase text-amber-500">Tangent at x₀ = {fmtNum(calculusInfo.x0)}</div>
          <div className="font-mono font-extrabold mt-0.5">{calculusInfo.tangentEq}</div>
          <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Slope f&apos;(x₀) = {fmtNum(calculusInfo.slopeTangent)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-pink-500">Normal Line</div>
          <div className="font-mono font-extrabold mt-0.5">{calculusInfo.normalEq}</div>
          <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            mₙ = {calculusInfo.slopeNormal === null ? 'Undefined (vertical)' : fmtNum(calculusInfo.slopeNormal)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-emerald-500">Definite Integral</div>
          <div className="font-mono font-extrabold mt-0.5">
            Net ∫ = {fmtNum(calculusInfo.signedIntegral, 3)}
          </div>
          <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Total Area = {fmtNum(calculusInfo.totalArea, 3)} sq units
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const GraphSketcherNewRightControls: React.FC<NewModesControlsProps> = (p) => {
  const { mode, darkMode, panelCard, inputClass } = p;

  const segBtn = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
      active
        ? 'bg-sky-500 text-white border-sky-500'
        : darkMode
        ? 'bg-[#0b1220] border-white/10 text-slate-300 hover:text-white'
        : 'bg-white border-slate-300 text-slate-700 hover:text-slate-950'
    }`;

  // ==================== 5. CUBIC ====================
  if (mode === 'cubic') {
    return (
      <>
        <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">Cubic (ax³ + bx² + cx + d)</span>
            <button
              type="button"
              onClick={() => { p.setCubA(1); p.setCubB(0); p.setCubC(-3); p.setCubD(0); }}
              className={`text-[11px] font-bold cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Reset
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {CUBIC_PRESETS.map((pr) => (
              <button
                key={pr.name}
                type="button"
                onClick={() => { p.setCubA(pr.a); p.setCubB(pr.b); p.setCubC(pr.c); p.setCubD(pr.d); }}
                className={segBtn(false)}
              >
                {pr.name}
              </button>
            ))}
          </div>
          <SliderRow label="a (x³)" val={p.cubA} set={p.setCubA} min={-3} max={3} step={0.25} accent="accent-violet-500" inputClass={inputClass} />
          <SliderRow label="b (x²)" val={p.cubB} set={p.setCubB} min={-6} max={6} step={0.5} accent="accent-violet-500" inputClass={inputClass} />
          <SliderRow label="c (x)" val={p.cubC} set={p.setCubC} min={-8} max={8} step={0.5} accent="accent-violet-500" inputClass={inputClass} />
          <SliderRow label="d (const)" val={p.cubD} set={p.setCubD} min={-8} max={8} step={0.5} accent="accent-violet-500" inputClass={inputClass} />
        </div>

        <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
          <div className="font-black uppercase tracking-wider text-violet-500">Cubic Characteristics</div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Real Roots (x-int)</span>
            <span className="font-mono font-extrabold text-emerald-500">
              {p.cubicInfo.roots.length ? p.cubicInfo.roots.map((r) => fmtNum(r)).join(', ') : 'None'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>y-Intercept</span>
            <span className="font-mono font-bold text-sky-400">(0, {fmtNum(p.cubicInfo.yIntercept)})</span>
          </div>
          {p.cubicInfo.turningPoints.length > 0 ? (
            p.cubicInfo.turningPoints.map((tp, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{tp.kind}</span>
                <span className="font-mono font-bold text-rose-500">({fmtNum(tp.x)}, {fmtNum(tp.y)})</span>
              </div>
            ))
          ) : (
            <div className="flex justify-between gap-2">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Turning Points</span>
              <span className="font-semibold">None (monotonic)</span>
            </div>
          )}
          {p.cubicInfo.inflection && (
            <div className="flex justify-between gap-2">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Point of Inflection</span>
              <span className="font-mono font-bold text-amber-500">
                ({fmtNum(p.cubicInfo.inflection.x)}, {fmtNum(p.cubicInfo.inflection.y)})
              </span>
            </div>
          )}
        </div>
      </>
    );
  }

  // ==================== 6. TRIGONOMETRIC ====================
  if (mode === 'trig') {
    return (
      <>
        <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">Trigonometric Function</span>
            <div className="flex gap-1">
              {(['deg', 'rad'] as AngleUnit[]).map((u) => (
                <button key={u} type="button" onClick={() => p.onChangeTrigUnit(u)} className={segBtn(p.trigUnit === u)}>
                  {u === 'deg' ? 'Deg (°)' : 'Rad (π)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(['sin', 'cos', 'tan'] as TrigFuncType[]).map((fn) => (
              <button key={fn} type="button" onClick={() => p.setTrigFunc(fn)} className={segBtn(p.trigFunc === fn)}>
                y = a·{fn}(bx+c)+d
              </button>
            ))}
          </div>

          <SliderRow label="Amplitude / Stretch (a)" val={p.trigA} set={p.setTrigA} min={-4} max={4} step={0.5} inputClass={inputClass} />
          <SliderRow label="Frequency (b)" val={p.trigB} set={p.setTrigB} min={0.5} max={4} step={0.5} inputClass={inputClass} />
          <SliderRow
            label={p.trigUnit === 'deg' ? 'Phase c (degrees)' : 'Phase c (radians)'}
            val={p.trigC}
            set={p.setTrigC}
            min={p.trigUnit === 'deg' ? -180 : -3.14}
            max={p.trigUnit === 'deg' ? 180 : 3.14}
            step={p.trigUnit === 'deg' ? 15 : 0.25}
            inputClass={inputClass}
          />
          <SliderRow label="Vertical Shift / Midline (d)" val={p.trigD} set={p.setTrigD} min={-4} max={4} step={0.5} inputClass={inputClass} />
        </div>

        <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
          <div className="font-black uppercase tracking-wider text-sky-500">Wave Properties</div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Amplitude</span>
            <span className="font-bold">{p.trigInfo.amplitude === null ? 'None (unbounded)' : fmtNum(p.trigInfo.amplitude)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Period (T)</span>
            <span className="font-mono font-bold text-amber-500">{p.trigInfo.periodLabel}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Phase Shift</span>
            <span className="font-mono font-bold">{p.trigInfo.phaseLabel}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Midline</span>
            <span className="font-mono font-bold text-sky-400">y = {fmtNum(p.trigInfo.midline)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Range</span>
            <span className="font-mono font-bold text-emerald-500">{p.trigInfo.rangeText}</span>
          </div>
          {p.trigFunc === 'tan' && (
            <div className="pt-1 text-[11px] font-semibold text-rose-500">
              Dashed red vertical lines mark tan(x) asymptotes where cos(bx + c) = 0.
            </div>
          )}
        </div>
      </>
    );
  }

  // ==================== 7. EXPONENTIAL & LOGARITHMIC ====================
  if (mode === 'explog') {
    return (
      <>
        <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">Exponential &amp; Logarithmic</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'exp', label: 'Exponential' },
                { id: 'log', label: 'Logarithm' },
                { id: 'inverse', label: 'Inverse (y=x)' },
              ] as Array<{ id: ExpLogKind; label: string }>
            ).map((opt) => (
              <button key={opt.id} type="button" onClick={() => p.setExpKind(opt.id)} className={segBtn(p.expKind === opt.id)}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {[
              { label: 'Base 2', b: 2 },
              { label: 'Base e (2.72)', b: 2.72 },
              { label: 'Base 10', b: 10 },
              { label: 'Decay (0.5)', b: 0.5 },
            ].map((pr) => (
              <button key={pr.label} type="button" onClick={() => p.setExpBase(pr.b)} className={segBtn(Math.abs(p.expBase - pr.b) < 0.02)}>
                {pr.label}
              </button>
            ))}
          </div>

          <SliderRow label="Base (b > 0, b ≠ 1)" val={p.expBase} set={p.setExpBase} min={0.2} max={5} step={0.1} accent="accent-emerald-500" inputClass={inputClass} />
          {p.expKind !== 'inverse' && (
            <>
              <SliderRow label="Vertical Scale (a)" val={p.expA} set={p.setExpA} min={-4} max={4} step={0.5} inputClass={inputClass} />
              <SliderRow label="Horizontal Shift (h)" val={p.expH} set={p.setExpH} min={-5} max={5} step={0.5} inputClass={inputClass} />
              <SliderRow label="Vertical Shift (k)" val={p.expK} set={p.setExpK} min={-5} max={5} step={0.5} inputClass={inputClass} />
            </>
          )}
        </div>

        <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
          <div className="font-black uppercase tracking-wider text-emerald-500">Growth, Decay &amp; Asymptote</div>
          <div className="font-bold">{p.expLogInfo.behaviour}</div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Asymptote</span>
            <span className="font-mono font-bold text-rose-500">{p.expLogInfo.asymptoteLabel}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Domain</span>
            <span className="font-mono font-bold">{p.expLogInfo.domainText}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Range</span>
            <span className="font-mono font-bold">{p.expLogInfo.rangeText}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>y-Intercept</span>
            <span className="font-mono font-bold text-amber-500">
              {p.expLogInfo.yIntercept !== null ? `(0, ${fmtNum(p.expLogInfo.yIntercept)})` : 'None'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>x-Intercept</span>
            <span className="font-mono font-bold text-emerald-500">
              {p.expLogInfo.xIntercept !== null ? `(${fmtNum(p.expLogInfo.xIntercept)}, 0)` : 'None'}
            </span>
          </div>
        </div>
      </>
    );
  }

  // ==================== 8. CIRCLE & CONIC SECTIONS ====================
  if (mode === 'conics') {
    return (
      <>
        <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
          <div className="text-xs font-black uppercase tracking-wider">Conic Section Type</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'circle', label: 'Circle' },
                { id: 'ellipse', label: 'Ellipse' },
                { id: 'hyperbola', label: 'Hyperbola' },
              ] as Array<{ id: ConicKind; label: string }>
            ).map((opt) => (
              <button key={opt.id} type="button" onClick={() => p.setConicKind(opt.id)} className={segBtn(p.conicKind === opt.id)}>
                {opt.label}
              </button>
            ))}
          </div>

          <SliderRow label="Center x (h)" val={p.conicH} set={p.setConicH} min={-5} max={5} step={0.5} inputClass={inputClass} />
          <SliderRow label="Center y (k)" val={p.conicK} set={p.setConicK} min={-5} max={5} step={0.5} inputClass={inputClass} />
          <SliderRow
            label={p.conicKind === 'circle' ? 'Radius (r)' : 'Horizontal Semi-Axis (a)'}
            val={p.conicA}
            set={p.setConicA}
            min={1}
            max={6}
            step={0.5}
            accent="accent-amber-500"
            inputClass={inputClass}
          />
          {p.conicKind !== 'circle' && (
            <SliderRow
              label="Vertical Semi-Axis (b)"
              val={p.conicB}
              set={p.setConicB}
              min={1}
              max={6}
              step={0.5}
              accent="accent-violet-500"
              inputClass={inputClass}
            />
          )}

          {p.conicKind === 'circle' && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.showCircleTangent}
                  onChange={(e) => p.setShowCircleTangent(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>Show Movable Tangent Line</span>
              </label>
              {p.showCircleTangent && (
                <SliderRow label="Tangent Angle θ (°)" val={p.circleTanDeg} set={p.setCircleTanDeg} min={0} max={360} step={5} accent="accent-emerald-500" inputClass={inputClass} />
              )}
            </div>
          )}

          {p.conicKind === 'hyperbola' && (
            <div className="flex gap-1.5 pt-1">
              <button type="button" onClick={() => p.setHyperbolaAxis('horizontal')} className={segBtn(p.hyperbolaAxis === 'horizontal')}>
                Opens Left / Right
              </button>
              <button type="button" onClick={() => p.setHyperbolaAxis('vertical')} className={segBtn(p.hyperbolaAxis === 'vertical')}>
                Opens Up / Down
              </button>
            </div>
          )}
        </div>

        <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
          <div className="font-black uppercase tracking-wider text-sky-500">Geometric Properties</div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Center (h, k)</span>
            <span className="font-mono font-bold text-rose-500">({fmtNum(p.conicInfo.center.x)}, {fmtNum(p.conicInfo.center.y)})</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Eccentricity (e)</span>
            <span className="font-mono font-bold">{fmtNum(p.conicInfo.eccentricity, 3)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Foci</span>
            <span className="font-mono font-bold text-emerald-500">
              {p.conicInfo.foci.map((f) => `(${fmtNum(f.x)}, ${fmtNum(f.y)})`).join(', ')}
            </span>
          </div>
          {p.conicKind === 'circle' && p.showCircleTangent && p.conicInfo.tangentEq && (
            <div className="flex justify-between gap-2">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Tangent Eq.</span>
              <span className="font-mono font-bold text-emerald-500">{p.conicInfo.tangentEq}</span>
            </div>
          )}
          {p.conicKind === 'hyperbola' && p.conicInfo.asymptotes.length > 0 && (
            <div className="pt-1 border-t border-slate-200/80 dark:border-white/[0.08] space-y-1">
              <div className="font-bold text-rose-500">Asymptotes (Dashed Red)</div>
              {p.conicInfo.asymptotes.map((as, idx) => (
                <div key={idx} className="font-mono font-bold">
                  y = {formatPoly2(0, as.m, as.b)}
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // ==================== 9. MODULUS & PIECEWISE / STEP ====================
  if (mode === 'modulus') {
    return (
      <>
        <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
          <div className="text-xs font-black uppercase tracking-wider">Function Type</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'abs', label: 'Modulus |x|' },
                { id: 'floor', label: 'Step ⌊x⌋' },
                { id: 'piecewise', label: 'Piecewise' },
              ] as Array<{ id: ModulusKind; label: string }>
            ).map((opt) => (
              <button key={opt.id} type="button" onClick={() => p.setModKind(opt.id)} className={segBtn(p.modKind === opt.id)}>
                {opt.label}
              </button>
            ))}
          </div>

          {p.modKind === 'abs' && (
            <>
              <SliderRow label="Slope / Opening (a)" val={p.modA} set={p.setModA} min={-4} max={4} step={0.5} inputClass={inputClass} />
              <SliderRow label="Vertex x (h)" val={p.modH} set={p.setModH} min={-5} max={5} step={0.5} inputClass={inputClass} />
              <SliderRow label="Vertex y (k)" val={p.modK} set={p.setModK} min={-5} max={5} step={0.5} inputClass={inputClass} />
            </>
          )}

          {p.modKind === 'floor' && (
            <>
              <SliderRow label="Step Height (a)" val={p.modA} set={p.setModA} min={-3} max={3} step={0.5} inputClass={inputClass} />
              <SliderRow label="Frequency (b in ⌊bx⌋)" val={p.stepFreq} set={p.setStepFreq} min={0.5} max={3} step={0.5} inputClass={inputClass} />
              <SliderRow label="Vertical Shift (k)" val={p.modK} set={p.setModK} min={-4} max={4} step={0.5} inputClass={inputClass} />
            </>
          )}

          {p.modKind === 'piecewise' && (
            <>
              <SliderRow label="Split Point (x₀)" val={p.pwSplit} set={p.setPwSplit} min={-4} max={4} step={0.5} accent="accent-amber-500" inputClass={inputClass} />
              <div className="pt-1.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
                <div className="text-[11px] font-black text-amber-500">Left Rule (x &lt; {fmtNum(p.pwSplit)}): y = m₁x + c₁</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center justify-between"><span>m₁</span><input type="number" step={0.5} value={p.pwLeftM} onChange={(e) => p.setPwLeftM(Number(e.target.value) || 0)} className={inputClass} /></label>
                  <label className="flex items-center justify-between"><span>c₁</span><input type="number" step={0.5} value={p.pwLeftC} onChange={(e) => p.setPwLeftC(Number(e.target.value) || 0)} className={inputClass} /></label>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
                <div className="text-[11px] font-black text-sky-500">Right Rule (x ≥ {fmtNum(p.pwSplit)}): y = m₂x + c₂</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center justify-between"><span>m₂</span><input type="number" step={0.5} value={p.pwRightM} onChange={(e) => p.setPwRightM(Number(e.target.value) || 0)} className={inputClass} /></label>
                  <label className="flex items-center justify-between"><span>c₂</span><input type="number" step={0.5} value={p.pwRightC} onChange={(e) => p.setPwRightC(Number(e.target.value) || 0)} className={inputClass} /></label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
          <div className="font-black uppercase tracking-wider text-sky-500">Key Features</div>
          <div className="font-semibold leading-snug">{p.modulusInfo.continuityText}</div>
          {p.modulusInfo.vertex && (
            <div className="flex justify-between gap-2">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Sharp Corner (Vertex)</span>
              <span className="font-mono font-bold text-rose-500">({fmtNum(p.modulusInfo.vertex.x)}, {fmtNum(p.modulusInfo.vertex.y)})</span>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>x-Intercepts</span>
            <span className="font-mono font-bold text-emerald-500">
              {p.modulusInfo.xIntercepts.length ? p.modulusInfo.xIntercepts.map((r) => fmtNum(r)).join(', ') : 'None'}
            </span>
          </div>
        </div>
      </>
    );
  }

  // ==================== 10. SIMULTANEOUS EQUATIONS ====================
  if (mode === 'simultaneous') {
    return (
      <>
        <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
          <div className="text-xs font-black uppercase tracking-wider">System Pair</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'line_quad', label: 'Line & Quad' },
                { id: 'line_circle', label: 'Line & Circle' },
                { id: 'quad_quad', label: 'Two Quads' },
              ] as Array<{ id: SimPairKind; label: string }>
            ).map((opt) => (
              <button key={opt.id} type="button" onClick={() => p.setSimKind(opt.id)} className={segBtn(p.simKind === opt.id)}>
                {opt.label}
              </button>
            ))}
          </div>

          {p.simKind !== 'line_circle' ? (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-black text-amber-500">Curve 1: y = {formatPoly2(p.simQa, p.simQb, p.simQc)}</div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">a₁</span><input type="number" step={0.5} value={p.simQa} onChange={(e) => p.setSimQa(Number(e.target.value) || 0)} className={inputClass} /></label>
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">b₁</span><input type="number" step={0.5} value={p.simQb} onChange={(e) => p.setSimQb(Number(e.target.value) || 0)} className={inputClass} /></label>
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">c₁</span><input type="number" step={0.5} value={p.simQc} onChange={(e) => p.setSimQc(Number(e.target.value) || 0)} className={inputClass} /></label>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-black text-violet-500">Circle: (x − h)² + (y − k)² = r²</div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">h</span><input type="number" step={0.5} value={p.simCh} onChange={(e) => p.setSimCh(Number(e.target.value) || 0)} className={inputClass} /></label>
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">k</span><input type="number" step={0.5} value={p.simCk} onChange={(e) => p.setSimCk(Number(e.target.value) || 0)} className={inputClass} /></label>
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">r</span><input type="number" step={0.5} value={p.simCr} onChange={(e) => p.setSimCr(Math.max(0.5, Number(e.target.value) || 1))} className={inputClass} /></label>
              </div>
            </div>
          )}

          {p.simKind === 'quad_quad' ? (
            <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
              <div className="text-[11px] font-black text-sky-500">Curve 2: y = {formatPoly2(p.simQ2a, p.simQ2b, p.simQ2c)}</div>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">a₂</span><input type="number" step={0.5} value={p.simQ2a} onChange={(e) => p.setSimQ2a(Number(e.target.value) || 0)} className={inputClass} /></label>
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">b₂</span><input type="number" step={0.5} value={p.simQ2b} onChange={(e) => p.setSimQ2b(Number(e.target.value) || 0)} className={inputClass} /></label>
                <label className="flex flex-col gap-0.5"><span className="text-[10px]">c₂</span><input type="number" step={0.5} value={p.simQ2c} onChange={(e) => p.setSimQ2c(Number(e.target.value) || 0)} className={inputClass} /></label>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
              <div className="text-[11px] font-black text-sky-500">Line: y = {formatPoly2(0, p.simLm, p.simLd)}</div>
              <SliderRow label="Gradient (m)" val={p.simLm} set={p.setSimLm} min={-4} max={4} step={0.25} inputClass={inputClass} />
              <SliderRow label="y-Intercept (d)" val={p.simLd} set={p.setSimLd} min={-6} max={6} step={0.5} inputClass={inputClass} />
            </div>
          )}
        </div>

        <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
          <div className="font-black uppercase tracking-wider text-emerald-500">Analytical Solver</div>
          <div className="font-bold">{p.simultaneousInfo.statusText}</div>
          <div className="flex justify-between">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Discriminant</span>
            <span className="font-mono font-bold">{p.simultaneousInfo.discriminantText}</span>
          </div>
          {p.simultaneousInfo.intersections.map((pt, idx) => (
            <div key={idx} className="flex justify-between">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Solution P{idx + 1}</span>
              <span className="font-mono font-extrabold text-emerald-500">({fmtNum(pt.x)}, {fmtNum(pt.y)})</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ==================== 11. CALCULUS ====================
  if (mode === 'calculus') {
    return (
      <>
        <div className={`rounded-2xl border p-3.5 space-y-3 ${panelCard}`}>
          <div className="text-xs font-black uppercase tracking-wider">Base Curve f(x)</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'quadratic', label: 'Quadratic' },
                { id: 'cubic', label: 'Cubic' },
                { id: 'sine', label: 'Sine Wave' },
              ] as Array<{ id: CalcCurveKind; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  p.setCalcCurve(opt.id);
                  if (opt.id === 'quadratic') { p.setCalcA(0.5); p.setCalcB(-1); p.setCalcC(-1.5); p.setCalcIntA(-1); p.setCalcIntB(3); }
                  else if (opt.id === 'cubic') { p.setCalcA(0.25); p.setCalcB(-1.5); p.setCalcC(0); p.setCalcIntA(-2); p.setCalcIntB(2); }
                  else { p.setCalcA(2); p.setCalcB(1); p.setCalcC(0); p.setCalcIntA(0); p.setCalcIntB(3.14); }
                }}
                className={segBtn(p.calcCurve === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <label className="flex flex-col gap-0.5"><span className="text-[10px]">a</span><input type="number" step={0.25} value={p.calcA} onChange={(e) => p.setCalcA(Number(e.target.value) || 0)} className={inputClass} /></label>
            <label className="flex flex-col gap-0.5"><span className="text-[10px]">b</span><input type="number" step={0.25} value={p.calcB} onChange={(e) => p.setCalcB(Number(e.target.value) || 0)} className={inputClass} /></label>
            <label className="flex flex-col gap-0.5"><span className="text-[10px]">c</span><input type="number" step={0.25} value={p.calcC} onChange={(e) => p.setCalcC(Number(e.target.value) || 0)} className={inputClass} /></label>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
            <SliderRow label="Tangent Point x₀" val={p.calcX0} set={p.setCalcX0} min={-5} max={5} step={0.1} accent="accent-rose-500" inputClass={inputClass} />
            <div className="flex flex-wrap gap-3 text-[11px] font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={p.showTangent} onChange={(e) => p.setShowTangent(e.target.checked)} className="accent-amber-500" />
                <span>Tangent</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={p.showNormal} onChange={(e) => p.setShowNormal(e.target.checked)} className="accent-pink-500" />
                <span>Normal</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={p.showIntegral} onChange={(e) => p.setShowIntegral(e.target.checked)} className="accent-emerald-500" />
                <span>Area ∫</span>
              </label>
            </div>
          </div>

          {p.showIntegral && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
              <div className="text-[11px] font-black text-emerald-500">Definite Integral Limits [a, b]</div>
              <SliderRow label="Lower Limit (a)" val={p.calcIntA} set={p.setCalcIntA} min={-5} max={5} step={0.25} accent="accent-emerald-500" inputClass={inputClass} />
              <SliderRow label="Upper Limit (b)" val={p.calcIntB} set={p.setCalcIntB} min={-5} max={5} step={0.25} accent="accent-emerald-500" inputClass={inputClass} />
            </div>
          )}
        </div>

        <div className={`rounded-2xl border p-3.5 space-y-2 text-xs ${panelCard}`}>
          <div className="font-black uppercase tracking-wider text-amber-500">Derivative &amp; Integral</div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Function</span>
            <span className="font-mono font-bold">{p.calculusInfo.curveFormula}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Derivative</span>
            <span className="font-mono font-bold text-amber-500">{p.calculusInfo.derivativeFormula}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Point P(x₀, y₀)</span>
            <span className="font-mono font-bold text-rose-500">({fmtNum(p.calculusInfo.x0)}, {fmtNum(p.calculusInfo.y0)})</span>
          </div>
          <div className={`text-[11px] pt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Green shading = positive area (above x-axis) · Red shading = negative area (below x-axis).
          </div>
        </div>
      </>
    );
  }

  return null;
};
