import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "../../../../components/Drawer";
import {
  normalizeSectorOnboardingMerchantPool,
  resolveSectorOnboardingMerchants,
  SECTOR_ONBOARDING_MERCHANT_POOL,
  type SectorOnboardingMerchantPoolEntry,
} from "../data/sectorOnboardingMerchantData";

export interface SectorOnboardingMerchantDrawerContext {
  sectorName: string;
  monthLabel?: string;
  count: number;
}

interface SectorOnboardingMerchantDrawerProps {
  open: boolean;
  onClose: () => void;
  context: SectorOnboardingMerchantDrawerContext | null;
  merchantPool?: SectorOnboardingMerchantPoolEntry[];
}

const MERCHANT_TYPES = ["Physical", "Online"];

const FALLBACK_KAM_NAMES = [
  "Anik Kam",
  "Nahid",
  "saifur",
  "Shahriar",
  "susanta.kam",
  "susanta.tech",
  "Tahsin",
];

function generateMerchants(
  context: SectorOnboardingMerchantDrawerContext,
  merchantPool: SectorOnboardingMerchantPoolEntry[],
) {
  const { count, sectorName, monthLabel } = context;
  const seed = sectorName + (monthLabel || "");
  const poolEntries = resolveSectorOnboardingMerchants(count, merchantPool);

  return Array.from({ length: count }, (_, i) => {
    const poolEntry = poolEntries[i];
    const mType = MERCHANT_TYPES[i % 2];
    const id = `dummy_sector_${sectorName.replace(/\s+/g, "_")}_${monthLabel || "total"}_${i}`;
    const storeId = `sec_${sectorName.slice(0, 3).toUpperCase()}_${i + 1}`;

    return {
      id,
      name: poolEntry.name,
      kamName:
        poolEntry.kamName ||
        FALLBACK_KAM_NAMES[(i + seed.length) % FALLBACK_KAM_NAMES.length],
      storeId,
      sector: sectorName,
      gmv7d: Math.floor(50000 + ((i * 13 + seed.length * 7) % 950000)),
      successRate7d: 75 + (i % 23),
      type: mType,
    };
  });
}

const ITEMS_PER_PAGE = 10;

export function SectorOnboardingMerchantDrawer({
  open,
  onClose,
  context,
  merchantPool,
}: SectorOnboardingMerchantDrawerProps) {
  const navigate = useNavigate();
  const [drawerPage, setDrawerPage] = useState(1);

  const resolvedPool = useMemo(
    () =>
      normalizeSectorOnboardingMerchantPool(
        merchantPool ?? SECTOR_ONBOARDING_MERCHANT_POOL,
      ),
    [merchantPool],
  );

  useEffect(() => {
    setDrawerPage(1);
  }, [context]);

  const merchants = useMemo(() => {
    if (!context) return [];
    return generateMerchants(context, resolvedPool);
  }, [context, resolvedPool]);

  const totalPages = Math.max(1, Math.ceil(merchants.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (drawerPage - 1) * ITEMS_PER_PAGE;
    return merchants.slice(start, start + ITEMS_PER_PAGE);
  }, [merchants, drawerPage]);

  const scrollToTop = () => {
    const el = document.querySelector(".sector-drawer-scroll");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const subtitleParts = [context?.sectorName, context?.monthLabel].filter(
    Boolean,
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Onboarded Merchants"
      subtitle={subtitleParts.join(" · ")}
      width="xl"
      noPadding
      contentClassName="overflow-hidden flex flex-col"
    >
      <div className="flex flex-col h-full min-h-0 bg-white">
        <div className="sector-drawer-scroll flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white">
          {paginated.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {paginated.map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onClose();
                    navigate(`/merchants/profile/${m.id}`);
                  }}
                  className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-all px-2 -mx-2 rounded-lg group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[10px] font-bold text-slate-300 w-8 group-hover:text-primary-400 transition-colors">
                      {((drawerPage - 1) * ITEMS_PER_PAGE + idx + 1)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {m.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ID: {m.storeId} · Sector: {m.sector} · {m.type}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        KAM: {m.kamName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-slate-900">
                      ৳{m.gmv7d.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      SR: {m.successRate7d}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-sm text-slate-400">
                No merchants found for this selection.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Pagination Footer */}
        {totalPages > 1 && (
          <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">
                Showing {(drawerPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(drawerPage * ITEMS_PER_PAGE, merchants.length)} of{" "}
                {merchants.length} entries
              </p>
              <div className="flex items-center gap-3">
                <button
                  disabled={drawerPage === 1}
                  onClick={() => {
                    setDrawerPage((prev) => Math.max(1, prev - 1));
                    scrollToTop();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 select-none">
                  Page {drawerPage} of {totalPages}
                </span>
                <button
                  disabled={drawerPage === totalPages}
                  onClick={() => {
                    setDrawerPage((prev) => Math.min(totalPages, prev + 1));
                    scrollToTop();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
