import React, { useState, useEffect } from "react";
import { Drawer } from "../../components/Drawer";
import { UploadCloud, CheckCircle2, FileText } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";

// ── Mock Data for Commission Entries ─────────────────────────────────────────

const MOCK_COMMISSION_ENTRIES = [
  {
    sl: 1,
    bank: "AB Bank",
    card: "ABBANKIB",
    tdr: "2.500000",
    bc: "1.000000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 2,
    bank: "AB Bank",
    card: "ABDIRECT",
    tdr: "2.500000",
    bc: "1.000000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 3,
    bank: "AB Bank",
    card: "CMA-ABBANK",
    tdr: "2.500000",
    bc: "0.400000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 4,
    bank: "Arafah Islami Bank Limited",
    card: "AIBL",
    tdr: "2.500000",
    bc: "1.000000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 5,
    bank: "Arafah Islami Bank Limited",
    card: "CMA-AIBL",
    tdr: "2.500000",
    bc: "0.800000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 6,
    bank: "BANGLA QR PSO NPSB",
    card: "NPSB-MICRO",
    tdr: "0.950000",
    bc: "0.780000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 7,
    bank: "BANGLA QR PSO NPSB",
    card: "NPSB-REGULR",
    tdr: "1.150000",
    bc: "0.820000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 8,
    bank: "Bangladesh Commercial Bank Limited",
    card: "BCBL",
    tdr: "2.500000",
    bc: "1.250000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 9,
    bank: "Bangladesh Development Bank Limited",
    card: "ACC",
    tdr: "1.500000",
    bc: "0.250000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 10,
    bank: "Bangladesh Development Bank Limited",
    card: "BDBL",
    tdr: "10.000000",
    bc: "8.000000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 11,
    bank: "Bangladesh Krishi Bank",
    card: "BKBIB",
    tdr: "2.500000",
    bc: "1.000000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 12,
    bank: "Bank Asia Internet Banking",
    card: "BANKASIA",
    tdr: "2.500000",
    bc: "1.000000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 13,
    bank: "Bank Asia Limited",
    card: "ACC",
    tdr: "1.500000",
    bc: "0.300000",
    rc: "0.00",
    rbc: "0.00",
  },
  {
    sl: 14,
    bank: "BKash",
    card: "BKASH",
    tdr: "2.500000",
    bc: "1.500000",
    rc: "0.00",
    rbc: "0.00",
  },
];

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

export function MerchantStoreMgtCommissionDrawer({
  store,
  onClose,
  merchantName,
}: Props) {
  const [entries, setEntries] = useState(MOCK_COMMISSION_ENTRIES);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  if (!store) return null;

  const handleUpdate = async (sl: number) => {
    setUpdatingId(sl);
    await new Promise((r) => setTimeout(r, 600));
    setUpdatingId(null);
  };

  const handleFieldChange = (sl: number, field: string, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.sl === sl ? { ...e, [field]: value } : e)),
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadProgress(0);
    }
  };

  const handleBulkUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">
        Management Commission
      </div>
      <div className="text-sm font-normal text-slate-500 mt-1">
        <span className="font-mono">{store.storeId}</span>
      </div>
    </div>
  );

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="5xl">
      <div className="pb-20 text-slate-800">
        {/* ── Bulk Change Request ── */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            Bulk Change Request
          </h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Change the Commission
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 max-w-xs border border-slate-200 rounded p-1 bg-white"
                />
                <button
                  onClick={handleBulkUpload}
                  disabled={!selectedFile || isUploading}
                  className="bg-[#337ab7] hover:bg-[#286090] disabled:bg-slate-300 disabled:text-slate-500 text-white px-4 py-1.5 rounded text-xs transition-colors shadow-sm font-medium"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>

              {/* Selected File Thumbnail & Progress */}
              {selectedFile && (
                <div className="max-w-[400px] bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4 mt-1">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-[#eef5fa] p-2 rounded text-[#337ab7] flex items-center justify-center overflow-hidden w-10 h-10">
                      {selectedFile.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FileText
                          size={20}
                          className="w-5 h-5 text-[#337ab7]"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-xs font-semibold text-slate-700 truncate max-w-[150px]"
                        title={selectedFile.name}
                      >
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  {isUploading || uploadProgress > 0 ? (
                    <div className="w-32 flex-shrink-0">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                        <span className="font-medium">
                          {uploadProgress === 100
                            ? "Completed"
                            : "Uploading..."}
                        </span>
                        <span className="font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#337ab7] h-1.5 transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <ul className="text-[11px] text-slate-500 space-y-1">
            <li>
              * Download the file and please do not change - Ref ID, Store ID
            </li>
            <li>
              * Only the value of Merchant TDR, Bank Charge, Reseller
              Commission,Reseller Bank Charge could be change by this upload
              processing
            </li>
            <li>
              * If one request is in processing, the new change will not take
              for that channel
            </li>
          </ul>
        </div>

        {/* ── Store Info Header ── */}
        <div className="text-sm font-semibold text-slate-700 mb-6 border-b-2 border-[#337ab7] pb-2">
          {store.storeId} - {merchantName || "SSLCOMMERZ"} - {store.storeId} -{" "}
          {store.storeName.toUpperCase()}
        </div>

        {/* ── Commission List Body ── */}
        <div className="space-y-5">
          {entries.map((entry) => (
            <div
              key={entry.sl}
              className="grid grid-cols-10 gap-x-4 p-5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all items-start"
            >
              {/* ── Left Unified Config Block ── */}
              <div className="col-span-6 pr-4">
                {/* SL & Bank Info Top Row */}
                <div className="flex gap-3 mb-5">
                  <div className="text-xl font-black text-slate-700 w-5 pt-0.5">
                    {entry.sl}.
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      {entry.bank}
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 leading-tight mt-0.5">
                      {entry.card}
                    </div>
                  </div>
                </div>

                {/* 3-Column Inputs Subgrid */}
                <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                  {/* Col 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-800 mb-1">
                        TDR (%)
                      </label>
                      <input
                        type="text"
                        className="w-full text-[11px] border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-[#337ab7]"
                        value={entry.tdr}
                        onChange={(e) =>
                          handleFieldChange(entry.sl, "tdr", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Bank Charge (%)
                      </label>
                      <input
                        type="text"
                        className="w-full text-[11px] border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-[#337ab7] bg-slate-50"
                        value={entry.bc}
                        onChange={(e) =>
                          handleFieldChange(entry.sl, "bc", e.target.value)
                        }
                      />
                    </div>
                    {/* Button sits under Bank Charge */}
                    <div className="pt-2 flex flex-col items-start">
                      <button
                        type="button"
                        onClick={() => handleUpdate(entry.sl)}
                        disabled={updatingId === entry.sl}
                        className="bg-[#337ab7] text-white px-5 py-1.5 rounded text-[11px] hover:bg-[#286090] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 font-medium"
                      >
                        {updatingId === entry.sl ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Update Commission"
                        )}
                      </button>
                      {updatingId === entry.sl && (
                        <div className="text-[10px] text-primary-600 mt-1 flex items-center gap-1 animate-pulse">
                          <CheckCircle2 className="w-3 h-3" /> Saved
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Col 2 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-800 mb-1">
                        Reseller Commission (%)
                      </label>
                      <input
                        type="text"
                        className="w-full text-[11px] border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-[#337ab7]"
                        value={entry.rc}
                        onChange={(e) =>
                          handleFieldChange(entry.sl, "rc", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        Reseller Bank Charge (%)
                      </label>
                      <input
                        type="text"
                        className="w-full text-[11px] border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-[#337ab7] bg-slate-50"
                        value={entry.rbc}
                        onChange={(e) =>
                          handleFieldChange(entry.sl, "rbc", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {/* Col 3 */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-800 mb-1">
                          Is Slab
                        </label>
                        <div className="flex items-center gap-3 text-[11px] h-[26px]">
                          <label className="flex items-center gap-1 cursor-pointer pt-0.5">
                            <input
                              type="radio"
                              name={`slab_${entry.sl}`}
                              className="text-[#337ab7] focus:ring-[#337ab7]"
                            />{" "}
                            Yes
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer pt-0.5">
                            <input
                              type="radio"
                              name={`slab_${entry.sl}`}
                              className="text-[#337ab7] focus:ring-[#337ab7]"
                              defaultChecked
                            />{" "}
                            No
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          MAX Slab (in Amount)
                        </label>
                        <input
                          type="text"
                          className="w-full text-[11px] border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-[#337ab7]"
                          defaultValue="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Slab Charges Table ── */}
              <div className="col-span-4">
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-[9px] text-center bg-white divide-y divide-slate-200">
                    <thead className="bg-[#f9f9f9]">
                      <tr className="divide-x divide-slate-200 font-bold text-slate-700">
                        <th className="py-1 px-1 w-6">SL</th>
                        <th className="py-1 px-1">MIN AMT</th>
                        <th className="py-1 px-1">Merchant TDR</th>
                        <th className="py-1 px-1">Bank Comm</th>
                        <th className="py-1 px-1 w-12">TDR Is %</th>
                        <th className="py-1 px-1 w-14">Bank Is %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                        <tr key={s} className="divide-x divide-slate-200">
                          <td className="py-0.5 px-0.5 text-slate-500 font-medium bg-slate-50/50">
                            {s}
                          </td>
                          <td className="py-0.5 px-0.5">
                            <input
                              type="text"
                              className="w-full border border-slate-300 rounded text-center py-0.5 focus:border-[#337ab7] outline-none"
                            />
                          </td>
                          <td className="py-0.5 px-0.5">
                            <input
                              type="text"
                              className="w-full border border-slate-300 rounded text-center py-0.5 focus:border-[#337ab7] outline-none"
                            />
                          </td>
                          <td className="py-0.5 px-0.5">
                            <input
                              type="text"
                              className="w-full border border-slate-300 rounded text-center py-0.5 focus:border-[#337ab7] outline-none"
                            />
                          </td>
                          <td className="py-0.5 px-0.5">
                            <input
                              type="checkbox"
                              className="w-2.5 h-2.5 mx-auto block cursor-pointer border-slate-300 rounded-sm"
                            />
                          </td>
                          <td className="py-0.5 px-0.5">
                            <input
                              type="checkbox"
                              className="w-2.5 h-2.5 mx-auto block cursor-pointer border-slate-300 rounded-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
