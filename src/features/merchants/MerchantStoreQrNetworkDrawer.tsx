import React, { useState } from "react";
import { Drawer } from "../../components/Drawer";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

// ── Components matching MerchantStoreDrawer UI pattern ───────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
    {title}
  </h3>
);

const DetailRow = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
    <dt className="w-full sm:w-1/2 text-slate-500 font-medium">{label}</dt>
    <dd className="w-full sm:w-1/2 font-medium text-slate-900 flex items-center gap-2">
      {value || children || (
        <span className="text-slate-400 italic font-normal">—</span>
      )}
    </dd>
  </div>
);

// ── Configurable Sections ────────────────────────────────────────────────────
interface NetworkSchema {
  id: string;
  label: string;
  checked: boolean;
}

const INITIAL_NETWORKS: NetworkSchema[] = [
  { id: "visa", label: "VISA|VISA", checked: false },
  { id: "master", label: "MASTERCARD|MASTERCARD", checked: false },
  { id: "unionpay", label: "UNIONPAY|UNIONPAY", checked: false },
  { id: "mtb", label: "MTBNPSBSSL|NPSB", checked: false },
  { id: "prb", label: "PRBLNPSBSSL|NPSB", checked: false },
  { id: "pso", label: "SSLCOMMERZPSONPSB|NPSB", checked: true },
  { id: "wlaman", label: "SSLCOMMERZWLAMANPSB|NPSB", checked: false },
  { id: "dhaka", label: "DHAKABANKNPSBSSL|NPSB", checked: false },
  { id: "scb", label: "SCBNPSBSSL|NPSB", checked: false },
];

const PAN_DATA = [
  { name: "visa", value: '{"tag_02":"4020040080000064"}' },
  { name: "master", value: '{"tag_04":"2713770620000069"}' },
  { name: "unionpay", value: '{"tag_15":"4161005000520446000000073000069"}' },
  { name: "local_bank", value: '{"tag_28":"1597530730000067"}' },
  {
    name: "npsb",
    value:
      '{"tag_26":"0014com.sslcommerz0102040204300203169300210000001183","tag_27":"9300210000001183"}',
  },
];

export function MerchantStoreQrNetworkDrawer({
  store,
  onClose,
  merchantName,
}: Props) {
  const [networks, setNetworks] = useState(INITIAL_NETWORKS);
  const [isUpdatingGateway, setIsUpdatingGateway] = useState(false);

  if (!store) return null;

  const handleToggleNetwork = (id: string) => {
    setNetworks((prev) =>
      prev.map((n) => (n.id === id ? { ...n, checked: !n.checked } : n)),
    );
  };

  const handleUpdateGateway = async () => {
    setIsUpdatingGateway(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsUpdatingGateway(false);
  };

  return (
    <Drawer
      open={!!store}
      onClose={onClose}
      title={
        <div>
          <div className="text-xl font-bold text-slate-900">
            Manage Store QR Network
          </div>
          <div className="text-sm font-normal text-slate-500 mt-1 uppercase tracking-tight font-mono">
            {store.storeId}
          </div>
        </div>
      }
      width="5xl"
    >
      <div className="space-y-8 min-h-full py-4 pb-20">
        {/* ── TOP SECTION: INFO CARDS ── */}
        <div className="space-y-8">
          {/* Store Information */}
          <section>
            <SectionTitle title="Store Information" />
            <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
              <DetailRow label="Store Name" value="SSLCOMMERZ" />
              <DetailRow label="Store ID" value={store.storeId} />
              <DetailRow label="Store Type" value="Online" />
              <DetailRow label="QR Code">
                <button className="text-primary-600 hover:text-primary-700 text-xs font-bold transition-colors">
                  Download the Bangla QR
                </button>
              </DetailRow>
              <DetailRow label="Enable Bangla QR">
                <button className="bg-primary-600 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-primary-700 transition-colors shadow-sm uppercase">
                  Enable Bangla QR
                </button>
              </DetailRow>
              <DetailRow label="Generate NPSB PAN">
                <button className="bg-primary-600 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-primary-700 transition-colors shadow-sm uppercase">
                  Generate NPSB PAN
                </button>
              </DetailRow>
            </div>
          </section>

          {/* Merchant Information */}
          <section>
            <SectionTitle title="Merchant Information" />
            <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
              <DetailRow
                label="Merchant Name"
                value={`${store.storeId} - ${merchantName || "WELCOME ELECTRONICS"}`}
              />
              <DetailRow label="Merchant Id" value={store.storeId} />
              <DetailRow label="Merchant Type" value="Online" />
            </div>
          </section>
        </div>

        {/* ── MIDDLE SECTION: QR NETWORK GATEWAY ── */}
        <section>
          <SectionTitle title="Qr Network Gateway" />
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-4">
              {/* Table Matrix */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight w-1/4">
                        Store Id
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight w-1/4">
                        Store Name
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        Network | Schema
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-6 text-sm text-slate-600 font-medium align-top font-mono">
                        {store.storeId}
                      </td>
                      <td className="px-4 py-6 text-sm text-slate-600 font-medium align-top">
                        SSLCOMMERZ
                      </td>
                      <td className="px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {networks.map((net) => (
                            <label
                              key={net.id}
                              className={clsx(
                                "flex items-center gap-2.5 p-2 rounded-md border transition-all cursor-pointer",
                                net.checked
                                  ? "bg-primary-50 border-primary-200 ring-1 ring-primary-100"
                                  : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={net.checked}
                                onChange={() => handleToggleNetwork(net.id)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"
                              />
                              <span
                                className={clsx(
                                  "text-[10px] font-bold uppercase tracking-tight truncate",
                                  net.checked
                                    ? "text-primary-700"
                                    : "text-slate-500",
                                )}
                                title={net.label}
                              >
                                {net.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4">
                <button
                  onClick={handleUpdateGateway}
                  disabled={isUpdatingGateway}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-primary-500/10 flex items-center gap-2.5 disabled:bg-slate-300 disabled:shadow-none uppercase tracking-wide"
                >
                  {isUpdatingGateway && (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {isUpdatingGateway ? "Updating Gateway..." : "Update Gateway"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM SECTION: MERCHANT PAN DATA ── */}
        <section>
          <SectionTitle title="Merchant Pan Data" />
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      Channel Name
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {PAN_DATA.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight px-2 py-0.5 rounded bg-slate-100 border border-slate-200/50 transition-all">
                          {row.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[11px] font-mono text-primary-600 bg-primary-50/30 px-2 py-1 rounded break-all leading-relaxed ring-1 ring-primary-50 group-hover:bg-primary-50 transition-all">
                          {row.value}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Drawer>
  );
}
