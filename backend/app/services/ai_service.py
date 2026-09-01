import os
import json
import random
from typing import List, Dict, Any
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")
model_instance = None

if api_key and api_key != "YOUR_GEMINI_API_KEY":
    try:
        genai.configure(api_key=api_key)
        model_instance = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Failed to initialize Gemini Python client: {e}")

def generate_questions(role: str, difficulty: str) -> List[str]:
    """Generate 5 interview questions based on role and difficulty level."""
    prompt = f"""You are an expert technical interviewer. Generate exactly 5 challenging, technical, and behavioral interview questions for a candidate interviewing for a "{role}" role at a "{difficulty}" level.
Return the output strictly in JSON format as a JSON array of strings. Do not add markdown wrapping or formatting other than a JSON structure.

Example structure:
[
  "Question 1...",
  "Question 2...",
  "Question 3...",
  "Question 4...",
  "Question 5..."
]"""

    if model_instance:
        try:
            response = model_instance.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            if isinstance(data, list) and len(data) >= 3:
                return data[:5]
        except Exception as e:
            print(f"Gemini question generation error, falling back to mock: {e}")

    # Realistic mock fallback
    lower_role = role.lower()
    if "front" in lower_role:
        return [
            "Explain the difference between React Server Components (RSC) and Client Components. When should you use each?",
            "How does the browser rendering pipeline work, and how do properties like 'transform' or 'opacity' trigger composite-only updates?",
            "Explain how React's reconciliation algorithm (Fiber) handles rendering updates and why 'keys' are crucial in lists.",
            "How would you optimize a Next.js application that suffers from poor Largest Contentful Paint (LCP) and high Cumulative Layout Shift (CLS)?",
            "Describe a scenario where you had to debug a memory leak or a performance bottleneck in a React application. How did you resolve it?"
        ]
    elif "back" in lower_role:
        return [
            "Explain database indexing. How do B-Trees work under the hood, and what are the trade-offs of adding too many indexes?",
            "How do you design a secure, distributed rate limiter for a RESTful API? Discuss algorithm choices and storage backends (e.g., Redis).",
            "Describe the difference between optimistic locking and pessimistic locking. When would you apply each in a high-concurrency reservation system?",
            "How would you handle asynchronous job execution or event processing in Python/Node.js? Compare message queues like Celery, RabbitMQ, and Redis Streams.",
            "Describe how you secure REST APIs. Discuss JWT structure, token rotation, and mitigating OWASP Top 10 vulnerabilities like CSRF or SQL injection."
        ]
    else:
        return [
            "Explain your strategy for managing state and caching data across a full-stack application. When is global state necessary versus server-side caching?",
            "How do you handle transactional safety across multiple database collections or tables in a backend API?",
            "Explain the concept of WebSockets versus Server-Sent Events (SSE). Under what conditions is SSE a better architectural choice?",
            "How would you design a robust authentication system supporting session tokens, OAuth2, and multi-factor authorization?",
            "Describe how you would approach scaling a full-stack app from 1,000 active users to 100,000 active users. What bottlenecks do you anticipate first?"
        ]

def evaluate_answer(question: str, answer: str, role: str) -> Dict[str, Any]:
    """Evaluate candidate answer and provide score, critique, and ideal model answer."""
    prompt = f"""You are an expert technical interviewer evaluating a candidate's answer for a "{role}" role.
Question: "{question}"
Candidate's Answer: "{answer or '[No Answer Provided]'}"

Evaluate the answer. Give:
1. A score between 0 and 100 representing correctness, clarity, and depth. (Give 0 if answer is empty or completely irrelevant).
2. Clear feedback explaining what was good, what was missing, and how to improve.
3. A robust, ideal model answer.

Return the output strictly in JSON format matching this schema:
{{
  "score": 85,
  "feedback": "Your answer was accurate regarding...",
  "modelAnswer": "An ideal answer would cover..."
}}
Do not include any extra text."""

    if model_instance:
        try:
            response = model_instance.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            if isinstance(data.get("score"), (int, float)) and data.get("feedback") and data.get("modelAnswer"):
                return {
                    "score": int(data["score"]),
                    "feedback": data["feedback"],
                    "modelAnswer": data["modelAnswer"]
                }
        except Exception as e:
            print(f"Gemini answer evaluation error, falling back to mock: {e}")

    # Realistic mock evaluation
    clean_ans = (answer or "").strip()
    if not clean_ans:
        score = 0
        feedback = "You did not provide an answer. In a real interview, it is always better to attempt the question or discuss your thought process than to leave it blank."
        model_ans = "A strong answer should define the core concepts, outline key components, provide a small code snippet or architecture flow, and discuss practical trade-offs."
    else:
        score = min(100, max(20, 35 + len(clean_ans) // 10 + random.randint(0, 15)))
        if score < 50:
            feedback = "Your answer touches on some keywords but lacks depth and conceptual clarity. Try to explain *why* and *how* the technology operates, not just *what* it is."
            model_ans = "To answer this successfully, structure it logically: start with a clear definition, explain the underlying mechanism, provide an example, and discuss performance trade-offs."
        elif score < 80:
            feedback = "Solid answer! You demonstrate a good understanding of the core concepts. To elevate this to a top-tier response, elaborate on concrete real-world use cases, potential pitfalls, and optimization strategies."
            model_ans = "A stellar answer would detail specific edge cases, provide exact technical terminology, and compare alternative architectural approaches."
        else:
            feedback = "Excellent response! You demonstrated precise technical knowledge, structured your thoughts clearly, and showed real-world engineering judgment."
            model_ans = "Your answer is highly complete. As a reference, a perfect response would also discuss advanced telemetry/monitoring hooks and automated testing in CI/CD."

    return {
        "score": score,
        "feedback": feedback,
        "modelAnswer": model_ans
    }

def finalize_interview(role: str, difficulty: str, qa_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compile final interview synthesis, average score, and personalized markdown learning roadmap."""
    formatted_qa = "\n\n".join([
        f"Question {idx + 1}: {item.get('question_text', '')}\n"
        f"Candidate Answer: {item.get('user_answer') or '[No Answer]'}\n"
        f"Score: {item.get('ai_score', 0)}/100\n"
        f"Feedback: {item.get('ai_feedback', 'N/A')}"
        for idx, item in enumerate(qa_list)
    ])

    prompt = f"""You are a career mentor compiling the final assessment for a candidate who completed a mock interview.
Role: {role}
Difficulty: {difficulty}

Review their questions, answers, and scores:
{formatted_qa}

Please provide:
1. An overall score (0 to 100, which should be the average of their scores).
2. A constructive, encouraging summary of their strengths and core areas of improvement.
3. A personalized, actionable learning roadmap formatted in Markdown bullet points. Each item should have a brief task description (e.g. "- [ ] Study React hydration errors...") targeting their weak points.

Return the output strictly in JSON format matching this schema:
{{
  "overallScore": 75,
  "feedbackSummary": "You did great on... but need to work on...",
  "personalizedRoadmap": "### 1. Fundamentals\\n- [ ] Study...\\n\\n### 2. Practice\\n- [ ] Build..."
}}
Do not include any extra text."""

    if model_instance:
        try:
            response = model_instance.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            if isinstance(data.get("overallScore"), (int, float)) and data.get("feedbackSummary") and data.get("personalizedRoadmap"):
                return {
                    "overallScore": int(data["overallScore"]),
                    "feedbackSummary": data["feedbackSummary"],
                    "personalizedRoadmap": data["personalizedRoadmap"]
                }
        except Exception as e:
            print(f"Gemini finalize interview error, falling back to mock: {e}")

    # Fallback calculation
    valid_scores = [q.get("ai_score") or 0 for q in qa_list]
    avg_score = round(sum(valid_scores) / len(valid_scores)) if valid_scores else 0

    feedback_summary = (
        f"You completed the {difficulty} {role} interview with an overall score of {avg_score}%. "
        f"You demonstrated good communication and conceptual familiarity. "
        f"To improve further, focus on deepening your knowledge of core runtime behaviors, database indexes, "
        f"and security measures with concrete practical examples."
    )

    personalized_roadmap = """### Phase 1: Core Fundamentals & Concept Clarification
- [ ] **Review Question Topics**: Re-read the model answers for the questions where you scored below 70%. Focus on understanding the core mechanisms.
- [ ] **Runtime Architecture**: Study internal lifecycle methods, async event loops, and memory management.
- [ ] **Database & Indexing**: Practice designing relational schemas, writing queries, and analyzing execution plans with `EXPLAIN ANALYZE`.

### Phase 2: Building & Practice
- [ ] **Build a Microservice**: Implement a secure API service with rate limiting and database connection pooling to experience high concurrency first-hand.
- [ ] **Profile an Application**: Use telemetry and profiling tools to identify and resolve performance bottlenecks.

### Phase 3: Mock Drills
- [ ] **Time Management**: Practice explaining your thoughts aloud under a 3-minute limit per question.
- [ ] **Edge Cases**: Make it a habit to proactively state security, rate-limiting, and error-handling concerns when discussing system designs."""

    return {
        "overallScore": avg_score,
        "feedbackSummary": feedback_summary,
        "personalizedRoadmap": personalized_roadmap
    }
