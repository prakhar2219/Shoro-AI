"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FAQForm } from "@/components/entity/FAQForm";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";
import { createFAQ } from "@/lib/api/entities/faqs";

interface FAQFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  entityName?: string;
  onSuccess?: () => void;
}

export function FAQFormModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  onSuccess,
}: FAQFormModalProps) {
  const { toast } = useToast();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleSubmit = async (data: any) => {
    try {
      startLoading();
      const faqData = {
        ...data,
        entity_type: entityType,
        entity_id: entityId,
      };
      
      await createFAQ(faqData);
      toast({
        title: "Success",
        description: "FAQ created successfully.",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create FAQ",
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
            Add FAQ {entityName && `for ${entityName}`}
          </DialogTitle>
        </DialogHeader>
        <FAQForm
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