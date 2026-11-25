import { Pencil, Tags } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import { MobileRecordDrawer } from "../../../components/MobileRecordDrawer";
import type { CategoryRow } from "../types";
import { getCategoryColumns } from "./columns";

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

  if (!rows.length && !isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          title="No categories found"
          subtitle="Try another filter or create a category."
        />
      </div>
    );
  }

  const isIncome = selectedCategory?.type === "INCOME";

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
        title={selectedCategory?.name || "Category Details"}
        badge={selectedCategory?.typeLabel}
        badgeClassName={
          isIncome
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-amber-50 text-amber-700 ring-amber-200"
        }
        recordId={selectedCategory ? `CAT #${selectedCategory.id}` : undefined}
        headerAction={
          selectedCategory ? (
            <button
              type="button"
              onClick={() => {
                const target = selectedCategory;
                setSelectedCategory(null);
                onEdit(target);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          ) : undefined
        }
        hero={
          selectedCategory
            ? {
                icon: Tags,
                iconClassName: isIncome
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600",
                overline: `${selectedCategory.typeLabel} category`,
                value: selectedCategory.name,
                meta: `Slug: ${selectedCategory.slug}`,
                stats: [
                  {
                    label: "Source",
                    value: selectedCategory.isDefault ? "Default" : "Custom",
                  },
                  {
                    label: "Status",
                    value: selectedCategory.statusLabel,
                    valueClassName:
                      selectedCategory.statusLabel === "Active"
                        ? "text-emerald-700"
                        : "text-slate-600",
                  },
                ],
              }
            : undefined
        }
        details={
          selectedCategory
            ? [
                {
                  label: "Category ID",
                  value: `CAT #${selectedCategory.id}`,
                },
                { label: "Type", value: selectedCategory.typeLabel },
                {
                  label: "Slug",
                  value: (
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {selectedCategory.slug}
                    </code>
                  ),
                },
                {
                  label: "Source",
                  value: selectedCategory.isDefault ? "Default" : "Custom",
                },
                { label: "Status", value: selectedCategory.statusLabel },
              ]
            : []
        }
        sections={
          selectedCategory
            ? [
                {
                  title: "Record Information",
                  items: [
                    {
                      label: "Last updated",
                      value: selectedCategory.updatedAtLabel,
                      fullWidth: true,
                    },
                  ],
                },
              ]
            : []
        }
      />
    </>
  );
}
