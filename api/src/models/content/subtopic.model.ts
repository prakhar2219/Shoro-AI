import mongoose, { Schema } from 'mongoose';
import { ISubtopic } from '@/types/content/subtopic.types';

const SubtopicSchema = new Schema<ISubtopic>(
  {
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    supported_language_ids: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, required: true },
    is_published: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: false },
    tag: [{ type: String, trim: true }],
    source: { type: String, trim: true },
    author: { type: String, trim: true },
    flashcards: { type: Boolean, default: false },
    mock_test: { type: Boolean, default: false },
    total_questions: { type: Number },
    total_time: { type: Number },
    pass_questions: { type: Number },
  },
  { timestamps: true }
);

SubtopicSchema.virtual('translation');
SubtopicSchema.virtual('translations');

// Compound unique index: order must be unique within each topic and language
SubtopicSchema.index({ topic_id: 1, language_id: 1, order: 1 }, { unique: true });

export default mongoose.model<ISubtopic>('Subtopic', SubtopicSchema);


