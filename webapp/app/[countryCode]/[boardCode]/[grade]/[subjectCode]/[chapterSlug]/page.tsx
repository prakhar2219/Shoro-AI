import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getChapterBySlug } from '@/lib/api/entities/chapters';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';
import { MCQSection, FAQSection, DescriptiveQuestionSection } from '@/components/content';
import { PageLayout } from '@/components/layout/page-layout';
import { ContentCard } from '@/components/layout/content-card';
import { GridItemCard } from '@/components/layout/grid-item-card';
import { SidebarCard } from '@/components/layout/sidebar-card';
import { EmptyState } from '@/components/layout/empty-state';
import { FileText, BookOpen, Calendar, Users, ArrowLeft, Building2, GraduationCap, Brain, Clock, Eye, HelpCircle } from 'lucide-react';

interface ChapterPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
    chapterSlug: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { countryCode, boardCode, grade, subjectCode, chapterSlug } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, chapter] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getChapterBySlug(boardCode, gradeNumber, subjectCode, chapterSlug)
    ]);

    if (!country || !board || !chapter) {
      notFound();
    }

    return (
      <PageLayout
        title={`Chapter ${chapter.order}: ${chapter.title}`}
        description={chapter.seo_description || 'Comprehensive learning module with detailed content and exercises'}
        breadcrumbs={[
          { label: country.name, href: `/${countryCode}` },
          { label: board.name, href: `/${countryCode}/${boardCode}` },
          { label: `Grade ${gradeNumber}`, href: `/${countryCode}/${boardCode}/${gradeNumber}` },
          { label: subjectCode, href: `/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}` },
          { label: chapter.title, href: '#' }
        ]}
        icon={FileText}
        stats={[
          { icon: GraduationCap, label: `Grade ${gradeNumber}` },
          { icon: Building2, label: board.name },
          { icon: Calendar, label: `Version ${chapter.version || 1}` },
          { icon: Eye, label: chapter.is_published ? 'Published' : 'Draft' }
        ]}
        sidebar={
          <>
            {/* Chapter Info */}
            <SidebarCard
              title="Chapter Info"
              description="Details and metadata"
              icon={FileText}
              iconColor="orange"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chapter Number</span>
                  <span className="text-sm font-medium">{chapter.order}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subject</span>
                  <span className="text-sm font-medium">{subjectCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Board</span>
                  <span className="text-sm font-medium">{board.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Grade</span>
                  <span className="text-sm font-medium">{gradeNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Country</span>
                  <span className="text-sm font-medium">{country.name}</span>
                </div>
                {chapter.seo_title && (
                  <div className="pt-4 border-t">
                    <span className="text-sm text-gray-600 block mb-2">SEO Title</span>
                    <p className="text-sm text-gray-800">{chapter.seo_title}</p>
                  </div>
                )}
                {chapter.seo_description && (
                  <div className="pt-4 border-t">
                    <span className="text-sm text-gray-600 block mb-2">SEO Description</span>
                    <p className="text-sm text-gray-800">{chapter.seo_description}</p>
                  </div>
                )}
              </div>
            </SidebarCard>

            {/* Recent Visits */}
            <SidebarCard
              title="Recent Visits"
              description="Your learning journey"
              icon={Calendar}
              iconColor="sky"
            >
              <EmptyState
                icon={Calendar}
                title="No recent visits"
                description="Start exploring to see your history"
              />
            </SidebarCard>

            {/* Other Chapters */}
            <SidebarCard
              title="Other Chapters"
              description="Explore more content"
              icon={FileText}
              iconColor="orange"
            >
              <EmptyState
                icon={FileText}
                title="More chapters coming soon"
                description="Explore educational content from other chapters"
              />
            </SidebarCard>
          </>
        }
      >
        {/* Chapter Content */}
        <ContentCard
          title={`Chapter ${chapter.order}: ${chapter.title}`}
          description="Comprehensive learning content"
          icon={FileText}
          iconColor="orange"
        >
          <div className="prose prose-lg max-w-none">
            <TipTapContentArray content={chapter.content} />
          </div>
        </ContentCard>

        {/* MCQs Section */}
        <MCQSection
          entityType="Chapter"
          entityId={chapter._id!}
          title="Multiple Choice Questions"
          description="Practice with interactive MCQs"
        />

        {/* FAQs Section */}
        <FAQSection
          entityType="Chapter"
          entityId={chapter._id!}
          title="Frequently Asked Questions"
          description="Common questions and answers"
        />

        {/* Descriptive Questions Section */}
        <DescriptiveQuestionSection
          entityType="Chapter"
          entityId={chapter._id!}
          title="Descriptive Questions"
          description="Detailed answers and explanations"
        />
      </PageLayout>
    );
  } catch (error) {
    notFound();
  }
}