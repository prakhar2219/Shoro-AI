import { notFound } from 'next/navigation';
import { ChapterPageContent } from '@/components/chapter/ChapterPageContent';
import { getChapterDataWithCache } from '@/lib/services/chapter.service';

interface ChapterPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
    chapterSlug: string;
  };
}

// Enable caching for this page
export const revalidate = 3600; // Revalidate every hour

// Generate static params for better performance
export async function generateStaticParams() {
  // This can be extended to pre-generate pages for known country-board-grade-subject-chapter combinations
  // For now, we'll let Next.js handle it dynamically
  return [];
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { countryCode, boardCode, grade, subjectCode, chapterSlug } = params;

  try {
    // Fetch all data with caching
    const { country, board, subject, chapter, mcqs, faqs, descriptiveQuestions } = await getChapterDataWithCache(countryCode, boardCode, grade, subjectCode, chapterSlug);

    if (!country || !board || !subject || !chapter) {
      notFound();
    }

    return (
      <ChapterPageContent
        country={country}
        board={board}
        subject={subject}
        chapter={chapter}
        mcqs={mcqs}
        faqs={faqs}
        descriptiveQuestions={descriptiveQuestions}
        countryCode={countryCode}
        boardCode={boardCode}
        grade={grade}
        subjectCode={subjectCode}
        chapterSlug={chapterSlug}
      />
    );
  } catch (error) {
    console.error('Error in ChapterPage:', error);
    notFound();
  }
}