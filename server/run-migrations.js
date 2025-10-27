const fs = require('fs');
const path = require('path');
const db = require('./db');

async function run() {
  try {
    // Run applications table migration
    let sql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_applications_table.sql'), 'utf8');
    console.log('Running applications table migration...');
    await db.query(sql);
    console.log('✅ Applications table migration completed');

    // Run comments table migration
    sql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_comments_table.sql'), 'utf8');
    console.log('Running comments table migration...');
    await db.query(sql);
    console.log('✅ Comments table migration completed');

    // Run notifications table migration
    sql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_notifications_table.sql'), 'utf8');
    console.log('Running notifications table migration...');
    await db.query(sql);
    console.log('✅ Notifications table migration completed');

    // Run meetings table migration
    sql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_meetings_table.sql'), 'utf8');
    console.log('Running meetings table migration...');
    await db.query(sql);
    console.log('✅ Meetings table migration completed');

    console.log('✅ All migrations applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
