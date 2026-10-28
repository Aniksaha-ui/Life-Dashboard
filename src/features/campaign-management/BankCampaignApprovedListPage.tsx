import { useState, useMemo, useEffect } from "react";
import { Calendar, Image as ImageIcon, Eye } from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { FilterBar } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import type { ColumnDef } from "@tanstack/react-table";
import {
  STATUS_BADGE_CLASS,
  getBankCampaignApprovedStatusClass,
} from "./utils/statusBadge";
import { SectorsCell } from "./components/SectorsCell";
import { getCampaignBannerByIndex } from "./utils/campaignBanners";
import { StoreCampaignViewTabs } from "./components/StoreCampaignViewTabs";
import type { StoreCampaignViewTab } from "./components/StoreCampaignViewTabs";
import { ActionIconButton } from "./components/ActionIconButton";

interface ApprovedCampaign {
  id: string;
  name: string;
  trackingId: string;
  sectors: string;
  startDate: string;
  endDate: string;
  banner: string;
  confirmationExpire: string;
  canOnboard: "Yes" | "No";
  status: "Created" | "KAM Approved" | "Bank Approved" | "Production";
  discount: string;
  details: string;
}

const APPROVED_CAMPAIGNS_MOCK: ApprovedCampaign[] = [
  {
    id: "1",
    name: "Bank with offer and merchant",
    trackingId: "G3QRI713022026085202",
    sectors:
      "Retail Outlet Services, Airlines, College, Tour Operator & Travel Agencies",
    startDate: "10-Feb-26",
    endDate: "11-Feb-26",
    banner: getCampaignBannerByIndex(0),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Created",
    discount: "View",
    details: "View",
  },
  {
    id: "2",
    name: "Bank with merchant 1",
    trackingId: "EHFV5E13022026084844",
    sectors: "Marketplace, Ministry of Foreign Affairs, ITES",
    startDate: "10-Feb-26",
    endDate: "11-Feb-26",
    banner: getCampaignBannerByIndex(1),
    confirmationExpire: "08-Feb-26",
    canOnboard: "Yes",
    status: "Created",
    discount: "View",
    details: "View",
  },
  {
    id: "3",
    name: "Test Campaign - Description Issue",
    trackingId: "K4OH9P10042025285713",
    sectors: "Charity/NGO/Volunteer Services, Distance Learning",
    startDate: "30-Apr-25",
    endDate: "09-May-25",
    banner: "N/A",
    confirmationExpire: "28-Apr-25",
    canOnboard: "Yes",
    status: "Created",
    discount: "View",
    details: "View",
  },
  {
    id: "4",
    name: "Campaign Bank with merchant - 27 april",
    trackingId: "CKOLPP16042025270018",
    sectors:
      "ISP, Events Management Services, Ministry of Fisheries and Livestock",
    startDate: "30-Apr-25",
    endDate: "08-May-25",
    banner: getCampaignBannerByIndex(0),
    confirmationExpire: "28-Apr-25",
    canOnboard: "Yes",
    status: "KAM Approved",
    discount: "View",
    details: "View",
  },
  {
    id: "5",
    name: "Bank with offer and merchant - 25 feb",
    trackingId: "PM0N9O1102202525252011",
    sectors: "VOD/OTT Platform, Construction Goods",
    startDate: "25-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "22-Feb-25",
    canOnboard: "Yes",
    status: "Created",
    discount: "View",
    details: "View",
  },
  {
    id: "6",
    name: "Bank with merchant - 25 feb",
    trackingId: "G2IVPU11022025251752",
    sectors: "Service, Tourism, Diagnostics & Treatment, VTS",
    startDate: "25-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "12-Feb-25",
    canOnboard: "Yes",
    status: "Created",
    discount: "View",
    details: "View",
  },
  {
    id: "7",
    name: "Bank with offer and merchant",
    trackingId: "7GFVQJ15022025165419",
    sectors: "Education",
    startDate: "16-Feb-25",
    endDate: "28-Feb-25",
    banner: "N/A",
    confirmationExpire: "10-Feb-25",
    canOnboard: "Yes",
    status: "KAM Approved",
    discount: "View",
    details: "View",
  },
  {
    id: "8",
    name: "Bank with merchant",
    trackingId: "EB2FXZ15022025163840",
    sectors: "Automobile",
    startDate: "16-Feb-25",
    endDate: "01-Mar-25",
    banner: "N/A",
    confirmationExpire: "03-Feb-25",
    canOnboard: "Yes",
    status: "KAM Approved",
    discount: "View",
    details: "View",
  },
];

const OFFER_INFORMATION_HEADERS = [
  "Offer Modality Percent",
  "Fully consumed by merchant",
  "Minimum order amount",
  "Max discount amount per transaction",
  "Card discount amount",
  "Recurrent discount limit per user",
];

function OfferDetailsContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Offer Information
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-slate-50/50">
              <tr>
                {OFFER_INFORMATION_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 leading-tight"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                  10
                </td>
                <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                  1
                </td>
                <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                  10
                </td>
                <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                  30
                </td>
                <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                  30
                </td>
                <td className="px-4 py-4 text-xs text-slate-700 font-medium">
                  40
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Data List
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-slate-50/50">
              <tr>
                {["Msslid", "Merchant Name"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 leading-tight"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4 text-xs text-slate-800 font-bold">
                  demotest
                </td>
                <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                  Sandbox Live Test
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function BankCampaignApprovedListPage() {
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
    useState<ApprovedCampaign | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [isCampaignViewDrawerOpen, setIsCampaignViewDrawerOpen] =
    useState(false);
  const [viewModalDefaultTab, setViewModalDefaultTab] =
    useState<StoreCampaignViewTab>("campaign-details");

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
    campaign: ApprovedCampaign,
    tab: StoreCampaignViewTab = "campaign-details",
  ) => {
    setSelectedCampaign(campaign);
    setViewModalDefaultTab(tab);
    setIsCampaignViewDrawerOpen(true);
  };

  const closeCampaignView = () => {
    setIsCampaignViewDrawerOpen(false);
    setSelectedCampaign(null);
    setViewModalDefaultTab("campaign-details");
  };

  const filteredData = useMemo(() => {
    return APPROVED_CAMPAIGNS_MOCK.filter((item) => {
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
  }, [appliedFilters]);

  const metrics = useMemo(
    () => ({
      total: filteredData.length,
      created: filteredData.filter((d) => d.status === "Created").length,
      kamApproved: filteredData.filter((d) => d.status === "KAM Approved")
        .length,
      bankApproved: filteredData.filter(
        (d) => d.status === "Bank Approved" || d.status === "Production",
      ).length,
    }),
    [filteredData],
  );

  const columns: ColumnDef<ApprovedCampaign>[] = [
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
        if (bannerUrl === "N/A") {
          return (
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              N/A
            </span>
          );
        }
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
            getBankCampaignApprovedStatusClass(row.original.status),
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
        <ActionIconButton
          label="View"
          tooltip="View"
          icon={Eye}
          onClick={() => openCampaignView(row.original, "participating")}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Bank Campaign Approved List
          </h1>
          <p className="text-slate-500 text-sm tracking-tight mt-1">
            Monitor and analyze campaigns that have been cleared for
            administrative review
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            config={
              [
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
                  key: "canOnboard",
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
                    { label: "KAM Approved", value: "KAM Approved" },
                    { label: "Bank Approved", value: "Bank Approved" },
                    { label: "Production", value: "Production" },
                  ],
                },
              ] as any
            }
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
              value={metrics.kamApproved.toString()}
              valueClassName="text-emerald-600"
            />
            <MetricCard
              title="Bank Approved"
              value={metrics.bankApproved.toString()}
              valueClassName="text-emerald-600"
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
                  Showing approved campaigns
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

      <Drawer
        open={isCampaignViewDrawerOpen}
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
                  selectedCampaign?.status === "Created" ||
                    selectedCampaign?.status === "KAM Approved"
                    ? "bg-[#007cc2] text-white"
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
              offerDetailsContent={<OfferDetailsContent />}
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
              }
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
