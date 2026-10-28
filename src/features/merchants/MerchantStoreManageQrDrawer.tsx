import React, { useState, useMemo } from "react";
import { Drawer } from "../../components/Drawer";
import { FilterBar, type FilterConfig } from "../../components/FilterBar";
import {
  Copy,
  Check,
  ArrowLeft,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import logoSslCommerz from "../../assets/logo_ssl_commerz.svg";

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

interface QrEntry {
  id: string;
  paymentName: string;
  domainUrl: string;
  referId: string;
  payType: string;
  createdOn: string;
  paymentUrl: string;
  // Screenshot-driven extra fields (kept optional-ish in UI)
  payButtonName?: string;
  paymentType?: string; // e.g. once
  amountType?: "fixed" | "any";
  amount?: string;
  amountText?: string;
  convenienceFeeEnabled?: boolean;
  convenienceFeePercent?: string;
  productDetails?: string;
  topMessage?: string;
  buttonMessage?: string;
  // Basic page structure (colors + optional logo)
  leftBgColor?: string;
  leftTextColor?: string;
  btnTextColor?: string;
  btnBgColor?: string;
  uploadOfferImageName?: string;
  uploadBannerName?: string;

  // Screenshot-aligned transaction/invoice configuration (optional)
  transactionRefId?: string;
  transactionInfo?: string;
  amountBdt?: string;
  amountList?: string;
  itemOrProductCategory?: string;
  supportCartPay?: boolean;
  currency?: string;
  qrType?: string;
  invoiceRefId?: string;
  invoiceSentByEmail?: string;
  invoiceCcEmail?: string;
  payQrQueryApi?: string;
  billQueryApi?: string;
  ipnUrl?: string;
  mobileNumberSmsRestriction?: string;
  termsAgreementUrl?: string;
  enableTermsAndCondition?: boolean;
  enableInvoiceLogo?: boolean;
  enablePaymentStatus?: boolean;
  enableAmountEditInPay?: boolean;
  invoiceApprovalPage?: boolean;
  enableSplitPayment?: boolean;
  enablePaymentReturn?: boolean;
  invoiceValidity?: string;
  rightTextColor?: string;
  activeLinkColor?: string;

  // Custom Fields Configurations
  [key: string]: any;
}

const CUSTOM_FIELDS_LIST = [
  {
    key: "CustomerName",
    label: "Customer Name",
    defaultPlaceholder: "Enter Name",
    defaultDisplayName: "Name",
  },
  {
    key: "CustomerAddressLine1",
    label: "Customer Address Line 1",
    defaultPlaceholder: "Enter Address",
    defaultDisplayName: "Customer Address Line 1",
  },
  {
    key: "CustomerAddressLine2",
    label: "Customer Address Line 2",
    defaultPlaceholder: "Enter Address",
    defaultDisplayName: "Address Line 2",
  },
  {
    key: "CustomerCity",
    label: "Customer City",
    defaultPlaceholder: "Enter City",
    defaultDisplayName: "City",
  },
  {
    key: "CustomerState",
    label: "Customer State",
    defaultPlaceholder: "Enter State",
    defaultDisplayName: "State",
  },
  {
    key: "CustomerPostcode",
    label: "Customer Postcode",
    defaultPlaceholder: "Enter Post Code",
    defaultDisplayName: "Post Code",
  },
  {
    key: "CustomerCountry",
    label: "Customer Country",
    defaultPlaceholder: "Enter Country",
    defaultDisplayName: "Country",
  },
  {
    key: "CustomerEmail",
    label: "Customer Email",
    defaultPlaceholder: "Enter Email",
    defaultDisplayName: "Email Address",
  },
  {
    key: "CustomerMobile",
    label: "Customer Mobile",
    defaultPlaceholder: "Enter Mobile",
    defaultDisplayName: "Mobile",
  },
  {
    key: "CustomerFax",
    label: "Customer FAX",
    defaultPlaceholder: "Enter FAX",
    defaultDisplayName: "FAX",
  },
  {
    key: "ShipmentName",
    label: "Shipment Name",
    defaultPlaceholder: "Enter Name",
    defaultDisplayName: "Name",
  },
  {
    key: "ShipmentAddress1",
    label: "Shipment Address 1",
    defaultPlaceholder: "Enter Address",
    defaultDisplayName: "Address Line 1",
  },
  {
    key: "ShipmentAddress2",
    label: "Shipment Address 2",
    defaultPlaceholder: "Enter Address",
    defaultDisplayName: "Address Line 2",
  },
  {
    key: "ShipmentCity",
    label: "Shipment City",
    defaultPlaceholder: "Enter City",
    defaultDisplayName: "City",
  },
  {
    key: "ShipmentState",
    label: "Shipment State",
    defaultPlaceholder: "Enter State",
    defaultDisplayName: "State",
  },
  {
    key: "ShipmentPostcode",
    label: "Shipment Postcode",
    defaultPlaceholder: "Enter Post Code",
    defaultDisplayName: "Post Code",
  },
  {
    key: "ShipmentCountry",
    label: "Shipment Country",
    defaultPlaceholder: "Enter Country",
    defaultDisplayName: "Country",
  },
  {
    key: "ProductAmount",
    label: "Product Amount",
    defaultPlaceholder: "Enter Product Amount",
    defaultDisplayName: "Product Amount",
  },
  {
    key: "Vat",
    label: "VAT",
    defaultPlaceholder: "Enter VAT Amount",
    defaultDisplayName: "VAT",
  },
  {
    key: "Tds",
    label: "TDS",
    defaultPlaceholder: "Enter TDS Amount",
    defaultDisplayName: "TDS",
  },
  {
    key: "DiscountAmount",
    label: "Discount Amount",
    defaultPlaceholder: "Enter Discounted Amount",
    defaultDisplayName: "Discounted Amount",
  },
  {
    key: "ConvenienceFee",
    label: "Convenience Fee",
    defaultPlaceholder: "Enter Convenience Fee",
    defaultDisplayName: "Convenience Fee",
  },
  {
    key: "AdditionalFieldA",
    label: "Additional Field A",
    defaultPlaceholder: "Additional Field A",
    defaultDisplayName: "Additional Field A",
  },
  {
    key: "AdditionalFieldB",
    label: "Additional Field B",
    defaultPlaceholder: "Additional Field B",
    defaultDisplayName: "Additional Field B",
  },
  {
    key: "AdditionalFieldC",
    label: "Additional Field C",
    defaultPlaceholder: "Additional Field C",
    defaultDisplayName: "Additional Field C",
  },
  {
    key: "AdditionalFieldD",
    label: "Additional Field D",
    defaultPlaceholder: "Additional Field D",
    defaultDisplayName: "Additional Field D",
    defaultType: "Date Field",
    defaultOtherValue: "value1,value2",
  },
];

const INITIAL_QR_ENTRIES: QrEntry[] = [
  {
    id: "1",
    paymentName: "Purchase to pay",
    domainUrl: "https://demo.sslcommerz.com",
    referId: "6A129A4CF1E47",
    payType: "Payment Link",
    createdOn: "2026-05-24 12:27:24",
    paymentUrl:
      "https://uat-invoice.sslcommerz.com/invoice/pay?refer=6A129A4CF1E47",
    payButtonName: "Pay Now",
    paymentType: "once",
    amountType: "any",
    amount: "",
    amountText: "",
    convenienceFeeEnabled: true,
    convenienceFeePercent: "2.1",
    productDetails: "",
    topMessage: "Convenience fee 2.1% will be added on total payment.",
    buttonMessage: "",
    leftBgColor: "#ffffff",
    leftTextColor: "#000000",
    btnTextColor: "#ffffff",
    btnBgColor: "#007cc2",
  },
  {
    id: "2",
    paymentName: "Purchase to pay",
    domainUrl: "https://demo.sslcommerz.com",
    referId: "6A129A4D009BB",
    payType: "Invoice - Generete Invoice Link to Collect Fixed Amount",
    createdOn: "2026-05-24 12:27:25",
    paymentUrl:
      "https://uat-invoice.sslcommerz.com/invoice/pay?refer=6A129A4D009BB",
    payButtonName: "Pay Now",
    paymentType: "once",
    amountType: "fixed",
    amount: "500",
    amountText: "",
    convenienceFeeEnabled: false,
    convenienceFeePercent: "",
    productDetails: "",
    topMessage: "",
    buttonMessage: "",
    leftBgColor: "#ffffff",
    leftTextColor: "#000000",
    btnTextColor: "#ffffff",
    btnBgColor: "#007cc2",
  },
];

const PAY_TYPE_OPTIONS = [
  { label: "Payment Link", value: "Payment Link" },
  {
    label: "Invoice - Generete Invoice Link to Collect Fixed Amount",
    value: "Invoice - Generete Invoice Link to Collect Fixed Amount",
  },
];

const filterConfig: FilterConfig[] = [
  { key: "paymentName", type: "input", label: "Payment Name" },
  { key: "domainUrl", type: "input", label: "Domain URL" },
  { key: "referId", type: "input", label: "Refer Id" },
  {
    key: "payType",
    type: "select",
    label: "Pay Type",
    options: [
      { label: "Select one", value: "all" },
      { label: "Payment Link", value: "Payment Link" },
      {
        label: "Invoice - Generete Invoice Link to Collect Fixed Amount",
        value: "Invoice - Generete Invoice Link to Collect Fixed Amount",
      },
    ],
  },
  { key: "paymentUrl", type: "input", label: "Payment URL" },
];

export function MerchantStoreManageQrDrawer({
  store,
  onClose,
  merchantName,
}: Props) {
  const [view, setView] = useState<"LIST" | "ADD" | "EDIT" | "DETAIL">("LIST");
  const [entries, setEntries] = useState<QrEntry[]>(INITIAL_QR_ENTRIES);
  const [offerImagePreview, setOfferImagePreview] = useState<string | null>(
    null,
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Filters State
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  // Form State
  const [form, setForm] = useState<Partial<QrEntry>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showCustomFields, setShowCustomFields] = useState(false);

  // View QR Modal State
  const [viewQrEntry, setViewQrEntry] = useState<QrEntry | null>(null);

  // Clipboard Copy State helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (
        appliedFilters.paymentName &&
        !entry.paymentName
          .toLowerCase()
          .includes(appliedFilters.paymentName.toLowerCase())
      )
        return false;
      if (
        appliedFilters.domainUrl &&
        !entry.domainUrl
          .toLowerCase()
          .includes(appliedFilters.domainUrl.toLowerCase())
      )
        return false;
      if (
        appliedFilters.referId &&
        !entry.referId
          .toLowerCase()
          .includes(appliedFilters.referId.toLowerCase())
      )
        return false;
      if (
        appliedFilters.payType &&
        appliedFilters.payType !== "all" &&
        entry.payType !== appliedFilters.payType
      )
        return false;
      if (
        appliedFilters.paymentUrl &&
        !entry.paymentUrl
          .toLowerCase()
          .includes(appliedFilters.paymentUrl.toLowerCase())
      )
        return false;
      return true;
    });
  }, [entries, appliedFilters]);

  // Paginated entries
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  const paginationFrom =
    filteredEntries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const paginationTo = Math.min(currentPage * pageSize, filteredEntries.length);

  const hasUnappliedChanges = useMemo(
    () => JSON.stringify(localFilters) !== JSON.stringify(appliedFilters),
    [localFilters, appliedFilters],
  );

  if (!store) return null;

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(localFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.paymentName) errors.paymentName = "Payment name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalReferId =
      form.referId ||
      form.transactionRefId ||
      Math.random().toString(36).substr(2, 9).toUpperCase();

    const resolvedPaymentUrl =
      form.paymentUrl ||
      `https://uat-invoice.sslcommerz.com/invoice/pay?refer=${finalReferId}${
        form.payType === "Payment Link" ? "" : "&v3=1"
      }`;

    if (view === "ADD") {
      const newEntry: QrEntry = {
        id: Math.random().toString(36).substr(2, 9),
        paymentName: form.paymentName || "",
        domainUrl: form.domainUrl || store.baseUrl || "",
        referId: finalReferId,
        payType: form.payType || "Payment Link",
        createdOn: new Date().toISOString().replace("T", " ").substring(0, 19),
        paymentUrl: resolvedPaymentUrl,
        payButtonName: form.payButtonName || "Pay Now",
        paymentType: form.paymentType || "once",
        amountType: (form.amountType as QrEntry["amountType"]) || "any",
        amount: form.amount || "",
        amountText: form.amountText || "",
        convenienceFeeEnabled: form.convenienceFeeEnabled ?? false,
        convenienceFeePercent: form.convenienceFeePercent || "",
        productDetails: form.productDetails || "",
        topMessage: form.topMessage || "",
        buttonMessage: form.buttonMessage || "",
        leftBgColor: form.leftBgColor || "#ffffff",
        leftTextColor: form.leftTextColor || "#ffffff",
        rightTextColor: form.rightTextColor || "#5c6ac4",
        activeLinkColor: form.activeLinkColor || "#2b7cd3",
        btnTextColor: form.btnTextColor || "#ffffff",
        btnBgColor: form.btnBgColor || "#007cc2",
        uploadOfferImageName: form.uploadOfferImageName || "",
        uploadBannerName: form.uploadBannerName || "",

        transactionRefId: finalReferId,
        transactionInfo: form.transactionInfo || "",
        amountBdt: form.amountBdt || "",
        amountList: form.amountList || "",
        itemOrProductCategory: form.itemOrProductCategory || "",
        supportCartPay: form.supportCartPay ?? false,
        currency: form.currency || "BDT",
        qrType: form.qrType || "Payment Link",
        invoiceRefId: form.invoiceRefId || "",
        invoiceSentByEmail: form.invoiceSentByEmail || "Email will be sent",
        invoiceCcEmail: form.invoiceCcEmail || "",
        payQrQueryApi: form.payQrQueryApi || "",
        billQueryApi: form.billQueryApi || "",
        ipnUrl: form.ipnUrl || "",
        mobileNumberSmsRestriction: form.mobileNumberSmsRestriction || "",
        termsAgreementUrl: form.termsAgreementUrl || "",
        enableTermsAndCondition: form.enableTermsAndCondition ?? false,
        enableInvoiceLogo: form.enableInvoiceLogo ?? true,
        enablePaymentStatus: form.enablePaymentStatus ?? true,
        enableAmountEditInPay: form.enableAmountEditInPay ?? false,
        invoiceApprovalPage: form.invoiceApprovalPage ?? false,
        enableSplitPayment: form.enableSplitPayment ?? false,
        enablePaymentReturn: form.enablePaymentReturn ?? false,
        invoiceValidity: form.invoiceValidity || "",
      };

      CUSTOM_FIELDS_LIST.forEach((field) => {
        const typeKey = `custom${field.key}Type`;
        const labelKey = `custom${field.key}Label`;
        const placeholderKey = `custom${field.key}Placeholder`;
        const defaultValueKey = `custom${field.key}DefaultValue`;
        const otherValueKey = `custom${field.key}OtherValue`;
        const requiredKey = `custom${field.key}Required`;
        const visibleKey = `custom${field.key}Visible`;

        newEntry[typeKey] =
          form[typeKey] || (field as any).defaultType || "Text Field";
        newEntry[labelKey] = form[labelKey] || "";
        newEntry[placeholderKey] = form[placeholderKey] || "";
        newEntry[defaultValueKey] = form[defaultValueKey] || "";
        newEntry[otherValueKey] =
          form[otherValueKey] || (field as any).defaultOtherValue || "";
        newEntry[requiredKey] = form[requiredKey] ?? false;
        newEntry[visibleKey] = form[visibleKey] ?? field.key === "CustomerName";
      });
      setEntries((prev) => [newEntry, ...prev]);
      toast.success("QR/Payment Link added successfully");
    } else {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === form.id
            ? ({
                ...(form as QrEntry),
                paymentUrl: resolvedPaymentUrl,
              } as QrEntry)
            : item,
        ),
      );
      toast.success("QR/Payment Link updated successfully");
    }

    setView("LIST");
    setForm({});
    setFormErrors({});
    setOfferImagePreview(null);
    setBannerPreview(null);
  };

  const handleEdit = (entry: QrEntry) => {
    setForm(entry);
    setFormErrors({});
    setView("EDIT");
    setOfferImagePreview(null);
    setBannerPreview(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this QR entry?")) {
      setEntries((prev) => prev.filter((item) => item.id !== id));
      toast.success("QR entry deleted");
    }
  };

  const formatEmbedCode = (url: string) => {
    return `<a href="${url}" target="_blank" style="display:inline-block;background:#007cc2;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-family:sans-serif;">Pay Now</a>`;
  };

  return (
    <>
      <Drawer
        open={!!store}
        onClose={onClose}
        title={
          <div>
            <div className="text-xl font-bold text-slate-900">Manage QR</div>
            <div className="text-sm font-normal text-slate-500 mt-1">
              Store ID:{" "}
              <span className="font-mono font-semibold text-slate-700">
                {store.storeId}
              </span>
            </div>
          </div>
        }
        width="5xl"
        headerAction={
          view === "LIST" && (
            <button
              onClick={() => {
                setForm({
                  paymentName: "",
                  domainUrl: store.baseUrl || "",
                  referId: "",
                  payType: "Payment Link",
                  createdOn: new Date()
                    .toISOString()
                    .replace("T", " ")
                    .substring(0, 19),
                  paymentUrl:
                    "https://uat-invoice.sslcommerz.com/invoice/pay?refer=",
                  leftBgColor: "#ffffff",
                  leftTextColor: "#ffffff",
                  rightTextColor: "#5c6ac4",
                  activeLinkColor: "#2b7cd3",
                  invoiceSentByEmail: "Email will be sent",
                  enableInvoiceLogo: true,
                  enablePaymentStatus: true,
                });
                setFormErrors({});
                setView("ADD");
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-all shadow-sm active:scale-95"
            >
              Add New QR
            </button>
          )
        }
      >
        <div className="pb-24 space-y-6">
          {view === "LIST" ? (
            <>
              {/* ── SEARCH FILTERS SECTION ── */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <FilterBar
                  config={filterConfig}
                  filters={localFilters}
                  onFilterChange={handleFilterChange}
                />

                <button
                  onClick={handleApplyFilters}
                  disabled={!hasUnappliedChanges}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-all shadow-sm ml-2",
                    hasUnappliedChanges
                      ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                  )}
                >
                  Apply Filters
                </button>

                {Object.keys(localFilters).length > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* ── DATA TABLE SECTION ── */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Payment Option
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="px-5 py-3 w-12 text-center">#</th>
                        <th className="px-5 py-3">Payment Name / Refer Id</th>
                        <th className="px-5 py-3">Pay Type</th>
                        <th className="px-5 py-3">Created On</th>
                        <th className="px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-8 text-center text-slate-400 italic"
                          >
                            No QR or Payment links found matching the filter
                            criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedEntries.map((entry, idx) => (
                          <tr
                            key={entry.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-5 py-4 text-center font-medium text-slate-500">
                              {(currentPage - 1) * pageSize + idx + 1}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900">
                                {entry.paymentName}
                              </div>
                              <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                                {entry.referId}
                              </div>
                            </td>
                            <td
                              className="px-5 py-4 text-slate-600 max-w-[200px] truncate"
                              title={entry.payType}
                            >
                              {entry.payType}
                            </td>
                            <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                              {entry.createdOn}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-start gap-3 whitespace-nowrap">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="text-xs font-normal text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                <span className="inline-flex items-center gap-0">
                                  <a
                                    href={entry.paymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-normal text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded transition-colors inline-flex items-center cursor-pointer"
                                  >
                                    Payment link
                                  </a>
                                  <button
                                    onClick={() =>
                                      handleCopy(
                                        entry.paymentUrl,
                                        `link_${entry.id}`,
                                      )
                                    }
                                    className="-ml-1 p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                    title="Copy Payment Link"
                                  >
                                    {copiedId === `link_${entry.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </span>
                                <button
                                  onClick={() => {
                                    setViewQrEntry(entry);
                                    setView("DETAIL");
                                  }}
                                  className="text-xs font-normal text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded transition-colors cursor-pointer"
                                >
                                  Get QR, Button &amp; Other
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination Footer ── */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/50">
                  <div className="text-sm text-slate-500">
                    {filteredEntries.length > 0
                      ? `Showing ${paginationFrom} to ${paginationTo} of ${filteredEntries.length} entries`
                      : ""}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : view === "DETAIL" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setView("LIST");
                    setViewQrEntry(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>
              </div>

              {viewQrEntry && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-sm text-slate-700">
                  {/* Payment Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-sm font-bold text-slate-900">
                      Payment Description
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-40 h-40 border border-slate-200 flex items-center justify-center bg-white">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(viewQrEntry.paymentUrl)}`}
                          alt="QR code"
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      <div className="mt-3 text-xs text-slate-600">
                        QR for Payment Link
                      </div>

                      <button
                        type="button"
                        onClick={() => toast.success("Download QR (IMAGE)")}
                        className="mt-4 text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline transition-colors"
                      >
                        Download QR (IMAGE)
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.success("Download QR (PDF)")}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline transition-colors"
                      >
                        Download QR (PDF)
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200" />

                  {/* Payment Button HTML */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-slate-700">
                        Payment Button
                      </div>
                      <div className="text-xs text-slate-500">
                        (Add the Html at your site)
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <pre className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 border border-slate-200 rounded-lg p-4 pr-12 overflow-auto max-h-44">
                          {formatEmbedCode(viewQrEntry.paymentUrl)}
                        </pre>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              formatEmbedCode(viewQrEntry.paymentUrl),
                              "detail_embed",
                            )
                          }
                          className="absolute top-2 right-2 p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Copy HTML"
                        >
                          {copiedId === "detail_embed" ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-900 mb-2">
                          Example:
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-700">
                            Pay By
                          </span>
                          <img
                            src={logoSslCommerz}
                            alt="SSLCOMMERZ"
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-sm">
                      <div className="text-slate-600">Payment Title</div>
                      <div className="text-slate-600">Payment Type</div>
                      <div className="text-slate-600">Pay Button Name</div>
                      <div className="text-slate-600">Top Message</div>
                      <div className="text-slate-600">Button Message</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="font-semibold text-slate-900">
                        {viewQrEntry.paymentName}
                      </div>
                      <div className="text-slate-700">once</div>
                      <div className="text-slate-700">Pay Now</div>
                      <div className="text-slate-700">
                        Convenience fee 2.1% will be added on total payment.
                      </div>
                      <div />
                    </div>
                  </div>

                  {/* Inputted Parameters */}
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      Inputted Parameters
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-sm font-bold text-slate-700">
                            <th className="py-2 pr-4">Parameter</th>
                            <th className="py-2 pr-4">Reason</th>
                            <th className="py-2">Mandatory</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          <tr className="border-b border-slate-100">
                            <td className="py-2 pr-4">refer</td>
                            <td className="py-2 pr-4">
                              Value (
                              <span className="font-semibold">
                                {viewQrEntry.referId}
                              </span>
                              ) - Must be provided
                            </td>
                            <td className="py-2">Yes</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 pr-4">cus_name</td>
                            <td className="py-2 pr-4">Name</td>
                            <td className="py-2">Yes</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 pr-4">cus_email</td>
                            <td className="py-2 pr-4">Email Address</td>
                            <td className="py-2">No</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 pr-4">cus_phone</td>
                            <td className="py-2 pr-4">Mobile</td>
                            <td className="py-2">Yes</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-2 pr-4">amount</td>
                            <td className="py-2 pr-4">Amount</td>
                            <td className="py-2">Yes</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4">currency</td>
                            <td className="py-2 pr-4">Currency</td>
                            <td className="py-2">Yes</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── FORM VIEW (ADD / EDIT) ── */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("LIST")}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
                  {view === "ADD" ? "Add New QR Code" : "Edit QR Code"}
                </h3>

                <form
                  onSubmit={handleSave}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                >
                  {/* ── Group 1: Store Info ── */}
                  <div className="md:col-span-2">
                    <div className="text-sm font-bold text-slate-900 mb-3">
                      Store Info
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Store Name
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={merchantName || "SSLCOMMERZ"}
                          className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Store ID
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={store.storeId || ""}
                          className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Group 2: Payor Subscription ── */}
                  <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
                    <div className="text-sm font-bold text-slate-900 mb-3">
                      Payor Subscription
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Name of the Payment *
                        </label>
                        <input
                          type="text"
                          value={form.paymentName || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              paymentName: e.target.value,
                            }))
                          }
                          placeholder="Shop Payment"
                          className={clsx(
                            "w-full px-3 py-2.5 text-sm bg-white border rounded-lg focus:ring-2 outline-none transition-all",
                            formErrors.paymentName
                              ? "border-rose-300 focus:ring-rose-500"
                              : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
                          )}
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          (A brief description of this QR)
                        </p>
                        {formErrors.paymentName && (
                          <p className="mt-1 text-[11px] text-rose-500 font-semibold">
                            {formErrors.paymentName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Alias of Transaction Reference
                        </label>
                        <input
                          type="text"
                          value={form.referId || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              referId: e.target.value,
                              transactionRefId: e.target.value,
                            }))
                          }
                          placeholder="Order Id"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                          This is a display name of the primary reference key.
                          Example: Mobile Number, Account Number, Invoice
                          Number, Bole Number, etc. Keep empty, if you do not
                          want this field.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Pay Button
                        </label>
                        <input
                          type="text"
                          value={form.payButtonName || "Pay Now"}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              payButtonName: e.target.value,
                            }))
                          }
                          placeholder="Pay Now"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Group 3: Transaction Info ── */}
                  <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
                    <div className="text-sm font-bold text-slate-900 mb-3">
                      Transaction Info
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Amount (BDT)
                        </label>
                        <input
                          type="text"
                          value={form.amountBdt || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              amountBdt: e.target.value,
                              amount: e.target.value,
                            }))
                          }
                          placeholder="Enter Amount"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          (Keep it unchanged, if you don&apos;t want to collect
                          same amount from all customers)
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Amount List
                        </label>
                        <input
                          type="text"
                          value={form.amountList || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              amountList: e.target.value,
                            }))
                          }
                          placeholder="Enter Amount List"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          (Comma separated amount list to display)
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Product List with Amount
                        </label>
                        <textarea
                          rows={3}
                          value={form.productDetails || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              productDetails: e.target.value,
                            }))
                          }
                          placeholder="200 Product Name 1 (200 BDT)=NEW LINE=500 Product Name 2 (500 BDT)"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <div className="mt-1.5 space-y-1 text-[11px] text-slate-500 leading-relaxed">
                          <p>
                            <span className="font-semibold text-slate-700">
                              Syntax: AMOUNT Product Name [Amount]; Example:
                            </span>{" "}
                            200 Product Name 1 (200 BDT)=NEW LINE=500 Product
                            Name 2 (500 BDT)
                          </p>
                          <p>
                            <span className="font-semibold text-slate-700">
                              Note:
                            </span>{" "}
                            &quot;[&quot; is the amount and product name divider
                            and &quot;=NEW LINE=&quot; means enter another line
                            for another product. Please do not use
                            &quot;[&quot;, &quot;]&quot; and &quot;=&quot;
                            within your text. And AMOUNT must be unique.
                          </p>
                          <p className="italic">
                            (Only applicable for Payment Link)
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Item or Product Category
                        </label>
                        <input
                          type="text"
                          value={form.itemOrProductCategory || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              itemOrProductCategory: e.target.value,
                            }))
                          }
                          placeholder="Enter Item or Product Category List by Comma Separated"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <div className="mt-1.5 space-y-1 text-[11px] text-slate-500 leading-relaxed">
                          <p>
                            This category field depends on &quot;Product List
                            with Amount&quot;. If no item is added in
                            &quot;Product List with Amount&quot;, then this
                            category will not display. Category name must be
                            mentioned by comma &quot;,&quot; separated. Ex:
                            Small,Regular
                          </p>
                          <p>
                            This field searched the name from Product List. If
                            you give a item name as &quot;Creamy Hot Chocolate
                            (Regular)&quot;, then this item will be displayed in
                            &quot;Regular&quot; category automatically. Two more
                            category will be add &quot;All&quot; and
                            &quot;Others&quot;
                          </p>
                          <p className="italic">
                            (Only applicable for Payment Link)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Is Support Cart to Pay
                        </label>
                        <select
                          value={
                            form.supportCartPay === true
                              ? "Yes"
                              : form.supportCartPay === false
                                ? "No"
                                : ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              supportCartPay: e.target.value === "Yes",
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">
                          (Only applicable for Payment Link and Product List
                          with Amount must be declared)
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Currency
                        </label>
                        <input
                          type="text"
                          value={form.currency || "BDT"}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, currency: e.target.value }))
                          }
                          placeholder="e.g. BDT, USD"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          QR Type
                        </label>
                        <select
                          value={form.qrType || ""}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, qrType: e.target.value }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="Payment Link">Payment Link</option>
                          <option value="Invoice - Generete Invoice Link to Collect Fixed Amount">
                            Invoice - Generete Invoice Link to Collect Fixed
                            Amount
                          </option>
                          <option value="Static QR">Static QR</option>
                          <option value="Dynamic QR">Dynamic QR</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Amount Type
                        </label>
                        <select
                          value={form.amountType || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              amountType: e.target.value as any,
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="any">Any</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Invoice Refer ID
                        </label>
                        <input
                          type="text"
                          value={form.invoiceRefId || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              invoiceRefId: e.target.value,
                            }))
                          }
                          placeholder="Enter Invoice Refer ID for Recurring"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          (Only applicable for recurring type to send sms or if
                          the payment channel has no auto debit facility)
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Invoice Sent by Email
                        </label>
                        <select
                          value={
                            form.invoiceSentByEmail || "Email will be sent"
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              invoiceSentByEmail: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="Email will be sent">
                            Email will be sent
                          </option>
                          <option value="Email will not be sent">
                            Email will not be sent
                          </option>
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Whether customer will receive the invoice when an
                          invoice will be generated
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Invoice CC Email
                        </label>
                        <input
                          type="text"
                          value={form.invoiceCcEmail || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              invoiceCcEmail: e.target.value,
                            }))
                          }
                          placeholder="Enter Email Address to Keep CC"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Pre QR Query API
                        </label>
                        <input
                          type="text"
                          value={form.payQrQueryApi || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              payQrQueryApi: e.target.value,
                            }))
                          }
                          placeholder="Enter IPN URL"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Bill Query API
                        </label>
                        <input
                          type="text"
                          value={form.billQueryApi || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              billQueryApi: e.target.value,
                            }))
                          }
                          placeholder="Enter IPN URL"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          IPN URL
                        </label>
                        <input
                          type="text"
                          value={form.ipnUrl || ""}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, ipnUrl: e.target.value }))
                          }
                          placeholder="Enter IPN URL"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Mobile Number (SMS Notification)
                        </label>
                        <input
                          type="text"
                          value={form.mobileNumberSmsRestriction || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              mobileNumberSmsRestriction: e.target.value,
                            }))
                          }
                          placeholder="Enter Bangladesh Mobile No"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Terms and Agreement URL
                        </label>
                        <input
                          type="text"
                          value={form.termsAgreementUrl || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              termsAgreementUrl: e.target.value,
                            }))
                          }
                          placeholder="Enter Terms and Agreement"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Enable Term & Cond
                        </label>
                        <select
                          value={
                            form.enableTermsAndCondition === true
                              ? "Yes"
                              : form.enableTermsAndCondition === false
                                ? "No"
                                : ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              enableTermsAndCondition: e.target.value === "Yes",
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Enable Invoice Logo (by default it is yes)
                        </label>
                        <select
                          value={
                            form.enableInvoiceLogo === false
                              ? "No"
                              : form.enableInvoiceLogo === true
                                ? "Yes"
                                : ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              enableInvoiceLogo: e.target.value === "Yes",
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Enable Payment Status (by default it is yes)
                        </label>
                        <select
                          value={
                            form.enablePaymentStatus === false
                              ? "No"
                              : form.enablePaymentStatus === true
                                ? "Yes"
                                : ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              enablePaymentStatus: e.target.value === "Yes",
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Enable Approval Process (by default it is no)
                        </label>
                        <select
                          value={
                            form.invoiceApprovalPage === true
                              ? "Yes"
                              : form.invoiceApprovalPage === false
                                ? "No"
                                : ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              invoiceApprovalPage: e.target.value === "Yes",
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Enable Split Payment (by default it is no)
                        </label>
                        <select
                          value={
                            form.enableSplitPayment === true
                              ? "Yes"
                              : form.enableSplitPayment === false
                                ? "No"
                                : ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              enableSplitPayment: e.target.value === "Yes",
                            }))
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        >
                          <option value="">Select One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Invoice Validity
                        </label>
                        <input
                          type="text"
                          value={form.invoiceValidity || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              invoiceValidity: e.target.value,
                            }))
                          }
                          placeholder="Enter in XXXX year"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          How long an invoice will be valid. 1 means 1 day, 30
                          means 30 days. &quot;M&quot; means, invoice validity
                          will be max one month
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Group 4: Additional Message ── */}
                  <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
                    <div className="text-sm font-bold text-slate-900 mb-3">
                      Additional Message
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Message on Top
                        </label>
                        <input
                          type="text"
                          value={form.topMessage || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              topMessage: e.target.value,
                            }))
                          }
                          placeholder="Enter The Top Message"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          (This message will be displayed on the top of the
                          form)
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Massage on Footer
                        </label>
                        <input
                          type="text"
                          value={form.buttonMessage || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              buttonMessage: e.target.value,
                            }))
                          }
                          placeholder="Enter The Footer Message"
                          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          (This message will be displayed after the pay button)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Group 5: Page Structure ── */}
                  <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
                    <div className="text-sm font-bold text-slate-900 mb-3">
                      Page Structure
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Left Site Background Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={form.leftBgColor || "#ffffff"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                leftBgColor: e.target.value,
                              }))
                            }
                            className="h-9 w-16 bg-white border border-slate-200 rounded-lg cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={form.leftBgColor || "#ffffff"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                leftBgColor: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Left Site Font Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={form.leftTextColor || "#ffffff"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                leftTextColor: e.target.value,
                              }))
                            }
                            className="h-9 w-16 bg-white border border-slate-200 rounded-lg cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={form.leftTextColor || "#ffffff"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                leftTextColor: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Right Site Font Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={form.rightTextColor || "#5c6ac4"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                rightTextColor: e.target.value,
                              }))
                            }
                            className="h-9 w-16 bg-white border border-slate-200 rounded-lg cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={form.rightTextColor || "#5c6ac4"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                rightTextColor: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Active Link Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={form.activeLinkColor || "#2b7cd3"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                activeLinkColor: e.target.value,
                              }))
                            }
                            className="h-9 w-16 bg-white border border-slate-200 rounded-lg cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={form.activeLinkColor || "#2b7cd3"}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                activeLinkColor: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Upload Banner */}
                      <div className="md:col-span-2 mt-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Upload Banner
                        </label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setForm((p) => ({
                                  ...p,
                                  uploadBannerName: file.name,
                                }));
                                setBannerPreview(URL.createObjectURL(file));
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div
                            className={clsx(
                              "w-full px-4 py-3 bg-white border-2 border-dashed rounded-xl transition-all flex items-center gap-3",
                              form.uploadBannerName
                                ? "border-emerald-200 bg-emerald-50/30"
                                : "border-slate-200 group-hover:border-primary-400 group-hover:bg-primary-50/30",
                            )}
                          >
                            <div
                              className={clsx(
                                "w-12 h-12 rounded-lg transition-all flex items-center justify-center overflow-hidden shrink-0",
                                form.uploadBannerName
                                  ? "bg-emerald-100"
                                  : "bg-slate-100 group-hover:bg-primary-100",
                              )}
                            >
                              {bannerPreview ? (
                                <img
                                  src={bannerPreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={clsx(
                                  "text-sm font-bold truncate",
                                  form.uploadBannerName
                                    ? "text-emerald-700"
                                    : "text-slate-600",
                                )}
                              >
                                {form.uploadBannerName ||
                                  "Choose file or drag & drop"}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                PNG, JPG or GIF (max. 2MB)
                              </p>
                            </div>
                            {form.uploadBannerName && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setForm((p) => ({
                                    ...p,
                                    uploadBannerName: "",
                                  }));
                                  setBannerPreview(null);
                                }}
                                className="p-1.5 hover:bg-emerald-100 rounded-md text-emerald-600 relative z-20 transition-colors"
                                title="Remove"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Group 6: Customize Field ── */}
                  <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
                    <div className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                      <span>Customize Field</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomFields(!showCustomFields)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>
                          {showCustomFields
                            ? "Hide Additional Fields (Add / Delete)"
                            : "Show Additional Fields (Add / Delete)"}
                        </span>
                        {showCustomFields ? (
                          <ChevronUp className="w-4 h-4 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        )}
                      </button>
                    </div>

                    {showCustomFields && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mt-3">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                              <th className="p-3 w-[15%]">Field Name</th>
                              <th className="p-3 w-[15%]">Field Type</th>
                              <th className="p-3 w-[15%]">Display Name</th>
                              <th className="p-3 w-[15%]">Placeholder</th>
                              <th className="p-3 w-[15%]">Default Value</th>
                              <th className="p-3 w-[15%]">Other Value</th>
                              <th className="p-3 w-[5%] text-center">
                                Required
                              </th>
                              <th className="p-3 w-[5%] text-center">
                                Display
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {CUSTOM_FIELDS_LIST.map((field) => {
                              const typeKey =
                                `custom${field.key}Type` as keyof QrEntry;
                              const labelKey =
                                `custom${field.key}Label` as keyof QrEntry;
                              const placeholderKey =
                                `custom${field.key}Placeholder` as keyof QrEntry;
                              const defaultValueKey =
                                `custom${field.key}DefaultValue` as keyof QrEntry;
                              const otherValueKey =
                                `custom${field.key}OtherValue` as keyof QrEntry;
                              const requiredKey =
                                `custom${field.key}Required` as keyof QrEntry;
                              const visibleKey =
                                `custom${field.key}Visible` as keyof QrEntry;

                              const fieldType =
                                (form[typeKey] as string) ||
                                (field as any).defaultType ||
                                "Text Field";
                              const displayName =
                                (form[labelKey] as string) || "";
                              const placeholder =
                                (form[placeholderKey] as string) || "";
                              const defaultValue =
                                (form[defaultValueKey] as string) || "";
                              const otherValue =
                                (form[otherValueKey] as string) ||
                                (field as any).defaultOtherValue ||
                                "";
                              const isRequired = form[requiredKey] ?? false;
                              const isVisible =
                                form[visibleKey] ??
                                field.key === "CustomerName";

                              return (
                                <tr
                                  key={field.key}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  {/* Field Name */}
                                  <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                                    {field.label}
                                  </td>

                                  {/* Field Type */}
                                  <td className="p-3">
                                    <select
                                      value={fieldType}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          [typeKey]: e.target.value,
                                        }))
                                      }
                                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    >
                                      <option value="Text Field">
                                        Text Field
                                      </option>
                                      <option value="Select Field">
                                        Select Field
                                      </option>
                                      <option value="Date Field">
                                        Date Field
                                      </option>
                                    </select>
                                  </td>

                                  {/* Display Name */}
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder={field.defaultDisplayName}
                                      value={displayName}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          [labelKey]: e.target.value,
                                        }))
                                      }
                                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    />
                                  </td>

                                  {/* Placeholder */}
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder={field.defaultPlaceholder}
                                      value={placeholder}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          [placeholderKey]: e.target.value,
                                        }))
                                      }
                                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    />
                                  </td>

                                  {/* Default Value */}
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Default value"
                                      value={defaultValue}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          [defaultValueKey]: e.target.value,
                                        }))
                                      }
                                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    />
                                  </td>

                                  {/* Other Value */}
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Other config"
                                      value={otherValue}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          [otherValueKey]: e.target.value,
                                        }))
                                      }
                                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    />
                                  </td>

                                  {/* Required */}
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={!!isRequired}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          [requiredKey]: e.target.checked,
                                        }))
                                      }
                                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer mx-auto"
                                    />
                                  </td>

                                  {/* Display */}
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={!!isVisible}
                                      onChange={(e) =>
                                        setForm((p) => ({
                                          ...p,
                                          [visibleKey]: e.target.checked,
                                        }))
                                      }
                                      className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer mx-auto"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="md:col-span-2 flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md active:scale-95"
                    >
                      Save QR
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
