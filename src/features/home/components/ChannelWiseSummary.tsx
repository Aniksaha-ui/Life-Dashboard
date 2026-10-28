import { clsx } from "clsx";
import { Calendar, List } from "lucide-react";
import { useState } from "react";
import { Drawer } from "../../../components/Drawer";
import { Skeleton } from "../../../components/Skeleton";
import { formatNumber } from "../../../utils/format";
import type { ChannelSummaryItem, ChannelWiseSummaryData } from "../types";

interface ChannelWiseSummaryProps {
  data?: ChannelWiseSummaryData;
}

export function ChannelWiseSummary({ data }: ChannelWiseSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"txn_amount" | "txn_count">(
    "txn_amount",
  );

  const isLoading = !data;
  const channels = data?.[activeTab] || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex-1 space-y-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const topChannels = channels?.slice(0, 7) || [];

  const ChannelRow = ({ channel }: { channel: ChannelSummaryItem }) => {
    const value = channel[activeTab];
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{channel.channel}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {formatNumber(channel.percentage)}%
            </span>
            <span className="font-bold text-slate-900">
              {activeTab === "txn_amount"
                ? `৳${formatNumber(value)}`
                : formatNumber(value)}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${channel.percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const getPeriodLabel = () => "Selected Period";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Channel Wise Summary
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("txn_amount")}
            className={clsx(
              "px-3 py-1 rounded-full text-xs transition-all border",
              activeTab === "txn_amount"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-500 border-slate-200 font-medium hover:text-slate-700 hover:border-slate-300",
            )}
          >
            Txn Amount
          </button>
          <button
            onClick={() => setActiveTab("txn_count")}
            className={clsx(
              "px-3 py-1 rounded-full text-xs transition-all border",
              activeTab === "txn_count"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-500 border-slate-200 font-medium hover:text-slate-700 hover:border-slate-300",
            )}
          >
            Txn Count
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-5">
        {topChannels.length > 0 ? (
          topChannels.map((channel) => (
            <ChannelRow key={channel.channel} channel={channel} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
            <List className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No Channels Found</p>
            <p className="text-xs opacity-70">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          Expand list <List className="w-3.5 h-3.5" />
        </button>
      </div>

      <Drawer
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        title="Channel Wise Summary"
        width="lg"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-start gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("txn_amount")}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs transition-all border",
                  activeTab === "txn_amount"
                    ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                    : "bg-white text-slate-500 border-slate-200 font-medium hover:text-slate-700 hover:border-slate-300",
                )}
              >
                Txn Amount
              </button>
              <button
                onClick={() => setActiveTab("txn_count")}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs transition-all border",
                  activeTab === "txn_count"
                    ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                    : "bg-white text-slate-500 border-slate-200 font-medium hover:text-slate-700 hover:border-slate-300",
                )}
              >
                Txn Count
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              Showing for {getPeriodLabel()}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {channels?.map((channel) => (
              <div key={channel.channel} className="group">
                <ChannelRow channel={channel} />
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
