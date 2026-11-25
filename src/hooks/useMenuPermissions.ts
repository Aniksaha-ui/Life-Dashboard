import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { axiosInstance } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { getCookie } from "../utils/cookie";

export interface PermittedMenuItem {
  id: number;
  path: string | null;
  title: string;
}

/**
 * Canonical application paths in sidebar display order.
 * Only paths present here are used as valid redirect targets.
 */
export const KNOWN_APP_PATHS = [
  "/account",
  "/categories",
  "/transactions",
  "/transfers",
  "/recurring-expenses",
  "/budgets",
  "/blogs",
  "/publications",
  "/experiences",
  "/projects",
  "/testimonials",
  "/trainings",
  "/services",
  "/file-manager",
  "/financial-intelligence",
  "/report-delivery",
  "/report-delivery/run-jobs",
  "/reports",
  "/menu-items",
] as const;

const PATHS_BY_SPECIFICITY = [...KNOWN_APP_PATHS].sort(
  (first, second) => second.length - first.length,
);

const normalizePathname = (pathname: string): string => {
  const pathOnly = pathname.split(/[?#]/)[0] || "/";
  return pathOnly.length > 1 ? pathOnly.replace(/\/+$/, "") : pathOnly;
};

/**
 * Maps any nested route (e.g. `/blogs/5/edit` or `/reports/summary`)
 * to its governing menu permission path.
 */
export function resolveMenuPathForRoute(pathname: string): string | null {
  const normalized = normalizePathname(pathname);

  for (const candidate of PATHS_BY_SPECIFICITY) {
    if (normalized === candidate || normalized.startsWith(`${candidate}/`)) {
      return candidate;
    }
  }

  return null;
}

export function useMenuPermissions() {
  const storedToken = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = getCookie("session_id") || storedToken;

  const query = useQuery({
    queryKey: ["menu-permissions", token],
    enabled: isAuthenticated && Boolean(token),
    queryFn: async () => {
      const baseUrl = (
        import.meta.env.VITE_BASE_URL as string | undefined
      )?.replace(/\/+$/, "");
      if (!baseUrl) throw new Error("VITE_BASE_URL is not configured.");
      const response = await axiosInstance.get<{ data: PermittedMenuItem[] }>(
        `${baseUrl}/my-menu-items`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const allowedPathSet = useMemo(() => {
    const paths = new Set<string>();
    for (const item of query.data ?? []) {
      if (item.path) {
        paths.add(normalizePathname(item.path));
      }
    }
    return paths;
  }, [query.data]);

  const authorizedPaths = useMemo(
    () => KNOWN_APP_PATHS.filter((path) => allowedPathSet.has(path)),
    [allowedPathSet],
  );

  const firstAuthorizedPath = authorizedPaths[0] ?? null;

  const hasPath = useCallback(
    (path: string) => allowedPathSet.has(normalizePathname(path)),
    [allowedPathSet],
  );

  const isPathAuthorized = useCallback(
    (pathname: string) => {
      const governingPath = resolveMenuPathForRoute(pathname);
      return governingPath !== null && allowedPathSet.has(governingPath);
    },
    [allowedPathSet],
  );

  return {
    ...query,
    authorizedPaths,
    firstAuthorizedPath,
    hasPath,
    isPathAuthorized,
  };
}
