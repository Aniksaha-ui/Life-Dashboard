import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  getMenuOptions,
  MenuApiError,
  syncRoleMenuAccess,
  syncUserMenuAccess,
  updateMenuItem,
} from "../api/queries";
import { DEFAULT_MENU_ROLES } from "../constants/menuOptions";
import type {
  FixedMenuRoute,
  MenuItemApiItem,
  MenuItemFormValues,
  MenuUserOption,
} from "../types";
import { formValuesToPayload, mapMenuItems } from "../utils/menuItemMapper";

export const FILTER_ALL = "all";

export function useMenuItems() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<MenuItemApiItem[]>([]);
  const [fixedRoutes, setFixedRoutes] = useState<FixedMenuRoute[]>([]);
  const [users, setUsers] = useState<MenuUserOption[]>([]);
  const [optionRoles, setOptionRoles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState(FILTER_ALL);
  const [userFilter, setUserFilter] = useState(FILTER_ALL);
  const [roleFilter, setRoleFilter] = useState(FILTER_ALL);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsForbidden(false);
    try {
      const [menuItems, options] = await Promise.all([
        getMenuItems(),
        getMenuOptions(),
      ]);
      setItems(menuItems);
      setFixedRoutes(options.routes);
      setUsers(options.users);
      setOptionRoles(options.roles);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load menu items.";
      const forbidden = error instanceof MenuApiError && error.status === 403;
      setIsForbidden(forbidden);
      setErrorMessage(message);
      if (!forbidden) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const allRows = useMemo(
    () => mapMenuItems(items, users, fixedRoutes),
    [items, users, fixedRoutes],
  );

  const locations = useMemo(
    () =>
      Array.from(
        new Set([
          ...fixedRoutes.map((route) => route.location),
          ...allRows.map((row) => row.location),
        ]),
      ).sort(),
    [fixedRoutes, allRows],
  );

  const availableRoles = useMemo(() => {
    const roleSet = new Set<string>([...DEFAULT_MENU_ROLES, ...optionRoles]);
    for (const row of allRows) {
      for (const role of row.roles) roleSet.add(role);
    }
    for (const user of users) {
      if (user.role) roleSet.add(user.role);
    }

    return Array.from(roleSet).sort();
  }, [allRows, optionRoles, users]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return allRows
      .filter(
        (row) =>
          locationFilter === FILTER_ALL || row.location === locationFilter,
      )
      .filter(
        (row) => userFilter === FILTER_ALL || String(row.userId) === userFilter,
      )
      .filter(
        (row) => roleFilter === FILTER_ALL || row.roles.includes(roleFilter),
      )
      .filter((row) =>
        `${row.id} ${row.title} ${row.path} ${row.icon} ${row.location} ${row.parentLabel} ${row.userName} ${row.roles.join(" ")}`
          .toLowerCase()
          .includes(term),
      )
      .map((row, index) => ({ ...row, serial: index + 1 }));
  }, [allRows, search, locationFilter, userFilter, roleFilter]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    locationFilter !== FILTER_ALL ||
    userFilter !== FILTER_ALL ||
    roleFilter !== FILTER_ALL;

  const resetFilters = useCallback(() => {
    setSearch("");
    setLocationFilter(FILTER_ALL);
    setUserFilter(FILTER_ALL);
    setRoleFilter(FILTER_ALL);
  }, []);

  const metrics = useMemo(
    () => ({
      fixedRoutes: fixedRoutes.length,
      totalRules: allRows.length,
      users: users.length,
      roles: availableRoles.length,
    }),
    [fixedRoutes, allRows, users, availableRoles],
  );

  /** The sidebar reads its links from this query, so keep it in sync. */
  const syncSidebar = () =>
    queryClient.invalidateQueries({ queryKey: ["menu-permissions"] });

  const save = async (values: MenuItemFormValues, id?: number) => {
    const payload = formValuesToPayload(values, fixedRoutes);

    if (id) await updateMenuItem(id, payload);
    else await createMenuItem(payload);

    toast.success(
      id
        ? "Menu rule updated successfully."
        : "Menu rule created successfully.",
    );
    await Promise.all([refresh(), syncSidebar()]);
  };

  const remove = async (id: number) => {
    await deleteMenuItem(id);
    toast.success("Menu rule deleted successfully.");
    await Promise.all([refresh(), syncSidebar()]);
  };

  const saveUserMenus = async (userId: number, paths: string[]) => {
    await syncUserMenuAccess(userId, paths);
    toast.success("User menu access saved successfully.");
    await Promise.all([refresh(), syncSidebar()]);
  };

  const saveRoleMenus = async (role: string, paths: string[]) => {
    await syncRoleMenuAccess(role, paths);
    toast.success(`Menu access saved for role "${role}".`);
    await Promise.all([refresh(), syncSidebar()]);
  };

  return {
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
  };
}
