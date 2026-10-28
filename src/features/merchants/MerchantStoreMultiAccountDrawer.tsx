import React, { useState, useEffect, useMemo } from "react";
import { Drawer } from "../../components/Drawer";
import { FilterBar, type FilterConfig } from "../../components/FilterBar";
import { Landmark, ArrowLeft } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface MultiAccount {
  id: string;
  systemPara: string;
  acName: string;
  acNo: string;
  acBranch: string;
  bank: string;
  router: string;
  refundPercent?: string;
  status: "Enable" | "Disable";
}

const mockAccounts: MultiAccount[] = [
  {
    id: "1",
    systemPara: "TST_SZ_PAR_61599049A94D8",
    acName: "Client NMK",
    acNo: "123987654321",
    acBranch: "Head R/A Office",
    bank: "SOCIAL ISLAMI BANK",
    router: "123456789",
    refundPercent: "0",
    status: "Enable",
  },
  {
    id: "2",
    systemPara: "TST_SZ_PAR_615989B360547",
    acName: "Client NMK",
    acNo: "123987654321",
    acBranch: "Head R/A Office",
    bank: "SOCIAL ISLAMI BANK",
    router: "123456789",
    refundPercent: "0",
    status: "Enable",
  },
  {
    id: "3",
    systemPara: "DynamicHostBD",
    acName: "Dynamic Host BD",
    acNo: "123987654321",
    acBranch: "Head R/A Office",
    bank: "SOCIAL ISLAMI BANK",
    router: "123456789",
    refundPercent: "0",
    status: "Enable",
  },
  {
    id: "4",
    systemPara: "TST_SZ_PAR_6071B5FB7088E",
    acName: "Payee Account",
    acNo: "0123456789111",
    acBranch: "Gulshan",
    bank: "DUTCH BANGLA BANK",
    router: "123456789",
    refundPercent: "0",
    status: "Enable",
  },
];

const BANK_OPTIONS = [
  { label: "Select Bank", value: "" },
  { label: "SOCIAL ISLAMI BANK", value: "SOCIAL ISLAMI BANK" },
  { label: "DUTCH BANGLA BANK", value: "DUTCH BANGLA BANK" },
  { label: "SHAHJALAL ISLAMI BANK", value: "SHAHJALAL ISLAMI BANK" },
  { label: "BRAC BANK LIMITED", value: "BRAC BANK LIMITED" },
  { label: "CITY BANK LIMITED", value: "CITY BANK LIMITED" },
];

const primaryFilterConfig: FilterConfig[] = [
  { key: "systemPara", type: "input", label: "System Para" },
  { key: "acName", type: "input", label: "AC Name" },
  { key: "acNo", type: "input", label: "AC No" },
  {
    key: "bank",
    type: "select",
    label: "Bank",
    options: BANK_OPTIONS.map((b) => ({
      label: b.label || "All Banks",
      value: b.value || "all",
    })),
  },
];

const advancedFilterConfig: FilterConfig[] = [
  { key: "acBranch", type: "input", label: "AC Branch" },
  { key: "router", type: "input", label: "Router" },
];

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
}

export function MerchantStoreMultiAccountDrawer({ store, onClose }: Props) {
  const [view, setView] = useState<"LIST" | "ADD" | "EDIT">("LIST");
  const [accounts, setAccounts] = useState<MultiAccount[]>(mockAccounts);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Filters State
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  // Form State
  const [form, setForm] = useState<Partial<MultiAccount>>({
    systemPara: "",
    acName: "",
    acNo: "",
    acBranch: "",
    bank: "",
    router: "",
    refundPercent: "",
    status: "Enable",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (store) {
      setView("LIST");
      setAppliedFilters({});
      setLocalFilters({});
      setIsAdvancedOpen(false);
      setAccounts(mockAccounts);
    }
  }, [store]);

  const activeAdvancedCount = useMemo(() => {
    return advancedFilterConfig.reduce((acc, config) => {
      const val = localFilters[config.key];
      if (val && val !== "all") return acc + 1;
      return acc;
    }, 0);
  }, [localFilters]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (
        appliedFilters.systemPara &&
        !acc.systemPara
          .toLowerCase()
          .includes(appliedFilters.systemPara.toLowerCase())
      )
        return false;
      if (
        appliedFilters.acName &&
        !acc.acName.toLowerCase().includes(appliedFilters.acName.toLowerCase())
      )
        return false;
      if (
        appliedFilters.acNo &&
        !acc.acNo.toLowerCase().includes(appliedFilters.acNo.toLowerCase())
      )
        return false;
      if (
        appliedFilters.acBranch &&
        !acc.acBranch
          .toLowerCase()
          .includes(appliedFilters.acBranch.toLowerCase())
      )
        return false;
      if (
        appliedFilters.bank &&
        appliedFilters.bank !== "all" &&
        acc.bank !== appliedFilters.bank
      )
        return false;
      if (
        appliedFilters.router &&
        !acc.router.toLowerCase().includes(appliedFilters.router.toLowerCase())
      )
        return false;
      return true;
    });
  }, [accounts, appliedFilters]);

  if (!store) return null;

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setAppliedFilters({});
  };

  const isFiltersChanged =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.systemPara) errors.systemPara = "System Parameter is required";
    if (!form.acName) errors.acName = "Account Name is required";
    if (!form.acNo) errors.acNo = "Account Number is required";
    if (!form.acBranch) errors.acBranch = "Branch is required";
    if (!form.bank) errors.bank = "Bank is required";
    if (!form.router) errors.router = "Router No is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (view === "ADD") {
      const newAccount: MultiAccount = {
        id: Math.random().toString(36).substr(2, 9),
        systemPara: form.systemPara || "",
        acName: form.acName || "",
        acNo: form.acNo || "",
        acBranch: form.acBranch || "",
        bank: form.bank || "",
        router: form.router || "",
        refundPercent: form.refundPercent || "0",
        status: (form.status as "Enable" | "Disable") || "Enable",
      };
      setAccounts((prev) => [newAccount, ...prev]);
      toast.success("Multi-account added successfully");
    } else {
      setAccounts((prev) =>
        prev.map((item) =>
          item.id === form.id ? ({ ...item, ...form } as MultiAccount) : item,
        ),
      );
      toast.success("Multi-account updated successfully");
    }

    setView("LIST");
    setForm({
      systemPara: "",
      acName: "",
      acNo: "",
      acBranch: "",
      bank: "",
      router: "",
      refundPercent: "",
      status: "Enable",
    });
    setFormErrors({});
  };

  const handleEdit = (account: MultiAccount) => {
    setForm(account);
    setFormErrors({});
    setView("EDIT");
  };

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">Multi-Account</div>
      <div className="text-sm font-normal text-slate-500 flex items-center gap-2 mt-1">
        <Landmark className="w-3.5 h-3.5 text-slate-400" />
        <span>Store ID: </span>
        <span className="font-mono font-semibold text-slate-700">
          {store.storeId}
        </span>
      </div>
    </div>
  );

  return (
    <Drawer
      open={!!store}
      onClose={onClose}
      title={customTitle}
      width="5xl"
      headerAction={
        view === "LIST" && (
          <button
            onClick={() => {
              setForm({
                systemPara: "",
                acName: "",
                acNo: "",
                acBranch: "",
                bank: "",
                router: "",
                refundPercent: "",
                status: "Enable",
              });
              setFormErrors({});
              setView("ADD");
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Add Multi-Account
          </button>
        )
      }
    >
      <div className="pb-24 space-y-6">
        {view === "LIST" ? (
          <>
            {/* ── SEARCH FILTERS SECTION ── */}
            <div className="flex flex-col mb-4">
              <div className="flex flex-wrap items-center gap-3">
                <FilterBar
                  config={primaryFilterConfig}
                  filters={localFilters}
                  onFilterChange={handleFilterChange}
                />

                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors border rounded-full w-fit cursor-pointer",
                    isAdvancedOpen
                      ? "bg-slate-100 text-slate-900 border-slate-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                  )}
                >
                  Advanced filters
                  {activeAdvancedCount > 0 && !isAdvancedOpen && (
                    <span className="flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-primary-600 rounded-full">
                      {activeAdvancedCount}
                    </span>
                  )}
                  <span
                    className={clsx(
                      "transition-transform duration-200 text-[10px]",
                      isAdvancedOpen ? "rotate-180" : "",
                    )}
                  >
                    ▼
                  </span>
                </button>

                {!isAdvancedOpen && (
                  <button
                    onClick={handleApplyFilters}
                    disabled={!isFiltersChanged}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-all shadow-sm ml-2",
                      isFiltersChanged
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

              {/* Advanced Filters Collapsible Panel */}
              {isAdvancedOpen && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  <FilterBar
                    config={advancedFilterConfig}
                    filters={localFilters}
                    onFilterChange={handleFilterChange}
                  />
                  <button
                    onClick={handleApplyFilters}
                    disabled={!isFiltersChanged}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-all shadow-sm ml-2",
                      isFiltersChanged
                        ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                    )}
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>

            {/* ── DATA TABLE SECTION ── */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="px-5 py-3 w-12 text-center">#</th>
                      <th className="px-5 py-3">System Para</th>
                      <th className="px-5 py-3">AC Name & No</th>
                      <th className="px-5 py-3">Bank & Branch</th>
                      <th className="px-5 py-3">Router</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-8 text-center text-slate-400 italic"
                        >
                          No accounts found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((acc, idx) => (
                        <tr
                          key={acc.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-center font-medium text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-700">
                            {acc.systemPara}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">
                              {acc.acName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {acc.acNo}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">
                              {acc.bank}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {acc.acBranch}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono">{acc.router}</td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleEdit(acc)}
                              className="text-xs font-normal text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* ── FORM VIEW (ADD / EDIT) ── */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("LIST")}
                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
                {view === "ADD"
                  ? "Add New Multi-Account"
                  : "Edit Multi-Account"}
              </h3>

              <form
                onSubmit={handleSave}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4"
              >
                {/* System Parameter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>System
                    Parameter
                  </label>
                  <input
                    type="text"
                    value={form.systemPara || ""}
                    onChange={(e) =>
                      setForm({ ...form, systemPara: e.target.value })
                    }
                    placeholder="Enter System Parameter"
                    disabled={view === "EDIT"}
                    className={clsx(
                      "w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20",
                      view === "EDIT"
                        ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
                        : "bg-white",
                      formErrors.systemPara
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-200 focus:border-primary-500",
                    )}
                  />
                  {formErrors.systemPara && (
                    <p className="mt-1 text-xs text-rose-500">
                      {formErrors.systemPara}
                    </p>
                  )}
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>Account Name
                  </label>
                  <input
                    type="text"
                    value={form.acName || ""}
                    onChange={(e) =>
                      setForm({ ...form, acName: e.target.value })
                    }
                    placeholder="Enter Account Name"
                    className={clsx(
                      "w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20",
                      formErrors.acName
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-200 focus:border-primary-500",
                    )}
                  />
                  {formErrors.acName && (
                    <p className="mt-1 text-xs text-rose-500">
                      {formErrors.acName}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>Account Number
                  </label>
                  <input
                    type="text"
                    value={form.acNo || ""}
                    onChange={(e) => setForm({ ...form, acNo: e.target.value })}
                    placeholder="Enter Account Number"
                    className={clsx(
                      "w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20",
                      formErrors.acNo
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-200 focus:border-primary-500",
                    )}
                  />
                  {formErrors.acNo && (
                    <p className="mt-1 text-xs text-rose-500">
                      {formErrors.acNo}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>Branch
                  </label>
                  <input
                    type="text"
                    value={form.acBranch || ""}
                    onChange={(e) =>
                      setForm({ ...form, acBranch: e.target.value })
                    }
                    placeholder="Enter Branch"
                    className={clsx(
                      "w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20",
                      formErrors.acBranch
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-200 focus:border-primary-500",
                    )}
                  />
                  {formErrors.acBranch && (
                    <p className="mt-1 text-xs text-rose-500">
                      {formErrors.acBranch}
                    </p>
                  )}
                </div>

                {/* Bank */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>Bank
                  </label>
                  <select
                    value={form.bank || ""}
                    onChange={(e) => setForm({ ...form, bank: e.target.value })}
                    className={clsx(
                      "w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all focus:ring-2 focus:ring-primary-500/20",
                      formErrors.bank
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-200 focus:border-primary-500",
                    )}
                  >
                    {BANK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.bank && (
                    <p className="mt-1 text-xs text-rose-500">
                      {formErrors.bank}
                    </p>
                  )}
                </div>

                {/* Router No */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>Router No
                  </label>
                  <input
                    type="text"
                    value={form.router || ""}
                    onChange={(e) =>
                      setForm({ ...form, router: e.target.value })
                    }
                    placeholder="Enter Router No"
                    className={clsx(
                      "w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20",
                      formErrors.router
                        ? "border-rose-300 focus:border-rose-500"
                        : "border-slate-200 focus:border-primary-500",
                    )}
                  />
                  {formErrors.router && (
                    <p className="mt-1 text-xs text-rose-500">
                      {formErrors.router}
                    </p>
                  )}
                </div>

                {/* Refund Percent */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Refund Percent
                  </label>
                  <input
                    type="text"
                    value={form.refundPercent || ""}
                    onChange={(e) =>
                      setForm({ ...form, refundPercent: e.target.value })
                    }
                    placeholder="Enter Refund Percent"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>Status
                  </label>
                  <select
                    value={form.status || "Enable"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as "Enable" | "Disable",
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="Enable">Enable</option>
                    <option value="Disable">Disable</option>
                  </select>
                </div>

                {/* Actions Footer - Identical to Manage Terminal */}
                <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setView("LIST")}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    {view === "ADD" ? "Save" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
