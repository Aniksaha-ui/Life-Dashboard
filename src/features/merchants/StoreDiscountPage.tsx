import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Calendar,
  Plus,
  ChevronDown,
  FileText,
  Upload,
} from "lucide-react";
import clsx from "clsx";
import { FilterBar } from "../../components/FilterBar";
import type { FilterConfig } from "../../components/FilterBar";
import { DiscountOfferCard } from "./DiscountOfferCard";

// --- Types ---
export interface DiscountCampaign {
  id: string;
  title: string;
  storeName: string;
  storeId: string;
  status: "Active" | "Deactive";
  discountType: "Percentage" | "Amount";
  discountValue: number;
  channel: string; // e.g., "Card", "Internet Banking", "Wallet"
  startDate: string;
  endDate: string;
  frequency: string;
  cardTypes: { [key: string]: "On" | "Off" }; // e.g., { "VISA": "On", "Master": "Off" }

  // Detailed Fields (for details page)
  brief: string;
  acquirerBank: string;
  rules: string[];
  maxDiscountAmount?: number;
  minTransactionAmount?: number;
  binRules?: string;
  emiSupport: boolean;
  campaignCode: string;
  cashbackFlag: boolean;
  dynamicParameters: string[];
  createdOn: string;
  updatedOn: string;
  displayMessage: string;
  tcUrl: string;

  // LEFT BLOCK - Offer Details
  messageOnGWPage: string;
  messageOnSuccessPage: string;
  toDisplayMessage: "On" | "Off";
  toDisplayPopup: "On" | "Off";

  // MIDDLE BLOCK - Discount Brief
  discountRate: number;
  discountAmount: number;
  noOfTransactionBySameCard: string;
  discountBasedOnCustomerMobile: "Yes" | "No";
  totalDiscountAmountAllowedInCampaignPeriod: number;
  amountToDisplayOffer: number;
  customizedAmountForOffer: string;
  offerInTime: "Yes" | "No";
  discountOnProductPrice: "On" | "Off";
  discountPriceByMerchant: "On" | "Off";
  whetherSupportDynamicPara: "On" | "Off";

  // RIGHT BLOCK - Card Type + Campaign Meta
  couponDiscount: "On" | "Off";
  specificBIN: string;
  campaignCreatedBy: string;
  campaignUpdatedBy: string;
  acquirerBankImage: string;
  cardTypeLike: string;

  // NEW FIELDS FROM OFFICIAL SCREENSHOT
  merchantId: string;
  forAnyGateway: "On" | "Off";
  discountStartedAmount: number;
  binList: string;
  allowEMI: "On" | "Off";
  savedCard: "On" | "Off";
  dynamicDiscountParameter: "On" | "Off";
  offerImageUrl?: string;
}

// --- Mock Data ---
export const MOCK_CAMPAIGNS: DiscountCampaign[] = [
  {
    id: "1",
    title: "Get 10% Off on Amex",
    storeName: "demotest",
    storeId: "Easy App",
    merchantId: "demotest",
    status: "Deactive",
    discountType: "Percentage",
    discountValue: 10,
    channel: "Card",
    startDate: "Mon, 02 Oct 2023, 12:43 AM",
    endDate: "Wed, 26 Nov 2025, 11:59 PM",
    frequency: "1",
    cardTypes: {
      VISA: "Off",
      Master: "Off",
      AMEX: "On",
      "Other Card": "Off",
      "Internet Banking": "Off",
      "Mobile Banking": "Off",
      Wallet: "Off",
    },
    brief: "Get 10% off On Amex",
    acquirerBank: "Not Selected",
    rules: [],
    maxDiscountAmount: 500,
    minTransactionAmount: 0,
    binRules: "No BIN Number Provided",
    emiSupport: false,
    campaignCode: "No Campaign Code",
    cashbackFlag: false,
    dynamicParameters: [],
    createdOn: "2023-10-02 12:43:21",
    updatedOn: "Shishir",
    displayMessage: "Get 10% off On Amex",
    tcUrl: "N/A",
    // LEFT BLOCK
    messageOnGWPage: "Get 10% off On Amex",
    messageOnSuccessPage: "",
    toDisplayMessage: "Off",
    toDisplayPopup: "Off",
    // MIDDLE BLOCK
    discountRate: 10,
    discountAmount: 0,
    noOfTransactionBySameCard: "0",
    discountBasedOnCustomerMobile: "No",
    totalDiscountAmountAllowedInCampaignPeriod: 0,
    amountToDisplayOffer: 0,
    customizedAmountForOffer: "0",
    offerInTime: "Yes",
    discountOnProductPrice: "Off",
    discountPriceByMerchant: "Off",
    whetherSupportDynamicPara: "Off",
    // RIGHT BLOCK
    couponDiscount: "Off",
    specificBIN: "No BIN Number Provided",
    campaignCreatedBy: "Shishir",
    campaignUpdatedBy: "2023-10-02 12:43:21",
    acquirerBankImage: "No Image",
    cardTypeLike: "5",
    // New Screenshot Fields
    forAnyGateway: "Off",
    discountStartedAmount: 0,
    binList: "",
    allowEMI: "Off",
    savedCard: "Off",
    dynamicDiscountParameter: "Off",
    offerImageUrl:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Gapy discount test",
    storeName: "demotest",
    storeId: "Easy App | Manage Gapy",
    merchantId: "demotest",
    status: "Deactive",
    discountType: "Percentage",
    discountValue: 10,
    channel: "Card",
    startDate: "Tue, 02 Feb 2024, 01:33 AM",
    endDate: "Wed, 24 Sep 2025, 11:59 PM",
    frequency: "3",
    cardTypes: {
      VISA: "Off",
      Master: "Off",
      AMEX: "On",
      "Other Card": "Off",
      "Internet Banking": "Off",
      "Mobile Banking": "Off",
      Wallet: "Off",
    },
    brief: "Messaging on GW Page",
    acquirerBank: "Not Selected",
    rules: [],
    maxDiscountAmount: 0,
    minTransactionAmount: 0,
    binRules: "No BIN Number Provided",
    emiSupport: false,
    campaignCode: "No Campaign Code",
    cashbackFlag: false,
    dynamicParameters: [],
    createdOn: "2024-02-02 01:33:53",
    updatedOn: "Imon",
    displayMessage: "Messaging on GW Page",
    tcUrl: "N/A",
    messageOnGWPage: "Messaging on GW Page",
    messageOnSuccessPage: "Messaging on Success Page",
    toDisplayMessage: "Off",
    toDisplayPopup: "On",
    discountRate: 10,
    discountAmount: 0,
    noOfTransactionBySameCard: "0",
    discountBasedOnCustomerMobile: "No",
    totalDiscountAmountAllowedInCampaignPeriod: 0,
    amountToDisplayOffer: 0,
    customizedAmountForOffer: "0",
    offerInTime: "No",
    discountOnProductPrice: "Off",
    discountPriceByMerchant: "Off",
    whetherSupportDynamicPara: "Off",
    couponDiscount: "Off",
    specificBIN: "No BIN Number Provided",
    campaignCreatedBy: "Imon",
    campaignUpdatedBy: "2024-02-02 01:33:53",
    acquirerBankImage: "No Image",
    cardTypeLike: "5,6",
    // New Screenshot Fields
    forAnyGateway: "Off",
    discountStartedAmount: 0,
    binList: "",
    allowEMI: "Off",
    savedCard: "Off",
    dynamicDiscountParameter: "Off",
  },
  {
    id: "3",
    title: "Get 50% off On Internet Banking",
    storeName: "demotest",
    storeId: "Easy App",
    merchantId: "demotest",
    status: "Deactive",
    discountType: "Percentage",
    discountValue: 50,
    channel: "Internet Banking",
    startDate: "Tue, 09 May 2023, 11:49 AM",
    endDate: "Wed, 26 Jun 2024, 11:59 PM",
    frequency: "Unlimited",
    cardTypes: {
      VISA: "Off",
      Master: "Off",
      AMEX: "Off",
      "Other Card": "Off",
      "Internet Banking": "On",
      "Mobile Banking": "Off",
      Wallet: "Off",
    },
    brief: "Get 50% off On Internet Banking",
    acquirerBank: "Not Selected",
    rules: [],
    maxDiscountAmount: 0,
    minTransactionAmount: 0,
    binRules: "No BIN Number Provided",
    emiSupport: false,
    campaignCode: "No Campaign Code",
    cashbackFlag: false,
    dynamicParameters: [],
    createdOn: "2023-05-09 11:49:19",
    updatedOn: "Admin",
    displayMessage: "Get 50% off On Internet Banking",
    tcUrl: "N/A",
    messageOnGWPage: "Get 50% off On Internet Banking",
    messageOnSuccessPage: "",
    toDisplayMessage: "Off",
    toDisplayPopup: "On",
    discountRate: 50,
    discountAmount: 0,
    noOfTransactionBySameCard: "0",
    discountBasedOnCustomerMobile: "No",
    totalDiscountAmountAllowedInCampaignPeriod: 0,
    amountToDisplayOffer: 0,
    customizedAmountForOffer: "0",
    offerInTime: "No",
    discountOnProductPrice: "Off",
    discountPriceByMerchant: "Off",
    whetherSupportDynamicPara: "Off",
    couponDiscount: "Off",
    specificBIN: "No BIN Number Provided",
    campaignCreatedBy: "Shishir",
    campaignUpdatedBy: "2023-05-09 11:49:19",
    acquirerBankImage: "No Image",
    cardTypeLike: "No Specific Card Type",
    // New Screenshot Fields
    forAnyGateway: "Off",
    discountStartedAmount: 0,
    binList: "",
    allowEMI: "Off",
    savedCard: "Off",
    dynamicDiscountParameter: "Off",
  },
  {
    id: "4",
    title: "Get 50% off On Internet Banking",
    storeName: "demotest",
    storeId: "Easy App",
    merchantId: "demotest",
    status: "Deactive",
    discountType: "Percentage",
    discountValue: 50,
    channel: "Internet Banking",
    startDate: "Tue, 09 May 2023, 11:49 AM",
    endDate: "Wed, 26 Jun 2024, 11:59 PM",
    frequency: "1",
    cardTypes: {
      VISA: "Off",
      Master: "Off",
      AMEX: "Off",
      "Other Card": "Off",
      "Internet Banking": "On",
      "Mobile Banking": "Off",
      Wallet: "Off",
    },
    brief: "Get 50% off On Internet Banking",
    acquirerBank: "Not Selected",
    rules: [],
    maxDiscountAmount: 0,
    minTransactionAmount: 0,
    binRules: "No BIN Number Provided",
    emiSupport: false,
    campaignCode: "No Campaign Code",
    cashbackFlag: false,
    dynamicParameters: [],
    createdOn: "2023-05-09 11:49:27",
    updatedOn: "Shishir",
    displayMessage: "Get 50% off On Internet Banking",
    tcUrl: "N/A",
    messageOnGWPage: "Get 50% off On Internet Banking",
    messageOnSuccessPage: "",
    toDisplayMessage: "Off",
    toDisplayPopup: "On",
    discountRate: 50,
    discountAmount: 0,
    noOfTransactionBySameCard: "0",
    discountBasedOnCustomerMobile: "No",
    totalDiscountAmountAllowedInCampaignPeriod: 0,
    amountToDisplayOffer: 0,
    customizedAmountForOffer: "0",
    offerInTime: "No",
    discountOnProductPrice: "Off",
    discountPriceByMerchant: "Off",
    whetherSupportDynamicPara: "Off",
    couponDiscount: "Off",
    specificBIN: "No BIN Number Provided",
    campaignCreatedBy: "Shishir",
    campaignUpdatedBy: "2023-05-09 11:49:27",
    acquirerBankImage: "No Image",
    cardTypeLike: "No Specific Card Type",
    // New Screenshot Fields
    forAnyGateway: "Off",
    discountStartedAmount: 0,
    binList: "",
    allowEMI: "Off",
    savedCard: "Off",
    dynamicDiscountParameter: "Off",
  },
];

// --- Filter Config ---
const primaryFilterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Search Date", icon: Calendar },
  { key: "storeId", type: "input", label: "Store ID", placeholder: "Store ID" },
  {
    key: "status",
    type: "select",
    label: "Campaign Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Active", value: "Active" },
      { label: "Deactive", value: "Deactive" },
    ],
  },
];

export default function StoreDiscountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- State ---
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target as Node)
      ) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync filters with URL
  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    if (params.date_preset) {
      params.date = {
        preset: params.date_preset,
        from: params.date_from,
        to: params.date_to,
      };
    }
    return params;
  }, [searchParams]);

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(filters);

  // Sync local filters when URL params change (e.g., via clear or external nav)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // --- Logic ---
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = useMemo(() => {
    return MOCK_CAMPAIGNS.filter((campaign) => {
      // Filter by Status
      const status = filters.status || "all";
      if (status !== "all" && campaign.status !== status) return false;

      // Filter by Store ID
      const storeId = filters.storeId || "";
      if (
        storeId &&
        !campaign.storeId.toLowerCase().includes(storeId.toLowerCase())
      )
        return false;

      // Filter by Search Query (Title or Store Name)
      if (
        searchQuery &&
        !campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !campaign.storeName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      // Date Filter
      if (filters.date_preset) {
        // Skip date filter for Running campaigns as per previous requirement
        if (status === "Running") return true;

        const campaignStart = new Date(
          campaign.startDate.split(",")[1] || campaign.startDate,
        );
        const campaignEnd = new Date(
          campaign.endDate.split(",")[1] || campaign.endDate,
        );

        // Simplified Date logic for mock
        // In a real app we would use more robust date comparison
        if (filters.date_from && campaignEnd < new Date(filters.date_from))
          return false;
        if (filters.date_to && campaignStart > new Date(filters.date_to))
          return false;
      }

      return true;
    });
  }, [filters, searchQuery]);

  // Set first card expanded by default
  useEffect(() => {
    if (!expandedId && filteredCampaigns.length > 0) {
      setExpandedId(filteredCampaigns[0].id);
    }
  }, [filteredCampaigns]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setSearchParams(() => {
      const next = new URLSearchParams();
      Object.entries(localFilters).forEach(([key, value]) => {
        if (key === "date") {
          if (value && value.preset && value.preset !== "all") {
            next.set("date_preset", value.preset);
            if (value.from) next.set("date_from", value.from);
            if (value.to) next.set("date_to", value.to);
          }
        } else {
          if (value && value !== "all") {
            next.set(key, String(value));
          }
        }
      });
      return next;
    });
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchParams({});
  };

  const hasUnappliedChanges = useMemo(
    () => JSON.stringify(localFilters) !== JSON.stringify(filters),
    [localFilters, filters],
  );

  const handleGenerateCSV = () => {
    const headers = [
      "Campaign Title",
      "Store Name",
      "Store ID",
      "Status",
      "Discount",
      "Channel",
      "Start Date",
      "End Date",
      "Frequency",
    ];
    const rows = filteredCampaigns.map((c) => [
      c.title,
      c.storeName,
      c.storeId,
      c.status,
      `${c.discountValue}${c.discountType === "Percentage" ? "%" : " BDT"}`,
      c.channel,
      c.startDate,
      c.endDate,
      c.frequency,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "store_discount_offers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Store Discount Offer
          </h1>
          <p className="text-slate-500 text-sm">
            Manage and track store-wide discount campaigns and promotional
            offers.
          </p>
        </div>
        <div className="relative" ref={addMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddMenuOpen(!isAddMenuOpen);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Discount</span>
            <ChevronDown
              className={clsx(
                "w-4 h-4 transition-transform",
                isAddMenuOpen && "rotate-180",
              )}
            />
          </button>

          {isAddMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  navigate("/merchants/store-discount/new");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-600 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-primary-500" />
                Single Discount
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  navigate("/merchants/store-discount/new-bulk");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-600 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-primary-500" />
                Bulk Discount
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterBar
          config={primaryFilterConfig}
          filters={localFilters}
          onFilterChange={handleFilterChange}
        />

        <button
          onClick={handleApplyFilters}
          disabled={!hasUnappliedChanges}
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
            hasUnappliedChanges
              ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
          )}
        >
          Apply Filters
        </button>

        {Object.keys(localFilters).length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 ml-1">
          Available Campaigns ({filteredCampaigns.length})
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Quick search title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-white shadow-sm transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            onClick={handleGenerateCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Card List - Full Width */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <DiscountOfferCard
            key={campaign.id}
            campaign={campaign}
            isExpanded={expandedId === campaign.id}
            onToggle={() =>
              setExpandedId(expandedId === campaign.id ? null : campaign.id)
            }
          />
        ))}

        {filteredCampaigns.length === 0 && (
          <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-semibold">No campaigns found</p>
            <p className="text-sm">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
