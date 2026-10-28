import React from "react";
import { Drawer } from "../../components/Drawer";
import type { MerchantStore } from "../../data/mock/types";

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

export function MerchantStoreDailyBalanceDrawer({ store, onClose }: Props) {
  if (!store) return null;

  return (
    <Drawer
      open={!!store}
      onClose={onClose}
      title={
        <div>
          <div className="text-xl font-bold text-slate-900">
            Store Daily Balance
          </div>
          <div className="text-sm font-normal text-slate-500 mt-1">
            Store ID:{" "}
            <span className="font-mono font-semibold text-slate-700">
              {store.storeId}
            </span>
          </div>
        </div>
      }
      width="4xl"
    >
      <div className="pb-12 space-y-6">
        {/* Summary Info */}
        <div className="flex items-center gap-2 text-base font-semibold text-slate-800 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          Total Balance: 0 | Unsettled Balance: 0
        </div>
      </div>
    </Drawer>
  );
}
