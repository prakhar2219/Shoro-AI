import { Schema } from 'mongoose';

export interface IFAQ {
  entity_type: string; // "Chapter" | "Topic" | "Subtopic" | "Country" | "Board" | "Class" | "Subject"
  entity_id: Schema.Types.ObjectId;
  question: string;
  answer: string;
  category?: string;
  order: number;
  is_active: boolean;
  created_by?: Schema.Types.ObjectId;
  content?: string;
  supported_language_ids?: string[];
  translation?: any; // Single translation (for FE/BE consistency)
  translations?: any[]; // All translations (for FE/BE consistency)
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
} 