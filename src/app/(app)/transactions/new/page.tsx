import { randomUUID } from "crypto";
import Link from "next/link";
import { addTransaction } from "@/app/actions";
import { Button, ErrorNote, Field, PageHeader, Select } from "@/components/ui";
import { db } from "@/lib/db";
import { peso } from "@/lib/money";
import { requireUser } from "@/lib/session";

export default async function NewTransaction({ searchParams }: { searchParams: { error?: string } }) {
  const user = await requireUser();
  const accounts = await db.account.findMany({ where: { userId: user.id, archived: false }, orderBy: { name: "asc" } });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const opts = accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {peso(a.balance)}</option>);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Transaction"
        description="Record a deposit, withdrawal, or transfer between your accounts."
        action={
          <Link href="/transactions" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            ← Back to list
          </Link>
        }
      />

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-muted/50 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-900">No accounts available</p>
          <p className="mt-1 text-sm text-gray-500">You need to create an account before recording transactions.</p>
          <Link href="/accounts" className="mt-4 inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
            Go to Accounts
          </Link>
        </div>
      ) : (
        <form action={addTransaction} className="flex flex-col gap-5 rounded-xl border border-surface-border bg-surface-card p-6 shadow-card">
          <ErrorNote msg={searchParams.error} />
          <input type="hidden" name="key" value={randomUUID()} />
          <Select label="Transaction type" name="type" hint="Deposits add funds, withdrawals remove funds, transfers move funds between accounts.">
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="TRANSFER">Transfer</option>
          </Select>
          <Field label="Amount (₱)" name="amount" inputMode="decimal" placeholder="0.00" required />
          <Select label="Account" name="accountId" required hint="Source account for withdrawals and transfers, or destination for deposits.">
            {opts}
          </Select>
          <Select label="Destination account (Transfers only)" name="toAccountId" hint="Select the target account if this is a transfer.">
            <option value="">Not a transfer</option>
            {opts}
          </Select>
          <Field label="Date" name="date" type="date" defaultValue={today} required />
          <Field label="Note (optional)" name="note" maxLength={200} placeholder="e.g. Monthly salary, Grocery shopping" />
          <div className="pt-2">
            <Button type="submit">Save transaction</Button>
          </div>
        </form>
      )}
    </div>
  );
}

