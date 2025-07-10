import mongoose from 'mongoose';

export interface IClass extends Document {
  board_id: mongoose.Types.ObjectId;
  name: string;
  grade: number;
}
