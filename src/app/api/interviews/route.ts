import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { generateQuestions } from "@/lib/ai";
import { z } from "zod";

const createInterviewSchema = z.object({
  role: z.string().min(2, "Role must be at least 2 characters"),
  difficulty: z.string().min(2, "Difficulty is required"),
});

// GET: Retrieve all mock interviews for the authenticated user
export async function GET() {
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

    const interviews = await db.interviewSession.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("Fetch interviews error:", error);
    return NextResponse.json({ error: "Failed to retrieve interviews" }, { status: 500 });
  }
}

// POST: Configure and start a new mock interview
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
    const result = createInterviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { role, difficulty } = result.data;

    // 1. Generate questions using Gemini AI (or mock fallback)
    const questions = await generateQuestions(role, difficulty);

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: "Failed to generate interview questions" }, { status: 500 });
    }

    // 2. Create InterviewSession & Questions inside a database transaction
    const newSession = await db.$transaction(async (tx) => {
      const session = await tx.interviewSession.create({
        data: {
          userId: decoded.userId,
          title: `${difficulty} ${role} Interview`,
          role,
          difficulty,
          status: "IN_PROGRESS",
        },
      });

      // Insert questions with ordering indexes
      const questionData = questions.map((qText, index) => ({
        sessionId: session.id,
        questionText: qText,
        orderIndex: index,
      }));

      await tx.interviewQuestion.createMany({
        data: questionData,
      });

      return session;
    });

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Start interview error:", error);
    return NextResponse.json({ error: "Internal server error during session creation" }, { status: 500 });
  }
}
