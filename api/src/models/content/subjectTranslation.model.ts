import mongoose, { Schema } from 'mongoose';
import { ISubjectTranslation } from '@/types/content/subjectTranslation.types';

const SubjectTranslationSchema = new Schema<ISubjectTranslation>(
  {
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    language_id: {
      type: Schema.Types.ObjectId,
      ref: 'Language',
      required: true,
    },
    name: { type: String, required: true },
    translated_by_ai: { type: Boolean, default: false },
    needs_review: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: [Schema.Types.Mixed], required: true } as any,
  },
  { timestamps: true }
);

export default mongoose.model<ISubjectTranslation>(
  'SubjectTranslation',
  SubjectTranslationSchema
);
