export interface SummaryParams {
  date_preset?: string;
  from_date?: string;
  to_date?: string;
  sector?: string;
  data_type?: "all" | "my";
}

export interface SummaryCardData {
  title: string;
  value: number | null;
  trend_pct: number | null;
}

export interface SectorWiseVolume {
  sector: string;
  trans_amt: number;
  trans_no: number;
  ssl_income: number;
  emi_income: number;
}

export interface MerchantOverview {
  transacting: number;
  non_transacting: number;
  recently_onboarded: number;
  total_merchants?: number;
  enabled_merchants?: number;
  disabled_merchants?: number;
}

export interface TopMerchantItem {
  merchant_id: string;
  merchant_name: string;
  sector: string | null;
  txn_amount: number;
  txn_count: number;
  revenue: number;
  growth_pct: number;
}

export interface TopMerchantsData {
  txn_amount: TopMerchantItem[];
  txn_count: TopMerchantItem[];
  revenue: TopMerchantItem[];
}

export interface ChannelSummaryItem {
  channel: string;
  percentage: number;
  txn_amount: number;
  txn_count: number;
}

export interface ChannelWiseSummaryData {
  txn_amount: ChannelSummaryItem[];
  txn_count: ChannelSummaryItem[];
}

export type SummaryAlertSeverity =
  "critical" | "warning" | "info" | "success" | string;

export interface SummaryAlertNavigate {
  label: string;
  path?: string | null;
}

export interface SummaryAlertItem {
  key: string;
  position: "top" | "bottom" | string;
  severity: SummaryAlertSeverity;
  title: string;
  message: string;
  count: number;
  navigate?: SummaryAlertNavigate;
}

export interface SummaryAlerts {
  visible_count: number;
  total_items: number;
  items: SummaryAlertItem[];
}

export interface SummaryData {
  meta: {
    from: string;
    to: string;
    kam_user_id: string | null;
    sector: string | null;
    prev_from: string;
    prev_to: string;
    period_label: string;
  };
  cards: {
    total_txn_volume: SummaryCardData;
    total_txn_count: SummaryCardData;
    ssl_income: SummaryCardData;
    emi_income: SummaryCardData;
    txn_success_rate: SummaryCardData;
    txn_failed_count: SummaryCardData;
    failed_merchant_count: SummaryCardData;
    chargeback_amount: SummaryCardData;
    escrow_hold: SummaryCardData;
  };
  breakdowns: {
    sector_wise_volume: SectorWiseVolume[];
  };
  merchant_overview: MerchantOverview;
  top_merchants: TopMerchantsData;
  channel_wise_summary: ChannelWiseSummaryData;
  total_tickets: {
    total: number;
    open: number;
  };
  settlements_bounce: {
    count: number;
    bounce_amount: number;
  };
  alerts?: SummaryAlerts;
}

export interface MetricSeriesItem {
  date: string;
  value: number;
}

export interface MetricDetailSectionItem {
  sector: string;
  percentage: number;
  value: number;
}

export interface MetricDetailSection {
  key: string;
  title: string;
  items?: MetricDetailSectionItem[];
  merchant_wise?: any[];
  general?: any[];
}

export interface MetricsDetailData {
  meta: {
    card_key: string;
    from: string;
    to: string;
    kam_user_id: string | null;
    sector: string | null;
    prev_from: string;
    prev_to: string;
    period_label: string;
  };
  title: string;
  value: number;
  trend_pct: number | null;
  series: MetricSeriesItem[];
  sections: MetricDetailSection[];
  extra_metrics?: Record<string, any>;
}

export interface MetricsDetailResponse {
  status: string;
  code: number;
  message: string;
  data: MetricsDetailData;
}

export interface SummaryResponse {
  status: string;
  code: number;
  message: string;
  data: SummaryData;
  errors: any;
  trace_id: string;
}

export interface SectorListData {
  sectors: string[];
}

export interface SectorListResponse {
  status: string;
  code: number;
  message: string;
  data: SectorListData;
  errors: any;
  trace_id: string;
}
