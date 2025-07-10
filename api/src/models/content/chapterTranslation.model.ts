import { IChapterTranslation } from '@/types/content/chapterTranslation.types';
import mongoose, { Schema } from 'mongoose';

const ChapterTranslationSchema = new Schema<IChapterTranslation>(
  {
    chapter_id: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    seo_title: { type: String },
    seo_description: { type: String },
    content: { type: [Schema.Types.Mixed], required: true } as any,
    version: { type: Number, default: 1 },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IChapterTranslation>(
  'ChapterTranslation',
  ChapterTranslationSchema
);
