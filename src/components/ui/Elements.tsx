import React from "react";

// Glassmorphic Card Wrapper
export function GlassCard({
  children,
  className = "",
  hoverEffect = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hoverEffect?: boolean }) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 ${
        hoverEffect ? "glass-panel-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Styled Premium Button
export function CustomButton({
  children,
  className = "",
  variant = "primary",
  disabled = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const baseStyle =
    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 focus:ring-indigo-500",
    secondary: "bg-white/10 hover:bg-white/15 text-zinc-100 border border-white/10 focus:ring-zinc-500",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white focus:ring-zinc-500",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Standard Input with nice border glow
export function FormInput({
  label,
  error,
  className = "",
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-black/40 border text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
            : "border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-medium mt-0.5">{error}</span>}
    </div>
  );
}
