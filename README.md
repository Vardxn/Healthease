# 🏥 HealthEase - AI-Powered Healthcare Platform

An intelligent healthcare platform for Indians that digitizes handwritten prescriptions using OCR, manages patient health records, and provides an AI medical assistant.

## 🚀 Features

- **📸 Smart OCR Technology**: Upload handwritten prescriptions and get them digitized automatically
- **🤖 AI Medical Assistant**: Context-aware chatbot powered by GPT-4o
- **📊 Structured Data**: Medications parsed into searchable format with dosage, frequency, and duration
- **🔒 Secure & Private**: Enterprise-grade security with JWT authentication
- **📱 Responsive Design**: Beautiful UI built with React and Tailwind CSS
- **🌐 RESTful API**: Clean, well-documented backend architecture

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database
- **Google Cloud Vision API** - OCR text extraction
- **OpenAI GPT-4o** - Text parsing and medical assistant
- **Sharp** - Image preprocessing
- **JWT** - Authentication
- **Multer** - File uploads

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## 📁 Project Structure

```
health-ease/
├── server/                    # Backend (Node.js/Express)
│   ├── config/               # Database connections
│   │   └── db.js
│   ├── controllers/          # Request/Response handlers
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   └── prescriptionController.js
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   └── Prescription.js
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── prescriptionRoutes.js
│   ├── services/             # Business logic
│   │   ├── ocrService.js
│   │   └── chatService.js
│   ├── middleware/           # Auth & file upload
│   │   ├── auth.js
│   │   └── upload.js
│   ├── server.js             # Entry point
│   └── package.json
│
└── client/                    # Frontend (React + Vite)
    ├── src/
    │   ├── components/       # Reusable UI components
    │   │   ├── AIChatbot.jsx
    │   │   └── Navbar.jsx
    │   ├── pages/            # Full page views
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── UploadPrescription.jsx
    │   │   ├── PrescriptionList.jsx
    │   │   └── Profile.jsx
    │   ├── context/          # State management
    │   │   └── AuthContext.jsx
    │   ├── services/         # API calls
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Google Cloud Platform account (for Vision API)
- OpenAI API key

### 1. Clone the Repository

```bash
cd health-ease
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthease
JWT_SECRET=your_super_secret_jwt_key_change_this
OPENAI_API_KEY=sk-your-openai-api-key-here
GOOGLE_APPLICATION_CREDENTIALS=./config/google-vision-credentials.json
```

### 3. Google Cloud Vision Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Cloud Vision API**
4. Create a service account and download the JSON credentials
5. Save the JSON file as `server/config/google-vision-credentials.json`

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew install mongodb-community
brew services start mongodb-community

# Verify it's running
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and update `MONGO_URI` in `.env`

### 5. Frontend Setup

```bash
cd ../client
npm install
```

### 6. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Prescriptions
- `POST /api/prescriptions/upload` - Upload & digitize prescription (Protected)
- `GET /api/prescriptions` - Get all prescriptions (Protected)
- `GET /api/prescriptions/:id` - Get single prescription (Protected)
- `PUT /api/prescriptions/:id` - Update prescription (Protected)
- `DELETE /api/prescriptions/:id` - Delete prescription (Protected)

### AI Chat
- `POST /api/chat/ask` - Ask AI medical assistant (Protected)
- `GET /api/chat/context` - Get patient context (Protected)

## 🔐 Environment Variables

### Server (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Google Vision credentials | Yes |

## 🧪 Testing the Application

1. **Register** a new account at `/register`
2. **Login** with your credentials
3. **Upload** a prescription image (handwritten or printed)
4. Wait for **AI processing** (OCR + Parsing)
5. **View** digitized prescription in your list
6. **Chat** with Dr. AI using the chatbot in bottom-right corner

## 🎨 Key Features Explained

### OCR Pipeline
1. **Image Upload** → User uploads prescription image
2. **Preprocessing** → Sharp library enhances image quality (grayscale, normalize, sharpen)
3. **Text Extraction** → Google Vision API performs OCR
4. **AI Parsing** → GPT-4o structures the text into JSON format
5. **Storage** → Saved to MongoDB with verification status

### AI Medical Assistant
- Uses conversation history for context
- Accesses patient's medical profile (age, blood group, conditions, allergies)
- Reviews recent prescriptions and medications
- Provides empathetic, accurate medical information
- Always encourages consulting real doctors for serious concerns

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
# Add to package.json
"scripts": {
  "start": "node server.js"
}

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Database (MongoDB Atlas)
Use MongoDB Atlas for production database and update `MONGO_URI`.

## 🔒 Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- Protected routes require valid authentication
- File uploads validated for type and size
- CORS enabled for specific origins in production
- Environment variables for sensitive data

## 🐛 Troubleshooting

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
brew services list
# Restart if needed
brew services restart mongodb-community
```

**Google Vision API Error:**
- Verify credentials file path in `.env`
- Ensure Vision API is enabled in Google Cloud Console
- Check if billing is enabled (required even for free tier)

**OpenAI API Error:**
- Verify API key is valid
- Check if you have credits/billing set up
- Ensure correct model name (`gpt-4o`)

## 📚 Future Enhancements

- [ ] RxNorm API integration for medication validation
- [ ] Cloud storage (AWS S3/Cloudinary) for prescription images
- [ ] Email notifications for prescription reminders
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Doctor portal for prescription verification
- [ ] Appointment scheduling system
- [ ] Export prescriptions as PDF
- [ ] Mobile app (React Native)

## 👨‍💻 Developer

Built with ❤️ for improving healthcare accessibility in India.

## 📄 License

MIT License - feel free to use this project for learning or building upon it.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: This is an educational project. Always consult qualified healthcare professionals for medical advice.
