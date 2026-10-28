import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

interface AuthGuardProps {
  children?: React.ReactNode;
}

/**
 * AuthGuard - Protects routes from unauthenticated access by checking the Zustand store.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function GuestGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
