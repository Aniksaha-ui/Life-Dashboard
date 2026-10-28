import { AlertCircle, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Drawer } from "../../components/Drawer";
import { clsx } from "clsx";
import type { GatewayRoutingRule } from "./types";

// Mock hour options (0:00 to 23:00)
const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, "0")}:00`,
  value: `${i.toString().padStart(2, "0")}:00`,
}));

const bankOptions = [
  { label: "Eastern Bank Limited", value: "Eastern Bank Limited" },
  { label: "Mutual Trust Bank Limited", value: "Mutual Trust Bank Limited" },
  { label: "United Commercial Bank Ltd", value: "United Commercial Bank Ltd" },
  { label: "City Bank", value: "City Bank" },
  { label: "BRAC Bank", value: "BRAC Bank" },
  { label: "Dutch-Bangla Bank", value: "Dutch-Bangla Bank" },
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
  disabled,
  isRadio,
}: any) => {
  const hasError = !!errors[name];

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
                checked={formData[name] === opt}
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
          value={formData[name] || ""}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200 shadow-sm",
          )}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((opt: { label: string; value: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm",
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
          {errors[name]}
        </p>
      )}
    </div>
  );
};

export default function GatewayRoutingDrawer() {
  const { ruleId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<GatewayRoutingRule>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock initial data fetch
  useEffect(() => {
    if (ruleId) {
      // In a real app, fetch from API. Mocking for now:
      setFormData({
        id: ruleId,
        strid: `mer_${ruleId}001`,
        startHour: "08:00",
        endHour: "18:00",
        bankName: "Eastern Bank Limited",
        status: "Active",
      });
    }
  }, [ruleId]);

  const onClose = () => {
    navigate("/gateway-routing");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.strid) newErrors.strid = "Store ID is required";
    if (!formData.startHour) newErrors.startHour = "Start Hour is required";
    if (!formData.endHour) newErrors.endHour = "End Hour is required";
    if (!formData.bankName) newErrors.bankName = "Bank Name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsUpdating(true);
      setTimeout(() => {
        setIsUpdating(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <Drawer
      open={true}
      onClose={onClose}
      title="Edit Routing Configuration"
      width="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <section>
          <SectionHeader title="Configuration Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="md:col-span-2">
              <FormField
                label="Store ID"
                name="strid"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                helper="The unique identifier for the merchant store."
              />
            </div>
            <FormField
              label="Start Hour"
              name="startHour"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              type="select"
              options={hourOptions}
            />
            <FormField
              label="End Hour"
              name="endHour"
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              type="select"
              options={hourOptions}
            />
            <div className="md:col-span-2">
              <FormField
                label="Bank Name"
                name="bankName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={bankOptions}
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <FormField
                label="Status"
                name="status"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Active", "Inactive"]}
              />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-8 px-8 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isUpdating}
              className={clsx(
                "bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2",
                isUpdating && "cursor-not-allowed",
              )}
            >
              {isUpdating && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isUpdating ? "Updating..." : "Update Configuration"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-slate-600 px-6 py-2.5 rounded-lg font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </Drawer>
  );
}
