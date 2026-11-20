const imageBaseUrl = () => (import.meta.env.VITE_IMAGE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

export function resolveBlogImageUrl(image?: string | null): string {
  if (!image) return "";
  if (/^(data:|blob:)/i.test(image)) return image;

  const baseUrl = imageBaseUrl();
  if (!baseUrl || (/^https?:/i.test(image) && !/\/storage\//i.test(image))) return image;

  // Laravel may return either `blogs/covers/file.png`, `/storage/blogs/...`,
  // or an APP_URL-based absolute URL such as `http://localhost/storage/blogs/...`.
  // Always use the browser-facing VITE_IMAGE_URL for storage-backed images.
  const storagePath = image.match(/(?:^|\/)storage\/(.+)$/i)?.[1];
  const path = (storagePath ?? image).replace(/^\/+/, "").replace(/^storage\//, "");
  return `${baseUrl}/${path}`;
}
