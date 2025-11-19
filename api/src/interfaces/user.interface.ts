export interface IUser {
  clerkId?: string; // Clerk user ID (for Clerk-authenticated users)
  email: string;
  password?: string; // Optional for Clerk users
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
  phoneNumber?: string;
  department?: string;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  _id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
  phoneNumber?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}
