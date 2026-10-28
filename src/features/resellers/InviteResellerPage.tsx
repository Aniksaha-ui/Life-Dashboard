import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import {
  AlertCircle,
  Check,
  Download,
  History,
  Mail,
  Pencil,
  Phone,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { CopyButton } from "../../components/CopyButton";
import { Drawer } from "../../components/Drawer";
import { Modal } from "../../components/Modal";
import {
  FilterBar,
  ClearAllFiltersButton,
  type FilterConfig,
} from "../../components/FilterBar";
import { Tooltip as UITooltip } from "../../components/Tooltip";
import { api } from "../../lib/api/client";
import type { InviteReseller } from "./types/inviteReseller";
import { getInviteResellerStatusBadgeClass } from "./utils/inviteResellerStatus";
import { formatResellerDateTime } from "./utils/resellerDateFormat";
import {
  buildFilterSearchParams,
  matchesDateRange,
  parseUrlFilters,
} from "./utils/resellerListFilters";

const filterConfig: FilterConfig[] = [
  { key: "date", type: "date-range", label: "Date" },
  { key: "name", type: "input", label: "Company Name" },
  { key: "email", type: "input", label: "Email" },
  { key: "mobile", type: "input", label: "Mobile Number" },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "All Status", value: "all" },
      { label: "Created", value: "Created" },
      { label: "Invited", value: "Invited" },
      { label: "Follow up", value: "Follow up" },
      { label: "Onboarded", value: "Onboarded" },
    ],
  },
];

const emptyForm = { name: "", mobile: "", email: "" };

function getInviteLogVisual(action: string) {
  switch (action) {
    case "Invited":
      return {
        Icon: Mail,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
      };
    case "Follow up":
      return {
        Icon: Phone,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
      };
    case "Onboarded":
      return {
        Icon: Check,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      };
    case "Created":
      return {
        Icon: UserPlus,
        color: "text-slate-600 bg-slate-50 border-slate-100",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
      };
    default:
      return {
        Icon: History,
        color: "text-slate-600 bg-slate-50 border-slate-100",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-100",
      };
  }
}

export default function InviteResellerPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const [localFilters, setLocalFilters] =
    useState<Record<string, unknown>>(filters);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<InviteReseller | null>(null);
  const [inviteItem, setInviteItem] = useState<InviteReseller | null>(null);
  const [followUpItem, setFollowUpItem] = useState<InviteReseller | null>(null);
  const [deleteItem, setDeleteItem] = useState<InviteReseller | null>(null);
  const [logItem, setLogItem] = useState<InviteReseller | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: inviteResellers = [] } = useQuery({
    queryKey: ["invite-resellers-list"],
    queryFn: () => api.inviteResellers.list(),
  });

  useEffect(() => {
    if (!logItem) return;
    const latest = inviteResellers.find((item) => item.id === logItem.id);
    if (latest) setLogItem(latest);
    else setLogItem(null);
  }, [inviteResellers]);

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ["invite-resellers-list"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) =>
      api.inviteResellers.create(payload),
    onSuccess: () => {
      toast.success("Reseller invite added successfully");
      setIsAddOpen(false);
      setForm(emptyForm);
      invalidateList();
    },
    onError: () => toast.error("Failed to add reseller invite"),
  });

  const inviteMutation = useMutation({
    mutationFn: (id: string) => api.inviteResellers.invite(id),
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      setInviteItem(null);
      invalidateList();
    },
    onError: () => toast.error("Failed to send invitation"),
  });

  const followUpMutation = useMutation({
    mutationFn: (id: string) => api.inviteResellers.followUp(id),
    onSuccess: () => {
      toast.success("Follow up recorded successfully");
      setFollowUpItem(null);
      invalidateList();
    },
    onError: () => toast.error("Failed to record follow up"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name: string; mobile: string; email: string };
    }) => api.inviteResellers.update(id, updates),
    onSuccess: () => {
      toast.success("Reseller invite updated successfully");
      setEditItem(null);
      setForm(emptyForm);
      invalidateList();
    },
    onError: () => toast.error("Failed to update reseller invite"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.inviteResellers.delete(id),
    onSuccess: () => {
      toast.success("Reseller invite deleted successfully");
      setDeleteItem(null);
      invalidateList();
    },
    onError: () => toast.error("Failed to delete reseller invite"),
  });

  const handleFilterChange = (key: string, value: unknown) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setSearchParams(buildFilterSearchParams(localFilters));
  };

  const clearFilters = () => {
    setLocalFilters({});
    setSearchParams(new URLSearchParams());
  };

  const filteredData = useMemo(() => {
    const datePreset =
      typeof filters.date_preset === "string" ? filters.date_preset : undefined;
    const dateFrom =
      typeof filters.date_from === "string" ? filters.date_from : undefined;
    const dateTo =
      typeof filters.date_to === "string" ? filters.date_to : undefined;
    const name = typeof filters.name === "string" ? filters.name : undefined;
    const mobile =
      typeof filters.mobile === "string" ? filters.mobile : undefined;
    const email = typeof filters.email === "string" ? filters.email : undefined;
    const status =
      typeof filters.status === "string" ? filters.status : undefined;

    return inviteResellers.filter((item) => {
      if (!matchesDateRange(item.createdAt, datePreset, dateFrom, dateTo)) {
        return false;
      }

      const matchesName =
        !name || item.name.toLowerCase().includes(name.toLowerCase());
      const matchesMobile = !mobile || item.mobile.includes(mobile);
      const matchesEmail =
        !email || item.email.toLowerCase().includes(email.toLowerCase());
      const matchesStatus =
        !status || status === "all" || item.status === status;
      return matchesName && matchesMobile && matchesEmail && matchesStatus;
    });
  }, [inviteResellers, filters]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      "Company Name",
      "Company ID",
      "Email",
      "Mobile Number",
      "Status",
      "Follow Up Count",
    ];
    const rows = filteredData.map((item) => [
      item.name.replace(/,/g, ""),
      item.resellerId,
      item.email,
      item.mobile,
      item.status,
      String(item.followUpCount),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `invite_resellers_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setIsAddOpen(true);
  };

  const openEdit = (item: InviteReseller) => {
    setForm({
      name: item.name,
      mobile: item.mobile,
      email: item.email,
    });
    setEditItem(item);
  };

  const validateForm = (data = form) => {
    const newErrors: Partial<typeof emptyForm> = {};

    if (!data.name.trim()) {
      newErrors.name = "Company Name is required";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email Address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!data.mobile.trim()) {
      newErrors.mobile = "Mobile Number is required";
    } else {
      const mobileRegex = /^(?:\+88|88)?01[3-9]\d{8}$/;
      if (!mobileRegex.test(data.mobile.trim())) {
        newErrors.mobile =
          "Please enter a valid mobile number (e.g. 01XXXXXXXXX)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const columns = useMemo<ColumnDef<InviteReseller>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">{row.index + 1}</span>
        ),
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {row.original.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                {row.original.resellerId}
              </span>
              <CopyButton value={row.original.resellerId} />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "mobile",
        header: "Mobile Number",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">{row.original.mobile}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const { status, followUpCount } = row.original;
          return (
            <span
              className={`${getInviteResellerStatusBadgeClass(status)} inline-flex items-center gap-1.5`}
            >
              {status}
              {status === "Follow up" && followUpCount > 0 && (
                <span className="min-w-[14px] h-[14px] px-0.5 inline-flex items-center justify-center rounded-full bg-white/90 text-[9px] font-semibold leading-none text-inherit border border-slate-300/40">
                  {followUpCount}
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const { status } = row.original;
          const showInvite = status === "Created";
          const showFollowUp = status === "Invited" || status === "Follow up";

          const actionButtonClass = "flex flex-col items-center gap-0 group";
          const iconWrapClass =
            "pt-1.5 px-1.5 pb-0 hover:bg-slate-100 rounded text-slate-400 group-hover:text-primary-600 transition-colors";
          const labelClass =
            "text-[9px] font-medium text-slate-500 group-hover:text-primary-600 transition-colors";

          return (
            <div className="flex items-center gap-3 whitespace-nowrap">
              {showInvite && (
                <UITooltip content="Send Invite">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInviteItem(row.original);
                    }}
                    className={actionButtonClass}
                  >
                    <div className={iconWrapClass}>
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className={labelClass}>Invite</span>
                  </button>
                </UITooltip>
              )}
              {showFollowUp && (
                <UITooltip content="Follow Up">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFollowUpItem(row.original);
                    }}
                    className={actionButtonClass}
                  >
                    <div className={iconWrapClass}>
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className={labelClass}>Follow up</span>
                  </button>
                </UITooltip>
              )}
              <UITooltip content="Edit">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(row.original);
                  }}
                  className={actionButtonClass}
                >
                  <div className={iconWrapClass}>
                    <Pencil className="w-3.5 h-3.5" />
                  </div>
                  <span className={labelClass}>Edit</span>
                </button>
              </UITooltip>
              <UITooltip content="Delete">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteItem(row.original);
                  }}
                  className={actionButtonClass}
                >
                  <div className={iconWrapClass}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                  <span className={labelClass}>Delete</span>
                </button>
              </UITooltip>
              <UITooltip content="History">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogItem(row.original);
                  }}
                  className={actionButtonClass}
                >
                  <div className={iconWrapClass}>
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <span className={labelClass}>History</span>
                </button>
              </UITooltip>
            </div>
          );
        },
      },
    ],
    [],
  );

  const renderFormFields = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Company Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, name: e.target.value }));
            if (errors.name)
              setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all",
            errors.name
              ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
          )}
          placeholder="Enter company name"
        />
        {errors.name && (
          <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, email: e.target.value }));
            if (errors.email)
              setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all",
            errors.email
              ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
          )}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Mobile Number
        </label>
        <input
          type="text"
          value={form.mobile}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, mobile: e.target.value }));
            if (errors.mobile)
              setErrors((prev) => ({ ...prev, mobile: undefined }));
          }}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-all",
            errors.mobile
              ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 focus:ring-primary-500/20 focus:border-primary-500",
          )}
          placeholder="Enter mobile number"
        />
        {errors.mobile && (
          <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.mobile}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Invite Reseller</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            Add Reseller
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterBar
          filters={localFilters}
          onFilterChange={handleFilterChange}
          config={filterConfig}
        />

        <button
          type="button"
          onClick={applyFilters}
          disabled={JSON.stringify(localFilters) === JSON.stringify(filters)}
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm ml-2",
            JSON.stringify(localFilters) !== JSON.stringify(filters)
              ? "bg-primary-600 hover:bg-primary-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
          )}
        >
          Apply Filters
        </button>
        <ClearAllFiltersButton onClick={clearFilters} filters={localFilters} />
      </div>

      <div className="pt-6">
        <DataTable
          columns={columns}
          data={filteredData}
          mobileCard
          mobileCardTitleColumn={2}
          mobileCardHideFirstColumn
          hideToolbarDateFilter
          toolbarEndContent={
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
            >
              Export
              <Download className="w-4 h-4" />
            </button>
          }
          filterActions={
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 ml-1">
                Showing invite reseller data
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {filteredData.length}
              </span>
            </div>
          }
        />
      </div>

      <Drawer
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setForm(emptyForm);
          setErrors({});
        }}
        title="Add Reseller"
        width="md"
      >
        <div className="space-y-5">
          {renderFormFields()}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setForm(emptyForm);
                setErrors({});
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                if (validateForm()) {
                  createMutation.mutate(form);
                }
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Reseller
            </button>
          </div>
        </div>
      </Drawer>

      <Drawer
        open={!!editItem}
        onClose={() => {
          setEditItem(null);
          setForm(emptyForm);
          setErrors({});
        }}
        title="Edit Invite Reseller"
        width="md"
      >
        {editItem && (
          <div className="space-y-5">
            {renderFormFields()}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditItem(null);
                  setForm(emptyForm);
                  setErrors({});
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => {
                  if (validateForm() && editItem) {
                    updateMutation.mutate({
                      id: editItem.id,
                      updates: form,
                    });
                  }
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        isOpen={!!inviteItem}
        onClose={() => setInviteItem(null)}
        title="Send Invite"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setInviteItem(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!inviteItem || inviteMutation.isPending}
              onClick={() => inviteItem && inviteMutation.mutate(inviteItem.id)}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Invite
            </button>
          </>
        }
      >
        {inviteItem && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              Are you sure you want to send an invite to “{inviteItem.name}”?
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              N.B : An invitation will be sent to {inviteItem.email}.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!followUpItem}
        onClose={() => setFollowUpItem(null)}
        title="Follow Up"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFollowUpItem(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!followUpItem || followUpMutation.isPending}
              onClick={() =>
                followUpItem && followUpMutation.mutate(followUpItem.id)
              }
              className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Follow up
            </button>
          </>
        }
      >
        {followUpItem && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              Are you sure you want to record a follow up for “
              {followUpItem.name}”?
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              N.B : This will add a follow-up entry to the details log.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Invite"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteItem(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!deleteItem || deleteMutation.isPending}
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </>
        }
      >
        {deleteItem && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              Are you sure you want to delete the invite for “{deleteItem.name}
              ”?
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              N.B : This action cannot be undone.
            </p>
          </div>
        )}
      </Modal>

      <Drawer
        open={!!logItem}
        onClose={() => setLogItem(null)}
        title="History"
        subtitle={logItem?.name}
        width="lg"
      >
        {logItem && (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                <History className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Invite History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create, invite, and follow-up events for this reseller
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-6">
                {logItem.logs.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 pl-14">
                    No history events to display.
                  </p>
                ) : (
                  logItem.logs.map((log) => {
                    const { Icon, color, badgeClass } = getInviteLogVisual(
                      log.action,
                    );
                    const { datePart, timePart } = formatResellerDateTime(
                      log.performedAt,
                    );
                    return (
                      <div key={log.id} className="relative flex gap-4 pl-0">
                        <div
                          className={clsx(
                            "relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0",
                            color,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                              {datePart}
                              <span className="normal-case tracking-normal font-semibold text-[10px]">
                                {" "}
                                · {timePart}
                              </span>
                            </span>
                            <span
                              className={clsx(
                                "px-2 py-0.5 text-[10px] font-bold rounded-full border",
                                badgeClass,
                              )}
                            >
                              {log.action}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {log.action}
                          </p>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {log.remarks}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-2">
                            By{" "}
                            <span className="font-medium text-slate-500">
                              {log.performedBy}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
