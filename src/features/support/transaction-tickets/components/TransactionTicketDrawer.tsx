import clsx from "clsx";
import { CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import { Drawer } from "../../../../components/Drawer";
import { useMerchantTicketDetail } from "../api/queries";
import type { TransactionTicketDrawerProps } from "../types";
import { Loader } from "../../../../components/Loader";

const getStatusColor = (status: string | null | undefined) => {
  if (!status) return "bg-slate-100 text-slate-600";
  switch (status.toLowerCase()) {
    case "pending":
    case "requested":
      return "bg-amber-100 text-amber-700";
    case "solved":
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "declined":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export function TransactionTicketDrawer({
  ticketId,
  onClose,
}: TransactionTicketDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data: item, isLoading } = useMerchantTicketDetail(ticketId);

  const handleCopy = (text: string, id: string = "default") => {
    if (!text) return;
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
    value: string | React.ReactNode;
    copyable?: boolean;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100 last:border-0">
      <dt className="w-full sm:w-1/3 text-sm font-medium text-slate-500">
        {label}
      </dt>
      <dd className="w-full sm:w-2/3 text-sm text-slate-900 mt-1 sm:mt-0 flex items-center gap-2">
        <span className="break-all">{value || "—"}</span>
        {copyable && value && typeof value === "string" && (
          <button
            onClick={() => handleCopy(value, label)}
            className={clsx(
              "p-0.5 rounded transition-all flex items-center gap-1.5",
              copiedId === label
                ? "text-slate-900 bg-slate-100 pr-1.5"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
            title="Copy to clipboard"
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

  return (
    <Drawer
      open={!!ticketId}
      onClose={onClose}
      title="Ticket Details"
      subtitle={
        ticketId && item ? (
          <div className="flex items-center gap-2">
            <span>Ticket No: {item.ticket_no}</span>
            <button
              onClick={() => handleCopy(item.ticket_no, "header_ticket")}
              className={clsx(
                "p-0.5 rounded transition-colors flex items-center gap-1.5",
                copiedId === "header_ticket"
                  ? "text-slate-900 bg-slate-100 pr-1.5"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              )}
              title="Copy Ticket No"
            >
              {copiedId === "header_ticket" ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Copied!</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ) : null
      }
      width="lg"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
          <Loader size="md" />
          <p className="text-sm font-medium">Loading ticket details...</p>
        </div>
      ) : item ? (
        <div className="space-y-8">
          {/* SECTION 1: Ticket Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Ticket Information
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow
                label="Requested On"
                value={
                  item.requested_on
                    ? new Date(item.requested_on).toLocaleString()
                    : "—"
                }
              />
              <DetailRow
                label="Merchant Name"
                value={
                  <span>
                    {item.merchant_name}{" "}
                    <span className="text-xs text-slate-500">
                      ID: {item.merchant_id || item.msslid}
                    </span>
                  </span>
                }
              />
              <DetailRow label="Store Name" value={item.store_name} />
              <DetailRow
                label="Transaction ID"
                value={item.transaction_id}
                copyable
              />
              <DetailRow
                label="Query Type"
                value={
                  <div className="flex gap-2 flex-wrap">
                    {(() => {
                      try {
                        const raw =
                          typeof item.ticketing_query_raw === "string"
                            ? JSON.parse(item.ticketing_query_raw)
                            : item.ticketing_query_raw;

                        if (
                          raw &&
                          typeof raw === "object" &&
                          !Array.isArray(raw)
                        ) {
                          return Object.values(raw).map((q: any) => (
                            <span
                              key={q}
                              className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-medium text-slate-700"
                            >
                              {q}
                            </span>
                          ));
                        }
                        return <span>—</span>;
                      } catch {
                        return <span>—</span>;
                      }
                    })()}
                  </div>
                }
              />
              <DetailRow
                label="Status"
                value={
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                      getStatusColor(item.status),
                    )}
                  >
                    {item.status}
                  </span>
                }
              />
            </div>
          </div>

          {/* SECTION 2: Requester Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Requester Information
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow label="Requested By" value={item.created_by} />
              <DetailRow label="Account Type" value={"Merchant"} />
              <DetailRow label="User Role" value={item.created_by_role} />
              <DetailRow label="Requester Name" value={item.created_by_name} />
              <DetailRow
                label="Requester Email"
                value={item.created_by_email}
                copyable
              />
              <DetailRow
                label="Requester Mobile"
                value={item.created_by_mobile}
                copyable
              />
            </div>
          </div>

          {/* SECTION 3: Feedback & Resolution */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Feedback & Resolution
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 px-4">
              <DetailRow
                label="Request Feedback"
                value={item.ticketing_remarks}
              />
              <DetailRow
                label="Feedback Given By"
                value={
                  item.feedback_given_by_name ||
                  (item.feedback_given_by
                    ? String(item.feedback_given_by)
                    : null)
                }
              />
              <DetailRow
                label="Feedback Given On"
                value={
                  item.feedback_given_on
                    ? new Date(item.feedback_given_on).toLocaleString()
                    : null
                }
              />
              <DetailRow
                label="Feedback Remarks"
                value={item.feedback_remarks}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <p className="text-sm font-medium">Ticket details not found.</p>
        </div>
      )}
    </Drawer>
  );
}
