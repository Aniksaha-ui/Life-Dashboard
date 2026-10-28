import { clsx } from "clsx";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  Download,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { type Merchant, suggest } from "../data";
import { toast } from "react-hot-toast";
import { CopyButton } from "../../../components/CopyButton";
import { DataTable } from "../../../components/DataTable";
import { PortfolioSegmentInfo } from "./PortfolioSegmentInfo";

interface MerchantLedgerTabProps {
  data: Merchant[];
  sortBy: keyof Merchant;
  sortDir: "asc" | "desc";
  onOpenDrawer: (id: number, mode?: "details" | "action") => void;
}

export function MerchantLedgerTab({
  data,
  sortBy,
  sortDir,
  onOpenDrawer,
}: MerchantLedgerTabProps) {
  const getLifecycleStatus = (segment: string) => {
    const activeGrowing = [
      "Champion Merchants",
      "Loyal Big Merchants",
      "Loyal Regular Merchants",
      "High Value Irregular Merchants",
      "Potential Up-sell",
      "Stable Merchants",
    ];
    const declining = [
      "High Risk Big Merchants",
      "Lost Merchants",
      "Inactive Merchants",
    ];

    if (activeGrowing.includes(segment)) return "Active & Growing";
    if (declining.includes(segment)) return "Declining";
    return "Watch";
  };

  const handleDownloadCsv = () => {
    const headers = [
      "id",
      "name",
      "month",
      "segment",
      "lifecycle",
      "trend",
      "action",
      "gmv",
      "riskScore",
      "successRate",
      "errors",
      "suggestion",
    ];
    const csv = [headers.join(",")]
      .concat(
        data.map((m) => {
          const rowData = {
            ...m,
            lifecycle: getLifecycleStatus(m.segment),
            suggestion: suggest(m),
          };
          return headers
            .map((h) => `"${String((rowData as any)[h]).replace(/"/g, '""')}"`)
            .join(",");
        }),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "kam_action_list.csv";
    a.click();
    toast.success("CSV downloaded");
  };

  const columns = useMemo<ColumnDef<Merchant>[]>(
    () => [
      {
        header: "Merchant Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onOpenDrawer(row.original.id, "details")}
              className="text-slate-900 font-bold text-sm whitespace-nowrap hover:text-primary-600 transition-colors cursor-pointer text-left w-fit"
            >
              {row.original.name}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                {row.original.storeId}
              </span>
              <CopyButton value={row.original.storeId} />
            </div>
          </div>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-1 justify-start">
            <span>Action Type</span>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-primary-500 cursor-help hover:text-primary-600 transition-colors" />
              <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-[11px] normal-case tracking-normal font-normal whitespace-normal">
                <div className="font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Action Type Definitions</span>
                  <span className="text-[9px] font-medium text-slate-400">
                    Action Type Logic
                  </span>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-0.5 shrink-0 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600 uppercase text-[9px]">
                          Act Now
                        </span>
                        <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-medium border border-red-100">
                          This week
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 leading-relaxed font-normal">
                        Personal call — CRITICAL / URGENT merchants at immediate
                        risk of churning
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-0.5 shrink-0 shadow-[0_0_0_2px_rgba(245,158,11,0.1)]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600 uppercase text-[9px]">
                          Follow Up
                        </span>
                        <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-medium border border-amber-100">
                          Within 2 weeks
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 leading-relaxed font-normal">
                        Scheduled check-in — declining or dormant merchants
                        showing warning signs
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-0.5 shrink-0 shadow-[0_0_0_2px_rgba(16,185,129,0.1)]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600 uppercase text-[9px]">
                          Growth
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-medium border border-emerald-100">
                          Next 30 days
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 leading-relaxed font-normal">
                        Nurture — merchants growing or newly active, reinforce
                        the relationship
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-0.5 shrink-0 shadow-[0_0_0_2px_rgba(148,163,184,0.1)]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600 uppercase text-[9px]">
                          Routine
                        </span>
                        <span className="bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded text-[8px] font-medium border border-slate-100">
                          Monthly batch
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 leading-relaxed font-normal">
                        Automated email / digest — stable merchants, no
                        individual KAM time needed
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-black mt-0.5 shrink-0 shadow-[0_0_0_2px_rgba(0,0,0,0.05)]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 uppercase text-[9px]">
                          Win-back
                        </span>
                        <span className="bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded text-[8px] font-medium border border-slate-200">
                          Quarterly
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 leading-relaxed font-normal">
                        Win-back campaign — churned merchants, low individual
                        effort
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        accessorKey: "action",
        cell: ({ row }) => {
          const action = row.original.action;
          return (
            <span
              className={clsx(
                "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
                action === "Action Now" || action === "Win-back"
                  ? "bg-rose-50 text-rose-600"
                  : action === "Follow Up"
                    ? "bg-amber-50 text-amber-600"
                    : action === "Growth"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500",
              )}
            >
              {action === "Action Now" ? "Act Now" : action}
            </span>
          );
        },
      },
      {
        header: "Lifecycle Status",
        accessorKey: "segment",
        cell: ({ row }) => {
          const lifecycleStatus = getLifecycleStatus(row.original.segment);
          const lifecycleIcon =
            lifecycleStatus === "Active & Growing"
              ? { Icon: TrendingUp, color: "text-emerald-500" }
              : lifecycleStatus === "Declining"
                ? { Icon: TrendingDown, color: "text-rose-500" }
                : { Icon: Activity, color: "text-amber-500" };
          const { Icon, color } = lifecycleIcon;
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Icon className={clsx("w-3.5 h-3.5 shrink-0", color)} />
              <span className="text-xs font-medium text-slate-600">
                {lifecycleStatus}
              </span>
            </div>
          );
        },
      },
      {
        header: () => (
          <div className="flex items-center gap-1 justify-start">
            <span>Trend</span>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-primary-500 cursor-help hover:text-primary-600 transition-colors" />
              <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/4 top-full mt-2 w-[480px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-[11px] normal-case tracking-normal font-normal whitespace-normal">
                <div className="font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Activity Trends</span>
                  <span className="text-[9px] font-medium text-slate-400">
                    Velocity Rules
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-left">
                  {[
                    {
                      t: "Accelerating Growth",
                      d: "All 3 RFM scores rising",
                      c: "bg-emerald-50 text-emerald-600",
                      i: "↑",
                    },
                    {
                      t: "Soft Growth",
                      d: "At least one score improving",
                      c: "bg-emerald-50 text-emerald-600",
                      i: "↑",
                    },
                    {
                      t: "Recovering",
                      d: "Rebounding after a decline",
                      c: "bg-blue-50 text-blue-600",
                      i: "↗",
                    },
                    {
                      t: "Reactivated",
                      d: "Dormant transacting again",
                      c: "bg-purple-50 text-purple-600",
                      i: "⟳",
                    },
                    {
                      t: "New Active",
                      d: "First month with activity",
                      c: "bg-purple-50 text-purple-600",
                      i: "★",
                    },
                    {
                      t: "Returning",
                      d: "Prev. inactive, came back",
                      c: "bg-lime-50 text-lime-600",
                      i: "↵",
                    },
                    {
                      t: "Stable - Healthy",
                      d: "Scores holding steady (High)",
                      c: "bg-blue-50 text-blue-600",
                      i: "→",
                    },
                    {
                      t: "Stable - Weak",
                      d: "Scores holding steady (Low)",
                      c: "bg-slate-50 text-slate-400",
                      i: "–",
                    },
                    {
                      t: "Irregular Pattern",
                      d: "Mixed score direction",
                      c: "bg-orange-50 text-orange-600",
                      i: "~",
                    },
                    {
                      t: "Engagement Drop",
                      d: "Declining, not yet critical",
                      c: "bg-orange-50 text-orange-600",
                      i: "↘",
                    },
                    {
                      t: "Soft Decline",
                      d: "One score slipping",
                      c: "bg-orange-50 text-orange-600",
                      i: "↓",
                    },
                    {
                      t: "Losing Volume",
                      d: "F+M both declining",
                      c: "bg-red-50 text-red-600",
                      i: "↓↓",
                    },
                    {
                      t: "Rapid Fall",
                      d: "All 3 scores falling",
                      c: "bg-red-50 text-red-600",
                      i: "⚠",
                    },
                    {
                      t: "Zero Success",
                      d: "No successful transactions",
                      c: "bg-slate-100 text-slate-500",
                      i: "✕",
                    },
                  ].map((item) => (
                    <div key={item.t} className="flex gap-2">
                      <div
                        className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[8px]",
                          item.c,
                        )}
                      >
                        {item.i}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{item.t}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5 leading-tight font-normal">
                          {item.d}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ),
        accessorKey: "trend",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.trend}
          </span>
        ),
      },
      {
        header: () => (
          <div className="flex items-center gap-1 justify-start">
            <span>Segment</span>
            <PortfolioSegmentInfo />
          </div>
        ),
        accessorKey: "segment",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-600">
            {row.original.segment}
          </span>
        ),
      },
      {
        header: "Recommendation",
        accessorKey: "id",
        cell: ({ row }) => (
          <span className="text-slate-600 text-xs leading-normal font-medium max-w-[220px] inline-block">
            {suggest(row.original)}
          </span>
        ),
      },
      {
        id: "action",
        header: "Next Steps",
        cell: ({ row }) => (
          <button
            onClick={() => onOpenDrawer(row.original.id, "action")}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline bg-transparent border-0 p-0 transition-colors cursor-pointer"
          >
            View Checklist
          </button>
        ),
      },
    ],
    [onOpenDrawer],
  );

  const rows = useMemo(() => {
    return [...data].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "number" && typeof bVal === "number")
        return aVal > bVal ? dir : -dir;
      return String(aVal) > String(bVal) ? dir : -dir;
    });
  }, [data, sortBy, sortDir]);

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <DataTable
          columns={columns}
          data={rows}
          hideToolbarDateFilter={true}
          viewButtonLabel="View Column"
          toolbarEndContent={
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          }
          filterActions={
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 ml-1">
                Showing Recommended KAM Actions
              </h2>
            </div>
          }
        />
      </div>
    </div>
  );
}
