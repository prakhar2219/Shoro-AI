import { IChapter } from '../../types/content/chapter.types';
import mongoose, { Schema } from 'mongoose';

const ChapterSchema = new Schema<IChapter>(
  {
    board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    order: { type: Number, required: true },
    is_published: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    seo_title: { type: String },
    seo_description: { type: String },
    downloadNotes: { type: String, trim: true },
    downloadPDF: { type: String, trim: true },
    downloadQA: { type: String, trim: true },
    content: { type: String, required: false },
    version: { type: Number, default: 1 },
    tag: [{ type: String, trim: true }],
    source: { type: String, trim: true },
    author: { type: String, trim: true },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
ChapterSchema.virtual('translation');
ChapterSchema.virtual('translations');

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
