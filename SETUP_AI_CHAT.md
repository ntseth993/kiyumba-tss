# 🚀 Quick Setup: Enable Real AI Chat (5 Minutes)

## Step 1: Get FREE Gemini API Key

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. Click **"Create API Key"**
4. Click **"Create API key in new project"**
5. **Copy the API key** (looks like: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX)

## Step 2: Add API Key to Your Project

1. **Open your project folder**: `c:\Users\SETH'S\Desktop\kiyumba react`
2. **Create a `.env` file** in the root (if it doesn't exist)
3. **Add this line** (replace with your actual key):

```env
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Step 3: Restart Your Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ That's It!

Now students can chat with **real Google Gemini AI** for FREE!

## 🎉 Testing

1. Login as student: `student@kiyumba.com` / `student123`
2. Click **"AI Assistant"** tab (✨ Sparkles icon)
3. Ask a question like: *"Explain photosynthesis"*
4. Get **real AI responses**!

---

## 📝 Important Notes

- **100% FREE**: Gemini has a generous free tier
- **No credit card required**
- **Perfect for educational use**
- **Rate limits**: 60 requests per minute (more than enough)

## 🔒 Security

- Never commit the `.env` file to git (it's already in .gitignore)
- Keep your API key private
- If exposed, regenerate it at https://makersuite.google.com/app/apikey
