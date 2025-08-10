import { Schema } from 'mongoose';

export interface IMCQTranslationOption {
  key: string; // Must match original keys
  text: string;
}

export interface IMCQTranslation {
  mcq_id: Schema.Types.ObjectId;
  language_id: Schema.Types.ObjectId;
  question: string;
  options: IMCQTranslationOption[];
  correct_answer: string; // Must match original
  explanation?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: Schema.Types.ObjectId;
  content: any[];
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
} 