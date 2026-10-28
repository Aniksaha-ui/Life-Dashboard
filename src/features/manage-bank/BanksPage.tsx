import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { Download, Search, Info } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { Tooltip } from "../../components/Tooltip";
import type { Bank } from "./types";

const mockBanks: Bank[] = [
  {
    id: "1",
    bankName: "Dutch Bangla",
    bid: "1",
    contactPerson: "Robi",
    phone: "-",
    email: "-",
  },
  {
    id: "2",
    bankName: "Brac bank",
    bid: "2",
    contactPerson: "Zobair",
    phone: "-",
    email: "-",
  },
  {
    id: "3",
    bankName: "ITCL",
    bid: "3",
    contactPerson: "Khorshed",
    phone: "-",
    email: "-",
  },
  {
    id: "4",
    bankName: "City Bank",
    bid: "4",
    contactPerson: "Masud",
    phone: "-",
    email: "-",
  },
  {
    id: "5",
    bankName: "AB Bank",
    bid: "5",
    contactPerson: "Redwan",
    phone: "-",
    email: "-",
  },
  {
    id: "6",
    bankName: "Dbbl Mobile Banking",
    bid: "6",
    contactPerson: "Iftekhar",
    phone: "-",
    email: "-",
  },
  {
    id: "7",
    bankName: "Bank Asia Internet Banking",
    bid: "7",
    contactPerson: "Nazim",
    phone: "-",
    email: "-",
  },
  {
    id: "8",
    bankName: "BKash",
    bid: "8",
    contactPerson: "Iftekhar",
    phone: "-",
    email: "-",
  },
  {
    id: "9",
    bankName: "Islami Bank",
    bid: "9",
    contactPerson: "Iftekhar",
    phone: "-",
    email: "-",
  },
  {
    id: "10",
    bankName: "Mutual Trust Bank Limited",
    bid: "10",
    contactPerson: "Susanta",
    phone: "-",
    email: "-",
  },
  {
    id: "11",
    bankName: "Mercantile Bank Limited",
    bid: "11",
    contactPerson: "susanta",
    phone: "-",
    email: "-",
  },
  {
    id: "12",
    bankName: "Jamuna Bank Limited",
    bid: "12",
    contactPerson: "susanta",
    phone: "-",
    email: "-",
  },
  {
    id: "13",
    bankName: "Eastern Bank Limited",
    bid: "13",
    contactPerson: "susanta",
    phone: "-",
    email: "-",
  },
  {
    id: "14",
    bankName: "Software Shop Limited",
    bid: "14",
    contactPerson: "Iftekhar",
    phone: "-",
    email: "-",
  },
  {
    id: "15",
    bankName: "IFIC Bank Limited",
    bid: "15",
    contactPerson: "susanta",
    phone: "-",
    email: "-",
  },
  {
    id: "16",
    bankName: "Payza",
    bid: "16",
    contactPerson: "Nafis Ehtisham",
    phone: "8801733503157",
    email: "nehtisham@casadatech.com",
  },
  {
    id: "17",
    bankName: "Exim Bank",
    bid: "17",
    contactPerson: "Md. Tahajul Islam",
    phone: "8801717576787",
    email: "tahajul@eximbankbd.com",
  },
  {
    id: "18",
    bankName: "Premier Bank",
    bid: "18",
    contactPerson: "Biplob Mallick",
    phone: "8801716352218",
    email: "biplob.mallick@premierbankltd.com",
  },
  {
    id: "19",
    bankName: "Southeast Bank Limited",
    bid: "19",
    contactPerson: "Mohammad Fakrul Islam",
    phone: "01787661722",
    email: "fakrul@southeastbank.com.bd",
  },
  {
    id: "20",
    bankName: "State Bank of India",
    bid: "20",
    contactPerson: "-",
    phone: "-",
    email: "-",
  },
];

const filterConfig: FilterConfig[] = [
  { key: "bankName", label: "Bank Name", type: "input", icon: Search },
  {
    key: "contactPerson",
    label: "Contact Person",
    type: "input",
    icon: Search,
  },
  { key: "phone", label: "Phone", type: "input", icon: Search },
  { key: "email", label: "Email", type: "input", icon: Search },
];

export default function BanksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync filters with URL
  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // Local buffered state for filters
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setLocalFilters({});
    setSearchParams(new URLSearchParams());
  };

  const filteredData = useMemo(() => {
    return mockBanks.filter((item) => {
      if (
        filters.bankName &&
        !item.bankName.toLowerCase().includes(filters.bankName.toLowerCase())
      )
        return false;
      if (
        filters.contactPerson &&
        !item.contactPerson
          .toLowerCase()
          .includes(filters.contactPerson.toLowerCase())
      )
        return false;
      if (filters.phone && !item.phone.includes(filters.phone)) return false;
      if (
        filters.email &&
        !item.email.toLowerCase().includes(filters.email.toLowerCase())
      )
        return false;
      return true;
    });
  }, [filters]);

  const columns: ColumnDef<Bank>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.index + 1}</span>
      ),
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-slate-800">
          {row.original.bankName}
        </span>
      ),
    },
    {
      accessorKey: "bid",
      header: () => (
        <div className="flex items-center gap-1">
          <span>BID</span>
          <Tooltip content="BANK ID" position="bottom">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.bid}</span>
      ),
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.contactPerson}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.email}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banks</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterBar
          filters={localFilters}
          onFilterChange={handleFilterChange}
          config={filterConfig}
        />

        <button
          onClick={applyFilters}
          disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
            JSON.stringify(localFilters) !== JSON.stringify(filters)
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
          )}
        >
          Apply Filters
        </button>
        <ClearAllFiltersButton onClick={clearFilters} filters={localFilters} />
      </div>

      <div className="flex flex-col">
        <DataTable
          columns={columns}
          data={filteredData}
          hideToolbarDateFilter
          toolbarEndContent={
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm">
              Export
              <Download className="w-4 h-4" />
            </button>
          }
          filterActions={
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 ml-1">
                Showing banks
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {filteredData.length}
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
}
