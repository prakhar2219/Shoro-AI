import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface SidebarCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SidebarCard({
  icon: Icon,
  iconColor = 'purple',
  title,
  description,
  children,
  className = ''
}: SidebarCardProps) {
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
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${iconColorClasses[iconColor as keyof typeof iconColorClasses] || iconColorClasses.purple}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-gray-600 text-sm">{description}</p>
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