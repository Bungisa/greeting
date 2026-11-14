export interface ExactCSAnswer {
  answer: string;
  explanation: string;
  distractors?: [string, string, string];
}

export const CS_F5_ANSWERS_PART1: Record<string, ExactCSAnswer> = {
  'Scenario 1.1 Q1': {
    answer: 'By comparing processor clock speed (GHz), number of cores/threads, cache memory size (L1/L2/L3), RAM capacity and speed (e.g., 16 GB+ DDR4/DDR5), storage type (NVMe SSD vs HDD), and dedicated GPU specifications against her workload requirements.',
    explanation: 'Understanding computer architecture enables Neema to evaluate how CPU cores, cache hierarchy, RAM bandwidth, and SSD I/O throughput directly impact multitasking, compilation, and graphics rendering rather than relying on marketing labels.'
  },
  'Scenario 1.1 Q2': {
    answer: 'She should prioritise a multi-core processor (e.g., 8+ cores with high clock speed and large L3 cache), at least 16–32 GB of high-speed RAM, a dedicated GPU (with VRAM for 3D/video rendering), and a fast NVMe SSD for rapid project loading.',
    explanation: 'Graphic design and software development are compute- and memory-intensive: compilers and IDEs benefit from multiple CPU cores and RAM capacity, while rendering and graphic assets rely on GPU acceleration and high-throughput SSD storage.'
  },
  'Scenario 1.1': {
    answer: 'To overcome the Von Neumann bottleneck ("single shared room for instructions and data"), you can add larger/faster CPU Cache memory (which uses a split Modified Harvard L1 Instruction Cache and L1 Data Cache so instructions and data are fetched simultaneously), upgrade RAM capacity to stop disk swap thrashing, replace slow HDDs with SSDs, and close unnecessary background processes.',
    explanation: 'The scenario describes the Von Neumann bus bottleneck where instructions and data contend for the same memory pathway; split instruction/data caches (Modified Harvard architecture) and increased RAM eliminate this bottleneck cost-effectively.'
  },
  'Activity 1.1 Q1': {
    answer: 'The Control Unit (CU) fetches and decodes instructions and directs data flow; the Arithmetic Logic Unit (ALU) executes arithmetic and logical operations; and Registers provide ultra-fast temporary storage for operands, addresses, and intermediate results inside the CPU.',
    explanation: 'The three internal CPU components work in a tight cycle: the CU signals the registers to supply operands to the ALU, the ALU computes the result, and the output is written back to a register or memory.'
  },
  'Activity 1.1 Q2': {
    answer: 'Yes, in the Von Neumann architecture a shared system bus allows the CPU to fetch and execute instructions sequentially through time-division multiplexing (separate fetch and execute phases), though it creates the Von Neumann bottleneck because an instruction fetch and a data memory access cannot occur simultaneously over the same bus.',
    explanation: 'Because instructions and data share a single address and data bus in a Von Neumann machine, the processor must complete the instruction fetch cycle before using the bus for data read/write operations.'
  },
  'Exercise 1.1 Q1': {
    answer: 'Computer organisation and architecture is the study of the internal structure, operational attributes (organisation), and programmer-visible design specifications (architecture, such as instruction set, registers, and addressing modes) of a computer system.',
    explanation: 'Computer architecture defines what the system does as seen by the machine-language programmer (ISA, data types, I/O mechanisms), whereas computer organisation describes how hardware components are interconnected and controlled to realise that architecture.'
  },
  'Exercise 1.1 Q2': {
    answer: 'Its main components are the Central Processing Unit (Control Unit, ALU, and Registers), the Memory System (cache, primary RAM, and secondary storage), the Input/Output (I/O) subsystem, and the System Interconnection Buses (address, data, and control buses).',
    explanation: 'Together these four subsystems implement the fetch-decode-execute cycle and enable communication between the processor, storage hierarchy, and external peripherals.'
  },
  'Activity 1.2': {
    answer: 'Input data from an I/O device is transferred via the I/O controller (using interrupts or DMA) across the system bus into allocated physical/virtual frames in RAM; the CPU then fetches blocks of this data from RAM into cache and internal registers for processing and writes results back to RAM.',
    explanation: 'The operating system memory manager allocates RAM addresses while hardware buses, DMA controllers, and cache controllers coordinate the movement of data between I/O buffers, main memory, and CPU registers.'
  },
  'Exercise 1.2 Q1': {
    answer: 'The CPU acts as the central processing engine that fetches instructions from memory, decodes them via the Control Unit, executes arithmetic and logic operations in the ALU, and coordinates all memory and I/O devices through control signals.',
    explanation: 'Every program instruction and hardware coordination task is driven by the CPU executing the instruction cycle.'
  },
  'Exercise 1.2 Q2': {
    answer: 'Clock speed (measured in GHz) determines how many clock cycles the CPU executes per second, while each core is an independent execution unit; higher clock speed accelerates single-threaded tasks, whereas multiple cores allow simultaneous execution of multiple threads or processes.',
    explanation: 'Overall CPU throughput is a product of instructions per cycle (IPC), clock frequency, and the number of parallel physical/logical cores.'
  },
  'Exercise 1.2 Q3': {
    answer: 'Cache memory (SRAM) sits between the fast CPU registers and slower DRAM main memory, storing frequently and recently accessed instructions and data so the CPU avoids waiting tens of nanoseconds for RAM access.',
    explanation: 'By exploiting temporal and spatial locality, L1/L2/L3 caches achieve hit rates above 90%, drastically lowering the Average Memory Access Time (AMAT).'
  },
  'Exercise 1.2 Q4': {
    answer: 'Volatile memory (such as SRAM cache and DRAM main memory) requires continuous electrical power to retain data and loses its contents when powered off, whereas non-volatile memory (such as ROM, Flash SSD, and magnetic hard disks) retains stored data permanently without power.',
    explanation: 'Volatile memory is used for fast active workspace during execution, while non-volatile memory stores firmware, the operating system, and persistent user files.'
  },
  'Exercise 1.3 Q1': {
    answer: 'In the 8-row truth table for (A, B, C) from 000 to 111: (a) Both AB + AC + ABC and AB + AC produce the identical output column [0, 0, 0, 0, 0, 1, 1, 1] because ABC is absorbed by AB + AC; (b) Both A + (B + C) and (A + B) + C produce the identical output column [0, 1, 1, 1, 1, 1, 1, 1], proving the Associative Law of OR.',
    explanation: 'Comparing the truth table columns across all 8 input combinations (000 to 111) proves logical equivalence.'
  },
  'Exercise 1.3 Q2': {
    answer: 'Truth table for X = A + (BC)̅ across (A, B, C) from 000 to 111: (0,0,0)→1, (0,0,1)→1, (0,1,0)→1, (0,1,1)→0, (1,0,0)→1, (1,0,1)→1, (1,1,0)→1, (1,1,1)→1. Output X is 0 only when A = 0, B = 1, and C = 1 (row 011), and 1 for all other 7 rows.',
    explanation: 'Since (BC)̅ = 0 only when B=1 and C=1, X = A + (BC)̅ evaluates to 0 only when A=0 and BC=1 (i.e., A=0, B=1, C=1).'
  },
  'Exercise 1.3 Q3': {
    answer: 'From Table 1.9, Y = 1 when (A=0, B=1) and when (A=1, B=0), and Y = 0 otherwise. Therefore, the Sum-of-Products Boolean expression is Y = A̅B + AB̅ (which is the Exclusive-OR operation, Y = A ⊕ B).',
    explanation: 'Taking the minterms for rows where Y = 1 (row 01 → A̅B and row 10 → AB̅) gives Y = A̅B + AB̅.'
  },
  'Exercise 1.4 Q1': {
    answer: 'Simplified expressions: (i) ((ABC)̅ + ABC)̅ = (1)̅ = 0 (by Complement and Involution laws); (ii) (BC + B̅C)̅ + AC = (C(B + B̅))̅ + AC = C̅ + AC = C̅ + A; (iii) B + AB + A̅BC = B(1 + A + A̅C) = B; (iv) A̅BC̅ + AC + A̅BC = A̅B(C̅ + C) + AC = A̅B + AC.',
    explanation: 'Applying De Morgan’s Theorem, Complement Law (X + X̅ = 1), and Absorption Law (X + XY = X) reduces each expression to its minimal form.'
  },
  'Exercise 1.4 Q2': {
    answer: 'In the 4-row truth table for (A, B) = (0,0), (0,1), (1,0), (1,1): A·B is [0, 0, 0, 1], so (A·B)̅ is [1, 1, 1, 0]; meanwhile A̅ is [1, 1, 0, 0] and B̅ is [1, 0, 1, 0], so A̅ + B̅ is also [1, 1, 1, 0]. Since both columns are identical across all 4 rows, (A·B)̅ = A̅ + B̅ is proved.',
    explanation: 'De Morgan’s First Theorem states that the complement of a product equals the sum of the complements.'
  },
  'Exercise 1.4 Q3': {
    answer: 'In the 8-row truth table for (A, B, C) from 000 to 111: the product ABC is 1 only on row 111 ([0, 0, 0, 0, 0, 0, 0, 1]), so (ABC)̅ is [1, 1, 1, 1, 1, 1, 1, 0]; similarly, A̅ + B̅ + C̅ is 0 only when A̅=0, B̅=0, and C̅=0 (row 111), giving the exact same column [1, 1, 1, 1, 1, 1, 1, 0].',
    explanation: 'Matching truth-table columns for all 8 input combinations proves the 3-variable De Morgan’s identity (ABC)̅ = A̅ + B̅ + C̅.'
  },
  'Activity 1.9 Q2': {
    answer: 'Yes, the simulator output matches Table 1.11 (x AND y) exactly: the output indicator (bulb/LED) turns ON (logic 1) only when both input switches x and y are set to 1, and remains OFF (logic 0) for inputs (0,0), (0,1), and (1,0).',
    explanation: 'An AND gate requires all inputs to be HIGH (1) to produce a HIGH (1) output, matching the truth table of logical conjunction.'
  },
  'Activity 1.11 Q1': {
    answer: 'When both switches A and B are OFF (A = 0, B = 0), both parallel branches are open, no current flows from the battery to the bulb, and the bulb remains OFF (Output = 0).',
    explanation: 'In a parallel switch circuit (which models an OR gate), when both switches are open (0), there is no closed path for electrical current.'
  },
  'Activity 1.11 Q2': {
    answer: 'When only one switch is ON (either A = 1, B = 0 or A = 0, B = 1), current flows through the closed branch in the parallel loop, completing the circuit so the bulb lights ON (Output = 1).',
    explanation: 'Because switches A and B are wired in parallel (OR gate configuration), closing either switch provides a complete path for current to reach the bulb.'
  },
  'Activity 1.11 Q3': {
    answer: 'When both switches A and B are ON (A = 1, B = 1), current flows through the closed parallel branches and the bulb lights ON (Output = 1); this truth table (0, 1, 1, 1) represents an OR logic gate (Y = A + B).',
    explanation: 'Two switches in parallel implement the inclusive OR operation: the bulb is ON whenever A = 1, B = 1, or both are 1.'
  },
  'Exercise 1.5 Q1': {
    answer: 'Circuit design: Pass C through a NOT gate to get C̅; feed B and C̅ into a 2-input OR gate to get (B + C̅); feed A and (B + C̅) into a 2-input AND gate to produce Y = A · (B + C̅). Output Y is 1 only for (A,B,C) = (1,0,0), (1,1,0), and (1,1,1), and 0 for all other 5 rows.',
    explanation: 'When A = 0, Y = 0 regardless of B and C. When A = 1, Y = 1 unless B = 0 and C = 1 (which makes C̅ = 0 and B + C̅ = 0).'
  },
  'Exercise 1.5 Q2': {
    answer: 'Connect the Door Sensor (D = 1 when opened) and Window Sensor (W = 1 when broken) as the two inputs to a 2-input AND gate (Alarm = D · W), so the alarm output is triggered (1) only when both conditions are simultaneously true.',
    explanation: 'A 2-input AND gate enforces the logical requirement that Condition 1 AND Condition 2 must both be active (HIGH) before the output goes HIGH.'
  },
  'Exercise 1.5 Q3': {
    answer: 'By the Absorption Law of Boolean algebra, Y = C + B · C = C(1 + B) = C. In the 4-row truth table for (B, C) = (0,0), (0,1), (1,0), (1,1), the output Y is 0, 1, 0, 1—identical to input C.',
    explanation: 'Feeding B and C into an AND gate and OR-ing the result with C produces an output that is 1 whenever C is 1 and 0 whenever C is 0.'
  },
  'Exercise 1.5 Q4': {
    answer: 'In Tinkercad Circuits, using digital ICs (74HC08 Quad AND, 74HC32 Quad OR, 74HC04 Hex Inverter) powered at 5V with DIP switches for inputs and an LED with a 220 Ω resistor for output confirms the exact truth tables of each gate.',
    explanation: 'Hardware simulation with TTL/CMOS logic ICs verifies that physical voltage levels (0V = Logic 0, 5V = Logic 1) follow the theoretical Boolean truth tables.'
  },
  'Exercise 1.6 Q1': {
    answer: '(a) AB + B·C̅: AND(A,B) and AND(B, NOT(C)) feeding an OR gate. (b) B̅·C + (B + AC): AND(NOT(B),C) and OR(B, AND(A,C)) feeding an OR gate (simplifies to B + C). (c) AB + A̅·B·C: AND(A,B) and 3-input AND(NOT(A),B,C) feeding an OR gate (simplifies to B(A + C)).',
    explanation: 'Each sum-of-products term is implemented with NOT and AND gates at the first level, and all product terms are combined with an OR gate at the output stage.'
  },
  'Exercise 1.6 Q2': {
    answer: 'Boolean expression from Figure 1.33: F = (A̅ · B) · (B + C), which simplifies by absorption to F = A̅ · B. Truth table output F for (A,B,C) from 000 to 111 is: 0, 0, 1, 1, 0, 0, 0, 0 (F = 1 only when A = 0, B = 1, C = 0 and A = 0, B = 1, C = 1).',
    explanation: 'In Figure 1.33, input A goes through a NOT gate to a top AND gate with B (giving A̅B), inputs B and C go to a bottom OR gate (giving B + C), and a final AND gate multiplies them: F = A̅B(B + C) = A̅B + A̅BC = A̅B.'
  },
  'Exercise 1.6 Q3': {
    answer: 'For inputs 0..3 (A=0), output = input + 2 (010, 011, 100, 101); for inputs 4..7 (A=1), output = input − 3 (001, 010, 011, 100). Simplified Boolean expressions: X = A̅B + BC, Y = B̅C + BC̅ = B ⊕ C, and Z = AC̅ + A̅C = A ⊕ C.',
    explanation: 'Listing the 8 rows of (A,B,C) → (X,Y,Z): 000→010, 001→011, 010→100, 011→101, 100→001, 101→010, 110→011, 111→100. K-map simplification yields X = A̅B + BC, Y = B ⊕ C, and Z = A ⊕ C.'
  },
  'Exercise 1.7 Q1': {
    answer: 'Half Adder Truth Table for inputs (A, B): (0,0) → Sum=0, Carry=0; (0,1) → Sum=1, Carry=0; (1,0) → Sum=1, Carry=0; (1,1) → Sum=0, Carry=1. Boolean expressions: Sum (S) = A̅B + AB̅ = A ⊕ B (XOR gate) and Carry (C) = A · B (AND gate).',
    explanation: 'A half adder adds two single binary bits using an XOR gate for the Sum bit and an AND gate for the Carry-out bit.'
  },
  'Exercise 1.7 Q2': {
    answer: 'Boolean algebra is essential in digital systems because it provides a systematic mathematical framework to model binary logic circuits and simplify complex Boolean expressions into equivalent forms with fewer gates and inputs, reducing hardware cost, power consumption, PCB area, and propagation delay.',
    explanation: 'Gate minimization directly translates simplified algebraic terms into cheaper, faster, and more reliable integrated circuits.'
  },
  'Exercise 1.7 Q3': {
    answer: '(a) AB + AB̅ + BC + AC = A(B + B̅) + BC + AC = A + AC + BC = A + BC. (b) A̅ + AB + C̅ + (BC)̅ = (A̅ + B) + C̅ + B̅ + C̅ = A̅ + (B + B̅) + C̅ = 1. (c) A + A̅B = (A + A̅)(A + B) = A + B. (d) (ABC)̅ + AC + ABC = ((ABC)̅ + ABC) + AC = 1 + AC = 1.',
    explanation: 'Using the Complement Law (X + X̅ = 1), Distributive Law (A + A̅B = A + B), De Morgan’s Theorem ((BC)̅ = B̅ + C̅), and Dominance Law (1 + X = 1) reduces each expression to its minimal form.'
  },
  'Exercise 1.7 Q4': {
    answer: 'Given Y = AB + ABC + A(BC)̅ + AB̅: Factoring AB(1 + C) + AB̅ + A(BC)̅ = AB + AB̅ + A(BC)̅ = A(B + B̅) + A(BC)̅ = A + A(BC)̅ = A(1 + (BC)̅) = A. The simplified circuit is just a single direct wire from input A to output Y (no gates required).',
    explanation: 'Every product term in Y contains A as a factor, and the remaining factors (B + BC + (BC)̅ + B̅) cover all possible combinations of B and C, summing to 1.'
  },
  'Exercise 1.7 Q5': {
    answer: '(a) Y = A(B + AB) + AC = AB + AC = A(B + C) (implemented with one OR gate for B+C feeding one AND gate with A). (b) Y = A(A + B)(A̅ + B̅) = A(A̅ + B̅) = AA̅ + AB̅ = AB̅ (one NOT gate on B and one AND gate). (c) Y = (ABC)̅ + (ACC)̅ + ABC = ((ABC)̅ + ABC) + (AC)̅ = 1 + (AC)̅ = 1 (constant HIGH logic 1).',
    explanation: 'Applying Absorption (B + AB = B), Idempotence (CC = C), Complement (AA̅ = 0 and X + X̅ = 1), and Dominance (1 + X = 1) yields the minimal circuits.'
  },
  'Scenario 1.3 (Memory Hierarchy) Q1': {
    answer: 'Signs and labels in a library act like memory addresses and cache tags in a computer: they uniquely identify the exact location of every item so the processor (or reader) can locate data directly without scanning the entire storage space.',
    explanation: 'Just as aisle signs and call numbers index books, memory addresses, page tables, and cache tags allow hardware controllers to retrieve specific words in nanoseconds.'
  },
  'Scenario 1.3 (Memory Hierarchy) Q2': {
    answer: 'Library shelves arranged by frequency of use mirror the computer memory hierarchy: a small desk/reserve shelf holds actively used books (Registers & L1/L2 Cache), main floor shelves hold current study books (RAM), and large basement archives store vast collections (SSD/HDD secondary storage).',
    explanation: 'Organising storage in tiers balances speed, capacity, and cost per bit by keeping frequently accessed data (locality of reference) in the fastest, closest tier.'
  },
  'Exercise 1.8 Q1': {
    answer: 'AMAT = Hit Time + (Miss Rate × Miss Penalty) = 4 ns + (0.05 × 40 ns) = 4 ns + 2 ns = 6 ns.',
    explanation: 'With a hit rate of 95%, the miss rate is 1 − 0.95 = 0.05 (5%). Multiplying the 5% miss rate by the 40 ns miss penalty adds only 2 ns to the 4 ns cache hit time, giving an Average Memory Access Time of 6 ns.'
  },
  'Exercise 1.8 Q2': {
    answer: 'Cache memory (SRAM) provides ultra-fast access (1–4 ns) to instructions and data currently executing in the CPU; Main memory (DRAM) holds active programs and OS data structures (40–100 ns, gigabytes in size); and Secondary storage (SSD/HDD) provides non-volatile, high-capacity (terabytes) long-term storage for files and applications.',
    explanation: 'Each tier complements the others: fast, expensive SRAM feeds the CPU core, medium-speed DRAM holds working sets, and low-cost non-volatile storage preserves all system data.'
  },
  'Exercise 1.8 Q3': {
    answer: 'SRAM uses 6-transistor flip-flops that need no refreshing (ultra-fast, expensive, low density → ideal for L1/L2/L3 cache); DRAM uses 1-transistor-1-capacitor cells requiring periodic refresh (moderate speed, higher density, lower cost → ideal for main RAM); Flash uses floating-gate transistors (non-volatile, fast random reads, shock-resistant → SSDs/mobile storage); Magnetic disks use spinning platters (non-volatile, lowest cost per GB, high latency → archival/bulk storage).',
    explanation: 'Physical cell structure dictates access latency, density, volatility, and cost per gigabyte, placing each technology at its optimal level in the hierarchy.'
  },
  'Exercise 1.8 Q4': {
    answer: 'Flash memory removes mechanical moving parts, providing non-volatile storage with microsecond access latency, low power consumption, compact form factors, and high shock resistance—enabling smartphones, laptops with NVMe SSDs, USB drives, and embedded IoT systems.',
    explanation: 'Compared to spinning magnetic disks, NAND flash delivers orders-of-magnitude higher IOPS and durability for portable and enterprise computing.'
  },
  'Exercise 1.9 Q1': {
    answer: 'Cache memory stores copies of frequently used instructions and data close to the CPU core so repeat accesses are served in 1–4 ns instead of waiting 50–100 ns for DRAM; for example, when executing a `for` loop that sums an array, the loop instructions and array elements stay in L1 cache, speeding up execution by over 10×.',
    explanation: 'Without cache, the CPU would stall for dozens of clock cycles on every instruction fetch and operand read from main memory.'
  },
  'Exercise 1.9 Q2': {
    answer: 'Cache memory is built from Static RAM (SRAM) integrated directly onto the CPU die, whereas main memory is built from Dynamic RAM (DRAM) on external DIMM modules. Cache is faster because SRAM flip-flops do not require capacitor recharging or off-chip bus traversal, and smaller because each SRAM cell uses 6 transistors (taking much more silicon area and cost per bit than a 1T-1C DRAM cell).',
    explanation: 'Keeping the cache small also shortens address decoding paths and wire delays inside the processor.'
  },
  'Exercise 1.9 Q3': {
    answer: 'Locality of reference makes a small cache achieve >90% hit rates: Temporal locality means recently accessed items are likely to be accessed again soon (e.g., a loop counter variable `i`), while Spatial locality means items near a recently accessed address are likely to be needed next (e.g., sequential elements `arr[0], arr[1], arr[2]` fetched together in one cache line).',
    explanation: 'Caches exploit temporal locality by retaining recently used blocks and spatial locality by fetching multi-word cache lines (e.g., 64 bytes) on each miss.'
  },
  'Exercise 1.9 Q4': {
    answer: 'A cache hit occurs when the requested data is found in the cache (served in a few clock cycles); a cache miss occurs when the data is absent, stalling the CPU while the block is fetched from slower lower-level memory (miss penalty). Replacement algorithms (LRU, FIFO, Random) decide which existing cache line to evict when a new block must be loaded into a full cache.',
    explanation: 'An effective replacement policy like Least Recently Used (LRU) evicts lines least likely to be needed soon, maximising the hit ratio.'
  },
  'Exercise 1.10 Q1': {
    answer: 'The Least Recently Used (LRU) replacement algorithm tracks the usage history of cache blocks within a set and, when a cache miss occurs on a full set, evicts the block that has gone the longest time without being accessed.',
    explanation: 'LRU directly applies the principle of temporal locality: blocks accessed recently are likely to be reused soon, whereas the least recently accessed block is least likely to be needed.'
  },
  'Exercise 1.10 Q2': {
    answer: 'If k = 1, k-way set-associative mapping becomes Direct Mapping (1-way set-associative), where each set contains exactly 1 cache line and every main memory block maps to only one specific cache line (Line = Block Number mod Number of Lines).',
    explanation: 'In 1-way set-associative mapping, the number of sets equals the total number of cache lines, leaving only one placement choice per memory block.'
  },
  'Exercise 1.10 Q3': {
    answer: 'A fully associative cache has only 1 set (containing all cache lines/blocks), allowing any main memory block to be placed in any available line within the entire cache.',
    explanation: 'Because all cache lines belong to a single set, there are no index bits—only Tag and Word Offset bits—and all tags are compared in parallel.'
  },
  'Exercise 1.11 Q1': {
    answer: 'Keep high-demand reference books, current course textbooks, and recently returned books on the front reference shelves (acting like L1/L2 cache using LRU retention), and move rarely borrowed or older volumes to the back storage room (main/secondary memory), fetching whole topic bundles when a new subject is requested.',
    explanation: 'This mirrors cache management using temporal locality (keeping recently read books up front) and spatial locality (grouping related books together).'
  },
  'Exercise 1.11 Q2': {
    answer: 'The slow opening is caused by a high miss penalty: the document was not in RAM/cache and had to be read from a slow or fragmented secondary storage disk (or paged from virtual memory swap space) while background processes contended for RAM and disk I/O.',
    explanation: 'When data misses in both cache and RAM (a page fault), the system must fetch it from non-volatile disk storage, which is thousands of times slower than RAM.'
  },
  'Exercise 1.11 Q3': {
    answer: 'If two team members edit local copies of the shared document simultaneously without synchronisation, their cached copies become inconsistent (stale data), just like the cache coherence problem in multiprocessor systems—solved using coherence protocols (such as MESI write-invalidate or write-update) and version locks.',
    explanation: 'In multi-core processors and distributed storage, write-through/write-back policies and cache coherence protocols ensure all processors see the most recent write.'
  },
  'Scenario 1.4 Q1': {
    answer: 'Addressing modes are like how a chef obtains ingredients in a recipe: having a pinch of salt right in the recipe step is Immediate addressing, grabbing a tool already in the chef’s hand is Register addressing, walking to a labelled pantry shelf is Direct/Base-Offset memory addressing, and checking a note on a shelf that points to another room is Indirect addressing.',
    explanation: 'Addressing modes specify the rule the CPU uses to locate or compute the effective address of an instruction’s operand.'
  },
  'Scenario 1.4 Q2': {
    answer: 'Registers are like the cutting board, chef’s knife, and mixing bowls right on the kitchen counter: they hold the exact ingredients currently being chopped or mixed for instant access, whereas the pantry (RAM) and cold storage (disk) hold bulk ingredients further away.',
    explanation: 'CPU registers sit directly inside the processor core and provide single-cycle access to operands used by the ALU.'
  },
  'Scenario 1.4 Q3': {
    answer: 'Understanding the ISA allows programmers and compiler writers to select optimal instructions, registers, and addressing modes for high-performance code, and enables computer engineers to design compatible processors, compilers, and operating systems that run across hardware generations.',
    explanation: 'The ISA is the contract between software and hardware; mastering it is essential for assembly optimization, compiler design, and hardware implementation.'
  },
  'Exercise 1.12 Q1': {
    answer: 'RISC vs CISC comparison: RISC (e.g., ARM, MIPS, RISC-V) uses a small set of simple, fixed-length (32-bit) instructions that execute in 1 clock cycle, load/store memory architecture, many general-purpose registers, and simpler hardware with compiler-driven optimization; CISC (e.g., Intel x86) uses a large set of complex, variable-length instructions that take multiple cycles, allows direct memory-to-memory operations, uses fewer registers, and relies on complex microcode hardware.',
    explanation: 'RISC streamlines the hardware datapath for uniform pipelining and energy efficiency, whereas CISC packs complex operations into single instructions for higher code density.'
  },
  'Exercise 1.12 Q2': {
    answer: 'Example: Apple M3 / Qualcomm Snapdragon Elite uses the ARMv8/ARMv9 (RISC) ISA for high performance per watt and long battery life in laptops and smartphones, whereas Intel Core i7/AMD Ryzen 7 uses the x86-64 (CISC) ISA for backward compatibility with decades of desktop/server software and high peak throughput.',
    explanation: 'Modern x86 CPUs internally decode CISC instructions into RISC-like micro-operations (µops), while ARM processors natively execute fixed-length RISC instructions.'
  },
  'Activity 1.15 Q1': {
    answer: 'In the MIPS program, `$t0` and `$t1` are used as temporary registers to hold input operands and intermediate values, while `$s0` and `$s1` (saved registers) are used to store the final computed results.',
    explanation: 'By MIPS register convention, `$t0–$t9` hold temporary values that need not be preserved across function calls, whereas `$s0–$s7` hold saved program variables and results.'
  },
  'Activity 1.15 Q2': {
    answer: 'The `li` (load immediate) instruction loads a constant numerical value directly from the instruction itself into a target register (e.g., `li $t0, 15` places the constant 15 into register `$t0` without accessing data memory).',
    explanation: '`li` is a MIPS pseudo-instruction (translated to `addi` or `ori`) that initialises registers with immediate constants.'
  },
  'Activity 1.15 Q3': {
    answer: 'The `add` and `sub` instructions read two source registers, perform 32-bit integer addition or subtraction inside the ALU, and write the result directly into the destination register (e.g., `add $s0, $t0, $t1` computes `$s0 = $t0 + $t1`).',
    explanation: 'In a load/store RISC architecture like MIPS, all arithmetic instructions operate exclusively on values held in registers.'
  },
  'Activity 1.15 Q4': {
    answer: '`li` initialises a register with a constant; `lw` (load word) copies data from a RAM address into a register; `add`/`sub` manipulate values between registers via the ALU; and `sw` (store word) writes a register’s value back to RAM.',
    explanation: 'This load-compute-store workflow is the hallmark of RISC register-register architectures.'
  },
  'Activity 1.15 Q5': {
    answer: 'Registers sit on the CPU die and operate at full processor clock speed (0 wait states, ~0.3–1 ns access), so keeping variables in registers eliminates slow off-chip bus transfers to RAM and allows the ALU to execute one instruction per cycle.',
    explanation: 'Minimising memory traffic by maximising register reuse is one of the highest-impact compiler optimisations.'
  },
  'Exercise 1.13 Q1': {
    answer: 'Datapath functional units: (1) Program Counter (PC): 32-bit register holding the address of the next instruction; (2) Instruction Memory: read-only memory unit that outputs the 32-bit instruction at address PC; (3) Adder: increments PC by 4 (`PC + 4`) or computes branch target addresses; (4) Register File: array of 32 registers with two read ports and one write port; (5) ALU: executes arithmetic/logical operations (`add`, `sub`, `AND`, `OR`) on register/immediate operands.',
    explanation: 'Together these five functional units form the single-cycle execution datapath for R-type and I-type MIPS instructions.'
  },
  'Exercise 1.13 Q2': {
    answer: 'Execution cycle for `lw $t0, offset($s1)`: (1) Fetch: Read instruction from Instruction Memory at PC and increment PC = PC + 4; (2) Decode & Register Read: Read base address from register `$s1` and sign-extend the 16-bit offset to 32 bits; (3) Execute (Address Calculation): ALU adds base register `$s1` + sign-extended offset to form the effective memory address; (4) Memory Access: Read 32-bit word from Data Memory at that effective address; (5) Write Back: Write the loaded word into destination register `$t0`.',
    explanation: 'Unlike R-type arithmetic instructions (which skip Data Memory and write the ALU result to a register), `lw` uses all five datapath stages.'
  },
  'Exercise 1.13 Q3': {
    answer: 'The sign extension unit converts a 16-bit signed immediate operand (from an I-type instruction) into a 32-bit signed value by replicating its most significant bit (sign bit, bit 15) into the upper 16 bits (bits 16–31). It is necessary whenever a 16-bit immediate constant or memory offset (which may be negative in two’s complement) is added to a 32-bit register inside the 32-bit ALU (e.g., `addi`, `lw`, `sw`, `beq`).',
    explanation: 'Replicating the sign bit preserves both positive and negative two’s complement values when widening from 16 bits to 32 bits.'
  },
  'Exercise 1.14 Q1': {
    answer: 'Immediate addressing mode (e.g., `addi $t0, $t0, 50`), because the speed boost is a fixed constant value known at compile time and embedded directly inside the instruction.',
    explanation: 'Immediate addressing avoids any extra memory or register lookup by storing the constant operand in the instruction field itself.'
  },
  'Exercise 1.14 Q2': {
    answer: 'Register addressing mode (and Direct/Base-Register memory addressing to save it), because the car’s coordinates and velocity are updated every frame in CPU registers (`add $s0, $s0, $t1`) for maximum speed and stored at a known memory location.',
    explanation: 'Variables updated on every frame of a game loop are kept in registers so the ALU can recompute coordinates in a single clock cycle.'
  },
  'Exercise 1.14 Q3': {
    answer: 'Indexed / Base-Offset addressing mode (e.g., `lw $t2, Base($t1)`), where the base address points to the start of the difficulty array and an index register holds the offset corresponding to the player’s current performance level.',
    explanation: 'Array element lookup (`difficulty[level]`) is naturally implemented by adding a dynamic index register (scaled by element size) to the array’s base address.'
  },
  'Exercise 1.14 Q4': {
    answer: 'Register Indirect or Base-Displacement addressing mode, using a pointer register that steps through the memory addresses of active obstacle objects to load their bounding-box coordinates for comparison with the car’s register values.',
    explanation: 'Iterating through a dynamic list or array of obstacles in memory relies on a register holding the memory pointer to each obstacle structure.'
  },
  'Exercise 1.14 Q5': {
    answer: 'By keeping frequently updated game variables (car position, speed, score) in CPU registers (Register addressing) and embedding constants in instructions (Immediate addressing), the game minimises slow RAM accesses and reduces CPU cycles and battery drain on mobile devices.',
    explanation: 'Register and immediate addressing modes execute within a single cycle without stalling on data memory reads.'
  },
  'Exercise 1.14 Q6': {
    answer: 'PC-Relative addressing mode (or Auto-increment addressing): PC-Relative addressing (`Target = PC + 4 + 4 × offset`) is used in conditional branch instructions (`beq`/`bne`) to jump to game-over or lap-complete routines, while Auto-increment addressing automatically advances a pointer register as the game renders a stream of track vertices.',
    explanation: 'PC-relative addressing allows compact 16-bit branch offsets and position-independent code.'
  },
  'Exercise 1.15 Q1': {
    answer: 'An ARM processor (RISC architecture), because wearable fitness trackers run on tiny batteries and require ultra-low power consumption, minimal heat dissipation (no cooling fan), and compact System-on-Chip (SoC) integration for sensors and Bluetooth.',
    explanation: 'ARM’s simplified RISC pipeline consumes a fraction of the power of x86 CISC processors, enabling multi-day battery life in wearables.'
  },
  'Exercise 1.15 Q2': {
    answer: 'Recent developments include hybrid big.LITTLE / performance-and-efficiency core architectures (such as Apple M-series on ARMv9 and Intel 12th–14th Gen Alder/Raptor Lake on x86) as well as dedicated on-die Neural Processing Units (NPUs) for hardware-accelerated AI workloads.',
    explanation: 'Both ARM and x86 now combine high-performance cores for heavy tasks with low-power efficiency cores for background tasks, narrowing the gap between mobile and desktop computing.'
  },
  'Exercise 1.15 Q3': {
    answer: 'Arguing for ARM: superior energy efficiency (performance-per-watt), simpler RISC decoding, dominant ecosystem in mobile/IoT, and scalable cloud/laptop performance (Apple Silicon, AWS Graviton). Arguing for x86: unmatched legacy software compatibility, mature enterprise/gaming ecosystems, and extreme peak single-thread and multi-core throughput in workstations and servers.',
    explanation: 'Neither architecture is universally superior; ARM leads in energy-constrained and mobile/cloud-native deployments, while x86 leads in high-TDP desktop gaming and legacy enterprise workloads.'
  },
  'Scenario 1.3 (I/O Systems) Q1': {
    answer: 'Individual customer table orders are handled via Interrupt-Driven I/O: when a customer places an order, the waiter sends a brief alert (interrupt) to the chef, who pauses current prep briefly to acknowledge the ticket rather than continuously walking to tables to check (polling).',
    explanation: 'Small, sporadic events (like keystrokes, mouse clicks, or single table orders) are handled efficiently by interrupts, whereas bulk transfers (like unloading a delivery truck) use DMA.'
  },
  'Scenario 1.3 (I/O Systems) Q2': {
    answer: 'Using Interrupt Priority Levels (and Non-Maskable Interrupts): the fire alarm is treated as a highest-priority Non-Maskable Interrupt (NMI) that immediately preempts all kitchen tasks and food delivery handling until safety is restored.',
    explanation: 'Processors assign priority levels to interrupt lines so critical hardware faults, power failures, or safety timers preempt lower-priority I/O interrupts.'
  },
  'Scenario 1.3 (I/O Systems) Q3': {
    answer: 'Restricting the master control panel to the head chef prevents untrained staff from accidentally shutting down power or gas for the whole restaurant; in a CPU, Privileged Instructions (executed only by the OS kernel in Supervisor/Kernel Mode) prevent user programs from directly altering page tables, disabling interrupts, or halting the CPU.',
    explanation: 'Dual-mode operation (User mode vs Kernel mode) isolates user applications so a buggy or malicious program cannot crash the system or access another process’s memory.'
  },
  'Exercise 1.16 Q1': {
    answer: 'Because DMA transfers data directly between an I/O device and main memory (RAM) without passing through the CPU, cached copies in L1/L2 cache can become stale (cache incoherence)—Either the cache holds old data after a DMA read from disk, or RAM holds old un-flushed data before a DMA write to a device.',
    explanation: 'Operating systems and hardware solve DMA cache incoherence by flushing/invalidating dirty cache lines before DMA transfers or using hardware cache-snooping protocols.'
  },
  'Exercise 1.16 Q2': {
    answer: 'Adding a DMA controller increases die area, bus arbitration logic, pin count, and power consumption; for tiny, low-cost embedded microcontrollers (e.g., a simple digital thermometer or toaster controller) that only read a few bytes per second, Programmed or Interrupt-Driven I/O is cheaper and sufficient.',
    explanation: 'DMA is cost-effective when high-volume, high-speed transfers (disk, network, audio/video) would otherwise saturate the CPU.'
  },
  'Exercise 1.16 Q3': {
    answer: 'In networking, Network Interface Cards (NICs) use scatter-gather DMA to place incoming Ethernet packets directly into RAM ring buffers; in multimedia, sound cards and GPUs stream audio samples and 4K video frames from RAM without CPU intervention; in scientific computing, NVMe SSDs and InfiniBand RDMA move gigabytes of dataset matrices directly into memory.',
    explanation: 'Without DMA, gigabit networking and 60 fps 4K video playback would consume 100% of CPU cycles just copying bytes.'
  },
  'Exercise 1.16 Q4': {
    answer: 'DMA Transfer Steps: (1) CPU initializes DMA controller registers (source I/O port, destination RAM start address, byte count, read/write control); (2) CPU issues start command and continues executing other processes; (3) DMA controller requests bus access from the bus arbiter and transfers words directly between device and RAM while decrementing the counter; (4) When byte count reaches 0, DMA controller sends a single completion interrupt to the CPU.',
    explanation: 'The CPU is involved only at the very beginning (setup) and the very end (interrupt acknowledgment) of the entire block transfer.'
  },
  'Exercise 1.17 Q1': {
    answer: 'In MIPS Coprocessor 0 (`CP0`), the `Status` register (`$12`) controls global interrupt enable (bit 0 `IE`), exception level (bit 1 `EXL`), user/kernel mode (bit 4 `UM`), and an 8-bit interrupt mask (`IM`, bits 8–15) that enables/disables specific interrupt lines; the `Cause` register (`$13`) records pending interrupts (bits 8–15 `IP`) and a 5-bit Exception Code (`ExcCode`, bits 2–6) identifying the exact cause (e.g., 0 = hardware interrupt, 8 = syscall, 12 = arithmetic overflow).',
    explanation: 'When an exception occurs, the MIPS exception handler inspects `Cause.ExcCode` and `Cause.IP` masked by `Status.IM` to determine which routine to run.'
  },
  'Exercise 1.17 Q2': {
    answer: 'In polled interrupts (used in basic MIPS), all interrupts jump to a single general exception address and software must check registers to identify the interrupting device (simpler hardware, higher latency); in vectored interrupts (used in x86/ARM), the interrupting device supplies an interrupt vector number that indexes directly into an Interrupt Vector Table (IVT/IDT) to jump straight to that device’s specific Interrupt Service Routine (faster response, slightly more complex interrupt controller hardware).',
    explanation: 'Vectored interrupts eliminate software polling overhead, which is crucial when tens of peripherals share the system.'
  },
  'Exercise 1.18 Q1': {
    answer: 'Table 1.17 completions: (1) Changing the recipe book (modifying Control Register CR3 / paging table): `MOV CR3, EAX` (or `MOV CR3, reg`); (2) Checking the oven temperature (reading a byte from I/O port in DX into AL): `IN AL, DX`; (3) Turning off the stove (putting the processor into a low-power halt state): `HLT`.',
    explanation: 'In x86 architecture, `MOV CR3`, `IN`/`OUT` (when I/O privilege level restricts user access), and `HLT` are privileged ring-0 instructions.'
  },
  'Exercise 1.18 Q2': {
    answer: 'If user programs had unrestricted access to privileged instructions, any buggy or malicious application could overwrite page tables (`CR3`) to read other users’ passwords, disable interrupts (`CLI`) to freeze the OS scheduler, access raw disk sectors via I/O ports, or execute `HLT` to shut down the entire computer.',
    explanation: 'Restricting privileged instructions to Kernel Mode enforces process isolation, memory protection, and multi-user system stability.'
  },
  'Exercise 1.18 Q3': {
    answer: 'The user program issues a System Call (`SYSCALL` / `INT 0x80` / trap), which safely switches the CPU from User Mode to Kernel Mode and transfers control to the Operating System kernel; the OS validates the request’s permissions, executes the privileged operation on the program’s behalf, and returns the result to User Mode.',
    explanation: 'System calls act as the controlled service window between untrusted user applications and privileged OS hardware routines.'
  },
  'Exercise 1.19 Q1': {
    answer: 'The primary function of the memory system is to store instructions and data in an organised hierarchy (registers, cache, main RAM, and secondary storage) and supply them to the processor rapidly and reliably during program execution.',
    explanation: 'Without the memory hierarchy, the CPU would have nowhere to hold running code, active variables, or persistent files.'
  },
  'Exercise 1.19 Q2': {
    answer: 'The I/O system connects the internal processor and memory to the external world—enabling human interaction (keyboards, displays), persistent storage access (disks), and network communication—while managing speed differences through buffering, interrupts, and DMA.',
    explanation: 'A computer cannot receive input or deliver useful output without its I/O controllers and peripheral interfaces.'
  },
  'Exercise 1.19 Q3': {
    answer: 'Key responsibilities include address mapping and allocation, maintaining fast access via caching (locality of reference), enforcing memory protection and virtual memory isolation between processes, and ensuring data coherence across cache levels and RAM.',
    explanation: 'The memory subsystem collaborates with the OS MMU (Memory Management Unit) to translate virtual addresses to physical frames securely.'
  },
  'Exercise 1.19 Q4': {
    answer: 'The I/O system uses device controllers, device drivers, I/O ports/memory-mapped registers, buses (PCIe, USB), interrupts, and DMA controllers to translate CPU commands into device-specific electrical/protocol signals and buffer asynchronous data streams.',
    explanation: 'Device controllers decouple the fast digital CPU bus from slower mechanical or serial external peripherals.'
  },
  'Exercise 1.19 Q5': {
    answer: 'Common challenges include the CPU–memory speed gap ("memory wall"), cache coherence in multi-core systems, I/O bottlenecks with slow peripherals, and security/isolation risks; modern architectures address these using multi-level caches (L1/L2/L3), hardware prefetching, DMA/RDMA, PCIe high-speed lanes, and MMU/IOMMU hardware protection.',
    explanation: 'Architectural innovations continuously hide latency and increase bandwidth between compute cores, memory, and I/O.'
  },
  'Revision Exercise 1 Q1': {
    answer: 'Design the architecture with massively parallel SIMD/tensor cores (GPU/NPU accelerators) for matrix multiplication, High-Bandwidth Memory (HBM) stacked close to the processor to prevent memory bottlenecks, large on-chip SRAM scratchpads, and hardware support for reduced-precision data types (FP16/BF16/INT8).',
    explanation: 'AI and ML workloads are dominated by dense linear algebra (matrix-vector multiplications) and massive weight transfers that benefit from tensor units and high memory bandwidth.'
  },
  'Revision Exercise 1 Q2': {
    answer: 'Hardware architectures face speculative execution side-channel attacks (such as Spectre and Meltdown, which leak private memory via cache timing), DMA attacks from rogue PCIe devices, and Rowhammer DRAM bit-flip attacks; mitigating them requires strict hardware privilege checks before speculative cache loads, IOMMU protection, and ECC memory.',
    explanation: 'Security must be built into microarchitectural state (caches, branch predictors, and memory controllers), not just software.'
  },
  'Revision Exercise 1 Q3': {
    answer: 'Increasing cache size (L1, L2, L3) improves the hit rate (reducing capacity misses), but increases hit latency (longer address decoding and wire delays), consumes more silicon die area, and increases static/dynamic power consumption and manufacturing cost.',
    explanation: 'This is why L1 is kept very small (32–64 KB) for 1–4 cycle latency, while L2 (512 KB–2 MB) and shared L3 (16–64 MB) trade higher latency for larger capacity.'
  },
  'Revision Exercise 1 Q4': {
    answer: 'Increasing cache associativity (e.g., from 2-way to 8-way or 16-way) reduces conflict misses and improves the hit rate, but slightly increases hit time and power consumption because more tag comparators and multiplexers must operate in parallel on every access.',
    explanation: 'Higher associativity gives the replacement policy more choices per set, eliminating thrashing when multiple active addresses map to the same set.'
  },
  'Revision Exercise 1 Q5': {
    answer: 'The traditional memory hierarchy can adapt to massive datasets by integrating High-Bandwidth Memory (HBM), Non-Volatile Memory Express (NVMe) storage-class memory, Processing-in-Memory (PIM) / Near-Data Processing (computing directly inside RAM chips to avoid bus transfers), and CXL (Compute Express Link) pooled memory.',
    explanation: 'Moving computation closer to memory (PIM) and widening memory interfaces (HBM/CXL) overcome the energy and latency cost of moving terabytes of data across buses.'
  },
  'Revision Exercise 1 Q6': {
    answer: 'In a cache side-channel attack (such as Flush+Reload or Prime+Probe), a malicious program measures the exact time taken to access specific memory lines: a fast access indicates a cache hit (meaning the victim process recently accessed that address/key table), while a slow access indicates a cache miss, allowing the attacker to infer secret cryptographic keys or private data.',
    explanation: 'Timing differences between cache hits (~4 ns) and cache misses (~60 ns) leak information about a victim process’s memory access patterns.'
  },
  'Revision Exercise 1 Q7': {
    answer: 'Mitigation strategies include hardware cache partitioning (allocating separate cache ways/sets per security domain or process), randomising cache line mapping, disabling speculative loads across privilege boundaries, and writing constant-time cryptographic software whose memory accesses do not depend on secret keys.',
    explanation: 'Both hardware isolation (way partitioning) and constant-time coding eliminate observable timing variations in shared caches.'
  },
  'Revision Exercise 1 Q8': {
    answer: 'Three applications of Flash memory beyond mobile phones: (1) Enterprise NVMe SSD arrays in cloud data centres for real-time database transactions; (2) Automotive black-box telemetry and autonomous driving computers that must withstand vibration and extreme temperatures; (3) Deep-space satellites and medical implants requiring ultra-reliable, zero-moving-part non-volatile storage.',
    explanation: 'Flash memory’s durability, speed, and non-volatility make it suitable for mission-critical industrial, aerospace, and data-centre systems.'
  },
  'Revision Exercise 1 Q9': {
    answer: 'Emerging non-volatile memory technologies include MRAM (Magnetoresistive RAM, using magnetic spin states for near-SRAM speed with non-volatility), ReRAM (Resistive RAM, switching resistance across a dielectric), and PCM / 3D XPoint (Phase-Change Memory, offering byte-addressable persistence between DRAM and NAND Flash).',
    explanation: 'These "Storage-Class Memories" aim to combine the nanosecond speed and byte-addressability of DRAM with the non-volatility of Flash.'
  },
  'Revision Exercise 1 Q10': {
    answer: 'For a handheld gaming device, design a custom ARM/RISC-V heterogeneous SoC (performance + efficiency cores) paired with a tile-based integrated GPU, fast LPDDR5X unified memory (high bandwidth for graphics with low power), a multi-level L1/L2/system-level cache to minimise DRAM fetches, and an NVMe Flash SSD for instant game asset streaming.',
    explanation: 'Unified low-power LPDDR5X memory and tile-based caching maximise frame rates while keeping total system power within a 10–15 W handheld battery budget.'
  },
  'Revision Exercise 1 Q11': {
    answer: 'Advantages of a single standardised ISA: universal software portability, unified compiler/OS ecosystems, and lower software development costs. Disadvantages: stifles architectural innovation, prevents domain-specific hardware optimisations (e.g., forcing tiny IoT sensors and supercomputers to use the same instruction set), and locks the industry into legacy design compromises.',
    explanation: 'Diverse computing domains (wearables, smartphones, desktops, AI accelerators) have vastly different power, area, and throughput constraints.'
  },
  'Revision Exercise 1 Q12': {
    answer: 'Example: Google’s Tensor Processing Unit (TPU) uses a custom CISC-like matrix-multiply ISA (or RISC-V with custom vector/DSP extensions) featuring specialized instructions like `MatrixMultiply` and `Activate` that operate on 256×256 systolic arrays in a single instruction, delivering orders-of-magnitude higher AI inference efficiency than general-purpose CPUs.',
    explanation: 'Domain-specific ISAs replace hundreds of scalar loop instructions with single high-level tensor or signal-processing instructions.'
  },
  'Revision Exercise 1 Q13': {
    answer: 'Example: `addi $t0, $s1, 100` (or `lw $t0, 16($s1)`). The 16-bit immediate value (`100` or offset `16`) encoded in bits 0–15 of the instruction is sign-extended to 32 bits and routed via the ALU multiplexer into the second input of the ALU to be added to the value from register `$s1`.',
    explanation: 'In Figure 1.61’s datapath, the `immed` field bypasses the second register read port via a MUX so the ALU can operate on a register and a constant.'
  },
  'Revision Exercise 1 Q14': {
    answer: 'Think of ARM as a fuel-efficient hybrid car designed with simple, streamlined parts (RISC) so your phone or laptop runs all day on a battery without getting hot; think of x86 as a heavy-duty V8 truck (CISC) built to haul massive loads and run decades of existing PC games and complex desktop programs, using more electricity and needing cooling fans.',
    explanation: 'This everyday analogy captures the core trade-off between ARM’s energy-focused RISC design and x86’s high-power, backward-compatible CISC design.'
  },
  'Revision Exercise 1 Q15': {
    answer: 'Lower power consumption in ARM processors reduces electricity demand per device and drastically cuts cooling energy (air conditioning and chillers) in hyperscale cloud data centres, lowering carbon emissions ($CO_2$ footprint) and extending battery lifespan to reduce electronic waste.',
    explanation: 'Across billions of mobile devices and millions of cloud servers, saving even a few watts per chip saves megawatt-hours of electricity globally.'
  },
  'Scenario 2.1 Q1': {
    answer: 'In Mama Chapati’s kitchen, if rolling, frying, and plating each take 1 minute (3 minutes sequentially per chapati), a 3-stage pipeline overlaps all three stages so that once the pipeline is full, 1 chapati is completed every 1 minute—achieving a theoretical speedup of up to 3× (proportional to the number of pipeline stages).',
    explanation: 'Instruction pipelining does not reduce the latency of a single item, but it increases overall throughput by overlapping execution stages.'
  },
  'Scenario 2.1 Q2': {
    answer: 'If the frying pan is still occupied (a structural/resource hazard) or the dough isn’t rolled yet (a data dependency hazard), the pipeline must pause ("stall" or insert a bubble) until the pan is free; this can be mitigated by balancing stage times or adding a second frying pan (additional hardware functional unit).',
    explanation: 'In a CPU pipeline, when a stage takes longer or a resource is busy, upstream stages must stall to prevent overwriting or using incomplete data.'
  },
  'Exercise 2.1 Q1': {
    answer: 'Average cycles per instruction (CPI) = 0.60(1) + 0.20(2) + 0.20(2) = 0.6 + 0.4 + 0.4 = 1.4 cycles/instruction. At a 1 ns clock cycle (10⁹ cycles/s), theoretical throughput = 10⁹ / 1.4 ≈ 7.14 × 10⁸ instructions/second (714.29 MIPS). A higher percentage of `lw`/`sw` instructions increases the average CPI toward 2.0, lowering overall instruction throughput because each memory access introduces an extra stall cycle.',
    explanation: 'Ideal pipelined CPI is 1.0, but because `lw` and `sw` require an extra cycle in the Memory stage (40% of instructions taking 2 cycles), effective CPI becomes 1 + 0.40(1) = 1.4.'
  },
  'Exercise 2.1 Q2': {
    answer: 'An 8-stage pipeline divides the work into smaller steps, allowing a higher clock frequency and higher peak throughput than a 5-stage pipeline; however, it suffers from greater pipeline register latch overhead, longer branch misprediction penalties, and more frequent data/control hazard stalls.',
    explanation: 'Deeper pipelines increase clock speed but amplify the number of wasted cycles whenever a branch misprediction flushes the pipeline.'
  },
  'Exercise 2.2 Q1': {
    answer: 'Read After Write (RAW — True Dependency): instruction j tries to read a register before an earlier instruction i has written its updated value into it. Write After Read (WAR — Anti-Dependency): instruction j writes a new value to a register before an earlier instruction i has finished reading the old value. Write After Write (WAW — Output Dependency): two instructions write to the same register out of order, leaving the wrong final value.',
    explanation: 'RAW is a true data flow dependency common in standard in-order pipelines, whereas WAR and WAW are name dependencies that occur in out-of-order or variable-latency pipelines and can be eliminated by register renaming.'
  },
  'Exercise 2.2 Q2': {
    answer: '(1) `add $r1, $r2, $r3`: None; (2) `sub $r4, $r1, $r5`: RAW data hazard on `$r1` (written by instruction 1); (3) `lw $r6, 100($r6)`: None (reads old `$r6` in ID, writes new `$r6` in WB); (4) `add $r7, $r4, $r8`: RAW data hazard on `$r4` (written by instruction 2); (5) `beq $r7, $r2, Loop`: RAW data hazard on `$r7` (written by instruction 4) + Control hazard (branch); (6) `add $r9, $r10, $r1`: Control hazard (depends on whether `beq` in instruction 5 is taken).',
    explanation: 'Each instruction that consumes a register modified by an immediately preceding instruction creates a Read-After-Write (RAW) dependency, while `beq` introduces a control hazard.'
  },
  'Exercise 2.3 Q1': {
    answer: 'Modern processors mitigate pipeline hazards using hardware Data Forwarding (bypassing ALU/MEM outputs directly to execution inputs), Out-of-Order Execution with Register Renaming (Tomasulo’s algorithm), Tournament/Perceptron Dynamic Branch Predictors (achieving >95% branch accuracy), and Speculative Execution.',
    explanation: 'Combining forwarding with out-of-order scheduling and neural/tournament branch prediction hides almost all pipeline stalls in modern superscalar CPUs.'
  },
  'Exercise 2.3 Q2': {
    answer: 'For `lw $s0, 20($t1)` followed immediately by `sub $t2, $s0, $t3`: (a) Without forwarding, 2 stall cycles (bubbles) are needed until `lw` writes `$s0` in WB; (b) With forwarding from the MEM/WB pipeline register to the ALU input, 1 stall cycle is still required because `lw` only produces data at the end of the MEM stage (cycle 4), whereas `sub` needs `$s0` at the start of its EX stage (cycle 3); (c) Therefore, the statement "You can always avoid stalls in data hazards by forwarding" is FALSE (a load-use data hazard still requires 1 stall cycle unless instructions are reordered).',
    explanation: 'Data cannot be forwarded backward in time: since `lw` retrieves data from memory at the end of stage 4 (MEM) and the immediately following `sub` needs it at the start of stage 3 (EX), one pipeline bubble is unavoidable.'
  },
  'Scenario 2.2 Q1': {
    answer: 'Independent tasks that can run in parallel (ILP) include heating the water while weighing the laundry load, releasing detergent while filling the drum, and updating the digital countdown display while spinning; however, draining water and filling water have a strict dependency and cannot run simultaneously.',
    explanation: 'Instruction-Level Parallelism (ILP) executes independent operations concurrently while respecting true sequential dependencies and safety interlocks.'
  },
  'Scenario 2.2 Q2': {
    answer: 'Turbidity (dirt) sensors, load-weight sensors, and water-level sensors can feed real-time data into the controller concurrently (like branch prediction and dynamic scheduling), allowing the machine to skip unnecessary rinse cycles or adjust spin speed dynamically while another stage is running.',
    explanation: 'Parallel sensor processing mirrors how hardware monitors execution conditions to optimise instruction scheduling on the fly.'
  },
  'Scenario 2.2 Q3': {
    answer: 'ILP means the washing machine performs several non-conflicting steps at the exact same time—such as heating the water while filling the tub—so your laundry finishes in 30 minutes instead of 50 minutes without sacrificing cleanliness.',
    explanation: 'From the user’s perspective, overlapping independent internal operations directly reduces total execution time (wall-clock latency).'
  },
  'Exercise 2.4 Q1': {
    answer: 'Identifying data dependencies determines which instructions can safely execute in parallel and which must execute sequentially: for example, `x = a + b` and `y = c * d` are independent and can execute simultaneously (high ILP), whereas `z = x + 5` has a true RAW dependency on `x` and must wait until `x = a + b` finishes.',
    explanation: 'True data dependencies set the fundamental upper bound on how much Instruction-Level Parallelism can be extracted from a code block.'
  },
  'Exercise 2.4 Q2': {
    answer: 'Sequential execution runs Step 1 (`Load A`), Step 2 (`Load B`), Step 3 (`C = A - B`), Step 4 (`Load D`), Step 5 (`Load E`), Step 6 (`F = D - E`) in 6 serial steps; ILP execution runs (`Load A` || `Load D`) in parallel, (`Load B` || `Load E`) in parallel, and (`C = A - B` || `F = D - E`) on two ALUs in parallel, cutting execution steps in half.',
    explanation: 'Independent subtraction operations have no shared target registers and can be scheduled side-by-side across parallel functional units.'
  },
  'Exercise 2.4 Q3': {
    answer: 'Hardware-based ILP (superscalar out-of-order execution, dynamic branch prediction) works automatically on existing binaries and adapts to runtime cache misses, but increases chip complexity, die area, and power usage; Software-based ILP (compiler instruction scheduling, loop unrolling, VLIW) keeps hardware simpler and more energy-efficient, but depends heavily on compiler sophistication and cannot predict runtime memory latencies.',
    explanation: 'Modern computing combines compiler optimisations (software ILP) with dynamic superscalar cores (hardware ILP).'
  },
  'Exercise 2.4 Q4': {
    answer: 'Real-world disadvantages of aggressive ILP include significantly higher power consumption and heat dissipation, complex verification and silicon cost for out-of-order reservation stations, diminishing performance returns when code has tight pointer-chasing dependencies, and security vulnerabilities (like Spectre) caused by speculative execution.',
    explanation: 'Hardware complexity grows quadratically with issue width ($O(N^2)$ forwarding and dependency checks), limiting practical superscalar issue widths to 4–8 instructions per cycle.'
  },
  'Exercise 2.5 Q1': {
    answer: 'Loop unrolling is not always beneficial because it increases code size (causing Instruction Cache misses), increases register pressure (potentially causing register spilling to slow RAM), and offers little benefit if the loop body is already bottlenecked by memory latency or has serial loop-carried dependencies.',
    explanation: 'Over-unrolling bloats the binary footprint and can exhaust architectural registers, degrading performance instead of improving it.'
  },
  'Exercise 2.5 Q2': {
    answer: 'Unrolling the 100-iteration loop by a factor of 4 reduces loop iterations to 25 (cutting 75% of branch and loop-counter increment instructions) and exposes 4 independent `c = a * b` multiplications per iteration that can execute in parallel across multiple ALUs/SIMD lanes, achieving up to a 2×–4× speedup.',
    explanation: 'Eliminating branch overhead and grouping independent arithmetic operations allows a superscalar processor to fill all its execution units every cycle.'
  },
  'Exercise 2.6 Q1': {
    answer: 'Instruction 1 (`C = A + B`) and Instruction 2 (`E = D - C`) have a true RAW dependency on `C`, so they must execute sequentially; however, Instruction 3 (`H = F * G`) is completely independent of `A, B, C, D, E` and can be issued and executed in parallel with Instruction 1 or Instruction 2 on a superscalar processor.',
    explanation: 'A superscalar scheduler detects that `H = F * G` shares no source or destination registers with the first two instructions and dispatches it to a parallel multiplier unit.'
  },
  'Exercise 2.6 Q2': {
    answer: 'The statement: "Scalar processors execute one instruction per clock cycle, while superscalar processors can execute multiple instructions concurrently."',
    explanation: 'A scalar pipeline fetches and issues at most 1 instruction per cycle (IPC ≤ 1), whereas a superscalar processor contains multiple parallel fetch/decode/execution lanes to achieve IPC > 1.'
  },
  'Exercise 2.7 Q1': {
    answer: 'For `for (int i = 0; i < 10; i++) { if (i > 5) ... }`, the condition `i > 5` is FALSE (Not Taken) for `i = 0, 1, 2, 3, 4, 5` (6 times) and TRUE (Taken) for `i = 6, 7, 8, 9` (4 times). Dynamic branch prediction (specifically a 2-bit predictor) is suitable because the branch stays Not Taken for 6 consecutive iterations and then stays Taken for 4 consecutive iterations.',
    explanation: 'Because the branch outcome exhibits long streaks of identical behavior (6 Not Taken followed by 4 Taken), a dynamic branch history predictor adapts after the transition.'
  },
  'Exercise 2.7 Q2': {
    answer: 'Starting at "Strongly Not Taken" (00), for the first 5 iterations (`i = 0, 1, 2, 3, 4`), the condition `i > 5` is False (Actual Branch = Not Taken) in every iteration. Thus for all 5 rows: Actual Branch = Not Taken, BHT Prediction (before update) = Strongly Not Taken (00), and Outcome State (after execution) remains Strongly Not Taken (00).',
    explanation: 'In a 2-bit saturating counter starting at 00 (Strongly Not Taken), each Not Taken outcome keeps the state saturated at 00.'
  },
  'Exercise 2.7 Q3': {
    answer: '100% prediction accuracy (5 correct predictions out of 5 iterations).',
    explanation: 'In iterations 1 through 5 (`i = 0..4`), the BHT predicts Not Taken (00) and the actual branch `if (i > 5)` is Not Taken all 5 times, yielding 5/5 = 100% accuracy.'
  },
  'Exercise 2.7 Q4': {
    answer: 'High branch prediction accuracy prevents costly pipeline flushes (which waste 10–20 clock cycles per mispredicted branch in deep pipelines), keeping instruction execution units continuously fed in branch-heavy applications like databases, compilers, web browsers, and game engines.',
    explanation: 'Even a drop from 98% to 90% branch prediction accuracy can nearly double the number of wasted stall cycles in a modern processor.'
  },
  'Exercise 2.8 Q1': {
    answer: 'Between `mul r1, r2, r3` and `sub r1, r1, 4` there is both a RAW (Read After Write) dependency and a WAW (Write After Write) dependency on `r1`; between `sub r1, r1, 4` and `add r4, r1, r5` there is a RAW dependency on `r1`. This creates a serial execution bottleneck because each instruction must wait for the previous instruction to finish writing `r1` before it can execute.',
    explanation: 'Reusing register `r1` forces strict sequential execution across all three instructions.'
  },
  'Exercise 2.8 Q2': {
    answer: 'Using temporary physical registers (`T1, T2`), register renaming rewrites the sequence as: `mul T1, r2, r3`, `sub T2, T1, 4`, and `add r4, T2, r5`. If a later block reuses `r1` independently, assigning distinct physical registers (`T1`, `T2`, `T3`) eliminates false WAR and WAW name dependencies so independent instructions can execute out of order.',
    explanation: 'Register renaming maps architectural register names (`r1`) to a larger pool of physical registers (`T1, T2, ...`) to remove false name collisions.'
  },
  'Exercise 2.8 Q3': {
    answer: 'By eliminating false WAR and WAW dependencies (name dependencies caused solely by reusing the same register name), register renaming allows the processor to execute independent instruction chains in parallel and out of order rather than stalling for a shared register to become free.',
    explanation: 'Only true data flow dependencies (RAW) remain after register renaming, unlocking significantly higher Instruction-Level Parallelism.'
  },
  'Exercise 2.8 Q4': {
    answer: 'Out-of-Order (OoO) Execution allows the CPU to inspect a window of upcoming instructions in a reservation station and execute ready instructions immediately whenever anearlier instruction stalls on a cache miss, complementing register renaming (which removes false register conflicts so OoO execution can safely reorder instructions).',
    explanation: 'Register renaming and out-of-order execution work hand-in-hand: renaming removes false dependencies, and the OoO scheduler dispatches ready instructions to idle functional units.'
  },
  'Scenario 2.3 Q1': {
    answer: 'Assign independent party-planning tasks to separate concurrent threads: Thread 1 prepares and sends invitations, Thread 2 decorates the venue, Thread 3 cooks/orders the food, and Thread 4 sets up the music system—allowing all four activities to progress simultaneously.',
    explanation: 'Multithreading decomposes a program into independent tasks that can run concurrently across multiple cores or hardware threads.'
  },
  'Scenario 2.3 Q2': {
    answer: 'Challenges include resource contention (two helpers trying to use the same kitchen oven at once), race conditions (two people spending from the same party budget simultaneously), and deadlocks (each waiting for a tool held by the other); these are mitigated using synchronization primitives (mutex locks on shared resources), clear task partitioning, and a shared task schedule.',
    explanation: 'In multithreaded software, mutexes, semaphores, and atomic operations prevent race conditions and deadlocks when threads share resources.'
  },
  'Exercise 2.9 Q1': {
    answer: 'If Thread B’s mathematical calculation is independent of the downloaded file, there is no data dependency and both threads run at full concurrency (Thread A waiting on network I/O while Thread B uses the CPU ALU); however, if Thread B must calculate statistics on the file being downloaded by Thread A (a producer-consumer RAW dependency), Thread B must wait or process chunks via a synchronized buffer as Thread A downloads them.',
    explanation: 'Overlapping an I/O-bound thread (downloading) with a CPU-bound thread (calculation) is an ideal use case for multithreading.'
  },
  'Exercise 2.9 Q2': {
    answer: 'Simultaneous Multithreading (SMT, e.g., Hyper-Threading) shares a single physical core’s execution units and caches between two logical threads (cheaper hardware, higher core utilization, but threads contend for ALUs and cache); a Multi-Core processor provides physically separate cores with dedicated execution units and L1/L2 caches (higher true parallel speedup for heavy independent tasks, but higher silicon area and power cost).',
    explanation: 'SMTtypically yields a 15–30% throughput boost by filling idle execution slots on one core, whereas N physical cores approach an N× speedup on independent compute-bound tasks.'
  },
  'Exercise 2.9 Q3': {
    answer: 'Operating systems use Preemptive Round-Robin (giving each thread a fixed time quantum for responsive multitasking), Priority-Based Scheduling (running high-priority interactive or real-time threads first), and Multilevel Feedback Queue / Completely Fair Scheduler (CFS, dynamically balancing CPU-bound and I/O-bound threads across cores to maximise throughput and prevent starvation).',
    explanation: 'Thread schedulers balance low response time for interactive threads with high CPU utilization and load balancing across physical and SMT cores.'
  },
  'Exercise 2.9 Q4': {
    answer: 'With SMT on two logical cores, the numbers (`1..5`) from Thread 1 (`print_numbers`) and letters (`A..E`) from Thread 2 (`print_letters`) will execute concurrently and interleave in the output (e.g., `1 A 2 B 3 C 4 D 5 E`), completing faster than running Thread 1 followed sequentially by Thread 2 because while one thread waits on I/O/sleep, the other uses the core’s pipeline.',
    explanation: 'SMT fetches and issues instructions from both logical threads into the shared execution pipeline simultaneously.'
  },
  'Exercise 2.10 Q1': {
    answer: '(a) Image processing: SIMD applies the same filter operation (e.g., brightness or convolution) to 8 or 16 pixel RGB values simultaneously in a single vector instruction. (b) Financial modelling: SIMD evaluates the same Monte Carlo pricing formula across multiple portfolio scenarios in parallel. (c) Text editing (find & replace): While searching a byte buffer can use SIMD string comparison, complex variable-length replacement is more irregular and benefits less than uniform pixel or matrix arrays.',
    explanation: 'Single Instruction, Multiple Data (SIMD) excels when the exact same arithmetic or comparison operation is applied to contiguous arrays of data elements.'
  },
  'Exercise 2.10 Q2': {
    answer: 'Data partitioning splits the millions of user traffic logs into independent subsets (e.g., by geographic region, time window, or user ID hash) so multiple threads or servers can process chunks in parallel without locking a single monolithic dataset, fitting each chunk into local cache/RAM and scaling linearly with core count.',
    explanation: 'Partitioning eliminates shared-memory contention and enables scalable data-level parallelism (MapReduce/Spark style).'
  },
  'Exercise 2.10 Q3': {
    answer: 'Domain (Functional/Value) Decomposition partitions data by logical category or functional stage (e.g., an e-commerce platform assigning separate worker pools to payment logs, inventory updates, and recommendation analytics); Spatial (Geometric) Decomposition partitions a physical coordinate space into grid regions (e.g., numerical weather prediction dividing Tanzania’s atmosphere into 3D latitude-longitude-altitude grid cells processed by separate cores).',
    explanation: 'Both strategies allow parallel processors to compute on local partitions while only exchanging boundary data when necessary.'
  },
  'Exercise 2.10 Q4': {
    answer: 'Two major challenges of Thread-Level Parallelism (TLP) are: (1) Synchronization and Lock Contention overhead (Amdahl’s Law: serial critical sections, mutex locks, and race conditions limit scalability as thread count grows), and (2) Cache Coherence and Memory Bandwidth bottlenecks (maintaining coherent L1/L2 caches across dozens of cores consumes massive interconnect traffic and power).',
    explanation: 'As core counts scale to 32, 64, or 128 cores, keeping shared data consistent and avoiding lock bottlenecks becomes harder than adding more ALUs.'
  },
  'Exercise 2.10 Q5': {
    answer: 'Architects address TLP challenges using directory-based cache coherence protocols, Non-Uniform Memory Access (NUMA) topologies with high-speed mesh interconnects, hardware atomic instructions / lock-free data structures, and heterogeneous specialized accelerators that offload parallel tasks.',
    explanation: 'Scalable directory coherence and lock-free atomic primitives reduce interconnect broadcast traffic and synchronization stalls.'
  },
  'Exercise 2.10 Q6': {
    answer: 'Scenario 1 (Independent tasks): Thread A (network download) and Thread B (math calculation) run simultaneously at full speed because Thread A uses the NIC/DMA while Thread B uses the CPU ALU/FPU. Scenario 2 (Data dependency): If Thread B’s calculation requires the completed file from Thread A, Thread B stalls until Thread A finishes (or must pipeline chunk-by-chunk), reducing the parallel speedup.',
    explanation: 'Independent I/O and CPU threads achieve maximum concurrency, whereas a strict producer-consumer dependency serializes execution unless streamed in chunks.'
  },
  'Exercise 2.10 Q7': {
    answer: 'Without data dependencies, threads execute asynchronously without waiting, achieving near-ideal parallel speedup; when data dependencies exist, threads must synchronize via locks, barriers, or condition variables, introducing waiting stalls and serialization that cap speedup according to Amdahl’s Law.',
    explanation: 'Minimising inter-thread dependencies is critical for achieving high parallel efficiency.'
  },
  'Revision Exercise 2 Q1': {
    answer: 'In a non-pipelined 5-stage processor (IF, ID, EX, MEM, WB), each instruction takes 5 cycles, so `lw $t0, 4($s3)` (cycles 1–5) followed by `sub $t1, $t0, $s4` (cycles 6–10) takes 10 clock cycles total. In a 5-stage pipelined processor (assuming no hazards), `lw` finishes in cycle 5 and `sub` finishes 1 cycle later in cycle 6 (6 clock cycles total), achieving a 10/6 = 1.67× speedup for 2 instructions (and approaching 5× speedup for large instruction streams).',
    explanation: 'For N instructions on a k-stage pipeline without hazards, non-pipelined execution takes N × k cycles whereas pipelined execution takes k + (N − 1) cycles.'
  },
  'Revision Exercise 2 Q2': {
    answer: 'Forwarding (also called bypassing) adds direct hardware data paths from the outputs of the EX/MEM and MEM/WB pipeline registers back to the inputs of the ALU, allowing a dependent instruction to receive a newly computed result immediately without waiting for the producer instruction to write it to the register file in the WB stage.',
    explanation: 'Forwarding eliminates pipeline stalls for almost all ALU-to-ALU Read-After-Write (RAW) hazards.'
  },
  'Revision Exercise 2 Q3': {
    answer: 'Future processors can enhance ILP through neural/perceptron-based branch predictors with near-100% accuracy, wider out-of-order instruction windows with value prediction, compiler-assisted hardware speculation, and fine-grained heterogeneous execution units.',
    explanation: 'Breaking control and memory latency walls allows wider issue engines to keep more functional units busy per clock cycle.'
  },
  'Revision Exercise 2 Q4': {
    answer: 'Superscalar vs VLIW (Very Long Instruction Word): Superscalar processors (e.g., x86, ARM Cortex-X) use dynamic hardware scheduling to detect dependencies at runtime and issue multiple independent instructions per cycle (binary compatible, handles variable memory latencies, complex/power-hungry hardware); VLIW processors (e.g., TI DSPs, Intel Itanium) rely on the compiler at compile time to pack multiple independent operations into one long instruction word (simpler, low-power hardware, but binary-incompatible across generations and sensitive to unpredictable cache misses).',
    explanation: 'Superscalar shifts scheduling complexity to runtime hardware, while VLIW shifts it to the static compiler.'
  },
  'Revision Exercise 2 Q5': {
    answer: 'As a compiler developer, apply Loop Unrolling (to reduce branch overhead and expose independent operations), Software Pipelining / Instruction Reordering (to separate dependent instructions and hide memory latency), Function Inlining, and Auto-Vectorization (emitting SIMD instructions for array loops).',
    explanation: 'These compiler transformations restructure code to maximize ILP and DLP while avoiding pipeline stalls.'
  },
  'Revision Exercise 2 Q6': {
    answer: 'If a loop is unrolled too aggressively, the expanded machine code can exceed the L1 Instruction Cache (I-cache) capacity, causing frequent I-cache misses; additionally, if the loop accesses non-contiguous memory addresses (poor spatial locality), data cache misses will dominate execution time regardless of loop unrolling.',
    explanation: 'Optimal loop unrolling balances reduced branch overhead against instruction cache footprint and register pressure.'
  },
  'Revision Exercise 2 Q7': {
    answer: 'Compilers use Data Dependence Analysis (such as GCD test, Banerjee test, and polyhedral loop analysis) along with Static Single Assignment (SSA) form and alias analysis to prove whether two array references (`A[i]` and `A[i+1]`) access the same memory location; if proven independent, the compiler can safely vectorize (SIMD) or parallelize the loop across cores.',
    explanation: 'Accurate dependence analysis ensures the compiler never reorders instructions in a way that changes program results.'
  },
  'Revision Exercise 2 Q8': {
    answer: 'Benefits of superscalar processors: (1) Higher instruction throughput (IPC > 1) by executing multiple instructions per clock cycle; (2) Faster execution of existing sequential programs without rewriting code. Trade-offs: (1) High hardware complexity, silicon area, and power/heat consumption for dependency checking and reservation stations; (2) Diminishing returns due to true data dependencies and branch mispredictions.',
    explanation: 'Superscalar cores trade transistor budget and energy for higher single-thread performance.'
  },
  'Revision Exercise 2 Q9': {
    answer: 'Combine a wide superscalar out-of-order core (for control-heavy general code) with wide SIMD vector/matrix execution units and SMT, supported by deep L1/L2 caches with hardware stride prefetchers and dynamic voltage/frequency scaling (DVFS) to maximize both throughput and energy efficiency.',
    explanation: 'Modern flagship architectures unify superscalar ILP, SIMD DLP, and multi-core/SMT TLP on a single die.'
  },
  'Revision Exercise 2 Q10': {
    answer: 'For the loop in Exercise 2.7 where `if (i > 5)` is Not Taken for the first 6 iterations (`i = 0..5`) and Taken for the last 4 (`i = 6..9`): starting at "Strongly Taken" (11) causes mispredictions on iterations 1 and 2 (state transitions `11 → 10 → 01`) before switching to Not Taken predictions for iterations 3–6, whereas starting at "Strongly Not Taken" (00) predicts all first 6 iterations with 100% accuracy.',
    explanation: 'An initial state of "Strongly Taken" (11) requires two consecutive "Not Taken" outcomes to cross the threshold into predicting "Not Taken" (01), lowering early accuracy from 100% to 60% in the first 5 iterations.'
  },
  'Revision Exercise 2 Q11': {
    answer: 'SMT is highly advantageous here because Thread 1 (image editing with frequent memory accesses) will frequently stall waiting for RAM/cache data, while Thread 2 (compute-bound task) can utilize the core’s idle ALU/FPU execution units during Thread 1’s memory stalls, maximising overall resource utilization.',
    explanation: 'Pairing a memory-bound thread with an ALU-bound thread is the best-case scenario for Simultaneous Multithreading because they complement rather than compete for the same pipeline stages.'
  },
  'Revision Exercise 2 Q12': {
    answer: 'In a modern web browser, one thread renders the UI and handles user scrolling, another thread executes JavaScript, another decodes images/video, and background threads fetch network resources; multithreading and SMT ensure the browser interface never freezes while heavy pages or downloads are processed in the background.',
    explanation: 'Separating UI rendering from network I/O and heavy computation keeps interactive applications responsive at 60+ frames per second.'
  },
  'Scenario 3.1 Q1': {
    answer: 'Choosing the language, tone, and structure of the letter corresponds to the Application and Presentation layers of a network communication model, where information is generated and formatted/encoded into a representation understood by both sender and receiver.',
    explanation: 'Communication models require agreed-upon syntax and semantics (protocols) so the recipient can interpret the sender’s message.'
  },
  'Scenario 3.1 Q2': {
    answer: 'Before sending the letter, you fold it, place it inside an envelope, and write the recipient’s destination address and your return (source) address on the outside—which mirrors Data Encapsulation and adding Network/Data Link layer headers.',
    explanation: 'In networking, user payload data is encapsulated inside protocol headers containing source and destination addresses before transmission.'
  },
  'Scenario 3.1 Q3': {
    answer: 'The complete mechanism mirrors the layered OSI/TCP-IP stack: writing the message (Application/Presentation), placing it in an addressed envelope (Transport/Network encapsulation), dropping it in the postbox (Data Link interface), and transporting it via postal trucks/planes through sorting hubs to the friend’s mailbox (Physical layer transmission and Network layer routing).',
    explanation: 'Postal mail delivery is a classic real-world analogy for layered packet encapsulation, hop-by-hop routing, and decapsulation at the receiver.'
  },
  'Exercise 3.1 Q1': {
    answer: 'Examples of network protocols include HTTP/HTTPS (web browsing), FTP/SFTP (file transfer), SMTP/IMAP/POP3 (email), DNS (domain name resolution), DHCP (dynamic IP assignment), TCP and UDP (transport layer delivery), IP/ICMP (network routing), and Ethernet/Wi-Fi IEEE 802.11 (data link access).',
    explanation: 'Each protocol defines the exact message format, timing, and error-handling rules for its specific layer in the network stack.'
  },
  'Exercise 3.1 Q2': {
    answer: 'Reference models (OSI and TCP/IP) provide vendor interoperability (equipment from Cisco, Huawei, Apple, and Dell can communicate seamlessly), modular engineering (changes in one layer do not break other layers), easier systematic troubleshooting (isolating faults layer by layer), and a universal framework for teaching and designing networks.',
    explanation: 'Layered abstraction allows hardware engineers to upgrade physical cabling (e.g., copper to fibre) without modifying web browsers or transport protocols.'
  },
  'Exercise 3.1 Q3': {
    answer: 'Because reference models use modular layer abstraction with clean service interfaces, new protocols and technologies (such as Wi-Fi 7, 5G, IPv6, QUIC, or TLS 1.3) can be plugged into their respective layers without redesigning the entire communication stack.',
    explanation: 'Layer independence ensures the reference architecture remains valid even as underlying physical media and application protocols evolve.'
  },
  'Exercise 3.1 Q4': {
    answer: 'Real-world examples of standardisation include international shipping containers (ISO dimensions fitting any ship, train, or truck), USB-C charging and data ports across smartphone and laptop brands, international aviation air-traffic control English, and universal electrical/metric engineering standards.',
    explanation: 'Standardised interfaces allow independently manufactured systems worldwide to interconnect without custom adapters.'
  },
  'Exercise 3.2 Q1': {
    answer: 'As application data moves down the OSI stack at the sender (from Layer 7 to Layer 1), it undergoes Encapsulation: each layer adds its own control header (and Data Link also adds a trailer) before passing the Protocol Data Unit (PDU) to the layer below; at the receiver (moving up from Layer 1 to Layer 7), it undergoes Decapsulation as each layer strips and processes its corresponding header.',
    explanation: 'Encapsulation wraps the payload with addressing, sequencing, and error-checking metadata required by each peer layer.'
  },
  'Exercise 3.2 Q2': {
    answer: 'Each layer prepends a Protocol Header (and Layer 2 appends a Frame Check Sequence trailer). Resulting PDU names at each layer: Layers 7, 6, 5 (Application, Presentation, Session) = Data; Layer 4 (Transport) = Segment (TCP) or Datagram (UDP); Layer 3 (Network) = Packet; Layer 2 (Data Link) = Frame; Layer 1 (Physical) = Bits.',
    explanation: 'Data → Segment → Packet → Frame → Bits is the standard OSI encapsulation sequence.'
  },
  'Exercise 3.2 Q3': {
    answer: 'Limitations of the strict 7-layer OSI model include overlapping functions between the Session, Presentation, and Application layers (which modern protocols like TLS, HTTP/3, and QUIC merge together), cross-layer optimisations in software-defined networking (SDN) and wireless 5G stacks, and the fact that real-world internet protocols were built natively around the more streamlined TCP/IP model.',
    explanation: 'Modern cloud and wireless protocols often combine encryption (Layer 6), session management (Layer 5), and transport multiplexing (Layer 4) for lower latency.'
  },
  'Exercise 3.2 Q4': {
    answer: 'Physical (vertical) communication is the actual flow of encapsulated data down through the layers on the sender, across the physical transmission medium as electrical/optical/radio signals at Layer 1, and up through the layers on the receiver; Virtual (horizontal/peer-to-peer) communication is the logical interaction between matching layers on the sender and receiver (e.g., Layer 4 on Host A communicating with Layer 4 on Host B via TCP headers).',
    explanation: 'Peer layers logically converse using their shared protocol headers, even though the bits physically travel down to Layer 1 and across the wire.'
  },
  'Exercise 3.3 Q1': {
    answer: 'Factors affecting signal strength at the Physical layer include Attenuation (loss of signal energy over cable/air distance), Electromagnetic Interference (EMI) and Radio Frequency Interference (RFI), Crosstalk between adjacent wires, physical obstacles/multipath fading in wireless links, and the quality/type of transmission medium (UTP copper vs fibre optic).',
    explanation: 'Physical layer engineering uses shielding, twisted pairs, repeaters, and fibre optics to preserve signal-to-noise ratio over distance.'
  },
  'Exercise 3.3 Q2': {
    answer: 'Main devices operating at the Physical layer (Layer 1) are Repeaters, Hubs, Modems, Network Interface Card (NIC) transceivers, Media Converters, and physical cabling/connectors (Cat6 RJ-45, fibre-optic patch cords, coaxial cables, and antennas).',
    explanation: 'Layer 1 devices regenerate, amplify, or convert raw electrical, optical, or radio bit signals without inspecting MAC or IP addresses.'
  },
  'Exercise 3.3 Q3': {
    answer: 'The Physical layer’s choice of medium (e.g., single-mode fibre vs Cat5e copper), modulation/encoding scheme, and connector termination directly sets the maximum bandwidth (Gbps), bit error rate (BER), latency, and maximum cable distance—forming the foundation upon which all higher layers rely.',
    explanation: 'High physical bit-error rates force upper layers (Data Link and Transport) to waste bandwidth retransmitting corrupted frames and segments.'
  },
  'Exercise 3.4 Q1': {
    answer: 'The Data Link layer appends a Frame Check Sequence (FCS) using Cyclic Redundancy Check (CRC) or parity bits to detect corrupted frames (dropping or requesting retransmission via ARQ), and can use Forward Error Correction (FEC, e.g., Hamming/Reed-Solomon codes) to correct bit errors on the fly. Error detection (CRC) has very low bandwidth overhead but requires retransmission, whereas error correction (FEC) avoids retransmission delays on noisy wireless/satellite links at the cost of higher redundant bit overhead.',
    explanation: 'Wired Ethernet relies on fast CRC-32 error detection and frame dropping, whereas wireless links combine CRC, ARQ, and FEC.'
  },
  'Exercise 3.4 Q2': {
    answer: 'Ethernet (IEEE 802.3) uses CSMA/CD (Carrier Sense Multiple Access with Collision Detection—and full-duplex switched links in modern networks) to achieve high throughput and low latency on wired LANs; Wi-Fi (IEEE 802.11) uses CSMA/CA (Collision Avoidance with RTS/CTS and acknowledgments) because wireless radios cannot easily detect collisions while transmitting, adding slightly higher overhead to prevent airwave collisions.',
    explanation: 'MAC sublayer media-access protocols determine how efficiently multiple stations share copper, fibre, or wireless spectrum.'
  },
  'Exercise 3.4 Q3': {
    answer: 'Organizations use VLANs (Virtual Local Area Networks) to logically segment a single physical switch infrastructure into separate broadcast domains by department (e.g., Finance, HR, Students, Guest Wi-Fi), which reduces broadcast traffic congestion, enhances security by isolating sensitive departments, and simplifies network management without buying separate physical switches.',
    explanation: 'IEEE 802.1Q VLAN tagging isolates broadcast traffic at Layer 2 and requires a Layer 3 router or firewall to inspect traffic crossing between VLANs.'
  },
  'Exercise 3.5 Q1': {
    answer: 'Understanding the Network layer (Layer 3) explains how logical IP addressing (IPv4/IPv6) and packet routing interconnect millions of heterogeneous local networks into a single global Internet, enabling scalable end-to-end communication across continents.',
    explanation: 'While Layer 2 only delivers frames within a local LAN, Layer 3 provides global logical addressing and inter-network path determination.'
  },
  'Exercise 3.5 Q2': {
    answer: 'Routing protocols (such as RIP using distance-vector hop count, OSPF using Dijkstra’s link-state shortest path, and BGP using policy/path-vector across autonomous systems) allow routers to exchange topology information and dynamically select optimal, loop-free paths; choosing a fast-converging link-state protocol like OSPF reduces latency and automatically routes around failed links in large enterprise networks.',
    explanation: 'Dynamic routing algorithms evaluate metrics like bandwidth, delay, and hop count to keep routing tables accurate as network conditions change.'
  },
  'Exercise 3.5 Q3': {
    answer: 'As a network administrator, you use Network layer knowledge and tools like `ping` and `traceroute` (ICMP), routing table inspection (`ip route` / `show ip route`), and subnet mask verification to pinpoint whether the slowdown is caused by a routing loop, a congested router hop, suboptimal path selection, or IP/MTU fragmentation.',
    explanation: 'Layer 3 diagnostics reveal exact hop-by-hop round-trip latencies and packet loss across intermediate routers.'
  },
  'Exercise 3.5 Q4': {
    answer: 'Quality of Service (QoS) classifies and prioritizes network packets (using IP DSCP/ToS headers and router queuing) so latency-sensitive real-time traffic like VoIP calls, telemedicine, and video conferencing receives guaranteed bandwidth, low delay, and low jitter even when bulk file downloads are running.',
    explanation: 'Without QoS, a burst of bulk FTP or backup traffic can fill router buffers ("bufferbloat") and cause voice/video calls to drop or stutter.'
  },
  'Exercise 3.5 Q5': {
    answer: 'Key QoS components and implementation methods include: (1) Traffic Classification and Marking (inspecting packets and setting IPv4 ToS/DSCP or Layer 2 802.1p priority bits); (2) Queuing and Scheduling (Weighted Fair Queuing [WFQ] and Low Latency Queuing [LLQ] to serve real-time voice/video first); (3) Traffic Shaping and Policing (token-bucket rate limiting to smooth bursts); and (4) Congestion Avoidance (Weighted Random Early Detection [WRED] to prevent tail-drop buffer overflow).',
    explanation: 'Together, classification, priority queuing, traffic shaping, and WRED prevent network congestion and guarantee bandwidth/latency SLAs for critical traffic.'
  },
  'Activity 1.9': {
    answer: 'Yes, the simulator output matches Table 1.11 (x AND y) exactly: the output indicator (bulb/LED) turns ON (logic 1) only when both input switches x and y are set to 1, and remains OFF (logic 0) for inputs (0,0), (0,1), and (1,0).',
    explanation: 'An AND gate requires all inputs to be HIGH (1) to produce a HIGH (1) output, matching the truth table of logical conjunction.'
  },
  'Activity 1.9 Q1': {
    answer: 'Yes, the simulator output matches Table 1.11 (x AND y) exactly: the output indicator (bulb/LED) turns ON (logic 1) only when both input switches x and y are set to 1, and remains OFF (logic 0) for inputs (0,0), (0,1), and (1,0).',
    explanation: 'An AND gate requires all inputs to be HIGH (1) to produce a HIGH (1) output, matching the truth table of logical conjunction.'
  },
  'Exercise 3.6 Q1': {
    answer: '(a) Inspect the first octet in dotted-decimal notation: 1–126 = Class A, 128–191 = Class B, 192–223 = Class C, 224–239 = Class D (Multicast), 240–255 = Class E (Experimental). (b) Identified classes: (i) `100.31.21.11` → Class A; (ii) `165.10.11.1` → Class B; (iii) `242.12.13.14` → Class E; (iv) `200.200.200.200` → Class C; (v) `230.13.56.100` → Class D.',
    explanation: 'The range of the first decimal octet (before the first dot) uniquely identifies the classful IPv4 address class.'
  },
  'Exercise 3.6 Q2': {
    answer: 'In binary notation, inspect the leading high-order bits of the first octet (`0` = Class A, `10` = Class B, `110` = Class C, `1110` = Class D, `1111` = Class E): (a) `11110001...` (starts with `1111`) → Class E; (b) `01110000...` (starts with `0`) → Class A; (c) `11000111...` (starts with `110`) → Class C; (d) `10110011...` (starts with `10`) → Class B; (e) `01000111...` (starts with `0`) → Class A.',
    explanation: 'Routers and hardware classifiers inspect the leading prefix bits (`0`, `10`, `110`, `1110`, `1111`) of the 32-bit binary IPv4 address.'
  },
  'Exercise 3.6 Q3': {
    answer: '(a) First determine the address class: Class A uses octet 1 for Network ID and octets 2–4 for Host ID; Class B uses octets 1–2 for Network ID and octets 3–4 for Host ID; Class C uses octets 1–3 for Network ID and octet 4 for Host ID. (b) (i) `112.45.231.11` (Class A): Network ID = `112`, Host ID = `45.231.11`; (ii) `201.198.168.2` (Class C): Network ID = `201.198.168`, Host ID = `2`; (iii) `165.19.20.6` (Class B): Network ID = `165.19`, Host ID = `20.6`.',
    explanation: 'Default classful masks (/8 for Class A, /16 for Class B, /24 for Class C) partition the 4 octets into Network ID and Host ID.'
  },
  'Exercise 3.6 Q4': {
    answer: 'Class A (/8): $2^7 - 2 = 126$ usable Network IDs and $2^{24} - 2 = 16,777,214$ usable Host IDs per network (e.g., Network `10.0.0.0`: assignable hosts `10.0.0.1` to `10.255.255.254`, broadcast `10.255.255.255`). Class B (/16): $2^{14} = 16,384$ Network IDs and $2^{16} - 2 = 65,534$ usable Host IDs per network (e.g., Network `172.16.0.0`: assignable hosts `172.16.0.1` to `172.16.255.254`). Class C (/24): $2^{21} = 2,097,152$ Network IDs and $2^8 - 2 = 254$ usable Host IDs per network (e.g., Network `192.168.1.0`: assignable hosts `192.168.1.1` to `192.168.1.254`, broadcast `192.168.1.255`).',
    explanation: 'In every network, the all-0s host address is reserved for the Network ID and the all-1s host address is reserved for the Broadcast address.'
  },
  'Exercise 3.7 Q1': {
    answer: '211.77.20.0 is Class C (/24). Borrowing 3 bits gives $2^3 = 8$ subnets (≥ 6) with $2^5 - 2 = 30$ usable hosts per subnet (≥ 25, max 30), subnet mask 255.255.255.224 (/27), block size 32. Subnets: (1) 211.77.20.0/27 (hosts .1–.30, broadcast .31); (2) 211.77.20.32/27 (hosts .33–.62, broadcast .63); (3) 211.77.20.64/27 (hosts .65–.94); (4) 211.77.20.96/27 (hosts .97–.126); (5) 211.77.20.128/27 (hosts .129–.158); (6) 211.77.20.160/27 (hosts .161–.190); plus .192/27 and .224/27.',
    explanation: 'A /27 mask (255.255.255.224) borrows 3 host bits ($2^3 = 8$ subnets) and leaves 5 host bits ($2^5 - 2 = 30$ valid host IPs per subnet).'
  },
  'Exercise 3.7 Q2': {
    answer: 'Using VLSM on 11.0.0.0/24: Subnet A (50 hosts → needs 6 host bits = 62 usable hosts, /26, mask 255.255.255.192): 11.0.0.0/26 (hosts 11.0.0.1–11.0.0.62, broadcast .63); Subnet B (25 hosts → 5 host bits = 30 hosts, /27, mask 255.255.255.224): 11.0.0.64/27 (hosts .65–.94, broadcast .95); Subnet C (10 hosts → 4 host bits = 14 hosts, /28, mask 255.255.255.240): 11.0.0.96/28 (hosts .97–.110, broadcast .111); Subnet D (5 hosts → 3 host bits = 6 hosts, /29, mask 255.255.255.248): 11.0.0.112/29 (hosts .113–.118, broadcast .119).',
    explanation: 'Variable Length Subnet Masking (VLSM) allocates subnets from largest to smallest (64, 32, 16, 8 block sizes) to conserve IP address space.'
  },
  'Exercise 3.7 Q3': {
    answer: '135.65.20.31 is a Class B address (default 135.65.0.0/16, or if treated as a /24 block 135.65.20.0/24): To create 16 subnets, borrow 4 bits ($2^4 = 16$). On 135.65.20.0/24, a /28 mask (255.255.255.240) gives 16 subnets of block size 16 with $2^4 - 2 = 14$ usable hosts per subnet (ranges 135.65.20.0/28, .16/28, .32/28, ..., .240/28). On Class B 135.65.0.0/16, a /20 mask (255.255.240.0) gives 16 subnets with $2^{12} - 2 = 4094$ usable hosts per subnet (135.65.0.0/20, 135.65.16.0/20, ..., 135.65.240.0/20).',
    explanation: 'Borrowing 4 subnet bits ($2^4 = 16$ subnets) creates 16 equal-sized address blocks with increments of 16 in the subnetted octet.'
  },
  'Exercise 3.8 Q1': {
    answer: 'Choose UDP (User Datagram Protocol) for live video and audio media streams, because video conferencing requires ultra-low latency and real-time delivery: UDP has minimal header overhead (8 bytes), no connection-setup handshake, and does not stall playback waiting to retransmit a single lost video frame (whereas TCP’s retransmissions and congestion back-off would cause severe video freezing and lag).',
    explanation: 'In real-time interactive media, a slightly degraded frame is far preferable to delaying all subsequent video frames for a TCP retransmission.'
  },
  'Exercise 3.8 Q2': {
    answer: 'For reliable file transfer, the Transport layer (TCP) uses a 16-bit Checksum in every segment header along with Sequence Numbers, Positive Acknowledgments (ACKs), and Retransmission Timers (ARQ): if the receiver’s computed checksum does not match the header checksum, the corrupted segment is discarded and automatically retransmitted so the reconstructed file is 100% bit-for-bit identical.',
    explanation: 'Combining error detection (checksums) with sequence numbering and automatic retransmission guarantees error-free file delivery.'
  },
  'Exercise 3.8 Q3': {
    answer: 'Flow control in the Transport layer (implemented via TCP’s Sliding Window mechanism) regulates the rate at which the sender transmits bytes based on the `Receive Window (rwnd)` size advertised by the receiver in every ACK header, preventing a fast sender from overflowing a slower receiver’s memory buffer.',
    explanation: 'If the receiver’s buffer fills up, it advertises a smaller (or zero) window size, prompting the sender to pause or slow down until buffer space is freed.'
  },
  'Exercise 3.8 Q4': {
    answer: 'During a large file download, TCP flow control dynamically adjusts your download speed to match your device’s available RAM buffer and disk write speed: if your computer is busy and its receive buffer fills up, TCP shrinks the advertised window to slow the server down so packets are not dropped; once your disk catches up, the window expands to restore maximum download speed.',
    explanation: 'Throughput is governed by `min(Congestion Window, Receive Window) / RTT`, ensuring stable transfer without buffer overflow.'
  },
  'Exercise 3.9 Q1': {
    answer: 'An HTTP Request contains a Request Line (method such as `GET` or `POST`, URI path `/index.html`, and version `HTTP/1.1`), Request Headers (`Host`, `User-Agent`, `Accept`), and an optional body; an HTTP Response contains a Status Line (`HTTP/1.1 200 OK` or `404 Not Found`), Response Headers (`Content-Type`, `Content-Length`, `Server`), and the response payload body (HTML/JSON).',
    explanation: 'Wireshark or Packet Tracer shows these human-readable request/response fields encapsulated inside TCP port 80 segments.'
  },
  'Exercise 3.9 Q2': {
    answer: 'In Wireshark, standard FTP (port 21/20) transmits usernames, passwords (`USER`, `PASS`), commands, and file contents in unencrypted plain text that anyone on the network can read; SFTP (SSH File Transfer Protocol over port 22) encrypts the entire authentication and file transfer stream, appearing only as unreadable encrypted payload in packet captures.',
    explanation: 'SFTP protects confidentiality and integrity using SSH cryptographic tunnels, whereas legacy FTP exposes credentials in cleartext.'
  },
  'Exercise 3.9 Q3': {
    answer: 'SMTP (Simple Mail Transfer Protocol, ports 25/587) is used to push/send outgoing emails from the client to the mail server and between mail servers. For retrieving incoming mail: POP3 (Post Office Protocol v3, port 110/995) downloads emails to a single local device and typically deletes them from the server, whereas IMAP (Internet Message Access Protocol, port 143/993) keeps emails and folders synchronized on the server so users can access the same mailbox across multiple devices.',
    explanation: 'SMTP handles outgoing mail delivery, while IMAP is preferred over POP3 for modern multi-device mailbox synchronization.'
  },
  'Exercise 3.9 Q4': {
    answer: 'The Session layer (Layer 5) establishes, manages, checkpoints, and terminates dialogues/sessions between applications (e.g., NetBIOS, RPC, SIP call sessions, or authenticated login sessions); the Presentation layer (Layer 6) handles data formatting, character encoding (ASCII/UTF-8), compression (GZIP), and encryption/decryption (TLS/SSL) so the Application layer receives data in a readable format.',
    explanation: 'In Packet Tracer or Wireshark, inspecting HTTPS/TLS handshakes and payload encoding illustrates Layer 5 session state and Layer 6 encryption/formatting.'
  },
  'Exercise 3.10 Q1': {
    answer: 'The CIA Triad guides security policy by enforcing: (1) Confidentiality—preventing unauthorized disclosure via encryption (AES/TLS) and access control lists (ACLs); (2) Integrity—preventing unauthorized modification via cryptographic hashing (SHA-256), digital signatures, and write permissions; and (3) Availability—ensuring authorized users have uninterrupted access via redundant links, RAID/backups, load balancers, and DDoS protection.',
    explanation: 'Every organizational security control maps directly to preserving Confidentiality, Integrity, or Availability.'
  },
  'Exercise 3.10 Q2': {
    answer: 'Preventive controls stop attacks before they happen (e.g., firewalls, WPA3 encryption, multi-factor authentication, security awareness training); Detective controls identify and alert on attacks in progress or after the fact (e.g., Intrusion Detection Systems [IDS], SIEM log monitoring, antivirus scans); Corrective controls restore normal operations and fix vulnerabilities after an incident (e.g., restoring from backups, patching exploited software, isolating infected hosts).',
    explanation: 'A defense-in-depth security architecture layers preventive, detective, and corrective controls together.'
  },
  'Exercise 3.10 Q3': {
    answer: 'Malware (viruses, worms, ransomware, trojans) is malicious software that exploits unpatched OS/service vulnerabilities to infect hosts, steal data, or encrypt files; Phishing uses deceptive emails/websites (social engineering) to trick users into revealing credentials or running malware; Denial-of-Service (DoS/DDoS) floods network bandwidth or server connection tables with bogus requests to exhaust resources and make services unavailable to legitimate users.',
    explanation: 'Malware targets software/endpoint vulnerabilities, phishing exploits human trust, and DoS targets Availability at the network/transport/application layers.'
  },
  'Exercise 3.10 Q4': {
    answer: 'Misconfigured network devices (leaving default admin passwords, open Telnet/SNMP ports, or permissive firewall rules) and weak authentication (short passwords, no MFA) allow attackers to gain unauthorized administrative control and pivot across the LAN; mitigation requires disabling unused services, changing default credentials, enforcing strong passwords with Multi-Factor Authentication (MFA), using SSH instead of Telnet, and conducting regular configuration audits.',
    explanation: 'Hardening device configurations and enforcing MFA eliminate the most common entry points for network breaches.'
  },
  'Exercise 3.11 Q1': {
    answer: 'PSTN (Public Switched Telephone Network) uses fixed physical underground/overhead copper local loops and fibre trunks with dedicated circuit switching originally designed for voice; Mobile telephone systems use wireless radio waves between portable handsets and cellular Base Transceiver Stations (BTS/NodeB), dynamic packet/digital switching, and mobility management (handover and roaming) for voice and high-speed data.',
    explanation: 'PSTN ties a phone number to a fixed physical wire termination, whereas cellular networks track mobile SIM identities dynamically across radio cells.'
  },
  'Exercise 3.11 Q2': {
    answer: 'PSTN call process: (1) Off-hook: lifting the handset closes the DC circuit on the Local Loop (the twisted-pair copper wire connecting the subscriber’s home to the Central Office), and the Central Office switch returns a dial tone; (2) Addressing/Routing: dialled digits are sent via DTMF tones to the Central Office, which uses SS7 signalling to reserve a dedicated circuit path across trunk exchanges to the recipient’s Central Office and rings their phone; (3) Conversation: voice travels over the dedicated circuit; (4) Teardown: hanging up (on-hook) signals the Central Office to release all reserved switches and trunk circuits.',
    explanation: 'Circuit switching reserves a dedicated end-to-end communication path for the entire duration of the call.'
  },
  'Exercise 3.11 Q3': {
    answer: 'Handover (handoff) transfers an active call or data session from one cell tower (BTS) to another as a mobile user moves, maintaining uninterrupted connectivity. Hard Handover ("break-before-make") disconnects the old radio channel before connecting to the new cell (used in GSM/2G and LTE); Soft Handover ("make-before-break") connects the handset to both the old and new cell towers simultaneously before dropping the weaker link (used in 3G CDMA).',
    explanation: 'The Mobile Switching Center (MSC) / Mobility Management Entity monitors signal strength reports from the phone and coordinates seamless channel transfer between cells.'
  },
  'Exercise 3.11 Q4': {
    answer: '1G: Analog voice only (AMPS, poor security); 2G (GSM/CDMA): Digital voice, SMS/MMS, and slow circuit/packet data (GPRS/EDGE, ~50–200 kbps); 3G (UMTS/HSPA): Broadband packet data (2–42 Mbps) supporting mobile web and video calls; 4G (LTE): All-IP packet network using OFDMA/MIMO (100 Mbps–1 Gbps) for HD streaming and VoLTE; 5G (NR): Millimetre-wave & sub-6 GHz spectrum, massive MIMO, and network slicing (1–10+ Gbps, <1 ms ultra-low latency) for IoT, autonomous vehicles, and smart cities.',
    explanation: 'Each cellular generation dramatically increased spectral efficiency, peak data rate, and network capacity while lowering latency.'
  },
  'Exercise 3.11 Q5': {
    answer: 'PSTN faces physical wiretapping on copper local loops and SS7 signalling abuse; mobile systems face over-the-air radio eavesdropping, rogue fake base stations (IMSI catchers/Stingrays), and SIM swapping. These are addressed using mutual authentication via the SIM/USIM module (AKA protocol), over-the-air radio encryption (A5/3, SNOW 3G, AES in 4G/5G), temporary subscriber identifiers (TMSI/SUCI in 5G), and end-to-end TLS/VoIP encryption.',
    explanation: 'Modern 4G/5G networks encrypt both control signalling and user traffic over the radio interface and authenticate the network to the handset to block rogue base stations.'
  },
  'Exercise 3.11 Q6': {
    answer: 'The Mobile Switching Center (MSC) is the core switching brain of a cellular network: it routes voice calls and SMS between mobile users and the external PSTN, manages call billing, queries the HLR/VLR databases to authenticate and locate subscribers, and coordinates inter-BSC handovers across multiple Base Station Controllers (BSCs), which in turn manage the radio channels of local Base Transceiver Stations (BTS).',
    explanation: 'In the cellular hierarchy (MS → BTS → BSC → MSC → PSTN/Internet), the BTS handles radio antennas, the BSC manages radio resources across several towers, and the MSC handles core switching and mobility.'
  },
  'Revision Exercise 3 Q1': {
    answer: 'Using a systematic bottom-up (or top-down) layered approach: check Layer 1 first (cables plugged in, link lights, Wi-Fi signal), then Layer 2 (MAC table, VLAN assignment, ARP resolution), then Layer 3 (`ping` gateway, IP address, subnet mask, routing table), then Layer 4 (port open, TCP handshake, firewall rules), and finally Layer 7 (DNS resolution, HTTP/application server configuration).',
    explanation: 'Isolating symptoms by OSI/TCP-IP layer prevents wasted time debugging application settings when the root cause is an unplugged cable or wrong subnet mask.'
  },
  'Revision Exercise 3 Q2': {
    answer: 'Future reference models must incorporate Software-Defined Networking (SDN, separating the control plane from the data plane), network virtualization/slicing (5G/cloud), native zero-trust encryption integrated into the transport layer (like QUIC over UDP), and AI-driven cross-layer telemetry.',
    explanation: 'Modern cloud and edge networks increasingly blur rigid layer boundaries in favour of programmable, encrypted, software-defined pipelines.'
  },
  'Revision Exercise 3 Q3': {
    answer: 'A VPN (Virtual Private Network) operates across layers by encapsulating private Layer 3 IP packets (or Layer 2 frames) inside an encrypted tunnel (e.g., IPSec at Layer 3 or OpenVPN/WireGuard at Layer 4/7) and transmitting them across the public Internet; similarly, Wi-Fi (IEEE 802.11) defines wireless RF signalling at Layer 1 (Physical) and CSMA/CA frame addressing and WPA2/WPA3 encryption at Layer 2 (Data Link).',
    explanation: 'Mapping technologies like VPNs or Wi-Fi to the OSI model clarifies how encapsulation and security operate at specific layers.'
  },
  'Revision Exercise 3 Q4': {
    answer: 'VLAN segmentation improves efficiency by confining broadcast traffic to smaller logical groups (preventing broadcast storms) and enhances security by isolating departments so hosts on different VLANs cannot communicate without passing through a Layer 3 router/firewall; key enterprise considerations include IEEE 802.1Q trunking configuration, native VLAN security, inter-VLAN routing capacity, and consistent VLAN ID planning across switches.',
    explanation: 'Properly designed VLANs allow a large campus or enterprise to share physical switches while enforcing strict departmental security policies.'
  },
  'Revision Exercise 3 Q5': {
    answer: 'ARP (Address Resolution Protocol) maps a known Layer 3 IPv4 address to its corresponding Layer 2 physical MAC address on the same local subnet: when Host A wants to send a packet to IP `192.168.1.50`, it broadcasts an ARP Request ("Who has `192.168.1.50`?") to `FF:FF:FF:FF:FF:FF`, the target host replies with a unicast ARP Reply containing its MAC address, and Host A caches the mapping in its ARP table to encapsulate the Ethernet frame.',
    explanation: 'Switches forward Ethernet frames using destination MAC addresses, so a sender must resolve the destination IP (or default gateway IP) to a MAC address via ARP before transmitting.'
  },
  'Revision Exercise 3 Q6': {
    answer: 'HTTP (Hypertext Transfer Protocol) is the foundational application-layer request-response protocol of the World Wide Web; features such as uniform URLs, content negotiation (`Content-Type` for HTML, images, video, JSON), caching headers (reducing page load times), cookies/session headers, and multiplexed encrypted transport in HTTPS (HTTP/2 and HTTP/3) deliver fast, interactive, and secure web browsing.',
    explanation: 'HTTP standardizes how web browsers request hypermedia resources and how web servers deliver and cache them.'
  },
  'Revision Exercise 3 Q7': {
    answer: 'FTP is designed specifically for stateful directory listing and bulk file uploads/downloads using two separate TCP connections (port 21 for control commands and port 20/ephemeral for data transfer) and lacks built-in encryption unless upgraded to FTPS/SFTP; HTTP is a stateless single-connection protocol (port 80 / HTTPS port 443) optimized for serving web pages, APIs, and browser downloads through firewalls with native TLS encryption in HTTPS.',
    explanation: 'HTTPS has largely replaced plain FTP for public file distribution due to single-port firewall traversal and mandatory TLS security.'
  },
  'Revision Exercise 3 Q8': {
    answer: 'A mask of 255.255.255.192 (/26) borrows 2 bits from the /24 host portion, creating $2^2 = 4$ subnets, each with block size 64 and $2^6 - 2 = 62$ usable host IPs: (1) Subnet 192.168.1.0/26 (valid hosts 192.168.1.1 – 192.168.1.62, broadcast .63); (2) Subnet 192.168.1.64/26 (valid hosts 192.168.1.65 – 192.168.1.126, broadcast .127); (3) Subnet 192.168.1.128/26 (valid hosts 192.168.1.129 – 192.168.1.190, broadcast .191); (4) Subnet 192.168.1.192/26 (valid hosts 192.168.1.193 – 192.168.1.254, broadcast .255).',
    explanation: 'In the fourth octet, `.192` is `11000000` in binary (2 subnet bits → 4 subnets; 6 host bits → $64 - 2 = 62$ valid hosts per subnet).'
  },
  'Revision Exercise 3 Q9': {
    answer: '14 usable host addresses per subnet. A subnet mask of 255.255.255.240 (/28) leaves 4 host bits (since `240` = `11110000` in binary), giving $2^4 - 2 = 16 - 2 = 14$ valid host IP addresses per subnet (and $2^{12} = 4096$ subnets across the 172.16.0.0/16 network).',
    explanation: 'The number of usable host addresses per subnet is always $2^h - 2$, where $h = 32 - 28 = 4$ unmasked host bits.'
  },
  'Revision Exercise 3 Q10': {
    answer: 'Minimum subnet mask is 255.255.255.192 (/26) on a /24 network (or /27 = 255.255.255.224, which provides 8 subnets of 30 hosts each). Using /26 (4 subnets of 62 hosts each, e.g., on 192.168.1.0/24): Subnet 0: .0/26 (hosts .1–.62, broadcast .63); Subnet 1: .64/26 (hosts .65–.126, broadcast .127); Subnet 2: .128/26 (hosts .129–.190, broadcast .191); Subnet 3: .192/26 (hosts .193–.254, broadcast .255). (If using /27 = 255.255.255.224 for exact 30 hosts: .0/27 [hosts .1–.30], .32/27 [hosts .33–.62], .64/27 [hosts .65–.94], .96/27 [hosts .97–.126]).',
    explanation: '30 hosts require at least 5 host bits ($2^5 - 2 = 30$, giving /27 = 255.255.255.224), while 4 subnets require at least 2 subnet bits (/26 = 255.255.255.192).'
  },
  'Revision Exercise 3 Q11': {
    answer: 'For 10.10.0.0/22 (mask 255.255.252.0): From the Class A default (/8), $22 - 8 = 14$ bits are borrowed for subnetting, creating $2^{14} = 16,384$ subnets. There are $32 - 22 = 10$ host bits remaining, providing $2^{10} - 2 = 1024 - 2 = 1022$ usable host addresses per /22 subnet (spanning 4 contiguous /24 blocks, e.g., 10.10.0.1 to 10.10.3.254).',
    explanation: 'A /22 prefix uses 22 network/subnet bits and 10 host bits ($2^{10} - 2 = 1022$ usable hosts per subnet).'
  },
  'Revision Exercise 3 Q12': {
    answer: 'To create at least 6 subnets from 192.168.10.0/24, borrow 3 bits ($2^3 = 8 \\ge 6$), giving subnet mask 255.255.255.224 (/27) with block size 32 and 30 usable hosts per subnet: (1) 192.168.10.0/27 (hosts .1–.30, bcast .31); (2) 192.168.10.32/27 (hosts .33–.62, bcast .63); (3) 192.168.10.64/27 (hosts .65–.94, bcast .95); (4) 192.168.10.96/27 (hosts .97–.126, bcast .127); (5) 192.168.10.128/27 (hosts .129–.158, bcast .159); (6) 192.168.10.160/27 (hosts .161–.190, bcast .191); plus .192/27 and .224/27.',
    explanation: '2 bits only give $2^2 = 4$ subnets (insufficient for 6), so 3 bits ($2^3 = 8$ subnets, mask `.224`) is required.'
  },
  'Revision Exercise 3 Q13': {
    answer: 'Understanding the OSI/TCP-IP layers enables defense-in-depth by matching security controls to layer-specific threats: Layer 1 (locked server rooms, shielded cables against wiretapping), Layer 2 (802.1X port security, Dynamic ARP Inspection, VLANs against ARP spoofing/MAC flooding), Layer 3 (IPSec VPNs, router ACLs, anti-spoofing filters), Layer 4 (stateful firewalls, SYN cookies against SYN floods), and Layers 5–7 (TLS encryption, Web Application Firewalls [WAF], MFA, and DNSSEC).',
    explanation: 'Securing only one layer leaves the network vulnerable to attacks targeting lower or higher layers.'
  },
  'Revision Exercise 3 Q14': {
    answer: 'Social engineering manipulates human psychology—exploiting authority, urgency, fear, curiosity, or helpfulness (via phishing emails, pretexting phone calls, baiting, or tailgating)—to trick employees into divulging passwords or bypassing security controls. Organizations mitigate it through regular employee security awareness training, simulated phishing drills, strict identity verification procedures, Multi-Factor Authentication (MFA), and least-privilege access.',
    explanation: 'Because social engineering targets people rather than software bugs, technical controls like MFA must be paired with human awareness training.'
  },
  'Revision Exercise 3 Q15': {
    answer: 'Vulnerability scanning uses automated tools (like Nessus or OpenVAS) to proactively probe systems for known CVEs, outdated software versions, open ports, and weak configurations before attackers find them; Patching then applies vendor security updates to fix the underlying code flaws, closing the window of exposure against exploits and ransomware.',
    explanation: 'Continuous vulnerability scanning and timely patch management form a core preventive hygiene cycle in cybersecurity.'
  }
};

export const CS_F5_ANSWERS_PART2: Record<string, ExactCSAnswer> = {
  'Scenario 4.1 Q1': {
    answer: 'The system should collect personal and academic/service details (such as ID number, full name, contact information, role/category, and transaction/enrollment records) from distinct system users such as students/customers, staff/teachers, and system administrators.',
    explanation: 'In an OOP system analysis, identifying user roles and the specific attributes collected from each user determines the classes and member variables to model.'
  },
  'Scenario 4.1 Q2': {
    answer: 'Yes; Object-Oriented Programming (OOP) models real-world entities (such as `Student`, `Teacher`, `Book`, `Account`) directly as software classes containing both data attributes and methods, making large real-world systems modular, reusable, secure (via encapsulation), and easy to maintain.',
    explanation: 'OOP bridges the gap between real-world domain objects and software design by grouping state and behavior into self-contained objects.'
  },
  'Exercise 4.2 Q1': {
    answer: 'Encapsulation bundles an object’s data attributes and the methods that operate on them into a single class while declaring internal fields `private`; this enforces information hiding and preserves data integrity by preventing external code from putting the object into an invalid state (e.g., setting a negative age or balance).',
    explanation: 'All state changes must pass through public mutator (setter) methods that validate inputs before updating private fields.'
  },
  'Exercise 4.2 Q2': {
    answer: 'In the `Book` class of the library management system, attributes like `title`, `author`, `ISBN`, and `isAvailable` are declared `private`, and external classes can only view or update a book’s checkout status through controlled `public` methods such as `borrowBook()`, `returnBook()`, and `getDetails()`.',
    explanation: 'Hiding `isAvailable` inside `Book` prevents external code from marking a borrowed book available without running the return logic.'
  },
  'Exercise 4.2 Q3': {
    answer: 'Getters (accessor methods, e.g., `getBalance()`) provide safe read-only access to private attributes, while Setters (mutator methods, e.g., `setBalance(double b)`) provide controlled write access where validation rules, logging, or security checks can be enforced before modifying the object’s state.',
    explanation: 'Getters and setters decouple the internal representation of a class from its public interface.'
  },
  'Exercise 4.2 Q4': {
    answer: 'In the `Car` class, sensitive internal attributes such as `speed`, `fuelLevel`, and `engineState` are declared `private`, while `public` methods like `accelerate()`, `brake()`, and `getSpeed()` control how speed is changed (e.g., preventing speed from becoming negative or exceeding the car’s limit).',
    explanation: 'A driver interacts with the pedals and dashboard (`public` methods) rather than manually altering engine cylinders (`private` data).'
  },
  'Exercise 4.2 Q5': {
    answer: 'In a mobile money / banking system (such as M-Pesa or NMB Mobile), a customer’s `accountBalance` and `PIN` are private encapsulated fields: a user cannot directly edit their balance variable, and can only modify it by calling `deposit()` or `withdraw(amount, pin)`, which verifies the PIN and checks for sufficient funds.',
    explanation: 'Financial and medical systems rely on encapsulation to prevent unauthorized or accidental corruption of critical records.'
  },
  'Exercise 4.3 Q1': {
    answer: 'The statement is accurate: Inheritance allows a derived class (subclass/child) to automatically acquire the attributes and methods of a base class (superclass/parent), promoting code reuse ("DRY — Don’t Repeat Yourself") and establishing hierarchical "is-a" relationships without duplicating common code.',
    explanation: 'Subclasses inherit existing base functionality and can add specialized attributes or override inherited methods.'
  },
  'Exercise 4.3 Q2': {
    answer: 'Single inheritance derives a subclass directly from one base class (`A → B`), whereas multilevel inheritance forms a chain of inheritance across three or more levels (`A → B → C`, where `C` inherits from `B`, which inherits from `A`). Benefits: hierarchical specialization and cumulative code reuse; Drawbacks: tight coupling across deep chains and harder debugging if base class behaviour changes.',
    explanation: 'In multilevel inheritance, the bottom class `C` inherits the combined members of both intermediate class `B` and root class `A`.'
  },
  'Exercise 4.3 Q3': {
    answer: 'Example: Base class `Vehicle` (attributes `brand`, `maxSpeed`; method `start()`), derived class `Car : public Vehicle` (adds `numDoors` and `playRadio()`), and further derived class `ElectricCar : public Car` (adds `batteryCapacity` and `chargeBattery()`). An `ElectricCar` object inherits `brand` and `start()` from `Vehicle`, `numDoors` from `Car`, and adds its own electric-specific features.',
    explanation: 'Each level in `Vehicle → Car → ElectricCar` refines the hierarchy from general to specific.'
  },
  'Exercise 4.4 Q1': {
    answer: 'Polymorphism allows a single function or loop to operate on a base-class reference (`Shape*` or `PaymentMethod*`) that can point to any derived object (`Circle`, `Rectangle`, `MobileMoney`, `CreditCard`); when a new subclass is added later, existing processing code works without modification, improving reusability and maintainability.',
    explanation: 'Writing code against a common base interface eliminates brittle `if-else` type-checking chains.'
  },
  'Exercise 4.4 Q2': {
    answer: 'The base class `Animal` declares a `virtual void makeSound()` method, and subclasses `Dog`, `Cat`, and `Cow` override `makeSound()` to print `"Woof!"`, `"Meow!"`, and `"Moo!"` respectively; calling `animalPtr->makeSound()` invokes the specific sound of whichever animal object is pointed to at runtime.',
    explanation: 'This is classic runtime polymorphism via method overriding and dynamic dispatch.'
  },
  'Exercise 4.4 Q3': {
    answer: 'Create base classes `GameCharacter` (with `health`, `position`, and virtual `attack()`/`move()`), `GameItem` (with `use()`), and `Environment`; subclasses like `Warrior`, `Archer`, and `BossEnemy` inherit from `GameCharacter` and polymorphically override `attack()` so the game loop can update all characters uniformly via `character->attack()`.',
    explanation: 'Inheritance shares common health/movement logic, while polymorphism gives each character class unique combat behavior.'
  },
  'Exercise 4.4 Q4': {
    answer: 'Runtime Polymorphism (also called Dynamic Polymorphism or Late Binding), achieved through Method Overriding and `virtual` functions.',
    explanation: 'Because the exact `getArea()` implementation (`Square::getArea()` vs `Circle::getArea()`) is resolved at runtime based on the actual object type, it is runtime polymorphism.'
  },
  'Exercise 4.4 Q5': {
    answer: 'Polymorphism allows `greetAnimal(Animal& animal)` to be written once using the base `Animal` interface (`animal.makeSound()`) instead of writing separate overloaded functions `greetDog(Dog)`, `greetCat(Cat)`, `greetBird(Bird)`, and it automatically supports any new `Animal` subclass added in the future.',
    explanation: 'A single polymorphic function can process an open-ended family of derived types.'
  },
  'Exercise 4.4 Q6': {
    answer: 'Define a base class `Vehicle` with a virtual method `virtual void move()`, have `Car`, `Truck`, and `Bike` inherit from `Vehicle` and override `move()`, and write `moveAllVehicles(vector<Vehicle*>& vehicles)` to loop through the list calling `v->move()` on each element.',
    explanation: 'Each vehicle executes its own specialized `move()` behavior when called through the common `Vehicle*` pointer.'
  },
  'Exercise 4.4 Q7': {
    answer: 'Yes, polymorphism can exist without class inheritance: Compile-time (ad-hoc) polymorphism uses Function Overloading and Operator Overloading within a single class or namespace, and Parametric Polymorphism uses C++ Templates (`template <typename T>`) or duck typing (in languages like Python) without requiring a class inheritance hierarchy.',
    explanation: 'Only subtype (inclusion) runtime polymorphism requires inheritance; overloading and templates achieve polymorphism at compile time without inheritance.'
  },
  'Exercise 4.4 Q8': {
    answer: 'A smartphone’s "Power/Action Button" or a human person acting in different roles: the same person behaves as a Student in class, a Customer in a shop, and a Son/Daughter at home depending on the context; similarly, pressing "Play" on a media player plays MP3 audio, MP4 video, or a live radio stream depending on the loaded file.',
    explanation: 'One interface ("Play" or one individual) responds with context-appropriate behavior depending on the situation.'
  },
  'Exercise 4.5 Q1': {
    answer: 'Expected attributes for `BankAccount` include `accountNumber` (string/int), `accountHolderName` (string), `balance` (double), `accountType` (string), and `pinOrPasswordHash` (string).',
    explanation: 'These attributes represent the essential state of a customer’s bank account.'
  },
  'Exercise 4.5 Q2': {
    answer: 'The OOP principle of Encapsulation (and Data Hiding): by declaring the `balance` attribute with the `private` access specifier, external code and unauthorized functions are blocked by the compiler from reading or modifying `account.balance` directly.',
    explanation: 'Marking `balance` as `private` restricts direct access exclusively to member methods inside the `BankAccount` class.'
  },
  'Exercise 4.5 Q3': {
    answer: 'Recommend `public` methods: `deposit(double amount)` (validates `amount > 0` before adding to `balance`), `withdraw(double amount, int pin)` (verifies the PIN, checks `amount > 0` and `amount <= balance` before subtracting), and `getBalance(int pin)` (verifies authentication before returning the current balance).',
    explanation: 'Controlled accessor and mutator methods enforce business rules and security checks on every balance operation.'
  },
  'Exercise 4.6 Q1': {
    answer: 'Errors in the program: (1) `include<iostream>;` is missing the `#` preprocessor symbol and has an invalid trailing semicolon (should be `#include <iostream>`); (2) `int main` is missing parentheses `()` (should be `int main()`); (3) `Read and enjoy C++ programming` is a string literal missing double quotes `""` (should be `"Read and enjoy C++ programming"`). Corrected output: `Read and enjoy C++ programming`.',
    explanation: 'Corrected code:\n```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Read and enjoy C++ programming" << endl;\n    return 0;\n}\n```'
  },
  'Exercise 4.6 Q2': {
    answer: 'Five characteristics of a good program: (1) Correctness/Accuracy (produces exact required outputs for all valid inputs); (2) Reliability/Robustness (handles invalid inputs and edge cases gracefully without crashing); (3) Efficiency (uses minimal CPU time and memory); (4) Readability and Documentation (clear variable names, indentation, and comments); (5) Maintainability and Portability (modular structure that is easy to update and compile across platforms).',
    explanation: 'High-quality software engineering balances functional correctness with performance and human maintainability.'
  },
  'Exercise 4.6 Q3': {
    answer: 'Yes, both `cout << 5 << \'\\n\';` and `cout << "5" << \'\\n\';` print the exact same visible character `5` followed by a newline on the screen, even though `5` is an integer literal and `"5"` is a string literal.',
    explanation: '`cout` converts the integer value `5` into its character representation `\'5\'` for display, which matches the string literal `"5"`.'
  },
  'Exercise 4.6 Q4': {
    answer: 'No (unless the variable `y` happens to hold the character `\'y\'` or string `"y"`): `cout << y << \'\\n\';` prints the current value stored inside the variable `y` (for example, `10`), whereas `cout << "y" << \'\\n\';` always prints the literal letter `y`.',
    explanation: 'Without quotes, `y` is evaluated as a variable identifier; inside double quotes, `"y"` is a constant string literal.'
  },
  'Activity 4.2 Q1': {
    answer: 'The data types applied in the program are `void`, `int`, and `bool`.',
    explanation: '`void` is used as the return type of functions that do not return a value (`printMonth`, `printMonthTitle`, etc.), `int` is used for integer variables and parameters (`year`, `month`), and `bool` is the return type of `isLeapYear(int year)`.'
  },
  'Activity 4.2 Q2': {
    answer: '`int` stores whole numbers (such as `year`, `month`, and day counts); `bool` stores logical truth values (`true` or `false`, returned by `isLeapYear`); and `void` specifies that a function performs an action (printing) without returning a value.',
    explanation: 'Each C++ fundamental type defines the memory size and valid operations for variables and function return values.'
  },
  'Activity 4.2 Q3': {
    answer: 'Compiling the program produces a Linker Error: `undefined reference to printMonth(int, int)` (and `ld returned 1 exit status`), because `printMonth(year, month)` is declared as a function prototype and called inside `main()`, but its function body/definition is never provided.',
    explanation: 'In C++, declaring a prototype satisfies the compiler syntax check, but calling that function in `main()` without defining its body causes the linker to fail.'
  },
  'Activity 4.2 Q4': {
    answer: 'The error is an "Unresolved external symbol / undefined reference to `printMonth(int, int)`" linker error, caused by calling `printMonth(year, month)` in `main()` without implementing the body of `void printMonth(int year, int month) { ... }`.',
    explanation: 'Every called function must have both a declaration and a complete definition before the linker can build the executable.'
  },
  'Exercise 4.7 Q1': {
    answer: 'Two issues: (1) `#include <iostream.h>` uses the deprecated pre-standard header `.h` instead of standard `#include <iostream>` (which conflicts with `using namespace std;` in modern C++ compilers); (2) Logical bug: `cout << "y" << endl;` puts quotes around `y`, so it prints the literal letter `y` instead of the value `0` stored in variable `y` (should be `cout << y << endl;`).',
    explanation: 'Modern C++ requires `#include <iostream>` without `.h`, and printing a variable’s value requires omitting double quotes.'
  },
  'Exercise 4.7 Q2': {
    answer: 'After fixing `#include <iostream.h>` to `#include <iostream>`, the output is:\n`Size of char: 1 byte`\n`Size of integer: 4 bytes`\n`Size of float: 4 bytes`\n`Size of double: 8 bytes`\nExplanation: The `sizeof()` operator returns the exact number of memory bytes allocated by the compiler for each fundamental C++ data type (`char` = 1 byte, `int` = 4 bytes, `float` = 4 bytes, `double` = 8 bytes).',
    explanation: '`sizeof(type)` is evaluated at compile time to report the storage footprint in bytes of each C++ data type.'
  },
  'Exercise 4.7 Q3': {
    answer: '(a) If input is `Akilimali J`, output is `Akilimali -> Jkilimali`; (b) If input is `Salome A`, output is `Salome -> Aalome`; (c) If input is `Abas H`, output is `Abas -> Hbas`.',
    explanation: '`cin >> str1` reads the first word, `str2 = str1` copies it, `cin >> ch` reads the single character, and `str2[0] = ch` replaces the first character (index 0) of `str2` with `ch`.'
  },
  'Exercise 4.7 Q4': {
    answer: 'C++ program: read sides `a, b, c`; first check triangle validity (`a + b > c && a + c > b && b + c > a`), then if `a == b && b == c` output `"Equilateral Triangle"`, else if `a == b || b == c || a == c` output `"Isosceles Triangle"`, else output `"Scalene Triangle"`.',
    explanation: 'Comparing the three side lengths classifies any valid triangle into Equilateral (all 3 equal), Isosceles (2 equal), or Scalene (all 3 different).'
  },
  'Exercise 4.7 Q5': {
    answer: '`\'n\'` is the printable lowercase alphabetical character `n` (ASCII 110), whereas `\'\\n\'` is an escape sequence representing a single Newline control character (ASCII 10) that moves the cursor to the beginning of the next line.',
    explanation: 'The backslash `\\` in `\'\\n\'` tells the C++ compiler to interpret the character as a newline control code rather than the letter `n`.'
  },
  'Activity 4.3': {
    answer: 'Without declaring a `char` variable (`ch`), the program cannot dynamically store a user’s keyboard input via `cin` or subtract `32` from its ASCII value to convert any arbitrary lowercase letter to uppercase; you would have to hardcode fixed character literals for every single letter, making interactive input processing impossible.',
    explanation: 'Variables and data types provide named memory locations needed to read, manipulate, and output dynamic user data.'
  },
  'Exercise 4.8 Q1': {
    answer: 'Declaring a data type tells the compiler the exact number of bytes of memory to allocate for the variable, the encoding format (integer, IEEE floating-point, ASCII char), and which operations are valid—enabling compile-time type checking to catch bugs early.',
    explanation: 'Static type declaration ensures memory efficiency and prevents invalid operations (such as dividing strings).'
  },
  'Exercise 4.8 Q2': {
    answer: 'The output is `66`.',
    explanation: 'Because `x` is declared as an `int`, assigning the character literal `\'B\'` to `x` implicitly converts `\'B\'` to its ASCII integer code (`\'A\'` is 65, so `\'B\'` is 66), and `cout << x` prints the integer `66`.'
  },
  'Exercise 4.8 Q3': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    double num1, num2, sum;\n    cout << "Enter two numbers: ";\n    cin >> num1 >> num2;\n    sum = num1 + num2;\n    cout << "Sum = " << sum << endl;\n    return 0;\n}\n```',
    explanation: 'The program reads two numbers from standard input (`cin`), adds them using `+`, stores the result in `sum`, and displays it via `cout`.'
  },
  'Exercise 4.9 Q1': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    const double VAT_RATE = 0.182; // 18.2%\n    double purchasePrice, vat;\n    cout << "Enter purchase price: ";\n    cin >> purchasePrice;\n    vat = VAT_RATE * purchasePrice;\n    cout << "VAT to be paid = " << vat << endl;\n    return 0;\n}\n```',
    explanation: 'Declaring `const double VAT_RATE = 0.182;` ensures the 18.2% tax rate cannot be accidentally altered during execution.'
  },
  'Exercise 4.9 Q2': {
    answer: 'A variable is a named memory location whose stored value can be changed (reassigned) during program execution, whereas a constant (declared with `const` or `#define`) is an identifier whose value is fixed at initialization and cannot be modified anywhere in the program.',
    explanation: 'Attempting to reassign a `const` identifier results in a compile-time error.'
  },
  'Exercise 4.9 Q3': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    const double Pie = 3.1415926;\n    float Radius;\n    double Volume;\n    cout << "Enter the radius of the sphere: ";\n    cin >> Radius;\n    Volume = (4.0 / 3.0) * Pie * Radius * Radius * Radius;\n    cout << "Volume of the sphere = " << Volume << endl;\n    return 0;\n}\n```',
    explanation: 'Using `4.0 / 3.0` (floating-point division instead of integer `4 / 3`) with `const double Pie = 3.1415926` accurately computes $\\frac{4}{3}\\pi r^3$.'
  },
  'Exercise 4.9 Q4': {
    answer: 'Benefits of constants: prevent accidental modification of fixed values, improve code readability (`PI` vs magic numbers), and allow easy updates in one place. In the given program, `PI = 3.142;` is an error because `PI` is used without a data type declaration (it should be declared as `const double PI = 3.142;`).',
    explanation: 'In C++, every variable or constant must be declared with a data type before use (`error: \'PI\' was not declared in this scope`).'
  },
  'Exercise 4.9 Q5': {
    answer: 'After fixing `#include <iostream>`, the output is:\n`a = 5`\n`b = 4`\nMemory trace: Initially `a = 2, b = 5`; then `a = b` copies `5` into `a` (so `a = 5, b = 5`); finally `b = 4` overwrites `b` with `4` while `a` remains `5`.',
    explanation: 'Variable assignment `a = b;` copies the current value of `b` (5) into `a`’s memory cell; changing `b` to `4` afterwards does not affect `a`.'
  },
  'Exercise 4.10 Q1': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    double fahrenheit, centigrade;\n    cout << "Enter temperature in Fahrenheit: ";\n    cin >> fahrenheit;\n    centigrade = (5.0 / 9.0) * (fahrenheit - 32.0);\n    cout << "Temperature in Centigrade = " << centigrade << endl;\n    return 0;\n}\n```',
    explanation: 'Note that `5.0 / 9.0` must use floating-point literals because integer division `5 / 9` in C++ evaluates to `0`.'
  },
  'Exercise 4.10 Q2': {
    answer: 'The output is: `2%3 = 2`.',
    explanation: 'The modulo operator `%` returns the remainder of integer division: `2` divided by `3` has quotient `0` and remainder `2`.'
  },
  'Exercise 4.10 Q3': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    double x1, y1, x2, y2, slope;\n    cout << "Enter first point (x1 y1): ";\n    cin >> x1 >> y1;\n    cout << "Enter second point (x2 y2): ";\n    cin >> x2 >> y2;\n    slope = (y2 - y1) / (x2 - x1);\n    cout << "Slope = " << slope << endl;\n    return 0;\n}\n```',
    explanation: 'Declaring the coordinates as `double` ensures accurate floating-point division for `(y2 - y1) / (x2 - x1)`.'
  },
  'Exercise 4.10 Q4': {
    answer: '`cout` (character output stream, used with the insertion operator `<<`) sends formatted output data to the standard output device (screen/console), whereas `cin` (character input stream, used with the extraction operator `>>`) reads formatted input entered by the user from the standard input device (keyboard).',
    explanation: 'Both `cout` and `cin` are predefined stream objects declared in the `<iostream>` header within `namespace std`.'
  },
  'Exercise 4.10 Q5': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "VARIABLE\\tDATATYPE" << endl;\n    cout << "Name\\t\\tchar" << endl;\n    cout << "Decimals\\tdouble" << endl;\n    return 0;\n}\n```',
    explanation: 'Using the tab escape sequence `\\t` and `endl` formats the two-column table neatly on the console.'
  },
  'Exercise 4.10 Q6': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    char ch;\n    cout << "Enter a character: ";\n    cin >> ch;\n    if (ch >= \'a\' && ch <= \'z\')\n        cout << "Converted: " << char(ch - 32) << endl;\n    else if (ch >= \'A\' && ch <= \'Z\')\n        cout << "Converted: " << char(ch + 32) << endl;\n    else\n        cout << "The entered character is not an alphabetical letter" << endl;\n    return 0;\n}\n```',
    explanation: 'In ASCII, lowercase letters (`97–122`) and uppercase letters (`65–90`) differ by exactly 32, and any character outside both ranges is rejected.'
  },
  'Exercise 4.10 Q7': {
    answer: 'Exact output:\n`1 + 5 = 6`\n`13 + 89 = 102`\n`30 - 20 = 10`\n`46 - 90 = -44`\n`2 * 7 = 14`\n`5 / 2 = 2`\n`21 / 7 = 3`\n`35 % 6 = 5`\n`4 % 6 = 4`',
    explanation: 'Notice that `5 / 2` performs integer division and truncates the decimal part to output `2`, `35 % 6` leaves remainder `5`, and `4 % 6` leaves remainder `4`.'
  },
  'Exercise 4.11 Q1': {
    answer: 'There is a logical ordering error in the `if-else if` ladder: because `if (marks >= 60)` is checked first, any student scoring 70, 80, or 95 also satisfies `marks >= 60` and will wrongly be assigned `Grade = \'D\'` (the `>= 70`, `>= 80`, and `>= 90` branches are unreachable). Fix: check from highest to lowest (`if (marks >= 90) Grade = \'A\'; else if (marks >= 80) Grade = \'B\'; else if (marks >= 70) Grade = \'C\'; else if (marks >= 60) Grade = \'D\'; else Grade = \'F\';`).',
    explanation: 'In an `if-else if` chain, the first true condition executes and skips all remaining `else if` branches, so conditions must be ordered from most restrictive (`>= 90`) to least restrictive (`>= 60`).'
  },
  'Exercise 4.11 Q2': {
    answer: 'Read the 5 numbers into variables (or array `a[0..4]`) and use `if` comparisons (`if (a[j] > a[j+1]) swap(a[j], a[j+1]);`) across passes to sort and print them in ascending order from smallest to largest.',
    explanation: 'Pairwise `if` comparisons swap out-of-order elements until all five numbers are arranged in ascending order.'
  },
  'Exercise 4.11 Q3': {
    answer: 'For months 1, 3, 5, 7, 8, 10, 12 output `31 days`; for months 4, 6, 9, 11 output `30 days`; for month 2 (February), check leap year `if ((year % 400 == 0) || (year % 4 == 0 && year % 100 != 0))` to output `29 days`, otherwise `28 days`.',
    explanation: 'February has 29 days in leap years and 28 days in common years, while all other months have fixed lengths of 30 or 31 days.'
  },
  'Exercise 4.11 Q4': {
    answer: 'Outputs for each input: (a) Input `4` → `wow 4`; (b) Input `20` → `Oyaaa!20`; (c) Input `6` → `7`; (d) Input `18` → `29`; (e) Input `-6` → `wow -6`.',
    explanation: 'Tracing the nested `if`: (a) `4 < 11` and `4 != 6` prints `"wow "` then `4`; (b) `20 >= 11` and `20 != 18` prints `"Oyaaa!"` then `20`; (c) `6 < 11` and `input == 6` increments `input` to `7` and prints `7`; (d) `18 >= 11` and `input == 18` adds `11` (`18 + 11 = 29`) and prints `29`; (e) `-6 < 11` and `-6 != 6` prints `"wow -6"`.'
  },
  'Exercise 4.11 Q5': {
    answer: 'Read the 6 integers into an array `arr[6]`, compare all pairs `(i, j)` with `0 <= i < j < 6` using `if (arr[i] == arr[j]) hasDuplicate = true;`, and print `"DUPLICATE VALUES"` if `hasDuplicate` is true, or `"ALL ARE UNIQUE VALUES"` otherwise.',
    explanation: 'Checking every pair of the six input integers detects whether any two entries are equal.'
  },
  'Exercise 4.12 (Switch-Case Continuation on Page 269) Q1': {
    answer: '```cpp\nswitch (k) {\n    case 1: m += 5; break;\n    case 2: m += 10; break;\n    case 3: m += 16; break;\n    case 4: m += 34; break;\n}\n```',
    explanation: 'Each `else if (k == n)` branch maps to a `case n:` label terminated by a `break;` statement.'
  },
  'Exercise 4.12 (Switch-Case Continuation on Page 269) Q2': {
    answer: 'Outputs for each input `x`: For `x = 3`: `x + 3 = 6` (matches no case → prints nothing); For `x = 7`: `x + 3 = 10` (matches `case 10`, prints `x - 3` = `4`); For `x = 9`: `x + 3 = 12` (matches no case → prints nothing); For `x = 19`: `x + 3 = 22` (matches no case → prints nothing); For `x = 22`: `x + 3 = 25` (matches no case → prints nothing). (Note: `case 5` requires `x = 2` to print `2`, and `case 20` requires `x = 17` to print `20`).',
    explanation: 'The `switch` evaluates `x + 3`: only `x = 7` makes `x + 3 == 10`, matching `case 10:` which outputs `7 - 3 = 4`. The inputs 3, 9, 19, and 22 yield `x + 3` = 6, 12, 22, and 25, none of which match 5, 10, or 20.'
  },
  'Exercise 4.13 Q1': {
    answer: 'Use nested `for` loops from row `i = 0` to `n`: print leading spaces, initialize `val = 1`, and for column `j = 0` to `i` print `val` and update `val = val * (i - j) / (j + 1);`—producing `1`, `1 1`, `1 2 1`, `1 3 3 1`, `1 4 6 4 1` for power 4.',
    explanation: 'The binomial coefficient recurrence $\\binom{i}{j+1} = \\binom{i}{j} \\frac{i-j}{j+1}$ generates each row of Pascal’s triangle in $O(n^2)$ time.'
  },
  'Exercise 4.13 Q2': {
    answer: 'Use two nested `for` loops: `for (int i = 1; i <= 9; i++) { for (int j = 1; j <= 9; j++) cout << i * j << "\\t"; cout << endl; }` to display the complete 1-to-9 multiplication grid.',
    explanation: 'The outer loop iterates through rows 1–9 while the inner loop multiplies the row number `i` by columns 1–9.'
  },
  'Exercise 4.13 Q3': {
    answer: 'Prompt the user for choice (`1` = Factorial, `2` = Exponent) and use `switch(choice)`: in `case 1`, loop `for(int i = 1; i <= n; i++) fact *= i;`; in `case 2`, read `base` and `exp` and compute `pow(base, exp)` (or multiply `base` in a loop `exp` times).',
    explanation: 'Combining a `switch-case` menu with iterative loops cleanly handles both factorial ($n!$) and exponentiation ($b^e$).'
  },
  'Exercise 4.13 Q4': {
    answer: 'Prompt for `start`, `end`, and choice (Even/Odd/Prime); loop `for (int n = start; n <= end; n++)` and check `n % 2 == 0` for even, `n % 2 != 0` for odd, or trial division `for (int d = 2; d * d <= n; d++)` for prime numbers.',
    explanation: 'Iterating across the user-specified interval with modulo tests filters even, odd, or prime integers.'
  },
  'Exercise 4.13 Q5': {
    answer: 'The code prints: `0 1 2 3 4 5 6 7 8 9 ` (followed by a newline).',
    explanation: '`x` starts at `0` and the `do-while` loop prints `x` and increments it (`x++`) while `x < 10`, printing the digits `0` through `9` separated by spaces.'
  },
  'Exercise 4.14 Q1': {
    answer: 'Pass by Value (`void func(int x)`) passes a copy of the argument’s value into the function parameter, so changes inside the function do NOT affect the caller’s original variable; Pass by Reference (`void func(int &x)`) passes an alias/reference to the caller’s actual memory location, so modifications inside the function directly update the original variable.',
    explanation: 'Use pass-by-value when the original variable must remain unchanged, and pass-by-reference (`&`) when a function needs to modify the caller’s variable or avoid copying large objects.'
  },
  'Exercise 4.14 Q2': {
    answer: 'A Function Prototype is a declaration placed before `main()` ending with a semicolon (e.g., `int add(int a, int b);`) that tells the compiler the function’s name, return type, and parameter types; a Function Header is the first line of the actual function definition without a trailing semicolon (e.g., `int add(int a, int b)`) followed immediately by its `{ ... }` body.',
    explanation: 'Prototypes allow functions to be called in `main()` before their full definitions appear later in the source file.'
  },
  'Exercise 4.14 Q3': {
    answer: 'Define `bool isPrime(int n)` (returning `true` if `n >= 2` has no divisors up to $\\sqrt{n}$), prompt the user for the count `N` and type (`even`, `odd`, or `prime`), and loop until `N` matching numbers are printed (e.g., first 5 primes: `2, 3, 5, 7, 11`).',
    explanation: 'Modularising the primality test into `bool isPrime(int n)` keeps `main()` clean and reusable.'
  },
  'Exercise 4.14 Q4': {
    answer: '```cpp\n#include <iostream>\n#include <cmath>\nusing namespace std;\nint main() {\n    const double R = 0.12;\n    double P, A;\n    int n;\n    cout << "Enter principal amount invested (P): ";\n    cin >> P;\n    cout << "Enter number of years (n): ";\n    cin >> n;\n    A = P * pow(1 + R, n);\n    cout << "Total amount after " << n << " years = " << A << endl;\n    return 0;\n}\n```',
    explanation: 'Using `pow(1 + R, n)` from `<cmath>` with `R = 0.12` computes compound interest $A = P(1 + 0.12)^n$.'
  },
  'Exercise 4.15 Q1': {
    answer: 'Store student marks in `double marks[n]`, sum them in a `for` loop to compute `avg = sum / n`, and pass `avg` to `char getGrade(double avg)` which returns `\'A\'` for 81–100, `\'B\'` for 61–80, `\'C\'` for 41–60, `\'D\'` for 21–40, and `\'F\'` for 0–20.',
    explanation: 'Combining a 1D array for student marks with a grading function implements Table 4.18 cleanly.'
  },
  'Exercise 4.15 Q2': {
    answer: 'Read elements into `int mat[rows][cols]`, display the original matrix using nested loops `(i, j)`, and compute/display the transpose by swapping row and column indices `transpose[j][i] = mat[i][j]` (printing `cols` rows by `rows` columns).',
    explanation: 'The transpose $A^T$ of a matrix $A$ is formed by interchanging its rows and columns ($A^T_{j,i} = A_{i,j}$).'
  },
  'Exercise 4.15 Q3': {
    answer: '```cpp\nfor (int i = 0; i < 10; i++) {\n    for (int j = 0; j < 20; j++) {\n        cout << majumuisho[i][j] << " ";\n    }\n    cout << endl;\n}\n```',
    explanation: 'The outer loop iterates over the 10 rows (`0..9`), the inner loop prints the 20 elements (`0..19`) on the same line, and `cout << endl;` starts a new line after each row.'
  },
  'Exercise 4.15 Q4': {
    answer: '`12,500,000` elements ($50 \\times 100 \\times 100 \\times 25 = 12,500,000$).',
    explanation: 'The total number of elements in a multi-dimensional array is the product of all its dimension sizes: $50 \\times 100 \\times 100 \\times 25 = 12,500,000$.'
  },
  'Exercise 4.16 Q1': {
    answer: 'An array is a fixed-size contiguous collection of elements of any single data type (`int`, `double`, `char`, etc.), whereas a string is specifically a sequence of characters terminated by a null character `\'\\0\'` (in C-strings `char[]`) or managed dynamically as a `std::string` object with built-in text manipulation methods.',
    explanation: 'All C-style strings are character arrays terminated by `\'\\0\'`, whereas general arrays can hold any data type and do not have a null terminator.'
  },
  'Exercise 4.16 Q2': {
    answer: 'The null character `\'\\0\'` (ASCII 0) marks the exact end of a C-style character string in memory so functions like `cout << str`, `strlen()`, and `strcpy()` know where the string stops and do not keep reading adjacent garbage memory.',
    explanation: 'Without `\'\\0\'`, string functions have no way to know how many characters belong to the string inside a `char` array.'
  },
  'Exercise 4.16 Q3': {
    answer: '```cpp\n#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string msg = "C++ programming language";\n    cout << msg << endl;\n    return 0;\n}\n```',
    explanation: 'Initializing a `string` (or `char msg[] = "C++ programming language";`) and passing it to `cout` displays the statement.'
  },
  'Exercise 4.16 Q4': {
    answer: 'No, a standard C++ array is homogeneous and can only store elements of a single declared data type (either all `double` or all `int`). However, if you declare a `double` array, integer values assigned into it will be implicitly converted to `double` (e.g., `5` becomes `5.0`), or you can use a `struct`/`class` to group mixed types.',
    explanation: 'Arrays compute element addresses as `base_address + index * sizeof(ElementType)`, which requires every element to have the exact same type and size.'
  },
  'Exercise 4.16 Q5': {
    answer: 'C++ does not perform automatic bounds checking on `[]`, so accessing an array with a negative index (e.g., `arr[-1]`) causes Undefined Behavior—reading or overwriting memory located before the start of the array, which produces garbage values, corrupts other variables, or crashes the program with a Segmentation Fault.',
    explanation: '`arr[-1]` translates to `*(arr - 1)`, which dereferences an out-of-bounds memory address outside the array.'
  },
  'Exercise 4.17 Q1': {
    answer: '```cpp\n#include <iostream>\n#include <string>\nusing namespace std;\nclass Book {\npublic:\n    string author, title, ISBN;\n    void displayDetails() {\n        cout << "Title: " << title << ", Author: " << author << ", ISBN: " << ISBN << endl;\n    }\n};\n```',
    explanation: 'The `Book` class encapsulates `author`, `title`, and `ISBN` attributes along with a member function `displayDetails()` to print them.'
  },
  'Exercise 4.17 Q2': {
    answer: '```cpp\nclass Car {\npublic:\n    string make, model;\n    int year, speed = 0;\n    void accelerate(int inc) { speed += inc; }\n    void brake(int dec) { speed = (speed - dec > 0) ? speed - dec : 0; }\n};\n```',
    explanation: 'The `Car` class defines attributes `make`, `model`, `year`, and `speed` and modifies `speed` through `accelerate()` and `brake()` methods.'
  },
  'Exercise 4.17 Q3': {
    answer: 'The code fails to compile with a compile-time access error (`\'int Animal::y\' is private within this context`), because in C++ class members are `private` by default when no access specifier (`public:`) is written. To fix it, add `public:` before `int y;` inside `class Animal`.',
    explanation: 'Unlike `struct` (where members default to `public`), a C++ `class` makes all members `private` by default until a `public:` or `protected:` label is specified.'
  },
  'Exercise 4.18 Q1': {
    answer: 'Define `class BankAccount` with `private` attributes `accountNumber`, `balance`, `ownerName` and `public` methods `deposit()`, `withdraw()`, `display()`, then derive `class SavingsAccount : public BankAccount` with `interestRate` and `applyInterest()`. Abstraction hides internal bookkeeping and balance validation behind simple high-level method calls.',
    explanation: 'Users of `BankAccount` and `SavingsAccount` interact with simple methods (`deposit`, `applyInterest`) without needing to manage internal state calculations.'
  },
  'Exercise 4.18 Q2': {
    answer: 'Define base `class LibraryItem` with `title`, `author`, `ISBN` and `virtual void getDetails()`, then derive `Book` (adding `pageCount`) and `Magazine` (adding `issueNumber`). Abstraction provides a uniform catalog interface (`LibraryItem`) so librarians and users can search and display any item type cleanly.',
    explanation: 'Common attributes are abstracted into `LibraryItem` while specialized fields live in `Book` and `Magazine`.'
  },
  'Exercise 4.18 Q3': {
    answer: '`BankAccount` serves as the base class holding common attributes (`accountNumber`, `holderName`, `balance`) and methods (`deposit()`, `withdraw()`), while `SavingsAccount` (adds `interestRate`), `CheckingAccount` (adds `overdraftLimit`), and `LoanAccount` (adds `loanTerm`, `emi`) inherit from `BankAccount`. Benefits: eliminates duplicated code, ensures consistent account rules, and centralizes maintenance.',
    explanation: 'Shared banking operations are written once in `BankAccount` and reused across all specialized account subclasses.'
  },
  'Exercise 4.18 Q4': {
    answer: 'Declare `private: double balance;` inside `BankAccount` so external code cannot write `acc.balance = 1000000;`, and expose `public` methods `deposit(double amt)` (checking `amt > 0`), `withdraw(double amt)` (checking `amt > 0 && amt <= balance`), and `double getBalance() const` (returning a read-only copy of `balance`).',
    explanation: 'Encapsulation guarantees that `balance` can only transition through valid, audited banking transactions.'
  },
  'Exercise 4.18 Q5': {
    answer: 'Declare an abstract base class `Shape` with a pure virtual function `virtual double calculateArea() = 0;`, and override `calculateArea()` in derived classes `Circle` ($\\pi r^2$), `Rectangle` ($l \\times w$), and `Triangle` ($\\frac{1}{2} b h$). Using a base pointer `Shape* s`, calling `s->calculateArea()` dynamically dispatches the correct formula at runtime.',
    explanation: 'Pure virtual functions (`= 0`) define an abstract contract in C++ and enable runtime polymorphism via dynamic binding.'
  },
  'Exercise 4.18 Q6': {
    answer: 'In a combined C++ OOP program: Encapsulation is shown by `private:` data fields accessed via `public:` getters/setters; Abstraction is shown by an abstract class with `virtual void func() = 0;`; Inheritance is shown by `class Derived : public Base`; and Polymorphism is shown by overriding `virtual` methods and calling them through a `Base*` pointer.',
    explanation: 'The four OOP pillars work together: abstraction defines contracts, encapsulation protects state, inheritance reuses code, and polymorphism enables dynamic behavior.'
  },
  'Revision Exercise 4 Q1': {
    answer: 'The program calculates and displays the sum of the digits of a positive integer entered by the user. `#include <iostream>` includes the standard input/output stream library (`cin`/`cout`), and `system("PAUSE");` pauses console execution on Windows until the user presses a key. Potential issue: `system("PAUSE")` requires `#include <cstdlib>` (or `<stdlib.h>`) and is non-portable across non-Windows OSs, and `temp` is assigned `num` but never used.',
    explanation: '`num % 10` extracts the last digit and `num = num / 10` removes the last digit in each iteration, summing all digits of `num`.'
  },
  'Revision Exercise 4 Q2': {
    answer: 'Stating a data type when declaring variables informs the C++ compiler how much memory (in bytes) to allocate, how to interpret the binary bits stored in that memory (e.g., two’s complement integer vs IEEE 754 float vs ASCII character), and which operators are legal for that variable.',
    explanation: 'C++ is a statically typed language, so every variable must have a known compile-time type.'
  },
  'Revision Exercise 4 Q3': {
    answer: 'Declare the variable using the `const` keyword (or `constexpr`) at initialization—for example, `const double PI = 3.14159;`—so the C++ compiler forbids any subsequent assignment or modification.',
    explanation: 'The `const` qualifier enforces read-only immutability at compile time.'
  },
  'Revision Exercise 4 Q4': {
    answer: 'Given $a = 7, y = 4, z = 3, u = 2$: (i) `(a + z) % y` = `(7 + 3) % 4` = `10 % 4` = `2`; (ii) `(a + y) % u` = `(7 + 4) % 2` = `11 % 2` = `1`; (iii) `(y + u) % a` = `(4 + 2) % 7` = `6 % 7` = `6`; (iv) `(a + y) * u` = `(7 + 4) * 2` = `22`; (v) `(a % y) % z` = `(7 % 4) % 3` = `3 % 3` = `0`; (vi) `(y % z) % u` = `(4 % 3) % 2` = `1 % 2` = `1`; (vii) `(a * z) % y` = `(7 * 3) % 4` = `21 % 4` = `1`; (viii) `((a * y) * u) * z` = `((7 * 4) * 2) * 3` = `56 * 3` = `168`.',
    explanation: 'All eight integer expressions are valid because all operands are non-zero integers: parentheses are evaluated innermost-first, followed by `*` and `%`.'
  },
  'Revision Exercise 4 Q5': {
    answer: 'Exact evaluations: (a) `15 / 3` = `5`; (b) `17 - 12 / 4 * 2` = `17 - 3 * 2` = `17 - 6` = `11`; (c) `34 % 7` = `6`; (d) `3 - 7 % 7` = `3 - 0` = `3`; (e) `18.0 / 4` = `4.5`; (f) `20 - 5 / 2.0` = `20 - 2.5` = `17.5`; (g) `13 + 5 % 2 - 3` = `13 + 1 - 3` = `11`; (h) `15.0 + 3.0 * 2.0 / 5.0` = `15.0 + 6.0 / 5.0` = `15.0 + 1.2` = `16.2`.',
    explanation: 'Multiplicative operators (`*`, `/`, `%`) have higher precedence than additive operators (`+`, `-`) and associate left-to-right; floating-point operands (`.0`) preserve decimal fractions.'
  },
  'Revision Exercise 4 Q6': {
    answer: '(a) Switch-case syntax:\n```cpp\nswitch (expression) {\n    case constant1: statements; break;\n    case constant2: statements; break;\n    default: statements;\n}\n```\n(b) Variable declaration and initialisation syntax: `dataType variableName = initialValue;` (e.g., `int score = 95;`).',
    explanation: 'A `switch` tests an integral/char expression against constant `case` labels, while variable declaration specifies type, identifier, and initial value.'
  },
  'Revision Exercise 4 Q7': {
    answer: 'Create a base class `Vehicle` with `virtual void drive() = 0;`, derive `Car`, `Truck`, and `Motorcycle` overriding `drive()` with vehicle-specific physics/steering, and store active vehicles as `Vehicle*` pointers so the game engine calls `v->drive()` polymorphically; adding a new `Bus` class later requires zero changes to the game loop.',
    explanation: 'Polymorphism decouples the game engine loop from specific vehicle implementations, making the game extensible and maintainable.'
  },
  'Revision Exercise 4 Q8': {
    answer: 'Prompt for `a, b, c`, compute discriminant $D = b^2 - 4ac$: if $D > 0$, display two distinct real roots $(-b \\pm \\sqrt{D}) / (2a)$; if $D == 0$, display one repeated real root $-b / (2a)$; if $D < 0$, display complex conjugate roots $-b/(2a) \\pm i\\sqrt{-D}/(2a)$.',
    explanation: 'Checking the sign of the discriminant $b^2 - 4ac$ handles all three root cases (real distinct, real equal, and complex).'
  },
  'Revision Exercise 4 Q9': {
    answer: 'Define `double largest(double arr[], int n)` that initializes `maxVal = arr[0]` and loops `for(int i = 1; i < n; i++) if(arr[i] > maxVal) maxVal = arr[i]; return maxVal;`, then read 10 numbers in `main()` and call `largest(arr, 10)`.',
    explanation: 'A linear scan function finds the maximum of 10 numbers in 9 comparisons.'
  },
  'Revision Exercise 4 Q10': {
    answer: 'Define `int findGreatest(int a, int b, int c) { int max = a; if (b > max) max = b; if (c > max) max = c; return max; }`, read three integers from the user in `main()`, and print `findGreatest(x, y, z)`.',
    explanation: 'Encapsulating the comparison in a function returns the largest of the three integer arguments.'
  },
  'Revision Exercise 4 Q11': {
    answer: '```cpp\n#include <iostream>\nusing namespace std;\nint main() {\n    int n, rev = 0;\n    cout << "Enter a number: ";\n    cin >> n;\n    while (n != 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    cout << "Reversed number: " << rev << endl;\n    return 0;\n}\n```',
    explanation: 'In each iteration, `n % 10` extracts the last digit and `rev = rev * 10 + digit` shifts previous digits left, turning `5261` into `1625`.'
  },
  'Revision Exercise 4 Q12': {
    answer: '(a) First element: `orodha[0]`; (b) Very last element: `orodha[99]`; (c) Code fragment to print all elements: `for (int i = 0; i < 100; i++) cout << orodha[i] << " ";`; (d) `orodha[3.0]` is **illegal** in C++ (`error: invalid types \'int[100][double]\' for array subscript`), because an array subscript index must be an integral type (`int`, `char`, `size_t`), not a floating-point `double` (`3.0`).',
    explanation: 'C++ arrays are 0-indexed (`0` to `N-1`), and the subscript operator `[]` strictly requires an integer expression, rejecting floating-point literals like `3.0`.'
  },
  'Revision Exercise 4 Q13': {
    answer: 'NMB ATM Algorithm: (1) Read `balance` and requested `amount`; (2) If `balance <= 0`, display `"Withdrawal not allowed: zero or negative balance"` and stop; (3) If `amount > 1000000`, display `"Maximum daily withdrawal limit is Tshs 1,000,000/="` and stop; (4) Calculate base `charge = (amount > 335000) ? 0.06 * (amount - 335000) : 0`; (5) If `amount + charge > balance`, inform customer of insufficient funds and offer overdraft/option with `charge += 1250` (if accepted and covered, proceed; else cancel); (6) Dispense `amount` and update `balance = balance - (amount + charge)`.',
    explanation: 'The algorithm enforces every NMB ATM business rule in sequence: positive balance check, Tshs 1,000,000 cap, 6% tiered fee above Tshs 335,000, and the Tshs 1,250 insufficient-funds fee.'
  },
  'Revision Exercise 4 Q14': {
    answer: 'Compile-time (static) polymorphism is resolved by the compiler using Function Overloading (e.g., `add(int, int)` vs `add(double, double)`) or Operator Overloading; Runtime (dynamic) polymorphism is resolved at execution time using Inheritance, `virtual` functions, and base-class pointers/references (e.g., `Shape* s = new Circle(); s->draw();`).',
    explanation: 'Static binding selects the overloaded function by parameter signature at compile time, while dynamic binding uses the virtual table (`vtable`) at runtime.'
  },
  'Revision Exercise 4 Q15': {
    answer: 'Define base `class Shape { public: virtual double area() = 0; virtual double perimeter() = 0; };`, and derive `Circle` (`r`: area $\\pi r^2$, perimeter $2\\pi r$), `Rectangle` (`l, w`: area $lw$, perimeter $2(l+w)$), and `Triangle` (`a, b, c`: area via Heron’s formula, perimeter $a+b+c$) overriding both virtual functions.',
    explanation: 'Each derived class overrides `area()` and `perimeter()` with its exact geometric formulas.'
  },
  'Revision Exercise 4 Q16': {
    answer: 'Pattern (a) Inverted Star Triangle: `for(int i=5; i>=1; i--) { for(int s=0; s<5-i; s++) cout<<"  "; for(int j=1; j<=2*i-1; j++) cout<<"* "; cout<<endl; }` (prints 9, 7, 5, 3, 1 stars). Pattern (b) Number Triangle: `for(int i=1; i<=5; i++) { for(int j=1; j<=i; j++) cout<<i<<" "; cout<<endl; }` (prints `1`, `2 2`, `3 3 3`, `4 4 4 4`, `5 5 5 5 5`).',
    explanation: 'Nested `for` loops control the row count, leading spaces, and number of symbols printed per row.'
  },
  'Revision Exercise 4 Q17': {
    answer: 'Prompt for `year` and `month` (1–12), compute the starting weekday using Zeller’s congruence or days elapsed since 1800 (`getStartDay`), determine days in the month (28/29 for Feb using `isLeapYear(year)`, 30 or 31 for others), print the month/year header and `Sun Mon Tue Wed Thu Fri Sat`, and loop from `1` to `daysInMonth` using `setw(4)` with a newline after every 7th column.',
    explanation: 'Combining `isLeapYear()`, `getStartDay()`, and `<iomanip>` `setw()` formats the monthly calendar grid accurately.'
  },
  'Scenario 5.1 Q1': {
    answer: 'In "Java Kinywaji", a Java OOP inventory system models each beverage/ingredient as an `Item` object with encapsulated `stockQuantity`, `reorderThreshold`, and `unitPrice` fields, automatically deducting stock on every sale, triggering low-stock alerts, and generating accurate real-time sales reports.',
    explanation: 'Object-oriented classes automate stock tracking and prevent human counting errors or stockouts.'
  },
  'Scenario 5.1 Q2': {
    answer: 'The Java system speeds up ordering by displaying real-time drink availability and prices, calculating order totals and change instantly through `Order` and `Payment` objects, and queuing preparation tickets directly to the counter—reducing waiting queues and billing mistakes.',
    explanation: 'Real-time synchronization between `Order`, `Inventory`, and `Billing` objects streamlines customer service.'
  },
  'Exercise 5.1 Q1': {
    answer: '```java\npublic class Car {\n    String make, model;\n    int year;\n    public Car(String make, String model, int year) {\n        this.make = make; this.model = model; this.year = year;\n    }\n    public void display() {\n        System.out.println(year + " " + make + " " + model);\n    }\n    public static void main(String[] args) {\n        new Car("Toyota", "Hilux", 2023).display();\n        new Car("Nissan", "Patrol", 2022).display();\n        new Car("Honda", "CR-V", 2024).display();\n    }\n}\n```',
    explanation: 'Three distinct `Car` objects are instantiated with `new Car(...)` and their properties are printed via `display()`.'
  },
  'Exercise 5.1 Q2': {
    answer: '```java\npublic class Rectangle {\n    double length, width;\n    public Rectangle(double l, double w) { length = l; width = w; }\n    public double getArea() { return length * width; }\n    public double getPerimeter() { return 2 * (length + width); }\n    public static void main(String[] args) {\n        Rectangle r = new Rectangle(8.0, 5.0);\n        System.out.println("Area: " + r.getArea() + ", Perimeter: " + r.getPerimeter());\n    }\n}\n```',
    explanation: '`getArea()` returns `length * width` and `getPerimeter()` returns `2 * (length + width)` for the instantiated `Rectangle` object.'
  },
  'Exercise 5.1 Q3': {
    answer: '```java\npublic class Student {\n    String name;\n    int age;\n    static String schoolName = "Azania Secondary School";\n    public Student(String n, int a) { name = n; age = a; }\n    public void printDetails() {\n        System.out.println(name + " (" + age + ") - " + schoolName);\n    }\n    public static void main(String[] args) {\n        new Student("Asha", 18).printDetails();\n        new Student("Juma", 19).printDetails();\n        new Student("Neema", 18).printDetails();\n    }\n}\n```',
    explanation: 'Declaring `static String schoolName` makes it a class variable shared by all `Student` instances, while `name` and `age` are separate instance variables per object.'
  },
  'Exercise 5.1 Q4': {
    answer: '```java\npublic class BankAccount {\n    String accountNumber;\n    double balance;\n    public BankAccount(String acc, double bal) { accountNumber = acc; balance = bal; }\n    public void deposit(double amt) { if (amt > 0) balance += amt; }\n    public void withdraw(double amt) { if (amt > 0 && amt <= balance) balance -= amt; }\n    public double getBalance() { return balance; }\n}\n```',
    explanation: 'The `BankAccount` class encapsulates `accountNumber` and `balance` and performs deposit, withdrawal, and balance-inquiry transactions.'
  },
  'Worked Bitwise Shift Questions (Page 335) Q1': {
    answer: 'For `6 << 1`: Binary of `6` is `00000110`. Shifting all bits left by 1 position inserts a `0` on the right, giving binary `00001100`, which equals `12` in decimal ($6 \\times 2^1 = 12$).',
    explanation: 'A bitwise left shift by $n$ positions (`x << n`) multiplies an integer by $2^n$.'
  },
  'Worked Bitwise Shift Questions (Page 335) Q2': {
    answer: 'For `7 >> 2`: Binary of `7` is `00000111`. Shifting right by 2 bits drops the two rightmost `1` bits and pads zeros on the left, giving binary `00000001`, which equals `1` in decimal ($\\lfloor 7 / 2^2 \\rfloor = 1$).',
    explanation: 'A signed right shift by $n$ positions (`x >> n`) divides a positive integer by $2^n$ and truncates the remainder.'
  },
  'Worked Bitwise Shift Questions (Page 335) Q3': {
    answer: 'For `60 >> 2`: Binary of `60` is `00111100`. Shifting right by 2 bits drops the two rightmost `0` bits and inserts two leading zeros, giving binary `00001111`, which equals `15` in decimal ($60 / 2^2 = 15$).',
    explanation: 'Shifting `00111100` (60) right by 2 positions yields `00001111` (15).'
  },
  'Exercise 5.2 Q1': {
    answer: '```java\npublic class MyFamily {\n    int members = 6;\n}\n```',
    explanation: 'The `public` and `class` keywords declare a publicly accessible Java class named `MyFamily`.'
  },
  'Exercise 5.2 Q2': {
    answer: '```java\nMyFamily OurGarden = new MyFamily();\n```',
    explanation: 'The `new` keyword allocates memory on the heap and invokes the `MyFamily()` constructor to create the object `OurGarden`.'
  },
  'Exercise 5.2 Q3': {
    answer: '```java\npublic class MyFamily {\n    int treesCount = 25;\n    public static void main(String[] args) {\n        MyFamily OurGarden = new MyFamily();\n        System.out.println("Number of trees: " + OurGarden.treesCount);\n    }\n}\n```',
    explanation: 'The dot operator (`OurGarden.treesCount`) accesses the `int` member variable of the `OurGarden` object and prints its value.'
  },
  'Exercise 5.3 Q1': {
    answer: '```java\nclass Car {\n    String brand, model;\n    public Car(String brand, String model) {\n        this.brand = brand;\n        this.model = model;\n    }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Car c = new Car("Toyota", "Land Cruiser");\n        System.out.println(c.brand + " " + c.model);\n    }\n}\n```',
    explanation: 'The parameterized constructor `Car(String brand, String model)` initializes the object’s fields as soon as `new Car(...)` is called.'
  },
  'Exercise 5.3 Q2': {
    answer: '```java\nclass Book {\n    String title, author;\n    double price;\n    public Book(String title, String author, double price) {\n        this.title = title; this.author = author; this.price = price;\n    }\n    public void display() {\n        System.out.println(title + " by " + author + " - TZS " + price);\n    }\n}\n```',
    explanation: 'Multiple `Book` objects can be instantiated in `Main` using the parameterized constructor and displayed via `display()`.'
  },
  'Exercise 5.3 Q3': {
    answer: '```java\nclass Employee {\n    String name;\n    double salary;\n    public Employee() {\n        this.name = "Unknown";\n        this.salary = 0;\n    }\n}\n```',
    explanation: 'A default (no-argument) constructor sets safe initial values (`"Unknown"` and `0`) whenever `new Employee()` is called without arguments.'
  },
  'Exercise 5.3 Q4': {
    answer: 'Java does not use explicit C++-style destructors (`~Class()`) and deprecated `finalize()` because the JVM’s automatic Garbage Collector (GC) tracks object reachability on the heap and automatically reclaims memory of unreferenced objects in the background, preventing memory leaks and dangling pointers.',
    explanation: 'For non-memory resources like files or sockets, Java uses `AutoCloseable` and `try-with-resources` instead of destructors.'
  },
  'Exercise 5.3 Q5': {
    answer: '```java\npublic class DatabaseConnection {\n    private boolean connected;\n    public DatabaseConnection() {\n        connected = true;\n        System.out.println("Database connection opened.");\n    }\n    public void closeConnection() {\n        connected = false;\n        System.out.println("Database connection closed safely.");\n    }\n}\n```',
    explanation: 'Because Java garbage collection runs at non-deterministic times, external resources like database connections must be explicitly closed via a method like `closeConnection()` (or `try-with-resources`).'
  },
  'Exercise 5.4 Q1': {
    answer: 'Inheritance in Java (using the `extends` keyword, e.g., `class Dog extends Animal`) allows a subclass to inherit non-private fields and methods from a superclass, promoting code reuse and allowing subclasses to add new methods or override inherited ones.',
    explanation: '`extends` establishes an "is-a" relationship between the child class and parent class.'
  },
  'Exercise 5.4 Q2': {
    answer: 'Single inheritance means a class `extends` only one superclass, whereas multiple inheritance means inheriting from more than one parent. Java forbids multiple inheritance of classes (to avoid ambiguity and the diamond problem in state/method resolution) and instead achieves multiple inheritance of type through `interfaces` (a class can `implement` multiple interfaces).',
    explanation: 'By allowing a class to `extend` one class and `implement` any number of interfaces, Java gains the flexibility of multiple inheritance without state conflicts.'
  },
  'Exercise 5.4 Q3': {
    answer: 'An `interface` in Java defines a contract of abstract method signatures (and constants); a class uses the `implements` keyword to implement multiple interfaces at once (e.g., `class SmartPhone implements Camera, GPS, MusicPlayer`) and provides concrete method bodies for all declared interface methods.',
    explanation: 'Interfaces decouple *what* capabilities a class supports from *how* those capabilities are implemented.'
  },
  'Exercise 5.4 Q4': {
    answer: 'The Diamond Problem occurs when class `D` inherits from two classes `B` and `C` that both inherit from `A` and override the same method—creating ambiguity over which version `D` inherits. Java avoids this because classes cannot extend multiple classes, and interfaces contain no conflicting instance state (and require explicit disambiguation if two interfaces provide default methods with the same signature).',
    explanation: 'Java’s single-class inheritance + multi-interface model eliminates ambiguous state and method resolution.'
  },
  'Exercise 5.4 Q5': {
    answer: 'An `abstract class` (declared with `abstract`) can contain both abstract methods and concrete methods plus instance variables and constructors, whereas an `interface` defines a pure capability contract (no instance fields). Use an abstract class for closely related classes sharing common code/state (`Vehicle → Car`), and use an interface for unrelated classes sharing a capability (`Flyable → Bird, Airplane`).',
    explanation: 'Abstract classes share base state and implementation; interfaces share behavioral contracts across class hierarchies.'
  },
  'Exercise 5.4 Q6': {
    answer: 'Inheritance and interfaces allow a single superclass or interface variable (`Animal a` or `Payable p`) to reference objects of any subclass or implementing class (`Dog`, `Cat`, `Employee`, `Invoice`) and invoke overridden methods dynamically at runtime, making systems extensible and loosely coupled.',
    explanation: 'Code written against an interface or superclass works seamlessly with any new implementation class.'
  },
  'Exercise 5.5 Q1': {
    answer: 'In Java, abstraction is implemented using `abstract class` (e.g., `abstract class Shape { abstract double area(); }`) and `interface` (e.g., `interface Drawable { void draw(); }`), hiding complex implementation details behind essential method signatures.',
    explanation: 'Callers interact with `Shape` or `Drawable` methods without needing to know the internal formulas of `Circle` or `Rectangle`.'
  },
  'Exercise 5.5 Q2': {
    answer: 'An abstract method is declared without a method body (`abstract void processPayment(double amt);`); it forces every concrete subclass or implementing class to provide its own specific implementation while guaranteeing a uniform method signature to callers.',
    explanation: 'Abstract methods separate the public operation signature from the class-specific algorithm.'
  },
  'Exercise 5.5 Q3': {
    answer: 'In a payment gateway supporting M-Pesa, Tigo Pesa, and Visa Card, define an interface `PaymentProcessor { boolean pay(double amount); }`; the checkout code simply calls `processor.pay(total)` without needing to know the internal API, encryption, or USSD protocol of each provider.',
    explanation: 'Abstraction shields the checkout module from the internal complexity of each payment provider.'
  },
  'Exercise 5.5 Q4': {
    answer: 'Data hiding (making internal fields `private`) is the mechanism that enforces encapsulation, while abstraction is the design level that exposes only high-level operations (e.g., `car.startEngine()`) while hiding internal data (`fuelInjectionRate`, `sparkTiming`) and helper methods.',
    explanation: 'Abstraction focuses on *what* an object does externally, while data hiding protects *how* its internal state is stored.'
  },
  'Exercise 5.5 Q5': {
    answer: 'Define `abstract class BankAccount { protected double balance; public abstract void calculateInterest(); }` and subclasses `SavingsAccount` and `CheckingAccount` that implement `calculateInterest()`; the bank’s monthly batch processor can iterate over `List<BankAccount>` and call `acc.calculateInterest()` uniformly.',
    explanation: 'Abstraction simplifies system maintenance because adding a new `FixedDepositAccount` requires no changes to the batch processor.'
  },
  'Exercise 5.6 Q1': {
    answer: 'In Java: `public` members are accessible from any class anywhere; `private` members are accessible only within the declaring class itself (used for sensitive attributes like `password` or `balance`); `protected` members are accessible within the same package and by subclasses (`extends`) even in different packages.',
    explanation: 'Choosing the most restrictive access modifier needed enforces the principle of least privilege.'
  },
  'Exercise 5.6 Q2': {
    answer: 'The `this` keyword is a reference to the current object instance: it is used to disambiguate instance variables from parameters with the same name (`this.name = name;`), to invoke another constructor in the same class (`this(defaultName);`), or to pass the current object as an argument to another method.',
    explanation: 'Without `this.name = name;`, a parameter named `name` would shadow the instance variable `name`.'
  },
  'Exercise 5.6 Q3': {
    answer: 'The `final` keyword enforces immutability: a `final` variable becomes a constant whose value cannot be reassigned (`final double PI = 3.14159;`); a `final` method cannot be overridden by any subclass; and a `final` class (like `java.lang.String`) cannot be extended/subclassed.',
    explanation: '`final` is used for constants, security-sensitive methods, and immutable classes.'
  },
  'Exercise 5.6 Q4': {
    answer: 'Yes, a local variable inside a method can be declared `final` (e.g., `final int maxAttempts = 3;`); once initialized, its value cannot be modified for the remainder of that method’s execution (which is also required when passing local variables into anonymous inner classes or lambdas).',
    explanation: 'Local `final` variables prevent accidental reassignment inside complex method bodies.'
  },
  'Exercise 5.6 Q5': {
    answer: 'Trying to access a `private` variable directly from another class causes a compile-time error (`variable has private access`). Instead, the class provides public getter and setter methods that internally use `this.variableName` (e.g., `public int getAge() { return this.age; }` and `public void setAge(int age) { this.age = age; }`) so other classes can read or update it safely.',
    explanation: '`this` is used inside the class’s own public getter/setter methods to reference the private instance field.'
  },
  'Exercise 5.7 Q1': {
    answer: 'Encapsulation in Java is the practice of wrapping data fields (`private` variables) and the methods that operate on them (`public` getters/setters) into a single class unit; it is vital for data validation, security, modularity, and maintaining invariants without breaking external callers.',
    explanation: 'Encapsulation isolates internal implementation changes from the rest of the application.'
  },
  'Exercise 5.7 Q2': {
    answer: '`private` hides internal fields completely inside the class (the core of encapsulation); `protected` exposes fields/methods to subclasses for inheritance; and `public` exposes the controlled getter/setter and service methods that form the class’s external interface.',
    explanation: 'Combining `private` fields with `public` methods creates a protective boundary around object state.'
  },
  'Exercise 5.7 Q3': {
    answer: 'Encapsulation protects code integrity by validating data inside setters before saving it: for example, in a `Student` class with `private double gpa`, `setGpa(double g)` checks `if (g >= 0.0 && g <= 5.0)` before updating `this.gpa`, making it impossible for external code to set an invalid GPA like `-3.0` or `99.0`.',
    explanation: 'Centralizing validation inside setters prevents corrupted state across the entire program.'
  },
  'Exercise 5.7 Q4': {
    answer: 'Steps to achieve encapsulation in Java: (1) Declare all class attributes as `private` (e.g., `private String name;`); (2) Provide a `public` constructor to initialize valid state; (3) Implement `public` getter methods (`getName()`) to read attribute values; and (4) Implement `public` setter methods (`setName(String name)`) with validation logic to modify attribute values.',
    explanation: 'Following this 4-step JavaBean pattern ensures full control over how every field is read and updated.'
  },
  'Exercise 5.7 Q5': {
    answer: 'Getters and setters allow validation, read-only or write-only properties, automatic logging/auditing, and changing internal data structures later without breaking caller code—for example, a hospital `Patient` class can log every access in `getMedicalRecord()` and validate dosage limits in `setDosage()`.',
    explanation: 'Direct field access cannot validate inputs or trigger audit logs, whereas getters and setters can.'
  },
  'Exercise 5.7 Q6': {
    answer: 'Exposing attributes as `public` allows any part of the program to assign invalid, null, or out-of-range values directly (e.g., `account.balance = -50000;`), tightly couples callers to internal variable names, and makes debugging state corruption difficult; encapsulation mitigates this by funneling all writes through validated setter methods.',
    explanation: 'Public mutable fields violate data integrity and break modularity.'
  },
  'Exercise 5.7 Q7': {
    answer: '```java\npublic class BankAccount {\n    private String accountNumber;\n    private double balance;\n    private String customerName;\n    public String getAccountNumber() { return accountNumber; }\n    public void setAccountNumber(String acc) { this.accountNumber = acc; }\n    public double getBalance() { return balance; }\n    public void setBalance(double bal) { if (bal >= 0) this.balance = bal; }\n    public String getCustomerName() { return customerName; }\n    public void setCustomerName(String name) { this.customerName = name; }\n}\n```',
    explanation: 'All three fields are `private` and accessed exclusively via validated `public` getter and setter methods.'
  },
  'Exercise 5.8 Q1': {
    answer: 'Polymorphism ("many forms") in Java is the ability of a single method name or reference variable to perform different actions depending on the parameters passed or the runtime object type; it makes programs flexible and extensible because new subclasses can plug into existing code without modifying caller logic.',
    explanation: 'Polymorphism allows programmers to write general code that adapts automatically to specific object types.'
  },
  'Exercise 5.8 Q2': {
    answer: 'Compile-time polymorphism (Method Overloading) defines multiple methods with the same name but different parameter lists in the same class (e.g., `add(int a, int b)` and `add(double a, double b)`); Runtime polymorphism (Method Overriding) occurs when a subclass provides its own implementation of a method inherited from a superclass (e.g., `Dog.makeSound()` overriding `Animal.makeSound()`).',
    explanation: 'Overloading is resolved at compile time by parameter types; overriding is resolved at runtime by actual object type.'
  },
  'Exercise 5.8 Q3': {
    answer: 'Method overloading allows several methods in the same class to share an intuitive name while accepting different numbers or types of arguments—for example, a `Calculator` or `Printer` class having `print(String s)`, `print(int n)`, and `print(double d)`.',
    explanation: 'Callers can use a single consistent method name (`print`) regardless of the argument data type.'
  },
  'Exercise 5.8 Q4': {
    answer: 'Method overriding (marked with `@Override`) allows a subclass to replace a generic superclass method with specialized behavior while keeping the exact same method signature, return type, and access level—such as `SavingsAccount` overriding `Account.withdraw()` to enforce a minimum balance rule.',
    explanation: 'Overriding tailors inherited behavior to the specific needs of the subclass.'
  },
  'Exercise 5.8 Q5': {
    answer: 'When `class Circle extends Shape` and overrides `void draw()`, a superclass reference `Shape s = new Circle();` can invoke `s.draw()`, and the JVM dynamically executes `Circle`’s overridden `draw()` method at runtime.',
    explanation: 'Upcasting a subclass object to a superclass reference combined with method overriding achieves runtime polymorphism.'
  },
  'Exercise 5.8 Q6': {
    answer: 'Dynamic Method Dispatch is the runtime mechanism by which the JVM resolves a call to an overridden method based on the actual type of the object on the heap (created with `new`), rather than the declared reference variable type at compile time.',
    explanation: 'At runtime, the JVM inspects the object’s method table to invoke the most specific overridden version of the method.'
  },
  'Exercise 5.8 Q7': {
    answer: '```java\nclass Animal {\n    void sound() { System.out.println("Animal sound"); }\n    void sound(int times) { for(int i=0; i<times; i++) sound(); } // Overloading\n}\nclass Dog extends Animal {\n    @Override\n    void sound() { System.out.println("Bark!"); } // Overriding\n}\n```',
    explanation: '`sound()` vs `sound(int times)` demonstrates compile-time method overloading, while `Dog` overriding `sound()` via `Animal a = new Dog(); a.sound();` demonstrates runtime polymorphism.'
  },
  'Exercise 5.8 Q8': {
    answer: 'During compile-time polymorphism, the Java compiler inspects the method signature at the call site—specifically the number of arguments, the static data types of the arguments, and their exact order—and binds the call to the matching overloaded method (applying widening type conversions only if no exact match exists).',
    explanation: 'Note that return type alone is not part of the method signature and cannot distinguish overloaded methods.'
  },
  'Application Design Question (Page 382)': {
    answer: 'Four-stage design of a School Fee & Academic Management System: Stage 1 (Planning): define requirements for recording students, courses, and fee payments; Stage 2 (Designing classes & relationships): design `Person` (base class), `Student` and `Teacher` (subclasses), `Course`, and `FeeAccount` (encapsulated balance); Stage 3 (Implementation): write the Java classes with constructors, getters/setters, and polymorphic `printReport()` methods; Stage 4 (Testing & Debugging): test edge cases (negative fee inputs, duplicate IDs) and fix any runtime exceptions.',
    explanation: 'Following the 4 structured stages ensures requirements, OOP class architecture, code implementation, and verification are aligned.'
  },
  'Revision Exercise 5 Q1': {
    answer: '```java\npublic class Car {\n    private String make, model;\n    private int year;\n    public void setDetails(String m, String mod, int y) { make = m; model = mod; year = y; }\n    public String getDetails() { return year + " " + make + " " + model; }\n}\n```',
    explanation: 'Encapsulating `make`, `model`, and `year` with setter/getter methods allows multiple `Car` instances to store and display their details cleanly.'
  },
  'Revision Exercise 5 Q2': {
    answer: 'Define `abstract class Shape { abstract double calculateArea(); }` and subclasses `Circle` ($\\pi r^2$), `Rectangle` ($l \\times w$), and `Triangle` ($0.5 \\times b \\times h$) implementing `calculateArea()`.',
    explanation: 'The abstract class `Shape` hides the specific geometric formulas behind a single `calculateArea()` method.'
  },
  'Revision Exercise 5 Q3': {
    answer: 'Define base class `Account` with `private String accNo; private double balance;` and validated `deposit()`/`withdraw()` methods, then extend it with `class SavingsAccount extends Account` (adding `interestRate`) and `class CheckingAccount extends Account` (adding `overdraftLimit`).',
    explanation: 'Encapsulation protects `balance` as `private`, while inheritance specializes `SavingsAccount` and `CheckingAccount`.'
  },
  'Revision Exercise 5 Q4': {
    answer: '```java\npublic class AreaCalculator {\n    public double area(double side) { return side * side; } // Square\n    public double area(double length, double width) { return length * width; } // Rectangle\n    public double area(double radius, boolean isCircle) { return Math.PI * radius * radius; } // Circle\n}\n```',
    explanation: 'Three overloaded `area(...)` methods share the same name while differing in parameter lists.'
  },
  'Revision Exercise 5 Q5': {
    answer: 'Define `Author` (`name`, `email`), `LibraryItem` (base class with `private String title, isbn`), `class Book extends LibraryItem` (associating an `Author`), and `Library` holding a collection of `Book` objects with methods to borrow and return books.',
    explanation: 'Inheritance (`Book extends LibraryItem`) and encapsulation (`private` fields with getters/setters) model the library domain cleanly.'
  },
  'Revision Exercise 5 Q6': {
    answer: 'Define base class `Shape` with `public void draw()` and `public double calculateArea()`, and override both methods with `@Override` in subclasses `Circle`, `Rectangle`, and `Triangle` so a `Shape[]` array can polymorphically draw and compute areas for all shapes.',
    explanation: 'Iterating over a `Shape[]` array demonstrates runtime polymorphism via dynamic method dispatch.'
  },
  'Revision Exercise 5 Q7': {
    answer: 'Define `Product` (`private String name; private double price;`), `ShoppingCart` (`private List<Product> items` with `addItem()`, `removeItem()`, `getTotal()`), and base class `Customer` extended by `VIPCustomer` (overriding `getDiscount()`).',
    explanation: 'The cart’s internal list is encapsulated so items can only be added or totalled through `ShoppingCart` methods.'
  },
  'Revision Exercise 5 Q8': {
    answer: '```java\npublic class Arithmetic {\n    public static double add(double a, double b) { return a + b; }\n    public static double subtract(double a, double b) { return a - b; }\n    public static double multiply(double a, double b) { return a * b; }\n    public static double divide(double a, double b) { return b != 0 ? a / b : 0; }\n}\n```',
    explanation: 'Dedicated methods perform `+`, `-`, `*`, and `/` on operand variables and return the computed result.'
  },
  'Revision Exercise 5 Q9': {
    answer: '```java\npublic class MathConstants {\n    public static final double PI = 3.141592653589793;\n    public static final double E = 2.718281828459045;\n    public static void main(String[] args) {\n        double radius = 5.0;\n        System.out.println("Circle Area = " + (PI * radius * radius));\n        System.out.println("Exponential e^2 = " + (E * E));\n    }\n}\n```',
    explanation: 'In Java, mathematical constants are declared using `public static final double`.'
  },
  'Revision Exercise 5 Q10': {
    answer: 'Create base class `Person` with constructor `Person(String name, String id)` and method `getRoleDetails()`, and subclasses `Student extends Person` and `Teacher extends Person` that call `super(name, id)` in their constructors and override `getRoleDetails()`, alongside a `Course` class.',
    explanation: 'Constructors initialize object state via `super(...)`, while `@Override` customizes role reporting for students and teachers.'
  },
  'Revision Exercise 5 Q11': {
    answer: 'Create `Employee` with `private String name, id; private double baseSalary;` and getters/setters, then extend it with `Manager extends Employee` (adding `bonus` and overriding `calculatePay()`) and `Intern extends Employee` (using `stipend`).',
    explanation: 'Sensitive salary fields remain encapsulated while subclasses specialize pay calculations.'
  },
  'Revision Exercise 5 Q12': {
    answer: 'Define `Weapon` (`useWeapon()`), `Player` (`attack(Enemy e)`), and base class `Enemy` (`takeDamage(int d)`, `counterAttack()`) with subclasses `Goblin` and `Dragon` overriding `counterAttack()` polymorphically.',
    explanation: 'Polymorphism allows `Player` to interact with any `Enemy` or `Weapon` subtype through a single unified interface.'
  },
  'Revision Exercise 5 Q13': {
    answer: '```java\nimport java.io.*;\npublic class FileReadDemo {\n    public static void main(String[] args) {\n        try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {\n            System.out.println(br.readLine());\n        } catch (FileNotFoundException e) {\n            System.out.println("Error: File not found - " + e.getMessage());\n        } catch (IOException e) {\n            System.out.println("Error reading file - " + e.getMessage());\n        }\n    }\n}\n```',
    explanation: 'Using `try-catch` blocks catches checked `FileNotFoundException` and `IOException` gracefully without crashing the JVM.'
  },
  'Revision Exercise 5 Q14': {
    answer: 'In Java, parentheses `()` have highest precedence, followed by multiplicative operators (`*`, `/`, `%`) left-to-right, and then additive operators (`+`, `-`) left-to-right: for example, `10 + 20 * 3 - 40 / (2 + 3)` evaluates `(2 + 3) = 5`, `20 * 3 = 60`, `40 / 5 = 8`, and `10 + 60 - 8 = 62`.',
    explanation: 'Demonstrating expressions with and without parentheses shows how operator precedence changes the final result.'
  },
  'Revision Exercise 5 Q15': {
    answer: 'Implement `Calculator` with overloaded methods `add(int a, int b)`, `add(double a, double b)`, `add(int a, int b, int c)` (and similarly overloaded `subtract`, `multiply`, and `divide` methods).',
    explanation: 'Method overloading allows the calculator to accept 2 or 3 arguments of `int` or `double` type seamlessly.'
  },
  'Revision Exercise 5 Q16': {
    answer: '(i) A Setter method (`startEngine()`, `stopEngine()`) updates/modifies the value of a private attribute (`this.running`), while a Getter method (`getMake()`) retrieves and returns the value of a private attribute (`this.make`). (ii) Attributes are labelled `private` to enforce data hiding so external classes cannot directly modify `make`, `model`, `year`, or `running`. (iii) Encapsulation is implemented by combining `private` fields (`make`, `model`, `year`, `running`) with a public constructor and controlled `public` methods (`startEngine`, `stopEngine`, `getMake`) inside the `Car` class. (iv) Advantages: prevents unauthorized or invalid state changes (e.g., `make` and `year` cannot be altered after construction), improves security and modularity, and makes the class easier to maintain.',
    explanation: 'In the provided `Car` class, `make`, `model`, and `year` are read-only after construction, and `running` can only be toggled through `startEngine()` and `stopEngine()`.'
  }
};

export const CS_F5_ANSWERS_PART3: Record<string, ExactCSAnswer> = {
  'Scenario 6.1': {
    answer: 'Python-driven camera traps use computer vision and machine learning libraries (such as OpenCV, TensorFlow, and PyTorch) to automatically detect motion, classify animal species in real time, filter out false triggers (like wind-blown branches), and log GPS/timestamp metadata—enabling researchers to track and identify rare wildlife non-invasively 24/7.',
    explanation: 'Python’s rich ecosystem of image-processing and AI modules automates wildlife recognition directly on edge camera hardware.'
  },
  'Activity 6.5 Q1': {
    answer: 'Using Python modules (`.py` files imported via `import`) groups related functions, classes, and constants into logical files so code can be written once and imported across multiple scripts without copy-pasting, avoiding naming collisions and keeping files clean and readable.',
    explanation: 'Modularity adheres to the DRY (Don’t Repeat Yourself) principle and simplifies debugging and testing.'
  },
  'Activity 6.5 Q2': {
    answer: 'In larger projects, you organise modules into hierarchical packages (`database.py`, `auth.py`, `models.py`, `views.py`) so different developers can work on separate modules concurrently, test each module independently, and reuse utility modules across future applications.',
    explanation: 'Dividing a large system into focused modules and packages scales team development and maintenance.'
  },
  'Exercise 6.1 Q1': {
    answer: '```python\nage = 18                # int\nheight = 1.75           # float\nname = "Asha"           # str\nis_student = True       # bool\nprint(type(age), type(height), type(name), type(is_student))\n```',
    explanation: 'Calling Python’s built-in `type()` function outputs `<class \'int\'>`, `<class \'float\'>`, `<class \'str\'>`, and `<class \'bool\'>`.'
  },
  'Exercise 6.1 Q2': {
    answer: '```python\na = float(input("Enter first number: "))\nb = float(input("Enter second number: "))\nprint("Addition:", a + b)\nprint("Subtraction:", a - b)\nprint("Multiplication:", a * b)\nprint("Division:", a / b if b != 0 else "Cannot divide by zero")\n```',
    explanation: '`float(input(...))` converts the user’s string input into numbers before performing `+`, `-`, `*`, and `/`.'
  },
  'Exercise 6.1 Q3': {
    answer: '```python\ntext = input("Enter a string: ")\nupper_text = text.upper()\nprint("Uppercase:", upper_text)\nprint("Length:", len(text))\n```',
    explanation: '`text.upper()` converts all characters to uppercase and `len(text)` returns the total number of characters in the string.'
  },
  'Exercise 6.1 Q4': {
    answer: '```python\nnumbers = [10, 20, 30, 40, 50]\nfor num in numbers:\n    print(num)\n```',
    explanation: 'A `for` loop iterates sequentially through each integer element in the 5-element Python list `numbers` and prints it.'
  },
  'Exercise 6.1 Q5': {
    answer: '```python\nnum = float(input("Enter a number: "))\nif num > 0:\n    print("Positive")\nelif num < 0:\n    print("Negative")\nelse:\n    print("Zero")\n```',
    explanation: 'An `if-elif-else` conditional structure checks whether the number is greater than 0, less than 0, or equal to 0.'
  },
  'Exercise 6.1 Q6': {
    answer: '```python\ndef add_numbers(x, y):\n    return x + y\n\nresult = add_numbers(15, 25)\nprint("Sum:", result)\n```',
    explanation: 'The `def` keyword defines `add_numbers(x, y)`, which returns `x + y` (`40`) when called with `15` and `25`.'
  },
  'Exercise 6.2 Q1': {
    answer: 'Encapsulation in Python bundles data attributes and methods inside a `class` while restricting direct external modification of internal state; it is important because it enforces data validation, prevents accidental state corruption, and hides internal implementation details.',
    explanation: 'Encapsulation keeps an object’s attributes consistent and safe behind a clear public method interface.'
  },
  'Exercise 6.2 Q2': {
    answer: 'Encapsulation achieves data hiding in Python by prefixing sensitive attributes with double underscores (`__attribute`), which triggers name mangling (`_ClassName__attribute`) so external code cannot directly read or overwrite `obj.__attribute` and must instead use getter/setter methods or `@property` decorators.',
    explanation: 'Name mangling prevents accidental direct access or subclass attribute collisions.'
  },
  'Exercise 6.2 Q3': {
    answer: 'In Python: `public` attributes (no underscore, e.g., `self.name`) are freely accessible everywhere; `protected` attributes (single leading underscore, e.g., `self._balance`) signal by convention that the attribute is intended only for the class and its subclasses; and `private` attributes (double leading underscore, e.g., `self.__pin`) invoke name mangling to restrict access strictly to the defining class.',
    explanation: 'Python uses naming prefixes (`name`, `_name`, `__name`) to implement public, protected, and private access levels.'
  },
  'Exercise 6.2 Q4': {
    answer: '```python\nclass BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.__balance = balance  # Private attribute\n    def get_balance(self):\n        return self.__balance\n    def deposit(self, amount):\n        if amount > 0:\n            self.__balance += amount\n```',
    explanation: '`self.__balance` is private and can only be read via `get_balance()` or updated safely via `deposit(amount)`.'
  },
  'Exercise 6.2 Q5': {
    answer: 'Abstraction hides complex implementation details and exposes only essential high-level operations (what an object does), whereas Encapsulation wraps data and methods together and restricts direct access to internal state (how the object’s data is protected).',
    explanation: 'Abstraction is a design-level simplification (using abstract base classes/interfaces), while encapsulation is an implementation-level protection mechanism.'
  },
  'Exercise 6.2 Q6': {
    answer: 'In Python, an abstract class inherits from `ABC` (in the `abc` module) and declares one or more methods with `@abstractmethod` that subclasses must implement:\n```python\nfrom abc import ABC, abstractmethod\nclass Shape(ABC):\n    @abstractmethod\n    def area(self):\n        pass\nclass Circle(Shape):\n    def __init__(self, r): self.r = r\n    def area(self): return 3.14159 * self.r ** 2\n```',
    explanation: 'An abstract class (`Shape`) cannot be instantiated directly; only concrete subclasses (`Circle`) that implement `area()` can be instantiated.'
  },
  'Exercise 6.2 Q7': {
    answer: 'Abstraction breaks a complex system into clean, high-level contracts (abstract classes) so callers only need to know the common method signatures (`process()`, `save()`), while shared base logic is written once and reused across all concrete subclasses.',
    explanation: 'Developers can use complex subsystems (like database drivers or payment gateways) through a few simple method calls.'
  },
  'Exercise 6.2 Q8': {
    answer: 'In large-scale Python projects, abstract classes (`ABC` + `@abstractmethod`) enforce a strict architectural contract across teams: Python refuses to instantiate any subclass that forgets to implement a required `@abstractmethod`, catching missing methods early and keeping all plugin/module interfaces uniform.',
    explanation: 'Without `ABC`, missing methods in dynamically typed Python would only fail later when called at runtime.'
  },
  'Exercise 6.2 Q9': {
    answer: 'Inheritance in Python (`class Child(Parent):`) allows a child class to inherit attributes and methods from one or more parent classes, enabling code reuse, hierarchical classification, and method overriding/extension via `super()`.',
    explanation: 'Subclasses reuse tested parent logic and only write code for new or specialized behavior.'
  },
  'Revision Exercise 6 Q1': {
    answer: '```python\nlength = 5\nwidth = 3\narea = length * width\nprint("Area of rectangle:", area)  # Output: 15\n```',
    explanation: 'Multiplying `length = 5` by `width = 3` computes the area `15` and prints it.'
  },
  'Revision Exercise 6 Q2': {
    answer: '```python\nage = int(input("Enter your age: "))\nif age >= 18:\n    print("You are an adult")\nelse:\n    print("You are a minor")\n```',
    explanation: 'Converting the input to `int` and checking `if age >= 18:` prints the required message.'
  },
  'Revision Exercise 6 Q3': {
    answer: '```python\nfruits = ["Mango", "Banana", "Orange", "Pineapple", "Avocado"]\nfor fruit in fruits:\n    print(fruit)\n```',
    explanation: 'The `for` loop iterates over each string in the `fruits` list and prints it on its own line.'
  },
  'Revision Exercise 6 Q4': {
    answer: '```python\ndef calculate_cube(side_length):\n    return side_length ** 3\n\nprint("Volume of cube:", calculate_cube(4))  # Output: 64\n```',
    explanation: 'The volume of a cube is $s^3$, computed in Python using the exponentiation operator `side_length ** 3`.'
  },
  'Revision Exercise 6 Q5': {
    answer: '```python\nfull_name = input("Enter your full name: ").strip().split()\ninitials = full_name[0][0].upper() + "." + full_name[-1][0].upper() + "."\nprint("Initials:", initials)\n```',
    explanation: 'Splitting the full name into words and taking index `[0]` of the first and last words with `.upper()` extracts the uppercase initials.'
  },
  'Revision Exercise 6 Q6': {
    answer: '```python\ntotal = 0\ncount = 0\nwith open("grades.txt", "r") as file:\n    for line in file:\n        parts = line.split()\n        if len(parts) >= 2:\n            total += float(parts[-1])\n            count += 1\nprint("Average grade:", total / count if count > 0 else 0)\n```',
    explanation: 'Opening `grades.txt` with a `with` context manager reads each line, parses the numeric grade at `parts[-1]`, and computes the mean.'
  },
  'Revision Exercise 6 Q7': {
    answer: 'Polymorphism in Python OOP allows objects of different classes to respond to the same method call (`speak()`, `pay()`, `render()`) according to their own class definition. Real-world example: a notification service calling `notifier.send(message)` on `SMSNotifier`, `EmailNotifier`, and `WhatsAppNotifier` objects.',
    explanation: 'Because Python supports both inheritance overriding and duck typing, any object implementing `.send(message)` works polymorphically.'
  },
  'Revision Exercise 6 Q8': {
    answer: 'Encapsulation hides sensitive attributes using private name mangling (`self.__password` or `self.__balance`) and exposes access only through methods that verify permissions or validate inputs—for example, `User.check_password(input_pwd)` verifies a password without ever exposing `self.__password_hash` directly.',
    explanation: 'Preventing direct external access protects sensitive data from accidental exposure or invalid modification.'
  },
  'Revision Exercise 6 Q9': {
    answer: 'In Python, inheritance is declared by placing the parent class name in parentheses (`class SavingsAccount(BankAccount):`). It promotes code reusability because common attributes (`account_no`, `balance`) and methods (`deposit()`) are defined once in the parent class and automatically inherited by all child classes.',
    explanation: 'Fixes or improvements made to the parent class automatically benefit all inheriting subclasses.'
  },
  'Revision Exercise 6 Q10': {
    answer: 'An abstract class (created by inheriting from `abc.ABC` and decorating methods with `@abstractmethod`) defines a common blueprint/interface for a group of subclasses while preventing direct instantiation of the incomplete base class.',
    explanation: 'Example: `class Payment(ABC): @abstractmethod def pay(self, amt): pass` ensures every payment subclass implements `pay(self, amt)`.'
  },
  'Revision Exercise 6 Q11': {
    answer: 'Method overriding is achieved in Python by defining a method in the child class with the exact same name as a method in the parent class. Scenario: a base class `Employee` has `calculate_salary()` returning `base_pay`, and subclass `SalesManager(Employee)` overrides `calculate_salary()` to return `base_pay + commission`.',
    explanation: 'When `calculate_salary()` is called on a `SalesManager` instance, Python executes the child class’s overridden version.'
  },
  'Revision Exercise 6 Q12': {
    answer: 'Class attributes are defined directly inside the class body outside any method (e.g., `school_name = "Azania"`) and are shared across all instances of that class; Instance attributes are defined inside `__init__` using `self` (e.g., `self.student_name = name`) and belong uniquely to each individual object instance.',
    explanation: 'Changing a class attribute affects all instances, whereas changing an instance attribute (`self.x`) affects only that specific object.'
  },
  'Revision Exercise 6 Q13': {
    answer: 'Constructors in Python (defined via the `__init__(self, ...)` method) automatically initialize a newly created object’s instance attributes as soon as the class is instantiated (e.g., `s = Student("Neema", 18)` invokes `Student.__init__(s, "Neema", 18)`).',
    explanation: 'The constructor ensures every object starts life with valid, properly initialized attributes.'
  },
  'Revision Exercise 6 Q14': {
    answer: 'The `super()` function returns a proxy object that delegates method calls to a parent/superclass, allowing a subclass to call the parent’s `__init__()` constructor or overridden methods without hardcoding the parent class’s name:\n```python\nclass Manager(Employee):\n    def __init__(self, name, salary, dept):\n        super().__init__(name, salary)\n        self.dept = dept\n```',
    explanation: '`super()` avoids duplicating parent initialization logic and properly cooperates with Python’s Method Resolution Order (MRO) in multiple inheritance.'
  },
  'Revision Exercise 6 Q15': {
    answer: 'In Python, protected attributes use a single underscore prefix (`self._salary = 500000`) and private attributes use a double underscore prefix (`self.__pin = 1234`), paired with `@property` getter and `@attribute.setter` methods to validate access.',
    explanation: 'Using `@property` allows clean attribute syntax (`acc.balance`) while executing encapsulated getter/setter validation under the hood.'
  },
  'Revision Exercise 6 Q16': {
    answer: 'Multiple inheritance in Python allows a subclass to inherit from more than one parent class (`class SmartWatch(Watch, FitnessTracker):`). Precautions: beware of the Diamond Problem (ambiguous method names across parents), always check the class’s Method Resolution Order (`ClassName.__mro__`), use `super()` consistently, and prefer small Mixin classes to keep hierarchies simple.',
    explanation: 'Without careful design, multiple inheritance can create confusing method lookup paths.'
  },
  'Revision Exercise 6 Q17': {
    answer: 'Abstraction reduces complexity, isolates impact of changes, and improves maintainability. Example: abstracting an e-commerce order system into `Order`, `PaymentGateway` (abstract base class), and `InventoryService` classes so the checkout workflow calls high-level methods without knowing SQL or bank API internals.',
    explanation: 'Each class presents a simple abstract interface while hiding its internal implementation details.'
  },
  'Revision Exercise 6 Q18': {
    answer: 'Method Overriding redefines an inherited parent method inside a child class (`class Dog(Animal): def speak(self): ...`); Method Overloading is having one method handle different numbers/types of arguments—which Python achieves using default parameters (`def add(self, a, b, c=0): return a + b + c`) or variable-length arguments (`*args`), since defining two methods with the same name in one Python class overwrites the first.',
    explanation: 'Unlike Java/C++, Python dynamically handles variable argument signatures in a single method using default values or `*args`/`**kwargs`.'
  },
  'Revision Exercise 6 Q19': {
    answer: 'The `__init__(self, ...)` method is Python’s special initializer (constructor) method that is called automatically by Python immediately after a new object instance is created to set up its initial attributes; unlike regular methods, you never call `obj.__init__()` manually—it runs automatically when you call `ClassName(...)`.',
    explanation: 'Dunder (double-underscore) `__init__` is a lifecycle hook invoked automatically during object instantiation.'
  },
  'Revision Exercise 6 Q20': {
    answer: 'Method Resolution Order (MRO) is the deterministic linear order in which Python searches base classes when looking up a method or attribute during inheritance. Python computes the MRO using the **C3 Linearization** algorithm (searching the child class first, then parents left-to-right while preserving monotonic subclass precedence, inspectable via `ClassName.mro()` or `ClassName.__mro__`).',
    explanation: 'C3 Linearization guarantees that a subclass always appears before its parents and respects the left-to-right order in `class Child(ParentA, ParentB):`.'
  },
  'Case Study 7.1 Q1': {
    answer: 'Club members can use built-in OS networking and file-sharing protocols—such as SMB/CIFS network shares, AirDrop/Nearby Share, Bluetooth, FTP/SFTP, or cloud-synced virtual drives (Google Drive, OneDrive, Nextcloud)—along with standard cross-platform file systems (exFAT) on USB drives so Windows, macOS, Linux, Android, and iOS devices can exchange photos seamlessly.',
    explanation: 'Operating systems abstract hardware differences behind standard network protocols and file system drivers.'
  },
  'Case Study 7.1 Q2': {
    answer: 'They can use the OS’s hierarchical File Management System: creating nested directories/folders by event, date, or wildlife species, batch-renaming files, tagging EXIF metadata (camera, date, location), and using OS file indexing/search filters to locate photos instantly.',
    explanation: 'Hierarchical directory trees and indexed file metadata are core OS file-system capabilities.'
  },
  'Case Study 7.1 Q3': {
    answer: 'JPEG files are compressed (small file size, fast network upload/download, universally viewable on all OSs and web browsers, but lossy), whereas RAW files contain uncompressed sensor data (huge file size—20 to 50 MB each, slower transfers, require specialized OS codecs/editing software, but preserve maximum quality for professional editing).',
    explanation: 'A practical workflow archives RAW originals for editing and exports compressed JPEGs/WebP for fast cross-device sharing and web galleries.'
  },
  'Case Study 7.1 Q4': {
    answer: 'Operating systems provide User Account Authentication (passwords/biometrics), Role-Based File Permissions / Access Control Lists (`rwx` in Linux/macOS, NTFS ACLs in Windows to set read-only vs edit access), full-disk/folder encryption (BitLocker, FileVault, LUKS), built-in Firewalls, and automated backup utilities.',
    explanation: 'OS access control lists and encryption ensure only authorized club members can modify or view protected photo archives.'
  },
  'Case Study 7.1 Q5': {
    answer: 'They can organise photos into themed albums/collections, display EXIF camera settings and conservation captions, enable responsive image compression for mobile viewers, and use interactive comments/ratings and shareable permission links to engage the school community.',
    explanation: 'Combining OS-organized metadata with web gallery albums creates an accessible, educational showcase.'
  },
  'Activity 7.1 Q1': {
    answer: 'Operating systems evolved from early 1950s serial/batch processing (punch cards with no user interaction) to 1960s multiprogramming and time-sharing systems (UNIX, CTSS), 1980s personal computer GUIs (MS-DOS to Windows and Classic Mac OS), and 2000s–present mobile, cloud, virtualized, and IoT real-time operating systems (Android, iOS, Linux containers)—transforming computers from room-sized batch calculators into ubiquitous interactive devices.',
    explanation: 'Each generation of OS evolution improved hardware utilization, interactivity, portability, and security.'
  },
  'Activity 7.1 Q2': {
    answer: 'Operating systems shape modern computing by providing intuitive Graphical/Touch User Interfaces (shaping user experience), offering standardized System Call APIs and SDKs so developers write hardware-independent software, and managing multi-core CPUs, GPUs, virtual memory, and network stacks that power cloud, AI, and mobile innovation.',
    explanation: 'As the resource manager and hardware abstraction layer, the OS is the foundation for all application software.'
  },
  'Exercise 7.1 Q1': {
    answer: 'An Operating System (OS) is like the manager or traffic police officer of a computer: it sits between you (and your apps like WhatsApp or Word) and the physical machine parts (the CPU brain, RAM workbench, screen, and storage disk), translating your clicks into hardware actions and making sure all running apps share the computer peacefully.',
    explanation: 'In layered terms: `User → Application Software → Operating System → Computer Hardware`.'
  },
  'Exercise 7.1 Q2': {
    answer: 'Design the mobile app and user guide around intuitive OS accessibility and UI standards: large high-contrast icons, voice-over/screen-reader support, simple step-by-step visual screenshots, touch gestures (tap, swipe), and plain-language prompts that hide technical OS jargon.',
    explanation: 'Leveraging native OS accessibility services (TalkBack/VoiceOver, scalable fonts) makes apps inclusive for novice and elderly users.'
  },
  'Exercise 7.1 Q3': {
    answer: 'Malware targeting OSs includes Viruses (attach to executable files), Worms (self-replicate across network ports), Trojans (disguise as legitimate software), Rootkits (hide deep inside the OS kernel to mask attacker presence), and Ransomware (encrypts file systems). Understanding OS process privileges (least privilege), kernel patch management, memory protection (ASLR/DEP), and file-system permissions enables administrators to block privilege escalation and isolate infections.',
    explanation: 'Most malware seeks to exploit unpatched OS services or trick users into granting administrator/root privileges.'
  },
  'Exercise 7.1 Q4': {
    answer: 'Desktop OSs (Windows, macOS, Ubuntu) are designed for continuous AC power, large multi-window monitors, keyboard/mouse precision, heavy multitasking, and broad peripheral drivers; Mobile OSs (Android, iOS) are designed for strict battery/thermal constraints, touchscreens and sensors (GPS, accelerometer), aggressive background app suspension, and strict per-app sandboxing.',
    explanation: 'Power budget, input modality (mouse vs touch), and security sandboxing drive the architectural differences between desktop and mobile OSs.'
  },
  'Exercise 7.1 Q5': {
    answer: 'Build on an open-source Linux kernel (like Ubuntu/Debian Edu), pre-bundle offline educational tools and coding IDEs (Python, Scratch, LibreOffice, Kiwix offline Wikipedia), optimize the scheduler and lightweight desktop environment (XFCE/LXQt) to run smoothly on low-cost school hardware, and include teacher classroom-management and parental/exam-mode access controls.',
    explanation: 'Open-source licensing allows schools to customize, localize (e.g., into Kiswahili), and distribute the OS freely without licence fees.'
  },
  'Exercise 7.2 Q1': {
    answer: 'Open the OS Task Manager / System Monitor (`top`/`htop`), inspect running processes sorted by CPU %, Memory (RAM) %, and Disk I/O usage, identify any runaway or hung process (or malware/bloatware) consuming 90–100% CPU or causing memory thrashing, terminate (`kill`) the unresponsive process, and disable unnecessary startup programs.',
    explanation: 'Process management tools expose exact per-process resource consumption and process states (Running, Waiting, Zombie/Not Responding).'
  },
  'Exercise 7.2 Q2': {
    answer: 'First-Come, First-Served (FCFS) is simple but suffers from the convoy effect (short tasks wait behind long ones); Shortest Job Next (SJN/SJF) minimizes average waiting time but can starve long processes; Priority Scheduling runs urgent tasks first; Round-Robin (RR) gives each process a small time quantum (e.g., 10–20 ms), providing fast interactive response times in multi-user/desktop systems.',
    explanation: 'Modern interactive OSs combine multilevel priority queues with Round-Robin time-slicing (or Linux CFS) to keep the UI responsive.'
  },
  'Exercise 7.2 Q3': {
    answer: 'By tracking process states (Running, Ready, Blocked/Waiting, Suspended), a mobile OS can immediately transition background apps that are not actively interacting with the user into a deep Suspended/Doze state—coalescing background wakeups, scaling down CPU clock frequencies (DVFS), and powering down idle cores to extend battery life.',
    explanation: 'Preventing background processes from polling the CPU in the Ready/Running state is the single most effective mobile battery saver.'
  },
  'Exercise 7.2 Q4': {
    answer: 'Process-targeting malware includes Process Injection / DLL Injection (injecting malicious code into the memory space of a trusted process like `explorer.exe`), Process Hollowing (spawning a legitimate process in a suspended state and replacing its memory image with malware), and Privilege Escalation exploits. Prevention: OS Address Space Layout Randomization (ASLR), Data Execution Prevention (DEP/NX bit), mandatory code signing, and running processes with least privilege.',
    explanation: 'Strict virtual memory isolation and code-integrity checks prevent one process from tampering with another process’s address space.'
  },
  'Exercise 7.2 Q5': {
    answer: 'In Linux, advanced users can adjust process scheduling priorities using `nice` and `renice` (from `-20` highest priority to `+19` lowest), set real-time scheduling policies (`SCHED_FIFO`, `SCHED_RR`) using `chrt`, pin processes to specific CPU cores (`taskset` CPU affinity), and limit per-process RAM/CPU quotas using kernel `cgroups` (control groups).',
    explanation: 'Linux exposes fine-grained kernel process controls for tuning latency-sensitive servers, databases, and multimedia workloads.'
  },
  'Exercise 7.3 Q1': {
    answer: 'CPU scheduling allows a user to listen to music, download a PDF, type in a word processor, and move the mouse cursor simultaneously: by rapidly switching the CPU among active processes every few milliseconds (time-sharing), the OS creates the illusion of smooth parallel execution and prevents any single background task from freezing the user’s workflow.',
    explanation: 'Preemptive time-slicing ensures interactive foreground tasks respond within milliseconds of a keystroke or click.'
  },
  'Exercise 7.3 Q2': {
    answer: 'Comparison of 3 OS schedulers: (1) Linux uses the Completely Fair Scheduler (CFS / EEVDF), which tracks virtual runtime (`vruntime`) in a red-black tree to give every task a fair share of CPU time; (2) Windows uses a 32-level Preemptive Multilevel Feedback Queue with dynamic priority boosting for foreground UI threads; (3) Real-Time OSs (like FreeRTOS/VxWorks) use strict Preemptive Fixed-Priority / Rate-Monotonic or Earliest-Deadline-First (EDF) scheduling for deterministic microsecond deadlines.',
    explanation: 'Each OS tailors its scheduler to its primary workload: fairness and scalability (Linux), desktop UI responsiveness (Windows), or hard deadlines (RTOS).'
  },
  'Exercise 7.3 Q3': {
    answer: 'A self-driving car OS requires a Hard Real-Time Preemptive Priority / Earliest-Deadline-First (EDF) CPU scheduler: safety-critical tasks (obstacle detection, emergency braking, steering control) are assigned the highest real-time priority with guaranteed worst-case execution bounds so they immediately preempt non-critical tasks (like cabin air-conditioning or infotainment music playback).',
    explanation: 'In autonomous vehicles, missing a 10 ms braking deadline can be fatal, so hard real-time scheduling guarantees deterministic response times.'
  },
  'Revision Exercise 7 Q1': {
    answer: 'Context switching is the process where the OS saves the CPU state (registers, Program Counter, stack pointer) of the currently running process into its Process Control Block (PCB) and loads the saved PCB state of the next scheduled process. OSs minimize context-switch overhead by choosing an optimal time quantum (not too small), using hardware thread support, keeping threads within the same address space (avoiding TLB flushes), and using CPU core affinity.',
    explanation: 'Because context switching does no useful application work and can flush CPU caches/TLBs, minimizing unnecessary switches improves overall throughput.'
  },
  'Revision Exercise 7 Q2': {
    answer: 'Ethical considerations in OS scheduling include preventing Starvation (ensuring low-priority or accessibility background services are never indefinitely denied CPU time via aging), net neutrality/fair resource allocation in multi-tenant cloud servers so one paying tenant cannot starve others, and prioritizing life-safety tasks in medical and automotive systems.',
    explanation: 'Fairness mechanisms like priority aging ensure efficiency optimizations do not completely starve smaller or lower-priority user tasks.'
  },
  'Revision Exercise 7 Q3': {
    answer: 'When the OS scheduler boosts the priority of foreground UI and touch-input threads (giving them immediate short CPU bursts), apps respond instantaneously to user taps (<16 ms), maintaining user satisfaction; poor non-preemptive scheduling causes UI freezes ("Application Not Responding"), leading to user frustration.',
    explanation: 'Human perception notices UI lag above 50–100 ms, so interactive schedulers prioritize I/O-bound UI threads over background batch jobs.'
  },
  'Revision Exercise 7 Q4': {
    answer: 'You can optimize smartphone performance by closing or restricting heavy background apps that compete for CPU time slices, disabling unnecessary auto-sync/wakelock services, keeping only active apps in the foreground so the OS scheduler allocates performance cores to your current task, and enabling battery/performance profiles.',
    explanation: 'Reducing the number of competing runnable threads in the OS ready queue lowers context-switching overhead and thermal throttling.'
  },
  'Revision Exercise 7 Q5': {
    answer: 'In multi-user servers, cloud platforms, and school computer networks, time-sharing CPU scheduling fairly partitions processor cycles among dozens of concurrent users and collaborative services, ensuring every user’s session receives responsive execution without one user monopolizing the server.',
    explanation: 'Fair-share scheduling (`CFS` and `cgroups`) is the foundation of multi-user operating systems and cloud computing.'
  },
  'Revision Exercise 7 Q6': {
    answer: 'Understanding CPU scheduling helps programmers write non-blocking asynchronous code (`async/await`), offload heavy calculations to worker threads so the main UI thread never blocks, avoid busy-wait spin loops (`while(true)`) that waste 100% of a CPU quantum, and use proper synchronization primitives.',
    explanation: 'Scheduler-aware code yields the CPU during I/O waits, maximizing system responsiveness and energy efficiency.'
  },
  'Revision Exercise 7 Q7': {
    answer: 'Emerging fields like Edge AI, Autonomous Robotics, 5G Network Slicing, Serverless Cloud Containers (Kubernetes), and Quantum-Classical hybrid computing all rely on advanced task and heterogeneous resource scheduling across CPUs, GPUs, NPUs, and distributed nodes.',
    explanation: 'Core OS scheduling principles (priority, preemption, load balancing, deadline guarantees) apply directly to cloud orchestration and AI clusters.'
  },
  'Revision Exercise 7 Q8': {
    answer: 'Two real-world deadlock cases: (1) Database Transaction Deadlock: Transaction A locks `Account 1` and waits for `Account 2`, while Transaction B locks `Account 2` and waits for `Account 1` (handled by DBMS/OS wait-for graph detection and aborting/rolling back one victim transaction); (2) Dual Resource Deadlock: Process 1 holds the Printer and requests the Scanner while Process 2 holds the Scanner and requests the Printer (prevented by enforcing a strict global resource ordering or Banker’s Algorithm avoidance).',
    explanation: 'Deadlock occurs when four conditions hold simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait; breaking any one condition resolves or prevents it.'
  },
  'Revision Exercise 7 Q9': {
    answer: 'The OS uses CPU scheduling to maximize CPU utilization and throughput by immediately switching the CPU to another Ready process whenever the currently running process blocks waiting for slow disk, network, or user I/O—ensuring the processor never sits idle while runnable work exists.',
    explanation: 'Overlapping CPU bursts of one process with I/O waits of another keeps hardware utilization near 100%.'
  },
  'Revision Exercise 7 Q10': {
    answer: 'In Non-Preemptive Scheduling (e.g., FCFS, non-preemptive SJF), once a process is allocated the CPU, it keeps the CPU until it voluntarily terminates or blocks for I/O; in Preemptive Scheduling (e.g., Round-Robin, SRTF, Preemptive Priority), the OS scheduler can forcibly interrupt (preempt) a running process via a hardware timer interrupt when its time quantum expires or a higher-priority process arrives.',
    explanation: 'Preemptive scheduling is essential for interactive multitasking and real-time systems so a single long process cannot monopolize the CPU.'
  },
  'Revision Exercise 7 Q11': {
    answer: 'The OS ensures storage security and integrity through Access Control Lists (ACLs) and file permissions (`rwx`), full-disk/file-system encryption (BitLocker, LUKS, FileVault), Journaling File Systems (ext4, NTFS, APFS—which log metadata transactions to prevent corruption during power loss), RAID redundancy, and cryptographic checksums.',
    explanation: 'Permissions and encryption protect confidentiality and unauthorized modification, while journaling and checksums preserve file-system structural integrity.'
  },
  'Revision Exercise 7 Q12': {
    answer: 'For Deadlock Detection, the OS maintains a Resource Allocation Graph (or Wait-For Graph) and periodically runs a cycle-detection algorithm to find circular waits; for Deadlock Recovery, the OS either terminates one or more deadlocked processes (aborting the lowest-cost victim) or preempts/rolls back resources from a process to break the cycle.',
    explanation: 'Detection-and-recovery avoids the runtime overhead of strict deadlock avoidance when deadlocks are rare.'
  },
  'Revision Exercise 7 Q13': {
    answer: 'For an educational tablet mobile OS: use a Preemptive Multilevel Feedback Queue / CFS scheduler that prioritizes interactive stylus/touch input and educational video playback while throttling background syncs; use demand paging with compressed swap (zRAM) and aggressive background app lifecycle management to run smoothly on 4 GB RAM; and use journaling flash-friendly file systems (F2FS/ext4) with sandboxing and student/exam-mode profiles.',
    explanation: 'Combining interactive scheduling, zRAM memory compression, and sandboxed student profiles creates a fast, distraction-free learning tablet.'
  },
  'Revision Exercise 7 Q14': {
    answer: 'Evaluating "Virtual memory is always a better alternative to physical RAM": **Against (and balanced view)**: Virtual memory extends apparent memory capacity using disk/SSD swap space and provides crucial process isolation, but it is NOT a substitute for sufficient physical RAM because disk/SSD access is 1,000× to 100,000× slower than DRAM—relying heavily on virtual memory causes severe page faults and "thrashing" that freezes the system.',
    explanation: 'Virtual memory is essential for address-space isolation and handling occasional memory peaks, but active working sets must fit in physical RAM for high performance.'
  },
  'Revision Exercise 7 Q15': {
    answer: 'Emerging OS trends include AI-integrated OS kernels (predictive resource scheduling, on-device NPU management, and AI copilot APIs), Microkernel and Unikernel Cloud OSs (lightweight container OSs like Bottlerocket/CoreOS for instant cloud scaling), Ultra-low-power Real-Time IoT OSs (Zephyr, FreeRTOS, Matter integration), and Rust-in-the-Kernel for memory-safe OS driver development.',
    explanation: 'Modern operating systems are evolving toward memory-safe kernels, hardware AI acceleration, and distributed cloud-edge orchestration.'
  },
  'Scenario 8.1 Q1': {
    answer: 'Traditional paper-based academic records suffer from data redundancy (duplicate student files across departments), data inconsistency (updated address in one file but not another), slow manual searching through thousands of folders, vulnerability to physical damage/loss (fire, water, misfiling), lack of concurrent access, and weak access security.',
    explanation: 'File-cabinet and paper systems cannot scale to thousands of students requiring instant enrollment, grading, and transcript verification.'
  },
  'Scenario 8.1 Q2': {
    answer: 'A computerized Database Management System (DBMS) centralizes student records into normalized tables, eliminates duplicate data entry, allows instant SQL retrieval and transcript generation in milliseconds, supports simultaneous multi-user access across departments with ACID transactions, and enforces automated backups and role-based security.',
    explanation: 'A DBMS replaces error-prone manual ledger lookups with indexed, consistent, multi-user electronic queries.'
  },
  'Scenario 8.1 Q3': {
    answer: 'Essential features include Relational Tables with Primary/Foreign key integrity (`Students`, `Courses`, `Enrollments`, `Grades`), ACID transaction support, Role-Based Access Control (students view only their own grades, registrars manage enrollments), fast indexing and SQL query/reporting tools, audit logs, and automated encrypted backups.',
    explanation: 'These DBMS capabilities guarantee accuracy, privacy, and high availability for academic records.'
  },
  'Exercise 8.1 Q1': {
    answer: 'In government payment systems (e.g., GePG) and social media platforms, thousands of users perform transactions every second; immediate, atomic (ACID) updates prevent double-spending, duplicate tax bills, lost payments, or displaying outdated/inconsistent account balances and messages.',
    explanation: 'Real-time transactional consistency ensures every user and financial audit sees the exact, up-to-date state of the database.'
  },
  'Exercise 8.1 Q2': {
    answer: 'File-based systems typically lock an entire file or overwrite another user’s changes ("lost update" problem) when two users edit the same file simultaneously; a DBMS uses fine-grained row-level locking and Multi-Version Concurrency Control (MVCC) with ACID transactions so thousands of users can read and update records concurrently without corrupting data.',
    explanation: 'DBMS concurrency control serializes conflicting writes at the row level while allowing non-conflicting reads and writes to proceed in parallel.'
  },
  'Exercise 8.1 Q3': {
    answer: 'In a file-based system, the Admissions office, Library, and Accounts office each keep separate spreadsheet/text files containing a student’s name, phone number, and programme (Data Redundancy), wasting storage; when the student changes their phone number in Admissions, the Library and Accounts files still hold the old number, resulting in conflicting information (Data Inconsistency).',
    explanation: 'Storing the same fact in multiple independent files inevitably leads to update anomalies and inconsistent records.'
  },
  'Exercise 8.1 Q4': {
    answer: 'A DBMS handles concurrent access using Transaction Management, Two-Phase Locking (shared read locks and exclusive write locks), Timestamp Ordering, and MVCC (Multi-Version Concurrency Control), ensuring the Isolation property of ACID; in contrast, flat file systems lack row-level transaction managers and either block all other users via whole-file OS locks or suffer silent data overwrites.',
    explanation: 'DBMS concurrency protocols guarantee that concurrent transactions produce the same result as if executed serially.'
  },
  'Exercise 8.1 Q5': {
    answer: 'A DBMS reduces redundancy and inconsistency through Database Normalization and Foreign Keys: for example, in a hospital or university DBMS, a patient’s or student’s profile is stored once in a single `Patients` or `Students` table referenced by `StudentID` across `Billing`, `Library`, and `Exams` tables—so updating the contact number in one place immediately reflects everywhere.',
    explanation: 'Single-source-of-truth storage with relational foreign keys eliminates duplicate copies and update anomalies.'
  },
  'Exercise 8.2 Q1': {
    answer: 'A database model is the logical blueprint/structure that defines how data is organised, stored, connected (relationships), and manipulated within a DBMS (e.g., Hierarchical, Network, Relational, Object-Oriented, NoSQL); it is significant because choosing the right model determines query flexibility, data integrity, and scalability for modern information systems.',
    explanation: 'The database model provides the conceptual and logical abstraction layer above physical disk storage.'
  },
  'Exercise 8.2 Q2': {
    answer: 'The Hierarchical model organises data in a strict tree structure where each child record has **only one parent** (1:N relationship, e.g., IBM IMS, Windows Registry, XML/file directory trees); the Network model generalizes this into a graph where a child record ("member") can have **multiple parents** ("owners"), supporting many-to-many (M:N) relationships directly via pointers (e.g., CODASYL IDMS, telecom utility grids, airline route networks).',
    explanation: 'Hierarchical models enforce a strict 1-parent tree, whereas Network models allow multi-parent graph links.'
  },
  'Exercise 8.2 Q3': {
    answer: 'The Relational model (RDBMS) stores data in 2D tables (relations) of rows (tuples) and columns (attributes) linked by primary/foreign keys and queried via declarative SQL (e.g., MySQL, PostgreSQL, Oracle in banking and school systems); the Object-Oriented Database model (OODBMS) stores data directly as complex objects encapsulating both attributes and methods with class inheritance (e.g., db4o, ObjectDB in CAD/CAM engineering, multimedia, and geographic information systems).',
    explanation: 'Relational databases excel at structured tabular queries and reporting, while Object-Oriented databases avoid "object-relational impedance mismatch" for complex nested objects.'
  },
  'Exercise 8.3 Q1': {
    answer: 'Two related entities in a school students’ organisation: Entity 1 `Club` (`ClubID`, `ClubName`, `PatronName`) and Entity 2 `StudentMember` (`StudentID`, `FullName`, `ClassStream`, `ClubID`). A 1-to-Many (1:M) relationship links `Club` (1) to `StudentMember` (Many) via `ClubID`.',
    explanation: 'In the ER diagram, `Club` and `StudentMember` are rectangles, their attributes are ovals, and the `BelongsTo` diamond connects them with `1:M` cardinality.'
  },
  'Exercise 8.3 Q2': {
    answer: 'In the `StudentMember` table (`StudentID`, `NationalExamNo`, `FullName`, `ClubID`): Candidate Keys = `StudentID` and `NationalExamNo` (both uniquely identify a student); Primary Key = `StudentID` (chosen main identifier); Alternate Key = `NationalExamNo` (the candidate key not chosen as PK); Foreign Key = `ClubID` (references `Club(ClubID)`). Degree (number of columns/attributes) = `4`; Cardinality (number of rows/tuples) = the number of student records in the table (e.g., `5` rows if 5 students are listed).',
    explanation: 'Degree is the number of attributes (columns) in a relation, while Cardinality is the number of tuples (rows) currently stored.'
  },
  'Exercise 8.3 Q3': {
    answer: 'Selection ($\sigma$, horizontal filtering) retrieves a subset of **rows (tuples)** that satisfy a specified condition while keeping all columns (e.g., `SELECT * FROM Students WHERE Stream = \'PCM\';`), whereas Projection ($\pi$, vertical filtering) retrieves a subset of **columns (attributes)** from a table while discarding other columns (e.g., `SELECT FullName, Stream FROM Students;`).',
    explanation: 'Selection filters rows horizontally (`WHERE`), whereas Projection selects specific columns vertically (`SELECT col1, col2`).'
  },
  'Activity 8.7 Q1': {
    answer: 'Table 8.17 is not in 3NF for two main reasons: (1) It violates 2NF (and therefore 3NF) due to **Partial Dependencies** on the composite primary key `(Staff No, Branch No)`: `Name` and `Position` depend only on `Staff No` (`Staff No → Name, Position`), while `Branch address` depends only on `Branch No` (`Branch No → Branch address`), whereas only `Hr/week` depends on the full composite key `(Staff No, Branch No)`; (2) This causes severe **Data Redundancy and Update/Insertion/Deletion Anomalies** (e.g., Asha Haji’s name/position and branch addresses `Temeke, Plt 12G DSM` are repeated across multiple rows).',
    explanation: 'To be in 3NF, a table must first be in 2NF (no partial dependencies on a composite key) and have no transitive dependencies.'
  },
  'Activity 8.7 Q2': {
    answer: 'Normalizing Table 8.17 to 3NF decomposes it into three relations to remove partial and transitive dependencies:\n1. `Staff(StaffNo [PK], Name, Position)` — rows: `(S3244, Asha Haji, Assistant)`, `(S4545, Mayalla Macho, Assistant)`\n2. `Branch(BranchNo [PK], BranchAddress)` — rows: `(B0021, Temeke, Plt 12G DSM)`, `(B0045, Mikocheni, Plt 32A, DSM)`\n3. `StaffBranchWork(StaffNo [FK], BranchNo [FK], HrPerWeek)` with composite PK `(StaffNo, BranchNo)` — 4 rows storing the hours `(16, 9, 14, 10)`.',
    explanation: 'Separating `Staff` details and `Branch` details into their own tables leaves `StaffBranchWork` with `HrPerWeek` fully functionally dependent on `(StaffNo, BranchNo)`.'
  },
  'Activity 8.7 Q3': {
    answer: 'Keys in the 3NF relations: (1) In `Staff`: Primary Key = `StaffNo`; (2) In `Branch`: Primary Key = `BranchNo`, Alternate Key = `BranchAddress` (since each branch has a unique physical plot address); (3) In `StaffBranchWork`: Composite Primary Key = `(StaffNo, BranchNo)`, where `StaffNo` is a Foreign Key referencing `Staff(StaffNo)` and `BranchNo` is a Foreign Key referencing `Branch(BranchNo)`.',
    explanation: 'Foreign keys preserve the relational links between the decomposed 3NF tables without duplicating text attributes.'
  },
  'Exercise 8.4 Q1': {
    answer: 'Steps from UNF to 3NF: (1) **To 1NF**: Eliminate repeating groups/multi-valued attributes so every cell holds a single atomic value and identify a Primary Key; (2) **To 2NF**: Ensure the table is in 1NF and remove all **Partial Dependencies** (move any non-key attribute that depends on only part of a composite primary key into a separate table); (3) **To 3NF**: Ensure the table is in 2NF and remove all **Transitive Dependencies** (move any non-key attribute that depends on another non-key attribute `A → B → C` into its own table).',
    explanation: 'Summary rule: In 3NF, every non-key attribute must depend on "the key (1NF), the whole key (2NF), and nothing but the key (3NF)."'
  },
  'Exercise 8.4 Q2': {
    answer: 'School example: If a single unnormalised `StudentCourse` table stores `(StudentID, StudentName, DeptID, DeptName, HOD_Name, CourseID, Grade)`, then: (1) Updating the Head of Department’s name requires editing hundreds of student rows (Update Anomaly); (2) A newly created department with no students enrolled yet cannot be recorded (Insertion Anomaly); (3) Deleting the last graduating student in a department accidentally erases the department’s details (Deletion Anomaly). Normalizing to 3NF eliminates all three anomalies.',
    explanation: 'Splitting `Students`, `Departments`, `Courses`, and `Enrollments` into 3NF tables guarantees clean inserts, updates, and deletes.'
  },
  'Exercise 8.4 Q3': {
    answer: 'Relational Model stores atomic data in 2D tables linked by keys and queried with SQL—used in (1) Banking core accounting systems (NMB/CRDB) and (2) National examination/student registration systems (NECTA). Object-Oriented Model stores complex objects with encapsulated methods and inheritance—used in (1) Computer-Aided Design (CAD/CAM engineering for aircraft/automobiles) and (2) Geographic Information Systems (GIS) and 3D multimedia engines.',
    explanation: 'Relational databases dominate business transaction processing, whereas OODBMSs serve specialized engineering and spatial object domains.'
  },
  'Exercise 8.4 Q4': {
    answer: 'The relational model remains the most widely used model today because it rests on rigorous mathematical set theory and relational algebra (Codd’s rules), uses the universal standardized declarative language **SQL**, guarantees strict **ACID** transactional integrity and referential integrity, and is supported by mature, highly optimized enterprise engines (PostgreSQL, MySQL, Oracle, SQL Server).',
    explanation: 'Decades of query optimizer refinement, ACID reliability, and universal SQL literacy keep RDBMSs at the core of global software.'
  },
  'Exercise 8.4 Q5': {
    answer: '(1) Hierarchical model: File System Directory Tree or Windows Registry (naturally fits strict 1:N parent-child folders where every subfolder has one parent); (2) Network model: Electrical/Telecom Grid or Airline Route Management (nodes/airports have complex many-to-many physical connections); (3) Relational model: E-Commerce or Hospital Management System (requires ad-hoc SQL queries, normalized tables for patients/orders/payments, and strict ACID transactions).',
    explanation: 'Each model’s structural strengths match the natural relationships of its target domain.'
  },
  'Exercise 8.4 Q6': {
    answer: 'Features found in an Object-Oriented Database (OODBMS) that are not typically present in a pure Relational Database include: Object Identity (system-generated immutable OIDs independent of attribute values), Encapsulation of behavioral Methods/Functions alongside data inside stored objects, Class Inheritance hierarchies (`extends`), Polymorphism, and direct storage of complex nested/multimedia objects without flattening them into rows and columns.',
    explanation: 'An OODBMS integrates object-oriented programming features directly into persistent storage.'
  },
  'Exercise 8.4 Q7': {
    answer: 'Tree data structures organise nodes into a root, parent nodes, and child nodes where every non-root node has a single parent; the **Hierarchical Database Model** (such as IBM’s Information Management System [IMS] and XML/JSON document trees) directly uses a tree structure to represent one-to-many (1:N) parent-child record relationships, and RDBMSs also use **B-Trees / B+ Trees** internally to index tables for $O(\\log N)$ search.',
    explanation: 'Trees provide both the logical structure of hierarchical databases and the physical index structure (B+ Tree) of relational databases.'
  },
  'Activity 8.10 Q2': {
    answer: 'Organizing physical index cards mirrors database organization: grouping cards by topic or department corresponds to Table Categorization/Schemas; sorting cards alphabetically or by ID number corresponds to Primary Keys and B-Tree Indexing for fast searchability; and running out of desk space when cards grow from 50 to 50,000 highlights the need for DBMS Scalability, partitioning, and automated indexing.',
    explanation: 'Physical card catalogs are the direct historical predecessor of relational tables and database indexes.'
  },
  'Activity 8.11 Q1': {
    answer: 'Searching for a specific topic in a book without an index requires a linear page-by-page scan (`Full Table Scan` in database terms), which is slow, tedious, and takes $O(N)$ time proportional to the total number of pages in the book.',
    explanation: 'Without an index, a DBMS must read every single disk block in the table sequentially (`Full Table Scan`) to find matching rows.'
  },
  'Activity 8.11 Q2': {
    answer: 'In the second book, the alphabetical index at the back lists keywords alongside their exact page numbers, allowing you to look up the keyword in seconds and jump directly to the target page without flipping through unrelated chapters.',
    explanation: 'An index maps sorted search keys directly to physical page/row pointers.'
  },
  'Activity 8.11 Q3': {
    answer: 'Having an index reduces search time from minutes (scanning hundreds of pages) to a few seconds (logarithmic lookup $O(\\log N)$), dramatically improving retrieval speed and user efficiency—especially as the book (or database table) grows larger.',
    explanation: 'Indexes turn slow $O(N)$ linear scans into fast $O(\\log N)$ B-Tree lookups.'
  },
  'Activity 8.11 Q4': {
    answer: 'Similarities: Both a book index and a DBMS index store sorted search keys paired with pointers (page numbers vs disk block/row IDs) to speed up lookups without scanning the entire content, and both take up extra storage space. Differences: A DBMS index (such as a B+ Tree or Hash index) is dynamically updated automatically by the DBMS on every `INSERT`, `UPDATE`, and `DELETE`, supports multi-column composite keys, and is traversed in microseconds by the query optimizer.',
    explanation: 'While a printed book index is static, a database index is a live data structure maintained continuously by the storage engine.'
  },
  'Activity 8.12 Q3': {
    answer: 'A DBMS optimizes queries by parsing the SQL statement, generating candidate **Query Execution Plans**, using a Cost-Based Optimizer (with table statistics, row counts, and selectivity estimates) to choose the lowest-cost plan, utilizing **Indexes** (B+ Tree index scans instead of full table scans), and applying relational algebra rewrites (such as pushing `WHERE` selections down before `JOIN` operations).',
    explanation: 'Pushing filters early and using indexed joins minimizes disk I/O and CPU comparisons.'
  },
  'Activity 8.12 Q4': {
    answer: 'Filtering records by the most selective criteria first and looking up sorted/indexed keys directly rather than scanning every record one-by-one aligns directly with DBMS query optimization principles (Selection Pushdown and Index Seek).',
    explanation: 'Reducing the intermediate dataset size as early as possible is the core principle of both human and DBMS query optimization.'
  },
  'Activity 8.12 Q5': {
    answer: 'Selecting the most efficient query strategy is critical because on a table with 10 million rows, an unoptimized full scan or Cartesian join can take minutes or crash the server, whereas an indexed query plan completes in a few milliseconds—directly determining application scalability and user response time.',
    explanation: 'Algorithmic efficiency ($O(\\log N)$ vs $O(N^2)$) becomes decisive as data volume and query complexity grow.'
  },
  'Activity 8.13 Q4': {
    answer: 'Before creating indexes (`CREATE INDEX`), `SELECT ... WHERE` queries on large tables must perform a slower Full Table Scan ($O(N)$); after creating indexes on frequently searched/joined columns, query execution time drops dramatically ($O(\\log N)$ Index Seek) because the DBMS jumps directly to matching rows. Indexes are vital for read optimization, though they add a small write overhead during `INSERT`/`UPDATE`/`DELETE`.',
    explanation: '`EXPLAIN` query plans confirm that adding an index replaces sequential scans (`Seq Scan`) with fast `Index Scan` operations.'
  },
  'Activity 8.13 Q5': {
    answer: 'Mastering SQL and database operations enables developers and analysts to build reliable banking, healthcare, e-commerce, and government systems, extract actionable business intelligence from data, prevent SQL injection vulnerabilities, and tune slow enterprise applications.',
    explanation: 'Nearly every modern web, mobile, and enterprise system relies on SQL and relational databases for persistent storage.'
  },
  'Exercise 8.5 Q1': {
    answer: '```sql\nCREATE TABLE Books (\n    BookID INT PRIMARY KEY,\n    Title VARCHAR(250),\n    AuthorName VARCHAR(100),\n    PublishedYear INT\n);\n```',
    explanation: 'The `CREATE TABLE` DDL statement defines the four columns with their exact SQL data types (`INT`, `VARCHAR(250)`, `VARCHAR(100)`) and designates `BookID` as `PRIMARY KEY`.'
  },
  'Exercise 8.5 Q2': {
    answer: '```sql\nINSERT INTO Books (BookID, Title, AuthorName, PublishedYear)\nVALUES\n(1, \'Database System Concepts\', \'Abraham Silberschatz, Henry F. Korth, and S. Sudarshan\', 2020),\n(2, \'Artificial Intelligence in Education: Promise and Implications for Teaching and Learning\', \'Charles Fadel, Wayne Holmes, and Maya Bialik\', 2017);\n```',
    explanation: 'The `INSERT INTO ... VALUES` DML statement inserts both book records into the `Books` table.'
  },
  'Exercise 8.5 Q3': {
    answer: '```sql\nSELECT * FROM Books\nWHERE PublishedYear > 2018;\n```',
    explanation: '`SELECT *` retrieves all four columns and `WHERE PublishedYear > 2018` filters for books published strictly after 2018 (returning BookID 1 published in 2020).'
  },
  'Exercise 8.5 Q4': {
    answer: '```sql\nUPDATE Books\nSET PublishedYear = 2019\nWHERE BookID = 2;\n```',
    explanation: 'The `UPDATE` statement modifies `PublishedYear` to `2019` specifically for the row identified by `BookID = 2` (or `WHERE AuthorName = \'Charles Fadel, Wayne Holmes, and Maya Bialik\'`).'
  },
  'Exercise 8.5 Q5': {
    answer: '```sql\nDELETE FROM Books\nWHERE BookID = 2;\n```',
    explanation: 'The `DELETE FROM Books WHERE BookID = 2;` statement removes only the record with `BookID = 2` from the table.'
  },
  'Activity 8.14 Q3': {
    answer: 'Benefits of parallel and distributed systems: higher speed/throughput (dividing large workloads across multiple workers/nodes), high availability and fault tolerance (if one node fails, others continue), and geographic scalability. Challenges: coordination and communication overhead across nodes, data synchronization/consistency conflicts, network latency, and handling partial node failures.',
    explanation: 'Parallel and distributed databases trade coordination complexity for massive throughput and fault tolerance.'
  },
  'Activity 8.14 Q4': {
    answer: 'Real-world applications in Tanzania include: (1) National Mobile Money & Banking networks (M-Pesa, Mixx by Yas, Airtel Money, NMB, CRDB) processing concurrent transactions across all 31 regions; (2) Government e-Payment Gateway (GePG) and TRA tax systems; (3) NECTA national examination results portal and NIDA national ID verification; and (4) NHIF / AfyaCare national hospital records.',
    explanation: 'Nationwide financial and public-service platforms require distributed and parallel databases to serve millions of citizens simultaneously.'
  },
  'Exercise 8.6 Q1': {
    answer: '```sql\nSELECT * FROM Students\nWHERE Grade = \'A\';\n```',
    explanation: '`SELECT * FROM Students WHERE Grade = \'A\';` retrieves all columns for every student record whose `Grade` column equals `\'A\'`.'
  },
  'Exercise 8.6 Q2': {
    answer: '```sql\nUPDATE Employees\nSET Salary = Salary * 1.10\nWHERE Department = \'Sales\';\n```',
    explanation: 'Multiplying `Salary` by `1.10` (or `Salary = Salary + (Salary * 0.10)`) increases the salary of all employees in the `"Sales"` department by 10%.'
  },
  'Exercise 8.6 Q3': {
    answer: 'A **Parallel Database System** is identified by tightly coupled multiple CPUs/disks within a single location/cluster (using Shared-Memory, Shared-Disk, or Shared-Nothing architecture over a high-speed local interconnect) focused on parallelizing single queries; a **Distributed Database System** is identified by loosely coupled, autonomous database nodes physically located at different geographic sites connected via a WAN/Internet, featuring data replication/fragmentation and location transparency.',
    explanation: 'Physical proximity, interconnect speed (local bus/LAN vs WAN), and site autonomy distinguish parallel databases from geographically distributed databases.'
  },
  'Exercise 8.6 Q4': {
    answer: 'Data partitioning (horizontal sharding by range, hash, or round-robin across multiple disks and processor nodes) is critical in parallel databases because it enables **I/O parallelism** and **intra-query parallelism**—allowing multiple CPUs and disks to scan, join, and aggregate different slices of a massive table simultaneously rather than bottlenecking on a single disk.',
    explanation: 'Without partitioning, all CPUs would queue waiting to read from a single storage disk.'
  },
  'Exercise 8.7 Q1': {
    answer: 'Data is identified as "Big Data" by the **5 Vs**: **Volume** (massive scale—terabytes to petabytes that exceed single-server storage), **Velocity** (high-speed real-time generation/streaming, e.g., IoT telemetry or mobile payments), **Variety** (mixture of structured tables, semi-structured JSON/XML logs, and unstructured video/audio/text), **Veracity** (varying data quality/noise), and **Value** (actionable insights extracted via analytics).',
    explanation: 'When dataset Volume, Velocity, and Variety exceed the capacity of a traditional single-node RDBMS, Big Data architectures are required.'
  },
  'Exercise 8.7 Q2': {
    answer: 'Use a **Graph Database** (e.g., Neo4j) when data is defined by deep, complex, multi-hop relationships—such as social networks ("friends of friends"), fraud rings, or recommendation engines—where graph traversal is orders of magnitude faster than chaining 6+ SQL `JOIN`s. Use a **Relational Database** (e.g., PostgreSQL) when data is structured/tabular and requires strict schemas, complex financial aggregations, and multi-row ACID compliance (e.g., accounting and payroll).',
    explanation: 'Graph databases store relationships as first-class edges for $O(1)$ neighbor traversal, whereas RDBMSs excel at structured set-based tabular transactions.'
  },
  'Exercise 8.7 Q3': {
    answer: 'Developers use Serverless Databases (e.g., Firebase Firestore, AWS Aurora Serverless, Neon, CockroachDB Serverless) because they automatically scale compute and storage up or down (even to zero when idle) based on traffic demand, eliminate manual server provisioning/patching, and charge strictly on a pay-as-you-go per-query/storage basis—ideal for startups and unpredictable workloads.',
    explanation: 'Serverless databases remove infrastructure management overhead and prevent over-provisioning costs.'
  },
  'Exercise 8.7 Q4': {
    answer: 'Blockchain technology enhances databases with **Immutability** (tamper-evident append-only ledgers secured by cryptographic SHA-256 hash chains), **Decentralization** (no single point of failure or single corruptible administrator), **Transparency & Auditability** (verifiable transaction history), and **Trustless Consensus** across multiple organizations.',
    explanation: 'Once a block of transactions is cryptographically hashed and confirmed by consensus, historical records cannot be secretly altered or deleted.'
  },
  'Exercise 8.7 Q5': {
    answer: 'A Time-Series Database (TSDB, such as InfluxDB, TimescaleDB, or Prometheus) is most valuable when storing and querying high-velocity timestamped measurements—such as monitoring thousands of IoT weather/agricultural sensors, smart electrical grid meters, server CPU/network telemetry, or real-time stock market price ticks over time.',
    explanation: 'TSDBs are purpose-built for time-indexed append writes, time-window aggregations (moving averages, downsampling), and automatic retention policies.'
  },
  'Exercise 8.7 Q6': {
    answer: 'Applications requiring Distributed Databases include Global E-Commerce (Amazon), Multi-Branch Banking & Mobile Money, International Airline Reservation Systems (Amadeus), and Content Delivery/Social Media platforms—because they must serve millions of users across different cities/countries with low local latency, zero downtime if one data centre fails, and continuous horizontal scalability.',
    explanation: 'A single centralized database server would suffer high geographic latency and represent a single point of catastrophic failure.'
  },
  'Exercise 8.7 Q7': {
    answer: 'Database as a Service (DBaaS) is a cloud computing model (e.g., Google Cloud SQL, Amazon RDS, MongoDB Atlas) where a cloud provider hosts, configures, patches, backs up, monitors, and scales the database engine on behalf of the user; its valuable contribution is freeing software teams from hardware/DBA maintenance so they can deploy highly available, secure databases in minutes.',
    explanation: 'DBaaS automates replication, failover, automated daily backups, and security patching via a managed cloud console or API.'
  },
  'Exercise 8.7 Q8': {
    answer: 'The rise of IoT devices has driven real-time automation across smart agriculture (soil moisture/irrigation sensors), healthcare (remote patient vitals wearables), smart cities/utilities (smart TANESCO meters, fleet GPS tracking), and industrial predictive maintenance—while pushing database technology toward edge computing, Time-Series Databases, and high-throughput streaming pipelines.',
    explanation: 'Billions of connected IoT sensors generate continuous telemetry streams that enable data-driven automation.'
  },
  'Exercise 8.8 Q1': {
    answer: 'PHP (Hypertext Preprocessor) is a widely used open-source server-side scripting language designed for web development: it executes on the web server to process HTML form submissions, manage user sessions/authentication, interact with backend databases (like MySQL/PostgreSQL), and dynamically generate HTML or JSON responses sent to the client’s browser.',
    explanation: 'Unlike client-side JavaScript (which runs in the browser), PHP runs on the server and safely holds database credentials and business logic.'
  },
  'Exercise 8.8 Q2': {
    answer: 'PDO (PHP Data Objects) offers MySQL developers: (1) **Database Abstraction** (the same PDO code can switch between MySQL, PostgreSQL, SQLite, and SQL Server by changing only the DSN string); (2) Robust **Prepared Statements** with named/positional placeholders (`:email` or `?`) that prevent SQL Injection attacks; (3) Object-oriented **Exception Handling** (`PDOException`); and (4) Flexible fetch modes (`PDO::FETCH_ASSOC`, `PDO::FETCH_OBJ`).',
    explanation: 'PDO is the modern, secure standard for database access in PHP.'
  },
  'Exercise 8.8 Q3': {
    answer: '```php\n<?php\n$dsn = "mysql:host=localhost;dbname=school_db;charset=utf8mb4";\n$user = "root";\n$pass = "";\ntry {\n    $pdo = new PDO($dsn, $user, $pass, [\n        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION\n    ]);\n    echo "Connected successfully!";\n} catch (PDOException $e) {\n    echo "Connection failed: " . $e->getMessage();\n}\n?>\n```',
    explanation: 'Instantiating `new PDO($dsn, $username, $password)` inside a `try-catch` block with `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION` establishes a safe MySQL connection.'
  },
  'Exercise 8.8 Q4': {
    answer: '```php\n<?php\n$stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE role = :role");\n$stmt->execute([\'role\' => \'student\']);\n$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);\nforeach ($rows as $row) {\n    echo $row[\'name\'] . " (" . $row[\'email\'] . ")<br>";\n}\n?>\n```',
    explanation: 'Using `$pdo->prepare()`, `$stmt->execute()`, and `$stmt->fetchAll(PDO::FETCH_ASSOC)` (or `fetch()` in a `while` loop) safely queries and retrieves associative rows.'
  },
  'Exercise 8.9 Q1': {
    answer: 'A **Wide-Column Store** (e.g., Apache Cassandra, HBase) organises data into scalable tables with dynamic column families distributed across nodes—ideal for massive write-heavy time-series logs, IoT telemetry, and messaging history; a **Graph Database** (e.g., Neo4j) stores nodes and edges—ideal for traversing complex interconnected relationships like social networks, fraud detection, and knowledge graphs.',
    explanation: 'Wide-column stores optimize petabyte-scale distributed writes and partition scans, whereas graph databases optimize multi-hop relationship traversal.'
  },
  'Exercise 8.9 Q2': {
    answer: 'A document-oriented database like **MongoDB** (storing flexible JSON/BSON documents) is more suitable than an RDBMS for product catalogs with varying attributes (where laptops, shoes, and books have completely different fields), Content Management Systems (CMS/blogs), real-time mobile app user profiles, and rapid prototyping where schemas evolve frequently.',
    explanation: 'Embedding related nested data inside a single JSON document avoids multi-table joins and rigid `ALTER TABLE` migrations.'
  },
  'Exercise 8.9 Q3': {
    answer: 'Advantages of NoSQL databases for unstructured/semi-structured data include: **Schema Flexibility** (storing heterogeneous JSON, text, logs, and media metadata without predefined fixed columns), effortless **Horizontal Scalability** (auto-sharding across commodity server clusters), **High Write Throughput**, and native data structures (documents, key-value pairs, wide columns, graphs) that match application objects directly.',
    explanation: 'Traditional RDBMSs require normalizing data into fixed-column tables upfront, which is awkward for rapidly changing unstructured data.'
  },
  'Exercise 8.9 Q4': {
    answer: 'MongoDB CRUD operations on the `users` collection:\n```javascript\n// 1. Insert\ndb.users.insertOne({ name: "Asha", email: "asha@school.ac.tz", role: "student" });\n// 2. Query\ndb.users.find({ role: "student" });\n// 3. Update\ndb.users.updateOne({ email: "asha@school.ac.tz" }, { $set: { role: "prefect" } });\n// 4. Delete\ndb.users.deleteOne({ email: "asha@school.ac.tz" });\n```',
    explanation: 'In MongoDB Atlas / `mongosh`, `insertOne`, `find`, `updateOne` (with `$set`), and `deleteOne` perform complete document CRUD operations.'
  },
  'Exercise 8.9 Q5': {
    answer: 'Redis key-value store operations (`redis-cli` or Python `redis` client):\n```bash\nSET session:user101 "Asha Haji" EX 3600   # Create/Set key with 1h expiry\nGET session:user101                       # Retrieve value -> "Asha Haji"\nSET session:user101 "Asha H. Admin"       # Update value\nDEL session:user101                       # Delete key\n```',
    explanation: 'Redis stores data in RAM as ultra-fast key-value pairs (`SET`, `GET`, `DEL`, `EXPIRE`) with sub-millisecond latency for caching and session management.'
  },
  'Exercise 8.9 Q6': {
    answer: 'Apache Cassandra CQL (Cassandra Query Language) operations:\n```sql\nCREATE KEYSPACE school WITH replication = {\'class\': \'SimpleStrategy\', \'replication_factor\': 1};\nUSE school;\nCREATE TABLE students (id UUID PRIMARY KEY, name text, stream text);\nINSERT INTO students (id, name, stream) VALUES (uuid(), \'Juma\', \'PMC\');\nSELECT * FROM students;\n```',
    explanation: 'Cassandra organises tables inside a `KEYSPACE` (which defines the cluster replication strategy) and queries them using SQL-like CQL.'
  },
  'Revision Exercise 8 Q1': {
    answer: 'Digitizing academic records into cloud and relational databases aligns with digital transformation by enabling paperless e-Government/e-Education services, real-time analytics (tracking national pass rates and dropout risks), automated interoperability with national ID (NIDA) and examination boards (NECTA), and secure self-service student portals.',
    explanation: 'Structured digital databases transform static paper archives into real-time, interconnected decision-support systems.'
  },
  'Revision Exercise 8 Q2': {
    answer: 'Structured Query Language (SQL) is the standard declarative domain-specific language used to communicate with Relational Database Management Systems (RDBMS). It interacts with databases through DDL (`CREATE`, `ALTER`, `DROP` to define schemas), DML (`INSERT`, `UPDATE`, `DELETE` to modify data), DQL (`SELECT` to query data), and DCL/TCL (`GRANT`, `COMMIT`, `ROLLBACK` to control security and transactions).',
    explanation: 'In SQL, you specify *what* data you want, and the RDBMS query optimizer determines *how* to retrieve it.'
  },
  'Revision Exercise 8 Q3': {
    answer: 'A Relational Database enforces a rigid, predefined **tabular schema** (rows and fixed-type columns across normalized tables with foreign keys), whereas a NoSQL Database is **schema-less / schema-flexible**, storing data as JSON documents, key-value pairs, wide-column families, or graphs where each record can contain different fields and nested structures without altering a global table schema.',
    explanation: 'Relational databases prioritize schema strictness and relational joins, while NoSQL prioritizes structural flexibility and horizontal scale.'
  },
  'Revision Exercise 8 Q4': {
    answer: 'A NoSQL database is a better choice when handling massive volumes of rapidly changing unstructured or semi-structured data needing horizontal auto-sharding across many servers—such as real-time chat/social media feeds, IoT sensor streams, high-speed session caching (Redis), or heterogeneous e-commerce catalogs (MongoDB).',
    explanation: 'When scale-out write throughput and flexible nested schemas outweigh complex multi-table relational joins, NoSQL excels.'
  },
  'Revision Exercise 8 Q5': {
    answer: 'A **Data Warehouse** (OLAP — Online Analytical Processing, e.g., BigQuery, Snowflake) is a central repository that integrates historical data from multiple operational sources for long-term business intelligence, trend analysis, and reporting (organised in Star/Snowflake schemas and columnar storage); a **Traditional Operational Database** (OLTP — Online Transaction Processing) is designed for fast, real-time day-to-day CRUD transactions (normalized 3NF tables handling current orders/accounts).',
    explanation: 'OLTP databases optimize fast current-state writes/reads, whereas Data Warehouses (OLAP) optimize complex historical analytical queries over millions of rows.'
  },
  'Revision Exercise 8 Q6': {
    answer: 'Big Data challenges include: **Data Capture & Storage Scale** (ingesting terabytes per hour without dropping packets), **Data Cleaning & Veracity** (handling noisy, incomplete, duplicate, or inconsistent formats), **Processing Bottlenecks** (requiring distributed frameworks like Apache Spark/Hadoop), **Security & Privacy Compliance** (protecting personal data at scale), and **Skill/Infrastructure Cost**.',
    explanation: 'Managing the 5 Vs requires distributed storage, fault-tolerant stream processing, and strict data governance.'
  },
  'Revision Exercise 8 Q7': {
    answer: 'In **Healthcare** (or Education/Local Government): a national health data warehouse aggregates anonymized electronic medical records, lab results, and pharmacy stock across all regional hospitals in Tanzania to detect disease outbreaks (e.g., malaria/cholera hotspots) early, forecast medicine supply chains at MSD, and evaluate treatment effectiveness.',
    explanation: 'Combining historical data warehousing with big-data analytics turns scattered clinic records into national public-health intelligence.'
  },
  'Revision Exercise 8 Q8': {
    answer: 'By joining web server access logs (IP geolocation/region, device type, referral source) with user clickstream event tables (`page_view`, `add_to_cart`, `form_submit`, `session_duration`) in an analytical database or data warehouse, analysts can group and correlate user regions (`GROUP BY region`) with conversion rates and feature usage.',
    explanation: 'Web analytics pipelines correlate session metadata (location/device) with behavioral event logs to optimize regional services.'
  },
  'Revision Exercise 8 Q9': {
    answer: 'Store unstructured user feedback messages in a Document/NoSQL database or Data Warehouse and apply Text Analytics / Natural Language Processing (keyword frequency aggregation, topic clustering, and sentiment analysis grouped by service page) to surface recurring complaints, service bottlenecks, and feature requests.',
    explanation: 'Combining NoSQL text storage with NLP keyword/sentiment aggregation turns unstructured user comments into structured service insights.'
  },
  'Revision Exercise 8 Q10': {
    answer: '```sql\nUPDATE Employees\nSET Salary = Salary * 1.10\nWHERE Department = \'Sales\';\n```',
    explanation: 'The `UPDATE` statement multiplies `Salary` by `1.10` (a 10% increase) for all rows where `Department = \'Sales\'`.'
  },
  'Revision Exercise 8 Q11': {
    answer: 'Explain that both use multiple computers/processors to manage data, but a **Parallel Database** puts multiple CPUs and disks together inside one data centre to split up heavy queries for speed (like 4 chefs cooking one big meal in the same kitchen), whereas a **Distributed Database** spreads database nodes across different cities or branches connected over a network so local users get fast access and the system survives site outages (like a restaurant chain with kitchens in Dar es Salaam, Dodoma, and Arusha sharing recipes and records).',
    explanation: 'This clear distinction highlights tightly-coupled single-site parallel processing vs geographically dispersed multi-site distribution.'
  },
  'Revision Exercise 8 Q12': {
    answer: 'Data partitioning is important in parallel database systems because it splits a large table across multiple independent disks and CPU nodes, enabling **parallel disk I/O** and **parallel query execution** (each processor scans and processes its own partition simultaneously), eliminating single-disk bottlenecks and achieving near-linear scale-up.',
    explanation: 'Partitioning allows $N$ processors and $N$ disks to read and filter a table $N$ times faster than a single node.'
  },
  'Revision Exercise 8 Q13': {
    answer: 'The primary reason for using tables (relations of rows/tuples and columns/attributes) in an RDBMS is to provide a **structured, mathematically rigorous (relational algebra), and self-describing logical representation of data** where entities are stored without redundancy, linked via Primary and Foreign keys, and queried flexibly using declarative SQL.',
    explanation: 'Tabular relations separate logical data structure from physical disk storage (Data Independence) and guarantee data integrity.'
  },
  'Revision Exercise 8 Q14': {
    answer: 'Indexes (such as B+ Trees) are used in a DBMS to **accelerate data retrieval (`SELECT` queries, `WHERE` filters, `JOIN`s, and `ORDER BY` sorts)** by allowing the database engine to locate matching rows in logarithmic time $O(\\log N)$ via index pointers instead of scanning every row in the entire table ($O(N)$ Full Table Scan).',
    explanation: 'Just like a book index, a database index avoids reading every page of a table to find specific records.'
  },
  'Revision Exercise 8 Q15': {
    answer: 'The goal of **Query Optimization** in a DBMS is to automatically evaluate multiple valid execution plans for a given SQL query and select the **most efficient execution plan** that minimizes total resource cost—specifically disk I/O reads, CPU cycles, memory usage, and network transfer time—so the user receives results with the lowest possible latency.',
    explanation: 'Two equivalent relational algebra plans can differ in execution time by orders of magnitude; the query optimizer picks the fastest plan.'
  },
  'Revision Exercise 8 Q16': {
    answer: 'A **Distributed Database System** is the better choice for Tanzania’s national healthcare system, because hospitals and clinics are geographically spread across all regions (Dar es Salaam, Mwanza, Mbeya, Dodoma, Zanzibar, etc.): storing regional patient records on local distributed nodes ensures fast local access even if national internet links fluctuate, provides fault tolerance if one regional server goes offline, and synchronizes national patient histories across referral hospitals.',
    explanation: 'Geographic distribution across distant hospitals requires a Distributed Database (potentially with parallel clusters at the national referral centre).'
  },
  'Revision Exercise 8 Q17': {
    answer: 'The rise of IoT devices creates demands for: (1) **High-Velocity Write Ingestion** (handling millions of continuous timestamped sensor readings per second); (2) **Scalable Time-Series & NoSQL Storage** with automatic data compression and retention/archiving; (3) **Low-Latency Edge Computing** (filtering data near sensors before cloud upload); and (4) **End-to-End Device Authentication & Encryption**.',
    explanation: 'Traditional databases designed for occasional human clicks must evolve to ingest nonstop machine-generated sensor streams.'
  },
  'Revision Exercise 8 Q18': {
    answer: 'The `echo` statement in PHP is used to output one or more strings, variables, numbers, or HTML markup blocks from the server-side PHP script directly into the HTTP response sent to the client’s web browser.',
    explanation: 'For example, `echo "<h1>Welcome, $username</h1>";` renders the dynamic heading in the browser.'
  },
  'Revision Exercise 8 Q19': {
    answer: 'HTTP `GET` appends form/query parameters visibly inside the URL query string (`page.php?user=asha&id=5`), has URL length limits (~2048 chars), can be cached/bookmarked, and should only be used for idempotent data **retrieval**; HTTP `POST` sends data inside the **HTTP request body** (not visible in the URL), has no size limit (supports large text and file uploads), is not cached in browser history, and is used for **submitting sensitive data (passwords) or modifying server state (inserts/updates)**.',
    explanation: 'Never use `GET` for passwords or state-changing database writes because URL query strings are logged in browser history and server access logs.'
  },
  'Revision Exercise 8 Q20': {
    answer: '```php\n<?php\n$pdo = new PDO("mysql:host=localhost;dbname=app_db;charset=utf8mb4", "root", "", [\n    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION\n]);\n// CREATE\n$stmt = $pdo->prepare("INSERT INTO users (name, email) VALUES (:name, :email)");\n$stmt->execute([\'name\' => \'Asha\', \'email\' => \'asha@example.com\']);\n// READ\n$stmt = $pdo->query("SELECT * FROM users");\n$users = $stmt->fetchAll(PDO::FETCH_ASSOC);\n// UPDATE\n$stmt = $pdo->prepare("UPDATE users SET name = :name WHERE id = :id");\n$stmt->execute([\'name\' => \'Asha Haji\', \'id\' => 1]);\n// DELETE\n$stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");\n$stmt->execute([\'id\' => 1]);\n?>\n```',
    explanation: 'Using PDO prepared statements (`prepare()` + `execute()`) implements Create (`INSERT`), Read (`SELECT`), Update (`UPDATE`), and Delete (`DELETE`) securely against SQL injection.'
  }
};

export const CS_F5_QUESTIONS_PART1: Array<[string, string, string, string]> = [
  ["chapter-1","1.1 Computer organization and architecture","Scenario 1.1","The school's new computer laboratory is experiencing performance issues, with slow programs to access educational materials, conducting research and doing assignments. Upgrading every computer may not be possible, so understanding computer architecture becomes crucial. Assume the computers are houses with shared space where the current computers have a single \"room\" for both instructions and data, causing a traffic jam that slows down processing.\n\n \n\nBased on the scenario, describe the ways you may undertake to improve the computer performance."],
  ["chapter-1","1.1 Computer organization and architecture","Activity 1.1 Q1","Describe the relationship between the three parts of the computer processor."],
  ["chapter-1","1.1 Computer organization and architecture","Activity 1.1 Q2","Does a bus system used for both data and instructions, allow the CPU to fetch and execute instructions sequentially? Explain."],
  ["chapter-1","1.1 Computer organization and architecture","Activity 1.2","Explain how memory allocation of data takes place by interaction between I/O system, RAM and CPU."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.2 Q1","Prove the following using Boolean laws and rules:\n\n• $AB + AC + ABC = AB + AC$\n\n• $A(\\overline{A} + B) = AB$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.2 Q2","Use laws of Boolean algebra to simplify the following expressions:\n\n• $ABC + AB\\overline{C}$\n\n• $\\overline{B}C + BC + AC$\n\n• $B + AB + \\overline{A}BC$\n\n• $\\overline{A}B\\overline{C} + AC + \\overline{A}BC$\n\n• $\\overline{AC} + AB\\overline{C}$\n\n• $\\overline{A}BC\\overline{D} + \\overline{A}BCD$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.2 Q3","Using the laws of Boolean algebra, verify the Boolean identity $A + (A \\cdot B) = A$."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.3 Q1","Prove the following using the truth table:\n\n• $AB + AC + ABC = AB + AC$\n\n• $A + (B + C) = (A + B) + C$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.3 Q2","Create the truth table of the following expression: $X = A + \\overline{BC}$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.3 Q3","Given the truth Table 1.9, determine the Boolean expression for $Y$ in terms of $A$ and $B$.\n\nA | B | Y\n0 | 0 | 0\n0 | 1 | 1\n1 | 0 | 1\n1 | 1 | 0"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.4 Q1","Use DeMorgan's theorem and laws of Boolean algebra to simplify the following expressions:\n\n• $\\overline{\\overline{ABC} + ABC}$\n\n• $\\overline{BC + \\overline{B}C} + AC$\n\n• $B + AB + \\overline{A}BC$\n\n• $\\overline{A}B\\overline{C} + AC + \\overline{A}BC$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.4 Q2","Use the truth table to prove the following DeMorgan's theorem: $\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.4 Q3","Demonstrate DeMorgan's theorem using a truth table for the expression: $\\overline{ABC} = \\overline{A} + \\overline{B} + \\overline{C}$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Activity 1.9 Q2","Explain if the output of the circuit test from a simulator gives the same results as in Table 1.11 ($x \\text{ AND } y$)."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Activity 1.11 Q1","Two electrical switches A and B, a bulb, and a battery are connected in parallel as shown in Figure 1.28.\n\nTwo electrical switches, a bulb and a battery are connected as shown in Figure 1.28. As a technical expert, you are required to establish the truth table to reflect the circuit operations that control switches A and B, which will light up the bulb, and then propose the logic gate for the circuit. The following conditions will guide you:\n\nWhat happens when both switches are OFF?;"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Activity 1.11 Q2","Two electrical switches A and B, a bulb, and a battery are connected in parallel as shown in Figure 1.28.\n\nTwo electrical switches, a bulb and a battery are connected as shown in Figure 1.28. As a technical expert, you are required to establish the truth table to reflect the circuit operations that control switches A and B, which will light up the bulb, and then propose the logic gate for the circuit. The following conditions will guide you:\n\nWhat happens when only one switch is ON (either A or B)?; and"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Activity 1.11 Q3","Two electrical switches A and B, a bulb, and a battery are connected in parallel as shown in Figure 1.28.\n\nTwo electrical switches, a bulb and a battery are connected as shown in Figure 1.28. As a technical expert, you are required to establish the truth table to reflect the circuit operations that control switches A and B, which will light up the bulb, and then propose the logic gate for the circuit. The following conditions will guide you:\n\nWhat happens when both switches are ON?"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.5 Q1","Design a logic circuit using AND, OR, and NOT gates to implement the following Boolean expression: $A \\cdot (B + \\overline{C})$. Draw the circuit diagram and explain each step."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.5 Q2","Explain how you could use logic gates to create a simple security system that turns on an alarm (output) only when two conditions are met: the door is open (input A) and the motion sensor is triggered (input B). Draw the circuit and describe how it works."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.5 Q3","Use a logic circuit simulator to create and test a circuit that represents the following logic function: $C + B \\cdot C$. Provide screenshots of your circuit design and simulation results, and discuss any challenges you faced."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.5 Q4","Use TinkerCad to simulate the application of logic gates and verify if the results match the expected behavior according to the principles of logic gates."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.6 Q1","Create a logic circuit of the Boolean expressions:\n\n• $AB + B\\overline{C}$\n\n• $\\overline{B}C + (B + AC)$\n\n• $AB + \\overline{A}BC$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.6 Q2","Determine the Boolean expression and draw the truth table from the following circuit in Figure 1.33:\n\n [Circuit in Figure 1.33: Input A passes through a NOT gate into a top AND gate along with input B; inputs B and C feed a bottom OR gate; both gate outputs feed a final AND gate producing output F]"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.6 Q3","Design a combinational circuit with three inputs A, B, and C and three outputs X, Y, and Z. When the binary input is 0, 1, 2, and 3 the binary output is two greater than the input; when the binary input is 4, 5, 6, 7, the binary output is three less than the input.\n\n• Construct a truth table for that scenario.\n\n• Derive the Boolean expression for the output.\n\n• Simplify the Boolean expression for output obtained in part (b).\n\n• Draw a logic circuit for that simplified expression in part (c)."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.7 Q1","Draw the truth table of the half adder and determine its Boolean expression."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.7 Q2","Explain why Boolean algebra is important in the digital system."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.7 Q3","Using the laws of Boolean algebra, simplify the following expressions:\n\n• $AB + A\\overline{B} + BC + AC$\n\n• $\\overline{A} + AB + \\overline{C} + \\overline{BC}$\n\n• $A + \\overline{A}B$\n\n• $\\overline{ABC} + AC + ABC$"],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.7 Q4","Given the Boolean expression $Y = AB + ABC + A\\overline{BC} + A\\overline{B}$:\n\n• Draw the logic circuit of the Boolean expression.\n\n• Simplify the Boolean expression.\n\n• Draw the logic circuit of the simplified Boolean expression."],
  ["chapter-1","1.2 Logic Gates and Boolean Algebra","Exercise 1.7 Q5","From the following Boolean expressions, simplify and then draw a logic circuit for the simplified expression:\n\n• $Y = A(B + AB) + AC$\n\n• $Y = A(A + B)(\\overline{A} + \\overline{B})$\n\n• $Y = \\overline{ABC} + \\overline{ACC} + ABC$"],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Scenario 1.3 (Memory Hierarchy) Q1","In any typical library, books are organised on shelves by subjects like Physics, Mathematics, and Computer Science. This is similar to memory hierarchy in computers, where data is stored at different levels based on accessibility and speed. Signs and labels help people locate books easily, similar to memory addresses used to access specific data on computers. Frequently accessed books are placed closer for quick access, much like cache memory in computers storing recently accessed data for faster retrieval. Books on shelves represent primary memory for immediate access, while additional copies in storage rooms or archives represent secondary memory.\n\n \n\nBased on the scenario you have read, what is the importance of signs and labels in the library? Explain by relating this to how memory is organised and accessed in a computer."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Scenario 1.3 (Memory Hierarchy) Q2","In any typical library, books are organised on shelves by subjects like Physics, Mathematics, and Computer Science. This is similar to memory hierarchy in computers, where data is stored at different levels based on accessibility and speed. Signs and labels help people locate books easily, similar to memory addresses used to access specific data on computers. Frequently accessed books are placed closer for quick access, much like cache memory in computers storing recently accessed data for faster retrieval. Books on shelves represent primary memory for immediate access, while additional copies in storage rooms or archives represent secondary memory.\n\n \n\nExplain how useful is the idea of using shelves in the library. Analyse how this idea relates to the organisation and management of computer memory."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.8 Q1","Find the Average Memory Access Time (AMAT) for a processor with a cache hit rate of $95\\%$, a hit time of $4\\text{ ns}$, and a miss penalty of $80\\text{ ns}$."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.8 Q2","Given a computer system with varying memory requirements, explain how each level of the memory hierarchy (cache, main memory, and secondary storage) optimises system performance and cost-effectiveness."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.8 Q3","Discuss how the characteristics of DRAM, SRAM, Flash Memory, and Magnetic disk make them suitable for their respective levels in the memory hierarchy. Use examples to illustrate how each technology's speed, cost, and storage capacity contribute to the overall efficiency of the system."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.8 Q4","Flash memory, characterised by non-volatility, portability and reasonable speed has revolutionised the way we store and access data in the 21st century. Research on applications of Flash memory."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.9 Q1","Explain how cache memory improves the performance of a computer system. Provide an example to illustrate its role in speeding up data access."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.9 Q2","Describe the difference between cache memory and main memory (RAM). Why is cache memory faster but smaller compared to RAM?"],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.9 Q3","How does the principle of locality of reference influence the effectiveness of cache memory? Provide examples of spatial and temporal locality."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.9 Q4","Discuss the concept of cache hit and cache miss. Why are cache hits desirable, and how do cache misses impact system performance? Provide real-world analogies to explain these concepts."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.10 Q1","Describe the LRU replacement algorithm."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.10 Q2","What would the k-way set associative mapping become, if $k=1$?"],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.10 Q3","How many sets does a fully set associative mapping have?"],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.11 Q1","Imagine you are a librarian managing a library with two sections: a reference section with readily available books on shelves and a vast archive room for storing older materials. How is this analogy similar to the concept of primary and secondary memory in a computer? Explain the key differences between primary and secondary memory in terms of speed and capacity."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.11 Q2","You are working on a critical assignment and need to access a document you saved earlier. However, when you try to open it, you receive an error message. What factors could be preventing you from accessing the document? Explain the role of primary and secondary memory in potentially causing this issue."],
  ["chapter-1","1.3 Memory Hierarchy and Cache Memory","Exercise 1.11 Q3","Imagine you are working on a complex group project. To ensure everyone has access to the latest information, you might utilize a shared online document and a local copy on your device. Explain the concept of virtual memory and the TLB in a way that relates to this collaborative scenario. How do they work together to optimise memory usage?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Scenario 1.4 Q1","How does the concept of addressing modes in Instruction Set Architecture relate to different cooking techniques in a kitchen?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Scenario 1.4 Q2","In what ways are the roles of registers in a processor similar to the tools used by a chef in a kitchen?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Scenario 1.4 Q3","Can you explain the significance of understanding Instruction Set Architecture for programmers and computer engineers in developing software for different computer architectures?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.12 Q1","The passage describes two main approaches to instruction set design: RISC and CISC. Create a table comparing these two approaches. Include details like design philosophy, instruction complexity, efficiency considerations, and common applications."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.12 Q2","Research a specific example of a modern CPU (Central Processing Unit). Identify the ISA it uses (e.g., Intel x86, ARMv8) and explain why this particular ISA might be chosen for that specific CPU."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Activity 1.15 Q1","Identify which registers were used as temporary registers and which were used for storing results (in the sample MIPS program using $t0 , $t1 , $s0 , $s1 )."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Activity 1.15 Q2","Explain how the li instruction (load immediate) is used to load values into registers."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Activity 1.15 Q3","Discuss the role of the add and sub instructions in manipulating data within registers."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Activity 1.15 Q4","Discuss how specific ISA instructions ( add , li , load , etc.) interact with registers."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Activity 1.15 Q5","Explain how registers contribute to the overall efficiency of program execution."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.13 Q1","With the help of diagrams, describe the following datapath functional units: instruction memory, program counter, adder, register file, ALU and Sign extension."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.13 Q2","The instruction execution cycle described in 1.4.2 is for arithmetic instructions. Using the library and online resources, write the instruction execution cycle for load/store instructions."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.13 Q3","Research and explain the purpose of the sign extension element in the datapath. When would sign extension be necessary during arithmetic operations involving immediate values in MIPS instructions?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.14 Q1","Imagine you are a programmer working on a game engine for a mobile racing game. The game uses various data structures to store information about the race track, car physics, and player input. Answer the following questions, considering the most appropriate addressing mode (register, immediate, direct, indirect, or relative) for each scenario and explain your reasoning:\n\nShujaa power activation: The game allows players to activate \"Shujaa Power,\" which grants a temporary speed boost. This activation is triggered by a button press. A flag value (0 for not pressed, 1 for pressed) is stored in a specific memory location. Which addressing mode would be most efficient for the instruction that checks this flag value, and why?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.14 Q2","Imagine you are a programmer working on a game engine for a mobile racing game. The game uses various data structures to store information about the race track, car physics, and player input. Answer the following questions, considering the most appropriate addressing mode (register, immediate, direct, indirect, or relative) for each scenario and explain your reasoning:\n\nCar position update: During the race, the car's position on the track is constantly updated based on various calculations. The new position data needs to be stored in a specific variable within a complex data structure representing the car object. Which addressing mode would be suitable for the instruction that stores the new position, and how would you communicate this addressing mode choice to another programmer working on the same code?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.14 Q3","Imagine you are a programmer working on a game engine for a mobile racing game. The game uses various data structures to store information about the race track, car physics, and player input. Answer the following questions, considering the most appropriate addressing mode (register, immediate, direct, indirect, or relative) for each scenario and explain your reasoning:\n\nDynamic difficulty adjustment: The game can adjust difficulty based on player performance. An array stores pre-defined difficulty settings. Based on the player's score, the program needs to access a specific difficulty setting within the array. Which addressing mode would be appropriate, and how could you modify the code to dynamically adjust the difficulty based on an external factor (player score)?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.14 Q4","Imagine you are a programmer working on a game engine for a mobile racing game. The game uses various data structures to store information about the race track, car physics, and player input. Answer the following questions, considering the most appropriate addressing mode (register, immediate, direct, indirect, or relative) for each scenario and explain your reasoning:\n\nCollision detection: To check for collisions, the game needs to compare the car's position data with the positions of obstacles stored in an array. How would you use addressing modes to efficiently compare the car's position with multiple obstacle positions stored in memory? Explain your approach to a teammate who might be less familiar with addressing modes."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.14 Q5","Imagine you are a programmer working on a game engine for a mobile racing game. The game uses various data structures to store information about the race track, car physics, and player input. Answer the following questions, considering the most appropriate addressing mode (register, immediate, direct, indirect, or relative) for each scenario and explain your reasoning:\n\nOptimizing performance: The game needs to run smoothly on various mobile devices. How can your understanding of addressing modes help you optimise the game code for performance? Explain your approach considering the trade-offs between different modes."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.14 Q6","Imagine you are a programmer working on a game engine for a mobile racing game. The game uses various data structures to store information about the race track, car physics, and player input. Answer the following questions, considering the most appropriate addressing mode (register, immediate, direct, indirect, or relative) for each scenario and explain your reasoning:\n\nResearch another addressing mode not covered in this section (such as, base displacement addressing). Explain a scenario in the game engine where this addressing mode might be useful and why."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.15 Q1","You are designing a new wearable fitness tracker. Would you choose an ARM or x86 processor for this device? Give reasons."],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.15 Q2","Both ARM and x86 architectures are constantly evolving. Research and describe a recent development in either ARM or x86 technology. How does this advancement impact the capabilities of processors?"],
  ["chapter-1","1.4 Instruction Set Architecture (ISA)","Exercise 1.15 Q3","You are participating in a debate about which processor architecture is \"superior.\" Would you argue for ARM or x86? Develop a persuasive argument highlighting the strengths and ideal applications for your chosen architecture."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Scenario 1.3 (I/O Systems) Q1","While DMA is great for large deliveries, how would the restaurant handle individual customer orders from their tables? Is there an analogous concept in computer I/O systems for dealing with smaller data transfers? Give reasons."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Scenario 1.3 (I/O Systems) Q2","Imagine multiple events happening at once—a fire alarm goes off while a large food delivery arrives. How would the restaurant staff prioritize handling these urgent situations? How does this relate to the way processors handle interrupts and exceptions with varying priorities?"],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Scenario 1.3 (I/O Systems) Q3","Why might the head chef have restricted access to the master control panel? How does this concept translate to privileged instructions in computer architecture? Provide any security risks associated with non-privileged programs having access to certain functions."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.16 Q1","DMA allows direct memory access, bypassing the processor's cache. How might this impact data consistency between the processor and memory? Propose potential solutions to mitigate this challenge."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.16 Q2","While DMA offers performance benefits, it adds hardware complexity. Research the cost implications of implementing DMA controllers in computer systems. How does this cost factor into decisions about using DMA?"],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.16 Q3","Research and discuss specific examples of how DMA technology is utilised in various fields like networking, multimedia, scientific computing, or real-time data processing. Prepare a short presentation highlighting these real-world applications and their significance."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.16 Q4","Simulate a simple DMA transfer scenario using a flowchart or pseudocode, outlining the steps involved from processor initiation to data transfer completion."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.17 Q1","MIPS utilises the cause and status registers to manage interrupts and exceptions. Research the specific bit positions and corresponding causes within the Cause register as seen in Table 1.15 and 1.16. Investigate the status register and its role in interrupt handling within MIPS ISA. Explain how these registers work together to differentiate between interrupts and exceptions."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.17 Q2","While MIPS utilises polled interrupts, many modern systems employ vectored interrupt tables. Research the concept of vectored interrupt tables and compare them to polled interrupts. Discuss the advantages and disadvantages of each approach. Identify real-world applications where interrupt and exception handling in MIPS ISA plays a crucial role (such as, device interactions, and system calls)."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.18 Q1","Complete the following privileged instructions (x86) given real-world kitchen equivalents in Table 1.17:\n\nInstruction (x86) | Kitchen Equivalent Description\n[Fill in Instruction] | Changing the recipe book (Paging table): This instruction modifies the Control Register (CR3), which acts like the head chef's master recipe book (paging table) in our analogy.\n[Fill in Instruction] | Checking the oven temperature (input): This instruction reads a byte of data from a port specified in the DX register and stores it in the AL register.\n[Fill in Instruction] | Turning off the stove (halt): This instruction puts the processor into a low-power state, effectively stopping all program execution."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.18 Q2","Why is it important to restrict access to privileged instructions? Think about potential consequences if junior cooks had unrestricted access to all ingredients and appliances."],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.18 Q3","A new recipe (user program) requires deep-frying (privileged operation) a specific ingredient. How can the junior cooks (user program) achieve this task securely and efficiently, following the access control protocols of the kitchen (CPU)?"],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.19 Q1","What is the primary function of the memory system in a computer?"],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.19 Q2","How does the I/O system contribute to the overall functionality of a computer?"],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.19 Q3","What are the key responsibilities of the memory system in managing data and instructions?"],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.19 Q4","How does the I/O system facilitate communication between the computer and external devices?"],
  ["chapter-1","1.5 Input/Output (I/O) and Memory Systems","Exercise 1.19 Q5","What are some common challenges faced by the memory and I/O systems, and how are they addressed in modern computer architectures?"],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q1","Artificial intelligence (AI) and machine learning (ML) are rapidly evolving fields. How can you design your computer architecture to accommodate the ever-growing processing demands of AI and ML algorithms, considering factors like scalability and energy efficiency?"],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q2","Ethical considerations are paramount in technology development. Research potential security risks and privacy concerns associated with advanced computer architectures. Propose solutions to mitigate these risks, ensuring the responsible and ethical development of your future computer system."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q3","Modern processors employ multiple cache levels. Analyse the trade-offs between increasing the cache size (L1, L2, L3) and the impact on AMAT."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q4","How would increasing associativity (number of ways) within a cache level affect performance? Consider factors like hit rate, miss penalty, and overall access time."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q5","How might the traditional memory hierarchy need to adapt to efficiently handle large, complex datasets? Propose potential modifications or new memory technologies that could be beneficial for big data and Machine Learning applications."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q6","Cache misses can introduce vulnerabilities in certain scenarios. Explain how a malicious program might exploit cache misses to gain unauthorised access to sensitive data."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q7","Discuss potential mitigation strategies that computer architects or software developers can implement to improve cache security."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q8","Flash memory has become a prominent storage solution, particularly in mobile devices. Brainstorm three creative ways flash memory technology could be further utilized in various aspects of everyday life beyond just storing data on smartphones and tablets."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q9","As technology evolves, so does memory technology. Research emerging memory technologies that scientists are exploring. Briefly describe one such technology and discuss its potential advantages and disadvantages compared to traditional memory solutions."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q10","Imagine you are designing a new type of handheld gaming device. Considering factors like battery life, processing power, and game complexity, what type of ISA (RISC or CISC) would be most suitable for this device? Explain your reasoning."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q11","Discuss the advantages and disadvantages of having a standardised ISA for all computers."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q12","The passage mentions the emergence of custom ISAs for specific applications. Research and describe one example of a custom ISA and its intended use case. How might custom ISAs impact the future of computing?"],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q13","Provide an example of a MIPS instruction that utilises the immediate data input (immed) as shown in the datapath in Figure 1.61 and explain how it is used in operation."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q14","Imagine explaining the differences between ARM and x86 processors to a friend who is not familiar with computer architecture. Break down the key concepts in an easy-to-understand way, using analogies or real-world examples."],
  ["chapter-1","1.6 Chapter 1 Revision & Projects","Revision Exercise 1 Q15","Think about the environmental impact of different processor architectures. How does the lower power consumption of ARM processors contribute to a greener future for technology? Research and share some information on sustainable computing practices."],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Scenario 2.1 Q1","Assume each customer orders only one chapati. In a non-pipelined approach: 1. Order taking (5 mins), 2. Dough preparation (10 mins), 3. Rolling (5 mins), 4. Cooking chapati (5 mins), 5. Serving (5 mins). Mama Chapati can optimise her kitchen using pipelining with kitchen assistants at each stage.\n\n \n\nHow much speedup is gained by introducing a pipeline into the process of cooking chapatis?"],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Scenario 2.1 Q2","Assume each customer orders only one chapati. In a non-pipelined approach: 1. Order taking (5 mins), 2. Dough preparation (10 mins), 3. Rolling (5 mins), 4. Cooking chapati (5 mins), 5. Serving (5 mins). Mama Chapati can optimise her kitchen using pipelining with kitchen assistants at each stage.\n\n \n\nThink about the challenges of pipelining in Mama Chapati's kitchen. What if the frying pan is already occupied when a new chapati needs to be cooked? How can Mama Chapati address this data dependency?"],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Exercise 2.1 Q1","You are analysing a program running on a MIPS processor with a 5-stage pipeline. The program has a mix of instructions, with the following breakdown: add : $40\\%$, sub : $20\\%$, lw : $20\\%$ and sw : $20\\%$. All instructions take one cycle each in the execute stage. Memory access for lw and sw takes an additional cycle in the Memory Access stage.\n\n• Assuming a clock cycle time of $1\\text{ ns}$ (nanosecond), calculate the theoretical throughput (instructions completed per second) of this program on a pipelined processor.\n\n• How would the throughput be affected if the program had a higher percentage of lw and sw instructions compared to arithmetic instructions? Explain your reasoning."],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Exercise 2.1 Q2","Imagine two MIPS processors with different pipeline depths: a 5-stage pipeline (as assumed earlier) and a deeper 8-stage pipeline. Discuss the potential benefits and drawbacks of using a deeper pipeline in terms of performance."],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Exercise 2.2 Q1","Use resources such as the internet and the library to research on the following types of data hazards: Read After Write (RAW), and Write After Read (WAR)."],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Exercise 2.2 Q2","The following instructions represent a program to be processed by a simplified processor pipeline. Identify the type(s) of hazards for each instruction, if any. Write \"None\" if no hazard is present:\n\nadd $r1, $r2, $r3\nsub $r4, $r1, $r5\nlw $r6, 100($r6)\nadd $r7, $r4, $r8\nbeq $r7, $r2, Loop\nadd $r9, $r10, $r1"],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Exercise 2.3 Q1","As processor technology advances, new challenges and opportunities arise. Research emerging trends in pipeline hazard mitigation. Are there techniques beyond stalling and forwarding? How do these advancements contribute to the ever-increasing performance demands of modern computing?"],
  ["chapter-2","2.1 Instruction Pipelining and Hazards","Exercise 2.3 Q2","You are given the following instructions below:\n\nlw $s0, 20($t1)\nsub $t2, $s0, $t3\n\n• Draw the timing diagram to detect hazards. How many stalls are needed to avoid the hazard(s)?\n\n• Now introduce forwarding to resolve the hazard. Has the forwarding helped you to completely avoid stalling the pipeline?\n\n• Based on the answer in 2(b) and based on reputable materials from the library or the internet, state if the following statement is TRUE or FALSE: \"You can always avoid stalls in data hazards by forwarding\"."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Scenario 2.2 Q1","Identify other independent tasks within the washing machine that could benefit from ILP. Consider safety measures and potential limitations."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Scenario 2.2 Q2","How can sensor data be effectively utilized to optimise the washing process using ILP techniques?"],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Scenario 2.2 Q3","Explain the concept of ILP to a customer at the laundromat. How does it benefit them from a practical standpoint?"],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.4 Q1","How does identifying data dependencies within a program impact ILP? Explain with an example."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.4 Q2","Design a simple flow chart illustrating the sequential and ILP execution of a program segment that subtracts two numbers."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.4 Q3","Discuss the advantages and disadvantages of hardware- and software-based approaches to ILP."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.4 Q4","Discuss the potential disadvantages of ILP in real-world scenarios."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.5 Q1","Consider the loop unrolling example in the text. Explain why loop unrolling might not always be beneficial. What are some potential drawbacks of loop unrolling?"],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.5 Q2","Imagine a loop that iterates 100 times, performing a multiplication ($a * b$) and storing the result in a variable ($c$). How much improvement in execution cycles could loop unrolling (factor of 4) achieve, assuming a 5-stage pipeline and perfect pipelining conditions? Explain your calculations."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.6 Q1","Consider a program with the following instruction sequence:\n\n• Instruction 1: Add A and B, store in C\n\n• Instruction 2: Subtract C from D, store in E\n\n• Instruction 3: Multiply E and F, store in G\n\n• Explain how a scalar pipelined processor would execute this sequence. How many clock cycles would it likely take (assuming no pipeline stalls)?\n\n• How would a 2-issue superscalar processor potentially improve the execution time compared to the scalar approach? Briefly explain your reasoning."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.6 Q2","Which of the following statements accurately describes the key difference between a scalar and a superscalar processor?\n\n• Scalar processors can exploit out-of-order execution, while superscalar processors cannot.\n\n• Superscalar processors have multiple execution units, whereas scalar processors have only one.\n\n• Scalar processors are more complex due to dynamic scheduling, unlike superscalar processors.\n\n• Superscalar processors require compiler intervention for parallel execution, while scalar processors do not."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.7 Q1","You are working on a processor design that utilizes dynamic branch prediction. The processor encounters the following loop code:\n\nfor (int i = 0; i < 10; i++) {\n if (i > 5) {\n // Execute some instructions only for the second half of the loop\n }\n}\n\n• Analyse the loop behavior and identify how many times the conditional branch ( if (i > 5) ) will be taken during a single loop execution. Explain your answer.\n\n• Which approach would be more suitable for the given loop, and why?"],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.7 Q2","2-Bit BHT Simulation: Simulate on paper the behavior of a 2-bit Branch History Table (BHT) for the provided loop. Assume the initial BHT prediction state is \"Strongly Not Taken\" (00).\n\n• Create a table with the following columns: Iteration, Actual Branch, BHT Prediction (before the update), and Outcome update (after execution).\n\n• Fill out the table for the first five iterations of the loop."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.7 Q3","Based on your simulation in question 2, calculate the prediction accuracy of the 2-bit BHT for the first five iterations of the loop."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.7 Q4","Briefly discuss the impact of branch prediction accuracy on processor performance. How can improved prediction accuracy benefit real-world applications?"],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.8 Q1","Imagine you are a computer detective investigating a case of slow program execution. The culprit is inefficient use of registers in the processor! You have identified a segment of instructions that seem to be creating a problem:\n\nmul r1, r2, r3\nsub r1, r1, 4\nadd r4, r1, r5\n\n• Identify the data dependency between these instructions. What type of dependency is it (RAW, WAR, or WAW)?\n\n• Explain why this dependency might create a bottleneck in program execution."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.8 Q2","How could register renaming be used to eliminate the dependency you identified? Show how the instructions might be rewritten with temporary registers assigned by the renaming process."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.8 Q3","Explain how register renaming, by eliminating dependencies, helps improve overall program execution speed. Hint: Think about how it allows for more efficient instruction scheduling."],
  ["chapter-2","2.2 Instruction-Level Parallelism (ILP)","Exercise 2.8 Q4","Modern processors employ various techniques to optimise performance. Research another technique (e.g., pipelining or out-of-order execution) and explain how it works alongside register renaming for a performance boost."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Scenario 2.3 Q1","Imagine you are the party planner in charge. How would you assign different tasks as separate threads to get things done faster?"],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Scenario 2.3 Q2","What potential challenges could arise when using multithreading in party planning? How could you mitigate these challenges?"],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.9 Q1","Imagine a multithreaded program downloading a large file (Thread A) and performing a complex mathematical calculation (Thread B) concurrently. How might data dependencies between these threads impact their execution? Explain your answer."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.9 Q2","Imagine you have a program that involves a large number of independent tasks. Discuss the potential advantages and disadvantages of using SMT versus a multi-core processor with separate processes for each task."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.9 Q3","Modern operating systems employ scheduling algorithms to manage threads and processes. Research different scheduling algorithms used for multithreading and explain how they impact performance and resource utilisation."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.9 Q4","Imagine a single CPU core with SMT that supports two logical cores. The program has two threads:\n\n# Thread 1 (Print Numbers)\ndef print_numbers():\n for i in range(1, 6):\n print(i)\n\n# Thread 2 (Calculate Factorial)\ndef calculate_factorial(n):\n result = 1\n for i in range(1, n + 1):\n result *= i\n print(f\"Factorial of {n} is: {result}\")\n\n# Main Program\nstart_thread(print_numbers)\nstart_thread(calculate_factorial, 5)\nwait_for_threads()\n\n• Explain the expected output of the program. In what order will the numbers be printed (from Thread 1) and the factorial result (from Thread 2) be displayed?\n\n• Imagine running this program with a single thread instead of two. How might the output and execution order differ?\n\n• Considering the scenario above, explain how multithreading can potentially improve the responsiveness of the program, especially for a user interacting with it.\n\n• While this program demonstrates multithreading, can SMT further improve its performance within a single core? Explain your reasoning."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.10 Q1","Analyse the following applications and explain how SIMD instructions can be beneficial in each scenario:\n\n• Image processing (applying a filter to a high-resolution image)\n\n• Audio processing (encoding/decoding an audio file)\n\n• Scientific computing (performing vectorised calculations on large datasets)"],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.10 Q2","Imagine you are working on a program that analyses website traffic data from millions of users. How can data partitioning be advantageous in this scenario? Consider factors such as improved performance, scalability, and efficient resource utilisation."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.10 Q3","Discuss two common data partitioning strategies, domain decomposition and spatial decomposition, and provide a real-world application example for each."],
];

export const CS_F5_QUESTIONS_PART2: Array<[string, string, string, string]> = [
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.10 Q4","Research and identify two emerging challenges or limitations associated with thread-level parallelism (TLP) in modern processor architectures."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.10 Q5","Briefly discuss potential solutions or mitigation strategies that computer architects might consider to address emerging TLP challenges."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.10 Q6","Imagine a program that downloads a large file (Thread A) and performs a complex mathematical calculation (Thread B) concurrently. Analyse two scenarios:\n\n• Scenario 1: No data dependencies exist between Thread A and Thread B.\n\n• Scenario 2: Thread B relies on the completion of Thread A to access specific downloaded data for the calculation."],
  ["chapter-2","2.3 Thread-Level and Data-Level Parallelism (TLP & DLP)","Exercise 2.10 Q7","Explain how the presence or absence of data dependencies would impact the execution flow and potential performance benefits of multithreading in these scenarios."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q1","For the following code snippet, trace the execution steps (such as fetch, decode, execute, memory access, write back) in both a non-pipelined and a pipelined processor (assuming no hazards). Compare the number of clock cycles it takes to complete the instructions in both scenarios. Explain the speedup achieved through pipelining:\n\nlw $t0, 4($s3) # Load value from memory to $t0\nsub $t1, $t0, $s4 # Subtract $s4 from loaded value to $t1"],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q2","Research the concept of forwarding in pipelined processors. Briefly explain how forwarding can be used to address data hazards and potentially improve performance compared to stalling."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q3","Imagine you are a computer architect. How might future processor designs enhance ILP techniques?"],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q4","Research and compare two different architectures (such as VLIW and Superscalar) that exploit ILP. Summarise their key differences and advantages in a short presentation."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q5","Imagine you are a compiler developer working on optimising a code segment for a modern processor. The code involves multiple loops and calculations. How would you approach this task, considering the concepts of loop unrolling, instruction scheduling, and data dependence analysis? Briefly outline your strategy."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q6","Investigate the impact of cache size and memory access patterns on the effectiveness of loop unrolling."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q7","Research real-world compiler optimisation techniques related to data dependence analysis (beyond the basic example provided). Explain, in your own words, how data dependence analysis helps compilers exploit ILP effectively."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q8","Discuss two potential benefits and two trade-offs associated with using superscalar processors compared to scalar processors."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q9","Imagine you are a computer architect tasked with designing the next generation of processors. How could you leverage the concepts of superscalar execution and ILP beyond simply increasing the number of execution units? Briefly describe your innovative approach."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q10","Assume the initial BHT prediction is \"Strongly taken\" (11). Analyse the differences in prediction behavior compared to an initial prediction of \"Strongly not taken\" scenario."],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q11","A single CPU core with SMT technology is processing two threads. Thread 1 is performing image editing, which requires frequent memory access. Thread 2 is performing text processing, which is CPU-bound. How might SMT benefit from this scenario?"],
  ["chapter-2","2.4 Chapter 2 Revision & Projects","Revision Exercise 2 Q12","Think about an application you use daily (e.g., web browser, video editor). How might multithreading or SMT contribute to its responsiveness and overall user experience? Explain your reasoning."],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Scenario 3.1 Q1","Imagine you want to send a letter to a friend in another region. The entire process involves several steps, each with specific tasks to ensure the letter reaches its destination safely and correctly.\n\n \n\nWhen you write the letter and choose the language and format, how does this reflect communication models?"],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Scenario 3.1 Q2","Imagine you want to send a letter to a friend in another region. The entire process involves several steps, each with specific tasks to ensure the letter reaches its destination safely and correctly.\n\n \n\nBriefly explain, what do you do before you send the letter to your friends?"],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Scenario 3.1 Q3","Imagine you want to send a letter to a friend in another region. The entire process involves several steps, each with specific tasks to ensure the letter reaches its destination safely and correctly.\n\n \n\nDescribe the mechanism you undertake in preparing and sending a letter to a friend, basing on the above scenario."],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.1 Q1","Give examples of different protocols that devices use on a network."],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.1 Q2","Besides ensuring smooth data exchange, what other advantages do reference models offer in network communication?"],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.1 Q3","How do reference models change and incorporate new technologies and network protocols?"],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.1 Q4","Provide additional real-world examples where a standardized approach is essential for ensuring communication or compatibility between different systems."],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.2 Q1","What happens when application data moves from one layer to another in the OSI model as far as the OSI model is concerned?"],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.2 Q2","Evaluate what is added to the user data when it passes from one layer to another in the OSI model. Give the resulting name for user data at each layer."],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.2 Q3","The OSI model has been around for decades. Despite its enduring value, can you envision any limitations of the model in the context of future network technologies? If so, propose potential adaptations or alternative models that might be necessary."],
  ["chapter-3","3.1 Network Communication & OSI/TCP-IP Models","Exercise 3.2 Q4","Differentiate between physical communications and virtual communications between OSI layers during data transfer."],
  ["chapter-3","3.2 Physical and Data Link Layers","Exercise 3.3 Q1","Discuss the factors affecting signal strength at the physical layer."],
  ["chapter-3","3.2 Physical and Data Link Layers","Exercise 3.3 Q2","What are the main devices used at the physical layer?"],
  ["chapter-3","3.2 Physical and Data Link Layers","Exercise 3.3 Q3","Discuss how the physical layer's design and implementation influence the efficiency and reliability of a network."],
  ["chapter-3","3.2 Physical and Data Link Layers","Exercise 3.4 Q1","How does the Data Link layer handle errors that occur during data transmission, and what are the advantages and disadvantages of these error detection and correction methods?"],
  ["chapter-3","3.2 Physical and Data Link Layers","Exercise 3.4 Q2","Evaluate the impact of different Data Link layer protocols on network performance. How do protocols like Ethernet and Wi-Fi manage access to the shared communication medium, and which is more efficient in various scenarios?"],
  ["chapter-3","3.2 Physical and Data Link Layers","Exercise 3.4 Q3","Explain why it is necessary for an organisation to use VLANs."],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.5 Q1","The Internet has revolutionised communication and collaboration on a global scale. Explain how a deep understanding of the network layer empowers individuals and businesses to leverage the power of the Internet effectively."],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.5 Q2","Explain the concept of routing protocols and how they help routers choose the best paths for data to travel. How does this choice of routing algorithm affect the performance and fault tolerance of different network topologies (e.g., mesh, star, ring)? Provide a detailed analysis with examples."],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.5 Q3","Imagine you are a network administrator troubleshooting a slow network connection. How would understanding the network layer's functionalities, particularly routing, help you diagnose the issue?"],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.5 Q4","How does Quality of Service (QoS) impact network performance and user experience in modern digital environments?"],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.5 Q5","What are the key components and implementation methods of Quality of Service (QoS) mechanisms, and how do they contribute to optimising network traffic?"],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.6 Q1","• How would you determine the class for a given IP address in dotted decimal notation?\n\n• Identify the class for the following IP addresses in dotted decimal notation:\n\n• 100.31.21.11 \n\n• 165.10.11.1 \n\n• 242.12.13.14 \n\n• 200.200.200.200 \n\n• 230.13.56.100"],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.6 Q2","How would you determine the class for a given IP address in binary notation? Identify the class for the following IP addresses in binary notation:\n\n• 11110001 11111000 10110011 00011001 \n\n• 01110000 11000111 00111110 00011001 \n\n• 11000111 00111110 00000000 10111110 \n\n• 10110011 00000000 10111110 00110011 \n\n• 01000111 00110110 10110011 00011111"],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.6 Q3","• How would you determine Network ID and Host ID parts for a given IP address?\n\n• Identify Network ID and Host ID parts for the following IP addresses:\n\n• 112.45.231.11 \n\n• 201.198.168.2 \n\n• 165.19.20.6"],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.6 Q4","Calculate the number of Network IDs and Host IDs for each IP address class. Then, pick one network ID from each class and list all possible IP addresses that can be assigned within that network."],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.7 Q1","Tanzania Institute of Education has been allocated the network address 211.77.20.0 and needs to create 6 subnets. The largest subnet must accommodate up to 25 hosts, and future subnet sizes should not exceed 30 hosts. Identify the valid subnets and the host IP addresses within each subnet."],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.7 Q2","A school is granted site address (IP address) 11.0.0.0/24 for its use. Design the subnets for the school considering the following number of hosts:\n\n• Subnet A with 50 hosts\n\n• Subnet B with 25 hosts\n\n• Subnet C with 10 hosts, and\n\n• Subnet D with 5 hosts"],
  ["chapter-3","3.3 Network Layer, IP Addressing, and Subnetting","Exercise 3.7 Q3","NECTA head office is granted the site address 135.65.20.31 by the regional ISP (Internet Service Provider) for its use:\n\n• Create 16 subnets for NECTA\n\n• Calculate the number of hosts per subnet\n\n• Determine the subnet ranges"],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.8 Q1","Imagine you are designing a video-conferencing application. Would you choose TCP or UDP for data transmission? Justify your answer considering the characteristics of each protocol and the requirements of a video conference."],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.8 Q2","Imagine you are developing a reliable file transfer application. Discuss how understanding error detection mechanisms in the Transport layer can be used to improve data integrity during file transfers."],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.8 Q3","Explain the concept of flow control in the Transport layer. How does it prevent data from overwhelming the receiver?"],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.8 Q4","Imagine you are downloading a large file from the internet. How might flow control mechanisms implemented in the Transport layer affect the download speed you experience?"],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.9 Q1","Use a network analysis tool such as Wireshark to capture traffic from a web browsing session or simulate by using Packet Tracer. Identify and describe the key components of an HTTP request and response. How do these components differ when browsing a secure HTTPS site?"],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.9 Q2","Use any network analyser (such as Wireshark) to set up an FTP server and client on your local network or simulate by using Packet Tracer. Transfer a file using FTP and then using SFTP. Compare the transfer process and the security measures in place. What differences do you observe?"],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.9 Q3","Configure an email client with SMTP, IMAP, and POP3 settings for a given email service. Send an email and verify its receipt using IMAP and POP3. What are the key differences in how emails are handled by IMAP versus POP3?"],
  ["chapter-3","3.4 Transport and Upper OSI Layers","Exercise 3.9 Q4","How can you explore a Session layer and Presentation layer using network simulation software (such as GNS3 or Packet Tracer)? Explain their role in the OSI model, primary functions, and real-world examples."],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.10 Q1","How do the principles of confidentiality, integrity, and availability (CIA triad) guide the development and implementation of network security policies within an organisation?"],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.10 Q2","Using examples, explain how preventive, detective, and corrective controls function within a network security model to protect against potential threats."],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.10 Q3","What are the distinguishing characteristics of malware, phishing, and denial-of-service attacks, and how do these threats specifically exploit network vulnerabilities?"],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.10 Q4","How can misconfigured network devices and weak authentication mechanisms contribute to security breaches, and what steps can be taken to mitigate these vulnerabilities?"],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.11 Q1","Explain the fundamental differences between PSTN and mobile telephone systems in terms of infrastructure and technology."],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.11 Q2","Describe the process of a call setup and teardown in a PSTN. What are the roles of the central office and the local loop in this process?"],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.11 Q3","How does handover work in a mobile telephone system? Describe the different types of handovers and the scenarios in which they occur."],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.11 Q4","What are the key differences between the various generations of mobile networks (1G, 2G, 3G, 4G, and 5G)? Focus on their technological advancements and capabilities."],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.11 Q5","Discuss the security challenges associated with PSTN and mobile telephone systems. What protocols or measures are commonly used to address these challenges?"],
  ["chapter-3","3.5 Network Security and Telecommunications (PSTN & Mobile)","Exercise 3.11 Q6","Describe the role of the Mobile Switching Center (MSC) in a mobile telephone system. How does it interact with other components like the Base Station Controller (BSC) and the Base Transceiver Station (BTS)?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q1","Imagine you are troubleshooting a network connectivity issue. How can your knowledge of the OSI and TCP/IP models assist you in identifying the problematic layer?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q2","New technologies are continually emerging. How do you envision the OSI and TCP/IP models needing to evolve to incorporate future network functionalities?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q3","Research a particular network technology, such as VPNs or wireless networking, and elaborate how it operates within the framework of the OSI or TCP/IP model."],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q4","How does VLAN segmentation contribute to network efficiency and security, and what are the key considerations when implementing VLANs in a large-scale enterprise network?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q5","What role does ARP (Address Resolution Protocol) play in modern networking, and how does it facilitate communication between devices within the same subnet?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q6","Explain the significance of HTTP (Hypertext Transfer Protocol) in the context of web communication, and how its features contribute to the browsing experience for end-users."],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q7","What are the primary differences between FTP (File Transfer Protocol) and HTTP in terms of their functionalities, security features, and suitability for various file transfer scenarios?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q8","Given a network with the IP address 192.168.1.0/24 , how many subnets can be created using a subnet mask of 255.255.255.192 , and what are the valid IP ranges for each subnet?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q9","In a network with the IP address range 172.16.0.0/16 , how many host addresses are available per subnet if subnetting with a mask of 255.255.255.240 ?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q10","If a company requires four subnets, each accommodating at least 30 hosts, what is the minimum subnet mask that can be used, and what are the network addresses and valid host ranges for each subnet?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q11","In a network with the IP address 10.10.0.0/22 , how many bits are used for subnetting, and how many subnets and hosts are available in this configuration?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q12","Given the requirement to create six subnets from the network 192.168.10.0/24 , determine the appropriate subnet mask and calculate the valid IP ranges for each subnet."],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q13","Cybersecurity threats are a growing concern. How does understanding the OSI and TCP/IP models aid in identifying potential vulnerabilities and implementing security measures at different network layers?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q14","Explain the concept of social engineering and how attackers exploit human psychology to gain access to sensitive information or systems. How can organisations raise awareness and mitigate social engineering risks?"],
  ["chapter-3","3.6 Chapter 3 Revision & Projects","Revision Exercise 3 Q15","How can vulnerability scanning and patching help identify and address potential security weaknesses?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Scenario 4.1 Q1","Your school library wants to efficiently organise and manage its collection of books to improve book service delivery at your school. The librarian aims to create a system that can keep track of books, handle checkouts, and provide information to students and staff.\n\n \n\nWhat kind of information should the system collect and from which type of system users?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Scenario 4.1 Q2","Your school library wants to efficiently organise and manage its collection of books to improve book service delivery at your school. The librarian aims to create a system that can keep track of books, handle checkouts, and provide information to students and staff.\n\n \n\nDo you think, in this scenario, the OOP can be applied in real-world situations? Briefly explain how."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.2 Q1","How does the concept of encapsulation help in maintaining data integrity and promoting information hiding?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.2 Q2","Explain how encapsulation is achieved in the Book class of the library management system scenario."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.2 Q3","How do getters and setters contribute to encapsulation in OOP, and what is their role in accessing and modifying object state?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.2 Q4","In the Car class example, how are encapsulation principles applied to control access to the car's attributes and methods?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.2 Q5","Can you describe a real-world scenario where encapsulation would be beneficial, based on the examples provided in the code?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.3 Q1","Analyse the statement that, \"Inheritance is the process by which objects of one class acquire the properties of objects of another class.\""],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.3 Q2","How does multilevel inheritance differ from single inheritance? Explain the potential benefits and drawbacks of using multilevel inheritance in an OOP application."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.3 Q3","Provide a simple, real-world example of multilevel inheritance involving a base class, a derived class, and a further derived class, and explain how methods and attributes are inherited and extended at each level."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q1","Give an example of how polymorphism can improve code reusability and maintainability."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q2","Imagine a class named \"Animal\" with a method \"makeSound()\". In Object-Oriented Programming (OOP), how might polymorphism be used with this scenario?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q3","Imagine you are designing a simple video game. How would you use classes and objects to represent different elements of the game, such as characters, items, and environments? How might inheritance and polymorphism come into play in this scenario?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q4","Consider a superclass \"Shape\" with a method \"getArea()\". Subclasses like \"Square\" and \"Circle\" inherit this method. Which type of polymorphism is at play when the appropriate \"getArea()\" method is chosen based on the object's class at runtime?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q5","You have a function greetAnimal(animal) in your code. This function can accept objects of various animal classes (Dog, Cat, etc.). How might polymorphism be beneficial in this scenario?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q6","Imagine a class hierarchy for vehicles (Car, Truck, Bike). How could polymorphism be used to create a function moveAllVehicles(vehicles) that works with all vehicle types?"],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q7","Polymorphism is often associated with inheritance. Can polymorphism exist without inheritance? Explain your answer."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.4 Q8","In the real world, provide an example of something that exhibits a similar concept to polymorphism."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.5 Q1","Imagine a class called \"BankAccount\". Suggest the attributes that are expected for this class."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.5 Q2","Describe how a principle of OOP would assist you in restricting direct access to the balance in your BankAccount so that someone may not change your account balance."],
  ["chapter-4","4.1 Concepts of Object-Oriented Programming","Exercise 4.5 Q3","Recommend the methods to be used in the class \"BankAccount\" in order to control how the balance is accessed and modified, potentially adding security checks or validations."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.6 Q1","Study the following C++ program:\n\ninclude<iostream>;\nusing namespace std;\nint main\n{\n cout<<Read and enjoy C++ programming<<endl;\n return 0;\n}\n\n• Identify all errors in the program.\n\n• Correct errors before running the program.\n\n• Run the program and display the results."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.6 Q2","Describe five (5) characteristics of a good program."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.6 Q3","Will the following lines of code in (a) and (b) print the same thing? Explain why or why not:\n\n• cout << 5 << '\\n'; \n\n• cout << \"5\" << '\\n';"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.6 Q4","Will the following lines of code print the same thing? Explain why or why not:\n\n• cout << y << '\\n'; \n\n• cout << \"y\" << '\\n';"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Activity 4.2 Q1","#include<iostream>\n#include<iomanip>\nusing namespace std;\nvoid printMonth(int year, int month);\nvoid printMonthTitle(int year, int month);\nvoid printMonthName(int month);\nvoid printMonthBody(int year, int month);\nint getStartDay(int year, int month);\nint getTotalNumberOfDays(int year, int month);\nint getNumberOfDaysInMonth(int year, int month);\nbool isLeapYear(int year);\n\nint main()\n{\n int year, month;\n cout<<\"Enter full year: \";\n cin>>year;\n cout<<\"Enter month in number between 1 and 12:\";\n cin>>month;\n cout<<endl;\n printMonth(year, month);\n cout<<endl;\n cout<<endl;\n return 0;\n}\n\nIdentify all data types applied in the program."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Activity 4.2 Q2","#include<iostream>\n#include<iomanip>\nusing namespace std;\nvoid printMonth(int year, int month);\nvoid printMonthTitle(int year, int month);\nvoid printMonthName(int month);\nvoid printMonthBody(int year, int month);\nint getStartDay(int year, int month);\nint getTotalNumberOfDays(int year, int month);\nint getNumberOfDaysInMonth(int year, int month);\nbool isLeapYear(int year);\n\nint main()\n{\n int year, month;\n cout<<\"Enter full year: \";\n cin>>year;\n cout<<\"Enter month in number between 1 and 12:\";\n cin>>month;\n cout<<endl;\n printMonth(year, month);\n cout<<endl;\n cout<<endl;\n return 0;\n}\n\nWrite the role of each data type you have identified in (1)."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Activity 4.2 Q3","#include<iostream>\n#include<iomanip>\nusing namespace std;\nvoid printMonth(int year, int month);\nvoid printMonthTitle(int year, int month);\nvoid printMonthName(int month);\nvoid printMonthBody(int year, int month);\nint getStartDay(int year, int month);\nint getTotalNumberOfDays(int year, int month);\nint getNumberOfDaysInMonth(int year, int month);\nbool isLeapYear(int year);\n\nint main()\n{\n int year, month;\n cout<<\"Enter full year: \";\n cin>>year;\n cout<<\"Enter month in number between 1 and 12:\";\n cin>>month;\n cout<<endl;\n printMonth(year, month);\n cout<<endl;\n cout<<endl;\n return 0;\n}\n\nIdentify errors obtained after compiling the program."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Activity 4.2 Q4","#include<iostream>\n#include<iomanip>\nusing namespace std;\nvoid printMonth(int year, int month);\nvoid printMonthTitle(int year, int month);\nvoid printMonthName(int month);\nvoid printMonthBody(int year, int month);\nint getStartDay(int year, int month);\nint getTotalNumberOfDays(int year, int month);\nint getNumberOfDaysInMonth(int year, int month);\nbool isLeapYear(int year);\n\nint main()\n{\n int year, month;\n cout<<\"Enter full year: \";\n cin>>year;\n cout<<\"Enter month in number between 1 and 12:\";\n cin>>month;\n cout<<endl;\n printMonth(year, month);\n cout<<endl;\n cout<<endl;\n return 0;\n}\n\nState the errors obtained after compiling the program."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.7 Q1","What is wrong with the following program?\n\n#include <iostream.h>\nusing namespace std;\nint main()\n{\n int y = 0;\n cout << \"y\" << endl;\n return 0;\n}"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.7 Q2","Compile and run the following program; thereafter, explain the output:\n\n#include <iostream>\nusing namespace std;\nint main()\n{\n cout << \"Size of char: \" << sizeof(char) << \" byte\" << endl;\n cout << \"Size of integer: \" << sizeof(int) << \" bytes\" << endl;\n cout << \"Size of float: \" << sizeof(float) << \" bytes\" << endl;\n cout << \"Size of double: \" << sizeof(double) << \" bytes\" << endl;\n return 0;\n}"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.7 Q3","Examine the following C++ code and answer the questions that follow:\n\nstring str1;\nstring str2;\nchar ch;\ncin >> str1;\nstr2 = str1;\ncin >> ch;\nstr2[0] = ch;\ncout << str1 << \" -> \" << str2 << endl;\n\n \n\n• What is the output if the input is Akilimali J ?\n\n• What is the output if the input is Salome A ?\n\n• What is the output if the input is Abas H ?"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.7 Q4","Write a program that asks the user to enter the length of the sides of a triangle and outputs the shape of the triangle."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.7 Q5","What is the difference between the character 'n' and the character '\\n' ?"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Activity 4.3","#include<iostream>\nusing namespace std;\nint main()\n{\n char ch;\n cout<<\"Enter lower case alphabet: \";\n cin>>ch;\n ch = ch - 32;\n cout<<\"\\nThe uppercase alphabet is \"<<ch;\n cout<<endl;\n return 0;\n}\n\nCompare the two programs and explain how difficult it is to practice this program without using variable and data type."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.8 Q1","What is the advantage of data type in declaration?"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.8 Q2","What is the output of the following code fragment:\n\nint x;\nx = 'B';\ncout << x << '\\n';"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.8 Q3","Write a C++ program that reads two numbers entered by the user from the keyboard, calculates their sum, and displays the result on the screen."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.9 Q1","Write a C++ program that will enable customers to know the Value-Added Tax to be paid for any purchase price of the commodity. The VAT rate of $18.2\\%$ should be declared as a constant, and the formula should be $(\\text{VAT} = 18.2\\% \\times \\text{Purchase prices})$."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.9 Q2","Differentiate the terms variable and constant as applied in C++ programming."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.9 Q3","Create a C++ program that prompts a user to enter a radius of the sphere. The program should calculate and display the volume of the sphere as output. (Hint: The formula for calculating the volume of the sphere is $\\frac{4}{3}\\pi r^3$, where $r$ represents the radius of the sphere). Use Table 4.6 in your declaration:\n\nData name | Data type | Declaration type\nPie ($\\pi$) = 3.1415926 | Double | Constant\nRadius | Float | Variable\nVolume | Double | Variable"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.9 Q4","• What are the benefits of using constants in a C++ program?\n\n• What is wrong with the following C++ program? Explain.\n\n#include<iostream>\nusing namespace std;\nint main()\n{\n PI = 3.142;\n double temp = PI * 5;\n cout<<temp<<endl;\n return 0;\n}"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.9 Q5","Consider the following program:\n\n#include <iostream.h>\nusing namespace std;\nint main()\n{\n int a;\n int b;\n a = 2;\n b = 5;\n a = b;\n b = 4;\n cout << \"a = \" << a << endl;\n cout << \"b = \" << b << endl;\n return 0;\n}\n\n• What is the output of this program?\n\n• Using a diagram, illustrate how memory changes during variable assignment."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.10 Q1","Write a C++ program that can enable a user to convert Fahrenheit to Centigrade degree. Use the formula, $\\text{Centigrade} = \\frac{5}{9}(\\text{Fahrenheit} - 32)$."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.10 Q2","Write the following program on a C++ text editor; then, display the output:\n\n#include<iostream>\nusing namespace std;\nint main()\n{\n cout<<\"2%3 = \"<<2%3;\n return 0;\n}"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.10 Q3","Write a C++ program that enables the user to calculate the gradient (slope) of the straight line. A program will prompt the user to enter two points $(x_1, y_1)$ and $(x_2, y_2)$. Then, a program will find and display a slope. Use the formula:\n $$\\text{Slope} = \\frac{y_2 - y_1}{x_2 - x_1}$$"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.10 Q4","What are the functions of \"cout\" and \"cin\" in writing a C++ program?"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.10 Q5","Using output stream \"cout\" write a C++ program that displays the following table as shown in Figure 4.36:\n\nVARIABLE | DATATYPE\nName | char\nDecimals | double"],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.10 Q6","Construct a C++ program that takes a character as an input from the keyboard and converts it into a capital letter or small letter depending on its form. A program should check the validity of the entered character and display a message \"The entered character is not an alphabetical letter\" if the input is not a letter."],
  ["chapter-4","4.2 Fundamentals of C++ Programming","Exercise 4.10 Q7","Give the output of the given program:\n\n#include <iostream>\nusing namespace std;\nint main()\n{\n cout << \"1 + 5 = \" << 1 + 5 << endl;\n cout << \"13 + 89 = \" << 13 + 89 << endl;\n cout << \"30 - 20 = \" << 30 - 20 << endl;\n cout << \"46 - 90 = \" << 46 - 90 << endl;\n cout << \"2 * 7 = \" << 2 * 7 << endl;\n cout << \"5 / 2 = \" << 5 / 2 << endl;\n cout << \"21 / 7 = \" << 21 / 7 << endl;\n cout << \"35 % 6 = \" << 35 % 6 << endl;\n cout << \"4 % 6 = \" << 4 % 6 << endl;\n return 0;\n}"],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.11 Q1","Identify errors made in the following program:\n\nif (marks >= 60)\n Grade = 'D';\nelse if (marks >= 70)\n Grade = 'C';\nelse if (marks >= 80)\n Grade = 'B';\nelse if (marks >= 90)\n Grade = 'A';\nelse\n Grade = 'F';"],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.11 Q2","Use if statement to create a C++ program that allows the user to enter five numbers. Then, the program arranges the numbers from the smallest to the largest number."],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.11 Q3","Write a program that prompts the user to enter a month and year. The program should display the number of days of that month as output."],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.11 Q4","Study the following C++ program that prints one line of text, then answer the questions that follow:\n\n#include <iostream>\nusing namespace std;\nint main()\n{\n int input;\n cin >> input;\n if (input < 11) {\n if (input != 6)\n cout << \"wow \";\n else\n input++;\n }\n else {\n if (input == 18)\n input += 11;\n else\n cout << \"Oyaaa!\";\n }\n cout << input << '\\n';\n}\n\n What will the program print if the user enters the following numbers as inputs? (a) 4 , (b) 20 , (c) 6 , (d) 18 , (e) -6"],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.11 Q5","Write a C++ program that requests six integer values from the user. The program should give the message to the user as follows: if any of the values entered are duplicates, the message output should read \"DUPLICATE VALUES\"; otherwise, it prints \"ALL ARE UNIQUE VALUES\"."],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.12 (Switch-Case Continuation on Page 269) Q1","Rewrite the following if statement by using the switch-case statement. Then, draw a flowchart of the given switch-case statement:\n\nif (k == 1)\n m += 5;\nelse if (k == 2)\n m += 10;\nelse if (k == 3)\n m += 16;\nelse if (k == 4)\n m += 34;"],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.12 (Switch-Case Continuation on Page 269) Q2","Consider the following code fragment:\n\nint x;\ncin >> x;\nswitch (x + 3) {\ncase 5:\n cout << x << '\\n';\n break;\ncase 10:\n cout << x - 3 << '\\n';\n break;\ncase 20:\n cout << x + 3 << '\\n';\n break;\n}\n\n Determine the output of the above program when the user enters 3 , 7 , 9 , 19 and 22 respectively."],
];

export const CS_F5_QUESTIONS_PART3: Array<[string, string, string, string]> = [
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.13 Q1","Write a C++ program that displays the Pascal triangle, as shown in Figure 4.52, when a user enters the power of expansion (e.g., for power 4: rows 1 , 1 1 , 1 2 1 , 1 3 3 1 , 1 4 6 4 1 )."],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.13 Q2","Use a for loop to write a C++ program which outputs the multiplication table (1 to 9) as shown in Figure 4.53."],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.13 Q3","Create a simple calculator using C++ programming language to solve the factorial of a number and read an exponent when the user enters the base and power of a particular exponent. A calculator should allow the user to choose either to solve factorial or exponent of the number using a switch case statement."],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.13 Q4","Write a C++ program to display even numbers, odd numbers, or prime numbers which lie within a range entered by the user."],
  ["chapter-4","4.3 Control Structures in C++","Exercise 4.13 Q5","What is printed by the following code fragment?\n\nint x = 0;\ndo {\n cout << x << \" \";\n x++;\n} while (x < 10);\ncout << '\\n';"],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.14 Q1","• What is the difference between passing parameters by value and by reference?\n\n• Write a C++ program to demonstrate how parameters are passed by value and by reference."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.14 Q2","• Differentiate between a function prototype and function header.\n\n• Write a C++ program to show the application of the function prototype."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.14 Q3","Create a C++ program that will prompt a user to enter the range of the number and choose to display either an even, odd or a prime number. Then, the program will display selected types of number according to the range the user enters. (Example: Enter a range of the number: 5; Enter a type of the number: prime; Output: 2, 3, 5, 7, 11. Note: Use \"isPrime\" function to display prime numbers)."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.14 Q4","Write a C++ program that can help WAMO bank to calculate the total amount of money ($A$) gained by the customer after \"$n$\" number of years. Given, the interest rate \"$R$\" provided by the bank is $12\\%$. The program will prompt the user to enter the amount of money ($P$) invested by the customer and then display the result on the computer screen. Hint: Use the formula, $A = P(1 + R)^n$. Use function pow(a, b) for $a^b$."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.15 Q1","Write a C++ program using an array that allows a teacher to enter the number of students and their marks. Then, the program should find the average class marks and use a \"function\" to state a grade class mark. Apply Table 4.18 to display the grade class marks of students:\n\nAVERAGE CLASS MARK | GRADE\n81 - 100 | A\n61 - 80 | B\n41 - 60 | C\n21 - 40 | D\n0 - 20 | F"],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.15 Q2","Use a multi-dimensional array to create a C++ program that asks for elements of a matrix. Then, the program should display the matrix and its transpose as represented in Figure 4.65."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.15 Q3","Consider the declaration: int majumuisho[10][20]; . Write the C++ program that prints all the elements in majumuisho . All elements in the same row should appear on the same line, and each successive row should appear on its own line."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.15 Q4","Consider the declaration int mayai[50][100][100][25]; . How many elements does mayai hold?"],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.16 Q1","Differentiate between string and array."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.16 Q2","Why do we use the null character '\\0' in string initialisation?"],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.16 Q3","Write a program that displays the statement \"C++ programming language\"."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.16 Q4","Can we declare an array to hold the mixture of both doubles and ints? Explain."],
  ["chapter-4","4.4 Functions, Arrays, and Strings in C++","Exercise 4.16 Q5","Explain what will happen if you attempt to access an element of an array using a negative index."],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.17 Q1","Create a Book class that has attributes called author , title , and ISBN . Show methods that will display book details."],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.17 Q2","Create a Car class with attributes called make , model , year , and speed . Include methods such as accelerate and brake ."],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.17 Q3","Judge the following codes:\n\nclass Animal {\n int y;\n};\nint main()\n{\n Animal h;\n cout << h.y;\n return 0;\n}"],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.18 Q1","Create a C++ program that simulates a bank account system. Define a base class BankAccount with private attributes like accountNumber , balance , and ownerName . Provide public methods to deposit and withdraw money, and to display account details. Then, derive a class SavingsAccount that adds an attribute for interest rate and a method to apply interest. Explain how abstraction helps in managing the complexity of the system."],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.18 Q2","Design a C++ program for a library management system. Create a base class LibraryItem with attributes like title , author , and ISBN . Include methods to get the details of the item. Then, derive classes Book and Magazine from LibraryItem , adding specific attributes and methods for each. How does abstraction make the system more manageable and user-friendly?"],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.18 Q3","In a banking system, how would you use inheritance to model different types of accounts such as SavingsAccount , CheckingAccount , and LoanAccount , all inheriting from a base class BankAccount ? Discuss how you would structure the classes to maximize code reusability and minimize redundancy."],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.18 Q4","Consider a class representing a bank account. How would you use encapsulation to ensure that the account balance can only be modified through specified methods, such as deposit() and withdraw() , while preventing direct access to the balance variable from outside the class?"],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.18 Q5","How would you use polymorphism to implement a system for processing different types of shapes, such as circles, rectangles, and triangles, where each shape has a calculateArea() method? Discuss how you would design the classes and utilize polymorphism to calculate the area of each shape without explicitly checking the type of the object."],
  ["chapter-4","4.5 Object-Oriented Programming in C++","Exercise 4.18 Q6","This code demonstrates how inheritance, encapsulation, polymorphism, and abstraction can be used together to create flexible and reusable code in C++. Study the code carefully and extract blocks of code that represent inheritance, encapsulation, polymorphism, and abstraction. Evaluate each block of code in each pillar:\n\n#include <iostream>\nusing namespace std;\n// Base class\nclass Shape {\npublic:\n virtual void draw() {\n cout << \"Drawing a shape\" << endl;\n }\n};\n// Derived class Circle\nclass Circle : public Shape {\npublic:\n void draw() override {\n cout << \"Drawing a circle\" << endl;\n }\n};\n// Derived class Rectangle\nclass Rectangle : public Shape {\npublic:\n void draw() override {\n cout << \"Drawing a rectangle\" << endl;\n }\n};\nvoid drawShape(Shape* shape) {\n shape->draw();\n}\nint main() {\n Circle circle;\n Rectangle rectangle;\n drawShape(&circle);\n drawShape(&rectangle);\n return 0;\n}"],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q1","Read the following C++ program and answer the questions that follow:\n\n#include<iostream>\nusing namespace std;\nint main()\n{\n int num, temp, sum = 0;\n cout<<\"Enter a positive integer: \";\n cin>>num;\n temp = num;\n do\n {\n sum = sum + num % 10;\n num = num / 10;\n }\n while(num > 0);\n cout<<\"sum is: \"<<sum<<endl;\n system(\"PAUSE\");\n return 0;\n}\n\n• What are the functions of the line #include<iostream> and system(\"PAUSE\"); ?\n\n• Write an error made from this program (if any)."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q2","Why do we need to state data type when declaring variables in a C++ program?"],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q3","How will you guarantee and ensure that a variable's value can never be changed after its initialisation?"],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q4","If $a = 7$, $y = 4$, $z = 3$, and $u = 2$, evaluate each of the following statements, if possible. If it is not possible, state the reason:\n\n• (a + z) % y \n\n• (a + y) % u \n\n• (y + u) % a \n\n• (a + y) * u \n\n• (a % y) % z \n\n• (y % z) % u \n\n• (a * z) % y \n\n• ((a * y) * u) * z"],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q5","Evaluate the following expressions:\n\n• 15 / 3 \n\n• 17 - 12 / 4 * 2 \n\n• 34 % 7 \n\n• 3 - 7 % 7 \n\n• 18.0 / 4 \n\n• 20 - 5 / 2.0 \n\n• 13 + 5 % 2 - 3 \n\n• 15.0 + 3.0 * 2.0 / 5.0"],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q6","Write the syntax of the following C++ statements:\n\n• Switch case statement\n\n• Variable declaration and initialisation."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q7","Suppose you are developing a game where there are various types of vehicles, such as cars, trucks, and motorcycles. How would you use polymorphism to implement a drive() method for each vehicle type, ensuring that the correct behavior is executed based on the specific type of vehicle object? Provide a code example demonstrating the use of polymorphism in this scenario."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q8","Write a C++ program to find all roots of a quadratic equation ($ax^2 + bx + c = 0$). The program should prompt a user to enter the coefficients and then display the roots. The program should also be able to test the type of the root displayed and state whether those roots are real distinct ($b^2 > 4ac$), real identical ($b^2 = 4ac$), or imaginary ($b^2 < 4ac$)."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q9","Use a function named \"largest\" to create a C++ program that determines the largest number from a set of 10 numbers."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q10","By using the concept of function, write a C++ program that prompts the user to input three integer values and find the greatest value of the three values."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q11","Write a C++ program that finds the reverse of a number entered by the user. When the number entered is '5261' then the reverse value should be '1625'."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q12","Given the declaration int orodha[100]; :\n\n• What expression represents the very first element of orodha ?\n\n• What expression represents the very last element of orodha ?\n\n• Write the code fragment that prints out the contents of orodha .\n\n• Is the expression orodha[3.0] legal or illegal?"],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q13","The NMB ATM allows a customer to withdraw a maximum of Tshs 1,000,000/= per day. If a customer withdraws more than Tshs 335,000/=, the service charge is $6\\%$ of the amount over Tshs 335,000/=. If the customer does not have sufficient money in the account, the ATM informs the customer about the insufficient fund and gives the option to withdraw the money for a service charge of Tshs 1250/=. If there is no balance in the account or if the account balance is negative, the customer will not be allowed to withdraw any money from the ATM. If the amount to be withdrawn exceeds Tshs 1,000,000/=, the ATM informs the customer about the maximum amount that can be withdrawn. Write an algorithm that allows the customer to enter the amount to be withdrawn. The algorithm should check the total amount in the account, dispense the money to the customer, and debit the customer account by the amount withdrawn and the service charges, if any."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q14","Explain the concept of polymorphism and its different types, such as compile-time polymorphism (function overloading) and runtime polymorphism (virtual functions), in C++. Provide examples illustrating each type of polymorphism and discuss their advantages and use cases."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q15","Write a C++ program to implement a class called Shape with virtual member functions for calculating area and perimeter. Derive classes such as Circle , Rectangle , and Triangle from the Shape class and override virtual functions accordingly."],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q16","Write a C++ program to display the following patterns (Figure 4.75a and 4.75b):\n\nPattern (a):Inverted Star Triangle Pattern (b): Number Triangle\n* * * * * * * * * 1\n * * * * * * * 2 2\n * * * * * 3 3 3\n * * * 4 4 4 4\n * 5 5 5 5 5"],
  ["chapter-4","4.6 Chapter 4 Revision & Projects","Revision Exercise 4 Q17","Create a calendar using the C++ programming language. A program will prompt a user to enter a year followed by a month in a number. Then, the calendar will be displayed as shown in Figure 4.76 (using Switch case for month names, functions for translating days, if...then for days in each month, and isLeapYear() for leap years after 1800)."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Scenario 5.1 Q1","Imagine you own a coffee shop called \"Java Kinywaji\" and want to improve operations. You develop a Java-based system to manage inventory, handle orders, and provide real-time information. This system allows you to track inventory, customise orders, process payments, and display promotions. As a result, your coffee shop becomes efficient, delivering exceptional service that keeps customers coming back.\n\n \n\nHow does the Java-based system help you track inventory and improve efficiency? What features enable effective inventory management?"],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Scenario 5.1 Q2","Imagine you own a coffee shop called \"Java Kinywaji\" and want to improve operations. You develop a Java-based system to manage inventory, handle orders, and provide real-time information. This system allows you to track inventory, customise orders, process payments, and display promotions. As a result, your coffee shop becomes efficient, delivering exceptional service that keeps customers coming back.\n\n \n\nHow does the Java system enhance the customer experience at \"Java Kinywaji\"? How does it streamline ordering and provide real-time information to customers?"],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.1 Q1","Develop a class named Car with properties make , model , and year . Create three objects of this class and print their details."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.1 Q2","Implement a class Rectangle with properties length and width . Add methods to calculate the area and perimeter of the rectangle. Create an object of the class and display the area and perimeter."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.1 Q3","Write a program of a class Student with instance variables name and age , and a class variable schoolName . Create three instances of the Student class and assign different values to the instance variables but the same value to the class variable. Print the details of each student."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.1 Q4","Create a class BankAccount with instance variables accountNumber and balance . Add methods to deposit and withdraw money, and check the balance. Instantiate an object of the class and perform some transactions."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Worked Bitwise Shift Questions (Page 335) Q1","Perform the bitwise left shift operation on the integer 6. Left shift each bit by 1 ( 6 << 1 ). Write the answer in binary and decimal."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Worked Bitwise Shift Questions (Page 335) Q2","Perform the right shift by two bits operation on the integer 7 ( 7 >> 2 ) without use of a Java program."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Worked Bitwise Shift Questions (Page 335) Q3","Perform the right shift by two bits operation on integer 60 ( 60 >> 2 ) without use of a Java program."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.2 Q1","Create a class named MyFamily utilising keywords public and class ."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.2 Q2","Using the class MyFamily , create the object called OurGarden using the keyword new ."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.2 Q3","Write codes that will use the object OurGarden to access and print the value of any variable declared with integer data type in the class MyFamily ."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.3 Q1","Write a Java class Car with a constructor that initialises the brand and model attributes. Demonstrate its usage in a Main class."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.3 Q2","Create a class Book with attributes title , author , and price . Implement a parameterised constructor that initialises these attributes. Write a Main class to create and display details of multiple Book objects."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.3 Q3","Define a class Employee with attributes name and salary . Include a default constructor that initialises name to \"Unknown\" and salary to 0. Demonstrate creating an Employee object using this default constructor in a Main class."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.3 Q4","Discuss the concept of destructors in Java. Explain why Java does not have a finalize destructor method like C++ and how garbage collection handles resource cleanup."],
  ["chapter-5","5.1 Java Fundamentals, Classes, Objects, and Constructors","Exercise 5.3 Q5","Create a class DatabaseConnection that simulates opening a database connection in its constructor and closing it in a method closeConnection() . Illustrate the importance of proper resource management using constructors and methods in Java."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.4 Q1","Explain the concept of inheritance in Java and how it allows classes to inherit properties and behaviors from other classes. Provide an example of inheritance in action."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.4 Q2","Describe the difference between single inheritance and multiple inheritance in Java. How does Java handle multiple inheritance, and why is it achieved differently than in other programming languages?"],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.4 Q3","How do interfaces provide a way to achieve multiple inheritance in Java? Explain the role of interfaces in defining contracts for classes and how classes implement interfaces to fulfill those contracts."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.4 Q4","Discuss the diamond problem in the context of multiple inheritance and explain how Java's interface approach avoids this issue. Provide an example to illustrate how interfaces help resolve the diamond problem."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.4 Q5","Describe the concept of abstract classes and how they relate to inheritance and interfaces in Java. Explain when it is appropriate to use abstract classes versus interfaces in your Java programs."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.4 Q6","Discuss the importance of polymorphism in Object-Oriented Programming and how inheritance and interfaces contribute to achieving polymorphic behavior in Java. Provide examples to demonstrate polymorphism in action using inheritance and interfaces."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.5 Q1","Describe how abstraction is implemented in Java through abstract classes and interfaces. Provide examples of each."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.5 Q2","Discuss the role of abstract methods in abstract classes and interfaces. How do they contribute to achieving abstraction?"],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.5 Q3","Describe a real-world scenario where abstraction would be beneficial in Java programming. How would you implement abstraction to solve the problem?"],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.5 Q4","Explain the concept of data hiding and how it relates to abstraction in Java. Provide examples to illustrate your explanation."],
  ["chapter-5","5.2 Inheritance, Interfaces, and Abstract Classes in Java","Exercise 5.5 Q5","Design a Java program that utilizes abstraction to model a banking system. Include abstract classes or interfaces to represent different account types, such as savings and checking accounts, and demonstrate how abstraction simplifies the implementation and maintenance of the system."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.6 Q1","Explain the difference between public , private , and protected access modifiers in Java. Give examples of when each would be used."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.6 Q2","How does the this keyword work in Java? Provide examples to illustrate its usage in different contexts."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.6 Q3","Describe the purpose of the final keyword in Java. How does it affect variables, methods, and classes? Give examples to demonstrate its usage."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.6 Q4","Can you use the final keyword with local variables in Java? Explain with examples."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.6 Q5","What happens if you try to access a private member variable of a class directly from another class? How can you access it using the this keyword? Provide an example."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.7 Q1","Explain the concept of encapsulation in Java and why it is important in software development."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.7 Q2","Compare and contrast the public , private , and protected access modifiers in Java, highlighting their roles in encapsulation."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.7 Q3","How does encapsulation contribute to the security and integrity of Java code? Provide examples to illustrate your answer."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.7 Q4","Describe the steps involved in achieving encapsulation in a Java class. Include the declaration of attributes, access modifiers, and the use of getter and setter methods."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.7 Q5","Discuss the advantages of using getter and setter methods to access private attributes in Java classes. Provide real-world scenarios where encapsulation through getter and setter methods would be beneficial."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.7 Q6","Explain the potential risks of exposing class attributes as public fields without encapsulation. How does encapsulation mitigate these risks?"],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.7 Q7","Design a Java class representing a bank account with private attributes for account number, balance, and customer name. Implement getter and setter methods for accessing and modifying these attributes, ensuring encapsulation principles are followed."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q1","Define polymorphism in Java and explain how it contributes to the flexibility and extensibility of object-oriented programs."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q2","Describe the two types of polymorphism in Java: compile-time (method overloading) and runtime (method overriding). Provide examples of each."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q3","Explain the concept of method overloading in Java. How does it enable polymorphism? Provide a scenario where method overloading would be useful."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q4","Discuss the significance of method overriding in Java polymorphism. How does it allow subclasses to provide their own implementation of inherited methods?"],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q5","Describe how polymorphism is achieved through inheritance and method overriding in Java. Provide a practical example to illustrate the concept."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q6","Explain the role of dynamic method dispatch in achieving runtime polymorphism in Java. How does it enable method invocation based on the actual object type?"],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q7","Design a Java program that demonstrates both compile-time and runtime polymorphism. Include examples of method overloading and method overriding to showcase the flexibility of polymorphic behavior."],
  ["chapter-5","5.3 Encapsulation, Access Modifiers, and Polymorphism in Java","Exercise 5.8 Q8","How does the Java compiler determine which overloaded method to call during compile-time polymorphism?"],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Application Design Question (Page 382)","Assume you are the programmer. Design any system relevant to your environment that will use the four stages for building an application (Stage One: Planning the project, Stage Two: Designing classes and relationships, Stage Three: Implementing the project, Stage Four: Testing and debugging)."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q1","Create a Java class named Car with attributes such as make , model , and year . Define methods to set and retrieve these attributes. Instantiate multiple Car objects and display their details."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q2","Implement a Java program to calculate the area of different shapes (circle, rectangle, triangle) using methods for each shape. Use abstraction to hide the implementation details of the area calculation."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q3","Develop a Java application for a banking system with classes like Account , SavingsAccount , and CheckingAccount . Implement inheritance to create specialized account types and encapsulation to protect sensitive account information."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q4","Write a Java program to demonstrate method overloading by creating multiple methods with the same name but different parameter lists, such as calculating the area of a square, rectangle, and circle."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q5","Create a Java program to model a simple library system with classes like Book , Author , and Library . Use inheritance to represent relationships between different entities and encapsulation to protect book information."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q6","Implement a Java program to demonstrate polymorphism by creating a base class Shape with methods like draw() and calculateArea() . Then, create subclasses like Circle , Rectangle , and Triangle to override these methods with specific implementations."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q7","Develop a Java application to simulate a shopping cart system with classes like Product , ShoppingCart , and Customer . Use encapsulation to protect the cart's contents and inheritance to represent different types of customers."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q8","Write a Java program to perform basic arithmetic operations (addition, subtraction, multiplication, division) using methods and operators. Use variables to store operands and results."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q9","Implement a Java program to define and use constants for mathematical constants like Pi ($\\pi$) and Euler's number ($e$). Use these constants in calculations throughout the program."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q10","Create a Java application to model a school system with classes like Student , Teacher , and Course . Use constructors to initialize object states and demonstrate method overriding in subclasses."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q11","Develop a Java program to manage employee information with classes like Employee , Manager , and Intern . Use inheritance to represent different employee roles and encapsulation to protect sensitive employee data."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q12","Write a Java application to model a simple game with classes like Player , Enemy , and Weapon . Demonstrate polymorphism by allowing different types of players and enemies to interact with each other."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q13","Implement a Java program to handle exceptions in file I/O operations. Use try-catch blocks to handle potential errors like file not found or permission denied."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q14","Create a Java program to demonstrate operator precedence by performing complex arithmetic expressions involving addition, subtraction, multiplication, and division."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q15","Develop a Java application to implement a basic calculator with methods for arithmetic operations like addition, subtraction, multiplication, and division. Use method overloading to handle different parameter types and numbers of operands."],
  ["chapter-5","5.4 Chapter 5 Revision & Projects","Revision Exercise 5 Q16","Explore the following plain text of OOP codes, then answer the questions that follow:\n\npublic class Car {\n private String make;\n private String model;\n private int year;\n private boolean running;\n\n public Car(String make, String model, int year) {\n this.make = make; // Encapsulated attribute\n this.model = model; // Encapsulated attribute\n this.year = year; // Encapsulated attribute\n this.running = false; // Encapsulated attribute\n }\n public void startEngine() {\n this.running = true; // Setter method\n }\n public void stopEngine() {\n this.running = false; // Setter method\n }\n public String getMake() {\n return this.make; // Getter method\n }\n}\n\n• What do you understand by Setter method and Getter method from the codes above?\n\n• Explain why the attributes in the class are labelled private .\n\n• In the provided code examples, how is encapsulation implemented in the Car class?\n\n• What are the advantages of encapsulating data and methods within a class, as demonstrated in the code?"],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Scenario 6.1","Imagine you love taking pictures of wild animals in their natural homes. To capture the best shots, you use special cameras that are powered by Python. These cameras can track and recognise even the rarest animals using smart technology. With Python's help, you can document these incredible creatures, learn more about their behavior, and help protect them. By using Python, you can take amazing photos that show the beauty of nature and make people care about conserving our wildlife.\n\n \n\nHow does Python-driven camera technology aid in tracking and identifying rare animals in wildlife photography? Provide a concise explanation."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Activity 6.5 Q1","CONSTANT_PI = 3.14159\ndef add(a, b):\n return a + b\ndef subtract(a, b):\n return a - b\n\nimport mymodule\nresult_add = mymodule.add(500, 1300)\nresult_subtract = mymodule.subtract(101, 17)\nprint(\"Addition result:\", result_add)\nprint(\"Subtraction result:\", result_subtract)\n\nReflect on how using modules can help in organising and reusing code."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Activity 6.5 Q2","CONSTANT_PI = 3.14159\ndef add(a, b):\n return a + b\ndef subtract(a, b):\n return a - b\n\nimport mymodule\nresult_add = mymodule.add(500, 1300)\nresult_subtract = mymodule.subtract(101, 17)\nprint(\"Addition result:\", result_add)\nprint(\"Subtraction result:\", result_subtract)\n\nDiscuss how you can apply the concept of modules in larger projects."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Exercise 6.1 Q1","Create a Python script that defines variables of different data types (integer, float, string, and boolean). Print the type of each variable."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Exercise 6.1 Q2","Write a Python program that takes two numbers as input from the user and performs addition, subtraction, multiplication, and division. Display the results for each operation."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Exercise 6.1 Q3","Develop a Python script that accepts a string input from the user, converts it to uppercase, and prints the length of the string."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Exercise 6.1 Q4","Create a Python program that initialises a list with five integer elements. Use a for loop to iterate through the list and print each element doubled."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Exercise 6.1 Q5","Write a Python script that takes a number as input from the user and prints whether the number is positive, negative, or zero."],
  ["chapter-6","6.1 Python Fundamentals, Control Structures, Functions, and Modules","Exercise 6.1 Q6","Define a Python function that takes two parameters and returns their sum. Call the function with two numbers and print the result."],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q1","Explain the concept of encapsulation in Python and why it is important in Object-Oriented Programming."],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q2","How does encapsulation help in achieving data hiding and preventing direct access to class attributes in Python?"],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q3","Discuss the role of access modifiers such as public, private ( __ ), and protected ( _ ) in implementing encapsulation in Python."],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q4","Provide an example of a Python class with private attributes and demonstrate how encapsulation is used to access and modify these attributes."],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q5","What is abstraction in Python and how does it differ from encapsulation?"],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q6","Explain the concept of abstract classes and methods in Python. Provide an example to illustrate their usage."],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q7","How does abstraction help in simplifying complex systems and promoting code reusability in Python?"],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q8","Discuss the benefits of using abstract classes and methods in Python programming, especially in large-scale projects."],
  ["chapter-6","6.2 Object-Oriented Programming in Python","Exercise 6.2 Q9","Define inheritance in Python and describe its role in Object-Oriented Programming."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q1","Write Python code to calculate the area of a rectangle with length 5 units and width 3 units. Print the result."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q2","Write a Python program that asks the user to input their age. If the age is greater than or equal to 18, print \"You are an adult\". Otherwise, print \"You are a minor\"."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q3","Create a list of your favorite fruits. Write a Python program that uses a for loop to iterate through the list and print each fruit name on a new line."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q4","Define a Python function called calculate_cube that takes an integer parameter side_length and returns the volume of a cube with that side length. Test the function with a side length of 4 units."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q5","Write a Python program that prompts the user to enter their full name. Print the initials of their first name and last name in uppercase letters. For example, if the user inputs \"Mtukula Jamaasoni\", the output should be \"MJ\"."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q6","Write a Python program that reads a text file named grades.txt . Each line in the file contains a student's name followed by their grade (for example, \"Mponjoli 97\"). Your program should calculate and print the average grade for all students. Handle any possible exceptions that may occur during file reading or grade calculation."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q7","Explain the concept of polymorphism in Python OOP and provide a real-world example."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q8","How does encapsulation enhance data security and privacy in Python classes? Give an example."],
];

export const CS_F5_QUESTIONS_PART4: Array<[string, string, string, string]> = [
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q9","Describe the process of inheritance in Python and discuss its advantages in code reusability."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q10","What is the purpose of an abstract class in Python? Provide an example of defining and implementing an abstract class."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q11","How can you achieve method overriding in Python classes? Provide a scenario where method overriding is useful."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q12","Discuss the difference between class attributes and instance attributes in Python classes with suitable examples."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q13","Explain the role of constructors in Python classes. How do you define and use constructors in your code?"],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q14","What is the significance of the super() function in Python inheritance? Give an example demonstrating its usage."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q15","How do you implement encapsulation using private and protected attributes in Python classes? Provide syntax examples."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q16","Describe the concept of multiple inheritance in Python. What precautions should you take when using multiple inheritance?"],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q17","Discuss the benefits of using abstraction in Python programming. Provide an example of abstracting a complex system into classes."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q18","How does method overloading differ from method overriding in Python? Provide examples to illustrate both concepts."],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q19","What is the purpose of the __init__() method in Python classes? How does it differ from other methods?"],
  ["chapter-6","6.3 Chapter 6 Revision & Projects","Revision Exercise 6 Q20","Describe the process of Method Resolution Order (MRO) in Python inheritance. How does Python determine the order of method execution in subclasses?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Case Study 7.1 Q1","Members of an active School Photography Club have recently returned from a field trip to Serengeti National Park, where they took pictures of the environment and wildlife using laptops, tablets, and smartphones with various operating systems (Android, macOS, Windows) in different formats (JPEG, RAW).\n\n \n\nHow can the club members leverage the functionalities of their individual Operating Systems to share photos across different devices?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Case Study 7.1 Q2","Members of an active School Photography Club have recently returned from a field trip to Serengeti National Park, where they took pictures of the environment and wildlife using laptops, tablets, and smartphones with various operating systems (Android, macOS, Windows) in different formats (JPEG, RAW).\n\n \n\nWhich OS features can help organise the large number of photos efficiently?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Case Study 7.1 Q3","Members of an active School Photography Club have recently returned from a field trip to Serengeti National Park, where they took pictures of the environment and wildlife using laptops, tablets, and smartphones with various operating systems (Android, macOS, Windows) in different formats (JPEG, RAW).\n\n \n\nHow does using different image formats (JPEG vs RAW) affect the sharing process?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Case Study 7.1 Q4","Members of an active School Photography Club have recently returned from a field trip to Serengeti National Park, where they took pictures of the environment and wildlife using laptops, tablets, and smartphones with various operating systems (Android, macOS, Windows) in different formats (JPEG, RAW).\n\n \n\nWhich security measures that operating systems offer can help ensure that the photos are securely protected from unauthorised access?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Case Study 7.1 Q5","Members of an active School Photography Club have recently returned from a field trip to Serengeti National Park, where they took pictures of the environment and wildlife using laptops, tablets, and smartphones with various operating systems (Android, macOS, Windows) in different formats (JPEG, RAW).\n\n \n\nHow can the club leverage features within their chosen platform (online gallery, social media) to present the photos in an engaging way?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Activity 7.1 Q1","Reflect on how operating systems have evolved over time and the significance of these changes."],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Activity 7.1 Q2","Discuss the role of operating systems in shaping the modern computing landscape and their influence on user experience, software development, and technological innovation."],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Exercise 7.1 Q1","Suppose that you are a technical support specialist assisting someone unfamiliar with computers. Use simple terms and diagrams to explain the basic functions of an operating system and how it interacts with hardware and software applications."],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Exercise 7.1 Q2","Imagine that you have been given the task of creating a user guide for a new mobile app that needs to be user-friendly for people across different cultures and languages. How can you leverage the various features of operating systems to create a clear and universally understandable user interface?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Exercise 7.1 Q3","Conduct research and write a two-page report on different types of malware that can target operating systems. How can an understanding of OS architecture (such as kernel, security features) help users protect their devices from such threats?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Exercise 7.1 Q4","Compare and contrast the design considerations for a desktop Operating System and a mobile Operating System. How do these considerations relate to user needs and resource limitations of each device?"],
  ["chapter-7","7.1 Operating System Concepts, Evolution, and Design","Exercise 7.1 Q5","Imagine that you and your classmates are developing a new open-source Operating System that focuses on education. How can you leverage online collaboration tools and communication platforms to involve a global community of software developers and testers in the development process? What benefits might this approach have?"],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.2 Q1","Suppose you are a tech support specialist for a school computer lab. A student reports that their computer is slow and unresponsive. Use your understanding of process management to explain in simple terms to the student what might be causing the issue and how they can identify resource-heavy processes."],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.2 Q2","Research and compare different process scheduling algorithms used by operating systems, and explain how these algorithms impact the performance of modern computer games and the overall user experience."],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.2 Q3","Imagine that you are part of a team developing a new mobile operating system that focuses on energy efficiency. Explain how understanding process management can help you to optimise resource allocation and battery life on mobile devices."],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.2 Q4","Security threats can exploit vulnerabilities in processes. Research and discuss different types of malware that target processes. How can users be vigilant and identify potential threats related to process management?"],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.2 Q5","Open-source operating systems like Linux are known for their customisation options. Investigate how advanced users can leverage the command line to manage processes on Linux. Explain the benefits and potential challenges of this approach."],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.3 Q1","How does CPU scheduling impact the digital workflow of a computer user?"],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.3 Q2","Research and compare different CPU scheduling algorithms used by three operating systems of your choice. Work with a colleague to create a table or infographic summarizing the strengths and weaknesses of each algorithm."],
  ["chapter-7","7.2 Process Management, CPU Scheduling, and Deadlocks","Exercise 7.3 Q3","Imagine you are part of a development team creating a new operating system for a self-driving car. Explain how CPU scheduling algorithms play a critical role in ensuring real-time response for critical tasks like braking or sensor data processing."],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q1","Research the concept of context switching in CPU scheduling. How can operating systems minimize context switching to improve the gaming experience?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q2","Operating systems use fairness and efficiency principles when scheduling CPU tasks. Discuss with your classmates the ethical considerations of prioritizing certain processes (e.g., emergency services applications) over others. How can we balance fairness with efficiency in CPU scheduling?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q3","How does CPU scheduling affect app responsiveness and patience?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q4","How can you optimise the performance of a smartphone using CPU scheduling knowledge?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q5","How does CPU scheduling promote collaboration and sharing of computer resources?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q6","How does CPU scheduling connect to coding and resource management?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q7","How can the knowledge of CPU scheduling prepare you for emerging technologies?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q8","Provide two real-world cases of deadlock. For each case briefly explain its causes and ways to handle the deadlock. How does the OS handle process synchronization to avoid race conditions?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q9","How does the OS use CPU scheduling to improve efficiency?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q10","What are the key differences between preemptive and non-preemptive scheduling?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q11","How does the OS ensure data security and integrity on storage devices?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q12","What mechanisms does the OS use to detect and recover from deadlocks?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q13","Imagine that you are a team developing a new mobile operating system for educational tablets. Discuss and answer the following \n\n• Who are the primary users of this tablet OS (students, teachers, both)? What are their specific needs and priorities?\n\n• How will you ensure the security and privacy of student data stored on the tablets?\n\n• How can the OS handle multiple apps running simultaneously while maintaining efficient usage of computer resources such as CPU and memory?\n\n• Design a user-friendly and intuitive interface suitable for users of different ages and tech experience levels. Sketch your ideas or create a simple mock-up.\n\n• How can the OS be designed to adapt to future technological advancements and integrate with emerging learning technologies?"],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q14","Choose one of the following statements and prepare arguments for or against it:\n\n• Virtual memory is always a better alternative to increasing physical RAM.\n\n• Round Robin scheduling is the most efficient CPU scheduling algorithm for all scenarios.\n\n• Operating systems should prioritize user convenience over system efficiency."],
  ["chapter-7","7.3 Chapter 7 Revision & Projects","Revision Exercise 7 Q15","Conduct research on emerging operating system trends related to artificial intelligence, cloud computing, Internet of Things (IoT) platforms, or mobile technology. Create a short presentation or infographic explaining your findings and how these trends might impact future OS functionality."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Scenario 8.1 Q1","The new Form Five students have just reported to a school for high school admission. They are disturbed by the amount of paperwork the school uses to manage the students' academic records, including continuous assessments and certificates. In a move to modernize information management, the school has decided to implement a database system for managing academic records.\n\n \n\nWhat challenges might the new students face in managing their academic records using traditional paper-based methods?"],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Scenario 8.1 Q2","The new Form Five students have just reported to a school for high school admission. They are disturbed by the amount of paperwork the school uses to manage the students' academic records, including continuous assessments and certificates. In a move to modernize information management, the school has decided to implement a database system for managing academic records.\n\n \n\nHow can a database system streamline the process of managing academic records compared to manual methods?"],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Scenario 8.1 Q3","The new Form Five students have just reported to a school for high school admission. They are disturbed by the amount of paperwork the school uses to manage the students' academic records, including continuous assessments and certificates. In a move to modernize information management, the school has decided to implement a database system for managing academic records.\n\n \n\nWhat are the essential features and functionalities that a database designed for academic records management should possess?"],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.1 Q1","Why is immediate and accurate data updating crucial for complex databases like government payment systems and social media platforms?"],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.1 Q2","How does concurrency differ between file-based systems and DBMS, and why is it important?"],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.1 Q3","Explain how data redundancy and inconsistency can be a problem in a file-based system compared to a DBMS. Provide examples."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.1 Q4","How does a DBMS handle concurrent access to data, and why is this important? Contrast this with the concurrency control mechanisms in a file-based system."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.1 Q5","Explain how a DBMS reduces data redundancy and inconsistency compared to file-based systems, citing real-world examples."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.2 Q1","Explain the concept of a database model and explain its significance in contemporary information systems."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.2 Q2","How do hierarchical and network models differ, and provide practical examples of their applications."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.2 Q3","Compare and contrast relational and object-oriented models, and cite real-world examples."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.3 Q1","Identify two related entities in your school students' organisation and determine three possible attributes for each. Create both tables with three tuples for each and show how they relate."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.3 Q2","In the tables you have created in question (1), identify the primary key, candidate key, alternate key, and foreign key. Also, determine the domain for each attribute that was identified."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.3 Q3","Differentiate between selection and projection in an RDBMS while giving examples."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Activity 8.7 Q1","Staff No | Branch No | Branch address | Name | Position | Hr/week\nS3244 | B0021 | Temeke, Plt 12G DSM | Asha Haji | Assistant | 16\nS3244 | B0045 | Mikocheni, Plt 32A, DSM | Asha Haji | Assistant | 9\nS4545 | B0021 | Temeke, Plt 12G DSM | Mayalla Macho | Assistant | 14\nS4545 | B0045 | Mikocheni, Plt 32A, DSM | Mayalla Macho | Assistant | 10\n\nWhy is this table not in 3NF? Give two reasons."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Activity 8.7 Q2","Staff No | Branch No | Branch address | Name | Position | Hr/week\nS3244 | B0021 | Temeke, Plt 12G DSM | Asha Haji | Assistant | 16\nS3244 | B0045 | Mikocheni, Plt 32A, DSM | Asha Haji | Assistant | 9\nS4545 | B0021 | Temeke, Plt 12G DSM | Mayalla Macho | Assistant | 14\nS4545 | B0045 | Mikocheni, Plt 32A, DSM | Mayalla Macho | Assistant | 10\n\nDescribe and illustrate the process of normalizing the data shown in Table 8.17 to the Third Normal Form (3NF)."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Activity 8.7 Q3","Staff No | Branch No | Branch address | Name | Position | Hr/week\nS3244 | B0021 | Temeke, Plt 12G DSM | Asha Haji | Assistant | 16\nS3244 | B0045 | Mikocheni, Plt 32A, DSM | Asha Haji | Assistant | 9\nS4545 | B0021 | Temeke, Plt 12G DSM | Mayalla Macho | Assistant | 14\nS4545 | B0045 | Mikocheni, Plt 32A, DSM | Mayalla Macho | Assistant | 10\n\nIdentify the primary, alternate, and foreign keys in your 3NF relations."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.4 Q1","Describe the steps you would take to convert unnormalised tables to the First Normal Form, Second Normal Form, and Third Normal Form."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.4 Q2","Provide at least one example relevant to a school or college environment that illustrates reasons for converting database tables to the First, Second, and Third Normal Forms."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.4 Q3","Contrast relational and object-oriented models and give two examples of their uses in real life for each of them."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.4 Q4","Why is the relational model the most used model today despite the continued invention of even newer models?"],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.4 Q5","Identify a real-world application for each of the following database models: hierarchical, network, and relational. Justify your choice based on the characteristics of each model."],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.4 Q6","What features would you find in an object-oriented database model that are not typically present in a relational database model?"],
  ["chapter-8","8.1 Relational Database Models, Keys, and Normalization (1NF–3NF)","Exercise 8.4 Q7","How do data structures like trees relate to database models? Provide an example of a database model that uses this structure."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.10 Q2","Discuss similarities between organizing physical cards and organizing data in a database. Highlight concepts such as categorization (grouping data based on common attributes), searchability (ease of finding specific information), and scalability (handling larger datasets)."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.11 Q1","Explain the process and challenges faced when searching for information in the first book without an index."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.11 Q2","Describe how the presence of an index in the second book facilitated faster information retrieval."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.11 Q3","Discuss the impact of having an index on the speed and ease of searching for information in the second book."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.11 Q4","Compare the functionality of a book index with indexes in databases, highlighting similarities and differences."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.12 Q3","Discuss how Database Management System (DBMS) software optimises queries through analyzing query execution plans, utilising indexes, and employing optimization techniques."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.12 Q4","Analyse how the strategies you employed align with the principles of query optimization in DBMS."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.12 Q5","Discuss the importance of selecting the most efficient approach based on factors such as data volume, complexity, and performance requirements."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.13 Q4","Discuss the performance differences you observed before and after creating indexes on your tables. Why are indexes important for query optimization?"],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.13 Q5","Reflect on how understanding database operations and SQL can be beneficial in real-world applications."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.5 Q1","Create an SQL statement to create a table named Books . The table should have four columns:\n\n• BookID - as an integer and the primary key,\n\n• Title - as a variable character with a maximum length of 250 characters,\n\n• AuthorName - as a variable character with a maximum length of 100 characters, and\n\n• PublishedYear - as an integer."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.5 Q2","Write an SQL query to insert the following data into the Books table:\n\n• BookID: 1 , Title: \"Database System Concepts\" , Authors: \"Abraham Silberschatz, Henry F. Korth, and S. Sudarshan\" , PublishedYear: 2020 \n\n• BookID: 2 , Title: \"Artificial Intelligence in Education: Promise and Implications for Teaching and Learning\" , Authors: \"Charles Fadel, Wayne Holmes, and Maya Bialik\" , PublishedYear: 2017"],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.5 Q3","Write an SQL query to retrieve all columns for all books in the Books table that were published after the year 2018."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.5 Q4","The publication year of \"2017\" by Charles Fadel, Wayne Holmes, and Maya Bialik was mistakenly entered as 2017. It was published in 2019. Write an SQL query to correct this mistake in the Books table."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.5 Q5","Assuming there was a mistake, and the book with BookID 2 is not supposed to be in the Books table, write an SQL query to delete this book from the table."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.14 Q3","Discuss the benefits and challenges of parallel and distributed systems in this analogy."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Activity 8.14 Q4","Provide real-world examples in Tanzania where these systems can be applied."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.6 Q1","Write an SQL query to select all records from a table named Students where the Grade is 'A' ."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.6 Q2","Construct an SQL query to update the salary of all employees in the \"Sales\" department by $10\\%$."],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.6 Q3","What attributes in a database identify if it is either a parallel or distributed database system?"],
  ["chapter-8","8.2 SQL Operations, Indexing, Query Optimization, and Parallel/Distributed DBs","Exercise 8.6 Q4","Why do developers consider data partitioning in parallel database systems an important technique?"],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q1","How can you identify that particular kinds of data are \"Big Data\"?"],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q2","How can you persuade a user to use a Graph Database against a Relational Database and vice versa?"],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q3","What is the need for developers to use serverless databases?"],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q4","What key attributes does Blockchain technology enhance in databases?"],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q5","Describe a scenario where a Time-Series Database (TSDB) would be MOST valuable."],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q6","Identify applications that find it necessary to use a Distributed Database. Explain why."],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q7","What do you understand by the term \"Database as a Service\" (DBaaS)? What valuable contribution does it have?"],
  ["chapter-8","8.3 Emerging Database Technologies (Big Data, TSDB, Blockchain, DBaaS)","Exercise 8.7 Q8","Discuss the contributions brought by the rise of IoT (Internet of Things) devices."],
  ["chapter-8-part-2","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.8 Q1","Describe PHP and its role in web development."],
  ["chapter-8-part-2","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.8 Q2","What advantages does PDO offer for MySQL developers?"],
  ["chapter-8-part-2","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.8 Q3","How can you connect to a MySQL database using PDO in PHP?"],
  ["chapter-8-part-2","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.8 Q4","How would you fetch data from a database using PDO?"],
  ["chapter-8","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.9 Q1","Compare and contrast the benefits of using a wide-column store versus a graph database in different application scenarios."],
  ["chapter-8","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.9 Q2","Discuss the use cases where a document-oriented database like MongoDB would be more suitable than a relational database system."],
  ["chapter-8","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.9 Q3","What are the advantages of using NoSQL databases for handling unstructured data compared to traditional relational databases?"],
  ["chapter-8","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.9 Q4","Set up a MongoDB database using MongoDB Atlas Free Tier. Then, perform the following:\n\n• Create a new MongoDB cluster on MongoDB Atlas.\n\n• Define a collection named \"books\" with fields like title , author , and genre .\n\n• Insert sample documents into the \"books\" collection.\n\n• Write queries to retrieve books based on author and genre."],
  ["chapter-8","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.9 Q5","Implement a simple key-value store using Redis by performing the following:\n\n• Install and set up Redis on your local machine or use a cloud-based Redis service.\n\n• Define keys for storing data related to user sessions (such as session IDs and user data).\n\n• Implement operations to set, get, and delete key-value pairs.\n\n• Test the key-value store by storing and retrieving sample data."],
  ["chapter-8","8.4 Web Databases (PHP/PDO & MySQL) and NoSQL Systems","Exercise 8.9 Q6","Set up a Cassandra cluster and perform basic operations by implementing the following:\n\n• Install Cassandra on a local machine or use a cloud-based Cassandra service.\n\n• Create a keyspace named \"library\" and define a table \"books\" with columns for book ID, title, author, and genre.\n\n• Insert sample data into the \"books\" table.\n\n• Write CQL queries to retrieve books based on book ID and author."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q1","How might the use of databases in academic records management align with broader trends in digital transformation and information technology?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q2","What is a Structured Query Language? Briefly explain how it is used to interact with relational databases."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q3","How does a NoSQL database differ from a relational database in terms of data structure and flexibility?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q4","In what scenario might a NoSQL database be a better choice compared to a traditional relational database?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q5","What is a data warehouse, and how does it differ from a traditional database in terms of its purpose and data organisation?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q6","Explain the challenges of big data associated with collecting, managing, and analysing massive datasets."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q7","Provide an example of how big data and data warehouses could be used in a specific industry (such as healthcare, finance, education, local governments)."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q8","Identify any correlation between where the user is browsing from and the specific actions they perform on the website."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q9","Analyse the content of user messages left on different website pages, to identify any recurring themes or concerns expressed by users of specific services provided by the website:\n\n• What features would you find in an object-oriented database model that are not typically present in a relational database model?\n\n• How do data structures like trees relate to database models? Provide an example of a database model that uses this structure."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q10","Construct an SQL query to update the salary of all employees in the \"Sales\" department by $10\\%$."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q11","How can you respond to someone who needs to understand about parallel and distributed database systems?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q12","In parallel database systems, why is data partitioning considered an important technique?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q13","What is the primary reason for using tables (comprising rows and columns) in a relational database management system (RDBMS) for data storage?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q14","Why are indexes used in a database management system (DBMS)?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q15","In the context of a database management system (DBMS), what is the goal of query optimization?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q16","Consider a national healthcare system in Tanzania that stores patient records, medical histories, and treatment information. Which system between parallel and distributed database systems would be most appropriate if the goal is to ensure reliable access to complete patient records at any hospital across the country, and why?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q17","Describe demands created by the rise of IoT (Internet of Things) devices."],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q18","What is the purpose of the echo statement in PHP?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q19","What makes GET and POST HTTP methods not look the same?"],
  ["chapter-8-part-2","8.5 Chapter 8 Revision & Projects","Revision Exercise 8 Q20","Demonstrate with code how to implement a CRUD operation for a 'users' table in PHP using PDO."],
];


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
