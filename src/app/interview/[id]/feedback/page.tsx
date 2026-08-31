"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckSquare, 
  TrendingUp, 
  MessageSquare,
  Sparkles
} from "lucide-react";
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
  overallScore: number | null;
  feedbackSummary: string | null;
  personalizedRoadmap: string | null;
  status: string;
  questions: Question[];
}

export default function InterviewFeedback({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/interviews/${sessionId}`);
      if (!res.ok) {
        throw new Error("Failed to retrieve feedback reports");
      }
      const data = await res.json();
      setSession(data.session);
      
      // Auto expand first question
      if (data.session.questions.length > 0) {
        setExpandedQId(data.session.questions[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [sessionId]);

  const toggleExpand = (id: string) => {
    if (expandedQId === id) {
      setExpandedQId(null);
    } else {
      setExpandedQId(id);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-slate-500 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">Compiling AI grade sheets...</span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-3 rounded-lg bg-red-50 border-red-200 text-red-600 text-sm">
          {error || "Session not found"}
        </div>
        <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 w-full space-y-10 flex-grow flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Assessment Report</h1>
        </div>
        <Link href="/interview/new" className="w-full sm:w-auto">
          <CustomButton className="w-full sm:w-auto px-5 py-2">
            <span>Take Another Interview</span>
          </CustomButton>
        </Link>
      </div>

      {/* Summary Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <GlassCard className="flex flex-col justify-center items-center text-center p-8 border border-indigo-200 bg-indigo-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-xl pointer-events-none" />
          <Award className="w-10 h-10 text-indigo-600 mb-2" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Rating</p>
          <p className="text-6xl font-extrabold text-slate-900 mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-300">
            {session.overallScore}%
          </p>
          <span className="text-[10px] text-slate-500 mt-2 px-2 py-0.5 rounded bg-slate-100 uppercase font-bold tracking-wide">
            {session.difficulty} • {session.role}
          </span>
        </GlassCard>

        {/* AI Performance Evaluation */}
        <GlassCard className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-700">Evaluator Synthesis</h3>
          </div>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed">
            {session.feedbackSummary || "No overall feedback available. Evaluation pending."}
          </p>
        </GlassCard>
      </div>

      {/* Grid: Question reviews vs Personalized Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Question-by-Question Accordions */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <BookOpen className="w-5 h-5 text-slate-500" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Question Breakdown</h3>
          </div>

          <div className="space-y-4">
            {session.questions.map((q, index) => {
              const isExpanded = expandedQId === q.id;
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-all bg-slate-50 hover:border-indigo-200"
                >
                  {/* Header Button */}
                  <button
                    onClick={() => toggleExpand(q.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="space-y-1 max-w-[85%]">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                        Question {index + 1}
                      </span>
                      <p className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-1">
                        {q.questionText}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        (q.aiScore ?? 0) >= 80 
                          ? "bg-green-50 text-green-600 border-green-200" 
                          : (q.aiScore ?? 0) >= 50
                          ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {q.aiScore ?? 0}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-200 space-y-4 text-xs sm:text-sm bg-slate-50">
                      {/* Full Question Text */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Prompt</span>
                        <p className="text-slate-900 font-medium leading-relaxed">{q.questionText}</p>
                      </div>

                      {/* User Answer */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Answer</span>
                        <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {q.userAnswer || "[No response entered]"}
                        </div>
                      </div>

                      {/* AI Feedback */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>AI Assessment Critique</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed bg-purple-50 border border-purple-200 p-3 rounded-lg">
                          {q.aiFeedback || "Evaluation details missing."}
                        </p>
                      </div>

                      {/* Model Answer comparison */}
                      {q.modelAnswer && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Recommended Model Response</span>
                          </span>
                          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 leading-relaxed font-sans max-h-40 overflow-y-auto whitespace-pre-wrap">
                            {q.modelAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Personalized Roadmap panel */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Personalized Roadmap</h3>
          </div>

          <GlassCard className="space-y-4 border border-indigo-200 bg-indigo-50/50">
            <div className="prose prose-invert prose-xs text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
              {session.personalizedRoadmap ? (
                /* Format simple markdown lists into clean segments manually */
                session.personalizedRoadmap.split("\n\n").map((section, secIdx) => {
                  if (section.startsWith("###")) {
                    return (
                      <h4 key={secIdx} className="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-200 pb-1 mt-3">
                        {section.replace("###", "").trim()}
                      </h4>
                    );
                  }
                  
                  // Render checkboxes properly
                  if (section.includes("- [ ]")) {
                    const lines = section.split("\n").filter(l => l.trim() !== "");
                    return (
                      <div key={secIdx} className="space-y-2.5">
                        {lines.map((line, lineIdx) => {
                          const cleanText = line.replace("- [ ]", "").replace("- [x]", "").trim();
                          return (
                            <label key={lineIdx} className="flex items-start gap-2.5 group cursor-pointer text-slate-500 hover:text-slate-800 transition-colors">
                              <input
                                type="checkbox"
                                className="mt-1 w-3.5 h-3.5 rounded bg-white border-slate-200 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-white cursor-pointer"
                              />
                              <span className="text-xs select-none leading-relaxed">{cleanText}</span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  }

                  return <p key={secIdx}>{section}</p>;
                })
              ) : (
                <p className="text-slate-400">Roadmap generation failed or pending...</p>
              )}
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
