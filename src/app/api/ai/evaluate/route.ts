import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { evaluateAnswer } from "@/lib/ai";
import { z } from "zod";

const evaluateSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),
  answerText: z.string().max(10000, "Answer cannot exceed 10,000 characters"),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }

    const body = await req.json();
    const result = evaluateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { questionId, answerText } = result.data;

    // Retrieve question and session details
    const question = await db.interviewQuestion.findUnique({
      where: { id: questionId },
      include: {
        session: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.session.userId !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (question.session.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot modify completed interviews" }, { status: 400 });
    }

    // Call Gemini AI evaluation
    const evaluation = await evaluateAnswer(
      question.questionText,
      answerText,
      question.session.role
    );

    // Save evaluation to DB
    const updatedQuestion = await db.interviewQuestion.update({
      where: { id: questionId },
      data: {
        userAnswer: answerText,
        aiScore: evaluation.score,
        aiFeedback: evaluation.feedback,
        modelAnswer: evaluation.modelAnswer,
      },
    });

    return NextResponse.json({ evaluation: updatedQuestion });
  } catch (error) {
    console.error("Evaluate answer error:", error);
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 });
  }
}
