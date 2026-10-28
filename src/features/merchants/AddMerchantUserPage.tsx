import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, AlertCircle, UserPen } from "lucide-react";
import { clsx } from "clsx";
import { api } from "../../lib/api/client";
import { Drawer } from "../../components/Drawer";
import type { MerchantUser } from "../../data/mock/types";

// ── Matches ResellerDrawer / ResetPasswordModal SectionHeader ─────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

// ── FormField identical to ResellerDrawer pattern ────────────────────────────
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
  placeholder,
  value,
}: any) => {
  const hasError = !!errors[name];

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>

      {type === "static" ? (
        <div className="px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg min-h-[38px] flex items-center">
          {value || formData?.[name] || "—"}
        </div>
      ) : isRadio ? (
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
          disabled={disabled}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((opt: any) => (
            <option
              key={typeof opt === "string" ? opt : opt.value}
              value={typeof opt === "string" ? opt : opt.value}
            >
              {typeof opt === "string" ? opt : opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData?.[name] || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
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

// ─────────────────────────────────────────────────────────────────────────────

const initialData: Partial<MerchantUser> = {
  loginId: "",
  firstName: "",
  email: "",
  mobile: "",
  role: "Merchant User",
  status: "De-active",
  storeGroup: "",
  merchantAppRole: "",
  allowedIpList: "",
};

interface AddMerchantUserPageProps {
  mode?: "add" | "edit";
}

export default function AddMerchantUserPage({
  mode = "add",
}: AddMerchantUserPageProps) {
  const navigate = useNavigate();
  const { merchantId, userId } = useParams();

  const [formData, setFormData] = useState<Partial<MerchantUser>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const backPath = `/merchants/users/${merchantId}`;

  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.merchants.get(merchantId!),
  });

  const { data: existingUser } = useQuery({
    queryKey: ["merchant-user", userId],
    queryFn: async () => {
      if (mode === "edit" && userId) {
        const users = await api.merchants.getUsers(merchantId!);
        return users.find((u) => u.loginId === userId);
      }
      return null;
    },
    enabled: mode === "edit" && !!userId,
  });

  useEffect(() => {
    if (mode === "edit" && existingUser) {
      setFormData(existingUser);
    }
  }, [mode, existingUser]);

  const handleClose = () => navigate(backPath);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.loginId) newErrors.loginId = "Login name is required";
    if (!formData.firstName) newErrors.firstName = "User Name is required";
    if (!formData.email) newErrors.email = "Email Address is required";
    if (!formData.mobile) newErrors.mobile = "Mobile Number is required";
    if (!formData.role) newErrors.role = "User Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => ({ ...prev, [name]: undefined as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1600);
  };

  const drawerTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">
        {mode === "add" ? "Add New User" : "Edit User"}
      </div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <UserPen className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">{merchant?.name}</span>
      </div>
    </div>
  );

  return (
    <Drawer open onClose={handleClose} title={drawerTitle} width="xl">
      <div className="pb-24">
        {isSuccess ? (
          /* ── Success state ──────────────────────────────────── */
          <div className="flex flex-col items-center text-center space-y-5 py-16">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                User {mode === "add" ? "Created" : "Updated"} Successfully!
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                The record for{" "}
                <span className="font-semibold text-slate-700">
                  {formData.firstName}
                </span>{" "}
                has been {mode === "add" ? "created" : "updated"}.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── User's Profile ──────────────────────────── */}
            <section>
              <SectionHeader title="User's Profile" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
                <FormField
                  label="Merchant Name"
                  name="merchantName"
                  value={merchant?.name}
                  handleChange={() => {}}
                  errors={{}}
                  type="static"
                />
                <FormField
                  label="User Name"
                  name="firstName"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  placeholder="Enter..."
                />
                <FormField
                  label="Mobile Number"
                  name="mobile"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  type="tel"
                  placeholder="Enter..."
                />
                <FormField
                  label="Email Address"
                  name="email"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  type="email"
                  placeholder="Enter..."
                />
              </div>
            </section>

            {/* ── User's Credentials ──────────────────────── */}
            <section>
              <SectionHeader title="User's Credentials" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
                <FormField
                  label="Login Name"
                  name="loginId"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  disabled={mode === "edit"}
                  placeholder="Enter..."
                />
                <FormField
                  label="User Role"
                  name="role"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  type="select"
                  placeholder="Select user role"
                  options={[
                    { label: "Merchant User", value: "Merchant User" },
                    { label: "Merchant Admin", value: "Merchant Admin" },
                    { label: "Support Agent", value: "Support Agent" },
                  ]}
                />
                <FormField
                  label="Store Group"
                  name="storeGroup"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  placeholder="Enter..."
                />
                <FormField
                  label="Merchant App Role"
                  name="merchantAppRole"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  type="select"
                  placeholder="Select Merchant Role"
                  options={[
                    { label: "Merchant App Role", value: "Merchant App Role" },
                  ]}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="Allowed IP List"
                    name="allowedIpList"
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    placeholder="Multiple IPs could be configured by comma separate."
                    helper="Multiple IPs could be configured by comma separate."
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    label="Login Status"
                    name="status"
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    isRadio
                    options={["De-active", "Active"]}
                  />
                </div>
              </div>
            </section>

            {/* ── Sticky footer — matches ResellerDrawer ───── */}
            <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isSubmitting
                  ? "Saving..."
                  : mode === "add"
                    ? "Create User"
                    : "Update User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
