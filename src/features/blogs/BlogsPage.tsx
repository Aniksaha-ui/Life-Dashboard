import { BookOpen, Eye, Pencil, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState";
import { MetricCard } from "../../components/MetricCard";
import { deleteBlog, getBlogs } from "./api/queries";
import type { BlogApiItem } from "./types";

const isPublished = (blog: BlogApiItem) => blog.isPublished === true || blog.isPublished === 1 || blog.isPublished === "1";
const viewCount = (blog: BlogApiItem) => Number(blog.view_count || 0);

export default function BlogsPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setBlogs((await getBlogs()).rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const filteredBlogs = useMemo(() => blogs.filter((blog) => {
    const matchesSearch = `${blog.title} ${blog.author_name} ${blog.category} ${blog.short_description}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || (status === "published" ? isPublished(blog) : !isPublished(blog));
    return matchesSearch && matchesStatus;
  }), [blogs, search, status]);
  const metrics = useMemo(() => ({ total: blogs.length, published: blogs.filter(isPublished).length, drafts: blogs.filter((blog) => !isPublished(blog)).length, views: blogs.reduce((total, blog) => total + viewCount(blog), 0) }), [blogs]);

  const remove = async (blog: BlogApiItem) => {
    if (!window.confirm(`Delete “${blog.title}”? This cannot be undone.`)) return;
    try {
      await deleteBlog(blog.id);
      toast.success("Blog post deleted successfully.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete blog post.");
    }
  };
  const openCreate = () => navigate("/blogs/new");
  const openEdit = (blog: BlogApiItem) => navigate(`/blogs/${blog.id}/edit`);

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-primary-700">Content workspace</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900"><BookOpen className="h-6 w-6 text-primary-600" /> Blog management</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Create, publish, revise, and organize the posts shown to your readers.</p></div><button type="button" onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700"><Plus className="h-4 w-4" /> New post</button></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="All Posts" value={metrics.total} isLoading={isLoading} className="border-blue-100" /><MetricCard title="Published" value={metrics.published} isLoading={isLoading} className="border-emerald-100" /><MetricCard title="Drafts" value={metrics.drafts} isLoading={isLoading} className="border-amber-100" /><MetricCard title="Total Views" value={metrics.views.toLocaleString()} isLoading={isLoading} className="border-violet-100" /></section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{(["all", "published", "draft"] as const).map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${status === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{value === "all" ? "All posts" : value}</button>)}</div><div className="flex gap-2"><label className="relative min-w-0"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Search posts" /></label><button type="button" onClick={() => void refresh()} disabled={isLoading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /><span className="hidden sm:inline">Refresh</span></button></div></div>
      {isLoading ? <div className="p-10 text-center text-sm text-slate-500">Loading blog posts...</div> : !filteredBlogs.length ? <EmptyState title="No blog posts found" subtitle="Try another filter or create a new post." /> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left"><thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Post</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Author</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Views</th><th className="px-5 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-slate-100">{filteredBlogs.map((blog) => <tr key={blog.id} className="hover:bg-slate-50/70"><td className="max-w-md px-5 py-4"><p className="font-semibold text-slate-900">{blog.title}</p><p className="mt-1 line-clamp-1 text-sm text-slate-500">{blog.short_description}</p>{blog.published_date && <p className="mt-1 text-xs text-slate-400">{blog.published_date}</p>}</td><td className="px-5 py-4"><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">{blog.category || "react"}</span></td><td className="px-5 py-4 text-sm text-slate-600">{blog.author_name}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPublished(blog) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{isPublished(blog) ? "Published" : "Draft"}</span></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 text-sm text-slate-600"><Eye className="h-4 w-4 text-slate-400" />{viewCount(blog).toLocaleString()}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => openEdit(blog)} className="rounded-md p-2 text-primary-600 hover:bg-primary-50" aria-label={`Edit ${blog.title}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void remove(blog)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50" aria-label={`Delete ${blog.title}`}><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
