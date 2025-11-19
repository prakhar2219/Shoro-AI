import { Document, Types } from 'mongoose';

export interface IGBCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  content?: string;

  language_id: Types.ObjectId;

  // ✅ FIXED: No mongoose import, same type style as others
  country_id?: Types.ObjectId | string | null;

  supported_language_ids?: Types.ObjectId[];
  order: number;
  image?: string;
  tag?: string[];
  source?: string;
  author?: string;
  is_published: boolean;
  created_by?: Types.ObjectId;
  flashcards?: boolean;
  mock_test?: boolean;
  total_questions?: number;
  total_time?: number;
  pass_questions?: number;
  createdAt: Date;
  updatedAt: Date;
}
