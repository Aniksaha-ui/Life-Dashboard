import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
  Download,
  Search,
  Info,
  AlertCircle,
  Calendar,
  Sheet,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { FilterBar, type FilterConfig } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import { MetricCard } from "../../components/MetricCard";
import { Tooltip } from "../../components/Tooltip";
import { toast } from "react-hot-toast";
import type { CardType } from "./types";

const mockCardTypes: CardType[] = [
  {
    id: "1",
    cid: "1",
    bankName: "Dutch Bangla",
    bid: "1",
    cardType: "VISA",
    startDigit: "4",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "VISACARD",
    status: "Active",
  },
  {
    id: "2",
    cid: "2",
    bankName: "Dutch Bangla",
    bid: "1",
    cardType: "MASTER",
    startDigit: "5",
    bankComm: 2.2,
    merchantComm: 2.5,
    gwType: "MASTERCARD",
    status: "Active",
  },
  {
    id: "3",
    cid: "3",
    bankName: "Dutch Bangla",
    bid: "1",
    cardType: "NEXUS",
    startDigit: "1",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "OTHERCARD",
    status: "Active",
  },
  {
    id: "4",
    cid: "4",
    bankName: "Brac bank",
    bid: "2",
    cardType: "VISA",
    startDigit: "4",
    bankComm: 1.7,
    merchantComm: 2.5,
    gwType: "VISACARD",
    status: "Active",
  },
  {
    id: "5",
    cid: "5",
    bankName: "Brac bank",
    bid: "2",
    cardType: "MASTER",
    startDigit: "5",
    bankComm: 1.7,
    merchantComm: 2.5,
    gwType: "MASTERCARD",
    status: "Active",
  },
  {
    id: "6",
    cid: "8",
    bankName: "Brac bank",
    bid: "2",
    cardType: "WALLET",
    startDigit: "1",
    bankComm: 1.95,
    merchantComm: 2.5,
    gwType: "CARD",
    status: "Active",
  },
  {
    id: "7",
    cid: "9",
    bankName: "ITCL",
    bid: "3",
    cardType: "QCASH",
    startDigit: "7",
    bankComm: 3,
    merchantComm: 4,
    gwType: "OTHERCARD",
    status: "Active",
  },
  {
    id: "8",
    cid: "10",
    bankName: "City Bank",
    bid: "4",
    cardType: "CITYBANKIB",
    startDigit: "C",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "IB",
    status: "Active",
  },
  {
    id: "9",
    cid: "11",
    bankName: "AB Bank",
    bid: "5",
    cardType: "ABBANKIB",
    startDigit: "A",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "MOBILE",
    status: "Active",
  },
  {
    id: "10",
    cid: "12",
    bankName: "Dbbl Mobile Banking",
    bid: "6",
    cardType: "DBBLMOBILEB",
    startDigit: "M",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "MOBILE",
    status: "Active",
  },
  {
    id: "11",
    cid: "13",
    bankName: "Bank Asia Internet Banking",
    bid: "7",
    cardType: "BANKASIA",
    startDigit: "B",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "IB",
    status: "Active",
  },
  {
    id: "12",
    cid: "14",
    bankName: "BKash",
    bid: "8",
    cardType: "BKASH",
    startDigit: "K",
    bankComm: 1.5,
    merchantComm: 2.5,
    gwType: "MOBILE",
    status: "Active",
  },
  {
    id: "13",
    cid: "15",
    bankName: "Islami Bank",
    bid: "9",
    cardType: "IBBL",
    startDigit: "I",
    bankComm: 1.5,
    merchantComm: 2.5,
    gwType: "IB",
    status: "Active",
  },
  {
    id: "14",
    cid: "16",
    bankName: "Mutual Trust Bank Limited",
    bid: "10",
    cardType: "MTBL",
    startDigit: "T",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "IB",
    status: "Active",
  },
  {
    id: "15",
    cid: "17",
    bankName: "Dutch Bangla",
    bid: "1",
    cardType: "NEXUS",
    startDigit: "0",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "OTHERCARD",
    status: "Active",
  },
  {
    id: "16",
    cid: "18",
    bankName: "City Bank",
    bid: "4",
    cardType: "VISA",
    startDigit: "4",
    bankComm: 1.95,
    merchantComm: 2.5,
    gwType: "VISACARD",
    status: "Active",
  },
  {
    id: "17",
    cid: "19",
    bankName: "City Bank",
    bid: "4",
    cardType: "MASTER",
    startDigit: "5",
    bankComm: 1.95,
    merchantComm: 2.5,
    gwType: "MASTERCARD",
    status: "Active",
  },
  {
    id: "18",
    cid: "20",
    bankName: "City Bank",
    bid: "4",
    cardType: "AMEX",
    startDigit: "3",
    bankComm: 2.45,
    merchantComm: 3.5,
    gwType: "AMEXCARD",
    status: "Active",
  },
  {
    id: "19",
    cid: "21",
    bankName: "Mercantile Bank Limited",
    bid: "11",
    cardType: "MYCASH",
    startDigit: "M",
    bankComm: 1.5,
    merchantComm: 2.5,
    gwType: "MOBILE",
    status: "Active",
  },
  {
    id: "20",
    cid: "22",
    bankName: "Jamuna Bank Limited",
    bid: "12",
    cardType: "JBL",
    startDigit: "J",
    bankComm: 1,
    merchantComm: 2.5,
    gwType: "MOBILE",
    status: "Active",
  },
];

const bankOptions = [
  { label: "All Banks", value: "all" },
  { label: "Dutch Bangla", value: "Dutch Bangla" },
  { label: "Brac bank", value: "Brac bank" },
  { label: "ITCL", value: "ITCL" },
  { label: "City Bank", value: "City Bank" },
  { label: "AB Bank", value: "AB Bank" },
  { label: "Dbbl Mobile Banking", value: "Dbbl Mobile Banking" },
];

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-600";
    case "Inactive":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

const primaryFilterConfig: FilterConfig[] = [
  { key: "cid", label: "CID", type: "input", icon: Search },
  { key: "bankName", label: "Bank Name", type: "select", options: bankOptions },
  { key: "cardType", label: "Card Type", type: "input", icon: Search },
  { key: "status", label: "Status", type: "select", options: statusOptions },
];

const advancedFilterConfig: FilterConfig[] = [
  { key: "startDigit", label: "Start Digit", type: "input", icon: Search },
  { key: "bankComm", label: "Bank Comm.", type: "input", icon: Search },
  { key: "merchantComm", label: "Merchant Comm.", type: "input", icon: Search },
  { key: "gwType", label: "GW Type", type: "input", icon: Search },
];

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const FormField = ({
  label,
  name,
  formData,
  handleChange,
  errors = {},
  type = "text",
  helper,
  options,
  multiline,
  disabled,
  isRadio,
  required,
}: any) => {
  const hasError = !!errors[name];

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
        {required && <span className="text-rose-500">*</span>}
        {label}
      </label>

      {isRadio ? (
        <div className="flex gap-6 mt-2">
          {options.map((opt: string) => (
            <label
              key={opt}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={formData[name] === opt}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                {opt}
              </span>
            </label>
          ))}
        </div>
      ) : type === "select" ? (
        <select
          name={name}
          value={formData[name] as string}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((opt: any) => (
            <option
              key={typeof opt === "string" ? opt : opt.value}
              value={typeof opt === "string" ? opt : opt.value}
            >
              {typeof opt === "string" ? opt : opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={formData[name] as string}
          onChange={handleChange}
          rows={3}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] as string}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
      )}

      {helper && (
        <p className="mt-1 text-[11px] text-slate-500 italic flex items-start gap-1 leading-normal">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {helper}
        </p>
      )}
      {hasError && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default function CardTypesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(
    null,
  );
  const [localData, setLocalData] = useState<CardType[]>(mockCardTypes);

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

  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== "" && value !== "all") {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchParams(new URLSearchParams());
  };

  const hasUnappliedChanges =
    JSON.stringify(localFilters) !== JSON.stringify(filters);

  const filteredData = useMemo(() => {
    return localData.filter((item) => {
      if (
        filters.cid &&
        !item.cid.toLowerCase().includes(filters.cid.toLowerCase())
      )
        return false;
      if (filters.bankName && item.bankName !== filters.bankName) return false;
      if (
        filters.cardType &&
        !item.cardType.toLowerCase().includes(filters.cardType.toLowerCase())
      )
        return false;
      if (
        filters.startDigit &&
        !item.startDigit
          .toLowerCase()
          .includes(filters.startDigit.toLowerCase())
      )
        return false;
      if (filters.bankComm && !String(item.bankComm).includes(filters.bankComm))
        return false;
      if (
        filters.merchantComm &&
        !String(item.merchantComm).includes(filters.merchantComm)
      )
        return false;
      if (
        filters.gwType &&
        !item.gwType.toLowerCase().includes(filters.gwType.toLowerCase())
      )
        return false;
      if (filters.status && item.status !== filters.status) return false;
      return true;
    });
  }, [localData, filters]);

  const metrics = useMemo(() => {
    return {
      total: filteredData.length,
      active: filteredData.filter((item) => item.status === "Active").length,
      inactive: filteredData.filter((item) => item.status !== "Active").length,
      visa: filteredData.filter((item) => item.cardType.includes("VISA"))
        .length,
    };
  }, [filteredData]);

  const activeAdvancedCount = advancedFilterConfig.reduce((acc, config) => {
    const val = localFilters[config.key];
    if (val && val !== "all") return acc + 1;
    return acc;
  }, 0);

  const handleEdit = (cardType: CardType) => {
    setSelectedCardType(cardType);
    setIsEditOpen(true);
  };

  const handleUpdate = (updatedCardType: CardType) => {
    setLocalData((prev) =>
      prev.map((item) =>
        item.id === updatedCardType.id ? updatedCardType : item,
      ),
    );
    setIsEditOpen(false);
    toast.success("Card type updated successfully");
  };

  const columns: ColumnDef<CardType>[] = [
    {
      accessorKey: "cid",
      header: () => (
        <div className="flex items-center gap-1">
          <span>CID</span>
          <Tooltip content="BANK COMMISSION SETUP ID" position="bottom-right">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          </Tooltip>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.cid}</span>
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
      accessorKey: "cardType",
      header: "Card Type",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.cardType}
        </span>
      ),
    },
    {
      accessorKey: "startDigit",
      header: () => (
        <div className="max-[1200px]:whitespace-normal whitespace-nowrap leading-tight max-w-[70px]">
          Start Digit
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.startDigit}
        </span>
      ),
    },
    {
      accessorKey: "bankComm",
      header: () => (
        <div className="max-[1200px]:whitespace-normal whitespace-nowrap leading-tight max-w-[80px]">
          Bank Comm.
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.bankComm}%</span>
      ),
    },
    {
      accessorKey: "merchantComm",
      header: () => (
        <div className="max-[1200px]:whitespace-normal whitespace-nowrap leading-tight max-w-[90px]">
          Merchant Comm.
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.original.merchantComm}%
        </span>
      ),
    },
    {
      accessorKey: "gwType",
      header: "GW Type",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.gwType}
        </span>
      ),
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
          onClick={() => handleEdit(row.original)}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Card Types</h1>
          <p className="text-slate-500 text-sm">
            Manage and configure various card types across supported banks.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleLocalFilterChange}
            config={primaryFilterConfig}
            layout="grid"
          />

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border rounded-full w-fit",
              isAdvancedOpen
                ? "bg-slate-100 text-slate-900 border-slate-200"
                : "bg-white text-slate-600 border-transparent hover:bg-slate-50",
            )}
          >
            Advanced filters
            {activeAdvancedCount > 0 && !isAdvancedOpen && (
              <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary-600 rounded-full">
                {activeAdvancedCount}
              </span>
            )}
            <span
              className={clsx(
                "transition-transform duration-200",
                isAdvancedOpen ? "rotate-180" : "",
              )}
            >
              ▾
            </span>
          </button>

          {!isAdvancedOpen && (
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
          )}

          {(Object.keys(localFilters).length > 0 || isAdvancedOpen) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        <div
          className={clsx(
            "grid transition-all duration-300 ease-in-out px-1 w-full",
            isAdvancedOpen
              ? "grid-rows-[1fr] opacity-100 overflow-visible"
              : "grid-rows-[0fr] opacity-0 overflow-hidden",
          )}
        >
          <div className="min-h-0">
            <div className="pt-1.5 border-t border-slate-100/50">
              <div className="flex flex-wrap items-center gap-3">
                <FilterBar
                  filters={localFilters}
                  onFilterChange={handleLocalFilterChange}
                  config={advancedFilterConfig}
                />
                {isAdvancedOpen && (
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
                    <Search className="w-4 h-4" />
                    Apply Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="flex flex-col gap-4 pt-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Card Types"
              value={metrics.total.toString()}
            />
            <MetricCard
              title="Active Types"
              value={metrics.active.toString()}
            />
            <MetricCard
              title="Inactive Types"
              value={metrics.inactive.toString()}
            />
            <MetricCard title="VISA Cards" value={metrics.visa.toString()} />
          </div>
        </div>

        {/* Table Section */}
        <div className="pt-6">
          <DataTable
            columns={columns}
            data={filteredData}
            hideToolbarDateFilter={true}
            viewButtonLabel="View Column"
            toolbarEndContent={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Exporting...")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Export
                  <Download className="w-4 h-4" />
                </button>
              </div>
            }
            filterActions={
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 ml-1">
                  Showing card types
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredData.length}
                </span>
              </div>
            }
          />
        </div>
      </div>

      <EditCardTypeDrawer
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        cardType={selectedCardType}
        onSave={handleUpdate}
      />
    </div>
  );
}

function EditCardTypeDrawer({
  open,
  onClose,
  cardType,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  cardType: CardType | null;
  onSave: (data: CardType) => void;
}) {
  const [formData, setFormData] = useState<Partial<CardType>>({});

  useEffect(() => {
    if (cardType) setFormData(cardType);
  }, [cardType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as CardType);
  };

  return (
    <Drawer open={open} onClose={onClose} title="Edit Card Type" width="xl">
      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <section>
          <SectionHeader title="Card Type Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <div className="md:col-span-2">
              <FormField
                label="Bank Name"
                name="bankName"
                formData={formData}
                handleChange={handleChange}
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                label="Card Type"
                name="cardType"
                formData={formData}
                handleChange={handleChange}
                required
              />
            </div>
            <FormField
              label="Starting Digit"
              name="startDigit"
              formData={formData}
              handleChange={handleChange}
            />
            <FormField
              label="GW Type"
              name="gwType"
              formData={formData}
              handleChange={handleChange}
            />
            <FormField
              label="Bank Commission"
              name="bankComm"
              type="number"
              formData={formData}
              handleChange={handleChange}
            />
            <FormField
              label="Merchant Commission"
              name="merchantComm"
              type="number"
              formData={formData}
              handleChange={handleChange}
            />
            <div className="md:col-span-2">
              <FormField
                label="Status"
                name="status"
                formData={formData}
                handleChange={handleChange}
                isRadio
                options={["Active", "Inactive"]}
              />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          <button
            type="submit"
            className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            Update Card Type
          </button>
        </div>
      </form>
    </Drawer>
  );
}
