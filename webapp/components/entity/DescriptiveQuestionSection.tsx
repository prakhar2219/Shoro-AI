"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DescriptiveQuestionForm } from "./DescriptiveQuestionForm";
import { DescriptiveQuestionTranslationForm } from "./DescriptiveQuestionTranslationForm";
import dynamic from "next/dynamic";

// Dynamically import icons to prevent hydration issues
const Edit = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Edit })), { ssr: false });
const Trash2 = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Trash2 })), { ssr: false });
const Plus = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Plus })), { ssr: false });
const Languages = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Languages })), { ssr: false });
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";
import {
  getDescriptiveQuestions,
  createDescriptiveQuestion,
  updateDescriptiveQuestion,
  deleteDescriptiveQuestion,
  createDescriptiveQuestionTranslation,
  updateDescriptiveQuestionTranslation,
  deleteDescriptiveQuestionTranslation,
  IDescriptiveQuestion,
  IDescriptiveQuestionTranslation,
} from "@/lib/api/entities/descriptiveQuestions";
import { getLanguages } from "@/lib/api/entities/language";
import { ILanguage } from "@/lib/api/entities/language";

interface DescriptiveQuestionSectionProps {
  entityType: string;
  entityId: string;
  entityName?: string;
}

export function DescriptiveQuestionSection({ entityType, entityId, entityName }: DescriptiveQuestionSectionProps) {
  const [questions, setQuestions] = useState<IDescriptiveQuestion[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IDescriptiveQuestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IDescriptiveQuestion | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{
    question: IDescriptiveQuestion;
    translation?: IDescriptiveQuestionTranslation;
  } | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoading();
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      console.log('Fetching Descriptive Questions with:', { entity_type: entityType, entity_id: entityId });
      const result = await getDescriptiveQuestions({ entity_type: entityType, entity_id: entityId });
      console.log('Descriptive Question API response:', result);
      // Ensure we always get an array
      const questionsData = Array.isArray(result.data) 
        ? result.data 
        : Array.isArray(result) 
        ? result 
        : [];
      
      // Log for debugging if we get unexpected data
      if (!Array.isArray(result.data) && !Array.isArray(result)) {
        console.warn('Descriptive Question API returned non-array data:', result);
      }
      
      setQuestions(questionsData);
    } catch (error: any) {
      console.error('Descriptive Question fetch error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch questions",
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
    fetchQuestions();
    fetchLanguages();
  }, [entityType, entityId]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateDescriptiveQuestion(editing._id, data);
        toast({ title: "Success", description: "Question updated successfully." });
      } else {
        await createDescriptiveQuestion({ ...data, entity_type: entityType, entity_id: entityId });
        toast({ title: "Success", description: "Question created successfully." });
      }
      setOpenForm(false);
      setEditing(null);
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save question",
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
        await deleteDescriptiveQuestion(deleteTarget._id);
        toast({ title: "Success", description: "Question deleted successfully." });
        setDeleteTarget(null);
        fetchQuestions();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete question",
          variant: "destructive",
        });
      } finally {
        stopLoading();
      }
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { question, translation } = openTranslationForm;
    try {
      startLoading();
      if (translation && translation._id) {
        await updateDescriptiveQuestionTranslation(question._id!, translation._id, data);
        toast({ title: "Success", description: "Translation updated." });
      } else {
        await createDescriptiveQuestionTranslation(question._id!, data);
        toast({ title: "Success", description: "Translation added." });
      }
      setOpenTranslationForm(null);
      fetchQuestions();
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

  const handleDeleteTranslation = async (question: IDescriptiveQuestion, translation: IDescriptiveQuestionTranslation) => {
    try {
      startLoading();
      await deleteDescriptiveQuestionTranslation(question._id!, translation._id!);
      toast({ title: "Success", description: "Translation deleted." });
      fetchQuestions();
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
          <CardTitle>Descriptive Questions ({questions.length})</CardTitle>
          <Button size="sm" onClick={() => setOpenForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No descriptive questions found</p>
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <div key={question._id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{question.question}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{question.difficulty}</Badge>
                      <div className="flex items-center gap-1">
                        <Languages className="h-3 w-3" />
                        <span className="text-xs">{question.translations?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(question);
                        setOpenForm(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(question)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Question Answer */}
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Answer:</span> {question.answer}
                  </p>
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Translations */}
                {question.translations && question.translations.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-medium mb-2">Translations</h5>
                    <div className="space-y-2">
                      {question.translations.map((translation: IDescriptiveQuestionTranslation) => (
                        <div key={translation._id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {languages.find(l => l._id === translation.language_id)?.name || translation.language_id}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTranslation(question, translation)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-gray-600">{translation.question}</p>
                          <p className="text-gray-500 text-xs mt-1">{translation.answer}</p>
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
                    onClick={() => setOpenTranslationForm({ question })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Translation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question Form Modal */}
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Question" : "Create Question"} {entityName && `for ${entityName}`}
              </DialogTitle>
            </DialogHeader>
            <DescriptiveQuestionForm
              onSubmit={handleCreateOrUpdate}
              loading={isLoading}
              initialData={editing || undefined}
              entityType={entityType}
              entityId={entityId}
            />
          </DialogContent>
        </Dialog>

        {/* Question Translation Form Modal */}
        <Dialog open={!!openTranslationForm} onOpenChange={(open) => !open && setOpenTranslationForm(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Translation</DialogTitle>
            </DialogHeader>
            {openTranslationForm && (
              <DescriptiveQuestionTranslationForm
                onSubmit={handleTranslationSubmit}
                loading={isLoading}
                languages={languages}
                initialData={openTranslationForm.translation}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        {deleteTarget && (
          <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to delete this question? This action cannot be undone.</p>
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