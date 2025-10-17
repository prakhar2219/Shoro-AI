import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserMethods } from '../interfaces/user.interface';

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    clerkId: {
      type: String,
      unique: true,
      sparse: true, // Allow null for existing users
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        // Password required only if no clerkId (legacy users)
        return !this.clerkId;
      },
      minlength: 8,
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'editor', 'user'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    department: {
      type: String,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
// Note: clerkId index is auto-created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ active: 1 });

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
