import { useState, useMemo } from "react";
import { clsx } from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { Drawer } from "../../components/Drawer";
import { MetricCard } from "../../components/MetricCard";
import { SectorsCell } from "./components/SectorsCell";
import { STATUS_BADGE_CLASS } from "./utils/statusBadge";

// --- Types ---
interface CalendarCampaign {
  id: string;
  campaign: string;
  trackingId: string;
  startDate: Date;
  endDate: Date;
  bankPartner: string;
  status:
    "Created" | "KAM Approved" | "Bank Approved" | "Production" | "Closed";
  sectors: string;
  confirmationExpire: string;
  canOnboard: "Yes" | "No";
  banner: string;
  cardBin: string;
  badgeColor?: string;
}

// --- Mock Data ---
const CAMPAIGN_BANNER_1 =
  "https://campaign.sslcommerz.com/fifa_26/images/Landing-page-Banner.png";
const CAMPAIGN_BANNER_2 =
  "https://campaign.sslcommerz.com/summer_26/images/Landing-page-Banner.png";

const MOCK_CAMPAIGNS: CalendarCampaign[] = [
  {
    id: "1",
    campaign: "Summer Flash Sale 2026",
    trackingId: "SUMFS26042026081200",
    startDate: new Date(2026, 6, 1),
    endDate: new Date(2026, 6, 30),
    cardBin: "498275",
    bankPartner: "SSL Commerz",
    status: "Bank Approved",
    sectors: "Retail Outlet Services, Airlines, College",
    confirmationExpire: "28-Jun-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
    badgeColor: "bg-blue-100 border-blue-400 text-blue-900",
  },
  {
    id: "2",
    campaign: "Eid Special Offer 2026",
    trackingId: "EIDSP26032026062400",
    startDate: new Date(2026, 6, 3),
    endDate: new Date(2026, 6, 15),
    cardBin: "432432",
    bankPartner: "SSL Commerz",
    status: "KAM Approved",
    sectors: "Subscription, Tele-Medicine, Transportation",
    confirmationExpire: "02-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
    badgeColor: "bg-emerald-100 border-emerald-400 text-emerald-900",
  },
  {
    id: "3",
    campaign: "Daraz Mega Electronics Fest",
    trackingId: "DRZEL12072026160017",
    startDate: new Date(2026, 6, 6),
    endDate: new Date(2026, 6, 20),
    cardBin: "452424",
    bankPartner: "Merchant",
    status: "Production",
    sectors: "Service, Tourism, Diagnostics & Treatment",
    confirmationExpire: "05-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
    badgeColor: "bg-violet-100 border-violet-400 text-violet-900",
  },
  {
    id: "4",
    campaign: "Foodpanda Weekend Cashback",
    trackingId: "FDPWD09112026163414",
    startDate: new Date(2026, 6, 10),
    endDate: new Date(2026, 6, 12),
    cardBin: "888888",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "VOD/OTT Platform, Construction Goods",
    confirmationExpire: "09-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
    badgeColor: "bg-amber-100 border-amber-400 text-amber-900",
  },
  {
    id: "5",
    campaign: "Airlines Festive Discount",
    trackingId: "AIRFS14122026170107",
    startDate: new Date(2026, 6, 12),
    endDate: new Date(2026, 6, 25),
    cardBin: "554321",
    bankPartner: "SSL Commerz",
    status: "KAM Approved",
    sectors: "Airlines, Marketplace, ITES",
    confirmationExpire: "11-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
    badgeColor: "bg-cyan-100 border-cyan-400 text-cyan-900",
  },
  {
    id: "6",
    campaign: "Monsoon Lifestyle Bonanza",
    trackingId: "MONLB16042026275622",
    startDate: new Date(2026, 6, 15),
    endDate: new Date(2026, 6, 28),
    cardBin: "384294",
    bankPartner: "Merchant",
    status: "Production",
    sectors: "Travel Agencies and Tour Operators, Utility services",
    confirmationExpire: "14-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
    badgeColor: "bg-pink-100 border-pink-400 text-pink-900",
  },
  {
    id: "7",
    campaign: "Bank Initiate Special Reward",
    trackingId: "BNKSP13042026270729",
    startDate: new Date(2026, 6, 18),
    endDate: new Date(2026, 6, 30),
    cardBin: "401122",
    bankPartner: "SSL Commerz",
    status: "Bank Approved",
    sectors: "Retail Outlet Services, College",
    confirmationExpire: "17-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
    badgeColor: "bg-indigo-100 border-indigo-400 text-indigo-900",
  },
  {
    id: "8",
    campaign: "Supermarket Groceries Offer",
    trackingId: "SPMGR10042026284750",
    startDate: new Date(2026, 6, 22),
    endDate: new Date(2026, 6, 24),
    cardBin: "456565,657578",
    bankPartner: "Merchant",
    status: "Created",
    sectors: "Subscription, Tele-Medicine, Transportation",
    confirmationExpire: "21-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_1,
    badgeColor: "bg-teal-100 border-teal-400 text-teal-900",
  },
  {
    id: "9",
    campaign: "End of Month Flash Deal",
    trackingId: "EOMFD10042026284799",
    startDate: new Date(2026, 6, 26),
    endDate: new Date(2026, 6, 31),
    cardBin: "987654",
    bankPartner: "SSL Commerz",
    status: "Production",
    sectors: "Marketplace, Electronics",
    confirmationExpire: "25-Jul-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
    badgeColor: "bg-purple-100 border-purple-400 text-purple-900",
  },
  {
    id: "10",
    campaign: "Old Winter Clearance",
    trackingId: "OLDWC13042025270729",
    startDate: new Date(2026, 5, 12),
    endDate: new Date(2026, 5, 20),
    cardBin: "",
    bankPartner: "SSL Commerz",
    status: "Closed",
    sectors: "Airlines, Marketplace",
    confirmationExpire: "10-Jun-26",
    canOnboard: "No",
    banner: CAMPAIGN_BANNER_1,
    badgeColor: "bg-rose-100 border-rose-400 text-rose-900",
  },
  {
    id: "11",
    campaign: "August Independence Offer",
    trackingId: "AUGID15082026284700",
    startDate: new Date(2026, 7, 5),
    endDate: new Date(2026, 7, 18),
    cardBin: "332211",
    bankPartner: "Merchant",
    status: "KAM Approved",
    sectors: "Automobile, Hospitality",
    confirmationExpire: "03-Aug-26",
    canOnboard: "Yes",
    banner: CAMPAIGN_BANNER_2,
    badgeColor: "bg-orange-100 border-orange-400 text-orange-900",
  },
];

// --- Status helpers ---
const STATUS_COLORS: Record<
  CalendarCampaign["status"],
  { pill: string; dot: string }
> = {
  Created: {
    pill: "bg-amber-100 text-amber-800 border border-amber-300",
    dot: "bg-amber-500",
  },
  "KAM Approved": {
    pill: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    dot: "bg-emerald-500",
  },
  "Bank Approved": {
    pill: "bg-blue-100 text-blue-800 border border-blue-300",
    dot: "bg-blue-500",
  },
  Production: {
    pill: "bg-violet-100 text-violet-800 border border-violet-300",
    dot: "bg-violet-500",
  },
  Closed: {
    pill: "bg-rose-100 text-rose-800 border border-rose-300",
    dot: "bg-rose-500",
  },
};

const CALENDAR_EVENT_COLORS: Record<CalendarCampaign["status"], string> = {
  Created: "bg-amber-100 border-amber-400 text-amber-900",
  "KAM Approved": "bg-emerald-100 border-emerald-400 text-emerald-900",
  "Bank Approved": "bg-blue-100 border-blue-400 text-blue-900",
  Production: "bg-violet-100 border-violet-400 text-violet-900",
  Closed: "bg-rose-100 border-rose-400 text-rose-900",
};

// --- Helpers ---
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

// --- Detail View ---
function CampaignDetailContent({ campaign }: { campaign: CalendarCampaign }) {
  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
        {campaign.banner ? (
          <img
            src={campaign.banner}
            alt="Campaign Banner"
            className="w-full h-auto block"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-10">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs font-semibold">No Banner</span>
          </div>
        )}
      </div>

      {/* Details */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Campaign Information
        </h3>
        <div className="bg-white rounded-lg border border-slate-200 px-4 shadow-sm divide-y divide-slate-100">
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Campaign Name
            </span>
            <span className="text-slate-900 font-semibold text-right">
              {campaign.campaign}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Tracking ID
            </span>
            <span className="text-slate-900 font-mono text-xs text-right">
              {campaign.trackingId}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Status
            </span>
            <span
              className={clsx(
                STATUS_BADGE_CLASS,
                STATUS_COLORS[campaign.status].pill,
              )}
            >
              {campaign.status}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Start Date
            </span>
            <span className="text-slate-900 font-medium">
              {formatDate(campaign.startDate)}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              End Date
            </span>
            <span className="text-slate-900 font-medium">
              {formatDate(campaign.endDate)}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Confirmation Expire
            </span>
            <span className="text-slate-900 font-medium">
              {campaign.confirmationExpire}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Bank Partner
            </span>
            <span className="text-slate-900 font-medium">
              {campaign.bankPartner}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Card BIN
            </span>
            <span className="text-slate-900 font-medium break-all text-right">
              {campaign.cardBin || "—"}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 text-sm">
            <span className="text-slate-500 font-medium shrink-0 w-44">
              Can Onboard Now
            </span>
            <span className="text-slate-900 font-medium">
              {campaign.canOnboard}
            </span>
          </div>
          <div className="flex flex-col py-3 text-sm gap-1.5">
            <span className="text-slate-500 font-medium">Sectors</span>
            <SectorsCell sectorsStr={campaign.sectors} />
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Main Page ---
export default function KamCampaignCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] =
    useState<CalendarCampaign | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);

  // --- Calendar grid cells ---
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gridCells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    gridCells.push(new Date(year, month, d));

  // Pad to complete last row
  while (gridCells.length % 7 !== 0) gridCells.push(null);

  // --- Filtered campaigns ---
  const filteredCampaigns = useMemo(
    () =>
      MOCK_CAMPAIGNS.filter(
        (c) => statusFilter === "all" || c.status === statusFilter,
      ),
    [statusFilter],
  );

  // Campaigns visible in current month (checking start date only)
  const monthCampaigns = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return filteredCampaigns.filter(
      (c) => c.startDate >= monthStart && c.startDate <= monthEnd,
    );
  }, [filteredCampaigns, year, month]);

  // Campaigns for a specific day (checking start date only)
  const campaignsForDay = (date: Date) =>
    filteredCampaigns.filter((c) => isSameDay(date, c.startDate));

  // Navigate months
  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };
  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const openDayDrawer = (date: Date) => {
    setSelectedDay(date);
    setDayDrawerOpen(true);
  };

  const dayCampaigns = selectedDay ? campaignsForDay(selectedDay) : [];

  const statusOptions: { label: string; value: string }[] = [
    { label: "All Status", value: "all" },
    { label: "Created", value: "Created" },
    { label: "KAM Approved", value: "KAM Approved" },
    { label: "Bank Approved", value: "Bank Approved" },
    { label: "Production", value: "Production" },
    { label: "Closed", value: "Closed" },
  ];

  // Metrics
  const metrics = useMemo(
    () => ({
      total: filteredCampaigns.length,
      active: filteredCampaigns.filter((c) => {
        const now = new Date();
        return c.startDate <= now && c.endDate >= now;
      }).length,
      upcoming: filteredCampaigns.filter((c) => c.startDate > new Date())
        .length,
      thisMonth: monthCampaigns.length,
    }),
    [filteredCampaigns, monthCampaigns],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            KAM Campaign Calendar
          </h1>
          <p className="text-slate-500 text-sm tracking-tight">
            Visualize and track campaign schedules across the calendar.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Campaigns" value={metrics.total.toString()} />
        <MetricCard title="Active Now" value={metrics.active.toString()} />
        <MetricCard title="Upcoming" value={metrics.upcoming.toString()} />
        <MetricCard title="This Month" value={metrics.thisMonth.toString()} />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-wrap gap-3">
          {/* Month Nav */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-slate-900 min-w-[160px] text-center">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  viewMode === "month"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* === MONTH VIEW === */}
        {viewMode === "month" && (
          <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {gridCells.map((date, idx) => {
                const isToday = date ? isSameDay(date, today) : false;
                const dayCamps = date ? campaignsForDay(date) : [];
                const isLastRow = idx >= gridCells.length - 7;
                const isLastCol = (idx + 1) % 7 === 0;

                return (
                  <div
                    key={idx}
                    onClick={() =>
                      date && dayCamps.length > 0 && openDayDrawer(date)
                    }
                    className={clsx(
                      "min-h-[110px] p-2 border-b border-r border-slate-100 transition-colors",
                      !date && "bg-slate-50/50",
                      date &&
                        dayCamps.length > 0 &&
                        "cursor-pointer hover:bg-slate-50",
                      isLastRow && "border-b-0",
                      isLastCol && "border-r-0",
                    )}
                  >
                    {date && (
                      <>
                        <div
                          className={clsx(
                            "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1.5 transition-colors",
                            isToday
                              ? "bg-primary-600 text-white"
                              : "text-slate-700",
                          )}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayCamps.slice(0, 2).map((c) => (
                            <div
                              key={c.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCampaign(c);
                              }}
                              className={clsx(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer transition-opacity hover:opacity-80",
                                c.badgeColor || CALENDAR_EVENT_COLORS[c.status],
                              )}
                              title={c.campaign}
                            >
                              {c.campaign}
                            </div>
                          ))}
                          {dayCamps.length > 2 && (
                            <div
                              className="text-[10px] font-semibold text-slate-500 px-1 cursor-pointer hover:text-slate-800 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDayDrawer(date);
                              }}
                            >
                              +{dayCamps.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === LIST VIEW === */}
        {viewMode === "list" && (
          <div className="divide-y divide-slate-100">
            {monthCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <Calendar className="w-10 h-10" />
                <p className="text-sm font-semibold">
                  No campaigns for {MONTH_NAMES[month]} {year}
                </p>
              </div>
            ) : (
              monthCampaigns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCampaign(c)}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {/* Color dot */}
                  <div
                    className={clsx(
                      "w-2.5 h-2.5 rounded-full mt-1 shrink-0",
                      STATUS_COLORS[c.status].dot,
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {c.campaign}
                      </p>
                      <span
                        className={clsx(
                          STATUS_BADGE_CLASS,
                          STATUS_COLORS[c.status].pill,
                        )}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {formatDate(c.startDate)} → {formatDate(c.endDate)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {c.trackingId}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-600">
                      {c.bankPartner}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
          {Object.entries(STATUS_COLORS).map(([status, { dot }]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={clsx("w-2 h-2 rounded-full", dot)} />
              <span className="text-[11px] font-semibold text-slate-500">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Drawer */}
      <Drawer
        open={dayDrawerOpen}
        onClose={() => setDayDrawerOpen(false)}
        title={
          selectedDay
            ? `Campaigns on ${selectedDay.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`
            : "Campaigns"
        }
        width="lg"
      >
        <div className="space-y-3 pb-8">
          {dayCampaigns.length === 0 ? (
            <p className="text-sm text-slate-400">No campaigns on this day.</p>
          ) : (
            dayCampaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setDayDrawerOpen(false);
                  setTimeout(() => setSelectedCampaign(c), 200);
                }}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm hover:border-slate-300 cursor-pointer transition-all"
              >
                <div
                  className={clsx(
                    "w-2.5 h-2.5 rounded-full mt-1 shrink-0",
                    STATUS_COLORS[c.status].dot,
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {c.campaign}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(c.startDate)} → {formatDate(c.endDate)}
                  </p>
                  <div className="mt-1.5">
                    <span
                      className={clsx(
                        STATUS_BADGE_CLASS,
                        STATUS_COLORS[c.status].pill,
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Drawer>

      {/* Campaign Detail Drawer */}
      <Drawer
        open={selectedCampaign !== null}
        onClose={() => setSelectedCampaign(null)}
        title={
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900">
              Campaign Details
            </span>
            <span className="text-xs font-medium text-slate-500">
              ID: {selectedCampaign?.trackingId}
            </span>
          </div>
        }
        width="3xl"
      >
        {selectedCampaign && (
          <CampaignDetailContent campaign={selectedCampaign} />
        )}
      </Drawer>
    </div>
  );
}
