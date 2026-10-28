import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  AlertCircle,
  Info,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";

type FormStep = "form" | "success";

interface AnalysisCategoryFormData {
  name: string;
  columnName: string;
  description: string;
  duration: string;
  type: string;
  active: boolean;
  specialCase: boolean;
}

const initialData: AnalysisCategoryFormData = {
  name: "",
  columnName: "",
  description: "",
  duration: "",
  type: "",
  active: true,
  specialCase: false,
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
  isRadio,
}: any) => {
  const hasError = !!errors[name as keyof AnalysisCategoryFormData];

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
        {label}
      </label>

      {isRadio ? (
        <div className="flex gap-6 mt-2 h-9 items-center">
          {options.map((opt: string) => (
            <label
              key={opt}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name={name}
                value={opt.toLowerCase()}
                checked={
                  name === "active"
                    ? (formData[name] ? "active" : "inactive") ===
                      opt.toLowerCase()
                    : (formData[name] ? "yes" : "no") === opt.toLowerCase()
                }
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500 cursor-pointer transition-all"
              />
              <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-wide font-bold">
                {opt}
              </span>
            </label>
          ))}
        </div>
      ) : type === "select" ? (
        <select
          name={name}
          value={formData[name as keyof AnalysisCategoryFormData] as string}
          onChange={handleChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center]",
            hasError
              ? "border-rose-300 focus:ring-rose-500"
              : "border-slate-200",
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
            backgroundSize: "0.8rem",
          }}
          disabled={disabled}
        >
          <option value="">{options[0]?.label || `Select ${label}`}</option>
          {options.slice(1).map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          name={name}
          value={formData[name as keyof AnalysisCategoryFormData] as string}
          onChange={handleChange}
          rows={4}
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
          value={formData[name as keyof AnalysisCategoryFormData] as string}
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
          {errors[name as keyof AnalysisCategoryFormData]}
        </p>
      )}
    </div>
  );
};

export default function AddAnalysisCategoryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<FormStep>("form");
  const [formData, setFormData] =
    useState<AnalysisCategoryFormData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AnalysisCategoryFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<Record<keyof AnalysisCategoryFormData, string>> =
      {};
    if (!formData.name) newErrors.name = "Analysis Category Name is required";
    if (!formData.columnName) newErrors.columnName = "Column Name is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    if (!formData.type) newErrors.type = "Type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("success");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to create analysis category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    let val: any = value;

    if (type === "radio") {
      if (name === "active") val = value === "active";
      if (name === "specialCase") val = value === "yes";
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name as keyof AnalysisCategoryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm ring-8 ring-emerald-50/50">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Category Created Successfully!
        </h1>
        <p className="text-slate-500 mb-10 max-w-md text-center text-sm font-medium">
          The global analysis category has been indexed and is ready for use in
          reports.
        </p>

        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-10">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Category Summary
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wide">
              Ready
            </span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Category Name
              </p>
              <p className="font-bold text-slate-800 text-lg leading-tight">
                {formData.name}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Column Name
              </p>
              <code className="text-primary-600 font-mono font-bold leading-none">
                {formData.columnName}
              </code>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Duration
              </p>
              <p className="font-semibold text-slate-700 leading-none">
                {formData.duration} Mins
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Status
              </p>
              <p
                className={clsx(
                  "font-bold flex items-center gap-1 leading-none uppercase text-[12px]",
                  formData.active ? "text-emerald-600" : "text-slate-400",
                )}
              >
                {formData.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Special Case
              </p>
              <p className="font-medium text-slate-600 leading-none">
                {formData.specialCase ? "Yes" : "No"}
              </p>
            </div>
          </div>
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 italic text-[11px] text-slate-400 text-center">
            Category registered on{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setFormData(initialData);
              setStep("form");
              window.scrollTo(0, 0);
            }}
            className="px-8 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Another Category
          </button>
          <button
            onClick={() => navigate("/analysis-categories")}
            className="px-8 py-3 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-200 flex items-center gap-2"
          >
            View Category List
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
          onClick={() => navigate("/analysis-categories")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Analysis Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between font-roboto">
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Add Global Analysis Category
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-12">
          {/* Basic Info Section */}
          <div>
            <SectionHeader title="Analysis Category" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <div className="lg:col-span-2">
                <FormField
                  label="Name"
                  name="name"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  placeholder="Enter Analysis Category Name"
                />
              </div>
              <FormField
                label="Column Name"
                name="columnName"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={[
                  { label: "Select One", value: "" },
                  { label: "Success", value: "success" },
                  { label: "Failed", value: "failed" },
                  { label: "International", value: "international" },
                ]}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  label="Description"
                  name="description"
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  multiline
                />
              </div>
            </div>
          </div>

          {/* Default Configuration Section */}
          <div>
            <SectionHeader title="Default Configuration" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Duration"
                name="duration"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                placeholder="Enter Duration In Minutes"
              />
              <FormField
                label="Type"
                name="type"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                type="select"
                options={[
                  { label: "Select Type", value: "" },
                  { label: "Range", value: "range" },
                  { label: "Exact", value: "exact" },
                ]}
              />
              <div className="hidden lg:block" /> {/* Grid Alignment Spacer */}
              <FormField
                label="Active"
                name="active"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Active", "Inactive"]}
              />
              <FormField
                label="Special Case"
                name="specialCase"
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isRadio
                options={["Yes", "No"]}
              />
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-8 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-10 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md shadow-primary-100 flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isSubmitting ? "Processing..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
