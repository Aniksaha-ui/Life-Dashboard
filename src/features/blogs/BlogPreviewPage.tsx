import { ArrowLeft, CalendarDays, Clock3, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getBlog } from "./api/queries";
import type { BlogApiItem } from "./types";

const isPublished = (value: BlogApiItem["isPublished"]) => value === true || value === 1 || value === "1";

function LoadingPreview() {
  return <div className="mx-auto max-w-5xl animate-pulse space-y-5"><div className="h-5 w-32 rounded bg-slate-200" /><div className="h-96 rounded-3xl bg-slate-200" /><div className="mx-auto max-w-2xl space-y-3"><div className="h-8 w-3/4 rounded bg-slate-200" /><div className="h-5 w-full rounded bg-slate-100" /><div className="h-5 w-5/6 rounded bg-slate-100" /></div></div>;
}

export default function BlogPreviewPage() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogApiItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!blogId) return;
      try { setBlog(await getBlog(blogId)); }
      catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load blog post.");
        navigate("/blogs", { replace: true });
      } finally { setLoading(false); }
    })();
  }, [blogId, navigate]);

  if (loading) return <LoadingPreview />;
  if (!blog) return null;

  const date = blog.published_date
    ? new Date(`${blog.published_date.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "No publish date";
  const wordCount = blog.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));
  const published = isPublished(blog.isPublished);

  return <article className="mx-auto max-w-5xl pb-8">
    <button type="button" onClick={() => navigate("/blogs")} className="mb-5 inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-slate-600 transition hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"><ArrowLeft className="h-4 w-4" />All posts</button>
    <header className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl shadow-slate-900/10"><div className="relative min-h-[330px] overflow-hidden sm:min-h-[410px]">{blog.image ? <img src={blog.image} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#4a75ba,_#17253d_55%,_#0f172a)]" />}<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/15" /><div className="relative flex min-h-[330px] flex-col justify-end p-6 sm:min-h-[410px] sm:p-10 lg:p-12"><div className="flex flex-wrap gap-2"><span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">{blog.category || "Uncategorized"}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${published ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950"}`}>{published ? "Published" : "Draft preview"}</span></div><h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.08]">{blog.title}</h1>{blog.short_description && <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">{blog.short_description}</p>}</div></div></header>
    <div className="relative mx-auto -mt-1 max-w-4xl px-0 sm:-mt-5 sm:px-6"><div className="border-x border-b border-slate-200 bg-white px-6 py-5 shadow-sm sm:rounded-b-2xl sm:border sm:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-primary-100 text-sm font-extrabold text-primary-700">{(blog.author_name || "A").slice(0, 1).toUpperCase()}</span><div><p className="text-sm font-bold text-slate-800">{blog.author_name || "Unknown author"}</p><p className="mt-0.5 text-xs text-slate-500">Article author</p></div></div><div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-primary-600" />{date}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-primary-600" />{readingTime} min read</span><span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary-600" />{Number(blog.view_count || 0).toLocaleString()} views</span></div></div></div></div>
    <div className="mx-auto max-w-2xl px-1 pt-10 sm:px-0 sm:pt-12"><div className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-700"><FileText className="h-4 w-4" />Article</div><div className="blog-preview-content" dangerouslySetInnerHTML={{ __html: blog.content || "<p>No article content was provided.</p>" }} /></div>
    <footer className="mx-auto mt-12 max-w-2xl border-t border-slate-200 pt-6"><button type="button" onClick={() => navigate("/blogs")} className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-800"><ArrowLeft className="h-4 w-4" />Browse all posts</button></footer>
  </article>;
}
