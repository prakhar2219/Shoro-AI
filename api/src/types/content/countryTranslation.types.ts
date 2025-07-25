export interface ICountryTranslation {
  country_id: string;
  language_code: string;
  name: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
