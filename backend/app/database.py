import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load .env from backend or root directory
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./prepai.db")

# Normalize PostgreSQL schema URI for SQLAlchemy if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def get_engine(url: str):
    is_sqlite = url.startswith("sqlite")
    return create_engine(
        url,
        connect_args={"check_same_thread": False} if is_sqlite else {},
        pool_pre_ping=True
    )

try:
    engine = get_engine(DATABASE_URL)
    # Test connection if postgresql
    if not DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            pass
except Exception as e:
    print(f"PostgreSQL connection failed ({e}), falling back to SQLite (prepai.db)...")
    DATABASE_URL = "sqlite:///./prepai.db"
    engine = get_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI Dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
