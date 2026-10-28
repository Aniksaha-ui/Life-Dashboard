import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api/client";
import { DataTable } from "../../components/DataTable";
import { FilterBar, ClearAllFiltersButton } from "../../components/FilterBar";
import type { FilterConfig } from "../../components/FilterBar";
import type { ColumnDef } from "@tanstack/react-table";
import type { MerchantUser } from "../../data/mock/types";
import { ArrowLeft, Plus } from "lucide-react";
import { clsx } from "clsx";
import { MerchantUserDrawer } from "./MerchantUserDrawer";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { CopyButton } from "../../components/CopyButton";

export default function MerchantUsersPage() {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<MerchantUser | null>(null);

  // Management States
  const [selectedForAction, setSelectedForAction] =
    useState<MerchantUser | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { data: merchant } = useQuery({
    queryKey: ["merchant", merchantId],
    queryFn: () => api.merchants.get(merchantId!),
  });

  const { data: users } = useQuery({
    queryKey: ["merchant-users", merchantId],
    queryFn: () => api.merchants.getUsers(merchantId!),
  });

  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const handleFilterChange = (key: string, value: any) => {
    setSearchParams((prev) => {
      if (value && value !== "all") {
        prev.set(key, value as string);
      } else {
        prev.delete(key);
      }
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      if (
        filters.loginId &&
        !user.loginId.toLowerCase().includes(filters.loginId.toLowerCase())
      )
        return false;
      if (
        filters.firstName &&
        !user.firstName.toLowerCase().includes(filters.firstName.toLowerCase())
      )
        return false;
      if (
        filters.email &&
        !user.email.toLowerCase().includes(filters.email.toLowerCase())
      )
        return false;
      if (
        filters.status &&
        filters.status !== "all" &&
        user.status !== filters.status
      )
        return false;
      return true;
    });
  }, [users, filters]);

  const filterConfig: FilterConfig[] = [
    { key: "loginId", type: "input", label: "Login ID" },
    { key: "firstName", type: "input", label: "User Name" },
    { key: "email", type: "input", label: "Email" },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: [
        { label: "Select one", value: "all" },
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
  ];

  const handleAddUser = () => {
    navigate(`/merchants/users/${merchantId}/new`);
  };

  const handleEditUser = (user: MerchantUser) => {
    navigate(`/merchants/users/${merchantId}/${user.loginId}/edit`);
  };

  const handleResetPassword = (user: MerchantUser) => {
    setSelectedForAction(user);
    setIsResetModalOpen(true);
  };

  const columns: ColumnDef<MerchantUser>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-slate-500">{row.index + 1}</span>
      ),
      size: 50,
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col py-0.5">
          <div className="font-medium text-slate-900 leading-tight">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-[11px] text-slate-500 font-normal font-mono flex items-center gap-1">
            {row.original.loginId}
            <CopyButton value={row.original.loginId} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={clsx(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            row.original.status === "Active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600",
          )}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "view",
      header: "Details",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedUser(row.original)}
          className="text-primary-600 hover:text-primary-700 font-medium text-xs"
        >
          Details
        </button>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleEditUser(row.original)}
            className="text-primary-600 hover:text-primary-700 font-medium text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => handleResetPassword(row.original)}
            className="text-primary-600 hover:text-primary-700 font-medium text-xs"
          >
            Reset Password
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/merchants")}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Users of {merchant?.name || "the Merchant"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {merchant?.storeId} • {merchant?.sector}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/10"
          >
            <Plus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            config={filterConfig}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <ClearAllFiltersButton
            onClick={handleClearFilters}
            filters={filters}
          />
        </div>

        {/* Table Section */}
        <div>
          <DataTable
            columns={columns}
            data={filteredUsers}
            hideToolbarDateFilter
            filterActions={
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  Merchant's User List
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                  {filteredUsers.length}
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Merchant User Details Drawer */}
      <MerchantUserDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        user={selectedForAction}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
