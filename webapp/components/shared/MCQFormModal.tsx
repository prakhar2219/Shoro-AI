"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MCQForm } from "@/components/entity/MCQForm";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";
import { createMCQ, IMCQ } from "@/lib/api/entities/mcqs";

interface MCQFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  entityName?: string;
  onSuccess?: () => void;
}

export function MCQFormModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  onSuccess,
}: MCQFormModalProps) {
  const { toast } = useToast();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleSubmit = async (data: any) => {
    try {
      startLoading();
      const mcqData = {
        ...data,
        entity_type: entityType,
        entity_id: entityId,
      };
      
      await createMCQ(mcqData);
      toast({
        title: "Success",
        description: "MCQ created successfully.",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create MCQ",
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
            Add MCQ {entityName && `for ${entityName}`}
          </DialogTitle>
        </DialogHeader>
        <MCQForm
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