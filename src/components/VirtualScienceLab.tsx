import React, { useEffect, useMemo, useState } from 'react';
import {
  Beaker,
  CheckCircle2,
  FlaskConical,
  Gauge,
  Microscope,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MathText } from '../utils/mathRenderer';

export interface VirtualScienceLabProps {
  activeClass?: string;
  onLaunchPracticalQuiz?: (cls: string, subject: string, topic: string) => void;
}

type ScienceSubjectTab = 'chemistry' | 'physics' | 'biology';

interface TitrationRow {
  runLabel: 'Pilot' | '1' | '2' | '3';
  initialReading: number;
  finalReading: number | null;
  volumeUsed: number | null;
}

interface PendulumRow {
  lengthCm: number;
  time20Osc: number | null;
  periodT: number | null;
  tSquared: number | null;
}

interface OhmRow {
  id: number;
  rheostatOhm: number;
  currentAmp: number;
  voltageVolt: number;
}

interface FoodTestLog {
  id: string;
  sampleName: string;
  foodTested: string;
  procedure: string;
  observation: string;
  inference: string;
  tubeColorHex: string;
}

const QUALITATIVE_SALTS = [
  {
    id: 'Q1',
    code: 'Sample Q1',
    formula: '\\text{CuSO}_4 \\cdot 5\\text{H}_2\\text{O}',
    cation: '\\text{Cu}^{2+}\\text{ (Copper(II) ion)}',
    anion: '\\text{SO}_4^{2-}\\text{ (Sulphate ion)}',
    steps: [
      {
        experiment: '1. Appearance of solid sample Q1',
        observation: 'Blue crystalline solid',
        inference: 'Hydrated transition metal salt ($\\text{Cu}^{2+}$ suspected)',
      },
      {
        experiment: '2. Heat a dry sample of Q1 gently then strongly in a dry test tube',
        observation: 'Colourless liquid droplets condense on cooler upper part of tube; blue solid turns white',
        inference: 'Water of crystallization present ($\\text{Hydrated salt}$)',
      },
      {
        experiment: '3. Dissolve Q1 in distilled water and add $\\text{NaOH}(aq)$ dropwise until in excess',
        observation: 'Pale blue precipitate formed, insoluble in excess $\\text{NaOH}(aq)$',
        inference: '$\\text{Cu}^{2+}$ ion present',
      },
      {
        experiment: '4. To a second portion of Q1 solution, add aqueous ammonia ($\\text{NH}_3(aq)$) dropwise then in excess',
        observation: 'Pale blue precipitate soluble in excess $\\text{NH}_3(aq)$ to form a deep royal-blue solution',
        inference: '$\\text{Cu}^{2+}$ confirmed ($[\\text{Cu(NH}_3)_4]^{2+}$ complex)',
      },
      {
        experiment: '5. To a third portion of Q1 solution, add $\\text{BaCl}_2(aq)$ followed by dilute $\\text{HCl}$',
        observation: 'Thick white precipitate formed which is insoluble in dilute $\\text{HCl}$',
        inference: '$\\text{SO}_4^{2-}$ confirmed ($\\text{BaSO}_4(s)$)',
      },
    ],
  },
  {
    id: 'Q2',
    code: 'Sample Q2',
    formula: '\\text{FeSO}_4 \\cdot 7\\text{H}_2\\text{O}',
    cation: '\\text{Fe}^{2+}\\text{ (Iron(II) ion)}',
    anion: '\\text{SO}_4^{2-}\\text{ (Sulphate ion)}',
    steps: [
      {
        experiment: '1. Appearance of solid sample Q2',
        observation: 'Pale green crystalline solid',
        inference: '$\\text{Fe}^{2+}$ salt suspected',
      },
      {
        experiment: '2. Add dilute $\\text{NaOH}(aq)$ dropwise and then in excess to aqueous Q2',
        observation: 'Dirty green precipitate formed, insoluble in excess $\\text{NaOH}$, turning reddish-brown on standing in air',
        inference: '$\\text{Fe}^{2+}$ ion present (oxidizes to $\\text{Fe}^{3+}$ on exposure to air)',
      },
      {
        experiment: '3. Add potassium hexacyanoferrate(III) ($\\text{K}_3[\\text{Fe(CN)}_6]$) solution to Q2',
        observation: 'Deep dark-blue (Turnbull’s blue) precipitate formed',
        inference: '$\\text{Fe}^{2+}$ ion confirmed',
      },
      {
        experiment: '4. Add $\\text{BaCl}_2(aq)$ followed by dilute $\\text{HCl}$ to aqueous Q2',
        observation: 'White precipitate insoluble in dilute $\\text{HCl}$',
        inference: '$\\text{SO}_4^{2-}$ ion confirmed',
      },
    ],
  },
  {
    id: 'Q3',
    code: 'Sample Q3',
    formula: '\\text{ZnCO}_3',
    cation: '\\text{Zn}^{2+}\\text{ (Zinc(II) ion)}',
    anion: '\\text{CO}_3^{2-}\\text{ (Carbonate ion)}',
    steps: [
      {
        experiment: '1. Appearance of solid sample Q3',
        observation: 'White amorphous powder',
        inference: 'Transition metal ions ($\\text{Cu}^{2+}, \\text{Fe}^{2+}, \\text{Fe}^{3+}$) absent',
      },
      {
        experiment: '2. Heat solid Q3 strongly in a dry test tube',
        observation: 'Residue turns yellow when hot and white when cold; evolved gas turns limewater milky',
        inference: '$\\text{ZnO}$ residue ($\\text{Zn}^{2+}$ suspected); $\\text{CO}_2$ gas from $\\text{CO}_3^{2-}$',
      },
      {
        experiment: '3. Add dilute $\\text{HCl}$ to solid Q3 and pass gas through limewater ($\\text{Ca(OH)}_2$)',
        observation: 'Brisk effervescence of a colourless, odourless gas that turns limewater milky',
        inference: '$\\text{CO}_3^{2-}$ confirmed',
      },
      {
        experiment: '4. To the resulting solution, add $\\text{NaOH}(aq)$ dropwise then in excess, and repeat with $\\text{NH}_3(aq)$',
        observation: 'White gelatinous precipitate soluble in both excess $\\text{NaOH}(aq)$ and excess $\\text{NH}_3(aq)$',
        inference: '$\\text{Zn}^{2+}$ confirmed',
      },
    ],
  },
  {
    id: 'Q4',
    code: 'Sample Q4',
    formula: '\\text{NH}_4\\text{Cl}',
    cation: '\\text{NH}_4^+\\text{ (Ammonium ion)}',
    anion: '\\text{Cl}^-\\text{ (Chloride ion)}',
    steps: [
      {
        experiment: '1. Heat solid sample Q4 in a dry test tube',
        observation: 'White solid sublimes and re-forms as a white sublimate on cooler upper walls of the tube',
        inference: 'Ammonium salt ($\\text{NH}_4^+$) suspected',
      },
      {
        experiment: '2. Warm Q4 solution with dilute $\\text{NaOH}(aq)$ and test gas with moist red litmus & $\\text{HCl}$ stopper',
        observation: 'Colourless gas with choking pungent smell turns moist red litmus paper blue and forms dense white fumes with $\\text{HCl}$',
        inference: '$\\text{NH}_3$ gas evolved; $\\text{NH}_4^+$ confirmed',
      },
      {
        experiment: '3. Add dilute $\\text{HNO}_3$ followed by aqueous $\\text{AgNO}_3$, then excess $\\text{NH}_3(aq)$',
        observation: 'Thick white curdy precipitate insoluble in dilute $\\text{HNO}_3$ but soluble in excess $\\text{NH}_3(aq)$',
        inference: '$\\text{Cl}^-$ confirmed ($\\text{AgCl}(s)$)',
      },
    ],
  },
];

const BIOLOGY_SPECIMENS = [
  {
    code: 'Specimen A (Funaria / Moss)',
    kingdom: 'Kingdom Plantae',
    division: 'Division Bryophyta',
    className: 'Class Musci (Bryopsida)',
    features: [
      'Non-vascular plant lacking true xylem and phloem',
      'Possesses rhizoids instead of true roots for anchorage',
      'Shows alternation of generations with a dominant gametophyte stage and stalked sporophyte capsule',
    ],
    adaptation: 'Grows in damp, shady habitats because flagellated male gametes require a film of water for fertilization.',
  },
  {
    code: 'Specimen B (Dryopteris / Fern)',
    kingdom: 'Kingdom Plantae',
    division: 'Division Filicinophyta (Pteridophyta)',
    className: 'Class Filices',
    features: [
      'Vascular cryptogam possessing true roots, underground rhizome stem, and pinnate fronds',
      'Underside of mature fronds bears clusters of sporangia called sori',
      'Dominant sporophyte generation; reproduces by spores (seedless)',
    ],
    adaptation: 'Cuticle on fronds reduces water loss while vascular bundles transport water and manufactured food.',
  },
  {
    code: 'Specimen C (Zea mays / Maize Seedling)',
    kingdom: 'Kingdom Plantae',
    division: 'Division Angiospermophyta',
    className: 'Class Monocotyledonae',
    features: [
      'Narrow lanceolate leaves with parallel venation',
      'Fibrous (adventitious) root system with prop roots at lower nodes',
      'Floral parts in multiples of three (trimerous); vascular bundles scattered in stem',
    ],
    adaptation: 'Staple cereal crop in Tanzania providing carbohydrates; wind-pollinated flowers with feathery stigmas.',
  },
  {
    code: 'Specimen D (Phaseolus vulgaris / Bean Plant)',
    kingdom: 'Kingdom Plantae',
    division: 'Division Angiospermophyta',
    className: 'Class Dicotyledonae',
    features: [
      'Broad leaves with net (reticulate) venation',
      'Well-developed taproot system bearing root nodules with nitrogen-fixing Rhizobium bacteria',
      'Seeds have two cotyledons; stem vascular bundles arranged in a ring',
    ],
    adaptation: 'Symbiotic Rhizobium bacteria convert atmospheric nitrogen ($\\text{N}_2$) into soil nitrates, enriching soil fertility.',
  },
  {
    code: 'Specimen E (Grasshopper / Locust)',
    kingdom: 'Kingdom Animalia',
    division: 'Phylum Arthropoda',
    className: 'Class Insecta',
    features: [
      'Body divided into three distinct tagmata: Head, Thorax, and Abdomen',
      'Three pairs of jointed thoracic walking legs (hind legs enlarged for jumping) and two pairs of wings',
      'One pair of segmented antennae, compound eyes, and spiracles for tracheal gaseous exchange',
    ],
    adaptation: 'Chitinous exoskeleton prevents desiccation in terrestrial habitats; biting and chewing mouthparts (mandibles).',
  },
  {
    code: 'Specimen F (Lumbricus / Earthworm)',
    kingdom: 'Kingdom Animalia',
    division: 'Phylum Annelida',
    className: 'Class Oligochaeta',
    features: [
      'Cylindrical, metamerically segmented body with a glandular clitellum',
      'Chaetae (setae) bristles on each segment for locomotion in soil',
      'Moist, vascularized cuticle used for cutaneous gaseous exchange',
    ],
    adaptation: 'Aerates agricultural soil through burrowing and decomposes organic matter into humus.',
  },
];

export const VirtualScienceLab: React.FC<VirtualScienceLabProps> = ({
  activeClass = 'Form 4',
  onLaunchPracticalQuiz,
}) => {
  const [subjectTab, setSubjectTab] = useState<ScienceSubjectTab>('chemistry');

  // ==================== 1. CHEMISTRY LAB STATE ====================
  const [chemMode, setChemMode] = useState<'titration' | 'qualitative'>('titration');
  const [titrationPreset, setTitrationPreset] = useState<'hcl_naoh' | 'h2so4_na2co3'>('hcl_naoh');
  const [indicator, setIndicator] = useState<'MO' | 'POP'>('MO');
  const [pipetteVol, setPipetteVol] = useState<20 | 25>(25);
  const [buretteVolAdded, setBuretteVolAdded] = useState<number>(0);
  const [activeRunIdx, setActiveRunIdx] = useState<number>(0);
  const [titrationRows, setTitrationRows] = useState<TitrationRow[]>([
    { runLabel: 'Pilot', initialReading: 0.0, finalReading: null, volumeUsed: null },
    { runLabel: '1', initialReading: 0.0, finalReading: null, volumeUsed: null },
    { runLabel: '2', initialReading: 0.0, finalReading: null, volumeUsed: null },
    { runLabel: '3', initialReading: 0.0, finalReading: null, volumeUsed: null },
  ]);
  const [selectedSaltId, setSelectedSaltId] = useState<string>('Q1');
  const [revealedSaltSteps, setRevealedSaltSteps] = useState<number>(5);

  const trueEndpointVol = useMemo(() => {
    const baseEndpoint = titrationPreset === 'hcl_naoh' ? 24.5 : 20.0;
    return Number(((baseEndpoint * pipetteVol) / 25).toFixed(2));
  }, [titrationPreset, pipetteVol]);

  const flaskColorInfo = useMemo(() => {
    const diff = buretteVolAdded - trueEndpointVol;
    if (indicator === 'MO') {
      if (diff < -0.15) {
        return {
          hex: '#fde047',
          borderHex: '#eab308',
          label: 'Yellow (Alkaline — Base still in excess)',
          status: 'under',
        };
      }
      if (diff >= -0.15 && diff <= 0.25) {
        return {
          hex: '#fb923c',
          borderHex: '#ea580c',
          label: 'Sharp Orange-Pink (Exact Equivalence Endpoint Reached!)',
          status: 'endpoint',
        };
      }
      return {
        hex: '#f43f5e',
        borderHex: '#e11d48',
        label: 'Red / Pink (Overshot Endpoint — Excess Acid Added)',
        status: 'over',
      };
    } else {
      // Phenolphthalein in base
      if (diff < -0.15) {
        return {
          hex: '#f472b6',
          borderHex: '#db2777',
          label: 'Pink / Magenta (Alkaline — Base in excess)',
          status: 'under',
        };
      }
      if (diff >= -0.15 && diff <= 0.25) {
        return {
          hex: '#f8fafc',
          borderHex: '#94a3b8',
          label: 'Just Colourless (Exact Endpoint Reached!)',
          status: 'endpoint',
        };
      }
      return {
        hex: '#f1f5f9',
        borderHex: '#64748b',
        label: 'Colourless (Excess Acid Added)',
        status: 'over',
      };
    }
  }, [buretteVolAdded, trueEndpointVol, indicator]);

  const handleAddTitrant = (deltaCm3: number) => {
    setBuretteVolAdded((v) => Math.min(50, Number((v + deltaCm3).toFixed(2))));
  };

  const handleRecordCurrentTitre = () => {
    setTitrationRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== activeRunIdx) return row;
        const finalR = Number((row.initialReading + buretteVolAdded).toFixed(2));
        return {
          ...row,
          finalReading: finalR,
          volumeUsed: Number(buretteVolAdded.toFixed(2)),
        };
      })
    );
    if (activeRunIdx < 3) {
      setActiveRunIdx((i) => i + 1);
      setBuretteVolAdded(0);
    }
  };

  const handleAutoFillConcordantTable = () => {
    const ep = trueEndpointVol;
    setTitrationRows([
      { runLabel: 'Pilot', initialReading: 0.0, finalReading: Number((ep + 0.6).toFixed(2)), volumeUsed: Number((ep + 0.6).toFixed(2)) },
      { runLabel: '1', initialReading: 0.0, finalReading: ep, volumeUsed: ep },
      { runLabel: '2', initialReading: 20.0, finalReading: Number((20.0 + ep + 0.1).toFixed(2)), volumeUsed: Number((ep + 0.1).toFixed(2)) },
      { runLabel: '3', initialReading: 0.0, finalReading: Number((ep - 0.1).toFixed(2)), volumeUsed: Number((ep - 0.1).toFixed(2)) },
    ]);
    setBuretteVolAdded(ep);
  };

  const averageTitreVol = useMemo(() => {
    const valid = titrationRows.slice(1).filter((r) => r.volumeUsed !== null);
    if (valid.length === 0) return trueEndpointVol;
    const sum = valid.reduce((a, b) => a + (b.volumeUsed || 0), 0);
    return Number((sum / valid.length).toFixed(2));
  }, [titrationRows, trueEndpointVol]);

  // ==================== 2. PHYSICS LAB STATE ====================
  const [physMode, setPhysMode] = useState<'pendulum' | 'ohm'>('pendulum');
  const [selectedLengthCm, setSelectedLengthCm] = useState<number>(60);
  const [isSwinging, setIsSwinging] = useState<boolean>(false);
  const [swingAngle, setSwingAngle] = useState<number>(0);
  const [pendulumRows, setPendulumRows] = useState<PendulumRow[]>([
    { lengthCm: 20, time20Osc: 17.95, periodT: 0.9, tSquared: 0.81 },
    { lengthCm: 40, time20Osc: 25.38, periodT: 1.27, tSquared: 1.61 },
    { lengthCm: 60, time20Osc: 31.09, periodT: 1.55, tSquared: 2.42 },
    { lengthCm: 80, time20Osc: 35.9, periodT: 1.8, tSquared: 3.22 },
    { lengthCm: 100, time20Osc: 40.14, periodT: 2.01, tSquared: 4.03 },
  ]);

  const [rheostatOhm, setRheostatOhm] = useState<number>(4);
  const [ohmRows, setOhmRows] = useState<OhmRow[]>([
    { id: 1, rheostatOhm: 2, currentAmp: 0.5, voltageVolt: 2.0 },
    { id: 2, rheostatOhm: 4, currentAmp: 0.38, voltageVolt: 1.5 },
    { id: 3, rheostatOhm: 6, currentAmp: 0.3, voltageVolt: 1.2 },
    { id: 4, rheostatOhm: 8, currentAmp: 0.25, voltageVolt: 1.0 },
    { id: 5, rheostatOhm: 11, currentAmp: 0.2, voltageVolt: 0.8 },
  ]);

  // Animate simple pendulum when isSwinging is true
  useEffect(() => {
    if (!isSwinging) {
      setSwingAngle(0);
      return;
    }
    let raf = 0;
    let t = 0;
    const periodSec = 2 * Math.PI * Math.sqrt(selectedLengthCm / 100 / 9.81);
    const step = () => {
      t += 0.03;
      const theta = 26 * Math.sin(((2 * Math.PI) / periodSec) * t);
      setSwingAngle(theta);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isSwinging, selectedLengthCm]);

  const handleMeasurePendulumLength = (lenCm: number) => {
    setSelectedLengthCm(lenCm);
    setIsSwinging(true);
    const trueT = 2 * Math.PI * Math.sqrt(lenCm / 100 / 9.81);
    const t20 = Number((trueT * 20).toFixed(2));
    const period = Number(trueT.toFixed(2));
    const tSq = Number((trueT * trueT).toFixed(2));

    setPendulumRows((prev) =>
      prev.map((r) =>
        r.lengthCm === lenCm
          ? { lengthCm: lenCm, time20Osc: t20, periodT: period, tSquared: tSq }
          : r
      )
    );
  };

  // ==================== 3. BIOLOGY LAB STATE ====================
  const [bioMode, setBioMode] = useState<'food_tests' | 'classification'>('food_tests');
  const [selectedFoodSample, setSelectedFoodSample] = useState<'S1' | 'S2' | 'S3'>('S1');
  const [foodTestLogs, setFoodTestLogs] = useState<FoodTestLog[]>([
    {
      id: 'init-1',
      sampleName: 'Solution S1 (Maize & Glucose Extract)',
      foodTested: 'Starch',
      procedure: 'Take 2 cm³ of solution S1 in a clean test tube and add 2–3 drops of Iodine solution.',
      observation: 'Mixture turns blue-black colour immediately.',
      inference: 'Starch is present in solution S1.',
      tubeColorHex: '#1e1b4b',
    },
    {
      id: 'init-2',
      sampleName: 'Solution S1 (Maize & Glucose Extract)',
      foodTested: 'Reducing Sugar',
      procedure: 'To 2 cm³ of solution S1 in a test tube, add 2 cm³ of Benedict’s solution and boil in a water bath for 3 minutes.',
      observation: 'Colour changes from blue to green, yellow, orange, and finally a brick-red precipitate.',
      inference: 'Reducing sugar is present in solution S1.',
      tubeColorHex: '#c2410c',
    },
  ]);
  const [activeTubeColor, setActiveTubeColor] = useState<{ hex: string; label: string }>({
    hex: '#c2410c',
    label: 'Brick-Red Precipitate (Reducing Sugar Positive)',
  });

  const runBiologyFoodReagentTest = (
    reagent: 'iodine' | 'benedict' | 'hcl_benedict' | 'biuret' | 'sudan'
  ) => {
    const sampleTitle =
      selectedFoodSample === 'S1'
        ? 'Solution S1 (Starch + Reducing Sugar)'
        : selectedFoodSample === 'S2'
        ? 'Solution S2 (Protein + Non-Reducing Sugar)'
        : 'Solution S3 (Lipid + Protein)';

    let newEntry: FoodTestLog;

    if (reagent === 'iodine') {
      const hasStarch = selectedFoodSample === 'S1';
      newEntry = {
        id: `bio-${Date.now()}`,
        sampleName: sampleTitle,
        foodTested: 'Starch',
        procedure: `To 2 cm³ of ${selectedFoodSample} in a test tube, add 2–3 drops of Iodine solution.`,
        observation: hasStarch
          ? 'Solution turns deep blue-black colour.'
          : 'Retains the yellowish-brown colour of iodine solution.',
        inference: hasStarch ? 'Starch is present.' : 'Starch is absent.',
        tubeColorHex: hasStarch ? '#1e1b4b' : '#b45309',
      };
      setActiveTubeColor({
        hex: newEntry.tubeColorHex,
        label: hasStarch ? 'Deep Blue-Black (Starch Present)' : 'Yellowish-Brown (Starch Absent)',
      });
    } else if (reagent === 'benedict') {
      const hasReducing = selectedFoodSample === 'S1';
      newEntry = {
        id: `bio-${Date.now()}`,
        sampleName: sampleTitle,
        foodTested: 'Reducing Sugar',
        procedure: `To 2 cm³ of ${selectedFoodSample}, add 2 cm³ of Benedict’s solution and heat in a boiling water bath.`,
        observation: hasReducing
          ? 'Colour changes from blue → green → yellow → brick-red precipitate.'
          : 'Solution remains blue (no colour change).',
        inference: hasReducing ? 'Reducing sugar is present.' : 'Reducing sugar is absent.',
        tubeColorHex: hasReducing ? '#c2410c' : '#0284c7',
      };
      setActiveTubeColor({
        hex: newEntry.tubeColorHex,
        label: hasReducing ? 'Brick-Red Precipitate (Reducing Sugar Present)' : 'Blue Solution (Absent)',
      });
    } else if (reagent === 'hcl_benedict') {
      const hasNonReducing = selectedFoodSample === 'S2';
      newEntry = {
        id: `bio-${Date.now()}`,
        sampleName: sampleTitle,
        foodTested: 'Non-Reducing Sugar',
        procedure: `To 2 cm³ of ${selectedFoodSample}, add 1 cm³ dilute HCl, boil, cool, neutralize with NaOH, then add Benedict’s solution and boil.`,
        observation: hasNonReducing
          ? 'Colour series from blue → green → yellow → brick-red precipitate after acid hydrolysis.'
          : 'Solution remains blue.',
        inference: hasNonReducing ? 'Non-reducing sugar (Sucrose) is present.' : 'Non-reducing sugar is absent.',
        tubeColorHex: hasNonReducing ? '#ea580c' : '#0284c7',
      };
      setActiveTubeColor({
        hex: newEntry.tubeColorHex,
        label: hasNonReducing
          ? 'Brick-Red Precipitate after HCl Hydrolysis (Non-Reducing Sugar Present)'
          : 'Blue Solution (Absent)',
      });
    } else if (reagent === 'biuret') {
      const hasProtein = selectedFoodSample === 'S2' || selectedFoodSample === 'S3';
      newEntry = {
        id: `bio-${Date.now()}`,
        sampleName: sampleTitle,
        foodTested: 'Protein (Biuret Test)',
        procedure: `To 2 cm³ of ${selectedFoodSample}, add 2 cm³ of dilute NaOH followed by 2 drops of 1% CuSO₄ solution and shake.`,
        observation: hasProtein
          ? 'Mixture turns purple / violet colour.'
          : 'Mixture remains pale blue.',
        inference: hasProtein ? 'Protein is present.' : 'Protein is absent.',
        tubeColorHex: hasProtein ? '#7e22ce' : '#38bdf8',
      };
      setActiveTubeColor({
        hex: newEntry.tubeColorHex,
        label: hasProtein ? 'Purple / Violet Complex (Protein Present)' : 'Pale Blue (Protein Absent)',
      });
    } else {
      const hasLipid = selectedFoodSample === 'S3';
      newEntry = {
        id: `bio-${Date.now()}`,
        sampleName: sampleTitle,
        foodTested: 'Lipids (Fats & Oils)',
        procedure: `To 2 cm³ of ${selectedFoodSample}, add 2 cm³ of distilled water and 3 drops of Sudan III solution, shake vigorously and let stand.`,
        observation: hasLipid
          ? 'A distinct bright red-stained oil ring separates at the top surface of the liquid.'
          : 'Red dye remains dispersed; no separate red surface ring formed.',
        inference: hasLipid ? 'Lipids (fats/oils) are present.' : 'Lipids are absent.',
        tubeColorHex: hasLipid ? '#dc2626' : '#fca5a5',
      };
      setActiveTubeColor({
        hex: newEntry.tubeColorHex,
        label: hasLipid ? 'Bright Red Surface Ring (Lipids Present)' : 'No Red Ring (Lipids Absent)',
      });
    }

    setFoodTestLogs((prev) => [newEntry, ...prev.slice(0, 7)]);
  };

  const activeSalt = useMemo(
    () => QUALITATIVE_SALTS.find((s) => s.id === selectedSaltId) || QUALITATIVE_SALTS[0],
    [selectedSaltId]
  );

  return (
    <div className="space-y-6">
      {/* Top Laboratory Header & Subject Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-700">
              NECTA Paper 2 (2A / 2B / 2C) Practical Preparation · {activeClass}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Interactive Virtual Science Practicals Laboratory
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Perform realistic Chemistry titrations &amp; qualitative salt analysis, Physics simple pendulum &amp; Ohm&apos;s law graph experiments, and Biology biochemical food tests with official NECTA report tables.
            </p>
          </div>

          {/* 3-Subject Segmented Switcher */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-start">
            <button
              type="button"
              onClick={() => setSubjectTab('chemistry')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                subjectTab === 'chemistry'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>Chemistry 2A (Titration &amp; Salt)</span>
            </button>
            <button
              type="button"
              onClick={() => setSubjectTab('physics')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                subjectTab === 'physics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Physics 2A (Pendulum &amp; Circuit)</span>
            </button>
            <button
              type="button"
              onClick={() => setSubjectTab('biology')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                subjectTab === 'biology'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Microscope className="w-4 h-4 text-violet-600" />
              <span>Biology 2A (Food Tests &amp; Specimens)</span>
            </button>
          </div>
        </div>

        {/* Direct 20-Question Practical Exam Launch Bar */}
        {onLaunchPracticalQuiz && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="text-slate-600 font-medium">
              Want to test your Paper 2 calculations, observations, and inferences with <strong>20 Exam Questions</strong>?
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onLaunchPracticalQuiz(
                    activeClass,
                    subjectTab === 'chemistry'
                      ? 'Chemistry'
                      : subjectTab === 'physics'
                      ? 'Physics'
                      : 'Biology',
                    subjectTab === 'chemistry'
                      ? 'Volumetric & Qualitative Analysis'
                      : subjectTab === 'physics'
                      ? 'Mechanics & Current Electricity Practical'
                      : 'Nutrition Food Tests & Classification'
                  )
                }
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Take 20-Question{' '}
                  {subjectTab === 'chemistry'
                    ? 'Chemistry'
                    : subjectTab === 'physics'
                    ? 'Physics'
                    : 'Biology'}{' '}
                  Paper 2 Practical Quiz
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== 1. CHEMISTRY PAPER 2 PRACTICAL LAB ==================== */}
      {subjectTab === 'chemistry' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Chemistry Paper 2 Practical Bench
              </h3>
              <p className="text-xs text-slate-500">
                Question 1: Volumetric Analysis (Acid-Base Titration) · Question 2: Qualitative Analysis
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setChemMode('titration')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  chemMode === 'titration' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Q1. Volumetric Titration
              </button>
              <button
                type="button"
                onClick={() => setChemMode('qualitative')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  chemMode === 'qualitative' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Q2. Qualitative Salt Analysis
              </button>
            </div>
          </div>

          {chemMode === 'titration' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5 Cols: Interactive Burette & Conical Flask Simulator */}
              <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl p-5 space-y-4 border border-slate-800">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                  <span className="font-bold text-emerald-400">
                    Burette &amp; Conical Flask Apparatus
                  </span>
                  <span className="font-mono text-amber-300 tabular-nums">
                    Run: {titrationRows[activeRunIdx]?.runLabel || '1'}
                  </span>
                </div>

                {/* Preset & Indicator Controls */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Reagent System</label>
                    <select
                      value={titrationPreset}
                      onChange={(e) => {
                        setTitrationPreset(e.target.value as 'hcl_naoh' | 'h2so4_na2co3');
                        setBuretteVolAdded(0);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                    >
                      <option value="hcl_naoh">0.10 M HCl vs NaOH</option>
                      <option value="h2so4_na2co3">0.125 M H₂SO₄ vs Na₂CO₃</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Indicator &amp; Pipette
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={indicator}
                        onChange={(e) => setIndicator(e.target.value as 'MO' | 'POP')}
                        className="flex-1 px-2 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                      >
                        <option value="MO">Methyl Orange (M.O.)</option>
                        <option value="POP">Phenolphthalein (P.O.P.)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setPipetteVol((p) => (p === 25 ? 20 : 25))}
                        className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold tabular-nums cursor-pointer"
                        title="Toggle Pipette Volume (20 cm³ or 25 cm³)"
                      >
                        {pipetteVol}cm³
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visual Burette + Conical Flask Diagram */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center space-y-3">
                  <div className="w-full flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-slate-300">
                      Burette Reading: <strong className="text-sky-300">{buretteVolAdded.toFixed(2)} cm³</strong>
                    </span>
                    <span className="text-slate-400"> Pipette: {pipetteVol}.0 cm³</span>
                  </div>

                  {/* SVG Burette and Conical Flask */}
                  <svg viewBox="0 0 240 230" className="w-48 h-48">
                    {/* Burette Glass Column */}
                    <rect x="108" y="8" width="24" height="105" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                    {/* Acid Liquid inside Burette */}
                    <rect
                      x="110"
                      y={12 + Math.min(95, (buretteVolAdded / 50) * 95)}
                      width="20"
                      height={Math.max(4, 98 - (buretteVolAdded / 50) * 95)}
                      fill="#38bdf8"
                      opacity="0.75"
                    />
                    {/* Burette Graduation Marks */}
                    {[20, 40, 60, 80, 100].map((yPos) => (
                      <line key={yPos} x1="108" y1={yPos} x2="117" y2={yPos} stroke="#e2e8f0" strokeWidth="1.2" />
                    ))}
                    {/* Stopcock Tap */}
                    <rect x="101" y="114" width="38" height="7" rx="2" fill="#f59e0b" />
                    <line x1="120" y1="113" x2="120" y2="132" stroke="#94a3b8" strokeWidth="3" />
                    {/* Falling droplet */}
                    {buretteVolAdded > 0 && (
                      <circle cx="120" cy="142" r="3" fill="#38bdf8" />
                    )}
                    {/* Conical Flask Outline */}
                    <path
                      d="M 106 148 L 134 148 L 134 166 L 166 214 L 74 214 L 106 166 Z"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2.5"
                    />
                    {/* Liquid inside Conical Flask */}
                    <path
                      d="M 94 185 L 146 185 L 163 212 L 77 212 Z"
                      fill={flaskColorInfo.hex}
                      stroke={flaskColorInfo.borderHex}
                      strokeWidth="1.5"
                      opacity="0.92"
                    />
                    {/* White Porcelain Tile under Flask */}
                    <rect x="64" y="215" width="112" height="7" rx="2" fill="#f8fafc" />
                  </svg>

                  <div className="text-center text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 w-full">
                    Flask Colour: <span className="text-amber-300">{flaskColorInfo.label}</span>
                  </div>
                </div>

                {/* Burette Stopcock Buttons */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAddTitrant(5.0)}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sky-300 cursor-pointer tabular-nums"
                  >
                    +5.00 cm³
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddTitrant(1.0)}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sky-300 cursor-pointer tabular-nums"
                  >
                    +1.00 cm³
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddTitrant(0.1)}
                    className="py-2 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 font-black text-slate-950 cursor-pointer tabular-nums"
                  >
                    +0.10 cm³ (Drop)
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setBuretteVolAdded(0)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refill (0.00)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordCurrentTitre}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    Record {titrationRows[activeRunIdx]?.runLabel} Reading ({buretteVolAdded.toFixed(2)} cm³)
                  </button>
                </div>
              </div>

              {/* Right 7 Cols: Official NECTA Titration Table & Stoichiometric Calculations */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-900">
                    Official NECTA Titration Table (Pipette Volume V<sub>B</sub> = {pipetteVol}.0 cm³)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAutoFillConcordantTable}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold cursor-pointer"
                  >
                    Auto-Fill Concordant Titres ({trueEndpointVol.toFixed(2)} cm³)
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left border-collapse tabular-nums">
                    <thead className="bg-slate-100 text-slate-800 font-bold">
                      <tr>
                        <th className="p-3 border-b border-slate-200"> Burette Reading (cm³)</th>
                        {titrationRows.map((r, idx) => (
                          <th
                            key={r.runLabel}
                            onClick={() => setActiveRunIdx(idx)}
                            className={`p-3 border-b border-l border-slate-200 text-center cursor-pointer ${
                              activeRunIdx === idx ? 'bg-amber-100 text-slate-950' : ''
                            }`}
                          >
                            {r.runLabel}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-semibold text-slate-700">Final Reading (cm³)</td>
                        {titrationRows.map((r) => (
                          <td key={`f-${r.runLabel}`} className="p-3 border-l border-slate-200 text-center font-bold">
                            {r.finalReading !== null ? r.finalReading.toFixed(2) : '—'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-700">Initial Reading (cm³)</td>
                        {titrationRows.map((r) => (
                          <td key={`i-${r.runLabel}`} className="p-3 border-l border-slate-200 text-center">
                            {r.initialReading.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-emerald-50/50">
                        <td className="p-3 font-black text-slate-900">Volume of Acid Used $V_A$ (cm³)</td>
                        {titrationRows.map((r) => (
                          <td
                            key={`v-${r.runLabel}`}
                            className="p-3 border-l border-slate-200 text-center font-black text-emerald-800"
                          >
                            {r.volumeUsed !== null ? r.volumeUsed.toFixed(2) : '—'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Step-by-Step MathJax Volumetric Analysis Working */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs leading-relaxed">
                  <div className="font-black text-slate-900">
                    NECTA Marking Scheme Calculations (Step-by-Step MathJax Working)
                  </div>
                  {titrationPreset === 'hcl_naoh' ? (
                    <>
                      <div>
                        <strong>1. Average Volume of Acid ($V_A$):</strong>{' '}
                        <MathText
                          text={`$V_A = \\frac{V_1 + V_2 + V_3}{3} = ${averageTitreVol.toFixed(2)}\\text{ cm}^3$`}
                        />
                      </div>
                      <div>
                        <strong>2. Balanced Chemical Equation:</strong>{' '}
                        <MathText
                          text={`$\\text{HCl}(aq) + \\text{NaOH}(aq) \\to \\text{NaCl}(aq) + \\text{H}_2\\text{O}(l)\\quad (n_A = 1,\\text{ }n_B = 1)$`}
                        />
                      </div>
                      <div>
                        <strong>3. Molarity of Base ($M_B$):</strong>{' '}
                        <MathText
                          text={`Using $\\frac{M_A V_A}{M_B V_B} = \\frac{n_A}{n_B} \\Rightarrow M_B = \\frac{0.100 \\times ${averageTitreVol.toFixed(2)} \\times 1}{${pipetteVol}.0 \\times 1} = ${((0.1 * averageTitreVol) / pipetteVol).toFixed(4)}\\text{ M}$`}
                        />
                      </div>
                      <div>
                        <strong>4. Concentration of NaOH in g/dm³:</strong>{' '}
                        <MathText
                          text={`$\\text{Conc (g/dm}^3\\text{)} = \\text{Molarity} \\times \\text{Molar Mass } (40\\text{ g/mol}) = ${(((0.1 * averageTitreVol) / pipetteVol) * 40).toFixed(2)}\\text{ g/dm}^3$`}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>1. Average Volume of Acid ($V_A$):</strong>{' '}
                        <MathText
                          text={`$V_A = \\frac{V_1 + V_2 + V_3}{3} = ${averageTitreVol.toFixed(2)}\\text{ cm}^3$`}
                        />
                      </div>
                      <div>
                        <strong>2. Balanced Chemical Equation:</strong>{' '}
                        <MathText
                          text={`$\\text{H}_2\\text{SO}_4(aq) + \\text{Na}_2\\text{CO}_3(aq) \\to \\text{Na}_2\\text{SO}_4(aq) + \\text{H}_2\\text{O}(l) + \\text{CO}_2(g)\\quad (n_A = 1,\\text{ }n_B = 1)$`}
                        />
                      </div>
                      <div>
                        <strong>3. Molarity of Na₂CO₃ (M<sub>B</sub>):</strong>{' '}
                        <MathText
                          text={`$M_B = \\frac{M_A V_A}{V_B} = \\frac{0.125 \\times ${averageTitreVol.toFixed(2)}}{${pipetteVol}.0} = ${((0.125 * averageTitreVol) / pipetteVol).toFixed(4)}\\text{ M}$`}
                        />
                      </div>
                      <div>
                        <strong>4. Concentration in g/dm³ (Molar Mass = 106 g/mol):</strong>{' '}
                        <MathText
                          text={`$\\text{Concentration} = ${((0.125 * averageTitreVol) / pipetteVol).toFixed(4)} \\times 106 = ${(((0.125 * averageTitreVol) / pipetteVol) * 106).toFixed(2)}\\text{ g/dm}^3$`}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Qualitative Salt Analysis Mode */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">Select Unknown Salt Sample:</span>
                  {QUALITATIVE_SALTS.map((salt) => (
                    <button
                      key={salt.id}
                      type="button"
                      onClick={() => {
                        setSelectedSaltId(salt.id);
                        setRevealedSaltSteps(salt.steps.length);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                        selectedSaltId === salt.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {salt.code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold">
                    <tr>
                      <th className="p-3 border-b border-slate-200 w-2/5">Experiment</th>
                      <th className="p-3 border-b border-l border-slate-200 w-2/5">Observation</th>
                      <th className="p-3 border-b border-l border-slate-200 w-1/5">Inference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeSalt.steps.slice(0, revealedSaltSteps).map((st, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-800">
                          <MathText text={st.experiment} />
                        </td>
                        <td className="p-3 border-l border-slate-200 text-slate-700">
                          <MathText text={st.observation} />
                        </td>
                        <td className="p-3 border-l border-slate-200 font-bold text-emerald-800">
                          <MathText text={st.inference} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <div className="font-black text-emerald-950">Conclusion for {activeSalt.code}:</div>
                <div>
                  1. The cation present in {activeSalt.code} is <MathText text={`$${activeSalt.cation}$`} />.
                </div>
                <div>
                  2. The anion present in {activeSalt.code} is <MathText text={`$${activeSalt.anion}$`} />.
                </div>
                <div>
                  3. Chemical formula of salt {activeSalt.code}: <MathText text={`$${activeSalt.formula}$`} />.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. PHYSICS PAPER 2 PRACTICAL LAB ==================== */}
      {subjectTab === 'physics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Physics Paper 2 Practical Bench
              </h3>
              <p className="text-xs text-slate-500">
                Question 1: Mechanics (Simple Pendulum Determination of $g$) · Question 2: Current Electricity (Ohm&apos;s Law)
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setPhysMode('pendulum')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  physMode === 'pendulum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Q1. Simple Pendulum (T² vs L)
              </button>
              <button
                type="button"
                onClick={() => setPhysMode('ohm')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  physMode === 'ohm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Q2. Ohm&apos;s Law (V vs I)
              </button>
            </div>
          </div>

          {physMode === 'pendulum' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5 Cols: Animated Simple Pendulum & Length Selector */}
              <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl p-5 space-y-4 border border-slate-800">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                  <span className="font-bold text-sky-400">Retort Stand &amp; Simple Pendulum</span>
                  <span className="font-mono text-amber-300 tabular-nums">
                    Length L = {selectedLengthCm} cm
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[20, 40, 60, 80, 100].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => handleMeasurePendulumLength(len)}
                      className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer tabular-nums ${
                        selectedLengthCm === len
                          ? 'bg-sky-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      L = {len} cm
                    </button>
                  ))}
                </div>

                {/* SVG Swinging Pendulum + Graph Preview */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center">
                  <svg viewBox="0 0 240 200" className="w-52 h-44">
                    {/* Retort Stand Clamp */}
                    <line x1="60" y1="15" x2="180" y2="15" stroke="#94a3b8" strokeWidth="4" />
                    <line x1="65" y1="15" x2="65" y2="190" stroke="#64748b" strokeWidth="5" />
                    <rect x="45" y="185" width="90" height="8" rx="2" fill="#475569" />
                    {/* Vertical Equilibrium Reference Line */}
                    <line x1="125" y1="15" x2="125" y2="175" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
                    {/* Swinging String & Brass Bob */}
                    <g transform={`rotate(${swingAngle}, 125, 15)`}>
                      <line
                        x1="125"
                        y1="15"
                        x2="125"
                        y2={15 + (selectedLengthCm / 100) * 145}
                        stroke="#f8fafc"
                        strokeWidth="2"
                      />
                      <circle
                        cx="125"
                        cy={15 + (selectedLengthCm / 100) * 145}
                        r="11"
                        fill="#fbbf24"
                        stroke="#d97706"
                        strokeWidth="2.5"
                      />
                    </g>
                  </svg>

                  <div className="flex items-center justify-between w-full text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSwinging((s) => !s)}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-black cursor-pointer"
                    >
                      {isSwinging ? 'Stop Oscillation' : 'Swing & Time 20 Oscillations'}
                    </button>
                    <span className="font-mono text-emerald-400 tabular-nums">
                      T = {(2 * Math.PI * Math.sqrt(selectedLengthCm / 100 / 9.81)).toFixed(2)} s
                    </span>
                  </div>
                </div>

                {/* Live Plotted T² vs L Graph */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Graph of T² (s²) against L (cm)</span>
                    <span className="text-emerald-400 font-mono">Slope = 0.0403 s²/cm</span>
                  </div>
                  <svg viewBox="0 0 260 150" className="w-full h-36 bg-slate-950 rounded-lg border border-slate-800">
                    {/* Grid lines */}
                    {[30, 60, 90, 120].map((y) => (
                      <line key={`gy-${y}`} x1="35" y1={y} x2="245" y2={y} stroke="#1e293b" strokeWidth="1" />
                    ))}
                    {[75, 115, 155, 195, 235].map((x) => (
                      <line key={`gx-${x}`} x1={x} y1="15" x2={x} y2="125" stroke="#1e293b" strokeWidth="1" />
                    ))}
                    {/* Axes */}
                    <line x1="35" y1="15" x2="35" y2="125" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="35" y1="125" x2="245" y2="125" stroke="#94a3b8" strokeWidth="1.5" />
                    {/* Best-fit Straight Line */}
                    <line x1="35" y1="125" x2="235" y2="24" stroke="#38bdf8" strokeWidth="2" />
                    {/* Plotted Points */}
                    {pendulumRows.map((r) => {
                      const px = 35 + (r.lengthCm / 100) * 200;
                      const py = 125 - ((r.tSquared || 0) / 4.2) * 105;
                      return <circle key={r.lengthCm} cx={px} cy={py} r="4" fill="#fbbf24" />;
                    })}
                  </svg>
                </div>
              </div>

              {/* Right 7 Cols: Pendulum Table & Calculation of Gravity g */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-sm font-black text-slate-900">
                  Table of Results: Simple Pendulum (n = 20 oscillations)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left border-collapse tabular-nums">
                    <thead className="bg-slate-100 text-slate-800 font-bold">
                      <tr>
                        <th className="p-3 border-b border-slate-200">Length L (cm)</th>
                        <th className="p-3 border-b border-l border-slate-200">Time for 20 osc t (s)</th>
                        <th className="p-3 border-b border-l border-slate-200">Period T = t/20 (s)</th>
                        <th className="p-3 border-b border-l border-slate-200">T² (s²)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pendulumRows.map((r) => (
                        <tr
                          key={r.lengthCm}
                          onClick={() => handleMeasurePendulumLength(r.lengthCm)}
                          className={`cursor-pointer ${
                            selectedLengthCm === r.lengthCm ? 'bg-sky-50 font-bold' : ''
                          }`}
                        >
                          <td className="p-3">{r.lengthCm}</td>
                          <td className="p-3 border-l border-slate-200">{r.time20Osc?.toFixed(2)}</td>
                          <td className="p-3 border-l border-slate-200">{r.periodT?.toFixed(2)}</td>
                          <td className="p-3 border-l border-slate-200 font-bold text-blue-700">
                            {r.tSquared?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs leading-relaxed">
                  <div className="font-black text-slate-900">
                    NECTA Paper 2 Deduction of Acceleration Due to Gravity ($g$)
                  </div>
                  <div>
                    <strong>1. Theoretical Relation:</strong>{' '}
                    <MathText
                      text={`$T = 2\\pi\\sqrt{\\frac{L}{g}} \\implies T^2 = \\left(\\frac{4\\pi^2}{g}\\right)L$ (Equation of a straight line $y = mx$ through the origin)`}
                    />
                  </div>
                  <div>
                    <strong>2. Slope ($S$) of the Graph:</strong>{' '}
                    <MathText
                      text={`$S = \\frac{\\Delta T^2}{\\Delta L} = \\frac{4.03 - 0.81}{1.00\\text{ m} - 0.20\\text{ m}} = \\frac{3.22}{0.80} = 4.025\\text{ s}^2/\\text{m}$`}
                    />
                  </div>
                  <div>
                    <strong>3. Value of Acceleration due to Gravity ($g$):</strong>{' '}
                    <MathText
                      text={`Since $S = \\frac{4\\pi^2}{g} \\implies g = \\frac{4\\pi^2}{S} = \\frac{39.478}{4.025} = 9.81\\text{ m/s}^2$`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Ohm's Law Interactive Circuit Bench */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl p-5 space-y-4 border border-slate-800">
                <div className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-3">
                  Ohm&apos;s Law Circuit (E = 3.0 V, Unknown Resistor R<sub>x</sub> = 4.0 Ω)
                </div>
                <div className="space-y-2 text-xs">
                  <label className="block text-slate-300 font-semibold">
                    Adjust Rheostat Resistance (R<sub>rheo</sub> = {rheostatOhm} Ω):
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={16}
                    step={1}
                    value={rheostatOhm}
                    onChange={(e) => setRheostatOhm(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
                {(() => {
                  const totalR = 4.0 + rheostatOhm;
                  const currentI = Number((3.0 / totalR).toFixed(2));
                  const voltageV = Number((currentI * 4.0).toFixed(2));
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-center font-mono tabular-nums">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[11px] text-slate-400">Ammeter ($I$)</div>
                          <div className="text-xl font-black text-sky-400">{currentI} A</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[11px] text-slate-400">Voltmeter ($V$)</div>
                          <div className="text-xl font-black text-amber-400">{voltageV} V</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setOhmRows((prev) => [
                            ...prev,
                            {
                              id: Date.now(),
                              rheostatOhm,
                              currentAmp: currentI,
                              voltageVolt: voltageV,
                            },
                          ])
                        }
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        Record (I = {currentI} A, V = {voltageV} V) to Table
                      </button>
                    </div>
                  );
                })()}
              </div>

              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-sm font-black text-slate-900">
                  Ohm&apos;s Law Recorded Readings &amp; Slope Determination
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left border-collapse tabular-nums">
                    <thead className="bg-slate-100 text-slate-800 font-bold">
                      <tr>
                        <th className="p-3 border-b border-slate-200">Rheostat ($\Omega$)</th>
                        <th className="p-3 border-b border-l border-slate-200">Current $I$ (A)</th>
                        <th className="p-3 border-b border-l border-slate-200">Potential Difference $V$ (V)</th>
                        <th className="p-3 border-b border-l border-slate-200">Ratio $R = V/I$ ($\Omega$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {ohmRows.map((r) => (
                        <tr key={r.id}>
                          <td className="p-3">{r.rheostatOhm}</td>
                          <td className="p-3 border-l border-slate-200 font-bold text-sky-700">
                            {r.currentAmp.toFixed(2)}
                          </td>
                          <td className="p-3 border-l border-slate-200 font-bold text-amber-700">
                            {r.voltageVolt.toFixed(2)}
                          </td>
                          <td className="p-3 border-l border-slate-200 font-black text-emerald-700">
                            {(r.voltageVolt / Math.max(0.01, r.currentAmp)).toFixed(1)} Ω
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-black text-slate-900">Slope of V against I Graph:</div>
                  <MathText
                    text={`By Ohm's Law $V = I R_x$, the gradient of the graph of $V\\text{ (V)}$ against $I\\text{ (A)}$ gives the unknown resistance $R_x = \\frac{\\Delta V}{\\Delta I} = \\frac{2.0 - 0.8}{0.50 - 0.20} = \\frac{1.2}{0.30} = 4.0\\text{ }\\Omega$.`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. BIOLOGY PAPER 2 PRACTICAL LAB ==================== */}
      {subjectTab === 'biology' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Biology Paper 2 Practical Bench
              </h3>
              <p className="text-xs text-slate-500">
                Question 1: Biochemical Food Tests (Nutrition) · Question 2: Classification of Specimens
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setBioMode('food_tests')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  bioMode === 'food_tests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Q1. Biochemical Food Tests
              </button>
              <button
                type="button"
                onClick={() => setBioMode('classification')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  bioMode === 'classification' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Q2. Specimen Classification (A–F)
              </button>
            </div>
          </div>

          {bioMode === 'food_tests' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 4 Cols: Interactive Test Tube Rack & Reagent Droppers */}
              <div className="lg:col-span-4 bg-slate-950 text-white rounded-2xl p-5 space-y-4 border border-slate-800">
                <div className="text-xs font-bold text-violet-400 border-b border-slate-800 pb-3">
                  Biochemical Food Test Rack
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block text-slate-300 font-semibold">1. Select Food Sample Solution:</label>
                  <select
                    value={selectedFoodSample}
                    onChange={(e) => setSelectedFoodSample(e.target.value as 'S1' | 'S2' | 'S3')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="S1">Sample S1 (Starch + Reducing Sugar)</option>
                    <option value="S2">Sample S2 (Protein + Non-Reducing Sugar)</option>
                    <option value="S3">Sample S3 (Lipids + Protein)</option>
                  </select>
                </div>

                {/* Visual Test Tube Display */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col items-center space-y-2">
                  <svg viewBox="0 0 140 160" className="w-32 h-36">
                    <path
                      d="M 52 20 L 88 20 L 88 125 A 18 18 0 0 1 52 125 Z"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="3"
                    />
                    <path
                      d="M 54 75 L 86 75 L 86 124 A 16 16 0 0 1 54 124 Z"
                      fill={activeTubeColor.hex}
                      opacity="0.92"
                    />
                  </svg>
                  <div className="text-[11px] font-bold text-center text-amber-300">
                    {activeTubeColor.label}
                  </div>
                </div>

                {/* Reagent Action Buttons */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 font-semibold">2. Add Reagent &amp; Observe:</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => runBiologyFoodReagentTest('iodine')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left font-bold text-amber-300 cursor-pointer"
                    >
                      + Iodine Solution (Starch Test)
                    </button>
                    <button
                      type="button"
                      onClick={() => runBiologyFoodReagentTest('benedict')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left font-bold text-sky-300 cursor-pointer"
                    >
                      + Benedict&apos;s Solution &amp; Heat (Reducing Sugar)
                    </button>
                    <button
                      type="button"
                      onClick={() => runBiologyFoodReagentTest('hcl_benedict')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left font-bold text-orange-300 cursor-pointer"
                    >
                      + Dilute HCl + Boil + NaOH + Benedict&apos;s
                    </button>
                    <button
                      type="button"
                      onClick={() => runBiologyFoodReagentTest('biuret')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left font-bold text-purple-300 cursor-pointer"
                    >
                      + NaOH + 1% CuSO₄ (Biuret Protein Test)
                    </button>
                    <button
                      type="button"
                      onClick={() => runBiologyFoodReagentTest('sudan')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left font-bold text-rose-300 cursor-pointer"
                    >
                      + Sudan III Reagent (Lipid Ring Test)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 8 Cols: Official 4-Column NECTA Biology Food Test Report Table */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">
                    Official NECTA Biology Paper 2 Food Test Report Table
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFoodTestLogs([])}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Clear Table
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-bold">
                      <tr>
                        <th className="p-3 border-b border-slate-200">Food Tested</th>
                        <th className="p-3 border-b border-l border-slate-200">Procedure</th>
                        <th className="p-3 border-b border-l border-slate-200">Observation</th>
                        <th className="p-3 border-b border-l border-slate-200">Inference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {foodTestLogs.map((row) => (
                        <tr key={row.id}>
                          <td className="p-3 font-bold text-slate-900">{row.foodTested}</td>
                          <td className="p-3 border-l border-slate-200 text-slate-700">{row.procedure}</td>
                          <td className="p-3 border-l border-slate-200 text-slate-800">{row.observation}</td>
                          <td className="p-3 border-l border-slate-200 font-bold text-emerald-800">
                            {row.inference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Specimen Classification Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BIOLOGY_SPECIMENS.map((spec) => (
                <div
                  key={spec.code}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="text-sm font-black text-slate-900">{spec.code}</span>
                    <span className="font-semibold text-violet-700">
                      {spec.kingdom} · {spec.division} · {spec.className}
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-700">
                    <div className="font-bold text-slate-900">Observable Diagnostic Features:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {spec.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-1 text-slate-600">
                    <strong className="text-slate-800">Adaptation / Economic Importance: </strong>
                    <MathText text={spec.adaptation} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VirtualScienceLab;
