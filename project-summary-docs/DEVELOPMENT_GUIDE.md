# 💡 Development Tips & Best Practices

## 🚀 Quick Commands

### Installation
```bash
# From root directory - install all dependencies at once
npm run install:all

# Or separately
cd server && npm install
cd client && npm install
```

### Running the Application
```bash
# Option 1: Run both server and client concurrently (requires concurrently package)
cd health-ease
npm install -g concurrently  # Install globally
npm run dev

# Option 2: Separate terminals (recommended for beginners)
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

---

## 🐛 Debugging Tips

### Backend Debugging

**Check if server is running:**
```bash
curl http://localhost:5000/health
```

**View MongoDB data:**
```bash
mongosh
use healthease
db.users.find()
db.prescriptions.find()
```

**Test authentication:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Frontend Debugging

**Clear browser data:**
```javascript
// In browser console
localStorage.clear()
location.reload()
```

**Check network requests:**
- Open DevTools (F12)
- Go to Network tab
- Filter by "XHR" or "Fetch"
- Check request/response data

**React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state

---

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
```bash
# Solution: Start MongoDB
brew services start mongodb-community

# Or check status
brew services list

# Or use MongoDB Atlas instead
# Update MONGO_URI in .env to Atlas connection string
```

### Issue 2: Google Vision API Error
```bash
# Solution: Verify credentials
ls server/config/google-vision-credentials.json

# Check environment variable
echo $GOOGLE_APPLICATION_CREDENTIALS

# Re-download credentials from Google Cloud Console if needed
```

### Issue 3: OpenAI API Rate Limit
```javascript
// Solution: In server/services/ocrService.js
// Temporarily use gpt-3.5-turbo instead of gpt-4o
model: "gpt-3.5-turbo"  // Cheaper and faster for testing
```

### Issue 4: Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in server/.env
PORT=5001
```

### Issue 5: CORS Error
```javascript
// Solution: Update server/server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 🎨 UI Customization

### Change Color Theme
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#1e40af',  // Change this to your color
    700: '#1e3a8a',
  }
}
```

### Customize Chatbot Position
Edit `client/src/components/AIChatbot.jsx`:
```javascript
// Change from bottom-right to bottom-left
className="fixed bottom-5 left-5 z-50"
```

---

## 🧪 Testing Workflow

### 1. Test Authentication
1. Register new user
2. Login with credentials
3. Check JWT token in localStorage
4. Access protected route

### 2. Test Prescription Upload
1. Use a sample prescription image
2. Upload and wait for processing
3. Verify extracted medications
4. Test verify/delete actions

### 3. Test AI Chatbot
1. Ask simple medical question
2. Check if response uses your medical history
3. Test conversation continuity
4. Verify error handling

---

## 📊 Performance Optimization

### Image Upload Optimization
```javascript
// In server/middleware/upload.js
// Adjust file size limit
limits: {
  fileSize: 5 * 1024 * 1024  // Reduce to 5MB
}
```

### Database Indexing
```javascript
// In server/models/User.js
UserSchema.index({ email: 1 });

// In server/models/Prescription.js
PrescriptionSchema.index({ patientId: 1, uploadDate: -1 });
```

### Frontend Bundle Size
```bash
# Analyze bundle
cd client
npm run build
npx vite-bundle-analyzer
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Passwords are hashed with bcrypt
- [ ] API keys are in .env, not committed to Git
- [ ] File upload size limits are set
- [ ] File type validation is enabled
- [ ] CORS is configured for specific origins
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented (for production)

---

## 📦 Deployment Preparation

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...  # Atlas connection
JWT_SECRET=<generate_strong_32_char_secret>
OPENAI_API_KEY=sk-...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### Build Frontend
```bash
cd client
npm run build
# Upload 'dist' folder to hosting service
```

### Deploy Backend
```bash
# Heroku example
heroku create healthease-api
heroku config:set MONGO_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="..."
git push heroku main
```

---

## 🎓 Learning Resources

### MongoDB
- [MongoDB University](https://university.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/docs/)

### React
- [React Docs](https://react.dev/)
- [React Router](https://reactrouter.com/)

### AI/ML
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Cloud Vision](https://cloud.google.com/vision/docs)

### Node.js
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 💻 VS Code Extensions

Recommended extensions for better development experience:

- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Tailwind CSS IntelliSense**
- **MongoDB for VS Code**
- **Thunder Client** (API testing)
- **GitLens**

---

## 🎯 Next Steps After Setup

1. **Customize the UI** - Make it match your brand
2. **Add more features** - See PROJECT_SUMMARY.md for ideas
3. **Deploy to production** - Vercel, Heroku, AWS, etc.
4. **Get user feedback** - Test with real users
5. **Add analytics** - Track usage patterns
6. **Implement caching** - Redis for performance
7. **Add tests** - Jest, React Testing Library

---

## 🤝 Contributing

Want to improve HealthEase?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Get Help

Stuck? Here's where to look:

1. **README.md** - Full documentation
2. **QUICK_START.md** - Setup guide
3. **API_DOCUMENTATION.md** - API reference
4. **PROJECT_SUMMARY.md** - Architecture overview
5. **This file** - Development tips

---

**Happy Coding! 🚀**
