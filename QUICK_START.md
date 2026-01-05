# ⚡ Quick Setup Guide - HealthEase

## Fast Track Setup (5 minutes)

### Step 1: Install Dependencies

```bash
# Install server dependencies
cd health-ease/server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

```bash
# In server directory, copy example env file
cd ../server
cp .env.example .env
```

Edit `server/.env` with your credentials:
```env
MONGO_URI=mongodb://localhost:27017/healthease
JWT_SECRET=my_super_secret_key_12345
OPENAI_API_KEY=sk-your-actual-openai-key
GOOGLE_APPLICATION_CREDENTIALS=./config/google-vision-credentials.json
```

### Step 3: Setup Google Cloud Vision

1. Visit: https://console.cloud.google.com/
2. Create project → Enable "Cloud Vision API"
3. Create Service Account → Download JSON
4. Save JSON as: `server/config/google-vision-credentials.json`

### Step 4: Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Or use MongoDB Atlas (free cloud option)
# Get connection string from: https://cloud.mongodb.com/
```

### Step 5: Run the Application

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
✅ Server: http://localhost:5000

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
✅ Client: http://localhost:3000

## 🧪 Test the App

1. Open http://localhost:3000
2. Click "Sign Up" → Create account
3. Upload a prescription image
4. Wait for AI to process (~10-15 seconds)
5. View digitized prescription
6. Chat with Dr. AI (bottom-right)

## 🔑 Get API Keys

### OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Sign up/Login
3. Click "Create new secret key"
4. Copy and paste into `.env`

### Google Cloud Vision
1. Go to: https://console.cloud.google.com/
2. New Project → "HealthEase"
3. Enable APIs → Search "Cloud Vision API" → Enable
4. Credentials → Create Credentials → Service Account
5. Download JSON → Save as `google-vision-credentials.json`

## ⚠️ Common Issues

**MongoDB not connecting?**
```bash
brew services list
brew services restart mongodb-community
```

**Google Vision error?**
- Check credentials path in `.env`
- Verify API is enabled
- Enable billing (free tier available)

**OpenAI rate limit?**
- Check account has credits
- Verify API key is correct
- Try different model: "gpt-3.5-turbo"

## 📱 Default Test User

For quick testing, you can register with:
- Email: test@healthease.com
- Password: password123
- Name: Test User

## 🚀 Ready to Build!

Your HealthEase platform is now running! 

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

Happy coding! 🎉
