import { Schema } from "mongoose";

export interface ISubjectTranslation {
  subject_id: Schema.Types.ObjectId;
  language_id: Schema.Types.ObjectId;
  name: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}
