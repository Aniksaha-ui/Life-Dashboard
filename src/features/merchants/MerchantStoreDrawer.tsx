import { Drawer } from "../../components/Drawer";
import { Copy, CheckCircle } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { useState } from "react";
import clsx from "clsx";

interface MerchantStoreDrawerProps {
  store: MerchantStore | null;
  onClose: () => void;
}

// ── Matches MerchantsPage DetailRow ───────────────────────────────────────────
const DetailRow = ({
  label,
  value,
  valueColor,
  copyable = false,
}: {
  label: string;
  value?: string;
  valueColor?: string;
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
    <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
      <dt className="w-full sm:w-1/2 text-slate-500 font-medium">{label}</dt>
      <dd
        className={clsx(
          "w-full sm:w-1/2 font-medium flex items-center gap-2",
          valueColor ?? "text-slate-900",
        )}
      >
        <span>{value || "—"}</span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className={clsx(
              "p-0.5 rounded transition-all",
              copied ? "text-slate-900" : "text-slate-300 hover:text-slate-500",
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

// ── Section heading — matches MerchantsPage h3 style ─────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
    {title}
  </h3>
);

// ─────────────────────────────────────────────────────────────────────────────
export function MerchantStoreDrawer({
  store,
  onClose,
}: MerchantStoreDrawerProps) {
  if (!store) return null;

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">Store Information</div>
      <div className="text-sm text-slate-500 font-normal font-mono mt-1">
        {store.storeId}
      </div>
    </div>
  );

  // Derived / mocked extended fields (in production these would come from the API)
  const accountInfo = {
    payee: store.storeName.toUpperCase(),
    bank: "CITY BANK LIMITED",
    branchName: "ROKEYA SARANI",
    accountNumber: "1503384222001",
    routingNumber: "225260991",
    paymentType: "EFTN",
  };

  const settlementInfo = {
    status: store.status === "Active" ? "Enabled" : "Disabled",
    day: "Monday",
    type: "Net",
    maxAmount: "0.00",
    minAmount: "0.00",
  };

  const tranConfig = {
    defaultGatewayDuration: "5",
    androidPackageId: "",
    isoAppId: "",
    defaultVisaGw: "",
    defaultMasterCardGw: "",
    baseUrl: store.baseUrl,
    homePage: `https://${store.baseUrl}`,
    storeStatus: store.status,
  };

  const contactInfo = {
    name: store.storeName,
    mailingAddress: "test",
    email: `store@${store.baseUrl}`,
    mobile: "01694378309",
    phone: "",
    fax: "",
    addedBy: "System",
    createdOn: new Date().toLocaleString(),
  };

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="xl">
      <div className="space-y-8 pb-20">
        {/* ── Store Information ─────────────────────────────────── */}
        <section>
          <p className="text-xs text-slate-400 italic mb-4">
            (if 0, then BDT Max is 5 Lac) (if 0, then BDT start from 10)
          </p>
          <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
            <DetailRow label="Store Id" value={store.storeId} copyable />
            <DetailRow label="Store Name" value={store.storeName} />
          </div>
        </section>

        {/* ── Account Information ───────────────────────────────── */}
        <section>
          <SectionTitle title="Account Information" />
          <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
            <DetailRow label="Account Payee" value={accountInfo.payee} />
            <DetailRow label="Bank" value={accountInfo.bank} />
            <DetailRow label="Branch Name" value={accountInfo.branchName} />
            <DetailRow
              label="Account Number"
              value={accountInfo.accountNumber}
              copyable
            />
            <DetailRow
              label="Routing Number"
              value={accountInfo.routingNumber}
              copyable
            />
            <DetailRow label="Payment Type" value={accountInfo.paymentType} />
          </div>
        </section>

        {/* ── Settlement Information ────────────────────────────── */}
        <section>
          <SectionTitle title="Settlement Information" />
          <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
            <DetailRow
              label="Settl. Status"
              value={settlementInfo.status}
              valueColor={
                settlementInfo.status === "Disabled"
                  ? "text-rose-600"
                  : "text-emerald-600"
              }
            />
            <DetailRow label="Settl. Day" value={settlementInfo.day} />
            <DetailRow label="Settl. Type" value={settlementInfo.type} />
            <DetailRow
              label="Max Trans Amount"
              value={settlementInfo.maxAmount}
            />
            <DetailRow
              label="Min Trans Amount"
              value={settlementInfo.minAmount}
            />
          </div>
        </section>

        {/* ── Tran. Config ──────────────────────────────────────── */}
        <section>
          <SectionTitle title="Tran. Config" />
          <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
            <DetailRow
              label="Default Gateway Duration"
              value={tranConfig.defaultGatewayDuration}
            />
            <DetailRow
              label="Android Package Id"
              value={tranConfig.androidPackageId}
            />
            <DetailRow label="ISO App Id" value={tranConfig.isoAppId} />
            <DetailRow
              label="Default VISA GW"
              value={tranConfig.defaultVisaGw}
            />
            <DetailRow
              label="Default MASTER CARD GW"
              value={tranConfig.defaultMasterCardGw}
            />
            <DetailRow
              label="Base URL of Store"
              value={tranConfig.baseUrl}
              copyable
            />
            <DetailRow
              label="Home Page of Store"
              value={tranConfig.homePage}
              copyable
            />
            <DetailRow label="Store Status" value={tranConfig.storeStatus} />
          </div>
        </section>

        {/* ── Contact Information ───────────────────────────────── */}
        <section>
          <SectionTitle title="Contact Information" />
          <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
            <DetailRow label="Name" value={contactInfo.name} />
            <DetailRow
              label="Mailing Address"
              value={contactInfo.mailingAddress}
            />
            <DetailRow label="Email" value={contactInfo.email} copyable />
            <DetailRow label="Mobile" value={contactInfo.mobile} copyable />
            <DetailRow label="Phone" value={contactInfo.phone} />
            <DetailRow label="Fax" value={contactInfo.fax} />
            <DetailRow label="Store Added By" value={contactInfo.addedBy} />
            <DetailRow label="Created On" value={contactInfo.createdOn} />
          </div>
        </section>
      </div>
    </Drawer>
  );
}
