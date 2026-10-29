// Parse "1,234.50" into integer centavos. Returns null when invalid. No floats involved.
export function parsePeso(input: string): number | null {
  const s = input.replace(/[,\s₱]/g, "");
  const m = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return null;
  const c = Number(m[1]) * 100 + Number((m[2] ?? "0").padEnd(2, "0"));
  return c > 0 && c <= 100_000_000 ? c : null; // up to ₱1,000,000 per entry
}

const fmt = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
export const peso = (centavos: number) => fmt.format(centavos / 100);
