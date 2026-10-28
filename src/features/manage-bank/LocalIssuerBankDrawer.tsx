import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Drawer } from "../../components/Drawer";
import { api } from "../../lib/api/client";
import type { LocalIssuerBank } from "../../data/mock/types";
import { clsx } from "clsx";

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
  disabled,
  required,
}: any) => {
  const hasError = !!errors[name];

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        className={clsx(
          "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all",
          disabled ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "",
          hasError ? "border-rose-300 focus:ring-rose-500" : "border-slate-200",
        )}
        placeholder={`Enter ${label.toLowerCase()}`}
        disabled={disabled}
      />
      {helper && (
        <p className="mt-1 text-[11px] text-slate-500 italic flex items-start gap-1 leading-normal">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
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

export function LocalIssuerBankDrawer() {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<LocalIssuerBank>>({});
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const { data: bank, isLoading } = useQuery({
    queryKey: ["local-issuer-bank", bankId],
    queryFn: () => api.localIssuerBanks.get(bankId!),
    enabled: !!bankId,
  });

  useEffect(() => {
    if (bank) {
      setFormData({
        ...bank,
        generalEmiRate: bank.generalEmiRate || bank.emiRate || "",
        specialEmiRate: bank.specialEmiRate || "",
        emiContactEmail: bank.emiContactEmail || "",
        emiEnabledStore: bank.emiEnabledStore || "",
        emiAccountNo: bank.emiAccountNo || "",
        emiAccountName: bank.emiAccountName || "",
        branch: bank.branch || "",
        emiBankAddress: bank.emiBankAddress || "",
        bankLogo: bank.bankLogo || "",
        emiProductLogo: bank.emiProductLogo || "",
        bankContactEmail: bank.bankContactEmail || "",
        bankContactPhone: bank.bankContactPhone || "",
        lastEmailSentOn: bank.lastEmailSentOn || bank.lastEmailSent || "",
        lastEmailSentStatus: bank.lastEmailSentStatus || bank.emailStatus || "",
      });
    }
  }, [bank]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<LocalIssuerBank>) =>
      api.localIssuerBanks.update(bankId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-issuer-banks-list"] });
      queryClient.invalidateQueries({
        queryKey: ["local-issuer-bank", bankId],
      });
      onClose();
    },
  });

  const onClose = () => {
    navigate("/manage-bank/local-issuer-bank");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.swiftCode) newErrors.swiftCode = "SWIFT Code is required";
    if (!formData.npsbCode) newErrors.npsbCode = "NPSB Code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading || !bank) {
    return (
      <Drawer open={true} onClose={onClose} width="xl">
        <div className="p-8 text-center text-slate-500">
          Loading bank details...
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      open={true}
      onClose={onClose}
      title="Edit Local Issuer Bank"
      width="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        {/* Bank Info Section */}
        <section>
          <SectionHeader title="Bank Info" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <div className="md:col-span-2">
              <FormField
                label="Bank Name"
                name="bankName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                disabled
              />
            </div>
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
              label="Branch"
              name="branch"
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
            <div className="md:col-span-2">
              <FormField
                label="EMI Bank Address"
                name="emiBankAddress"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            </div>
          </div>
        </section>

        {/* EMI Configuration Section */}
        <section>
          <SectionHeader title="EMI Configuration" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
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
            <div className="md:col-span-2">
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
        </section>

        {/* Assets & Contacts Section */}
        <section>
          <SectionHeader title="Assets & Contacts" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
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
        </section>

        {/* Reporting & SSL Contact Section */}
        <section>
          <SectionHeader title="Reporting & SSL Contact" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FormField
              label="Last Report Sent"
              name="lastReportingDate"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              disabled
            />
            <FormField
              label="Report Send On"
              name="reportSendOn"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />
            <FormField
              label="SSL Contact Email"
              name="sslEmail"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />
            <FormField
              label="SSL Contact Mobile"
              name="sslMobile"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />
            <FormField
              label="Last Email Sent On"
              name="lastEmailSentOn"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              disabled
            />
            <FormField
              label="Last Email Sent Status"
              name="lastEmailSentStatus"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              disabled
            />
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {updateMutation.isPending ? "Updating..." : "Update Bank"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
