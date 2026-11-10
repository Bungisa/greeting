import type { ExactCSAnswer } from './csF5AnswersPart1.ts';

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
