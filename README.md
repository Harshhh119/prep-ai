# PrepAI: AI-Powered Technical Mock Interview Platform

**PrepAI** is a premium, full-stack web application designed for students and freshers to prepare for technical interviews. The platform dynamically generates role-specific interview modules, simulates live test environments, critiques response text via AI, and automatically compiles detailed feedback charts and customized study roadmaps.

Built as an assignment for **House of Edtech**, this project completely avoids standard "to-do lists" or "course managers" to solve a core edtech problem using advanced architecture.

---

## 🚀 Key Features

1. **Custom JWT Security & Next.js Middleware**: Implements secure cookie-based authorization. Protects `/dashboard` and `/interview/*` paths globally at the edge without heavy third-party authentication overhead.
2. **Dynamic AI Interview Prompter**: Calibrates questions based on target roles (Frontend, Backend, etc.) and difficulty using the Google Gemini 1.5 API.
3. **Automated AI Grading & Ideal Answer Synthesis**: Evaluates candidate answers in real time, calculating scores, identifying missed points, and highlighting model answers.
4. **Relational Database CRUD (Prisma/PostgreSQL)**: Handles creation, listing, updating (evaluation insertion), and cascade deletion of interviews and questions.
5. **Personalized Study Roadmap**: Compiles final scores and dynamically synthesizes markdown checklists based on candidate weaknesses.
6. **Premium Glassmorphic UI**: High-fidelity dark mode styling utilizing Tailwind CSS, smooth custom scrollbars, layout animations, and dashboard analytics.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (interfaced via Prisma ORM)
- **Authentication**: Custom JWT (stored in HTTP-Only cookies)
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Icons**: Lucide React

---

## ⚙️ Running Locally

### 1. Prerequisite Packages
Verify Node.js and NPM versions on your machine (built and validated on Node `v24` and NPM `v11`):
```bash
node -v
npm -v
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and configure:
- `JWT_SECRET`: A secure signing key.
- `GEMINI_API_KEY`: Your Gemini API key. *(Optional: A high-quality mock evaluation engine is pre-written. If no key is set, the app runs in demonstration mode so you can test it immediately).*

### 3. Database Initialization (PostgreSQL vs. SQLite)

#### Standard: PostgreSQL (Preferred)
Provide a valid PostgreSQL connection string in `DATABASE_URL` inside `.env`. Then run:
```bash
npx prisma db push
```

#### Fast Review Option: SQLite (1-Click Local Fallback)
If you do not have a PostgreSQL database server running locally and want to test the app in 10 seconds:
1. Open [prisma/schema.prisma](prisma/schema.prisma)
2. Change the datasource block to:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
3. Remove all `@db.Text` annotations from the schema (as SQLite does not require specific text sizing modifiers).
4. Run:
   ```bash
   npx prisma db push
   ```
This will automatically generate a lightweight SQLite file database (`dev.db`) in your project directory!

### 4. Running the App
Once the database is synced, run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Codebase Structure

```
edtech-interview-ai/
├── prisma/
│   └── schema.prisma              # Relational schemas (User, InterviewSession, InterviewQuestion)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with premium glassmorphism base styling
│   │   ├── page.tsx               # Animated marketing landing page
│   │   ├── login/page.tsx         # Secure sign in card
│   │   ├── register/page.tsx      # Secure registration card
│   │   ├── dashboard/page.tsx     # Student dashboard showing interview history (CRUD read/delete)
│   │   ├── interview/
│   │   │   ├── new/page.tsx       # Start/Configure new interview (CRUD create)
│   │   │   ├── [id]/page.tsx      # Live interactive interview prompter (CRUD update)
│   │   │   └── [id]/feedback/page.tsx # AI grade details and checklist roadmaps
│   │   ├── api/
│   │   │   ├── auth/              # JWT auth endpoints (login, register, logout, me status)
│   │   │   ├── interviews/        # CRUD endpoint routes for interview sessions
│   │   │   └── ai/                # AI evaluate and finalize routes
│   │   └── middleware.ts          # Edge cookie checker protecting dashboard routes
│   ├── components/
│   │   ├── Footer.tsx             # Mandatory candidate credentials
│   │   ├── Navbar.tsx             # Client state-managed global navigation
│   │   └── ui/
│   │       └── Elements.tsx       # Shared custom buttons, cards, and inputs
│   ├── lib/
│   │   ├── ai.ts                  # Gemini API wrapper + detailed mock dataset switcher
│   │   ├── db.ts                  # Hot-reload protected Prisma client
│   │   └── jwt.ts                 # JWT sign/verify wrappers
```

---

## 🎨 Design & Architecture Choices
- **Custom Auth**: Used custom JWTs and cookies rather than external vendors (like NextAuth or Clerk) to showcase raw coding skills, JWT signature handling, and cookie security mechanics.
- **AI Resiliency**: The Gemini API wrapper contains complete context mock generators. If the reviewer's internet connection drops or no API key is present, the app switches to offline mode with realistic mock interview prompts and evaluations.
- **Edge Routing**: Next.js Middleware acts as a gatekeeper. By inspecting cookies at the network edge, redirects are executed instantaneously.

---

## 👨‍💻 Submission Details
- **Developer Name**: Harsh
- **GitHub**: [github.com/Harshhh119](https://github.com/Harshhh119)
- **LinkedIn**: [linkedin.com/in/harsh-vardhan-67028125a/](https://www.linkedin.com/in/harsh-vardhan-67028125a/)
- **Target Role**: Fullstack Developer (Full-time Assignment 2)
