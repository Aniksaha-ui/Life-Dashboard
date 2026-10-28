import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Download } from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import type { FilterConfig } from "../../components/FilterBar";
import type { ColumnDef } from "@tanstack/react-table";

// --- Mock Data Types ---
interface Slab {
  sl: number;
  minAmt: number;
  commission: number;
  bankComm: number;
}

function getCommissionStatusBadgeClass(status: string) {
  switch (status) {
    case "Success":
      return "bg-emerald-50 text-emerald-600";
    case "Rejected":
      return "bg-rose-50 text-rose-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

interface CommissionRequest {
  id: string;
  storeName: string;
  cardType: string;

  // Merchant TDR Details
  tdrPercent: number | string;
  bankCommission: number | string;
  bankBonus: number | string;
  maxSlabAmount: number | string;
  slabEnabled: boolean;
  slabs: Slab[];

  // Reseller Info
  resellerCommPercent: number | string;
  resellerBankCommPercent: number | string;

  // Meta
  requestedBy: string;
  requestedOn: string;
  approvedBy: string;
  approvedOn: string;
  status: "Success" | "Pending" | "Rejected";
}

// --- Mock Data ---
const MOCK_DATA: CommissionRequest[] = [
  {
    id: "1",
    storeName: "demotest",
    cardType: "City Bank CITY BANK",
    tdrPercent: "2.50 -> 2.050000",
    bankCommission: "1.30 -> 1.25",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.25",
    resellerBankCommPercent: "0.10",
    requestedBy: "admin kam",
    requestedOn: "2024-11-04 12:40:12",
    approvedBy: "iqbal kam",
    approvedOn: "2024-12-16 14:04:12",
    status: "Success",
  },
  {
    id: "2",
    storeName: "demotest",
    cardType: "BKash BKASH",
    tdrPercent: "2.5 -> 2.000000",
    bankCommission: "1.50 -> 1.10",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.25",
    resellerBankCommPercent: "0.10",
    requestedBy: "admin kam",
    requestedOn: "2024-04-03 12:35:07",
    approvedBy: "admin kam",
    approvedOn: "2024-12-16 14:05:07",
    status: "Success",
  },
  {
    id: "3",
    storeName: "demotest",
    cardType: "BKash BKASH",
    tdrPercent: "1.5 -> 1.000000",
    bankCommission: "1.50 -> 1.10",
    bankBonus: "0.10",
    maxSlabAmount: "1,500.00",
    slabEnabled: true,
    slabs: [
      { sl: 1, minAmt: 1000.0, commission: 2.0, bankComm: 1.1 },
      { sl: 2, minAmt: 5000.0, commission: 1.8, bankComm: 1.1 },
      { sl: 3, minAmt: 10000.0, commission: 1.5, bankComm: 1.1 },
    ],
    resellerCommPercent: "0.25",
    resellerBankCommPercent: "0.10",
    requestedBy: "admin kam",
    requestedOn: "2025-02-04 11:13:06",
    approvedBy: "admin kam",
    approvedOn: "2025-02-04 11:15:01",
    status: "Success",
  },
  {
    id: "4",
    storeName: "IqbalWalletShop09live",
    cardType: "CashBaba ACC",
    tdrPercent: "2.10 -> 2.050000",
    bankCommission: "1.40",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.25",
    resellerBankCommPercent: "0.10",
    requestedBy: "Iqbal Hossain",
    requestedOn: "2025-01-24 17:06:16",
    approvedBy: "Iqbal Hossain",
    approvedOn: "2025-01-24 17:06:16",
    status: "Success",
  },
  {
    id: "5",
    storeName: "ivacbdlive",
    cardType: "Brac bank VISA",
    tdrPercent: "3.50 -> 3.000000",
    bankCommission: "1.80",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "Sajan Poddar",
    requestedOn: "2025-01-24 17:16:05",
    approvedBy: "Sajan Poddar",
    approvedOn: "2025-01-24 17:16:05",
    status: "Success",
  },
  {
    id: "6",
    storeName: "ivacbdlive",
    cardType: "Brac bank VISA",
    tdrPercent: "3.40 -> 3.000000",
    bankCommission: "1.70",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "Sajan Poddar",
    requestedOn: "2025-01-24 17:16:00",
    approvedBy: "Sajan Poddar",
    approvedOn: "2025-01-24 17:16:00",
    status: "Success",
  },
  {
    id: "7",
    storeName: "Uatdokantlive",
    cardType: "REGULR NPSB",
    tdrPercent: "1.5 -> 1.150000",
    bankCommission: "1.00",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "Iqbal Hossain",
    requestedOn: "2025-01-24 15:38:50",
    approvedBy: "Iqbal Hossain",
    approvedOn: "2025-01-24 15:38:50",
    status: "Success",
  },
  {
    id: "8",
    storeName: "Uatdokantlive",
    cardType: "REGULR NPSB",
    tdrPercent: "1.25 -> 1.150000",
    bankCommission: "0.90",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "Iqbal Hossain",
    requestedOn: "2025-01-24 15:36:40",
    approvedBy: "Iqbal Hossain",
    approvedOn: "2025-01-24 15:36:40",
    status: "Success",
  },
  {
    id: "9",
    storeName: "Uatdokantlive",
    cardType: "MEGHNA NPSB",
    tdrPercent: "2.05 -> 1.150000",
    bankCommission: "1.30",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "Iqbal Hossain",
    requestedOn: "2025-01-24 15:36:12",
    approvedBy: "Iqbal Hossain",
    approvedOn: "2025-01-24 15:36:12",
    status: "Success",
  },
  {
    id: "10",
    storeName: "Uatdokantlive",
    cardType: "MEGHNA NPSB",
    tdrPercent: "1.50 -> 1.150000",
    bankCommission: "1.00",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "Iqbal Hossain",
    requestedOn: "2025-01-24 15:36:12",
    approvedBy: "Iqbal Hossain",
    approvedOn: "2025-01-24 15:36:12",
    status: "Success",
  },
  {
    id: "11",
    storeName: "IqbalWalletShop09live",
    cardType: "MEGHNA NPSB",
    tdrPercent: "2.15 -> 1.150000",
    bankCommission: "1.50",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.25",
    resellerBankCommPercent: "0.10",
    requestedBy: "Iqbal Hossain",
    requestedOn: "2025-01-24 11:47:56",
    approvedBy: "Iqbal Hossain",
    approvedOn: "2025-01-24 11:47:56",
    status: "Success",
  },
  {
    id: "12",
    storeName: "IqbalWalletShop09live",
    cardType: "MEGHNA NPSB",
    tdrPercent: "1.25 -> 1.150000",
    bankCommission: "0.85",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.25",
    resellerBankCommPercent: "0.10",
    requestedBy: "Iqbal Hossain",
    requestedOn: "2025-01-24 11:44:17",
    approvedBy: "Iqbal Hossain",
    approvedOn: "2025-01-24 11:44:17",
    status: "Success",
  },
  {
    id: "13",
    storeName: "Uatdokantlive",
    cardType: "ISLAMI NPSB",
    tdrPercent: "1.45 -> 1.150000",
    bankCommission: "1.10",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "admin kam",
    requestedOn: "2024-11-21 12:43:08",
    approvedBy: "admin kam",
    approvedOn: "2024-11-22 13:43:42",
    status: "Success",
  },
  {
    id: "14",
    storeName: "Eternal Border of Empire",
    cardType: "hostedcheckout0livephy VISA",
    tdrPercent: "3.50 -> 3.000000",
    bankCommission: "1.80",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "admin kam",
    requestedOn: "2024-10-24 14:38:12",
    approvedBy: "admin kam",
    approvedOn: "2024-10-25 15:23:42",
    status: "Success",
  },
  {
    id: "15",
    storeName: "Eternal Border of Empire",
    cardType: "hostedcheckout0livephy VISA",
    tdrPercent: "2.15 -> 2.050000",
    bankCommission: "1.30",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "admin kam",
    requestedOn: "2024-10-24 14:28:42",
    approvedBy: "admin kam",
    approvedOn: "2024-10-25 15:23:42",
    status: "Success",
  },
  {
    id: "16",
    storeName: "Eternal Border of Empire",
    cardType: "hostedcheckout0livephy VISA",
    tdrPercent: "1.65 -> 1.150000",
    bankCommission: "0.95",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "admin kam",
    requestedOn: "2024-10-24 14:27:12",
    approvedBy: "admin kam",
    approvedOn: "2024-10-25 15:23:42",
    status: "Success",
  },
  {
    id: "17",
    storeName: "Eternal Border of Empire",
    cardType: "hostedcheckout0livephy VISA",
    tdrPercent: "3.50 -> 3.000000",
    bankCommission: "1.80",
    bankBonus: "0.10",
    maxSlabAmount: "0.00",
    slabEnabled: false,
    slabs: [],
    resellerCommPercent: "0.15",
    resellerBankCommPercent: "0.05",
    requestedBy: "admin kam",
    requestedOn: "2024-10-24 12:23:38",
    approvedBy: "admin kam",
    approvedOn: "2024-10-25 15:23:42",
    status: "Success",
  },
];

// --- Components ---

// --- Filter Config ---
const primaryFilterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Search Date", icon: Calendar },
  { key: "storeName", type: "input", label: "Store Name" },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Success", value: "Success" },
      { label: "Pending", value: "Pending" },
      { label: "Rejected", value: "Rejected" },
    ],
  },
];

export default function ApproveStoreCommissionPage() {
  const [searchParams, setSearchParams] = useSearchParams();

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
    const headers = [
      "Store Name",
      "Card Type",
      "TDR %",
      "Bank Comm %",
      "Bank Bonus %",
      "Request By",
      "Request On",
      "Status",
    ];
    const rows = filteredData.map((item) => [
      item.storeName,
      item.cardType,
      item.tdrPercent,
      item.bankCommission,
      item.bankBonus,
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
    link.setAttribute("download", "commission_requests_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<CommissionRequest>[] = [
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
      accessorKey: "cardType",
      header: "Card Type",
      cell: ({ row }) => {
        const value = row.original.cardType;
        const words = value.split(" ");

        if (words.length <= 1) {
          return (
            <span className="text-xs font-semibold text-slate-700">
              {value}
            </span>
          );
        }

        const lastWord = words.pop();
        const remaining = words.join(" ");

        return (
          <div className="flex flex-col text-xs leading-relaxed">
            <span className="font-medium text-slate-500 line-clamp-1">
              {remaining}
            </span>
            <span className="font-bold text-slate-900 uppercase">
              {lastWord}
            </span>
          </div>
        );
      },
    },
    {
      id: "merchantTdr",
      header: "Merchant TDR",
      meta: { className: "bg-[#f7f2f2]/35 p-0 align-top" },
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="p-4">
            <div className="grid grid-cols-[auto_1fr] gap-x-1.5 gap-y-1 whitespace-nowrap text-xs leading-relaxed">
              <span className="text-slate-700">TDR:</span>{" "}
              <span className="font-medium">{data.tdrPercent}%</span>
              <span className="text-slate-700">Bank Comm:</span>{" "}
              <span className="font-medium">{data.bankCommission}%</span>
              <span className="text-slate-700">Bank Bonus:</span>{" "}
              <span className="font-medium">{data.bankBonus}%</span>
              <span className="text-slate-700">Max Slab Amt:</span>{" "}
              <span className="font-medium">{data.maxSlabAmount}</span>
              <span className="text-slate-700">Slab Status:</span>
              <span
                className={clsx(
                  "font-semibold",
                  data.slabEnabled ? "text-emerald-600" : "text-slate-700",
                )}
              >
                {data.slabEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {data.slabEnabled && data.slabs.length > 0 && (
              <div className="mt-2 border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-center bg-slate-50 text-xs">
                  <thead className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-1 px-1 border-r border-slate-200">
                        SL
                      </th>
                      <th className="py-1 px-1 border-r border-slate-200">
                        MIN AMT
                      </th>
                      <th className="py-1 px-1 border-r border-slate-200">
                        Comm
                      </th>
                      <th className="py-1 px-1">Bank Comm</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {data.slabs.map((slab, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-0.5 px-1 border-r border-slate-100">
                          {slab.sl}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-100">
                          {slab.minAmt}
                        </td>
                        <td className="py-0.5 px-1 border-r border-slate-100">
                          {slab.commission}%
                        </td>
                        <td className="py-0.5 px-1">{slab.bankComm}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-[10px] text-slate-600 italic p-1 bg-slate-50 text-center border-t border-slate-200">
                  (After then % calculated if slab is enabled)
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "resellerComm",
      header: "Reseller Comm",
      cell: ({ row }) => (
        <div className="text-xs space-y-1 leading-relaxed">
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Reseller:</span>
            <span className="font-medium">
              {row.original.resellerCommPercent}%
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Bank:</span>
            <span className="font-medium">
              {row.original.resellerBankCommPercent}%
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "requestedBy",
      header: "Request By",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs leading-relaxed">
          <span className="font-medium text-slate-500">
            {row.original.requestedBy}
          </span>
          <span className="text-slate-600">{row.original.requestedOn}</span>
        </div>
      ),
    },
    {
      id: "approvedBy",
      header: "Approval By",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs leading-relaxed">
          <span className="font-medium text-slate-500">
            {row.original.approvedBy}
          </span>
          <span className="text-slate-600">{row.original.approvedOn}</span>
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
            getCommissionStatusBadgeClass(row.original.status),
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: () => <span className="text-slate-400">-</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Approve Store Commission
        </h1>
        <p className="text-slate-500 text-sm">
          Manage and approve store commission tiers
        </p>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col">
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
                Showing commission data
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
  );
}
