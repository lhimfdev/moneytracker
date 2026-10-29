import Link from "next/link";
import Image from "next/image";
import { login } from "@/app/actions";
import { Button, ErrorNote, Field } from "@/components/ui";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-surface-border bg-surface-card p-8 shadow-ios">
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center justify-center sm:justify-start gap-3 mb-4">
            <Image src="/lhimflogo.png" alt="Lhimf" width={40} height={40} className="h-10 w-10 rounded-2xl object-contain shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-black">Lhimf</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to manage your savings records and accounts.</p>
        </div>

        <ErrorNote msg={searchParams.error} />

        <form action={login} className="mt-4 flex flex-col gap-4">
          <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          <Field label="Password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
          <div className="pt-2">
            <Button type="submit">Sign in</Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          New to Lhimf?{" "}
          <Link href="/register" className="font-semibold text-black underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
      <p className="mt-6 text-center text-xs text-neutral-400">
        Lhimf records your financial targets and savings only. It does not hold or move real money.
      </p>
    </main>
  );
}


