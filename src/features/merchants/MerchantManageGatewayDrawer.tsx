import React, { useState, useMemo, useEffect } from "react";
import { Drawer } from "../../components/Drawer";
import { Search, X } from "lucide-react";
import type { Merchant } from "../../data/mock/types";
import { clsx } from "clsx";

interface MerchantManageGatewayDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

interface Gateway {
  id: string;
  name: string;
  isSpecial?: boolean;
}

const ALL_GATEWAYS: Gateway[] = [
  { id: "1", name: "VISA BRAC", isSpecial: true },
  { id: "2", name: "MASTER BRAC", isSpecial: true },
  { id: "3", name: "VISA DBBL" },
  { id: "4", name: "MASTER DBBL" },
  { id: "5", name: "NEXUS DBBL" },
  { id: "6", name: "QCASH" },
  { id: "7", name: "CITY" },
  { id: "8", name: "DBBLMOBILEBANKING" },
  { id: "9", name: "BKASH" },
  { id: "10", name: "BANKASIA" },
  { id: "11", name: "IBBL" },
  { id: "12", name: "MTBL" },
  { id: "13", name: "CITY VISA", isSpecial: true },
  { id: "14", name: "CITY MASTER", isSpecial: true },
  { id: "15", name: "CITY AMEX", isSpecial: true },
  { id: "16", name: "CITY UNIONPAY" },
  { id: "17", name: "CITY TAKAPAY" },
  { id: "18", name: "ABBANK" },
  { id: "19", name: "MYCASH" },
  { id: "20", name: "EBL VISA", isSpecial: true },
  { id: "21", name: "EBL UNIONPAY" },
  { id: "22", name: "EBL MASTER", isSpecial: true },
  { id: "23", name: "EBL DINERSCLUB" },
  { id: "24", name: "SBL VISA", isSpecial: true },
  { id: "25", name: "SBL MASTER", isSpecial: true },
  { id: "26", name: "TRUSTBANK" },
  { id: "27", name: "UPAY" },
  { id: "28", name: "TAPNPAY" },
  { id: "29", name: "OKWALLET" },
  { id: "30", name: "IPAY" },
  { id: "31", name: "DMONEY" },
  { id: "32", name: "SURECASH" },
  { id: "33", name: "UCBL VISA" },
  { id: "34", name: "UCBL MASTER" },
  { id: "35", name: "NAGAD" },
  { id: "36", name: "ALARAFAHBANK" },
  { id: "37", name: "MODHUMOTI" },
  { id: "38", name: "PBL" },
  { id: "39", name: "INSTAPAY" },
  { id: "40", name: "FSIBL" },
  { id: "41", name: "EBLSKY" },
  { id: "42", name: "PMONEY" },
  { id: "43", name: "WOORI" },
  { id: "44", name: "RAINBOW" },
  { id: "45", name: "MTBL VISA" },
  { id: "46", name: "MTBL MASTER" },
  { id: "47", name: "BDBL" },
  { id: "48", name: "MEGHNA" },
  { id: "49", name: "GPDOB" },
  { id: "50", name: "POCKET" },
  { id: "51", name: "CITIZEN" },
  { id: "52", name: "MEGHNAPAY" },
  { id: "53", name: "MIDLAND" },
  { id: "54", name: "SSL BNPL" },
  { id: "55", name: "PUBALI" },
  { id: "56", name: "SBAC" },
  { id: "57", name: "PATHAOPAY" },
  { id: "58", name: "STPAY" },
  { id: "59", name: "CASHBABA" },
];

export function MerchantManageGatewayDrawer({
  merchant,
  onClose,
}: MerchantManageGatewayDrawerProps) {
  const [localFilters, setLocalFilters] = useState<any>({
    gatewayName: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Initialize with some mock assigned gateways
  useEffect(() => {
    if (merchant) {
      // Mocking initial assignment: 1st 30 gateways are assigned
      setSelectedIds(new Set(ALL_GATEWAYS.slice(8, 38).map((g) => g.id)));
    }
  }, [merchant]);

  const filteredGateways = useMemo(() => {
    return ALL_GATEWAYS.filter((gw) =>
      gw.name
        .toLowerCase()
        .includes((localFilters.gatewayName || "").toLowerCase()),
    );
  }, [localFilters.gatewayName]);

  const { assigned, available } = useMemo(() => {
    return {
      assigned: filteredGateways.filter((g) => selectedIds.has(g.id)),
      available: filteredGateways.filter((g) => !selectedIds.has(g.id)),
    };
  }, [filteredGateways, selectedIds]);

  const toggleGateway = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGlobalSelect = (type: "all" | "normal" | "none") => {
    switch (type) {
      case "all":
        setSelectedIds(new Set(ALL_GATEWAYS.map((g) => g.id)));
        break;
      case "normal":
        setSelectedIds(
          new Set(ALL_GATEWAYS.filter((g) => !g.isSpecial).map((g) => g.id)),
        );
        break;
      case "none":
        setSelectedIds(new Set());
        break;
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalFilters({ gatewayName: "" });
  };

  const gatewayFilterConfig = [
    {
      key: "gatewayName",
      label: "Gateway Name",
      type: "input",
      placeholder: "Enter ...",
    },
  ];

  if (!merchant) return null;

  return (
    <Drawer
      open={!!merchant}
      onClose={onClose}
      title="Manage Gateway"
      width="4xl"
    >
      <div className="flex flex-col gap-6">
        {/* Sub-header Controls */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-2">
              Gateways
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {filteredGateways.length}
            </span>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleGlobalSelect("all")}
                className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-tight transition-colors cursor-pointer"
              >
                Check All
              </button>
              <span className="text-slate-200 text-[10px]">|</span>
              <button
                onClick={() => handleGlobalSelect("normal")}
                className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-tight transition-colors cursor-pointer"
              >
                Check All except PRO
              </button>
              <span className="text-slate-200 text-[10px]">|</span>
              <button
                onClick={() => handleGlobalSelect("none")}
                className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-tight transition-colors cursor-pointer"
              >
                Uncheck All
              </button>
            </div>
          </div>

          {/* Inline Search Input */}
          <div className="relative w-48 sm:w-64 mr-2">
            <input
              type="text"
              placeholder="Search gateways..."
              value={localFilters.gatewayName || ""}
              onChange={(e) =>
                handleFilterChange("gatewayName", e.target.value)
              }
              className="w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-slate-700 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {localFilters.gatewayName && (
              <button
                onClick={handleClearFilters}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <div className="flex flex-col gap-6 pb-10">
            {/* Gateway Groups Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-8">
              {/* Merchant Title */}
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 px-1 flex items-center justify-between">
                  <span>{merchant.name}</span>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5 text-primary-600 font-black">
                      Assigned: {assigned.length}
                    </div>
                    <div className="text-slate-200">|</div>
                    <div className="text-slate-400 font-bold">
                      Available: {available.length}
                    </div>
                  </div>
                </h4>
              </div>

              {/* Assigned Section */}
              {assigned.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-primary-900 uppercase tracking-widest px-1">
                    Assigned Gateways
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-1">
                    {assigned.map((gw, idx) => (
                      <div
                        key={gw.id}
                        onClick={() => toggleGateway(gw.id)}
                        className="flex items-center gap-2 py-0.5 px-2 rounded transition-all border border-transparent select-none bg-white cursor-pointer hover:bg-slate-50 group"
                      >
                        <div className="w-3.5 h-3.5 rounded border border-primary-600 bg-primary-600 flex items-center justify-center transition-all shadow-[0_0_8px_rgba(37,99,235,0.2)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        </div>
                        <span className="text-[11px] font-bold text-primary-900 truncate leading-tight flex items-center gap-1.5 py-1.5">
                          <span className="text-primary-700 font-black shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="truncate">{gw.name}</span>
                          {gw.isSpecial && (
                            <span className="ml-1 text-rose-700 font-black shrink-0 text-[10px]">
                              (PRO)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Section */}
              {available.length > 0 && (
                <div className="space-y-3 mt-6">
                  <p className="text-xs font-extrabold text-slate-900 uppercase tracking-widest px-1">
                    Available Gateways
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-1">
                    {available.map((gw, idx) => (
                      <div
                        key={gw.id}
                        onClick={() => toggleGateway(gw.id)}
                        className="flex items-center gap-2 py-0.5 px-2 rounded transition-all border border-transparent select-none bg-white cursor-pointer hover:bg-slate-50 group opacity-85"
                      >
                        <div className="w-3.5 h-3.5 rounded border border-slate-300 group-hover:border-primary-400 transition-all bg-white" />
                        <span className="text-[11px] font-bold text-slate-500 truncate leading-tight flex items-center gap-1.5 py-1.5 transition-colors group-hover:text-slate-700">
                          <span className="text-slate-300 font-bold shrink-0">
                            {assigned.length + idx + 1}.
                          </span>
                          <span className="truncate">{gw.name}</span>
                          {gw.isSpecial && (
                            <span className="ml-1 text-slate-300 font-bold shrink-0 text-[10px] font-medium">
                              (Special)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mb-2">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all shadow-md active:scale-95"
          >
            Update
          </button>
        </div>
      </div>
    </Drawer>
  );
}
