import React, { useState, useMemo } from "react";
import { Drawer } from "../../components/Drawer";
import { FilterBar, type FilterConfig } from "../../components/FilterBar";
import { ArrowLeft } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { downloadFile } from "../../utils/download";

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

interface TerminalEntry {
  id: string;
  terminalName: string;
  terminalUid: string;
  createdOn: string;
}

const INITIAL_TERMINAL_ENTRIES: TerminalEntry[] = [
  {
    id: "1",
    terminalName: "counter-1",
    terminalUid: "6A129A4CF1E47",
    createdOn: "2026-05-24 12:27:24",
  },
];

const filterConfig: FilterConfig[] = [
  { key: "terminalName", type: "input", label: "Terminal Name" },
  { key: "terminalUid", type: "input", label: "Terminal uId" },
  { key: "createdOn", type: "input", label: "Created On" },
];

export function MerchantStoreManageTerminalDrawer({
  store,
  onClose,
  merchantName,
}: Props) {
  const [view, setView] = useState<"LIST" | "ADD" | "EDIT" | "DETAIL">("LIST");
  const [viewTerminalEntry, setViewTerminalEntry] =
    useState<TerminalEntry | null>(null);
  const [entries, setEntries] = useState<TerminalEntry[]>(
    INITIAL_TERMINAL_ENTRIES,
  );

  // Filters State
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  // Form State
  const [form, setForm] = useState<Partial<TerminalEntry>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (
        appliedFilters.terminalName &&
        !entry.terminalName
          .toLowerCase()
          .includes(appliedFilters.terminalName.toLowerCase())
      )
        return false;
      if (
        appliedFilters.terminalUid &&
        !entry.terminalUid
          .toLowerCase()
          .includes(appliedFilters.terminalUid.toLowerCase())
      )
        return false;
      if (
        appliedFilters.createdOn &&
        !entry.createdOn
          .toLowerCase()
          .includes(appliedFilters.createdOn.toLowerCase())
      )
        return false;
      return true;
    });
  }, [entries, appliedFilters]);

  // Paginated entries
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  const paginationFrom =
    filteredEntries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const paginationTo = Math.min(currentPage * pageSize, filteredEntries.length);

  const hasUnappliedChanges = useMemo(
    () => JSON.stringify(localFilters) !== JSON.stringify(appliedFilters),
    [localFilters, appliedFilters],
  );

  if (!store) return null;

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.terminalName) errors.terminalName = "Terminal name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (view === "ADD") {
      const newEntry: TerminalEntry = {
        id: Math.random().toString(36).substr(2, 9),
        terminalName: form.terminalName || "",
        terminalUid: form.terminalUid || "",
        createdOn: new Date().toISOString().replace("T", " ").substring(0, 19),
      };
      setEntries((prev) => [newEntry, ...prev]);
      toast.success("Terminal added successfully");
    } else {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === form.id ? ({ ...item, ...form } as TerminalEntry) : item,
        ),
      );
      toast.success("Terminal updated successfully");
    }

    setView("LIST");
    setForm({});
    setFormErrors({});
  };

  const handleEdit = (entry: TerminalEntry) => {
    setForm(entry);
    setFormErrors({});
    setView("EDIT");
  };

  return (
    <>
      <Drawer
        open={!!store}
        onClose={onClose}
        title={
          <div>
            <div className="text-xl font-bold text-slate-900">
              Manage Terminal
            </div>
            <div className="text-sm font-normal text-slate-500 mt-1">
              Store ID:{" "}
              <span className="font-mono font-semibold text-slate-700">
                {store.storeId}
              </span>
            </div>
          </div>
        }
        width="5xl"
        headerAction={
          view === "LIST" && (
            <button
              onClick={() => {
                setForm({
                  terminalName: "",
                  terminalUid: Math.random()
                    .toString(36)
                    .substr(2, 9)
                    .toUpperCase(),
                  createdOn: new Date()
                    .toISOString()
                    .replace("T", " ")
                    .substring(0, 19),
                });
                setFormErrors({});
                setView("ADD");
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-all shadow-sm active:scale-95"
            >
              Add New Terminal
            </button>
          )
        }
      >
        <div className="pb-24 space-y-6">
          {view === "LIST" ? (
            <>
              {/* ── SEARCH FILTERS SECTION ── */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <FilterBar
                  config={filterConfig}
                  filters={localFilters}
                  onFilterChange={handleFilterChange}
                />

                <button
                  onClick={handleApplyFilters}
                  disabled={!hasUnappliedChanges}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-all shadow-sm ml-2",
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

              {/* ── DATA TABLE SECTION ── */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="px-5 py-3 w-12 text-center">#</th>
                        <th className="px-5 py-3">Terminal Name</th>
                        <th className="px-5 py-3">Terminal uId</th>
                        <th className="px-5 py-3">Created On</th>
                        <th className="px-5 py-3">Action</th>
                        <th className="px-5 py-3">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-8 text-center text-slate-400 italic"
                          >
                            No terminals found matching the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedEntries.map((entry, idx) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-5 py-4 text-center font-medium text-slate-500">
                              {(currentPage - 1) * pageSize + idx + 1}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900">
                                {entry.terminalName}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {entry.terminalUid}
                            </td>
                            <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                              {entry.createdOn}
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleEdit(entry)}
                                className="text-xs font-normal text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => {
                                  setViewTerminalEntry(entry);
                                  setView("DETAIL");
                                }}
                                className="text-xs font-normal text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded transition-colors cursor-pointer"
                              >
                                Generate Qr
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination Footer ── */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/50">
                  <div className="text-sm text-slate-500">
                    {filteredEntries.length > 0
                      ? `Showing ${paginationFrom} to ${paginationTo} of ${filteredEntries.length} entries`
                      : ""}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : view === "DETAIL" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setView("LIST");
                    setViewTerminalEntry(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>
              </div>

              {viewTerminalEntry && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-sm text-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
                    QR Payment Option
                  </h3>

                  {/* Payment Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-sm font-bold text-slate-900">
                      Payment Description
                    </div>

                    <div className="flex flex-col items-start gap-4">
                      {/* Grid for labels and values */}
                      <div className="grid grid-cols-[140px_1fr] items-center gap-y-6 w-full">
                        <div className="text-sm text-slate-600">
                          QR for Payment
                        </div>
                        <div>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                              `https://uat-invoice.sslcommerz.com/invoice/pay?refer=${viewTerminalEntry.terminalUid}`,
                            )}`}
                            alt="QR code"
                            className="w-32 h-32 object-contain"
                          />
                        </div>

                        <div className="text-sm text-slate-600">Store Name</div>
                        <div className="text-sm text-slate-900 font-medium">
                          {merchantName || "SSLCOMMERZ"}
                        </div>

                        <div className="text-sm text-slate-600">
                          QR Download
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const dataUrl = `https://uat-invoice.sslcommerz.com/invoice/pay?refer=${viewTerminalEntry.terminalUid}`;
                              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                                dataUrl,
                              )}`;

                              const res = await fetch(qrUrl);
                              if (!res.ok) {
                                throw new Error("Failed to download QR");
                              }

                              const blob = await res.blob();
                              downloadFile(
                                blob,
                                `qr_${viewTerminalEntry.terminalUid}.png`,
                                "image/png",
                              );
                            } catch (e: any) {
                              toast.error(
                                e?.message || "Failed to download QR",
                              );
                            }
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline transition-colors text-left"
                        >
                          Download QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── FORM VIEW (ADD / EDIT) ── */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("LIST")}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
                  {view === "ADD" ? "Add New Terminal" : "Edit Terminal"}
                </h3>

                <form
                  onSubmit={handleSave}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Terminal Name
                    </label>
                    <input
                      type="text"
                      value={form.terminalName || ""}
                      onChange={(e) =>
                        setForm({ ...form, terminalName: e.target.value })
                      }
                      placeholder="Enter Terminal Name"
                      className={clsx(
                        "w-full px-3 py-2.5 text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20",
                        formErrors.terminalName
                          ? "border-rose-300 focus:border-rose-500"
                          : "border-slate-200 focus:border-primary-500",
                      )}
                    />
                    {formErrors.terminalName && (
                      <p className="mt-1 text-xs text-rose-500">
                        {formErrors.terminalName}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
    </>
  );
}
