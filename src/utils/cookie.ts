/**
 * Get a cookie value by name
 * @param name - The name of the cookie
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

/**
 * Set a cookie value
 * @param name - The name of the cookie
 * @param value - The value of the cookie
 * @param days - Optional number of days until expiration
 */
export const setCookie = (name: string, value: string, days?: number): void => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax${secure}`;
};

/**
 * Remove a cookie by name
 * @param name - The name of the cookie to remove
 */
export const removeCookie = (name: string): void => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};
