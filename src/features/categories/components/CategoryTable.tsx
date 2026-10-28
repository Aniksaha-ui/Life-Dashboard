import { useMemo } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import { Skeleton } from "../../../components/Skeleton";
import type { CategoryRow } from "../types";
import { getCategoryColumns } from "./columns";

export function CategoryTable({ rows, isLoading, onEdit }: { rows: CategoryRow[]; isLoading: boolean; onEdit: (category: CategoryRow) => void }) {
  const columns = useMemo(() => getCategoryColumns(onEdit), [onEdit]);
  if (isLoading) return <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;
  if (!rows.length) return <div className="rounded-xl border border-slate-200 bg-white"><EmptyState title="No categories found" subtitle="Try another filter or create a category." /></div>;
  return <DataTable data={rows} columns={columns} hideToolbarDateFilter hideViewColumn mobileCard mobileCardTitleColumn={2} mobileCardHideFirstColumn />;
}
