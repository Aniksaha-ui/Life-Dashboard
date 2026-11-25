export interface FixedMenuRoute {
  path: string;
  title: string;
  location: string;
  icon: string;
  order: number;
}

export interface MenuUserOption {
  id: number;
  name: string;
  email?: string | null;
  role?: string | null;
}

export interface MenuOptionsResponse {
  routes: FixedMenuRoute[];
  users: MenuUserOption[];
  roles: string[];
}

export interface MenuItemApiItem {
  id: number;
  user_id?: number | null;
  user_name?: string | null;
  user_email?: string | null;
  title?: string;
  path?: string | null;
  icon?: string | null;
  location?: string | null;
  parent_id?: number | null;
  order?: number | null;
  roles?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemRow {
  id: number;
  serial: number;
  userId: number | null;
  userName: string;
  title: string;
  path: string;
  icon: string;
  location: string;
  parentId: number | null;
  parentLabel: string;
  order: number;
  roles: string[];
  updatedAtLabel: string;
}

/** Raw form state. Every field stays a string so inputs remain controlled. */
export interface MenuItemFormValues {
  path: string;
  title: string;
  icon: string;
  location: string;
  parentId: string;
  order: string;
  roles: string;
  userId: string;
}

/** Request payload sent to the menu items API (title is enforced server-side). */
export interface MenuItemPayload {
  path: string;
  icon: string | null;
  location: string;
  parent_id: number | null;
  order: number;
  roles: string[];
  user_id: number | null;
}

export type MenuManagementTab = "user" | "role" | "rules";
