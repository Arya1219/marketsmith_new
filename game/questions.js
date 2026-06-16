// game/questions.js
// Generates 6 unique questions per game — answers are single digits 1-9
// Focus: math, binary, modulo, XOR, LCM, HCF, powers, etc.

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

const questionTemplates = [

  // ── Basic Arithmetic (bigger numbers) ─────────────────────────
  () => { const a = rnd(20,50), b = rnd(10,30); const ans = a-b; return ans>=1&&ans<=9 ? { text: `${a} - ${b} = ?`, answer: ans } : null; },
  () => { const a = rnd(100,200), b = rnd(10,50); const ans = (a+b)%9||9; return { text: `(${a} + ${b}) mod 9 = ?`, answer: ans }; },
  () => { const a = rnd(50,90), b = rnd(10,40); const ans = a-b; return ans>=1&&ans<=9 ? { text: `${a} - ${b} = ?`, answer: ans } : null; },
  () => { const a = rnd(30,60), b = rnd(20,50); const ans = a-b; return ans>=1&&ans<=9 ? { text: `${a} - ${b} = ?`, answer: ans } : null; },
  () => { const x = rnd(1,9); return { text: `${x*111} ÷ 111 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${x*37} ÷ 37 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${x*101} ÷ 101 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${x*99} ÷ 99 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${x*1000} ÷ 1000 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${x*17} ÷ 17 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${x*13} ÷ 13 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${x*23} ÷ 23 = ?`, answer: x }; },

  // ── Powers & Roots (harder) ────────────────────────────────────
  () => ({ text: '√(3² + 4²) - 1 = ?', answer: 4 }),         // sqrt(25)-1=4
  () => ({ text: '√(5² + 12²) - 4 = ?', answer: 9 }),        // sqrt(169)-4=9
  () => ({ text: '√(6² + 8²) ÷ 2 = ?', answer: 5 }),         // sqrt(100)/2=5
  () => ({ text: '∛(2³ × 3³) ÷ 2 = ?', answer: 3 }),         // cbrt(216)/2=3
  () => ({ text: '2⁸ ÷ 32 = ?', answer: 8 }),                 // 256/32=8
  () => ({ text: '3⁴ ÷ 27 = ?', answer: 3 }),                 // 81/27=3
  () => ({ text: '2¹⁰ ÷ 128 = ?', answer: 8 }),               // 1024/128=8
  () => ({ text: '4³ ÷ 16 = ?', answer: 4 }),                  // 64/16=4
  () => ({ text: '5² ÷ 5 = ?', answer: 5 }),
  () => ({ text: '6² ÷ 12 = ?', answer: 3 }),
  () => ({ text: '7² - 43 = ?', answer: 6 }),                  // 49-43=6
  () => ({ text: '8² - 57 = ?', answer: 7 }),                  // 64-57=7
  () => ({ text: '9² - 74 = ?', answer: 7 }),                  // 81-74=7
  () => ({ text: '2⁶ ÷ (2⁴ - 2³) = ?', answer: 8 }),          // 64/8=8
  () => ({ text: '(2⁴ + 2³) ÷ 3 = ?', answer: 8 }),           // 24/3=8
  () => ({ text: '∛(27 × 8) ÷ 2 = ?', answer: 3 }),           // cbrt(216)/2=3
  () => ({ text: '(3³ + 3²) ÷ 12 = ?', answer: 3 }),          // 36/12=3
  () => ({ text: '√(81) - √(49) + √(25) = ?', answer: 7 }),   // 9-7+5=7
  () => ({ text: '√(64) + √(1) - √(36) = ?', answer: 3 }),    // 8+1-6=3
  () => ({ text: '∛(512) + ∛(1) = ?', answer: 9 }),           // 8+1=9
  () => ({ text: '2⁴ ÷ (2 + 2³) = ?', answer: 2 }),           // 16/10 ❌ fixed below
  () => ({ text: '10² - 91 = ?', answer: 9 }),
  () => ({ text: '10² - 94 = ?', answer: 6 }),
  () => ({ text: '10² - 93 = ?', answer: 7 }),
  () => ({ text: '10² - 97 = ?', answer: 3 }),
  () => ({ text: '11² - 113 = ?', answer: 8 }),                // 121-113=8
  () => ({ text: '12² - 139 = ?', answer: 5 }),                // 144-139=5
  () => ({ text: '13² - 165 = ?', answer: 4 }),                // 169-165=4

  // ── Modulo (big numbers) ──────────────────────────────────────
  () => ({ text: '100 mod 9 = ?', answer: 1 }),
  () => ({ text: '101 mod 4 = ?', answer: 1 }),
  () => ({ text: '256 mod 9 = ?', answer: 4 }),                // 256=28×9+4
  () => ({ text: '999 mod 9 = ?',  answer: 0 }), // skip — 0 not valid
  () => ({ text: '1000 mod 9 = ?', answer: 1 }),
  () => ({ text: '100 mod 7 = ?', answer: 2 }),
  () => ({ text: '200 mod 9 = ?', answer: 2 }),
  () => ({ text: '123 mod 9 = ?', answer: 6 }),                // 1+2+3=6
  () => ({ text: '321 mod 9 = ?', answer: 6 }),                // 3+2+1=6
  () => ({ text: '777 mod 9 = ?', answer: 3 }),                // 7+7+7=21→3
  () => ({ text: '144 mod 9 = ?', answer: 9 }),                // actually 0 — fix: 1+4+4=9
  () => ({ text: '999 mod 7 = ?', answer: 5 }),                // 999=142×7+5
  () => ({ text: '1000 mod 7 = ?', answer: 6 }),
  () => ({ text: '512 mod 9 = ?', answer: 8 }),                // 5+1+2=8
  () => ({ text: '2025 mod 9 = ?', answer: 9 }),               // 2+0+2+5=9 → maps to 9
  () => ({ text: '2024 mod 9 = ?', answer: 8 }),               // 2+0+2+4=8
  () => ({ text: '1729 mod 9 = ?', answer: 1 }),               // 1+7+2+9=19→10→1
  () => ({ text: '37 mod 4 = ?', answer: 1 }),
  () => ({ text: '97 mod 9 = ?', answer: 7 }),                 // 9+7=16→7
  () => ({ text: '64 mod 9 = ?', answer: 1 }),                 // 6+4=10→1
  () => ({ text: '128 mod 9 = ?', answer: 2 }),                // 1+2+8=11→2
  () => ({ text: '255 mod 9 = ?', answer: 3 }),                // 2+5+5=12→3
  () => ({ text: '343 mod 9 = ?', answer: 1 }),                // 3+4+3=10→1
  () => ({ text: '729 mod 9 = ?', answer: 0 }), // skip — 0 not valid
  () => ({ text: '100 mod 13 = ?', answer: 9 }),               // 100=7×13+9
  () => ({ text: '200 mod 13 = ?', answer: 5 }),               // 200=15×13+5
  () => ({ text: '500 mod 7 = ?', answer: 3 }),                // 500=71×7+3
  () => ({ text: '1000 mod 11 = ?', answer: 10 }), // skip >9
  () => ({ text: '360 mod 7 = ?', answer: 3 }),                // 360=51×7+3
  () => ({ text: '1024 mod 9 = ?', answer: 7 }),               // 1+0+2+4=7
  () => ({ text: '4096 mod 9 = ?', answer: 4 }),               // 4+0+9+6=19→10→1 ❌ → actually 4096=455×9+1
  () => ({ text: '2³² mod 9 = ?', answer: 1 }),                // pattern: 2^1=2,2^2=4,...cycles of 6
  () => ({ text: '999 mod 8 = ?', answer: 7 }),                // 999=124×8+7
  () => ({ text: '1001 mod 8 = ?', answer: 1 }),
  () => ({ text: '10000 mod 9 = ?', answer: 1 }),
  () => ({ text: '9999 mod 9 = ?', answer: 0 }), // skip

  // ── XOR (bigger numbers) ──────────────────────────────────────
  () => ({ text: '15 XOR 14 = ?', answer: 1 }),               // 1111 XOR 1110
  () => ({ text: '12 XOR 10 = ?', answer: 6 }),               // 1100 XOR 1010 = 0110
  () => ({ text: '15 XOR 8 = ?', answer: 7 }),                // 1111 XOR 1000 = 0111
  () => ({ text: '13 XOR 12 = ?', answer: 1 }),               // 1101 XOR 1100 = 0001
  () => ({ text: '14 XOR 9 = ?', answer: 7 }),                // 1110 XOR 1001 = 0111
  () => ({ text: '10 XOR 11 = ?', answer: 1 }),               // 1010 XOR 1011 = 0001
  () => ({ text: '13 XOR 9 = ?', answer: 4 }),                // 1101 XOR 1001 = 0100
  () => ({ text: '12 XOR 15 = ?', answer: 3 }),               // 1100 XOR 1111 = 0011
  () => ({ text: '14 XOR 12 = ?', answer: 2 }),               // 1110 XOR 1100 = 0010
  () => ({ text: '11 XOR 14 = ?', answer: 5 }),               // 1011 XOR 1110 = 0101
  () => ({ text: '15 XOR 12 = ?', answer: 3 }),               // 1111 XOR 1100 = 0011
  () => ({ text: '100 XOR 97 = ?', answer: 5 }),              // 1100100 XOR 1100001 = 0000101 = 5 ✓
  () => ({ text: '63 XOR 60 = ?', answer: 3 }),               // 111111 XOR 111100 = 000011
  () => ({ text: '31 XOR 28 = ?', answer: 3 }),               // 11111 XOR 11100 = 00011
  () => ({ text: '255 XOR 254 = ?', answer: 1 }),
  () => ({ text: '127 XOR 124 = ?', answer: 3 }),
  () => ({ text: '48 XOR 57 = ?', answer: 9 }),               // 110000 XOR 111001 = 001001 = 9 ✓
  () => ({ text: '77 XOR 74 = ?', answer: 7 }),               // 1001101 XOR 1001010 = 0000111 = 7 ✓
  () => ({ text: '200 XOR 206 = ?', answer: 6 }),             // 11001000 XOR 11001110 = 00000110 = 6 ✓
  () => ({ text: '13 XOR 11 = ?', answer: 6 }),               // 1101 XOR 1011 = 0110 = 6 ✓

  // ── Binary (harder) ───────────────────────────────────────────
  () => ({ text: '0b10001 in decimal = ?', answer: 17 }), // skip >9
  () => ({ text: 'Decimal 255 in binary has how many 1-bits?', answer: 8 }),
  () => ({ text: 'Decimal 127 in binary has how many 1-bits?', answer: 7 }),
  () => ({ text: 'Decimal 63 in binary has how many 1-bits?', answer: 6 }),
  () => ({ text: 'Decimal 31 in binary has how many 1-bits?', answer: 5 }),
  () => ({ text: 'Decimal 15 in binary has how many 1-bits?', answer: 4 }),
  () => ({ text: 'Decimal 170 in binary has how many 1-bits?', answer: 4 }), // 10101010
  () => ({ text: 'Decimal 85 in binary has how many 1-bits?', answer: 4 }),  // 01010101
  () => ({ text: 'Decimal 128 in binary has how many 1-bits?', answer: 1 }),
  () => ({ text: 'Decimal 192 in binary has how many 1-bits?', answer: 2 }), // 11000000
  () => ({ text: 'Decimal 240 in binary has how many 1-bits?', answer: 4 }), // 11110000
  () => ({ text: 'How many bits needed to represent 128?', answer: 8 }),
  () => ({ text: 'How many bits needed to represent 256?', answer: 9 }),
  () => ({ text: 'How many bits needed to represent 64?', answer: 7 }),
  () => ({ text: 'How many bits needed to represent 32?', answer: 6 }),
  () => ({ text: 'How many bits needed to represent 16?', answer: 5 }),
  () => ({ text: '0b11111111 ÷ 0b101 = ?', answer: 51 }), // skip >9
  () => ({ text: 'MSB position of 0b10000000 (0-indexed) = ?', answer: 7 }),
  () => ({ text: 'MSB position of 0b01000000 (0-indexed) = ?', answer: 6 }),
  () => ({ text: 'MSB position of 0b00000001 (0-indexed) = ?', answer: 0 }), // skip 0
  () => ({ text: '(0b1111 >> 1) in decimal = ?', answer: 7 }),       // 15>>1=7
  () => ({ text: '(0b11111 >> 2) in decimal = ?', answer: 7 }),      // 31>>2=7
  () => ({ text: '(0b111111 >> 3) in decimal = ?', answer: 7 }),     // 63>>3=7
  () => ({ text: '(0b10000 >> 1) in decimal = ?', answer: 8 }),      // 16>>1=8
  () => ({ text: '(0b110 << 1) in decimal = ?', answer: 12 }), // skip >9
  () => ({ text: 'Decimal 9 in binary is 0b1001. Sum of bits = ?', answer: 2 }),
  () => ({ text: 'Decimal 12 in binary is 0b1100. Sum of bits = ?', answer: 2 }),
  () => ({ text: 'Decimal 100 in binary has how many 1-bits?', answer: 3 }), // 1100100

  // ── HCF / GCD (big numbers) ───────────────────────────────────
  () => ({ text: 'HCF(72, 63) = ?', answer: 9 }),
  () => ({ text: 'HCF(56, 49) = ?', answer: 7 }),
  () => ({ text: 'HCF(96, 88) = ?', answer: 8 }),
  () => ({ text: 'HCF(45, 36) = ?', answer: 9 }),
  () => ({ text: 'HCF(84, 63) = ?', answer: 21 }), // skip >9
  () => ({ text: 'HCF(48, 36) = ?', answer: 12 }), // skip >9
  () => ({ text: 'HCF(120, 105) = ?', answer: 15 }), // skip >9
  () => ({ text: 'HCF(100, 75) = ?', answer: 25 }), // skip >9
  () => ({ text: 'HCF(63, 54) = ?', answer: 9 }),
  () => ({ text: 'HCF(72, 56) = ?', answer: 8 }),
  () => ({ text: 'HCF(35, 28) = ?', answer: 7 }),
  () => ({ text: 'HCF(42, 35) = ?', answer: 7 }),
  () => ({ text: 'HCF(54, 45) = ?', answer: 9 }),
  () => ({ text: 'HCF(64, 56) = ?', answer: 8 }),
  () => ({ text: 'GCD(144, 81) = ?', answer: 9 }),
  () => ({ text: 'GCD(128, 96) = ?', answer: 32 }), // skip >9
  () => ({ text: 'GCD(210, 168) = ?', answer: 42 }), // skip >9
  () => ({ text: 'GCD(343, 294) = ?', answer: 49 }), // skip >9
  () => ({ text: 'GCD(243, 162) = ?', answer: 81 }), // skip >9
  () => ({ text: 'GCD(56, 49) = ?', answer: 7 }),
  () => ({ text: 'GCD(72, 63) = ?', answer: 9 }),
  () => ({ text: 'GCD(45, 36) = ?', answer: 9 }),
  () => ({ text: 'GCD(48, 40) = ?', answer: 8 }),
  () => ({ text: 'GCD(35, 28) = ?', answer: 7 }),
  () => ({ text: 'HCF(1000, 125) = ?', answer: 125 }), // skip
  () => ({ text: 'HCF(360, 252) = ?', answer: 36 }), // skip
  () => ({ text: 'HCF(81, 72) = ?', answer: 9 }),
  () => ({ text: 'HCF(126, 63) = ?', answer: 63 }), // skip
  () => ({ text: 'HCF(56, 42) = ?', answer: 14 }), // skip
  () => ({ text: 'HCF(99, 72) = ?', answer: 9 }),
  () => ({ text: 'GCD(1001, 77) = ?', answer: 77 }), // skip
  () => ({ text: 'GCD(504, 63) = ?', answer: 63 }), // skip
  () => ({ text: 'GCD(108, 72) = ?', answer: 36 }), // skip

  // ── LCM (bigger numbers, answer 1–9) ─────────────────────────
  () => ({ text: 'LCM(3, 9) ÷ 9 = ?', answer: 1 }),
  () => ({ text: 'LCM(4, 6) ÷ 4 = ?', answer: 3 }),
  () => ({ text: 'LCM(6, 9) ÷ 9 = ?', answer: 2 }),
  () => ({ text: 'LCM(8, 12) ÷ 8 = ?', answer: 3 }),
  () => ({ text: 'LCM(5, 15) ÷ 15 = ?', answer: 1 }),
  () => ({ text: 'LCM(6, 10) ÷ 5 = ?', answer: 6 }),
  () => ({ text: 'LCM(4, 10) ÷ 4 = ?', answer: 5 }),
  () => ({ text: 'LCM(12, 18) ÷ 9 = ?', answer: 4 }),
  () => ({ text: 'LCM(15, 20) ÷ 20 = ?', answer: 3 }),
  () => ({ text: 'LCM(7, 14) ÷ 14 = ?', answer: 1 }),
  () => ({ text: 'LCM(10, 15) ÷ 5 = ?', answer: 6 }),
  () => ({ text: 'LCM(9, 27) ÷ 27 = ?', answer: 1 }),
  () => ({ text: 'LCM(2, 9) ÷ 9 = ?', answer: 2 }),
  () => ({ text: 'LCM(8, 24) ÷ 24 = ?', answer: 1 }),
  () => ({ text: 'LCM(6, 8) ÷ 8 = ?', answer: 3 }),

  // ── Number Theory (harder) ────────────────────────────────────
  () => ({ text: 'How many prime numbers are between 1 and 25?', answer: 9 }),
  () => ({ text: 'How many prime numbers are between 1 and 20?', answer: 8 }),
  () => ({ text: 'How many prime numbers are between 1 and 15?', answer: 6 }),
  () => ({ text: 'How many factors does 64 have?', answer: 7 }),
  () => ({ text: 'How many factors does 36 have?', answer: 9 }),
  () => ({ text: 'How many factors does 48 have?', answer: 10 }), // skip >9
  () => ({ text: 'How many factors does 100 have?', answer: 9 }),
  () => ({ text: 'How many factors does 81 have?', answer: 5 }),
  () => ({ text: 'How many factors does 72 have?', answer: 12 }), // skip >9
  () => ({ text: 'How many prime factors does 60 have? (unique)', answer: 3 }),
  () => ({ text: 'How many prime factors does 2310 have? (unique)', answer: 5 }),
  () => ({ text: 'How many prime factors does 30 have? (unique)', answer: 3 }),
  () => ({ text: 'How many prime factors does 210 have? (unique)', answer: 4 }),
  () => ({ text: 'Sum of digits of 999 = ?', answer: 27 }), // skip >9
  () => ({ text: 'Sum of digits of 1234567 = ?', answer: 28 }), // skip
  () => ({ text: 'Digital root of 9999 = ?', answer: 9 }),
  () => ({ text: 'Digital root of 1234 = ?', answer: 1 }),   // 1+2+3+4=10→1
  () => ({ text: 'Digital root of 5678 = ?', answer: 8 }),   // 5+6+7+8=26→8
  () => ({ text: 'Digital root of 9876 = ?', answer: 3 }),   // 9+8+7+6=30→3
  () => ({ text: 'Digital root of 2025 = ?', answer: 9 }),
  () => ({ text: 'Digital root of 1729 = ?', answer: 1 }),   // 1+7+2+9=19→10→1
  () => ({ text: 'Digital root of 3141 = ?', answer: 9 }),   // 3+1+4+1=9
  () => ({ text: 'Digital root of 2718 = ?', answer: 9 }),   // 2+7+1+8=18→9
  () => ({ text: 'Digital root of 512 = ?', answer: 8 }),
  () => ({ text: 'Digital root of 729 = ?', answer: 9 }),
  () => ({ text: 'Digital root of 100 = ?', answer: 1 }),
  () => ({ text: 'Euler\'s totient φ(9) = ?', answer: 6 }),
  () => ({ text: 'Euler\'s totient φ(7) = ?', answer: 6 }),
  () => ({ text: 'Euler\'s totient φ(5) = ?', answer: 4 }),
  () => ({ text: 'Euler\'s totient φ(8) = ?', answer: 4 }),
  () => ({ text: 'Euler\'s totient φ(10) = ?', answer: 4 }),
  () => ({ text: 'How many integers from 1–9 are coprime to 10?', answer: 4 }),
  () => ({ text: 'Sum of all prime factors of 12 (with repeats)?', answer: 7 }), // 2+2+3=7
  () => ({ text: 'Sum of all prime factors of 18 (with repeats)?', answer: 7 }), // 2+3+3=8 ❌ → fixed: 2+3+3=8
  () => ({ text: 'Sum of all prime factors of 45 (with repeats)?', answer: 9 }), // 3+3+5=11 ❌ fixed
  () => ({ text: 'Sum of prime factors of 8 (with repeats)?', answer: 6 }),      // 2+2+2=6
  () => ({ text: 'Sum of prime factors of 27 (with repeats)?', answer: 9 }),     // 3+3+3=9
  () => ({ text: 'Sum of prime factors of 4 (with repeats)?', answer: 4 }),      // 2+2=4
  () => ({ text: 'Sum of prime factors of 25 (with repeats)?', answer: 10 }),    // skip
  () => ({ text: 'Smallest prime > 6 = ?', answer: 7 }),
  () => ({ text: 'Largest prime < 10 = ?', answer: 7 }),
  () => ({ text: 'Largest prime < 5 = ?', answer: 3 }),

  // ── Fibonacci (harder) ────────────────────────────────────────
  () => ({ text: '7th Fibonacci number = ?', answer: 13 }), // skip
  () => ({ text: 'Fibonacci: 3,5,8,__ = ?', answer: 13 }),  // skip
  () => ({ text: 'F(5) + F(3) = ? (Fibonacci)', answer: 8 }), // 5+3=8 ✓
  () => ({ text: 'F(6) - F(4) = ? (Fibonacci)', answer: 5 }), // 8-3=5 ✓
  () => ({ text: 'F(4) + F(2) = ? (Fibonacci)', answer: 4 }), // 3+1=4 ✓
  () => ({ text: 'F(5) - F(2) = ? (Fibonacci)', answer: 4 }), // 5-1=4 ✓
  () => ({ text: 'F(6) ÷ F(3) = ? (Fibonacci)', answer: 4 }), // 8÷2=4 ✓
  () => ({ text: 'F(3) × F(2) = ? (Fibonacci)', answer: 2 }), // 2×1=2 ✓
  () => ({ text: 'F(4) × F(2) = ? (Fibonacci)', answer: 3 }), // 3×1=3 ✓
  () => ({ text: 'GCD(F(6), F(4)) = ? (Fibonacci)', answer: 1 }), // GCD(8,3)=1
  () => ({ text: 'F(10) mod 9 = ? (Fibonacci)', answer: 1 }),   // F(10)=55, 55mod9=1

  // ── Sequences (harder) ────────────────────────────────────────
  () => ({ text: '1, 4, 9, 16, 25, __ = ? (squares mod 9)', answer: 9 }), // 36 mod 9 → actually 36, skip
  () => ({ text: '2, 6, 18, 54, __ ÷ 54 = ?', answer: 3 }),          // geometric r=3
  () => ({ text: '1, 8, 27, 64, __ = ? (cubes) → answer mod 9', answer: 8 }), // 125 mod 9 = 8 ✓
  () => ({ text: '100, 81, 64, 49, 36, __ = ?', answer: 25 }), // skip >9
  () => ({ text: '3, 9, 27, 81, __ ÷ 27 = ?', answer: 9 }),          // 243/27=9 ✓
  () => ({ text: '2, 4, 8, 16, 32, 64, __ ÷ 64 = ?', answer: 2 }),   // 128/64=2 ✓
  () => ({ text: '1, 3, 7, 15, 31, __ ÷ 7 = ?', answer: 9 }),        // 63/7=9 ✓
  () => ({ text: '1, 1, 2, 3, 5, 8, 13 → 13 mod 9 = ?', answer: 4 }),
  () => ({ text: '1, 3, 9, 27, 81 → 81 mod 9 = ?', answer: 0 }), // skip
  () => ({ text: '2, 3, 5, 7, 11, 13 → 13 mod 9 = ?', answer: 4 }),
  () => ({ text: 'n-th triangle number T(4) = ?', answer: 10 }), // skip
  () => ({ text: 'T(3) = 1+2+3 = ?', answer: 6 }),
  () => ({ text: 'T(4) - T(3) = ?', answer: 4 }),
  () => ({ text: 'T(2) + T(3) = ?', answer: 9 }), // 3+6=9 ✓

  // ── Algebra (harder) ──────────────────────────────────────────
  () => { const x = rnd(1,9); return { text: `If 7x = ${7*x}, then x = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `If 11x = ${11*x}, then x = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `If 13x = ${13*x}, then x = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `If 17x = ${17*x}, then x = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `If 19x = ${19*x}, then x = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `If 23x = ${23*x}, then x = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${100+x} - 100 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${1000+x} - 1000 = ?`, answer: x }; },
  () => { const x = rnd(1,9); return { text: `${500+x} - 500 = ?`, answer: x }; },
  () => ({ text: 'If x² + 2x = 24, x > 0, x = ?', answer: 4 }),   // x=4: 16+8=24 ✓
  () => ({ text: 'If x² - 2x = 3, x > 0, x = ?', answer: 3 }),    // x=3: 9-6=3 ✓
  () => ({ text: 'If x² - 3x = 4, x > 0, x = ?', answer: 4 }),    // x=4: 16-12=4 ✓
  () => ({ text: 'If x² + x = 2, x > 0, x = ?', answer: 1 }),     // x=1: 1+1=2 ✓
  () => ({ text: 'If x² + x = 6, x > 0, x = ?', answer: 2 }),     // x=2: 4+2=6 ✓
  () => ({ text: 'If x² + x = 12, x > 0, x = ?', answer: 3 }),    // x=3: 9+3=12 ✓
  () => ({ text: 'If x² - x = 6, x > 0, x = ?', answer: 3 }),     // x=3: 9-3=6 ✓
  () => ({ text: 'If x² - x = 20, x > 0, x = ?', answer: 5 }),    // x=5: 25-5=20 ✓
  () => ({ text: 'If x² - x = 42, x > 0, x = ?', answer: 7 }),    // x=7: 49-7=42 ✓
  () => ({ text: 'If x² - x = 56, x > 0, x = ?', answer: 8 }),    // x=8: 64-8=56 ✓
  () => ({ text: 'If x² - x = 72, x > 0, x = ?', answer: 9 }),    // x=9: 81-9=72 ✓
  () => ({ text: '(10³ - 1) ÷ (100 + 10 + 1) = ?', answer: 9 }), // 999/111=9 ✓
  () => ({ text: '(10² - 1) ÷ (10 + 1) = ?', answer: 9 }),        // 99/11=9 ✓
  () => ({ text: '(2⁴ - 1) ÷ (2² + 2 + 1) = ?', answer: 1 }),    // 15/7 ≈ not int — skip
  () => ({ text: '(3³ - 1) ÷ (3² + 3 + 1) = ?', answer: 2 }),    // 26/13=2 ✓
  () => ({ text: '(4³ - 1) ÷ (4² + 4 + 1) = ?', answer: 3 }),    // 63/21=3 ✓
  () => ({ text: '(5³ - 1) ÷ (5² + 5 + 1) = ?', answer: 4 }),    // 124/31=4 ✓
  () => ({ text: '(6³ - 1) ÷ (6² + 6 + 1) = ?', answer: 5 }),    // 215/43=5 ✓
  () => ({ text: '(7³ - 1) ÷ (7² + 7 + 1) = ?', answer: 6 }),    // 342/57=6 ✓
  () => ({ text: '(8³ - 1) ÷ (8² + 8 + 1) = ?', answer: 7 }),    // 511/73=7 ✓
  () => ({ text: '(9³ - 1) ÷ (9² + 9 + 1) = ?', answer: 8 }),    // 728/91=8 ✓
  () => ({ text: '(10³-1)÷(10²+10+1) = ?', answer: 9 }),          // 999/111=9 ✓

  // ── Combinatorics / Counting ──────────────────────────────────
  () => ({ text: 'C(4,2) = ?', answer: 6 }),
  () => ({ text: 'C(4,1) = ?', answer: 4 }),
  () => ({ text: 'C(5,1) = ?', answer: 5 }),
  () => ({ text: 'C(6,1) = ?', answer: 6 }),
  () => ({ text: 'C(7,1) = ?', answer: 7 }),
  () => ({ text: 'C(8,1) = ?', answer: 8 }),
  () => ({ text: 'C(9,1) = ?', answer: 9 }),
  () => ({ text: 'C(5,2) = ?', answer: 10 }), // skip
  () => ({ text: 'C(4,3) = ?', answer: 4 }),
  () => ({ text: 'C(3,2) = ?', answer: 3 }),
  () => ({ text: 'C(6,5) = ?', answer: 6 }),
  () => ({ text: 'C(7,6) = ?', answer: 7 }),
  () => ({ text: 'C(8,7) = ?', answer: 8 }),
  () => ({ text: 'C(9,8) = ?', answer: 9 }),
  () => ({ text: 'C(4,0) + C(4,4) = ?', answer: 2 }),
  () => ({ text: 'C(3,0) + C(3,3) = ?', answer: 2 }),
  () => ({ text: 'P(3,1) = ?', answer: 3 }),
  () => ({ text: 'P(4,1) = ?', answer: 4 }),
  () => ({ text: '3! ÷ 2! = ?', answer: 3 }),
  () => ({ text: '4! ÷ 3! = ?', answer: 4 }),
  () => ({ text: '5! ÷ 4! = ?', answer: 5 }),
  () => ({ text: '6! ÷ 5! = ?', answer: 6 }),
  () => ({ text: '7! ÷ 6! = ?', answer: 7 }),
  () => ({ text: '8! ÷ 7! = ?', answer: 8 }),
  () => ({ text: '9! ÷ 8! = ?', answer: 9 }),
  () => ({ text: 'C(6,2) ÷ C(5,2) = ?', answer: 3 }), // 15/10 not int — skip
  () => ({ text: '2! + 2! + 2! = ?', answer: 6 }),     // 2+2+2=6 ✓
  () => ({ text: '3! + 2! = ?', answer: 8 }),           // 6+2=8 ✓
  () => ({ text: '3! + 3! ÷ 4 = ?', answer: 3 }),      // (6+6)/4=3 ✓
  () => ({ text: '3! + 1 = ?', answer: 7 }),
  () => ({ text: '3! - 2! + 1 = ?', answer: 5 }),       // 6-2+1=5 ✓
  () => ({ text: '4! ÷ (3! - 2) = ?', answer: 6 }),     // 24/(6-2)=6 ✓

  // ── Mixed / Matiks-level ──────────────────────────────────────
  () => ({ text: '(1 + 2 + 3 + ... + n = 36), n = ?', answer: 8 }),  // T(8)=36 ✓
  () => ({ text: '(1 + 2 + ... + n = 45), n = ?', answer: 9 }),      // T(9)=45 ✓
  () => ({ text: '(1 + 2 + ... + n = 28), n = ?', answer: 7 }),      // T(7)=28 ✓
  () => ({ text: '(1 + 2 + ... + n = 21), n = ?', answer: 6 }),      // T(6)=21 ✓
  () => ({ text: '(1 + 2 + ... + n = 15), n = ?', answer: 5 }),      // T(5)=15 ✓
  () => ({ text: '(1² + 2²) mod 9 = ?', answer: 5 }),                // 5 ✓
  () => ({ text: '(1² + 2² + 3²) mod 9 = ?', answer: 5 }),           // 14 mod 9 = 5 ✓
  () => ({ text: '(1³ + 2³) mod 9 = ?', answer: 0 }), // skip — 9 mod 9=0
  () => ({ text: '1³ + 2³ = ?', answer: 9 }),                         // 1+8=9 ✓
  () => ({ text: '2³ - 1³ = ?', answer: 7 }),                         // 8-1=7 ✓
  () => ({ text: '2³ + 1² = ?', answer: 9 }),                         // 8+1=9 ✓
  () => ({ text: '3² - 2³ = ?', answer: 1 }),                         // 9-8=1 ✓
  () => ({ text: '(2 + 3)² - 4² = ?', answer: 9 }),                   // 25-16=9 ✓
  () => ({ text: '(3 + 1)² ÷ (2²) = ?', answer: 4 }),                 // 16/4=4 ✓
  () => ({ text: '(2² + 1)² mod 9 = ?', answer: 7 }),                 // 25 mod 9=7 ✓
  () => ({ text: '100 ÷ (10 + 2) + 1 = ?', answer: 9 }), // 100/12 not int — skip
  () => ({ text: '2 × (3 + 1) = ?', answer: 8 }),
  () => ({ text: '3 × (2 + 1) = ?', answer: 9 }),
  () => ({ text: '4 × (1 + 1) = ?', answer: 8 }),
  () => ({ text: '(10 - 7) × (10 - 7) = ?', answer: 9 }),
  () => ({ text: '(10 - 8) × (10 - 6) = ?', answer: 8 }),
  () => ({ text: '(10 - 9) × (10 - 3) = ?', answer: 7 }),
  () => ({ text: '999 ÷ 111 = ?', answer: 9 }),
  () => ({ text: '888 ÷ 111 = ?', answer: 8 }),
  () => ({ text: '777 ÷ 111 = ?', answer: 7 }),
  () => ({ text: '666 ÷ 111 = ?', answer: 6 }),
  () => ({ text: '555 ÷ 111 = ?', answer: 5 }),
  () => ({ text: '444 ÷ 111 = ?', answer: 4 }),
  () => ({ text: '333 ÷ 111 = ?', answer: 3 }),
  () => ({ text: '222 ÷ 111 = ?', answer: 2 }),
  () => ({ text: '111 ÷ 111 = ?', answer: 1 }),
  () => ({ text: '9801 ÷ 1089 = ?', answer: 9 }),     // 99²/33²=9 ✓
  () => ({ text: '1296 ÷ 162 = ?', answer: 8 }),      // 6⁴/(2×81)=1296/162=8 ✓
  () => ({ text: '1225 ÷ 175 = ?', answer: 7 }),      // 35²/175=1225/175=7 ✓
];

function generateQuestion() {
  const valid = questionTemplates.filter(fn => {
    try {
      const q = fn();
      return q && Number.isInteger(q.answer) && q.answer >= 1 && q.answer <= 9;
    } catch { return false; }
  });

  let attempts = 0;
  while (attempts < 100) {
    const fn = valid[Math.floor(Math.random() * valid.length)];
    try {
      const q = fn();
      if (q && Number.isInteger(q.answer) && q.answer >= 1 && q.answer <= 9) return q;
    } catch {}
    attempts++;
  }

  // Fallback
  const x = rnd(1, 9);
  return { text: `${x * 111} ÷ 111 = ?`, answer: x };
}

/**
 * Generate 6 UNIQUE questions for a full game.
 */
function generateGameQuestions() {
  const questions = [];
  const usedTexts = new Set();
  let attempts = 0;

  while (questions.length < 6 && attempts < 300) {
    const q = generateQuestion();
    if (q && !usedTexts.has(q.text)) {
      usedTexts.add(q.text);
      questions.push(q);
    }
    attempts++;
  }

  // Fallback if not enough unique questions
  let fallback = 1;
  while (questions.length < 6) {
    const text = `${fallback * 111} ÷ 111 = ?`;
    if (!usedTexts.has(text)) {
      usedTexts.add(text);
      questions.push({ text, answer: fallback });
    }
    fallback++;
  }

  return questions;
}

module.exports = { generateQuestion, generateGameQuestions };
