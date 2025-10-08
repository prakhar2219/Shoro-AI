import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ContentCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ContentCard({
  icon: Icon,
  iconColor = 'indigo',
  title,
  description,
  children,
  className = ''
}: ContentCardProps) {
  const iconColorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    sky: 'bg-sky-100 text-sky-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
      <CardHeader className={description ? 'pb-4' : ''}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${iconColorClasses[iconColor as keyof typeof iconColorClasses] || iconColorClasses.indigo}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className={description ? 'text-2xl' : 'text-xl'}>{title}</CardTitle>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}