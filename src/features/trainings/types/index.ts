export interface TrainingApiItem {
  id: string | number;
  title: string;
  provider: string;
  description: string;
  start_date: string;
  end_date: string;
  certificate_url: string;
  image_url: string;
  status: number | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TrainingFormValues {
  title: string;
  provider: string;
  description: string;
  start_date: string;
  end_date: string;
  certificate_url: string;
  status: number;
}
