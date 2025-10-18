import mongoose, { Schema } from 'mongoose';
import { ITopic } from '@/types/content/topic.types';

const TopicSchema = new Schema<ITopic>(
  {
    chapter_id: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, required: true },
    is_published: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: false },
    tag: [{ type: String, trim: true }],
    source: { type: String, trim: true },
    author: { type: String, trim: true },
  },
  { timestamps: true }
);

TopicSchema.virtual('translation');
TopicSchema.virtual('translations');

// Compound unique index: order must be unique within each chapter
TopicSchema.index({ chapter_id: 1, order: 1 }, { unique: true });

export default mongoose.model<ITopic>('Topic', TopicSchema);


