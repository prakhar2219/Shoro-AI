import mongoose, { Schema } from 'mongoose';
import { IDescriptiveQuestionTranslation } from '@/types/content/descriptiveQuestionTranslation.types';

const DescriptiveQuestionTranslationSchema = new Schema<IDescriptiveQuestionTranslation>(
  {
    descriptive_question_id: { type: Schema.Types.ObjectId, ref: 'DescriptiveQuestion', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: [Schema.Types.Mixed], required: true } as any,
  },
  { timestamps: true }
);

// Indexes for performance
DescriptiveQuestionTranslationSchema.index({ descriptive_question_id: 1, language_id: 1 }, { unique: true });

export default mongoose.model<IDescriptiveQuestionTranslation>(
  'DescriptiveQuestionTranslation',
  DescriptiveQuestionTranslationSchema
); 