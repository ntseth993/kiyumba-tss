# Quick Start Guide - Neon Database Setup

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Neon Database URL

1. Go to **https://console.neon.tech**
2. Sign up or log in
3. Click **"Create Project"**
4. Name it: `kiyumba-school` or `neon-amber-school`
5. Click **"Create"**
6. Copy the connection string (looks like):
   ```
   postgresql://neondb_owner:xxxxx@ep-amber-school-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Add to Your Project

Open `.env` file and paste your connection string:

```env
VITE_DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-amber-school-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. Initialize Database

Run this command to create tables:

```bash
npm run db:init
```

You should see:
```
✅ Database initialized successfully!
Tables created:
  - posts
  - users
  - applications
```

### 4. Test It

```bash
npm run dev
```

1. Login as admin: `admin@kiyumba.com` / `admin123`
2. Go to "Content Management"
3. Create a post
4. Check the home page - your post should appear!

## 📦 Deploy to Vercel

1. Push to GitHub (already done ✅)
2. Go to **https://vercel.com**
3. Click **"Import Project"**
4. Select your GitHub repo
5. Add environment variable:
   - **Name**: `VITE_DATABASE_URL`
   - **Value**: Your Neon connection string
6. Click **"Deploy"**

## 🔄 Fallback Mode

**No database?** No problem! The app automatically uses `localStorage` if no database is configured. Perfect for:
- Local testing
- Development
- Offline mode

## 📝 What Changed?

### New Files Created:
- ✅ `src/lib/db.js` - Database connection
- ✅ `src/services/postsService.js` - Posts API
- ✅ `src/scripts/initDb.js` - Database setup script
- ✅ `.env.example` - Environment template
- ✅ `DATABASE_SETUP.md` - Detailed guide

### Updated Files:
- ✅ `src/pages/AdminContent.jsx` - Uses database API
- ✅ `src/pages/Home.jsx` - Loads posts from database
- ✅ `src/pages/AdminDashboard.jsx` - Real-time stats
- ✅ `package.json` - Added `db:init` script
- ✅ `.gitignore` - Protects `.env` file

## 🎯 Features

### Smart Fallback System
```javascript
// Automatically detects if database is available
// Falls back to localStorage if not
const posts = await getPosts(); // Works either way!
```

### Database Tables

**Posts Table** - Stores all blog posts and announcements
**Users Table** - User authentication (future)
**Applications Table** - Student applications (future)

## ⚡ Commands

```bash
# Start development server
npm run dev

# Initialize database
npm run db:init

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🆘 Troubleshooting

### "Failed to load posts"
- Check if `.env` file exists
- Verify connection string is correct
- Run `npm run db:init` again

### "Database not configured"
- This is OK! App will use localStorage
- Add connection string to `.env` when ready

### Posts not saving
- Check browser console for errors
- Verify database connection
- Try clearing localStorage: `localStorage.clear()`

## 📚 Next Steps

1. ✅ Database is set up
2. ✅ Posts are working
3. 🔜 Add user authentication
4. 🔜 Add student applications
5. 🔜 Add comments system

## 🎉 You're All Set!

Your Kiyumba Technical School website now has:
- ✅ Persistent database storage
- ✅ Automatic fallback to localStorage
- ✅ Ready for Vercel deployment
- ✅ Production-ready architecture

**Need help?** Check `DATABASE_SETUP.md` for detailed instructions!
