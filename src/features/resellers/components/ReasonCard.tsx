interface ReasonCardProps {
  title: string;
  reason?: string;
}

export function ReasonCard({ title, reason }: ReasonCardProps) {
  if (!reason) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-4 shadow-sm">
        <p className="text-sm text-slate-700 leading-relaxed">{reason}</p>
      </div>
    </section>
  );
}
