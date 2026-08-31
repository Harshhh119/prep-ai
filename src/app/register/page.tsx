"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight, Brain } from "lucide-react";
import { GlassCard, CustomButton, FormInput } from "@/components/ui/Elements";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Registration successful, redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Connection failed. Make sure DB is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        
        {/* Header decoration */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-2">
            <Brain className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-slate-500 text-sm">Join PrepAI to start practice interviews</p>
        </div>

        {/* Card Form */}
        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <FormInput
              label="Full Name"
              type="text"
              name="name"
              id="name"
              placeholder="Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />

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
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </CustomButton>
          </form>

          {/* Footer controls */}
          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center justify-center gap-1 mt-1 hover:underline">
              <span>Sign in instead</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
