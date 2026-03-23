# Tesla ChatBot

Tesla ChatBot is a bilingual (English + German) assistant that answers questions using Tesla PDF documents and general Tesla knowledge. The app provides a public chat UI with English-only voice input and a full admin dashboard for monitoring and exporting conversations.

This README documents the architecture, folder layout, how the system works end-to-end, and the exact steps to run it locally or in Docker.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + SQLite + OpenAI ChatCompletion
- PDF ingestion: PyMuPDF
- Containers: Docker (frontend + backend)

## Project Structure

```
backend/
  app/
    core/
      config.py
      database.py
      pdf_store.py
    routes/
      admin.py
      chat.py
    services/
      chat_service.py
      translator.py
    schemas.py
    main.py
  pdfs/
  .env
  chat_data.db
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
  index.html
  Dockerfile
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js
README.md
```

## System Overview

1. The backend loads every PDF in `backend/pdfs/` at startup and keeps a combined text version in memory.
2. User questions are sent to `/chat` with a `language` query parameter.
3. The assistant answers in English using Tesla docs plus general Tesla knowledge.
4. If the user selected German, the English answer is translated before returning.
5. All messages are stored in `backend/chat_data.db` and visible in the admin dashboard.

## Supported Languages

- English
- German

Voice input is available only in English.

## Backend Architecture

The backend is a structured FastAPI app with clear separation of concerns:

- `app/core/config.py`: Environment config (OpenAI key, admin password, languages).
- `app/core/database.py`: SQLite initialization and shared connection.
- `app/core/pdf_store.py`: PDF ingestion and text extraction.
- `app/services/chat_service.py`: Prompt construction and response generation.
- `app/services/translator.py`: OpenAI translation for German responses.
- `app/routes/chat.py`: Public chat endpoint.
- `app/routes/admin.py`: Admin endpoints for login, data export, and stats.

### Key Endpoints

- `POST /chat?language=english|german`
- `POST /admin/login`
- `GET /admin/messages`
- `GET /admin/users`
- `GET /admin/export/messages`
- `GET /admin/export/users`

## Frontend Architecture

The frontend is a Vite-based React app with component separation:

- `components/public/`: public chat UI and messaging components
- `components/admin/`: admin login, dashboard, analytics, and modals
- `hooks/`: reusable hooks such as speech synthesis
- `lib/`: constants and formatting utilities

The UI is built with Tailwind CSS and a Tesla-styled dark theme.

## Environment Variables

Create a `.env` inside `backend/`:

```
OPENAI_API_KEY=your_openai_key
```

## Run Locally (Recommended)

### Backend

```
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Open the app:

- Public chat: `http://localhost:5173/`
- Admin dashboard: `http://localhost:5173/admin`

## Admin Credentials

- Password: `KGA!@6247#0`

## Update Tesla PDFs

1. Add or replace PDFs in `backend/pdfs/`.
2. Restart the backend to reload documents.

## Docker (Production-Style Runs)

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

## Notes on Tesla Knowledge

The assistant is optimized to answer using Tesla PDFs first. If a question is not covered in PDFs, it uses general Tesla knowledge and will be transparent if unsure. There is currently no live internet retrieval pipeline.

## Common Issues and Fixes

- **npm error: `vite` not recognized**
  Run `npm install` first or use `cmd /c npm install` if PowerShell scripts are blocked.

- **PowerShell script execution blocked**
  Run in cmd:
  `cmd /c npm install`
  `cmd /c npm run dev`

- **Backend fails to start**
  Ensure `OPENAI_API_KEY` is set in `backend/.env` and the virtual environment is activated.

## Optional Enhancements

- Add a vector database for higher accuracy retrieval.
- Add a document uploader in the admin panel.
- Add streaming responses for faster UI feedback.
