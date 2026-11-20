export interface ServiceApiItem {
  id: string | number;
  title: string;
  description: string;
  icon: string;
  image_url?: string | null;
  price: string;
  status: number | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ServiceFormValues {
  title: string;
  description: string;
  icon: string;
  image_url: string;
  price: string;
  status: number;
}
