import React from 'react';
import { BookOpen, GraduationCap, Calendar, Users, ArrowRight, Building2, Brain, HelpCircle, FileText, Globe, Award } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { ContentCard } from '@/components/layout/content-card';
import { GridItemCard } from '@/components/layout/grid-item-card';
import { SidebarCard } from '@/components/layout/sidebar-card';
import { EmptyState } from '@/components/layout/empty-state';
import { ServerTipTapRenderer } from '../country/ServerTipTapRenderer';
import { ServerMCQSection } from '../country/ServerMCQSection';
import { ServerFAQSection } from '../country/ServerFAQSection';
import { ServerDescriptiveQuestionSection } from '../country/ServerDescriptiveQuestionSection';
import { RatingSystem } from '../shared/RatingSystem';

interface Chapter {
  _id: string;
  title: string;
  slug: string;
  order: number;
  seo_description?: string;
  content?: any[];
  createdAt?: string;
}

interface Subject {
  _id: string;
  code: string;
  name?: string;
  description?: string;
  content?: any[];
  createdAt?: string;
}

interface Board {
  _id: string;
  name: string;
  short_code: string;
}

interface Country {
  _id: string;
  name: string;
  code: string;
}

interface MCQ {
  _id: string;
  question: string;
  options: Array<{ key: string; text: string }>;
  correct_answer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

interface DescriptiveQuestion {
  _id: string;
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  marks?: number;
  subject?: string;
  topic?: string;
}

interface SubjectPageContentProps {
  country: Country;
  board: Board;
  subject: Subject;
  chapters: Chapter[];
  mcqs: MCQ[];
  faqs: FAQ[];
  descriptiveQuestions: DescriptiveQuestion[];
  countryCode: string;
  boardCode: string;
  grade: string;
  subjectCode: string;
}

export function SubjectPageContent({
  country,
  board,
  subject,
  chapters,
  mcqs,
  faqs,
  descriptiveQuestions,
  countryCode,
  boardCode,
  grade,
  subjectCode
}: SubjectPageContentProps) {
  const gradeNumber = parseInt(grade) || 0;
  
  const breadcrumbs = [
    { label: country.name, href: `/${countryCode}` },
    { label: board.name, href: `/${countryCode}/${boardCode}` },
    { label: `Grade ${gradeNumber}`, href: `/${countryCode}/${boardCode}/${gradeNumber}` },
    { label: subject.code }
  ];

  const stats = [
    { icon: FileText, label: `${chapters.length} Chapters` },
    { icon: Users, label: `Grade ${gradeNumber}` },
    { icon: Calendar, label: `Est. ${new Date(subject.createdAt || '').getFullYear()}` }
  ];

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      icon={Brain}
      badge={subject.code}
      title={subject.code}
      description={`${board.name} • Grade ${gradeNumber} • Comprehensive learning journey`}
      stats={stats}
      sidebar={
        <>
          <SidebarCard
            icon={FileText}
            title="All Available Chapters"
            description="Choose your chapter"
            iconColor="purple"
          >
            <div className="space-y-4">
              {chapters.map((chapter) => (
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
            <ServerTipTapRenderer content={subject.content} />
          </div>
        </ContentCard>
      )}

      {/* Top Chapters Section */}
      <ContentCard
        icon={Award}
        iconColor="purple"
        title="Popular Chapters"
        description="Most accessed learning modules"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.slice(0, 4).map((chapter) => (
            <GridItemCard
              key={chapter._id}
              href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapter.slug}`}
              title={chapter.title}
              badge={`Chapter ${chapter.order}`}
              description={chapter.seo_description || 'Comprehensive learning module with detailed content'}
              metadata={subject.code}
              actionText="Explore"
              icon={chapter.order.toString()}
            />
          ))}
        </div>
        
        {chapters.length === 0 && (
          <EmptyState
            icon={Award}
            title="No chapters available for this subject."
          />
        )}
      </ContentCard>

      {/* MCQs Section */}
      <ServerMCQSection 
        mcqs={mcqs}
        title="Multiple Choice Questions"
        description="Practice with interactive MCQs"
      />

      {/* FAQs Section */}
      <ServerFAQSection 
        faqs={faqs}
        title="Frequently Asked Questions"
        description="Common questions and answers"
      />

      {/* Descriptive Questions Section */}
      <ServerDescriptiveQuestionSection 
        questions={descriptiveQuestions}
        title="Descriptive Questions"
        description="Detailed answers and explanations"
      />

      {/* Rating System */}
      <RatingSystem
        entityType="subject"
        entityId={subject._id}
        entityTitle={subject.code}
      />
    </PageLayout>
  );
}
