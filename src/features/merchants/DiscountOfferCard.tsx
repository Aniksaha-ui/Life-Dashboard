import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { DiscountCampaign } from "./StoreDiscountPage";

interface DiscountOfferCardProps {
  campaign: DiscountCampaign;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DiscountOfferCard({
  campaign,
  isExpanded,
  onToggle,
}: DiscountOfferCardProps) {
  const navigate = useNavigate();

  const statusColors: Record<string, string> = {
    Running: "text-emerald-700 bg-emerald-50",
    Active: "text-emerald-700 bg-emerald-50",
    "Not Running": "text-rose-600 bg-rose-50",
    Deactivated: "text-rose-600 bg-rose-50",
    Deactive: "text-rose-600 bg-rose-50",
  };

  const toggleBadge = (value: "On" | "Off" | "Yes" | "No") => (
    <span
      className={clsx(
        "px-2 py-0.5 rounded text-[10px] font-bold",
        value === "On" || value === "Yes"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-orange-50 text-orange-700",
      )}
    >
      {value}
    </span>
  );

  const FieldRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-1 py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
        {label}
      </span>
      <span className="text-xs text-slate-900 font-semibold break-words">
        {value}
      </span>
    </div>
  );

  const SectionTitle = ({ children }: { children: string }) => (
    <h4 className="text-[10px] text-slate-700 uppercase tracking-widest font-extrabold mb-2 pb-1.5 border-b-2 border-primary-600 inline-block">
      {children}
    </h4>
  );

  return (
    <div
      className={clsx(
        "bg-white rounded-xl border transition-all overflow-hidden",
        isExpanded
          ? "border-primary-200 shadow-md ring-1 ring-primary-100"
          : "border-slate-200 hover:border-slate-300 shadow-sm",
      )}
    >
      {/* Card Header - Clickable for Collapse */}
      <div
        className={clsx(
          "px-6 py-4 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors",
          isExpanded
            ? "bg-slate-50/50 border-b border-slate-100"
            : "hover:bg-slate-50",
        )}
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl text-slate-900 truncate mb-1">
            {campaign.title}
          </h3>
          <div className="flex items-center gap-6 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase">
                Status:
              </span>
              <span className="text-slate-900 font-extrabold">
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase">
                Offer Start:
              </span>
              <span className="text-slate-900 font-extrabold">
                {campaign.startDate}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold uppercase">
                Offer End:
              </span>
              <span className="text-slate-900 font-extrabold">
                {campaign.endDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={clsx(
              "text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-slate-100",
              statusColors[campaign.status],
            )}
          >
            {campaign.status === "Active" ? "Running" : "Not Running"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/merchants/store-discount/${campaign.id}/edit`);
            }}
            className="px-4 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white font-bold text-xs rounded-lg transition-all active:scale-95 border border-primary-100"
          >
            Edit
          </button>
          <div className="p-1 rounded-md bg-slate-100 text-slate-400">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Card Body - Collapsible Wrapper */}
      <div
        className={clsx(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded
            ? "opacity-100 h-auto"
            : "opacity-0 h-0 pointer-events-none",
        )}
      >
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-50">
          {/* COLUMN 1 - Offer Details */}
          <div className="space-y-4">
            <SectionTitle>Offer Details</SectionTitle>
            <div className="space-y-1">
              <FieldRow
                label="Store Info"
                value={`${campaign.storeName} - ${campaign.storeId}`}
              />
              <FieldRow
                label="Message on GW Page"
                value={campaign.messageOnGWPage}
              />
              <FieldRow
                label="Message on Success Page"
                value={campaign.messageOnSuccessPage}
              />
              <div className="py-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    To Display Message
                  </span>
                  {toggleBadge(campaign.toDisplayMessage)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    To Display Popup
                  </span>
                  {toggleBadge(campaign.toDisplayPopup)}
                </div>
              </div>
              <FieldRow
                label="URL T & C"
                value={
                  <span className="text-primary-600 break-all text-sm font-semibold">
                    {campaign.tcUrl || ""}
                  </span>
                }
              />
              {campaign.offerImageUrl && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold block mb-2">
                    Offer Image
                  </span>
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shadow-sm max-w-[200px]">
                    <img
                      src={campaign.offerImageUrl}
                      alt="Offer"
                      className="w-full h-auto object-cover max-h-[120px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2 - Discount Brief */}
          <div className="space-y-4">
            <SectionTitle>Discount Brief</SectionTitle>
            <div className="space-y-1">
              <FieldRow
                label="Acquirer Bank"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {campaign.acquirerBank}
                    </span>
                    {campaign.acquirerBankImage &&
                      campaign.acquirerBankImage !== "No Image" && (
                        <img
                          src={campaign.acquirerBankImage}
                          alt={campaign.acquirerBank}
                          className="w-6 h-6 object-contain rounded border border-slate-200"
                        />
                      )}
                  </div>
                }
              />
              <FieldRow
                label="Discount Rate"
                value={`${campaign.discountRate} %`}
              />
              <FieldRow
                label="Discount Amount"
                value={`${campaign.discountAmount.toFixed(2)} BDT`}
              />
              <FieldRow label="Frequency" value={campaign.frequency} />
              <FieldRow
                label="No of Transaction by Same Card (only for CoF) or Cust Phone"
                value={campaign.noOfTransactionBySameCard}
              />
              <FieldRow
                label="Discount Based on Customer Mobile No"
                value={campaign.discountBasedOnCustomerMobile}
              />
              <FieldRow
                label="Total Discount Amount Allowed in Campaign Period"
                value={campaign.totalDiscountAmountAllowedInCampaignPeriod.toFixed(
                  2,
                )}
              />
              <FieldRow
                label="MAX Discount Amount Per Trans"
                value={`${campaign.maxDiscountAmount?.toFixed(2) || "0.00"} BDT`}
              />
              <FieldRow
                label="Amount to display Offer"
                value={`${campaign.amountToDisplayOffer.toFixed(2)} BDT`}
              />
              <FieldRow
                label="Customized Amount for offer (JSON)"
                value={campaign.customizedAmountForOffer}
              />
              <FieldRow label="Offer in Time" value={campaign.offerInTime} />

              <div className="pt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    Discount On Product Price
                  </span>
                  {toggleBadge(campaign.discountOnProductPrice)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    Discount Price By Merchant
                  </span>
                  {toggleBadge(campaign.discountPriceByMerchant)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    Cashback Offer
                  </span>
                  {toggleBadge(campaign.cashbackFlag ? "On" : "Off")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    Whether Support Dynamic Para
                  </span>
                  {toggleBadge(campaign.whetherSupportDynamicPara)}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3 - Card Type */}
          <div className="space-y-4">
            <SectionTitle>Card Type</SectionTitle>
            <div className="space-y-1">
              <div className="pb-2">
                <div className="space-y-1.5">
                  {Object.entries(campaign.cardTypes).map(([type, status]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-700">
                        {type}
                      </span>
                      {toggleBadge(status)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 pb-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    Coupon Discount
                  </span>
                  {toggleBadge(campaign.couponDiscount)}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2 space-y-0.5">
                <FieldRow label="Specific BIN" value={campaign.specificBIN} />
                <FieldRow
                  label="Card Type (Like - VISA, MASTER, AMEX)"
                  value={campaign.cardTypeLike}
                />
                <FieldRow label="Campaign Code" value={campaign.campaignCode} />
                <FieldRow
                  label="Whether Support EMI"
                  value={
                    campaign.emiSupport
                      ? "EMI is Allowed"
                      : "EMI is Not Allowed"
                  }
                />
                <FieldRow
                  label="Campaign Created At"
                  value={campaign.createdOn}
                />
                <FieldRow
                  label="Campaign Created By"
                  value={campaign.campaignCreatedBy}
                />
                <FieldRow
                  label="Campaign Updated By"
                  value={campaign.updatedOn}
                />
                <FieldRow
                  label="Campaign Updated At"
                  value={campaign.campaignUpdatedBy}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
