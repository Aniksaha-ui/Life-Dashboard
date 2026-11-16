import { BrainCircuit, CreditCard, Menu, ReceiptText, WalletCards } from "lucide-react";
import { NavLink } from "react-router-dom";
import { clsx } from "clsx";

const items = [
  { to: "/account", label: "Accounts", icon: CreditCard },
  { to: "/budgets", label: "Budgets", icon: WalletCards },
  { to: "/transactions", label: "Transaction", icon: ReceiptText },
  { to: "/financial-intelligence", label: "Insights", icon: BrainCircuit },
];

export function MobileBottomNavigation({ onOpenMenu }: { onOpenMenu: () => void }) {
  return <nav className="fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white/95 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden" aria-label="Mobile navigation">
    <div className="mx-auto grid max-w-lg grid-cols-5">
      {items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => clsx("flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors", isActive ? "text-primary-700" : "text-slate-400 hover:text-slate-600")}><span className="grid h-7 w-9 place-items-center rounded-lg"><Icon className="h-5 w-5" /></span><span className="truncate">{label}</span></NavLink>)}
      <button type="button" onClick={onOpenMenu} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold text-slate-400 transition-colors hover:text-slate-600"><span className="grid h-7 w-9 place-items-center rounded-lg"><Menu className="h-5 w-5" /></span><span>More</span></button>
    </div>
  </nav>;
}
