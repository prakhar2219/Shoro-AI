'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { getDescriptiveQuestions, IDescriptiveQuestion } from '@/lib/api/entities/descriptiveQuestions';

interface DescriptiveQuestionSectionProps {
  entityType: string;
  entityId: string;
  title?: string;
  description?: string;
  maxInitial?: number;
  showLoadMore?: boolean;
  className?: string;
}

export function DescriptiveQuestionSection({ 
  entityType, 
  entityId, 
  title = "Descriptive Questions",
  description = "Detailed answers and explanations",
  maxInitial = 5,
  showLoadMore = true,
  className = ""
}: DescriptiveQuestionSectionProps) {
  const [questions, setQuestions] = useState<IDescriptiveQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchQuestions();
  }, [entityType, entityId]);

  const fetchQuestions = async (pageNum = 1, append = false) => {
    try {
      const isInitialLoad = pageNum === 1;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getDescriptiveQuestions({
        entity_type: entityType,
        entity_id: entityId,
        page: pageNum,
        limit: maxInitial
      });

      // Ensure we always get an array
      const newQuestions = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response) 
        ? response 
        : [];
      
      // Log for debugging if we get unexpected data
      if (!Array.isArray(response.data) && !Array.isArray(response)) {
        console.warn('Descriptive Question API returned non-array data:', response);
      }
      
      if (append) {
        setQuestions(prev => [...prev, ...newQuestions]);
      } else {
        setQuestions(newQuestions);
      }

      setHasMore(newQuestions.length === maxInitial);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching descriptive questions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchQuestions(page + 1, true);
  };

  const toggleAnswer = (questionId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600" />
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
            <p className="text-gray-500">Loading descriptive questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No descriptive questions available yet</p>
            <p className="text-sm text-gray-400 mt-2">Detailed questions will be added soon</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => (
          <div key={question._id} className="border border-gray-200 rounded-lg p-6 bg-white/60">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                  <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  {question.tags && question.tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {question.tags[0]}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.question}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => toggleAnswer(question._id!)}
                variant="outline"
                className="w-full justify-between"
              >
                <span>
                  {showAnswers[question._id!] ? 'Hide Answer' : 'Show Answer'}
                </span>
                {showAnswers[question._id!] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>

              {showAnswers[question._id!] && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-gray-500">Answer</span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {question.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {showLoadMore && hasMore && (
          <div className="text-center pt-4">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="w-full"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More Questions
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 