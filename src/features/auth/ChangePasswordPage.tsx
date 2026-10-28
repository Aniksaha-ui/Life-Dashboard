import { clsx } from "clsx";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeCookie } from "../../utils/cookie";
import { useAuthStore } from "../../stores/authStore";
import { useChangePasswordMutation } from "./api/auth";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const changePasswordMutation = useChangePasswordMutation({
    onSuccess: () => {
      sessionStorage.setItem("password_changed_notice", "1");
      clearAuth();
      removeCookie("session_id");
      removeCookie("session_token");
      navigate("/login", { replace: true });
    },
    onError: (err) => {
      setError(err.message || "Failed to change password. Please try again.");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    changePasswordMutation.mutate({
      current_password: oldPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });
  };

  const isSaving = changePasswordMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
        <p className="text-slate-500 text-sm">
          Manage your account security by updating your password.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <form onSubmit={handleSave} className="p-8 space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-800">{error}</p>
            </div>
          )}

          {/* Security Details - No title/icon requested */}
          <FormSection title="" icon={null}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Old Password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e: any) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
                showToggle
                isToggled={showOldPassword}
                onToggle={() => setShowOldPassword(!showOldPassword)}
                required
              />
              <div className="hidden md:block" />{" "}
              {/* Forces Old Password to 50% row */}
              <InputField
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e: any) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                showToggle
                isToggled={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                required
              />
              <InputField
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                showToggle
                isToggled={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                required
              />
            </div>
          </FormSection>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className={clsx(
                "md:w-auto min-w-[200px] py-2.5 px-6 rounded-lg font-semibold text-sm transition-all",
                !isSaving
                  ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              {isSaving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Guaranteed vertical spacer between form and policies */}
      <div className="h-10 md:h-12" aria-hidden="true" />

      {/* Policies Section outside the card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Password Character Policy
            </h2>
          </div>
          <ul className="space-y-3.5 ml-7">
            {[
              "Password length must be more/equal to 12 characters",
              "It must contain minimum a character is UPPERCASE [A-Z]",
              "It must contain minimum a character is LOWERCASE [a-z]",
              "It must contain minimum a NUMBER [1-0]",
              "It must contain minimum a special character, except ` and ^ and Space",
              "It must not contain repeated characters.",
            ].map((policy, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-slate-600 text-xs leading-relaxed"
              >
                <span className="mt-2 w-1 h-1 rounded-full bg-primary-500 shrink-0" />
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Password Change Policy
            </h2>
          </div>
          <ul className="space-y-3.5 ml-7">
            {[
              "Password must be changed within 90 days.",
              "From 80th to 90th, user will get alert to change password.",
              "After 30 days, the account will be blocked.",
              "One of previously used passwords cannot be set as new password.",
            ].map((policy, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-slate-600 text-xs leading-relaxed"
              >
                <span className="mt-2 w-1 h-1 rounded-full bg-primary-500 shrink-0" />
                <span>{policy}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// --- Form Components Matching EditStoreDiscountPage ---

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title?: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      {title && (
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          {Icon && <Icon className="w-4 h-4 text-primary-500" />}
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            {title}
          </h2>
        </div>
      )}
      <div className={clsx("pt-2", title ? "pl-6" : "")}>{children}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  showToggle = false,
  isToggled = false,
  onToggle = () => {},
}: any) {
  return (
    <div className="flex flex-col gap-4 relative">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors pr-12"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {isToggled ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
