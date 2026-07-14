import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { finalizeInterview } from "@/lib/ai";
import { z } from "zod";

const finalizeSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
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
    const result = finalizeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { sessionId } = result.data;

    // Fetch session and all questions
    const session = await db.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json({ error: "Session is already completed" }, { status: 400 });
    }

    // Call AI to summarize and build roadmap
    const finalReport = await finalizeInterview(
      session.role,
      session.difficulty,
      session.questions
    );

    // Save final report to database and mark session as completed
    const updatedSession = await db.interviewSession.update({
      where: { id: sessionId },
      data: {
        overallScore: finalReport.overallScore,
        feedbackSummary: finalReport.feedbackSummary,
        personalizedRoadmap: finalReport.personalizedRoadmap,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Finalize session error:", error);
    return NextResponse.json({ error: "Failed to finalize session" }, { status: 500 });
  }
}
