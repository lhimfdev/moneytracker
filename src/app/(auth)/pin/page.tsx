import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { pinLogin } from "@/app/actions";
import PinPad from "@/components/PinPad";
import { ErrorNote } from "@/components/ui";
import { db } from "@/lib/db";
import { getDeviceUserId } from "@/lib/session";

export default async function PinPage({ searchParams }: { searchParams: { error?: string } }) {
  const uid = await getDeviceUserId();
  const user = uid ? await db.user.findUnique({ where: { id: uid } }) : null;
  if (!user?.pinHash) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-surface-border bg-surface-card p-8 shadow-ios text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <Image src="/lhimflogo.png" alt="Lhimf" width={40} height={40} className="h-10 w-10 rounded-2xl object-contain shadow-sm" />
          <span className="text-xl font-bold tracking-tight text-black">Lhimf</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-black">Enter your PIN</h1>
        <p className="mt-1 text-sm text-neutral-500">Welcome back, {user.name.split(" ")[0]}</p>

        <div className="mt-4 text-left">
          <ErrorNote msg={searchParams.error} />
        </div>

        <div className="mt-4 flex justify-center">
          <PinPad action={pinLogin} />
        </div>

        <div className="mt-6 border-t border-surface-border pt-4">
          <Link href="/login" className="text-sm font-semibold text-black underline underline-offset-4">
            Forgot PIN? Sign in with password
          </Link>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-neutral-400">
        5 wrong attempts lock the PIN for 30 seconds.
      </p>
    </main>
  );
}


