import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

type ShareField = "merchantShare" | "sslShare" | "affiliateShare";

interface ChannelOption {
  id: string;
  paymentChannel: string;
  paymentMode: string;
}

interface CommissionScheduleRow {
  uuid: string;
  channelId: string;
  merchantShare: string;
  sslShare: string;
  affiliateShare: string;
}

interface CommissionScheduleDrawerProps {
  open: boolean;
  onClose: () => void;
  resellerName?: string;
  resellerId?: string;
}

const SETTLEMENT_CYCLES = [
  {
    id: "Weekly (7 days)",
    title: "Weekly",
    subtitle: "7 days · Payout every 7 days",
  },
  {
    id: "Bi-weekly (14 days)",
    title: "Bi-weekly",
    subtitle: "14 days · Payout every 14 days",
  },
  {
    id: "Monthly (30 days)",
    title: "Monthly",
    subtitle: "30 days · Payout every 30 days",
  },
];

const AVAILABLE_CHANNELS: ChannelOption[] = [
  {
    id: "bkash",
    paymentChannel: "bKash",
    paymentMode: "Mobile Financial Services (MFS)",
  },
  {
    id: "nagad-rocket",
    paymentChannel: "Nagad, Rocket",
    paymentMode: "Mobile Financial Services (MFS)",
  },
  {
    id: "cards",
    paymentChannel: "Visa, Mastercard, UnionPay, Nexus",
    paymentMode: "Debit/Credit Card (Local & International)",
  },
  {
    id: "amex",
    paymentChannel: "Amex",
    paymentMode: "Debit/Credit Card (International)",
  },
  {
    id: "qcash",
    paymentChannel: "Q-Cash",
    paymentMode: "Debit/Credit Card (Local)",
  },
  {
    id: "internet-banking",
    paymentChannel: "City Touch, AB Direct, Bank Asia, MTB, IBBL",
    paymentMode: "Internet Banking",
  },
  {
    id: "wallet",
    paymentChannel: "iPay, Upay, Dmoney",
    paymentMode: "Wallet",
  },
];

const SHARE_FIELDS: { key: ShareField; label: string }[] = [
  { key: "merchantShare", label: "Merchant" },
  { key: "sslShare", label: "SSL" },
  { key: "affiliateShare", label: "Affiliate" },
];

function createEmptyRow(): CommissionScheduleRow {
  return {
    uuid: Math.random().toString(36).substr(2, 9),
    channelId: "",
    merchantShare: "",
    sslShare: "",
    affiliateShare: "",
  };
}

function parseShare(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  if (Number.isNaN(numeric)) return null;
  return numeric;
}

function isCompleteRow(row: CommissionScheduleRow): boolean {
  return (
    row.channelId !== "" &&
    SHARE_FIELDS.every(({ key }) => row[key].trim() !== "")
  );
}

function isPartialRow(row: CommissionScheduleRow): boolean {
  const filled = SHARE_FIELDS.filter(
    ({ key }) => row[key].trim() !== "",
  ).length;
  return (
    (filled > 0 && filled < SHARE_FIELDS.length) ||
    (row.channelId !== "" && filled < SHARE_FIELDS.length) ||
    (row.channelId === "" && filled > 0)
  );
}

function isEmptyRow(row: CommissionScheduleRow): boolean {
  return (
    row.channelId === "" &&
    SHARE_FIELDS.every(({ key }) => row[key].trim() === "")
  );
}

export function CommissionScheduleDrawer({
  open,
  onClose,
  resellerName,
  resellerId,
}: CommissionScheduleDrawerProps) {
  const [rows, setRows] = useState<CommissionScheduleRow[]>([createEmptyRow()]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const isPayLinkReseller = Boolean(
    resellerName?.toLowerCase().includes("paylink"),
  );
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [declineCycleOption, setDeclineCycleOption] =
    useState<string>("Weekly (7 days)");
  const [declineMessage, setDeclineMessage] = useState("");
  const [settlementStatus, setSettlementStatus] = useState<
    "pending" | "approved" | "declined"
  >("pending");

  const [settlementCycle, setSettlementCycle] = useState("Weekly (7 days)");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRows([createEmptyRow()]);
    setRowErrors({});
    setDeclineCycleOption("Weekly (7 days)");
    setDeclineMessage("");
    setIsSubmitting(false);

    if (isPayLinkReseller) {
      setSettlementCycle("Bi-weekly (14 days)");
    } else {
      setSettlementCycle("Weekly (7 days)");
    }

    if (resellerId) {
      const submitted =
        localStorage.getItem(`commission_submitted_${resellerId}`) === "true";
      setIsSubmitted(submitted);

      const storedCycle = localStorage.getItem(
        `commission_cycle_${resellerId}`,
      );
      if (storedCycle) {
        setSettlementCycle(storedCycle);
      }

      const storedRows = localStorage.getItem(`commission_rows_${resellerId}`);
      if (storedRows) {
        try {
          setRows(JSON.parse(storedRows));
        } catch (e) {
          console.error("Failed to parse stored commission rows", e);
        }
      }

      setSettlementStatus("pending");
    }
  }, [open, resellerId, isPayLinkReseller]);

  const handleApproveSettlement = () => {
    setIsApproveModalOpen(true);
  };

  const confirmApproveSettlement = () => {
    setSettlementStatus("approved");
    if (resellerId) {
      const logsKey = `commission_logs_${resellerId}`;
      const existingLogsStr = localStorage.getItem(logsKey);
      const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      logs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        action: "Approved Settlement",
        performedAt: new Date().toISOString(),
        performedBy: "KAM Admin",
        remarks: `Approved settlement cycle request to "${settlementCycle}".`,
      });
      localStorage.setItem(logsKey, JSON.stringify(logs));
    }
    toast.success(`Settlement cycle request approved (${settlementCycle})`);
    setIsApproveModalOpen(false);
  };

  const handleDeclineSettlement = () => {
    setSettlementCycle(declineCycleOption);
    setSettlementStatus("declined");

    const remarksStr =
      `Declined settlement cycle request. Enforced cycle set to "${declineCycleOption}"` +
      (declineMessage.trim() ? `. Reason: "${declineMessage.trim()}"` : "");

    if (resellerId) {
      localStorage.setItem(
        `commission_cycle_${resellerId}`,
        declineCycleOption,
      );
      localStorage.setItem(
        `settlement_decline_reason_${resellerId}`,
        remarksStr,
      );

      const logsKey = `commission_logs_${resellerId}`;
      const existingLogsStr = localStorage.getItem(logsKey);
      const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      logs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        action: "Declined Settlement",
        performedAt: new Date().toISOString(),
        performedBy: "KAM Admin",
        remarks: remarksStr,
      });
      localStorage.setItem(logsKey, JSON.stringify(logs));
    }
    toast.error(
      `Settlement cycle request declined. Enforced cycle set to ${declineCycleOption}`,
    );
    setIsDeclineModalOpen(false);
  };

  const selectedChannelIds = useMemo(() => {
    return rows.map((r) => r.channelId).filter((id) => id !== "");
  }, [rows]);

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (uuid: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.uuid !== uuid);
      return next.length === 0 ? [createEmptyRow()] : next;
    });
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[uuid];
      return next;
    });
  };

  const handleChannelSelect = (uuid: string, channelId: string) => {
    setRows((prev) =>
      prev.map((r) => (r.uuid === uuid ? { ...r, channelId } : r)),
    );
    setRowErrors((prev) => {
      if (!prev[uuid]) return prev;
      const next = { ...prev };
      delete next[uuid];
      return next;
    });
  };

  const filledRowCount = useMemo(
    () => rows.filter(isCompleteRow).length,
    [rows],
  );

  const handleShareChange = (
    uuid: string,
    field: ShareField,
    value: string,
  ) => {
    // Allow only digits and a single decimal point
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setRows((prev) =>
      prev.map((row) => (row.uuid === uuid ? { ...row, [field]: value } : row)),
    );
    setRowErrors((prev) => {
      if (!prev[uuid]) return prev;
      const next = { ...prev };
      delete next[uuid];
      return next;
    });
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    rows.forEach((row) => {
      if (isEmptyRow(row)) {
        nextErrors[row.uuid] = "Please select a channel and enter shares.";
        return;
      }

      if (!row.channelId) {
        nextErrors[row.uuid] = "Please select a payment channel.";
        return;
      }

      if (isPartialRow(row)) {
        nextErrors[row.uuid] = "Fill all three values for this channel.";
        return;
      }

      const merchant = parseShare(row.merchantShare);
      const ssl = parseShare(row.sslShare);
      const affiliate = parseShare(row.affiliateShare);

      if (merchant === null || ssl === null || affiliate === null) {
        nextErrors[row.uuid] = "Values must be valid numbers.";
        return;
      }

      if (
        [merchant, ssl, affiliate].some((value) => value < 0 || value > 100)
      ) {
        nextErrors[row.uuid] = "Each value must be between 0 and 100.";
        return;
      }
    });

    setRowErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix errors before submitting.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Mock submit — replace with API when available
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (resellerId) {
        localStorage.setItem(`commission_submitted_${resellerId}`, "true");
        localStorage.setItem(`commission_cycle_${resellerId}`, settlementCycle);
        localStorage.setItem(
          `commission_rows_${resellerId}`,
          JSON.stringify(rows),
        );

        const logsKey = `commission_logs_${resellerId}`;
        const existingLogsStr = localStorage.getItem(logsKey);
        const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];

        const channelCount = rows.filter((r) => r.channelId !== "").length;
        const remarks = `Commission schedule set to "${settlementCycle}" with ${channelCount} channel${channelCount !== 1 ? "s" : ""} configured.`;

        logs.unshift({
          id: Math.random().toString(36).substr(2, 9),
          action: "Pending Reseller Review",
          performedAt: new Date().toISOString(),
          performedBy: "Susanta Kam",
          remarks,
        });

        localStorage.setItem(logsKey, JSON.stringify(logs));
      }

      toast.success(
        `Commission schedule (${settlementCycle}) submitted for ${resellerName || "reseller"} review`,
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = (
    <div className="space-y-1">
      <span className="text-lg font-semibold text-slate-900">
        Configure Commission
      </span>
      {(resellerName || resellerId) && (
        <div className="flex items-center gap-2 flex-wrap text-sm font-normal">
          {resellerName && (
            <span className="text-slate-700">{resellerName}</span>
          )}
          {resellerId && (
            <span className="text-slate-500">ID: {resellerId}</span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Drawer open={open} onClose={onClose} title={title} width="4xl">
        <div className="space-y-5 pb-2">
          {isSubmitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-emerald-800">
                  Pending Reseller Review
                </h4>
                <p className="text-xs text-emerald-600">
                  This commission schedule has been submitted for reseller
                  review. The schedule is currently locked.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600">
            Set Merchant, SSL, and Affiliate percentages for{" "}
            <span className="font-semibold">all</span> payment channels. Submit
            to send the schedule for reseller review.
          </p>

          {/* Settlement Cycle Section: Uniform UI/UX with warning background for review requested state */}
          <div
            className={clsx(
              "rounded-xl p-4 space-y-3 shadow-sm border transition-all",
              isPayLinkReseller && settlementStatus === "pending"
                ? "bg-amber-50/70 border-amber-200"
                : isPayLinkReseller && settlementStatus === "approved"
                  ? "bg-emerald-50/50 border-emerald-200"
                  : isPayLinkReseller && settlementStatus === "declined"
                    ? "bg-rose-50/50 border-rose-200"
                    : "bg-slate-50 border-slate-200",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={clsx(
                  "block text-[11px] font-bold uppercase tracking-wider",
                  isPayLinkReseller && settlementStatus === "pending"
                    ? "text-amber-800"
                    : "text-slate-500",
                )}
              >
                Settlement Cycle
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                "Weekly (7 days)",
                "Bi-weekly (14 days)",
                "Monthly (30 days)",
              ].map((option) => (
                <label
                  key={option}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold transition-all hover:bg-slate-100/50 shadow-sm",
                    settlementCycle === option
                      ? "bg-white border-primary-500 text-primary-700 ring-2 ring-primary-500/10"
                      : "bg-white border-transparent text-slate-600",
                    isSubmitted || isPayLinkReseller
                      ? "cursor-default hover:bg-white"
                      : "cursor-pointer",
                  )}
                >
                  <input
                    type="radio"
                    name="settlementCycle"
                    value={option}
                    checked={settlementCycle === option}
                    disabled={isSubmitted || isPayLinkReseller}
                    onChange={(e) => setSettlementCycle(e.target.value)}
                    className={clsx(
                      "accent-primary-600 w-4 h-4",
                      isSubmitted || isPayLinkReseller
                        ? "cursor-default"
                        : "cursor-pointer",
                    )}
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Decline & Approve Action Bar with status text line on the left side */}
            {isPayLinkReseller && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-200/80">
                <div>
                  {settlementStatus === "pending" ? (
                    <span className="text-xs text-amber-700 font-semibold">
                      Reseller requested settlement cycle review
                    </span>
                  ) : settlementStatus === "approved" ? (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-100/80 border border-rose-200 rounded-full">
                      Declined
                    </span>
                  )}
                </div>

                {settlementStatus === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDeclineModalOpen(true)}
                      className="px-4 py-2 text-sm font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveSettlement}
                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Payment Channel</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3 w-[120px]">Merchant</th>
                    <th className="px-4 py-3 w-[120px]">SSL</th>
                    <th className="px-4 py-3 w-[120px]">Affiliate</th>
                    <th className="px-2 py-3 w-[40px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => {
                    const channel = AVAILABLE_CHANNELS.find(
                      (c) => c.id === row.channelId,
                    );
                    return (
                      <tr
                        key={row.uuid}
                        className="align-top hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          <div className="relative">
                            <select
                              value={row.channelId}
                              disabled={isSubmitted}
                              onChange={(e) =>
                                handleChannelSelect(row.uuid, e.target.value)
                              }
                              className={clsx(
                                "w-full text-xs font-semibold px-3 py-2 bg-white border rounded-lg focus:ring-2 outline-none transition-all appearance-none disabled:opacity-75 disabled:bg-slate-50 disabled:cursor-not-allowed",
                                rowErrors[row.uuid] && !row.channelId
                                  ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                                  : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
                              )}
                            >
                              <option value="">Select Channel</option>
                              {AVAILABLE_CHANNELS.map((opt) => {
                                const isSelected = selectedChannelIds.includes(
                                  opt.id,
                                );
                                const isCurrent = opt.id === row.channelId;
                                if (isSelected && !isCurrent) return null;
                                return (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.paymentChannel}
                                  </option>
                                );
                              })}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                          {rowErrors[row.uuid] && (
                            <p className="mt-1.5 text-[11px] font-medium text-rose-600 normal-case tracking-normal">
                              {rowErrors[row.uuid]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 leading-snug pt-5">
                          {channel?.paymentMode || (
                            <span className="text-slate-400 italic">
                              Select channel
                            </span>
                          )}
                        </td>
                        {SHARE_FIELDS.map(({ key, label }) => (
                          <td key={key} className="px-4 py-3">
                            <div className="relative pt-1.5">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={row[key]}
                                disabled={isSubmitted}
                                onChange={(e) =>
                                  handleShareChange(
                                    row.uuid,
                                    key,
                                    e.target.value,
                                  )
                                }
                                placeholder="0"
                                aria-label={`${channel?.paymentChannel || "Channel"} ${label}`}
                                className={`w-full rounded-md border bg-white px-2.5 py-1.5 pr-7 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 disabled:opacity-75 disabled:bg-slate-50 disabled:cursor-not-allowed ${
                                  rowErrors[row.uuid] &&
                                  !isEmptyRow(row) &&
                                  !row[key]
                                    ? "border-rose-300"
                                    : "border-slate-200"
                                }`}
                              />
                              <span className="pointer-events-none absolute right-2.5 top-[55%] -translate-y-1/2 text-xs text-slate-400">
                                %
                              </span>
                            </div>
                          </td>
                        ))}
                        <td className="px-2 py-3 text-left pt-5">
                          <button
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleRemoveRow(row.uuid)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleAddRow}
              disabled={isSubmitted || rows.length >= AVAILABLE_CHANNELS.length}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Payment Channel
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500">
              {filledRowCount} channel{filledRowCount !== 1 ? "s" : ""}{" "}
              configured
            </p>
            <div className="flex items-center gap-2">
              {isSubmitted ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                  >
                    {isSubmitting
                      ? "Submitting…"
                      : "Submit for Reseller Review"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Decline Reason Modal */}
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title="Decline Settlement Cycle Request"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDeclineModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeclineSettlement}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer"
            >
              Submit Decline
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700">
            Select the settlement cycle to enforce for{" "}
            <span className="font-semibold text-slate-900">
              {resellerName || "PayLink Reseller"}
            </span>
            :
          </p>

          <div className="space-y-2">
            {[
              "Weekly (7 days)",
              "Bi-weekly (14 days)",
              "Monthly (30 days)",
            ].map((cycle) => (
              <label
                key={cycle}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-lg border text-sm font-semibold cursor-pointer transition-all",
                  declineCycleOption === cycle
                    ? "bg-rose-50/60 border-rose-300 text-rose-900 ring-1 ring-rose-300"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name="declineCycleOption"
                  value={cycle}
                  checked={declineCycleOption === cycle}
                  onChange={() => setDeclineCycleOption(cycle)}
                  className="accent-rose-600 w-4 h-4 cursor-pointer"
                />
                <span>{cycle}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decline Message / Remarks{" "}
              <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <textarea
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
              placeholder="Enter reason or remarks for declining..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Settlement Cycle Request"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsApproveModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmApproveSettlement}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm cursor-pointer"
            >
              Confirm Approve
            </button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <p className="text-sm font-medium text-slate-700">
            Are you sure you want to approve the settlement cycle request (
            <span className="font-bold text-slate-900">{settlementCycle}</span>)
            for{" "}
            <span className="font-semibold text-slate-900">
              {resellerName || "PayLink Reseller"}
            </span>
            ?
          </p>
          <p className="text-xs text-slate-500">
            This will finalize the settlement cycle and update the reseller's
            payout schedule.
          </p>
        </div>
      </Modal>
    </>
  );
}
