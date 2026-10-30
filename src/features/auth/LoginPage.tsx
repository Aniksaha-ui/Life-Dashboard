import clsx from "clsx";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import infinityLogo from "../../assets/infinitycodehubltd.jpeg";
import { useLoginMutation } from "./api/auth";
import { CaptchaField } from "./components/CaptchaField";
import { StripeGradient } from "./components/StripeGradient";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [error, setError] = useState("");
  const [showPasswordChangedNotice, setShowPasswordChangedNotice] =
    useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("password_changed_notice") === "1") {
      setShowPasswordChangedNotice(true);
      sessionStorage.removeItem("password_changed_notice");
    }
  }, []);

  const loginMutation = useLoginMutation({
    onSuccess: () => navigate("/account", { replace: true }),
    onError: (requestError) =>
      setError(requestError.message || "An error occurred. Please try again."),
  });

  const isFormValid =
    loginId.trim() !== "" &&
    password.trim() !== "" &&
    captchaInput.length === 4 &&
    captchaValid;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginMutation.isPending) return;

    if (!captchaValid) {
      setCaptchaError("Incorrect security code. Please try again.");
      return;
    }

    setError("");
    setCaptchaError("");
    loginMutation.mutate({ email: loginId, password, rememberMe: true });
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-primary-50">
      <StripeGradient />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 h-12 w-48">
            <img
              src={infinityLogo}
              alt="Infinity Code Hub"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Login to continue
          </h1>
          <p className="text-sm text-slate-600">
            Welcome back. Please enter your login details.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            )}
            {showPasswordChangedNotice && (
              <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">
                  Your password was changed. Please log in again.
                </p>
              </div>
            )}
            <div>
              <label
                htmlFor="loginId"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Login ID
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="Enter your login ID"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <CaptchaField
              value={captchaInput}
              onChange={(next) => {
                setCaptchaInput(next);
                if (captchaError) setCaptchaError("");
              }}
              onValidChange={setCaptchaValid}
              disabled={isLoading}
              error={captchaError}
            />
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={clsx(
                "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
                isFormValid && !isLoading
                  ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            SSLCOMMERZ will never ask for your password via phone or email.
          </p>
        </div>
      </div>
    </div>
  );
}
