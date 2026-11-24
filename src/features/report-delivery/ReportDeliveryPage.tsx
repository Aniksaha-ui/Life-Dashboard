import { CalendarDays, Play, RefreshCcw, Save, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { OutlinedField, outlinedControlClass } from "../../components/OutlinedField";
import { PageLoadingState } from "../../components/PageLoadingState";
import { ReportDeliveryCard } from "./components/ReportDeliveryCard";
import { useReportDelivery } from "./hooks/useReportDelivery";

export default function ReportDeliveryPage() {
  const delivery = useReportDelivery();

  return (
    <div className="report-delivery-page mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"><Settings2 className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">Automation</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Report delivery</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Set delivery channels for each scheduled report, or run a report on demand for a selected period.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link to="/report-delivery/run-jobs" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><Play className="h-4 w-4" fill="currentColor" />Run jobs</Link>
            <button type="button" onClick={() => void delivery.refresh()} disabled={delivery.isLoading || delivery.isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${delivery.isLoading ? "animate-spin" : ""}`} />Refresh</button>
            <button type="button" onClick={() => void delivery.save()} disabled={delivery.isLoading || delivery.isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"><Save className="h-4 w-4" />{delivery.isSaving ? "Saving…" : "Save changes"}</button>
          </div>
        </div>

        <section className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-end md:justify-between" aria-labelledby="manual-run-period">
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"><CalendarDays className="h-4 w-4" /></span>
            <div>
              <h2 id="manual-run-period" className="font-semibold text-slate-900">Manual run period</h2>
              <p className="mt-1 text-sm text-slate-500">Used only when you select <strong className="font-semibold text-slate-700">Run now</strong>.</p>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:flex sm:gap-3">
            <OutlinedField label="From" className="min-w-0 sm:w-40"><input type="date" value={delivery.fromDate} max={delivery.toDate} onChange={(event) => delivery.setFromDate(event.target.value)} className={outlinedControlClass} /></OutlinedField>
            <span className="pb-2.5 text-xs font-medium text-slate-400">to</span>
            <OutlinedField label="To" className="min-w-0 sm:w-40"><input type="date" value={delivery.toDate} min={delivery.fromDate} onChange={(event) => delivery.setToDate(event.target.value)} className={outlinedControlClass} /></OutlinedField>
          </div>
        </section>
      </header>

      {delivery.isLoading ? <PageLoadingState /> : delivery.settings.length ? <div className="space-y-4">{delivery.settings.map((setting) => <ReportDeliveryCard key={setting.job_key} setting={setting} isRunning={delivery.runningJob === setting.job_key} onRun={(item) => void delivery.run(item)} onUpdate={delivery.updateSetting} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No scheduled report delivery settings are available.</div>}
    </div>
  );
}
