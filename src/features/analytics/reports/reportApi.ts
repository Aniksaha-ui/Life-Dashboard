// Report API - Mock data fetching with simulated latency
import { useQuery } from "@tanstack/react-query";
import { getReportConfig } from "./reportRegistry";
import type { ReportSection } from "./reportRegistry";

export interface ReportFilters {
  from: string;
  to: string;
  // New filters
  storeId?: string;
  merchantId?: string;
  sector?: string;
  year?: number;
  trendType?: string;
  question?: string;
  bank?: string;
  revenueType?: string;
  kam?: string;
  errorDescription?: string;
  month?: string;
  segment?: string;
  trackerId?: string;
  status?: string;
  bulkUpload?: boolean;
  segmentName?: string;
  tz?: string;
  type?: string;
  filterValue?: string;
}

export interface ReportData {
  reportId: string;
  title: string;
  description: string;
  aboutText: string;
  docsUrl: string;
  sections: ReportSection[];
  generatedAt: string;
  filters: ReportFilters;
}

// Simulate API latency (1200ms to 2500ms)
const simulateLatency = (): Promise<void> => {
  const delay = 1200 + Math.random() * 1300; // Random delay between 1.2s and 2.5s
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Mock API function to fetch report data
export const fetchReportData = async (
  reportId: string,
  filters: ReportFilters,
): Promise<ReportData> => {
  // Simulate network latency
  await simulateLatency();

  const config = getReportConfig(reportId);

  if (!config) {
    throw new Error(`Report not found: ${reportId}`);
  }

  // Return report data with applied filters
  return {
    reportId: config.reportId,
    title: config.title,
    description: config.description,
    aboutText: config.aboutText,
    docsUrl: config.docsUrl,
    sections: config.sections,
    generatedAt: new Date().toISOString(),
    filters,
  };
};

// React Query hook for fetching report data
export const useReportData = (reportId: string, filters: ReportFilters) => {
  return useQuery({
    queryKey: ["report", reportId, filters],
    queryFn: () => fetchReportData(reportId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
  });
};

// Get default date range (All Time, or report-specific defaults)
export const getDefaultFilters = (reportId?: string): ReportFilters => {
  if (
    reportId === "merchant-comparison" ||
    reportId === "kam-comparison" ||
    reportId === "sector-comparison"
  ) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    return {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  }

  return {
    from: "",
    to: "",
  };
};
