import mongoose, { Schema } from 'mongoose';
import { IFAQ } from '@/types/content/faq.types';

const FAQSchema = new Schema<IFAQ>(
  {
    entity_type: { type: String, required: true }, // "Chapter" | "Topic" | "Subtopic" | "Country" | "Board" | "Class" | "Subject"
    entity_id: { type: Schema.Types.ObjectId, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String },
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: false },
  },
  { timestamps: true }
);

// Indexes for performance
FAQSchema.index({ entity_type: 1, entity_id: 1 });
FAQSchema.index({ category: 1 });
FAQSchema.index({ order: 1 });
FAQSchema.index({ is_active: 1 });

export default mongoose.model<IFAQ>('FAQ', FAQSchema); 