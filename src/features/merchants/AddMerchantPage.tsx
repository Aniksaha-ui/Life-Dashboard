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
} from "lucide-react";
import { clsx } from "clsx";
import { api } from "../../lib/api/client";

type FormStep = "form" | "success";

interface MerchantFormData {
  // Merchant Info
  merchantId: string;
  companyName: string;
  contactPerson: string;
  companyAddress: string;
  email: string;
  mobile: string;
  country: string;
  timeZone: string;
  status: "Disable" | "Enable" | "Terminated";
  isMarqueeMerchant: "Yes" | "No";

  // Merchant Account
  bank: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  eftnNumber: string;
  settlementEmails: string;
  agreementDone: "Yes" | "No";
  agreementCopies: File[];

  // SSL Contact Person
  technicalPerson: string;
  salesforce: string;

  // Monthly Charge
  isMonthlyChargeAvailable: "Yes" | "No";
  monthlyChargeAmount: string;

  // Business Profile
  sector: string;
  tierClass: string;
  hunter: string;
  incubator: string;
  introducerKam: string;
  currentKam: string;
}

const initialData: MerchantFormData = {
  merchantId: "",
  companyName: "",
  contactPerson: "",
  companyAddress: "",
  email: "",
  mobile: "",
  country: "Bangladesh",
  timeZone: "Asia/Dhaka (GMT+06:00)",
  status: "Disable",
  isMarqueeMerchant: "No",
  bank: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  eftnNumber: "",
  settlementEmails: "",
  agreementDone: "No",
  agreementCopies: [],
  technicalPerson: "",
  salesforce: "",
  isMonthlyChargeAvailable: "No",
  monthlyChargeAmount: "",
  sector: "",
  tierClass: "",
  hunter: "",
  incubator: "",
  introducerKam: "",
  currentKam: "",
};

const countries = ["Bangladesh", "India", "USA", "UK", "Singapore", "UAE"];
const timeZones = [
  "Asia/Dhaka (GMT+06:00)",
  "Asia/Kolkata (GMT+05:30)",
  "UTC (GMT+00:00)",
];
const banks = [
  "City Bank",
  "Brac Bank",
  "Dutch Bangla Bank",
  "Eastern Bank",
  "HSBC",
  "Standard Chartered",
];
const sectors = [
  "Pureplay Ecommerce",
  "Hospitality, Travel & Aviation",
  "Telecommunication",
  "Business Services",
  "Bricks & Mortar",
  "Utility & Billing",
  "Education",
  "Healthcare",
  "Government",
  "Financial Institution",
];
const staffList = [
  "Sarah Ahmed",
  "Rahim Khan",
  "Anika Tabassum",
  "Tanvir Rahman",
  "Karim Ahmed",
  "Rezaul Karim",
  "Tariqul Islam",
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
  const hasError = !!errors[name as keyof MerchantFormData];

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
                checked={formData[name as keyof MerchantFormData] === opt}
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
          value={formData[name as keyof MerchantFormData] as string}
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
          value={formData[name as keyof MerchantFormData] as string}
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
          value={formData[name as keyof MerchantFormData] as string}
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
          {errors[name as keyof MerchantFormData]}
        </p>
      )}
    </div>
  );
};

export default function AddMerchantPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<FormStep>("form");
  const [formData, setFormData] = useState<MerchantFormData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof MerchantFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; file: File; progress: number; previewUrl: string | null }[]
  >([]);

  const validate = () => {
    const newErrors: Partial<Record<keyof MerchantFormData, string>> = {};
    if (!formData.merchantId) newErrors.merchantId = "Merchant ID is required";
    if (!formData.companyName)
      newErrors.companyName = "Company Name is required";
    if (!formData.contactPerson)
      newErrors.contactPerson = "Contact Person is required";
    if (!formData.companyAddress)
      newErrors.companyAddress = "Company Address is required";
    if (!formData.mobile) newErrors.mobile = "Mobile is required";
    if (!formData.sector) newErrors.sector = "Sector is required";

    if (
      formData.isMonthlyChargeAvailable === "Yes" &&
      !formData.monthlyChargeAmount
    ) {
      newErrors.monthlyChargeAmount =
        "Amount is required if monthly charge is available";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.merchants.create({
        id: formData.merchantId,
        name: formData.companyName,
        storeId: formData.merchantId.toLowerCase().replace(/\s+/g, "_"),
        status: formData.status === "Enable" ? "active" : "suspended",
        sector: formData.sector,
        ownerName: formData.currentKam || staffList[0],
        onboardingDate: new Date().toISOString().split("T")[0],
        type: "Online",
        contactName: formData.contactPerson,
        contactPhone: formData.mobile,
      });
      setStep("success");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to create merchant:", error);
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
    if (errors[name as keyof MerchantFormData]) {
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
        }
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, progress: Math.floor(progress) } : a,
          ),
        );
      }, 400);

      return { id, file, progress: 1, previewUrl };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    setFormData((prev) => ({
      ...prev,
      agreementCopies: [...prev.agreementCopies, ...selectedFiles],
    }));

    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    const attachmentToRemove = attachments.find((a) => a.id === id);
    if (attachmentToRemove?.previewUrl) {
      URL.revokeObjectURL(attachmentToRemove.previewUrl);
    }

    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setFormData((prev) => ({
      ...prev,
      agreementCopies: prev.agreementCopies.filter((f) =>
        attachmentToRemove ? f !== attachmentToRemove.file : true,
      ),
    }));
  };

  // Clean up preview URLs on unmount
  React.useEffect(() => {
    return () => {
      attachments.forEach(
        (a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl),
      );
    };
  }, []);

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Merchant Created Successfully!
        </h1>
        <p className="text-slate-600 mb-8 max-w-md text-center">
          The merchant master record for <b>{formData.companyName}</b> (ID:{" "}
          {formData.merchantId}) has been created.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/merchants")}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Back to List
          </button>
          <button
            onClick={() =>
              navigate(`/merchants/profile/${formData.merchantId}`)
            }
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            View Profile
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
          onClick={() => navigate("/merchants")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Merchants
        </button>
        <div className="flex items-center gap-3"></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Add New Merchant
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Fill in the merchant master record details below.
          </p>
        </div>

        <div className="p-6 space-y-10">
          {/* Merchant Info */}
          <div>
            <SectionHeader title="Merchant Info" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Merchant ID"
                name="merchantId"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
                helper="This is not changeable while it is saved"
              />
              <FormField
                label="Company Name"
                name="companyName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <FormField
                label="Contact Person"
                name="contactPerson"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Company Address"
                  name="companyAddress"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  required
                  multiline
                />
              </div>
              <FormField
                label="Email"
                name="email"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="This is a system email address. All emails will be sent to this id"
              />
              <FormField
                label="Mobile"
                name="mobile"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                required
              />
              <FormField
                label="Country"
                name="country"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={countries}
              />
              <FormField
                label="Time Zone"
                name="timeZone"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={timeZones}
              />
              <FormField
                label="Status"
                name="status"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Disable", "Enable", "Terminated"]}
              />
              <FormField
                label="Is Marquee Merchant"
                name="isMarqueeMerchant"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Yes", "No"]}
              />
            </div>
          </div>

          {/* Merchant Account */}
          <div>
            <SectionHeader title="Merchant Account" />
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
                label="Email Address(s) for Settlement Email"
                name="settlementEmails"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="Multiple email can be added with comma (,) separated. like email1@gmail.com,email2@gmail.com etc."
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

                    {attachments.length > 0 &&
                      attachments.every((a) => a.progress === 100) && (
                        <div className="mt-3 flex">
                          <span className="text-[10px] text-primary-600 font-bold hover:underline cursor-pointer bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100 flex items-center gap-1.5">
                            <Upload className="w-3 h-3" />
                            Add more files
                          </span>
                        </div>
                      )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SSL Contact Person */}
          <div>
            <SectionHeader title="SSL Contact Person" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Technical Person"
                name="technicalPerson"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={staffList}
              />
              <FormField
                label="SSLCOMMERZ Salesforce"
                name="salesforce"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={staffList}
              />
            </div>
          </div>

          {/* Monthly Charge */}
          <div>
            <SectionHeader title="Monthly Charge" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Is Available"
                name="isMonthlyChargeAvailable"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Yes", "No"]}
              />
              <FormField
                label="Amount"
                name="monthlyChargeAmount"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                required={formData.isMonthlyChargeAvailable === "Yes"}
                disabled={formData.isMonthlyChargeAvailable !== "Yes"}
              />
            </div>
          </div>

          {/* Business Profile */}
          <div>
            <SectionHeader title="Business Profile" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Sector"
                name="sector"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                required
                options={sectors}
              />
              <FormField
                label="Tier Class"
                name="tierClass"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={["A", "B", "C", "D"]}
              />
              <FormField
                label="Hunter"
                name="hunter"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={staffList}
              />
              <FormField
                label="Incubator"
                name="incubator"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={["Incubator 1", "Incubator 2"]}
              />
              <FormField
                label="Introducer (KAM)"
                name="introducerKam"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={staffList}
              />
              <FormField
                label="Current KAM"
                name="currentKam"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={staffList}
              />
            </div>
          </div>

          {/* Footer Remarks */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Approval Remarks
            </p>
            <p className="text-xs text-rose-500 font-medium mt-1">
              Required Data missing or invalid details may delay approval.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
