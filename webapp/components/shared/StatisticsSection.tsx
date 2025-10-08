import React from 'react';

interface StatisticsSectionProps {
  stats: { total: number } | null;
  title: string;
}

export function StatisticsSection({ stats, title }: StatisticsSectionProps) {
  if (!stats) return null;

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
        </div>
      )}
    </>
  );
}
