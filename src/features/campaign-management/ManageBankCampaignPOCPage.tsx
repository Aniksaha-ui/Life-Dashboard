import { useState, useMemo, useEffect } from "react";
import { Mail, Copy, Check, Info, Plus, Pencil } from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionIconButton } from "./components/ActionIconButton";

interface BankPOC {
  id: string;
  entityName: string;
  entityType: "Bank" | "MFS" | "Internet Banking";
  toEmail: string;
  ccEmails: string[];
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-slate-400 hover:text-primary-600 transition-all rounded hover:bg-slate-100/50 group/copy"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500 animate-in zoom-in duration-200" />
      ) : (
        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 sm:group-hover/parent:opacity-100 transition-opacity" />
      )}
    </button>
  );
};

const BANK_POC_MOCK: BankPOC[] = [
  {
    id: "1",
    entityName: "AB Bank PLC",
    entityType: "Bank",
    toEmail: "akoned@abbl.com",
    ccEmails: [
      "tanzilur.rahman@sslwireless.com",
      "mahmud.bhuiyan@sslwireless.bcom",
      "partnershipmgt@sslcommerz.com",
      "anik.saha@sslwireless.com",
      "sahaanik106@gmail.com",
      "sahaanik1045@gmail.com",
      "test@gmail.com",
    ],
  },
  {
    id: "2",
    entityName: "Al- Arafah Islami Bank PLC",
    entityType: "Bank",
    toEmail: "zaman5572@aibl.com.bd",
    ccEmails: [
      "mahmud.bhuiyan@sslwireless.com",
      "partnershipmgt@sslcommerz.com",
      "kabir5570@aibl.com.bd",
      "anik.saha@sslwireless.com",
    ],
  },
  {
    id: "3",
    entityName: "BRAC Bank PLC",
    entityType: "Bank",
    toEmail: "nahian.khan@bracbank.com",
    ccEmails: [
      "mahmud.bhuiyan@sslwireless.com",
      "partnershipmgt@sslcommerz.com",
      "khairuddin.ahmed@bracbank.com",
      "ashraful.alam30823@bracbank.com",
    ],
  },
  {
    id: "4",
    entityName: "Bank Asia PLC",
    entityType: "Bank",
    toEmail: "islam.sohel@bankasia-bd.com",
    ccEmails: [
      "mahmud.bhuiyan@sslwireless.com",
      "partnershipmgt@sslcommerz.com",
    ],
  },
  {
    id: "5",
    entityName: "Bkash",
    entityType: "MFS",
    toEmail: "md.asif@bkash.com",
    ccEmails: [
      "partnershipmgt@sslcommerz.com",
      "mahmud.bhuiyan@sslwireless.com",
    ],
  },
  {
    id: "6",
    entityName: "City Bank PLC",
    entityType: "Internet Banking",
    toEmail: "abmmhasan346@gmail.com",
    ccEmails: ["esty.cc1179i@gmail.com"],
  },
  {
    id: "7",
    entityName: "City Bank PLC",
    entityType: "Bank",
    toEmail: "nazat.afrin@citybankplc.com",
    ccEmails: [
      "mahmud.bhuiyan@sslwireless.com",
      "partnershipmgt@sslcommerz.com",
      "najmun.nahar@thecitybank.com",
      "e-commerce@thecitybank.com",
    ],
  },
  {
    id: "8",
    entityName: "Community Bank Bangladesh PLC",
    entityType: "Bank",
    toEmail: "enamul.shah@communitybankbd.com",
    ccEmails: [
      "mahmud.bhuiyan@sslwireless.com",
      "partnershipmgt@sslcommerz.com",
    ],
  },
  {
    id: "9",
    entityName: "Dhaka Bank PLC",
    entityType: "Bank",
    toEmail: "ashfaqul.azam@dhakabank.com.bd",
    ccEmails: [
      "mahmud.bhuiyan@sslwireless.com",
      "partnershipmgt@sslcommerz.com",
      "mayeen.akbar@dhakabank.com.bd",
      "afia.ibnat@dhakabank.com.bd",
    ],
  },
  {
    id: "10",
    entityName: "Dutch Bangla Bank PLC",
    entityType: "MFS",
    toEmail: "sslw.qa@gmail.com",
    ccEmails: ["esty.cc1179i@gmail.com"],
  },
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
  type = "text",
  helper,
  options,
  disabled,
}: any) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
        {label}
      </label>

      {type === "select" ? (
        <select
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((opt: { label: string; value: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          rows={
            formData[name] ? Math.max(5, formData[name].split("\n").length) : 5
          }
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm resize-none disabled:bg-slate-50 disabled:text-slate-500"
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
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
    </div>
  );
};

export default function ManageBankCampaignPOCPage() {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    entityName: "",
    entityType: "all",
  });

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedPOC, setSelectedPOC] = useState<BankPOC | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    if (selectedPOC) {
      setFormData({
        entityName: selectedPOC.entityName,
        entityType: selectedPOC.entityType,
        toEmail: selectedPOC.toEmail,
        ccEmails: selectedPOC.ccEmails.join("\n"),
      });
    }
  }, [selectedPOC]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      entityName: "",
      entityType: "all",
    };
    setLocalFilters(cleared);
    setAppliedFilters(cleared);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setIsEditDrawerOpen(false);
    }, 1000);
  };

  const isFiltersChanged = useMemo(() => {
    return JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);
  }, [localFilters, appliedFilters]);

  const columns: ColumnDef<BankPOC>[] = [
    {
      id: "index",
      header: "Sl",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.index + 1}</span>
      ),
      size: 40,
    },
    {
      accessorKey: "entityName",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-900 leading-tight">
          {row.original.entityName}
        </span>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.original.entityType}
        </span>
      ),
    },
    {
      accessorKey: "toEmail",
      header: "To",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 group/parent">
          <a
            href={`mailto:${row.original.toEmail}`}
            className="text-xs text-primary-600 hover:text-primary-700 hover:underline transition-colors font-medium"
          >
            {row.original.toEmail}
          </a>
          <CopyButton text={row.original.toEmail} />
        </div>
      ),
    },
    {
      accessorKey: "ccEmails",
      header: "CC",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 py-1 max-w-xs transition-opacity hover:opacity-80">
          {row.original.ccEmails.map((email, idx) => (
            <div key={idx} className="flex items-center gap-1 group/parent">
              <a
                href={`mailto:${email}`}
                className="text-[10px] text-slate-500 hover:text-primary-600 hover:underline transition-all leading-tight"
              >
                {email}
              </a>
              <CopyButton text={email} />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <ActionIconButton
          label="Edit"
          tooltip="Edit"
          icon={Pencil}
          onClick={() => {
            setSelectedPOC(row.original);
            setIsEditDrawerOpen(true);
          }}
        />
      ),
    },
  ];

  const filterConfig = [
    {
      key: "entityName",
      label: "Entity Name",
      type: "input",
      placeholder: "Search name...",
    },
    {
      key: "entityType",
      label: "Type",
      type: "select",
      options: [
        { label: "All Type", value: "all" },
        { label: "Bank", value: "Bank" },
        { label: "MFS", value: "MFS" },
        { label: "Internet Banking", value: "Internet Banking" },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return BANK_POC_MOCK.filter((item) => {
      const matchesName =
        !appliedFilters.entityName ||
        item.entityName
          .toLowerCase()
          .includes(appliedFilters.entityName.toLowerCase());
      const matchesType =
        appliedFilters.entityType === "all" ||
        item.entityType === appliedFilters.entityType;
      return matchesName && matchesType;
    });
  }, [appliedFilters]);

  const metrics = useMemo(() => {
    return {
      total: BANK_POC_MOCK.length,
      banks: BANK_POC_MOCK.filter((i) => i.entityType === "Bank").length,
      mfs: BANK_POC_MOCK.filter((i) => i.entityType === "MFS").length,
      ib: BANK_POC_MOCK.filter((i) => i.entityType === "Internet Banking")
        .length,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Bank Campaign POC
        </h1>
        <p className="text-slate-500 text-sm tracking-tight">
          Configure and manage primary contact channels for partner banks and
          MFS providers
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filter Section */}
        <div className="flex flex-wrap items-center gap-4">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            config={filterConfig as any}
          />

          <div className="flex items-center gap-4">
            <button
              onClick={handleApplyFilters}
              disabled={!isFiltersChanged}
              className={clsx(
                "px-6 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm",
                isFiltersChanged
                  ? "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-100"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
              )}
            >
              Apply Filters
            </button>
            {(localFilters.entityName || localFilters.entityType !== "all") && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Metrics Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Total Entities
              </span>
              <span className="text-2xl font-black text-slate-900">
                {metrics.total}
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Banking Partners
              </span>
              <span className="text-2xl font-black text-slate-900">
                {metrics.banks}
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                MFS Providers
              </span>
              <span className="text-2xl font-black text-slate-900">
                {metrics.mfs}
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Internet Banking
              </span>
              <span className="text-2xl font-black text-slate-900">
                {metrics.ib}
              </span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="pt-2 flex-1 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            hideToolbarDateFilter={true}
            hideViewColumn={true}
            viewButtonLabel="View Column"
            filterActions={
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 ml-1">
                  Entity Contact List
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredData.length}
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Edit Drawer */}
      <Drawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 leading-tight">
              Edit POC Information
            </span>
            <span className="text-xs text-primary-600 font-medium mt-0.5 uppercase tracking-wide">
              {selectedPOC?.entityName}
            </span>
          </div>
        }
        width="xl"
      >
        <form onSubmit={handleUpdate} className="space-y-8 pb-32">
          {/* Basic Info */}
          <section>
            <SectionHeader title="General Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <div className="md:col-span-2">
                <FormField
                  label="Entity Name"
                  name="entityName"
                  formData={formData}
                  handleChange={handleFormChange}
                  disabled={true}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Entity Type"
                  name="entityType"
                  formData={formData}
                  handleChange={handleFormChange}
                  type="select"
                  options={[
                    { label: "Bank", value: "Bank" },
                    { label: "MFS", value: "MFS" },
                    { label: "Internet Banking", value: "Internet Banking" },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Contact Channels */}
          <section>
            <SectionHeader title="Contact Channels" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <div className="md:col-span-2">
                <FormField
                  label="Primary Email (To)"
                  name="toEmail"
                  formData={formData}
                  handleChange={handleFormChange}
                  type="email"
                  helper="Main destination for all technical routing automated alerts."
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Secondary Emails (CC)"
                  name="ccEmails"
                  formData={formData}
                  handleChange={handleFormChange}
                  type="textarea"
                  helper="Enter one email address per line. These recipients will be copied on all campaign communications."
                />
              </div>
            </div>
          </section>

          {/* Sticky Footer */}
          <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-8 px-8 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isUpdating}
                className={clsx(
                  "bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2",
                  isUpdating && "cursor-not-allowed",
                )}
              >
                {isUpdating && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isUpdating ? "Updating..." : "Update POC Information"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditDrawerOpen(false)}
                className="px-6 py-2.5 bg-white text-slate-600 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
