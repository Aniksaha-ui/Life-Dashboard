import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { clsx } from "clsx";
import { api } from "../../lib/api/client";

type FormStep = "form" | "success";

interface BankFormData {
  bankName: string;
  swiftCode: string;
  npsbCode: string;
  emiContactEmail: string;
  generalEmiRate: string;
  specialEmiRate: string;
  emiEnabledStore: string;
  emiAccountNo: string;
  emiAccountName: string;
  branch: string;
  emiBankAddress: string;
  bankLogo: string;
  emiProductLogo: string;
  bankContactEmail: string;
  bankContactPhone: string;
  lastReportSent: string;
  reportSendOn: string;
  sslContactEmail: string;
  sslContactMobile: string;
  lastEmailSentOn: string;
  lastEmailSentStatus: string;
}

const initialData: BankFormData = {
  bankName: "",
  swiftCode: "",
  npsbCode: "",
  emiContactEmail: "",
  generalEmiRate: "",
  specialEmiRate: "",
  emiEnabledStore: "",
  emiAccountNo: "",
  emiAccountName: "",
  branch: "",
  emiBankAddress: "",
  bankLogo: "",
  emiProductLogo: "",
  bankContactEmail: "",
  bankContactPhone: "",
  lastReportSent: "",
  reportSendOn: "",
  sslContactEmail: "",
  sslContactMobile: "",
  lastEmailSentOn: "",
  lastEmailSentStatus: "",
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const FormField = ({
  label,
  name,
  formData,
  handleChange,
  errors,
  type = "text",
  helper,
  options,
  multiline,
  disabled,
  required,
  isRadio,
}: any) => {
  const hasError = !!errors[name as keyof BankFormData];

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
        {label}
      </label>

      {isRadio ? (
        <div className="flex gap-6 mt-2">
          {options.map((opt: string) => (
            <label
              key={opt}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={formData[name as keyof BankFormData] === opt}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                {opt}
              </span>
            </label>
          ))}
        </div>
      ) : type === "select" ? (
        <select
          name={name}
          value={formData[name as keyof BankFormData] as string}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((opt: any) => (
            <option
              key={typeof opt === "string" ? opt : opt.value}
              value={typeof opt === "string" ? opt : opt.value}
            >
              {typeof opt === "string" ? opt : opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={formData[name as keyof BankFormData] as string}
          onChange={handleChange}
          rows={3}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name as keyof BankFormData] as string}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded focus:ring-2 focus:ring-primary-500 outline-none transition-all",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
      )}

      {helper && (
        <p className="mt-1 text-[11px] text-slate-500 italic flex items-start gap-1 leading-normal">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {helper}
        </p>
      )}
      {hasError && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {errors[name as keyof BankFormData]}
        </p>
      )}
    </div>
  );
};

export default function AddLocalIssuerBankPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<FormStep>("form");
  const [formData, setFormData] = useState<BankFormData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BankFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<Record<keyof BankFormData, string>> = {};
    if (!formData.bankName) newErrors.bankName = "Bank Name is required";
    if (!formData.swiftCode) newErrors.swiftCode = "SWIFT Code is required";
    if (!formData.npsbCode) newErrors.npsbCode = "NPSB Code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.localIssuerBanks.create(formData as any);
      setStep("success");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to create bank:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BankFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Bank Created Successfully!
        </h1>
        <p className="text-slate-600 mb-8 max-w-md text-center">
          The local issuer bank record for <b>{formData.bankName}</b> has been
          created.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/manage-bank/local-issuer-bank")}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Back to List
          </button>
          <button
            onClick={() => {
              setFormData(initialData);
              setStep("form");
              window.scrollTo(0, 0);
            }}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Add Another Bank
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/manage-bank/local-issuer-bank")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Local Issuer Bank
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Add New Local Issuer Bank
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Fill in the bank details below.
          </p>
        </div>

        <div className="p-6 space-y-10">
          {/* Bank Info */}
          <div>
            <SectionHeader title="Bank Info" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Bank Name"
                name="bankName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <FormField
                label="SWIFT Code"
                name="swiftCode"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <FormField
                label="NPSB Code"
                name="npsbCode"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <FormField
                label="EMI ConTact Email"
                name="emiContactEmail"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="EMI Account No"
                name="emiAccountNo"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="EMI Account Name"
                name="emiAccountName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Branch"
                name="branch"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="EMI Bank Address"
                  name="emiBankAddress"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  multiline
                />
              </div>
            </div>
          </div>

          {/* EMI Configuration */}
          <div>
            <SectionHeader title="EMI Configuration" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="General EMI Rate"
                name="generalEmiRate"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Special EMI Rate"
                name="specialEmiRate"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="EMI Enabled Store"
                  name="emiEnabledStore"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  helper="You may input store id by comma separate; 'AllowAllMerchant' key to display for all merchant."
                />
              </div>
            </div>
          </div>

          {/* Assets & Contacts */}
          <div>
            <SectionHeader title="Assets & Contacts" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Bank Logo"
                name="bankLogo"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="EMI Product Logo"
                name="emiProductLogo"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Bank Contact Email"
                name="bankContactEmail"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Bank Contact Phone"
                name="bankContactPhone"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            </div>
          </div>

          {/* Reporting & SSL Contact */}
          <div>
            <SectionHeader title="Reporting & SSL Contact" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Report Send On"
                name="reportSendOn"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="SSL Contact Email"
                name="sslContactEmail"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="SSL Contact Mobile"
                name="sslContactMobile"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
