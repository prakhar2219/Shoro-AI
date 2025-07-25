import mongoose from 'mongoose';

interface ISession {
  user: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema<ISession>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true },
    userAgent: String,
    ip: String,
  },
  { timestamps: true }
);

const Session = mongoose.model<ISession>('Session', sessionSchema);

export default Session;
export type { ISession };
