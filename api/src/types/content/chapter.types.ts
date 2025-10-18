import mongoose, { Document } from 'mongoose';

export interface IChapter extends Document {
  board_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  language_id: mongoose.Types.ObjectId;
  order: number;
  is_published: boolean;
  created_by: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  downloadNotes?: string;
  downloadPDF?: string;
  downloadQA?: string;
  content?: string;
  version?: number;
  tag?: string[];
  source?: string;
  author?: string;
  translation?: any;
  translations?: any[];
}
