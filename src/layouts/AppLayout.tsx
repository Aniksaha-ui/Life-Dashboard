import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialLocation = useRef(true);
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
    const path = `${location.pathname}${location.search}${location.hash}`;
    const savedPath = window.localStorage.getItem("life-dashboard:last-route");
    const shouldRestoreSavedPath =
      isInitialLocation.current &&
      savedPath?.startsWith("/") &&
      savedPath !== path;

    if (shouldRestoreSavedPath) {
      isInitialLocation.current = false;
      navigate(savedPath, { replace: true });
      return;
    }

    if (!isInitialLocation.current && location.pathname !== "/") {
      window.localStorage.setItem("life-dashboard:last-route", path);
    }

    isInitialLocation.current = false;
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    const persistCurrentLocation = () => {
      window.localStorage.setItem("life-dashboard:last-route", `${location.pathname}${location.search}${location.hash}`);
    };
    window.addEventListener("beforeunload", persistCurrentLocation);
    return () => window.removeEventListener("beforeunload", persistCurrentLocation);
  }, [location.hash, location.pathname, location.search]);

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
