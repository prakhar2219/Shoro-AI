import mongoose, { Schema } from "mongoose";
import { ILanguageTranslation } from "@/types/content/languageTranslation.types";

const LanguageTranslationSchema = new Schema<ILanguageTranslation>(
    {
        language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
        translated_language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
        name: { type: String, required: true },
        native_name: { type: String },
        translated_by_ai: { type: Boolean, default: false },
        needs_review: { type: Boolean, default: false },
        updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<ILanguageTranslation>('LanguageTranslation', LanguageTranslationSchema); 