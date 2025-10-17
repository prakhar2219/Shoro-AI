import { api } from '../axios';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'user';
  active: boolean;
  lastLogin?: Date;
  profileImage?: string;
  phoneNumber?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: Array<{ _id: string; count: number }>;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  active?: boolean;
  search?: string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

// Get all users with filters (Super Admin only)
export const getAllUsers = async (params: GetUsersParams, token: string): Promise<GetUsersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.role) queryParams.append('role', params.role);
  if (params.active !== undefined) queryParams.append('active', params.active.toString());
  if (params.search) queryParams.append('search', params.search);

  const response = await api.get(`/api/v1/users?${queryParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return response.data.data;
};

// Get user by ID
export const getUserById = async (id: string, token: string): Promise<User> => {
  const response = await api.get(`/api/v1/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.user;
};

// Create new user (Super Admin only)
export const createUser = async (userData: Partial<User> & { password: string }, token: string): Promise<User> => {
  const response = await api.post('/api/v1/users', userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.user;
};

// Update user (Super Admin only)
export const updateUser = async (id: string, userData: Partial<User>, token: string): Promise<User> => {
  const response = await api.patch(`/api/v1/users/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.user;
};

// Soft delete user (Super Admin only)
export const deleteUser = async (id: string, token: string): Promise<User> => {
  const response = await api.delete(`/api/v1/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.user;
};

// Hard delete user (Super Admin only)
export const hardDeleteUser = async (id: string, token: string): Promise<void> => {
  await api.delete(`/api/v1/users/${id}/hard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Update user role (Super Admin only)
export const updateUserRole = async (
  id: string,
  role: 'super_admin' | 'admin' | 'editor' | 'user',
  token: string
): Promise<User> => {
  const response = await api.patch(
    `/api/v1/users/${id}/role`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data.user;
};

// Get user statistics (Super Admin only)
export const getUserStats = async (token: string): Promise<UserStats> => {
  const response = await api.get('/api/v1/users/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

// Get all Clerk users (Super Admin only)
export const getClerkUsers = async (params: GetUsersParams, token: string): Promise<GetUsersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);

  const response = await api.get(`/api/v1/users/clerk/list?${queryParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  return response.data.data;
};

// Update Clerk user role (Super Admin only)
export const updateClerkUserRole = async (
  clerkId: string,
  role: 'super_admin' | 'admin' | 'editor' | 'user',
  token: string
): Promise<void> => {
  await api.patch(
    `/api/v1/users/clerk/${clerkId}/role`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
