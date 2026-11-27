export type GeographySimMode =
  | 'map_reading'
  | 'earth_time'
  | 'weather_climate'
  | 'tectonics_vulcanicity'
  | 'rivers_coasts'
  | 'statistical_graphs'
  | 'surveying_lab'
  | 'soil_rocks';

export interface GeographyModeMeta {
  id: GeographySimMode;
  shortTitle: string;
  fullTitle: string;
  formLevel: string;
  nectaFocus: string;
  summary: string;
}

export const GEOGRAPHY_SIM_MODES: GeographyModeMeta[] = [
  {
    id: 'map_reading',
    shortTitle: '1. Map Reading & Grid Lab',
    fullTitle: 'Map Reading, Grid References, Bearings & Cross-Sections',
    formLevel: 'Form 3–4 (NECTA Qn 6 Compulsory)',
    nectaFocus: '4 & 6-Figure Grid Ref · Forward/Back Bearing · Scale · Gradient · Cross-Section & Intervisibility',
    summary:
      'Drag points A and B across a 1:50,000 East African topographic sheet to measure 6-figure grid references, bearings, distance, area, gradient, and live terrain cross-sections.',
  },
  {
    id: 'earth_time',
    shortTitle: '2. Earth, Time & Seasons',
    fullTitle: 'Earth Rotation, Longitude Time Calculator & Seasons Orbit',
    formLevel: 'Form 1',
    nectaFocus: '15° = 1 hr (1° = 4 min) · E.G.A. / W.L.S. · Solstices & Equinoxes · 23.5° Axial Tilt',
    summary:
      'Rotate Earth to calculate local time between any two longitudes using East Gain Add / West Lose Subtract, and orbit Earth around the Sun to inspect solstices, equinoxes, and day length.',
  },
  {
    id: 'weather_climate',
    shortTitle: '3. Weather & Climographs',
    fullTitle: 'Stevenson Screen Instruments & Climograph Plotter',
    formLevel: 'Form 1 & Form 4',
    nectaFocus: "Six's Thermometer · Hygrometer Relative Humidity · Combined Temp & Rainfall Climographs",
    summary:
      "Read Six's Maximum & Minimum thermometer and Wet/Dry bulb hygrometer live, and compare Equatorial, Savanna, Monsoon, Desert, and Mediterranean climographs.",
  },
  {
    id: 'tectonics_vulcanicity',
    shortTitle: '4. Folding, Faulting & Volcanoes',
    fullTitle: 'Internal Earth Forces: Folding, Rift Valley Faulting & Vulcanicity',
    formLevel: 'Form 3',
    nectaFocus: 'Anticline/Syncline · East African Rift Valley (Graben) · Horst Block Mt · Intrusive/Extrusive Volcanism',
    summary:
      'Apply compressional or tensional forces to rock strata to form fold mountains, the East African Rift Valley, block mountains, intrusive batholiths/dykes/sills, and composite volcanoes.',
  },
  {
    id: 'rivers_coasts',
    shortTitle: '5. Rivers, Meanders & Coasts',
    fullTitle: 'External Earth Forces: River Profile, Ox-Bow Lakes & Coastal Landforms',
    formLevel: 'Form 3',
    nectaFocus: 'Youthful / Mature / Old River Stages · Meander & Ox-Bow Cut-Off · Deltas · Wave Cliffs & Coral Reefs',
    summary:
      'Explore upper V-shaped valleys and waterfalls, middle-stage river cliff erosion and slip-off deposition, lower-stage ox-bow lake formation, deltas, and coastal coral reefs.',
  },
  {
    id: 'statistical_graphs',
    shortTitle: '6. Statistical Graphs & Pyramids',
    fullTitle: 'Geographical Data: Bar/Line Charts, Pie Charts & Population Pyramids',
    formLevel: 'Form 3–6 (NECTA Qn 5)',
    nectaFocus: 'Simple / Comparative / Divided Bars · Pie Chart Degrees · Age–Sex Population Pyramid & Dependency Ratio',
    summary:
      'Plot and edit Tanzania crop production statistics as comparative or divided bar graphs, pie charts (360°), and interactive Age–Sex Population Pyramids.',
  },
  {
    id: 'surveying_lab',
    shortTitle: '7. Elementary Surveying Lab',
    fullTitle: 'Chain Surveying, Prismatic Compass Traverse & Levelling',
    formLevel: 'Form 3–4',
    nectaFocus: 'Chain Offsets & Obstacles · Compass Forward/Back Bearing Check · Rise & Fall / Collimation Levelling',
    summary:
      'Lay out chain survey offsets, test prismatic compass stations for local attraction, and move a levelling staff to compute Reduced Levels with NECTA arithmetic checks.',
  },
  {
    id: 'soil_rocks',
    shortTitle: '8. Soil Profile & Rock Cycle',
    fullTitle: 'Soil Horizons (O–A–B–C–R), Texture Triangle & Rock Cycle',
    formLevel: 'Form 3',
    nectaFocus: 'Soil Profile Horizons & Leaching · Sand/Silt/Clay Loam Triangle · Igneous, Sedimentary & Metamorphic Cycle',
    summary:
      'Adjust rainfall leaching across O, A, B, C, and R soil horizons, classify soil texture on a ternary triangle, and trace rock transformations through the Rock Cycle.',
  },
];

export interface ClimateStationPreset {
  id: string;
  name: string;
  regionType: string;
  hemisphere: 'N' | 'S' | 'Eq';
  latitudeLabel: string;
  tempC: number[]; // Jan..Dec
  rainMm: number[]; // Jan..Dec
  characteristics: string[];
}

export const CLIMATE_STATIONS: ClimateStationPreset[] = [
  {
    id: 'dodoma',
    name: 'Dodoma, Tanzania',
    regionType: 'Tropical Continental (Savanna)',
    hemisphere: 'S',
    latitudeLabel: '6.2°S, 35.7°E',
    tempC: [23.8, 23.7, 23.5, 23.0, 21.8, 20.2, 19.6, 20.5, 22.0, 23.4, 24.5, 24.3],
    rainMm: [135, 115, 110, 52, 6, 1, 0, 0, 1, 5, 32, 118],
    characteristics: [
      'Distinct wet season (Nov–April) and pronounced dry winter (May–Oct).',
      'Moderate annual temperature range (~4.9°C) with coolest months in June–July.',
      'Natural vegetation: Miombo woodland, acacia scrub, and tall savanna grass.',
    ],
  },
  {
    id: 'dar',
    name: 'Dar es Salaam, Tanzania',
    regionType: 'Tropical Coastal / Monsoon',
    hemisphere: 'S',
    latitudeLabel: '6.8°S, 39.3°E',
    tempC: [27.8, 27.9, 27.4, 26.6, 25.5, 24.3, 23.6, 23.9, 24.6, 25.7, 26.8, 27.5],
    rainMm: [75, 55, 135, 265, 175, 32, 22, 24, 28, 62, 115, 105],
    characteristics: [
      'Double rainfall maxima: Long rains (Masika: March–May) and short rains (Vuli: Nov–Dec).',
      'High temperatures year-round (23.6°C–27.9°C) moderated by the Indian Ocean.',
      'High relative humidity (75%–85%) throughout the year.',
    ],
  },
  {
    id: 'entebbe',
    name: 'Lake Victoria Basin (Bukoba / Entebbe)',
    regionType: 'Equatorial Climate',
    hemisphere: 'Eq',
    latitudeLabel: '1.3°S, 31.8°E',
    tempC: [21.5, 21.8, 21.9, 21.6, 21.3, 20.8, 20.4, 20.7, 21.1, 21.4, 21.4, 21.3],
    rainMm: [150, 165, 245, 360, 315, 85, 65, 85, 105, 155, 215, 195],
    characteristics: [
      'Very small annual temperature range (~1.5°C) with uniform warmth all year.',
      'Heavy convectional rainfall (>2,000 mm/yr) with two equinoctial peaks (April & November).',
      'No true dry season; supports dense evergreen tropical rainforest.',
    ],
  },
  {
    id: 'khartoum',
    name: 'Sahara Desert (Wadi Halfa / Khartoum)',
    regionType: 'Hot Tropical Desert',
    hemisphere: 'N',
    latitudeLabel: '15.6°N, 32.5°E',
    tempC: [23.0, 25.0, 28.5, 32.0, 34.5, 34.2, 32.5, 31.8, 33.2, 32.0, 27.8, 24.2],
    rainMm: [0, 0, 0, 1, 4, 7, 45, 70, 20, 4, 0, 0],
    characteristics: [
      'Total annual rainfall < 250 mm (often < 150 mm), highly erratic.',
      'Large annual and diurnal temperature ranges due to cloudless skies.',
      'High evaporation rates; xerophytic plants (cacti, thorny bushes with deep roots).',
    ],
  },
  {
    id: 'capetown',
    name: 'Cape Town, South Africa',
    regionType: 'Mediterranean (Warm Temperate Western Margin)',
    hemisphere: 'S',
    latitudeLabel: '33.9°S, 18.4°E',
    tempC: [21.5, 21.4, 20.1, 17.5, 15.1, 13.2, 12.6, 13.1, 14.5, 16.5, 18.8, 20.6],
    rainMm: [15, 17, 20, 42, 70, 95, 85, 75, 45, 30, 18, 16],
    characteristics: [
      'Warm, dry summers (Dec–Feb in Southern Hemisphere) due to offshore trade winds.',
      'Mild, wet winters (May–Aug in Southern Hemisphere) due to onshore westerly winds.',
      'Famous for citrus fruits, viticulture (grapes), and evergreen sclerophyllous shrubs.',
    ],
  },
];

export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface CropStatRow {
  year: string;
  coffee: number;
  cashew: number;
  cotton: number;
  tea: number;
}

export const INITIAL_TANZANIA_CROP_STATS: CropStatRow[] = [
  { year: '2022', coffee: 68, cashew: 210, cotton: 145, tea: 38 },
  { year: '2023', coffee: 76, cashew: 235, cotton: 162, tea: 42 },
  { year: '2024', coffee: 84, cashew: 265, cotton: 178, tea: 46 },
  { year: '2025', coffee: 92, cashew: 290, cotton: 190, tea: 51 },
];

export interface PopulationCohort {
  ageGroup: string;
  malePct: number;
  femalePct: number;
}

export const POPULATION_PYRAMID_PRESETS: Record<
  'tanzania' | 'kenya' | 'japan',
  {
    name: string;
    shapeLabel: string;
    growthStage: string;
    cohorts: PopulationCohort[];
  }
> = {
  tanzania: {
    name: 'Tanzania (Developing / Expansive Pyramid)',
    shapeLabel: 'Broad Base · Rapidly Tapering Top',
    growthStage: 'High Birth Rate, Falling Death Rate, High Youth Dependency',
    cohorts: [
      { ageGroup: '0–14', malePct: 21.8, femalePct: 21.5 },
      { ageGroup: '15–29', malePct: 13.6, femalePct: 13.9 },
      { ageGroup: '30–44', malePct: 8.2, femalePct: 8.5 },
      { ageGroup: '45–59', malePct: 4.3, femalePct: 4.6 },
      { ageGroup: '60–74', malePct: 1.4, femalePct: 1.6 },
      { ageGroup: '75+', malePct: 0.3, femalePct: 0.3 },
    ],
  },
  kenya: {
    name: 'Transitional Developing Economy',
    shapeLabel: 'Moderately Broad Base · Expanding Working Cohort',
    growthStage: 'Declining Birth Rate, Growing Working-Age Population',
    cohorts: [
      { ageGroup: '0–14', malePct: 18.2, femalePct: 18.0 },
      { ageGroup: '15–29', malePct: 14.4, femalePct: 14.6 },
      { ageGroup: '30–44', malePct: 9.8, femalePct: 10.1 },
      { ageGroup: '45–59', malePct: 5.2, femalePct: 5.5 },
      { ageGroup: '60–74', malePct: 1.7, femalePct: 1.9 },
      { ageGroup: '75+', malePct: 0.3, femalePct: 0.3 },
    ],
  },
  japan: {
    name: 'Developed Country (Sweden / Japan — Constructive)',
    shapeLabel: 'Narrow Base · Bulging Middle & Wide Elderly Top',
    growthStage: 'Low Birth Rate, High Life Expectancy, High Old-Age Dependency',
    cohorts: [
      { ageGroup: '0–14', malePct: 6.1, femalePct: 5.8 },
      { ageGroup: '15–29', malePct: 7.5, femalePct: 7.2 },
      { ageGroup: '30–44', malePct: 9.4, femalePct: 9.2 },
      { ageGroup: '45–59', malePct: 11.2, femalePct: 11.4 },
      { ageGroup: '60–74', malePct: 9.8, femalePct: 10.6 },
      { ageGroup: '75+', malePct: 5.0, femalePct: 6.8 },
    ],
  },
};

/**
 * Generates elevation in meters (100m to 820m) at any Easting (32..40) and Northing (60..68)
 * on our synthetic 1:50,000 East African topographic map sheet ("KILIMA SHEET 124/2").
 */
export function getTopoElevationAt(easting: number, northing: number): number {
  // Primary peak (Mt. Kilima Trig Station Δ 785m) around (34.4, 65.6)
  const dx1 = easting - 34.4;
  const dy1 = northing - 65.6;
  const hill1 = 560 * Math.exp(-(dx1 * dx1 * 0.42 + dy1 * dy1 * 0.48));

  // Secondary ridge (Mwanga Hill 640m) around (38.0, 65.2)
  const dx2 = easting - 38.0;
  const dy2 = northing - 65.2;
  const hill2 = 410 * Math.exp(-(dx2 * dx2 * 0.38 + dy2 * dy2 * 0.42));

  // Southern spur around (35.8, 62.0)
  const dx3 = easting - 35.8;
  const dy3 = northing - 62.0;
  const hill3 = 230 * Math.exp(-(dx3 * dx3 * 0.4 + dy3 * dy3 * 0.5));

  // River valley depression running from N (36.2, 68) to SSW (35.5, 60)
  const riverAxis = 36.0 + (northing - 64) * 0.08;
  const distToRiver = Math.abs(easting - riverAxis);
  const valleyCut = -110 * Math.exp(-(distToRiver * distToRiver * 1.1));

  // Base plain elevation sloping gently southwards
  const base = 220 + (northing - 60) * 14;
  return Math.max(100, Math.round(base + hill1 + hill2 + hill3 + valleyCut));
}

export function getCompass16Direction(deg: number): string {
  const dirs = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return dirs[idx];
}

export function formatGridRef(easting: number, northing: number): {
  fourFig: string;
  sixFig: string;
  eMain: string;
  eTenth: number;
  nMain: string;
  nTenth: number;
} {
  const clampedE = Math.max(32, Math.min(39.99, easting));
  const clampedN = Math.max(60, Math.min(67.99, northing));
  const eFloor = Math.floor(clampedE);
  const nFloor = Math.floor(clampedN);
  const eTenth = Math.min(9, Math.floor((clampedE - eFloor) * 10 + 0.001));
  const nTenth = Math.min(9, Math.floor((clampedN - nFloor) * 10 + 0.001));
  const eMain = String(eFloor).padStart(2, '0');
  const nMain = String(nFloor).padStart(2, '0');
  return {
    fourFig: `${eMain}${nMain}`,
    sixFig: `${eMain}${eTenth}${nMain}${nTenth}`,
    eMain,
    eTenth,
    nMain,
    nTenth,
  };
}
