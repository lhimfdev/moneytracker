import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/session";
import NavLink from "@/components/NavLink";
import MobileNav from "@/components/MobileNav";

const DashIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const AcctIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const TxIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);
const GoalIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const initials = user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── Desktop Sidebar (iOS style) ── */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-surface-border lg:bg-surface-card">
        <div className="flex h-16 items-center border-b border-surface-border px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/lhimflogo.png" alt="Lhimf" width={32} height={32} className="h-8 w-8 rounded-xl object-contain shadow-sm" />
            <span className="text-base font-bold tracking-tight text-black">Lhimf</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
          <div className="flex flex-col gap-1">
            <NavLink href="/dashboard" icon={<DashIcon />}>Dashboard</NavLink>
            <NavLink href="/accounts" icon={<AcctIcon />}>Accounts</NavLink>
            <NavLink href="/transactions" icon={<TxIcon />}>Transactions</NavLink>
            <NavLink href="/goals" icon={<GoalIcon />}>Goals</NavLink>
            <NavLink href="/settings" icon={<SettingsIcon />}>Settings</NavLink>
          </div>
        </nav>
        <div className="border-t border-surface-border px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 border border-surface-border">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-black">{user.name}</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar (mobile + desktop) */}
        <header className="flex h-14 items-center justify-between border-b border-surface-border bg-surface-card px-4 lg:h-16 lg:px-8">
          {/* Mobile: logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 lg:hidden">
            <Image src="/lhimflogo.png" alt="Lhimf" width={28} height={28} className="h-7 w-7 rounded-lg object-contain shadow-sm" />
            <span className="text-base font-bold tracking-tight text-black">Lhimf</span>
          </Link>
          {/* Desktop: spacer */}
          <div className="hidden lg:block" />
          {/* Right: New transaction CTA */}
          <Link
            href="/transactions/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            <PlusIcon />
            <span>New transaction</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-28 lg:px-8 lg:pb-10">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}


