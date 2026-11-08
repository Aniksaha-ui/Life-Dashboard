import {
  AlertTriangle,
  BrainCircuit,
  CalendarRange,
  Lightbulb,
  RefreshCcw,
  Send,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "../../components/Loader";
import {
  askFinance,
  getAnomalies,
  getDashboard,
  reviewAnomaly,
} from "./api/queries";

const amount = (value: unknown) =>
  `BDT ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
function Card({ label, value, icon: Icon, tone }: any) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <span
        className={`absolute inset-x-0 bottom-0 h-1 opacity-70 ${tone.split(" ")[0]}`}
      />
    </article>
  );
}
function Panel({ title, icon: Icon, children }: any) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-600">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
const Empty = ({ text }: { text: string }) => (
  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
    {text}
  </p>
);

export default function FinancialIntelligencePage() {
  const initial = new Date();
  const [from, setFrom] = useState(
    `${initial.getFullYear()}-${String(initial.getMonth() + 1).padStart(2, "0")}-01`,
  );
  const [to, setTo] = useState(today());
  const [data, setData] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboard, anomalyData] = await Promise.all([
        getDashboard(from, to),
        getAnomalies(),
      ]);
      setData(dashboard);
      setAnomalies(
        Array.isArray(anomalyData) ? anomalyData : anomalyData?.rows || [],
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load financial intelligence.",
      );
    } finally {
      setLoading(false);
    }
  }, [from, to]);
  useEffect(() => {
    void load();
  }, [load]);
  const metrics = data?.metrics || {};
  const categories = metrics.category_spending || [];
  const insights = data?.insights || [];
  const recommendations = data?.recommendations || [];
  const forecast = data?.forecast || {};
  const weeks = data?.weekly_spending?.rows || [];
  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    try {
      setAnswer(
        (await askFinance(question, from, to)).answer ||
          "No answer was returned.",
      );
    } catch (reason) {
      setAnswer(reason instanceof Error ? reason.message : "Unable to answer.");
    } finally {
      setAsking(false);
    }
  };
  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-[#eaf2ff] via-white to-cyan-50 p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary-700">
              Financial intelligence
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
              <BrainCircuit className="h-6 w-6 text-primary-600" />
              Financial Intelligence
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Cash flow, forecasts, recommendations, and unusual spending in one
              decision-ready view.
            </p>
          </div>
          <span className="relative inline-flex h-fit w-fit items-center gap-2 rounded-xl border border-primary-100 bg-white/90 px-3 py-2 text-sm font-semibold text-primary-700 shadow-sm">
            <CalendarRange className="h-4 w-4" />
            Live analysis
          </span>
        </div>
        <div className="relative mt-6 grid gap-3 rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm sm:grid-cols-3">
          <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            From date
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            />
          </label>
          <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            To date
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            />
          </label>
          <button
            onClick={() => void load()}
            className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh analysis
          </button>
        </div>
      </header>
      {error && (
        <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      )}
      {loading ? (
        <div className="grid h-72 place-items-center">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card
              label="Current balance"
              value={amount(metrics.current_balance)}
              icon={WalletCards}
              tone="bg-primary-50 text-primary-600"
            />
            <Card
              label="Period income"
              value={amount(metrics.total_income)}
              icon={TrendingUp}
              tone="bg-emerald-50 text-emerald-600"
            />
            <Card
              label="Period expenses"
              value={amount(metrics.total_expenses)}
              icon={TrendingDown}
              tone="bg-amber-50 text-amber-600"
            />
            <Card
              label="Net cash flow"
              value={amount(metrics.net_cash_flow)}
              icon={WalletCards}
              tone="bg-cyan-50 text-cyan-600"
            />
          </section>
          <section className="grid gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.8fr)]">
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
                <Panel title="Financial briefing" icon={BrainCircuit}>
                  {insights.length ? (
                    <div className="space-y-3">
                      {insights.map((i: any) => (
                        <article
                          key={i.title}
                          className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4"
                        >
                          <p className="font-semibold text-slate-900">
                            {i.title}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {i.interpretation}
                          </p>
                          <p className="mt-3 border-t border-slate-200 pt-3 text-sm font-semibold text-primary-700">
                            {i.recommended_action}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <Empty text="No insight is available for this date range yet." />
                  )}
                </Panel>
                <Panel title="Month-end forecast" icon={TrendingUp}>
                  {forecast.available ? (
                    <div className="space-y-3">
                      {["income", "expenses", "net_cash_flow"].map((key) => (
                        <div
                          key={key}
                          className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm"
                        >
                          <span className="capitalize text-slate-500">
                            Estimated {key.replaceAll("_", " ")}
                          </span>
                          <strong>
                            {amount(forecast.estimated_month_end?.[key])}
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      text={
                        forecast.reason ||
                        "Forecast unavailable until more data is recorded."
                      }
                    />
                  )}
                </Panel>
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <Panel title="Recommended next steps" icon={Lightbulb}>
                  {recommendations.length ? (
                    recommendations.map((r: any) => (
                      <div
                        key={r.title}
                        className="mb-3 rounded-xl border border-slate-100 p-4"
                      >
                        <p className="font-semibold">{r.title}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {r.observation}
                        </p>
                        <p className="mt-2 text-sm text-primary-700">
                          {r.recommended_action}
                        </p>
                      </div>
                    ))
                  ) : (
                    <Empty text="No additional action is recommended." />
                  )}
                </Panel>
                <Panel title="Category spending" icon={TrendingDown}>
                  {categories.length ? (
                    categories.slice(0, 5).map((c: any) => {
                      const share = metrics.total_expenses
                        ? (Number(c.amount) / Number(metrics.total_expenses)) *
                          100
                        : 0;
                      return (
                        <div key={c.name} className="mb-4">
                          <div className="flex justify-between text-sm">
                            <span>{c.name}</span>
                            <strong>{amount(c.amount)}</strong>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-primary-600"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <Empty text="No category spend is recorded." />
                  )}
                </Panel>
              </div>
            </div>
            <aside className="space-y-5 2xl:sticky 2xl:top-6 2xl:self-start">
              <Panel title="Unusual spending" icon={AlertTriangle}>
                {anomalies.length ? (
                  anomalies.slice(0, 5).map((a) => (
                    <article
                      key={a.id}
                      className="mb-3 rounded-xl border border-rose-100 bg-rose-50/40 p-4"
                    >
                      <p className="font-semibold">{a.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{a.message}</p>
                      {!a.reviewed_at && (
                        <button
                          onClick={() =>
                            void reviewAnomaly(a.id).then(() => void load())
                          }
                          className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700"
                        >
                          Mark reviewed
                        </button>
                      )}
                    </article>
                  ))
                ) : (
                  <Empty text="No unusual spending has been detected." />
                )}
              </Panel>
              <Panel title="Weekly spending" icon={CalendarRange}>
                {weeks.length ? (
                  weeks.map((w: any) => (
                    <div
                      key={w.week_start}
                      className="mb-3 rounded-xl bg-slate-50 p-3 text-sm"
                    >
                      <div className="flex justify-between">
                        <span>
                          {w.week_start} → {w.week_end}
                        </span>
                        <strong>{amount(w.total_expenses)}</strong>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {w.transaction_count} expense transactions
                      </p>
                    </div>
                  ))
                ) : (
                  <Empty text="No weekly spend is recorded." />
                )}
              </Panel>
            </aside>
          </section>
          <Panel title="Ask about your finances" icon={BrainCircuit}>
            <form onSubmit={ask} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Why did my expenses increase?"
                className="h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
              />
              <button
                disabled={asking}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" />
                {asking ? "Thinking…" : "Ask question"}
              </button>
            </form>
            {answer && (
              <p className="mt-4 rounded-xl bg-primary-50 p-4 text-sm leading-6 text-slate-700">
                {answer}
              </p>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
