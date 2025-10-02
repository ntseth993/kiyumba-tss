const db = require('./db');

async function listColumns() {
  try {
    const res = await db.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'applications'
       ORDER BY ordinal_position`
    );
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('INTROSPECTION ERROR', err);
    process.exit(1);
  }
}

listColumns();
