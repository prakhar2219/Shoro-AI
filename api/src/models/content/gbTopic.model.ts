import mongoose, { Schema } from 'mongoose';
import { IGBTopic } from '../../types/content/gbTopic.types';

const GBTopicSchema = new Schema<IGBTopic>(
  {
    gb_category_id: { type: Schema.Types.ObjectId, ref: 'GBCategory', required: true },
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
    flashcards: { type: Boolean, default: false },
    mock_test: { type: Boolean, default: false },
    total_questions: { type: Number },
    total_time: { type: Number },
    pass_questions: { type: Number },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
GBTopicSchema.virtual('translation');
GBTopicSchema.virtual('translations');

// Allow duplicate slugs: removed unique index on slug within GB category

// Compound unique index: order must be unique within each GB category and language
GBTopicSchema.index({ gb_category_id: 1, language_id: 1, order: 1 }, { unique: true });

export default mongoose.model<IGBTopic>('GBTopic', GBTopicSchema);
