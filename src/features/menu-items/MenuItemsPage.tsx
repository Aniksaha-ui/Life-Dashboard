import {
  ListTree,
  Plus,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { MetricCard } from "../../components/MetricCard";
import { SearchField } from "../../components/SearchField";
import {
  SelectDropdown,
  type SelectDropdownOption,
} from "../../components/SelectDropdown";
import { DeleteMenuItemModal } from "./components/DeleteMenuItemModal";
import { MenuAccessMatrix } from "./components/MenuAccessMatrix";
import { MenuItemForm } from "./components/MenuItemForm";
import { MenuItemTable } from "./components/MenuItemTable";
import { FILTER_ALL, useMenuItems } from "./hooks/useMenuItems";
import type { MenuItemRow, MenuManagementTab } from "./types";

const tabs: Array<{
  id: MenuManagementTab;
  label: string;
  icon: typeof Users;
}> = [
  { id: "user", label: "User-wise Menus", icon: Users },
  { id: "role", label: "Role-wise Menus", icon: ShieldCheck },
  { id: "rules", label: "All Menu Rules", icon: ListTree },
];

export default function MenuItemsPage() {
  const {
    rows,
    allRows,
    fixedRoutes,
    users,
    locations,
    availableRoles,
    metrics,
    search,
    setSearch,
    locationFilter,
    setLocationFilter,
    userFilter,
    setUserFilter,
    roleFilter,
    setRoleFilter,
    hasActiveFilters,
    resetFilters,
    isLoading,
    errorMessage,
    isForbidden,
    refresh,
    save,
    remove,
    saveUserMenus,
    saveRoleMenus,
  } = useMenuItems();

  const [activeTab, setActiveTab] = useState<MenuManagementTab>("user");
  const [editingItem, setEditingItem] = useState<MenuItemRow | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItemRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: MenuItemRow) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const locationFilters = [
    [FILTER_ALL, "All Sections"],
    ...locations.map((location) => [location, location] as const),
  ];

  const userFilterOptions = useMemo<SelectDropdownOption[]>(
    () => [
      { value: FILTER_ALL, label: "All Users" },
      ...users.map((user) => ({
        value: String(user.id),
        label: user.name,
        description: user.email || undefined,
        icon: UserIcon,
      })),
    ],
    [users],
  );

  const roleFilterOptions = useMemo<SelectDropdownOption[]>(
    () => [
      { value: FILTER_ALL, label: "All Roles" },
      ...availableRoles.map((role) => ({
        value: role,
        label: role,
        icon: ShieldCheck,
      })),
    ],
    [availableRoles],
  );

  return (
    <div className="app-management-page menu-items-page space-y-6">
      <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Menu Access &amp; Items
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign fixed application routes per user or per role, or manage
            individual menu rules.
          </p>
        </div>
        {!isForbidden && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="app-page-primary-action inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              New Menu Rule
            </button>
          </div>
        )}
      </div>

      {isForbidden ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            Menu Manager Access Required
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
            {errorMessage ||
              "You do not have permission to manage navigation menu items."}
          </p>
        </section>
      ) : (
        <>
          <div className="app-metrics-grid overview-scroll grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Fixed Routes"
              value={metrics.fixedRoutes}
              isLoading={isLoading}
              className="border-blue-100"
            />
            <MetricCard
              title="Configured Rules"
              value={metrics.totalRules}
              isLoading={isLoading}
              className="border-emerald-100"
            />
            <MetricCard
              title="Users"
              value={metrics.users}
              isLoading={isLoading}
              className="border-amber-100"
            />
            <MetricCard
              title="Roles"
              value={metrics.roles}
              isLoading={isLoading}
              className="border-cyan-100"
            />
          </div>

          <div
            role="tablist"
            aria-label="Menu management views"
            className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
                    active
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "user" || activeTab === "role" ? (
            <MenuAccessMatrix
              mode={activeTab}
              routes={fixedRoutes}
              allRows={allRows}
              users={users}
              roles={availableRoles}
              isLoading={isLoading}
              onSaveUserMenus={saveUserMenus}
              onSaveRoleMenus={saveRoleMenus}
            />
          ) : (
            <>
              <section className="app-filter-panel space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {locationFilters.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLocationFilter(value)}
                      className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                        locationFilter === value
                          ? "bg-primary-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search route, user, role"
                    className="w-full"
                  />
                  <SelectDropdown
                    label="Filter by User"
                    value={userFilter}
                    options={userFilterOptions}
                    onChange={setUserFilter}
                    searchable={userFilterOptions.length > 5}
                    searchPlaceholder="Search users..."
                  />
                  <SelectDropdown
                    label="Filter by Role"
                    value={roleFilter}
                    options={roleFilterOptions}
                    onChange={setRoleFilter}
                    searchable={roleFilterOptions.length > 5}
                    searchPlaceholder="Search roles..."
                  />
                  <div className="flex items-center justify-end gap-2">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"
                      >
                        <X className="h-4 w-4" />
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <MenuItemTable
                rows={rows}
                isLoading={isLoading}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
                onEdit={openEdit}
                onDelete={setDeletingItem}
              />
            </>
          )}

          <MenuItemForm
            menuItem={editingItem}
            fixedRoutes={fixedRoutes}
            parentOptions={allRows}
            userOptions={users}
            availableRoles={availableRoles}
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={save}
          />
          <DeleteMenuItemModal
            menuItem={deletingItem}
            onClose={() => setDeletingItem(null)}
            onConfirm={remove}
          />
        </>
      )}
    </div>
  );
}
