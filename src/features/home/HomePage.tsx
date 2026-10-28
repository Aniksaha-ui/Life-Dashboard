import { ArrowRight } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { BottomAlertList } from "./components/BottomAlertList";
import { ChannelWiseSummary } from "./components/ChannelWiseSummary";
import { HomeFilters } from "./components/HomeFilters";
import { HomeHeader } from "./components/HomeHeader";
import { MerchantOverviewSection } from "./components/MerchantOverviewSection";
import { OverviewStats } from "./components/OverviewStats";
import { TopAlertBanner } from "./components/TopAlertBanner";
import { TopMerchants } from "./components/TopMerchants";
import { useHome } from "./hooks/useHome";
import { Skeleton } from "../../components/Skeleton";

export default function HomePage() {
  const {
    user,
    selectedPeriod,
    setSelectedPeriod,
    selectedSector,
    setSelectedSector,
    queueType,
    setQueueType,
    showDatePicker,
    setShowDatePicker,
    showSectorDropdown,
    setShowSectorDropdown,
    tempDateRange,
    setTempDateRange,
    setCustomDateRange,
    datePickerRef,
    sectorDropdownRef,
    stats,
    params,
    availableSectors,
    isLoading,
    selectedPeriodLabel,
  } = useHome();

  const alertItems = stats?.alerts?.items ?? [];
  const topAlert = alertItems.find(
    (alert) => alert.position?.toLowerCase() === "top",
  );
  const bottomAlerts = alertItems.filter(
    (alert) => alert.position?.toLowerCase() === "bottom",
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <HomeHeader displayName={user?.profile_name} />
        <HomeFilters
          queueType={queueType}
          setQueueType={setQueueType}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          datePickerRef={datePickerRef}
          setCustomDateRange={setCustomDateRange}
          tempDateRange={tempDateRange}
          setTempDateRange={setTempDateRange}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          availableSectors={availableSectors}
          showSectorDropdown={showSectorDropdown}
          setShowSectorDropdown={setShowSectorDropdown}
          sectorDropdownRef={sectorDropdownRef}
          selectedPeriodLabel={selectedPeriodLabel}
        />
      </div>

      <div className="space-y-6">
        <TopAlertBanner alert={topAlert} />

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Overview
          </h3>
          <OverviewStats
            stats={stats?.cards}
            params={params}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <MerchantOverviewSection
              stats={stats?.merchant_overview}
              params={params}
              periodLabel={stats?.meta.period_label || ""}
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Total Tickets
              </p>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="space-y-2 mb-1">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-slate-900">
                    {stats?.total_tickets?.total || 0}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Open Tickets {stats?.total_tickets?.open || 0}
                  </p>
                </>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                <Link
                  to="/transaction-tickets"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-3">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Settlements Bounce
            </p>
            <div className="mt-4">
              {isLoading ? (
                <div className="space-y-2 mb-1">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-slate-900">
                    {stats?.settlements_bounce?.count || 0}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Bounce Amount ৳
                    {stats?.settlements_bounce?.bounce_amount?.toLocaleString() ||
                      0}
                  </p>
                </>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                <Link
                  to="/settlements?status=Bounced"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMerchants data={stats?.top_merchants} />
        <ChannelWiseSummary data={stats?.channel_wise_summary} />
      </div>

      {bottomAlerts.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <BottomAlertList alerts={bottomAlerts} />
        </div>
      )}

      <Outlet />
    </div>
  );
}
