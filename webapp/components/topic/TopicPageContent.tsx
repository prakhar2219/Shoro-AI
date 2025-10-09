import React from 'react';
import { FileText, BookOpen, Calendar, Users, ArrowLeft, Building2, GraduationCap, Brain, Clock, Eye, HelpCircle, Target } from 'lucide-react';
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

interface Topic {
  _id: string;
  title: string;
  slug: string;
  order: number;
  content?: any[];
  is_published?: boolean;
  createdAt?: string;
}

interface Subtopic {
  _id: string;
  title: string;
  slug: string;
  order: number;
  content?: any[];
  is_published?: boolean;
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

interface TopicPageContentProps {
  country: Country;
  board: Board;
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
  subtopics: Subtopic[];
  mcqs: MCQ[];
  faqs: FAQ[];
  descriptiveQuestions: DescriptiveQuestion[];
  countryCode: string;
  boardCode: string;
  grade: string;
  subjectCode: string;
  chapterSlug: string;
}

export function TopicPageContent({
  country,
  board,
  subject,
  chapter,
  topic,
  subtopics,
  mcqs,
  faqs,
  descriptiveQuestions,
  countryCode,
  boardCode,
  grade,
  subjectCode,
  chapterSlug
}: TopicPageContentProps) {
  const gradeNumber = parseInt(grade) || 0;
  
  const breadcrumbs = [
    { label: country.name, href: `/${countryCode}` },
    { label: board.name, href: `/${countryCode}/${boardCode}` },
    { label: `Grade ${gradeNumber}`, href: `/${countryCode}/${boardCode}/${gradeNumber}` },
    { label: subject.code, href: `/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}` },
    { label: chapter.title, href: `/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapterSlug}` },
    { label: topic.title }
  ];

  const stats = [
    { icon: Target, label: `${subtopics.length} Subtopics` },
    { icon: FileText, label: `Topic ${topic.order}` },
    { icon: Calendar, label: `Est. ${new Date(topic.createdAt || '').getFullYear()}` }
  ];

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      icon={Target}
      badge={`Topic ${topic.order}`}
      title={topic.title}
      description={`${chapter.title} • ${subject.code} • Grade ${gradeNumber}`}
      stats={stats}
      sidebar={
        <>
          <SidebarCard
            icon={Target}
            title="All Subtopics"
            description="Explore detailed subtopics"
            iconColor="green"
          >
            <div className="space-y-4">
              {subtopics.map((subtopic) => (
                <GridItemCard
                  key={subtopic._id}
                  href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapterSlug}/${topic.slug}/${subtopic.slug}`}
                  title={subtopic.title}
                  badge={`Subtopic ${subtopic.order}`}
                  description="Detailed learning content"
                  metadata={topic.title}
                  actionText="View"
                  icon={subtopic.order.toString()}
                />
              ))}
            </div>

            {subtopics.length === 0 && (
              <EmptyState
                icon={Target}
                title="No subtopics available for this topic."
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
        </>
      }
    >
      {/* Topic Content */}
      {topic.content && topic.content.length > 0 && (
        <ContentCard
          title={`Topic ${topic.order}: ${topic.title}`}
          description="Comprehensive topic content"
          icon={Target}
          iconColor="green"
        >
          <div className="prose prose-lg max-w-none">
            <ServerTipTapRenderer content={topic.content} />
          </div>
        </ContentCard>
      )}

      {/* Subtopics Section */}
      <ContentCard
        icon={Target}
        iconColor="green"
        title="Subtopics"
        description="Detailed learning modules"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subtopics.map((subtopic) => (
            <GridItemCard
              key={subtopic._id}
              href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapterSlug}/${topic.slug}/${subtopic.slug}`}
              title={subtopic.title}
              badge={`Subtopic ${subtopic.order}`}
              description="Detailed learning content"
              metadata={topic.title}
              actionText="Explore"
              icon={subtopic.order.toString()}
            />
          ))}
        </div>
        
        {subtopics.length === 0 && (
          <EmptyState
            icon={Target}
            title="No subtopics available for this topic."
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
        entityType="topic"
        entityId={topic._id}
        entityTitle={topic.title}
      />
    </PageLayout>
  );
}
