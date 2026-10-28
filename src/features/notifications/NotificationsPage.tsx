import { useState, useMemo } from "react";
import { Bell, Check, Calendar, Clock, Ticket, FileText } from "lucide-react";
import { clsx } from "clsx";
import { CopyButton } from "../../components/CopyButton";
import { useNotificationList, useMarkNotificationRead } from "./api/queries";
import { mapApiNotificationToModel } from "./utils/notificationMappers";
import type { NotificationModel } from "./types";
import { format } from "date-fns";
import { Loader } from "../../components/Loader";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useNotificationList(page);
  const markReadMutation = useMarkNotificationRead();

  const notifications = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map(mapApiNotificationToModel);
  }, [data]);

  const markAllAsRead = async () => {
    const hasUnread = notifications.some((n) => !n.isRead);
    if (!hasUnread) return;

    try {
      await markReadMutation.mutateAsync("all");
      refetch();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = async (notification: NotificationModel) => {
    if (notification.isRead) return;

    try {
      await markReadMutation.mutateAsync(notification.id);
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Notification
          </h1>
          <p className="text-slate-500 text-sm">
            Stay updated with the latest activity across your account.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={notifications.every((n) => n.isRead)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-primary-100"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No notifications found.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={clsx(
                "relative overflow-hidden border rounded-xl shadow-sm transition-all cursor-pointer group hover:shadow-md",
                notification.isRead
                  ? "bg-white border-slate-200"
                  : "bg-primary-50/40 border-primary-200 ring-1 ring-primary-50",
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={clsx(
                        "mt-1 p-2 rounded-lg shrink-0",
                        notification.type === "ticket"
                          ? "bg-amber-50 text-amber-600"
                          : notification.type === "campaign"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-50 text-slate-600",
                      )}
                    >
                      {notification.type === "ticket" ? (
                        <Ticket className="w-5 h-5" />
                      ) : notification.type === "campaign" ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={clsx(
                            "text-base font-bold truncate",
                            notification.isRead
                              ? "text-slate-800"
                              : "text-slate-900",
                          )}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0"></span>
                        )}
                      </div>

                      <div className="mt-4">
                        {notification.details?.changedBy ? (
                          <p className="text-sm text-slate-600 leading-relaxed italic">
                            Campaign Poc Updated for AB Bank PLC changed by{" "}
                            <span className="font-semibold text-slate-900">
                              {notification.details.changedBy}
                            </span>
                          </p>
                        ) : notification.details?.ticketNo ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                            <DetailItem
                              label="Ticket No"
                              value={notification.details.ticketNo}
                            />
                            <DetailItem
                              label="Merchant ID / MSSID"
                              value={notification.details.merchantId}
                            />
                            <DetailItem
                              label="Store ID"
                              value={notification.details.storeId}
                            />
                            <DetailItem
                              label="Transaction ID"
                              value={notification.details.transactionId}
                            />
                            <DetailItem
                              label="Bank SSL ID"
                              value={notification.details.bankSslId}
                            />
                          </div>
                        ) : (
                          <div
                            className="text-sm text-slate-600 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: notification.content,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {notification.createdAt
                        ? format(
                            new Date(notification.createdAt),
                            "MMMM d, yyyy",
                          )
                        : "-"}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {notification.createdAt
                        ? format(new Date(notification.createdAt), "h:mm a")
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {data?.pagination && data.pagination.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from(
            { length: data.pagination.last_page },
            (_, i) => i + 1,
          ).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={clsx(
                "px-3 py-1 rounded-md text-sm transition-colors",
                page === p
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  const displayValue = value || "undefined";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
        {label}
      </span>
      <div className="flex items-center gap-2 group/copy">
        <span className="text-sm font-medium text-slate-700 break-all">
          {displayValue}
        </span>
        {value && (
          <CopyButton
            value={value}
            className="opacity-0 group-hover/copy:opacity-100 transition-opacity"
          />
        )}
      </div>
    </div>
  );
}
