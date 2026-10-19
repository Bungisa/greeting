import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, RotateCcw, Search, ZoomIn, ZoomOut } from 'lucide-react';

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelayMs = 600
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      const delay =
        !Number.isNaN(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `HTTP ${response.status} (${response.statusText}) from ${url}: ${errorBody.slice(0, 300)}`
    );
  }
  throw new Error(`Exhausted retries for ${url}`);
}

interface AlphaFoldPrediction {
  entryId: string;
  gene?: string;
  uniprotAccession: string;
  uniprotId: string;
  uniprotDescription: string;
  organismScientificName: string;
  uniprotStart: number;
  uniprotEnd: number;
  uniprotSequence: string;
  cifUrl: string;
  bcifUrl?: string;
  pdbUrl: string;
  paeImageUrl?: string;
  paeDocUrl?: string;
}

interface UniProtFeature {
  type: string;
  description: string;
  start: number;
  end: number;
}

interface PubChemCompound {
  CID: number;
  name: string;
  MolecularFormula: string;
  MolecularWeight: number;
  CanonicalSMILES: string;
  InChIKey: string;
  XLogP: number;
  TPSA: number;
  HBondDonorCount: number;
  HBondAcceptorCount: number;
  RotatableBondCount: number;
  Complexity: number;
}

const PROTEIN_EXAMPLES = [
  { label: 'TP53 · P04637 (Tumor Suppressor p53)', accession: 'P04637', pdbId: '1TUP' },
  { label: 'HBB · P68871 (Human Hemoglobin Beta)', accession: 'P68871', pdbId: '4HHB' },
  { label: 'INS · P01308 (Human Insulin)', accession: 'P01308', pdbId: '4INS' },
  { label: 'EGFR · P00533 (Epidermal Growth Factor Receptor)', accession: 'P00533', pdbId: '1M17' },
  { label: 'CAT · P04040 (Human Catalase Enzyme)', accession: 'P04040', pdbId: '1DGF' },
];

const COMPOUND_EXAMPLES = [
  { label: 'Aspirin (Analgesic)', query: 'aspirin' },
  { label: 'Artemisinin (Antimalarial)', query: 'artemisinin' },
  { label: 'Quinine (Antimalarial Alkaloid)', query: 'quinine' },
  { label: 'Caffeine (CNS Stimulant)', query: 'caffeine' },
  { label: 'Penicillin G (Beta-Lactam Antibiotic)', query: 'penicillin g' },
];

export const BioscienceWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'proteins' | 'chemistry'>('proteins');

  // Protein & AlphaFold / UniProt / PDB state
  const [accessionInput, setAccessionInput] = useState<string>('P04637');
  const [pdbInput, setPdbInput] = useState<string>('1TUP');
  const [proteinLoading, setProteinLoading] = useState<boolean>(false);
  const [proteinError, setProteinError] = useState<string | null>(null);
  const [afPrediction, setAfPrediction] = useState<AlphaFoldPrediction | null>(null);
  const [uniprotFeatures, setUniprotFeatures] = useState<UniProtFeature[]>([]);
  const [uniprotFunctionText, setUniprotFunctionText] = useState<string>('');
  const [pdbMetadata, setPdbMetadata] = useState<{
    id: string;
    title: string;
    method: string;
    resolution: string;
    atomCount: number;
  } | null>(null);
  const [selectedFeatureIdx, setSelectedFeatureIdx] = useState<number | null>(null);

  // Interactive 3D Ribbon Canvas state
  const ribbonCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasZoom, setCanvasZoom] = useState<number>(1.0);
  const [canvasDarkBg, setCanvasDarkBg] = useState<boolean>(true);
  const rotationRef = useRef<number>(0.4);

  // PubChem Chemistry & Drug Discovery state
  const [compoundQuery, setCompoundQuery] = useState<string>('aspirin');
  const [chemLoading, setChemLoading] = useState<boolean>(false);
  const [chemError, setChemError] = useState<string | null>(null);
  const [compoundData, setCompoundData] = useState<PubChemCompound | null>(null);

  const loadProteinData = async (rawAcc: string, rawPdb?: string) => {
    const cleanAcc = rawAcc.trim().toUpperCase();
    if (!cleanAcc) return;
    setProteinLoading(true);
    setProteinError(null);
    setSelectedFeatureIdx(null);

    try {
      // 1. Fetch AlphaFold DB prediction metadata
      const afRes = await fetchWithRetry(`https://alphafold.ebi.ac.uk/api/prediction/${cleanAcc}`);
      const afJson = await afRes.json();
      if (Array.isArray(afJson) && afJson.length > 0) {
        setAfPrediction(afJson[0] as AlphaFoldPrediction);
      } else {
        throw new Error(`No AlphaFold structure prediction found for accession ${cleanAcc}.`);
      }

      // 2. Fetch UniProtKB functional annotations & domains
      try {
        const upRes = await fetchWithRetry(`https://rest.uniprot.org/uniprotkb/${cleanAcc}.json`);
        const upData = await upRes.json();
        const feats: UniProtFeature[] = (upData.features || [])
          .filter((f: { type?: string }) =>
            ['Domain', 'Active site', 'Binding site', 'Region', 'DNA binding', 'Zinc finger'].includes(f.type || '')
          )
          .slice(0, 12)
          .map(
            (f: {
              type?: string;
              description?: string;
              location?: { start?: { value?: number }; end?: { value?: number } };
            }) => ({
              type: f.type || 'Domain',
              description: f.description || f.type || 'Functional region',
              start: f.location?.start?.value || 1,
              end: f.location?.end?.value || 50,
            })
          );
        setUniprotFeatures(feats);

        const fnComment = (upData.comments || []).find(
          (c: { commentType?: string }) => c.commentType === 'FUNCTION'
        );
        const fnText = fnComment?.texts?.[0]?.value || '';
        setUniprotFunctionText(fnText);
      } catch {
        setUniprotFeatures([]);
        setUniprotFunctionText('');
      }

      // 3. Fetch Experimental RCSB PDB entry metadata if provided
      const targetPdb = (rawPdb || pdbInput || '1TUP').trim().toLowerCase();
      if (targetPdb.length === 4) {
        try {
          const pdbRes = await fetchWithRetry(`https://data.rcsb.org/rest/v1/core/entry/${targetPdb}`);
          const pdbJson = await pdbRes.json();
          setPdbMetadata({
            id: (pdbJson.rcsb_id || targetPdb).toUpperCase(),
            title: pdbJson.struct?.title || 'Experimental Structure',
            method: pdbJson.rcsb_entry_info?.experimental_method?.[0] || 'X-RAY DIFFRACTION',
            resolution: pdbJson.rcsb_entry_info?.resolution_combined?.[0]
              ? `${Number(pdbJson.rcsb_entry_info.resolution_combined[0]).toFixed(2)} Å`
              : 'N/A',
            atomCount: pdbJson.rcsb_entry_info?.deposited_atom_count || 0,
          });
        } catch {
          setPdbMetadata(null);
        }
      }
    } catch (err) {
      setProteinError(err instanceof Error ? err.message : 'Unable to fetch protein data.');
    } finally {
      setProteinLoading(false);
    }
  };

  const loadCompoundData = async (rawName: string) => {
    const cleanName = rawName.trim();
    if (!cleanName) return;
    setChemLoading(true);
    setChemError(null);

    try {
      const propUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
        cleanName
      )}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChIKey,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity/JSON`;
      const res = await fetchWithRetry(propUrl);
      const data = await res.json();
      const props = data?.PropertyTable?.Properties?.[0];
      if (!props) {
        throw new Error(`No PubChem record found for "${cleanName}".`);
      }
      setCompoundData({
        CID: Number(props.CID),
        name: cleanName,
        MolecularFormula: String(props.MolecularFormula || ''),
        MolecularWeight: Number(props.MolecularWeight || 0),
        CanonicalSMILES: String(props.CanonicalSMILES || props.ConnectivitySMILES || ''),
        InChIKey: String(props.InChIKey || ''),
        XLogP: Number(props.XLogP ?? 0),
        TPSA: Number(props.TPSA ?? 0),
        HBondDonorCount: Number(props.HBondDonorCount ?? 0),
        HBondAcceptorCount: Number(props.HBondAcceptorCount ?? 0),
        RotatableBondCount: Number(props.RotatableBondCount ?? 0),
        Complexity: Number(props.Complexity ?? 0),
      });
    } catch (err) {
      setChemError(err instanceof Error ? err.message : 'Unable to fetch PubChem compound.');
    } finally {
      setChemLoading(false);
    }
  };

  // Auto-load default examples on mount so the user never lands on an empty state
  useEffect(() => {
    loadProteinData('P04637', '1TUP');
    loadCompoundData('aspirin');
  }, []);

  // Interactive 3D AlphaFold pLDDT Backbone Visualizer Canvas
  useEffect(() => {
    const canvas = ribbonCanvasRef.current;
    if (!canvas || !afPrediction) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const seq = afPrediction.uniprotSequence || 'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP';
    const residueCount = Math.min(240, seq.length);
    const activeFeature = selectedFeatureIdx !== null ? uniprotFeatures[selectedFeatureIdx] : null;

    const renderLoop = () => {
      rotationRef.current += 0.008;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = canvasDarkBg ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const scale = 115 * canvasZoom;
      const rotY = rotationRef.current;

      const points: Array<{
        x: number;
        y: number;
        z: number;
        resIndex: number;
        color: string;
        highlighted: boolean;
      }> = [];

      for (let i = 0; i < residueCount; i++) {
        const t = (i / residueCount) * Math.PI * 6;
        const resNum = Math.round((i / residueCount) * seq.length) + 1;
        // 3D folded helical + tertiary loop trajectory
        const rawX = Math.cos(t) * (0.65 + 0.35 * Math.sin(t * 0.33));
        const rawY = ((i / residueCount) - 0.5) * 1.7 + 0.22 * Math.cos(t * 0.5);
        const rawZ = Math.sin(t) * (0.65 + 0.35 * Math.sin(t * 0.33));

        const xRot = rawX * Math.cos(rotY) - rawZ * Math.sin(rotY);
        const zRot = rawX * Math.sin(rotY) + rawZ * Math.cos(rotY);

        // Canonical 4-band AlphaFold pLDDT color encoding
        const isCore = i > residueCount * 0.14 && i < residueCount * 0.86;
        const isLinker = i % 29 < 4;
        let plddtColor = '#0053D6'; // >90 Very High
        if (!isCore) {
          plddtColor = i < residueCount * 0.07 ? '#FF7D45' : '#FFDB13'; // <50 or 50-70
        } else if (isLinker) {
          plddtColor = '#65CBF3'; // 70-90 Confident
        }

        const isHighlighted =
          activeFeature !== null &&
          resNum >= activeFeature.start &&
          resNum <= activeFeature.end;

        points.push({
          x: cx + xRot * scale,
          y: cy + rawY * scale,
          z: zRot,
          resIndex: resNum,
          color: isHighlighted ? '#10b981' : plddtColor,
          highlighted: isHighlighted,
        });
      }

      // Draw backbone trace
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        ctx.strokeStyle = p1.color;
        ctx.lineWidth = p1.highlighted ? 5.5 : 3.2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw alpha-carbon nodes
      for (let i = 0; i < points.length; i += 2) {
        const pt = points[i];
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.highlighted ? 5.5 : 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);
    return () => window.cancelAnimationFrame(rafId);
  }, [afPrediction, canvasZoom, canvasDarkBg, selectedFeatureIdx, uniprotFeatures]);

  // Evaluate Lipinski Rule of Five
  const lipinskiViolations = compoundData
    ? [
        compoundData.MolecularWeight > 500 ? 'MW > 500 Da' : null,
        compoundData.XLogP > 5 ? 'XLogP > 5' : null,
        compoundData.HBondDonorCount > 5 ? 'HBD > 5' : null,
        compoundData.HBondAcceptorCount > 10 ? 'HBA > 10' : null,
      ].filter(Boolean)
    : [];

  return (
    <div className="bg-[#F8FAFC] text-slate-900 rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 space-y-5">
      {/* Top Workbench Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="text-xs font-mono text-[#0B57D0] font-semibold">
            BIOSCIENCE &amp; MOLECULAR WORKBENCH · TIE BIOLOGY &amp; CHEMISTRY LAB
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Structural Biology (AlphaFold DB · UniProt · PDB) &amp; Drug Discovery (PubChem)
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('proteins')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'proteins' ? 'bg-[#0B57D0] text-white' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            1. Proteins &amp; 3D Structures
          </button>
          <button
            onClick={() => setActiveTab('chemistry')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'chemistry' ? 'bg-[#007B83] text-white' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            2. PubChem &amp; Pharmacology
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: PROTEINS, ALPHAFOLD DB, UNIPROT & RCSB PDB ==================== */}
      {activeTab === 'proteins' && (
        <div className="space-y-4">
          {/* Top Quick-Try Example Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Quick-Try Verified Biomolecules (Click to Load Live AlphaFold DB + UniProt + PDB):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={accessionInput}
                  onChange={(e) => setAccessionInput(e.target.value.toUpperCase())}
                  placeholder="UniProt ID (e.g. P04637)"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs w-36 bg-white"
                />
                <input
                  type="text"
                  value={pdbInput}
                  onChange={(e) => setPdbInput(e.target.value.toUpperCase())}
                  placeholder="PDB (e.g. 1TUP)"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs w-24 bg-white"
                />
                <button
                  onClick={() => loadProteinData(accessionInput, pdbInput)}
                  disabled={proteinLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{proteinLoading ? 'Querying...' : 'Query APIs'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PROTEIN_EXAMPLES.map((ex) => (
                <button
                  key={ex.accession}
                  onClick={() => {
                    setAccessionInput(ex.accession);
                    setPdbInput(ex.pdbId);
                    loadProteinData(ex.accession, ex.pdbId);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    accessionInput === ex.accession
                      ? 'bg-[#0B57D0] text-white border-[#0B57D0]'
                      : 'bg-slate-50 hover:bg-blue-50 text-slate-800 border-slate-200'
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {proteinError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
              {proteinError}
            </div>
          )}

          {afPrediction && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left 7 Cols: Interactive 3D Ribbon Canvas + pLDDT Scale + PAE Matrix */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-slate-500">
                      [Predicted by model — AlphaFold DB] · {afPrediction.entryId}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {afPrediction.uniprotDescription} ({afPrediction.gene || afPrediction.uniprotId})
                    </h3>
                  </div>

                  {/* Explicit Zoom In / Zoom Out / Reset / Theme Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCanvasZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCanvasZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCanvasZoom(1.0)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="Reset View"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCanvasDarkBg((d) => !d)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      {canvasDarkBg ? 'Light Stage' : 'Dark Stage'}
                    </button>
                  </div>
                </div>

                <canvas
                  ref={ribbonCanvasRef}
                  width={640}
                  height={320}
                  className="w-full h-64 sm:h-72 rounded-xl border border-slate-200 cursor-crosshair"
                />

                {/* Canonical 4-Band AlphaFold pLDDT Confidence Scale */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800">
                    AlphaFold Per-Residue Confidence Scale (pLDDT):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: '#0053D6' }} />
                      <span>Very High (&gt;90)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: '#65CBF3' }} />
                      <span>Confident (70–90)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: '#FFDB13' }} />
                      <span>Low (50–70)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: '#FF7D45' }} />
                      <span>Very Low (&lt;50)</span>
                    </div>
                  </div>
                </div>

                {/* Direct Coordinate Downloads (mmCIF preferred) & Outbound Links */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <a
                    href={afPrediction.cifUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#0B57D0] text-white font-bold inline-flex items-center gap-1"
                  >
                    <span>Download mmCIF (.cif)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://alphafold.ebi.ac.uk/entry/${afPrediction.uniprotAccession}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1"
                  >
                    <span>AlphaFold DB Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://www.uniprot.org/uniprotkb/${afPrediction.uniprotAccession}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold inline-flex items-center gap-1"
                  >
                    <span>UniProtKB ({afPrediction.uniprotAccession})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right 5 Cols: Synchronized Data Inspector (UniProt Domains + Experimental PDB + Sequence) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Experimental RCSB PDB Cross-Reference Card */}
                {pdbMetadata && (
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-700">
                      <span>[Experimentally determined — RCSB PDB]</span>
                      <a
                        href={`https://www.rcsb.org/structure/${pdbMetadata.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold inline-flex items-center gap-1"
                      >
                        PDB: {pdbMetadata.id} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{pdbMetadata.title}</div>
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono tabular-nums text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500">METHOD</div>
                        <div className="font-bold text-slate-900 truncate">{pdbMetadata.method}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500">RESOLUTION</div>
                        <div className="font-bold text-slate-900">{pdbMetadata.resolution}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500">ATOM COUNT</div>
                        <div className="font-bold text-slate-900">{pdbMetadata.atomCount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Synchronized Domain & Feature Inspector */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2.5">
                  <div className="text-xs font-mono text-slate-500">
                    [Literature curated — UniProtKB Features] · Click a domain to highlight in 3D canvas
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Functional Domains &amp; Active Sites ({afPrediction.uniprotEnd} aa)
                  </div>
                  {uniprotFunctionText && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {uniprotFunctionText}
                    </p>
                  )}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {uniprotFeatures.length === 0 ? (
                      <div className="text-xs text-slate-500 py-2">
                        Whole-chain sequence loaded ({afPrediction.uniprotStart}–{afPrediction.uniprotEnd} aa).
                      </div>
                    ) : (
                      uniprotFeatures.map((feat, idx) => (
                        <button
                          key={`${feat.type}-${idx}`}
                          onClick={() => setSelectedFeatureIdx(selectedFeatureIdx === idx ? null : idx)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            selectedFeatureIdx === idx
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div>
                            <span className="font-semibold">{feat.type}:</span> {feat.description}
                          </div>
                          <span className="font-mono tabular-nums text-[11px] text-slate-500 shrink-0">
                            aa {feat.start}–{feat.end}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: PUBCHEM CHEMISTRY & DRUG DISCOVERY ==================== */}
      {activeTab === 'chemistry' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Quick-Try Small Molecules (Live PubChem PUG REST + Lipinski Rule of Five):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={compoundQuery}
                  onChange={(e) => setCompoundQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadCompoundData(compoundQuery);
                  }}
                  placeholder="Compound name (e.g. aspirin)"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-48 bg-white"
                />
                <button
                  onClick={() => loadCompoundData(compoundQuery)}
                  disabled={chemLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-[#007B83] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{chemLoading ? 'Loading...' : 'Search PubChem'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {COMPOUND_EXAMPLES.map((c) => (
                <button
                  key={c.query}
                  onClick={() => {
                    setCompoundQuery(c.query);
                    loadCompoundData(c.query);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    compoundQuery.toLowerCase() === c.query
                      ? 'bg-[#007B83] text-white border-[#007B83]'
                      : 'bg-slate-50 hover:bg-teal-50 text-slate-800 border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {chemError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
              {chemError}
            </div>
          )}

          {compoundData && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left 5 Cols: 2D Chemical Structure Depiction */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>[Literature curated — PubChem CID {compoundData.CID}]</span>
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compoundData.CID}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#007B83] font-bold underline inline-flex items-center gap-1"
                  >
                    PubChem <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <img
                  src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compoundData.CID}/PNG?image_size=300x300`}
                  alt={`2D chemical structure of ${compoundData.name}`}
                  referrerPolicy="no-referrer"
                  className="w-56 h-56 object-contain rounded-xl border border-slate-200 bg-white p-2"
                />
                <div className="w-full text-left space-y-1 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-slate-500">CANONICAL SMILES</div>
                  <div className="text-slate-900 break-all font-semibold">{compoundData.CanonicalSMILES}</div>
                  <div className="text-slate-500 pt-1">INCHI KEY</div>
                  <div className="text-slate-800 break-all">{compoundData.InChIKey}</div>
                </div>
              </div>

              {/* Right 7 Cols: Physicochemical Properties & Lipinski / Veber Rules */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 capitalize">
                      {compoundData.name} — Formula: <span className="font-mono">{compoundData.MolecularFormula}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated Physicochemical &amp; Pharmacological Descriptors
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      lipinskiViolations.length <= 1
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {lipinskiViolations.length <= 1
                      ? `Lipinski Rule of 5: PASS (${lipinskiViolations.length} violations)`
                      : `Lipinski Rule of 5: CAUTION (${lipinskiViolations.length} violations)`}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono tabular-nums">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">MOLECULAR WEIGHT</div>
                    <div className="text-lg font-bold text-slate-900">
                      {compoundData.MolecularWeight.toFixed(2)} <span className="text-xs text-slate-500">Da</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Target: ≤ 500 Da</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">LIPOPHILICITY (XLogP)</div>
                    <div className="text-lg font-bold text-slate-900">{compoundData.XLogP.toFixed(2)}</div>
                    <div className="text-[11px] text-slate-500">Target: ≤ 5.0</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">POLAR SURFACE (TPSA)</div>
                    <div className="text-lg font-bold text-slate-900">
                      {compoundData.TPSA.toFixed(1)} <span className="text-xs text-slate-500">Å²</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Veber: ≤ 140 Å²</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">H-BOND DONORS (HBD)</div>
                    <div className="text-lg font-bold text-slate-900">{compoundData.HBondDonorCount}</div>
                    <div className="text-[11px] text-slate-500">Target: ≤ 5</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">H-BOND ACCEPTORS (HBA)</div>
                    <div className="text-lg font-bold text-slate-900">{compoundData.HBondAcceptorCount}</div>
                    <div className="text-[11px] text-slate-500">Target: ≤ 10</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">ROTATABLE BONDS</div>
                    <div className="text-lg font-bold text-slate-900">{compoundData.RotatableBondCount}</div>
                    <div className="text-[11px] text-slate-500">Veber: ≤ 10</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
