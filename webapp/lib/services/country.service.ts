import { getCountry as getCountryAPI } from '@/lib/api/entities/countries';
import { getBoardsByCountry as getBoardsByCountryAPI } from '@/lib/api/entities/boards';
import { getMCQs } from '@/lib/api/entities/mcqs';
import { getFAQs } from '@/lib/api/entities/faqs';
import { getDescriptiveQuestions } from '@/lib/api/entities/descriptiveQuestions';

export interface CountryData {
  country: any;
  boards: any[];
  mcqs: any[];
  faqs: any[];
  descriptiveQuestions: any[];
}

export async function getCountryData(countryCode: string): Promise<CountryData> {
  try {
    // First get the country to get its ID
    const country = await getCountryAPI(countryCode);
    if (!country || !country._id) {
      throw new Error('Country not found or missing ID');
    }

    // Now fetch all other data using the country's actual ID
    const results = await Promise.allSettled([
      getBoardsByCountryAPI(countryCode),
      getMCQs({ entity_type: 'Country', entity_id: country._id, page: 1, limit: 10 }),
      getFAQs({ entity_type: 'Country', entity_id: country._id, page: 1, limit: 10 }),
      getDescriptiveQuestions({ entity_type: 'Country', entity_id: country._id, page: 1, limit: 10 })
    ]);

    const [boards, mcqs, faqs, descriptiveQuestions] = results.map(result => 
      result.status === 'fulfilled' ? result.value : []
    );

    return {
      country: country || null,
      boards: boards || [],
      mcqs: (mcqs?.data || mcqs || []),
      faqs: (faqs?.data || faqs || []),
      descriptiveQuestions: (descriptiveQuestions?.data || descriptiveQuestions || [])
    };
  } catch (error) {
    console.error('Error fetching country data:', error);
    return {
      country: null,
      boards: [],
      mcqs: [],
      faqs: [],
      descriptiveQuestions: []
    };
  }
}

export async function getCountryDataWithCache(countryCode: string): Promise<CountryData> {
  // This function can be extended with Redis or other caching mechanisms
  // For now, we'll rely on Next.js built-in caching
  return getCountryData(countryCode);
}
