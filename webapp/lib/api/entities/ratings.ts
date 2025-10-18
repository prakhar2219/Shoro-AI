import { api } from '../axios';

export interface IRating {
  _id: string;
  entityType: 'blog' | 'subject' | 'chapter' | 'topic' | 'gb_category' | 'gb_topic' | 'gb_subtopic' | 'gb_question';
  entityId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  review?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingsResponse {
  data: IRating[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAllRatings = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: string;
  isApproved?: boolean;
}): Promise<RatingsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.entityType) searchParams.append('entityType', params.entityType);
  if (params?.isApproved !== undefined) searchParams.append('isApproved', params.isApproved.toString());

  const response = await api.get(`/ratings/admin/all?${searchParams.toString()}`);
  return response.data;
};

export const updateRating = async (id: string, data: Partial<IRating>): Promise<IRating> => {
  const response = await api.put(`/ratings/${id}`, data);
  return response.data;
};

export const deleteRating = async (id: string): Promise<void> => {
  await api.delete(`/ratings/${id}`);
};

export const approveRating = async (id: string): Promise<IRating> => {
  const response = await api.patch(`/ratings/admin/${id}/approve`);
  return response.data;
};

export const rejectRating = async (id: string): Promise<IRating> => {
  const response = await api.patch(`/ratings/admin/${id}/reject`);
  return response.data;
};
