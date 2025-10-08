import { notFound } from 'next/navigation';
import { CountryPageContent } from '@/components/country/CountryPageContent';
import { getCountryDataWithCache } from '@/lib/services/country.service';

interface CountryPageProps {
  params: {
    countryCode: string;
  };
}

// Enable caching for this page
export const revalidate = 3600; // Revalidate every hour

// Generate static params for better performance
export async function generateStaticParams() {
  // This can be extended to pre-generate pages for known countries
  // For now, we'll let Next.js handle it dynamically
  return [];
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { countryCode } = params;

  try {
    // Fetch all data with caching
    const { country, boards, mcqs, faqs, descriptiveQuestions } = await getCountryDataWithCache(countryCode);

    if (!country) {
      notFound();
    }

    return (
      <CountryPageContent
        country={country}
        boards={boards}
        mcqs={mcqs}
        faqs={faqs}
        descriptiveQuestions={descriptiveQuestions}
        countryCode={countryCode}
      />
    );
  } catch (error) {
    console.error('Error in CountryPage:', error);
    notFound();
  }
}