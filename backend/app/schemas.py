from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserData(BaseModel):
    id: str
    name: str
    email: str
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True

# Interview Schemas
class InterviewCreate(BaseModel):
    role: str = Field(..., min_length=2)
    difficulty: str = Field(..., min_length=2)

class QuestionOut(BaseModel):
    id: str
    questionText: str
    orderIndex: int
    userAnswer: Optional[str] = None
    aiScore: Optional[int] = None
    aiFeedback: Optional[str] = None
    modelAnswer: Optional[str] = None
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class QuestionCount(BaseModel):
    questions: int

class InterviewSummaryOut(BaseModel):
    id: str
    title: str
    role: str
    difficulty: str
    overallScore: Optional[int] = None
    status: str
    createdAt: datetime
    _count: QuestionCount

class InterviewDetailOut(BaseModel):
    id: str
    title: str
    role: str
    difficulty: str
    overallScore: Optional[int] = None
    feedbackSummary: Optional[str] = None
    personalizedRoadmap: Optional[str] = None
    status: str
    createdAt: datetime
    questions: List[QuestionOut] = []

# AI Evaluation Schemas
class AnswerEvaluateRequest(BaseModel):
    questionId: str
    answerText: str

class FinalizeInterviewRequest(BaseModel):
    sessionId: str
