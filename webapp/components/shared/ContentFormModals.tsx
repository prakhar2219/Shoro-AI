import React from 'react';
import { MCQFormModal } from './MCQFormModal';
import { FAQFormModal } from './FAQFormModal';
import { DescriptiveQuestionFormModal } from './DescriptiveQuestionFormModal';

interface ContentFormModalsProps {
  selectedEntity: { id: string; name: string } | null;
  openMCQModal: boolean;
  setOpenMCQModal: (open: boolean) => void;
  openFAQModal: boolean;
  setOpenFAQModal: (open: boolean) => void;
  openDescriptiveQuestionModal: boolean;
  setOpenDescriptiveQuestionModal: (open: boolean) => void;
  entityType: string;
}

export function ContentFormModals({
  selectedEntity,
  openMCQModal,
  setOpenMCQModal,
  openFAQModal,
  setOpenFAQModal,
  openDescriptiveQuestionModal,
  setOpenDescriptiveQuestionModal,
  entityType
}: ContentFormModalsProps) {
  if (!selectedEntity) return null;

  return (
    <>
      <MCQFormModal
        open={openMCQModal}
        onOpenChange={setOpenMCQModal}
        entityType={entityType}
        entityId={selectedEntity.id}
        entityName={selectedEntity.name}
        onSuccess={() => {
          // Optionally refresh data or show success message
        }}
      />
      <FAQFormModal
        open={openFAQModal}
        onOpenChange={setOpenFAQModal}
        entityType={entityType}
        entityId={selectedEntity.id}
        entityName={selectedEntity.name}
        onSuccess={() => {
          // Optionally refresh data or show success message
        }}
      />
      <DescriptiveQuestionFormModal
        open={openDescriptiveQuestionModal}
        onOpenChange={setOpenDescriptiveQuestionModal}
        entityType={entityType}
        entityId={selectedEntity.id}
        entityName={selectedEntity.name}
        onSuccess={() => {
          // Optionally refresh data or show success message
        }}
      />
    </>
  );
}
