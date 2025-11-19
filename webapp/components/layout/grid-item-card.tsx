import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface GridItemCardProps {
  href: string;
  title: string;
  badge?: string;
  description?: string;
  metadata?: string;
  actionText?: string;
  icon?: ReactNode;
  className?: string;
}

export function GridItemCard({
  href,
  title,
  badge,
  description,
  metadata,
  actionText = 'Explore',
  icon,
  className = ''
}: GridItemCardProps) {
  return (
    <Link href={href}>
      <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-200 bg-white/60 hover:bg-white rounded-lg ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {badge && (
                  <Badge variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                {metadata && <span>{metadata}</span>}
                <div className="flex items-center space-x-1">
                  <span>{actionText}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
            {icon && (
              <div className="ml-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}