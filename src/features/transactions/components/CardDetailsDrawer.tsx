import { clsx } from "clsx";
import { CreditCard, Globe, Landmark, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { Drawer } from "../../../components/Drawer";
import { useCardBinInfo } from "../api/queries";
import type { CardDetailsDrawerProps } from "../types";

const SectionHeader = ({ title }: { title: string }) => (
  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">
    {title}
  </h4>
);

const BinDetailItem = ({
  icon: Icon,
  label,
  value,
  colorClass = "text-slate-600",
}: {
  icon: any;
  label: string;
  value: string;
  colorClass?: string;
}) => (
  <div className="flex flex-col gap-0.5 px-3 py-1.5 border-r border-slate-100 last:border-0 min-w-27.5">
    <div className="flex items-center gap-1.5 text-slate-400">
      <Icon className="w-3 h-3" />
      <span className="text-[9px] font-bold uppercase tracking-tight">
        {label}
      </span>
    </div>
    <span
      className={clsx("text-[11px] font-semibold truncate", colorClass)}
      title={value}
    >
      {value}
    </span>
  </div>
);

export function CardDetailsDrawer({
  maskedCard,
  onClose,
  onShowLogs,
}: CardDetailsDrawerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const { data: response, isLoading } = useCardBinInfo(
    maskedCard,
    currentPage,
    perPage,
  );
  const binInfo = response?.bin_info;
  const customerDetails = response?.customer_details;
  const pagination = response?.pagination;

  useEffect(() => {
    setCurrentPage(1);
  }, [maskedCard]);

  const rows = useMemo(() => {
    return (customerDetails?.transactions || []).map((item) => ({
      serial: item.serial || 0,
      tid: item.tid || 0,
      id: item.transaction_id || item.mtxnid || String(item.tid),
      date: item.date || "-",
      time: item.time || "-",
      storeName: item.store_id || "-",
      customerName:
        item.customer_name || customerDetails?.customer?.name || "-",
      customerEmail:
        item.customer_email || customerDetails?.customer?.email || "-",
      customerMobile:
        item.customer_phone || customerDetails?.customer?.phone || "-",
      bankName: item.gateway_name || "-",
      bankTxnId: item.banksslid || "-",
      cardholderName: item.cardholder_name || "-",
      ipAddress: item.ip || "",
      amount: Number(item.amount || 0),
      currency: "BDT",
      status: item.status || "-",
      statusDisplay: item.status_display || item.status || "-",
    }));
  }, [customerDetails]);

  const columns = [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }: any) => (
        <span className="text-xs text-slate-400">
          {row.original.serial || row.index + 1}
        </span>
      ),
      size: 40,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => (
        <div className="text-xs text-slate-600 font-medium">
          <span>{row.original.date}</span>
          <span className="text-slate-400 ml-1">{row.original.time}</span>
        </div>
      ),
    },
    {
      accessorKey: "store",
      header: "Store",
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-0.5 max-w-45">
          <span className="text-xs font-bold text-slate-900 truncate">
            {row.original.storeName}
          </span>
          <span className="text-[10px] text-slate-500 truncate">
            {row.original.customerName}
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            {row.original.customerEmail}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.original.customerMobile}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "gateway",
      header: "Gateway",
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-slate-700">
            {row.original.bankName}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {row.original.bankTxnId}
          </span>
          <span className="text-[10px] text-slate-500 italic">
            {row.original.cardholderName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
      cell: ({ row }: any) =>
        row.original.ipAddress ? (
          <button
            onClick={() =>
              onShowLogs(
                row.original.tid || 0,
                row.original.id,
                row.original.ipAddress,
              )
            }
            className="flex items-center gap-1 text-[11px] font-mono text-primary-600 hover:text-primary-700 hover:underline"
          >
            <MapPin className="w-3 h-3" />
            {row.original.ipAddress}
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">-</span>
        ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }: any) => (
        <div className="text-xs font-bold text-slate-900 whitespace-nowrap text-right tabular-nums">
          {row.original.currency} {row.original.amount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <span
          className={clsx(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
            row.original.status.toLowerCase().includes("success")
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-rose-50 text-rose-700 border-rose-100",
          )}
          title={row.original.statusDisplay}
        >
          {row.original.statusDisplay}
        </span>
      ),
    },
  ];

  return (
    <Drawer
      open={!!maskedCard}
      onClose={onClose}
      title="Card BIN Details"
      subtitle={maskedCard ? `| ${maskedCard}` : ""}
      width="xl"
    >
      <div className="pb-6 bg-slate-50/30 -mx-6 -my-6 p-4 space-y-4">
        <SectionHeader title="BIN Information" />

        {isLoading ? (
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse skeleton-bg h-16" />
        ) : response ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-wrap divide-x divide-slate-100 overflow-hidden">
            <BinDetailItem
              icon={CreditCard}
              label="BIN"
              value={binInfo?.bin || "-"}
            />
            <BinDetailItem
              icon={Globe}
              label="Brand"
              value={binInfo?.brand || "-"}
            />
            <BinDetailItem
              icon={Globe}
              label="Country"
              value={binInfo?.country_name || binInfo?.country_code || "-"}
            />
            <BinDetailItem
              icon={Landmark}
              label="Bank"
              value={binInfo?.bank || "-"}
            />
            <BinDetailItem
              icon={CreditCard}
              label="Card Type"
              value={binInfo?.card_type || "-"}
            />
            <BinDetailItem
              icon={ShieldCheck}
              label="Category"
              value={binInfo?.card_category || "-"}
            />
            <BinDetailItem
              icon={ShieldCheck}
              label="Status"
              value={binInfo?.status || "-"}
              colorClass={
                binInfo?.status?.toLowerCase() === "ok"
                  ? "text-emerald-600"
                  : "text-amber-600"
              }
            />
          </div>
        ) : null}

        <div className="space-y-4">
          <SectionHeader title="Transactions" />
          <div className="overflow-hidden">
            <DataTable
              columns={columns}
              data={rows}
              hideToolbarDateFilter={true}
              hideViewColumn={true}
              externalPagination={{
                currentPage: pagination?.current_page || currentPage,
                totalPages: pagination?.last_page || 1,
                total:
                  pagination?.total ||
                  customerDetails?.total_transactions ||
                  rows.length,
                from: pagination?.from ?? (rows.length ? 1 : 0),
                to: pagination?.to ?? rows.length,
              }}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}
