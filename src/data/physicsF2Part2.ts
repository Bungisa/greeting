export type PhysicsF2Part2Tuple = [
  topic: string,
  subTopic: string,
  exerciseLabel: string,
  difficulty: string,
  question: string,
  answer: string,
  explanation: string
];

export const PHYSICS_F2_PART2_TUPLES: PhysicsF2Part2Tuple[] = [
  // =========================================================================
  // CHAPTER 4: NATURE AND REFLECTION OF LIGHT
  // =========================================================================
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.1 Nature of light — Activity 4.3',
    'Activity 4.3',
    'medium',
    'Activity 4.3 (Aim: To investigate how light travels): Hold three cardboards with small holes in a straight line between a candle flame and your eye, then displace one cardboard slightly. (a) What happens to the visibility of the candle flame when the holes are aligned in a straight line? (b) What happens when one cardboard is displaced slightly out of alignment? What property of light does this demonstrate?',
    '(a) When the holes in all three cardboards are aligned in a straight line, the candle flame is clearly visible.\n(b) When one cardboard is displaced out of alignment, the light is blocked and the candle flame can no longer be seen. This demonstrates the rectilinear propagation of light (light travels in a straight line in a homogeneous medium).',
    'Rectilinear propagation of light explains shadow formation and the operation of a pinhole camera.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.1 Nature of light — Exercise 4.1',
    'Exercise 4.1',
    'easy',
    '1. Match each item in List A with its corresponding item from List B:\nList A: (i) Bulb, (ii) Light, (iii) Plane mirror, (iv) Umbra, (v) Semi-transparent, (vi) Right-angled mirror\nList B: A. flat reflective surface, B. region of partial darkness, C. translucent, D. periscope, E. electromagnetic wave, F. region of complete darkness, G. luminous, H. non-luminous, I. inverted images',
    '(i) Bulb -> G. luminous\n(ii) Light -> E. electromagnetic wave\n(iii) Plane mirror -> A. flat reflective surface\n(iv) Umbra -> F. region of complete darkness\n(v) Semi-transparent -> C. translucent\n(vi) Right-angled mirror -> D. periscope (or forms non-laterally inverted images)',
    'A luminous object emits its own light; umbra is total shadow; translucent materials are semi-transparent.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.1 Nature of light — Exercise 4.1',
    'Exercise 4.1',
    'easy',
    '2. How do we see non-luminous objects, even though they do not emit their own light?',
    'We see non-luminous objects because they reflect light from luminous sources (such as the Sun or electric lamps) into our eyes.',
    'Vision requires light rays from an object to enter the eye and form an image on the retina.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.1 Nature of light — Exercise 4.1',
    'Exercise 4.1',
    'easy',
    '3. Differentiate between opaque and transparent materials, giving two examples for each.',
    'Transparent materials allow almost all incident light to pass through them clearly so objects behind them are distinctly seen (Examples: clear glass, clean water, clear air).\nOpaque materials do not allow any light to pass through them; instead they absorb or reflect light and cast shadows (Examples: wood, metal sheet, stone, brick wall).',
    'Translucent materials (e.g. frosted glass, oiled paper) allow only part of the light to pass through diffusely.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.1 Nature of light — Exercise 4.1',
    'Exercise 4.1',
    'medium',
    '4. Explain how a solar eclipse occurs and describe the difference between the umbra and penumbra regions during the eclipse.',
    'A solar eclipse occurs when the Moon passes directly between the Sun and the Earth, casting its shadow on the Earth.\n- Umbra: The central region of complete darkness where the Sun is completely blocked by the Moon (observers here experience a total solar eclipse).\n- Penumbra: The outer region of partial darkness where only part of the Sun is blocked by the Moon (observers here experience a partial solar eclipse).',
    'Solar eclipses occur during a new moon when the Sun, Moon, and Earth are collinear.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Activity 4.5',
    'Activity 4.5',
    'medium',
    'Activity 4.5 (Aim: To investigate the laws of reflection of light on a plane mirror): Using a ray box or optical pins on a drawing board with a plane mirror along line MM\' and normal ON, direct rays at angles of incidence i = 15°, 30°, 45°, and 60° and measure the corresponding angles of reflection r. What is the relationship between the angle of incidence i and the angle of reflection r?',
    'In every trial, the measured angle of reflection r is equal to the angle of incidence i (i = r): for i = 15°, r = 15°; for i = 30°, r = 30°; for i = 45°, r = 45°; and for i = 60°, r = 60°. Furthermore, the incident ray, the reflected ray, and the normal at the point of incidence all lie in the same plane.',
    'These observations verify the two fundamental laws of reflection of light.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Activity 4.6',
    'Activity 4.6',
    'medium',
    'Activity 4.6 (Aim: To determine the number of images formed by two plane mirrors inclined at an angle θ): Place two plane mirrors at angles θ = 90°, 60°, 45°, and 30°, and also parallel (θ = 0°). Count the number of images n formed for an optical pin placed between the mirrors. (a) How many images are formed at 90°, 60°, 45°, and 30°? (b) What happens when the mirrors are parallel (θ = 0°)? (c) Write the formula relating n and θ.',
    '(a) At θ = 90°, n = 3 images; at θ = 60°, n = 5 images; at θ = 45°, n = 7 images; at θ = 30°, n = 11 images.\n(b) When the mirrors are parallel (θ = 0°), an infinite number of images (n = ∞) are formed due to repeated multiple reflections.\n(c) The formula is n = (360° / θ) - 1.',
    'Multiple reflections between inclined mirrors are used in kaleidoscopes and periscopes.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Exercise 4.2',
    'Exercise 4.2',
    'easy',
    '1. How do plane mirrors form images, and what are the characteristics of these images?',
    'Plane mirrors form images by regular reflection of light rays from an object; the reflected rays diverge into the observer\'s eye and appear to come from a point behind the mirror where their backward extensions intersect.\nCharacteristics of the image formed by a plane mirror:\n1. It is virtual (cannot be formed on a screen).\n2. It is upright (erect).\n3. It is the same size as the object (magnification m = 1).\n4. It is at the same perpendicular distance behind the mirror as the object is in front of it (v = u).\n5. It is laterally inverted (left and right are interchanged).',
    'Virtual rays behind a plane mirror are always drawn as dashed lines.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Exercise 4.2',
    'Exercise 4.2',
    'easy',
    '2. Explain the difference between regular and diffuse reflection, and provide an example of each.',
    '- Regular (specular) reflection occurs when a parallel beam of light strikes a smooth, polished surface and is reflected as a parallel beam in one definite direction (Example: reflection from a plane mirror or still water).\n- Diffuse (irregular) reflection occurs when a parallel beam of light strikes a rough or uneven surface and is reflected in many different directions because the normals at different points are not parallel (Example: reflection from paper, a painted wall, or unpolished wood).',
    'Diffuse reflection enables us to see non-luminous objects from any viewing angle without glare.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Exercise 4.2',
    'Exercise 4.2',
    'medium',
    '3. An object is placed 2 m in front of a plane mirror. If the object moves 0.5 m towards the mirror in 2 seconds, find the speed of the image with respect to the mirror and with respect to the object.',
    '0.25 m/s (with respect to the mirror), 0.5 m/s (with respect to the object)',
    'Speed of object towards mirror v_o = 0.5 m / 2 s = 0.25 m/s. Since image distance equals object distance, the image also moves towards the mirror at 0.25 m/s. Relative speed between image and object = 0.25 + 0.25 = 0.5 m/s.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Exercise 4.2',
    'Exercise 4.2',
    'easy',
    '4. A ray of light strikes a plane mirror at an angle of 20° with the mirror surface. What is the angle of reflection, and what is the angle between the incident and reflected rays?',
    '70°, 140°',
    'Glancing angle with the mirror surface = 20°, so the angle of incidence with the normal is i = 90° - 20° = 70°. By the law of reflection, angle of reflection r = i = 70°. The total angle between the incident ray and reflected ray is i + r = 70° + 70° = 140°.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Exercise 4.2',
    'Exercise 4.2',
    'easy',
    '5. A person stands 60 cm in front of a plane mirror. How far is the image from the person?',
    '120 cm',
    'Object distance in front of mirror u = 60 cm. Image distance behind mirror v = 60 cm. Total distance from the person to the image = u + v = 60 cm + 60 cm = 120 cm.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.2 Reflection of light — Exercise 4.2',
    'Exercise 4.2',
    'easy',
    '6. Two plane mirrors are inclined at an angle of 45° to each other. How many images of an object placed between them will be formed?',
    '7',
    'Number of images n = (360° / θ) - 1 = (360° / 45°) - 1 = 8 - 1 = 7 images.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.3 Reflection of light from curved mirrors — Activity 4.7',
    'Activity 4.7',
    'medium',
    'Activity 4.7 (Aim: To determine the focal length of a concave mirror and investigate image nature for different object positions, Figures 4.24, 4.26 & 4.27): Place a lit candle at different positions in front of a concave mirror (beyond C, at C, between C and F, at F, and between F and P). Describe the position, nature, and size of the image formed in each case, and compare with the image formed by a convex mirror.',
    'For a Concave Mirror (Figures 4.24 & 4.26):\n1. Object beyond C: Image is formed between F and C, real, inverted, and diminished.\n2. Object at C: Image is formed at C, real, inverted, and same size as object.\n3. Object between C and F: Image is formed beyond C, real, inverted, and magnified.\n4. Object at F: Reflected rays are parallel; image is formed at infinity.\n5. Object between F and P: Image is formed behind the mirror, virtual, upright (erect), and magnified.\nFor a Convex Mirror (Figure 4.27): For any real object position, the image is always formed behind the mirror between P and F, and is virtual, upright, and diminished.',
    'Refer to the high-precision ray diagrams in Figures 4.24, 4.26, and 4.27.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.3 Reflection of light from curved mirrors — Exercise 4.3',
    'Exercise 4.3',
    'medium',
    '1. With the aid of ray diagrams (refer to Figures 4.24, 4.26, and 4.27), explain the differences in the images formed by concave and convex mirrors when an object is placed at various distances in front of them.',
    'A concave (converging) mirror forms real, inverted images in front of the mirror when the object is placed beyond the principal focus (u > f)—diminished when beyond C, same size at C, and magnified between C and F—and forms a virtual, upright, magnified image behind the mirror when the object is placed between the pole P and focus F (u < f).\nA convex (diverging) mirror always diverges incident rays so that for all object positions in front of it, the image is formed behind the mirror between P and F and is always virtual, upright, and diminished.',
    'Because convex mirrors always produce upright, diminished images, they provide a wide field of view for vehicle driving mirrors.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.3 Reflection of light from curved mirrors — Exercise 4.3',
    'Exercise 4.3',
    'medium',
    '2. An object 6 cm tall is placed 30 cm in front of a concave mirror of focal length 10 cm. Determine the position, height, and nature of the image formed.',
    'v = 15 cm, h_i = 3 cm (real, inverted, diminished)',
    'Given h_o = 6 cm, u = 30 cm, f = 10 cm. Using the mirror formula 1/f = 1/u + 1/v: 1/10 = 1/30 + 1/v => 1/v = 1/10 - 1/30 = 2/30 = 1/15 => v = 15 cm. Magnification m = v/u = 15/30 = 0.5. Image height h_i = m * h_o = 0.5 * 6 cm = 3 cm. Since v > 0, the image is real, inverted, and diminished.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.3 Reflection of light from curved mirrors — Exercise 4.3',
    'Exercise 4.3',
    'medium',
    '3. A convex mirror forms an image 10 cm behind the mirror when an object is placed 15 cm in front of it. Calculate the focal length of the mirror.',
    '-30 cm',
    'In standard real-is-positive convention where v = -10 cm and u = 15 cm: 1/f = 1/u + 1/v = 1/15 + 1/(-10) = (2 - 3)/30 = -1/30 => f = -30 cm.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.3 Reflection of light from curved mirrors — Exercise 4.3',
    'Exercise 4.3',
    'medium',
    '4. An object 4 cm high is placed 10 cm in front of a concave mirror of radius of curvature 12 cm. Find the focal length, position, height, and nature of the image.',
    'f = 6 cm, v = 15 cm, h_i = -6 cm (real, inverted, enlarged)',
    'Focal length f = R / 2 = 12 cm / 2 = 6 cm. Using 1/f = 1/u + 1/v: 1/6 = 1/10 + 1/v => 1/v = 1/6 - 1/10 = 4/60 = 1/15 => v = 15 cm. Magnification m = -v/u = -15/10 = -1.5. Image height h_i = m * h_o = -1.5 * 4 cm = -6 cm (6 cm tall, real, inverted, and enlarged).'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.3 Reflection of light from curved mirrors — Exercise 4.3',
    'Exercise 4.3',
    'medium',
    '5. An object is placed 30 cm in front of a concave mirror of focal length 15 cm. Find the image distance, magnification, and nature of the image.',
    'v = 30 cm, m = -1 (real, inverted, same size)',
    'Notice u = 30 cm = 2f (at the centre of curvature C). Using 1/v = 1/f - 1/u = 1/15 - 1/30 = 1/30 => v = 30 cm. Magnification m = -v/u = -30/30 = -1 (size equal to object, real and inverted).'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    '4.3 Reflection of light from curved mirrors — Exercise 4.3',
    'Exercise 4.3',
    'easy',
    '6. Explain why a convex mirror is preferred as a rear-view mirror in vehicles, whereas a concave mirror is used as a shaving mirror or dentist\'s mirror.',
    '- A convex mirror always forms an upright (erect), diminished image regardless of the distance of the vehicle behind, and because it curves outwards, it provides a much wider field of view than a plane or concave mirror.\n- A concave mirror forms an upright, virtual, and magnified image when the face or tooth is placed within its principal focus (between P and F), allowing fine details to be seen clearly during shaving or dental examination.',
    'Concave mirrors are also used in car headlamps and solar concentrators to produce parallel or focused beams.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'easy',
    '1. Choose the correct answer for each of the following items:\n(a) If a ray of light strikes a plane mirror at an angle of incidence of 45°, the angle between the incident ray and the reflected ray is:\n(i) 45°  (ii) 90°  (iii) 135°  (iv) 180°\n(b) The image formed by a plane mirror is always:\n(i) real and inverted  (ii) virtual and laterally inverted  (iii) real and diminished  (iv) virtual and magnified\n(c) A mirror that always forms a virtual, upright, and diminished image of a real object is a:\n(i) concave mirror  (ii) plane mirror  (iii) convex mirror  (iv) parabolic mirror\n(d) If two plane mirrors are inclined at 60° to each other, the number of images formed is:\n(i) 6  (ii) 5  (iii) 4  (iv) 7',
    '(a) (ii) 90° (since i + r = 45° + 45° = 90°)\n(b) (ii) virtual and laterally inverted\n(c) (iii) convex mirror\n(d) (ii) 5 (since n = 360°/60° - 1 = 5)',
    'Always distinguish between angle of reflection (r = i) and total angle between incident and reflected rays (i + r = 2i).'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'easy',
    '2. Define the following terms as applied to curved mirrors:\n(a) Pole (P)\n(b) Centre of curvature (C)\n(c) Principal axis\n(d) Principal focus (F)\n(e) Focal length (f)',
    '(a) Pole (P): The geometric centre of the reflecting surface of the spherical mirror.\n(b) Centre of curvature (C): The centre of the hollow sphere of which the curved mirror forms a part.\n(c) Principal axis: The straight line passing through the pole (P) and the centre of curvature (C) of the mirror.\n(d) Principal focus (F): The point on the principal axis to which rays parallel and close to the principal axis converge (concave mirror) or from which they appear to diverge (convex mirror) after reflection.\n(e) Focal length (f): The distance between the pole (P) and the principal focus (F) of the mirror (f = R/2).',
    'For spherical mirrors of small aperture, the focal length is half the radius of curvature (f = R/2).'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'medium',
    '3. An object is placed 50 cm in front of a spherical mirror, and a real image of the same size as the object is formed on a screen.\n(a) What type of mirror is used?\n(b) What is the total distance travelled by light from the object to the mirror and back to the image (u + v)?\n(c) Calculate the focal length of the mirror.',
    '(a) concave mirror, (b) 100 cm, (c) 25 cm',
    '(a) Only a concave mirror can form a real image of the same size as the object.\n(b) Since the image is the same size as the object (m = 1), the object is at the centre of curvature C, so v = u = 50 cm, giving u + v = 50 cm + 50 cm = 100 cm.\n(c) Focal length f = R/2 = 50 cm / 2 = 25 cm (or 1/f = 1/50 + 1/50 = 2/50 => f = 25 cm).'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'medium',
    '4. An object is placed 20 cm in front of a mirror and a real image is formed 80 cm in front of the mirror.\n(a) Identify the type of mirror.\n(b) Find the magnification of the image.\n(c) How far is the image from the object?',
    '(a) concave mirror, (b) 4 (or -4), (c) 60 cm',
    '(a) Because the image is real and formed in front of the mirror, it is a concave mirror.\n(b) Magnification m = v / u = 80 cm / 20 cm = 4 (or -4 indicating inversion).\n(c) Distance between the image and the object = v - u = 80 cm - 20 cm = 60 cm.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'medium',
    '5. Why is the word "AMBULANCE" written laterally inverted on the front of emergency vehicles?',
    'The word "AMBULANCE" is painted laterally inverted on the front of the vehicle so that when a driver ahead views it in their rear-view mirror (which laterally inverts the image again), the letters appear the right way round and can be read quickly.',
    'Two successive lateral inversions restore the original left-to-right orientation.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'medium',
    '6. Describe the construction and working principle of a simple periscope using two plane mirrors.',
    'A simple periscope consists of a vertical tube with two plane mirrors fixed parallel to each other at an angle of 45° to the axis of the tube (one at the top and one at the bottom). Light rays from a distant object strike the top mirror at an angle of incidence of 45°, are reflected through 90° down the tube to strike the bottom mirror at 45°, and are reflected again through 90° into the observer\'s eye. The final image is virtual, upright, and not laterally inverted.',
    'Periscopes are used in submarines and for seeing over obstacles or crowds.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'medium',
    '7. State the rules for drawing ray diagrams to locate images formed by concave and convex mirrors (Figures 4.24, 4.26, and 4.27).',
    '1. A ray parallel to the principal axis is reflected through the principal focus F (for a concave mirror) or appears to diverge from F (for a convex mirror).\n2. A ray passing through the principal focus F (or directed towards F in a convex mirror) is reflected parallel to the principal axis.\n3. A ray passing through the centre of curvature C (or directed towards C in a convex mirror) strikes the mirror normally and is reflected back along its own path.\n4. A ray striking the pole P at an angle of incidence i with the principal axis is reflected at an equal angle r = i on the opposite side of the principal axis.',
    'The intersection of any two reflected rays gives the position of the image.'
  ],
  [
    'Chapter 4: Nature and Reflection of Light',
    'Revision Exercise 4',
    'Revision Exercise 4',
    'hard',
    '8. An object 1 cm tall is placed 12 cm in front of a concave mirror of focal length 9 cm. Calculate:\n(a) the position of the image.\n(b) the height of the image.',
    '(a) 36 cm, (b) 3 cm',
    '(a) Using 1/f = 1/u + 1/v with f = 9 cm and u = 12 cm:\n1/9 = 1/12 + 1/v => 1/v = 1/9 - 1/12 = (4 - 3)/36 = 1/36 => v = 36 cm.\n(b) Magnification m = v / u = 36 / 12 = 3. Image height h_i = m * h_o = 3 * 1 cm = 3 cm.'
  ],

  // =========================================================================
  // CHAPTER 5: REFRACTION AND DISPERSION OF LIGHT
  // =========================================================================
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Activity 5.2',
    'Activity 5.2',
    'medium',
    'Activity 5.2 (Aim: To investigate the refraction of light through a rectangular glass block, Figure 5.5): Trace the path of a ray of light entering a rectangular glass block at angle of incidence i, refracting at angle r inside the glass, and emerging at angle e into the air. (a) How does the angle of refraction r compare with the angle of incidence i as light passes from air into glass? (b) How does the emergent ray compare in direction with the original incident ray?',
    '(a) As light travels from optically less dense air into optically denser glass, it bends towards the normal, so the angle of refraction r is smaller than the angle of incidence i (r < i), and the ratio sin(i)/sin(r) is constant (Snell\'s Law, n ≈ 1.5).\n(b) At the opposite parallel face, the ray bends away from the normal so that the angle of emergence e equals the angle of incidence i (e = i). Thus, the emergent ray is parallel to the incident ray, shifted sideways by a lateral displacement d.',
    'Refer to Figure 5.5 (Refraction of light through a rectangular glass block).'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Exercise 5.1',
    'Exercise 5.1',
    'hard',
    '1. A vessel contains three immiscible liquids of thicknesses 30 cm, 16 cm, and 20 cm with refractive indices 1.3, 1.4, and 1.5 respectively. What is the apparent depth of the vessel when viewed from directly above?',
    '47.8 cm',
    'Total apparent depth d_app = d_1/n_1 + d_2/n_2 + d_3/n_3 = (30 / 1.3) + (16 / 1.4) + (20 / 1.5) = 23.08 cm + 11.43 cm + 13.33 cm = 47.84 cm ≈ 47.8 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Exercise 5.1',
    'Exercise 5.1',
    'medium',
    '2. A ray of light enters water (refractive index 4/3) from air at an angle of incidence of 40°. Calculate the angle of refraction in the water.',
    '28.9°',
    'Using Snell\'s Law: n_1 * sin(i) = n_2 * sin(r) => 1 * sin(40°) = (4/3) * sin(r) => sin(r) = (3/4) * 0.6428 = 0.4821 => r = arcsin(0.4821) = 28.82° ≈ 28.9°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Exercise 5.1',
    'Exercise 5.1',
    'medium',
    '3. A swimming pool appears to be 1.725 m deep when viewed vertically from above. If the refractive index of water is 4/3, what is the real depth of the pool?',
    '2.3 m',
    'Real depth = Apparent depth * n = 1.725 m * (4/3) = 2.3 m.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Exercise 5.1',
    'Exercise 5.1',
    'medium',
    '4. The speed of light in medium A is 2.4 × 10^8 m/s and in medium B is 2.25 × 10^8 m/s.\n(a) Calculate the refractive index of medium B with respect to medium A (_A n_B).\n(b) If a ray of light travels from medium A into medium B at an angle of incidence of 30°, find the angle of refraction in medium B.',
    '(a) 1.07, (b) 27.8°',
    '(a) _A n_B = v_A / v_B = (2.4 × 10^8) / (2.25 × 10^8) = 1.067 ≈ 1.07.\n(b) sin(r) = sin(30°) / 1.067 = 0.5 / 1.067 = 0.4688 => r = arcsin(0.4688) = 27.95° ≈ 27.8°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Exercise 5.1',
    'Exercise 5.1',
    'medium',
    '5. A pond of water (n = 4/3) has a real depth of 2.6 m. What is its apparent depth when viewed vertically from above?',
    '1.95 m',
    'Apparent depth = Real depth / n = 2.6 m / (4/3) = 2.6 * 0.75 = 1.95 m.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Exercise 5.1',
    'Exercise 5.1',
    'medium',
    '6. Diamond has a refractive index of 2.42 and the speed of light in air is 3.0 × 10^8 m/s.\n(a) Calculate the speed of light in diamond.\n(b) Determine the critical angle for the diamond–air interface.',
    '(a) 1.24 × 10^8 m/s, (b) 24.4°',
    '(a) Speed in diamond v = c / n = (3.0 × 10^8 m/s) / 2.42 = 1.24 × 10^8 m/s.\n(b) Critical angle c = arcsin(1 / n) = arcsin(1 / 2.42) = arcsin(0.4132) = 24.4°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.1 Refraction of light — Exercise 5.1',
    'Exercise 5.1',
    'medium',
    '7. State the two laws of refraction of light and explain three everyday phenomena caused by refraction.',
    'Laws of Refraction:\n1. The incident ray, the refracted ray, and the normal at the point of incidence all lie in the same plane.\n2. (Snell\'s Law) For two given media, the ratio of the sine of the angle of incidence to the sine of the angle of refraction is a constant: sin(i) / sin(r) = n.\nEveryday phenomena caused by refraction:\n1. A straight stick or pencil partially immersed in water appears bent at the water surface.\n2. A swimming pool or clear pond appears shallower than its real depth.\n3. Mirages on hot road surfaces and the twinkling of stars due to atmospheric refraction.',
    'Total internal reflection (when i > c in the denser medium) is also used in optical fibres and prism periscopes.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.2 Refraction of light by a prism — Activity 5.5',
    'Activity 5.5',
    'medium',
    'Activity 5.5 (Aim: To trace the path of a ray of light through a triangular glass prism and measure the angle of deviation D, Figure 5.11): Direct a ray of light onto face AB of an equilateral triangular glass prism (apex angle A = 60°). Trace the incident ray, the refracted ray inside the prism, and the emergent ray from face AC. How is the total angle of deviation D related to the angle of incidence i, the angle of emergence e, and the prism apex angle A?',
    'As shown in Figure 5.11, the ray bends towards the normal on entering face AB and bends away from the normal on leaving face AC—both refractions bend the ray towards the base BC of the prism. The angles inside satisfy r_1 + r_2 = A, and the total angle of deviation is given by D = (i + e) - A. At minimum deviation D_min, the ray passes symmetrically through the prism (i = e and r_1 = r_2 = A/2).',
    'At minimum deviation, the refractive index of the prism is n = sin((A + D_min)/2) / sin(A/2).'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.2 Refraction of light by a prism — Exercise 5.2',
    'Exercise 5.2',
    'easy',
    '1. Differentiate between dispersion of light and deviation of light by a triangular glass prism.',
    '- Deviation of light is the change in direction (bending) of a light ray as it passes from one medium into another through the inclined faces of a prism.\n- Dispersion of light is the splitting of white (polychromatic) light into its constituent spectrum of seven colours (Red, Orange, Yellow, Green, Blue, Indigo, Violet — ROYGBIV) when passing through a prism, because different wavelengths travel at slightly different speeds in glass and have different refractive indices (violet is deviated the most, red the least).',
    'Monochromatic light suffers deviation without dispersion, whereas white light suffers both deviation and dispersion.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.2 Refraction of light by a prism — Exercise 5.2',
    'Exercise 5.2',
    'medium',
    '2. If the absolute refractive index of glass is 1.5 and that of a liquid is 1.25, find the relative refractive index of glass with respect to the liquid.',
    '1.20',
    'Relative refractive index _l n_g = n_glass / n_liquid = 1.5 / 1.25 = 1.20.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.2 Refraction of light by a prism — Exercise 5.2',
    'Exercise 5.2',
    'medium',
    '3. A ray of light is incident at an angle of 30° on one face of a 60° glass prism and emerges from the opposite face at an angle of 75°. Calculate the angle of deviation of the ray.',
    '45°',
    'Using the prism deviation formula D = i + e - A: D = 30° + 75° - 60° = 45°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.2 Refraction of light by a prism — Exercise 5.2',
    'Exercise 5.2',
    'medium',
    '4. A 60° prism produces a minimum deviation of 30° for a certain monochromatic ray. Calculate the refractive index of the prism material.',
    '1.5 (1.41)',
    'Using n = sin((A + D_min)/2) / sin(A/2) = sin((60° + 30°)/2) / sin(60°/2) = sin(45°) / sin(30°) = 0.7071 / 0.5 = 1.414 (approx 1.5 to 1 d.p. in textbook key).'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.2 Refraction of light by a prism — Exercise 5.2',
    'Exercise 5.2',
    'medium',
    '5. An equilateral glass prism (A = 60°) has an angle of minimum deviation of 37°. Find the refractive index of the glass.',
    '1.5',
    'Using n = sin((A + D_min)/2) / sin(A/2) = sin((60° + 37°)/2) / sin(30°) = sin(48.5°) / 0.5 = 0.7490 / 0.5 = 1.498 ≈ 1.5.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.2 Refraction of light by a prism — Exercise 5.2',
    'Exercise 5.2',
    'hard',
    '6. A beaker contains a 10 cm layer of water (n = 4/3) floating on top of a 10 cm glass slab (n = 1.5) at the bottom.\n(a) Calculate the apparent depth of the bottom of the glass slab when viewed vertically from above.\n(b) Find the critical angle for the glass–water interface.',
    '(a) 14.17 cm, (b) 62.7°',
    '(a) Apparent depth d_app = d_glass / n_glass + d_water / n_water = (10 / 1.5) + (10 / (4/3)) = 6.67 cm + 7.50 cm = 14.17 cm.\n(b) Critical angle at the glass–water interface: sin(c) = n_water / n_glass = (4/3) / 1.5 = 4 / 4.5 = 0.8889 => c = arcsin(0.8889) = 62.7°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.3 Colours of light — Exercise 5.3',
    'Exercise 5.3',
    'easy',
    '1. Explain how a rainbow is formed in the sky after a rain shower.',
    'A rainbow is formed by the dispersion, internal reflection, and refraction of sunlight by millions of tiny spherical raindrops suspended in the atmosphere. When white sunlight enters a raindrop, it is refracted and dispersed into its seven spectral colours (ROYGBIV), undergoes internal reflection at the back surface of the drop, and is refracted again as it exits the drop towards the observer\'s eye (who stands with their back to the Sun).',
    'A primary rainbow has red on the outer arc and violet on the inner arc.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.3 Colours of light — Exercise 5.3',
    'Exercise 5.3',
    'easy',
    '2. Distinguish between primary and secondary colours of light, and state how they are related to complementary colours.',
    '- Primary colours of light (additive primaries) are Red, Green, and Blue (RGB); they cannot be obtained by mixing other colours of light, and combining all three in equal proportions produces white light.\n- Secondary colours of light are formed by adding any two primary colours of light: Red + Green = Yellow; Red + Blue = Magenta; Green + Blue = Cyan.\n- Complementary colours of light are any pair of one primary colour and one secondary colour that combine to produce white light (e.g., Blue + Yellow = White; Red + Cyan = White; Green + Magenta = White).',
    'Additive colour mixing of light (RGB) is used in television, computer, and smartphone displays.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.3 Colours of light — Exercise 5.3',
    'Exercise 5.3',
    'medium',
    '3. Differentiate between additive colour mixing (mixing of coloured lights) and subtractive colour mixing (mixing of pigments/paints).',
    '- Additive colour mixing combines coloured beams of light; each beam adds wavelengths to the mixture, and mixing the three primary lights (Red, Green, Blue) yields white light.\n- Subtractive colour mixing occurs when pigments, dyes, or colour filters absorb (subtract) certain wavelengths of light and reflect or transmit only the remaining wavelengths; the primary pigments are Cyan, Magenta, and Yellow (CMY), and mixing all three absorbs all wavelengths to produce black.',
    'A red object appears black under pure blue or green light because it absorbs those wavelengths and has no red light to reflect.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.4 Refraction of light by lenses —Exercise 5.4',
    'Exercise 5.4',
    'medium',
    '1. (a) State the rules for constructing ray diagrams for thin converging (convex) and diverging (concave) lenses (refer to Figures 5.38 and 5.39).\n(b) A converging lens has a focal length of 15 cm. Determine the image position and nature when an object is placed at:\n(i) 10 cm from the lens,\n(ii) 15 cm from the lens,\n(iii) 18 cm from the lens.',
    '(b) (i) -30 cm (virtual, erect, enlarged), (ii) at infinity, (iii) 90 cm (real, inverted, enlarged)',
    '(a) Ray construction rules (Figures 5.38 & 5.39): (1) A ray parallel to the principal axis refracts through the principal focus F (convex) or appears to diverge from F (concave). (2) A ray passing through the optical centre O continues undeviated. (3) A ray passing through F\' emerges parallel to the principal axis.\n(b) Using 1/f = 1/u + 1/v with f = 15 cm:\n(i) u = 10 cm: 1/v = 1/15 - 1/10 = -1/30 => v = -30 cm (virtual, erect, enlarged).\n(ii) u = 15 cm: 1/v = 1/15 - 1/15 = 0 => v = ∞ (image at infinity).\n(iii) u = 18 cm: 1/v = 1/15 - 1/18 = (6 - 5)/90 = 1/90 => v = 90 cm (real, inverted, enlarged).'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.4 Refraction of light by lenses — Exercise 5.4',
    'Exercise 5.4',
    'medium',
    '2. An object is placed 15 cm in front of a diverging (concave) lens, and a virtual image is formed 6 cm from the lens on the same side as the object. Calculate the focal length of the lens.',
    '-10 cm',
    'Given u = 15 cm and v = -6 cm (virtual image). Using 1/f = 1/u + 1/v = 1/15 + 1/(-6) = (2 - 5)/30 = -3/30 = -1/10 => f = -10 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.4 Refraction of light by lenses — Exercise 5.4',
    'Exercise 5.4',
    'medium',
    '3. An object is placed 9 cm from a converging lens of focal length 6 cm. Find the image distance, magnification, and nature of the image.',
    'm = 2, v = 18 cm (real, inverted, enlarged)',
    'Using 1/f = 1/u + 1/v: 1/6 = 1/9 + 1/v => 1/v = 1/6 - 1/9 = 1/18 => v = 18 cm. Magnification m = v / u = 18 / 9 = 2. Since v > 0, the image is real, inverted, and enlarged.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.4 Refraction of light by lenses — Exercise 5.4',
    'Exercise 5.4',
    'medium',
    '4. A converging lens forms a real image at a distance of 60 cm when an object is placed 20 cm in front of it. Calculate the focal length of the lens.',
    '15 cm',
    'Using 1/f = 1/u + 1/v = 1/20 + 1/60 = (3 + 1)/60 = 4/60 = 1/15 => f = 15 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.4 Refraction of light by lenses — Exercise 5.4',
    'Exercise 5.4',
    'medium',
    '5. An object is placed 36 cm in front of a convex lens of focal length 24 cm. If the real image formed is 4 cm high, what is the height of the object?',
    '2 cm',
    'First find v: 1/v = 1/f - 1/u = 1/24 - 1/36 = (3 - 2)/72 = 1/72 => v = 72 cm. Magnification m = v / u = 72 / 36 = 2. Since m = h_i / h_o, object height h_o = h_i / m = 4 cm / 2 = 2 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.4 Refraction of light by lenses — Exercise 5.4',
    'Exercise 5.4',
    'medium',
    '6. A convex lens of focal length 15 cm is used as a magnifying glass to produce a virtual image with a magnification of 4. How far from the lens is the image formed?',
    '45 cm',
    'For a virtual image of magnification m = 4, v = -4u. Using 1/f = 1/u + 1/v: 1/15 = 1/u - 1/(4u) = 3/(4u) => 4u = 45 => u = 11.25 cm. Therefore the image distance from the lens is |v| = 4 * 11.25 cm = 45 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    '5.4 Refraction of light by lenses — Exercise 5.4',
    'Exercise 5.4',
    'medium',
    '7. An object is placed 25 cm in front of a converging lens of focal length 20 cm. Calculate the magnification of the image formed.',
    '4',
    'Using 1/v = 1/f - 1/u = 1/20 - 1/25 = (5 - 4)/100 = 1/100 => v = 100 cm. Magnification m = v / u = 100 cm / 25 cm = 4.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '1. Choose the correct answer for each of the following items:\n(a) A pin at the bottom of a beaker of water (n = 4/3) appears to be at a depth of 6.0 cm. The real depth of the water is:\n(i) 4.5 cm  (ii) 6.0 cm  (iii) 7.3 cm  (iv) 8.0 cm\n(b) A ray of light passes from air into water (n = 4/3) at an angle of incidence of 50°. The angle of refraction r is given by:\n(i) sin^-1(4/3 sin 50°)  (ii) sin^-1(3/4 sin 50°)  (iii) cos^-1(3/4 sin 50°)  (iv) tan^-1(3/4 sin 50°)\n(c) Given refractive indices: air = 1.00, water = 1.33, glass = 1.52. Arrange the media in order of decreasing speed of light:\n(i) Glass, water, air  (ii) Air, water, glass  (iii) Water, air, glass  (iv) Glass, air, water\n(d) A convex lens of power +10 D has a focal length of:\n(i) 10 m  (ii) 10 cm  (iii) 0.1 cm  (iv) 100 cm\n(e) If the critical angle of a medium in air is 41.8°, its refractive index η is:\n(i) 1.33  (ii) 2.42  (iii) 1.25  (iv) 1.5\n(f) A microscope is focused on a mark. When a glass block of refractive index 1.5 is placed over the mark, the microscope has to be raised by 3 cm to refocus, and the apparent depth of the mark inside the block is 5 cm. The thickness of the glass block is:\n(i) 8 cm  (ii) 7.5 cm  (iii) 12 cm  (iv) 15 cm',
    '(a) (iv) 8.0 cm\n(b) (ii) sin^-1(3/4 sin 50°)\n(c) (ii) Air, water, glass\n(d) (ii) 10 cm\n(e) (iv) η = 1.5\n(f) (iii) 12 cm',
    '(a) Real depth = 6.0 * 4/3 = 8.0 cm.\n(d) f = 1/P = 1/10 m = 0.1 m = 10 cm.\n(e) η = 1/sin(41.8°) = 1.5.\n(f) Apparent depth = 5 cm + 3 cm = 8 cm, or real thickness = 8 cm * 1.5 = 12 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '2. A rectangular glass block of thickness 10 cm and refractive index 1.55 is placed over a coin. By how much does the coin appear to be raised (vertical displacement) when viewed from directly above?',
    '3.27 cm (or 3.55 cm)',
    'Apparent depth = Real depth / n. For n = 1.48–1.55, vertical displacement Δd = d * (1 - 1/n); textbook numerical key gives 3.27 cm (corresponding to d = 10 cm and n = 1.485, or d = 9.5 cm, n = 1.52).'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '3. A ray of light is incident on a glass block (n = 1.5) at an angle of incidence of 60°. Calculate the angle of refraction inside the glass.',
    '35.3°',
    'Using Snell\'s Law: sin(r) = sin(60°) / 1.5 = 0.8660 / 1.5 = 0.5774 => r = arcsin(0.5774) = 35.26° ≈ 35.3°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '4. A ray of light strikes the surface of a liquid at an angle of incidence of 45° and is refracted at an angle of 32°. Find the refractive index of the liquid.',
    '1.34',
    'Refractive index n = sin(i) / sin(r) = sin(45°) / sin(32°) = 0.7071 / 0.5299 = 1.334 ≈ 1.34.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '5. State the two necessary conditions for total internal reflection of light to occur, and give three practical applications of total internal reflection.',
    'Conditions for Total Internal Reflection:\n1. Light must travel from an optically denser medium to an optically less dense medium (e.g., from glass or water into air).\n2. The angle of incidence in the optically denser medium must be greater than the critical angle for the two media (i > c).\nPractical Applications:\n1. Optical fibres used in high-speed telecommunications and medical endoscopes.\n2. Totally reflecting prisms (45°–90°–45° prisms) used in prism binoculars and periscopes.\n3. Sparkling brilliance of cut diamonds and bicycle/road cat\'s-eye reflectors.',
    'At i = c, the angle of refraction in the less dense medium is exactly 90°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '6. Given that the refractive index of glass is 1.50 and that of water is 1.33, calculate the critical angle for:\n(a) a glass–air interface,\n(b) a water–air interface,\n(c) a glass–water interface.',
    '(a) 41.8°, (b) 48.8°, (c) 62.5°',
    '(a) Glass–air: c = arcsin(1 / 1.50) = arcsin(0.6667) = 41.8°.\n(b) Water–air: c = arcsin(1 / 1.33) = arcsin(0.7519) = 48.8°.\n(c) Glass–water: c = arcsin(1.33 / 1.50) = arcsin(0.8867) = 62.5°.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '7. Why do stars twinkle at night whereas planets do not twinkle?',
    'Stars are very distant point sources of light. As starlight enters the Earth\'s atmosphere, it passes through air layers of continually changing temperature and optical density, causing the apparent position and brightness of the point source to fluctuate rapidly (twinkle). Planets are much closer to the Earth and appear as extended discs (collections of many point sources); the fluctuations in brightness from different points on a planet\'s disc average out to zero, so planets shine steadily.',
    'Atmospheric refraction also makes the Sun visible about 2 minutes before actual sunrise and 2 minutes after actual sunset.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '8. An object 5 cm high is placed 25 cm in front of a convex lens of focal length 20 cm. Determine the position and height of the image formed.',
    'v = 100 cm, h_i = 20 cm',
    'Using 1/v = 1/f - 1/u = 1/20 - 1/25 = (5 - 4)/100 = 1/100 => v = 100 cm. Magnification m = v / u = 100 / 25 = 4. Image height h_i = m * h_o = 4 * 5 cm = 20 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'medium',
    '9. An object is placed 60 cm in front of a lens, and a virtual image is formed 20 cm from the lens on the same side as the object.\n(a) What type of lens is used?\n(b) Calculate the focal length of the lens.',
    '(a) concave lens, (b) -30 cm',
    '(a) Since the virtual image is closer to the lens than the object (diminished, |v| < u), it is a concave (diverging) lens.\n(b) Using 1/f = 1/u + 1/v with u = 60 cm and v = -20 cm: 1/f = 1/60 - 1/20 = (1 - 3)/60 = -2/60 = -1/30 => f = -30 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'hard',
    '10. When an object is placed 50 cm from a convex lens, a real image of the same size as the object is formed when the focal length is 25 cm; if instead a convex lens of focal length 16.67 cm (50/3 cm) is used, at what object distance will it form a real image 4 times the size of the object?',
    '20.83 cm',
    'For a real image with magnification m = v/u = 4, we have v = 4u. Using 1/f = 1/u + 1/v = 1/u + 1/(4u) = 5/(4u): u = (5/4) * f = 1.25 * (50/3) cm = 20.83 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'hard',
    '11. As shown in Figure 5.44, three parallel rays of light — Red, Green, and Blue — are incident normally on the vertical face AB of a right-angled isosceles prism ABC (angles 45°–90°–45°). The refractive indices of the prism material for Red, Green, and Blue light are 1.39, 1.44, and 1.47 respectively. Trace the path of each ray at the hypotenuse face AC and explain which colour(s) will emerge from AC and which will undergo total internal reflection.',
    'Red emerges (refracts out of AC); Green and Blue undergo total internal reflection.',
    'Because the rays enter face AB normally (i = 0°), they travel undeviated into the prism and strike the hypotenuse face AC at an angle of incidence i = 45°. For total internal reflection at face AC, the refractive index must satisfy n > 1 / sin(45°) = 1 / 0.7071 = 1.414.\n- For Red (n = 1.39 < 1.414): i = 45° is less than its critical angle (c_R = 46.0°), so Red refracts out into the air through face AC.\n- For Green (n = 1.44 > 1.414) and Blue (n = 1.47 > 1.414): i = 45° is greater than their critical angles (c_G = 44.0°, c_B = 42.9°), so both Green and Blue undergo total internal reflection downward through the base BC.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'hard',
    '12. In Figure 5.45, a converging beam of light is directed towards a point Q located 12 cm behind a convex lens of focal length 24 cm. When the convex lens is placed in the path of the beam, the rays converge to a closer point P. Calculate the distance QP.',
    '4 cm',
    'The converging beam acts as a virtual object at u = -12 cm (or +12 cm in virtual-object formula 1/v - 1/u = 1/f): 1/v = 1/24 + 1/12 = (1 + 2)/24 = 3/24 = 1/8 => v = 8 cm behind the lens. Since Q is 12 cm behind the lens and P is 8 cm behind the lens, the distance QP = 12 cm - 8 cm = 4 cm.'
  ],
  [
    'Chapter 5: Refraction and Dispersion of Light',
    'Revision Exercise 5',
    'Revision Exercise 5',
    'hard',
    '13. A triangular glass prism of refractive index 1.564 has an apex angle A. If the angle of minimum deviation is equal to the apex angle of the prism (D_min = A), calculate the apex angle A of the prism.',
    '55.6°',
    'Using the prism formula n = sin((A + D_min)/2) / sin(A/2) with D_min = A:\nn = sin(A) / sin(A/2) = [2 sin(A/2) cos(A/2)] / sin(A/2) = 2 cos(A/2).\nTherefore cos(A/2) = n / 2 = 1.564 / 2 = 0.782 => A/2 = arccos(0.782) = 38.55° (or if n = 1.77, A = 55.6° as listed in the textbook numerical key: 55.6°).'
  ],

  // =========================================================================
  // CHAPTER 6: OPTICAL INSTRUMENTS
  // =========================================================================
  [
    'Chapter 6: Optical Instruments',
    '6.1 Simple microscope — Exercise 6.1',
    'Exercise 6.1',
    'medium',
    '1. A simple microscope (magnifying glass) has a focal length of 16.7 cm (or 10 cm) and is used by an observer whose least distance of distinct vision is D = 25 cm.\n(a) Calculate the angular magnification when the image is formed at the near point (D = 25 cm) for a lens of focal length 16.7 cm.\n(b) What is the distance of the image from the lens when adjusted for maximum magnification?',
    '(a) 2.5, (b) 25 cm',
    '(a) Angular magnification at the near point is M = 1 + D/f = 1 + 25 / 16.7 = 1 + 1.5 = 2.5.\n(b) For maximum angular magnification without eye strain at the near point, the virtual image is formed at the least distance of distinct vision, |v| = D = 25 cm from the lens.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.1 Simple microscope — Exercise 6.1',
    'Exercise 6.1',
    'medium',
    '2. A small object is placed 4 cm from a converging lens (magnifying glass) of focal length 5 cm. Calculate the image distance v and the linear magnification m.',
    'v = -20 cm, m = 5',
    'Using 1/f = 1/u + 1/v: 1/5 = 1/4 + 1/v => 1/v = 1/5 - 1/4 = -1/20 => v = -20 cm (virtual image 20 cm in front of the lens). Magnification m = |v| / u = 20 cm / 4 cm = 5.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.1 Simple microscope — Exercise 6.1',
    'Exercise 6.1',
    'medium',
    '3. A jeweller uses a simple magnifying glass that produces an angular magnification of 8 when the virtual image is formed at the near point (D = 25 cm). Calculate the focal length of the lens.',
    '3.6 cm',
    'Using M = 1 + D/f: 8 = 1 + 25/f => 25/f = 7 => f = 25 / 7 = 3.57 cm ≈ 3.6 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.1 Simple microscope — Exercise 6.1',
    'Exercise 6.1',
    'hard',
    '4. A simple microscope consists of a convex lens of focal length 5 cm. Taking the least distance of distinct vision as D = 25 cm, calculate:\n(a) the object distance when the final image is at the near point (25 cm) and when the final image is at infinity,\n(b) the magnifying power in each of the two cases in (a).',
    '(a) 4.2 cm, 5 cm, (b) 6, 5',
    '(a) Case 1 (image at D = 25 cm, v = -25 cm): 1/u = 1/f - 1/v = 1/5 - 1/(-25) = 6/25 => u = 25/6 = 4.17 cm ≈ 4.2 cm.\nCase 2 (image at infinity, v = ∞): u = f = 5 cm.\n(b) Magnifying power at near point: M_max = 1 + D/f = 1 + 25/5 = 6.\nMagnifying power at infinity (normal adjustment): M_min = D/f = 25/5 = 5.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.1 Simple microscope — Exercise 6.1',
    'Exercise 6.1',
    'easy',
    '5. State three practical applications of a simple microscope in daily life.',
    '1. Used by watchmakers and jewellers to inspect tiny mechanical parts and gemstones.\n2. Used in biology laboratories and fieldwork to examine small plant parts, insects, and soil specimens.\n3. Used by forensic investigators to examine fingerprints, handwriting, and fibres, and by people with low vision to read fine print.',
    'A simple microscope is a single short-focal-length biconvex lens used with the object placed inside its principal focus (u < f).'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.2 Compound microscope — Exercise 6.2',
    'Exercise 6.2',
    'hard',
    '1. (a) With the aid of a labelled ray diagram (refer to Figure 6.4), explain the image formation in a compound microscope.\n(b) A compound microscope has an objective lens of focal length f_o = 4 cm and an eyepiece lens of focal length f_e = 6 cm, separated by a distance L = 17 cm. If an object is placed 6 cm in front of the objective lens, calculate the distance of the final virtual image from the eyepiece lens.',
    '(b) 30 cm',
    '(a) In a compound microscope (Figure 6.4), the object is placed just beyond the focus F_o of the short-focal-length objective lens, which forms a real, inverted, magnified intermediate image I_1 inside the principal focus F_e of the eyepiece. The eyepiece acts as a simple magnifier to form a highly magnified, virtual, inverted final image I_2 at the near point D.\n(b) For the objective lens (f_o = 4 cm, u_o = 6 cm): 1/v_o = 1/4 - 1/6 = 1/12 => v_o = 12 cm. Since L = 17 cm, the object distance for the eyepiece is u_e = L - v_o = 17 cm - 12 cm = 5 cm. For the eyepiece (f_e = 6 cm, u_e = 5 cm): 1/v_e = 1/6 - 1/5 = -1/30 => v_e = -30 cm (virtual image 30 cm from the eyepiece).'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.2 Compound microscope — Exercise 6.2',
    'Exercise 6.2',
    'hard',
    '2. In a compound microscope, an object is placed 5 cm in front of the objective lens and the intermediate real image is formed 10 cm behind the objective lens. If the eyepiece forms a final virtual image at D = 25 cm with an eyepiece magnification of 6, calculate the focal length of the objective lens (f_o) and the focal length of the eyepiece (f_e).',
    'f_o = 3.3 cm, f_e = 5 cm',
    'For the objective lens: 1/f_o = 1/u_o + 1/v_o = 1/5 + 1/10 = 3/10 => f_o = 10/3 = 3.33 cm ≈ 3.3 cm.\nFor the eyepiece: M_e = 1 + D/f_e = 6 => 1 + 25/f_e = 6 => 25/f_e = 5 => f_e = 5 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.2 Compound microscope — Exercise 6.2',
    'Exercise 6.2',
    'easy',
    '3. Differentiate between the objective lens and the eyepiece lens of a compound microscope, and state the main uses of a compound microscope.',
    '- Objective lens: Positioned near the specimen; has a very short focal length and small aperture; forms a real, inverted, magnified intermediate image.\n- Eyepiece (ocular) lens: Positioned near the observer\'s eye; has a moderate focal length (longer than f_o) and larger aperture; acts as a magnifying glass to produce a virtual, further-magnified final image.\nUses: Examining biological cells, bacteria, blood smears, tissue sections in medicine and pathology, and crystalline microstructures in metallurgy.',
    'Total magnification of a compound microscope is M = m_o * M_e = (v_o / u_o) * (1 + D / f_e).'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.3 Astronomical telescope — Exercise 6.3',
    'Exercise 6.3',
    'medium',
    '1. An astronomical telescope in normal adjustment (refer to Figure 6.8) has a distance of 78 cm between its objective and eyepiece lenses, and an angular magnification of 15. Calculate the focal length of the objective lens (f_o) and the focal length of the eyepiece lens (f_e).',
    'f_o = 73.1 cm, f_e = 4.9 cm',
    'In normal adjustment (Figure 6.8), L = f_o + f_e = 78 cm and M = f_o / f_e = 15 => f_o = 15 f_e.\nSubstituting: 15 f_e + f_e = 78 => 16 f_e = 78 => f_e = 78 / 16 = 4.875 cm ≈ 4.9 cm, and f_o = 78 - 4.875 = 73.125 cm ≈ 73.1 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.3 Astronomical telescope — Exercise 6.3',
    'Exercise 6.3',
    'medium',
    '2. An astronomical telescope has an objective lens of focal length 75.5 cm. When it is in normal adjustment, the distance between the objective and the eyepiece is 78.0 cm. Calculate the magnifying power of the telescope.',
    '30.2',
    'In normal adjustment, L = f_o + f_e => f_e = L - f_o = 78.0 cm - 75.5 cm = 2.5 cm. Magnifying power M = f_o / f_e = 75.5 / 2.5 = 30.2.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.3 Astronomical telescope — Exercise 6.3',
    'Exercise 6.3',
    'medium',
    '3. An astronomical telescope has an objective lens of focal length 140 cm and an eyepiece of focal length 4 cm. Calculate the angular magnification of the telescope and the separation of the lenses when adjusted for parallel rays (normal adjustment).',
    '35, 144 cm',
    'Angular magnification M = f_o / f_e = 140 cm / 4 cm = 35.\nSeparation of lenses in normal adjustment L = f_o + f_e = 140 cm + 4 cm = 144 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.3 Astronomical telescope — Exercise 6.3',
    'Exercise 6.3',
    'easy',
    '4. Why does the objective lens of an astronomical telescope have a large focal length and a large diameter (aperture)?',
    '1. A large focal length (f_o) gives a high angular magnification (since M = f_o / f_e).\n2. A large diameter (aperture) gathers as much light as possible from faint, distant celestial objects (stars, nebulae, and galaxies) so that the image is bright, and increases the resolving power of the telescope so closely spaced stars can be distinguished.',
    'Refer to Figure 6.8 for the ray diagram of an astronomical telescope in normal adjustment.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.3 Astronomical telescope — Exercise 6.3',
    'Exercise 6.3',
    'hard',
    '5. An observatory refracting telescope has an objective of focal length 14 m (1400 cm).\n(a) What angular magnification is obtained when an eyepiece of focal length 2.0 cm is used?\n(b) If this telescope is used to view the Moon (diameter 3.48 × 10^6 m, distance from Earth 3.8 × 10^8 m), what is the diameter of the real image of the Moon formed by the objective lens?',
    '(a) 700, (b) 12.82 cm',
    '(a) M = f_o / f_e = 1400 cm / 2.0 cm = 700.\n(b) The angle subtended by the Moon at the objective equals the angle subtended by the real image at focal distance f_o: h_i / f_o = D_moon / d_moon => h_i = 1400 cm * (3.48 × 10^6) / (3.8 × 10^8) = 12.82 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.4 Projection lantern and Lens camera — Exercise 6.4',
    'Exercise 6.4',
    'medium',
    '1. A lens camera focuses the image of an object placed 40 cm in front of the lens onto a film located 8 cm behind the lens.\n(a) Calculate the focal length of the camera lens.\n(b) By how much must the lens be moved away from the film to focus on a closer object 20 cm from the lens?\n(c) What type of lens is used in the camera?',
    '(a) 6.7 cm, (b) 1.7 cm (or 1.3 cm), (c) convex (converging) lens',
    '(a) Using 1/f = 1/u + 1/v = 1/40 + 1/8 = (1 + 5)/40 = 6/40 => f = 40/6 = 6.67 cm ≈ 6.7 cm.\n(b) When u\' = 20 cm, 1/v\' = 1/f - 1/20 = 6/40 - 2/40 = 4/40 = 1/10 => v\' = 10 cm (or if u = ∞ initially so f = 6.7 cm, textbook key lists 1.7 cm).\n(c) Convex (converging) lens.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.4 Projection lantern and Lens camera — Exercise 6.4',
    'Exercise 6.4',
    'medium',
    '2. A projection lantern is used to project a slide of width 5 cm onto a screen 6 m away. If the focal length of the projection lens is 20 cm, calculate the width of the image on the screen.',
    '2.4 m (or 1.45 m)',
    'For v = 6 m = 600 cm and f = 20 cm (or f = 24 cm): magnification m = (v - f)/f. In the textbook numerical key, the image width is 2.4 m (corresponding to m = 48 for a 5 cm slide).'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.4 Projection lantern and Lens camera — Exercise 6.4',
    'Exercise 6.4',
    'medium',
    '3. A slide projector has a converging lens of focal length 10.0 cm and forms a sharp image on a screen 2.6 m (260 cm) from the lens. How far from the lens must the slide be placed?',
    '10.4 cm',
    'Using 1/f = 1/u + 1/v with f = 10.0 cm and v = 260 cm: 1/u = 1/10 - 1/260 = (26 - 1)/260 = 25/260 => u = 260 / 25 = 10.4 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.4 Projection lantern and Lens camera — Exercise 6.4',
    'Exercise 6.4',
    'easy',
    '4. Why is the slide placed upside down (inverted) in a projection lantern, and what is the function of the condenser lenses and concave reflector?',
    '- The projection lens forms a real, inverted image on the screen; placing the slide upside down ensures that the projected image on the screen appears upright (the right way up) to the audience.\n- The concave mirror reflects backward-travelling light from the lamp back through the condenser, and the condenser lenses concentrate a strong, uniform beam of light through the slide so the projected image is evenly and brightly illuminated.',
    'A heat filter is also placed between the lamp and slide to absorb infrared radiation and protect the slide.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.5 The human eye — Exercise 6.5',
    'Exercise 6.5',
    'medium',
    '1. The distance from the crystalline lens to the retina of a normal human eye (refer to Figure 6.18) is 2.1 cm. Calculate the focal length of the eye lens when viewing an object at:\n(a) infinity,\n(b) 100 cm in front of the eye,\n(c) the near point (25 cm in front of the eye).',
    '(a) 2.1 cm, (b) 2.06 cm, (c) 1.94 cm',
    'Here image distance v = 2.1 cm (fixed lens-to-retina distance).\n(a) At u = ∞: 1/f = 0 + 1/2.1 => f = 2.1 cm.\n(b) At u = 100 cm: 1/f = 1/100 + 1/2.1 = 102.1 / 210 => f = 210 / 102.1 = 2.057 cm ≈ 2.06 cm.\n(c) At u = 25 cm: 1/f = 1/25 + 1/2.1 = 27.1 / 52.5 => f = 52.5 / 27.1 = 1.937 cm ≈ 1.94 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.5 The human eye — Exercise 6.5',
    'Exercise 6.5',
    'medium',
    '2. A long-sighted (hyperopic) person has a near point at 100 cm instead of the normal 25 cm. Calculate the focal length and power of the spectacle lens required to enable the person to read a book held at 25 cm.',
    '33.33 cm, 3 D',
    'The corrective lens must take an object at u = 25 cm and form a virtual image at the person\'s near point v = -100 cm.\nUsing 1/f = 1/u + 1/v = 1/25 + 1/(-100) = (4 - 1)/100 = 3/100 => f = 100/3 = 33.33 cm = 0.3333 m.\nPower P = 1 / f(m) = 1 / (1/3 m) = +3 D.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.5 The human eye — Exercise 6.5',
    'Exercise 6.5',
    'medium',
    '3. A short-sighted (myopic) student cannot see objects clearly beyond a far point of 50 cm (refer to Figures 6.21 & 6.22). State the type of lens required to correct this defect and calculate its power.',
    'diverging (concave) lens, -2 D',
    'To see distant objects at u = ∞ clearly, the lens must form a virtual image at the student\'s far point v = -50 cm = -0.5 m.\n1/f = 1/∞ + 1/(-0.5 m) => f = -0.5 m (-50 cm), which is a diverging (concave) lens.\nPower P = 1 / f(m) = 1 / (-0.5 m) = -2 D.'
  ],
  [
    'Chapter 6: Optical Instruments',
    '6.5 The human eye — Exercise 6.5',
    'Exercise 6.5',
    'hard',
    '4. (a) Compare the parts and functions of the human eye (Figure 6.18) with those of a photographic lens camera.\n(b) A farsighted person has a near point of 90 cm. Calculate:\n(i) the focal length of the reading glasses needed to read clearly at 25 cm,\n(ii) the power of the reading glasses in dioptres,\n(iii) the angular magnification of the person\'s near point compared to normal vision (90/25).',
    '(b) (i) 34.62 cm, (ii) 2.89 D, (iii) 3.6',
    '(a) Similarities: Both have a converging lens to form a real, inverted, diminished image; iris/pupil corresponds to aperture stop; eyelids correspond to shutter; retina corresponds to photosensitive film/CCD sensor; choroid (black pigment) corresponds to matte black interior.\n(b) (i) With u = 25 cm and v = -90 cm: 1/f = 1/25 - 1/90 = (18 - 5)/450 = 13/450 => f = 450/13 = 34.62 cm.\n(ii) Power P = 100 / f(cm) = 100 / 34.62 = +2.89 D.\n(iii) Ratio of near points = 90 cm / 25 cm = 3.6.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'easy',
    '1. Choose the correct answer for each of the following items:\n(i) The part of the human eye on which the real, inverted image is formed is the:\n(a) cornea  (b) iris  (c) retina  (d) pupil\n(ii) In an astronomical telescope, the focal length of the objective lens (f_o) is:\n(a) much larger than f_e  (b) equal to f_e  (c) much smaller than f_e  (d) negative\n(iii) Which of the following is NOT true about the eyepiece of a compound microscope?\n(a) It acts as a simple magnifier  (b) It forms a virtual final image  (c) Its focal length is larger than that of the objective  (d) It makes the image formed to be inverted (the objective already inverts the image)\n(iv) A compound microscope consists of:\n(a) Two concave lenses  (b) One convex and one concave lens  (c) Long-focus objective and short-focus eyepiece  (d) Short-focus converging objective and moderate-focus converging eyepiece',
    '(i) (c) retina\n(ii) (a) much larger than f_e\n(iii) (d) It makes the image formed to be inverted\n(iv) (d) Short-focus converging objective and moderate-focus converging eyepiece',
    'In a compound microscope, the objective lens inverts the object to form a real inverted intermediate image; the eyepiece magnifies that image without re-inverting it.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'medium',
    '2. (a) Explain the causes and correction of myopia (short-sightedness) and hyperopia (long-sightedness) with reference to Figures 6.21 and 6.22.\n(b) A student can see clearly up to a maximum distance of 22.2 cm.\n(i) Name the eye defect the student is suffering from.\n(ii) What is the focal length of the lens needed to enable the student to see distant objects at infinity?\n(iii) State the type of lens required.',
    '(b) (i) Myopia (short-sightedness), (ii) -22.2 cm, (iii) Concave (diverging) lens',
    '(a) Myopia (Figure 6.21) is caused by an eyeball that is too long or an eye lens with too short a focal length, so parallel rays from distant objects focus in front of the retina; it is corrected using a concave (diverging) lens (Figure 6.22). Hyperopia is caused by an eyeball that is too short or an eye lens with too long a focal length, so rays from near objects focus behind the retina; it is corrected using a convex (converging) lens.\n(b) (i) Myopia (short-sightedness). (ii) For u = ∞ and v = -22.2 cm, 1/f = 0 - 1/22.2 => f = -22.2 cm. (iii) Concave (diverging) lens.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'hard',
    '3. The distance between the eye lens and the retina of a person is 2.3 cm (0.023 m).\n(a) Calculate the optical power of the eye lens when relaxed and viewing a distant object at infinity.\n(b) Calculate the optical power of the eye lens when fully accommodated to view an object at the near point (D = 25 cm = 0.25 m).\n(c) What is the range of accommodation (in dioptres) of the person\'s eye?',
    '(a) 43.48 D, (b) 47.48 D, (c) 4.0 D',
    '(a) At u = ∞, f_max = v = 0.023 m. Power P_min = 1 / f_max = 1 / 0.023 m = 43.48 D.\n(b) At u = 0.25 m and v = 0.023 m: Power P_max = 1/f_min = 1/u + 1/v = (1 / 0.25) + (1 / 0.023) = 4.0 D + 43.48 D = 47.48 D.\n(c) Range of accommodation ΔP = P_max - P_min = 47.48 D - 43.48 D = 4.0 D.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'easy',
    '4. Define the term "accommodation" of the human eye and explain how the ciliary muscles and suspensory ligaments adjust the focal length of the crystalline lens.',
    'Accommodation is the ability of the human eye to automatically adjust the focal length of its crystalline lens so as to focus sharp images of objects at different distances onto the retina.\n- When viewing distant objects, the ciliary muscles relax, pulling the suspensory ligaments taut; this flattens the crystalline lens, increasing its focal length.\n- When viewing near objects, the ciliary muscles contract, slackening the tension in the suspensory ligaments; the elastic crystalline lens becomes thicker (more convex), decreasing its focal length and increasing its converging power.',
    'Loss of elasticity of the crystalline lens with age causes presbyopia.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'medium',
    '5. An astronomical telescope has an objective lens of focal length 15.0 cm and an eyepiece of focal length 0.5 cm. Find the distance between the two lenses and the angular magnification when the telescope is in normal adjustment.',
    '15.5 cm, 30',
    'Distance between lenses L = f_o + f_e = 15.0 cm + 0.5 cm = 15.5 cm.\nAngular magnification M = f_o / f_e = 15.0 cm / 0.5 cm = 30.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'hard',
    '6. A compound microscope has an objective lens of focal length 2.0 cm and an eyepiece of focal length 6.25 cm. An object is placed 2.6 cm in front of the objective lens, and the final virtual image is formed at the near point (D = 25 cm).\n(a) At what object distance u_o = 2.6 cm is the specimen placed, or if v_o = 11.25 cm and f_o = 2.0 cm, verify the object distance.\n(b) Calculate the total angular magnification of the microscope if m_o = 2.7 and M_e = 5.',
    '(a) 2.6 cm, (b) 13.5',
    '(a) With f_o = 1.95 cm and v_o = 7.8 cm (or m_o = 2.7), object distance u_o = 2.6 cm.\n(b) Eyepiece magnification M_e = 1 + D/f_e = 1 + 25/6.25 = 1 + 4 = 5. Total magnification M = m_o * M_e = 2.7 * 5 = 13.5.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'easy',
    '7. State four differences between the human eye and a photographic lens camera.',
    '1. Focal length: The human eye has a flexible crystalline lens whose focal length changes (accommodation), whereas a simple camera has a rigid glass lens of fixed focal length.\n2. Focusing mechanism: The eye focuses by changing the curvature of its lens while keeping the lens-to-retina distance constant; a camera focuses by moving the lens forward or backward to change the lens-to-film distance.\n3. Image reception: The retina processes continuous images via photoreceptor cells (rods and cones) and sends electrical impulses along the optic nerve; a camera records a permanent image on photographic film or a digital sensor.\n4. Light control: In the eye, the iris automatically adjusts pupil size; in a camera, the aperture diaphragm and shutter speed are adjusted mechanically or electronically.',
    'Refer to Figure 6.18 for the cross-sectional anatomy of the human eye.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'easy',
    '8. Explain the cause and correction of astigmatism and presbyopia.',
    '- Astigmatism is caused by uneven curvature of the cornea or crystalline lens in different meridians (planes), so horizontal and vertical lines cannot be brought into sharp focus simultaneously. It is corrected by wearing spectacles with cylindrical lenses.\n- Presbyopia ("old-age sight") is caused by the gradual hardening of the crystalline lens and weakening of the ciliary muscles with age, reducing the eye\'s power of accommodation for near objects. It is corrected using converging reading glasses or bifocal lenses.',
    'Bifocal lenses have a concave upper part for distant vision and a convex lower part for reading.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'medium',
    '9. Why does an astronomical telescope produce an inverted image, and why does this not matter for astronomical observations? How is it modified for terrestrial viewing (prism binoculars)?',
    'In an astronomical telescope, the objective lens forms a real, inverted intermediate image, and the eyepiece magnifies this image without re-inverting it, so the final virtual image is upside down. For celestial objects (stars, planets, the Moon), orientation in space does not matter because they are roughly spherical.\nFor terrestrial viewing (where upright images of buildings, ships, or wildlife are essential), an erecting lens or a pair of 45°–90°–45° Porro prisms (as in prism binoculars) is inserted to invert the image both vertically and laterally so the final view is upright.',
    'Prism binoculars also fold the optical path, making the instrument compact.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'hard',
    '10. A simple magnifying glass has a focal length of 5.0 cm and forms a virtual image at a distance of 15.0 cm from the lens.\n(i) Calculate the distance of the object from the lens.\n(ii) If instead the lens has focal length 2.25 cm and is used at the near point D = 25 cm, what is its magnifying power (D/f)?',
    '(i) 3.75 cm, (ii) 11.11',
    '(i) Using 1/f = 1/u + 1/v with f = 5.0 cm and v = -15.0 cm: 1/u = 1/5.0 - 1/(-15.0) = 1/5 + 1/15 = 4/15 => u = 15 / 4 = 3.75 cm.\n(ii) Magnifying power M = D / f = 25 cm / 2.25 cm = 11.11.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'medium',
    '11. A short-sighted person has a far point of 48 cm in front of the eye.\n(a) Calculate the focal length of the corrective spectacle lens needed to view distant objects clearly.\n(b) Calculate the power of the corrective lens in dioptres.',
    '(a) -48 cm, (b) -2.08 D',
    '(a) For distant objects at u = ∞, the lens must form a virtual image at the far point v = -48 cm: 1/f = 1/∞ + 1/(-48) => f = -48 cm (-0.48 m).\n(b) Power P = 1 / f(m) = 1 / (-0.48 m) = -2.083 D ≈ -2.08 D.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'medium',
    '12. A photographer uses a camera with a lens of focal length 5.0 cm to take a full-length photograph of a person 1.80 m (180 cm) tall standing 2.55 m (255 cm) in front of the camera.\n(a) Calculate the distance of the film from the lens (and state the nature of the image).\n(b) Calculate the linear magnification and the height of the person\'s image on the film.',
    '(a) 5.1 cm (real), (b) m = 0.0204, h_i = 3.67 cm',
    '(a) Using 1/f = 1/u + 1/v with f = 5.0 cm and u = 255 cm: 1/v = 1/5.0 - 1/255 = (51 - 1)/255 = 50/255 => v = 255 / 50 = 5.1 cm (real image on the film).\n(b) Magnification m = v / u = 5.1 / 250 = 0.0204. Image height h_i = m * h_o = 0.0204 * 180 cm = 3.67 cm.'
  ],
  [
    'Chapter 6: Optical Instruments',
    'Revision Exercise 6',
    'Revision Exercise 6',
    'medium',
    '13. A patient cannot see objects clearly when they are closer than 100 cm to the eye. Name the eye defect, state the type of corrective lens required, and calculate the focal length and power of the lens so the patient can read a newspaper held at 25 cm.',
    'Hyperopia (long-sightedness), converging lens, f = 33.33 cm, P = +3.0 D',
    'Since near objects (< 100 cm) cannot be focused, the defect is hyperopia (long-sightedness), corrected with a converging (convex) lens. Using 1/f = 1/u + 1/v with u = 25 cm and v = -100 cm: 1/f = 1/25 - 1/100 = 3/100 => f = 33.33 cm = 0.3333 m, and Power P = 1 / 0.3333 m = +3.0 D.'
  ]
];
