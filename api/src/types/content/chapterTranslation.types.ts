import mongoose from 'mongoose';

export interface IChapterTranslation extends Document {
  chapter_id: mongoose.Types.ObjectId;
  language_id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  content: any[];
  version: number;
  translated_by_ai: boolean;
  needs_review: boolean;
  updated_by: mongoose.Types.ObjectId;
}
