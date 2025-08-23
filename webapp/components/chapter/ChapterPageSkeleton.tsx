import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/page-layout';

export function ChapterPageSkeleton() {
  return (
    <PageLayout
      title={<Skeleton className="h-8 w-80" />}
      description={<Skeleton className="h-6 w-96" />}
      breadcrumbs={[
        { label: <Skeleton className="h-6 w-24" />, href: '#' },
        { label: <Skeleton className="h-6 w-32" />, href: '#' },
        { label: <Skeleton className="h-6 w-28" />, href: '#' },
        { label: <Skeleton className="h-6 w-20" />, href: '#' },
        { label: <Skeleton className="h-6 w-36" /> }
      ]}
      icon={<Skeleton className="h-8 w-8 rounded" />}
      stats={[
        { icon: <Skeleton className="h-6 w-6" />, label: <Skeleton className="h-5 w-20" /> },
        { icon: <Skeleton className="h-6 w-6" />, label: <Skeleton className="h-5 w-24" /> },
        { icon: <Skeleton className="h-6 w-6" />, label: <Skeleton className="h-5 w-28" /> },
        { icon: <Skeleton className="h-6 w-6" />, label: <Skeleton className="h-5 w-24" /> }
      ]}
      sidebar={
        <>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </>
      }
    >
      {/* Main Content Skeletons */}
      <div className="space-y-8">
        {/* Chapter Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* MCQs Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>

        {/* FAQs Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-60" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>

        {/* Descriptive Questions Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
