"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Play, 
  Trash2, 
  Award, 
  BookOpen, 
  ChevronRight, 
  BarChart3, 
  Calendar,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { GlassCard, CustomButton } from "@/components/ui/Elements";

interface Interview {
  id: string;
  title: string;
  role: string;
  difficulty: string;
  overallScore: number | null;
  status: string;
  createdAt: string;
  _count: {
    questions: number;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Developer");

  // Fetch interviews list
  const fetchDashboardData = async () => {
    try {
      // 1. Fetch User details
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserName(userData.user.name);
      }

      // 2. Fetch Interviews
      const res = await fetch("/api/interviews");
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this interview session? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Refresh local list
        setInterviews(interviews.filter(item => item.id !== id));
      } else {
        alert("Failed to delete interview session.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error occurred while trying to delete session.");
    }
  };

  // Calculate metrics
  const completedSessions = interviews.filter(i => i.status === "COMPLETED");
  const totalCompleted = completedSessions.length;
  
  const avgScore = totalCompleted
    ? Math.round(completedSessions.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalCompleted)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 w-full space-y-10 flex-grow flex flex-col">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {userName}!</span>
            <Sparkles className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-1">
            Track your performance, practice new roles, and refine your skills.
          </p>
        </div>
        <Link href="/interview/new" className="w-full md:w-auto">
          <CustomButton className="w-full md:w-auto px-6 py-2.5">
            <Play className="w-4 h-4 fill-white" />
            <span>Start Mock Interview</span>
          </CustomButton>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <GlassCard className="flex items-center gap-5">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Interviews</p>
            <p className="text-3xl font-extrabold text-white mt-1">{interviews.length}</p>
          </div>
        </GlassCard>

        {/* Metric 2 */}
        <GlassCard className="flex items-center gap-5">
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Average AI Score</p>
            <p className="text-3xl font-extrabold text-white mt-1">
              {totalCompleted ? `${avgScore}%` : "N/A"}
            </p>
          </div>
        </GlassCard>

        {/* Metric 3 */}
        <GlassCard className="flex items-center gap-5">
          <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Completed Drills</p>
            <p className="text-3xl font-extrabold text-white mt-1">{totalCompleted}</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: Interview History vs Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        
        {/* Past Interviews List */}
        <GlassCard className="lg:col-span-2 space-y-6 flex flex-col min-h-[400px]">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Interview History</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Manage and review all your mock sessions</p>
          </div>

          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center text-zinc-400 gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-xs font-semibold">Retrieving mock data...</span>
            </div>
          ) : interviews.length === 0 ? (
            <div className="flex-grow border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-4">
              <p className="text-sm max-w-xs">You haven't taken any mock interviews yet. Set up your first session now!</p>
              <Link href="/interview/new">
                <CustomButton variant="secondary" className="px-5 py-2 text-xs">
                  Configure Interview
                </CustomButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
              {interviews.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="space-y-1.5 max-w-[70%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base leading-tight">
                        {session.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        session.difficulty === "Expert" 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : session.difficulty === "Intermediate"
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}>
                        {session.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span>{session._count.questions} questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score / Status Display */}
                    {session.status === "COMPLETED" ? (
                      <div className="text-right">
                        <span className="text-base font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                          {session.overallScore}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                        In Progress
                      </span>
                    )}

                    {/* Navigation button */}
                    <Link
                      href={
                        session.status === "COMPLETED"
                          ? `/interview/${session.id}/feedback`
                          : `/interview/${session.id}`
                      }
                      className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-indigo-600 hover:text-white transition-all text-zinc-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>

                    {/* Delete button (CRUD - Delete) */}
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all text-zinc-400 cursor-pointer"
                      title="Delete interview"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Analytics Card */}
        <GlassCard className="flex flex-col space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span>Performance Analytics</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Mock score progression</p>
          </div>

          <div className="flex-grow flex flex-col justify-between min-h-[250px]">
            {totalCompleted === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-zinc-400 p-4 border border-dashed border-white/5 rounded-xl">
                <span className="text-xs max-w-[180px]">Complete at least one mock interview to view scoring trends.</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Simulated Chart using inline styled blocks */}
                <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-white/10 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1">
                    <div className="w-full border-t border-white/5 text-[9px] text-zinc-600 text-right pr-1">100%</div>
                    <div className="w-full border-t border-white/5 text-[9px] text-zinc-600 text-right pr-1">50%</div>
                    <div className="w-full border-t border-white/5 text-[9px] text-zinc-600 text-right pr-1">0%</div>
                  </div>
                  
                  {/* Bars (up to the last 5 sessions) */}
                  {completedSessions.slice(-5).reverse().map((item, idx) => (
                    <div key={item.id} className="flex flex-col items-center gap-2 w-1/5 group z-10">
                      {/* Tooltip on hover */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-0.5 rounded text-[10px] text-white absolute -top-2">
                        {item.overallScore}%
                      </span>
                      {/* Bar fill */}
                      <div
                        style={{ height: `${item.overallScore || 0}%` }}
                        className="w-8 rounded-t bg-gradient-to-t from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 transition-all duration-500 flex items-end justify-center shadow-lg shadow-indigo-500/20"
                      />
                      <span className="text-[10px] text-zinc-500 max-w-[60px] truncate block text-center">
                        Mock #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Average Performance:</span>
                    <span className="text-indigo-400 font-extrabold">{avgScore}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                    🔥 Complete more interview modules to calibrate your rating and identify study gaps.
                  </p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

      </div>

    </div>
  );
}
