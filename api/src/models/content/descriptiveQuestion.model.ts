import mongoose, { Schema } from 'mongoose';
import { IDescriptiveQuestion } from '@/types/content/descriptiveQuestion.types';

const DescriptiveQuestionSchema = new Schema<IDescriptiveQuestion>(
  {
    entity_type: { type: String, required: true }, // "Chapter" | "Topic" | "Subtopic" | "Country" | "Board" | "Class" | "Subject"
    entity_id: { type: Schema.Types.ObjectId, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    is_active: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: false },
    author: { type: String, trim: true },
    source: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for performance
DescriptiveQuestionSchema.index({ entity_type: 1, entity_id: 1 });
DescriptiveQuestionSchema.index({ tags: 1 });
DescriptiveQuestionSchema.index({ difficulty: 1 });
DescriptiveQuestionSchema.index({ is_active: 1 });

export default mongoose.model<IDescriptiveQuestion>('DescriptiveQuestion', DescriptiveQuestionSchema); 