"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function DateSelector({ initialDate }: { initialDate: string }) {
  const router = useRouter();

  function handleChange(dateStr: string) {
    if (!dateStr) return;
    router.push(`/dashboard/reports?date=${dateStr}`);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date :</span>
        <input
          type="date"
          required
          className="rounded-lg border border-neutral-200 px-3 h-10 text-sm font-semibold outline-none focus:border-brand focus:ring-3 focus:ring-brand/20 transition-all text-neutral-700 cursor-pointer bg-white"
          value={initialDate}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <Button
        onClick={() => window.print()}
        variant="outline"
        className="h-10 px-4 font-semibold border-neutral-300 hover:bg-neutral-50 bg-white flex items-center gap-2 rounded-lg shadow-sm"
      >
        <Printer className="size-4 text-neutral-500" />
        <span>Imprimer</span>
      </Button>
    </div>
  );
}
