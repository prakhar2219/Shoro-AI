import mongoose from 'mongoose';

export interface IClass extends Document {
  board_id: mongoose.Types.ObjectId;
  language_id: mongoose.Types.ObjectId;
  supported_language_ids?: mongoose.Types.ObjectId[];
  name: string;
  grade: number;
  content?: string;
  translation?: any; // single translation (for FE/BE consistency)
  translations?: any[]; // all translations (for FE/BE consistency)
}
