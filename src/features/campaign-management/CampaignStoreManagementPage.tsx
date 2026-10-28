import { useState, useMemo, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Search,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  Mail,
  Store,
} from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { FilterBar } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import { CopyButton } from "../../components/CopyButton";
import type { ColumnDef } from "@tanstack/react-table";
import type { CampaignStoreEntry, CampaignStoreMetrics } from "./types";
import {
  STATUS_BADGE_CLASS,
  getCampaignStoreManagementStatusClass,
} from "./utils/statusBadge";
import { SectorsCell } from "./components/SectorsCell";
import { getCampaignBannerByIndex } from "./utils/campaignBanners";
import { StoreCampaignViewTabs } from "./components/StoreCampaignViewTabs";
import type { StoreCampaignViewTab } from "./components/StoreCampaignViewTabs";
import {
  ActionIconButton,
  ActionIconButtonGroup,
} from "./components/ActionIconButton";

// Mock Data for Main Table
const MOCK_DATA: CampaignStoreEntry[] = [
  {
    id: "1",
    campaign: "Test Campaign - 09-02-2025",
    trackingId: "I1NQV213022026235942",
    sectors:
      "Retail Outlet Services, Airlines, College, Tour Operator & Travel Agencies",
    startDate: "26-Feb-26",
    endDate: "28-Feb-26",
    banner: getCampaignBannerByIndex(0),
    confirmationExpire: "23-Feb-26",
    canOnboard: "No",
    status: "Closed",
    discounts: "View",
    action: "See Stores",
  },
  {
    id: "2",
    campaign: "Test Campaign - 09-02-2025",
    trackingId: "4H9RHS16022026093155",
    sectors: "Marketplace, Ministry of Foreign Affairs, ITES",
    startDate: "10-Feb-26",
    endDate: "11-Feb-26",
    banner: "N/A",
    confirmationExpire: "09-Feb-26",
    canOnboard: "No",
    status: "Closed",
    discounts: "View",
    action: "See Stores",
  },
  {
    id: "3",
    campaign: "Campaign 1",
    trackingId: "VTD82W15022026080515",
    sectors: "Charity/NGO/Volunteer Services, Distance Learning",
    startDate: "09-Feb-26",
    endDate: "10-Feb-26",
    banner: getCampaignBannerByIndex(1),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Created",
    discounts: "View",
    action: "Invite",
  },
  {
    id: "4",
    campaign: "Cecilia Wilder",
    trackingId: "DLULJX13022026080249",
    sectors:
      "ISP, Events Management Services, Ministry of Fisheries and Livestock",
    startDate: "11-Feb-26",
    endDate: "12-Feb-26",
    banner: getCampaignBannerByIndex(0),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Created",
    discounts: "View",
    action: "Invite",
  },
  {
    id: "5",
    campaign: "Piper Cherry",
    trackingId: "DWEKQ812022026085711",
    sectors: "VOD/OTT Platform, Construction Goods",
    startDate: "10-Feb-26",
    endDate: "11-Feb-26",
    banner: getCampaignBannerByIndex(1),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Created",
    discounts: "View",
    action: "Invite",
  },
  {
    id: "6",
    campaign: "Test Campaign - 09-02-2025",
    trackingId: "UXW3LE12022026083050",
    sectors: "Service, Tourism, Diagnostics & Treatment, VTS",
    startDate: "09-Feb-26",
    endDate: "09-Feb-26",
    banner: getCampaignBannerByIndex(0),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Created",
    discounts: "View",
    action: "Invite",
  },
  {
    id: "7",
    campaign: "Testing Banner",
    trackingId: "G7Q7MO12022026081308",
    sectors: "E-commerce",
    startDate: "09-Feb-26",
    endDate: "10-Feb-26",
    banner: getCampaignBannerByIndex(1),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Created",
    discounts: "View",
    action: "Invite",
  },
];

// Mock Data for Assign Stores
const ASSIGN_STORES_GROUPS: Record<
  string,
  { id: string; name: string; isEscrow?: boolean }[]
> = {
  demotest: [
    { id: "1", name: "bannertestlive" },
    { id: "2", name: "bookingdemotestlive" },
    { id: "3", name: "BPSPHostedCheckout" },
    { id: "4", name: "brachealthcare1live" },
    { id: "5", name: "demompgslive" },
    { id: "6", name: "demonewlive" },
    { id: "7", name: "demosslUllive" },
    { id: "8", name: "demotesdhkedulive" },
    { id: "9", name: "demotest", isEscrow: true },
    { id: "10", name: "demotest002live" },
    { id: "11", name: "demotest01live" },
    { id: "12", name: "demotest03live" },
    { id: "13", name: "demotestasdfive" },
    { id: "14", name: "demotestidlive" },
    { id: "15", name: "demotestnewlive" },
    { id: "16", name: "demotesttdr1live" },
    { id: "17", name: "demotesttdr2live" },
    { id: "18", name: "demotesttdr3live" },
    { id: "19", name: "demotesttdr4live" },
    { id: "20", name: "demotesttdr5live" },
    { id: "21", name: "demotesttdr6live" },
    { id: "22", name: "demotestdrlive" },
    { id: "23", name: "demotesttestlive" },
    { id: "24", name: "demotestUSDlive" },
    { id: "25", name: "demotestv6live" },
    { id: "26", name: "directpaylive" },
    { id: "27", name: "domaintestlive" },
    { id: "28", name: "HostedCheckout0livephy", isEscrow: true },
    { id: "29", name: "HostedCheckout0liveUSDlive" },
    { id: "30", name: "HostedCheckoutMTBL" },
    { id: "31", name: "HostedCheckoutMTBLUSD" },
    { id: "32", name: "LICDEVSTORElive" },
    { id: "33", name: "nagadlive" },
    { id: "34", name: "newdemotestlive" },
    { id: "35", name: "newteststorlive" },
    { id: "36", name: "OmniChannelMicroSitelive" },
    { id: "37", name: "testboxnewdoclive" },
    { id: "38", name: "testdemolive" },
    { id: "39", name: "testdocumentlive" },
    { id: "40", name: "testidlive" },
    { id: "41", name: "testschool01academy7live" },
    { id: "42", name: "teststorelive" },
    { id: "43", name: "uat2live" },
  ],
  kyctest1live: [{ id: "44", name: "KycTest1live" }],
  masudstore020live: [
    { id: "45", name: "AlamGeneralStore0live" },
    { id: "46", name: "MasudStore020live" },
    { id: "47", name: "MasudStore020livephy" },
  ],
  nazimfashion0live: [{ id: "48", name: "NAZIMFASHION0live" }],
  testsite3live: [{ id: "49", name: "testsite3live" }],
};

// Mock Data for Proposed Banks
const PROPOSED_BANKS_MOCK = [
  "AB BANK LIMITED",
  "BANK ASIA LIMITED",
  "BRAC BANK LIMITED",
  "CITY BANK LIMITED",
  "DUTCH-BANGLA BANK LIMITED",
  "EASTERN BANK LIMITED",
  "FIRST SECURITY ISLAMI BANK LTD",
  "IFIC BANK LIMITED",
  "ISLAMI BANK BANGLADESH LTD",
  "MUTUAL TRUST BANK LIMITED",
  "NATIONAL BANK LIMITED",
  "ONE BANK LIMITED",
  "PRIME BANK LIMITED",
  "SHAHJALAL ISLAMI BANK LTD",
  "SOCIAL ISLAMI BANK LIMITED",
  "SOUTHEAST BANK LIMITED",
  "STANDARD BANK LIMITED",
  "TRUST BANK LIMITED",
  "UNITED COMMERCIAL BANK LTD",
];

export default function CampaignStoreManagementPage() {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    trackingId: "",
    campaignName: "",
    status: "all",
    onboard: "all",
    date: { preset: "all", from: "", to: "" },
  });
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignStoreEntry | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [viewModalDefaultTab, setViewModalDefaultTab] =
    useState<StoreCampaignViewTab>("campaign-details");
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [isAssignReadOnly, setIsAssignReadOnly] = useState(false);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [assignActiveTab, setAssignActiveTab] = useState<
    "stores" | "banks" | "lookup"
  >("stores");
  const [selectedStores, setSelectedStores] = useState<string[]>([
    "1",
    "2",
    "3",
    "4",
  ]); // Mock initial selection

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      const matchesTracking =
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

      return matchesTracking && matchesName && matchesStatus && matchesOnboard;
    });
  }, [appliedFilters]);

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  const metrics: CampaignStoreMetrics = useMemo(() => {
    return {
      total: filteredData.length,
      created: filteredData.filter((d) => d.status === "Created").length,
      pending: filteredData.filter((d) => d.status === "Pending").length,
      closed: filteredData.filter((d) => d.status === "Closed").length,
    };
  }, [filteredData]);

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
      status: "all",
      onboard: "all",
      date: { preset: "all", from: "", to: "" },
    };
    setLocalFilters(cleared);
    setAppliedFilters(cleared);
  };

  const isFiltersChanged =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  const openCampaignView = (campaign: CampaignStoreEntry) => {
    setSelectedCampaign(campaign);
    setViewModalDefaultTab("campaign-details");
    setIsDetailsDrawerOpen(true);
  };

  const closeCampaignView = () => {
    setIsDetailsDrawerOpen(false);
    setSelectedCampaign(null);
    setViewModalDefaultTab("campaign-details");
  };

  const mainColumns: ColumnDef<CampaignStoreEntry>[] = [
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
          onClick={() => openCampaignView(row.original)}
          className="flex flex-col gap-0.5 text-left hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-900">
            {row.original.campaign}
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
            getCampaignStoreManagementStatusClass(row.original.status),
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
        const isSeeStores = row.original.action === "See Stores";
        return (
          <ActionIconButtonGroup>
            <ActionIconButton
              label="View"
              tooltip="View"
              icon={Eye}
              onClick={() => openCampaignView(row.original)}
            />
            <ActionIconButton
              label={isSeeStores ? "See Stores" : "Invite"}
              tooltip={isSeeStores ? "See Stores" : "Invite"}
              icon={isSeeStores ? Store : Mail}
              onClick={() => {
                setIsAssignReadOnly(isSeeStores);
                setAssignActiveTab("stores");
                setIsAssignDrawerOpen(true);
              }}
            />
          </ActionIconButtonGroup>
        );
      },
    },
  ];

  const storeGroups = useMemo(() => {
    const groups: Record<
      string,
      { id: string; name: string; isEscrow?: boolean }[]
    > = {};

    Object.entries(ASSIGN_STORES_GROUPS).forEach(([group, stores]) => {
      const filtered = stores.filter(
        (store) =>
          !assignSearchQuery ||
          store.name.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
          selectedStores.includes(store.id),
      );

      if (filtered.length > 0) {
        groups[group] = filtered;
      }
    });

    return groups;
  }, [assignSearchQuery, selectedStores]);

  const toggleStore = (id: string) => {
    if (isAssignReadOnly) return;
    setSelectedStores((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleMerchantSelect = (
    merchantStores: { id: string }[],
    selectAll: boolean,
  ) => {
    const merchantStoreIds = merchantStores.map((store) => store.id);
    setSelectedStores((prev) => {
      if (selectAll) {
        return [...new Set([...prev, ...merchantStoreIds])];
      }
      return prev.filter((id) => !merchantStoreIds.includes(id));
    });
  };

  const areAllMerchantStoresSelected = (merchantStores: { id: string }[]) =>
    merchantStores.length > 0 &&
    merchantStores.every((store) => selectedStores.includes(store.id));

  const closeAssignDrawer = () => {
    setIsAssignDrawerOpen(false);
  };

  const handleConfirmOnboarding = () => {
    closeAssignDrawer();
    toast.success("Campaign store assigned successfully");
  };

  const handleBulkAssignSuccess = () => {
    toast.success("Campaign store assigned successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Campaign Store Management
          </h1>
          <p className="text-slate-500 text-sm tracking-tight">
            Configure and manage campaign tracking and onboarding.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
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
            <MetricCard title="Pending" value={metrics.pending.toString()} />
            <MetricCard
              title="Closed"
              value={metrics.closed.toString()}
              valueClassName="text-rose-600"
            />
          </div>
        </div>

        <div className="pt-4 overflow-x-auto">
          <DataTable
            columns={mainColumns}
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

      {/* Campaign View Drawer */}
      <Drawer
        open={isDetailsDrawerOpen}
        onClose={closeCampaignView}
        title={
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {selectedCampaign?.campaign}
              </span>
              <span
                className={clsx(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  selectedCampaign?.status === "Pending" ||
                    selectedCampaign?.status === "Created"
                    ? "bg-[#007cc2] text-white"
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
        {selectedCampaign && (
          <div className="bg-[#f4f7f9] p-8 pb-8 overflow-y-auto custom-scrollbar">
            <StoreCampaignViewTabs
              key={`${selectedCampaign.id}-${viewModalDefaultTab}`}
              defaultTab={viewModalDefaultTab}
              detailsContent={
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
                        {selectedCampaign.campaign}
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
              }
            />
          </div>
        )}
      </Drawer>

      {/* Invite Store Drawer */}
      <Drawer
        open={isAssignDrawerOpen}
        onClose={closeAssignDrawer}
        title={isAssignReadOnly ? "Campaign invited Store" : "Invite Store"}
        width="5xl"
        noPadding={true}
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-y-auto bg-[#f4f7f9] p-8 space-y-8 custom-scrollbar">
            <div className="space-y-5">
              {!isAssignReadOnly && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden shrink-0">
                  <div className="px-4 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider shrink-0">
                      Invite Store (Bulk)
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBulkAssignSuccess}
                        className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        Enable all merchants
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkAssignSuccess}
                        className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        Enable all merchants Except ESCROW
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-8 border-b border-slate-200 px-1">
                  {[
                    { id: "stores" as const, label: "Merchants" },
                    { id: "banks" as const, label: "Proposed Banks" },
                    { id: "lookup" as const, label: "Merchant Lookup" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAssignActiveTab(tab.id)}
                      className={clsx(
                        "pb-3 pt-0 text-sm font-bold transition-all relative cursor-pointer",
                        assignActiveTab === tab.id
                          ? "text-primary-600"
                          : "text-slate-400 hover:text-slate-600",
                      )}
                    >
                      {tab.label}
                      {assignActiveTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {assignActiveTab === "stores" && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-4 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Merchants ({Object.keys(storeGroups).length})
                          </h2>
                        </div>
                        <div className="relative w-full sm:w-80 group">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary-500" />
                          <input
                            type="text"
                            value={assignSearchQuery}
                            onChange={(e) =>
                              setAssignSearchQuery(e.target.value)
                            }
                            placeholder="Search Stores..."
                            className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-2xs"
                          />
                          {assignSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setAssignSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {Object.entries(storeGroups).map(
                          ([merchantName, stores]) => (
                            <div key={merchantName}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    {merchantName} ({stores.length})
                                  </h3>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    ID: {merchantName}
                                  </span>
                                  <CopyButton
                                    value={merchantName}
                                    className="h-5 w-5"
                                  />
                                </div>
                                {!isAssignReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMerchantSelect(
                                        stores,
                                        !areAllMerchantStoresSelected(stores),
                                      )
                                    }
                                    className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline shrink-0 cursor-pointer"
                                  >
                                    {areAllMerchantStoresSelected(stores)
                                      ? "Deselect All"
                                      : "Select All"}
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
                                {stores.map((store, idx) => {
                                  const isChecked = selectedStores.includes(
                                    store.id,
                                  );
                                  return (
                                    <label
                                      key={store.id}
                                      onClick={(e) => {
                                        if (isAssignReadOnly)
                                          e.preventDefault();
                                      }}
                                      className={clsx(
                                        "flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors select-none group",
                                        isAssignReadOnly
                                          ? "cursor-default opacity-85"
                                          : "cursor-pointer hover:bg-slate-100/60",
                                        isChecked &&
                                          "bg-primary-50/50 font-semibold",
                                      )}
                                    >
                                      {!isAssignReadOnly && (
                                        <>
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() =>
                                              toggleStore(store.id)
                                            }
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
                                        </>
                                      )}
                                      <span
                                        className={clsx(
                                          "text-[11px] uppercase tracking-tight truncate leading-tight transition-colors",
                                          isChecked
                                            ? "text-primary-700 font-bold"
                                            : "text-slate-700 font-medium group-hover:text-primary-600",
                                        )}
                                      >
                                        {idx + 1}. {store.name}
                                        {store.isEscrow && " (Escrow)"}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                        )}

                        {Object.entries(storeGroups).length === 0 && (
                          <div className="py-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-10">
                            <Search className="w-8 h-8 text-slate-300 mb-3" />
                            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">
                              No matching stores found
                            </h3>
                            <p className="text-[11px] text-slate-400 max-w-[280px]">
                              Try adjusting your search criteria to find
                              specific merchants or store IDs.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {assignActiveTab === "lookup" && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden shrink-0">
                    <div className="px-4 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0 sm:min-w-[7.5rem]">
                          Merchant ID
                        </h3>
                        <div className="relative flex-1 group min-w-0">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            type="text"
                            placeholder="Enter Merchant ID"
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-2xs h-[34px]"
                          />
                        </div>
                        <button
                          type="button"
                          className="px-5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 shrink-0 h-[34px] cursor-pointer"
                        >
                          Resend Email
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {assignActiveTab === "banks" && (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-4 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Proposed Banks ({PROPOSED_BANKS_MOCK.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
                        {PROPOSED_BANKS_MOCK.map((bank, idx) => (
                          <div
                            key={bank}
                            className="flex items-center gap-2.5 py-1.5 px-2 rounded-md select-none group"
                          >
                            <span className="text-[11px] font-black text-primary-700 shrink-0">
                              {idx + 1}.
                            </span>
                            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight truncate leading-tight transition-colors group-hover:text-primary-600">
                              {bank}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isAssignReadOnly && assignActiveTab === "stores" && (
            <div className="flex items-center gap-3 pt-6 border-t border-slate-100 px-8 pb-6 bg-white shrink-0 justify-end">
              <button
                type="button"
                onClick={closeAssignDrawer}
                className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmOnboarding}
                className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Confirm Onboarding
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
