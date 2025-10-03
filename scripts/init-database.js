// Simple script to initialize the database after deployment
// Run this after your Vercel deployment is complete

const API_URL = process.env.VITE_API_BASE || 'https://your-app.vercel.app/api';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    const response = await fetch(`${API_URL}/init-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Database initialized successfully!');
      console.log('Your posts will now be visible to all users.');
    } else {
      console.error('❌ Database initialization failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
}

// Run if this script is executed directly
if (typeof window === 'undefined') {
  initializeDatabase();
}

export { initializeDatabase };
