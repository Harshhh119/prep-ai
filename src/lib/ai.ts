import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini Client safely
let genAI: GoogleGenerativeAI | null = null;
if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("Failed to initialize Gemini API client:", error);
  }
}

// Interfaces
interface AnswerEvaluation {
  score: number;
  feedback: string;
  modelAnswer: string;
}

interface InterviewSummary {
  overallScore: number;
  feedbackSummary: string;
  personalizedRoadmap: string; // Markdown formatted
}

/**
 * Generate 5 questions based on role and difficulty.
 */
export async function generateQuestions(role: string, difficulty: string): Promise<string[]> {
  const prompt = `You are an expert interviewer. Generate exactly 5 challenging, technical, and behavioral interview questions for a candidate interviewing for a "${role}" role at a "${difficulty}" level.
  Return the output strictly in JSON format as a JSON array of strings. Do not add markdown wrapping or formatting other than a JSON structure.
  
  Example structure:
  [
    "Question 1...",
    "Question 2...",
    "Question 3...",
    "Question 4...",
    "Question 5..."
  ]`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const responseText = result.response.text().trim();
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 5);
      }
    } catch (error) {
      console.error("Gemini question generation error, falling back to mock:", error);
    }
  }

  // High-quality mock fallback for standard roles
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("front")) {
    return [
      "Explain the difference between React Server Components (RSC) and Client Components. When should you use each?",
      "How does the browser rendering pipeline work, and how do properties like 'transform' or 'opacity' trigger composite-only updates?",
      "Explain how React's reconciliation algorithm (Fiber) handles rendering updates and why 'keys' are crucial in lists.",
      "How would you optimize a Next.js application that suffers from poor Largest Contentful Paint (LCP) and high Cumulative Layout Shift (CLS)?",
      "Describe a scenario where you had to debug a memory leak or a performance bottleneck in a React application. How did you resolve it?"
    ];
  } else if (lowerRole.includes("back")) {
    return [
      "Explain database indexing. How do B-Trees work under the hood, and what are the trade-offs of adding too many indexes?",
      "How do you design a secure, distributed rate limiter for a RESTful API? Discuss algorithm choices and storage backends (e.g., Redis).",
      "Describe the difference between optimistic locking and pessimistic locking. When would you apply each in a high-concurrency reservation system?",
      "How would you handle asynchronous job execution or event processing in Node.js? Compare message queues like RabbitMQ vs Redis Streams vs Kafka.",
      "Describe how you secure REST APIs. Discuss JWT structure, token rotation, and mitigating OWASP Top 10 vulnerabilities like CSRF or SQL injection."
    ];
  } else {
    // Default / Fullstack mock questions
    return [
      "Explain your strategy for managing state and caching data across a full-stack Next.js application. When is global state (e.g., Zustand/Redux) necessary versus server-side caching?",
      "How do you handle transactional safety across multiple database collections or tables in a Node.js API?",
      "Explain the concept of WebSockets versus Server-Sent Events (SSE). Under what conditions is SSE a better architectural choice?",
      "How would you design a robust authentication system supporting session tokens, OAuth2, and multi-factor authorization?",
      "Describe how you would approach scaling a full-stack app from 1,000 active users to 100,000 active users. What bottlenecks do you anticipate first?"
    ];
  }
}

/**
 * Evaluate an individual answer.
 */
export async function evaluateAnswer(
  question: string,
  answer: string,
  role: string
): Promise<AnswerEvaluation> {
  const prompt = `You are an expert technical interviewer evaluating a candidate's answer for a "${role}" role.
  Question: "${question}"
  Candidate's Answer: "${answer || "[No Answer Provided]"}"
  
  Evaluate the answer. Give:
  1. A score between 0 and 100 representing correctness, clarity, and depth. (Give 0 if answer is empty or completely irrelevant).
  2. Clear feedback explaining what was good, what was missing, and how to improve.
  3. A robust, ideal model answer.
  
  Return the output strictly in JSON format matching this schema:
  {
    "score": 85,
    "feedback": "Your answer was accurate regarding...",
    "modelAnswer": "An ideal answer would cover..."
  }
  Do not include any extra text.`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const responseText = result.response.text().trim();
      const parsed = JSON.parse(responseText);
      if (typeof parsed.score === "number" && parsed.feedback && parsed.modelAnswer) {
        return parsed as AnswerEvaluation;
      }
    } catch (error) {
      console.error("Gemini answer evaluation error, falling back to mock:", error);
    }
  }

  // Mock feedback generation
  const score = answer.trim().length === 0 ? 0 : Math.min(100, Math.max(15, 30 + Math.floor(answer.length / 10) + Math.floor(Math.random() * 20)));
  let feedback = "";
  let modelAnswer = "";

  if (score === 0) {
    feedback = "You did not provide an answer. In a real interview, it is always better to attempt the question or discuss your thought process than to leave it blank.";
    modelAnswer = "A strong answer should define the core concepts, outline key components, provide a small code snippet or architecture flow, and discuss practical trade-offs.";
  } else if (score < 50) {
    feedback = "Your answer touches on some keywords but lacks depth and conceptual clarity. Try to explain *why* and *how* the technology operates, not just *what* it is.";
    modelAnswer = "To answer this successfully, you should structure it logically: start with a clear definition, explain the underlying mechanism (e.g. Virtual DOM reconciliation, indexes), provide a short example, and close with performance or architectural implications.";
  } else if (score < 80) {
    feedback = "Solid answer! You demonstrate a good understanding of the core concepts. To elevate this to a top-tier response, you should have elaborated on concrete real-world use cases, potential pitfalls, and optimization strategies.";
    modelAnswer = "A stellar answer would detail specific edge cases (e.g. key collision in React, index fragmentation in DBs), provide exact technical terminology (e.g. paint/layout stages, write amplification), and compare alternative solutions.";
  } else {
    feedback = "Excellent response! You demonstrated precise technical knowledge, structured your thoughts clearly, and showed real-world engineering judgment.";
    modelAnswer = "Your answer is highly complete. As a reference, a perfect response would also discuss advanced telemetry/monitoring hooks and how to test or simulate these scenarios in CI/CD pipelines.";
  }

  return { score, feedback, modelAnswer };
}

/**
 * Compile overall feedback and roadmap.
 */
export async function finalizeInterview(
  role: string,
  difficulty: string,
  qaList: Array<{ questionText: string; userAnswer: string | null; aiScore: number | null; aiFeedback: string | null }>
): Promise<InterviewSummary> {
  const formattedQA = qaList
    .map(
      (item, idx) =>
        `Question ${idx + 1}: ${item.questionText}\nCandidate Answer: ${item.userAnswer || "[No Answer]"}\nScore: ${item.aiScore ?? 0}/100\nFeedback: ${item.aiFeedback ?? "N/A"}`
    )
    .join("\n\n");

  const prompt = `You are a career mentor compiling the final assessment for a candidate who completed a mock interview.
  Role: ${role}
  Difficulty: ${difficulty}
  
  Review their questions, answers, and scores:
  ${formattedQA}
  
  Please provide:
  1. An overall score (0 to 100, which should be the average of their scores).
  2. A constructive, encouraging summary of their strengths and core areas of improvement.
  3. A personalized, actionable learning roadmap formatted in Markdown bullet points. Each item should have a brief task description (e.g. "- [ ] Study React hydration errors...") targeting their weak points.
  
  Return the output strictly in JSON format matching this schema:
  {
    "overallScore": 75,
    "feedbackSummary": "You did great on... but need to work on...",
    "personalizedRoadmap": "### 1. Fundamentals\\n- [ ] Study...\\n\\n### 2. Practice\\n- [ ] Build..."
  }
  Do not include any extra text.`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const responseText = result.response.text().trim();
      const parsed = JSON.parse(responseText);
      if (typeof parsed.overallScore === "number" && parsed.feedbackSummary && parsed.personalizedRoadmap) {
        return parsed as InterviewSummary;
      }
    } catch (error) {
      console.error("Gemini finalize interview error, falling back to mock:", error);
    }
  }

  // Mock finalization
  const validScores = qaList.map(q => q.aiScore ?? 0);
  const avgScore = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;

  const feedbackSummary = `You completed the ${difficulty} ${role} interview with an overall score of ${avgScore}%. You demonstrated decent communication and conceptual familiarity. However, you should focus on deepening your knowledge of core runtime behaviors, performance trade-offs, and security measures. Specifically, try backing your answers with concrete examples rather than just high-level definitions.`;

  const personalizedRoadmap = `### Phase 1: Core Fundamentals & Concept Clarification
- [ ] **Review Question Topics**: Re-read the model answers for the questions where you scored below 70%. Focus on understanding the core mechanisms.
- [ ] **Reconciliation & Hydration**: Read official docs on React Fiber, Server Components, and client hydration.
- [ ] **Data structures and Indexing**: Practice designing DB models and write standard queries, analyzing execution plans with \`EXPLAIN ANALYZE\`.

### Phase 2: Building & Practice
- [ ] **Build a Microservice**: Implement a Node.js service with rate limiting and database connection pooling to experience high concurrency first-hand.
- [ ] **Profile an App**: Use Chrome DevTools Lighthouse to audit a personal React project and resolve LCP/CLS layout shifts.

### Phase 3: Mock Drills
- [ ] **Time Management**: Practice explaining your thoughts aloud under a 3-minute limit per question.
- [ ] **Edge Cases**: Make it a habit to proactively state security, rate-limiting, and error-handling concerns when discussing system designs.`;

  return { overallScore: avgScore, feedbackSummary, personalizedRoadmap };
}
