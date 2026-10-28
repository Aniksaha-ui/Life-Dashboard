import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { ChevronDown, Download } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import { MetricCard } from "../../../../components/MetricCard";
import {
  REFERRAL_CODE_SUMMARY,
  REFERRAL_CODE_SUMMARY_ALL,
  REFERRAL_ONBOARDED_MERCHANTS,
  REFERRAL_INVITATIONS,
  formatPercentage,
  isActivityDateInRange,
  type OnboardedMerchantRow,
  type ReferralInvitationRow,
  type ReferralCodeSummaryRow,
} from "../data/referralReportData";
import { ReferralCodeSummaryDrawer } from "./ReferralCodeSummaryDrawer";

interface ReferralReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface ReferralReportHandle {
  exportData: () => void;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const KPI_CONFIG = [
  {
    key: "referringMerchantCount" as const,
    title: "Referrers",
    label: "Referring Merchant Count",
    color: "#8b5cf6",
  },
  {
    key: "referralCodeGenerated" as const,
    title: "Codes",
    label: "Referral Code Generated",
    color: "#10b981",
  },
  {
    key: "referralInvitationsSent" as const,
    title: "Invitations",
    label: "Referral Invitations Sent",
    color: "#f59e0b",
  },
  {
    key: "merchantsOnboarded" as const,
    title: "Onboarded",
    label: "Merchants Onboarded",
    color: "#3b82f6",
  },
  {
    key: "referralBonusDisbursed" as const,
    title: "Bonus Paid",
    label: "Referral Bonus Disbursed",
    color: "#ec4899",
  },
];

function SettlementStatusBadge({ status }: { status: "Yes" | "No" }) {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap inline-block",
        status === "Yes"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-rose-50 text-rose-600",
      )}
    >
      {status}
    </span>
  );
}

function BonusStatusBadge({ status }: { status: "Success" | "Pending" }) {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap inline-block",
        status === "Success"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-amber-50 text-amber-600",
      )}
    >
      {status}
    </span>
  );
}

function filterOnboardedRows(
  rows: OnboardedMerchantRow[],
  filters: ReportFilters,
) {
  return rows.filter((row) =>
    isActivityDateInRange(row.activityDate, filters.from, filters.to),
  );
}

function filterInvitationRows(
  rows: ReferralInvitationRow[],
  filters: ReportFilters,
) {
  return rows.filter((row) =>
    isActivityDateInRange(row.activityDate, filters.from, filters.to),
  );
}

function filterCodeSummaryRows(
  rows: ReferralCodeSummaryRow[],
  invitationRows: ReferralInvitationRow[],
) {
  const activeCompanies = new Set(invitationRows.map((row) => row.companyName));
  return rows.filter((row) => activeCompanies.has(row.companyName));
}

function computeSummary(
  onboardedRows: OnboardedMerchantRow[],
  invitationRows: ReferralInvitationRow[],
  filters: ReportFilters,
) {
  if (!filters.from || !filters.to) {
    return {
      referringMerchantCount: 5,
      referralCodeGenerated: 4,
      referralInvitationsSent: 97,
      merchantsOnboarded: 9,
      referralBonusDisbursed: 8,
      codeSummary: REFERRAL_CODE_SUMMARY,
      codeSummaryAll: REFERRAL_CODE_SUMMARY_ALL,
    };
  }

  const referringMerchants = new Set(
    onboardedRows.map((row) => row.referrerMerchantName),
  );
  const codeSummary = filterCodeSummaryRows(
    REFERRAL_CODE_SUMMARY,
    invitationRows,
  );
  const codeSummaryAll = filterCodeSummaryRows(
    REFERRAL_CODE_SUMMARY_ALL,
    invitationRows,
  );

  return {
    referringMerchantCount: referringMerchants.size,
    referralCodeGenerated: codeSummaryAll.reduce(
      (sum, row) => sum + row.referralCodesGenerated,
      0,
    ),
    referralInvitationsSent: invitationRows.length,
    merchantsOnboarded: onboardedRows.length,
    referralBonusDisbursed: onboardedRows.filter(
      (row) => row.bonusStatus === "Success",
    ).length,
    codeSummary: codeSummary.length > 0 ? codeSummary : [],
    codeSummaryAll,
  };
}

function ReportTableFooter({
  currentPage,
  totalPages,
  totalEntries,
  rowsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const from = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const to = Math.min(currentPage * rowsPerPage, totalEntries);

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Showing {from} to {to} of {totalEntries} entries
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-sm font-semibold text-slate-600 select-none">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function RowsPerPageControl({
  rowsPerPage,
  onRowsPerPageChange,
}: {
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="whitespace-nowrap">Show</span>
      <div className="relative">
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="appearance-none pl-3 pr-9 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
        >
          {ROWS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <span className="whitespace-nowrap">entries</span>
    </div>
  );
}

export const ReferralReport = forwardRef<
  ReferralReportHandle,
  ReferralReportProps
>(({ sections: _sections, filters }, ref) => {
  const [onboardedPage, setOnboardedPage] = useState(1);
  const [invitationPage, setInvitationPage] = useState(1);
  const [onboardedRowsPerPage, setOnboardedRowsPerPage] = useState(5);
  const [invitationRowsPerPage, setInvitationRowsPerPage] = useState(5);
  const [codeSummaryDrawerOpen, setCodeSummaryDrawerOpen] = useState(false);

  const filteredOnboarded = useMemo(
    () => filterOnboardedRows(REFERRAL_ONBOARDED_MERCHANTS, filters),
    [filters],
  );

  const filteredInvitations = useMemo(
    () => filterInvitationRows(REFERRAL_INVITATIONS, filters),
    [filters],
  );

  const summary = useMemo(
    () => computeSummary(filteredOnboarded, filteredInvitations, filters),
    [filteredOnboarded, filteredInvitations, filters],
  );

  const chartTotal =
    summary.referringMerchantCount +
    summary.referralCodeGenerated +
    summary.referralInvitationsSent +
    summary.merchantsOnboarded +
    summary.referralBonusDisbursed;

  const chartData = useMemo(
    () =>
      KPI_CONFIG.map((item) => ({
        name: item.label,
        value: summary[item.key],
        color: item.color,
      })).filter((item) => item.value > 0),
    [summary],
  );

  const onboardedTotalPages = Math.max(
    1,
    Math.ceil(filteredOnboarded.length / onboardedRowsPerPage),
  );
  const invitationTotalPages = Math.max(
    1,
    Math.ceil(filteredInvitations.length / invitationRowsPerPage),
  );

  const pagedOnboarded = useMemo(() => {
    const start = (onboardedPage - 1) * onboardedRowsPerPage;
    return filteredOnboarded.slice(start, start + onboardedRowsPerPage);
  }, [filteredOnboarded, onboardedPage, onboardedRowsPerPage]);

  const pagedInvitations = useMemo(() => {
    const start = (invitationPage - 1) * invitationRowsPerPage;
    return filteredInvitations.slice(start, start + invitationRowsPerPage);
  }, [filteredInvitations, invitationPage, invitationRowsPerPage]);

  useEffect(() => {
    setOnboardedPage(1);
    setInvitationPage(1);
  }, [filters.from, filters.to, onboardedRowsPerPage, invitationRowsPerPage]);

  useEffect(() => {
    if (onboardedPage > onboardedTotalPages) {
      setOnboardedPage(onboardedTotalPages);
    }
  }, [onboardedPage, onboardedTotalPages]);

  useEffect(() => {
    if (invitationPage > invitationTotalPages) {
      setInvitationPage(invitationTotalPages);
    }
  }, [invitationPage, invitationTotalPages]);

  const generateCsvContent = () => {
    const onboardedHeaders = [
      "Merchants",
      "MssId",
      "Email",
      "Mobile Number",
      "Settlement Status",
      "Settlement Date",
      "Referrer Merchant",
      "Bonus Status",
      "Referral Bonus",
    ];
    const onboardedCsv = filteredOnboarded.map((row) => [
      row.companyName,
      row.mssId,
      row.email,
      row.mobileNumber,
      row.settlementStatus,
      row.settlementDate,
      row.referrerMerchantName,
      row.bonusStatus,
      row.referralBonusBdt.toFixed(2),
    ]);

    const invitationHeaders = [
      "Merchants",
      "MssId",
      "Referee Email",
      "Referee Mobile Number",
      "Date",
    ];
    const invitationCsv = filteredInvitations.map((row) => [
      row.companyName,
      row.mssId,
      row.refereeEmail,
      row.refereeMobileNumber,
      row.date,
    ]);

    if (onboardedCsv.length === 0 && invitationCsv.length === 0) return null;

    return [
      "Onboarded Merchant List",
      onboardedHeaders.join(","),
      ...onboardedCsv.map((row) => row.join(",")),
      "",
      "Referral Invitation List",
      invitationHeaders.join(","),
      ...invitationCsv.map((row) => row.join(",")),
    ].join("\n");
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const content = generateCsvContent();
    if (content) {
      downloadCsv(
        content,
        `referral-report-${filters.from || "all"}-${filters.to || "time"}.csv`,
      );
    } else {
      alert("No rows to export for current filters.");
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  if (
    (filters.from || filters.to) &&
    filteredOnboarded.length === 0 &&
    filteredInvitations.length === 0
  ) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No referral data found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {KPI_CONFIG.map((item) => (
            <MetricCard
              key={item.key}
              title={item.title}
              value={summary[item.key].toString()}
              valueClassName="tabular-nums"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Referral Code Summary
            </h3>
            <button
              type="button"
              onClick={() => setCodeSummaryDrawerOpen(true)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
            >
              View all
            </button>
          </div>
          <div>
            <table className="w-full text-sm border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <th className="px-4 py-3 text-left">Merchants</th>
                  <th className="px-3 py-3 text-center w-20">Codes</th>
                  <th className="px-3 py-3 text-center w-24">Invitations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.codeSummary.map((row) => (
                  <tr
                    key={row.companyName}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-left text-slate-700 break-words">
                      {row.companyName}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-700 tabular-nums">
                      {row.referralCodesGenerated}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-700 tabular-nums">
                      {row.totalInvitations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Summary Overview
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
              className="relative w-[220px] h-[220px] shrink-0 [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
              onMouseDown={(event) => event.preventDefault()}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} (${formatPercentage(value, chartTotal)})`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">
                  {chartTotal}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Total
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              {KPI_CONFIG.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 font-medium truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                    {summary[item.key]} (
                    {formatPercentage(summary[item.key], chartTotal)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Onboarded Merchant List
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export
            </button>
            <RowsPerPageControl
              rowsPerPage={onboardedRowsPerPage}
              onRowsPerPageChange={setOnboardedRowsPerPage}
            />
          </div>
        </div>
        <div className="w-full">
          <table className="w-full text-sm border-collapse table-fixed">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[26%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-2 py-2 sm:px-4 sm:py-3 text-left max-w-0">
                  Merchants
                </th>
                <th className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0">
                  MssId
                </th>
                <th className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0">
                  <span className="block">Email</span>
                  <span className="block">Mobile Number</span>
                </th>
                <th className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0">
                  <span className="block whitespace-nowrap">
                    Settlement Status
                  </span>
                  <span className="block whitespace-nowrap">
                    Settlement Date
                  </span>
                </th>
                <th className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0">
                  Referrer Merchant
                </th>
                <th className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0">
                  Bonus Status
                </th>
                <th className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0">
                  <span className="block leading-tight whitespace-nowrap">
                    Referral
                  </span>
                  <span className="block leading-tight whitespace-nowrap">
                    Bonus
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedOnboarded.map((row, idx) => (
                <tr
                  key={`${row.mssId}-${idx}`}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-left text-slate-700 max-w-0 align-top">
                    <span className="block break-words">{row.companyName}</span>
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-3 text-left text-slate-700 max-w-0 align-top">
                    <span className="block break-all">{row.mssId}</span>
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-3 text-left text-slate-700 max-w-0 align-top">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="break-all">{row.email}</span>
                      <span className="tabular-nums break-all">
                        {row.mobileNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0 align-top">
                    <div className="flex flex-col items-start gap-1 min-w-0">
                      <SettlementStatusBadge status={row.settlementStatus} />
                      <span className="text-slate-700 whitespace-nowrap">
                        {row.settlementDate || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-3 text-left text-slate-700 max-w-0 align-top">
                    <span className="block break-words">
                      {row.referrerMerchantName}
                    </span>
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-3 text-left max-w-0 align-top">
                    <BonusStatusBadge status={row.bonusStatus} />
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-3 text-left text-slate-700 font-medium tabular-nums max-w-0 align-top whitespace-nowrap">
                    {row.referralBonusBdt.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ReportTableFooter
          currentPage={onboardedPage}
          totalPages={onboardedTotalPages}
          totalEntries={filteredOnboarded.length}
          rowsPerPage={onboardedRowsPerPage}
          onPageChange={setOnboardedPage}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Referral Invitation List
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export
            </button>
            <RowsPerPageControl
              rowsPerPage={invitationRowsPerPage}
              onRowsPerPageChange={setInvitationRowsPerPage}
            />
          </div>
        </div>
        <div className="w-full">
          <table className="w-full text-sm border-collapse table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[14%]" />
              <col className="w-[30%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-left">Merchants</th>
                <th className="px-3 py-3 text-left">MssId</th>
                <th className="px-3 py-3 text-left">Referee Email</th>
                <th className="px-3 py-3 text-left">Referee Mobile Number</th>
                <th className="px-3 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedInvitations.map((row, idx) => (
                <tr
                  key={`${row.mssId}-${row.date}-${idx}`}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-left text-slate-700 break-words">
                    {row.companyName}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 whitespace-nowrap">
                    {row.mssId}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 break-words">
                    {row.refereeEmail}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 tabular-nums whitespace-nowrap">
                    {row.refereeMobileNumber}
                  </td>
                  <td className="px-3 py-3 text-left text-slate-700 whitespace-nowrap">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ReportTableFooter
          currentPage={invitationPage}
          totalPages={invitationTotalPages}
          totalEntries={filteredInvitations.length}
          rowsPerPage={invitationRowsPerPage}
          onPageChange={setInvitationPage}
        />
      </div>

      <ReferralCodeSummaryDrawer
        open={codeSummaryDrawerOpen}
        onClose={() => setCodeSummaryDrawerOpen(false)}
        rows={summary.codeSummaryAll}
      />
    </div>
  );
});

ReferralReport.displayName = "ReferralReport";
