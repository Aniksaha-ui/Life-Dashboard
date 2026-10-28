import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  X,
  AlertCircle,
  Upload,
  Calendar,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check,
  Info,
  File,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  setHours,
  setMinutes,
} from "date-fns";
import { MOCK_CAMPAIGNS, type DiscountCampaign } from "./StoreDiscountPage";
import { clsx } from "clsx";

interface EditStoreDiscountPageProps {
  mode?: "add" | "edit";
}

const defaultCampaign: DiscountCampaign = {
  id: "",
  title: "",
  storeName: "",
  storeId: "",
  status: "Deactive",
  discountType: "Percentage",
  discountValue: 0,
  channel: "Card",
  startDate: "",
  endDate: "",
  frequency: "1",
  cardTypes: {
    VISA: "Off",
    Master: "Off",
    AMEX: "Off",
    "Other Card": "Off",
    "Internet Banking": "Off",
    "Mobile Banking": "Off",
    Wallet: "Off",
  },
  brief: "",
  acquirerBank: "Not Selected",
  rules: [],
  maxDiscountAmount: 0,
  minTransactionAmount: 0,
  binRules: "No BIN Number Provided",
  emiSupport: false,
  campaignCode: "",
  cashbackFlag: false,
  dynamicParameters: [],
  createdOn: "",
  updatedOn: "",
  displayMessage: "",
  tcUrl: "",
  messageOnGWPage: "",
  messageOnSuccessPage: "",
  toDisplayMessage: "Off",
  toDisplayPopup: "Off",
  discountRate: 0,
  discountAmount: 0,
  noOfTransactionBySameCard: "1",
  discountBasedOnCustomerMobile: "No",
  totalDiscountAmountAllowedInCampaignPeriod: 0,
  amountToDisplayOffer: 0,
  customizedAmountForOffer: "",
  offerInTime: "No",
  discountOnProductPrice: "Off",
  discountPriceByMerchant: "Off",
  whetherSupportDynamicPara: "Off",
  couponDiscount: "Off",
  specificBIN: "",
  campaignCreatedBy: "",
  campaignUpdatedBy: "",
  acquirerBankImage: "",
  cardTypeLike: "",
  merchantId: "",
  forAnyGateway: "Off",
  discountStartedAmount: 0,
  binList: "",
  allowEMI: "Off",
  savedCard: "Off",
  dynamicDiscountParameter: "Off",
};

export default function EditStoreDiscountPage({
  mode = "edit",
}: EditStoreDiscountPageProps) {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const isEdit = mode === "edit";

  // Find campaign by ID
  const initialCampaign = MOCK_CAMPAIGNS.find((c) => c.id === campaignId);

  const [campaign, setCampaign] = useState<DiscountCampaign | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState<
    {
      id: string;
      file?: File;
      name?: string;
      progress: number;
      previewUrl: string | null;
    }[]
  >([]);

  useEffect(() => {
    if (isEdit) {
      if (initialCampaign) {
        setCampaign({ ...initialCampaign });

        // Initialize attachments if there's an existing offer image
        if (initialCampaign.offerImageUrl) {
          setAttachments([
            {
              id: "initial",
              name: "Existing Offer Image",
              progress: 100,
              previewUrl: initialCampaign.offerImageUrl,
            },
          ]);
        }
      }
    } else {
      setCampaign({ ...defaultCampaign });
    }
  }, [isEdit, initialCampaign]);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach(
        (a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl),
      );
    };
  }, []);

  if (!campaign) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Campaign Not Found</h2>
        <p className="text-slate-500 mt-2">
          The requested discount campaign does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/merchants/store-discount")}
          className="mt-6 text-primary-600 font-semibold hover:underline flex items-center gap-2 mx-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Store Discount Offer
        </button>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setCampaign((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newAttachments = selectedFiles.map((file) => {
      const id = Math.random().toString(36).substring(7);
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;

      // Simulate progress for each file
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, progress: Math.floor(progress) } : a,
          ),
        );
      }, 400);

      return { id, file, progress: 1, previewUrl };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    const attachmentToRemove = attachments.find((a) => a.id === id);
    if (attachmentToRemove?.previewUrl) {
      URL.revokeObjectURL(attachmentToRemove.previewUrl);
    }
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, we would update the actual campaign object with the new offerImageUrl
      // For simulation, we'll update the mock campaign array before navigating
      const lastImage = [...attachments]
        .reverse()
        .find((a) => a.previewUrl && a.progress === 100);
      const imageUrl = lastImage?.previewUrl || campaign.offerImageUrl;

      const updatedCampaign = { ...campaign, offerImageUrl: imageUrl };

      if (isEdit) {
        const idx = MOCK_CAMPAIGNS.findIndex((c) => c.id === campaign.id);
        if (idx !== -1) {
          MOCK_CAMPAIGNS[idx] = updatedCampaign;
        }
      } else {
        const newId = String(MOCK_CAMPAIGNS.length + 1);
        MOCK_CAMPAIGNS.unshift({
          ...updatedCampaign,
          id: newId,
        });
      }

      setIsSaving(false);
      navigate(`/merchants/store-discount`);
    }, 1000);
  };

  return (
    <div className="mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/merchants/store-discount")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Store Discount Offer
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/merchants/store-discount")}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSaving ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            {isEdit ? "Edit Store Discount Offer" : "Add Store Discount Offer"}
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            {isEdit
              ? "Update the configuration for this store discount offer."
              : "Configure your new store discount offer and promotional details below."}
          </p>
        </div>

        {/* Header Information Row */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            {isEdit ? (
              <>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold block mb-0.5">
                    Merchant ID
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {campaign.merchantId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold block mb-0.5">
                    Store ID
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {campaign.storeId}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 max-w-[200px]">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold block mb-1">
                    Merchant ID
                  </span>
                  <input
                    type="text"
                    name="merchantId"
                    value={campaign.merchantId}
                    onChange={handleInputChange}
                    placeholder="Enter Merchant ID"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="flex-1 max-w-[200px]">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold block mb-1">
                    Store ID
                  </span>
                  <input
                    type="text"
                    name="storeId"
                    value={campaign.storeId}
                    onChange={handleInputChange}
                    placeholder="Enter Store ID"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="flex-1 max-w-[200px]">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold block mb-1">
                    Store Name
                  </span>
                  <input
                    type="text"
                    name="storeName"
                    value={campaign.storeName}
                    onChange={handleInputChange}
                    placeholder="Enter Store Name"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "text-xs font-semibold px-2.5 py-1 rounded-md cursor-pointer select-none",
                campaign.status === "Active"
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-rose-600 bg-rose-50",
              )}
              onClick={() => {
                setCampaign((prev) =>
                  prev
                    ? {
                        ...prev,
                        status:
                          prev.status === "Active" ? "Deactive" : "Active",
                      }
                    : null,
                );
              }}
            >
              {campaign.status === "Active" ? "Running" : "Not Running"}
            </span>
          </div>
        </div>

        {/* Form Body - 3 Column Grid */}
        <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* COLUMN 1 - Identity & Presentation */}
          <div className="space-y-5">
            <SectionTitle>Offer Details</SectionTitle>
            <div className="space-y-4">
              <FormInput
                label="* Discount Title"
                name="title"
                value={campaign.title}
                onChange={handleInputChange}
                placeholder="e.g., Get 10% Off on Amex"
              />
              <FormInput
                label="* Offer Description"
                name="brief"
                value={campaign.brief}
                onChange={handleInputChange}
                isTextarea
                placeholder="Brief description of the offer..."
              />
              <FormInput
                label="Description at Success Page"
                name="messageOnSuccessPage"
                value={campaign.messageOnSuccessPage}
                onChange={handleInputChange}
                isTextarea
                placeholder="Message to show after successful payment..."
              />
              <FormToggle
                label="Whether to Display Message"
                name="toDisplayMessage"
                value={campaign.toDisplayMessage}
                onChange={handleInputChange}
              />
              <FormInput
                label="URL of T & C"
                name="tcUrl"
                value={campaign.tcUrl}
                onChange={handleInputChange}
                placeholder="https://..."
              />
              <FormToggle
                label="Display Popup"
                name="toDisplayPopup"
                value={campaign.toDisplayPopup}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* COLUMN 2 - Rules & Limits */}
          <div className="space-y-5">
            <SectionTitle>Discount Rules</SectionTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormDateTimePicker
                  label="* Offer Start"
                  name="startDate"
                  value={campaign.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <FormDateTimePicker
                  label="* Offer End"
                  name="endDate"
                  value={campaign.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <FormInput
                label="Acquirer Bank"
                name="acquirerBank"
                value={campaign.acquirerBank}
                onChange={handleInputChange}
              />
              <FormToggle
                label="For any gateway"
                name="forAnyGateway"
                value={campaign.forAnyGateway}
                onChange={handleInputChange}
                isYesNo
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="* Discount Percentage"
                  name="discountRate"
                  type="number"
                  value={campaign.discountRate.toString()}
                  onChange={handleInputChange}
                />
                <FormInput
                  label="Discount by Amount"
                  name="discountAmount"
                  type="number"
                  value={campaign.discountAmount.toString()}
                  onChange={handleInputChange}
                />
              </div>
              <FormToggle
                label="Discount by Customer Phone"
                name="discountBasedOnCustomerMobile"
                value={campaign.discountBasedOnCustomerMobile}
                onChange={handleInputChange}
                isYesNo
              />
              <FormInput
                label="Frequency"
                name="frequency"
                value={campaign.frequency}
                onChange={handleInputChange}
                placeholder="e.g., 1, 3, Unlimited"
              />
              <FormInput
                label="No of Trans by Same Card or Cust Phone"
                name="noOfTransactionBySameCard"
                value={campaign.noOfTransactionBySameCard}
                onChange={handleInputChange}
                helpText="Choose No Same Card Used/Cust Mobile No or Total Discount Amount Allowed. Both not work in same campaign"
              />
              <FormInput
                label="Total Discount Amount Allowed"
                name="totalDiscountAmountAllowedInCampaignPeriod"
                value={campaign.totalDiscountAmountAllowedInCampaignPeriod.toString()}
                onChange={handleInputChange}
                type="number"
                helpText="Choose No Same Card Used/Cust Mobile No or Total Discount Amount Allowed. Both not work in same campaign"
              />
              <FormInput
                label="MAX Discount Amount"
                name="maxDiscountAmount"
                value={campaign.maxDiscountAmount?.toString() || "0"}
                onChange={handleInputChange}
                type="number"
              />
              <FormInput
                label="Discount Started Amount"
                name="discountStartedAmount"
                value={campaign.discountStartedAmount.toString()}
                onChange={handleInputChange}
                type="number"
              />
            </div>
          </div>

          {/* COLUMN 3 - Config & Technical */}
          <div className="space-y-5">
            <SectionTitle>Campaign Configuration</SectionTitle>
            <div className="space-y-4">
              <FormInput
                label="Discount Customized based on AMT (JSON)"
                name="customizedAmountForOffer"
                value={campaign.customizedAmountForOffer}
                onChange={handleInputChange}
                isTextarea
              />
              <FormInput
                label="Card Type (Like - VISA, MASTER, AMEX)"
                name="cardTypeLike"
                value={campaign.cardTypeLike}
                onChange={handleInputChange}
              />
              <FormInput
                label="BIN List"
                name="binList"
                value={campaign.binList}
                onChange={handleInputChange}
                isTextarea
                placeholder="Enter BIN numbers separated by commas..."
              />
              <FormInput
                label="Campaign Code"
                name="campaignCode"
                value={campaign.campaignCode}
                onChange={handleInputChange}
                isTextarea
                helpText="If merchant passes this value in parameter [campaign_code] then this campaign will display"
              />

              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-3 block">
                  Card Type Status
                </label>
                <div className="grid grid-cols-1 gap-y-1">
                  {Object.entries(campaign.cardTypes).map(([type, status]) => (
                    <FormToggle
                      key={type}
                      label={type}
                      name={`cardType_${type}`}
                      value={status}
                      onChange={(e: any) => {
                        setCampaign((prev) =>
                          prev
                            ? {
                                ...prev,
                                cardTypes: {
                                  ...prev.cardTypes,
                                  [type]: e.target.value,
                                },
                              }
                            : null,
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-3 block">
                  Discount Category
                </label>
                <div className="space-y-1">
                  <FormToggle
                    label="Discount On Product Price"
                    name="discountOnProductPrice"
                    value={campaign.discountOnProductPrice}
                    onChange={handleInputChange}
                  />
                  <FormToggle
                    label="Discount Price By Merchant"
                    name="discountPriceByMerchant"
                    value={campaign.discountPriceByMerchant}
                    onChange={handleInputChange}
                  />
                  <FormToggle
                    label="Cashback Offer"
                    name="cashbackFlag"
                    value={campaign.cashbackFlag ? "On" : "Off"}
                    onChange={(e: any) =>
                      handleInputChange({
                        target: {
                          name: "cashbackFlag",
                          value: e.target.value === "On",
                        },
                      } as any)
                    }
                  />
                </div>
              </div>

              <div className="pt-2 grid grid-cols-1 gap-1">
                <FormToggle
                  label="Allow EMI"
                  name="allowEMI"
                  value={campaign.allowEMI}
                  onChange={handleInputChange}
                  isYesNo
                />
                <FormToggle
                  label="Saved Card"
                  name="savedCard"
                  value={campaign.savedCard}
                  onChange={handleInputChange}
                  isYesNo
                />
                <FormToggle
                  label="Dynamic Discount Parameter"
                  name="dynamicDiscountParameter"
                  value={campaign.dynamicDiscountParameter}
                  onChange={handleInputChange}
                  isYesNo
                />
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-2 flex items-center gap-1">
                  Upload Offer Image
                </label>
                <label
                  htmlFor="offerImageInput"
                  className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 hover:border-primary-400 transition-all cursor-pointer shadow-sm"
                >
                  <input
                    type="file"
                    id="offerImageInput"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <div className="flex flex-row flex-wrap gap-2 w-full">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-2 py-1.5 bg-white border border-slate-100 rounded-lg group/item transition-all hover:border-slate-200 min-w-[180px] max-w-[240px]"
                      >
                        {att.progress < 100 ? (
                          <div className="flex-1 px-1">
                            <div className="flex justify-between text-[9px] mb-1">
                              <span className="text-slate-500 font-medium truncate max-w-[100px]">
                                {att.file?.name || att.name}
                              </span>
                              <span className="text-primary-600 font-bold">
                                {att.progress}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 transition-all duration-300 ease-out"
                                style={{ width: `${att.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            {att.previewUrl ? (
                              <div className="w-8 h-8 rounded border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0 shadow-sm">
                                <img
                                  src={att.previewUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : att.file?.type === "application/pdf" ? (
                              <div className="relative w-8 h-8 rounded bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 flex-shrink-0">
                                <File className="w-4 h-4" />
                                <span className="absolute text-[5px] font-bold mt-0.5">
                                  PDF
                                </span>
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Info className="w-3 h-3" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[10px] font-semibold text-slate-700 truncate mb-0.5"
                                title={att.file?.name || att.name}
                              >
                                {att.file?.name || att.name}
                              </p>
                              <p className="text-[9px] text-emerald-600 flex items-center gap-0.5 font-medium">
                                <Check className="w-2.5 h-2.5" /> Done
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeAttachment(att.id);
                              }}
                              className="p-1 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover/item:opacity-100"
                            >
                              <X className="w-3 h-3 text-slate-300 hover:text-rose-500" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}

                    {attachments.length === 0 && (
                      <div className="flex flex-col items-center py-2 w-full">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary-500 mb-1" />
                        <span className="text-[11px] text-slate-500 group-hover:text-primary-500 font-semibold text-center leading-normal">
                          Upload PDF/Images
                          <br />
                          <span className="font-normal text-[10px] text-slate-400">
                            (You can select multiple)
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {attachments.length > 0 &&
                    attachments.every((a) => a.progress === 100) && (
                      <div className="mt-3 flex">
                        <span className="text-[10px] text-primary-600 font-bold hover:underline cursor-pointer bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100 flex items-center gap-1.5">
                          <Upload className="w-3 h-3" />
                          Add more files
                        </span>
                      </div>
                    )}
                </label>
              </div>

              <div className="pt-4">
                <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mb-1.5 block">
                  * Status
                </label>
                <select
                  name="status"
                  value={campaign.status}
                  onChange={handleInputChange}
                  className={clsx(
                    "w-full text-xs font-semibold px-3 py-2 rounded-lg outline-none border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
                    campaign.status === "Active"
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-rose-600 bg-rose-50",
                  )}
                >
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSaving ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Redesigned Form Components ---

function SectionTitle({ children }: { children: string }) {
  return (
    <h4 className="text-[11px] text-slate-700 uppercase tracking-widest font-extrabold pb-2 border-b-2 border-primary-600 inline-block">
      {children}
    </h4>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  isTextarea = false,
  placeholder = "",
  helpText = "",
}: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
        {label}
      </label>
      {isTextarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={2}
          placeholder={placeholder}
          className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300 min-h-[60px]"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
        />
      )}
      {helpText && (
        <p className="text-[9px] text-slate-400 font-medium leading-tight">
          {helpText}
        </p>
      )}
    </div>
  );
}

function FormToggle({ label, name, value, onChange, isYesNo = false }: any) {
  const isPositive = value === "On" || value === "Yes";

  const handleToggle = () => {
    const newValue = isYesNo
      ? value === "Yes"
        ? "No"
        : "Yes"
      : value === "On"
        ? "Off"
        : "On";

    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="flex items-center justify-between py-1.5 px-0.5 border-b border-dashed border-slate-100 last:border-0 group">
      <label className="text-[10px] text-slate-600 font-bold group-hover:text-slate-900 transition-colors pointer-events-none">
        {label}
      </label>
      <button
        type="button"
        onClick={handleToggle}
        className={clsx(
          "relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
          isPositive ? "bg-emerald-500" : "bg-slate-200",
        )}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          className={clsx(
            "pointer-events-none relative inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out shadow-sm",
            isPositive ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
function FormDateTimePicker({ label, name, value, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  });

  const currentDate = useMemo(() => {
    const d = value ? new Date(value) : null;
    return d && !isNaN(d.getTime()) ? d : null;
  }, [value]);

  // Calendar generation
  const days = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [viewDate]);

  const formatForDisplay = (dateStr: string) => {
    try {
      if (!dateStr) return "Select Date & Time";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, "dd MMM yyyy, hh:mm a");
    } catch (e) {
      return dateStr;
    }
  };

  const handleDateSelect = (day: Date) => {
    let newDate = day;
    if (currentDate) {
      newDate = setHours(newDate, currentDate.getHours());
      newDate = setMinutes(newDate, currentDate.getMinutes());
    } else {
      newDate = setHours(newDate, 0);
      newDate = setMinutes(newDate, 0);
    }
    onChange({ target: { name, value: newDate.toISOString() } });
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    val: string | number,
  ) => {
    let newDate = currentDate || new Date();
    if (type === "hour") {
      const currentAmPm = newDate.getHours() >= 12 ? "PM" : "AM";
      let hour = Number(val);
      if (currentAmPm === "PM" && hour < 12) hour += 12;
      if (currentAmPm === "AM" && hour === 12) hour = 0;
      newDate = setHours(newDate, hour);
    } else if (type === "minute") {
      newDate = setMinutes(newDate, Number(val));
    } else if (type === "ampm") {
      let hour = newDate.getHours();
      if (val === "PM" && hour < 12) hour += 12;
      if (val === "AM" && hour >= 12) hour -= 12;
      newDate = setHours(newDate, hour);
    }
    onChange({ target: { name, value: newDate.toISOString() } });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "w-full flex items-center justify-between text-xs font-semibold bg-white border rounded-lg p-2.5 transition-all outline-none text-left",
            isOpen
              ? "border-primary-500 ring-2 ring-primary-500/20 shadow-sm"
              : "border-slate-200 text-slate-900 hover:border-slate-300",
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Calendar
              className={clsx(
                "w-3.5 h-3.5 flex-shrink-0",
                isOpen ? "text-primary-500" : "text-slate-400",
              )}
            />
            <span
              className={clsx(
                "truncate",
                !value ? "text-slate-400 font-normal" : "text-slate-900",
              )}
            >
              {formatForDisplay(value)}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700">
                {format(viewDate, "MMMM yyyy")}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-3">
              <div className="grid grid-cols-7 mb-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-[10px] font-bold text-slate-400 text-center py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const isSelected = currentDate && isSameDay(day, currentDate);
                  const isCurrentMonth = isSameMonth(day, viewDate);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={clsx(
                        "h-8 w-full flex items-center justify-center text-xs rounded-md transition-all font-medium",
                        isSelected
                          ? "bg-primary-600 text-white shadow-md shadow-primary-100 scale-105"
                          : isCurrentMonth
                            ? "text-slate-700 hover:bg-primary-50 hover:text-primary-600"
                            : "text-slate-300 hover:bg-slate-50",
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Picker */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-2 justify-center">
                <div className="flex items-center gap-1">
                  <select
                    value={currentDate ? currentDate.getHours() % 12 || 12 : 12}
                    onChange={(e) =>
                      handleTimeChange("hour", Number(e.target.value))
                    }
                    className="bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-700 outline-none focus:border-primary-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h}>
                        {h.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400 font-bold">:</span>
                  <select
                    value={currentDate ? currentDate.getMinutes() : 0}
                    onChange={(e) =>
                      handleTimeChange("minute", Number(e.target.value))
                    }
                    className="bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-700 outline-none focus:border-primary-500"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex bg-white border border-slate-200 rounded p-0.5">
                  {["AM", "PM"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleTimeChange("ampm", p)}
                      className={clsx(
                        "px-2 py-0.5 text-[10px] font-bold rounded transition-all",
                        (currentDate?.getHours() || 0) >= 12 === (p === "PM")
                          ? "bg-primary-600 text-white"
                          : "text-slate-500 hover:bg-slate-50",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
