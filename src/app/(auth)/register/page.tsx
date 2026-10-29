import Link from "next/link";
import Image from "next/image";
import { register } from "@/app/actions";
import { Button, ErrorNote, Field } from "@/components/ui";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-surface-border bg-surface-card p-8 shadow-ios">
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center justify-center sm:justify-start gap-3 mb-4">
            <Image src="/lhimflogo.png" alt="Lhimf" width={40} height={40} className="h-10 w-10 rounded-2xl object-contain shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-black">Lhimf</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Create your account</h1>
          <p className="mt-1 text-sm text-neutral-500">Start tracking your savings and financial goals today.</p>
        </div>

        <ErrorNote msg={searchParams.error} />

        <form action={register} className="mt-4 flex flex-col gap-4">
          <Field label="Full name" name="name" autoComplete="name" placeholder="Juan dela Cruz" required />
          <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required />
          <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" placeholder="Re-enter password" required />
          <div className="pt-2">
            <Button type="submit">Create account</Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-black underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}


