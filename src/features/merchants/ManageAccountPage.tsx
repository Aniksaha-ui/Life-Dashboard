import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Download, Check, X } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import type { FilterConfig } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import type { ColumnDef } from "@tanstack/react-table";

function getAccountStatusBadgeClass(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-600";
    case "Rejected":
      return "bg-rose-50 text-rose-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

// --- Mock Data Types ---
interface AccountDetails {
  bankName: string;
  branch: string;
  accountPayee: string;
  accountNumber: string;
  routerNumber: string;
  mfsType?: string;
  mfsNumber?: string;
}

interface AccountChangeRequest {
  id: string;
  storeName: string;
  oldAccount: AccountDetails;
  newAccount: AccountDetails;

  // Meta
  requestedBy: string;
  requestedOn: string;
  requestRemarks?: string;

  approvedBy: string;
  approvedOn: string;
  approvalRemarks?: string;

  status: "Approved" | "Pending" | "Rejected";
}

// --- Mock Data ---
const MOCK_DATA: AccountChangeRequest[] = [
  {
    id: "1",
    storeName: "SSLCOMMERZ - devsignupinterfacesslcommerz56live",
    oldAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
    },
    newAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
      mfsNumber: "0",
    },
    requestedBy:
      "BANK & SETTLEMENT APPROVED FROM SIGNUP PANEL BY ashik.shafayet@sslwireless.com",
    requestedOn: "2026-01-19 16:37:18",
    approvedBy: "System Admin",
    approvedOn: "2026-01-20 10:00 AM",
    status: "Approved",
  },
  {
    id: "2",
    storeName: "SSLCOMMERZ - google211live",
    oldAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
    },
    newAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
      mfsNumber: "0",
    },
    requestedBy:
      "BANK & SETTLEMENT APPROVED FROM SIGNUP PANEL BY ashik.shafayet@sslwireless.com",
    requestedOn: "2025-11-26 12:51:40",
    approvedBy: "System Admin",
    approvedOn: "2025-11-27 11:00 AM",
    status: "Approved",
  },
  {
    id: "3",
    storeName: "SSLCOMMERZ googlehrtrtxtrtrtr - googlehrtxtrxtrxtrtrlive",
    oldAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
    },
    newAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
      mfsNumber: "0",
    },
    requestedBy:
      "BANK APPROVED FROM SIGNUP PANEL BY trd.account@mailinator.com",
    requestedOn: "2025-11-25 13:23:23",
    approvedBy: "System Admin",
    approvedOn: "2025-11-26 09:30 AM",
    status: "Approved",
  },
  {
    id: "4",
    storeName: "SSLCOMMERZ - google205live",
    oldAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
    },
    newAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
      mfsNumber: "0",
    },
    requestedBy:
      "BANK & SETTLEMENT APPROVED FROM SIGNUP PANEL BY ashik.shafayet@sslwireless.com",
    requestedOn: "2025-11-25 13:08:18",
    approvedBy: "System Admin",
    approvedOn: "2025-11-25 14:00 PM",
    status: "Approved",
  },
  {
    id: "5",
    storeName: "SSLCOMMERZ googlehrtrtxtrtrtr - googlehrtxtrxtrxtrtrlive",
    oldAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "0011200000001",
      routerNumber: "123456789",
    },
    newAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "WELCOME ELECTRONICS",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
      mfsNumber: "0",
    },
    requestedBy:
      "BANK APPROVED FROM SIGNUP PANEL BY trd.account@mailinator.com",
    requestedOn: "2025-11-13 11:25:27",
    approvedBy: "System Admin",
    approvedOn: "2025-11-14 10:00 AM",
    status: "Approved",
  },
  {
    id: "6",
    storeName: "Test Store - pendingaccountlive",
    oldAccount: {
      bankName: "BRAC BANK LIMITED",
      branch: "GULSHAN",
      accountPayee: "TEST SOLUTIONS LTD",
      accountNumber: "1102233445500",
      routerNumber: "060261325",
    },
    newAccount: {
      bankName: "CITY BANK LIMITED",
      branch: "ROKEYA SARANI",
      accountPayee: "TEST SOLUTIONS LTD",
      accountNumber: "1503384222001",
      routerNumber: "225260991",
    },
    requestedBy: "STORE MANAGER BY manager@test.com",
    requestedOn: "2026-04-16 10:30:00",
    approvedBy: "",
    approvedOn: "",
    status: "Pending",
  },
];

// --- Helper Component for Account Comparison Table ---
const AccountComparisonTable = ({
  old,
  updated,
  borderColor = "border-slate-300",
}: {
  old: AccountDetails;
  updated: AccountDetails;
  borderColor?: string;
}) => {
  const rows = [
    {
      label: "Bank Name",
      old: old.bankName,
      updated: updated.bankName,
      isUpper: true,
    },
    {
      label: "Branch",
      old: old.branch,
      updated: updated.branch,
      isUpper: true,
    },
    {
      label: "Account Payee",
      old: old.accountPayee,
      updated: updated.accountPayee,
      isUpper: true,
    },
    {
      label: "Account Number",
      old: old.accountNumber,
      updated: updated.accountNumber,
      isMono: true,
    },
    {
      label: "Router Number",
      old: old.routerNumber,
      updated: updated.routerNumber,
    },
    {
      label: "MFS Type",
      old: old.mfsType || "0",
      updated: updated.mfsType || "0",
    },
    {
      label: "MFS Number",
      old: old.mfsNumber || "-",
      updated: updated.mfsNumber || "-",
    },
  ];

  return (
    <table className="text-[11px] w-full text-left border-collapse border-y-0">
      <thead>
        <tr className="bg-slate-50/50">
          <th
            className={clsx(
              "border px-2 py-1.5 font-bold text-slate-500 w-[100px]",
              borderColor,
            )}
          >
            Field
          </th>
          <th
            className={clsx(
              "border px-2 py-1.5 font-bold text-slate-500 bg-[#f7f2f2]/40",
              borderColor,
            )}
          >
            Old Account
          </th>
          <th
            className={clsx(
              "border px-2 py-1.5 font-bold text-slate-500 bg-[#ebf6eb]/40",
              borderColor,
            )}
          >
            New Account
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td
              className={clsx(
                "border px-2 py-2 text-slate-700 font-bold bg-slate-50/30",
                borderColor,
              )}
            >
              {row.label}
            </td>
            <td
              className={clsx(
                "border px-2 py-2 text-slate-600 bg-[#f7f2f2]/20",
                row.isUpper && "uppercase",
                row.isMono && "font-mono",
                borderColor,
              )}
            >
              {row.old}
            </td>
            <td
              className={clsx(
                "border px-2 py-2 text-slate-900 font-medium bg-[#ebf6eb]/20",
                row.isUpper && "uppercase",
                row.isMono && "font-mono",
                borderColor,
              )}
            >
              {row.updated}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const primaryFilterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Search Date", icon: Calendar },
  { key: "storeName", type: "input", label: "Store Name" },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Approved", value: "Approved" },
      { label: "Pending", value: "Pending" },
      { label: "Rejected", value: "Rejected" },
    ],
  },
];

export default function ManageAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Action Drawer state ────────────────────────────────────────────────────
  const [actionState, setActionState] = useState<{
    item: AccountChangeRequest;
    type: "approve" | "reject";
  } | null>(null);
  const [remarks, setRemarks] = useState("");

  const openAction = (
    item: AccountChangeRequest,
    type: "approve" | "reject",
  ) => {
    setActionState({ item, type });
    setRemarks("");
  };

  const closeAction = () => {
    setActionState(null);
    setRemarks("");
  };

  const handleSubmitAction = () => {
    if (!actionState) return;
    const { item, type } = actionState;
    if (type === "approve") {
      toast.success(`Request #${item.id} approved successfully!`, {
        icon: "✅",
        duration: 3000,
      });
    } else {
      toast.error(`Request #${item.id} rejected.`, {
        icon: "❌",
        duration: 3000,
      });
    }
    closeAction();
  };

  // Sync filters with URL
  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    if (params.date_preset) {
      params.date = {
        preset: params.date_preset,
        from: params.date_from,
        to: params.date_to,
      };
    }
    return params;
  }, [searchParams]);

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(filters);

  // Sync local filters when URL params change (e.g., via clear or external nav)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setSearchParams(() => {
      const next = new URLSearchParams();
      Object.entries(localFilters).forEach(([key, value]) => {
        if (key === "date") {
          if (value && value.preset && value.preset !== "all") {
            next.set("date_preset", value.preset);
            if (value.from) next.set("date_from", value.from);
            if (value.to) next.set("date_to", value.to);
          }
        } else {
          if (value && value !== "all") {
            next.set(key, String(value));
          }
        }
      });
      return next;
    });
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchParams({});
  };

  const hasUnappliedChanges = useMemo(
    () => JSON.stringify(localFilters) !== JSON.stringify(filters),
    [localFilters, filters],
  );

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      // Date Filter
      if (filters.date_preset) {
        const itemDate = new Date(item.requestedOn);
        const today = new Date();
        let fromDate = new Date(0);
        let toDate = new Date();

        switch (filters.date_preset) {
          case "today":
            fromDate = new Date(today.setHours(0, 0, 0, 0));
            toDate = new Date(today.setHours(23, 59, 59, 999));
            break;
          case "last_day":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 1);
            fromDate.setHours(0, 0, 0, 0);
            toDate = new Date(fromDate);
            toDate.setHours(23, 59, 59, 999);
            break;
          case "7d":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 7);
            break;
          case "30d":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 30);
            break;
          case "custom":
            if (filters.date_from) fromDate = new Date(filters.date_from);
            if (filters.date_to) {
              toDate = new Date(filters.date_to);
              toDate.setHours(23, 59, 59, 999);
            }
            break;
        }
        if (itemDate < fromDate || itemDate > toDate) return false;
      }

      // Store Name
      if (
        filters.storeName &&
        !item.storeName.toLowerCase().includes(filters.storeName.toLowerCase())
      ) {
        return false;
      }

      // Status
      if (
        filters.status &&
        filters.status !== "all" &&
        item.status !== filters.status
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = ["Store Name", "Requested By", "Requested On", "Status"];
    const rows = filteredData.map((item) => [
      item.storeName,
      item.requestedBy,
      item.requestedOn,
      item.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "account_requests_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<AccountChangeRequest>[] = [
    {
      accessorKey: "storeName",
      header: "Store Name",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700">
          {row.original.storeName}
        </span>
      ),
    },
    {
      id: "accountComparison",
      header: "Account Details Comparison (Old vs New)",
      meta: { className: "p-0 align-top bg-slate-50/30" },
      cell: ({ row }) => (
        <AccountComparisonTable
          old={row.original.oldAccount}
          updated={row.original.newAccount}
          borderColor="border-slate-300"
        />
      ),
    },
    {
      id: "requestedInfo",
      header: "Requested On",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs space-y-1 min-w-[150px]">
          <div className="text-slate-700">{row.original.requestedOn}</div>
          <div className="text-slate-700">-</div>
          <div className="text-slate-700">{row.original.requestedBy}</div>
          {row.original.requestRemarks && (
            <div className="mt-1 p-1.5 bg-slate-50 rounded text-slate-600 italic border border-slate-100">
              "{row.original.requestRemarks}"
            </div>
          )}
        </div>
      ),
    },
    {
      id: "approvedInfo",
      header: "Approved On",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs space-y-1 min-w-[150px]">
          {/* Using requestedOn as a placeholder if approvedOn is missing in some mock data, but usually approvedOn exists */}
          <div className="text-slate-700">{row.original.approvedOn}</div>
          <div className="text-slate-700">-</div>
          <div className="text-slate-700">{row.original.approvedBy}</div>
          {row.original.approvalRemarks && (
            <div className="mt-1 p-1.5 bg-emerald-50 rounded text-emerald-700 italic border border-emerald-100">
              "{row.original.approvalRemarks}"
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={clsx(
            "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
            getAccountStatusBadgeClass(row.original.status),
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        if (row.original.status === "Pending") {
          return (
            <div className="flex items-center gap-1.5">
              {/* Approve icon button */}
              <button
                onClick={() => openAction(row.original, "approve")}
                title="Approve"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all active:scale-95 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              {/* Reject icon button */}
              <button
                onClick={() => openAction(row.original, "reject")}
                title="Reject"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 transition-all active:scale-95 shadow-sm"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          );
        }
        if (row.original.status === "Approved") {
          return (
            <div className="flex flex-col text-xs space-y-1">
              <span className="text-slate-500">Approved by</span>
              <span className="text-slate-700">{row.original.approvedBy}</span>
            </div>
          );
        }
        return <span className="text-slate-400 font-medium px-2">—</span>;
      },
    },
    {
      id: "placeholder",
      header: "",
      cell: () => null,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Account</h1>
          <p className="text-slate-500 text-sm">
            Review and approve store account change requests
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <FilterBar
              filters={localFilters}
              onFilterChange={handleFilterChange}
              config={primaryFilterConfig}
            />

            <button
              onClick={handleApplyFilters}
              disabled={!hasUnappliedChanges}
              className={clsx(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
                hasUnappliedChanges
                  ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
              )}
            >
              Apply Filters
            </button>

            {Object.keys(localFilters).length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Data Table */}
          <div className="pt-4">
            <DataTable
              columns={columns}
              data={filteredData}
              hideToolbarDateFilter={true}
              className="border-slate-300"
              rowBorderColor="divide-slate-200"
              filterActions={
                <h2 className="text-sm font-semibold text-slate-900 ml-1">
                  Showing account requests data
                </h2>
              }
              toolbarEndContent={
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <Drawer
        open={!!actionState}
        onClose={closeAction}
        title={
          actionState?.type === "approve" ? "Approve Request" : "Reject Request"
        }
        subtitle={actionState?.item.storeName}
        width="lg"
      >
        <div className="space-y-6">
          {/* Remarks */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                actionState?.type === "approve"
                  ? "Add any approval remarks here…"
                  : "Provide a reason for rejection…"
              }
              rows={5}
              className="w-full px-3 py-2.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition placeholder:text-slate-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              onClick={handleSubmitAction}
              className={clsx(
                "w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all active:scale-95 shadow-sm text-white",
                actionState?.type === "approve"
                  ? "bg-primary-600 hover:bg-primary-700"
                  : "bg-rose-500 hover:bg-rose-600",
              )}
            >
              {actionState?.type === "approve"
                ? "Submit Approval"
                : "Submit Rejection"}
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
