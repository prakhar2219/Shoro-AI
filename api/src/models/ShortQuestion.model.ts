import mongoose, { Schema, Document } from "mongoose";

export interface IShortQuestion extends Document {
  entity_type: string;
  entity_id: mongoose.Types.ObjectId;
  question: string;
  options: Array<{ key: string; text: string }>;
  correct_answer: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  is_active: boolean;
  content: any;
  supported_language_ids: mongoose.Types.ObjectId[];
  created_by?: mongoose.Types.ObjectId;
  translation?: any;
  translations?: any[];
}

const ShortQuestionSchema = new Schema<IShortQuestion>(
  {
    entity_type: { type: String, required: true },
entity_id: { type: Schema.Types.Mixed, required: true },

    question: { type: String, required: true },

    options: [
      {
        key: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],

    correct_answer: { type: String, required: true },

    explanation: { type: String },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    tags: [{ type: String }],
    is_active: { type: Boolean, default: true },

    content: { type: Schema.Types.Mixed },

    supported_language_ids: [{ type: Schema.Types.ObjectId, ref: "Language" }],

    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ShortQuestionSchema.virtual("translation");
ShortQuestionSchema.virtual("translations");

export default mongoose.model<IShortQuestion>(
  "ShortQuestion",
  ShortQuestionSchema
);
