import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";

// GET: Retrieve a single interview session and its questions
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }

    const session = await db.interviewSession.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    // Authorization check: Make sure user owns this session
    if (session.userId !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Retrieve session error:", error);
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}

// DELETE: Remove an interview session (Delete operation)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }

    const session = await db.interviewSession.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    if (session.userId !== decoded.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete session (cascade deletes questions due to relation setup in schema)
    await db.interviewSession.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Interview session deleted successfully" });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
