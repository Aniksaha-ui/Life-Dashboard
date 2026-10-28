import { useState, useEffect } from "react";
import { Drawer } from "../../../../components/Drawer";

interface EditSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
  item: any | null;
}

const riskySanctionTypes = [
  { value: "Customer Name", label: "Customer Name" },
  { value: "Strid", label: "Strid" },
  { value: "Email", label: "Email" },
  { value: "Phone No", label: "Phone No" },
  { value: "City", label: "City" },
];

export function EditSanctionModal({
  isOpen,
  onClose,
  onSave,
  item,
}: EditSanctionModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    filterValue: "",
    remarks: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type,
        filterValue: item.filterValue,
        remarks: item.remarks || "",
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...item, ...formData });
    onClose();
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Edit Risky Sanction"
      width="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                backgroundPosition: "right 1rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25rem",
              }}
            >
              {riskySanctionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Filter Value
            </label>
            <input
              type="text"
              value={formData.filterValue}
              onChange={(e) =>
                setFormData({ ...formData, filterValue: e.target.value })
              }
              placeholder="Enter Filter Value"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Enter Remarks"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Drawer>
  );
}
