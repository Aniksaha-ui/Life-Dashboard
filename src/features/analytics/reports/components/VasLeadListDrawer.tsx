import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "../../../../components/Drawer";

export interface VasLeadListDrawerContext {
  serviceName: string;
  monthLabel?: string;
  count: number;
}

interface VasLeadListDrawerProps {
  open: boolean;
  onClose: () => void;
  context: VasLeadListDrawerContext | null;
}

const MERCHANT_NAMES = [
  "Daily Shopping",
  "Shwapno",
  "Agora",
  "Mina Bazar",
  "Aarong",
  "Lotto",
  "Bata",
  "Apex",
  "Daraz",
  "Chaldal",
  "Rokomari",
  "PriyoShop",
  "Pickaboo",
  "Othoba",
  "Bagdoom",
  "Shajgoj",
  "Meena Bazar",
  "Pathao",
  "Shohoz",
  "Bponi",
  "Bikroy",
  "Esquire",
  "Bengal Meat",
  "Khaas Food",
];

const DUMMY_SECTORS = [
  "Retail",
  "Pureplay Ecommerce",
  "Healthcare",
  "Education",
  "Food & Beverage",
  "Telecommunication",
  "Superstore",
  "Electronics",
  "Fashion",
  "Travel & Tourism",
  "Real Estate",
  "Automotive",
];

const MERCHANT_TYPES = ["Physical", "Online"];

function generateLeads(context: VasLeadListDrawerContext) {
  const { count, serviceName, monthLabel } = context;
  const seed = serviceName + (monthLabel || "");

  return Array.from({ length: count }, (_, i) => {
    const nameBase = MERCHANT_NAMES[(i + seed.length) % MERCHANT_NAMES.length];
    const mType = MERCHANT_TYPES[i % 2];
    const id = `dummy_vas_${serviceName.replace(/\s+/g, "_")}_${monthLabel || "total"}_${i}`;
    const storeId = `vas_${serviceName.slice(0, 3).toUpperCase()}_${i + 1}`;
    return {
      id,
      name: `${nameBase} ${mType} ${i + 1}`,
      storeId,
      sector: DUMMY_SECTORS[i % DUMMY_SECTORS.length],
      gmv7d: Math.floor(50000 + ((i * 17 + seed.length * 11) % 950000)),
      successRate7d: 75 + (i % 23),
      type: mType,
    };
  });
}

const ITEMS_PER_PAGE = 10;

export function VasLeadListDrawer({
  open,
  onClose,
  context,
}: VasLeadListDrawerProps) {
  const navigate = useNavigate();
  const [drawerPage, setDrawerPage] = useState(1);

  useEffect(() => {
    setDrawerPage(1);
  }, [context]);

  const leads = useMemo(() => {
    if (!context) return [];
    return generateLeads(context);
  }, [context]);

  const totalPages = Math.max(1, Math.ceil(leads.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (drawerPage - 1) * ITEMS_PER_PAGE;
    return leads.slice(start, start + ITEMS_PER_PAGE);
  }, [leads, drawerPage]);

  const scrollToTop = () => {
    const el = document.querySelector(".vas-lead-drawer-scroll");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const subtitleParts = [context?.serviceName, context?.monthLabel].filter(
    Boolean,
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Cross Sell Leads"
      subtitle={subtitleParts.join(" · ")}
      width="xl"
      noPadding
      contentClassName="overflow-hidden flex flex-col"
    >
      <div className="flex flex-col h-full min-h-0 bg-white">
        <div className="vas-lead-drawer-scroll flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white">
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
                No leads found for this selection.
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
                {Math.min(drawerPage * ITEMS_PER_PAGE, leads.length)} of{" "}
                {leads.length} entries
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
