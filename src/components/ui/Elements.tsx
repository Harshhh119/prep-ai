import React from "react";

// Glassmorphic Card Wrapper (Light Theme)
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

// Styled Premium Button (Light Theme)
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
    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 focus:ring-indigo-500",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus:ring-slate-400",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400",
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

// Standard Input with nice border glow (Light Theme)
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
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? "border-red-400 focus:ring-red-400/30 focus:border-red-500"
            : "border-slate-200 focus:ring-indigo-500/30 focus:border-indigo-500"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
}
