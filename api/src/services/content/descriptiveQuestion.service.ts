import DescriptiveQuestion from '../../models/content/descriptiveQuestion.model';
import DescriptiveQuestionTranslation from '../../models/content/descriptiveQuestionTranslation.model';
import { IDescriptiveQuestion } from '@/types/content/descriptiveQuestion.types';

export const createDescriptiveQuestion = async (data: IDescriptiveQuestion) => {
  return await DescriptiveQuestion.create(data);
};

export const getAllDescriptiveQuestions = async (entity_type?: string, entity_id?: string) => {
  const filter: any = {};
  if (entity_type) filter.entity_type = entity_type;
  if (entity_id) filter.entity_id = entity_id;

  const questions = await DescriptiveQuestion.find(filter)
    .populate('created_by')
    .sort({ createdAt: -1 });

  // Fetch all translations for all questions in one query
  const questionIds = questions.map((question: any) => question._id);
  const allTranslations = await DescriptiveQuestionTranslation.find({ descriptive_question_id: { $in: questionIds } });

  const questionsWithTranslations = questions.map((question: any) => {
    // All translations for this question
    const translations = allTranslations.filter((t: any) => t.descriptive_question_id.toString() === question._id.toString());
    
    return {
      ...question.toObject(),
      translations,
    };
  });

  return questionsWithTranslations;
};

export const getDescriptiveQuestionById = async (id: string, language_id?: string) => {
  const question = await DescriptiveQuestion.findById(id).populate('created_by');
  if (!question) return null;

  let translation = null;
  if (language_id) {
    translation = await DescriptiveQuestionTranslation.findOne({
      descriptive_question_id: question._id,
      language_id,
    });
  }
  if (!translation) {
    translation = await DescriptiveQuestionTranslation.findOne({ descriptive_question_id: question._id });
  }

  // All translations for this question
  const translations = await DescriptiveQuestionTranslation.find({ descriptive_question_id: question._id });

  return {
    ...question.toObject(),
    translation,
    translations,
  };
};

export const getDescriptiveQuestionsWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  entity_type?: string,
  entity_id?: string,
  language_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { question: searchRegex },
      { answer: searchRegex },
      { tags: { $in: [searchRegex] } },
    ];
  }
  
  if (entity_type) filter.entity_type = entity_type;
  if (entity_id) filter.entity_id = entity_id;

  const [questions, total] = await Promise.all([
    DescriptiveQuestion.find(filter)
      .populate('created_by')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DescriptiveQuestion.countDocuments(filter)
  ]);

  // Fetch all translations for all questions in one query
  const questionIds = questions.map((question: any) => question._id);
  const allTranslations = await DescriptiveQuestionTranslation.find({ descriptive_question_id: { $in: questionIds } });

  const questionsWithTranslations = questions.map((question: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.descriptive_question_id.toString() === question._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.descriptive_question_id.toString() === question._id.toString());
    }
    
    // All translations for this question
    const translations = allTranslations.filter((t: any) => t.descriptive_question_id.toString() === question._id.toString());
    
    return {
      ...question.toObject(),
      translation,
      translations,
    };
  });

  return {
    data: questionsWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const updateDescriptiveQuestion = async (id: string, data: Partial<IDescriptiveQuestion>) => {
  return await DescriptiveQuestion.findByIdAndUpdate(id, data, { new: true });
};

export const deleteDescriptiveQuestion = async (id: string) => {
  // Delete all translations first
  await DescriptiveQuestionTranslation.deleteMany({ descriptive_question_id: id });
  return await DescriptiveQuestion.findByIdAndDelete(id);
};

// Descriptive Question Translation CRUD
export const getDescriptiveQuestionTranslations = async (questionId: string) => {
  return await DescriptiveQuestionTranslation.find({ descriptive_question_id: questionId });
};

export const createDescriptiveQuestionTranslation = async (questionId: string, data: any) => {
  // Validate that question exists
  const question = await DescriptiveQuestion.findById(questionId);
  if (!question) throw new Error('Descriptive question not found');

  // Prevent duplicate translation for same question/language
  const exists = await DescriptiveQuestionTranslation.findOne({ 
    descriptive_question_id: questionId, 
    language_id: data.language_id 
  });
  if (exists) throw new Error('Translation already exists for this language.');

  return await DescriptiveQuestionTranslation.create({ ...data, descriptive_question_id: questionId });
};

export const updateDescriptiveQuestionTranslation = async (translationId: string, data: any) => {
  return await DescriptiveQuestionTranslation.findByIdAndUpdate(translationId, data, { new: true });
};

export const deleteDescriptiveQuestionTranslation = async (translationId: string) => {
  return await DescriptiveQuestionTranslation.findByIdAndDelete(translationId);
}; 