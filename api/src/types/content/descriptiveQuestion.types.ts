import { Schema } from 'mongoose';

export interface IDescriptiveQuestion {
  entity_type: string; // "Chapter" | "Country" | "Board" | "Class" | "Subject"
  entity_id: Schema.Types.ObjectId;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  is_active: boolean;
  created_by?: Schema.Types.ObjectId;
  content?: string;
  translation?: any; // Single translation (for FE/BE consistency)
  translations?: any[]; // All translations (for FE/BE consistency)
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
} 