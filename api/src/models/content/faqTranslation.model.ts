import mongoose, { Schema } from 'mongoose';
import { IFAQTranslation } from '@/types/content/faqTranslation.types';

const FAQTranslationSchema = new Schema<IFAQTranslation>(
  {
    faq_id: { type: Schema.Types.ObjectId, ref: 'FAQ', required: true },
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
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for performance
FAQTranslationSchema.index({ faq_id: 1, language_id: 1 }, { unique: true });

export default mongoose.model<IFAQTranslation>(
  'FAQTranslation',
  FAQTranslationSchema
); 