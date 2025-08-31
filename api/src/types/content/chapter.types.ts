import mongoose from 'mongoose';

export interface IChapter extends Document {
  board_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  order: number;
  is_published: boolean;
  created_by: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  content: string;
  version?: number;
  translation?: any;
  translations?: any[];
}
