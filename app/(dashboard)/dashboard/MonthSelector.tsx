"use client";

import { useRouter } from "next/navigation";

export function MonthSelector({ initialMonth }: { initialMonth: string }) {
  const router = useRouter();

  function handleChange(monthStr: string) {
    if (!monthStr) return;
    router.push(`/dashboard?month=${monthStr}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mois :</span>
      <input
        type="month"
        required
        className="rounded-lg border border-neutral-200 px-3 h-10 text-sm font-semibold outline-none focus:border-brand focus:ring-3 focus:ring-brand/20 transition-all text-neutral-700 cursor-pointer bg-white"
        value={initialMonth}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
