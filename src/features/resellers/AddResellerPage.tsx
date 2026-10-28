import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  AlertCircle,
  Upload,
  Info,
  X,
  File,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { api } from "../../lib/api/client";
import { formatResellerDate } from "./utils/resellerDateFormat";

type FormStep = "form" | "success";

interface ResellerFormData {
  // Reseller Info
  name: string;
  address: string;
  email: string;
  phone: string;
  fax: string;
  status: "Active" | "De-active";

  // Reseller Account
  bank: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  eftnNumber: string;
  bankCharge: string;
  resellerCharge: string;
  agreementDone: "Yes" | "No";
  agreementCopies: File[];
}

const initialData: ResellerFormData = {
  name: "",
  address: "",
  email: "",
  phone: "",
  fax: "",
  status: "Active",
  bank: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  eftnNumber: "",
  bankCharge: "",
  resellerCharge: "",
  agreementDone: "No",
  agreementCopies: [],
};

const banks = [
  "City Bank",
  "Brac Bank",
  "Dutch Bangla Bank",
  "Eastern Bank",
  "HSBC",
  "Standard Chartered",
];

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
  isRadio,
}: any) => {
  const hasError = !!errors[name as keyof ResellerFormData];

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
                checked={formData[name as keyof ResellerFormData] === opt}
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
          value={formData[name as keyof ResellerFormData] as string}
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
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={formData[name as keyof ResellerFormData] as string}
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
          value={formData[name as keyof ResellerFormData] as string}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all",
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
          {errors[name as keyof ResellerFormData]}
        </p>
      )}
    </div>
  );
};

export default function AddResellerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<FormStep>("form");
  const [formData, setFormData] = useState<ResellerFormData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResellerFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; file: File; progress: number; previewUrl: string | null }[]
  >([]);

  const validate = () => {
    const newErrors: Partial<Record<keyof ResellerFormData, string>> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.resellers.create({
        ...formData,
        bankCharge: Number(formData.bankCharge),
        resellerCharge: Number(formData.resellerCharge),
        agreementCopy: attachments.length > 0 ? attachments[0].file.name : "",
      });
      setStep("success");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to create reseller:", error);
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
    if (errors[name as keyof ResellerFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newAttachments = selectedFiles.map((file) => {
      const id = Math.random().toString(36).substring(7);
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;

      // Simulate progress for each file
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setAttachments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, progress: 100 } : a)),
          );
        } else {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, progress: Math.round(progress) } : a,
            ),
          );
        }
      }, 200);

      return { id, file, progress: 0, previewUrl };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm ring-8 ring-emerald-50/50">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Reseller Created Successfully!
        </h1>
        <p className="text-slate-500 mb-10 max-w-md text-center text-sm font-medium">
          The master record has been created. You can now manage this reseller
          from the portal.
        </p>

        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-10">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Reseller Summary
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wide">
              Active
            </span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Reseller Name
              </p>
              <p className="font-bold text-slate-800">{formData.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Phone Number
              </p>
              <p className="font-semibold text-slate-700">{formData.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Email Address
              </p>
              <p
                className="font-semibold text-slate-700 truncate"
                title={formData.email}
              >
                {formData.email}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Bank Account
              </p>
              <p className="font-semibold text-slate-700">
                {formData.bank || "N/A"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formData.accountNumber}
              </p>
            </div>
          </div>
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 italic text-[11px] text-slate-400 text-center">
            Onboarding record initialized on {formatResellerDate(new Date())}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setFormData(initialData);
              setAttachments([]);
              setStep("form");
              window.scrollTo(0, 0);
            }}
            className="px-8 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Another Reseller
          </button>
          <button
            onClick={() => navigate("/resellers")}
            className="px-8 py-3 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-200 flex items-center gap-2"
          >
            View Reseller List
            <ArrowRight className="w-4 h-4" />
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
          onClick={() => navigate("/resellers")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Reseller
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Add New Reseller
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Fill in the reseller master record details below.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Reseller Info */}
          <div>
            <SectionHeader title="Reseller Info" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Name"
                name="name"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Address"
                  name="address"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  multiline
                />
              </div>
              <FormField
                label="Email"
                name="email"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Phone"
                name="phone"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="FAX"
                name="fax"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Status"
                name="status"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Active", "De-active"]}
              />
            </div>
          </div>

          {/* Reseller Account */}
          <div>
            <SectionHeader title="Reseller Account" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Bank"
                name="bank"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={banks}
              />
              <FormField
                label="Branch Name"
                name="branchName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Account Name"
                name="accountName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Once account name is set, it can not be changed"
              />
              <FormField
                label="Account Number"
                name="accountNumber"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="EFTN Number"
                name="eftnNumber"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Bank Charge"
                name="bankCharge"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Reseller Charge"
                name="resellerCharge"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Whether Agreement Done"
                name="agreementDone"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Yes", "No"]}
              />

              <div className="lg:col-span-2">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    Agreement Copy
                  </label>
                  <label
                    htmlFor="agreementCopyInput"
                    className={clsx(
                      "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-2 transition-all",
                      formData.agreementDone === "Yes"
                        ? "border-slate-200 hover:border-primary-400 bg-slate-50/50 cursor-pointer"
                        : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed",
                    )}
                  >
                    <input
                      type="file"
                      id="agreementCopyInput"
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                      disabled={formData.agreementDone !== "Yes"}
                    />
                    <div className="flex flex-row flex-wrap gap-2 w-full mt-1">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 px-2 py-1.5 bg-white border border-slate-100 rounded-lg group/item transition-all hover:border-slate-200 min-w-[180px] max-w-[240px]"
                        >
                          {att.progress < 100 ? (
                            <div className="flex-1 px-1">
                              <div className="flex justify-between text-[9px] mb-1">
                                <span className="text-slate-500 font-medium truncate max-w-[100px]">
                                  {att.file.name}
                                </span>
                                <span className="text-primary-600 font-bold">
                                  {att.progress}%
                                </span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-500 transition-all duration-300 ease-out"
                                  style={{ width: `${att.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              {att.previewUrl ? (
                                <div className="w-8 h-8 rounded border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0 shadow-sm">
                                  <img
                                    src={att.previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : att.file.type === "application/pdf" ? (
                                <div className="relative w-8 h-8 rounded bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 flex-shrink-0">
                                  <File className="w-4 h-4" />
                                  <span className="absolute text-[5px] font-bold mt-0.5">
                                    PDF
                                  </span>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                  <Info className="w-3 h-3" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-[10px] font-semibold text-slate-700 truncate mb-0.5"
                                  title={att.file.name}
                                >
                                  {att.file.name}
                                </p>
                                <p className="text-[9px] text-emerald-600 flex items-center gap-0.5 font-medium">
                                  <Check className="w-2.5 h-2.5" /> Done
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeAttachment(att.id);
                                }}
                                className="p-1 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover/item:opacity-100"
                              >
                                <X className="w-3 h-3 text-slate-300 hover:text-rose-500" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}

                      {attachments.length === 0 && (
                        <div className="flex flex-col items-center py-2 w-full">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-primary-500 mb-0.5" />
                          <span className="text-[10px] text-slate-500 group-hover:text-primary-500 font-semibold text-center">
                            Upload PDF/Images
                            <br />
                            <span className="font-normal text-[9px]">
                              (You can select multiple)
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
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
