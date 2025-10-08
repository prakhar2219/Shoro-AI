import mongoose, { Schema } from 'mongoose';
import { IMCQ } from '@/types/content/mcq.types';

const MCQSchema = new Schema<IMCQ>(
  {
    entity_type: { type: String, required: true }, // "Chapter" | "Topic" | "Subtopic" | "Country" | "Board" | "Class" | "Subject"
    entity_id: { type: Schema.Types.ObjectId, required: true },
    question: { type: String, required: true },
    options: [
      {
        key: { type: String, required: true }, // "A", "B", "C", "D"
        text: { type: String, required: true }
      }
    ],
    correct_answer: { type: String, required: true }, // "A", "B", "C", or "D"
    explanation: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    is_active: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: false },
  },
  { timestamps: true }
);

// Indexes for performance
MCQSchema.index({ entity_type: 1, entity_id: 1 });
MCQSchema.index({ tags: 1 });
MCQSchema.index({ difficulty: 1 });
MCQSchema.index({ is_active: 1 });

export default mongoose.model<IMCQ>('MCQ', MCQSchema); 