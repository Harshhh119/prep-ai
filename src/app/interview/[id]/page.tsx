"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Send, 
  Award, 
  HelpCircle, 
  CheckCircle,
  FileCheck,
  Brain
} from "lucide-react";
import Link from "next/link";
import { GlassCard, CustomButton } from "@/components/ui/Elements";

interface Question {
  id: string;
  questionText: string;
  orderIndex: number;
  userAnswer: string | null;
  aiScore: number | null;
  aiFeedback: string | null;
  modelAnswer: string | null;
}

interface Session {
  id: string;
  title: string;
  role: string;
  difficulty: string;
  status: string;
  questions: Question[];
}

export default function LiveInterview({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState("");

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/interviews/${sessionId}`);
      if (!res.ok) {
        throw new Error("Failed to load interview session details");
      }
      const data = await res.json();
      setSession(data.session);
      
      // Find first unanswered question to resume if they left mid-session
      const firstUnanswered = data.session.questions.findIndex(
        (q: Question) => !q.userAnswer
      );
      if (firstUnanswered !== -1) {
        setActiveIdx(firstUnanswered);
      } else {
        // All answered but session not finalized
        setActiveIdx(data.session.questions.length - 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const handleAnswerSubmit = async () => {
    if (!session) return;
    const currentQuestion = session.questions[activeIdx];
    
    setEvaluating(true);
    setError("");

    try {
      // 1. Submit single answer for AI evaluation
      const evalRes = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: answer,
        }),
      });

      const evalData = await evalRes.json();
      if (!evalRes.ok) {
        throw new Error(evalData.error || "Evaluation failed");
      }

      // Update local question object with response
      const updatedQuestions = [...session.questions];
      updatedQuestions[activeIdx] = evalData.evaluation;
      setSession({ ...session, questions: updatedQuestions });

      // 2. Check if we have more questions to ask
      if (activeIdx < session.questions.length - 1) {
        // Move to next question and clear textarea
        setActiveIdx(activeIdx + 1);
        setAnswer("");
      } else {
        // 3. Finalize interview if it was the last question
        setFinalizing(true);
        const finalRes = await fetch("/api/ai/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session.id }),
        });

        const finalData = await finalRes.json();
        if (!finalRes.ok) {
          throw new Error(finalData.error || "Final synthesis failed");
        }

        // Navigate to final feedback report view
        router.push(`/interview/${session.id}/feedback`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit response");
    } finally {
      setEvaluating(false);
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-zinc-400 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">Loading simulator environment...</span>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
        <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!session) return null;

  const currentQuestion = session.questions[activeIdx];
  const progressPercent = Math.round(((activeIdx) / session.questions.length) * 100);
  const isLastQuestion = activeIdx === session.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full space-y-8 flex-grow flex flex-col">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
            {session.difficulty} level
          </span>
          <h1 className="text-2xl font-bold text-white mt-1.5">{session.title}</h1>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Simulation</span>
        </Link>
      </div>

      {/* Progress HUD */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-zinc-400">
          <span>Question {activeIdx + 1} of {session.questions.length}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main HUD Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow items-stretch">
        
        {/* Question Panel */}
        <GlassCard className="md:col-span-2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">AI Question Prompter</span>
            </div>
            
            <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQuestion.questionText}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span className="font-semibold">Type your response below:</span>
              <span>{answer.length} chars</span>
            </div>
            
            <textarea
              className="w-full h-48 px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-mono resize-none"
              placeholder="Explain your approach, list technical keywords, or mock down pseudo code..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={evaluating || finalizing}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <CustomButton
                onClick={handleAnswerSubmit}
                disabled={evaluating || finalizing}
                className="px-6 py-2.5"
              >
                {evaluating || finalizing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <span>{isLastQuestion ? "Finish Interview" : "Submit Answer & Next"}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </CustomButton>
            </div>

          </div>
        </GlassCard>

        {/* Side Panel: Tips & Quick Badges */}
        <div className="flex flex-col gap-6">
          <GlassCard className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Brain className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Interview Tips</span>
            </div>
            
            <ul className="text-xs text-zinc-400 space-y-3 leading-relaxed list-disc list-inside">
              <li>Structure your answers using the <strong className="text-zinc-300">STAR method</strong> (Situation, Task, Action, Result).</li>
              <li>Include concrete technology names (e.g. specify Redis for backend queues or next/image for image performance).</li>
              <li>Don't be afraid to explain trade-offs. Discuss pros vs cons.</li>
            </ul>
          </GlassCard>

          <GlassCard className="flex-grow flex flex-col justify-center items-center text-center p-6 border border-white/5 space-y-4">
            <Award className="w-8 h-8 text-indigo-400" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Gemini Grading Core</p>
              <p className="text-xs text-zinc-400 max-w-[200px] mx-auto leading-relaxed">
                Your response is processed in real time. We grade your technical accuracy and contextual depth.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" />
              <span>Response Autograding Active</span>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
