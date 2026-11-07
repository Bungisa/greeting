import type { ExtractedTextbookExerciseSeed } from './extractedTextbookExerciseBank.ts';

declare const __CS_F5_RAW_HTMLS__: string[] | undefined;

const CS_F5_BOOK =
  "Computer Science for Advanced Secondary Schools Student's Book Form Five (TIE)";

const CS_F5_HTML_FILES = [
  'computer_f5_bank_of_qns_1950aee2.html',
  'computer_f5_bank_of_ques_87e7b403.html',
  'computer_f5_bank_of_questions_1e5f4d7b.html',
  'computer_f5_bank_8d71db45.html',
];

function decodeEntities(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&harr;/g, '↔')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥')
    .replace(/&ne;/g, '≠')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ');
}

function htmlToCleanMarkdown(html: string): string {
  let s = html;
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  s = s.replace(/<h4>\s*Diagram Reference:[\s\S]*?<\/h4>/gi, '');

  const codeBlocks: string[] = [];
  const stash = (text: string): string => {
    const id = `@@CODEBLOCK_${codeBlocks.length}@@`;
    codeBlocks.push(text);
    return id;
  };

  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_m, code) => {
    const cleanCode = decodeEntities(String(code).replace(/<\/?code[^>]*>/gi, '')).trim();
    return stash('\n```\n' + cleanCode + '\n```\n');
  });

  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_m, code) => {
    const cleanInline = decodeEntities(String(code)).trim();
    return stash('`' + cleanInline + '`');
  });

  s = s.replace(/<sup>([^<]+)<\/sup>/gi, '^$1');
  s = s.replace(/<sub>([^<]+)<\/sub>/gi, '_$1');

  s = s.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_m, tbody) => {
    const rows: string[] = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;
    while ((trMatch = trRegex.exec(String(tbody))) !== null) {
      const cells: string[] = [];
      const tdRegex = /<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi;
      let tdMatch: RegExpExecArray | null;
      while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
        let cellText = tdMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        cellText = decodeEntities(cellText);
        cellText = cellText.replace(
          /@@CODEBLOCK_(\d+)@@/g,
          (__, idx) => codeBlocks[Number(idx)] ?? ''
        );
        cells.push(cellText);
      }
      if (cells.length > 0) rows.push('| ' + cells.join(' | ') + ' |');
    }
    return '\n' + rows.join('\n') + '\n';
  });

  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, liContent) => '\n• ' + String(liContent).trim());
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/p>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  s = s.replace(/@@CODEBLOCK_(\d+)@@/g, (_m, idx) => codeBlocks[Number(idx)] ?? '');
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

function getChapterFromSectionId(secId: string): string {
  if (secId.includes('chapter-1')) return 'Chapter 1: Computer Architecture';
  if (secId.includes('chapter-2'))
    return 'Chapter 2: Performance and Optimisation of Computer Processor';
  if (secId.includes('chapter-3')) return 'Chapter 3: Advanced Computer Networks';
  if (secId.includes('chapter-4')) return 'Chapter 4: Object Oriented Programming with C++';
  if (secId.includes('chapter-5')) return 'Chapter 5: Object Oriented Programming with Java';
  if (secId.includes('chapter-6')) return 'Chapter 6: Object Oriented Programming with Python';
  if (secId.includes('chapter-7')) return 'Chapter 7: Operating Systems';
  if (secId.includes('chapter-8'))
    return 'Chapter 8: Databases and Database Management Systems';
  return 'Chapter 1: Computer Architecture';
}

function extractTopLevelLis(olInner: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let currentStart = -1;
  const tagRegex = /<\/?(?:ol|ul|li)\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRegex.exec(olInner)) !== null) {
    const tag = m[0].toLowerCase();
    if (tag.startsWith('<ol') || tag.startsWith('<ul')) {
      depth++;
    } else if (tag.startsWith('</ol') || tag.startsWith('</ul')) {
      depth = Math.max(0, depth - 1);
    } else if (tag.startsWith('<li')) {
      if (depth === 0 && currentStart === -1) {
        currentStart = m.index + m[0].length;
      }
    } else if (tag.startsWith('</li')) {
      if (depth === 0 && currentStart !== -1) {
        items.push(olInner.slice(currentStart, m.index));
        currentStart = -1;
      }
    }
  }
  return items;
}

function solveComputerScienceF5Question(item: {
  topic: string;
  subTopic: string;
  exerciseRef: string;
  question: string;
}): { answer: string; explanation: string; distractors?: [string, string, string] } {
  const q = item.question;
  const ql = q.toLowerCase();
  const ref = item.exerciseRef;
  const topic = item.topic;
  const sub = item.subTopic;

  if (ql.includes('hit ratio of 0.8') && ql.includes('50 nanoseconds')) {
    return {
      answer: 'AMAT = 15 ns',
      explanation:
        'Using the Average Memory Access Time formula:\n$$\\text{AMAT} = \\text{Hit Time} + (1 - \\text{Hit Ratio}) \\times \\text{Miss Penalty}$$\nSubstitute $\\text{Hit Time} = 5\\text{ ns}$, $\\text{Hit Ratio} = 0.8$, $\\text{Miss Penalty} = 50\\text{ ns}$:\n$$\\text{AMAT} = 5 + (1 - 0.8) \\times 50 = 5 + 0.2 \\times 50 = 5 + 10 = 15\\text{ ns}.$$',
    };
  }
  if (ql.includes('tlb hit takes 2 ns') && ql.includes('miss takes 20 ns')) {
    return {
      answer: 'Effective Access Time (EAT) = 3.8 ns',
      explanation:
        'Effective Memory Access Time with TLB:\n$$\\text{EAT} = H_{\\text{TLB}} \\times T_{\\text{hit}} + (1 - H_{\\text{TLB}}) \\times T_{\\text{miss}}$$\n$$\\text{EAT} = 0.90 \\times 2\\text{ ns} + 0.10 \\times 20\\text{ ns} = 1.8 + 2.0 = 3.8\\text{ ns}.$$',
    };
  }
  if (ql.includes('4-stage pipeline') && ql.includes('20ns')) {
    return {
      answer:
        'Non-pipelined = 80 ns per instruction (80,000 ns for 1,000 instructions); Pipelined = 20,060 ns for 1,000 instructions (Speedup ≈ 3.99×)',
      explanation:
        '1. **Non-pipelined processor**: Each instruction takes $4 \\times 20\\text{ ns} = 80\\text{ ns}$. For $1,000$ instructions: $1,000 \\times 80\\text{ ns} = 80,000\\text{ ns}$.\n2. **4-stage pipelined processor**: Clock cycle $T_c = 20\\text{ ns}$. Total time for $N = 1,000$ instructions across $k = 4$ stages:\n$$T_{\\text{pipe}} = (k + N - 1) \\times T_c = (4 + 1000 - 1) \\times 20\\text{ ns} = 1,003 \\times 20\\text{ ns} = 20,060\\text{ ns}.$$\n3. **Speedup**: $S = \\frac{80,000}{20,060} \\approx 3.99\\times$.',
    };
  }
  if (ql.includes('5-stage pipeline') && ql.includes('15ns')) {
    return {
      answer:
        'Total execution time for 500 instructions = 7,560 ns (vs 37,500 ns non-pipelined; Speedup ≈ 4.96×)',
      explanation:
        'With $k = 5$ stages, $N = 500$ instructions, and stage cycle time $T_c = 15\\text{ ns}$:\n1. **Pipelined execution time**:\n$$T_{\\text{pipe}} = (k + N - 1) \\times T_c = (5 + 500 - 1) \\times 15\\text{ ns} = 504 \\times 15\\text{ ns} = 7,560\\text{ ns}.$$\n2. **Non-pipelined execution time**: $500 \\times (5 \\times 15\\text{ ns}) = 37,500\\text{ ns}$.\n3. **Pipeline Depth Impact**: Increasing pipeline depth reduces clock period and boosts throughput up to $k\\times$, though deeper pipelines incur higher latch overhead and branch misprediction penalties.',
    };
  }
  if (
    ql.includes('what differentiates a scalar processor from a superscalar processor') &&
    ql.includes('multiple instructions per clock cycle')
  ) {
    return {
      answer:
        'b. Superscalar processors can execute multiple instructions per clock cycle, whereas scalar processors execute one instruction per cycle.',
      distractors: [
        'a. Scalar processors can execute multiple instructions per clock cycle, whereas superscalar processors execute one instruction per cycle.',
        'c. Scalar processors have multiple ALUs, whereas superscalar processors have only one ALU.',
        'd. Superscalar processors do not use pipelining, whereas scalar processors rely heavily on pipelining.',
      ],
      explanation:
        'A **scalar processor** fetches and issues at most one instruction per clock cycle ($\\text{IPC} \\le 1$), whereas a **superscalar processor** uses multiple parallel execution pipelines and functional units to fetch, decode, and execute multiple independent instructions per clock cycle ($\\text{IPC} > 1$).',
    };
  }
  if (ql.includes('172.16.0.0/16') && ql.includes('8 subnets')) {
    return {
      answer:
        'New subnet mask: 255.255.224.0 (/19); 8,190 usable hosts per subnet; Subnets: 172.16.0.0/19, 172.16.32.0/19, 172.16.64.0/19, 172.16.96.0/19, 172.16.128.0/19, 172.16.160.0/19, 172.16.192.0/19, 172.16.224.0/19',
      explanation:
        '1. **Borrowed bits**: To create $8$ subnets, solve $2^n \\ge 8 \\Rightarrow n = 3$ bits.\n2. **New prefix & mask**: $/16 + 3 = /19 \\Rightarrow 255.255.224.0$.\n3. **Block size in 3rd octet**: $2^{8-3} = 32$.\n4. **Usable hosts per subnet**: $2^{32-19} - 2 = 2^{13} - 2 = 8,192 - 2 = 8,190$ hosts.',
    };
  }
  if (ql.includes('192.168.10.0/24') && ql.includes('50 hosts')) {
    return {
      answer: 'Subnet mask: 255.255.255.192 (/26); 4 subnets created; 62 usable hosts per subnet',
      explanation:
        '1. **Host bits needed**: $2^h - 2 \\ge 50 \\Rightarrow h = 6$ host bits ($2^6 - 2 = 62$ usable hosts).\n2. **Subnet bits borrowed**: $8 - 6 = 2$ bits $\\Rightarrow /24 + 2 = /26$ (`255.255.255.192`).\n3. **Subnets ($2^2 = 4$, block size $64$)**: `192.168.10.0/26`, `192.168.10.64/26`, `192.168.10.128/26`, and `192.168.10.192/26`.',
    };
  }
  if (
    ql.includes('192.168.1.0/24') &&
    (ql.includes('four departments') || ql.includes('4 subnets') || ql.includes('60 hosts'))
  ) {
    return {
      answer:
        'Use /26 (255.255.255.192) providing 4 subnets of 62 usable hosts each: 192.168.1.0/26, 192.168.1.64/26, 192.168.1.128/26, and 192.168.1.192/26',
      explanation:
        'Borrowing $2$ bits from `/24` yields `/26` (`255.255.255.192`), which creates $2^2 = 4$ equal subnets, each supporting $2^6 - 2 = 62$ usable host IP addresses.',
    };
  }
  if (ql.includes('echo') && ql.includes('purpose of the') && ql.includes('php')) {
    return {
      answer:
        'The echo statement in PHP outputs one or more strings, variables, or HTML markup expressions directly to the HTTP response stream sent to the client browser.',
      explanation:
        'In PHP, `echo` is a language construct used to output text, variables, or HTML content to the browser (e.g., `echo "Hello, World!";`).',
    };
  }
  if (ql.includes('get and post http methods')) {
    return {
      answer:
        'GET appends form data as URL query parameters (visible in the address bar, length-limited, used for idempotent retrieval), whereas POST sends data inside the HTTP request body (hidden from the URL, supports large payloads/file uploads, and is safer for sensitive or state-changing data).',
      explanation:
        '`GET` exposes parameters in the URL query string (`?user=ali`), while `POST` encapsulates data inside the HTTP request body, supporting large payloads and keeping credentials out of URLs.',
    };
  }
  if (ql.includes('differentiate between string and array')) {
    return {
      answer:
        'An array is a contiguous collection of elements of any specified data type (such as int, float, or objects) accessed by index, whereas a string is specifically a sequence of characters terminated by a null character (\'\\0\' in C-strings) or managed as a text object (std::string).',
      explanation:
        'An array holds homogeneous elements of any type (`int arr[10]`), while a string specifically represents character sequences with dedicated text manipulation operations.',
    };
  }

  if (topic.startsWith('Chapter 1')) {
    if (ql.includes('von neumann') || ql.includes('harvard') || ql.includes('flynn')) {
      return {
        answer:
          "Von Neumann architecture uses a single unified memory and shared bus for both instructions and data, whereas Harvard architecture separates instruction and data memories/buses for simultaneous access; Modified Harvard separates L1 instruction/data caches backed by unified main memory; Flynn's taxonomy classifies systems into SISD, SIMD, MISD, and MIMD.",
        explanation:
          "1. **Von Neumann Architecture**: Single memory space and shared bus between CPU (ALU, Control Unit, Registers) and RAM (subject to the Von Neumann bottleneck).\n2. **Harvard & Modified Harvard**: Separate instruction and data pathways enable concurrent fetch and data access.\n3. **Flynn's Taxonomy**: Classifies architectures into **SISD**, **SIMD**, **MISD**, and **MIMD** based on instruction and data streams.",
      };
    }
    if (
      ql.includes('boolean') ||
      ql.includes('demorgan') ||
      ql.includes('truth table') ||
      ql.includes('logic gate') ||
      ql.includes('circuit') ||
      ql.includes('adder') ||
      ql.includes('buzzer')
    ) {
      return {
        answer:
          "Apply Boolean algebra identities (De Morgan's: (A·B)' = A' + B' and (A+B)' = A'·B', Absorption: A + A·B = A, Distributive: A·(B+C) = A·B + A·C, Complement: A + A' = 1, A·A' = 0) and combinational gate logic (AND, OR, NOT, NAND, NOR, XOR, XNOR) to simplify the expression and construct the truth table/circuit.",
        explanation:
          "1. **Boolean Laws**: De Morgan's Theorems ($\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$ and $\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$), Absorption ($A + A\\cdot B = A$), and Complement ($A + \\overline{A} = 1$).\n2. **Adders**: Half Adder ($\\text{Sum} = A \\oplus B$, $\\text{Carry} = A \\cdot B$); Full Adder ($\\text{Sum} = A \\oplus B \\oplus C_{\\text{in}}$, $C_{\\text{out}} = A \\cdot B + C_{\\text{in}} \\cdot (A \\oplus B)$).",
      };
    }
    if (
      ql.includes('cache') ||
      ql.includes('memory') ||
      ql.includes('amat') ||
      ql.includes('virtual') ||
      ql.includes('tlb') ||
      ql.includes('sram') ||
      ql.includes('dram')
    ) {
      return {
        answer:
          'The memory hierarchy organizes storage from fastest/smallest (CPU Registers → L1/L2/L3 SRAM Cache → Main Memory DRAM → Secondary SSD/HDD) using temporal and spatial locality to minimize Average Memory Access Time (AMAT = Hit Time + Miss Rate × Miss Penalty).',
        explanation:
          'Cache mapping uses **Direct**, **Fully Associative**, or **$k$-Way Set-Associative** mapping with **LRU/FIFO/LFU** replacement, while Virtual Memory uses page tables cached in the **Translation Lookaside Buffer (TLB)**.',
      };
    }
    if (
      ql.includes('risc') ||
      ql.includes('cisc') ||
      ql.includes('isa') ||
      ql.includes('mips') ||
      ql.includes('addressing') ||
      ql.includes('arm') ||
      ql.includes('x86') ||
      ql.includes('datapath')
    ) {
      return {
        answer:
          'An Instruction Set Architecture (ISA) defines the hardware-software interface (registers, instruction formats, addressing modes, and operations); RISC (ARM, MIPS) uses fixed-length load/store instructions executed in single cycles, whereas CISC (x86) uses variable-length complex instructions with direct memory operands.',
        explanation:
          'Addressing modes include **Immediate**, **Register**, **Base/Displacement**, **PC-Relative**, and **Direct** across the 5-stage instruction execution cycle (**IF → ID → EX → MEM → WB**).',
      };
    }
    return {
      answer:
        'I/O systems coordinate data transfer between peripherals and memory via Programmed I/O (polling), Interrupt-Driven I/O, or Direct Memory Access (DMA), while the CPU enforces hardware protection using User Mode (non-privileged instructions) and Kernel Mode (privileged instructions).',
      explanation:
        '**DMA** transfers blocks directly between I/O devices and RAM without continuous CPU intervention, while **Interrupts** (asynchronous hardware events) and **Exceptions** (synchronous traps) transition the CPU safely to Kernel Mode.',
    };
  }

  if (topic.startsWith('Chapter 2')) {
    if (
      ql.includes('hazard') ||
      ql.includes('stall') ||
      ql.includes('forward') ||
      ql.includes('pipeline') ||
      ql.includes('chapati')
    ) {
      return {
        answer:
          'Instruction pipelining overlaps the 5 execution stages (IF, ID, EX, MEM, WB) to increase instruction throughput; pipeline hazards (Structural, Data: RAW/WAR/WAW, and Control/Branch hazards) are mitigated via hardware resource duplication, operand forwarding (bypassing), pipeline stalling (bubbles), and branch prediction.',
        explanation:
          '**Structural hazards** are resolved by separate I-Cache/D-Cache; **Data hazards (RAW)** by operand forwarding from EX/MEM or MEM/WB registers and load-use stalling; **Control hazards** by dynamic branch prediction.',
      };
    }
    if (
      ql.includes('branch') ||
      ql.includes('renam') ||
      ql.includes('unroll') ||
      ql.includes('ilp') ||
      ql.includes('superscalar') ||
      ql.includes('laundry')
    ) {
      return {
        answer:
          'Instruction-Level Parallelism (ILP) executes multiple independent instructions per cycle using superscalar pipelines, out-of-order execution, loop unrolling (reducing loop branch overhead), register renaming (eliminating false WAR and WAW dependencies), and dynamic 1-bit/2-bit saturating counter branch prediction.',
        explanation:
          '**Loop unrolling** reduces branch overhead; **register renaming** eliminates false WAR/WAW name dependencies; **2-bit branch predictors** require two consecutive mispredictions before flipping prediction state.',
      };
    }
    return {
      answer:
        "Thread-Level Parallelism (TLP) and Data-Level Parallelism (DLP/SIMD) scale processor performance across multicore architectures and Simultaneous Multithreading (SMT), while hardware performance counters, compiler optimisations (-O2/-O3, vectorisation), and Amdahl's Law guide bottleneck elimination.",
      explanation:
        'CPU performance satisfies $\\text{CPU Time} = \\text{IC} \\times \\text{CPI} \\times T_{\\text{clock}}$; **TLP/SMT** hides memory latency across threads while **SIMD** processes vector elements in parallel.',
    };
  }

  if (topic.startsWith('Chapter 3')) {
    if (
      ql.includes('osi') ||
      ql.includes('tcp/ip') ||
      ql.includes('encapsulat') ||
      ql.includes('layer')
    ) {
      return {
        answer:
          'The 7-layer OSI model (Physical, Data Link, Network, Transport, Session, Presentation, Application) and 4-layer TCP/IP model (Network Access/Link, Internet, Transport, Application) standardize network communication through top-down encapsulation (Data → Segment → Packet → Frame → Bits) and bottom-up decapsulation.',
        explanation:
          'OSI Layers 5–7 map to the TCP/IP **Application** layer, Layer 4 to **Transport** (TCP/UDP), Layer 3 to **Internet** (IP/ICMP/OSPF), and Layers 1–2 to **Network Access** (Ethernet/Wi-Fi MAC & Physical media).',
      };
    }
    if (
      ql.includes('ip') ||
      ql.includes('subnet') ||
      ql.includes('cidr') ||
      ql.includes('nat') ||
      ql.includes('ipv6') ||
      ql.includes('class')
    ) {
      return {
        answer:
          'IPv4 uses 32-bit addresses divided into network and host portions via subnet masks/CIDR (with RFC 1918 private ranges 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 translated by NAT), while IPv6 uses 128-bit hexadecimal addresses to eliminate address exhaustion and simplify routing.',
        explanation:
          'Borrowing $s$ host bits creates $2^s$ subnets with $2^h - 2$ usable hosts per subnet ($h = 32 - \\text{prefix}$), reserving the first address as the Network ID and the last as the Broadcast address.',
      };
    }
    return {
      answer:
        'Enterprise networks combine wired (Cat6 UTP, fiber optic) and wireless media with Layer 2 switches, Layer 3 routers, VLAN segmentation, dynamic routing protocols (RIP, OSPF, BGP), core network services (DNS, DHCP, VPN, Firewalls), and diagnostic tools (ping, traceroute, Wireshark, Packet Tracer).',
      explanation:
        'Switches forward frames by MAC address within a LAN/VLAN, while routers route IP packets across networks using static routes or dynamic protocols (**RIP**, **OSPF**, **BGP**).',
    };
  }

  if (topic.startsWith('Chapter 4')) {
    if (
      ql.includes('control') ||
      ql.includes('loop') ||
      ql.includes('if') ||
      ql.includes('switch') ||
      ql.includes('fibonacci') ||
      ql.includes('factorial') ||
      ql.includes('prime')
    ) {
      return {
        answer:
          'Use C++ selection statements (if-else, switch-case) and iteration constructs (for, while, do-while) with proper initialization, loop condition, and update expressions:\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cout << "Enter a positive integer: ";\n    cin >> n;\n    long long fact = 1;\n    for (int i = 1; i <= n; ++i) {\n        fact *= i;\n    }\n    cout << "Result = " << fact << endl;\n    return 0;\n}\n```',
        explanation:
          '`if...else` and `switch` control conditional branching, while `for`, `while`, and exit-controlled `do...while` loops repeat statements until the termination condition is met.',
      };
    }
    if (
      ql.includes('array') ||
      ql.includes('pointer') ||
      ql.includes('string') ||
      ql.includes('function') ||
      ql.includes('pass by')
    ) {
      return {
        answer:
          'In C++, functions modularize code via pass-by-value or pass-by-reference (& / pointers *), arrays store contiguous homogeneous elements (1D/2D matrices), and pointers hold memory addresses (& address-of, * dereference):\n```cpp\n#include <iostream>\nusing namespace std;\n\nvoid swapValues(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 10, y = 20;\n    swapValues(&x, &y);\n    cout << "x = " << x << ", y = " << y << endl;\n    return 0;\n}\n```',
        explanation:
          '**Pass-by-value** copies the argument, whereas **pass-by-reference (`&`)** and **pointers (`*`)** allow direct modification of the caller’s variables and efficient array traversal.',
      };
    }
    if (
      ql.includes('class') ||
      ql.includes('object') ||
      ql.includes('constructor') ||
      ql.includes('destructor') ||
      ql.includes('encapsul') ||
      ql.includes('inherit') ||
      ql.includes('polymorph') ||
      ql.includes('abstract')
    ) {
      return {
        answer:
          'In C++ Object-Oriented Programming, classes encapsulate private data attributes with public getter/setter methods, constructors/destructors, inheritance, and virtual functions for runtime polymorphism:\n```cpp\n#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Person {\nprotected:\n    string name;\npublic:\n    Person(string n) : name(n) {}\n    virtual void display() const { cout << "Name: " << name << endl; }\n    virtual ~Person() {}\n};\n\nclass Student : public Person {\nprivate:\n    int id;\npublic:\n    Student(string n, int i) : Person(n), id(i) {}\n    void display() const override {\n        cout << "Student: " << name << " (ID: " << id << ")" << endl;\n    }\n};\n```',
        explanation:
          'C++ OOP combines **Encapsulation** (`private`/`public` access specifiers), **Constructors/Destructors** (`ClassName()` / `~ClassName()`), **Inheritance** (Single, Multilevel, Multiple, Hierarchical, Hybrid), **Polymorphism** (overloading & `virtual` overriding), and **Abstraction** (pure virtual functions `= 0`).',
      };
    }
    return {
      answer:
        'A C++ program consists of preprocessor directives (#include <iostream>), namespace declarations (using namespace std;), variable/constant declarations with strong static data types (int, float, double, char, bool, string), and the main() entry-point function using cin/cout streams.',
      explanation:
        'C++ source code (`.cpp`) is processed by the Preprocessor, compiled into object code, and linked into an executable binary with strict static type checking.',
    };
  }

  if (topic.startsWith('Chapter 5')) {
    return {
      answer:
        'In Java Object-Oriented Programming, classes use private fields, constructors, getters/setters, inheritance (extends), interfaces (implements), method overloading/overriding, and try-catch-finally exception handling:\n```java\npublic class Student {\n    private String name;\n    private int age;\n\n    public Student(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    public String getName() { return name; }\n    public int getAge() { return age; }\n    public void displayInfo() {\n        System.out.println("Student: " + name + ", Age: " + age);\n    }\n    public static void main(String[] args) {\n        Student s = new Student("Amina", 18);\n        s.displayInfo();\n    }\n}\n```',
      explanation:
        'Java compiles `.java` source files into platform-independent **Bytecode (`.class`)** executed by the **JVM**, uses automatic **Garbage Collection** instead of manual destructors, supports single class inheritance (`extends`) and multiple interface inheritance (`implements`), and handles file I/O via `BufferedReader`/`FileWriter` inside `try-catch` blocks.',
    };
  }

  if (topic.startsWith('Chapter 6')) {
    return {
      answer:
        'In Python Object-Oriented Programming, classes define attributes and methods using __init__ and self, support encapsulation (_protected, __private with @property), single/multiple inheritance (super()), duck-typing polymorphism, and ABC abstract base classes:\n```python\nfrom abc import ABC, abstractmethod\n\nclass Account(ABC):\n    def __init__(self, owner: str, balance: float = 0.0):\n        self.owner = owner\n        self.__balance = balance\n\n    def deposit(self, amount: float) -> None:\n        if amount > 0:\n            self.__balance += amount\n\n    def get_balance(self) -> float:\n        return self.__balance\n\n    @abstractmethod\n    def summary(self) -> str:\n        pass\n```',
      explanation:
        'Python OOP uses `__init__(self, ...)` for object construction, name-mangled `__private` attributes for encapsulation, `super()` and C3 Method Resolution Order (MRO) for single/multiple inheritance, duck typing and dunder methods (`__add__`, `__str__`) for polymorphism, and `abc.ABC` (`@abstractmethod`) for abstraction.',
    };
  }

  if (topic.startsWith('Chapter 7')) {
    if (
      ql.includes('schedul') ||
      ql.includes('fcfs') ||
      ql.includes('sjf') ||
      ql.includes('round robin') ||
      ql.includes('turnaround') ||
      ql.includes('waiting time')
    ) {
      return {
        answer:
          'CPU Scheduling algorithms (FCFS, SJF/SRTF, Priority, and Round Robin with time quantum q) allocate the processor to ready processes to minimize Average Waiting Time (WT = TAT - BT) and Average Turnaround Time (TAT = CT - AT).',
        explanation:
          '**Turnaround Time** $\\text{TAT} = \\text{CT} - \\text{AT}$ and **Waiting Time** $\\text{WT} = \\text{TAT} - \\text{BT}$. **FCFS** can suffer from the convoy effect, **SJF** minimizes average waiting time, **Round Robin** provides fair time-slicing for interactive systems, and **aging** prevents starvation in Priority scheduling.',
      };
    }
    if (
      ql.includes('deadlock') ||
      ql.includes('banker') ||
      ql.includes('mutex') ||
      ql.includes('semaphore') ||
      ql.includes('synchron')
    ) {
      return {
        answer:
          "Deadlock occurs only when all four Coffman conditions hold simultaneously (Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait) and is handled by breaking a condition (Prevention), using Banker's Algorithm safe-state checks (Avoidance), or Resource Allocation Graph cycle detection and recovery.",
        explanation:
          'Mutexes and Semaphores (`wait()`/`signal()`) synchronize critical sections; **Deadlock Prevention** negates one of the four Coffman conditions, while **Banker’s Algorithm** ensures the system remains in a **Safe State**.',
      };
    }
    return {
      answer:
        'An Operating System manages processes (5-state lifecycle: New, Ready, Running, Waiting/Blocked, Terminated via PCB), virtual memory (paging, segmentation, page replacement: FIFO, Optimal, LRU), file systems (contiguous, linked, indexed allocation), and device I/O across monolithic, microkernel, or hybrid kernel architectures.',
      explanation:
        '**Monolithic kernels** run services in kernel space for speed, while **Microkernels** isolate file systems and drivers in user space for reliability; **Paging** eliminates external fragmentation and uses **LRU/Optimal** page replacement.',
    };
  }

  if (topic.startsWith('Chapter 8')) {
    if (
      ql.includes('php') ||
      ql.includes('pdo') ||
      ql.includes('crud') ||
      ql.includes('form') ||
      ql.includes('$_post') ||
      ql.includes('$_get')
    ) {
      return {
        answer:
          'Use PHP Data Objects (PDO) with try-catch exception handling and prepared statements (prepare() and execute() with bound parameters) to securely connect to MySQL and perform SQL-injection-safe CRUD operations:\n```php\n<?php\n$dsn = "mysql:host=localhost;dbname=school_db;charset=utf8mb4";\ntry {\n    $pdo = new PDO($dsn, "root", "", [\n        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC\n    ]);\n    $stmt = $pdo->prepare("INSERT INTO students (name, email) VALUES (:name, :email)");\n    $stmt->execute([\':name\' => \'Asha Ali\', \':email\' => \'asha@elimika.online\']);\n} catch (PDOException $e) {\n    echo "Error: " . $e->getMessage();\n}\n?>\n```',
        explanation:
          'PDO prepared statements (`$pdo->prepare()` with `:named` or `?` placeholders) separate SQL query structure from user input, preventing **SQL Injection** across Create, Read, Update, and Delete (CRUD) operations.',
      };
    }
    if (
      ql.includes('nosql') ||
      ql.includes('mongodb') ||
      ql.includes('redis') ||
      ql.includes('cassandra') ||
      ql.includes('cap theorem') ||
      ql.includes('iot')
    ) {
      return {
        answer:
          'NoSQL databases provide flexible, schema-less horizontal scaling across four categories—Document (MongoDB), Key-Value (Redis), Wide-Column (Cassandra), and Graph (Neo4j)—trading off strict ACID transactions for BASE (Basically Available, Soft state, Eventual consistency) in accordance with the CAP Theorem.',
        explanation:
          'In MongoDB, CRUD operations use `insertOne()`/`insertMany()`, `find()`, `updateOne({ ... }, { $set: { ... } })`, and `deleteOne()`.',
      };
    }
    if (
      ql.includes('sql') ||
      ql.includes('select') ||
      ql.includes('create table') ||
      ql.includes('insert') ||
      ql.includes('join') ||
      ql.includes('ddl') ||
      ql.includes('dml')
    ) {
      return {
        answer:
          'Use SQL DDL (CREATE, ALTER, DROP) to define schemas with Primary and Foreign Key constraints, DML (INSERT, UPDATE, DELETE) to modify records, and DQL (SELECT ... FROM ... JOIN ... WHERE ... GROUP BY ... ORDER BY) to query relational data.',
        explanation:
          '**DDL** defines tables and keys (`PRIMARY KEY`, `FOREIGN KEY ... REFERENCES`), **DML** manipulates rows, and **DQL** retrieves and aggregates relational data across joined tables.',
      };
    }
    return {
      answer:
        'Database design progresses from Conceptual ER Modelling (Entities, Attributes, Primary/Foreign Keys, and 1:1, 1:M, M:N Cardinality Relationships) to Logical Normalization (1NF → 2NF → 3NF/BCNF to eliminate redundancy and insertion/update/deletion anomalies) and Physical DBMS implementation.',
      explanation:
        '**1NF** enforces atomic values and a primary key; **2NF** removes partial dependencies on composite keys; **3NF** removes transitive dependencies between non-key attributes.',
    };
  }

  return {
    answer: `Apply the principles of ${sub} (${topic}) to analyze the system requirements, construct the model or implementation, and verify the solution.`,
    explanation: `In **${topic} (${sub})**, identify the core inputs, constraints, and governing equations or programming constructs required by **${ref}**, then systematically implement and validate each part of the solution.`,
  };
}

function loadRawHtmlFiles(): string[] {
  if (typeof __CS_F5_RAW_HTMLS__ !== 'undefined' && Array.isArray(__CS_F5_RAW_HTMLS__)) {
    return __CS_F5_RAW_HTMLS__;
  }

  try {
    const proc = typeof process !== 'undefined' ? (process as unknown as {
      cwd?: () => string;
      getBuiltinModule?: (id: string) => unknown;
    }) : null;
    if (proc && typeof proc.getBuiltinModule === 'function') {
      const fsMod = proc.getBuiltinModule('fs') as {
        existsSync: (p: string) => boolean;
        readFileSync: (p: string, enc: string) => string;
      } | undefined;
      const pathMod = proc.getBuiltinModule('path') as {
        join: (...parts: string[]) => string;
      } | undefined;
      if (fsMod && pathMod && typeof proc.cwd === 'function') {
        const root = proc.cwd();
        return CS_F5_HTML_FILES.map((file) => {
          const fullPath = pathMod.join(root, 'public', 'assets', 'aistudio', file);
          return fsMod.existsSync(fullPath) ? fsMod.readFileSync(fullPath, 'utf8') : '';
        }).filter(Boolean);
      }
    }
  } catch {
    // ignore node fallback error
  }

  return [];
}

export function buildComputerScienceF5Bank(): ExtractedTextbookExerciseSeed[] {
  const htmlContents = loadRawHtmlFiles();
  const rawItems: Array<{
    topic: string;
    subTopic: string;
    exerciseRef: string;
    question: string;
  }> = [];

  for (const html of htmlContents) {
    if (!html) continue;
    const secRegex = /<section\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/gi;
    let secMatch: RegExpExecArray | null;
    while ((secMatch = secRegex.exec(html)) !== null) {
      const secId = secMatch[1];
      const secContent = secMatch[2];
      const chapter = getChapterFromSectionId(secId);

      const h3Regex = /<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3>|$)/gi;
      let h3Match: RegExpExecArray | null;
      while ((h3Match = h3Regex.exec(secContent)) !== null) {
        const h3Title = decodeEntities(h3Match[1].replace(/<[^>]+>/g, ''))
          .replace(/\s+/g, ' ')
          .trim();
        let blockHtml = h3Match[2];
        blockHtml = blockHtml.replace(/<svg[\s\S]*?<\/svg>/gi, '');
        blockHtml = blockHtml.replace(/<h4>\s*Diagram Reference:[\s\S]*?<\/h4>/gi, '');

        const subTopic = h3Title.includes(':')
          ? h3Title.split(':').slice(1).join(':').trim()
          : h3Title;
        const refPrefix = h3Title.includes(':') ? h3Title.split(':')[0].trim() : h3Title;

        const firstListMatch = blockHtml.match(/<(ol|ul)\b[^>]*>/i);
        if (firstListMatch && firstListMatch.index !== undefined) {
          const listStartIdx = firstListMatch.index;
          const introHtml = blockHtml.slice(0, listStartIdx);
          const restHtml = blockHtml.slice(listStartIdx);

          let depth = 0;
          let listInnerEnd = restHtml.length;
          const listTagRegex = /<\/?(?:ol|ul)\b[^>]*>/gi;
          let lm: RegExpExecArray | null;
          while ((lm = listTagRegex.exec(restHtml)) !== null) {
            const t = lm[0].toLowerCase();
            if (t.startsWith('<ol') || t.startsWith('<ul')) {
              depth++;
            } else {
              depth--;
              if (depth === 0) {
                listInnerEnd = lm.index;
                break;
              }
            }
          }
          const listInner = restHtml.slice(firstListMatch[0].length, listInnerEnd);
          const topLis = extractTopLevelLis(listInner);
          const introClean = htmlToCleanMarkdown(introHtml)
            .replace(/^(Questions?|Instructions?):\s*$/gim, '')
            .trim();

          const isActivitySteps =
            /^Activity\b/i.test(h3Title) &&
            (!/Questions?/i.test(introHtml) ||
              topLis.some((li) =>
                /^Step\s+\d+/i.test(li.replace(/<[^>]+>/g, '').trim())
              ));

          if (isActivitySteps || topLis.length === 1) {
            const fullBody = htmlToCleanMarkdown(blockHtml);
            rawItems.push({
              topic: chapter,
              subTopic,
              exerciseRef: refPrefix,
              question: `${h3Title}\n\n${fullBody}`,
            });
          } else {
            let qNum = 0;
            for (const li of topLis) {
              qNum++;
              const itemClean = htmlToCleanMarkdown(li);
              const fullQuestion = introClean
                ? `${h3Title} (Q${qNum}): ${introClean}\n\n${itemClean}`
                : `${h3Title} (Q${qNum}): ${itemClean}`;
              rawItems.push({
                topic: chapter,
                subTopic,
                exerciseRef: `${refPrefix} Q${qNum}`,
                question: fullQuestion,
              });
            }
          }
        } else {
          const bodyClean = htmlToCleanMarkdown(blockHtml);
          if (bodyClean) {
            rawItems.push({
              topic: chapter,
              subTopic,
              exerciseRef: refPrefix,
              question: `${h3Title}\n\n${bodyClean}`,
            });
          }
        }
      }
    }
  }

  return rawItems.map((item, index) => {
    const solved = solveComputerScienceF5Question(item);
    const isMcq = Array.isArray(solved.distractors) && solved.distractors.length >= 3;
    const options: [string, string, string, string] = isMcq && solved.distractors
      ? [solved.answer, solved.distractors[0], solved.distractors[1], solved.distractors[2]]
      : [
          solved.answer,
          `This option reverses the core architectural or algorithmic principles of ${item.subTopic}.`,
          `This option omits the required constraints, syntax rules, or hardware mechanisms specified in ${item.exerciseRef}.`,
          `This option applies an incompatible model that does not satisfy the requirements of ${item.topic}.`,
        ];

    return {
      id: `cs-f5-item-${index + 1}`,
      cls: 'Form 5',
      subject: 'Computer Science',
      topic: item.topic,
      subTopic: item.subTopic,
      exerciseRef: item.exerciseRef,
      textbookTitle: CS_F5_BOOK,
      question: item.question,
      options,
      correctIndex: 0,
      explanation: solved.explanation,
      hint: `Review ${item.subTopic} in ${item.topic} (${item.exerciseRef}).`,
      isMultipleChoice: isMcq,
    };
  });
}

export const COMPUTER_SCIENCE_F5_BANK: ExtractedTextbookExerciseSeed[] =
  buildComputerScienceF5Bank();
