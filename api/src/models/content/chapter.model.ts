import { IChapter } from '../../types/content/chapter.types';
import mongoose, { Schema } from 'mongoose';

const ChapterSchema = new Schema<IChapter>(
  {
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    order: { type: Number, required: true },
    is_published: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
