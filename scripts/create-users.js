// scripts/create-users.js
// One-time helper script to bulk-create participant accounts.
// Password format: first 4 letters of name (lowercase) + last 4 digits of phone
// Usage: node scripts/create-users.js
//
// Edit the `participants` array below, then run this script once.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const participants = [
  // { name: 'Arjun Sharma', email: 'arjun@example.com', phone: '9876543210' },
  // Add all participants here before running
];

function generatePassword(name, phone) {
  const namePart = name.replace(/\s/g, '').toLowerCase().substring(0, 4);
  const phonePart = phone.slice(-4);
  return namePart + phonePart;
}

async function main() {
  if (participants.length === 0) {
    console.log('No participants defined. Edit scripts/create-users.js and add participants first.');
    return;
  }

  for (const p of participants) {
    const password = generatePassword(p.name, p.phone);
    const hash = await bcrypt.hash(password, 10);
    const firstName = p.name.trim().split(' ')[0];

    const { error } = await supabase.from('users').insert({
      email: p.email.toLowerCase().trim(),
      password_hash: hash,
      first_name: firstName,
    });

    if (error) {
      console.error(`FAILED: ${p.email} — ${error.message}`);
    } else {
      console.log(`OK: ${p.email} — password: ${password}`);
    }
  }

  console.log('\nDone. Save the printed passwords and share with participants.');
}

main();
