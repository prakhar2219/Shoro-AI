import { ISubject } from "../../types/content/subject.types";
import mongoose, { Schema } from "mongoose";

const SubjectSchema = new Schema<ISubject>(
    {
        class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        code: { type: String, required: true },
        icon: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<ISubject>('Subject', SubjectSchema);