import { Drawer } from "../../components/Drawer";
import { Copy, CheckCircle } from "lucide-react";
import type { MerchantUser } from "../../data/mock/types";
import { useState } from "react";
import clsx from "clsx";

interface MerchantUserDrawerProps {
  user: MerchantUser | null;
  onClose: () => void;
}

export function MerchantUserDrawer({ user, onClose }: MerchantUserDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) return null;

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-[11px] font-bold text-slate-400 mt-8 mb-3 uppercase tracking-[0.1em]">
      {title}
    </h3>
  );

  const DetailRow = ({
    label,
    value,
    copyable = false,
    mono = false,
    color,
  }: {
    label: string;
    value: string | undefined;
    copyable?: boolean;
    mono?: boolean;
    color?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 text-sm">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd
        className={clsx(
          "flex items-center gap-2 text-right font-semibold",
          color ? color : "text-slate-900",
        )}
      >
        <span className={clsx("break-all", mono && "font-mono text-xs")}>
          {value || "—"}
        </span>
        {copyable && value && value !== "—" && (
          <button
            onClick={() => handleCopy(value, label)}
            className={clsx(
              "p-0.5 rounded transition-all",
              copiedId === label
                ? "text-slate-900 bg-slate-100"
                : "text-slate-300 hover:text-slate-500",
            )}
            title="Copy"
          >
            {copiedId === label ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </dd>
    </div>
  );

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">User Details</div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <span className="font-mono text-slate-400">{user.loginId}</span>
        <button
          onClick={() => handleCopy(user.loginId, "header_id")}
          className="text-slate-300 hover:text-slate-500"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <Drawer open={!!user} onClose={onClose} title={customTitle} width="lg">
      <div className="pb-20 space-y-2">
        {/* Login Information Card */}
        <SectionHeader title="Login Information" />
        <div className="bg-white rounded-xl border border-slate-200 px-5 shadow-sm">
          <DetailRow label="User Login Id" value={user.loginId} copyable mono />
          <DetailRow label="Password" value={user.password || "•••••"} />
          <DetailRow label="User Role" value={user.role} />
          <DetailRow
            label="Status"
            value={user.status}
            color="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase font-bold"
          />
        </div>

        {/* Contact Information Card */}
        <SectionHeader title="Customer Information" />
        <div className="bg-white rounded-xl border border-slate-200 px-5 shadow-sm">
          <DetailRow label="Customer Name" value={fullName} />
          <DetailRow
            label="Customer Email"
            value={user.email}
            copyable
            color="text-slate-700"
          />
          <DetailRow
            label="Customer Mobile"
            value={user.mobile}
            copyable
            color="text-slate-700 font-mono"
          />
          <DetailRow label="Customer Phone" value={user.phone} />
          <DetailRow label="User Added By" value={user.addedBy} />
          <DetailRow label="Added On" value={user.addedOn} />
        </div>
      </div>
    </Drawer>
  );
}
