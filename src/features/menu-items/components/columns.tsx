import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { MENU_ICON_MAP } from "../constants/menuOptions";
import type { MenuItemRow } from "../types";

interface ColumnActions {
  onEdit: (item: MenuItemRow) => void;
  onDelete: (item: MenuItemRow) => void;
}

export const getMenuItemColumns = ({
  onEdit,
  onDelete,
}: ColumnActions): ColumnDef<MenuItemRow>[] => [
  { accessorKey: "serial", header: "SL" },
  {
    accessorKey: "title",
    header: "Menu Item",
    cell: ({ row }) => {
      const Icon = MENU_ICON_MAP[row.original.icon];
      return (
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {row.original.title}
            </p>
            <p className="text-xs text-slate-500">Menu ID: {row.original.id}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "path",
    header: "Path",
    cell: ({ row }) => (
      <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
        {row.original.path}
      </code>
    ),
  },
  { accessorKey: "icon", header: "Icon" },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {row.original.location}
      </span>
    ),
  },
  { accessorKey: "parentLabel", header: "Parent" },
  { accessorKey: "userName", header: "User" },
  { accessorKey: "order", header: "Order" },
  {
    id: "roles",
    header: "Roles",
    cell: ({ row }) =>
      row.original.roles.length ? (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <span
              key={role}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
            >
              {role}
            </span>
          ))}
        </div>
      ) : (
        "-"
      ),
  },
  { accessorKey: "updatedAtLabel", header: "Updated" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
          className="rounded-md p-2 text-primary-600 transition-colors hover:bg-primary-50"
          aria-label={`Edit ${row.original.title}`}
          title="Edit menu item"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
          className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50"
          aria-label={`Delete ${row.original.title}`}
          title="Delete menu item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
