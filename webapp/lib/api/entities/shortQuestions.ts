import { api } from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface IShortQuestionOption {
  key: string;
  text: string;
}

export interface IShortQuestion {
  _id?: string;
  entity_type: string;
  entity_id: string;
  question: string;
  options: IShortQuestionOption[];
  correct_answer: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  is_active: boolean;
  content: any[];
  supported_language_ids?: string[];
  translation?: any;
  translations?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IShortQuestionTranslation {
  _id?: string;
  short_question_id: string;
  language_id: string;
  question: string;
  options: IShortQuestionOption[];
  correct_answer: string;
  explanation?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  content: any[];
  createdAt?: string;
  updatedAt?: string;
}

/* ===============================
    PAGINATED FETCH
================================ */
export const getShortQuestions = async ({
  page = 1,
  limit = 10,
  search = "",
  entity_type,
  entity_id,
  language_id,
}: {
  page?: number;
  limit?: number;
  search?: string;
  entity_type?: string;
  entity_id?: string;
  language_id?: string;
} = {}) => {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (entity_type) params.entity_type = entity_type;
  if (entity_id) params.entity_id = entity_id;
  if (language_id) params.language_id = language_id;

  const res = await api.get(`${API_ENDPOINTS.short_questions}/paginated`, {
    params,
  });

  return res.data;
};

/* ===============================
    SINGLE SHORT QUESTION
================================ */
export const getShortQuestion = async (id: string, language_id?: string) => {
  const params: any = {};
  if (language_id) params.language_id = language_id;

  const res = await api.get(`${API_ENDPOINTS.short_questions}/${id}`, {
    params,
  });
  return res.data;
};

/* ===============================
    CREATE
================================ */
export const createShortQuestion = async (
  data: Omit<IShortQuestion, "_id" | "createdAt" | "updatedAt">
) => {
  const res = await api.post(API_ENDPOINTS.short_questions, data);
  return res.data;
};

/* ===============================
    UPDATE
================================ */
export const updateShortQuestion = async (
  id: string,
  data: Partial<IShortQuestion>
) => {
  const res = await api.put(`${API_ENDPOINTS.short_questions}/${id}`, data);
  return res.data;
};

/* ===============================
    DELETE
================================ */
export const deleteShortQuestion = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.short_questions}/${id}`);
  return res.data;
};

/* ===============================
    BULK UPLOAD
================================ */
// export const bulkCreateShortQuestions = async (
//   items: Omit<IShortQuestion, "_id" | "createdAt" | "updatedAt">[]
// ) => {
//   const res = await api.post(`${API_ENDPOINTS.short_questions}/bulk`, {
//     short_questions: items,
//   });
//   return res.data;
// };

/* ===============================
    TRANSLATIONS
================================ */
export const getShortQuestionTranslations = async (
  shortQuestionId: string
): Promise<IShortQuestionTranslation[]> => {
  const res = await api.get(
    `${API_ENDPOINTS.short_questions}/${shortQuestionId}/translations`
  );
  return res.data;
};

export const createShortQuestionTranslation = async (
  shortQuestionId: string,
  data: Omit<
    IShortQuestionTranslation,
    "_id" | "short_question_id" | "createdAt" | "updatedAt"
  >
) => {
  const res = await api.post(
    `${API_ENDPOINTS.short_questions}/${shortQuestionId}/translations`,
    data
  );
  return res.data;
};

export const updateShortQuestionTranslation = async (
  shortQuestionId: string,
  translationId: string,
  data: Partial<IShortQuestionTranslation>
) => {
  const res = await api.put(
    `${API_ENDPOINTS.short_questions}/${shortQuestionId}/translations/${translationId}`,
    data
  );
  return res.data;
};

export const deleteShortQuestionTranslation = async (
  shortQuestionId: string,
  translationId: string
) => {
  const res = await api.delete(
    `${API_ENDPOINTS.short_questions}/${shortQuestionId}/translations/${translationId}`
  );
  return res.data;
};

export const bulkCreateShortQuestions = async (shortQuestions) => {
  const res = await api.post(`/content/short-questions/bulk`, {
    shortQuestions,
  });
  return res.data;
};

