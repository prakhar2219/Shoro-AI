import { api } from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface IMCQOption {
  key: string;
  text: string;
}

export interface IMCQTranslation {
  _id?: string;
  language_id: string;
  question: string;
  options: IMCQOption[];
  correct_answer: string;
  explanation?: string;
  content?: any;
}

export interface IMCQ {
  _id?: string;
  entity_type: string;
  entity_id: string;
  question: string;
  options: IMCQOption[];
  correct_answer: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  is_active: boolean;
  content?: any;
  supported_language_ids: string[];
  translations?: IMCQTranslation[];
  createdAt?: string;
  updatedAt?: string;
}

/* -----------------------------------------
   GET (Paginated)
----------------------------------------- */
export const getMCQs = async ({
  page = 1,
  limit = 10,
  search = "",
  entity_type,
  entity_id
}: {
  page?: number;
  limit?: number;
  search?: string;
  entity_type?: string;
  entity_id?: string;
} = {}) => {
  const params: any = { page, limit };

  if (search) params.search = search;
  if (entity_type) params.entity_type = entity_type;
  if (entity_id) params.entity_id = entity_id;

  const res = await api.get(`${API_ENDPOINTS.mcqs}/paginated`, { params });
  return res.data;
};

/* -----------------------------------------
   GET SINGLE
----------------------------------------- */
export const getMCQ = async (id: string) => {
  const res = await api.get(`${API_ENDPOINTS.mcqs}/${id}`);
  return res.data;
};

/* -----------------------------------------
   CREATE
----------------------------------------- */
export const createMCQ = async (data: Omit<IMCQ, "_id">) => {
  const res = await api.post(API_ENDPOINTS.mcqs, data);
  return res.data;
};

/* -----------------------------------------
   UPDATE
----------------------------------------- */
export const updateMCQ = async (id: string, data: Partial<IMCQ>) => {
  const res = await api.put(`${API_ENDPOINTS.mcqs}/${id}`, data);
  return res.data;
};

/* -----------------------------------------
   DELETE
----------------------------------------- */
export const deleteMCQ = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.mcqs}/${id}`);
  return res.data;
};

/* -----------------------------------------
   TRANSLATIONS
----------------------------------------- */
export const createMCQTranslation = async (mcqId: string, data: IMCQTranslation) => {
  const res = await api.post(`${API_ENDPOINTS.mcqs}/${mcqId}/translations`, data);
  return res.data;
};

export const updateMCQTranslation = async (mcqId: string, translationId: string, data: IMCQTranslation) => {
  const res = await api.put(`${API_ENDPOINTS.mcqs}/${mcqId}/translations/${translationId}`, data);
  return res.data;
};

export const deleteMCQTranslation = async (mcqId: string, translationId: string) => {
  const res = await api.delete(`${API_ENDPOINTS.mcqs}/${mcqId}/translations/${translationId}`);
  return res.data;
};

/* -----------------------------------------
   BULK CREATE (CSV UPLOAD)
----------------------------------------- */
export const bulkCreateMCQs = async (mcqs: Omit<IMCQ, "_id">[]) => {
  const res = await api.post(`${API_ENDPOINTS.mcqs}/bulk`, { mcqs });
  return res.data;
};
