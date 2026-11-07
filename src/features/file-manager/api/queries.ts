import { getCookie } from "../../../utils/cookie";
import { useAuthStore } from "../../../stores/authStore";

const baseUrl = () =>
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";
const token = () =>
  getCookie("session_id") || useAuthStore.getState().token || "";
const request = async <T>(path: string, init: RequestInit = {}) => {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token()}`,
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.isExecute === false)
    throw new Error(payload?.message || payload?.msg || "File request failed.");
  return (payload?.data ?? payload) as T;
};
export const getItems = (folderId: string | number | null) =>
  request<any>(
    `/file-manager/items${folderId ? `?folder_id=${folderId}` : ""}`,
  );
export const createFolder = (name: string, parentId: string | number | null) =>
  request("/file-manager/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parent_id: parentId || null }),
  });
export const uploadFiles = (
  files: File[],
  folderId: string | number | null,
) => {
  const body = new FormData();
  if (folderId) body.append("folder_id", String(folderId));
  files.forEach((file) => body.append("files[]", file));
  return request("/file-manager/files", { method: "POST", body });
};
export const renameItem = (
  kind: "files" | "folders",
  id: string | number,
  name: string,
) =>
  request(`/file-manager/${kind}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
export const deleteItem = (kind: "files" | "folders", id: string | number) =>
  request(`/file-manager/${kind}/${id}/delete`, { method: "POST" });
export const downloadFile = async (id: string | number) => {
  const response = await fetch(
    `${baseUrl()}/file-manager/files/${id}/download`,
    { headers: { Authorization: `Bearer ${token()}` } },
  );
  if (!response.ok) throw new Error("Download failed.");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = "download";
  link.click();
  URL.revokeObjectURL(url);
};
export const getFilePreview = async (id: string | number) => {
  const response = await fetch(`${baseUrl()}/file-manager/files/${id}/preview`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!response.ok) throw new Error("Preview is not available for this file.");
  return { url: URL.createObjectURL(await response.blob()), mime: response.headers.get("content-type") || "" };
};
export const getTextContent = (id: string | number) => request<{ content?: string }>(`/file-manager/files/${id}/content`);
export const saveTextContent = (id: string | number, content: string) => request(`/file-manager/files/${id}/content`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
export const uploadFileVersion = (id: string | number, file: File) => { const body = new FormData(); body.append("file", file); return request(`/file-manager/files/${id}/versions`, { method: "POST", body }); };
