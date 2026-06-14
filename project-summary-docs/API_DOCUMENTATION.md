# 🏥 HealthEase - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include JWT token in the header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"  // optional: patient (default), doctor, admin
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f5a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "profile": {
      "age": 30,
      "bloodGroup": "O+",
      "chronicConditions": ["Diabetes"],
      "allergies": ["Penicillin"]
    }
  }
}
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "profile": {
    "age": 30,
    "bloodGroup": "O+",
    "chronicConditions": ["Diabetes", "Hypertension"],
    "allergies": ["Penicillin", "Peanuts"]
  }
}
```

---

## 📋 Prescription Endpoints

### Upload Prescription
```http
POST /api/prescriptions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

prescription: <file>
```

**Response (200):**
```json
{
  "success": true,
  "msg": "Prescription processed successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f5b",
    "patientId": "60d5ec49f1b2c72b8c8e4f5a",
    "imageUrl": "https://placeholder-url.com/temp.jpg",
    "uploadDate": "2026-01-05T10:30:00.000Z",
    "medications": [
      {
        "name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "3 times daily",
        "duration": "7 days"
      }
    ],
    "doctorName": "Dr. Smith",
    "ocrRawText": "Dr. Smith\nDate: 2026-01-05...",
    "isVerified": false
  }
}
```

### Get All Prescriptions
```http
GET /api/prescriptions
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f5b",
      "medications": [...],
      "uploadDate": "2026-01-05T10:30:00.000Z",
      "isVerified": true
    }
  ]
}
```

### Get Single Prescription
```http
GET /api/prescriptions/:id
Authorization: Bearer <token>
```

### Update Prescription
```http
PUT /api/prescriptions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isVerified": true,
  "notes": "Verified by patient",
  "medications": [...]  // optional: update medications
}
```

### Delete Prescription
```http
DELETE /api/prescriptions/:id
Authorization: Bearer <token>
```

---

## 🤖 AI Chat Endpoints

### Ask AI Assistant
```http
POST /api/chat/ask
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What is Amoxicillin used for?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help?"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "reply": "Amoxicillin is a penicillin-type antibiotic used to treat bacterial infections..."
}
```

### Get Patient Context
```http
GET /api/chat/context
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "context": "Patient Information:\n- Age: 30\n- Blood Group: O+\n..."
}
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "msg": "Error message here",
  "error": "Detailed error (in development mode)"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

### Upload Prescription
```bash
curl -X POST http://localhost:5000/api/prescriptions/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "prescription=@/path/to/image.jpg"
```

### Chat with AI
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What medications am I currently taking?"}'
```

---

## 📊 Rate Limits

- **Authentication**: 10 requests per minute
- **Upload**: 5 prescriptions per hour per user
- **Chat**: 20 messages per minute per user

---

## 🔒 Security Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- File uploads limited to 10MB
- Only image files accepted (jpg, png, gif, webp)
- CORS enabled for specific origins only

---

For more information, see the main [README.md](README.md)
