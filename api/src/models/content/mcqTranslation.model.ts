import mongoose, { Schema } from 'mongoose';
import { IMCQTranslation } from '@/types/content/mcqTranslation.types';

const MCQTranslationSchema = new Schema<IMCQTranslation>(
  {
    mcq_id: { type: Schema.Types.ObjectId, ref: 'MCQ', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    question: { type: String, required: true },
    options: [
      {
        key: { type: String, required: true }, // Must match original keys
        text: { type: String, required: true }
      }
    ],
    correct_answer: { type: String, required: true }, // Must match original
    explanation: { type: String },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for performance
MCQTranslationSchema.index({ mcq_id: 1, language_id: 1 }, { unique: true });

export default mongoose.model<IMCQTranslation>(
  'MCQTranslation',
  MCQTranslationSchema
); 