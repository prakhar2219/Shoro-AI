import { Document, Types } from 'mongoose';

export interface IGBQuestion extends Document {
  _id: Types.ObjectId;
  gb_subtopic_id: Types.ObjectId;
  question: string;
  slug: string;
  answer?: string;
  content?: string;
  language_id: Types.ObjectId;
  order: number;
  image?: string;
  tag?: string[];
  source?: string;
  author?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_published: boolean;
  created_by?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
