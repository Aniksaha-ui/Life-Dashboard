import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, AlertCircle, Info, Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Drawer } from "../../components/Drawer";
import { api } from "../../lib/api/client";
import type { Reseller } from "../../data/mock/types";
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
  options,
  multiline,
  disabled,
  isRadio,
}: any) => {
  const hasError = !!errors[name as keyof Reseller];

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
                checked={formData[name as keyof Reseller] === opt}
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
          value={formData[name as keyof Reseller] as string}
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
          value={formData[name as keyof Reseller] as string}
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
          value={formData[name as keyof Reseller] as string}
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
          {errors[name as keyof Reseller]}
        </p>
      )}
    </div>
  );
};

export function ResellerDrawer() {
  const { resellerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<Reseller>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof Reseller, string>>>(
    {},
  );

  const { data: reseller, isLoading } = useQuery({
    queryKey: ["reseller", resellerId],
    queryFn: () => api.resellers.get(resellerId!),
    enabled: !!resellerId,
  });

  useEffect(() => {
    if (reseller) {
      setFormData(reseller);
    }
  }, [reseller]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Reseller>) =>
      api.resellers.update(resellerId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resellers-list"] });
      queryClient.invalidateQueries({ queryKey: ["reseller", resellerId] });
      onClose();
    },
  });

  const onClose = () => {
    if (location.pathname.includes("/resellers/op-list")) {
      navigate("/resellers/op-list");
      return;
    }
    navigate("/resellers");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Reseller]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof Reseller, string>> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading || !reseller) {
    return (
      <Drawer open={true} onClose={onClose} width="xl">
        <div className="p-8 text-center text-slate-500">
          Loading reseller profile...
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer open={true} onClose={onClose} title="Edit Reseller" width="xl">
      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        {/* Reseller Info Section */}
        <section>
          <SectionHeader title="Reseller Info" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <div className="md:col-span-2">
              <FormField
                label="Name"
                name="name"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
            </div>
            <div className="md:col-span-2">
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
        </section>

        {/* Reseller Account Section */}
        <section>
          <SectionHeader title="Reseller Account" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FormField
              label="Bank"
              name="bank"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              type="select"
              options={[
                "City Bank",
                "BRAC Bank",
                "Dutch-Bangla Bank",
                "Eastern Bank",
              ]}
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
              type="number"
            />
            <FormField
              label="Reseller Charge"
              name="resellerCharge"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              type="number"
            />

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                Agreement Copy
              </label>
              <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-200 border-dashed rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {reseller.agreementCopy || "reseller_agreement.pdf"}
                    </p>
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Agreement Verified
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-bold text-primary-600 hover:text-primary-700 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm transition-all"
                  >
                    View File
                  </button>
                </div>
                <div className="pt-2 border-t border-slate-200/50">
                  <p className="text-[10px] text-slate-500 italic">
                    To update the agreement copy, please add a new record or
                    contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {updateMutation.isPending ? "Updating..." : "Update Reseller"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
