import React, { useState, useMemo } from "react";
import { Drawer } from "../../components/Drawer";
import { Shield, Search, CheckCircle2, XCircle } from "lucide-react";
import type { Merchant } from "../../data/mock/types";
import { clsx } from "clsx";

interface MerchantViewGatewayDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

interface GatewayStatus {
  id: string;
  name: string;
  status: "enabled" | "disabled";
  isSpecial?: boolean;
}

const MOCK_GATEWAYS: GatewayStatus[] = [
  { id: "1", name: "VISA BRAC", status: "disabled", isSpecial: true },
  { id: "2", name: "MASTER BRAC", status: "disabled", isSpecial: true },
  { id: "3", name: "VISA DBBL", status: "disabled" },
  { id: "4", name: "MASTER DBBL", status: "disabled" },
  { id: "5", name: "NEXUS DBBL", status: "disabled" },
  { id: "6", name: "QCASH", status: "disabled" },
  { id: "7", name: "CITY", status: "disabled" },
  { id: "8", name: "DBBLMOBILEBANKING", status: "disabled" },
  { id: "9", name: "BKASH", status: "enabled" },
  { id: "10", name: "BANKASIA", status: "enabled" },
  { id: "11", name: "IBBL", status: "enabled" },
  { id: "12", name: "MTBL", status: "enabled" },
  { id: "13", name: "CITY VISA", status: "disabled", isSpecial: true },
  { id: "14", name: "CITY MASTER", status: "disabled", isSpecial: true },
  { id: "15", name: "CITY AMEX", status: "disabled", isSpecial: true },
  { id: "16", name: "CITY UNIONPAY", status: "disabled" },
  { id: "17", name: "CITY TAKAPAY", status: "disabled" },
  { id: "18", name: "ABBANK", status: "enabled" },
  { id: "19", name: "MYCASH", status: "enabled" },
  { id: "20", name: "EBL VISA", status: "disabled", isSpecial: true },
  { id: "21", name: "EBL UNIONPAY", status: "disabled" },
  { id: "22", name: "EBL MASTER", status: "disabled", isSpecial: true },
  { id: "23", name: "EBL DINERSCLUB", status: "disabled" },
  { id: "24", name: "SBL VISA", status: "disabled", isSpecial: true },
  { id: "25", name: "SBL MASTER", status: "disabled", isSpecial: true },
  { id: "26", name: "TRUSTBANK", status: "enabled" },
  { id: "27", name: "UPAY", status: "disabled" },
  { id: "28", name: "TAPNPAY", status: "disabled" },
  { id: "29", name: "OKWALLET", status: "enabled" },
  { id: "30", name: "IPAY", status: "enabled" },
  { id: "31", name: "DMONEY", status: "enabled" },
  { id: "32", name: "SURECASH", status: "enabled" },
  { id: "33", name: "UCBL VISA", status: "enabled" },
  { id: "34", name: "UCBL MASTER", status: "enabled" },
  { id: "35", name: "NAGAD", status: "enabled" },
  { id: "36", name: "ALARAFAHBANK", status: "enabled" },
  { id: "37", name: "MODHUMOTI", status: "disabled" },
  { id: "38", name: "PBL", status: "enabled" },
  { id: "39", name: "INSTAPAY", status: "enabled" },
  { id: "40", name: "FSIBL", status: "enabled" },
  { id: "41", name: "EBLSKY", status: "enabled" },
  { id: "42", name: "PMONEY", status: "enabled" },
  { id: "43", name: "WOORI", status: "enabled" },
  { id: "44", name: "RAINBOW", status: "enabled" },
  { id: "45", name: "MTBL VISA", status: "disabled" },
  { id: "46", name: "MTBL MASTER", status: "disabled" },
  { id: "47", name: "BDBL", status: "enabled" },
  { id: "48", name: "MEGHNA", status: "enabled" },
  { id: "49", name: "GPDOB", status: "enabled" },
  { id: "50", name: "POCKET", status: "enabled" },
  { id: "51", name: "CITIZEN", status: "enabled" },
  { id: "52", name: "MEGHNAPAY", status: "enabled" },
  { id: "53", name: "MIDLAND", status: "enabled" },
  { id: "54", name: "SSL BNPL", status: "disabled" },
  { id: "55", name: "PUBALI", status: "enabled" },
  { id: "56", name: "SBAC", status: "disabled" },
  { id: "57", name: "PATHAOPAY", status: "enabled" },
  { id: "58", name: "STPAY", status: "enabled" },
  { id: "59", name: "CASHBABA", status: "enabled" },
];

export function MerchantViewGatewayDrawer({
  merchant,
  onClose,
}: MerchantViewGatewayDrawerProps) {
  const [localFilters, setLocalFilters] = useState<any>({
    gatewayName: "",
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const filteredGateways = useMemo(() => {
    return MOCK_GATEWAYS.filter((gw) =>
      gw.name
        .toLowerCase()
        .includes((localFilters.gatewayName || "").toLowerCase()),
    );
  }, [localFilters.gatewayName]);

  // Grouping gateways
  const { assigned, available } = useMemo(() => {
    return {
      assigned: filteredGateways.filter((g) => g.status === "enabled"),
      available: filteredGateways.filter((g) => g.status === "disabled"),
    };
  }, [filteredGateways]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalFilters({ gatewayName: "" });
  };

  if (!merchant) return null;

  return (
    <Drawer
      open={!!merchant}
      onClose={onClose}
      title="View Gateway"
      width="5xl"
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
                <XCircle className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          <div className="flex flex-col gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-1">
                    {assigned.map((gw, idx) => (
                      <div
                        key={gw.id}
                        className="flex items-center gap-2 py-0.5 px-2 rounded transition-all border border-transparent select-none bg-white cursor-default group"
                      >
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
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-slate-900 uppercase tracking-widest px-1">
                    Available Gateways
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-1">
                    {available.map((gw, idx) => (
                      <div
                        key={gw.id}
                        className="flex items-center gap-2 py-0.5 px-2 rounded transition-all border border-transparent select-none bg-white cursor-default group opacity-85"
                      >
                        <span className="text-[11px] font-bold text-slate-500 truncate leading-tight flex items-center gap-1.5 py-1.5">
                          <span className="text-slate-300 font-bold shrink-0">
                            {assigned.length + idx + 1}.
                          </span>
                          <span className="truncate">{gw.name}</span>
                          {gw.isSpecial && (
                            <span className="ml-1 text-slate-300 font-bold shrink-0 text-[10px]">
                              (Disabled)
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

        {/* No sticky footer as requested */}
      </div>
    </Drawer>
  );
}
