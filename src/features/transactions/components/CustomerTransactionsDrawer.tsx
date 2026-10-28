import { clsx } from "clsx";
import { User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../components/DataTable";
import { Drawer } from "../../../components/Drawer";
import { useCustomerTransactionsByTid } from "../api/queries";
import type { CustomerTransactionsDrawerProps } from "../types";
import { Loader } from "../../../components/Loader";

export function CustomerTransactionsDrawer({
  tid,
  onClose,
}: CustomerTransactionsDrawerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const { data: response, isLoading } = useCustomerTransactionsByTid(
    tid,
    currentPage,
    perPage,
  );
  const data = response?.transactions || [];
  const customer = response?.customer;
  const pagination = response?.pagination;

  useEffect(() => {
    setCurrentPage(1);
  }, [tid]);

  const rows = useMemo(() => {
    return data.map((item) => ({
      serial: item.serial || 0,
      tid: item.tid,
      date: item.date || "-",
      time: item.time || "-",
      customerId: item.track_cust_id || response?.track_cust_id || "-",
      storeName: item.store_id || "-",
      customerName: item.customer_name || customer?.name || "-",
      customerEmail: item.customer_email || customer?.email || "",
      customerPhone: item.customer_phone || customer?.phone || "",
      bankName: item.gateway_name || "-",
      bankTxnId: item.banksslid || "-",
      cardNo: item.card_no || "-",
      cardholderName: item.cardholder_name || "-",
      issuerBank: item.issuer_bank || "-",
      issuerCountry: item.issuer_country || "-",
      issuerCardBinType: item.issuer_card_bin_type || "",
      issuerCardBrand: item.issuer_card_brand || "",
      ipAddress: item.ip || "",
      ipCity: item.ip_city || "",
      ipCountry: item.ip_country || "",
      amount: Number(item.amount || 0),
      currency: "BDT",
      status: item.status || "-",
      statusDisplay: item.status_display || "-",
    }));
  }, [
    customer?.email,
    customer?.name,
    customer?.phone,
    data,
    response?.track_cust_id,
  ]);

  const columns = [
    {
      accessorKey: "serial",
      header: "#",
      cell: ({ row }: any) => (
        <span className="text-xs text-slate-400 font-medium">
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
      accessorKey: "customerId",
      header: "Cust. ID",
      cell: ({ row }: any) => (
        <span className="text-xs font-bold text-slate-800">
          {row.original.customerId}
        </span>
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
          {row.original.customerEmail && (
            <span
              className="text-[10px] text-slate-400 truncate"
              title={row.original.customerEmail}
            >
              {row.original.customerEmail}
            </span>
          )}
          <span className="text-[10px] text-slate-400">
            {row.original.customerPhone}
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
      accessorKey: "card",
      header: "Card No/Ref",
      cell: ({ row }: any) => (
        <div className="space-y-0.5 max-w-56">
          <div className="text-[10px] font-mono text-slate-500 truncate">
            {row.original.cardNo}
          </div>
          <div className="text-[10px] text-slate-600 truncate">
            {row.original.issuerBank}
          </div>
          <div className="text-[10px] text-slate-600 font-bold truncate">
            {row.original.issuerCountry}
          </div>
          <div className="text-[10px] text-slate-600">
            {row.original.issuerCardBinType
              ? `${row.original.issuerCardBinType} - `
              : ""}
            <span className="font-bold">
              {row.original.issuerCardBrand || "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
      cell: ({ row }: any) =>
        row.original.ipAddress ? (
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-slate-500">
              {row.original.ipAddress}
            </span>
            <div className="text-[9px] text-slate-400 font-bold">
              {row.original.ipCity && row.original.ipCountry
                ? `${row.original.ipCity}, ${row.original.ipCountry}`
                : row.original.ipCountry || row.original.ipCity || ""}
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">-</span>
        ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }: any) => (
        <div className="text-xs font-bold text-slate-900 whitespace-nowrap text-right tabular-nums">
          {row.original.currency}{" "}
          {row.original.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
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
      open={!!tid}
      onClose={onClose}
      title="Customer Transactions"
      width="xl"
    >
      <div className="pb-6 bg-slate-50/30 -mx-6 -my-6 p-4 space-y-4 min-h-80">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader size="md" />
            <p className="text-slate-500 text-sm animate-pulse">
              Fetching customer history...
            </p>
          </div>
        ) : !response ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold">No data found</h3>
            <p className="text-slate-500 text-sm max-w-xs mt-1">
              We couldn't find any transaction history for this customer.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                    response.total_transactions ||
                    rows.length,
                  from: pagination?.from ?? (rows.length ? 1 : 0),
                  to: pagination?.to ?? rows.length,
                }}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
