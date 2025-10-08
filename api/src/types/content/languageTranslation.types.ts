import { Schema } from "mongoose";

export interface ILanguageTranslation {
  language_id: Schema.Types.ObjectId;
  translated_language_id: Schema.Types.ObjectId;
  name: string;
  native_name?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
