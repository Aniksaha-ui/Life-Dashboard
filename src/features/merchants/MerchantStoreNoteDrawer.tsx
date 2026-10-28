import { useState } from "react";
import { Drawer } from "../../components/Drawer";
import { StickyNote, AlertCircle } from "lucide-react";
import type { MerchantStore } from "../../data/mock/types";
import clsx from "clsx";

interface StoreNote {
  id: string;
  user: string;
  date: string;
  type: string;
  message: string;
}

interface MerchantStoreNoteDrawerProps {
  store: MerchantStore | null;
  onClose: () => void;
}

// ── Section heading — same as MerchantStoreDrawer ────────────────────────────
const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
    {title}
  </h3>
);

// ─────────────────────────────────────────────────────────────────────────────
export function MerchantStoreNoteDrawer({
  store,
  onClose,
}: MerchantStoreNoteDrawerProps) {
  const [message, setMessage] = useState("");
  const [noteType, setNoteType] = useState("Normal");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<StoreNote[]>([]);

  if (!store) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!message.trim()) newErrors.message = "Message is required";
    if (!noteType) newErrors.type = "Type is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const newNote: StoreNote = {
      id: Date.now().toString(),
      user: "Admin",
      date: new Date().toLocaleString(),
      type: noteType,
      message: message.trim(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setMessage("");
    setNoteType("Normal");
    setErrors({});
  };

  const customTitle = (
    <div>
      <div className="text-xl font-bold text-slate-900">View Note</div>
      <div className="text-sm text-slate-500 font-normal flex items-center gap-2 mt-1">
        <StickyNote className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono text-slate-400">{store.storeId}</span>
      </div>
    </div>
  );

  return (
    <Drawer open={!!store} onClose={onClose} title={customTitle} width="xl">
      <div className="space-y-8 pb-20">
        {/* ── Add Notification Form ─────────────────────────────── */}
        <section>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Message textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message or notification (if you like to add for future use)
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((p) => ({ ...p, message: "" }));
                }}
                placeholder="Enter reason"
                className={clsx(
                  "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none",
                  errors.message
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-200",
                )}
              />
              {errors.message && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {errors.message}
                </p>
              )}
            </div>

            {/* Type select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Type
              </label>
              <select
                value={noteType}
                onChange={(e) => {
                  setNoteType(e.target.value);
                  if (errors.type) setErrors((p) => ({ ...p, type: "" }));
                }}
                className={clsx(
                  "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all",
                  errors.type
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-200",
                )}
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Critical">Critical</option>
                <option value="Warning">Warning</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {errors.type}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md flex items-center gap-2"
            >
              Add Notification
            </button>
          </form>
        </section>

        {/* ── Divider ───────────────────────────────────────────── */}
        <hr className="border-slate-200" />

        {/* ── Previous Notifications ────────────────────────────── */}
        <section>
          <SectionTitle title="Previous Notification" />

          {notes.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 px-4 py-6">
              <p className="text-sm text-slate-500">
                No notification available!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_2fr] border-b border-slate-200 px-4 py-3 bg-slate-50">
                <span className="text-xs font-bold text-slate-700">
                  User and
                  <br />
                  Date &amp; Note Type
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Message
                </span>
              </div>
              {/* Table rows */}
              <div className="divide-y divide-slate-100">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="grid grid-cols-[1fr_2fr] px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {note.user}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {note.date}
                      </p>
                      <span
                        className={clsx(
                          "inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          note.type === "Critical"
                            ? "bg-rose-100 text-rose-700"
                            : note.type === "Important"
                              ? "bg-amber-100 text-amber-700"
                              : note.type === "Warning"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {note.type}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {note.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </Drawer>
  );
}
