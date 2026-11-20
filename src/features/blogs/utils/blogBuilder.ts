import type { BlogApiItem, BlogComponent, BlogComponentType, BlogPayload } from "../types";

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a"]);
export const sanitizeRichText = (value: string) => {
  if (typeof document === "undefined") return escapeHtml(value);
  const root = new DOMParser().parseFromString(value, "text/html").body;
  root.querySelectorAll("*").forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }
    if (tag === "a") {
      const href = element.getAttribute("href") || "";
      Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
      if (/^(https?:\/\/|mailto:|\/|#)/i.test(href)) {
        element.setAttribute("href", href);
        element.setAttribute("rel", "noopener noreferrer");
      } else element.replaceWith(...Array.from(element.childNodes));
    } else Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
  });
  return root.innerHTML;
};
const css = (block: BlogComponent) => `text-align:${block.settings.alignment || "left"};color:${block.settings.color || "#0f172a"};${block.settings.backgroundColor ? `background-color:${block.settings.backgroundColor};` : ""}`;
export const createBlock = (type: BlogComponentType = "paragraph"): BlogComponent => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, type, content: "", settings: {} });
export const parseBlocks = (blog?: BlogApiItem | null): BlogComponent[] => { const value = blog?.components_json; if (Array.isArray(value)) return value; if (typeof value === "string") { try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed as BlogComponent[] : []; } catch { return []; } } return []; };
export const generateBlogHtml = (blocks: BlogComponent[]) => `<article class="blog-post">${blocks.map((block) => { const content = escapeHtml(block.content || (block.type === "image" ? "" : "Add content")); const style = css(block); if (block.type === "header") return `<h2 class="blog-block-heading" style="${style}">${content}</h2>`; if (block.type === "subheader") return `<h3 class="blog-block-subheading" style="${style}">${content}</h3>`; if (block.type === "quote") return `<blockquote class="blog-block-quote" style="${style}">${content.replaceAll("\n", "<br>")}</blockquote>`; if (block.type === "code") return `<pre class="blog-block-code" style="${style}"><code>${content}</code></pre>`; if (block.type === "highlight") return `<aside class="blog-block-highlight" style="${style}">${content.replaceAll("\n", "<br>")}</aside>`; if (block.type === "footer") return `<footer class="blog-block-footer" style="${style}">${content.replaceAll("\n", "<br>")}</footer>`; if (block.type === "image") return block.content ? `<figure class="blog-block-image" style="${style}"><img src="${escapeHtml(block.content)}" alt="Blog visual"><figcaption>${escapeHtml(block.settings.caption || "")}</figcaption></figure>` : ""; if (block.type === "paragraph") return `<div class="blog-block-paragraph" style="${style}">${sanitizeRichText(block.content || "<p>Add content</p>")}</div>`; return `<p>${content.replaceAll("\n", "<br>")}</p>`; }).join("\n")}</article>`;
export const toPayload = (values: Omit<BlogPayload, "components_json" | "content">, blocks: BlogComponent[]): BlogPayload => ({ ...values, content: generateBlogHtml(blocks), components_json: JSON.stringify(blocks) });
