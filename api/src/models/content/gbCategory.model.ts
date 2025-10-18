import mongoose, { Schema } from 'mongoose';
import { IGBCategory } from '../../types/content/gbCategory.types';

const GBCategorySchema = new Schema<IGBCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    content: { type: String, required: false },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
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
GBCategorySchema.virtual('translation');
GBCategorySchema.virtual('translations');

export default mongoose.model<IGBCategory>('GBCategory', GBCategorySchema);
