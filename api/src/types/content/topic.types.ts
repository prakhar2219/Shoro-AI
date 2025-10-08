import mongoose, { Document } from 'mongoose';

export interface ITopic extends Document {
  chapter_id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  order: number;
  is_published: boolean;
  created_by?: mongoose.Types.ObjectId;
  content?: string;
  translation?: any;
  translations?: any[];
}


