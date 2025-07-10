import mongoose, { Schema } from 'mongoose';
import { ICountry } from '@/types/content/country.types';

const CountrySchema = new Schema<ICountry>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    default_language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    supported_language_ids: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
  },
  { timestamps: true }
);

export default mongoose.model<ICountry>('Country', CountrySchema);
