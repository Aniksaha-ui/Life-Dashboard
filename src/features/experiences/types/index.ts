export interface ExperienceApiItem {
  id: string | number;
  job_title: string;
  company: string;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
  is_current: string | boolean | number;
  image_url?: string | null;
  status: number | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ExperienceFormValues {
  job_title: string;
  company: string;
  location: string;
  description: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  image_url: string;
  status: number;
}

export interface ExperiencePayload extends Omit<ExperienceFormValues, "is_current"> {
  is_current: string;
}
