import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getChaptersByBoardClassAndSubject } from '@/lib/api/entities/chapters';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';
import { MCQSection, FAQSection, DescriptiveQuestionSection } from '@/components/content';
import { PageLayout } from '@/components/layout/page-layout';
import { ContentCard } from '@/components/layout/content-card';
import { GridItemCard } from '@/components/layout/grid-item-card';
import { SidebarCard } from '@/components/layout/sidebar-card';
import { EmptyState } from '@/components/layout/empty-state';
import { BookOpen, GraduationCap, Calendar, Users, ArrowRight, Building2, Brain, HelpCircle, FileText, Globe, Award } from 'lucide-react';

interface SubjectPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { countryCode, boardCode, grade, subjectCode } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, subjects, chapters] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getChaptersByBoardClassAndSubject(boardCode, gradeNumber, subjectCode)
    ]);

    if (!country || !board) {
      notFound();
    }

    // Find the subject by code from the subjects list
    const subject = subjects.find((s: any) => s.code === subjectCode);
    if (!subject) {
      notFound();
    }

    return (
      <PageLayout
        breadcrumbs={[
          { label: country.name, href: `/${countryCode}` },
          { label: board.name, href: `/${countryCode}/${boardCode}` },
          { label: `Grade ${gradeNumber}`, href: `/${countryCode}/${boardCode}/${gradeNumber}` },
          { label: subject.code }
        ]}
        icon={Brain}
        badge={subject.code}
        title={subject.code}
        description={`${board.name} • Grade ${gradeNumber} • Comprehensive learning journey`}
        stats={[
          { icon: FileText, label: `${chapters.length} Chapters` },
          { icon: Users, label: `Grade ${gradeNumber}` },
          { icon: Calendar, label: `Est. ${new Date(subject.createdAt || '').getFullYear()}` }
        ]}
        sidebar={
          <>
            <SidebarCard
              icon={FileText}
              title="All Available Chapters"
              description="Choose your chapter"
              iconColor="purple"
            >
              <div className="space-y-4">
                {chapters.map((chapter: any) => (
                  <GridItemCard
                    key={chapter._id}
                    href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapter.slug}`}
                    title={chapter.title}
                    badge={`Chapter ${chapter.order}`}
                    description={chapter.seo_description || 'Comprehensive learning module with detailed content'}
                    metadata={subject.code}
                    actionText="View"
                    icon={chapter.order.toString()}
                  />
                ))}
              </div>

              {chapters.length === 0 && (
                <EmptyState
                  icon={FileText}
                  title="No chapters available for this subject."
                />
              )}
            </SidebarCard>

            <SidebarCard
              icon={Calendar}
              title="Recent Visits"
              description="Your learning journey"
              iconColor="sky"
            >
              <EmptyState
                icon={Calendar}
                title="No recent visits"
                description="Start exploring to see your history"
              />
            </SidebarCard>

            <SidebarCard
              icon={Brain}
              title="Other Subjects"
              description="Explore different subjects"
              iconColor="indigo"
            >
              <EmptyState
                icon={Brain}
                title="More subjects coming soon"
                description="Explore educational content from other subjects"
              />
            </SidebarCard>
          </>
        }
      >
        {/* Subject Content */}
        {subject.content && subject.content.length > 0 && (
          <ContentCard
            icon={BookOpen}
            title={`About ${subject.code}`}
            description="Subject overview and learning objectives"
            iconColor="indigo"
          >
            <div className="prose prose-lg max-w-none">
              <TipTapContentArray content={subject.content} />
            </div>
          </ContentCard>
        )}

        {/* MCQs Section */}
        <MCQSection
          entityType="Subject"
          entityId={subject._id!}
          title="Multiple Choice Questions"
          description="Practice with interactive MCQs"
        />

        {/* FAQs Section */}
        <FAQSection
          entityType="Subject"
          entityId={subject._id!}
          title="Frequently Asked Questions"
          description="Common questions and answers"
        />

        {/* Descriptive Questions Section */}
        <DescriptiveQuestionSection
          entityType="Subject"
          entityId={subject._id!}
          title="Descriptive Questions"
          description="Detailed answers and explanations"
        />
      </PageLayout>
    );
  } catch (error) {
    notFound();
  }
}