import { useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import type { BlogRow } from "../types";
import { BlogDescriptionDrawer } from "./BlogDescriptionDrawer";
import { getBlogColumns } from "./columns";

export function BlogTable({ rows, isLoading, onEdit, onDelete }: { rows: BlogRow[]; isLoading: boolean; onEdit: (row: BlogRow) => void; onDelete: (row: BlogRow) => void }) {
  const [selected, setSelected] = useState<BlogRow | null>(null);
  const columns = useMemo(() => getBlogColumns(setSelected, onEdit, onDelete), [onEdit, onDelete]);
  if (!rows.length && !isLoading) return <div className="rounded-xl border border-slate-200 bg-white"><EmptyState title="No blog posts found" subtitle="Try another filter or create a new post." /></div>;
  return <><DataTable data={rows} columns={columns} isLoading={isLoading} loadingText="Loading blog posts..." hideToolbarDateFilter hideViewColumn mobileCard mobileCardTitleColumn={2} mobileCardHideFirstColumn className="compact-mobile-table border-slate-200" onRowClick={setSelected} /><BlogDescriptionDrawer blog={selected?.blog ?? null} onClose={() => setSelected(null)} /></>;
}
