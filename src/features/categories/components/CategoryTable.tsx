import { useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import type { CategoryRow } from "../types";
import { getCategoryColumns } from "./columns";
import { MobileRecordDrawer } from "../../../components/MobileRecordDrawer";

export function CategoryTable({
  rows,
  isLoading,
  onEdit,
}: {
  rows: CategoryRow[];
  isLoading: boolean;
  onEdit: (category: CategoryRow) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(
    null,
  );
  const columns = useMemo(() => getCategoryColumns(onEdit), [onEdit]);
  if (!rows.length)
    if (!isLoading)
      return (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            title="No categories found"
            subtitle="Try another filter or create a category."
          />
        </div>
      );
  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading categories..."
        hideToolbarDateFilter
        hideViewColumn
        mobileCard
        mobileCardTitleColumn={2}
        mobileCardHideFirstColumn
        className="compact-mobile-table border-slate-200"
        onRowClick={setSelectedCategory}
      />
      <MobileRecordDrawer
        open={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        title="Category Details"
        subtitle={selectedCategory?.name}
        details={
          selectedCategory
            ? [
                { label: "Category ID", value: selectedCategory.id },
                { label: "Slug", value: selectedCategory.slug },
                { label: "Type", value: selectedCategory.typeLabel },
                {
                  label: "Source",
                  value: selectedCategory.isDefault ? "Default" : "Custom",
                },
                { label: "Status", value: selectedCategory.statusLabel },
                {
                  label: "Last Updated",
                  value: selectedCategory.updatedAtLabel,
                },
              ]
            : []
        }
      />
    </>
  );
}
