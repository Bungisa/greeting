import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Box,
  Compass,
  Eye,
  GitCommitHorizontal,
  Grid3X3,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  SquareStack,
} from 'lucide-react';
import {
  buildLinePlaneRig,
  buildPlanePlaneRig,
  BuiltIntersectionRig,
  LINE_PLANE_PRESETS,
  LinePlaneCase,
  LinePlaneParams,
  PLANE_PLANE_PRESETS,
  PlanePlaneCase,
  PlanePlaneParams,
} from './geometry3dIntersections';
import { MathFormula } from './MathFormula';
import { naturalMathToLatex } from './mathFormulaParser';

function solidFormulaToLatex(str: string): string {
  return (str || '')
    .replace(/TSA/g, '\\text{TSA}')
    .replace(/CSA/g, '\\text{CSA}')
    .replace(/A_base/g, 'A_{\\text{base}}')
    .replace(/⅓/g, '\\frac{1}{3}')
    .replace(/\(√3\/4\)/g, '\\frac{\\sqrt{3}}{4}')
    .replace(/\(√3\/12\)/g, '\\frac{\\sqrt{3}}{12}')
    .replace(/\(√3\/2\)/g, '\\frac{\\sqrt{3}}{2}')
    .replace(/\(3√3\/2\)/g, '\\frac{3\\sqrt{3}}{2}')
    .replace(/\(√2\/12\)/g, '\\frac{\\sqrt{2}}{12}')
    .replace(/\(5\/2\)/g, '\\frac{5}{2}')
    .replace(/\(3\/2\)/g, '\\frac{3}{2}')
    .replace(/\(4\/3\)/g, '\\frac{4}{3}')
    .replace(/\(2\/3\)/g, '\\frac{2}{3}')
    .replace(/√3/g, '\\sqrt{3}')
    .replace(/√2/g, '\\sqrt{2}')
    .replace(/π/g, '\\pi ')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/−/g, '-')
    .replace(/·/g, '\\cdot ');
}

export interface SolidFigures3DSimulationProps {
  darkMode?: boolean;
  activeClass?: string;
}

type StudioMode = 'solids' | 'plane_plane' | 'line_plane';

type SolidCategory = 'prism' | 'pyramid' | 'curved';

type SolidFigureId =
  | 'cube'
  | 'cuboid'
  | 'triangular_prism'
  | 'pentagonal_prism'
  | 'hexagonal_prism'
  | 'tetrahedron'
  | 'triangular_pyramid'
  | 'square_pyramid'
  | 'pentagonal_pyramid'
  | 'hexagonal_pyramid'
  | 'cylinder'
  | 'cone'
  | 'sphere'
  | 'hemisphere';

type VisualMode = 'solid' | 'xray' | 'wireframe';

interface FigureDimensions {
  a: number; // edge / base side
  w: number; // cuboid width
  h: number; // height / prism length
  r: number; // radius (cylinder / cone / sphere / hemisphere)
}

interface FigureSpec {
  id: SolidFigureId;
  name: string;
  shortName: string;
  category: SolidCategory;
  family: 'Polyhedron · Prism' | 'Polyhedron · Pyramid' | 'Curved Solid';
  faces: number;
  flatFaces: number;
  curvedFaces: number;
  edges: number;
  vertices: number;
  eulerNote: string;
  baseShape: string;
  lateralShape: string;
  crossSection: string;
  constructionRule: string;
  netSummary: string;
  sketchSteps: [string, string, string];
  areaFormula: string;
  volumeFormula: string;
  controls: Array<{ key: keyof FigureDimensions; label: string; min: number; max: number; step: number }>;
  defaults: FigureDimensions;
}

const FIGURE_SPECS: FigureSpec[] = [
  // ==================== PRISMS ====================
  {
    id: 'cube',
    name: 'Cube (Regular Hexahedron)',
    shortName: 'Cube',
    category: 'prism',
    family: 'Polyhedron · Prism',
    faces: 6,
    flatFaces: 6,
    curvedFaces: 0,
    edges: 12,
    vertices: 8,
    eulerNote: 'F + V − E = 6 + 8 − 12 = 2',
    baseShape: '2 congruent squares (a × a)',
    lateralShape: '4 congruent squares (a × a)',
    crossSection: 'Uniform square (a × a) along height',
    constructionRule: 'Translate a square of side a perpendicular to its plane by distance a.',
    netSummary: '6 congruent squares in a cross layout',
    sketchSteps: [
      'Draw 4 equal squares (a × a) in a vertical column for the front, base, back, and top faces.',
      'Attach 1 square to the left and 1 square to the right of the base square to form a cross.',
      'Mark all 5 internal shared edges as dashed fold lines and outer edges as solid cut lines.',
    ],
    areaFormula: 'TSA = 6a²',
    volumeFormula: 'V = a³',
    controls: [{ key: 'a', label: 'Edge (a)', min: 1.0, max: 2.8, step: 0.1 }],
    defaults: { a: 2.0, w: 1.8, h: 2.0, r: 1.0 },
  },
  {
    id: 'cuboid',
    name: 'Cuboid (Rectangular Prism)',
    shortName: 'Cuboid',
    category: 'prism',
    family: 'Polyhedron · Prism',
    faces: 6,
    flatFaces: 6,
    curvedFaces: 0,
    edges: 12,
    vertices: 8,
    eulerNote: 'F + V − E = 6 + 8 − 12 = 2',
    baseShape: '2 rectangles (l × w)',
    lateralShape: '2 pairs of rectangles (l × h and w × h)',
    crossSection: 'Uniform rectangle (l × w)',
    constructionRule: 'Extrude a base rectangle (l × w) vertically through height h.',
    netSummary: '3 pairs of opposite rectangles',
    sketchSteps: [
      'Draw the central base rectangle of length l and width w.',
      'Attach front/back rectangles (l × h) and top rectangle (l × w) along the length edges.',
      'Attach left and right side flaps (h × w) on the two width edges of the base.',
    ],
    areaFormula: 'TSA = 2(lw + lh + wh)',
    volumeFormula: 'V = l × w × h',
    controls: [
      { key: 'a', label: 'Length (l)', min: 1.2, max: 3.0, step: 0.1 },
      { key: 'w', label: 'Width (w)', min: 1.0, max: 2.4, step: 0.1 },
      { key: 'h', label: 'Height (h)', min: 0.9, max: 2.4, step: 0.1 },
    ],
    defaults: { a: 2.5, w: 1.7, h: 1.4, r: 1.0 },
  },
  {
    id: 'triangular_prism',
    name: 'Triangular Prism',
    shortName: 'Tri. Prism',
    category: 'prism',
    family: 'Polyhedron · Prism',
    faces: 5,
    flatFaces: 5,
    curvedFaces: 0,
    edges: 9,
    vertices: 6,
    eulerNote: 'F + V − E = 5 + 6 − 9 = 2',
    baseShape: '2 parallel equilateral triangles (side b)',
    lateralShape: '3 rectangles (b × L)',
    crossSection: 'Uniform triangle parallel to end caps',
    constructionRule: 'Join two parallel congruent triangles with 3 rectangular lateral faces of length L.',
    netSummary: '3 rectangles + 2 equilateral triangles',
    sketchSteps: [
      'Draw 3 side-by-side rectangles each measuring b × L (total strip width = 3b).',
      'Construct an equilateral triangle of side b on the top and bottom edges of the middle rectangle.',
      'Fold the outer rectangles up by 120° and the two triangle caps up by 90°.',
    ],
    areaFormula: 'TSA = (√3/2)b² + 3bL',
    volumeFormula: 'V = (√3/4)b²L',
    controls: [
      { key: 'a', label: 'Triangle side (b)', min: 1.2, max: 2.6, step: 0.1 },
      { key: 'h', label: 'Prism length (L)', min: 1.4, max: 3.2, step: 0.1 },
    ],
    defaults: { a: 2.0, w: 2.0, h: 2.5, r: 1.0 },
  },
  {
    id: 'pentagonal_prism',
    name: 'Regular Pentagonal Prism',
    shortName: 'Pent. Prism',
    category: 'prism',
    family: 'Polyhedron · Prism',
    faces: 7,
    flatFaces: 7,
    curvedFaces: 0,
    edges: 15,
    vertices: 10,
    eulerNote: 'F + V − E = 7 + 10 − 15 = 2',
    baseShape: '2 regular pentagons (5 sides, 108° interior)',
    lateralShape: '5 congruent rectangles (b × h)',
    crossSection: 'Uniform regular pentagon',
    constructionRule: 'Translate a regular pentagon of side b vertically by prism height h.',
    netSummary: '2 regular pentagons + 5 rectangular walls',
    sketchSteps: [
      'Draw a central regular pentagon of side b (interior angles = 108°).',
      'Extend a rectangle of width b and length h outward from each of the 5 pentagon edges.',
      'Attach the second regular pentagon (top cap) to the outer edge of one rectangular wall.',
    ],
    areaFormula: 'TSA ≈ 3.44 b² + 5bh',
    volumeFormula: 'V ≈ 1.72 b²h',
    controls: [
      { key: 'a', label: 'Pentagon side (b)', min: 0.8, max: 1.7, step: 0.05 },
      { key: 'h', label: 'Height (h)', min: 1.0, max: 2.6, step: 0.1 },
    ],
    defaults: { a: 1.2, w: 1.2, h: 1.7, r: 1.0 },
  },
  {
    id: 'hexagonal_prism',
    name: 'Regular Hexagonal Prism',
    shortName: 'Hex. Prism',
    category: 'prism',
    family: 'Polyhedron · Prism',
    faces: 8,
    flatFaces: 8,
    curvedFaces: 0,
    edges: 18,
    vertices: 12,
    eulerNote: 'F + V − E = 8 + 12 − 18 = 2',
    baseShape: '2 regular hexagons (6 sides, 120° interior)',
    lateralShape: '6 congruent rectangles (b × h)',
    crossSection: 'Uniform regular hexagon',
    constructionRule: 'Translate a regular hexagon of side b perpendicular to its base by height h.',
    netSummary: '2 regular hexagons + 6 rectangular walls',
    sketchSteps: [
      'Draw a central regular hexagon of side b (interior angles = 120°).',
      'Attach 6 rectangles (b × h) radially around all 6 edges of the base hexagon.',
      'Hinge the top regular hexagon cap onto the outer edge of the back rectangle.',
    ],
    areaFormula: 'TSA = 3√3 b² + 6bh',
    volumeFormula: 'V = (3√3/2) b²h',
    controls: [
      { key: 'a', label: 'Hexagon side (b)', min: 0.7, max: 1.5, step: 0.05 },
      { key: 'h', label: 'Height (h)', min: 1.0, max: 2.6, step: 0.1 },
    ],
    defaults: { a: 1.05, w: 1.05, h: 1.7, r: 1.0 },
  },

  // ==================== PYRAMIDS ====================
  {
    id: 'tetrahedron',
    name: 'Regular Tetrahedron',
    shortName: 'Tetrahedron',
    category: 'pyramid',
    family: 'Polyhedron · Pyramid',
    faces: 4,
    flatFaces: 4,
    curvedFaces: 0,
    edges: 6,
    vertices: 4,
    eulerNote: 'F + V − E = 4 + 4 − 6 = 2',
    baseShape: '1 equilateral triangle (all edges = a)',
    lateralShape: '3 equilateral triangles meeting at apex',
    crossSection: 'Shrinking equilateral triangle toward apex',
    constructionRule: 'Join 4 congruent equilateral triangles of edge a so 3 faces meet at every vertex.',
    netSummary: '4 congruent equilateral triangles',
    sketchSteps: [
      'Draw a large equilateral triangle of side 2a.',
      'Connect the midpoints of its 3 sides to subdivide it into 4 congruent equilateral triangles of side a.',
      'Fold the 3 outer triangles upward by 109.47° around the central base triangle.',
    ],
    areaFormula: 'TSA = √3 · a²',
    volumeFormula: 'V = (√2/12) a³',
    controls: [{ key: 'a', label: 'Edge (a)', min: 1.4, max: 3.0, step: 0.1 }],
    defaults: { a: 2.4, w: 2.4, h: 2.4, r: 1.0 },
  },
  {
    id: 'triangular_pyramid',
    name: 'Triangular Pyramid',
    shortName: 'Tri. Pyramid',
    category: 'pyramid',
    family: 'Polyhedron · Pyramid',
    faces: 4,
    flatFaces: 4,
    curvedFaces: 0,
    edges: 6,
    vertices: 4,
    eulerNote: 'F + V − E = 4 + 4 − 6 = 2',
    baseShape: '1 equilateral triangle (side b)',
    lateralShape: '3 isosceles triangles (base b, slant s)',
    crossSection: 'Similar triangle scaling down to apex',
    constructionRule: 'Connect all 3 vertices of an equilateral triangle base (side b) to an apex at height h.',
    netSummary: '1 equilateral triangle + 3 isosceles triangles',
    sketchSteps: [
      'Draw the central equilateral triangle base with side length b.',
      'Compute slant height s = √(h² + r_in²) where inradius r_in = b / (2√3).',
      'Construct 3 isosceles triangles of base b and altitude s on each base edge to form a 3-point star.',
    ],
    areaFormula: 'TSA = (√3/4)b² + (3/2)bs',
    volumeFormula: 'V = (√3/12) b²h',
    controls: [
      { key: 'a', label: 'Base side (b)', min: 1.4, max: 3.0, step: 0.1 },
      { key: 'h', label: 'Apex height (h)', min: 1.0, max: 3.0, step: 0.1 },
    ],
    defaults: { a: 2.3, w: 2.3, h: 2.1, r: 1.0 },
  },
  {
    id: 'square_pyramid',
    name: 'Square Pyramid',
    shortName: 'Sq. Pyramid',
    category: 'pyramid',
    family: 'Polyhedron · Pyramid',
    faces: 5,
    flatFaces: 5,
    curvedFaces: 0,
    edges: 8,
    vertices: 5,
    eulerNote: 'F + V − E = 5 + 5 − 8 = 2',
    baseShape: '1 square base (b × b)',
    lateralShape: '4 congruent isosceles triangles (slant s)',
    crossSection: 'Square scaling down to 0 at apex',
    constructionRule: 'Place an apex at vertical height h above the center of a square base (b × b).',
    netSummary: '1 square base + 4 isosceles triangles',
    sketchSteps: [
      'Draw a central square of side b.',
      'Calculate face slant height s = √((b/2)² + h²).',
      'Draw 4 isosceles triangles of base b and altitude s outward from all 4 sides of the square.',
    ],
    areaFormula: 'TSA = b² + 2bs',
    volumeFormula: 'V = ⅓ b²h',
    controls: [
      { key: 'a', label: 'Base side (b)', min: 1.2, max: 2.8, step: 0.1 },
      { key: 'h', label: 'Height (h)', min: 1.0, max: 3.0, step: 0.1 },
    ],
    defaults: { a: 2.2, w: 2.2, h: 2.1, r: 1.0 },
  },
  {
    id: 'pentagonal_pyramid',
    name: 'Regular Pentagonal Pyramid',
    shortName: 'Pent. Pyramid',
    category: 'pyramid',
    family: 'Polyhedron · Pyramid',
    faces: 6,
    flatFaces: 6,
    curvedFaces: 0,
    edges: 10,
    vertices: 6,
    eulerNote: 'F + V − E = 6 + 6 − 10 = 2',
    baseShape: '1 regular pentagon (5 sides of length b)',
    lateralShape: '5 congruent isosceles triangles (slant s)',
    crossSection: 'Regular pentagon tapering to apex',
    constructionRule: 'Connect all 5 vertices of a regular pentagon base to an apex at vertical height h.',
    netSummary: '1 regular pentagon + 5 isosceles triangles',
    sketchSteps: [
      'Draw a central regular pentagon with side b and apothem r_in = b / (2 tan 36°).',
      'Find slant height s = √(r_in² + h²).',
      'Construct 5 isosceles triangles of base b and altitude s radiating from each pentagon edge.',
    ],
    areaFormula: 'TSA = A_base + (5/2)bs',
    volumeFormula: 'V = ⅓ A_base · h',
    controls: [
      { key: 'a', label: 'Pentagon side (b)', min: 0.9, max: 2.0, step: 0.05 },
      { key: 'h', label: 'Apex height (h)', min: 1.0, max: 3.0, step: 0.1 },
    ],
    defaults: { a: 1.4, w: 1.4, h: 2.1, r: 1.0 },
  },
  {
    id: 'hexagonal_pyramid',
    name: 'Regular Hexagonal Pyramid',
    shortName: 'Hex. Pyramid',
    category: 'pyramid',
    family: 'Polyhedron · Pyramid',
    faces: 7,
    flatFaces: 7,
    curvedFaces: 0,
    edges: 12,
    vertices: 7,
    eulerNote: 'F + V − E = 7 + 7 − 12 = 2',
    baseShape: '1 regular hexagon (6 sides of length b)',
    lateralShape: '6 congruent isosceles triangles (slant s)',
    crossSection: 'Regular hexagon tapering to apex',
    constructionRule: 'Connect all 6 vertices of a regular hexagon base to an apex at height h.',
    netSummary: '1 regular hexagon + 6 isosceles triangles',
    sketchSteps: [
      'Draw a central regular hexagon with side b and apothem r_in = (√3/2)b.',
      'Calculate slant height s = √(r_in² + h²).',
      'Draw 6 isosceles triangles of base b and altitude s on all 6 edges to form a 6-point star.',
    ],
    areaFormula: 'TSA = (3√3/2)b² + 3bs',
    volumeFormula: 'V = (√3/2) b²h',
    controls: [
      { key: 'a', label: 'Hexagon side (b)', min: 0.8, max: 1.8, step: 0.05 },
      { key: 'h', label: 'Apex height (h)', min: 1.0, max: 3.0, step: 0.1 },
    ],
    defaults: { a: 1.25, w: 1.25, h: 2.1, r: 1.0 },
  },

  // ==================== CURVED SOLIDS ====================
  {
    id: 'cylinder',
    name: 'Right Circular Cylinder',
    shortName: 'Cylinder',
    category: 'curved',
    family: 'Curved Solid',
    faces: 3,
    flatFaces: 2,
    curvedFaces: 1,
    edges: 2,
    vertices: 0,
    eulerNote: '2 flat circular bases + 1 curved lateral wall',
    baseShape: '2 parallel congruent circles (radius r)',
    lateralShape: '1 curved surface unrolling to rectangle (2πr × h)',
    crossSection: 'Uniform circle of radius r',
    constructionRule: 'Revolve a rectangle of width r and height h through 360° around one vertical side.',
    netSummary: '1 rectangle (2πr × h) + 2 circles',
    sketchSteps: [
      'Draw a central rectangle of width 2πr (circumference) and height h.',
      'Draw two circles of radius r tangent to the top and bottom horizontal edges of the rectangle.',
      'Roll the rectangle into a tube of radius r and fold both circular caps by 90°.',
    ],
    areaFormula: 'TSA = 2πr² + 2πrh',
    volumeFormula: 'V = πr²h',
    controls: [
      { key: 'r', label: 'Radius (r)', min: 0.55, max: 1.25, step: 0.05 },
      { key: 'h', label: 'Height (h)', min: 1.2, max: 2.8, step: 0.1 },
    ],
    defaults: { a: 2.0, w: 2.0, h: 2.1, r: 0.9 },
  },
  {
    id: 'cone',
    name: 'Right Circular Cone',
    shortName: 'Cone',
    category: 'curved',
    family: 'Curved Solid',
    faces: 2,
    flatFaces: 1,
    curvedFaces: 1,
    edges: 1,
    vertices: 1,
    eulerNote: '1 flat circular base + 1 curved lateral sector + 1 apex',
    baseShape: '1 circular base (radius r)',
    lateralShape: '1 circular sector of radius l = √(r² + h²)',
    crossSection: 'Circle tapering linearly to apex',
    constructionRule: 'Revolve a right triangle of base r and height h through 360° around its vertical leg h.',
    netSummary: '1 circular sector (radius l) + 1 base circle',
    sketchSteps: [
      'Compute slant height l = √(r² + h²) and sector angle θ = (r / l) × 360°.',
      'Draw a circular sector of radius l and central angle θ (its arc length equals 2πr).',
      'Draw the base circle of radius r tangent to the curved arc of the sector.',
    ],
    areaFormula: 'TSA = πr² + πrl',
    volumeFormula: 'V = ⅓ πr²h',
    controls: [
      { key: 'r', label: 'Base radius (r)', min: 0.6, max: 1.35, step: 0.05 },
      { key: 'h', label: 'Height (h)', min: 1.2, max: 2.9, step: 0.1 },
    ],
    defaults: { a: 2.0, w: 2.0, h: 2.2, r: 1.05 },
  },
  {
    id: 'sphere',
    name: 'Sphere',
    shortName: 'Sphere',
    category: 'curved',
    family: 'Curved Solid',
    faces: 1,
    flatFaces: 0,
    curvedFaces: 1,
    edges: 0,
    vertices: 0,
    eulerNote: '1 continuous doubly-curved surface (Gaussian curvature 1/r²)',
    baseShape: 'No flat base (all points distance r from center)',
    lateralShape: 'Unfolds into 12 meridian gores (flower-petal net)',
    crossSection: 'Circle of maximum radius r (Great Circle)',
    constructionRule: 'Revolve a semicircle of radius r through 360° around its diameter.',
    netSummary: '12 meridian gores joined at the South Pole',
    sketchSteps: [
      'A sphere has double curvature and cannot be flattened without slicing into meridian gores.',
      'Divide the equator circumference 2πr into 12 equal lens-shaped gores of max width πr/6 and length πr.',
      'Join the 12 gores radially around the South Pole so their curved edges meet at the North Pole when folded.',
    ],
    areaFormula: 'TSA = 4πr²',
    volumeFormula: 'V = (4/3)πr³',
    controls: [{ key: 'r', label: 'Radius (r)', min: 0.7, max: 1.6, step: 0.05 }],
    defaults: { a: 2.0, w: 2.0, h: 2.0, r: 1.15 },
  },
  {
    id: 'hemisphere',
    name: 'Hemisphere',
    shortName: 'Hemisphere',
    category: 'curved',
    family: 'Curved Solid',
    faces: 2,
    flatFaces: 1,
    curvedFaces: 1,
    edges: 1,
    vertices: 0,
    eulerNote: '1 flat circular base (πr²) + 1 curved dome (2πr²)',
    baseShape: '1 flat circular base (great circle of radius r)',
    lateralShape: 'Curved dome unfolding into 12 half-meridian gores',
    crossSection: 'Circle parallel to base, or semicircle vertically',
    constructionRule: 'Bisect a sphere of radius r with a plane passing directly through its center.',
    netSummary: '1 circular base + 12 half-meridian petal gores',
    sketchSteps: [
      'Draw the flat circular base of radius r in the center.',
      'Around its circumference (2πr), attach 12 triangular-arched petal gores of base width πr/6 and arc length πr/2.',
      'Curl the 12 petals upward by 90° so their tips converge at the top pole at height r.',
    ],
    areaFormula: 'TSA = 3πr² (CSA = 2πr²)',
    volumeFormula: 'V = (2/3)πr³',
    controls: [{ key: 'r', label: 'Radius (r)', min: 0.75, max: 1.65, step: 0.05 }],
    defaults: { a: 2.0, w: 2.0, h: 2.0, r: 1.25 },
  },
];

// Harmonious studio palette matching each face role across 3D and 2D net views
const FACE_COLORS = {
  base: '#f59e0b', // warm amber base
  top: '#10b981', // emerald top cap
  front: '#38bdf8', // sky front
  back: '#6366f1', // indigo back
  left: '#06b6d4', // cyan left
  right: '#ec4899', // rose right
  lateral: '#38bdf8', // curved lateral wall
};

function createFaceGridTexture(baseHex: string, labelText?: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle architectural sheen gradient
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, 'rgba(255,255,255,0.22)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.03)');
  grad.addColorStop(1, 'rgba(15,23,42,0.16)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Fine millimeter drafting lines
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1.5;
  for (let i = 32; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  // Crisp inner border inset
  ctx.strokeStyle = 'rgba(15,23,42,0.25)';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 248, 248);

  if (labelText) {
    ctx.font = '800 30px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(15,23,42,0.68)';
    ctx.fillText(labelText, 128, 128);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

interface BuiltSolidRig {
  root: THREE.Group;
  updateFold: (foldFactor: number) => void;
  setVisualMode: (mode: VisualMode) => void;
  dispose: () => void;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Builds an articulated 3D solid & unfolding net rig for the requested figure and dimensions.
 * foldFactor = 1 -> closed 3D solid; foldFactor = 0 -> flat 2D net resting on y = 0.
 */
function buildSolidRig(
  figureId: SolidFigureId,
  dims: FigureDimensions,
  showFaceLabels: boolean
): BuiltSolidRig {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const surfaceMeshes: THREE.Mesh[] = [];
  const edgeLines: THREE.LineSegments[] = [];
  const heightGuides: THREE.Object3D[] = [];

  const SLAB_THICKNESS = 0.028;

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const makeFaceMaterial = (hex: string, label?: string) => {
    const tex = createFaceGridTexture(hex, showFaceLabels ? label : undefined);
    textures.push(tex);
    const mat = trackMat(
      new THREE.MeshPhysicalMaterial({
        map: tex,
        color: new THREE.Color('#ffffff'),
        roughness: 0.28,
        metalness: 0.06,
        clearcoat: 0.55,
        clearcoatRoughness: 0.18,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0,
      })
    );
    return mat;
  };

  const edgeLineMat = trackMat(
    new THREE.LineBasicMaterial({
      color: new THREE.Color('#0f172a'),
      transparent: true,
      opacity: 0.88,
    })
  );

  // Create a flat rectangular panel lying in the XZ plane with subtle thickness
  const makeRectPanel = (
    widthX: number,
    depthZ: number,
    offsetX: number,
    offsetZ: number,
    colorHex: string,
    label?: string
  ): THREE.Group => {
    const g = new THREE.Group();
    const geo = trackGeo(new THREE.BoxGeometry(widthX, SLAB_THICKNESS, depthZ));
    geo.translate(offsetX, SLAB_THICKNESS * 0.5, offsetZ);
    const mat = makeFaceMaterial(colorHex, label);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    surfaceMeshes.push(mesh);
    g.add(mesh);

    const edgesGeo = trackGeo(new THREE.EdgesGeometry(geo));
    const lines = new THREE.LineSegments(edgesGeo, edgeLineMat);
    edgeLines.push(lines);
    g.add(lines);
    return g;
  };

  // Create a triangular panel lying in the XZ plane from 3 (x, z) points
  const makeTrianglePanel = (
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    colorHex: string,
    label?: string
  ): THREE.Group => {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    // Shape is in XY; after rotateX(-PI/2), shape (x, y) -> world (x, 0, -y)
    shape.moveTo(p0[0], -p0[1]);
    shape.lineTo(p1[0], -p1[1]);
    shape.lineTo(p2[0], -p2[1]);
    shape.closePath();

    const geo = trackGeo(
      new THREE.ExtrudeGeometry(shape, {
        depth: SLAB_THICKNESS,
        bevelEnabled: false,
      })
    );
    geo.rotateX(-Math.PI / 2);

    // Normalize UVs cleanly into [0, 1] for crisp face grid texture
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const sizeX = Math.max(0.001, bb.max.x - bb.min.x);
    const sizeZ = Math.max(0.001, bb.max.z - bb.min.z);
    const posAttr = geo.getAttribute('position');
    const uvAttr = geo.getAttribute('uv');
    if (posAttr && uvAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        const u = (posAttr.getX(i) - bb.min.x) / sizeX;
        const v = (posAttr.getZ(i) - bb.min.z) / sizeZ;
        uvAttr.setXY(i, u, v);
      }
      uvAttr.needsUpdate = true;
    }

    const mat = makeFaceMaterial(colorHex, label);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    surfaceMeshes.push(mesh);
    g.add(mesh);

    const edgesGeo = trackGeo(new THREE.EdgesGeometry(geo, 18));
    const lines = new THREE.LineSegments(edgesGeo, edgeLineMat);
    edgeLines.push(lines);
    g.add(lines);
    return g;
  };

  // Create a circular disc panel lying in the XZ plane
  const makeCirclePanel = (
    radius: number,
    offsetX: number,
    offsetZ: number,
    colorHex: string,
    label?: string
  ): THREE.Group => {
    const g = new THREE.Group();
    const geo = trackGeo(new THREE.CylinderGeometry(radius, radius, SLAB_THICKNESS, 48));
    geo.translate(offsetX, SLAB_THICKNESS * 0.5, offsetZ);
    const mat = makeFaceMaterial(colorHex, label);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    surfaceMeshes.push(mesh);
    g.add(mesh);

    const edgesGeo = trackGeo(new THREE.EdgesGeometry(geo, 30));
    const lines = new THREE.LineSegments(edgesGeo, edgeLineMat);
    edgeLines.push(lines);
    g.add(lines);
    return g;
  };

  // Dashed internal vertical height axis (visible in X-Ray / Solid center reference)
  const addHeightAxis = (height: number, x = 0, z = 0) => {
    const pts = [new THREE.Vector3(x, 0.02, z), new THREE.Vector3(x, height, z)];
    const lineGeo = trackGeo(new THREE.BufferGeometry().setFromPoints(pts));
    const lineMat = trackMat(
      new THREE.LineDashedMaterial({
        color: new THREE.Color('#f59e0b'),
        dashSize: 0.14,
        gapSize: 0.09,
        transparent: true,
        opacity: 0.9,
      })
    );
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    root.add(line);
    heightGuides.push(line);
  };

  let updateFold = (_f: number) => {};

  // ============================================================================
  // 1. CUBE & 2. CUBOID (Exact 6-Face Cross Net)
  // ============================================================================
  if (figureId === 'cube' || figureId === 'cuboid') {
    const L = dims.a;
    const W = figureId === 'cube' ? dims.a : dims.w;
    const H = figureId === 'cube' ? dims.a : dims.h;

    const base = makeRectPanel(L, W, 0, 0, FACE_COLORS.base, 'BASE');
    root.add(base);

    const frontHinge = new THREE.Group();
    frontHinge.position.set(0, 0, W / 2);
    frontHinge.add(makeRectPanel(L, H, 0, H / 2, FACE_COLORS.front, 'FRONT'));
    root.add(frontHinge);

    const backHinge = new THREE.Group();
    backHinge.position.set(0, 0, -W / 2);
    backHinge.add(makeRectPanel(L, H, 0, -H / 2, FACE_COLORS.back, 'BACK'));
    root.add(backHinge);

    const topHinge = new THREE.Group();
    topHinge.position.set(0, 0, -H);
    topHinge.add(makeRectPanel(L, W, 0, -W / 2, FACE_COLORS.top, 'TOP'));
    backHinge.add(topHinge);

    const rightHinge = new THREE.Group();
    rightHinge.position.set(L / 2, 0, 0);
    rightHinge.add(makeRectPanel(H, W, H / 2, 0, FACE_COLORS.right, 'RIGHT'));
    root.add(rightHinge);

    const leftHinge = new THREE.Group();
    leftHinge.position.set(-L / 2, 0, 0);
    leftHinge.add(makeRectPanel(H, W, -H / 2, 0, FACE_COLORS.left, 'LEFT'));
    root.add(leftHinge);

    addHeightAxis(H, 0, 0);

    updateFold = (f: number) => {
      // Smooth staggered fold: side walls rise slightly ahead of the top lid for natural clarity
      const wallF = smoothstep(0.0, 0.86, f);
      const topF = smoothstep(0.16, 1.0, f);
      const q = Math.PI / 2;
      frontHinge.rotation.x = -wallF * q;
      backHinge.rotation.x = wallF * q;
      topHinge.rotation.x = topF * q;
      rightHinge.rotation.z = wallF * q;
      leftHinge.rotation.z = -wallF * q;
      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.65;
      });
    };
  }

  // ============================================================================
  // 3. SQUARE PYRAMID (1 Square Base + 4 Isosceles Triangular Faces)
  // ============================================================================
  else if (figureId === 'square_pyramid') {
    const b = dims.a;
    const h = dims.h;
    const s = Math.hypot(b / 2, h);
    const foldAngle = Math.PI - Math.atan2(h, b / 2);

    const base = makeRectPanel(b, b, 0, 0, FACE_COLORS.base, 'BASE');
    root.add(base);

    const frontHinge = new THREE.Group();
    frontHinge.position.set(0, 0, b / 2);
    frontHinge.add(makeTrianglePanel([-b / 2, 0], [b / 2, 0], [0, s], FACE_COLORS.front, 'FRONT'));
    root.add(frontHinge);

    const backHinge = new THREE.Group();
    backHinge.position.set(0, 0, -b / 2);
    backHinge.add(makeTrianglePanel([-b / 2, 0], [b / 2, 0], [0, -s], FACE_COLORS.back, 'BACK'));
    root.add(backHinge);

    const rightHinge = new THREE.Group();
    rightHinge.position.set(b / 2, 0, 0);
    rightHinge.add(makeTrianglePanel([0, -b / 2], [0, b / 2], [s, 0], FACE_COLORS.right, 'RIGHT'));
    root.add(rightHinge);

    const leftHinge = new THREE.Group();
    leftHinge.position.set(-b / 2, 0, 0);
    leftHinge.add(makeTrianglePanel([0, -b / 2], [0, b / 2], [-s, 0], FACE_COLORS.left, 'LEFT'));
    root.add(leftHinge);

    addHeightAxis(h, 0, 0);

    updateFold = (f: number) => {
      const eF = smoothstep(0, 1, f);
      frontHinge.rotation.x = -eF * foldAngle;
      backHinge.rotation.x = eF * foldAngle;
      rightHinge.rotation.z = eF * foldAngle;
      leftHinge.rotation.z = -eF * foldAngle;
      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.65;
      });
    };
  }

  // ============================================================================
  // 4. TRIANGULAR PRISM (3 Rectangles + 2 Equilateral Triangle End-Caps)
  // ============================================================================
  else if (figureId === 'triangular_prism') {
    const b = dims.a;
    const L = dims.h;
    const triH = (Math.sqrt(3) / 2) * b;

    const base = makeRectPanel(b, L, 0, 0, FACE_COLORS.base, 'BASE');
    root.add(base);

    const rightHinge = new THREE.Group();
    rightHinge.position.set(b / 2, 0, 0);
    rightHinge.add(makeRectPanel(b, L, b / 2, 0, FACE_COLORS.right, 'SIDE 1'));
    root.add(rightHinge);

    const leftHinge = new THREE.Group();
    leftHinge.position.set(-b / 2, 0, 0);
    leftHinge.add(makeRectPanel(b, L, -b / 2, 0, FACE_COLORS.left, 'SIDE 2'));
    root.add(leftHinge);

    const frontCapHinge = new THREE.Group();
    frontCapHinge.position.set(0, 0, L / 2);
    frontCapHinge.add(makeTrianglePanel([-b / 2, 0], [b / 2, 0], [0, triH], FACE_COLORS.front, 'END 1'));
    root.add(frontCapHinge);

    const backCapHinge = new THREE.Group();
    backCapHinge.position.set(0, 0, -L / 2);
    backCapHinge.add(makeTrianglePanel([-b / 2, 0], [b / 2, 0], [0, -triH], FACE_COLORS.top, 'END 2'));
    root.add(backCapHinge);

    addHeightAxis(triH, 0, 0);

    updateFold = (f: number) => {
      const sideF = smoothstep(0.0, 0.9, f);
      const capF = smoothstep(0.12, 1.0, f);
      const lateralAngle = (2 * Math.PI) / 3; // 120 deg exterior fold -> 60 deg equilateral interior
      rightHinge.rotation.z = sideF * lateralAngle;
      leftHinge.rotation.z = -sideF * lateralAngle;
      frontCapHinge.rotation.x = -capF * (Math.PI / 2);
      backCapHinge.rotation.x = capF * (Math.PI / 2);
      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.65;
      });
    };
  }

  // ============================================================================
  // 5. REGULAR TETRAHEDRON (4 Equilateral Triangles)
  // ============================================================================
  else if (figureId === 'tetrahedron') {
    const a = dims.a;
    const triH = (Math.sqrt(3) / 2) * a;
    const rIn = a / (2 * Math.sqrt(3));
    const rOut = a / Math.sqrt(3);
    const tetHeight = a * Math.sqrt(2 / 3);
    const foldAngle = Math.PI - Math.acos(1 / 3); // exact 109.4712°

    const base = makeTrianglePanel([0, -rOut], [a / 2, rIn], [-a / 2, rIn], FACE_COLORS.base, 'BASE');
    root.add(base);

    const flapConfigs = [
      { yaw: 0, color: FACE_COLORS.front, label: 'FACE 1' },
      { yaw: (2 * Math.PI) / 3, color: FACE_COLORS.right, label: 'FACE 2' },
      { yaw: -(2 * Math.PI) / 3, color: FACE_COLORS.left, label: 'FACE 3' },
    ];

    const flapHinges: THREE.Group[] = [];
    for (const fc of flapConfigs) {
      const yawGroup = new THREE.Group();
      yawGroup.rotation.y = fc.yaw;
      root.add(yawGroup);

      const hinge = new THREE.Group();
      hinge.position.set(0, 0, rIn);
      hinge.add(makeTrianglePanel([-a / 2, 0], [a / 2, 0], [0, triH], fc.color, fc.label));
      yawGroup.add(hinge);
      flapHinges.push(hinge);
    }

    addHeightAxis(tetHeight, 0, 0);

    updateFold = (f: number) => {
      const eF = smoothstep(0, 1, f);
      for (const hinge of flapHinges) {
        hinge.rotation.x = -eF * foldAngle;
      }
      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.65;
      });
    };
  }

  // ============================================================================
  // 6. RIGHT CIRCULAR CYLINDER (Unrolling Curved Sheet + 2 Hinged Circles)
  // ============================================================================
  else if (figureId === 'cylinder') {
    const r = dims.r;
    const h = dims.h;
    const circumference = 2 * Math.PI * r;
    const SEG_X = 48;

    const standPivot = new THREE.Group();
    root.add(standPivot);

    const rollGroup = new THREE.Group();
    standPivot.add(rollGroup);

    // Build deformable lateral sheet geometry (SEG_X columns x 2 rows)
    const sheetGeo = trackGeo(new THREE.PlaneGeometry(circumference, h, SEG_X, 1));
    const sheetMat = makeFaceMaterial(FACE_COLORS.lateral, 'LATERAL (2πr × h)');
    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    sheetMesh.castShadow = true;
    sheetMesh.receiveShadow = true;
    surfaceMeshes.push(sheetMesh);
    rollGroup.add(sheetMesh);

    // Outline border line loop for the sheet (4 edges)
    const borderPositions = new Float32Array((SEG_X + 1) * 2 * 3 + 4 * 3);
    const borderGeo = trackGeo(new THREE.BufferGeometry());
    borderGeo.setAttribute('position', new THREE.BufferAttribute(borderPositions, 3));
    const topEdgeGeo = trackGeo(new THREE.BufferGeometry());
    const topEdgePts = new Float32Array((SEG_X + 1) * 3);
    topEdgeGeo.setAttribute('position', new THREE.BufferAttribute(topEdgePts, 3));
    const botEdgeGeo = trackGeo(new THREE.BufferGeometry());
    const botEdgePts = new Float32Array((SEG_X + 1) * 3);
    botEdgeGeo.setAttribute('position', new THREE.BufferAttribute(botEdgePts, 3));

    const topEdgeLine = new THREE.Line(topEdgeGeo, edgeLineMat);
    const botEdgeLine = new THREE.Line(botEdgeGeo, edgeLineMat);
    rollGroup.add(topEdgeLine);
    rollGroup.add(botEdgeLine);

    // Two circular caps hinged at z = +h/2 and z = -h/2
    const frontCircleHinge = new THREE.Group();
    frontCircleHinge.position.set(0, 0, h / 2);
    frontCircleHinge.add(makeCirclePanel(r, 0, r, FACE_COLORS.base, 'BASE'));
    rollGroup.add(frontCircleHinge);

    const backCircleHinge = new THREE.Group();
    backCircleHinge.position.set(0, 0, -h / 2);
    backCircleHinge.add(makeCirclePanel(r, 0, -r, FACE_COLORS.top, 'TOP'));
    rollGroup.add(backCircleHinge);

    addHeightAxis(h, 0, 0);

    const updateSheetVertices = (rollF: number) => {
      const pos = sheetGeo.getAttribute('position') as THREE.BufferAttribute;
      const topAttr = topEdgeGeo.getAttribute('position') as THREE.BufferAttribute;
      const botAttr = botEdgeGeo.getAttribute('position') as THREE.BufferAttribute;

      for (let ix = 0; ix <= SEG_X; ix++) {
        const u = ix / SEG_X - 0.5; // -0.5 .. +0.5
        const s = u * circumference;
        let x: number;
        let y: number;
        if (rollF < 0.002) {
          x = s;
          y = SLAB_THICKNESS * 0.5;
        } else {
          const R = r / rollF;
          const theta = (s / r) * rollF;
          x = R * Math.sin(theta);
          y = R * (1 - Math.cos(theta)) + SLAB_THICKNESS * 0.5;
        }

        // Row 0 -> z = -h/2, Row 1 -> z = +h/2
        const idx0 = ix;
        const idx1 = SEG_X + 1 + ix;
        pos.setXYZ(idx0, x, y, -h / 2);
        pos.setXYZ(idx1, x, y, +h / 2);

        topAttr.setXYZ(ix, x, y + 0.004, -h / 2);
        botAttr.setXYZ(ix, x, y + 0.004, +h / 2);
      }
      pos.needsUpdate = true;
      topAttr.needsUpdate = true;
      botAttr.needsUpdate = true;
      sheetGeo.computeVertexNormals();
    };

    updateSheetVertices(1);

    updateFold = (f: number) => {
      // Phase 1 (0 -> 0.72): Roll lateral rectangle into cylinder & fold caps shut
      // Phase 2 (0.72 -> 1.0): Tip closed cylinder upright so it stands cleanly on its circular base!
      const rollF = smoothstep(0.0, 0.72, f);
      const capF = smoothstep(0.08, 0.72, f);
      const standF = smoothstep(0.72, 1.0, f);

      updateSheetVertices(rollF);
      frontCircleHinge.rotation.x = -capF * (Math.PI / 2);
      backCircleHinge.rotation.x = capF * (Math.PI / 2);

      // Stand upright around front edge z = +h/2 and keep centered at x=0, z=0
      standPivot.position.set(0, 0, standF * (-r) + (1 - standF) * (h / 2));
      rollGroup.position.set(0, 0, -h / 2);
      standPivot.rotation.x = standF * (Math.PI / 2);

      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.92;
      });
    };
  }

  // ============================================================================
  // 7. RIGHT CIRCULAR CONE (Isometric Sector Curling + Hinged Base Circle)
  // ============================================================================
  else if (figureId === 'cone') {
    const r = dims.r;
    const h = dims.h;
    const slantL = Math.hypot(r, h);
    const sectorAlpha = (2 * Math.PI * r) / slantL;
    const coneSlopeAngle = Math.atan2(h, r); // angle between slant generator and base plane

    // Fixed base circle resting flat on y = 0, centered at (0, 0, 0)
    const baseCircle = makeCirclePanel(r, 0, 0, FACE_COLORS.base, 'BASE');
    root.add(baseCircle);

    // Lateral cone pivoted at front tangent point (0, 0, +r)
    const coneTiltPivot = new THREE.Group();
    coneTiltPivot.position.set(0, 0, r);
    root.add(coneTiltPivot);

    const SEG_THETA = 52;
    const coneGeo = trackGeo(new THREE.BufferGeometry());
    const vertCount = (SEG_THETA + 1) * 2;
    const positions = new Float32Array(vertCount * 3);
    const uvs = new Float32Array(vertCount * 2);
    const indices: number[] = [];

    for (let i = 0; i <= SEG_THETA; i++) {
      const t = i / SEG_THETA;
      uvs[i * 2] = t;
      uvs[i * 2 + 1] = 1; // apex row
      uvs[(SEG_THETA + 1 + i) * 2] = t;
      uvs[(SEG_THETA + 1 + i) * 2 + 1] = 0; // rim row
    }
    for (let i = 0; i < SEG_THETA; i++) {
      const a0 = i;
      const a1 = i + 1;
      const r0 = SEG_THETA + 1 + i;
      const r1 = SEG_THETA + 1 + i + 1;
      indices.push(a0, r0, r1);
      indices.push(a0, r1, a1);
    }
    coneGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    coneGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    coneGeo.setIndex(indices);

    const coneMat = makeFaceMaterial(FACE_COLORS.lateral, 'SECTOR (πrl)');
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.castShadow = true;
    coneMesh.receiveShadow = true;
    surfaceMeshes.push(coneMesh);
    coneTiltPivot.add(coneMesh);

    // Rim outline curve
    const rimLineGeo = trackGeo(new THREE.BufferGeometry());
    const rimLinePts = new Float32Array((SEG_THETA + 3) * 3);
    rimLineGeo.setAttribute('position', new THREE.BufferAttribute(rimLinePts, 3));
    const rimLine = new THREE.Line(rimLineGeo, edgeLineMat);
    coneTiltPivot.add(rimLine);

    addHeightAxis(h, 0, 0);

    const updateConeGeometry = (curlF: number) => {
      const phiSpan = sectorAlpha + curlF * (2 * Math.PI - sectorAlpha);
      const R = (2 * Math.PI * r) / phiSpan;
      const H = Math.sqrt(Math.max(0, slantL * slantL - R * R));

      const pos = coneGeo.getAttribute('position') as THREE.BufferAttribute;
      const rimAttr = rimLineGeo.getAttribute('position') as THREE.BufferAttribute;

      // In coneTiltPivot local space: tangent rim point theta=0 is at (0, 0, 0);
      // rim circle center is at (0, 0, -R); apex is at (0, H, -R).
      for (let i = 0; i <= SEG_THETA; i++) {
        const theta = (i / SEG_THETA - 0.5) * phiSpan;
        const rx = R * Math.sin(theta);
        const rz = R * Math.cos(theta) - R;

        pos.setXYZ(i, 0, H + SLAB_THICKNESS * 0.5, -R);
        pos.setXYZ(SEG_THETA + 1 + i, rx, SLAB_THICKNESS * 0.5, rz);
        rimAttr.setXYZ(i + 1, rx, SLAB_THICKNESS * 0.5 + 0.004, rz);
      }
      // Close the two straight slant seams back to apex
      rimAttr.setXYZ(0, 0, H + SLAB_THICKNESS * 0.5 + 0.004, -R);
      rimAttr.setXYZ(SEG_THETA + 2, 0, H + SLAB_THICKNESS * 0.5 + 0.004, -R);

      pos.needsUpdate = true;
      rimAttr.needsUpdate = true;
      coneGeo.computeVertexNormals();
      return { R, H };
    };

    updateConeGeometry(1);

    updateFold = (f: number) => {
      // Phase 1 (0 -> 0.58): Curl flat circular sector on the ground into a closed hollow cone lying on its side
      // Phase 2 (0.58 -> 1.0): Tip closed cone upright around the tangent point (0, 0, +r) directly onto the base circle!
      const curlF = smoothstep(0.0, 0.58, f);
      const tipF = smoothstep(0.58, 1.0, f);

      const { R, H } = updateConeGeometry(curlF);
      const currentSlopeAngle = Math.atan2(H, R);
      const restTilt = Math.PI - currentSlopeAngle; // puts generator flat along +Z on the ground
      coneTiltPivot.rotation.x = (1 - tipF) * restTilt;

      // Gently re-center net slightly toward origin when unfolded so the entire net stays framed
      root.position.z = (1 - tipF) * (-slantL * 0.35);

      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.92;
      });
    };
    void coneSlopeAngle;
  }

  // ============================================================================
  // 8. TRIANGULAR, PENTAGONAL & HEXAGONAL PYRAMIDS (Regular N-gon Base + N Hinged Triangles)
  // ============================================================================
  else if (
    figureId === 'triangular_pyramid' ||
    figureId === 'pentagonal_pyramid' ||
    figureId === 'hexagonal_pyramid'
  ) {
    const N = figureId === 'triangular_pyramid' ? 3 : figureId === 'pentagonal_pyramid' ? 5 : 6;
    const b = dims.a;
    const h = dims.h;
    const rIn = b / (2 * Math.tan(Math.PI / N));
    const s = Math.hypot(rIn, h);
    const foldAngle = Math.PI - Math.atan2(h, rIn);

    // Build regular N-gon base with edge 0 centered at z = +rIn, x in [-b/2, +b/2]
    const polyPts: Array<[number, number]> = [];
    for (let k = 0; k < N; k++) {
      const ang = (k * 2 * Math.PI) / N;
      const c = Math.cos(ang);
      const sn = Math.sin(ang);
      const lx = b / 2;
      const lz = rIn;
      polyPts.push([lx * c + lz * sn, -lx * sn + lz * c]);
    }

    const baseGroup = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(polyPts[0][0], -polyPts[0][1]);
    for (let k = 1; k < N; k++) {
      shape.lineTo(polyPts[k][0], -polyPts[k][1]);
    }
    shape.closePath();

    const baseGeo = trackGeo(
      new THREE.ExtrudeGeometry(shape, { depth: SLAB_THICKNESS, bevelEnabled: false })
    );
    baseGeo.rotateX(-Math.PI / 2);
    const baseMat = makeFaceMaterial(FACE_COLORS.base, 'BASE');
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    surfaceMeshes.push(baseMesh);
    baseGroup.add(baseMesh);

    const baseEdgeGeo = trackGeo(new THREE.EdgesGeometry(baseGeo, 18));
    const baseLines = new THREE.LineSegments(baseEdgeGeo, edgeLineMat);
    edgeLines.push(baseLines);
    baseGroup.add(baseLines);
    root.add(baseGroup);

    const palette = [
      FACE_COLORS.front,
      FACE_COLORS.right,
      FACE_COLORS.back,
      FACE_COLORS.top,
      FACE_COLORS.left,
      '#a855f7',
    ];

    const flapHinges: THREE.Group[] = [];
    for (let k = 0; k < N; k++) {
      const yawGroup = new THREE.Group();
      yawGroup.rotation.y = (k * 2 * Math.PI) / N;
      root.add(yawGroup);

      const hinge = new THREE.Group();
      hinge.position.set(0, 0, rIn);
      hinge.add(
        makeTrianglePanel(
          [-b / 2, 0],
          [b / 2, 0],
          [0, s],
          palette[k % palette.length],
          `F${k + 1}`
        )
      );
      yawGroup.add(hinge);
      flapHinges.push(hinge);
    }

    addHeightAxis(h, 0, 0);

    updateFold = (f: number) => {
      const eF = smoothstep(0, 1, f);
      for (const hinge of flapHinges) {
        hinge.rotation.x = -eF * foldAngle;
      }
      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.65;
      });
    };
  }

  // ============================================================================
  // 9. PENTAGONAL & HEXAGONAL PRISMS (2 Regular N-gon Caps + N Hinged Rectangular Walls)
  // ============================================================================
  else if (figureId === 'pentagonal_prism' || figureId === 'hexagonal_prism') {
    const N = figureId === 'pentagonal_prism' ? 5 : 6;
    const b = dims.a;
    const H = dims.h;
    const rIn = b / (2 * Math.tan(Math.PI / N));

    const makeNgonPanel = (offsetZ: number, colorHex: string, labelText: string) => {
      const pts: Array<[number, number]> = [];
      for (let k = 0; k < N; k++) {
        const ang = (k * 2 * Math.PI) / N;
        const c = Math.cos(ang);
        const sn = Math.sin(ang);
        const lx = b / 2;
        const lz = rIn;
        pts.push([lx * c + lz * sn, offsetZ + (-lx * sn + lz * c)]);
      }
      const g = new THREE.Group();
      const sh = new THREE.Shape();
      sh.moveTo(pts[0][0], -pts[0][1]);
      for (let k = 1; k < N; k++) {
        sh.lineTo(pts[k][0], -pts[k][1]);
      }
      sh.closePath();

      const geo = trackGeo(
        new THREE.ExtrudeGeometry(sh, { depth: SLAB_THICKNESS, bevelEnabled: false })
      );
      geo.rotateX(-Math.PI / 2);
      const mat = makeFaceMaterial(colorHex, labelText);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      surfaceMeshes.push(mesh);
      g.add(mesh);

      const eGeo = trackGeo(new THREE.EdgesGeometry(geo, 18));
      const lines = new THREE.LineSegments(eGeo, edgeLineMat);
      edgeLines.push(lines);
      g.add(lines);
      return g;
    };

    // Central Base N-gon
    root.add(makeNgonPanel(0, FACE_COLORS.base, 'BASE'));

    const palette = [
      FACE_COLORS.front,
      FACE_COLORS.right,
      FACE_COLORS.back,
      '#a855f7',
      FACE_COLORS.left,
      '#14b8a6',
    ];

    const wallHinges: THREE.Group[] = [];
    let topCapHinge: THREE.Group | null = null;

    for (let k = 0; k < N; k++) {
      const yawGroup = new THREE.Group();
      yawGroup.rotation.y = (k * 2 * Math.PI) / N;
      root.add(yawGroup);

      const hinge = new THREE.Group();
      hinge.position.set(0, 0, rIn);
      hinge.add(makeRectPanel(b, H, 0, H / 2, palette[k % palette.length], `S${k + 1}`));
      yawGroup.add(hinge);
      wallHinges.push(hinge);

      // Attach top N-gon cap to wall k = 0 so it folds cleanly over the top
      if (k === 0) {
        const capHinge = new THREE.Group();
        capHinge.position.set(0, 0, H);
        // Reflect N-gon across z=0 in capHinge local space so its vertices align with the prism top rim
        const pts: Array<[number, number]> = [];
        for (let j = 0; j < N; j++) {
          const ang = (j * 2 * Math.PI) / N;
          const c = Math.cos(ang);
          const sn = Math.sin(ang);
          const lx = b / 2;
          const lz = rIn;
          const px = lx * c + lz * sn;
          const pz = -lx * sn + lz * c;
          // In base frame edge 0 is at z = +rIn; reflecting across edge 0 gives z_cap = rIn - pz
          pts.push([px, rIn - pz]);
        }
        const sh = new THREE.Shape();
        sh.moveTo(pts[0][0], -pts[0][1]);
        for (let j = 1; j < N; j++) sh.lineTo(pts[j][0], -pts[j][1]);
        sh.closePath();

        const capGeo = trackGeo(
          new THREE.ExtrudeGeometry(sh, { depth: SLAB_THICKNESS, bevelEnabled: false })
        );
        capGeo.rotateX(-Math.PI / 2);
        const capMat = makeFaceMaterial(FACE_COLORS.top, 'TOP');
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.castShadow = true;
        capMesh.receiveShadow = true;
        surfaceMeshes.push(capMesh);
        capHinge.add(capMesh);

        const capEdges = trackGeo(new THREE.EdgesGeometry(capGeo, 18));
        const capLines = new THREE.LineSegments(capEdges, edgeLineMat);
        edgeLines.push(capLines);
        capHinge.add(capLines);

        hinge.add(capHinge);
        topCapHinge = capHinge;
      }
    }

    addHeightAxis(H, 0, 0);

    updateFold = (f: number) => {
      const wallF = smoothstep(0.0, 0.85, f);
      const topF = smoothstep(0.18, 1.0, f);
      const q = Math.PI / 2;
      for (const hGroup of wallHinges) {
        hGroup.rotation.x = -wallF * q;
      }
      if (topCapHinge) {
        topCapHinge.rotation.x = -topF * q;
      }
      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.65;
      });
    };
  }

  // ============================================================================
  // 10. SPHERE & 11. HEMISPHERE (12 Articulated Meridian Gores Unfolding to Petal Net)
  // ============================================================================
  else if (figureId === 'sphere' || figureId === 'hemisphere') {
    const r = dims.r;
    const isHemi = figureId === 'hemisphere';
    const GORES = 12;
    const RINGS = isHemi ? 16 : 24;
    const maxS = isHemi ? (Math.PI * 0.5) * r : Math.PI * r;
    const dPhi = (2 * Math.PI) / GORES;

    if (isHemi) {
      root.add(makeCirclePanel(r, 0, 0, FACE_COLORS.base, 'BASE (πr²)'));
    }

    const palette = [
      FACE_COLORS.front,
      FACE_COLORS.lateral,
      FACE_COLORS.left,
      FACE_COLORS.top,
      FACE_COLORS.back,
      FACE_COLORS.right,
    ];

    const goreUpdaters: Array<(curlF: number) => void> = [];

    for (let k = 0; k < GORES; k++) {
      const yawGroup = new THREE.Group();
      yawGroup.rotation.y = k * dPhi;
      root.add(yawGroup);

      const goreGeo = trackGeo(new THREE.BufferGeometry());
      const vertCount = (RINGS + 1) * 2;
      const positions = new Float32Array(vertCount * 3);
      const uvs = new Float32Array(vertCount * 2);
      const indices: number[] = [];

      for (let i = 0; i <= RINGS; i++) {
        const v = i / RINGS;
        uvs[i * 2 * 2] = 0;
        uvs[i * 2 * 2 + 1] = v;
        uvs[(i * 2 + 1) * 2] = 1;
        uvs[(i * 2 + 1) * 2 + 1] = v;
        if (i < RINGS) {
          const a = i * 2;
          const b = i * 2 + 1;
          const c = (i + 1) * 2;
          const d = (i + 1) * 2 + 1;
          indices.push(a, c, b, b, c, d);
        }
      }

      goreGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      goreGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      goreGeo.setIndex(indices);

      const goreMat = makeFaceMaterial(palette[k % palette.length]);
      const goreMesh = new THREE.Mesh(goreGeo, goreMat);
      goreMesh.castShadow = true;
      goreMesh.receiveShadow = true;
      surfaceMeshes.push(goreMesh);
      yawGroup.add(goreMesh);

      const borderGeo = trackGeo(new THREE.BufferGeometry());
      borderGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array((RINGS + 1) * 2 * 3), 3)
      );
      const borderLine = new THREE.Line(borderGeo, edgeLineMat);
      yawGroup.add(borderLine);

      goreUpdaters.push((curlF: number) => {
        const pos = goreGeo.getAttribute('position') as THREE.BufferAttribute;
        const bPos = borderGeo.getAttribute('position') as THREE.BufferAttribute;

        const baseZ = isHemi ? r : 0;
        const effCurv = Math.max(1e-4, curlF / r);

        for (let i = 0; i <= RINGS; i++) {
          const frac = i / RINGS;
          const s = frac * maxS; // arc distance from hinge

          // Exact sinusoidal gore half-width at meridian distance s
          const latAngle = isHemi ? (s / r) : (s / r); // 0..PI/2 for hemi, 0..PI for sphere
          const halfWidth = isHemi
            ? r * Math.cos(latAngle) * Math.tan(dPhi * 0.5) * (1 - 0.06 * (1 - curlF))
            : r * Math.sin(latAngle) * Math.sin(dPhi * 0.5);

          // Spine point (z_spine, y_spine) by curling arc length s with curvature effCurv
          const theta = s * effCurv;
          let zSpine: number;
          let ySpine: number;

          if (isHemi) {
            // At curlF=0: flat radially outward from r to r + maxS
            // At curlF=1: curves upward and inward from (z=r, y=0) to pole (z=0, y=r)
            zSpine = baseZ + (1 - curlF) * s - curlF * r * (1 - Math.cos(s / r));
            ySpine = curlF * r * Math.sin(s / r) + SLAB_THICKNESS * 0.5;
          } else {
            // Sphere gores anchored at South Pole (0, 0, 0)
            zSpine = Math.sin(theta) / effCurv;
            ySpine = (1 - Math.cos(theta)) / effCurv + SLAB_THICKNESS * 0.5;
          }

          pos.setXYZ(i * 2, -halfWidth, ySpine, zSpine);
          pos.setXYZ(i * 2 + 1, halfWidth, ySpine, zSpine);

          bPos.setXYZ(i, -halfWidth, ySpine + 0.003, zSpine);
          bPos.setXYZ(RINGS * 2 + 1 - i, halfWidth, ySpine + 0.003, zSpine);
        }

        pos.needsUpdate = true;
        bPos.needsUpdate = true;
        goreGeo.computeVertexNormals();
      });
    }

    addHeightAxis(isHemi ? r : 2 * r, 0, 0);

    updateFold = (f: number) => {
      const eF = smoothstep(0, 1, f);
      for (const fn of goreUpdaters) {
        fn(eF);
      }
      heightGuides.forEach((hObj) => {
        hObj.visible = f > 0.85;
      });
    };
  }

  const setVisualMode = (mode: VisualMode) => {
    for (const mesh of surfaceMeshes) {
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      if (mode === 'solid') {
        mat.wireframe = false;
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.depthWrite = true;
      } else if (mode === 'xray') {
        mat.wireframe = false;
        mat.transparent = true;
        mat.opacity = 0.42;
        mat.depthWrite = false;
      } else {
        mat.wireframe = true;
        mat.transparent = true;
        mat.opacity = 0.55;
        mat.depthWrite = true;
      }
      mat.needsUpdate = true;
    }
    edgeLineMat.opacity = mode === 'wireframe' ? 1.0 : 0.86;
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  };

  return { root, updateFold, setVisualMode, dispose };
}

/**
 * Clean 2D SVG Net Blueprint showing exact face shapes, dashed fold lines, and live dimensions.
 */
const NetBlueprint2D: React.FC<{
  figureId: SolidFigureId;
  dims: FigureDimensions;
  darkMode: boolean;
}> = ({ figureId, dims, darkMode }) => {
  const strokeMain = darkMode ? '#e2e8f0' : '#0f172a';
  const strokeFold = darkMode ? '#94a3b8' : '#475569';
  const textFill = darkMode ? '#f8fafc' : '#0f172a';
  const subText = darkMode ? '#cbd5e1' : '#334155';

  const fmt = (n: number) => n.toFixed(1);

  return (
    <svg
      viewBox="0 0 280 210"
      className="w-full h-44 sm:h-48 select-none"
      role="img"
      aria-label={`2D net diagram of ${figureId}`}
    >
      {figureId === 'cube' && (
        <g transform="translate(140, 108)">
          {/* 4-column cross net */}
          <rect x="-22" y="-22" width="44" height="44" fill={`${FACE_COLORS.base}cc`} stroke={strokeFold} strokeDasharray="3 3" strokeWidth="1.4" />
          <rect x="-22" y="22" width="44" height="44" fill={`${FACE_COLORS.front}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="-22" y="-66" width="44" height="44" fill={`${FACE_COLORS.back}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="-22" y="-102" width="44" height="36" fill={`${FACE_COLORS.top}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="22" y="-22" width="44" height="44" fill={`${FACE_COLORS.right}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="-66" y="-22" width="44" height="44" fill={`${FACE_COLORS.left}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="800" fill={textFill}>BASE</text>
          <text x="0" y="47" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>FRONT</text>
          <text x="0" y="-42" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>BACK</text>
          <text x="0" y="-81" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>TOP</text>
          <text x="44" y="4" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>R</text>
          <text x="-44" y="4" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>L</text>
          <text x="0" y="84" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            Each square: {fmt(dims.a)} × {fmt(dims.a)}
          </text>
        </g>
      )}

      {figureId === 'cuboid' && (
        <g transform="translate(140, 112)">
          <rect x="-32" y="-20" width="64" height="40" fill={`${FACE_COLORS.base}cc`} stroke={strokeFold} strokeDasharray="3 3" strokeWidth="1.4" />
          <rect x="-32" y="20" width="64" height="30" fill={`${FACE_COLORS.front}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="-32" y="-50" width="64" height="30" fill={`${FACE_COLORS.back}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="-32" y="-90" width="64" height="40" fill={`${FACE_COLORS.top}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="32" y="-20" width="32" height="40" fill={`${FACE_COLORS.right}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="-64" y="-20" width="32" height="40" fill={`${FACE_COLORS.left}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="800" fill={textFill}>BASE ({fmt(dims.a)}×{fmt(dims.w)})</text>
          <text x="0" y="38" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>FRONT</text>
          <text x="0" y="-32" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>BACK</text>
          <text x="0" y="-67" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>TOP</text>
          <text x="48" y="3" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>h</text>
          <text x="-48" y="3" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>h</text>
          <text x="0" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            l = {fmt(dims.a)} · w = {fmt(dims.w)} · h = {fmt(dims.h)}
          </text>
        </g>
      )}

      {figureId === 'square_pyramid' && (
        <g transform="translate(140, 102)">
          <rect x="-26" y="-26" width="52" height="52" fill={`${FACE_COLORS.base}cc`} stroke={strokeFold} strokeDasharray="3 3" strokeWidth="1.4" />
          <polygon points="-26,26 26,26 0,82" fill={`${FACE_COLORS.front}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <polygon points="-26,-26 26,-26 0,-82" fill={`${FACE_COLORS.back}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <polygon points="26,-26 26,26 82,0" fill={`${FACE_COLORS.right}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <polygon points="-26,-26 -26,26 -82,0" fill={`${FACE_COLORS.left}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="800" fill={textFill}>BASE</text>
          <text x="0" y="98" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            b = {fmt(dims.a)} · slant s = {fmt(Math.hypot(dims.a / 2, dims.h))}
          </text>
        </g>
      )}

      {figureId === 'triangular_prism' && (
        <g transform="translate(140, 104)">
          <rect x="-24" y="-34" width="48" height="68" fill={`${FACE_COLORS.base}cc`} stroke={strokeFold} strokeDasharray="3 3" strokeWidth="1.4" />
          <rect x="24" y="-34" width="48" height="68" fill={`${FACE_COLORS.right}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="-72" y="-34" width="48" height="68" fill={`${FACE_COLORS.left}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <polygon points="-24,34 24,34 0,74" fill={`${FACE_COLORS.front}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <polygon points="-24,-34 24,-34 0,-74" fill={`${FACE_COLORS.top}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textFill}>BASE</text>
          <text x="48" y="3" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>SIDE 1</text>
          <text x="-48" y="3" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>SIDE 2</text>
          <text x="0" y="93" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            3 rectangles ({fmt(dims.a)}×{fmt(dims.h)}) + 2 triangles
          </text>
        </g>
      )}

      {figureId === 'tetrahedron' && (
        <g transform="translate(140, 108)">
          {/* Large equilateral triangle subdivided into 4 congruent equilateral triangles */}
          <polygon points="0,-78 86,68 -86,68" fill="none" stroke={strokeMain} strokeWidth="1.6" />
          <polygon points="0,68 43,-5 -43,-5" fill={`${FACE_COLORS.base}cc`} stroke={strokeFold} strokeDasharray="3 3" strokeWidth="1.4" />
          <polygon points="0,-78 43,-5 -43,-5" fill={`${FACE_COLORS.front}cc`} stroke={strokeMain} strokeWidth="1.4" />
          <polygon points="43,-5 86,68 0,68" fill={`${FACE_COLORS.right}cc`} stroke={strokeMain} strokeWidth="1.4" />
          <polygon points="-43,-5 0,68 -86,68" fill={`${FACE_COLORS.left}cc`} stroke={strokeMain} strokeWidth="1.4" />
          <text x="0" y="25" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textFill}>BASE</text>
          <text x="0" y="-26" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>F1</text>
          <text x="42" y="48" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>F2</text>
          <text x="-42" y="48" textAnchor="middle" fontSize="8" fontWeight="700" fill={textFill}>F3</text>
          <text x="0" y="88" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            4 equilateral triangles · edge a = {fmt(dims.a)}
          </text>
        </g>
      )}

      {figureId === 'cylinder' && (
        <g transform="translate(140, 104)">
          <rect x="-86" y="-26" width="172" height="52" fill={`${FACE_COLORS.lateral}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <circle cx="0" cy="-54" r="28" fill={`${FACE_COLORS.top}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <circle cx="0" cy="54" r="28" fill={`${FACE_COLORS.base}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <text x="0" y="3" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={textFill}>
            LATERAL WALL (2πr = {fmt(2 * Math.PI * dims.r)})
          </text>
          <text x="0" y="-51" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textFill}>TOP (r={fmt(dims.r)})</text>
          <text x="0" y="57" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textFill}>BASE</text>
          <text x="0" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            Height h = {fmt(dims.h)} · Radius r = {fmt(dims.r)}
          </text>
        </g>
      )}

      {figureId === 'cone' && (
        <g transform="translate(140, 106)">
          {/* Circular sector + tangent base circle */}
          <path
            d="M 0,-74 L 68,8 A 96,96 0 0,1 -68,8 Z"
            fill={`${FACE_COLORS.lateral}cc`}
            stroke={strokeMain}
            strokeWidth="1.5"
          />
          <circle cx="0" cy="52" r="27" fill={`${FACE_COLORS.base}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <text x="0" y="-12" textAnchor="middle" fontSize="9" fontWeight="800" fill={textFill}>
            SECTOR (l = {fmt(Math.hypot(dims.r, dims.h))})
          </text>
          <text x="0" y="55" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textFill}>
            BASE (r={fmt(dims.r)})
          </text>
          <text x="0" y="95" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            Arc angle = {Math.round(((2 * Math.PI * dims.r) / Math.hypot(dims.r, dims.h)) * (180 / Math.PI))}°
          </text>
        </g>
      )}

      {figureId === 'triangular_pyramid' && (
        <g transform="translate(140, 104)">
          <polygon points="0,-24 26,20 -26,20" fill={`${FACE_COLORS.base}cc`} stroke={strokeFold} strokeDasharray="3 3" strokeWidth="1.4" />
          <polygon points="-26,20 26,20 0,76" fill={`${FACE_COLORS.front}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <polygon points="0,-24 26,20 68,-38" fill={`${FACE_COLORS.right}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <polygon points="-26,20 0,-24 -68,-38" fill={`${FACE_COLORS.left}cc`} stroke={strokeMain} strokeWidth="1.5" />
          <text x="0" y="8" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textFill}>BASE</text>
          <text x="0" y="94" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
            b = {fmt(dims.a)} · slant s = {fmt(Math.hypot(dims.a / (2 * Math.sqrt(3)), dims.h))}
          </text>
        </g>
      )}

      {(figureId === 'pentagonal_pyramid' || figureId === 'hexagonal_pyramid') &&
        (() => {
          const N = figureId === 'pentagonal_pyramid' ? 5 : 6;
          const rIn = 23;
          const rOut = rIn / Math.cos(Math.PI / N);
          const tipR = 74;
          const basePts: string[] = [];
          for (let k = 0; k < N; k++) {
            const ang = ((k + 0.5) * 2 * Math.PI) / N;
            basePts.push(`${(rOut * Math.sin(ang)).toFixed(1)},${(rOut * Math.cos(ang)).toFixed(1)}`);
          }
          const realRIn = dims.a / (2 * Math.tan(Math.PI / N));
          const realS = Math.hypot(realRIn, dims.h);
          return (
            <g transform="translate(140, 100)">
              {Array.from({ length: N }).map((_, k) => {
                const a1 = ((k - 0.5) * 2 * Math.PI) / N;
                const a2 = ((k + 0.5) * 2 * Math.PI) / N;
                const aMid = (k * 2 * Math.PI) / N;
                const p1 = `${(rOut * Math.sin(a1)).toFixed(1)},${(rOut * Math.cos(a1)).toFixed(1)}`;
                const p2 = `${(rOut * Math.sin(a2)).toFixed(1)},${(rOut * Math.cos(a2)).toFixed(1)}`;
                const pTip = `${(tipR * Math.sin(aMid)).toFixed(1)},${(tipR * Math.cos(aMid)).toFixed(1)}`;
                const colors = [FACE_COLORS.front, FACE_COLORS.right, FACE_COLORS.back, FACE_COLORS.top, FACE_COLORS.left, '#a855f7'];
                return (
                  <polygon
                    key={k}
                    points={`${p1} ${p2} ${pTip}`}
                    fill={`${colors[k % colors.length]}cc`}
                    stroke={strokeMain}
                    strokeWidth="1.4"
                  />
                );
              })}
              <polygon points={basePts.join(' ')} fill={`${FACE_COLORS.base}cc`} stroke={strokeFold} strokeDasharray="3 3" strokeWidth="1.4" />
              <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill={textFill}>BASE</text>
              <text x="0" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
                {N} triangles · b = {fmt(dims.a)} · slant s = {fmt(realS)}
              </text>
            </g>
          );
        })()}

      {(figureId === 'pentagonal_prism' || figureId === 'hexagonal_prism') &&
        (() => {
          const N = figureId === 'pentagonal_prism' ? 5 : 6;
          const w = N === 5 ? 24 : 21;
          const totalW = N * w;
          const startX = -totalW / 2;
          const colors = [FACE_COLORS.front, FACE_COLORS.right, FACE_COLORS.back, '#a855f7', FACE_COLORS.left, '#14b8a6'];
          const rCap = N === 5 ? 16 : 15;
          const makeNgonPts = (cx: number, cy: number, r: number) =>
            Array.from({ length: N })
              .map((_, k) => {
                const a = (k * 2 * Math.PI) / N - Math.PI / 2;
                return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
              })
              .join(' ');
          return (
            <g transform="translate(140, 102)">
              {Array.from({ length: N }).map((_, k) => (
                <rect
                  key={k}
                  x={startX + k * w}
                  y="-24"
                  width={w}
                  height="48"
                  fill={`${colors[k % colors.length]}cc`}
                  stroke={strokeMain}
                  strokeWidth="1.4"
                />
              ))}
              <polygon points={makeNgonPts(0, -44, rCap)} fill={`${FACE_COLORS.top}cc`} stroke={strokeMain} strokeWidth="1.4" />
              <polygon points={makeNgonPts(0, 44, rCap)} fill={`${FACE_COLORS.base}cc`} stroke={strokeMain} strokeWidth="1.4" />
              <text x="0" y="3" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textFill}>
                {N} RECTANGLE WALLS ({fmt(dims.a)} × {fmt(dims.h)})
              </text>
              <text x="0" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
                2 regular {N}-gons + {N} rectangles (strip width = {fmt(N * dims.a)})
              </text>
            </g>
          );
        })()}

      {(figureId === 'sphere' || figureId === 'hemisphere') &&
        (() => {
          const isHemi = figureId === 'hemisphere';
          const G = 12;
          return (
            <g transform="translate(140, 100)">
              {Array.from({ length: G }).map((_, k) => {
                const deg = (k * 360) / G;
                return (
                  <path
                    key={k}
                    d={isHemi ? 'M -5,-22 Q 0,-74 5,-22 Z' : 'M 0,0 Q -7,-38 0,-74 Q 7,-38 0,0 Z'}
                    transform={`rotate(${deg})`}
                    fill={`${k % 2 === 0 ? FACE_COLORS.front : FACE_COLORS.top}cc`}
                    stroke={strokeMain}
                    strokeWidth="1.1"
                  />
                );
              })}
              {isHemi && (
                <circle cx="0" cy="0" r="22" fill={`${FACE_COLORS.base}cc`} stroke={strokeMain} strokeWidth="1.4" />
              )}
              {isHemi && (
                <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textFill}>BASE</text>
              )}
              <text x="0" y="96" textAnchor="middle" fontSize="10" fontWeight="700" fill={subText}>
                {isHemi
                  ? `Base circle (r=${fmt(dims.r)}) + 12 half-meridian gores`
                  : `12 meridian gores · length πr = ${fmt(Math.PI * dims.r)}`}
              </text>
            </g>
          );
        })()}
    </svg>
  );
};

/**
 * Live 2D Side Cross-Section Diagram for Plane ∩ Plane (looking straight along intersection line L)
 */
const PlanePlaneDiagram2D: React.FC<{
  params: PlanePlaneParams;
  darkMode: boolean;
}> = ({ params, darkMode }) => {
  const textFill = darkMode ? '#f8fafc' : '#0f172a';
  const subText = darkMode ? '#94a3b8' : '#475569';
  const rad = ((params.caseType === 'perpendicular' ? 90 : params.dihedralDeg) * Math.PI) / 180;
  const cx = 140 + params.slideOffset * 20;
  const cy = 112;
  const len = 76;
  const x2a = cx + Math.cos(rad) * len;
  const y2a = cy - Math.sin(rad) * len;
  const x2b = cx - Math.cos(rad) * len;
  const y2b = cy + Math.sin(rad) * len;
  const arcR = 34;
  const ax = cx + Math.cos(rad) * arcR;
  const ay = cy - Math.sin(rad) * arcR;
  const largeArc = (params.caseType === 'perpendicular' ? 90 : params.dihedralDeg) > 180 ? 1 : 0;

  return (
    <svg
      viewBox="0 0 280 190"
      className="w-full h-44 select-none"
      role="img"
      aria-label="2D cross section of plane intersection"
    >
      {(params.caseType === 'intersecting' || params.caseType === 'perpendicular') && (
        <g>
          {/* Plane 1 horizontal */}
          <line x1="28" y1={cy} x2="252" y2={cy} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          {/* Plane 2 tilted */}
          <line x1={x2b} y1={y2b} x2={x2a} y2={y2a} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          {/* Dihedral angle arc */}
          <path
            d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax} ${ay}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          {params.caseType === 'perpendicular' && (
            <path d={`M ${cx + 15} ${cy} L ${cx + 15} ${cy - 15} L ${cx} ${cy - 15}`} fill="none" stroke="#10b981" strokeWidth="2" />
          )}
          {/* Intersection line L coming out of page */}
          <circle cx={cx} cy={cy} r="6.5" fill="#f43f5e" stroke={textFill} strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="2" fill="#ffffff" />

          {/* Optional normal vectors */}
          {params.showNormals && (
            <g opacity="0.9">
              <line x1={cx} y1={cy} x2={cx} y2={cy - 54} stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
              <line
                x1={cx}
                y1={cy}
                x2={cx - Math.sin(rad) * 54}
                y2={cy - Math.cos(rad) * 54}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
            </g>
          )}

          <text x="44" y={cy - 8} fontSize="10" fontWeight="800" fill="#38bdf8">Π₁</text>
          <text x={Math.min(254, Math.max(24, x2a + 8))} y={Math.max(20, y2a + 4)} fontSize="10" fontWeight="800" fill="#f59e0b">Π₂</text>
          <text x={cx + Math.cos(rad * 0.5) * 48} y={cy - Math.sin(rad * 0.5) * 48} fontSize="10" fontWeight="800" fill="#10b981" textAnchor="middle">
            {params.caseType === 'perpendicular' ? '90°' : `${Math.round(params.dihedralDeg)}°`}
          </text>
          <text x="140" y="176" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
            Side View: Red dot = Line of Intersection L (⊙)
          </text>
        </g>
      )}

      {params.caseType === 'parallel' && (
        <g>
          {(() => {
            const halfGap = Math.max(14, Math.min(48, params.separation * 20));
            const yTop = 94 - halfGap;
            const yBot = 94 + halfGap;
            return (
              <>
                <line x1="36" y1={yTop} x2="244" y2={yTop} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                <line x1="36" y1={yBot} x2="244" y2={yBot} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                <line x1="140" y1={yTop + 4} x2="140" y2={yBot - 4} stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 3" />
                <rect x="140" y={yBot - 10} width="10" height="10" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="42" y={yTop - 8} fontSize="10" fontWeight="800" fill="#f59e0b">Π₂</text>
                <text x="42" y={yBot + 15} fontSize="10" fontWeight="800" fill="#38bdf8">Π₁</text>
                <text x="158" y="98" fontSize="10.5" fontWeight="800" fill="#f43f5e">d = {params.separation.toFixed(1)} u</text>
                <text x="140" y="176" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
                  Constant perpendicular distance d → never intersect
                </text>
              </>
            );
          })()}
        </g>
      )}

      {params.caseType === 'coincident' && (
        <g>
          <line x1="36" y1="92" x2="244" y2="92" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
          <line x1="36" y1="92" x2="244" y2="92" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8 6" strokeLinecap="round" />
          <text x="140" y="72" textAnchor="middle" fontSize="11" fontWeight="800" fill={textFill}>
            Π₁ = Π₂ (Identical Plane)
          </text>
          <text x="140" y="176" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
            Zero separation & identical normal → infinitely many shared points
          </text>
        </g>
      )}

      {params.caseType === 'three_planes' && (
        <g transform="translate(140, 92)">
          {/* Three intersection lines meeting at single center point P */}
          <line x1="-88" y1="22" x2="88" y2="-22" stroke="#22d3ee" strokeWidth="2.6" />
          <line x1="-64" y1="-44" x2="64" y2="44" stroke="#f43f5e" strokeWidth="2.6" />
          <line x1="0" y1="-64" x2="0" y2="62" stroke="#facc15" strokeWidth="2.6" />
          <circle cx="0" cy="0" r="7.5" fill="#fde047" stroke={textFill} strokeWidth="2" />
          <text x="14" y="-8" fontSize="11" fontWeight="900" fill={textFill}>P</text>
          <text x="72" y="-26" fontSize="9" fontWeight="800" fill="#22d3ee">L₁₃</text>
          <text x="58" y="54" fontSize="9" fontWeight="800" fill="#f43f5e">L₁₂</text>
          <text x="8" y="-56" fontSize="9" fontWeight="800" fill="#eab308">L₂₃</text>
          <text x="0" y="84" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
            3 pairwise intersection lines concur at unique point P
          </text>
        </g>
      )}
    </svg>
  );
};

/**
 * Live 2D Vertical Elevation Diagram for Line ∩ Plane showing ΔPQQ' & Angle θ
 */
const LinePlaneDiagram2D: React.FC<{
  params: LinePlaneParams;
  darkMode: boolean;
}> = ({ params, darkMode }) => {
  const textFill = darkMode ? '#f8fafc' : '#0f172a';
  const subText = darkMode ? '#94a3b8' : '#475569';
  const planeY = 126;

  return (
    <svg
      viewBox="0 0 280 190"
      className="w-full h-44 select-none"
      role="img"
      aria-label="2D elevation of line intersecting a plane"
    >
      {/* Plane Π horizontal reference */}
      <line x1="22" y1={planeY} x2="258" y2={planeY} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
      <text x="30" y={planeY + 16} fontSize="10" fontWeight="800" fill="#38bdf8">Plane Π</text>

      {params.caseType === 'piercing' &&
        (() => {
          const rad = (params.inclinationDeg * Math.PI) / 180;
          const px = 112 + params.offset * 16;
          const dist = 94;
          const qx = px + Math.cos(rad) * dist;
          const qy = planeY - Math.sin(rad) * dist;
          const bx = px - Math.cos(rad) * 42;
          const by = planeY + Math.sin(rad) * 42;
          const arcR = 30;
          const ax = px + Math.cos(rad) * arcR;
          const ay = planeY - Math.sin(rad) * arcR;
          return (
            <g>
              {/* Shaded right triangle ΔPQQ' */}
              <polygon points={`${px},${planeY} ${qx},${planeY} ${qx},${qy}`} fill="#10b98138" />
              {/* Projection L' */}
              <line x1={px} y1={planeY} x2={qx} y2={planeY} stroke="#10b981" strokeWidth="3" strokeDasharray="5 3" />
              {/* Perpendicular drop Q -> Q' */}
              <line x1={qx} y1={qy} x2={qx} y2={planeY} stroke="#22d3ee" strokeWidth="2.2" strokeDasharray="4 3" />
              {/* Right angle at Q' */}
              <path d={`M ${qx - 11} ${planeY} L ${qx - 11} ${planeY - 11} L ${qx} ${planeY - 11}`} fill="none" stroke="#10b981" strokeWidth="1.8" />
              {/* Lower submerged line segment */}
              <line x1={bx} y1={by} x2={px} y2={planeY} stroke="#fb7185" strokeWidth="3.2" strokeDasharray="4 2" />
              {/* Upper line segment */}
              <line x1={px} y1={planeY} x2={qx + Math.cos(rad) * 16} y2={qy - Math.sin(rad) * 16} stroke="#f59e0b" strokeWidth="3.6" strokeLinecap="round" />
              {/* Angle arc θ */}
              <path d={`M ${px + arcR} ${planeY} A ${arcR} ${arcR} 0 0 0 ${ax} ${ay}`} fill="none" stroke="#fbbf24" strokeWidth="2.4" />
              {/* Points P, Q, Q' */}
              <circle cx={px} cy={planeY} r="5.5" fill="#10b981" stroke={textFill} strokeWidth="1.4" />
              <circle cx={qx} cy={qy} r="4.5" fill="#f59e0b" />
              <circle cx={qx} cy={planeY} r="4.5" fill="#22d3ee" />
              <text x={px - 10} y={planeY - 8} fontSize="10" fontWeight="800" fill="#10b981">P</text>
              <text x={qx + 8} y={qy} fontSize="10" fontWeight="800" fill="#f59e0b">Q</text>
              <text x={qx + 6} y={planeY + 14} fontSize="10" fontWeight="800" fill="#22d3ee">Q′</text>
              <text x={px + Math.cos(rad * 0.5) * 44} y={planeY - Math.sin(rad * 0.5) * 42} fontSize="10" fontWeight="800" fill="#f59e0b">
                {Math.round(params.inclinationDeg)}°
              </text>
              <text x="140" y="176" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
                Right ΔPQQ′: sin θ = QQ′ / PQ = {Math.sin(rad).toFixed(2)}
              </text>
            </g>
          );
        })()}

      {params.caseType === 'perpendicular' && (
        <g>
          <line x1="140" y1="22" x2="140" y2={planeY} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <line x1="140" y1={planeY} x2="140" y2="162" stroke="#fb7185" strokeWidth="3.2" strokeDasharray="4 3" />
          <path d={`M 140 ${planeY - 16} L 156 ${planeY - 16} L 156 ${planeY}`} fill="none" stroke="#10b981" strokeWidth="2.2" />
          <circle cx="140" cy={planeY} r="6" fill="#10b981" stroke={textFill} strokeWidth="1.5" />
          <text x="150" y="34" fontSize="10" fontWeight="800" fill="#f59e0b">Line L (L ⊥ Π)</text>
          <text x="162" y={planeY - 10} fontSize="10" fontWeight="800" fill="#10b981">90°</text>
          <text x="140" y="178" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
            Line L meets Plane Π at 90° to every line through foot P
          </text>
        </g>
      )}

      {params.caseType === 'parallel' &&
        (() => {
          const lineY = Math.max(30, planeY - params.height * 36);
          return (
            <g>
              <line x1="42" y1={lineY} x2="238" y2={lineY} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <line x1="42" y1={planeY} x2="238" y2={planeY} stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="92" y1={lineY + 4} x2="92" y2={planeY - 4} stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="188" y1={lineY + 4} x2="188" y2={planeY - 4} stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 3" />
              <rect x="188" y={planeY - 10} width="10" height="10" fill="none" stroke="#10b981" strokeWidth="1.5" />
              <text x="48" y={lineY - 8} fontSize="10" fontWeight="800" fill="#f59e0b">Line L (L ∥ Π)</text>
              <text x="202" y={(lineY + planeY) / 2 + 3} fontSize="10" fontWeight="800" fill="#22d3ee">
                h = {params.height.toFixed(1)} u
              </text>
              <text x="140" y="176" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
                Constant clearance h &gt; 0 above projection L′ → no intersection
              </text>
            </g>
          );
        })()}

      {params.caseType === 'contained' && (
        <g>
          <line x1="42" y1={planeY} x2="238" y2={planeY} stroke="#f59e0b" strokeWidth="5.5" strokeLinecap="round" />
          <text x="140" y={planeY - 16} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#f59e0b">
            Line L lies entirely inside Plane Π (L ⊂ Π)
          </text>
          <text x="140" y="176" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={subText}>
            Angle θ = 0° · Height h = 0 → every point of L lies in Π
          </text>
        </g>
      )}
    </svg>
  );
};

export const SolidFigures3DSimulation: React.FC<SolidFigures3DSimulationProps> = ({
  darkMode = false,
}) => {
  const [studioMode, setStudioMode] = useState<StudioMode>('solids');

  // Mode 1: 3D Solids & Unfolding Nets
  const [figureId, setFigureId] = useState<SolidFigureId>('cube');
  const [dims, setDims] = useState<FigureDimensions>(FIGURE_SPECS[0].defaults);
  const [unfoldPct, setUnfoldPct] = useState<number>(0); // 0 = 3D Solid, 100 = Flat 2D Net
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [visualMode, setVisualMode] = useState<VisualMode>('solid');
  const [showFaceLabels, setShowFaceLabels] = useState<boolean>(true);

  // Mode 2: Plane ∩ Plane State
  const [ppParams, setPpParams] = useState<PlanePlaneParams>({
    caseType: 'intersecting',
    dihedralDeg: 58,
    slideOffset: 0,
    separation: 1.5,
    plane3TiltDeg: 90,
    showNormals: false,
    showGuides: true,
  });

  // Mode 3: Line ∩ Plane State
  const [lpParams, setLpParams] = useState<LinePlaneParams>({
    caseType: 'piercing',
    inclinationDeg: 42,
    azimuthDeg: 25,
    offset: 0,
    height: 1.4,
    showProjection: true,
    showNormal: false,
  });

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  const studioModeRef = useRef<StudioMode>(studioMode);
  const unfoldRef = useRef<number>(unfoldPct);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const playDirRef = useRef<1 | -1>(1);
  const visualModeRef = useRef<VisualMode>(visualMode);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const ppParamsRef = useRef<PlanePlaneParams>(ppParams);
  const lpParamsRef = useRef<LinePlaneParams>(lpParams);

  const rigRef = useRef<BuiltSolidRig | null>(null);
  const ppRigRef = useRef<BuiltIntersectionRig<PlanePlaneParams> | null>(null);
  const lpRigRef = useRef<BuiltIntersectionRig<LinePlaneParams> | null>(null);
  const cameraPresetRef = useRef<((preset: 'iso' | 'top' | 'front') => void) | null>(null);

  useEffect(() => {
    studioModeRef.current = studioMode;
  }, [studioMode]);

  useEffect(() => {
    unfoldRef.current = unfoldPct;
    if (rigRef.current) {
      rigRef.current.updateFold(1 - unfoldPct / 100);
    }
  }, [unfoldPct]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    visualModeRef.current = visualMode;
    if (rigRef.current) {
      rigRef.current.setVisualMode(visualMode);
    }
  }, [visualMode]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    ppParamsRef.current = ppParams;
    if (ppRigRef.current) {
      ppRigRef.current.update(ppParams);
    }
  }, [ppParams]);

  useEffect(() => {
    lpParamsRef.current = lpParams;
    if (lpRigRef.current) {
      lpRigRef.current.update(lpParams);
    }
  }, [lpParams]);

  const activeSpec = useMemo(
    () => FIGURE_SPECS.find((s) => s.id === figureId) || FIGURE_SPECS[0],
    [figureId]
  );

  const [categoryFilter, setCategoryFilter] = useState<'all' | SolidCategory>('all');
  const hostGroupRef = useRef<THREE.Group | null>(null);

  const filteredSpecs = useMemo(
    () =>
      categoryFilter === 'all'
        ? FIGURE_SPECS
        : FIGURE_SPECS.filter((s) => s.category === categoryFilter),
    [categoryFilter]
  );

  // Live mathematical measurements for all 14 figures
  const metrics = useMemo(() => {
    const { a, w, h, r } = dims;
    if (figureId === 'cube') {
      return {
        tsa: 6 * a * a,
        lateral: 4 * a * a,
        volume: a * a * a,
        extraLabel: 'Space Diagonal',
        extraValue: `${(a * Math.sqrt(3)).toFixed(2)} u`,
      };
    }
    if (figureId === 'cuboid') {
      return {
        tsa: 2 * (a * w + a * h + w * h),
        lateral: 2 * (a + w) * h,
        volume: a * w * h,
        extraLabel: 'Space Diagonal',
        extraValue: `${Math.hypot(a, w, h).toFixed(2)} u`,
      };
    }
    if (figureId === 'triangular_prism') {
      const baseArea = (Math.sqrt(3) / 4) * a * a;
      return {
        tsa: 2 * baseArea + 3 * a * h,
        lateral: 3 * a * h,
        volume: baseArea * h,
        extraLabel: 'Base Area',
        extraValue: `${baseArea.toFixed(2)} u²`,
      };
    }
    if (figureId === 'pentagonal_prism' || figureId === 'hexagonal_prism') {
      const N = figureId === 'pentagonal_prism' ? 5 : 6;
      const rIn = a / (2 * Math.tan(Math.PI / N));
      const baseArea = 0.5 * N * a * rIn;
      const lateral = N * a * h;
      return {
        tsa: 2 * baseArea + lateral,
        lateral,
        volume: baseArea * h,
        extraLabel: 'Base Apothem',
        extraValue: `${rIn.toFixed(2)} u`,
      };
    }
    if (figureId === 'tetrahedron') {
      return {
        tsa: Math.sqrt(3) * a * a,
        lateral: (3 * Math.sqrt(3) * a * a) / 4,
        volume: (Math.sqrt(2) / 12) * a * a * a,
        extraLabel: 'Apex Height',
        extraValue: `${(a * Math.sqrt(2 / 3)).toFixed(2)} u`,
      };
    }
    if (figureId === 'square_pyramid') {
      const s = Math.hypot(a / 2, h);
      return {
        tsa: a * a + 2 * a * s,
        lateral: 2 * a * s,
        volume: (a * a * h) / 3,
        extraLabel: 'Slant Height (s)',
        extraValue: `${s.toFixed(2)} u`,
      };
    }
    if (
      figureId === 'triangular_pyramid' ||
      figureId === 'pentagonal_pyramid' ||
      figureId === 'hexagonal_pyramid'
    ) {
      const N = figureId === 'triangular_pyramid' ? 3 : figureId === 'pentagonal_pyramid' ? 5 : 6;
      const rIn = a / (2 * Math.tan(Math.PI / N));
      const s = Math.hypot(rIn, h);
      const baseArea = 0.5 * N * a * rIn;
      const lateral = 0.5 * N * a * s;
      return {
        tsa: baseArea + lateral,
        lateral,
        volume: (baseArea * h) / 3,
        extraLabel: 'Slant Height (s)',
        extraValue: `${s.toFixed(2)} u`,
      };
    }
    if (figureId === 'cylinder') {
      return {
        tsa: 2 * Math.PI * r * r + 2 * Math.PI * r * h,
        lateral: 2 * Math.PI * r * h,
        volume: Math.PI * r * r * h,
        extraLabel: 'Net Width (2πr)',
        extraValue: `${(2 * Math.PI * r).toFixed(2)} u`,
      };
    }
    if (figureId === 'cone') {
      const l = Math.hypot(r, h);
      const sectorDeg = ((2 * Math.PI * r) / l) * (180 / Math.PI);
      return {
        tsa: Math.PI * r * r + Math.PI * r * l,
        lateral: Math.PI * r * l,
        volume: (Math.PI * r * r * h) / 3,
        extraLabel: 'Slant (l) · Sector',
        extraValue: `${l.toFixed(2)} u · ${Math.round(sectorDeg)}°`,
      };
    }
    if (figureId === 'sphere') {
      return {
        tsa: 4 * Math.PI * r * r,
        lateral: 4 * Math.PI * r * r,
        volume: (4 / 3) * Math.PI * r * r * r,
        extraLabel: 'Great Circle (2πr)',
        extraValue: `${(2 * Math.PI * r).toFixed(2)} u`,
      };
    }
    // hemisphere
    return {
      tsa: 3 * Math.PI * r * r,
      lateral: 2 * Math.PI * r * r,
      volume: (2 / 3) * Math.PI * r * r * r,
      extraLabel: 'Curved Dome (2πr²)',
      extraValue: `${(2 * Math.PI * r * r).toFixed(2)} u²`,
    };
  }, [figureId, dims]);

  const [custom3DFormula, setCustom3DFormula] = useState<string>('2*pi*r^2 + 2*pi*r*h');

  const evaluatedCustom3D = useMemo(() => {
    const raw = custom3DFormula.trim();
    if (!raw) return { latex: '', value: null as number | null };

    // Allow setting dimensions like "a=2.5" or evaluating a formula in a, b, w, h, r, l, s
    const b = dims.a;
    const l = Math.hypot(dims.r, dims.h);
    const s = Math.hypot(dims.a / 2, dims.h);
    const latex = naturalMathToLatex(raw, '');

    try {
      const clean = raw
        .replace(/^[a-zA-Z_]+\s*=\s*/, '')
        .replace(/²/g, '**2')
        .replace(/³/g, '**3')
        .replace(/π/g, 'Math.PI')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\bsqrt\s*\(/gi, 'Math.sqrt(')
        .replace(/(\d(?:\.\d+)?)\s*(?=[abwhrlsM(])/g, '$1*')
        .replace(/\^/g, '**');

      const fn = new Function('a', 'b', 'w', 'h', 'r', 'l', 's', `"use strict"; return (${clean});`) as (
        a: number,
        b: number,
        w: number,
        h: number,
        r: number,
        l: number,
        s: number
      ) => number;
      const val = fn(dims.a, b, dims.w, dims.h, dims.r, l, s);
      return { latex, value: typeof val === 'number' && Number.isFinite(val) ? val : null };
    } catch {
      return { latex, value: null };
    }
  }, [custom3DFormula, dims]);

  const handleSelectFigure = (id: SolidFigureId) => {
    const spec = FIGURE_SPECS.find((s) => s.id === id) || FIGURE_SPECS[0];
    setFigureId(id);
    setDims({ ...spec.defaults });
    setIsPlaying(false);
    setUnfoldPct(0);
    playDirRef.current = 1;
  };

  const handleToggleUnfoldSnap = () => {
    setIsPlaying(false);
    const target = unfoldPct >= 50 ? 0 : 100;
    const start = unfoldRef.current;
    const startTime = performance.now();
    const duration = 720;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const val = Math.round(start + (target - start) * eased);
      setUnfoldPct(val);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const handleToggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  // Three.js Scene & Renderer Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '') : '';
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = darkMode ? '#0b1220' : '#f1f5f9';
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.Fog(bgHex, 18, 42);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(5.6, 4.9, 6.2);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    // Allow orbiting underneath the planes in intersection modes so students can inspect the underside piercing!
    controls.maxPolarAngle = studioMode === 'solids' ? Math.PI * 0.49 : Math.PI * 0.86;
    controls.minDistance = 3.2;
    controls.maxDistance = 18;
    controls.target.set(0, studioMode === 'solids' ? 0.75 : 0.45, 0);

    // Studio Lighting Rig
    const hemi = new THREE.HemisphereLight(darkMode ? '#dbeafe' : '#ffffff', darkMode ? '#0f172a' : '#cbd5e1', 1.15);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#fffbeb', 2.2);
    keyLight.position.set(6.5, 11.5, 6.5);
    keyLight.castShadow = renderer.shadowMap.enabled && studioMode === 'solids';
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 30;
    const sd = 7.5;
    keyLight.shadow.camera.left = -sd;
    keyLight.shadow.camera.right = sd;
    keyLight.shadow.camera.top = sd;
    keyLight.shadow.camera.bottom = -sd;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.85);
    rimLight.position.set(-7, 5, -6);
    scene.add(rimLight);

    // Studio Drafting Tabletop & Grid (lowered in intersection modes so planes & submerged lines float cleanly above it)
    const floorY = studioMode === 'solids' ? -0.008 : -2.65;
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(darkMode ? '#111827' : '#e2e8f0'),
      roughness: 0.78,
      metalness: 0.06,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = floorY;
    floorMesh.receiveShadow = studioMode === 'solids';
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(
      20,
      20,
      darkMode ? 0x334155 : 0x94a3b8,
      darkMode ? 0x1e293b : 0xcbd5e1
    );
    gridHelper.position.y = floorY + 0.006;
    scene.add(gridHelper);

    // Build active mode rig
    const hostGroup = new THREE.Group();
    scene.add(hostGroup);
    hostGroupRef.current = hostGroup;

    let ppRig: BuiltIntersectionRig<PlanePlaneParams> | null = null;
    let lpRig: BuiltIntersectionRig<LinePlaneParams> | null = null;

    if (studioMode === 'plane_plane') {
      ppRig = buildPlanePlaneRig(darkMode);
      ppRig.update(ppParamsRef.current);
      hostGroup.add(ppRig.root);
      ppRigRef.current = ppRig;
      camera.position.set(6.4, 4.4, 6.8);
    } else if (studioMode === 'line_plane') {
      lpRig = buildLinePlaneRig(darkMode);
      lpRig.update(lpParamsRef.current);
      hostGroup.add(lpRig.root);
      lpRigRef.current = lpRig;
      camera.position.set(6.2, 4.1, 6.6);
    }

    // Camera Presets
    let camAnim: {
      startPos: THREE.Vector3;
      endPos: THREE.Vector3;
      startTarget: THREE.Vector3;
      endTarget: THREE.Vector3;
      t: number;
    } | null = null;

    cameraPresetRef.current = (preset: 'iso' | 'top' | 'front') => {
      const targetY = studioMode === 'solids' ? 0.75 : 0.45;
      const endPos =
        preset === 'top'
          ? new THREE.Vector3(0.01, 10.2, 0.85)
          : preset === 'front'
          ? new THREE.Vector3(0, targetY + 0.6, 8.6)
          : studioMode === 'solids'
          ? new THREE.Vector3(5.6, 4.9, 6.2)
          : new THREE.Vector3(6.4, 4.3, 6.7);
      const endTarget = preset === 'top' ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(0, targetY, 0);
      camAnim = {
        startPos: camera.position.clone(),
        endPos,
        startTarget: controls.target.clone(),
        endTarget,
        t: 0,
      };
    };

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    handleResize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      ro.observe(container);
    }
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    let lastTime = performance.now();
    let lastUiSync = 0;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (camAnim) {
        camAnim.t = Math.min(1, camAnim.t + dt * 2.4);
        const e = smoothstep(0, 1, camAnim.t);
        camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, e);
        controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, e);
        if (camAnim.t >= 1) camAnim = null;
      }

      if (isPlayingRef.current) {
        if (studioModeRef.current === 'solids') {
          let next = unfoldRef.current + playDirRef.current * dt * 36;
          if (next >= 100) {
            next = 100;
            playDirRef.current = -1;
          } else if (next <= 0) {
            next = 0;
            playDirRef.current = 1;
          }
          unfoldRef.current = next;
          if (rigRef.current) {
            rigRef.current.updateFold(1 - next / 100);
          }
          if (now - lastUiSync > 45) {
            lastUiSync = now;
            setUnfoldPct(Math.round(next));
          }
        } else if (studioModeRef.current === 'plane_plane') {
          const cur = ppParamsRef.current;
          if (cur.caseType === 'intersecting' || cur.caseType === 'three_planes') {
            let deg = cur.dihedralDeg + playDirRef.current * dt * 34;
            if (deg >= 150) {
              deg = 150;
              playDirRef.current = -1;
            } else if (deg <= 20) {
              deg = 20;
              playDirRef.current = 1;
            }
            const nextParams = { ...cur, dihedralDeg: deg };
            ppParamsRef.current = nextParams;
            ppRigRef.current?.update(nextParams);
            if (now - lastUiSync > 55) {
              lastUiSync = now;
              setPpParams((prev) => ({ ...prev, dihedralDeg: Math.round(deg) }));
            }
          } else if (cur.caseType === 'parallel') {
            let sep = cur.separation + playDirRef.current * dt * 0.85;
            if (sep >= 2.4) {
              sep = 2.4;
              playDirRef.current = -1;
            } else if (sep <= 0.45) {
              sep = 0.45;
              playDirRef.current = 1;
            }
            const nextParams = { ...cur, separation: sep };
            ppParamsRef.current = nextParams;
            ppRigRef.current?.update(nextParams);
            if (now - lastUiSync > 55) {
              lastUiSync = now;
              setPpParams((prev) => ({ ...prev, separation: Number(sep.toFixed(2)) }));
            }
          }
        } else if (studioModeRef.current === 'line_plane') {
          const cur = lpParamsRef.current;
          if (cur.caseType === 'piercing') {
            let deg = cur.inclinationDeg + playDirRef.current * dt * 28;
            if (deg >= 82) {
              deg = 82;
              playDirRef.current = -1;
            } else if (deg <= 14) {
              deg = 14;
              playDirRef.current = 1;
            }
            const nextParams = { ...cur, inclinationDeg: deg };
            lpParamsRef.current = nextParams;
            lpRigRef.current?.update(nextParams);
            if (now - lastUiSync > 55) {
              lastUiSync = now;
              setLpParams((prev) => ({ ...prev, inclinationDeg: Math.round(deg) }));
            }
          } else if (cur.caseType === 'parallel') {
            let hVal = cur.height + playDirRef.current * dt * 0.85;
            if (hVal >= 2.3) {
              hVal = 2.3;
              playDirRef.current = -1;
            } else if (hVal <= 0.45) {
              hVal = 0.45;
              playDirRef.current = 1;
            }
            const nextParams = { ...cur, height: hVal };
            lpParamsRef.current = nextParams;
            lpRigRef.current?.update(nextParams);
            if (now - lastUiSync > 55) {
              lastUiSync = now;
              setLpParams((prev) => ({ ...prev, height: Number(hVal.toFixed(2)) }));
            }
          }
        }
      }

      controls.autoRotate = autoRotateRef.current && !camAnim;
      controls.autoRotateSpeed = studioMode === 'solids' ? 1.15 : 0.8;
      controls.update();
      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (rigRef.current) {
        rigRef.current.dispose();
        rigRef.current = null;
      }
      ppRig?.dispose();
      lpRig?.dispose();
      ppRigRef.current = null;
      lpRigRef.current = null;
      hostGroupRef.current = null;
      floorGeo.dispose();
      floorMat.dispose();
      gridHelper.geometry.dispose();
      if (Array.isArray(gridHelper.material)) {
        gridHelper.material.forEach((m) => m.dispose());
      } else {
        gridHelper.material.dispose();
      }
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [studioMode, darkMode]);

  // Decoupled in-place 3D solid rig update so dragging dimension sliders preserves camera orbit angle smoothly!
  useEffect(() => {
    if (studioMode !== 'solids') return;
    const hostGroup = hostGroupRef.current;
    if (!hostGroup) return;

    if (rigRef.current) {
      hostGroup.remove(rigRef.current.root);
      rigRef.current.dispose();
      rigRef.current = null;
    }

    const nextRig = buildSolidRig(figureId, dims, showFaceLabels);
    nextRig.setVisualMode(visualModeRef.current);
    nextRig.updateFold(1 - unfoldRef.current / 100);
    hostGroup.add(nextRig.root);
    rigRef.current = nextRig;
  }, [studioMode, figureId, dims, showFaceLabels, darkMode]);

  const activePlanePreset = useMemo(
    () => PLANE_PLANE_PRESETS.find((p) => p.id === ppParams.caseType) || PLANE_PLANE_PRESETS[0],
    [ppParams.caseType]
  );

  const activeLinePreset = useMemo(
    () => LINE_PLANE_PRESETS.find((p) => p.id === lpParams.caseType) || LINE_PLANE_PRESETS[0],
    [lpParams.caseType]
  );

  const handleSwitchStudioMode = (mode: StudioMode) => {
    setStudioMode(mode);
    setIsPlaying(false);
    playDirRef.current = 1;
  };

  // Computed live plane equation strings for Plane ∩ Plane
  const ppEquations = useMemo(() => {
    if (ppParams.caseType === 'parallel') {
      const half = (ppParams.separation / 2).toFixed(2);
      return {
        p1: `y = −${half}`,
        p2: `y = +${half}`,
        acuteAngle: '0° (Parallel)',
      };
    }
    if (ppParams.caseType === 'coincident') {
      return {
        p1: 'y = 0',
        p2: 'y = 0 (same plane)',
        acuteAngle: '0° (Coincident)',
      };
    }
    const deg = ppParams.caseType === 'perpendicular' ? 90 : ppParams.dihedralDeg;
    const rad = (deg * Math.PI) / 180;
    const nx = -Math.sin(rad);
    const ny = Math.cos(rad);
    const rhs = nx * ppParams.slideOffset;
    const acute = deg > 90 ? 180 - deg : deg;
    return {
      p1: 'y = 0',
      p2: `${nx.toFixed(2)}x + ${ny.toFixed(2)}y = ${rhs.toFixed(2)}`,
      acuteAngle: `${Math.round(acute)}°`,
    };
  }, [ppParams]);

  // Computed live line & plane metrics for Line ∩ Plane
  const lpMetrics = useMemo(() => {
    const phi = (lpParams.azimuthDeg * Math.PI) / 180;
    if (lpParams.caseType === 'piercing') {
      const th = (lpParams.inclinationDeg * Math.PI) / 180;
      const dx = Math.cos(th) * Math.cos(phi);
      const dy = Math.sin(th);
      const dz = Math.cos(th) * Math.sin(phi);
      return {
        pointText: `P(${lpParams.offset.toFixed(1)}, 0.0, 0.0)`,
        dirText: `d = (${dx.toFixed(2)}, ${dy.toFixed(2)}, ${dz.toFixed(2)})`,
        angleText: `${Math.round(lpParams.inclinationDeg)}°`,
        normalAngleText: `${Math.round(90 - lpParams.inclinationDeg)}°`,
      };
    }
    if (lpParams.caseType === 'perpendicular') {
      return {
        pointText: `P(${lpParams.offset.toFixed(1)}, 0.0, 0.0)`,
        dirText: 'd = (0.00, 1.00, 0.00) ∥ n',
        angleText: '90°',
        normalAngleText: '0°',
      };
    }
    if (lpParams.caseType === 'parallel') {
      return {
        pointText: 'None (∅)',
        dirText: `d = (${Math.cos(phi).toFixed(2)}, 0.00, ${Math.sin(phi).toFixed(2)})`,
        angleText: '0°',
        normalAngleText: '90° (d · n = 0)',
      };
    }
    return {
      pointText: 'All points on L (∞)',
      dirText: `d = (${Math.cos(phi).toFixed(2)}, 0.00, ${Math.sin(phi).toFixed(2)})`,
      angleText: '0°',
      normalAngleText: '90° (h = 0)',
    };
  }, [lpParams]);

  return (
    <div
      ref={wrapperRef}
      className={`w-full max-w-full min-w-0 overflow-x-hidden rounded-2xl border transition-colors ${
        darkMode
          ? 'bg-[#0e1525] border-white/[0.08] text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      } ${isFullscreen ? 'p-4 h-screen overflow-y-auto' : 'p-3 sm:p-5'}`}
    >
      {/* Primary 3-Mode Studio Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div
          className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border ${
            darkMode ? 'bg-[#0a101d] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => handleSwitchStudioMode('solids')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              studioMode === 'solids'
                ? darkMode
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-950 shadow-xs'
                : darkMode
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Solids &amp; Nets</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchStudioMode('plane_plane')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              studioMode === 'plane_plane'
                ? darkMode
                  ? 'bg-sky-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-950 shadow-xs'
                : darkMode
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <SquareStack className="w-3.5 h-3.5" />
            <span>Plane ∩ Plane</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchStudioMode('line_plane')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              studioMode === 'line_plane'
                ? darkMode
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-950 shadow-xs'
                : darkMode
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <GitCommitHorizontal className="w-3.5 h-3.5" />
            <span>Line ∩ Plane</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {studioMode === 'solids' && (
            <button
              type="button"
              onClick={() => setShowFaceLabels((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                showFaceLabels
                  ? darkMode
                    ? 'bg-cyan-500/15 border-cyan-400/45 text-cyan-200'
                    : 'bg-cyan-50 border-cyan-400 text-cyan-900'
                  : darkMode
                  ? 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              Face Labels {showFaceLabels ? 'On' : 'Off'}
            </button>
          )}

          {studioMode === 'plane_plane' && (
            <>
              <button
                type="button"
                onClick={() => setPpParams((p) => ({ ...p, showGuides: !p.showGuides }))}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  ppParams.showGuides
                    ? darkMode
                      ? 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : darkMode
                    ? 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Angle Guide {ppParams.showGuides ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => setPpParams((p) => ({ ...p, showNormals: !p.showNormals }))}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  ppParams.showNormals
                    ? darkMode
                      ? 'bg-sky-500/15 border-sky-400/45 text-sky-200'
                      : 'bg-sky-50 border-sky-400 text-sky-900'
                    : darkMode
                    ? 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Normals {ppParams.showNormals ? 'On' : 'Off'}
              </button>
            </>
          )}

          {studioMode === 'line_plane' && (
            <>
              <button
                type="button"
                onClick={() => setLpParams((p) => ({ ...p, showProjection: !p.showProjection }))}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  lpParams.showProjection
                    ? darkMode
                      ? 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : darkMode
                    ? 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Projection {lpParams.showProjection ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => setLpParams((p) => ({ ...p, showNormal: !p.showNormal }))}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  lpParams.showNormal
                    ? darkMode
                      ? 'bg-sky-500/15 border-sky-400/45 text-sky-200'
                      : 'bg-sky-50 border-sky-400 text-sky-900'
                    : darkMode
                    ? 'bg-white/[0.04] border-white/[0.08] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Normal n {lpParams.showNormal ? 'On' : 'Off'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              darkMode
                ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-200'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Classification Filter & Sub-Preset Strip for Active Studio Mode */}
      {studioMode === 'solids' && (
        <div className="pt-3 pb-1 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider mr-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Classification:
            </span>
            {(
              [
                { id: 'all', label: 'All Figures (14)' },
                { id: 'prism', label: 'Prisms (5)' },
                { id: 'pyramid', label: 'Pyramids (5)' },
                { id: 'curved', label: 'Curved Solids (4)' },
              ] as const
            ).map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    if (cat.id !== 'all') {
                      const firstInCat = FIGURE_SPECS.find((s) => s.category === cat.id);
                      if (firstInCat && activeSpec.category !== cat.id) {
                        handleSelectFigure(firstInCat.id);
                      }
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer border ${
                    active
                      ? darkMode
                        ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/50'
                        : 'bg-slate-900 text-white border-slate-900'
                      : darkMode
                      ? 'bg-white/[0.03] text-slate-400 border-white/[0.07] hover:text-white'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {filteredSpecs.map((spec) => {
              const active = spec.id === figureId;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleSelectFigure(spec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? darkMode
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                        : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : darkMode
                      ? 'bg-[#151e32] hover:bg-[#1b2740] text-slate-300 border-white/[0.07]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {spec.shortName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {studioMode !== 'solids' && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3 pb-1">

        {studioMode === 'plane_plane' &&
          PLANE_PLANE_PRESETS.map((preset) => {
            const active = preset.id === ppParams.caseType;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setPpParams((prev) => ({
                    ...prev,
                    caseType: preset.id as PlanePlaneCase,
                    dihedralDeg: preset.id === 'perpendicular' ? 90 : preset.id === 'three_planes' ? 90 : prev.dihedralDeg === 90 ? 58 : prev.dihedralDeg,
                  }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? darkMode
                      ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-xs'
                      : 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : darkMode
                    ? 'bg-[#151e32] hover:bg-[#1b2740] text-slate-300 border-white/[0.07]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {preset.shortName}
              </button>
            );
          })}

        {studioMode === 'line_plane' &&
          LINE_PLANE_PRESETS.map((preset) => {
            const active = preset.id === lpParams.caseType;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setLpParams((prev) => ({
                    ...prev,
                    caseType: preset.id as LinePlaneCase,
                  }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? darkMode
                      ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-xs'
                      : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : darkMode
                    ? 'bg-[#151e32] hover:bg-[#1b2740] text-slate-300 border-white/[0.07]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {preset.shortName}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Split Workspace: Left 3D Interactive Stage + Right Blueprint & Controls */}
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Interactive 3D Viewport + Primary Action Bar */}
        <div className="lg:col-span-8 space-y-3 min-w-0">
          <div
            className={`relative w-full h-[360px] sm:h-[440px] rounded-2xl overflow-hidden border ${
              darkMode ? 'border-white/[0.09] bg-[#0b1220]' : 'border-slate-200 bg-slate-100'
            }`}
          >
            <div ref={mountRef} className="w-full h-full touch-none cursor-grab active:cursor-grabbing" />

            {/* Top-Left Clean Title & Metadata */}
            <div className="pointer-events-none absolute top-3 left-3.5 right-3.5 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2
                  className={`text-base sm:text-lg font-black tracking-tight leading-tight ${
                    darkMode ? 'text-white drop-shadow' : 'text-slate-900'
                  }`}
                >
                  {studioMode === 'solids'
                    ? activeSpec.name
                    : studioMode === 'plane_plane'
                    ? activePlanePreset.title
                    : activeLinePreset.title}
                </h2>
                <div
                  className={`text-[11px] font-semibold mt-0.5 flex flex-wrap items-center gap-1.5 ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {studioMode === 'solids' && (
                    <>
                      <span>{activeSpec.family}</span>
                      <span>·</span>
                      <span>
                        {unfoldPct === 0
                          ? 'Closed 3D Solid'
                          : unfoldPct === 100
                          ? 'Flat 2D Net'
                          : `Unfolding ${unfoldPct}%`}
                      </span>
                    </>
                  )}
                  {studioMode === 'plane_plane' && (
                    <>
                      <span className="font-bold text-sky-400">{activePlanePreset.symbol}</span>
                      <span>·</span>
                      <span>{activePlanePreset.intersectionResult}</span>
                    </>
                  )}
                  {studioMode === 'line_plane' && (
                    <>
                      <span className="font-bold text-emerald-400">{activeLinePreset.symbol}</span>
                      <span>·</span>
                      <span>{activeLinePreset.intersectionResult}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Display Mode Quick Controls (Solids mode only) */}
              {studioMode === 'solids' && (
                <div className="pointer-events-auto flex flex-wrap items-center gap-1">
                  {(['solid', 'xray', 'wireframe'] as VisualMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setVisualMode(m)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold capitalize border transition-colors cursor-pointer ${
                        visualMode === m
                          ? darkMode
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-900 text-white border-slate-900'
                          : darkMode
                          ? 'bg-[#0f172a]/85 text-slate-300 border-white/10 hover:text-white'
                          : 'bg-white/90 text-slate-700 border-slate-300 hover:text-slate-950'
                      }`}
                    >
                      {m === 'xray' ? 'Glass' : m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom-Right Camera View Presets */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              <button
                type="button"
                onClick={() => cameraPresetRef.current?.('iso')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-[#0f172a]/85 hover:bg-[#1e293b] text-slate-200 border-white/10'
                    : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300'
                }`}
              >
                3D View
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoRotate(false);
                  cameraPresetRef.current?.(studioMode === 'solids' ? 'top' : 'front');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                  darkMode
                    ? 'bg-[#0f172a]/85 hover:bg-[#1e293b] text-amber-300 border-amber-400/30'
                    : 'bg-white/90 hover:bg-white text-amber-700 border-amber-300'
                }`}
              >
                {studioMode === 'solids' ? 'Top Net' : 'Side View'}
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                  autoRotate
                    ? darkMode
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                      : 'bg-cyan-50 border-cyan-400 text-cyan-800'
                    : darkMode
                    ? 'bg-[#0f172a]/85 border-white/10 text-slate-400'
                    : 'bg-white/90 border-slate-300 text-slate-600'
                }`}
                title="Toggle Auto-Rotate"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Interactive Bottom Bar per Studio Mode */}
          {studioMode === 'solids' && (
            <div
              className={`rounded-2xl border p-3.5 space-y-3 ${
                darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleUnfoldSnap}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{unfoldPct >= 50 ? 'Fold into 3D Solid' : 'Unfold to 2D Net'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      isPlaying
                        ? darkMode
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                          : 'bg-cyan-50 border-cyan-500 text-cyan-900'
                        : darkMode
                        ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.1] text-slate-200'
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Animate'}</span>
                  </button>
                </div>

                <span className="text-xs font-black tabular-nums text-amber-500">
                  Unfold: {unfoldPct}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  3D Solid
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={unfoldPct}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setUnfoldPct(Number(e.target.value));
                  }}
                  aria-label="Unfold 3D figure into 2D net"
                  className="flex-1 accent-amber-500 cursor-pointer h-2"
                />
                <span className={`text-[11px] font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  2D Net
                </span>
              </div>
            </div>
          )}

          {studioMode === 'plane_plane' && (
            <div
              className={`rounded-2xl border p-3.5 space-y-3 ${
                darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(ppParams.caseType === 'intersecting' ||
                    ppParams.caseType === 'parallel' ||
                    ppParams.caseType === 'three_planes') && (
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        isPlaying
                          ? darkMode
                            ? 'bg-sky-400 text-slate-950 border-sky-300'
                            : 'bg-sky-600 text-white border-sky-600'
                          : darkMode
                          ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.1] text-slate-200'
                          : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause Sweep' : 'Animate Planes'}</span>
                    </button>
                  )}

                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Intersection: <strong className="text-sky-500">{activePlanePreset.intersectionResult}</strong>
                  </span>
                </div>

                <span className="text-xs font-black tabular-nums text-amber-500">
                  {ppParams.caseType === 'parallel'
                    ? `d = ${ppParams.separation.toFixed(1)} u`
                    : ppParams.caseType === 'coincident'
                    ? '0° (Same)'
                    : `θ = ${ppParams.caseType === 'perpendicular' ? 90 : Math.round(ppParams.dihedralDeg)}°`}
                </span>
              </div>

              {(ppParams.caseType === 'intersecting' || ppParams.caseType === 'three_planes') && (
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Dihedral Angle θ
                  </span>
                  <input
                    type="range"
                    min={15}
                    max={165}
                    step={1}
                    value={Math.round(ppParams.dihedralDeg)}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setPpParams((prev) => ({ ...prev, dihedralDeg: Number(e.target.value) }));
                    }}
                    className="flex-1 accent-sky-500 cursor-pointer h-2"
                  />
                  <span className="text-[11px] font-black tabular-nums w-9 text-right">
                    {Math.round(ppParams.dihedralDeg)}°
                  </span>
                </div>
              )}

              {ppParams.caseType === 'parallel' && (
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Plane Separation (d)
                  </span>
                  <input
                    type="range"
                    min={0.4}
                    max={2.4}
                    step={0.1}
                    value={ppParams.separation}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setPpParams((prev) => ({ ...prev, separation: Number(e.target.value) }));
                    }}
                    className="flex-1 accent-sky-500 cursor-pointer h-2"
                  />
                  <span className="text-[11px] font-black tabular-nums w-10 text-right">
                    {ppParams.separation.toFixed(1)} u
                  </span>
                </div>
              )}
            </div>
          )}

          {studioMode === 'line_plane' && (
            <div
              className={`rounded-2xl border p-3.5 space-y-3 ${
                darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(lpParams.caseType === 'piercing' || lpParams.caseType === 'parallel') && (
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        isPlaying
                          ? darkMode
                            ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                            : 'bg-emerald-600 text-white border-emerald-600'
                          : darkMode
                          ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.1] text-slate-200'
                          : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause Sweep' : 'Animate Line'}</span>
                    </button>
                  )}

                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Intersection: <strong className="text-emerald-500">{activeLinePreset.intersectionResult}</strong>
                  </span>
                </div>

                <span className="text-xs font-black tabular-nums text-amber-500">
                  {lpParams.caseType === 'piercing'
                    ? `Angle θ = ${Math.round(lpParams.inclinationDeg)}°`
                    : lpParams.caseType === 'parallel'
                    ? `Height h = ${lpParams.height.toFixed(1)} u`
                    : lpParams.caseType === 'perpendicular'
                    ? 'θ = 90°'
                    : 'θ = 0° (L ⊂ Π)'}
                </span>
              </div>

              {lpParams.caseType === 'piercing' && (
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Line–Plane Angle θ
                  </span>
                  <input
                    type="range"
                    min={12}
                    max={84}
                    step={1}
                    value={Math.round(lpParams.inclinationDeg)}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setLpParams((prev) => ({ ...prev, inclinationDeg: Number(e.target.value) }));
                    }}
                    className="flex-1 accent-emerald-500 cursor-pointer h-2"
                  />
                  <span className="text-[11px] font-black tabular-nums w-9 text-right">
                    {Math.round(lpParams.inclinationDeg)}°
                  </span>
                </div>
              )}

              {lpParams.caseType === 'parallel' && (
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Height Above Plane (h)
                  </span>
                  <input
                    type="range"
                    min={0.4}
                    max={2.4}
                    step={0.1}
                    value={lpParams.height}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setLpParams((prev) => ({ ...prev, height: Number(e.target.value) }));
                    }}
                    className="flex-1 accent-emerald-500 cursor-pointer h-2"
                  />
                  <span className="text-[11px] font-black tabular-nums w-10 text-right">
                    {lpParams.height.toFixed(1)} u
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: 2D Blueprint / Cross-Section, Sliders & Live Geometric Properties */}
        <div className="lg:col-span-4 space-y-3 min-w-0">
          {studioMode === 'solids' && (
            <>
              {/* 2D Net Blueprint Card */}
              <div
                className={`rounded-2xl border p-3.5 ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <Grid3X3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>2D Net Blueprint</span>
                  </div>
                  <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activeSpec.netSummary}
                  </span>
                </div>

                <NetBlueprint2D figureId={figureId} dims={dims} darkMode={darkMode} />
              </div>

              {/* Live Dimension Sliders */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2.5 ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Dimensions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDims({ ...activeSpec.defaults })}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                      darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {activeSpec.controls.map((ctrl) => (
                  <div key={ctrl.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{ctrl.label}</span>
                      <span className="font-black tabular-nums text-amber-500">
                        {dims[ctrl.key].toFixed(ctrl.step < 0.1 ? 2 : 1)} u
                      </span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={dims[ctrl.key]}
                      onChange={(e) =>
                        setDims((prev) => ({ ...prev, [ctrl.key]: Number(e.target.value) }))
                      }
                      className="w-full accent-cyan-500 cursor-pointer h-1.5"
                    />
                  </div>
                ))}
              </div>

              {/* Faces, Edges, Vertices & Surface Area / Volume */}
              <div
                className={`rounded-2xl border p-3.5 space-y-3 ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-black uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-emerald-500" />
                    Geometry &amp; Formulas
                  </span>
                  <span className={`text-[11px] font-semibold normal-case ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {activeSpec.eulerNote.includes('F + V') ? (
                      <MathFormula tex={solidFormulaToLatex(activeSpec.eulerNote)} />
                    ) : (
                      activeSpec.eulerNote
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                  <div className={`py-2 rounded-xl border ${darkMode ? 'bg-[#0b1220] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                    <div className="text-lg font-black tabular-nums text-amber-500">{activeSpec.faces}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Faces ({activeSpec.flatFaces}F{activeSpec.curvedFaces > 0 ? ` + ${activeSpec.curvedFaces}C` : ''})
                    </div>
                  </div>
                  <div className={`py-2 rounded-xl border ${darkMode ? 'bg-[#0b1220] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                    <div className="text-lg font-black tabular-nums text-cyan-500">{activeSpec.edges}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Edges (E)
                    </div>
                  </div>
                  <div className={`py-2 rounded-xl border ${darkMode ? 'bg-[#0b1220] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                    <div className="text-lg font-black tabular-nums text-emerald-500">{activeSpec.vertices}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Vertices (V)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/80 dark:border-white/[0.07]">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span>Surface Area:</span>
                      <MathFormula tex={solidFormulaToLatex(activeSpec.areaFormula)} />
                    </span>
                    <span className="font-black tabular-nums text-amber-500 shrink-0">{metrics.tsa.toFixed(2)} u²</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`flex items-center gap-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span>Volume:</span>
                      <MathFormula tex={solidFormulaToLatex(activeSpec.volumeFormula)} />
                    </span>
                    <span className="font-black tabular-nums text-emerald-500 shrink-0">{metrics.volume.toFixed(2)} u³</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{metrics.extraLabel}</span>
                    <span className={`font-bold tabular-nums ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {metrics.extraValue}
                    </span>
                  </div>
                </div>

                {/* Direct Option for Writing & Evaluating a 3D Formula with MathJax */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/80 dark:border-white/[0.07]">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sky-500 uppercase tracking-wider text-[11px]">
                      Write Formula (using a, w, h, r, l, s)
                    </span>
                    {evaluatedCustom3D.value !== null && (
                      <span className="font-mono font-black text-emerald-500">
                        = {evaluatedCustom3D.value.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={custom3DFormula}
                    onChange={(e) => setCustom3DFormula(e.target.value)}
                    placeholder="Write formula e.g. 6*a^2, pi*r^2*h, (1/3)*b^2*h"
                    className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
                      darkMode
                        ? 'bg-[#0b1220] border-white/[0.14] text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  {evaluatedCustom3D.latex && (
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className={`text-[11px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        MathJax Preview:
                      </span>
                      <MathFormula tex={evaluatedCustom3D.latex} className="text-sky-400 font-bold" />
                    </div>
                  )}
                </div>

                {/* Characteristics, Construction & Net Sketching Guide */}
                <div className="space-y-2 text-xs pt-2 border-t border-slate-200/80 dark:border-white/[0.07]">
                  <div>
                    <span className="font-extrabold text-cyan-500">Base &amp; Lateral Faces: </span>
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      {activeSpec.baseShape} · {activeSpec.lateralShape}
                    </span>
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-500">3D Construction: </span>
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      {activeSpec.constructionRule}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-extrabold text-emerald-500">How to Sketch the 2D Net:</div>
                    <ol className={`list-decimal list-inside space-y-0.5 text-[11px] leading-snug ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {activeSpec.sketchSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Eye className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Drag to rotate, scroll/pinch to zoom, slide Unfold, or change dimensions to see live math changes.</span>
                </div>
              </div>
            </>
          )}

          {studioMode === 'plane_plane' && (
            <>
              {/* 2D Cross-Section Blueprint */}
              <div
                className={`rounded-2xl border p-3.5 ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <SquareStack className="w-3.5 h-3.5 text-sky-500" />
                    <span>2D Cross-Section</span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-500">{activePlanePreset.symbol}</span>
                </div>
                <PlanePlaneDiagram2D params={ppParams} darkMode={darkMode} />
              </div>

              {/* Interactive Controls */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2.5 ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
                    <span>Plane Controls</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPpParams((prev) => ({
                        ...prev,
                        dihedralDeg: prev.caseType === 'perpendicular' || prev.caseType === 'three_planes' ? 90 : 58,
                        slideOffset: 0,
                        separation: 1.5,
                        plane3TiltDeg: 90,
                      }))
                    }
                    className={`inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                      darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {(ppParams.caseType === 'intersecting' || ppParams.caseType === 'perpendicular') && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Shift Line L (x-offset)</span>
                      <span className="font-black tabular-nums text-sky-500">
                        {ppParams.slideOffset.toFixed(1)} u
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-1.5}
                      max={1.5}
                      step={0.1}
                      value={ppParams.slideOffset}
                      onChange={(e) =>
                        setPpParams((prev) => ({ ...prev, slideOffset: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-500 cursor-pointer h-1.5"
                    />
                  </div>
                )}

                {ppParams.caseType === 'three_planes' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Plane Π₃ Tilt Angle</span>
                      <span className="font-black tabular-nums text-emerald-500">
                        {Math.round(ppParams.plane3TiltDeg)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={150}
                      step={1}
                      value={Math.round(ppParams.plane3TiltDeg)}
                      onChange={(e) =>
                        setPpParams((prev) => ({ ...prev, plane3TiltDeg: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer h-1.5"
                    />
                  </div>
                )}

                <p className={`text-xs leading-relaxed pt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {activePlanePreset.summary}
                </p>
              </div>

              {/* Live Equations & Angle Summary */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2 text-xs ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-black uppercase tracking-wider text-sky-500">
                  3D Plane Equations &amp; Geometry
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Plane Π₁ (Sky Blue)</span>
                  <span className="font-mono font-bold text-sky-400">{ppEquations.p1}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Plane Π₂ (Amber)</span>
                  <span className="font-mono font-bold text-amber-500">{ppEquations.p2}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/80 dark:border-white/[0.07]">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Acute Dihedral Angle</span>
                  <span className="font-black tabular-nums text-emerald-500">{ppEquations.acuteAngle}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] pt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Eye className="w-3.5 h-3.5 shrink-0 text-sky-500" />
                  <span>Orbit above or below the planes to see how the two surfaces cross along line L.</span>
                </div>
              </div>
            </>
          )}

          {studioMode === 'line_plane' && (
            <>
              {/* 2D Elevation Diagram showing ΔPQQ' */}
              <div
                className={`rounded-2xl border p-3.5 ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <GitCommitHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Elevation &amp; Projection</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500">{activeLinePreset.symbol}</span>
                </div>
                <LinePlaneDiagram2D params={lpParams} darkMode={darkMode} />
              </div>

              {/* Interactive Controls */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2.5 ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Line Orientation</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLpParams((prev) => ({
                        ...prev,
                        inclinationDeg: 42,
                        azimuthDeg: 25,
                        offset: 0,
                        height: 1.4,
                      }))
                    }
                    className={`inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                      darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {lpParams.caseType !== 'perpendicular' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Direction Azimuth (φ)</span>
                      <span className="font-black tabular-nums text-emerald-500">
                        {Math.round(lpParams.azimuthDeg)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={Math.round(lpParams.azimuthDeg)}
                      onChange={(e) =>
                        setLpParams((prev) => ({ ...prev, azimuthDeg: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer h-1.5"
                    />
                  </div>
                )}

                {lpParams.caseType !== 'parallel' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        {lpParams.caseType === 'contained' ? 'Slide Line Across Plane' : 'Piercing Point Offset (x)'}
                      </span>
                      <span className="font-black tabular-nums text-amber-500">
                        {lpParams.offset.toFixed(1)} u
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-1.4}
                      max={1.4}
                      step={0.1}
                      value={lpParams.offset}
                      onChange={(e) =>
                        setLpParams((prev) => ({ ...prev, offset: Number(e.target.value) }))
                      }
                      className="w-full accent-amber-500 cursor-pointer h-1.5"
                    />
                  </div>
                )}

                <p className={`text-xs leading-relaxed pt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {activeLinePreset.summary}
                </p>
              </div>

              {/* Live Intersection Coordinates & Angle Readout */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2 text-xs ${
                  darkMode ? 'bg-[#121a2d] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-black uppercase tracking-wider text-emerald-500">
                  Intersection &amp; Angle Readout
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Intersection Point</span>
                  <span className="font-mono font-bold text-emerald-400">{lpMetrics.pointText}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Direction Vector d</span>
                  <span className="font-mono font-bold text-amber-500">{lpMetrics.dirText}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/80 dark:border-white/[0.07]">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Angle with Plane (θ)</span>
                  <span className="font-black tabular-nums text-amber-500">{lpMetrics.angleText}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Angle with Normal (90° − θ)</span>
                  <span className="font-black tabular-nums text-sky-400">{lpMetrics.normalAngleText}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] pt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Eye className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Amber = above plane, rose = below plane. Orbit underneath to watch the line emerge!</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolidFigures3DSimulation;
