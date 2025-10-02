const db = require('./db');

async function seed() {
  try {
    // Insert a test applicant matching the current schema
    const res = await db.query(
      `INSERT INTO applications (full_name, email, phone, program, level, education_level, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      ['Test Applicant', 'test.applicant@example.com', '0788000000', 'Software Engineering', 'L4', 'Bachelors', 'pending']
    );
    console.log('Seed inserted:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
