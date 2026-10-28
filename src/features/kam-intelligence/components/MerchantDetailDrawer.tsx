import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Drawer } from "../../../components/Drawer";
import { merchants as localMerchants, suggest } from "../data";
import { api } from "../../../lib/api/client";
import { useNavigate } from "react-router-dom";
import { KamTaskList } from "./KamTaskList";

interface MerchantDetailDrawerProps {
  merchantId: number | null;
  mode?: "details" | "action";
  onClose: () => void;
}

export function MerchantDetailDrawer({
  merchantId,
  mode = "details",
  onClose,
}: MerchantDetailDrawerProps) {
  const navigate = useNavigate();

  // Fetch global merchant data
  const { data: merchant, isLoading } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () =>
      merchantId !== null
        ? api.merchants.get(String(merchantId))
        : Promise.resolve(null),
    enabled: merchantId !== null,
  });

  // Find local mock data for KAM logic
  const localM =
    merchantId !== null
      ? localMerchants.find((x) => x.id === merchantId)
      : null;

  // Fallback to local data if global merchant not found in mock DB
  const effectiveMerchant =
    merchant ||
    (localM
      ? {
          id: String(localM.id),
          name: localM.name,
          storeId: localM.storeId,
          sector: "Pureplay Ecommerce",
          gmv7d: localM.gmv,
          txCount7d: Math.floor(localM.gmv / 1200),
          successRate7d: localM.successRate,
          contactName: "N/A",
          contactPhone: "N/A",
          contactFax: "N/A",
          contactCountry: "Bangladesh",
          techSupportBy: "N/A",
          salesforce: "N/A",
          hunter: "N/A",
          incubator: "N/A",
          introducerKam: "N/A",
          currentKam: localM.kam,
          addedBy: "KAM System",
          updatedBy: "KAM System",
          updatedOn: localM.month,
        }
      : null);

  const handleViewFullProfile = () => {
    if (merchantId) navigate(`/merchants/profile/${merchantId}`);
  };

  if (isLoading) {
    return (
      <Drawer
        open={merchantId !== null}
        onClose={onClose}
        title="Merchant Detail"
        width="xl"
      >
        <div className="p-8 text-center text-slate-500">
          Loading merchant profile...
        </div>
      </Drawer>
    );
  }

  if (!effectiveMerchant) return null;

  // Header Title Component (Exact copy from MerchantsPage.tsx)
  const customTitle = (
    <div className="space-y-1">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        {effectiveMerchant.sector}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-slate-900">
          {effectiveMerchant.name}
        </span>
        <span className="text-sm text-slate-500">
          ID: {effectiveMerchant.storeId}
        </span>
        <button
          onClick={handleViewFullProfile}
          className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          View Full Profile
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  const failedTxCount = Math.round(
    effectiveMerchant.txCount7d * (1 - effectiveMerchant.successRate7d / 100),
  );

  return (
    <Drawer
      open={merchantId !== null}
      onClose={onClose}
      title={customTitle}
      width="xl"
    >
      <div className="space-y-6">
        {mode === "action" && (
          <div className="pt-2 pb-8 space-y-6">
            <div className="bg-blue-50 p-5 rounded-xl text-sm text-blue-900 leading-relaxed border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full -mr-12 -mt-12" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <b className="uppercase text-[10px] tracking-widest text-blue-800">
                    Recommendation
                  </b>
                </div>
                <p className="text-sm font-medium">
                  {localM
                    ? suggest(localM)
                    : "Proactive review required based on recent activity trends."}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl text-sm text-slate-800 leading-relaxed border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-slate-400 rounded-full" />
                <b className="uppercase text-[10px] tracking-widest text-slate-500">
                  Why this is recommended
                </b>
              </div>
              <p className="text-sm font-medium text-slate-900">
                Champion <span className="text-slate-400 mx-1">→</span> At Risk
                Giant over 4 months. GMV dropped from{" "}
                <span className="font-semibold text-rose-600">৳9.22L</span> to{" "}
                <span className="font-semibold text-rose-600">৳1.92L</span>.
                Immediate action needed.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (merchantId) {
                      navigate(
                        `/merchants/profile/${merchantId}?tab=analytics`,
                      );
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors"
                >
                  <span>View Merchant Analytics</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (merchantId) {
                      navigate(`/merchants/profile/${merchantId}?tab=history`);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <span>Open Full Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <KamTaskList
              merchantId={merchantId !== null ? String(merchantId) : undefined}
            />
          </div>
        )}

        {mode === "details" && (
          <>
            {/* KPI Strip (Exact copy from MerchantsPage.tsx) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Total TXN Volume
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  ৳{effectiveMerchant.gmv7d.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Total Txn Count
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {effectiveMerchant.txCount7d.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Txn Success Rate
                </p>
                <p
                  className={clsx(
                    "text-lg font-bold mt-1",
                    effectiveMerchant.successRate7d > 90
                      ? "text-emerald-600"
                      : "text-amber-600",
                  )}
                >
                  {effectiveMerchant.successRate7d}%
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Failed Tx count
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {failedTxCount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Disputes
                </p>
                <p className="text-lg font-bold text-rose-600 mt-1">3</p>
              </div>
            </div>

            {/* Information Sections (Exact copy from MerchantsPage.tsx) */}
            <div className="space-y-8 pb-8">
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                  Contact Information
                </h3>
                <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100 shadow-sm">
                  <DetailRow
                    label="Name"
                    value={effectiveMerchant.contactName}
                  />
                  <DetailRow
                    label="Phone"
                    value={effectiveMerchant.contactPhone}
                  />
                  <DetailRow label="Fax" value={effectiveMerchant.contactFax} />
                  <DetailRow
                    label="Country"
                    value={effectiveMerchant.contactCountry}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                  Support & Assignment Information
                </h3>
                <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100 shadow-sm">
                  <DetailRow
                    label="Technical Support By"
                    value={effectiveMerchant.techSupportBy}
                  />
                  <DetailRow
                    label="SSLCommerz Salesforce"
                    value={effectiveMerchant.salesforce}
                  />
                  <DetailRow label="Hunter" value={effectiveMerchant.hunter} />
                  <DetailRow
                    label="Incubator"
                    value={effectiveMerchant.incubator}
                  />
                  <DetailRow
                    label="Introducer (KAM)"
                    value={effectiveMerchant.introducerKam}
                  />
                  <DetailRow
                    label="Current KAM"
                    value={effectiveMerchant.currentKam}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                  Merchant Meta Information
                </h3>
                <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100 shadow-sm">
                  <DetailRow
                    label="Merchant Added By"
                    value={effectiveMerchant.addedBy}
                  />
                  <DetailRow
                    label="Merchant Updated By"
                    value={effectiveMerchant.updatedBy}
                  />
                  <DetailRow
                    label="Updated On"
                    value={effectiveMerchant.updatedOn}
                  />
                </div>
              </section>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 border-b border-slate-100 mb-8">
              <div className="h-64 border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-4">
                  GMV Trend (7d)
                </p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { v: 1000 },
                      { v: 1500 },
                      { v: 1200 },
                      { v: 1800 },
                      { v: 2000 },
                      { v: 2400 },
                      { v: 2200 },
                    ]}
                  >
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#295cab"
                      strokeWidth={2}
                      dot={false}
                    />
                    <XAxis hide />
                    <Tooltip
                      formatter={(value: number) => [
                        `৳${value.toLocaleString()}`,
                        "Amount",
                      ]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-4">
                  Top Failure Reasons
                </p>
                <div className="space-y-3">
                  <FailureRow
                    label="Insufficient Funds"
                    value={245}
                    percentage={70}
                  />
                  <FailureRow
                    label="Auth Declined"
                    value={120}
                    percentage={40}
                  />
                  <FailureRow label="3DS Failed" value={45} percentage={15} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

// Helper components (Exact Copy from MerchantsPage.tsx)
const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
    <dt className="w-full sm:w-1/3 text-slate-500 font-medium">{label}</dt>
    <dd className="w-full sm:w-2/3 text-slate-900">
      {value || "Not Assigned"}
    </dd>
  </div>
);

const FailureRow = ({
  label,
  value,
  percentage,
}: {
  label: string;
  value: number;
  percentage: number;
}) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-600">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-rose-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  </div>
);
