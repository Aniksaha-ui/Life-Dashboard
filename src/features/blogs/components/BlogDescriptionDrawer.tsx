import { BookOpen } from "lucide-react";
import { MobileRecordDrawer } from "../../../components/MobileRecordDrawer";
import type { BlogApiItem } from "../types";
import { resolveBlogImageUrl } from "../utils/imageUrl";

const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function BlogDescriptionDrawer({
  blog,
  onClose,
}: {
  blog: BlogApiItem | null;
  onClose: () => void;
}) {
  const published =
    blog?.isPublished === true ||
    blog?.isPublished === 1 ||
    blog?.isPublished === "1";
  const content = blog ? plainText(blog.content || "") : "";
  const views = Number(blog?.view_count || 0).toLocaleString();

  return (
    <MobileRecordDrawer
      open={Boolean(blog)}
      onClose={onClose}
      title={blog?.title || "Post Details"}
      badge={blog ? (published ? "Published" : "Draft") : undefined}
      badgeClassName={
        published
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-amber-200"
      }
      recordId={blog ? `BLOG #${blog.id}` : undefined}
      hero={
        blog
          ? {
              icon: BookOpen,
              iconClassName: published
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600",
              overline: `${blog.category || "Blog"} post`,
              value: blog.title,
              meta: [blog.author_name, blog.published_date]
                .filter(Boolean)
                .join(" · "),
              coverImage: blog.image ? (
                <img
                  src={resolveBlogImageUrl(blog.image)}
                  alt=""
                  className="h-48 w-full border-b border-slate-100 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : undefined,
              stats: [
                {
                  label: "Category",
                  value: blog.category || "react",
                },
                {
                  label: "Total views",
                  value: `${views} views`,
                  valueClassName: "tabular-nums text-primary-700",
                },
              ],
            }
          : undefined
      }
      details={
        blog
          ? [
              { label: "Author", value: blog.author_name },
              { label: "Category", value: blog.category || "react" },
              { label: "Published Date", value: blog.published_date },
              { label: "Views", value: views },
              {
                label: "Summary",
                value: blog.short_description ? (
                  <span className="whitespace-pre-line">
                    {blog.short_description}
                  </span>
                ) : (
                  "No summary was provided."
                ),
                fullWidth: true,
              },
            ]
          : []
      }
      sections={
        blog
          ? [
              {
                title: "Description",
                items: [
                  {
                    label: "Content",
                    value: content ? (
                      <span className="whitespace-pre-line leading-6 text-slate-700">
                        {content}
                      </span>
                    ) : (
                      "No description was provided."
                    ),
                    fullWidth: true,
                  },
                ],
              },
            ]
          : []
      }
    />
  );
}
