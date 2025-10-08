import React from 'react';
import { MCQSection } from '@/components/entity/MCQSection';
import { DescriptiveQuestionSection } from '@/components/entity/DescriptiveQuestionSection';
import { FAQSection } from '@/components/entity/FAQSection';

interface GlobalContentManagementProps {
  entityType: string;
  entityId: string;
  entityName: string;
}

export function GlobalContentManagement({
  entityType,
  entityId,
  entityName
}: GlobalContentManagementProps) {
  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold">Global Content Management</h2>
      
      {/* MCQ Section - Show all MCQs for the entity type */}
      <MCQSection 
        entityType={entityType} 
        entityId={entityId} 
        entityName={entityName} 
      />
      
      {/* Descriptive Questions Section - Show all questions for the entity type */}
      <DescriptiveQuestionSection 
        entityType={entityType} 
        entityId={entityId} 
        entityName={entityName} 
      />
      
      {/* FAQ Section - Show all FAQs for the entity type */}
      <FAQSection 
        entityType={entityType} 
        entityId={entityId} 
        entityName={entityName} 
      />
    </div>
  );
}
