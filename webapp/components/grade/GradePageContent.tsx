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

interface Subject {
  _id: string;
  code: string;
  name?: string;
  description?: string;
  createdAt?: string;
}

interface Class {
  _id: string;
  grade: number;
  description?: string;
  content?: any[];
  age_range?: string;
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

interface GradePageContentProps {
  country: Country;
  board: Board;
  classData: Class;
  subjects: Subject[];
  mcqs: MCQ[];
  faqs: FAQ[];
  descriptiveQuestions: DescriptiveQuestion[];
  countryCode: string;
  boardCode: string;
  grade: string;
}

export function GradePageContent({
  country,
  board,
  classData,
  subjects,
  mcqs,
  faqs,
  descriptiveQuestions,
  countryCode,
  boardCode,
  grade
}: GradePageContentProps) {
  const gradeNumber = parseInt(grade) || 0;
  
  const breadcrumbs = [
    { label: country.name, href: `/${countryCode}` },
    { label: board.name, href: `/${countryCode}/${boardCode}` },
    { label: `Grade ${gradeNumber}` }
  ];

  const stats = [
    { icon: BookOpen, label: `${subjects.length} Subjects` },
    { icon: Users, label: `Age: ${classData.age_range || 'N/A'}` },
    { icon: Calendar, label: `Est. ${new Date(classData.createdAt || '').getFullYear()}` }
  ];

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      icon={GraduationCap}
      badge={`Grade ${gradeNumber}`}
      title={`Grade ${gradeNumber}`}
      description={classData.description || 'Comprehensive learning program for this grade level'}
      stats={stats}
      sidebar={
        <>
          <SidebarCard
            icon={BookOpen}
            title="All Available Subjects"
            description="Choose your subject"
            iconColor="purple"
          >
            <div className="space-y-4">
              {subjects.map((subject) => (
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
            <ServerTipTapRenderer content={classData.content} />
          </div>
        </ContentCard>
      )}

      {/* Top Subjects Section */}
      <ContentCard
        icon={Award}
        iconColor="purple"
        title="Popular Subjects"
        description="Most accessed subjects for this grade"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.slice(0, 4).map((subject) => (
            <GridItemCard
              key={subject._id}
              href={`/${countryCode}/${boardCode}/${gradeNumber}/${subject.code}`}
              title={subject.code}
              badge="Subject"
              description={`Comprehensive learning program for ${subject.code}`}
              metadata={`Grade ${gradeNumber}`}
              actionText="Explore"
              icon={subject.code.charAt(0)}
            />
          ))}
        </div>
        
        {subjects.length === 0 && (
          <EmptyState
            icon={Award}
            title="No subjects available for this grade."
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
    </PageLayout>
  );
}
