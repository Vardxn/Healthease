# HealthEase Free Showcase Deployment

This project needs three hosted pieces:

- React/Vite frontend on Vercel
- Node/Express API on Render
- Python OCR/ML service on Render
- MongoDB Atlas M0 free database

## 1. Create MongoDB Atlas

1. Create a free M0 Atlas cluster.
2. Create a database user.
3. Add network access for Render. For a public demo, `0.0.0.0/0` is simplest.
4. Copy the connection string and set the database name to `healthease`.

Example:

```text
mongodb+srv://<user>:<password>@<cluster-host>/healthease?retryWrites=true&w=majority
```

## 2. Deploy Backend Services on Render

Use the root `render.yaml` as a Blueprint. It creates:

- `healthease-api`
- `healthease-ocr`

Set these Render environment variables:

### `healthease-ocr`

```text
MONGO_URI=<your MongoDB Atlas URI>
CLIENT_URL=<your Vercel frontend URL after Vercel deploy>
GROQ_API_KEY=<your Groq API key>
DEBUG=false
```

### `healthease-api`

```text
MONGO_URI=<your MongoDB Atlas URI>
CLIENT_URL=<your Vercel frontend URL after Vercel deploy>
PYTHON_SERVICE_URL=<your healthease-ocr Render URL>
OPENAI_API_KEY=<optional, enables AI assistant/parsing fallback>
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_MEDICAL_MODEL=gpt-4o-mini
RAZORPAY_KEY_ID=<optional test key>
RAZORPAY_KEY_SECRET=<optional test secret>
```

Health checks:

```text
https://<healthease-api>.onrender.com/health
https://<healthease-ocr>.onrender.com/health
```

## 3. Seed the Live Database

After setting `MONGO_URI` locally to your Atlas URI:

```bash
cd server
MONGO_URI="<your MongoDB Atlas URI>" npm run seed
```

Demo credentials:

```text
Patient: user@healthease.demo / User@123
Admin: admin@healthease.demo / Admin@123
Doctor: jenkins@healthease.demo / Doctor@123
```

## 4. Deploy Frontend on Vercel

Set Vercel project root directory to:

```text
client
```

Set build settings:

```text
Build Command: npm run build
Output Directory: dist
```

Set environment variable:

```text
VITE_API_URL=<your healthease-api Render URL>
```

Then redeploy.

## 5. Final Recruiter Demo Checklist

- Open frontend URL in a private/incognito window.
- Log in as patient.
- Upload a prescription image and confirm OCR extraction.
- Show prescription records, medicine tracker, vitals, health score, analytics, and AI assistant.
- Keep a note near the demo link: Render free services may take around a minute to wake after inactivity.
