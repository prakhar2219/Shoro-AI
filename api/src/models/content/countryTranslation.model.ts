import mongoose, { Schema } from 'mongoose';
import { ICountryTranslation } from '@/types/content/countryTranslation.types';

const CountryTranslationSchema = new Schema<ICountryTranslation>(
  {
    country_id: { type: String, required: true },
    language_code: { type: String, required: true },
    name: { type: String, required: true },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: String },
    content: { type: [Schema.Types.Mixed], required: true } as any,
  },
  { timestamps: true }
);

export default mongoose.model<ICountryTranslation>(
  'CountryTranslation',
  CountryTranslationSchema
);
