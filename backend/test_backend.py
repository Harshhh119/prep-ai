import sys
import os

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("========================================")
    print("  Testing PrepAI Python FastAPI Backend ")
    print("========================================")

    # 1. Health Check
    res = client.get("/")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health check passed (/):", res.json())

    # 2. User Registration
    test_email = "python_dev@test.com"
    test_password = "password123"
    reg_data = {
        "name": "Python Tester",
        "email": test_email,
        "password": test_password
    }
    res = client.post("/api/auth/register", json=reg_data)
    # Status can be 201 or 409 if already registered
    assert res.status_code in [201, 409], f"Registration failed: {res.text}"
    print(f"[PASS] Registration endpoint passed ({res.status_code}):", res.json())

    # 3. User Login
    login_data = {
        "email": test_email,
        "password": test_password
    }
    res = client.post("/api/auth/login", json=login_data)
    assert res.status_code == 200, f"Login failed: {res.text}"
    login_json = res.json()
    token = login_json.get("token")
    assert token, "No token returned in login response"
    print("[PASS] Login passed. Token generated:", token[:20] + "...")

    # 4. Get Current User (/api/auth/me)
    # Using cookies set by login or headers
    res = client.get("/api/auth/me")
    assert res.status_code == 200, f"Get user failed: {res.text}"
    user_info = res.json().get("user")
    assert user_info and user_info["email"] == test_email
    print("[PASS] Get current user (/api/auth/me) passed:", user_info)

    # 5. Create Interview Session
    interview_req = {
        "role": "Frontend Developer",
        "difficulty": "Entry Level"
    }
    res = client.post("/api/interviews", json=interview_req)
    assert res.status_code == 201, f"Create interview failed: {res.text}"
    session_data = res.json().get("session")
    session_id = session_data["id"]
    print(f"[PASS] Created interview session ({session_id}):", session_data["title"])

    # 6. Get Interview Details (Verify questions created)
    res = client.get(f"/api/interviews/{session_id}")
    assert res.status_code == 200, f"Get interview detail failed: {res.text}"
    detail_data = res.json().get("session")
    questions = detail_data["questions"]
    assert len(questions) == 5, f"Expected 5 questions, got {len(questions)}"
    first_question = questions[0]
    print(f"[PASS] Retrieved session with {len(questions)} questions. Q1: {first_question['questionText'][:50]}...")

    # 7. Evaluate First Question Answer
    eval_req = {
        "questionId": first_question["id"],
        "answerText": "React Server Components run on the server and reduce client bundle size, while Client Components use useState and useEffect for client interactivity."
    }
    res = client.post("/api/ai/evaluate", json=eval_req)
    assert res.status_code == 200, f"Evaluate answer failed: {res.text}"
    eval_data = res.json().get("evaluation")
    print(f"[PASS] AI Answer evaluated successfully. Score: {eval_data['aiScore']}%, Feedback: {eval_data['aiFeedback'][:60]}...")

    # 8. Finalize Interview Session & Generate Roadmap
    final_req = {
        "sessionId": session_id
    }
    res = client.post("/api/ai/finalize", json=final_req)
    assert res.status_code == 200, f"Finalize session failed: {res.text}"
    final_data = res.json().get("session")
    assert final_data["status"] == "COMPLETED"
    print(f"[PASS] Interview finalized successfully! Overall Score: {final_data['overallScore']}%, Roadmap generated!")

    # 9. List All User Interviews
    res = client.get("/api/interviews")
    assert res.status_code == 200, f"List interviews failed: {res.text}"
    interviews_list = res.json().get("interviews")
    assert len(interviews_list) >= 1
    print(f"[PASS] Listed interviews. Total user sessions: {len(interviews_list)}")

    # 10. Delete Interview Session
    res = client.delete(f"/api/interviews/{session_id}")
    assert res.status_code == 200, f"Delete interview failed: {res.text}"
    print(f"[PASS] Deleted interview session ({session_id}) successfully.")

    print("\n========================================")
    print("  ALL 10 BACKEND INTEGRATION TESTS PASSED! ")
    print("========================================\n")

if __name__ == "__main__":
    run_tests()
