import { archiveAccount, createAccount } from "@/app/actions";
import { Button, ErrorNote, Field, PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { peso } from "@/lib/money";
import { requireUser } from "@/lib/session";

export default async function Accounts({ searchParams }: { searchParams: { error?: string } }) {
  const user = await requireUser();
  const accounts = await db.account.findMany({ where: { userId: user.id, archived: false }, orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Manage your savings accounts, emergency funds, and cash reserves."
      />

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-muted/50 px-6 py-12 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-border">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900">No accounts yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first account below, such as Emergency Fund or Savings.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accounts.map((a) => (
            <li key={a.id} className="flex flex-col justify-between gap-6 rounded-xl border border-surface-border bg-surface-card p-5 shadow-card transition hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Account</span>
                  <p className="text-base font-semibold text-gray-900">{a.name}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs text-gray-500">Current balance</span>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">{peso(a.balance)}</p>
                </div>
                <form action={archiveAccount}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="text-xs font-semibold text-gray-400 hover:text-red-600">Archive</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add account form */}
      <form action={createAccount} className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-card p-6 shadow-card">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Add new account</h2>
          <p className="text-sm text-gray-500">Create a destination for your savings and deposits.</p>
        </div>
        <ErrorNote msg={searchParams.error} />
        <Field label="Account name" name="name" placeholder="e.g. BPI Savings, Emergency Fund" required />
        <Field label="Starting balance (₱, optional)" name="start" inputMode="decimal" placeholder="0.00" hint="Leave blank or enter initial deposit amount." />
        <div className="pt-2">
          <Button type="submit">Create account</Button>
        </div>
      </form>
    </div>
  );
}

