import clsx from "clsx";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) e.preventDefault();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-white">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <div
        className={clsx(
          "flex flex-col min-h-[100dvh] transition-all duration-300 ease-in-out md:pl-20",
          !isCollapsed && "md:pl-64",
        )}
      >
        <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 min-w-0 p-4 pb-24 bg-slate-50 overflow-auto sm:p-5 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
