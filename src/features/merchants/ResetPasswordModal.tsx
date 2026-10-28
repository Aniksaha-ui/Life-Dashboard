import { useState } from "react";
import type { MerchantUser } from "../../data/mock/types";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { Drawer } from "../../components/Drawer";
import clsx from "clsx";

interface ResetPasswordModalProps {
  user: MerchantUser | null;
  isOpen: boolean;
  onClose: () => void;
}

// ── Matches ResellerDrawer's SectionHeader ─────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

// ── Matches ResellerDrawer's DetailRow (read-only) ─────────────────────────────
const DetailRow = ({
  label,
  value,
  mono = false,
  badge,
}: {
  label: string;
  value: string | undefined;
  mono?: boolean;
  badge?: { text: string; color: string };
}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 text-sm">
    <dt className="text-slate-500 font-medium">{label}</dt>
    <dd className="flex items-center gap-2 text-right font-semibold text-slate-900">
      {badge ? (
        <span
          className={clsx(
            "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
            badge.color,
          )}
        >
          {badge.text}
        </span>
      ) : (
        <span className={clsx("break-all", mono && "font-mono text-xs")}>
          {value || "—"}
        </span>
      )}
    </dd>
  </div>
);

export function ResetPasswordModal({
  user,
  isOpen,
  onClose,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1800);
  };

  const passwordMismatch = !!confirmPassword && password !== confirmPassword;
  const canSubmit = !!password && password === confirmPassword;

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">Reset Password</div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <Lock className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono text-slate-400">{user?.loginId}</span>
      </div>
    </div>
  );

  return (
    <Drawer
      open={isOpen && !!user}
      onClose={handleClose}
      title={customTitle}
      width="md"
    >
      <div className="pb-20">
        {isSuccess ? (
          /* ── Success state ───────────────────────────────────── */
          <div className="flex flex-col items-center text-center space-y-5 py-16">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Password Reset Successfully
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                The security credentials for{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {user?.loginId}
                </span>{" "}
                have been updated.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Target Account ─────────────────────────────── */}
            <section>
              <SectionHeader title="Target Account" />
              <div className="bg-white rounded-xl border border-slate-200 px-5 shadow-sm">
                <DetailRow
                  label="Full Name"
                  value={[user?.firstName, user?.lastName]
                    .filter(Boolean)
                    .join(" ")}
                />
                <DetailRow label="Login ID" value={user?.loginId} mono />
                <DetailRow
                  label="Status"
                  value={user?.status}
                  badge={{
                    text: user?.status ?? "",
                    color:
                      user?.status === "Active"
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-slate-600 bg-slate-100",
                  }}
                />
              </div>
            </section>

            {/* ── New Credentials ────────────────────────────── */}
            <section>
              <SectionHeader title="New Credentials" />
              <div className="grid grid-cols-1 gap-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full px-3 py-2 pr-10 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className={clsx(
                        "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 outline-none transition-all",
                        passwordMismatch
                          ? "border-rose-300 focus:ring-rose-500"
                          : "border-slate-200 focus:ring-primary-500",
                      )}
                    />
                  </div>
                  {passwordMismatch && (
                    <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Passwords do not match.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ── Submit ─────────────────────────────────────── */}
            <div className="pt-2 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
              <button
                type="submit"
                disabled={!canSubmit}
                className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2 disabled:cursor-not-allowed"
              >
                Confirm Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
