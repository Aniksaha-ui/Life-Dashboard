import clsx from "clsx";
import { Copy, CheckCircle, Info, FileText } from "lucide-react";
import React, { useState } from "react";
import { Drawer } from "../../../../components/Drawer";
import { useMerchantTicketDetail } from "../api/queries";
import type { MerchantTicketDrawerProps } from "../types";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "Processing":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Declined":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export function MerchantTicketDrawer({
  ticketId,
  onClose,
  onPreviewImage,
}: MerchantTicketDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data: ticket, isLoading } = useMerchantTicketDetail(ticketId);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const DetailRow = ({
    label,
    value,
    copyable = false,
  }: {
    label: string;
    value: React.ReactNode;
    copyable?: boolean;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100 last:border-0 border-0">
      <dt className="w-full sm:w-1/3 text-sm font-medium text-slate-500 pt-0.5">
        {label}
      </dt>
      <dd className="w-full sm:w-2/3 text-sm text-slate-900 flex items-center gap-2">
        <span className="break-words w-full">{value || "—"}</span>
        {copyable && value && (
          <button
            onClick={() => handleCopy(String(value), label)}
            className={clsx(
              "p-0.5 rounded transition-all flex items-center gap-1.5 shrink-0",
              copiedId === label
                ? "text-slate-900 bg-slate-100 pr-1.5"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
            title="Copy"
          >
            {copiedId === label ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Copied!</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </dd>
    </div>
  );

  if (!ticketId) return null;

  return (
    <Drawer
      open={!!ticketId}
      onClose={onClose}
      title="Ticket Information"
      subtitle={ticket?.ticketNo}
      width="lg"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium animate-pulse">
            Loading ticket information...
          </p>
        </div>
      ) : ticket ? (
        <div className="space-y-6 pb-20">
          {/* Section 1: Core Info */}
          <div className="bg-white rounded-lg border border-slate-200 px-4">
            <DetailRow label="Ticket No" value={ticket.ticketNo} copyable />
            <DetailRow label="Title" value={ticket.title} />
            <DetailRow label="Merchant" value={ticket.merchantName} />
            <DetailRow label="Issue Type" value={ticket.issueType} />
            <DetailRow
              label="Status"
              value={
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
                    getStatusColor(ticket.status),
                  )}
                >
                  {ticket.status}
                </span>
              }
            />
          </div>

          {/* Section 2: Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Details
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow
                label="Description"
                value={
                  <p className="whitespace-pre-wrap text-slate-700">
                    {ticket.description || "—"}
                  </p>
                }
              />
              <DetailRow label="Remarks" value={ticket.remarks} />
              <DetailRow
                label="Attachment"
                value={
                  ticket.hasAttachment && ticket.attachmentUrl ? (
                    <div
                      className="flex items-center gap-3 p-2 bg-slate-50 rounded-md border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors w-fit"
                      onClick={() => onPreviewImage(ticket.attachmentUrl!)}
                    >
                      <div className="h-12 w-12 shrink-0 flex items-center justify-center bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
                        {ticket.attachmentUrl.toLowerCase().endsWith(".pdf") ? (
                          <FileText className="w-8 h-8 text-slate-500" />
                        ) : (
                          <img
                            src={ticket.attachmentUrl}
                            alt="Thumbnail"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-primary-600">
                          View Attachment
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No Attachment</span>
                  )
                }
              />
            </div>
          </div>

          {/* Section 3: Meta */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Metadata
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow label="Created By" value={ticket.createdBy} />
              <DetailRow
                label="Created On"
                value={new Date(ticket.createdAt).toLocaleString()}
              />
              <DetailRow label="Resolved By" value={ticket.resolvedBy} />
              <DetailRow
                label="Resolved On"
                value={
                  ticket.resolvedAt
                    ? new Date(ticket.resolvedAt).toLocaleString()
                    : "—"
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Info className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm font-medium">
            Failed to load ticket information.
          </p>
        </div>
      )}
    </Drawer>
  );
}
