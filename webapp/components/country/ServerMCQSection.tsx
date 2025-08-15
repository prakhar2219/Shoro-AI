import React from 'react';
import { Brain, CheckCircle, XCircle } from 'lucide-react';
import { ContentCard } from '@/components/layout/content-card';

interface MCQ {
  _id: string;
  question: string;
  options: Array<{ key: string; text: string }>;
  correct_answer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ServerMCQSectionProps {
  mcqs: MCQ[];
  title: string;
  description: string;
}

export function ServerMCQSection({ mcqs, title, description }: ServerMCQSectionProps) {
  if (!mcqs || mcqs.length === 0) {
    return (
      <ContentCard
        icon={Brain}
        iconColor="blue"
        title={title}
        description={description}
      >
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No MCQs available at the moment.</p>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard
      icon={Brain}
      iconColor="blue"
      title={title}
      description={description}
    >
      <div className="space-y-6">
        {mcqs.map((mcq, index) => (
          <div key={mcq._id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Question {index + 1}
              </h3>
              {mcq.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  mcq.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  mcq.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {mcq.difficulty.charAt(0).toUpperCase() + mcq.difficulty.slice(1)}
                </span>
              )}
            </div>
            
            <p className="text-gray-800 mb-4 text-base leading-relaxed">
              {mcq.question}
            </p>
            
            <div className="space-y-3 mb-4">
              {mcq.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                    option.key === mcq.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    option.key === mcq.correct_answer
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {option.key === mcq.correct_answer && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    option.key === mcq.correct_answer
                      ? 'text-green-800 font-medium'
                      : 'text-gray-700'
                  }`}>
                    {option.text}
                  </span>
                  {option.key === mcq.correct_answer && (
                    <span className="ml-auto text-green-600 font-medium text-sm">
                      Correct Answer
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {mcq.explanation && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {mcq.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Total Questions: {mcqs.length}
        </p>
      </div>
    </ContentCard>
  );
}
