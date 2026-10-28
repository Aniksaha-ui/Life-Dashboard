import type { RouteObject } from "react-router-dom";

const hiddenRoutes = new Set<string>([]);

function normalizePath(path: string): string {
  if (!path) {
    return "";
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function buildRoutePath(parentPath: string, routePath?: string): string {
  if (!routePath) {
    return parentPath;
  }

  if (routePath.startsWith("/")) {
    return normalizePath(routePath);
  }

  if (!parentPath || parentPath === "/") {
    return normalizePath(`/${routePath}`);
  }

  return normalizePath(`${parentPath}/${routePath}`);
}

export function isRouteHidden(path: string): boolean {
  return hiddenRoutes.has(normalizePath(path));
}

export function filterHiddenRoutes(
  routes: RouteObject[],
  parentPath = "",
): RouteObject[] {
  return routes.reduce<RouteObject[]>((result, route) => {
    const currentPath = route.index
      ? parentPath
      : buildRoutePath(parentPath, route.path);

    if (route.path && isRouteHidden(currentPath)) {
      return result;
    }

    const children = route.children
      ? filterHiddenRoutes(route.children, currentPath)
      : undefined;
    const nextRoute = children ? { ...route, children } : route;

    if (
      route.children &&
      children?.length === 0 &&
      !("element" in route) &&
      !route.index &&
      !route.path
    ) {
      return result;
    }

    result.push(nextRoute as RouteObject);
    return result;
  }, []);
}

type NavNode = {
  to?: string;
  children?: NavNode[];
};

export function filterHiddenNavItems<T extends NavNode>(items: T[]): T[] {
  return items.reduce<T[]>((result, item) => {
    const filteredChildren = item.children
      ? filterHiddenNavItems(item.children as T[])
      : undefined;
    const shouldHide = item.to ? isRouteHidden(item.to) : false;

    if (shouldHide && (!filteredChildren || filteredChildren.length === 0)) {
      return result;
    }

    result.push({
      ...item,
      ...(filteredChildren ? { children: filteredChildren } : {}),
    });

    return result;
  }, []);
}
