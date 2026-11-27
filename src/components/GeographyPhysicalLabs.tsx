import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CLIMATE_STATIONS,
  MONTHS_SHORT,
  formatGridRef,
  getCompass16Direction,
  getTopoElevationAt,
} from './geographySimulationsData';

interface LabProps {
  darkMode?: boolean;
}

// ============================================================================
// 1. MAP READING, GRID REFERENCE, BEARING & CROSS-SECTION LAB (NECTA QN 6)
// ============================================================================
export const MapReadingSimulationLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const profileCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Coordinates in Eastings (32..40) and Northings (60..68)
  const [pointA, setPointA] = useState<{ e: number; n: number }>({ e: 33.6, n: 64.8 });
  const [pointB, setPointB] = useState<{ e: number; n: number }>({ e: 38.2, n: 65.2 });
  const [draggingPoint, setDraggingPoint] = useState<'A' | 'B' | null>(null);
  const [showProtractor, setShowProtractor] = useState<boolean>(true);
  const [showTenthGrid, setShowTenthGrid] = useState<boolean>(true);
  const [showAreaGrid, setShowAreaGrid] = useState<boolean>(false);
  const [verticalScaleMPerCm, setVerticalScaleMPerCm] = useState<number>(100); // 1cm represents 100m vertically

  const gridA = useMemo(() => formatGridRef(pointA.e, pointA.n), [pointA]);
  const gridB = useMemo(() => formatGridRef(pointB.e, pointB.n), [pointB]);
  const elevA = useMemo(() => getTopoElevationAt(pointA.e, pointA.n), [pointA]);
  const elevB = useMemo(() => getTopoElevationAt(pointB.e, pointB.n), [pointB]);

  // Distance & Bearing calculations (1 grid unit = 1 km on ground = 2 cm on 1:50,000 map)
  const metrics = useMemo(() => {
    const dE = pointB.e - pointA.e;
    const dN = pointB.n - pointA.n;
    const groundDistKm = Math.hypot(dE, dN);
    const groundDistM = groundDistKm * 1000;
    const mapDistCm = groundDistKm * 2; // 1:50,000 => 2 cm = 1 km

    // Forward bearing from North clockwise (0..360)
    const rad = Math.atan2(dE, dN);
    const forwardBearing = ((rad * 180) / Math.PI + 360) % 360;
    const backBearing =
      forwardBearing < 180 ? forwardBearing + 180 : forwardBearing - 180;

    const vi = Math.abs(elevB - elevA);
    const gradientDenom = vi > 0 ? Math.round(groundDistM / vi) : Infinity;

    // Sample profile along AB (80 samples) & check intervisibility
    const samples: { t: number; distKm: number; elev: number; sightElev: number }[] = [];
    let obstructed = false;
    let maxObstructionDiff = 0;
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const e = pointA.e + dE * t;
      const n = pointA.n + dN * t;
      const elev = getTopoElevationAt(e, n);
      const sightElev = elevA + (elevB - elevA) * t;
      if (i > 2 && i < 78 && elev > sightElev + 4) {
        obstructed = true;
        maxObstructionDiff = Math.max(maxObstructionDiff, Math.round(elev - sightElev));
      }
      samples.push({ t, distKm: groundDistKm * t, elev, sightElev });
    }

    // Vertical Exaggeration: Horizontal Scale = 1:50,000 (1cm = 500m). Vertical Scale = 1cm : verticalScaleMPerCm
    const ve = 500 / verticalScaleMPerCm;

    return {
      groundDistKm,
      groundDistM,
      mapDistCm,
      forwardBearing,
      backBearing,
      compassDir: getCompass16Direction(forwardBearing),
      backCompassDir: getCompass16Direction(backBearing),
      vi,
      gradientDenom,
      samples,
      intervisible: !obstructed,
      maxObstructionDiff,
      ve,
    };
  }, [pointA, pointB, elevA, elevB, verticalScaleMPerCm]);

  // Draw Topographic Map Canvas
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padL = 42;
    const padR = 20;
    const padT = 24;
    const padB = 34;
    const mapW = W - padL - padR;
    const mapH = H - padT - padB;

    const toX = (e: number) => padL + ((e - 32) / 8) * mapW;
    const toY = (n: number) => padT + ((68 - n) / 8) * mapH;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = darkMode ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // 1. Hypsometric terrain tinting & contour band rendering
    const cols = 128;
    const rows = 96;
    const cellW = mapW / cols;
    const cellH = mapH / rows;
    const elevGrid: number[][] = [];

    for (let r = 0; r <= rows; r++) {
      elevGrid[r] = [];
      const n = 68 - (r / rows) * 8;
      for (let c = 0; c <= cols; c++) {
        const e = 32 + (c / cols) * 8;
        elevGrid[r][c] = getTopoElevationAt(e, n);
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = elevGrid[r][c];
        let fill = '#e9f5db';
        if (el > 700) fill = '#c9a27e';
        else if (el > 600) fill = '#d8b792';
        else if (el > 500) fill = '#e6cca8';
        else if (el > 400) fill = '#f1dfb8';
        else if (el > 300) fill = '#eef0c4';
        else if (el > 220) fill = '#dfecc6';
        ctx.fillStyle = fill;
        ctx.fillRect(padL + c * cellW, padT + r * cellH, cellW + 0.6, cellH + 0.6);
      }
    }

    // 2. Contour lines every 50m (Index contours every 100m)
    const levels = [150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750];
    for (const level of levels) {
      const isIndex = level % 100 === 0;
      ctx.strokeStyle = isIndex ? '#8c4a19' : 'rgba(154, 88, 37, 0.55)';
      ctx.lineWidth = isIndex ? 1.5 : 0.85;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const e00 = elevGrid[r][c];
          const e10 = elevGrid[r][c + 1];
          const e01 = elevGrid[r + 1][c];
          if ((e00 <= level && e10 > level) || (e00 > level && e10 <= level)) {
            const x = padL + (c + (level - e00) / (e10 - e00)) * cellW;
            const y = padT + r * cellH;
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellW * 0.45, y + cellH * 0.45);
          }
          if ((e00 <= level && e01 > level) || (e00 > level && e01 <= level)) {
            const x = padL + c * cellW;
            const y = padT + (r + (level - e00) / (e01 - e00)) * cellH;
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellW * 0.45, y + cellH * 0.45);
          }
        }
      }
      ctx.stroke();
    }

    // 3. Lake / Forest Reserve polygon in SE corner (Eastings 37..39.5, Northings 60.8..63.2) for Area by Grid Squares
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toX(37.1), toY(62.9));
    ctx.bezierCurveTo(toX(38.2), toY(63.4), toX(39.5), toY(62.8), toX(39.4), toY(61.6));
    ctx.bezierCurveTo(toX(39.3), toY(60.7), toX(37.6), toY(60.7), toX(37.0), toY(61.5));
    ctx.closePath();
    ctx.fillStyle = showAreaGrid ? 'rgba(16, 185, 129, 0.42)' : 'rgba(34, 197, 94, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = '#14532d';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('KILIMA FOREST RESERVE', toX(37.25), toY(62.0));
    if (showAreaGrid) {
      ctx.fillText('Full = 2 sq · Half = 4 sq → Area = 4.0 km²', toX(37.15), toY(61.55));
    }
    ctx.restore();

    // 4. River Kilima flowing N to SSW
    ctx.save();
    ctx.beginPath();
    for (let n = 68; n >= 60; n -= 0.2) {
      const e = 36.0 + (n - 64) * 0.08 + Math.sin(n * 1.6) * 0.14;
      const x = toX(e);
      const y = toY(n);
      if (n === 68) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 5. All-weather road with Bridge across River Kilima at (36.0, 63.6)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toX(32), toY(62.2));
    ctx.quadraticCurveTo(toX(35.8), toY(63.6), toX(40), toY(64.2));
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();

    // 6. Eastings (32..40) and Northings (60..68) Grid Lines
    ctx.save();
    for (let e = 32; e <= 40; e++) {
      const x = toX(e);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + mapH);
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.38)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = darkMode ? '#93c5fd' : '#1e3a8a';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(e).padStart(2, '0'), x, padT + mapH + 16);
      ctx.fillText(String(e).padStart(2, '0'), x, padT - 7);
    }

    for (let n = 60; n <= 68; n++) {
      const y = toY(n);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + mapW, y);
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.38)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = darkMode ? '#93c5fd' : '#1e3a8a';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(n).padStart(2, '0'), padL - 7, y + 4);
    }
    ctx.restore();

    // 7. Tenth-Grid Subdivisions inside Point A and Point B grid squares
    if (showTenthGrid) {
      [pointA, pointB].forEach((pt, idx) => {
        const e0 = Math.floor(Math.max(32, Math.min(39, pt.e)));
        const n0 = Math.floor(Math.max(60, Math.min(67, pt.n)));
        ctx.save();
        ctx.strokeStyle = idx === 0 ? 'rgba(37, 99, 235, 0.35)' : 'rgba(225, 29, 72, 0.35)';
        ctx.lineWidth = 0.6;
        for (let i = 1; i < 10; i++) {
          const x = toX(e0 + i / 10);
          ctx.beginPath();
          ctx.moveTo(x, toY(n0 + 1));
          ctx.lineTo(x, toY(n0));
          ctx.stroke();

          const y = toY(n0 + i / 10);
          ctx.beginPath();
          ctx.moveTo(toX(e0), y);
          ctx.lineTo(toX(e0 + 1), y);
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // 8. Map Landmarks (Trig Station, School, Bridge, Market)
    const landmarks = [
      { e: 34.4, n: 65.6, label: 'Δ 785m (Trig Stn)', color: '#7c2d12' },
      { e: 38.0, n: 65.2, label: '• 640m Mwanga Hill', color: '#7c2d12' },
      { e: 36.0, n: 63.6, label: 'Bridge', color: '#1d4ed8' },
      { e: 33.4, n: 62.6, label: 'Sch', color: '#0f172a' },
    ];
    for (const lm of landmarks) {
      const lx = toX(lm.e);
      const ly = toY(lm.n);
      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(lm.label, lx + 6, ly + 3);
    }

    // 9. Cross-section Line AB
    const ax = toX(pointA.e);
    const ay = toY(pointA.n);
    const bx = toX(pointB.e);
    const by = toY(pointB.n);

    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.restore();

    // 10. Optional Compass Protractor on Point A
    if (showProtractor) {
      ctx.save();
      const r = 46;
      ctx.translate(ax, ay);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // North arrow line
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(0, -r);
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.5)';
      ctx.stroke();

      ctx.fillStyle = '#1d4ed8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N 000°', 0, -r - 4);

      // Bearing arc from North clockwise to AB
      const angleRad = ((metrics.forwardBearing - 90) * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, -Math.PI / 2, angleRad, false);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.restore();
    }

    // 11. Draw Draggable Handles for A and B
    const drawPoint = (x: number, y: number, label: string, bg: string) => {
      ctx.save();
      ctx.fillStyle = bg;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
      ctx.restore();
    };

    drawPoint(ax, ay, 'A', '#2563eb');
    drawPoint(bx, by, 'B', '#e11d48');
  }, [pointA, pointB, showProtractor, showTenthGrid, showAreaGrid, metrics.forwardBearing, darkMode]);

  // Draw Cross-Section & Intervisibility Canvas
  useEffect(() => {
    const canvas = profileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padL = 48;
    const padR = 24;
    const padT = 24;
    const padB = 30;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = darkMode ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Elevation Y axis (100m to 850m)
    const minEl = 100;
    const maxEl = 850;
    const toX = (t: number) => padL + t * plotW;
    const toY = (el: number) => padT + plotH - ((el - minEl) / (maxEl - minEl)) * plotH;

    // Horizontal grid lines
    ctx.strokeStyle = darkMode ? 'rgba(148,163,184,0.16)' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let el = 200; el <= 800; el += 200) {
      const y = toY(el);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = darkMode ? '#94a3b8' : '#475569';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${el}m`, padL - 6, y + 3);
    }

    // Terrain Cross-Section Fill
    ctx.beginPath();
    ctx.moveTo(toX(0), padT + plotH);
    for (const s of metrics.samples) {
      ctx.lineTo(toX(s.t), toY(s.elev));
    }
    ctx.lineTo(toX(1), padT + plotH);
    ctx.closePath();
    ctx.fillStyle = darkMode ? 'rgba(217, 119, 6, 0.28)' : 'rgba(217, 119, 6, 0.22)';
    ctx.fill();

    // Terrain Profile Line
    ctx.beginPath();
    metrics.samples.forEach((s, i) => {
      if (i === 0) ctx.moveTo(toX(s.t), toY(s.elev));
      else ctx.lineTo(toX(s.t), toY(s.elev));
    });
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Line of Sight between A and B
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = metrics.intervisible ? '#16a34a' : '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(elevA));
    ctx.lineTo(toX(1), toY(elevB));
    ctx.stroke();
    ctx.restore();

    // Endpoints A and B on Profile
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(toX(0), toY(elevA), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`A (${elevA}m)`, toX(0) + 18, toY(elevA) - 8);

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(toX(1), toY(elevB), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`B (${elevB}m)`, toX(1) - 24, toY(elevB) - 8);

    // Bottom X-axis distance label
    ctx.fillStyle = darkMode ? '#cbd5e1' : '#334155';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Cross-Section A → B (Ground Distance: ${metrics.groundDistKm.toFixed(2)} km · VE = ×${metrics.ve.toFixed(1)})`,
      padL + plotW / 2,
      H - 8
    );
  }, [metrics, elevA, elevB, darkMode]);

  // Pointer dragging on map canvas
  const updateFromPointer = (clientX: number, clientY: number, targetPt?: 'A' | 'B') => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    const padL = 42;
    const padR = 20;
    const padT = 24;
    const padB = 34;
    const mapW = canvas.width - padL - padR;
    const mapH = canvas.height - padT - padB;

    const e = Math.max(32.1, Math.min(39.9, 32 + ((px - padL) / mapW) * 8));
    const n = Math.max(60.1, Math.min(67.9, 68 - ((py - padT) / mapH) * 8));

    const active = targetPt || draggingPoint;
    if (active === 'A') {
      setPointA({ e: Number(e.toFixed(2)), n: Number(n.toFixed(2)) });
    } else if (active === 'B') {
      setPointB({ e: Number(e.toFixed(2)), n: Number(n.toFixed(2)) });
    }
  };

  const handlePointerDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) * canvas.width) / rect.width;
    const py = ((ev.clientY - rect.top) * canvas.height) / rect.height;

    const padL = 42;
    const padR = 20;
    const padT = 24;
    const padB = 34;
    const mapW = canvas.width - padL - padR;
    const mapH = canvas.height - padT - padB;
    const ax = padL + ((pointA.e - 32) / 8) * mapW;
    const ay = padT + ((68 - pointA.n) / 8) * mapH;
    const bx = padL + ((pointB.e - 32) / 8) * mapW;
    const by = padT + ((68 - pointB.n) / 8) * mapH;

    const distA = Math.hypot(px - ax, py - ay);
    const distB = Math.hypot(px - bx, py - by);
    const chosen: 'A' | 'B' = distA <= distB ? 'A' : 'B';
    setDraggingPoint(chosen);
    ev.currentTarget.setPointerCapture(ev.pointerId);
    updateFromPointer(ev.clientX, ev.clientY, chosen);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left 7 Cols: Interactive Topographic Map Sheet & Live Cross-Section */}
      <div className="lg:col-span-7 space-y-4">
        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-black">
                KILIMA TOPOGRAPHIC SHEET 124/2 (Scale 1:50,000 · VI = 50m)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag Point A (blue) or Point B (red) directly on the contour map to inspect grid references, bearings, and relief.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowProtractor((v) => !v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  showProtractor
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                Protractor
              </button>
              <button
                type="button"
                onClick={() => setShowTenthGrid((v) => !v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  showTenthGrid
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                10th Sub-Grid
              </button>
              <button
                type="button"
                onClick={() => setShowAreaGrid((v) => !v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  showAreaGrid
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                Forest Area
              </button>
            </div>
          </div>

          <canvas
            ref={mapCanvasRef}
            width={620}
            height={420}
            onPointerDown={handlePointerDown}
            onPointerMove={(ev) => {
              if (draggingPoint) updateFromPointer(ev.clientX, ev.clientY);
            }}
            onPointerUp={() => setDraggingPoint(null)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 touch-none cursor-crosshair"
          />

          {/* Quick Landmark Pair Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500">Test Pairs:</span>
            <button
              type="button"
              onClick={() => {
                setPointA({ e: 33.4, n: 62.6 });
                setPointB({ e: 38.0, n: 65.2 });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              School → Mwanga Hill (Obstructed by Δ 785m)
            </button>
            <button
              type="button"
              onClick={() => {
                setPointA({ e: 34.4, n: 65.6 });
                setPointB({ e: 36.0, n: 63.6 });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Trig Station Δ 785m → River Bridge (Intervisible)
            </button>
          </div>
        </div>

        {/* Relief Cross-Section & Intervisibility Canvas */}
        <div
          className={`rounded-2xl border p-4 space-y-2 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-black">
              Relief Cross-Section &amp; Line-of-Sight Intervisibility (A → B)
            </span>
            <span
              className={`text-xs font-bold ${
                metrics.intervisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {metrics.intervisible
                ? '✓ A and B are INTERVISIBLE (Clear Line of Sight)'
                : `✕ NOT Intervisible (Blocked by +${metrics.maxObstructionDiff}m intervening ridge)`}
            </span>
          </div>
          <canvas
            ref={profileCanvasRef}
            width={620}
            height={175}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Right 5 Cols: NECTA Step-by-Step Map Reading Calculations */}
      <div className="lg:col-span-5 space-y-4">
        {/* 1. 4-Figure & 6-Figure Grid Reference Card */}
        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            1. Grid References (Eastings First, Northings Second)
          </div>
          <div className="grid grid-cols-2 gap-3 font-mono tabular-nums">
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60">
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300">Point A ({elevA}m)</div>
              <div className="text-sm font-black mt-1">6-Fig: {gridA.sixFig}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">4-Fig: {gridA.fourFig}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                E: {gridA.eMain}.{gridA.eTenth} · N: {gridA.nMain}.{gridA.nTenth}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/60">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300">Point B ({elevB}m)</div>
              <div className="text-sm font-black mt-1">6-Fig: {gridB.sixFig}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">4-Fig: {gridB.fourFig}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                E: {gridB.eMain}.{gridB.eTenth} · N: {gridB.nMain}.{gridB.nTenth}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Forward & Back Bearing + Direction */}
        <div
          className={`rounded-2xl border p-4 space-y-2.5 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            2. Forward &amp; Back Bearing (BB = FB ± 180°)
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <div className="text-slate-500">Bearing of B from A (FB)</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {metrics.forwardBearing.toFixed(1).padStart(5, '0')}° ({metrics.compassDir})
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <div className="text-slate-500">Bearing of A from B (BB)</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {metrics.backBearing.toFixed(1).padStart(5, '0')}° ({metrics.backCompassDir})
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Rule: Since FB = {metrics.forwardBearing.toFixed(1)}°{' '}
            {metrics.forwardBearing < 180 ? '< 180°, add 180°' : '≥ 180°, subtract 180°'} to obtain Back Bearing ={' '}
            <strong className="font-mono">{metrics.backBearing.toFixed(1)}°</strong>.
          </p>
        </div>

        {/* 3. Scale, Distance, Gradient & Vertical Exaggeration */}
        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            3. Scale, Distance, Gradient &amp; Vertical Exaggeration
          </div>
          <div className="space-y-1.5 text-xs font-mono tabular-nums">
            <div className="flex justify-between">
              <span className="text-slate-500">Map Scale (RF 1:50,000):</span>
              <span className="font-bold">1 cm represents 0.5 km (2 cm = 1 km)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Map Distance AB:</span>
              <span className="font-bold">{metrics.mapDistCm.toFixed(2)} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ground Distance (HE):</span>
              <span className="font-bold">
                {metrics.groundDistKm.toFixed(2)} km ({Math.round(metrics.groundDistM)} m)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vertical Interval (VI = |{elevB} - {elevA}|):</span>
              <span className="font-bold">{metrics.vi} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Gradient (VI ÷ HE):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.gradientDenom === Infinity ? 'Flat (0)' : `1 in ${metrics.gradientDenom}`}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">
                Vertical Scale: 1 cm represents {verticalScaleMPerCm} m (1:{verticalScaleMPerCm * 100})
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                VE = 50,000 ÷ {verticalScaleMPerCm * 100} = ×{metrics.ve.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={250}
              step={25}
              value={verticalScaleMPerCm}
              onChange={(e) => setVerticalScaleMPerCm(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. EARTH MOVEMENTS, LOCAL TIME CALCULATOR & SEASONS ORBIT LAB (FORM 1)
// ============================================================================
export const EarthTimeSeasonsLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const [subTab, setSubTab] = useState<'time' | 'seasons'>('time');

  // Sub-tab 1: Longitude & Local Time state
  const [lonA, setLonA] = useState<number>(39); // Dar es Salaam 39°E
  const [lonB, setLonB] = useState<number>(-74); // New York 74°W
  const [timeAHours, setTimeAHours] = useState<number>(12); // 12:00 Noon
  const [timeAMins, setTimeAMins] = useState<number>(0);

  // Sub-tab 2: Seasons & Revolution state
  const [dayOfYear, setDayOfYear] = useState<number>(172); // June 21 Solstice
  const [observerLat, setObserverLat] = useState<number>(-6); // Tanzania ~6°S
  const [eclipseType, setEclipseType] = useState<'none' | 'solar' | 'lunar'>('none');

  const timeCalc = useMemo(() => {
    const sameHemisphere = (lonA >= 0 && lonB >= 0) || (lonA < 0 && lonB < 0);
    const diffDeg = Math.abs(lonB - lonA);
    const totalDiffMins = diffDeg * 4; // 1° = 4 mins
    const diffHrs = Math.floor(totalDiffMins / 60);
    const diffRemMins = Math.round(totalDiffMins % 60);
    const isBEastOfA = lonB > lonA;

    const baseMinsA = timeAHours * 60 + timeAMins;
    const rawMinsB = isBEastOfA ? baseMinsA + totalDiffMins : baseMinsA - totalDiffMins;

    let dayOffset = 0;
    let normalizedMinsB = rawMinsB;
    if (normalizedMinsB >= 1440) {
      normalizedMinsB -= 1440;
      dayOffset = 1;
    } else if (normalizedMinsB < 0) {
      normalizedMinsB += 1440;
      dayOffset = -1;
    }

    const hrsB = Math.floor(normalizedMinsB / 60);
    const minsB = Math.round(normalizedMinsB % 60);

    const fmtLon = (l: number) => (l === 0 ? '0° (Greenwich)' : l > 0 ? `${l}°E` : `${Math.abs(l)}°W`);
    const fmtTime = (h: number, m: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} (${h12}:${String(m).padStart(2, '0')} ${period})`;
    };

    return {
      sameHemisphere,
      diffDeg,
      totalDiffMins,
      diffHrs,
      diffRemMins,
      isBEastOfA,
      dayOffset,
      fmtLonA: fmtLon(lonA),
      fmtLonB: fmtLon(lonB),
      fmtTimeA: fmtTime(timeAHours, timeAMins),
      fmtTimeB: fmtTime(hrsB, minsB),
    };
  }, [lonA, lonB, timeAHours, timeAMins]);

  // Solar declination & daylight length for selected dayOfYear
  const seasonInfo = useMemo(() => {
    const declination = 23.5 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 80));
    const latRad = (observerLat * Math.PI) / 180;
    const decRad = (declination * Math.PI) / 180;
    const cosH = Math.max(-1, Math.min(1, -Math.tan(latRad) * Math.tan(decRad)));
    const daylightHours = (2 / 15) * ((Math.acos(cosH) * 180) / Math.PI);

    let seasonName = 'Transition between Equinox & Solstice';
    if (Math.abs(dayOfYear - 80) <= 12) seasonName = 'March 21 Equinox (Overhead Sun at Equator 0°)';
    else if (Math.abs(dayOfYear - 172) <= 12)
      seasonName = 'June 21 Solstice (Overhead Sun at Tropic of Cancer 23.5°N)';
    else if (Math.abs(dayOfYear - 266) <= 12)
      seasonName = 'September 23 Equinox (Overhead Sun at Equator 0°)';
    else if (dayOfYear >= 345 || dayOfYear <= 10)
      seasonName = 'December 22 Solstice (Overhead Sun at Tropic of Capricorn 23.5°S)';

    return {
      declination,
      daylightHours,
      nightHours: 24 - daylightHours,
      seasonName,
    };
  }, [dayOfYear, observerLat]);

  return (
    <div className="space-y-4">
      {/* Sub-mode Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab('time')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer transition-colors ${
            subTab === 'time'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          Longitude &amp; Local Time Calculator (15° = 1 hr)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('seasons')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer transition-colors ${
            subTab === 'seasons'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          Earth Revolution, 23.5° Axial Tilt, Seasons &amp; Eclipses
        </button>
      </div>

      {subTab === 'time' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Interactive Polar Longitude Dial SVG */}
          <div
            className={`lg:col-span-6 rounded-2xl border p-5 flex flex-col items-center justify-between ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-sm font-black">North Pole Meridian View (180°W ↔ 0° ↔ 180°E)</span>
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                Δθ = {timeCalc.diffDeg}° ({timeCalc.diffHrs}h {timeCalc.diffRemMins}m)
              </span>
            </div>

            <svg viewBox="0 0 320 290" className="w-full max-w-sm my-2">
              {/* Sunlight rays from top */}
              <text x="160" y="16" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
                ☀ OVERHEAD SUN RAYS (NOON MERIDIAN)
              </text>
              {/* Earth circle */}
              <circle cx="160" cy="155" r="105" fill="#1e3a8a" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Night hemisphere shading */}
              <path d="M 55 155 A 105 105 0 0 0 265 155 Z" fill="rgba(2, 6, 23, 0.55)" />
              {/* Meridian spokes every 30° */}
              {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180].map((deg) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                const x2 = 160 + 105 * Math.cos(rad);
                const y2 = 155 + 105 * Math.sin(rad);
                const lx = 160 + 121 * Math.cos(rad);
                const ly = 155 + 121 * Math.sin(rad);
                return (
                  <g key={deg}>
                    <line
                      x1="160"
                      y1="155"
                      x2={x2}
                      y2={y2}
                      stroke={deg === 0 ? '#facc15' : 'rgba(148,163,184,0.35)'}
                      strokeWidth={deg === 0 ? 2 : 1}
                    />
                    <text
                      x={lx}
                      y={ly + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fill={darkMode ? '#cbd5e1' : '#334155'}
                      fontWeight="bold"
                    >
                      {deg === 0 ? '0° GM' : deg === 180 ? '180°' : deg > 0 ? `${deg}°E` : `${Math.abs(deg)}°W`}
                    </text>
                  </g>
                );
              })}

              {/* Town A Ray */}
              {(() => {
                const radA = ((lonA - 90) * Math.PI) / 180;
                const ax = 160 + 96 * Math.cos(radA);
                const ay = 155 + 96 * Math.sin(radA);
                return (
                  <g>
                    <line x1="160" y1="155" x2={ax} y2={ay} stroke="#38bdf8" strokeWidth="3.5" />
                    <circle cx={ax} cy={ay} r="9" fill="#0284c7" stroke="#fff" strokeWidth="2" />
                    <text x={ax} y={ay + 3.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                      A
                    </text>
                  </g>
                );
              })()}

              {/* Town B Ray */}
              {(() => {
                const radB = ((lonB - 90) * Math.PI) / 180;
                const bx = 160 + 96 * Math.cos(radB);
                const by = 155 + 96 * Math.sin(radB);
                return (
                  <g>
                    <line x1="160" y1="155" x2={bx} y2={by} stroke="#f43f5e" strokeWidth="3.5" />
                    <circle cx={bx} cy={by} r="9" fill="#e11d48" stroke="#fff" strokeWidth="2" />
                    <text x={bx} y={by + 3.5} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                      B
                    </text>
                  </g>
                );
              })()}
              <circle cx="160" cy="155" r="5" fill="#f8fafc" />
            </svg>

            {/* Quick City Presets */}
            <div className="flex flex-wrap items-center gap-1.5 w-full">
              <span className="text-xs font-bold text-slate-500">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setLonA(39);
                  setLonB(0);
                  setTimeAHours(14);
                  setTimeAMins(36);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Dar es Salaam (39°E) → London (0°)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLonA(30);
                  setLonB(135);
                  setTimeAHours(9);
                  setTimeAMins(0);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Kigoma (30°E) → Tokyo (135°E)
              </button>
            </div>
          </div>

          {/* Right: Sliders & NECTA Step-by-Step Working */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className={`rounded-2xl border p-4 space-y-3 ${
                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-sky-600 dark:text-sky-400">Known Town A Longitude: {timeCalc.fmtLonA}</span>
                  <span>Local Time at A: {timeCalc.fmtTimeA}</span>
                </div>
                <input
                  type="range"
                  min={-165}
                  max={165}
                  step={1}
                  value={lonA}
                  onChange={(e) => setLonA(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block">Town A Hour (0–23)</label>
                  <input
                    type="range"
                    min={0}
                    max={23}
                    value={timeAHours}
                    onChange={(e) => setTimeAHours(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block">Town A Minutes (0–59)</label>
                  <input
                    type="range"
                    min={0}
                    max={59}
                    step={4}
                    value={timeAMins}
                    onChange={(e) => setTimeAMins(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-600 dark:text-rose-400">Target Town B Longitude: {timeCalc.fmtLonB}</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    {timeCalc.isBEastOfA ? 'East of A (E.G.A. → Add)' : 'West of A (W.L.S. → Subtract)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={-165}
                  max={165}
                  step={1}
                  value={lonB}
                  onChange={(e) => setLonB(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Step-by-Step NECTA Solution Board */}
            <div
              className={`rounded-2xl border p-4 space-y-2.5 font-mono text-xs ${
                darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="font-sans text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                NECTA Step-by-Step Local Time Solution
              </div>
              <div>
                <strong>Step 1 (Longitude Difference):</strong>{' '}
                {timeCalc.sameHemisphere
                  ? `Same Hemisphere → Subtract: |${Math.abs(lonB)}° - ${Math.abs(lonA)}°| = ${timeCalc.diffDeg}°`
                  : `Different Hemispheres → Add: ${Math.abs(lonA)}° + ${Math.abs(lonB)}° = ${timeCalc.diffDeg}°`}
              </div>
              <div>
                <strong>Step 2 (Time Difference):</strong> Since 15° = 1 hr and 1° = 4 min:
                <br />
                {timeCalc.diffDeg}° × 4 min = {timeCalc.totalDiffMins} mins ={' '}
                <strong>
                  {timeCalc.diffHrs} hr {timeCalc.diffRemMins} min
                </strong>
              </div>
              <div>
                <strong>Step 3 (E.G.A. / W.L.S. Rule):</strong> Town B ({timeCalc.fmtLonB}) is{' '}
                <strong>{timeCalc.isBEastOfA ? 'EAST' : 'WEST'}</strong> of Town A ({timeCalc.fmtLonA}), so we{' '}
                <strong>{timeCalc.isBEastOfA ? 'ADD (East Gain Add)' : 'SUBTRACT (West Lose Subtract)'}</strong>.
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-sm font-black text-emerald-900 dark:text-emerald-200">
                Local Time at Town B = {timeCalc.fmtTimeB}{' '}
                {timeCalc.dayOffset === 1
                  ? '(Next Day)'
                  : timeCalc.dayOffset === -1
                    ? '(Previous Day)'
                    : '(Same Day)'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sub-tab 2: Earth Revolution, Seasons & Eclipses */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div
            className={`lg:col-span-7 rounded-2xl border p-5 space-y-3 ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black">{seasonInfo.seasonName}</h3>
              <div className="flex items-center gap-1.5">
                {(['none', 'solar', 'lunar'] as const).map((ec) => (
                  <button
                    key={ec}
                    type="button"
                    onClick={() => setEclipseType(ec)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                      eclipseType === ec
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {ec === 'none' ? 'Seasons Orbit' : ec === 'solar' ? 'Solar Eclipse' : 'Lunar Eclipse'}
                  </button>
                ))}
              </div>
            </div>

            {eclipseType === 'none' ? (
              <svg viewBox="0 0 540 270" className="w-full rounded-xl bg-slate-950">
                {/* Elliptical orbit path */}
                <ellipse
                  cx="270"
                  cy="135"
                  rx="200"
                  ry="85"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.35)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                {/* Sun at center */}
                <circle cx="270" cy="135" r="28" fill="#f59e0b" />
                <circle cx="270" cy="135" r="35" fill="rgba(245, 158, 11, 0.25)" />
                <text x="270" y="139" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                  SUN
                </text>

                {/* 4 Cardinal Labels */}
                <text x="270" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  March 21 Equinox (0°)
                </text>
                <text x="48" y="138" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  June 21 (23.5°N)
                </text>
                <text x="270" y="254" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  Sept 23 Equinox (0°)
                </text>
                <text x="492" y="138" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  Dec 22 (23.5°S)
                </text>

                {/* Orbiting Tilted Earth (23.5° tilt) */}
                {(() => {
                  const angle = ((dayOfYear - 80) / 365) * Math.PI * 2 + Math.PI / 2;
                  const ex = 270 - 200 * Math.cos(angle);
                  const ey = 135 - 85 * Math.sin(angle);
                  return (
                    <g transform={`translate(${ex}, ${ey})`}>
                      {/* 23.5° Tilted Axis */}
                      <line x1="-11" y1="26" x2="11" y2="-26" stroke="#38bdf8" strokeWidth="2.2" />
                      <circle cx="0" cy="0" r="18" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
                      {/* Equator line tilted 23.5° */}
                      <line x1="-17" y1="-7" x2="17" y2="7" stroke="#fde047" strokeWidth="1.5" />
                      <text x="0" y="-30" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                        23.5° Tilt
                      </text>
                    </g>
                  );
                })()}
              </svg>
            ) : (
              /* Solar / Lunar Eclipse Ray Diagram */
              <svg viewBox="0 0 540 240" className="w-full rounded-xl bg-slate-950">
                <circle cx="75" cy="120" r="42" fill="#f59e0b" />
                <text x="75" y="124" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
                  SUN
                </text>
                {eclipseType === 'solar' ? (
                  <>
                    {/* Moon between Sun and Earth (SME) */}
                    <polygon points="117,85 290,108 290,132 117,155" fill="rgba(253, 224, 71, 0.12)" />
                    <polygon points="290,108 425,120 290,132" fill="rgba(2, 6, 23, 0.85)" />
                    <circle cx="290" cy="120" r="13" fill="#94a3b8" stroke="#e2e8f0" />
                    <text x="290" y="94" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                      MOON (New Moon)
                    </text>
                    <circle cx="435" cy="120" r="28" fill="#0284c7" />
                    <text x="435" y="166" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                      EARTH (Umbra Total Eclipse Spot)
                    </text>
                  </>
                ) : (
                  <>
                    {/* Earth between Sun and Moon (SEM) */}
                    <polygon points="117,82 295,94 295,146 117,158" fill="rgba(253, 224, 71, 0.12)" />
                    <polygon points="295,94 470,108 470,132 295,146" fill="rgba(2, 6, 23, 0.82)" />
                    <circle cx="295" cy="120" r="28" fill="#0284c7" />
                    <text x="295" y="80" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                      EARTH
                    </text>
                    <circle cx="445" cy="120" r="13" fill="#b91c1c" stroke="#fca5a5" />
                    <text x="445" y="155" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="bold">
                      MOON in Earth&apos;s Umbra (Full Moon)
                    </text>
                  </>
                )}
              </svg>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDayOfYear(80)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Mar 21 (Equinox)
              </button>
              <button
                type="button"
                onClick={() => setDayOfYear(172)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Jun 21 (Cancer 23.5°N)
              </button>
              <button
                type="button"
                onClick={() => setDayOfYear(266)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Sep 23 (Equinox)
              </button>
              <button
                type="button"
                onClick={() => setDayOfYear(356)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Dec 22 (Capricorn 23.5°S)
              </button>
            </div>
          </div>

          <div
            className={`lg:col-span-5 rounded-2xl border p-4 space-y-4 ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Revolution Day of Year: Day {dayOfYear} / 365</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  Overhead Sun: {Math.abs(seasonInfo.declination).toFixed(1)}°
                  {seasonInfo.declination >= 0 ? 'N' : 'S'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={365}
                value={dayOfYear}
                onChange={(e) => setDayOfYear(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>
                  Observer Latitude: {Math.abs(observerLat)}°{observerLat >= 0 ? 'N' : 'S'}
                </span>
                <span className="font-mono">
                  Day: {seasonInfo.daylightHours.toFixed(1)}h · Night: {seasonInfo.nightHours.toFixed(1)}h
                </span>
              </div>
              <input
                type="range"
                min={-66}
                max={66}
                value={observerLat}
                onChange={(e) => setObserverLat(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs space-y-1.5">
              <div className="font-bold">NECTA Key Facts:</div>
              <p>
                • <strong>Perihelion (Jan 3):</strong> Earth is closest to the Sun (~147.3 million km).
              </p>
              <p>
                • <strong>Aphelion (July 4):</strong> Earth is farthest from the Sun (~152.1 million km).
              </p>
              <p>
                • Seasons are caused by <strong>Earth&apos;s 23.5° axial tilt</strong> combined with{' '}
                <strong>revolution around the Sun</strong> (not distance!).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. WEATHER STATION INSTRUMENTS & CLIMOGRAPH PLOTTER (FORM 1 & FORM 4)
// ============================================================================
export const WeatherClimateLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('dodoma');
  const [maxTemp, setMaxTemp] = useState<number>(31);
  const [minTemp, setMinTemp] = useState<number>(19);
  const [dryBulb, setDryBulb] = useState<number>(28);
  const [wetBulb, setWetBulb] = useState<number>(23);
  const [hoverMonthIdx, setHoverMonthIdx] = useState<number>(3); // April

  const station = useMemo(
    () => CLIMATE_STATIONS.find((s) => s.id === selectedStationId) || CLIMATE_STATIONS[0],
    [selectedStationId]
  );

  const climateStats = useMemo(() => {
    const totalRain = station.rainMm.reduce((a, b) => a + b, 0);
    const meanAnnualTemp = station.tempC.reduce((a, b) => a + b, 0) / 12;
    const hottest = Math.max(...station.tempC);
    const coolest = Math.min(...station.tempC);
    const annualRange = hottest - coolest;

    const meanDaily = (maxTemp + minTemp) / 2;
    const diurnalRange = Math.max(0, maxTemp - minTemp);
    const wetBulbDepression = Math.max(0, dryBulb - wetBulb);
    const relativeHumidity = Math.max(12, Math.min(100, Math.round(100 - wetBulbDepression * 7.5)));

    return {
      totalRain,
      meanAnnualTemp,
      hottest,
      coolest,
      annualRange,
      meanDaily,
      diurnalRange,
      wetBulbDepression,
      relativeHumidity,
    };
  }, [station, maxTemp, minTemp, dryBulb, wetBulb]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left 7 Cols: Interactive Climograph (Combined Rainfall Bar & Temperature Line Graph) */}
      <div
        className={`lg:col-span-7 rounded-2xl border p-5 space-y-4 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-black">
              Climograph: {station.name} ({station.latitudeLabel})
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{station.regionType}</p>
          </div>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer"
          >
            {CLIMATE_STATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.regionType}
              </option>
            ))}
          </select>
        </div>

        {/* SVG Climograph */}
        <svg viewBox="0 0 560 280" className="w-full">
          {/* Y-Axes Grid lines (Rainfall 0..400mm on Left, Temp 0..40°C on Right) */}
          {[0, 100, 200, 300, 400].map((rainVal, idx) => {
            const y = 235 - (rainVal / 400) * 195;
            const tempVal = idx * 10;
            return (
              <g key={rainVal}>
                <line
                  x1="48"
                  y1={y}
                  x2="510"
                  y2={y}
                  stroke={darkMode ? 'rgba(148,163,184,0.16)' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text x="42" y={y + 3} textAnchor="end" fontSize="10" fill="#0284c7" fontWeight="bold">
                  {rainVal}mm
                </text>
                <text x="516" y={y + 3} textAnchor="start" fontSize="10" fill="#e11d48" fontWeight="bold">
                  {tempVal}°C
                </text>
              </g>
            );
          })}

          {/* Monthly Rainfall Bars */}
          {station.rainMm.map((rain, i) => {
            const barW = 28;
            const x = 58 + i * 37.5;
            const barH = (Math.min(400, rain) / 400) * 195;
            const y = 235 - barH;
            const isHovered = hoverMonthIdx === i;
            return (
              <g
                key={MONTHS_SHORT[i]}
                onMouseEnter={() => setHoverMonthIdx(i)}
                onClick={() => setHoverMonthIdx(i)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(2, barH)}
                  rx="4"
                  fill={isHovered ? '#0369a1' : '#38bdf8'}
                />
                <text
                  x={x + barW / 2}
                  y="254"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={darkMode ? '#cbd5e1' : '#334155'}
                >
                  {MONTHS_SHORT[i]}
                </text>
              </g>
            );
          })}

          {/* Monthly Temperature Line Curve */}
          <polyline
            fill="none"
            stroke="#e11d48"
            strokeWidth="3"
            points={station.tempC
              .map((t, i) => {
                const x = 72 + i * 37.5;
                const y = 235 - (t / 40) * 195;
                return `${x},${y}`;
              })
              .join(' ')}
          />
          {station.tempC.map((t, i) => {
            const x = 72 + i * 37.5;
            const y = 235 - (t / 40) * 195;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={hoverMonthIdx === i ? 5.5 : 3.5}
                fill="#e11d48"
                stroke="#fff"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Live Climate Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono tabular-nums text-xs">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50">
            <div className="text-slate-500">Total Annual Rain</div>
            <div className="text-sm font-black text-sky-700 dark:text-sky-300 mt-0.5">
              {climateStats.totalRain} mm
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
            <div className="text-slate-500">Mean Annual Temp</div>
            <div className="text-sm font-black text-rose-700 dark:text-rose-300 mt-0.5">
              {climateStats.meanAnnualTemp.toFixed(1)} °C
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
            <div className="text-slate-500">Annual Temp Range</div>
            <div className="text-sm font-black text-amber-700 dark:text-amber-300 mt-0.5">
              {climateStats.annualRange.toFixed(1)} °C
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
            <div className="text-slate-500">{MONTHS_SHORT[hoverMonthIdx]} Reading</div>
            <div className="text-sm font-black mt-0.5">
              {station.tempC[hoverMonthIdx]}°C · {station.rainMm[hoverMonthIdx]}mm
            </div>
          </div>
        </div>

        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          {station.characteristics.map((c, idx) => (
            <li key={idx}>• {c}</li>
          ))}
        </ul>
      </div>

      {/* Right 5 Cols: Stevenson Screen Instruments (Six's Thermometer & Hygrometer) */}
      <div className="lg:col-span-5 space-y-4">
        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Stevenson Screen: Six&apos;s Maximum &amp; Minimum Thermometer
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-bold">
                <span>Daily Maximum Temperature: {maxTemp}°C</span>
                <span>Daily Minimum Temperature: {minTemp}°C</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <input
                  type="range"
                  min={20}
                  max={44}
                  value={maxTemp}
                  onChange={(e) => setMaxTemp(Math.max(minTemp + 1, Number(e.target.value)))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <input
                  type="range"
                  min={4}
                  max={28}
                  value={minTemp}
                  onChange={(e) => setMinTemp(Math.min(maxTemp - 1, Number(e.target.value)))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 font-mono tabular-nums text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <div className="text-slate-500">Mean Daily Temp ((Max+Min)÷2)</div>
                <div className="text-base font-black mt-0.5">{climateStats.meanDaily.toFixed(1)} °C</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <div className="text-slate-500">Diurnal Temp Range (Max - Min)</div>
                <div className="text-base font-black mt-0.5">{climateStats.diurnalRange.toFixed(1)} °C</div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Wet &amp; Dry Bulb Hygrometer (Relative Humidity)
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Dry Bulb (Air Temp): {dryBulb}°C</span>
              <span>Wet Bulb (Muslin Wick): {wetBulb}°C</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="range"
                min={15}
                max={40}
                value={dryBulb}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDryBulb(val);
                  if (wetBulb > val) setWetBulb(val);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="range"
                min={10}
                max={dryBulb}
                value={wetBulb}
                onChange={(e) => setWetBulb(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs font-mono space-y-1">
              <div>
                Wet Bulb Depression = {dryBulb}°C - {wetBulb}°C ={' '}
                <strong>{climateStats.wetBulbDepression}°C</strong>
              </div>
              <div className="text-sm font-black text-teal-800 dark:text-teal-300">
                Relative Humidity = {climateStats.relativeHumidity}% (
                {climateStats.wetBulbDepression === 0
                  ? '100% Saturated Air — No Evaporation'
                  : climateStats.relativeHumidity >= 70
                    ? 'Humid Air — Small Depression'
                    : 'Dry Air — High Evaporation'}
                )
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. INTERNAL EARTH FORCES: FOLDING, FAULTING (RIFT VALLEY) & VULCANICITY (FORM 3)
// ============================================================================
export const TectonicsVulcanicityLab: React.FC<LabProps> = ({ darkMode = false }) => {
  const [subMode, setSubMode] = useState<'folding' | 'faulting' | 'vulcanicity'>('faulting');
  const [stressLevel, setStressLevel] = useState<number>(68); // 0..100
  const [faultStructure, setFaultStructure] = useState<'rift_valley' | 'horst_block'>('rift_valley');
  const [seismicPulse, setSeismicPulse] = useState<number>(0);

  useEffect(() => {
    if (seismicPulse <= 0) return;
    const id = window.setInterval(() => {
      setSeismicPulse((p) => (p >= 100 ? 0 : p + 4));
    }, 45);
    return () => window.clearInterval(id);
  }, [seismicPulse]);

  const foldClassification = useMemo(() => {
    if (stressLevel < 25) return 'Simple Symmetric Fold (Equal limbs on both sides of vertical axis)';
    if (stressLevel < 55) return 'Asymmetrical Fold (One limb steeper than the other due to unequal compression)';
    if (stressLevel < 80) return 'Overfold (Recumbent limb pushed past vertical)';
    return 'Overthrust Fold / Nappe (Strata fracture and slide along a thrust fault plane)';
  }, [stressLevel]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubMode('faulting')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
            subMode === 'faulting'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          Faulting: East African Rift Valley (Graben) &amp; Block Mountain (Horst)
        </button>
        <button
          type="button"
          onClick={() => setSubMode('folding')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
            subMode === 'folding'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          Compressional Folding (Anticline, Syncline &amp; Overthrust)
        </button>
        <button
          type="button"
          onClick={() => setSubMode('vulcanicity')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border cursor-pointer ${
            subMode === 'vulcanicity'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          Vulcanicity (Intrusive &amp; Extrusive) &amp; Seismic Waves
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div
          className={`lg:col-span-8 rounded-2xl border p-5 space-y-4 ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {subMode === 'faulting' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-black">
                  {faultStructure === 'rift_valley'
                    ? 'East African Rift Valley (Graben) — Tensional / Compressional Faulting'
                    : 'Block Mountain (Horst — e.g. Mt. Ruwenzori, Usambara & Pare)'}
                </h3>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFaultStructure('rift_valley')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      faultStructure === 'rift_valley'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Rift Valley (Graben)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFaultStructure('horst_block')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      faultStructure === 'horst_block'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Block Mountain (Horst)
                  </button>
                </div>
              </div>

              <svg viewBox="0 0 600 265" className="w-full rounded-xl bg-sky-950/30 border border-slate-300 dark:border-slate-800">
                {(() => {
                  const drop = (stressLevel / 100) * 58;
                  const midOffset = faultStructure === 'rift_valley' ? drop : -drop;
                  const layers = [
                    { y: 95, h: 32, color: '#65a30d', name: 'Topsoil & Sedimentary Sandstone' },
                    { y: 127, h: 36, color: '#d97706', name: 'Limestone & Shale Stratum' },
                    { y: 163, h: 52, color: '#78350f', name: 'Metamorphic Basement Rock' },
                  ];
                  return (
                    <g>
                      {/* Left Crustal Block */}
                      {layers.map((l, i) => (
                        <polygon
                          key={`L-${i}`}
                          points={`30,${l.y} 205,${l.y} 225,${l.y + l.h} 30,${l.y + l.h}`}
                          fill={l.color}
                          stroke="#1e293b"
                        />
                      ))}

                      {/* Right Crustal Block */}
                      {layers.map((l, i) => (
                        <polygon
                          key={`R-${i}`}
                          points={`395,${l.y} 570,${l.y} 570,${l.y + l.h} 375,${l.y + l.h}`}
                          fill={l.color}
                          stroke="#1e293b"
                        />
                      ))}

                      {/* Central Faulted Block (Graben sinks or Horst rises) */}
                      {layers.map((l, i) => (
                        <polygon
                          key={`C-${i}`}
                          points={`205,${l.y + midOffset} 395,${l.y + midOffset} 375,${l.y + l.h + midOffset} 225,${l.y + l.h + midOffset}`}
                          fill={l.color}
                          stroke="#0f172a"
                          strokeWidth="1.5"
                        />
                      ))}

                      {/* Rift Valley Lake water if graben */}
                      {faultStructure === 'rift_valley' && drop > 22 && (
                        <g>
                          <polygon
                            points={`212,${95 + midOffset} 388,${95 + midOffset} 392,${95 + midOffset - 18} 208,${95 + midOffset - 18}`}
                            fill="rgba(14, 165, 233, 0.72)"
                          />
                          <text
                            x="300"
                            y={95 + midOffset - 5}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize="10"
                            fontWeight="bold"
                          >
                            Rift Valley Lake (e.g. Lake Tanganyika / Nyasa)
                          </text>
                        </g>
                      )}

                      {/* Fault Plane Lines */}
                      <line x1="198" y1="65" x2="235" y2="235" stroke="#ef4444" strokeWidth="2.8" strokeDasharray="5 3" />
                      <line x1="402" y1="65" x2="365" y2="235" stroke="#ef4444" strokeWidth="2.8" strokeDasharray="5 3" />

                      <text x="300" y="34" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold">
                        {faultStructure === 'rift_valley'
                          ? `RIFT VALLEY FLOOR (GRABEN) — Subsided by ${Math.round(drop * 18)} m`
                          : `HORST BLOCK MOUNTAIN — Uplifted by ${Math.round(drop * 18)} m`}
                      </text>
                      <text x="115" y="82" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                        Fault Escarpment
                      </text>
                      <text x="485" y="82" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                        Fault Escarpment
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </>
          )}

          {subMode === 'folding' && (
            <>
              <h3 className="text-sm sm:text-base font-black">{foldClassification}</h3>
              <svg viewBox="0 0 600 260" className="w-full rounded-xl bg-slate-950 border border-slate-800">
                {[0, 1, 2, 3].map((layerIdx) => {
                  const baseY = 95 + layerIdx * 28;
                  const colors = ['#84cc16', '#eab308', '#d97706', '#9a3412'];
                  const amp = 10 + (stressLevel / 100) * 52;
                  const skew = stressLevel > 30 ? ((stressLevel - 30) / 70) * 38 : 0;

                  const pts: string[] = [];
                  for (let i = 0; i <= 60; i++) {
                    const t = i / 60;
                    const phase = t * Math.PI * 3;
                    const x = 40 + t * 520 + Math.sin(phase) * skew;
                    const y = baseY - Math.sin(phase) * amp;
                    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                  }
                  return (
                    <polyline
                      key={layerIdx}
                      fill="none"
                      stroke={colors[layerIdx]}
                      strokeWidth="22"
                      strokeLinecap="round"
                      points={pts.join(' ')}
                    />
                  );
                })}
                <text x="130" y="34" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="bold">
                  ▲ ANTICLINE (Upfold Crest)
                </text>
                <text x="300" y="244" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                  ▼ SYNCLINE (Downfold Trough)
                </text>
                <text x="470" y="34" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="bold">
                  ▲ ANTICLINE (Fold Mountain)
                </text>
              </svg>
            </>
          )}

          {subMode === 'vulcanicity' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-black">
                  Intrusive &amp; Extrusive Vulcanicity + Earthquake Focus &amp; Epicenter
                </h3>
                <button
                  type="button"
                  onClick={() => setSeismicPulse(4)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Trigger Seismic P, S &amp; L Waves
                </button>
              </div>
              <svg viewBox="0 0 600 275" className="w-full rounded-xl bg-slate-950 border border-slate-800">
                {/* Underground Strata */}
                <rect x="0" y="135" width="600" height="45" fill="#78350f" />
                <rect x="0" y="180" width="600" height="45" fill="#451a03" />
                <rect x="0" y="225" width="600" height="50" fill="#290f02" />

                {/* Composite Volcano Cone (Mt. Kilimanjaro style) */}
                <polygon points="180,135 285,38 335,38 440,135" fill="#57534e" stroke="#a8a29e" />
                {/* Crater at summit */}
                <ellipse cx="310" cy="38" rx="25" ry="6" fill="#ea580c" />

                {/* Deep Magma Chamber / Batholith */}
                <path d="M 190 275 Q 310 215 430 275 Z" fill="#dc2626" />
                <text x="310" y="264" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                  BATHOLITH / MAGMA CHAMBER
                </text>

                {/* Main Vent Pipe */}
                <rect x="303" y="38" width="14" height="205" fill="#ef4444" />
                {/* Horizontal Sill */}
                <rect x="125" y="174" width="178" height="10" rx="3" fill="#f97316" />
                <text x="175" y="168" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="bold">
                  SILL (Horizontal Sheet)
                </text>
                {/* Vertical Dyke */}
                <polygon points="210,235 220,235 235,140 225,140" fill="#f97316" />
                <text x="180" y="205" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="bold">
                  DYKE (Vertical)
                </text>
                {/* Dome-shaped Laccolith */}
                <path d="M 355 175 Q 405 142 455 175 Z" fill="#f97316" />
                <text x="435" y="152" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="bold">
                  LACCOLITH (Dome)
                </text>
                {/* Parasitic Cone */}
                <polygon points="340,92 385,68 405,112" fill="#78716c" />
                <line x1="312" y1="108" x2="383" y2="70" stroke="#ef4444" strokeWidth="4" />
                <text x="438" y="75" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">
                  Parasitic Cone
                </text>

                {/* Earthquake Focus & Epicenter Waves */}
                <circle cx="490" cy="200" r="6" fill="#fde047" />
                <text x="490" y="218" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                  FOCUS (Hypocenter)
                </text>
                <circle cx="490" cy="135" r="5" fill="#38bdf8" />
                <text x="490" y="123" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                  EPICENTER (Surface)
                </text>
                {seismicPulse > 0 && (
                  <>
                    <circle
                      cx="490"
                      cy="200"
                      r={seismicPulse * 1.4}
                      fill="none"
                      stroke="#fde047"
                      strokeWidth="2"
                    />
                    <circle
                      cx="490"
                      cy="200"
                      r={seismicPulse * 0.85}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  </>
                )}
              </svg>
            </>
          )}

          {/* Force / Displacement Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Tectonic Stress / Crustal Displacement Intensity</span>
              <span className="font-mono">{stressLevel}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right 4 Cols: NECTA Study Notes */}
        <div
          className={`lg:col-span-4 rounded-2xl border p-4 space-y-3 text-xs ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            NECTA Landform Reference
          </div>
          <div className="space-y-2 leading-relaxed">
            <p>
              <strong>1. East African Rift Valley (Graben):</strong> Formed when the central crustal block subsides between two parallel normal faults (tensional theory) or when side blocks override a central block (compressional theory). Contains steep fault scarps and deep lakes (Tanganyika, Nyasa, Turkana).
            </p>
            <p>
              <strong>2. Block Mountains (Horst):</strong> Formed when a central block is uplifted between parallel faults or side blocks sink. Examples in East Africa: <strong>Mt. Ruwenzori</strong> (Uganda/DRC), <strong>Usambara</strong> and <strong>Pare Mountains</strong> (Tanzania).
            </p>
            <p>
              <strong>3. Intrusive vs. Extrusive Vulcanicity:</strong>
              <br />• <em>Intrusive (Hypabyssal/Plutonic):</em> Sill (bedding-parallel), Dyke (cuts across strata), Laccolith (mushroom dome), Lopolith (saucer), Batholith (deep granitic core).
              <br />• <em>Extrusive:</em> Acid lava dome, Basic shield volcano, Composite stratovolcano (Mt. Kilimanjaro, Mt. Meru), Caldera (Ngorongoro Crater).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
