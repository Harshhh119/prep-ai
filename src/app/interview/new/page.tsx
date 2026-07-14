"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlassCard, CustomButton } from "@/components/ui/Elements";

export default function NewInterview() {
  const router = useRouter();
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Entry Level");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) {
      setError("Please specify a target role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      // Session created successfully, navigate to live interview page
      router.push(`/interview/${data.session.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Check API key setup.");
      setLoading(false);
    }
  };

  const predefinedRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Developer",
    "Mobile App Developer",
    "Data Scientist",
    "DevOps Engineer"
  ];

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 max-w-3xl mx-auto w-full">
      <div className="w-full space-y-6">
        
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {loading ? (
          /* Stuning loader screen */
          <GlassCard className="flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 border-r-indigo-500 animate-spin" />
              <Brain className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <span>Generating Questions</span>
                <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400/20 animate-bounce" />
              </h3>
              <p className="text-zinc-400 text-sm max-w-md">
                Our Gemini AI engine is tailoring 5 technical and behavioral interview questions based on the <span className="text-indigo-300 font-semibold">{role}</span> profile. This will take just a few seconds...
              </p>
            </div>
          </GlassCard>
        ) : (
          /* Configuration panel */
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Configure Session</h1>
              <p className="text-zinc-400 text-sm mt-1">Specify your target details below to calibrate the interview simulator.</p>
            </div>

            <GlassCard>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Role select */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
                    Target Role / Domain
                  </label>
                  
                  {/* Select Predefined Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {predefinedRoles.map((predef) => (
                      <button
                        key={predef}
                        type="button"
                        onClick={() => setRole(predef)}
                        className={`p-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                          role === predef
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10"
                            : "bg-black/30 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                        }`}
                      >
                        {predef}
                      </button>
                    ))}
                  </div>

                  {/* Custom Role Input */}
                  <div className="pt-2">
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                      placeholder="Or specify custom role: e.g. React Developer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>

                {/* Difficulty Select */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
                    Experience Level
                  </label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {["Entry Level", "Intermediate", "Expert"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`p-3.5 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                          difficulty === level
                            ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                            : "bg-black/30 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Action */}
                <CustomButton type="submit" className="w-full mt-4 py-3">
                  <span>Initialize AI Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </CustomButton>

              </form>
            </GlassCard>
          </div>
        )}

      </div>
    </div>
  );
}
