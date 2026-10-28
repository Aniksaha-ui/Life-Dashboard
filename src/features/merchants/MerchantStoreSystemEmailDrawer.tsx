import React, { useState } from "react";
import { Drawer } from "../../components/Drawer";
import { Mail, CheckCircle2, Copy, CheckCircle } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface MerchantStoreSystemEmailDrawerProps {
  store: MerchantStore | null;
  merchantName?: string;
  onClose: () => void;
}

// ── Standard Section Header — matches Reseller/Merchant style ────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100 first:mt-0">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

// ── Standard DetailRow — matches MerchantDrawer pattern ──────────────────────
const DetailRow = ({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value?: string;
  copyable?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-4 transition-colors">
      <dt className="w-full sm:w-1/2 text-slate-500 font-medium">{label}</dt>
      <dd className="w-full sm:w-1/2 font-semibold text-slate-900 flex items-center gap-2">
        <span>{value || "—"}</span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className={clsx(
              "p-0.5 rounded transition-all",
              copied
                ? "text-primary-600"
                : "text-slate-300 hover:text-slate-500",
            )}
            title="Copy"
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </dd>
    </div>
  );
};

export function MerchantStoreSystemEmailDrawer({
  store,
  merchantName,
  onClose,
}: MerchantStoreSystemEmailDrawerProps) {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setIsSending(false);
    setIsSuccess(true);
    toast.success(`System email resent successfully!`);

    // Auto close after success
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 1500);
  };

  if (!store) return null;

  const customTitle = (
    <div className="flex flex-col gap-0.5">
      <div className="text-lg font-bold text-slate-900 leading-tight">
        Send System Email
      </div>
      <div className="text-xs text-primary-500 font-mono font-medium">
        {store.storeId}
      </div>
    </div>
  );

  return (
    <Drawer
      open={!!store}
      onClose={onClose}
      title={customTitle}
      width="xl"
      icon={<Mail className="w-5 h-5 text-primary-600" />}
    >
      <div className="pb-8">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Email Sent Successfully
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-[280px]">
                The system credentials for{" "}
                <span className="font-semibold text-slate-700">
                  {store.storeName}
                </span>{" "}
                have been resent.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── Store Information Section ── */}
            <section>
              <SectionHeader title="Store Information" />
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <DetailRow label="Merchant Name" value={merchantName} />
                <DetailRow label="Store Name" value={store.storeName} />
                <DetailRow label="Store ID" value={store.storeId} copyable />
              </div>
            </section>

            {/* ── Confirmation Prompt ── */}
            <section className="space-y-6">
              <SectionHeader title="Confirmation" />
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Mail className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Resend request confirmation
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to resend the system email for this
                    store? This will send the credentials to the merchant's
                    registered email address.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className={clsx(
                    "px-8 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2",
                    isSending && "cursor-wait",
                  )}
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {isSending ? "Sending Email..." : "Send System Email"}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </Drawer>
  );
}
