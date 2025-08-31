import mongoose, { Schema } from 'mongoose';
import { IClassTranslation } from '@/types/content/classTranslation.types';

const ClassTranslationSchema = new Schema<IClassTranslation>(
  {
    class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    name: { type: String, required: true },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IClassTranslation>(
  'ClassTranslation',
  ClassTranslationSchema
);
