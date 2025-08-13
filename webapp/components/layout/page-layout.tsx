import { ReactNode } from 'react';
import { PageHero } from './page-hero';
import { LucideIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  icon: LucideIcon;
  badge?: string;
  title: string;
  description: string;
  stats?: {
    icon: LucideIcon;
    label: string;
  }[];
  logoUrl?: string;
  children: ReactNode;
  sidebar?: ReactNode;
}

export function PageLayout({
  breadcrumbs,
  icon,
  badge,
  title,
  description,
  stats,
  logoUrl,
  children,
  sidebar
}: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <PageHero
        breadcrumbs={breadcrumbs}
        icon={icon}
        badge={badge}
        title={title}
        description={description}
        stats={stats}
        logoUrl={logoUrl}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {children}
          </div>

          {/* Sidebar */}
          {sidebar && (
            <div className="space-y-6">
              {sidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}