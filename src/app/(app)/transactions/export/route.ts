import { Prisma, TxType } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;

export async function GET(req: Request) {
  const user = await requireUser();
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const type = sp.get("type");
  const where: Prisma.TransactionWhereInput = {
    userId: user.id,
    ...(type && type in TxType && { type: type as TxType }),
    ...(q && { OR: [{ ref: { contains: q, mode: "insensitive" } }, { note: { contains: q, mode: "insensitive" } }] }),
  };
  const rows = await db.transaction.findMany({ where, orderBy: { date: "desc" }, include: { account: true }, take: 10000 });
  const lines = ["Reference,Date,Account,Type,Amount (PHP),Note"].concat(
    rows.map((t) => [t.ref, t.date.toISOString().slice(0, 10), esc(t.account.name), t.type, (t.amount / 100).toFixed(2), esc(t.note ?? "")].join(",")),
  );
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="lhimf-transactions.csv"' },
  });
}
