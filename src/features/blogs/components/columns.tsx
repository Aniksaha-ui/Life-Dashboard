import type { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import type { BlogRow } from "../types";

export const getBlogColumns = (onView: (row: BlogRow) => void, onEdit: (row: BlogRow) => void, onDelete: (row: BlogRow) => void): ColumnDef<BlogRow>[] => [
  { accessorKey: "serial", header: "SL", cell: ({ row }) => row.original.serial },
  { accessorKey: "title", header: "Post", cell: ({ row }) => <button type="button" onClick={() => onView(row.original)} className="text-left"><p className="font-semibold text-slate-900 hover:text-primary-700">{row.original.title}</p><p className="mt-1 text-xs text-slate-500">{row.original.publishedDateLabel}</p></button> },
  { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="inline-flex rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">{row.original.category}</span> },
  { accessorKey: "author", header: "Author", cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.author}</span> },
  { id: "status", header: "Status", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.original.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.original.isPublished ? "Published" : "Draft"}</span> },
  { accessorKey: "viewCount", header: "Views", cell: ({ row }) => <span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><Eye className="h-4 w-4 text-slate-400" />{row.original.viewCount.toLocaleString()}</span> },
  { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><button type="button" onClick={() => onView(row.original)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label={`View ${row.original.title}`}><FileText className="h-4 w-4" /></button><button type="button" onClick={() => onEdit(row.original)} className="rounded-md p-2 text-primary-600 hover:bg-primary-50" aria-label={`Edit ${row.original.title}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(row.original)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50" aria-label={`Delete ${row.original.title}`}><Trash2 className="h-4 w-4" /></button></div> },
];
