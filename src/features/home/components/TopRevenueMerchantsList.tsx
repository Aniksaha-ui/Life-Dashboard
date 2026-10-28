import { Users } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState";
import { formatNumber } from "../../../utils/format";

interface TopRevenueMerchantsListProps {
  data?: any[];
}

export function TopRevenueMerchantsList({
  data,
}: TopRevenueMerchantsListProps) {
  const merchants = data || [];

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Top 10 Revenue Merchants
      </p>

      {merchants.length === 0 ? (
        <EmptyState title="No Merchants Found" icon={Users} />
      ) : (
        <div className="divide-y divide-slate-100">
          {merchants?.map((merchant: any) => (
            <div
              key={merchant.id || merchant.merchant_id}
              className="flex items-center justify-between py-3 hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                  {merchant.name || merchant.merchant_name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {merchant.storeId || merchant.merchant_id}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  ৳
                  {formatNumber(
                    merchant.value || merchant.amount || merchant.revenue,
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
