import { notFound } from 'next/navigation';
import { SubjectPageContent } from '@/components/subject/SubjectPageContent';
import { getSubjectDataWithCache } from '@/lib/services/subject.service';

interface SubjectPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
  };
}

// Enable caching for this page
export const revalidate = 3600; // Revalidate every hour

// Generate static params for better performance
export async function generateStaticParams() {
  // This can be extended to pre-generate pages for known country-board-grade-subject combinations
  // For now, we'll let Next.js handle it dynamically
  return [];
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { countryCode, boardCode, grade, subjectCode } = params;

  try {
    // Fetch all data with caching
    const { country, board, subject, chapters, mcqs, faqs, descriptiveQuestions } = await getSubjectDataWithCache(countryCode, boardCode, grade, subjectCode);

    if (!country || !board || !subject) {
      notFound();
    }

    return (
      <SubjectPageContent
        country={country}
        board={board}
        subject={subject}
        chapters={chapters}
        mcqs={mcqs}
        faqs={faqs}
        descriptiveQuestions={descriptiveQuestions}
        countryCode={countryCode}
        boardCode={boardCode}
        grade={grade}
        subjectCode={subjectCode}
      />
    );
  } catch (error) {
    console.error('Error in SubjectPage:', error);
    notFound();
  }
}
