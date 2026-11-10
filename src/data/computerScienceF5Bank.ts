import { CS_F5_ANSWERS_PART1, type ExactCSAnswer } from './csF5AnswersPart1.ts';
import { CS_F5_ANSWERS_PART2 } from './csF5AnswersPart2.ts';
import { CS_F5_ANSWERS_PART3 } from './csF5AnswersPart3.ts';
import { CS_F5_QUESTIONS_PART1 } from './csF5QuestionsPart1.ts';
import { CS_F5_QUESTIONS_PART2 } from './csF5QuestionsPart2.ts';
import { CS_F5_QUESTIONS_PART3 } from './csF5QuestionsPart3.ts';
import { CS_F5_QUESTIONS_PART4 } from './csF5QuestionsPart4.ts';

export interface ExtractedQuestionItem {
  id: string;
  cls: string;
  classLevel: string;
  subject: string;
  topic: string;
  subTopic: string;
  exerciseRef: string;
  textbookTitle: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  correctAnswer: string;
  explanation: string;
  hint: string;
  competence: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sourceBook: string;
  isMultipleChoice?: boolean;
}

const ALL_EXACT_CS_F5_ANSWERS: Record<string, ExactCSAnswer> = {
  ...CS_F5_ANSWERS_PART1,
  ...CS_F5_ANSWERS_PART2,
  ...CS_F5_ANSWERS_PART3,
};

interface ChapterMeta {
  topic: string;
  defaultSubTopic: string;
  competence: string;
}

const CHAPTER_META: Record<string, ChapterMeta> = {
  'chapter-1': {
    topic: 'Chapter 1: Computer Basics',
    defaultSubTopic: '1.1 Computer organization and architecture',
    competence: 'Demonstrate mastery of computer organization, logic gates, Boolean algebra, memory hierarchy, ISA, and I/O systems.'
  },
  'chapter-2': {
    topic: 'Chapter 2: Parallel Computing',
    defaultSubTopic: '2.1 Instruction Pipelining and Hazards',
    competence: 'Apply instruction pipelining, instruction-level parallelism (ILP), branch prediction, and thread/data-level parallelism.'
  },
  'chapter-3': {
    topic: 'Chapter 3: Computer Networks and Communication',
    defaultSubTopic: '3.1 Network Communication & OSI/TCP-IP Models',
    competence: 'Analyse OSI and TCP/IP reference models, IPv4/IPv6 addressing, subnetting, routing, transport protocols, and network security.'
  },
  'chapter-4': {
    topic: 'Chapter 4: Problem-Solving and Object-Oriented Programming in C++',
    defaultSubTopic: '4.1 Concepts of Object-Oriented Programming',
    competence: 'Design and implement C++ programs using data types, control structures, functions, arrays, strings, and OOP principles.'
  },
  'chapter-5': {
    topic: 'Chapter 5: Object-Oriented Programming with Java',
    defaultSubTopic: '5.1 Java Fundamentals, Classes, Objects, and Constructors',
    competence: 'Develop Java object-oriented applications using classes, constructors, inheritance, interfaces, abstraction, encapsulation, and polymorphism.'
  },
  'chapter-6': {
    topic: 'Chapter 6: Python Programming',
    defaultSubTopic: '6.1 Python Fundamentals, Control Structures, Functions, and Modules',
    competence: 'Write Python scripts and object-oriented programs using modules, control structures, functions, encapsulation, abstraction, and inheritance.'
  },
  'chapter-7': {
    topic: 'Chapter 7: Operating Systems',
    defaultSubTopic: '7.1 Operating System Concepts, Evolution, and Design',
    competence: 'Evaluate operating system structures, process management, CPU scheduling algorithms, deadlock handling, memory management, and storage security.'
  },
  'chapter-8': {
    topic: 'Chapter 8: Database Systems',
    defaultSubTopic: '8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)',
    competence: 'Design normalised relational databases (1NF–3NF), write SQL queries, and evaluate parallel, distributed, and emerging database technologies.'
  },
  'chapter-8-part-2': {
    topic: 'Chapter 8: Database Systems',
    defaultSubTopic: '8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems',
    competence: 'Implement web-based database applications using PHP PDO with MySQL and apply NoSQL databases (MongoDB, Redis, Cassandra) and Big Data warehousing.'
  }
};

function buildQuestionDistractors(sectionId: string, answer: string, questionText: string): [string, string, string] {
  const q = questionText.toLowerCase();

  if (sectionId === 'chapter-1') {
    if (q.includes('amat') || q.includes('average memory access time')) {
      return [
        'AMAT = 40 ns + (0.95 × 4 ns) = 43.8 ns.',
        'AMAT = (4 ns + 40 ns) / 2 = 22.0 ns.',
        'AMAT = 4 ns × 0.95 = 3.8 ns.'
      ];
    }
    if (q.includes('k=1') || q.includes('k = 1')) {
      return [
        'Fully associative mapping where any block can occupy any cache line without index bits.',
        'Two-way skewed associative mapping with dual hash index functions.',
        'Write-back virtual memory paging with no tag comparison.'
      ];
    }
    if (q.includes('fully set associative') || q.includes('how many sets')) {
      return [
        'As many sets as there are words in main memory (RAM).',
        'Exactly two sets: one for instructions and one for data.',
        'Zero sets, because fully associative caches do not store cache lines.'
      ];
    }
    if (q.includes('boolean') || q.includes('simplify') || q.includes('logic circuit') || q.includes('truth table')) {
      return [
        'The output is always logic 0 (LOW) for all input combinations regardless of the gate connections.',
        'The circuit can only be implemented using sequential flip-flops and cannot be simplified using Boolean laws.',
        'The expression simplifies to A ⊕ B ⊕ C and requires three 4-bit shift registers.'
      ];
    }
    return [
      'It bypasses the CPU Control Unit and stores all instructions permanently in volatile ALU flip-flops without using RAM or system buses.',
      'It forces all peripheral I/O devices to run at the exact gigahertz clock frequency of the L1 instruction cache without interrupts.',
      'It replaces binary two’s complement representation with analog voltage levels processed directly by secondary magnetic storage.'
    ];
  }

  if (sectionId === 'chapter-2') {
    if (q.includes('throughput') && q.includes('1 ns')) {
      return [
        'Average CPI = 1.0 cycle/instruction, giving a theoretical throughput of 1.0 × 10⁹ instructions/second regardless of lw/sw percentage.',
        'Average CPI = 5.0 cycles/instruction, giving a throughput of 2.0 × 10⁸ instructions/second; higher lw/sw percentage doubles throughput.',
        'Average CPI = 2.4 cycles/instruction, giving a throughput of 4.17 × 10⁸ instructions/second; lw/sw instructions reduce CPI to 0.5.'
      ];
    }
    if (q.includes('prediction accuracy') && q.includes('five iterations')) {
      return [
        '0% prediction accuracy (0 correct predictions out of 5 iterations).',
        '40% prediction accuracy (2 correct predictions out of 5 iterations).',
        '60% prediction accuracy (3 correct predictions out of 5 iterations).'
      ];
    }
    if (q.includes('scalar and a superscalar')) {
      return [
        'Scalar processors can execute multiple instructions simultaneously, while superscalar processors execute only one instruction per cycle.',
        'Scalar processors focus on data-level parallelism, while superscalar processors focus exclusively on thread-level parallelism.',
        'Superscalar processors are simpler and cheaper to manufacture than scalar processors because they lack instruction pipelines.'
      ];
    }
    return [
      'It forces every instruction in the program to wait until the previous instruction completes all five stages before fetching the next instruction.',
      'It eliminates all hardware execution units and relies solely on single-threaded sequential interpretation in secondary storage.',
      'It converts all Read-After-Write (RAW) true dependencies into branch mispredictions by disabling the processor’s register file.'
    ];
  }

  if (sectionId === 'chapter-3') {
    if (q.includes('subnet') || q.includes('host') || q.includes('mask') || q.includes('192.168') || q.includes('172.16') || q.includes('10.10') || q.includes('211.77')) {
      return [
        'Subnet mask 255.0.0.0 (/8), creating 1 subnet with 16,777,214 usable hosts and broadcast address 127.0.0.1.',
        'Subnet mask 255.255.255.252 (/30), creating 64 subnets with only 2 usable host IP addresses per subnet.',
        'Subnet mask 255.255.255.255 (/32), allocating 0 subnet bits and 256 usable host addresses per subnet.'
      ];
    }
    return [
      'It operates exclusively at the Physical Layer (Layer 1) by amplifying analog electrical voltages across unshielded copper repeaters without headers.',
      'It replaces logical IP routing and transport port numbers with hardcoded flat MAC broadcasts across the entire global Internet.',
      'It disables packet encapsulation and transmits unformatted raw memory dumps without error detection, flow control, or authentication.'
    ];
  }

  if (sectionId === 'chapter-4') {
    if (q.includes("x = 'b'") || q.includes('66')) {
      return [
        'The output is the character literal B followed by a compilation warning.',
        'The output is 0 because assigning a char to an int variable resets it to zero.',
        'The program fails to compile because single quotes cannot be used in C++.'
      ];
    }
    if (q.includes('mayai[50][100][100][25]')) {
      return [
        '275 elements (50 + 100 + 100 + 25).',
        '500,000 elements (50 × 100 × 100).',
        '1,250,000 elements.'
      ];
    }
    if (q.includes('2%3')) {
      return [
        'The output is: 2%3 = 0.',
        'The output is: 2%3 = 0.6667.',
        'The output is: 2%3 = 3.'
      ];
    }
    return [
      'It causes a syntax error in C++ because functions and classes cannot access variables declared inside main() without global pointers.',
      'It forces the C++ compiler to ignore data types and treat all numeric variables as null-terminated character arrays at runtime.',
      'It bypasses compile-time type checking and executes all loop bodies only once regardless of the termination condition.'
    ];
  }

  if (sectionId === 'chapter-5') {
    if (q.includes('<<') || q.includes('>>')) {
      return [
        'It inverts every bit using one’s complement negation (~) and produces a negative floating-point value.',
        'It leaves the binary representation unchanged because Java bitwise shift operators only apply to String objects.',
        'It multiplies the operand by 10 in decimal, producing 60 in binary 00111100.'
      ];
    }
    return [
      'Declaring all class fields as public static and removing constructors so external classes modify memory addresses directly via C++ pointers.',
      'Using multiple class inheritance (`class A extends B, C`) and manual `delete` destructors instead of the JVM Garbage Collector.',
      'Replacing all `@Override` instance methods with `final private` constructors that cannot be invoked by any object instance.'
    ];
  }

  if (sectionId === 'chapter-6') {
    return [
      'In Python, attributes are made private using the `private` keyword before the variable name and compiled into static C++ header files.',
      'Python classes do not support inheritance or constructors and require manual memory allocation using `malloc()` and `free()`.',
      'The function concatenates all numeric inputs as raw byte strings without converting types or iterating through the collection.'
    ];
  }

  if (sectionId === 'chapter-7') {
    return [
      'The Operating System executes all user applications directly in privileged Kernel Mode with interrupts permanently disabled and no virtual memory isolation.',
      'The scheduler forces every interactive UI thread to wait in a non-preemptive First-Come, First-Served batch queue until all background disk tasks finish.',
      'Deadlocks are resolved by permanently deleting the operating system kernel and disabling multi-process execution across all CPU cores.'
    ];
  }

  if (q.includes('sql') || q.includes('books') || q.includes('students') || q.includes('employees')) {
    return [
      '`MODIFY TABLE Records WHERE Column = ALL COMMIT WITHOUT PRIMARY KEY;`',
      '`REMOVE ALL ROWS FROM Database USING TABLE SCAN WITHOUT WHERE CLAUSE;`',
      '`FETCH SCHEMA INTO Table VALUES (NULL) GROUP BY PRIMARY KEY ONLY;`'
    ];
  }
  return [
    'Storing all records in unindexed flat text files with duplicated composite columns so every query requires a manual sequential scan.',
    'Disabling primary and foreign key constraints and replacing ACID transactions with unencrypted client-side URL query strings.',
    'Forcing all distributed regional nodes to share a single locked flat file over a half-duplex serial line without concurrency control.'
  ];
}

function solveComputerScienceF5Question(
  sectionId: string,
  exerciseRef: string,
  questionText: string
): { answer: string; explanation: string; options: string[] } {
  const exact = ALL_EXACT_CS_F5_ANSWERS[exerciseRef];
  if (exact) {
    const distractors = exact.distractors || buildQuestionDistractors(sectionId, exact.answer, questionText);
    return {
      answer: exact.answer,
      explanation: exact.explanation,
      options: [exact.answer, ...distractors]
    };
  }

  const fallbackAnswer = 'Apply the core principles of this topic to analyse the requirements, structure the solution step-by-step, and verify the output against syllabus specifications.';
  const distractors = buildQuestionDistractors(sectionId, fallbackAnswer, questionText);
  return {
    answer: fallbackAnswer,
    explanation: 'This solution follows the Form 5 Computer Science syllabus requirements for this exercise.',
    options: [fallbackAnswer, ...distractors]
  };
}

function buildComputerScienceF5Bank(): ExtractedQuestionItem[] {
  const allTuples: Array<[string, string, string, string]> = [
    ...CS_F5_QUESTIONS_PART1,
    ...CS_F5_QUESTIONS_PART2,
    ...CS_F5_QUESTIONS_PART3,
    ...CS_F5_QUESTIONS_PART4,
  ];

  const bookTitle = "Computer Science for Advanced Secondary Schools Student's Book Form Five (TIE)";

  return allTuples.map(([sectionId, subTopic, exerciseRef, questionText], globalIdx) => {
    const meta = CHAPTER_META[sectionId] || CHAPTER_META['chapter-1'];
    const solved = solveComputerScienceF5Question(sectionId, exerciseRef, questionText);
    const qTextLower = questionText.toLowerCase();
    const difficulty: 'Easy' | 'Medium' | 'Hard' =
      qTextLower.length > 260 ||
      /design|write a .*program|implement|simulate|calculate|normali|subnet|timing diagram|simplify/i.test(qTextLower)
        ? 'Hard'
        : qTextLower.length > 120 || /explain|compare|analyse|evaluate|discuss|differentiate/i.test(qTextLower)
        ? 'Medium'
        : 'Easy';

    const distractors = solved.options.slice(1, 4);
    while (distractors.length < 3) {
      distractors.push('None of the above statements applies to this computer science problem.');
    }
    const correctIndex = globalIdx % 4;
    const orderedOptions: [string, string, string, string] = ['', '', '', ''];
    let dIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        orderedOptions[i] = solved.answer;
      } else {
        orderedOptions[i] = distractors[dIdx++];
      }
    }

    return {
      id: `cs-f5-uploaded-${globalIdx + 1}`,
      cls: 'Form 5',
      classLevel: 'Form 5',
      subject: 'Computer Science',
      topic: meta.topic,
      subTopic: subTopic || meta.defaultSubTopic,
      exerciseRef,
      textbookTitle: bookTitle,
      question: `[${exerciseRef}] ${questionText}`,
      options: orderedOptions,
      correctIndex,
      correctAnswer: solved.answer,
      explanation: solved.explanation,
      hint: meta.competence,
      competence: meta.competence,
      difficulty,
      sourceBook: bookTitle,
      isMultipleChoice: false
    };
  });
}

export const COMPUTER_SCIENCE_F5_BANK: ExtractedQuestionItem[] = buildComputerScienceF5Bank();
