"use client";
import { useRef, useState } from "react";

export default function PinPad({ action }: { action: (f: FormData) => Promise<void> }) {
  const [pin, setPin] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) setTimeout(() => form.current?.requestSubmit(), 150);
  };
  return (
    <form ref={form} action={action} onSubmit={() => setTimeout(() => setPin(""), 300)}>
      <input type="hidden" name="pin" value={pin} />
      <div role="img" aria-label={`${pin.length} of 4 digits entered`} className="my-8 flex justify-center gap-5">
        {[0, 1, 2, 3].map((i) => <i key={i} className={`h-4 w-4 rounded-full border-2 border-black ${i < pin.length ? "bg-black" : ""}`} />)}
      </div>
      <div className="mx-auto grid w-fit grid-cols-3 gap-4">
        {"123456789".split("").map((d) => (
          <button key={d} type="button" onClick={() => press(d)} className="h-[72px] w-[72px] rounded-full border border-neutral-300 bg-white text-2xl font-semibold tabular-nums hover:bg-neutral-100 active:bg-black active:text-white">{d}</button>
        ))}
        <span />
        <button type="button" onClick={() => press("0")} className="h-[72px] w-[72px] rounded-full border border-neutral-300 bg-white text-2xl font-semibold hover:bg-neutral-100 active:bg-black active:text-white">0</button>
        <button type="button" aria-label="Delete" onClick={() => setPin(pin.slice(0, -1))} className="h-[72px] w-[72px] rounded-full text-xl hover:bg-neutral-100">⌫</button>
      </div>
    </form>
  );
}
