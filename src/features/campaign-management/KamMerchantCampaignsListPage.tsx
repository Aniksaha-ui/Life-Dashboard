import { useState, useMemo, useEffect } from "react";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";
import { Calendar, Image as ImageIcon, FileText } from "lucide-react";
import { DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import { MetricCard } from "../../components/MetricCard";
import { Drawer } from "../../components/Drawer";
import type { ColumnDef } from "@tanstack/react-table";
import { SectorsCell } from "./components/SectorsCell";
import { STATUS_BADGE_CLASS } from "./utils/statusBadge";
import { ActionIconButton } from "./components/ActionIconButton";
import {
  getPortalDrawerTitle,
  PortalResellerActionButtons,
  PortalResellerActionForm,
  type PortalDrawerView,
} from "../resellers/components/PortalResellerDrawerActions";

interface StoreDiscountRow {
  id: string;
  storeId: string;
  storeName: string;
  discountPercent: string;
  isFullyBurned: string;
  minOrderAmount: string;
  maxDiscountPerTxn: string;
  maxDiscountPerCard: string;
  recurrentDiscountLimitPerUser: string;
}

const MOCK_STORE_DISCOUNT_ROWS: StoreDiscountRow[] = [
  {
    id: "1",
    storeId: "599",
    storeName: "bannertestlive",
    discountPercent: "20",
    isFullyBurned: "yes",
    minOrderAmount: "2000",
    maxDiscountPerTxn: "10000",
    maxDiscountPerCard: "5",
    recurrentDiscountLimitPerUser: "10",
  },
  {
    id: "2",
    storeId: "1266",
    storeName: "bookingdemotestlive",
    discountPercent: "20",
    isFullyBurned: "yes",
    minOrderAmount: "20",
    maxDiscountPerTxn: "30",
    maxDiscountPerCard: "30",
    recurrentDiscountLimitPerUser: "30",
  },
];

export interface KamMerchantCampaignItem {
  id: string;
  campaign: string;
  trackingId: string;
  startDate: string;
  endDate: string;
  cardBin: string;
  bankPartner: string;
  status: "Created" | "KAM Approved" | "Closed";
  sectors: string;
  confirmationExpire: string;
  canOnboard: "Yes" | "No";
  banner: string;
}

const CAMPAIGN_BANNER_1 =
  "https://campaign.sslcommerz.com/fifa_26/images/Landing-page-Banner.png";
const CAMPAIGN_BANNER_2 =
  "https://campaign.sslcommerz.com/summer_26/images/Landing-page-Banner.png";

const MOCK_KAM_MERCHANT_CAMPAIGNS: KamMerchantCampaignItem[] = [
  {
    id: "1",
    campaign: "Test Campaign Offer",
    trackingId: "WJ67FI14122025170107",
    startDate: "17-Dec-25",
    endDate: "21-Mar-26",
    cardBin: "",
    bankPartner: "SSL Commerz",
    status: "Created",
    sectors: "Airlines, Marketplace, ITES",
    confirmationExpire: "17-Dec-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
  {
    id: "2",
    campaign: "a sample campaign",
    trackingId: "HOSKQN09112025163414",
    startDate: "17-Nov-25",
    endDate: "17-Nov-25",
    cardBin: "888888",
    bankPartner: "Merchant",
    status: "KAM Approved",
    sectors: "VOD/OTT Platform, Construction Goods",
    confirmationExpire: "17-Nov-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
  },
  {
    id: "3",
    campaign: "A Demo Campaign",
    trackingId: "JDBSKI12072025160017",
    startDate: "16-Jul-25",
    endDate: "16-Jul-25",
    cardBin: "452424,334324",
    bankPartner: "Merchant",
    status: "KAM Approved",
    sectors: "Service, Tourism, Diagnostics & Treatment, VTS",
    confirmationExpire: "16-Jul-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
  {
    id: "4",
    campaign: "Test Campaign #42",
    trackingId: "IDLYBV13042025283908",
    startDate: "04-Aug-24",
    endDate: "05-Aug-24",
    cardBin: "1933touhid,4999",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Professional Service, DC Office, F Commerce-Lifestyle",
    confirmationExpire: "04-Aug-24",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
  },
  {
    id: "5",
    campaign: "SalasMan",
    trackingId: "EOSFBY13042025280832",
    startDate: "27-Apr-25",
    endDate: "29-Apr-25",
    cardBin: "234234,234234,556556",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Autonomous Body, Ministry of Information and Broadcasting",
    confirmationExpire: "27-Apr-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
  {
    id: "6",
    campaign: "SalasMan",
    trackingId: "SLNNMQ10042025285517",
    startDate: "27-Apr-25",
    endDate: "01-May-25",
    cardBin: "654323",
    bankPartner: "SSL Commerz",
    status: "Created",
    sectors: "Business Service, Association, Lodging/Hotel/Motel",
    confirmationExpire: "27-Apr-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
  },
  {
    id: "7",
    campaign: "demo camp v2",
    trackingId: "IKIKJY10042025284750",
    startDate: "29-Apr-25",
    endDate: "30-May-25",
    cardBin: "456565,657578",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Subscription, Tele-Medicine, Transportation",
    confirmationExpire: "29-Apr-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
  {
    id: "8",
    campaign: "Merchant Initiate campaign - test 2",
    trackingId: "QERF3F16042025275622",
    startDate: "28-Apr-25",
    endDate: "29-Apr-25",
    cardBin: "384294,323423,842342",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Travel Agencies and Tour Operators, Utility services",
    confirmationExpire: "28-Apr-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
  },
  {
    id: "9",
    campaign: "Merchant initiate campaign (merchant) - 27 april",
    trackingId: "C1U4ZC13042025271050",
    startDate: "30-Apr-25",
    endDate: "09-May-25",
    cardBin: "823091,832012,381903",
    bankPartner: "Merchant",
    status: "KAM Approved",
    sectors: "Retail Outlet Services, College, ITES",
    confirmationExpire: "30-Apr-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
  {
    id: "10",
    campaign: "Bank Initiate Campaign (SSL)- 27 april",
    trackingId: "XXNPEP13042025270729",
    startDate: "29-Apr-25",
    endDate: "08-May-25",
    cardBin: "",
    bankPartner: "SSL Commerz",
    status: "Closed",
    sectors: "Airlines, Marketplace",
    confirmationExpire: "29-Apr-25",
    canOnboard: "No",
    banner: CAMPAIGN_BANNER_2,
  },
  {
    id: "11",
    campaign: "ami 101",
    trackingId: "0A5PQM10032025043451",
    startDate: "10-Mar-25",
    endDate: "30-Mar-25",
    cardBin: "498275,984254",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Service, Tourism",
    confirmationExpire: "10-Mar-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
  {
    id: "12",
    campaign: "sample campaign v2 101",
    trackingId: "HBO8U415022025165027",
    startDate: "14-Feb-25",
    endDate: "28-Feb-25",
    cardBin: "432432",
    bankPartner: "SSL Commerz",
    status: "Created",
    sectors: "Professional Service, DC Office",
    confirmationExpire: "14-Feb-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
  },
  {
    id: "13",
    campaign: "SalasMan",
    trackingId: "KADMO115022025165027",
    startDate: "27-Apr-25",
    endDate: "01-May-25",
    cardBin: "654323",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Autonomous Body, Ministry of Information",
    confirmationExpire: "27-Apr-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
  {
    id: "14",
    campaign: "sample campaign v2 101",
    trackingId: "C2ECPP15022025165023",
    startDate: "14-Feb-25",
    endDate: "28-Feb-25",
    cardBin: "432432",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Subscription, Tele-Medicine",
    confirmationExpire: "14-Feb-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
  },
  {
    id: "15",
    campaign: "sample campaign v2 101",
    trackingId: "05CKDS13022025163953",
    startDate: "14-Feb-25",
    endDate: "28-Feb-25",
    cardBin: "432432",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Travel Agencies and Tour Operators",
    confirmationExpire: "14-Feb-25",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
  },
];

const StackedField = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
      {label}
    </p>
    <div
      className={clsx(
        "text-xs text-slate-700 font-medium leading-snug break-words",
        valueClassName,
      )}
    >
      {value}
    </div>
  </div>
);

const storeDiscountColumns: ColumnDef<StoreDiscountRow>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => (
      <span className="text-xs text-slate-500 font-medium">
        {row.index + 1}
      </span>
    ),
    meta: {
      shrinkToContent: true,
      headerClassName: "w-px max-w-min !px-3 text-center whitespace-nowrap",
      cellClassName:
        "w-px max-w-min !px-3 py-3 align-top text-center whitespace-nowrap",
    },
  },
  {
    id: "storeInfo",
    header: "Store Info",
    cell: ({ row }) => (
      <div className="flex flex-col gap-2 py-0.5">
        <StackedField
          label="Store Id"
          value={row.original.storeId}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField
          label="Store Name"
          value={row.original.storeName}
          valueClassName="text-slate-900 font-semibold"
        />
      </div>
    ),
    meta: { cellClassName: "px-3 py-3 align-top min-w-[150px]" },
  },
  {
    id: "discountInfo",
    header: "Discount Details",
    cell: ({ row }) => (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-0.5">
        <StackedField
          label="Discount %"
          value={row.original.discountPercent}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField
          label="Consumed by you"
          value={row.original.isFullyBurned}
          valueClassName="italic uppercase"
        />
        <StackedField
          label="Min order value"
          value={Number(row.original.minOrderAmount).toLocaleString()}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField
          label="Max discount/Trx"
          value={Number(row.original.maxDiscountPerTxn).toLocaleString()}
          valueClassName="text-slate-800 font-bold"
        />
        <StackedField
          label="Max Amt of Disc (Same Card)"
          value={Number(row.original.maxDiscountPerCard).toLocaleString()}
          valueClassName="text-slate-800 font-bold"
        />
        {row.original.recurrentDiscountLimitPerUser != null && (
          <StackedField
            label="Recurrent limit/user"
            value={Number(
              row.original.recurrentDiscountLimitPerUser,
            ).toLocaleString()}
            valueClassName="text-slate-800 font-bold"
          />
        )}
      </div>
    ),
    meta: { cellClassName: "px-3 py-3 align-top min-w-[220px]" },
  },
];

function MerchantCampaignDetailsModalContent({
  campaign,
  defaultTab = "campaign-details",
  view,
  onViewChange,
  onClose,
}: {
  campaign: KamMerchantCampaignItem;
  defaultTab?: string;
  view: PortalDrawerView;
  onViewChange: (v: PortalDrawerView) => void;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "campaign-details" | "store-discount"
  >(
    defaultTab === "participating" || defaultTab === "store-discount"
      ? "store-discount"
      : "campaign-details",
  );
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    setActiveTab(
      defaultTab === "participating" || defaultTab === "store-discount"
        ? "store-discount"
        : "campaign-details",
    );
  }, [defaultTab, campaign]);

  const tabs: { id: "campaign-details" | "store-discount"; label: string }[] = [
    { id: "campaign-details", label: "Campaign Details" },
    { id: "store-discount", label: "Store Discount Details" },
  ];

  if (view !== "details") {
    return (
      <div className="p-8">
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
          <div className="space-y-6 bg-white transition-all duration-300">
            <p className="text-lg font-bold text-slate-900">
              {view === "proceed"
                ? "Are you sure you want to accept the campaign?"
                : "Are you sure you want to reject the campaign?"}
            </p>

            {view === "cancel" && (
              <div className="w-full space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Remarks / Reason
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide a reason for rejection…"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[100px] resize-none placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setRemarks("");
                onViewChange("details");
              }}
              className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
            >
              Back to Details
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={view === "cancel" && !remarks.trim()}
                onClick={() => {
                  if (view === "proceed") {
                    toast.success(
                      "Store discount request accepted successfully.",
                    );
                  } else {
                    toast.success(
                      "Store discount request rejected successfully.",
                    );
                  }
                  onViewChange("details");
                  if (onClose) onClose();
                  setRemarks("");
                }}
                className={clsx(
                  "flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                  view === "proceed"
                    ? "bg-primary-600 hover:bg-primary-700"
                    : "bg-rose-500 hover:bg-rose-600",
                )}
              >
                {view === "proceed" ? "Confirm Accept" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto bg-[#f4f7f9] p-8 pb-8 space-y-6 custom-scrollbar">
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

        {activeTab === "campaign-details" && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="w-full overflow-hidden bg-slate-50/50 border-b border-slate-100">
              {campaign.banner && campaign.banner !== "N/A" ? (
                <img
                  src={campaign.banner}
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
                  {campaign.campaign}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                  Duration
                </dt>
                <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                  {campaign.startDate} to {campaign.endDate}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                  Merchant confirmation expire
                </dt>
                <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                  {campaign.confirmationExpire}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                  Merchant can onboard now
                </dt>
                <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                  {campaign.canOnboard}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm">
                <dt className="w-full sm:w-[240px] text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-1.5 shrink-0">
                  Sectors
                </dt>
                <dd className="w-full sm:flex-1 text-slate-900 leading-relaxed py-0.5">
                  <SectorsCell sectorsStr={campaign.sectors} />
                </dd>
              </div>
            </div>
          </div>
        )}

        {activeTab === "store-discount" && (
          <div className="flex flex-col space-y-4">
            <DataTable
              columns={storeDiscountColumns}
              data={MOCK_STORE_DISCOUNT_ROWS}
              hideToolbarDateFilter={true}
              hideViewColumn={true}
              allowHeaderWrap={true}
              noScrollX={true}
            />
          </div>
        )}
      </div>

      {activeTab === "store-discount" &&
        campaign.status !== "KAM Approved" &&
        campaign.status !== "Closed" && (
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 px-8 pb-6 bg-white shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                setRemarks("");
                onViewChange("cancel");
              }}
              className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => {
                setRemarks("");
                onViewChange("proceed");
              }}
              className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Accept
            </button>
          </div>
        )}
    </div>
  );
}

export default function KamMerchantCampaignsListPage() {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    trackingId: "",
    campaignName: "",
    startDate: "",
    endDate: "",
    status: "all",
  });

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);
  const [campaigns] = useState<KamMerchantCampaignItem[]>(
    MOCK_KAM_MERCHANT_CAMPAIGNS,
  );

  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<KamMerchantCampaignItem | null>(null);
  const [viewModalDefaultTab, setViewModalDefaultTab] =
    useState<string>("campaign-details");
  const [detailsView, setDetailsView] = useState<PortalDrawerView>("details");

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

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
      startDate: "",
      endDate: "",
      status: "all",
    };
    setLocalFilters(cleared);
    setAppliedFilters(cleared);
  };

  const isFiltersChanged = useMemo(() => {
    return JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);
  }, [localFilters, appliedFilters]);

  const filteredData = useMemo(() => {
    return campaigns.filter((item) => {
      if (
        appliedFilters.trackingId &&
        !item.trackingId
          .toLowerCase()
          .includes(appliedFilters.trackingId.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.campaignName &&
        !item.campaign
          .toLowerCase()
          .includes(appliedFilters.campaignName.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.startDate &&
        !item.startDate
          .toLowerCase()
          .includes(appliedFilters.startDate.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.endDate &&
        !item.endDate
          .toLowerCase()
          .includes(appliedFilters.endDate.toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.status &&
        appliedFilters.status !== "all" &&
        item.status !== appliedFilters.status
      ) {
        return false;
      }
      return true;
    });
  }, [campaigns, appliedFilters]);

  const metrics = useMemo(() => {
    return {
      total: campaigns.length,
      created: campaigns.filter((c) => c.status === "Created").length,
      approved: campaigns.filter((c) => c.status === "KAM Approved").length,
      closed: campaigns.filter((c) => c.status === "Closed").length,
    };
  }, [campaigns]);

  const openDetailsDrawer = (
    campaign: KamMerchantCampaignItem,
    tab: string = "campaign-details",
  ) => {
    setSelectedCampaign(campaign);
    setViewModalDefaultTab(tab);
    setDetailsView("details");
    setIsDetailsDrawerOpen(true);
  };

  const closeDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false);
    setSelectedCampaign(null);
    setDetailsView("details");
  };

  const columns: ColumnDef<KamMerchantCampaignItem>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.index + 1}</span>
      ),
      size: 40,
    },
    {
      accessorKey: "campaign",
      header: "Campaign",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => openDetailsDrawer(row.original)}
          className="flex flex-col gap-0.5 text-left hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-900 leading-tight">
            {row.original.campaign}
          </span>
          <span className="text-xs text-primary-600 font-medium whitespace-nowrap">
            ID: {row.original.trackingId}
          </span>
        </button>
      ),
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
      accessorKey: "cardBin",
      header: "Card BIN",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium break-words max-w-[160px] block">
          {row.original.cardBin || ""}
        </span>
      ),
    },
    {
      accessorKey: "bankPartner",
      header: "Choose Bank Partner",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium whitespace-nowrap">
          {row.original.bankPartner}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const getStatusClass = (status: string) => {
          switch (status) {
            case "Created":
              return "bg-slate-100 text-slate-500";
            case "KAM Approved":
              return "bg-emerald-50 text-emerald-600";
            case "Closed":
              return "bg-rose-50 text-rose-600";
            default:
              return "bg-slate-100 text-slate-500";
          }
        };
        return (
          <span
            className={clsx(
              STATUS_BADGE_CLASS,
              getStatusClass(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <ActionIconButton
          label="Details"
          tooltip="Details"
          icon={FileText}
          onClick={() => openDetailsDrawer(row.original)}
        />
      ),
    },
  ];

  const filterConfig = [
    {
      key: "startDate",
      label: "Campaign Start Date:",
      type: "date",
      icon: Calendar,
    },
    {
      key: "endDate",
      label: "Campaign End Date:",
      type: "date",
      icon: Calendar,
    },
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
      key: "status",
      label: "Campaign Status",
      type: "select",
      options: [
        { label: "Select", value: "all" },
        { label: "Created", value: "Created" },
        { label: "KAM Approved", value: "KAM Approved" },
        { label: "Closed", value: "Closed" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Kam Merchant Campaign List
          </h1>
          <p className="text-slate-500 text-sm tracking-tight mt-1">
            Manage and review KAM merchant campaigns
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
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
              title="Closed"
              value={metrics.closed.toString()}
              valueClassName="text-rose-600"
            />
          </div>
        </div>

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

      <Drawer
        open={isDetailsDrawerOpen}
        onClose={closeDetailsDrawer}
        title={getPortalDrawerTitle(detailsView, {
          details: (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">
                Campaign Details
              </span>
              <span className="text-xs font-medium text-slate-500">
                ID: {selectedCampaign?.trackingId}
              </span>
            </div>
          ),
          proceed: "Approve Store Discount Request",
          cancel: "Reject Store Discount Request",
        })}
        width="4xl"
        noPadding={true}
      >
        {selectedCampaign && (
          <MerchantCampaignDetailsModalContent
            key={`${selectedCampaign.id}-${viewModalDefaultTab}-${detailsView}`}
            campaign={selectedCampaign}
            defaultTab={viewModalDefaultTab}
            view={detailsView}
            onViewChange={setDetailsView}
            onClose={closeDetailsDrawer}
          />
        )}
      </Drawer>
    </div>
  );
}
