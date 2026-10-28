export interface CategoryApiItem {
  id: string | number;
  name?: string;
  slug?: string;
  type?: string;
  is_default?: boolean | number | string;
  is_active?: boolean | number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryRow {
  id: string | number;
  serial: number;
  name: string;
  slug: string;
  type: "EXPENSE" | "INCOME";
  typeLabel: string;
  isDefault: boolean;
  statusLabel: "Active" | "Inactive" | "N/A";
  updatedAtLabel: string;
}

export interface CategoryFormValues {
  name: string;
  type: "EXPENSE" | "INCOME";
}
