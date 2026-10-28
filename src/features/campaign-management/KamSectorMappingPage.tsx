import { useState, useMemo, useEffect } from "react";
import { Pencil } from "lucide-react";
import { clsx } from "clsx";
import { DataTable } from "../../components/DataTable";
import { FilterBar, ClearAllFiltersButton } from "../../components/FilterBar";
import { Drawer } from "../../components/Drawer";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ActionIconButton,
  ActionIconButtonGroup,
} from "./components/ActionIconButton";

interface KamSectorEntry {
  id: string;
  sectorName: string;
  kamList: string[];
}

const MOCK_DATA: KamSectorEntry[] = [
  {
    id: "1",
    sectorName: "Agriculture Services",
    kamList: [
      "safayet.hossain@sslcommerz.com",
      "sadia.rahman@sslcommerz.com",
      "nusrat.shirmin@sslcommerz.com",
      "susanta.kam@gmail.com",
      "sahaanik1045@gmail.com",
      "ahmed.reza@sslcommerz.com",
      "asma.aktar@sslwireless.com",
      "abmmhasan@gmail.com",
    ],
  },
  {
    id: "2",
    sectorName: "Business Services",
    kamList: [
      "saifur.rahman@sslcommerz.com",
      "md.faisal@sslcommerz.com",
      "susanta.kam@gmail.com",
      "ahmed.reza@sslcommerz.com",
    ],
  },
  {
    id: "3",
    sectorName: "Retail Outlet Services",
    kamList: [
      "nusrat.shirmin@sslcommerz.com",
      "safayet.hossain@sslcommerz.com",
      "sadia.rahman@sslcommerz.com",
      "ahmed.reza@sslcommerz.com",
    ],
  },
  {
    id: "4",
    sectorName: "Airlines",
    kamList: [
      "sefaat.ahammad@sslcommerz.com",
      "roushon.ara@sslcommerz.com",
      "jawadur.rahman@sslcommerz.com",
    ],
  },
  {
    id: "5",
    sectorName: "Car Rental",
    kamList: [
      "moutusi.hannan@sslcommerz.com",
      "safiul.huda@sslcommerz.com",
      "ahmed.reza@sslcommerz.com",
      "sahaanik1045@gmail.com",
    ],
  },
  {
    id: "6",
    sectorName: "University",
    kamList: [
      "ananya.sarker@sslcommerz.com",
      "foyjun.naher@sslcommerz.com",
      "priya.rani@sslcommerz.com",
      "ahmed.reza@sslcommerz.com",
    ],
  },
  {
    id: "7",
    sectorName: "College",
    kamList: [
      "ananya.sarker@sslcommerz.com",
      "foyjun.naher@sslcommerz.com",
      "priya.rani@sslcommerz.com",
      "ahmed.reza@sslcommerz.com",
    ],
  },
  {
    id: "8",
    sectorName: "School",
    kamList: [
      "ananya.sarker@sslcommerz.com",
      "foyjun.naher@sslcommerz.com",
      "priya.rani@sslcommerz.com",
      "ahmed.reza@sslcommerz.com",
    ],
  },
  {
    id: "9",
    sectorName: "Tour Operator & Travel Agencies",
    kamList: [
      "moutusi.hannan@sslcommerz.com",
      "safiul.huda@sslcommerz.com",
      "ahmed.reza@sslcommerz.com",
      "islam.israt@sslcommerz.com",
    ],
  },
  {
    id: "10",
    sectorName: "Marketplace",
    kamList: [
      "nusrat.shirmin@sslcommerz.com",
      "safayet.hossain@sslcommerz.com",
      "sadia.rahman@sslcommerz.com",
    ],
  },
  {
    id: "11",
    sectorName: "Ministry of Foreign Affairs",
    kamList: ["saifur.rahman@sslcommerz.com", "md.faisal@sslcommerz.com"],
  },
  {
    id: "12",
    sectorName: "ITES",
    kamList: ["saifur.rahman@sslcommerz.com", "md.faisal@sslcommerz.com"],
  },
  {
    id: "13",
    sectorName: "Charity/NGO/Volunteer Services",
    kamList: [
      "shubhojit.ghosh@sslcommerz.com",
      "tamanna.nawsin@sslcommerz.com",
      "hasansamiul@sslcommerz.com",
    ],
  },
  {
    id: "14",
    sectorName: "Distance Learning",
    kamList: [
      "ananya.sarker@sslcommerz.com",
      "foyjun.naher@sslcommerz.com",
      "priya.rani@sslcommerz.com",
    ],
  },
  {
    id: "15",
    sectorName: "ISP",
    kamList: ["saifur.rahman@sslcommerz.com", "md.faisal@sslcommerz.com"],
  },
];

const SectionHeader = ({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: any;
}) => (
  <div className="flex items-center gap-2 mb-4 pb-1 border-b border-slate-100">
    {Icon && <Icon className="w-3.5 h-3.5 text-primary-500" />}
    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);

const FormField = ({ label, value, onChange, placeholder, readOnly }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      className={clsx(
        "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none transition-all shadow-sm",
        readOnly
          ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
          : "focus:ring-2 focus:ring-primary-500 border-slate-200",
      )}
    />
  </div>
);

export default function KamSectorMappingPage() {
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    sectorName: "",
  });
  const [localFilters, setLocalFilters] =
    useState<Record<string, any>>(appliedFilters);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<KamSectorEntry | null>(
    null,
  );
  const [newKamEmail, setNewKamEmail] = useState("");
  const [currentKamList, setCurrentKamList] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    if (selectedSector) {
      setCurrentKamList(selectedSector.kamList);
    }
  }, [selectedSector]);

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => setAppliedFilters(localFilters);

  const handleClearFilters = () => {
    setLocalFilters({ sectorName: "" });
    setAppliedFilters({ sectorName: "" });
  };

  const handleDeleteKam = (email: string) => {
    setCurrentKamList((prev) => prev.filter((e) => e !== email));
  };

  const handleSaveKamList = () => {
    if (!newKamEmail.trim()) return;
    if (!currentKamList.includes(newKamEmail.trim())) {
      setCurrentKamList((prev) => [newKamEmail.trim(), ...prev]);
      setNewKamEmail("");
    }
  };

  const handleUpdatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setIsManageDrawerOpen(false);
    }, 1000);
  };

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(
      (item) =>
        !appliedFilters.sectorName ||
        item.sectorName
          .toLowerCase()
          .includes(appliedFilters.sectorName.toLowerCase()),
    );
  }, [appliedFilters]);

  const columns: ColumnDef<KamSectorEntry>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-medium">
          {row.index + 1}
        </span>
      ),
      size: 40,
    },
    {
      accessorKey: "sectorName",
      header: "Sector Name",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-900 leading-tight">
          {row.original.sectorName}
        </span>
      ),
    },
    {
      accessorKey: "kamList",
      header: "Kam List",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 py-1 pr-6 max-w-4xl">
          {row.original.kamList.map((email, idx) => (
            <span
              key={email}
              className="text-xs text-slate-700 font-normal leading-[1.3] break-all"
            >
              {email}
              {idx < row.original.kamList.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-right block w-full">Action</span>,
      cell: ({ row }) => (
        <ActionIconButtonGroup className="justify-end">
          <ActionIconButton
            label="Edit"
            tooltip="Edit"
            icon={Pencil}
            onClick={() => {
              setSelectedSector(row.original);
              setIsManageDrawerOpen(true);
            }}
          />
        </ActionIconButtonGroup>
      ),
      size: 120,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Kam Sector Mapping
          </h1>
          <p className="text-slate-500 text-sm tracking-tight">
            Manage sector-wise KAM assignments for operational efficiency.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            filters={localFilters}
            onFilterChange={handleFilterChange}
            config={[
              {
                key: "sectorName",
                type: "input",
                label: "Sector Name",
                placeholder: "Enter sector name...",
              },
            ]}
          />

          <button
            onClick={handleApplyFilters}
            disabled={
              JSON.stringify(localFilters) === JSON.stringify(appliedFilters)
            }
            className={clsx(
              "flex items-center gap-2 px-6 py-1.5 text-sm font-bold rounded-full transition-all shadow-sm ml-2",
              JSON.stringify(localFilters) !== JSON.stringify(appliedFilters)
                ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
            )}
          >
            Apply Filters
          </button>
          <ClearAllFiltersButton
            onClick={handleClearFilters}
            filters={localFilters}
          />
        </div>

        <div className="pt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            hideToolbarDateFilter={true}
            viewButtonLabel="View Column"
            filterActions={
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 ml-1 uppercase tracking-tighter opacity-80">
                  Sector Mappings
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredData.length}
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Manage KAMs Drawer - Tight Style */}
      <Drawer
        open={isManageDrawerOpen}
        onClose={() => {
          setIsManageDrawerOpen(false);
          setNewKamEmail("");
        }}
        title={
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-bold text-slate-900">
              Configure KAM Mapping
            </span>
            <span className="text-xs text-primary-600 font-semibold uppercase tracking-wider">
              {selectedSector?.sectorName}
            </span>
          </div>
        }
        width="xl"
      >
        <div className="relative pb-32">
          <div className="flex flex-col space-y-10">
            {/* Section 1: Add KAM (Mapping Form) */}
            <section>
              <SectionHeader title="Kam Sector Mapping" />

              <div className="space-y-5">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Sector Name
                  </span>
                  <p className="text-base font-bold text-slate-900 leading-tight">
                    {selectedSector?.sectorName || "—"}
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Assign New Kam Email"
                    value={newKamEmail}
                    onChange={(e: any) => setNewKamEmail(e.target.value)}
                    placeholder="Enter email address..."
                  />
                  <button
                    onClick={handleSaveKamList}
                    disabled={!newKamEmail.trim() || !newKamEmail.includes("@")}
                    className={clsx(
                      "flex items-center justify-center gap-2 px-6 py-2 w-full rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98]",
                      newKamEmail.trim() && newKamEmail.includes("@")
                        ? "bg-primary-600 hover:bg-primary-700 text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                    )}
                  >
                    Add to List
                  </button>
                </div>
              </div>
            </section>

            {/* Section 2: Assigned List */}
            <section>
              <SectionHeader title="Assigned Kam List" />

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#fcfdff] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 w-12 border-r border-slate-200 uppercase tracking-tighter">
                        Sl
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 border-r border-slate-200 uppercase tracking-tighter">
                        Email Address
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 w-20 uppercase tracking-tighter text-center italic">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentKamList.map((email, idx) => (
                      <tr
                        key={email}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-400 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-slate-700 border-r border-slate-200 break-all">
                          {email}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-center">
                          <button
                            onClick={() => handleDeleteKam(email)}
                            className="text-rose-500 hover:text-rose-700 font-bold tracking-tight hover:underline transition-all"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentKamList.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-10 text-center text-xs text-slate-400 italic font-medium"
                        >
                          No KAMs assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Tight Sticky Footer */}
          <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-sm -mx-8 px-8 pb-4 mt-12 z-20 transition-all flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsManageDrawerOpen(false)}
                className="px-5 py-2 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleUpdatePortfolio}
                disabled={isUpdating}
                className={clsx(
                  "bg-primary-600 text-white px-8 py-2.5 rounded-lg font-black text-xs hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 active:scale-95 uppercase tracking-wide",
                  isUpdating && "cursor-not-allowed opacity-80",
                )}
              >
                {isUpdating && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isUpdating ? "Updating..." : "Save Mapping"}
              </button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
