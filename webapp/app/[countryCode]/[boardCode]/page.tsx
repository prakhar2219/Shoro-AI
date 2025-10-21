import { notFound } from 'next/navigation';
import { BoardPageContent } from '@/components/board/BoardPageContent';
import { getBoardDataWithCache } from '@/lib/services/board.service';

interface BoardPageProps {
  params: {
    countryCode: string;
    boardCode: string;
  };
}

// Force dynamic rendering to avoid build-time API call timeouts
export const dynamic = 'force-dynamic'
export const revalidate = 3600; // Revalidate every hour

// Generate static params for better performance
export async function generateStaticParams() {
  // This can be extended to pre-generate pages for known country-board combinations
  // For now, we'll let Next.js handle it dynamically
  return [];
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { countryCode, boardCode } = params;

  try {
    // Fetch all data with caching
    const { country, board, classes, mcqs, faqs, descriptiveQuestions } = await getBoardDataWithCache(countryCode, boardCode);

    if (!country || !board) {
      notFound();
    }

    return (
      <BoardPageContent
        country={country}
        board={board}
        classes={classes}
        mcqs={mcqs}
        faqs={faqs}
        descriptiveQuestions={descriptiveQuestions}
        countryCode={countryCode}
        boardCode={boardCode}
      />
    );
  } catch (error) {
    console.error('Error in BoardPage:', error);
    notFound();
  }
}