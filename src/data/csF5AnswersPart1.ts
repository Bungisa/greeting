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
