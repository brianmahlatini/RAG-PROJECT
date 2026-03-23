# Tesla ChatBot

Tesla ChatBot is a bilingual (English + German) AI assistant built for Tesla document Q&A. It answers questions using Tesla PDFs first, then general Tesla knowledge if needed. The project includes a public chat interface, an admin dashboard with analytics and exports, and enterprise features such as role-based access, audit logs, and rate limiting.

This README explains the full architecture, the flow of data, how to run the system, and how every folder is organized so any new developer can onboard quickly.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Charts: Chart.js + react-chartjs-2
- Backend: FastAPI + SQLite
- LLM: OpenAI ChatCompletion
- Retrieval: TF-IDF (with optional FAISS acceleration)
- PDF parsing: PyMuPDF
- Containers: Docker (frontend + backend)

## High-Level Flow

1. Backend loads and parses all PDFs in `backend/pdfs/` at startup.
2. A retriever is built from the PDF text to locate relevant sections for a user query.
3. User messages are sent to `/chat` with a `language` query parameter.
4. The assistant replies in English first, then translates to German if needed.
5. All messages are stored in SQLite for admin analytics and export.
6. Admin panel uses token-based access and supports audit exports and CSV/JSON data export.

## Supported Languages

- English
- German

Voice input is English-only.

## Project Structure

```
backend/
  app/
    core/
      config.py
      database.py
      logging_config.py
      pdf_store.py
      rate_limit.py
    routes/
      admin.py
      chat.py
    services/
      admin_auth.py
      audit.py
      chat_service.py
      retriever.py
      translator.py
    schemas.py
    main.py
  pdfs/
  .env
  .env.example
  chat_data.db
  chat_logs.db
  Dockerfile
  requirements.txt
  main.py
frontend/
  src/
    components/
      admin/
      public/
    hooks/
    lib/
    App.jsx
    main.jsx
    index.css
  .env.example
  index.html
  Dockerfile
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
README.md
```

## Backend Details

### Main Services

- **Chat Service**: Builds the LLM prompt using retrieved Tesla content and user input.
- **Translator**: Translates English responses to German.
- **Retriever**: TF-IDF search over Tesla PDFs with optional FAISS acceleration.
- **Audit Logging**: Records admin logins and access actions.
- **Rate Limiting**: Limits chat usage per IP to protect stability.

### Key Endpoints

- `POST /chat?language=english|german`
- `POST /admin/login`
- `GET /admin/messages`
- `GET /admin/users`
- `GET /admin/export/messages`
- `GET /admin/export/messages-json`
- `GET /admin/export/users`
- `GET /admin/audit`
- `GET /admin/export/audit`

### Admin Roles

- **Admin**: Full access, audit export, database fixes.
- **Viewer**: Read-only access to messages and users.

## Database

SQLite is used for persistence. Tables include:

- `messages`: all chat messages with role, content, language, timestamp, IP
- `users`: basic user metadata (IP + policy if used)
- `admin_audit`: admin login and action logs

Database file: `backend/chat_data.db`

## Environment Variables

Create a `.env` inside `backend/` (or copy from `.env.example`):

```
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-3.5-turbo
ADMIN_PASSWORD=KGA!@6247#0
VIEWER_PASSWORD=
ADMIN_TOKEN_TTL_MINUTES=120
CORS_ALLOW_ORIGINS=*
ENVIRONMENT=development
REQUEST_TIMEOUT_SECONDS=30
RATE_LIMIT_REQUESTS=30
RATE_LIMIT_WINDOW_SECONDS=60
```

Frontend env file (optional):

```
VITE_API_BASE_URL=http://localhost:8000
```

## Run Locally

### Backend

```
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If PowerShell blocks scripts:

```
cd backend
cmd /c python -m venv .venv
cmd /c .\.venv\Scripts\activate
cmd /c pip install -r requirements.txt
cmd /c uvicorn main:app --reload --port 8000
```

### Frontend

```
cd frontend
npm install
npm run dev
```

If PowerShell blocks scripts:

```
cd frontend
cmd /c npm install
cmd /c npm run dev
```

Open the app:

- Public chat: `http://localhost:5173/`
- Admin dashboard: `http://localhost:5173/admin`

## Docker

### Backend

```
cd backend
docker build -t tesla-chatbot-backend .
docker run -p 8000:8000 --env-file .env tesla-chatbot-backend
```

### Frontend

```
cd frontend
docker build -t tesla-chatbot-frontend .
docker run -p 5173:5173 tesla-chatbot-frontend
```

## Admin Usage

1. Log in with Admin password for full access.
2. Use Viewer password for read-only access.
3. Export chats as CSV or JSON for training.
4. Add or replace Tesla PDFs in `backend/pdfs/` and restart the backend.

## Training Data Export

Use the admin Messages tab to export all chats for model training:

- CSV export: `GET /admin/export/messages`
- JSON export: `GET /admin/export/messages-json`

## Notes

- The assistant answers from Tesla documents first.
- If Tesla PDFs do not cover a question, it responds from general Tesla knowledge and states uncertainty if needed.
- For better accuracy, add more Tesla PDFs to `backend/pdfs/` and restart the backend.

## Senior-Level Checklist Implemented

- Structured backend architecture (core/services/routes)
- Configurable environment variables
- Logging + health endpoint
- Admin token-based auth
- Rate limiting on `/chat`
- Audit logs + export
- Admin audit export
- Pagination in admin UI
- Real charts (Chart.js)
- Docker support
- Comprehensive documentation
