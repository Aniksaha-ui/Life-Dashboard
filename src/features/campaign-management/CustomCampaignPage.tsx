import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";
import {
  Calendar,
  Image as ImageIcon,
  Upload,
  X,
  Search,
  Check,
  ChevronDown,
  Mail,
  Pencil,
  Eye,
} from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { FilterBar } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import { DatePicker } from "../../components/DatePicker";
import type { ColumnDef } from "@tanstack/react-table";
import { STATUS_BADGE_CLASS } from "./utils/statusBadge";
import { SectorsCell } from "./components/SectorsCell";
import { getCampaignBannerByIndex } from "./utils/campaignBanners";
import { StoreCampaignViewTabs } from "./components/StoreCampaignViewTabs";
import { CAMPAIGN_SECTORS_LIST } from "./utils/sectors";
import { CampaignStoreRequestSection } from "./components/CampaignStoreRequestSection";
import type { CampaignStoreRequestRow } from "./types";
import { toDisplayCampaignDate, toIsoDateString } from "./utils/campaignDates";
import {
  ActionIconButton,
  ActionIconButtonGroup,
} from "./components/ActionIconButton";

// MultiSelect Dropdown Component (exact match with Campaign List page, powered by React Portal)
const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
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
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
        return;
      setIsOpen(false);
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
    <div
      className="col-span-1 md:col-span-2 lg:col-span-3 relative"
      ref={dropdownRef}
    >
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full min-h-[38px] px-3 py-1.5 text-sm bg-white border rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-all select-none",
          isOpen
            ? "border-primary-500 ring-2 ring-primary-500/20"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 py-0.5">
          {selected.length === 0 ? (
            <span className="text-slate-400 text-sm">
              Select {label.toLowerCase()}...
            </span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200 text-[11px] font-bold text-primary-700 hover:bg-primary-100 transition-colors shrink-0 cursor-pointer"
              >
                <span className="truncate max-w-[150px]">{item}</span>
                <X className="w-3 h-3 text-primary-500 hover:text-primary-700 shrink-0" />
              </span>
            ))
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
    </div>
  );
};

interface CustomCampaign {
  id: string;
  name: string;
  trackingId: string;
  sectors: string;
  startDate: string;
  endDate: string;
  banner: string;
  confirmationExpire: string;
  canOnboard: "Yes" | "No";
  status: "Created" | "KAM Approved" | "Closed" | "Pending";
  canEdit: boolean;
  selectedBanks?: string[];
  selectedInternetBanks?: string[];
  selectedMfs?: string[];
  logoLink?: string;
  faqLink?: string;
}

const BANGLADESH_BANKS_MOCK = [
  "AB Bank PLC",
  "AGRANI BANK LIMITED",
  "Al - Arafah Islami Bank PLC",
  "Bank Asia PLC",
  "BRAC Bank PLC",
  "City Bank PLC",
  "Dhaka Bank PLC",
  "Dutch Bangla Bank PLC",
  "Eastern Bank PLC",
  "EXIM Bank Limited",
  "HSBC",
  "Islami Bank Bangladesh Limited",
  "LankaBangla Finance PLC",
  "Mutual Trust Bank PLC",
  "NCC Bank PLC",
  "One Bank PLC",
  "Prime Bank PLC",
  "Pubali Bank PLC",
  "Standard Chartered Bank PLC",
  "United Commercial Bank PLC",
];

const MFS_LIST_MOCK = ["Bkash", "Upay", "Nagad", "Islamic Wallet"];
const INTERNET_BANK_LIST_MOCK = ["AB Direct"];

const CLOSED_VIEW_SELECTED_BANKS = BANGLADESH_BANKS_MOCK.filter(
  (_, idx) => idx % 2 === 0,
);
const RUNNING_VIEW_SELECTED_BANKS = [
  "AB Bank PLC",
  "NCC Bank PLC",
  "One Bank PLC",
];

function getCustomCampaignPartnerSelections(status?: string) {
  if (status === "Closed") {
    return {
      selectedBanks: CLOSED_VIEW_SELECTED_BANKS,
      selectedMfs: [...MFS_LIST_MOCK],
      selectedInternetBanks: [...INTERNET_BANK_LIST_MOCK],
    };
  }
  if (
    status === "Pending" ||
    status === "Created" ||
    status === "KAM Approved"
  ) {
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
}

const ReadOnlyPartnerList = ({
  title,
  items,
}: {
  title: string;
  items: string[];
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
        <ol className="space-y-1.5">
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

const CampaignPartnerListsSection = ({
  campaign,
}: {
  campaign: CustomCampaign | null;
}) => {
  const defaultPartners = getCustomCampaignPartnerSelections(campaign?.status);
  const selectedBanks =
    campaign?.selectedBanks || defaultPartners.selectedBanks;
  const selectedInternetBanks =
    campaign?.selectedInternetBanks || defaultPartners.selectedInternetBanks;
  const selectedMfs = campaign?.selectedMfs || defaultPartners.selectedMfs;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4 space-y-6">
        <ReadOnlyPartnerList title="Bank List" items={selectedBanks} />
        <ReadOnlyPartnerList
          title="Internet Bank List"
          items={selectedInternetBanks}
        />
        <ReadOnlyPartnerList title="MFS List" items={selectedMfs} />
      </div>
    </div>
  );
};

const CUSTOM_CAMPAIGNS_MOCK: CustomCampaign[] = [
  {
    id: "1",
    name: "Test Campaign - Description Issue",
    trackingId: "K4OH9P10042025285713",
    sectors: "N/A",
    startDate: "30-Apr-25",
    endDate: "09-May-25",
    banner: "N/A",
    confirmationExpire: "28-Apr-25",
    canOnboard: "Yes",
    status: "Created",
    canEdit: true,
  },
  {
    id: "2",
    name: "Campaign Bank with merchant - 27 april",
    trackingId: "CKOLPP16042025270018",
    sectors: "N/A",
    startDate: "30-Apr-25",
    endDate: "08-May-25",
    banner: getCampaignBannerByIndex(0),
    confirmationExpire: "28-Apr-25",
    canOnboard: "Yes",
    status: "KAM Approved",
    canEdit: false,
  },
  {
    id: "3",
    name: "Test Campaign - Bank Only(1)",
    trackingId: "FJT51K12042025275344",
    sectors:
      "Retail Outlet Services, Airlines, College, Tour Operator & Travel Agencies",
    startDate: "29-Apr-25",
    endDate: "08-May-25",
    banner: "N/A",
    confirmationExpire: "26-Apr-25",
    canOnboard: "No",
    status: "Closed",
    canEdit: false,
  },
  {
    id: "4",
    name: "Cus 101",
    trackingId: "KEQPFV10032025042605",
    sectors: "ISP, Events Management Services, ITES",
    startDate: "14-Mar-25",
    endDate: "26-Mar-25",
    banner: "N/A",
    confirmationExpire: "10-Mar-25",
    canOnboard: "No",
    status: "Pending",
    canEdit: true,
  },
  {
    id: "5",
    name: "Bank with offer and merchant - 25 feb",
    trackingId: "PM0N9O11022025252011",
    sectors: "N/A",
    startDate: "25-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "22-Feb-25",
    canOnboard: "Yes",
    status: "Created",
    canEdit: true,
  },
  {
    id: "6",
    name: "Bank with offer -25 feb",
    trackingId: "R4CH5J11022025251853",
    sectors: "Marketplace, VOD/OTT Platform, Education",
    startDate: "25-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "19-Feb-25",
    canOnboard: "Yes",
    status: "Pending",
    canEdit: true,
  },
  {
    id: "7",
    name: "Bank with merchant - 25 feb",
    trackingId: "G2IVPU11022025251752",
    sectors: "N/A",
    startDate: "25-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "12-Feb-25",
    canOnboard: "Yes",
    status: "Created",
    canEdit: true,
  },
  {
    id: "8",
    name: "Bank Only -25 feb",
    trackingId: "WYVIXB11022025251626",
    sectors: "Automobile, Diagnostics & Treatment, VTS",
    startDate: "25-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "20-Feb-25",
    canOnboard: "Yes",
    status: "Created",
    canEdit: true,
  },
  {
    id: "9",
    name: "Bank with offer and merchant",
    trackingId: "7GFVQJ15022025165419",
    sectors: "N/A",
    startDate: "16-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "10-Feb-25",
    canOnboard: "Yes",
    status: "KAM Approved",
    canEdit: false,
  },
  {
    id: "10",
    name: "Bank with merchant",
    trackingId: "EB2FXZ15022025163840",
    sectors: "N/A",
    startDate: "16-Feb-25",
    endDate: "01-Mar-25",
    banner: "N/A",
    confirmationExpire: "03-Feb-25",
    canOnboard: "Yes",
    status: "KAM Approved",
    canEdit: false,
  },
];

function getCustomCampaignStatusClass(status: string): string {
  switch (status) {
    case "Created":
      return "bg-slate-100 text-slate-500";
    case "KAM Approved":
      return "bg-blue-50 text-blue-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Closed":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

const CUSTOM_CAMPAIGN_STORE_REQUESTS: CampaignStoreRequestRow[] = [
  {
    merchant: "demotest",
    brand: "Sandbox Live Test",
    storeId: "bannertestlive",
    kam: "SSL KAM",
    category: "E-commerce",
    url: "demo.sslwireless.com",
    disc: 10,
    consumed: "yes",
    shared: 10,
    min: 10,
    max: 10,
    maxAmt: 10,
    recurrentLimit: 10,
    sectors: "E-commerce",
    remarks: "",
  },
  {
    merchant: "gpecare",
    brand: "GPE Care Live",
    storeId: "gpecarelive01",
    kam: "SSL KAM",
    category: "Healthcare",
    url: "care.gpe.com.bd",
    disc: 15,
    consumed: "no",
    shared: 15,
    min: 50,
    max: 500,
    maxAmt: 20,
    recurrentLimit: 20,
    sectors: "Healthcare",
    remarks: "",
  },
];

const downloadCustomCampaignStoreCsv = (trackingId?: string) => {
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
  CUSTOM_CAMPAIGN_STORE_REQUESTS.forEach((row) => {
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
    `custom_campaign_stores_${trackingId || "export"}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("CSV download started.");
};

// Custom View Modal Tabs specifically for Custom Campaign Page (removes Participating, Invited, Rejected tabs & implements new tab from shared screenshot)
const CustomCampaignViewModalTabs = ({
  detailsContent,
  defaultTab = "campaign-details",
  campaign,
}: {
  detailsContent: React.ReactNode;
  defaultTab?: string;
  campaign?: CustomCampaign | null;
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab === "campaign-details"
      ? "campaign-details"
      : "campaign-store-request-list",
  );
  const [isStopParticipationDrawerOpen, setIsStopParticipationDrawerOpen] =
    useState(false);
  const [isStoppingParticipation, setIsStoppingParticipation] = useState(false);

  const tabs = [
    { id: "campaign-details", label: "Campaign Details" },
    { id: "campaign-store-request-list", label: "Campaign Store Request List" },
  ];

  const handleStopParticipationConfirm = async () => {
    setIsStoppingParticipation(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsStopParticipationDrawerOpen(false);
      toast.success("Merchant participation stopped successfully.");
    } finally {
      setIsStoppingParticipation(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-8 border-b border-slate-200 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "pb-2.5 pt-0 text-sm font-bold transition-all relative cursor-pointer",
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

      {activeTab === "campaign-details" ? (
        detailsContent
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Campaign Offer Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1 gap-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Campaign Offer
              </h3>
            </div>
            <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="h-10 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight text-left">
                      Offer Modality Percent
                    </th>
                    <th className="h-10 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight text-left">
                      Fully Consumed by Merchant
                    </th>
                    <th className="h-10 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight text-left">
                      Minimum order value
                    </th>
                    <th className="h-10 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight text-left">
                      Max discount/Trx
                    </th>
                    <th className="h-10 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight text-left">
                      Card Discount
                    </th>
                    <th className="h-10 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight text-left">
                      No. of discount avail
                    </th>
                    <th className="h-10 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight text-left">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="text-slate-700 px-3 py-2 align-middle text-xs font-medium">
                      10
                    </td>
                    <td className="text-slate-700 px-3 py-2 align-middle text-xs font-medium">
                      yes
                    </td>
                    <td className="text-slate-700 px-3 py-2 align-middle text-xs font-medium">
                      10
                    </td>
                    <td className="text-slate-700 px-3 py-2 align-middle text-xs font-medium">
                      10
                    </td>
                    <td className="text-slate-700 px-3 py-2 align-middle text-xs font-medium">
                      10
                    </td>
                    <td className="text-slate-700 px-3 py-2 align-middle text-xs font-medium">
                      10
                    </td>
                    <td className="text-slate-700 px-3 py-2 align-middle text-xs font-medium">
                      10
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Campaign Store Request List Section (Exact Campaign Store Request Section layout from Campaign List page view modal) */}
          <CampaignStoreRequestSection
            rows={CUSTOM_CAMPAIGN_STORE_REQUESTS}
            title="Campaign Store Request List"
            singleSectorOnly
            headerActions={
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    downloadCustomCampaignStoreCsv(campaign?.trackingId)
                  }
                  className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-primary-600 hover:border-primary-200 rounded-lg shadow-sm transition-all tracking-wide active:scale-95 cursor-pointer"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setIsStopParticipationDrawerOpen(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all tracking-wide active:scale-95 cursor-pointer"
                >
                  Stop Merchant Participation
                </button>
              </div>
            }
          />
        </div>
      )}

      {/* Stop Merchant Participation Confirmation Drawer/Modal (Exact clone of Kam Merchant Campaign List page) */}
      <Drawer
        open={isStopParticipationDrawerOpen}
        onClose={() => setIsStopParticipationDrawerOpen(false)}
        title="Stop Merchant Participation"
        width="4xl"
        noPadding={true}
      >
        <div className="flex flex-col h-full bg-[#f4f7f9] p-8 space-y-8 pb-20 overflow-y-auto custom-scrollbar">
          <div className="space-y-3 px-1 animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              Are you sure you want to stop merchant participation for this
              campaign?
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              N.B : Once you stop merchant participation this campaign, there is
              no going back!
            </p>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 px-2 justify-end">
            <button
              type="button"
              onClick={() => setIsStopParticipationDrawerOpen(false)}
              disabled={isStoppingParticipation}
              className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleStopParticipationConfirm}
              disabled={isStoppingParticipation}
              className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
    </div>
  );
};

export default function CustomCampaignPage() {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    trackingId: "",
    campaignName: "",
    date: { preset: "all", from: "", to: "" },
    canOnboard: "all",
    status: "all",
  });

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  const [selectedCampaign, setSelectedCampaign] =
    useState<CustomCampaign | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [viewModalDefaultTab, setViewModalDefaultTab] =
    useState<any>("campaign-details");
  const [sendMailStep, setSendMailStep] = useState<"idle" | "confirm">("idle");
  const [isSendingMail, setIsSendingMail] = useState(false);

  const handleSendMailConfirm = async () => {
    setIsSendingMail(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSendMailStep("idle");
      toast.success("Mail sent to bank successfully.");
    } finally {
      setIsSendingMail(false);
    }
  };

  // Edit Drawer
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  const [campaigns, setCampaigns] = useState<CustomCampaign[]>(
    CUSTOM_CAMPAIGNS_MOCK,
  );

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
      canOnboard: "all",
      status: "all",
    };
    setLocalFilters(cleared);
    setAppliedFilters(cleared);
  };

  const isFiltersChanged =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  const openCampaignView = (
    campaign: CustomCampaign,
    tab: any = "campaign-details",
  ) => {
    setSelectedCampaign(campaign);
    setViewModalDefaultTab(tab);
    setSendMailStep("idle");
    setIsDetailsDrawerOpen(true);
  };

  const closeCampaignView = () => {
    setIsDetailsDrawerOpen(false);
    setSelectedCampaign(null);
    setViewModalDefaultTab("campaign-details");
    setSendMailStep("idle");
  };

  const openEditDrawer = (campaign: CustomCampaign) => {
    const initialSectorsList =
      campaign.sectors && campaign.sectors !== "N/A"
        ? campaign.sectors.split(",").map((s) => s.trim())
        : [];
    setEditFormData({
      ...campaign,
      sectorsList: initialSectorsList,
      description: campaign.name
        ? `Custom campaign configuration and details for ${campaign.name}.`
        : "",
    });
    setIsEditDrawerOpen(true);
  };

  const closeEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setEditFormData({});
  };

  const handleSaveEdit = () => {
    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === editFormData.id
          ? {
              ...item,
              ...editFormData,
              sectors:
                Array.isArray(editFormData.sectorsList) &&
                editFormData.sectorsList.length > 0
                  ? editFormData.sectorsList.join(", ")
                  : "N/A",
            }
          : item,
      ),
    );
    toast.success("Campaign updated successfully");
    closeEditDrawer();
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
        item.name
          .toLowerCase()
          .includes(appliedFilters.campaignName.toLowerCase());
      const matchesOnboard =
        appliedFilters.canOnboard === "all" ||
        item.canOnboard === appliedFilters.canOnboard;
      const matchesStatus =
        appliedFilters.status === "all" ||
        item.status === appliedFilters.status;
      return matchesId && matchesName && matchesOnboard && matchesStatus;
    });
  }, [campaigns, appliedFilters]);

  const metrics = useMemo(() => {
    return {
      total: filteredData.length,
      created: filteredData.filter((d) => d.status === "Created").length,
      approved: filteredData.filter((d) => d.status === "KAM Approved").length,
      other: filteredData.filter(
        (d) => d.status === "Closed" || d.status === "Pending",
      ).length,
    };
  }, [filteredData]);

  const columns: ColumnDef<CustomCampaign>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.index + 1}</span>
      ),
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Campaign",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openCampaignView(row.original)}
          className="flex flex-col gap-0.5 text-left hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-900 leading-tight">
            {row.original.name}
          </span>
          <span className="text-xs text-primary-600 font-medium whitespace-nowrap">
            ID: {row.original.trackingId}
          </span>
        </button>
      ),
    },
    {
      accessorKey: "sectors",
      header: "Sectors",
      cell: ({ row }) => <SectorsCell sectorsStr={row.original.sectors} />,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
          {row.original.startDate}
        </span>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
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
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
          {row.original.confirmationExpire}
        </span>
      ),
    },
    {
      accessorKey: "canOnboard",
      header: "Can Onboard",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
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
            getCustomCampaignStatusClass(row.original.status),
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionIconButtonGroup>
          {row.original.canEdit && (
            <ActionIconButton
              label="Edit"
              tooltip="Edit"
              icon={Pencil}
              onClick={() => openEditDrawer(row.original)}
            />
          )}
          <ActionIconButton
            label="View"
            tooltip="View"
            icon={Eye}
            onClick={() => openCampaignView(row.original)}
          />
        </ActionIconButtonGroup>
      ),
    },
  ];

  const filterConfig = [
    { key: "date", label: "Campaign Date", type: "date-range", icon: Calendar },
    {
      key: "trackingId",
      label: "Campaign ID",
      type: "input",
      placeholder: "Campaign ID",
    },
    {
      key: "campaignName",
      label: "Campaign Name",
      type: "input",
      placeholder: "Campaign Name",
    },
    {
      key: "canOnboard",
      label: "Can Onboard",
      type: "select",
      options: [
        { label: "Select", value: "all" },
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
    },
    {
      key: "status",
      label: "Campaign Status",
      type: "select",
      options: [
        { label: "Select Status", value: "all" },
        { label: "Created", value: "Created" },
        { label: "KAM Approved", value: "KAM Approved" },
        { label: "Pending", value: "Pending" },
        { label: "Closed", value: "Closed" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Custom Campaign
          </h1>
          <p className="text-slate-500 text-sm tracking-tight mt-1">
            Manage and review custom campaigns
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filter Bar — identical pattern to BankCampaignStoreManagePage */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            config={filterConfig as any}
          />

          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={!isFiltersChanged}
            className={clsx(
              "flex items-center gap-2 px-6 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
              isFiltersChanged
                ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95 cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
            )}
          >
            Apply Filters
          </button>

          {Object.values(localFilters).some(
            (v) => v !== "all" && v !== "" && typeof v !== "object",
          ) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Metric Cards */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Campaigns"
              value={metrics.total.toString()}
            />
            <MetricCard title="Created" value={metrics.created.toString()} />
            <MetricCard
              title="KAM Approved"
              value={metrics.approved.toString()}
              valueClassName="text-emerald-600"
            />
            <MetricCard
              title="Closed / Pending"
              value={metrics.other.toString()}
              valueClassName="text-rose-600"
            />
          </div>
        </div>

        {/* DataTable */}
        <div className="pt-4 overflow-x-auto">
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
        onClose={closeCampaignView}
        title={
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {selectedCampaign?.name}
              </span>
              <span
                className={clsx(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  selectedCampaign?.status === "Closed"
                    ? "bg-rose-600 text-white"
                    : selectedCampaign?.status === "KAM Approved"
                      ? "bg-[#007cc2] text-white"
                      : selectedCampaign?.status === "Pending"
                        ? "bg-amber-500 text-white"
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
        {selectedCampaign && (
          <div className="bg-[#f4f7f9] p-8 pb-8 overflow-y-auto custom-scrollbar">
            <CustomCampaignViewModalTabs
              key={`${selectedCampaign.id}-${viewModalDefaultTab}`}
              defaultTab={
                typeof viewModalDefaultTab === "string"
                  ? viewModalDefaultTab
                  : "campaign-details"
              }
              campaign={selectedCampaign}
              detailsContent={
                <div className="space-y-8">
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="w-full overflow-hidden bg-slate-50/50 border-b border-slate-100">
                      {selectedCampaign.banner &&
                      selectedCampaign.banner !== "N/A" ? (
                        <img
                          src={selectedCampaign.banner}
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
                    <div className="px-4 py-1 divide-y divide-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                        <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                          Campaign Name
                        </dt>
                        <dd className="w-full sm:flex-1 text-slate-900 text-base font-bold leading-tight py-0.5">
                          {selectedCampaign.name}
                        </dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                        <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                          Duration
                        </dt>
                        <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                          {selectedCampaign.startDate} to{" "}
                          {selectedCampaign.endDate}
                        </dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                        <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                          Merchant confirmation expire
                        </dt>
                        <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                          {selectedCampaign.confirmationExpire}
                        </dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                        <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                          Merchant can onboard now
                        </dt>
                        <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                          {selectedCampaign.canOnboard}
                        </dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                        <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                          Sectors
                        </dt>
                        <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                          <SectorsCell sectorsStr={selectedCampaign.sectors} />
                        </dd>
                      </div>
                    </div>
                  </div>

                  {/* Bank List, Internet Bank List, MFS List and Logo/FAQ Link only for pending status */}
                  {selectedCampaign.status === "Pending" && (
                    <>
                      <CampaignPartnerListsSection
                        campaign={selectedCampaign}
                      />

                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-4 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Logo Link
                              </label>
                              <input
                                type="text"
                                defaultValue={selectedCampaign.logoLink || ""}
                                placeholder="Enter Logo Link"
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-[38px]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-2">
                                FAQ Link
                              </label>
                              <input
                                type="text"
                                defaultValue={selectedCampaign.faqLink || ""}
                                placeholder="Enter FAQ Link"
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-[38px]"
                              />
                            </div>
                          </div>
                          {sendMailStep === "idle" ? (
                            <div className="flex justify-center pt-2 pb-2">
                              <button
                                type="button"
                                onClick={() => setSendMailStep("confirm")}
                                className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                              >
                                Send Mail to Bank
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                Confirmation
                              </h3>
                              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                                  <Mail className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    Send mail confirmation
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Are you sure you want to send this campaign
                                    mail to the bank? This will notify the
                                    selected payment partners about the campaign
                                    details for{" "}
                                    <span className="font-semibold text-slate-700">
                                      {selectedCampaign.name}
                                    </span>
                                    .
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 pb-2">
                                <button
                                  type="button"
                                  onClick={handleSendMailConfirm}
                                  disabled={isSendingMail}
                                  className="px-8 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                  {isSendingMail && (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  )}
                                  {isSendingMail ? "Sending..." : "Send Mail"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSendMailStep("idle")}
                                  disabled={isSendingMail}
                                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              }
            />
          </div>
        )}
      </Drawer>

      {/* Edit Campaign Drawer - Exact match with Campaign List page edit modal UI/UX */}
      <Drawer
        open={isEditDrawerOpen}
        onClose={closeEditDrawer}
        title="Edit Campaign"
        width="4xl"
      >
        <div className="flex flex-col gap-6 pb-32">
          <div className="flex flex-col gap-10">
            {/* Card 1: Basic Configuration */}
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
                      value={editFormData?.name || ""}
                      placeholder="Enter campaign name"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-[38px]"
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <DatePicker
                    label="Start Date"
                    usePortal
                    value={toIsoDateString(editFormData?.startDate || "")}
                    onChange={(val) =>
                      setEditFormData((prev: any) => ({
                        ...prev,
                        startDate: toDisplayCampaignDate(val),
                      }))
                    }
                    placeholder="Select start date"
                  />

                  <DatePicker
                    label="End Date"
                    usePortal
                    value={toIsoDateString(editFormData?.endDate || "")}
                    onChange={(val) =>
                      setEditFormData((prev: any) => ({
                        ...prev,
                        endDate: toDisplayCampaignDate(val),
                      }))
                    }
                    placeholder="Select end date"
                  />

                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <MultiSelectDropdown
                      label="Sectors"
                      options={CAMPAIGN_SECTORS_LIST}
                      selected={editFormData?.sectorsList || []}
                      onChange={(list) =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          sectorsList: list,
                          sectors: list.join(", ") || "N/A",
                        }))
                      }
                    />
                  </div>

                  <DatePicker
                    label="Confirmation Expire"
                    usePortal
                    placement="up"
                    value={toIsoDateString(
                      editFormData?.confirmationExpire || "",
                    )}
                    onChange={(val) =>
                      setEditFormData((prev: any) => ({
                        ...prev,
                        confirmationExpire: toDisplayCampaignDate(val),
                      }))
                    }
                    placeholder="Select enrollment last date"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Can Onboard
                    </label>
                    <select
                      value={editFormData?.canOnboard || "Yes"}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          canOnboard: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-[38px] cursor-pointer"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData?.status || "Created"}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all h-[38px] cursor-pointer"
                    >
                      <option value="Created">Created</option>
                      <option value="KAM Approved">KAM Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Closed">Closed</option>
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
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setEditFormData((prev: any) => ({
                                ...prev,
                                banner: url,
                                bannerFileName: file.name,
                              }));
                            }
                            e.target.value = "";
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full px-3 py-2 bg-white border-2 border-dashed border-slate-200 group-hover:border-primary-400 group-hover:bg-primary-50/30 rounded-lg transition-all flex items-center gap-3 h-[38px]">
                          <div className="w-10 h-6 rounded border border-slate-200 bg-slate-100 group-hover:bg-primary-100 transition-all flex items-center justify-center overflow-hidden shrink-0">
                            {editFormData?.banner &&
                            editFormData?.banner !== "N/A" ? (
                              <img
                                src={editFormData.banner}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold truncate text-slate-500 group-hover:text-primary-500">
                              {editFormData?.bannerFileName ||
                                (editFormData?.banner &&
                                editFormData?.banner !== "N/A"
                                  ? "Banner Selected"
                                  : "Choose Banner File")}
                            </p>
                          </div>
                          {editFormData?.banner &&
                            editFormData?.banner !== "N/A" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditFormData((prev: any) => ({
                                    ...prev,
                                    banner: "N/A",
                                    bannerFileName: undefined,
                                  }));
                                }}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500 relative z-20 transition-colors cursor-pointer"
                                title="Remove banner"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                        </div>
                      </div>
                      {editFormData?.banner &&
                        editFormData?.banner !== "N/A" && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBanner(editFormData.banner)
                            }
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline shrink-0 cursor-pointer"
                          >
                            View
                          </button>
                        )}
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-400 italic">
                      Recommended size: 1200x400px (PNG/JPG)
                    </p>
                  </div>
                </div>

                {/* Campaign Description */}
                <div className="mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Campaign Description
                    </label>
                    <textarea
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[80px] resize-none"
                      placeholder="Provide a brief description of the campaign and its goals..."
                      value={editFormData?.description || ""}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions for Drawer */}
            <div className="flex items-center gap-3 mt-10 pt-6 border-t border-slate-100 px-2 justify-end">
              <button
                type="button"
                onClick={closeEditDrawer}
                className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
