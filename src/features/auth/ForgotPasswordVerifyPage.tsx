import clsx from "clsx";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoSslCommerz from "../../assets/logo_ssl_commerz.svg";
import { useAuthStore } from "../../stores/authStore";
import { useForgotPasswordResetMutation } from "./api/auth";
import { StripeGradient } from "./components/StripeGradient";
import { useOTP } from "./hooks/useOTP";

function getApiErrorMessage(error: any): string {
  const otpErrors =
    error?.response?.data?.errors?.otpCode ||
    error?.response?.data?.errors?.otp_code ||
    error?.response?.data?.errors?.otp;

  if (Array.isArray(otpErrors) && otpErrors.length > 0) {
    return otpErrors[0];
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    "Failed to reset password. Please try again."
  );
}

export default function ForgotPasswordVerifyPage() {
  const navigate = useNavigate();
  const {
    forgotPasswordOtpSessionToken,
    forgotPasswordSentTo,
    forgotPasswordEmail,
    clearForgotPasswordFlow,
  } = useAuthStore();
  const otpHandler = useOTP();
  const [step, setStep] = useState<"otp" | "password">("otp");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const resetMutation = useForgotPasswordResetMutation({
    onSuccess: (data) => {
      if (data?.password_changed) {
        setIsSuccess(true);
        setError("");
        clearForgotPasswordFlow();
      } else {
        setError("Password reset failed. Please try again.");
      }
    },
    onError: (err: any) => {
      const message = getApiErrorMessage(err);
      setError(message);
      if (message.toLowerCase().includes("otp")) {
        setStep("otp");
        otpHandler.resetOtp();
      }
    },
  });

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      navigate("/login");
    }, 1800);
    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (resetMutation.isPending) return;

    if (!forgotPasswordOtpSessionToken) {
      setError("OTP session is invalid or expired. Please request OTP again.");
      return;
    }
    if (step === "otp") {
      if (!otpHandler.isComplete) {
        setError("Please enter the 6-digit OTP.");
        return;
      }

      setError("");
      setStep("password");
      return;
    }
    if (!newPassword.trim()) {
      setError("New password is required.");
      return;
    }
    if (!confirmPassword.trim()) {
      setError("Password confirmation is required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setError("");
    resetMutation.mutate({
      otp_session_token: forgotPasswordOtpSessionToken,
      otp_code: otpHandler.otpValue,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });
  };

  const isLoading = resetMutation.isPending;
  const hasSession = Boolean(forgotPasswordOtpSessionToken);
  const targetEmail =
    forgotPasswordSentTo || forgotPasswordEmail || "your email";
  const isPasswordStepValid =
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    newPassword === confirmPassword;
  const isSubmitEnabled =
    hasSession &&
    !isLoading &&
    (step === "otp" ? otpHandler.isComplete : isPasswordStepValid);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-primary-50">
        <StripeGradient />
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center relative z-10">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Password reset successful
          </h2>
          <p className="text-slate-600 text-sm mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
            {step === "otp" ? "Verify OTP" : "Set a new password"}
          </h1>
          <p className="text-sm text-slate-600">
            {step === "otp"
              ? `Enter the OTP sent to ${targetEmail}.`
              : "Create your new password to finish resetting your account."}
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

            {!hasSession && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Session expired. Please request OTP again.
                </p>
              </div>
            )}

            {step === "otp" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Enter OTP
                </label>
                <div className="flex gap-2 justify-between">
                  {otpHandler.otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpHandler.inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        otpHandler.handleChange(index, e.target.value)
                      }
                      onKeyDown={(e) => otpHandler.handleKeyDown(index, e)}
                      onPaste={index === 0 ? otpHandler.handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      disabled={isLoading || !hasSession}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === "password" && (
              <>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      disabled={isLoading || !hasSession}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      disabled={isLoading || !hasSession}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === "password" && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("otp");
                }}
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
                disabled={isLoading}
              >
                Back to OTP
              </button>
            )}

            <button
              type="submit"
              disabled={!isSubmitEnabled}
              className={clsx(
                "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
                isSubmitEnabled
                  ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              {step === "otp"
                ? "Continue"
                : isLoading
                  ? "Resetting password..."
                  : "Reset password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Request OTP again
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            For your security, OTP and password reset are time-limited.
          </p>
        </div>
      </div>
    </div>
  );
}
