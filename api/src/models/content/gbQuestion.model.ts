import mongoose, { Schema } from 'mongoose';
import { IGBQuestion } from '../../types/content/gbQuestion.types';

const GBQuestionSchema = new Schema<IGBQuestion>(
  {
    gb_subtopic_id: { type: Schema.Types.ObjectId, ref: 'GBSubtopic', required: true },
    question: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    answer: { type: String, required: false },
    content: { type: String, required: false },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    supported_language_ids: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
    order: { type: Number, required: true, default: 0 },
    image: { type: String, trim: true },
    tag: [{ type: String, trim: true }],
    source: { type: String, trim: true },
    author: { type: String, trim: true },
    difficulty_level: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'], 
      default: 'medium' 
    },
    is_published: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
GBQuestionSchema.virtual('translation');
GBQuestionSchema.virtual('translations');

// Allow duplicate slugs: removed unique index on slug within GB subtopic

// Compound unique index: order must be unique within each GB subtopic
GBQuestionSchema.index({ gb_subtopic_id: 1, order: 1 }, { unique: true });

export default mongoose.model<IGBQuestion>('GBQuestion', GBQuestionSchema);
