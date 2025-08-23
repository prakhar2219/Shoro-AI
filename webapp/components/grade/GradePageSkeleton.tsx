import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/page-layout';

export function GradePageSkeleton() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: <Skeleton className="h-6 w-24" />, href: '#' },
        { label: <Skeleton className="h-6 w-32" />, href: '#' },
        { label: <Skeleton className="h-6 w-28" /> }
      ]}
      icon={<Skeleton className="h-8 w-8 rounded" />}
      badge={<Skeleton className="h-6 w-20" />}
      title={<Skeleton className="h-8 w-32" />}
      description={<Skeleton className="h-6 w-80" />}
      stats={[
        { icon: <Skeleton className="h-6 w-6" />, label: <Skeleton className="h-5 w-24" /> },
        { icon: <Skeleton className="h-6 w-6" />, label: <Skeleton className="h-5 w-28" /> },
        { icon: <Skeleton className="h-6 w-6" />, label: <Skeleton className="h-5 w-32" /> }
      ]}
      sidebar={
        <>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </>
      }
    >
      {/* Main Content Skeletons */}
      <div className="space-y-8">
        {/* Grade Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Subjects Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
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
