export interface BlogApiItem {
  id: string | number;
  title: string;
  content: string;
  short_description: string;
  category?: string;
  fa_icon: string;
  view_count?: number | string;
  author_name: string;
  published_date?: string | null;
  isPublished?: boolean | number | string;
  image?: string | null;
  components_json?: BlogComponent[] | string | null;
}

export type BlogComponentType = "header" | "subheader" | "paragraph" | "image" | "quote" | "code" | "highlight" | "footer";

export interface BlogComponent {
  id: string;
  type: BlogComponentType;
  content: string;
  settings: { alignment?: "left" | "center" | "right"; color?: string; backgroundColor?: string; caption?: string };
}

export interface BlogFormValues {
  title: string;
  content: string;
  short_description: string;
  category: string;
  fa_icon: string;
  author_name: string;
  published_date: string;
  isPublished: boolean;
  image: string;
}

export interface BlogPayload extends BlogFormValues {
  components_json: string;
}

export interface BlogRow {
  id: string | number;
  serial: number;
  title: string;
  author: string;
  category: string;
  publishedDateLabel: string;
  isPublished: boolean;
  viewCount: number;
  blog: BlogApiItem;
}
