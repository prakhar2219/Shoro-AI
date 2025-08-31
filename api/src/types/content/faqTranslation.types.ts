import { Schema } from 'mongoose';

export interface IFAQTranslation {
  faq_id: Schema.Types.ObjectId;
  language_id: Schema.Types.ObjectId;
  question: string;
  answer: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: Schema.Types.ObjectId;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
} 