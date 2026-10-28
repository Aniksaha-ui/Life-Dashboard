import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../features/auth/types";
import { api } from "../lib/api/client";
import { useAuthStore } from "../stores/authStore";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileNav: () => void;
}

function formatPreviousLogin(value?: string) {
  if (!value || value === "--") return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month}, ${year} | ${time}`;
}

export function Header({ onOpenCommandPalette, onOpenMobileNav }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const profileUser = user as
    | (User & {
        email?: string;
        last_login?: string;
        last_login_at?: string;
      })
    | null;
  const displayName = profileUser?.profile_name || profileUser?.uname || "User";
  const username = profileUser?.uname || "--";
  const avatarLetter =
    profileUser?.uname?.trim().charAt(0).toUpperCase() || "U";
  const roleName = profileUser?.role_name || "--";
  const email = profileUser?.email || "--";
  const previousLoginRaw =
    profileUser?.last_login_at ||
    profileUser?.last_login ||
    profileUser?.created_on ||
    "--";
  const previousLogin = formatPreviousLogin(previousLoginRaw);

  const handleLogout = async () => {
    await api.auth.logout();
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 sticky top-0 z-30 sm:px-5 md:px-6">
      <div className="flex items-center flex-1 min-w-0 max-w-xl gap-2">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="md:hidden shrink-0 p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center w-full max-w-sm min-w-0 gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:border-slate-300 transition-colors group text-left cursor-text"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-500" />
          <span className="text-sm text-slate-500 flex-1">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        {/* Notifications */}
        <button
          onClick={() => navigate("/notifications")}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 ml-1 hover:bg-slate-50 rounded-full p-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm bg-slate-700 text-white flex items-center justify-center text-xs font-semibold uppercase">
              {avatarLetter}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-20 overflow-hidden font-sans">
                {/* Header Image Background */}
                <div
                  className="h-20 relative"
                  style={{ backgroundColor: "#F5F5FA" }}
                ></div>

                {/* Profile Content */}
                <div className="px-6 pb-3 -mt-10 text-center relative">
                  <div className="inline-block p-1 bg-white rounded-full mb-3">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm bg-slate-700 text-white flex items-center justify-center text-3xl font-bold uppercase">
                      {avatarLetter}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 font-medium">
                    {username}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {displayName}
                  </h3>

                  <div className="flex flex-col items-center gap-1 mt-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">
                      {roleName}
                    </span>
                    <span>{email}</span>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col gap-3 mb-4 px-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Previous Login</span>
                      <span className="text-slate-700">{previousLogin}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/change-password");
                    }}
                    className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium hover:text-primary-600 transition-colors w-full mt-4"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
