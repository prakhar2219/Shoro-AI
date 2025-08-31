import mongoose, { Schema } from 'mongoose';
import { IBoard } from '@/types/content/board.types';

const BoardSchema = new Schema<IBoard>(
  {
    name: { type: String, required: true },
    short_code: { type: String, required: true, unique: true },
    country_id: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    default_language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    supported_language_ids: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
    description: { type: String },
    logo_url: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
BoardSchema.virtual('translation');
BoardSchema.virtual('translations');

export default mongoose.model<IBoard>('Board', BoardSchema);
