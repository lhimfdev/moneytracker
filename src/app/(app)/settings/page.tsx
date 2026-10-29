import { logout, setPin } from "@/app/actions";
import PinPad from "@/components/PinPad";
import { ErrorNote, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";

export default async function Settings({ searchParams }: { searchParams: { error?: string; saved?: string; welcome?: string } }) {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Manage your account profile, security PIN, and session."
      />

      {searchParams.welcome && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 text-sm font-medium text-brand-900 shadow-sm">
          ✨ Welcome to Lhimf Money Tracker! Set a 4-digit PIN below to secure your financial vault and unlock it quickly on this device.
        </div>
      )}

      {searchParams.saved && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
          ✓ Security PIN saved successfully.
        </div>
      )}

      {/* User profile */}
      <section className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-lg">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="inline-flex items-center rounded-md bg-surface-muted px-2.5 py-1 text-xs font-medium text-gray-600">PHP (₱) · Asia/Manila</span>
        </div>
      </section>

      {/* PIN configuration */}
      <section className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-card p-6 shadow-card">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{user.pinHash ? "Change your security PIN" : "Create your security PIN"}</h2>
          <p className="text-sm text-gray-500">Enter 4 digits to secure your vault. Avoid obvious sequences like 1234.</p>
        </div>
        <ErrorNote msg={searchParams.error} />
        <div className="pt-2 flex justify-center sm:justify-start">
          <PinPad action={setPin} />
        </div>
      </section>

      {/* Logout session */}
      <section className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Session</h2>
            <p className="text-sm text-gray-500">Lock your vault and sign out of this device.</p>
          </div>
          <form action={logout}>
            <button type="submit" className="inline-flex h-10 items-center justify-center rounded-lg border border-surface-border bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              Log out
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

