import type { ExtractedTextbookExerciseSeed } from './extractedTextbookExerciseBank.ts';
import { PHYSICS_F2_PART1_TUPLES } from './physicsF2Part1.ts';
import { PHYSICS_F2_PART2_TUPLES } from './physicsF2Part2.ts';

const TEXTBOOK_TITLE =
  "Physics for Secondary Schools - Student's Book Form Two (2025 Revised Edition)";

const CHAPTER_ID_TO_TOPIC: Record<string, string> = {
  'chapter-1': 'Chapter 1: Static Electricity',
  'chapter-2': 'Chapter 2: Current Electricity',
  'chapter-3': 'Chapter 3: Magnetism',
  'chapter-4': 'Chapter 4: Nature and Reflection of Light',
  'chapter-5': 'Chapter 5: Refraction and Dispersion of Light',
  'chapter-6': 'Chapter 6: Optical Instruments',
};

function buildPhysicsDistractors(topic: string, answer: string): [string, string, string] {
  const numMatch = answer.match(/(-?\d+(?:\.\d+)?)\s*(cm|m\/s|m|V|A|Ω|μF|pF|F|C|J|W|D|°)/i);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    const unit = numMatch[2];
    if (!Number.isNaN(val) && val !== 0) {
      const d1 = `${Number((val * 2).toFixed(2))} ${unit}`;
      const d2 = `${Number((val * 0.5).toFixed(2))} ${unit}`;
      const d3 = `${Number((val + (val > 0 ? 5 : -5)).toFixed(2))} ${unit}`;
      if (d1 !== answer && d2 !== answer && d3 !== answer) {
        return [d1, d2, d3];
      }
    }
  }

  if (topic.includes('Chapter 4')) {
    return [
      'A convex mirror always forms a real, inverted, and magnified image in front of the reflecting surface.',
      'The angle of incidence is measured between the incident ray and the mirror surface rather than the normal.',
      'Light travels in curved paths through a uniform homogeneous transparent medium.',
    ];
  }
  if (topic.includes('Chapter 5')) {
    return [
      'When light travels from air into glass, it bends away from the normal and its speed increases.',
      'Total internal reflection occurs when light travels from air into water at an angle less than the critical angle.',
      'Red light is deviated more than violet light when white light undergoes dispersion in a glass prism.',
    ];
  }
  return [
    'In an astronomical telescope, the objective lens has a much shorter focal length than the eyepiece lens.',
    'Myopia (short-sightedness) is corrected using a converging (convex) lens of positive optical power.',
    'The human eye focuses on near and distant objects by changing the distance between the cornea and the retina.',
  ];
}

const PART1_ITEMS: ExtractedTextbookExerciseSeed[] = PHYSICS_F2_PART1_TUPLES.map(
  (
    [
      chapterId,
      subTopic,
      exerciseRef,
      questionText,
      correctAnswer,
      distractor1,
      distractor2,
      distractor3,
      explanation,
      isMultipleChoice,
    ],
    idx
  ) => {
    const topic = CHAPTER_ID_TO_TOPIC[chapterId] || chapterId;
    const distractors: [string, string, string] = [distractor1, distractor2, distractor3];
    const correctIndex = idx % 4;
    const orderedOptions: [string, string, string, string] = ['', '', '', ''];
    let dIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        orderedOptions[i] = correctAnswer;
      } else {
        orderedOptions[i] = distractors[dIdx++];
      }
    }
    return {
      id: `phys_f2_2025_${idx + 1}`,
      cls: 'Form 2',
      subject: 'Physics',
      topic,
      subTopic,
      exerciseRef,
      textbookTitle: TEXTBOOK_TITLE,
      question: questionText.startsWith('[') ? questionText : `[${exerciseRef}] ${questionText}`,
      options: orderedOptions,
      correctIndex,
      explanation: `${correctAnswer} — ${explanation}`,
      hint: explanation,
      isMultipleChoice: Boolean(isMultipleChoice),
    };
  }
);

const PART2_ITEMS: ExtractedTextbookExerciseSeed[] = PHYSICS_F2_PART2_TUPLES.map(
  ([topic, subTopic, exerciseLabel, _difficulty, question, answer, explanation], idx) => {
    const globalIdx = PART1_ITEMS.length + idx;
    const distractors = buildPhysicsDistractors(topic, answer);
    const correctIndex = globalIdx % 4;
    const orderedOptions: [string, string, string, string] = ['', '', '', ''];
    let dIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        orderedOptions[i] = answer;
      } else {
        orderedOptions[i] = distractors[dIdx++];
      }
    }
    const isMcq = /choose the correct answer|match each item|\(i\).*\(ii\)/i.test(question);
    return {
      id: `phys_f2_2025_${globalIdx + 1}`,
      cls: 'Form 2',
      subject: 'Physics',
      topic,
      subTopic,
      exerciseRef: exerciseLabel,
      textbookTitle: TEXTBOOK_TITLE,
      question: question.startsWith('[') ? question : `[${exerciseLabel}] ${question}`,
      options: orderedOptions,
      correctIndex,
      explanation: `${answer} — ${explanation}`,
      hint: explanation,
      isMultipleChoice: isMcq,
    };
  }
);

export const PHYSICS_F2_BANK: ExtractedTextbookExerciseSeed[] = [
  ...PART1_ITEMS,
  ...PART2_ITEMS,
];
