import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import {
  ExternalLink,
  Download,
  History,
  ImageIcon,
  ZoomIn,
  Check,
  FileUp,
  XCircle,
  Plus,
  Eye,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { CopyButton } from "../../components/CopyButton";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import { api } from "../../lib/api/client";
import { ReasonCard } from "./components/ReasonCard";
import {
  formatResellerDate,
  formatResellerDateTimeLabel,
  formatResellerDateTime,
} from "./utils/resellerDateFormat";
import { SAMPLE_PDF_PREVIEW_URL } from "./data/opResellersData";
import type { OpResellerDocument } from "./types/opReseller";
import {
  getPortalDrawerTitle,
  PortalResellerActionButtons,
  PortalResellerActionForm,
  type PortalDrawerView,
} from "./components/PortalResellerDrawerActions";
import type { RaResellerApprovalStatus } from "./types/raReseller";
import { getRaResellerStatusBadgeClass } from "./utils/raResellerStatus";

const InfoDetailRow = ({
  label,
  value,
  multiline,
  valueClassName,
  compact,
}: {
  label: string;
  value?: React.ReactNode;
  multiline?: boolean;
  valueClassName?: string;
  compact?: boolean;
}) => (
  <div
    className={clsx(
      "flex flex-col sm:flex-row py-2 text-sm",
      multiline ? "sm:items-start items-start" : "sm:items-center",
    )}
  >
    <span
      className={clsx(
        "w-full text-slate-500 font-semibold uppercase tracking-tight text-[11px] shrink-0",
        compact ? "sm:w-[130px]" : "sm:w-[240px]",
      )}
    >
      {label}
    </span>
    <div
      className={clsx(
        "w-full sm:flex-1 text-slate-900 leading-snug break-words",
        valueClassName,
      )}
    >
      {value ?? "—"}
    </div>
  </div>
);

function getPdfPreviewSrc(document: OpResellerDocument) {
  return document.thumbnailUrl || SAMPLE_PDF_PREVIEW_URL;
}

function formatDocumentDateTime(value?: string) {
  if (!value) return null;
  return formatResellerDateTime(value);
}

function DocumentDateLine({ label, value }: { label: string; value?: string }) {
  const formatted = formatDocumentDateTime(value);
  if (!formatted) return null;

  return (
    <p>
      <span className="font-semibold text-slate-700 text-[10px]">{label}:</span>{" "}
      <span className="text-xs text-slate-600">{formatted.datePart}</span>
      <span className="text-[10px] text-slate-600">
        {" "}
        · {formatted.timePart}
      </span>
    </p>
  );
}

function DocumentDateCell({ document }: { document: OpResellerDocument }) {
  if (!document.uploadedAt) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const actionLabel =
    document.status === "Accepted"
      ? "Acc"
      : document.status === "Rejected"
        ? "Rej"
        : null;

  return (
    <div className="space-y-1 leading-snug">
      <DocumentDateLine label="Upload" value={document.uploadedAt} />
      {actionLabel && document.actionedAt && (
        <DocumentDateLine label={actionLabel} value={document.actionedAt} />
      )}
    </div>
  );
}

function DocumentThumbnail({
  document,
  onClick,
}: {
  document: OpResellerDocument;
  onClick?: () => void;
}) {
  if (document.status === "Missing") {
    return (
      <div className="w-11 h-11 rounded-md border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
        <ImageIcon className="w-4 h-4 text-slate-300" />
      </div>
    );
  }

  if (document.fileType === "image" && document.thumbnailUrl) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        title="Click to view larger image"
        aria-label={`View ${document.name} larger`}
        className="group relative w-11 h-11 rounded-md border border-slate-200 overflow-hidden bg-slate-50 shrink-0 cursor-pointer hover:border-primary-300 hover:ring-2 hover:ring-primary-100 transition-all"
      >
        <img
          src={document.thumbnailUrl}
          alt={document.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded bg-slate-900/60 text-white pointer-events-none">
          <ZoomIn className="w-2.5 h-2.5" />
        </span>
      </button>
    );
  }

  const previewSrc = `${getPdfPreviewSrc(document)}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title="Click to view full PDF"
      aria-label={`View ${document.name} full size`}
      className="group relative w-11 h-11 rounded-md border border-slate-200 overflow-hidden bg-white shrink-0 cursor-pointer hover:border-primary-300 hover:ring-2 hover:ring-primary-100 transition-all"
    >
      <iframe
        src={previewSrc}
        title={`${document.name} preview`}
        className="pointer-events-none absolute top-0 left-0 border-0 bg-white"
        style={{
          width: "220%",
          height: "220%",
          transform: "scale(0.45)",
          transformOrigin: "top left",
        }}
      />
      <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded bg-slate-900/60 text-white pointer-events-none">
        <ZoomIn className="w-2.5 h-2.5" />
      </span>
    </button>
  );
}

function getDocumentLogVisual(action: string) {
  switch (action) {
    case "Accepted":
      return {
        Icon: Check,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      };
    case "Rejected":
      return {
        Icon: XCircle,
        color: "text-rose-600 bg-rose-50 border-rose-100",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-100",
      };
    case "Uploaded":
      return {
        Icon: FileUp,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
      };
    default:
      return {
        Icon: History,
        color: "text-slate-600 bg-slate-50 border-slate-100",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
      };
  }
}

interface CommissionStoreSummary {
  id: string;
  storeName: string;
  txnCount: number;
  amount: number;
  rate: string;
  commission: number;
  vat: number;
  tax: number;
  netPayable: number;
  remarks: string;
}

const SAMPLE_STORES_DATA: CommissionStoreSummary[] = [
  {
    id: "store-1",
    storeName: "shaplapurhsbdeducationlive",
    txnCount: 663,
    amount: 761491.93,
    rate: "0.20%",
    commission: 1522.98,
    vat: 198.65,
    tax: 132.43,
    netPayable: 1191.9,
    remarks: "—",
  },
  {
    id: "store-2",
    storeName: "brightmartbdlive",
    txnCount: 420,
    amount: 485200.5,
    rate: "0.20%",
    commission: 970.4,
    vat: 126.57,
    tax: 84.38,
    netPayable: 759.45,
    remarks: "—",
  },
  {
    id: "store-3",
    storeName: "urbanthreadsbdlive",
    txnCount: 312,
    amount: 320150.0,
    rate: "0.25%",
    commission: 800.38,
    vat: 104.4,
    tax: 69.6,
    netPayable: 626.38,
    remarks: "—",
  },
  {
    id: "store-4",
    storeName: "quickcartexpresslive",
    txnCount: 289,
    amount: 295400.0,
    rate: "0.20%",
    commission: 590.8,
    vat: 77.06,
    tax: 51.37,
    netPayable: 462.37,
    remarks: "—",
  },
  {
    id: "store-5",
    storeName: "coastaltraderslive",
    txnCount: 195,
    amount: 210800.0,
    rate: "0.20%",
    commission: 421.6,
    vat: 54.99,
    tax: 36.66,
    netPayable: 329.95,
    remarks: "—",
  },
  {
    id: "store-6",
    storeName: "novaelectronicslive",
    txnCount: 178,
    amount: 198500.0,
    rate: "0.30%",
    commission: 595.5,
    vat: 77.67,
    tax: 51.78,
    netPayable: 466.05,
    remarks: "—",
  },
  {
    id: "store-7",
    storeName: "greenfieldgrocerslive",
    txnCount: 145,
    amount: 154200.0,
    rate: "0.20%",
    commission: 308.4,
    vat: 40.23,
    tax: 26.82,
    netPayable: 241.35,
    remarks: "—",
  },
  {
    id: "store-8",
    storeName: "metrofashionhouselive",
    txnCount: 110,
    amount: 125000.0,
    rate: "0.20%",
    commission: 250.0,
    vat: 32.61,
    tax: 21.74,
    netPayable: 195.65,
    remarks: "—",
  },
];

const STORES_PER_PAGE = 5;

const TABS = [
  { id: "information", label: "Information" },
  { id: "commission", label: "Commission Configuration" },
  { id: "statement", label: "Commission Statement" },
] as const;

const AVAILABLE_CHANNELS = [
  {
    id: "bkash",
    paymentChannel: "bKash",
    paymentMode: "Mobile Financial Services (MFS)",
  },
  {
    id: "nagad-rocket",
    paymentChannel: "Nagad, Rocket",
    paymentMode: "Mobile Financial Services (MFS)",
  },
  {
    id: "cards",
    paymentChannel: "Visa, Mastercard, UnionPay, Nexus",
    paymentMode: "Debit/Credit Card (Local & International)",
  },
  {
    id: "amex",
    paymentChannel: "Amex",
    paymentMode: "Debit/Credit Card (International)",
  },
  {
    id: "qcash",
    paymentChannel: "Q-Cash",
    paymentMode: "Debit/Credit Card (Local)",
  },
  {
    id: "internet-banking",
    paymentChannel: "City Touch, AB Direct, Bank Asia, MTB, IBBL",
    paymentMode: "Internet Banking",
  },
  {
    id: "wallet",
    paymentChannel: "iPay, Upay, Dmoney",
    paymentMode: "Wallet",
  },
];

type TabId = (typeof TABS)[number]["id"];

export function RaResellerDetailDrawer() {
  const { resellerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<PortalDrawerView>("details");
  const [remarks, setRemarks] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("information");
  const [storePage, setStorePage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<OpResellerDocument | null>(null);
  const [logDoc, setLogDoc] = useState<OpResellerDocument | null>(null);
  const [stores, setStores] =
    useState<CommissionStoreSummary[]>(SAMPLE_STORES_DATA);
  const [editingRemarksStore, setEditingRemarksStore] =
    useState<CommissionStoreSummary | null>(null);
  const [tempRemarksText, setTempRemarksText] = useState("");

  const { data: reseller, isLoading } = useQuery({
    queryKey: ["ra-reseller", resellerId],
    queryFn: () => api.raResellers.get(resellerId!),
    enabled: !!resellerId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      status,
      rejectedReason,
    }: {
      status: RaResellerApprovalStatus;
      rejectedReason?: string;
    }) => api.raResellers.updateStatus(resellerId!, status, rejectedReason),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["ra-resellers-list"] });
      queryClient.invalidateQueries({ queryKey: ["ra-reseller", resellerId] });
      toast.success(
        updated?.approvalStatus === "Approved"
          ? "Settlement request approved successfully"
          : "Settlement request cancelled successfully",
      );
      setView("details");
      setRemarks("");
    },
  });

  const totalStorePages = Math.max(
    1,
    Math.ceil(stores.length / STORES_PER_PAGE),
  );

  const pagedStores = useMemo(() => {
    const start = (storePage - 1) * STORES_PER_PAGE;
    return stores.slice(start, start + STORES_PER_PAGE);
  }, [stores, storePage]);

  const totalStoreTxns = useMemo(
    () => stores.reduce((acc, item) => acc + item.txnCount, 0),
    [stores],
  );
  const totalStoreAmount = useMemo(
    () => stores.reduce((acc, item) => acc + item.amount, 0),
    [stores],
  );
  const totalStoreCommission = useMemo(
    () => stores.reduce((acc, item) => acc + item.commission, 0),
    [stores],
  );
  const totalStoreVat = useMemo(
    () => stores.reduce((acc, item) => acc + item.vat, 0),
    [stores],
  );
  const totalStoreTax = useMemo(
    () => stores.reduce((acc, item) => acc + item.tax, 0),
    [stores],
  );
  const totalStoreNetPayable = useMemo(
    () => stores.reduce((acc, item) => acc + item.netPayable, 0),
    [stores],
  );

  const configuredCycle = useMemo(() => {
    return (
      localStorage.getItem(`commission_cycle_${resellerId}`) ||
      "Weekly (7 days)"
    );
  }, [resellerId]);

  const configuredRows = useMemo(() => {
    const stored = localStorage.getItem(`commission_rows_${resellerId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback seed rows
    return [
      {
        uuid: "1",
        channelId: "bkash",
        merchantShare: "1.50",
        sslShare: "0.30",
        affiliateShare: "0.20",
      },
      {
        uuid: "2",
        channelId: "cards",
        merchantShare: "2.00",
        sslShare: "0.50",
        affiliateShare: "0.30",
      },
      {
        uuid: "3",
        channelId: "nagad-rocket",
        merchantShare: "1.20",
        sslShare: "0.30",
        affiliateShare: "0.10",
      },
    ];
  }, [resellerId]);

  useEffect(() => {
    setView("details");
    setRemarks("");
    setActiveTab("information");
    setStorePage(1);
    setPreviewDoc(null);
    setLogDoc(null);
    setStores(SAMPLE_STORES_DATA);
    setEditingRemarksStore(null);
    setTempRemarksText("");
  }, [resellerId]);

  const onClose = () => {
    navigate("/resellers/ra-list");
  };

  const handleBack = () => {
    setView("details");
    setRemarks("");
  };

  const canReview = reseller?.approvalStatus === "Pending";

  const handleSubmit = () => {
    if (!remarks.trim()) return;
    updateStatusMutation.mutate({
      status: view === "proceed" ? "Approved" : "Rejected",
      rejectedReason: view === "cancel" ? remarks.trim() : undefined,
    });
  };

  const handleExportStatementCSV = () => {
    if (!reseller) return;
    const rows = [
      ["Reseller Name", reseller.name],
      ["Reseller ID", reseller.resellerId],
      ["Statement Period", "01 Jun 2026 - 30 Jun 2026"],
      [],
      ["Store Wise Commission Summary"],
      [
        "Store Name",
        "Number of Transactions",
        "Amount (BDT)",
        "Commission Rate",
        "Reseller Commission Amount",
        "15% VAT (*15/115)",
        "10% TAX",
        "Net Payable",
        "Remarks",
      ],
      ...SAMPLE_STORES_DATA.map((s) => [
        s.storeName,
        String(s.txnCount),
        s.amount.toFixed(2),
        s.rate,
        s.commission.toFixed(2),
        s.vat.toFixed(2),
        s.tax.toFixed(2),
        s.netPayable.toFixed(2),
        s.remarks,
      ]),
      [
        "Total",
        String(totalStoreTxns),
        totalStoreAmount.toFixed(2),
        "",
        totalStoreCommission.toFixed(2),
        totalStoreVat.toFixed(2),
        totalStoreTax.toFixed(2),
        totalStoreNetPayable.toFixed(2),
        "",
      ],
      [],
      ["Payment Channel Breakdown"],
      [
        "Card / Channel Type",
        "No of Transactions",
        "Amount (BDT)",
        "Reseller Payable",
        "15% VAT",
        "10% TAX",
        "Net Payable Amount",
      ],
      ["BKASH-BKash", "61", "76938.79", "384.71", "50.18", "33.45", "301.08"],
      ["NAGAD-Nagad", "17", "20693.88", "103.47", "13.50", "9.00", "80.97"],
      [
        "DBBLMOBILEB-Dutch Bangla",
        "5",
        "6428.57",
        "32.14",
        "4.19",
        "2.80",
        "25.15",
      ],
      ["Total", "83", "104061.24", "520.32", "67.87", "45.25", "407.20"],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `commission_statement_${reseller.resellerId}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !reseller) {
    return (
      <Drawer
        open={true}
        onClose={onClose}
        title="Reseller Details"
        width="3xl"
      >
        <div className="p-8 text-center text-slate-500">
          Loading reseller details...
        </div>
      </Drawer>
    );
  }

  const detailsTitle = (
    <div className="space-y-1">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        {reseller.sector}
      </span>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-lg font-semibold text-slate-900">
          {reseller.name}
        </span>
        <span className="text-sm text-slate-500">
          ID: {reseller.resellerId}
        </span>
        <span
          className={getRaResellerStatusBadgeClass(reseller.approvalStatus)}
        >
          Status: {reseller.approvalStatus}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
          {reseller.settlementPeriod}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Drawer
        open={true}
        onClose={onClose}
        title={getPortalDrawerTitle(view, {
          details: detailsTitle,
          proceed: "Approve Settlement Request",
          cancel: "Reject Settlement Request",
        })}
        width="5xl"
      >
        {view === "details" ? (
          <>
            <div className="border-b border-slate-200 flex gap-6 overflow-x-auto -mt-2 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer",
                    activeTab === tab.id
                      ? "border-primary-600 text-primary-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "information" && (
              <div className="space-y-6 pb-8">
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Reseller Information
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100">
                        <InfoDetailRow
                          compact
                          label="Email"
                          value={reseller.email}
                        />
                        <InfoDetailRow
                          compact
                          label="Mobile"
                          value={reseller.phone}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100">
                        <InfoDetailRow
                          compact
                          label="Website"
                          value={
                            <a
                              href={reseller.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
                            >
                              {reseller.website}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          }
                        />
                        <InfoDetailRow
                          compact
                          label="Onboarding Date"
                          value={formatResellerDate(reseller.onboardingDate)}
                        />
                      </div>

                      <div className="border-b border-slate-100">
                        <InfoDetailRow
                          compact
                          label="Address"
                          value={reseller.address}
                          multiline
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100">
                        <InfoDetailRow
                          compact
                          label="POC Name"
                          value={reseller.pocName}
                        />
                        <InfoDetailRow
                          compact
                          label="POC Email"
                          value={reseller.pocEmail}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100">
                        <InfoDetailRow
                          compact
                          label="POC Mobile"
                          value={reseller.pocPhone}
                        />
                        <InfoDetailRow
                          compact
                          label="Requested By"
                          value={reseller.requestedBy}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <InfoDetailRow
                          compact
                          label="Requested On"
                          value={formatResellerDateTimeLabel(
                            reseller.requestedOn,
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Settlement Details
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100">
                        <InfoDetailRow
                          compact
                          label="Bank Name"
                          value={reseller.bankName}
                        />
                        <InfoDetailRow
                          compact
                          label="Account Name"
                          value={reseller.accountName}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100">
                        <InfoDetailRow
                          compact
                          label="Account Number"
                          value={reseller.accountNumber}
                        />
                        <InfoDetailRow
                          compact
                          label="Routing Number"
                          value={reseller.routingNumber}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <InfoDetailRow
                          compact
                          label="Settlement Period"
                          value={reseller.settlementPeriod}
                        />
                        <InfoDetailRow
                          compact
                          label="Approval Status"
                          value={
                            <span
                              className={getRaResellerStatusBadgeClass(
                                reseller.approvalStatus,
                              )}
                            >
                              {reseller.approvalStatus}
                            </span>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <ReasonCard
                  title="Pending Reason"
                  reason={reseller.pendingReason}
                />
                <ReasonCard
                  title="Rejected Reason"
                  reason={reseller.rejectedReason}
                />

                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Uploaded Documents
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                        <tr>
                          <th className="px-4 py-3">Document</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reseller.documents.map((document) => (
                          <tr
                            key={document.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <DocumentThumbnail
                                  document={document}
                                  onClick={() => setPreviewDoc(document)}
                                />
                                <div className="min-w-0">
                                  {document.status !== "Missing" ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewDoc(document);
                                      }}
                                      className="text-sm text-slate-800 block truncate text-left hover:text-primary-600 hover:underline"
                                    >
                                      {document.name}
                                    </button>
                                  ) : (
                                    <span className="text-sm text-slate-800 block truncate">
                                      {document.name}
                                    </span>
                                  )}
                                  {document.status === "Accepted" ? (
                                    <span className="mt-1 px-2 py-0.5 rounded-full text-xs font-medium inline-flex bg-emerald-50 text-emerald-600">
                                      Accepted
                                    </span>
                                  ) : document.status === "Rejected" ? (
                                    <div className="mt-1 space-y-1 max-w-[240px]">
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium inline-flex bg-rose-50 text-rose-600">
                                        Rejected
                                      </span>
                                      {document.rejectedReason && (
                                        <p className="text-[11px] text-slate-500 leading-snug">
                                          <span className="font-semibold text-slate-600">
                                            Reason:
                                          </span>{" "}
                                          {document.rejectedReason}
                                        </p>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <DocumentDateCell document={document} />
                            </td>
                            <td className="px-4 py-3">
                              {document.status === "Missing" ? (
                                <span className="text-xs text-slate-400">
                                  —
                                </span>
                              ) : (
                                <div className="flex items-center gap-3 whitespace-nowrap">
                                  <UITooltip content="History">
                                    <button
                                      type="button"
                                      onClick={() => setLogDoc(document)}
                                      className="flex flex-col items-center gap-0 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors group-disabled:hover:bg-transparent group-disabled:group-hover:text-slate-400">
                                        <History className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors group-disabled:group-hover:text-slate-500">
                                        History
                                      </span>
                                    </button>
                                  </UITooltip>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "commission" && (
              <div className="space-y-6 pb-8">
                <section>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Commission Configuration
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Settlement Cycle:
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full">
                        {configuredCycle}
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-100 shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                          <tr>
                            <th className="px-4 py-3">Payment Channel</th>
                            <th className="px-4 py-3 text-right">
                              Merchant Share
                            </th>
                            <th className="px-4 py-3 text-right">SSL Share</th>
                            <th className="px-4 py-3 text-right">
                              Affiliate Share
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {configuredRows.map((row) => {
                            const channel = AVAILABLE_CHANNELS.find(
                              (c) => c.id === row.channelId,
                            );
                            return (
                              <tr
                                key={row.uuid}
                                className="hover:bg-slate-50/50"
                              >
                                <td className="px-4 py-3.5 font-medium text-slate-800">
                                  {channel?.paymentChannel ||
                                    row.channelId ||
                                    "Unknown Channel"}
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                                  {row.merchantShare}%
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                                  {row.sslShare}%
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                                  {row.affiliateShare}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "statement" && (
              <div className="space-y-6 pb-8">
                {/* Period & Summary Header Banner */}
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">
                        Commission & Settlement Statement
                      </h3>
                      <p className="text-xs text-slate-500">
                        Statement Period:{" "}
                        <span className="font-semibold text-slate-700">
                          01 Jun 2026 – 30 Jun 2026
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportStatementCSV}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      Export Statement CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block mb-0.5">
                        Total Txns
                      </span>
                      <span className="text-sm font-bold text-slate-900 block">
                        {totalStoreTxns + 83}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block mb-0.5">
                        Processed Volume
                      </span>
                      <span className="text-sm font-bold text-slate-900 block">
                        ৳{" "}
                        {(totalStoreAmount + 104061.24).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block mb-0.5">
                        Net Payable
                      </span>
                      <span className="text-sm font-bold text-slate-900 block">
                        ৳{" "}
                        {(totalStoreNetPayable + 407.2).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table 1: Store Wise Commission Summary */}
                <section className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>Store Wise Commission Summary</span>
                    <span className="text-xs font-normal text-slate-500">
                      {SAMPLE_STORES_DATA.length} Stores
                    </span>
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
                    <table className="w-full text-left border-collapse text-xs table-fixed">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="px-2.5 py-3 w-[18%]">Store Name</th>
                          <th className="px-2 py-3 text-right w-[9%]">
                            No. of Txns
                          </th>
                          <th className="px-2.5 py-3 text-right w-[13%]">
                            Amount (BDT)
                          </th>
                          <th className="px-2 py-3 text-center w-[9%]">
                            Comm. Rate
                          </th>
                          <th className="px-2.5 py-3 text-right w-[13%]">
                            Commission
                          </th>
                          <th className="px-2 py-3 text-right w-[10%]">
                            15% VAT
                          </th>
                          <th className="px-2 py-3 text-right w-[10%]">
                            10% TAX
                          </th>
                          <th className="px-2.5 py-3 text-right w-[13%]">
                            Net Payable
                          </th>
                          <th className="px-2.5 py-3 w-[15%]">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                        {pagedStores.map((store) => {
                          const words = store.remarks
                            .split(/\s+/)
                            .filter(Boolean);
                          const hasMoreThanTwoWords = words.length > 2;
                          const displayRemarks = hasMoreThanTwoWords
                            ? `${words.slice(0, 2).join(" ")}...`
                            : store.remarks;

                          return (
                            <tr
                              key={store.id}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td
                                className="px-2.5 py-3 font-mono font-normal text-slate-700 truncate"
                                title={store.storeName}
                              >
                                {store.storeName}
                              </td>
                              <td className="px-2 py-3 text-right font-mono font-normal text-slate-700">
                                {store.txnCount}
                              </td>
                              <td className="px-2.5 py-3 text-right font-mono font-normal text-slate-700">
                                {store.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2 py-3 text-center">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px]">
                                  {store.rate}
                                </span>
                              </td>
                              <td className="px-2.5 py-3 text-right font-mono font-normal text-slate-700">
                                {store.commission.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2 py-3 text-right font-mono font-normal text-slate-700">
                                {store.vat.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2 py-3 text-right font-mono font-normal text-slate-700">
                                {store.tax.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2.5 py-3 text-right font-mono font-normal text-slate-700">
                                {store.netPayable.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-2.5 py-2">
                                {store.remarks === "—" ? (
                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRemarksStore(store);
                                        setTempRemarksText("");
                                      }}
                                      className="p-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                                      title="Add Remarks"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    className="text-xs text-slate-700 truncate block cursor-pointer hover:text-primary-600 font-medium"
                                    onClick={() => {
                                      setEditingRemarksStore(store);
                                      setTempRemarksText(store.remarks);
                                    }}
                                    title="Click to view/edit remarks"
                                  >
                                    {displayRemarks}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50/90 border-t border-slate-200 text-slate-900 font-bold text-xs">
                        <tr>
                          <td className="px-2.5 py-2.5 truncate">
                            Total Summary
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            {totalStoreTxns}
                          </td>
                          <td className="px-2.5 py-2.5 text-right font-mono">
                            {totalStoreAmount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-2 py-2.5 text-center">—</td>
                          <td className="px-2.5 py-2.5 text-right font-mono">
                            {totalStoreCommission.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            {totalStoreVat.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-2 py-2.5 text-right font-mono">
                            {totalStoreTax.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-2.5 py-2.5 text-right font-mono text-slate-900 animate-fade-in">
                            {totalStoreNetPayable.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-2.5 py-2.5"></td>
                        </tr>
                      </tfoot>
                    </table>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
                      <p className="text-xs text-slate-500">
                        {(() => {
                          const total = SAMPLE_STORES_DATA.length;
                          if (total === 0) return "Showing 0 to 0 of 0 entries";
                          const from = (storePage - 1) * STORES_PER_PAGE + 1;
                          const to = Math.min(
                            storePage * STORES_PER_PAGE,
                            total,
                          );
                          return `Showing ${from} to ${to} of ${total} entries`;
                        })()}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer text-slate-600"
                          onClick={() =>
                            setStorePage((page) => Math.max(1, page - 1))
                          }
                          disabled={
                            storePage === 1 || SAMPLE_STORES_DATA.length === 0
                          }
                        >
                          Previous
                        </button>
                        <span className="text-xs font-semibold text-slate-600 select-none">
                          Page {storePage} of {totalStorePages}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
                          onClick={() =>
                            setStorePage((page) =>
                              Math.min(totalStorePages, page + 1),
                            )
                          }
                          disabled={
                            storePage === totalStorePages ||
                            SAMPLE_STORES_DATA.length === 0
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Table 2: Payment Channel Breakdown */}
                <section className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>Payment Channel Breakdown</span>
                    <span className="text-xs font-normal text-slate-500">
                      3 Channels
                    </span>
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="px-4 py-3">Card / Channel Type</th>
                          <th className="px-4 py-3 text-right">No. of Txns</th>
                          <th className="px-4 py-3 text-right">Amount (BDT)</th>
                          <th className="px-4 py-3 text-right">
                            Reseller Payable (BDT)
                          </th>
                          <th className="px-3 py-3 text-right">15% VAT</th>
                          <th className="px-3 py-3 text-right">10% TAX</th>
                          <th className="px-4 py-3 text-right">
                            Net Payable (BDT)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-normal text-slate-700">
                            BKASH - BKash
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            61
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            76,938.79
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            384.71
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-normal text-slate-700">
                            50.18
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-normal text-slate-700">
                            33.45
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            301.08
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-normal text-slate-700">
                            NAGAD - Nagad
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            17
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            20,693.88
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            103.47
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-normal text-slate-700">
                            13.50
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-normal text-slate-700">
                            9.00
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            80.97
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-normal text-slate-700">
                            DBBLMOBILEB - Dutch Bangla
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            5
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            6,428.57
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            32.14
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-normal text-slate-700">
                            4.19
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-normal text-slate-700">
                            2.80
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-normal text-slate-700">
                            25.15
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-slate-50/90 border-t border-slate-200 text-slate-900 font-bold text-xs">
                        <tr>
                          <td className="px-4 py-2.5">Total Channel Summary</td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            83
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            104,061.24
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono">
                            520.32
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            67.87
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            45.25
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-slate-900">
                            407.20
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>

                {canReview && (
                  <PortalResellerActionButtons
                    onProceed={() => setView("proceed")}
                    onCancel={() => setView("cancel")}
                    proceedLabel="Approve"
                    cancelLabel="Reject"
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <PortalResellerActionForm
            view={view}
            remarks={remarks}
            onRemarksChange={setRemarks}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={updateStatusMutation.isPending}
            proceedSubmitLabel="Submit Approval"
            cancelSubmitLabel="Submit Rejection"
          />
        )}
      </Drawer>

      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name || "Document Preview"}
        size="5xl"
      >
        {previewDoc?.fileType === "image" && (
          <div className="w-full max-h-[80vh] rounded-lg border border-slate-200 overflow-auto bg-slate-100 p-3">
            <img
              src={previewDoc.fileUrl || previewDoc.thumbnailUrl}
              alt={previewDoc.name}
              className="block mx-auto w-full max-w-full h-auto object-contain"
            />
          </div>
        )}
        {previewDoc?.fileType === "pdf" && (
          <div className="w-full h-[75vh] rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
            <iframe
              src={`${getPdfPreviewSrc(previewDoc)}#toolbar=1&navpanes=0`}
              title={previewDoc.name}
              className="w-full h-full border-0 bg-white"
            />
          </div>
        )}
      </Modal>

      <Drawer
        open={!!logDoc}
        onClose={() => setLogDoc(null)}
        title="History"
        subtitle={logDoc?.name}
        width="lg"
      >
        {logDoc && (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                <History className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Document History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload, accept, and reject events for this document
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-6">
                {(logDoc.logs?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-500 py-4 pl-14">
                    No history events to display.
                  </p>
                ) : (
                  logDoc.logs.map((log) => {
                    const { Icon, color, badgeClass } = getDocumentLogVisual(
                      log.action,
                    );
                    const { datePart, timePart } = formatResellerDateTime(
                      log.performedAt,
                    );
                    return (
                      <div key={log.id} className="relative flex gap-4 pl-0">
                        <div
                          className={clsx(
                            "relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0",
                            color,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                              {datePart}
                              <span className="normal-case tracking-normal font-semibold text-[10px]">
                                {" "}
                                · {timePart}
                              </span>
                            </span>
                            <span
                              className={clsx(
                                "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                                badgeClass,
                              )}
                            >
                              {log.action}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {log.action}
                          </p>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {log.remarks}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-2">
                            By{" "}
                            <span className="font-medium text-slate-500">
                              {log.performedBy}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        isOpen={!!editingRemarksStore}
        onClose={() => setEditingRemarksStore(null)}
        title={`Remarks for ${editingRemarksStore?.storeName}`}
        size="md"
        footer={
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                if (editingRemarksStore) {
                  const newVal = tempRemarksText.trim() || "—";
                  setStores((prev) =>
                    prev.map((s) =>
                      s.id === editingRemarksStore.id
                        ? { ...s, remarks: newVal }
                        : s,
                    ),
                  );
                  setEditingRemarksStore(null);
                  toast.success("Remarks updated successfully");
                }
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm cursor-pointer"
            >
              Update Remarks
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-1">
          <label className="block text-xs font-semibold text-slate-700">
            Remarks
          </label>
          <textarea
            value={tempRemarksText}
            onChange={(e) => setTempRemarksText(e.target.value)}
            placeholder="Enter remarks for this store..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-slate-400"
          />
        </div>
      </Modal>
    </>
  );
}
