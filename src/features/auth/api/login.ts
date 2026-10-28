import type { User } from "../types";

export interface ExpenseLoginResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  expires_in?: number | null;
  user?: User;
  data?: {
    token?: string;
    token_type?: string;
    expires_in?: number | null;
    user?: User;
  };
}

const getLoginUrl = () => {
  const baseUrl = (
    import.meta.env.VITE_BASE_URL as string | undefined
  )?.replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("VITE_BASE_URL is not configured.");
  }

  return `${baseUrl}/auth/login`;
};

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (!payload || typeof payload !== "object") return fallback;

  const response = payload as {
    message?: string;
    msg?: string;
    error?: string;
    errors?: Record<string, string | string[]>;
  };
  const validationError =
    response.errors && Object.values(response.errors).flat().find(Boolean);
  return (
    validationError ||
    response.message ||
    response.msg ||
    response.error ||
    fallback
  );
};

/** Matches expense-tracking's direct email/password login request. */
export const requestLogin = async (
  email: string,
  password: string,
): Promise<ExpenseLoginResponse> => {
  const response = await fetch(getLoginUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.statusText));
  }

  return payload as ExpenseLoginResponse;
};
