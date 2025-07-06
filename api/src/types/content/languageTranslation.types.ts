export interface ILanguageTranslation {
    language_id: string;
    translated_language_id: string;
    name: string;
    native_name?: string;
    translated_by_ai?: boolean;
    needs_review?: boolean;
    updated_by?: string;
    createdAt?: Date;
    updatedAt?: Date;
} 