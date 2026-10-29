import Link from "next/link";
import { db } from "@/lib/db";
import { peso } from "@/lib/money";
import { requireUser } from "@/lib/session";

const isInflow = (t: string) => t === "DEPOSIT" || t === "TRANSFER_IN" || t === "ADJUSTMENT";

function TxTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    DEPOSIT: "Deposit", WITHDRAWAL: "Withdrawal",
    TRANSFER_IN: "Transfer In", TRANSFER_OUT: "Transfer Out", ADJUSTMENT: "Adjustment",
  };
  return <>{labels[type] ?? type}</>;
}

export default async function Dashboard() {
  const user = await requireUser();
  const ph = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const start = new Date(Date.UTC(ph.getFullYear(), ph.getMonth(), 1));
  const monthLabel = ph.toLocaleString("en-PH", { month: "long", year: "numeric", timeZone: "Asia/Manila" });

  const [total, byType, recent, goalsCount] = await Promise.all([
    db.account.aggregate({ where: { userId: user.id, archived: false }, _sum: { balance: true }, _count: true }),
    db.transaction.groupBy({ by: ["type"], where: { userId: user.id, date: { gte: start } }, _sum: { amount: true } }),
    db.transaction.findMany({ where: { userId: user.id }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 5, include: { account: true } }),
    db.goal.count({ where: { userId: user.id, archived: false } }),
  ]);

  const sum = (t: string) => byType.find((r) => r.type === t)?._sum.amount ?? 0;
  const dep = sum("DEPOSIT"), wd = sum("WITHDRAWAL"), net = dep - wd;
  const totalBalance = total._sum.balance ?? 0;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-black">Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-neutral-500">Overview for {monthLabel}</p>
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3 rounded-3xl border border-surface-border/85 bg-surface-card p-7 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Balance</p>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted text-black shadow-inner-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            </span>
          </div>
          <p className="text-4xl font-extrabold tracking-tight text-black">{peso(totalBalance)}</p>
          <p className="text-xs font-medium text-neutral-500">{total._count} active account{total._count !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-card p-5 shadow-card">
          <p className="text-sm font-medium text-gray-500">Net flow</p>
          <p className={`text-2xl font-bold tracking-tight ${net >= 0 ? "text-emerald-700" : "text-red-600"}`}>{net >= 0 ? "+" : "−"}{peso(Math.abs(net))}</p>
          <p className="text-xs text-gray-500">This month</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-card p-5 shadow-card">
          <p className="text-sm font-medium text-gray-500">Active goals</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900">{goalsCount}</p>
          <Link href="/goals" className="text-xs font-medium text-brand-600 hover:text-brand-700">View goals →</Link>
        </div>
      </div>
      {/* Monthly activity */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card p-5 shadow-card">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </span>
          <div><p className="text-sm font-medium text-gray-500">Deposits this month</p><p className="text-xl font-bold text-emerald-700">{peso(dep)}</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card p-5 shadow-card">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
          </span>
          <div><p className="text-sm font-medium text-gray-500">Withdrawals this month</p><p className="text-xl font-bold text-red-600">{peso(wd)}</p></div>
        </div>
      </div>
      {/* Recent transactions */}
      <div className="rounded-xl border border-surface-border bg-surface-card shadow-card">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent transactions</h2>
          <Link href="/transactions" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <svg className="mb-3 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <p className="text-sm font-medium text-gray-900">No transactions yet</p>
            <p className="mt-0.5 text-sm text-gray-500">Record your first deposit or withdrawal to get started.</p>
            <Link href="/transactions/new" className="mt-4 inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Add transaction</Link>
          </div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {recent.map((t) => {
              const inflow = isInflow(t.type);
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${inflow ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      {inflow
                        ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{t.account.name}</p>
                      <p className="text-xs text-gray-500"><TxTypeLabel type={t.type} /> · {t.date.toISOString().slice(0, 10)}{t.note ? ` · ${t.note}` : ""}</p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-sm font-semibold ${inflow ? "text-emerald-700" : "text-red-600"}`}>{inflow ? "+" : "−"}{peso(t.amount)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-400">Transfers between your own accounts are not counted as deposits or withdrawals in the monthly totals.</p>
    </div>
  );
}
