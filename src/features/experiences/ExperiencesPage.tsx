import { BriefcaseBusiness, Building2, CalendarDays, MapPin, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { SearchField } from "../../components/SearchField";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { EmptyState } from "../../components/EmptyState";
import { MetricCard } from "../../components/MetricCard";
import { ExperienceForm } from "./components/ExperienceForm";
import { createExperience, deleteExperience, getExperiences, updateExperience } from "./api/queries";
import type { ExperienceApiItem, ExperienceFormValues } from "./types";

const isCurrent = (value: ExperienceApiItem["is_current"]) => value === true || value === 1 || value === "1" || value === "true";
const formatDate = (value: string) => {
  if (!value || value === "Present") return "Present";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

function CompanyLogo({ imageUrl, company }: { imageUrl?: string | null; company: string }) {
  const [failed, setFailed] = useState(false);
  if (!imageUrl || failed) return <Building2 className="h-5 w-5" aria-label={`${company} logo`} />;
  return <img src={imageUrl} alt={`${company} logo`} className="h-full w-full object-contain p-1.5" onError={() => setFailed(true)} />;
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ExperienceApiItem | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setExperiences((await getExperiences()).rows); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load experiences."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const rows = useMemo(() => experiences.filter((item) => `${item.job_title} ${item.company} ${item.location} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [experiences, search]);
  const save = async (values: ExperienceFormValues, id?: string | number) => {
    try {
      if (id) { await updateExperience(id, values); toast.success("Experience updated successfully."); }
      else { await createExperience(values); toast.success("Experience added successfully."); }
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save experience.");
      throw error;
    }
  };
  const remove = async (item: ExperienceApiItem) => {
    if (!window.confirm(`Delete ${item.job_title} at ${item.company}? This cannot be undone.`)) return;
    try { await deleteExperience(item.id); toast.success("Experience deleted successfully."); await refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete experience."); }
  };
  const currentRoles = experiences.filter((item) => isCurrent(item.is_current)).length;
  const active = experiences.filter((item) => Number(item.status) === 1).length;

  return <div className="app-management-page experience-page space-y-6">
    <header className="app-page-header"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">Professional profile</p><h1 className="mt-2 flex items-center gap-3 font-bold tracking-tight text-slate-900"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-600 text-white shadow-sm"><BriefcaseBusiness className="h-5 w-5" /></span>Experience</h1><p className="mt-3 text-sm leading-6 text-slate-600">Build a clear, polished record of your roles, career progression, and achievements.</p></div><button type="button" onClick={() => { setSelected(null); setModalOpen(true); }} className="app-page-primary-action inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition hover:bg-primary-700"><Plus className="h-4 w-4" />Add experience</button></div></header>

    <section className="grid gap-3 sm:grid-cols-3"><MetricCard title="Total roles" value={experiences.length} isLoading={loading} className="border-blue-100" /><MetricCard title="Current roles" value={currentRoles} isLoading={loading} className="border-emerald-100" /><MetricCard title="Visible entries" value={active} isLoading={loading} className="border-violet-100" /></section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Career history</h2><p className="mt-0.5 text-xs text-slate-500">{loading ? "Loading entries..." : `${rows.length} ${rows.length === 1 ? "role" : "roles"} shown`}</p></div><div className="flex items-center gap-2"><SearchField value={search} onChange={setSearch} placeholder="Search roles or companies" className="min-w-0 w-full flex-1 sm:w-72 sm:flex-none" /><button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60" aria-label="Refresh experiences"><RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button></div></div>
      {loading ? <div className="grid gap-4 p-5 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-xl bg-slate-100" />)}</div> : !rows.length ? <EmptyState title="No experience entries found" subtitle="Try another search or add your first role." /> : <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((item) => { const currentRole = isCurrent(item.is_current); const visible = Number(item.status) === 1; return <article key={item.id} className="group relative flex min-h-[264px] flex-col rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-sm font-extrabold text-primary-700"><CompanyLogo imageUrl={item.image_url} company={item.company} /></div><div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{item.job_title}</h3><p className="mt-0.5 truncate text-sm font-semibold text-primary-700">{item.company}</p></div></div><div className="flex shrink-0 gap-1 opacity-70 transition group-hover:opacity-100"><button type="button" onClick={() => { setSelected(item); setModalOpen(true); }} className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" aria-label={`Edit ${item.job_title}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void remove(item)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label={`Delete ${item.job_title}`}><Trash2 className="h-4 w-4" /></button></div></div><div className="mt-5 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${currentRole ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{currentRole ? "Current role" : "Previous role"}</span>{!visible && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Hidden</span>}</div><div className="mt-4 space-y-2 text-xs font-medium text-slate-500"><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary-600" />{item.location}</p><p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-primary-600" />{formatDate(item.start_date)} — {currentRole ? "Present" : formatDate(item.end_date)}</p></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p></article>; })}</div>}</section>
    <ExperienceForm experience={selected} open={modalOpen} onClose={() => setModalOpen(false)} onSave={save} />
  </div>;
}
