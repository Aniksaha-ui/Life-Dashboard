export interface TestimonialApiItem {
  id: string | number;
  name: string;
  designation: string;
  feedback: string;
  rating: string;
  image_url?: string | null;
  status: number | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TestimonialFormValues {
  name: string;
  designation: string;
  feedback: string;
  rating: string;
  image_url: string;
  status: number;
}
