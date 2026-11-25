import { ListTree, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { EmptyState } from "../../../components/EmptyState";
import { MobileRecordDrawer } from "../../../components/MobileRecordDrawer";
import { MENU_ICON_MAP } from "../constants/menuOptions";
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

  const HeroIcon =
    (selectedItem && MENU_ICON_MAP[selectedItem.icon]) || ListTree;

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
        title={selectedItem?.title || "Menu Item Details"}
        badge={selectedItem?.location}
        badgeClassName="bg-blue-50 text-blue-700 ring-blue-200"
        recordId={selectedItem ? `MENU #${selectedItem.id}` : undefined}
        headerAction={
          selectedItem ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedItem;
                  setSelectedItem(null);
                  onEdit(target);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : undefined
        }
        hero={
          selectedItem
            ? {
                icon: HeroIcon,
                iconClassName: "bg-primary-50 text-primary-600",
                overline: `${selectedItem.location} route`,
                value: selectedItem.title,
                meta: `${selectedItem.path} · Order #${selectedItem.order}`,
                stats: [
                  { label: "Assigned user", value: selectedItem.userName },
                  {
                    label: "Assigned roles",
                    value: selectedItem.roles.length
                      ? selectedItem.roles.join(", ")
                      : "None",
                    valueClassName: "text-primary-700",
                  },
                ],
              }
            : undefined
        }
        details={
          selectedItem
            ? [
                { label: "Menu ID", value: `MENU #${selectedItem.id}` },
                { label: "Section", value: selectedItem.location },
                {
                  label: "Path",
                  value: (
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {selectedItem.path}
                    </code>
                  ),
                },
                { label: "Icon", value: selectedItem.icon },
                { label: "Parent", value: selectedItem.parentLabel },
                { label: "Order", value: selectedItem.order },
                { label: "User", value: selectedItem.userName },
                {
                  label: "Roles",
                  value: selectedItem.roles.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "No roles assigned"
                  ),
                },
              ]
            : []
        }
        sections={
          selectedItem
            ? [
                {
                  title: "Record Information",
                  items: [
                    {
                      label: "Last updated",
                      value: selectedItem.updatedAtLabel,
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
