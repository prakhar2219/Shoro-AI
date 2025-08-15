import React from 'react';
import { FileText, BookOpen, Clock, Star } from 'lucide-react';
import { ContentCard } from '@/components/layout/content-card';
import { ServerTipTapRenderer } from './ServerTipTapRenderer';

interface DescriptiveQuestion {
  _id: string;
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number; // in minutes
  marks?: number;
  subject?: string;
  topic?: string;
}

interface ServerDescriptiveQuestionSectionProps {
  questions: DescriptiveQuestion[];
  title: string;
  description: string;
}

export function ServerDescriptiveQuestionSection({ 
  questions, 
  title, 
  description 
}: ServerDescriptiveQuestionSectionProps) {
  if (!questions || questions.length === 0) {
    return (
      <ContentCard
        icon={FileText}
        iconColor="green"
        title={title}
        description={description}
      >
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No descriptive questions available at the moment.</p>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard
      icon={FileText}
      iconColor="green"
      title={title}
      description={description}
    >
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question._id} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
            {/* Question Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {index + 1}
                </h3>
                <div className="flex items-center gap-3">
                  {question.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                  )}
                  {question.marks && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {question.marks} marks
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {question.estimatedTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{question.estimatedTime} min</span>
                  </div>
                )}
                {question.subject && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{question.subject}</span>
                  </div>
                )}
                {question.topic && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{question.topic}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Question Content */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Question:</h4>
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                  {question.question}
                </div>
              </div>
              
              {/* Answer Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Answer:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {typeof question.answer === 'string' ? (
                    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                      {question.answer}
                    </div>
                  ) : (
                    <ServerTipTapRenderer content={question.answer} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Total Questions: {questions.length}
        </p>
      </div>
    </ContentCard>
  );
}
