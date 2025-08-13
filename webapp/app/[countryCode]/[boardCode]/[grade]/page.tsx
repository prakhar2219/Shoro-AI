import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getClassesByBoardShortCode } from '@/lib/api/entities/classes';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';
import { MCQSection, FAQSection, DescriptiveQuestionSection } from '@/components/content';
import { PageLayout } from '@/components/layout/page-layout';
import { ContentCard } from '@/components/layout/content-card';
import { GridItemCard } from '@/components/layout/grid-item-card';
import { SidebarCard } from '@/components/layout/sidebar-card';
import { EmptyState } from '@/components/layout/empty-state';
import { BookOpen, GraduationCap, Calendar, Users, ArrowRight, Building2, Brain, HelpCircle, FileText, Globe, Award } from 'lucide-react';

interface ClassPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { countryCode, boardCode, grade } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, classes, subjects] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getClassesByBoardShortCode(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber)
    ]);

    if (!country || !board) {
      notFound();
    }

    const classData = classes.find((cls: any) => cls.grade === gradeNumber);

    if (!country || !board || !classData) {
      notFound();
    }

    return (
      <PageLayout
        breadcrumbs={[
          { label: country.name, href: `/${countryCode}` },
          { label: board.name, href: `/${countryCode}/${boardCode}` },
          { label: `Grade ${gradeNumber}` }
        ]}
        icon={GraduationCap}
        badge={`Grade ${gradeNumber}`}
        title={`Grade ${gradeNumber}`}
        description={classData.description || 'Comprehensive learning program for this grade level'}
        stats={[
          { icon: BookOpen, label: `${subjects.length} Subjects` },
          { icon: Users, label: `Age: ${classData.age_range || 'N/A'}` },
          { icon: Calendar, label: `Est. ${new Date(classData.createdAt || '').getFullYear()}` }
        ]}
        sidebar={
          <>
            <SidebarCard
              icon={BookOpen}
              title="All Available Subjects"
              description="Choose your subject"
              iconColor="purple"
            >
              <div className="space-y-4">
                {subjects.map((subject: any) => (
                  <GridItemCard
                    key={subject._id}
                    href={`/${countryCode}/${boardCode}/${gradeNumber}/${subject.code}`}
                    title={subject.code}
                    badge="Subject"
                    description={`Comprehensive learning program for ${subject.code}`}
                    metadata={`Grade ${gradeNumber}`}
                    actionText="View"
                    icon={subject.code.charAt(0)}
                  />
                ))}
              </div>
              
              {subjects.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No subjects available for this grade."
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
              icon={GraduationCap}
              title="Other Classes"
              description="Explore different grades"
              iconColor="indigo"
            >
              <EmptyState
                icon={GraduationCap}
                title="More classes coming soon"
                description="Explore educational content from other grades"
              />
            </SidebarCard>
          </>
        }
      >
        {/* Class Content */}
        {classData.content && classData.content.length > 0 && (
          <ContentCard
            icon={BookOpen}
            title={`About Grade ${gradeNumber}`}
            description="Learning overview and curriculum structure"
            iconColor="indigo"
          >
            <div className="prose prose-lg max-w-none">
              <TipTapContentArray content={classData.content} />
            </div>
          </ContentCard>
        )}

        {/* MCQs Section */}
        <MCQSection 
          entityType="Class"
          entityId={classData._id!}
          title="Multiple Choice Questions"
          description="Practice with interactive MCQs"
        />

        {/* FAQs Section */}
        <FAQSection 
          entityType="Class"
          entityId={classData._id!}
          title="Frequently Asked Questions"
          description="Common questions and answers"
        />

        {/* Descriptive Questions Section */}
        <DescriptiveQuestionSection 
          entityType="Class"
          entityId={classData._id!}
          title="Descriptive Questions"
          description="Detailed answers and explanations"
        />
      </PageLayout>
    );
  } catch (error) {
    notFound();
  }
}