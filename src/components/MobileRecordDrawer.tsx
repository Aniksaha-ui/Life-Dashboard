import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Drawer } from "./Drawer";

export interface RecordDetailItem {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export interface RecordDrawerHero {
  icon: LucideIcon;
  iconClassName?: string;
  overline: string;
  value: ReactNode;
  valueClassName?: string;
  meta?: ReactNode;
  coverImage?: ReactNode;
  stats?: Array<{
    label: string;
    value: ReactNode;
    valueClassName?: string;
  }>;
}

export interface RecordDrawerSection {
  title: string;
  items?: RecordDetailItem[];
  content?: ReactNode;
}

const formatDisplayValue = (value: ReactNode): ReactNode => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
};

export function RecordInformationCard({ children }: { children: ReactNode }) {
  return (
    <dl className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </dl>
  );
}

export function RecordInformationRow({ items }: { items: RecordDetailItem[] }) {
  const isSingle = items.length === 1;

  return (
    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      {items.map(({ label, value, fullWidth, className }) => (
        <div
          key={label}
          className={`min-w-0 px-4 py-3 sm:px-5 ${isSingle || fullWidth ? "sm:col-span-2" : ""} ${className ?? ""}`}
        >
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-800">
            {formatDisplayValue(value)}
          </dd>
        </div>
      ))}
    </div>
  );
}

/** Pairs compact details into 2-column rows while keeping full-width items on their own row. */
const groupDetailRows = (items: RecordDetailItem[]): RecordDetailItem[][] => {
  const rows: RecordDetailItem[][] = [];
  let buffer: RecordDetailItem[] = [];

  for (const item of items) {
    if (item.fullWidth) {
      if (buffer.length > 0) {
        rows.push(buffer);
        buffer = [];
      }
      rows.push([item]);
      continue;
    }

    buffer.push(item);
    if (buffer.length === 2) {
      rows.push(buffer);
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    rows.push(buffer);
  }

  return rows;
};

interface MobileRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  badge?: string;
  badgeClassName?: string;
  recordId?: string | number;
  headerAction?: ReactNode;
  hero?: RecordDrawerHero;
  detailsTitle?: string;
  details: RecordDetailItem[];
  sections?: RecordDrawerSection[];
  footer?: ReactNode;
  width?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
}

export function MobileRecordDrawer({
  open,
  onClose,
  title,
  subtitle,
  badge,
  badgeClassName,
  recordId,
  headerAction,
  hero,
  detailsTitle = "Details",
  details,
  sections = [],
  footer,
  width = "4xl",
}: MobileRecordDrawerProps) {
  const renderedSubtitle =
    badge || recordId ? (
      <div className="flex flex-wrap items-center gap-2">
        {badge && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
              badgeClassName ??
              "bg-primary-50 text-primary-700 ring-primary-200"
            }`}
          >
            {badge}
          </span>
        )}
        {recordId !== undefined && recordId !== null && recordId !== "" && (
          <span className="font-semibold text-slate-500">ID: {recordId}</span>
        )}
        {subtitle && <span className="text-slate-500">{subtitle}</span>}
      </div>
    ) : (
      subtitle
    );

  const detailRows = groupDetailRows(details);
  const HeroIcon = hero?.icon;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={renderedSubtitle}
      headerAction={headerAction}
      width={width}
      noPadding
    >
      <div className="space-y-6 p-4 sm:p-6">
        {hero && HeroIcon && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm">
            {hero.coverImage}
            <div className="flex items-start gap-4 p-5">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                  hero.iconClassName ?? "bg-primary-50 text-primary-600"
                }`}
              >
                <HeroIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {hero.overline}
                </p>
                <div
                  className={`mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl ${
                    hero.valueClassName ?? ""
                  }`}
                >
                  {hero.value}
                </div>
                {hero.meta && (
                  <p className="mt-1 text-sm text-slate-500">{hero.meta}</p>
                )}
              </div>
            </div>
            {hero.stats && hero.stats.length > 0 && (
              <div className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 bg-white/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {hero.stats.map((stat) => (
                  <div key={stat.label} className="px-5 py-3">
                    <p className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p
                      className={`mt-0.5 break-words text-sm font-semibold text-slate-800 ${
                        stat.valueClassName ?? ""
                      }`}
                    >
                      {formatDisplayValue(stat.value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {detailRows.length > 0 && (
          <section>
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              {detailsTitle}
            </h3>
            <RecordInformationCard>
              {detailRows.map((rowItems, index) => (
                <RecordInformationRow
                  key={rowItems.map((item) => item.label).join("-") || index}
                  items={rowItems}
                />
              ))}
            </RecordInformationCard>
          </section>
        )}

        {sections.map((section) => {
          const sectionRows = section.items
            ? groupDetailRows(section.items)
            : [];

          return (
            <section key={section.title}>
              <h3 className="mb-3 text-base font-semibold text-slate-900">
                {section.title}
              </h3>
              {section.content ? (
                section.content
              ) : (
                <RecordInformationCard>
                  {sectionRows.map((rowItems, index) => (
                    <RecordInformationRow
                      key={
                        rowItems.map((item) => item.label).join("-") || index
                      }
                      items={rowItems}
                    />
                  ))}
                </RecordInformationCard>
              )}
            </section>
          );
        })}

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            {footer}
          </div>
        )}
      </div>
    </Drawer>
  );
}
