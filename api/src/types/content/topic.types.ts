import mongoose, { Document } from 'mongoose';

export interface ITopic extends Document {
  chapter_id: mongoose.Types.ObjectId;
  language_id: mongoose.Types.ObjectId;
  supported_language_ids?: mongoose.Types.ObjectId[];
  title: string;
  slug: string;
  order: number;
  is_published: boolean;
  created_by?: mongoose.Types.ObjectId;
  content?: string;
  tag?: string[];
  source?: string;
  author?: string;
  flashcards?: boolean;
  mock_test?: boolean;
  total_questions?: number;
  total_time?: number;
  pass_questions?: number;
  translation?: any;
  translations?: any[];
}


