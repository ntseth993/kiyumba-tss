const db = require('./db');

// Adapted to the current applications table schema (uses full_name and education_level)
async function listApplicants() {
  try {
    const res = await db.query(
      `SELECT id, full_name, email, phone, program, level, education_level, status, created_at
       FROM applications
       ORDER BY created_at DESC`
    );
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Query error', err);
    process.exit(1);
  }
}

listApplicants();
