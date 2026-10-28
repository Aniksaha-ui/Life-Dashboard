import React, { useState, useEffect } from "react";
import { Drawer } from "../../components/Drawer";
import { CreditCard } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";

// ── Mock Data for Banks matching screenshots ──────────────────────────────────
const generateBankEmi = (
  name: string,
  tenures: number[],
  storeRateMap: Record<number, string>,
  bankRateMap: Record<number, string>,
) => ({
  name,
  isEnabled: true,
  isConfigured: true,
  items: tenures.map((t) => ({
    tenure: `${t} Months`,
    storeRate: storeRateMap[t] || "0.0000",
    bankRate: bankRateMap[t] || "0.000",
    isActive: true,
  })),
});

const defaultStoreRate: Record<number, string> = {
  3: "0.0300",
  6: "0.045",
  9: "0.065",
  12: "0.085",
  18: "0.115",
  24: "0.155",
  30: "0.165",
  36: "0.195",
};

const INITIAL_BANKS = [
  generateBankEmi(
    "AB BANK LIMITED",
    [3, 6, 9, 12, 18, 24, 30, 36],
    defaultStoreRate,
    {
      3: "0.020",
      6: "0.035",
      9: "0.050",
      12: "0.070",
      18: "0.090",
      24: "0.100",
      30: "0.130",
      36: "0.1450",
    },
  ),
  generateBankEmi("BANK ASIA LIMITED", [3, 6, 9, 12], defaultStoreRate, {
    3: "0.025",
    6: "0.040",
    9: "0.060",
    12: "0.080",
  }),
  generateBankEmi(
    "BRAC BANK LIMITED",
    [3, 6, 9, 12, 18, 24],
    defaultStoreRate,
    {
      3: "0.020",
      6: "0.040",
      9: "0.050",
      12: "0.070",
      18: "0.100",
      24: "0.130",
    },
  ),
  generateBankEmi(
    "CITY BANK LIMITED",
    [3, 6, 9, 12, 18, 24, 30, 36],
    defaultStoreRate,
    {
      3: "0.025",
      6: "0.040",
      9: "0.050",
      12: "0.060",
      18: "0.090",
      24: "0.120",
      30: "0.140",
      36: "0.150",
    },
  ),
  generateBankEmi("DHAKA BANK LIMITED", [3, 6, 9, 12], defaultStoreRate, {
    3: "0.020",
    6: "0.035",
    9: "0.050",
    12: "0.070",
  }),
  generateBankEmi(
    "DUTCH BANGLA BANK",
    [3, 6, 9, 12, 18, 24, 36],
    defaultStoreRate,
    {
      3: "0.020",
      6: "0.040",
      9: "0.060",
      12: "0.080",
      18: "0.100",
      24: "0.120",
      36: "0.150",
    },
  ),
  generateBankEmi("EASTERN BANK", [3, 6, 9, 12, 18, 24, 36], defaultStoreRate, {
    3: "0.025",
    6: "0.040",
    9: "0.060",
    12: "0.080",
    18: "0.105",
    24: "0.140",
    36: "0.190",
  }),
  generateBankEmi("EXIM BANK", [3, 6, 9, 12], defaultStoreRate, {
    3: "0.020",
    6: "0.040",
    9: "0.060",
    12: "0.080",
  }),
  generateBankEmi("JAMUNA BANK", [3, 6, 9, 12, 18, 24, 36], defaultStoreRate, {
    3: "0.025",
    6: "0.0375",
    9: "0.050",
    12: "0.065",
    18: "0.110",
    24: "0.150",
    36: "0.190",
  }),
  generateBankEmi(
    "LANKABANGLA FINANCE",
    [3, 6, 9, 12, 18, 24, 36],
    {
      3: "0.035",
      6: "0.045",
      9: "0.065",
      12: "0.085",
      18: "0.115",
      24: "0.155",
      36: "0.195",
    },
    {
      3: "0.028",
      6: "0.0425",
      9: "0.060",
      12: "0.075",
      18: "0.105",
      24: "0.140",
      36: "0.21",
    },
  ),
  generateBankEmi(
    "MUTUAL TRUST BANK",
    [3, 6, 9, 12, 18, 24, 36],
    defaultStoreRate,
    {
      3: "0.025",
      6: "0.0375",
      9: "0.050",
      12: "0.065",
      18: "0.110",
      24: "0.150",
      36: "0.190",
    },
  ),
  generateBankEmi("NCC BANK", [3, 6, 9, 12, 18, 24, 36], defaultStoreRate, {
    3: "0.020",
    6: "0.035",
    9: "0.050",
    12: "0.070",
    18: "0.100",
    24: "0.120",
    36: "0.150",
  }),
  generateBankEmi("PRIME BANK", [3, 6, 9, 12, 18, 24, 36], defaultStoreRate, {
    3: "0.025",
    6: "0.040",
    9: "0.050",
    12: "0.060",
    18: "0.100",
    24: "0.120",
    36: "0.150",
  }),
  generateBankEmi("SHAHJALAL ISLAMI BANK", [3, 6, 9, 12], defaultStoreRate, {
    3: "0.020",
    6: "0.035",
    9: "0.050",
    12: "0.070",
  }),
  generateBankEmi(
    "SOUTHEAST BANK",
    [3, 6, 9, 12, 18, 24, 30, 36],
    defaultStoreRate,
    {
      3: "0.025",
      6: "0.030",
      9: "0.050",
      12: "0.070",
      18: "0.100",
      24: "0.140",
      30: "0.160",
      36: "0.180",
    },
  ),
  generateBankEmi("STANDARD BANK", [3, 6, 9, 12, 18, 24], defaultStoreRate, {
    3: "0.020",
    6: "0.040",
    9: "0.050",
    12: "0.070",
    18: "0.100",
    24: "0.100",
  }),
  generateBankEmi(
    "STANDARD CHARTERED BANK",
    [3, 6, 9, 12, 18, 24, 36],
    {
      3: "0.035",
      6: "0.055",
      9: "0.080",
      12: "0.1050",
      18: "0.1350",
      24: "0.175",
      36: "0.225",
    },
    {
      3: "0.030",
      6: "0.050",
      9: "0.075",
      12: "0.1000",
      18: "0.1300",
      24: "0.170",
      36: "0.230",
    },
  ),
  generateBankEmi(
    "UNITED COMMERCIAL BANK",
    [3, 6, 9, 12, 24],
    defaultStoreRate,
    { 3: "0.020", 6: "0.040", 9: "0.060", 12: "0.080", 24: "0.140" },
  ),
  generateBankEmi(
    "NRB COMMERCIAL BANK LTD",
    [3, 6, 9, 12, 18, 24],
    defaultStoreRate,
    {
      3: "0.020",
      6: "0.030",
      9: "0.050",
      12: "0.0600",
      18: "0.0900",
      24: "0.1000",
    },
  ),
  generateBankEmi(
    "NRB Bank Limited",
    [3, 6, 9, 12, 18, 24, 36],
    defaultStoreRate,
    {
      3: "0.020",
      6: "0.0375",
      9: "0.060",
      12: "0.080",
      18: "0.100",
      24: "0.130",
      36: "0.170",
    },
  ),
  generateBankEmi(
    "Meghna Bank Limited",
    [3, 6, 9, 12, 18, 24],
    defaultStoreRate,
    {
      3: "0.015",
      6: "0.035",
      9: "0.050",
      12: "0.060",
      18: "0.080",
      24: "0.100",
    },
  ),
  generateBankEmi("SBAC Bank", [3, 6, 9, 12, 18, 24], defaultStoreRate, {
    3: "0.025",
    6: "0.0425",
    9: "0.060",
    12: "0.080",
    18: "0.110",
    24: "0.140",
  }),
  generateBankEmi("Midland Bank Ltd", [3, 6, 9, 12, 18, 24], defaultStoreRate, {
    3: "0.020",
    6: "0.035",
    9: "0.050",
    12: "0.075",
    18: "0.115",
    24: "0.150",
  }),
  generateBankEmi("Shimanto Bank", [3, 6, 9, 12, 18, 24], defaultStoreRate, {
    3: "0.020",
    6: "0.035",
    9: "0.045",
    12: "0.070",
    18: "0.090",
    24: "0.115",
  }),
];

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
}

export function MerchantStoreEmiDrawer({ store, onClose }: Props) {
  const [banks, setBanks] = useState(INITIAL_BANKS);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setBanks(INITIAL_BANKS);
      setIsSuccess(false);
    }
  }, [store]);

  if (!store) return null;

  const handleToggleAll = (active: boolean) => {
    setBanks((prev) =>
      prev.map((bank) => ({
        ...bank,
        items: bank.items.map((item) => ({ ...item, isActive: active })),
      })),
    );
  };

  const handleBankEnable = (bankIndex: number, enabled: boolean) => {
    setBanks((prev) => {
      const next = [...prev];
      next[bankIndex] = { ...next[bankIndex], isEnabled: enabled };
      return next;
    });
  };

  const handleItemChange = (
    bankIndex: number,
    itemIndex: number,
    field: "storeRate" | "isActive",
    value: any,
  ) => {
    setBanks((prev) => {
      const next = [...prev];
      const items = [...next[bankIndex].items];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      next[bankIndex] = { ...next[bankIndex], items };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1600);
  };

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">EMI Configuration</div>
      <div className="text-sm font-normal text-slate-500 mt-1">
        <span className="font-mono">{store.storeId}</span> -{" "}
        <span className="uppercase text-slate-700 font-semibold">
          {store.storeName}
        </span>
      </div>
    </div>
  );

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="4xl">
      <div className="pb-28">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-5 py-24">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
              <CreditCard className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">
                EMI Configuration Updated
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                EMI properties for{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {store.storeId}
                </span>{" "}
                have been saved.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2">
            {/* ── Global Controls ── */}
            <div className="mb-6 flex items-center gap-1.5 text-xs text-slate-600">
              Easy selection by clicking -
              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                className="text-primary-600 font-bold hover:underline px-1"
              >
                Checked All
              </button>{" "}
              |
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                className="text-primary-600 font-bold hover:underline px-1"
              >
                Unchecked All
              </button>
            </div>

            {/* ── Bank Grid (Masonry) ── */}
            <div className="columns-1 md:columns-2 lg:columns-2 gap-6 space-y-6">
              {banks.map((bank, bankIdx) => (
                <div
                  key={bank.name}
                  className="border border-slate-200 rounded overflow-hidden flex flex-col bg-white break-inside-avoid"
                >
                  {/* Bank Header */}
                  <div className="bg-primary-600 text-white px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                    {bank.name}
                  </div>

                  <div className="p-4 flex-1">
                    {/* Bank Enable Toggle */}
                    <label className="flex items-center gap-2 mb-4 text-xs text-slate-700 cursor-pointer w-max pl-1">
                      <input
                        type="checkbox"
                        checked={bank.isEnabled}
                        onChange={(e) =>
                          handleBankEnable(bankIdx, e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded-sm border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>
                        Whether the Bank is Enable |{" "}
                        <span className="text-emerald-600 font-bold">
                          (Already Configured)
                        </span>
                      </span>
                    </label>

                    {/* Rates Table */}
                    <div className="w-full text-[11px]">
                      <div className="grid grid-cols-4 gap-2 mb-2 px-1 font-bold text-slate-800">
                        <div>Tenure</div>
                        <div>Store Rate</div>
                        <div>Bank Rate</div>
                        <div className="text-center">Is Active</div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {bank.items.map((item, itemIdx) => (
                          <div
                            key={item.tenure}
                            className="grid grid-cols-4 gap-2 items-center py-2 px-1 hover:bg-slate-50 transition-colors"
                          >
                            <div className="text-slate-600 font-medium">
                              {item.tenure}
                            </div>
                            <div>
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-[11px] border border-slate-200 shadow-inner rounded focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none"
                                value={item.storeRate}
                                onChange={(e) =>
                                  handleItemChange(
                                    bankIdx,
                                    itemIdx,
                                    "storeRate",
                                    e.target.value,
                                  )
                                }
                                disabled={!bank.isEnabled}
                              />
                            </div>
                            <div className="text-slate-700 font-mono tracking-tight pl-2">
                              {item.bankRate}
                            </div>
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded-sm border-[1.5px] border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                checked={item.isActive}
                                onChange={(e) =>
                                  handleItemChange(
                                    bankIdx,
                                    itemIdx,
                                    "isActive",
                                    e.target.checked,
                                  )
                                }
                                disabled={!bank.isEnabled}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Sticky Footer ── */}
            <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-5 py-2.5 rounded text-xs hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {isSubmitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Update EMI Configuration
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
