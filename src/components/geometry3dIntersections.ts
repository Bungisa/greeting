import * as THREE from 'three';

export type PlanePlaneCase =
  | 'intersecting'
  | 'perpendicular'
  | 'parallel'
  | 'coincident'
  | 'three_planes';

export type LinePlaneCase =
  | 'piercing'
  | 'perpendicular'
  | 'parallel'
  | 'contained';

export interface PlanePlaneParams {
  caseType: PlanePlaneCase;
  dihedralDeg: number; // 10..170 for intersecting
  slideOffset: number; // -1.5..1.5 shift of plane 2 along X
  separation: number; // 0.4..2.4 distance for parallel planes
  plane3TiltDeg: number; // 30..150 tilt for 3rd plane in three_planes mode
  showNormals: boolean;
  showGuides: boolean;
}

export interface LinePlaneParams {
  caseType: LinePlaneCase;
  inclinationDeg: number; // 10..85 angle between line and plane
  azimuthDeg: number; // 0..360 rotation around Y
  offset: number; // -1.4..1.4 horizontal piercing offset
  height: number; // 0.4..2.4 height above plane when parallel
  showProjection: boolean;
  showNormal: boolean;
}

export interface BuiltIntersectionRig<TParams> {
  root: THREE.Group;
  update: (params: TParams) => void;
  dispose: () => void;
}

export const PLANE_PLANE_PRESETS: Array<{
  id: PlanePlaneCase;
  shortName: string;
  title: string;
  intersectionResult: string;
  symbol: string;
  summary: string;
}> = [
  {
    id: 'intersecting',
    shortName: 'Intersecting',
    title: 'Two Intersecting Planes',
    intersectionResult: 'A Straight Line (L)',
    symbol: 'Π₁ ∩ Π₂ = L',
    summary:
      'Two non-parallel planes always intersect along a single straight line L. Their angle θ (dihedral angle) is measured between two rays perpendicular to L, one in each plane.',
  },
  {
    id: 'perpendicular',
    shortName: 'Perpendicular (90°)',
    title: 'Perpendicular Planes',
    intersectionResult: 'Line L at 90° Dihedral',
    symbol: 'Π₁ ⊥ Π₂  (θ = 90°)',
    summary:
      'Planes intersect at a right angle (90°). Their normal vectors are orthogonal (n₁ · n₂ = 0), like a wall meeting a level floor.',
  },
  {
    id: 'parallel',
    shortName: 'Parallel',
    title: 'Parallel Planes',
    intersectionResult: 'No Intersection (Empty)',
    symbol: 'Π₁ ∥ Π₂  ⇒  Π₁ ∩ Π₂ = ∅',
    summary:
      'Parallel planes share the same normal direction (n₁ ∥ n₂) and stay a constant perpendicular distance d apart—they never meet.',
  },
  {
    id: 'coincident',
    shortName: 'Coincident',
    title: 'Coincident (Identical) Planes',
    intersectionResult: 'Entire Plane (∞ Points)',
    symbol: 'Π₁ = Π₂  ⇒  Π₁ ∩ Π₂ = Π₁',
    summary:
      'Both planes occupy the exact same set of points in 3D space with zero separation and identical normal direction.',
  },
  {
    id: 'three_planes',
    shortName: '3 Planes → Point',
    title: 'Three Planes Meeting at a Point',
    intersectionResult: 'Single Point (P)',
    symbol: 'Π₁ ∩ Π₂ ∩ Π₃ = {P}',
    summary:
      'Pairwise, three mutually non-parallel planes form three intersection lines (L₁₂, L₂₃, L₃₁) that all meet at one unique point P—like the corner of a room.',
  },
];

export const LINE_PLANE_PRESETS: Array<{
  id: LinePlaneCase;
  shortName: string;
  title: string;
  intersectionResult: string;
  symbol: string;
  summary: string;
}> = [
  {
    id: 'piercing',
    shortName: 'Piercing (Angle θ)',
    title: 'Line Piercing a Plane',
    intersectionResult: 'Single Point (P)',
    symbol: 'L ∩ Π = {P}',
    summary:
      'A non-parallel line pierces the plane at one unique point P. The angle θ between line L and plane Π is the acute angle between L and its orthogonal projection L′ on Π.',
  },
  {
    id: 'perpendicular',
    shortName: 'Perpendicular (90°)',
    title: 'Line Perpendicular to Plane',
    intersectionResult: 'Point P at 90°',
    symbol: 'L ⊥ Π  (θ = 90°)',
    summary:
      'The line runs parallel to the plane normal (d ∥ n) and meets the plane at 90° to every line in the plane passing through its foot P.',
  },
  {
    id: 'parallel',
    shortName: 'Parallel',
    title: 'Line Parallel to Plane',
    intersectionResult: 'No Intersection (Empty)',
    symbol: 'L ∥ Π  ⇒  L ∩ Π = ∅',
    summary:
      'The line direction is perpendicular to the plane normal (d · n = 0) at a constant height h > 0 above the plane, so it never touches Π.',
  },
  {
    id: 'contained',
    shortName: 'Lies in Plane',
    title: 'Line Contained in Plane',
    intersectionResult: 'Entire Line (∞ Points)',
    symbol: 'L ⊂ Π  ⇒  L ∩ Π = L',
    summary:
      'Every point along line L satisfies the plane equation. The line is completely embedded inside plane Π with angle θ = 0° and distance h = 0.',
  },
];

interface DynamicBadge {
  sprite: THREE.Sprite;
  setText: (text: string) => void;
  dispose: () => void;
}

function createPlaneGridTexture(
  fillHex: string,
  gridRgba: string,
  borderHex: string
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = fillHex;
  ctx.fillRect(0, 0, size, size);

  // Subtle architectural glass sheen
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, 'rgba(255,255,255,0.26)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
  grad.addColorStop(1, 'rgba(15,23,42,0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Clean coordinate grid lines
  ctx.strokeStyle = gridRgba;
  ctx.lineWidth = 1.6;
  const step = 64;
  for (let i = step; i < size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Crisp perimeter border
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, size - 10, size - 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createDynamicBadge(
  initialText: string,
  bgHex: string,
  textHex: string,
  borderHex: string,
  scaleX = 0.85,
  scaleY = 0.42
): DynamicBadge {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  let currentText = '';

  const renderText = (text: string) => {
    if (text === currentText) return;
    currentText = text;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rounded pill card
    const pad = 12;
    const r = 24;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;

    ctx.beginPath();
    ctx.moveTo(pad + r, pad);
    ctx.lineTo(pad + w - r, pad);
    ctx.quadraticCurveTo(pad + w, pad, pad + w, pad + r);
    ctx.lineTo(pad + w, pad + h - r);
    ctx.quadraticCurveTo(pad + w, pad + h, pad + w - r, pad + h);
    ctx.lineTo(pad + r, pad + h);
    ctx.quadraticCurveTo(pad, pad + h, pad, pad + h - r);
    ctx.lineTo(pad, pad + r);
    ctx.quadraticCurveTo(pad, pad, pad + r, pad);
    ctx.closePath();

    ctx.fillStyle = bgHex;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = borderHex;
    ctx.stroke();

    ctx.font = '800 44px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textHex;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
    texture.needsUpdate = true;
  };

  renderText(initialText);

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scaleX, scaleY, 1);
  sprite.renderOrder = 20;

  return {
    sprite,
    setText: renderText,
    dispose: () => {
      mat.dispose();
      texture.dispose();
    },
  };
}

/**
 * Helper to orient a cylinder/rod mesh from point A to point B (assuming default geometry aligned along +Y).
 */
function positionRodBetween(
  mesh: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3
) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  if (len < 1e-5) {
    mesh.visible = false;
    return;
  }
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.scale.set(1, len, 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
}

/**
 * Helper to orient a cone tip at point `tip` pointing along unit `dir`.
 */
function positionArrowHead(
  cone: THREE.Object3D,
  tip: THREE.Vector3,
  dir: THREE.Vector3
) {
  const unit = dir.clone().normalize();
  cone.position.copy(tip);
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), unit);
}

/**
 * Builds an L-shaped right-angle marker in the plane spanned by unit vectors u and v at corner O.
 */
function setRightAngleSquare(
  line: THREE.Line,
  origin: THREE.Vector3,
  u: THREE.Vector3,
  v: THREE.Vector3,
  size: number
) {
  const p1 = origin.clone().addScaledVector(u, size);
  const p2 = p1.clone().addScaledVector(v, size);
  const p3 = origin.clone().addScaledVector(v, size);
  const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
  attr.setXYZ(0, p1.x, p1.y, p1.z);
  attr.setXYZ(1, p2.x, p2.y, p2.z);
  attr.setXYZ(2, p3.x, p3.y, p3.z);
  attr.needsUpdate = true;
}

/**
 * Updates a circular angle sector (fan mesh) and rim curve between two unit vectors u and v around origin O.
 */
function setAngleWedge(
  fanMesh: THREE.Mesh,
  arcLine: THREE.Line,
  origin: THREE.Vector3,
  u: THREE.Vector3,
  v: THREE.Vector3,
  radius: number,
  segments: number
) {
  const angle = Math.acos(Math.max(-1, Math.min(1, u.dot(v))));
  const fanPos = fanMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
  const arcPos = arcLine.geometry.getAttribute('position') as THREE.BufferAttribute;

  if (angle < 0.015) {
    fanMesh.visible = false;
    arcLine.visible = false;
    return;
  }

  // Orthonormal basis in plane of u and v
  const axis = new THREE.Vector3().crossVectors(u, v);
  if (axis.lengthSq() < 1e-6) {
    fanMesh.visible = false;
    arcLine.visible = false;
    return;
  }
  axis.normalize();
  const w = new THREE.Vector3().crossVectors(axis, u).normalize();

  fanPos.setXYZ(0, origin.x, origin.y, origin.z);
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * angle;
    const pt = origin
      .clone()
      .addScaledVector(u, Math.cos(t) * radius)
      .addScaledVector(w, Math.sin(t) * radius);
    fanPos.setXYZ(i + 1, pt.x, pt.y, pt.z);
    arcPos.setXYZ(i, pt.x, pt.y, pt.z);
  }
  fanPos.needsUpdate = true;
  arcPos.needsUpdate = true;
  fanMesh.geometry.computeVertexNormals();
}

// ============================================================================
// 1. PLANE ∩ PLANE INTERACTIVE 3D RIG
// ============================================================================
export function buildPlanePlaneRig(
  darkMode: boolean
): BuiltIntersectionRig<PlanePlaneParams> {
  const root = new THREE.Group();
  root.position.set(0, 0.55, 0);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const badges: DynamicBadge[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };
  const trackBadge = (b: DynamicBadge) => {
    badges.push(b);
    return b;
  };

  const PLANE_SIZE = 5.2;

  const makeArchitecturalPlane = (
    fillHex: string,
    borderHex: string,
    opacity: number
  ) => {
    const group = new THREE.Group();
    const tex = trackTex(
      createPlaneGridTexture(fillHex, 'rgba(255,255,255,0.28)', borderHex)
    );
    const geo = trackGeo(new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE));
    geo.rotateX(-Math.PI / 2); // Lies in XZ plane by default
    const mat = trackMat(
      new THREE.MeshPhysicalMaterial({
        map: tex,
        transparent: true,
        opacity,
        roughness: 0.2,
        metalness: 0.05,
        clearcoat: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 2;
    group.add(mesh);

    const edgeGeo = trackGeo(new THREE.EdgesGeometry(geo));
    const edgeMat = trackMat(
      new THREE.LineBasicMaterial({
        color: new THREE.Color(borderHex),
        transparent: true,
        opacity: 0.95,
      })
    );
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edges);

    return { group, mat, edgeMat };
  };

  // Plane 1 (Sky Blue), Plane 2 (Warm Amber), Plane 3 (Emerald - for 3-planes mode)
  const p1 = makeArchitecturalPlane('#0284c7', '#38bdf8', 0.44);
  const p2 = makeArchitecturalPlane('#d97706', '#fbbf24', 0.46);
  const p3 = makeArchitecturalPlane('#059669', '#34d399', 0.44);
  root.add(p1.group, p2.group, p3.group);

  // Reusable unit cylinder & cone for glowing intersection lines & arrows
  const unitCylGeo = trackGeo(new THREE.CylinderGeometry(1, 1, 1, 20));
  const unitConeGeo = trackGeo(new THREE.ConeGeometry(1, 1, 20));

  const makeGlowingLine = (colorHex: string, radius = 0.042) => {
    const group = new THREE.Group();
    const mat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.15,
      })
    );
    const rod = new THREE.Mesh(unitCylGeo, mat);
    rod.scale.set(radius, 1, radius);
    const tipA = new THREE.Mesh(unitConeGeo, mat);
    tipA.scale.set(radius * 2.5, radius * 5.2, radius * 2.5);
    const tipB = new THREE.Mesh(unitConeGeo, mat);
    tipB.scale.set(radius * 2.5, radius * 5.2, radius * 2.5);
    group.add(rod, tipA, tipB);

    const setEndpoints = (a: THREE.Vector3, b: THREE.Vector3) => {
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      if (len < 1e-4) {
        group.visible = false;
        return;
      }
      group.visible = true;
      const unit = dir.clone().divideScalar(len);
      rod.position.copy(a).addScaledVector(dir, 0.5);
      rod.scale.set(radius, len, radius);
      rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), unit);

      positionArrowHead(tipA, b, unit);
      positionArrowHead(tipB, a, unit.clone().negate());
    };

    return { group, setEndpoints };
  };

  // Primary intersection line L (between Π1 & Π2) + 2 extra lines for 3-planes mode
  const lineL12 = makeGlowingLine('#f43f5e', 0.046);
  const lineL13 = makeGlowingLine('#22d3ee', 0.036);
  const lineL23 = makeGlowingLine('#facc15', 0.036);
  root.add(lineL12.group, lineL13.group, lineL23.group);

  // Common intersection point P (for 3-planes mode) + Midpoint M (for dihedral angle)
  const sphereGeo = trackGeo(new THREE.SphereGeometry(0.14, 28, 28));
  const pointPMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#fde047',
      emissive: '#f59e0b',
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.25,
    })
  );
  const pointPMesh = new THREE.Mesh(sphereGeo, pointPMat);
  pointPMesh.renderOrder = 10;
  root.add(pointPMesh);

  const haloGeo = trackGeo(new THREE.RingGeometry(0.18, 0.28, 36));
  const haloMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#fde047',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })
  );
  const pointPHalo = new THREE.Mesh(haloGeo, haloMat);
  pointPHalo.rotation.x = -Math.PI / 2;
  root.add(pointPHalo);

  // Dihedral guide rays (two perpendicular rays on Π1 and Π2 from M)
  const ray1 = makeGlowingLine('#38bdf8', 0.026);
  const ray2 = makeGlowingLine('#fbbf24', 0.026);
  root.add(ray1.group, ray2.group);

  // Dihedral angle wedge fan + crisp arc
  const ARC_SEGMENTS = 36;
  const fanGeo = trackGeo(new THREE.BufferGeometry());
  const fanVerts = new Float32Array((ARC_SEGMENTS + 2) * 3);
  const fanIndices: number[] = [];
  for (let i = 1; i <= ARC_SEGMENTS; i++) {
    fanIndices.push(0, i, i + 1);
  }
  fanGeo.setAttribute('position', new THREE.BufferAttribute(fanVerts, 3));
  fanGeo.setIndex(fanIndices);
  const fanMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#10b981',
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const dihedralFan = new THREE.Mesh(fanGeo, fanMat);
  dihedralFan.renderOrder = 6;
  root.add(dihedralFan);

  const arcGeo = trackGeo(new THREE.BufferGeometry());
  arcGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array((ARC_SEGMENTS + 1) * 3), 3)
  );
  const arcMat = trackMat(
    new THREE.LineBasicMaterial({ color: '#34d399', transparent: true, opacity: 0.98 })
  );
  const dihedralArc = new THREE.Line(arcGeo, arcMat);
  dihedralArc.renderOrder = 8;
  root.add(dihedralArc);

  // Right-angle squares (ray1 ⊥ L, ray2 ⊥ L, and 90° dihedral indicator)
  const makeRightAngleLine = (hex: string) => {
    const g = trackGeo(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    const m = trackMat(new THREE.LineBasicMaterial({ color: hex }));
    const l = new THREE.Line(g, m);
    l.renderOrder = 9;
    root.add(l);
    return l;
  };
  const raRay1L = makeRightAngleLine('#7dd3fc');
  const raRay2L = makeRightAngleLine('#fde68a');
  const raPerpDihedral = makeRightAngleLine('#34d399');
  const raDistTop = makeRightAngleLine('#f43f5e');
  const raDistBot = makeRightAngleLine('#f43f5e');

  // Parallel separation dashed strut
  const distLineGeo = trackGeo(new THREE.BufferGeometry());
  distLineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const distLineMat = trackMat(
    new THREE.LineDashedMaterial({
      color: '#f43f5e',
      dashSize: 0.14,
      gapSize: 0.08,
    })
  );
  const distLine = new THREE.Line(distLineGeo, distLineMat);
  root.add(distLine);

  // Normal Vector Arrows (n1, n2)
  const makeVectorArrow = (colorHex: string) => {
    const group = new THREE.Group();
    const mat = trackMat(
      new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      })
    );
    const shaft = new THREE.Mesh(unitCylGeo, mat);
    const head = new THREE.Mesh(unitConeGeo, mat);
    head.scale.set(0.085, 0.24, 0.085);
    group.add(shaft, head);

    const setVector = (origin: THREE.Vector3, dir: THREE.Vector3, length: number) => {
      const unit = dir.clone().normalize();
      const end = origin.clone().addScaledVector(unit, length);
      const shaftEnd = origin.clone().addScaledVector(unit, Math.max(0.05, length - 0.16));
      positionRodBetween(shaft, origin, shaftEnd);
      shaft.scale.x = 0.032;
      shaft.scale.z = 0.032;
      positionArrowHead(head, end, unit);
      group.visible = true;
    };

    return { group, setVector };
  };

  const normal1 = makeVectorArrow('#38bdf8');
  const normal2 = makeVectorArrow('#fbbf24');
  root.add(normal1.group, normal2.group);

  // Floating Crisp 3D Badges
  const badgeBg = darkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)';
  const badgeText = darkMode ? '#f8fafc' : '#0f172a';
  const badgeP1 = trackBadge(createDynamicBadge('Π₁', badgeBg, '#38bdf8', '#0284c7', 0.62, 0.34));
  const badgeP2 = trackBadge(createDynamicBadge('Π₂', badgeBg, '#f59e0b', '#d97706', 0.62, 0.34));
  const badgeP3 = trackBadge(createDynamicBadge('Π₃', badgeBg, '#10b981', '#059669', 0.62, 0.34));
  const badgeLineL = trackBadge(createDynamicBadge('Line L', badgeBg, '#f43f5e', '#e11d48', 0.92, 0.36));
  const badgeAngle = trackBadge(createDynamicBadge('θ = 58°', badgeBg, '#10b981', '#059669', 1.02, 0.38));
  const badgeN1 = trackBadge(createDynamicBadge('n₁', badgeBg, '#38bdf8', '#0284c7', 0.56, 0.32));
  const badgeN2 = trackBadge(createDynamicBadge('n₂', badgeBg, '#f59e0b', '#d97706', 0.56, 0.32));
  const badgePoint = trackBadge(createDynamicBadge('Point P', badgeBg, badgeText, '#f59e0b', 0.96, 0.36));

  root.add(
    badgeP1.sprite,
    badgeP2.sprite,
    badgeP3.sprite,
    badgeLineL.sprite,
    badgeAngle.sprite,
    badgeN1.sprite,
    badgeN2.sprite,
    badgePoint.sprite
  );

  const update = (params: PlanePlaneParams) => {
    const {
      caseType,
      dihedralDeg,
      slideOffset,
      separation,
      plane3TiltDeg,
      showNormals,
      showGuides,
    } = params;

    // Reset all optional elements before enabling for active case
    p1.group.visible = true;
    p2.group.visible = true;
    p3.group.visible = false;
    p1.group.position.set(0, 0, 0);
    p1.group.rotation.set(0, 0, 0);
    p2.group.position.set(0, 0, 0);
    p2.group.rotation.set(0, 0, 0);
    p3.group.position.set(0, 0, 0);
    p3.group.rotation.set(0, 0, 0);

    lineL12.group.visible = false;
    lineL13.group.visible = false;
    lineL23.group.visible = false;
    pointPMesh.visible = false;
    pointPHalo.visible = false;
    ray1.group.visible = false;
    ray2.group.visible = false;
    dihedralFan.visible = false;
    dihedralArc.visible = false;
    raRay1L.visible = false;
    raRay2L.visible = false;
    raPerpDihedral.visible = false;
    raDistTop.visible = false;
    raDistBot.visible = false;
    distLine.visible = false;
    normal1.group.visible = false;
    normal2.group.visible = false;

    badgeP1.sprite.visible = true;
    badgeP2.sprite.visible = true;
    badgeP3.sprite.visible = false;
    badgeLineL.sprite.visible = false;
    badgeAngle.sprite.visible = false;
    badgeN1.sprite.visible = false;
    badgeN2.sprite.visible = false;
    badgePoint.sprite.visible = false;

    const half = PLANE_SIZE * 0.5;

    if (caseType === 'intersecting' || caseType === 'perpendicular') {
      const deg = caseType === 'perpendicular' ? 90 : dihedralDeg;
      const rad = THREE.MathUtils.degToRad(deg);
      const sx = slideOffset;

      p1.group.position.set(0, 0, 0);
      p2.group.position.set(sx, 0, 0);
      p2.group.rotation.z = rad;

      // Intersection line L along Z at (sx, 0, z)
      const zExt = half + 0.35;
      lineL12.setEndpoints(
        new THREE.Vector3(sx, 0, -zExt),
        new THREE.Vector3(sx, 0, zExt)
      );
      badgeLineL.setText('Line L');
      badgeLineL.sprite.visible = true;
      badgeLineL.sprite.position.set(sx, 0.32, zExt - 0.15);

      // Plane labels
      badgeP1.sprite.position.set(sx > 0 ? -2.05 : 2.05, 0.25, -2.05);
      const p2Dir = new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0);
      badgeP2.sprite.position.set(
        sx + p2Dir.x * 2.05,
        p2Dir.y * 2.05 + 0.18,
        -2.05
      );

      // Dihedral Angle Construction at M = (sx, 0, 0)
      if (showGuides) {
        const M = new THREE.Vector3(sx, 0, 0);
        const u1 = new THREE.Vector3(1, 0, 0);
        const u2 = new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0).normalize();
        const zAxis = new THREE.Vector3(0, 0, 1);

        ray1.setEndpoints(M, M.clone().addScaledVector(u1, 1.75));
        ray2.setEndpoints(M, M.clone().addScaledVector(u2, 1.75));

        raRay1L.visible = true;
        setRightAngleSquare(raRay1L, M, u1, zAxis, 0.3);
        raRay2L.visible = true;
        setRightAngleSquare(raRay2L, M, u2, zAxis, 0.3);

        if (Math.abs(deg - 90) < 0.8) {
          raPerpDihedral.visible = true;
          setRightAngleSquare(raPerpDihedral, M, u1, u2, 0.45);
          dihedralFan.visible = true;
          dihedralArc.visible = true;
          setAngleWedge(dihedralFan, dihedralArc, M, u1, u2, 0.95, ARC_SEGMENTS);
        } else {
          dihedralFan.visible = true;
          dihedralArc.visible = true;
          setAngleWedge(dihedralFan, dihedralArc, M, u1, u2, 1.15, ARC_SEGMENTS);
        }

        const midAng = rad * 0.5;
        badgeAngle.setText(`θ = ${Math.round(deg)}°`);
        badgeAngle.sprite.visible = true;
        badgeAngle.sprite.position.set(
          sx + Math.cos(midAng) * 1.48,
          Math.sin(midAng) * 1.48,
          0.12
        );
      }

      // Plane Normal Vectors
      if (showNormals) {
        const nOrigin = new THREE.Vector3(sx, 0, -1.05);
        const n1Dir = new THREE.Vector3(0, 1, 0);
        const n2Dir = new THREE.Vector3(-Math.sin(rad), Math.cos(rad), 0).normalize();
        normal1.setVector(nOrigin, n1Dir, 1.7);
        normal2.setVector(nOrigin, n2Dir, 1.7);

        badgeN1.sprite.visible = true;
        badgeN1.sprite.position.copy(nOrigin).addScaledVector(n1Dir, 1.95);
        badgeN2.sprite.visible = true;
        badgeN2.sprite.position.copy(nOrigin).addScaledVector(n2Dir, 1.95);
      }
    } else if (caseType === 'parallel') {
      const halfD = separation * 0.5;
      p1.group.position.set(0, -halfD, 0);
      p2.group.position.set(0, halfD, 0);

      badgeP1.sprite.position.set(2.05, -halfD + 0.25, -2.05);
      badgeP2.sprite.position.set(2.05, halfD + 0.25, -2.05);

      if (showGuides) {
        distLine.visible = true;
        const posAttr = distLine.geometry.getAttribute('position') as THREE.BufferAttribute;
        posAttr.setXYZ(0, 0, -halfD, 0);
        posAttr.setXYZ(1, 0, halfD, 0);
        posAttr.needsUpdate = true;
        distLine.computeLineDistances();

        raDistBot.visible = true;
        setRightAngleSquare(
          raDistBot,
          new THREE.Vector3(0, -halfD, 0),
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 1, 0),
          0.26
        );
        raDistTop.visible = true;
        setRightAngleSquare(
          raDistTop,
          new THREE.Vector3(0, halfD, 0),
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, -1, 0),
          0.26
        );

        badgeAngle.setText(`d = ${separation.toFixed(1)} u`);
        badgeAngle.sprite.visible = true;
        badgeAngle.sprite.position.set(0.65, 0, 0);
      }

      if (showNormals) {
        const up = new THREE.Vector3(0, 1, 0);
        normal1.setVector(new THREE.Vector3(-1.3, -halfD, -0.8), up, 1.35);
        normal2.setVector(new THREE.Vector3(-1.3, halfD, -0.8), up, 1.35);
        badgeN1.sprite.visible = true;
        badgeN1.sprite.position.set(-1.3, -halfD + 1.55, -0.8);
        badgeN2.sprite.visible = true;
        badgeN2.sprite.position.set(-1.3, halfD + 1.55, -0.8);
      }
    } else if (caseType === 'coincident') {
      p1.group.position.set(0, -0.014, 0);
      p2.group.position.set(0, 0.014, 0);

      badgeP1.sprite.position.set(-1.8, 0.35, -1.8);
      badgeP2.sprite.position.set(1.8, 0.35, -1.8);

      badgeAngle.setText('Π₁ = Π₂ (∞ pts)');
      badgeAngle.sprite.visible = true;
      badgeAngle.sprite.position.set(0, 0.45, 0);

      if (showNormals) {
        const up = new THREE.Vector3(0, 1, 0);
        normal1.setVector(new THREE.Vector3(-0.35, 0.02, -0.8), up, 1.65);
        normal2.setVector(new THREE.Vector3(0.35, 0.02, -0.8), up, 1.65);
        badgeN1.sprite.visible = true;
        badgeN1.sprite.position.set(-0.5, 1.9, -0.8);
        badgeN2.sprite.visible = true;
        badgeN2.sprite.position.set(0.5, 1.9, -0.8);
      }
    } else if (caseType === 'three_planes') {
      const tilt2 = THREE.MathUtils.degToRad(dihedralDeg);
      const tilt3 = THREE.MathUtils.degToRad(plane3TiltDeg);

      // Plane 1: Horizontal XZ (y = 0)
      p1.group.position.set(0, 0, 0);
      p1.group.rotation.set(0, 0, 0);

      // Plane 2: Rotated around Z by tilt2 -> normal n2 = (-sin(t2), cos(t2), 0)
      p2.group.position.set(0, 0, 0);
      p2.group.rotation.set(0, 0, tilt2);

      // Plane 3: Rotated around X by tilt3 -> normal n3 = (0, cos(t3), sin(t3))
      p3.group.visible = true;
      p3.group.position.set(0, 0, 0);
      p3.group.rotation.set(tilt3, 0, 0);

      const ext = half + 0.25;
      // L12 = intersection of Π1 (y=0) & Π2 (rotated around Z) -> Z axis
      lineL12.setEndpoints(new THREE.Vector3(0, 0, -ext), new THREE.Vector3(0, 0, ext));
      // L13 = intersection of Π1 (y=0) & Π3 (rotated around X) -> X axis
      lineL13.setEndpoints(new THREE.Vector3(-ext, 0, 0), new THREE.Vector3(ext, 0, 0));
      // L23 = n2 × n3
      const n2 = new THREE.Vector3(-Math.sin(tilt2), Math.cos(tilt2), 0);
      const n3 = new THREE.Vector3(0, Math.cos(tilt3), Math.sin(tilt3));
      const d23 = new THREE.Vector3().crossVectors(n2, n3);
      if (d23.length() > 1e-3) {
        d23.normalize();
        lineL23.setEndpoints(
          d23.clone().multiplyScalar(-ext),
          d23.clone().multiplyScalar(ext)
        );
      }

      // Common intersection point P = (0, 0, 0)
      pointPMesh.visible = true;
      pointPMesh.position.set(0, 0, 0);
      pointPHalo.visible = true;
      pointPHalo.position.set(0, 0.01, 0);

      badgePoint.setText('Point P');
      badgePoint.sprite.visible = true;
      badgePoint.sprite.position.set(0.55, 0.45, 0.55);

      badgeP1.sprite.position.set(-2.05, 0.24, 2.05);
      badgeP2.sprite.position.set(Math.cos(tilt2) * 2.0, Math.sin(tilt2) * 2.0, -2.0);
      badgeP3.sprite.visible = true;
      badgeP3.sprite.position.set(2.0, Math.sin(tilt3) * 2.0, Math.cos(tilt3) * 2.0);
    }
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    badges.forEach((b) => b.dispose());
  };

  return { root, update, dispose };
}

// ============================================================================
// 2. LINE ∩ PLANE INTERACTIVE 3D RIG
// ============================================================================
export function buildLinePlaneRig(
  darkMode: boolean
): BuiltIntersectionRig<LinePlaneParams> {
  const root = new THREE.Group();
  root.position.set(0, 0.35, 0);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const badges: DynamicBadge[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };
  const trackBadge = (b: DynamicBadge) => {
    badges.push(b);
    return b;
  };

  const PLANE_SIZE = 5.6;

  // Architectural Plane Π in XZ (y = 0)
  const planeTex = trackTex(
    createPlaneGridTexture('#0284c7', 'rgba(255,255,255,0.28)', '#38bdf8')
  );
  const planeGeo = trackGeo(new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE));
  planeGeo.rotateX(-Math.PI / 2);
  const planeMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: planeTex,
      transparent: true,
      opacity: 0.48,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  planeMesh.renderOrder = 2;
  root.add(planeMesh);

  const planeEdgeGeo = trackGeo(new THREE.EdgesGeometry(planeGeo));
  const planeEdgeMat = trackMat(
    new THREE.LineBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.95 })
  );
  root.add(new THREE.LineSegments(planeEdgeGeo, planeEdgeMat));

  // Reusable cylinder & cone
  const unitCylGeo = trackGeo(new THREE.CylinderGeometry(1, 1, 1, 20));
  const unitConeGeo = trackGeo(new THREE.ConeGeometry(1, 1, 20));

  // Upper Line Segment (bright amber/gold) + Lower Submerged Segment (muted rose/coral)
  const upperMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: '#d97706',
      emissiveIntensity: 0.45,
      roughness: 0.22,
      metalness: 0.2,
    })
  );
  const lowerMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#fb7185',
      emissive: '#e11d48',
      emissiveIntensity: 0.3,
      roughness: 0.35,
      transparent: true,
      opacity: 0.72,
    })
  );

  const lineUpperRod = new THREE.Mesh(unitCylGeo, upperMat);
  const lineUpperTip = new THREE.Mesh(unitConeGeo, upperMat);
  lineUpperTip.scale.set(0.11, 0.26, 0.11);
  const lineUpperTipNeg = new THREE.Mesh(unitConeGeo, upperMat);
  lineUpperTipNeg.scale.set(0.11, 0.26, 0.11);

  const lineLowerRod = new THREE.Mesh(unitCylGeo, lowerMat);
  const lineLowerTip = new THREE.Mesh(unitConeGeo, lowerMat);
  lineLowerTip.scale.set(0.11, 0.26, 0.11);

  root.add(lineUpperRod, lineUpperTip, lineUpperTipNeg, lineLowerRod, lineLowerTip);

  // Piercing Point P (glowing sphere + bullseye ring on plane)
  const ptGeo = trackGeo(new THREE.SphereGeometry(0.13, 28, 28));
  const ptSmallGeo = trackGeo(new THREE.SphereGeometry(0.085, 20, 20));

  const ptPMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#34d399',
      emissive: '#10b981',
      emissiveIntensity: 0.85,
      roughness: 0.15,
    })
  );
  const ptPMesh = new THREE.Mesh(ptGeo, ptPMat);
  ptPMesh.renderOrder = 10;
  root.add(ptPMesh);

  const ringGeo = trackGeo(new THREE.RingGeometry(0.17, 0.27, 36));
  const ringMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#34d399',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    })
  );
  const ptPRing = new THREE.Mesh(ringGeo, ringMat);
  ptPRing.rotation.x = -Math.PI / 2;
  ptPRing.position.y = 0.012;
  root.add(ptPRing);

  // Sample Point Q on line & its orthogonal foot Q' on plane
  const ptQMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#fde047',
      emissive: '#f59e0b',
      emissiveIntensity: 0.55,
    })
  );
  const ptQMesh = new THREE.Mesh(ptSmallGeo, ptQMat);
  const ptQPrimeMesh = new THREE.Mesh(ptSmallGeo, ptPMat);
  root.add(ptQMesh, ptQPrimeMesh);

  // Orthogonal Projection Line L' on the plane (dashed emerald)
  const makeDashedLine = (hex: string, dash = 0.15, gap = 0.09) => {
    const g = trackGeo(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const m = trackMat(
      new THREE.LineDashedMaterial({ color: hex, dashSize: dash, gapSize: gap })
    );
    const l = new THREE.Line(g, m);
    l.renderOrder = 7;
    root.add(l);
    return l;
  };

  const setSegment = (line: THREE.Line, a: THREE.Vector3, b: THREE.Vector3) => {
    const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
    attr.setXYZ(0, a.x, a.y, a.z);
    attr.setXYZ(1, b.x, b.y, b.z);
    attr.needsUpdate = true;
    line.computeLineDistances();
  };

  const projLine = makeDashedLine('#34d399', 0.16, 0.09);
  const dropLine1 = makeDashedLine('#22d3ee', 0.12, 0.07);
  const dropLine2 = makeDashedLine('#22d3ee', 0.12, 0.07);

  // Shaded Right Triangle ΔPQQ'
  const triGeo = trackGeo(new THREE.BufferGeometry());
  triGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
  const triMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#10b981',
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const triMesh = new THREE.Mesh(triGeo, triMat);
  triMesh.renderOrder = 5;
  root.add(triMesh);

  // Angle wedge θ between Line L and its Projection L'
  const ARC_SEG = 32;
  const fanGeo = trackGeo(new THREE.BufferGeometry());
  const fanVerts = new Float32Array((ARC_SEG + 2) * 3);
  const fanIdx: number[] = [];
  for (let i = 1; i <= ARC_SEG; i++) fanIdx.push(0, i, i + 1);
  fanGeo.setAttribute('position', new THREE.BufferAttribute(fanVerts, 3));
  fanGeo.setIndex(fanIdx);
  const fanMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const angleFan = new THREE.Mesh(fanGeo, fanMat);
  angleFan.renderOrder = 6;
  root.add(angleFan);

  const arcGeo = trackGeo(new THREE.BufferGeometry());
  arcGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array((ARC_SEG + 1) * 3), 3)
  );
  const arcMat = trackMat(new THREE.LineBasicMaterial({ color: '#fde047' }));
  const angleArc = new THREE.Line(arcGeo, arcMat);
  angleArc.renderOrder = 8;
  root.add(angleArc);

  // Right-angle markers
  const makeRightAngle = (hex: string) => {
    const g = trackGeo(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    const m = trackMat(new THREE.LineBasicMaterial({ color: hex }));
    const l = new THREE.Line(g, m);
    l.renderOrder = 9;
    root.add(l);
    return l;
  };
  const raFoot1 = makeRightAngle('#34d399');
  const raFoot2 = makeRightAngle('#34d399');

  // Plane Normal Vector n
  const normalMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.4,
      roughness: 0.3,
    })
  );
  const normalShaft = new THREE.Mesh(unitCylGeo, normalMat);
  const normalHead = new THREE.Mesh(unitConeGeo, normalMat);
  normalHead.scale.set(0.085, 0.24, 0.085);
  const normalGroup = new THREE.Group();
  normalGroup.add(normalShaft, normalHead);
  root.add(normalGroup);

  // Floating 3D Badges
  const badgeBg = darkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)';
  const badgePlane = trackBadge(createDynamicBadge('Plane Π', badgeBg, '#38bdf8', '#0284c7', 0.92, 0.36));
  const badgeLine = trackBadge(createDynamicBadge('Line L', badgeBg, '#f59e0b', '#d97706', 0.86, 0.36));
  const badgeProj = trackBadge(createDynamicBadge('Proj L′', badgeBg, '#10b981', '#059669', 0.88, 0.34));
  const badgeP = trackBadge(createDynamicBadge('P', badgeBg, '#34d399', '#059669', 0.48, 0.32));
  const badgeQ = trackBadge(createDynamicBadge('Q', badgeBg, '#f59e0b', '#d97706', 0.48, 0.32));
  const badgeQPrime = trackBadge(createDynamicBadge('Q′', badgeBg, '#22d3ee', '#0891b2', 0.52, 0.32));
  const badgeTheta = trackBadge(createDynamicBadge('θ = 42°', badgeBg, '#f59e0b', '#d97706', 1.0, 0.36));
  const badgeNormal = trackBadge(createDynamicBadge('n', badgeBg, '#38bdf8', '#0284c7', 0.48, 0.32));

  root.add(
    badgePlane.sprite,
    badgeLine.sprite,
    badgeProj.sprite,
    badgeP.sprite,
    badgeQ.sprite,
    badgeQPrime.sprite,
    badgeTheta.sprite,
    badgeNormal.sprite
  );

  const update = (params: LinePlaneParams) => {
    const {
      caseType,
      inclinationDeg,
      azimuthDeg,
      offset,
      height,
      showProjection,
      showNormal,
    } = params;

    // Reset visibility
    lineUpperRod.visible = true;
    lineUpperTip.visible = true;
    lineUpperTipNeg.visible = false;
    lineLowerRod.visible = false;
    lineLowerTip.visible = false;
    ptPMesh.visible = false;
    ptPRing.visible = false;
    ptQMesh.visible = false;
    ptQPrimeMesh.visible = false;
    projLine.visible = false;
    dropLine1.visible = false;
    dropLine2.visible = false;
    triMesh.visible = false;
    angleFan.visible = false;
    angleArc.visible = false;
    raFoot1.visible = false;
    raFoot2.visible = false;
    normalGroup.visible = false;

    badgePlane.sprite.visible = true;
    badgePlane.sprite.position.set(-2.1, 0.24, -2.1);
    badgeLine.sprite.visible = true;
    badgeProj.sprite.visible = false;
    badgeP.sprite.visible = false;
    badgeQ.sprite.visible = false;
    badgeQPrime.sprite.visible = false;
    badgeTheta.sprite.visible = false;
    badgeNormal.sprite.visible = false;

    const phi = THREE.MathUtils.degToRad(azimuthDeg);
    const uHoriz = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi));
    const up = new THREE.Vector3(0, 1, 0);

    if (caseType === 'piercing') {
      const theta = THREE.MathUtils.degToRad(inclinationDeg);
      const dir = new THREE.Vector3(
        Math.cos(theta) * uHoriz.x,
        Math.sin(theta),
        Math.cos(theta) * uHoriz.z
      ).normalize();

      const P = new THREE.Vector3(offset, 0, 0);
      const topEnd = P.clone().addScaledVector(dir, 2.75);
      const botEnd = P.clone().addScaledVector(dir, -2.15);

      // Upper segment (above plane)
      positionRodBetween(lineUpperRod, P, topEnd);
      lineUpperRod.scale.x = 0.044;
      lineUpperRod.scale.z = 0.044;
      positionArrowHead(lineUpperTip, topEnd, dir);

      // Lower segment (below plane)
      lineLowerRod.visible = true;
      lineLowerTip.visible = true;
      positionRodBetween(lineLowerRod, P, botEnd);
      lineLowerRod.scale.x = 0.042;
      lineLowerRod.scale.z = 0.042;
      positionArrowHead(lineLowerTip, botEnd, dir.clone().negate());

      // Piercing point P
      ptPMesh.visible = true;
      ptPMesh.position.copy(P);
      ptPRing.visible = true;
      ptPRing.position.set(P.x, 0.015, P.z);

      badgeP.sprite.visible = true;
      badgeP.sprite.position.set(P.x - uHoriz.x * 0.35, 0.34, P.z - uHoriz.z * 0.35);
      badgeLine.sprite.position.copy(topEnd).add(new THREE.Vector3(0, 0.3, 0));

      if (showProjection) {
        const distQ = 2.05;
        const Q = P.clone().addScaledVector(dir, distQ);
        const QPrime = new THREE.Vector3(Q.x, 0, Q.z);

        ptQMesh.visible = true;
        ptQMesh.position.copy(Q);
        ptQPrimeMesh.visible = true;
        ptQPrimeMesh.position.copy(QPrime);

        // Projection line L' on the plane
        projLine.visible = true;
        const projA = P.clone().addScaledVector(uHoriz, -1.85 * Math.cos(theta));
        const projB = P.clone().addScaledVector(uHoriz, 2.45 * Math.cos(theta));
        projA.y = 0.016;
        projB.y = 0.016;
        setSegment(projLine, projA, projB);

        // Vertical drop Q -> Q'
        dropLine1.visible = true;
        setSegment(dropLine1, Q, QPrime);

        // Right-angle marker at Q'
        raFoot1.visible = true;
        setRightAngleSquare(
          raFoot1,
          new THREE.Vector3(QPrime.x, 0.014, QPrime.z),
          uHoriz.clone().negate(),
          up,
          0.26
        );

        // Shaded right triangle ΔPQQ'
        triMesh.visible = true;
        const tAttr = triMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
        tAttr.setXYZ(0, P.x, 0.012, P.z);
        tAttr.setXYZ(1, QPrime.x, 0.012, QPrime.z);
        tAttr.setXYZ(2, Q.x, Q.y, Q.z);
        tAttr.needsUpdate = true;

        // Angle arc θ at P
        angleFan.visible = true;
        angleArc.visible = true;
        setAngleWedge(angleFan, angleArc, P, uHoriz, dir, 0.92, ARC_SEG);

        const midDir = uHoriz.clone().add(dir).normalize();
        badgeTheta.setText(`θ = ${Math.round(inclinationDeg)}°`);
        badgeTheta.sprite.visible = true;
        badgeTheta.sprite.position.copy(P).addScaledVector(midDir, 1.28);

        badgeQ.sprite.visible = true;
        badgeQ.sprite.position.copy(Q).add(new THREE.Vector3(0, 0.28, 0));
        badgeQPrime.sprite.visible = true;
        badgeQPrime.sprite.position.copy(QPrime).add(new THREE.Vector3(0.24, 0.22, 0.24));
        badgeProj.sprite.visible = true;
        badgeProj.sprite.position.copy(projB).add(new THREE.Vector3(0, 0.24, 0));
      }

      if (showNormal) {
        normalGroup.visible = true;
        const nTop = P.clone().add(new THREE.Vector3(0, 2.05, 0));
        positionRodBetween(normalShaft, P, P.clone().add(new THREE.Vector3(0, 1.88, 0)));
        normalShaft.scale.x = 0.032;
        normalShaft.scale.z = 0.032;
        positionArrowHead(normalHead, nTop, up);
        badgeNormal.sprite.visible = true;
        badgeNormal.sprite.position.set(P.x, 2.3, P.z);
      }
    } else if (caseType === 'perpendicular') {
      const P = new THREE.Vector3(offset, 0, 0);
      const topEnd = new THREE.Vector3(offset, 2.55, 0);
      const botEnd = new THREE.Vector3(offset, -1.95, 0);

      positionRodBetween(lineUpperRod, P, topEnd);
      lineUpperRod.scale.x = 0.046;
      lineUpperRod.scale.z = 0.046;
      positionArrowHead(lineUpperTip, topEnd, up);

      lineLowerRod.visible = true;
      lineLowerTip.visible = true;
      positionRodBetween(lineLowerRod, P, botEnd);
      lineLowerRod.scale.x = 0.044;
      lineLowerRod.scale.z = 0.044;
      positionArrowHead(lineLowerTip, botEnd, new THREE.Vector3(0, -1, 0));

      ptPMesh.visible = true;
      ptPMesh.position.copy(P);
      ptPRing.visible = true;
      ptPRing.position.set(P.x, 0.015, P.z);

      // Dual orthogonal right-angle squares proving L ⊥ Π
      raFoot1.visible = true;
      setRightAngleSquare(raFoot1, P, new THREE.Vector3(1, 0, 0), up, 0.36);
      raFoot2.visible = true;
      setRightAngleSquare(raFoot2, P, new THREE.Vector3(0, 0, 1), up, 0.36);

      badgeP.sprite.visible = true;
      badgeP.sprite.position.set(P.x - 0.35, 0.25, 0.35);
      badgeLine.sprite.position.set(P.x + 0.52, 2.5, 0);
      badgeTheta.setText('θ = 90°');
      badgeTheta.sprite.visible = true;
      badgeTheta.sprite.position.set(P.x + 0.65, 0.58, 0.32);
    } else if (caseType === 'parallel') {
      const center = new THREE.Vector3(0, height, 0);
      const a = center.clone().addScaledVector(uHoriz, -2.55);
      const b = center.clone().addScaledVector(uHoriz, 2.55);

      positionRodBetween(lineUpperRod, a, b);
      lineUpperRod.scale.x = 0.045;
      lineUpperRod.scale.z = 0.045;
      positionArrowHead(lineUpperTip, b, uHoriz);

      lineUpperTipNeg.visible = true;
      positionArrowHead(lineUpperTipNeg, a, uHoriz.clone().negate());

      badgeLine.sprite.position.copy(b).add(new THREE.Vector3(0, 0.32, 0));

      if (showProjection) {
        const pA = new THREE.Vector3(a.x, 0.016, a.z);
        const pB = new THREE.Vector3(b.x, 0.016, b.z);
        projLine.visible = true;
        setSegment(projLine, pA, pB);

        const s1Top = center.clone().addScaledVector(uHoriz, -1.25);
        const s1Bot = new THREE.Vector3(s1Top.x, 0.015, s1Top.z);
        const s2Top = center.clone().addScaledVector(uHoriz, 1.25);
        const s2Bot = new THREE.Vector3(s2Top.x, 0.015, s2Top.z);

        dropLine1.visible = true;
        setSegment(dropLine1, s1Top, s1Bot);
        dropLine2.visible = true;
        setSegment(dropLine2, s2Top, s2Bot);

        raFoot1.visible = true;
        setRightAngleSquare(raFoot1, s1Bot, uHoriz, up, 0.25);
        raFoot2.visible = true;
        setRightAngleSquare(raFoot2, s2Bot, uHoriz.clone().negate(), up, 0.25);

        badgeProj.sprite.visible = true;
        badgeProj.sprite.position.copy(pB).add(new THREE.Vector3(0, 0.24, 0));
        badgeTheta.setText(`h = ${height.toFixed(1)} u`);
        badgeTheta.sprite.visible = true;
        badgeTheta.sprite.position.set(s2Top.x + 0.45, height * 0.5, s2Top.z + 0.25);
      }

      if (showNormal) {
        normalGroup.visible = true;
        const nBase = new THREE.Vector3(-1.6, 0, -1.2);
        positionRodBetween(normalShaft, nBase, nBase.clone().add(new THREE.Vector3(0, 1.55, 0)));
        normalShaft.scale.x = 0.032;
        normalShaft.scale.z = 0.032;
        positionArrowHead(normalHead, nBase.clone().add(new THREE.Vector3(0, 1.72, 0)), up);
        badgeNormal.sprite.visible = true;
        badgeNormal.sprite.position.set(-1.6, 1.98, -1.2);
      }
    } else if (caseType === 'contained') {
      // Line lies directly inside Plane Π at y = 0.025
      const perp = new THREE.Vector3(-uHoriz.z, 0, uHoriz.x);
      const center = perp.clone().multiplyScalar(offset).setY(0.024);
      const a = center.clone().addScaledVector(uHoriz, -2.55);
      const b = center.clone().addScaledVector(uHoriz, 2.55);

      positionRodBetween(lineUpperRod, a, b);
      lineUpperRod.scale.x = 0.052;
      lineUpperRod.scale.z = 0.052;
      positionArrowHead(lineUpperTip, b, uHoriz);

      lineUpperTipNeg.visible = true;
      positionArrowHead(lineUpperTipNeg, a, uHoriz.clone().negate());

      badgeLine.sprite.position.copy(b).add(new THREE.Vector3(0, 0.34, 0));
      badgeTheta.setText('L ⊂ Π (∞ pts)');
      badgeTheta.sprite.visible = true;
      badgeTheta.sprite.position.set(center.x, 0.48, center.z);

      if (showNormal) {
        normalGroup.visible = true;
        const nBase = center.clone().setY(0);
        positionRodBetween(normalShaft, nBase, nBase.clone().add(new THREE.Vector3(0, 1.65, 0)));
        normalShaft.scale.x = 0.032;
        normalShaft.scale.z = 0.032;
        positionArrowHead(normalHead, nBase.clone().add(new THREE.Vector3(0, 1.82, 0)), up);
        badgeNormal.sprite.visible = true;
        badgeNormal.sprite.position.set(nBase.x, 2.08, nBase.z);
      }
    }
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    badges.forEach((b) => b.dispose());
  };

  return { root, update, dispose };
}
