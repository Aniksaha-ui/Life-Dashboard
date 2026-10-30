import { Loader } from "../../../components/Loader";

export function ReportLoadingOverlay() {
  return (
    <div className="flex min-h-[26rem] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <Loader size="lg" />
    </div>
  );
}
