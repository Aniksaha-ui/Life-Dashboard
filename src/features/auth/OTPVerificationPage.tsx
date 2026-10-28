import clsx from "clsx";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import logoSslCommerz from "../../assets/logo_ssl_commerz.svg";
import { useAuthStore } from "../../stores/authStore";
import { useResendOTPMutation, useVerifyOTPMutation } from "./api/auth";
import { StripeGradient } from "./components/StripeGradient";
import { useOTP } from "./hooks/useOTP";
import { generateDeviceFingerprint } from "./utils/fingerprint";

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const { loginId, sessionToken, otpSentTo } = useAuthStore();
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState("");

  const maskedContact =
    otpSentTo ||
    (loginId?.includes("@")
      ? loginId.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      : `***${loginId?.slice(-4)}`);

  const verifyMutation = useVerifyOTPMutation({
    onSuccess: (data) => {
      if (data?.session_id) {
        // The store is updated automatically by the useVerifyOTPMutation's onSuccess
        navigate("/dashboard");
      } else {
        setError("Verification failed. Please try again.");
        otpHandler.resetOtp();
      }
    },
    onError: (err) => {
      setError(err.message || "An error occurred. Please try again.");
      otpHandler.resetOtp();
    },
  });

  const resendMutation = useResendOTPMutation({
    onSuccess: () => {
      otpHandler.startCooldown();
      setError("");
      otpHandler.resetOtp();
    },
    onError: (err) => {
      setError(err.message || "Failed to resend OTP. Please try again.");
    },
  });

  // useOTP without onComplete to prevent auto-verification
  const otpHandler = useOTP();

  const handleVerify = async (otpValue: string) => {
    if (!sessionToken) {
      setError("Session expired. Please login again.");
      return;
    }

    try {
      const fingerprint = await generateDeviceFingerprint();
      verifyMutation.mutate({
        session_token: sessionToken,
        otp: otpValue,
        device_fingerprint: fingerprint,
        trustDevice,
      });
    } catch (err) {
      setError("Failed to generate security fingerprint.");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!otpHandler.isComplete || verifyMutation.isPending) return;
    handleVerify(otpHandler.otpValue);
  };

  const handleResendOTP = () => {
    if (otpHandler.resendCooldown > 0 || resendMutation.isPending) return;

    if (!sessionToken) {
      setError("Session expired. Please login again.");
      return;
    }

    resendMutation.mutate({ session_token: sessionToken });
  };

  const isLoading = verifyMutation.isPending || resendMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-primary-50">
      <StripeGradient />
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoSslCommerz}
            alt="SSLCOMMERZ"
            className="h-10 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify OTP</h1>
          <p className="text-sm text-slate-600">
            Enter the 6-digit code sent to your registered email or phone.
          </p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Info Banner */}
          {!error && (
            <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-medium">OTP sent successfully</p>
                <p className="text-emerald-700 mt-0.5">
                  Code sent to {maskedContact}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            )}

            {/* OTP Input */}
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
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Trust Device */}
            <div className="flex items-start gap-3">
              <input
                id="trustDevice"
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <label
                htmlFor="trustDevice"
                className="text-sm text-slate-700 cursor-pointer select-none"
              >
                Trust this device for 30 days
              </label>
            </div>

            {/* Resend OTP */}
            <div className="text-center text-sm">
              {otpHandler.resendCooldown > 0 ? (
                <p className="text-slate-500 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Resend OTP in {otpHandler.resendCooldown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                  disabled={isLoading}
                >
                  Didn't receive the code? Resend OTP
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!otpHandler.isComplete || isLoading}
              className={clsx(
                "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all",
                otpHandler.isComplete && !isLoading
                  ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Back to Login */}
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

        {/* Security Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            Your OTP is valid for 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
