import { useState } from "react";
import { clsx } from "clsx";

export function CampaignViewDetailsTabs({
  storeRequestContent,
  detailsContent,
  defaultTab = "campaign-details",
  secondaryTabLabel = "Merchant List",
}: {
  storeRequestContent: React.ReactNode;
  detailsContent: React.ReactNode;
  defaultTab?: "store-requests" | "campaign-details";
  secondaryTabLabel?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    "store-requests" | "campaign-details"
  >(defaultTab);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-8 border-b border-slate-200 px-1">
        <button
          type="button"
          onClick={() => setActiveTab("campaign-details")}
          className={clsx(
            "pb-2.5 pt-0 text-sm font-bold transition-all relative",
            activeTab === "campaign-details"
              ? "text-primary-600"
              : "text-slate-400 hover:text-slate-600",
          )}
        >
          Campaign Details
          {activeTab === "campaign-details" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("store-requests")}
          className={clsx(
            "pb-2.5 pt-0 text-sm font-bold transition-all relative",
            activeTab === "store-requests"
              ? "text-primary-600"
              : "text-slate-400 hover:text-slate-600",
          )}
        >
          {secondaryTabLabel}
          {activeTab === "store-requests" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "campaign-details" ? detailsContent : storeRequestContent}
    </div>
  );
}
