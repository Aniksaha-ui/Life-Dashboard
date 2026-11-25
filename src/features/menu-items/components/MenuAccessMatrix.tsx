import {
  Check,
  CheckSquare,
  RotateCcw,
  Save,
  ShieldCheck,
  Square,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { EmptyState } from "../../../components/EmptyState";
import {
  SelectDropdown,
  type SelectDropdownOption,
} from "../../../components/SelectDropdown";
import { MENU_ICON_MAP } from "../constants/menuOptions";
import type { FixedMenuRoute, MenuItemRow, MenuUserOption } from "../types";
import {
  getDirectPathsForUser,
  getPathsForRole,
  groupRoutesByLocation,
} from "../utils/menuItemMapper";

interface MenuAccessMatrixProps {
  mode: "user" | "role";
  routes: FixedMenuRoute[];
  allRows: MenuItemRow[];
  users: MenuUserOption[];
  roles: string[];
  isLoading: boolean;
  onSaveUserMenus: (userId: number, paths: string[]) => Promise<void>;
  onSaveRoleMenus: (role: string, paths: string[]) => Promise<void>;
}

const setsEqual = (first: Set<string>, second: Set<string>): boolean => {
  if (first.size !== second.size) return false;
  for (const item of first) {
    if (!second.has(item)) return false;
  }

  return true;
};

export function MenuAccessMatrix({
  mode,
  routes,
  allRows,
  users,
  roles,
  isLoading,
  onSaveUserMenus,
  onSaveRoleMenus,
}: MenuAccessMatrixProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [draftPaths, setDraftPaths] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Pick the first user or role automatically once options arrive.
  useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(String(users[0].id));
    }
  }, [users, selectedUserId]);

  useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  const userDropdownOptions = useMemo<SelectDropdownOption[]>(
    () =>
      users.map((user) => ({
        value: String(user.id),
        label: user.name,
        description: user.email || undefined,
        badge: user.role || undefined,
        icon: UserIcon,
      })),
    [users],
  );

  const roleDropdownOptions = useMemo<SelectDropdownOption[]>(
    () =>
      roles.map((role) => ({
        value: role,
        label: role,
        icon: ShieldCheck,
      })),
    [roles],
  );

  const activeUser = useMemo(
    () => users.find((user) => String(user.id) === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const savedPaths = useMemo(() => {
    if (mode === "user") {
      return activeUser
        ? getDirectPathsForUser(allRows, activeUser.id)
        : new Set<string>();
    }

    return selectedRole
      ? getPathsForRole(allRows, selectedRole)
      : new Set<string>();
  }, [mode, activeUser, selectedRole, allRows]);

  // Routes the selected user already inherits through their assigned role.
  const inheritedPaths = useMemo(() => {
    if (mode !== "user" || !activeUser?.role) return new Set<string>();

    return getPathsForRole(allRows, activeUser.role);
  }, [mode, activeUser, allRows]);

  useEffect(() => {
    setDraftPaths(new Set(savedPaths));
  }, [savedPaths]);

  const groupedRoutes = useMemo(() => groupRoutesByLocation(routes), [routes]);
  const isDirty = !setsEqual(draftPaths, savedPaths);

  const togglePath = (path: string) => {
    setDraftPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);

      return next;
    });
  };

  const toggleGroup = (groupRoutes: FixedMenuRoute[]) => {
    const allChecked = groupRoutes.every((route) => draftPaths.has(route.path));
    setDraftPaths((current) => {
      const next = new Set(current);
      for (const route of groupRoutes) {
        if (allChecked) next.delete(route.path);
        else next.add(route.path);
      }

      return next;
    });
  };

  const selectAll = () =>
    setDraftPaths(new Set(routes.map((route) => route.path)));

  const clearAll = () => setDraftPaths(new Set());

  const handleSave = async () => {
    setSaving(true);
    try {
      const paths = Array.from(draftPaths);
      if (mode === "user" && activeUser) {
        await onSaveUserMenus(activeUser.id, paths);
      } else if (mode === "role" && selectedRole) {
        await onSaveRoleMenus(selectedRole, paths);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save menu permissions.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && routes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading menu routes...
      </div>
    );
  }

  if (mode === "user" && users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          title="No users found"
          subtitle="Users from the users table will appear here once available."
        />
      </div>
    );
  }

  if (mode === "role" && roles.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <EmptyState
          title="No roles available"
          subtitle="Add a role to users or menu rules to manage role-wise menus."
        />
      </div>
    );
  }

  const effectiveCount =
    mode === "user"
      ? new Set([...draftPaths, ...inheritedPaths]).size
      : draftPaths.size;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {mode === "user" ? (
              <SelectDropdown
                label="Select User"
                value={selectedUserId}
                options={userDropdownOptions}
                onChange={setSelectedUserId}
                placeholder="Choose a user"
                searchable
                searchPlaceholder="Search by name or email..."
                className="w-full sm:max-w-sm"
              />
            ) : (
              <SelectDropdown
                label="Select Role"
                value={selectedRole}
                options={roleDropdownOptions}
                onChange={setSelectedRole}
                placeholder="Choose a role"
                searchable={roleDropdownOptions.length > 5}
                searchPlaceholder="Search roles..."
                className="w-full sm:max-w-xs"
              />
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-primary-50 px-2.5 py-1 font-semibold text-primary-700">
                {draftPaths.size} / {routes.length} selected
              </span>
              {mode === "user" && activeUser?.role && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                  Role: {activeUser.role} ({effectiveCount} effective)
                </span>
              )}
              {isDirty && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <CheckSquare className="h-4 w-4" />
              All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Square className="h-4 w-4" />
              Clear
            </button>
            {isDirty && (
              <button
                type="button"
                onClick={() => setDraftPaths(new Set(savedPaths))}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!isDirty || saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Access"}
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {groupedRoutes.map(([location, groupRoutes]) => {
          const checkedInGroup = groupRoutes.filter((route) =>
            draftPaths.has(route.path),
          ).length;
          const allGroupChecked = checkedInGroup === groupRoutes.length;

          return (
            <section
              key={location}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    {location}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {checkedInGroup}/{groupRoutes.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleGroup(groupRoutes)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  {allGroupChecked ? "Unselect group" : "Select group"}
                </button>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {groupRoutes.map((route) => {
                  const isChecked = draftPaths.has(route.path);
                  const isInherited =
                    mode === "user" && inheritedPaths.has(route.path);
                  const Icon = MENU_ICON_MAP[route.icon];

                  return (
                    <button
                      key={route.path}
                      type="button"
                      onClick={() => togglePath(route.path)}
                      aria-pressed={isChecked}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                        isChecked
                          ? "border-primary-500 bg-primary-50/50 ring-1 ring-primary-500/20"
                          : isInherited
                            ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {Icon && (
                            <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                          )}
                          <span className="truncate text-sm font-semibold text-slate-900">
                            {route.title}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                            {route.path}
                          </code>
                          {isInherited && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Via role: {activeUser?.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
