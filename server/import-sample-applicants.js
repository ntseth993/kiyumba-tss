const db = require('./db');

async function importSamples() {
  try {
    const samples = [
      {
        full_name: 'nt seth',
        email: 'ntseth@gmail.com',
        phone: null,
        program: 'software',
        level: 'L3',
        education_level: null,
        status: 'approved',
        created_at: new Date('2025-09-30T12:00:00Z')
      },
      {
        full_name: 'didie iraliza',
        email: 'ntset3h@gmail.com',
        phone: null,
        program: 'fashion',
        level: 'L4',
        education_level: null,
        status: 'approved',
        created_at: new Date('2025-10-02T12:00:00Z')
      }
    ];

    for (const s of samples) {
      const res = await db.query(
        `INSERT INTO applications (full_name, email, phone, program, level, education_level, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [s.full_name, s.email, s.phone, s.program, s.level, s.education_level, s.status, s.created_at]
      );
      console.log('Inserted:', res.rows[0]);
    }

    process.exit(0);
  } catch (err) {
    console.error('Import error', err);
    process.exit(1);
  }
}

importSamples();
