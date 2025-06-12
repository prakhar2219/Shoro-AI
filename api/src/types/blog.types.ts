export interface BlogInput {
  title: string;
  slug: string;
  mainImage: string;
  content: string;
  keywords?: string[];
  excerpt?: string;
  author?: string;
  categories?: string[];
  published: boolean;
  publishedAt?: Date;
}
