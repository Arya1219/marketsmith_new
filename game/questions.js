// game/questions.js
// Generates 6 unique questions per game — answers are single digits 1-9
// Focus: math, modulo, XOR, LCM, HCF, powers, roots, number theory, etc.

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

const questionTemplates = [
  // ── Basic Arithmetic / Exact Division ─────────────────────────
  () => {
    const x = rnd(1, 9), d = rnd(2, 9);
    return { text: `${x * d} ÷ ${d} = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `${x * 111} ÷ 111 = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `${x * 37} ÷ 37 = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `${x * 13} ÷ 13 = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `${x * 17} ÷ 17 = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `${x * 23} ÷ 23 = ?`, answer: x };
  },
  () => {
    const a = rnd(20, 50);
    const ans = rnd(1, 9);
    const b = a - ans;
    return { text: `${a} - ${b} = ?`, answer: ans };
  },
  () => {
    const a = rnd(50, 90);
    const ans = rnd(1, 9);
    const b = a - ans;
    return { text: `${a} - ${b} = ?`, answer: ans };
  },
  () => {
    const a = rnd(100, 200), b = rnd(10, 50);
    const ans = (a + b) % 9 || 9;
    return { text: `Digital root of ${a} + ${b} = ?`, answer: ans };
  },

  // ── Powers & Roots ────────────────────────────────────────────
  () => ({ text: '√(3² + 4²) - 1 = ?', answer: 4 }),
  () => ({ text: '√(5² + 12²) - 4 = ?', answer: 9 }),
  () => ({ text: '√(6² + 8²) ÷ 2 = ?', answer: 5 }),
  () => ({ text: '∛(27 × 8) ÷ 2 = ?', answer: 3 }),
  () => ({ text: '2⁸ ÷ 32 = ?', answer: 8 }),
  () => ({ text: '3⁴ ÷ 27 = ?', answer: 3 }),
  () => ({ text: '2¹⁰ ÷ 128 = ?', answer: 8 }),
  () => ({ text: '4³ ÷ 16 = ?', answer: 4 }),
  () => ({ text: '5² ÷ 5 = ?', answer: 5 }),
  () => ({ text: '6² ÷ 12 = ?', answer: 3 }),
  () => ({ text: '7² - 43 = ?', answer: 6 }),
  () => ({ text: '8² - 57 = ?', answer: 7 }),
  () => ({ text: '9² - 74 = ?', answer: 7 }),
  () => ({ text: '10² - 91 = ?', answer: 9 }),
  () => ({ text: '11² - 113 = ?', answer: 8 }),
  () => ({ text: '12² - 139 = ?', answer: 5 }),
  () => ({ text: '13² - 165 = ?', answer: 4 }),
  () => ({ text: 'Last digit of 7¹³ = ?', answer: 7 }),
  () => ({ text: 'Last digit of 3¹¹ = ?', answer: 7 }),
  () => ({ text: 'Last digit of 9⁹ = ?', answer: 9 }),
  () => ({ text: 'Trailing zeros in 25! = ?', answer: 6 }),
  () => ({ text: 'Trailing zeros in 30! = ?', answer: 7 }),
  () => ({ text: 'Trailing zeros in 40! = ?', answer: 9 }),

  // ── Mod / Digital Root Style ──────────────────────────────────
  () => ({ text: 'Digital root of 1234 = ?', answer: 1 }),
  () => ({ text: 'Digital root of 5678 = ?', answer: 8 }),
  () => ({ text: 'Digital root of 9876 = ?', answer: 3 }),
  () => ({ text: 'Digital root of 2025 = ?', answer: 9 }),
  () => ({ text: 'Digital root of 1729 = ?', answer: 1 }),
  () => ({ text: 'Digital root of 3141 = ?', answer: 9 }),
  () => ({ text: 'Digital root of 2718 = ?', answer: 9 }),
  () => ({ text: 'Digital root of 512 = ?', answer: 8 }),
  () => ({ text: 'Digital root of 729 = ?', answer: 9 }),
  () => ({ text: 'Digital root of 100 = ?', answer: 1 }),
  () => ({ text: '100 mod 9 = ?', answer: 1 }),
  () => ({ text: '101 mod 4 = ?', answer: 1 }),
  () => ({ text: '256 mod 9 = ?', answer: 4 }),
  () => ({ text: '1000 mod 9 = ?', answer: 1 }),
  () => ({ text: '100 mod 7 = ?', answer: 2 }),
  () => ({ text: '200 mod 9 = ?', answer: 2 }),
  () => ({ text: '123 mod 9 = ?', answer: 6 }),
  () => ({ text: '321 mod 9 = ?', answer: 6 }),
  () => ({ text: '777 mod 9 = ?', answer: 3 }),
  () => ({ text: '999 mod 7 = ?', answer: 5 }),
  () => ({ text: '1000 mod 7 = ?', answer: 6 }),
  () => ({ text: '512 mod 9 = ?', answer: 8 }),
  () => ({ text: '2024 mod 9 = ?', answer: 8 }),
  () => ({ text: '1729 mod 9 = ?', answer: 1 }),
  () => ({ text: '97 mod 9 = ?', answer: 7 }),
  () => ({ text: '64 mod 9 = ?', answer: 1 }),
  () => ({ text: '128 mod 9 = ?', answer: 2 }),
  () => ({ text: '255 mod 9 = ?', answer: 3 }),
  () => ({ text: '343 mod 9 = ?', answer: 1 }),
  () => ({ text: '100 mod 13 = ?', answer: 9 }),
  () => ({ text: '200 mod 13 = ?', answer: 5 }),
  () => ({ text: '500 mod 7 = ?', answer: 3 }),
  () => ({ text: '360 mod 7 = ?', answer: 3 }),
  () => ({ text: '1024 mod 9 = ?', answer: 7 }),
  () => ({ text: '4096 mod 9 = ?', answer: 1 }),
  () => ({ text: '2³² mod 9 = ?', answer: 7 }),
  () => ({ text: '999 mod 8 = ?', answer: 7 }),
  () => ({ text: '1001 mod 8 = ?', answer: 1 }),
  () => ({ text: '10000 mod 9 = ?', answer: 1 }),

  // ── XOR ───────────────────────────────────────────────────────
  () => ({ text: '15 XOR 14 = ?', answer: 1 }),
  () => ({ text: '12 XOR 10 = ?', answer: 6 }),
  () => ({ text: '15 XOR 8 = ?', answer: 7 }),
  () => ({ text: '13 XOR 12 = ?', answer: 1 }),
  () => ({ text: '14 XOR 9 = ?', answer: 7 }),
  () => ({ text: '10 XOR 11 = ?', answer: 1 }),
  () => ({ text: '13 XOR 9 = ?', answer: 4 }),
  () => ({ text: '12 XOR 15 = ?', answer: 3 }),
  () => ({ text: '14 XOR 12 = ?', answer: 2 }),
  () => ({ text: '11 XOR 14 = ?', answer: 5 }),
  () => ({ text: '100 XOR 97 = ?', answer: 5 }),
  () => ({ text: '63 XOR 60 = ?', answer: 3 }),
  () => ({ text: '31 XOR 28 = ?', answer: 3 }),
  () => ({ text: '255 XOR 254 = ?', answer: 1 }),
  () => ({ text: '127 XOR 124 = ?', answer: 3 }),
  () => ({ text: '48 XOR 57 = ?', answer: 9 }),
  () => ({ text: '77 XOR 74 = ?', answer: 7 }),
  () => ({ text: '200 XOR 206 = ?', answer: 6 }),
  () => ({ text: '13 XOR 11 = ?', answer: 6 }),

  // ── GCD / HCF / LCM ───────────────────────────────────────────
  () => ({ text: 'HCF(72, 63) = ?', answer: 9 }),
  () => ({ text: 'HCF(56, 49) = ?', answer: 7 }),
  () => ({ text: 'HCF(96, 88) = ?', answer: 8 }),
  () => ({ text: 'HCF(45, 36) = ?', answer: 9 }),
  () => ({ text: 'HCF(63, 54) = ?', answer: 9 }),
  () => ({ text: 'HCF(72, 56) = ?', answer: 8 }),
  () => ({ text: 'HCF(35, 28) = ?', answer: 7 }),
  () => ({ text: 'HCF(42, 35) = ?', answer: 7 }),
  () => ({ text: 'HCF(54, 45) = ?', answer: 9 }),
  () => ({ text: 'HCF(64, 56) = ?', answer: 8 }),
  () => ({ text: 'GCD(144, 81) = ?', answer: 9 }),
  () => ({ text: 'GCD(48, 40) = ?', answer: 8 }),
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
  () => ({ text: 'LCM(8, 24) ÷ 24 = ?', answer: 1 }),
  () => ({ text: 'LCM(6, 8) ÷ 8 = ?', answer: 3 }),

  // ── Number Theory / Counting ──────────────────────────────────
  () => ({ text: 'How many prime numbers are between 1 and 15?', answer: 6 }),
  () => ({ text: 'How many prime numbers are between 1 and 20?', answer: 8 }),
  () => ({ text: 'How many prime numbers are between 1 and 25?', answer: 9 }),
  () => ({ text: 'How many factors does 64 have?', answer: 7 }),
  () => ({ text: 'How many factors does 36 have?', answer: 9 }),
  () => ({ text: 'How many factors does 100 have?', answer: 9 }),
  () => ({ text: 'How many factors does 81 have?', answer: 5 }),
  () => ({ text: 'How many prime factors does 60 have? (unique)', answer: 3 }),
  () => ({ text: 'How many prime factors does 2310 have? (unique)', answer: 5 }),
  () => ({ text: 'How many prime factors does 30 have? (unique)', answer: 3 }),
  () => ({ text: 'How many prime factors does 210 have? (unique)', answer: 4 }),
  () => ({ text: 'Euler\'s totient φ(9) = ?', answer: 6 }),
  () => ({ text: 'Euler\'s totient φ(7) = ?', answer: 6 }),
  () => ({ text: 'Euler\'s totient φ(5) = ?', answer: 4 }),
  () => ({ text: 'Euler\'s totient φ(8) = ?', answer: 4 }),
  () => ({ text: 'Euler\'s totient φ(10) = ?', answer: 4 }),
  () => ({ text: 'Euler\'s totient φ(12) = ?', answer: 4 }),
  () => ({ text: 'Euler\'s totient φ(14) = ?', answer: 6 }),
  () => ({ text: 'Euler\'s totient φ(15) = ?', answer: 8 }),
  () => ({ text: 'Euler\'s totient φ(16) = ?', answer: 8 }),
  () => ({ text: 'Euler\'s totient φ(18) = ?', answer: 6 }),
  () => ({ text: 'How many integers from 1–9 are coprime to 10?', answer: 4 }),
  () => ({ text: 'Sum of all prime factors of 12 (with repeats) = ?', answer: 7 }),
  () => ({ text: 'Sum of all prime factors of 18 (with repeats) = ?', answer: 8 }),
  () => ({ text: 'Sum of all prime factors of 8 (with repeats) = ?', answer: 6 }),
  () => ({ text: 'Sum of all prime factors of 27 (with repeats) = ?', answer: 9 }),
  () => ({ text: 'Sum of all prime factors of 4 (with repeats) = ?', answer: 4 }),
  () => ({ text: 'Smallest prime > 6 = ?', answer: 7 }),
  () => ({ text: 'Largest prime < 10 = ?', answer: 7 }),
  () => ({ text: 'Largest prime < 5 = ?', answer: 3 }),
  () => ({ text: 'How many divisors does 54 have?', answer: 8 }),
  () => ({ text: 'How many divisors does 45 have?', answer: 6 }),
  () => ({ text: 'How many divisors does 49 have?', answer: 3 }),

  // ── Fibonacci / Sequences ─────────────────────────────────────
  () => ({ text: 'F(5) + F(3) = ? (Fibonacci)', answer: 8 }),
  () => ({ text: 'F(6) - F(4) = ? (Fibonacci)', answer: 5 }),
  () => ({ text: 'F(4) + F(2) = ? (Fibonacci)', answer: 4 }),
  () => ({ text: 'F(5) - F(2) = ? (Fibonacci)', answer: 4 }),
  () => ({ text: 'F(6) ÷ F(3) = ? (Fibonacci)', answer: 4 }),
  () => ({ text: 'F(3) × F(2) = ? (Fibonacci)', answer: 2 }),
  () => ({ text: 'F(4) × F(2) = ? (Fibonacci)', answer: 3 }),
  () => ({ text: 'GCD(F(6), F(4)) = ? (Fibonacci)', answer: 1 }),
  () => ({ text: 'F(10) mod 9 = ? (Fibonacci)', answer: 1 }),
  () => ({ text: '1, 2, 3, 5, 8, 13 → 13 mod 9 = ?', answer: 4 }),
  () => ({ text: 'T(3) = 1 + 2 + 3 = ?', answer: 6 }),
  () => ({ text: 'T(4) - T(3) = ?', answer: 4 }),
  () => ({ text: 'T(2) + T(3) = ?', answer: 9 }),
  () => ({ text: '(1 + 2 + 3 + ... + n = 15), n = ?', answer: 5 }),
  () => ({ text: '(1 + 2 + 3 + ... + n = 21), n = ?', answer: 6 }),
  () => ({ text: '(1 + 2 + 3 + ... + n = 28), n = ?', answer: 7 }),
  () => ({ text: '(1 + 2 + 3 + ... + n = 36), n = ?', answer: 8 }),
  () => ({ text: '(1 + 2 + 3 + ... + n = 45), n = ?', answer: 9 }),

  // ── Algebra / Equations ───────────────────────────────────────
  () => {
    const x = rnd(1, 9);
    return { text: `If 7x = ${7 * x}, then x = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `If 11x = ${11 * x}, then x = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `If 13x = ${13 * x}, then x = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `If 17x = ${17 * x}, then x = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `If 19x = ${19 * x}, then x = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `${100 + x} - 100 = ?`, answer: x };
  },
  () => {
    const x = rnd(1, 9);
    return { text: `${1000 + x} - 1000 = ?`, answer: x };
  },
  () => ({ text: 'If x² + 2x = 24, x > 0, x = ?', answer: 4 }),
  () => ({ text: 'If x² - 2x = 3, x > 0, x = ?', answer: 3 }),
  () => ({ text: 'If x² - 3x = 4, x > 0, x = ?', answer: 4 }),
  () => ({ text: 'If x² + x = 2, x > 0, x = ?', answer: 1 }),
  () => ({ text: 'If x² + x = 6, x > 0, x = ?', answer: 2 }),
  () => ({ text: 'If x² + x = 12, x > 0, x = ?', answer: 3 }),
  () => ({ text: 'If x² - x = 6, x > 0, x = ?', answer: 3 }),
  () => ({ text: 'If x² - x = 20, x > 0, x = ?', answer: 5 }),
  () => ({ text: 'If x² - x = 42, x > 0, x = ?', answer: 7 }),
  () => ({ text: 'If x² - x = 56, x > 0, x = ?', answer: 8 }),
  () => ({ text: 'If x² - x = 72, x > 0, x = ?', answer: 9 }),
  () => ({ text: '(10³ - 1) ÷ (100 + 10 + 1) = ?', answer: 9 }),
  () => ({ text: '(10² - 1) ÷ (10 + 1) = ?', answer: 9 }),
  () => ({ text: '(3³ - 1) ÷ (3² + 3 + 1) = ?', answer: 2 }),
  () => ({ text: '(4³ - 1) ÷ (4² + 4 + 1) = ?', answer: 3 }),
  () => ({ text: '(5³ - 1) ÷ (5² + 5 + 1) = ?', answer: 4 }),
  () => ({ text: '(6³ - 1) ÷ (6² + 6 + 1) = ?', answer: 5 }),
  () => ({ text: '(7³ - 1) ÷ (7² + 7 + 1) = ?', answer: 6 }),
  () => ({ text: '(8³ - 1) ÷ (8² + 8 + 1) = ?', answer: 7 }),
  () => ({ text: '(9³ - 1) ÷ (9² + 9 + 1) = ?', answer: 8 }),
  () => ({ text: '(10³ - 1) ÷ (10² + 10 + 1) = ?', answer: 9 }),

  // ── Combinatorics / Counting ──────────────────────────────────
  () => ({ text: 'C(4,2) = ?', answer: 6 }),
  () => ({ text: 'C(4,1) = ?', answer: 4 }),
  () => ({ text: 'C(5,1) = ?', answer: 5 }),
  () => ({ text: 'C(6,1) = ?', answer: 6 }),
  () => ({ text: 'C(7,1) = ?', answer: 7 }),
  () => ({ text: 'C(8,1) = ?', answer: 8 }),
  () => ({ text: 'C(9,1) = ?', answer: 9 }),
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
  () => ({ text: '2! + 2! + 2! = ?', answer: 6 }),
  () => ({ text: '3! + 2! = ?', answer: 8 }),
  () => ({ text: '3! - 2! + 1 = ?', answer: 5 }),
  () => ({ text: '4! ÷ (3! - 2) = ?', answer: 6 }),

  // ── Mixed / Matiks-style ──────────────────────────────────────
  () => ({ text: '(1² + 2²) mod 9 = ?', answer: 5 }),
  () => ({ text: '(1² + 2² + 3²) mod 9 = ?', answer: 5 }),
  () => ({ text: '1³ + 2³ = ?', answer: 9 }),
  () => ({ text: '2³ - 1³ = ?', answer: 7 }),
  () => ({ text: '2³ + 1² = ?', answer: 9 }),
  () => ({ text: '3² - 2³ = ?', answer: 1 }),
  () => ({ text: '(2 + 3)² - 4² = ?', answer: 9 }),
  () => ({ text: '(3 + 1)² ÷ (2²) = ?', answer: 4 }),
  () => ({ text: '(2² + 1)² mod 9 = ?', answer: 7 }),
  () => ({ text: '2 × (3 + 1) = ?', answer: 8 }),
  () => ({ text: '3 × (2 + 1) = ?', answer: 9 }),
  () => ({ text: '4 × (1 + 1) = ?', answer: 8 }),
  () => ({ text: '(10 - 7) × (10 - 7) = ?', answer: 9 }),
  () => ({ text: '(10 - 8) × (10 - 6) = ?', answer: 8 }),
  () => ({ text: '(10 - 9) × (10 - 3) = ?', answer: 7 }),
  () => ({ text: '9801 ÷ 1089 = ?', answer: 9 }),
  () => ({ text: '1296 ÷ 162 = ?', answer: 8 }),
  () => ({ text: '1225 ÷ 175 = ?', answer: 7 }),
  () => ({ text: 'How many divisors does 54 have?', answer: 8 }),
  () => ({ text: 'How many divisors does 45 have?', answer: 6 }),
  () => ({ text: 'How many divisors does 49 have?', answer: 3 }),
];

function generateQuestion() {
  const valid = questionTemplates.filter(fn => {
    try {
      const q = fn();
      return q && Number.isInteger(q.answer) && q.answer >= 1 && q.answer <= 9;
    } catch {
      return false;
    }
  });

  let attempts = 0;
  while (attempts < 100) {
    const fn = valid[Math.floor(Math.random() * valid.length)];
    try {
      const q = fn();
      if (q && Number.isInteger(q.answer) && q.answer >= 1 && q.answer <= 9) {
        return q;
      }
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
