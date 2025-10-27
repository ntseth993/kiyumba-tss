import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from '../lib/db.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the project root FIRST
dotenv.config({ path: join(__dirname, '../../.env') });

// Run database initialization
console.log('Initializing database...');
console.log('Database URL:', process.env.VITE_DATABASE_URL ? 'Found' : 'Not found');

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
