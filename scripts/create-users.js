// scripts/create-users.js
// Bulk-creates all participant accounts from participants.json,
// plus the admin account, using the pre-assigned credentials.
//
// Password format already baked into participants.json:
// first 4 letters of name (lowercase) + last 4 digits of phone
//
// Usage: node scripts/create-users.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

async function main() {
  const filePath = path.join(__dirname, 'participants.json');
  if (!fs.existsSync(filePath)) {
    console.log('participants.json not found in scripts/ folder.');
    return;
  }

  const participants = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Found ${participants.length} participants to create...\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of participants) {
    const email = p.email.toLowerCase().trim();

    // Skip if user already exists (safe to re-run this script)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      console.log(`SKIP (already exists): ${email}`);
      skipped++;
      continue;
    }

    const hash = await bcrypt.hash(p.password, 10);

    const { error } = await supabase.from('users').insert({
      email,
      password_hash: hash,
      first_name: p.name,
    });

    if (error) {
      console.error(`FAILED: ${email} — ${error.message}`);
      failed++;
    } else {
      console.log(`OK: ${email} (${p.name})`);
      created++;
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Failed: ${failed}`);
}

main();
