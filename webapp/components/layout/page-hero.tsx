import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
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
}

export function PageHero({
  breadcrumbs,
  icon: Icon,
  badge,
  title,
  description,
  stats = [],
  logoUrl
}: PageHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient and Effects */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-indigo-200 to-purple-100" />
      
      <div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle at center, #38bdf8, #6366f1)",
        }}
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle at center, #a855f7, #f472b6)",
        }}
      />

      {/* Content */}
      <div className="py-16 md:py-20 px-4 max-w-6xl mx-auto relative z-10">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              {item.href ? (
                <Link href={item.href} className="hover:text-blue-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-800">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </div>
          ))}
        </div>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon className="h-8 w-8 text-gray-800" />
            </div>
            {badge && (
              <Badge variant="secondary" className="bg-white/20 text-gray-800 border-white/30">
                {badge}
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 mb-8">
            {description}
          </p>
          
          {stats.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <stat.icon className="h-4 w-4" />
                  <span>{stat.label}</span>
                </div>
              ))}
              {logoUrl && (
                <div className="flex items-center space-x-2">
                  <img 
                    src={logoUrl} 
                    alt="Logo"
                    className="w-6 h-6 object-contain bg-white/20 rounded"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}