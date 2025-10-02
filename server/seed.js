const db = require('./db');

async function seed() {
  try {
    const res = await db.query(
      `INSERT INTO applications (first_name, last_name, email, phone, program, level, address, date_of_birth, previous_school, reason, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending') RETURNING *`,
      ['Test', 'Applicant', 'test.applicant@example.com', '0788000000', 'software', 'L4', 'Kigali', '2006-01-01', 'Test School', 'I want to learn',]
    );
    console.log('Seed inserted:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
