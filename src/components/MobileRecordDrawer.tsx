import { Drawer } from "./Drawer";

type Detail = {
  label: string;
  value: string | number | boolean | null | undefined;
};

const valueLabel = (value: Detail["value"]) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

export function MobileRecordDrawer({
  open,
  onClose,
  title,
  subtitle,
  details,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  details: Detail[];
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      width="md"
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {detail.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-medium text-slate-900">
              {valueLabel(detail.value)}
            </dd>
          </div>
        ))}
      </dl>
    </Drawer>
  );
}
