import React, { useEffect, useState } from "react";
import { AlertCircle, FileText, Shield, Upload, X } from "lucide-react";
import { clsx } from "clsx";
import { DatePicker } from "../../components/DatePicker";
import { Drawer } from "../../components/Drawer";
import type { MerchantStore } from "../../data/mock/types";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const FormField = ({
  label,
  name,
  value,
  onChange,
  errors = {},
  type = "text",
  helper,
  options,
  disabled,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  errors?: Record<string, string>;
  type?: string;
  helper?: string;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}) => {
  const hasError = !!errors[name];
  const inputCls = clsx(
    "w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all",
    disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white",
    hasError ? "border-rose-300 focus:ring-rose-500" : "border-slate-200",
  );

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>

      {type === "select" && options ? (
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={inputCls}
        >
          {!options.some((o) => o.value === "") && (
            <option value="">{placeholder || `Select ${label}`}</option>
          )}
          {options.map((o) => (
            <option key={o.value || o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || (disabled ? "" : "Enter...")}
          className={inputCls}
        />
      )}

      {helper && (
        <p className="mt-1 text-[11px] text-slate-500 italic leading-normal">
          {helper}
        </p>
      )}
      {hasError && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );
};

const SOURCE_OF_FUND = [
  { label: "Reverse Adjustment Amount", value: "Reverse Adjustment Amount" },
  { label: "Security Deposit", value: "Security Deposit" },
  { label: "Manual Adjustment", value: "Manual Adjustment" },
  { label: "Other", value: "Other" },
];

const BANKS = [
  { label: "Select Bank", value: "" },
  { label: "City Bank", value: "City Bank" },
  { label: "Brac Bank", value: "Brac Bank" },
  { label: "Dutch Bangla Bank", value: "Dutch Bangla Bank" },
  { label: "Eastern Bank", value: "Eastern Bank" },
  { label: "HSBC", value: "HSBC" },
  { label: "Standard Chartered", value: "Standard Chartered" },
];

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
  merchantName?: string;
}

export function MerchantStoreSecurityFundDrawer({
  store,
  onClose,
  merchantName,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(
    null,
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        merchantName: merchantName
          ? `${store.storeId} - ${merchantName}`
          : `${store.storeId} - ${store.storeName}`,
        storeId: store.storeId,
        referId: "-",
        fund: "",
        sourceOfFund: "Reverse Adjustment Amount",
        description: "",
        depositedBankName: "",
        depositedChequeNo: "",
        depositDate: "",
      });
      setDocumentFile(null);
      setDocumentPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
      setErrors({});
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [store, merchantName]);

  useEffect(() => {
    return () => {
      if (documentPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(documentPreviewUrl);
      }
    };
  }, [documentPreviewUrl]);

  if (!store) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setDocumentPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    });
    setDocumentFile(file);
    if (errors.document) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.document;
        return next;
      });
    }
  };

  const handleFileRemove = () => {
    setDocumentPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setDocumentFile(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fund) next.fund = "Fund is required";
    if (!form.sourceOfFund) next.sourceOfFund = "Source of Fund is required";
    if (!form.description) next.description = "Description is required";
    if (!form.depositedChequeNo)
      next.depositedChequeNo = "Deposited Cheque No is required";
    if (!form.depositDate) next.depositDate = "Deposit Date is required";
    if (!documentFile) next.document = "Document is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1600);
  };

  const f = (k: string) => form[k] ?? "";

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">Security Fund</div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono text-slate-400">{store.storeId}</span>
      </div>
    </div>
  );

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="2xl">
      <div className="pb-28">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center space-y-5 py-16">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
              <Shield className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Security Fund Saved Successfully!
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Security fund for{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {store.storeName}
                </span>{" "}
                has been submitted.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <SectionHeader title="Store Information" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <div className="md:col-span-2">
                    <FormField
                      label="Merchant Name"
                      name="merchantName"
                      value={f("merchantName")}
                      disabled
                    />
                  </div>
                  <FormField
                    label="Store ID"
                    name="storeId"
                    value={f("storeId")}
                    disabled
                  />
                  <FormField
                    label="Refer ID"
                    name="referId"
                    value={f("referId")}
                    disabled
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="Fund Information" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Fund"
                    name="fund"
                    value={f("fund")}
                    onChange={handleChange}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Source of Fund"
                    name="sourceOfFund"
                    value={f("sourceOfFund")}
                    onChange={handleChange}
                    type="select"
                    options={SOURCE_OF_FUND}
                    required
                    errors={errors}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Description"
                      name="description"
                      value={f("description")}
                      onChange={handleChange}
                      required
                      errors={errors}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="Deposit Details" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <FormField
                    label="Deposited Bank Name"
                    name="depositedBankName"
                    value={f("depositedBankName")}
                    onChange={handleChange}
                    type="select"
                    options={BANKS}
                    placeholder="Select Bank"
                  />
                  <FormField
                    label="Deposited Cheque No"
                    name="depositedChequeNo"
                    value={f("depositedChequeNo")}
                    onChange={handleChange}
                    required
                    errors={errors}
                  />
                  <div className="mb-4">
                    <DatePicker
                      label="Deposit Date"
                      usePortal
                      value={f("depositDate")}
                      onChange={(val) => {
                        setForm((prev) => ({ ...prev, depositDate: val }));
                        if (errors.depositDate) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.depositDate;
                            return next;
                          });
                        }
                      }}
                      placeholder="Select deposit date"
                      error={errors.depositDate}
                    />
                  </div>
                  <div className="md:col-span-2 mb-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Upload the Document
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 group min-w-0">
                        <input
                          type="file"
                          onChange={(e) => {
                            handleFileChange(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className={clsx(
                            "w-full px-3 py-2 bg-white border-2 border-dashed group-hover:border-primary-400 group-hover:bg-primary-50/30 rounded-lg transition-all flex items-center gap-3 h-[38px]",
                            errors.document
                              ? "border-rose-300"
                              : "border-slate-200",
                          )}
                        >
                          <div className="w-10 h-6 rounded border border-slate-200 bg-slate-100 group-hover:bg-primary-100 transition-all flex items-center justify-center overflow-hidden shrink-0">
                            {documentPreviewUrl ? (
                              <img
                                src={documentPreviewUrl}
                                alt="Document preview"
                                className="w-full h-full object-cover"
                              />
                            ) : documentFile ? (
                              <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold truncate text-slate-500 group-hover:text-primary-500">
                              {documentFile?.name || "Choose Document File"}
                            </p>
                          </div>
                          {documentFile && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFileRemove();
                              }}
                              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500 relative z-20 transition-colors cursor-pointer"
                              title="Remove document"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {errors.document && (
                      <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {errors.document}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isSubmitting ? "Saving..." : "Save Security Fund"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
