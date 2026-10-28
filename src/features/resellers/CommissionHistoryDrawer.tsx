import { Drawer } from "../../components/Drawer";
import { History, UserPlus, Send, CheckCircle2, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { formatResellerDateTime } from "./utils/resellerDateFormat";
import { useEffect, useState } from "react";

interface CommissionHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  resellerName?: string;
  resellerId?: string;
  status?: string;
}

interface CommissionLog {
  id: string;
  action: string;
  performedAt: string;
  performedBy: string;
  remarks: string;
}

function getLogVisual(action: string) {
  if (action.includes("Approved")) {
    return {
      Icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    };
  }
  if (action.includes("Declined")) {
    return {
      Icon: XCircle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
    };
  }
  if (
    action.includes("Review") ||
    action.includes("Requested") ||
    action.includes("Pending")
  ) {
    return {
      Icon: Send,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
    };
  }
  if (action === "Submitted" || action === "Statement Submitted") {
    return {
      Icon: Send,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    };
  }
  if (action === "Created") {
    return {
      Icon: UserPlus,
      color: "text-slate-600 bg-slate-50 border-slate-100",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
    };
  }
  if (action === "Statement Generated") {
    return {
      Icon: Send,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-100",
    };
  }
  return {
    Icon: History,
    color: "text-slate-600 bg-slate-50 border-slate-100",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
  };
}

export function CommissionHistoryDrawer({
  open,
  onClose,
  resellerName,
  resellerId,
  status,
}: CommissionHistoryDrawerProps) {
  const [logs, setLogs] = useState<CommissionLog[]>([]);

  useEffect(() => {
    if (!open || !resellerId) return;

    const isPayLinkReseller = Boolean(
      resellerName?.toLowerCase().includes("paylink"),
    );
    const logsKey = `commission_logs_${resellerId}`;
    const existingLogsStr = localStorage.getItem(logsKey);
    let currentLogs: CommissionLog[] = existingLogsStr
      ? JSON.parse(existingLogsStr)
      : [];
    const isSubmitted =
      localStorage.getItem(`commission_submitted_${resellerId}`) === "true";
    const settlementStatus = localStorage.getItem(
      `settlement_status_${resellerId}`,
    );

    // Ensure approved settlement log exists if status is approved
    if (
      settlementStatus === "approved" &&
      !currentLogs.some((l) => l.action.includes("Approved"))
    ) {
      const storedCycle =
        localStorage.getItem(`commission_cycle_${resellerId}`) ||
        "Bi-weekly (14 days)";
      currentLogs.unshift({
        id: "auto-approved-" + resellerId,
        action: "Approved Settlement",
        performedAt: new Date().toISOString(),
        performedBy: "KAM Admin",
        remarks: `Approved settlement cycle request to "${storedCycle}".`,
      });
    }

    // Ensure declined settlement log exists if status is declined
    if (
      settlementStatus === "declined" &&
      !currentLogs.some((l) => l.action.includes("Declined"))
    ) {
      const declineReason =
        localStorage.getItem(`settlement_decline_reason_${resellerId}`) ||
        "Declined settlement cycle request.";
      currentLogs.unshift({
        id: "auto-declined-" + resellerId,
        action: "Declined Settlement",
        performedAt: new Date().toISOString(),
        performedBy: "KAM Admin",
        remarks: declineReason,
      });
    }

    // For PayLink Reseller, ensure review request event exists
    if (
      isPayLinkReseller &&
      !currentLogs.some(
        (l) => l.action.includes("Review") || l.action.includes("Requested"),
      )
    ) {
      currentLogs.push({
        id: "auto-review-" + resellerId,
        action: "Settlement Review Requested",
        performedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        performedBy: resellerName || "PayLink Reseller",
        remarks:
          'Reseller requested settlement cycle review to "Bi-weekly (14 days)".',
      });
    }

    // Check if pending reseller review needs to be present
    if (
      isSubmitted &&
      !currentLogs.some((l) => l.action === "Pending Reseller Review")
    ) {
      const storedCycle =
        localStorage.getItem(`commission_cycle_${resellerId}`) ||
        "Weekly (7 days)";
      currentLogs.unshift({
        id: "auto-pending-" + resellerId,
        action: "Pending Reseller Review",
        performedAt: new Date().toISOString(),
        performedBy: "Susanta Kam",
        remarks: `Commission schedule set to "${storedCycle}" and submitted for reseller review.`,
      });
    }

    // Seed AP/RA Reseller commission logs if they are not already set up
    const isApReseller = resellerId?.startsWith("AP-");
    const isRaReseller = resellerId?.startsWith("RA-");

    if (isApReseller || isRaReseller) {
      const seededLogs: CommissionLog[] = [
        {
          id: "seed-created-" + resellerId,
          action: "Created",
          performedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          performedBy: "System",
          remarks:
            "Reseller account onboarded and commission configuration initialized.",
        },
        {
          id: "seed-statement-generated-" + resellerId,
          action: "Statement Generated",
          performedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          performedBy: "Settlement System",
          remarks:
            "Commission & Settlement statement generated for 01 Jun 2026 - 30 Jun 2026. Total Txns: 2083, Processed Volume: ৳ 2,175,004.93, Net Payable: ৳ 3,648.25.",
        },
        {
          id: "seed-statement-submitted-" + resellerId,
          action: "Statement Submitted",
          performedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          performedBy: "System",
          remarks:
            "Commission statement submitted for approval and verification.",
        },
      ];

      const currentStatus = status || settlementStatus;
      if (currentStatus === "Approved" || currentStatus === "approved") {
        seededLogs.unshift({
          id: "seed-status-approved-" + resellerId,
          action: "Approved Settlement",
          performedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          performedBy: "KAM Admin",
          remarks:
            "Approved reseller commission statement and settlement cycle.",
        });
      } else if (currentStatus === "Rejected" || currentStatus === "rejected") {
        seededLogs.unshift({
          id: "seed-status-rejected-" + resellerId,
          action: "Declined Settlement",
          performedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          performedBy: "KAM Admin",
          remarks:
            "Declined reseller commission statement and settlement cycle.",
        });
      } else if (currentStatus === "Pending" || currentStatus === "pending") {
        seededLogs.unshift({
          id: "seed-status-pending-" + resellerId,
          action: "Pending Review",
          performedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          performedBy: "System",
          remarks: "Pending reviewer verification and approval.",
        });
      }

      currentLogs = [...currentLogs, ...seededLogs];
      const seen = new Set();
      currentLogs = currentLogs.filter((el) => {
        const duplicate = seen.has(el.id);
        seen.add(el.id);
        return !duplicate;
      });
      currentLogs.sort(
        (a, b) =>
          new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
      );
    }

    // If no logs exist at all, seed a default "Created" event
    if (currentLogs.length === 0) {
      currentLogs = [
        {
          id: "seed-created",
          action: "Created",
          performedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          performedBy: "System",
          remarks:
            "Reseller account onboarded and commission configuration initialized.",
        },
      ];
    } else if (!currentLogs.some((l) => l.action === "Created")) {
      // Ensure there is always a "Created" event at the bottom
      currentLogs.push({
        id: "seed-created",
        action: "Created",
        performedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        performedBy: "System",
        remarks:
          "Reseller account onboarded and commission configuration initialized.",
      });
    }

    setLogs(currentLogs);
  }, [open, resellerId, resellerName, status]);

  const title = (
    <div className="space-y-1">
      <span className="text-lg font-semibold text-slate-900">
        Commission Configuration History
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
    <Drawer open={open} onClose={onClose} title={title} width="lg">
      <div className="space-y-5 pb-2">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2 bg-slate-100 rounded-lg shrink-0">
            <History className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Configure Commission History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track submission and modification events for this reseller's
              commission
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-6">
            {logs.map((log) => {
              const { Icon, color, badgeClass } = getLogVisual(log.action);
              const { datePart, timePart } = formatResellerDateTime(
                log.performedAt,
              );
              return (
                <div key={log.id} className="relative flex gap-4 pl-0">
                  <div
                    className={clsx(
                      "relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0",
                      color,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        {datePart}
                        <span className="normal-case tracking-normal font-semibold text-[10px]">
                          {" "}
                          · {timePart}
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                          badgeClass,
                        )}
                      >
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {log.action}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {log.remarks}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      By{" "}
                      <span className="font-medium text-slate-500">
                        {log.performedBy}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
