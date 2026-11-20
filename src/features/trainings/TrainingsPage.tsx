import { Award, CalendarDays, ExternalLink, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { EmptyState } from "../../components/EmptyState";
import { SearchField } from "../../components/SearchField";
import { resolveBlogImageUrl } from "../blogs/utils/imageUrl";
import { createTraining, deleteTraining, getTrainings, updateTraining } from "./api/queries";
import { TrainingForm } from "./components/TrainingForm";
import type { TrainingApiItem, TrainingFormValues } from "./types";

const visible = (status: TrainingApiItem["status"]) => Number(status) === 1;

function Cover({ imageUrl, title }: { imageUrl?: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  const src = resolveBlogImageUrl(imageUrl);
  if (!src || failed) return <Award className="h-5 w-5 text-primary-700" aria-label={title} />;
  return <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />;
}

const formatDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function TrainingsPage() {
  const [items, setItems] = useState<TrainingApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TrainingApiItem | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await getTrainings(1, search)).rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load trainings.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void refresh(); }, [refresh]);

  const rows = useMemo(
    () => items.filter((item) => `${item.title} ${item.provider} ${item.description}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const save = async (values: TrainingFormValues, id?: string | number, image?: File | null) => {
    try {
      if (id) {
        await updateTraining(id, values, image);
        toast.success("Training updated successfully.");
      } else {
        await createTraining(values, image);
        toast.success("Training added successfully.");
      }
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save training.");
      throw error;
    }
  };

  const remove = async (item: TrainingApiItem) => {
    if (!window.confirm(`Delete ${item.title}? This cannot be undone.`)) return;
    try {
      await deleteTraining(item.id);
      toast.success("Training deleted successfully.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete training.");
    }
  };

  return (
    <div className="app-management-page trainings-page space-y-6">
      <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trainings</h1>
          <p className="mt-1 text-sm text-slate-500">Keep courses, providers, and certificates in one place.</p>
        </div>
        <div className="app-page-actions flex flex-wrap gap-2">
          <button type="button" onClick={() => { setSelected(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            Add training
          </button>
        </div>
      </div>
      <section className="app-filter-panel rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 items-center gap-3 lg:grid-cols-[minmax(0,18rem)_auto_auto] lg:justify-start">
          <SearchField value={search} onChange={setSearch} placeholder="Search trainings" className="col-span-2 lg:col-span-1" />
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-600 disabled:opacity-60" aria-label="Refresh trainings">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setSearch("")} className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Clear filters
          </button>
        </div>
      </section>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-56 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : !rows.length ? (
        <div className="rounded-xl border border-slate-200 bg-white"><EmptyState title="No trainings found" subtitle="Try another search or add your first course." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => (
            <article key={item.id} className="flex min-h-56 flex-col rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-primary-50">
                    <Cover imageUrl={item.image_url} title={item.title} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-slate-900">{item.title}</h2>
                    <p className="truncate text-sm text-slate-500">{item.provider}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => { setSelected(item); setOpen(true); }} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" aria-label={`Edit ${item.title}`}><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => void remove(item)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label={`Delete ${item.title}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                <CalendarDays className="h-3.5 w-3.5 text-primary-600" />
                {formatDate(item.start_date)} — {formatDate(item.end_date)}
                {!visible(item.status) && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">Hidden</span>}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <a href={item.certificate_url} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-700 hover:text-primary-800">
                Certificate <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      )}
      <TrainingForm training={selected} open={open} onClose={() => setOpen(false)} onSave={save} />
    </div>
  );
}
