import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Settings,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

// ----------------------------------------------------------------------
// DataTable Component
// ----------------------------------------------------------------------

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  filterColumnName?: string; // For simple search string
  filterActions?: React.ReactNode;
  hideToolbarDateFilter?: boolean;
  toolbarEndContent?: React.ReactNode;
  viewButtonLabel?: string;
  filterExtension?: React.ReactNode;
  hideViewColumn?: boolean;
  hidePagination?: boolean;
  noScrollX?: boolean;
  allowHeaderWrap?: boolean;
  /** Renders each row as a labelled card below the phone breakpoint. */
  mobileCard?: boolean;
  /** One-based visible cell position to present as the full-width card heading. */
  mobileCardTitleColumn?: number;
  /** Hides the first visible cell on mobile (useful for row-number columns). */
  mobileCardHideFirstColumn?: boolean;
  className?: string;
  rowBorderColor?: string;
  externalPagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    from?: number;
    to?: number;
  };
  onPageChange?: (nextPage: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  filterColumnName,
  filterActions,
  hideToolbarDateFilter = false,
  toolbarEndContent,
  viewButtonLabel = "View Column",
  filterExtension,
  hideViewColumn = false,
  hidePagination = false,
  noScrollX = false,
  allowHeaderWrap = false,
  mobileCard = true,
  mobileCardTitleColumn,
  mobileCardHideFirstColumn = false,
  className,
  rowBorderColor = "divide-slate-100",
  externalPagination,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const hasExternalPagination = Boolean(externalPagination && onPageChange);

  // Date filter state (visual only for now)
  const [selectedPeriod, setSelectedPeriod] = React.useState("30d");
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const datePickerRef = React.useRef<HTMLDivElement>(null);
  const [customDateRange, setCustomDateRange] = React.useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const table = useReactTable({
    data,
    columns,
    manualPagination: hasExternalPagination,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(hasExternalPagination || hidePagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const currentPage = hasExternalPagination
    ? externalPagination?.currentPage || 1
    : table.getState().pagination.pageIndex + 1;
  const totalPages = hasExternalPagination
    ? externalPagination?.totalPages || 1
    : table.getPageCount();
  const canGoPrevious = hasExternalPagination
    ? currentPage > 1
    : table.getCanPreviousPage();
  const canGoNext = hasExternalPagination
    ? currentPage < totalPages
    : table.getCanNextPage();

  const showToolbar =
    Boolean(filterColumnName) ||
    Boolean(filterActions) ||
    Boolean(toolbarEndContent) ||
    !hideToolbarDateFilter ||
    !hideViewColumn;

  const getColumnLabel = (
    column: (typeof table)["getAllColumns"] extends () => (infer T)[]
      ? T
      : never,
  ) => {
    const header = (column as any).columnDef.header;
    if (typeof header === "string") return header;
    return (column as any).id
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .trim();
  };

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="data-table-toolbar flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Filter Pills Placeholder */}
            {filterColumnName && (
              <div className="relative">
                <input
                  placeholder="Search"
                  value={
                    (table
                      .getColumn(filterColumnName)
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(filterColumnName)
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-8 w-[150px] lg:w-[250px] rounded border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
            {/* Add more filter pills here in future */}
            {filterActions}
          </div>

          <div className="flex items-center gap-2">
            {toolbarEndContent}
            {!hideToolbarDateFilter && (
              <>
                {/* Period Selector */}
                <div className="relative group">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 min-w-[120px] cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="today">Today</option>
                    <option value="last_day">Last Day</option>
                    <option value="7d">Past 7 Days</option>
                    <option value="30d">Past 30 Days</option>
                    {selectedPeriod === "custom" && (
                      <option value="custom">Custom Range</option>
                    )}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Date Picker Button */}
                <div className="relative" ref={datePickerRef}>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 border rounded text-sm font-medium transition-all",
                      showDatePicker || selectedPeriod === "custom"
                        ? "bg-primary-50 border-primary-200 text-primary-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>
                      {selectedPeriod === "custom"
                        ? `${customDateRange.from} - ${customDateRange.to}`
                        : "Filter by date"}
                    </span>
                  </button>

                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <h4 className="text-xs font-bold text-slate-900 mb-3">
                        Custom Range
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                            From
                          </label>
                          <input
                            type="date"
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            value={customDateRange.from}
                            onChange={(e) =>
                              setCustomDateRange((prev) => ({
                                ...prev,
                                from: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                            To
                          </label>
                          <input
                            type="date"
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                            value={customDateRange.to}
                            onChange={(e) =>
                              setCustomDateRange((prev) => ({
                                ...prev,
                                to: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPeriod("custom");
                              setShowDatePicker(false);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 shadow-sm shadow-primary-200"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!hideViewColumn && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
                  <Settings className="w-4 h-4" />
                  {viewButtonLabel}
                </button>
                {/* Simple dropdown for columns */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg z-10 hidden group-hover:block p-1">
                  <div className="text-xs font-semibold text-slate-500 px-2 py-1">
                    Toggle Columns
                  </div>
                  {table
                    .getAllColumns()
                    .filter((column) => {
                      if (
                        typeof column.accessorFn === "undefined" ||
                        !column.getCanHide()
                      ) {
                        return false;
                      }
                      const id = column.id.toLowerCase();
                      if (id === "action" || id === "actions") {
                        return false;
                      }
                      const header = column.columnDef.header;
                      if (
                        typeof header === "string" &&
                        header.trim().toLowerCase() === "action"
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((column) => {
                      const header = column.columnDef.header;
                      const label =
                        typeof header === "string"
                          ? header
                          : column.id
                              .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                              .replace(/[_-]+/g, " ")
                              .trim();
                      return (
                        <label
                          key={column.id}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 cursor-pointer rounded text-sm"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            checked={column.getIsVisible()}
                            onChange={(e) =>
                              column.toggleVisibility(!!e.target.checked)
                            }
                          />
                          <span className="capitalize">{label}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {filterExtension}
      <div
        className={clsx(
          "rounded-md border bg-white shadow-sm overflow-hidden",
          !noScrollX && "overflow-x-auto",
          mobileCard && "mobile-card-table",
          mobileCardTitleColumn && "mobile-card-has-title",
          mobileCardHideFirstColumn && "mobile-card-hide-first-column",
          className || "border-slate-200",
        )}
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className={clsx(
                        "h-10 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                        (header.column.columnDef.meta as any)?.headerClassName,
                        !allowHeaderWrap && "whitespace-nowrap",
                        allowHeaderWrap &&
                          !(header.column.columnDef.meta as any)
                            ?.shrinkToContent &&
                          "py-2 leading-tight min-w-[80px]",
                        allowHeaderWrap &&
                          (header.column.columnDef.meta as any)
                            ?.shrinkToContent &&
                          "py-2 leading-tight",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={clsx("divide-y", rowBorderColor)}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={clsx(
                    "hover:bg-slate-50 transition-colors",
                    onRowClick ? "cursor-pointer" : "cursor-default",
                    row.getIsSelected() && "bg-primary-50",
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      data-label={getColumnLabel(cell.column)}
                      className={clsx(
                        "text-slate-700",
                        (cell.column.columnDef.meta as any)?.cellClassName ||
                          (cell.column.columnDef.meta as any)?.className ||
                          "px-3 py-2 align-middle",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!hidePagination && (
        <div className="data-table-pagination flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <div className="min-w-0 text-sm text-slate-500">
            {(() => {
              if (hasExternalPagination) {
                const from = externalPagination?.from ?? 0;
                const to = externalPagination?.to ?? 0;
                const total = externalPagination?.total ?? 0;
                if (total === 0) return "";
                return `Showing ${from} to ${to} of ${total} entries`;
              }
              const total = table.getFilteredRowModel().rows.length;
              if (total === 0) return "";
              const from =
                table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1;
              const to = Math.min(
                from + table.getPaginationRowModel().rows.length - 1,
                total,
              );
              return `Showing ${from} to ${to} of ${total} entries`;
            })()}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                if (hasExternalPagination && onPageChange) {
                  onPageChange(currentPage - 1);
                  return;
                }
                table.previousPage();
              }}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                if (hasExternalPagination && onPageChange) {
                  onPageChange(currentPage + 1);
                  return;
                }
                table.nextPage();
              }}
              disabled={!canGoNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
