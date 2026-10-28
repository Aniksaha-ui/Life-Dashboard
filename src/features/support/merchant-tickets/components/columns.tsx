import type { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { Eye, FileText } from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import type { MerchantTicket } from "../types";

const cellTextClass = "text-xs font-medium text-slate-600";

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-slate-100 text-slate-500";
    case "Processing":
      return "bg-amber-50 text-amber-600";
    case "Completed":
      return "bg-emerald-50 text-emerald-600";
    case "Declined":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const getColumns = (
  onViewDetails: (id: string) => void,
  onPreviewImage: (url: string) => void,
): ColumnDef<MerchantTicket>[] => [
  {
    accessorKey: "createdAt",
    header: "Created On",
    cell: ({ row }) => (
      <div className={cellTextClass}>
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "resolvedAt",
    header: "Resolved On",
    cell: ({ row }) => (
      <div className={cellTextClass}>
        {row.original.resolvedAt
          ? new Date(row.original.resolvedAt).toLocaleDateString()
          : "—"}
      </div>
    ),
  },
  {
    accessorKey: "ticketNo",
    header: "Ticket No",
    cell: ({ row }) => (
      <div className={cellTextClass}>{row.original.ticketNo}</div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div
        className={clsx(cellTextClass, "truncate max-w-[200px]")}
        title={row.original.title}
      >
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "issueType",
    header: "Issue Type",
    cell: ({ row }) => (
      <div className={cellTextClass}>{row.original.issueType}</div>
    ),
  },
  {
    accessorKey: "merchantName",
    header: "Merchant",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className={cellTextClass}>{row.original.merchantName}</div>
        <div className="flex items-center gap-1 group">
          <div className={cellTextClass}>{row.original.merchant_msslid}</div>
          <CopyButton
            value={row.original.merchant_msslid}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "hasAttachment",
    header: "Attachment",
    cell: ({ row }) => {
      const isPdf = row.original.attachmentUrl?.toLowerCase().endsWith(".pdf");
      return (
        <div className="flex items-center">
          {row.original.hasAttachment && row.original.attachmentUrl ? (
            <div
              className="relative h-10 w-10 shrink-0 cursor-pointer group flex items-center justify-center bg-slate-50 rounded border border-slate-200 overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                onPreviewImage(row.original.attachmentUrl!);
              }}
            >
              {isPdf ? (
                <div className="flex flex-col items-center justify-center h-full w-full bg-slate-100">
                  <FileText className="w-6 h-6 text-slate-500" />
                </div>
              ) : (
                <img
                  src={row.original.attachmentUrl}
                  alt="Attachment"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <span className={cellTextClass}>No Attachment</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
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
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(row.original.id);
        }}
        className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
      >
        View
      </button>
    ),
  },
];
