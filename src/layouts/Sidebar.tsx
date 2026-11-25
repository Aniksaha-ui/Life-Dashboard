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
  Briefcase,
  BookOpen,
  GraduationCap,
  BriefcaseBusiness,
  Code2,
  Quote,
  Award,
  Layers,
  BellRing,
  Play,
  ListTree,
} from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Tooltip } from "../components/Tooltip";
import { useMenuPermissions } from "../hooks/useMenuPermissions";

const navItems = [
  { group: "Money", to: "/account", icon: CreditCard, label: "Accounts" },
  { group: "Money", to: "/categories", icon: Tags, label: "Categories" },
  {
    group: "Money",
    to: "/transactions",
    icon: CreditCard,
    label: "Transaction",
  },
  { group: "Money", to: "/transfers", icon: Shuffle, label: "Transfers" },
  {
    group: "Money",
    to: "/recurring-expenses",
    icon: Repeat,
    label: "Recurring Expenses",
  },
  { group: "Money", to: "/budgets", icon: WalletCards, label: "Budgets" },
  {
    group: "Portfolio",
    icon: Briefcase,
    label: "Portfolio Setup",
    children: [
      { to: "/blogs", label: "Blogs", icon: BookOpen },
      { to: "/publications", label: "Publications", icon: GraduationCap },
      { to: "/experiences", label: "Experiences", icon: BriefcaseBusiness },
      { to: "/projects", label: "Projects", icon: Code2 },
      { to: "/testimonials", label: "Testimonials", icon: Quote },
      { to: "/trainings", label: "Trainings", icon: Award },
      { to: "/services", label: "Services", icon: Layers },
    ],
  },
  { group: "Tools", to: "/file-manager", icon: Folder, label: "File Manager" },
  {
    group: "Tools",
    to: "/financial-intelligence",
    icon: BrainCircuit,
    label: "Financial Intelligence",
  },
  {
    group: "Tools",
    to: "/report-delivery",
    icon: BellRing,
    label: "Report Delivery",
  },
  {
    group: "Tools",
    to: "/report-delivery/run-jobs",
    icon: Play,
    label: "Run Report Jobs",
  },
  { group: "Tools", to: "/reports", icon: BarChart3, label: "Reports" },
  { group: "Tools", to: "/menu-items", icon: ListTree, label: "Menu Items" },
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
  const { hasPath } = useMenuPermissions();
  const visibleItems = navItems.flatMap<(typeof navItems)[number]>((item) => {
    if (item.children) {
      const children = item.children.filter((child) => hasPath(child.to));
      return children.length ? [{ ...item, children }] : [];
    }
    return item.to && hasPath(item.to) ? [item] : [];
  });
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

  useEffect(() => {
    if (!isMobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileOpen]);

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
                "flex w-full items-center justify-between rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100",
                isMobileOpen ? "min-h-11 py-2.5" : "py-2",
                expandedItem === item.label &&
                  "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200",
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
                <div
                  className={clsx(
                    "mt-1",
                    isMobileOpen ? "grid grid-cols-2 gap-1" : "ml-9 space-y-1",
                  )}
                >
                  {item.children.map((child: any) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end
                      className={({ isActive }) =>
                        clsx(
                          "flex rounded-lg font-medium transition-colors",
                          isMobileOpen
                            ? "min-h-16 flex-col items-center justify-center gap-1 px-1.5 py-2 text-center text-[11px] leading-tight"
                            : "items-center gap-2 px-3 py-1.5 text-sm",
                          isActive
                            ? "bg-white text-primary-600 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                        )
                      }
                    >
                      <child.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{child.label}</span>
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
                "flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                isMobileOpen ? "min-h-11 py-2.5" : "py-2",
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
            isCompact ? "px-4 justify-center" : "px-5 justify-between md:px-6",
          )}
        >
          {!isCompact ? (
            <>
              <div
                className="flex min-w-0 items-center gap-2.5"
                aria-label="Life Dashboard"
              >
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
            "flex-1 py-3 scrollbar-hide transition-all duration-300",
            isCompact
              ? "space-y-1 overflow-visible px-2"
              : "space-y-0.5 overflow-y-auto px-3 pb-6",
          )}
        >
          {visibleItems.map((item, index) => {
            const previousGroup =
              index > 0 ? visibleItems[index - 1].group : "";
            const showGroup = !isCompact && item.group !== previousGroup;
            return (
              <div key={item.label}>
                {showGroup && (
                  <p
                    className={clsx(
                      "px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400",
                      index === 0 ? "pt-1" : "pt-4",
                    )}
                  >
                    {item.group}
                  </p>
                )}
                <div onClick={handleNavigation}>
                  <NavItem item={item} />
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
