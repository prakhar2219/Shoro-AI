import { notFound } from 'next/navigation';
import { GradePageContent } from '@/components/grade/GradePageContent';
import { getGradeDataWithCache } from '@/lib/services/grade.service';

interface ClassPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
  };
}

// Enable caching for this page
export const revalidate = 3600; // Revalidate every hour

// Generate static params for better performance
export async function generateStaticParams() {
  // This can be extended to pre-generate pages for known country-board-grade combinations
  // For now, we'll let Next.js handle it dynamically
  return [];
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { countryCode, boardCode, grade } = params;

  try {
    // Fetch all data with caching
    const { country, board, classData, subjects, mcqs, faqs, descriptiveQuestions } = await getGradeDataWithCache(countryCode, boardCode, grade);

    if (!country || !board || !classData) {
      notFound();
    }

    return (
      <GradePageContent
        country={country}
        board={board}
        classData={classData}
        subjects={subjects}
        mcqs={mcqs}
        faqs={faqs}
        descriptiveQuestions={descriptiveQuestions}
        countryCode={countryCode}
        boardCode={boardCode}
        grade={grade}
      />
    );
  } catch (error) {
    console.error('Error in ClassPage:', error);
    notFound();
  }
}
