import { createGoal } from "@/app/actions";
import { Button, ErrorNote, Field, PageHeader, Select } from "@/components/ui";
import { db } from "@/lib/db";
import { peso } from "@/lib/money";
import { requireUser } from "@/lib/session";

export default async function Goals({ searchParams }: { searchParams: Promise<{ error?: string }> | { error?: string } }) {
  const user = await requireUser();
  const sp = await searchParams;
  const errorMsg = sp?.error;

  const [goals, accounts] = await Promise.all([
    db.goal.findMany({ where: { userId: user.id, archived: false }, include: { account: true }, orderBy: { targetDate: "asc" } }),
    db.account.findMany({ where: { userId: user.id, archived: false } }),
  ]);
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Savings Goals"
        description="Set targets, link accounts, and track your progress toward financial milestones."
      />

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-muted/50 px-6 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-border text-black">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-black">No savings goals yet</p>
          <p className="mt-1 text-sm text-neutral-500">Set a target and link it to an account below to track your progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {goals.map((g) => {
            const saved = g.account?.balance ?? 0;
            const target = g.target > 0 ? g.target : 1;
            const pct = Math.min(100, Math.floor((saved / target) * 100));
            const left = Math.max(0, g.target - saved);
            const months = Math.max(1, (g.targetDate.getUTCFullYear() - now.getFullYear()) * 12 + g.targetDate.getUTCMonth() - now.getMonth());

            return (
              <article key={g.id} className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card transition hover:shadow-card-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-black">{g.name}</h2>
                    <p className="text-xs text-neutral-500">Due {g.targetDate.toISOString().slice(0, 10)} {g.account ? `· Account: ${g.account.name}` : ""}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-black">
                    {pct}% completed
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <span className="font-bold text-black">{peso(saved)} <span className="font-normal text-neutral-500">of {peso(g.target)}</span></span>
                  <span className="text-xs text-neutral-500">{left === 0 ? "Goal reached!" : `${peso(left)} remaining`}</span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  {left === 0 ? "🎉 Congratulations on reaching this goal!" : `Needs about ${peso(Math.ceil(left / months))} per month.`}
                  {!g.account && <span className="font-medium text-neutral-700"> Link an account to track progress automatically.</span>}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* New goal form */}
      <form action={createGoal} className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-card">
        <div>
          <h2 className="text-base font-semibold text-black">Create new goal</h2>
          <p className="text-sm text-neutral-500">Set a financial target and timeframe.</p>
        </div>
        <ErrorNote msg={errorMsg} />
        <Field label="Goal name" name="name" placeholder="e.g. New Laptop, Japan Trip" required />
        <Field label="Target amount (₱)" name="target" inputMode="decimal" placeholder="50,000" required />
        <Field label="Target date" name="targetDate" type="date" required />
        <Select label="Linked account" name="accountId" hint="Select an account whose balance reflects this goal's savings.">
          <option value="">None</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({peso(a.balance)})</option>)}
        </Select>
        <div className="pt-2">
          <Button type="submit">Create goal</Button>
        </div>
      </form>
    </div>
  );
}


