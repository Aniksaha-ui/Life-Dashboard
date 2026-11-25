import type {
  FixedMenuRoute,
  MenuItemApiItem,
  MenuItemFormValues,
  MenuItemPayload,
  MenuItemRow,
  MenuUserOption,
} from "../types";

export const EMPTY_FORM_VALUES: MenuItemFormValues = {
  path: "",
  title: "",
  icon: "",
  location: "Money",
  parentId: "",
  order: "0",
  roles: "",
  userId: "",
};

const NOT_AVAILABLE = "-";

const formatDate = (value?: string): string => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return NOT_AVAILABLE;

  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");

  return `${day} ${time}`;
};

export const parseRoles = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean),
    ),
  );

export const toggleRoleInList = (rolesText: string, role: string): string => {
  const current = parseRoles(rolesText);
  const exists = current.includes(role);
  const next = exists
    ? current.filter((item) => item !== role)
    : [...current, role];

  return next.join(", ");
};

export const getDescendantIds = (
  rows: MenuItemRow[],
  rootId: number,
): Set<number> => {
  const descendants = new Set<number>();
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    for (const row of rows) {
      if (row.parentId === currentId && !descendants.has(row.id)) {
        descendants.add(row.id);
        queue.push(row.id);
      }
    }
  }

  return descendants;
};

export const findFixedRoute = (
  routes: FixedMenuRoute[],
  path: string,
): FixedMenuRoute | undefined => routes.find((route) => route.path === path);

export const groupRoutesByLocation = (
  routes: FixedMenuRoute[],
): Array<[string, FixedMenuRoute[]]> => {
  const groups = new Map<string, FixedMenuRoute[]>();

  for (const route of routes) {
    const key = route.location || "Other";
    const list = groups.get(key) ?? [];
    list.push(route);
    groups.set(key, list);
  }

  return Array.from(groups.entries());
};

export const getDirectPathsForUser = (
  items: MenuItemRow[],
  userId: number,
  validPaths?: Set<string>,
): Set<string> =>
  new Set(
    items
      .filter(
        (item) =>
          item.userId === userId &&
          item.path !== NOT_AVAILABLE &&
          (!validPaths || validPaths.has(item.path)),
      )
      .map((item) => item.path),
  );

export const getPathsForRole = (
  items: MenuItemRow[],
  role: string,
  validPaths?: Set<string>,
): Set<string> =>
  new Set(
    items
      .filter(
        (item) =>
          item.roles.includes(role) &&
          item.path !== NOT_AVAILABLE &&
          (!validPaths || validPaths.has(item.path)),
      )
      .map((item) => item.path),
  );

export const mapMenuItems = (
  items: MenuItemApiItem[],
  users: MenuUserOption[] = [],
  routes: FixedMenuRoute[] = [],
): MenuItemRow[] => {
  const titleById = new Map(items.map((item) => [item.id, item.title]));
  const userNameById = new Map(users.map((user) => [user.id, user.name]));
  const routeByPath = new Map(routes.map((route) => [route.path, route]));

  return items.map((item, index) => {
    const fixedRoute = item.path ? routeByPath.get(item.path) : undefined;

    return {
      id: item.id,
      serial: index + 1,
      userId: item.user_id ?? null,
      userName: item.user_id
        ? item.user_name || userNameById.get(item.user_id) || `#${item.user_id}`
        : NOT_AVAILABLE,
      title: fixedRoute?.title || item.title || NOT_AVAILABLE,
      path: item.path || NOT_AVAILABLE,
      icon: item.icon || fixedRoute?.icon || NOT_AVAILABLE,
      location: item.location || fixedRoute?.location || "main",
      parentId: item.parent_id ?? null,
      parentLabel: item.parent_id
        ? (titleById.get(item.parent_id) ?? `#${item.parent_id}`)
        : NOT_AVAILABLE,
      order: Number(item.order ?? fixedRoute?.order ?? 0),
      roles: Array.isArray(item.roles) ? item.roles : [],
      updatedAtLabel: formatDate(item.updated_at || item.created_at),
    };
  });
};

export const rowToFormValues = (
  row: MenuItemRow,
  routes: FixedMenuRoute[],
): MenuItemFormValues => {
  const path = row.path === NOT_AVAILABLE ? "" : row.path;
  const fixedRoute = findFixedRoute(routes, path);

  return {
    path: fixedRoute ? fixedRoute.path : "",
    title: fixedRoute
      ? fixedRoute.title
      : row.title === NOT_AVAILABLE
        ? ""
        : row.title,
    icon: row.icon === NOT_AVAILABLE ? (fixedRoute?.icon ?? "") : row.icon,
    location: fixedRoute?.location || row.location,
    parentId: row.parentId ? String(row.parentId) : "",
    order: String(row.order),
    roles: row.roles.join(", "),
    userId: row.userId !== null ? String(row.userId) : "",
  };
};

export const formValuesToPayload = (
  values: MenuItemFormValues,
  routes: FixedMenuRoute[],
): MenuItemPayload => {
  const fixedRoute = findFixedRoute(routes, values.path);

  return {
    path: values.path.trim(),
    icon: values.icon.trim() || fixedRoute?.icon || null,
    location: values.location.trim() || fixedRoute?.location || "main",
    parent_id: values.parentId ? Number(values.parentId) : null,
    order: Math.max(0, Number(values.order) || 0),
    roles: parseRoles(values.roles),
    user_id: values.userId.trim() ? Number(values.userId.trim()) : null,
  };
};
