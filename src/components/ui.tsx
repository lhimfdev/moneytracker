import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

// ─── Field ────────────────────────────────────────────────────────────────────
export const Field = ({
  label, name, type = "text", hint, ...rest
}: { label: string; name: string; type?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
    <input
      name={name}
      type={type}
      className="h-12 rounded-2xl border border-surface-border bg-white/90 px-4 text-base text-black shadow-inner-sm outline-none transition-all placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-50"
      {...rest}
    />
    {hint && <span className="text-xs text-neutral-500">{hint}</span>}
  </label>
);

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({
  label, name, children, hint, ...rest
}: { label: string; name: string; children: ReactNode; hint?: string } & SelectHTMLAttributes<HTMLSelectElement>) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
    <select
      name={name}
      className="h-12 rounded-2xl border border-surface-border bg-white/90 px-3.5 text-base text-black shadow-inner-sm outline-none transition-all focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-50"
      {...rest}
    >
      {children}
    </select>
    {hint && <span className="text-xs text-neutral-500">{hint}</span>}
  </label>
);

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({
  children, outline, variant, size = "md", className = "", ...rest
}: { outline?: boolean; variant?: "primary" | "outline" | "ghost" | "danger"; size?: "sm" | "md" | "lg"; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const v = outline ? "outline" : (variant ?? "primary");
  const styles = {
    primary: "bg-black text-white hover:bg-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-[0.98]",
    outline: "border border-surface-border bg-white text-black hover:bg-neutral-50 shadow-sm active:scale-[0.98]",
    ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-black active:scale-[0.98]",
    danger: "bg-neutral-900 text-white hover:bg-black shadow-sm active:scale-[0.98]"
  }[v];
  const sizes = {
    sm: "h-9 px-4 text-xs rounded-xl font-medium",
    md: "h-11 px-5 text-sm rounded-2xl font-semibold",
    lg: "h-13 px-7 text-base rounded-2xl font-semibold"
  }[size];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${sizes} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};


// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", padding = true }: { children: ReactNode; className?: string; padding?: boolean }) => (
  <div className={`rounded-3xl border border-surface-border/85 bg-surface-card shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] ${padding ? "p-7" : ""} ${className}`}>
    {children}
  </div>
);

// ─── ErrorNote ────────────────────────────────────────────────────────────────
export const ErrorNote = ({ msg }: { msg?: string }) =>
  msg ? (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-neutral-300/80 bg-neutral-100/90 px-4 py-3.5 shadow-sm animate-fade-in">
      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className="text-sm font-semibold text-black">{msg}</p>
    </div>
  ) : null;

// ─── SuccessNote ──────────────────────────────────────────────────────────────
export const SuccessNote = ({ msg }: { msg?: string }) =>
  msg ? (
    <div role="status" className="flex items-start gap-3 rounded-2xl border border-neutral-300/80 bg-neutral-50 px-4 py-3.5 shadow-sm animate-fade-in">
      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm font-semibold text-black">{msg}</p>
    </div>
  ) : null;

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, sub, valueClass = "" }: { label: string; value: string; icon?: ReactNode; sub?: string; valueClass?: string }) => (
  <div className="flex flex-col gap-3 rounded-3xl border border-surface-border/85 bg-surface-card p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]">
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      {icon && <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted text-black shadow-inner-sm">{icon}</span>}
    </div>
    <div>
      <p className={`text-3xl font-extrabold tracking-tight text-black ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-500 font-medium">{sub}</p>}
    </div>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-border px-6 py-14 text-center bg-surface-card/50">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-black shadow-inner-sm">
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.75 7.5h16.5M5.625 7.5a2.625 2.625 0 110-5.25 2.625 2.625 0 010 5.25z" />
      </svg>
    </div>
    <p className="text-base font-bold text-black">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-black">{title}</h1>
      {description && <p className="mt-1 text-sm font-medium text-neutral-500">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "error" | "info" }) => {
  return <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold tracking-wide text-black shadow-sm">{children}</span>;
};




