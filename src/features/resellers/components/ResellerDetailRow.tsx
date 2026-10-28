const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 text-sm border-b border-slate-100 last:border-b-0">
    <dt className="w-full sm:w-1/3 text-slate-500 font-semibold uppercase tracking-tight text-[11px] py-0.5">
      {label}
    </dt>
    <dd className="w-full sm:w-2/3 text-slate-900 leading-relaxed text-sm">
      {value ?? "—"}
    </dd>
  </div>
);

export default DetailRow;
