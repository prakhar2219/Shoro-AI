import { Document, Types } from 'mongoose';

export interface IGBCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  language_id: Types.ObjectId;
  supported_language_ids?: Types.ObjectId[];
  order: number;
  image?: string;
  tag?: string[];
  source?: string;
  author?: string;
  is_published: boolean;
  created_by?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
