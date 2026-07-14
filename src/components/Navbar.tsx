"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Brain, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";

interface User {
  name: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user session status
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth status on page transitions

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur-md px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-300">
            PrepAI
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-4">
          {!loading && user ? (
            <>
              {/* Logged In Dashboard & Profile */}
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === "/dashboard"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* User badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/5 text-zinc-300">
                <UserIcon className="w-4 h-4 text-purple-400" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            !loading && (
              <>
                {/* Logged Out Controls */}
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                >
                  Get Started
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
