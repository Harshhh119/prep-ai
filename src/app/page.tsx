import React from "react";
import Link from "next/link";
import { Brain, Star, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { GlassCard, CustomButton } from "@/components/ui/Elements";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-6xl mx-auto w-full">
      {/* Hero Section */}
      <section className="text-center mt-8 mb-16 space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase animate-pulse-slow">
          <Star className="w-3.5 h-3.5 fill-indigo-400" />
          <span>AI-Powered Career Accelerator</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-300 leading-tight">
          Ace Your Technical Interviews with AI
        </h1>
        
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Get real-time, constructive mock interviews generated on-the-fly. Receive detailed code reviews, communication grades, and a personalized study roadmap to land your dream job.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto">
            <CustomButton className="w-full sm:w-auto px-8 py-3 text-base">
              <span>Start Free Interview</span>
              <ArrowRight className="w-5 h-5" />
            </CustomButton>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <CustomButton variant="secondary" className="w-full sm:w-auto px-8 py-3 text-base">
              <span>Sign In to Dashboard</span>
            </CustomButton>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-20">
        
        {/* Feature 1 */}
        <GlassCard hoverEffect className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Dynamic AI Scenarios</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Specify your role (Frontend, Backend, Fullstack, etc.) and difficulty. Our AI dynamically generates highly relevant, context-aware coding and architectural questions.
          </p>
        </GlassCard>

        {/* Feature 2 */}
        <GlassCard hoverEffect className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Granular Score Breakdown</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Get instant feedback for each answer. See your model answer comparison, score distribution, communication clarity rating, and exactly what points were missed.
          </p>
        </GlassCard>

        {/* Feature 3 */}
        <GlassCard hoverEffect className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Personalized Roadmap</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Once you finish, receive a tailored markdown roadmap complete with learning checklists, coding drills, and conceptual topics to study based directly on your weak spots.
          </p>
        </GlassCard>

      </section>

      {/* Demo Section or Stat Panel */}
      <section className="w-full">
        <GlassCard className="relative overflow-hidden border border-white/5 bg-gradient-to-r from-black/45 via-indigo-950/10 to-black/45 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Designed for ambitious students and freshers
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                As a student stepping into the industry, preparing for interviews can feel overwhelming. PrepAI acts as a friendly mentor that evaluates your readiness, points out bugs in your code explanations, and generates structured roadmaps so you know exactly what to study next.
              </p>
              
              <ul className="space-y-3">
                {[
                  "No credit card required. Start immediately.",
                  "Perfect for tech roles: Frontend, Backend, Fullstack, Mobile.",
                  "Fully secure local storage and JWT cookie protection.",
                  "Integrates the latest Google Gemini 1.5 model."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 border border-white/10 bg-black/60 rounded-xl p-6 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-zinc-500">Live Interview Sandbox</span>
              </div>
              <div className="space-y-4 text-xs font-mono text-zinc-400">
                <p className="text-indigo-300 font-bold">// Question 1 of 5</p>
                <p className="text-zinc-200">"Explain reconciliation in React and the purpose of keys."</p>
                <div className="bg-zinc-950/60 p-3 rounded border border-white/5 text-zinc-500">
                  Type your explanation here...
                </div>
                <div className="flex justify-end">
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded font-sans font-bold flex items-center gap-1 cursor-default">
                    Submit Answer <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

          </div>
        </GlassCard>
      </section>

    </div>
  );
}
