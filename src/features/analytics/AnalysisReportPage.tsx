import { useState, useMemo } from "react";
import {
  Search,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { Drawer } from "../../components/Drawer";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { CopyButton } from "../../components/CopyButton";
import { AnalysisReportConfigDrawer } from "./AnalysisReportConfigDrawer";
import type { ColumnDef } from "@tanstack/react-table";
import sslLogo from "../../assets/logo_ssl_commerz.svg";
import { Settings } from "lucide-react";

// --- Types ---
interface AnalysisReportEntry {
  index: number;
  storeId: string;
  merchantName: string;
  analysisName: string;
  analysisValue: string;
  isAlert: number;
  startTime: string;
  endTime: string;
  mailTo: string;
  createdAt: string;
}

// --- Mock Data ---
const MOCK_DATA: AnalysisReportEntry[] = [
  {
    index: 33,
    storeId: "easyapp",
    merchantName: "Easy App Solutions",
    analysisName: "No of international trans",
    analysisValue: '{"international":0}',
    isAlert: 0,
    startTime: "2019-10-01 10:10:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "ahmed.reza@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
  {
    index: 32,
    storeId: "easyapp",
    merchantName: "Easy App Solutions",
    analysisName: "No of Failed Transaction",
    analysisValue: '{"failed":0}',
    isAlert: 0,
    startTime: "2019-10-01 10:10:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "ahmed.reza@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
  {
    index: 31,
    storeId: "easyapp",
    merchantName: "Easy App Solutions",
    analysisName: "No of international Trans Failed",
    analysisValue: '{"international_failed":0}',
    isAlert: 0,
    startTime: "2019-10-01 00:50:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "ahmed.reza@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
  {
    index: 30,
    storeId: "easyapp",
    merchantName: "Easy App Solutions",
    analysisName: "No of success",
    analysisValue: '{"success":0}',
    isAlert: 0,
    startTime: "2019-10-01 10:50:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "ahmed.reza@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
  {
    index: 29,
    storeId: "demotest",
    merchantName: "Demo Test Store",
    analysisName: "No of international trans",
    analysisValue: '{"international":0}',
    isAlert: 0,
    startTime: "2019-10-01 10:10:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "kam@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
  {
    index: 28,
    storeId: "demotest",
    merchantName: "Demo Test Store",
    analysisName: "No of Failed Transaction",
    analysisValue: '{"failed":0}',
    isAlert: 0,
    startTime: "2019-10-01 10:10:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "kam@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
  {
    index: 27,
    storeId: "demotest",
    merchantName: "Demo Test Store",
    analysisName: "No of international Trans Failed",
    analysisValue: '{"international_failed":0}',
    isAlert: 0,
    startTime: "2019-10-01 00:50:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "kam@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
  {
    index: 26,
    storeId: "demotest",
    merchantName: "Demo Test Store",
    analysisName: "No of success",
    analysisValue: '{"success":0}',
    isAlert: 0,
    startTime: "2019-10-01 10:50:00",
    endTime: "2019-10-02 10:10:00",
    mailTo: "kam@sslcommerz.com",
    createdAt: "2026-01-08 10:06:31",
  },
];

const filterConfigs: FilterConfig[] = [
  { key: "searchTo", type: "date-range", label: "Search To", icon: Search },
  { key: "storeId", type: "input", label: "Store ID", icon: Building2 },
  { key: "mailTo", type: "input", label: "Mail To", icon: Mail },
];

export default function AnalysisReportPage() {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [selectedItem, setSelectedItem] = useState<AnalysisReportEntry | null>(
    null,
  );
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);

  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setAppliedFilters({});
  };

  const columns: ColumnDef<AnalysisReportEntry>[] = [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-slate-500">
          {row.original.index}
        </span>
      ),
    },
    {
      id: "analysisPeriod",
      header: "Analysis Period",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter w-8">
              Start:
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {row.original.startTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter w-8">
              End:
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {row.original.endTime}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 whitespace-nowrap">
          {row.original.createdAt}
        </span>
      ),
    },
    {
      accessorKey: "merchantName",
      header: "Merchant",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-normal text-slate-600 leading-tight">
            {row.original.merchantName}
          </span>
          <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1">
            {row.original.storeId}
            <CopyButton value={row.original.storeId} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "analysisName",
      header: "Analysis Name",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.original.analysisName}
        </span>
      ),
    },
    {
      accessorKey: "analysisValue",
      header: "Analysis Value",
      cell: ({ row }) => (
        <code className="text-[11px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-primary-600 font-mono">
          {row.original.analysisValue}
        </code>
      ),
    },
    {
      accessorKey: "isAlert",
      header: "Is Alert",
      cell: ({ row }) => (
        <span
          className={clsx(
            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
            row.original.isAlert === 1
              ? "bg-rose-100 text-rose-600"
              : "bg-slate-100 text-slate-400",
          )}
        >
          {row.original.isAlert}
        </span>
      ),
    },
    {
      accessorKey: "mailTo",
      header: "Mail To",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.mailTo}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Mail Body",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedItem(row.original)}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Details
        </button>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      if (
        appliedFilters.storeId &&
        !item.storeId
          .toLowerCase()
          .includes(appliedFilters.storeId.toLowerCase())
      )
        return false;
      if (
        appliedFilters.mailTo &&
        !item.mailTo.toLowerCase().includes(appliedFilters.mailTo.toLowerCase())
      )
        return false;

      if (appliedFilters.searchTo && appliedFilters.searchTo.preset !== "all") {
        const itemDate = new Date(item.startTime);
        if (appliedFilters.searchTo.preset === "custom") {
          if (appliedFilters.searchTo.from) {
            const fromDate = new Date(appliedFilters.searchTo.from);
            if (itemDate < fromDate) return false;
          }
          if (appliedFilters.searchTo.to) {
            const toDate = new Date(appliedFilters.searchTo.to);
            toDate.setHours(23, 59, 59, 999);
            if (itemDate > toDate) return false;
          }
        }
      }

      return true;
    });
  }, [appliedFilters]);

  const hasUnappliedChanges =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  return (
    <div className="min-h-screen space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to="/analytics"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          Reports
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-medium">Analysis Report</span>
      </nav>

      {/* Main Report Card Wrapper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Filters */}
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Analysis Report
              </h1>
              <p className="text-slate-500 text-sm mt-0.5 font-medium italic">
                Detailed investigation of transaction data and merchant metrics.
              </p>
            </div>
            <button
              onClick={() => setIsConfigDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-full bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 transition-all shadow-sm active:scale-95 self-start md:self-auto"
            >
              <Settings className="w-4 h-4" />
              Configure Analysis
            </button>
          </div>

          {/* FilterBar Section */}
          <div className="flex items-center gap-3 flex-wrap">
            <FilterBar
              config={filterConfigs}
              filters={localFilters}
              onFilterChange={handleLocalFilterChange}
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
            <ClearAllFiltersButton
              onClick={handleClearFilters}
              filters={localFilters}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="p-6">
          <DataTable
            columns={columns}
            data={filteredData}
            hideToolbarDateFilter={true}
            hideViewColumn={true}
            className="bg-transparent border-none shadow-none"
            rowBorderColor="divide-slate-50"
          />
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Mail Content"
        width="xl"
      >
        {/* ... existing mail content drawer ... */}
        {selectedItem && (
          <div className="bg-[#f8f9fa] -m-6 min-h-full flex flex-col">
            {/* Header Image */}
            <div className="bg-white py-8 flex justify-center border-b border-slate-100">
              <img src={sslLogo} alt="SSLCommerz" className="h-12 w-auto" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
              {/* Summary Sentence */}
              <p className="text-slate-500 font-medium text-center text-sm">
                Store Id ( {selectedItem.storeId} ) Analysis Report(
                {selectedItem.analysisName.match(/\((.*?)\)/)?.[1] || "general"}
                ) Info ( {selectedItem.startTime} To {selectedItem.endTime} )
              </p>

              {/* Info Table */}
              <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-sm">
                <table className="w-full text-sm border-collapse">
                  <tbody className="divide-y divide-slate-300">
                    <tr>
                      <td className="w-1/3 px-4 py-3 bg-[#f1f3f5] text-slate-900 font-bold border-r border-slate-300">
                        Store Id
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {selectedItem.storeId}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-[#f1f3f5] text-slate-900 font-bold border-r border-slate-300">
                        Start Time
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {selectedItem.startTime}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-[#f1f3f5] text-slate-900 font-bold border-r border-slate-300">
                        End Time
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {selectedItem.endTime}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-[#f1f3f5] text-slate-900 font-bold border-r border-slate-300">
                        Analysis Name
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {selectedItem.analysisName}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 bg-[#f1f3f5] text-slate-900 font-bold border-r border-slate-300">
                        Analysis Value
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        <code className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-mono text-xs">
                          {selectedItem.analysisValue}
                        </code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-auto py-12 px-8 border-t border-slate-200">
              <div className="max-w-md mx-auto space-y-3 text-center">
                <p className="text-slate-500 font-medium text-[12px]">
                  93 B, New Eskaton Road, Dhaka-1000
                </p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-500 font-medium text-[12px]">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> +880-9612-226969,
                    +880-2-8316969
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-500 font-medium text-[12px]">
                  <span className="flex items-center gap-1.5 text-primary-600 hover:underline cursor-pointer">
                    <Mail className="w-3.5 h-3.5" /> support@sslcommerz.com
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-500 font-medium text-[12px]">
                  <span className="flex items-center gap-1.5 text-primary-600 hover:underline cursor-pointer">
                    <Globe className="w-3.5 h-3.5" /> www.sslcommerz.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Analysis Config Drawer */}
      <AnalysisReportConfigDrawer
        open={isConfigDrawerOpen}
        onClose={() => setIsConfigDrawerOpen(false)}
      />
    </div>
  );
}
