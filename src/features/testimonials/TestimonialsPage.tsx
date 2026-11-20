import { Pencil, Plus, Quote, RefreshCcw, Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { EmptyState } from "../../components/EmptyState";
import { SearchField } from "../../components/SearchField";
import { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } from "./api/queries";
import { TestimonialForm } from "./components/TestimonialForm";
import type { TestimonialApiItem, TestimonialFormValues } from "./types";

const visible = (status: TestimonialApiItem["status"]) => Number(status) === 1;

function Portrait({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!imageUrl || failed) return <span className="text-sm font-extrabold text-primary-700">{name.slice(0, 1).toUpperCase()}</span>;
  return <img src={imageUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />;
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<TestimonialApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TestimonialApiItem | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await getTestimonials(1, search)).rows);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load testimonials.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void refresh(); }, [refresh]);

  const rows = useMemo(
    () => items.filter((item) => `${item.name} ${item.designation} ${item.feedback}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const save = async (values: TestimonialFormValues, id?: string | number) => {
    try {
      if (id) {
        await updateTestimonial(id, values);
        toast.success("Testimonial updated successfully.");
      } else {
        await createTestimonial(values);
        toast.success("Testimonial added successfully.");
      }
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save testimonial.");
      throw error;
    }
  };

  const remove = async (item: TestimonialApiItem) => {
    if (!window.confirm(`Delete the testimonial from ${item.name}? This cannot be undone.`)) return;
    try {
      await deleteTestimonial(item.id);
      toast.success("Testimonial deleted successfully.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete testimonial.");
    }
  };

  return (
    <div className="app-management-page testimonials-page space-y-6">
      <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
          <p className="mt-1 text-sm text-slate-500">Collect recommendations, ratings, and portraits for your portfolio.</p>
        </div>
        <div className="app-page-actions flex flex-wrap gap-2">
          <button type="button" onClick={() => { setSelected(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            Add testimonial
          </button>
        </div>
      </div>
      <section className="app-filter-panel rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 items-center gap-3 lg:grid-cols-[minmax(0,18rem)_auto_auto] lg:justify-start">
          <SearchField value={search} onChange={setSearch} placeholder="Search testimonials" className="col-span-2 lg:col-span-1" />
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-600 disabled:opacity-60" aria-label="Refresh testimonials">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setSearch("")} className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Clear filters
          </button>
        </div>
      </section>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-52 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : !rows.length ? (
        <div className="rounded-xl border border-slate-200 bg-white"><EmptyState title="No testimonials found" subtitle="Try another search or add your first recommendation." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => {
            const stars = Math.max(0, Math.min(5, Number(item.rating) || 0));
            return (
              <article key={item.id} className="flex min-h-52 flex-col rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-primary-50">
                      <Portrait imageUrl={item.image_url} name={item.name} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-slate-900">{item.name}</h2>
                      <p className="truncate text-sm text-slate-500">{item.designation}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => { setSelected(item); setOpen(true); }} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" aria-label={`Edit ${item.name}`}><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => void remove(item)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-amber-500" aria-label={`${stars} star rating`}>
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < stars ? "fill-current" : "text-slate-200"}`} />)}
                  {!visible(item.status) && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">Hidden</span>}
                </div>
                <p className="mt-3 flex gap-2 text-sm leading-6 text-slate-600"><Quote className="mt-1 h-4 w-4 shrink-0 text-primary-600" />{item.feedback}</p>
              </article>
            );
          })}
        </div>
      )}
      <TestimonialForm testimonial={selected} open={open} onClose={() => setOpen(false)} onSave={save} />
    </div>
  );
}
