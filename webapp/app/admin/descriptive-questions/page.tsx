"use client";

import React from "react";
import { useEffect, useState, useCallback } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { useLoading } from "@/hooks/use-loading";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DescriptiveQuestionForm } from "@/components/entity/DescriptiveQuestionForm";
import { DescriptiveQuestionTranslationForm } from "@/components/entity/DescriptiveQuestionTranslationForm";
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
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/utils/csv-utils";
import { bulkCreateDescriptiveQuestions } from "@/lib/api/entities/descriptiveQuestions";

export default function DescriptiveQuestionsPage() {
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IDescriptiveQuestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IDescriptiveQuestion | null>(null);

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
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchDescriptiveQuestionsData = useCallback(async (pageNum: number, size: number, search: string) => {
    try {
      console.log('Fetching Descriptive Questions with params:', { page: pageNum, limit: size, search });
      const result = await getDescriptiveQuestions({ page: pageNum, limit: size, search });
      console.log('Descriptive Question API response:', result);
      
      // Handle different response structures from the API
      if (result && typeof result === 'object') {
        // If it's a paginated response
        if (result.data && Array.isArray(result.data)) {
          console.log('Using paginated response structure');
          return {
            data: result.data,
            totalPages: result.totalPages || Math.ceil((result.total || 0) / size),
            total: result.total || 0,
          };
        }
        // If it's a direct array response
        if (Array.isArray(result)) {
          console.log('Using direct array response structure');
          return {
            data: result,
            totalPages: Math.ceil(result.length / size),
            total: result.length,
          };
        }
      }
      
      // Fallback for unexpected response structure
      console.warn('Unexpected Descriptive Question API response structure:', result);
      return {
        data: [],
        totalPages: 1,
        total: 0,
      };
    } catch (error: any) {
      console.error('Error fetching Descriptive Questions:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        data: [],
        totalPages: 1,
        total: 0,
      };
    }
  }, []);

  // Use the custom hook for common admin page functionality
  const {
    data: questions,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<IDescriptiveQuestion>({
    fetchData: fetchDescriptiveQuestionsData,
    pageSize: 10
  });

  const fetchLanguages = async () => {
    try {
      const languagesData = await getLanguages();
      setLanguages(languagesData);
    } catch (error: any) {
      console.error('Failed to fetch languages:', error);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateDescriptiveQuestion(editing._id, data);
      } else {
        await createDescriptiveQuestion(data);
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      console.error('Failed to save question:', error);
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        startLoading();
        await deleteDescriptiveQuestion(deleteTarget._id);
        setDeleteTarget(null);
        fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        console.error('Failed to delete question:', error);
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
      } else {
        await createDescriptiveQuestionTranslation(question._id!, data);
      }
      setOpenTranslationForm(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      console.error('Failed to save translation:', error);
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
      setDeleteTranslationTarget(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      console.error('Failed to delete translation:', error);
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

  // CSV schema for Descriptive Questions
const dqCsvSchema: CsvSchema = {
    title: "Upload Descriptive Questions CSV",
    description: "CSV columns: entity_type, entity_id, question, answer, difficulty(optional), tags(comma-separated), author(optional), source(optional), is_active(optional), content(HTML - optional)",
    fields: [
      { name: "entity_type", type: "text", required: true } as FieldSchema,
      { name: "entity_id", type: "text", required: true } as FieldSchema,
      { name: "supported_language_ids", type: "text", required: false } as FieldSchema,
      { name: "question", type: "text", required: true } as FieldSchema,
      { name: "answer", type: "text", required: true } as FieldSchema,
      { name: "difficulty", type: "text", required: false } as FieldSchema,
      { name: "tags", type: "text", required: false } as FieldSchema,
      { name: "author", type: "text", required: false } as FieldSchema,
      { name: "source", type: "text", required: false } as FieldSchema,
      { name: "is_active", type: "boolean", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
    ],
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      startLoading();
      const payload = rows.map((r: any) => {
        const content = r.content || undefined
        const is_active = String(r.is_active).toLowerCase() === 'true';
        const tags = typeof r.tags === 'string' && r.tags.trim() ? r.tags.split(',').map((t: string) => t.trim()) : [];
        return {
          entity_type: r.entity_type,
          entity_id: r.entity_id,
          supported_language_ids: r.supported_language_ids ? r.supported_language_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id) : [],
          question: r.question,
          answer: r.answer,
          difficulty: (r.difficulty || 'medium') as any,
          tags,
          author: r.author || undefined,
          source: r.source || undefined,
          is_active,
          content,
        };
      });
      const chunkSize = 500;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await bulkCreateDescriptiveQuestions(chunk);
      }
      toast({ title: 'Success', description: `${payload.length} questions uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to upload questions.', variant: 'destructive' });
    } finally {
      stopLoading();
    }
  };

  return (
    <AdminPageLayout
      title="Descriptive Questions"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search questions..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isLoading}
      data={questions}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No questions found"
      emptyStateMessage="Get started by creating your first descriptive question."
      emptyStateAction={
        <Button onClick={() => setOpenForm(true)}>
          Create Question
        </Button>
      }
    >
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
      />

      {/* Delete Translation Confirmation */}
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        onCancel={() => setDeleteTranslationTarget(null)}
        title="Delete Translation"
        description="Are you sure you want to delete this translation? This action cannot be undone."
        onConfirm={confirmDeleteTranslation}
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={dqCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />
    </AdminPageLayout>
  );
} 