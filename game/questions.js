// game/questions.js
// Generates questions where the answer is a single digit 1-9

const questionTemplates = [
  // Arithmetic
  () => { const a = rnd(1,5), b = rnd(1,4); return { text: `What is ${a} + ${b}?`, answer: a + b }; },
  () => { const a = rnd(5,9), b = rnd(1,4); return { text: `What is ${a} - ${b}?`, answer: a - b }; },
  () => { const a = rnd(2,3), b = rnd(2,3); return { text: `What is ${a} × ${b}?`, answer: a * b }; },

  // Number of something
  () => ({ text: 'How many days are in a week?', answer: 7 }),
  () => ({ text: 'How many sides does an octagon have?', answer: 8 }),
  () => ({ text: 'How many sides does a hexagon have?', answer: 6 }),
  () => ({ text: 'How many sides does a pentagon have?', answer: 5 }),
  () => ({ text: 'How many legs does a spider have?', answer: 8 }),
  () => ({ text: 'How many players are on a basketball team on court?', answer: 5 }),
  () => ({ text: 'How many continents are there on Earth?', answer: 7 }),
  () => ({ text: 'How many wonders of the ancient world are there?', answer: 7 }),
  () => ({ text: 'How many colors are in a rainbow?', answer: 7 }),
  () => ({ text: 'How many strings does a standard guitar have?', answer: 6 }),
  () => ({ text: 'How many notes are in a musical octave?', answer: 8 }),
  () => ({ text: 'How many planets are in our solar system?', answer: 8 }),
  () => ({ text: 'How many fingers does a human hand have?', answer: 5 }),
  () => ({ text: 'How many vowels are in the English alphabet?', answer: 5 }),
  () => ({ text: 'How many innings are in a standard cricket test match per team?', answer: 2 }),
  () => ({ text: 'How many hearts does an octopus have?', answer: 3 }),
  () => ({ text: 'How many sides does a triangle have?', answer: 3 }),
  () => ({ text: 'How many zeros are in one billion?', answer: 9 }),
  () => ({ text: 'How many players are in a cricket team?', answer: 9 }),

  // Logic / sequences
  () => { const n = rnd(2,6); return { text: `What is the ${n}${suffix(n)} prime number?`, answer: [2,3,5,7,11,13][n-1] <= 9 ? [2,3,5,7,11,13][n-1] : null }; },
  () => { const nums = [1,1,2,3,5,8,9]; const i = rnd(1,5); return { text: `In Fibonacci sequence starting 1,1,2,3... what is the ${i+1}${suffix(i+1)} term?`, answer: nums[i] }; },
];

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function suffix(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

/**
 * Generate a single question with an answer between 1 and 9.
 */
function generateQuestion() {
  const valid = questionTemplates.filter(fn => {
    try {
      const q = fn();
      return q && q.answer >= 1 && q.answer <= 9;
    } catch { return false; }
  });

  let attempts = 0;
  while (attempts < 50) {
    const fn = valid[Math.floor(Math.random() * valid.length)];
    const q = fn();
    if (q && q.answer >= 1 && q.answer <= 9) {
      return { text: q.text, answer: q.answer };
    }
    attempts++;
  }

  // Fallback
  const a = rnd(1, 4), b = rnd(1, 5);
  return { text: `What is ${a} + ${b}?`, answer: a + b };
}

/**
 * Generate 6 questions for a full game.
 */
function generateGameQuestions() {
  const questions = [];
  for (let i = 0; i < 6; i++) {
    questions.push(generateQuestion());
  }
  return questions;
}

module.exports = { generateQuestion, generateGameQuestions };
