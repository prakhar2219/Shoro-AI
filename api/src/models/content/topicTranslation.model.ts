import mongoose, { Schema } from 'mongoose';
import { ITopicTranslation } from '@/types/content/topicTranslation.types';

const TopicTranslationSchema = new Schema<ITopicTranslation>(
  {
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, required: false },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes for performance and uniqueness
TopicTranslationSchema.index({ topic_id: 1, language_id: 1 }, { unique: true });
TopicTranslationSchema.index({ topic_id: 1, slug: 1 }, { unique: true });

export default mongoose.model<ITopicTranslation>(
  'TopicTranslation',
  TopicTranslationSchema
);
