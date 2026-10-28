import { useState } from "react";
import { clsx } from "clsx";
import { CampaignStoreRequestSection } from "./CampaignStoreRequestSection";
import {
  PARTICIPATING_STORES_MOCK,
  mapParticipatingStoreToRequestRow,
} from "../utils/participatingStores";

type StoreCampaignViewTab =
  | "campaign-details"
  | "participating"
  | "invited"
  | "rejected"
  | "offer-details";

const participatingRows = PARTICIPATING_STORES_MOCK.map(
  mapParticipatingStoreToRequestRow,
);

export function StoreCampaignViewTabs({
  detailsContent,
  participatingContent,
  invitedContent,
  rejectedContent,
  offerDetailsContent,
  defaultTab = "campaign-details",
}: {
  detailsContent: React.ReactNode;
  participatingContent?: React.ReactNode;
  invitedContent?: React.ReactNode;
  rejectedContent?: React.ReactNode;
  offerDetailsContent?: React.ReactNode;
  defaultTab?: StoreCampaignViewTab;
}) {
  const [activeTab, setActiveTab] = useState<StoreCampaignViewTab>(defaultTab);

  const tabs: { id: StoreCampaignViewTab; label: string }[] = [
    { id: "campaign-details", label: "Campaign Details" },
    { id: "participating", label: "Participating" },
    { id: "invited", label: "Invited" },
    { id: "rejected", label: "Rejected" },
    ...(offerDetailsContent
      ? [{ id: "offer-details" as const, label: "Offer Details" }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-8 border-b border-slate-200 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "pb-3 pt-0 text-sm font-bold transition-all relative cursor-pointer",
              activeTab === tab.id
                ? "text-primary-600"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "campaign-details" && detailsContent}
      {activeTab === "participating" &&
        (participatingContent ?? (
          <CampaignStoreRequestSection
            title="Participating"
            hideTitle
            rows={participatingRows}
          />
        ))}
      {activeTab === "invited" &&
        (invitedContent ?? (
          <CampaignStoreRequestSection
            title="Invited"
            hideTitle
            rows={[]}
            emptyMessage="No invited stores found for this campaign."
          />
        ))}
      {activeTab === "rejected" &&
        (rejectedContent ?? (
          <CampaignStoreRequestSection
            title="Rejected"
            hideTitle
            rows={[]}
            emptyMessage="No rejected stores found for this campaign."
          />
        ))}
      {activeTab === "offer-details" && offerDetailsContent}
    </div>
  );
}

export type { StoreCampaignViewTab };
