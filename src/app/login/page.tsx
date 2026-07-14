"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, ArrowRight, Brain } from "lucide-react";
import { GlassCard, CustomButton, FormInput } from "@/components/ui/Elements";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show registration success banner if navigated from register
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please sign in.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Check if redirect path exists
      const fromPath = searchParams.get("from") || "/dashboard";
      router.push(fromPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Connection failed. Verify database is initialized.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header decoration */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
          <Brain className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
        <p className="text-zinc-400 text-sm">Sign in to resume mock interviews</p>
      </div>

      {/* Card Form */}
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              {success}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <FormInput
            label="Email Address"
            type="email"
            name="email"
            id="email"
            placeholder="alex@university.edu"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <CustomButton type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </CustomButton>
        </form>

        {/* Footer controls */}
        <div className="mt-6 text-center text-xs text-zinc-400 border-t border-white/5 pt-4">
          New to PrepAI?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-center gap-1 mt-1 hover:underline">
            <span>Create an account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4">
      <Suspense fallback={<div className="text-zinc-400 text-sm">Loading login...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
