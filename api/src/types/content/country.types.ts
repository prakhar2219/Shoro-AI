export interface ICountry {
  name: string;
  code: string; // e.g., 'IN'
  default_language_code: string;
  supported_language_codes: string[];
  content: string;
}
