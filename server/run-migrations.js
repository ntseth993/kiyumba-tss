const fs = require('fs');
const path = require('path');
const db = require('./db');

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_applications_table.sql'), 'utf8');
    await db.query(sql);
    console.log('Migrations applied');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
}

run();
