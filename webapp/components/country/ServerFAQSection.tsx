import React from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ContentCard } from '@/components/layout/content-card';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

interface ServerFAQSectionProps {
  faqs: FAQ[];
  title: string;
  description: string;
}

export function ServerFAQSection({ faqs, title, description }: ServerFAQSectionProps) {
  if (!faqs || faqs.length === 0) {
    return (
      <ContentCard
        icon={HelpCircle}
        iconColor="orange"
        title={title}
        description={description}
      >
        <div className="text-center py-8">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No FAQs available at the moment.</p>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard
      icon={HelpCircle}
      iconColor="orange"
      title={title}
      description={description}
    >
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq._id} className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-relaxed">
                    {faq.question}
                  </h3>
                  
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                  
                  {faq.category && (
                    <div className="mt-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {faq.category}
                      </span>
                    </div>
                  )}
                  
                  {faq.tags && faq.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {faq.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Total FAQs: {faqs.length}
        </p>
      </div>
    </ContentCard>
  );
}
