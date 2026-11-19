import { BookOpen, Plus, RefreshCcw, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { MetricCard } from "../../components/MetricCard";
import { BlogForm } from "./components/BlogForm";
import { BlogTable } from "./components/BlogTable";
import { useBlogs } from "./hooks/useBlogs";
import type { BlogApiItem, BlogRow } from "./types";

const filters = [["all", "All Posts"], ["published", "Published"], ["draft", "Drafts"]] as const;

export default function BlogsPage() {
  const state = useBlogs();
  const [editingBlog, setEditingBlog] = useState<BlogApiItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreate = () => { setEditingBlog(null); setIsFormOpen(true); };
  const openEdit = async (row: BlogRow) => {
    try { setEditingBlog(await state.getBlog(row.id)); setIsFormOpen(true); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load blog post."); }
  };
  const remove = async (row: BlogRow) => {
    if (!window.confirm(`Delete “${row.title}”? This cannot be undone.`)) return;
    try { await state.remove(row.id); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete blog post."); }
  };

  return <div className="app-management-page space-y-6">
    <header className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-primary-700">Content workspace</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900"><BookOpen className="h-6 w-6 text-primary-600" /> Blog management</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Create, publish, revise, and organize the posts shown to your readers.</p></div><button type="button" onClick={openCreate} className="app-page-primary-action inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700"><Plus className="h-4 w-4" /> New post</button></header>
    <section className="app-metrics-grid grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="All Posts" value={state.metrics.total} isLoading={state.isLoading} className="border-blue-100" /><MetricCard title="Published" value={state.metrics.published} isLoading={state.isLoading} className="border-emerald-100" /><MetricCard title="Drafts" value={state.metrics.drafts} isLoading={state.isLoading} className="border-amber-100" /><MetricCard title="Total Views" value={state.metrics.views.toLocaleString()} isLoading={state.isLoading} className="border-violet-100" /></section>
    <section className="app-filter-panel rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{filters.map(([value, label]) => <button key={value} type="button" onClick={() => state.setStatus(value)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${state.status === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}</button>)}</div><div className="flex gap-2"><label className="relative min-w-0"><span className="sr-only">Search posts</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={state.search} onChange={(event) => state.setSearch(event.target.value)} className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Search posts" /></label><button type="button" onClick={() => void state.refresh()} disabled={state.isLoading} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${state.isLoading ? "animate-spin" : ""}`} />Refresh</button></div></div></section>
    <BlogTable rows={state.rows} isLoading={state.isLoading} onEdit={openEdit} onDelete={(row) => void remove(row)} />
    <BlogForm blog={editingBlog} open={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={state.save} />
  </div>;
}
