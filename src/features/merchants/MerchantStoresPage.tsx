import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api/client";
import { DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import type { FilterConfig } from "../../components/FilterBar";
import type { ColumnDef } from "@tanstack/react-table";
import type { MerchantStore } from "../../data/mock/types";
import {
  ArrowLeft,
  Eye,
  Landmark,
  MoreHorizontal,
  Plus,
  StickyNote,
  Store,
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { CopyButton } from "../../components/CopyButton";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import { MerchantStoreDrawer } from "./MerchantStoreDrawer";
import { MerchantStoreNoteDrawer } from "./MerchantStoreNoteDrawer";
import { MerchantStoreBankCommissionDrawer } from "./MerchantStoreBankCommissionDrawer";
import { MerchantStoreEditDrawer } from "./MerchantStoreEditDrawer";
import { MerchantStoreConfigDrawer } from "./MerchantStoreConfigDrawer";
import { MerchantStoreSecurityFundDrawer } from "./MerchantStoreSecurityFundDrawer";
import { MerchantStoreAccountDrawer } from "./MerchantStoreAccountDrawer";
import { MerchantStoreEmiDrawer } from "./MerchantStoreEmiDrawer";
import { MerchantStoreMgtCommissionDrawer } from "./MerchantStoreMgtCommissionDrawer";
import { MerchantStoreQrNetworkDrawer } from "./MerchantStoreQrNetworkDrawer";
import { MerchantStoreManageQrDrawer } from "./MerchantStoreManageQrDrawer";
import { AnalysisReportConfigDrawer } from "../analytics/AnalysisReportConfigDrawer";
import { MerchantStoreSystemEmailDrawer } from "./MerchantStoreSystemEmailDrawer";
import { MerchantStoreBannerLogoDrawer } from "./MerchantStoreBannerLogoDrawer";
import { MerchantStoreManageTerminalDrawer } from "./MerchantStoreManageTerminalDrawer";
import { MerchantStoreDailyBalanceDrawer } from "./MerchantStoreDailyBalanceDrawer";
import { MerchantStoreBalanceTransferDrawer } from "./MerchantStoreBalanceTransferDrawer";
import { MerchantStoreMultiAccountDrawer } from "./MerchantStoreMultiAccountDrawer";
import { MerchantStorePasswordResetDrawer } from "./MerchantStorePasswordResetDrawer";

// ─── Click-based Action Menu ──────────────────────────────────────────────────
function ActionMenu({
  store,
  actions,
}: {
  store: MerchantStore;
  actions: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 370; // Approx height of the menu
      const spaceBelow = window.innerHeight - rect.bottom;

      let topPosition = rect.top + window.scrollY;

      // If not enough space below, and more space above, open upwards
      if (spaceBelow < menuHeight && rect.top > spaceBelow) {
        topPosition = rect.bottom + window.scrollY - menuHeight;
      }

      setCoords({
        top: topPosition,
        left: rect.left + window.scrollX - 216, // offset to the left of button
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true); // true for capture phase
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const MenuItem = ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(false);
        onClick();
      }}
      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors whitespace-nowrap"
    >
      {label}
    </button>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex items-center justify-center"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: coords.top, left: coords.left }}
            className="absolute w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-[9999] py-1 overflow-hidden"
          >
            <MenuItem label="Edit" onClick={() => actions.onEdit(store)} />
            <MenuItem
              label="Config Store"
              onClick={() => actions.onConfig(store)}
            />
            <MenuItem
              label="Security Fund"
              onClick={() => actions.onSecurityFund(store)}
            />
            <MenuItem
              label="Account"
              onClick={() => actions.onAccount(store)}
            />
            <MenuItem
              label="Multi-Account"
              onClick={() => actions.onMultiAccount(store)}
            />
            <MenuItem label="EMI" onClick={() => actions.onEmi(store)} />
            <MenuItem label="Test" onClick={() => actions.onTest(store)} />
            <MenuItem
              label="Management Commission"
              onClick={() => actions.onMgtCommission(store)}
            />
            <MenuItem
              label="Manage Banner/Logo"
              onClick={() => actions.onBannerLogo(store)}
            />
            <MenuItem
              label="Manage Store QR Network"
              onClick={() => actions.onQrNetwork(store)}
            />
            <MenuItem
              label="Manage QR"
              onClick={() => actions.onManageQr(store)}
            />
            <MenuItem
              label="Manage Terminal"
              onClick={() => actions.onManageTerminal(store)}
            />
            <MenuItem
              label="Store Daily Balance"
              onClick={() => actions.onDailyBalance(store)}
            />
            <MenuItem
              label="Store Balance Transfer"
              onClick={() => actions.onBalanceTransfer(store)}
            />
            <MenuItem
              label="Analysis Report"
              onClick={() => actions.onAnalysis(store)}
            />
            <MenuItem
              label="Send System Email"
              onClick={() => actions.onSystemEmail(store)}
            />
            <MenuItem
              label="Store Password Reset"
              onClick={() => actions.onPasswordReset(store)}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Filter configs ────────────────────────────────────────────────────────────
const filterConfig: FilterConfig[] = [
  { key: "storeId", type: "input", label: "Store ID" },
  { key: "storeName", type: "input", label: "Store Name" },
  { key: "baseUrl", type: "input", label: "Base URL" },
  {
    key: "currency",
    type: "select",
    label: "Currency",
    options: [
      { label: "Select one", value: "all" },
      { label: "BDT", value: "BDT" },
      { label: "USD", value: "USD" },
      { label: "EUR", value: "EUR" },
    ],
  },
  {
    key: "emiStatus",
    type: "select",
    label: "EMI Status",
    options: [
      { label: "Select one", value: "all" },
      { label: "No EMI", value: "No EMI" },
      { label: "EMI Enabled", value: "EMI Enabled" },
    ],
  },
  {
    key: "paymentType",
    type: "select",
    label: "Type",
    options: [
      { label: "Select one", value: "all" },
      { label: "Only Online", value: "Only Online" },
      { label: "Only QR", value: "Only QR" },
      { label: "Online & QR", value: "Online & QR" },
    ],
  },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "Select one", value: "all" },
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
  },
];

// ─── Page component ────────────────────────────────────────────────────────────
export default function MerchantStoresPage() {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStore, setSelectedStore] = useState<MerchantStore | null>(
    null,
  );
  const [selectedNoteStore, setSelectedNoteStore] =
    useState<MerchantStore | null>(null);
  const [selectedCommissionStore, setSelectedCommissionStore] =
    useState<MerchantStore | null>(null);
  const [selectedEditStore, setSelectedEditStore] =
    useState<MerchantStore | null>(null);
  const [selectedConfigStore, setSelectedConfigStore] =
    useState<MerchantStore | null>(null);
  const [selectedSecurityFundStore, setSelectedSecurityFundStore] =
    useState<MerchantStore | null>(null);
  const [selectedAccountStore, setSelectedAccountStore] =
    useState<MerchantStore | null>(null);
  const [selectedMultiAccountStore, setSelectedMultiAccountStore] =
    useState<MerchantStore | null>(null);
  const [selectedPasswordResetStore, setSelectedPasswordResetStore] =
    useState<MerchantStore | null>(null);
  const [selectedEmiStore, setSelectedEmiStore] =
    useState<MerchantStore | null>(null);
  const [selectedMgtCommStore, setSelectedMgtCommStore] =
    useState<MerchantStore | null>(null);
  const [selectedQrNetworkStore, setSelectedQrNetworkStore] =
    useState<MerchantStore | null>(null);
  const [selectedManageQrStore, setSelectedManageQrStore] =
    useState<MerchantStore | null>(null);
  const [selectedManageTerminalStore, setSelectedManageTerminalStore] =
    useState<MerchantStore | null>(null);
  const [selectedDailyBalanceStore, setSelectedDailyBalanceStore] =
    useState<MerchantStore | null>(null);
  const [selectedBalanceTransferStore, setSelectedBalanceTransferStore] =
    useState<MerchantStore | null>(null);
  const [selectedAnalysisStore, setSelectedAnalysisStore] =
    useState<MerchantStore | null>(null);
  const [selectedSystemEmailStore, setSelectedSystemEmailStore] =
    useState<MerchantStore | null>(null);
  const [selectedBannerLogoStore, setSelectedBannerLogoStore] =
    useState<MerchantStore | null>(null);

  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.merchants.get(merchantId!),
  });

  const { data: stores, isLoading } = useQuery({
    queryKey: ["merchant-stores", merchantId],
    queryFn: () => api.stores.getByMerchant(merchantId!),
  });

  // ── Filter state sync with URL ──────────────────────────────────────────
  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(filters);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setSearchParams(() => {
      const next = new URLSearchParams();
      Object.entries(localFilters).forEach(([k, v]) => {
        if (v && v !== "all") next.set(k, String(v));
      });
      return next;
    });
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchParams({});
  };

  const hasUnappliedChanges = useMemo(
    () => JSON.stringify(localFilters) !== JSON.stringify(filters),
    [localFilters, filters],
  );

  // ── Client-side filtering ───────────────────────────────────────────────
  const filteredStores = useMemo(() => {
    if (!stores) return [];
    return stores.filter((s) => {
      if (
        filters.storeId &&
        !s.storeId.toLowerCase().includes(filters.storeId.toLowerCase())
      )
        return false;
      if (
        filters.storeName &&
        !s.storeName.toLowerCase().includes(filters.storeName.toLowerCase())
      )
        return false;
      if (
        filters.baseUrl &&
        !s.baseUrl.toLowerCase().includes(filters.baseUrl.toLowerCase())
      )
        return false;
      if (
        filters.currency &&
        !s.currency.toLowerCase().includes(filters.currency.toLowerCase())
      )
        return false;
      if (
        filters.emiStatus &&
        filters.emiStatus !== "all" &&
        s.emiStatus !== filters.emiStatus
      )
        return false;
      if (
        filters.paymentType &&
        filters.paymentType !== "all" &&
        s.paymentType !== filters.paymentType
      )
        return false;
      if (
        filters.status &&
        filters.status !== "all" &&
        s.status !== filters.status
      )
        return false;
      return true;
    });
  }, [stores, filters]);

  // ── Stub action handler ─────────────────────────────────────────────────
  const stub = (action: string) =>
    toast(`"${action}" — not yet implemented`, { icon: "ℹ️" });

  // ── Column definitions ──────────────────────────────────────────────────
  const columns: ColumnDef<MerchantStore>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-slate-500">{row.index + 1}</span>
      ),
      size: 40,
    },
    {
      id: "store",
      header: "Store",
      cell: ({ row }) => (
        <div className="flex flex-col py-0.5 max-w-[170px]">
          <div
            className="font-medium text-slate-900 leading-tight truncate"
            title={row.original.storeName}
          >
            {row.original.storeName}
          </div>
          <div className="text-[11px] text-slate-500 font-normal font-mono flex items-center gap-1">
            <span className="truncate" title={row.original.storeId}>
              {row.original.storeId}
            </span>
            <CopyButton value={row.original.storeId} />
          </div>
        </div>
      ),
    },
    {
      header: "KAM",
      cell: () => (
        <span className="text-xs font-medium text-slate-600">
          {merchant?.ownerName || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "baseUrl",
      header: "Base URL",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{row.original.baseUrl}</span>
      ),
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => (
        <span className="text-xs font-normal text-slate-700">
          {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: "emiStatus",
      header: "EMI Status",
      cell: ({ row }) => (
        <span
          className={clsx(
            "px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap",
            row.original.emiStatus === "EMI Enabled"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-slate-50 text-slate-600 border-slate-200",
          )}
        >
          {row.original.emiStatus}
        </span>
      ),
    },
    {
      accessorKey: "paymentType",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 whitespace-nowrap">
          {row.original.paymentType}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={clsx(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
            row.original.status === "Active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700",
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    // ── View Actions (single column) ────────────────────────────────────
    {
      id: "view",
      header: "View",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          <UITooltip content="Details">
            <button
              type="button"
              onClick={() => setSelectedStore(row.original)}
              className="flex flex-col items-center gap-0 group"
            >
              <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                Details
              </span>
            </button>
          </UITooltip>
          <UITooltip content="Note">
            <button
              type="button"
              onClick={() => setSelectedNoteStore(row.original)}
              className="flex flex-col items-center gap-0 group"
            >
              <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                <StickyNote className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                Note
              </span>
            </button>
          </UITooltip>
          <UITooltip content="Bank Commission">
            <button
              type="button"
              onClick={() => setSelectedCommissionStore(row.original)}
              className="flex flex-col items-center gap-0 group"
            >
              <div className="pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                Bank Com
              </span>
            </button>
          </UITooltip>
        </div>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <ActionMenu
          store={row.original}
          actions={{
            onEdit: setSelectedEditStore,
            onConfig: setSelectedConfigStore,
            onSecurityFund: setSelectedSecurityFundStore,
            onAccount: setSelectedAccountStore,
            onMultiAccount: setSelectedMultiAccountStore,
            onPasswordReset: setSelectedPasswordResetStore,
            onEmi: setSelectedEmiStore,
            onTest: () => stub("Test"),
            onMgtCommission: setSelectedMgtCommStore,
            onBannerLogo: setSelectedBannerLogoStore,
            onQrNetwork: setSelectedQrNetworkStore,
            onManageQr: setSelectedManageQrStore,
            onManageTerminal: setSelectedManageTerminalStore,
            onDailyBalance: setSelectedDailyBalanceStore,
            onBalanceTransfer: setSelectedBalanceTransferStore,
            onAnalysis: setSelectedAnalysisStore,
            onSystemEmail: setSelectedSystemEmailStore,
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/merchants")}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            title="Back to Merchants"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Stores of {merchant?.name || "the Merchant"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {merchant?.storeId} • {merchant?.sector}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(
              merchantId
                ? `/merchants/stores/${merchantId}/new`
                : "/merchants/stores/new",
            )
          }
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterBar
          config={filterConfig}
          filters={localFilters}
          onFilterChange={handleFilterChange}
        />

        <button
          onClick={handleApplyFilters}
          disabled={!hasUnappliedChanges}
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
            hasUnappliedChanges
              ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
          )}
        >
          Apply Filters
        </button>

        {Object.keys(localFilters).length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={filteredStores}
        isLoading={isLoading}
        hideToolbarDateFilter
        filterActions={
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Merchant's Store List
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {filteredStores.length}
            </span>
          </div>
        }
      />

      {/* ── Store Details Drawer ── */}
      <MerchantStoreDrawer
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />

      {/* ── Store Note Drawer ── */}
      <MerchantStoreNoteDrawer
        store={selectedNoteStore}
        onClose={() => setSelectedNoteStore(null)}
      />

      {/* ── Bank Commission Drawer ── */}
      <MerchantStoreBankCommissionDrawer
        store={selectedCommissionStore}
        onClose={() => setSelectedCommissionStore(null)}
      />

      {/* ── Edit Store Drawer ── */}
      <MerchantStoreEditDrawer
        store={selectedEditStore}
        merchantName={merchant?.name}
        onClose={() => setSelectedEditStore(null)}
      />

      {/* ── Config Store Drawer ── */}
      <MerchantStoreConfigDrawer
        store={selectedConfigStore}
        merchantName={merchant?.name}
        onClose={() => setSelectedConfigStore(null)}
      />

      {/* ── Security Fund Drawer ── */}
      <MerchantStoreSecurityFundDrawer
        store={selectedSecurityFundStore}
        merchantName={merchant?.name}
        onClose={() => setSelectedSecurityFundStore(null)}
      />

      {/* ── Account Drawer ── */}
      <MerchantStoreAccountDrawer
        store={selectedAccountStore}
        onClose={() => setSelectedAccountStore(null)}
      />

      {/* ── Multi Account Drawer ── */}
      <MerchantStoreMultiAccountDrawer
        store={selectedMultiAccountStore}
        onClose={() => setSelectedMultiAccountStore(null)}
      />

      {/* ── Store Password Reset Drawer ── */}
      <MerchantStorePasswordResetDrawer
        store={selectedPasswordResetStore}
        onClose={() => setSelectedPasswordResetStore(null)}
      />

      {/* ── EMI Configuration Drawer ── */}
      <MerchantStoreEmiDrawer
        store={selectedEmiStore}
        onClose={() => setSelectedEmiStore(null)}
      />

      {/* ── Mgt Commission Drawer ── */}
      <MerchantStoreMgtCommissionDrawer
        store={selectedMgtCommStore}
        merchantName={merchant?.name}
        onClose={() => setSelectedMgtCommStore(null)}
      />
      <MerchantStoreQrNetworkDrawer
        store={selectedQrNetworkStore}
        onClose={() => setSelectedQrNetworkStore(null)}
        merchantName={merchant?.name}
      />
      <MerchantStoreManageQrDrawer
        store={selectedManageQrStore}
        onClose={() => setSelectedManageQrStore(null)}
        merchantName={merchant?.name}
      />
      <MerchantStoreManageTerminalDrawer
        store={selectedManageTerminalStore}
        onClose={() => setSelectedManageTerminalStore(null)}
        merchantName={merchant?.name}
      />
      <MerchantStoreDailyBalanceDrawer
        store={selectedDailyBalanceStore}
        onClose={() => setSelectedDailyBalanceStore(null)}
        merchantName={merchant?.name}
      />
      <MerchantStoreBalanceTransferDrawer
        store={selectedBalanceTransferStore}
        onClose={() => setSelectedBalanceTransferStore(null)}
      />
      <AnalysisReportConfigDrawer
        open={!!selectedAnalysisStore}
        onClose={() => setSelectedAnalysisStore(null)}
        store={selectedAnalysisStore}
      />
      <MerchantStoreSystemEmailDrawer
        store={selectedSystemEmailStore}
        merchantName={merchant?.name}
        onClose={() => setSelectedSystemEmailStore(null)}
      />
      <MerchantStoreBannerLogoDrawer
        store={selectedBannerLogoStore}
        merchantName={merchant?.name}
        onClose={() => setSelectedBannerLogoStore(null)}
      />
    </div>
  );
}
