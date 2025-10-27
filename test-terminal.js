import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: join(__dirname, '../.env') });

console.log('=== Terminal Test ===');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Database URL exists:', !!process.env.VITE_DATABASE_URL);
console.log('Database URL starts with:', process.env.VITE_DATABASE_URL?.substring(0, 20) + '...');
console.log('=== Test Complete ===');
