import clsx from "clsx";
import {
  ChevronDown,
  BarChart3,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Shuffle,
  Repeat,
  Tags,
  Folder,
  BrainCircuit,
  WalletCards,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Tooltip } from "../components/Tooltip";

const navItems = [
  { to: "/account", icon: CreditCard, label: "Accounts" },
  { to: "/categories", icon: Tags, label: "Categories" },
  { to: "/transactions", icon: CreditCard, label: "Transactions" },
  { to: "/transfers", icon: Shuffle, label: "Transfers" },
  { to: "/recurring-expenses", icon: Repeat, label: "Recurring Expenses" },
  { to: "/budgets", icon: WalletCards, label: "Budgets" },
  { to: "/file-manager", icon: Folder, label: "File Manager" },
  { to: "/financial-intelligence", icon: BrainCircuit, label: "Financial Intelligence" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();
  // A phone drawer must always show its labels. Desktop collapse preference
  // should only affect the persistent desktop rail.
  const isCompact = isCollapsed && !isMobileOpen;

  const getActiveParentLabel = (pathname: string): string | null => {
    const activeParent = navItems.find((item) =>
      item.children?.some(
        (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
      ),
    );
    return activeParent?.label ?? null;
  };

  const [expandedItem, setExpandedItem] = useState<string | null>(() =>
    getActiveParentLabel(location.pathname),
  );

  useEffect(() => {
    // Keep sidebar in sync with route: expand the active parent and collapse others.
    setExpandedItem(getActiveParentLabel(location.pathname));
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    if (isCompact) {
      onToggle(); // Open sidebar if a parent with children is clicked while collapsed
      setExpandedItem(label);
      return;
    }
    setExpandedItem((prev) => (prev === label ? null : label));
  };

  const NavItem = ({ item }: { item: any }) => {
    const content = (
      <div
        className={clsx(
          "flex items-center gap-3 w-full",
          isCompact && "justify-center",
        )}
      >
        <item.icon className="w-5 h-5 min-w-[20px]" />
        {!isCompact && <span className="truncate">{item.label}</span>}
      </div>
    );

    if (item.children) {
      return (
        <div className="relative w-full">
          {isCompact ? (
            <Tooltip content={item.label} position="right" className="w-full">
              <button
                onClick={() => toggleExpand(item.label)}
                className={clsx(
                  "w-full flex items-center justify-center p-2.5 rounded-md text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-100",
                  expandedItem === item.label &&
                    "bg-slate-100 text-primary-600",
                )}
              >
                <item.icon className="w-5 h-5" />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={() => toggleExpand(item.label)}
              className={clsx(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100",
                expandedItem === item.label && "text-slate-900",
              )}
            >
              {content}
              <ChevronDown
                className={clsx(
                  "w-4 h-4 transition-transform duration-200",
                  expandedItem === item.label ? "transform rotate-180" : "",
                )}
              />
            </button>
          )}

          {!isCompact && item.children && (
            <div
              className={clsx(
                "grid transition-all duration-200 ease-in-out",
                expandedItem === item.label
                  ? "grid-rows-[1fr] opacity-100 mb-2"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="ml-9 space-y-1 mt-1">
                  {item.children.map((child: any) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end
                      className={({ isActive }) =>
                        clsx(
                          "block px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "text-primary-600 bg-slate-100"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative w-full">
        {isCompact ? (
          <Tooltip content={item.label} position="right" className="w-full">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "w-full flex items-center justify-center p-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-primary-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
          </Tooltip>
        ) : (
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-primary-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-slate-100",
              )
            }
          >
            {content}
          </NavLink>
        )}
      </div>
    );
  };

  const handleNavigation = (event: MouseEvent<HTMLDivElement>) => {
    if (isMobileOpen && (event.target as Element).closest("a")) onMobileClose();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onMobileClose}
        className={clsx(
          "fixed inset-0 z-[90] bg-slate-950/35 transition-opacity md:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        className={clsx(
          "sidebar-container bg-slate-50 border-r border-slate-200 h-[100dvh] flex flex-col fixed left-0 top-0 z-[100] transition-all duration-300 ease-in-out w-[min(18rem,86vw)] shadow-2xl md:w-20 md:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          !isCollapsed && "md:w-64",
          "md:translate-x-0",
        )}
      >
        <div
          className={clsx(
            "h-16 flex items-center border-b border-slate-100 transition-all duration-300",
            isCompact
              ? "px-4 justify-center"
              : "px-5 justify-between md:px-6",
          )}
        >
          {!isCompact ? (
            <>
              <div className="flex min-w-0 items-center gap-2.5" aria-label="Life Dashboard">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-600 text-white shadow-sm">
                  <LayoutDashboard className="h-4 w-4" />
                </span>
                <span className="truncate text-base font-bold tracking-tight text-slate-900">
                  Life Dashboard
                </span>
              </div>
              <button
                onClick={onToggle}
                className="hidden md:block p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
              <button
                onClick={onMobileClose}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onToggle}
                className="hidden md:block p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
              <button
                onClick={onMobileClose}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <nav
          className={clsx(
            "flex-1 py-4 space-y-1 scrollbar-hide transition-all duration-300",
            isCompact ? "px-2 overflow-visible" : "px-3 overflow-y-auto",
          )}
        >
          {navItems.map((item) => (
            <div key={item.label}>
              <div onClick={handleNavigation}>
                <NavItem item={item} />
              </div>
              {item.hasDivider && (
                <div className="my-4 border-t border-slate-200 mx-1"></div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
