import { getCountry } from '@/lib/api/entities/countries';
import { getBoardsByCountry } from '@/lib/api/entities/boards';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';
import { MCQSection, FAQSection, DescriptiveQuestionSection } from '@/components/content';
import { PageLayout } from '@/components/layout/page-layout';
import { ContentCard } from '@/components/layout/content-card';
import { GridItemCard } from '@/components/layout/grid-item-card';
import { SidebarCard } from '@/components/layout/sidebar-card';
import { EmptyState } from '@/components/layout/empty-state';
import { Globe, Calendar, Languages, BookOpen, ArrowRight, MapPin, Brain, HelpCircle, FileText, Award } from 'lucide-react';

interface CountryPageProps {
  params: {
    countryCode: string;
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { countryCode } = params;

  try {
    const [country, boards] = await Promise.all([
      getCountry(countryCode),
      getBoardsByCountry(countryCode)
    ]);

    if (!country) {
      notFound();
    }

    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: country.name }
    ];

    const stats = [
      { icon: BookOpen, label: `${boards.length} Boards` },
      { icon: Languages, label: 'Multiple Languages' },
      { icon: Calendar, label: `Est. ${new Date(country.createdAt || '').getFullYear()}` }
    ];

    return (
      <PageLayout
        breadcrumbs={breadcrumbs}
        icon={Globe}
        badge={country.code}
        title={country.name}
        description="Comprehensive educational resources and curriculum standards"
        stats={stats}
        sidebar={
          <>
            <SidebarCard
              icon={BookOpen}
              iconColor="purple"
              title="All Available Boards"
              description="Choose your curriculum"
            >
              <div className="space-y-4">
                {boards.map((board: any) => (
                  <GridItemCard
                    key={board._id}
                    href={`/${countryCode}/${board.short_code}`}
                    title={board.name}
                    badge={board.short_code}
                    description={board.description || 'Comprehensive curriculum designed for academic excellence'}
                    metadata={`Est. ${new Date(board.createdAt || '').getFullYear()}`}
                    actionText="View"
                    icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
                  />
                ))}
              </div>
              
              {boards.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No boards available for this country."
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
              icon={Globe}
              iconColor="indigo"
              title="Other Countries"
              description="Explore different regions"
            >
              <EmptyState
                icon={Globe}
                title="More countries coming soon"
                description="Explore educational content from other countries"
              />
            </SidebarCard>
          </>
        }
      >
        {/* Main Content */}
        {/* Country Content */}
        {country.content && country.content.length > 0 && (
          <ContentCard
            icon={BookOpen}
            iconColor="indigo"
            title={`About ${country.name}`}
            description="Educational overview and curriculum standards"
          >
            <div className="prose prose-lg max-w-none">
              <TipTapContentArray content={country.content} />
            </div>
          </ContentCard>
        )}

        {/* Top Boards Section */}
        <ContentCard
          icon={Award}
          iconColor="purple"
          title="Top Educational Boards"
          description="Most popular curriculum boards"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boards.slice(0, 4).map((board: any) => (
              <GridItemCard
                key={board._id}
                href={`/${countryCode}/${board.short_code}`}
                title={board.name}
                badge={board.short_code}
                description={board.description || 'Comprehensive curriculum designed for academic excellence'}
                metadata={`Est. ${new Date(board.createdAt || '').getFullYear()}`}
                actionText="Explore"
                icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
              />
            ))}
          </div>
          
          {boards.length === 0 && (
            <EmptyState
              icon={Award}
              title="No boards available for this country."
            />
          )}
        </ContentCard>

        {/* MCQs Section */}
        <MCQSection 
          entityType="Country"
          entityId={country._id!}
          title="Multiple Choice Questions"
          description="Practice with interactive MCQs"
        />

        {/* FAQs Section */}
        <FAQSection 
          entityType="Country"
          entityId={country._id!}
          title="Frequently Asked Questions"
          description="Common questions and answers"
        />

        {/* Descriptive Questions Section */}
        <DescriptiveQuestionSection 
          entityType="Country"
          entityId={country._id!}
          title="Descriptive Questions"
          description="Detailed answers and explanations"
        />
      </PageLayout>
    );
  } catch (error) {
    notFound();
  }
}