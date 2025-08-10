'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ChevronRight, Loader2 } from 'lucide-react';
import { getMCQs, IMCQ } from '@/lib/api/entities/mcqs';

interface MCQSectionProps {
  entityType: string;
  entityId: string;
  title?: string;
  description?: string;
  maxInitial?: number;
  showLoadMore?: boolean;
  className?: string;
}

export function MCQSection({ 
  entityType, 
  entityId, 
  title = "Multiple Choice Questions",
  description = "Practice with interactive MCQs",
  maxInitial = 5,
  showLoadMore = true,
  className = ""
}: MCQSectionProps) {
  const [mcqs, setMcqs] = useState<IMCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMCQs();
  }, [entityType, entityId]);

  const fetchMCQs = async (pageNum = 1, append = false) => {
    try {
      const isInitialLoad = pageNum === 1;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getMCQs({
        entity_type: entityType,
        entity_id: entityId,
        page: pageNum,
        limit: maxInitial
      });

      const newMcqs = response.data || response || [];
      
      if (append) {
        setMcqs(prev => [...prev, ...newMcqs]);
      } else {
        setMcqs(newMcqs);
      }

      setHasMore(newMcqs.length === maxInitial);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchMCQs(page + 1, true);
  };

  const handleAnswerSelect = (mcqId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [mcqId]: answer
    }));
  };

  const handleSubmitAnswer = (mcqId: string) => {
    setShowResults(prev => ({
      ...prev,
      [mcqId]: true
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

  const isCorrectAnswer = (mcq: IMCQ, selectedAnswer: string) => {
    return selectedAnswer === mcq.correct_answer;
  };

  if (loading) {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Brain className="h-5 w-5 text-emerald-600" />
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
            <p className="text-gray-500">Loading MCQs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mcqs.length === 0) {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Brain className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No MCQs available yet</p>
            <p className="text-sm text-gray-400 mt-2">Practice questions will be added soon</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Brain className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {mcqs.map((mcq, index) => (
          <div key={mcq._id} className="border border-gray-200 rounded-lg p-6 bg-white/60">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                  <Badge variant="outline" className={getDifficultyColor(mcq.difficulty)}>
                    {mcq.difficulty}
                  </Badge>
                  {mcq.tags && mcq.tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {mcq.tags[0]}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{mcq.question}</h3>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {mcq.options.map((option) => {
                const isSelected = selectedAnswers[mcq._id!] === option.key;
                const isAnswered = showResults[mcq._id!];
                const isCorrect = isAnswered && option.key === mcq.correct_answer;
                const isWrong = isAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={option.key}
                    onClick={() => !isAnswered && handleAnswerSelect(mcq._id!, option.key)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : isWrong
                          ? 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : isCorrect && isAnswered
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${isAnswered ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? isCorrect
                            ? 'border-green-500 bg-green-500 text-white'
                            : isWrong
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-blue-500 bg-blue-500 text-white'
                          : isCorrect && isAnswered
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {isSelected || (isCorrect && isAnswered) ? (
                          <ChevronRight className="h-3 w-3" />
                        ) : (
                          <span className="text-xs font-medium">{option.key}</span>
                        )}
                      </div>
                      <span className="flex-1">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {!showResults[mcq._id!] && selectedAnswers[mcq._id!] && (
              <Button
                onClick={() => handleSubmitAnswer(mcq._id!)}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Submit Answer
              </Button>
            )}

            {showResults[mcq._id!] && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  {isCorrectAnswer(mcq, selectedAnswers[mcq._id!]) ? (
                    <Badge className="bg-green-100 text-green-800">Correct!</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Incorrect</Badge>
                  )}
                </div>
                {mcq.explanation && (
                  <p className="text-gray-700 text-sm">
                    <strong>Explanation:</strong> {mcq.explanation}
                  </p>
                )}
              </div>
            )}
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
                  Load More MCQs
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