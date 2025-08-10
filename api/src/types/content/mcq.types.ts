import { Schema } from 'mongoose';

export interface IMCQOption {
  key: string; // "A", "B", "C", "D"
  text: string;
}

export interface IMCQ {
  entity_type: string; // "Chapter" | "Country" | "Board" | "Class" | "Subject"
  entity_id: Schema.Types.ObjectId;
  question: string;
  options: IMCQOption[];
  correct_answer: string; // "A", "B", "C", or "D"
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  is_active: boolean;
  created_by?: Schema.Types.ObjectId;
  content: any[];
  translation?: any; // Single translation (for FE/BE consistency)
  translations?: any[]; // All translations (for FE/BE consistency)
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
} 