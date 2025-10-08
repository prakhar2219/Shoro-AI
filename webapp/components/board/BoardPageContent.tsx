import React from 'react';
import { BookOpen, GraduationCap, Calendar, Users, Building2, Award } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { ContentCard } from '@/components/layout/content-card';
import { GridItemCard } from '@/components/layout/grid-item-card';
import { SidebarCard } from '@/components/layout/sidebar-card';
import { EmptyState } from '@/components/layout/empty-state';
import { ServerTipTapRenderer } from '../country/ServerTipTapRenderer';
import { ServerMCQSection } from '../country/ServerMCQSection';
import { ServerFAQSection } from '../country/ServerFAQSection';
import { ServerDescriptiveQuestionSection } from '../country/ServerDescriptiveQuestionSection';

interface Class {
  _id: string;
  grade: number;
  description?: string;
  age_range?: string;
  createdAt?: string;
}

interface Board {
  _id: string;
  name: string;
  short_code: string;
  description?: string;
  content?: any[];
  logo_url?: string;
  createdAt?: string;
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

interface BoardPageContentProps {
  country: Country;
  board: Board;
  classes: Class[];
  mcqs: MCQ[];
  faqs: FAQ[];
  descriptiveQuestions: DescriptiveQuestion[];
  countryCode: string;
  boardCode: string;
}

export function BoardPageContent({
  country,
  board,
  classes,
  mcqs,
  faqs,
  descriptiveQuestions,
  countryCode,
  boardCode
}: BoardPageContentProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: country.name, href: `/${countryCode}` },
    { label: board.name }
  ];

  const stats = [
    { icon: GraduationCap, label: `${classes.length} Classes` },
    { icon: Users, label: `Est. ${new Date(board.createdAt || '').getFullYear()}` }
  ];

  return (
    <PageLayout
      breadcrumbs={breadcrumbs}
      icon={Building2}
      badge={board.short_code}
      title={board.name}
      description={board.description || 'Comprehensive curriculum designed for academic excellence'}
      stats={stats}
      logoUrl={board.logo_url}
      sidebar={
        <>
          <SidebarCard
            icon={GraduationCap}
            iconColor="purple"
            title="All Available Classes"
            description="Choose your grade level"
          >
            <div className="space-y-4">
              {classes.map((cls) => (
                <GridItemCard
                  key={cls._id}
                  href={`/${countryCode}/${boardCode}/${cls.grade}`}
                  title={`Grade ${cls.grade}`}
                  badge={`Class ${cls.grade}`}
                  description={cls.description || 'Comprehensive learning program for this grade level'}
                  metadata={`Age: ${cls.age_range || 'N/A'}`}
                  actionText="View"
                  icon={<span className="text-indigo-600 font-bold text-lg">{cls.grade}</span>}
                />
              ))}
            </div>
            
            {classes.length === 0 && (
              <EmptyState
                icon={GraduationCap}
                title="No classes available for this board."
              />
            )}
          </SidebarCard>

          <SidebarCard
            icon={Calendar}
            iconColor="sky"
            title="Recent Visits"
            description="Your learning journey"
          >
            <EmptyState
              icon={Calendar}
              title="No recent visits"
              description="Start exploring to see your history"
            />
          </SidebarCard>

          <SidebarCard
            icon={BookOpen}
            iconColor="indigo"
            title="Other Boards"
            description="Explore different curricula"
          >
            <EmptyState
              icon={BookOpen}
              title="More boards coming soon"
              description="Explore educational content from other boards"
            />
          </SidebarCard>
        </>
      }
    >
      {/* Board Content */}
      {board.content && board.content.length > 0 && (
        <ContentCard
          icon={BookOpen}
          iconColor="indigo"
          title={`About ${board.name}`}
          description="Curriculum overview and educational approach"
        >
          <div className="prose prose-lg max-w-none">
            <ServerTipTapRenderer content={board.content} />
          </div>
        </ContentCard>
      )}

      {/* Top Classes Section */}
      <ContentCard
        icon={Award}
        iconColor="purple"
        title="Popular Classes"
        description="Most accessed grade levels"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.slice(0, 4).map((cls) => (
            <GridItemCard
              key={cls._id}
              href={`/${countryCode}/${boardCode}/${cls.grade}`}
              title={`Grade ${cls.grade}`}
              badge={`Class ${cls.grade}`}
              description={cls.description || 'Comprehensive learning program for this grade level'}
              metadata={`Age: ${cls.age_range || 'N/A'}`}
              actionText="Explore"
              icon={<span className="text-indigo-600 font-bold text-lg">{cls.grade}</span>}
            />
          ))}
        </div>
        
        {classes.length === 0 && (
          <EmptyState
            icon={Award}
            title="No classes available for this board."
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
