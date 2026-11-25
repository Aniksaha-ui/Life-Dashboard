import { BrainCircuit, CreditCard, Menu, ReceiptText, WalletCards } from "lucide-react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useMenuPermissions } from "../hooks/useMenuPermissions";

const items = [
  { to: "/account", label: "Accounts", icon: CreditCard },
  { to: "/budgets", label: "Budgets", icon: WalletCards },
  { to: "/transactions", label: "Activity", icon: ReceiptText },
  { to: "/financial-intelligence", label: "Insights", icon: BrainCircuit },
];

const isItemActive = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`);

export function MobileBottomNavigation({
  hidden = false,
  onOpenMenu,
}: {
  hidden?: boolean;
  onOpenMenu: () => void;
}) {
  const { pathname } = useLocation();
  const { hasPath } = useMenuPermissions();
  const visibleItems = items.filter((item) => hasPath(item.to));
  const moreActive = !visibleItems.some((item) => isItemActive(pathname, item.to));

  if (hidden) return null;

  return createPortal(
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden"
      style={{ position: "fixed", left: 0, right: 0, bottom: 0 }}
      aria-label="Mobile navigation"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md gap-1 rounded-[1.35rem] border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.16)] backdrop-blur-md">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold leading-none transition-colors",
                isActive ? "bg-primary-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
              )
            }
          >
            <Icon className="h-[1.15rem] w-[1.15rem]" />
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onOpenMenu}
          className={clsx(
            "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold leading-none transition-colors",
            moreActive ? "bg-primary-50 text-primary-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
          )}
        >
          <Menu className="h-[1.15rem] w-[1.15rem]" />
          <span>More</span>
        </button>
      </div>
    </nav>,
    document.body,
  );
}
