import { IClass } from '../../types/content/class.types';
import mongoose, { Schema } from 'mongoose';

const ClassSchema = new Schema<IClass>(
  {
    board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    name: { type: String, required: true },
    grade: { type: Number, required: true },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
ClassSchema.virtual('translation');
ClassSchema.virtual('translations');

export default mongoose.model<IClass>('Class', ClassSchema);
