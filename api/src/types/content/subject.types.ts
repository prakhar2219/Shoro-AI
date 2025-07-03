import mongoose from "mongoose";

export interface ISubject extends Document {
  class_id: mongoose.Types.ObjectId;
  code: string;
  icon?: string;
}