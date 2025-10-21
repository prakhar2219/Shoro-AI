import { notFound } from 'next/navigation';
import { SubtopicPageContent } from '@/components/subtopic/SubtopicPageContent';

// Force dynamic rendering to avoid build-time API call timeouts
export const dynamic = 'force-dynamic'

// This would typically come from your API
async function getSubtopicData(params: {
  countryCode: string;
  boardCode: string;
  grade: string;
  subjectCode: string;
  chapterSlug: string;
  topicSlug: string;
  subtopicSlug: string;
}) {
  // Mock data - replace with actual API calls
  return {
    country: { _id: '1', name: 'India', code: params.countryCode },
    board: { _id: '1', name: 'CBSE', short_code: params.boardCode },
    subject: { _id: '1', code: params.subjectCode, name: params.subjectCode },
    chapter: { _id: '1', title: 'Sample Chapter', slug: params.chapterSlug, order: 1 },
    topic: { _id: '1', title: 'Sample Topic', slug: params.topicSlug, order: 1 },
    subtopic: {
      _id: '1',
      title: 'Sample Subtopic',
      slug: params.subtopicSlug,
      order: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a sample subtopic content. Replace this with actual subtopic data from your API.'
            }
          ]
        }
      ],
      is_published: true,
      createdAt: new Date().toISOString()
    },
    mcqs: [],
    faqs: [],
    descriptiveQuestions: []
  };
}

export default async function SubtopicPage({
  params
}: {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
    chapterSlug: string;
    topicSlug: string;
    subtopicSlug: string;
  };
}) {
  try {
    const data = await getSubtopicData(params);
    
    if (!data.subtopic) {
      notFound();
    }

    return (
      <SubtopicPageContent
        country={data.country}
        board={data.board}
        subject={data.subject}
        chapter={data.chapter}
        topic={data.topic}
        subtopic={data.subtopic}
        mcqs={data.mcqs}
        faqs={data.faqs}
        descriptiveQuestions={data.descriptiveQuestions}
        countryCode={params.countryCode}
        boardCode={params.boardCode}
        grade={params.grade}
        subjectCode={params.subjectCode}
        chapterSlug={params.chapterSlug}
        topicSlug={params.topicSlug}
      />
    );
  } catch (error) {
    console.error('Error loading subtopic:', error);
    notFound();
  }
}
