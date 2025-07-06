export interface ICountryTranslation {
    country_id: string;
    language_id: string;
    name: string;
    translated_by_ai?: boolean;
    needs_review?: boolean;
    updated_by?: string;
    createdAt?: Date;
    updatedAt?: Date;
} 