import { useState, useMemo } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { Drawer } from "../../components/Drawer";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { Modal } from "../../components/Modal";
import { clsx } from "clsx";

interface Slab {
  id: string;
  min: string;
  max: string;
  rate: string;
}

interface CommissionCardData {
  id: string;
  title: string;
  type: string;
  slabs: Slab[];
}

interface CommissionConfig {
  id: number;
  msslid: string;
  merchantName: string;
  storeName: string;
  strid: string;
}

interface CommissionDrawerProps {
  open: boolean;
  onClose: () => void;
  resellerName?: string;
}

type SlabField = "min" | "max" | "rate";

interface FormErrors {
  merchantName?: string;
  storeName?: string;
  slabs: Record<string, Partial<Record<SlabField, string>>>;
  general?: string;
}

const createEmptyFormErrors = (): FormErrors => ({ slabs: {} });

function slabErrorKey(cardId: string, slabId: string) {
  return `${cardId}:${slabId}`;
}

function isNumericValue(value: string) {
  return value.trim() !== "" && !Number.isNaN(Number(value));
}

const CARD_NETWORKS = [
  { id: "all", title: "ALL" },
  { id: "visa", title: "VISA" },
  { id: "master", title: "MASTER" },
  { id: "nexus", title: "NEXUS" },
  { id: "wallet", title: "WALLET" },
  { id: "qcash", title: "QCASH" },
  { id: "citybankib", title: "CITYBANKIB" },
  { id: "abbankib", title: "ABBANKIB" },
  { id: "dbblmobileb", title: "DBBLMOBILEB" },
  { id: "bankasia", title: "BANKASIA" },
  { id: "bkash", title: "BKASH" },
  { id: "ibbl", title: "IBBL" },
  { id: "mtbl", title: "MTBL" },
  { id: "amex", title: "AMEX" },
  { id: "mycash", title: "MYCASH" },
  { id: "jbl", title: "JBL" },
  { id: "promo", title: "PROMO" },
  { id: "ific", title: "IFIC" },
  { id: "exim", title: "EXIM" },
  { id: "sbi", title: "SBI" },
  { id: "ucash", title: "UCash" },
  { id: "mobilemoney", title: "MobileMoney" },
  { id: "itcl", title: "ITCL" },
  { id: "rocket", title: "ROCKET" },
  { id: "abdirect", title: "ABDIRECT" },
  { id: "paywell", title: "PayWell" },
  { id: "tapnpay", title: "TAPNPAY" },
  { id: "sslutility", title: "SSLUTILITY" },
  { id: "upay", title: "UPay" },
  { id: "citytouchiv", title: "CitytouchIV" },
  { id: "okwallet", title: "Okwallet" },
  { id: "ipay", title: "IPay" },
  { id: "mtbliv", title: "MTBLIV" },
  { id: "surecash", title: "SureCash" },
  { id: "dmoney", title: "Dmoney" },
  { id: "unionpay", title: "UNIONPAY" },
];

const INITIAL_CONFIGS: CommissionConfig[] = [
  {
    id: 1,
    msslid: "100203",
    merchantName: "Test Merchant",
    storeName: "Main Store",
    strid: "ST001",
  },
  {
    id: 2,
    msslid: "100204",
    merchantName: "Global Shop",
    storeName: "Online Branch",
    strid: "ST002",
  },
];

const filterConfig: FilterConfig[] = [
  { key: "merchantName", type: "input", label: "Merchant Name" },
  { key: "storeName", type: "input", label: "Store Name" },
];

type ViewState = "LIST" | "FORM";

export function CommissionDrawer({
  open,
  onClose,
  resellerName,
}: CommissionDrawerProps) {
  const [view, setView] = useState<ViewState>("LIST");
  const [merchantName, setMerchantName] = useState("ALL");
  const [storeName, setStoreName] = useState("");
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [configs, setConfigs] = useState<CommissionConfig[]>(INITIAL_CONFIGS);
  const [deleteItem, setDeleteItem] = useState<CommissionConfig | null>(null);
  const [errors, setErrors] = useState<FormErrors>(createEmptyFormErrors);

  // Buffered filters
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  // Search & Filter for channels in Form view
  const [channelSearch, setChannelSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [cards, setCards] = useState<CommissionCardData[]>(
    CARD_NETWORKS.map((network) => ({
      id: network.id,
      title: network.title,
      type: "Slab",
      slabs: [
        {
          id: Math.random().toString(36).substr(2, 9),
          min: "",
          max: "",
          rate: "",
        },
      ],
    })),
  );

  const filteredConfigs = useMemo(() => {
    const m = (appliedFilters.merchantName || "").toLowerCase().trim();
    const s = (appliedFilters.storeName || "").toLowerCase().trim();

    return configs.filter((cfg) => {
      const matchM = !m || cfg.merchantName.toLowerCase().includes(m);
      const matchS = !s || cfg.storeName.toLowerCase().includes(s);
      return matchM && matchS;
    });
  }, [configs, appliedFilters]);

  const cardCategories: Record<string, string[]> = useMemo(
    () => ({
      Cards: ["visa", "master", "nexus", "qcash", "amex", "unionpay"],
      MFS: [
        "bkash",
        "rocket",
        "upay",
        "okwallet",
        "ipay",
        "surecash",
        "dmoney",
        "mycash",
        "ucash",
        "mobilemoney",
        "tapnpay",
      ],
      Banking: [
        "citybankib",
        "abbankib",
        "dbblmobileb",
        "bankasia",
        "ibbl",
        "mtbl",
        "jbl",
        "ific",
        "exim",
        "sbi",
        "itcl",
        "abdirect",
        "citytouchiv",
        "mtbliv",
      ],
    }),
    [],
  );

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const query = channelSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        card.title.toLowerCase().includes(query) ||
        card.id.toLowerCase().includes(query);

      let matchesCategory = true;
      if (categoryFilter !== "ALL") {
        const ids = cardCategories[categoryFilter] || [];
        matchesCategory = ids.includes(card.id);
      }

      return matchesSearch && matchesCategory;
    });
  }, [cards, channelSearch, categoryFilter, cardCategories]);

  const clearFieldError = (field: "merchantName" | "storeName") => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const clearSlabFieldError = (
    cardId: string,
    slabId: string,
    field: SlabField,
  ) => {
    const key = slabErrorKey(cardId, slabId);
    setErrors((prev) => {
      const slabErrors = { ...(prev.slabs[key] || {}) };
      delete slabErrors[field];
      const nextSlabs = { ...prev.slabs };
      if (Object.keys(slabErrors).length === 0) {
        delete nextSlabs[key];
      } else {
        nextSlabs[key] = slabErrors;
      }
      return { ...prev, slabs: nextSlabs, general: undefined };
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(localFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    setAppliedFilters({});
  };

  const handleAddNew = () => {
    setEditingConfigId(null);
    setMerchantName("ALL");
    setStoreName("");
    setErrors(createEmptyFormErrors);
    setView("FORM");
  };

  const handleEdit = (config: CommissionConfig) => {
    setEditingConfigId(config.id);
    setMerchantName(config.merchantName);
    setStoreName(config.storeName);
    setErrors(createEmptyFormErrors);
    setView("FORM");
  };

  const handleDelete = () => {
    if (!deleteItem) return;

    setConfigs((prev) => prev.filter((config) => config.id !== deleteItem.id));
    if (editingConfigId === deleteItem.id) {
      setEditingConfigId(null);
    }
    toast.success(
      `Commission configuration for “${deleteItem.merchantName}” deleted`,
    );
    setDeleteItem(null);
  };

  const handleAddSlab = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          return {
            ...card,
            slabs: [
              ...card.slabs,
              {
                id: Math.random().toString(36).substr(2, 9),
                min: "",
                max: "",
                rate: "",
              },
            ],
          };
        }
        return card;
      }),
    );
  };

  const handleRemoveSlab = (cardId: string, slabId: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          if (card.slabs.length <= 1) return card;
          return {
            ...card,
            slabs: card.slabs.filter((s) => s.id !== slabId),
          };
        }
        return card;
      }),
    );
    const key = slabErrorKey(cardId, slabId);
    setErrors((prev) => {
      const nextSlabs = { ...prev.slabs };
      delete nextSlabs[key];
      return { ...prev, slabs: nextSlabs };
    });
  };

  const handleSlabChange = (
    cardId: string,
    slabId: string,
    field: keyof Slab,
    value: string,
  ) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          return {
            ...card,
            slabs: card.slabs.map((s) =>
              s.id === slabId ? { ...s, [field]: value } : s,
            ),
          };
        }
        return card;
      }),
    );
    if (field === "min" || field === "max" || field === "rate") {
      clearSlabFieldError(cardId, slabId, field);
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = createEmptyFormErrors();
    let hasCompleteSlab = false;
    let hasPartialSlab = false;

    if (!merchantName.trim()) {
      nextErrors.merchantName = "Merchant name is required";
    }

    if (!storeName.trim()) {
      nextErrors.storeName = "Store name is required";
    }

    cards.forEach((card) => {
      card.slabs.forEach((slab) => {
        const hasAnyValue = [slab.min, slab.max, slab.rate].some(
          (value) => value.trim() !== "",
        );
        if (!hasAnyValue) return;

        hasPartialSlab = true;
        const slabErrors: Partial<Record<SlabField, string>> = {};
        const key = slabErrorKey(card.id, slab.id);

        (["min", "max", "rate"] as SlabField[]).forEach((field) => {
          const value = slab[field].trim();
          if (!value) {
            slabErrors[field] = "Required";
            return;
          }
          if (!isNumericValue(value)) {
            slabErrors[field] = "Must be a number";
            return;
          }
          if (Number(value) < 0) {
            slabErrors[field] = "Must be 0 or greater";
          }
        });

        if (
          !slabErrors.min &&
          !slabErrors.max &&
          isNumericValue(slab.min) &&
          isNumericValue(slab.max)
        ) {
          if (Number(slab.max) < Number(slab.min)) {
            slabErrors.max = "Must be ≥ Min";
          }
        }

        if (
          !slabErrors.rate &&
          isNumericValue(slab.rate) &&
          card.type === "Percentage" &&
          Number(slab.rate) > 100
        ) {
          slabErrors.rate = "Max 100%";
        }

        if (Object.keys(slabErrors).length > 0) {
          nextErrors.slabs[key] = slabErrors;
        } else {
          hasCompleteSlab = true;
        }
      });
    });

    // Add requires at least one complete slab. Edit allows merchant/store-only updates
    // unless the user started filling slabs (then those must be valid).
    if (
      !nextErrors.merchantName &&
      !nextErrors.storeName &&
      Object.keys(nextErrors.slabs).length === 0 &&
      !hasCompleteSlab &&
      (editingConfigId === null || hasPartialSlab)
    ) {
      nextErrors.general =
        "Fill at least one complete commission slab before saving.";
    }

    setErrors(nextErrors);
    return (
      !nextErrors.merchantName &&
      !nextErrors.storeName &&
      !nextErrors.general &&
      Object.keys(nextErrors.slabs).length === 0
    );
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    if (editingConfigId !== null) {
      setConfigs((prev) =>
        prev.map((config) =>
          config.id === editingConfigId
            ? { ...config, merchantName, storeName }
            : config,
        ),
      );
      toast.success("Commission configuration updated");
    } else {
      const nextId =
        configs.reduce((max, config) => Math.max(max, config.id), 0) + 1;
      setConfigs((prev) => [
        ...prev,
        {
          id: nextId,
          msslid: String(100200 + nextId),
          merchantName,
          storeName,
          strid: `ST${String(nextId).padStart(3, "0")}`,
        },
      ]);
      toast.success("Commission configuration saved");
    }

    setErrors(createEmptyFormErrors());
    setEditingConfigId(null);
    setView("LIST");
  };

  const goBackToList = () => {
    setView("LIST");
    setEditingConfigId(null);
    setErrors(createEmptyFormErrors());
  };

  const resetSelection = () => {
    setView("LIST");
    setEditingConfigId(null);
    setMerchantName("ALL");
    setStoreName("");
    setDeleteItem(null);
    setErrors(createEmptyFormErrors());
    setLocalFilters({});
    setAppliedFilters({});
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          onClose();
          setTimeout(resetSelection, 300);
        }}
        width="5xl"
        title={
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
            <span>Commission Slab</span>
          </div>
        }
        subtitle={
          resellerName ? `Managing slabs for ${resellerName}` : undefined
        }
        headerAction={
          view === "LIST" && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Configuration
            </button>
          )
        }
      >
        {view === "LIST" ? (
          /* LIST VIEW */
          <div className="space-y-6">
            {/* Filters Row - Matching Reseller Page Style */}
            <div className="flex flex-wrap items-center gap-3">
              <FilterBar
                filters={localFilters}
                onFilterChange={handleFilterChange}
                config={filterConfig}
              />

              <button
                onClick={applyFilters}
                disabled={
                  JSON.stringify(localFilters) ===
                  JSON.stringify(appliedFilters)
                }
                className={clsx(
                  "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
                  JSON.stringify(localFilters) !==
                    JSON.stringify(appliedFilters)
                    ? "bg-primary-600 hover:bg-primary-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                )}
              >
                Apply Filters
              </button>
              <ClearAllFiltersButton
                onClick={clearFilters}
                filters={localFilters}
              />
            </div>

            {/* Data Table */}

            {/* Data Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">
                      #
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">
                      Msslid
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">
                      Merchant Name
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">
                      Store Name
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">
                      Strid
                    </th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConfigs.map((config, idx) => (
                    <tr
                      key={config.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {config.msslid}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {config.merchantName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {config.storeName}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-500">
                        {config.strid}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(config)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteItem(config)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredConfigs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No commission configurations found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* FORM VIEW (Configuration Cards) */
          <div className="space-y-6">
            <button
              onClick={goBackToList}
              className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </button>

            {errors.general && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-600">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="bg-white border-b border-slate-100 pb-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Merchant Name Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    Merchant Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="merchant-options"
                      value={merchantName}
                      onChange={(e) => {
                        setMerchantName(e.target.value);
                        clearFieldError("merchantName");
                      }}
                      placeholder="Type or select Merchant Name"
                      className={clsx(
                        "w-full text-xs font-semibold px-3 py-2.5 bg-white border rounded-lg focus:ring-2 outline-none transition-all placeholder:text-slate-400",
                        errors.merchantName
                          ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
                      )}
                    />
                    <datalist id="merchant-options">
                      <option value="ALL" />
                      <option value="Apex Electronics Ltd" />
                      <option value="Sundarban Travels" />
                      <option value="Dhaka Tech Mart" />
                      <option value="Meghna Pharma" />
                      <option value="EduNext Academy" />
                      <option value="Fashion Outlet BD" />
                      <option value="TechMart Online" />
                      {configs.map((c) => (
                        <option key={c.id} value={c.merchantName} />
                      ))}
                    </datalist>
                  </div>
                  {errors.merchantName && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {errors.merchantName}
                    </p>
                  )}
                </div>

                {/* Store Name Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                    Store Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="store-options"
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value);
                        clearFieldError("storeName");
                      }}
                      placeholder="Type or select Store Name"
                      className={clsx(
                        "w-full text-xs font-semibold px-3 py-2.5 bg-white border rounded-lg focus:ring-2 outline-none transition-all placeholder:text-slate-400",
                        errors.storeName
                          ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
                      )}
                    />
                    <datalist id="store-options">
                      <option value="Main Store" />
                      <option value="Online Branch" />
                      <option value="Outlet 1" />
                      <option value="Dhaka Branch" />
                      {configs.map((c) => (
                        <option key={c.id} value={c.storeName} />
                      ))}
                    </datalist>
                  </div>
                  {errors.storeName && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {errors.storeName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Toolbar for Channels: Search & Category Pills */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Payment Channels ({filteredCards.length} of {cards.length})
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    placeholder="Search channel (e.g. VISA, BKASH, AMEX)..."
                    className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  />
                  {channelSearch && (
                    <button
                      type="button"
                      onClick={() => setChannelSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {["ALL", "Cards", "MFS", "Banking"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={clsx(
                        "px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                        categoryFilter === cat
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error channels banner if validation has slab errors */}
            {Object.keys(errors.slabs).length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 shadow-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" />
                <div>
                  <span className="font-semibold block">
                    Validation errors found in channels:
                  </span>
                  <span className="text-rose-600 font-mono text-[11px]">
                    {Array.from(
                      new Set(
                        Object.keys(errors.slabs).map((key) => {
                          const cardId = key.split(":")[0];
                          const card = cards.find((c) => c.id === cardId);
                          return card ? card.title : cardId;
                        }),
                      ),
                    ).join(", ")}
                  </span>
                </div>
              </div>
            )}

            {/* Cards Grid (Filtered) */}
            <div className="grid grid-cols-2 gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={clsx(
                    "bg-white rounded border shadow-sm overflow-hidden flex flex-col",
                    Object.keys(errors.slabs).some((key) =>
                      key.startsWith(`${card.id}:`),
                    )
                      ? "border-rose-300"
                      : "border-slate-200",
                  )}
                >
                  {/* Card Header */}
                  <div className="bg-[#264f8f] px-4 py-2.5 text-center">
                    <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                      {card.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">
                        Commission Type
                      </label>
                      <div className="relative">
                        <select
                          value={card.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setCards((prev) =>
                              prev.map((c) =>
                                c.id === card.id ? { ...c, type: newType } : c,
                              ),
                            );
                          }}
                          className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                        >
                          <option value="Slab">Slab</option>
                          <option value="Percentage">Percentage</option>
                          <option value="Fixed">Fixed</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Slab Column Headers */}
                    <div className="grid grid-cols-3 gap-3">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                        Min (BDT)
                      </label>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                        Max (BDT)
                      </label>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                        Rate (%)
                      </label>
                    </div>

                    {/* Slab Item Rows */}
                    <div className="space-y-3">
                      {card.slabs.map((slab) => {
                        const slabErrors =
                          errors.slabs[slabErrorKey(card.id, slab.id)] || {};
                        return (
                          <div key={slab.id} className="space-y-1">
                            <div className="grid grid-cols-3 gap-3 relative group/row">
                              <input
                                type="text"
                                value={slab.min}
                                onChange={(e) =>
                                  handleSlabChange(
                                    card.id,
                                    slab.id,
                                    "min",
                                    e.target.value,
                                  )
                                }
                                placeholder="0.00"
                                className={clsx(
                                  "w-full text-xs font-semibold text-slate-900 bg-white border rounded-lg p-2.5 focus:ring-2 outline-none transition-all text-center placeholder:text-slate-300",
                                  slabErrors.min
                                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                                    : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
                                )}
                              />
                              <input
                                type="text"
                                value={slab.max}
                                onChange={(e) =>
                                  handleSlabChange(
                                    card.id,
                                    slab.id,
                                    "max",
                                    e.target.value,
                                  )
                                }
                                placeholder="0.00"
                                className={clsx(
                                  "w-full text-xs font-semibold text-slate-900 bg-white border rounded-lg p-2.5 focus:ring-2 outline-none transition-all text-center placeholder:text-slate-300",
                                  slabErrors.max
                                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                                    : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
                                )}
                              />
                              <div className="relative group/rate">
                                <input
                                  type="text"
                                  value={slab.rate}
                                  onChange={(e) =>
                                    handleSlabChange(
                                      card.id,
                                      slab.id,
                                      "rate",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0.00"
                                  className={clsx(
                                    "w-full text-xs font-semibold text-slate-900 bg-white border rounded-lg p-2.5 focus:ring-2 outline-none transition-all text-center placeholder:text-slate-300",
                                    slabErrors.rate
                                      ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                                      : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
                                  )}
                                />
                                {card.slabs.length > 1 && (
                                  <button
                                    onClick={() =>
                                      handleRemoveSlab(card.id, slab.id)
                                    }
                                    className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/row:opacity-100 transition-all scale-90 hover:scale-100"
                                    title="Remove Row"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {(slabErrors.min ||
                              slabErrors.max ||
                              slabErrors.rate) && (
                              <div className="grid grid-cols-3 gap-3">
                                <p className="text-[10px] text-rose-500 text-center font-medium min-h-[14px]">
                                  {slabErrors.min || ""}
                                </p>
                                <p className="text-[10px] text-rose-500 text-center font-medium min-h-[14px]">
                                  {slabErrors.max || ""}
                                </p>
                                <p className="text-[10px] text-rose-500 text-center font-medium min-h-[14px]">
                                  {slabErrors.rate || ""}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Button Area */}
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => handleAddSlab(card.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[11px] font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Another Slab
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <div className="col-span-2 py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium">
                    No payment channels match "{channelSearch}" in category "
                    {categoryFilter}".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setChannelSearch("");
                      setCategoryFilter("ALL");
                    }}
                    className="mt-2 text-xs font-semibold text-primary-600 hover:underline cursor-pointer"
                  >
                    Reset channel filters
                  </button>
                </div>
              )}
            </div>

            <div className="sticky -bottom-6 -mx-6 mt-8 bg-white border-t border-slate-200 py-3.5 px-6 z-30 flex items-center justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={goBackToList}
                className="px-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {editingConfigId !== null
                  ? "Update Configuration"
                  : "Save All Configurations"}
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Configuration"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteItem(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!deleteItem}
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </>
        }
      >
        {deleteItem && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              Are you sure you want to delete the commission configuration for “
              {deleteItem.merchantName}”?
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              N.B : This action cannot be undone.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
