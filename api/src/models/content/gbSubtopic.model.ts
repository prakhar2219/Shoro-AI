import mongoose, { Schema } from 'mongoose';
import { IGBSubtopic } from '../../types/content/gbSubtopic.types';

const GBSubtopicSchema = new Schema<IGBSubtopic>(
  {
    gb_topic_id: { type: Schema.Types.ObjectId, ref: 'GBTopic', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    content: { type: String, required: false },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    supported_language_ids: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
    order: { type: Number, required: true, default: 0 },
    image: { type: String, trim: true },
    tag: [{ type: String, trim: true }],
    source: { type: String, trim: true },
    author: { type: String, trim: true },
    is_published: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
GBSubtopicSchema.virtual('translation');
GBSubtopicSchema.virtual('translations');

// Allow duplicate slugs: removed unique index on slug within GB topic

// Compound unique index: order must be unique within each GB topic and language
GBSubtopicSchema.index({ gb_topic_id: 1, language_id: 1, order: 1 }, { unique: true });

export default mongoose.model<IGBSubtopic>('GBSubtopic', GBSubtopicSchema);
