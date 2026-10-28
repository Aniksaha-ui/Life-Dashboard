import { getCookie, setCookie } from "../../../utils/cookie";

/**
 * Utility for generating browser-profile-scoped device fingerprints.
 */

/**
 * Converts a string to Base64Url format.
 */
export const toBase64Url = (value: string): string => {
  try {
    return btoa(value)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (e) {
    // Fallback for non-latin1 strings.
    const latin1 = encodeURIComponent(value).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16)),
    );
    return btoa(latin1)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
};

const INSTALL_ID_KEY = "device_install_id";
const INSTALL_ID_COOKIE_DAYS = 3650;
const DEVICE_FINGERPRINT_COOKIE_KEY = "device_fingerprint";
const DEVICE_FINGERPRINT_COOKIE_DAYS = 45;

const uint8ToBase64Url = (bytes: Uint8Array): string => {
  const binary = String.fromCharCode(...Array.from(bytes));
  return toBase64Url(binary);
};

const randomHex = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

const getStoredInstallId = (): string | null => {
  try {
    const fromStorage = localStorage.getItem(INSTALL_ID_KEY);
    if (fromStorage) {
      return fromStorage;
    }
  } catch (e) {
    // Ignore storage access issues and fallback to cookie.
  }

  return getCookie(INSTALL_ID_KEY);
};

/**
 * Creates and persists a browser-profile install identifier.
 */
const getOrCreateInstallId = (): string => {
  const existing = getStoredInstallId();
  if (existing) {
    return existing;
  }

  const installId = randomHex(16); // 128-bit random identifier.
  try {
    localStorage.setItem(INSTALL_ID_KEY, installId);
  } catch (e) {
    // Ignore localStorage failures; cookie still persists it.
  }
  setCookie(INSTALL_ID_KEY, installId, INSTALL_ID_COOKIE_DAYS);
  return installId;
};

const getPlatform = (): string => {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return (
    nav.userAgentData?.platform ||
    navigator.platform ||
    "na"
  ).toLowerCase();
};

const getUaMajor = (): string => {
  const ua = navigator.userAgent || "";

  const matchers: Array<[RegExp, string]> = [
    [/edg\/(\d+)/i, "edge"],
    [/opr\/(\d+)/i, "opera"],
    [/chrome\/(\d+)/i, "chrome"],
    [/firefox\/(\d+)/i, "firefox"],
    [/version\/(\d+).+safari/i, "safari"],
  ];

  for (const [pattern, family] of matchers) {
    const match = ua.match(pattern);
    if (match?.[1]) {
      return `${family}/${match[1]}`;
    }
  }

  return "other/0";
};

const getScreenBucket = (): string => {
  const width =
    typeof window.screen?.width === "number" ? window.screen.width : 0;
  const height =
    typeof window.screen?.height === "number" ? window.screen.height : 0;
  const dpr = window.devicePixelRatio || 1;
  const bucketSize = 100;
  const widthBucket = Math.round(width / bucketSize) * bucketSize;
  const heightBucket = Math.round(height / bucketSize) * bucketSize;
  const dprBucket = Math.round(dpr);
  return `${widthBucket}x${heightBucket}@${dprBucket}x`;
};

const getCanonicalFingerprintPayload = (): string => {
  const nav = navigator as Navigator & { deviceMemory?: number };

  const hc =
    typeof navigator.hardwareConcurrency === "number"
      ? String(navigator.hardwareConcurrency)
      : "na";
  const mem =
    typeof nav.deviceMemory === "number" ? String(nav.deviceMemory) : "na";
  const touch =
    typeof navigator.maxTouchPoints === "number"
      ? String(navigator.maxTouchPoints)
      : "0";
  const colorDepth =
    typeof window.screen?.colorDepth === "number"
      ? String(window.screen.colorDepth)
      : "na";

  return [
    getOrCreateInstallId(),
    getPlatform(),
    getUaMajor(),
    hc,
    mem,
    touch,
    getScreenBucket(),
    colorDepth,
  ].join("|");
};

/**
 * Generates a compact browser-profile device fingerprint.
 * Output format: <base64url_sha256_hash>
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  const cachedFingerprint = getCookie(DEVICE_FINGERPRINT_COOKIE_KEY);
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  const canonical = getCanonicalFingerprintPayload();

  try {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(canonical),
    );
    const hashBase64Url = uint8ToBase64Url(new Uint8Array(hashBuffer));
    setCookie(
      DEVICE_FINGERPRINT_COOKIE_KEY,
      hashBase64Url,
      DEVICE_FINGERPRINT_COOKIE_DAYS,
    );
    return hashBase64Url;
  } catch (e) {
    // Fallback if subtle crypto digest is unavailable.
    const fallbackHash = toBase64Url(canonical).slice(0, 43);
    setCookie(
      DEVICE_FINGERPRINT_COOKIE_KEY,
      fallbackHash,
      DEVICE_FINGERPRINT_COOKIE_DAYS,
    );
    return fallbackHash;
  }
};
