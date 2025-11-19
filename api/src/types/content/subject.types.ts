import mongoose, { Document } from 'mongoose';

export interface ISubject extends Document {
  class_id: mongoose.Types.ObjectId;
  language_id: mongoose.Types.ObjectId;
  supported_language_ids?: mongoose.Types.ObjectId[];
  code: string;
  icon?: string;
  name: string;
  book_name?: string;
  downloadNotes?: string;
  downloadPDF?: string;
  downloadQA?: string;
  content?: string;
  tag?: string[];
  source?: string;
  author?: string;
  flashcards?: boolean;
  mock_test?: boolean;
  total_questions?: number;
  total_time?: number;
  pass_questions?: number;
  translation?: any; // single translation (for FE/BE consistency)
  translations?: any[]; // all translations (for FE/BE consistency)
}
