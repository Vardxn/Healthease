# Media & Screenshot Blueprint

This shotlist is optimized for recruiters and engineering managers, focusing on complexity, UI polish, and backend mechanics.

## 1. Hero UI Shot: The Medical Scribe in Action
- **What to capture:** The Doctor's consultation room UI with the "Scribe Listening" indicator active, and a generated prescription loaded on the right panel.
- **Data to seed:** A realistic patient case (e.g., "Patient presents with a 3-day history of acute bronchitis...").
- **What to redact:** No PII. Ensure names used are clearly mock data (e.g., "Jane Doe").
- **Why it impresses recruiters:** Shows you can build real-time, complex, multi-modal UIs (Voice + AI + Forms) in Next.js.

## 2. The Dashboard (Populated)
- **What to capture:** The main Patient or Doctor dashboard in Dark Mode. Must show charts (Recharts) populated with Vitals tracking and upcoming appointments.
- **Data to seed:** 3-4 upcoming consultations, a 30-day BP/Heart Rate trend graph.
- **Why it impresses recruiters:** Demonstrates ability to handle data visualization and craft polished, consumer-ready products.

## 3. Terminal / Backend Mid-Execution
- **What to capture:** Split terminal view. Top half: Express Server showing WebSocket connections and successful ML predictions. Bottom half: FastAPI python-service showing successful 200 OK responses for OCR or triage processing.
- **Data to seed:** Hit the `/ocr` and `/scribe` endpoints heavily so the logs scroll.
- **Why it impresses recruiters:** Proves you understand microservices, cross-language communication (Node + Python), and logging.

## 4. Architecture Render
- **What to capture:** A high-quality rendering of the `system-architecture.mmd` file.
- **Why it impresses recruiters:** Engineers who can visually communicate their designs are hired for Senior/Architect roles.

## 5. Postman / Swagger Output
- **What to capture:** A screenshot of Postman showing a successful POST to the `/api/scribe` endpoint, with a 200 OK status and the massive structured JSON response body visible.
- **Why it impresses recruiters:** Validates your API design skills and proves the AI backend actually returns structured, usable data.
