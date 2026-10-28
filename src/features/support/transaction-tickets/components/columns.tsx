import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { TransactionTicketApiItem } from "../types";

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "requested":
      return "bg-amber-50 text-amber-600";
    case "solved":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const getColumns = (
  onViewSupportDetails: (id: string) => void,
  onViewTransactionDetails: (id: number) => void,
): ColumnDef<TransactionTicketApiItem>[] => [
  {
    accessorKey: "requested_on",
    header: "REQUESTED ON",
    cell: ({ row }) => (
      <div className="text-xs font-normal text-slate-900">
        {new Date(row.original.requested_on).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "ticket_no",
    header: "TICKET NO",
    cell: ({ row }) => (
      <div className="text-xs text-slate-500 font-mono">
        {row.original.ticket_no}
      </div>
    ),
  },
  {
    accessorKey: "merchant_name",
    header: "MERCHANT",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <div className="text-xs font-normal text-slate-900">
          {row.original.merchant_name}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          {row.original.store_id || "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "store_name",
    header: "STORE",
    cell: ({ row }) => (
      <div className="min-w-[150px]">
        <div className="text-xs text-slate-900">{row.original.store_name}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          {row.original.store_id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "transaction_id",
    header: "TRANSACTION ID",
    cell: ({ row }) => (
      <div className="text-xs text-slate-900 font-mono">
        {row.original.transaction_id}
      </div>
    ),
  },
  {
    accessorKey: "query_for",
    header: "QUERY FOR",
    cell: ({ row }) => {
      const rawData = row.original as any;
      let displayQueries: string[] = [];

      try {
        if (rawData.ticketing_query_raw) {
          const raw =
            typeof rawData.ticketing_query_raw === "string"
              ? JSON.parse(rawData.ticketing_query_raw)
              : rawData.ticketing_query_raw;

          // Prioritize values from ticketing_query_raw if it's an object/map
          if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            displayQueries = Object.values(raw);
          }
        }
      } catch (e) {
        // Fallback
      }

      // Fallback to query_for keys if displayQueries is still empty
      if (displayQueries.length === 0) {
        let queryFor =
          rawData.query_for || rawData.ticketing_query || rawData.query || [];
        if (typeof queryFor === "string") {
          try {
            queryFor = JSON.parse(queryFor);
          } catch {
            queryFor = queryFor
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
        displayQueries = Array.isArray(queryFor) ? queryFor : [];
      }

      return (
        <div className="flex flex-col gap-1 items-start">
          {displayQueries.map((q: string, idx: number) => (
            <div
              key={`${q}-${idx}`}
              className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0 rounded border border-slate-100 w-fit"
            >
              {q}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => (
      <span
        className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
          getStatusBadgeClass(row.original.status),
        )}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: "view",
    header: "VIEW",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewSupportDetails(String(row.original.id));
          }}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Support Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewTransactionDetails(row.original.tid);
          }}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Transaction Details
        </button>
      </div>
    ),
  },
];
