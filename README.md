# PrepAI: AI-Powered Technical Mock Interview Platform

**PrepAI** is a full-stack, AI-powered mock interview simulator designed for students and developers to practice domain-specific technical interviews in real time.

The application dynamically generates role-specific interview modules, simulates live test environments, grades candidate responses using AI, provides detailed score breakdowns, and automatically compiles personalized learning roadmaps.

---

## 🚀 Key Features

1. **Python FastAPI Backend**: High-performance asynchronous backend with auto-generated Swagger documentation at `/docs`.
2. **Custom JWT Security & Cookies**: Stateless token-based auth with HTTP-Only cookies and bcrypt password hashing.
3. **Google Gemini AI Integration**: Role-tailored question generation, granular answer evaluation, scoring, and study roadmap synthesis via the Gemini Python SDK.
4. **Relational Database (SQLAlchemy ORM)**: Robust database layer supporting PostgreSQL (in production) and zero-setup SQLite (in development).
5. **Modern Vibrant UI**: Responsive dashboard, interactive live simulator HUD, progress metrics, and full-page layout built with Next.js 16 and Tailwind CSS.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.14, FastAPI, SQLAlchemy ORM, Pydantic, PyJWT, Bcrypt, Google Gemini SDK (`google-generativeai`)
- **Frontend**: Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS, Lucide Icons
- **Database**: PostgreSQL (Neon.tech) / SQLite (`prepai.db`)

---

## 📂 Project Structure

```
edtech-interview-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point & CORS
│   │   ├── database.py          # SQLAlchemy engine & session dependency
│   │   ├── models.py            # User, InterviewSession, InterviewQuestion models
│   │   ├── schemas.py           # Pydantic validation & response models
│   │   ├── auth.py              # Bcrypt hashing & JWT auth helpers
│   │   ├── services/
│   │   │   └── ai_service.py    # Google Gemini AI client + mock fallback
│   │   └── routers/
│   │       ├── auth.py          # /api/auth/register, login, logout, me
│   │       ├── interviews.py    # /api/interviews CRUD
│   │       └── ai.py            # /api/ai/evaluate, finalize
│   ├── run.py                   # Server startup script
│   ├── requirements.txt         # Python dependencies
│   └── test_backend.py          # Automated integration test suite
├── src/                         # Next.js 16 Frontend
│   ├── app/                     # Pages (landing, login, register, dashboard, interview)
│   ├── components/              # Navbar, Footer, UI Elements
│   └── proxy.ts                 # Route protection proxy
├── next.config.ts               # Proxy rewrites to FastAPI backend
└── package.json
```

---

## ⚙️ Running Locally

### 1. Start the Python Backend
Navigate to the backend directory, install requirements, and run the server:
```bash
cd backend
pip install -r requirements.txt
python run.py
```
The FastAPI backend will start at **http://127.0.0.1:8000**.
- Interactive Swagger API Docs: **http://127.0.0.1:8000/docs**

### 2. Start the Frontend
In another terminal, run the Next.js development server:
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### 3. Run Automated Backend Tests
```bash
cd backend
python test_backend.py
```

---

## 👨‍💻 Developer Information
- **Developer Name**: Harsh
- **GitHub**: [github.com/Harshhh119](https://github.com/Harshhh119)
- **LinkedIn**: [linkedin.com/in/harsh-vardhan-67028125a/](https://www.linkedin.com/in/harsh-vardhan-67028125a/)
- **Live Demo**: [https://prep-ai-nu-three.vercel.app/](https://prep-ai-nu-three.vercel.app/)
