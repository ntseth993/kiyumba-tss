import { initDatabase } from '../lib/db.js';

// Run database initialization
console.log('Initializing database...');

initDatabase()
  .then((success) => {
    if (success) {
      console.log('✅ Database initialized successfully!');
      console.log('Tables created:');
      console.log('  - posts');
      console.log('  - users');
      console.log('  - applications');
    } else {
      console.log('⚠️  Database initialization skipped (no connection string)');
      console.log('The app will use localStorage as fallback.');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
