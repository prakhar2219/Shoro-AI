'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getFAQs, IFAQ } from '@/lib/api/entities/faqs';

interface FAQSectionProps {
  entityType: string;
  entityId: string;
  title?: string;
  description?: string;
  className?: string;
}

export function FAQSection({ 
  entityType, 
  entityId, 
  title = "Frequently Asked Questions",
  description = "Common questions and answers",
  className = ""
}: FAQSectionProps) {
  const [faqs, setFaqs] = useState<IFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFAQs();
  }, [entityType, entityId]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await getFAQs({
        entity_type: entityType,
        entity_id: entityId,
        page: 1,
        limit: 50 // Get all FAQs for this entity
      });

      const faqsData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response) 
        ? response 
        : [];
      
      // Log for debugging if we get unexpected data
      if (!Array.isArray(response.data) && !Array.isArray(response)) {
        console.warn('FAQ API returned non-array data:', response);
      }
      
      setFaqs(faqsData);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'general': 'bg-blue-100 text-blue-800',
      'technical': 'bg-purple-100 text-purple-800',
      'academic': 'bg-green-100 text-green-800',
      'curriculum': 'bg-orange-100 text-orange-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  if (loading) {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <HelpCircle className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading FAQs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (faqs.length === 0) {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <HelpCircle className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No FAQs available yet</p>
            <p className="text-sm text-gray-400 mt-2">Common questions will be added soon</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <HelpCircle className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq._id} className="border border-gray-200 rounded-lg bg-white/60">
              <button
                onClick={() => toggleFAQ(faq._id!)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                    {faq.category && (
                      <Badge variant="outline" className={getCategoryColor(faq.category)}>
                        {faq.category}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                </div>
                <div className="ml-4">
                  {expandedFaqs[faq._id!] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {expandedFaqs[faq._id!] && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-500">Answer</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 