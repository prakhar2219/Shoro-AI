import mongoose, { Schema } from 'mongoose';
import { ILanguage } from '@/types/content/language.types';


const LanguageSchema = new Schema<ILanguage>(
    {
        code: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        native_name: { type: String, required: true },
        direction: { type: String, enum: ['ltr', 'rtl'], default: 'ltr' },
        locale: { type: String },
        script: { type: String },
        ai_supported: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<ILanguage>('Language', LanguageSchema);