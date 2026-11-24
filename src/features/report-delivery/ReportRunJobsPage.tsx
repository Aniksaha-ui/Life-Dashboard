import { CalendarDays, Play, RefreshCcw, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { OutlinedField, outlinedControlClass } from "../../components/OutlinedField";
import { PageLoadingState } from "../../components/PageLoadingState";
import { useReportDelivery } from "./hooks/useReportDelivery";

export default function ReportRunJobsPage() {
  const delivery = useReportDelivery();

  return (
    <div className="report-run-jobs-page mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"><Play className="ml-0.5 h-5 w-5" fill="currentColor" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">Automation</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Run report jobs</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Generate any enabled scheduled report for the date range below. Delivery follows its saved email and Telegram settings.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={() => void delivery.refresh()} disabled={delivery.isLoading || delivery.runningJob !== null} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${delivery.isLoading ? "animate-spin" : ""}`} />Refresh</button>
            <Link to="/report-delivery" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Settings2 className="h-4 w-4" />Delivery settings</Link>
          </div>
        </div>

        <section className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-end md:justify-between" aria-labelledby="job-run-period">
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600"><CalendarDays className="h-4 w-4" /></span>
            <div>
              <h2 id="job-run-period" className="font-semibold text-slate-900">Run period</h2>
              <p className="mt-1 text-sm text-slate-500">This period applies to the job you select below.</p>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:flex sm:gap-3">
            <OutlinedField label="From" className="min-w-0 sm:w-40"><input type="date" value={delivery.fromDate} max={delivery.toDate} onChange={(event) => delivery.setFromDate(event.target.value)} className={outlinedControlClass} /></OutlinedField>
            <span className="pb-2.5 text-xs font-medium text-slate-400">to</span>
            <OutlinedField label="To" className="min-w-0 sm:w-40"><input type="date" value={delivery.toDate} min={delivery.fromDate} onChange={(event) => delivery.setToDate(event.target.value)} className={outlinedControlClass} /></OutlinedField>
          </div>
        </section>
      </header>

      {delivery.isLoading ? <PageLoadingState /> : delivery.settings.length ? <section className="grid gap-4 sm:grid-cols-2">{delivery.settings.map((setting) => {
        const running = delivery.runningJob === setting.job_key;
        return <article key={setting.job_key} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${setting.is_enabled ? "" : "opacity-60"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-700">Scheduled report</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">{setting.label}</h2>
              <code className="mt-2 block truncate text-xs text-slate-500">{setting.command}</code>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${setting.is_enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{setting.is_enabled ? "Enabled" : "Disabled"}</span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs leading-5 text-slate-500">{setting.email_enabled || setting.telegram_enabled ? "Will use saved delivery channels." : "No delivery channel is enabled."}</p>
            <button type="button" disabled={!setting.is_enabled || running || delivery.runningJob !== null} onClick={() => void delivery.run(setting)} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"><Play className="h-3.5 w-3.5" fill="currentColor" />{running ? "Running…" : "Run job"}</button>
          </div>
        </article>;
      })}</section> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No report jobs are available to run.</div>}
    </div>
  );
}
