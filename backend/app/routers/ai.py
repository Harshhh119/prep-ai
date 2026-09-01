from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, InterviewSession, InterviewQuestion
from ..schemas import AnswerEvaluateRequest, FinalizeInterviewRequest
from ..auth import get_current_user
from ..services.ai_service import evaluate_answer as ai_evaluate, finalize_interview as ai_finalize

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/evaluate")
def evaluate_answer(
    data: AnswerEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == data.questionId).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    if question.session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    if question.session.status == "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify completed interviews"
        )

    # Call Gemini evaluation
    eval_res = ai_evaluate(
        question=question.question_text,
        answer=data.answerText,
        role=question.session.role
    )

    # Save to database
    question.user_answer = data.answerText
    question.ai_score = eval_res["score"]
    question.ai_feedback = eval_res["feedback"]
    question.model_answer = eval_res["modelAnswer"]
    db.commit()
    db.refresh(question)

    return {
        "evaluation": {
            "id": question.id,
            "questionText": question.question_text,
            "orderIndex": question.order_index,
            "userAnswer": question.user_answer,
            "aiScore": question.ai_score,
            "aiFeedback": question.ai_feedback,
            "modelAnswer": question.model_answer,
            "createdAt": question.created_at.isoformat() if question.created_at else None
        }
    }

@router.post("/finalize")
def finalize_interview(
    data: FinalizeInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_obj = db.query(InterviewSession).filter(InterviewSession.id == data.sessionId).first()
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    if session_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    if session_obj.status == "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is already completed"
        )

    qa_list = [
        {
            "question_text": q.question_text,
            "user_answer": q.user_answer,
            "ai_score": q.ai_score,
            "ai_feedback": q.ai_feedback
        }
        for q in session_obj.questions
    ]

    final_report = ai_finalize(
        role=session_obj.role,
        difficulty=session_obj.difficulty,
        qa_list=qa_list
    )

    session_obj.overall_score = final_report["overallScore"]
    session_obj.feedback_summary = final_report["feedbackSummary"]
    session_obj.personalized_roadmap = final_report["personalizedRoadmap"]
    session_obj.status = "COMPLETED"

    db.commit()
    db.refresh(session_obj)

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
            "createdAt": session_obj.created_at.isoformat() if session_obj.created_at else None
        }
    }
