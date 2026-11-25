import { LogOut, RefreshCcw, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PageLoadingState } from "../../../components/PageLoadingState";
import { useMenuPermissions } from "../../../hooks/useMenuPermissions";
import { useAuthStore } from "../../../stores/authStore";

const LAST_ROUTE_KEY = "life-dashboard:last-route";

/**
 * Enforces menu-based route permissions for every page inside AppLayout.
 * Redirects unauthorized visits to the user's first authorized route.
 */
export function MenuRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const {
    data,
    isPending,
    isFetching,
    isError,
    firstAuthorizedPath,
    isPathAuthorized,
    refetch,
  } = useMenuPermissions();

  const isCheckingPermissions = isPending || (!data && isFetching);
  const isIndexRoute = location.pathname === "/";
  const isAuthorized =
    (isIndexRoute && Boolean(firstAuthorizedPath)) ||
    isPathAuthorized(location.pathname);
  const shouldRedirect =
    !isCheckingPermissions &&
    !isError &&
    !isAuthorized &&
    Boolean(firstAuthorizedPath) &&
    firstAuthorizedPath !== location.pathname;

  useEffect(() => {
    if (!shouldRedirect || !firstAuthorizedPath) return;

    window.localStorage.setItem(LAST_ROUTE_KEY, firstAuthorizedPath);
    toast.error(
      "You are not authorized to access that page. Redirected to an authorized page.",
      { id: "unauthorized-route-redirect" },
    );
  }, [shouldRedirect, firstAuthorizedPath, location.pathname]);

  if (isCheckingPermissions) {
    return <PageLoadingState />;
  }

  if (isError) {
    return (
      <section className="mx-auto mt-8 max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-lg font-semibold text-slate-900">
          Unable to verify menu access
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Please retry loading your permissions.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </button>
      </section>
    );
  }

  if (shouldRedirect && firstAuthorizedPath) {
    return <Navigate to={firstAuthorizedPath} replace />;
  }

  if (!isAuthorized) {
    return (
      <section className="mx-auto mt-8 max-w-md rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-lg font-semibold text-slate-900">
          No Authorized Pages Assigned
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Your account currently does not have access to any dashboard pages.
          Please contact your administrator.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Access
          </button>
          <button
            type="button"
            onClick={() => {
              clearAuth();
              navigate("/login", { replace: true });
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </section>
    );
  }

  return <Outlet />;
}
