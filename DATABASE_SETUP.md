# Neon Database Setup Guide

This guide will help you set up the Neon PostgreSQL database for the Kiyumba Technical School website.

## Prerequisites

- A Neon account (sign up at https://neon.tech)
- Node.js installed on your machine

## Step 1: Create a Neon Database

1. Go to https://console.neon.tech
2. Click "Create Project" or "New Project"
3. Name your project: `kiyumba-school` or `neon-amber-school`
4. Select a region (choose the closest to your users)
5. Click "Create Project"

## Step 2: Get Your Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details" or "Dashboard"
3. Copy the connection string (it should look like this):
   ```
   postgresql://neondb_owner:xxxxx@ep-amber-school-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Configure Environment Variables

1. Open the `.env` file in the project root
2. Paste your connection string:
   ```
   VITE_DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-amber-school-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save the file

## Step 4: Initialize the Database

Run the initialization script to create the required tables:

```bash
node src/scripts/initDb.js
```

This will create the following tables:
- **posts** - For blog posts and announcements
- **users** - For user authentication
- **applications** - For student applications

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in as admin:
   - Email: `admin@kiyumba.com`
   - Password: `admin123`

3. Go to "Content Management" and create a test post
4. Check if the post appears on the home page

## Deployment to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variable:
   - Key: `VITE_DATABASE_URL`
   - Value: Your Neon connection string
5. Deploy!

## Fallback Mode

If no database connection string is provided, the app will automatically fall back to using `localStorage`. This is useful for:
- Local development without a database
- Testing
- Offline mode

## Database Schema

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  image_url TEXT,
  video_url TEXT,
  text_size VARCHAR(20) DEFAULT 'medium',
  visible BOOLEAN DEFAULT true,
  author VARCHAR(100) DEFAULT 'Admin',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Applications Table
```sql
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  program VARCHAR(100) NOT NULL,
  level VARCHAR(10) NOT NULL,
  education_level VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Connection Error
- Verify your connection string is correct
- Check if your IP is whitelisted in Neon (Neon allows all IPs by default)
- Ensure `?sslmode=require` is at the end of the connection string

### Tables Not Created
- Run the init script again: `node src/scripts/initDb.js`
- Check the Neon dashboard SQL Editor to verify tables exist

### Data Not Persisting
- Check browser console for errors
- Verify the database connection string is set
- Check if the app is using fallback mode (localStorage)

## Support

For issues or questions:
- Neon Documentation: https://neon.tech/docs
- Project Issues: Create an issue on GitHub
