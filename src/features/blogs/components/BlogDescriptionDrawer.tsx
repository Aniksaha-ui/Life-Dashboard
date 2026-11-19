import { CalendarDays, Eye, FileText, Tag, UserRound } from "lucide-react";
import { Drawer } from "../../../components/Drawer";
import type { BlogApiItem } from "../types";

const plainText = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export function BlogDescriptionDrawer({ blog, onClose }: { blog: BlogApiItem | null; onClose: () => void }) {
  if (!blog) return null;
  const published = blog.isPublished === true || blog.isPublished === 1 || blog.isPublished === "1";
  const content = plainText(blog.content || "");

  return <Drawer open={Boolean(blog)} onClose={onClose} width="xl" title="Post description" subtitle="Read-only post details">
    <div className="space-y-6">
      {blog.image && <img src={blog.image} alt="" className="h-44 w-full rounded-xl border border-slate-100 object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
      <div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{published ? "Published" : "Draft"}</span><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">{blog.category || "react"}</span></div><h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{blog.title}</h3><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" />{blog.author_name}</span>{blog.published_date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{blog.published_date}</span>}<span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" />{Number(blog.view_count || 0).toLocaleString()} views</span></div></div>
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Tag className="h-4 w-4 text-primary-600" /> Summary</div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{blog.short_description || "No summary was provided."}</p></section>
      <section><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><FileText className="h-4 w-4 text-primary-600" /> Description</div><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{content || "No description was provided."}</p></section>
    </div>
  </Drawer>;
}
