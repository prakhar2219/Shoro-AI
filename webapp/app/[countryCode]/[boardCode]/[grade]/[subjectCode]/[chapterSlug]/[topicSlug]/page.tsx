import { notFound } from 'next/navigation';
import { TopicPageContent } from '@/components/topic/TopicPageContent';

// Force dynamic rendering to avoid build-time API call timeouts
export const dynamic = 'force-dynamic'

// This would typically come from your API
async function getTopicData(params: {
  countryCode: string;
  boardCode: string;
  grade: string;
  subjectCode: string;
  chapterSlug: string;
  topicSlug: string;
}) {
  // Mock data - replace with actual API calls
  return {
    country: { _id: '1', name: 'India', code: params.countryCode },
    board: { _id: '1', name: 'CBSE', short_code: params.boardCode },
    subject: { _id: '1', code: params.subjectCode, name: params.subjectCode },
    chapter: { _id: '1', title: 'Sample Chapter', slug: params.chapterSlug, order: 1 },
    topic: {
      _id: '1',
      title: 'Sample Topic',
      slug: params.topicSlug,
      order: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a sample topic content. Replace this with actual topic data from your API.'
            }
          ]
        }
      ],
      is_published: true,
      createdAt: new Date().toISOString()
    },
    subtopics: [
      {
        _id: '1',
        title: 'Sample Subtopic 1',
        slug: 'sample-subtopic-1',
        order: 1,
        content: [],
        is_published: true
      },
      {
        _id: '2',
        title: 'Sample Subtopic 2',
        slug: 'sample-subtopic-2',
        order: 2,
        content: [],
        is_published: true
      }
    ],
    mcqs: [],
    faqs: [],
    descriptiveQuestions: []
  };
}

export default async function TopicPage({
  params
}: {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
    chapterSlug: string;
    topicSlug: string;
  };
}) {
  try {
    const data = await getTopicData(params);
    
    if (!data.topic) {
      notFound();
    }

    return (
      <TopicPageContent
        country={data.country}
        board={data.board}
        subject={data.subject}
        chapter={data.chapter}
        topic={data.topic}
        subtopics={data.subtopics}
        mcqs={data.mcqs}
        faqs={data.faqs}
        descriptiveQuestions={data.descriptiveQuestions}
        countryCode={params.countryCode}
        boardCode={params.boardCode}
        grade={params.grade}
        subjectCode={params.subjectCode}
        chapterSlug={params.chapterSlug}
      />
    );
  } catch (error) {
    console.error('Error loading topic:', error);
    notFound();
  }
}
