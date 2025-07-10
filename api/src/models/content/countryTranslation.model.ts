import mongoose, { Schema } from 'mongoose';
import { ICountryTranslation } from '@/types/content/countryTranslation.types';

const CountryTranslationSchema = new Schema<ICountryTranslation>(
  {
    country_id: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    name: { type: String, required: true },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ICountryTranslation>(
  'CountryTranslation',
  CountryTranslationSchema
);
