import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { AlertCircle, Check, File, Info, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Drawer } from "../../components/Drawer";
import type { Merchant, MerchantStatus } from "../../data/mock/types";
import { api } from "../../lib/api/client";

interface MerchantEditFormData {
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
  bank: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  eftnNumber: string;
  settlementEmails: string;
  agreementDone: "Yes" | "No";
  agreementCopies: File[];
  technicalPerson: string;
  salesforce: string;
  isMonthlyChargeAvailable: "Yes" | "No";
  monthlyChargeAmount: string;
  sector: string;
  tierClass: string;
  hunter: string;
  incubator: string;
  introducerKam: string;
  currentKam: string;
}

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
  "E-commerce",
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

const emptyForm: MerchantEditFormData = {
  merchantId: "",
  companyName: "",
  contactPerson: "",
  companyAddress: "",
  email: "",
  mobile: "",
  country: "Bangladesh",
  timeZone: "Asia/Dhaka (GMT+06:00)",
  status: "Enable",
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
  monthlyChargeAmount: "0.00",
  sector: "",
  tierClass: "",
  hunter: "",
  incubator: "",
  introducerKam: "",
  currentKam: "",
};

function mapStatusToForm(
  status: MerchantStatus,
): MerchantEditFormData["status"] {
  if (status === "active") return "Enable";
  if (status === "suspended") return "Terminated";
  return "Disable";
}

function mapFormStatusToMerchant(
  status: MerchantEditFormData["status"],
): MerchantStatus {
  if (status === "Enable") return "active";
  if (status === "Terminated") return "suspended";
  return "inactive";
}

function merchantToForm(merchant: Merchant): MerchantEditFormData {
  return {
    ...emptyForm,
    merchantId: merchant.id,
    companyName: merchant.name,
    contactPerson: merchant.contactName || "",
    companyAddress: merchant.companyAddress || "",
    email: merchant.email || "",
    mobile: merchant.contactPhone || "",
    country: merchant.contactCountry || "Bangladesh",
    timeZone: merchant.timeZone || "Asia/Dhaka (GMT+06:00)",
    status: mapStatusToForm(merchant.status),
    isMarqueeMerchant: merchant.isMarqueeMerchant ? "Yes" : "No",
    bank: merchant.bank || "",
    branchName: merchant.branchName || "",
    accountName: merchant.accountName || merchant.name.toUpperCase(),
    accountNumber: merchant.accountNumber || "",
    eftnNumber: merchant.eftnNumber || "",
    settlementEmails: merchant.settlementEmails || merchant.email || "",
    agreementDone: merchant.agreementDone ? "Yes" : "No",
    technicalPerson: merchant.techSupportBy || "",
    salesforce: merchant.salesforce || "",
    isMonthlyChargeAvailable: merchant.isMonthlyChargeAvailable ? "Yes" : "No",
    monthlyChargeAmount: merchant.monthlyChargeAmount ?? "0.00",
    sector: merchant.sector || "",
    tierClass: merchant.tierClass || "",
    hunter: merchant.hunter || "",
    incubator: merchant.incubator || "",
    introducerKam: merchant.introducerKam || "",
    currentKam: merchant.currentKam || merchant.ownerName || "",
  };
}

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
  const hasError = !!errors[name as keyof MerchantEditFormData];

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
                checked={formData[name as keyof MerchantEditFormData] === opt}
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
          value={formData[name as keyof MerchantEditFormData] as string}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
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
          value={formData[name as keyof MerchantEditFormData] as string}
          onChange={handleChange}
          rows={2}
          disabled={disabled}
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
          value={formData[name as keyof MerchantEditFormData] as string}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          placeholder={`Enter ${label.toLowerCase()}`}
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
          {errors[name as keyof MerchantEditFormData]}
        </p>
      )}
    </div>
  );
};

export function MerchantEditDrawer() {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<MerchantEditFormData>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof MerchantEditFormData, string>>
  >({});
  const [attachments, setAttachments] = useState<
    { id: string; file: File; progress: number; previewUrl: string | null }[]
  >([]);

  const { data: merchant, isLoading } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.merchants.get(merchantId!),
    enabled: !!merchantId,
  });

  useEffect(() => {
    if (merchant) {
      setFormData(merchantToForm(merchant));
      setErrors({});
      setAttachments([]);
    }
  }, [merchant]);

  const onClose = () => {
    const search = searchParams.toString();
    navigate({ pathname: "/merchants", search: search ? `?${search}` : "" });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Merchant>) =>
      api.merchants.update(merchantId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      queryClient.invalidateQueries({ queryKey: ["merchant", merchantId] });
      toast.success("Merchant updated successfully");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update merchant");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof MerchantEditFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof MerchantEditFormData, string>> = {};
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateMutation.mutate({
      name: formData.companyName,
      status: mapFormStatusToMerchant(formData.status),
      sector: formData.sector,
      ownerName: formData.currentKam || formData.companyName,
      contactName: formData.contactPerson,
      contactPhone: formData.mobile,
      contactCountry: formData.country,
      companyAddress: formData.companyAddress,
      email: formData.email,
      timeZone: formData.timeZone,
      isMarqueeMerchant: formData.isMarqueeMerchant === "Yes",
      bank: formData.bank,
      branchName: formData.branchName,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      eftnNumber: formData.eftnNumber,
      settlementEmails: formData.settlementEmails,
      agreementDone: formData.agreementDone === "Yes",
      techSupportBy: formData.technicalPerson,
      salesforce: formData.salesforce,
      isMonthlyChargeAvailable: formData.isMonthlyChargeAvailable === "Yes",
      monthlyChargeAmount: formData.monthlyChargeAmount,
      tierClass: formData.tierClass,
      hunter: formData.hunter,
      incubator: formData.incubator,
      introducerKam: formData.introducerKam,
      currentKam: formData.currentKam,
      updatedBy: "KAM Admin",
      updatedOn: new Date().toISOString(),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newAttachments = selectedFiles.map((file) => {
      const id = Math.random().toString(36).substring(7);
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
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

  useEffect(() => {
    return () => {
      attachments.forEach(
        (a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !merchant) {
    return (
      <Drawer open={true} onClose={onClose} title="Edit Merchant" width="2xl">
        <div className="py-12 text-center text-slate-500 text-sm">
          Loading merchant...
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer open={true} onClose={onClose} title="Edit Merchant" width="2xl">
      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <section>
          <SectionHeader title="Merchant Info" />
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <FormField
                label="Merchant ID"
                name="merchantId"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                disabled
                helper="This is not changeable while it is saved"
              />
              <FormField
                label="Company Name"
                name="companyName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <FormField
                label="Contact Person"
                name="contactPerson"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              <div className="md:col-span-2">
                <FormField
                  label="Company Address"
                  name="companyAddress"
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
                helper="This is a system email address. All emails will be sent to this id"
              />
              <FormField
                label="Mobile"
                name="mobile"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
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
                type="select"
                options={["Yes", "No"]}
              />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Merchant Account" />
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
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
                helper="'COMA' separate accepted to add more email addresses to send settlement email"
              />
              <FormField
                label="Whether Agreement Done"
                name="agreementDone"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={["Yes", "No"]}
              />
              <div className="md:col-span-2">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Agreement Copy
                  </label>
                  <label
                    htmlFor="editAgreementCopyInput"
                    className={clsx(
                      "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-2 transition-all",
                      formData.agreementDone === "Yes"
                        ? "border-slate-200 hover:border-primary-400 bg-slate-50/50 cursor-pointer"
                        : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed",
                    )}
                  >
                    <input
                      type="file"
                      id="editAgreementCopyInput"
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
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  ev.stopPropagation();
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
                            {formData.agreementDone === "Yes"
                              ? "Choose file"
                              : "No file chosen"}
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="SSL Contact Person" />
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
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
        </section>

        <section>
          <SectionHeader title="Monthly Charge" />
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <FormField
                label="Is Available"
                name="isMonthlyChargeAvailable"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={["Yes", "No"]}
              />
              <FormField
                label="Amount"
                name="monthlyChargeAmount"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="number"
                disabled={formData.isMonthlyChargeAvailable !== "Yes"}
              />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="Business Profile" />
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <FormField
                label="Sector"
                name="sector"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={sectors}
                helper={
                  formData.sector
                    ? `Current sector is '${formData.sector}'`
                    : undefined
                }
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
        </section>

        <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
          >
            {updateMutation.isPending && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {updateMutation.isPending ? "Updating..." : "Update Merchant"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
