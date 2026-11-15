import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type TugCameraPreset = 'stadium' | 'overhead' | 'close' | 'free';

interface TugOfWar3DSceneProps {
  /** Current rope position: negative = pulled toward Team Blue (left), positive = pulled toward Team Orange (right) */
  ropeSteps: number;
  /** Number of steps required to cross the winning boundary (e.g. 3, 5, or 7) */
  winSteps: number;
  teamBlueName: string;
  teamOrangeName: string;
  activeTurn: 'blue' | 'orange';
  winnerTeam: 'blue' | 'orange' | null;
  lastPullEvent: { team: 'blue' | 'orange'; seq: number } | null;
  cameraPreset: TugCameraPreset;
  cameraRotateTrigger?: { deltaAngle: number; seq: number } | null;
  forceLite2D?: boolean;
}

interface StudentRig {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  baseXOffset: number;
  baseZOffset: number;
  phaseOffset: number;
}

export const TugOfWar3DScene: React.FC<TugOfWar3DSceneProps> = ({
  ropeSteps,
  winSteps,
  teamBlueName,
  teamOrangeName,
  activeTurn,
  winnerTeam,
  lastPullEvent,
  cameraPreset,
  cameraRotateTrigger,
  forceLite2D = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  const stateRef = useRef({
    ropeSteps,
    winSteps: Math.max(1, winSteps),
    activeTurn,
    winnerTeam,
    cameraPreset,
    pullAnimTimer: 0,
    pullAnimTeam: null as 'blue' | 'orange' | null,
  });

  const lastPullSeqRef = useRef<number>(0);
  const lastRotateSeqRef = useRef<number>(0);
  const pendingRotateDeltaRef = useRef<number>(0);
  const prevPresetRef = useRef<TugCameraPreset>(cameraPreset);
  const presetTransitionTimerRef = useRef<number>(0);

  useEffect(() => {
    stateRef.current.ropeSteps = ropeSteps;
    stateRef.current.winSteps = Math.max(1, winSteps);
    stateRef.current.activeTurn = activeTurn;
    stateRef.current.winnerTeam = winnerTeam;

    if (prevPresetRef.current !== cameraPreset) {
      prevPresetRef.current = cameraPreset;
      presetTransitionTimerRef.current = 0.65;
    }
    stateRef.current.cameraPreset = cameraPreset;
  }, [ropeSteps, winSteps, activeTurn, winnerTeam, cameraPreset]);

  useEffect(() => {
    if (lastPullEvent && lastPullEvent.seq !== lastPullSeqRef.current) {
      lastPullSeqRef.current = lastPullEvent.seq;
      stateRef.current.pullAnimTimer = 1.15;
      stateRef.current.pullAnimTeam = lastPullEvent.team;
    }
  }, [lastPullEvent]);

  useEffect(() => {
    if (cameraRotateTrigger && cameraRotateTrigger.seq !== lastRotateSeqRef.current) {
      lastRotateSeqRef.current = cameraRotateTrigger.seq;
      pendingRotateDeltaRef.current += cameraRotateTrigger.deltaAngle;
    }
  }, [cameraRotateTrigger]);

  useEffect(() => {
    if (forceLite2D) return;
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // ==================== SCENE, SKY & LIGHTING ====================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#7dd3fc');
    scene.fog = new THREE.FogExp2('#bae6fd', 0.018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 160);
    camera.position.set(0, 5.8, 12.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 4.5;
    controls.maxDistance = 26;
    controls.target.set(0, 1.1, 0);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#15803d', 0.85);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#fffbeb', 1.35);
    dirLight.position.set(10, 18, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 2;
    dirLight.shadow.camera.far = 45;
    const d = 12;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // ==================== SCHOOL SPORTS GROUND ENVIRONMENT ====================
    const envGroup = new THREE.Group();
    scene.add(envGroup);

    // Outer Athletics Track Surface
    const trackGeo = new THREE.PlaneGeometry(60, 44);
    const trackMat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.9 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = -0.04;
    trackMesh.receiveShadow = true;
    envGroup.add(trackMesh);

    // Lush Green School Pitch Turf
    const turfGeo = new THREE.PlaneGeometry(26, 15);
    const turfMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.82 });
    const turfMesh = new THREE.Mesh(turfGeo, turfMat);
    turfMesh.rotation.x = -Math.PI / 2;
    turfMesh.receiveShadow = true;
    envGroup.add(turfMesh);

    // Alternating Mowed Turf Stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.85 });
    for (let i = -5; i <= 5; i += 2) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 14.6), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i * 2.0, 0.005, 0);
      stripe.receiveShadow = true;
      envGroup.add(stripe);
    }

    // White Chalk Center Line (x = 0)
    const chalkMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 10.5), chalkMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.015, 0);
    envGroup.add(centerLine);

    // Center Circle Ring
    const centerRingGeo = new THREE.RingGeometry(1.35, 1.48, 36);
    const centerRing = new THREE.Mesh(centerRingGeo, chalkMat);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.set(0, 0.015, 0);
    envGroup.add(centerRing);

    // Boundary Distance Constant in 3D World Units
    const BOUNDARY_X = 4.2;

    // Team Blue Winning Line (Left: x = -BOUNDARY_X)
    const blueLineMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    const blueWinLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 10.5), blueLineMat);
    blueWinLine.rotation.x = -Math.PI / 2;
    blueWinLine.position.set(-BOUNDARY_X, 0.018, 0);
    envGroup.add(blueWinLine);

    // Team Orange Winning Line (Right: x = +BOUNDARY_X)
    const orangeLineMat = new THREE.MeshBasicMaterial({ color: '#fb923c' });
    const orangeWinLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 10.5), orangeLineMat);
    orangeWinLine.rotation.x = -Math.PI / 2;
    orangeWinLine.position.set(BOUNDARY_X, 0.018, 0);
    envGroup.add(orangeWinLine);

    // Boundary Cones / Pylons at Team Blue & Team Orange Win Lines
    const createBoundaryPylon = (x: number, z: number, colorHex: string) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.08, 0.42),
        new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6 })
      );
      base.position.y = 0.04;
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.65, 16),
        new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.35,
          emissive: colorHex,
          emissiveIntensity: 0.18,
        })
      );
      cone.position.y = 0.38;
      cone.castShadow = true;
      group.add(base, cone);
      envGroup.add(group);
    };

    createBoundaryPylon(-BOUNDARY_X, 2.2, '#2563eb');
    createBoundaryPylon(-BOUNDARY_X, -2.2, '#2563eb');
    createBoundaryPylon(BOUNDARY_X, 2.2, '#ea580c');
    createBoundaryPylon(BOUNDARY_X, -2.2, '#ea580c');

    // School Pavilion & Bleachers in Background (z = -6.2)
    const pavilionGroup = new THREE.Group();
    pavilionGroup.position.set(0, 0, -6.4);
    envGroup.add(pavilionGroup);

    const stepColors = ['#cbd5e1', '#94a3b8', '#cbd5e1'];
    for (let s = 0; s < 3; s++) {
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.45, 0.9),
        new THREE.MeshStandardMaterial({ color: stepColors[s], roughness: 0.7 })
      );
      bench.position.set(0, 0.225 + s * 0.45, -s * 0.85);
      bench.receiveShadow = true;
      bench.castShadow = true;
      pavilionGroup.add(bench);
    }

    // Pavilion Roof Canopy
    const roofMesh = new THREE.Mesh(
      new THREE.BoxGeometry(16.8, 0.22, 3.6),
      new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.5 })
    );
    roofMesh.position.set(0, 3.2, -1.0);
    roofMesh.rotation.x = 0.12;
    roofMesh.castShadow = true;
    pavilionGroup.add(roofMesh);

    const pillarMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.3, roughness: 0.5 });
    [-7.5, -2.5, 2.5, 7.5].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 12), pillarMat);
      pillar.position.set(px, 1.6, 0.2);
      pillar.castShadow = true;
      pavilionGroup.add(pillar);
    });

    // Team Blue & Team Orange Banner Flags on Pavilion
    const blueBanner = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.65, 0.12),
      new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.4 })
    );
    blueBanner.position.set(-4.2, 2.85, 0.72);
    pavilionGroup.add(blueBanner);

    const orangeBanner = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.65, 0.12),
      new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.4 })
    );
    orangeBanner.position.set(4.2, 2.85, 0.72);
    pavilionGroup.add(orangeBanner);

    // School Trees Around Sports Field
    const createSchoolTree = (tx: number, tz: number, scale = 1) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);
      tree.scale.setScalar(scale);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.26, 1.8, 10),
        new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 })
      );
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      const crown1 = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.15, 1),
        new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.75 })
      );
      crown1.position.y = 2.2;
      crown1.castShadow = true;
      const crown2 = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.85, 1),
        new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.75 })
      );
      crown2.position.set(0.35, 2.75, 0.2);
      tree.add(trunk, crown1, crown2);
      envGroup.add(tree);
    };

    createSchoolTree(-11.2, -5.2, 1.1);
    createSchoolTree(11.2, -5.2, 1.1);
    createSchoolTree(-11.8, 4.2, 0.95);
    createSchoolTree(11.8, 4.2, 0.95);

    // ==================== DYNAMIC TUG-OF-WAR ROPE & CENTER FLAG ====================
    const ropeGroup = new THREE.Group();
    scene.add(ropeGroup);

    // Main Thick Braided Rope Cylinder
    const ropeLength = 15.5;
    const ropeGeo = new THREE.CylinderGeometry(0.095, 0.095, ropeLength, 16, 24);
    ropeGeo.rotateZ(Math.PI / 2);
    const ropeMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.85,
      metalness: 0.05,
    });
    const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
    ropeMesh.position.y = 0.92;
    ropeMesh.castShadow = true;
    ropeGroup.add(ropeMesh);

    // Braided Knot Rings along the Rope for Visual Texture
    const knotMat = new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.9 });
    for (let k = -7; k <= 7; k++) {
      if (k === 0) continue;
      const knot = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.025, 8, 16), knotMat);
      knot.rotation.y = Math.PI / 2;
      knot.position.set(k * 0.95, 0.92, 0);
      ropeGroup.add(knot);
    }

    // Center Marker Ribbon & Golden Knot (Tied to Exact Middle of Rope)
    const centerMarkerGroup = new THREE.Group();
    centerMarkerGroup.position.set(0, 0.92, 0);
    ropeGroup.add(centerMarkerGroup);

    const goldKnot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.26, 16),
      new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3, metalness: 0.4 })
    );
    goldKnot.rotation.z = Math.PI / 2;
    centerMarkerGroup.add(goldKnot);

    // Hanging Red/Gold Pennant Flag in the Center
    const pennantGeo = new THREE.ConeGeometry(0.32, 0.72, 4);
    pennantGeo.rotateX(Math.PI);
    const pennantMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      roughness: 0.4,
      emissive: '#dc2626',
      emissiveIntensity: 0.2,
    });
    const pennantMesh = new THREE.Mesh(pennantGeo, pennantMat);
    pennantMesh.position.set(0, -0.34, 0);
    pennantMesh.castShadow = true;
    centerMarkerGroup.add(pennantMesh);

    // Ground Glow Ring under Center Flag
    const groundMarkerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.44, 24),
      new THREE.MeshBasicMaterial({ color: '#facc15', side: THREE.DoubleSide })
    );
    groundMarkerRing.rotation.x = -Math.PI / 2;
    groundMarkerRing.position.set(0, -0.9, 0);
    centerMarkerGroup.add(groundMarkerRing);

    // ==================== TWO TEAMS OF ANIMATED 3D STUDENTS ====================
    const studentRigs: { blue: StudentRig[]; orange: StudentRig[] } = {
      blue: [],
      orange: [],
    };

    const createStudentPuller = (
      team: 'blue' | 'orange',
      idx: number,
      xOffsetFromCenter: number,
      zOffset: number
    ): StudentRig => {
      const root = new THREE.Group();
      root.position.set(xOffsetFromCenter, 0, zOffset);
      // Team Blue stands on Left (-X) and faces Right (+X); Team Orange stands on Right (+X) and faces Left (-X)
      root.rotation.y = team === 'blue' ? Math.PI / 2 : -Math.PI / 2;
      ropeGroup.add(root);

      const torso = new THREE.Group();
      torso.position.set(0, 0.62, 0);
      root.add(torso);

      const skinColors = ['#6f4e37', '#8d5524', '#5c3c24'];
      const skinMat = new THREE.MeshStandardMaterial({
        color: skinColors[idx % skinColors.length],
        roughness: 0.65,
      });

      const jerseyMat = new THREE.MeshStandardMaterial({
        color: team === 'blue' ? '#2563eb' : '#ea580c',
        roughness: 0.45,
      });
      const shortsMat = new THREE.MeshStandardMaterial({
        color: team === 'blue' ? '#f8fafc' : '#1e293b',
        roughness: 0.6,
      });
      const headbandMat = new THREE.MeshStandardMaterial({
        color: team === 'blue' ? '#38bdf8' : '#facc15',
        roughness: 0.35,
      });
      const shoeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.7 });

      // Shirt Torso
      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.56, 0.28), jerseyMat);
      chest.position.y = 0.28;
      chest.castShadow = true;
      torso.add(chest);

      // Shorts Pelvis
      const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.29), shortsMat);
      shorts.position.y = 0.02;
      shorts.castShadow = true;
      torso.add(shorts);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 16), skinMat);
      head.position.y = 0.76;
      head.castShadow = true;
      torso.add(head);

      // Hair & Team Headband
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.218, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
        new THREE.MeshStandardMaterial({ color: '#171717', roughness: 0.85 })
      );
      hair.position.y = 0.02;
      head.add(hair);

      const headband = new THREE.Mesh(new THREE.CylinderGeometry(0.216, 0.216, 0.065, 16), headbandMat);
      headband.position.y = 0.06;
      head.add(headband);

      // Arms Reaching Forward to Grip the Rope
      const armGeo = new THREE.CylinderGeometry(0.065, 0.058, 0.48, 10);
      const leftArm = new THREE.Mesh(armGeo, skinMat);
      leftArm.position.set(-0.26, 0.36, 0.18);
      leftArm.rotation.x = -Math.PI / 2.4;
      leftArm.castShadow = true;
      torso.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, skinMat);
      rightArm.position.set(0.26, 0.36, 0.18);
      rightArm.rotation.x = -Math.PI / 2.4;
      rightArm.castShadow = true;
      torso.add(rightArm);

      // Legs Bracing Against the Turf
      const legGeo = new THREE.CylinderGeometry(0.08, 0.068, 0.56, 10);
      const leftLeg = new THREE.Mesh(legGeo, skinMat);
      leftLeg.position.set(-0.13, 0.28, 0.08);
      leftLeg.rotation.x = -0.25;
      leftLeg.castShadow = true;
      root.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, skinMat);
      rightLeg.position.set(0.13, 0.28, -0.1);
      rightLeg.rotation.x = 0.22;
      rightLeg.castShadow = true;
      root.add(rightLeg);

      // Sneakers
      const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoeMat);
      leftShoe.position.set(0, -0.26, 0.04);
      leftLeg.add(leftShoe);

      const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), shoeMat);
      rightShoe.position.set(0, -0.26, 0.04);
      rightLeg.add(rightShoe);

      return {
        root,
        torso,
        head,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        baseXOffset: xOffsetFromCenter,
        baseZOffset: zOffset,
        phaseOffset: idx * 1.15,
      };
    };

    // Spawn 3 Team Blue pullers on the left side of the rope
    [-1.9, -3.15, -4.4].forEach((xOff, idx) => {
      const zOff = idx % 2 === 0 ? 0.18 : -0.18;
      studentRigs.blue.push(createStudentPuller('blue', idx, xOff, zOff));
    });

    // Spawn 3 Team Orange pullers on the right side of the rope
    [1.9, 3.15, 4.4].forEach((xOff, idx) => {
      const zOff = idx % 2 === 0 ? -0.18 : 0.18;
      studentRigs.orange.push(createStudentPuller('orange', idx, xOff, zOff));
    });

    // ==================== CELEBRATION CONFETTI PARTICLES ====================
    const confettiCount = 70;
    const confettiGeo = new THREE.BufferGeometry();
    const confettiPositions = new Float32Array(confettiCount * 3);
    const confettiColors = new Float32Array(confettiCount * 3);
    const palette = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#facc15'),
      new THREE.Color('#fb923c'),
      new THREE.Color('#4ade80'),
      new THREE.Color('#f43f5e'),
    ];
    for (let i = 0; i < confettiCount; i++) {
      confettiPositions[i * 3] = (Math.random() - 0.5) * 10;
      confettiPositions[i * 3 + 1] = 1.5 + Math.random() * 5;
      confettiPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      const col = palette[i % palette.length];
      confettiColors[i * 3] = col.r;
      confettiColors[i * 3 + 1] = col.g;
      confettiColors[i * 3 + 2] = col.b;
    }
    confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3));
    confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));
    const confettiMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0,
    });
    const confettiSystem = new THREE.Points(confettiGeo, confettiMat);
    scene.add(confettiSystem);

    // ==================== ANIMATION LOOP ====================
    const clock = new THREE.Clock();
    let currentWorldRopeX = 0;
    let rafId = 0;
    const _desiredCamPos = new THREE.Vector3();
    const _desiredTarget = new THREE.Vector3();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Convert logical ropeSteps (-winSteps .. +winSteps) to 3D world X (-BOUNDARY_X .. +BOUNDARY_X)
      const clampedRatio = Math.max(-1, Math.min(1, st.ropeSteps / Math.max(1, st.winSteps)));
      const targetWorldRopeX = clampedRatio * BOUNDARY_X;
      currentWorldRopeX = THREE.MathUtils.lerp(currentWorldRopeX, targetWorldRopeX, Math.min(1, dt * 6.5));
      ropeGroup.position.x = currentWorldRopeX;

      // Subtle rope tension vibration during active pull
      if (st.pullAnimTimer > 0) {
        st.pullAnimTimer = Math.max(0, st.pullAnimTimer - dt);
        ropeMesh.position.y = 0.92 + Math.sin(elapsed * 38) * 0.025 * st.pullAnimTimer;
      } else {
        ropeMesh.position.y = 0.92 + Math.sin(elapsed * 4) * 0.008;
      }

      // Swing center pennant slightly
      pennantMesh.rotation.z = Math.sin(elapsed * 5) * 0.12;
      groundMarkerRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.08);

      // Animate Team Blue & Team Orange Student Pullers
      const animateTeam = (rigs: StudentRig[], team: 'blue' | 'orange') => {
        const isWinner = st.winnerTeam === team;
        const isLoser = st.winnerTeam !== null && st.winnerTeam !== team;
        const isPullingNow = st.pullAnimTimer > 0 && st.pullAnimTeam === team;

        rigs.forEach((rig) => {
          if (isWinner) {
            // Victory jump & cheering arms
            const jump = Math.abs(Math.sin(elapsed * 7 + rig.phaseOffset)) * 0.42;
            rig.root.position.y = jump;
            rig.torso.rotation.x = 0.05 * Math.sin(elapsed * 6);
            rig.leftArm.rotation.x = -Math.PI + Math.sin(elapsed * 10 + rig.phaseOffset) * 0.35;
            rig.rightArm.rotation.x = -Math.PI - Math.sin(elapsed * 10 + rig.phaseOffset) * 0.35;
          } else if (isLoser) {
            // Friendly tired slump
            rig.root.position.y = 0;
            rig.torso.rotation.x = 0.25;
            rig.leftArm.rotation.x = -0.6;
            rig.rightArm.rotation.x = -0.6;
          } else {
            // Active Tug-of-War Bracing & Heaving
            rig.root.position.y = 0;
            const heaveCycle = Math.sin(elapsed * 4.2 + rig.phaseOffset);
            const powerPullBoost = isPullingNow ? -0.34 * Math.sin(st.pullAnimTimer * Math.PI) : 0;
            // Negative rotation.x leans the student backward (away from center) to heave the rope!
            rig.torso.rotation.x = -0.24 + heaveCycle * 0.09 + powerPullBoost;
            rig.leftArm.rotation.x = -Math.PI / 2.3 - heaveCycle * 0.08;
            rig.rightArm.rotation.x = -Math.PI / 2.3 - heaveCycle * 0.08;
            rig.leftLeg.rotation.x = -0.25 + heaveCycle * 0.06;
            rig.rightLeg.rotation.x = 0.22 - heaveCycle * 0.06;
          }
        });
      };

      animateTeam(studentRigs.blue, 'blue');
      animateTeam(studentRigs.orange, 'orange');

      // Confetti burst on Victory
      if (st.winnerTeam) {
        confettiMat.opacity = 0.95;
        const posAttr = confettiGeo.getAttribute('position') as THREE.BufferAttribute;
        const winCenterX = st.winnerTeam === 'blue' ? -BOUNDARY_X - 1.5 : BOUNDARY_X + 1.5;
        for (let i = 0; i < confettiCount; i++) {
          let y = posAttr.getY(i) - dt * (1.4 + (i % 3) * 0.4);
          if (y < 0.2) {
            y = 4.8 + Math.random() * 1.5;
            posAttr.setX(i, winCenterX + (Math.random() - 0.5) * 6.5);
          }
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      } else {
        confettiMat.opacity = 0;
      }

      // Apply on-screen 360° camera rotation button delta (↺ Left / ↻ Right)
      if (Math.abs(pendingRotateDeltaRef.current) > 0.001) {
        const stepAngle = pendingRotateDeltaRef.current * Math.min(1, dt * 12);
        pendingRotateDeltaRef.current -= stepAngle;
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), stepAngle);
        camera.position.copy(controls.target).add(offset);
      }

      // Smooth Camera Preset Transition (only while transitioning, so user can freely drag 360° anytime!)
      if (presetTransitionTimerRef.current > 0) {
        presetTransitionTimerRef.current = Math.max(0, presetTransitionTimerRef.current - dt);
        if (st.cameraPreset === 'overhead') {
          _desiredCamPos.set(currentWorldRopeX * 0.4, 13.5, 4.2);
          _desiredTarget.set(currentWorldRopeX * 0.4, 0.5, 0);
        } else if (st.cameraPreset === 'close') {
          const focusX =
            st.activeTurn === 'blue' ? currentWorldRopeX - 2.2 : currentWorldRopeX + 2.2;
          _desiredCamPos.set(focusX, 3.4, 7.2);
          _desiredTarget.set(currentWorldRopeX, 1.0, 0);
        } else {
          _desiredCamPos.set(0, 5.8, 12.2);
          _desiredTarget.set(0, 1.1, 0);
        }
        camera.position.lerp(_desiredCamPos, Math.min(1, dt * 6));
        controls.target.lerp(_desiredTarget, Math.min(1, dt * 6));
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      renderer.dispose();
    };
  }, [forceLite2D]);

  // Lightweight 2D SVG Fallback for devices without WebGL or when Lite 2D Mode is active
  if (webglFailed || forceLite2D) {
    const pct = Math.max(-1, Math.min(1, ropeSteps / Math.max(1, winSteps)));
    const centerFlagX = 400 + pct * 230;

    return (
      <div className="w-full h-full bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-600 flex flex-col justify-between p-3 select-none overflow-hidden relative">
        <svg viewBox="0 0 800 320" className="w-full h-full rounded-2xl shadow-inner">
          {/* Sky & Turf */}
          <rect x="0" y="0" width="800" height="175" fill="#7dd3fc" />
          <rect x="0" y="175" width="800" height="145" fill="#16a34a" />
          {/* Win Lines & Center Line */}
          <line x1="170" y1="175" x2="140" y2="320" stroke="#38bdf8" strokeWidth="6" strokeDasharray="8 6" />
          <line x1="400" y1="175" x2="400" y2="320" stroke="#ffffff" strokeWidth="4" strokeDasharray="6 6" />
          <line x1="630" y1="175" x2="660" y2="320" stroke="#fb923c" strokeWidth="6" strokeDasharray="8 6" />

          {/* Team Blue Students */}
          {[0, 1, 2].map((i) => {
            const x = centerFlagX - 95 - i * 52;
            return (
              <g key={`b-${i}`} transform={`translate(${x}, 148)`}>
                <circle cx="0" cy="0" r="14" fill="#6f4e37" />
                <rect x="-12" y="14" width="24" height="36" rx="6" fill="#2563eb" />
                <line x1="-8" y1="50" x2="-14" y2="78" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
                <line x1="8" y1="50" x2="14" y2="78" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
              </g>
            );
          })}

          {/* Team Orange Students */}
          {[0, 1, 2].map((i) => {
            const x = centerFlagX + 95 + i * 52;
            return (
              <g key={`o-${i}`} transform={`translate(${x}, 148)`}>
                <circle cx="0" cy="0" r="14" fill="#8d5524" />
                <rect x="-12" y="14" width="24" height="36" rx="6" fill="#ea580c" />
                <line x1="-8" y1="50" x2="-14" y2="78" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
                <line x1="8" y1="50" x2="14" y2="78" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
              </g>
            );
          })}

          {/* Braided Rope */}
          <line
            x1={centerFlagX - 240}
            y1="172"
            x2={centerFlagX + 240}
            y2="172"
            stroke="#d97706"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Center Pennant Marker */}
          <polygon
            points={`${centerFlagX - 14},172 ${centerFlagX + 14},172 ${centerFlagX},212`}
            fill="#ef4444"
            stroke="#facc15"
            strokeWidth="3"
          />
          <circle cx={centerFlagX} cy="172" r="8" fill="#facc15" />

          {/* Labels */}
          <text x="155" y="162" textAnchor="middle" fill="#1e3a8a" fontSize="13" fontWeight="900">
            {teamBlueName} WIN LINE
          </text>
          <text x="645" y="162" textAnchor="middle" fill="#7c2d12" fontSize="13" fontWeight="900">
            {teamOrangeName} WIN LINE
          </text>
        </svg>
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-full relative overflow-hidden select-none" />;
};
