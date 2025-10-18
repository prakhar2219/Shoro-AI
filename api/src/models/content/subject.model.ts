import { ISubject } from '../../types/content/subject.types';
import mongoose, { Schema } from 'mongoose';

const SubjectSchema = new Schema<ISubject>(
  {
    class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    code: { type: String, required: true },
    icon: { type: String },
    name: { type: String, required: true },
    content: { type: String, required: false },
    tag: [{ type: String, trim: true }],
    source: { type: String, trim: true },
    author: { type: String, trim: true },
  },
  { timestamps: true }
);

// Virtuals for translation and translations (for FE/BE consistency)
SubjectSchema.virtual('translation');
SubjectSchema.virtual('translations');

export default mongoose.model<ISubject>('Subject', SubjectSchema);
