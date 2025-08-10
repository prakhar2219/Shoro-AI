import MCQ from '../../models/content/mcq.model';
import MCQTranslation from '../../models/content/mcqTranslation.model';
import { IMCQ } from '@/types/content/mcq.types';

export const createMCQ = async (data: IMCQ) => {
  return await MCQ.create(data);
};

export const getAllMCQs = async (entity_type?: string, entity_id?: string) => {
  const filter: any = {};
  if (entity_type) filter.entity_type = entity_type;
  if (entity_id) filter.entity_id = entity_id;

  const mcqs = await MCQ.find(filter)
    .populate('created_by')
    .sort({ createdAt: -1 });

  // Fetch all translations for all MCQs in one query
  const mcqIds = mcqs.map((mcq: any) => mcq._id);
  const allTranslations = await MCQTranslation.find({ mcq_id: { $in: mcqIds } });

  const mcqsWithTranslations = mcqs.map((mcq: any) => {
    // All translations for this MCQ
    const translations = allTranslations.filter((t: any) => t.mcq_id.toString() === mcq._id.toString());
    
    return {
      ...mcq.toObject(),
      translations,
    };
  });

  return mcqsWithTranslations;
};

export const getMCQById = async (id: string, language_id?: string) => {
  const mcq = await MCQ.findById(id).populate('created_by');
  if (!mcq) return null;

  let translation = null;
  if (language_id) {
    translation = await MCQTranslation.findOne({
      mcq_id: mcq._id,
      language_id,
    });
  }
  if (!translation) {
    translation = await MCQTranslation.findOne({ mcq_id: mcq._id });
  }

  // All translations for this MCQ
  const translations = await MCQTranslation.find({ mcq_id: mcq._id });

  return {
    ...mcq.toObject(),
    translation,
    translations,
  };
};

export const getMCQsWithPagination = async (
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
      { explanation: searchRegex },
      { tags: { $in: [searchRegex] } },
    ];
  }
  
  if (entity_type) filter.entity_type = entity_type;
  if (entity_id) filter.entity_id = entity_id;

  const [mcqs, total] = await Promise.all([
    MCQ.find(filter)
      .populate('created_by')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MCQ.countDocuments(filter)
  ]);

  // Fetch all translations for all MCQs in one query
  const mcqIds = mcqs.map((mcq: any) => mcq._id);
  const allTranslations = await MCQTranslation.find({ mcq_id: { $in: mcqIds } });

  const mcqsWithTranslations = mcqs.map((mcq: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.mcq_id.toString() === mcq._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.mcq_id.toString() === mcq._id.toString());
    }
    
    // All translations for this MCQ
    const translations = allTranslations.filter((t: any) => t.mcq_id.toString() === mcq._id.toString());
    
    return {
      ...mcq.toObject(),
      translation,
      translations,
    };
  });

  return {
    data: mcqsWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const updateMCQ = async (id: string, data: Partial<IMCQ>) => {
  return await MCQ.findByIdAndUpdate(id, data, { new: true });
};

export const deleteMCQ = async (id: string) => {
  // Delete all translations first
  await MCQTranslation.deleteMany({ mcq_id: id });
  return await MCQ.findByIdAndDelete(id);
};

// MCQ Translation CRUD
export const getMCQTranslations = async (mcqId: string) => {
  return await MCQTranslation.find({ mcq_id: mcqId });
};

export const createMCQTranslation = async (mcqId: string, data: any) => {
  // Validate that MCQ exists
  const mcq = await MCQ.findById(mcqId);
  if (!mcq) throw new Error('MCQ not found');

  // Validate translation integrity
  if (mcq.options.length !== data.options.length) {
    throw new Error('Translation must have same number of options');
  }

  const originalKeys = mcq.options.map(opt => opt.key);
  const translationKeys = data.options.map(opt => opt.key);

  if (!arraysEqual(originalKeys, translationKeys)) {
    throw new Error('Translation options must have same keys in same order');
  }

  if (mcq.correct_answer !== data.correct_answer) {
    throw new Error('Translation must have same correct answer key');
  }

  // Prevent duplicate translation for same MCQ/language
  const exists = await MCQTranslation.findOne({ mcq_id: mcqId, language_id: data.language_id });
  if (exists) throw new Error('Translation already exists for this language.');

  return await MCQTranslation.create({ ...data, mcq_id: mcqId });
};

export const updateMCQTranslation = async (translationId: string, data: any) => {
  return await MCQTranslation.findByIdAndUpdate(translationId, data, { new: true });
};

export const deleteMCQTranslation = async (translationId: string) => {
  return await MCQTranslation.findByIdAndDelete(translationId);
};

// Helper function to compare arrays
function arraysEqual(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
} 