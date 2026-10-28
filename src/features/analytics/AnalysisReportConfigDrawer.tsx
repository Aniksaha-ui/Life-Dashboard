import React, { useState, useEffect } from "react";
import { Drawer } from "../../components/Drawer";
import { clsx } from "clsx";
import { AlertCircle, Activity } from "lucide-react";

// ── Section header — matches ResellerDrawer style ─────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100 mt-8 first:mt-0">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

// ── FormField — standard project pattern ─────────────────────────────────────
const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  helper,
  options,
  disabled,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  value?: string | boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  type?: string;
  helper?: string;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) => {
  const isCheckbox = type === "checkbox";

  return (
    <div className={clsx("mb-4", className)}>
      <label
        className={clsx(
          "block text-xs font-semibold text-slate-700 mb-1.5",
          isCheckbox && "flex items-center gap-2 cursor-pointer",
        )}
      >
        {isCheckbox && (
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={onChange}
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
        )}
        {label}
      </label>

      {!isCheckbox &&
        (type === "select" && options ? (
          <select
            name={name}
            value={(value as string) || ""}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={(value as string) || ""}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder || "Enter..."}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          />
        ))}

      {helper && (
        <p className="mt-1 text-[11px] text-slate-500 italic leading-normal">
          {helper}
        </p>
      )}
    </div>
  );
};

interface ConfigSectionProps {
  title: string;
  data: SectionData;
  onChange: (data: SectionData) => void;
}

interface SectionData {
  duration: string;
  type: string;
  minTrans: string;
  maxTrans: string;
  totalTrans: string;
  active: boolean;
}

const INITIAL_SECTION: SectionData = {
  duration: "1440",
  type: "Range",
  minTrans: "0",
  maxTrans: "10",
  totalTrans: "",
  active: true,
};

const FormRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 px-6 text-sm group hover:bg-slate-50/50 transition-colors">
    <dt className="w-full sm:w-1/3 text-slate-700 font-bold uppercase tracking-tight">
      {label}
    </dt>
    <dd className="w-full sm:w-2/3">{children}</dd>
  </div>
);

const ConfigSection = ({ title, data, onChange }: ConfigSectionProps) => (
  <section>
    <SectionHeader title={title} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
      <FormField
        label="Duration (Minutes)"
        name="duration"
        value={data.duration}
        onChange={(e) => onChange({ ...data, duration: e.target.value })}
        helper="Time duration for tracking analysis data."
      />
      <FormField
        label="Analysis Type"
        name="type"
        type="select"
        options={[
          { label: "Range", value: "Range" },
          { label: "Fixed", value: "Fixed" },
        ]}
        value={data.type}
        onChange={(e) => onChange({ ...data, type: e.target.value })}
      />
      <FormField
        label="Min Transactions"
        name="minTrans"
        value={data.minTrans}
        onChange={(e) => onChange({ ...data, minTrans: e.target.value })}
      />
      <FormField
        label="Max Transactions"
        name="maxTrans"
        value={data.maxTrans}
        onChange={(e) => onChange({ ...data, maxTrans: e.target.value })}
      />
      <div className="md:col-span-2">
        <FormField
          label="Total Transaction"
          name="totalTrans"
          value={data.totalTrans}
          onChange={(e) => onChange({ ...data, totalTrans: e.target.value })}
          placeholder="Enter total transaction..."
        />
      </div>
      <FormField
        label="Active"
        name="active"
        type="checkbox"
        value={data.active}
        onChange={(e) =>
          onChange({ ...data, active: (e.target as HTMLInputElement).checked })
        }
      />
    </div>
  </section>
);

interface AnalysisReportConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  store?: MerchantStore | null;
}

export function AnalysisReportConfigDrawer({
  open,
  onClose,
  store,
}: AnalysisReportConfigDrawerProps) {
  const [storeId, setStoreId] = useState("Select One");
  const [isStoreActive, setIsStoreActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initial states for the 4 sections
  const [successConfig, setSuccessConfig] = useState<SectionData>({
    ...INITIAL_SECTION,
    duration: "1400",
  });
  const [intlFailedConfig, setIntlFailedConfig] = useState<SectionData>({
    ...INITIAL_SECTION,
    duration: "2000",
  });
  const [failedConfig, setFailedConfig] =
    useState<SectionData>(INITIAL_SECTION);
  const [intlTransConfig, setIntlTransConfig] =
    useState<SectionData>(INITIAL_SECTION);

  // Sync storeId when drawer opens for a specific store
  useEffect(() => {
    if (open && store) {
      setStoreId(store.storeId);
    } else if (!open) {
      setStoreId("Select One");
    }
  }, [open, store]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    onClose();
  };

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">
        Analysis Report Config
      </div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <Activity className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono text-slate-400">
          {store?.storeId || "ST000000"}
        </span>
      </div>
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title={customTitle} width="2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="pb-28"
      >
        {/* ── Store Info Section ── */}
        <SectionHeader title="Store Selection" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="md:col-span-2">
            <FormField
              label="Store ID"
              name="storeId"
              type="select"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              options={[
                { label: "Select One", value: "Select One" },
                { label: "easyapp", value: "easyapp" },
                { label: "demotest", value: "demotest" },
              ]}
            />
          </div>
          <FormField
            label="Active"
            name="storeActive"
            type="checkbox"
            value={isStoreActive}
            onChange={(e) =>
              setIsStoreActive((e.target as HTMLInputElement).checked)
            }
          />
        </div>

        {/* ── Analysis Configurations ── */}
        <ConfigSection
          title="Success Transaction Analysis"
          data={successConfig}
          onChange={setSuccessConfig}
        />
        <ConfigSection
          title="Intl Failed Transaction Analysis"
          data={intlFailedConfig}
          onChange={setIntlFailedConfig}
        />
        <ConfigSection
          title="Failed Transaction Analysis"
          data={failedConfig}
          onChange={setFailedConfig}
        />
        <ConfigSection
          title="Intl Transaction Analysis"
          data={intlTransConfig}
          onChange={setIntlTransConfig}
        />

        {/* ── Sticky Footer ── */}
        <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)] -mx-6 px-6">
          <div className="flex items-center gap-3 py-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isSaving ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </Drawer>
  );
}
