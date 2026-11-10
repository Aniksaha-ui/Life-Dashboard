import clsx from "clsx";
import { AlertCircle, BarChart3, CheckCircle2, Eye, EyeOff, LayoutDashboard, Shield } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "./api/auth";
import { CaptchaField } from "./components/CaptchaField";

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
    <div className="relative flex min-h-dvh justify-center overflow-x-hidden bg-[rgba(241,245,249,0.92)] p-0 sm:items-center sm:p-6 lg:p-8">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-28 h-96 w-96 rounded-full bg-[rgba(74,117,186,0.14)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[rgba(153,181,223,0.34)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.66)] blur-3xl" />
      <main className="relative z-10 grid w-full min-w-0 max-w-5xl self-stretch overflow-hidden rounded-none border-y border-white/70 bg-white shadow-2xl shadow-primary-900/10 sm:self-auto sm:rounded-2xl sm:border lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-[620px] overflow-hidden bg-primary-800 p-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,.18),transparent_30%),radial-gradient(circle_at_90%_88%,rgba(110,160,234,.42),transparent_38%)]" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><LayoutDashboard className="h-5 w-5" /></span>
            <span className="text-xl font-bold tracking-tight">Life Dashboard</span>
          </div>
          <div className="relative my-auto max-w-md">
            <span className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary-50">YOUR FINANCES, IN FOCUS</span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">Take control of every financial decision.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-primary-100">Organize accounts, understand your spending, and keep your budget on track from one secure workspace.</p>
          </div>
          <div className="relative grid grid-cols-2 gap-3"><InfoTile icon={<BarChart3 className="h-4 w-4" />} label="Clear insights" text="Track the numbers that matter." /><InfoTile icon={<Shield className="h-4 w-4" />} label="Secure access" text="Your account stays protected." /></div>
        </section>

        <section className="flex min-h-dvh min-w-0 flex-col justify-center px-4 py-7 sm:min-h-[min(680px,calc(100dvh-3rem))] sm:px-10 sm:py-10 lg:min-h-[620px] lg:px-12">
          <div className="mb-6 flex items-center gap-3 lg:hidden" aria-label="Life Dashboard"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600 text-white shadow-sm"><LayoutDashboard className="h-5 w-5" /></span><span className="text-xl font-bold tracking-tight text-slate-900">Life Dashboard</span></div>
          <div className="mb-6 sm:mb-7"><p className="text-sm font-semibold text-primary-700">Welcome back</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sign in to your account</h2><p className="mt-2 text-sm leading-6 text-slate-500">Enter your credentials to access your financial overview.</p></div>
          <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-4 sm:space-y-5">
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
            <div className="min-w-0">
              <label
                htmlFor="loginId"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Login ID
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                placeholder="Enter your login ID"
                className="box-border w-full max-w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="min-w-0">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="box-border w-full max-w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm transition-colors outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
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
                "box-border w-full max-w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                isFormValid && !isLoading
                  ? "bg-primary-600 text-white shadow-sm shadow-primary-600/25 hover:bg-primary-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <div className="mt-6 border-t border-slate-100 pt-4 text-center sm:mt-7 sm:pt-5">
            <p className="text-xs leading-5 text-slate-500">
            <Shield className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            SSLCOMMERZ will never ask for your password via phone or email.
          </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoTile({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-primary-50">{icon}</span><p className="text-sm font-semibold">{label}</p><p className="mt-0.5 text-xs leading-5 text-primary-100">{text}</p></div>;
}
