import mongoose from 'mongoose';

export interface ITopicTranslation {
  topic_id: mongoose.Types.ObjectId;
  language_id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}
