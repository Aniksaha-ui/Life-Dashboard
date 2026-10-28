import clsx from "clsx";
import { AlertCircle, ArrowLeft, Mail, Shield } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoSslCommerz from "../../assets/logo_ssl_commerz.svg";
import { useForgotPasswordRequestOtpMutation } from "./api/auth";
import { StripeGradient } from "./components/StripeGradient";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const requestOtpMutation = useForgotPasswordRequestOtpMutation({
    onSuccess: () => {
      navigate("/forgot-password/verify");
    },
    onError: (err) => {
      setError(err.message || "Failed to request OTP. Please try again.");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (requestOtpMutation.isPending) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    requestOtpMutation.mutate({ email: trimmedEmail });
  };

  const isLoading = requestOtpMutation.isPending;
  const isFormValid = email.trim() !== "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-primary-50">
      <StripeGradient />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img
            src={logoSslCommerz}
            alt="SSLCOMMERZ"
            className="h-10 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Forgot password
          </h1>
          <p className="text-sm text-slate-600">
            Enter your email to receive a one-time OTP.
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

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 pl-11 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  disabled={isLoading}
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

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
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
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
