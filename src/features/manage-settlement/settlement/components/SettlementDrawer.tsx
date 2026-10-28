import { clsx } from "clsx";
import { Mail } from "lucide-react";
import { Drawer } from "../../../../components/Drawer";
import type { SettlementDrawerProps } from "../types";
import { getStatusColor, getStatusIcon } from "./columns";
import { useSettlementDetails, useResendSettlementEmail } from "../api/queries";
import { toast } from "react-hot-toast";
import { CopyButton } from "../../../../components/CopyButton";
import { Loader } from "../../../../components/Loader";

export function SettlementDrawer({
  transactionId,
  onClose,
}: SettlementDrawerProps) {
  const { data: item, isLoading } = useSettlementDetails(transactionId);
  const { mutate: resendEmail, isPending: isResending } =
    useResendSettlementEmail();

  const handleResendEmail = () => {
    if (!transactionId) return;

    resendEmail(transactionId, {
      onSuccess: (data) => {
        toast.success(data?.message || "Email resent successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to resend email");
      },
    });
  };

  const DetailItem = ({
    label,
    value,
    mono = false,
    copyable = false,
  }: {
    label: string;
    value: string | number;
    mono?: boolean;
    copyable?: boolean;
    id?: string;
  }) => (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0 items-center">
      <span className="text-slate-500 text-sm">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span
          className={clsx(
            "text-slate-900 text-sm font-medium whitespace-pre-wrap break-all",
            mono && "font-mono text-xs",
          )}
        >
          {value !== undefined && value !== null && value !== "" ? value : "-"}
        </span>
        {copyable && value != null && value !== "" && (
          <CopyButton value={String(value)} />
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      open={!!transactionId}
      onClose={onClose}
      title={`Settlement Details`}
      subtitle={transactionId || ""}
      width="2xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader size="md" className="mb-4" />
          <p className="text-sm font-medium">Fetching details...</p>
        </div>
      ) : item ? (
        <div className="space-y-6">
          {/* Status Banner */}
          <div
            className={clsx(
              "p-4 rounded-lg flex items-center justify-between gap-3 border border-slate-200",
              getStatusColor(item.status.label),
            )}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status.label) && (
                <div className="p-2 bg-white/50 rounded-full">
                  {(() => {
                    const Icon = getStatusIcon(item.status.label);
                    return Icon && <Icon className="w-5 h-5" />;
                  })()}
                </div>
              )}
              <div>
                <p className="font-bold text-sm uppercase tracking-tight">
                  Status: {item.status.label}
                </p>
                <p className="text-[10px] opacity-90 font-medium font-mono">
                  ID: {item.transaction_id}
                </p>
              </div>
            </div>
            {item.actions?.resend_email?.enabled && (
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-primary-600 rounded-md shadow-sm border border-primary-100 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <Loader size="xs" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                {isResending ? "Resending..." : "Resend Email"}
              </button>
            )}
          </div>

          {/* Transaction Summary Table */}
          {item.transaction_summary && item.transaction_summary.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Transaction Summary
              </h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-bold text-slate-700">
                        Type
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">
                        No of Trans
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">
                        SSL Amt
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">
                        Bank Amt
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">
                        Store Amt
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">
                        Deduct Amt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {item.transaction_summary.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-3 py-2 text-slate-600">{row.type}</td>
                        <td className="px-3 py-2 text-slate-900 font-medium text-right tabular-nums">
                          {row.no_of_trans}
                        </td>
                        <td className="px-3 py-2 text-slate-900 font-medium text-right tabular-nums">
                          ৳
                          {row.ssl_amt.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2 text-slate-900 font-medium text-right tabular-nums">
                          ৳
                          {row.bank_amt.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2 text-slate-900 font-medium text-right tabular-nums">
                          ৳
                          {row.store_amt.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2 text-slate-900 font-medium text-right tabular-nums">
                          ৳
                          {row.deduct_amt.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Information Table */}
          {item.payment_information && item.payment_information.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Payment Information
              </h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-bold text-slate-700">#</th>
                      <th className="px-3 py-2 font-bold text-slate-700">
                        Cheque Ref
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700">
                        Acct Payee
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">
                        Amount
                      </th>
                      <th className="px-3 py-2 font-bold text-slate-700">
                        Bank
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {item.payment_information.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-3 py-2 text-slate-500">
                          {row.cheque_sl}
                        </td>
                        <td className="px-3 py-2 text-slate-900 font-mono">
                          {row.cheque_ref}
                        </td>
                        <td className="px-3 py-2 text-slate-900">
                          {row.acct_payee}
                        </td>
                        <td className="px-3 py-2 text-slate-900 font-bold text-right tabular-nums">
                          ৳
                          {row.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{row.bank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* General Information */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              General Information
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <DetailItem
                label="Settlement Date"
                value={item.general_information.settlement_date}
              />
              <DetailItem
                label="Transaction ID"
                value={item.general_information.transaction_id}
                mono
                copyable
                id="det_txnId"
              />
              <DetailItem
                label="Reference No"
                value={item.general_information.reference_no}
                mono
                copyable
                id="det_refNo"
              />
              <DetailItem
                label="Merchant Name"
                value={item.general_information.merchant_name}
              />
              <DetailItem
                label="Store Name"
                value={item.general_information.store_name}
              />
              <DetailItem
                label="Settlement Type"
                value={item.general_information.settlement_type}
              />
              <DetailItem
                label="Total Amount"
                value={`৳${item.general_information.total_amount.toLocaleString()}`}
              />
            </div>
          </div>

          {/* Amount Stacking */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Amount Stacking
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <DetailItem
                label="Opening Amt"
                value={`৳${item.amount_stacking.opening_amt.toLocaleString()}`}
              />
              <DetailItem
                label="Payable Amt"
                value={`৳${item.amount_stacking.payable_amt.toLocaleString()}`}
              />
              <DetailItem
                label="Settle Amt"
                value={`৳${item.amount_stacking.settle_amt.toLocaleString()}`}
              />
              <DetailItem
                label="Paid Amt"
                value={`৳${item.amount_stacking.paid_amt.toLocaleString()}`}
              />
              <DetailItem
                label="Fwd Amt"
                value={`৳${item.amount_stacking.fwd_amt.toLocaleString()}`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Bank Account Details
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <DetailItem
                label="Payee Name"
                value={item.general_information.payee_name}
              />
              <DetailItem
                label="Bank Name"
                value={item.general_information.bank_name}
              />
              <DetailItem
                label="Branch Name"
                value={item.general_information.branch_name}
              />
              <DetailItem
                label="Account Number"
                value={item.general_information.account_no}
                mono
                copyable
                id="accNo"
              />
              <DetailItem
                label="Routing Number"
                value={item.general_information.routing_no}
                mono
                copyable
                id="rtNo"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <p className="text-sm font-medium">No details found.</p>
        </div>
      )}
    </Drawer>
  );
}
