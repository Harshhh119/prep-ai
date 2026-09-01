from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, InterviewSession, InterviewQuestion
from ..schemas import InterviewCreate
from ..auth import get_current_user
from ..services.ai_service import generate_questions

router = APIRouter(prefix="/api/interviews", tags=["interviews"])

@router.get("")
def list_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )

    interviews_data = []
    for s in sessions:
        interviews_data.append({
            "id": s.id,
            "title": s.title,
            "role": s.role,
            "difficulty": s.difficulty,
            "overallScore": s.overall_score,
            "status": s.status,
            "createdAt": s.created_at.isoformat() if s.created_at else None,
            "_count": {
                "questions": len(s.questions)
            }
        })

    return {"interviews": interviews_data}

@router.post("", status_code=status.HTTP_201_CREATED)
def create_interview(
    data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Generate questions using Gemini AI service
    questions_list = generate_questions(data.role, data.difficulty)
    if not questions_list:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate interview questions"
        )

    # 2. Create InterviewSession record
    new_session = InterviewSession(
        user_id=current_user.id,
        title=f"{data.difficulty} {data.role} Interview",
        role=data.role,
        difficulty=data.difficulty,
        status="IN_PROGRESS"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # 3. Create InterviewQuestion records
    for index, q_text in enumerate(questions_list):
        question_item = InterviewQuestion(
            session_id=new_session.id,
            question_text=q_text,
            order_index=index
        )
        db.add(question_item)

    db.commit()

    return {
        "session": {
            "id": new_session.id,
            "title": new_session.title,
            "role": new_session.role,
            "difficulty": new_session.difficulty,
            "status": new_session.status
        }
    }

@router.get("/{session_id}")
def get_interview(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_obj = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    if session_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    questions_data = [
        {
            "id": q.id,
            "questionText": q.question_text,
            "orderIndex": q.order_index,
            "userAnswer": q.user_answer,
            "aiScore": q.ai_score,
            "aiFeedback": q.ai_feedback,
            "modelAnswer": q.model_answer,
            "createdAt": q.created_at.isoformat() if q.created_at else None
        }
        for q in session_obj.questions
    ]

    return {
        "session": {
            "id": session_obj.id,
            "title": session_obj.title,
            "role": session_obj.role,
            "difficulty": session_obj.difficulty,
            "overallScore": session_obj.overall_score,
            "feedbackSummary": session_obj.feedback_summary,
            "personalizedRoadmap": session_obj.personalized_roadmap,
            "status": session_obj.status,
            "createdAt": session_obj.created_at.isoformat() if session_obj.created_at else None,
            "questions": questions_data
        }
    }

@router.delete("/{session_id}")
def delete_interview(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_obj = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )

    if session_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    db.delete(session_obj)
    db.commit()

    return {"message": "Interview session deleted successfully"}
