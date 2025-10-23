const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import and use API routes
const postsHandler = require('./api/posts.js');
const usersHandler = require('./api/users.js');
const authHandler = require('./api/auth/login.js');
const registerHandler = require('./api/auth/register.js');

// Mount API routes
app.use('/api/posts', postsHandler);
app.use('/api/users', usersHandler);
app.use('/api/auth/login', authHandler);
app.use('/api/auth/register', registerHandler);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3023;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
