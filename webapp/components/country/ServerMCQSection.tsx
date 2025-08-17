import React from "react";
import { Brain } from "lucide-react";
import { ContentCard } from "@/components/layout/content-card";
import { QuestionCard } from "./QuestionCard";
import { ServerMCQSectionProps } from "./types";

export function ServerMCQSection({
  mcqs,
  title,
  description,
}: ServerMCQSectionProps) {
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
          <QuestionCard key={mcq._id} mcq={mcq} index={index} />
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">Total Questions: {mcqs.length}</p>
      </div>
    </ContentCard>
  );
}
