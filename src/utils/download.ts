/**
 * Triggers a browser download of a file from a Blob or ArrayBuffer.
 *
 * @param data The file content as a Blob or ArrayBuffer
 * @param filename The desired name of the file (including extension)
 * @param mimeType Optional MIME type of the file
 */
export function downloadFile(
  data: BlobPart,
  filename: string,
  mimeType?: string,
) {
  const blob =
    data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

type BlobExportResponse = {
  data: Blob;
  headers?: Record<string, unknown>;
};

type BlobExportInspection = {
  isError: boolean;
  isSessionExpired: boolean;
  message?: string;
};

/**
 * Some export APIs return JSON error payloads as Blob (often with 200 status).
 * Inspect the response before downloading and detect session-expiry signals.
 */
export async function inspectBlobExportResponse(
  response: BlobExportResponse,
): Promise<BlobExportInspection> {
  const contentType = String(
    response.headers?.["content-type"] || response.data?.type || "",
  ).toLowerCase();

  if (
    !contentType.includes("application/json") &&
    !contentType.includes("text/json")
  ) {
    return { isError: false, isSessionExpired: false };
  }

  let payload: any = null;
  try {
    payload = JSON.parse(await response.data.text());
  } catch {
    return {
      isError: true,
      isSessionExpired: false,
      message: "Failed to export CSV.",
    };
  }

  const message =
    (typeof payload?.message === "string" && payload.message) ||
    "Failed to export CSV.";
  const normalizedMessage = message.toLowerCase();

  const isSessionExpired =
    payload?.code === 401 ||
    payload?.status === 401 ||
    normalizedMessage.includes("session") ||
    normalizedMessage.includes("unauth") ||
    normalizedMessage.includes("login");

  return {
    isError: true,
    isSessionExpired,
    message,
  };
}
