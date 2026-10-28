import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Info,
  Upload,
  Search,
  Check,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { parseISO, isAfter } from "date-fns";
import { toast } from "react-hot-toast";
import { CAMPAIGN_SECTORS_LIST } from "./utils/sectors";
import { DateRangePicker } from "../../components/DateRangePicker";
import { DatePicker } from "../../components/DatePicker";

type CampaignFormErrors = {
  campaignName?: string;
  campaignDateRange?: string;
  selectedSectors?: string;
  enrollmentLastDate?: string;
  banner?: string;
  description?: string;
  paymentPartners?: string;
};

const MAX_BANNER_SIZE_MB = 5;

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
  value,
  onChange,
  type = "text",
  helper,
  options,
  multiline,
  icon: Icon,
  error,
}: any) => {
  const hasError = Boolean(error);

  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
        {label}
      </label>

      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={clsx(
            "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all",
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
          value={value}
          onChange={onChange}
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
        <div className="relative">
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={clsx(
              "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all",
              Icon && "pl-10",
              hasError
                ? "border-rose-300 focus:ring-rose-500"
                : "border-slate-200",
            )}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          )}
        </div>
      )}

      {helper && (
        <p className="mt-1.5 text-[11px] text-slate-500 italic flex items-start gap-1 leading-normal">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {helper}
        </p>
      )}
      {hasError && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  return (
    <div className="mb-6 relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full min-h-[38px] px-3 py-1.5 text-sm bg-white border rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-all select-none",
          error && !isOpen && "border-rose-300",
          isOpen
            ? "border-primary-500 ring-2 ring-primary-500/20"
            : !error && "border-slate-200 hover:border-slate-300",
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 py-0.5">
          {selected.length === 0 ? (
            <span className="text-slate-400 text-sm">
              Select {label.toLowerCase()}...
            </span>
          ) : (
            <>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(selected[0]);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200 text-[11px] font-bold text-primary-700 hover:bg-primary-100 transition-colors shrink-0"
              >
                <span className="truncate max-w-[150px]">{selected[0]}</span>
                <X className="w-3 h-3 text-primary-500 hover:text-primary-700 shrink-0" />
              </span>
              {selected.length > 1 && (
                <span
                  className="inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded border text-[10px] font-bold bg-slate-100/90 text-slate-600 border-slate-200/80 shrink-0"
                  title={selected.slice(1).join(", ")}
                >
                  +{selected.length - 1}
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-slate-400 transition-transform shrink-0",
            isOpen && "rotate-180",
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search sectors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-7 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              className="text-[11px] font-bold text-primary-600 hover:text-primary-700 hover:underline px-1 whitespace-nowrap shrink-0"
            >
              {selected.length === options.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic">
                No sectors found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(opt);
                    }}
                    className={clsx(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none",
                      isChecked
                        ? "bg-primary-50/80 text-primary-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 border",
                        isChecked
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "border-slate-300 bg-white",
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3px]" />}
                    </div>
                    <span className="truncate">{opt}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default function AddMerchantCampaignPage() {
  const navigate = useNavigate();

  // Form Data State
  const [formData, setFormData] = useState({
    campaignName: "",
    selectedSectors: [] as string[],
    campaignDateRange: { startDate: "", endDate: "" },
    enrollmentLastDate: "",
    description: "",
    selectedBanks: [] as string[],
    selectedMfs: [] as string[],
    selectedIb: [] as string[],
  });

  const [errors, setErrors] = useState<CampaignFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof CampaignFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBannerFile = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      setErrors((prev) => ({
        ...prev,
        banner: "Please upload a valid image file (PNG, JPG, etc.)",
      }));
      return;
    }

    if (file.size > MAX_BANNER_SIZE_MB * 1024 * 1024) {
      toast.error(`Banner must be under ${MAX_BANNER_SIZE_MB}MB`);
      setErrors((prev) => ({
        ...prev,
        banner: `Banner file must be less than ${MAX_BANNER_SIZE_MB}MB`,
      }));
      return;
    }

    setBannerFileName(file.name);
    setBannerPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, banner: undefined }));
  };

  const clearBanner = () => {
    setBannerFileName(null);
    setBannerPreviewUrl(null);
  };

  const validate = () => {
    const newErrors: CampaignFormErrors = {};
    const trimmedName = formData.campaignName.trim();

    if (!trimmedName) {
      newErrors.campaignName = "Campaign name is required";
    } else if (trimmedName.length < 3) {
      newErrors.campaignName = "Campaign name must be at least 3 characters";
    }

    const { startDate, endDate } = formData.campaignDateRange;
    if (!startDate || !endDate) {
      newErrors.campaignDateRange = "Campaign start and end dates are required";
    } else if (isAfter(parseISO(startDate), parseISO(endDate))) {
      newErrors.campaignDateRange = "End date must be on or after start date";
    }

    if (formData.selectedSectors.length === 0) {
      newErrors.selectedSectors = "Select at least one sector";
    }

    if (!formData.enrollmentLastDate) {
      newErrors.enrollmentLastDate =
        "Merchant enrollment last date is required";
    } else if (
      startDate &&
      isAfter(parseISO(formData.enrollmentLastDate), parseISO(startDate))
    ) {
      newErrors.enrollmentLastDate =
        "Enrollment last date must be on or before campaign start date";
    }

    if (!bannerPreviewUrl) {
      newErrors.banner = "Campaign banner is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Campaign description is required";
    }

    const hasPaymentPartner =
      formData.selectedBanks.length > 0 ||
      formData.selectedMfs.length > 0 ||
      formData.selectedIb.length > 0;
    if (!hasPaymentPartner) {
      newErrors.paymentPartners =
        "Select at least one bank, MFS, or internet banking provider";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the highlighted errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Campaign created successfully");
      navigate("/campaign-management/merchant-campaign-list");
    } catch {
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search State (Unified)
  const [providerSearch, setProviderSearch] = useState("");
  const [bannerFileName, setBannerFileName] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  const sectors = CAMPAIGN_SECTORS_LIST;

  const banks = [
    "AB Bank PLC",
    "AGRANI BANK LIMITED",
    "Al- Arafah Islami Bank PLC",
    "BANGLADESH COMMERCE BANK LTD",
    "BANGLADESH KRISHI BANK",
    "Bank Asia PLC",
    "BASIC BANK LIMITED",
    "BRAC Bank PLC",
    "City Bank PLC",
    "Dhaka Bank PLC",
    "Dutch Bangla Bank PLC",
    "Eastern Bank PLC",
    "EXIM Bank Limited",
    "First Security Islami Bank PLC",
    "HSBC",
    "IFIC BANK",
    "Islami Bank Bangladesh Limited",
    "ITCL",
    "Jamuna Bank PLC",
    "JANATA BANK",
    "LankaBangla Finance PLC",
    "Mercantile Bank PLC",
    "Mutual Trust Bank PLC",
    "NATIONAL BANK",
    "NCC Bank PLC",
    "One Bank PLC",
    "Premier Bank PLC",
    "Prime Bank PLC",
    "Pubali Bank PLC",
    "RUPALI BANK",
    "Shahjalal Islami Bank",
    "SOCIAL ISLAMI BANK",
    "SONALI BANK",
    "Southeast Bank PLC",
    "STANDARD BANK",
    "Standard Chartered Bank PLC",
    "United Commercial Bank PLC",
    "Trust Bank Limited",
    "Commercial Bank of Ceylon PLC",
    "Modhumoti Bank PLC",
    "NRB Commercial Bank PLC",
    "UNION BANK LTD",
    "NRB Bank",
    "Meghna Bank PLC",
    "SBAC Bank PLC",
    "Midland Bank PLC",
    "Citibank N.A.",
    "Uttara Bank Ltd",
    "ICB Islamic Bank",
    "Shimanto Bank PLC",
    "NRB Global Bank Ltd",
    "Bank Alfalah",
    "State Bank of India",
    "Community Bank Bangladesh PLC",
    "Rajshahi Krishi Unnayan Bank",
    "Padma Bank Limited",
    "Bangladesh Development Bank Limited",
    "Habib Bank Limited",
    "Woori Bank Bangladesh",
    "National Bank of Pakistan",
    "Sonali Bank Limited",
    "CITIZENS BANK PLC",
    "test bank",
    "test bank2",
    "test bank1",
    "test bank9",
  ];

  const mfsProviders = ["Bkash", "Upay", "Nagad", "Islamic Wallet"];
  const ibProviders = ["AB Direct"];

  const filteredBanks = useMemo(
    () =>
      banks.filter((b) =>
        b.toLowerCase().includes(providerSearch.toLowerCase()),
      ),
    [providerSearch],
  );
  const filteredMfs = useMemo(
    () =>
      mfsProviders.filter((m) =>
        m.toLowerCase().includes(providerSearch.toLowerCase()),
      ),
    [providerSearch],
  );
  const filteredIb = useMemo(
    () =>
      ibProviders.filter((i) =>
        i.toLowerCase().includes(providerSearch.toLowerCase()),
      ),
    [providerSearch],
  );

  const handleSelectAll = (type: "bank" | "mfs" | "ib", list: string[]) => {
    if (type === "bank")
      setFormData((prev) => ({ ...prev, selectedBanks: list }));
    if (type === "mfs") setFormData((prev) => ({ ...prev, selectedMfs: list }));
    if (type === "ib") setFormData((prev) => ({ ...prev, selectedIb: list }));
    if (errors.paymentPartners) {
      setErrors((prev) => ({ ...prev, paymentPartners: undefined }));
    }
  };

  const toggleItem = (type: "bank" | "mfs" | "ib", item: string) => {
    const key =
      type === "bank"
        ? "selectedBanks"
        : type === "mfs"
          ? "selectedMfs"
          : "selectedIb";
    setFormData((prev) => {
      const list = prev[key as keyof typeof prev] as string[];
      return {
        ...prev,
        [key]: list.includes(item)
          ? list.filter((i) => i !== item)
          : [...list, item],
      };
    });
    if (errors.paymentPartners) {
      setErrors((prev) => ({ ...prev, paymentPartners: undefined }));
    }
  };

  return (
    <div className="mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() =>
            navigate("/campaign-management/merchant-campaign-list")
          }
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Campaign list
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Add New Single Campaign
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">
            Configure your new merchant campaign details below.
          </p>
        </div>

        <div className="p-6 space-y-10">
          {/* Single Campaign Form */}
          <div>
            <SectionHeader title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              <FormField
                label="Campaign Name"
                name="campaignName"
                placeholder="Enter campaign name"
                value={formData.campaignName}
                onChange={handleChange}
                error={errors.campaignName}
              />
              <DateRangePicker
                label="Campaign Period (Start Date – End Date)"
                value={formData.campaignDateRange}
                onChange={(range) => {
                  setFormData((prev) => ({
                    ...prev,
                    campaignDateRange: range,
                  }));
                  if (errors.campaignDateRange) {
                    setErrors((prev) => ({
                      ...prev,
                      campaignDateRange: undefined,
                    }));
                  }
                }}
                placeholder="Select start & end date"
                error={errors.campaignDateRange}
              />
              <MultiSelectDropdown
                label="Sectors"
                options={sectors}
                selected={formData.selectedSectors}
                onChange={(list) => {
                  setFormData((prev) => ({ ...prev, selectedSectors: list }));
                  if (errors.selectedSectors) {
                    setErrors((prev) => ({
                      ...prev,
                      selectedSectors: undefined,
                    }));
                  }
                }}
                error={errors.selectedSectors}
              />
              <DatePicker
                label="Merchant Enrollment Last Date"
                value={formData.enrollmentLastDate}
                onChange={(date) => {
                  setFormData((prev) => ({
                    ...prev,
                    enrollmentLastDate: date,
                  }));
                  if (errors.enrollmentLastDate) {
                    setErrors((prev) => ({
                      ...prev,
                      enrollmentLastDate: undefined,
                    }));
                  }
                }}
                placeholder="Select enrollment last date"
                error={errors.enrollmentLastDate}
              />
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Upload Banner
                </label>
                {bannerPreviewUrl ? (
                  <div
                    className={clsx(
                      "relative group flex items-center justify-between border bg-slate-50 rounded-lg p-1.5 h-[38px]",
                      errors.banner ? "border-rose-300" : "border-slate-200",
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={bannerPreviewUrl}
                        alt="Banner preview"
                        className="h-6 w-10 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                      />
                      <span className="text-[11px] text-slate-700 font-medium truncate max-w-[110px]">
                        {bannerFileName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="cursor-pointer text-[10px] font-bold text-primary-600 hover:text-primary-700 hover:underline px-1">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleBannerFile(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          clearBanner();
                          setErrors((prev) => ({ ...prev, banner: undefined }));
                        }}
                        className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                        title="Remove banner"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={clsx(
                      "relative group flex flex-col items-center justify-center border-2 border-dashed bg-slate-50/50 rounded-lg p-2 transition-all cursor-pointer h-[38px]",
                      errors.banner
                        ? "border-rose-300 hover:border-rose-400"
                        : "border-slate-200 hover:border-primary-400",
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleBannerFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500" />
                      <span className="text-[11px] text-slate-500 group-hover:text-primary-500 font-semibold truncate max-w-[150px]">
                        Choose Banner File
                      </span>
                    </div>
                  </label>
                )}
                <p className="mt-1.5 text-[10px] text-slate-400 italic">
                  Recommended size: 1200x400px (PNG/JPG, max{" "}
                  {MAX_BANNER_SIZE_MB}MB)
                </p>
                {errors.banner && (
                  <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {errors.banner}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <FormField
                label="Campaign Description"
                name="description"
                multiline
                placeholder="Provide a brief description of the campaign and its goals..."
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
              />
            </div>
          </div>

          {/* Payment Partners Unified Search */}
          <div
            className={clsx(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t",
              errors.paymentPartners ? "border-rose-200" : "border-slate-200",
            )}
          >
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Payment Partners Selection
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Search and select participating banks, MFS, and internet banking
                providers below.
              </p>
              {errors.paymentPartners && (
                <p className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {errors.paymentPartners}
                </p>
              )}
            </div>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search Banks, MFS, or Internet Banking..."
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-2xs"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              {providerSearch && (
                <button
                  type="button"
                  onClick={() => setProviderSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Participating Banks */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Participating Banks ({filteredBanks.length})
              </h3>
              <button
                type="button"
                onClick={() =>
                  handleSelectAll(
                    "bank",
                    formData.selectedBanks.length === banks.length ? [] : banks,
                  )
                }
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
              >
                {formData.selectedBanks.length === banks.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
              {filteredBanks.map((bank) => {
                const isChecked = formData.selectedBanks.includes(bank);
                return (
                  <label
                    key={bank}
                    className={clsx(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-slate-100/60 transition-colors cursor-pointer select-none group",
                      isChecked && "bg-primary-50/50 font-semibold",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem("bank", bank)}
                      className="hidden"
                    />
                    <div
                      className={clsx(
                        "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                        isChecked
                          ? "bg-primary-600 border border-primary-600 text-white shadow-2xs"
                          : "border border-slate-300 bg-white group-hover:border-primary-400",
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3px]" />}
                    </div>
                    <span
                      className={clsx(
                        "text-[11px] uppercase tracking-tight truncate leading-tight transition-colors",
                        isChecked
                          ? "text-primary-700 font-bold"
                          : "text-slate-700 font-medium group-hover:text-primary-600",
                      )}
                    >
                      {bank}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* MFS Providers */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                MFS Providers ({filteredMfs.length})
              </h3>
              <button
                type="button"
                onClick={() =>
                  handleSelectAll(
                    "mfs",
                    formData.selectedMfs.length === mfsProviders.length
                      ? []
                      : mfsProviders,
                  )
                }
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
              >
                {formData.selectedMfs.length === mfsProviders.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
              {filteredMfs.map((mfs) => {
                const isChecked = formData.selectedMfs.includes(mfs);
                return (
                  <label
                    key={mfs}
                    className={clsx(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-slate-100/60 transition-colors cursor-pointer select-none group",
                      isChecked && "bg-primary-50/50 font-semibold",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem("mfs", mfs)}
                      className="hidden"
                    />
                    <div
                      className={clsx(
                        "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                        isChecked
                          ? "bg-primary-600 border border-primary-600 text-white shadow-2xs"
                          : "border border-slate-300 bg-white group-hover:border-primary-400",
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3px]" />}
                    </div>
                    <span
                      className={clsx(
                        "text-[11px] uppercase tracking-tight truncate leading-tight transition-colors",
                        isChecked
                          ? "text-primary-700 font-bold"
                          : "text-slate-700 font-medium group-hover:text-primary-600",
                      )}
                    >
                      {mfs}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Internet Banking Providers */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Internet Banking Providers ({filteredIb.length})
              </h3>
              <button
                type="button"
                onClick={() =>
                  handleSelectAll(
                    "ib",
                    formData.selectedIb.length === ibProviders.length
                      ? []
                      : ibProviders,
                  )
                }
                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
              >
                {formData.selectedIb.length === ibProviders.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
              {filteredIb.map((ib) => {
                const isChecked = formData.selectedIb.includes(ib);
                return (
                  <label
                    key={ib}
                    className={clsx(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-slate-100/60 transition-colors cursor-pointer select-none group",
                      isChecked && "bg-primary-50/50 font-semibold",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem("ib", ib)}
                      className="hidden"
                    />
                    <div
                      className={clsx(
                        "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                        isChecked
                          ? "bg-primary-600 border border-primary-600 text-white shadow-2xs"
                          : "border border-slate-300 bg-white group-hover:border-primary-400",
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3px]" />}
                    </div>
                    <span
                      className={clsx(
                        "text-[11px] uppercase tracking-tight truncate leading-tight transition-colors",
                        isChecked
                          ? "text-primary-700 font-bold"
                          : "text-slate-700 font-medium group-hover:text-primary-600",
                      )}
                    >
                      {ib}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={clsx(
              "px-10 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
            )}
          >
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
