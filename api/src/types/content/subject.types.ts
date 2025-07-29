import mongoose from 'mongoose';

export interface ISubject extends Document {
  class_id: mongoose.Types.ObjectId;
  code: string;
  icon?: string;
  name: string;
  content: any[];
  translation?: any; // single translation (for FE/BE consistency)
  translations?: any[]; // all translations (for FE/BE consistency)
}
