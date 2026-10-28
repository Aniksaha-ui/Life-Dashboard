export interface CategoryApiItem {
  id: string | number;
  name?: string;
  slug?: string;
  type?: string;
  is_default?: boolean | number | string;
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
  updatedAtLabel: string;
}

export interface CategoryFormValues {
  name: string;
  type: "EXPENSE" | "INCOME";
}
