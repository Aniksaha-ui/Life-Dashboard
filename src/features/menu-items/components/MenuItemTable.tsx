import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import { MobileRecordDrawer } from "../../../components/MobileRecordDrawer";
import type { MenuItemRow } from "../types";
import { getMenuItemColumns } from "./columns";

interface MenuItemTableProps {
  rows: MenuItemRow[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onEdit: (item: MenuItemRow) => void;
  onDelete: (item: MenuItemRow) => void;
}

export function MenuItemTable({
  rows,
  isLoading,
  hasActiveFilters,
  onResetFilters,
  onEdit,
  onDelete,
}: MenuItemTableProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItemRow | null>(null);
  const columns = useMemo(
    () => getMenuItemColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  if (!rows.length && !isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white pb-6 text-center">
        <EmptyState
          title="No menu items found"
          subtitle={
            hasActiveFilters
              ? "No menu items match the current search or location filter."
              : "Create your first menu item to configure navigation."
          }
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        loadingText="Loading menu items..."
        hideToolbarDateFilter
        hideViewColumn
        mobileCard
        mobileCardTitleColumn={2}
        mobileCardHideFirstColumn
        className="compact-mobile-table border-slate-200"
        onRowClick={setSelectedItem}
      />
      <MobileRecordDrawer
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Menu Item Details"
        subtitle={selectedItem?.title}
        details={
          selectedItem
            ? [
                { label: "Menu ID", value: selectedItem.id },
                { label: "Path", value: selectedItem.path },
                { label: "Icon", value: selectedItem.icon },
                { label: "Location", value: selectedItem.location },
                { label: "Parent", value: selectedItem.parentLabel },
                { label: "Order", value: selectedItem.order },
                {
                  label: "User",
                  value: selectedItem.userName,
                },
                {
                  label: "Roles",
                  value: selectedItem.roles.join(", ") || "-",
                },
                { label: "Last Updated", value: selectedItem.updatedAtLabel },
              ]
            : []
        }
        footer={
          selectedItem ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const target = selectedItem;
                  setSelectedItem(null);
                  onEdit(target);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 sm:flex-none"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedItem;
                  setSelectedItem(null);
                  onDelete(target);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 sm:flex-none"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          ) : undefined
        }
      />
    </>
  );
}
