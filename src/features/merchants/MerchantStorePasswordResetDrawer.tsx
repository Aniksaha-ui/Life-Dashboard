import React, { useState } from "react";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import { KeyRound, ShieldAlert } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
}

export function MerchantStorePasswordResetDrawer({ store, onClose }: Props) {
  const [txCount, setTxCount] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!store) return null;

  const canReset = txCount === 0;

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsResetting(false);
    setIsConfirmOpen(false);
    toast.success(`Password reset link sent for ${store.storeName}!`);
  };

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">
        Store Summary & Actions
      </div>
      <div className="text-sm font-normal text-slate-500 flex items-center gap-2 mt-1">
        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
        <span>Store ID: </span>
        <span className="font-mono font-semibold text-slate-700">
          {store.storeId}
        </span>
      </div>
    </div>
  );

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="2xl">
      <div className="pb-16 space-y-8">
        {/* Section 1: Total Transactions */}
        <section className="space-y-1">
          <div className="flex items-center gap-2 text-base text-slate-900 font-bold">
            <span>Total Transactions Count:</span>
            <span className="text-xl font-black text-slate-900">{txCount}</span>
          </div>
          <div className="text-xs font-normal text-slate-500">
            (Last 90 Days)
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 2: Password Reset Action */}
        <section className="space-y-4">
          {canReset ? (
            <p className="text-xs text-slate-600">
              Password reset is allowed as the last 90 days transaction count is
              0.
            </p>
          ) : (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              Password reset is not allowed as the last 90 days transaction
              count is greater than 0.
            </p>
          )}

          <div>
            <button
              type="button"
              disabled={!canReset}
              onClick={() => setIsConfirmOpen(true)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold text-white transition-all shadow-sm",
                canReset
                  ? "bg-[#d9534f] hover:bg-[#c9302c] active:scale-95 cursor-pointer"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-200 shadow-none",
              )}
            >
              Reset Password
            </button>
          </div>
        </section>

        {/* Standard Project Confirmation Modal */}
        <Modal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Confirm Password Reset"
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "Yes, Reset Password"}
              </button>
            </>
          }
        >
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to reset the password for store{" "}
            <span className="font-semibold text-slate-900">
              {store.storeName}
            </span>{" "}
            ({store.storeId})? A new password reset link will be dispatched to
            the merchant's registered email address.
          </p>
        </Modal>
      </div>
    </Drawer>
  );
}
