import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Calendar,
  Search,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  X,
  Plus,
  ChevronDown,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Pencil,
  Eye,
  Play,
} from "lucide-react";
import { clsx } from "clsx";
import { parseISO, isAfter } from "date-fns";
import { toast } from "react-hot-toast";
import { DataTable } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { FilterBar } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import type { ColumnDef } from "@tanstack/react-table";
import type { MerchantCampaignEntry } from "./types";
import {
  STATUS_BADGE_CLASS,
  getMerchantCampaignListStatusClass,
} from "./utils/statusBadge";
import { CAMPAIGN_SECTORS_LIST } from "./utils/sectors";
import { DatePicker } from "../../components/DatePicker";
import { DateRangePicker } from "../../components/DateRangePicker";
import { toDisplayCampaignDate, toIsoDateString } from "./utils/campaignDates";
import { SectorsCell } from "./components/SectorsCell";
import { CampaignStoreRequestSection } from "./components/CampaignStoreRequestSection";
import { CampaignViewDetailsTabs } from "./components/CampaignViewDetailsTabs";
import {
  ActionIconButton,
  ActionIconButtonGroup,
} from "./components/ActionIconButton";
import { CAMPAIGN_STORE_REQUESTS_MOCK } from "./utils/campaignStoreRequests";

type EditFormErrors = {
  campaign?: string;
  campaignDateRange?: string;
  sectors?: string;
  confirmationExpire?: string;
  banner?: string;
  description?: string;
  paymentPartners?: string;
};

const MAX_BANNER_SIZE_MB = 5;

// Constants for Edit Modal
const BANGLADESH_BANKS = [
  "AB Bank PLC",
  "AGRANI BANK LIMITED",
  "Al - Arafah Islami Bank PLC",
  "BANGLADESH COMMERCE BANK LTD",
  "BANGLADESH KRISHI BANK",
  "Bank Asia PLC",
  "BASIC BANK LIMITED",
  "BRAC Bank PLC",
  "City Bank PLC",
  "Dhaka Bank PLC",
  "Dutch Bangla Bank PLC",
  "Eastern Bank PLC",
  "EXIM Bank Limited",
  "First Security Islami Bank PLC",
  "HSBC",
  "IFIC BANK",
  "Islami Bank Bangladesh Limited",
  "ITCL",
  "Jamuna Bank PLC",
  "JANATA BANK",
  "LankaBangla Finance PLC",
  "Mercantile Bank PLC",
  "Mutual Trust Bank PLC",
  "NATIONAL BANK",
  "NCC Bank PLC",
  "One Bank PLC",
  "Premier Bank PLC",
  "Prime Bank PLC",
  "Pubali Bank PLC",
  "RUPALI BANK",
  "Shahjalal Islami Bank",
  "SOCIAL ISLAMI BANK",
  "SONALI BANK",
  "Southeast Bank PLC",
  "STANDARD BANK",
  "Standard Chartered Bank PLC",
  "United Commercial Bank PLC",
  "Trust Bank Limited",
  "Commercial Bank of Ceylon PLC",
  "Modhumoti Bank PLC",
  "NRB Commercial Bank PLC",
  "UNION BANK LTD",
  "NRB Bank",
  "Meghna Bank PLC",
  "SBAC Bank PLC",
  "Midland Bank PLC",
  "Citibank N.A.",
  "Uttara Bank Ltd",
  "ICB Islamic Bank",
  "Shimanto Bank PLC",
  "NRB Global Bank Ltd",
  "Bank Alfalah",
  "State Bank of India",
  "Community Bank Bangladesh PLC",
  "Rajshahi Krishi Unnayan Bank",
  "Padma Bank Limited",
  "Bangladesh Development Bank Limited",
  "Habib Bank Limited",
  "Woori Bank Bangladesh",
  "National Bank of Pakistan",
  "Sonali Bank Limited",
  "CITIZENS BANK PLC",
  "test bank",
  "test bank2",
  "test bank1",
  "test bank9",
];

const MFS_LIST = ["Bkash", "Upay", "Nagad", "Islamic Wallet"];
const INTERNET_BANK_LIST = ["AB Direct"];
const CAMPAIGN_SECTORS = CAMPAIGN_SECTORS_LIST;

const CLOSED_CAMPAIGN_STORE_REQUESTS = CAMPAIGN_STORE_REQUESTS_MOCK;

const CLOSED_VIEW_SELECTED_BANKS = BANGLADESH_BANKS.filter(
  (_, index) => index % 2 === 0,
);

const RUNNING_VIEW_SELECTED_BANKS = [
  "AB Bank PLC",
  "Bank Asia PLC",
  "BRAC Bank PLC",
  "City Bank PLC",
  "Eastern Bank PLC",
  "IFIC BANK",
  "Jamuna Bank PLC",
  "Mercantile Bank PLC",
  "NCC Bank PLC",
  "One Bank PLC",
  "Prime Bank PLC",
  "Pubali Bank PLC",
  "Southeast Bank PLC",
  "Standard Chartered Bank PLC",
  "Trust Bank Limited",
  "United Commercial Bank PLC",
];

const CAMPAIGN_VIEW_DESCRIPTIONS: Record<string, string> = {
  "2": "Amet dolor exercita",
  "3": "Amet dolor exercita",
  "4": "Amet dolor exercita",
  "5": "Amet dolor exercita",
  "6": "Voluptatem modi et",
  "7": "Amet dolor exercita",
  "8": "Amet dolor exercita",
};

const downloadCampaignStoreCsv = (trackingId?: string) => {
  const headers = [
    "Merchant Name",
    "Brand Name",
    "Store Id",
    "Kam Name",
    "Category",
    "URL",
    "Discount Percentage",
    "Discount fully consumed by you (Business)",
    "Shared with Partners",
    "Minimum order value",
    "Max discount/Trx",
    "Maximum Amount of the Discount of the Same Card",
    "Remarks",
  ];
  const csvRows = [headers.join(",")];
  CLOSED_CAMPAIGN_STORE_REQUESTS.forEach((row) => {
    csvRows.push(
      [
        `"${row.merchant}"`,
        `"${row.brand}"`,
        row.storeId,
        row.kam,
        `"${row.category}"`,
        row.url,
        String(row.disc),
        row.consumed,
        String(row.shared),
        String(row.min),
        String(row.max),
        String(row.maxAmt),
        `"${row.remarks}"`,
      ].join(","),
    );
  });
  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `campaign_stores_${trackingId || "export"}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const isPendingOrCreatedCampaignStatus = (status?: string) =>
  status === "Pending" || status === "Created";
const isClosedCampaignStatus = (status?: string) => status === "Closed";

const getCampaignPartnerSelections = (status?: string) => {
  if (isClosedCampaignStatus(status)) {
    return {
      selectedBanks: CLOSED_VIEW_SELECTED_BANKS,
      selectedMfs: [...MFS_LIST],
      selectedInternetBanks: [...INTERNET_BANK_LIST],
    };
  }

  if (status === "Running" || isPendingOrCreatedCampaignStatus(status)) {
    return {
      selectedBanks: RUNNING_VIEW_SELECTED_BANKS,
      selectedMfs: [],
      selectedInternetBanks: [],
    };
  }

  return {
    selectedBanks: [],
    selectedMfs: [],
    selectedInternetBanks: [],
  };
};

const CAMPAIGN_BANNER_IMAGES = [
  "https://campaign.sslcommerz.com/fifa_26/images/Landing-page-Banner.png",
  "https://campaign.sslcommerz.com/summer_26/images/Landing-page-Banner.png",
] as const;

const getRandomCampaignBanner = () =>
  CAMPAIGN_BANNER_IMAGES[
    Math.floor(Math.random() * CAMPAIGN_BANNER_IMAGES.length)
  ];

// Updated Mock Data for Kam Merchant Campaign List
const MERCHANT_CAMPAIGNS_MOCK: MerchantCampaignEntry[] = [
  {
    id: "1",
    campaign: "Karam Leblanc",
    trackingId: "SZYVAJ16012026212246",
    sectors: CAMPAIGN_SECTORS_LIST.join(", "),
    startDate: "22-Apr-25",
    endDate: "22-Apr-25",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "20-Apr-26",
    canOnboard: "No",
    status: "Running",
    edit: "N/A",
    details: "View",
    upload: "Upload",
  },
  {
    id: "2",
    campaign: "test10",
    trackingId: "SZYVAJ16012026212246",
    sectors:
      "Ministry of Foreign Affairs, ITES, Charity/NGO/Volunteer Services, Distance Learning",
    startDate: "09-Feb-26",
    endDate: "10-Feb-26",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Pending",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
  {
    id: "3",
    campaign: "test1",
    trackingId: "WJ67FI14122025170107",
    sectors:
      "ISP, Events Management Services, Ministry of Fisheries and Livestock",
    startDate: "09-Feb-26",
    endDate: "10-Feb-26",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "25-Jun-25",
    canOnboard: "Yes",
    status: "Created",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
  {
    id: "4",
    campaign: "test2",
    trackingId: "HOSKQN09112025163414",
    sectors: "VOD/OTT Platform, Construction Goods",
    startDate: "27-Jan-26",
    endDate: "27-Jan-26",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "27-Jan-25",
    canOnboard: "Yes",
    status: "Created",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
  {
    id: "5",
    campaign: "test",
    trackingId: "JDBSKI12072025160017",
    sectors: "Service, Tourism, Diagnostics & Treatment, VTS",
    startDate: "27-Jan-26",
    endDate: "27-Jan-26",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "27-Jan-26",
    canOnboard: "Yes",
    status: "Created",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
  {
    id: "6",
    campaign: "testcamp5",
    trackingId: "IDLYBV13042025283908",
    sectors: "Professional Service, DC Office, F Commerce-Lifestyle",
    startDate: "20-Jan-26",
    endDate: "23-Jan-26",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "20-Jan-25",
    canOnboard: "No",
    status: "Closed",
    edit: "N/A",
    details: "View",
    upload: "Upload",
  },
  {
    id: "7",
    campaign: "Campaign New",
    trackingId: "EOSFBY13042025283908",
    sectors: "Autonomous Body, Ministry of Information and Broadcasting",
    startDate: "01-Jan-26",
    endDate: "29-Jan-26",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "01-Jan-25",
    canOnboard: "Yes",
    status: "Pending",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
  {
    id: "8",
    campaign: "test1",
    trackingId: "SLNNMQ10042025285517",
    sectors:
      "Business Service, Association, Lodging/Hotel/Motel, Marketplaces, Mobile",
    startDate: "04-Jan-26",
    endDate: "08-Jan-26",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "04-Jan-25",
    canOnboard: "No",
    status: "Pending",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
  {
    id: "9",
    campaign: "itemtest - campaign phase 2",
    trackingId: "IKIKJY10042025284750",
    sectors: "Subscription, Tele-Medicine, Transportation",
    startDate: "24-Dec-25",
    endDate: "26-Dec-25",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "22-Dec-25",
    canOnboard: "Yes",
    status: "Pending",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
  {
    id: "10",
    campaign: "Campaign Test Report - 102",
    trackingId: "QERF3F16042025275622",
    sectors: "Travel Agencies and Tour Operators, Utility services",
    startDate: "30-Nov-25",
    endDate: "31-Dec-25",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "01-Dec-25",
    canOnboard: "No",
    status: "Closed",
    edit: "N/A",
    details: "View",
    upload: "Upload",
  },
  {
    id: "11",
    campaign: "Campaign Test Report - 101",
    trackingId: "C1U4ZC13042025271050",
    sectors: "Retail Outlet Services, College, ITES",
    startDate: "11-Dec-25",
    endDate: "31-Dec-25",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "01-Dec-25",
    canOnboard: "No",
    status: "Closed",
    edit: "N/A",
    details: "View",
    upload: "Upload",
  },
  {
    id: "12",
    campaign: "Campaign Test - 107",
    trackingId: "XXNPEP13042025270729",
    sectors: "Airlines, Marketplace",
    startDate: "18-Oct-25",
    endDate: "01-Dec-25",
    banner: getRandomCampaignBanner(),
    confirmationExpire: "18-Oct-25",
    canOnboard: "Yes",
    status: "Created",
    edit: "Edit",
    details: "View",
    upload: "N/A",
  },
];

const DetailRow = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value?: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
    <dt className="w-full sm:w-1/3 text-slate-500 font-medium">{label}</dt>
    <dd className={clsx("w-full sm:w-2/3 text-slate-900", valueClassName)}>
      {value || "Not Assigned"}
    </dd>
  </div>
);

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, search, selected]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e: Event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClose, true);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose, true);
    return () => {
      window.removeEventListener("mousedown", handleClose, true);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose, true);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full min-h-[38px] px-3 py-1.5 text-sm bg-white border rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-all select-none",
          error && !isOpen && "border-rose-300",
          isOpen
            ? "border-primary-500 ring-2 ring-primary-500/20"
            : !error && "border-slate-200 hover:border-slate-300",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 py-0.5">
          {selected.length === 0 ? (
            <span className="text-slate-400 text-sm">
              Select {label.toLowerCase()}...
            </span>
          ) : (
            <>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(selected[0]);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200 text-[11px] font-bold text-primary-700 hover:bg-primary-100 transition-colors shrink-0"
              >
                <span className="truncate max-w-[150px]">{selected[0]}</span>
                <X className="w-3 h-3 text-primary-500 hover:text-primary-700 shrink-0" />
              </span>
              {selected.length > 1 && (
                <span
                  className="inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded border text-[10px] font-bold bg-slate-100/90 text-slate-600 border-slate-200/80 shrink-0"
                  title={selected.slice(1).join(", ")}
                >
                  +{selected.length - 1}
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-slate-400 transition-transform shrink-0",
            isOpen && "rotate-180",
          )}
        />
      </div>

      {isOpen &&
        coords &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search sectors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-7 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAll();
                }}
                className="text-[11px] font-bold text-primary-600 hover:text-primary-700 hover:underline px-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {selected.length === options.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 italic">
                  No sectors found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isChecked = selected.includes(opt);
                  return (
                    <div
                      key={opt}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(opt);
                      }}
                      className={clsx(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none",
                        isChecked
                          ? "bg-primary-50/80 text-primary-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <div
                        className={clsx(
                          "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 border",
                          isChecked
                            ? "bg-primary-600 border-primary-600 text-white"
                            : "border-slate-300 bg-white",
                        )}
                      >
                        {isChecked && (
                          <Check className="h-3 w-3 stroke-[3px]" />
                        )}
                      </div>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
      {error && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default function KamMerchantCampaignListPage() {
  const navigate = useNavigate();
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    trackingId: "",
    campaignName: "",
    date: { preset: "all", from: "", to: "" },
    onboard: "all",
    status: "all",
  });

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);
  const [campaigns, setCampaigns] = useState<MerchantCampaignEntry[]>(
    MERCHANT_CAMPAIGNS_MOCK,
  );
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<MerchantCampaignEntry | null>(null);
  const [isStopParticipationDrawerOpen, setIsStopParticipationDrawerOpen] =
    useState(false);
  const [isStoppingParticipation, setIsStoppingParticipation] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editErrors, setEditErrors] = useState<EditFormErrors>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [providerSearchQuery, setProviderSearchQuery] = useState("");
  const [bannerFileName, setBannerFileName] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [originalBannerUrl, setOriginalBannerUrl] = useState<string | null>(
    null,
  );
  const addMenuRef = useRef<HTMLDivElement>(null);

  const revokeBannerPreviewUrl = (url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const handleEditBannerChange = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      setEditErrors((prev) => ({
        ...prev,
        banner: "Please upload a valid image file (PNG, JPG, etc.)",
      }));
      return;
    }

    if (file.size > MAX_BANNER_SIZE_MB * 1024 * 1024) {
      toast.error(`Banner must be under ${MAX_BANNER_SIZE_MB}MB`);
      setEditErrors((prev) => ({
        ...prev,
        banner: `Banner file must be less than ${MAX_BANNER_SIZE_MB}MB`,
      }));
      return;
    }

    revokeBannerPreviewUrl(bannerPreviewUrl);
    setBannerFileName(file.name);
    setBannerPreviewUrl(URL.createObjectURL(file));
    setEditErrors((prev) => ({ ...prev, banner: undefined }));
  };

  const handleEditBannerRemove = () => {
    const isNewUpload = bannerPreviewUrl?.startsWith("blob:");
    revokeBannerPreviewUrl(bannerPreviewUrl);

    if (isNewUpload && originalBannerUrl) {
      setBannerFileName("banner_image.png");
      setBannerPreviewUrl(originalBannerUrl);
      return;
    }

    setBannerFileName(null);
    setBannerPreviewUrl(null);
  };

  const resetEditBannerState = () => {
    revokeBannerPreviewUrl(bannerPreviewUrl);
    setBannerFileName(null);
    setBannerPreviewUrl(null);
    setOriginalBannerUrl(null);
  };

  const closeEditModal = () => {
    resetEditBannerState();
    setEditErrors({});
    setEditFormData({});
    setIsEditModalOpen(false);
  };

  const validateEditForm = () => {
    const newErrors: EditFormErrors = {};
    const trimmedName = (editFormData?.campaign || "").trim();
    const startIso = toIsoDateString(editFormData?.startDate || "");
    const endIso = toIsoDateString(editFormData?.endDate || "");
    const enrollmentIso = toIsoDateString(
      editFormData?.confirmationExpire || "",
    );

    if (!trimmedName) {
      newErrors.campaign = "Campaign name is required";
    } else if (trimmedName.length < 3) {
      newErrors.campaign = "Campaign name must be at least 3 characters";
    }

    if (!startIso || !endIso) {
      newErrors.campaignDateRange = "Campaign start and end dates are required";
    } else if (isAfter(parseISO(startIso), parseISO(endIso))) {
      newErrors.campaignDateRange = "End date must be on or after start date";
    }

    if (!editFormData?.sectors?.length) {
      newErrors.sectors = "Select at least one sector";
    }

    if (!enrollmentIso) {
      newErrors.confirmationExpire =
        "Merchant enrollment last date is required";
    } else if (
      startIso &&
      isAfter(parseISO(enrollmentIso), parseISO(startIso))
    ) {
      newErrors.confirmationExpire =
        "Enrollment last date must be on or before campaign start date";
    }

    if (!bannerPreviewUrl) {
      newErrors.banner = "Campaign banner is required";
    }

    if (!(editFormData?.description || "").trim()) {
      newErrors.description = "Campaign description is required";
    }

    const hasPaymentPartner =
      (editFormData?.selectedBanks?.length || 0) > 0 ||
      (editFormData?.selectedMfs?.length || 0) > 0 ||
      (editFormData?.selectedInternetBanks?.length || 0) > 0;
    if (!hasPaymentPartner) {
      newErrors.paymentPartners =
        "Select at least one bank, MFS, or internet banking provider";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEditForm()) {
      toast.error("Please fix the highlighted errors before submitting");
      return;
    }

    setIsSavingEdit(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === editFormData.id
            ? {
                ...item,
                campaign: editFormData.campaign.trim(),
                startDate: editFormData.startDate,
                endDate: editFormData.endDate,
                sectors: editFormData.sectors.join(", "),
                confirmationExpire: editFormData.confirmationExpire,
                banner: bannerPreviewUrl || item.banner,
                selectedBanks: editFormData.selectedBanks,
                selectedMfs: editFormData.selectedMfs,
                selectedInternetBanks: editFormData.selectedInternetBanks,
                status: editFormData.status,
              }
            : item,
        ),
      );
      toast.success("Campaign updated successfully");
      closeEditModal();
    } catch {
      toast.error("Failed to update campaign. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

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

  const filteredBanks = useMemo(() => {
    return BANGLADESH_BANKS.filter((bank) =>
      bank.toLowerCase().includes(providerSearchQuery.toLowerCase()),
    );
  }, [providerSearchQuery]);

  const handleSelectAll = (type: "bank" | "mfs" | "ib", list: string[]) => {
    const key =
      type === "bank"
        ? "selectedBanks"
        : type === "mfs"
          ? "selectedMfs"
          : "selectedInternetBanks";
    setEditFormData((prev: any) => ({
      ...prev,
      [key]: list,
    }));
    if (editErrors.paymentPartners) {
      setEditErrors((prev) => ({ ...prev, paymentPartners: undefined }));
    }
  };

  const filteredMfs = useMemo(() => {
    return MFS_LIST.filter((mfs) =>
      mfs.toLowerCase().includes(providerSearchQuery.toLowerCase()),
    );
  }, [providerSearchQuery]);

  const filteredIb = useMemo(() => {
    return INTERNET_BANK_LIST.filter((ib) =>
      ib.toLowerCase().includes(providerSearchQuery.toLowerCase()),
    );
  }, [providerSearchQuery]);

  const toggleItem = (type: "bank" | "mfs" | "ib", item: string) => {
    const key =
      type === "bank"
        ? "selectedBanks"
        : type === "mfs"
          ? "selectedMfs"
          : "selectedInternetBanks";
    setEditFormData((prev: any) => {
      const list = prev[key] || [];
      return {
        ...prev,
        [key]: list.includes(item)
          ? list.filter((i: string) => i !== item)
          : [...list, item],
      };
    });
    if (editErrors.paymentPartners) {
      setEditErrors((prev) => ({ ...prev, paymentPartners: undefined }));
    }
  };

  const [sectorSearchQuery, setSectorSearchQuery] = useState("");
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  const filteredSectors = useMemo(() => {
    return CAMPAIGN_SECTORS.filter((sector) =>
      sector.toLowerCase().includes(sectorSearchQuery.toLowerCase()),
    );
  }, [sectorSearchQuery]);

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  const handleStopParticipationConfirm = async () => {
    if (!selectedCampaign) return;

    setIsStoppingParticipation(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === selectedCampaign.id
            ? { ...item, canOnboard: "No" }
            : item,
        ),
      );
      setSelectedCampaign((prev) =>
        prev ? { ...prev, canOnboard: "No" } : prev,
      );
      setIsStopParticipationDrawerOpen(false);
      toast.success("Merchant participation stopped successfully.");
    } finally {
      setIsStoppingParticipation(false);
    }
  };

  const closeDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false);
    setIsStopParticipationDrawerOpen(false);
  };

  const filteredData = useMemo(() => {
    return campaigns.filter((item) => {
      const matchesId =
        !appliedFilters.trackingId ||
        item.trackingId
          .toLowerCase()
          .includes(appliedFilters.trackingId.toLowerCase());
      const matchesName =
        !appliedFilters.campaignName ||
        item.campaign
          .toLowerCase()
          .includes(appliedFilters.campaignName.toLowerCase());
      const matchesStatus =
        !appliedFilters.status ||
        appliedFilters.status === "all" ||
        item.status === appliedFilters.status;
      const matchesOnboard =
        !appliedFilters.onboard ||
        appliedFilters.onboard === "all" ||
        item.canOnboard === appliedFilters.onboard;

      if (appliedFilters.date?.from && appliedFilters.date?.to) {
        const itemDate = new Date(item.startDate);
        const fromDate = new Date(appliedFilters.date.from);
        const toDate = new Date(appliedFilters.date.to);
        if (itemDate < fromDate || itemDate > toDate) return false;
      }

      return matchesId && matchesName && matchesStatus && matchesOnboard;
    });
  }, [appliedFilters, campaigns]);

  const metrics = useMemo(
    () => ({
      total: filteredData.length,
      running: filteredData.filter((d) => d.status === "Running").length,
      pending: filteredData.filter((d) => d.status === "Pending").length,
      closed: filteredData.filter((d) => d.status === "Closed").length,
    }),
    [filteredData],
  );

  const columns: ColumnDef<MerchantCampaignEntry>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-medium">
          {row.index + 1}
        </span>
      ),
      size: 40,
    },
    {
      accessorKey: "campaign",
      header: "Campaign",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 py-1">
          <span className="text-xs font-semibold text-slate-900 leading-tight">
            {row.original.campaign}
          </span>
          <span className="text-[10px] font-medium text-primary-600 tracking-tight whitespace-nowrap">
            ID: {row.original.trackingId}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "sectors",
      header: "Sectors",
      cell: ({ row }) => <SectorsCell sectorsStr={row.original.sectors} />,
      size: 180,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
          {row.original.startDate}
        </span>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
          {row.original.endDate}
        </span>
      ),
    },
    {
      accessorKey: "banner",
      header: "Banner",
      cell: ({ row }) => {
        const bannerUrl = row.original.banner;
        if (bannerUrl === "N/A")
          return (
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              N/A
            </span>
          );
        return (
          <div
            onClick={() => setSelectedBanner(bannerUrl)}
            className="relative h-8 w-14 group cursor-pointer overflow-hidden rounded border border-slate-200 shadow-sm transition-all hover:border-primary-400 hover:shadow-md"
          >
            <img
              src={bannerUrl}
              alt="Campaign Banner"
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "confirmationExpire",
      header: "Enroll Date",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
          {row.original.confirmationExpire}
        </span>
      ),
    },
    {
      accessorKey: "canOnboard",
      header: "Can Onboard",
      cell: ({ row }) => (
        <span
          className={clsx(
            "text-xs font-semibold",
            row.original.canOnboard === "Yes"
              ? "text-emerald-600"
              : "text-slate-500",
          )}
        >
          {row.original.canOnboard}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={clsx(
            STATUS_BADGE_CLASS,
            getMerchantCampaignListStatusClass(row.original.status),
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const openEdit = () => {
          setEditFormData({
            ...row.original,
            sectors: row.original.sectors.split(",").map((s) => s.trim()),
            description:
              row.original.description ||
              `Campaign configuration and details for ${row.original.campaign}.`,
            ...getCampaignPartnerSelections(row.original.status),
          });
          const existingBanner =
            row.original.banner !== "N/A" ? row.original.banner : null;
          setOriginalBannerUrl(existingBanner);
          setBannerFileName(existingBanner ? "banner_image.png" : null);
          setBannerPreviewUrl(existingBanner);
          setProviderSearchQuery("");
          setEditErrors({});
          setIsEditModalOpen(true);
        };

        const openDetails = () => {
          const campaign =
            campaigns.find((item) => item.id === row.original.id) ||
            row.original;
          setSelectedCampaign({
            ...campaign,
            ...getCampaignPartnerSelections(campaign.status),
          });
          setIsDetailsDrawerOpen(true);
        };

        const handleStartCampaign = () => {
          setCampaigns((prev) =>
            prev.map((item) =>
              item.id === row.original.id
                ? {
                    ...item,
                    status: "Running",
                    edit: "Edit",
                    canOnboard: "Yes",
                  }
                : item,
            ),
          );
          toast.success("Campaign started successfully");
        };

        const canStartCampaign =
          row.original.status === "Created" ||
          row.original.status === "Pending";

        return (
          <ActionIconButtonGroup>
            {row.original.status !== "Closed" && (
              <ActionIconButton
                label="Edit"
                tooltip="Edit"
                icon={Pencil}
                onClick={openEdit}
              />
            )}
            <ActionIconButton
              label="View"
              tooltip="View"
              icon={Eye}
              onClick={openDetails}
            />
            {canStartCampaign && (
              <ActionIconButton
                label="Start"
                tooltip="Start Campaign"
                icon={Play}
                onClick={handleStartCampaign}
              />
            )}
          </ActionIconButtonGroup>
        );
      },
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      trackingId: "",
      campaignName: "",
      date: { preset: "all", from: "", to: "" },
      onboard: "all",
      status: "all",
    };
    setLocalFilters(cleared);
    setAppliedFilters(cleared);
  };

  const isFiltersChanged =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Campaign list
          </h1>
          <p className="text-slate-500 text-sm tracking-tight">
            Monitor and manage merchant-initiated campaign activities.
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
            <span>Add New</span>
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
                  navigate("new-single");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-600 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-primary-500" />
                Single Campaign
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  navigate("new-bulk");
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-primary-50 hover:text-primary-600 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-primary-500" />
                Bulk Campaign
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Custom Filters Bar based on Screenshot 1 */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            config={[
              {
                key: "date",
                type: "date-range",
                label: "Campaign Date",
                icon: Calendar,
              },
              {
                key: "trackingId",
                type: "input",
                label: "Campaign ID",
                placeholder: "Campaign ID",
              },
              {
                key: "campaignName",
                type: "input",
                label: "Campaign Name",
                placeholder: "Campaign Name",
              },
              {
                key: "onboard",
                type: "select",
                label: "Can Onboard",
                options: [
                  { label: "Can Onboard", value: "all" },
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ],
              },
              {
                key: "status",
                type: "select",
                label: "Campaign Status",
                options: [
                  { label: "All Status", value: "all" },
                  { label: "Created", value: "Created" },
                  { label: "Pending", value: "Pending" },
                  { label: "Sent to bank", value: "Sent to bank" },
                  { label: "Upcoming", value: "Upcoming" },
                  { label: "Running", value: "Running" },
                ],
              },
            ]}
          />

          <button
            onClick={handleApplyFilters}
            disabled={!isFiltersChanged}
            className={clsx(
              "flex items-center gap-2 px-6 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
              isFiltersChanged
                ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
            )}
          >
            Apply Filters
          </button>

          {Object.values(localFilters).some(
            (v) => v !== "all" && v !== "" && typeof v !== "object",
          ) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Metrics Overview */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Campaigns"
              value={metrics.total.toString()}
            />
            <MetricCard
              title="Running"
              value={metrics.running.toString()}
              valueClassName="text-emerald-600"
            />
            <MetricCard
              title="Pending"
              value={metrics.pending.toString()}
              valueClassName="text-blue-600"
            />
            <MetricCard
              title="Closed"
              value={metrics.closed.toString()}
              valueClassName="text-rose-600"
            />
          </div>
        </div>

        {/* Data Table with Screenshot 2 columns */}
        <div className="pt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            hideToolbarDateFilter={true}
            viewButtonLabel="View Column"
            filterActions={
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 ml-1">
                  Showing campaign data
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredData.length}
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Banner Preview Modal */}
      <Modal
        isOpen={!!selectedBanner}
        onClose={() => setSelectedBanner(null)}
        title="Campaign Banner Preview"
        size="auto"
      >
        {selectedBanner && (
          <div className="overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={selectedBanner}
              alt="Campaign Banner"
              className="max-h-[80vh] w-auto max-w-full h-auto"
            />
          </div>
        )}
      </Modal>

      {/* Campaign Details Drawer */}
      <Drawer
        open={isDetailsDrawerOpen}
        onClose={closeDetailsDrawer}
        title={
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {selectedCampaign?.campaign}
              </span>
              <span
                className={clsx(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  selectedCampaign?.status === "Running" ||
                    selectedCampaign?.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : selectedCampaign?.status === "Pending" ||
                        selectedCampaign?.status === "Created"
                      ? "bg-[#007cc2] text-white font-bold"
                      : selectedCampaign?.status === "Closed"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-100 text-slate-700",
                )}
              >
                {selectedCampaign?.status}
              </span>
            </div>
            <span className="text-sm text-slate-500 font-medium mt-1">
              Tracking ID: {selectedCampaign?.trackingId}
            </span>
          </div>
        }
        width="4xl"
        noPadding={true}
      >
        <div className="flex flex-col h-full bg-[#f4f7f9] p-8 space-y-8 pb-20 overflow-y-auto custom-scrollbar">
          {isPendingOrCreatedCampaignStatus(selectedCampaign?.status) ? (
            <PendingCreatedCampaignDetails
              key={selectedCampaign?.id}
              campaign={selectedCampaign}
              onStopParticipation={() => setIsStopParticipationDrawerOpen(true)}
            />
          ) : isClosedCampaignStatus(selectedCampaign?.status) ? (
            <ClosedCampaignDetails
              key={selectedCampaign?.id}
              campaign={selectedCampaign}
              onManageRoad={() => setIsBkashModalOpen(true)}
            />
          ) : (
            <ClosedCampaignDetails
              key={selectedCampaign?.id}
              campaign={selectedCampaign}
              onManageRoad={() => setIsBkashModalOpen(true)}
            />
          )}
        </div>
      </Drawer>

      <Drawer
        open={isStopParticipationDrawerOpen}
        onClose={() => setIsStopParticipationDrawerOpen(false)}
        title="Stop Merchant Participation"
        width="4xl"
        noPadding={true}
      >
        <div className="flex flex-col h-full bg-[#f4f7f9] p-8 space-y-8 pb-20 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest px-1">
                Stop Merchant Participation
              </h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 p-6 space-y-3">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                Are you sure you want to stop merchant participation for this
                campaign?
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                N.B : Once you stop merchant participation this campaign, there
                is no going back!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 px-2 justify-end">
            <button
              type="button"
              onClick={() => setIsStopParticipationDrawerOpen(false)}
              disabled={isStoppingParticipation}
              className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleStopParticipationConfirm}
              disabled={isStoppingParticipation}
              className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isStoppingParticipation && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isStoppingParticipation
                ? "Stopping..."
                : "Confirm stop merchant participation"}
            </button>
          </div>
        </div>
      </Drawer>

      {/* Edit Campaign Drawer */}
      <Drawer
        open={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Campaign"
        width="5xl"
      >
        <div className="flex flex-col gap-6 pb-32">
          <div className="flex flex-col gap-10">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-visible">
              <div className="px-4 py-4 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Basic Configuration
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={editFormData?.campaign || ""}
                      placeholder="Enter campaign name"
                      className={clsx(
                        "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-[38px]",
                        editErrors.campaign
                          ? "border-rose-300 focus:ring-rose-500"
                          : "border-slate-200",
                      )}
                      onChange={(e) => {
                        setEditFormData((prev: any) => ({
                          ...prev,
                          campaign: e.target.value,
                        }));
                        if (editErrors.campaign) {
                          setEditErrors((prev) => ({
                            ...prev,
                            campaign: undefined,
                          }));
                        }
                      }}
                    />
                    {editErrors.campaign && (
                      <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {editErrors.campaign}
                      </p>
                    )}
                  </div>

                  <DateRangePicker
                    label="Campaign Period (Start Date – End Date)"
                    usePortal
                    value={{
                      startDate: toIsoDateString(editFormData?.startDate || ""),
                      endDate: toIsoDateString(editFormData?.endDate || ""),
                    }}
                    onChange={(range) => {
                      setEditFormData((prev: any) => ({
                        ...prev,
                        startDate: toDisplayCampaignDate(range.startDate),
                        endDate: toDisplayCampaignDate(range.endDate),
                      }));
                      if (editErrors.campaignDateRange) {
                        setEditErrors((prev) => ({
                          ...prev,
                          campaignDateRange: undefined,
                        }));
                      }
                    }}
                    placeholder="Select start & end date"
                    error={editErrors.campaignDateRange}
                  />

                  <div>
                    <MultiSelectDropdown
                      label="Sectors"
                      options={CAMPAIGN_SECTORS}
                      selected={editFormData?.sectors || []}
                      onChange={(list) => {
                        setEditFormData((prev: any) => ({
                          ...prev,
                          sectors: list,
                        }));
                        if (editErrors.sectors) {
                          setEditErrors((prev) => ({
                            ...prev,
                            sectors: undefined,
                          }));
                        }
                      }}
                      error={editErrors.sectors}
                    />
                  </div>

                  <DatePicker
                    label="Merchant Enrollment Last Date"
                    usePortal
                    placement="up"
                    value={toIsoDateString(
                      editFormData?.confirmationExpire || "",
                    )}
                    onChange={(val) => {
                      setEditFormData((prev: any) => ({
                        ...prev,
                        confirmationExpire: toDisplayCampaignDate(val),
                      }));
                      if (editErrors.confirmationExpire) {
                        setEditErrors((prev) => ({
                          ...prev,
                          confirmationExpire: undefined,
                        }));
                      }
                    }}
                    placeholder="Select enrollment last date"
                    error={editErrors.confirmationExpire}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData?.status || "Pending"}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-[38px] cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Upload Banner
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 group min-w-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleEditBannerChange(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className={clsx(
                            "w-full px-3 py-2 bg-white border-2 border-dashed group-hover:border-primary-400 group-hover:bg-primary-50/30 rounded-lg transition-all flex items-center gap-3 h-[38px]",
                            editErrors.banner
                              ? "border-rose-300"
                              : "border-slate-200",
                          )}
                        >
                          <div className="w-10 h-6 rounded border border-slate-200 bg-slate-100 group-hover:bg-primary-100 transition-all flex items-center justify-center overflow-hidden shrink-0">
                            {bannerPreviewUrl ? (
                              <img
                                src={bannerPreviewUrl}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold truncate text-slate-500 group-hover:text-primary-500">
                              {bannerFileName || "Choose Banner File"}
                            </p>
                          </div>
                          {bannerPreviewUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditBannerRemove();
                              }}
                              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500 relative z-20 transition-colors cursor-pointer"
                              title={
                                bannerPreviewUrl?.startsWith("blob:") &&
                                originalBannerUrl
                                  ? "Restore original banner"
                                  : "Remove banner"
                              }
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {bannerPreviewUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedBanner(bannerPreviewUrl)}
                          className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline shrink-0"
                        >
                          View
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-400 italic">
                      Recommended size: 1200x400px (PNG/JPG, max{" "}
                      {MAX_BANNER_SIZE_MB}MB)
                    </p>
                    {editErrors.banner && (
                      <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {editErrors.banner}
                      </p>
                    )}
                  </div>
                </div>

                {/* Campaign Description (Full Width) */}
                <div className="mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Campaign Description
                    </label>
                    <textarea
                      className={clsx(
                        "w-full px-4 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[80px] resize-none",
                        editErrors.description
                          ? "border-rose-300 focus:ring-rose-500"
                          : "border-slate-200",
                      )}
                      placeholder="Provide a brief description of the campaign and its goals..."
                      value={editFormData?.description || ""}
                      onChange={(e) => {
                        setEditFormData((prev: any) => ({
                          ...prev,
                          description: e.target.value,
                        }));
                        if (editErrors.description) {
                          setEditErrors((prev) => ({
                            ...prev,
                            description: undefined,
                          }));
                        }
                      }}
                    />
                    {editErrors.description && (
                      <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {editErrors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Payment Partners Section Header & Search */}
            <div
              className={clsx(
                "bg-white rounded-lg border shadow-sm overflow-hidden",
                editErrors.paymentPartners
                  ? "border-rose-200"
                  : "border-slate-200",
              )}
            >
              <div className="px-4 py-4 space-y-6">
                <div
                  className={clsx(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5",
                    editErrors.paymentPartners
                      ? "border-rose-100"
                      : "border-slate-100",
                  )}
                >
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Payment Partners Selection
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Search and select participating banks, MFS, and internet
                      banking providers below.
                    </p>
                    {editErrors.paymentPartners && (
                      <p className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {editErrors.paymentPartners}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full sm:w-80">
                    <input
                      type="text"
                      placeholder="Search Banks, MFS, or Internet Banking..."
                      value={providerSearchQuery}
                      onChange={(e) => setProviderSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-2xs"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    {providerSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setProviderSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Participating Banks list */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Participating Banks ({filteredBanks.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectAll(
                          "bank",
                          editFormData?.selectedBanks?.length ===
                            BANGLADESH_BANKS.length
                            ? []
                            : BANGLADESH_BANKS,
                        )
                      }
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {editFormData?.selectedBanks?.length ===
                      BANGLADESH_BANKS.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
                    {filteredBanks.map((bank) => {
                      const isChecked =
                        editFormData?.selectedBanks?.includes(bank);
                      return (
                        <label
                          key={bank}
                          className={clsx(
                            "flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-slate-100/60 transition-colors cursor-pointer select-none group",
                            isChecked && "bg-primary-50/50 font-semibold",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem("bank", bank)}
                            className="hidden"
                          />
                          <div
                            className={clsx(
                              "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                              isChecked
                                ? "bg-primary-600 border border-primary-600 text-white shadow-2xs"
                                : "border border-slate-300 bg-white group-hover:border-primary-400",
                            )}
                          >
                            {isChecked && (
                              <Check className="h-3 w-3 stroke-[3px]" />
                            )}
                          </div>
                          <span
                            className={clsx(
                              "text-[11px] uppercase tracking-tight truncate leading-tight transition-colors",
                              isChecked
                                ? "text-primary-700 font-bold"
                                : "text-slate-700 font-medium group-hover:text-primary-600",
                            )}
                          >
                            {bank}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* MFS Providers List */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      MFS Providers ({filteredMfs.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectAll(
                          "mfs",
                          editFormData?.selectedMfs?.length === MFS_LIST.length
                            ? []
                            : MFS_LIST,
                        )
                      }
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {editFormData?.selectedMfs?.length === MFS_LIST.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
                    {filteredMfs.map((mfs) => {
                      const isChecked =
                        editFormData?.selectedMfs?.includes(mfs);
                      return (
                        <label
                          key={mfs}
                          className={clsx(
                            "flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-slate-100/60 transition-colors cursor-pointer select-none group",
                            isChecked && "bg-primary-50/50 font-semibold",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem("mfs", mfs)}
                            className="hidden"
                          />
                          <div
                            className={clsx(
                              "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                              isChecked
                                ? "bg-primary-600 border border-primary-600 text-white shadow-2xs"
                                : "border border-slate-300 bg-white group-hover:border-primary-400",
                            )}
                          >
                            {isChecked && (
                              <Check className="h-3 w-3 stroke-[3px]" />
                            )}
                          </div>
                          <span
                            className={clsx(
                              "text-[11px] uppercase tracking-tight truncate leading-tight transition-colors",
                              isChecked
                                ? "text-primary-700 font-bold"
                                : "text-slate-700 font-medium group-hover:text-primary-600",
                            )}
                          >
                            {mfs}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Internet Banking Providers List */}
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Internet Banking Providers ({filteredIb.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectAll(
                          "ib",
                          editFormData?.selectedInternetBanks?.length ===
                            INTERNET_BANK_LIST.length
                            ? []
                            : INTERNET_BANK_LIST,
                        )
                      }
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {editFormData?.selectedInternetBanks?.length ===
                      INTERNET_BANK_LIST.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
                    {filteredIb.map((ib) => {
                      const isChecked =
                        editFormData?.selectedInternetBanks?.includes(ib);
                      return (
                        <label
                          key={ib}
                          className={clsx(
                            "flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-slate-100/60 transition-colors cursor-pointer select-none group",
                            isChecked && "bg-primary-50/50 font-semibold",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem("ib", ib)}
                            className="hidden"
                          />
                          <div
                            className={clsx(
                              "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                              isChecked
                                ? "bg-primary-600 border border-primary-600 text-white shadow-2xs"
                                : "border border-slate-300 bg-white group-hover:border-primary-400",
                            )}
                          >
                            {isChecked && (
                              <Check className="h-3 w-3 stroke-[3px]" />
                            )}
                          </div>
                          <span
                            className={clsx(
                              "text-[11px] uppercase tracking-tight truncate leading-tight transition-colors",
                              isChecked
                                ? "text-primary-700 font-bold"
                                : "text-slate-700 font-medium group-hover:text-primary-600",
                            )}
                          >
                            {ib}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions for Drawer */}
            <div className="flex items-center gap-3 mt-10 pt-6 border-t border-slate-100 px-2 justify-end">
              <button
                onClick={closeEditModal}
                className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </Drawer>
      {/* Configure bKash Volume Drawer */}
      <Drawer
        open={isBkashModalOpen}
        onClose={() => setIsBkashModalOpen(false)}
        title="Configure bKash Volume"
        width="4xl"
        noPadding={true}
      >
        <div className="flex flex-col h-full bg-[#f4f7f9] p-8 space-y-8 pb-20 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest px-1">
                Configure bKash Volume
              </h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left bg-white">
                  <thead className="bg-slate-50/50">
                    <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-[10px] [&>th]:font-bold [&>th]:text-slate-500 [&>th]:uppercase [&>th]:tracking-wider [&>th]:border-b [&>th]:border-slate-100 [&>th]:leading-tight">
                      <th className="w-10">#</th>
                      <th>Merchant Id</th>
                      <th>Store Id</th>
                      <th className="text-center">Transaction Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { merchantId: "demotest", storeId: "newdemotestlive" },
                      { merchantId: "gpecare", storeId: "gpecarelive01" },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-4 py-4 text-xs text-slate-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-900 font-bold">
                          {row.merchantId}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                          {row.storeId}
                        </td>
                        <td className="px-4 py-3 text-center max-w-[200px]">
                          <input
                            type="text"
                            defaultValue="0"
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white focus:ring-2 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all rounded-lg text-center font-bold text-slate-800"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 px-2 justify-end">
            <button
              type="button"
              onClick={() => setIsBkashModalOpen(false)}
              className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setIsBkashModalOpen(false)}
              className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </Drawer>

      {/* Upload File Drawer */}
      <Drawer
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload File"
        width="5xl"
        noPadding={true}
      >
        <div className="flex flex-col h-full bg-[#f4f7f9] p-8 space-y-10 pb-20 overflow-y-auto custom-scrollbar">
          {/* Upload Section */}
          <div className="space-y-4 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Upload CSV file with valid data
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <div className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between group focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500 transition-all">
                  <input
                    type="file"
                    className="text-sm text-slate-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer w-full outline-none"
                  />
                </div>
                <button className="px-8 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 shrink-0">
                  Upload
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-slate-800">Previous File</span>
              <button className="text-primary-600 font-medium hover:underline">
                Click Here
              </button>
              <span className="text-slate-600">to Download</span>
            </div>
          </div>

          <div className="h-[1px] bg-slate-200/60" />

          {/* Preview Table Section */}
          <div className="space-y-4 animate-in fade-in duration-700 delay-150">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Campaign Store Request List
              </h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:text-[10px] [&>th]:font-bold [&>th]:text-slate-500 [&>th]:uppercase [&>th]:tracking-wider [&>th]:border-b [&>th]:border-slate-100 [&>th]:leading-tight">
                      <th>Merchant</th>
                      <th>Brand</th>
                      <th>Store ID</th>
                      <th>KAM</th>
                      <th>Category</th>
                      <th>URL</th>
                      <th className="text-center">Discount %</th>
                      <th className="text-center">Consumed</th>
                      <th className="text-center">Shared</th>
                      <th className="text-center">Min Order</th>
                      <th className="text-center">Max Discount</th>
                      <th className="text-center">Max Card</th>
                      <th className="text-center">Max Amt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      {
                        merchant: "Sandbox Live Test",
                        brand: "NEWDEMOTEST",
                        storeId: "newdemotestlive",
                        kam: "susanta.kam",
                        category: "Corporate | Furniture",
                        url: "demo.sslwireless.com",
                        disc: 10,
                        consumed: "yes",
                        shared: 0,
                        min: 10,
                        max: 10,
                        maxCard: 0,
                        maxAmt: 10,
                      },
                      {
                        merchant: "GPE Care Demo",
                        brand: "GPECARE",
                        storeId: "gpecarelive01",
                        kam: "kam.demo",
                        category: "Healthcare | Services",
                        url: "care.gpe.com.bd",
                        disc: 15,
                        consumed: "no",
                        shared: 1,
                        min: 50,
                        max: 500,
                        maxCard: 2,
                        maxAmt: 1000,
                      },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-3 py-3 text-xs text-slate-900 font-bold whitespace-nowrap">
                          {row.merchant}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">
                          {row.brand}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">
                          {row.storeId}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">
                          {row.kam}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500 italic whitespace-nowrap">
                          {row.category}
                        </td>
                        <td className="px-3 py-3 text-xs text-primary-600 font-medium whitespace-nowrap">
                          {row.url}
                        </td>
                        <td className="px-3 py-3 text-xs text-center text-slate-900 font-bold">
                          {row.disc}
                        </td>
                        <td className="px-3 py-3 text-xs text-center">
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter shadow-sm",
                              row.consumed === "yes"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-rose-100 text-rose-700 border border-rose-200",
                            )}
                          >
                            {row.consumed}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-center text-slate-600 font-medium">
                          {row.shared}
                        </td>
                        <td className="px-3 py-3 text-xs text-center text-slate-900 font-bold">
                          {row.min.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-xs text-center text-slate-900 font-bold">
                          {row.max.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-xs text-center text-slate-600 font-medium">
                          {row.maxCard}
                        </td>
                        <td className="px-3 py-3 text-xs text-center text-slate-900 font-bold">
                          {row.maxAmt.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 px-2">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-full shadow-sm transition-all active:scale-95"
            >
              Confirm Upload
            </button>
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

const SummaryDetailPairRow = ({
  left,
  right,
}: {
  left: {
    label: string;
    value?: string;
    badge?: React.ReactNode;
    valueClassName?: string;
  };
  right: {
    label: string;
    value?: string;
    badge?: React.ReactNode;
    valueClassName?: string;
  };
}) => {
  const renderField = (field: {
    label: string;
    value?: string;
    badge?: React.ReactNode;
    valueClassName?: string;
  }) => (
    <div className="flex flex-col sm:flex-row py-2 sm:py-0 sm:items-center text-sm min-w-0">
      <span className="w-full sm:w-[140px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] shrink-0 py-1.5">
        {field.label}
      </span>
      <div
        className={clsx(
          "w-full sm:flex-1 text-slate-900 leading-snug break-words text-left py-0.5",
          field.valueClassName,
        )}
      >
        {field.badge ? field.badge : field.value || "Not Available"}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-2 text-sm">
      {renderField(left)}
      {renderField(right)}
    </div>
  );
};

const SummaryDetailRow = ({
  label,
  value,
  isBold,
  multiline,
  badge,
  valueClassName,
}: {
  label: string;
  value?: string;
  isBold?: boolean;
  multiline?: boolean;
  badge?: React.ReactNode;
  valueClassName?: string;
}) => (
  <div
    className={clsx(
      "flex flex-col sm:flex-row py-2 text-sm",
      multiline ? "sm:items-start items-start" : "sm:items-center",
    )}
  >
    <span
      className={clsx(
        "w-full text-slate-500 font-semibold uppercase tracking-tight text-[11px] shrink-0",
        multiline ? "sm:w-[140px] py-1.5" : "sm:w-[240px]",
      )}
    >
      {label}
    </span>
    <div
      className={clsx(
        "w-full sm:flex-1 text-slate-900 break-words text-left",
        multiline ? "py-0.5 leading-relaxed" : "leading-snug",
        isBold && "font-bold tracking-tight",
        valueClassName,
      )}
    >
      {badge ? badge : value || "Not Available"}
    </div>
  </div>
);

const CampaignViewStatusBadge = ({ status }: { status?: string }) => {
  if (status === "Pending" || status === "Created") {
    return (
      <span className="px-3 py-0.5 bg-[#007cc2] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
        {status}
      </span>
    );
  }

  if (status === "Closed") {
    return (
      <span className="px-3 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
        {status}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        STATUS_BADGE_CLASS,
        getMerchantCampaignListStatusClass(status || ""),
      )}
    >
      {status}
    </span>
  );
};

const ReadOnlyPartnerList = ({
  title,
  items,
  columns = 1,
}: {
  title: string;
  items: string[];
  columns?: 1 | 2 | 3 | 4;
}) => (
  <div>
    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
      {title}
    </h3>
    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
      {items.length === 0 ? (
        <p className="px-2 py-3 text-xs text-slate-400 font-medium italic text-center">
          No items selected
        </p>
      ) : (
        <ol
          className={clsx(
            "gap-1.5",
            columns === 1 && "space-y-1.5",
            columns === 2 && "grid grid-cols-1 sm:grid-cols-2",
            columns === 3 && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            columns === 4 && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {items.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[11px] uppercase tracking-tight text-slate-700 font-medium leading-tight"
            >
              <span className="text-slate-500 font-bold shrink-0">
                {index + 1}.
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  </div>
);

const CampaignBanner = ({
  campaign,
  className,
  embedded = false,
}: {
  campaign: MerchantCampaignEntry | null;
  className?: string;
  embedded?: boolean;
}) => {
  const bannerUrl =
    campaign?.banner && campaign.banner !== "N/A" ? campaign.banner : null;

  return (
    <div
      className={clsx(
        "w-full overflow-hidden bg-slate-50/50",
        !embedded && "rounded-lg border border-slate-200",
        embedded && "border-b border-slate-100",
        className,
      )}
    >
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt="Campaign Banner"
          className="w-full h-auto block max-w-full"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-10">
          <ImageIcon className="w-8 h-8" />
          <span className="text-xs font-semibold">Banner</span>
        </div>
      )}
    </div>
  );
};

const CampaignSummaryFields = ({
  campaign,
  defaultDescription = "Amet dolor exercita",
  embedded = false,
}: {
  campaign: MerchantCampaignEntry | null;
  defaultDescription?: string;
  embedded?: boolean;
}) => {
  const description = campaign
    ? CAMPAIGN_VIEW_DESCRIPTIONS[campaign.id] || defaultDescription
    : "";

  const fields = (
    <div className="px-4 py-1 divide-y divide-slate-100">
      <SummaryDetailPairRow
        left={{
          label: "Duration",
          value: `${campaign?.startDate} to ${campaign?.endDate}`,
        }}
        right={{
          label: "Merchant confirmation expire",
          value: campaign?.confirmationExpire,
        }}
      />
      <SummaryDetailPairRow
        left={{
          label: "Merchant can onboard now",
          value: campaign?.canOnboard === "Yes" ? "Yes" : "No",
        }}
        right={{
          label: "Status",
          badge: <CampaignViewStatusBadge status={campaign?.status} />,
        }}
      />
      <SummaryDetailRow label="Description" value={description} multiline />
    </div>
  );

  if (embedded) {
    return fields;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {fields}
    </div>
  );
};

const CampaignDetailsTabPanel = ({
  campaign,
  defaultDescription,
  children,
}: {
  campaign: MerchantCampaignEntry | null;
  defaultDescription?: string;
  children?: React.ReactNode;
}) => (
  <div className="space-y-8">
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <CampaignBanner campaign={campaign} embedded />
      <CampaignSummaryFields
        campaign={campaign}
        defaultDescription={defaultDescription}
        embedded
      />
    </div>
    {children}
  </div>
);

const CampaignPartnerListsSection = ({
  campaign,
}: {
  campaign: MerchantCampaignEntry | null;
}) => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-4 py-4 space-y-6">
      <ReadOnlyPartnerList
        title="Bank List"
        items={campaign?.selectedBanks || []}
        columns={3}
      />
      <ReadOnlyPartnerList
        title="Internet Bank List"
        items={campaign?.selectedInternetBanks || []}
      />
      <ReadOnlyPartnerList
        title="MFS List"
        items={campaign?.selectedMfs || []}
      />
    </div>
  </div>
);

const PendingCreatedCampaignDetails = ({
  campaign,
  onStopParticipation,
}: {
  campaign: MerchantCampaignEntry | null;
  onStopParticipation: () => void;
}) => {
  return (
    <CampaignViewDetailsTabs
      storeRequestContent={
        <CampaignStoreRequestSection
          rows={[]}
          singleSectorOnly
          title="Merchant List"
          emptyMessage="No merchant onboard!"
          headerActions={
            campaign?.canOnboard === "Yes" ? (
              <button
                type="button"
                onClick={onStopParticipation}
                className="flex items-center gap-2 px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all tracking-wide active:scale-95"
              >
                Stop Merchant Participation
              </button>
            ) : undefined
          }
        />
      }
      detailsContent={
        <CampaignDetailsTabPanel campaign={campaign}>
          <CampaignPartnerListsSection campaign={campaign} />
        </CampaignDetailsTabPanel>
      }
    />
  );
};

const ClosedCampaignDetails = ({
  campaign,
  onManageRoad,
}: {
  campaign: MerchantCampaignEntry | null;
  onManageRoad: () => void;
}) => {
  return (
    <CampaignViewDetailsTabs
      storeRequestContent={
        <CampaignStoreRequestSection
          rows={CLOSED_CAMPAIGN_STORE_REQUESTS}
          singleSectorOnly
          title="Merchant List"
          headerActions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => downloadCampaignStoreCsv(campaign?.trackingId)}
                className="flex items-center gap-2 px-5 py-1.5 bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-primary-600 hover:border-primary-200 rounded-lg shadow-sm transition-all tracking-wide active:scale-95"
              >
                Download
              </button>
              <button
                type="button"
                onClick={onManageRoad}
                className="flex items-center gap-2 px-5 py-1.5 bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-primary-600 hover:border-primary-200 rounded-lg shadow-sm transition-all tracking-wide active:scale-95"
              >
                Manage bKash
              </button>
            </div>
          }
        />
      }
      detailsContent={
        <CampaignDetailsTabPanel
          campaign={campaign}
          defaultDescription="Voluptatem modi et"
        >
          <CampaignPartnerListsSection campaign={campaign} />
        </CampaignDetailsTabPanel>
      }
    />
  );
};
