import React from 'react';
import { FileText, BookOpen, Calendar, Users, ArrowLeft, Building2, GraduationCap, Brain, Clock, Eye, HelpCircle, Target, Zap } from 'lucide-react';
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

interface Subtopic {
  _id: string;
  title: string;
  slug: string;
  order: number;
  content?: any[];
  is_published?: boolean;
  createdAt?: string;
}

interface Topic {
  _id: string;
  title: string;
  slug: string;
  order: number;
}

interface Chapter {
  _id: string;
  title: string;
  slug: string;
  order: number;
}

interface Subject {
  _id: string;
  code: string;
  name?: string;
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

interface SubtopicPageContentProps {
  country: Country;
  board: Board;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  subtopic: Subtopic;
  mcqs: MCQ[];
  faqs: FAQ[];
  descriptiveQuestions: DescriptiveQuestion[];
  countryCode: string;
  boardCode: string;
  grade: string;
  subjectCode: string;
  chapterSlug: string;
  topicSlug: string;
}

export function SubtopicPageContent({
  country,
  board,
  subject,
  chapter,
  topic,
  subtopic,
  mcqs,
  faqs,
  descriptiveQuestions,
  countryCode,
  boardCode,
  grade,
  subjectCode,
  chapterSlug,
  topicSlug
}: SubtopicPageContentProps) {
  const gradeNumber = parseInt(grade) || 0;
  
  const breadcrumbs = [
    { label: country.name, href: `/${countryCode}` },
    { label: board.name, href: `/${countryCode}/${boardCode}` },
    { label: `Grade ${gradeNumber}`, href: `/${countryCode}/${boardCode}/${gradeNumber}` },
    { label: subject.code, href: `/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}` },
    { label: chapter.title, href: `/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapterSlug}` },
    { label: topic.title, href: `/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapterSlug}/${topicSlug}` },
    { label: subtopic.title }
  ];

  const stats = [
    { icon: Zap, label: `Subtopic ${subtopic.order}` },
    { icon: Target, label: topic.title },
    { icon: Calendar, label: `Est. ${new Date(subtopic.createdAt || '').getFullYear()}` }
  ];

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      icon={Zap}
      badge={`Subtopic ${subtopic.order}`}
      title={subtopic.title}
      description={`${topic.title} • ${chapter.title} • ${subject.code} • Grade ${gradeNumber}`}
      stats={stats}
      sidebar={
        <>
          <SidebarCard
            icon={Target}
            title="Parent Topic"
            description="Back to topic overview"
            iconColor="green"
          >
            <GridItemCard
              href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapterSlug}/${topicSlug}`}
              title={topic.title}
              badge={`Topic ${topic.order}`}
              description="View complete topic"
              metadata={chapter.title}
              actionText="View Topic"
              icon={topic.order.toString()}
            />
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
            title="Learning Progress"
            description="Track your understanding"
            iconColor="purple"
          >
            <EmptyState
              icon={Brain}
              title="Progress tracking coming soon"
              description="Monitor your learning journey"
            />
          </SidebarCard>
        </>
      }
    >
      {/* Subtopic Content */}
      {subtopic.content && subtopic.content.length > 0 && (
        <ContentCard
          title={`Subtopic ${subtopic.order}: ${subtopic.title}`}
          description="Detailed learning content"
          icon={Zap}
          iconColor="yellow"
        >
          <div className="prose prose-lg max-w-none">
            <ServerTipTapRenderer content={subtopic.content} />
          </div>
        </ContentCard>
      )}

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
        entityType="subtopic"
        entityId={subtopic._id}
        entityTitle={subtopic.title}
      />
    </PageLayout>
  );
}
