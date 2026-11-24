import { BellRing, Mail, Play, Send } from "lucide-react";
import {
  parseRecipientLines,
  recipientLines,
} from "../hooks/useReportDelivery";
import type { ReportDeliverySetting } from "../types";

interface ReportDeliveryCardProps {
  setting: ReportDeliverySetting;
  isRunning: boolean;
  onRun: (setting: ReportDeliverySetting) => void;
  onUpdate: <K extends keyof ReportDeliverySetting>(
    jobKey: string,
    field: K,
    value: ReportDeliverySetting[K],
  ) => void;
}

function Switch({ checked, disabled, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-primary-600 peer-focus-visible:ring-4 peer-focus-visible:ring-primary-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}

function DeliveryChannel({ type, enabled, disabled, recipients, onEnabledChange, onRecipientsChange }: { type: "email" | "telegram"; enabled: boolean; disabled: boolean; recipients: string[]; onEnabledChange: (enabled: boolean) => void; onRecipientsChange: (recipients: string[]) => void }) {
  const isEmail = type === "email";
  const Icon = isEmail ? Mail : Send;
  const label = isEmail ? "Email" : "Telegram";
  const helper = isEmail ? "Send the complete report as a PDF." : "Send a compact completion notification.";

  return (
    <section className={`rounded-xl border p-4 transition ${enabled && !disabled ? "border-primary-200 bg-primary-50/50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isEmail ? "bg-primary-100 text-primary-700" : "bg-cyan-100 text-cyan-700"}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">{label}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
          </div>
        </div>
        <Switch checked={enabled} disabled={disabled} label={`Enable ${label} for this report`} onChange={onEnabledChange} />
      </div>
      <label className="mt-4 block text-xs font-semibold text-slate-700">
        {isEmail ? "Recipients" : "Chat IDs"}
        <span className="ml-1 font-normal text-slate-500">One per line</span>
        <textarea
          value={recipientLines(recipients)}
          disabled={disabled || !enabled}
          onChange={(event) => onRecipientsChange(parseRecipientLines(event.target.value))}
          placeholder={isEmail ? "you@example.com" : "-1001234567890"}
          className="mt-2 block min-h-28 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary-500"
        />
      </label>
    </section>
  );
}

export function ReportDeliveryCard({ setting, isRunning, onRun, onUpdate }: ReportDeliveryCardProps) {
  const disabled = !setting.is_enabled;
  return (
    <article className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition ${disabled ? "opacity-65" : ""}`}>
      <header className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-700">Scheduled report</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">{setting.label}</h2>
          <code className="mt-1 block truncate text-xs text-slate-500">{setting.command}</code>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{setting.is_enabled ? "Delivery on" : "Delivery off"}</span>
            <Switch checked={setting.is_enabled} label={`Enable delivery for ${setting.label}`} onChange={(value) => onUpdate(setting.job_key, "is_enabled", value)} />
          </div>
          <button type="button" disabled={disabled || isRunning} onClick={() => onRun(setting)} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
            <Play className="h-3.5 w-3.5" fill="currentColor" />
            {isRunning ? "Running…" : "Run now"}
          </button>
        </div>
      </header>
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        <DeliveryChannel type="email" enabled={setting.email_enabled} disabled={disabled} recipients={setting.email_recipients ?? []} onEnabledChange={(value) => onUpdate(setting.job_key, "email_enabled", value)} onRecipientsChange={(value) => onUpdate(setting.job_key, "email_recipients", value)} />
        <DeliveryChannel type="telegram" enabled={setting.telegram_enabled} disabled={disabled} recipients={setting.telegram_chat_ids ?? []} onEnabledChange={(value) => onUpdate(setting.job_key, "telegram_enabled", value)} onRecipientsChange={(value) => onUpdate(setting.job_key, "telegram_chat_ids", value)} />
      </div>
      <p className="flex items-start gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500 sm:px-5"><BellRing className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" />Changes are saved when you select <strong className="font-semibold text-slate-700">Save changes</strong>. Telegram delivery requires a configured bot token.</p>
    </article>
  );
}
