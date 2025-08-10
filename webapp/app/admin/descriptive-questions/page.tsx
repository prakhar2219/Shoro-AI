"use client";

import React from "react";
import { useEffect, useState } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { useLoading } from "@/hooks/use-loading";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { DescriptiveQuestionForm } from "@/components/entity/DescriptiveQuestionForm";
import { DescriptiveQuestionTranslationForm } from "@/components/entity/DescriptiveQuestionTranslationForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Languages } from "lucide-react";
import { getLanguages } from "@/lib/api/entities/language";
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
import { ILanguage } from "@/lib/api/entities/language";

export default function DescriptiveQuestionsPage() {
  const [questions, setQuestions] = useState<IDescriptiveQuestion[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IDescriptiveQuestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IDescriptiveQuestion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Translation management
  const [openTranslationForm, setOpenTranslationForm] = useState<{
    question: IDescriptiveQuestion;
    translation?: IDescriptiveQuestionTranslation;
  } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{
    question: IDescriptiveQuestion;
    translation: IDescriptiveQuestionTranslation;
  } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoading();
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      startLoading();
      const result = await getDescriptiveQuestions({ page, limit, search: searchTerm });
      setQuestions(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      stopLoading();
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
    fetchLanguages();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [page, limit, searchTerm]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateDescriptiveQuestion(editing._id, data);
        toast({
          title: "Success",
          description: "Question updated successfully.",
        });
      } else {
        await createDescriptiveQuestion(data);
        toast({
          title: "Success",
          description: "Question created successfully.",
        });
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
        toast({
          title: "Success",
          description: "Question deleted successfully.",
        });
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

  // Translation management handlers
  const handleAddTranslation = async (question: IDescriptiveQuestion) => {
    setOpenTranslationForm({ question });
  };

  const handleEditTranslation = async (question: IDescriptiveQuestion, translation: IDescriptiveQuestionTranslation) => {
    setActiveTranslationAction(translation._id ?? null);
    setOpenTranslationForm({ question, translation });
    setTimeout(() => setActiveTranslationAction(null), 500);
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

  const handleDeleteTranslation = (question: IDescriptiveQuestion, translation: IDescriptiveQuestionTranslation) => {
    setActiveTranslationAction(translation._id ?? null);
    setDeleteTranslationTarget({ question, translation });
  };

  const confirmDeleteTranslation = async () => {
    if (!deleteTranslationTarget) return;
    const { question, translation } = deleteTranslationTarget;
    try {
      startLoading();
      await deleteDescriptiveQuestionTranslation(question._id!, translation._id!);
      toast({ title: "Success", description: "Translation deleted." });
      setDeleteTranslationTarget(null);
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete translation",
        variant: "destructive",
      });
    } finally {
      stopLoading();
      setActiveTranslationAction(null);
    }
  };

  const renderExpandedRow = (question: IDescriptiveQuestion) => {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Question Details</h4>
          <p className="text-sm text-gray-600 mb-2">{question.question}</p>
          <p className="text-sm text-gray-600 mb-2">{question.answer}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Translations</h4>
            <Button
              size="sm"
              onClick={() => handleAddTranslation(question)}
              disabled={!!activeTranslationAction}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Translation
            </Button>
          </div>
          {question.translations && question.translations.length > 0 ? (
            <div className="space-y-2">
              {question.translations.map((translation: IDescriptiveQuestionTranslation) => (
                <div key={translation._id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {languages.find(l => l._id === translation.language_id)?.name || translation.language_id}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTranslation(question, translation)}
                        disabled={!!activeTranslationAction}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTranslation(question, translation)}
                        disabled={!!activeTranslationAction}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{translation.question}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No translations yet</p>
          )}
        </div>
      </div>
    );
  };

  const columns: ColumnDef<IDescriptiveQuestion>[] = [
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue("question")}>
          {row.getValue("question")}
        </div>
      ),
    },
    {
      accessorKey: "entity_type",
      header: "Entity Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("entity_type")}</Badge>
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string;
        const variant = difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive';
        return <Badge variant={variant}>{difficulty}</Badge>;
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.getValue("tags") as string[]).slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {(row.getValue("tags") as string[]).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(row.getValue("tags") as string[]).length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "translations",
      header: "Translations",
      cell: ({ row }) => {
        const translations = row.getValue("translations") as any[];
        return (
          <div className="flex items-center gap-1">
            <Languages className="h-4 w-4" />
            <span className="text-sm">{translations?.length || 0}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(row.original);
              setOpenForm(true);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      {isLoading && <LoadingOverlay />}
      
      <PageTitleWithActions
        title="Descriptive Questions"
        onAddClick={() => setOpenForm(true)}
      />

      <div className="mt-6">
        <SearchBar
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mt-6">
        {questions.length === 0 ? (
          <EmptyState
            title="No questions found"
            message="Get started by creating your first descriptive question."
            action={
              <Button onClick={() => setOpenForm(true)}>
                Create Question
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={questions}
            renderExpandedRow={renderExpandedRow}
            page={page - 1}
            totalPages={totalPages}
            setPage={(newPage) => setPage(newPage + 1)}
          />
        )}
      </div>

      {/* Question Form Modal */}
      <EntityFormModal
        open={openForm}
        onOpenChange={setOpenForm}
        title={editing ? "Edit Question" : "Create Question"}
      >
        <DescriptiveQuestionForm
          onSubmit={handleCreateOrUpdate}
          loading={isLoading}
          initialData={editing || undefined}
        />
      </EntityFormModal>

      {/* Question Translation Form Modal */}
      <EntityFormModal
        open={!!openTranslationForm}
        onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        title={openTranslationForm?.translation ? "Edit Translation" : "Add Translation"}
      >
        {openTranslationForm && (
          <DescriptiveQuestionTranslationForm
            onSubmit={handleTranslationSubmit}
            loading={isLoading}
            initialData={openTranslationForm.translation}
            languages={languages}
          />
        )}
      </EntityFormModal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleDelete}
        // loading={isLoading}
      />

      {/* Delete Translation Confirmation */}
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        onCancel={() => setDeleteTranslationTarget(null)}
        title="Delete Translation"
        description="Are you sure you want to delete this translation? This action cannot be undone."
        onConfirm={confirmDeleteTranslation}
        // loading={isLoading}
      />
    </div>
  );
} 