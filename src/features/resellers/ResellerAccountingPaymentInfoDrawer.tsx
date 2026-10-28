import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Drawer } from "../../components/Drawer";
import { api } from "../../lib/api/client";
import { formatNumber } from "../../utils/format";
import { formatResellerDate } from "./utils/resellerDateFormat";

export function ResellerAccountingPaymentInfoDrawer() {
  const { accountingId } = useParams();
  const navigate = useNavigate();

  const { data: record, isLoading } = useQuery({
    queryKey: ["reseller-accounting", accountingId],
    queryFn: () => api.resellerAccounting.get(accountingId!),
    enabled: !!accountingId,
  });

  const onClose = () => {
    navigate("/resellers/accounting");
  };

  if (isLoading || !record) {
    return (
      <Drawer
        open={true}
        onClose={onClose}
        title="Payment Info"
        width="4xl"
        noPadding={true}
      >
        <div className="bg-[#f4f7f9] p-8 text-center text-slate-500">
          Loading payment info...
        </div>
      </Drawer>
    );
  }

  const customTitle = (
    <div className="flex flex-col">
      <span className="text-lg font-bold text-slate-900">Payment Info</span>
      <span className="text-sm text-slate-500 font-medium mt-1">
        {record.bankAccountName} · {formatResellerDate(record.settlementDate)}
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
        <div className="bg-white overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Cheque Ref</th>
                <th className="px-4 py-3">Acct Payee</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3">Attachment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {record.paymentInfo.map((payment, index) => (
                <tr
                  key={payment.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">
                    {payment.chequeRef}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {payment.acctPayee}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    {formatNumber(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {payment.bank}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {payment.attachment || "—"}
                  </td>
                </tr>
              ))}
              {record.paymentInfo.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No payment info found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Drawer>
  );
}
