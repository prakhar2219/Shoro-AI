import mongoose, { Schema } from 'mongoose';
import { IBoardTranslation } from '@/types/content/boardTranslation.types';

const BoardTranslationSchema = new Schema<IBoardTranslation>(
  {
    board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBoardTranslation>(
  'BoardTranslation',
  BoardTranslationSchema
);
