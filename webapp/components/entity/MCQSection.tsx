"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MCQForm } from "./MCQForm";
import { MCQTranslationForm } from "./MCQTranslationForm";
import dynamic from "next/dynamic";

// Dynamically import icons to prevent hydration issues
const Edit = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Edit })), { ssr: false });
const Trash2 = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Trash2 })), { ssr: false });
const Plus = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Plus })), { ssr: false });
const Languages = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Languages })), { ssr: false });
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";
import {
  getMCQs,
  createMCQ,
  updateMCQ,
  deleteMCQ,
  createMCQTranslation,
  updateMCQTranslation,
  deleteMCQTranslation,
  IMCQ,
  IMCQTranslation,
} from "@/lib/api/entities/mcqs";
import { getLanguages } from "@/lib/api/entities/language";
import { ILanguage } from "@/lib/api/entities/language";

interface MCQSectionProps {
  entityType: string;
  entityId: string;
  entityName?: string;
}

export function MCQSection({ entityType, entityId, entityName }: MCQSectionProps) {
  const [mcqs, setMcqs] = useState<IMCQ[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IMCQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IMCQ | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{
    mcq: IMCQ;
    translation?: IMCQTranslation;
  } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{
    mcq: IMCQ;
    translation: IMCQTranslation;
  } | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoading();
  const { toast } = useToast();

  const fetchMCQs = async () => {
    try {
      console.log('Fetching MCQs with:', { entity_type: entityType, entity_id: entityId });
      const result = await getMCQs({ entity_type: entityType, entity_id: entityId });
      console.log('MCQ API response:', result);
      // Ensure we always get an array
      const mcqsData = Array.isArray(result.data) 
        ? result.data 
        : Array.isArray(result) 
        ? result 
        : [];
      
      // Log for debugging if we get unexpected data
      if (!Array.isArray(result.data) && !Array.isArray(result)) {
        console.warn('MCQ API returned non-array data:', result);
      }
      
      setMcqs(mcqsData);
    } catch (error: any) {
      console.error('MCQ fetch error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch MCQs",
        variant: "destructive",
      });
    }
  };

  const fetchLanguages = async () => {
    try {
      const languagesData = await getLanguages();
      setLanguages(languagesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch languages",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMCQs();
    fetchLanguages();
  }, [entityType, entityId]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateMCQ(editing._id, data);
        toast({ title: "Success", description: "MCQ updated successfully." });
      } else {
        await createMCQ({ ...data, entity_type: entityType, entity_id: entityId });
        toast({ title: "Success", description: "MCQ created successfully." });
      }
      setOpenForm(false);
      setEditing(null);
      fetchMCQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save MCQ",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        startLoading();
        await deleteMCQ(deleteTarget._id);
        toast({ title: "Success", description: "MCQ deleted successfully." });
        setDeleteTarget(null);
        fetchMCQs();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete MCQ",
          variant: "destructive",
        });
      } finally {
        stopLoading();
      }
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { mcq, translation } = openTranslationForm;
    try {
      startLoading();
      if (translation && translation._id) {
        await updateMCQTranslation(mcq._id!, translation._id, data);
        toast({ title: "Success", description: "Translation updated." });
      } else {
        await createMCQTranslation(mcq._id!, data);
        toast({ title: "Success", description: "Translation added." });
      }
      setOpenTranslationForm(null);
      fetchMCQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save translation",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const handleDeleteTranslation = async (mcq: IMCQ, translation: IMCQTranslation) => {
    try {
      startLoading();
      await deleteMCQTranslation(mcq._id!, translation._id!);
      toast({ title: "Success", description: "Translation deleted." });
      fetchMCQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete translation",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>MCQs ({mcqs.length})</CardTitle>
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add MCQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit MCQ" : "Create MCQ"} {entityName && `for ${entityName}`}
                </DialogTitle>
              </DialogHeader>
              <MCQForm
                onSubmit={handleCreateOrUpdate}
                loading={isLoading}
                initialData={editing || undefined}
                entityType={entityType}
                entityId={entityId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {mcqs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No MCQs found</p>
        ) : (
          <div className="space-y-3">
            {mcqs.map((mcq) => (
              <div key={mcq._id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{mcq.question}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{mcq.difficulty}</Badge>
                      <div className="flex items-center gap-1">
                        <Languages className="h-3 w-3" />
                        <span className="text-xs">{mcq.translations?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(mcq);
                        setOpenForm(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(mcq)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* MCQ Options */}
                <div className="space-y-1 mb-2">
                  {mcq.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                        option.key === mcq.correct_answer 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.key}
                      </span>
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>

                {/* Translations */}
                {mcq.translations && mcq.translations.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-medium mb-2">Translations</h5>
                    <div className="space-y-2">
                      {mcq.translations.map((translation: IMCQTranslation) => (
                        <div key={translation._id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {languages.find(l => l._id === translation.language_id)?.name || translation.language_id}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTranslation(mcq, translation)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-gray-600">{translation.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Translation Button */}
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenTranslationForm({ mcq })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Translation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MCQ Form Modal */}
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit MCQ" : "Create MCQ"} {entityName && `for ${entityName}`}
              </DialogTitle>
            </DialogHeader>
            <MCQForm
              onSubmit={handleCreateOrUpdate}
              loading={isLoading}
              initialData={editing || undefined}
              entityType={entityType}
              entityId={entityId}
            />
          </DialogContent>
        </Dialog>

        {/* MCQ Translation Form Modal */}
        <Dialog open={!!openTranslationForm} onOpenChange={(open) => !open && setOpenTranslationForm(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Translation</DialogTitle>
            </DialogHeader>
            {openTranslationForm && (
              <MCQTranslationForm
                onSubmit={handleTranslationSubmit}
                loading={isLoading}
                languages={languages}
                originalMCQ={openTranslationForm.mcq}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        {deleteTarget && (
          <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete MCQ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to delete this MCQ? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <Button onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? "Deleting..." : "Delete"}
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
} 