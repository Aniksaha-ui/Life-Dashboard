import clsx from "clsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useMenuPermissions } from "../hooks/useMenuPermissions";
import { Header } from "./Header";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { Sidebar } from "./Sidebar";

const LAST_ROUTE_KEY = "life-dashboard:last-route";

export function AppLayout() {
  const location = useLocation();
  const { isSuccess, isPathAuthorized } = useMenuPermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) e.preventDefault();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (
      isSuccess &&
      location.pathname !== "/" &&
      isPathAuthorized(location.pathname)
    ) {
      const path = `${location.pathname}${location.search}${location.hash}`;
      window.localStorage.setItem(LAST_ROUTE_KEY, path);
    }
  }, [
    isSuccess,
    isPathAuthorized,
    location.hash,
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    const persistCurrentLocation = () => {
      if (
        isSuccess &&
        location.pathname !== "/" &&
        isPathAuthorized(location.pathname)
      ) {
        window.localStorage.setItem(
          LAST_ROUTE_KEY,
          `${location.pathname}${location.search}${location.hash}`,
        );
      }
    };
    window.addEventListener("beforeunload", persistCurrentLocation);
    return () =>
      window.removeEventListener("beforeunload", persistCurrentLocation);
  }, [
    isSuccess,
    isPathAuthorized,
    location.hash,
    location.pathname,
    location.search,
  ]);

  return (
    <div className="h-dvh overflow-hidden bg-white">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <div
        className={clsx(
          "flex h-full min-h-0 flex-col overflow-hidden transition-[padding] duration-300 ease-in-out md:pl-20",
          !isCollapsed && "md:pl-64",
        )}
      >
        <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain bg-slate-50 p-4 pb-28 sm:p-5 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileBottomNavigation
        hidden={isMobileNavOpen}
        onOpenMenu={() => setIsMobileNavOpen(true)}
      />
    </div>
  );
}
