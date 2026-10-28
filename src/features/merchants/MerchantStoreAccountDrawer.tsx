import React, { useState, useEffect } from "react";
import { Drawer } from "../../components/Drawer";
import { AlertCircle, Landmark } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import { clsx } from "clsx";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

// ── FormField — identical pattern ─────────────────────────────────────────────
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
  multiline,
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
  multiline?: boolean;
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
          required={required}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={4}
          disabled={disabled}
          placeholder={placeholder || `Enter...`}
          className={clsx(inputCls, "resize-none")}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || (disabled ? "" : `Enter...`)}
          className={inputCls}
          required={required}
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

const BANK_OPTIONS = [
  { label: "CITY BANK LIMITED", value: "CITY BANK LIMITED" },
  { label: "BRAC BANK LIMITED", value: "BRAC BANK LIMITED" },
  { label: "DUTCH BANGLA BANK", value: "DUTCH BANGLA BANK" },
  { label: "ISLAMI BANK", value: "ISLAMI BANK" },
];

const MFS_OPTIONS = [
  { label: "Select One", value: "" },
  { label: "bKash", value: "bKash" },
  { label: "Nagad", value: "Nagad" },
  { label: "Rocket", value: "Rocket" },
  { label: "Upay", value: "Upay" },
];

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
}

export function MerchantStoreAccountDrawer({ store, onClose }: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        storeName: store.storeName,
        storeId: store.storeId,
        accountPayee: "WELCOME ELECTRONICS",
        bankName: "CITY BANK LIMITED",
        branchName: "ROKEYA SARANI",
        accountNu: "1503384222001",
        routeNumber: "225260991",
        mfsName: "",
        mfsNumber: "",
        remarks: "",
      });
      setErrors({});
      setIsSuccess(false);
    }
  }, [store]);

  if (!store) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.accountPayee) newErrors.accountPayee = "Required";
    if (!form.bankName) newErrors.bankName = "Required";
    if (!form.branchName) newErrors.branchName = "Required";
    if (!form.accountNu) newErrors.accountNu = "Required";
    if (!form.routeNumber) newErrors.routeNumber = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      <div className="text-xl font-bold text-slate-900">
        Account Information
      </div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <Landmark className="w-3.5 h-3.5 text-slate-400" />
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
              <Landmark className="w-9 h-9 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Account Updated Successfully!
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Bank details for{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {store.storeName}
                </span>{" "}
                have been saved.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <SectionHeader title="Store Information" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 mb-1">
                      Store Name
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {f("storeName")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 mb-1">
                      Store Id
                    </span>
                    <span className="text-sm font-mono font-medium text-slate-900">
                      {f("storeId")}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="Bank & Account Details" />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <div className="md:col-span-2">
                    <FormField
                      label="Account Payee"
                      name="accountPayee"
                      value={f("accountPayee")}
                      onChange={handleChange}
                      required
                      errors={errors}
                      helper="Do not change the payee name if the change is avoidable!"
                    />
                  </div>

                  <FormField
                    label="Bank Name"
                    name="bankName"
                    value={f("bankName")}
                    onChange={handleChange}
                    type="select"
                    options={BANK_OPTIONS}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Branch Name"
                    name="branchName"
                    value={f("branchName")}
                    onChange={handleChange}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Account Nu"
                    name="accountNu"
                    value={f("accountNu")}
                    onChange={handleChange}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="Route Number"
                    name="routeNumber"
                    value={f("routeNumber")}
                    onChange={handleChange}
                    required
                    errors={errors}
                  />
                  <FormField
                    label="MFS Name"
                    name="mfsName"
                    value={f("mfsName")}
                    onChange={handleChange}
                    type="select"
                    options={MFS_OPTIONS}
                  />
                  <FormField
                    label="MFS Number"
                    name="mfsNumber"
                    value={f("mfsNumber")}
                    onChange={handleChange}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      label="Remarks"
                      name="remarks"
                      value={f("remarks")}
                      onChange={handleChange}
                      multiline
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Sticky footer ────────────────────────────────── */}
            <div className="pt-4 mt-6 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isSubmitting ? "Updating..." : "Update Account Info"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
}
