"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DescriptiveQuestionForm } from "@/components/entity/DescriptiveQuestionForm";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";
import { createDescriptiveQuestion } from "@/lib/api/entities/descriptiveQuestions";

interface DescriptiveQuestionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  entityName?: string;
  onSuccess?: () => void;
}

export function DescriptiveQuestionFormModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  onSuccess,
}: DescriptiveQuestionFormModalProps) {
  const { toast } = useToast();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleSubmit = async (data: any) => {
    try {
      startLoading();
      const questionData = {
        ...data,
        entity_type: entityType,
        entity_id: entityId,
      };
      
      await createDescriptiveQuestion(questionData);
      toast({
        title: "Success",
        description: "Descriptive question created successfully.",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create descriptive question",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Add Descriptive Question {entityName && `for ${entityName}`}
          </DialogTitle>
        </DialogHeader>
        <DescriptiveQuestionForm
          onSubmit={handleSubmit}
          loading={isLoading}
          entityType={entityType}
          entityId={entityId}
          preFilledEntity={{
            entity_type: entityType,
            entity_id: entityId,
            entity_name: entityName,
          }}
        />
      </DialogContent>
    </Dialog>
  );
} 