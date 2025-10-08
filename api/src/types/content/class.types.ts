import mongoose from 'mongoose';

export interface IClass extends Document {
  board_id: mongoose.Types.ObjectId;
  name: string;
  grade: number;
  content?: string;
  translation?: any; // single translation (for FE/BE consistency)
  translations?: any[]; // all translations (for FE/BE consistency)
}
