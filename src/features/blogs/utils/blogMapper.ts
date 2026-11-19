import type { BlogApiItem, BlogRow } from "../types";

const published = (value: BlogApiItem["isPublished"]) =>
  value === true || value === 1 || value === "1";

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toLowerCase();
};

export const mapBlog = (blog: BlogApiItem, index: number): BlogRow => ({
  id: blog.id,
  serial: index + 1,
  title: blog.title || "N/A",
  author: blog.author_name || "N/A",
  category: blog.category || "N/A",
  publishedDateLabel: formatDate(blog.published_date),
  isPublished: published(blog.isPublished),
  viewCount: Number(blog.view_count) || 0,
  blog,
});
