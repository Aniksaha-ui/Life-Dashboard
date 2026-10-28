import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Drawer } from "../../components/Drawer";
import { api } from "../../lib/api/client";
import { formatNumber } from "../../utils/format";
import {
  getResellerSettlementPaymentStatusBadgeClass,
  getResellerSettlementStatusBadgeClass,
} from "./utils/resellerSettlementStatus";
import { formatResellerDate } from "./utils/resellerDateFormat";

function SettlementDetailField({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row py-2 sm:py-0 sm:items-center text-sm min-w-0">
      <span className="w-full sm:w-[140px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] shrink-0 py-1.5">
        {label}
      </span>
      <div className="w-full sm:flex-1 text-slate-900 leading-snug break-words text-left py-0.5">
        {value ?? "—"}
      </div>
    </div>
  );
}

function SettlementDetailPairRow({
  left,
  right,
}: {
  left: { label: string; value?: React.ReactNode };
  right: { label: string; value?: React.ReactNode };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-2 text-sm">
      <SettlementDetailField label={left.label} value={left.value} />
      <SettlementDetailField label={right.label} value={right.value} />
    </div>
  );
}

export function ResellerSettlementDetailDrawer() {
  const { settlementId } = useParams();
  const navigate = useNavigate();

  const { data: settlement, isLoading } = useQuery({
    queryKey: ["reseller-settlement", settlementId],
    queryFn: () => api.resellerSettlements.get(settlementId!),
    enabled: !!settlementId,
  });

  const onClose = () => {
    navigate("/resellers/settlements");
  };

  if (isLoading || !settlement) {
    return (
      <Drawer
        open={true}
        onClose={onClose}
        title="Settlement Details"
        width="4xl"
        noPadding={true}
      >
        <div className="bg-[#f4f7f9] p-8 text-center text-slate-500">
          Loading settlement details...
        </div>
      </Drawer>
    );
  }

  const customTitle = (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-lg font-bold text-slate-900">
          {settlement.resellerName}
        </span>
        <span
          className={getResellerSettlementPaymentStatusBadgeClass(
            settlement.paymentStatus,
          )}
        >
          {settlement.paymentStatus}
        </span>
      </div>
      <span className="text-sm text-slate-500 font-medium mt-1">
        Store ID: {settlement.storeId}
      </span>
    </div>
  );

  return (
    <Drawer
      open={true}
      onClose={onClose}
      title={customTitle}
      width="4xl"
      noPadding={true}
    >
      <div className="bg-[#f4f7f9] p-8 pb-8 overflow-y-auto custom-scrollbar h-full">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-1 divide-y divide-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center py-3 text-sm">
              <dt className="w-full sm:w-[140px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0 text-left">
                Reseller
              </dt>
              <dd className="w-full sm:flex-1 text-slate-900 text-base font-bold leading-tight py-0.5 text-left">
                {settlement.resellerName}
              </dd>
            </div>

            <SettlementDetailPairRow
              left={{
                label: "DateTime",
                value: formatResellerDate(settlement.date),
              }}
              right={{
                label: "Store Id",
                value: settlement.storeId,
              }}
            />
            <SettlementDetailPairRow
              left={{
                label: "No of Transaction",
                value: settlement.transactionCount,
              }}
              right={{
                label: "Transaction Amount",
                value: formatNumber(settlement.transactionAmount),
              }}
            />
            <SettlementDetailPairRow
              left={{
                label: "Payable Amount",
                value: formatNumber(settlement.payable),
              }}
              right={{
                label: "Deduct Amount (for full refund)",
                value: formatNumber(settlement.deductAmount),
              }}
            />
            <SettlementDetailPairRow
              left={{
                label: "No of Missing Commission",
                value: settlement.missingCommissionCount,
              }}
              right={{
                label: "Settlement Date",
                value: settlement.settlementDate
                  ? formatResellerDate(settlement.settlementDate)
                  : "—",
              }}
            />
            <SettlementDetailPairRow
              left={{
                label: "Settlement Status",
                value: (
                  <span
                    className={getResellerSettlementStatusBadgeClass(
                      settlement.settlementStatus,
                    )}
                  >
                    {settlement.settlementStatus}
                  </span>
                ),
              }}
              right={{
                label: "Settlement Batch No",
                value: settlement.settlementBatchNo || "—",
              }}
            />
            <SettlementDetailPairRow
              left={{
                label: "Payment Status",
                value: (
                  <span
                    className={getResellerSettlementPaymentStatusBadgeClass(
                      settlement.paymentStatus,
                    )}
                  >
                    {settlement.paymentStatus}
                  </span>
                ),
              }}
              right={{
                label: "Created on",
                value: formatResellerDate(settlement.createdOn),
              }}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}
