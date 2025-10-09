import React from 'react';
import { FileText, BookOpen, Calendar, Users, ArrowLeft, Building2, GraduationCap, Brain, Clock, Eye, HelpCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { ContentCard } from '@/components/layout/content-card';
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
  seo_title?: string;
  seo_description?: string;
  content?: any[];
  version?: number;
  is_published?: boolean;
  createdAt?: string;
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

interface ChapterPageContentProps {
  country: Country;
  board: Board;
  subject: Subject;
  chapter: Chapter;
  mcqs: MCQ[];
  faqs: FAQ[];
  descriptiveQuestions: DescriptiveQuestion[];
  countryCode: string;
  boardCode: string;
  grade: string;
  subjectCode: string;
  chapterSlug: string;
}

export function ChapterPageContent({
  country,
  board,
  subject,
  chapter,
  mcqs,
  faqs,
  descriptiveQuestions,
  countryCode,
  boardCode,
  grade,
  subjectCode,
  chapterSlug
}: ChapterPageContentProps) {
  const gradeNumber = parseInt(grade) || 0;
  
  const breadcrumbs = [
    { label: country.name, href: `/${countryCode}` },
    { label: board.name, href: `/${countryCode}/${boardCode}` },
    { label: `Grade ${gradeNumber}`, href: `/${countryCode}/${boardCode}/${gradeNumber}` },
    { label: subjectCode, href: `/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}` },
    { label: chapter.title, href: '#' }
  ];

  const stats = [
    { icon: GraduationCap, label: `Grade ${gradeNumber}` },
    { icon: Building2, label: board.name },
    { icon: Calendar, label: `Version ${chapter.version || 1}` },
    { icon: Eye, label: chapter.is_published ? 'Published' : 'Draft' }
  ];

  return (
    <PageLayout
      title={`Chapter ${chapter.order}: ${chapter.title}`}
      description={chapter.seo_description || 'Comprehensive learning module with detailed content and exercises'}
      breadcrumbs={breadcrumbs}
      icon={FileText}
      stats={stats}
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
          <ServerTipTapRenderer content={chapter.content} />
        </div>
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
        entityType="chapter"
        entityId={chapter._id}
        entityTitle={chapter.title}
      />
    </PageLayout>
  );
}
