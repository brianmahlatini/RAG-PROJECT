# Tesla ChatBot - Document Q&A System

A production-ready, multilingual AI assistant for automated document retrieval and question-answering. The system leverages advanced retrieval-augmented generation (RAG) techniques combined with OpenAI's language models to provide accurate, contextual responses from Tesla documentation.

## Executive Summary

Tesla ChatBot is an enterprise-grade AI solution that combines:

- **Advanced Retrieval**: TF-IDF vectorization with optional FAISS acceleration for rapid document searches
- **Multilingual Support**: Native English and German language support with seamless translation
- **Production Architecture**: Microservice-based backend with comprehensive monitoring and audit trails
- **Admin Dashboard**: Role-based access control with analytics, data exports, and system auditing
- **Enterprise Security**: Token-based authentication, rate limiting, IP-based access controls, and comprehensive audit logging

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | FastAPI 0.115 + Uvicorn |
| **Database** | SQLite 3 |
| **LLM Integration** | OpenAI ChatCompletion API |
| **Vector Search** | TF-IDF (scikit-learn) with optional FAISS |
| **PDF Processing** | PyMuPDF (fitz) |
| **Containerization** | Docker |
| **Analytics** | Chart.js + react-chartjs-2 |

## System Architecture

### High-Level Data Flow

```
1. User Query
    ↓
2. PDF Retrieval (TF-IDF/FAISS)
    ↓
3. Context Building
    ↓
4. OpenAI Chat Completion
    ↓
5. Language Translation (if needed)
    ↓
6. Database Logging & Audit
    ↓
7. Response to User
```

### Backend Architecture

The backend follows a layered, service-oriented architecture:

```
app/
├── core/                    # Cross-cutting concerns
│   ├── config.py           # Environment configuration
│   ├── database.py         # SQLite connection management
│   ├── logging_config.py   # Structured logging
│   ├── pdf_store.py        # PDF ingestion pipeline
│   └── rate_limit.py       # Request throttling middleware
├── routes/                 # HTTP API endpoints
│   ├── chat.py            # Public Q&A endpoint
│   └── admin.py           # Admin operations (auth, exports)
├── services/              # Business logic layer
│   ├── chat_service.py    # Chat orchestration
│   ├── retriever.py       # Document retrieval engine
│   ├── translator.py      # Multilingual translation
│   ├── admin_auth.py      # Token-based authentication
│   └── audit.py           # Audit logging
├── schemas.py             # Pydantic validation models
└── main.py                # FastAPI application factory
```

## Project Structure

```
backend/                           # FastAPI backend application
├── app/                          # Application package
│   ├── core/                     # Infrastructure & configuration
│   │   ├── config.py            # Environment variables & constants
│   │   ├── database.py          # SQLite initialization & persistence
│   │   ├── logging_config.py    # Logging configuration
│   │   ├── pdf_store.py         # PDF text extraction
│   │   └── rate_limit.py        # IP-based rate limiting
│   ├── routes/                  # API endpoints
│   │   ├── chat.py              # Public chat API
│   │   └── admin.py             # Admin operations
│   ├── services/                # Business logic
│   │   ├── admin_auth.py        # Token management
│   │   ├── audit.py             # Audit logging
│   │   ├── chat_service.py      # Core chat logic
│   │   ├── retriever.py         # PDF retrieval engine
│   │   └── translator.py        # OpenAI translation
│   ├── schemas.py               # Pydantic models
│   └── main.py                  # FastAPI initialization
├── pdfs/                        # Knowledge base (Tesla documents)
├── Dockerfile                   # Container configuration
├── requirements.txt             # Python dependencies
├── main.py                      # Uvicorn entrypoint
├── chat_data.db                 # SQLite database
└── .env                         # Configuration (not committed)

frontend/                        # React frontend application
├── src/
│   ├── components/
│   │   ├── admin/              # Admin dashboard UI
│   │   └── public/             # Public chat interface
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & API clients
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── Dockerfile                  # Container configuration
├── package.json                # Node.js dependencies
├── vite.config.cjs             # Vite build config
├── tailwind.config.js          # Tailwind configuration
└── index.html                  # HTML shell
```

## Features

### Core Functionality

- **Document Q&A**: Retrieve answers from Tesla PDFs with context-aware LLM generation
- **Multilingual Support**: Automatic translation between English and German
- **Session Persistence**: Complete message history with metadata
- **IP-Based Tracking**: User identification and analytics

### Admin Dashboard

- **Authentication**: Password-protected admin access with token-based session management
- **Message Analytics**: Searchable message history with language and timestamp filtering
- **User Management**: Track unique users and their activity patterns
- **Data Export**: CSV and JSON exports for compliance and data analysis
- **Audit Logging**: Complete record of all admin actions
- **System Monitoring**: Performance metrics and system health indicators

### Security & Performance

- **Rate Limiting**: IP-based request throttling (configurable per-window limits)
- **CORS Configuration**: Environment-based cross-origin access control
- **Token-Based Auth**: Secure, time-limited authentication tokens
- **Database Auditing**: Immutable audit trail of administrative actions
- **Optional FAISS Acceleration**: Enhanced vector search for large document sets

## API Endpoints

### Public Chat

```http
POST /chat?language=english|german
Content-Type: application/json

{
  "message": "What is the range of Tesla Model 3?"
}

Response:
{
  "reply": "The Tesla Model 3 has a range of up to 565 miles...",
  "language": "english"
}
```

### Admin Authentication

```http
POST /admin/login
Content-Type: application/json

{
  "password": "admin_password"
}

Response:
{
  "token": "token_string",
  "role": "admin"
}
```

### Admin Data Access

- `GET /admin/messages?page=1&page_size=50` - Retrieve paginated messages
- `GET /admin/users` - List tracked users
- `GET /admin/audit` - View audit logs
- `GET /admin/export/messages` - Export as CSV
- `GET /admin/export/messages-json` - Export as JSON
- `GET /admin/export/users` - Export users as CSV
- `GET /admin/export/audit` - Export audit logs as CSV

## Configuration

### Environment Variables

Create `.env` in the `backend/` directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # Required: OpenAI API key
OPENAI_MODEL=gpt-3.5-turbo              # LLM model selection

# Authentication
ADMIN_PASSWORD=secure_password           # Admin access password
VIEWER_PASSWORD=viewer_password          # Read-only access password
ADMIN_TOKEN_TTL_MINUTES=120             # Token expiration time

# API Configuration
CORS_ALLOW_ORIGINS=*                    # CORS policy
REQUEST_TIMEOUT_SECONDS=30              # Request timeout
ENVIRONMENT=production                   # Environment mode

# Rate Limiting
RATE_LIMIT_REQUESTS=30                  # Requests per window
RATE_LIMIT_WINDOW_SECONDS=60            # Time window in seconds

# Language Support
SUPPORTED_LANGUAGES=english,german       # Enabled languages
DEFAULT_LANGUAGE=english                 # Default language
```

### Frontend Configuration

Create `.env` in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:8000  # Backend API URL
```

## Installation & Setup

### Prerequisites

- Python 3.9+
- Node.js 16+
- Docker & Docker Compose (optional)

### Local Development Setup

#### Backend Installation

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
```

#### Backend Startup

```bash
cd backend
cp .env.example .env  # Configure environment variables
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000` with API documentation at `http://localhost:8000/docs`.

#### Frontend Installation

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Docker Deployment

#### Build Containers

```bash
# Backend
cd backend
docker build -t tesla-chatbot-backend:latest .
docker run -p 8000:8000 --env-file .env tesla-chatbot-backend:latest

# Frontend
cd frontend
docker build -t tesla-chatbot-frontend:latest .
docker run -p 5173:5173 tesla-chatbot-frontend:latest
```

#### Docker Compose (Optional)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - backend/.env
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
```

## Database Schema

### messages
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  role TEXT,
  content TEXT,
  timestamp TEXT,
  language TEXT
)
```

### users
```sql
CREATE TABLE users (
  ip TEXT PRIMARY KEY,
  policy TEXT
)
```

### admin_audit
```sql
CREATE TABLE admin_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  action TEXT,
  timestamp TEXT
)
```

## Knowledge Base Management

### Adding Documents

1. Place PDF files in `backend/pdfs/` directory
2. Restart the backend service
3. PDFs are automatically parsed and indexed at startup

### Document Format Requirements

- PDF format (.pdf extension)
- Readable text extraction (not scanned images only)
- UTF-8 compatible text encoding

## Supported Languages

| Language | Code | Support Level |
|----------|------|----------------|
| English | en | Full support |
| German | de | Full support with automatic translation |

**Note**: Voice input is limited to English only.

## Troubleshooting

### Backend Issues

| Issue | Solution |
|-------|----------|
| PDF not loading | Verify PDF is in `backend/pdfs/` and is readable |
| Rate limit errors | Check `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW_SECONDS` |
| OpenAI API errors | Verify `OPENAI_API_KEY` is valid and has available credits |
| Database locked | Ensure only one backend instance is running |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| API connection failed | Verify backend is running and `VITE_API_BASE_URL` is correct |
| CORS errors | Check `CORS_ALLOW_ORIGINS` includes frontend URL |
| Voice not working | Use Chrome/Edge browser; check microphone permissions |

## Performance Optimization

### For Large Document Sets

1. **Enable FAISS**: Install optional dependency for vector acceleration
   ```bash
   pip install faiss-cpu
   ```

2. **Adjust Chunk Size**: Modify `chunk_text()` parameters in `retriever.py`

3. **Configure Rate Limits**: Adjust `RATE_LIMIT_REQUESTS` for your load

### Recommended Production Settings

- `ENVIRONMENT=production`
- `RATE_LIMIT_REQUESTS=50` (per minute)
- Enable FAISS for document sets > 1000 pages
- Use external database for multi-instance deployments
- Implement caching layer for frequently asked questions

## Best Practices

### Security

- Never commit `.env` files with sensitive credentials
- Rotate `ADMIN_PASSWORD` regularly
- Use strong, unique passwords for production
- Enable HTTPS in production environments
- Audit logs regularly for suspicious activity

### Operations

- Monitor API response times and error rates
- Export data regularly for compliance
- Backup `chat_data.db` daily
- Review PDF knowledge base quarterly
- Test disaster recovery procedures

## License

[Insert your license information here]

## Support & Contribution

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial production release
- Multilingual Q&A support
- Admin dashboard with analytics
- Complete audit logging
- Docker deployment support
