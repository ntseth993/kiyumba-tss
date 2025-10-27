require('dotenv').config({ path: './.env' });

console.log('=== Database Init (CommonJS) ===');
console.log('Database URL:', process.env.VITE_DATABASE_URL ? 'Found (length: ' + process.env.VITE_DATABASE_URL.length + ')' : 'Not found');

if (!process.env.VITE_DATABASE_URL) {
  console.log('⚠️  No database URL found');
  console.log('✅ Using localStorage fallback mode');
  process.exit(0);
}

console.log('✅ Database URL found, attempting connection...');
console.log('Note: This script only checks configuration');
console.log('To actually create tables, run the ES modules version');
console.log('=== Init Complete ===');
