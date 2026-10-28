import type { ApiResponse } from "../../../types/common";

export interface User {
  uid: number;
  utype: string;
  uname: string;
  force_change_pass: number;
  force_change_pin: number;
  created_on: string;
  typeid: string;
  role_id: number;
  status: number;
  profile_name: string;
  role_name: string;
}

export interface LoginResponseData {
  requires_2fa: boolean;
  session_token?: string;
  user_id?: string;
  otp_channel?: string;
  otp_sent_to?: string;
  expires_at?: string;
  warnings?: any[];
  warning_message?: string | null;

  // Direct login fields (when requires_2fa is false)
  session_id?: string;
  user?: User;
  change_pass?: boolean;
}

export interface Verify2FAResponseData {
  change_pass: boolean;
  session_id: string;
  user: User;
  device_trust_token: string;
  device_trusted: boolean;
  trust_expires_at: string;
}

export interface ForgotPasswordRequestOtpResponseData {
  otp_session_token: string;
  expires_at: string;
  email_sent_to: string;
}

export interface ForgotPasswordResetResponseData {
  password_changed: boolean;
}

export interface ChangePasswordResponseData {
  password_changed?: boolean;
  message?: string;
}

// Full response types using the common ApiResponse wrapper
export type LoginApiResponse = ApiResponse<LoginResponseData>;
export type Verify2FAApiResponse = ApiResponse<Verify2FAResponseData>;

export interface AuthContextType {
  loginId: string;
  setLoginId: (id: string) => void;
  pendingAuth: boolean;
  setPendingAuth: (pending: boolean) => void;
}
