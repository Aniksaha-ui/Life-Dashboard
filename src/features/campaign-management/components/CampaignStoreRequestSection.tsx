import { useMemo } from "react";
import { clsx } from "clsx";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../components/DataTable";
import { SectorsCell } from "./SectorsCell";
import type { CampaignStoreRequestRow } from "../types";

const StackedField = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
      {label}
    </p>
    <div
      className={clsx(
        "text-xs text-slate-700 font-medium leading-snug break-words",
        valueClassName,
      )}
    >
      {value}
    </div>
  </div>
);

const CAMPAIGN_STORE_REQUEST_EMPTY_HEADERS = [
  "#",
  "Merchant Info",
  "Store Info",
  "Discount Details",
  "Remarks",
];

const getFirstSector = (sectorsStr?: string) => {
  if (!sectorsStr || sectorsStr === "N/A") return "N/A";
  return (
    sectorsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)[0] || "N/A"
  );
};

const CampaignStoreRequestColumns = (
  singleSectorOnly = false,
): ColumnDef<CampaignStoreRequestRow>[] => [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => (
      <span className="text-xs text-slate-500 font-medium">
        {row.index + 1}
      </span>
    ),
    meta: {
      shrinkToContent: true,
      headerClassName: "w-px max-w-min !px-3 text-center whitespace-nowrap",
      cellClassName:
        "w-px max-w-min !px-3 py-3 align-top text-center whitespace-nowrap",
    },
  },
  {
    id: "merchantInfo",
    header: "Merchant Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-2 py-0.5">
        <StackedField
          label="Merchant Name"
          value={row.original.merchant}
          valueClassName="text-slate-900 font-semibold"
        />
        <StackedField label="Brand Name" value={row.original.brand} />
        <StackedField label="Kam Name" value={row.original.kam} />
        <StackedField
          label="Sector"
          value={
            singleSectorOnly ? (
              <span className="text-xs font-medium text-slate-700">
                {getFirstSector(row.original.sectors)}
              </span>
            ) : (
              <SectorsCell sectorsStr={row.original.sectors} />
            )
          }
        />
      </div>
    ),
    meta: { cellClassName: "px-3 py-3 align-top min-w-[180px]" },
  },
  {
    id: "storeInfo",
    header: "Store Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-2 py-0.5">
        <StackedField
          label="Store Id"
          value={row.original.storeId}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField label="Category" value={row.original.category} />
        <StackedField
          label="URL"
          value={
            row.original.url && row.original.url !== "—" ? (
              <a
                href={
                  row.original.url.startsWith("http")
                    ? row.original.url
                    : `https://${row.original.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 break-all hover:underline"
              >
                {row.original.url}
              </a>
            ) : (
              <span className="text-slate-500">—</span>
            )
          }
        />
      </div>
    ),
    meta: { cellClassName: "px-3 py-3 align-top min-w-[150px]" },
  },
  {
    id: "discountInfo",
    header: "Discount Details",
    cell: ({ row }) => (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-0.5">
        <StackedField
          label="Discount %"
          value={row.original.disc}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField
          label="Consumed by you"
          value={row.original.consumed}
          valueClassName="italic uppercase"
        />
        <StackedField
          label="Shared with Partners"
          value={row.original.shared}
        />
        <StackedField
          label="Min order value"
          value={row.original.min.toLocaleString()}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField
          label="Max discount/Trx"
          value={row.original.max.toLocaleString()}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField
          label="Max Amt of Disc (Same Card)"
          value={row.original.maxAmt.toLocaleString()}
          valueClassName="text-slate-800 font-bold"
        />
        {row.original.recurrentLimit != null && (
          <StackedField
            label="Recurrent limit/user"
            value={row.original.recurrentLimit.toLocaleString()}
            valueClassName="text-slate-800 font-bold"
          />
        )}
      </div>
    ),
    meta: { cellClassName: "px-3 py-3 align-top min-w-[220px]" },
  },
  {
    id: "remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <span
        className="text-xs text-slate-600 font-medium leading-snug break-words"
        title={row.original.remarks}
      >
        {row.original.remarks || "—"}
      </span>
    ),
    meta: {
      cellClassName: "px-3 py-3 align-top min-w-[120px] max-w-[180px]",
    },
  },
];

export function CampaignStoreRequestSection({
  rows,
  emptyMessage,
  headerActions,
  title = "Campaign Store Request List",
  singleSectorOnly = false,
  hideTitle = false,
}: {
  rows: CampaignStoreRequestRow[];
  emptyMessage?: string;
  headerActions?: React.ReactNode;
  title?: string;
  singleSectorOnly?: boolean;
  hideTitle?: boolean;
}) {
  const columns = useMemo(
    () => CampaignStoreRequestColumns(singleSectorOnly),
    [singleSectorOnly],
  );

  return (
    <div className="flex flex-col space-y-4">
      {!hideTitle && (
        <div className="flex items-center justify-between px-1 gap-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            {title}
          </h3>
          {headerActions}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {CAMPAIGN_STORE_REQUEST_EMPTY_HEADERS.map((header, index) => (
                    <th
                      key={header}
                      className={clsx(
                        "h-10 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight",
                        index === 0
                          ? "w-px max-w-min !px-3 text-center whitespace-nowrap"
                          : "px-3",
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={CAMPAIGN_STORE_REQUEST_EMPTY_HEADERS.length}
                    className="px-3 py-8 text-center text-xs text-slate-400 font-medium italic"
                  >
                    {emptyMessage || "No results."}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-slate-500" />
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page 1 of 1</span>
              <button
                type="button"
                className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          hideToolbarDateFilter={true}
          hideViewColumn={true}
          allowHeaderWrap={true}
          noScrollX={true}
        />
      )}
    </div>
  );
}
