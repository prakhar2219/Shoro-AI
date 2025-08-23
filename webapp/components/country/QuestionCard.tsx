"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { MCQ } from "./types";

interface QuestionCardProps {
  mcq: MCQ;
  index: number;
}

export function QuestionCard({ mcq, index }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Question {index + 1}
        </h3>
        {mcq.difficulty && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              mcq.difficulty === "easy"
                ? "bg-green-100 text-green-800"
                : mcq.difficulty === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {mcq.difficulty.charAt(0).toUpperCase() +
              mcq.difficulty.slice(1)}
          </span>
        )}
      </div>

      <p className="text-gray-800 mb-4">{mcq.question}</p>

      <div className="space-y-3">
        {mcq.options.map((option) => {
          const isCorrect = option.key === mcq.correct_answer;
          const isSelected = selected === option.key;
          const shouldReveal = selected !== null; // Reveal all options when any option is selected

          return (
            <button
              key={option.key}
              onClick={() => setSelected(option.key)}
              disabled={shouldReveal} // Disable further clicks after selection
              className={`flex w-full items-center p-3 rounded-lg border-2 text-left transition-colors ${
                shouldReveal && isCorrect
                  ? "border-green-500 bg-green-50"
                  : isSelected && !isCorrect
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              } ${shouldReveal ? "cursor-default" : "cursor-pointer hover:bg-gray-100"}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                shouldReveal && isCorrect
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300"
              }`}>
                {shouldReveal && isCorrect && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
              
              <span className={`text-sm ${
                shouldReveal && isCorrect
                  ? "text-green-800 font-medium"
                  : isSelected && !isCorrect
                  ? "text-red-800 font-medium"
                  : "text-gray-700"
              }`}>
                {option.text}
              </span>
              
              {shouldReveal && isCorrect && (
                <span className="ml-auto text-green-600 font-medium text-sm">
                  Correct Answer
                </span>
              )}
              {isSelected && !isCorrect && (
                <XCircle className="ml-auto w-4 h-4 text-red-600" />
              )}
            </button>
          );
        })}
      </div>

      {mcq.explanation && selected && (
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
          <p className="text-blue-800 text-sm leading-relaxed">
            {mcq.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
