"use client";

import { useRouter } from "next/navigation";

export function DateSelector({ initialDate }: { initialDate: string }) {
  const router = useRouter();

  function handleChange(dateStr: string) {
    if (!dateStr) return;
    router.push(`/dashboard/reports?date=${dateStr}`);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-500 font-medium">Choisir la date :</span>
      <input
        type="date"
        required
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-medium text-ink bg-white"
        value={initialDate}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
