export interface IUser {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
