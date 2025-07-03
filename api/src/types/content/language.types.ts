import { Document } from "mongoose";

export interface ILanguage extends Document {
    code: string; // e.g., 'en'
    name: string; // English
    native_name: string; // English or हिंदी
    direction: 'ltr' | 'rtl';
    locale?: string;
    script?: string;
    ai_supported: boolean;
}