import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, interviews, ai

# Auto-create all tables in database on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PrepAI Backend API",
    description="Python FastAPI backend for PrepAI technical mock interview platform",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://prep-ai-nu-three.vercel.app",
    "https://prep-ai-six.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router)
app.include_router(interviews.router)
app.include_router(ai.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "PrepAI Python Backend",
        "docs": "/docs"
    }
