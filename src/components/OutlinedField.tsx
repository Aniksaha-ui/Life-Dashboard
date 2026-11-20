import type { ReactNode } from "react";

export const outlinedControlClass =
  "h-6 w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:bg-transparent focus:shadow-none";

export function OutlinedField({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`outlined-field relative m-0 flex h-10 min-w-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-0 transition focus-within:border-primary-600 focus-within:shadow-[0_0_0_3px_rgb(41_92_171_/_0.12)] has-[textarea]:h-auto has-[textarea]:items-stretch has-[textarea]:py-2 ${className}`}>
      <span className="outlined-field__label pointer-events-none absolute top-0 left-2 z-[1] -translate-y-1/2 bg-white px-1 text-xs leading-none font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
