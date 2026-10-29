"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { parsePeso } from "@/lib/money";
import { createSession, getDeviceUserId, requireUser } from "@/lib/session";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const fail = (path: string, msg: string): never => redirect(`${path}?error=${encodeURIComponent(msg)}`);
class AppError extends Error {}

// ---------- Auth ----------
export async function register(f: FormData) {
  const p = z.object({
    name: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password needs at least 8 characters"),
  }).safeParse({ name: str(f, "name"), email: str(f, "email").toLowerCase(), password: str(f, "password") });
  if (!p.success) fail("/register", p.error.issues[0].message);
  if (str(f, "password") !== str(f, "confirm")) fail("/register", "Passwords do not match");
  const data = p.success ? p.data : null!;
  if (await db.user.findUnique({ where: { email: data.email } })) fail("/register", "That email is already registered");
  const user = await db.user.create({
    data: { name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 12) },
  });
  await createSession(user.id);
  redirect("/settings?welcome=1");
}

export async function login(f: FormData) {
  const email = str(f, "email").toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  const ok = user ? await bcrypt.compare(String(f.get("password") ?? ""), user.passwordHash) : false;
  if (!user || !ok) fail("/login", "Email or password is incorrect");
  await createSession(user!.id);
  redirect("/dashboard");
}

export async function logout() {
  cookies().delete("lhimf_session");
  redirect(cookies().get("lhimf_device") ? "/pin" : "/login");
}

export async function setPin(f: FormData) {
  const user = await requireUser();
  const pin = str(f, "pin");
  if (!/^\d{4}$/.test(pin)) fail("/settings", "PIN must be exactly 4 digits");
  if (["0000", "1111", "1234", "4321"].includes(pin)) fail("/settings", "Choose a less obvious PIN");
  await db.user.update({
    where: { id: user.id },
    data: { pinHash: await bcrypt.hash(pin, 10), pinFails: 0, pinLockedUntil: null },
  });
  redirect("/settings?saved=1");
}

export async function pinLogin(f: FormData) {
  const uid = await getDeviceUserId();
  const user = uid ? await db.user.findUnique({ where: { id: uid } }) : null;
  if (!user || !user.pinHash) redirect("/login");
  if (user!.pinLockedUntil && user!.pinLockedUntil > new Date()) fail("/pin", "Too many attempts. Try again in 30 seconds.");
  if (await bcrypt.compare(str(f, "pin"), user!.pinHash!)) {
    await db.user.update({ where: { id: user!.id }, data: { pinFails: 0, pinLockedUntil: null } });
    await createSession(user!.id);
    redirect("/dashboard");
  }
  const fails = user!.pinFails + 1;
  await db.user.update({
    where: { id: user!.id },
    data: fails >= 5 ? { pinFails: 0, pinLockedUntil: new Date(Date.now() + 30_000) } : { pinFails: fails },
  });
  fail("/pin", fails >= 5 ? "Too many attempts. Try again in 30 seconds." : "Wrong PIN");
}

// ---------- Accounts ----------
export async function createAccount(f: FormData) {
  const user = await requireUser();
  const name = str(f, "name");
  if (name.length < 2) fail("/accounts", "Enter an account name");
  const start = str(f, "start") ? parsePeso(str(f, "start")) : 0;
  if (start === null) fail("/accounts", "Enter a valid starting balance");
  await db.$transaction(async (tx) => {
    const a = await tx.account.create({ data: { userId: user.id, name, balance: start ?? 0 } });
    if (start) {
      // Starting balance goes into the ledger as an adjustment, so history stays auditable.
      await tx.transaction.create({
        data: { userId: user.id, accountId: a.id, type: "ADJUSTMENT", amount: start, date: new Date(), note: "Opening balance", ref: newRef() },
      });
    }
  });
  revalidatePath("/accounts");
  redirect("/accounts");
}

export async function archiveAccount(f: FormData) {
  const user = await requireUser();
  await db.account.updateMany({ where: { id: str(f, "id"), userId: user.id }, data: { archived: true } });
  revalidatePath("/accounts");
}

// ---------- Transactions ----------
const newRef = () => `TX-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export async function addTransaction(f: FormData) {
  const user = await requireUser();
  const type = str(f, "type");
  const accountId = str(f, "accountId");
  const toId = str(f, "toAccountId");
  const amount = parsePeso(str(f, "amount"));
  const date = /^\d{4}-\d{2}-\d{2}$/.test(str(f, "date")) ? new Date(str(f, "date") + "T00:00:00.000Z") : null;
  const key = str(f, "key") || null;
  const note = str(f, "note").slice(0, 200) || null;
  const back = "/transactions/new";
  if (!["DEPOSIT", "WITHDRAWAL", "TRANSFER"].includes(type)) fail(back, "Choose a transaction type");
  if (!amount) fail(back, "Enter an amount greater than zero");
  if (!date) fail(back, "Choose a date");
  if (!accountId) fail(back, "Choose an account");
  if (type === "TRANSFER" && (!toId || toId === accountId)) fail(back, "Choose a different destination account");

  const ids = type === "TRANSFER" ? [accountId, toId] : [accountId];
  try {
    await db.$transaction(async (tx) => {
      // Row locks stop two requests from spending the same balance twice.
      const rows = await tx.$queryRaw<{ id: string; balance: number }[]>(
        Prisma.sql`SELECT id, balance FROM "Account" WHERE id IN (${Prisma.join(ids)}) AND "userId" = ${user.id} AND archived = false ORDER BY id FOR UPDATE`,
      );
      if (rows.length !== ids.length) throw new AppError("Account not found");
      const src = rows.find((r) => r.id === accountId)!;
      if (type !== "DEPOSIT" && src.balance < amount!) throw new AppError("Not enough balance in that account");
      const base = { userId: user.id, amount: amount!, date: date!, note };
      if (type === "TRANSFER") {
        const group = newRef();
        await tx.account.update({ where: { id: accountId }, data: { balance: { decrement: amount! } } });
        await tx.account.update({ where: { id: toId }, data: { balance: { increment: amount! } } });
        await tx.transaction.create({ data: { ...base, accountId, type: "TRANSFER_OUT", ref: newRef(), transferGroup: group, idempotencyKey: key } });
        await tx.transaction.create({ data: { ...base, accountId: toId, type: "TRANSFER_IN", ref: newRef(), transferGroup: group } });
      } else {
        const up = type === "DEPOSIT";
        await tx.account.update({ where: { id: accountId }, data: { balance: up ? { increment: amount! } : { decrement: amount! } } });
        await tx.transaction.create({ data: { ...base, accountId, type: up ? "DEPOSIT" : "WITHDRAWAL", ref: newRef(), idempotencyKey: key } });
      }
    });
  } catch (e) {
    if (e instanceof AppError) fail(back, e.message);
    // A repeated submit carries the same key, so the unique constraint ignores it.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }
  revalidatePath("/", "layout");
  redirect("/transactions");
}

// ---------- Goals ----------
export async function createGoal(f: FormData) {
  const user = await requireUser();
  const name = str(f, "name");
  const target = parsePeso(str(f, "target"));
  const d = str(f, "targetDate");
  if (name.length < 2) fail("/goals", "Enter a goal name");
  if (!target) fail("/goals", "Enter a target amount");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) fail("/goals", "Choose a target date");
  const accountId = str(f, "accountId");
  if (accountId && !(await db.account.findFirst({ where: { id: accountId, userId: user.id } }))) fail("/goals", "Account not found");
  await db.goal.create({
    data: { userId: user.id, name, target: target!, targetDate: new Date(d + "T00:00:00.000Z"), accountId: accountId || null },
  });
  revalidatePath("/goals");
  redirect("/goals");
}
