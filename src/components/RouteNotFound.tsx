import { Link } from "react-router-dom";
import { StripeGradient } from "../features/auth/components/StripeGradient";
import { useAuthStore } from "../stores/authStore";

export function RouteNotFound() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-50 text-slate-900">
      <StripeGradient />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16 sm:px-10">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-12">
          <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-600">
            ERROR 404
          </p>

          <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            This page took a wrong turn.
          </h1>

          <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
            The route you requested does not exist or may have been moved. Use
            one of the actions below to continue.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={isAuthenticated ? "/" : "/login"}
              className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              {isAuthenticated ? "Go To Home" : "Go To Login"}
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
