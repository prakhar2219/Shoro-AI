import mongoose from "mongoose";

export interface IChapter extends Document {
  subject_id: mongoose.Types.ObjectId;
  order: number;
  is_published: boolean;
  created_by: mongoose.Types.ObjectId;
}