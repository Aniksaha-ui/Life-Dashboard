import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { DataTable } from "../../components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkItem } from "../../data/mock/types";
import {
  BadgeCheck,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { Drawer } from "../../components/Drawer";
import { useState } from "react";
import {
  User,
  Calendar,
  CheckSquare,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const columns: ColumnDef<WorkItem>[] = [
  {
    accessorKey: "title",
    header: "Item",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-slate-900">{row.original.title}</div>
        <div className="text-xs text-slate-500">{row.original.subtitle}</div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
        {row.original.type.replace("_", " ")}
      </span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const sev = row.original.severity;
      return (
        <span
          className={clsx(
            "flex items-center gap-1.5 text-xs font-medium",
            sev === "high"
              ? "text-rose-600"
              : sev === "medium"
                ? "text-amber-600"
                : "text-slate-500",
          )}
        >
          {sev === "high" && <AlertCircle className="w-3.5 h-3.5" />}
          {sev === "medium" && <AlertTriangle className="w-3.5 h-3.5" />}
          {sev === "low" && <CheckCircle className="w-3.5 h-3.5" />}
          <span className="capitalize">{sev}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "w-2 h-2 rounded-full",
            row.original.status === "open"
              ? "bg-blue-500"
              : row.original.status === "in_progress"
                ? "bg-amber-500"
                : row.original.status === "done"
                  ? "bg-emerald-500"
                  : "bg-slate-500",
          )}
        ></span>
        <span className="capitalize text-slate-700">
          {row.original.status.replace("_", " ")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due",
    cell: ({ row }) => (
      <div
        className={clsx(
          "flex items-center gap-1.5 text-slate-600",
          new Date(row.original.dueDate) < new Date()
            ? "text-rose-600 font-medium"
            : "",
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        {new Date(row.original.dueDate).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "ownerId",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-slate-500">
        {row.original.ownerId === "user_1" ? "You" : row.original.ownerId}
      </span>
    ),
  },
];

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState("needs_attention");
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const location = useLocation();

  // function WorkPage already defined above, but we had a duplicated block in previous edit.
  // Removing duplication by deleting the repeated block start.
  // This is cleanup of lines 86-91 which restart the function inside the function.

  // Determine if this is Team Queue
  const isTeamQueue = location.pathname.includes("/team");
  // Determine if Saved Views
  const isSavedViews = location.pathname.includes("/views");

  const { data: work, isLoading } = useQuery({
    queryKey: ["work-list"],
    queryFn: api.work.list,
  });

  const filteredData =
    work?.filter((item) => {
      if (activeTab === "needs_attention")
        return item.severity === "high" || item.severity === "medium";
      if (activeTab === "due_today") {
        const today = new Date().toDateString();
        return new Date(item.dueDate).toDateString() === today;
      }
      if (activeTab === "overdue")
        return new Date(item.dueDate) < new Date() && item.status !== "done";
      return true; // All
    }) || [];

  if (isLoading) return <div className="p-8">Loading queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isTeamQueue
              ? "Team Queue"
              : isSavedViews
                ? "Saved Views"
                : "My Queue"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isTeamQueue
              ? "Manage tasks across your team."
              : "Manage tasks, investigations and approvals."}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary">Saved Views</button>
          <button className="btn-primary">Create Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        {["Needs Attention", "Due Today", "Overdue", "All"].map((tab) => {
          const key = tab.toLowerCase().replace(" ", "_");
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                "py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === key
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Filter Row (Mock) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-200">
          Type: All <BadgeCheck className="w-3 h-3" />
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-200">
          Assigned to: {isTeamQueue ? "All" : "Me"}{" "}
          <BadgeCheck className="w-3 h-3" />
        </span>
        <span className="px-3 py-1 rounded-full bg-white border border-dashed border-slate-300 text-xs font-medium text-slate-500 flex items-center gap-1 cursor-pointer hover:border-slate-400">
          + Add filter
        </span>
      </div>

      {isSavedViews ? (
        <div className="text-center py-12 bg-slate-50 rounded border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No saved views yet.</p>
          <button className="btn-secondary mt-4">Create New View</button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => setSelectedItem(row)}
          filterColumnName="title"
        />
      )}

      <Drawer
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title}
        subtitle={selectedItem?.subtitle}
        width="lg"
      >
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Status
              </p>
              <p className="font-medium text-slate-900 capitalize mt-1">
                {selectedItem?.status.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Due Date
              </p>
              <p className="font-medium text-slate-900 mt-1">
                {selectedItem && new Date(selectedItem.dueDate).toDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Priority
              </p>
              <p className="font-medium text-slate-900 capitalize mt-1 text-rose-600">
                {selectedItem?.severity}
              </p>
            </div>
          </div>

          {/* Actions */}
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 grid grid-cols-4 gap-2 mb-2">
              <button className="flex flex-col items-center justify-center p-3 rounded bg-white border border-slate-200 hover:bg-slate-50 gap-1 text-slate-600">
                <User className="w-4 h-4" />
                <span className="text-[10px]">Assign</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded bg-white border border-slate-200 hover:bg-slate-50 gap-1 text-slate-600">
                <CheckSquare className="w-4 h-4" />
                <span className="text-[10px]">Status</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded bg-white border border-slate-200 hover:bg-slate-50 gap-1 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px]">Due Date</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded bg-white border border-slate-200 hover:bg-slate-50 gap-1 text-slate-600">
                <FileText className="w-4 h-4" />
                <span className="text-[10px]">Note</span>
              </button>
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              Create Investigation <ArrowUpRight className="w-4 h-4" />
            </button>
            <button className="btn-secondary w-full">Mark as Done</button>
          </div>

          {/* Activity Timeline Stub */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 block">
              Activity
            </h4>
            <div className="pl-3 border-l-2 border-slate-200 space-y-6">
              <div className="relative">
                <div className="absolute -left-[19px] top-1 w-3 h-3 bg-slate-200 rounded-full border-2 border-white"></div>
                <p className="text-sm text-slate-900">
                  Task created automatically
                </p>
                <p className="text-xs text-slate-500">2 days ago by System</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[19px] top-1 w-3 h-3 bg-blue-200 rounded-full border-2 border-white"></div>
                <p className="text-sm text-slate-900">Assigned to You</p>
                <p className="text-xs text-slate-500">1 day ago by Manager</p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
