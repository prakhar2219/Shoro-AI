import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="p-4 bg-gray-50 rounded-lg">
        <Icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">{title}</p>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}