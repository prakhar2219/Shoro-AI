import { IClass } from '../../types/content/class.types';
import mongoose, { Schema } from 'mongoose';

const ClassSchema = new Schema<IClass>(
  {
    board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    name: { type: String, required: true },
    grade: { type: Number, required: true },
    content: { type: String, required: false },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
ClassSchema.virtual('translation');
ClassSchema.virtual('translations');

// Compound unique index: board_id + grade + language_id must be unique
ClassSchema.index({ board_id: 1, grade: 1, language_id: 1 }, { unique: true });

export default mongoose.model<IClass>('Class', ClassSchema);
