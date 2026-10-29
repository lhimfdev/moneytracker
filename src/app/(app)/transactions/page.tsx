import Link from "next/link";
import { Prisma, TxType } from "@prisma/client";
import { db } from "@/lib/db";
import { peso } from "@/lib/money";
import { requireUser } from "@/lib/session";

const PAGE = 20;
const TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT", "ADJUSTMENT"];
const isInflow = (t: string) => t === "DEPOSIT" || t === "TRANSFER_IN" || t === "ADJUSTMENT";
const TX_LABELS: Record<string, string> = {
  DEPOSIT: "Deposit", WITHDRAWAL: "Withdrawal",
  TRANSFER_IN: "Transfer In", TRANSFER_OUT: "Transfer Out", ADJUSTMENT: "Adjustment",
};

export default async function Transactions({ searchParams }: { searchParams: { q?: string; type?: string; page?: string } }) {
  const user = await requireUser();
  const q = searchParams.q?.trim() ?? "";
  const type = TYPES.includes(searchParams.type ?? "") ? (searchParams.type as TxType) : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where: Prisma.TransactionWhereInput = {
    userId: user.id, ...(type && { type }),
    ...(q && { OR: [{ ref: { contains: q, mode: "insensitive" } }, { note: { contains: q, mode: "insensitive" } }] }),
  };
  const [rows, count] = await Promise.all([
    db.transaction.findMany({ where, orderBy: [{ date: "desc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE, take: PAGE, include: { account: true } }),
    db.transaction.count({ where }),
  ]);
  const qs = (p: number) => `?${new URLSearchParams({ ...(q && { q }), ...(type && { type }), page: String(p) })}`;
  const exportQs = new URLSearchParams({ ...(q && { q }), ...(type && { type }) });
  const totalPages = Math.max(1, Math.ceil(count / PAGE));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Transactions</h1>
          <p className="mt-0.5 text-sm text-gray-500">{count} record{count !== 1 ? "s" : ""}{q || type ? " matching filter" : ""}</p>
        </div>
        <a href={`/transactions/export?${exportQs}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Export CSV
        </a>
      </div>
      <form className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-600">Search</span>
          <input name="q" defaultValue={q} placeholder="Reference or note…" aria-label="Search" className="h-9 rounded-lg border border-surface-border bg-white px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
        </label>
        <label className="flex flex-col gap-1.5 sm:w-44">
          <span className="text-xs font-medium text-gray-600">Type</span>
          <select name="type" defaultValue={type ?? ""} aria-label="Type" className="h-9 rounded-lg border border-surface-border bg-white px-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{TX_LABELS[t]}</option>)}
          </select>
        </label>
        <button type="submit" className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700">Filter</button>
        {(q || type) && <Link href="/transactions" className="flex h-9 items-center px-3 text-sm font-medium text-gray-500 hover:text-gray-900">Clear</Link>}
      </form>
      <div className="rounded-xl border border-surface-border bg-surface-card shadow-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <svg className="mb-3 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <p className="text-sm font-medium text-gray-900">No transactions found</p>
            <p className="mt-0.5 text-sm text-gray-500">Try adjusting your search or clearing the filters.</p>
          </div>
        ) : (
          <>
            <div className="hidden border-b border-surface-border px-5 py-3 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Account / Note</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Type</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Date</span>
              <span className="text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Amount</span>
            </div>
            <ul className="divide-y divide-surface-border">
              {rows.map((t) => {
                const inflow = isInflow(t.type);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:hidden ${inflow ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {inflow ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                          : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{t.account.name}</p>
                        <p className="truncate text-xs text-gray-500">{t.note ?? t.ref}</p>
                      </div>
                    </div>
                    <span className="hidden rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-gray-600 sm:inline-flex sm:items-center">{TX_LABELS[t.type]}</span>
                    <span className="hidden text-sm text-gray-500 sm:inline">{t.date.toISOString().slice(0, 10)}</span>
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-semibold ${inflow ? "text-emerald-700" : "text-red-600"}`}>{inflow ? "+" : "−"}{peso(t.amount)}</span>
                      <span className="text-xs text-gray-400 sm:hidden">{t.date.toISOString().slice(0, 10)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
      {count > 0 && (
        <div className="flex items-center justify-between text-sm">
          {page > 1 ? <Link href={qs(page - 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-surface-border bg-surface-card px-3.5 font-medium text-gray-700 shadow-sm hover:bg-gray-50">← Previous</Link> : <span />}
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          {page * PAGE < count ? <Link href={qs(page + 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-surface-border bg-surface-card px-3.5 font-medium text-gray-700 shadow-sm hover:bg-gray-50">Next →</Link> : <span />}
        </div>
      )}
    </div>
  );
}
