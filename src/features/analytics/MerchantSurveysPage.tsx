import { useState, useMemo } from "react";
import { ChevronRight, Calendar, Download, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { Drawer } from "../../components/Drawer";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { useReportData } from "./reports/reportApi";
import type { ColumnDef } from "@tanstack/react-table";

// --- Types ---
interface MerchantSurveyEntry {
  id: number;
  title: string;
  scheduleStart: string;
  scheduleEnd: string;
  status: string;
  responses?: CompanyResponse[];
}

interface CompanyResponse {
  id: number;
  merchantId: string;
  companyName: string;
  sector: string;
  answers: SurveyAnswers;
}

interface SurveyAnswers {
  referralProgram: string;
  gatewaySatisfaction: number;
  safetyFeeling: number;
  recommendLikely: number;
  kamSupport: number;
  improvements: string;
  businessHelp: string;
  kamName: string;
  businessName: string;
  discovery: string[];
  collectionMethod: string;
}

const filterConfigs: FilterConfig[] = [
  {
    key: "dateRange",
    type: "date-range",
    label: "Schedule Range",
    icon: Calendar,
  },
];

export default function MerchantSurveysPage() {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  // Modal State
  const [selectedSurvey, setSelectedSurvey] =
    useState<MerchantSurveyEntry | null>(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(
    null,
  );

  const { data: reportData } = useReportData("merchant-surveys", {
    from: appliedFilters.dateRange?.from || "",
    to: appliedFilters.dateRange?.to || "",
  });

  const surveyData = useMemo(() => {
    return reportData?.sections[0]?.customData || [];
  }, [reportData]);

  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setAppliedFilters({});
  };

  const columns: ColumnDef<MerchantSurveyEntry>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-slate-500">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="text-sm font-normal text-slate-600">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "scheduleStart",
      header: "Schedule Start",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.scheduleStart}
        </span>
      ),
    },
    {
      accessorKey: "scheduleEnd",
      header: "Schedule End",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.original.scheduleEnd}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={clsx(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
            row.original.status === "Active"
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-100 text-slate-400",
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "responses",
      header: "Responses",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedSurvey(row.original);
            if (row.original.responses && row.original.responses.length > 0) {
              setExpandedCompanyId(row.original.responses[0].id);
            }
          }}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          Details
        </button>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: () => (
        <button className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
          <Download className="w-3 h-3" />
          Download Response
        </button>
      ),
    },
  ];

  const hasUnappliedChanges =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  const renderLikertScale = (
    value: number,
    min: string = "Very Dissatisfied",
    max: string = "Very Satisfied",
  ) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between max-w-sm px-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500">
                {num}
              </span>
              <div
                className={clsx(
                  "w-4 h-4 rounded-full border flex items-center justify-center",
                  value === num
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-300",
                )}
              >
                {value === num && (
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between max-w-sm text-[10px] font-medium text-slate-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const renderSurveyDetails = (company: CompanyResponse) => {
    const { answers } = company;
    return (
      <div className="pt-3 mt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* Q1 */}
          <div className="space-y-4 md:col-span-2">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              Have you heard about the SSLCOMMERZ Referral Program where you can
              earn BDT 500 for every business/merchant you refer?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pl-1">
              {[
                "Yes, and I have already participated",
                "Yes, but I have not participated yet.",
                "Yes, but I need more information.",
                "No, I haven't heard about it",
              ].map((option) => (
                <div key={option} className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                      answers.referralProgram === option
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-300",
                    )}
                  >
                    {answers.referralProgram === option && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Q2-Q5 Likert */}
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                How satisfied are you with our payment gateway service?
              </p>
              {renderLikertScale(answers.gatewaySatisfaction)}
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                How safe do your customers feel safe paying through SSLCOMMERZ?
              </p>
              {renderLikertScale(
                answers.safetyFeeling,
                "Very Unsafe",
                "Very safe",
              )}
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                How likely are you to recommend our service to others?
              </p>
              {renderLikertScale(
                answers.recommendLikely,
                "Very Unlikely",
                "Very Likely",
              )}
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                How satisfied are you with your Key Account Manager's Support?
              </p>
              {renderLikertScale(answers.kamSupport)}
            </div>
          </div>

          {/* Q6 KAM Radio */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              Provide your Key Account Manager's name
            </p>
            <div className="grid grid-cols-2 gap-3 pl-1">
              {[
                "Shubhojit Ghosh",
                "Foyjun Naher Smrity",
                "Md. Parvez",
                "Priya Rani Dey",
                "Mohammad Safayet Hossain",
                "Sadia Rahman",
                "Tamanna Nawsin",
                "Md. Faisal",
                "Nusrat Shirmin",
                "Ananya Sarker",
                "Saifur Rahman",
                "S.M. Sefaat Ahmmad",
                "Md. Samiul Hasan Khan",
                "I Don't Know",
              ].map((name) => (
                <div key={name} className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all flex-shrink-0",
                      answers.kamName === name
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-300",
                    )}
                  >
                    {answers.kamName === name && (
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 line-clamp-1">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Q7 Discovery Checkbox */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              How you know about our service?
            </p>
            <div className="flex flex-wrap gap-6 pl-1">
              {["facebook", "twitter", "Linkedin", "others"].map((platform) => (
                <div key={platform} className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                      answers.discovery.includes(platform)
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-slate-300",
                    )}
                  >
                    {answers.discovery.includes(platform) && (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600 capitalize">
                    {platform}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Q8 Collection Method */}
          <div className="space-y-4 md:col-span-2 border-t border-slate-50 pt-10">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              How can you collect payment?
            </p>
            <div className="flex flex-wrap gap-x-12 gap-y-3 pl-1">
              {["mobile banking", "internet banking", "cards"].map((method) => (
                <div key={method} className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                      answers.collectionMethod === method
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-300",
                    )}
                  >
                    {answers.collectionMethod === method && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600 capitalize">
                    {method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to="/analytics"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          Reports
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-medium">
          Merchant Surveys Report
        </span>
      </nav>

      {/* Main Report Card Wrapper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Filters */}
        <div className="p-6 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                Merchant Surveys Report
              </h1>
              <p className="text-slate-500 text-sm mt-0.5 font-medium italic">
                Monitor and analyze feedback collected from merchant surveys.
              </p>
            </div>
          </div>

          {/* FilterBar Section */}
          <div className="flex items-center gap-3 flex-wrap">
            <FilterBar
              config={filterConfigs}
              filters={localFilters}
              onFilterChange={handleLocalFilterChange}
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
            <ClearAllFiltersButton
              onClick={handleClearFilters}
              filters={localFilters}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="p-6">
          <DataTable
            columns={columns}
            data={surveyData}
            hideToolbarDateFilter={true}
            hideViewColumn={true}
            className="bg-transparent border-none shadow-none"
            rowBorderColor="divide-slate-50"
          />
        </div>
      </div>

      {/* Responses Side Modal */}
      <Drawer
        open={!!selectedSurvey}
        onClose={() => {
          setSelectedSurvey(null);
          setExpandedCompanyId(null);
        }}
        title="Merchant Responses"
        subtitle={selectedSurvey?.title}
        width="4xl"
      >
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
          {selectedSurvey?.responses?.map((resp) => {
            const isExpanded = expandedCompanyId === resp.id;
            return (
              <div
                key={resp.id}
                className={clsx(
                  "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                  isExpanded
                    ? "border-primary-100 shadow-xl shadow-primary-900/5 ring-1 ring-primary-50 p-5"
                    : "border-slate-200 p-5 hover:bg-slate-50 cursor-pointer shadow-sm",
                )}
                onClick={() =>
                  setExpandedCompanyId(isExpanded ? null : resp.id)
                }
              >
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      "mt-1 p-1.5 rounded-md transition-all duration-200",
                      isExpanded
                        ? "bg-slate-100 rotate-90"
                        : "bg-slate-50 group-hover:bg-slate-100",
                    )}
                  >
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>

                  <div className="flex-1 flex flex-col py-0.5 group">
                    <div className="flex mb-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                        {resp.sector}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        "font-medium transition-colors leading-tight text-lg",
                        isExpanded ? "text-primary-900" : "text-slate-900",
                      )}
                    >
                      {resp.companyName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                      {resp.merchantId}
                    </div>
                  </div>
                </div>

                {isExpanded && renderSurveyDetails(resp)}
              </div>
            );
          })}
        </div>
      </Drawer>
    </div>
  );
}
