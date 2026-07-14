import React from "react";
import { Mail, Heart } from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-white/10 bg-black/40 backdrop-blur-md py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Copy info */}
        <div className="text-sm text-zinc-400">
          <span>&copy; {new Date().getFullYear()} PrepAI. Designed for House of Edtech.</span>
        </div>

        {/* Center: Student Info */}
        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
          <span>Developed with</span>
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>by</span>
          <span className="font-semibold text-indigo-400">Harsh</span>
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/harsh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/harsh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <LinkedinIcon className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
          <a
            href="mailto:harsh@example.com"
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
