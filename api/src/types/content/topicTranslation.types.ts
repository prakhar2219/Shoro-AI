export interface ITopicTranslation {
  topic_id: string;
  language_id: string;
  title: string;
  slug: string;
  content?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}
