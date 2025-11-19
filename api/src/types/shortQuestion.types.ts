// server/types/shortQuestion.types.ts
import { Document, Types } from "mongoose";

export interface IShortQuestionTranslation {
  _id?: Types.ObjectId;
  language_id: Types.ObjectId | string;
  question: string;
  answer: string;
  explanation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IShortQuestion extends Document {
  entity_type: string;
  entity_id: Types.ObjectId | string;
  supported_language_ids?: Types.ObjectId[] | string[];
  question: string;
  answer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  content?: string;
  is_active?: boolean;
  translations?: IShortQuestionTranslation[];
  created_by?: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}
