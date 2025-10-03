# Deployment Guide

## Setting up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your database connection string (it looks like: `postgresql://username:password@hostname:port/database?sslmode=require`)

## Setting up Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. In your project settings, go to "Environment Variables"
4. Add the following environment variable:
   - `DATABASE_URL`: Your Neon database connection string

## Deploying

1. Push your code to GitHub
2. Vercel will automatically deploy
3. After deployment, visit: `https://your-app.vercel.app/api/init-db` (POST request) to initialize the database
4. Your posts will now be stored in the Neon database and visible to all users!

## Testing

1. Create a post as admin
2. Open the app in an incognito window or different browser
3. The post should be visible to everyone

## Troubleshooting

- Make sure your Neon database is accessible
- Check that the DATABASE_URL environment variable is set correctly in Vercel
- Ensure the database initialization API call was successful
