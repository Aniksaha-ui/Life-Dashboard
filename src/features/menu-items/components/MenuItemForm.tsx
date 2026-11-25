import { Lock, User as UserIcon } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "../../../components/Modal";
import {
  outlinedControlClass,
  OutlinedField,
} from "../../../components/OutlinedField";
import {
  SelectDropdown,
  type SelectDropdownOption,
} from "../../../components/SelectDropdown";
import { MENU_ICON_MAP } from "../constants/menuOptions";
import type {
  FixedMenuRoute,
  MenuItemFormValues,
  MenuItemRow,
  MenuUserOption,
} from "../types";
import {
  EMPTY_FORM_VALUES,
  findFixedRoute,
  getDescendantIds,
  parseRoles,
  rowToFormValues,
  toggleRoleInList,
} from "../utils/menuItemMapper";

interface MenuItemFormProps {
  menuItem: MenuItemRow | null;
  fixedRoutes: FixedMenuRoute[];
  parentOptions: MenuItemRow[];
  userOptions: MenuUserOption[];
  availableRoles: string[];
  open: boolean;
  onClose: () => void;
  onSave: (values: MenuItemFormValues, id?: number) => Promise<void>;
}

export function MenuItemForm({
  menuItem,
  fixedRoutes,
  parentOptions,
  userOptions,
  availableRoles,
  open,
  onClose,
  onSave,
}: MenuItemFormProps) {
  const [values, setValues] = useState<MenuItemFormValues>(EMPTY_FORM_VALUES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setValues(rowToFormValues(menuItem, fixedRoutes));
      return;
    }

    const firstRoute = fixedRoutes[0];
    setValues(
      firstRoute
        ? {
            ...EMPTY_FORM_VALUES,
            path: firstRoute.path,
            title: firstRoute.title,
            icon: firstRoute.icon,
            location: firstRoute.location,
            order: String(firstRoute.order),
          }
        : EMPTY_FORM_VALUES,
    );
  }, [menuItem, fixedRoutes, open]);

  const setField =
    (field: keyof MenuItemFormValues) =>
    (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleRouteChange = (nextPath: string) => {
    const matched = findFixedRoute(fixedRoutes, nextPath);
    setValues((current) => ({
      ...current,
      path: nextPath,
      title: matched?.title ?? "",
      icon: matched?.icon ?? current.icon,
      location: matched?.location ?? current.location,
      order: matched ? String(matched.order) : current.order,
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.path) {
      toast.error("Please select a menu route.");
      return;
    }
    setSaving(true);
    try {
      await onSave(values, menuItem?.id);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save menu rule.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Prevent selecting self or any descendant as parent.
  const selectableParents = useMemo(() => {
    if (!menuItem) return parentOptions;
    const blockedIds = getDescendantIds(parentOptions, menuItem.id);
    blockedIds.add(menuItem.id);

    return parentOptions.filter((option) => !blockedIds.has(option.id));
  }, [parentOptions, menuItem]);

  const routeDropdownOptions = useMemo<SelectDropdownOption[]>(
    () =>
      fixedRoutes.map((route) => ({
        value: route.path,
        label: route.title,
        description: route.path,
        group: route.location,
        icon: MENU_ICON_MAP[route.icon],
      })),
    [fixedRoutes],
  );

  const userDropdownOptions = useMemo<SelectDropdownOption[]>(() => {
    const base: SelectDropdownOption[] = [
      { value: "", label: "None (role-based)" },
      ...userOptions.map((user) => ({
        value: String(user.id),
        label: user.name,
        description: user.email || undefined,
        badge: user.role || undefined,
        icon: UserIcon,
      })),
    ];

    if (
      values.userId &&
      !userOptions.some((user) => String(user.id) === values.userId)
    ) {
      base.push({
        value: values.userId,
        label: menuItem?.userName || `User #${values.userId}`,
        icon: UserIcon,
      });
    }

    return base;
  }, [userOptions, values.userId, menuItem]);

  const parentDropdownOptions = useMemo<SelectDropdownOption[]>(
    () => [
      { value: "", label: "None (top level)" },
      ...selectableParents.map((option) => ({
        value: String(option.id),
        label: option.title,
        description: option.path,
        group: option.location,
        icon: MENU_ICON_MAP[option.icon],
      })),
    ],
    [selectableParents],
  );

  const selectedRoles = useMemo(
    () => new Set(parseRoles(values.roles)),
    [values.roles],
  );
  const PreviewIcon = MENU_ICON_MAP[values.icon.trim()];

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={menuItem ? "Edit Menu Rule" : "New Menu Rule"}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            form="menu-item-form"
            type="submit"
            disabled={saving || !values.path}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Rule"}
          </button>
        </>
      }
    >
      <form
        id="menu-item-form"
        onSubmit={submit}
        className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2"
      >
        <SelectDropdown
          label="Route (fixed)"
          value={values.path}
          options={routeDropdownOptions}
          onChange={handleRouteChange}
          placeholder="Select a fixed route"
          searchable
          searchPlaceholder="Search route or menu name..."
          className="sm:col-span-2"
        />

        <OutlinedField
          label="Menu Name (locked)"
          className="bg-slate-50 sm:col-span-2"
        >
          {PreviewIcon && (
            <PreviewIcon className="h-4 w-4 shrink-0 text-slate-500" />
          )}
          <input
            readOnly
            disabled
            value={values.title || "Select a route above"}
            className={`${outlinedControlClass} cursor-not-allowed text-slate-500`}
          />
          <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </OutlinedField>

        <OutlinedField label="Section / Location" className="bg-slate-50">
          <input
            readOnly
            disabled
            value={values.location}
            className={`${outlinedControlClass} cursor-not-allowed text-slate-500`}
          />
        </OutlinedField>

        <OutlinedField label="Order">
          <input
            type="number"
            min={0}
            value={values.order}
            onChange={setField("order")}
            className={outlinedControlClass}
          />
        </OutlinedField>

        <SelectDropdown
          label="User (optional)"
          value={values.userId}
          options={userDropdownOptions}
          onChange={(nextUserId) =>
            setValues((current) => ({ ...current, userId: nextUserId }))
          }
          placeholder="None (role-based)"
          searchable
          searchPlaceholder="Search users..."
        />

        <SelectDropdown
          label="Parent menu (optional)"
          value={values.parentId}
          options={parentDropdownOptions}
          onChange={(nextParentId) =>
            setValues((current) => ({ ...current, parentId: nextParentId }))
          }
          placeholder="None (top level)"
          searchable={parentDropdownOptions.length > 6}
          searchPlaceholder="Search parent menus..."
        />

        <OutlinedField label="Roles (optional)" className="sm:col-span-2">
          <input
            value={values.roles}
            onChange={setField("roles")}
            className={outlinedControlClass}
            placeholder="admin, users"
          />
        </OutlinedField>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">
              Quick toggle roles:
            </span>
            {availableRoles.map((role) => {
              const active = selectedRoles.has(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      roles: toggleRoleInList(current.roles, role),
                    }))
                  }
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {active ? `✓ ${role}` : `+ ${role}`}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            Routes and menu names are fixed by the application. Assign this
            route to a specific user, one or more roles, or both.
          </p>
        </div>
      </form>
    </Modal>
  );
}
