import mongoose from 'mongoose';

export interface ISubject extends Document {
  class_id: mongoose.Types.ObjectId;
  language_id: mongoose.Types.ObjectId;
  code: string;
  icon?: string;
  name: string;
  downloadNotes?: string;
  downloadPDF?: string;
  downloadQA?: string;
  content?: string;
  tag?: string[];
  source?: string;
  author?: string;
  translation?: any; // single translation (for FE/BE consistency)
  translations?: any[]; // all translations (for FE/BE consistency)
}
