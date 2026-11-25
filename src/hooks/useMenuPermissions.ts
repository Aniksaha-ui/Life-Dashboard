import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { getCookie } from "../utils/cookie";

interface MenuItem {
  id: number;
  path: string | null;
  title: string;
}

export function useMenuPermissions() {
  const storedToken = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = getCookie("session_id") || storedToken;
  const query = useQuery({
    queryKey: ["menu-permissions", token],
    enabled: isAuthenticated && Boolean(token),
    queryFn: async () => {
      const baseUrl = (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "");
      if (!baseUrl) throw new Error("VITE_BASE_URL is not configured.");
      const response = await axiosInstance.get<{ data: MenuItem[] }>(`${baseUrl}/my-menu-items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { ...query, hasPath: (path: string) => query.data?.some((item) => item.path === path) ?? false };
}
