import { CalendarDays, Eye, FileText, Pencil, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../components/EmptyState";
import type { BlogRow } from "../types";
import { resolveBlogImageUrl } from "../utils/imageUrl";

interface Pagination { currentPage: number; lastPage: number; total: number; from: number; to: number; }

export function BlogCardGrid({ rows, isLoading, pagination, onPageChange, onEdit, onDelete }: { rows: BlogRow[]; isLoading: boolean; pagination: Pagination; onPageChange: (page: number) => void; onEdit: (row: BlogRow) => void; onDelete: (row: BlogRow) => void; }) {
  if (isLoading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-[310px] animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>;
  if (!rows.length) return <div className="rounded-xl border border-slate-200 bg-white"><EmptyState title="No blog posts found" subtitle="Try another filter or create a new post." /></div>;

  return <section className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => <article key={row.id} className="group flex min-h-[310px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary-100 via-slate-100 to-violet-100">
          {row.blog.image ? <img src={resolveBlogImageUrl(row.blog.image)} alt={`${row.title} cover`} className="h-full w-full bg-white object-contain p-2 transition duration-300 group-hover:scale-[1.02]" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <FileText className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-primary-300" />}
          <div className="absolute left-4 top-4 flex gap-2"><span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-primary-700 shadow-sm">{row.category}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${row.isPublished ? "bg-emerald-500 text-white" : "bg-amber-400 text-amber-950"}`}>{row.isPublished ? "Published" : "Draft"}</span></div>
        </div>
        <div className="flex flex-1 flex-col p-5"><h2 className="line-clamp-2 text-lg font-bold leading-6 text-slate-900">{row.title}</h2><div className="mt-4 space-y-1.5 text-xs text-slate-500"><p className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" />{row.author}</p><div className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{row.publishedDateLabel}</span><span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{row.viewCount.toLocaleString()} views</span></div></div><div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><Link to={`/blogs/${row.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-700 hover:text-primary-800"><FileText className="h-4 w-4" /> Preview</Link><div className="flex gap-1"><button type="button" onClick={() => onEdit(row)} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" aria-label={`Edit ${row.title}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(row)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label={`Delete ${row.title}`}><Trash2 className="h-4 w-4" /></button></div></div></div>
      </article>)}
    </div>
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Showing {pagination.from}–{pagination.to} of {pagination.total} posts</p><div className="flex items-center gap-2"><button type="button" disabled={pagination.currentPage <= 1} onClick={() => onPageChange(pagination.currentPage - 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Previous</button><span className="text-sm font-medium text-slate-600">Page {pagination.currentPage} of {pagination.lastPage}</span><button type="button" disabled={pagination.currentPage >= pagination.lastPage} onClick={() => onPageChange(pagination.currentPage + 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Next</button></div></div>
  </section>;
}
