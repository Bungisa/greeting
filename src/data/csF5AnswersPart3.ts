import type { ExactCSAnswer } from './csF5AnswersPart1.ts';

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
