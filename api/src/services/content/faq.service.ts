import FAQ from '../../models/content/faq.model';
import FAQTranslation from '../../models/content/faqTranslation.model';
import { IFAQ } from '@/types/content/faq.types';

export const createFAQ = async (data: IFAQ) => {
  return await FAQ.create(data);
};

// Bulk create FAQs (with duplicate handling)
export const bulkCreateFAQs = async (faqs: IFAQ[]) => {
  try {
    return await FAQ.insertMany(faqs as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) {
      return error.insertedIds;
    }
    throw error;
  }
};

export const getAllFAQs = async (entity_type?: string, entity_id?: string) => {
  const filter: any = {};
  if (entity_type) filter.entity_type = entity_type;
  if (entity_id) filter.entity_id = entity_id;

  const faqs = await FAQ.find(filter)
    .populate('created_by')
    .sort({ order: 1, createdAt: -1 });

  // Fetch all translations for all FAQs in one query
  const faqIds = faqs.map((faq: any) => faq._id);
  const allTranslations = await FAQTranslation.find({ faq_id: { $in: faqIds } });

  const faqsWithTranslations = faqs.map((faq: any) => {
    // All translations for this FAQ
    const translations = allTranslations.filter((t: any) => t.faq_id.toString() === faq._id.toString());
    
    return {
      ...faq.toObject(),
      translations,
    };
  });

  return faqsWithTranslations;
};

export const getFAQById = async (id: string, language_id?: string) => {
  const faq = await FAQ.findById(id).populate('created_by');
  if (!faq) return null;

  let translation = null;
  if (language_id) {
    translation = await FAQTranslation.findOne({
      faq_id: faq._id,
      language_id,
    });
  }
  if (!translation) {
    translation = await FAQTranslation.findOne({ faq_id: faq._id });
  }

  // All translations for this FAQ
  const translations = await FAQTranslation.find({ faq_id: faq._id });

  return {
    ...faq.toObject(),
    translation,
    translations,
  };
};

export const getFAQsWithPagination = async (
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
      { category: searchRegex },
    ];
  }
  
  if (entity_type) filter.entity_type = entity_type;
  if (entity_id) filter.entity_id = entity_id;

  const [faqs, total] = await Promise.all([
    FAQ.find(filter)
      .populate('created_by')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    FAQ.countDocuments(filter)
  ]);

  // Fetch all translations for all FAQs in one query
  const faqIds = faqs.map((faq: any) => faq._id);
  const allTranslations = await FAQTranslation.find({ faq_id: { $in: faqIds } });

  const faqsWithTranslations = faqs.map((faq: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.faq_id.toString() === faq._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.faq_id.toString() === faq._id.toString());
    }
    
    // All translations for this FAQ
    const translations = allTranslations.filter((t: any) => t.faq_id.toString() === faq._id.toString());
    
    return {
      ...faq.toObject(),
      translation,
      translations,
    };
  });

  return {
    data: faqsWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const updateFAQ = async (id: string, data: Partial<IFAQ>) => {
  return await FAQ.findByIdAndUpdate(id, data, { new: true });
};

export const deleteFAQ = async (id: string) => {
  // Delete all translations first
  await FAQTranslation.deleteMany({ faq_id: id });
  return await FAQ.findByIdAndDelete(id);
};

// FAQ Translation CRUD
export const getFAQTranslations = async (faqId: string) => {
  return await FAQTranslation.find({ faq_id: faqId });
};

export const createFAQTranslation = async (faqId: string, data: any) => {
  // Validate that FAQ exists
  const faq = await FAQ.findById(faqId);
  if (!faq) throw new Error('FAQ not found');

  // Prevent duplicate translation for same FAQ/language
  const exists = await FAQTranslation.findOne({ 
    faq_id: faqId, 
    language_id: data.language_id 
  });
  if (exists) throw new Error('Translation already exists for this language.');

  return await FAQTranslation.create({ ...data, faq_id: faqId });
};

export const updateFAQTranslation = async (translationId: string, data: any) => {
  return await FAQTranslation.findByIdAndUpdate(translationId, data, { new: true });
};

export const deleteFAQTranslation = async (translationId: string) => {
  return await FAQTranslation.findByIdAndDelete(translationId);
}; 