export interface Publication {
  id: string | number;
  title: string;
  abstract: string;
  authors: string;
  publication_date: string;
  publisher: string;
  doi: string;
  url: string;
  pdf_url: string;
  status: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type PublicationValues = Omit<Publication, "id" | "created_at" | "updated_at">;
