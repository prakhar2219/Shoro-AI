import { IClass } from "../../types/content/class.types";
import mongoose, { Schema } from "mongoose";

const ClassSchema = new Schema<IClass>(
  {
    board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    number: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IClass>('Class', ClassSchema);