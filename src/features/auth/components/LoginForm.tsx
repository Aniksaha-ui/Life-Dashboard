import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../api/auth";
import { AUTH_COPY } from "../constants/auth.constants";
import {
  validateLoginForm,
  type LoginFormErrors,
  type LoginFormValues,
} from "../validation/loginValidation";

const DEFAULT_FORM: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: true,
};

export function LoginForm() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<LoginFormValues>(DEFAULT_FORM);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [error, setError] = useState("");

  const loginMutation = useLoginMutation({
    onSuccess: () => navigate("/", { replace: true }),
    onError: (requestError) =>
      setError(requestError.message || "Unable to sign in."),
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name, type, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formErrors = validateLoginForm(formValues);
    setErrors(formErrors);
    setError("");

    if (Object.keys(formErrors).length > 0) return;

    loginMutation.mutate(formValues);
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[520px] rounded-lg border border-[#2d282b] bg-[#171314] p-5 shadow-2xl shadow-black/30 sm:p-8"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-400">Admin panel</p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {AUTH_COPY.pageTitle}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#969baa]">
          {AUTH_COPY.pageSubtitle}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200">
          {error}
        </div>
      )}

      <label className="mb-5 block">
        <span className="mb-2 block text-sm font-semibold text-white">
          Email address
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={isSubmitting}
          className={`h-11 w-full rounded-md border bg-[#211c1f] px-3 text-sm text-white outline-none transition placeholder:text-[#686b77] focus:border-blue-500 disabled:opacity-60 ${errors.email ? "border-red-700" : "border-[#332d30]"}`}
        />
        {errors.email && (
          <span className="mt-2 block text-xs font-medium text-red-300">
            {errors.email}
          </span>
        )}
      </label>

      <label className="mb-3 block">
        <span className="mb-2 flex items-center justify-between text-sm font-semibold text-white">
          Password
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {AUTH_COPY.forgotPassword}
          </button>
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          value={formValues.password}
          onChange={handleChange}
          placeholder="Your password"
          disabled={isSubmitting}
          className={`h-11 w-full rounded-md border bg-[#211c1f] px-3 text-sm text-white outline-none transition placeholder:text-[#686b77] focus:border-blue-500 disabled:opacity-60 ${errors.password ? "border-red-700" : "border-[#332d30]"}`}
        />
        {errors.password && (
          <span className="mt-2 block text-xs font-medium text-red-300">
            {errors.password}
          </span>
        )}
      </label>

      <label className="mb-6 flex items-center gap-2 text-sm font-medium text-[#969baa]">
        <input
          name="rememberMe"
          type="checkbox"
          checked={formValues.rememberMe}
          onChange={handleChange}
          className="h-4 w-4 rounded border-[#332d30] bg-[#211c1f]"
        />
        {AUTH_COPY.rememberMeLabel}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-900 disabled:text-blue-200"
      >
        {isSubmitting ? "Signing in..." : AUTH_COPY.signInLabel}
      </button>
    </form>
  );
}
