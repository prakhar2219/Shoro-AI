import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  entityType: 'blog' | 'subject' | 'chapter' | 'topic';
  entityId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail?: string;
  rating: number; // 1-5 stars
  review?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ['blog', 'subject', 'chapter', 'topic']
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    userEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isApproved: {
      type: Boolean,
      default: true // Auto-approve by default, can be changed for moderation
    }
  },
  { 
    timestamps: true
  }
);

// Compound index to prevent duplicate ratings from same user for same entity
ratingSchema.index({ entityType: 1, entityId: 1, userEmail: 1 }, { unique: true, sparse: true });

export default mongoose.model<IRating>('Rating', ratingSchema);
