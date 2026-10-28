import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import {
  History,
  ImageIcon,
  ZoomIn,
  Check,
  CircleCheck,
  FileUp,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CopyButton } from "../../components/CopyButton";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import { api } from "../../lib/api/client";
import { SAMPLE_PDF_PREVIEW_URL } from "./data/opResellersData";
import type { OpResellerDocument } from "./types/opReseller";
import { getKamResellerStatusBadgeClass } from "./utils/kamResellerStatus";
import { ReasonCard } from "./components/ReasonCard";
import {
  formatResellerDate,
  formatResellerDateTime,
} from "./utils/resellerDateFormat";

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
        compact ? "sm:w-[120px]" : "sm:w-[240px]",
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

const MERCHANTS_PER_PAGE = 5;

const TABS = [
  { id: "information", label: "Information" },
  { id: "merchants", label: "Merchants" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function KamResellerDetailDrawer() {
  const { resellerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("information");
  const [merchantPage, setMerchantPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<OpResellerDocument | null>(null);
  const [logDoc, setLogDoc] = useState<OpResellerDocument | null>(null);

  const { data: reseller, isLoading } = useQuery({
    queryKey: ["kam-reseller", resellerId],
    queryFn: () => api.kamResellers.get(resellerId!),
    enabled: !!resellerId,
  });

  const merchants = reseller?.merchants ?? [];
  const totalMerchantPages = Math.max(
    1,
    Math.ceil(merchants.length / MERCHANTS_PER_PAGE),
  );

  const pagedMerchants = useMemo(() => {
    const start = (merchantPage - 1) * MERCHANTS_PER_PAGE;
    return merchants.slice(start, start + MERCHANTS_PER_PAGE);
  }, [merchants, merchantPage]);

  useEffect(() => {
    setMerchantPage(1);
    setActiveTab("information");
    setPreviewDoc(null);
    setLogDoc(null);
  }, [resellerId]);

  useEffect(() => {
    if (merchantPage > totalMerchantPages) {
      setMerchantPage(totalMerchantPages);
    }
  }, [merchantPage, totalMerchantPages]);

  const onClose = () => {
    navigate("/resellers/kam-list");
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

  const customTitle = (
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
        <span className={getKamResellerStatusBadgeClass(reseller.status)}>
          {reseller.status}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Drawer open={true} onClose={onClose} title={customTitle} width="3xl">
        <div className="border-b border-slate-200 flex gap-6 overflow-x-auto -mt-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pb-8">
          {activeTab === "information" && (
            <div className="space-y-6">
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
                            className="text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {reseller.website}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      <InfoDetailRow
                        compact
                        label="POC Mobile"
                        value={reseller.pocPhone}
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
                              <span className="text-xs text-slate-400">—</span>
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

          {activeTab === "merchants" && (
            <section>
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Merchant Name</th>
                      <th className="px-4 py-3">Sector</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Onboarding</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedMerchants.map((merchant, index) => (
                      <tr
                        key={merchant.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {(merchantPage - 1) * MERCHANTS_PER_PAGE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/merchants/profile/${merchant.merchantsPageId}`,
                                );
                              }}
                              className="text-sm font-semibold text-slate-900 hover:text-primary-600 hover:underline leading-tight text-left"
                            >
                              {merchant.name}
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                                {merchant.storeId}
                              </span>
                              <CopyButton value={merchant.storeId} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {merchant.sector}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-700">
                              {merchant.contactName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {merchant.contactEmail}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {merchant.contactPhone}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {formatResellerDate(merchant.onboardingDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={getKamResellerStatusBadgeClass(
                              merchant.status,
                            )}
                          >
                            {merchant.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
                  <p className="text-sm text-slate-500">
                    {(() => {
                      const total = merchants.length;
                      if (total === 0) {
                        return "Showing 0 to 0 of 0 entries";
                      }
                      const from = (merchantPage - 1) * MERCHANTS_PER_PAGE + 1;
                      const to = Math.min(
                        merchantPage * MERCHANTS_PER_PAGE,
                        total,
                      );
                      return `Showing ${from} to ${to} of ${total} entries`;
                    })()}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
                      onClick={() =>
                        setMerchantPage((page) => Math.max(1, page - 1))
                      }
                      disabled={merchantPage === 1 || merchants.length === 0}
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-slate-600 select-none">
                      Page {merchantPage} of {totalMerchantPages}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
                      onClick={() =>
                        setMerchantPage((page) =>
                          Math.min(totalMerchantPages, page + 1),
                        )
                      }
                      disabled={
                        merchantPage === totalMerchantPages ||
                        merchants.length === 0
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
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
    </>
  );
}
